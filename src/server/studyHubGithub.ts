import type Database from "better-sqlite3";
import { upsertSource } from "@/server/studyHubDb";

type Json = Record<string, unknown>;
type RepoTarget = { courseId: string; courseSlug: string; owner: string; repo: string; url: string };

const TEXT_EXTENSIONS = new Set([
  ".md", ".mdx", ".txt", ".rst", ".adoc", ".html", ".css", ".scss",
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".kt", ".go", ".rs",
  ".c", ".cc", ".cpp", ".h", ".hpp", ".cs", ".rb", ".php", ".swift",
  ".sql", ".sh", ".yaml", ".yml", ".json", ".toml", ".ini", ".csv",
]);

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
}

function parseRepository(urlValue: string) {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

function extension(filePath: string) {
  const index = filePath.lastIndexOf(".");
  return index < 0 ? "" : filePath.slice(index).toLowerCase();
}

function configuredTargets(db: Database.Database) {
  const raw = process.env.STUDY_HUB_GITHUB_REPOSITORIES_JSON?.trim();
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("STUDY_HUB_GITHUB_REPOSITORIES_JSON is invalid JSON"); }
  if (!Array.isArray(parsed)) throw new Error("STUDY_HUB_GITHUB_REPOSITORIES_JSON must be an array");
  const targets: RepoTarget[] = [];
  for (const item of parsed) {
    const value = asRecord(item);
    if (typeof value.courseSlug !== "string" || typeof value.url !== "string") continue;
    const course = db.prepare("SELECT id, slug FROM courses WHERE slug=?").get(value.courseSlug) as { id: string; slug: string } | undefined;
    const repo = parseRepository(value.url);
    if (course && repo) targets.push({ courseId: course.id, courseSlug: course.slug, ...repo });
  }
  return targets;
}

class GitHubClient {
  private token = process.env.GITHUB_READ_TOKEN?.trim();

  async json(pathname: string) {
    const response = await this.fetch(new URL(pathname, "https://api.github.com/").href, "application/vnd.github+json");
    return asRecord(await response.json());
  }

  async text(url: string) {
    const response = await this.fetch(url, "text/plain");
    return response.text();
  }

  private async fetch(urlValue: string, accept: string) {
    const url = new URL(urlValue);
    if (url.protocol !== "https:" || !["api.github.com", "raw.githubusercontent.com"].includes(url.hostname)) {
      throw new Error("GitHub request origin rejected");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const headers: Record<string, string> = { Accept: accept, "User-Agent": "namson-study-hub" };
      if (this.token) headers.Authorization = `Bearer ${this.token}`;
      const response = await fetch(url, { headers, signal: controller.signal });
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response;
    } finally { clearTimeout(timeout); }
  }
}

export async function syncGitHub(
  db: Database.Database,
  discoveredLinks: Array<{ courseId: string; courseSlug: string; url: string }> = [],
) {
  const targets: RepoTarget[] = [...configuredTargets(db)];
  for (const link of discoveredLinks) {
    const repo = parseRepository(link.url);
    if (repo) targets.push({ courseId: link.courseId, courseSlug: link.courseSlug, ...repo });
  }
  const deduped = [...new Map(targets.map((target) => [`${target.courseId}:${target.owner}/${target.repo}`.toLowerCase(), target])).values()]
    .slice(0, 25);
  const client = new GitHubClient();
  let seen = 0;
  let changed = 0;

  for (const target of deduped) {
    const repo = await client.json(`repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}`);
    const branch = typeof repo.default_branch === "string" ? repo.default_branch : "main";
    const tree = await client.json(
      `repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    );
    const treeItems = Array.isArray(tree.tree) ? tree.tree.map(asRecord) : [];
    const repoSource = upsertSource(db, {
      courseId: target.courseId, provider: "github", externalId: `course:${target.courseId}:repo:${target.owner}/${target.repo}`.toLowerCase(),
      kind: "repository", title: typeof repo.full_name === "string" ? repo.full_name : `${target.owner}/${target.repo}`,
      url: target.url,
      content: [typeof repo.description === "string" ? repo.description : "", `Default branch: ${branch}`,
        typeof tree.sha === "string" ? `Tree: ${tree.sha}` : ""].filter(Boolean).join("\n"),
      privacyClass: "public_reference", authorityRank: 30,
      metadata: { defaultBranch: branch, treeSha: tree.sha, private: repo.private === true },
    });
    seen++; if (repoSource.changed) changed++;

    const files = treeItems.filter((item) => item.type === "blob" && typeof item.path === "string"
      && typeof item.size === "number" && item.size <= 500_000
      && TEXT_EXTENSIONS.has(extension(item.path))).slice(0, 250);
    for (const item of files) {
      const filePath = String(item.path);
      const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/${encodeURIComponent(branch)}/${filePath.split("/").map(encodeURIComponent).join("/")}`;
      const content = await client.text(rawUrl);
      const source = upsertSource(db, {
        courseId: target.courseId, provider: "github",
        externalId: `course:${target.courseId}:repo:${target.owner}/${target.repo}:path:${filePath}`.toLowerCase(),
        kind: "repository-file", title: `${target.owner}/${target.repo} · ${filePath}`,
        url: `${target.url}/blob/${encodeURIComponent(branch)}/${filePath.split("/").map(encodeURIComponent).join("/")}`,
        content, privacyClass: "public_reference", authorityRank: 30,
        metadata: { branch, blobSha: item.sha, path: filePath },
      });
      seen++; if (source.changed) changed++;
    }
  }
  return { seen, changed, repositories: deduped.length };
}

export function hasConfiguredGithubRepositories() {
  const raw = process.env.STUDY_HUB_GITHUB_REPOSITORIES_JSON?.trim();
  if (!raw) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return true;
  }
}

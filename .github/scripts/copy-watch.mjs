// COPY WATCH (2026-10-12). Run daily by .github/workflows/copy-watch.yml.
// Snapshots this repo's forks, stargazers and (when the token may read
// them) traffic clones/views/referrers/paths, compares them with the
// previous snapshot, and opens or comments on ONE issue labelled
// `copy-watch`, assigned to the repo owner, when:
//   - a new fork appears;
//   - a new star appears;
//   - a day's unique cloners exceed max(20, 3 x rolling median + r x that
//     day's CI runs). Our own CI, Vercel and agent worktrees clone the repo
//     constantly (~400 unique per 14 days), and the count follows CI: on
//     2026-10-07, 35 CI runs gave 148 unique cloners against a median day
//     of ~25. So each CI run is allowed r extra cloners, r being the median
//     clones-per-run above the median day, measured from the same history;
//   - a new external referrer appears.
// No secrets: GITHUB_TOKEN only (TRAFFIC_TOKEN, if set, is used for the
// traffic endpoints alone). Node 20, no dependencies.
//
//   node copy-watch.mjs <previous-state.json|-> <new-state.json>
//   DRY_RUN=1 prints the alert instead of touching issues.

import fs from "node:fs";

const [, , prevPath, outPath] = process.argv;
const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const TRAFFIC_TOKEN = process.env.TRAFFIC_TOKEN || TOKEN;
const DRY = !!process.env.DRY_RUN;
const API = "https://api.github.com";
const LABEL = "copy-watch";
const CLONE_MULTIPLE = 3;
const CLONE_FLOOR = 20;
const HISTORY_DAYS = 28;
// Referrers that are not "external": GitHub itself and our own site.
const OWN_REFERRERS = new Set(["github.com", "namson.dev", "www.namson.dev"]);

if (!REPO || !TOKEN || !outPath) {
  console.error("need GITHUB_REPOSITORY, GITHUB_TOKEN and <prev> <out> arguments");
  process.exit(2);
}
const [OWNER] = REPO.split("/");

async function gh(path, { token = TOKEN, accept = "application/vnd.github+json", method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

async function paginate(path, opts, key) {
  const out = [];
  for (let page = 1; page <= 50; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await gh(`${path}${sep}per_page=100&page=${page}`, opts);
    const rows = key ? res[key] : res;
    out.push(...rows);
    if (rows.length < 100) break;
  }
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function readPrev() {
  if (!prevPath || prevPath === "-" || !fs.existsSync(prevPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(prevPath, "utf8"));
  } catch {
    return null;
  }
}

async function traffic() {
  const t = { available: true };
  const get = (p) => gh(`/repos/${REPO}/traffic/${p}`, { token: TRAFFIC_TOKEN });
  try {
    t.clones = await get("clones?per=day");
    t.views = await get("views?per=day");
    t.referrers = await get("popular/referrers");
    t.paths = await get("popular/paths");
  } catch (e) {
    // The traffic API needs push/administration access, which the
    // workflow's GITHUB_TOKEN may not carry. Forks and stars still work.
    return { available: false, error: String(e.message) };
  }
  return t;
}

const prev = readPrev();
const now = new Date().toISOString();

// Each source is read on its own: one the token may not read (the
// stargazers list answers 403 to the workflow's GITHUB_TOKEN) must never
// stop the others. Without the list, the repo's star COUNT still alerts.
async function safe(label, fn, fallback) {
  try { return await fn(); }
  catch (e) { console.log(`${label} unreadable with this token: ${e.message}`); return fallback; }
}
const forks = await safe("forks", async () => (await paginate(`/repos/${REPO}/forks?sort=newest`)).map((f) => ({
  full_name: f.full_name,
  html_url: f.html_url,
  created_at: f.created_at,
})), []);
const stars = await safe("stargazers", async () => (await paginate(`/repos/${REPO}/stargazers`, { accept: "application/vnd.github.star+json" })).map((s) => ({
  login: s.user?.login,
  html_url: s.user?.html_url,
  starred_at: s.starred_at,
})), null);
const repoInfo = await safe("repo", () => gh(`/repos/${REPO}`), {});
const starCount = repoInfo.stargazers_count ?? null;
const tr = await traffic();

// Daily unique-clone history: merge the API's 14-day window into what we
// kept, so the median can look back up to HISTORY_DAYS.
const cloneHistory = { ...(prev?.clone_history ?? {}) };
if (tr.available) for (const d of tr.clones.clones ?? []) cloneHistory[d.timestamp.slice(0, 10)] = d.uniques;
const keepFrom = new Date(Date.now() - HISTORY_DAYS * 864e5).toISOString().slice(0, 10);
for (const k of Object.keys(cloneHistory)) if (k < keepFrom) delete cloneHistory[k];

const knownReferrers = new Set(prev?.known_referrers ?? []);
const alertedCloneDays = new Set(prev?.alerted_clone_days ?? []);

const findings = [];
if (prev) {
  const oldForks = new Set((prev.forks ?? []).map((f) => f.full_name));
  for (const f of forks.filter((f) => !oldForks.has(f.full_name)))
    findings.push(`- **New fork:** [${f.full_name}](${f.html_url}) (created ${f.created_at})`);

  if (stars) {
    const oldStars = new Set((prev.stars ?? []).map((s) => s.login));
    for (const s of stars.filter((s) => !oldStars.has(s.login)))
      findings.push(`- **New star:** [${s.login}](${s.html_url}) (${s.starred_at})`);
  } else if (starCount != null && prev.star_count != null && starCount > prev.star_count) {
    findings.push(`- **New star(s):** the count went ${prev.star_count} -> ${starCount} (who is not readable with this token)`);
  }

  if (tr.available) {
    for (const r of tr.referrers ?? [])
      if (!OWN_REFERRERS.has(r.referrer) && !knownReferrers.has(r.referrer))
        findings.push(`- **New external referrer:** \`${r.referrer}\` (${r.count} views, ${r.uniques} unique, last 14 days)`);
  }
}

// CI runs per day over the same window: the explained part of a clone count.
const ciRuns = {};
try {
  const runs = await paginate(`/repos/${REPO}/actions/workflows/ci.yml/runs?created=%3E%3D${keepFrom}`, {}, "workflow_runs");
  for (const r of runs) ciRuns[r.created_at.slice(0, 10)] = (ciRuns[r.created_at.slice(0, 10)] ?? 0) + 1;
} catch (e) {
  console.log(`CI run count unavailable (${e.message}); clone threshold ignores CI`);
}

if (tr.available) {
  for (const [day, uniques] of Object.entries(cloneHistory).sort()) {
    const others = Object.entries(cloneHistory).filter(([d]) => d !== day);
    const base = median(others.map(([, u]) => u));
    const perRun = median(
      others.filter(([d]) => ciRuns[d]).map(([d, u]) => Math.max(0, (u - base) / ciRuns[d])),
    );
    const runs = ciRuns[day] ?? 0;
    const threshold = Math.round(Math.max(CLONE_FLOOR, CLONE_MULTIPLE * base + perRun * runs));
    // Needs a week of history before a median means anything.
    if (others.length >= 7 && uniques > threshold && !alertedCloneDays.has(day)) {
      findings.push(
        `- **Clone spike:** ${uniques} unique cloners on ${day} (rolling median ${base}, ${runs} CI runs x ${perRun.toFixed(1)}, threshold ${threshold})`,
      );
      alertedCloneDays.add(day);
    }
  }
  for (const r of tr.referrers ?? []) knownReferrers.add(r.referrer);
}

const state = {
  taken_at: now,
  repo: REPO,
  forks,
  stars,
  star_count: starCount,
  traffic: tr,
  clone_history: cloneHistory,
  known_referrers: [...knownReferrers].sort(),
  alerted_clone_days: [...alertedCloneDays].filter((d) => d >= keepFrom).sort(),
};
fs.writeFileSync(outPath, JSON.stringify(state, null, 2) + "\n");

// Baseline run: nothing to compare against. Say what is already there,
// once, if anything is, so existing forks/stars are not invisible.
if (!prev) {
  const others = (stars ?? []).filter((s) => s.login !== OWNER);
  if (forks.length || others.length) {
    findings.push("_First snapshot (baseline). Already present:_");
    for (const f of forks) findings.push(`- Fork: [${f.full_name}](${f.html_url}) (created ${f.created_at})`);
    for (const s of others) findings.push(`- Star: [${s.login}](${s.html_url}) (${s.starred_at})`);
  }
}

const summary = [
  `### Copy watch — ${now}`,
  `forks: ${forks.length} · stars: ${stars ? stars.length : `${starCount ?? "?"} (count only)`} · traffic: ${
    tr.available
      ? `clones ${tr.clones.count}/${tr.clones.uniques} unique, views ${tr.views.count}/${tr.views.uniques} unique (14 d)`
      : `unavailable (${tr.error})`
  }`,
  prev ? `previous snapshot: ${prev.taken_at}` : "no previous snapshot: this run is the baseline",
  "",
  findings.length ? findings.join("\n") : "Nothing new.",
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");

if (!findings.length || DRY) process.exit(0);

const body = [
  `Copy watch run at ${now} found:`,
  "",
  ...findings,
  "",
  tr.available
    ? `Traffic (14 d): ${tr.clones.uniques} unique cloners, ${tr.views.uniques} unique visitors. Top paths: ${(tr.paths ?? [])
        .slice(0, 5)
        .map((p) => `\`${p.path}\` (${p.uniques})`)
        .join(", ") || "none"}.`
    : `Traffic not readable with this token (${tr.error}).`,
  "",
  `Run: ${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`,
].join("\n");

const open = await gh(`/repos/${REPO}/issues?state=open&labels=${LABEL}&per_page=10`);
if (open.length) {
  await gh(`/repos/${REPO}/issues/${open[0].number}/comments`, { method: "POST", body: { body } });
  console.log(`commented on #${open[0].number}`);
} else {
  const issue = await gh(`/repos/${REPO}/issues`, {
    method: "POST",
    body: { title: "Copy watch: someone forked, starred or cloned namson-dev", body, labels: [LABEL], assignees: [OWNER] },
  });
  console.log(`opened #${issue.number}`);
}

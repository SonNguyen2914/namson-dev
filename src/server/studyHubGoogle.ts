import type Database from "better-sqlite3";
import {
  getCourseRow,
  listCanvasAssetsToArchive,
  listCourseKnowledge,
  saveDriveAsset,
  setCourseDriveIds,
} from "@/server/studyHubDb";
import { downloadCanvasAsset } from "@/server/studyHubCanvas";

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
}

function configuration() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim() || null;
  const enabled = process.env.GOOGLE_DRIVE_SYNC_ENABLED === "true";
  return enabled && clientId && clientSecret && refreshToken
    ? { clientId, clientSecret, refreshToken, rootFolderId }
    : null;
}

export function isGoogleDriveConfigured() {
  return Boolean(configuration());
}

class GoogleClient {
  private accessToken: string | null = null;
  constructor(private config: NonNullable<ReturnType<typeof configuration>>) {}

  private async token() {
    if (this.accessToken) return this.accessToken;
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId, client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken, grant_type: "refresh_token",
      }),
    });
    const payload = asRecord(await response.json());
    if (!response.ok || typeof payload.access_token !== "string") throw new Error(`Google OAuth returned ${response.status}`);
    this.accessToken = payload.access_token;
    return this.accessToken;
  }

  async request(url: string, init: RequestInit = {}) {
    const target = new URL(url);
    if (target.protocol !== "https:" || !["www.googleapis.com", "docs.googleapis.com"].includes(target.hostname)) {
      throw new Error("Google API request origin rejected");
    }
    const response = await fetch(target, {
      ...init,
      headers: { Authorization: `Bearer ${await this.token()}`, "Content-Type": "application/json", ...init.headers },
    });
    if (!response.ok) throw new Error(`Google API returned ${response.status}`);
    if (response.status === 204) return {};
    return asRecord(await response.json());
  }

  async createFile(body: Json) {
    return this.request("https://www.googleapis.com/drive/v3/files?fields=id,webViewLink", {
      method: "POST", body: JSON.stringify(body),
    });
  }

  async uploadFile(options: {
    fileId: string | null;
    folderId: string;
    filename: string;
    contentType: string;
    bytes: Buffer;
    sourceId: string;
  }) {
    const boundary = `study-hub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const metadata = {
      name: options.filename,
      ...(options.fileId ? {} : { parents: [options.folderId] }),
      appProperties: { studyHubSourceId: options.sourceId, studyHubType: "canvas-archive" },
    };
    const prefix = Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${options.contentType}\r\n\r\n`,
    );
    const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([prefix, options.bytes, suffix]);
    const target = options.fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(options.fileId)}?uploadType=multipart&fields=id`
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
    return this.request(target, {
      method: options.fileId ? "PATCH" : "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as unknown as BodyInit,
    });
  }
}

function buildKnowledgeDocument(
  course: NonNullable<ReturnType<typeof getCourseRow>>,
  sources: ReturnType<typeof listCourseKnowledge>,
) {
  const sections = sources.map((source) => {
    const header = `## ${source.title}\nType: ${source.kind}\nUpdated: ${source.updated_at}${source.canonical_url ? `\nSource: ${source.canonical_url}` : ""}`;
    return `${header}\n\n${source.content.slice(0, 20_000)}`;
  });
  return [
    `# ${course.title} — Study Hub knowledge feed`,
    `Generated: ${new Date().toISOString()}`,
    "This document is generated from permitted official course and public reference sources. Student discussion content is excluded. Cite and verify the original source before acting.",
    ...sections,
  ].join("\n\n").slice(0, 1_500_000);
}

async function replaceDocument(client: GoogleClient, documentId: string, content: string) {
  const document = await client.request(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`);
  const body = asRecord(document.body);
  const blocks = Array.isArray(body.content) ? body.content.map(asRecord) : [];
  const last = blocks.at(-1);
  const endIndex = typeof last?.endIndex === "number" ? last.endIndex : 1;
  const requests: Json[] = [];
  if (endIndex > 2) requests.push({ deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } } });
  requests.push({ insertText: { location: { index: 1 }, text: content } });
  await client.request(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`, {
    method: "POST", body: JSON.stringify({ requests }),
  });
}

export async function syncGoogleDrive(db: Database.Database) {
  const config = configuration();
  if (!config) throw new Error("Google Drive sync is not configured or enabled");
  const client = new GoogleClient(config);
  const connector = db.prepare("SELECT cursor_json FROM connectors WHERE id='google-drive'").get() as { cursor_json: string } | undefined;
  let connectorState: Record<string, unknown> = {};
  try { connectorState = asRecord(JSON.parse(connector?.cursor_json ?? "{}")); } catch { connectorState = {}; }
  let rootFolderId = config.rootFolderId || (typeof connectorState.rootFolderId === "string" ? connectorState.rootFolderId : null);
  if (!rootFolderId) {
    const root = await client.createFile({
      name: "Study Hub", mimeType: "application/vnd.google-apps.folder",
      appProperties: { studyHubType: "root-folder" },
    });
    if (typeof root.id !== "string") throw new Error("Google Drive did not return a root folder ID");
    rootFolderId = root.id;
    connectorState.rootFolderId = rootFolderId;
    db.prepare("UPDATE connectors SET cursor_json=? WHERE id='google-drive'").run(JSON.stringify(connectorState));
  }
  const courses = db.prepare("SELECT slug FROM courses ORDER BY title").all() as Array<{ slug: string }>;
  let seen = 0;
  let changed = 0;
  for (const item of courses) {
    const course = getCourseRow(db, item.slug);
    if (!course) continue;
    let folderId = course.drive_folder_id;
    let docId = course.living_doc_id;
    if (!folderId) {
      const folder = await client.createFile({
        name: course.title, mimeType: "application/vnd.google-apps.folder",
        parents: [rootFolderId], appProperties: { studyHubCourseSlug: course.slug, studyHubType: "course-folder" },
      });
      if (typeof folder.id !== "string") throw new Error("Google Drive did not return a folder ID");
      folderId = folder.id;
      changed++;
    }
    if (!docId) {
      const doc = await client.createFile({
        name: `${course.title} — Study Hub knowledge feed`, mimeType: "application/vnd.google-apps.document",
        parents: [folderId], appProperties: { studyHubCourseSlug: course.slug, studyHubType: "knowledge-feed" },
      });
      if (typeof doc.id !== "string") throw new Error("Google Drive did not return a document ID");
      docId = doc.id;
      changed++;
    }
    const content = buildKnowledgeDocument(course, listCourseKnowledge(db, course.id));
    await replaceDocument(client, docId, content);
    setCourseDriveIds(db, course.slug, folderId, docId);
    seen++;

    for (const asset of listCanvasAssetsToArchive(db, course.id)) {
      const downloaded = await downloadCanvasAsset(asset.downloadUrl, asset.size);
      const uploaded = await client.uploadFile({
        fileId: asset.driveFileId,
        folderId,
        filename: asset.filename,
        contentType: asset.contentType || downloaded.contentType,
        bytes: downloaded.bytes,
        sourceId: asset.sourceId,
      });
      if (typeof uploaded.id !== "string") throw new Error("Google Drive did not return an archived file ID");
      saveDriveAsset(db, asset.sourceId, uploaded.id, asset.sourceHash);
      seen++;
      changed++;
    }
  }
  return { seen, changed };
}

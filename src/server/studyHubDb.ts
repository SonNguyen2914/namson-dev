import { createHash, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type {
  RetrievedStudySource,
  StudyHubConnector,
  StudyHubCourseData,
  StudyHubDashboardData,
  StudyHubEvent,
  StudyHubSource,
} from "@/lib/studyHubData";
import type { StudyCourse, StudyHubManifest } from "@/lib/studyHubManifest";

const CONNECTORS = [
  ["canvas", "Canvas"],
  ["github", "GitHub"],
  ["google-drive", "Google Drive"],
  ["discord", "Discord"],
] as const;

let sharedDatabase: Database.Database | null = null;
let sharedPath: string | null = null;

function now() {
  return new Date().toISOString();
}

function stableId(...parts: string[]) {
  return createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 32);
}

function contentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function configuredStudyHubDatabasePath() {
  const configured = process.env.STUDY_HUB_DATABASE_PATH?.trim();
  if (!configured) return null;
  if (configured === ":memory:") return configured;
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function initializeDatabase(db: Database.Database) {
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  if (db.name !== ":memory:") db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      semester TEXT NOT NULL,
      canvas_course_id TEXT UNIQUE,
      canvas_course_code TEXT,
      notebook_url TEXT,
      drive_url TEXT,
      drive_folder_id TEXT,
      living_doc_id TEXT,
      notes_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id),
      provider TEXT NOT NULL,
      external_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      canonical_url TEXT,
      content TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      privacy_class TEXT NOT NULL DEFAULT 'course_material',
      authority_rank INTEGER NOT NULL DEFAULT 50,
      discovered_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      removed_at TEXT,
      UNIQUE(provider, external_id)
    );
    CREATE INDEX IF NOT EXISTS sources_course_updated
      ON sources(course_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS source_versions (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL REFERENCES sources(id),
      content_hash TEXT NOT NULL,
      content TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      UNIQUE(source_id, content_hash)
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS source_search USING fts5(
      source_id UNINDEXED,
      course_id UNINDEXED,
      title,
      content,
      tokenize='porter unicode61'
    );
    CREATE TABLE IF NOT EXISTS academic_events (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id),
      source_id TEXT REFERENCES sources(id),
      provider TEXT NOT NULL,
      external_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      starts_at TEXT,
      due_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      url TEXT,
      authority_rank INTEGER NOT NULL DEFAULT 50,
      first_seen_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      removed_at TEXT,
      UNIQUE(provider, external_id)
    );
    CREATE INDEX IF NOT EXISTS events_due
      ON academic_events(due_at, course_id);
    CREATE TABLE IF NOT EXISTS connectors (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      last_started_at TEXT,
      last_success_at TEXT,
      last_error TEXT,
      cursor_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      connector TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      state TEXT NOT NULL,
      items_seen INTEGER NOT NULL DEFAULT 0,
      items_changed INTEGER NOT NULL DEFAULT 0,
      error TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      detail_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS drive_assets (
      source_id TEXT PRIMARY KEY REFERENCES sources(id),
      drive_file_id TEXT NOT NULL,
      source_hash TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS worker_locks (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  const ensureColumn = (table: string, column: string, definition: string) => {
    const columns = db.pragma(`table_info(${table})`) as Array<{ name: string }>;
    if (!columns.some((candidate) => candidate.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  };
  ensureColumn("sources", "removed_at", "TEXT");
  ensureColumn("academic_events", "last_seen_at", "TEXT");
  ensureColumn("academic_events", "removed_at", "TEXT");
  db.prepare("UPDATE academic_events SET last_seen_at=updated_at WHERE last_seen_at IS NULL").run();

  const insertConnector = db.prepare(
    "INSERT OR IGNORE INTO connectors(id, state) VALUES (?, 'unconfigured')",
  );
  const seed = db.transaction(() => {
    for (const [id] of CONNECTORS) insertConnector.run(id);
  });
  seed();
}

export function getStudyHubDatabase() {
  const databasePath = configuredStudyHubDatabasePath();
  if (!databasePath) return null;
  if (sharedDatabase && sharedPath === databasePath) return sharedDatabase;
  if (sharedDatabase) sharedDatabase.close();
  if (databasePath !== ":memory:") mkdirSync(path.dirname(databasePath), { recursive: true });
  sharedDatabase = new Database(databasePath);
  sharedPath = databasePath;
  initializeDatabase(sharedDatabase);
  return sharedDatabase;
}

export function closeStudyHubDatabase() {
  sharedDatabase?.close();
  sharedDatabase = null;
  sharedPath = null;
}

export function ensureManifestCourses(db: Database.Database, manifest: StudyHubManifest) {
  const statement = db.prepare(`
    INSERT INTO courses(
      id, slug, title, semester, notebook_url, drive_url, notes_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title=excluded.title,
      semester=excluded.semester,
      notebook_url=excluded.notebook_url,
      drive_url=excluded.drive_url,
      notes_path=excluded.notes_path,
      updated_at=excluded.updated_at
  `);
  const timestamp = now();
  db.transaction(() => {
    for (const course of manifest.courses) {
      statement.run(
        stableId("course", course.slug), course.slug, course.title, course.semester,
        course.notebookLmUrl, course.googleDriveUrl, course.notesPath, timestamp, timestamp,
      );
    }
  })();
}

export function findOrCreateCanvasCourse(
  db: Database.Database,
  canvas: { id: string; name: string; courseCode: string; semester: string },
) {
  const exact = db.prepare("SELECT * FROM courses WHERE canvas_course_id = ?").get(canvas.id) as CourseRow | undefined;
  if (exact) return exact;
  const code = canvas.courseCode.match(/[A-Za-z]{2,5}[ -]?\d{3,4}/)?.[0]
    ?.replace(/([A-Za-z])(?=\d)/, "$1 ").toLowerCase();
  const candidates = db.prepare("SELECT * FROM courses").all() as CourseRow[];
  const matched = code && candidates.find((course) =>
    `${course.title} ${course.slug}`.toLowerCase().includes(code),
  );
  if (matched) {
    db.prepare(`UPDATE courses SET canvas_course_id=?, canvas_course_code=?, updated_at=? WHERE id=?`)
      .run(canvas.id, canvas.courseCode, now(), matched.id);
    return { ...matched, canvas_course_id: canvas.id, canvas_course_code: canvas.courseCode };
  }
  const baseSlug = (canvas.courseCode || canvas.name)
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `canvas-${canvas.id}`;
  let slug = baseSlug;
  let suffix = 2;
  while (db.prepare("SELECT 1 FROM courses WHERE slug=?").get(slug)) slug = `${baseSlug}-${suffix++}`;
  const timestamp = now();
  const id = stableId("canvas-course", canvas.id);
  db.prepare(`
    INSERT INTO courses(id, slug, title, semester, canvas_course_id, canvas_course_code, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, slug, canvas.name, canvas.semester, canvas.id, canvas.courseCode, timestamp, timestamp);
  return db.prepare("SELECT * FROM courses WHERE id=?").get(id) as CourseRow;
}

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  semester: string;
  canvas_course_id: string | null;
  canvas_course_code: string | null;
};

export type SourceInput = {
  courseId: string;
  provider: string;
  externalId: string;
  kind: string;
  title: string;
  url?: string | null;
  content: string;
  privacyClass?: "course_material" | "student_discussion" | "public_reference";
  authorityRank?: number;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

export function upsertSource(db: Database.Database, input: SourceInput) {
  const existing = db.prepare(
    "SELECT id, content_hash, course_id, title, canonical_url, removed_at FROM sources WHERE provider=? AND external_id=?",
  ).get(input.provider, input.externalId) as {
    id: string; content_hash: string; course_id: string; title: string; canonical_url: string | null; removed_at: string | null;
  } | undefined;
  const hash = contentHash(input.content);
  const changed = !existing || existing.content_hash !== hash || existing.course_id !== input.courseId
    || existing.title !== input.title || existing.canonical_url !== (input.url ?? null) || existing.removed_at !== null;
  const id = existing?.id ?? stableId("source", input.provider, input.externalId);
  const timestamp = now();
  const sourceUpdatedAt = input.updatedAt ?? timestamp;
  const metadata = JSON.stringify(input.metadata ?? {});
  db.transaction(() => {
    db.prepare(`
      INSERT INTO sources(
        id, course_id, provider, external_id, kind, title, canonical_url, content,
        content_hash, privacy_class, authority_rank, discovered_at, updated_at,
        last_seen_at, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(provider, external_id) DO UPDATE SET
        course_id=excluded.course_id, kind=excluded.kind, title=excluded.title,
        canonical_url=excluded.canonical_url, content=excluded.content,
        content_hash=excluded.content_hash, privacy_class=excluded.privacy_class,
        authority_rank=excluded.authority_rank, updated_at=excluded.updated_at,
        last_seen_at=excluded.last_seen_at, metadata_json=excluded.metadata_json,
        removed_at=NULL
    `).run(
      id, input.courseId, input.provider, input.externalId, input.kind, input.title,
      input.url ?? null, input.content, hash, input.privacyClass ?? "course_material",
      input.authorityRank ?? 50, timestamp, sourceUpdatedAt, timestamp, metadata,
    );
    if (changed) {
      db.prepare(`
        INSERT OR IGNORE INTO source_versions(id, source_id, content_hash, content, captured_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(stableId("version", id, hash), id, hash, input.content, timestamp);
      db.prepare("DELETE FROM source_search WHERE source_id=?").run(id);
      db.prepare("INSERT INTO source_search(source_id, course_id, title, content) VALUES (?, ?, ?, ?)")
        .run(id, input.courseId, input.title, input.content);
      db.prepare(`INSERT INTO audit_log(action, target_type, target_id, detail_json, created_at)
        VALUES ('source.changed', 'source', ?, ?, ?)`)
        .run(id, JSON.stringify({ provider: input.provider, title: input.title }), timestamp);
    }
  })();
  return { id, changed };
}

export type EventInput = {
  courseId: string;
  sourceId?: string | null;
  provider: string;
  externalId: string;
  kind: string;
  title: string;
  description?: string | null;
  startsAt?: string | null;
  dueAt?: string | null;
  status?: string;
  url?: string | null;
  authorityRank?: number;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

export function upsertAcademicEvent(db: Database.Database, input: EventInput) {
  const existing = db.prepare(
    "SELECT id, course_id, kind, title, description, starts_at, due_at, status, url FROM academic_events WHERE provider=? AND external_id=?",
  ).get(input.provider, input.externalId) as Record<string, unknown> | undefined;
  const id = typeof existing?.id === "string"
    ? existing.id : stableId("event", input.provider, input.externalId);
  const timestamp = now();
  const comparable = {
    course_id: input.courseId,
    kind: input.kind,
    title: input.title,
    description: input.description ?? null,
    starts_at: input.startsAt ?? null,
    due_at: input.dueAt ?? null,
    status: input.status ?? "active",
    url: input.url ?? null,
  };
  const changed = !existing || Object.entries(comparable).some(([key, value]) => existing[key] !== value);
  db.transaction(() => {
    db.prepare(`
      INSERT INTO academic_events(
        id, course_id, source_id, provider, external_id, kind, title, description,
        starts_at, due_at, status, url, authority_rank, first_seen_at, updated_at,
        last_seen_at, metadata_json, removed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(provider, external_id) DO UPDATE SET
        course_id=excluded.course_id, source_id=excluded.source_id, kind=excluded.kind,
        title=excluded.title, description=excluded.description, starts_at=excluded.starts_at,
        due_at=excluded.due_at, status=excluded.status, url=excluded.url,
        authority_rank=excluded.authority_rank, updated_at=excluded.updated_at,
        last_seen_at=excluded.last_seen_at, metadata_json=excluded.metadata_json,
        removed_at=NULL
    `).run(
      id, input.courseId, input.sourceId ?? null, input.provider, input.externalId,
      input.kind, input.title, input.description ?? null, input.startsAt ?? null,
      input.dueAt ?? null, input.status ?? "active", input.url ?? null,
      input.authorityRank ?? 50, timestamp, input.updatedAt ?? timestamp, timestamp,
      JSON.stringify(input.metadata ?? {}),
    );
    if (changed) db.prepare(`INSERT INTO audit_log(action, target_type, target_id, detail_json, created_at)
      VALUES ('event.changed', 'event', ?, ?, ?)`)
      .run(id, JSON.stringify({ provider: input.provider, title: input.title }), timestamp);
  })();
  return { id, changed };
}

export function startConnectorRun(db: Database.Database, connector: string) {
  const timestamp = now();
  db.prepare(`UPDATE connectors SET state='running', last_started_at=?, last_error=NULL WHERE id=?`)
    .run(timestamp, connector);
  return Number(db.prepare(`INSERT INTO sync_runs(connector, started_at, state) VALUES (?, ?, 'running')`)
    .run(connector, timestamp).lastInsertRowid);
}

export function finishConnectorRun(
  db: Database.Database,
  runId: number,
  connector: string,
  result: { state: "healthy" | "error" | "unconfigured"; seen?: number; changed?: number; error?: string },
) {
  const timestamp = now();
  const safeError = result.error?.slice(0, 500) ?? null;
  db.prepare(`UPDATE sync_runs SET completed_at=?, state=?, items_seen=?, items_changed=?, error=? WHERE id=?`)
    .run(timestamp, result.state, result.seen ?? 0, result.changed ?? 0, safeError, runId);
  db.prepare(`UPDATE connectors SET state=?, last_success_at=CASE WHEN ?='healthy' THEN ? ELSE last_success_at END,
    last_error=? WHERE id=?`).run(result.state, result.state, timestamp, safeError, connector);
}

function mapEvent(row: Record<string, unknown>): StudyHubEvent {
  return {
    id: String(row.id), courseSlug: String(row.course_slug), courseTitle: String(row.course_title),
    kind: String(row.kind), title: String(row.title),
    description: typeof row.description === "string" ? row.description : null,
    dueAt: typeof row.due_at === "string" ? row.due_at : null,
    startsAt: typeof row.starts_at === "string" ? row.starts_at : null,
    status: String(row.status), url: typeof row.url === "string" ? row.url : null,
    provider: String(row.provider), updatedAt: String(row.updated_at),
  };
}

function mapSource(row: Record<string, unknown>): StudyHubSource {
  return {
    id: String(row.id), courseSlug: String(row.course_slug), courseTitle: String(row.course_title),
    kind: String(row.kind), title: String(row.title),
    url: typeof row.canonical_url === "string" ? row.canonical_url : null,
    provider: String(row.provider), privacyClass: String(row.privacy_class),
    updatedAt: String(row.updated_at),
  };
}

const EVENT_SELECT = `SELECT e.*, c.slug AS course_slug, c.title AS course_title
  FROM academic_events e JOIN courses c ON c.id=e.course_id`;
const SOURCE_SELECT = `SELECT s.*, c.slug AS course_slug, c.title AS course_title
  FROM sources s JOIN courses c ON c.id=s.course_id`;

export function getStudyHubDashboardData(db: Database.Database | null): StudyHubDashboardData {
  if (!db) return { databaseConfigured: false, sourceCount: 0, eventCount: 0, upcoming: [], recentSources: [], connectors: [] };
  const counts = db.prepare(`SELECT (SELECT count(*) FROM sources WHERE removed_at IS NULL) source_count,
    (SELECT count(*) FROM academic_events WHERE removed_at IS NULL) event_count`).get() as { source_count: number; event_count: number };
  const upcoming = db.prepare(`${EVENT_SELECT} WHERE e.status='active' AND e.removed_at IS NULL AND e.due_at IS NOT NULL
    AND e.due_at >= ? ORDER BY e.due_at LIMIT 12`).all(new Date(Date.now() - 86_400_000).toISOString()).map((row) => mapEvent(row as Record<string, unknown>));
  const recentSources = db.prepare(`${SOURCE_SELECT} WHERE s.removed_at IS NULL ORDER BY s.updated_at DESC LIMIT 12`).all()
    .map((row) => mapSource(row as Record<string, unknown>));
  const connectorRows = db.prepare("SELECT * FROM connectors").all() as Array<Record<string, unknown>>;
  const connectors: StudyHubConnector[] = CONNECTORS.map(([id, label]) => {
    const row = connectorRows.find((candidate) => candidate.id === id);
    return {
      id, label, state: (row?.state ?? "unconfigured") as StudyHubConnector["state"],
      lastStartedAt: typeof row?.last_started_at === "string" ? row.last_started_at : null,
      lastSuccessAt: typeof row?.last_success_at === "string" ? row.last_success_at : null,
      lastError: typeof row?.last_error === "string" ? row.last_error : null,
    };
  });
  return { databaseConfigured: true, sourceCount: counts.source_count, eventCount: counts.event_count, upcoming, recentSources, connectors };
}

export function getStudyHubCourseData(db: Database.Database | null, slug: string): StudyHubCourseData {
  if (!db) return { sourceCount: 0, upcoming: [], recentSources: [] };
  const course = db.prepare("SELECT id FROM courses WHERE slug=?").get(slug) as { id: string } | undefined;
  if (!course) return { sourceCount: 0, upcoming: [], recentSources: [] };
  const sourceCount = (db.prepare("SELECT count(*) count FROM sources WHERE course_id=? AND removed_at IS NULL").get(course.id) as { count: number }).count;
  const upcoming = db.prepare(`${EVENT_SELECT} WHERE e.course_id=? AND e.status='active' AND e.removed_at IS NULL AND e.due_at IS NOT NULL
    ORDER BY e.due_at LIMIT 10`).all(course.id).map((row) => mapEvent(row as Record<string, unknown>));
  const recentSources = db.prepare(`${SOURCE_SELECT} WHERE s.course_id=? AND s.removed_at IS NULL ORDER BY s.updated_at DESC LIMIT 12`)
    .all(course.id).map((row) => mapSource(row as Record<string, unknown>));
  return { sourceCount, upcoming, recentSources };
}

function searchExpression(prompt: string) {
  const words = [...new Set(prompt.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])].slice(0, 12);
  return words.map((word) => `"${word.replaceAll('"', '""')}"`).join(" OR ");
}

export function retrieveStudySources(
  db: Database.Database | null,
  courseSlug: string,
  prompt: string,
  limit = 8,
): RetrievedStudySource[] {
  if (!db) return [];
  const course = db.prepare("SELECT id FROM courses WHERE slug=?").get(courseSlug) as { id: string } | undefined;
  if (!course) return [];
  const expression = searchExpression(prompt);
  const discussionFilter = process.env.STUDY_HUB_INCLUDE_STUDENT_DISCUSSIONS_IN_AI === "true"
    ? "" : "AND s.privacy_class!='student_discussion'";
  const rows = expression
    ? db.prepare(`SELECT s.* FROM source_search f JOIN sources s ON s.id=f.source_id
        WHERE f.course_id=? AND s.removed_at IS NULL ${discussionFilter} AND source_search MATCH ? ORDER BY bm25(source_search) LIMIT ?`)
      .all(course.id, expression, limit)
    : db.prepare(`SELECT * FROM sources s WHERE course_id=? AND s.removed_at IS NULL ${discussionFilter} ORDER BY updated_at DESC LIMIT ?`).all(course.id, limit);
  return rows.map((raw, index) => {
    const row = raw as Record<string, unknown>;
    return {
      id: String(row.id), citation: `S${index + 1}`, title: String(row.title),
      url: typeof row.canonical_url === "string" ? row.canonical_url : null,
      provider: String(row.provider), content: String(row.content).slice(0, 6_000),
    };
  });
}

export function getCourseRow(db: Database.Database, slug: string) {
  return db.prepare("SELECT * FROM courses WHERE slug=?").get(slug) as (CourseRow & {
    notebook_url: string | null; drive_url: string | null; drive_folder_id: string | null;
    living_doc_id: string | null; notes_path: string | null;
  }) | undefined;
}

export function setCourseDriveIds(db: Database.Database, slug: string, folderId: string, docId: string) {
  db.prepare("UPDATE courses SET drive_folder_id=?, living_doc_id=?, updated_at=? WHERE slug=?")
    .run(folderId, docId, now(), slug);
}

export function listCourseKnowledge(db: Database.Database, courseId: string) {
  return db.prepare(`SELECT title, kind, canonical_url, content, updated_at FROM sources
    WHERE course_id=? AND removed_at IS NULL AND privacy_class!='student_discussion' ORDER BY authority_rank, updated_at DESC`)
    .all(courseId) as Array<{ title: string; kind: string; canonical_url: string | null; content: string; updated_at: string }>;
}

export type CanvasAssetToArchive = {
  sourceId: string;
  sourceHash: string;
  courseId: string;
  courseSlug: string;
  filename: string;
  contentType: string;
  size: number | null;
  downloadUrl: string;
  driveFileId: string | null;
};

export function listCanvasAssetsToArchive(db: Database.Database, courseId: string): CanvasAssetToArchive[] {
  const rows = db.prepare(`
    SELECT s.id AS source_id, s.content_hash, s.course_id, c.slug,
      s.title, s.metadata_json, a.drive_file_id, a.source_hash AS archived_hash
    FROM sources s JOIN courses c ON c.id=s.course_id
    LEFT JOIN drive_assets a ON a.source_id=s.id
    WHERE s.course_id=? AND s.provider='canvas' AND s.kind='file' AND s.removed_at IS NULL
      AND s.privacy_class!='student_discussion'
      AND (a.source_hash IS NULL OR a.source_hash!=s.content_hash)
    ORDER BY s.updated_at
  `).all(courseId) as Array<Record<string, unknown>>;
  return rows.flatMap((row) => {
    let metadata: Record<string, unknown> = {};
    try { metadata = JSON.parse(String(row.metadata_json)) as Record<string, unknown>; } catch { return []; }
    if (typeof metadata.downloadUrl !== "string") return [];
    return [{
      sourceId: String(row.source_id), sourceHash: String(row.content_hash), courseId: String(row.course_id),
      courseSlug: String(row.slug), filename: typeof metadata.filename === "string" ? metadata.filename : String(row.title),
      contentType: typeof metadata.contentType === "string" ? metadata.contentType : "application/octet-stream",
      size: typeof metadata.size === "number" ? metadata.size : null,
      downloadUrl: metadata.downloadUrl,
      driveFileId: typeof row.drive_file_id === "string" ? row.drive_file_id : null,
    }];
  });
}

export function saveDriveAsset(db: Database.Database, sourceId: string, driveFileId: string, sourceHash: string) {
  db.prepare(`INSERT INTO drive_assets(source_id, drive_file_id, source_hash, uploaded_at)
    VALUES (?, ?, ?, ?) ON CONFLICT(source_id) DO UPDATE SET
      drive_file_id=excluded.drive_file_id, source_hash=excluded.source_hash, uploaded_at=excluded.uploaded_at`)
    .run(sourceId, driveFileId, sourceHash, now());
}

export function acquireStudyHubSyncLock(db: Database.Database, leaseMinutes = 120) {
  const owner = `${process.pid}:${randomUUID()}`;
  const timestamp = now();
  const expiresAt = new Date(Date.now() + leaseMinutes * 60_000).toISOString();
  const acquired = db.transaction(() => {
    const current = db.prepare("SELECT owner, expires_at FROM worker_locks WHERE id='sync'").get() as
      | { owner: string; expires_at: string }
      | undefined;
    if (current) {
      const pid = Number(current.owner.split(":", 1)[0]);
      let alive = Number.isInteger(pid) && pid > 0;
      if (alive) {
        try { process.kill(pid, 0); } catch (error) {
          alive = error instanceof Error && "code" in error && error.code === "EPERM";
        }
      }
      if (!alive || current.expires_at <= timestamp) db.prepare("DELETE FROM worker_locks WHERE id='sync'").run();
    }
    return db.prepare("INSERT OR IGNORE INTO worker_locks(id, owner, expires_at) VALUES ('sync', ?, ?)")
      .run(owner, expiresAt).changes === 1;
  })();
  return acquired ? owner : null;
}

export function releaseStudyHubSyncLock(db: Database.Database, owner: string) {
  db.prepare("DELETE FROM worker_locks WHERE id='sync' AND owner=?").run(owner);
}

export function markMissingCanvasRecords(
  db: Database.Database,
  courseId: string,
  canvasCourseId: string,
  seenSince: string,
) {
  const timestamp = now();
  return db.transaction(() => {
    const sources = db.prepare(`UPDATE sources SET removed_at=?
      WHERE course_id=? AND provider='canvas' AND removed_at IS NULL AND last_seen_at<?
      AND kind IN ('syllabus','module','assignment','page','announcement','discussion','file')`)
      .run(timestamp, courseId, seenSince).changes;
    const patternPrefix = `course:${canvasCourseId}:`;
    const events = db.prepare(`UPDATE academic_events SET removed_at=?, status='removed'
      WHERE course_id=? AND provider='canvas' AND removed_at IS NULL AND last_seen_at<?
      AND (external_id LIKE ? OR external_id LIKE ? OR external_id LIKE ?)`)
      .run(timestamp, courseId, seenSince, `${patternPrefix}assignment:%`, `${patternPrefix}announcement:%`, `${patternPrefix}module-item:%`).changes;
    if (sources + events > 0) {
      db.prepare(`INSERT INTO audit_log(action, target_type, target_id, detail_json, created_at)
        VALUES ('canvas.records-missing', 'course', ?, ?, ?)`)
        .run(courseId, JSON.stringify({ sources, events }), timestamp);
    }
    return { sources, events };
  })();
}

export function studyCourseFromRow(row: ReturnType<typeof getCourseRow>): StudyCourse | null {
  if (!row?.notebook_url || !row.notes_path) return null;
  return {
    slug: row.slug, title: row.title, semester: row.semester,
    notebookLmUrl: row.notebook_url as `https://${string}`,
    googleDriveUrl: row.drive_url as `https://${string}` | null,
    notesPath: row.notes_path,
  };
}

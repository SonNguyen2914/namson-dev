import { expect, test } from "@playwright/test";
import {
  createStudyHubSession,
  getStudyHubAuthConfiguration,
  isStudyHubSessionValid,
  STUDY_HUB_SESSION_COOKIE,
} from "../src/server/studyHubAuth";
import { consumeStudyHubRateLimit } from "../src/server/studyHubRateLimit";
import {
  assertValidStudyHubManifest,
  loadStudyHubManifest,
  type StudyCourse,
  type StudyHubManifest,
} from "../src/lib/studyHubManifest";
import {
  getStudyPromptProvider,
  getStudyPromptProviderStatus,
} from "../src/server/studyHubProvider";
import {
  closeStudyHubDatabase,
  ensureManifestCourses,
  getStudyHubDashboardData,
  getStudyHubDatabase,
  markMissingCanvasRecords,
  retrieveStudySources,
  upsertAcademicEvent,
  upsertSource,
} from "../src/server/studyHubDb";
import { extractSafeExternalLinks, htmlToText, syncCanvas } from "../src/server/studyHubCanvas";
import { syncGitHub } from "../src/server/studyHubGithub";
import { quizletCardsFromAnswer } from "../src/pages/api/study-hub/quizlet";

const ORIGINAL_PASSWORD = process.env.STUDY_HUB_ACCESS_PASSWORD;
const ORIGINAL_SECRET = process.env.STUDY_HUB_SESSION_SECRET;
const ORIGINAL_COURSES = process.env.STUDY_HUB_COURSES_JSON;
const AI_ENVIRONMENT = [
  "STUDY_HUB_AI_PROVIDER",
  "STUDY_HUB_AI_BASE_URL",
  "STUDY_HUB_AI_MODEL",
  "STUDY_HUB_AI_API_KEY",
] as const;
const ORIGINAL_AI_ENVIRONMENT = Object.fromEntries(
  AI_ENVIRONMENT.map((name) => [name, process.env[name]]),
);
const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_DATABASE = process.env.STUDY_HUB_DATABASE_PATH;
const CONNECTOR_ENVIRONMENT = [
  "CANVAS_BASE_URL", "CANVAS_ACCESS_TOKEN", "CANVAS_COURSE_IDS",
  "GITHUB_READ_TOKEN", "STUDY_HUB_GITHUB_REPOSITORIES_JSON",
  "STUDY_HUB_INCLUDE_STUDENT_DISCUSSIONS_IN_AI",
] as const;
const ORIGINAL_CONNECTOR_ENVIRONMENT = Object.fromEntries(
  CONNECTOR_ENVIRONMENT.map((name) => [name, process.env[name]]),
);

test.afterEach(() => {
  if (ORIGINAL_PASSWORD === undefined) {
    delete process.env.STUDY_HUB_ACCESS_PASSWORD;
  } else {
    process.env.STUDY_HUB_ACCESS_PASSWORD = ORIGINAL_PASSWORD;
  }
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.STUDY_HUB_SESSION_SECRET;
  } else {
    process.env.STUDY_HUB_SESSION_SECRET = ORIGINAL_SECRET;
  }
  if (ORIGINAL_COURSES === undefined) {
    delete process.env.STUDY_HUB_COURSES_JSON;
  } else {
    process.env.STUDY_HUB_COURSES_JSON = ORIGINAL_COURSES;
  }
  for (const name of AI_ENVIRONMENT) {
    const original = ORIGINAL_AI_ENVIRONMENT[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
  global.fetch = ORIGINAL_FETCH;
  closeStudyHubDatabase();
  if (ORIGINAL_DATABASE === undefined) delete process.env.STUDY_HUB_DATABASE_PATH;
  else process.env.STUDY_HUB_DATABASE_PATH = ORIGINAL_DATABASE;
  for (const name of CONNECTOR_ENVIRONMENT) {
    const original = ORIGINAL_CONNECTOR_ENVIRONMENT[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("Study Hub auth fails closed without sufficiently strong configuration", () => {
  process.env.STUDY_HUB_ACCESS_PASSWORD = "short";
  process.env.STUDY_HUB_SESSION_SECRET = "also-short";

  expect(getStudyHubAuthConfiguration().configured).toBe(false);
  expect(createStudyHubSession("short")).toBeNull();
});

test("Study Hub sessions are signed, expire, and reject tampering", () => {
  process.env.STUDY_HUB_ACCESS_PASSWORD = "e2e-access-phrase";
  process.env.STUDY_HUB_SESSION_SECRET =
    "e2e-session-secret-that-is-at-least-32-characters";
  const now = Date.UTC(2026, 8, 2, 12);

  expect(createStudyHubSession("incorrect", now)).toBeNull();
  const session = createStudyHubSession("e2e-access-phrase", now);
  expect(session).not.toBeNull();

  const cookie = `${STUDY_HUB_SESSION_COOKIE}=${encodeURIComponent(session!)}`;
  expect(isStudyHubSessionValid(cookie, now + 1_000)).toBe(true);
  expect(isStudyHubSessionValid(`${cookie}x`, now + 1_000)).toBe(false);
  expect(isStudyHubSessionValid(cookie, now + 12 * 60 * 60_000)).toBe(false);
});

test("Study Hub request limits stop excess attempts", () => {
  const key = `test:${Date.now()}:${Math.random()}`;
  expect(consumeStudyHubRateLimit(key, 2, 60_000)).toBe(true);
  expect(consumeStudyHubRateLimit(key, 2, 60_000)).toBe(true);
  expect(consumeStudyHubRateLimit(key, 2, 60_000)).toBe(false);
});

test("Study Hub manifest accepts only validated resource boundaries", () => {
  const valid: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "test-course",
      title: "Test course",
      semester: "Fall 2026",
      googleDriveUrl: "https://drive.google.com/drive/folders/test",
      notebookLmUrl: "https://notebook.google.com/notebook/test",
      notesPath: "fall-2026/test-course",
    }],
  };
  expect(() => assertValidStudyHubManifest(valid)).not.toThrow();
  expect(() => assertValidStudyHubManifest({
    ...valid,
    courses: [{ ...valid.courses[0], googleDriveUrl: null }],
  })).not.toThrow();

  expect(() => assertValidStudyHubManifest({
    ...valid,
    courses: [{
      ...valid.courses[0],
      googleDriveUrl: "https://example.com/private-materials",
    }],
  })).toThrow(/Google Drive/);

  expect(() => assertValidStudyHubManifest({
    ...valid,
    courses: [{ ...valid.courses[0], notesPath: "../outside" }],
  })).toThrow(/notes path/);
});

test("Study Hub loads private course links only from the server environment", () => {
  const configured: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "notebook-only-course",
      title: "Notebook-only course",
      semester: "Fall 2026",
      googleDriveUrl: null,
      notebookLmUrl: "https://notebook.google.com/notebook/test",
      notesPath: "fall-2026/notebook-only-course",
    }],
  };
  process.env.STUDY_HUB_COURSES_JSON = JSON.stringify(configured);
  expect(loadStudyHubManifest()).toEqual(configured);

  process.env.STUDY_HUB_COURSES_JSON = "not-json";
  expect(() => loadStudyHubManifest()).toThrow(/not valid JSON/);
});

test("Study Hub prompt adapter keeps provider details on the server boundary", async () => {
  process.env.STUDY_HUB_AI_PROVIDER = "openai-compatible";
  process.env.STUDY_HUB_AI_BASE_URL = "https://provider.test/v1";
  process.env.STUDY_HUB_AI_MODEL = "test-model";
  process.env.STUDY_HUB_AI_API_KEY = "test-api-key";

  let requestAuthorization = "";
  let requestBody = "";
  global.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers);
    requestAuthorization = headers.get("Authorization") ?? "";
    requestBody = String(init?.body ?? "");
    return new Response(JSON.stringify({
      choices: [{ message: { content: "A draft explanation." } }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const course: StudyCourse = {
    slug: "test-course",
    title: "Test course",
    semester: "Fall 2026",
    googleDriveUrl: "https://drive.google.com/drive/folders/test",
    notebookLmUrl: "https://notebooklm.google.com/notebook/test",
    notesPath: "fall-2026/test-course",
  };
  expect(getStudyPromptProviderStatus()).toEqual({
    configured: true,
    provider: "openai-compatible",
  });
  const result = await getStudyPromptProvider()!.complete(
    course,
    "Explain the concept.",
  );

  expect(result).toEqual({
    answer: "A draft explanation.",
    provider: "openai-compatible",
    citations: [],
  });
  expect(requestAuthorization).toBe("Bearer test-api-key");
  expect(requestBody).toContain("No indexed course sources matched");
  expect(requestBody).not.toContain(course.googleDriveUrl!);
  expect(requestBody).not.toContain(course.notebookLmUrl);
});

test("Study Hub stores versions, deadlines, health data, and grounded retrieval", () => {
  process.env.STUDY_HUB_DATABASE_PATH = ":memory:";
  const db = getStudyHubDatabase()!;
  const manifest: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "database-course", title: "CS 9999 Database Course", semester: "Fall 2026",
      googleDriveUrl: null, notebookLmUrl: "https://notebook.google.com/notebook/test",
      notesPath: "fall-2026/database-course",
    }],
  };
  ensureManifestCourses(db, manifest);
  const course = db.prepare("SELECT id FROM courses WHERE slug=?").get("database-course") as { id: string };
  const source = upsertSource(db, {
    courseId: course.id, provider: "canvas", externalId: "assignment:42", kind: "assignment",
    title: "Graph traversal", content: "Breadth-first search uses a queue.", url: "https://canvas.test/assignments/42",
  });
  expect(source.changed).toBe(true);
  expect(upsertSource(db, {
    courseId: course.id, provider: "canvas", externalId: "assignment:42", kind: "assignment",
    title: "Graph traversal", content: "Breadth-first search uses a queue.", url: "https://canvas.test/assignments/42",
  }).changed).toBe(false);
  upsertAcademicEvent(db, {
    courseId: course.id, sourceId: source.id, provider: "canvas", externalId: "assignment:42",
    kind: "assignment", title: "Graph traversal", dueAt: "2099-09-08T23:59:00.000Z",
  });
  expect(retrieveStudySources(db, "database-course", "Which search uses a queue?")[0]).toMatchObject({
    citation: "S1", title: "Graph traversal", provider: "canvas",
  });
  const dashboard = getStudyHubDashboardData(db);
  expect(dashboard).toMatchObject({ databaseConfigured: true, sourceCount: 1, eventCount: 1 });
  expect(dashboard.upcoming[0].title).toBe("Graph traversal");
  const missing = markMissingCanvasRecords(
    db, course.id, "999", new Date(Date.now() + 1_000).toISOString(),
  );
  expect(missing.sources).toBe(1);
  expect(getStudyHubDashboardData(db).sourceCount).toBe(0);
  expect(upsertSource(db, {
    courseId: course.id, provider: "canvas", externalId: "assignment:42", kind: "assignment",
    title: "Graph traversal", content: "Breadth-first search uses a queue.", url: "https://canvas.test/assignments/42",
  }).changed).toBe(true);
  expect((db.prepare("SELECT count(*) count FROM source_versions").get() as { count: number }).count).toBe(1);
});

test("Canvas content extraction drops executable markup and keeps only safe external links", () => {
  const html = `<h1>Week 1</h1><script>steal()</script><p>Read&nbsp;this.</p>
    <a href="https://github.com/example/course">Notes</a><a href="javascript:bad()">bad</a><a href="/relative">Canvas</a>`;
  expect(htmlToText(html)).toContain("Week 1Read this.");
  expect(htmlToText(html)).not.toContain("steal");
  expect(extractSafeExternalLinks(html)).toEqual(["https://github.com/example/course"]);
});

test("student discussion stays out of external AI retrieval until explicitly enabled", () => {
  process.env.STUDY_HUB_DATABASE_PATH = ":memory:";
  process.env.STUDY_HUB_INCLUDE_STUDENT_DISCUSSIONS_IN_AI = "false";
  const db = getStudyHubDatabase()!;
  const manifest: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "private-discussion", title: "Private Discussion", semester: "Fall 2026", googleDriveUrl: null,
      notebookLmUrl: "https://notebook.google.com/notebook/test", notesPath: "fall-2026/private-discussion",
    }],
  };
  ensureManifestCourses(db, manifest);
  const course = db.prepare("SELECT id FROM courses WHERE slug='private-discussion'").get() as { id: string };
  upsertSource(db, {
    courseId: course.id, provider: "discord", externalId: "message:1", kind: "student-message",
    title: "Discussion", content: "A student-only mnemonic", privacyClass: "student_discussion",
  });
  expect(retrieveStudySources(db, "private-discussion", "student mnemonic")).toEqual([]);
  process.env.STUDY_HUB_INCLUDE_STUDENT_DISCUSSIONS_IN_AI = "true";
  expect(retrieveStudySources(db, "private-discussion", "student mnemonic")).toHaveLength(1);
});

test("Quizlet export accepts only structured cards and removes import delimiters", () => {
  expect(quizletCardsFromAnswer(
    '```json\n{"cards":[{"term":"Queue\\nrule","definition":"FIFO\\torder"},{"term":"","definition":"skip"}]}\n```',
    20,
  )).toEqual([{ term: "Queue rule", definition: "FIFO order" }]);
  expect(quizletCardsFromAnswer("not json", 20)).toEqual([]);
});

test("Canvas sync ingests permitted course material without write requests", async () => {
  process.env.STUDY_HUB_DATABASE_PATH = ":memory:";
  process.env.CANVAS_BASE_URL = "https://canvas.test/";
  process.env.CANVAS_ACCESS_TOKEN = "read-only-test-token";
  const db = getStudyHubDatabase()!;
  const manifest: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "canvas-course", title: "CS 9998 Canvas Course", semester: "Fall 2026",
      googleDriveUrl: null, notebookLmUrl: "https://notebook.google.com/notebook/test",
      notesPath: "fall-2026/canvas-course",
    }],
  };
  ensureManifestCourses(db, manifest);
  const methods: string[] = [];
  global.fetch = async (input, init) => {
    methods.push(init?.method ?? "GET");
    const url = new URL(input instanceof Request ? input.url : String(input));
    const payload = url.pathname === "/api/v1/courses"
      ? [{ id: 998, name: "CS 9998 Canvas Course", course_code: "CS 9998", syllabus_body: '<p>Read the <a href="https://github.com/example/course">course repository</a>.</p>', term: { name: "Fall 2026" } }]
      : [];
    return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const result = await syncCanvas(db);
  expect(result).toMatchObject({ courses: 1, seen: 1, changed: 1 });
  expect(result.externalLinks).toEqual([expect.objectContaining({ url: "https://github.com/example/course" })]);
  expect(methods.every((method) => method === "GET")).toBe(true);
  expect(retrieveStudySources(db, "canvas-course", "course repository")[0].title).toContain("syllabus");
});

test("GitHub sync reads bounded repository text without executing it", async () => {
  process.env.STUDY_HUB_DATABASE_PATH = ":memory:";
  const db = getStudyHubDatabase()!;
  const manifest: StudyHubManifest = {
    semester: "Fall 2026",
    courses: [{
      slug: "github-course", title: "GitHub Course", semester: "Fall 2026", googleDriveUrl: null,
      notebookLmUrl: "https://notebook.google.com/notebook/test", notesPath: "fall-2026/github-course",
    }],
  };
  ensureManifestCourses(db, manifest);
  process.env.STUDY_HUB_GITHUB_REPOSITORIES_JSON = JSON.stringify([
    { courseSlug: "github-course", url: "https://github.com/example/course" },
  ]);
  global.fetch = async (input, init) => {
    expect(init?.method ?? "GET").toBe("GET");
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.hostname === "raw.githubusercontent.com") return new Response("# Week one\nNever execute this file.", { status: 200 });
    const payload = url.pathname.includes("/git/trees/")
      ? { sha: "tree-sha", tree: [{ type: "blob", path: "notes/week-1.md", size: 40, sha: "blob-sha" }] }
      : { full_name: "example/course", default_branch: "main", description: "Course notes", private: false };
    return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const result = await syncGitHub(db);
  expect(result).toEqual({ seen: 2, changed: 2, repositories: 1 });
  expect(retrieveStudySources(db, "github-course", "week execute").some((source) => source.title.includes("week-1.md"))).toBe(true);
});

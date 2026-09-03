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
  type StudyCourse,
  type StudyHubManifest,
} from "../src/lib/studyHubManifest";
import {
  getStudyPromptProvider,
  getStudyPromptProviderStatus,
} from "../src/server/studyHubProvider";

const ORIGINAL_PASSWORD = process.env.STUDY_HUB_ACCESS_PASSWORD;
const ORIGINAL_SECRET = process.env.STUDY_HUB_SESSION_SECRET;
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
  for (const name of AI_ENVIRONMENT) {
    const original = ORIGINAL_AI_ENVIRONMENT[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
  global.fetch = ORIGINAL_FETCH;
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
      notebookLmUrl: "https://notebooklm.google.com/notebook/test",
      notesPath: "fall-2026/test-course",
    }],
  };
  expect(() => assertValidStudyHubManifest(valid)).not.toThrow();

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
  });
  expect(requestAuthorization).toBe("Bearer test-api-key");
  expect(requestBody).toContain("You do not have access");
  expect(requestBody).not.toContain(course.googleDriveUrl);
  expect(requestBody).not.toContain(course.notebookLmUrl);
});

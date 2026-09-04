/**
 * Server-owned navigation manifest for the Study Hub.
 *
 * Keep source material outside Git in NotebookLM and, optionally, Google
 * Drive. Curated notes belong in the private study-hub-notes repository.
 * Private course links are parsed from a server-side environment value;
 * never add them to this public repository.
 */
export type StudyCourse = Readonly<{
  slug: string;
  title: string;
  semester: string;
  googleDriveUrl: `https://${string}` | null;
  notebookLmUrl: `https://${string}`;
  notesPath: string;
}>;

export type StudyHubManifest = Readonly<{
  semester: string;
  courses: readonly StudyCourse[];
}>;

const EMPTY_STUDY_HUB_MANIFEST: StudyHubManifest = {
  semester: "Fall 2026",
  courses: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExpectedHost(value: string, hosts: string[], field: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Study Hub manifest has an invalid ${field} URL`);
  }
  if (url.protocol !== "https:" || !hosts.includes(url.hostname)) {
    throw new Error(`Study Hub manifest has an invalid ${field} URL`);
  }
}

export function assertValidStudyHubManifest(manifest: StudyHubManifest) {
  const slugs = new Set<string>();

  for (const course of manifest.courses) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.slug)) {
      throw new Error("Study Hub manifest has an invalid course slug");
    }
    if (slugs.has(course.slug)) {
      throw new Error("Study Hub manifest has a duplicate course slug");
    }
    slugs.add(course.slug);

    if (!course.title.trim() || course.semester !== manifest.semester) {
      throw new Error("Study Hub manifest has invalid course metadata");
    }
    if (course.googleDriveUrl !== null) {
      assertExpectedHost(
        course.googleDriveUrl,
        ["drive.google.com", "docs.google.com"],
        "Google Drive",
      );
    }
    assertExpectedHost(
      course.notebookLmUrl,
      ["notebook.google.com", "notebooklm.google.com"],
      "NotebookLM",
    );
    if (
      course.notesPath.startsWith("/") ||
      course.notesPath
        .split("/")
        .some((part) => !part || part === "." || part === "..")
    ) {
      throw new Error("Study Hub manifest has an invalid notes path");
    }
  }
}

export function loadStudyHubManifest(): StudyHubManifest {
  const raw = process.env.STUDY_HUB_COURSES_JSON;
  if (!raw) return EMPTY_STUDY_HUB_MANIFEST;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("STUDY_HUB_COURSES_JSON is not valid JSON");
  }
  if (
    !isRecord(parsed) ||
    typeof parsed.semester !== "string" ||
    !Array.isArray(parsed.courses)
  ) {
    throw new Error("STUDY_HUB_COURSES_JSON has an invalid manifest shape");
  }

  const courses: StudyCourse[] = parsed.courses.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.slug !== "string" ||
      typeof value.title !== "string" ||
      typeof value.semester !== "string" ||
      (typeof value.googleDriveUrl !== "string" &&
        value.googleDriveUrl !== null) ||
      typeof value.notebookLmUrl !== "string" ||
      typeof value.notesPath !== "string"
    ) {
      throw new Error("STUDY_HUB_COURSES_JSON has an invalid course shape");
    }
    return {
      slug: value.slug,
      title: value.title,
      semester: value.semester,
      googleDriveUrl: value.googleDriveUrl as `https://${string}` | null,
      notebookLmUrl: value.notebookLmUrl as `https://${string}`,
      notesPath: value.notesPath,
    };
  });

  const manifest: StudyHubManifest = {
    semester: parsed.semester,
    courses,
  };
  assertValidStudyHubManifest(manifest);
  return manifest;
}

/**
 * Server-owned navigation manifest for the Study Hub.
 *
 * Keep source material in Google Drive and curated notes in the private
 * study-hub-notes repository. This module is loaded by getServerSideProps;
 * never add credentials, access tokens, or raw course material here.
 */
export type StudyCourse = Readonly<{
  slug: string;
  title: string;
  semester: string;
  googleDriveUrl: `https://${string}`;
  notebookLmUrl: `https://${string}`;
  notesPath: string;
}>;

export type StudyHubManifest = Readonly<{
  semester: string;
  courses: readonly StudyCourse[];
}>;

export const studyHubManifest: StudyHubManifest = {
  semester: "Fall 2026",
  // Add courses only after the schedule and links are confirmed.
  courses: [],
};

function assertExpectedHost(value: string, hosts: string[], field: string) {
  const url = new URL(value);
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
    assertExpectedHost(
      course.googleDriveUrl,
      ["drive.google.com", "docs.google.com"],
      "Google Drive",
    );
    assertExpectedHost(
      course.notebookLmUrl,
      ["notebooklm.google.com"],
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

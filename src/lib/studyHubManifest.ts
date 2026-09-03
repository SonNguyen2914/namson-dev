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

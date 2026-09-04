import { loadStudyHubManifest } from "@/lib/studyHubManifest";
import { isCanvasConfigured, syncCanvas } from "@/server/studyHubCanvas";
import {
  ensureManifestCourses,
  finishConnectorRun,
  getStudyHubDatabase,
  acquireStudyHubSyncLock,
  releaseStudyHubSyncLock,
  startConnectorRun,
} from "@/server/studyHubDb";
import { hasConfiguredGithubRepositories, syncGitHub } from "@/server/studyHubGithub";
import { isGoogleDriveConfigured, syncGoogleDrive } from "@/server/studyHubGoogle";
import { isDiscordConfigured, syncDiscord } from "@/server/studyHubDiscord";

export type StudyHubSyncSummary = {
  startedAt: string;
  completedAt: string;
  ok: boolean;
  connectors: Array<{
    connector: string;
    state: "healthy" | "error" | "unconfigured";
    seen: number;
    changed: number;
    error?: string;
  }>;
};

function safeError(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") return "Request timed out";
  return error instanceof Error ? error.message.slice(0, 500) : "Unknown connector error";
}

export async function runStudyHubSync(): Promise<StudyHubSyncSummary> {
  const startedAt = new Date().toISOString();
  const db = getStudyHubDatabase();
  if (!db) throw new Error("STUDY_HUB_DATABASE_PATH is not configured");
  const lockOwner = acquireStudyHubSyncLock(db);
  if (!lockOwner) throw new Error("A Study Hub sync is already running");
  try {
  ensureManifestCourses(db, loadStudyHubManifest());
  const connectors: StudyHubSyncSummary["connectors"] = [];
  let canvasLinks: Array<{ courseId: string; courseSlug: string; url: string }> = [];

  const canvasRun = startConnectorRun(db, "canvas");
  if (!isCanvasConfigured()) {
    const result = { connector: "canvas", state: "unconfigured" as const, seen: 0, changed: 0 };
    finishConnectorRun(db, canvasRun, "canvas", result);
    connectors.push(result);
  } else {
    try {
      const synced = await syncCanvas(db);
      canvasLinks = synced.externalLinks;
      const result = { connector: "canvas", state: "healthy" as const, seen: synced.seen, changed: synced.changed };
      finishConnectorRun(db, canvasRun, "canvas", result);
      connectors.push(result);
    } catch (error) {
      const result = { connector: "canvas", state: "error" as const, seen: 0, changed: 0, error: safeError(error) };
      finishConnectorRun(db, canvasRun, "canvas", result);
      connectors.push(result);
    }
  }

  const githubRun = startConnectorRun(db, "github");
  const githubReady = canvasLinks.some((link) => {
    try { return new URL(link.url).hostname === "github.com"; } catch { return false; }
  }) || hasConfiguredGithubRepositories();
  if (!githubReady) {
    const result = { connector: "github", state: "unconfigured" as const, seen: 0, changed: 0 };
    finishConnectorRun(db, githubRun, "github", result);
    connectors.push(result);
  } else {
    try {
      const synced = await syncGitHub(db, canvasLinks);
      const result = { connector: "github", state: "healthy" as const, seen: synced.seen, changed: synced.changed };
      finishConnectorRun(db, githubRun, "github", result);
      connectors.push(result);
    } catch (error) {
      const result = { connector: "github", state: "error" as const, seen: 0, changed: 0, error: safeError(error) };
      finishConnectorRun(db, githubRun, "github", result);
      connectors.push(result);
    }
  }

  const driveRun = startConnectorRun(db, "google-drive");
  if (!isGoogleDriveConfigured()) {
    const result = { connector: "google-drive", state: "unconfigured" as const, seen: 0, changed: 0 };
    finishConnectorRun(db, driveRun, "google-drive", result);
    connectors.push(result);
  } else {
    try {
      const synced = await syncGoogleDrive(db);
      const result = { connector: "google-drive", state: "healthy" as const, ...synced };
      finishConnectorRun(db, driveRun, "google-drive", result);
      connectors.push(result);
    } catch (error) {
      const result = { connector: "google-drive", state: "error" as const, seen: 0, changed: 0, error: safeError(error) };
      finishConnectorRun(db, driveRun, "google-drive", result);
      connectors.push(result);
    }
  }

  const discordRun = startConnectorRun(db, "discord");
  if (!isDiscordConfigured()) {
    const result = { connector: "discord", state: "unconfigured" as const, seen: 0, changed: 0 };
    finishConnectorRun(db, discordRun, "discord", result);
    connectors.push(result);
  } else {
    try {
      const synced = await syncDiscord(db);
      const result = { connector: "discord", state: "healthy" as const, seen: synced.seen, changed: synced.changed };
      finishConnectorRun(db, discordRun, "discord", result);
      connectors.push(result);
    } catch (error) {
      const result = { connector: "discord", state: "error" as const, seen: 0, changed: 0, error: safeError(error) };
      finishConnectorRun(db, discordRun, "discord", result);
      connectors.push(result);
    }
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    ok: connectors.every((connector) => connector.state !== "error"),
    connectors,
  };
  } finally {
    releaseStudyHubSyncLock(db, lockOwner);
  }
}

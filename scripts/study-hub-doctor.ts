import { existsSync } from "node:fs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const checks = [
  ["Access gate", Boolean(process.env.STUDY_HUB_ACCESS_PASSWORD && process.env.STUDY_HUB_SESSION_SECRET)],
  ["Database", Boolean(process.env.STUDY_HUB_DATABASE_PATH)],
  ["Canvas", Boolean(process.env.CANVAS_BASE_URL && process.env.CANVAS_ACCESS_TOKEN)],
  ["GitHub token (optional)", Boolean(process.env.GITHUB_READ_TOKEN)],
  ["Google Drive write switch", process.env.GOOGLE_DRIVE_SYNC_ENABLED === "true"],
  ["Google OAuth", Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN)],
  ["Discord bot", Boolean(process.env.DISCORD_BOT_TOKEN && process.env.STUDY_HUB_DISCORD_CHANNELS_JSON && process.env.STUDY_HUB_DISCORD_CHANNELS_JSON !== "[]")],
  ["AI provider", Boolean(process.env.STUDY_HUB_AI_PROVIDER && process.env.STUDY_HUB_AI_BASE_URL && process.env.STUDY_HUB_AI_MODEL && process.env.STUDY_HUB_AI_API_KEY)],
] as const;

async function main() {
  const { configuredStudyHubDatabasePath, ensureManifestCourses, getStudyHubDatabase } = await import("../src/server/studyHubDb");
  const { loadStudyHubManifest } = await import("../src/lib/studyHubManifest");
  for (const [label, configured] of checks) console.log(`${configured ? "ready" : "pending"}  ${label}`);
  const db = getStudyHubDatabase();
  if (db) {
    ensureManifestCourses(db, loadStudyHubManifest());
    const databasePath = configuredStudyHubDatabasePath();
    console.log(`ready  SQLite initialized${databasePath && databasePath !== ":memory:" ? ` (${existsSync(databasePath) ? "existing" : "new"})` : ""}`);
  } else {
    console.log("pending  SQLite path is not configured");
  }
}

void main();

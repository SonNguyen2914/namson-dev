import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { configuredStudyHubDatabasePath, getStudyHubDatabase } from "@/server/studyHubDb";

export async function backupStudyHubDatabase() {
  const db = getStudyHubDatabase();
  const databasePath = configuredStudyHubDatabasePath();
  if (!db || !databasePath || databasePath === ":memory:") return { created: false, reason: "database is not file-backed" };
  const backupDirectory = path.resolve(path.dirname(databasePath), "backups");
  mkdirSync(backupDirectory, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const target = path.join(backupDirectory, `study-hub-${date}.sqlite`);
  if (existsSync(target)) return { created: false, reason: "today's backup already exists" };
  await db.backup(target);
  return { created: true, reason: "daily backup created" };
}

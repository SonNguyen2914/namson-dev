import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const configuredInterval = Number(process.env.STUDY_HUB_SYNC_INTERVAL_MINUTES || 15);
const intervalMinutes = Number.isFinite(configuredInterval) ? Math.max(5, configuredInterval) : 15;
let stopping = false;

const stop = () => { stopping = true; };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function main() {
  const { runStudyHubSync } = await import("../src/server/studyHubSync");
  const { backupStudyHubDatabase } = await import("../src/server/studyHubBackup");
  console.log(`Study Hub worker started; sync interval ${intervalMinutes} minutes`);
  while (!stopping) {
    try {
      const summary = await runStudyHubSync();
      const changed = summary.connectors.reduce((total, connector) => total + connector.changed, 0);
      console.log(`${summary.completedAt} sync ${summary.ok ? "complete" : "completed with errors"}; ${changed} changes`);
      const backup = await backupStudyHubDatabase();
      if (backup.created) console.log(`${new Date().toISOString()} ${backup.reason}`);
    } catch (error) {
      console.error(`${new Date().toISOString()} ${error instanceof Error ? error.message : "sync failed"}`);
    }
    if (stopping) break;
    await new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(timeout);
        process.off("SIGINT", finish);
        process.off("SIGTERM", finish);
        resolve();
      };
      const timeout = setTimeout(finish, intervalMinutes * 60_000);
      process.once("SIGINT", finish);
      process.once("SIGTERM", finish);
    });
  }
  console.log("Study Hub worker stopped");
}

void main();

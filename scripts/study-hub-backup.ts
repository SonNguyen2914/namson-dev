import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { backupStudyHubDatabase } = await import("../src/server/studyHubBackup");
  const result = await backupStudyHubDatabase();
  console.log(result.reason);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Study Hub backup failed");
  process.exitCode = 1;
});

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { runStudyHubSync } = await import("../src/server/studyHubSync");
  try {
    const summary = await runStudyHubSync();
    for (const connector of summary.connectors) {
      const counts = connector.state === "healthy"
        ? ` (${connector.seen} seen, ${connector.changed} changed)` : "";
      console.log(`${connector.connector}: ${connector.state}${counts}${connector.error ? ` — ${connector.error}` : ""}`);
    }
    if (!summary.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Study Hub sync failed");
    process.exitCode = 1;
  }
}

void main();

import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { chromium } from "@playwright/test";

loadEnvConfig(process.cwd());

function canvasBaseUrl() {
  const value = process.env.CANVAS_BASE_URL?.trim();
  if (!value) throw new Error("Set CANVAS_BASE_URL in .env.local first");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("CANVAS_BASE_URL must use HTTPS");
  return new URL(url.href.endsWith("/") ? url.href : `${url.href}/`);
}

async function main() {
  const baseUrl = canvasBaseUrl();
  const storageStatePath = resolve(
    process.cwd(),
    process.env.CANVAS_BROWSER_STORAGE_STATE?.trim() || ".data/canvas-browser-session.json",
  );
  mkdirSync(dirname(storageStatePath), { recursive: true, mode: 0o700 });

  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log("A Chrome window has opened. Complete CPP Signon there; Study Hub never sees your password.");
  console.log("Waiting up to 15 minutes for Canvas to confirm the session...");
  await page.goto(baseUrl.href, { waitUntil: "domcontentloaded" });

  const profileUrl = new URL("api/v1/users/self/profile", baseUrl).href;
  const deadline = Date.now() + 15 * 60_000;
  try {
    while (Date.now() < deadline) {
      if (page.isClosed()) throw new Error("The login window was closed before Canvas confirmed the session");
      try {
        const response = await context.request.get(profileUrl, { timeout: 15_000 });
        const contentType = response.headers()["content-type"] ?? "";
        if (response.ok() && contentType.toLowerCase().includes("json")) {
          const profile = await response.json() as { id?: unknown };
          if (profile.id !== undefined) {
            await context.storageState({ path: storageStatePath });
            chmodSync(storageStatePath, 0o600);
            console.log("Canvas browser session saved locally. You can close the login window.");
            return;
          }
        }
      } catch {
        // Signon navigation can briefly cancel requests; keep waiting.
      }
      await page.waitForTimeout(2_000);
    }
    throw new Error("Timed out waiting for Canvas sign-in");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Canvas login failed");
  process.exitCode = 1;
});

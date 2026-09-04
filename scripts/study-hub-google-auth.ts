import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

function replaceEnvironmentValue(name: string, value: string) {
  const file = `${process.cwd()}/.env.local`;
  const original = readFileSync(file, "utf8");
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  const updated = pattern.test(original) ? original.replace(pattern, line) : `${original.trimEnd()}\n${line}\n`;
  writeFileSync(file, updated, { mode: 0o600 });
}

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env.local first");
  const port = 53_682;
  const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;
  const state = randomBytes(24).toString("hex");
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline", prompt: "consent", state,
  }).toString();

  const code = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => { server.close(); reject(new Error("Google authorization timed out")); }, 5 * 60_000);
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", redirectUri);
      if (url.pathname !== "/oauth2/callback") { response.writeHead(404).end(); return; }
      if (url.searchParams.get("state") !== state) { response.writeHead(403).end("State mismatch"); return; }
      const received = url.searchParams.get("code");
      if (!received) { response.writeHead(400).end("Authorization code missing"); return; }
      response.writeHead(200, { "Content-Type": "text/plain" }).end("Study Hub is authorized. You may close this tab.");
      clearTimeout(timeout); server.close(); resolve(received);
    });
    server.listen(port, "127.0.0.1", () => {
      console.log("Opening Google authorization in your browser…");
      spawn("open", [authorization.href], { detached: true, stdio: "ignore" }).unref();
    });
    server.on("error", reject);
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret, code,
      grant_type: "authorization_code", redirect_uri: redirectUri,
    }),
  });
  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok || typeof payload.refresh_token !== "string") {
    throw new Error("Google did not return a refresh token; remove the app from Google Account connections and try again");
  }
  replaceEnvironmentValue("GOOGLE_OAUTH_REFRESH_TOKEN", payload.refresh_token);
  console.log("Google refresh token saved securely in ignored .env.local.");
  console.log("Set GOOGLE_DRIVE_SYNC_ENABLED=true when you are ready for the first Drive write.");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Google authorization failed");
  process.exitCode = 1;
});

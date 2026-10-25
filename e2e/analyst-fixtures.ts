// RECORDED ANSWERS FOR THE ANALYST SPECS, made by the Analyst's own
// pipeline rather than typed: the saved demo payloads (public/analyst-demo)
// go through buildFactSheet -> runPreview / runAsk with the deterministic
// mock model, so the panel is drawn from exactly the shape the server
// sends. No real LLM is ever called.
import fs from "node:fs";
import path from "node:path";
import type { Page, Route } from "@playwright/test";
import { buildFactSheet } from "../src/lib/analyst/factSheet";
import { runAsk, runPreview, type AskOut, type PreviewOut } from "../src/lib/analyst/analyst";
import { MockClient, type LlmClient } from "../src/lib/analyst/llm";

export const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

const DEMO = path.join(__dirname, "..", "public", "analyst-demo");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const demoPayload = (slug: string): any =>
  JSON.parse(fs.readFileSync(path.join(DEMO, `${slug}.json`), "utf8"));

export const EPL_EVENT = "401878768";          // Arsenal v Everton, saved 2026-10-24
export const EPL_PAYLOAD = demoPayload("arsenal-everton");

const sheetOf = (slug: string) => {
  const d = demoPayload(slug);
  return buildFactSheet(d._demo.league, d._demo.event_id, d);
};
export const previewFor = (slug: string): Promise<PreviewOut> =>
  runPreview(sheetOf(slug), new MockClient());
export const failedPreviewFor = (slug: string): Promise<PreviewOut> => {
  const down: LlmClient = { name: "claude", complete: async () => { throw new Error("Claude API 529: overloaded"); } };
  return runPreview(sheetOf(slug), down);
};
export const askFor = (slug: string): Promise<AskOut> =>
  runAsk(sheetOf(slug), "How likely is a draw?", new MockClient(["The draw lands in {{F2}} of Trivela's simulations, roughly one game in four. Confidence: medium"]));

/** The switch, as /api/analyst/status answers it. */
export const analystOn = (page: Page, on = true) =>
  page.route("**/api/analyst/status", (r) => r.fulfill(json(on ? { enabled: true, leagues: ["epl", "laliga", "mls", "ligamx"] } : { enabled: false })));

/** Every /api read refused by name unless a later route answers it: the
 *  same hermetic floor the cup-hub specs lay. */
export const hermetic = (page: Page) =>
  page.route("**/api/**", (r: Route) => r.fulfill(json({ detail: "hermetic" }, 503)));

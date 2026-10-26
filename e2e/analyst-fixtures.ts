// RECORDED ANSWERS FOR THE ANALYST SPECS, made by the Analyst's own
// pipeline rather than typed: the saved demo payloads (public/analyst-demo)
// go through buildFactSheet -> runPreview / runAsk with the deterministic
// mock model, so the panel is drawn from exactly the shape the server
// sends. No real LLM is ever called.
import fs from "node:fs";
import path from "node:path";
import type { Page, Route } from "@playwright/test";
import { buildFactSheet, buildRungSheet } from "../src/lib/analyst/factSheet";
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
  runAsk(sheetOf(slug), "How likely is a draw?", new MockClient(["The draw lands in {{F2}} of Trivela's simulations, a real chance. Confidence: medium"]));

/** VAR v2: the backend's saved pre-kickoff rung for the same match, in
 *  the shape /api/epl/match/<id>/saved-rung serves (var-saved-rung-v1).
 *  Typed from the backend's own test row (TRIVELA
 *  tests/test_var_saved_rung.py), numbers chosen to differ from the live
 *  demo payload so a test can tell which read a fact came from. */
export const EPL_SAVED_RUNG = {
  schema: "var-saved-rung-v1", competition: "epl", event_id: EPL_EVENT,
  available: true, home: "Arsenal", away: "Everton",
  kickoff: "2026-10-24T14:00:00Z", rungs_held: ["t60", "t10"],
  rung: "t10", captured_at: "2026-10-24T13:51:00Z",
  seconds_before_kickoff: 540, kickoff_at_capture: "2026-10-24T14:00:00Z",
  model: { home_win: 0.538, draw: 0.241, away_win: 0.221, model_version: "epl-dc-v2",
           run_id: 4242, run_captured_at: "run-clock", n_simulations: 10000, is_t10_lock: true },
  model_missing_reason: null,
  trader_model: { h: 0.55, d: 0.25, a: 0.2, name: "unified-nb-v1", status: "tested" },
  trader_model_missing_reason: null,
  market: { legs: { h: { ask_c: 66, bid_c: 65 }, d: { ask_c: 24, bid_c: 23 }, a: { ask_c: 13, bid_c: 12 } },
            devig: { h: 0.6408, d: 0.233, a: 0.1262 }, overround: 1.03, stale: false },
  market_missing_reason: null,
  basis: "the archive's frozen pre-kickoff board rung", display_only: true,
};

/** The live payload after kickoff: the same match, in play. */
export const EPL_PAYLOAD_IN_PLAY = { ...EPL_PAYLOAD, match: { ...EPL_PAYLOAD.match, state: "in" } };

export const rungPreviewFor = (): Promise<PreviewOut> =>
  runPreview(buildRungSheet("epl", EPL_EVENT, EPL_SAVED_RUNG, EPL_PAYLOAD_IN_PLAY), new MockClient());

/** The switch, as /api/analyst/status answers it. */
export const analystOn = (page: Page, on = true) =>
  page.route("**/api/analyst/status", (r) => r.fulfill(json(on ? { enabled: true, leagues: ["epl", "laliga", "mls", "ligamx"] } : { enabled: false })));

/** Every /api read refused by name unless a later route answers it: the
 *  same hermetic floor the cup-hub specs lay. */
export const hermetic = (page: Page) =>
  page.route("**/api/**", (r: Route) => r.fulfill(json({ detail: "hermetic" }, 503)));

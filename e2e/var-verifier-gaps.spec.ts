import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { buildFactSheet, type FactSheet } from "../src/lib/analyst/factSheet";
import { checkText } from "../src/lib/analyst/verify";
import { chooseSheet, runAsk, runPreview, FROZEN_UNAVAILABLE } from "../src/lib/analyst/analyst";
import { MockClient } from "../src/lib/analyst/llm";
import { budgetUsed, resetLimits } from "../src/lib/analyst/limits";
import { cacheClear } from "../src/lib/analyst/cache";
import previewHandler, { config as previewConfig } from "../src/pages/api/analyst/preview";
import askHandler, { config as askConfig } from "../src/pages/api/analyst/ask";
import { EPL_EVENT, EPL_PAYLOAD_IN_PLAY } from "./analyst-fixtures";

// VAR REVIEW FINDINGS 1, 2, 4 AND 10 (2026-10-25), as module-level tests
// with no page, like analyst-verify.spec.ts. Hermetic: the saved demo
// payload, a small hand-made sheet, the mock model. No real LLM is called.

const DEMO = path.join(__dirname, "..", "public", "analyst-demo");
const raw = JSON.parse(fs.readFileSync(path.join(DEMO, "arsenal-everton.json"), "utf8"));
const demo = buildFactSheet("epl", "401878768", raw);

/** The reviewer's repro sheet (scratchpad vtest/test.mjs), as a FactSheet. */
const small: FactSheet = {
  league: "epl", eventId: "1",
  match: { home: "Arsenal", away: "Everton", homeAbbrev: "ARS", awayAbbrev: "EVE", kickoff: "", venue: null, state: "pre" },
  facts: [
    { id: "F1", label: "Arsenal win probability", value: 0.51, kind: "prob", source: "m" },
    { id: "F2", label: "Draw probability", value: 0.27, kind: "prob", source: "m" },
    { id: "F3", label: "Everton win probability", value: 0.22, kind: "prob", source: "m" },
    { id: "F4", label: "Arsenal xG", value: 1.63, kind: "goals", source: "m" },
    { id: "F5", label: "Market price Arsenal", value: 0.55, kind: "price", source: "k" },
    { id: "F6", label: "Arsenal wins in last 5", value: 3, kind: "count", source: "e" },
    { id: "F7", label: "Edge", value: 0.04, kind: "rating", source: "m" },
  ],
  notes: [], generatedAt: null,
};

const flagged = (t: string, s: FactSheet = small) => checkText(t, s).violations.length;

test.describe("finding 1: the verifier's gaps are violations", () => {
  const CAUGHT: [string, string][] = [
    ["number in words", "Arsenal are sixty-four percent to win."],
    ["count in words", "Everton have lost seven of their last ten."],
    ["ratio in words", "The draw comes roughly one game in four."],
    ["leading decimal", "Everton sit at .64 to win."],
    ["ordinal", "Arsenal are 2nd in the table."],
    ["suffix pp", "That is a 9pp gap over the market."],
    ["suffix x", "Arsenal score at 2x the league rate."],
    ["suffix pct", "Arsenal are 64pct favourites."],
    ["suffix k", "Over 60k fans expected."],
    ["signed, sheet is positive", "The edge is -0.04, so fade it."],
    ["fullwidth digits", "Arsenal are ６４% to win."],
    ["vulgar fraction", "Expect 2½ goals."],
    ["'last N' not on the sheet", "Arsenal won their last 9 at home."],
    ["'Over N.5' not on the sheet", "Over 4.5 goals is likely here."],
    ["scoreline not on the sheet", "I see it ending 3-0."],
    ["scoreline matching a count by value", "A 3-1 home win."],
    ["goal margin matching a count", "Arsenal by 3 goals."],
    ["fractional odds", "Everton are 7/2 outsiders."],
    ["1 in 2", "Arsenal are 1 in 2 to win."],
    ["percent on the wrong label (draw vs Everton win)", "Everton are 22% to draw."],
    ["percent on the wrong team", "Everton win 51% of simulations."],
  ];
  for (const [name, t] of CAUGHT) {
    test(`flags: ${name}`, () => {
      expect(flagged(t), JSON.stringify(t)).toBeGreaterThan(0);
    });
  }

  // on the demo sheet, whose form counts include 1, 2 and 3: digits that
  // used to pass by matching an unrelated count
  for (const t of ["I expect a 3-2 home win.", "Arsenal by 3 goals.", "Arsenal are 2nd, Everton 3rd."]) {
    test(`flags on the demo sheet: ${t}`, () => {
      expect(flagged(t, demo), t).toBeGreaterThan(0);
    });
  }

  test("what the sheet does hold still passes", () => {
    for (const t of [
      "Arsenal win 51% of simulations.",
      "Everton win 22% of the time.",
      "The draw is 27%.",
      "Arsenal's xG of 1.63.",
      "The edge is 0.04.",
      "Arsenal have 3 wins in their last 5.",
      "The two sides are close; a 3-way market.",
    ]) expect(checkText(t, small).violations, t).toHaveLength(0);
    // on the demo sheet: its own lines, samples and scorelines
    for (const t of [
      "The over 2.5 line.",
      "Arsenal won 3 of their last 5.",
      "A 2-1 home win is among the likeliest scores.",
      "The market asks 67¢.",
    ]) expect(checkText(t, demo).violations, t).toHaveLength(0);
  });

  test("a preview is placeholder-only: a raw number that matches is still flagged there", async () => {
    const raw51 = JSON.stringify({ headline: "Arsenal win 51% of simulations.", why: ["x"], risks: ["y"], market_view: "z", confidence: "low" });
    const out = await runPreview(demo, new MockClient([raw51, raw51]));
    expect(out.trace[0].violations.map((v) => v.text)).toEqual(["51%"]);
    expect(out.preview!.headline.flagged).toBe(1);
    // and the same sentence in an Ask answer is a checked number
    expect(checkText("Arsenal win 51% of simulations.", demo).violations).toHaveLength(0);
  });

  test("the mock model's own answers still verify", async () => {
    expect((await runPreview(demo, new MockClient())).preview!.headline.flagged).toBe(0);
    expect((await runAsk(demo, "draw?", new MockClient())).answer!.flagged).toBe(0);
  });
});

test.describe("finding 2: after kickoff without a saved rung, no in-play prices", () => {
  for (const state of ["in", "post"]) {
    test(`state ${state}: priced facts are taken out and the sheet says why`, () => {
      const live = { ok: true as const, body: { ...EPL_PAYLOAD_IN_PLAY, match: { ...EPL_PAYLOAD_IN_PLAY.match, state } } };
      const { sheet, runId } = chooseSheet("epl", EPL_EVENT, live, null);
      expect(sheet.facts.some((f) => f.kind === "prob" || f.kind === "price" || f.kind === "goals")).toBe(false);
      expect(sheet.frozenUnavailable).toBe(FROZEN_UNAVAILABLE);
      expect(sheet.notes.join(" ")).toContain("does not read in-play prices");
      expect(runId).toBe(`unpriced-${state}`);
      // the pre-match context the live read owns is still there
      expect(sheet.facts.some((f) => f.label === "Arsenal wins in last 5")).toBe(true);
    });
  }
});

// ---- the routes, called as functions --------------------------------
type Res = { statusCode: number; body: any; headers: Record<string, string> }; // eslint-disable-line @typescript-eslint/no-explicit-any
function mockRes(): Res & { status(c: number): any; json(b: unknown): any; setHeader(k: string, v: string): void } { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = {
    statusCode: 200, body: undefined as unknown, headers: {} as Record<string, string>,
    status(c: number) { r.statusCode = c; return r; },
    json(b: unknown) { r.body = b; return r; },
    setHeader(k: string, v: string) { r.headers[k] = v; },
  };
  return r;
}
const req = (o: { method: string; query?: Record<string, string>; body?: unknown; ip?: string }) =>
  ({ method: o.method, query: o.query ?? {}, body: o.body, headers: { "x-forwarded-for": o.ip ?? "203.0.113.9" }, socket: {} }) as never;

test.describe("finding 4: the VAR budget", () => {
  test.beforeEach(() => {
    process.env.ANALYST_ENABLED = "true";
    resetLimits(); cacheClear();
  });
  test.afterEach(() => { delete process.env.ANALYST_ENABLED; delete process.env.PREVIEW_MISS_PER_IP_PER_HOUR; });

  test("Ask charges nothing when the match does not load", async () => {
    const res = mockRes();
    await askHandler(req({ method: "POST", body: { demo: "no-such-demo", question: "draw?" } }), res as never);
    expect(res.statusCode).toBe(400);
    expect(budgetUsed().calls).toBe(0);
  });

  test("a retry is charged as the second call it is", async () => {
    let charged = 0;
    const bad = "Arsenal win 88% of the time. Confidence: low";
    await runAsk(demo, "?", new MockClient([bad, "{{F1}}. Confidence: low"]), { charge: () => { charged++; return true; } });
    expect(charged).toBe(2);
    charged = 0;
    const badP = JSON.stringify({ headline: "88%", why: [], risks: [], market_view: "", confidence: "low" });
    await runPreview(demo, new MockClient([badP, badP]), { charge: () => { charged++; return true; } });
    expect(charged).toBe(2);
  });

  test("a preview cache miss is limited per visitor", async () => {
    process.env.PREVIEW_MISS_PER_IP_PER_HOUR = "1";
    const a = mockRes(), b = mockRes();
    await previewHandler(req({ method: "GET", query: { demo: "arsenal-everton" } }), a as never);
    expect(a.body.ok).toBe(true);
    await previewHandler(req({ method: "GET", query: { demo: "rayo-elche" } }), b as never);
    expect(b.body.ok).toBe(false);
    expect(b.body.fallbackReason).toMatch(/this hour/);
    // a cached preview is never counted
    const c = mockRes();
    await previewHandler(req({ method: "GET", query: { demo: "arsenal-everton" } }), c as never);
    expect(c.body.cached).toBe(true);
  });

  test("two visitors on one uncached preview make one LLM run", async () => {
    const a = mockRes(), b = mockRes();
    await Promise.all([
      previewHandler(req({ method: "GET", query: { demo: "arsenal-everton" }, ip: "198.51.100.1" }), a as never),
      previewHandler(req({ method: "GET", query: { demo: "arsenal-everton" }, ip: "198.51.100.2" }), b as never),
    ]);
    expect(a.body.ok && b.body.ok).toBe(true);
    expect(budgetUsed().calls).toBe(1);
  });
});

test("finding 10: the analyst routes set a function clock over the LLM's 55 s", () => {
  expect(previewConfig?.maxDuration).toBeGreaterThanOrEqual(60);
  expect(askConfig?.maxDuration).toBeGreaterThanOrEqual(60);
});

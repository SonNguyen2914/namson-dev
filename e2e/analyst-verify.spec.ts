import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { buildFactSheet, displayValue } from "../src/lib/analyst/factSheet";
import { checkText } from "../src/lib/analyst/verify";
import { runAsk, runPreview, runIdOf } from "../src/lib/analyst/analyst";
import { MockClient, type LlmClient } from "../src/lib/analyst/llm";
import { DEMO_MATCHES } from "../src/lib/analyst/demos";
import { cacheClear, cacheGet, cacheKey, cacheSet, PREVIEW_TTL_MS } from "../src/lib/analyst/cache";

// THE ANALYST'S VERIFIER AND REFINEMENT LOOP, as unit tests. Ported from
// trivela-analyst tests/verify.test.ts (vitest, 10 tests) onto this repo's
// one test runner: module-level tests with no page, like the fee module's
// in epl-match.spec.ts. Hermetic: the saved demo payload and a scripted
// mock model. No test here, or anywhere in CI, calls a real LLM.

const DEMO = path.join(__dirname, "..", "public", "analyst-demo");
const raw = JSON.parse(fs.readFileSync(path.join(DEMO, "arsenal-everton.json"), "utf8"));
const sheet = buildFactSheet("epl", "401878768", raw);
const fact = (label: string) => sheet.facts.find((f) => f.label === label)!;

test.describe("fact sheet", () => {
  test("gives every fact a unique id and a display value", () => {
    const ids = sheet.facts.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(sheet.facts.length).toBeGreaterThan(20);
    expect(displayValue(fact("Arsenal win probability"))).toBe("51%");
  });
  test("reads the model, the market and form", () => {
    expect(fact("Arsenal expected goals").value).toBeCloseTo(1.63);
    expect(fact("Market price for Arsenal (cents, ask)").value).toBeCloseTo(0.67);
    expect(sheet.facts.some((f) => f.label.startsWith("Arsenal wins in last"))).toBe(true);
  });
});

test.describe("verifier", () => {
  test("renders placeholders as verified facts", () => {
    const r = checkText("Arsenal at {{F1}}.", sheet);
    expect(r.violations).toHaveLength(0);
    expect(r.segments.find((s) => s.type === "fact")?.text).toBe("51%");
  });
  test("accepts raw numbers that match a fact within rounding", () => {
    expect(checkText("Arsenal win 51% of simulations", sheet).violations).toHaveLength(0);
    expect(checkText("Arsenal win 50.8% of simulations", sheet).violations).toHaveLength(0);
    expect(checkText("The market asks 67¢", sheet).violations).toHaveLength(0);
    expect(checkText("xG of 1.63", sheet).violations).toHaveLength(0);
  });
  test("flags invented numbers and unknown ids", () => {
    expect(checkText("Arsenal win 73% of the time", sheet).violations).toHaveLength(1);
    expect(checkText("Saka has scored 17 goals", sheet).violations.length).toBeGreaterThan(0);
    expect(checkText("see {{F999}}", sheet).violations).toHaveLength(1);
  });
  test("ignores football vocabulary like over 2.5", () => {
    expect(checkText("The over 2.5 line", sheet).violations).toHaveLength(0);
  });
});

test.describe("refinement loop", () => {
  const good = JSON.stringify({ headline: "Arsenal lead at {{F1}}.", why: ["xG {{F4}}."], risks: ["Draw {{F2}}."], market_view: "Market {{F1}}.", confidence: "medium" });
  const bad = JSON.stringify({ headline: "Arsenal win 88% of the time.", why: ["x"], risks: ["y"], market_view: "z", confidence: "high" });

  test("retries once when a number fails, then succeeds", async () => {
    const out = await runPreview(sheet, new MockClient([bad, good]));
    expect(out.ok).toBe(true);
    expect(out.trace).toHaveLength(2);
    expect(out.trace[0].violations.length).toBeGreaterThan(0);
    expect(out.preview!.headline.flagged).toBe(0);
  });
  test("strips and flags if the retry still fails", async () => {
    const out = await runPreview(sheet, new MockClient([bad, bad]));
    expect(out.ok).toBe(true);
    expect(out.preview!.headline.flagged).toBe(1);
    expect(out.preview!.headline.segments.some((s) => s.type === "flag")).toBe(true);
  });
  test("falls back to raw numbers when the model fails", async () => {
    const broken: LlmClient = { name: "x", complete: async () => { throw new Error("down"); } };
    const out = await runPreview(sheet, broken);
    expect(out.ok).toBe(false);
    expect(out.fallbackReason).toMatch(/did not answer/);
  });
  test("ask answers are verified the same way", async () => {
    const out = await runAsk(sheet, "draw?", new MockClient(["A draw is {{F2}}. Confidence: medium"]));
    expect(out.answer!.flagged).toBe(0);
  });
});

// Two checks the port added: the client's demo list is the payloads' own,
// and the preview cache is keyed by the model run as well as the match.
test.describe("namson.dev port", () => {
  test("the demo list matches the saved payloads", () => {
    for (const d of DEMO_MATCHES) {
      const p = JSON.parse(fs.readFileSync(path.join(DEMO, `${d.slug}.json`), "utf8"));
      expect([p._demo.league, p._demo.event_id, p.match.home.name, p.match.away.name, p.match.date])
        .toEqual([d.league, d.eventId, d.home, d.away, d.date]);
    }
  });
  test("a new model run is a cache miss, and an entry lives 6 hours", () => {
    cacheClear();
    const run = runIdOf(raw);
    expect(run).toMatch(/^[0-9a-f-]{36}$/);
    const t0 = 1_000_000;
    cacheSet(cacheKey("epl", "401878768", run), "read", t0);
    expect(cacheGet(cacheKey("epl", "401878768", run), t0 + 1000)).toBe("read");
    expect(cacheGet(cacheKey("epl", "401878768", "another-run"), t0 + 1000)).toBeNull();
    expect(cacheGet(cacheKey("epl", "401878768", run), t0 + PREVIEW_TTL_MS + 1)).toBeNull();
    expect(PREVIEW_TTL_MS).toBe(6 * 3600_000);
  });
});

import { expect, test } from "@playwright/test";

import { maxContractsForStake, orderCostDollars, orderFeeDollars,
  unitFeeDollars } from "../src/lib/fee";

// The EPL match hub's scenario engine, pinned to the backend's CANONICAL
// fee policy (src/live/paper.py `order_fee_dollars` / `FEE_POLICY`):
//
//     fee = ceil_to_centicent(0.07 * C * P * (1 - P))
//
// charged ONCE on the whole order, in exact arithmetic. The page applied
// 0.07*P*(1-P) per contract in binary floating point, which disagrees
// with the policy on both counts.
//
// Hermetic: every request is a recorded payload, no backend involved.
//
// Honest note on what each test can prove. The old per-contract fee is
// the canonical one MINUS the ceiling, so the two disagree by at most
// one centicent ($0.0001) — below the page's own two-decimal display
// precision. No UI-level assertion on a rendered dollar figure can
// therefore discriminate them, and pretending otherwise would be a test
// that passes for the wrong reason. The VALUE guard lives at module
// level (first test) and is red against a float implementation; the UI
// tests assert that the page is wired to the module and states the
// policy it actually applies.

const EVENT = "401879301";

const MATCH_PAYLOAD = {
  match: {
    id: EVENT,
    date: new Date(Date.now() + 86_400_000).toISOString(),
    state: "pre",
    detail: "Scheduled",
    venue: "Emirates Stadium",
    home: { name: "Arsenal", abbrev: "ARS" },
    away: { name: "Manchester United", abbrev: "MAN" },
    stats: [],
    events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: {
    event_ticker: "KXEPLGAME-26AUG22ARSMUN",
    title: "Arsenal vs Man Utd",
    markets: [
      { ticker: "KXEPLGAME-26AUG22ARSMUN-ARS", label: "Arsenal",
        yes_ask: "0.10", yes_bid: "0.09", status: "active" },
    ],
  },
  books: [],
  book_match: { status: "mapped",
                candidates: ["KXEPLGAME-26AUG22ARSMUN"],
                loose_candidates: [] },
  model: null,
  lineups: null,
  generated_at: new Date().toISOString(),
};

test.describe("EPL scenario fee policy", () => {
  test("the fee module reproduces the backend's canonical values",
    () => {
      // the backend's own worked example (tests/test_mls_shadow.py):
      // 100 @ $0.10 is 63.00c EXACTLY, not 64c. In IEEE-754
      // 0.07*100*0.10*0.90 is 0.6300000000000001, so a naive ceil to the
      // centicent bills 63.01c — this is why the module is integer-based.
      expect(orderFeeDollars(0.10, 100)).toBeCloseTo(0.63, 10);
      expect(Math.ceil(0.07 * 100 * 0.10 * 0.90 * 10000) / 10000)
        .toBeGreaterThan(0.63);           // the trap, demonstrated
      // ceiling actually applied where the raw value is fractional:
      // 100 @ $0.3333 is 1.55547777... which the venue bills as $1.5555
      expect(orderFeeDollars(0.3333, 1)).toBeCloseTo(0.0156, 10);
      expect(orderFeeDollars(0.3333, 100)).toBeCloseTo(1.5555, 10);
      expect(0.07 * 100 * 0.3333 * (1 - 0.3333))
        .toBeLessThan(orderFeeDollars(0.3333, 100));   // no-ceiling gap
      // guards match the backend's
      expect(orderFeeDollars(0, 100)).toBe(0);
      expect(orderFeeDollars(1, 100)).toBe(0);
      expect(orderFeeDollars(0.5, 0)).toBe(0);
      // the whole-order cost, and the contract count it supports
      expect(orderCostDollars(0.10, 100)).toBeCloseTo(10.63, 10);
      expect(maxContractsForStake(0.10, 10.63)).toBe(100);
      expect(maxContractsForStake(0.10, 10.62)).toBe(99);
      // the per-contract gate fee stays UNQUANTIZED, as paper.py's
      // net-edge comparison requires
      expect(unitFeeDollars(0.10)).toBeCloseTo(0.0063, 12);
    });

  test("the scenario table buys the contracts the policy allows",
    async ({ page }) => {
      // CONTROL (passes both ways): $10.63 at a 10c ask is exactly 100
      // contracts — 100 x $0.10 plus the $0.63 whole-order fee — and the
      // linear float agrees at this price. It pins that the wiring is
      // live and produces the canonical numbers end to end.
      await page.route("**/api/card/**", (route) =>   // hermetic: the card fetch stays recorded too
        route.fulfill({ status: 404, contentType: "application/json",
                        body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
      await page.route(`**/api/epl/match/${EVENT}`, (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH_PAYLOAD) }));
      await page.goto(`/bet-suggester/epl/${EVENT}`);
      // the scenario engine ships collapsed
      await page.getByRole("button", { name: /betting strategy/i })
        .click();
      const cell = page.getByTestId(
        "scenario-contracts-KXEPLGAME-26AUG22ARSMUN-ARS");
      await expect(cell).toBeVisible();
      await page.locator('input[inputmode="decimal"]').first()
        .fill("10.63");
      await expect(cell).toContainText("100 ×");
      await expect(page.getByText(/total at risk \$10\.63/i))
        .toBeVisible();
    });

  test("the scenario states which fees are NOT modelled",
    async ({ page }) => {
      await page.route("**/api/card/**", (route) =>   // hermetic: the card fetch stays recorded too
        route.fulfill({ status: 404, contentType: "application/json",
                        body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
      await page.route(`**/api/epl/match/${EVENT}`, (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH_PAYLOAD) }));
      await page.goto(`/bet-suggester/epl/${EVENT}`);
      // the scenario engine ships collapsed
      await page.getByRole("button", { name: /betting strategy/i })
        .click();
      await expect(page.getByText(/general taker only/i)).toBeVisible();
      await expect(page.getByText(/ceil-to-centicent/i)).toBeVisible();
    });
});

// ====================================================================
// THE SHARED MATCH HUB — the 2026-09-07 sweep
// ====================================================================
//
// Hermetic, like the block above: one recorded match payload per test,
// varied in the one field under examination. Every shape below is the
// backend's (src/live/runs.py `_input_quality`, src/mls.py `_h2h`,
// src/comp_match.py lineups), not invented — the two worst bugs on the
// card next door both came from hand-written fixtures that agreed with
// the frontend instead of with the emitter.

type Hub = import("@playwright/test").Page;

async function openHub(page: Hub, patch: Record<string, unknown> = {},
                       matchPatch: Record<string, unknown> = {}) {
  const body = JSON.parse(JSON.stringify(MATCH_PAYLOAD));
  Object.assign(body, patch);
  Object.assign(body.match, matchPatch);
  await page.route("**/api/card/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ card: null }) }));
  await page.route(`**/api/epl/match/${EVENT}`, (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(body) }));
  await page.goto(`/bet-suggester/epl/${EVENT}`);
  return body;
}

/** A completed run carrying the FIVE input-quality states the backend
 *  actually freezes on every run. */
const RUN_WITH_QUALITY = {
  run_type: "t10", captured_at: "2026-08-22T18:20:00+00:00",
  seed: 7, n_simulations: 20000,
  outcomes: { home_win: 0.5, draw: 0.25, away_win: 0.25 },
  input_quality: {
    TEAM_DATA_FRESH: true, PLAYER_DATA_FRESH: false,
    AVAILABILITY_COMPLETE: false, LINEUP_CONFIRMED: true,
    GOALKEEPER_CONFIRMED: false,
  },
};

test.describe("input quality is the payload's set, not a list typed here", () => {
  test("all FIVE states the backend freezes are drawn — the two that "
    + "were silently dropped included", async ({ page }) => {
      // src/live/runs.py `_input_quality` has emitted five states since
      // Phase 5. QUALITY_LABELS hand-listed three, so PLAYER_DATA_FRESH
      // and AVAILABILITY_COMPLETE rode on every run, were false on most
      // of them, and were drawn on none — a panel that exists so
      // missing data cannot read as silent confidence, silent about two
      // fifths of it.
      await openHub(page, { model: { model_version: "epl-2026-v0",
                                     primary: RUN_WITH_QUALITY } });
      const chips = page.getByTestId("input-quality-chip");
      await expect(chips).toHaveCount(5);
      for (const k of ["TEAM_DATA_FRESH", "PLAYER_DATA_FRESH",
        "AVAILABILITY_COMPLETE", "LINEUP_CONFIRMED",
        "GOALKEEPER_CONFIRMED"]) {
        await expect(page.getByTestId("input-quality")
          .locator(`[data-key="${k}"]`)).toHaveCount(1);
      }
      // and a false one says PENDING rather than going quiet
      await expect(page.getByTestId("input-quality")
        .locator('[data-key="PLAYER_DATA_FRESH"]')).toContainText("pending");
    });

  test("a state the backend adds tomorrow is drawn under its own name",
    async ({ page }) => {
      const q = { ...RUN_WITH_QUALITY.input_quality,
                  REFEREE_ASSIGNED: false };
      await openHub(page, { model: { primary:
        { ...RUN_WITH_QUALITY, input_quality: q } } });
      await expect(page.getByTestId("input-quality-chip")).toHaveCount(6);
      await expect(page.getByTestId("input-quality")
        .locator('[data-key="REFEREE_ASSIGNED"]'))
        .toContainText("referee assigned");
    });

  test("input_quality NULL is not five pending chips and is not an "
    + "absent panel — it says the run recorded none", async ({ page }) => {
      await openHub(page, { model: { primary:
        { ...RUN_WITH_QUALITY, input_quality: null } } });
      await expect(page.getByTestId("input-quality-chip")).toHaveCount(0);
      await expect(page.getByTestId("input-quality-absent"))
        .toContainText("NOT a statement that the inputs were complete");
    });
});

test.describe("a bar is drawn from the numbers beside it, or not at all", () => {
  test("an unreadable side draws NO bar — it is not a zero", async ({ page }) => {
      // `(Number.isFinite(h) ? h : 0)` folded an unreadable stat into a
      // measured zero, so a home value ESPN did not send printed "—"
      // while the bar beneath it handed the away side the whole width.
      // state "post" so the Match stats collapse is open by default
      await openHub(page, {}, { state: "post", detail: "FT", stats: [
        { key: "possession", label: "Possession", home: undefined,
          away: "62" },
      ] });
      await expect(page.getByTestId("stat-bar-possession")).toHaveCount(0);
      await expect(page.getByTestId("stat-unreadable-possession"))
        .toContainText("a share cannot be formed from one number");
    });

  test("neither side readable draws no 50/50 either — no split is not "
    + "parity", async ({ page }) => {
      await openHub(page, {}, { state: "post", detail: "FT", stats: [
        { key: "shots", label: "Shots", home: "—", away: "—" },
      ] });
      await expect(page.getByTestId("stat-bar-shots")).toHaveCount(0);
      await expect(page.getByTestId("stat-unreadable-shots"))
        .toContainText("neither side");
    });

  test("two real numbers still draw the bar — including a real zero",
    async ({ page }) => {
      // the control. Without it the two tests above pass against a
      // component that never draws a bar at all.
      await openHub(page, {}, { state: "post", detail: "FT", stats: [
        { key: "corners", label: "Corners", home: "7", away: "0" },
      ] });
      await expect(page.getByTestId("stat-bar-corners")).toHaveCount(1);
      await expect(page.getByTestId("stat-unreadable-corners"))
        .toHaveCount(0);
    });
});

test.describe("team news: could not ask is not not yet announced", () => {
  const SIDE = (over: Record<string, unknown> = {}) => ({
    formation: "4-3-3", released: true, confirmed: true,
    starters: [{ name: "A. Player", position: "F", jersey: "9" }],
    bench: [], key_absences: null, key_absences_reason: null, ...over });

  test("a side the backend could not resolve does NOT read as awaiting "
    + "team news", async ({ page }) => {
      // `!side?.released` gave a NULL side and an unreleased side the
      // same sentence. "Awaiting team news" asserts the XI has not been
      // announced yet, which is a claim about the world; a null side is
      // us not having asked. The honest version of this distinction
      // already lived four fields down on key_absences.
      await openHub(page, { lineups: { home: null, away: SIDE(),
                                       strength_available: true } });
      const absent = page.getByTestId("xi-side-absent");
      await expect(absent).toBeVisible();
      await expect(absent).toContainText("NOT a statement that the XI is unannounced");
      // and the side that IS unreleased keeps its own, different words
      await openHub(page, { lineups: { home: SIDE({ released: false,
        starters: [] }), away: SIDE(), strength_available: true } });
      await expect(page.getByText("awaiting team news")).toBeVisible();
      await expect(page.getByTestId("xi-side-absent")).toHaveCount(0);
    });

  test("an XI reported released with nobody in it says so rather than "
    + "rendering an empty list", async ({ page }) => {
      await openHub(page, { lineups: { home: SIDE({ starters: [] }),
                                       away: SIDE(),
                                       strength_available: true } });
      await expect(page.getByTestId("xi-released-empty"))
        .toContainText("an empty list where eleven names should be");
    });

});

test.describe("an unrecognised orientation refuses; it does not fold", () => {
  test("an H2H row with no at_vs does not attribute the two scores to "
    + "a side", async ({ page }) => {
      // `g.at_vs === "@"` meant every value that was not the string "@"
      // — null included — became HOME, and the two scores printed the
      // wrong way round beside the letter. src/mls.py `_h2h`'s LEGACY
      // branch passes ESPN's `atVs` through raw and takes `result` from
      // the provider's own `gameResult`, and its sibling `_last_five`
      // folds the same unknown the OPPOSITE way. Two folds, opposite
      // defaults, one flag — the ESPN winner-first bug of 2026-07-24,
      // one branch over.
      await openHub(page, {}, { scouting: { last_five: [], head_to_head: [
        { perspective: "ARS", result: "W", home_score: "1",
          away_score: "2", at_vs: null, opponent: "MUN",
          date: "2026-04-02T00:00Z" },
      ] } });
      await page.getByRole("button", { name: /ESPN form \+ H2H/i }).click();
      const row = page.getByTestId("h2h-unoriented");
      await expect(row).toBeVisible();
      await expect(row).toContainText("no home/away orientation");
      await expect(row).toContainText("are NOT attributed to a side");
    });

  test("a row that DOES carry an orientation is still read normally",
    async ({ page }) => {
      // the control: the refusal must not swallow the working case.
      await openHub(page, {}, { scouting: { last_five: [], head_to_head: [
        { perspective: "ARS", result: "L", home_score: "1",
          away_score: "2", at_vs: "vs", opponent: "MUN",
          date: "2026-04-02T00:00Z" },
      ] } });
      await page.getByRole("button", { name: /ESPN form \+ H2H/i }).click();
      await expect(page.getByTestId("h2h-unoriented")).toHaveCount(0);
      // perspective is HOME here, so its own score comes first and the
      // letter agrees with the digits: 1-2 is an L.
      await expect(page.getByText("ARS 1–2 MUN")).toBeVisible();
    });
});

test.describe("a failed refresh is not an up-to-date page", () => {
  test("the page says the numbers are held when the poll fails",
    async ({ page }) => {
      // The 30s poll keeps the last good payload when it fails, which
      // is right — blanking a live page would read as the match
      // stopping. Nothing said so, while a panel below labelled the
      // book it was showing "current market book · live".
      let calls = 0;
      await page.route("**/api/card/**", (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify({ card: null }) }));
      await page.route(`**/api/epl/match/${EVENT}`, (r) => {
        calls += 1;
        if (calls === 1) {
          return r.fulfill({ status: 200,
            contentType: "application/json",
            body: JSON.stringify(MATCH_PAYLOAD) });
        }
        return r.fulfill({ status: 503, contentType: "application/json",
                           body: "{}" });
      });
      // the clock is installed BEFORE the page loads: the 30s poll's
      // interval is created during mount, and a clock installed after
      // that does not own it.
      await page.clock.install();
      await page.goto(`/bet-suggester/epl/${EVENT}`);
      await expect(page.getByText("Arsenal").first()).toBeVisible();
      await expect(page.getByTestId("feed-stale")).toHaveCount(0);
      await page.clock.runFor("00:35");
      const stale = page.getByTestId("feed-stale");
      await expect(stale).toContainText("last refresh FAILED");
      await expect(stale).toContainText("not current");
      // and the numbers are still there — this is not a blank page
      await expect(page.getByText("Arsenal").first()).toBeVisible();
    });
});

test.describe("a column's caveat is on the page, not on a title", () => {
  test("the net-edge column states that its two halves come from "
    + "different moments", async ({ page }) => {
      // A signed percentage in green or red, whose disclosure that it
      // subtracts a CURRENT ask from a FROZEN model probability is
      // reachable only by hovering, is a number that reads as an edge
      // and is not one — on the one table an operator reads down
      // looking for something to act on.
      await openHub(page);
      const basis = page.getByTestId("markets-column-basis");
      await expect(basis).toBeVisible();
      await expect(basis).toContainText("CURRENT ask");
      await expect(basis).toContainText("Kalshi's entry fee");
      await expect(basis).toContainText("payout multiple at the buyable ask");
      // pre-kickoff there is nothing to warn about
      await expect(page.getByTestId("edge-vs-repriced-book"))
        .toHaveCount(0);
    });

  test("on a STARTED match the table says the card one section up "
    + "refuses this very number", async ({ page }) => {
      // card.py `_pick` refuses `repriced_book` on any started fixture
      // and computes no edge, because HOLD-EXIT-DESIGN forbids claiming
      // an in-play edge. This table computes it anyway, from a T-10
      // model against a book the match has repriced — and SuggestionCard
      // renders INSIDE this component, so one screen carried the
      // refusal and the number it refuses a few hundred pixels apart,
      // with nothing anywhere saying so.
      await openHub(page, {}, { state: "in", detail: "2H", minute: "63'" });
      const warn = page.getByTestId("edge-vs-repriced-book");
      await expect(warn).toBeVisible();
      await expect(warn).toContainText("repriced_book");
      await expect(warn).toContainText("it is not an edge");
      // it is the refusal family's ink, never the accent
      await expect(warn).toHaveClass(/text-warn/);
    });
});

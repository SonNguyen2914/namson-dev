import { expect, test, type Page } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import {
  BOOK_RECORDED, CANDIDATES_RECORDED, STATUS_RECORDED,
} from "./trading-console-recorded";
import { FOCUS_COMPETITIONS } from "../src/lib/tradingConsole";
import { parseCarefulBody } from "../src/pages/api/ops/trading-careful";
import { carefulWords } from "../src/lib/tradingLedger";
import { carefulCell } from "../src/lib/tradingConsole";

// THE CAREFUL STRATEGY ON THE CONSOLE (2026-10-06, Son's decisions;
// backend src/trading/careful.py, docs/TRADING-AGENT.md §38).
//
// THE CONTRACT, as release-careful serves it on the status route:
//
//   daily_budget   used / remaining / limit, realised (NET), open_positions,
//                  resting_orders, trading_day, trading_day_tz
//   careful        enabled, competitions {slug: {on}}, tick {funded,
//                  qualifying, swaps, data_errors, usage {hour, hour_max}},
//                  situations {k: {paper_n, paper_x_c, real_n, real_x_c,
//                  real_pnl_c, disagreement}}, grounds_paper / grounds_real
//                  {g: {n, matches, mean, lo, hi}}, promoted, probation,
//                  events; since 2026-10-07 tick {data_errors_pre_match,
//                  data_errors_in_play} and paper_results {k: {n, clv_x_c,
//                  results_n, wins, pnl_c_mean, pnl_c, sized_n,
//                  pnl_dollars, disagreement}}
//
// Checked: the budget and its parts; the per-kickoff-hour usage against
// $12; probable data errors counted; every one of the eleven competitions
// a switch, derived from the registry, its POST rebuilt by the proxy; a
// disagreement flagged; a backend without the block reads "not served
// yet". Fully mocked with page.route; no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const SWITCH = "**/api/ops/trading-careful";
const TOKEN = "ops-careful-token-typed-by-a-person";

type Obj = Record<string, unknown>;
const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const CAREFUL: Obj = {
  enabled: true, version: "careful-v1", label: "experimental, unproven",
  competitions: Object.fromEntries(FOCUS_COMPETITIONS.map((c) =>
    [c, { on: c !== "mls" }])),
  competitions_count: 11, promoted: [], probation: [],
  tick: { funded: 2, qualifying: 5, swaps: 1, data_errors: 3,
    data_errors_pre_match: 2, data_errors_in_play: 1,
    usage: { hour: { "2026-10-10T19:00:00+00:00": "7.46" }, hour_max: "12" } },
  // 2026-10-07: the paper bets' would-be results beside CLV
  paper_results: {
    "mls|GAME|pre_match": { n: 30, clv_x_c: 1.4, results_n: 22, wins: 6,
      pnl_c_mean: -12.5, pnl_c: -275, sized_n: 0, pnl_dollars: null,
      disagreement: true },
    "epl|GAME|in_play": { n: 4, clv_x_c: -0.3, results_n: 3, wins: 2,
      pnl_c_mean: 20.1, pnl_c: 60.3, sized_n: 3, pnl_dollars: "1.42",
      disagreement: false },
  },
  // 2026-10-07 (second set): the in-play three-point ladder
  inplay_ladder: { ladder: "inplay_3pt", signals: ["deep", "fresh", "spare"],
    score_of: 3, tiers: { "0": "0", "1": "0", "2": "1", "3": "2" },
    fresh_s: "60", deep_book: "50", spare: "0.01", since_hours: 24,
    paper_n: 5, by_score: { "2": 3, "3": 2 }, by_tier: { "1": 3, "2": 2 },
    by_signal: { deep: 5, fresh: 4, spare: 3 } },
  situations: {
    "epl|GAME|90-30": { paper_n: 40, paper_x_c: 1.2, real_n: 22,
      real_x_c: 0.8, real_settled_n: 22, real_pnl_c: -310, disagreement: true },
  },
  grounds_paper: { "family:SPREAD": { n: 150, matches: 21, mean: 0.9,
    lo: 0.2, hi: 1.6 } },
  grounds_real: {},
  events: [{ at: "2026-10-10T18:00:00+00:00", reason: "promotion_check",
    ground: "family:SPREAD", milestone: 150, proposed: true }],
};
// 2026-10-12 (backend #246): the paper grounds by gate verdict; #248: the
// shadow sizing block; #249: the in-play paper ground, SEALED until Nov 8
const SEALED = "inplay:sell_trailer_first_goal";
const VERDICT: Obj = {
  paper_only: true, band_c: "1", max_per_tick: 4,
  means: { "gate:books_only": "the bookmakers cleared T, our model did not" },
  grounds: {
    "gate:pass": { n: 40, matches: 12, mean: 0.61, lo: -0.2, hi: 1.42 },
    "gate:books_only": { n: 25, matches: 9, mean: -0.35, lo: -1.1, hi: 0.4 },
    "gate:model_only": { n: 0, matches: 0, mean: null, lo: null, hi: null },
    "gate:none": { n: 3, matches: 1, mean: 0.2, lo: null, hi: null },
    "near:books": { n: 0, matches: 0, mean: null, lo: null, hi: null },
    "near:model": { n: 0, matches: 0, mean: null, lo: null, hi: null },
    "near:both": { n: 0, matches: 0, mean: null, lo: null, hi: null },
  },
};
const SIZING: Obj = {
  version: "sizing-v1", mode: "shadow", mode_configured: "shadow",
  live_allowed: false,
  knobs: { SIZING_KELLY_FRACTION: "0.125", SIZING_CI_Z: "1.96" },
  terms: ["kelly", "tier"],
};
const CAREFUL_V2: Obj = {
  ...CAREFUL,
  tick: { ...(CAREFUL.tick as Obj), sizing: { version: "sizing-v1",
    mode: "shadow", live_allowed: false, sized: 7, zero: 4, fee_drag: 1,
    raised: 0, below_tier: 3, binding: { kelly: 5, tier: 2 } } },
  sizing: SIZING,
  grounds_by_verdict: VERDICT,
  grounds_paper: { ...(CAREFUL.grounds_paper as Obj),
    "gate:pass": { n: 40, matches: 12, mean: 0.61, lo: -0.2, hi: 1.42 },
    // its numbers are results, sealed: only n and matches may show
    [SEALED]: { n: 9, matches: 6, mean: 13.37, lo: 4.21, hi: 22.53,
      held: 5, ground: SEALED, paper_only: true,
      by_band: { "0-30": { n: 4, matches: 3, mean: 17.77, lo: null, hi: null } },
      clv: { n: 9, matches: 6, mean: 2.468, lo: null, hi: null } } },
};
const BUDGET: Obj = { used: "6.20", remaining: "13.80", limit: "20",
  realised: "-2.00", open_positions: "5.40", resting_orders: "2.80",
  trading_day: "2026-10-10", trading_day_tz: "America/Los_Angeles" };
const SERVED: Obj = { ...STATUS_RECORDED, careful: CAREFUL, daily_budget: BUDGET };
const SERVED_V2: Obj = { ...STATUS_RECORDED, careful: CAREFUL_V2, daily_budget: BUDGET };

async function openConsole(page: Page, status: unknown, hash = "#model") {
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
  await page.goto(`/ops/trading${hash}`);
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
}

test.describe("the careful strategy on the console", () => {
  test("the budget: used, remaining, $20, its NET parts and the LA day",
    async ({ page }) => {
      // money at risk: with the capital on Overview (redesign, 2026-10-07)
      await openConsole(page, SERVED, "");
      const b = page.getByTestId("careful-budget");
      await expect(b).toContainText("$6.20 of $20.00");
      await expect(b).toContainText("remaining $13.80");
      await expect(b).toContainText("realised (net) −$2.00 · open $5.40 · resting $2.80");
      await expect(b).toContainText("America/Los_Angeles");
    });

  test("per kickoff hour against $12, and edges above 8c counted",
    async ({ page }) => {
      await openConsole(page, SERVED, "");
      // each hour's figure against the cap is one hover away (quiet pass)
      await expect(page.getByTestId("careful-hours")).toContainText("$7.46");
      await expect(page.getByTestId("careful-hours").locator("li").first())
        .toHaveAttribute("title", /\$7\.46 of \$12\.00/);
      await view(page, "#model");
      const t = page.getByTestId("careful-tick");
      await expect(t).toContainText("2 / 5");
      await expect(t).toContainText("probable data errors");
      await expect(t).toContainText("3");
    });

  test("every one of the eleven is a switch; off posts a rebuilt body",
    async ({ page }) => {
      const sent: unknown[] = [];
      await page.route(SWITCH, async (r) => {
        sent.push(JSON.parse(r.request().postData() ?? "null"));
        await r.fulfill(json(200, { ok: true }));
      });
      await openConsole(page, SERVED);
      const sw = page.getByTestId("careful-comp");
      await expect(sw).toHaveCount(11);
      await expect(page.locator('[data-testid="careful-comp"][data-competition="mls"]'))
        .toHaveAttribute("data-on", "false");
      const epl = page.locator('[data-testid="careful-comp"][data-competition="epl"]');
      await expect(epl).toHaveAttribute("data-on", "true");
      await epl.click();
      await expect(epl).toHaveAttribute("data-on", "false");
      expect(sent).toEqual([{ op: "competition_off", competition: "epl" }]);
      await expect(page.getByTestId("careful-said")).toContainText("paper only");
    });

  test("a disagreement (CLV good, money losing) is flagged; a proposal is said",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const row = page.getByTestId("careful-situation");
      await expect(row).toHaveAttribute("data-flag", "true");
      await expect(row).toContainText("◆ disagree");
      await expect(row.locator("td").last()).toHaveAttribute("title", "CLV and money disagree");
      await expect(page.getByTestId("careful-events")).toContainText("PROPOSED");
      await expect(page.getByTestId("careful-grounds")).toContainText("family:SPREAD");
    });

  test("would-be results sit beside CLV; a persistent disagreement is flagged",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const rows = page.getByTestId("careful-result");
      await expect(rows).toHaveCount(2);
      const mls = rows.filter({ hasText: "mls · GAME · pre-match" });
      await expect(mls).toHaveAttribute("data-flag", "true");
      await expect(mls).toContainText("+1.40c");
      await expect(mls).toContainText("−12.50c");
      // the flag in a word and a shape; its sentence one hover away (quiet pass)
      await expect(mls).toContainText("◆ disagree");
      await expect(mls.locator("td").last()).toHaveAttribute("title", "CLV and results disagree");
      const epl = rows.filter({ hasText: "epl · GAME · in play" });
      await expect(epl).toHaveAttribute("data-flag", "false");
      await expect(epl).toContainText("+$1.42 (3)");
    });

  test("the data errors split into pre-match and in play", async ({ page }) => {
    await openConsole(page, SERVED);
    const t = page.getByTestId("careful-tick");
    await expect(t).toContainText("pre-match 2 · in play 1");
  });

  test("a backend without paper results says so, never zeros",
    async ({ page }) => {
      const { paper_results: _drop, ...older } = CAREFUL;
      void _drop;
      await openConsole(page, { ...SERVED, careful: older });
      await expect(page.getByTestId("careful-results-absent")).toContainText("not served yet");
    });

  test("a backend without the careful block says so, never zeros",
    async ({ page }) => {
      await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_RECORDED)));
      await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
      await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
      await page.goto("/ops/trading#model");
      await hydrated(page);
      await page.locator("#watch-token").fill(TOKEN);
      await expect(page.getByTestId("careful-absent")).toContainText("not served yet");
      await view(page, "#overview");
      await expect(page.getByTestId("careful-budget-absent")).toContainText("not served yet");
    });

  test("the proxy rebuilds the body and refuses anything else", () => {
    expect(parseCarefulBody({ op: "competition_off", competition: "epl" }))
      .toEqual({ ok: true, payload: { op: "competition_off", competition: "epl" } });
    expect(parseCarefulBody({ op: "promote", ground: "family:SPREAD" }))
      .toEqual({ ok: true, payload: { op: "promote", ground: "family:SPREAD" } });
    expect(parseCarefulBody({ op: "kill" }).ok).toBe(false);
    expect(parseCarefulBody({ op: "competition_off", competition: "epl", x: 1 }).ok)
      .toBe(false);
    expect(parseCarefulBody({ op: "competition_on", competition: "EPL; drop" }).ok)
      .toBe(false);
  });

  test("the in-play ladder: its signals, tiers and the day's paper bets",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const l = page.getByTestId("careful-ladder");
      await expect(l).toContainText("deep · fresh · spare");
      await expect(l).toContainText("0: paper · 1: paper · 2: $1 · 3: $2");
      await expect(l).toContainText("fresh ≤ 60 s");
      await expect(l).toContainText("2/3: 3 · 3/3: 2");
    });

  test("a backend without the ladder says so, never zeros", async ({ page }) => {
    const { inplay_ladder: _drop, ...older } = CAREFUL;
    void _drop;
    await openConsole(page, { ...SERVED, careful: older });
    await expect(page.getByTestId("careful-ladder-absent")).toContainText("not served yet");
  });

  test("the console cell reads out of 3 in play, out of 5 pre-match", () => {
    expect(carefulCell({ score: 2, size: "1", ground: "inplay_buying",
      data_error: false, score_of: 3, signals: ["deep", "fresh"] })).toEqual({
      score: 2, size: 1, ground: "inplay_buying", data_error: false,
      score_of: 3, signals: ["deep", "fresh"], sizing: null });
    expect(carefulCell({ score: 4, size: "2", ground: "family:GAME",
      data_error: false })?.score_of).toBeNull();
  });

  test("the gate-verdict grounds: seven rows, n, matches, CLV and range",
    async ({ page }) => {
      await openConsole(page, SERVED_V2);
      const rows = page.getByTestId("careful-verdict-row");
      await expect(rows).toHaveCount(7);
      await expect(rows.first()).toHaveAttribute("data-ground", "gate:pass");
      const pass = page.locator('[data-testid="careful-verdict-row"][data-ground="gate:pass"]');
      await expect(pass).toContainText("40");
      await expect(pass).toContainText("12");
      await expect(pass).toContainText("+0.61c");
      await expect(pass).toContainText("[−0.20c, +1.42c]");
      const books = page.locator('[data-testid="careful-verdict-row"][data-ground="gate:books_only"]');
      await expect(books.locator("td").first()).toHaveAttribute("title", /bookmakers cleared T/);
      // an empty ground: n 0 as served, its mean and range missing, never 0
      const none = page.locator('[data-testid="careful-verdict-row"][data-ground="near:both"]');
      await expect(none.locator("td").nth(3)).toHaveText("—");
      await expect(none.locator("td").nth(4)).toHaveText("—");
      // a verdict ground is in the table, not twice in the list
      await expect(page.locator('[data-testid="careful-ground"][data-ground="gate:pass"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="careful-ground"][data-ground="family:SPREAD"]')).toHaveCount(1);
    });

  test("the sealed in-play ground shows its counts only", async ({ page }) => {
    await openConsole(page, SERVED_V2);
    const g = page.locator(`[data-testid="careful-ground"][data-ground="${SEALED}"]`);
    await expect(g).toHaveAttribute("data-sealed", "true");
    await expect(g).toContainText("n 9 · 6 matches");
    await expect(g).toContainText("sealed");
    const panel = page.getByTestId("ops-careful");
    for (const leak of ["13.37", "4.21", "22.53", "17.77", "2.47"]) {
      await expect(panel).not.toContainText(leak);
    }
  });

  test("sizing: shadow with live locked in the header, its tick and knobs",
    async ({ page }) => {
      await openConsole(page, SERVED_V2);
      await expect(page.getByTestId("careful-sizing-mode")).toHaveText("Sizing: shadow (live locked)");
      const s = page.getByTestId("careful-sizing");
      await expect(s).toContainText("shadow");
      await expect(s).toContainText("locked");
      await expect(s).toContainText("7");
      await expect(s).toContainText("zero 4 · fee drag 1 · below tier 3");
      await expect(s).toContainText("kelly 5 · tier 2");
      await expect(page.getByTestId("careful-sizing-knobs")).toContainText("SIZING_KELLY_FRACTION");
    });

  test("a backend without verdicts or sizing says so, never zeros",
    async ({ page }) => {
      await openConsole(page, SERVED);
      await expect(page.getByTestId("careful-verdict-absent")).toContainText("not served yet");
      await expect(page.getByTestId("careful-sizing-absent")).toContainText("not served yet");
      await expect(page.getByTestId("careful-sizing-mode")).toHaveText("Sizing: not served yet");
    });

  test("the console cell and the ledger carry the shadow size", () => {
    expect(carefulCell({ score: 4, size: "2", ground: "family:GAME",
      data_error: false, score_of: 5, signals: null,
      sizing: "⅛K on lb 0.31¢ → $0.42 (tier $2)" })?.sizing).toBe(
      "⅛K on lb 0.31¢ → $0.42 (tier $2)");
    expect(carefulWords({ score: 4, size_dollars: 2, worst_dollars: 1.76,
      ground: "family:GAME", shadow_size: "⅛K on lb 0.31¢ → $0.42 (tier $2)" })).toBe(
      "confidence 4/5 · size $2 (worst case $1.76) · family:GAME · shadow size ⅛K on lb 0.31¢ → $0.42 (tier $2)");
  });

  test("the ledger says an in-play order's ladder", () => {
    expect(carefulWords({ score: 2, size_dollars: 1, worst_dollars: 0.68,
      ground: "inplay_buying", score_of: 3, signals: ["deep", "fresh"] })).toBe(
      "confidence 2/3 (deep, fresh) · size $1 (worst case $0.68) · inplay_buying");
  });

  test("the ledger says a careful order's score, size and ground", () => {
    expect(carefulWords({ score: 4, size_dollars: 2, worst_dollars: 1.76,
      ground: "family:GAME" })).toBe(
      "confidence 4/5 · size $2 (worst case $1.76) · family:GAME");
    expect(carefulWords(null)).toBe("");
  });
});

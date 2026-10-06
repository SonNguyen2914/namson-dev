import { readFileSync } from "node:fs";
import { expect, test, type Page, type Request } from "@playwright/test";
import { hydrated } from "./operator-console";
import { LIVE, STANDIN_URL } from "./backend";

// TRADES & GROUNDS ON THE OPERATOR CONSOLE (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". What the section
// promises, each claim checked here:
//
//   - every order the trader placed, and every contract handed over to it,
//     is a row, NEWEST FIRST: time, match, contract, side, the YES-book
//     price, size, cost, phase, edge vs threshold, fill, result, P&L, why;
//   - a value the row did not record reads "not recorded" — never 0, never
//     $0.00 — and a P&L whose market has no journaled result reads
//     "unsettled";
//   - the result is the backend's journaled yes/no; won / lost is derived
//     from it and the side printed beside it, and only for a row that held
//     contracts;
//   - the why is the backend's sentence; when it sent none, one is
//     composed here from the recorded grounds AND SAID TO BE;
//   - a row opens to every ground it recorded (fair, books, model, blend,
//     learner bar, maker price, fee, edge, guards, risk, in-play reads,
//     lifecycle), each missing one named "not recorded";
//   - the summary: P&L by UTC day against the daily loss limit line, and
//     by competition, market type, phase, price bucket and edge bucket;
//   - filters go to the backend as named parameters; "Load older" follows
//     the backend's cursor; "Export CSV" downloads the loaded rows with
//     a missing value as an EMPTY cell, never 0;
//   - both spellings of prices (cents, and the journal's decimal dollars)
//     read the same;
//   - a missing route reads "not available yet"; a refusal, an error, an
//     answer that is not JSON or not an object is named;
//   - at 400 px the page does not scroll sideways, the table scrolls in its
//     own box, and an opened row's grounds stay inside that box;
//   - honest labels: experimental · unproven; "edge" is the trader's own
//     estimate at the time;
//   - the proxy sends exactly /api/admin/trading/ledger with only the named
//     filters, refuses a bad value before any backend is asked, and is a
//     read.
//
// Every UI test serves the status, the book, the candidates and the
// ledger with page.route — no backend. Values invented, tickers synthetic,
// every time derived from now. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const LEDGER = "**/api/ops/trading-ledger**";
const TOKEN = "ops-ledger-token-typed-by-a-person";

const at = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();
/** a UTC calendar day, `offset` days from today */
const day = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

const STATUS_PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v2", env: "prod", enabled: true, kill: false,
  halt: { active: false }, balance: "48.12", generated_at: at(0),
  daily_loss: { used: "1.20", limit: "10.00" },
};

const EMPTY_BOOK = {
  version: "trading-book-v1", positions: [], orders: [],
  totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
};
const EMPTY_CANDIDATES = { version: "trading-candidates-v1", rows: [] };

const RESTING = "KXBUNDESLIGAGAME-SYNTH06BAYBVB-BAY";
const EXIT = "KXMLSGAME-SYNTH03CHIVAN-VAN";
const WON = "KXEPLGAME-SYNTH01ARSWHU-ARS";
const LOST = "KXLALIGATOTAL-SYNTH02RMABAR-3";
const HANDED = "KXUEFANLGAME-SYNTH05ESPPOR-TIE";
const OLD = "KXEPLGAME-SYNTH04CHELIV-CHE";

const BRIEF_WHY = "Fair 47.2% (books 46.0% 3h old, model 49.0% w=0.25) vs "
  + "our bid 44c + 0.4c fee = edge 2.8c ≥ threshold 2c";

/** The contract both tracks built against, in CENTS for prices and edges
 *  and DOLLARS for money (no `units` block). Served in a SHUFFLED order:
 *  the page draws newest first whatever order arrives. */
const ROWS = [
  { placed_at: at(-60 * 28), competition: "laliga",
    fixture: { home: "Real Madrid", away: "Barcelona", kickoff_utc: at(-60 * 26) },
    ticker: LOST, family: "TOTAL", outcome_key: "3", contract: "Over 2.5 goals",
    side: "no", price: 61, count: 5, cost: 0.8, phase: "pre_match",
    strategy_version: "consensus-v2",
    grounds: { fair: 0.43, consensus: { prob: 0.42, age_s: 5400,
      books: ["pinnacle", "bet365"] }, model: { prob: 0.45, source: "served",
      run_age_s: 1800 }, w: 0.5, threshold: 2, maker_price: 39, fee: 0.4,
      edge: 3.6, guards: { news: "clear", anomaly: "clear" },
      risk: { passed: ["per_order_cap", "per_match_cap", "daily_loss"] },
      inplay: null },
    why: "Fair NO 61.0% (books 58.0%) vs our NO bid 39c — edge 3.6c ≥ 2c",
    fills: { count: 2, avg_price: 39, fees: 0.02, last_at: at(-60 * 27) },
    status: "cancelled", cancel_reason: "kickoff_window", result: "yes",
    pnl: -0.8 },
  { placed_at: at(-5), competition: "bundesliga",
    fixture: { home: "Bayern Munich", away: "Dortmund", kickoff_utc: at(120) },
    ticker: RESTING, family: "GAME", outcome_key: "BAY",
    contract: "Bayern Munich to win", side: "yes", price: 52, count: 3,
    cost: 1.58, phase: "pre_match", strategy_version: "consensus-v2",
    grounds: { fair: 0.55, consensus: { prob: 0.54, age_s: 1200, books: 2 },
      model: null, w: 0, threshold: 2, maker_price: 52, fee: 0.5, edge: 2.5,
      guards: { news: "clear" }, risk: { passed: ["per_order_cap"] },
      inplay: null },
    why: null,
    fills: { count: 0, avg_price: null, fees: 0, last_at: null },
    status: "resting", cancel_reason: null, result: null, pnl: null },
  { placed_at: at(-60 * 24 * 3), competition: "epl",
    fixture: { home: "Chelsea", away: "Liverpool", kickoff_utc: at(-60 * 24 * 3 + 90) },
    ticker: OLD, family: null, outcome_key: null, contract: null,
    side: "yes", price: 50, count: 2, cost: null, phase: null,
    strategy_version: null, grounds: null, why: null, fills: null,
    status: null, cancel_reason: null, result: "no", pnl: null },
  { placed_at: at(-30), competition: "mls",
    fixture: { home: "Chicago Fire", away: "Vancouver", kickoff_utc: at(-93) },
    ticker: EXIT, family: "GAME", outcome_key: "VAN",
    contract: "Vancouver to win", side: "no", price: 69, count: 2,
    cost: 0.64, phase: "protective_exit", strategy_version: "inplay-v2",
    grounds: { fair: 0.4, consensus: null, model: null, w: 0.5,
      threshold: 3, maker_price: 31, fee: 0.4, edge: 1.2,
      guards: { news: "clear", anomaly: { state: "elevated", z: 2.1 } },
      risk: { passed: ["risk_lowering"] },
      inplay: { minute: 63, p_engine: 0.4, anchor_w: 0.5,
        anchor_source: "ratings_club",
        signals: { momentum: [0.12, 0.39], xg15: [0.21, 0.64] },
        hot: true, danger: 0.22 } },
    why: "protective exit: HOT against the held YES (danger 22.0% ≥ 20.0%)",
    fills: { count: 2, avg_price: 31, fees: 0.02, last_at: at(-29) },
    status: "filled", cancel_reason: null, result: null, pnl: null },
  { placed_at: at(-60 * 24 * 2), kind: "handover", competition: "unl",
    fixture: { home: "Spain", away: "Portugal", kickoff_utc: at(-60 * 24 * 2 + 30) },
    ticker: HANDED, family: "GAME", outcome_key: "TIE", contract: "Tie",
    side: "yes", price: 27, count: 3, cost: 0.81, phase: "handed_over",
    strategy_version: null, grounds: null,
    why: "Handed over by you; the trader manages it within its limits.",
    fills: null, status: "handed_over", cancel_reason: null, result: "no",
    pnl: -0.81 },
  { placed_at: at(-60 * 26), competition: "epl",
    fixture: { home: "Arsenal", away: "West Ham", kickoff_utc: at(-60 * 24) },
    ticker: WON, family: "GAME", outcome_key: "ARS", contract: "Arsenal to win",
    side: "yes", price: 44, count: 4, cost: 1.79, phase: "pre_match",
    strategy_version: "consensus-v2",
    grounds: { fair: 0.472, consensus: { prob: 0.46, age_s: 10800,
      books: ["pinnacle", "bet365", "williamhill"] },
      model: { prob: 0.49, source: "served", run_age_s: 2400 }, w: 0.25,
      threshold: 2, maker_price: 44, fee: 0.4, edge: 2.8,
      guards: { news: "clear", anomaly: { state: "clear", score: 0.12 } },
      risk: { passed: ["per_order_cap", "per_match_cap", "daily_loss",
        "bankroll"] }, inplay: null },
    why: BRIEF_WHY,
    fills: { count: 4, avg_price: 44, fees: 0.03, last_at: at(-60 * 25) },
    status: "filled", cancel_reason: null, result: "yes", pnl: 2.21 },
];

const NEWEST_FIRST = [RESTING, EXIT, WON, LOST, HANDED, OLD];

const g = (placed: number, wins: number, losses: number, unsettled: number,
           cost: number | null, pnl: number | null) =>
  ({ placed, wins, losses, unsettled, cost, pnl });

const SUMMARY = {
  totals: { placed: 5, handed_over: 1, filled: 3, wins: 1, losses: 2,
    unsettled: 3, cost: 5.62, fees: 0.07, pnl: 0.6 },
  by_day: [
    { day: day(-3), pnl: -10.4, placed: 1, wins: 0, losses: 1, unsettled: 0 },
    { day: day(0), pnl: 0, placed: 2, wins: 0, losses: 0, unsettled: 2 },
    { day: day(-1), pnl: 1.41, placed: 2, wins: 1, losses: 1, unsettled: 0 },
  ],
  by_competition: { epl: g(2, 1, 0, 0, 1.79, 2.21), laliga: g(1, 0, 1, 0, 0.8, -0.8),
    mls: g(1, 0, 0, 1, 0.64, null), bundesliga: g(1, 0, 0, 1, 1.58, null),
    unl: g(1, 0, 1, 0, 0.81, -0.81) },
  by_family: [{ key: "GAME", ...g(5, 1, 1, 2, 4.82, 1.4) },
    { key: "TOTAL", ...g(1, 0, 1, 0, 0.8, -0.8) }],
  by_phase: { pre_match: g(3, 1, 1, 1, 4.17, 1.41),
    protective_exit: g(1, 0, 0, 1, 0.64, null),
    handed_over: g(1, 0, 1, 0, 0.81, -0.81) },
  by_price_bucket: [
    { bucket: "0-20", ...g(0, 0, 0, 0, null, null) },
    { bucket: "20-40", ...g(1, 0, 1, 0, 0.81, -0.81) },
    { bucket: "40-60", ...g(3, 1, 0, 1, 3.37, 2.21) },
    { bucket: "60-80", ...g(2, 0, 1, 1, 1.44, -0.8) },
    { bucket: "80-100", ...g(0, 0, 0, 0, null, null) },
  ],
  by_edge_bucket: { "0-2c": g(1, 0, 0, 1, 0.64, null),
    "2-4c": g(3, 1, 1, 1, 4.17, 1.41) },
  daily_limit: 10,
};

const LEDGER_PAYLOAD = {
  version: "trading-ledger-v1", label: "experimental, unproven",
  generated_at: at(0), rows: ROWS, summary: SUMMARY, next_cursor: null,
};

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Answer = { status: number; body?: unknown; raw?: string };

/** Serve the status, an empty book and candidates, and the ledger (the
 *  answer `ledger` gives for each read's URL); open the console and type
 *  the token. Returns every ledger read, as it left. */
async function openConsole(page: Page,
                           ledger: (url: URL, n: number) => Answer,
                           status: unknown = STATUS_PAYLOAD) {
  const reads: Request[] = [];
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, EMPTY_BOOK)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, EMPTY_CANDIDATES)));
  await page.route(LEDGER, (r) => {
    reads.push(r.request());
    const a = ledger(new URL(r.request().url()), reads.length);
    return a.raw !== undefined
      ? r.fulfill({ status: a.status, contentType: "text/plain", body: a.raw })
      : r.fulfill(json(a.status, a.body));
  });
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-ledger")).toBeVisible();
  return reads;
}

const serveOk = (body: unknown = LEDGER_PAYLOAD) => () => ({ status: 200, body });

const row = (page: Page, ticker: string) =>
  page.locator(`[data-testid="ledger-row"][data-ticker="${ticker}"]`);
const cell = (page: Page, ticker: string, id: string) =>
  row(page, ticker).getByTestId(`ledger-${id}`);

/** the grounds panel of a row, opened */
async function open(page: Page, ticker: string) {
  await row(page, ticker).getByTestId("ledger-expand").click();
  const panel = page.locator(
    `[data-testid="ledger-grounds"][data-ticker="${ticker}"]`);
  await expect(panel).toBeVisible();
  return panel;
}
const ground = (panel: ReturnType<Page["locator"]>, field: string) =>
  panel.locator(`[data-testid="ledger-ground"][data-field="${field}"]`);

test.describe("trades & grounds on the console", () => {
  test("every order is a row, newest first, with its numbers; a value not "
    + "recorded says so, never 0", async ({ page }) => {
      const reads = await openConsole(page, serveOk());
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      expect(reads[0].method()).toBe("GET");
      expect(reads[0].headers()["x-admin-token"]).toBe(TOKEN);
      // NEWEST FIRST, whatever order the rows arrived in
      expect(await page.getByTestId("ledger-row").evaluateAll(
        (els) => els.map((e) => e.getAttribute("data-ticker"))))
        .toEqual(NEWEST_FIRST);

      // the won EPL order, number by number
      for (const [id, text] of [
        ["match", "Arsenal v West Ham"], ["match", "Premier League"],
        ["contract", "Arsenal to win"], ["contract", WON],
        ["contract", "match result · ARS"], ["side", "YES"],
        ["price", "44¢"], ["size", "4"], ["cost", "$1.79"],
        ["phase", "pre-match"], ["edge", "+2.8¢ vs 2¢"],
        ["fill", "filled 4/4 @ 44¢"], ["result", "YES · won"],
        ["pnl", "+$2.21"], ["why", BRIEF_WHY],
      ] as const) {
        await expect(cell(page, WON, id), `${id}: ${text}`).toContainText(text);
      }
      await expect(cell(page, WON, "edge")).toHaveAttribute("data-clears", "true");
      await expect(row(page, WON)).toHaveAttribute("data-result", "won");
      await expect(row(page, WON)).toHaveAttribute("data-placed-at", ROWS[5].placed_at);

      // the lost NO: the YES-book price with the NO price derived from it,
      // a partial fill then a cancel, the market settled YES
      await expect(cell(page, LOST, "side")).toHaveText("NO");
      await expect(cell(page, LOST, "price")).toContainText("61¢");
      await expect(cell(page, LOST, "price")).toContainText("NO at 39¢");
      await expect(cell(page, LOST, "fill")).toContainText("cancelled 2/5 @ 39¢");
      await expect(cell(page, LOST, "fill")).toContainText("kickoff_window");
      await expect(cell(page, LOST, "result")).toHaveText("YES · lost");
      await expect(cell(page, LOST, "pnl")).toHaveText("−$0.80");
      await expect(row(page, LOST)).toHaveAttribute("data-result", "lost");

      // the protective exit, in play and unsettled: said, not $0.00
      await expect(cell(page, EXIT, "phase")).toContainText("protective exit");
      await expect(cell(page, EXIT, "phase")).toContainText("63′");
      await expect(cell(page, EXIT, "edge")).toContainText("+1.2¢ vs 3¢");
      await expect(cell(page, EXIT, "edge")).not.toHaveAttribute("data-clears", /.*/);
      await expect(cell(page, EXIT, "result")).toHaveText("unsettled");
      await expect(cell(page, EXIT, "pnl")).toHaveText("unsettled");
      await expect(row(page, EXIT)).toHaveAttribute("data-result", "unsettled");

      // the handed-over contract is its own kind of row
      await expect(row(page, HANDED)).toHaveAttribute("data-kind", "handover");
      await expect(cell(page, HANDED, "phase")).toContainText("handed over");
      await expect(cell(page, HANDED, "result")).toHaveText("NO · lost");
      await expect(cell(page, HANDED, "pnl")).toHaveText("−$0.81");

      // the resting order: no fill yet, unsettled, and a why COMPOSED here
      // from its grounds — and said to be
      await expect(cell(page, RESTING, "fill")).toContainText("resting 0/3");
      await expect(cell(page, RESTING, "pnl")).toHaveText("unsettled");
      await expect(cell(page, RESTING, "why")).toContainText(
        "Fair 55.0% (books 54.0% 20m old, w=0.00) vs our YES bid 52¢ + 0.5¢ "
        + "fee = edge 2.5¢ ≥ threshold 2¢");
      await expect(cell(page, RESTING, "why"))
        .toContainText("composed here from the recorded grounds");
      await expect(cell(page, WON, "why"))
        .not.toContainText("composed here");

      // AN OLD ROW THAT RECORDED NOTHING: every missing value says so, and
      // not one of them is drawn as a zero
      for (const id of ["contract", "cost", "phase", "edge", "fill", "pnl", "why"]) {
        await expect(cell(page, OLD, id), id).toContainText("not recorded");
        await expect(cell(page, OLD, id), id).not.toHaveText(/^\s*(\$?0(\.00)?¢?)\s*$/);
      }
      await expect(cell(page, OLD, "contract")).toContainText(OLD);
      // settled NO, but with no fill on record the page does not say won
      // or lost for it
      await expect(cell(page, OLD, "result")).toHaveText("NO");
      await expect(row(page, OLD)).toHaveAttribute("data-result", "settled");

      await expect(page.getByTestId("ledger-count"))
        .toContainText("6 rows · newest first");
    });

  test("a row opens to every ground it recorded; an old row names each one "
    + "it did not", async ({ page }) => {
      await openConsole(page, serveOk());
      const won = await open(page, WON);
      await expect(row(page, WON).getByTestId("ledger-expand"))
        .toHaveAttribute("aria-expanded", "true");
      for (const [field, text] of [
        ["fair", "47.2%"],
        ["consensus", "46.0%"], ["consensus", "3h old"],
        ["consensus", "3 books (pinnacle, bet365, williamhill)"],
        ["model", "49.0%"], ["model", "our served model"],
        ["model", "run 40m old"],
        ["w", "0.25"], ["threshold", "2¢"], ["maker_price", "44¢"],
        ["fee", "0.4¢"], ["edge", "+2.8¢"],
        ["guards", "news: clear"], ["guards", "anomaly: state clear · score 0.12"],
        ["risk", "passed: per_order_cap, per_match_cap, daily_loss, bankroll"],
        ["inplay", "pre-match order"],
        ["fills", "4 filled"], ["fills", "@ 44¢"], ["fills", "fees $0.03"],
        ["status", "filled"], ["result", "YES"], ["pnl", "+$2.21"],
        ["strategy_version", "consensus-v2"], ["ticker", WON],
        ["placed_at", ROWS[5].placed_at],
      ] as const) {
        await expect(ground(won, field), `${field}: ${text}`).toContainText(text);
      }

      const exit = await open(page, EXIT);
      for (const [field, text] of [
        ["inplay", "minute 63′"], ["inplay", "engine 40.0%"],
        ["inplay", "anchor w 0.50 · ratings model, club (unvalidated)"],
        ["inplay", "momentum: 0.12, 0.39"], ["inplay", "HOT yes"],
        ["inplay", "danger 22.0%"],
        ["guards", "anomaly: state elevated · z 2.1"],
        ["consensus", "not recorded"], ["model", "not recorded"],
      ] as const) {
        await expect(ground(exit, field), `${field}: ${text}`).toContainText(text);
      }

      const old = await open(page, OLD);
      await expect(old).toContainText("no grounds were recorded on this row");
      for (const field of ["fair", "consensus", "model", "w", "threshold",
        "maker_price", "fee", "edge", "guards", "risk", "fills", "status",
        "pnl", "strategy_version", "cost"]) {
        await expect(ground(old, field), field).toContainText("not recorded");
        await expect(ground(old, field), field).not.toContainText(/(^|\s)\$?0(\.0+)?(¢|%)?(\s|$)/);
      }

      // a second click closes it
      await row(page, WON).getByTestId("ledger-expand").click();
      await expect(page.locator(
        `[data-testid="ledger-grounds"][data-ticker="${WON}"]`)).toHaveCount(0);
    });

  test("the summary: P&L by UTC day against the daily loss limit, and by "
    + "competition, market type, phase, price and edge", async ({ page }) => {
      await openConsole(page, serveOk());
      const totals = page.getByTestId("ledger-totals");
      for (const [k, v] of [["placed", "5"], ["handed_over", "1"],
        ["wins", "1"], ["losses", "2"], ["unsettled", "3"],
        ["cost", "$5.62"], ["pnl", "+$0.60"]] as const) {
        await expect(totals.getByTestId(`ledger-total-${k}`), k).toContainText(v);
      }

      // by day, newest first, against the line
      await expect(page.getByTestId("ledger-day-limit"))
        .toContainText("daily loss limit $10.00");
      const days = page.getByTestId("ledger-day");
      await expect(days).toHaveCount(3);
      expect(await days.evaluateAll((els) => els.map((e) => e.getAttribute("data-day"))))
        .toEqual([day(0), day(-1), day(-3)]);
      const today = page.locator(`[data-testid="ledger-day"][data-day="${day(0)}"]`);
      // a real zero, SENT, is drawn as one
      await expect(today).toContainText("$0.00");
      await expect(today).toContainText("0–0–2");
      const bad = page.locator(`[data-testid="ledger-day"][data-day="${day(-3)}"]`);
      await expect(bad).toContainText("−$10.40");
      await expect(bad).toHaveAttribute("data-limit-hit", "true");
      await expect(bad).toContainText("limit reached");
      await expect(page.locator(`[data-testid="ledger-day"][data-day="${day(-1)}"]`))
        .not.toHaveAttribute("data-limit-hit", /.*/);
      // the limit line is drawn on every day's bar, at the same place
      const lines = page.getByTestId("ledger-limit-line");
      await expect(lines).toHaveCount(3);
      const xs = await lines.evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().left)));
      expect(new Set(xs).size).toBe(1);

      const group = (table: string, key: string) => page.locator(
        `[data-testid="ledger-by-${table}"] [data-testid="ledger-group-row"][data-key="${key}"]`);
      await expect(group("competition", "epl")).toContainText("Premier League");
      await expect(group("competition", "epl")).toContainText("+$2.21");
      await expect(group("competition", "mls")).toContainText("not recorded");
      await expect(group("family", "GAME")).toContainText("match result");
      await expect(group("family", "TOTAL")).toContainText("total goals");
      await expect(group("phase", "protective_exit")).toContainText("protective exit");
      await expect(group("phase", "handed_over")).toContainText("handed over");
      // price buckets in price order, labelled in cents
      expect(await page.locator('[data-testid="ledger-by-price"] [data-testid="ledger-group-row"]')
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-key"))))
        .toEqual(["0-20", "20-40", "40-60", "60-80", "80-100"]);
      await expect(group("price", "40-60")).toContainText("40–60¢");
      await expect(group("price", "0-20")).toContainText("not recorded");
      await expect(group("edge", "2-4c")).toContainText("+$1.41");
    });

  test("with no limit in the summary, the status route's daily loss limit "
    + "is used and named", async ({ page }) => {
      const { daily_limit: _drop, ...rest } = SUMMARY;
      void _drop;
      await openConsole(page, serveOk({ ...LEDGER_PAYLOAD, summary: rest }));
      await expect(page.getByTestId("ledger-day-limit"))
        .toContainText("daily loss limit $10.00 (from the status route)");
    });

  test("filters go to the backend as named parameters; clearing them asks "
    + "for everything again", async ({ page }) => {
      const reads = await openConsole(page, (url) => ({ status: 200, body: {
        ...LEDGER_PAYLOAD,
        rows: ROWS.filter((r) => (!url.searchParams.get("competition")
          || r.competition === url.searchParams.get("competition"))
          && (!url.searchParams.get("phase")
            || r.phase === url.searchParams.get("phase"))) } }));
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      expect(new URL(reads[0].url()).search).toBe("");

      await page.getByTestId("ledger-filter-competition").selectOption("epl");
      await expect(page.getByTestId("ledger-row")).toHaveCount(2);
      let last = new URL(reads.at(-1)!.url());
      expect(last.searchParams.get("competition")).toBe("epl");

      await page.getByTestId("ledger-filter-phase").selectOption("pre_match");
      await expect(page.getByTestId("ledger-row")).toHaveCount(1);
      await expect(row(page, WON)).toHaveCount(1);
      last = new URL(reads.at(-1)!.url());
      expect(last.searchParams.get("phase")).toBe("pre_match");
      expect(last.searchParams.get("competition")).toBe("epl");

      await page.getByTestId("ledger-filter-since").fill(day(-2));
      await expect.poll(() => new URL(reads.at(-1)!.url()).searchParams.get("since"))
        .toBe(`${day(-2)}T00:00:00Z`);
      await page.getByTestId("ledger-filter-until").fill(day(-1));
      // UNTIL THE END OF THAT UTC DAY: the next day's midnight
      await expect.poll(() => new URL(reads.at(-1)!.url()).searchParams.get("until"))
        .toBe(`${day(0)}T00:00:00Z`);

      await page.getByTestId("ledger-filter-clear").click();
      await expect.poll(() => new URL(reads.at(-1)!.url()).search).toBe("");
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      for (const r of reads) {
        expect(r.headers()["x-admin-token"]).toBe(TOKEN);
        for (const k of new URL(r.url()).searchParams.keys()) {
          expect(["since", "until", "competition", "phase", "cursor", "limit"]).toContain(k);
        }
      }
    });

  test("'Load older' follows the backend's cursor and appends; the end is "
    + "said", async ({ page }) => {
      const older = { ...ROWS[2], ticker: "KXEPLGAME-SYNTH07TOTNEW-TOT",
        placed_at: at(-60 * 24 * 6), contract: "Spurs to win" };
      const reads = await openConsole(page, (url) => ({ status: 200,
        body: url.searchParams.get("cursor") === "c2.page-2"
          ? { ...LEDGER_PAYLOAD, rows: [older], next_cursor: null }
          : { ...LEDGER_PAYLOAD, next_cursor: "c2.page-2" } }));
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      await expect(page.getByTestId("ledger-count")).toContainText("more on the backend");
      await page.getByTestId("ledger-more").click();
      await expect(page.getByTestId("ledger-row")).toHaveCount(7);
      expect(new URL(reads.at(-1)!.url()).searchParams.get("cursor")).toBe("c2.page-2");
      await expect(page.getByTestId("ledger-row").last())
        .toHaveAttribute("data-ticker", older.ticker);
      await expect(page.getByTestId("ledger-more")).toHaveCount(0);
      await expect(page.getByTestId("ledger-count")).toContainText("7 rows · newest first · all loaded");
    });

  test("an older page that fails is named, and the rows already read stay",
    async ({ page }) => {
      await openConsole(page, (url) => url.searchParams.get("cursor")
        ? { status: 500, body: { detail: "the journal read fell over" } }
        : { status: 200, body: { ...LEDGER_PAYLOAD, next_cursor: "c2.page-2" } });
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      await page.getByTestId("ledger-more").click();
      await expect(page.getByTestId("ledger-more-error")).toHaveText(
        "the older page could not be read — HTTP 500 — the journal read fell over");
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      await expect(page.getByTestId("ledger-more")).toBeEnabled();
    });

  test("Export CSV downloads the loaded rows; a missing value is an empty "
    + "cell, never 0", async ({ page }) => {
      await openConsole(page, serveOk());
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByTestId("ledger-export").click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/^trivela-trades-\d{8}-\d{4}Z\.csv$/);
      const text = readFileSync((await download.path())!, "utf8");
      // a BOM first, so a spreadsheet reads the file as UTF-8
      expect(text.charCodeAt(0)).toBe(0xfeff);
      const table = parseCsv(text.slice(1));
      const head = table[0];
      for (const c of ["placed_at", "kind", "competition", "home", "away",
        "ticker", "contract", "side", "price_yes_cents", "count",
        "cost_dollars", "phase", "fair", "consensus_prob", "model_prob", "w",
        "threshold_cents", "maker_price_cents", "fee_cents", "edge_cents",
        "guards", "risk", "inplay", "why", "why_source", "fills_count",
        "status", "cancel_reason", "result", "pnl_dollars"]) {
        expect(head, c).toContain(c);
      }
      const body = table.slice(1);
      expect(body.map((r) => r[head.indexOf("ticker")])).toEqual(NEWEST_FIRST);
      const rec = (t: string) => Object.fromEntries(
        body.find((r) => r[head.indexOf("ticker")] === t)!.map((v, i) => [head[i], v]));
      const won = rec(WON);
      expect(won.contract).toBe("Arsenal to win");
      expect(won.price_yes_cents).toBe("44");
      expect(won.cost_dollars).toBe("1.79");
      expect(won.pnl_dollars).toBe("2.21");
      expect(won.result).toBe("yes");
      expect(won.why).toBe(BRIEF_WHY);
      expect(won.why_source).toBe("backend");
      expect(JSON.parse(won.guards)).toEqual(ROWS[5].grounds!.guards);
      expect(rec(LOST).pnl_dollars).toBe("-0.8");
      expect(rec(RESTING).why_source).toBe("composed");
      // THE OLD ROW: every missing value is an empty cell — not 0
      const old = rec(OLD);
      for (const c of ["cost_dollars", "phase", "fair", "edge_cents",
        "fills_count", "pnl_dollars", "why", "contract", "strategy_version"]) {
        expect(old[c], c).toBe("");
      }
      expect(old.result).toBe("no");
      await expect(page.getByTestId("ops-ledger"))
        .toContainText("blank cell = not recorded");
    });

  test("the journal's decimal-dollar spelling reads the same as cents, and a "
    + "stated unit wins", async ({ page }) => {
      const dollars = { ...ROWS[5], price: "0.44", cost: "1.79", pnl: "2.21",
        grounds: { ...ROWS[5].grounds!, maker_price: "0.44", fee: "0.004",
          edge: "0.028", threshold: "0.02" },
        fills: { count: 4, avg_price: "0.44", fees: "0.03", last_at: at(-60 * 25) } };
      await openConsole(page, serveOk({ ...LEDGER_PAYLOAD, rows: [dollars] }));
      await expect(cell(page, WON, "price")).toContainText("44¢");
      await expect(cell(page, WON, "edge")).toContainText("+2.8¢ vs 2¢");
      await expect(cell(page, WON, "fill")).toContainText("filled 4/4 @ 44¢");
      await expect(cell(page, WON, "cost")).toHaveText("$1.79");
      const panel = await open(page, WON);
      await expect(ground(panel, "fee")).toContainText("0.4¢");
      await expect(ground(panel, "maker_price")).toContainText("44¢");
    });

  test("a stated `units` block wins over the magnitude rule", async ({ page }) => {
    const r = { ...ROWS[5], grounds: { ...ROWS[5].grounds!, edge: 0.5,
      threshold: 0.4, fee: 0.2 } };
    await openConsole(page, serveOk({ ...LEDGER_PAYLOAD, rows: [r],
      units: { prices: "cents", edges: "cents", money: "dollars" } }));
    await expect(cell(page, WON, "edge")).toContainText("+0.5¢ vs 0.4¢");
  });

  test("an empty window says so; filtered to nothing says that",
    async ({ page }) => {
      await openConsole(page, () => ({ status: 200, body: {
        ...LEDGER_PAYLOAD, rows: [], summary: null } }));
      await expect(page.getByTestId("ledger-none"))
        .toHaveText("No orders on record in this window.");
      await expect(page.getByTestId("ledger-summary-absent"))
        .toContainText("summary not sent");
      await page.getByTestId("ledger-filter-competition").selectOption("mls");
      await expect(page.getByTestId("ledger-none"))
        .toHaveText("No orders match these filters.");
    });

  for (const [what, answer, words] of [
    ["a refusal", { status: 403, body: { detail: "operator credentials required" } },
      "token rejected — the backend refused it (operator credentials required)"],
    ["a server error", { status: 500, body: { detail: "the journal read fell over" } },
      "the ledger read failed (HTTP 500) — the journal read fell over"],
    ["a 200 that is not JSON", { status: 200, raw: "<html>gateway</html>" },
      "the ledger read failed (HTTP 200) — the answer was not JSON"],
    ["a 200 that is not an object", { status: 200, body: [] },
      "the ledger read failed (HTTP 200) — the answer was not an object"],
    ["a 200 with no rows list", { status: 200, body: { summary: SUMMARY } },
      "the ledger read failed (HTTP 200) — the answer carried no rows list"],
  ] as [string, Answer, string][]) {
    test(`${what} is named, never drawn as an empty ledger`, async ({ page }) => {
      await openConsole(page, () => answer);
      await expect(page.getByTestId("ledger-error")).toContainText(words);
      await expect(page.getByTestId("ledger-none")).toHaveCount(0);
      await expect(page.getByTestId("ledger-table")).toHaveCount(0);
      await expect(page.getByTestId("ledger-export")).toHaveCount(0);
    });
  }

  test("a backend without the ledger route: 'not available yet', and the "
    + "console stands", async ({ page }) => {
      await openConsole(page, () => ({ status: 404, body: { available: false } }));
      await expect(page.getByTestId("ledger-unavailable"))
        .toContainText("Trades & grounds not available yet");
      await expect(page.getByTestId("ledger-table")).toHaveCount(0);
      await expect(page.getByTestId("ops-strip")).toBeVisible();
      await expect(page.getByTestId("ops-book")).toBeVisible();
    });

  test("honest labels: experimental, unproven; the edge is the trader's own "
    + "estimate; your own bets are not here", async ({ page }) => {
      await openConsole(page, serveOk());
      const s = page.getByTestId("ops-ledger");
      await expect(s).toContainText("experimental · unproven");
      await expect(s).toContainText("the trader's own estimate at the time");
      await expect(s).toContainText("not evidence of an edge");
      await expect(s).toContainText("your own manual bets are not here");
      await expect(s).not.toContainText(/\bTAKE\b/);
    });

  test("at 400 px the table scrolls in its own box, the page does not "
    + "scroll sideways, and an opened row's grounds stay in view",
    async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 900 });
      await openConsole(page, serveOk());
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      await open(page, WON);
      const m = await page.evaluate((t) => {
        const table = document.querySelector('[data-testid="ledger-table"]')!;
        const box = table.parentElement!;
        const panel = document.querySelector(
          `[data-testid="ledger-grounds"][data-ticker="${t}"] [data-testid="ledger-grounds-body"]`)!;
        const b = box.getBoundingClientRect();
        const p = panel.getBoundingClientRect();
        return {
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
          table: table.scrollWidth, box: box.clientWidth,
          panelLeft: p.left, panelRight: p.right, boxLeft: b.left, boxRight: b.right,
        };
      }, WON);
      expect(m.page, "no sideways page scroll").toBeLessThanOrEqual(m.view);
      expect(m.table, "the table is wider than its box, so the box scrolls")
        .toBeGreaterThan(m.box);
      expect(m.panelLeft, "the grounds start inside the box").toBeGreaterThanOrEqual(m.boxLeft - 1);
      expect(m.panelRight, "the grounds end inside the box").toBeLessThanOrEqual(m.boxRight + 1);
    });
});

/** A small RFC 4180 reader: quoted fields, doubled quotes, newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let rowOut: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { rowOut.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      rowOut.push(field); rows.push(rowOut); rowOut = []; field = "";
    } else field += c;
  }
  if (field !== "" || rowOut.length) { rowOut.push(field); rows.push(rowOut); }
  return rows;
}

// ---------------------------------------------- the proxy itself

test.describe("the ledger proxy", () => {
  test.skip(LIVE, "reads the hermetic stand-in's log — hermetic runs only");

  async function ledgerHits(request: import("@playwright/test").APIRequestContext,
                            since: string) {
    const r = await request.get(`${STANDIN_URL}/__standin/log`);
    expect(r.ok(), "the stand-in's log is readable").toBe(true);
    const log = await r.json() as { requests: { at: string; method: string; url: string }[] };
    // other workers' consoles read the bare path through the shared
    // stand-in; this file's own reads are the ones that carry a query
    return log.requests.filter((e) => e.at >= since
      && e.url.startsWith("/api/admin/trading/ledger?"));
  }

  test("a GET reaches exactly /api/admin/trading/ledger with only the named "
    + "filters, rebuilt — any other key is dropped", async ({ request }) => {
      const started = new Date().toISOString();
      const since = `${day(-7)}T00:00:00Z`;
      const r = await request.get("/api/ops/trading-ledger", {
        params: { phase: "pre_match", competition: "epl", since,
          cursor: "c2.page-2", limit: "50", path: "../mls/risk",
          token: "nope" },
        headers: { "x-admin-token": "proxy-test-token" },
      });
      // the stand-in's named 503, passed through unedited
      expect(r.status()).toBe(503);
      expect(r.headers()["cache-control"]).toBe("private, no-store");
      const hits = await ledgerHits(request, started);
      expect(hits.map((e) => e.method)).toEqual(["GET"]);
      const u = new URL(hits[0].url, "http://standin.invalid");
      expect(u.pathname).toBe("/api/admin/trading/ledger");
      expect([...u.searchParams.entries()]).toEqual([
        ["since", since], ["competition", "epl"], ["phase", "pre_match"],
        ["cursor", "c2.page-2"], ["limit", "50"]]);
    });

  test("a bad filter value is refused 400 invalid_parameter, named, and "
    + "never leaves the proxy", async ({ request }) => {
      const started = new Date().toISOString();
      const bad: [string, string][] = [
        ["since", "yesterday"], ["until", "2026-13-45"],
        ["since", "../mls/risk"], ["competition", "../mls/risk"],
        ["competition", "EPL"], ["phase", "pre match"], ["phase", "1x"],
        ["cursor", "../../admin"], ["cursor", "a/b"], ["cursor", "x#y"],
        ["limit", "0"], ["limit", "501"], ["limit", "1.5"], ["limit", "-3"],
      ];
      for (const [k, v] of bad) {
        const r = await request.get(
          `/api/ops/trading-ledger?${k}=${encodeURIComponent(v)}`,
          { headers: { "x-admin-token": "proxy-test-token" } });
        expect(r.status(), `${k}=${v}`).toBe(400);
        const j = await r.json();
        expect(j.reason, `${k}=${v}`).toBe("invalid_parameter");
        expect(j.parameter, `${k}=${v}`).toBe(k);
        expect(r.headers()["cache-control"]).toBe("private, no-store");
      }
      // a repeated filter is refused rather than half of it chosen
      const twice = await request.get(
        "/api/ops/trading-ledger?competition=epl&competition=mls");
      expect(twice.status()).toBe(400);
      expect((await twice.json()).parameter).toBe("competition");
      expect(await ledgerHits(request, started)).toEqual([]);
    });

  test("the ledger is a read: other verbs are 405, and nothing is cached",
    async ({ request }) => {
      for (const verb of ["post", "put", "delete"] as const) {
        const r = await request[verb]("/api/ops/trading-ledger");
        expect(r.status(), verb).toBe(405);
        expect(r.headers()["allow"], verb).toBe("GET");
        expect(r.headers()["cache-control"], verb).toBe("private, no-store");
      }
    });
});

import { expect, test, type Page, type Request } from "@playwright/test";
import { LIVE, STANDIN_URL } from "./backend";

// THE TRADER'S CANDIDATES ON THE OPERATOR CONSOLE (2026-10-05).
//
// Son, 2026-10-03: "also let me see the candidate too, transparency is
// also the purpose of the console". What the section promises, each claim
// checked here:
//
//   - every market the snapshot holds is a row, with our model, the
//     consensus, the blend weight, the fair price, both books, the maker
//     price per side, the edge per side against the bar, the in-play
//     reads, and the decision: placed (side · count @ price) or not, the
//     reason in PLAIN WORDS — the backend's own words first, this page's
//     table of known codes second, and an unknown code drawn as itself
//     with a note, never a blank;
//   - placed rows are highlighted (a box-shadow the others lack);
//   - filters by competition and by decision narrow the table and HOLD
//     across a refresh;
//   - every competition is named: the payload's per-competition counts
//     (every competition a row), its `scope`, or the eleven focus
//     competitions — one with no row says "none in this snapshot", never 0;
//   - an empty `rows` is explained: a stale snapshot, no snapshot, rows
//     withheld because their markets stopped trading — and only a fresh
//     tick that considered nothing reads "considered no markets";
//   - a missing route reads "not available yet", a refusal / an error / an
//     answer that is not JSON is named;
//   - both spellings of the contract are read (the route's
//     trading-candidates-v1 in cents with `units`, and the brief's), and a
//     payload that says its prices are dollars is converted;
//   - at 400 px the page does not scroll sideways and the decision is on
//     screen;
//   - the proxy is a GET to exactly /api/admin/trading/candidates: a query
//     never crosses, and other verbs are 405.
//
// Every UI test serves the status, the book and the candidates with
// page.route — no backend. The main payload follows the route's
// trading-candidates-v1 (backend src/trading/console.py, built the same
// day); values invented, dates derived from now. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const TOKEN = "ops-candidates-token-typed-by-a-person";

const at = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();

const STATUS_PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v0", env: "prod", enabled: true, kill: false,
  halt: { active: false }, balance: "48.12", generated_at: at(0),
};

const EMPTY_BOOK = {
  version: "trading-book-v1", positions: [], orders: [],
  totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
};

const PLACED_EPL = "KXEPLGAME-SYNTH01ARSWHU-ARS";
const WORDS_LALIGA = "KXLALIGATOTAL-SYNTH02RMABAR-3";
const KNOWN_CODE_MLS = "KXMLSGAME-SYNTH03LAFCSEA-LAFC";
const UNKNOWN_CODE_UNL = "KXUEFANLGAME-SYNTH04ESPPOR-ESP";
const INPLAY_MLS = "KXMLSGAME-SYNTH05CHIVAN-VAN";
const HELD_BACK_BUND = "KXBUNDESLIGAGAME-SYNTH06BAYBVB-BAY";

const decision = (o: Record<string, unknown>) => ({
  action: "skipped", side: null, price_cents: null, count: null,
  reason: null, detail: null, words: null, ...o,
});

/** trading-candidates-v1 rows: prices, edges and threshold in CENTS */
const ROWS = [
  { ticker: PLACED_EPL, title: "Arsenal vs West Ham — Arsenal",
    competition: "epl", family: "GAME", phase: "pre_match",
    kickoff_utc: at(95), minute: null, p_model: 0.54, p_consensus: 0.51,
    w: 0.5, fair: 0.525, fair_method: "blend", yes_bid: 47, yes_ask: 50,
    no_bid: 50, no_ask: 53, maker_yes: 48, maker_no: 51, edge_yes: 2.62,
    edge_no: -4.4, edge_basis: "maker", threshold: 1.5, inplay: null,
    decision: decision({ action: "placed", side: "yes", price_cents: 48,
      count: 4, words: "Placed: yes at 48c x 4, resting as a maker order." }),
    minutes_to_kickoff: 95 },
  { ticker: WORDS_LALIGA, title: "Real Madrid vs Barcelona — over 2.5",
    competition: "laliga", family: "TOTAL", phase: "pre_match",
    kickoff_utc: at(140), minute: null, p_model: null, p_consensus: 0.602,
    w: 0, fair: 0.602, fair_method: "consensus", yes_bid: 58, yes_ask: 61,
    no_bid: 38, no_ask: 41, maker_yes: 59, maker_no: 39, edge_yes: 0.11,
    edge_no: -2.1, edge_basis: "maker", threshold: 2, inplay: null,
    decision: decision({ reason: "no_edge", detail: "no side >= 0.02",
      words: "Neither side clears the bar." }),
    minutes_to_kickoff: 140 },
  { ticker: KNOWN_CODE_MLS, title: "LAFC vs Seattle — LAFC",
    competition: "mls", family: "GAME", phase: "pre_match",
    kickoff_utc: at(170), minute: null, p_model: 0.48, p_consensus: null,
    w: 1, fair: 0.48, fair_method: "model_only", yes_bid: 49, yes_ask: 52,
    no_bid: 48, no_ask: 51, maker_yes: 50, maker_no: 49, edge_yes: -3,
    edge_no: 1.8, edge_basis: "maker", threshold: 3, inplay: null,
    decision: decision({ side: "no", reason: "stale_consensus" }),
    minutes_to_kickoff: 170 },
  { ticker: UNKNOWN_CODE_UNL, title: "Spain vs Portugal — Spain",
    competition: "unl", family: "GAME", phase: "pre_match",
    kickoff_utc: at(60), minute: null, p_model: 0.56, p_consensus: 0.55,
    w: 0.25, fair: 0.5525, fair_method: "blend", yes_bid: 54, yes_ask: 55,
    no_bid: 45, no_ask: 46, maker_yes: 54, maker_no: 45, edge_yes: 0.8,
    edge_no: -0.6, edge_basis: "maker", threshold: 0.5, inplay: null,
    decision: decision({ action: "refused", side: "yes",
      reason: "a_code_no_table_has_yet" }),
    minutes_to_kickoff: 60 },
  { ticker: INPLAY_MLS, title: "Chicago vs Vancouver — Vancouver",
    competition: "mls", family: "GAME", phase: "in_play",
    kickoff_utc: at(-63), minute: 63, p_model: null, p_consensus: null,
    w: 0.5, fair: 0.4, fair_method: "inplay_v2", yes_bid: 38, yes_ask: 41,
    no_bid: 59, no_ask: 62, maker_yes: 39, maker_no: 60, edge_yes: 0.5,
    edge_no: -1.5, edge_basis: "maker", threshold: 3,
    inplay: { minute: 63, period: "2H", momentum: [0.12, 0.39],
      xg15: [0.21, 0.64], p_engine: 0.4, p_informed: 0.38,
      informed_source: "b3", mode: "protective_exit", held_side: "yes",
      exit: { danger: 0.22, danger_threshold: 0.2, tolerance_cents: 2,
        hot_by: ["momentum"] },
      hot_yes: true, hot_no: false, hot_by_yes: ["momentum"], hot_by_no: [],
      danger_yes: 0.22, danger_no: 0.08 },
    decision: decision({ action: "placed", side: "no", price_cents: 31,
      count: 2, words: "protective exit: HOT against the held YES" }),
    minutes_to_kickoff: null },
  { ticker: HELD_BACK_BUND, title: "Bayern vs Dortmund — Bayern",
    competition: "bundesliga", family: "GAME", phase: "pre_match",
    kickoff_utc: at(150), minute: null, p_model: null, p_consensus: null,
    w: null, fair: null, fair_method: null, yes_bid: 61, yes_ask: 63,
    no_bid: 37, no_ask: 39, maker_yes: null, maker_no: null, edge_yes: null,
    edge_no: null, edge_basis: null, threshold: null, inplay: null,
    decision: decision({ action: "not_eligible", reason: "no_fair_price",
      words: "No bookmaker consensus price, and no fresh price from our model." }),
    minutes_to_kickoff: 150 },
];

const COMP_ROW = (inScope: number, eligible: number, decided: number,
                  modelPriced: number, placed: number) => ({
  in_scope: inScope, assessed: inScope, eligible, in_window_held_back: 0,
  in_play_markets: 0, decided, model_priced: modelPriced, placed,
});

/** every focus competition a row, as the route sends it */
const BY_COMPETITION = {
  epl: COMP_ROW(30, 12, 10, 0, 1), laliga: COMP_ROW(28, 9, 8, 4, 0),
  mls: COMP_ROW(24, 6, 6, 6, 1), ligamx: COMP_ROW(0, 0, 0, 0, 0),
  bundesliga: COMP_ROW(18, 0, 0, 0, 0), seriea: COMP_ROW(0, 0, 0, 0, 0),
  ligue1: COMP_ROW(0, 0, 0, 0, 0), eredivisie: COMP_ROW(0, 0, 0, 0, 0),
  unl: COMP_ROW(12, 4, 4, 0, 0), cnl: COMP_ROW(0, 0, 0, 0, 0),
  afcon: COMP_ROW(0, 0, 0, 0, 0),
};

const CANDIDATES_PAYLOAD = {
  version: "trading-candidates-v1", label: "experimental, unproven",
  env: "prod", generated_at: at(0), source: "process", tick_id: "tick-1",
  tick_at: at(0), age_s: 4.2, stale: false, complete: true,
  outcome: "traded", considered: 212, decided: 40, shown: 6, served: 6,
  omitted: {}, not_served: 0, by_competition: BY_COMPETITION,
  arms_in_use: {}, rows: ROWS,
  actions: {
    placed: "an order the venue accepted this tick",
    refused: "the risk engine refused the strategy's intent",
    skipped: "the strategy considered the market and declined it",
    not_eligible: "the catalogue held the market back before any strategy saw it",
  },
  units: { probabilities: "0..1, the YES side", prices: "cents",
    edges: "cents a contract after the maker fee", threshold: "cents" },
};

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Answer = { status: number; body?: unknown; raw?: string };

/** Serve the status, an empty book, and the candidates (the next of
 *  `answers` per read, the last one repeating); open the console and
 *  type the token. */
async function openConsole(page: Page, answers: Answer[],
                           { fakeClock = false } = {}) {
  const reads: Request[] = [];
  await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_PAYLOAD)));
  await page.route(BOOK, (r) => r.fulfill(json(200, EMPTY_BOOK)));
  await page.route(CANDIDATES, (r) => {
    reads.push(r.request());
    const a = answers[Math.min(reads.length - 1, answers.length - 1)];
    return a.raw !== undefined
      ? r.fulfill({ status: a.status, contentType: "text/plain", body: a.raw })
      : r.fulfill(json(a.status, a.body));
  });
  await page.goto("/ops/trading");
  await page.locator("#watch-token").fill(TOKEN);
  // UNDER AN INSTALLED CLOCK the token's 600 ms debounce waits for it —
  // and React may schedule the effect that arms that timer only after a
  // first advance, so the clock is advanced until the console answers
  if (fakeClock) {
    await expect.poll(async () => {
      await page.clock.runFor(700);
      return page.getByTestId("ops-candidates").count();
    }, "the console opens once the debounce has run").toBeGreaterThan(0);
  }
  await expect(page.getByTestId("ops-candidates")).toBeVisible();
  return reads;
}

const row = (page: Page, ticker: string) =>
  page.locator(`[data-testid="cand-row"][data-ticker="${ticker}"]`);
const chip = (page: Page, comp: string) =>
  page.locator(`[data-testid="cand-comp"][data-comp="${comp}"]`);
const pill = (page: Page, d: string) =>
  page.locator(`[data-testid="cand-decision"][data-decision="${d}"]`);

const withoutCounts = () => {
  const { by_competition: _drop, ...rest } = CANDIDATES_PAYLOAD;
  void _drop;
  return rest;
};

test.describe("the trader's candidates on the console", () => {
  test("every market in the snapshot is a row with its numbers; placed rows "
    + "are highlighted; every reason is said in plain words", async ({ page }) => {
      const reads = await openConsole(page, [{ status: 200, body: CANDIDATES_PAYLOAD }]);
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      expect(reads[0].method()).toBe("GET");
      expect(reads[0].headers()["x-admin-token"]).toBe(TOKEN);
      await expect(page.getByTestId("cand-summary"))
        .toContainText("6 shown · 2 placed · 4 not placed · 212 considered");
      await expect(page.getByTestId("ops-candidates"))
        .toContainText("Experimental, unproven");
      await expect(page.getByTestId("ops-candidates"))
        .toContainText("our model's probability is unvalidated");

      // the placed EPL row, number by number
      const epl = row(page, PLACED_EPL);
      await expect(epl).toHaveAttribute("data-decision", "placed");
      for (const s of ["Arsenal vs West Ham — Arsenal", PLACED_EPL, "GAME",
        "Premier League", "54.0%", "51.0%", "0.50", "52.5%", "47¢ / 50¢",
        "maker 48¢", "50¢ / 53¢", "maker 51¢", "+2.62¢", "−4.40¢", "1.5¢",
        "pre-match", "YES · 4 @ 48¢",
        "Placed: yes at 48c x 4, resting as a maker order."]) {
        await expect(epl, s).toContainText(s);
      }
      await expect(epl.getByTestId("cand-placed-chip")).toHaveText("Placed");
      // the edge that clears the bar is marked, the one that does not is not
      await expect(epl.getByTestId("cand-edge-yes")).toHaveAttribute("data-clears", "true");
      await expect(epl.getByTestId("cand-edge-no")).not.toHaveAttribute("data-clears", /.*/);

      // HIGHLIGHTED: a placed row carries an inset accent bar and a tint
      // that the others do not — read off the computed style, so a class
      // that stopped meaning anything would fail here
      const shadow = (t: string) => row(page, t).evaluate(
        (el) => getComputedStyle(el).boxShadow);
      expect(await shadow(PLACED_EPL)).not.toBe("none");
      expect(await shadow(INPLAY_MLS)).not.toBe("none");
      expect(await shadow(WORDS_LALIGA)).toBe("none");
      expect(await shadow(HELD_BACK_BUND)).toBe("none");

      // the backend's own words win, with its code and detail beside them…
      const laliga = row(page, WORDS_LALIGA);
      await expect(laliga).toHaveAttribute("data-decision", "skipped");
      await expect(laliga.getByTestId("cand-action")).toHaveText("Skipped");
      await expect(laliga.getByTestId("cand-words"))
        .toHaveText("Neither side clears the bar.");
      await expect(laliga).toContainText("no_edge · no side >= 0.02");
      // no model price was sent: the model cell is a dash, not 0.0%
      await expect(laliga.locator("td").nth(4)).toHaveText("—");
      // …a known code with no words is said from this page's table…
      const mls = row(page, KNOWN_CODE_MLS);
      await expect(mls.getByTestId("cand-action")).toHaveText("Skipped · NO");
      await expect(mls.getByTestId("cand-words"))
        .toHaveText("the bookmaker price is too old to trust");
      // …and an unknown code is drawn as itself, said to have no words
      const unl = row(page, UNKNOWN_CODE_UNL);
      await expect(unl.getByTestId("cand-action")).toHaveText("Refused · YES");
      await expect(unl.getByTestId("cand-words"))
        .toHaveText("a_code_no_table_has_yet (no plain words were sent for this code)");
      // a held-back market: every number it lacks is a dash
      const bund = row(page, HELD_BACK_BUND);
      await expect(bund.getByTestId("cand-action")).toHaveText("Not eligible");
      await expect(bund.getByTestId("cand-edge-yes")).toHaveText("—");
      await expect(bund).toContainText("61¢ / 63¢");
      await expect(bund).toContainText("maker —");

      // the in-play row: the minute, HOT, the (home, away) reads, danger
      // per side, the engine and live-stat prices, the placement
      const ip = row(page, INPLAY_MLS);
      await expect(ip).toContainText("in play 63′");
      await expect(ip.getByTestId("cand-hot")).toHaveText(["HOT against YES"]);
      await expect(ip).toContainText("mode protective_exit");
      await expect(ip).toContainText("momentum home +0.12 · away +0.39");
      await expect(ip).toContainText("xG15 home +0.21 · away +0.64");
      await expect(ip).toContainText("danger YES 22.0% · NO 8.0%");
      await expect(ip).toContainText("engine 40.0% · live-stat 38.0%");
      await expect(ip).toContainText("NO · 2 @ 31¢");
      await expect(ip).toContainText("protective exit: HOT against the held YES");

      // why not placed, counted in words
      const why = page.getByTestId("cand-why");
      await expect(why.locator("li")).toHaveCount(4);
      await expect(why).toContainText("the bookmaker price is too old to trust");
    });

  test("filters by competition and by decision narrow the table and hold "
    + "across a refresh", async ({ page }) => {
      await page.clock.install();
      const reads = await openConsole(page,
        [{ status: 200, body: CANDIDATES_PAYLOAD }], { fakeClock: true });
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      // the decision pills: placed and skipped always, then each action held
      await expect(page.getByTestId("cand-decision")).toHaveText([
        "All decisions · 6", "Placed · 2", "Refused · 1", "Skipped · 2",
        "Not eligible · 1"]);

      await chip(page, "mls").click();
      await expect(chip(page, "mls")).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("cand-row")).toHaveCount(2);
      for (const r of await page.getByTestId("cand-row").all()) {
        await expect(r).toHaveAttribute("data-competition", "mls");
      }
      await pill(page, "placed").click();
      await expect(page.getByTestId("cand-row")).toHaveCount(1);
      await expect(row(page, INPLAY_MLS)).toHaveCount(1);
      await expect(page.getByTestId("cand-action-means"))
        .toHaveText("an order the venue accepted this tick");
      // "why not placed" follows the COMPETITION, not the decision filter:
      // MLS's one skip is still said while only its placement is listed
      await expect(page.getByTestId("cand-why").locator("li")).toHaveCount(1);
      await expect(page.getByTestId("cand-why"))
        .toContainText("the bookmaker price is too old to trust");

      // THE NEXT READ, fifteen seconds on: the filters are the tab's and stay
      const before = reads.length;
      await page.clock.runFor(16_000);
      await expect.poll(() => reads.length, "the candidates are read again")
        .toBeGreaterThan(before);
      await expect(page.getByTestId("cand-row")).toHaveCount(1);
      await expect(chip(page, "mls")).toHaveAttribute("aria-pressed", "true");
      await expect(pill(page, "placed")).toHaveAttribute("aria-pressed", "true");

      await pill(page, "skipped").click();
      await expect(page.getByTestId("cand-row")).toHaveCount(1);
      await expect(row(page, KNOWN_CODE_MLS)).toHaveCount(1);

      // a competition the snapshot holds nothing of says so by name
      await chip(page, "ligamx").click();
      await expect(page.getByTestId("cand-row")).toHaveCount(0);
      await expect(page.getByTestId("cand-filtered-empty"))
        .toHaveText("No candidate from Liga MX in this snapshot.");

      await chip(page, "__all__").click();
      await pill(page, "all").click();
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
    });

  test("every competition is a row: the route's per-competition counts, and "
    + "a chip for each — one with no row says 'none in this snapshot', "
    + "never 0", async ({ page }) => {
      await openConsole(page, [{ status: 200, body: CANDIDATES_PAYLOAD }]);
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      const names = ["Premier League", "La Liga", "MLS", "Liga MX",
        "Bundesliga", "Serie A", "Ligue 1", "Eredivisie",
        "UEFA Nations League", "Concacaf Nations League",
        "Africa Cup of Nations"];
      // All + the eleven, in the route's order
      await expect(page.getByTestId("cand-comp")).toHaveCount(12);
      const table = page.getByTestId("cand-by-comp");
      await expect(table.getByTestId("cand-by-comp-row")).toHaveCount(11);
      for (const [i, name] of names.entries()) {
        await expect(table.getByTestId("cand-by-comp-row").nth(i), name)
          .toContainText(name);
      }
      await expect(table.locator('[data-comp="epl"]'))
        .toHaveText(/Premier League\s*30\s*12\s*0\s*10\s*0\s*1\s*1/);
      // a competition with nothing in scope is a row of real zeros, sent
      await expect(table.locator('[data-comp="ligamx"]'))
        .toHaveText(/Liga MX\s*0\s*0\s*0\s*0\s*0\s*0\s*0/);
      await expect(chip(page, "epl")).toHaveText("Premier League · 1, 1 placed");
      await expect(chip(page, "mls")).toHaveText("MLS · 2, 1 placed");
      await expect(chip(page, "unl")).toHaveText("UEFA Nations League · 1");
      for (const k of ["ligamx", "seriea", "ligue1", "eredivisie", "cnl", "afcon"]) {
        await expect(chip(page, k), k).toContainText("none in this snapshot");
        await expect(chip(page, k), k).not.toContainText(" 0");
      }
      // the non-vacuity half: a competition WITH rows never says none
      await expect(chip(page, "epl")).not.toContainText("none in this snapshot");
      await expect(page.getByTestId("ops-candidates")).toContainText("the trader's scope");
    });

  test("a payload that names no competitions falls back to the eleven focus "
    + "competitions", async ({ page }) => {
      await openConsole(page, [{ status: 200, body: withoutCounts() }]);
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      await expect(page.getByTestId("ops-candidates"))
        .toContainText("the eleven focus competitions");
      await expect(page.getByTestId("cand-comp")).toHaveCount(12);
      await expect(page.getByTestId("cand-by-comp")).toHaveCount(0);
      await expect(chip(page, "afcon"))
        .toHaveText("Africa Cup of Nations · none in this snapshot");
    });

  test("a stated scope is the scope; a row outside it is still shown and "
    + "flagged", async ({ page }) => {
      await openConsole(page, [{ status: 200,
        body: { ...withoutCounts(), scope: ["epl", "mls"] } }]);
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      await expect(page.getByTestId("ops-candidates")).toContainText("the trader's scope");
      // All + the two in scope + the three the rows name outside it
      await expect(page.getByTestId("cand-comp")).toHaveCount(6);
      await expect(chip(page, "laliga")).toContainText("(not in scope list)");
      await expect(chip(page, "unl")).toContainText("(not in scope list)");
      await expect(chip(page, "ligamx")).toHaveCount(0);
    });

  test("rows left out of the bounded snapshot are counted by reason",
    async ({ page }) => {
      await openConsole(page, [{ status: 200, body: {
        ...CANDIDATES_PAYLOAD, omitted: { size_bound: 3, outside_window: 9 } } }]);
      await expect(page.getByTestId("cand-truncated")).toContainText(
        "snapshot cut to its bound — 12 left out (outside_window 9, size_bound 3)");
    });

  test("the brief's spelling of the contract reads the same, and a payload "
    + "that says its prices are dollars is converted", async ({ page }) => {
      const brief = {
        version: "trading-candidates-v1", generated_at: at(0), tick_at: at(0),
        rows: [{ ticker: PLACED_EPL, title: "Arsenal vs West Ham — Arsenal",
          competition: "epl", kickoff_utc: at(95), minute: null,
          family: "GAME", side_considered: "yes", p_model: "0.54",
          p_consensus: "0.51", w: "0.5", fair: "0.525", yes_bid: "0.47",
          yes_ask: "0.50", no_bid: "0.50", no_ask: "0.53", maker_yes: "0.48",
          maker_no: "0.51", edge_yes: "0.0262", edge_no: "-0.044",
          threshold: "0.015",
          inplay: { momentum: "-0.27", xg15: "0.64", danger: "0.22", hot: true },
          decision: { kind: "placed", price_cents: 48, count: 4, reason: null,
            words: null } }],
        units: { prices: "dollars", edges: "dollars", threshold: "dollars" },
      };
      await openConsole(page, [{ status: 200, body: brief }]);
      const epl = row(page, PLACED_EPL);
      for (const s of ["47¢ / 50¢", "maker 48¢", "+2.62¢", "−4.40¢", "1.5¢",
        "YES · 4 @ 48¢", "momentum −0.27", "xG15 +0.64", "danger 22.0%"]) {
        await expect(epl, s).toContainText(s);
      }
      await expect(epl.getByTestId("cand-hot")).toHaveText(["HOT"]);
      await expect(epl).toHaveAttribute("data-decision", "placed");
    });

  for (const [what, body, code, words] of [
    ["a fresh tick that considered nothing", { ...CANDIDATES_PAYLOAD,
      rows: [], considered: 0, shown: 0, served: 0 }, "none",
      "The newest tick considered no markets."],
    ["a stale snapshot", { ...CANDIDATES_PAYLOAD, rows: [], stale: true,
      age_s: 1260, not_served: 6 }, "stale",
      "The newest snapshot is 21 minutes old — older than the backend serves"],
    ["no snapshot yet", { ...CANDIDATES_PAYLOAD, rows: [], tick_at: null,
      stale: null, considered: null, by_competition: {} }, "no_snapshot",
      "No snapshot on record yet"],
    ["rows withheld because their markets stopped trading", {
      ...CANDIDATES_PAYLOAD, rows: [], not_served: 6 }, "not_served",
      "were all for markets Kalshi no longer lists as trading"],
  ] as [string, unknown, string, string][]) {
    test(`an empty table is explained: ${what}`, async ({ page }) => {
      await openConsole(page, [{ status: 200, body }]);
      const none = page.getByTestId("cand-none");
      await expect(none).toHaveAttribute("data-why", code);
      await expect(none).toContainText(words);
      await expect(page.getByTestId("cand-error")).toHaveCount(0);
      if (code !== "none") {
        // THE NON-VACUITY HALF: only a fresh tick that considered nothing
        // may say so
        await expect(none).not.toContainText("considered no markets");
      }
    });
  }

  for (const [what, answer, words] of [
    ["a refusal", { status: 403, body: { detail: "operator credentials required" } },
      "token rejected — the backend refused it (operator credentials required)"],
    ["a server error", { status: 500, body: { detail: "the tick store fell over" } },
      "the candidates read failed (HTTP 500) — the tick store fell over"],
    ["a 200 that is not JSON", { status: 200, raw: "<html>gateway</html>" },
      "the candidates read failed (HTTP 200) — the answer was not JSON"],
    ["a 200 that is not an object", { status: 200, body: [] },
      "the candidates read failed (HTTP 200) — the answer was not an object"],
  ] as [string, Answer, string][]) {
    test(`${what} is named, never drawn as an empty table`, async ({ page }) => {
      await openConsole(page, [answer]);
      await expect(page.getByTestId("cand-error")).toContainText(words);
      await expect(page.getByTestId("cand-none")).toHaveCount(0);
      await expect(page.getByTestId("cand-table")).toHaveCount(0);
      await expect(page.getByTestId("cand-summary")).toHaveCount(0);
    });
  }

  test("a backend without the candidates route: 'not available yet', and "
    + "the console stands", async ({ page }) => {
      await openConsole(page, [{ status: 404, body: { available: false } }]);
      await expect(page.getByTestId("cand-unavailable"))
        .toContainText("Candidates not available yet");
      await expect(page.getByTestId("cand-table")).toHaveCount(0);
      await expect(page.getByTestId("ops-strip")).toBeVisible();
      await expect(page.getByTestId("ops-book")).toBeVisible();
    });

  test("at 400 px the candidates table scrolls inside its box, the decision "
    + "is on screen, and the page does not scroll sideways", async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 900 });
      await openConsole(page, [{ status: 200, body: CANDIDATES_PAYLOAD }]);
      await expect(page.getByTestId("cand-row")).toHaveCount(6);
      const m = await page.evaluate(() => {
        const t = document.querySelector('[data-testid="cand-table"]')!;
        const box = t.parentElement!;
        const chipEl = document.querySelector('[data-testid="cand-placed-chip"]')!;
        return {
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
          table: t.scrollWidth, box: box.clientWidth,
          chipRight: chipEl.getBoundingClientRect().right,
          boxRight: box.getBoundingClientRect().right,
        };
      });
      expect(m.page, "no sideways page scroll").toBeLessThanOrEqual(m.view);
      expect(m.table, "the table is wider than its box, so the box scrolls")
        .toBeGreaterThan(m.box);
      expect(m.chipRight, "the decision is visible without scrolling the table")
        .toBeLessThanOrEqual(m.boxRight);
    });
});

// ---------------------------------------------- the proxy itself

test.describe("the candidates proxy", () => {
  test.skip(LIVE, "reads the hermetic stand-in's log — hermetic runs only");

  test("a GET reaches exactly /api/admin/trading/candidates — no query "
    + "crosses — and the answer is relayed unedited", async ({ request }) => {
      const started = new Date().toISOString();
      const r = await request.get(
        "/api/ops/trading-candidates?path=../mls/risk&competition=epl", {
          headers: { "x-admin-token": "proxy-test-token" },
        });
      // the stand-in's named 503, passed through unedited
      expect(r.status()).toBe(503);
      expect(r.headers()["cache-control"]).toBe("private, no-store");
      const log = await (await request.get(`${STANDIN_URL}/__standin/log`))
        .json() as { requests: { at: string; method: string; url: string }[] };
      // other workers' consoles read the same path through the shared
      // stand-in, so the claim is about EVERY hit, not their number: each
      // is the bare path — no query, no payload — and this one is among them
      const hits = log.requests.filter((e) => e.at >= started
        && e.url.includes("/candidates"));
      expect(hits.length).toBeGreaterThan(0);
      expect([...new Set(hits.map((e) => `${e.method} ${e.url}`))])
        .toEqual(["GET /api/admin/trading/candidates"]);
    });

  test("the candidates are a read: other verbs are 405, and nothing is cached",
    async ({ request }) => {
      for (const verb of ["post", "put", "delete"] as const) {
        const r = await request[verb]("/api/ops/trading-candidates");
        expect(r.status(), verb).toBe(405);
        expect(r.headers()["allow"], verb).toBe("GET");
        expect(r.headers()["cache-control"], verb).toBe("private, no-store");
      }
    });
});

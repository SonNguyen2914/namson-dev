import { expect, test } from "@playwright/test";

// The picker board (/bet-suggester) and the archive dropdown.
//
// Hermetic: every test below serves a RECORDED shape of
// GET /api/picker/board, so none of it depends on the weather. The one
// exception is the proxy test at the bottom, which is unmocked on
// purpose — see its own comment.
//
// What is at stake here is not pixels. The picker RANKS, NEVER CUTS, and
// two of its three stages exist only to annotate. Since 2026-08-31 the
// board is FOUR COLUMNS — one per league, fixed order, each with its own
// sort control — so the assertions are about properties a prettier board
// could quietly lose:
//
//   - every row served is drawn in its league's column, including a gap
//     of exactly 0.00, and NO SORT MODE changes that count;
//   - each column opens in |GD/g gap| descending and applies the order
//     itself, so a reordered payload cannot reorder the board;
//   - a row with no value under the active sort key sorts LAST, in both
//     directions, and the column says so on screen;
//   - a row can lead on the table gap and be LEVEL underneath, and that
//     has to be visible without reading a number;
//   - "prior szn" is a banner, not a footnote;
//   - a refused fixture is listed with its club and reason, never hidden;
//   - nothing on the page reads as advice.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

function inHours(h: number) {
  // DETERMINISTIC and SAME-PT-DAY (2026-09-01): the board went
  // day-major, so relative-to-now kickoffs that straddle PT midnight
  // made every order assertion flaky. Base = midnight PT on a fixed
  // future date; h maps to 25-minute steps so every historical h value
  // (2..50) stays inside one matchday while chronology is preserved.
  const base = Date.UTC(2026, 11, 10, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
}

const LEAGUES = {
  epl: { src: "prior", min_current_gp: 1, clubs: 20 },
  laliga: { src: "prior", min_current_gp: 2, clubs: 20 },
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
  ligamx: { src: "prior", min_current_gp: 5, clubs: 18 },
};

// The row that made this page necessary: top of its column on the table
// gap, and its DEFENCE tiers are level — T1 v T1, a +0 gap. The whole
// separation is attacking. Recorded from the live board on 2026-08-31.
const SPLIT_TOP = {
  refused: false, league: "laliga",
  home: "Barcelona", away: "Rayo Vallecano",
  favourite: "Barcelona", opponent: "Rayo Vallecano", fav_side: "home",
  resolution: { Barcelona: "exact", "Rayo Vallecano": "exact" },
  ppg_gap: 1.1578947368421053, gdg_gap: 1.631578947368421, rank_gap: 7,
  gp_current: { home: 2, away: 2, min: 2 },
  src: "prior", ranks: { fav: 1, opp: 8 },
  tiers: { ovr: [1, 2], atk: [1, 4], def: [1, 1] },
  tier_gaps: { ovr: 1, atk: 3, def: 0 },
  shape: "SPLIT",
  event_id: "401882903", competition_id: "401882903",
  kickoff: inHours(9), espn: "esp.1",
  kalshi: {
    event_ticker: "KXLALIGAGAME-SAMPLE-BARRVC",
    ticker: "KXLALIGAGAME-SAMPLE-BARRVC-BAR",
    ask_c: null, bid_c: null, spread_c: null,
    ask_size: null, bid_size: null, flags: [],
  },
};

// A genuinely hollow one: ahead overall, level in attack, behind in
// defence. Big table gap, nothing underneath it.
const HOLLOW = {
  refused: false, league: "ligamx",
  home: "Hollow FC", away: "Steady CD",
  favourite: "Hollow FC", opponent: "Steady CD", fav_side: "home",
  resolution: { "Hollow FC": "exact", "Steady CD": "exact" },
  ppg_gap: 0.6, gdg_gap: 1.1, rank_gap: 6,
  gp_current: { home: 5, away: 5, min: 5 },
  src: "prior", ranks: { fav: 3, opp: 9 },
  tiers: { ovr: [2, 4], atk: [3, 3], def: [4, 3] },
  tier_gaps: { ovr: 2, atk: 0, def: -1 },
  shape: "HOLLOW",
  event_id: "900001", competition_id: "900001",
  kickoff: inHours(20), espn: "mex.1",
  kalshi: null,
};

// A priced row, with both annotation flags on the book.
const PRICED = {
  refused: false, league: "epl",
  home: "Aston Villa", away: "Arsenal",
  favourite: "Arsenal", opponent: "Aston Villa", fav_side: "away",
  resolution: { "Aston Villa": "exact", Arsenal: "exact" },
  ppg_gap: 0.5263157894736843, gdg_gap: 0.9736842105263158, rank_gap: 3,
  gp_current: { home: 1, away: 1, min: 1 },
  src: "prior", ranks: { fav: 1, opp: 4 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 },
  shape: "CLEAN",
  event_id: "401879295", competition_id: "401879295",
  kickoff: inHours(11), espn: "eng.1",
  kalshi: {
    event_ticker: "KXEPLGAME-SAMPLE-AVLARS",
    ticker: "KXEPLGAME-SAMPLE-AVLARS-ARS",
    ask_c: 64, bid_c: 59, spread_c: 5,
    ask_size: 40, bid_size: 220, flags: ["WIDE", "THIN"],
  },
};

// A gap of EXACTLY zero, on the board. There is no qualifying bar in the
// picker and none may be added here; this row is the proof.
const ZERO_GAP = {
  refused: false, league: "laliga",
  home: "Osasuna", away: "Getafe",
  favourite: "Getafe", opponent: "Osasuna", fav_side: "away",
  resolution: { Osasuna: "exact", Getafe: "exact" },
  ppg_gap: 0.23684210526315774, gdg_gap: 0.0, rank_gap: 9,
  gp_current: { home: 2, away: 2, min: 2 },
  src: "prior", ranks: { fav: 7, opp: 16 },
  tiers: { ovr: [2, 4], atk: [5, 3], def: [1, 2] },
  tier_gaps: { ovr: 2, atk: -2, def: 1 },
  shape: "SPLIT",
  event_id: "401882901", competition_id: "401882901",
  kickoff: inHours(7), espn: "esp.1",
  kalshi: null,
};

const REFUSAL = {
  refused: true, league: "epl",
  home: "Sunderland", away: "Promoted Rovers FC",
  club: "Promoted Rovers FC",
  reason: "no row in the prior-season top-flight table",
  event_id: "401879999", kickoff: inHours(30),
};

// Deliberately NOT in board order — each column must sort itself.
const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260831", days: 7,
  leagues: LEAGUES,
  rows: [ZERO_GAP, SPLIT_TOP, PRICED, HOLLOW],
  refusals: [REFUSAL],
};

// ---- a synthetic MLS slate where EVERY sort key separates the rows ----
// Four fixtures whose ten sortable values produce ten DISTINCT orders,
// so a mode that silently falls back to another key cannot stay green.
// Delta has no Kalshi quote at all — the null-last row for the three
// book keys.
function mlsRow(over: Record<string, unknown>) {
  return {
    refused: false, league: "mls", fav_side: "home",
    resolution: {}, src: "current",
    gp_current: { home: 22, away: 21, min: 21 },
    shape: "SPLIT", espn: "usa.1",
    ...over,
  };
}
const ALPHA = mlsRow({
  home: "Alpha SC", away: "Alpha Opp", favourite: "Alpha SC",
  opponent: "Alpha Opp",
  ppg_gap: 0.2, gdg_gap: 1.5, rank_gap: 2,
  ranks: { fav: 4, opp: 6 },
  tiers: { ovr: [2, 3], atk: [3, 3], def: [1, 3] },
  tier_gaps: { ovr: 1, atk: 0, def: 2 },
  event_id: "m-alpha", competition_id: "m-alpha", kickoff: inHours(5),
  kalshi: { event_ticker: "KXMLS-A", ticker: "KXMLS-A-ALP",
    ask_c: 30, bid_c: 26, spread_c: 4, ask_size: 500, bid_size: 400,
    flags: ["WIDE"] },
});
const BRAVO = mlsRow({
  home: "Bravo United", away: "Bravo Opp", favourite: "Bravo United",
  opponent: "Bravo Opp",
  ppg_gap: 0.9, gdg_gap: 1.0, rank_gap: 12,
  ranks: { fav: 1, opp: 13 },
  tiers: { ovr: [1, 4], atk: [1, 3], def: [3, 2] },
  tier_gaps: { ovr: 3, atk: 2, def: -1 },
  event_id: "m-bravo", competition_id: "m-bravo", kickoff: inHours(50),
  kalshi: { event_ticker: "KXMLS-B", ticker: "KXMLS-B-BRV",
    ask_c: 80, bid_c: 74, spread_c: 6, ask_size: 50, bid_size: 90,
    flags: ["WIDE", "THIN"] },
});
const CHARLIE = mlsRow({
  home: "Charlie FC", away: "Charlie Opp", favourite: "Charlie FC",
  opponent: "Charlie Opp",
  ppg_gap: 0.5, gdg_gap: 0.5, rank_gap: 7,
  ranks: { fav: 5, opp: 12 },
  tiers: { ovr: [2, 4], atk: [1, 5], def: [2, 2] },
  tier_gaps: { ovr: 2, atk: 4, def: 0 },
  event_id: "m-charlie", competition_id: "m-charlie", kickoff: inHours(20),
  kalshi: { event_ticker: "KXMLS-C", ticker: "KXMLS-C-CHR",
    ask_c: 90, bid_c: 87, spread_c: 3, ask_size: 120, bid_size: 300,
    flags: [] },
});
const DELTA = mlsRow({
  home: "Delta City", away: "Delta Opp", favourite: "Delta City",
  opponent: "Delta Opp",
  ppg_gap: 1.2, gdg_gap: 2.0, rank_gap: 4,
  ranks: { fav: 2, opp: 6 },
  tiers: { ovr: [2, 2], atk: [2, 3], def: [2, 3] },
  tier_gaps: { ovr: 0, atk: 1, def: 1 },
  event_id: "m-delta", competition_id: "m-delta", kickoff: inHours(2),
  kalshi: null,
});

const SORT_BOARD = { ...BOARD, rows: [...BOARD.rows, ALPHA, BRAVO, CHARLIE, DELTA] };

// The order each mode must produce in the MLS column (by data-event).
// Ten modes, ten distinct orders — worked out from the values above.
const EXPECTED: Record<string, string[]> = {
  gdg: ["m-delta", "m-alpha", "m-bravo", "m-charlie"],
  kickoff: ["m-delta", "m-alpha", "m-charlie", "m-bravo"],
  ppg: ["m-delta", "m-bravo", "m-charlie", "m-alpha"],
  rank: ["m-bravo", "m-charlie", "m-delta", "m-alpha"],
  tier_ovr: ["m-bravo", "m-charlie", "m-alpha", "m-delta"],
  tier_atk: ["m-charlie", "m-bravo", "m-delta", "m-alpha"],
  tier_def: ["m-alpha", "m-delta", "m-charlie", "m-bravo"],
  ask: ["m-alpha", "m-bravo", "m-charlie", "m-delta"],
  spread: ["m-charlie", "m-alpha", "m-bravo", "m-delta"],
  depth: ["m-alpha", "m-charlie", "m-bravo", "m-delta"],
};

async function serveBoard(page: import("@playwright/test").Page,
                          body: unknown = BOARD, status = 200) {
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json(body, status)));
}

// The finished tail is a SECOND request (GET /api/picker/review), so every
// test that opens the board serves it too — an unmocked tail would put a
// live network call inside otherwise hermetic tests and make the page's
// slowest element the weather. Its recorded shapes are at the bottom of
// this file, beside the tests that read them.
async function serveReview(page: import("@playwright/test").Page,
                           body: unknown = REVIEW, status = 200) {
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(body, status)));
}

async function open(page: import("@playwright/test").Page,
                    body: unknown = BOARD, status = 200,
                    reviewBody: unknown = REVIEW, reviewStatus = 200) {
  await serveBoard(page, body, status);
  await serveReview(page, reviewBody, reviewStatus);
  await page.goto("/bet-suggester");
}

const col = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);

const orderOf = (c: ReturnType<typeof col>) =>
  c.getByTestId("picker-row")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));

// ---------------------------------------------------------------- board

test("the landing page IS the picker board", async ({ page }) => {
  await open(page);
  // "Hand-picked" read as a curated subset — the page's copy now states
  // its own rule (ranks, never cuts) in the H1 itself.
  await expect(page.getByRole("heading", { name: "Every fixture, ranked" }))
    .toBeVisible();
  await expect(page.getByText(/ranked by how far apart the two clubs sit/i))
    .toBeVisible();
});

test("four league columns, fixed order, each header carrying its facts",
  async ({ page }) => {
    await open(page);
    const cols = page.getByTestId("league-col");
    await expect(cols).toHaveCount(4);
    expect(await cols.evaluateAll(
      (els) => els.map((e) => e.getAttribute("data-league"))))
      .toEqual(["mls", "epl", "laliga", "ligamx"]);
    // MLS: current-season badge with its min GP, a zero count, and an
    // in-window league with nothing to show SAYS SO rather than sitting
    // blank
    const mls = cols.nth(0);
    await expect(mls.getByRole("heading", { name: "MLS" })).toBeVisible();
    await expect(mls.getByText(/this szn · min 21 GP/)).toBeVisible();
    await expect(mls.getByTestId("col-count")).toHaveText("0 fixtures");
    await expect(mls.getByTestId("col-empty"))
      .toContainText("No MLS fixtures in the next 7 days");
    // La Liga: prior-season badge in the header, and a true count
    const laliga = cols.nth(2);
    await expect(laliga.getByText("prior szn").first()).toBeVisible();
    await expect(laliga.getByTestId("col-count")).toHaveText("2 fixtures");
    // the jump chips are a phone affordance — not desktop chrome
    await expect(page.getByTestId("league-jump")).toBeHidden();
  });

test("every row served is drawn in its league's column, opening in KICKOFF order, including a 0.00 gap",
  async ({ page }) => {
    await open(page);
    // four served, four drawn — the page adds no bar of its own
    await expect(page.getByTestId("picker-row")).toHaveCount(4);
    // and the column applies the default order itself: the payload above
    // is deliberately shuffled
    const rows = col(page, "laliga").getByTestId("picker-row");
    await expect(rows).toHaveCount(2);
    // the default is KICKOFF ascending (2026-09-02): the board is
    // day-major, so inside a day the honest order is the order the
    // football happens in. Getafe kicks off before Barcelona.
    await expect(rows.nth(0)).toContainText("Getafe");
    await expect(rows.nth(1)).toContainText("Barcelona");
    // rank badges are the COLUMN's own positions
    await expect(rows.nth(0).getByTestId("row-rank")).toHaveText("01");
    await expect(rows.nth(1).getByTestId("row-rank")).toHaveText("02");
    // the zero-gap fixture is ON the board, showing its zero — SIGNED:
    // a bare "0.00" would keep this green through a regression of the
    // one row that proves the picker never cuts. It is Getafe, which
    // kickoff order now puts first.
    await expect(rows.nth(0)).toContainText("+0.00");
  });

test("a LEVEL defence is visible without reading a number",
  async ({ page }) => {
    await open(page);
    const top = page.getByTestId("picker-row")
      .filter({ hasText: "Barcelona" });
    // it still leads its column on the TABLE gap — but the board opens
    // in kickoff order now, so leading that gap is no longer the same
    // thing as being the first card
    await expect(top).toContainText("+1.63");
    await expect(top.getByTestId("row-rank")).toHaveText("02");
    // …and the three tier dimensions are drawn SEPARATELY as cells —
    // fill AND colour both encode the sign (2026-09-01 convergence), so
    // the level defence (amber half-cell) cannot pass for a small
    // positive with or without the hues
    const cells = top.getByTestId("tier-cell");
    await expect(cells).toHaveCount(3);
    await expect(cells.and(top.locator('[data-dim="defence"]')))
      .toHaveAttribute("data-gap", "0");
    await expect(cells.and(top.locator('[data-dim="attack"]')))
      .toHaveAttribute("data-gap", "3");
    // the exact pairs stay on the card…
    await expect(top).toContainText("T1v T4".replace(" ", "") === "T1vT4"
      ? "1v4" : "1v4");
    // …and the plain-English read is one deliberate click away, still
    // in shapeRead()'s own words, with the per-dimension detail
    await top.getByTestId("tier-read").click();
    const read = top.getByTestId("shape-read");
    await expect(read.getByText(/the tier gap is attack \+3/i)).toBeVisible();
    await expect(read.getByText(/level in defence \(T1 v T1\)/i)).toBeVisible();
    await expect(read).toContainText("T1 v T4 +3");
    await expect(read).toContainText("level");
  });

test("a hollow row is marked differently from a clean one", async ({ page }) => {
  await open(page);
  const hollow = page.getByTestId("picker-row")
    .filter({ hasText: "Hollow FC" });
  const clean = page.getByTestId("picker-row").filter({ hasText: "Arsenal" });
  await expect(hollow).toHaveAttribute("data-shape", "HOLLOW");
  await expect(clean).toHaveAttribute("data-shape", "CLEAN");
  // the shape is on screen as a word, and the WHY is one click away in
  // shapeRead()'s own words — the cells beside the word already draw
  // where the gap is, dimension by dimension
  await expect(hollow.getByText("HOLLOW", { exact: true })).toBeVisible();
  await expect(clean.getByText("CLEAN", { exact: true })).toBeVisible();
  await hollow.getByTestId("tier-read").click();
  // 2026-09-03: was /high on the table gap, but/ — a claim the shape rule
  // does not make (HOLLOW is atk <= 0 AND def <= 0, no table condition) and
  // that the data contradicts on 98.9% of hollow rows. See PickerRead.tsx.
  await expect(
    hollow.getByTestId("shape-read").getByText(/neither unit backs the pick/i))
    .toBeVisible();
  await expect(
    hollow.getByTestId("shape-read").getByText(/behind in defence/i))
    .toBeVisible();
  await hollow.getByTestId("tier-read").click();   // closes again
  await expect(hollow.getByTestId("shape-read")).toHaveCount(0);
  await clean.getByTestId("tier-read").click();
  await expect(clean.getByTestId("shape-read")
    .getByText(/better tier overall, in attack and in defence/i)).toBeVisible();
});

test("prior-season rating is a banner, not a footnote", async ({ page }) => {
  await open(page);
  const banner = page.getByTestId("prior-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("3 of 4 leagues");
  await expect(banner).toContainText("Premier League 1 GP");
  await expect(banner).toContainText("La Liga 2 GP");
  await expect(banner).toContainText("Liga MX 5 GP");
  // and every row on a prior-season league carries the badge itself
  const top = page.getByTestId("picker-row").filter({ hasText: "Barcelona" });
  await expect(top.getByText("prior szn")).toBeVisible();
});

test("refused fixtures are listed at their column's foot with the club and the reason",
  async ({ page }) => {
    await open(page);
    const refusals = col(page, "epl").getByTestId("refusals");
    await expect(refusals).toBeVisible();
    await expect(page.getByTestId("picker-refusal")).toHaveCount(1);
    await expect(refusals).toContainText("Promoted Rovers FC");
    await expect(refusals)
      .toContainText("no row in the prior-season top-flight table");
    // and a sentence a human can read for WHY refusing is the behaviour
    await expect(refusals.getByText(/refuses it by name instead of imputing/i))
      .toBeVisible();
  });

test("a book with no live quote is a real state, and keeps its row",
  async ({ page }) => {
    // tonight's actual case: every Kalshi event matched, every quote null
    await open(page);
    const top = page.getByTestId("picker-row").filter({ hasText: "Barcelona" });
    await expect(top.getByText(/listed · no quote/)).toBeVisible();
    // an unmatched event is a DIFFERENT fact and says so
    await expect(page.getByTestId("picker-row").filter({ hasText: "Hollow FC" })
      .getByText("no kalshi event")).toBeVisible();
    // a priced row shows ask / spread / size and both annotation flags
    const priced = page.getByTestId("picker-row").filter({ hasText: "Arsenal" });
    await expect(priced.getByText("ask 64¢")).toBeVisible();
    await expect(priced.getByText(/bid \d+¢/)).toBeVisible();
    await expect(priced.getByText("spread 5¢")).toBeVisible();
    await expect(priced.getByText("size 40")).toBeVisible();
    await expect(priced.getByText("WIDE", { exact: true })).toBeVisible();
    await expect(priced.getByText("THIN", { exact: true })).toBeVisible();
  });

test("a league's kalshi failure is named in its column, costing quotes, not rows",
  async ({ page }) => {
    await open(page, {
      ...BOARD,
      leagues: {
        ...LEAGUES,
        laliga: { ...LEAGUES.laliga, kalshi_error: "kalshi markets fetch failed" },
      },
    });
    const laliga = col(page, "laliga");
    await expect(laliga.getByTestId("col-kalshi-error")).toBeVisible();
    await expect(laliga.getByTestId("col-kalshi-error"))
      .toContainText("kalshi markets fetch failed");
    // both La Liga fixtures are still ranked and listed
    await expect(laliga.getByTestId("picker-row")).toHaveCount(2);
  });

test("nothing on the board reads as advice", async ({ page }) => {
  await open(page);
  // the finished tail is part of the page and part of this promise, so
  // wait for its cards before snapshotting the body — a snapshot taken
  // mid-fetch would clear the tail's copy without ever reading it
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
  await expect(page.getByTestId("review-row").first()).toBeVisible();
  const body = (await page.textContent("body")) || "";
  expect(body).not.toMatch(/\b(TAKE|BUY NOW|SELL NOW|BET THIS|BET NOW)\b/);
  expect(body).not.toMatch(/confidence/i);
  expect(body).not.toMatch(/\b(we |our )?recommend(s|ed)?\b/i);
  // the page is allowed to say it is NOT one — that is the framing, not
  // a recommendation, and asserting its absence would delete the
  // sentence that does the work
  expect(body).toMatch(/nothing here is a recommendation/i);
  // and the framing states plainly who decides
  expect(body).toMatch(/you are the one who picks/i);
  expect(body).toMatch(/no model runs on this page/i);
});

test("an empty window says so in every column, and refusals stay listed",
  async ({ page }) => {
    await open(page, { ...BOARD, rows: [], refusals: [REFUSAL] });
    await expect(page.getByTestId("col-empty")).toHaveCount(4);
    await expect(page.getByTestId("col-empty").first())
      .toContainText("in the next 7 days");
    // the refusal is still listed at its column's foot — an empty board
    // is not an excuse to drop the thing that was refused
    await expect(page.getByTestId("picker-refusal")).toHaveCount(1);
    await expect(col(page, "epl").getByTestId("refusals"))
      .toContainText("Promoted Rovers FC");
  });

test("a failed backend names itself and shows no stale board",
  async ({ page }) => {
    await open(page, { detail: "picker board unavailable" }, 503);
    const err = page.getByTestId("board-error");
    await expect(err).toBeVisible();
    await expect(err).toContainText("picker board unavailable");
    await expect(page.getByTestId("picker-row")).toHaveCount(0);
  });

test("one league failing costs one column, not the page", async ({ page }) => {
  await open(page, {
    ...BOARD,
    leagues: {
      ...LEAGUES,
      mls: { src: null, min_current_gp: null, clubs: 0,
             error: "ConnectionError: standings fetch failed" },
    },
  });
  const mls = col(page, "mls");
  await expect(mls.getByTestId("col-error")).toBeVisible();
  await expect(mls.getByTestId("col-error"))
    .toContainText("standings fetch failed");
  // a FAILED league is not dressed as a quiet weekend
  await expect(mls.getByTestId("col-empty")).toHaveCount(0);
  // the rest of the board still rendered
  await expect(page.getByTestId("picker-row")).toHaveCount(4);
});

// ------------------------------------------------- per-column sorting

test("every sort mode reorders its column, and none of them filters",
  async ({ page }) => {
    await open(page, SORT_BOARD);
    const mls = col(page, "mls");
    const select = page.getByTestId("col-sort");
    for (const [modeId, want] of Object.entries(EXPECTED)) {
      await select.selectOption(modeId);
      await expect.poll(() => orderOf(mls), {
        message: `mode ${modeId} must order the column ${want.join(" → ")}`,
      }).toEqual(want);
      // SORT IS PRESENTATION: the same 4 rows in the column and the same
      // 8 on the page, under every single mode
      await expect(mls.getByTestId("picker-row")).toHaveCount(4);
      await expect(page.getByTestId("picker-row")).toHaveCount(8);
    }
    // the rank badge is the CURRENT position, not the default one
    await select.selectOption("kickoff");
    const first = mls.getByTestId("picker-row").first();
    await expect(first).toHaveAttribute("data-event", "m-delta");
    await expect(first.getByTestId("row-rank")).toHaveText("01");
    await expect(mls.getByTestId("picker-row").nth(3).getByTestId("row-rank"))
      .toHaveText("04");
  });

test("the direction toggle flips the measured rows; no-quote rows sort last both ways",
  async ({ page }) => {
    await open(page, SORT_BOARD);
    const mls = col(page, "mls");
    await page.getByTestId("col-sort").selectOption("ask");
    // the null policy is ON SCREEN while a book key is active
    await expect(page.getByTestId("col-null-note"))
      .toHaveText("no quote sorts last");
    await expect(page.getByTestId("col-dir")).toHaveAttribute("data-dir", "asc");
    await expect.poll(() => orderOf(mls))
      .toEqual(["m-alpha", "m-bravo", "m-charlie", "m-delta"]);
    await page.getByTestId("col-dir").click();
    await expect(page.getByTestId("col-dir")).toHaveAttribute("data-dir", "desc");
    // the priced rows reverse; the quoteless row is NOT "smallest" or
    // "largest" — it stays last under both directions
    await expect.poll(() => orderOf(mls))
      .toEqual(["m-charlie", "m-bravo", "m-alpha", "m-delta"]);
  });

test("the board sort moves every column together", async ({ page }) => {
  // sorting lives on the matchday since the C ship (2026-09-01): the
  // command-bar default applies to all four columns at once, and
  // per-DAY divergence is the band override's job (picker-blend-cup).
  await open(page, SORT_BOARD);
  const mls = col(page, "mls");
  const laliga = col(page, "laliga");
  await page.getByTestId("col-sort").selectOption("kickoff");
  await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
  // La Liga follows the same board sort: chronological too
  await expect.poll(() => orderOf(laliga))
    .toEqual(["401882901", "401882903"]);
});

test("the board's sort survives a reload, and reset returns (and forgets) the default",
  async ({ page }) => {
    await open(page, SORT_BOARD);
    const mls = col(page, "mls");
    // settle on the default order FIRST: the board renders client-side
    // after its fetch, and selecting into a still-mounting tree is the
    // race this test once lost
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
    await page.getByTestId("col-sort").selectOption("gdg");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.gdg);
    await page.reload();
    await expect(page.getByTestId("col-sort")).toHaveValue("gdg");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.gdg);
    // reset: default order, default control, and the stored choice gone
    await page.getByTestId("col-reset").click();
    await expect(page.getByTestId("col-sort")).toHaveValue("kickoff");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
    await page.reload();
    await expect(page.getByTestId("col-sort")).toHaveValue("kickoff");
    await expect(page.getByTestId("col-reset")).toHaveCount(0);
  });

test("a browser with no usable storage still renders, and still sorts",
  async ({ page }) => {
    // not merely EMPTY storage — a localStorage whose very accessor
    // throws (private windows, storage-off browsers)
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() { throw new Error("storage disabled"); },
      });
    });
    await open(page, SORT_BOARD);
    const mls = col(page, "mls");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
    await page.getByTestId("col-sort").selectOption("ppg");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.ppg);
  });

test("one column on a phone: league jump chips, and no horizontal scroll",
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page, SORT_BOARD);
    await expect(page.getByTestId("picker-row")).toHaveCount(8);
    const jump = page.getByTestId("league-jump");
    await expect(jump).toBeVisible();
    await expect(jump.locator("a")).toHaveCount(4);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth
      - document.documentElement.clientWidth);
    expect(overflow, "the page body must never scroll horizontally")
      .toBeLessThanOrEqual(0);
  });

test("a card's header is the way into its match page", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: /open Barcelona versus Rayo Vallecano/i })
    .click();
  await expect(page).toHaveURL(/\/bet-suggester\/laliga\/401882903/);
});

// ------------------------------------------------------- archive menu

test("the archive dropdown opens, holds the finished competitions, and closes",
  async ({ page }) => {
    await open(page);
    const button = page.getByRole("button", { name: /archive/i });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("menu")).toHaveCount(0);

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /World Cup 26/ }))
      .toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /ASEAN Championship/ }))
      .toBeVisible();
    // live competitions are NOT filed as finished
    await expect(menu.getByText(/Leagues Cup/)).toHaveCount(0);
    await expect(menu.getByText(/UCL/)).toHaveCount(0);

    // an outside click closes it
    await page.getByRole("heading", { name: "Every fixture, ranked" }).click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

test("the archive dropdown is operable from the keyboard alone",
  async ({ page }) => {
    await open(page);
    const button = page.getByRole("button", { name: /archive/i });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    // focus lands on the first item, not merely a highlight
    const items = page.getByRole("menuitem");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(items.first()).toBeFocused();
    // Escape closes and hands focus back
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

test("WC26 is reachable from the dropdown and nowhere in the carousel",
  async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: /archive/i }).click();
    await page.getByRole("menuitem", { name: /World Cup 26/ }).click();
    await expect(page).toHaveURL(/\/bet-suggester\/wc26$/);
    await expect(page.getByRole("heading", { name: /World Cup 26/ }).first())
      .toBeVisible();
  });

test("ASEAN is reachable from the dropdown", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: /archive/i }).click();
  await page.getByRole("menuitem", { name: /ASEAN Championship/ }).click();
  await expect(page).toHaveURL(/\/bet-suggester\/comp\/asean$/);
});

// ------------------------------------------------------ routes & links

test("the carousel is the four live leagues, and lands on MLS",
  async ({ page }) => {
    await page.goto("/bet-suggester/leagues");
    // four dots, four leagues — WC26 is not among them
    await expect(page.getByRole("button", { name: /^switch to /i }))
      .toHaveCount(4);
    await expect(page.getByRole("button", { name: /switch to World Cup/i }))
      .toHaveCount(0);
    await expect(page.getByRole("heading", { name: "MLS" }).first())
      .toBeVisible();
  });

test("an old ?league= deep link still lands on its league", async ({ page }) => {
  await page.goto("/bet-suggester?league=laliga");
  await expect(page).toHaveURL(/\/bet-suggester\/leagues\?league=laliga/);
  await expect(page.getByRole("heading", { name: "La Liga" }).first())
    .toBeVisible();
});

test("an old ?league=wc26 link lands on the archive page, not on a league",
  async ({ page }) => {
    await page.goto("/bet-suggester?league=wc26");
    // Next carries the source query through a config redirect, so the
    // landing URL is /bet-suggester/wc26?league=wc26. Harmless — the
    // archive page reads no query — but the PATH is the claim, so match
    // the path and let the leftover param be.
    await expect(page).toHaveURL(/\/bet-suggester\/wc26(\?|$)/);
    await expect(page.getByRole("heading", { name: /World Cup 26/ }).first())
      .toBeVisible();
  });

test("the site root is no longer the framework's starter page",
  async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/bet-suggester$/);
    const body = (await page.textContent("body")) || "";
    expect(body).not.toContain("To get started, edit");
  });

test("the picker proxy forwards board — unmocked on purpose",
  async ({ request }) => {
    // Every other test in this file mocks the fetch in the BROWSER, so
    // src/pages/api/picker/[...path].ts is never exercised by them —
    // which is exactly how the comp proxy's allowlist 404'd a real
    // backend route on prod behind nine green specs. This one hits the
    // real dev server. Whatever the backend answers (payload, error,
    // unreachable), the single response that proves the ALLOWLIST
    // rejected it is the proxy's own 404 body.
    const r = await request.get("/api/picker/board?days=2");
    expect(await r.text(), "board rejected by the proxy allowlist")
      .not.toContain("unknown picker route");
    // and a route that is not on the list is refused, by this file
    const bad = await request.get("/api/picker/decision");
    expect(await bad.text()).toContain("unknown picker route");
  });
// ============================== the finished tail ==========================
//
// Recorded shapes of GET /api/picker/review. The three narrative fixtures
// below are the REAL 2026-08-29/30 slate as the endpoint serves it — the
// ids, clubs, scores, tier gaps, checkpoints and verdicts are all taken
// from a live call, not invented — because the whole point of the tail is
// that a win from 44% of the shots and a win from 91% of them must not
// read the same, and only the real numbers prove the card does that.
//
// What these tests defend, in order of how much damage the failure does:
//
//   1. A RECONSTRUCTION MUST NEVER LOOK LIKE A CAPTURE. A capture is what
//      the picker actually said; a reconstruction was rebuilt afterwards
//      from an archive rewound to the kickoff. The second is weaker
//      evidence and has to LOOK weaker — asserted three ways here
//      (structure, word, and computed border), because a distinction
//      carried by colour alone is no distinction for a reader who cannot
//      see it or a test that cannot measure it.
//   2. TWO VERDICTS, NEVER ONE TICK. The scoreboard and the tape are
//      separate answers and either can be "not known", which is not a no.
//   3. NO TALLY. Nothing on this surface counts hits.
//   4. The tail's sorts REORDER and NEVER FILTER, on their own keys,
//      independently of the column above them.

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

/** A checkpoint, in the payload's own shape. Counts are favourite-blind
 *  (they are per SIDE); the shares are favourite-relative. */
function cp(over: Record<string, unknown>) {
  return {
    checkpoint: "20'", cutoff_minute: 20,
    home: { shots: 0, on_target: 0, corners: 0, crosses: 0, take_ons: 0, saves: 0 },
    away: { shots: 0, on_target: 0, corners: 0, crosses: 0, take_ons: 0, saves: 0 },
    score: { home: 0, away: 0 },
    included_plays: 300, fav_side: "home",
    shot_share: 0.5, tilt: 0.5, tilt_label: "CONTESTED",
    tilt_band: 0.65,
    tilt_note: "EXPLORATORY — NOT VALIDATED: band chosen by eye on "
      + "n=35/14/26, never preregistered; the label describes this row, "
      + "it forecasts nothing.",
    on_target: { fav: 0, opp: 0, lead: 0 },
    ...over,
  };
}

const CONFIRM_NOTE =
  "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The "
  + "confirm rule is: the favourite leads the card's threat tilt (band "
  + "patterns.TILT_THREAT) AND leads the on-target count.";

/** THE TEACHING CASE, HALF ONE. Vancouver won 3-0 away — and the opener
 *  was a 40th-minute penalty taken from 44% of the shots and NOTHING on
 *  target either way. Reconstructed: nothing was frozen for it. */
const VANCOUVER = {
  league: "mls", espn: "usa.1",
  event_id: "761762", competition_id: "761762",
  kickoff: hoursAgo(30),
  home: "Sporting Kansas City", away: "Vancouver Whitecaps",
  status_detail: "FT",
  result: { home: 0, away: 3, winner: "away", source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "reconstructed", origin_label: "RECONSTRUCTED",
    origin_note: "NOT a capture: rebuilt from the season archive rewound "
      + "to this kickoff, because no pre-kickoff board read was stored",
    captured_at: null, captured_seconds_before_kickoff: null,
    board_date: null,
    reconstructed_from: {
      season_file: "research_archive/apif_pro_topup_2026-08-30/"
        + "inplay_states_2026/states-mls-2026.json",
      season_file_sha256: "6d48a22cb784b575a03d915d517bb91e78c26fcc78",
      season_file_last_fixture: "2026-08-30T02:30:00+00:00",
      season_year: "2026", prior_file: null,
      results_in_table: 319, src: "current", min_current_gp: 20,
      rewound_to: "2026-08-30T00:30:00+00:00",
      archive_fixture_id: 1490429,
      archive_result: { home: 0, away: 3 },
      considered: [],
    },
    unavailable_reason: null,
    state: {
      refused: false, league: "mls",
      home: "Sporting Kansas City", away: "Vancouver Whitecaps",
      favourite: "Vancouver Whitecaps", opponent: "Sporting Kansas City",
      fav_side: "away", resolution: {},
      ppg_gap: 1.2857142857142856, gdg_gap: 2.8261904761904764, rank_gap: 28,
      gp_current: { home: 21, away: 20, min: 20 },
      src: "current", ranks: { fav: 2, opp: 30 },
      tiers: { ovr: [1, 5], atk: [1, 5], def: [1, 5] },
      tier_gaps: { ovr: 4, atk: 4, def: 4 }, shape: "CLEAN",
      event_id: null, kickoff: "2026-08-30T00:30:00+00:00",
    },
  },
  shot_state: {
    at_20: cp({
      checkpoint: "20'", cutoff_minute: 20, fav_side: "away",
      home: { shots: 2, on_target: 0, corners: 0, crosses: 1, take_ons: 4, saves: 1 },
      away: { shots: 3, on_target: 0, corners: 1, crosses: 5, take_ons: 2, saves: 1 },
      included_plays: 336,
      shot_share: 0.6, tilt: 0.6666666666666666, tilt_label: "TILT_FAV",
      on_target: { fav: 0, opp: 0, lead: 0 },
    }),
    before_first_goal: cp({
      checkpoint: "before 40'", cutoff_minute: 39, fav_side: "away",
      home: { shots: 5, on_target: 0, corners: 0, crosses: 5, take_ons: 5, saves: 1 },
      away: { shots: 4, on_target: 0, corners: 1, crosses: 7, take_ons: 2, saves: 2 },
      included_plays: 566,
      shot_share: 0.4444444444444444, tilt: 0.5, tilt_label: "CONTESTED",
      on_target: { fav: 0, opp: 0, lead: 0 },
    }),
    full_time: cp({
      checkpoint: "FT", cutoff_minute: null, fav_side: "away",
      home: { shots: 8, on_target: 0, corners: 2, crosses: 14, take_ons: 21, saves: 4 },
      away: { shots: 16, on_target: 6, corners: 4, crosses: 12, take_ons: 8, saves: 5 },
      score: { home: 0, away: 3 }, included_plays: 1332,
      shot_share: 0.6666666666666666, tilt: 0.7222222222222222,
      tilt_label: "TILT_FAV",
      on_target: { fav: 6, opp: 0, lead: 6 },
    }),
    first_goal_minute: 40, error: null,
  },
  fit: {
    favourite_won: true, favourite_won_reason: "winner=away fav_side=away",
    confirmed_at_20: false,
    confirm_reason: "tilt_label=TILT_FAV on_target 0-0",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
};

/** THE TEACHING CASE, HALF TWO. Nashville won 4-0 with 91% of the shots
 *  and a 3-1 on-target lead before the 43rd-minute opener. Same word on
 *  the scoreboard as Vancouver; the opposite picture underneath. */
const NASHVILLE = {
  league: "mls", espn: "usa.1",
  event_id: "761764", competition_id: "761764",
  kickoff: hoursAgo(30),
  home: "Nashville SC", away: "FC Cincinnati",
  status_detail: "FT",
  result: { home: 4, away: 0, winner: "home", source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "reconstructed", origin_label: "RECONSTRUCTED",
    origin_note: "NOT a capture",
    captured_at: null, captured_seconds_before_kickoff: null,
    board_date: null,
    reconstructed_from: {
      season_file: "research_archive/apif_pro_topup_2026-08-30/"
        + "inplay_states_2026/states-mls-2026.json",
      season_file_sha256: "6d48a22cb784b575a03d915d517bb91e78c26fcc78",
      season_file_last_fixture: "2026-08-30T02:30:00+00:00",
      season_year: "2026", prior_file: null,
      results_in_table: 319, src: "current", min_current_gp: 20,
      rewound_to: "2026-08-30T00:30:00+00:00",
      archive_fixture_id: 1490428,
      archive_result: { home: 4, away: 0 },
      considered: [],
    },
    unavailable_reason: null,
    state: {
      refused: false, league: "mls",
      home: "Nashville SC", away: "FC Cincinnati",
      favourite: "Nashville SC", opponent: "FC Cincinnati",
      fav_side: "home", resolution: {},
      ppg_gap: 0.8333333333333335, gdg_gap: 1.138095238095238, rank_gap: 11,
      gp_current: { home: 21, away: 20, min: 20 },
      src: "current", ranks: { fav: 1, opp: 12 },
      tiers: { ovr: [1, 2], atk: [1, 1], def: [1, 5] },
      tier_gaps: { ovr: 1, atk: 0, def: 4 }, shape: "SPLIT",
      event_id: null, kickoff: "2026-08-30T00:30:00+00:00",
    },
  },
  shot_state: {
    at_20: cp({
      checkpoint: "20'", cutoff_minute: 20, fav_side: "home",
      home: { shots: 6, on_target: 2, corners: 1, crosses: 4, take_ons: 6, saves: 1 },
      away: { shots: 1, on_target: 1, corners: 1, crosses: 1, take_ons: 3, saves: 4 },
      included_plays: 323,
      shot_share: 0.8571428571428571, tilt: 0.75, tilt_label: "TILT_FAV",
      on_target: { fav: 2, opp: 1, lead: 1 },
    }),
    before_first_goal: cp({
      checkpoint: "before 43'", cutoff_minute: 42, fav_side: "home",
      home: { shots: 10, on_target: 3, corners: 3, crosses: 11, take_ons: 15, saves: 1 },
      away: { shots: 1, on_target: 1, corners: 1, crosses: 4, take_ons: 5, saves: 8 },
      included_plays: 616,
      shot_share: 0.9090909090909091, tilt: 0.8421052631578947,
      tilt_label: "TILT_FAV",
      on_target: { fav: 3, opp: 1, lead: 2 },
    }),
    full_time: cp({
      checkpoint: "FT", cutoff_minute: null, fav_side: "home",
      home: { shots: 19, on_target: 7, corners: 6, crosses: 16, take_ons: 25, saves: 10 },
      away: { shots: 15, on_target: 6, corners: 4, crosses: 15, take_ons: 12, saves: 11 },
      score: { home: 4, away: 0 }, included_plays: 1312,
      shot_share: 0.5588235294117647, tilt: 0.5614035087719298,
      tilt_label: "CONTESTED",
      on_target: { fav: 7, opp: 6, lead: 1 },
    }),
    first_goal_minute: 43, error: null,
  },
  fit: {
    favourite_won: true, favourite_won_reason: "winner=home fav_side=home",
    confirmed_at_20: true,
    confirm_reason: "tilt_label=TILT_FAV on_target 2-1",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
};

/** A CAPTURED read — the strong case, and the only one that can carry a
 *  price, because a reconstruction has no book. The favourite LOST, which
 *  matters: a captured card must not be the card that always says yes. */
const CAPTURED = {
  league: "mls", espn: "usa.1",
  event_id: "761770", competition_id: "761770",
  kickoff: hoursAgo(6),
  home: "Austin FC", away: "Portland Timbers",
  status_detail: "FT",
  result: { home: 2, away: 1, winner: "home", source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "captured", origin_label: "CAPTURED",
    origin_note: "frozen from the live board before kickoff — this is what "
      + "the picker actually said",
    captured_at: hoursAgo(14),
    captured_seconds_before_kickoff: 29040,     // 8h 4m
    board_date: "20260830",
    reconstructed_from: null, unavailable_reason: null,
    state: {
      refused: false, league: "mls",
      home: "Austin FC", away: "Portland Timbers",
      favourite: "Portland Timbers", opponent: "Austin FC",
      fav_side: "away", resolution: {},
      ppg_gap: 0.6, gdg_gap: 0.9, rank_gap: 9,
      gp_current: { home: 22, away: 21, min: 21 },
      src: "current", ranks: { fav: 4, opp: 13 },
      tiers: { ovr: [2, 3], atk: [2, 4], def: [1, 3] },
      tier_gaps: { ovr: 1, atk: 2, def: 2 }, shape: "CLEAN",
      event_id: "761770", kickoff: hoursAgo(6),
      kalshi: {
        event_ticker: "KXMLSGAME-SAMPLE-ATXPOR",
        ticker: "KXMLSGAME-SAMPLE-ATXPOR-POR",
        ask_c: 58, bid_c: 54, spread_c: 4,
        ask_size: 210, bid_size: 180, flags: ["WIDE"],
      },
    },
  },
  shot_state: {
    at_20: cp({
      checkpoint: "20'", cutoff_minute: 20, fav_side: "away",
      home: { shots: 4, on_target: 2, corners: 2, crosses: 3, take_ons: 5, saves: 0 },
      away: { shots: 2, on_target: 0, corners: 0, crosses: 2, take_ons: 1, saves: 2 },
      included_plays: 280,
      shot_share: 0.3333333333333333, tilt: 0.25, tilt_label: "TILT_OPP",
      on_target: { fav: 0, opp: 2, lead: -2 },
    }),
    before_first_goal: cp({
      checkpoint: "before 12'", cutoff_minute: 11, fav_side: "away",
      home: { shots: 3, on_target: 2, corners: 1, crosses: 2, take_ons: 3, saves: 0 },
      away: { shots: 1, on_target: 0, corners: 0, crosses: 1, take_ons: 0, saves: 1 },
      included_plays: 150,
      shot_share: 0.25, tilt: 0.16666666666666666, tilt_label: "TILT_OPP",
      on_target: { fav: 0, opp: 2, lead: -2 },
    }),
    full_time: cp({
      checkpoint: "FT", cutoff_minute: null, fav_side: "away",
      home: { shots: 14, on_target: 6, corners: 5, crosses: 12, take_ons: 18, saves: 3 },
      away: { shots: 11, on_target: 3, corners: 3, crosses: 9, take_ons: 10, saves: 5 },
      score: { home: 2, away: 1 }, included_plays: 1200,
      shot_share: 0.44, tilt: 0.42, tilt_label: "CONTESTED",
      on_target: { fav: 3, opp: 6, lead: -3 },
    }),
    first_goal_minute: 12, error: null,
  },
  fit: {
    favourite_won: false, favourite_won_reason: "winner=home fav_side=away",
    confirmed_at_20: false,
    confirm_reason: "tilt_label=TILT_OPP on_target 0-2",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
};

/** NO READ AT ALL — nothing frozen, and the archive stops before the
 *  match. A third state, not an empty version of the other two: the score
 *  and the tape are still here, both verdicts read "not known", and the
 *  files that were looked at are named so the staleness is fixable. */
const NO_READ = {
  league: "laliga", espn: "esp.1",
  event_id: "401882903", competition_id: "401882903",
  kickoff: hoursAgo(20),
  home: "Barcelona", away: "Rayo Vallecano",
  status_detail: "FT",
  result: { home: 5, away: 2, winner: "home", source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "reconstructed", origin_label: "NOT AVAILABLE",
    origin_note: "no stored read, and the archive cannot rebuild one",
    captured_at: null, captured_seconds_before_kickoff: null,
    board_date: null,
    reconstructed_from: {
      season_file: null,
      considered: [
        { path: "research_archive/apif_pro_topup_2026-08-30/"
            + "inplay_states_2026/states-la-liga-2026.json",
          last_fixture: "2026-08-30T15:00:00+00:00" },
      ],
    },
    unavailable_reason: "fixture_not_in_archive",
    state: null,
  },
  shot_state: {
    at_20: cp({
      checkpoint: "20'", cutoff_minute: 20, fav_side: null,
      home: { shots: 5, on_target: 3, corners: 2, crosses: 4, take_ons: 7, saves: 1 },
      away: { shots: 1, on_target: 0, corners: 0, crosses: 1, take_ons: 2, saves: 3 },
      included_plays: 310,
      shot_share: null, tilt: null, tilt_label: null, on_target: null,
    }),
    before_first_goal: cp({
      checkpoint: "before 9'", cutoff_minute: 8, fav_side: null,
      home: { shots: 2, on_target: 1, corners: 1, crosses: 2, take_ons: 3, saves: 0 },
      away: { shots: 0, on_target: 0, corners: 0, crosses: 0, take_ons: 1, saves: 1 },
      included_plays: 120,
      shot_share: null, tilt: null, tilt_label: null, on_target: null,
    }),
    full_time: cp({
      checkpoint: "FT", cutoff_minute: null, fav_side: null,
      home: { shots: 22, on_target: 11, corners: 7, crosses: 18, take_ons: 24, saves: 4 },
      away: { shots: 9, on_target: 4, corners: 2, crosses: 11, take_ons: 9, saves: 9 },
      score: { home: 5, away: 2 }, included_plays: 1400,
      shot_share: null, tilt: null, tilt_label: null, on_target: null,
    }),
    first_goal_minute: 9, error: null,
  },
  fit: {
    favourite_won: null, favourite_won_reason: "no_pre_kickoff_favourite",
    confirmed_at_20: null, confirm_reason: "no_pre_kickoff_favourite",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
};

/** A DEAD PLAYS FEED. The match still appears, with its score and its
 *  pre-kickoff read; only the tape is missing, and it is named. */
const NO_TAPE = {
  ...NASHVILLE,
  league: "epl", espn: "eng.1",
  event_id: "401879295", competition_id: "401879295",
  kickoff: hoursAgo(50),
  home: "Chelsea", away: "Brighton & Hove Albion",
  result: { home: 4, away: 3, winner: "home", source: "espn_scoreboard" },
  pre_kickoff: {
    ...NASHVILLE.pre_kickoff,
    state: {
      ...NASHVILLE.pre_kickoff.state,
      league: "epl", home: "Chelsea", away: "Brighton & Hove Albion",
      favourite: "Chelsea", opponent: "Brighton & Hove Albion",
    },
  },
  shot_state: {
    at_20: null, before_first_goal: null, full_time: null,
    first_goal_minute: null,
    error: "HTTPError: plays feed 502",
  },
  fit: {
    favourite_won: true, favourite_won_reason: "winner=home fav_side=home",
    confirmed_at_20: null, confirm_reason: "no_shot_state",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
};

/** A `post` fixture that never actually completed. Listed, never read as
 *  a nil-nil — that would invent a match nobody played. */
const NOT_PLAYED = {
  league: "ligamx", espn: "mex.1",
  event_id: "401876999", competition_id: "401876999",
  kickoff: hoursAgo(40),
  home: "Puebla", away: "Necaxa",
  status_detail: "Postponed",
  reason: "not_completed",
};

const REVIEW_LEAGUES = {
  mls: { finished: 3, captured: 1, reconstructed: 2, unavailable: 0, error: null },
  epl: { finished: 1, captured: 0, reconstructed: 1, unavailable: 0, error: null },
  laliga: { finished: 1, captured: 0, reconstructed: 0, unavailable: 1, error: null },
  ligamx: { finished: 0, captured: 0, reconstructed: 0, unavailable: 0, error: null },
};

const REVIEW = {
  generated_at: new Date().toISOString(),
  date: "20260831", back: 7,
  window: { from: "20260824", to: "20260831" },
  store: { backend: "postgres", writable: true },
  leagues: REVIEW_LEAGUES,
  // deliberately NOT in kickoff order — the tail must sort itself
  finished: [NASHVILLE, CAPTURED, NO_TAPE, VANCOUVER, NO_READ],
  refusals: [NOT_PLAYED],
};

// ---- a synthetic MLS tail where EVERY sort key separates the rows ------
// Five finished fixtures whose ten sortable values produce TEN DISTINCT
// orders, so a mode that silently falls back to another key cannot stay
// green. ECHO is the null row: no pre-kickoff read, no tape, no verdict —
// it has a value under none of the ten keys and must sort last under all
// of them, in both directions.
function finishedRow(over: Record<string, unknown>) {
  return {
    league: "mls", espn: "usa.1",
    status_detail: "FT",
    result: { home: 1, away: 0, winner: "home", source: "espn_scoreboard" },
    ...over,
  };
}

/** A pre-kickoff read, either origin, with the four sortable numbers. */
function sortRead(origin: "captured" | "reconstructed",
                  o: { gdg: number; ppg: number; rank: number; ovr: number }) {
  const state = {
    refused: false, league: "mls", home: "H", away: "A",
    favourite: "H", opponent: "A", fav_side: "home", resolution: {},
    ppg_gap: o.ppg, gdg_gap: o.gdg, rank_gap: o.rank,
    gp_current: { home: 20, away: 20, min: 20 },
    src: "current", ranks: { fav: 1, opp: 10 },
    tiers: { ovr: [1, 3], atk: [1, 3], def: [1, 3] },
    tier_gaps: { ovr: o.ovr, atk: 1, def: 1 }, shape: "CLEAN",
    event_id: null, kickoff: null,
    ...(origin === "captured" ? { kalshi: null } : {}),
  };
  return origin === "captured"
    ? { origin, origin_label: "CAPTURED", origin_note: "frozen",
        captured_at: hoursAgo(40), captured_seconds_before_kickoff: 3600,
        board_date: "20260830", reconstructed_from: null,
        unavailable_reason: null, state }
    : { origin, origin_label: "RECONSTRUCTED", origin_note: "NOT a capture",
        captured_at: null, captured_seconds_before_kickoff: null,
        board_date: null,
        reconstructed_from: {
          season_file: "research_archive/x/states-mls-2026.json",
          rewound_to: "2026-08-30T00:30:00+00:00", results_in_table: 300,
          src: "current", min_current_gp: 20, prior_file: null,
          considered: [],
        },
        unavailable_reason: null, state };
}

function sortShots(ft: number | null, at20: number | null) {
  if (ft == null || at20 == null) {
    return { at_20: null, before_first_goal: null, full_time: null,
             first_goal_minute: null, error: null };
  }
  return {
    at_20: cp({ checkpoint: "20'", cutoff_minute: 20, shot_share: at20,
                tilt: at20, tilt_label: at20 >= 0.65 ? "TILT_FAV" : "CONTESTED",
                on_target: { fav: 1, opp: 0, lead: 1 } }),
    before_first_goal: cp({ checkpoint: "before 30'", cutoff_minute: 29,
                            shot_share: at20, tilt: at20,
                            tilt_label: "CONTESTED",
                            on_target: { fav: 1, opp: 0, lead: 1 } }),
    full_time: cp({ checkpoint: "FT", cutoff_minute: null, shot_share: ft,
                    tilt: ft, tilt_label: "CONTESTED",
                    on_target: { fav: 2, opp: 1, lead: 1 } }),
    first_goal_minute: 30, error: null,
  };
}

function sortFit(won: boolean | null, conf: boolean | null) {
  return {
    favourite_won: won,
    favourite_won_reason: won == null ? "no_pre_kickoff_favourite" : "winner=home",
    confirmed_at_20: conf,
    confirm_reason: conf == null ? "no_shot_state" : "tilt_label=TILT_FAV",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  };
}

const S_ALFA = finishedRow({
  event_id: "f-alfa", competition_id: "f-alfa", kickoff: hoursAgo(6),
  home: "Alfa SC", away: "Alfa Opp",
  pre_kickoff: sortRead("captured", { gdg: 0.50, ppg: 1.29, rank: 3, ovr: 2 }),
  shot_state: sortShots(0.667, 0.600), fit: sortFit(false, true),
});
const S_BRAVO = finishedRow({
  event_id: "f-bravo", competition_id: "f-bravo", kickoff: hoursAgo(30),
  home: "Bravo SC", away: "Bravo Opp",
  pre_kickoff: sortRead("reconstructed", { gdg: 2.83, ppg: 0.20, rank: 11, ovr: 4 }),
  shot_state: sortShots(0.559, 0.857), fit: sortFit(true, false),
});
const S_CHARLIE = finishedRow({
  event_id: "f-charlie", competition_id: "f-charlie", kickoff: hoursAgo(54),
  home: "Charlie SC", away: "Charlie Opp",
  pre_kickoff: sortRead("reconstructed", { gdg: 1.14, ppg: 0.83, rank: 28, ovr: 1 }),
  shot_state: sortShots(0.400, 0.300), fit: sortFit(true, true),
});
const S_DELTA = finishedRow({
  event_id: "f-delta", competition_id: "f-delta", kickoff: hoursAgo(78),
  home: "Delta SC", away: "Delta Opp",
  pre_kickoff: sortRead("captured", { gdg: 1.90, ppg: 0.55, rank: 7, ovr: 3 }),
  shot_state: sortShots(0.720, 0.450), fit: sortFit(false, false),
});
// The null row: no read, no tape, no verdict. Under every key it has
// nothing, and "nothing" is neither small nor large.
const S_ECHO = finishedRow({
  event_id: "f-echo", competition_id: "f-echo", kickoff: hoursAgo(102),
  home: "Echo SC", away: "Echo Opp",
  pre_kickoff: {
    origin: "reconstructed", origin_label: "NOT AVAILABLE",
    origin_note: "no stored read, and the archive cannot rebuild one",
    captured_at: null, captured_seconds_before_kickoff: null,
    board_date: null,
    reconstructed_from: { season_file: null, considered: [] },
    unavailable_reason: "fixture_not_in_archive", state: null,
  },
  shot_state: sortShots(null, null), fit: sortFit(null, null),
});

const REVIEW_SORT = {
  ...REVIEW,
  leagues: {
    ...REVIEW_LEAGUES,
    mls: { finished: 5, captured: 2, reconstructed: 2, unavailable: 1,
           error: null },
    epl: { finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
           error: null },
    laliga: { finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
              error: null },
  },
  // deliberately shuffled — the tail must apply its own default
  finished: [S_CHARLIE, S_ALFA, S_ECHO, S_DELTA, S_BRAVO],
  refusals: [],
};

// The order each mode must produce in the MLS tail (by data-event).
// Ten modes, ten distinct orders, worked out from the values above.
const REVIEW_EXPECTED: Record<string, string[]> = {
  kickoff:   ["f-alfa", "f-bravo", "f-charlie", "f-delta", "f-echo"],
  gdg:       ["f-bravo", "f-delta", "f-charlie", "f-alfa", "f-echo"],
  ppg:       ["f-alfa", "f-charlie", "f-delta", "f-bravo", "f-echo"],
  rank:      ["f-charlie", "f-bravo", "f-delta", "f-alfa", "f-echo"],
  tier_ovr:  ["f-bravo", "f-delta", "f-alfa", "f-charlie", "f-echo"],
  fav_won:   ["f-bravo", "f-charlie", "f-alfa", "f-delta", "f-echo"],
  confirmed: ["f-alfa", "f-charlie", "f-bravo", "f-delta", "f-echo"],
  share_ft:  ["f-delta", "f-alfa", "f-bravo", "f-charlie", "f-echo"],
  share_20:  ["f-bravo", "f-alfa", "f-delta", "f-charlie", "f-echo"],
  origin:    ["f-alfa", "f-delta", "f-bravo", "f-charlie", "f-echo"],
};

const tail = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="review-tail"][data-league="${slug}"]`);

const tailOrder = (t: ReturnType<typeof tail>) =>
  t.getByTestId("review-row")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));

const card = (page: import("@playwright/test").Page, event: string) =>
  page.locator(`[data-testid="review-row"][data-event="${event}"]`);

// ------------------------------------------------ the tail exists at all

test("every league column carries a finished tail, below its upcoming fixtures",
  async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("review-tail")).toHaveCount(4);
    // it is a TAIL: inside the column, after the last upcoming card.
    // Rendering the review as a sibling section, or above the fixtures,
    // would break the one thing the placement is for — a league's story
    // read top to bottom in the place the operator already looks.
    const positions = await col(page, "mls").evaluate((colEl) => {
      const nodes = [...colEl.querySelectorAll(
        '[data-testid="picker-row"],[data-testid="review-tail"]')];
      return nodes.map((n) => n.getAttribute("data-testid"));
    });
    expect(positions[positions.length - 1]).toBe("review-tail");
    // three MLS matches finished, and the tail counts them and says over
    // what window
    const mls = tail(page, "mls");
    await expect(mls.getByTestId("review-row")).toHaveCount(3);
    await expect(mls.getByTestId("review-count"))
      .toHaveText("3 matches · last 7d");
    // and it opens most-recent-first, from a payload served out of order
    await expect.poll(() => tailOrder(mls))
      .toEqual(["761770", "761764", "761762"]);
  });

test("the tail's provenance line counts evidence, against its own n",
  async ({ page }) => {
    await open(page);
    // 1 captured + 2 reconstructed + 0 unavailable, out of the 3 printed
    // beside them. These are counts of what KIND of read exists — not of
    // outcomes, which are never tallied anywhere on this page.
    await expect(tail(page, "mls").getByTestId("review-provenance"))
      .toHaveText("of 3: 1 captured · 2 reconstructed · 0 with no read");
  });

// ------------------------------------- captured is not reconstructed

test("a captured read and a reconstructed read are not drawn the same",
  async ({ page }) => {
    await open(page);
    const captured = card(page, "761770");
    const rebuilt = card(page, "761762");
    await expect(captured).toHaveAttribute("data-origin", "captured");
    await expect(rebuilt).toHaveAttribute("data-origin", "reconstructed");

    // 1 — DIFFERENT WORDS
    await expect(captured.getByTestId("origin-chip")).toHaveText("captured");
    await expect(rebuilt.getByTestId("origin-chip")).toHaveText("reconstructed");
    await expect(rebuilt.getByTestId("recon-warning"))
      .toContainText("NOT a capture");

    // 2 — DIFFERENT STRUCTURE. The capture carries a clock the rebuild
    // cannot have; the rebuild carries a provenance block the capture has
    // no use for. A reader who cannot see colour still gets the fact.
    await expect(captured.getByTestId("capture-clock")).toBeVisible();
    await expect(captured.getByTestId("capture-clock"))
      .toContainText("8h 4m before kickoff");
    await expect(captured.getByTestId("capture-clock"))
      .toContainText("board 20260830");
    await expect(captured.getByTestId("recon-provenance")).toHaveCount(0);
    await expect(captured.getByTestId("recon-warning")).toHaveCount(0);
    await expect(rebuilt.getByTestId("capture-clock")).toHaveCount(0);
    await expect(rebuilt.getByTestId("recon-provenance")).toBeVisible();

    // 3 — DIFFERENT INK, measured rather than assumed
    const rail = (c: ReturnType<typeof card>) =>
      c.getByTestId("pre-kickoff").evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.borderLeftColor, style: s.borderLeftStyle };
      });
    const a = await rail(captured);
    const b = await rail(rebuilt);
    expect(a.color, "a capture and a rebuild must not share a rail colour")
      .not.toBe(b.color);
    expect(a.style).toBe("solid");
    expect(b.style, "the weaker evidence is the dashed one").toBe("dashed");

    // and the provenance actually discloses something auditable
    await rebuilt.getByRole("button", { name: "provenance" }).click();
    await expect(rebuilt.getByTestId("recon-provenance"))
      .toContainText("states-mls-2026.json");
    await expect(rebuilt.getByTestId("recon-provenance"))
      .toContainText("2026-08-30T00:30:00+00:00");
    await expect(rebuilt.getByTestId("recon-provenance"))
      .toContainText("319");
  });

test("only a captured read can carry a price, and a rebuild says why it has none",
  async ({ page }) => {
    await open(page);
    // the capture froze the whole board row, book and all
    await expect(card(page, "761770").getByText("ask 58¢")).toBeVisible();
    await expect(card(page, "761770").getByText("spread 4¢")).toBeVisible();
    // the rebuild has NO BOOK — a property of rebuilding, named rather
    // than left as an empty cell that reads like a missing quote
    await expect(card(page, "761762").getByTestId("no-price"))
      .toContainText("a rebuilt read has no book snapshot");
  });

test("no read at all is a third state, not an empty version of the other two",
  async ({ page }) => {
    await open(page);
    const none = card(page, "401882903");
    await expect(none).toHaveAttribute("data-origin", "unavailable");
    await expect(none.getByTestId("origin-chip"))
      .toHaveText("no pre-kickoff read");
    await expect(none).toContainText("fixture_not_in_archive");
    // the archive files that were looked at are named — "the archive
    // stops before this match" is fixable, and invisible otherwise
    await expect(none.getByTestId("recon-considered"))
      .toContainText("states-la-liga-2026.json");
    // the match is still here, with its score and its tape
    await expect(none.getByTestId("review-score")).toContainText("5–2");
    await expect(none.getByTestId("checkpoint")).toHaveCount(3);
    // and BOTH verdicts read "not known" — never "no"
    await expect(none.getByTestId("fit-result"))
      .toHaveAttribute("data-value", "unknown");
    await expect(none.getByTestId("fit-read"))
      .toHaveAttribute("data-value", "unknown");
    await expect(none.getByTestId("fit-result")).toContainText("not known");
  });

// ------------------------------------- the two wins must read differently

test("a win on a penalty from a low share reads nothing like a win from dominance",
  async ({ page }) => {
    await open(page);
    const vancouver = card(page, "761762");
    const nashville = card(page, "761764");

    // the scoreboard says the SAME thing about both
    await expect(vancouver).toHaveAttribute("data-fav-won", "yes");
    await expect(nashville).toHaveAttribute("data-fav-won", "yes");
    await expect(vancouver.getByTestId("review-score")).toContainText("0–3");
    await expect(nashville.getByTestId("review-score")).toContainText("4–0");

    // the tape says the OPPOSITE. Vancouver's opener was a 40th-minute
    // penalty from 44% of the shots and nothing on target either way;
    // Nashville's came off 91% and a 3-1 on-target lead.
    const vanBefore = vancouver.locator('[data-cp="before_first_goal"]');
    const nasBefore = nashville.locator('[data-cp="before_first_goal"]');
    await expect(vanBefore).toHaveAttribute("data-share", "0.4444");
    await expect(nasBefore).toHaveAttribute("data-share", "0.9091");
    await expect(vanBefore.getByTestId("cp-share")).toHaveText("44%");
    await expect(nasBefore.getByTestId("cp-share")).toHaveText("91%");
    await expect(vanBefore.getByTestId("cp-tilt"))
      .toHaveAttribute("data-tilt", "CONTESTED");
    await expect(nasBefore.getByTestId("cp-tilt"))
      .toHaveAttribute("data-tilt", "TILT_FAV");
    // the raw counts ride along — a bare share hides that 0-0 on target
    // and 3-1 on target are different matches
    await expect(vanBefore).toContainText("on target 0–0");
    await expect(nasBefore).toContainText("on target 3–1");

    // the bars are drawn at those widths, so the difference is visible
    // before a single number is read
    const width = (c: ReturnType<typeof card>) =>
      c.locator('[data-cp="before_first_goal"] [data-testid="share-bar"] > div')
        .evaluate((el) => (el as HTMLElement).style.width);
    expect(await width(vancouver)).toBe("44%");
    expect(await width(nashville)).toBe("91%");

    // and the sentence says it in words, derived from those numbers
    await expect(vancouver.getByTestId("tape-sentence"))
      .toContainText("Before the 40' opener");
    await expect(vancouver.getByTestId("tape-sentence"))
      .toContainText("the tape was level");
    await expect(nashville.getByTestId("tape-sentence"))
      .toContainText("the tape was already tilted their way");

    // which is exactly where the two verdicts part company
    await expect(vancouver.getByTestId("fit-read"))
      .toHaveAttribute("data-value", "no");
    await expect(nashville.getByTestId("fit-read"))
      .toHaveAttribute("data-value", "yes");
  });

test("every finished card shows both verdicts, never one merged tick",
  async ({ page }) => {
    await open(page);
    const cards = page.getByTestId("review-row");
    await expect(cards).toHaveCount(5);
    // both components, on every single card, with their own labels
    await expect(page.getByTestId("fit-result")).toHaveCount(5);
    await expect(page.getByTestId("fit-read")).toHaveCount(5);
    const van = card(page, "761762");
    await expect(van.getByTestId("fit-result")).toContainText("favourite won");
    await expect(van.getByTestId("fit-result")).toContainText("yes");
    await expect(van.getByTestId("fit-read")).toContainText("in-play read at 20'");
    await expect(van.getByTestId("fit-read")).toContainText("did not confirm");
    // the reason for each is on the card, not buried in a tooltip
    await expect(van.getByTestId("fit-read"))
      .toContainText("tilt_label=TILT_FAV on_target 0-0");
    // and the rule is labelled exploratory wherever it is used
    await expect(van.getByTestId("confirm-note"))
      .toContainText("NOT PREREGISTERED");
    // a captured card whose favourite LOST shows the disagreement the
    // other way round: no on the scoreboard, no on the tape
    await expect(card(page, "761770").getByTestId("fit-result"))
      .toHaveAttribute("data-value", "no");
  });

test("a dead plays feed costs the tape, not the match", async ({ page }) => {
  await open(page);
  const c = card(page, "401879295");
  await expect(c.getByTestId("shot-error"))
    .toContainText("plays feed 502");
  // the score and the pre-kickoff read are untouched
  await expect(c.getByTestId("review-score")).toContainText("4–3");
  await expect(c.getByTestId("pre-kickoff")).toBeVisible();
  // the scoreboard verdict stands; the tape verdict is NOT KNOWN, not "no"
  await expect(c.getByTestId("fit-result")).toHaveAttribute("data-value", "yes");
  await expect(c.getByTestId("fit-read")).toHaveAttribute("data-value", "unknown");
});

// -------------------------------------------------- the tail's own sorts

test("every finished sort mode reorders its tail, and none of them filters",
  async ({ page }) => {
    await open(page, BOARD, 200, REVIEW_SORT);
    const mls = tail(page, "mls");
    await expect(mls.getByTestId("review-row")).toHaveCount(5);
    const select = mls.getByTestId("review-sort");
    // the tail opens on ITS OWN default — most recent kickoff first
    await expect(select).toHaveValue("kickoff");
    await expect(mls.getByTestId("review-dir"))
      .toHaveAttribute("data-dir", "desc");
    for (const [modeId, want] of Object.entries(REVIEW_EXPECTED)) {
      await select.selectOption(modeId);
      await expect.poll(() => tailOrder(mls), {
        message: `finished mode ${modeId} must order the tail ${want.join(" → ")}`,
      }).toEqual(want);
      // SORT IS PRESENTATION: the same 5 rows, under every single mode
      await expect(mls.getByTestId("review-row")).toHaveCount(5);
      await expect(page.getByTestId("review-row")).toHaveCount(5);
      // the rank badge follows the CURRENT order
      await expect(mls.getByTestId("review-row").first()
        .getByTestId("review-rank")).toHaveText("01");
    }
  });

test("the finished direction toggle flips the measured rows; a row with nothing to measure sorts last both ways",
  async ({ page }) => {
    await open(page, BOARD, 200, REVIEW_SORT);
    const mls = tail(page, "mls");
    await mls.getByTestId("review-sort").selectOption("share_ft");
    await expect(mls.getByTestId("review-null-note"))
      .toHaveText("no shot state sorts last");
    await expect.poll(() => tailOrder(mls)).toEqual(REVIEW_EXPECTED.share_ft);
    await mls.getByTestId("review-dir").click();
    await expect(mls.getByTestId("review-dir"))
      .toHaveAttribute("data-dir", "asc");
    // the measured rows reverse; ECHO has no shot state and is neither the
    // smallest nor the largest — it stays last
    await expect.poll(() => tailOrder(mls))
      .toEqual(["f-charlie", "f-bravo", "f-alfa", "f-delta", "f-echo"]);
    // the same rule under a VERDICT key, where "not known" is the absence
    await mls.getByTestId("review-sort").selectOption("fav_won");
    await expect(mls.getByTestId("review-null-note"))
      .toContainText("a missing verdict is not");
    await expect.poll(() => tailOrder(mls)).toEqual(REVIEW_EXPECTED.fav_won);
    await mls.getByTestId("review-dir").click();
    await expect.poll(() => tailOrder(mls))
      .toEqual(["f-alfa", "f-delta", "f-bravo", "f-charlie", "f-echo"]);
  });

test("the finished tail sorts independently of the column above it",
  async ({ page }) => {
    await open(page, SORT_BOARD, 200, REVIEW_SORT);
    const colMls = col(page, "mls");
    const tailMls = tail(page, "mls");
    // move the UPCOMING column: the tail below it does not budge
    await page.getByTestId("col-sort").selectOption("ask");
    await expect.poll(() => orderOf(colMls)).toEqual(EXPECTED.ask);
    await expect(tailMls.getByTestId("review-sort")).toHaveValue("kickoff");
    await expect.poll(() => tailOrder(tailMls))
      .toEqual(REVIEW_EXPECTED.kickoff);
    // move the TAIL: the column above it does not budge either
    await tailMls.getByTestId("review-sort").selectOption("gdg");
    await expect.poll(() => tailOrder(tailMls)).toEqual(REVIEW_EXPECTED.gdg);
    await expect(page.getByTestId("col-sort")).toHaveValue("ask");
    await expect.poll(() => orderOf(colMls)).toEqual(EXPECTED.ask);
    // and another league's tail kept its own default
    await expect(tail(page, "epl").getByTestId("review-sort"))
      .toHaveCount(0);          // no rows there, so no control
  });

test("a finished tail's sort survives a reload, and reset returns (and forgets) the default",
  async ({ page }) => {
    await open(page, BOARD, 200, REVIEW_SORT);
    const mls = tail(page, "mls");
    await mls.getByTestId("review-sort").selectOption("rank");
    await expect.poll(() => tailOrder(mls)).toEqual(REVIEW_EXPECTED.rank);
    await page.reload();
    await expect(mls.getByTestId("review-sort")).toHaveValue("rank");
    await expect.poll(() => tailOrder(mls)).toEqual(REVIEW_EXPECTED.rank);
    await mls.getByTestId("review-reset").click();
    await expect(mls.getByTestId("review-sort")).toHaveValue("kickoff");
    await expect.poll(() => tailOrder(mls)).toEqual(REVIEW_EXPECTED.kickoff);
    await page.reload();
    await expect(mls.getByTestId("review-sort")).toHaveValue("kickoff");
    await expect(mls.getByTestId("review-reset")).toHaveCount(0);
  });

// ------------------------------------------------------ empty and broken

test("an empty finished tail says so, and a fixture that was never played stays listed",
  async ({ page }) => {
    await open(page);
    // Liga MX finished nothing in the window — and SAYS so, rather than
    // rendering an unexplained gap under the divider
    const mx = tail(page, "ligamx");
    await expect(mx.getByTestId("review-empty"))
      .toContainText("No Liga MX fixtures finished in the last 7 days");
    await expect(mx.getByTestId("review-row")).toHaveCount(0);
    // the postponed fixture is LISTED, not counted as a nil-nil
    await expect(mx.getByTestId("review-refusal")).toHaveCount(1);
    await expect(mx.getByTestId("review-refusals"))
      .toContainText("Postponed");
    await expect(mx.getByTestId("review-refusals"))
      .toContainText("invent a match nobody played");
  });

test("an empty tail in every column when nothing at all finished",
  async ({ page }) => {
    await open(page, BOARD, 200, {
      ...REVIEW,
      leagues: Object.fromEntries(Object.keys(REVIEW_LEAGUES).map((k) => [
        k, { finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
             error: null }])),
      finished: [], refusals: [],
    });
    await expect(page.getByTestId("review-empty")).toHaveCount(4);
    await expect(page.getByTestId("review-row")).toHaveCount(0);
    // an empty tail still carries the reason there is no score on it
    await expect(page.getByTestId("no-tally-note").first())
      .toContainText("No tally is kept here");
  });

test("a failed review names itself under every column and shows no stale tail",
  async ({ page }) => {
    await open(page, BOARD, 200, { detail: "picker review unavailable" }, 503);
    await expect(page.getByTestId("review-error")).toHaveCount(4);
    await expect(page.getByTestId("review-error").first())
      .toContainText("picker review unavailable");
    await expect(page.getByTestId("review-row")).toHaveCount(0);
    // the BOARD above is untouched — a dead review costs the tail, not
    // the page the operator came to
    await expect(page.getByTestId("picker-row")).toHaveCount(4);
  });

test("one league's finished fixtures failing costs one tail, not the board",
  async ({ page }) => {
    await open(page, BOARD, 200, {
      ...REVIEW,
      leagues: {
        ...REVIEW_LEAGUES,
        mls: { finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
               error: "ConnectionError: scoreboard fetch failed" },
      },
      finished: [NO_TAPE, NO_READ], refusals: [],
    });
    const mls = tail(page, "mls");
    await expect(mls.getByTestId("review-league-error"))
      .toContainText("scoreboard fetch failed");
    // a FAILED league is not dressed as a quiet week
    await expect(mls.getByTestId("review-empty")).toHaveCount(0);
    // the other tails rendered
    await expect(page.getByTestId("review-row")).toHaveCount(2);
  });

test("a deployment that freezes nothing says so, rather than letting every card look coincidentally rebuilt",
  async ({ page }) => {
    await open(page, BOARD, 200, {
      ...REVIEW,
      store: { backend: "null", writable: false,
               note: "no snapshot store is configured" },
    });
    const note = page.getByTestId("review-store-note").first();
    await expect(note).toBeVisible();
    await expect(note).toContainText("No pre-kickoff read is being frozen");
    await expect(note).toContainText("RECONSTRUCTION");
    // a writable store shows no such note
    await open(page);
    await expect(page.getByTestId("review-store-note")).toHaveCount(0);
  });

// -------------------------------------------------- window, links, honesty

test("the finished window has its own control, separate from the board's",
  async ({ page }) => {
    const asked: string[] = [];
    await page.route("**/api/picker/review**", (r) => {
      asked.push(new URL(r.request().url()).searchParams.get("back") || "");
      return r.fulfill(json(REVIEW));
    });
    await serveBoard(page);
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("review-row").first()).toBeVisible();
    expect(asked, "the tail opens at 7 days, matching the forward window")
      .toEqual(["7"]);
    // lengthening the finished window must not touch the forward one
    await page.getByRole("button", { name: /finished window, last 14 days/i })
      .click();
    await expect.poll(() => asked).toEqual(["7", "14"]);
    await expect(page.getByRole("button", { name: "7d" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect(tail(page, "mls").getByTestId("review-count"))
      .toContainText("last 14d");
  });

test("a finished card is the way back into its match page", async ({ page }) => {
  await open(page);
  await page.getByRole("link",
    { name: /review Sporting Kansas City versus Vancouver Whitecaps/i }).click();
  await expect(page).toHaveURL(/\/bet-suggester\/mls\/761762/);
});

test("the finished tail keeps no score of its own", async ({ page }) => {
  await open(page);
  // wait for the tails to be ON the page before reading it — a body
  // snapshot taken mid-fetch would pass this test by rendering nothing
  await expect(page.getByTestId("review-row").first()).toBeVisible();
  await expect(page.getByTestId("no-tally-note")).toHaveCount(4);
  const body = (await page.textContent("body")) || "";
  // no scoreboard framing of any kind: the surface may say what happened
  // and whether the two verdicts agreed, and may not imply a hit rate
  expect(body).not.toMatch(/win rate|hit rate|strike rate|success rate/i);
  expect(body).not.toMatch(/you were right|we were right|got it right/i);
  expect(body).not.toMatch(/\b(streak|accuracy|scorecard)\b/i);
  expect(body).not.toMatch(/\b\d+\s*\/\s*\d+\s+(right|correct|hits?)\b/i);
  // and the absence is EXPLAINED, so nobody later "fixes" it
  expect(body).toMatch(/No tally is kept here, and none will be/);
  expect(body).toMatch(/cannot tell a real read apart from luck/);
});

test("the finished tail on a phone: no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, SORT_BOARD, 200, REVIEW_SORT);
  await expect(page.getByTestId("review-row")).toHaveCount(5);
  // open the widest thing on a card — the provenance block, with its
  // absolute archive paths — before measuring
  await card(page, "f-bravo").getByRole("button", { name: "provenance" }).click();
  await expect(card(page, "f-bravo").getByTestId("recon-provenance"))
    .toContainText("states-mls-2026.json");
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth
    - document.documentElement.clientWidth);
  expect(overflow, "the page body must never scroll horizontally")
    .toBeLessThanOrEqual(0);
});

test("the picker proxy forwards review too — unmocked on purpose",
  async ({ request }) => {
    // Same reasoning as the board's proxy test: every other test in this
    // file mocks in the BROWSER, so src/pages/api/picker/[...path].ts is
    // never exercised by them, and a route missing from the allowlist
    // would 404 on prod behind a green suite.
    const r = await request.get("/api/picker/review?back=7");
    expect(await r.text(), "review rejected by the proxy allowlist")
      .not.toContain("unknown picker route");
  });

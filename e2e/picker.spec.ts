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
  return new Date(Date.now() + h * 3600_000).toISOString();
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

async function open(page: import("@playwright/test").Page,
                    body: unknown = BOARD, status = 200) {
  await serveBoard(page, body, status);
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

test("every row served is drawn in its league's column, opening in |GD/g gap| order, including a 0.00 gap",
  async ({ page }) => {
    await open(page);
    // four served, four drawn — the page adds no bar of its own
    await expect(page.getByTestId("picker-row")).toHaveCount(4);
    // and the column applies the default order itself: the payload above
    // is deliberately shuffled
    const rows = col(page, "laliga").getByTestId("picker-row");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Barcelona");
    await expect(rows.nth(1)).toContainText("Getafe");
    // rank badges are the COLUMN's own positions
    await expect(rows.nth(0).getByTestId("row-rank")).toHaveText("01");
    await expect(rows.nth(1).getByTestId("row-rank")).toHaveText("02");
    // the zero-gap fixture is ON the board, showing its zero — SIGNED:
    // a bare "0.00" would keep this green through a regression of the
    // one row that proves the picker never cuts
    await expect(rows.nth(1)).toContainText("+0.00");
  });

test("the column leader's LEVEL defence is visible without reading a number",
  async ({ page }) => {
    await open(page);
    const top = page.getByTestId("picker-row")
      .filter({ hasText: "Barcelona" });
    // it leads its column on the table gap
    await expect(top).toContainText("+1.63");
    await expect(top.getByTestId("row-rank")).toHaveText("01");
    // …and the three tier gaps are drawn SEPARATELY, each with its own
    // signed value and its own word, so the defence one cannot pass for
    // a small positive at a glance
    const chips = top.getByTestId("gap-chip");
    await expect(chips).toHaveCount(3);
    const attack = chips.and(top.locator('[data-dim="attack"]'));
    const defence = chips.and(top.locator('[data-dim="defence"]'));
    await expect(attack).toContainText("T1 v T4 +3");
    await expect(attack).toContainText("ahead");
    await expect(defence).toContainText("T1 v T1 +0");
    await expect(defence).toContainText("level");
    await expect(defence).toHaveAttribute("data-gap", "0");
    // the plain-English read says where the gap actually is
    await expect(top.getByText(/the tier gap is attack \+3/i)).toBeVisible();
    await expect(top.getByText(/level in defence \(T1 v T1\)/i)).toBeVisible();
  });

test("a hollow row is marked differently from a clean one", async ({ page }) => {
  await open(page);
  const hollow = page.getByTestId("picker-row")
    .filter({ hasText: "Hollow FC" });
  const clean = page.getByTestId("picker-row").filter({ hasText: "Arsenal" });
  await expect(hollow).toHaveAttribute("data-shape", "HOLLOW");
  await expect(clean).toHaveAttribute("data-shape", "CLEAN");
  // the shape is on screen as a word, and the hollow row says WHY in
  // words — a shape chip alone is a code, not a read
  await expect(hollow.getByText("HOLLOW", { exact: true })).toBeVisible();
  await expect(clean.getByText("CLEAN", { exact: true })).toBeVisible();
  await expect(hollow.getByText(/high on the table gap, but/i)).toBeVisible();
  await expect(hollow.getByText(/behind in defence/i)).toBeVisible();
  await expect(clean.getByText(/better tier overall, in attack and in defence/i))
    .toBeVisible();
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
    const select = mls.getByTestId("col-sort");
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
    await mls.getByTestId("col-sort").selectOption("ask");
    // the null policy is ON SCREEN while a book key is active
    await expect(mls.getByTestId("col-null-note"))
      .toHaveText("no quote sorts last");
    await expect(mls.getByTestId("col-dir")).toHaveAttribute("data-dir", "asc");
    await expect.poll(() => orderOf(mls))
      .toEqual(["m-alpha", "m-bravo", "m-charlie", "m-delta"]);
    await mls.getByTestId("col-dir").click();
    await expect(mls.getByTestId("col-dir")).toHaveAttribute("data-dir", "desc");
    // the priced rows reverse; the quoteless row is NOT "smallest" or
    // "largest" — it stays last under both directions
    await expect.poll(() => orderOf(mls))
      .toEqual(["m-charlie", "m-bravo", "m-alpha", "m-delta"]);
  });

test("each column sorts independently of the others", async ({ page }) => {
  await open(page, SORT_BOARD);
  const mls = col(page, "mls");
  const laliga = col(page, "laliga");
  await mls.getByTestId("col-sort").selectOption("kickoff");
  await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
  // La Liga did not move: same control default, same default order
  await expect(laliga.getByTestId("col-sort")).toHaveValue("gdg");
  await expect.poll(() => orderOf(laliga))
    .toEqual(["401882903", "401882901"]);
});

test("a column's sort survives a reload, and reset returns (and forgets) the default",
  async ({ page }) => {
    await open(page, SORT_BOARD);
    const mls = col(page, "mls");
    await mls.getByTestId("col-sort").selectOption("kickoff");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
    await page.reload();
    await expect(mls.getByTestId("col-sort")).toHaveValue("kickoff");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.kickoff);
    // reset: default order, default control, and the stored choice gone
    await mls.getByTestId("col-reset").click();
    await expect(mls.getByTestId("col-sort")).toHaveValue("gdg");
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.gdg);
    await page.reload();
    await expect(mls.getByTestId("col-sort")).toHaveValue("gdg");
    await expect(mls.getByTestId("col-reset")).toHaveCount(0);
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
    await expect.poll(() => orderOf(mls)).toEqual(EXPECTED.gdg);
    await mls.getByTestId("col-sort").selectOption("ppg");
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

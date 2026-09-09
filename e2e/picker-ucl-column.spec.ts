import { expect, test } from "@playwright/test";

// THE CHAMPIONS LEAGUE COLUMN — the operator decision of 2026-09-08,
// recorded in backend docs/DECISION-ucl-board-sort-2026-09-08.md, drawn.
//
// The four league columns rank a fixture by the gap between two clubs on
// ONE table. A UCL fixture almost never has that: nearly every match
// pairs two different domestic leagues, and the backend withholds
// `ppg_gap` / `gdg_gap` / `rank_gap` outright when the scales differ,
// because 2.0 ppg in one league is not 2.0 ppg in another.
//
// WHAT IS AT STAKE, and why each of these is a property and not a pixel:
//
//  1. AN ANCHOR WITHHELD ON EVERY CARD READS AS BROKEN. The anchor is
//     the 20px number on every row and it defaults to the GD/g gap —
//     `null` on a cross-league row. On the four league columns that null
//     is rare and informative. On this column it would be EVERY CARD.
//     The tier gap survives a change of scale by construction, so a
//     cross-league row anchors on it, and a same-league one still shows
//     GD/g. Derived PER ROW from `cross_league`, so an all-English tie
//     in this column behaves like any league row.
//  2. THE COLUMN RANKS ON SHAPE. `kickoff` is the honest default inside
//     a matchday when a magnitude exists to break ties. Here the Stage-1
//     magnitudes are withheld, and `shape` is derived from the three
//     tier gaps, which are not.
//  3. ONE CONTROL STAYS AUTHORITATIVE. The column's own default holds
//     only while the board's control is untouched. Choose a sort and
//     this column obeys it like every other, or the control would
//     silently not mean what it says on part of the board.
//  4. IT SAYS SO. A column ordered differently from its neighbours reads
//     as a defect to a reader who does not know why.
//  5. THE RULE IS KEYED BY SLUG, NOT BY "IS A CUP". The Leagues Cup is
//     also a cup, and also has cross-league rows, and keeps the board
//     default — so this test serves both and asserts they differ.
//  6. A MEMBER LEAGUE THAT DID NOT LOAD IS NAMED. Seven member tables
//     feed this column; one failing costs its own clubs, not the
//     column. `rated_on` is the spec and must not shrink — what got
//     built is reported beside it, never in place of it.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// deterministic, day-major aware: 25-minute steps from a fixed date, so
// everything below lands in one matchday band
const inHours = (h: number) => {
  const base = Date.UTC(2026, 11, 15, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
};

const weights = (home: number, away: number) => ({
  home, away, min: Math.min(home, away), k: 10, constant: null,
  basis: { home: "blend", away: "blend" },
});

const CROSS_NOTE =
  "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. 2.0 ppg in "
  + "the Premier League is not 2.0 ppg in the Eredivisie. The tiers below "
  + "are within-league quintiles by construction and remain comparable.";

const UCL_MEMBERS = ["epl", "laliga", "bundesliga", "seriea", "ligue1",
                     "eredivisie", "primeiraliga"];

const LEAGUES = {
  mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league",
         blend_k: 10, blend_constant_w: null },
  epl: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
         blend_k: 10, blend_constant_w: null },
  laliga: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
            blend_k: 10, blend_constant_w: null },
  ligamx: { src: "prior", min_current_gp: 6, clubs: 18, kind: "league",
            blend_k: 10, blend_constant_w: null },
  leaguescup: { src: "prior", min_current_gp: 6, clubs: 47, kind: "cup",
                rated_on: ["mls", "ligamx"], reg_time_note: null },
  ucl: { src: "current", min_current_gp: 4, clubs: 122, kind: "cup",
         rated_on: UCL_MEMBERS, reg_time_note: null },
};

const row = (over: Record<string, unknown>) => ({
  refused: false, fav_side: "home", resolution: {}, src: "current",
  kalshi: null, reg_time_note: null,
  gp_current: { home: 12, away: 12, min: 12 },
  weights: weights(0.5455, 0.5455),
  ...over,
});

// ---- the UCL column: two cross-league ties and one all-English --------

// CLEAN — the favourite is a tier better in all three
const CROSS_CLEAN = row({
  league: "ucl", espn: "uefa.champions",
  home: "Real Madrid", away: "Feyenoord",
  favourite: "Real Madrid", opponent: "Feyenoord",
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: CROSS_NOTE,
  rated_in: { home: "laliga", away: "eredivisie" },
  ranks: { fav: 1, opp: 4 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "CLEAN",
  event_id: "ucl-clean", competition_id: "ucl-clean", kickoff: inHours(8),
});

// HOLLOW — better going forward, worse at the back
const CROSS_HOLLOW = row({
  ...CROSS_CLEAN,
  home: "Napoli", away: "Sporting CP",
  favourite: "Napoli", opponent: "Sporting CP",
  rated_in: { home: "seriea", away: "primeiraliga" },
  ranks: { fav: 3, opp: 2 },
  tiers: { ovr: [2, 2], atk: [1, 3], def: [4, 2] },
  tier_gaps: { ovr: 0, atk: 2, def: -2 }, shape: "HOLLOW",
  event_id: "ucl-hollow", competition_id: "ucl-hollow",
  kickoff: inHours(6),
});

// THE ALL-ENGLISH TIE. Two clubs on ONE table, so nothing is withheld
// and this row keeps GD/g like any league row — the case that proves the
// anchor follows the ROW and not the competition.
const SAME_LEAGUE = row({
  ...CROSS_CLEAN,
  home: "Arsenal", away: "Liverpool",
  favourite: "Arsenal", opponent: "Liverpool",
  ppg_gap: 0.42, gdg_gap: 0.81, rank_gap: 3,
  cross_league: false, gap_note: null,
  rated_in: { home: "epl", away: "epl" },
  ranks: { fav: 1, opp: 4 },
  tiers: { ovr: [1, 1], atk: [1, 2], def: [1, 1] },
  tier_gaps: { ovr: 0, atk: 1, def: 0 }, shape: "SPLIT",
  event_id: "ucl-same", competition_id: "ucl-same", kickoff: inHours(10),
});

// ---- a Leagues Cup cross-league row, for the contrast ------------------
const LC_CROSS = row({
  league: "leaguescup", espn: "concacaf.leagues.cup",
  home: "Inter Miami CF", away: "Tigres UANL",
  favourite: "Tigres UANL", opponent: "Inter Miami CF", fav_side: "away",
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: CROSS_NOTE,
  rated_in: { home: "mls", away: "ligamx" },
  ranks: { fav: 5, opp: 3 },
  tiers: { ovr: [2, 1], atk: [1, 2], def: [2, 3] },
  tier_gaps: { ovr: -1, atk: 1, def: 1 }, shape: "SPLIT",
  event_id: "lc-cross", competition_id: "lc-cross", kickoff: inHours(7),
});

// an ordinary league row, so the four columns have something to hold
const EPL_ROW = row({
  league: "epl", espn: "eng.1",
  home: "Hull City", away: "Manchester City",
  favourite: "Manchester City", opponent: "Hull City", fav_side: "away",
  ppg_gap: 1.2, gdg_gap: 1.1, rank_gap: 14,
  cross_league: false, gap_note: null,
  rated_in: { home: "epl", away: "epl" },
  ranks: { fav: 2, opp: 16 },
  tiers: { ovr: [1, 4], atk: [1, 4], def: [1, 4] },
  tier_gaps: { ovr: 3, atk: 3, def: 3 }, shape: "CLEAN",
  event_id: "epl-row", competition_id: "epl-row", kickoff: inHours(9),
});

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260902", days: 7,
  leagues: LEAGUES,
  // deliberately NOT in any column's order — each column sorts itself
  rows: [CROSS_CLEAN, EPL_ROW, SAME_LEAGUE, LC_CROSS, CROSS_HOLLOW],
  refusals: [],
};

const EMPTY_REVIEW = {
  generated_at: new Date().toISOString(),
  date: "20260902", back: 7,
  window: { from: "20260826", to: "20260902" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [],
};

async function open(page: import("@playwright/test").Page,
                    body: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(body)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(EMPTY_REVIEW)));
  await page.goto("/bet-suggester");
}

const col = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);

/** `evaluateAll` reads the DOM as it stands and does NOT auto-wait, so
 *  every caller waits on the count first — a bare read races the render
 *  and returns [], which reads exactly like a column that sorted wrong. */
const orderOf = async (c: ReturnType<typeof col>, n: number) => {
  await expect(c.getByTestId("picker-row")).toHaveCount(n);
  return c.getByTestId("picker-row")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));
};

// ---------------------------------------------- 1. the anchor ----------

test("a cross-league UCL row anchors on the tier gap, not on a withheld GD/g",
  async ({ page }) => {
    await open(page);
    const ucl = col(page, "ucl");
    const clean = ucl.getByTestId("picker-row")
      .filter({ hasText: "Real Madrid" });
    await expect(clean).toHaveAttribute("data-cross-league", "true");

    const anchor = clean.getByTestId("row-anchor");
    await expect(anchor).toHaveAttribute("data-anchor", "tier_ovr");
    // and it is a MEASURED number, which is the whole point — the
    // failure this replaces rendered the board's withheld glyph here
    await expect(anchor).toHaveText("+1");
    await expect(clean).toContainText("tier · ovr");
  });

test("a same-league UCL row keeps GD/g — the anchor follows the row",
  async ({ page }) => {
    await open(page);
    const same = col(page, "ucl").getByTestId("picker-row")
      .filter({ hasText: "Arsenal" });
    await expect(same).toHaveAttribute("data-cross-league", "false");
    const anchor = same.getByTestId("row-anchor");
    await expect(anchor).toHaveAttribute("data-anchor", "gdg");
    await expect(anchor).toHaveText("+0.81");
  });

test("the figure the anchor shows is not repeated in the strip below it, "
   + "and the one it does not show still is",
  async ({ page }) => {
    await open(page);
    const ucl = col(page, "ucl");
    // cross-league: the anchor is the tier gap, so GD/g — withheld here
    // — must still be drawn below rather than silently dropped
    const clean = ucl.getByTestId("picker-row")
      .filter({ hasText: "Real Madrid" });
    await expect(clean).toContainText("GD/g");
    // same-league: the anchor IS GD/g, so the strip does not repeat it —
    // the one remaining mention is the anchor's own label
    const same = ucl.getByTestId("picker-row").filter({ hasText: "Arsenal" });
    await expect(same).toContainText("GD/g gap");
    // textContent, NOT innerText: the anchor's label is styled uppercase
    // and innerText applies the transform, so it reads "GD/G GAP" and a
    // case-sensitive count of the real string silently finds nothing.
    const text = (await same.textContent()) ?? "";
    expect((text.match(/GD\/g/g) ?? []).length).toBe(1);
  });

// ---------------------------------------------- 2 + 4. the sort --------

test("the UCL column ranks on shape while the board control is untouched, "
   + "and says so", async ({ page }) => {
    await open(page);
    const ucl = col(page, "ucl");
    // CLEAN before SPLIT before HOLLOW — not the kickoff order, which
    // would be hollow(6) → clean(8) → same(10)
    expect(await orderOf(ucl, 3))
      .toEqual(["ucl-clean", "ucl-same", "ucl-hollow"]);
    const chip = ucl.getByTestId("col-own-sort");
    await expect(chip).toHaveAttribute("data-mode", "shape");
    await expect(chip).toHaveText(/sorted on shape · this column/);
  });

test("the four league columns are untouched by it", async ({ page }) => {
    await open(page);
    await expect(col(page, "epl").getByTestId("col-own-sort"))
      .toHaveCount(0);
  });

// ------------------------------------- 5. keyed by slug, not by kind ---

test("the Leagues Cup is a cup with a cross-league row too, and keeps the "
   + "board default", async ({ page }) => {
    await open(page);
    const lc = col(page, "leaguescup");
    await expect(lc.getByTestId("col-own-sort")).toHaveCount(0);
    // its cross-league row therefore still anchors the way the board
    // does everywhere else — the anchor rule is per ROW and applies
    // here as well, which is why this is a sort assertion, not an
    // anchor one
    await expect(lc.getByTestId("picker-row").first()
      .getByTestId("row-anchor")).toHaveAttribute("data-anchor", "tier_ovr");
  });

// ------------------------------------ 3. one control stays in charge ---

test("choosing a sort takes the UCL column back onto the board's",
  async ({ page }) => {
    await open(page);
    const ucl = col(page, "ucl");
    await expect(ucl.getByTestId("col-own-sort")).toHaveCount(1);

    await page.getByTestId("col-sort").selectOption("rank");
    // the operator asked for rank: this column obeys, and stops
    // claiming a sort of its own
    await expect(ucl.getByTestId("col-own-sort")).toHaveCount(0);
    await expect(ucl.getByTestId("picker-row").first()
      .getByTestId("row-anchor")).toHaveAttribute("data-anchor", "rank");
  });

// ------------------------------ 6. a member league that did not load ---

test("a member table that failed is named, and rated_on does not shrink",
  async ({ page }) => {
    await open(page, {
      ...BOARD,
      leagues: {
        ...LEAGUES,
        ucl: {
          ...LEAGUES.ucl,
          clubs: 104,
          rated_on_built: UCL_MEMBERS.filter((s) => s !== "eredivisie"),
          member_errors: { eredivisie: "HTTPError: 503 from ESPN" },
        },
      },
    });
    const ucl = col(page, "ucl");
    const block = ucl.getByTestId("col-member-errors");
    await expect(block).toContainText("1 of 7 member tables did not load");
    await expect(block).toContainText("HTTPError: 503 from ESPN");
    // the SPEC is unchanged — what the column is defined on must not
    // quietly become what it managed to fetch
    await expect(ucl.getByTestId("col-cup")).toContainText("Eredivisie");
  });

test("a healthy column draws no member-failure block at all",
  async ({ page }) => {
    await open(page);
    await expect(col(page, "ucl").getByTestId("col-member-errors"))
      .toHaveCount(0);
  });

// ------------- the 404 this map was written for, one competition later --

test("every cup column the board serves opens somewhere that exists",
  async ({ page }) => {
    await open(page);
    // DERIVED FROM THE PAYLOAD, not a list of cups typed here: a cup
    // added to the board and not to CUP_COMP_KEY falls through to the
    // per-league hub pattern and lands on the site's 404, which is
    // exactly how the Leagues Cup card failed on 2026-09-03. It failed
    // silently — the card rendered, the link was simply wrong — so
    // nothing but a check of the href catches it.
    const cups = Object.entries(LEAGUES)
      .filter(([, m]) => (m as { kind?: string }).kind === "cup")
      .map(([slug]) => slug);
    expect(cups.length).toBeGreaterThan(1);   // this test needs >1 to mean anything
    for (const slug of cups) {
      const rows = col(page, slug).getByTestId("picker-row");
      await expect(rows.first()).toBeVisible();   // evaluateAll cannot wait
      const hrefs = await rows.locator("a[href]").evaluateAll(
        (els) => els.map((e) => e.getAttribute("href")));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href, `${slug} card must not use the per-league hub pattern`)
          .toMatch(/^\/bet-suggester\/comp\//);
      }
    }
  });

// ------------------------------- the UCL board route --------------------

// THE PAGE IS THE BOARD, NOT A PAGE THAT RESEMBLES IT. The operator
// asked for "the exact layout of the landing page, for UCL only", so
// /bet-suggester/ucl renders the SAME component with its column set
// narrowed. These assert the identity holds — a copy would pass the
// first of them and start failing the rest as the two drifted.

test("the UCL route draws the board's own furniture, with one column",
  async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) =>
      r.fulfill(json(EMPTY_REVIEW)));
    await page.goto("/bet-suggester/ucl");

    // one column, and it is the Champions League
    const cols = page.getByTestId("league-col");
    await expect(cols).toHaveCount(1);
    await expect(cols).toHaveAttribute("data-league", "ucl");

    // the landing page's own instruments, present here because it IS
    // the landing page: the board sort control, the matchday bands, the
    // ranked rows, and the refusal block with its reason
    await expect(page.getByTestId("col-sort")).toHaveCount(1);
    await expect(page.getByTestId("day-band").first()).toBeAttached();
    await expect(page.getByTestId("picker-row")).toHaveCount(3);
    await expect(page.getByTestId("row-anchor").first()).toBeVisible();
  });

test("the four league columns are absent from it, not merely empty",
  async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) =>
      r.fulfill(json(EMPTY_REVIEW)));
    await page.goto("/bet-suggester/ucl");
    for (const slug of ["mls", "epl", "laliga", "ligamx", "leaguescup"]) {
      await expect(col(page, slug)).toHaveCount(0);
    }
  });

test("the framing names the sort this board actually runs, and keeps every "
   + "charter sentence", async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) =>
      r.fulfill(json(EMPTY_REVIEW)));
    await page.goto("/bet-suggester/ucl");
    const intro = page.getByTestId("board-framing");
    // NOT the table gap — this board withholds it on nearly every row,
    // and a page that named it would be printing the one number it
    // refuses
    await expect(intro).toContainText(/ranked by shape/i);
    await expect(intro).not.toContainText(/how far apart the two clubs sit/i);
    // the three decision-safety sentences are carried verbatim, exactly
    // as on the default board
    await expect(intro).toContainText(/no model runs on this page/i);
    await expect(intro)
      .toContainText(/no number below is a probability or an edge of ours/i);
    await expect(intro).toContainText(/nothing here is a recommendation/i);
    await expect(intro).toContainText(/you are the one who picks/i);
  });

test("the default board is UNCHANGED by any of this", async ({ page }) => {
    await open(page);
    // WAIT FOR A COLUMN BEFORE COUNTING. `count()` does not auto-wait,
    // and the framing paragraph is drawn before the board payload
    // resolves — so a bare count here reads 0 and reports a missing
    // board rather than a slow one.
    await expect(page.getByTestId("league-col").first()).toBeAttached();
    // its framing still names the table gap, its columns are still many
    await expect(page.getByTestId("board-framing"))
      .toContainText(/how far apart the two clubs sit/i);
    expect(await page.getByTestId("league-col").count())
      .toBeGreaterThan(1);
  });

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

// ---- ONE WHOLE MATCHDAY, for the layout tests -------------------------
//
// The three ties above are enough to prove a SORT. They are not enough to
// prove a LAYOUT: the defect the dense grid was built against — one tall
// stack of full-width cards — only becomes visible once a band holds more
// matches than the widest ladder step has tracks. A real Champions League
// matchday is ~18 fixtures; eight is the smallest number that puts six on
// the first row at xl and spills two onto a second, and it keeps the
// suite quick.
//
// THE NAMES ARE THE LONG ONES ON PURPOSE. "Bayer Leverkusen v Atlético de
// Madrid" in a 196px track is the case that decides whether this layout
// works, and a fixture full of three-letter clubs would certify a card
// that cannot draw the competition it is for.
const GRID_TIES: [string, string][] = [
  ["Real Madrid", "Feyenoord"],
  ["Manchester City", "Borussia Dortmund"],
  ["Bayern München", "Paris Saint-Germain"],
  ["Bayer Leverkusen", "Atlético de Madrid"],
  ["Arsenal", "Sport Lisboa e Benfica"],
  ["Liverpool", "PSV Eindhoven"],
  ["Barcelona", "Shakhtar Donetsk"],
  ["Newcastle United", "Red Bull Salzburg"],
];

const GRID_ROWS = GRID_TIES.map(([fav, opp], i) => row({
  ...CROSS_CLEAN,
  home: fav, away: opp, favourite: fav, opponent: opp,
  event_id: `ucl-grid-${i}`, competition_id: `ucl-grid-${i}`,
  // 25-minute steps off the same fixed base — every one of them lands in
  // ONE matchday band, which is the unit this layout works inside
  kickoff: inHours(i + 1),
  // the WIDEST form strip there is: five cells plus the "cup" mark, the
  // thing that was crowding the club name off its own line
  form: { fav: "WWDLW", opp: "LDWWL", scope: "UEFA Champions League",
          scope_is_cup: true },
  // a listed-but-unquoted market on one row: `event_ticker` is the only
  // string on the card with no space in it to wrap at
  ...(i === 2 ? {
    kalshi: { event_ticker: "KXUCLGAME-26DEC15BAYPSG", ask_c: null,
              bid_c: null, spread_c: null, ask_size: null, flags: [] },
  } : {}),
}));

const GRID_BOARD = {
  ...BOARD,
  // the other columns stay, so the same payload serves the default
  // board's guard below — a single-column claim proven on a payload that
  // could only ever draw one column proves nothing about the other case
  rows: [EPL_ROW, LC_CROSS, ...GRID_ROWS],
};

async function open(page: import("@playwright/test").Page,
                    body: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(body)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(EMPTY_REVIEW)));
  await page.goto("/bet-suggester");
}

/** The same payload, on the board narrowed to the one column. */
async function openUcl(page: import("@playwright/test").Page,
                       body: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(body)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(EMPTY_REVIEW)));
  await page.goto("/bet-suggester/ucl");
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

// ============ THE DENSE GRID — a matchday laid ACROSS the band =========
//
// Operator, 2026-09-08, with a screenshot: this board was drawing "ONE
// wide column of full-width stacked match cards". A Champions League
// matchday is ~18 fixtures, so the reader got 18 screens of 1,400px-wide
// card holding 200px of ink, while the landing page's four columns get
// their density from sitting side by side. A board narrowed to one column
// has to find that density INSIDE the band, so each matchday now lays its
// matches across up to six tracks and wraps to further rows within itself.
//
// WHY THESE ASSERT GEOMETRY AND NOT CLASS NAMES. A test that read
// `xl:grid-cols-6` off the DOM would pass on a grid whose six tracks had
// collapsed to 0px — which is not hypothetical here: the four league
// columns once measured `0px 0px 0px 0px 1304px` at 1440 with every class
// in the file correct (see the track-count note in pages/bet-suggester).
// Only a measured box can tell "six columns" from "six columns of
// nothing".
//
// boundingBox() RETURNS { x, y, width, height } AND NOTHING ELSE. There
// is no `top` and no `bottom` on it; reading one yields undefined, which
// becomes NaN through any arithmetic, and a NaN comparison fails looking
// exactly like a real layout defect rather than like the typo it is.

type Box = { x: number; y: number; width: number; height: number };

/** Every card's measured box, in DOM order — which is the sorted order,
 *  and therefore the rank order the badges print. */
async function cardBoxes(cards: ReturnType<typeof col>, expected: number) {
  await expect(cards.getByTestId("picker-row")).toHaveCount(expected);
  const boxes: Box[] = [];
  for (let i = 0; i < expected; i++) {
    const b = await cards.getByTestId("picker-row").nth(i).boundingBox();
    expect(b, `card ${i} has no box at all — it is not being laid out`)
      .not.toBeNull();
    boxes.push(b!);
  }
  return boxes;
}

/** The cards sharing the band's FIRST row — the measured column count.
 *  Cards in one grid row share a y to the pixel; 2px of slack absorbs
 *  sub-pixel layout and can never merge two real rows, which are a whole
 *  card apart. */
function firstRow(boxes: Box[]) {
  const top = Math.min(...boxes.map((b) => b.y));
  const inRow = boxes.filter((b) => b.y - top < 2);
  return { count: inRow.length, xs: new Set(inRow.map((b) => Math.round(b.x))) };
}

test("the Champions League board lays a matchday ACROSS the band, not down "
   + "it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openUcl(page, GRID_BOARD);
    const ucl = col(page, "ucl");
    const boxes = await cardBoxes(ucl, GRID_ROWS.length);

    // THE CLAIM, in its smallest form: two cards of one matchday share a
    // row. Same y, different x — a stack has neither.
    expect(boxes[1].y).toBeCloseTo(boxes[0].y, 0);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width - 1);

    // and the band wraps within itself rather than growing a seventh
    // track: six abreast, then the rest on a second row of the SAME band
    const { count, xs } = firstRow(boxes);
    expect(count).toBe(6);
    expect(xs.size, "six tracks, six distinct x positions").toBe(6);
    expect(boxes[6].y).toBeGreaterThan(boxes[0].y);
    expect(boxes[6].x).toBeCloseTo(boxes[0].x, 0);

    // THE TRACKS ARE REAL, not six collapsed to nothing. Each is a
    // sixth of the board's width, less the gaps.
    for (const b of boxes) expect(b.width).toBeGreaterThan(150);

    // the band is still the vertical structure: one date, drawn once,
    // above every one of these cards
    const band = page.getByTestId("day-band");
    await expect(band).toHaveCount(1);
    const bandBox = (await band.boundingBox())!;
    for (const b of boxes) expect(b.y).toBeGreaterThan(bandBox.y);

    // and rank still restarts at this day's best, top-left
    await expect(ucl.getByTestId("row-rank").first()).toHaveText("01");
  });

test("the grid steps down as the viewport narrows, and never scrolls the "
   + "page sideways", async ({ page }) => {
    // 1 / 2 / 3 / 4 / 6, on the project's own Tailwind breakpoints. The
    // step is chosen by what a CARD needs, not by a round number: at each
    // one the track lands between ~196px and ~350px, and six only appears
    // at xl because that is the first width that can hold six of them.
    const LADDER: [number, number][] = [
      [1536, 6], [1440, 6], [1280, 6], [1024, 4], [768, 3], [640, 2],
      [390, 1],
    ];
    await page.setViewportSize({ width: 1440, height: 900 });
    await openUcl(page, GRID_BOARD);
    const ucl = col(page, "ucl");
    await expect(ucl.getByTestId("picker-row")).toHaveCount(GRID_ROWS.length);

    for (const [width, cols] of LADDER) {
      await page.setViewportSize({ width, height: 900 });
      const boxes = await cardBoxes(ucl, GRID_ROWS.length);
      const { count, xs } = firstRow(boxes);
      expect(count, `${width}px should lay ${cols} across`).toBe(cols);
      expect(xs.size, `${width}px: ${cols} distinct x positions`).toBe(cols);
      // A phone gets ONE card per row and every card at the same x —
      // the stacked layout, which is right at 350px and only there.
      if (cols === 1) {
        expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(1);
        expect(new Set(boxes.map((b) => Math.round(b.y))).size)
          .toBe(GRID_ROWS.length);
      }
      // globals.css clips rather than scrolls, so a sideways overflow is
      // silent AND destructive — it eats the ink it pushes out.
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth
          - document.documentElement.clientWidth);
      expect(overflow, `${width}px must not overflow sideways`)
        .toBeLessThanOrEqual(0);
    }
  });

test("the DEFAULT board is not laid out this way — one card per row inside "
   + "a league column", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, GRID_BOARD);          // /bet-suggester, every column
    // it is many columns, and the UCL one holds the same eight fixtures
    await expect(page.getByTestId("league-col").first()).toBeAttached();
    expect(await page.getByTestId("league-col").count()).toBeGreaterThan(1);
    const ucl = col(page, "ucl");
    const boxes = await cardBoxes(ucl, GRID_ROWS.length);

    // ONE X, EIGHT Ys. Said as measured geometry rather than as the
    // absence of a class, so it holds however the grid is expressed.
    expect(new Set(boxes.map((b) => Math.round(b.x))).size,
      "every card in a league column starts at the same x").toBe(1);
    expect(new Set(boxes.map((b) => Math.round(b.y))).size,
      "no two cards in a league column share a row").toBe(GRID_ROWS.length);
    // and the dense wrapper is not even built here
    await expect(page.getByTestId("day-grid")).toHaveCount(0);
  });

// ------------------------------- the narrow track --------------------
//
// THE CARD IS THE RISK, NOT THE GRID. At a sixth of the board the card is
// ~196px wide — narrower than anything on this board has ever been
// rendered — and the way that fails is silent: a club name clipped to
// "Bayer Le", a Stage-1 strip running off the edge, a note whose last
// line is behind the border. `html { overflow-x: clip }` (globals.css)
// means none of it produces a scrollbar to notice.

test("nothing inside a card outgrows its track at the tightest step",
  async ({ page }) => {
    // 1280 is the narrowest the tracks ever get: six across 1,240px of
    // board is ~196px each, tighter than the 4-up at 1024.
    await page.setViewportSize({ width: 1280, height: 900 });
    await openUcl(page, GRID_BOARD);
    await expect(col(page, "ucl").getByTestId("picker-row"))
      .toHaveCount(GRID_ROWS.length);

    const bad = await page.evaluate(() => {
      const out: string[] = [];
      const say = (el: Element) =>
        `<${el.tagName.toLowerCase()} class="${
          (el.getAttribute("class") ?? "").slice(0, 48)}"> `
        + `"${(el.textContent ?? "").trim().slice(0, 36)}"`;

      for (const card of document.querySelectorAll(
        '[data-testid="picker-row"]')) {
        const c = card as HTMLElement;
        if (c.scrollWidth > c.clientWidth + 1) {
          out.push(`CARD ${say(c)} ${c.scrollWidth} > ${c.clientWidth}`);
        }
        const cs = getComputedStyle(c);
        const r = c.getBoundingClientRect();
        const left = r.left + parseFloat(cs.borderLeftWidth)
          + parseFloat(cs.paddingLeft);
        const right = r.right - parseFloat(cs.borderRightWidth)
          - parseFloat(cs.paddingRight);

        for (const el of Array.from(c.querySelectorAll("*"))) {
          const s = getComputedStyle(el);
          // Absolutely-positioned ORNAMENT is drawn outside its own box
          // deliberately — the dumbbell's pips sit on a 1..N axis, the
          // shape chip's tear runs past the plate — and carries no text.
          if (s.position === "absolute" || s.position === "fixed") continue;
          if (el.getAttribute("aria-hidden") === "true") continue;

          const h = el as HTMLElement;
          // clientWidth is 0 on a bare inline box, so this reaches the
          // block and flex boxes; the rect check below reaches the rest.
          if (h.clientWidth > 0 && h.scrollWidth > h.clientWidth + 1) {
            out.push(`SCROLL ${say(el)} ${h.scrollWidth} > ${h.clientWidth}`);
            continue;
          }
          if (!(el.textContent ?? "").trim()) continue;
          // one rect per LINE BOX, so a wrapped name is measured line by
          // line — which is the only way to catch the last line running
          // past the edge
          for (const q of Array.from(el.getClientRects())) {
            if (q.width === 0) continue;
            if (q.left < left - 0.5 || q.right > right + 0.5) {
              out.push(`RECT ${say(el)} [${Math.round(q.left)},`
                + `${Math.round(q.right)}] outside [${Math.round(left)},`
                + `${Math.round(right)}]`);
            }
          }
        }
      }
      return out;
    });
    expect(bad, "clipped or overflowing ink inside a card").toEqual([]);
  });

test("a long club name is drawn WHOLE in a narrow track, not ellipsised",
  async ({ page }) => {
    // A TEXT ASSERTION CANNOT SAY THIS. `truncate` clips with CSS: the
    // name stays in textContent in full while the reader sees "B…", so
    // toContainText passes on a card truncated to two pixels — which is
    // literally what the disarmed build measured (scrollWidth 133,
    // clientWidth 2). Only the box can tell the two apart.
    await page.setViewportSize({ width: 1280, height: 900 });
    await openUcl(page, GRID_BOARD);
    const ucl = col(page, "ucl");
    await expect(ucl.getByTestId("picker-row"))
      .toHaveCount(GRID_ROWS.length);

    // the four longest names on this board, favourite and opponent
    for (const name of ["Bayer Leverkusen", "Atlético de Madrid",
                        "Sport Lisboa e Benfica", "Manchester City"]) {
      const m = await ucl.evaluate((root, want) => {
        // the span whose whole text IS the club name — the opponent's
        // carries a "vs " prefix in a child span, so match either
        const hit = Array.from(root.querySelectorAll("span")).find((s) => {
          const t = (s.textContent ?? "").trim();
          return t === want || t === `vs ${want}`;
        });
        if (!hit) return null;
        const rects = Array.from(hit.getClientRects());
        return {
          sw: hit.scrollWidth, cw: hit.clientWidth, lines: rects.length,
          widest: Math.max(0, ...rects.map((r) => r.width)),
        };
      }, name);
      expect(m, `${name} is not on the board at all`).not.toBeNull();
      // NOT ELLIPSISED: there is nothing to scroll to, because nothing
      // is hidden.
      expect(m!.sw, `${name} is clipped: ${m!.sw} > ${m!.cw}`)
        .toBeLessThanOrEqual(m!.cw + 1);
      // AND IT IS DRAWN AT READING WIDTH. A name reflowed into a 2px box
      // satisfies the line above and says nothing — so measure the LINE,
      // which a crushed box cannot fake.
      expect(m!.widest, `${name} draws only ${Math.round(m!.widest)}px wide`)
        .toBeGreaterThan(90);
      // and it fits the track in one or two lines rather than a column
      // of syllables
      expect(m!.lines, `${name} wrapped onto ${m!.lines} lines`)
        .toBeLessThanOrEqual(2);
    }
  });

test("the shape popover opens inside the page, not off its left edge",
  async ({ page }) => {
    // `w-64` anchored to the button's right edge is a 256px panel hanging
    // off a ~196px card: in the LEFTMOST track it reached past x=0, and
    // `overflow-x: clip` meant that was clipped rather than scrolled.
    await page.setViewportSize({ width: 1280, height: 900 });
    await openUcl(page, GRID_BOARD);
    const card = col(page, "ucl").getByTestId("picker-row").first();
    const cardBox = (await card.boundingBox())!;
    await card.getByTestId("tier-read").click();
    const panel = card.getByTestId("shape-read");
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.x, "the panel starts inside the page").toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    // and it belongs to its card: it does not reach into a neighbour
    expect(box.x).toBeGreaterThanOrEqual(cardBox.x - 0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 0.5);
    // still readable: a panel squeezed to nothing is its own defect
    expect(box.width).toBeGreaterThan(150);
  });

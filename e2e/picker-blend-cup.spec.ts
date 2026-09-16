import { expect, test } from "@playwright/test";
/* THE ORDER THE BOARD DRAWS IN IS IMPORTED, NEVER RETYPED. `boardColumns`
   applies `PICKER_COLUMN_ORDER` — the operator's reading order — to a
   board's declaration, and it is the same call the page makes. See
   src/lib/pickerApi. */
import { boardColumns } from "../src/lib/pickerApi";

// Two changes to the picker board, drawn: THE SEASON BLEND and THE
// LEAGUES CUP COLUMN.
//
// Hermetic — every test serves a recorded shape of GET
// /api/picker/board and an empty GET /api/picker/review, so none of it
// depends on the weather.
//
// WHAT IS AT STAKE, and why each of these is a property and not a pixel:
//
//  1. "WHICH SEASON" IS A NUMBER NOW. The backend stopped switching
//     between two seasons at 8 games played and started blending them
//     per club by that club's own games played (w = GP/(GP+10)). A
//     board that kept rendering a binary "prior szn" badge would be
//     rounding away the one thing the change produced. The chip must
//     say the share, and its tone must follow the majority.
//  2. A WITHHELD GAP IS NOT A ZERO GAP. A cross-league cup fixture
//     (MLS v Liga MX) has no ppg / GD/g / rank gap at all: the two
//     clubs' rates were never on one scale. `Math.abs(null)` is 0 in
//     JavaScript, so the failure mode is silent and specific — on an
//     ASCENDING sort a gap nobody measured leads the board. It must
//     sort last in BOTH directions, and it must never be cut.
//  3. THE CARD MUST SAY WHAT THE PRICE SETTLES ON. The Leagues Cup
//     legs pay on 90 minutes ("Reg Time: Toluca"), so a level match
//     resolves the TIE leg instead of going to penalties. "54¢" beside
//     a semi-final is the price of leading at full time, not of going
//     through, and a card that does not say so is telling the reader
//     the wrong thing about the number it just showed them.
//  4. THE FIFTH COLUMN IS PAYLOAD-DRIVEN. The four leagues are always
//     drawn; anything else the board serves gets a column rather than
//     being dropped.
//  5. AND SINCE 2026-09-15, A FIFTH COLUMN IS ONE THE BOARD PAGES TO.
//     The board draws FOUR columns at a time behind a ribbon, so "gets
//     a column" now means "is declared, has a pill, and is drawn when
//     the window reaches it" — which is a stronger claim than the one
//     this file made before, because a column that was silently dropped
//     and a column that is merely off screen look identical in a
//     screenshot. `show` below is how each test reaches its own.
//
//     The season-basis BANNER went in the same cut; every claim it
//     carried is asserted here against the column chips that carry it
//     now, and the board-level sort trio went with it, so every sort
//     assertion below drives the MATCHDAY band.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const inHours = (h: number) => {
  // deterministic + day-major aware: 25-minute steps from midnight PT on
  // a fixed date, so h<=32 is one matchday and h=80 lands on the next —
  // exactly what the band tests need, run at any wall-clock time
  const base = Date.UTC(2026, 11, 15, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
};

const weights = (home: number, away: number,
                 basis: [string, string] = ["blend", "blend"]) => ({
  home, away, min: Math.min(home, away), k: 10, constant: null,
  basis: { home: basis[0], away: basis[1] },
});

const REG_TIME_NOTE =
  "REGULATION TIME ONLY. Kalshi's Leagues Cup legs settle on 90 minutes "
  + "plus stoppage — a level match after 90 resolves the TIE leg, it does "
  + "not carry to penalties.";

const CROSS_NOTE =
  "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. 2.0 ppg in "
  + "MLS is not 2.0 ppg in Liga MX. The tiers below are within-league "
  + "quintiles by construction and remain comparable.";

const LEAGUES = {
  mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league",
         blend_k: 10, blend_constant_w: null },
  epl: { src: "prior", min_current_gp: 2, clubs: 20, kind: "league",
         blend_k: 10, blend_constant_w: null },
  laliga: { src: "prior", min_current_gp: 3, clubs: 20, kind: "league",
            blend_k: 10, blend_constant_w: null },
  ligamx: { src: "prior", min_current_gp: 6, clubs: 18, kind: "league",
            blend_k: 10, blend_constant_w: null },
  leaguescup: { src: "prior", min_current_gp: 6, clubs: 47, kind: "cup",
                rated_on: ["mls", "ligamx"], reg_time_note: REG_TIME_NOTE },
};

// An early-season league row: 6 games played, so 38% of this rating is
// this season and the rest is last. This is the exact number the board
// exists to be able to say.
const EARLY = {
  refused: false, league: "ligamx", home: "Puebla", away: "América",
  favourite: "América", opponent: "Puebla", fav_side: "away",
  resolution: {}, ppg_gap: 0.59, gdg_gap: 0.67, rank_gap: 6,
  gp_current: { home: 6, away: 6, min: 6 },
  weights: weights(0.375, 0.375), cross_league: false,
  rated_in: { home: "ligamx", away: "ligamx" },
  gap_note: null, reg_time_note: null,
  src: "prior", ranks: { fav: 1, opp: 7 },
  tiers: { ovr: [1, 2], atk: [1, 1], def: [1, 4] },
  tier_gaps: { ovr: 1, atk: 0, def: 3 }, shape: "SPLIT",
  event_id: "mx-early", competition_id: "mx-early",
  kickoff: inHours(8), espn: "mex.1", kalshi: null,
};

// A late-season league row: 22 games played, so this season is the
// majority partner at 69%.
const LATE = {
  ...EARLY, league: "mls", home: "Sporting Kansas City",
  away: "Vancouver Whitecaps", favourite: "Vancouver Whitecaps",
  opponent: "Sporting Kansas City",
  ppg_gap: 1.36, gdg_gap: 2.05, rank_gap: 29,
  gp_current: { home: 22, away: 21, min: 21 },
  weights: weights(0.6875, 0.6774), src: "current",
  rated_in: { home: "mls", away: "mls" },
  ranks: { fav: 1, opp: 30 },
  tiers: { ovr: [1, 5], atk: [1, 5], def: [1, 5] },
  tier_gaps: { ovr: 4, atk: 4, def: 4 }, shape: "CLEAN",
  event_id: "mls-late", competition_id: "mls-late",
  kickoff: inHours(12), espn: "usa.1", kalshi: null,
};

// A promoted side rated on THIS SEASON ALONE — 100%, and a different
// basis rather than the top of the same scale.
const SOLO = {
  ...EARLY, league: "epl", home: "Hull City", away: "Arsenal",
  favourite: "Arsenal", opponent: "Hull City",
  ppg_gap: 1.2, gdg_gap: 1.1, rank_gap: 14,
  gp_current: { home: 12, away: 12, min: 12 },
  weights: weights(1.0, 0.5455, ["current_only", "blend"]),
  src: "current", rated_in: { home: "epl", away: "epl" },
  ranks: { fav: 2, opp: 16 },
  event_id: "epl-solo", competition_id: "epl-solo",
  kickoff: inHours(14), espn: "eng.1",
};

// ---- the Leagues Cup column -------------------------------------------
// Wednesday's two semi-finals are both Liga MX v Liga MX, so they take
// the FULL card; the cross-league row below them is the one that cannot.

const cupRow = (over: Record<string, unknown>) => ({
  refused: false, league: "leaguescup", fav_side: "home",
  resolution: {}, src: "prior", shape: "SPLIT", espn: "concacaf.leagues.cup",
  reg_time_note: REG_TIME_NOTE, kalshi: null,
  gp_current: { home: 6, away: 6, min: 6 },
  weights: weights(0.375, 0.375),
  ...over,
});

const TOLUCA = cupRow({
  home: "Toluca", away: "León", favourite: "Toluca", opponent: "León",
  ppg_gap: 0.69, gdg_gap: 1.39, rank_gap: 10,
  cross_league: false, rated_in: { home: "ligamx", away: "ligamx" },
  gap_note: null, ranks: { fav: 2, opp: 12 },
  tiers: { ovr: [1, 4], atk: [1, 5], def: [1, 3] },
  tier_gaps: { ovr: 3, atk: 4, def: 2 }, shape: "CLEAN",
  event_id: "lc-toluca", competition_id: "lc-toluca", kickoff: inHours(30),
  kalshi: {
    event_ticker: "KXLEAGUESCUPGAME-26SEP02TOLLEO",
    ticker: "KXLEAGUESCUPGAME-26SEP02TOLLEO-TOL",
    ask_c: 54, bid_c: 53, spread_c: 1, ask_size: 7716, bid_size: 5000,
    flags: [],
  },
});

const AMERICA = cupRow({
  home: "América", away: "Monterrey", favourite: "América",
  opponent: "Monterrey",
  ppg_gap: 0.59, gdg_gap: 0.67, rank_gap: 6,
  cross_league: false, rated_in: { home: "ligamx", away: "ligamx" },
  gap_note: null, ranks: { fav: 1, opp: 7 },
  tiers: { ovr: [1, 2], atk: [1, 1], def: [1, 4] },
  tier_gaps: { ovr: 1, atk: 0, def: 3 },
  event_id: "lc-america", competition_id: "lc-america", kickoff: inHours(32),
  kalshi: {
    event_ticker: "KXLEAGUESCUPGAME-26SEP02AMEMON",
    ticker: "KXLEAGUESCUPGAME-26SEP02AMEMON-AME",
    ask_c: 43, bid_c: 42, spread_c: 1, ask_size: 21764, bid_size: 9000,
    flags: [],
  },
});

// THE ROW WITH NO MEASURED GAP. It carries tiers and nothing else, and
// it is the reason the sort has a null policy on the Stage-1 keys.
const CROSS = cupRow({
  home: "Inter Miami CF", away: "Tigres UANL", favourite: "Tigres UANL",
  opponent: "Inter Miami CF", fav_side: "away",
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, rated_in: { home: "mls", away: "ligamx" },
  gap_note: CROSS_NOTE,
  gp_current: { home: 22, away: 6, min: 6 },
  weights: weights(0.6875, 0.375),
  ranks: { fav: 5, opp: 3 },
  tiers: { ovr: [2, 1], atk: [1, 2], def: [2, 3] },
  tier_gaps: { ovr: -1, atk: 1, def: 1 },
  event_id: "lc-cross", competition_id: "lc-cross", kickoff: inHours(28),
});

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260902", days: 7,
  leagues: LEAGUES,
  // deliberately NOT in board order — each column must sort itself
  rows: [CROSS, EARLY, TOLUCA, LATE, AMERICA, SOLO],
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

/** THIS LEAGUE'S HEADER — its name, its fixture count, its season basis,
 *  its notes and its read failures.
 *
 *  RESTATED 2026-09-15. It used to be found INSIDE the column's section,
 *  which is how these checks were written. It is still the column's own
 *  header, rendered by the column with the column's data — but a board
 *  whose track scrolls has `overflow-x: auto` on that track, which makes
 *  it a scrollport in BOTH axes, and a header in there can never stick to
 *  the viewport. So the header is drawn in the page's sticky rail
 *  instead, and is addressed by the league it NAMES rather than by the
 *  element that used to contain it. There is still exactly one of them
 *  per column; see e2e/the-headers-park-under-the-pills.spec.ts. */
const colHead = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="col-head"][data-league="${slug}"]`);

const orderOf = (c: ReturnType<typeof col>) =>
  c.getByTestId("picker-row")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));

/* ── FIVE DECLARED, FOUR DRAWN (operator, 2026-09-15) ─────────────────
   The board draws FOUR columns at a time and pages through the rest with
   a ribbon (`league-ribbon`, `ribbon-pill`); a pill jumps the window so
   its league is the LEFTMOST drawn column. This fixture declares five,
   so the Leagues Cup — the fifth — is not on screen when the board
   opens, and every test about it has to bring it on screen first.

   `show` jumps to the leftmost column that still leaves `slug` inside
   the four, which keeps the DRAWN order of the columns around it rather
   than dragging the target to the front. At four or fewer declared it
   is a no-op, because the window is. */
const COLUMNS = ["mls", "epl", "laliga", "ligamx", "leaguescup"];
const VIEW = 4;                       // src/pages/bet-suggester/index.tsx

/** THE COLUMNS IN THE SCROLLPORT — RESTATED 2026-09-15.
 *
 *  "Drawn" used to mean "mounted": the page rendered four columns and no
 *  others. The board is a scrolling track now and every declared column
 *  is mounted, so which four you are looking at is a SCROLL POSITION and
 *  has to be asked of the track rather than counted off the DOM. A board
 *  that mounted four columns and never moved satisfied the old count
 *  perfectly, which is how the motion came to be missing. */
const onScreenCols = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const t = document.querySelector<HTMLElement>('[data-testid="board-track"]');
    if (!t) return [] as string[];
    const box = t.getBoundingClientRect();
    return [...t.querySelectorAll<HTMLElement>('[data-testid="league-col"]')]
      .map((c) => ({ slug: c.dataset.league!,
                     x: c.getBoundingClientRect().left - box.left }))
      .filter((c) => c.x > -4 && c.x < box.width - 4)
      .sort((a, b) => a.x - b.x).map((c) => c.slug);
  });

/* DECLARED IS NOT DRAWN. `COLUMNS` is this fixture's DECLARATION — the
   keys of `board.leagues` — which decides WHICH columns exist and
   nothing about their order. The order is the operator's, written once
   in `PICKER_COLUMN_ORDER` and applied by `boardColumns`, so a pill's
   index is an index into THAT.

   `show` computed its jump off the declaration until 2026-09-15 and
   agreed with the board only while the two coincided; when the reading
   order grew to eight it stopped bringing its own subject on screen.
   Derived here, so the order has one copy and this follows it. */
const drawnOrder = (columns: readonly string[] = COLUMNS) =>
  boardColumns(columns);

async function show(page: import("@playwright/test").Page, slug: string,
                    columns: readonly string[] = COLUMNS) {
  const order = drawnOrder(columns);
  const i = order.indexOf(slug);
  expect(i, `${slug} is not a declared column of this board`)
    .toBeGreaterThanOrEqual(0);
  await expect(col(page, slug)).toHaveCount(1);
  if (order.length > VIEW) {
    const lead = order[i < VIEW ? 0 : Math.min(i, order.length - VIEW)];
    await page.locator(
      `[data-testid="ribbon-pill"][data-slug="${lead}"]`).click();
    /* AND WAIT FOR IT TO ARRIVE. Every declared column is mounted since
       2026-09-15, so `col(page, slug)` is satisfied before the board has
       moved a pixel — the jump is a SMOOTH SCROLL now, and a read taken
       on the click describes the layout the click was meant to change.
       "Shown" means in the scrollport, and that is what is waited on.

       TWO AGREEING READS, not just a passing one: `expect.poll` returns
       the instant its assertion holds, and mid-scroll the arriving column
       is already inside the box while the one leaving has not yet left.
       A set read there is a frame nobody was ever shown. */
    await expect.poll(async () => {
      const a = await onScreenCols(page);
      await page.waitForTimeout(60);
      const b = await onScreenCols(page);
      return a.join() === b.join() && b.includes(slug) ? b.join() : "moving";
    }, { message: `${slug} never came to rest in the scrollport` })
      .toContain(slug);
  }
}

/* SORTING IS THE MATCHDAY'S ALONE since 2026-09-15: the board-level
   `col-sort` / `col-dir` / `col-reset` trio is gone and each band keeps
   its own. Every fixture in this file lands in one matchday unless it
   says otherwise, so these resolve to a single element; the two-day
   tests below index explicitly. */
const bandSort = (page: import("@playwright/test").Page) =>
  page.getByTestId("band-sort");
const bandDir = (page: import("@playwright/test").Page) =>
  page.getByTestId("band-dir");

// ------------------------------------------------- the fifth column ----

test("the Leagues Cup gets its own column, after the four leagues",
  async ({ page }) => {
    await open(page);
    /* FIVE DECLARED, FOUR DRAWN, AND THE FIFTH IS NOT HIDDEN — it has a
       pill (2026-09-15). The board's declaration is still five columns
       in the operator's order, and the ribbon is where that order is
       readable when only four of them fit; a declared column with no
       pill would be absent-by-design reading as vanished. */
    const cols = page.getByTestId("league-col");
    // RESTATED: five MOUNTED on the track, four in the scrollport.
    await expect(cols).toHaveCount(COLUMNS.length);
    expect(await onScreenCols(page)).toHaveLength(VIEW);
    const ribbon = page.getByTestId("league-ribbon");
    await expect(ribbon).toHaveCount(1);
    await expect(page.getByTestId("ribbon-pill")).toHaveCount(5);
    expect(await page.getByTestId("ribbon-pill").evaluateAll(
      (els) => els.map((e) => e.getAttribute("data-slug")).sort()))
      .toEqual([...COLUMNS].sort());
    /* THE FOUR ON SCREEN ARE THE FOUR THE RIBBON SAYS ARE ON SCREEN —
       and which four that is comes from `boardColumns`, not from a list
       typed here. The subject is the agreement between the lit pills and
       the drawn columns; the identity of the leagues is the operator's
       reading order, which lives in one file and is read from it. */
    const lit = () => page.getByTestId("ribbon-pill")
      .and(page.locator('[aria-selected="true"]'))
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
    const drawn = () => onScreenCols(page);
    expect(await lit()).toEqual(drawnOrder().slice(0, VIEW));
    expect(await drawn()).toEqual(await lit());

    /* AND IT SITS AFTER THE LEAGUES, which is the claim: bring it on
       screen and it is LAST, with its neighbours still in drawn order
       and no league displaced to make room for it. A cup is not named in
       `PICKER_COLUMN_ORDER` at all, so "after the leagues" is a property
       of that list rather than of this fixture's five slugs. */
    await show(page, "leaguescup");
    await expect(cols).toHaveCount(COLUMNS.length);
    const withCup = await drawn();
    expect(withCup[withCup.length - 1]).toBe("leaguescup");
    expect(withCup).toEqual(drawnOrder().slice(-VIEW));
    /* …and the ribbon agrees about the move, so the two readings of the
       window cannot drift apart. WAITED OUT, not polled: the wave that
       carries the names across the slots is staggered — the furthest is
       `SLOTS-1` × 26ms behind the first, on top of a 430ms reveal — and a
       pill takes its new identity when its own leg STARTS, so a read
       taken on arrival compares a half-arrived rail. The agreement is
       what this asserts; the latency is not. */
    await page.waitForTimeout(800);
    expect(await lit()).toEqual(withCup);
    const cup = col(page, "leaguescup");
    await expect(colHead(page, "leaguescup")
      .getByRole("heading", { name: "Leagues Cup" }))
      .toBeVisible();
    // and it says what it is: a tournament with no table of its own,
    // whose clubs were rated on the leagues named here
    await expect(colHead(page, "leaguescup").getByTestId("col-cup"))
      .toHaveText(/cup · rated on MLS \+ Liga MX/);
    await expect(colHead(page, "leaguescup").getByTestId("col-count")).toHaveText("3 fixtures");
  });

test("every cup row served is drawn, and Wednesday's two semis carry the full card",
  async ({ page }) => {
    await open(page);
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup");
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    const toluca = cup.getByTestId("picker-row")
      .filter({ hasText: "Toluca" });
    // both clubs are Liga MX, so nothing is withheld
    await expect(toluca).toHaveAttribute("data-cross-league", "false");
    await expect(toluca).toContainText("+1.39");     // GD/g gap
    await expect(toluca).toContainText("+0.69");     // ppg gap
    await expect(toluca).toContainText("+10");       // rank gap
    await expect(toluca.getByTestId("tier-cell")).toHaveCount(3);
    await expect(toluca.getByTestId("gap-note")).toHaveCount(0);
    await expect(toluca.getByTestId("rated-in")).toHaveCount(0);
    await expect(toluca).toContainText("ask 54¢");
  });

// --------------------------------------- cross-league: tiers only ------

test("a cross-league cup fixture withholds its gaps, says why, and keeps its tiers",
  async ({ page }) => {
    await open(page);
    await show(page, "leaguescup");
    const cross = col(page, "leaguescup").getByTestId("picker-row")
      .filter({ hasText: "Tigres UANL" });
    await expect(cross).toHaveAttribute("data-cross-league", "true");
    // the three Stage-1 numbers read n/a — NOT "0.00", which is a
    // measured level and a completely different finding.
    //
    // 2026-09-08 (operator, backend docs/DECISION-ucl-board-sort): the
    // ANCHOR on a cross-league row is the TIER gap, so it is the one
    // figure here that is NOT n/a. This test used to assert the anchor
    // read n/a too, and that was right while GD/g was the only fallback
    // — but a board where every anchor is withheld reads as broken
    // rather than as honest, and the tier gap is a real measured
    // comparison two different tables genuinely support.
    //
    // WHAT THIS TEST GUARDS IS UNCHANGED: the three withheld gaps still
    // read n/a wherever they are drawn, and none of them is a zero. The
    // anchor moved to a number that was always measured; it did not
    // start rendering a withheld one.
    await expect(cross.getByTestId("row-anchor"))
      .toHaveAttribute("data-anchor", "tier_ovr");
    await expect(cross.getByTestId("row-anchor")).toHaveText("−1");
    await expect(cross).toContainText(/GD\/g\s*n\/a/);
    await expect(cross).toContainText(/ppg\s*n\/a/);
    await expect(cross).toContainText(/rank\s*n\/a/);
    await expect(cross).not.toContainText("+0.00");
    await expect(cross).not.toContainText("0.00");
    // …and THE BOARD says why, in the backend's own words. From
    // 2026-09-09 that is the column header rather than this card: the
    // note is a CupSpec constant about the column's rating basis, so a
    // card carrying it redrew one paragraph per row. WHAT THIS TEST
    // GUARDS IS UNCHANGED — the board still states why a gap is
    // withheld, in the backend's exact words — only its address moved,
    // and the `n/a` values asserted just above are untouched.
    await expect(cross.getByTestId("gap-note")).toHaveCount(0);
    // which table each club came from, since they differ
    await expect(cross.getByTestId("rated-in"))
      .toHaveText("MLS v Liga MX");
    // the tiers survive — they are within-league quintiles, which is
    // exactly the property that makes the comparison possible
    await expect(cross.getByTestId("tier-cell")).toHaveCount(3);
    // the overall cell is a glyph now — the exact pair lives in the
    // popover, same words as ever
    await expect(cross.locator('[data-dim="overall"]'))
      .toHaveAttribute("data-gap", "-1");
    await cross.getByTestId("tier-read").click();
    await expect(cross.getByTestId("shape-read"))
      .toContainText("T2 v T1 −1");
    // the note's new home, opened from the column header
    const cupCol = col(page, "leaguescup");
    await colHead(page, "leaguescup").getByTestId("col-notes-open").click();
    await expect(colHead(page, "leaguescup").getByTestId("col-notes").getByTestId("gap-note"))
      .toContainText("2.0 ppg in MLS is not 2.0 ppg in Liga MX");
  });

test("a league row never claims a cross-league caveat it does not have",
  async ({ page }) => {
    await open(page);
    for (const slug of ["mls", "epl", "ligamx"]) {
      const c = col(page, slug);
      await expect(c.getByTestId("gap-note")).toHaveCount(0);
      await expect(c.getByTestId("rated-in")).toHaveCount(0);
      await expect(c.getByTestId("reg-time-note")).toHaveCount(0);
      // …and no affordance offering either of them, which is the same
      // claim one level up: a league column has no caveat to hide.
      await expect(colHead(page, slug).getByTestId("col-notes-open")).toHaveCount(0);
    }
  });

// ------------------------------------------ the regulation-time note ---

test("the Leagues Cup column says ONCE what its market settles on",
  async ({ page }) => {
    // MOVED FROM THE CARDS (operator, 2026-09-09 — the third time he has
    // given this rule): "a fact about the whole COLUMN belongs in the
    // column header, once. Only a fact about THIS FIXTURE belongs on the
    // card." `reg_time_note` is a CupSpec constant, identical on every
    // row of the competition, so three cards carried one paragraph three
    // times. The load-bearing fact — REGULATION TIME ONLY, in the
    // backend's own words, not summarised — is still on the board.
    await open(page);
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup");
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    await expect(cup.getByTestId("reg-time-note")).toHaveCount(0);

    const trigger = colHead(page, "leaguescup").getByTestId("col-notes-open");
    await expect(trigger).toHaveCount(1);        // one circle, not three
    await expect(trigger).toHaveAttribute("data-notes", "gap+reg-time");
    await expect(colHead(page, "leaguescup").getByTestId("col-notes")).toHaveCount(0);

    await trigger.click();
    const note = colHead(page, "leaguescup").getByTestId("col-notes").getByTestId("reg-time-note");
    await expect(note).toContainText(/regulation time only/i);
    await expect(note).toContainText(/90 minutes/i);
    await expect(note).toContainText(/penalties/i);
    // the price is still on every card; only its explanation moved
    const toluca = cup.getByTestId("picker-row").filter({ hasText: "Toluca" });
    await expect(toluca).toContainText("ask 54¢");
  });

test("the column note opens on hover, on focus and on tap, and Escape shuts it",
  async ({ page }) => {
    // HOVER IS NOT ENOUGH ON ITS OWN. There is no hover on a phone and
    // none from a keyboard, and this is the sentence that stops an `n/a`
    // reading as missing data rather than as a refused comparison — so
    // hover-only would make it unreachable rather than tidy.
    await open(page);
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup");
    const trigger = colHead(page, "leaguescup").getByTestId("col-notes-open");
    const panel = colHead(page, "leaguescup").getByTestId("col-notes");

    // a real accessible name, naming what is behind the circle
    await expect(trigger).toHaveAccessibleName(
      "why this column withholds gaps, and what its prices settle on");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.hover();
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    // move the pointer off it and it closes again
    await colHead(page, "leaguescup").getByTestId("col-count").hover();
    await expect(panel).toHaveCount(0);

    // KEYBOARD: focus alone opens it, Escape shuts it
    await trigger.focus();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    // TAP: a click opens it and stays open with the pointer elsewhere,
    // and a second click is the way out on a touch screen
    await trigger.click();
    await expect(panel).toBeVisible();
    await colHead(page, "leaguescup").getByTestId("col-count").hover();
    await expect(panel).toBeVisible();
    await trigger.click();
    await expect(panel).toHaveCount(0);
  });

// ----------------------------------------------------- the weights ----

test("the season share is a number on the row, not a binary badge",
  async ({ page }) => {
    /* UPDATED 2026-09-07. The basis is a LEAGUE fact and the column
       header states it, so an ordinary row no longer repeats it — the
       chip is drawn only where the fixture DEPARTS from its column
       (a side with no prior-season row, a frozen-weight control, or a
       cut that disagrees). What this test pins is unchanged and is the
       reason it exists: WHERE a chip is drawn it is a percentage with a
       tone and both sides on its title, never a binary badge. It now
       reads that off a departing row, and asserts the ordinary one
       carries nothing at all. */
    /* UPDATED AGAIN 2026-09-07, and this is the operator's call after
       seeing it on the board: NO row carries a season chip. Drawing it
       only on departing rows made it appear on some cards and not
       others, which reads as a fact that varies fixture by fixture —
       and it does not; the basis belongs to the table the whole column
       is rated on. What this test holds now is that no row anywhere
       draws one, and that the departure is still derived and still
       carried as data, so removing the ink did not remove the fact. */
    await open(page);
    for (const league of ["ligamx", "epl", "mls", "laliga"]) {
      const rows = col(page, league).getByTestId("picker-row");
      await expect(rows.getByTestId("season-weight")).toHaveCount(0);
      await expect(rows.getByText("prior szn")).toHaveCount(0);
    }
    // the fact survives the ink: the departing EPL row still says so
    await expect(col(page, "epl").getByTestId("picker-row").first())
      .toHaveAttribute("data-season-departure",
        /no prior-season row and is rated on this season alone/);
    // and an ordinary row carries no departure at all — non-vacuity,
    // because an attribute present on every row would prove nothing
    await expect(col(page, "ligamx").getByTestId("picker-row").first())
      .not.toHaveAttribute("data-season-departure", /./);
  });

test("a late-season fixture reads as this season's, and a promoted side as its own basis",
  async ({ page }) => {
    await open(page);
    /* The late-season fixture is its column's ORDINARY case — the MLS
       header already says `this szn · min N GP` — so it carries no chip
       at all now. The promoted side still does, because it is rated on a
       different basis than the column it sits in, which is the whole
       distinction this test is named for. */
    const late = col(page, "mls").getByTestId("picker-row").first();
    await expect(late.getByTestId("season-weight")).toHaveCount(0);
    // the header carries it once, for every row beneath it
    await expect(colHead(page, "mls").getByText(/this szn · min/i))
      .toBeVisible();
    await expect(late).not.toHaveAttribute("data-season-departure", /./);
    // a club with no last-season row at all is rated on this season
    // alone — a different basis from its column, carried as data on the
    // row now that no card draws a season badge
    const solo = col(page, "epl").getByTestId("picker-row").first();
    await expect(solo.getByTestId("season-weight")).toHaveCount(0);
    await expect(solo).toHaveAttribute("data-season-departure",
      /no prior-season row and is rated on this season alone/);
  });

test("the season basis is a chip on its own column, and the blend rather "
   + "than a threshold", async ({ page }) => {
  /* WAS "the banner explains the blend rather than a threshold" until
     2026-09-15, when the operator took the season-basis banner off the
     landing page: "every column already prints its own blend on its own
     chip — a second copy of a fact is the copy that rots."

     BOTH HALVES OF THE OLD CLAIM SURVIVE AND ARE ASSERTED HERE. The
     caveat is on arrival, on the column it is about, and it names a
     BLEND (a share of this season) and never a threshold — the "Under 8
     games played" wording this test has refused since the blend
     shipped. The arithmetic is still one deliberate click away, now in
     the legend rather than in a disclosure inside a banner that no
     longer exists; `e2e/picker-prose.spec.ts` pins the same move from
     the other end.

     THE CUP IS STILL EXCLUDED, which was the sharpest thing the banner's
     count said: a cup has no season table of its own to be rated on, so
     it is not one of the leagues rated on last season. Read off the
     board's own chips now instead of off a printed tally. */
  await open(page);
  // no second copy above the board, in either half
  await expect(page.getByTestId("prior-banner")).toHaveCount(0);
  await expect(page.getByTestId("prior-banner-blend")).toHaveCount(0);

  // ON ARRIVAL, on the column: the basis, and the share that is why.
  const mx = colHead(page, "ligamx").getByTestId("col-season");
  await expect(mx).toBeVisible();
  await expect(mx).toHaveText(/prior szn · 3[0-9]% this szn/);
  await expect(mx).toHaveAttribute("title", /6 GP/);
  // A BLEND, NEVER A THRESHOLD — the wording the 2026-09 change killed.
  await expect(page.locator("body")).not.toContainText(/Under 8/i);

  /* THREE OF THE FOUR LEAGUES, AND NOT THE CUP. The cup carries a basis
     and NO percentage, because one number over a column of clubs rated
     on several different tables belongs to no table.
     RESTATED 2026-09-15: every declared column is mounted on the track,
     so the chips are read from all five and the cup's is separated by
     its SLUG rather than by whether the window happened to be showing
     it. The claim is about the cup, and it never was about the window
     position. */
  /* RESTATED AGAIN 2026-09-15: the chip is in the column's HEADER, and
     on a scrolling board the header is drawn in the page's sticky rail
     rather than inside the section — so the chips are read off the
     headers and separated by the league each one names. Which is the
     same separation this already made; only where the chip is found has
     moved. */
  const chips = await page.getByTestId("col-head").evaluateAll((els) =>
    els.map((e) => ({ slug: e.getAttribute("data-league"),
      text: (e.querySelector('[data-testid="col-season"]')?.textContent
             ?? "").trim() })));
  const leagueChips = chips.filter((c) => c.slug !== "leaguescup")
    .map((c) => c.text);
  expect(leagueChips).toHaveLength(4);
  expect(leagueChips.filter((t) => /prior szn/.test(t))).toHaveLength(3);
  await show(page, "leaguescup");
  const cupChip = colHead(page, "leaguescup").getByTestId("col-season");
  await expect(cupChip).toHaveText(/prior szn/);
  await expect(cupChip).not.toHaveText(/%/);

  // THE ARITHMETIC IS STILL IN THE DOCUMENT, and still shut on arrival.
  await expect(page.getByTestId("legend")).toHaveCount(0);
  await page.getByRole("button", { name: /how to read a row/i }).click();
  const legend = page.getByTestId("legend");
  await expect(legend)
    .toContainText("weighted average of this season and last");
  await expect(legend).toContainText("GP / (GP + 10)");
  await expect(legend).toBeVisible();
});

// ------------------------------- a withheld gap is not a small gap -----

test("the withheld gap sorts last under every Stage-1 key, in both directions",
  async ({ page }) => {
    await open(page);
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup");
    // the default order is KICKOFF ascending now (2026-09-02): cross at
    // +28h, toluca +30h, america +32h. The withheld gap is not what
    // orders this first assertion — every row has a kickoff — so the
    // null-last policy below is tested purely by the Stage-1 keys.
    await expect.poll(() => orderOf(cup))
      .toEqual(["lc-cross", "lc-toluca", "lc-america"]);
    for (const mode of ["gdg", "ppg", "rank"]) {
      await bandSort(page).selectOption(mode);
      await expect.poll(() => orderOf(cup))
        .toEqual(["lc-toluca", "lc-america", "lc-cross"]);
      await bandDir(page).click();
      // the measured rows reverse; the withheld one does NOT become the
      // smallest — this is the ascending case where `Math.abs(null)`
      // would have put it first
      await expect.poll(() => orderOf(cup))
        .toEqual(["lc-america", "lc-toluca", "lc-cross"]);
      await bandDir(page).click();
    }
  });

test("the cross-league null policy is stated ONCE for the board, never "
   + "inside a column", async ({ page }) => {
    /* WAS "the cross-league note is not printed over a column that has no
       such row". The claim is unchanged: `col-null-note` is the BOARD's
       sentence, drawn once beside its controls because a withheld-gap
       row exists SOMEWHERE on the board, and never inside a league
       column — a mutation that printed it over every column is what this
       test was written for.

       HOW IT IS REACHED CHANGED ON 2026-09-15. The note follows the
       BOARD's sort, and the board's sort control is gone; `loadBoardSort`
       still reads `picker:sort:board` on every load, so a key stored
       before the cut is what the board runs today and the note has to be
       there for that reader. Seeded through that door rather than
       through a control, because there is no longer a control.

       REPORTED, NOT ASSERTED AWAY: picking a Stage-1 key on a MATCHDAY
       band reorders the day and leaves this sentence unsaid, so no
       control on the page can now produce the state below. That is a src
       question. */
    /* THE SEED IS GONE AND SO IS THE STATE (2026-09-15). This reached a
       board-level key through `picker:sort:board`; that key is cleared on
       load now, because a preference a reader can neither change nor
       reset is a board that is wrong and cannot be told so. The matchday
       sort is a DIFFERENT axis — it reorders a day, not the key every
       column is ranked by — so the board runs `kickoff` and the claim
       here is what remains TRUE of it. `runningNullNote` still derives
       from the sorts genuinely running, so a board-level key returning
       restates the sentence with no edit here. */
    await open(page);
    const mls = col(page, "mls");
    // WAIT FOR THE COLUMN FIRST. A "count 0" assertion fired before the
    // board has painted passes on an element that has not rendered YET,
    // not on one that is deliberately absent — a mutation that printed
    // this note over every column slipped through exactly that hole.
    await expect(mls.getByTestId("picker-row")).toHaveCount(1);
    await expect(bandSort(page)).toHaveValue("kickoff");
    // NO board-level policy is claimed, because none is running…
    await expect(page.getByTestId("col-null-note")).toHaveCount(0);
    /* …and never inside a column. Checked on BOTH halves of the window,
       so the fifth column is not exempted from the rule by happening to
       be off screen when the check ran. */
    for (const jump of ["mls", "leaguescup"]) {
      await show(page, jump);
      // RESTATED: the whole declaration is mounted, so this covers every
      // column at once rather than four of five at a time.
      await expect(page.getByTestId("league-col"))
        .toHaveCount(COLUMNS.length);
      await expect(page.getByTestId("league-col")
        .getByTestId("col-null-note")).toHaveCount(0);
    }
    /* AND ABSENT ON THE DEFAULT BOARD, which is the other half: kickoff
       has no null policy to state — every row has one — so an unseeded
       reader meets no sentence rather than an inapplicable one. */
    await page.addInitScript(() => {
      try { window.localStorage.removeItem("picker:sort:board"); }
      catch { /* nothing to clear */ }
    });
    await open(page);
    await expect(col(page, "mls").getByTestId("picker-row")).toHaveCount(1);
    await expect(bandSort(page)).toHaveValue("kickoff");
    await expect(page.getByTestId("col-null-note")).toHaveCount(0);
  });

test("under a tie on another key, a MEASURED zero gap still leads a withheld one",
  async ({ page }) => {
    // The board's tiebreak order is |GD/g gap| descending, and it has to
    // stay null-aware there too: with a withheld gap read as `?? 0` it
    // ties with a genuine 0.00 and the served order decides, which is
    // how a row nobody measured can end up above one that was.
    const sameTime = inHours(26);
    const level = cupRow({
      home: "Level A", away: "Level B", favourite: "Level A",
      opponent: "Level B",
      ppg_gap: 0.0, gdg_gap: 0.0, rank_gap: 0,
      cross_league: false, rated_in: { home: "ligamx", away: "ligamx" },
      gap_note: null, ranks: { fav: 3, opp: 4 },
      tiers: { ovr: [2, 2], atk: [2, 2], def: [2, 2] },
      tier_gaps: { ovr: 0, atk: 0, def: 0 }, shape: "HOLLOW",
      event_id: "lc-level", competition_id: "lc-level", kickoff: sameTime,
    });
    const withheld = { ...CROSS, kickoff: sameTime };
    await open(page, {
      ...BOARD,
      // the withheld row is served FIRST, so a tie that falls back to
      // served order would leave it on top
      rows: [withheld, level],
    });
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup");
    await bandSort(page).selectOption("kickoff");
    await expect.poll(() => orderOf(cup)).toEqual(["lc-level", "lc-cross"]);
  });

test("no sort mode drops a cup row — ranks, never cuts", async ({ page }) => {
  await open(page);
  await show(page, "leaguescup");
  const cup = col(page, "leaguescup");
  await expect(cup.getByTestId("picker-row")).toHaveCount(3);
  const modes = await bandSort(page).locator("option")
    .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
  expect(modes.length).toBe(11);   // +shape, 2026-09-01
  for (const m of modes) {
    await bandSort(page).selectOption(m);
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    await bandDir(page).click();
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    await bandDir(page).click();
  }
  /* SIX SERVED, SIX ON THE BOARD — and the one whose column this jump
     pages off SCREEN is still on the track, one scroll away, rather than
     unmounted.

     RESTATED 2026-09-15, and the restatement is the stronger claim. The
     board used to render four of its five columns, so the sixth row was
     genuinely absent from the page and this guard could only say "absent
     because its column is not drawn, not because a sort cut it" — a
     distinction the reader could not see. Every declared column is
     mounted now, so RANKS-NEVER-CUTS is asserted as it reads: every
     served row is on the board under every sort mode, and the column
     that is off screen is off SCREEN and not gone.

     WHICH league that is follows the operator's reading order and is
     therefore not typed here: it is the declared column the board is not
     currently showing, named by subtraction. */
  const shown = await onScreenCols(page);
  const paged = drawnOrder().filter((s) => !shown.includes(s));
  expect(paged, "five declared and four in the scrollport leaves exactly "
    + "one off").toHaveLength(1);
  // off screen, and NOT dropped: the column is on the track with its row
  await expect(col(page, paged[0])).toHaveCount(1);
  await expect(col(page, paged[0]).getByTestId("picker-row"))
    .toHaveCount(1);
  await expect(page.getByTestId("picker-row")).toHaveCount(6);
  await expect(col(page, "ligamx").getByTestId("picker-row")).toHaveCount(1);
  await show(page, "mls");
  expect(await onScreenCols(page)).toContain("mls");
  await expect(page.getByTestId("picker-row")).toHaveCount(6);
  await expect(col(page, "mls").getByTestId("picker-row")).toHaveCount(1);
});

// ------------------------------------------------------- the legend ---

test("the legend defines the share, the withheld gap and regulation time",
  async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: /how to read a row/i }).click();
    // SCOPED TO THE LEGEND (2026-09-06). The season banner now carries
    // the same "GP / (GP + 10)" sentence inside its own closed
    // disclosure, and a page-wide getByText().first() resolved to that
    // hidden copy — a locator that found this definition by document
    // order rather than by identity. Same claim, addressed properly.
    const legend = page.getByTestId("legend");
    await expect(legend.getByText("38% this szn", { exact: true }).first())
      .toBeVisible();
    await expect(legend.getByText(/GP \/ \(GP \+ 10\)/).first()).toBeVisible();
    await expect(legend.getByText(/mean of two league positions is not a position/i))
      .toBeVisible();
    await expect(legend.getByText(/n\/a · cross-league/)).toBeVisible();
    await expect(legend.getByText(/regulation time/i).first()).toBeVisible();
  });

// ----------------------------------------------------- responsiveness --

test("the five columns stack on a phone with no horizontal overflow",
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await open(page);
    await expect(page.getByTestId("league-jump").locator("a")).toHaveCount(5);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

// ---------------------------------------------------------------------
// The fold: a cup fixture whose two clubs share a league is drawn in
// THAT league's column, and the cup column stops being drawn at all.
// (2026-09-01. The Leagues Cup reached its semi-finals as an all-Liga MX
// tournament, so a whole column stood empty-but-for-two beside four full
// ones while Liga MX's own table described both fixtures completely.)
// ---------------------------------------------------------------------

const FOLDED_BOARD = {
  ...BOARD,
  // the four leagues only — the backend drops a cup column no row claims
  leagues: Object.fromEntries(
    Object.entries(LEAGUES).filter(([k]) => k !== "leaguescup")),
  rows: [
    { ...TOLUCA, column: "ligamx" },
    { ...AMERICA, column: "ligamx" },
  ],
  folded: {
    leaguescup: { kind: "cup", rated_on: ["mls", "ligamx"],
                  folded_into: ["ligamx"], fixtures: 2 },
  },
};

test("a same-league cup tie is drawn in that league's column, and the cup column is gone", async ({ page }) => {
  await open(page, FOLDED_BOARD);
  await expect(col(page, "leaguescup")).toHaveCount(0);
  const ligamx = col(page, "ligamx");
  await expect(ligamx).toBeVisible();
  await expect(ligamx.locator('[data-testid="picker-row"]')).toHaveCount(2);
  await expect(ligamx.getByText("Toluca", { exact: false }).first())
    .toBeVisible();
});

test("a folded row still says which competition it is", async ({ page }) => {
  // the whole reason the fold is safe: these legs settle on 90 minutes
  // plus stoppage, so a card that read as a plain Liga MX fixture would
  // carry a wrong assumption straight into the price.
  await open(page, FOLDED_BOARD);
  const row = col(page, "ligamx").locator('[data-testid="picker-row"]').first();
  await expect(row.locator('[data-testid="competition-badge"]'))
    .toHaveText(/leagues cup/i);
  await expect(row).toHaveAttribute("data-league", "leaguescup");
  await expect(row).toHaveAttribute("data-column", "ligamx");
});

test("a league fixture gets no competition badge", async ({ page }) => {
  // the badge must mark the exception, not decorate every card
  await open(page);
  const anyLeagueRow = col(page, "ligamx")
    .locator('[data-testid="picker-row"]').first();
  await expect(anyLeagueRow.locator('[data-testid="competition-badge"]'))
    .toHaveCount(0);
});

// ---------------------------------------------------------------------
// Day dividers (2026-09-01): a kickoff-sorted column is a schedule and
// gets date headers; a ranking-sorted column is a ladder and must not
// be sliced by a key it is not ordered by.
// ---------------------------------------------------------------------

test("the board is day-major: bands under every sort, ranks restart per day", async ({ page }) => {
  // a hermetic two-day column: a second fixture on the NEXT matchday
  const dayTwo = {
    ...EARLY, event_id: "mx-day2", competition_id: "mx-day2",
    home: "Tigres UANL", away: "Necaxa", favourite: "Tigres UANL",
    opponent: "Necaxa", kickoff: inHours(80),
  };
  await open(page, { ...BOARD, rows: [EARLY, dayTwo] });
  const ligamx = col(page, "ligamx");
  await expect(ligamx.locator('[data-testid="picker-row"]')).toHaveCount(2);
  // day-major is the PRIMARY structure: the bands are there under the
  // default |GD/g| sort, not just under kickoff
  const dividers = ligamx.locator('[data-testid="day-divider"]');
  await expect(dividers).toHaveCount(2);
  // ...and the rank badge restarts per day: each day's best is 01
  const ranks = ligamx.getByTestId("row-rank");
  await expect(ranks.nth(0)).toHaveText("01");
  await expect(ranks.nth(1)).toHaveText("01");
  /* the chosen sort still ranks WITHIN each day — switching it must
     never move a fixture across its matchday. TWO matchdays here, so
     two band controls: both are moved, because the claim is about what
     a sort may do to the day STRUCTURE and one band left on the default
     would leave half of it untested. */
  await expect(bandSort(page)).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    await bandSort(page).nth(i).selectOption("ask");
  }
  await expect(ligamx.locator('[data-testid="day-divider"]')).toHaveCount(2);
  const events = ligamx.getByTestId("picker-row");
  await expect(events.nth(0)).toHaveAttribute("data-event", EARLY.event_id);
  await expect(events.nth(1)).toHaveAttribute("data-event", "mx-day2");
});

test("at desktop width a date is one full-width band across every league", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  // the page draws each matchday's label ONCE, spanning the board; the
  // per-column dividers yield to it at this width
  const bands = page.getByTestId("day-band");
  await expect(bands.first()).toBeVisible();
  expect(await bands.count()).toBeGreaterThanOrEqual(1);
});

// ------------------------------------------------- the shape sort mode

test("shape sorts CLEAN before SPLIT before HOLLOW, and drops nothing", async ({ page }) => {
  await open(page);
  await show(page, "leaguescup");
  // the cup column: three rows, mixed shapes — and toHaveCount FIRST,
  // because a bare count() races the board's initial paint
  const cup = col(page, "leaguescup");
  const rows = cup.getByTestId("picker-row");
  await expect(rows).toHaveCount(3);
  await bandSort(page).selectOption("shape");
  await expect(rows).toHaveCount(3);
  // descending: every CLEAN precedes every SPLIT precedes every HOLLOW
  const shapes = await rows.evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-shape")));
  const rankOf = (s: string | null) =>
    s === "CLEAN" ? 2 : s === "SPLIT" ? 1 : 0;
  for (let i = 1; i < shapes.length; i++) {
    expect(rankOf(shapes[i - 1])).toBeGreaterThanOrEqual(rankOf(shapes[i]));
  }
  // ...and the flip inverts the buckets without losing a row
  await bandDir(page).click();
  await expect(rows).toHaveCount(3);
  const flipped = await rows.evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-shape")));
  for (let i = 1; i < flipped.length; i++) {
    expect(rankOf(flipped[i - 1])).toBeLessThanOrEqual(rankOf(flipped[i]));
  }
});

// -------------------------------------------- per-day sort overrides ---

test("a band override re-sorts ONE day, and leaves the other alone", async ({ page }) => {
  /* WAS "a band override re-sorts ONE day; the board default clears it"
     until 2026-09-15. The second half named `applyBoardSort`'s side
     effect — changing the board default wipes every per-day override —
     and the control that called it is gone, so no reader can reach that
     path any more. It is named here rather than silently dropped; the
     first half, which is what "override" means, is unchanged and is
     strengthened below by asserting the OTHER day held still. */
  const dayTwo = {
    ...EARLY, event_id: "mx-day2", competition_id: "mx-day2",
    home: "Tigres UANL", away: "Necaxa", favourite: "Tigres UANL",
    opponent: "Necaxa", kickoff: inHours(80),
  };
  const dayTwoB = {
    ...EARLY, event_id: "mx-day2b", competition_id: "mx-day2b",
    home: "Pumas UNAM", away: "Querétaro", favourite: "Pumas UNAM",
    opponent: "Querétaro", gdg_gap: 0.2, kickoff: inHours(82),
    kalshi: {
      event_ticker: "KXLIGAMX-DAY2B", ticker: "T-day2b",
      ask_c: 30, bid_c: 29, spread_c: 1, ask_size: 500, bid_size: 400,
      flags: [],
    },
  };
  await open(page, { ...BOARD, rows: [EARLY, dayTwo, dayTwoB] });
  const ligamx = col(page, "ligamx");
  const rows = ligamx.getByTestId("picker-row");
  await expect(rows).toHaveCount(3);
  // two matchdays -> two band headers, each with its own sort + dir
  const bands = page.getByTestId("day-band");
  await expect(bands).toHaveCount(2);
  await expect(page.getByTestId("band-sort")).toHaveCount(2);
  await expect(page.getByTestId("band-dir")).toHaveCount(2);
  // override day 2 only: kickoff asc there, GD/g everywhere else
  await page.getByTestId("band-sort").nth(1).selectOption("kickoff");
  await expect(rows.nth(0)).toHaveAttribute("data-event", EARLY.event_id);
  await expect(rows.nth(1)).toHaveAttribute("data-event", "mx-day2");
  await expect(rows.nth(2)).toHaveAttribute("data-event", "mx-day2b");
  // flip that day's direction — day 2 reverses, day 1 untouched
  await page.getByTestId("band-dir").nth(1).click();
  await expect(rows.nth(0)).toHaveAttribute("data-event", EARLY.event_id);
  await expect(rows.nth(1)).toHaveAttribute("data-event", "mx-day2b");
  await expect(rows.nth(2)).toHaveAttribute("data-event", "mx-day2");
  /* AND DAY ONE NEVER MOVED. The control says so as well as the order
     does: day 1 still reads as the default, day 2 says it is carrying an
     override, and a band that could not tell a reader which of the two
     it is would make a diverging column look like a defect. */
  await expect(page.getByTestId("band-sort").nth(0)).toHaveValue("kickoff");
  await expect(page.getByTestId("band-dir").nth(0))
    .toHaveAttribute("data-dir", "asc");
  await expect(bands.nth(0)).toContainText("sort");
  await expect(bands.nth(1)).toContainText("this day");
});

// ------------------------------------------------ rest-day ghost cells ---

test("a league's empty matchday says rest day and names its next fixture", async ({ page }) => {
  const dayTwo = {
    ...EARLY, event_id: "mx-day2", competition_id: "mx-day2",
    home: "Tigres UANL", away: "Necaxa", favourite: "Tigres UANL",
    opponent: "Necaxa", kickoff: inHours(80),
  };
  // day 1: ligamx + mls; day 2: ligamx only -> the MLS column's day-2
  // track carries a ghost, not a hole
  await open(page, { ...BOARD, rows: [EARLY, LATE, dayTwo] });
  const mls = col(page, "mls");
  const ghost = mls.getByTestId("rest-day");
  await expect(ghost).toHaveCount(1);
  await expect(ghost).toContainText(/rest day/i);
  await expect(ghost).toContainText(/no more fixtures in window/i);
  // ligamx plays both days: no ghost anywhere in its column
  await expect(col(page, "ligamx").getByTestId("rest-day")).toHaveCount(0);
  // a league with NOTHING in the window keeps its louder empty state
  // instead of a row of ghosts
  await expect(col(page, "epl").getByTestId("col-empty")).toBeVisible();
  await expect(col(page, "epl").getByTestId("rest-day")).toHaveCount(0);
});

// -------------------------------------------------- form strips --------

test("form strips draw last results per side; absent form draws nothing", async ({ page }) => {
  const withForm = {
    ...EARLY,
    // opp deliberately SHORT: two games played — the strip must still
    // occupy five aligned slots, padding from the LEFT so the newest
    // result stays rightmost
    form: { fav: "WDLWW", opp: "WL" },
  };
  const without = {
    ...EARLY, event_id: "mx-noform", competition_id: "mx-noform",
    home: "Atlas", away: "Juárez", favourite: "Atlas", opponent: "Juárez",
    kickoff: inHours(10), form: null,
  };
  await open(page, { ...BOARD, rows: [withForm, without] });
  const ligamx = col(page, "ligamx");
  await expect(ligamx.getByTestId("picker-row")).toHaveCount(2);
  const first = ligamx.getByTestId("picker-row")
    .filter({ hasText: EARLY.favourite });
  const strips = first.getByTestId("form-strip");
  await expect(strips).toHaveCount(2);         // one per side
  // five cells each, colour-coded by result: the favourite's newest
  // (rightmost) is a W, the opponent's whole run is losses
  await expect(strips.nth(0).locator("i")).toHaveCount(5);
  await expect(strips.nth(0).locator('i[data-r="W"]')).toHaveCount(3);
  // the short strip still fills five slots — three empty placeholders on
  // the LEFT, results on the right, newest last
  await expect(strips.nth(1).locator("i")).toHaveCount(5);
  await expect(strips.nth(1).locator('i[data-r=""]')).toHaveCount(3);
  await expect(strips.nth(1).locator("i").nth(3))
    .toHaveAttribute("data-r", "W");
  await expect(strips.nth(1).locator("i").nth(4))
    .toHaveAttribute("data-r", "L");
  // an older payload (or an unknown club) simply has no strips
  await expect(ligamx.getByTestId("picker-row")
    .filter({ hasText: "Atlas" }).getByTestId("form-strip")).toHaveCount(0);
});

// ------------------------------------------ the way in, per competition

// A card is the way INTO a fixture, and every card links to
// /bet-suggester/<league>/<event_id>. That is a real page for the four
// leagues and nothing at all for the cup: `leaguescup` has no hub, the
// backend serves no per-match route for it, so the link landed on the
// site's 404 (reported 2026-09-03, clicking a Leagues Cup card on the
// landing page). The cup's card must open the competition page that
// already exists — and a folded cup row, drawn inside a league column,
// is still a cup fixture and must go to the same place.

const wayIn = (row: import("@playwright/test").Locator) =>
  row.getByRole("link", { name: /^open / });

test("a Leagues Cup card opens the competition page, not a hub that does not exist",
  async ({ page }) => {
    await open(page);
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup").getByTestId("picker-row").first();
    await expect(wayIn(cup)).toHaveAttribute(
      "href", "/bet-suggester/comp/leagues-cup");
  });

test("a folded cup card in a league column still opens the cup's page",
  async ({ page }) => {
    await open(page, FOLDED_BOARD);
    const row = col(page, "ligamx").getByTestId("picker-row").first();
    await expect(row).toHaveAttribute("data-league", "leaguescup");
    await expect(wayIn(row)).toHaveAttribute(
      "href", "/bet-suggester/comp/leagues-cup");
  });

test("a folded cup card keeps its OWN settlement note — the league header "
   + "must not claim it for the column", async ({ page }) => {
    // THE CLAUSE THAT KEEPS A HOISTED NOTE HONEST (2026-09-09). Moving a
    // note to the column header is only true when the note is the
    // COLUMN'S. `reg_time_note` belongs to a COMPETITION, and a Leagues
    // Cup tie between two Liga MX clubs is drawn in the LIGA MX column
    // because that table describes it completely — so hoisting it there
    // would print "the price is 90 minutes, not the tie" over cards that
    // settle outright, a false sentence over ten rows to save ink on
    // one. `columnNotes` skips every row whose league is not the
    // column's, and this is that skip: the fact is about THIS FIXTURE,
    // so it stays on THIS FIXTURE's card — the operator's rule read from
    // its other side.
    await open(page, FOLDED_BOARD);
    const mx = col(page, "ligamx");
    await expect(mx.getByTestId("picker-row")).toHaveCount(2);
    await expect(mx.getByTestId("picker-row").first())
      .toHaveAttribute("data-league", "leaguescup");
    // no header affordance — this column has no note of its own to give
    await expect(colHead(page, "ligamx").getByTestId("col-notes-open")).toHaveCount(0);
    // and the note is still on each folded card, in the backend's words
    await expect(mx.getByTestId("reg-time-note")).toHaveCount(2);
    await expect(mx.getByTestId("reg-time-note").first())
      .toContainText(/regulation time only/i);
  });

test("a league card keeps its hub link", async ({ page }) => {
  await open(page);
  for (const slug of ["mls", "epl", "laliga", "ligamx"]) {
    const rows = col(page, slug).getByTestId("picker-row");
    if ((await rows.count()) === 0) continue;
    await expect(wayIn(rows.first())).toHaveAttribute(
      "href", new RegExp(`^/bet-suggester/${slug}/[^/]+$`));
  }
});

// --------------------------------------------- the venue, and the badge

// THE 2026-08-08 LESSON ON A NEW SURFACE. The card printed the
// provider's `home` label as an "H" badge into the Leagues Cup — the one
// competition that stages "home" ties in the opponent's country. On
// 2026-09-02 BOTH semi-finals were Liga MX clubs at US grounds (Toluca v
// León, Houston; América v Monterrey, Carson) and both cards said H.
// Fitted per category, a real home ground is +135 rating points and a
// Liga MX side "home" at a US venue is −150 — a 285-point swing, about
// 78% of the gap between the best and worst club in Liga MX.

const HOUSTON = { name: "Shell Energy Stadium", city: "Houston, Texas",
                  country: "USA" };

const venueBoard = (vc: unknown, favSide: "home" | "away" = "home") => ({
  ...BOARD,
  rows: [{ ...EARLY, fav_side: favSide, venue: HOUSTON, venue_class: vc }],
});

test("a neutral ground SAYS neutral, rather than calling somebody home",
  async ({ page }) => {
    await open(page, venueBoard({ class: "NEUTRAL", home_side: null }));
    const badge = page.getByTestId("home-badge").first();
    await expect(badge).toHaveText("N");
    await expect(badge).toHaveAttribute("data-venue", "NEUTRAL");
    await expect(badge).toHaveAttribute("title", /neither club plays in this country/);
  });

test("a labelled home side in the opponent's country is not shown as home",
  async ({ page }) => {
    // fav IS the labelled home side, but the venue is the away side's
    // country — so the favourite is away, whatever the label says
    await open(page, venueBoard(
      { class: "OPPONENT_COUNTRY", home_side: "away" }, "home"));
    await expect(page.getByTestId("home-badge").first()).toHaveText("A");
  });

test("a domestic fixture still trusts the provider's label", async ({ page }) => {
  await open(page, venueBoard({ class: "DOMESTIC", home_side: "home" }, "home"));
  await expect(page.getByTestId("home-badge").first()).toHaveText("H");
  await open(page, venueBoard({ class: "DOMESTIC", home_side: "home" }, "away"));
  await expect(page.getByTestId("home-badge").first()).toHaveText("A");
});

test("an unknown venue renders NO badge — an absent one is a fact",
  async ({ page }) => {
    await open(page, venueBoard({ class: "UNKNOWN", home_side: null }));
    await expect(page.getByTestId("home-badge")).toHaveCount(0);
  });

test("a row the backend sent no venue_class for renders no badge",
  async ({ page }) => {
    await open(page, venueBoard(null));
    await expect(page.getByTestId("home-badge")).toHaveCount(0);
  });

// ------------------------------------ the form strip names its own scope

// The sweep is per COLUMN, so a Leagues Cup row's WWWW is its CUP run —
// three or four knockout games — and not the club's league form. Source
// has said so since 2026-09-01; the CARD never did. On the semi-final
// night León's WWWW was read as league form, when they sit 7th in the
// Apertura on W3 D1 L2.

const formBoard = (scope: string, isCup: boolean) => ({
  ...BOARD,
  rows: [{ ...EARLY, form: { fav: "WWWWW", opp: "LDLWL",
                             scope, scope_is_cup: isCup } }],
});

test("a cup row's form strip says CUP, and names the competition",
  async ({ page }) => {
    await open(page, formBoard("Leagues Cup", true));
    const strip = page.getByTestId("form-strip").first();
    await expect(strip).toHaveAttribute("data-scope", "Leagues Cup");
    await expect(strip).toHaveAttribute("aria-label", /in Leagues Cup/);
    await expect(page.getByTestId("form-scope").first()).toHaveText("cup");
  });

test("a league row carries NO visible scope mark — it is what a reader assumes",
  async ({ page }) => {
    await open(page, formBoard("Liga MX", false));
    await expect(page.getByTestId("form-strip").first())
      .toHaveAttribute("data-scope", "Liga MX");
    // the competition is still in the accessible name, just not in pixels
    await expect(page.getByTestId("form-strip").first())
      .toHaveAttribute("aria-label", /in Liga MX/);
    await expect(page.getByTestId("form-scope")).toHaveCount(0);
  });

test("the form strip is reachable by a screen reader, not aria-hidden",
  async ({ page }) => {
    // it carried aria-hidden with a mouse-only title, so its whole
    // content was unavailable to anyone not using a pointer
    await open(page, formBoard("Liga MX", false));
    const strip = page.getByTestId("form-strip").first();
    await expect(strip).toHaveAttribute("role", "img");
    await expect(strip).not.toHaveAttribute("aria-hidden", /.*/);
    await expect(strip).toHaveAttribute("aria-label", /oldest to newest: W W W W W/);
  });

// ------------------------- what this season alone says, when it differs

// At six games played w_current = 6/(6+10) = 0.375, so the table the
// board ranks on is 62.5% LAST season. Defensible — ledger row 25, and
// the market sides with it — but it was SILENT. On 2026-09-02 the two
// Leagues Cup semis ordered one way on the blend and the other way on
// this season alone, and nothing on the card said a choice had been made.

const seasonBoard = (gdg: number, currentGdg: number | null) => ({
  ...BOARD,
  rows: [{ ...EARLY, gdg_gap: gdg,
           current_only: currentGdg === null ? null
             : { ppg_gap: null, gdg_gap: currentGdg, rank_gap: null } }],
});

test("the counterfactual is carried on the anchor, with both numbers, and no ink",
  async ({ page }) => {
    /* THE FACT OUTLIVED TWO RENDERINGS. It was a season chip, then a
       warn asterisk on the anchor; the operator called both. What it
       says has not changed, so it is still here — as an attribute, not
       as a mark. These assertions are deliberately in two halves: the
       first says the FACT is present, the second says the INK is not,
       and neither can pass for the other. */
    await open(page, seasonBoard(0.67, 1.17));
    await expect(page.getByTestId("season-weight")).toHaveCount(0);
    const anchor = page.getByTestId("row-anchor").first();
    await expect(anchor).toHaveAttribute("data-season-alt", "+1.17");
    await expect(anchor).toHaveAttribute("data-season-blend", "+0.67");
    await expect(anchor).toHaveAttribute("title", /ON THIS SEASON ALONE/);
    await expect(anchor).toHaveAttribute("title", /\+1\.17/);
    await expect(anchor).toHaveAttribute("title", /\+0\.67/);
    // THE INK IS GONE. Not "the testid is gone" — the character. A row
    // that regrows an asterisk under any other markup fails here.
    await expect(page.getByTestId("season-alt")).toHaveCount(0);
    await expect(anchor).toHaveText(/^\s*\+0\.67\s*$/);
  });

test("a close agreement carries NO attribute — absent, not asserted as agreeing",
  async ({ page }) => {
    // 0.10 apart, under the 0.25 display threshold
    await open(page, seasonBoard(1.30, 1.40));
    const anchor = page.getByTestId("row-anchor").first();
    /* The ABSENCE is the claim, and it is read as an absence: null, not
       an empty string and not a zero. A row that starts emitting
       data-season-alt="" here would fail, which is the point — an empty
       attribute would read to a guard as "measured, and agreeing". */
    expect(await anchor.getAttribute("data-season-alt")).toBeNull();
    await expect(page.getByTestId("season-alt")).toHaveCount(0);
  });

test("a SIGN flip is always carried, however small", async ({ page }) => {
  // 0.10 apart, but the two cuts disagree about who is better at all
  await open(page, seasonBoard(0.05, -0.05));
  const anchor = page.getByTestId("row-anchor").first();
  // dec() renders a TYPOGRAPHIC minus (U+2212), not a hyphen. Asserted
  // as the code writes it — the point of the ESPN lesson.
  await expect(anchor).toHaveAttribute("data-season-alt", "−0.05");
});

test("a row with no counterfactual carries nothing, not an agreement",
  async ({ page }) => {
    await open(page, seasonBoard(0.67, null));
    const anchor = page.getByTestId("row-anchor").first();
    expect(await anchor.getAttribute("data-season-alt")).toBeNull();
    await expect(page.getByTestId("season-alt")).toHaveCount(0);
  });

// ------------------------------------- the league's own season basis ----
//
// 2026-09-07, operator: "where is the % this szn for each league's
// label?" — the chip was removed from every row on the grounds that the
// basis is a LEAGUE fact said once, and then nothing said it. These
// tests are that sentence.

const MLS_ROW = {
  ...EARLY, league: "mls", rated_in: { home: "mls", away: "mls" },
  espn: "usa.1", event_id: "mls-span", competition_id: "mls-span",
};

/** A board whose MLS column holds exactly these club-weight pairs, and
 *  nothing else — so the span the header prints is arithmetic on numbers
 *  written here rather than on whatever the shared fixture happens to
 *  carry. */
const spanBoard = (ws: ([number, number] | null)[]) => ({
  ...BOARD,
  rows: ws.map((w, i) => ({
    ...MLS_ROW, event_id: `span-${i}`, competition_id: `span-${i}`,
    kickoff: inHours(3 + i),
    weights: w === null ? null : weights(w[0], w[1]),
  })),
});

const headOf = (page: import("@playwright/test").Page, league: string) =>
  colHead(page, league).getByTestId("col-season");

test("the league header says the season basis as a span over its clubs",
  async ({ page }) => {
    // 68.4% .. 72.1% -> 68–72%
    await open(page, spanBoard([[0.684, 0.700], [0.712, 0.721]]));
    const chip = headOf(page, "mls");
    await expect(chip).toHaveAttribute("data-season-lo", "68");
    await expect(chip).toHaveAttribute("data-season-hi", "72");
    await expect(chip).toHaveAttribute("data-season-clubs", "4");
    await expect(chip).toHaveText(/68\u201372% this szn · min 22 GP/);
  });

test("a span whose ends round together collapses to one number",
  async ({ page }) => {
    /* NO TOLERANCE CONSTANT. These differ by 0.5pp and print as one
       number for exactly one reason: they round to the same whole
       percent, which is the precision the chip is written in. A span can
       never claim a spread finer than its own ink. */
    await open(page, spanBoard([[0.701, 0.703], [0.699, 0.704]]));
    const chip = headOf(page, "mls");
    await expect(chip).toHaveText(/70% this szn/);
    await expect(chip).not.toHaveText(/\u2013/);
  });

test("a prior-rated league says the percentage too — it is WHY it is prior",
  async ({ page }) => {
    /* The operator asked for the basis on EVERY league label. A prior
       column is the one where the number explains the most: "12–18% this
       szn" is the reason the table is last season's. */
    await open(page);
    const chip = headOf(page, "ligamx");
    await expect(chip).toHaveText(/prior szn · 3[0-9]% this szn/);
  });

test("a cup column states no percentage — it would average across leagues",
  async ({ page }) => {
    /* A cup's clubs are rated on their DOMESTIC tables, so one percentage
       over that column is a mean across several leagues, belonging to no
       table. seasonSpan refuses it by KIND, not by a missing value. */
    await open(page);
    await show(page, "leaguescup");
    const chip = headOf(page, "leaguescup");
    await expect(chip).toHaveText(/prior szn/);
    await expect(chip).not.toHaveText(/%/);
    expect(await chip.getAttribute("data-season-lo")).toBeNull();
  });

test("a column with no weights says nothing, and never 0%", async ({ page }) => {
  await open(page, spanBoard([null]));
  const chip = headOf(page, "mls");
  // MISSING IS NEVER ZERO: the chip still states the basis and the GP
  // floor, and simply carries no percentage it cannot compute.
  await expect(chip).toHaveText(/this szn · min 22 GP/);
  await expect(chip).not.toHaveText(/%/);
  expect(await chip.getAttribute("data-season-lo")).toBeNull();
});

/* FOUR COLUMNS, DELIBERATELY. The shared fixture carries five leagues
   into a grid declared `xl:grid-cols-4`, which collapses the four fixed
   tracks to 0px — a real defect, filed separately, and not one this test
   is about. Geometry is asserted on a board the grid can actually lay
   out. */
const FOUR = (() => {
  const { leaguescup: _cup, ...rest } = LEAGUES;
  void _cup;
  return { ...BOARD, leagues: rest,
           rows: [EARLY, MLS_ROW].map((r, i) => ({ ...r, kickoff: inHours(3 + i) })) };
})();

test("the league header follows the column when the rows scroll under it",
  async ({ page }) => {
    /* MEASURED AGAINST THE ALTERNATIVE, not against a hopeful bound. The
       same page with `sticky` removed puts this header at y = −382 after
       the same scroll; with it, y = 0. An earlier version of this test
       asserted `y >= -1` after a fixed wheel delta and passed WITHOUT
       stickiness, because that delta happened to land the travelling
       header near the top — a guard that cannot fail is not a guard. */
    await page.setViewportSize({ width: 1440, height: 520 });
    await open(page, FOUR);
    const head = colHead(page, "mls");
    const mlsCol = col(page, "mls");
    await expect(head).toBeVisible();
    await page.waitForTimeout(1200);            // let the live section settle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const after = await head.boundingBox();
    const colBox = await mlsCol.boundingBox();
    expect(after).not.toBeNull(); expect(colBox).not.toBeNull();
    // the column really did travel out of the top of the viewport
    expect(colBox!.y).toBeLessThan(-100);
    // and its header did not go with it — it is pinned just under the
    // top bar, whose height it reads rather than a number typed here
    const barH = await page.evaluate(() => {
      const b = document.querySelector(".topbar");
      return b ? b.getBoundingClientRect().height : 0;
    });
    expect(barH).toBeGreaterThan(0);
    expect(after!.y).toBeGreaterThanOrEqual(barH - 1);
    expect(after!.y).toBeLessThanOrEqual(barH + 1);
    // still on screen, which is the whole point
    expect(colBox!.y + colBox!.height).toBeGreaterThan(after!.y);
  });

test("every league column gets a real track, whatever the payload names",
  async ({ page }) => {
    /* THE BOARD IS NOT FOUR LEAGUES. It is four fixed ones plus whatever
       the payload names — this fixture's fifth column is the Leagues Cup,
       and the operator's board carries it. A count typed as 4 put that
       fifth column on an implicit track, which took the whole width and
       left the four 1fr tracks with none: measured
       `0px 0px 0px 0px 1304px`, four columns of zero width, rows
       overflowing, and `1 / -1` no longer covering the board because -1
       is the end of the EXPLICIT grid.

       556 tests passed over that for as long as none of them asserted
       geometry. This one does, and it is the whole reason it exists. */
    /* AND THE SAME DEFECT HAS A SECOND ROUTE NOW (2026-09-15): the board
       draws FOUR of its five columns and pages through them, so the
       track count is `drawnSlugs.length` rather than the declaration's.
       A window that widened the grid to five tracks and drew four, or
       narrowed it to four and drew five, is the identical collapse. So
       this walks the WHOLE declaration a window at a time and measures
       every column in every position it can be drawn in. */
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const cols = page.locator('[data-testid="league-col"]');
    /* A LAYOUT READ MUST WAIT FOR THE LAYOUT. `evaluateAll` does not
       auto-wait and a window step re-fills four tracks, so a single read
       can faithfully describe the frame BETWEEN two layouts — which is
       how a sibling spec once reported "3 tracks at 1440px" on a board
       that lays 6, passed alone, and failed only under the full suite.
       Settled means TWO CONSECUTIVE READS AGREE, which holds for any
       cause of reflow rather than for one guessed delay. */
    const readTracks = () => cols.evaluateAll((els) => els.map((e) => ({
      lg: e.getAttribute("data-league"),
      w: Math.round(e.getBoundingClientRect().width),
    })));
    const settled = async () => {
      let prev = await readTracks();
      for (let i = 0; i < 25; i++) {
        const next = await readTracks();
        if (JSON.stringify(next) === JSON.stringify(prev)) return next;
        prev = next;
      }
      throw new Error("the board never stopped moving — 25 consecutive "
        + "reads disagreed, so no measurement here describes a real layout");
    };
    for (const jump of COLUMNS) {
      await show(page, jump);
      /* RESTATED 2026-09-15: the window pages by SCROLLING a track that
         carries every declared column, so the track count is the
         declaration's and the collapse this guard exists for — a typed
         count laying one number of tracks while the board draws another
         — is measured over all of them at once. Every position of the
         window is still walked, because a column's width must hold
         wherever the scroll rests. */
      await expect(cols).toHaveCount(COLUMNS.length);
      const tracks = await settled();
      const say = `with ${jump} on screen: `
        + tracks.map((t) => `${t.lg}=${t.w}`).join(" ");
      expect(tracks.length, say).toBe(COLUMNS.length);
      for (const t of tracks) {
        expect(t.w, `${t.lg} collapsed — ${say}`).toBeGreaterThan(150);
      }
      // every track the same size — no column is quietly the odd one out
      expect(new Set(tracks.map((t) => t.w)).size, say).toBe(1);
      // and the full-width band really does span the whole board
      const band = await page.getByTestId("day-band").first().boundingBox();
      const wrap = await cols.first().evaluate((el) =>
        el.parentElement!.getBoundingClientRect().width);
      expect(band!.width).toBeGreaterThan(wrap - 2);
    }
  });

/* A board with rows in EVERY column, so every league header carries a
   full-length basis chip. The shared BOARD leaves epl/laliga empty,
   which makes their chips short — and a short chip is exactly the case
   that does NOT reproduce the operator's 2026-09-07 report, where
   PREMIER LEAGUE pushed its fixture count onto a second row while MLS
   beside it did not. */
const FULL = (() => {
  // The operator's own board, 2026-09-07: MLS 29 fixtures on
  // `69–71% THIS SZN · MIN 22 GP`, PREMIER LEAGUE 6 on
  // `PRIOR SZN · 23% THIS SZN`, LA LIGA 6 on `29–33%`, LIGA MX 8 on
  // `38–41%`. Both halves matter — the chip's LENGTH and the count's —
  // because what wrapped was the count, and it wrapped on the columns
  // whose league NAME was long. A fixture with one row per league says
  // "1 fixture" and never reproduces it.
  const mk = (league: string, espn: string, n: number,
              w: [number, number]) =>
    Array.from({ length: n }, (_, i) => ({
      ...(league === "mls" ? MLS_ROW : EARLY),
      league, rated_in: { home: league, away: league }, espn,
      event_id: `${league}-${i}`, competition_id: `${league}-${i}`,
      kickoff: inHours(3 + (i % 6)), weights: weights(w[0], w[1]),
    }));
  return { ...BOARD, rows: [
    ...mk("mls", "usa.1", 29, [0.69, 0.71]),
    ...mk("epl", "eng.1", 6, [0.23, 0.23]),
    ...mk("laliga", "esp.1", 6, [0.29, 0.33]),
    ...mk("ligamx", "mex.1", 8, [0.38, 0.41]),
  ] };
})();

test("the board lays out with content in it, at every width",
  async ({ page }) => {
    /* THE SAME GEOMETRY SWEEP AS e2e/layout-audit.spec.ts, but on a board
       that HAS rows — which is where all three of the week's layout
       defects actually lived. The unmocked route renders chrome and a
       near-empty board, so it could never have caught a column collapse
       driven by the number of leagues in the payload. */
    /* BOTH BOARDS DECLARE FIVE COLUMNS AND DRAW FOUR (2026-09-15); what
       separates them is the CONTENT — `BOARD` leaves two columns empty,
       `FULL` fills every one of them with the operator's own counts and
       chip lengths, which is the case his 2026-09-07 report needed. */
    const findings: string[] = [];
    for (const [name, body] of [["sparse", BOARD], ["full", FULL]] as const)
    for (const w of [390, 768, 1100, 1440, 1600, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await open(page, body);
      await page.waitForTimeout(400);
      void name;
      const r = await page.evaluate((vw) => {
        const out: string[] = [];
        if (document.documentElement.scrollWidth > vw + 1) {
          out.push(`H-OVERFLOW ${document.documentElement.scrollWidth} > ${vw}`);
        }
        const bar = document.querySelector(".topbar") as HTMLElement | null;
        const barH = bar ? bar.getBoundingClientRect().height : 0;
        document.querySelectorAll('[data-testid="league-col"]').forEach((c) => {
          const el = c as HTMLElement;
          const lg = el.getAttribute("data-league");
          const box = el.getBoundingClientRect();
          if (box.width < 120) out.push(`COLUMN-COLLAPSED ${lg} w=${Math.round(box.width)}`);
          /* RESTATED 2026-09-15: a column's header is drawn in the
             page's sticky rail on a board whose track scrolls, so it is
             found by the league it names rather than inside the section.
             And what PARKS is the rail on such a board and the header
             itself on every other — either way the claim is the one this
             always made: the thing that stops does not stop underneath
             the bar that is already there. */
          const head = document.querySelector(
            `[data-testid="col-head"][data-league="${lg}"]`) as HTMLElement;
          const parks = (head.closest('[data-testid="board-head-rail"]')
            ?? head) as HTMLElement;
          const top = parseFloat(getComputedStyle(parks).top);
          if (!Number.isNaN(top) && top < barH - 0.5) {
            out.push(`HEAD-UNDER-BAR ${lg} top=${top} bar=${Math.round(barH)}`);
          }
          /* THE HEADER IS THREE CENTRED LINES SINCE 2026-09-15 — name,
             then count, then chips — so the old check (name and count
             share one row) is now the failure, not the invariant. The
             REASON it was checked is unchanged: adjacent columns of one
             board must have the SAME header shape whatever they are
             called, which is what the operator's wrapped `6 FIXTURES`
             broke. Stacking settles that by construction, and what has
             to be asserted is that the stack is real and level:
               - the count sits BELOW the name, never beside or above it;
               - both are centred on the column's own axis, so a long
                 name and a short one produce the same shape. */
          const name = head.querySelector("h3") as HTMLElement;
          const cnt = head.querySelector(
            '[data-testid="col-count"]') as HTMLElement;
          if (name && cnt) {
            const nb = name.getBoundingClientRect(), cb = cnt.getBoundingClientRect();
            if (cb.top < nb.bottom - 0.5) {
              out.push(`HEAD-NOT-STACKED ${lg} name@${Math.round(nb.bottom)} count@${Math.round(cb.top)}`);
            }
            const axis = (r: DOMRect) => (r.left + r.right) / 2;
            if (Math.abs(axis(nb) - axis(cb)) > 1.5) {
              out.push(`HEAD-OFF-AXIS ${lg} name@${Math.round(axis(nb))} count@${Math.round(axis(cb))}`);
            }
          }
          // a row card must not spill out of its own column
          el.querySelectorAll("article").forEach((a) => {
            const ab = (a as HTMLElement).getBoundingClientRect();
            if (ab.width > box.width + 2) {
              out.push(`ROW-OVERFLOWS-COLUMN ${lg} row=${Math.round(ab.width)} col=${Math.round(box.width)}`);
            }
          });
        });
        return out;
      }, w);
      [...new Set(r)].forEach((f) => findings.push(`[${name}] @${w} ${f}`));
    }
    expect(findings, "board layout findings:\n" + findings.join("\n"))
      .toEqual([]);
  });

test("a long league name truncates — it never squeezes or displaces the "
   + "fixture count", async ({ page }) => {
    /* THE INVARIANT UNDER STRESS, because the operator's own case would
       not reproduce here. On his board PREMIER LEAGUE pushed `6 FIXTURES`
       onto a second row while MLS beside it did not; mirrored fixture,
       same widths, same chip strings, and it stays on one row in
       Chromium — almost certainly because Archivo does not load in this
       runner, so every name measures narrower than it does on his screen.
       A geometry assertion I cannot make fail is not evidence, so this
       asserts the same invariant with a name long enough that ANY font
       reaches the edge.

       WHAT THE INVARIANT IS NOW (2026-09-15). The header became three
       centred lines — name, count, chips — which settles the wrap
       question the single-row header kept losing: the count has a line
       of its own, so no name can push it anywhere, and the name gets the
       WHOLE track before it has to truncate. So the claim is no longer
       "they stay on one row"; it is that the name is the thing that
       gives way, alone, and the count comes out whole and on the axis.

       `leagueLabel` falls through to the raw slug for an unknown league,
       which is how a name this long gets onto a real header — and is
       also what a newly added competition looks like before anyone adds
       its label. */
    const LONG = "a-competition-with-an-extremely-long-name-nobody-shortened";
    const declared = [...COLUMNS, LONG];
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, {
      ...BOARD,
      leagues: { ...LEAGUES, [LONG]: {
        src: "current", min_current_gp: 22, clubs: 30, kind: "league",
        blend_k: 10, blend_constant_w: null } },
      rows: [{ ...MLS_ROW, league: LONG, column: LONG,
               rated_in: { home: LONG, away: LONG },
               event_id: "long-1", competition_id: "long-1" }],
    });
    // six declared, four drawn — bring the sixth on screen to measure it
    await show(page, LONG, declared);
    const col = page.locator(`[data-testid="league-col"][data-league="${LONG}"]`);
    await expect(col).toHaveCount(1);
    // the column exists before the board has finished laying out; read
    // boxes only once it has settled, or this measures a mid-render frame
    await expect(colHead(page, LONG).getByTestId("col-count")).toBeVisible();
    await page.waitForTimeout(400);
    /* THE NAME AND THE COUNT ARE THE HEADER's, and the header is drawn
       in the board's sticky rail on a board this wide — the column on
       the track is its rows. Both are still one column wide, which is
       the whole claim here. */
    const name = colHead(page, LONG).locator("h3");
    const count = colHead(page, LONG).getByTestId("col-count");
    const nb = (await name.boundingBox())!;
    const cb = (await count.boundingBox())!;
    expect(nb).not.toBeNull(); expect(cb).not.toBeNull();
    /* Playwright's boundingBox is {x,y,width,height} — there is no
       `top`/`bottom` on it, and reading them yields NaN, which compares
       false against every bound and reads exactly like a real failure.
       Derived here instead. */
    // STACKED, in that order: the count's own line is under the name's
    expect(cb.y, `name@${nb.y}+${nb.height} count@${cb.y}`)
      .toBeGreaterThanOrEqual(nb.y + nb.height - 0.5);
    // and on the same axis, so the header is one shape and not two
    expect((cb.x + cb.width / 2) - (nb.x + nb.width / 2)).toBeLessThan(1.5);
    // the count is whole, not squeezed
    expect(cb.width).toBeGreaterThan(40);
    expect(await count.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
      .toBe(true);
    // and the NAME is what gave way — over the whole track, not a share
    expect(await name.evaluate((el) => el.scrollWidth > el.clientWidth + 1))
      .toBe(true);
    const headBox = (await colHead(page, LONG).boundingBox())!;
    expect(nb.width).toBeGreaterThan(headBox.width - 40);
  });

test("the sticky header is opaque — rows never show through it",
  async ({ page }) => {
    /* A translucent sticky header is the same defect as a label that
       contradicts the numbers beside it: the reader sees two things at
       once and believes the wrong one. */
    await open(page, FOUR);
    const bg = await colHead(page, "mls")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toMatch(/rgba\([^)]*,\s*0?\.\d+\)$/);
  });

// ------------------------------------------------ the hollow read -----
//
// 2026-09-03. The popover's HOLLOW sentence opened "high on the table
// gap, but …" and the board underneath it said the reverse. HOLLOW is
// `atk <= 0 AND def <= 0` in the backend (src/picker/stages.py,
// shape()) and carries NO table-gap condition at all; measured over
// 3,216 rated fixtures it has the LOWEST median |GD/g| of the three
// shapes — CLEAN 1.02 (53.4% of rows clear a 1.0 gap), SPLIT 0.36
// (7.0%), HOLLOW 0.18 (1.1%). These two tests hold the sentence to what
// the shape IS and hold the table claim out, in both directions: the
// wording is asserted, and so is the absence of the old one.

// Every sign pattern the backend's rule admits: attack and defence each
// level-or-behind, crossed with all three overall signs. DERIVED from
// the rule rather than hand-picked — a guard that says "every hollow
// row" and then checks one is exactly how the omitted case drifts.
const HOLLOW_GAPS = ([-1, 0] as const).flatMap((atk) =>
  ([-1, 0] as const).flatMap((def) =>
    ([1, 0, -1] as const).map((ovr) => ({ ovr, atk, def }))));

// Tier pairs are [favourite, opponent] and the gap is opp − fav, so a
// favourite pinned at T3 keeps every opponent tier inside 1..5.
const hollowRow = (g: { ovr: number; atk: number; def: number }, i: number) =>
  cupRow({
    home: `Hollow ${i} FC`, away: `Opp ${i} CD`,
    favourite: `Hollow ${i} FC`, opponent: `Opp ${i} CD`,
    // the row's OWN Stage-1 gap is small — that is the measured norm
    // for this shape, and the reason the old clause was false
    ppg_gap: 0.08, gdg_gap: 0.18, rank_gap: 2,
    cross_league: false, rated_in: { home: "ligamx", away: "ligamx" },
    gap_note: null, ranks: { fav: 6, opp: 8 },
    tiers: { ovr: [3, 3 + g.ovr], atk: [3, 3 + g.atk], def: [3, 3 + g.def] },
    tier_gaps: g, shape: "HOLLOW",
    event_id: `lc-hollow-${i}`, competition_id: `lc-hollow-${i}`,
    kickoff: inHours(20 + i),
  });

test("the hollow read names both units and claims nothing about the table gap",
  async ({ page }) => {
    // the case the old wording was most tempting on: the favourite IS a
    // better tier overall, and neither unit backs it anyway
    await open(page, {
      ...BOARD, rows: [hollowRow({ ovr: 1, atk: -1, def: 0 }, 0)],
    });
    await show(page, "leaguescup");
    const hollow = col(page, "leaguescup").getByTestId("picker-row");
    await expect(hollow).toHaveCount(1);
    await expect(hollow).toHaveAttribute("data-shape", "HOLLOW");
    await hollow.getByTestId("tier-read").click();
    // the sentence is the popover's first paragraph; the per-dimension
    // lines under it are the detail, not the read
    const sentence = hollow.getByTestId("shape-read").locator("p").first();
    await expect(sentence).toHaveText(
      "Hollow — neither unit backs the pick: behind in attack (T3 v T2)"
      + " and level in defence (T3 v T3).");
    // …and not a word about the table, which this shape does not know
    await expect(sentence).not.toContainText(/table/i);
    await expect(sentence).not.toContainText(/high/i);
    // the detail block still carries the overall tier the sentence no
    // longer editorialises about
    await expect(hollow.getByTestId("shape-read")).toContainText("T3 v T4 +1");
  });

test("every hollow sign pattern says both units failed, and none claims a high table gap",
  async ({ page }) => {
    const rows = HOLLOW_GAPS.map(hollowRow);
    expect(rows.length).toBe(12);          // 2 attack × 2 defence × 3 overall
    await open(page, { ...BOARD, rows });
    await show(page, "leaguescup");
    const cards = col(page, "leaguescup").getByTestId("picker-row");
    await expect(cards).toHaveCount(rows.length);
    // order is the board's business — every assertion below holds for
    // any hollow row, so this checks the whole set and not a lucky one
    for (let i = 0; i < rows.length; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("data-shape", "HOLLOW");
      await card.getByTestId("tier-read").click();
      const sentence = card.getByTestId("shape-read").locator("p").first();
      await expect(sentence)
        .toContainText("Hollow — neither unit backs the pick:");
      // both units named, with where they stand, whatever overall does
      await expect(sentence).toContainText(/in attack \(T3 v T[234]\)/);
      await expect(sentence).toContainText(/in defence \(T3 v T[234]\)/);
      await expect(sentence).not.toContainText(/table/i);
      await expect(sentence).not.toContainText(/high/i);
      await card.getByTestId("tier-read").click();   // closed again
      await expect(card.getByTestId("shape-read")).toHaveCount(0);
    }
  });

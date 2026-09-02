import { expect, test } from "@playwright/test";

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

const orderOf = (c: ReturnType<typeof col>) =>
  c.getByTestId("picker-row")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));

// ------------------------------------------------- the fifth column ----

test("the Leagues Cup gets its own column, after the four leagues",
  async ({ page }) => {
    await open(page);
    const cols = page.getByTestId("league-col");
    await expect(cols).toHaveCount(5);
    expect(await cols.evaluateAll(
      (els) => els.map((e) => e.getAttribute("data-league"))))
      .toEqual(["mls", "epl", "laliga", "ligamx", "leaguescup"]);
    const cup = col(page, "leaguescup");
    await expect(cup.getByRole("heading", { name: "Leagues Cup" }))
      .toBeVisible();
    // and it says what it is: a tournament with no table of its own,
    // whose clubs were rated on the leagues named here
    await expect(cup.getByTestId("col-cup"))
      .toHaveText(/cup · rated on MLS \+ Liga MX/);
    await expect(cup.getByTestId("col-count")).toHaveText("3 fixtures");
  });

test("every cup row served is drawn, and Wednesday's two semis carry the full card",
  async ({ page }) => {
    await open(page);
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
    const cross = col(page, "leaguescup").getByTestId("picker-row")
      .filter({ hasText: "Tigres UANL" });
    await expect(cross).toHaveAttribute("data-cross-league", "true");
    // the three Stage-1 numbers read n/a — NOT "0.00", which is a
    // measured level and a completely different finding
    // 2026-09-01 card: the active sort metric renders as the right-hand
    // ANCHOR (value over label), the rest on the data line — the
    // withheld gaps must read n/a in BOTH places, which is the same
    // assertion this test always made, against the new layout.
    await expect(cross.getByTestId("row-anchor")).toHaveText("n/a");
    await expect(cross).toContainText(/GD\/g gap/);
    await expect(cross).toContainText(/ppg\s*n\/a/);
    await expect(cross).toContainText(/rank\s*n\/a/);
    await expect(cross).not.toContainText("+0.00");
    // …and the card says why, in the backend's own words
    await expect(cross.getByTestId("gap-note"))
      .toContainText("2.0 ppg in MLS is not 2.0 ppg in Liga MX");
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
  });

test("a league row never claims a cross-league caveat it does not have",
  async ({ page }) => {
    await open(page);
    for (const slug of ["mls", "epl", "ligamx"]) {
      const c = col(page, slug);
      await expect(c.getByTestId("gap-note")).toHaveCount(0);
      await expect(c.getByTestId("rated-in")).toHaveCount(0);
      await expect(c.getByTestId("reg-time-note")).toHaveCount(0);
    }
  });

// ------------------------------------------ the regulation-time note ---

test("every Leagues Cup card says the market settles on regulation time",
  async ({ page }) => {
    await open(page);
    const cup = col(page, "leaguescup");
    const notes = cup.getByTestId("reg-time-note");
    await expect(notes).toHaveCount(3);          // every card, not one
    for (let i = 0; i < 3; i++) {
      await expect(notes.nth(i)).toContainText(/regulation time only/i);
      await expect(notes.nth(i)).toContainText(/90 minutes/i);
      await expect(notes.nth(i)).toContainText(/penalties/i);
    }
    // and it sits with the price, because it is a fact about the price
    const toluca = cup.getByTestId("picker-row").filter({ hasText: "Toluca" });
    await expect(toluca).toContainText("ask 54¢");
    await expect(toluca.getByTestId("reg-time-note")).toBeVisible();
  });

// ----------------------------------------------------- the weights ----

test("the season share is a number on the row, not a binary badge",
  async ({ page }) => {
    await open(page);
    const early = col(page, "ligamx").getByTestId("picker-row").first();
    const chip = early.getByTestId("season-weight");
    await expect(chip).toHaveText("38% this szn");
    // below half: last season still carries the rating, and the chip
    // says so by its tone as well as its number
    await expect(chip).toHaveAttribute("data-w", "0.375");
    await expect(chip).toHaveClass(/text-warn/);
    // both sides are on the chip's title, because the fixture's number
    // is the LOWER of the two
    await expect(chip).toHaveAttribute(
      "title", /home 38% · away 38%.*GP\/\(GP\+10\)/);
    // the pre-blend badge is gone wherever a weight exists — one claim,
    // not two
    await expect(early.getByText("prior szn")).toHaveCount(0);
  });

test("a late-season fixture reads as this season's, and a promoted side as its own basis",
  async ({ page }) => {
    await open(page);
    const late = col(page, "mls").getByTestId("picker-row").first();
    const chip = late.getByTestId("season-weight");
    await expect(chip).toHaveText("68% this szn");   // the LOWER side
    await expect(chip).toHaveClass(/text-accent/);
    // a club with no last-season row at all is rated on this season
    // alone at 100% — a different basis, said out loud on the chip
    const solo = col(page, "epl").getByTestId("picker-row").first();
    await expect(solo.getByTestId("season-weight")).toHaveText("55% this szn");
    await expect(solo.getByTestId("season-weight")).toHaveAttribute(
      "title", /no prior-season row is rated on this season alone/);
  });

test("the banner explains the blend rather than a threshold", async ({ page }) => {
  await open(page);
  const banner = page.getByTestId("prior-banner");
  await expect(banner).toBeVisible();
  // the cup column is NOT counted as a league rated on last season — it
  // has no season table of its own to be rated on
  await expect(banner).toContainText("3 of 4 leagues");
  await expect(banner).toContainText("Liga MX 6 GP");
  await expect(banner).toContainText(/weighted average of both seasons/i);
  await expect(banner).toContainText("GP / (GP + 10)");
  await expect(banner).not.toContainText(/Under 8/i);
});

// ------------------------------- a withheld gap is not a small gap -----

test("the withheld gap sorts last under every Stage-1 key, in both directions",
  async ({ page }) => {
    await open(page);
    const cup = col(page, "leaguescup");
    // the default order is KICKOFF ascending now (2026-09-02): cross at
    // +28h, toluca +30h, america +32h. The withheld gap is not what
    // orders this first assertion — every row has a kickoff — so the
    // null-last policy below is tested purely by the Stage-1 keys.
    await expect.poll(() => orderOf(cup))
      .toEqual(["lc-cross", "lc-toluca", "lc-america"]);
    for (const mode of ["gdg", "ppg", "rank"]) {
      await page.getByTestId("col-sort").selectOption(mode);
      // the policy is ON SCREEN while such a key is active
      await expect(page.getByTestId("col-null-note"))
        .toHaveText("no measured gap (cross-league) sorts last");
      await expect.poll(() => orderOf(cup))
        .toEqual(["lc-toluca", "lc-america", "lc-cross"]);
      await page.getByTestId("col-dir").click();
      // the measured rows reverse; the withheld one does NOT become the
      // smallest — this is the ascending case where `Math.abs(null)`
      // would have put it first
      await expect.poll(() => orderOf(cup))
        .toEqual(["lc-america", "lc-toluca", "lc-cross"]);
      await page.getByTestId("col-dir").click();
    }
  });

test("the cross-league note is not printed over a column that has no such row",
  async ({ page }) => {
    await open(page);
    const mls = col(page, "mls");
    // WAIT FOR THE COLUMN FIRST. A "count 0" assertion fired before the
    // board has painted passes on an element that has not rendered YET,
    // not on one that is deliberately absent — a mutation that printed
    // this note over every column slipped through exactly that hole.
    await expect(mls.getByTestId("picker-row")).toHaveCount(1);
    // the board opens on KICKOFF now (2026-09-02), which has no null
    // policy to state — every row has a kickoff — so the note is
    // correctly ABSENT until a Stage-1 key is chosen. Assert that first,
    // then switch to the key whose policy this test is actually about.
    await expect(page.getByTestId("col-sort")).toHaveValue("kickoff");
    await expect(page.getByTestId("col-null-note")).toHaveCount(0);
    await page.getByTestId("col-sort").selectOption("gdg");
    // the note is the BOARD's since sorting moved to the matchday
    // (2026-09-01): it renders ONCE beside the board control — because a
    // withheld-gap row exists somewhere on the board — and never inside
    // a league column
    await expect(page.getByTestId("col-null-note")).toBeVisible();
    await expect(page.getByTestId("col-null-note")).toHaveCount(1);
    for (const slug of ["mls", "epl", "laliga", "ligamx", "leaguescup"]) {
      await expect(col(page, slug).getByTestId("col-null-note"))
        .toHaveCount(0);
    }
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
    const cup = col(page, "leaguescup");
    await page.getByTestId("col-sort").selectOption("kickoff");
    await expect.poll(() => orderOf(cup)).toEqual(["lc-level", "lc-cross"]);
  });

test("no sort mode drops a cup row — ranks, never cuts", async ({ page }) => {
  await open(page);
  const cup = col(page, "leaguescup");
  await expect(cup.getByTestId("picker-row")).toHaveCount(3);
  const modes = await page.getByTestId("col-sort").locator("option")
    .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
  expect(modes.length).toBe(11);   // +shape, 2026-09-01
  for (const m of modes) {
    await page.getByTestId("col-sort").selectOption(m);
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    await page.getByTestId("col-dir").click();
    await expect(cup.getByTestId("picker-row")).toHaveCount(3);
    await page.getByTestId("col-dir").click();
  }
  await expect(page.getByTestId("picker-row")).toHaveCount(6);
});

// ------------------------------------------------------- the legend ---

test("the legend defines the share, the withheld gap and regulation time",
  async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: /how to read a row/i }).click();
    await expect(page.getByText("38% this szn", { exact: true }).first())
      .toBeVisible();
    await expect(page.getByText(/GP \/ \(GP \+ 10\)/).first()).toBeVisible();
    await expect(page.getByText(/mean of two league positions is not a position/i))
      .toBeVisible();
    await expect(page.getByText(/n\/a · cross-league/)).toBeVisible();
    await expect(page.getByText(/regulation time/i).first()).toBeVisible();
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
  // the chosen sort still ranks WITHIN each day — switching it must
  // never move a fixture across its matchday
  await page.getByTestId("col-sort").selectOption("ask");
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
  // the cup column: three rows, mixed shapes — and toHaveCount FIRST,
  // because a bare count() races the board's initial paint
  const cup = col(page, "leaguescup");
  const rows = cup.getByTestId("picker-row");
  await expect(rows).toHaveCount(3);
  await page.getByTestId("col-sort").selectOption("shape");
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
  await page.getByTestId("col-dir").click();
  await expect(rows).toHaveCount(3);
  const flipped = await rows.evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-shape")));
  for (let i = 1; i < flipped.length; i++) {
    expect(rankOf(flipped[i - 1])).toBeLessThanOrEqual(rankOf(flipped[i]));
  }
});

// -------------------------------------------- per-day sort overrides ---

test("a band override re-sorts ONE day; the board default clears it", async ({ page }) => {
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
  // changing the BOARD default clears every override — the board never
  // mixes a stale one-night intention into a fresh read
  await page.getByTestId("col-sort").selectOption("gdg");
  await expect(page.getByTestId("band-sort").nth(1)).toHaveValue("gdg");
  await expect(rows.nth(1)).toHaveAttribute("data-event", "mx-day2");
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

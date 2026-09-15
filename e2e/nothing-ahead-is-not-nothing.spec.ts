import { expect, test } from "@playwright/test";

/* THE WINDOW THE PAGE ASKS FOR, from the page's own constant. Both
   windows opened at 8 days on 2026-09-15 and the chips that used to set
   them are gone, so a number typed here would pin the default of the day
   it was typed. Note the column draws THIS number rather than the review
   payload's `back` — the page states the window it ASKED for. */
import { DEFAULT_BACK } from "../src/lib/pickerReview";

// A COLUMN WITH NOTHING AHEAD OF IT IS NOT AN EMPTY COLUMN.
//
// THE OPERATOR'S BOARD, 2026-09-08. "LEAGUES CUP · 0 FIXTURES", no chips
// beside it, and four finished ties sitting under it. Every part of that
// came from the board and the review being two payloads on two requests:
// the board served no Leagues Cup row that week, while the review still
// carried its finished matches — and a competition with finished matches
// and nothing upcoming must not lose the column the operator came back
// to.
//
// Only the PRESENTATION was wrong, and it was wrong in the way this tree
// cares most about: MISSING IS NEVER ZERO. "0 fixtures" as the only
// thing a column says, over four matches, invites the one reading that
// is false.
//
// WHAT THE FIX GOT WRONG, AND WHAT 2026-09-09 CHANGED. The column was
// kept alive by building the column SET out of the review payload as
// well as the board's — so a competition the operator had taken OFF his
// board reappeared on it, drawn from its own finished matches. He said
// so: "remove UCL from the landing page". The set is now the board's
// declaration and nothing else (lib/pickerApi.boardColumns), and this
// file's original case survives untouched, because it never needed the
// review to hold a column up: `tables.BOARD_COLUMNS` names a competition
// whether or not it has a fixture this week, so "nothing ahead, matches
// behind" is a DECLARED column with an empty forward half. That is how
// this board is now built and every assertion below still holds.
//
// WHAT IS PINNED HERE, and why each is a property rather than a pixel:
//
//  1. THE COUNT COUNTS WHAT THE COLUMN HOLDS. Nothing ahead and a
//     finished list that landed non-empty: the header says how many
//     finished, named as finished. It never silently means the other
//     thing — `data-counts` says which.
//  2. AND IT STAYS TELLABLE FROM A COLUMN THAT IS GENUINELY EMPTY.
//     Both states are on ONE board here, so the assertion is about the
//     difference between them rather than about two separate runs.
//  3. IT NEVER SPEAKS FOR A READ THAT HAS NOT LANDED. The review is a
//     second request with its own clock and its own failure; in flight
//     or failed, the finished count is UNKNOWN and the header claims
//     nothing about it rather than reporting the zero it is holding.
//  4. THE COLUMN SET IS THE BOARD'S DECLARATION. A competition the
//     board's `leagues` does not name gets no column, however many
//     finished matches the review holds for it — and the set drawn is
//     the declared set exactly, asserted by LENGTH as well as by
//     membership so a shrinking board cannot pass a subset check.
//  5. THE TAIL MOVES TO MEET THE SENTENCE THAT NAMES IT. Its home is
//     the last subgrid track, under every matchday; with nothing ahead
//     that track is a screenful of void below the header, so the tail is
//     drawn in the FIRST content track instead. Same element, one place
//     or the other, never both.
//  6. A LOADED CONTROL DOES NOT LOOK LIKE AN EMPTY ONE.
//  7. EVERY COLUMN'S HUE IS ITS OWN. Two cup columns shared one gold.
//
// Hermetic: both payloads are served by page.route and nothing here
// reaches a backend.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

// deterministic and same-PT-day, like the other board specs: the board
// is day-major, so kickoffs straddling midnight make band assertions
// flaky. 25-minute steps from a fixed future date.
const inHours = (h: number) => {
  const base = Date.UTC(2026, 11, 15, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
};
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();

const weights = (w: number) => ({
  home: w, away: w, min: w, k: 10, constant: null,
  basis: { home: "blend", away: "blend" },
});

/* THE COMPETITIONS THIS BOARD DECLARES — the mock's `leagues` map, which
   since 2026-09-09 is the WHOLE of the column set. It is the operator's
   2026-09-08 board: four leagues and two cups.

   `leaguescup` is declared and serves NO ROW, which is this file's
   original case in the shape the board actually produces it: a
   competition stays in `tables.BOARD_COLUMNS` through a week with no
   fixture, so "nothing ahead, matches behind" is a declared column whose
   forward half is empty. It does not need — and no longer gets — a
   column conjured out of the review. */
const LEAGUES = {
  mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league",
         blend_k: 10, blend_constant_w: null },
  epl: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
         blend_k: 10, blend_constant_w: null },
  laliga: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
            blend_k: 10, blend_constant_w: null },
  ligamx: { src: "prior", min_current_gp: 6, clubs: 18, kind: "league",
            blend_k: 10, blend_constant_w: null },
  ucl: { src: "current", min_current_gp: 4, clubs: 122, kind: "cup",
         rated_on: ["epl", "laliga"], reg_time_note: null },
  leaguescup: { src: "prior", min_current_gp: 6, clubs: 47, kind: "cup",
                rated_on: ["mls", "ligamx"], reg_time_note: null },
};

const row = (over: Record<string, unknown>) => ({
  refused: false, fav_side: "home", resolution: {}, src: "current",
  kalshi: null, reg_time_note: null, gap_note: null,
  gp_current: { home: 12, away: 12, min: 12 },
  weights: weights(0.55),
  ranks: { fav: 1, opp: 8 },
  tiers: { ovr: [1, 3], atk: [1, 3], def: [1, 3] },
  tier_gaps: { ovr: 2, atk: 2, def: 2 }, shape: "CLEAN",
  ppg_gap: 0.8, gdg_gap: 1.2, rank_gap: 7,
  cross_league: false,
  ...over,
});

const MLS_ONE = row({
  league: "mls", column: "mls", espn: "usa.1",
  home: "LAFC", away: "Austin FC", favourite: "LAFC", opponent: "Austin FC",
  rated_in: { home: "mls", away: "mls" },
  event_id: "m-1", competition_id: "m-1", kickoff: inHours(6),
});
const MLS_TWO = row({
  ...MLS_ONE,
  home: "Vancouver Whitecaps", away: "Sporting Kansas City",
  favourite: "Vancouver Whitecaps", opponent: "Sporting Kansas City",
  event_id: "m-2", competition_id: "m-2", kickoff: inHours(8),
});
const UCL_ONE = row({
  league: "ucl", column: "ucl", espn: "uefa.champions",
  home: "Real Madrid", away: "Feyenoord",
  favourite: "Real Madrid", opponent: "Feyenoord",
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: "CROSS-LEAGUE FIXTURE — gaps withheld.",
  rated_in: { home: "laliga", away: "epl" },
  ranks: { fav: 1, opp: 4 },
  event_id: "u-1", competition_id: "u-1", kickoff: inHours(7),
});

const BOARD = {
  generated_at: "2026-09-08T12:00:00Z",
  date: "20260908", days: 7,
  leagues: LEAGUES,
  rows: [MLS_ONE, MLS_TWO, UCL_ONE],
  refusals: [],
};

// ---------------------------------------------------------- the review

const CONFIRM_NOTE = "EXPLORATORY — not validated.";

const finished = (league: string, id: string, h: number) => ({
  league, espn: "x.1", event_id: id, competition_id: id,
  kickoff: hoursAgo(h), home: `${id} Home`, away: `${id} Away`,
  status_detail: "FT",
  result: { home: 2, away: 0, winner: "home", source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "captured", origin_label: "CAPTURED", origin_note: "frozen",
    captured_at: hoursAgo(h + 24), captured_seconds_before_kickoff: 86400,
    board_date: "20260901", reconstructed_from: null,
    unavailable_reason: null,
    state: {
      refused: false, league, home: `${id} Home`, away: `${id} Away`,
      favourite: `${id} Home`, opponent: `${id} Away`, fav_side: "home",
      resolution: {}, ppg_gap: 0.5, gdg_gap: 0.7, rank_gap: 4,
      gp_current: { home: 12, away: 12, min: 12 },
      src: "current", ranks: { fav: 2, opp: 6 },
      tiers: { ovr: [1, 3], atk: [1, 3], def: [1, 3] },
      tier_gaps: { ovr: 2, atk: 2, def: 2 }, shape: "CLEAN",
      event_id: id, kickoff: hoursAgo(h), kalshi: null,
    },
  },
  shot_state: {
    at_20: null, before_first_goal: null, full_time: null,
    first_goal_minute: null, error: "no tape on this fixture",
  },
  fit: {
    favourite_won: true, favourite_won_reason: "winner=home fav_side=home",
    confirmed_at_20: null, confirm_reason: "no_shot_state",
    confirm_rule: "tilt_fav_and_on_target_lead",
    confirm_note: CONFIRM_NOTE, checkpoint_minute: 20,
  },
});

const reviewMeta = (n: number) => ({
  finished: n, captured: n, reconstructed: 0, unavailable: 0, error: null,
});

/* THE REVIEW CARRIES A COMPETITION THE BOARD DOES NOT — `asean`, which
   is finished, filed in the Archive dropdown, and off the board. Two
   finished ASEAN matches, three finished Leagues Cup ties, two finished
   EPL matches, and nothing for La Liga or Liga MX: one payload holding
   every state this file is about, including the one that must NOT
   produce a column.

   The two payloads deliberately disagree, because they did on the
   operator's real board and because that disagreement is the whole
   question. Which of them decides what is drawn is fact 4. */
const REVIEW = {
  generated_at: "2026-09-08T12:00:00Z",
  date: "20260908", back: 7,
  window: { from: "20260901", to: "20260908" },
  store: { backend: "postgres", writable: true },
  leagues: {
    epl: reviewMeta(2), leaguescup: reviewMeta(3), asean: reviewMeta(2),
    laliga: reviewMeta(0), ligamx: reviewMeta(0), mls: reviewMeta(0),
  },
  finished: [
    finished("leaguescup", "lc-1", 20),
    finished("leaguescup", "lc-2", 44),
    finished("leaguescup", "lc-3", 68),
    finished("epl", "e-1", 30),
    finished("epl", "e-2", 52),
    finished("asean", "as-1", 26),
    finished("asean", "as-2", 50),
  ],
  refusals: [],
};

async function open(page: import("@playwright/test").Page,
                    review: unknown = REVIEW, reviewStatus = 200,
                    board: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(review, reviewStatus)));
  await page.goto("/bet-suggester");
}

const col = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);

/** THE BOARD DRAWS FOUR OF ITS COLUMNS AT A TIME (operator, 2026-09-15).
 *
 *  Card width is arithmetic: the board's track stops growing at 96rem,
 *  so eight columns side by side leave the club name at zero pixels
 *  whatever monitor you use. Four are lit; the rest are reached by
 *  stepping a ribbon, and EVERY declared column keeps a pill in it
 *  whether it is drawn or not — a hidden column would be
 *  absent-by-design reading as vanished.
 *
 *  THIS BOARD DECLARES SIX, so it is windowed and the two cups start off
 *  screen. Nothing in this file's subject changed: a column with nothing
 *  ahead still has to count what it HOLDS. What changed is that reaching
 *  the column is now part of reading it, so this helper does what a
 *  reader does — presses the pill. Idempotent: a column already drawn is
 *  returned as it stands, so a four-column board (where the window is a
 *  NO-OP and no ribbon renders) goes through untouched.
 *
 *  `count()` DOES NOT AUTO-WAIT, so the board is waited for first — a
 *  bare count straight after `goto` reads the empty page and would press
 *  a pill that is not there yet. */
async function show(page: import("@playwright/test").Page, slug: string) {
  await expect(page.getByTestId("league-col").first()).toBeAttached();
  if (await col(page, slug).count() === 0) {
    const pill = page.locator(`[data-testid="ribbon-pill"][data-slug="${slug}"]`);
    await expect(pill, `${slug} is neither drawn nor reachable — the ribbon `
      + "carries no pill for it").toHaveCount(1);
    await pill.click();
  }
  await expect(col(page, slug)).toHaveCount(1);
  return col(page, slug);
}

/** EVERY DECLARED COLUMN, VISITED. Steps the window through the whole
 *  ribbon and hands each column to `read` while it is on screen. The
 *  return is keyed by slug, so a caller compares the SET it got back
 *  against the set the board declared rather than against a list typed
 *  beside the check. */
async function eachColumn<T>(page: import("@playwright/test").Page,
                             declared: readonly string[],
                             read: (slug: string) => Promise<T>) {
  const out = new Map<string, T>();
  for (const slug of declared) {
    await show(page, slug);
    out.set(slug, await read(slug));
  }
  return out;
}

// ------------------------------------------------------- 1 + 2: the count

test("a column with nothing ahead counts what it HOLDS, and an empty one still says zero",
  async ({ page }) => {
    /* THE TWO STATES ON ONE BOARD, because the whole point is that they
       stay tellable apart. Leagues Cup and EPL hold finished matches and
       nothing upcoming; La Liga and Liga MX hold nothing at all; MLS
       holds fixtures. Three readings, one payload. */
    await open(page);
    await show(page, "leaguescup");

    const cup = col(page, "leaguescup").getByTestId("col-count");
    await expect(cup).toHaveText("3 finished");
    await expect(cup).toHaveAttribute("data-counts", "finished");

    // a LEAGUE the board carries, with a quiet week and matches behind
    // it, reads exactly the same way — the number means one thing on
    // this board, not one thing per column
    await show(page, "epl");
    const epl = col(page, "epl").getByTestId("col-count");
    await expect(epl).toHaveText("2 finished");
    await expect(epl).toHaveAttribute("data-counts", "finished");

    // AND THE GENUINELY EMPTY COLUMNS ARE UNTOUCHED. Nothing ahead,
    // nothing behind: "0 fixtures" is a measured zero over a payload
    // that was read, and it stays.
    for (const slug of ["laliga", "ligamx"]) {
      await show(page, slug);
      const c = col(page, slug).getByTestId("col-count");
      await expect(c).toHaveText("0 fixtures");
      await expect(c).toHaveAttribute("data-counts", "upcoming");
    }

    // and a column with fixtures counts those, in the old words
    await show(page, "mls");
    await expect(col(page, "mls").getByTestId("col-count"))
      .toHaveText("2 fixtures");
  });

test("the empty box says what the column DOES have, and an empty column says only that",
  async ({ page }) => {
    await open(page);
    /* BOTH KINDS OF COLUMN KEEP THE SENTENCE the empty-window guard pins
       — "no fixtures in the next N days" — and only one of them adds the
       second line.

       THE WINDOW IS NOT TYPED HERE. Both the forward and the backward
       window opened at 8 days on 2026-09-15 and the chips that used to
       set them are gone, so a spec that named 7 would be pinning a
       default rather than the sentence. The FORWARD number is the page's
       own; the BACKWARD one is the review payload's `back`, so that half
       stays exact — a count over a window nobody measured is the defect
       this file is named after. */
    await show(page, "leaguescup");
    const cup = col(page, "leaguescup").getByTestId("col-empty");
    await expect(cup).toContainText(/No Leagues Cup fixtures in the next \d+ days\./);
    await expect(cup).toHaveAttribute("data-holds", "finished");
    await expect(cup.getByTestId("col-empty-finished"))
      .toContainText(`3 finished in the last ${DEFAULT_BACK} days`);

    await show(page, "laliga");
    const empty = col(page, "laliga").getByTestId("col-empty");
    await expect(empty).toContainText(/No La Liga fixtures in the next \d+ days\./);
    await expect(empty).toHaveAttribute("data-holds", "nothing");
    await expect(empty.getByTestId("col-empty-finished")).toHaveCount(0);

    // EPL is a league rather than a cup and reads exactly the same way —
    // the sentence is about what the column holds, not about what kind
    // of competition it is
    await show(page, "epl");
    const eplEmpty = col(page, "epl").getByTestId("col-empty");
    await expect(eplEmpty.getByTestId("col-empty-finished"))
      .toContainText(`2 finished in the last ${DEFAULT_BACK} days`);

    /* AND NOT ONE COLUMN ON THIS BOARD IS SPEAKING FOR AN ABSENT
       PAYLOAD. Every column here was DECLARED, so every one of them has
       a meta to draw its chips from; the "no board entry" chip and the
       "carries no column" sentence belong to the narrowed routes, where
       a page names its own column (e2e/picker-ucl-column.spec.ts). A
       board that grew one here would be inventing a column again. */
    await expect(page.getByTestId("col-no-board-entry")).toHaveCount(0);
    await expect(page.getByText(/carries no column for/)).toHaveCount(0);
  });

// --------------------------------------------- 3: a read that did not land

test("a review that FAILED is not a column with nothing finished",
  async ({ page }) => {
    /* MISSING IS NEVER ZERO, one layer down. The review is a second
       request; when it fails the finished count is UNKNOWN, and
       `review.rows.length` is 0 for exactly the same reason a hundred
       real matches would be. The header must not report that zero. */
    await open(page, { detail: "review unavailable" }, 503);
    /* THE BOARD ITSELF IS UNHARMED — the two payloads fail apart. Every
       row the board served is still drawn, counted ACROSS THE WINDOW
       rather than in one four-column view: the UCL row rides a column
       that starts off screen, and counting what happens to be lit would
       report two rows over a payload carrying three. */
    const drawnRows = new Set<string>();
    await eachColumn(page, Object.keys(LEAGUES), async () => {
      for (const e of await page.getByTestId("picker-row")
        .evaluateAll((els) => els.map((x) => x.getAttribute("data-event")!)))
        drawnRows.add(e);
    });
    expect([...drawnRows].sort())
      .toEqual(BOARD.rows
        .map((r) => (r as unknown as { event_id: string }).event_id).sort());

    // EPL is one of the four columns the board draws first, and it has
    // nothing upcoming. Its count says the one thing that IS known.
    await show(page, "epl");
    const epl = col(page, "epl").getByTestId("col-count");
    await expect(epl).toHaveText("0 fixtures");
    await expect(epl).toHaveAttribute("data-counts", "upcoming");
    // and no box anywhere on the board claims a finished count
    await expect(page.getByTestId("col-empty-finished")).toHaveCount(0);

    /* NOR DOES THE CONTROL. `rows.length` is 0 here for the same reason
       it is 0 on a league that played nothing, and the toggle is where a
       reader decides whether to look — "0 matches" there would be the
       failed read wearing the measured one's clothes. */
    const toggle = col(page, "epl").getByTestId("review-toggle");
    await expect(toggle).toHaveAttribute("data-has", "unread");
    await expect(col(page, "epl").getByTestId("review-count"))
      .toHaveText(`not read · last ${DEFAULT_BACK}d`);

    /* AND THE BOARD IS STILL THE BOARD. Every declared column is still
       REACHABLE, including the cup that has nothing upcoming: the column
       set comes from the payload that SUCCEEDED, so a dead review costs
       finished counts and costs nothing else. Before 2026-09-09 this
       column's existence depended on the review, and a failed review
       deleted it — one request's failure silently editing the other's
       declaration.
       ASSERTED OFF THE RIBBON, which carries one pill per DECLARED
       column, because the board draws four of them at a time and a count
       of what is on screen would now say four whatever the review did. */
    await expect(page.getByTestId("ribbon-pill"))
      .toHaveCount(Object.keys(LEAGUES).length);
    await show(page, "leaguescup");
    await expect(col(page, "leaguescup").getByTestId("col-count"))
      .toHaveAttribute("data-counts", "upcoming");
  });

test("one league's tail failing costs that league's count, not the board's",
  async ({ page }) => {
    /* The per-league error is the third way the number can be unknown,
       and it is the one a whole-payload check would miss. */
    await open(page, {
      ...REVIEW,
      leagues: {
        ...REVIEW.leagues,
        leaguescup: { ...reviewMeta(3),
          error: "ConnectionError: scoreboard fetch failed" },
      },
    });
    await show(page, "leaguescup");
    await expect(col(page, "leaguescup").getByTestId("col-count"))
      .toHaveText("0 fixtures");
    await expect(col(page, "leaguescup").getByTestId("col-empty-finished"))
      .toHaveCount(0);
    await expect(col(page, "leaguescup").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "unread");
    // the EPL tail read fine and still counts — one league's failure is
    // not the board's
    await show(page, "epl");
    await expect(col(page, "epl").getByTestId("col-count"))
      .toHaveText("2 finished");
    await expect(col(page, "epl").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "matches");
  });

// ------------------------------------ 4: the board declares the columns

test("the columns drawn are exactly the ones the board declares, and a competition only the review knows gets none",
  async ({ page }) => {
    /* THE DEFECT, TWICE. The board's column set was once DERIVED from
       the backend registries and grew from six to eleven in production
       without a decision. It was then rebuilt on this page as four
       hard-coded leagues UNIONED with the payload's `leagues`, the
       rows, the refusals, the REVIEW's `leagues`, the finished rows and
       the finished refusals — and the last three walked a competition
       the operator had removed straight back onto his board, drawn out
       of its own finished matches.

       DERIVED FROM THE DECLARATION, never a hand-typed subset, and
       asserted by LENGTH as well as by membership: a guard that listed
       the columns it expected to see would stay green the day a sixth
       appeared beside them, which is exactly how eleven columns went
       unnoticed. The set drawn must EQUAL the set declared. */
    await open(page);
    /* `evaluateAll` DOES NOT AUTO-WAIT. Called straight after goto it
       returns the empty list the page had before either payload landed,
       and every assertion below then passes over nothing — a guard that
       is green because it checked no columns. */
    await expect(page.getByTestId("league-col").first()).toBeAttached();
    const declared = Object.keys(LEAGUES);

    /* THE BOARD REACHES EXACTLY THE DECLARED SET, and draws four of it
       at a time (2026-09-15). The old assertion — every declared column
       drawn, counted — is now two claims, and both are made:

         a. THE RIBBON CARRIES ONE PILL PER DECLARED COLUMN, by LENGTH
            as well as by membership. This is where the set is visible
            at a glance and it is the whole of what the board admits;
            a seventh competition appearing beside the six goes red here
            exactly as it used to go red on the column count.
         b. STEPPING THROUGH THE WHOLE RIBBON DRAWS EVERY ONE OF THEM AND
            NOTHING ELSE. `eachColumn` visits the declared set and the
            union of what was on screen is compared against it — so a
            column that is declared and unreachable fails, and a column
            that appears from somewhere else fails too. */
    await expect(page.getByTestId("ribbon-pill")).toHaveCount(declared.length);
    const pills = await page.getByTestId("ribbon-pill")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")!));
    expect([...pills].sort()).toEqual([...declared].sort());

    const seen = new Set<string>();
    await eachColumn(page, declared, async () => {
      for (const s of await page.getByTestId("league-col")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-league")!)))
        seen.add(s);
    });
    const drawn = [...seen];
    expect(drawn.length).toBe(declared.length);
    expect([...drawn].sort()).toEqual([...declared].sort());

    /* AND THE ONE THE REVIEW ALONE KNOWS ABOUT IS NOT AMONG THEM. ASEAN
       has two finished matches in the payload above and no entry in the
       board's `leagues`; the finished matches are real and they belong
       on that competition's own page, not to a column here. Named
       explicitly as well as covered by the set equality, because this
       is the specific door that was open. */
    expect(drawn).not.toContain("asean");
    expect(pills).not.toContain("asean");
    await expect(col(page, "asean")).toHaveCount(0);

    /* NOR CAN THE OTHER SIX DOORS OPEN IT. A finished row's `league` is
       in the payload the page read, and so is a finished refusal's; if
       either could contribute a slug, this text would be somewhere on
       the board. */
    await expect(page.getByText(/as-1 Home/)).toHaveCount(0);
    await expect(page.getByText(/as-2 Home/)).toHaveCount(0);
  });

test("the frontend's own reading order cannot ADMIT a column — a league it names that the board does not is not drawn",
  async ({ page }) => {
    /* THE LAST DOOR, AND THE ONE EASIEST TO LEAVE OPEN. The four league
       slugs are still written down in the frontend — `PICKER_COLUMN_ORDER`
       — because the operator reads his board left to right in that order
       every day and the payload does not carry an order. A list like that
       used to be PREPENDED to the column set, which is to say it admitted
       four columns whatever the board said; it is intersected with the
       declaration now, so it can only ever reorder.
       NO OTHER TEST ON THIS BOARD CAN SEE THE DIFFERENCE, because every
       other fixture here declares all four leagues — a list that admits
       and a list that orders produce identical boards until the board
       stops declaring one of them. This is that board. */
    const withoutLigamx: Record<string, unknown> = { ...LEAGUES };
    delete withoutLigamx.ligamx;
    await open(page, REVIEW, 200, { ...BOARD, leagues: withoutLigamx });

    /* FIVE DECLARED, SO THE BOARD IS STILL WINDOWED and the set is read
       off the ribbon — one pill per declared column, and Liga MX has
       neither a pill nor a column. */
    await expect(page.getByTestId("league-col").first()).toBeAttached();
    await expect(page.getByTestId("ribbon-pill"))
      .toHaveCount(Object.keys(withoutLigamx).length);
    await expect(col(page, "ligamx")).toHaveCount(0);
    await expect(page.locator('[data-testid="ribbon-pill"][data-slug="ligamx"]'))
      .toHaveCount(0);
    // ...and the survivors are still in reading order, MLS first: the
    // list lost its power to admit without losing its job
    const drawn = await page.getByTestId("league-col")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-league")!));
    expect(drawn.slice(0, 3)).toEqual(["mls", "epl", "laliga"]);
    const pills = await page.getByTestId("ribbon-pill")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")!));
    expect([...pills].sort()).toEqual(Object.keys(withoutLigamx).sort());

    // the phone jump-nav is built from the same set, so it cannot offer
    // a link to a column that is not there
    await expect(page.getByTestId("league-jump")
      .getByText("Liga MX")).toHaveCount(0);
  });

// ---------------------------------------------- 5: where the tail is drawn

type Box = { x: number; y: number; width: number; height: number };

/** A LAYOUT READ MUST WAIT FOR THE LAYOUT — the settled-read pattern
 *  from e2e/picker-ucl-column.spec.ts. `boundingBox()` does not
 *  auto-wait and a viewport resize is not synchronous with reflow, so a
 *  measurement taken too early faithfully describes the PREVIOUS layout,
 *  and a wrong number here reads as a real defect. Settled means two
 *  consecutive reads agree. */
async function settledBox(
  loc: ReturnType<typeof col>,
): Promise<Box> {
  await expect(loc).toBeVisible();
  const read = async () => {
    const b = await loc.boundingBox();
    expect(b, "the element has no box at all — it is not being laid out")
      .not.toBeNull();
    return b!;
  };
  const shape = (b: Box) =>
    `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.height)}`;
  let prev = await read();
  for (let i = 0; i < 25; i++) {
    const next = await read();
    if (shape(next) === shape(prev)) return next;
    prev = next;
  }
  throw new Error("the layout never settled — 25 consecutive reads disagreed");
}

test("with nothing ahead the tail is drawn beside the fixtures, not at the foot of the board",
  async ({ page }) => {
    /* THE DEFECT THIS REPLACES. The tail's home is the last subgrid
       track, under every matchday band — correct while there is a
       forward story above it, and a screenful of void when there is
       not: on the operator's 1440 board the Leagues Cup toggle sat
       roughly a thousand pixels below the empty box that pointed at it.
       "Last in the column" and "the first content track" are the same
       place when every track above is empty. */
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    await expect(page.getByTestId("picker-row").first()).toBeVisible();

    /* THE CUP AND MLS HAVE TO BE ON SCREEN TOGETHER, because the
       measurement below is the cup tail's position AGAINST the MLS
       column's fixtures. Pressing the cup's pill puts it leftmost and
       MLS next to it, which is the four-wide window this board draws. */
    await show(page, "leaguescup");
    await show(page, "mls");
    await expect(col(page, "leaguescup")).toHaveCount(1);

    const cupTail = col(page, "leaguescup").getByTestId("review-tail");
    await expect(col(page, "leaguescup").locator('[data-slot="tail-track"]'))
      .toHaveAttribute("data-at", "head");
    // exactly ONE tail in the column — the head placement and the foot
    // placement are one element in two possible tracks, never both
    await expect(cupTail).toHaveCount(1);

    // a column WITH fixtures keeps its tail at the foot
    await expect(col(page, "mls").locator('[data-slot="tail-track"]'))
      .toHaveAttribute("data-at", "foot");

    /* AND IT REALLY MOVED, measured rather than asserted off the
       attribute alone: the cup tail's top sits above the bottom of the
       MLS column's own fixtures, which is the band it has been pulled
       up into. At the foot of the board it sat far below them. */
    const cupBox = await settledBox(cupTail);
    const mlsCards = col(page, "mls").getByTestId("picker-row");
    await expect(mlsCards).toHaveCount(2);
    const lastCard = await settledBox(mlsCards.nth(1));
    expect(cupBox.y, "the tail is still below the board's fixtures")
      .toBeLessThan(lastCard.y + lastCard.height);

    // and the MLS tail, which did not move, is below them
    const mlsTail = await settledBox(col(page, "mls")
      .getByTestId("review-tail"));
    expect(mlsTail.y).toBeGreaterThan(lastCard.y + lastCard.height);
  });

// ------------------------------------------------- 6: the control itself

test("a finished list with matches in it does not look like one without",
  async ({ page }) => {
    /* Every part of the toggle row was drawn in the faintest ink on the
       ladder, so "3 matches" and "0 matches" were the same object at a
       glance — and on a column whose only content is behind that
       control, that is what "an empty column" looked like. */
    await open(page);
    /* BOTH ON SCREEN AT ONCE, because the assertion at the foot of this
       test compares the two columns' INK against each other — a
       comparison across two window positions would be comparing two
       renders. Pressing the cup's pill draws leaguescup, mls, epl and
       laliga together, which is the pair this test needs. */
    await show(page, "leaguescup");
    await expect(col(page, "laliga")).toHaveCount(1);
    await expect(col(page, "leaguescup").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "matches");
    await expect(col(page, "laliga").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "none");
    // the count is still readable WITHOUT opening it — the whole point
    // of a collapsed section
    await expect(col(page, "leaguescup").getByTestId("review-toggle"))
      .toHaveAttribute("aria-expanded", "false");
    await expect(col(page, "leaguescup").getByTestId("review-count"))
      .toHaveText(`3 matches · last ${DEFAULT_BACK}d`);

    // and the ink differs, which is the part a reader actually sees
    const inkOf = (slug: string) => col(page, slug)
      .getByTestId("review-count")
      .evaluate((el) => getComputedStyle(el).color);
    expect(await inkOf("leaguescup")).not.toBe(await inkOf("laliga"));
  });

// -------------------------------------------------------- 7: the hues

/** THE PAINTED RAIL OF EVERY DECLARED COLUMN, stepping the window
 *  through the whole ribbon. Read off the INK, never the token name: two
 *  different names resolving to one colour is the failure, and a name
 *  check cannot see it. */
async function rails(page: import("@playwright/test").Page,
                     declared: readonly string[]) {
  await expect(page.getByTestId("col-rail").first()).toBeAttached();
  const got = await eachColumn(page, declared, (slug) =>
    col(page, slug).locator('[data-testid="col-rail"]')
      .evaluate((e) => getComputedStyle(e).backgroundColor));
  expect(got.size, "no rail was read — this check would pass over an "
    + "empty set").toBe(declared.length);
  return got;
}

test("every column on the board carries a hue of its own",
  async ({ page }) => {
    /* TWO CUPS SHARED ONE GOLD. `--lg-cup` was the fallback for every
       competition outside the four leagues, which held only while at
       most one was drawn; with the Champions League and the Leagues Cup
       side by side the rail, the favourite pip and the dumbbell span
       were identical on both, so the one ink whose job is telling
       columns apart told the reader nothing.
       Read off the columns the board actually drew — a hand-typed list
       would stay green the day a seventh competition inherits the
       fallback again — and off the PAINTED rail rather than the token
       name, because two different names resolving to one colour is
       exactly the failure.
       STEPPED THROUGH THE WHOLE RIBBON since 2026-09-15: the board draws
       four columns at a time, so a single read compares four of six and
       a collision between two columns that are never co-visible would
       go unseen — which is precisely the gap the new hues were chosen
       around. */
    await open(page);
    const hues = await rails(page, Object.keys(LEAGUES));
    for (const [slug, hue] of hues) {
      expect(hue, `${slug} has no painted rail`)
        .toMatch(/^rgba?\((?!0, 0, 0, 0\))/);
    }
    const seen = new Map<string, string>();
    for (const [slug, hue] of hues) {
      const clash = seen.get(hue);
      expect(clash, `${slug} and ${clash} are the same hue (${hue})`)
        .toBeUndefined();
      seen.set(hue, slug);
    }
  });

/** THE BRAND GOLD, AS INK. `--accent` and `--lg-cup` are byte-identical
 *  (#f5c542) in styles/globals.css — which is the point of the fallback
 *  and the whole of the hazard: a league slug `LEAGUE_HUE` does not know
 *  resolves to `--lg-cup`, and the column comes out wearing the brand.
 *  Written as the painted string a browser reports. */
const BRAND_GOLD = "rgb(245, 197, 66)";

/** THE EIGHT LEAGUES THE BOARD NOW CARRIES. Four joined on 2026-09-15
 *  and none of them had an entry in `LEAGUE_HUE`, so all four fell
 *  through to the cup fallback — four columns wearing the brand,
 *  indistinguishable from each other and from a cup tie folded in beside
 *  them. Declaring the CSS variables does not fix that: the MAP is what
 *  resolves a slug, and a slug it does not know never reaches them. */
const EIGHT = {
  mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league" },
  epl: { src: "current", min_current_gp: 12, clubs: 20, kind: "league" },
  laliga: { src: "current", min_current_gp: 12, clubs: 20, kind: "league" },
  ligamx: { src: "prior", min_current_gp: 6, clubs: 18, kind: "league" },
  bundesliga: { src: "current", min_current_gp: 12, clubs: 18, kind: "league" },
  seriea: { src: "current", min_current_gp: 12, clubs: 20, kind: "league" },
  ligue1: { src: "current", min_current_gp: 12, clubs: 18, kind: "league" },
  eredivisie: { src: "current", min_current_gp: 12, clubs: 18, kind: "league" },
};

test("no league column is painted in the brand gold — the fallback is for "
   + "a competition nobody has picked a hue for, not for a league",
  async ({ page }) => {
    /* THE FAILURE A NAME CHECK CANNOT SEE. `hueOf` returns
       `var(--lg-<slug>)` for a slug it knows and `var(--lg-cup)` for one
       it does not; `--lg-cup` is the brand gold, and gold is also rank
       01 and the "this opens" affordance. So an unmapped league does not
       render broken — it renders BRANDED, and two unmapped leagues
       render identically. That is how the UCL and the Leagues Cup became
       indistinguishable, and how four new leagues would have arrived all
       wearing the same colour as each other.
       The check is on the PAINTED ink, so a second token pointing at the
       same value fails here the same way a missing entry does.

       A CUP IS DIFFERENT AND IS NOT SWEPT: `--lg-cup` on a competition
       nobody has chosen a hue for is honest — an unassigned column looks
       unassigned. Every column on THIS board is a league. */
    await open(page, REVIEW, 200, { ...BOARD, leagues: EIGHT, rows: [] });
    const declared = Object.keys(EIGHT);
    await expect(page.getByTestId("ribbon-pill")).toHaveCount(declared.length);

    const hues = await rails(page, declared);
    const branded = [...hues].filter(([, hue]) => hue === BRAND_GOLD)
      .map(([slug]) => slug);
    expect(branded, `these league columns resolve to the cup fallback and `
      + `are painted in the brand gold (${BRAND_GOLD}): ${branded.join(", ")}`)
      .toEqual([]);

    // and, still, no two of the eight share an ink
    const seen = new Map<string, string>();
    for (const [slug, hue] of hues) {
      expect(seen.get(hue),
        `${slug} and ${seen.get(hue)} are the same hue (${hue})`)
        .toBeUndefined();
      seen.set(hue, slug);
    }

    /* AND THE RIBBON PAINTS THE SAME EIGHT. The pill's dot is styled
       from `var(--lg-<slug>)` DIRECTLY rather than through `hueOf`, so
       a slug with a declared CSS variable and no map entry would light
       its pill correctly and its column in gold — two inks for one
       league, one of them the brand. Read off the pills' own dots, and
       matched against the column each one leads to. */
    const dots = await page.getByTestId("ribbon-pill").evaluateAll((els) =>
      els.map((e) => [e.getAttribute("data-slug")!,
        getComputedStyle(e.querySelector("i")!).backgroundColor] as const));
    expect(dots.length).toBe(declared.length);
    for (const [slug, dot] of dots) {
      expect(dot, `${slug}'s ribbon dot is unpainted`)
        .toMatch(/^rgba?\((?!0, 0, 0, 0\))/);
      expect(dot, `${slug}'s ribbon dot is the brand gold`)
        .not.toBe(BRAND_GOLD);
      expect(dot, `${slug}'s ribbon dot and its column's rail are two `
        + "different inks for one league").toBe(hues.get(slug));
    }
  });

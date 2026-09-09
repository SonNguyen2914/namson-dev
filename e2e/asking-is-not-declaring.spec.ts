import { expect, test } from "@playwright/test";

// ASKING IS NOT DECLARING.
//
// On 2026-09-09 the backend opened a door it had described for weeks:
// `GET /api/picker/board?leagues=ucl` assembles the Champions League as
// BOARD ROWS — the same object the landing page's card renders — for a
// competition that is deliberately NOT a board column.
// `OFF_BOARD_BY_DECISION` had always said the spec stays and the board
// still builds it "for anyone who asks for it by name"; only the HTTP
// route did not offer it.
//
// WHAT THAT DOOR MAKES POSSIBLE, AND WHAT IT MAKES DANGEROUS. Possible:
// /bet-suggester/ucl is the landing page's own component and card, drawn
// over Champions League fixtures, which is what the operator asked for
// ("where is my UCL match cards using the same layout of the landing
// page?"). Dangerous: the narrowed payload's `leagues` key set now holds
// the slug that was ASKED ABOUT, in exactly the shape a DECLARATION has
// — and the board has twice grown by that confusion:
//
//   - the column set was once DERIVED from the registries and went from
//     six columns to eleven, live, without a decision;
//   - a FINISHED Leagues Cup walked back onto the board through the
//     review payload the day the backend took it off.
//
// The operator's rule is one sentence — "only add leagues/cup to the
// landing page when I say so" — and this file is that rule expressed as
// properties. Every test here answers one question: can a request this
// page makes put a competition on the board that the operator did not?
//
// THE SETS ARE DERIVED AND THEIR LENGTHS ASSERTED. Not one test below
// types "4" or lists MLS · EPL · La Liga · Liga MX. A hand-typed subset
// stays green while the omitted case drifts — the defect that let La
// Liga disarm itself on every boot for as long as a test called "both
// planes" listed two of three — so the expected column set is read off
// the very payload the page was served, and its LENGTH is asserted
// against what the page drew.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const kickoff = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 3_600_000).toISOString();

const meta = (over: Record<string, unknown> = {}) => ({
  src: "current", min_current_gp: 12, clubs: 20, kind: "league",
  blend_k: 10, blend_constant_w: null, ...over,
});

const row = (league: string, i: number, over: Record<string, unknown> = {}) => ({
  refused: false, league, column: league,
  home: `${league} home ${i}`, away: `${league} away ${i}`,
  favourite: `${league} home ${i}`, opponent: `${league} away ${i}`,
  fav_side: "home", fav_source: "rank", resolution: {},
  ppg_gap: 0.4, gdg_gap: 0.7, rank_gap: 5,
  gp_current: { home: 12, away: 12, min: 12 },
  weights: { home: 0.55, away: 0.55, min: 0.55, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  src: "current", cross_league: false,
  rated_in: { home: league, away: league },
  gap_note: null, reg_time_note: null,
  table_notes: { home: null, away: null },
  ranks: { fav: 2, opp: 7 },
  rates: { ppg: [2.1, 1.7], gf: [2.0, 1.5], ga: [0.9, 1.2], gdg: [1.1, 0.3] },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 },
  shape: "CLEAN", event_id: `${league}-${i}`, competition_id: `${league}-${i}`,
  kickoff: kickoff(i), espn: "x", venue: null, venue_class: null,
  kalshi: null, current_only: null, form: null,
  ...over,
});

/** THE OPERATOR'S DECLARED BOARD, as the backend serves it with no
 *  `leagues` parameter: four league columns and no `narrowed_to`. */
const DECLARED = {
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: {
    mls: meta({ clubs: 30, min_current_gp: 22 }),
    epl: meta(),
    laliga: meta(),
    ligamx: meta({ src: "prior", clubs: 18, min_current_gp: 6 }),
  },
  rows: [row("mls", 1), row("epl", 2), row("laliga", 3), row("ligamx", 4)],
  refusals: [], off_board: [], off_board_counts: {}, folded: {},
};

/** THE SAME BOARD, ASKED FOR THE CHAMPIONS LEAGUE BY NAME. `narrowed_to`
 *  is the backend's own marker, present only on a narrowed read, and its
 *  presence is the sentence "you asked for this". */
const NARROWED_UCL = {
  ...DECLARED,
  leagues: { ucl: meta({ kind: "cup", clubs: 36, rated_on: ["epl", "laliga"],
                         reg_time_note: null }) },
  rows: [row("ucl", 1), row("ucl", 2)],
  narrowed_to: ["ucl"],
};

/** THE ANSWER A BACKEND DEPLOYED BEFORE fc9bc55 GIVES: 200, its declared
 *  board, and no marker at all — an unknown query parameter is simply
 *  ignored. This is not hypothetical. It is what prod answered while
 *  this was being built, verified by hand:
 *  `/api/picker/board?leagues=ucl` returned the four league columns and
 *  no `narrowed_to`, on code_revision 0f6675c. */
const ASK_IGNORED = DECLARED;

const review = { finished: [], refusals: [], leagues: {}, store: null };

async function open(page: import("@playwright/test").Page,
                   path: string, board: unknown) {
  const urls: string[] = [];
  await page.route("**/api/picker/board**", (r) => {
    urls.push(r.request().url());
    return r.fulfill(json(board));
  });
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ competition: "ucl", passes: "0", axes: null,
                     why_not: "not measured in this test" })));
  await page.goto(path);
  return urls;
}

const cols = (page: import("@playwright/test").Page) =>
  page.getByTestId("league-col");

// ─────────────────────────────────────── 1. the landing page's request

test("the landing page asks for NOTHING by name — its request carries no "
   + "`leagues` at all", async ({ page }) => {
    /* THE FIRST AND CHEAPEST GUARD, and the one that makes every other
       claim here structural rather than incidental: a request that never
       names a competition cannot narrow, and a payload that is not
       narrowed carries no `narrowed_to` to be misread. The board's URL
       is also its backend CACHE KEY — the declared read keeps the exact
       string it has always had, so this surface takes no cold cache on
       deploy. */
    const urls = await open(page, "/bet-suggester", DECLARED);
    await expect(cols(page).first()).toBeAttached();
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).not.toContain("leagues=");
  });

test("the board draws exactly the columns the payload DECLARES — the set "
   + "and its length, read off the payload", async ({ page }) => {
    await open(page, "/bet-suggester", DECLARED);
    const declared = Object.keys(DECLARED.leagues);
    /* DERIVED, NOT TYPED. `declared` is the fixture's own key set, so a
       column added to or removed from the payload moves this expectation
       with it — and the LENGTH is asserted, which is the half a
       hand-written list of slugs silently gets wrong. */
    await expect(cols(page)).toHaveCount(declared.length);
    const drawn = await cols(page)
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-league")));
    expect([...drawn].sort()).toEqual([...declared].sort());
  });

test("a NARROWED payload handed to the landing page declares nothing — it "
   + "does not become a column set", async ({ page }) => {
    /* THE CENTRAL PROPERTY, and the one the whole file exists for. The
       page cannot reach this state through its own UI (it asks for
       nothing), so it is put there directly: if a cache, a proxy or a
       future caller ever answers this route with a narrowed payload, the
       Champions League must NOT acquire a column from it.
       Zero columns is the safe direction — the unsafe one is reading an
       answer to somebody's question as the operator's declaration — and
       it is NAMED rather than left as a blank. */
    await open(page, "/bet-suggester", NARROWED_UCL);
    await expect(page.getByTestId("board-not-a-declaration")).toBeVisible();
    await expect(cols(page)).toHaveCount(0);
    await expect(cols(page).filter({ hasText: /./ })).toHaveCount(0);
  });

test("and the DECLARED payload says none of that — the control",
  async ({ page }) => {
    /* Without this the test above would pass against a page that drew no
       columns at all, which is the same defect pointing the other way. */
    await open(page, "/bet-suggester", DECLARED);
    await expect(page.getByTestId("board-not-a-declaration")).toHaveCount(0);
    await expect(cols(page))
      .toHaveCount(Object.keys(DECLARED.leagues).length);
  });

// ──────────────────────────────────── 2. the narrowed route's request

test("/bet-suggester/ucl asks for its competition BY NAME", async ({ page }) => {
    const urls = await open(page, "/bet-suggester/ucl", NARROWED_UCL);
    await expect(cols(page)).toHaveCount(1);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).toContain("leagues=ucl");
  });

test("it draws the landing page's own card over those rows — the same "
   + "component, not a copy", async ({ page }) => {
    await open(page, "/bet-suggester/ucl", NARROWED_UCL);
    const ucl = cols(page).filter({ has: page.locator("[data-league]") });
    await expect(ucl).toHaveCount(1);
    /* THE BOARD'S OWN FURNITURE, reached here because this route IS the
       board: the anchor number, the rank pair, the shape chip, the sort
       control and the matchday bands. Counted against the payload's own
       row count rather than a typed number. */
    await expect(page.getByTestId("picker-row"))
      .toHaveCount(NARROWED_UCL.rows.length);
    await expect(page.getByTestId("row-anchor").first()).toBeVisible();
    await expect(page.getByTestId("col-sort")).toHaveCount(1);
    await expect(page.getByTestId("day-band").first()).toBeAttached();
  });

test("the narrowed page SAYS it was asked for, so the reader is never left "
   + "to read a narrowed board as the board", async ({ page }) => {
    await open(page, "/bet-suggester/ucl", NARROWED_UCL);
    const note = page.getByTestId("board-narrowed");
    await expect(note).toBeVisible();
    await expect(note).toHaveAttribute("data-narrowed-to", "ucl");
    await expect(note).toContainText(/asked/i);
    /* THE COMPETITION'S DISPLAY NAME, never its slug — and the words
       either side of it, because the space after an interpolation at
       the end of a JSX line is eaten by the transform and this sentence
       shipped once as "Champions Leagueby name". A `toContainText` on
       the name alone passes straight through that. */
    await expect(note).toContainText("Champions League by name");
    // and it is not confused with the board carrying no column for it
    await expect(page.getByTestId("board-undeclared")).toHaveCount(0);
  });

// ─────────────────────────────── 3. an ask that was not actually answered

test("a 200 that IGNORED the ask is not read as a competition with no "
   + "fixtures", async ({ page }) => {
    /* MISSING IS NEVER ZERO, at the exact seam where it is easiest to
       get wrong. A backend that does not know the parameter answers 200
       with its DECLARED board — four columns of other competitions'
       fixtures and none of this one. Filtering that to `ucl` yields an
       empty column, and an empty column that says "0 fixtures in the
       next 7 days" is a measured absence invented out of a question
       nobody answered. */
    await open(page, "/bet-suggester/ucl", ASK_IGNORED);
    const ucl = cols(page);
    await expect(ucl).toHaveCount(1);
    await expect(ucl.getByTestId("picker-row")).toHaveCount(0);
    const count = ucl.getByTestId("col-count");
    await expect(count).toHaveAttribute("data-counts", "unasked");
    await expect(count).not.toHaveText(/fixtures/);
    // the block that says what actually happened, and the way out
    await expect(page.getByTestId("board-undeclared")).toBeVisible();
    // and emphatically NOT the "you asked for this" note: nothing was
    // answered, so nothing may claim it was
    await expect(page.getByTestId("board-narrowed")).toHaveCount(0);
  });

test("and none of the other competitions' rows leak into the column",
  async ({ page }) => {
    /* The ignored ask returns rows for four leagues. The column is keyed
       by slug, so they have nowhere to sit — but this asserts it, because
       "the page drew somebody else's fixtures under a Champions League
       heading" is the worst outcome available here and the cheapest one
       to leave untested. */
    await open(page, "/bet-suggester/ucl", ASK_IGNORED);
    await expect(cols(page)).toHaveCount(1);
    await expect(page.getByTestId("picker-row")).toHaveCount(0);
    for (const slug of Object.keys(ASK_IGNORED.leagues)) {
      await expect(page.locator(`[data-testid="league-col"][data-league="${slug}"]`))
        .toHaveCount(0);
    }
  });

test("an answer narrowed to something ELSE is an unanswered ask, not a "
   + "narrowed board", async ({ page }) => {
    /* `narrowed_to` is CHECKED against what was asked, not merely
       detected. A reply carrying the marker for a different competition
       is a server answering a question we did not ask — verifying the
       field is present but not what it says would let that reply light
       up the "you asked for this" note over rows from somewhere else. */
    await open(page, "/bet-suggester/ucl",
              { ...ASK_IGNORED, narrowed_to: ["mls"] });
    await expect(page.getByTestId("board-narrowed")).toHaveCount(0);
    await expect(page.getByTestId("board-undeclared")).toBeVisible();
    await expect(cols(page).getByTestId("col-count"))
      .toHaveAttribute("data-counts", "unasked");
  });

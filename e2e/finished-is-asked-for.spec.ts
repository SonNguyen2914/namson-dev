import { expect, test } from "@playwright/test";

// THE FINISHED TAIL ASKS FOR ITS OWN COMPETITION — and the three states
// a tail may report are kept apart.
//
// WHAT HAPPENED. The operator asked to "load finished match cards into
// the finished section" on the Champions League page. Six UCL fixtures
// finished that night and `/api/picker/review` served ZERO of them:
//
//   GET /api/picker/review?days=7&leagues=ucl
//     leagues:  ["epl","laliga","mls","ligamx"]
//     finished: 54   {mls: 28, laliga: 11, epl: 10, ligamx: 5}
//
// The parameter was ignored because it did not exist, and the page never
// sent it: `fetchReview(back)` asked for the DECLARED sweep on every
// route, so `/bet-suggester/ucl` drew its board half from `?leagues=ucl`
// and its finished half from four other competitions' matches.
//
// AND IT WAS NOT A BACKEND BUG. `review_competitions()` returns
// `tables.BOARD_COLUMNS`, correctly — the operator took UCL off his
// landing page and this payload's keys are columns on that page. Right
// for the board; wrong for a page narrowed to that competition.
//
// THE RULE THAT DECIDES EVERY CASE BELOW is that function's own, written
// after the same failure from the opposite side:
//
//     A competition this surface never read must never be rendered as
//     one it read and found empty.
//
// So three states, and no two of them may share a rendering:
//
//   1. ASKED, AND NONE FINISHED — a measurement. `review-empty`.
//   2. NEVER ASKED — no key on the payload. NOT zero, and until
//      2026-09-10 there was NO BRANCH FOR IT AT ALL: the card fell
//      through every condition to the empty state and said "No Champions
//      League fixtures finished in the last 7 days" over six that were
//      played. `review-unasked`.
//   3. ASKED AND THE READ FAILED — the whole request, or this
//      competition's own scoreboard, in the BACKEND'S words.
//      `review-error` / `review-league-error`.
//
// EVERY ROUTE THE PAGE CALLS IS MOCKED. `openUcl` in
// picker-ucl-column.spec.ts mocked the board and let the comp ratings
// route reach the live backend, and main went red the day that backend
// changed. The three the picker pages touch are the board, the review
// and `/api/comp/{key}/ratings`; a catch-all guard below FAILS the test
// if any other backend route is reached, rather than letting it through
// to a live server.
//
// THE SETS ARE DERIVED. The declared column set is read off the very
// payload the page was served and its LENGTH asserted — not typed here,
// because a hand-typed subset stays green while the omitted case drifts.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const inHours = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 25 * 60_000).toISOString();

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3_600_000).toISOString();

// ---- the board half, minimal but real-shaped --------------------------

const LEAGUES = {
  ucl: { src: "current", min_current_gp: 4, clubs: 122, kind: "cup",
         rated_on: ["epl", "laliga", "seriea"], reg_time_note: null },
};

const DECLARED_LEAGUES = {
  epl: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
         blend_k: 10, blend_constant_w: null },
  laliga: { src: "current", min_current_gp: 12, clubs: 20, kind: "league",
            blend_k: 10, blend_constant_w: null },
  mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league",
         blend_k: 10, blend_constant_w: null },
  ligamx: { src: "prior", min_current_gp: 6, clubs: 18, kind: "league",
            blend_k: 10, blend_constant_w: null },
};

const UCL_ROW = {
  refused: false, league: "ucl", espn: "uefa.champions",
  home: "Newcastle United", away: "FC Barcelona",
  favourite: "FC Barcelona", opponent: "Newcastle United",
  fav_side: "away", resolution: {}, src: "current",
  kalshi: null, reg_time_note: null,
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true,
  gap_note: "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld.",
  rated_in: { home: "epl", away: "laliga" },
  ranks: { fav: 1, opp: 6 },
  rates: { ppg: [2.50, 1.80], gf: [2.80, 1.90], ga: [0.75, 1.10],
           gdg: [2.05, 0.80] },
  own_gdg: { diff: 1.25, basis: "EACH CLUB'S OWN GD/g, DIFFERENCED" },
  gp_current: { home: 12, away: 12, min: 12 },
  weights: { home: 0.55, away: 0.55, min: 0.55, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "CLEAN",
  event_id: "ucl-ahead", competition_id: "ucl-ahead", kickoff: inHours(8),
};

const UCL_BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260910", days: 7,
  leagues: LEAGUES, rows: [UCL_ROW], refusals: [],
  narrowed_to: ["ucl"],
};

const DECLARED_BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260910", days: 7,
  leagues: DECLARED_LEAGUES, rows: [], refusals: [],
};

// ---- the finished half ------------------------------------------------

// THE SIX REAL CHAMPIONS LEAGUE FIXTURES OF 2026-09-10 — the ones the
// operator was looking for, with the ids, clubs and scores ESPN reports.
// Read off the endpoint after the backend change, not invented: a
// renderer certified against numbers no provider sends is certified
// against nothing.
const UCL_FINISHED = [
  ["401915443", "Bayern Munich", "Bodo/Glimt", 5, 0],
  ["401915441", "Como", "RB Leipzig", 4, 1],
  ["401915442", "Manchester United", "Sabah FK", 4, 0],
  ["401915440", "Slavia Prague", "Lens", 2, 3],
  ["401915444", "Fenerbahce", "AS Roma", 1, 1],
  ["401915422", "PSV Eindhoven", "Shakhtar Donetsk", 1, 1],
] as const;

// A CUP HAS NO SEASON ARCHIVE, so every one of these rows carries
// `origin: "unavailable"` — the backend's third origin, which is NOT a
// failed reconstruction. That is what the live endpoint returns for
// these six, so it is what the fixture carries.
const CUP_LIMIT = {
  code: "cup_has_no_season_archive",
  why: "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind is keyed on "
    + "a LeagueSpec; a cup has neither a season file of its own nor a "
    + "table to rank inside.",
};

const finishedRow = (
  [eid, home, away, hs, as_]: readonly [string, string, string, number, number],
  i: number,
) => ({
  league: "ucl", espn: "uefa.champions",
  kind: "cup", event_id: eid, competition_id: eid,
  kickoff: hoursAgo(3 + i),
  home, away, status_detail: "FT",
  result: { home: hs, away: as_,
            winner: hs > as_ ? "home" : as_ > hs ? "away" : "draw",
            source: "espn_scoreboard" },
  pre_kickoff: {
    origin: "unavailable", origin_label: "NOT AVAILABLE",
    origin_note: CUP_LIMIT.why,
    captured_at: null, captured_seconds_before_kickoff: null,
    board_date: null, reconstructed_from: null,
    unavailable_reason: CUP_LIMIT.code,
    store_read: "ok", store_read_error: null,
    state: null,
  },
  shot_state: { at_20: null, before_first_goal: null, full_time: null,
                first_goal_minute: null, error: null },
  fit: { favourite_won: null,
         favourite_won_reason: "no_pre_kickoff_favourite",
         confirmed_at_20: null,
         confirm_reason: "no_pre_kickoff_favourite",
         confirm_rule: "tilt_fav_and_on_target_lead",
         confirm_note: "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED.",
         checkpoint_minute: 20 },
});

const reviewBase = {
  generated_at: new Date().toISOString(),
  date: "20260910", back: 7,
  window: { from: "20260903", to: "20260910" },
  store: { backend: "memory", writable: true },
  refusals: [],
};

const uclMeta = (over: Record<string, unknown> = {}) => ({
  finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
  error: null, kind: "cup", pre_kickoff_limit: CUP_LIMIT, ...over,
});

/** STATE 1 — asked, and none finished. A key, no error, no rows. */
const REVIEW_ASKED_EMPTY = {
  ...reviewBase, narrowed_to: ["ucl"],
  leagues: { ucl: uclMeta() }, finished: [],
};

/** The answer the operator was owed: asked, and six finished. */
const REVIEW_ASKED_SIX = {
  ...reviewBase, narrowed_to: ["ucl"],
  leagues: { ucl: uclMeta({ finished: 6, unavailable: 6 }) },
  finished: UCL_FINISHED.map(finishedRow),
};

/** STATE 2 — never asked. THE DECLARED SWEEP, exactly as a backend
 *  deployed behind this frontend answers when it drops `?leagues=`: 200,
 *  four other competitions' keys, no `ucl` key and no `narrowed_to`. */
const REVIEW_NEVER_ASKED = {
  ...reviewBase,
  leagues: Object.fromEntries(Object.keys(DECLARED_LEAGUES).map((k) => [
    k, { finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
         error: null, kind: "league" }])),
  finished: [],
};

/** STATE 3b — asked, and THIS competition's own read failed. */
const UCL_SCOREBOARD_ERROR =
  "ConnectionError: HTTPSConnectionPool(host='site.api.espn.com') — "
  + "scoreboard fetch failed for uefa.champions";
const REVIEW_ASKED_FAILED = {
  ...reviewBase, narrowed_to: ["ucl"],
  leagues: { ucl: uclMeta({ error: UCL_SCOREBOARD_ERROR }) },
  finished: [],
};

// ---- driving the page -------------------------------------------------

const NO_FIELD = { competition: "ucl", axes: null,
                   why_not: "no field is fitted for this competition" };

type Page = import("@playwright/test").Page;

/** Opens a picker route with EVERY backend route it can reach mocked,
 *  and captures the review request's URL so a test can assert what was
 *  asked rather than inferring it from what came back.
 *
 *  The catch-all is deliberate and it FAILS rather than forwards: a
 *  route this file did not anticipate reaching a live backend is how a
 *  hermetic spec becomes a spec about somebody's production data. */
async function open(page: Page, path: string,
                   board: unknown, review: unknown,
                   reviewStatus = 200) {
  const asked: string[] = [];
  // THE CATCH-ALL IS REGISTERED FIRST BECAUSE PLAYWRIGHT MATCHES ROUTES
  // IN REVERSE REGISTRATION ORDER — the LAST matching handler wins. A
  // catch-all added last swallows every route the specific handlers were
  // meant to answer, and the page then makes no request at all: twelve
  // tests failing on "the review was never asked", which reads exactly
  // like the bug they were written to catch. Order is load-bearing here.
  await page.route("**/api/**", (r) =>
    r.fulfill(json({ error: `unmocked backend route: ${r.request().url()}` },
                   599)));
  await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(NO_FIELD)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => {
    asked.push(r.request().url());
    return r.fulfill(json(review, reviewStatus));
  });
  await page.goto(path);
  return asked;
}

const tail = (page: Page, slug: string) =>
  page.locator(`[data-testid="review-tail"][data-league="${slug}"]`);

/** The review URL's `leagues` parameter, or null when it sent none.
 *  Waits for the request rather than reading a list that may still be
 *  empty — a bare read races the fetch and returns "asked nothing",
 *  which is exactly the bug this file is about. */
async function askedLeagues(asked: string[]): Promise<string | null> {
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  return new URL(asked[0]).searchParams.get("leagues");
}

// ============================ 1. the ask ================================

test.describe("the page asks the review the question it asks the board", () => {
  test("the Champions League page asks for the Champions League", async ({ page }) => {
    const asked = await open(page, "/bet-suggester/ucl",
                             UCL_BOARD, REVIEW_ASKED_SIX);
    expect(await askedLeagues(asked)).toBe("ucl");
  });

  test("the landing page asks for nothing, which is what keeps a removed competition off it",
    async ({ page }) => {
      // THE OMISSION IS THE MECHANISM. Pass a `leagues` here and the
      // backend's cache key changes, the answer carries `narrowed_to`,
      // and the payload stops being the operator's declaration.
      const asked = await open(page, "/bet-suggester",
                               DECLARED_BOARD, REVIEW_NEVER_ASKED);
      expect(await askedLeagues(asked)).toBeNull();
    });

  test("both halves of a narrowed page are about the same competition",
    async ({ page }) => {
      // The defect in one assertion: the board asked for `ucl` and the
      // review asked for nothing, so the two halves of the page were
      // about different competitions.
      const boardAsked: string[] = [];
      const reviewAsked: string[] = [];
      // catch-all FIRST — see `open` above for why the order decides
      // whether these handlers are ever reached
      await page.route("**/api/**", (r) => r.fulfill(json({}, 599)));
      await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(NO_FIELD)));
      await page.route("**/api/picker/board**", (r) => {
        boardAsked.push(r.request().url());
        return r.fulfill(json(UCL_BOARD));
      });
      await page.route("**/api/picker/review**", (r) => {
        reviewAsked.push(r.request().url());
        return r.fulfill(json(REVIEW_ASKED_SIX));
      });
      await page.goto("/bet-suggester/ucl");
      await expect.poll(() => boardAsked.length).toBeGreaterThan(0);
      await expect.poll(() => reviewAsked.length).toBeGreaterThan(0);
      expect(new URL(reviewAsked[0]).searchParams.get("leagues"))
        .toBe(new URL(boardAsked[0]).searchParams.get("leagues"));
    });
});

// ==================== 2. the six finished fixtures ======================

test("the six finished Champions League fixtures reach the finished section",
  async ({ page }) => {
    await open(page, "/bet-suggester/ucl", UCL_BOARD, REVIEW_ASKED_SIX);
    const t = tail(page, "ucl");
    // the collapsed header reports the count WITHOUT being opened —
    // that is the whole point of a collapsed section
    await expect(t.getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "matches");
    await expect(t.getByTestId("review-count"))
      .toContainText(`${UCL_FINISHED.length} matches`);
    await t.getByTestId("review-toggle").click();
    await expect(t.getByTestId("review-row"))
      .toHaveCount(UCL_FINISHED.length);
    // every fixture by name and by score, derived from the fixture list
    for (const [, home, away, hs, as_] of UCL_FINISHED) {
      const card = t.getByTestId("review-row")
        .filter({ hasText: home }).filter({ hasText: away });
      await expect(card).toHaveCount(1);
      await expect(card).toContainText(String(hs));
      await expect(card).toContainText(String(as_));
    }
    // and the empty state is NOT drawn beside them
    await expect(t.getByTestId("review-empty")).toHaveCount(0);
    await expect(t.getByTestId("review-unasked")).toHaveCount(0);
  });

// =================== 3. the three states, kept apart ====================

test.describe("three states, and no two of them render alike", () => {
  test("1 · asked, and none finished — a measurement, and it says so",
    async ({ page }) => {
      await open(page, "/bet-suggester/ucl", UCL_BOARD, REVIEW_ASKED_EMPTY);
      const t = tail(page, "ucl");
      await expect(t.getByTestId("review-toggle"))
        .toHaveAttribute("data-has", "none");
      await expect(t.getByTestId("review-count")).toContainText("0 matches");
      await t.getByTestId("review-toggle").click();
      await expect(t.getByTestId("review-empty"))
        .toContainText("No Champions League fixtures finished in the last 7 days");
      // …and it is the ONLY one of the three drawn
      await expect(t.getByTestId("review-unasked")).toHaveCount(0);
      await expect(t.getByTestId("review-league-error")).toHaveCount(0);
      await expect(t.getByTestId("review-error")).toHaveCount(0);
    });

  test("2 · never asked — the payload has no key, and the page does NOT say zero",
    async ({ page }) => {
      // THE REGRESSION THIS FILE EXISTS FOR. Before 2026-09-10 this
      // rendered `review-empty`: "No Champions League fixtures finished
      // in the last 7 days", with a header reading "0 matches", over a
      // window nobody measured.
      await open(page, "/bet-suggester/ucl", UCL_BOARD, REVIEW_NEVER_ASKED);
      const t = tail(page, "ucl");
      await expect(t.getByTestId("review-toggle"))
        .toHaveAttribute("data-has", "unasked");
      // the count must not claim a number it does not have
      await expect(t.getByTestId("review-count")).not.toContainText("0 matches");
      await expect(t.getByTestId("review-count")).toContainText("not read");
      await t.getByTestId("review-toggle").click();
      await expect(t.getByTestId("review-unasked"))
        .toContainText("did not cover Champions League");
      await expect(t.getByTestId("review-unasked"))
        .toContainText("least of all that none did");
      // THE EMPTY STATE IS ABSENT. A finding and the absence of one may
      // not share a rendering — the whole rule, in one assertion.
      await expect(t.getByTestId("review-empty")).toHaveCount(0);
      await expect(page.getByText(
        "No Champions League fixtures finished in the last 7 days"))
        .toHaveCount(0);
    });

  test("2 · …and it names WHY, because an unexplained blank is what this surface refuses",
    async ({ page }) => {
      await open(page, "/bet-suggester/ucl", UCL_BOARD, REVIEW_NEVER_ASKED);
      const t = tail(page, "ucl");
      await t.getByTestId("review-toggle").click();
      await expect(t.getByTestId("review-unasked-why"))
        .toContainText("asked the review for Champions League by name");
      await expect(t.getByTestId("review-unasked-why"))
        .toContainText("not a week in which nothing was played");
    });

  test("3a · asked, and the whole request failed — the backend's own words",
    async ({ page }) => {
      await open(page, "/bet-suggester/ucl", UCL_BOARD,
                 { detail: "picker review unavailable" }, 503);
      const t = tail(page, "ucl");
      await expect(t.getByTestId("review-toggle"))
        .toHaveAttribute("data-has", "unread");
      await t.getByTestId("review-toggle").click();
      await expect(t.getByTestId("review-error"))
        .toContainText("picker review unavailable");
      await expect(t.getByTestId("review-empty")).toHaveCount(0);
      await expect(t.getByTestId("review-unasked")).toHaveCount(0);
    });

  test("3b · asked, and THIS competition's read failed — named, not emptied",
    async ({ page }) => {
      await open(page, "/bet-suggester/ucl", UCL_BOARD, REVIEW_ASKED_FAILED);
      const t = tail(page, "ucl");
      await expect(t.getByTestId("review-toggle"))
        .toHaveAttribute("data-has", "unread");
      await t.getByTestId("review-toggle").click();
      await expect(t.getByTestId("review-league-error"))
        .toContainText("scoreboard fetch failed for uefa.champions");
      await expect(t.getByTestId("review-empty")).toHaveCount(0);
      await expect(t.getByTestId("review-unasked")).toHaveCount(0);
    });

  test("the three states have three distinct header tokens", async ({ page }) => {
    // DERIVED, not typed: the same page is served each of the three
    // payloads and the token it draws is collected. Three payloads must
    // produce three DIFFERENT tokens, or two states are one rendering.
    const seen: string[] = [];
    for (const body of [REVIEW_ASKED_EMPTY, REVIEW_NEVER_ASKED,
                        REVIEW_ASKED_FAILED]) {
      await open(page, "/bet-suggester/ucl", UCL_BOARD, body);
      const toggle = tail(page, "ucl").getByTestId("review-toggle");
      await expect(toggle).toBeVisible();
      seen.push(await toggle.getAttribute("data-has") ?? "");
      await page.unrouteAll();
    }
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).not.toContain("");
  });
});

// ============ 4. asking is still not declaring, on this payload =========

test("a narrowed review does not put a column on the landing page",
  async ({ page }) => {
    // The review payload's `leagues` key set is the door a finished
    // Leagues Cup once walked back through after being removed from the
    // board. A narrowed answer holds the slug that was ASKED ABOUT, in
    // exactly the shape a declaration has.
    const asked = await open(page, "/bet-suggester", DECLARED_BOARD, {
      ...reviewBase, narrowed_to: ["ucl"],
      leagues: { ucl: uclMeta({ finished: 6, unavailable: 6 }) },
      finished: UCL_FINISHED.map(finishedRow),
    });
    expect(await askedLeagues(asked)).toBeNull();
    // the columns are the BOARD's declaration, derived off the payload
    // the page was served — and its length asserted, because a set
    // comparison survives a lost duplicate
    const declared = Object.keys(DECLARED_BOARD.leagues);
    await expect(page.locator('[data-testid="league-col"]'))
      .toHaveCount(declared.length);
    for (const slug of declared) {
      await expect(page.locator(`[data-testid="league-col"][data-league="${slug}"]`))
        .toHaveCount(1);
    }
    await expect(page.locator('[data-testid="league-col"][data-league="ucl"]'))
      .toHaveCount(0);
  });

// ===================== 5. the proxy, unmocked ===========================

test("the picker proxy forwards the review's query parameters — unmocked on purpose",
  async ({ request }) => {
    // A NEW QUERY PARAMETER NEEDS NO ALLOWLIST ENTRY, and this proves it
    // rather than asserting it in a comment. `LEAGUE_PROXY_ALLOWED.picker`
    // gates the PATH; `pages/api/picker/[...path].ts` forwards
    // `req.url`'s query string verbatim. Every other test in this file
    // mocks in the BROWSER, so that handler is never exercised by them —
    // which is exactly how the comp proxy's allowlist 404'd a real
    // backend route on prod behind nine green specs.
    //
    // THE DEADLINE IS A BUDGET. /api/picker/review is the most expensive
    // route on the surface (measured 9.1s cold); `test.slow()` triples
    // it for this test alone. The assertion is untouched, and a proxy
    // that refuses the route still fails instantly because the refusal
    // is authored here, not upstream.
    test.slow();
    const r = await request.get("/api/picker/review?back=1&leagues=ucl&shots=false");
    expect(await r.text(), "review with a query parameter rejected by the allowlist")
      .not.toContain("unknown picker route");
  });

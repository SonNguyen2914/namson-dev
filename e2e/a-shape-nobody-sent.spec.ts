import { expect, test } from "@playwright/test";

// SIX READS THAT TOOK THE WHOLE PAGE DOWN, one shape each.
//
// WHAT THIS IS AND WHAT IT IS NOT. Today's backend cannot emit these
// shapes — `position.py` always rounds `percent` before it writes it and
// always passes a list where a list is read — so none of these is a
// live crash and this file must not be read as reporting one. It is
// DEFENCE IN DEPTH, and the reason it is worth having is written on the
// route that produces the payload: api/main.py promises that "one dead
// artifact, provider or table degrades ITS OWN block with a named
// reason, never the match, never the strip and never a 500", and keeps
// that promise per block — while the surface drawing it had, until
// 2026-09-11, no isolation of any kind. An unguarded `.toFixed` on a
// key the payload did not carry turned a degraded block into
// `Application error: a client-side exception has occurred`, with
// `document.body.innerText` down to 127 characters and the picker board
// and every league column gone with the strip.
//
// THE RULE EVERY TEST BELOW PINS IS THE SAME ONE, and it is this
// surface's oldest: MISSING IS NEVER ZERO. A branch drawn at 0.0%, a
// source counted as 0, a partial exit offering "0 sizes of one trade"
// are each a measurement nobody made — so the fix is never a `?? 0` and
// never a silent drop. It is a NAMED ABSENCE, and the section keeps
// drawing everything it could read around it.
//
// THE BOUNDARY IS NOT WHAT THESE MEASURE. It is pinned by
// e2e/a-straggler-is-not-news.spec.ts with a shape nobody guarded;
// every test here asserts the strip DREW, which is a stronger claim
// than "the page survived".
//
// HERMETIC. Every route the board touches is served here.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Page = import("@playwright/test").Page;

const LEAGUES = { mls: { src: "current", min_current_gp: 21, clubs: 30 } };

const BOARD = {
  generated_at: "2026-09-11T12:00:00Z", date: "20260911", days: 7,
  leagues: LEAGUES, rows: [], refusals: [],
};

const REVIEW = {
  generated_at: "2026-09-11T12:00:00Z", date: "20260911", back: 7,
  window: { from: "20260904", to: "20260911" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

// -------------------------------------------------------- the payloads
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY: every key is one
// api/main.py's watched-strip route emits, and the blocks a given test
// does not exercise are left ABSENT rather than invented — the card
// refuses those by name, which e2e/watched-strip.spec.ts already pins.

/** A held position with both branch blocks, at the shape
 *  `position.evaluate()` writes them. `branches` and `percent` are
 *  parameters because they are what these tests deform. */
const position = (branches: unknown, sellBranches: unknown) => ({
  position: {
    outcome_key: "home_win", side: "home", size: "100",
    entry_price: 0.46, entry_cost_dollars: "46.00",
  },
  value_now_cents: 7784.0,
  value_at_settlement_cents: 7770.0,
  branch_view: {
    hold: {
      conditioned_grid: {
        label: "hold to settlement, conditioned grid cell",
        expectation_dollars: "77.70", expectation_cents: 7770.0,
        branches,
      },
    },
    sell: {
      label: "sell into the live bid",
      expectation_dollars: "77.84", expectation_cents: 7784.0,
      branches: sellBranches,
    },
  },
});

const GOOD_BRANCHES = [
  { outcome: "settles YES — $1.00 a contract", probability: 0.777,
    percent: 77.7, dollars: "100.00", cents: 10000.0 },
  { outcome: "settles NO — $0.00 a contract", probability: 0.223,
    percent: 22.3, dollars: "0.00", cents: 0.0 },
];

const SELL_BRANCHES = [
  { outcome: "certain — the bid is hit at this tick", probability: 1.0,
    percent: 100.0, dollars: "77.84", cents: 7784.0 },
];

const match = (positions: unknown[]) => ({
  fixture_id: 101, competition_slug: "mls-2026",
  home: "Austin FC", away: "St. Louis City SC",
  espn_event_id: "401882901",
  state: {
    in_play: true, minute: 65, score_home: 2, score_away: 1,
    clock_display: "65'", match_state: "in", refusals: [],
    captured_at: "2026-09-11T21:05:00Z",
  },
  positions,
});

const envelope = (over: Record<string, unknown> = {}) => ({
  version: "watched-strip-v1",
  generated_at: "2026-09-11T21:05:15Z",
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {}, policy_codes: {},
  matches: [match([position(GOOD_BRANCHES, SELL_BRANCHES)])],
  ...over,
});

const strip = (page: Page) => page.getByTestId("watched-strip");

async function open(page: Page, body: unknown) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/comp/*/fixtures**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/live-watchlist**", (r) =>
    r.fulfill(json({
      version: "watchlist-v1", generated_at: "2026-09-11T21:05:00Z",
      monitored_fixture_ids: [], monitored_by_source: {},
      coverage: [], open_positions_not_monitored: [], log: [],
      registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
    })));
  await page.route("**/api/bet-suggester/live-watchlist/resolve**", (r) =>
    r.fulfill(json({ resolved: {}, notes: {}, asked: 0,
                     unreadable_references: [] })));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json(body)));
  await page.goto("/bet-suggester");
  // THE SECTION DREW. Every test here depends on this being a stronger
  // statement than "the page did not die", so it is asserted first and
  // by visibility rather than by count.
  await expect(strip(page)).toBeVisible({ timeout: 30_000 });
  // AND IT IS THE SECTION, NOT THE BOUNDARY STANDING IN FOR IT.
  await expect(page.getByTestId("watched-strip-boundary")).toHaveCount(0);
}

/** The board below the strip is alive on every one of these — the
 *  page-level harm, checked every time rather than once. */
async function boardSurvives(page: Page) {
  await expect(page.getByTestId("board-rank-heading")).toBeVisible();
  expect(await page.locator("body").innerText())
    .not.toContain("Application error");
}

// ------------------------------------------------- the branch percents

test("a branch with no `percent` is a NAMED absence, never 0.0%",
  async ({ page }) => {
    // `b.percent.toFixed(1)` read straight off the payload in both the
    // hold block and the sell block. A branch carrying no percent — or
    // a null one — raised out of render and took the page with it.
    await open(page, envelope({ matches: [match([position(
      [{ outcome: "settles YES — $1.00 a contract", dollars: "100.00" },
       { outcome: "settles NO — $0.00 a contract", percent: null,
         dollars: "0.00" }],
      SELL_BRANCHES)])] }));
    await boardSurvives(page);
    // BOTH BRANCHES ARE STILL DRAWN — the 2026-09-02 card was reported
    // for collapsing the branches, so losing them to a missing percent
    // would be the same defect by another route.
    const rows = strip(page).getByTestId("watched-branch");
    await expect(rows).toHaveCount(3);   // two hold branches + one sell
    const named = strip(page).getByTestId("watched-branch-no-percent");
    await expect(named).toHaveCount(2);
    // AND NOTHING IS DRAWN AT ZERO. The lookbehind is load-bearing:
    // `toContain("0.0%")` matches inside the sell branch's own 100.0%,
    // so the plain substring would have been red against a correct
    // build for a reason that has nothing to do with the rule.
    expect(await strip(page).innerText()).not.toMatch(/(?<![\d.])0\.0%/);
    // the outcome the payload DID carry still prints beside it
    await expect(strip(page)).toContainText("settles YES");
  });

test("a `branches` that is not a list refuses by name and draws no rows",
  async ({ page }) => {
    // `hold?.branches ? … : …` was TRUTHY for an object, a string and a
    // number alike, and then called `.map` on it.
    await open(page, envelope({ matches: [match([position(
      { "0": "not a list" }, "also not a list")])] }));
    await boardSurvives(page);
    await expect(strip(page).getByTestId("watched-branch")).toHaveCount(0);
    await expect(strip(page)).toContainText("no branch view on this payload");
    await expect(strip(page)).toContainText("no sell branch on this payload");
  });

// -------------------------------------------------- the partial exit

test("a partial exit with no `fractions` says the list is missing, not "
   + "that there are none", async ({ page }) => {
    // `pe.fractions.length` and `pe.fractions.map` both read straight
    // off the payload. Folding the absence to `[]` would have printed
    // "0 sizes of one trade" — a measurement nobody made.
    const p = position(GOOD_BRANCHES, SELL_BRANCHES) as
      Record<string, unknown>;
    p.partial_exit = {
      applies: true,
      rule: "one trade, four sizes — not a menu",
      fractions_priced: 0,
      book: { source: "kalshi_depth", quote_id: 7 },
      not_a_recommendation: "four priced sizes are not four suggestions",
    };
    await open(page, envelope({ matches: [match([p])] }));
    await boardSurvives(page);
    const pe = strip(page).getByTestId("watched-partial-exit");
    await expect(pe).toBeVisible();
    await expect(pe).toHaveAttribute("data-fractions", "unreadable");
    await expect(pe).toContainText("a fraction list this payload did not carry");
    expect(await pe.innerText()).not.toContain("0 sizes");
  });

// ------------------------------------------------- the match list

test("an entry in `matches` that is not a match block is COUNTED and "
   + "named, and the matches beside it still draw", async ({ page }) => {
    // `isInPlay` read `m.state` on every entry, so one hole in the list
    // unmounted the page. Filtering the hole out silently would be the
    // other failure: a match that drops off this section without a word
    // is the defect the whole stage was reported for, and the count
    // under each heading would quietly stop being the length of the
    // list the payload sent.
    await open(page, envelope({ matches: [
      match([position(GOOD_BRANCHES, SELL_BRANCHES)]), null,
      { competition_slug: "mls-2026", home: "?", away: "?" },
    ] }));
    await boardSurvives(page);
    await expect(page.getByTestId("watched-match")).toHaveCount(1);
    const said = page.getByTestId("watched-undrawable");
    await expect(said).toBeVisible();
    await expect(said).toHaveAttribute("data-count", "2");
    await expect(said).toContainText("not a match block");
  });

// ------------------------------------------------- the source counts

test("a `monitored_by_source` value that is not a list is named where "
   + "its count would have gone", async ({ page }) => {
    // `bySource[k].length` read straight off the payload. The counts
    // line is the one place this surface promises never to TOTAL two
    // sets; a source whose set cannot be read must not contribute a
    // plausible number to it either.
    await open(page, envelope({
      monitored_by_source: { manual: [101], open_position: 3 } }));
    await boardSurvives(page);
    const sources = page.getByTestId("watched-sources");
    await expect(sources).toContainText("manual 1");
    await expect(sources).toContainText("open position (not a list)");
  });

test("a `monitored_by_source` that is not a map at all says so, and does "
   + "NOT claim the payload carried no counts", async ({ page }) => {
    // `?? {}` folded a value of the wrong shape into "no source counts
    // on this payload", which is a statement about the SET rather than
    // about the read — the same fold this surface refuses everywhere
    // else.
    await open(page, envelope({ monitored_by_source: "manual:101" }));
    await boardSurvives(page);
    const sources = page.getByTestId("watched-sources");
    await expect(sources).toContainText("not a map on this payload");
    expect(await sources.innerText())
      .not.toContain("no source counts on this payload");
  });

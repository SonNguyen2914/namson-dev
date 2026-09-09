import { expect, test } from "@playwright/test";

// THE LIVE SURFACE — the things it was found saying on 2026-09-09, and
// the shape of each so a repeat cannot pass.
//
// Every assertion here failed against the build immediately before it.
// Where a rule is named ("no internal key reaches the reader"), the
// check is a SHAPE test over what the browser actually rendered, not a
// list of the values that happened to be wrong — the hand-typed list is
// the thing that was already missing entries in
// e2e/no-raw-slug-reaches-the-reader.spec.ts, whose own header claims a
// shape test and whose body loops over thirteen typed slugs.
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY. `competition_slug` here is
// the LIVE plane's spelling (backend src/live/competitions.py:
// mls-2026 / epl-2026 / la-liga-2026 / liga-mx-2026 /
// leagues-cup-2026), which is not the picker's, and that difference is
// the whole point of one of these tests.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const LEAGUES = { mls: { src: "current", min_current_gp: 21, clubs: 30 } };

const ROW = {
  refused: false, league: "mls",
  home: "Austin FC", away: "St. Louis City SC",
  favourite: "Austin FC", opponent: "St. Louis City SC", fav_side: "home",
  form: { fav: "WWDWW", opp: "LDLLW", scope: "mls", scope_is_cup: false },
  resolution: { "Austin FC": "exact", "St. Louis City SC": "exact" },
  ppg_gap: 1.16, gdg_gap: 1.3, rank_gap: 13,
  gp_current: { home: 26, away: 26, min: 26 },
  venue_class: { class: "DOMESTIC", home_side: "home" },
  src: "current", ranks: { fav: 4, opp: 17 },
  tiers: { ovr: [1, 5], atk: [1, 5], def: [2, 5] },
  tier_gaps: { ovr: 4, atk: 4, def: 3 }, shape: "CLEAN",
  event_id: "401882901", competition_id: "401882901",
  kickoff: "2026-12-10T20:30:00Z", espn: "usa.1", kalshi: null,
};

const BOARD = {
  generated_at: "2026-12-09T12:00:00Z", date: "20261209", days: 7,
  leagues: LEAGUES, rows: [ROW], refusals: [],
};
const REVIEW = {
  generated_at: "2026-12-09T12:00:00Z", date: "20261209", back: 7,
  window: { from: "20261202", to: "20261209" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

const ENVELOPE = {
  version: "watched-strip-v1",
  generated_at: "2026-12-10T21:05:12Z",
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {}, policy_codes: {},
};

/** A position, reduced to the blocks the card draws. */
function position(outcome: string, size: string, price: number,
                  worthCents: number) {
  return {
    journal_entry: { bet_id: 41, outcome_key: outcome },
    position: { outcome_key: outcome, side: "home", size,
      entry_price: price, entry_cost_dollars: "46.00" },
    value_now_cents: worthCents,
    certainty_premium: { applies: true, sell: { bid_cents: 77 } },
    exit_is_obtainable: { obtainable: true },
    exit_lines: { version: "exit-lines-v1",
      lines: [{ name: "exposure", asked: true, fired: true,
        reads: "+8.0 vs frozen", against: ">= your +6" }],
      fired: ["exposure"], summary: { says: "exposure fired" } },
  };
}

/** In play, with whatever the caller wants overridden. `espn_event_id`
 *  defaults to one the board does NOT carry, because that is the
 *  ordinary case for a match under way: the picker board is pre-kickoff
 *  by design (src/picker/board.fixtures_from_scoreboard defaults to
 *  states=("pre",)), so a fixture leaves it at kickoff. */
function liveMatch(over: Record<string, unknown> = {}) {
  return {
    fixture_id: 101, competition_slug: "mls-2026",
    home: "Austin FC", away: "St. Louis City SC",
    espn_event_id: "no-such-row-on-the-board",
    state: {
      in_play: true, minute: 65, score_home: 2, score_away: 1,
      clock_display: "65'", match_state: "in", refusals: [],
      captured_at: "2026-12-10T21:05:00Z",
    },
    positions: [],
    ...over,
  };
}

type Page = import("@playwright/test").Page;

async function open(page: Page, matches: unknown[]) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**",
    (r) => r.fulfill(json({ ...ENVELOPE, matches })));
  await page.goto("/bet-suggester");
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
}

// --------------------------------------------------------------------
// 1. NO INTERNAL KEY REACHES THE READER, on either live surface.
//
// THE DEFECT: `LiveCard` printed `m.competition_slug` raw whenever the
// board carried no row for the fixture — which is the ordinary case
// above — and `WatchedStrip` printed it raw on the identity line of
// EVERY row. The operator's own ledger said `mls-2026`.
//
// THE CHECK IS A SHAPE TEST, over the text the browser rendered. A
// display name cannot look like a slug: slugs are lower-case with no
// space, and these carry a four-digit season as well. "MLS", "La Liga"
// and "Liga MX" all pass; `mls-2026` and `liga-mx-2026` cannot.
// --------------------------------------------------------------------

const LOOKS_LIKE_A_SLUG = /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/;

test("no live-plane competition slug reaches the reader, on the card or "
   + "on the strip", async ({ page }) => {
  await open(page, [
    liveMatch(),
    liveMatch({ fixture_id: 202, competition_slug: "liga-mx-2026",
      home: "Tigres UANL", away: "Club América" }),
    liveMatch({ fixture_id: 303, competition_slug: "la-liga-2026",
      home: "Real Betis", away: "Sevilla" }),
  ]);

  // the card's own competition line, per card
  const comps = await page.locator('[data-testid="live-strip"] > span:first-child')
    .evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim()));
  expect(comps.length, "no live card was drawn — this test would pass "
    + "over an empty set").toBeGreaterThan(2);
  for (const c of comps) {
    expect(LOOKS_LIKE_A_SLUG.test(c),
      `the live card's competition line reads "${c}", which has the shape `
      + "of an internal key rather than a name").toBe(false);
  }

  // and the strip's identity line
  const strip = await page.getByTestId("watched-comp")
    .evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim()));
  expect(strip.length, "no watched row was drawn").toBeGreaterThan(2);
  for (const c of strip) {
    expect(LOOKS_LIKE_A_SLUG.test(c),
      `the watched strip's identity line reads "${c}", which has the `
      + "shape of an internal key rather than a name").toBe(false);
  }
});

// --------------------------------------------------------------------
// 2. A SECOND POSITION ON A MATCH IS NOT INVISIBLE.
//
// THE DEFECT: `LiveCard` draws `positions[0]` — the hazard, the
// figures and the exit lines are all that one's — and said nothing at
// all about the rest, while the watched strip on the same page drew
// every one of them. One page, two answers to "what am I holding on
// this match", and the smaller one printed beside the live score.
// --------------------------------------------------------------------

test("a match with two open positions says so on the card", async ({ page }) => {
  await open(page, [liveMatch({ positions: [
    position("home_win", "100", 0.46, 7784),
    position("draw", "250", 0.21, 1200),
  ] })]);
  const card = page.locator('[data-testid="live-card"][data-fixture="101"]');
  const more = card.getByTestId("live-position-more");
  await expect(more).toBeVisible();
  // THE COUNT IS THE PAYLOAD'S, and the drawn one is named — a reader
  // has to be able to tell which position the figures above belong to.
  await expect(more).toContainText("2 positions");
  await expect(more).toContainText("home_win");
  // AND IT IS NOT A STANDING SENTENCE. One position draws no such line;
  // otherwise this is a whole-surface fact on every card, which is the
  // complaint that produced half of this file.
  await open(page, [liveMatch({ positions: [
    position("home_win", "100", 0.46, 7784)] })]);
  await expect(page.locator('[data-testid="live-card"][data-fixture="101"]')
    .getByTestId("live-position-more")).toHaveCount(0);
});

// --------------------------------------------------------------------
// 3. THE LABEL IS IN THE RULE, AND ONLY THERE.
//
// THE DEFECT: the not-held branch carried its own `position` label,
// directly under `Rule label="position"`, so the word printed twice one
// line apart — on every card with nothing held, which is most of them.
// --------------------------------------------------------------------

test("the position block does not print its own heading twice",
  async ({ page }) => {
  await open(page, [liveMatch({ positions: [] })]);
  const card = page.locator('[data-testid="live-card"][data-fixture="101"]');
  await expect(card.getByTestId("live-position")).toHaveAttribute(
    "data-held", "false");
  // DERIVED, not a search for one string: whatever the rule above the
  // block says, the block below it must not repeat.
  const text = (await card.getByTestId("live-position")
    .evaluate((e) => (e as HTMLElement).innerText)).toLowerCase();
  expect(text, `the position block reads "${text}" directly under a rule `
    + 'labelled "position"').not.toContain("position");
});

// --------------------------------------------------------------------
// 4. A 502 THE PROXY AUTHORED FOR A BACKEND THAT ANSWERED IS NOT
//    "NOTHING ANSWERED THE READ".
//
// THE DEFECT: pages/api/bet-suggester/watched-strip.ts returns 502 for
// two opposite findings and labels them apart in `error`. The surface
// sorted on the STATUS, so `proxy_body_unreadable` — whose own body
// says "THE BACKEND WAS REACHED: this is not `proxy_unreachable`" —
// rendered under the headline "Nothing answered the read", with "The
// read did not get past the proxy" beneath it. The proxy's own comment
// predicted this defect and then produced it.
// --------------------------------------------------------------------

const BODY_UNREADABLE = {
  error: "proxy_body_unreadable", upstream_status: 200,
  detail: "the strip's backend answered 200 and the body could not be "
    + "read to the end, so there is nothing to relay. THE BACKEND WAS "
    + "REACHED: this is not `proxy_unreachable`, not a refusal, and not "
    + "an empty watchlist",
};

async function gate(page: Page, body: unknown, status: number) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**",
    (r) => r.fulfill(json(body, status)));
  await page.goto("/bet-suggester");
  const g = page.getByTestId("watched-strip-gate");
  await g.waitFor({ timeout: 15_000 });
  return g;
}

test("a body-unreadable 502 does not claim nothing answered",
  async ({ page }) => {
  const g = await gate(page, BODY_UNREADABLE, 502);
  await expect(g).toHaveAttribute("data-kind", "body_unreadable");
  const text = (await g.textContent()) ?? "";
  // THE EVIDENCE IS STILL PRINTED — the status and the backend's own
  // sentence, verbatim. What must not survive is the claim beside it.
  expect(text).toContain("502");
  expect(text).toContain("THE BACKEND WAS REACHED");
  expect(text, "the surface says nothing answered, directly above a "
    + "sentence saying the backend was reached")
    .not.toContain("Nothing answered the read");
  expect(text, "the surface says the read did not get past the proxy, "
    + "over a body that says it did")
    .not.toContain("did not get past the proxy");
});

test("a proxy that genuinely never reached the backend still says so",
  async ({ page }) => {
  // NON-VACUITY, AND THE OTHER DIRECTION: the branch that was right is
  // still right. A labelled `proxy_unreachable` keeps its sentence.
  const g = await gate(page, { error: "proxy_unreachable",
    detail: "the strip's backend was never reached, so there is no "
      + "answer to relay — this is not a refusal and not an empty "
      + "watchlist" }, 502);
  await expect(g).toHaveAttribute("data-kind", "unreachable");
  await expect(g).toContainText("Nothing answered the read");
});

// --------------------------------------------------------------------
// 5. THE GATE IS HONEST IN BOTH DIRECTIONS.
//
// NO DEFECT FOUND — this is the check that would have caught one. A
// held token refused by the read must never render as "no token is
// held", and a failure that is not a gate at all must never render as
// either.
// --------------------------------------------------------------------

test("a 403 says which of the two it is, and a 500 says it is neither",
  async ({ page }) => {
  const g = await gate(page, { detail: "operator credentials required" }, 403);
  await expect(g).toHaveAttribute("data-kind", "needs_token");
  await expect(g).toHaveAttribute("data-token-held", "false");

  // the same 403, with a token typed into the panel on this page
  const panel = page.getByTestId("watch-panel");
  if (!(await panel.evaluate((d) => (d as HTMLDetailsElement).open))) {
    await panel.locator("summary").click();
  }
  await page.locator("#watch-token").fill("a-token-the-backend-refuses");
  await expect(g).toHaveAttribute("data-kind", "token_refused");
  await expect(g).toHaveAttribute("data-token-held", "true");
  await expect(g).not.toContainText("no token is held");

  // and a failure that is not a gate is not sorted into one
  const h = await gate(page, { detail: "boom" }, 500);
  await expect(h).toHaveAttribute("data-kind", "unexpected_status");
  await expect(h).not.toContainText("no token is held");
  await expect(h).not.toContainText("was refused by the read");
});

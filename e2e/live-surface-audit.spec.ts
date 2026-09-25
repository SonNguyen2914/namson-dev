import { expect, test } from "@playwright/test";
import { armToken } from "./operator-token";
// THE STRIP IS SERVED AS `watched-strip-v2` (backend #129). The
// fixtures below stay the shape RECORDED off this route and `toV2`
// applies the route's OWN hoist to them at the serve site, so the
// v2 payload under test is a transformation of a real one rather
// than a v2 shape typed into this file. See e2e/standing.ts.
import { toV2 } from "./standing";

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
//
// ─────────────────────────────────────────────────────────────────────
// WHAT THIS FILE LOST ON 2026-09-15, AND WHY IT IS REPORTED RATHER THAN
// QUIETLY DROPPED.
//
// `<WatchedStrip />` came off the landing page ("it is operator-gated,
// and with no token held in an ordinary tab it could only ever draw its
// own refusal"). The component is not mounted on any route now, so the
// strip is not a surface a spec can reach at all.
//
// TWO TESTS WENT WITH IT. Both were about `watched-strip-gate`, which is
// the strip's own element:
//
//   · "a body-unreadable 502 does not claim nothing answered" — the
//     proxy returns 502 for two OPPOSITE findings and labels them apart
//     in `error`; the surface sorted on the STATUS, so a body whose own
//     words say "THE BACKEND WAS REACHED" rendered under the headline
//     "Nothing answered the read".
//   · "a 403 says which of the two it is, and a 500 says it is neither"
//     — a held token REFUSED by the read must never render as "no token
//     is held", and a failure that is not a gate must render as
//     neither.
//
// NOTHING COVERS EITHER CLAIM NOW. `e2e/watched-strip.spec.ts` tests the
// same component and has no page to mount it on either. And the gap is
// wider than these two tests: `LiveCard`'s own comment says it
// deliberately does NOT draw a failed or refused read "because
// WatchedStrip is mounted on the same page against the same gate and
// renders it with the status and the backend's own sentence" — a
// premise that is now false. So a 403, a 502 or a 500 on
// /api/bet-suggester/watched-strip currently renders NOTHING on the
// landing page: a failed read drawn as an empty slate, which is the one
// shape this tree exists to refuse. Reported to the operator as a src
// fix; it cannot be asserted from here without asserting the defect.
// ─────────────────────────────────────────────────────────────────────

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
    (r) => r.fulfill(json(toV2({ ...ENVELOPE, matches }))));
  await page.goto("/bet-suggester");
  // operator-only since audit F4: no token, no strip read, no section
  await armToken(page);
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

test("no live-plane competition slug reaches the reader, anywhere on the "
   + "page", async ({ page }) => {
  const matches = [
    liveMatch(),
    liveMatch({ fixture_id: 202, competition_slug: "liga-mx-2026",
      home: "Tigres UANL", away: "Club América" }),
    liveMatch({ fixture_id: 303, competition_slug: "la-liga-2026",
      home: "Real Betis", away: "Sevilla" }),
  ];
  await open(page, matches);

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

  /* AND NOWHERE ELSE ON THE PAGE. The second half of this test read the
     watched strip's own identity line until the strip came off the
     landing page (see the note at the top of this file); the RULE it
     enforced is not the strip's, it is the reader's, so it is made over
     the whole rendered page instead — which is a stronger check than the
     one it replaces and does not depend on which surfaces are mounted.
     DERIVED from the payload's own slugs, never a list typed here: the
     hand-typed list is the thing already found missing entries in
     e2e/no-raw-slug-reaches-the-reader.spec.ts. */
  const slugs = [...new Set(matches.map((m) => m.competition_slug))];
  expect(slugs.length, "the payload carries no slugs to look for")
    .toBeGreaterThan(2);
  const pageText = await page.locator("body").innerText();
  expect(pageText.length, "nothing was rendered — the sweep proved nothing")
    .toBeGreaterThan(200);
  for (const slug of slugs) {
    expect(pageText, `the live-plane key "${slug}" is on the page`)
      .not.toContain(slug);
  }
  // NON-VACUITY: the clubs those slugs arrived with ARE on the page, so
  // the sweep is looking at the right render.
  for (const m of matches) expect(pageText).toContain(m.home);
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

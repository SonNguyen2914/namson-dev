import { expect, test } from "@playwright/test";

// THE VENUE-AWARE FAVOURITE, ON A FRONTEND THAT HAD NEVER HEARD OF IT.
//
// The backend has carried two keys on every rated row since 2026-09-03
// (src/picker/stages.py): `venue_favourite`, what a venue-aware rule
// WOULD say about the fixture, and `fav_source`, which rule actually
// named the favourite the row is signed from. They exist so the rule's
// disagreement with the league table is COUNTABLE BEFORE anyone turns it
// on — that is the whole design, and the flip is env-gated for the same
// reason.
//
// `BoardRow` declared neither. So the annotation was invisible on every
// column of the board, and the disagreement the rule exists to make
// countable was counted nowhere. On the live board of 2026-09-08 it
// disagrees on 27 of 108 rows.
//
// WHAT THIS FILE PINS, and the decision behind each:
//
//  1. A DISAGREEMENT IS CARRIED, NOT DRAWN. A quarter of the rows
//     disagree; a chip on a quarter of the cards would read as a second
//     favourite, and the rule is OFF — nothing on those rows moved. So
//     it rides `data-venue-disagrees` and the venue badge's own
//     sentence, the same contract `data-season-departure` keeps: the
//     derivation outlives the ink, and an ordinary row asserts nothing.
//  2. A REFUSAL IS NOT A DISAGREEMENT. Every cross-league cup row
//     refuses with `no_gdg_gap` — the gap the venue would be weighed
//     against was itself withheld — and the six verdict sub-keys are
//     absent by construction. A reader of that shape must not get a
//     verdict, and the card must not mark it.
//  3. THE FLIPPED ROW IS DRAWN, and it is the one case where silence
//     would be a lie: with the policy on, every signed figure on the
//     card is read from a side the table rates LOWER, so a negative gap
//     is the row stating that rather than a sign bug. No board serves
//     this today, which is exactly why it needs a guard now.
//
// Hermetic: both payloads are served by page.route.

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

const inHours = (h: number) => {
  const base = Date.UTC(2026, 11, 15, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
};

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
};

const DOMESTIC = { class: "DOMESTIC", home_side: "home" };

const row = (over: Record<string, unknown>) => ({
  refused: false, fav_side: "home", resolution: {}, src: "current",
  kalshi: null, reg_time_note: null, gap_note: null, cross_league: false,
  gp_current: { home: 12, away: 12, min: 12 },
  weights: { home: 0.55, away: 0.55, min: 0.55, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  ranks: { fav: 1, opp: 8 },
  tiers: { ovr: [1, 3], atk: [1, 3], def: [1, 3] },
  tier_gaps: { ovr: 2, atk: 2, def: 2 }, shape: "CLEAN",
  ppg_gap: 0.8, gdg_gap: 1.2, rank_gap: 7,
  league: "mls", column: "mls", espn: "usa.1",
  rated_in: { home: "mls", away: "mls" },
  venue: { name: "Ground", city: "Austin", country: "USA" },
  venue_class: DOMESTIC,
  fav_source: "rank",
  ...over,
});

/** The rule and the table name the same club. Most rows are this. */
const AGREES = row({
  home: "Agree Home", away: "Agree Away",
  favourite: "Agree Home", opponent: "Agree Away",
  event_id: "v-agree", competition_id: "v-agree", kickoff: inHours(6),
  venue_favourite: {
    refused: false, venue_class: "DOMESTIC", home_side: "home",
    gdg_gap_abs: 1.2, threshold: 0.36, threshold_source: "derived",
    policy: "off", favourite: "Agree Home", side: "home",
    agrees: true, reason: "favourite_already_at_home", flipped: false,
  },
});

/** THE DISAGREEMENT. The table's favourite is the away side; the venue
 *  would name the home one, because the gap between them is under the
 *  bar derived from this league's own goals per game. The policy is OFF,
 *  so the row is still signed from the table's favourite. */
const DISAGREES = row({
  home: "Venue Home", away: "Table Away", fav_side: "away",
  favourite: "Table Away", opponent: "Venue Home",
  ranks: { fav: 4, opp: 6 }, ppg_gap: 0.1, gdg_gap: 0.28, rank_gap: 2,
  event_id: "v-disagree", competition_id: "v-disagree", kickoff: inHours(7),
  venue_favourite: {
    refused: false, venue_class: "DOMESTIC", home_side: "home",
    gdg_gap_abs: 0.28, threshold: 0.36, threshold_source: "derived",
    policy: "off", favourite: "Venue Home", side: "home",
    agrees: false, reason: "venue_outweighs_table_gap", flipped: false,
  },
});

/** THE NAMED REFUSAL, in the shape the backend actually emits for a
 *  cross-league cup row: four keys and no verdict at all. */
const REFUSED = row({
  league: "leaguescup", column: "leaguescup", espn: "concacaf.leagues.cup",
  home: "Cross Home", away: "Cross Away",
  favourite: "Cross Home", opponent: "Cross Away",
  cross_league: true, rated_in: { home: "mls", away: "ligamx" },
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  gap_note: "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld.",
  venue_class: { class: "TRUE_HOME", home_side: "home" },
  event_id: "v-refused", competition_id: "v-refused", kickoff: inHours(8),
  venue_favourite: {
    refused: true, reason: "no_gdg_gap", policy: "off", flipped: false,
    venue_class: "TRUE_HOME", home_side: "home",
  },
});

/** THE POLICY ON. `fav_source` is "venue", the favourite is the club the
 *  table rates lower, and every signed figure below is read from that
 *  side — hence the negative gaps, which are the row telling the truth. */
const FLIPPED = row({
  league: "epl", column: "epl", espn: "eng.1",
  rated_in: { home: "epl", away: "epl" },
  home: "Flipped Home", away: "Better Away",
  favourite: "Flipped Home", opponent: "Better Away",
  fav_side: "home", fav_source: "venue",
  ranks: { fav: 9, opp: 6 }, ppg_gap: -0.2, gdg_gap: -0.3, rank_gap: -3,
  tiers: { ovr: [3, 2], atk: [3, 2], def: [3, 2] },
  tier_gaps: { ovr: -1, atk: -1, def: -1 }, shape: "HOLLOW",
  event_id: "v-flipped", competition_id: "v-flipped", kickoff: inHours(9),
  venue_favourite: {
    refused: false, venue_class: "DOMESTIC", home_side: "home",
    gdg_gap_abs: 0.3, threshold: 0.36, threshold_source: "derived",
    policy: "on", favourite: "Flipped Home", side: "home",
    agrees: false, reason: "venue_outweighs_table_gap", flipped: true,
  },
});

/** THE OLDER PAYLOAD. Neither key on the row at all — the board served
 *  exactly this before 2026-09-03, and a bookmarked deployment may still.
 *  It must render like any other row and claim nothing. */
const NO_KEYS = row({
  league: "laliga", column: "laliga", espn: "esp.1",
  rated_in: { home: "laliga", away: "laliga" },
  home: "Old Home", away: "Old Away",
  favourite: "Old Home", opponent: "Old Away",
  event_id: "v-nokeys", competition_id: "v-nokeys", kickoff: inHours(10),
  fav_source: undefined, venue_favourite: undefined,
});

const BOARD = {
  generated_at: "2026-09-08T12:00:00Z",
  date: "20260908", days: 7,
  leagues: LEAGUES,
  rows: [AGREES, DISAGREES, REFUSED, FLIPPED, NO_KEYS],
  refusals: [],
};

const EMPTY_REVIEW = {
  generated_at: "2026-09-08T12:00:00Z",
  date: "20260908", back: 7,
  window: { from: "20260901", to: "20260908" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

async function open(page: import("@playwright/test").Page,
                    board: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(EMPTY_REVIEW)));
  await page.goto("/bet-suggester");
}

const card = (page: import("@playwright/test").Page, event: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${event}"]`);

test("a venue rule that disagrees is carried on the row and said on the badge",
  async ({ page }) => {
    await open(page);
    const c = card(page, "v-disagree");
    await expect(c).toHaveCount(1);
    // CARRIED: the club the rule would name instead, on the card
    await expect(c).toHaveAttribute("data-venue-disagrees", "Venue Home");
    // and the row is still signed from the TABLE's favourite
    await expect(c).toHaveAttribute("data-fav-source", "rank");
    await expect(c.getByTestId("fav-source-venue")).toHaveCount(0);

    /* SAID, on the one element that is already about the venue. It names
       the club, the two numbers the rule compared, and — the part that
       keeps this decision-safe — that the rule is off and nothing on the
       card is signed to it. */
    const badge = c.getByTestId("home-badge");
    await expect(badge).toHaveCount(1);
    const title = (await badge.getAttribute("title")) || "";
    expect(title).toContain("Venue Home");
    expect(title).toContain("0.28");
    expect(title).toContain("0.36");
    expect(title).toMatch(/switched off/);
    expect(title).toMatch(/does NOT act on/);
  });

test("an agreeing row, a refused one and an older payload all claim NOTHING",
  async ({ page }) => {
    /* THREE SHAPES THAT MUST NOT BE MARKED, for three different
       reasons: the rule agreed; the rule refused by name because the gap
       it needs was withheld; and the payload predates the rule. All
       three carry no attribute at all rather than one asserting
       agreement — an absent mark is a fact, a present one saying "no"
       is a claim. */
    await open(page);
    for (const [event, why] of [
      ["v-agree", "the rule agreed"],
      ["v-refused", "the rule refused: no_gdg_gap"],
      ["v-nokeys", "the payload carries neither key"],
    ] as const) {
      const c = card(page, event);
      await expect(c, why).toHaveCount(1);
      expect(await c.getAttribute("data-venue-disagrees"), why).toBeNull();
      await expect(c.getByTestId("fav-source-venue"), why).toHaveCount(0);
    }
    // the older payload carries no source claim either
    expect(await card(page, "v-nokeys").getAttribute("data-fav-source"))
      .toBeNull();
    // while a modern agreeing row does say which rule named it
    await expect(card(page, "v-agree"))
      .toHaveAttribute("data-fav-source", "rank");
    // and the refused row still renders everything else it should —
    // the refusal costs the annotation, not the card
    await expect(card(page, "v-refused").getByTestId("rated-in"))
      .toBeVisible();
  });

test("a row the VENUE named says so, because every signed number on it changed side",
  async ({ page }) => {
    /* No board serves this today: the flip is env-gated and off. That is
       precisely why it is guarded — a card whose gaps all went negative
       with no word for it would be a silent contradiction the first time
       anyone turns the policy on, and nothing would catch it. */
    await open(page);
    const c = card(page, "v-flipped");
    await expect(c).toHaveAttribute("data-fav-source", "venue");
    const chip = c.getByTestId("fav-source-venue");
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(/venue rule/i);
    const title = (await chip.getAttribute("title")) || "";
    expect(title).toContain("Flipped Home");
    // it explains the sign rather than leaving the reader to guess
    expect(title).toMatch(/negative gap/i);
    // and it does not dress an unmeasured rule as an edge
    expect(title).toMatch(/not a measured edge/i);
    // the negative rank gap really is on the card
    await expect(c).toContainText("rank −3");
  });

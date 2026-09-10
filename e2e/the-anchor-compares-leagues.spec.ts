import { expect, test } from "@playwright/test";

/* THE HEADLINE ON A CROSS-LEAGUE CARD.
 *
 * WHAT THIS EXISTS TO STOP, in the operator's own screenshot: Manchester
 * United v Sabah FK — field ranks #7 v #33 of 36, shape CLEAN, the most
 * lopsided tie on the board — printed **−1.32** as its headline. That
 * figure was `own_gdg`: each club's GD/g WITHIN ITS OWN LEAGUE,
 * differenced. Sabah dominate the Azerbaijani league; United do not
 * dominate the Premier League by as much; so the number inverted on the
 * one fixture whose direction nobody could argue with.
 *
 * It is the same family as the `1v1` tier defect — a within-league rate
 * read across leagues as though the scale carried over — and it survived
 * a 744-test suite, because every test asserted STRUCTURE (is there an
 * anchor? does it have a key?) and none asserted the VALUE. So this file
 * asserts values. */

const kickoff = (i: number) =>
  new Date(Date.UTC(2026, 11, 15, 18, i)).toISOString();

const LEAGUE_GAP_BASIS =
  "what a league-average club of one league scores against a "
  + "league-average club of the other — a claim about the two LEAGUES, "
  + "not about these two clubs";

/** A cross-league row. `league_gap` is optional exactly as the payload
 *  has it: absent, never null, when a league has no measured level. */
const row = (i: number, favourite: string, opponent: string,
             league_gap?: Record<string, unknown>) => ({
  refused: false, league: "ucl", column: "ucl",
  home: favourite, away: opponent, favourite, opponent,
  fav_side: "home", fav_source: "field", resolution: {},
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  gp_current: { home: 4, away: 4, min: 4 },
  weights: { home: 0.28, away: 0.28, min: 0.28, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  src: "current", cross_league: true,
  rated_in: { home: "epl", away: "azerpremyer" },
  gap_note: "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld.",
  reg_time_note: null, table_notes: { home: null, away: null },
  ranks: { fav: 3, opp: 1 },
  rates: { ppg: [2.6, 2.0], gf: [2.8, 2.2], ga: [0.7, 1.3], gdg: [2.1, 0.9] },
  /* THE OLD HEADLINE, AND IT STAYS ON THE ROW. It is still the right
     answer for a row the level table does not cover, so the fixture
     keeps it NEGATIVE — a card that fell back would print −1.32 again
     and this file would see it. */
  own_gdg: { diff: -1.32, basis: "EACH CLUB'S OWN GD/g, DIFFERENCED" },
  ...(league_gap ? { league_gap } : {}),
  tiers: { ovr: [2, 4], atk: [1, 3], def: [2, 3] },
  tier_gaps: { ovr: 2, atk: 2, def: 1 },
  shape: "CLEAN", event_id: `ucl-${i}`, competition_id: `ucl-${i}`,
  kickoff: kickoff(i), espn: "uefa.champions", venue: null, venue_class: null,
  kalshi: null, current_only: null,
  form: { fav: "WWDLW", opp: "LDWLL", scope: "ucl", scope_is_cup: true },
});

const GAP = {
  gd: 2.632, gf: 3.086, ga: 0.454, basis: LEAGUE_GAP_BASIS,
  leagues: { fav: "epl", opp: "azerpremyer" },
};

const BOARD = (rows: unknown[]) => ({
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: { ucl: { src: "current", min_current_gp: 4, clubs: 36, kind: "cup",
                    rated_on: ["epl", "azerpremyer"], reg_time_note: null,
                    table_notes: {} } },
  rows, refusals: [], off_board: [], off_board_counts: {}, folded: {},
  narrowed_to: ["ucl"],
});

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b) });

async function open(page: import("@playwright/test").Page, rows: unknown[]) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD(rows))));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json({ finished: [], refusals: [], leagues: {}, store: null })));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ detail: "not needed here" }, 503)));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
}

const anchor = (page: import("@playwright/test").Page) =>
  page.getByTestId("picker-row").first().getByTestId("row-anchor");

test("the headline is the LEAGUE gap, and it does not read negative on the "
   + "most lopsided tie on the board", async ({ page }) => {
    await open(page, [row(1, "Manchester United", "Sabah FK", GAP)]);
    await expect(anchor(page)).toHaveText("+2.63");
    await expect(anchor(page)).toHaveAttribute("data-anchor", "league_gap");
    // and emphatically NOT the number the operator was shown
    await expect(anchor(page)).not.toHaveText("-1.32");
    await expect(anchor(page)).not.toHaveText("−1.32");
  });

test("it is labelled as a league comparison and shows the two goal figures "
   + "it is the difference of", async ({ page }) => {
    await open(page, [row(1, "Manchester United", "Sabah FK", GAP)]);
    const key = page.getByTestId("picker-row").first().getByTestId("anchor-key");
    await expect(key).toContainText("league gap");
    await expect(key).toContainText("goals");
    /* The second line is the PAIR, not a second label word — "3.09 –
       0.45", the form the operator settled on. Rounded from the
       payload's own numbers rather than typed twice. */
    await expect(key).toContainText(`${GAP.gf.toFixed(2)} – ${GAP.ga.toFixed(2)}`);
    // never the old key, which named a different measurement entirely
    await expect(key).not.toContainText("own-league");
  });

test("a row the level table does not cover keeps the OLD headline rather "
   + "than inventing one", async ({ page }) => {
    /* MISSING IS NEVER ZERO, and it is never a borrowed number either.
       Without `league_gap` the card falls back to `own_gdg` and says so
       in the key — which is honest, and is exactly why the fallback has
       to stay reachable and testable. */
    await open(page, [row(1, "Manchester United", "Sabah FK")]);
    await expect(anchor(page)).toHaveAttribute("data-anchor", "own_gdg");
    await expect(page.getByTestId("picker-row").first()
      .getByTestId("anchor-key")).toContainText("own-league");
  });

test("the sign is the LEAGUES', not the row's — a favourite from the "
   + "weaker league still shows a negative league gap", async ({ page }) => {
    /* Como v RB Leipzig on the real board: Como is the field favourite,
       and Serie A sits just under the Bundesliga, so this block reads
       −0.08. A card that flipped it to agree with the row would have
       stopped being about leagues — which is the one thing this number
       is for. Measured on prod at merge: gd −0.0799. */
    const negative = {
      gd: -0.0799, gf: 1.0231, ga: 1.1030, basis: LEAGUE_GAP_BASIS,
      leagues: { fav: "seriea", opp: "bundesliga" },
    };
    await open(page, [row(1, "Como", "RB Leipzig", negative)]);
    /* U+2212 MINUS, not a hyphen: `dec()` sets the figure in proper
       typography and the two glyphs are not interchangeable to a
       matcher. Asserting the hyphen here failed on a card that was
       right — worth the note, because the next person to write a
       value assertion on this surface will reach for "-" too. */
    await expect(anchor(page)).toHaveText("\u22120.08");
    await expect(anchor(page)).toHaveAttribute("data-anchor", "league_gap");
  });

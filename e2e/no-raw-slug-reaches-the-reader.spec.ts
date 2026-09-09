import { expect, test } from "@playwright/test";

// A SLUG IS AN INTERNAL KEY AND MUST NEVER REACH THE OPERATOR.
//
// On 2026-09-09 four leagues were added so the last Champions League
// entrants could be rated, and they shipped without `LEAGUE_LABEL`
// entries. `leagueLabel()` falls through to the slug, so the column's
// "rated on" chip printed CZECHLIGA + UKRPREMIER + SLOVAKSUPERLIGA +
// AZERPREMYER at him. He spotted it in a screenshot; nothing in the
// suite did.
//
// The guard is DERIVED FROM THE PAYLOAD, not from a typed list of
// slugs — a typed list is the thing that was already missing four
// entries. Every name the board renders is checked against the shape of
// a slug: lower-case, no space. A real display name cannot look like
// that ("Czech Liga", "EPL", "Süper Lig" all fail the slug test), so
// anything that does is an unlabelled key that escaped.

const json = (b: unknown) => ({ status: 200, contentType: "application/json",
                                body: JSON.stringify(b) });
const inHours = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 25 * 60_000).toISOString();

// every member the backend can name on a cup column, by slug
const MEMBERS = ["epl", "laliga", "bundesliga", "seriea", "ligue1",
                 "eredivisie", "primeiraliga", "superlig", "eliteserien",
                 "czechliga", "ukrpremier", "slovaksuperliga", "azerpremyer"];

const w = (a: number, b: number) => ({ home: a, away: b, min: Math.min(a, b),
  k: 10, constant: null, basis: { home: "blend", away: "blend" } });

const ROW = {
  refused: false, league: "ucl", espn: "uefa.champions", fav_side: "home",
  resolution: {}, src: "current", kalshi: null, reg_time_note: null,
  gp_current: { home: 6, away: 6, min: 6 }, weights: w(0.375, 0.375),
  home: "Slavia Prague", away: "Lens", favourite: "Slavia Prague",
  opponent: "Lens", ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: "CROSS-LEAGUE FIXTURE — gaps withheld.",
  // the two rarest slugs, on the row itself
  rated_in: { home: "czechliga", away: "ligue1" },
  ranks: { fav: 1, opp: 6 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "CLEAN",
  rates: { ppg: [2.39, 1.81], gf: [2.1, 1.5], ga: [0.4, 0.7],
           gdg: [1.72, 0.78] },
  event_id: "u1", competition_id: "u1", kickoff: inHours(8),
};

const BOARD = {
  generated_at: new Date().toISOString(), date: "20260908", days: 7,
  leagues: { ucl: { src: "current", min_current_gp: 4, clubs: 193,
    kind: "cup", rated_on: MEMBERS, reg_time_note: null } },
  rows: [ROW], refusals: [],
};
const REVIEW = { generated_at: new Date().toISOString(), date: "20260908",
  back: 7, window: { from: "20260901", to: "20260908" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [] };

test("no league slug reaches the reader on a cup column", async ({ page }) => {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.goto("/bet-suggester/ucl");

  const colu = page.locator('[data-testid="league-col"][data-league="ucl"]');
  await expect(colu.getByTestId("picker-row").first()).toBeVisible();

  // THE WHOLE COLUMN'S TEXT, including the header chips and the row's
  // rated-in badge. `textContent`, not `innerText`: the chips are styled
  // uppercase and the transform would mask a lower-case slug entirely.
  const text = ((await colu.textContent()) ?? "");
  for (const slug of MEMBERS) {
    expect(text, `the raw slug "${slug}" is on screen — it has no LEAGUE_LABEL entry`)
      .not.toContain(slug);
  }
});

import { expect, test } from "@playwright/test";
import { COMPETITIONS, LIVE_COMPETITION_COUNT } from "./liveCompetitions";
import { RECORDED } from "./efl-cup-recorded";

// A SLUG IS AN INTERNAL KEY AND MUST NEVER REACH THE OPERATOR.
//
// On 2026-09-09 four leagues were added so the last Champions League
// entrants could be rated, and they shipped without `LEAGUE_LABEL`
// entries. `leagueLabel()` falls through to the slug, so the column's
// "rated on" chip printed CZECHLIGA + UKRPREMIER + SLOVAKSUPERLIGA +
// AZERPREMYER at him. He spotted it in a screenshot; nothing in the
// suite did.
//
// ONE COLUMN OR EVERY COLUMN (2026-09-15). This file then hard-coded
// `/bet-suggester/ucl` and asserted about `ucl` four times. The EFL Cup
// arrived the same week with three member tiers whose names had never
// been rendered anywhere — `championship`, `leagueone`, `leaguetwo` —
// and this guard had nothing to say about it, because it was pointed at
// one page. The competition set is the registry now and the registry's
// LENGTH is asserted: see e2e/liveCompetitions.ts.
//
// THE SLUGS THEMSELVES ARE DERIVED FROM THE PAYLOAD UNDER TEST, not
// re-typed beside it. `slugsIn()` walks the board this spec is about to
// serve and collects every key the backend put in a slug-shaped field —
// `rated_on`, `rated_in`, `league`, `column`, `also_in`. So the fixture
// and the assertion cannot drift apart: a slug added to a fixture is
// asserted about by that act, and a slug removed stops being asserted
// about instead of lingering as a check of nothing.
//
// AND THE EFL CUP'S FIXTURE IS A RECORDING. Its `rated_on` is the one
// the backend actually emitted (e2e/efl-cup-recorded.ts, off
// assemble_board against live ESPN and Kalshi), which is the difference
// between guarding the competition and guarding a payload written from
// a brief — the failure that certified a venue bug with twelve green
// tests because the fixture said "ESP" where the feed says "Spain".

const json = (b: unknown) => ({ status: 200, contentType: "application/json",
                                body: JSON.stringify(b) });
const inHours = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 25 * 60_000).toISOString();

/** THE MEMBER TIERS EACH COMPETITION IS RATED ON, as the backend names
 *  them. This is the guard's INPUT — what the provider can put on the
 *  wire — and it is the one thing a frontend spec cannot derive, because
 *  the set lives in the backend's `tables.CupSpec.members`. So it is
 *  keyed by competition and CHECKED AGAINST THE REGISTRY below: a
 *  competition that joins the rail without an entry here fails rather
 *  than being skipped, which is the whole difference between a map and
 *  a hand-typed subset. */
const RATED_ON: Record<string, readonly string[]> = {
  // the Champions League's own thirteen, the last four of which are the
  // ones that shipped unlabelled
  ucl: ["epl", "laliga", "bundesliga", "seriea", "ligue1", "eredivisie",
        "primeiraliga", "superlig", "eliteserien", "czechliga",
        "ukrpremier", "slovaksuperliga", "azerpremyer"],
  // RECORDED, not written: ["epl", "championship", "leagueone",
  // "leaguetwo"] straight off the backend's own board payload
  eflcup: RECORDED.leagues.eflcup.rated_on as readonly string[],
};

/** Every slug-shaped key in a board payload. Walks the object rather
 *  than reading named paths, so a field the backend adds tomorrow is
 *  covered the day it lands. */
function slugsIn(node: unknown, out = new Set<string>()): Set<string> {
  const SLUG_FIELDS = new Set(["rated_on", "league", "column", "also_in",
                               "home", "away"]);
  const walk = (n: unknown, key?: string) => {
    if (typeof n === "string") {
      // a slug is lower-case with no space; a display name never is
      if (key && SLUG_FIELDS.has(key) && /^[a-z][a-z0-9-]*$/.test(n))
        out.add(n);
      return;
    }
    if (Array.isArray(n)) { n.forEach((v) => walk(v, key)); return; }
    if (n && typeof n === "object") {
      for (const [k, v] of Object.entries(n)) {
        if (k === "rated_in" && v && typeof v === "object") {
          for (const s of Object.values(v))
            if (typeof s === "string") out.add(s);
          continue;
        }
        walk(v, k);
      }
    }
  };
  walk(node);
  return out;
}

const w = (a: number, b: number) => ({ home: a, away: b, min: Math.min(a, b),
  k: 10, constant: null, basis: { home: "blend", away: "blend" } });

/** A rated row in this competition's column, rated in the two rarest
 *  member tiers it has — `members[0]` and the last one — so the slugs
 *  most likely to be unlabelled are the ones on the row itself. */
const row = (slug: string, members: readonly string[]) => ({
  refused: false, league: slug, espn: "x", fav_side: "home",
  resolution: {}, src: "current", kalshi: null, reg_time_note: null,
  gp_current: { home: 6, away: 6, min: 6 }, weights: w(0.375, 0.375),
  home: "Slavia Prague", away: "Lens", favourite: "Slavia Prague",
  opponent: "Lens", ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: "CROSS-LEAGUE FIXTURE — gaps withheld.",
  rated_in: { home: members[members.length - 1], away: members[0] },
  ranks: { fav: 1, opp: 6 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "CLEAN",
  rates: { ppg: [2.39, 1.81], gf: [2.1, 1.5], ga: [0.4, 0.7],
           gdg: [1.72, 0.78] },
  event_id: "u1", competition_id: "u1", kickoff: inHours(8),
});

const board = (slug: string, members: readonly string[]) => ({
  generated_at: new Date().toISOString(), date: "20260908", days: 7,
  leagues: { [slug]: { src: "current", min_current_gp: 4, clubs: 193,
    kind: "cup", rated_on: members, reg_time_note: null } },
  rows: [row(slug, members)], refusals: [],
});

const REVIEW = { generated_at: new Date().toISOString(), date: "20260908",
  back: 7, window: { from: "20260901", to: "20260908" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [] };

test("every competition in the registry has a member list to be guarded on",
  () => {
    /* THE LENGTH ASSERTION. A competition on the rail with no entry in
       RATED_ON would otherwise render a column this file never looks at
       — which is precisely how the EFL Cup's three tiers went
       unguarded for a day. */
    expect(COMPETITIONS.length).toBe(LIVE_COMPETITION_COUNT);
    for (const comp of COMPETITIONS)
      expect(RATED_ON[comp.key],
        `${comp.key} is on the rail and this guard has no member list for `
        + "it, so its column's names are checked by nothing")
        .toBeTruthy();
  });

for (const comp of COMPETITIONS) {
  test(`no league slug reaches the reader on the ${comp.label} column`,
    async ({ page }) => {
      const members = RATED_ON[comp.key];
      const payload = board(comp.key, members);
      await page.route("**/api/picker/board**", (r) => r.fulfill(json(payload)));
      await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
      await page.route("**/api/comp/*/fixtures**", (r) =>
        r.fulfill({ status: 503, contentType: "application/json",
                    body: JSON.stringify({ detail: "not this file's subject" }) }));
      await page.goto(comp.href);

      const col = page.locator(
        `[data-testid="league-col"][data-league="${comp.key}"]`);
      await expect(col.getByTestId("picker-row").first()).toBeVisible();

      // THE WHOLE COLUMN'S TEXT, including the header chips and the row's
      // rated-in badge. `textContent`, not `innerText`: the chips are styled
      // uppercase and the transform would mask a lower-case slug entirely.
      const text = ((await col.textContent()) ?? "");
      const slugs = slugsIn(payload);
      expect(slugs.size,
        "the walk found no slug in the payload, so this assertion is over "
        + "an empty set and proves nothing")
        .toBeGreaterThanOrEqual(members.length);
      for (const slug of slugs) {
        expect(text,
          `the raw slug "${slug}" is on screen — it has no LEAGUE_LABEL entry`)
          .not.toContain(slug);
      }
    });
}

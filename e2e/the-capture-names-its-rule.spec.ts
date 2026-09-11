import { expect, test } from "@playwright/test";

/* A FINISHED CARD MUST NOT ASSERT A FAVOURITE THE BOARD NO LONGER NAMES.
 *
 * 2026-09-10. The operator, reading the finished tail: "lots of bugs, MU
 * vs Sabah the board said Sabah is the fav", then "same thing for slav
 * and lens".
 *
 * Both true, and neither a new defect. Every UCL capture in the window
 * was frozen BEFORE 8dfa813 replaced the cross-league favourite rule —
 * Sabah v United was captured 37 hours before kickoff, a day before the
 * fix deployed. The old rule compared WITHIN-LEAGUE standing across
 * leagues and broke ties on the club's NAME, so Sabah FK (top of the
 * Azerbaijani Premyer Liqa) outranked Manchester United. Twelve of the
 * eighteen finished cards name a favourite the current rule contradicts.
 *
 * THE CAPTURE CANNOT BE RE-TAKEN AND MUST NOT BE REWRITTEN: the match is
 * over, a cup has no season archive to rewind, and restating it with
 * today's answer destroys the only record of what was shown. So it is
 * marked — and the mark has to cover the whole card, because every
 * signed field is oriented from that favourite. */

const state = (over: Record<string, unknown> = {}) => ({
  refused: false, league: "ucl", home: "Manchester United", away: "Sabah FK",
  favourite: "Sabah FK", opponent: "Manchester United", fav_side: "away",
  resolution: {}, ppg_gap: 0, gdg_gap: 0, rank_gap: 0,
  gp_current: { home: 3, away: 3, min: 3 },
  cross_league: true, fav_source: "rank",
  tiers: { ovr: [1, 1], atk: [1, 2], def: [2, 3] },
  tier_gaps: { ovr: 0, atk: 1, def: 1 }, shape: "SPLIT",
  /* THE REST OF THE CAPTURED ROW, taken from a real one rather than
     guessed. Without `form` the card rendered NOTHING — and a fixture
     that produces no card turns every `toHaveCount(0)` in this file
     into a pass for the wrong reason, which is how four of these
     "passed" on their first run against an empty section. */
  form: { fav: null, opp: null, scope: "Champions League",
          scope_is_cup: true },
  src: "current", weights: null, kalshi: null, venue: null,
  venue_class: null, current_only: { gdg_gap: null, ppg_gap: null,
                                     rank_gap: null },
  gap_note: null, reg_time_note: null,
  table_notes: { home: null, away: null },
  ranks: { fav: 1, opp: 3 }, refused_reason: null,
  ...over,
});

/** One finished row. `st` is the capture's state: an object for a
 *  capture, `null` for a row whose capture was unavailable. Passed
 *  DIRECTLY rather than through a nested `finished().pre_kickoff`
 *  spread — the nesting was what stopped four of these rendering at
 *  all, and a fixture that quietly produces no card turns every
 *  `toHaveCount(0)` below into a pass for the wrong reason. */
const finished = (st: Record<string, unknown> | null = state()) => ({
  league: "ucl", espn: "uefa.champions", kind: "cup",
  event_id: "401915442", competition_id: "401915442",
  kickoff: "2026-09-10T19:00Z", status_detail: "FT",
  result: { home: 4, away: 0, winner: "home", source: "espn_scoreboard" },
  shot_state: { full_time: null, first_twenty: null, before_first_goal: null },
  fit: { favourite_won: false, confirmed_at_20: null },
  pre_kickoff: {
    origin: st ? "captured" : "unavailable",
    origin_label: st ? "CAPTURED" : "UNAVAILABLE",
    origin_note: "frozen from the live board before kickoff",
    captured_at: st ? "2026-09-09T05:36:38Z" : null,
    captured_seconds_before_kickoff: st ? 134601 : null,
    board_date: st ? "20260909" : null,
    reconstructed_from: null,
    unavailable_reason: st ? null : "cup_has_no_season_archive",
    store_read: "ok", store_read_error: null,
    state: st,
  },
});

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b) });

async function open(page: import("@playwright/test").Page, rows: unknown[]) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(
    { generated_at: "x", date: "20260910", days: 7, leagues: { ucl: {} },
      rows: [], refusals: [], off_board: [], off_board_counts: {},
      folded: {}, narrowed_to: ["ucl"] })));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ competition: "ucl", axes: null, why_not: "n/a" })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(
    { generated_at: "x", date: "20260910", back: 7,
      window: { from: "20260903", to: "20260910" },
      store: {},
      /* THE META CARRIES THE COUNTS, and the tail reads them — a
         `leagues` entry of `{kind:"cup"}` alone rendered the section,
         a count and no rows, which is the "asked and found none" state
         and not what this file is testing. */
      leagues: { ucl: { finished: rows.length, captured: rows.length,
                        reconstructed: 0, unavailable: 0, error: null,
                        kind: "cup", pre_kickoff_limit: null } },
      finished: rows, refusals: [], narrowed_to: ["ucl"] })));
  /* THE FINISHED TAIL IS COLLAPSED BY DEFAULT and remembers its state
     per league in localStorage (`picker.reviewopen.<slug>`), so a fresh
     context opens closed and a spec that only asserts ABSENCE passes
     against a section that never rendered. Three of the tests below did
     exactly that on the first run: `toHaveCount(0)` was true of a card
     missing for the wrong reason.

     SEEDED, NOT CLICKED. Clicking the toggle races hydration — the
     first attempt at this collapsed a tail that was already open by
     then and left the section gone entirely, which reads as a different
     bug. Seeding the key the component itself reads is deterministic.
     And the row count is asserted here, so every negative below is
     measured against a card that is actually on the page. */
  await page.addInitScript(() => {
    try { window.localStorage.setItem("picker.reviewopen.ucl", "1"); } catch {}
  });
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("review-row")).toHaveCount(rows.length);
}

const card = (page: import("@playwright/test").Page) =>
  page.getByTestId("review-row").first();

test("a capture from the superseded rule says so, above everything signed "
   + "from it", async ({ page }) => {
    await open(page, [finished()]);
    const note = card(page).getByTestId("fav-rule-superseded");
    await expect(note).toBeVisible();
    // it names the club the OLD rule chose, so the reader can see which
    // way round the card is oriented
    await expect(note).toContainText("Sabah FK");
    // and says what the old rule actually did, not just that it changed
    await expect(note).toContainText(/within its own league/i);
    // the whole card is qualified, not one figure
    await expect(note).toContainText(/whether the favourite won/i);
  });

test("a capture from the CURRENT rule says nothing — the mark is not "
   + "decoration on every finished card", async ({ page }) => {
    await open(page, [finished(state({
      favourite: "Manchester United", opponent: "Sabah FK",
      fav_side: "home", fav_source: "field",
      field: { competition: "ucl", size: 36 },
    }))]);
    await expect(card(page).getByTestId("fav-rule-superseded")).toHaveCount(0);
  });

test("a SAME-LEAGUE capture is never marked — neither rule applied to it",
  async ({ page }) => {
    await open(page, [finished(state({ cross_league: false,
                                       fav_source: "rank" }))]);
    await expect(card(page).getByTestId("fav-rule-superseded")).toHaveCount(0);
  });

test("the favourite is marked by SHAPE, not by the accent colour",
  async ({ page }) => {
    /* Weight already says who WON. A gold `fav` chip said who we
       PICKED, and on Liverpool 2-1 Atlético the brightest word and the
       gold chip belonged to different clubs — the operator read them as
       one statement. Gold is the brand here and never a verdict. */
    await open(page, [finished()]);
    const marks = card(page).getByTestId("fav-mark");
    await expect(marks).toHaveCount(2);          // one per side, always
    await expect(card(page).locator('[data-testid="fav-mark"][data-fav="yes"]'))
      .toHaveCount(1);
    // the filled one is on the side the capture named
    await expect(card(page).locator('[data-testid="fav-mark"][data-side="away"]'))
      .toHaveAttribute("data-fav", "yes");
  });

test("no favourite, no pips — a row without a capture claims neither club",
  async ({ page }) => {
    await open(page, [finished(null)]);
    await expect(card(page).getByTestId("fav-mark")).toHaveCount(0);
    await expect(card(page).getByTestId("fav-rule-superseded")).toHaveCount(0);
  });

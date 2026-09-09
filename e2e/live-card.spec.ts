import { expect, test } from "@playwright/test";

// THE LIVE SECTION — the cards for matches under way, above the ranked
// board on /bet-suggester (components/LiveCard.tsx).
//
// Hermetic: every test serves a recorded SHAPE of
// GET /api/bet-suggester/watched-strip plus the board and review reads
// the page makes anyway, so none of it depends on the weather.
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY. Every key below is the one
// the backend actually emits — `api/main.py`'s match block
// (fixture_id / competition_slug / home / away / espn_event_id / state /
// coverage / read / positions) and `_state()`'s own fields — and the
// live-read components carry their value under `value_key`, which is
// where the backend puts it, not under the component's own name. A
// fixture written in the code's vocabulary would certify a reader that
// cannot read the real payload; this repo has been burnt by exactly
// that once already.
//
// WHAT IS AT STAKE, and it is not pixels:
//
//   - THE AGE OF THE TAPE IS ALWAYS THERE. The provider's minute keeps
//     looking healthy after a feed stops, so the age is the one number
//     that says whether anything below it is current. A card without it
//     is making a claim it cannot support, so the slot is never blank —
//     a fixture with no readable tape says so IN THAT SLOT.
//   - A FAILED READ IS NEVER A ZERO AND NEVER AN EMPTY. A tape that
//     could not be read must not render as 0–0 at 0', and must not
//     quietly drop the card out of the section either: `state.in_play`
//     is FAIL-CLOSED false on a failed read, so filtering on it alone
//     would delete exactly the fixtures whose state is unknown.
//   - THE DRAW LABEL IS PLACED BY MEASUREMENT, NOT BY A THRESHOLD. The
//     same 2% fits on a wide card and does not on a narrow one, so a
//     percentage typed as a cut-off would be wrong on one of them.
//   - THE FLIP TURNS ONE BLOCK. The scoreboard, the tape age and the
//     position stay put; only `live stats` turns, and its back is the
//     RANKED BOARD'S OWN COMPONENTS — same testids, because it is
//     literally the same component (PickerColumn.RowRead), not a
//     second layout for one read.
//   - NOTHING HERE IS RANKED, and the section says so.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// ------------------------------------------------------------- board
//
// The rows the live cards JOIN to, on espn_event_id → event_id. The
// prematch face renders the board's own card off exactly these.

const LEAGUES = {
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
  epl: { src: "current", min_current_gp: 12, clubs: 20 },
  laliga: { src: "current", min_current_gp: 12, clubs: 20 },
  ligamx: { src: "current", min_current_gp: 12, clubs: 18 },
};

function boardRow(over: Record<string, unknown> = {}) {
  return {
    refused: false, league: "mls",
    home: "Austin FC", away: "St. Louis City SC",
    favourite: "Austin FC", opponent: "St. Louis City SC",
    fav_side: "home",
    form: { fav: "WWDWW", opp: "LDLLW", scope: "mls", scope_is_cup: false },
    resolution: { "Austin FC": "exact", "St. Louis City SC": "exact" },
    ppg_gap: 1.16, gdg_gap: 1.3, rank_gap: 13,
    gp_current: { home: 26, away: 26, min: 26 },
    venue_class: { class: "DOMESTIC", home_side: "home" },
    src: "current", ranks: { fav: 4, opp: 17 },
    tiers: { ovr: [1, 5], atk: [1, 5], def: [2, 5] },
    tier_gaps: { ovr: 4, atk: 4, def: 3 },
    shape: "CLEAN",
    event_id: "401882901", competition_id: "401882901",
    kickoff: "2026-12-10T20:30:00Z", espn: "usa.1",
    kalshi: {
      event_ticker: "KXMLSGAME-SAMPLE-ATX",
      ticker: "KXMLSGAME-SAMPLE-ATX-ATX",
      ask_c: 59, bid_c: 58, spread_c: 1,
      ask_size: 83812, bid_size: 4100, flags: [],
    },
    ...over,
  };
}

const BOARD = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", days: 7,
  leagues: LEAGUES,
  rows: [boardRow()],
  refusals: [],
};

const REVIEW = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", back: 7,
  window: { from: "20261202", to: "20261209" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

// ------------------------------------------------------- the payload
//
// The prose the backend attaches to every component, verbatim — the
// sentence that forbids a tilt is the reason the dynamics block refuses,
// so the fixture has to carry it or the test would prove nothing.
const NO_COMPOSITE =
  "NO COMPOSITE BEFORE M1: the weights have not been fitted, and a "
  + "number made out of these four would be a claim.";

// live_read.BASELINE_IS_JOINED, VERBATIM off the emitter.
//
// It rode here as `baseline_is_not_built`, carrying a sentence saying
// the baseline "is not built", until 2026-09-08. Backend `6a3771d`
// renamed the key WITH the claim — the join exists now, M1's state-path
// rate table read at run time — and ../backend/tests/test_live_read.py
// asserts the old name is ABSENT from the payload. A fixture asserting
// the opposite of the emitter is the venue-bug shape: green tests
// certifying a reader that cannot read the real thing.
const BASELINE_IS_JOINED = "A COMPONENT IS A NUMBER, NOT A FINDING — AND SINCE "
  + "2026-09-08 IT CARRIES THE COMPARISON THAT LETS IT BECOME "
  + "ONE. The question that matters is whether a side is doing "
  + "MORE THAN A TRAILING SIDE NORMALLY DOES at this scoreline "
  + "and this minute — a trailing side always shoots more, that "
  + "is what trailing is. M1's state-path rate table answers it: "
  + "120 cells, lead(-2..2) x favourite x venue x minute bucket, "
  + "pooled prior 30, published by the 2026-09-07 re-run and READ "
  + "HERE AT RUN TIME from "
  + "results.<variant>.m<m>.state_path_rate_table by way of "
  + "design.state_path_key_order. Nothing is re-fitted, nothing "
  + "is interpolated, no cell is chosen locally, and a cell the "
  + "archive refused under its own exposure floor stays refused "
  + "by that name rather than being filled in from a neighbour. "
  + "THE GAIN IS BOUNDED AND THE BOUNDS ARE ON THIS SAME PAYLOAD: "
  + "the table was fitted against corpus Elo plus prior shot form "
  + "and never against the T-10 price "
  + "(price_baseline_unmeasured), the favourite coordinate this "
  + "plane can fix is price-native where M1's was Elo-native, and "
  + "the read beside the cell is a decaying rate across every "
  + "state its minutes crossed while the cell is one state's "
  + "average. 'Four on target in fifteen minutes' is now a "
  + "measurement of this match beside what the corpus ran in the "
  + "same cell; it is not yet a finding, and no arithmetic "
  + "between the two is done here.";

function component(key: string, value: number | null, unit: string,
                   kind: string) {
  const valueKey = `${key}_${kind === "level" ? "percent" : "per_90"}`;
  return {
    component: key, component_key: key,
    value_key: valueKey,
    [valueKey]: value,
    kind, unit,
    kind_meaning: kind === "rate"
      ? "an amount per unit of match time" : "a level, not an amount",
    meaning: `${key} — persisted at the tick, decaying`,
    observed_seconds: 1440.0, observed_intervals: 12,
    note: null,
    no_composite_before_m1: NO_COMPOSITE,
  };
}

function side(name: string, mult = 1) {
  return {
    side: name,
    captured_at: "2026-12-10T21:05:00Z",
    live_stat_snapshot_id: 9001,
    half_life_seconds: 600.0,
    observed_since: "2026-12-10T20:30:00Z",
    observed_from_kickoff: true,
    state: {
      side: name, minute: 65, score_home: 2, score_away: 1,
      goal_difference: name === "home" ? 1 : -1,
      score_state: name === "home" ? "leading" : "trailing",
      conditionable: true,
      read_version: "live-read-components-v1",
      half_life_seconds: 600.0, observed_from_kickoff: true,
      baseline_is_joined: BASELINE_IS_JOINED,
    },
    components: {
      shot_read: component("shot_read", 14.2 * mult,
        "shots per 90 match-minutes", "rate"),
      on_target_read: component("on_target_read", 5.6 * mult,
        "shots on target per 90 match-minutes", "rate"),
      corner_read: component("corner_read", 3.1 * mult,
        "corners per 90 match-minutes", "rate"),
      possession_read: component("possession_read", name === "home" ? 58.4 : 41.6,
        "percent of possession", "level"),
    },
    basis: "shot=12i/1440s on_target=12i/1440s corner=12i/1440s",
  };
}

// ------------------------------------------------- the match states
//
// `states`, off api/main.py's match block (backend card.live_states).
// EVERY KEY BELOW IS THE ONE THE BACKEND EMITS, and the words are its
// words — the shares, the cell, the derived `cell_words` sub-line and
// the NOT-VALIDATED sentence. A fixture written in this file's own
// vocabulary would certify a reader that cannot read the real payload,
// which is how twelve green tests once certified a venue bug.
const CONVENTIONS =
  "EXPLORATORY — NOT VALIDATED: the share>=0.6 / share<=0.4 cut is a "
  + "DECLARED CONVENTION and not a fitted threshold. Nothing was "
  + "preregistered, no holdout was held out, and no measured edge is "
  + "attached to any of these six words. AND THE TWO AXES ARE NOT "
  + "EQUALLY UNFITTABLE: the CHANCES cut COULD be fitted, because M1's "
  + "panel carries shot volume at four horizons and measured it; the "
  + "BALL cut could NOT, because possession is not in that corpus at "
  + "all. The words describe THIS row; they forecast nothing.";

const MISSING_IS_NEVER_EVEN =
  "MISSING IS NEVER AN EVEN MATCH. A row without possession or without "
  + "shots for BOTH sides has NO state — not CONTEST, which would claim "
  + "the two sides are level, and not a zero share, which would claim "
  + "one of them has done nothing.";

function sideState(state: string, cellWords: string,
                   shares: [number, number],
                   cell: Record<string, unknown>) {
  return {
    state,
    cell,
    cell_words: cellWords,
    shares: { ball: shares[0], chances: shares[1] },
    note: `the row reads ${cellWords}. ${CONVENTIONS}`,
    conventions: CONVENTIONS,
  };
}

/** The four pairings, each recorded off the emitter. */
const STATES = {
  // possession 58.4/41.6 with 15 shots to 6: the ball is INSIDE the cut
  // and the chances are not, so neither side has an edge on both axes.
  contest: {
    home: sideState("CONTEST", "ball even · chances", [0.584, 0.7143],
      { ball: "even", chances: "has", score: "ahead", score_decides: false }),
    away: sideState("CONTEST", "ball even · no chances", [0.416, 0.2857],
      { ball: "even", chances: "against", score: "behind",
        score_decides: false }),
  },
  siege: {
    home: sideState("SIEGE", "ball · chances", [0.71, 0.75],
      { ball: "has", chances: "has", score: "ahead", score_decides: false }),
    away: sideState("PINNED", "no ball · no chances · behind", [0.29, 0.25],
      { ball: "against", chances: "against", score: "behind",
        score_decides: true }),
  },
  blunt: {
    home: sideState("BLUNT", "ball · no chances", [0.68, 0.3571],
      { ball: "has", chances: "against", score: "behind",
        score_decides: false }),
    away: sideState("COUNTER", "no ball · chances", [0.32, 0.6429],
      { ball: "against", chances: "has", score: "ahead",
        score_decides: false }),
  },
  // THE PARKED BUS: the same two shares as PINNED, and the score is the
  // only thing between them.
  lowBlock: {
    home: sideState("LOW BLOCK", "no ball · no chances · ahead",
      [0.34, 0.2667],
      { ball: "against", chances: "against", score: "ahead",
        score_decides: true }),
    away: sideState("SIEGE", "ball · chances", [0.66, 0.7333],
      { ball: "has", chances: "has", score: "behind", score_decides: false }),
  },
};

function states(pair: { home: unknown; away: unknown }) {
  return {
    ...pair,
    counts: { possession: { home: 58.4, away: 41.6 },
              shots: { home: 15, away: 6 } },
    cut: { has_at_or_above: 0.6, against_at_or_below: 0.4 },
    vocabulary: ["BLUNT", "CONTEST", "COUNTER", "LOW BLOCK", "PINNED",
                 "SIEGE"],
    conventions: CONVENTIONS,
    shows_not_decides:
      "A STATE IS A DESCRIPTION OF THIS ROW AND FORECASTS NOTHING.",
  };
}

/** The early-match tape: a scoreline and almost nothing else. NO state,
 *  the names of both absent inputs, and never CONTEST. */
const STATES_ABSENT = {
  refused: "no_possession: the tape carries no possession and no shot "
    + "counts for one or both sides, so neither side has a state. "
    + MISSING_IS_NEVER_EVEN,
  refusal_codes: ["no_possession", "no_shot_evidence"],
  basis: MISSING_IS_NEVER_EVEN,
};

// ------------------------------------------------- YOUR EXIT LINES
//
// RECORDED OFF THE EMITTER, not written by hand: every key and every
// sentence below was printed by src/live/exit_lines.py's own
// `evaluate()` on the state it names. Only the blocks the card reads
// are kept (`lines`, `summary`), the way the position fixture keeps a
// reduced `certainty_premium` — but nothing here is REWORDED, because
// a fixture in the reader's vocabulary certifies a reader that cannot
// read the real payload.

/** A one-goal lead at 65' under a siege: both lines reached, the
 *  next-goal line asked at level scorelines and so not asked here. */
const EXIT_LINES_BOTH_FIRED = {
  version: "exit-lines-v1",
  lines: [
    { name: "exposure", asked: true, fired: true,
      reads: "+8.0 vs frozen", against: ">= your +6" },
    { name: "imminence", asked: true, fired: true,
      reads: "35.8% equaliser in 15'", against: ">= your 30%" },
    { name: "next_goal", asked: false, fired: null,
      against: "< your 30%", code: "level_scoreline",
      says: "not asked - the score is 1-0 and this line is asked at "
        + "level scorelines only" },
  ],
  fired: ["exposure", "imminence"],
  summary: { says: "both fired · exiting now banks $38.50 and gives up "
      + "$2.70", fired: ["exposure", "imminence"], blocked: false },
};

/** THE STATE THE PREREG SAYS IS THE COMMON ONE: level at 45', before
 *  the operator's own clock gate, on a minute M1 never measured. Not
 *  one line could be ASKED, and not one of them did not fire. */
const EXIT_LINES_NONE_ASKED = {
  version: "exit-lines-v1",
  lines: [
    { name: "exposure", asked: false, fired: null, against: ">= your +6",
      code: "before_minute_60",
      says: "not asked - the operator's line opens at 60' and it is 45'" },
    { name: "imminence", asked: false, fired: null,
      against: ">= your 30%", code: "level_scoreline",
      says: "not asked - the scoreline is level at 45', and the "
        + "equaliser hazard conditions on a lead" },
    { name: "next_goal", asked: false, fired: null, against: "< your 30%",
      code: "minute_not_measured",
      says: "not asked - minute_not_measured: 45' is not a horizon" },
  ],
  fired: [],
  summary: { says: "none of your lines was asked on this tick",
    fired: [], blocked: null },
};

/** One fired, and the operator's own ceiling REFUSING the exit it
 *  fired on — a block, recorded with its price, and the position
 *  continues. */
const EXIT_LINES_BLOCKED = {
  version: "exit-lines-v1",
  lines: [
    { name: "exposure", asked: true, fired: true,
      reads: "+7.1 vs frozen", against: ">= your +6" },
    { name: "imminence", asked: true, fired: false,
      reads: "24% equaliser in 15'", against: ">= your 30%" },
    { name: "next_goal", asked: false, fired: null,
      against: "< your 30%", code: "level_scoreline",
      says: "not asked - the score is 1-0 and this line is asked at "
        + "level scorelines only" },
  ],
  fired: ["exposure"],
  summary: { says: "exposure fired · your certainty ceiling BLOCKS this "
      + "exit: it costs 34.0% of hold EV, above the 20.0% you set. The "
      + "position continues", fired: ["exposure"], blocked: true },
};

const COVERAGE = {
  monitored: true, complete_history: true,
  history: "declared before kickoff",
  no_history_is_not_quiet:
    "NO HISTORY IS NOT A QUIET MATCH: a decaying read that starts at "
    + "zero at minute 63 is arithmetically indistinguishable from a side "
    + "that had done nothing for an hour, and they are different matches.",
};

/** The clean case: in play, both sides read, a position held. */
function liveMatch(over: Record<string, unknown> = {}) {
  return {
    fixture_id: 101, competition_slug: "mls-2026",
    home: "Austin FC", away: "St. Louis City SC",
    espn_event_id: "401882901",
    state: {
      in_play: true, minute: 65, score_home: 2, score_away: 1,
      clock_display: "65'", match_state: "in", refusals: [],
      captured_at: "2026-12-10T21:05:00Z",
    },
    coverage: COVERAGE,
    read: {
      version: "live-read-v1", read_version: "live-read-components-v1",
      fixture_id: 101, monitored: true, coverage: COVERAGE,
      components_registry: {}, kinds: {},
      sides: { home: side("home"), away: side("away", 0.6) },
    },
    positions: [{
      journal_entry: { bet_id: 41, outcome_key: "home_win" },
      position: {
        outcome_key: "home_win", side: "home", size: "100",
        entry_price: 0.46, entry_cost_dollars: "46.00",
        entry_note: "THE ENTRY IS SUNK",
      },
      value_now_cents: 7784.0,
      certainty_premium: { applies: true, sell: { bid_cents: 77 } },
      exit_is_obtainable: { obtainable: true },
      exit_lines: EXIT_LINES_BOTH_FIRED,
    }],
    // The bars above read 58.4/41.6 on possession, so the ball axis
    // sits INSIDE the cut and the word that follows from them is
    // CONTEST. The default card's state agrees with the default card's
    // bars, which is the whole reason the row lives beside them.
    states: states(STATES.contest),
    ...over,
  };
}

/** A declared fixture whose tape read FAILED — `api/main.py`'s own
 *  `_state` under `tape_failed`: every field withdrawn, `in_play`
 *  FAIL-CLOSED false, one coded refusal. */
const TAPE_FAILED = {
  fixture_id: 606, competition_slug: "mls-2026",
  home: "Portland Timbers", away: "Vancouver Whitecaps",
  espn_event_id: "401882999",
  state: {
    in_play: false, minute: null, score_home: null, score_away: null,
    clock_display: null, match_state: null, captured_at: null,
    refusals: [{ code: "tape_unreadable",
      refused: "tape_unreadable: the state-tape read for this response "
        + "FAILED (OperationalError), so nothing above was read: "
        + "`in_play` is FAIL-CLOSED false and is not a measurement." }],
    basis: "NO STATE WAS READ FOR THIS RESPONSE. Every field above is "
      + "withdrawn, not measured.",
  },
  coverage: COVERAGE,
  read: { version: "live-read-v1", fixture_id: 606, monitored: true,
          coverage: COVERAGE, components_registry: {}, kinds: {},
          sides: {},
          words: "no component read has been persisted for this fixture" },
  positions: [],
  states: STATES_ABSENT,
};

const ENVELOPE = {
  version: "watched-strip-v1",
  generated_at: "2026-12-10T21:05:12Z",
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {},
  policy_codes: {},
};

const STRIP = { ...ENVELOPE, matches: [liveMatch()] };

// ------------------------------------------------------------- helpers

type Page = import("@playwright/test").Page;

/** ONE LIVE CARD, BY FIXTURE — SCOPED TO THE LIVE SECTION. The watched
 *  strip renders on the same page and stamps `data-fixture` on its own
 *  rows, so a bare attribute selector resolves to two elements and
 *  Playwright's strict mode fails on the collision. Which is the useful
 *  failure: the two surfaces really do describe the same fixture, and a
 *  spec that matched either at random would prove nothing about this one. */
const liveCard = (page: Page, id: number | string) =>
  page.locator(`[data-testid="live-card"][data-fixture="${id}"]`);

async function open(page: Page, strip: unknown, board = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**",
    (r) => r.fulfill(json(strip)));
  await page.goto("/bet-suggester");
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
}

// ================================================================ tape

test("the age of the tape is on every card, always", async ({ page }) => {
  await open(page, { ...STRIP, matches: [liveMatch(), TAPE_FAILED] });
  const cards = page.getByTestId("live-card");
  await expect(cards).toHaveCount(2);
  // EVERY card carries the slot, and none of them is blank — derived
  // from the cards actually drawn, never from a hand-typed count.
  const n = await cards.count();
  for (let i = 0; i < n; i += 1) {
    const tape = cards.nth(i).getByTestId("live-tape");
    await expect(tape).toBeVisible();
    expect((await tape.innerText()).trim()).not.toBe("");
  }
  // The read that landed says its age, measured against the envelope's
  // own generated_at (21:05:12 − 21:05:00) and not this machine's clock.
  await expect(liveCard(page, 101).getByTestId("live-tape"))
    .toHaveText("tape 12s");
});

test("a tape that could not be read says so IN THE AGE SLOT, and is "
  + "never a zero and never an empty", async ({ page }) => {
  await open(page, { ...ENVELOPE, matches: [TAPE_FAILED] });
  const card = liveCard(page, 606);
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-tape", "failed");
  await expect(card.getByTestId("live-tape")).toHaveText("tape read failed");

  // NEVER A ZERO. The score and the minute are withdrawn, not floored:
  // 0–0 at 0' is a claim about a match nobody could look at.
  await expect(card.getByTestId("live-score")).toHaveText("—");
  await expect(card.getByTestId("live-minute")).toHaveText("no minute");

  // NEVER AN EMPTY. `in_play` is FAIL-CLOSED false on a failed read, so
  // a section filtering on it alone would have deleted this card
  // outright — which reads as "no such match is live", the one
  // conclusion this payload cannot support.
  await expect(page.getByTestId("live-card")).toHaveCount(1);

  // And no stat bar is drawn off a read that did not happen.
  await expect(card.getByTestId("live-stat")).toHaveCount(0);
  await expect(card.getByTestId("live-stats-absent")).toBeVisible();
});

// ================================================== the flip, and what
//                                                     it does NOT turn

test("the flip turns the stats block ONLY — the scoreboard, the tape "
  + "age and the position stay put", async ({ page }) => {
  await open(page, STRIP);
  const card = liveCard(page, 101);

  // WHERE THE HEAD SITS IN ITS OWN CARD, not where it sits on the page.
  // The watched strip above this section polls on its own clock and
  // changes height as it settles, so a page coordinate measured here
  // and again after the click compares two different page layouts and
  // fails for a reason that has nothing to do with the flip. "Stays
  // put" is a claim about the CARD: the scoreboard does not move
  // relative to the card it heads, whichever face is showing.
  const head = card.getByTestId("live-head");
  const offsetInCard = async () => {
    const h = await head.boundingBox();
    const c = await card.boundingBox();
    return { dy: h!.y - c!.y, w: Math.round(h!.width) };
  };
  const before = await offsetInCard();
  await expect(card.getByTestId("live-face-stats")).toBeVisible();
  await expect(card.getByTestId("live-stat")).toHaveCount(4);

  await card.getByTestId("live-flip").click();
  await expect(card).toHaveAttribute("data-flipped", "true");

  // THE STATS TURNED.
  await expect(card.getByTestId("live-face-prematch")).toBeVisible();
  await expect(card.getByTestId("live-face-stats")).not.toBeVisible();

  // NOTHING ELSE DID. The score, the minute and the tape age are the
  // three facts that cannot wait for a flip, and the position is the
  // other thing you cannot lose mid-match.
  await expect(head).toBeVisible();
  await expect(card.getByTestId("live-score")).toHaveText("2–1");
  await expect(card.getByTestId("live-tape")).toHaveText("tape 12s");
  await expect(card.getByTestId("live-position")).toBeVisible();
  expect(await offsetInCard()).toEqual(before);

  await card.getByTestId("live-unflip").click();
  await expect(card).toHaveAttribute("data-flipped", "false");
  await expect(card.getByTestId("live-face-stats")).toBeVisible();
});

test("the prematch face is the RANKED BOARD'S OWN CARD, not a second "
  + "layout for one read", async ({ page }) => {
  await open(page, STRIP);
  const card = liveCard(page, 101);
  await card.getByTestId("live-flip").click();
  const back = card.getByTestId("live-face-prematch");

  // These testids belong to PickerColumn/PickerRead and are asserted by
  // e2e/picker.spec.ts against the columns below. Finding them here is
  // the proof that the flip renders THE SAME COMPONENTS rather than a
  // hand-copied lookalike free to drift from them.
  await expect(back.getByTestId("row-anchor")).toBeVisible();
  await expect(back.getByTestId("row-anchor")).toHaveText(/1\.30/);
  await expect(back.getByTestId("rank-dumbbell")).toHaveCount(1);
  await expect(back.getByTestId("form-strip")).toHaveCount(2);
  await expect(back.getByTestId("home-badge")).toHaveText("H");
  await expect(back.getByTestId("shape-chip")).toHaveText("CLEAN");
  // Stage 1, in the board's own words, and the book beneath it.
  await expect(back).toContainText("#4 v #17");
  await expect(back).toContainText("ask 59¢");

  // NO SEASON BADGE ON ANY CARD — the league header carries the basis,
  // and it is one sentence about a league, not a fact about a fixture.
  await expect(card.getByTestId("season-weight")).toHaveCount(0);

  // The columns below are untouched: their own cards still render, and
  // the live card is not one of them.
  await expect(page.getByTestId("picker-row")).toHaveCount(1);
});

// ============================================ the draw label, MEASURED

/** A model/market pair on the match block, as the route now emits it
 *  (card.live_model_v_market): the in-play engine's triple for this
 *  state beside the de-vigged live ask book. Wired 2026-09-07 — before
 *  that no recorded response carried one and this block refused on every
 *  card in production. */
function withTriples(model: number[], market: number[],
                     extra: Record<string, unknown> = {}) {
  return liveMatch({
    model_v_market: {
      model: { home: model[0], draw: model[1], away: model[2] },
      market: { home: market[0], draw: market[1], away: market[2] },
      side: "home",
      ...extra,
    },
  });
}

test("the caveat under the bars is the BACKEND's sentence, not one typed here",
  async ({ page }) => {
    /* It was hard-coded in this component, which meant the day the
       engine's inputs changed the disclaimer would still describe the
       old ones — and a caveat that UNDER-claims what the model saw is
       worse than no caveat at all. The module that HAS the fact now
       writes the line; the long form rides on the title for a reader who
       wants the whole of it. */
    await open(page, { ...STRIP, matches: [withTriples([62, 21, 17], [55, 24, 21], {
      caveat: "model reads five numbers · market is the de-vigged ask book",
      caveat_basis: "the engine reads minute, both scores and two frozen "
        + "rates, and NOT a measured edge",
    })] });
    const cav = page.getByTestId("live-caveat").first();
    await expect(cav).toHaveText(/model reads five numbers/);
    await expect(cav).toHaveAttribute("title", /NOT a measured edge/);
  });

test("the model's LIVE read is drawn beside the frozen one, never instead of it",
  async ({ page }) => {
    /* The same engine, solved on B3's blended rates — the triple moves
       with the shots the match produced. Both rows are drawn and
       neither is ranked: which is better against the price this engine
       calibrates on is unmeasured (price_baseline_unmeasured), so
       picking one here would be this card deciding. */
    await open(page, { ...STRIP, matches: [liveMatch({
      model_v_market: {
        model: { home: 62, draw: 21, away: 17 },
        market: { home: 55, draw: 24, away: 21 },
        side: "home",
      },
      model_live: {
        model_live: { home: 71, draw: 18, away: 11 },
        model_frozen: { home: 62, draw: 21, away: 17 },
        moved_by: { home: 9, draw: -3, away: -6 },
      },
    })] });
    const card = page.getByTestId("live-card").first();
    const bars = card.getByTestId("live-price-bar");
    // three rows: the frozen model, the live one, the market
    await expect(bars).toHaveCount(3);
    await expect(card).toContainText("model · live");
    await expect(card).toContainText("model");
    await expect(card).toContainText("market");
  });

test("the live row carries its OWN sentence, and it leaves with the row",
  async ({ page }) => {
    /* ONE LINE MAY NOT SPEAK FOR A BAR IT DOES NOT OWN. The caveat under
       this block once read "not the stats above" — true while there were
       two bars, false the day a third was added that reads exactly those
       stats. Each row's words travel with the row now, so the eighty-six
       minutes a match carries no measured horizon take the sentence away
       with the bar it described. */
    await open(page, { ...STRIP, matches: [withTriples(
      [62, 21, 17], [55, 24, 21], {})] });
    const card = page.getByTestId("live-card").first();
    // no live row on this payload — and so no line for it
    await expect(card.getByTestId("live-model-live-line")).toHaveCount(0);
    await expect(card.getByTestId("live-caveat").first())
      .not.toHaveText(/not the stats above/);

    await open(page, { ...STRIP, matches: [liveMatch({
      model_v_market: {
        model: { home: 62, draw: 21, away: 17 },
        market: { home: 55, draw: 24, away: 21 }, side: "home",
      },
      model_live: {
        model_live: { home: 71, draw: 18, away: 11 },
        line: "model · live adds this side's shots to the minute",
      },
    })] });
    const c2 = page.getByTestId("live-card").first();
    await expect(c2.getByTestId("live-model-live-line"))
      .toHaveText(/adds this side's shots/);
  });

test("a live read the backend refused leaves the other two rows alone",
  async ({ page }) => {
    /* It refuses far more often than it draws — M1 fitted the
       shots-to-goals conversion at four minutes and nothing
       interpolates one for minute 47 — so its absence is the NORMAL
       case and must cost the block nothing. */
    await open(page, { ...STRIP, matches: [liveMatch({
      model_v_market: {
        model: { home: 62, draw: 21, away: 17 },
        market: { home: 55, draw: 24, away: 21 },
        side: "home",
      },
      model_live: { refused: "no blend is persisted for this fixture" },
    })] });
    const card = page.getByTestId("live-card").first();
    await expect(card.getByTestId("live-price-bar")).toHaveCount(2);
    await expect(card).not.toContainText("model · live");
    await expect(card.getByTestId("live-gap")).toHaveCount(1);
  });

test("a payload with no caveat line still says what the model could not see",
  async ({ page }) => {
    /* THE FALLBACK IS NOT AN EMPTY LINE. Of the three possible states —
       the backend's sentence, this component's older one, and silence —
       silence is the only one that lets a reader take the bars as
       measured against the stats above them. */
    await open(page, { ...STRIP, matches: [withTriples([62, 21, 17], [55, 24, 21])] });
    await expect(page.getByTestId("live-caveat").first())
      .toHaveText(/clock and the scoreline/);
  });

test("a block the backend REFUSED draws no bar and no gap", async ({ page }) => {
    /* The route emits a named refusal for a state the engine claimed no
       triple for, a failed market read, or a partial book. Half a
       comparison must not reach the screen: one bar beside an empty one
       reads as a gap of the whole bar. */
    await open(page, { ...STRIP, matches: [liveMatch({
      model_v_market: {
        refused: "the in-play engine claimed no triple for this state",
      },
    })] });
    const card = page.getByTestId("live-card").first();
    await expect(card.getByTestId("live-model-absent")).toBeVisible();
    await expect(card.getByTestId("live-gap")).toHaveCount(0);
  });

test("a draw wide enough for its own label keeps it INSIDE the segment; "
  + "one that is not takes a chip — decided by measuring, not by a "
  + "typed percentage", async ({ page }) => {
  // A 27% draw on a four-up card is comfortably wider than "27%".
  await open(page, {
    ...ENVELOPE, matches: [withTriples([58, 27, 15], [57, 26, 17])],
  });
  const card = liveCard(page, 101);
  const labels = card.getByTestId("live-draw-label");
  await expect(labels).toHaveCount(2);
  await expect(labels.first()).toHaveAttribute("data-fit", "inside");

  // THE SAME CARD, THE SAME WIDTH, A NARROWER DRAW. 1% of the track is
  // about two pixels and the label needs about twenty-two, so it cannot
  // sit inside its own segment and takes the chip instead. Nothing in
  // the component was told that 1 is small: the label's rendered width
  // was compared against its rendered segment.
  await page.unroute("**/api/bet-suggester/watched-strip**");
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json({
      ...ENVELOPE, matches: [withTriples([97, 1, 2], [96, 2, 2])],
    })));
  await page.reload();
  await page.getByTestId("live-section").waitFor();
  const narrow = liveCard(page, 101)
    .getByTestId("live-draw-label").first();
  await expect(narrow).toHaveAttribute("data-fit", "chip");

  // AND IT IS CLAMPED INSIDE THE TRACK. A narrow draw near an end must
  // not hang off the edge of the card.
  const bar = liveCard(page, 101)
    .getByTestId("live-price-bar").first();
  const track = await bar.locator("div.relative").boundingBox();
  const box = await narrow.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(track!.x - 1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(track!.x + track!.width + 1);
});

test("ONE PERCENTAGE, TWO VERDICTS: the same draw sits inside its "
  + "segment on a one-up card and takes the chip on a four-up one",
  async ({ page }) => {
    // THIS IS THE WHOLE ARGUMENT FOR MEASURING. Any percentage typed
    // into the component as a cut-off would have to be right at both of
    // these widths, and 9% is a counter-example: on a phone the section
    // is one column and the track is wide enough to hold "9%"; at
    // desktop the board's own four columns leave a track a fraction of
    // that, and the same 9% cannot. A component that decided from the
    // number alone would give one of these two the wrong answer, and
    // this test is what fails when somebody replaces the measurement
    // with a threshold.
    await open(page, {
      ...ENVELOPE, matches: [withTriples([58, 9, 33], [57, 10, 33])],
    });
    const label = () => liveCard(page, 101)
      .getByTestId("live-draw-label").first();

    // FOUR-UP, at the desktop viewport this suite runs: too narrow.
    await expect(label()).toHaveAttribute("data-fit", "chip");

    // ONE-UP, at a phone width: the same 9%, now wide enough — and the
    // component re-measured to get here, because nothing about the
    // payload changed.
    await page.setViewportSize({ width: 400, height: 900 });
    await expect(label()).toHaveAttribute("data-fit", "inside");

    // And back, so the re-measure is proven in both directions rather
    // than once in the direction that happens to work.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(label()).toHaveAttribute("data-fit", "chip");
  });

test("a percentage above zero that rounds to zero reads <1%, never 0%",
  async ({ page }) => {
    await open(page, {
      ...ENVELOPE, matches: [withTriples([99.4, 0.4, 0.2], [99, 0.6, 0.4])],
    });
    const card = liveCard(page, 101);
    await expect(card.getByTestId("live-draw-label").first())
      .toHaveText("<1%");
    await expect(card.getByTestId("live-price-bar").first())
      .not.toContainText("0%");
  });

// ================================================ refusals, not blanks

test("the blocks this payload cannot fill REFUSE BY NAME — and a "
  + "refusal that had to be made is not drawn like a routine absence",
  async ({ page }) => {
    await open(page, STRIP);
    const card = liveCard(page, 101);

    // A TILT IS A COMPOSITE AND THE READ FORBIDS IT, in the backend's
    // own sentence. Somebody decided that, so it gets the band.
    const tilt = card.getByTestId("live-tilt-refused");
    await expect(tilt).toContainText("NO COMPOSITE BEFORE M1");
    await expect(tilt).toHaveAttribute("data-absence", "refused");

    // NO MODEL TRIPLE AND NO DE-VIGGED BOOK on this read — a normal
    // night, so a quiet line, and NO BAR drawn off half a comparison.
    const model = card.getByTestId("live-model-absent");
    await expect(model).toHaveAttribute("data-absence", "routine");
    await expect(card.getByTestId("live-price-bar")).toHaveCount(0);
    await expect(card.getByTestId("live-gap")).toHaveCount(0);

    // THE CAVEAT IS NOT OPTIONAL. It says what the `model` bar is made
    // of — state_probabilities on the frozen T-10 rates, which read the
    // clock and the scoreline. It no longer denies the model saw the
    // stats above, because `model · live` may be drawn beside it doing
    // exactly that; each bar carries its own claim.
    await expect(card.getByTestId("live-caveat"))
      .toHaveText(/clock and the scoreline.*de-vigged book/);

    // NO CARD COUNT IS ON THIS PAYLOAD, and the line says so rather
    // than disappearing — a missing card row reads as a match with no
    // cards in it, which is a claim.
    await expect(card.getByTestId("live-cards-absent"))
      .toHaveAttribute("data-absence", "routine");
  });

// =========================================== the six match states

test("both sides get a word, and it is the one the bars above support",
  async ({ page }) => {
    await open(page, STRIP);
    const card = liveCard(page, 101);
    const row = card.getByTestId("live-state");
    await expect(row).toBeVisible();
    // The default card's possession bar reads 58.4 / 41.6 — inside the
    // cut on the ball axis — so the word that follows from it is
    // CONTEST on BOTH sides. The card renders what the payload says
    // and computes nothing.
    await expect(card.getByTestId("live-state-home")).toHaveText("CONTEST");
    await expect(card.getByTestId("live-state-away")).toHaveText("CONTEST");
    // AND THE CELL THAT FIRED IT, under each word.
    await expect(row).toContainText("ball even · chances");
    await expect(row).toContainText("ball even · no chances");
    await expect(row).toContainText("state");
  });

test("every pairing the backend can send is drawn, per side, in the "
  + "payload's own words", async ({ page }) => {
  const cards = [
    { id: 301, pair: STATES.siege, want: ["SIEGE", "PINNED"] },
    { id: 302, pair: STATES.blunt, want: ["BLUNT", "COUNTER"] },
    { id: 303, pair: STATES.lowBlock, want: ["LOW BLOCK", "SIEGE"] },
  ];
  await open(page, {
    ...ENVELOPE,
    matches: cards.map((c) => liveMatch({
      fixture_id: c.id, states: states(c.pair),
    })),
  });
  for (const c of cards) {
    const card = liveCard(page, c.id);
    await expect(card.getByTestId("live-state-home")).toHaveText(c.want[0]);
    await expect(card.getByTestId("live-state-away")).toHaveText(c.want[1]);
  }
  // THE PARKED BUS HAS ITS OWN WORD. It used to wear the same one as an
  // end-to-end game, which is the defect this set was built to close.
  await expect(liveCard(page, 303).getByTestId("live-state"))
    .toContainText("no ball · no chances · ahead");
});

test("a row the backend could not read carries NO state, and says "
  + "missing is never an even match", async ({ page }) => {
  await open(page, { ...ENVELOPE, matches: [TAPE_FAILED] });
  const card = liveCard(page, 606);
  const absent = card.getByTestId("live-state-absent");
  await expect(absent).toBeVisible();
  await expect(absent).toContainText("Missing is never an even match");
  await expect(absent).toHaveAttribute("data-absence", "routine");
  // NEVER CONTEST, and never one word beside an empty slot: the six are
  // a PAIR by construction, so half of one is a claim the payload never
  // made.
  await expect(card.getByTestId("live-state-home")).toHaveCount(0);
  await expect(card.getByTestId("live-state-away")).toHaveCount(0);
  await expect(card.getByTestId("live-state")).not.toContainText("CONTEST");
});

test("an emitter that BROKE says so in its own words — a failed read is "
  + "not a row without possession", async ({ page }) => {
  // card._layer's fault isolation. "We could not look" and "there is
  // nothing there" are different claims, and the fixed sentence states
  // a CAUSE — no possession — that nobody observed here.
  const broke = liveMatch({
    fixture_id: 701,
    states: { unavailable: "match states 701 failed to assemble "
      + "(OperationalError: server closed the connection)" },
  });
  await open(page, { ...ENVELOPE, matches: [broke] });
  const line = liveCard(page, 701).getByTestId("live-state-absent");
  await expect(line).toContainText("failed to assemble");
  await expect(line).not.toContainText("carries no possession");
  await expect(liveCard(page, 701).getByTestId("live-state"))
    .toHaveAttribute("data-state", "unavailable");
});

test("the state turns WITH the bars it is derived from", async ({ page }) => {
  // A label whose evidence has flipped away is the thing this placement
  // exists to avoid: the two axes are two of the bars in the block that
  // turns, so the word has to turn with them.
  await open(page, STRIP);
  const card = liveCard(page, 101);
  await expect(card.getByTestId("live-state")).toBeVisible();
  await card.getByTestId("live-flip").click();
  await expect(card).toHaveAttribute("data-flipped", "true");
  await expect(card.getByTestId("live-state")).not.toBeVisible();
  await card.getByTestId("live-unflip").click();
  await expect(card.getByTestId("live-state")).toBeVisible();
});

test("a state is plain ink — no accent, no traffic light", async ({ page }) => {
  // Gold is the brand mark and up/warn/neg is the verdict palette. A
  // state is a description of the row and borrows neither, so the six
  // words must all render in the SAME colour whatever they say.
  await open(page, {
    ...ENVELOPE,
    matches: [liveMatch({ fixture_id: 401, states: states(STATES.siege) }),
              liveMatch({ fixture_id: 402, states: states(STATES.blunt) }),
              liveMatch({ fixture_id: 403,
                          states: states(STATES.lowBlock) })],
  });
  const inks = new Set<string>();
  for (const id of [401, 402, 403]) {
    for (const which of ["live-state-home", "live-state-away"]) {
      inks.add(await liveCard(page, id).getByTestId(which)
        .evaluate((el) => getComputedStyle(el).color));
    }
  }
  expect(inks.size).toBe(1);
  // and that one ink is the card's high ink, not the accent or a light
  const ink = [...inks][0];
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--accent")
      .trim());
  const hi = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--ink-hi")
      .trim());
  expect(ink).not.toBe(accent);
  expect(ink.replace(/\s/g, "")).toBe(
    `rgb(${parseInt(hi.slice(1, 3), 16)},${parseInt(hi.slice(3, 5), 16)},${
      parseInt(hi.slice(5, 7), 16)})`);
});

test("the card computes no state of its own — the word comes off the "
  + "payload and nowhere else", async ({ page }) => {
  // THE SAME BARS, A DIFFERENT WORD. If this surface derived the state
  // from the bars it would overrule the payload here; it does not, and
  // the point of that is a cut point that cannot be drawn in two
  // places.
  await open(page, {
    ...ENVELOPE,
    matches: [liveMatch({ fixture_id: 501, states: states(STATES.siege) })],
  });
  await expect(liveCard(page, 501).getByTestId("live-state-home"))
    .toHaveText("SIEGE");
  // and a payload with no states block at all draws no row rather than
  // inventing one
  await open(page, {
    ...ENVELOPE,
    matches: [liveMatch({ fixture_id: 502, states: undefined })],
  });
  await expect(liveCard(page, 502).getByTestId("live-state"))
    .toHaveCount(0);
});

test("no state on any card names a moment to act", async ({ page }) => {
  await open(page, {
    ...ENVELOPE,
    matches: [liveMatch({ fixture_id: 601, states: states(STATES.siege) }),
              liveMatch({ fixture_id: 602, states: states(STATES.blunt) }),
              liveMatch({ fixture_id: 603,
                          states: states(STATES.lowBlock) }),
              TAPE_FAILED],
  });
  const rows = page.getByTestId("live-state");
  const n = await rows.count();
  expect(n).toBe(4);                       // not a vacuous scan
  for (let i = 0; i < n; i += 1) {
    const said = (await rows.nth(i).innerText()).toLowerCase();
    expect(said.trim()).not.toBe("");
    for (const imperative of ["you should", "cash out", "sell now",
      "buy now", "act now", "take profit", "we advise", "we recommend",
      "back the", "lay the", "get out"]) {
      expect(said).not.toContain(imperative);
    }
  }
});

test("a dismissal is a refusal that had to be MADE, and takes the band",
  async ({ page }) => {
    const dismissed = liveMatch({
      fixture_id: 202,
      positions: [{
        position: { outcome_key: "home_win", side: "home", size: "100",
          entry_price: 0.46, entry_cost_dollars: "46.00",
          entry_note: "sunk" },
        red_card_void: { refusal_code: "dismissal",
          refused: "dismissal: a red card has been seen — every "
            + "grid-derived number voids from first sighting" },
      }],
    });
    await open(page, { ...ENVELOPE, matches: [dismissed] });
    const band = liveCard(page, 202)
      .getByTestId("live-dismissal");
    await expect(band).toHaveAttribute("data-absence", "refused");
    await expect(band).toContainText("a red card has been seen");
    await expect(liveCard(page, 202)
      .getByTestId("live-cards-absent")).toHaveCount(0);
  });

test("a dismissal on a fixture with NO HELD POSITION is drawn too — it "
  + "arrives on the match, not on a holding", async ({ page }) => {
    // THE BRANCH THAT WAS DEAD FROM THE DAY IT WAS WRITTEN. This card
    // looked for `dismissal` in `state.refusals`, and api/main.py
    // hand-classifies that code into WATCHED_STRIP_STATE_CODES_ELSEWHERE
    // precisely because it does NOT ride on the state block — "it voids
    // nothing on the state block, which reports what the tape says
    // rather than conditioning on it". So the only two sites this file
    // could actually reach were both INSIDE a position, and a red card
    // on a match nobody holds went undrawn while the file header said
    // it takes the bordered band.
    //
    // It arrives on `model_live`: card.live_informed_read refuses the
    // blended read under `dismissal` when B3 withdrew a side's lambdas,
    // and that block is per MATCH. The words below are B3's own,
    // carried verbatim by the emitter rather than restated.
    const dismissed = liveMatch({
      fixture_id: 203,
      positions: [],                         // nothing is held here
      model_live: {
        refusal_code: "dismissal",
        refused: "dismissal: a dismissal is on this fixture's tape (1 "
          + "seen), and the blended rates were fitted on eleven-a-side "
          + "play — they do not describe ten men, so the read is "
          + "WITHDRAWN rather than solved on the half that survived",
      },
    });
    await open(page, { ...ENVELOPE, matches: [dismissed] });
    const card = liveCard(page, 203);
    const band = card.getByTestId("live-dismissal");
    await expect(band).toHaveAttribute("data-absence", "refused");
    await expect(band).toContainText("do not describe ten men");
    // and the routine "no card count on this read" line is NOT what a
    // witnessed sending-off gets
    await expect(card.getByTestId("live-cards-absent")).toHaveCount(0);
  });

// ================================================== THE HAZARD LINE
//
// RECORDED OFF entry_map.py's OWN `_composed()` and `_refuse()`, called
// on a first-goal-timing cell — not written here. The two shapes are
// the whole point of the test: BOTH are non-null values of `reached`,
// which is what made a presence check on that key meaningless.

const REACHED_REFUSED = {
  refusal_code: "thin_cell_floor",
  refused: "thin_cell_floor: scoreless_fav_decay/clean_11v11/heavy/60 "
    + "is not a cell in the artifact",
};

const REACHED_MEASURED = {
  state: "an opener by either side at or before 60'",
  p_first_goal_percent: 55.0,
  p_first_goal_wilson_band_percent: [53.6, 56.4],
  n: 4992,
  k: 2746,
  composed_from: ["1-15", "16-30", "31-45", "46-60"],
  source_cell: "first_goal_timing/clean_11v11/bands/heavy/bins",
  partition: "every match in the cell falls in exactly one bin; k sums "
    + "to n",
  either_side: "by either side — the partition is by MINUTE, not by "
    + "scorer",
  by_side: { refusal_code: "thin_cell_floor",
    refused: "thin_cell_floor: no grid measures WHICH SIDE scores the "
      + "opener" },
};

/** A position whose entry map's FIRST branch refused and whose second
 *  carries a real rate — the order that produced the false line. */
function withBranches(branches: Record<string, unknown>) {
  return liveMatch({
    fixture_id: 303,
    positions: [{
      position: { outcome_key: "home_win", side: "home", size: "100",
        entry_price: 0.46, entry_cost_dollars: "46.00",
        entry_note: "sunk" },
      entry_map: { version: "entry-map-v1", branches },
    }],
  });
}

test("the hazard line reads the MEASURED branch, not the first one with "
  + "a `reached` key", async ({ page }) => {
    // EVERY branch in entry_map.py sets `reached` — `_composed()`
    // returns the composed tail OR a refusal dict, and both are
    // non-null — so `find(b => b.reached != null)` could only ever
    // return the first branch. When that one was refused and a later
    // one carried a rate, the card printed "no measured hazard on this
    // read": a missing number rendered as a measured absence, which is
    // the one direction this surface must never fail in.
    await open(page, { ...ENVELOPE, matches: [withBranches({
      scoreless_at_60: { state: "still 0-0 at 60'",
                         reached: REACHED_REFUSED },
      favourite_opens: { state: "the favourite opens",
                         reached: REACHED_MEASURED },
    })] });
    const card = liveCard(page, 303);
    const line = card.getByTestId("live-hazard");
    await expect(line).toBeVisible();
    // the rate, its band and its denominator, all off the SAME cell
    await expect(line).toContainText("55.0%");
    await expect(line).toContainText("[53.6, 56.4]");
    await expect(line).toContainText("n=4,992");
    await expect(line).toContainText("an opener by either side");
    // ...and the false sentence is nowhere on the card
    await expect(card.getByTestId("live-hazard-absent")).toHaveCount(0);
  });

test("with every branch refused the line says so IN THE ARTIFACT'S OWN "
  + "WORDS, and never that nothing was measured", async ({ page }) => {
    await open(page, { ...ENVELOPE, matches: [withBranches({
      scoreless_at_60: { state: "still 0-0 at 60'",
                         reached: REACHED_REFUSED },
      favourite_opens: { state: "the favourite opens",
                         reached: { ...REACHED_REFUSED } },
    })] });
    const card = liveCard(page, 303);
    const absent = card.getByTestId("live-hazard-absent");
    await expect(absent).toBeVisible();
    // WHY, by the registry name the corpus refused under — a reader
    // who is told only "no measured hazard" learns nothing about
    // whether a cell existed
    await expect(absent).toHaveAttribute("data-code", "refused");
    await expect(absent).toContainText("thin_cell_floor");
    await expect(absent).toContainText("is not a cell in the artifact");
    await expect(card.getByTestId("live-hazard")).toHaveCount(0);
  });

test("with nothing held the hazard line says THAT, rather than that a "
  + "measurement came back empty", async ({ page }) => {
    await open(page, { ...ENVELOPE,
      matches: [liveMatch({ fixture_id: 304, positions: [] })] });
    const absent = liveCard(page, 304).getByTestId("live-hazard-absent");
    await expect(absent).toHaveAttribute("data-code", "nothing-held");
    await expect(absent).toContainText("nothing is held on this match");
  });

// ============================================== the section's own rules

test("the section says nothing in it is ranked, and prints no rank on "
  + "any card", async ({ page }) => {
  await open(page, STRIP);
  await expect(page.getByTestId("live-not-ranked"))
    .toContainText("nothing here is ranked");
  // The ranked board prints 01/02/03 down each column; a live card
  // printing one would be a number a reader is entitled to read as an
  // order, in a section that has just said there is none.
  await expect(page.getByTestId("live-card").getByTestId("row-rank"))
    .toHaveCount(0);
});

test("a ninth live match starts a second page, ordered by kickoff, and "
  + "the page a reader is on survives a poll", async ({ page }) => {
  // Nine, with kickoffs DESCENDING in the payload so a section that
  // drew them in arrival order would fail this.
  const nine = Array.from({ length: 9 }, (_, i) => liveMatch({
    fixture_id: 900 + i,
    espn_event_id: `evt-${9 - i}`,
    home: `Home ${9 - i}`, away: `Away ${9 - i}`,
  }));
  const rows = Array.from({ length: 9 }, (_, i) => boardRow({
    event_id: `evt-${i + 1}`,
    favourite: `Home ${i + 1}`, opponent: `Away ${i + 1}`,
    home: `Home ${i + 1}`, away: `Away ${i + 1}`,
    kickoff: `2026-12-10T${String(12 + i).padStart(2, "0")}:00:00Z`,
  }));
  // COUNT THE POLLS. Asserting the page is still 2 without waiting for
  // a poll to actually land proves nothing: the attribute is already 2
  // and the assertion passes on the first tick. The counter makes the
  // wait REAL — the test does not move on until the section has re-read
  // the endpoint at least twice.
  let polls = 0;
  await page.route("**/api/bet-suggester/watched-strip**", (r) => {
    polls += 1;
    return r.fulfill(json({ ...ENVELOPE, matches: nine }));
  });
  await page.route("**/api/picker/board**",
    (r) => r.fulfill(json({ ...BOARD, rows })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.goto("/bet-suggester");
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });

  const section = page.getByTestId("live-section");
  await expect(section).toHaveAttribute("data-pages", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(8);
  // KICKOFF ORDER, NOT ARRIVAL ORDER: the earliest kickoff is first.
  await expect(page.getByTestId("live-card").first())
    .toContainText("Home 1");

  // A NINTH STARTS PAGE TWO rather than a third row.
  await page.getByTestId("live-page").nth(1).click();
  await expect(section).toHaveAttribute("data-page", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(1);
  await expect(page.getByTestId("live-card")).toContainText("Home 9");

  // AND THE PAGE SURVIVES A POLL. The section re-reads every 15s; a
  // reader walked back to page one mid-read loses their place for a
  // reason that has nothing to do with the match. WatchedStrip polls
  // the same endpoint on the same clock, so the counter climbs by two
  // per tick; waiting for it to pass the first response is enough to
  // guarantee at least one re-read has been applied to this section.
  const seen = polls;
  await expect.poll(() => polls, { timeout: 30_000 })
    .toBeGreaterThan(seen);
  await expect(section).toHaveAttribute("data-page", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(1);
  await expect(page.getByTestId("live-card")).toContainText("Home 9");
});

test("the live section is ABOVE the ranked board and outside it",
  async ({ page }) => {
    await open(page, STRIP);
    const order = await page.evaluate(() => {
      const live = document.querySelector('[data-testid="live-section"]');
      const board = Array.from(document.querySelectorAll("h2"))
        .find((h) => h.textContent?.includes("Ranked by table gap"));
      if (!live || !board) return null;
      return {
        before: !!(live.compareDocumentPosition(board)
          & Node.DOCUMENT_POSITION_FOLLOWING),
        nested: live.contains(board) || board.contains(live),
      };
    });
    expect(order).toEqual({ before: true, nested: false });
  });

test("nothing is drawn at all when no declared match is under way",
  async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
    await page.route("**/api/bet-suggester/watched-strip**", (r) =>
      r.fulfill(json({ ...ENVELOPE, matches: [] })));
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("picker-row").first()).toBeVisible();
    // ABSENT, NOT EMPTY: an empty frame headed "Under way" reads as a
    // claim that nothing is, and this read did not say that.
    await expect(page.getByTestId("live-section")).toHaveCount(0);
  });

// ==================================================== YOUR EXIT LINES
//
// The operator's own pre-committed numbers, evaluated in the backend
// and REPORTED here. What is at stake on this surface, and it is not
// pixels:
//
//   - NOT ASKED IS NOT NOT-FIRED. The blended rates exist at four
//     minutes a match and the minute-60 gate takes two of those away,
//     so "could not be asked" is the ORDINARY state of this block — and
//     a reader takes in a column, not a payload. A line that could not
//     be asked draws its own sentence and NO verdict word, because a
//     blank in that column reads as "it held".
//   - THIS SIDE COMPUTES NO LINE. Every reading, every threshold and
//     every verdict word is a string the payload carried.
//   - PLAIN INK. A line firing is the operator's own number being
//     reached, not a verdict about the match, so it is not on the
//     traffic light.

test("the lines are drawn under the position, in the payload's own "
  + "words", async ({ page }) => {
    await open(page, STRIP);
    const card = liveCard(page, 101);
    const block = card.getByTestId("live-exit-lines");
    await expect(block).toBeVisible();
    await expect(card).toContainText("your exit lines");

    const rows = card.getByTestId("live-exit-line");
    await expect(rows).toHaveCount(3);

    // THE FOUR COLUMNS, none of them assembled here.
    const exposure = rows.filter({ has: page.locator("text=+8.0") });
    await expect(exposure).toHaveAttribute("data-state", "fired");
    await expect(exposure).toContainText("+8.0 vs frozen");
    await expect(exposure).toContainText(">= your +6");
    await expect(exposure).toContainText("FIRED");
    await expect(rows.nth(1)).toContainText("35.8% equaliser in 15'");
    await expect(rows.nth(1)).toContainText(">= your 30%");

    // AND THE SENTENCE UNDER THEM IS THE BACKEND'S, verbatim.
    await expect(card.getByTestId("live-exit-summary"))
      .toHaveText("both fired · exiting now banks $38.50 and gives up "
        + "$2.70");
  });

test("a line that could not be ASKED draws no verdict word at all",
  async ({ page }) => {
    await open(page, {
      ...ENVELOPE,
      matches: [liveMatch({
        fixture_id: 303,
        positions: [{
          position: { outcome_key: "home_win", side: "home", size: "100",
            entry_price: 0.46, entry_cost_dollars: "46.00",
            entry_note: "sunk" },
          exit_lines: EXIT_LINES_NONE_ASKED,
        }],
      })],
    });
    const card = liveCard(page, 303);
    const rows = card.getByTestId("live-exit-line");
    await expect(rows).toHaveCount(3);

    // NOT ONE VERDICT WORD ON THE CARD. This is the assertion the whole
    // block exists for: three lines nobody could ask must not render as
    // three lines that held.
    await expect(card.getByTestId("live-exit-verdict")).toHaveCount(0);
    const said = await card.getByTestId("live-exit-lines").innerText();
    expect(said).not.toContain("FIRED");
    expect(said).not.toContain("not fired");

    // Each row says WHY, in the gate's own words, and none is blank.
    for (let i = 0; i < 3; i += 1) {
      await expect(rows.nth(i)).toHaveAttribute("data-state", "not-asked");
      expect((await rows.nth(i).innerText()).trim()).not.toBe("");
    }
    await expect(rows.nth(0)).toContainText("the operator's line opens "
      + "at 60' and it is 45'");
    await expect(rows.nth(1)).toContainText("the scoreline is level");
    await expect(rows.nth(2)).toContainText("45' is not a horizon");
    await expect(card.getByTestId("live-exit-summary"))
      .toHaveText("none of your lines was asked on this tick");
  });

test("a fired line and a line that did not fire are told apart, and "
  + "neither is on the traffic light", async ({ page }) => {
    await open(page, {
      ...ENVELOPE,
      matches: [liveMatch({
        fixture_id: 304,
        positions: [{
          position: { outcome_key: "home_win", side: "home", size: "100",
            entry_price: 0.46, entry_cost_dollars: "46.00",
            entry_note: "sunk" },
          exit_lines: EXIT_LINES_BLOCKED,
        }],
      })],
    });
    const card = liveCard(page, 304);
    const rows = card.getByTestId("live-exit-line");
    await expect(rows.nth(0)).toHaveAttribute("data-state", "fired");
    await expect(rows.nth(1)).toHaveAttribute("data-state", "not-fired");
    await expect(rows.nth(2)).toHaveAttribute("data-state", "not-asked");
    await expect(card.getByTestId("live-exit-verdict")).toHaveCount(2);

    // THE CEILING BLOCKS AND THE POSITION CONTINUES — the backend's
    // sentence, drawn whole.
    await expect(card.getByTestId("live-exit-summary"))
      .toContainText("BLOCKS this exit");
    await expect(card.getByTestId("live-exit-summary"))
      .toContainText("The position continues");

    // PLAIN INK: no colour class from the verdict palette reaches these
    // rows. The classes are read off the DOM rather than asserted as a
    // screenshot, so a later restyle onto the traffic light fails here.
    const classes = await card.getByTestId("live-exit-lines")
      .evaluate((el) => Array.from(el.querySelectorAll("*"))
        .map((n) => n.className).join(" "));
    for (const hue of ["text-up", "text-warn", "text-neg", "text-accent",
      "bg-up", "bg-warn", "bg-neg"]) {
      expect(classes).not.toContain(hue);
    }
  });

test("no exit line on any card names a moment to act", async ({ page }) => {
  await open(page, {
    ...ENVELOPE,
    matches: [
      liveMatch({ fixture_id: 305 }),
      liveMatch({ fixture_id: 306, positions: [{
        position: { outcome_key: "home_win", side: "home", size: "100",
          entry_price: 0.46, entry_cost_dollars: "46.00",
          entry_note: "sunk" },
        exit_lines: EXIT_LINES_BLOCKED }] }),
      liveMatch({ fixture_id: 307, positions: [{
        position: { outcome_key: "home_win", side: "home", size: "100",
          entry_price: 0.46, entry_cost_dollars: "46.00",
          entry_note: "sunk" },
        exit_lines: EXIT_LINES_NONE_ASKED }] }),
    ],
  });
  const blocks = page.getByTestId("live-exit-lines");
  const n = await blocks.count();
  expect(n).toBe(3);                        // not a vacuous scan
  for (let i = 0; i < n; i += 1) {
    const said = (await blocks.nth(i).innerText()).toLowerCase();
    expect(said.trim()).not.toBe("");
    // SELL is an unattributed imperative and this block does not have
    // one; the money travels and the word does not.
    expect(said).not.toContain("sell");
    for (const imperative of ["you should", "cash out", "sell now",
      "buy now", "act now", "take profit", "we advise", "we recommend",
      "get out", "close the position"]) {
      expect(said).not.toContain(imperative);
    }
    // AND THE LINES ARE ATTRIBUTED TO HIM, on every card that has them.
    expect(said).toContain("your");
  }
});

test("the card computes no line of its own — the verdict comes off the "
  + "payload and nowhere else", async ({ page }) => {
    // A READING AND A VERDICT THAT DISAGREE, on purpose. The backend
    // cannot emit this: +9.4 is over the operator's +6 and the gate
    // would have fired. If this surface compared the two numbers itself
    // it would overrule the payload here — and a pre-commitment
    // evaluated in two places is a pre-commitment that can disagree
    // with the ledger that records it.
    const contradictory = {
      version: "exit-lines-v1",
      lines: [
        { name: "exposure", asked: true, fired: false,
          reads: "+9.4 vs frozen", against: ">= your +6" },
        { name: "imminence", asked: true, fired: true,
          reads: "11% equaliser in 15'", against: ">= your 30%" },
        { name: "next_goal", asked: false, fired: null,
          against: "< your 30%", code: "level_scoreline",
          says: "not asked - the score is 1-0 and this line is asked "
            + "at level scorelines only" },
      ],
      fired: ["imminence"],
      summary: { says: "imminence fired", fired: ["imminence"],
        blocked: false },
    };
    await open(page, {
      ...ENVELOPE,
      matches: [liveMatch({
        fixture_id: 310,
        positions: [{
          position: { outcome_key: "home_win", side: "home", size: "100",
            entry_price: 0.46, entry_cost_dollars: "46.00",
            entry_note: "sunk" },
          exit_lines: contradictory,
        }],
      })],
    });
    const rows = liveCard(page, 310).getByTestId("live-exit-line");
    await expect(rows.nth(0)).toHaveAttribute("data-state", "not-fired");
    await expect(rows.nth(0)).toContainText("not fired");
    await expect(rows.nth(1)).toHaveAttribute("data-state", "fired");
    await expect(rows.nth(1)).toContainText("FIRED");
    // and the summary is the payload's, not one assembled from the rows
    await expect(liveCard(page, 310).getByTestId("live-exit-summary"))
      .toHaveText("imminence fired");
  });

test("a payload with no exit lines says so rather than drawing nothing",
  async ({ page }) => {
    await open(page, {
      ...ENVELOPE,
      matches: [liveMatch({
        fixture_id: 308,
        positions: [{
          position: { outcome_key: "home_win", side: "home", size: "100",
            entry_price: 0.46, entry_cost_dollars: "46.00",
            entry_note: "sunk" },
        }],
      }),
      liveMatch({ fixture_id: 309, positions: [] })],
    });
    // A HELD POSITION WHOSE PAYLOAD CARRIES NO BLOCK, and a match with
    // nothing held: two different absences, two different sentences,
    // neither of them a blank under a heading that promises lines.
    await expect(liveCard(page, 308)
      .getByTestId("live-exit-lines-absent"))
      .toHaveText("this read carries no exit lines");
    await expect(liveCard(page, 309)
      .getByTestId("live-exit-lines-absent"))
      .toContainText("nothing is held on this match");
  });

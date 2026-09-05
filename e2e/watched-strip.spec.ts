import { expect, test } from "@playwright/test";

// The watched strip — the HOLD/EXIT stage's surface, above the league
// columns on /bet-suggester.
//
// Hermetic: every test serves a RECORDED SHAPE of
// GET /api/bet-suggester/watched-strip, plus the board and review reads
// the page makes anyway, so none of it depends on the weather. The one
// unmocked test is the first: with the endpoint as it really is today
// (no route yet — a 404 through the proxy), the strip must be ABSENT and
// the board unharmed.
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY. Every key and every sentence
// below is copied from the shape the backend actually emits —
// position.evaluate()'s payload as card.operator_view re-flattens it,
// watchlist.coverage(), live_read.read_for_fixture() — including the
// exact `refused` wording ("code: reason", from position._coded) and the
// components riding under their OWN names rather than a shared `value`
// key. Twelve green tests once certified a venue bug because the
// fixtures used the code's vocabulary where the feed sends the
// provider's; these fixtures are written the other way round.
//
// WHAT IS AT STAKE, and it is not pixels:
//
//   - ABSENT, NOT EMPTY. On an ordinary pre-match board there is no
//     strip at all, exactly as LiveScoreboard is absent when no match is
//     live. The one exception is an open position on a fixture nobody
//     declared, which is a finding and renders on its own.
//   - THE ORDER A READER NEEDS. state, then position, then branches,
//     then certainty, then the refusals — asserted as DOM order, not as
//     "all five are somewhere on the page".
//   - P&L IS SEPARATED FROM THE ARITHMETIC. It is the number the
//     operator computes anyway and the one that should least influence
//     the decision, so it must never share a block with the hold and
//     sell figures.
//   - G1 RIDES ON EVERY POSITION. Certainty is cheap when winning and
//     dear when losing. A behind position must SAY so; an unknown one
//     must fail closed and say that instead of assuming a lead.
//   - EVERY REFUSAL BY NAME. The expected set is DERIVED from the
//     payload's own registry (position.REFUSAL_CODES rides on the
//     response) and from the codes the served payload actually carries —
//     never from a list typed into this file, which is how a guard that
//     names a rule and checks one case lets the rest drift.
//   - CAVEATS ARE IN THE ACCESSIBLE TREE. This project has a live defect
//     where a table's caveats ride only on `title=` on non-focusable
//     spans, so an assistive-tech reader gets the number and loses the
//     warning. The strip must carry no `title` at all.
//   - NOTHING HERE DECIDES. It shows; it does not decide.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// ---------------------------------------------------------------- board
// The page under the strip. Empty but VALID, so these tests exercise the
// strip and not the columns (picker.spec.ts owns those).

const BOARD = {
  generated_at: "2026-09-04T12:00:00Z",
  date: "20260904", days: 7,
  leagues: {
    mls: { src: "current", min_current_gp: 21, clubs: 30 },
    epl: { src: "current", min_current_gp: 12, clubs: 20 },
    laliga: { src: "current", min_current_gp: 12, clubs: 20 },
    ligamx: { src: "current", min_current_gp: 12, clubs: 18 },
  },
  rows: [], refusals: [],
};

const REVIEW = {
  generated_at: "2026-09-04T12:00:00Z",
  date: "20260904", back: 7,
  window: { from: "20260828", to: "20260904" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

// --------------------------------------------------------- the payload
//
// position.REFUSAL_CODES, verbatim — the registry the surface names its
// refusals out of. The strip walks THIS to find them, so a tenth code
// added to the backend needs no edit here or there.
const REFUSAL_CODES: Record<string, string> = {
  no_bid: "no resting bid at all — no quote for the leg, a one-sided "
    + "book, or a price with ZERO contracts behind it. The position "
    + "cannot be exited at any size",
  thin_bid: "a bid exists but it cannot absorb the position — fewer "
    + "contracts resting than are held, or a size the provider did not "
    + "send at all (missing is never zero, and an unknown size is not "
    + "an executable one)",
  thin_book: "a book needed to condition a measured cell is not there — "
    + "for the leader arm that is the PRE-KICKOFF book, whose absence "
    + "is the collector's own no-lock refusal",
  thin_cell_floor: "the grid measured no quotable cell for this state, "
    + "or measured one under its own n floor. THE TRUE MEANING OF THIS "
    + "LABEL, and nothing else may borrow it",
  stale_quote: "the book the exit is priced off is past the live "
    + "plane's age ceiling, or carries no capture time at all, so "
    + "nothing computed from it is current",
  dismissal: "a red card has been seen: every grid-derived number voids "
    + "from first sighting (the price arithmetic survives)",
  not_in_play: "the tape row is not an in-play state, so there is no "
    + "minute and no live scoreline to condition on",
  no_minute: "the tape carries no parseable minute — and half-time is "
    + "not minute 45 by assumption",
  no_score: "the tape carries no score for this tick — missing is never "
    + "zero-zero",
  read_collision: "two measured reads claim the SAME conditioning "
    + "minute, so which one describes this state is undefined. "
    + "Insertion order is not an answer",
};

// watchlist.POLICY_CODES — a DIFFERENT vocabulary. A policy code names a
// decision about the monitored SET; a refusal code names a number that
// could not be PRODUCED. The two are disjoint by construction and the
// surface must never count one as the other.
const POLICY_CODES: Record<string, string> = {
  joined_in_play: "this watch began after the ball was already in play, "
    + "so the tape before it does not exist for this watch",
  not_watched: "this fixture is not in the declared monitored set",
};

const POSSESSION_DISTRUSTED =
  "POSSESSION IS THE INPUT THIS PROJECT DISTRUSTS BY NAME: a side can "
  + "hold 65% and threaten nothing. It is stored so that M1 can find it "
  + "useless on the record rather than by assumption.";

const NO_COMPOSITE =
  "NO COMPOSITE BEFORE M1: the weights have not been fitted, and a "
  + "number made out of these four would be a claim.";

const NO_HISTORY_IS_NOT_QUIET =
  "NO HISTORY IS NOT A QUIET MATCH: a decaying read that starts at zero "
  + "at minute 63 is arithmetically indistinguishable from a side that "
  + "had done nothing for an hour, and they are different matches.";

const BRANCHES_NOT_AVERAGES =
  "THE CARD SHOWS AN AVERAGE; THE OPERATOR EXPERIENCES A BRANCH. A "
  + "binary contract never pays its expected value: it pays $1.00 or it "
  + "pays $0.00.";

const CERTAINTY_IS_ASYMMETRIC =
  "CERTAINTY IS CHEAP EXACTLY WHEN YOU ARE WINNING AND DEAR EXACTLY "
  + "WHEN YOU ARE LOSING, AND THAT IS STRUCTURAL, NOT A SETTING. The "
  + "taker fee peaks at 50c and the bid-ask spread is a fixed number of "
  + "cents, so both are enormous in PROPORTION to a position trading at "
  + "13c and trivial against one trading at 79c. So this block PROTECTS "
  + "GAINS AND STRUCTURALLY CANNOT PROTECT LOSSES.";

function component(key: string, value: number | null, unit: string,
                   kind: string, extra: Record<string, unknown> = {}) {
  const valueKey = `${key}_${kind === "level" ? "percent" : "per_90"}`;
  return {
    component: key, component_key: key,
    // THE VALUE RIDES UNDER A KEY THAT CARRIES ITS UNIT, and the block
    // names it. The fixture speaks the BACKEND's vocabulary — this is
    // live_read.COMPONENTS[key]["payload_key"], not a spelling invented
    // here, or the mock would certify a reader that cannot read the
    // real payload.
    value_key: valueKey,
    [valueKey]: value,
    kind, kind_meaning: kind === "rate"
      ? "an amount per unit of match time" : "a level, not an amount",
    unit,
    meaning: `${key} — persisted at the tick, decaying`,
    observed_seconds: 1440.0, observed_intervals: 12,
    note: null,
    no_composite_before_m1: NO_COMPOSITE,
    ...extra,
  };
}

function side(name: string, over: Record<string, unknown> = {}) {
  return {
    side: name,
    captured_at: "2026-09-04T21:05:00Z",
    live_stat_snapshot_id: 9001,
    half_life_seconds: 600.0,
    observed_since: "2026-09-04T20:00:00Z",
    observed_from_kickoff: true,
    state: {
      side: name, minute: 65, score_home: 2, score_away: 1,
      goal_difference: name === "home" ? 1 : -1,
      score_state: name === "home" ? "leading" : "trailing",
      conditionable: true,
      read_version: "live-read-components-v1",
      half_life_seconds: 600.0, observed_from_kickoff: true,
      baseline_is_not_built:
        "the baseline this read owes a comparison to is not built",
    },
    components: {
      shot_read: component("shot_read", 14.2, "shots per 90 match-minutes", "rate"),
      on_target_read: component("on_target_read", 5.6,
        "shots on target per 90 match-minutes", "rate"),
      corner_read: component("corner_read", 3.1,
        "corners per 90 match-minutes", "rate"),
      possession_read: component("possession_read", 58.4,
        "percent of possession", "level",
        { possession_is_distrusted: POSSESSION_DISTRUSTED }),
    },
    basis: "shot=12i/1440s on_target=12i/1440s corner=12i/1440s possession=12i/1440s",
    ...over,
  };
}

// --- M1: the clean case. Ahead, complete history, everything priced.
const AHEAD = {
  fixture_id: 101, competition_slug: "mls-2026",
  home: "Austin FC", away: "St. Louis City SC",
  state: {
    in_play: true, minute: 65, score_home: 2, score_away: 1,
    clock_display: "65'", match_state: "in", refusals: [],
    captured_at: "2026-09-04T21:05:00Z",
  },
  coverage: {
    monitored: true, complete_history: true,
    history: "declared before kickoff — the read spans the whole match "
      + "and nothing before it is missing",
    joined_phase: "pre_kickoff", joined_minute: null,
    unobserved_before_minute: null,
    watching_since: "2026-09-04T19:30:00Z",
    source: "manual",
    source_meaning: "a human declared this fixture watched; the set "
      + "carries selection bias by construction",
    actor: "son",
    no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET,
  },
  read: {
    version: "live-read-v1", read_version: "live-read-components-v1",
    fixture_id: 101, monitored: true,
    coverage: { monitored: true, complete_history: true,
                no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET },
    components_registry: {}, kinds: {},
    sides: { home: side("home"), away: side("away") },
  },
  positions: [{
    journal_entry: { bet_id: 41, outcome_key: "home_win",
      market_ticker: "KXMLSGAME-SAMPLE-ATX",
      stated_price_dollars: "0.46", stated_size: "100" },
    position: {
      outcome_key: "home_win", side: "home", size: "100",
      entry_price: 0.46, entry_cost_dollars: "46.00",
      entry_note: "THE ENTRY IS SUNK: what was paid is not a reason to "
        + "hold and not a reason to sell",
    },
    value_now_cents: 7784.0,
    value_at_settlement_cents: 7770.0,
    exit_is_obtainable: {
      obtainable: true,
      consulted: ["no_bid", "thin_bid", "stale_quote"],
      refusal_code: null, refused: null, withdrawn: [],
    },
    branch_view: {
      why: BRANCHES_NOT_AVERAGES,
      sell: {
        label: "sell into the live bid",
        branches: [{ outcome: "certain — the bid is hit at this tick",
                     probability: 1.0, percent: 100.0,
                     dollars: "77.84", cents: 7784.0 }],
        expectation_dollars: "77.84", expectation_cents: 7784.0,
        says: "selling is $77.84 with no branches — one outcome, net of "
          + "the exact per-order fee",
      },
      hold: {
        conditioned_grid: {
          label: "hold to settlement, conditioned grid cell",
          source: "grids-v2 equalizer_hazard, favourite arm",
          expectation_dollars: "77.70", expectation_cents: 7770.0,
          quantity: { kind: "win_probability", n: 2800, band: [76.1, 79.2] },
          branches: [
            { outcome: "settles YES — $1.00 a contract", probability: 0.777,
              percent: 77.7, dollars: "100.00", cents: 10000.0 },
            { outcome: "settles NO — $0.00 a contract", probability: 0.223,
              percent: 22.3, dollars: "0.00", cents: 0.0 },
          ],
          says: "holding is 77.7% of $100.00 and 22.3% of $0.00; the "
            + "expectation is $77.70, which is a figure the position "
            + "never actually pays",
          why: BRANCHES_NOT_AVERAGES,
        },
      },
    },
    certainty_premium: {
      applies: true,
      line: "65' · 2-1 home-away · holding home, 1 up · 100 contracts | "
        + "hold 77.7% x $100.00 expected $77.70 (n=2,800, [76.1, 79.2]) | "
        + "sell 79c bid, net certain $77.84 | taking it costs -$0.14 and "
        + "removes a 22.3% chance of $0",
      minute: 65, score: "2-1",
      held: { side: "home", goals_for: 2, goals_against: 1, state: "1 up",
              derived_from: "the two numbers printed beside it (2-1 "
                + "home-away) and the side held" },
      contracts: "100",
      cost_of_certainty_dollars: "-0.14",
      cost_of_certainty_cents: -14.0,
      cost_of_certainty_fraction_of_hold_ev: -0.0018,
      removes: { probability_of_zero: 0.223, percent: 22.3,
                 says: "selling removes a 22.3% chance of $0.00 and a "
                   + "77.7% chance of $100.00" },
      premium: { setting_fraction_of_hold_ev: 0.0,
                 cost_is_at_or_below_setting: true,
                 says: "the cost of certainty is -0.2% of hold EV, which "
                   + "is at or below the 0.0% premium this operator has set",
                 dial: "THE PREMIUM IS THE OPERATOR'S NUMBER, NOT A "
                   + "MODEL OUTPUT." },
      asymmetry: {
        rule: CERTAINTY_IS_ASYMMETRIC,
        position_is_ahead: true,
        protects: "gains", cannot_protect: "losses",
      },
      not_a_recommendation: "This states what the market pays to end the "
        + "exposure and what that costs against a measured base rate. It "
        + "is not a recommendation, it names no moment to do anything, "
        + "and the operator decides.",
    },
  }],
};

// --- M2: BEHIND, joined at 63', and a book that cannot absorb it.
// This is the 2026-09-02 shape: the equaliser has landed, the position
// is level-or-worse, and certainty has gone from -0.2% to expensive.
const BEHIND = {
  fixture_id: 202, competition_slug: "la-liga-2026",
  home: "Rayo Vallecano", away: "Getafe",
  state: {
    in_play: true, minute: 81, score_home: 2, score_away: 2,
    clock_display: "81'", match_state: "in",
    refusals: [{ code: "no_score",
      refused: "no_score: the tape carries no score for the away side's "
        + "latest tick — missing is never zero-zero" }],
  },
  coverage: {
    monitored: true, complete_history: false,
    history: "declared at phase 'in_play', minute 63. The tape before "
      + "that instant does not exist for this watch",
    joined_phase: "in_play", joined_minute: 63,
    joined_score_home: 2, joined_score_away: 1,
    unobserved_before_minute: 63,
    watching_since: "2026-09-04T21:03:00Z",
    source: "open_position",
    source_meaning: "the journal holds an open position on this fixture; "
      + "this set is mechanical and carries no selection bias",
    actor: "sync-positions",
    policy: "joined_in_play: this watch began after the ball was already "
      + "in play",
    policy_code: "joined_in_play",
    no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET,
  },
  read: {
    version: "live-read-v1", read_version: "live-read-components-v1",
    fixture_id: 202, monitored: true,
    coverage: { monitored: true, complete_history: false,
                no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET },
    components_registry: {}, kinds: {},
    sides: {
      home: side("home", {
        observed_from_kickoff: false,
        state: {
          side: "home", minute: 81, score_home: 2, score_away: 2,
          goal_difference: 0, score_state: "level", conditionable: true,
          read_version: "live-read-components-v1",
          half_life_seconds: 600.0, observed_from_kickoff: false,
          baseline_is_not_built: "the baseline is not built",
        },
        components: {
          shot_read: component("shot_read", 9.4,
            "shots per 90 match-minutes", "rate"),
          on_target_read: component("on_target_read", 2.1,
            "shots on target per 90 match-minutes", "rate"),
          // MISSING IS NEVER ZERO: the provider omitted wonCorners on
          // these ticks, so the column is NULL and the row says so.
          corner_read: component("corner_read", null,
            "corners per 90 match-minutes", "rate"),
          possession_read: component("possession_read", 41.9,
            "percent of possession", "level",
            { possession_is_distrusted: POSSESSION_DISTRUSTED }),
        },
      }),
      away: side("away", {
        observed_from_kickoff: false,
        state: {
          side: "away", minute: null, score_home: 2, score_away: 2,
          goal_difference: 0, score_state: "level", conditionable: false,
          read_version: "live-read-components-v1",
          half_life_seconds: 600.0, observed_from_kickoff: false,
          baseline_is_not_built: "the baseline is not built",
          refusal_code: "no_minute",
          refusal: "no_minute: no minute was on the tape at this tick, "
            + "so this row cannot be placed in a minute-conditioned cell",
        },
      }),
    },
  },
  positions: [{
    journal_entry: { bet_id: 58, outcome_key: "home_win",
      market_ticker: "KXLALIGAGAME-SAMPLE-RAY",
      stated_price_dollars: "0.46", stated_size: "100" },
    position: {
      outcome_key: "home_win", side: "home", size: "100",
      entry_price: 0.46, entry_cost_dollars: "46.00",
      entry_note: "THE ENTRY IS SUNK",
    },
    // WITHDRAWN, not missing: card._withdraw_unobtainable_exit took it
    // because the book cannot absorb the position.
    value_now_cents: null,
    value_now_withdrawn: "thin_bid: the exit figure was withdrawn "
      + "because the bid cannot absorb this position",
    exit_is_obtainable: {
      obtainable: false,
      consulted: ["no_bid", "thin_bid", "stale_quote"],
      refusal_code: "thin_bid",
      refused: "thin_bid: THIN BID: 3 contract(s) resting at the top of "
        + "the book against a position of 100",
      withdrawn: ["value_now_cents", "arithmetic.exit"],
      rule: "a figure the book will not pay is withdrawn, not qualified",
    },
    thin_bid: {
      finding: "THIN BID: 3 contract(s) resting at the top of the book "
        + "against a position of 100. What is executable AT THIS TICK is "
        + "3 contract(s) for 38.7c net.",
      top_of_book_size: "3", position_size: "100",
    },
    branch_view: {
      why: BRANCHES_NOT_AVERAGES,
      sell: {
        refused: "thin_bid: the bid cannot absorb this position, so the "
          + "exit side has no CERTAIN figure for it. Showing the whole "
          + "position at the top of the book would state a certainty the "
          + "operator cannot obtain, and no clip is priced in its place "
          + "— B4 is not built.",
        refusal_code: "thin_bid",
        certain_means_obtainable: "CERTAIN MEANS OBTAINABLE",
      },
      hold: {
        conditioned_grid: {
          refused: "thin_book: the leader-conditioned cell needs to know "
            + "whether the side ahead was the favourite AT KICKOFF, and "
            + "this row cannot say",
          refusal_code: "thin_book",
        },
      },
    },
    certainty_premium: {
      applies: false,
      refused: "thin_bid: the bid cannot absorb this position, so no "
        + "CERTAIN figure exists for it.",
      refusal_code: "thin_bid",
      asymmetry: {
        rule: CERTAINTY_IS_ASYMMETRIC,
        position_is_ahead: false,
        protects: "gains", cannot_protect: "losses",
        finding: "THIS POSITION IS NOT AHEAD (side home, score 2-2). The "
          + "certainty premium is at its most expensive here and is "
          + "least able to help: the fee peaks at 50c and the spread is "
          + "a fixed number of cents, so both are largest in proportion "
          + "exactly when the position is cheap. Nothing in this block "
          + "is downside protection.",
      },
      premium: { setting_fraction_of_hold_ev: 0.0,
                 says: "no cost can be expressed while the exit refuses",
                 dial: "THE PREMIUM IS THE OPERATOR'S NUMBER" },
    },
    exposure: {
      applies: false,
      refused: "thin_cell_floor: the grid measured no quotable cell for "
        + "2-2 at 81' with this side chasing",
      refusal_code: "thin_cell_floor",
    },
  }],
};

// --- M3: a red card, a one-sided book, a stale quote, and NO asymmetry
// block at all — the fail-closed case for G1.
const UNKNOWN_SIDE = {
  fixture_id: 303, competition_slug: "epl-2026",
  home: "Brentford", away: "Everton",
  state: {
    in_play: true, minute: null, score_home: 1, score_away: 1,
    clock_display: "HT", match_state: "in",
    refusals: [{ code: "not_in_play",
      refused: "not_in_play: the tape row is not an in-play state, so "
        + "there is no minute and no live scoreline to condition on" }],
  },
  coverage: {
    monitored: true, complete_history: true,
    history: "declared before kickoff",
    joined_phase: "pre_kickoff", source: "manual", actor: "son",
    no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET,
  },
  read: {
    version: "live-read-v1", read_version: "live-read-components-v1",
    fixture_id: 303, monitored: true,
    coverage: { monitored: true, complete_history: true,
                no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET },
    components_registry: {}, kinds: {}, sides: {},
    words: "no component read has been persisted for this fixture. That "
      + "is a fixture nobody declared, or one whose tape has not yet "
      + "carried an in-play tick under its watch — it is not a match in "
      + "which nothing has happened",
  },
  positions: [{
    journal_entry: { bet_id: 77, outcome_key: "away_win",
      stated_price_dollars: "0.31", stated_size: "40" },
    position: {
      outcome_key: "away_win", side: "away", size: "40",
      entry_price: 0.31, entry_cost_dollars: "12.40",
      entry_note: "THE ENTRY IS SUNK",
    },
    value_now_cents: null,
    exit_is_obtainable: {
      obtainable: false, consulted: ["no_bid", "thin_bid", "stale_quote"],
      refusal_code: "no_bid",
      refused: "no_bid: the book is one-sided and nothing is resting on "
        + "the buy side",
      withdrawn: ["value_now_cents", "arithmetic.exit"],
    },
    no_bid: {
      finding: "NO BID. The book is one-sided: an ask of $0.34 and "
        + "nothing resting on the buy side. This position CANNOT BE "
        + "EXITED at any price at this tick — that is the finding, not a "
        + "missing number, and the ask is never substituted for it.",
      ask: 0.34,
    },
    stale_quote: {
      finding: "computed from a STALE book: the bid was captured 412s "
        + "ago, past the 120s ceiling",
      age_seconds: 412, ceiling_seconds: 120,
    },
    red_card_void: {
      refused: "dismissal: a red card has been seen at 58', so every "
        + "grid-derived number voids from first sighting",
      refusal_code: "dismissal",
    },
    branch_view: {
      why: BRANCHES_NOT_AVERAGES,
      sell: {
        refused: "no_bid: there is no executable bid at this tick, so "
          + "the exit side has no branch and no certain figure.",
        refusal_code: "no_bid",
      },
      hold: {
        conditioned_grid: {
          refused: "dismissal: a red card has been seen; every "
            + "grid-derived number voids from first sighting",
          refusal_code: "dismissal",
        },
      },
    },
    // NO `asymmetry` KEY AT ALL — the fail-closed case. The strip must
    // not read a missing block as "ahead".
    certainty_premium: {
      applies: false,
      refused: "no_bid: there is no executable bid at this tick, so the "
        + "market is offering no certainty to buy.",
      refusal_code: "no_bid",
    },
  }],
};

const STRIP = {
  version: "watched-strip-v1",
  generated_at: "2026-09-04T21:05:11Z",
  matches: [AHEAD, BEHIND, UNKNOWN_SIDE],
  monitored_by_source: { manual: [101, 303], open_position: [202] },
  open_positions_not_monitored: [],
  refusal_codes: REFUSAL_CODES,
  policy_codes: POLICY_CODES,
};

const EMPTY = {
  version: "watched-strip-v1",
  generated_at: "2026-09-04T12:00:00Z",
  matches: [],
  monitored_by_source: { manual: [], open_position: [] },
  open_positions_not_monitored: [],
  refusal_codes: REFUSAL_CODES,
  policy_codes: POLICY_CODES,
};

// ------------------------------------------------------------- helpers

type Page = import("@playwright/test").Page;

const STRIP_URL = "/api/bet-suggester/watched-strip";

async function routes(page: Page, strip: unknown, status = 200) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  if (strip !== undefined) {
    await page.route(`**${STRIP_URL}**`,
      (r) => r.fulfill(json(strip, status)));
  }
}

async function open(page: Page, strip: unknown, status = 200) {
  await routes(page, strip, status);
  await page.goto("/bet-suggester");
}

/** Open the board and wait until the strip has DECIDED.
 *
 *  `toHaveCount(0)` is VACUOUS on a client-fetched component: it passes
 *  the instant the page loads, before the request has even resolved, so
 *  an absence assertion written that way is true for the wrong reason.
 *  The mutation pass caught exactly this — deleting the absence rule
 *  outright left three guards GREEN, including this one. So every
 *  assertion that something is NOT on the page first waits for the
 *  strip's own response and lets React commit.
 *
 *  Returns the response, so a test can also pin WHY it was absent (a
 *  404 from the route that does not exist yet is a different absence
 *  from an empty watchlist). */
async function openSettled(page: Page, strip: unknown, status = 200) {
  await routes(page, strip, status);
  const settled = page.waitForResponse((r) => r.url().includes(STRIP_URL));
  await page.goto("/bet-suggester");
  const resp = await settled;
  await page.waitForTimeout(1000);
  return resp;
}

const strip = (page: Page) => page.getByTestId("watched-strip");
const match = (page: Page, fixture: number) =>
  page.locator(`[data-testid="watched-match"][data-fixture="${fixture}"]`);

/** Every refusal code the SERVED payload carries, wherever it carries
 *  one. Derived by walking the payload — this is what the surface must
 *  name, and it is never a list typed out beside the assertion. */
function codesIn(node: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(node)) {
    for (const x of node) codesIn(x, found);
    return found;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      // `refusal_codes` is the REGISTRY riding on the payload (every
      // code, defined) — not a claim that any of them fired here.
      if (k === "refusal_codes") continue;
      if ((k === "refusal_code" || k === "code") && typeof v === "string" && v) {
        found.add(v);
        continue;
      }
      // THE SECOND SHAPE, and leaving it out is what let a crippled
      // registry walk stay green: an executability finding rides under
      // its OWN registry name at the top of a position (`no_bid`,
      // `thin_bid`, `stale_quote`) and carries a `finding` rather than a
      // `refusal_code`. Recognised BY THE REGISTRY, never by a list
      // typed here.
      if (k in REFUSAL_CODES && v && typeof v === "object"
          && typeof (v as Record<string, unknown>).finding === "string") {
        found.add(k);
      }
      codesIn(v, found);
    }
  }
  return found;
}

// -------------------------------------------------- absent, not empty

test("with the endpoint as it really is today, the strip is absent and "
   + "the board is unharmed", async ({ page }) => {
  // UNMOCKED ON PURPOSE. There is no /api/bet-suggester/watched-strip
  // proxy and no backend route behind it yet (see the hand-off note in
  // suggesterApi.ts), so this exercises the real 404 path through the
  // real Next proxy layer. A component whose data source does not exist
  // must cost the landing page NOTHING.
  const resp = await openSettled(page, undefined);
  await expect(page.getByRole("heading", { name: "Every fixture, ranked" }))
    .toBeVisible();
  // NON-VACUITY: the strip really did ask, and really was refused. An
  // absence with no request behind it would prove nothing.
  expect(resp.status()).not.toBe(200);
  await expect(strip(page)).toHaveCount(0);
});

test("nothing declared, nothing rendered — absent, not empty",
  async ({ page }) => {
    const resp = await openSettled(page, EMPTY);
    await expect(page.getByRole("heading", { name: "Every fixture, ranked" }))
      .toBeVisible();
    expect(resp.status()).toBe(200);          // it asked, and it was told
    await expect(strip(page)).toHaveCount(0); // and it drew nothing
  });

test("a dormant live plane renders nothing rather than a plausible "
   + "empty set", async ({ page }) => {
  const resp = await openSettled(page, { version: "watched-strip-v1",
    dormant: true, detail: "the live plane is not configured", matches: [],
    monitored_by_source: {}, open_positions_not_monitored: [],
    refusal_codes: REFUSAL_CODES });
  expect(resp.status()).toBe(200);
  await expect(strip(page)).toHaveCount(0);
});

test("an open position on a fixture nobody declared renders even with no "
   + "live match — a census of nothing is the one thing absence may not "
   + "hide", async ({ page }) => {
  await open(page, { ...EMPTY, open_positions_not_monitored: [909] });
  await expect(strip(page)).toBeVisible();
  const orphans = page.getByTestId("watched-orphans");
  await expect(orphans).toBeVisible();
  await expect(orphans).toContainText("909");
  await expect(orphans).toContainText("census of nothing");
});

// ------------------------------------------------- where, and in order

test("the strip mounts ABOVE the league columns", async ({ page }) => {
  await open(page, STRIP);
  await expect(strip(page)).toBeVisible();
  const order = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="watched-strip"]');
    const board = document.querySelector('[data-testid="league-col"]')
      ?? document.querySelector("h2");
    if (!s || !board) return "missing";
    return (s.compareDocumentPosition(board)
      & Node.DOCUMENT_POSITION_FOLLOWING) ? "above" : "below";
  });
  expect(order).toBe("above");
});

test("every declared match is drawn, and each block appears in the order "
   + "a reader needs it", async ({ page }) => {
  await open(page, STRIP);
  await expect(page.getByTestId("watched-match")).toHaveCount(3);

  // state -> position -> branches -> certainty -> refusals, as DOM
  // order and not as "all five are somewhere on the page".
  const seq = await match(page, 202).evaluate((el) => {
    const want = ["watched-read", "watched-ledger", "watched-branches",
                  "watched-certainty", "watched-position-refusals"];
    const seen: string[] = [];
    el.querySelectorAll("[data-testid]").forEach((n) => {
      const t = n.getAttribute("data-testid")!;
      if (want.includes(t) && !seen.includes(t)) seen.push(t);
    });
    return seen;
  });
  expect(seq).toEqual(["watched-read", "watched-ledger", "watched-branches",
                       "watched-certainty", "watched-position-refusals"]);
});

// ------------------------------------------------------------ 1. state

test("the live read shows four separately named components per side, and "
   + "never one number made out of them", async ({ page }) => {
  await open(page, STRIP);
  const home = match(page, 101)
    .locator('[data-testid="watched-read-side"][data-side="home"]');
  await expect(home).toBeVisible();
  for (const [label, value] of [["shot", "14.20"], ["on target", "5.60"],
                                ["corner", "3.10"], ["possession", "58.40"]]) {
    await expect(home).toContainText(label);
    await expect(home).toContainText(value);
  }
  // each carries its OWN unit — a rate and a level are not the same kind
  // of number, and four values under one column header is the composite
  // with the types filed off
  await expect(home).toContainText("shots per 90 match-minutes");
  await expect(home).toContainText("percent of possession");
  await expect(home).toContainText("never combined into one number");
});

test("possession carries the sentence that distrusts it, in the "
   + "accessible tree", async ({ page }) => {
    await open(page, STRIP);
    const caveat = match(page, 101).getByTestId("watched-possession-caveat")
      .first();
    await expect(caveat).toBeVisible();
    await expect(caveat).toContainText("DISTRUSTS BY NAME");
  });

test("a component the provider did not send reads as absent, never as "
   + "zero", async ({ page }) => {
  await open(page, STRIP);
  const home = match(page, 202)
    .locator('[data-testid="watched-read-side"][data-side="home"]');
  const nulls = home.getByTestId("watched-component-null");
  await expect(nulls).toHaveCount(1);
  await expect(nulls).toContainText("not read this tick");
  // THE ROW ITSELF prints no number for it — not a 0, not a 0.00, not a
  // dash standing in for one. Addressed by the component's own name,
  // which is also how the payload keys it.
  const row = home.locator('[data-component="corner_read"]');
  await expect(row).toHaveCount(1);
  await expect(row).not.toContainText("0.0");
  await expect(row).toContainText("missing is never zero");
  // every component the payload served has a row of its own, keyed by
  // its own name — four values under one shared key is the composite
  // with the types filed off
  const served = Object.keys(
    (BEHIND.read.sides.home as { components: Record<string, unknown> })
      .components);
  await expect(home.getByTestId("watched-component"))
    .toHaveCount(served.length);
  for (const key of served) {
    await expect(home.locator(`[data-component="${key}"]`)).toHaveCount(1);
  }
});

test("a mid-way join says so, and says the tape before it does not exist",
  async ({ page }) => {
    await open(page, STRIP);
    const cover = match(page, 202).getByTestId("watched-coverage");
    await expect(cover).toContainText("minute 63");
    await expect(cover).toContainText("NO HISTORY IS NOT A QUIET MATCH");
    // and the policy code rides under the POLICY vocabulary, not as a
    // refusal — a decision about the set is not a missing number
    await expect(cover).toContainText("Policy: joined_in_play");
    await expect(match(page, 202).getByTestId("watched-match-refusals"))
      .not.toContainText("joined_in_play");
  });

test("a fixture with no persisted read says so, and does not read as a "
   + "quiet match", async ({ page }) => {
    await open(page, STRIP);
    const absent = match(page, 303).getByTestId("watched-read-absent");
    await expect(absent).toBeVisible();
    await expect(absent).toContainText("not a match in which nothing has happened");
  });

// --------------------------------------------------------- 2. position

test("contracts, at risk and P&L are their own block, never on a line "
   + "with the hold and sell figures", async ({ page }) => {
    await open(page, STRIP);
    const m = match(page, 101);
    const ledger = m.getByTestId("watched-ledger");
    await expect(ledger.getByTestId("watched-contracts")).toHaveText("100");
    await expect(ledger.getByTestId("watched-at-risk")).toContainText("$46.00");
    await expect(ledger.getByTestId("watched-pnl")).toContainText("$31.84");

    // SEPARATION IS THE POINT: the P&L must not live inside the branch
    // or certainty blocks, and those blocks must hold no P&L.
    await expect(m.getByTestId("watched-branches")
      .getByTestId("watched-pnl")).toHaveCount(0);
    await expect(m.getByTestId("watched-certainty")
      .getByTestId("watched-pnl")).toHaveCount(0);
    await expect(ledger.getByTestId("watched-branches")).toHaveCount(0);
    await expect(ledger).toContainText("least influence the decision");
  });

test("when the exit is withdrawn the P&L is withheld BY NAME, never "
   + "shown as a dash", async ({ page }) => {
    await open(page, STRIP);
    const pnl = match(page, 202).getByTestId("watched-pnl");
    await expect(pnl).toContainText("thin_bid");
    await expect(pnl).not.toContainText("$");
    await expect(match(page, 202).getByTestId("watched-ledger"))
      .toContainText("WITHHELD");
  });

// --------------------------------------------------------- 3. branches

test("the expectation is shown WITH the two outcomes behind it",
  async ({ page }) => {
    await open(page, STRIP);
    const br = match(page, 101).getByTestId("watched-branches");
    await expect(br).toContainText("$77.70");          // the expectation
    await expect(br).toContainText("77.7%");           // and its branches
    await expect(br).toContainText("settles YES — $1.00 a contract");
    await expect(br).toContainText("22.3%");
    await expect(br).toContainText("settles NO — $0.00 a contract");
    await expect(br).toContainText("a figure the position never actually pays");
    // the sell side: ONE branch, and it says so
    await expect(br).toContainText("$77.84");
    await expect(br).toContainText("certain — the bid is hit at this tick");
    await expect(br).toContainText("100.0%");
    // n and band travel with the base rate
    await expect(br).toContainText("n=2,800");
    await expect(br).toContainText("76.1");
  });

test("a sell branch the book cannot pay refuses by name instead of "
   + "printing a certain figure", async ({ page }) => {
    await open(page, STRIP);
    const refused = match(page, 202).getByTestId("watched-sell-refused");
    await expect(refused).toContainText("thin_bid");
    await expect(refused).toContainText("no clip is priced in its place");
    // and no whole-position certainty is printed anywhere beside it
    await expect(match(page, 202).getByTestId("watched-branches"))
      .not.toContainText("certain — the bid is hit at this tick");
  });

// -------------------------------------------------------- 4. certainty

test("certainty states what the market pays and what it costs, and calls "
   + "itself no recommendation", async ({ page }) => {
    await open(page, STRIP);
    const c = match(page, 101).getByTestId("watched-certainty");
    await expect(c.getByTestId("watched-certainty-cost"))
      .toContainText("$0.14");
    await expect(c.getByTestId("watched-certainty-cost"))
      .toContainText("cost of certainty");
    await expect(c.getByTestId("watched-certainty-line"))
      .toContainText("removes a 22.3% chance of $0");
    await expect(c).toContainText("at or below the 0.0% premium");
    await expect(c).toContainText("is not a recommendation");
  });

test("a certainty that cannot be priced refuses by name and prices no "
   + "partial in its place", async ({ page }) => {
    await open(page, STRIP);
    const c = match(page, 202).getByTestId("watched-certainty-refused");
    await expect(c).toContainText("thin_bid");
    await expect(match(page, 202).getByTestId("watched-certainty"))
      .not.toContainText("cost of certainty");
  });

// ---------------------------------------------------------------- G1

test("a position that is BEHIND says certainty is expensive there",
  async ({ page }) => {
    await open(page, STRIP);
    const g1 = match(page, 202).getByTestId("watched-g1");
    await expect(g1).toHaveAttribute("data-ahead", "false");
    await expect(g1).toContainText("Certainty is at its most expensive here");
    await expect(g1).toContainText("THIS POSITION IS NOT AHEAD");
    await expect(g1).toContainText("STRUCTURALLY CANNOT PROTECT LOSSES");
  });

test("a position that is AHEAD still carries the asymmetry — it is "
   + "structural, not a setting", async ({ page }) => {
    await open(page, STRIP);
    const g1 = match(page, 101).getByTestId("watched-g1");
    await expect(g1).toHaveAttribute("data-ahead", "true");
    await expect(g1).toContainText("CHEAP EXACTLY WHEN YOU ARE WINNING");
    await expect(g1).not.toContainText("Certainty is at its most expensive here");
  });

test("a payload with no asymmetry block FAILS CLOSED — a missing block "
   + "is not a lead", async ({ page }) => {
    await open(page, STRIP);
    const g1 = match(page, 303).getByTestId("watched-g1");
    await expect(g1).toHaveAttribute("data-ahead", "unknown");
    await expect(g1).toContainText("not on this payload");
    await expect(g1).toContainText("does not assume it is");
  });

test("G1 rides on every position, on every card", async ({ page }) => {
  await open(page, STRIP);
  // derived: one per position served, not a number typed here
  const served = [AHEAD, BEHIND, UNKNOWN_SIDE]
    .reduce((n, m) => n + m.positions.length, 0);
  await expect(page.getByTestId("watched-g1")).toHaveCount(served);
});

// --------------------------------------------------------- 5. refusals

test("every refusal code the payload carries is named on the surface, in "
   + "the registry's own words", async ({ page }) => {
    await open(page, STRIP);
    // evaluateAll does NOT auto-wait, so the strip must be up first —
    // an empty array from a page that had not fetched yet would make
    // this guard pass for the wrong reason.
    await expect(strip(page)).toBeVisible();
    await expect(page.getByTestId("watched-refusal").first()).toBeVisible();
    // DERIVED FROM THE PAYLOAD, both ways: the set to look for is walked
    // out of the served bytes, and each one's gloss is compared against
    // the served REGISTRY rather than against a sentence typed here. A
    // guard that names a rule and then hand-lists a subset is how La
    // Liga disarmed itself on every boot.
    const expected = [...codesIn(STRIP)].sort();
    expect(expected.length).toBeGreaterThanOrEqual(6);   // non-vacuity
    const shown = await page.getByTestId("watched-refusal")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-code")!));
    for (const code of expected) {
      expect(shown, `refusal ${code} must be named on the strip`)
        .toContain(code);
    }
    // and the registry's definition rides with the name
    for (const code of new Set(shown)) {
      await expect(page.locator(
        `[data-testid="watched-refusal"][data-code="${code}"]`).first())
        .toContainText(REFUSAL_CODES[code]!.slice(0, 40));
    }
  });

test("a clean position lists no refusals at all — a refusal is a finding, "
   + "not decoration", async ({ page }) => {
    await open(page, STRIP);
    // the anchor: this card IS drawn, and its neighbour DOES refuse — so
    // the two counts below are an absence and not an unrendered page
    await expect(match(page, 101).getByTestId("watched-certainty-cost"))
      .toBeVisible();
    await expect(match(page, 202).getByTestId("watched-refusal").first())
      .toBeVisible();
    await expect(match(page, 101).getByTestId("watched-position-refusals"))
      .toHaveCount(0);
    await expect(match(page, 101).getByTestId("watched-match-refusals"))
      .toHaveCount(0);
  });

test("the two vocabularies stay disjoint: a policy code is never counted "
   + "as a refusal", async ({ page }) => {
    await open(page, STRIP);
    await expect(page.getByTestId("watched-refusal").first()).toBeVisible();
    const shown = new Set(await page.getByTestId("watched-refusal")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-code")!)));
    for (const policy of Object.keys(POLICY_CODES)) {
      expect([...shown]).not.toContain(policy);
    }
  });

test("the source counts are split and never totalled", async ({ page }) => {
  await open(page, STRIP);
  const src = page.getByTestId("watched-sources");
  await expect(src).toContainText("manual 2");
  await expect(src).toContainText("open position 1");
  // 3 is the total nobody may print
  await expect(src).not.toContainText("3");
});

// -------------------------------------------------- decision safety

test("every caveat is in the accessible tree — nothing rides on a title "
   + "attribute", async ({ page }) => {
    await open(page, STRIP);
    // NON-VACUITY FIRST. `count()` does not auto-wait, so counting zero
    // `[title]` on a page that has not drawn the strip yet is true for
    // the wrong reason — the mutation pass caught exactly that. Anchor
    // on the caveats that MUST be present, then prove none of them is
    // hiding on a title attribute.
    const caveats = strip(page).getByTestId("watched-possession-caveat");
    await expect(caveats.first()).toBeVisible();
    expect(await caveats.count()).toBeGreaterThanOrEqual(2);
    await expect(caveats.first()).toContainText("DISTRUSTS BY NAME");
    // The live defect this guards against: a table whose caveats ride
    // only on `title=` attached to non-focusable spans, so an
    // assistive-tech reader gets the number and loses the warning.
    const titled = await strip(page).locator("[title]").count();
    expect(titled).toBe(0);
    // the strip is a landmark with a name, and each match is an article
    // labelled by its own heading
    await expect(strip(page)).toHaveAttribute("aria-labelledby",
      "watched-strip-h");
    const articles = await strip(page).locator("article[aria-labelledby]")
      .count();
    expect(articles).toBe(3);
  });

test("the ahead/behind word is shown beside the numbers it was derived "
   + "from", async ({ page }) => {
    await open(page, STRIP);
    // The winner-first-score-string lesson: a rendered word must be
    // checkable against the numbers printed next to it.
    const m = match(page, 101);
    await expect(m.getByTestId("watched-scoreline")).toContainText("2–1");
    await expect(m.getByTestId("watched-certainty-line"))
      .toContainText("holding home, 1 up");
    await expect(m.locator('[data-testid="watched-read-side"][data-side="home"]'))
      .toContainText("leading");
    await expect(m.locator('[data-testid="watched-read-side"][data-side="away"]'))
      .toContainText("trailing");
  });

test("a score the tape did not carry is named, never rendered 0–0",
  async ({ page }) => {
    await open(page, STRIP);
    const line = match(page, 303).getByTestId("watched-scoreline");
    await expect(line).toContainText("1–1");
    // and the minute it could not read is words, not minute 0
    await expect(line).toContainText("HT");
    await expect(line).not.toContainText("0'");
  });

test("nothing on the strip tells the operator what to do",
  async ({ page }) => {
    await open(page, STRIP);
    const text = (await strip(page).innerText()).toLowerCase();
    // IT SHOWS; IT DOES NOT DECIDE. Note "sell" alone is not on this
    // list: "sell into the live bid" is the NAME of a branch and
    // "selling removes a 22.3% chance of $0.00" is arithmetic. What may
    // never appear is an instruction.
    for (const phrase of ["you should", "cash out", "take the money",
                          "we recommend", "recommended", "advise",
                          "best to sell", "time to sell", "hold on to",
                          "don't sell", "do not sell"]) {
      expect(text, `the strip must not say "${phrase}"`)
        .not.toContain(phrase);
    }
    // and it says whose call it is
    expect(text).toContain("you decide");
  });

test("a failed poll leaves the figures up and dated, never silently "
   + "current", async ({ page }) => {
    // The first read succeeds; every later one fails. The strip keeps
    // what it had — a book with an age ceiling behind it — and SAYS the
    // numbers are from the earlier read rather than passing them off as
    // now.
    let served = 0;
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
    await page.route("**/api/bet-suggester/watched-strip**", (r) =>
      served++ === 0 ? r.fulfill(json(STRIP)) : r.abort());
    await page.goto("/bet-suggester");
    await expect(strip(page)).toBeVisible();
    await expect(page.getByTestId("watched-stale")).toHaveCount(0);
    const stale = page.getByTestId("watched-stale");
    await expect(stale).toBeVisible({ timeout: 25_000 });
    await expect(stale).toContainText("2026-09-04T21:05:11Z");
    await expect(stale).toContainText("has been refreshed");
    // and the figures are still there — blanking them would be worse
    await expect(match(page, 101).getByTestId("watched-pnl"))
      .toContainText("$31.84");
  });

test("one column on a phone: the strip stacks and the page does not "
   + "scroll sideways", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, STRIP);
    await expect(strip(page)).toBeVisible();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

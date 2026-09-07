import { expect, test } from "@playwright/test";
// STATIC, not `await import(...)` inside the test. A dynamic import is
// executed by Node at RUNTIME and bypasses Playwright's TypeScript
// transform, so Node reads the .tsx source itself and dies on
// "Cannot use import statement outside a module". It passed locally on a
// warm transform cache and failed on the clean CI checkout, which is the
// only honest signal of the two.
import {
  CONSUMED_ENVELOPE_KEYS, BOOKKEEPING_ENVELOPE_KEYS,
  UNRENDERED_ENVELOPE_KEYS,
} from "../src/components/WatchedStrip";

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

// ------------------------------------------------- the RECORDED blocks
//
// EVERYTHING BETWEEN HERE AND `function component(` WAS RUN, NOT WRITTEN.
// On 2026-09-06 the backend's own emitters were called on the committed
// tree at /Users/ns/dev/TRIVELA/backend and their output was dumped to
// JSON:
//
//   REC_PE_*        src/live/position.py `evaluate(...)["partial_exit"]`,
//                   through tests/test_certainty_premium.py's `_evaluate`
//                   and tests/test_partial_exit.py's `_ladder` / `_lvl`
//                   helpers — the 100-contract home_win position at 65',
//                   2-1, against the ladder 60@79c / 30@78c / 50@77c.
//                     pe_full          the full book (250 at the top)
//                     pe_depth_failed  the depth read RAISED, so the
//                                      ladder is the top of book alone
//                     pe_stale         a book past the age ceiling
//                     pe_tiny          a 3-contract position, where 25%
//                                      is 0.75 of a contract
//                     pe_shared_a      card._shared_exit_book's own
//                                      withdrawal on a leg held twice
//                                      (two 100s against 150 resting)
//   REC_MAP_*       src/live/entry_map.py `build(fixture, position,
//                   favourite)` at minute 0, read off the committed
//                   research_archive/grids/grids-v1.json and -v2.json.
//                     map_mixed    band 0-75: the two opener branches
//                                  price, the two scoreless branches
//                                  refuse thin_cell_floor because
//                                  scoreless_fav_decay measures a HEAVY
//                                  favourite only
//                     map_refused  no pre-kickoff favourite at all
//
// PRUNED, NEVER REWRITTEN. Whole subtrees this surface does not read
// were dropped; no key was renamed and no value was edited. What went:
//   - per-fraction `executability.rule` and `realises.fee_basis`, both
//     of which the block carries once at its own level, where the strip
//     renders them;
//   - on the map: `timing` (the branch's own `reached` carries the bins
//     it is composed from), `from_here`, `lead_hazard_by_window`,
//     `payload_wall`, and the long per-quantity `category_rule` on all
//     but the first — the map's OWN refusal tally is kept intact, which
//     is why it counts more refusals than this surface draws, and the
//     strip prints both numbers rather than passing the visible ones off
//     as all of them.
//
// Long prose that occurs more than once is hoisted into a const and
// referenced; the VALUE each key receives is byte-identical to what the
// emitter produced.
//
// WHAT IS STILL HAND-WRITTEN, and it is said here rather than implied:
// the STRIP ENVELOPE itself (version / matches / monitored_by_source /
// the per-match state and coverage blocks, and the certainty and branch
// blocks on the pre-kickoff matches below). There is no
// /api/bet-suggester/watched-strip route on the backend yet, so no
// emitter exists to record it from; those are the proposal this file has
// always carried. The two blocks this round added — `partial_exit` and
// `entry_map` — are recorded, and the main session can re-verify them
// against the tree by re-running the emitters named above.

const A_CLIP_IS_A =
  "A CLIP IS A DIFFERENT TRADE FROM THE WHOLE POSITION AND IS "
  + "NEVER PRESENTED AS ITS EXIT. Every row below walks the bid "
  + "ladder for a stated number of contracts and pays the exact "
  + "per-order fee once per level walked; the whole-position "
  + "figures elsewhere on this payload (value_now_cents, "
  + "arithmetic.exit, certainty_premium.sell) price ONE order at "
  + "the TOP of the book and are refused where the top cannot "
  + "absorb the position. Those refusals stand. Where the 100% row "
  + "lands on the same numbers as the whole-position figure it says "
  + "so, derived from the two figures beside it; where it does not, "
  + "the difference is stated. No row here is put in a refused "
  + "figure's place, no fraction is recommended, and no row is a "
  + "certainty: it is what the book, as captured, pays for that "
  + "many contracts.";

const A_FRACTION_IS_PRICED =
  "A FRACTION IS PRICED IN WHOLE CONTRACTS, ROUNDED DOWN. A "
  + "quarter of a 3-contract position is 0.75 of a contract, and "
  + "0.75 of a contract is not an order this block will price: the "
  + "row states that it holds no whole contract and prices nothing, "
  + "rather than pricing a quantity the venue may not accept. The "
  + "rounding is stated on every row it changes.";

const A_HAZARD_AND_A =
  "A HAZARD AND A WIN PROBABILITY ARE NOT THE SAME QUANTITY AND "
  + "ARE NOT COMPARABLE. An equaliser hazard answers 'is this match "
  + "ever LEVEL again'; a de-vigged match-winner price answers "
  + "'does this side WIN'. A lead levelled at 71' and RESTORED at "
  + "80' still wins the market and still counts as an equalisation "
  + "in the grid \u2014 so 1 - hazard is a LOWER BOUND on P(win) and "
  + "never an estimate of it. On 2026-09-02 the two were compared "
  + "directly and manufactured a 13-point edge out of nothing "
  + "(research_archive/grids/NOTES-v2.md, "
  + "two_errors_are_separable). They are different Python types "
  + "here, they ride under different payload keys, and any attempt "
  + "to add, subtract, order or flatten one against the other "
  + "raises position.CategoryError.";

const A_MAP_NOT_A =
  "A MAP, NOT A VERDICT. Each branch below is a match state that "
  + "may arise, the measured frequency of what happened from that "
  + "state in the corpus (with its n and its Wilson band), and what "
  + "the held position settles at in each outcome. Which branch "
  + "this match takes is not known at minute 0 and nothing here "
  + "claims to know it. No figure is a recommendation and no minute "
  + "is a moment to do anything.";

const A_THIN_OR_ABSENT =
  "A thin or absent bid is THE COMMON CASE in play, not an edge "
  + "case: the slate measured a median in-play bid size of 0-1 "
  + "contracts. A position that cannot be exited at size is the "
  + "finding itself and is stated by name here, never left to be "
  + "inferred from a missing number.";

const CERTAIN_MEANS_OBTAINABLE_AND =
  "\"CERTAIN\" MEANS OBTAINABLE, AND IT MEANS THAT UNDER EVERY KEY "
  + "ON THIS PAYLOAD. A certainty is a claim about what the "
  + "operator can really have at this tick, so the same three "
  + "findings gate every block that asserts one \u2014 no_bid (nothing "
  + "resting), thin_bid (a book that cannot absorb the position, or "
  + "a size the provider never sent) and stale_quote (a book past "
  + "the live plane's age ceiling, or of unknown age). One payload "
  + "cannot refuse a certainty under one key and assert it under "
  + "another: the operator reads whichever one renders. No partial "
  + "is priced in their place \u2014 no clip enters these figures: a "
  + "clip is a different trade, priced under its own key "
  + "(partial_exit) against the actual book, and never presented as "
  + "the whole position's exit.";

const CONTRACTS_X_THE_ENGINE =
  "contracts x the engine's persisted P(win) for the held leg x "
  + "$1.00, read off the tape row (fair_now) \u2014 the same read "
  + "value_at_settlement_cents uses for the whole position, and a "
  + "MEAN the remainder never actually pays";

const EVERY_REFUSAL_HERE_CARRIES =
  "EVERY REFUSAL HERE CARRIES A CODE FROM position.REFUSAL_CODES "
  + "BESIDE ITS WORDS. The words say which absence it is; the code "
  + "is what a counter can group by, so 'the grid has no cell for "
  + "this state' and 'a dismissal voided it' can never again arrive "
  + "as one number. A code is never imputed and no cause borrows "
  + "another's label.";

const IT_SHOWS_IT_DOES =
  "IT SHOWS; IT DOES NOT DECIDE. Four sizes of one trade, each "
  + "with what it realises and what it leaves exposed, in the order "
  + "the design listed them. Nothing here ranks them, prefers one, "
  + "or names a moment to do anything. The operator decides.";

const M_MEASURED_NO_RESPONSE =
  "M0 MEASURED NO RESPONSE WINDOW, so this map models none. There "
  + "is no minute by which anything should be done, no price at "
  + "which anything should happen, and no key on this payload names "
  + "one. The hazard windows below are the grid's 15-minute "
  + "MEASUREMENT bins, which is a different thing from a window to "
  + "act in.";

const NEITHER_THE_FIXTURE_ROW =
  "neither the fixture row nor any state-tape row says a ball has "
  + "been kicked \u2014 this map is current as far as those two "
  + "witnesses can say; the calendar is not consulted (see "
  + "witnesses.open)";

const NOT_THE_WHOLE_POSITION =
  "NOT the whole-position figure: that prices 100 contract(s) in "
  + "one order at the top of the book (net $77.84, which the top "
  + "cannot absorb \u2014 see thin_bid); this row nets $19.46 for 25 "
  + "contract(s) across 1 level(s), -$58.38 against it. Two "
  + "different trades.";

const NOT_THE_WHOLE_POSITION_2 =
  "NOT the whole-position figure: that prices 100 contract(s) in "
  + "one order at the top of the book (net $77.84, which the top "
  + "cannot absorb \u2014 see thin_bid); this row nets $38.92 for 50 "
  + "contract(s) across 1 level(s), -$38.92 against it. Two "
  + "different trades.";

const NO_STATE_TAPE_ROW =
  "no state-tape row for this fixture: no dismissal has been "
  + "witnessed, and none is assumed. A dismissal after this map is "
  + "drawn voids every grid-derived number on it from first "
  + "sighting";

const NO_VALIDATED_EDGE_THIS =
  "NO VALIDATED EDGE. This module prices a position that is "
  + "already on: it is fair value against a price, not a signal, "
  + "and no in-play entry edge has been measured on this platform. "
  + "The ledger's in-play-adjacent rows are dead (excursions track "
  + "the martingale; the read lost to the ask it disagreed with, "
  + "row 8), and the one cash-out rule tried here is recorded NOT "
  + "ADOPTED (research_archive/cashout_ripeness_2026-08-13.md: it "
  + "paid on two slates, both of which we lost). Nothing in this "
  + "payload is a recommendation and nothing in it is an "
  + "instruction.";

const ONE_FLOOR_FOR_EVERY =
  "ONE FLOOR FOR EVERY CELL ON THIS MAP, v1 and v2 alike: the "
  + "stricter of grids-v2's own min_n_floor and "
  + "precedents.MIN_CELL_N \u2014 the expression "
  + "position._conditioned_fair uses. A cell under it refuses the "
  + "RATE by name (thin_cell_floor), keeps its n, and publishes no "
  + "p and no band, because a thin percentage gets BELIEVED.";

const STALE_QUOTE_NO_FRACTION =
  "stale_quote: no fraction is current. evaluate()'s own words: "
  + "STALE QUOTE: captured 2400s ago (40.0 minutes), past the 600s "
  + "ceiling. Every price figure in this payload is computed from "
  + "that book and inherits its age; the market has had 2400s to "
  + "move away from it.";

const THE_CARD_SHOWS_AN =
  "THE CARD SHOWS AN AVERAGE; THE OPERATOR EXPERIENCES A BRANCH. "
  + "A binary contract never pays its expected value: it pays $1.00 "
  + "or it pays $0.00. On 2026-09-02 at 81' holding was worth "
  + "$23.30 \u2014 which is 23.3% of $100.00 and 76.7% of nothing \u2014 and "
  + "it printed as '$3.46 more than selling', which collapsed a "
  + "cliff into a difference. Same arithmetic; this is its honest "
  + "shape.";

const THE_ENTRY_FEE_CHARGED =
  "The entry fee charged here is the venue's exact per-order "
  + "TAKER fee on the price the operator says they paid, computed "
  + "once on the whole order and rounded UP to the centicent (B8, "
  + "src.live.paper.order_fee_dollars). An entry that RESTED and "
  + "was lifted paid the maker rate instead (a quarter of it, "
  + "paper.MAKER_FEE_RATE); the map cannot tell which from the "
  + "price alone and charges the taker form, so `at_risk_dollars` "
  + "is exact for a crossed entry and an upper bound for a rested "
  + "one.";

const THE_FEE_IS_CHARGED =
  "THE FEE IS CHARGED PER LEVEL WALKED, EXACT AND ROUNDED UP, "
  + "THEN SUMMED. Each allocation is charged at ITS OWN price under "
  + "src.live.paper.order_fee_dollars \u2014 Decimal, ceil to the "
  + "centicent, computed on that allocation's contracts \u2014 and the "
  + "row's fee is the sum (src.live.paper.allocation_fees, V9.3 "
  + "eval F2). It is never one fee at the blended average price: "
  + "the general schedule is 0.07 x C x P x (1-P), non-linear in P, "
  + "so a single fee at the average UNDER-states a walk that spans "
  + "prices. A fraction that fills at one level pays exactly what "
  + "one order of that size at that price pays. src/execution.py's "
  + "float fee() is not used here (B8).";

const THE_LADDER_IS_THE =
  "THE LADDER IS THE YES-SIDE DEPTH CAPTURED WITH THE SAME QUOTE "
  + "ROW THE WHOLE-POSITION FIGURE READS \u2014 resting YES bids, best "
  + "(highest) first, exact provider price and size strings "
  + "preferred over the derived integers (V9 eval F7). Where no "
  + "depth was captured for that quote the ladder is the quote's "
  + "own top of book, and only that: one level, one size, and every "
  + "fraction it cannot hold refuses thin_bid. A level belonging to "
  + "ANOTHER quote row is never read \u2014 a second book is not this "
  + "book. A depth level is not a fresher fact than the quote it "
  + "rides on: staleness is the quote's and every level inherits "
  + "it.";

const THIN_CELL_FLOOR_NO =
  "thin_cell_floor: no grid measures WHICH SIDE scores the opener "
  + "\u2014 first_goal_timing partitions the corpus by first-goal MINUTE "
  + "and gap band, not by scorer \u2014 so the probability of THIS "
  + "branch arising (as opposed to the other side opening) is "
  + "refused, not split by guesswork. The figure beside it is the "
  + "probability of an opener by EITHER side in the window.";

const THIN_CELL_FLOOR_SCORELESS =
  "thin_cell_floor: scoreless_fav_decay/clean_11v11/gap_0_75/45 "
  + "is not a cell: grids-v1 measures scoreless_fav_decay for "
  + "gap_150plus, gap_200plus only \u2014 a HEAVY favourite \u2014 and this "
  + "fixture's band is 0-75. The cell was never measured and no "
  + "pooled or neighbouring one is substituted";

const THIN_CELL_FLOOR_SCORELESS_2 =
  "thin_cell_floor: scoreless_fav_decay/clean_11v11/gap_0_75/60 "
  + "is not a cell: grids-v1 measures scoreless_fav_decay for "
  + "gap_150plus, gap_200plus only \u2014 a HEAVY favourite \u2014 and this "
  + "fixture's band is 0-75. The cell was never measured and no "
  + "pooled or neighbouring one is substituted";

const REC_PE_FULL = {
    applies: true,
    rule: A_CLIP_IS_A,
    fractions: [
      {
        fraction: 0.25,
        label: "25%",
        contracts: "25",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "25",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "19.75",
          fee_dollars: "0.2904",
          fee_cents: 29.04,
          net_dollars: "19.4596",
          net_cents: 1945.96,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "25",
              fee: "0.2904"
            }
          ]
        },
        remains: {
          contracts: "75",
          settles_yes_dollars: "75.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "94.4596",
          outcome_if_remainder_settles_no_dollars: "19.4596",
          expected_at_engine_read_dollars: "59.25",
          expected_at_engine_read_cents: 5925.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "75 contract(s) remain exposed, settling at $75.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84); this row nets $19.46 for 25 contract(s) across 1 level(s), -$58.38 against it. Two different trades.",
        says: "25% (25 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.29, net $19.46; 75 contract(s) remain exposed, settling at $75.00 or $0.00"
      },
      {
        fraction: 0.5,
        label: "50%",
        contracts: "50",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "50",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "39.50",
          fee_dollars: "0.5807",
          fee_cents: 58.07,
          net_dollars: "38.9193",
          net_cents: 3891.93,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "50",
              fee: "0.5807"
            }
          ]
        },
        remains: {
          contracts: "50",
          settles_yes_dollars: "50.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "88.9193",
          outcome_if_remainder_settles_no_dollars: "38.9193",
          expected_at_engine_read_dollars: "39.50",
          expected_at_engine_read_cents: 3950.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "50 contract(s) remain exposed, settling at $50.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84); this row nets $38.92 for 50 contract(s) across 1 level(s), -$38.92 against it. Two different trades.",
        says: "50% (50 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.58, net $38.92; 50 contract(s) remain exposed, settling at $50.00 or $0.00"
      },
      {
        fraction: 0.75,
        label: "75%",
        contracts: "75",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "75",
          average_price_dollars: "0.788",
          average_price_cents: 78.8,
          worst_level_price_dollars: "0.78",
          gross_dollars: "59.10",
          fee_dollars: "0.8770",
          fee_cents: 87.7,
          net_dollars: "58.2230",
          net_cents: 5822.3,
          levels_walked: 2,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "60",
              fee: "0.6968"
            },
            {
              seq: 2,
              price: "0.78",
              qty: "15",
              fee: "0.1802"
            }
          ]
        },
        remains: {
          contracts: "25",
          settles_yes_dollars: "25.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "83.2230",
          outcome_if_remainder_settles_no_dollars: "58.2230",
          expected_at_engine_read_dollars: "19.75",
          expected_at_engine_read_cents: 1975.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "25 contract(s) remain exposed, settling at $25.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84); this row nets $58.22 for 75 contract(s) across 2 level(s), -$19.62 against it. Two different trades.",
        says: "75% (75 of 100 contracts): the ladder pays 78.8c average across 2 level(s), fee $0.88, net $58.22; 25 contract(s) remain exposed, settling at $25.00 or $0.00"
      },
      {
        fraction: 1.0,
        label: "100%",
        contracts: "100",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "100",
          average_price_dollars: "0.785",
          average_price_cents: 78.5,
          worst_level_price_dollars: "0.77",
          gross_dollars: "78.50",
          fee_dollars: "1.1812",
          fee_cents: 118.12,
          net_dollars: "77.3188",
          net_cents: 7731.88,
          levels_walked: 3,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "60",
              fee: "0.6968"
            },
            {
              seq: 2,
              price: "0.78",
              qty: "30",
              fee: "0.3604"
            },
            {
              seq: 3,
              price: "0.77",
              qty: "10",
              fee: "0.1240"
            }
          ]
        },
        remains: {
          contracts: "0",
          settles_yes_dollars: "0.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "77.3188",
          outcome_if_remainder_settles_no_dollars: "77.3188",
          says: "nothing remains exposed \u2014 the whole position is out"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84); this row nets $77.32 for 100 contract(s) across 3 level(s), -$0.52 against it. Two different trades.",
        says: "100% (100 of 100 contracts): the ladder pays 78.5c average across 3 level(s), fee $1.18, net $77.32; nothing remains exposed \u2014 the whole position is out"
      }
    ],
    fractions_priced: 4,
    book: {
      source: "yes_side_depth",
      quote_id: 7,
      captured_at: "2026-09-06T17:05:32+00:00",
      levels: [
        {
          price_dollars: "0.79",
          size: "60"
        },
        {
          price_dollars: "0.78",
          size: "30"
        },
        {
          price_dollars: "0.77",
          size: "50"
        }
      ],
      resting_total: "140",
      depth_levels_available: 3,
      levels_from_another_quote_dropped: 0,
      top_of_book: {
        bid_dollars: "0.79",
        size: "250"
      },
      best_level_matches_top_of_book: false,
      depth_read: null,
      basis: THE_LADDER_IS_THE
    },
    executability: {
      consulted: [
        "no_bid",
        "thin_bid",
        "stale_quote"
      ],
      order_basis: "position.REFUSAL_CODES' own order \u2014 the same three findings, the same codes and the same order the whole-position figure and the certainty premium consult",
      refused_under_by_fraction: {
        "25%": [],
        "50%": [],
        "75%": [],
        "100%": []
      },
      rule: CERTAIN_MEANS_OBTAINABLE_AND
    },
    fee_basis: THE_FEE_IS_CHARGED,
    whole_contracts: A_FRACTION_IS_PRICED,
    not_a_recommendation: IT_SHOWS_IT_DOES,
    common_case: A_THIN_OR_ABSENT
  };

const REC_PE_DEPTH_FAILED = {
    applies: true,
    rule: A_CLIP_IS_A,
    fractions: [
      {
        fraction: 0.25,
        label: "25%",
        contracts: "25",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "25",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "19.75",
          fee_dollars: "0.2904",
          fee_cents: 29.04,
          net_dollars: "19.4596",
          net_cents: 1945.96,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "25",
              fee: "0.2904"
            }
          ]
        },
        remains: {
          contracts: "75",
          settles_yes_dollars: "75.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "94.4596",
          outcome_if_remainder_settles_no_dollars: "19.4596",
          expected_at_engine_read_dollars: "59.25",
          expected_at_engine_read_cents: 5925.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "75 contract(s) remain exposed, settling at $75.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: NOT_THE_WHOLE_POSITION,
        says: "25% (25 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.29, net $19.46; 75 contract(s) remain exposed, settling at $75.00 or $0.00"
      },
      {
        fraction: 0.5,
        label: "50%",
        contracts: "50",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "50",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "39.50",
          fee_dollars: "0.5807",
          fee_cents: 58.07,
          net_dollars: "38.9193",
          net_cents: 3891.93,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "50",
              fee: "0.5807"
            }
          ]
        },
        remains: {
          contracts: "50",
          settles_yes_dollars: "50.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "88.9193",
          outcome_if_remainder_settles_no_dollars: "38.9193",
          expected_at_engine_read_dollars: "39.50",
          expected_at_engine_read_cents: 3950.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "50 contract(s) remain exposed, settling at $50.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: NOT_THE_WHOLE_POSITION_2,
        says: "50% (50 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.58, net $38.92; 50 contract(s) remain exposed, settling at $50.00 or $0.00"
      },
      {
        fraction: 0.75,
        label: "75%",
        contracts: "75",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "thin_bid"
          ]
        },
        obtainable: false,
        refusal_code: "thin_bid",
        refused: "thin_bid: the 75% fraction (75 contract(s)) prints no figure: the ladder holds 60 contract(s) against the 75 this fraction asks for (60 resting across 1 level(s), source top_quote_only) \u2014 it cannot absorb this fraction at this tick, and the part it could absorb is not priced in its place",
        also_refused_under: null,
        refusals: {
          thin_bid: "thin_bid: the ladder holds 60 contract(s) against the 75 this fraction asks for (60 resting across 1 level(s), source top_quote_only) \u2014 it cannot absorb this fraction at this tick, and the part it could absorb is not priced in its place"
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "75% (75 contracts): REFUSED thin_bid \u2014 no figure"
      },
      {
        fraction: 1.0,
        label: "100%",
        contracts: "100",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "thin_bid"
          ]
        },
        obtainable: false,
        refusal_code: "thin_bid",
        refused: "thin_bid: the 100% fraction (100 contract(s)) prints no figure: the ladder holds 60 contract(s) against the 100 this fraction asks for (60 resting across 1 level(s), source top_quote_only) \u2014 it cannot absorb this fraction at this tick, and the part it could absorb is not priced in its place",
        also_refused_under: null,
        refusals: {
          thin_bid: "thin_bid: the ladder holds 60 contract(s) against the 100 this fraction asks for (60 resting across 1 level(s), source top_quote_only) \u2014 it cannot absorb this fraction at this tick, and the part it could absorb is not priced in its place"
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "100% (100 contracts): REFUSED thin_bid \u2014 no figure"
      }
    ],
    fractions_priced: 2,
    book: {
      source: "top_quote_only",
      quote_id: 7,
      captured_at: "2026-09-06T17:08:12+00:00",
      levels: [
        {
          price_dollars: "0.79",
          size: "60"
        }
      ],
      resting_total: "60",
      depth_levels_available: 0,
      levels_from_another_quote_dropped: 0,
      top_of_book: {
        bid_dollars: "0.79",
        size: "60"
      },
      best_level_matches_top_of_book: true,
      depth_read: "the depth read raised: OperationalError('server closed the connection')",
      basis: THE_LADDER_IS_THE,
      depth_read_note: "the depth read for this quote FAILED, so the ladder is the quote's top of book alone \u2014 not because no depth exists, but because it could not be read. Every fraction the top cannot hold refuses thin_bid against a book this payload could not see in full."
    },
    executability: {
      consulted: [
        "no_bid",
        "thin_bid",
        "stale_quote"
      ],
      order_basis: "position.REFUSAL_CODES' own order \u2014 the same three findings, the same codes and the same order the whole-position figure and the certainty premium consult",
      refused_under_by_fraction: {
        "25%": [],
        "50%": [],
        "75%": [
          "thin_bid"
        ],
        "100%": [
          "thin_bid"
        ]
      },
      rule: CERTAIN_MEANS_OBTAINABLE_AND
    },
    fee_basis: THE_FEE_IS_CHARGED,
    whole_contracts: A_FRACTION_IS_PRICED,
    not_a_recommendation: IT_SHOWS_IT_DOES,
    common_case: A_THIN_OR_ABSENT
  };

const REC_PE_STALE = {
    applies: false,
    rule: A_CLIP_IS_A,
    fractions: [
      {
        fraction: 0.25,
        label: "25%",
        contracts: "25",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "stale_quote"
          ]
        },
        obtainable: false,
        refusal_code: "stale_quote",
        refused: "stale_quote: the 25% fraction (25 contract(s)) prints no figure: no fraction is current. evaluate()'s own words: STALE QUOTE: captured 2400s ago (40.0 minutes), past the 600s ceiling. Every price figure in this payload is computed from that book and inherits its age; the market has had 2400s to move away from it.",
        also_refused_under: null,
        refusals: {
          stale_quote: STALE_QUOTE_NO_FRACTION
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "25% (25 contracts): REFUSED stale_quote \u2014 no figure"
      },
      {
        fraction: 0.5,
        label: "50%",
        contracts: "50",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "stale_quote"
          ]
        },
        obtainable: false,
        refusal_code: "stale_quote",
        refused: "stale_quote: the 50% fraction (50 contract(s)) prints no figure: no fraction is current. evaluate()'s own words: STALE QUOTE: captured 2400s ago (40.0 minutes), past the 600s ceiling. Every price figure in this payload is computed from that book and inherits its age; the market has had 2400s to move away from it.",
        also_refused_under: null,
        refusals: {
          stale_quote: STALE_QUOTE_NO_FRACTION
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "50% (50 contracts): REFUSED stale_quote \u2014 no figure"
      },
      {
        fraction: 0.75,
        label: "75%",
        contracts: "75",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "stale_quote"
          ]
        },
        obtainable: false,
        refusal_code: "stale_quote",
        refused: "stale_quote: the 75% fraction (75 contract(s)) prints no figure: no fraction is current. evaluate()'s own words: STALE QUOTE: captured 2400s ago (40.0 minutes), past the 600s ceiling. Every price figure in this payload is computed from that book and inherits its age; the market has had 2400s to move away from it.",
        also_refused_under: null,
        refusals: {
          stale_quote: STALE_QUOTE_NO_FRACTION
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "75% (75 contracts): REFUSED stale_quote \u2014 no figure"
      },
      {
        fraction: 1.0,
        label: "100%",
        contracts: "100",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "stale_quote"
          ]
        },
        obtainable: false,
        refusal_code: "stale_quote",
        refused: "stale_quote: the 100% fraction (100 contract(s)) prints no figure: no fraction is current. evaluate()'s own words: STALE QUOTE: captured 2400s ago (40.0 minutes), past the 600s ceiling. Every price figure in this payload is computed from that book and inherits its age; the market has had 2400s to move away from it.",
        also_refused_under: null,
        refusals: {
          stale_quote: STALE_QUOTE_NO_FRACTION
        },
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        says: "100% (100 contracts): REFUSED stale_quote \u2014 no figure"
      }
    ],
    fractions_priced: 0,
    book: {
      source: "yes_side_depth",
      quote_id: 7,
      captured_at: "2026-09-06T16:25:52+00:00",
      levels: [
        {
          price_dollars: "0.79",
          size: "60"
        },
        {
          price_dollars: "0.78",
          size: "30"
        },
        {
          price_dollars: "0.77",
          size: "50"
        }
      ],
      resting_total: "140",
      depth_levels_available: 3,
      levels_from_another_quote_dropped: 0,
      top_of_book: {
        bid_dollars: "0.79",
        size: "250"
      },
      best_level_matches_top_of_book: false,
      depth_read: null,
      basis: THE_LADDER_IS_THE
    },
    executability: {
      consulted: [
        "no_bid",
        "thin_bid",
        "stale_quote"
      ],
      order_basis: "position.REFUSAL_CODES' own order \u2014 the same three findings, the same codes and the same order the whole-position figure and the certainty premium consult",
      refused_under_by_fraction: {
        "25%": [
          "stale_quote"
        ],
        "50%": [
          "stale_quote"
        ],
        "75%": [
          "stale_quote"
        ],
        "100%": [
          "stale_quote"
        ]
      },
      rule: CERTAIN_MEANS_OBTAINABLE_AND
    },
    fee_basis: THE_FEE_IS_CHARGED,
    whole_contracts: A_FRACTION_IS_PRICED,
    not_a_recommendation: IT_SHOWS_IT_DOES,
    common_case: A_THIN_OR_ABSENT,
    refusal_code: "stale_quote",
    refused: "stale_quote: no fraction of this position prints a figure \u2014 every row refuses (stale_quote); each names its own absence above"
  };

const REC_PE_TINY = {
    applies: true,
    rule: A_CLIP_IS_A,
    fractions: [
      {
        fraction: 0.25,
        label: "25%",
        contracts: "0",
        of_contracts: "3",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: false,
        rounded_down_from: "0.75",
        rounding: A_FRACTION_IS_PRICED,
        no_whole_contract: "25% of 3 contract(s) is 0.75 of a contract \u2014 no whole contract, so there is no order here and nothing is priced. A FRACTION IS PRICED IN WHOLE CONTRACTS, ROUNDED DOWN. A quarter of a 3-contract position is 0.75 of a contract, and 0.75 of a contract is not an order this block will price: the row states that it holds no whole contract and prices nothing, rather than pricing a quantity the venue may not accept. The rounding is stated on every row it changes.",
        says: "25%: no whole contract to price; all 3 remain exposed"
      },
      {
        fraction: 0.5,
        label: "50%",
        contracts: "1",
        of_contracts: "3",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        rounded_down_from: "1.5",
        rounding: A_FRACTION_IS_PRICED,
        realises: {
          contracts: "1",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "0.79",
          fee_dollars: "0.0117",
          fee_cents: 1.17,
          net_dollars: "0.7783",
          net_cents: 77.83,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "1",
              fee: "0.0117"
            }
          ]
        },
        remains: {
          contracts: "2",
          settles_yes_dollars: "2.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "2.7783",
          outcome_if_remainder_settles_no_dollars: "0.7783",
          expected_at_engine_read_dollars: "1.58",
          expected_at_engine_read_cents: 158.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "2 contract(s) remain exposed, settling at $2.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 3 contract(s) in one order at the top of the book (net $2.34); this row nets $0.78 for 1 contract(s) across 1 level(s), -$1.56 against it. Two different trades.",
        says: "50% (1 of 3 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.01, net $0.78; 2 contract(s) remain exposed, settling at $2.00 or $0.00"
      },
      {
        fraction: 0.75,
        label: "75%",
        contracts: "2",
        of_contracts: "3",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        rounded_down_from: "2.25",
        rounding: A_FRACTION_IS_PRICED,
        realises: {
          contracts: "2",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "1.58",
          fee_dollars: "0.0233",
          fee_cents: 2.33,
          net_dollars: "1.5567",
          net_cents: 155.67,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "2",
              fee: "0.0233"
            }
          ]
        },
        remains: {
          contracts: "1",
          settles_yes_dollars: "1.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "2.5567",
          outcome_if_remainder_settles_no_dollars: "1.5567",
          expected_at_engine_read_dollars: "0.79",
          expected_at_engine_read_cents: 79.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "1 contract(s) remain exposed, settling at $1.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 3 contract(s) in one order at the top of the book (net $2.34); this row nets $1.56 for 2 contract(s) across 1 level(s), -$0.78 against it. Two different trades.",
        says: "75% (2 of 3 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.02, net $1.56; 1 contract(s) remain exposed, settling at $1.00 or $0.00"
      },
      {
        fraction: 1.0,
        label: "100%",
        contracts: "3",
        of_contracts: "3",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "3",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "2.37",
          fee_dollars: "0.0349",
          fee_cents: 3.49,
          net_dollars: "2.3351",
          net_cents: 233.51,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "3",
              fee: "0.0349"
            }
          ]
        },
        remains: {
          contracts: "0",
          settles_yes_dollars: "0.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "2.3351",
          outcome_if_remainder_settles_no_dollars: "2.3351",
          says: "nothing remains exposed \u2014 the whole position is out"
        },
        matches_whole_position_exit: true,
        vs_whole_position: "the same numbers as the whole-position figure: one level absorbs the whole position, so walking the ladder for all of it IS one order at the top of the book (net $2.34 both ways)",
        says: "100% (3 of 3 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.03, net $2.34; nothing remains exposed \u2014 the whole position is out"
      }
    ],
    fractions_priced: 3,
    book: {
      source: "yes_side_depth",
      quote_id: 7,
      captured_at: "2026-09-06T17:08:12+00:00",
      levels: [
        {
          price_dollars: "0.79",
          size: "60"
        },
        {
          price_dollars: "0.78",
          size: "30"
        },
        {
          price_dollars: "0.77",
          size: "50"
        }
      ],
      resting_total: "140",
      depth_levels_available: 3,
      levels_from_another_quote_dropped: 0,
      top_of_book: {
        bid_dollars: "0.79",
        size: "250"
      },
      best_level_matches_top_of_book: false,
      depth_read: null,
      basis: THE_LADDER_IS_THE
    },
    executability: {
      consulted: [
        "no_bid",
        "thin_bid",
        "stale_quote"
      ],
      order_basis: "position.REFUSAL_CODES' own order \u2014 the same three findings, the same codes and the same order the whole-position figure and the certainty premium consult",
      refused_under_by_fraction: {
        "25%": [],
        "50%": [],
        "75%": [],
        "100%": []
      },
      rule: CERTAIN_MEANS_OBTAINABLE_AND
    },
    fee_basis: THE_FEE_IS_CHARGED,
    whole_contracts: A_FRACTION_IS_PRICED,
    not_a_recommendation: IT_SHOWS_IT_DOES,
    common_case: A_THIN_OR_ABSENT
  };

const REC_MAP_MIXED = {
    version: "entry-map-v1",
    charter: "IT SHOWS; IT DOES NOT DECIDE (src/live/position.py)",
    a_map_not_a_verdict: A_MAP_NOT_A,
    not_a_signal: NO_VALIDATED_EDGE_THIS,
    no_response_window: M_MEASURED_NO_RESPONSE,
    drawn_from: "minute 0 \u2014 at purchase",
    fixture: {
      id: 1,
      competition_slug: "mls-2026"
    },
    position: {
      outcome_key: "home_win",
      side: "home",
      contracts: "100",
      price_paid: "0.46",
      gross_dollars: "46.00",
      entry_fee_dollars: "1.7388",
      at_risk_dollars: "47.7388",
      pays_if_your_side_wins_dollars: "100",
      max_gain_dollars: "52.2612",
      max_loss_dollars: "-47.7388",
      fee_model: "src.live.paper.order_fee_dollars",
      entry_fee_note: THE_ENTRY_FEE_CHARGED
    },
    grids: {
      variant: "clean_11v11",
      min_n_floor: 100,
      floor_rule: ONE_FLOOR_FOR_EVERY
    },
    favourite: {
      fav_side: "home",
      fav_p: 0.72,
      band: "0-75",
      triple: {
        home: 0.72,
        draw: 0.18,
        away: 0.1
      },
      source: "test",
      read_from: "test"
    },
    red_card: {
      void: false,
      withdraws: false,
      withdrawal: null,
      witness: null,
      tape_note: NO_STATE_TAPE_ROW
    },
    match_now: {
      started: false,
      note: NEITHER_THE_FIXTURE_ROW
    },
    you_are: {
      role: "favourite",
      side: "home",
      says: "you hold the favourite (home)"
    },
    voided: false,
    branches: {
      favourite_opens_by_30: {
        state: "the favourite scores the opener at or before 30'",
        grid: "comeback_by_strength",
        opener: {
          role: "favourite",
          side: "home"
        },
        relation_to_you: "you score first",
        reached: {
          state: "an opener by either side at or before 30'",
          p_first_goal_percent: 54.0,
          p_first_goal_wilson_band_percent: [
            52.7,
            55.2
          ],
          n: 5903,
          k: 3185,
          composed_from: [
            "1-15",
            "16-30"
          ],
          source_cell: "first_goal_timing/clean_11v11/bands/0-75/bins",
          either_side: "by either side \u2014 the partition is by MINUTE, not by scorer",
          by_side: {
            refusal_code: "thin_cell_floor",
            refused: THIN_CELL_FLOOR_NO
          }
        },
        your_contract: {
          contract: "home",
          held: true,
          quantity: {
            quantity: "lower_bound_on_p_win",
            answers: "is this lead never levelled \u2014 a LOWER BOUND on P(win), not an estimate of it",
            quantity_key: "lower_bound_on_p_win",
            lower_bound_on_p_win: 0.511,
            lower_bound_on_p_win_percent: 51.1,
            n: 1709,
            lower_bound_on_p_win_wilson_band_percent: [
              48.7,
              53.4
            ],
            source_cell: "comeback_by_strength/clean_11v11/bands/0-75/fav_opener/equalized",
            note: "1 - P(equalised eventually | the favourite opens by 30'): P(this lead is NEVER levelled) \u2014 a LOWER BOUND on P(home wins), not an estimate of it. A lead levelled and restored fails this number and still wins the market",
            category_rule: A_HAZARD_AND_A
          }
        },
        dollars: {
          settles: {
            if_your_side_wins_dollars: "100",
            otherwise_dollars: "0"
          },
          pnl: {
            if_your_side_wins_dollars: "52.2612",
            otherwise_dollars: "-47.7388"
          },
          branches_not_averages: THE_CARD_SHOWS_AN,
          expected: {
            priced: false,
            quantity_key: "lower_bound_on_p_win",
            not_priced: "NOT PRICED. The held contract's number in this branch is a LOWER BOUND on P(win) \u2014 1 minus 'ever level again' \u2014 and an expectation priced off a bound would be the 2026-09-02 substitution in dollars. position.hold_expected_dollars refuses a HazardLowerBound by type and this module does not hand it one. The two settlement outcomes beside this are exact; the probability between them is bounded, not estimated.",
            category_rule: A_HAZARD_AND_A
          }
        }
      },
      underdog_opens_by_30: {
        state: "the underdog scores the opener at or before 30'",
        grid: "comeback_by_strength",
        opener: {
          role: "underdog",
          side: "away"
        },
        relation_to_you: "they score first",
        reached: {
          state: "an opener by either side at or before 30'",
          p_first_goal_percent: 54.0,
          p_first_goal_wilson_band_percent: [
            52.7,
            55.2
          ],
          n: 5903,
          k: 3185,
          composed_from: [
            "1-15",
            "16-30"
          ],
          source_cell: "first_goal_timing/clean_11v11/bands/0-75/bins",
          either_side: "by either side \u2014 the partition is by MINUTE, not by scorer",
          by_side: {
            refusal_code: "thin_cell_floor",
            refused: THIN_CELL_FLOOR_NO
          }
        },
        your_contract: {
          contract: "home",
          held: true,
          quantity: {
            quantity: "win_probability",
            answers: "does this side win the market",
            quantity_key: "p_win",
            p_win: 0.209,
            p_win_percent: 20.9,
            n: 1476,
            p_win_wilson_band_percent: [
              18.9,
              23.0
            ],
            source_cell: "comeback_by_strength/clean_11v11/bands/0-75/dog_opener/overturned",
            note: "P(overturned at FT | the underdog opens by 30') = P(home, the side that CONCEDED, is AHEAD at full time) \u2014 the trailing side's win probability, measured directly",
            category_rule: A_HAZARD_AND_A
          }
        },
        dollars: {
          settles: {
            if_your_side_wins_dollars: "100",
            otherwise_dollars: "0"
          },
          pnl: {
            if_your_side_wins_dollars: "52.2612",
            otherwise_dollars: "-47.7388"
          },
          branches_not_averages: THE_CARD_SHOWS_AN,
          expected: {
            quantity_key: "p_win",
            settlement_dollars: "20.900",
            settlement_dollars_wilson_band: [
              "18.9000",
              "23.0000"
            ],
            pnl_dollars: "-26.8388",
            pnl_dollars_wilson_band: [
              "-28.8388",
              "-24.7388"
            ],
            n: 1476,
            certainty_vs_mean: "This compares a CERTAIN amount against a MEAN. The exit figure is what the book pays now; the settlement figure is an expected value at the current read, and the position actually settles at $1.00 or $0.00. The difference says nothing about variance, and an operator who cares about the spread of outcomes is looking at a number that does not contain it."
          }
        }
      },
      still_0_0_at_45: {
        state: "no goal has been scored by minute 45",
        grid: "scoreless_fav_decay",
        minute: 45,
        relation_to_you: "nobody has scored \u2014 neither side is ahead",
        reached: {
          state: "no goal by minute 45 (first goal after 45', or none)",
          p_first_goal_percent: 29.3,
          p_first_goal_wilson_band_percent: [
            28.2,
            30.5
          ],
          n: 5903,
          k: 1732,
          composed_from: [
            "46-60",
            "61-75",
            "76-90+",
            "none"
          ],
          source_cell: "first_goal_timing/clean_11v11/bands/0-75/bins",
          either_side: "by either side \u2014 the partition is by MINUTE, not by scorer"
        },
        your_contract: {
          contract: "home",
          held: true,
          refusal_code: "thin_cell_floor",
          refused: THIN_CELL_FLOOR_SCORELESS
        },
        dollars: {
          settles: {
            if_your_side_wins_dollars: "100",
            otherwise_dollars: "0"
          },
          pnl: {
            if_your_side_wins_dollars: "52.2612",
            otherwise_dollars: "-47.7388"
          },
          branches_not_averages: THE_CARD_SHOWS_AN,
          expected: {
            refusal_code: "thin_cell_floor",
            refused: THIN_CELL_FLOOR_SCORELESS
          }
        }
      },
      still_0_0_at_60: {
        state: "no goal has been scored by minute 60",
        grid: "scoreless_fav_decay",
        minute: 60,
        relation_to_you: "nobody has scored \u2014 neither side is ahead",
        reached: {
          state: "no goal by minute 60 (first goal after 60', or none)",
          p_first_goal_percent: 18.3,
          p_first_goal_wilson_band_percent: [
            17.3,
            19.3
          ],
          n: 5903,
          k: 1081,
          composed_from: [
            "61-75",
            "76-90+",
            "none"
          ],
          source_cell: "first_goal_timing/clean_11v11/bands/0-75/bins",
          either_side: "by either side \u2014 the partition is by MINUTE, not by scorer"
        },
        your_contract: {
          contract: "home",
          held: true,
          refusal_code: "thin_cell_floor",
          refused: THIN_CELL_FLOOR_SCORELESS_2
        },
        dollars: {
          settles: {
            if_your_side_wins_dollars: "100",
            otherwise_dollars: "0"
          },
          pnl: {
            if_your_side_wins_dollars: "52.2612",
            otherwise_dollars: "-47.7388"
          },
          branches_not_averages: THE_CARD_SHOWS_AN,
          expected: {
            refusal_code: "thin_cell_floor",
            refused: THIN_CELL_FLOOR_SCORELESS_2
          }
        }
      }
    },
    refusals: {
      count_by_code: {
        thin_cell_floor: 17
      },
      total: 17,
      rule: EVERY_REFUSAL_HERE_CARRIES,
      codes: {
        thin_cell_floor: "the grid measured no quotable cell for this state, or measured one under its own n floor. THE TRUE MEANING OF THIS LABEL, and nothing else may borrow it"
      }
    }
  };

const REC_MAP_REFUSED = {
    version: "entry-map-v1",
    charter: "IT SHOWS; IT DOES NOT DECIDE (src/live/position.py)",
    a_map_not_a_verdict: A_MAP_NOT_A,
    not_a_signal: NO_VALIDATED_EDGE_THIS,
    no_response_window: M_MEASURED_NO_RESPONSE,
    drawn_from: "minute 0 \u2014 at purchase",
    fixture: {
      id: 1,
      competition_slug: "mls-2026"
    },
    position: {
      outcome_key: "home_win",
      side: "home",
      contracts: "100",
      price_paid: "0.46",
      gross_dollars: "46.00",
      entry_fee_dollars: "1.7388",
      at_risk_dollars: "47.7388",
      pays_if_your_side_wins_dollars: "100",
      max_gain_dollars: "52.2612",
      max_loss_dollars: "-47.7388",
      fee_model: "src.live.paper.order_fee_dollars",
      entry_fee_note: THE_ENTRY_FEE_CHARGED
    },
    grids: {
      variant: "clean_11v11",
      min_n_floor: 100,
      floor_rule: ONE_FLOOR_FOR_EVERY
    },
    favourite: {
      refusal_code: "thin_book",
      refused: "thin_book: no lock in this test"
    },
    red_card: {
      void: false,
      withdraws: false,
      withdrawal: null,
      witness: null,
      tape_note: NO_STATE_TAPE_ROW
    },
    match_now: {
      started: false,
      note: NEITHER_THE_FIXTURE_ROW
    },
    you_are: null,
    branches: {
      favourite_opens_by_30: {
        refusal_code: "thin_book",
        refused: "thin_book: every banded cell on this map conditions on the pre-kickoff favourite and its gap band, and none could be read \u2014 see favourite.refused"
      },
      underdog_opens_by_30: {
        refusal_code: "thin_book",
        refused: "thin_book: every banded cell on this map conditions on the pre-kickoff favourite and its gap band, and none could be read \u2014 see favourite.refused"
      },
      still_0_0_at_45: {
        refusal_code: "thin_book",
        refused: "thin_book: every banded cell on this map conditions on the pre-kickoff favourite and its gap band, and none could be read \u2014 see favourite.refused"
      },
      still_0_0_at_60: {
        refusal_code: "thin_book",
        refused: "thin_book: every banded cell on this map conditions on the pre-kickoff favourite and its gap band, and none could be read \u2014 see favourite.refused"
      }
    },
    refusals: {
      count_by_code: {
        thin_book: 6
      },
      total: 6,
      rule: EVERY_REFUSAL_HERE_CARRIES,
      codes: {
        thin_book: "a book needed to condition a measured cell is not there \u2014 for the leader arm that is the PRE-KICKOFF book, whose absence is the collector's own no-lock refusal"
      }
    }
  };

const REC_PE_SHARED_A = {
    applies: true,
    rule: A_CLIP_IS_A,
    fractions: [
      {
        fraction: 0.25,
        label: "25%",
        contracts: "25",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "25",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "19.75",
          fee_dollars: "0.2904",
          fee_cents: 29.04,
          net_dollars: "19.4596",
          net_cents: 1945.96,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "25",
              fee: "0.2904"
            }
          ]
        },
        remains: {
          contracts: "75",
          settles_yes_dollars: "75.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "94.4596",
          outcome_if_remainder_settles_no_dollars: "19.4596",
          expected_at_engine_read_dollars: "59.25",
          expected_at_engine_read_cents: 5925.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "75 contract(s) remain exposed, settling at $75.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: NOT_THE_WHOLE_POSITION,
        says: "25% (25 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.29, net $19.46; 75 contract(s) remain exposed, settling at $75.00 or $0.00",
        leg_consult: {
          positions_on_leg: 2,
          combined_contracts: "50",
          ladder_resting_total: "150",
          holds: true,
          says: "2 positions ask 50 contract(s) between them at 25% against 150 resting on the ladder \u2014 enough for all of them at this tick. Still priced independently; the ladder is still shared."
        }
      },
      {
        fraction: 0.5,
        label: "50%",
        contracts: "50",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "50",
          average_price_dollars: "0.79",
          average_price_cents: 79.0,
          worst_level_price_dollars: "0.79",
          gross_dollars: "39.50",
          fee_dollars: "0.5807",
          fee_cents: 58.07,
          net_dollars: "38.9193",
          net_cents: 3891.93,
          levels_walked: 1,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "50",
              fee: "0.5807"
            }
          ]
        },
        remains: {
          contracts: "50",
          settles_yes_dollars: "50.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "88.9193",
          outcome_if_remainder_settles_no_dollars: "38.9193",
          expected_at_engine_read_dollars: "39.50",
          expected_at_engine_read_cents: 3950.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "50 contract(s) remain exposed, settling at $50.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: NOT_THE_WHOLE_POSITION_2,
        says: "50% (50 of 100 contracts): the ladder pays 79.0c average across 1 level(s), fee $0.58, net $38.92; 50 contract(s) remain exposed, settling at $50.00 or $0.00",
        leg_consult: {
          positions_on_leg: 2,
          combined_contracts: "100",
          ladder_resting_total: "150",
          holds: true,
          says: "2 positions ask 100 contract(s) between them at 50% against 150 resting on the ladder \u2014 enough for all of them at this tick. Still priced independently; the ladder is still shared."
        }
      },
      {
        fraction: 0.75,
        label: "75%",
        contracts: "75",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: []
        },
        obtainable: true,
        realises: {
          contracts: "75",
          average_price_dollars: "0.788",
          average_price_cents: 78.8,
          worst_level_price_dollars: "0.78",
          gross_dollars: "59.10",
          fee_dollars: "0.8770",
          fee_cents: 87.7,
          net_dollars: "58.2230",
          net_cents: 5822.3,
          levels_walked: 2,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "60",
              fee: "0.6968"
            },
            {
              seq: 2,
              price: "0.78",
              qty: "15",
              fee: "0.1802"
            }
          ]
        },
        remains: {
          contracts: "25",
          settles_yes_dollars: "25.00",
          settles_no_dollars: "0.00",
          outcome_if_remainder_settles_yes_dollars: "83.2230",
          outcome_if_remainder_settles_no_dollars: "58.2230",
          expected_at_engine_read_dollars: "19.75",
          expected_at_engine_read_cents: 1975.0,
          expected_basis: CONTRACTS_X_THE_ENGINE,
          says: "25 contract(s) remain exposed, settling at $25.00 or $0.00"
        },
        matches_whole_position_exit: false,
        vs_whole_position: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84, which the top cannot absorb \u2014 see thin_bid); this row nets $58.22 for 75 contract(s) across 2 level(s), -$19.62 against it. Two different trades.",
        says: "75% (75 of 100 contracts): the ladder pays 78.8c average across 2 level(s), fee $0.88, net $58.22; 25 contract(s) remain exposed, settling at $25.00 or $0.00",
        leg_consult: {
          positions_on_leg: 2,
          combined_contracts: "150",
          ladder_resting_total: "150",
          holds: true,
          says: "2 positions ask 150 contract(s) between them at 75% against 150 resting on the ladder \u2014 enough for all of them at this tick. Still priced independently; the ladder is still shared."
        }
      },
      {
        fraction: 1.0,
        label: "100%",
        contracts: "100",
        of_contracts: "100",
        executability: {
          consulted: [
            "no_bid",
            "thin_bid",
            "stale_quote"
          ],
          refused_under: [
            "thin_bid"
          ],
          refused_by: "shared_exit_book"
        },
        obtainable: false,
        remains: {
          contracts: "100",
          says: "nothing is exited under this row; all 100 contract(s) remain exposed"
        },
        matches_whole_position_exit: null,
        says: "100% (100 contracts): REFUSED thin_bid on a ladder shared by 2 positions \u2014 no figure",
        obtainable_alone: true,
        realises_alone_withdrawn: {
          contracts: "100",
          average_price_dollars: "0.786",
          average_price_cents: 78.6,
          worst_level_price_dollars: "0.78",
          gross_dollars: "78.60",
          fee_dollars: "1.1773",
          fee_cents: 117.73,
          net_dollars: "77.4227",
          net_cents: 7742.27,
          levels_walked: 2,
          allocations: [
            {
              seq: 1,
              price: "0.79",
              qty: "60",
              fee: "0.6968"
            },
            {
              seq: 2,
              price: "0.78",
              qty: "40",
              fee: "0.4805"
            }
          ]
        },
        vs_whole_position_alone: "NOT the whole-position figure: that prices 100 contract(s) in one order at the top of the book (net $77.84, which the top cannot absorb \u2014 see thin_bid); this row nets $77.42 for 100 contract(s) across 2 level(s), -$0.42 against it. Two different trades.",
        refusal_code: "thin_bid",
        refused: "thin_bid: the 100% row is WITHDRAWN on a leg held 2 times: 2 positions on home_win ask 200 contract(s) between them at this fraction against 150 resting on the ladder, and the ladder cannot pay them all. This row was priced as if this position were the only one on the leg; which of them the ladder pays first is not decided here."
      }
    ],
    fractions_priced: 3,
    book: {
      source: "yes_side_depth",
      quote_id: 7,
      captured_at: "2026-09-06T17:05:32+00:00",
      levels: [
        {
          price_dollars: "0.79",
          size: "60"
        },
        {
          price_dollars: "0.78",
          size: "90"
        }
      ],
      resting_total: "150",
      depth_levels_available: 2,
      levels_from_another_quote_dropped: 0,
      top_of_book: {
        bid_dollars: "0.79",
        size: "60"
      },
      best_level_matches_top_of_book: true,
      depth_read: null,
      basis: THE_LADDER_IS_THE
    },
    executability: {
      consulted: [
        "no_bid",
        "thin_bid",
        "stale_quote"
      ],
      order_basis: "position.REFUSAL_CODES' own order \u2014 the same three findings, the same codes and the same order the whole-position figure and the certainty premium consult",
      refused_under_by_fraction: {
        "25%": [],
        "50%": [],
        "75%": [],
        "100%": [
          "thin_bid"
        ]
      },
      rule: CERTAIN_MEANS_OBTAINABLE_AND
    },
    fee_basis: THE_FEE_IS_CHARGED,
    whole_contracts: A_FRACTION_IS_PRICED,
    not_a_recommendation: IT_SHOWS_IT_DOES,
    common_case: A_THIN_OR_ABSENT,
    withdrawn_on_shared_ladder: [
      "100%"
    ],
    withdrawn_on_shared_ladder_rule: "THE FRACTION ROWS READ THE LADDER, AND THE LADDER IS ONE POOL. partial_exit prices each position on its own against the yes-side depth, so on a leg held twice every fraction row on BOTH positions claimed `obtainable` against one shared ladder (S1, 2026-09-05: two 100% rows, 200 contracts, against 150 resting). This block asks the ladder the same question the whole-position leg asks the top of the book \u2014 can it pay every position this fraction at once \u2014 reading the ladder OFF THE POSITIONS' OWN partial_exit.book (no second reader), and where it cannot, each such row is withdrawn under thin_bid in the registry's own words. The 25% rows of two positions that fit together stand; which position the ladder pays first is not decided here."
  };

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
    // RECORDED: every fraction prices, the 100% row lands on the
    // whole-position figure and says so derived from the two numbers.
    partial_exit: REC_PE_FULL,
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
          + "— no clip enters this branch; a clip is a different trade "
          + "under partial_exit.",
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
    // RECORDED: the depth read FAILED, so the ladder is the quote's top
    // of book alone — named as a read failure, never folded into "no
    // depth" — and the two fractions the top cannot hold refuse.
    partial_exit: REC_PE_DEPTH_FAILED,
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
    // RECORDED: a book past the age ceiling — EVERY fraction refuses and
    // not one of them prints a figure.
    partial_exit: REC_PE_STALE,
  }],
};

// --- M4: DECLARED, NOT YET KICKED OFF. The minute-0 map's own case:
// the position was taken at purchase, the map is drawn from minute 0,
// and no ball has been kicked — which is the payload's OWN answer under
// `match_now`, from the tape and the fixture row, never from a clock in
// the browser. The read has persisted nothing because there is nothing
// in play to persist, and that is said rather than drawn as quiet.
const NOT_STARTED = {
  fixture_id: 404, competition_slug: "mls-2026",
  home: "Portland Timbers", away: "Seattle Sounders FC",
  state: {
    in_play: false, minute: null, score_home: null, score_away: null,
    clock_display: null, match_state: "pre",
    captured_at: "2026-09-06T17:00:00Z",
    refusals: [
      { code: "not_in_play",
        refused: "not_in_play: the tape row is not an in-play state, so "
          + "there is no minute and no live scoreline to condition on" },
      { code: "no_score",
        refused: "no_score: the tape carries no score for this tick — "
          + "missing is never zero-zero" },
    ],
  },
  coverage: {
    monitored: true, complete_history: true,
    history: "declared before kickoff — the read spans the whole match "
      + "and nothing before it is missing",
    joined_phase: "pre_kickoff", joined_minute: null,
    unobserved_before_minute: null,
    watching_since: "2026-09-06T15:00:00Z",
    source: "open_position",
    source_meaning: "the journal holds an open position on this fixture; "
      + "this set is mechanical and carries no selection bias",
    actor: "sync-positions",
    no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET,
  },
  read: {
    version: "live-read-v1", read_version: "live-read-components-v1",
    fixture_id: 404, monitored: true,
    coverage: { monitored: true, complete_history: true,
                no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET },
    components_registry: {}, kinds: {}, sides: {},
    words: "no component read has been persisted for this fixture. That "
      + "is a fixture nobody declared, or one whose tape has not yet "
      + "carried an in-play tick under its watch — it is not a match in "
      + "which nothing has happened",
  },
  positions: [{
    journal_entry: { bet_id: 84, outcome_key: "home_win",
      market_ticker: "KXMLSGAME-SAMPLE-POR",
      stated_price_dollars: "0.46", stated_size: "100" },
    position: {
      outcome_key: "home_win", side: "home", size: "100",
      entry_price: 0.46, entry_cost_dollars: "46.00",
      entry_note: "THE ENTRY IS SUNK",
    },
    value_now_cents: null,
    value_now_withdrawn: "not_in_play: nothing is priced off a book "
      + "before kickoff on this surface",
    // RECORDED. Band 0-75: the two opener branches price (one of them a
    // WIN probability, the other a LOWER BOUND — they are not the same
    // quantity and never share a bar), and the two scoreless branches
    // refuse thin_cell_floor because scoreless_fav_decay measures a
    // HEAVY favourite only. No neighbouring cell is substituted.
    entry_map: REC_MAP_MIXED,
    // NO `partial_exit` KEY AT ALL — the absent-block case. Absent is
    // not "no clip is obtainable" and the strip must say which it is.
    certainty_premium: {
      applies: false,
      refused: "not_in_play: the tape row is not an in-play state, so "
        + "there is no minute and no live scoreline to condition on",
      refusal_code: "not_in_play",
      asymmetry: {
        rule: CERTAINTY_IS_ASYMMETRIC,
        position_is_ahead: null,
        protects: "gains", cannot_protect: "losses",
      },
    },
  }, {
    journal_entry: { bet_id: 85, outcome_key: "draw",
      stated_price_dollars: "0.27", stated_size: "3" },
    position: {
      outcome_key: "draw", side: "draw", size: "3",
      entry_price: 0.27, entry_cost_dollars: "0.81",
      entry_note: "THE ENTRY IS SUNK",
    },
    value_now_cents: null,
    // RECORDED on a 3-contract position: 25% of 3 is 0.75 of a contract,
    // which is not an order this block will price. The row says so in
    // its own words and BORROWS NO REGISTRY CODE for it — a fraction of
    // a contract is arithmetic about the position, not a finding about
    // the book.
    partial_exit: REC_PE_TINY,
    certainty_premium: {
      applies: false,
      refused: "not_in_play: the tape row is not an in-play state, so "
        + "there is no minute and no live scoreline to condition on",
      refusal_code: "not_in_play",
      asymmetry: {
        rule: CERTAINTY_IS_ASYMMETRIC,
        position_is_ahead: null,
        protects: "gains", cannot_protect: "losses",
      },
    },
  }],
};

// --- M5: ONE LEG HELD TWICE. The ladder is one pool: 60@79c + 90@78c =
// 150 resting against two 100-contract positions on home_win. The 25/50
// /75 rows fit together and stand; the two 100% rows ask 200 between
// them and are WITHDRAWN in place by card._shared_exit_book, each
// keeping what it would have realised alone under its own key. And the
// map refuses outright here: no pre-kickoff favourite could be read, so
// every banded cell on it refuses thin_book rather than banding off the
// live book.
const SHARED_LEG = {
  fixture_id: 505, competition_slug: "epl-2026",
  home: "Arsenal", away: "Aston Villa",
  state: {
    in_play: false, minute: null, score_home: null, score_away: null,
    clock_display: null, match_state: "pre",
    captured_at: "2026-09-06T17:00:00Z",
    refusals: [{ code: "not_in_play",
      refused: "not_in_play: the tape row is not an in-play state, so "
        + "there is no minute and no live scoreline to condition on" }],
  },
  coverage: {
    monitored: true, complete_history: true,
    history: "declared before kickoff",
    joined_phase: "pre_kickoff", source: "open_position",
    actor: "sync-positions",
    no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET,
  },
  read: {
    version: "live-read-v1", read_version: "live-read-components-v1",
    fixture_id: 505, monitored: true,
    coverage: { monitored: true, complete_history: true,
                no_history_is_not_quiet: NO_HISTORY_IS_NOT_QUIET },
    components_registry: {}, kinds: {}, sides: {},
    words: "no component read has been persisted for this fixture. That "
      + "is a fixture nobody declared, or one whose tape has not yet "
      + "carried an in-play tick under its watch — it is not a match in "
      + "which nothing has happened",
  },
  positions: [1, 2].map((n) => ({
    journal_entry: { bet_id: 90 + n, outcome_key: "home_win",
      stated_price_dollars: "0.46", stated_size: "100" },
    position: {
      outcome_key: "home_win", side: "home", size: "100",
      entry_price: 0.46, entry_cost_dollars: "46.00",
      entry_note: "THE ENTRY IS SUNK",
    },
    value_now_cents: null,
    partial_exit: REC_PE_SHARED_A,
    entry_map: REC_MAP_REFUSED,
    certainty_premium: {
      applies: false,
      refused: "not_in_play: the tape row is not an in-play state, so "
        + "there is no minute and no live scoreline to condition on",
      refusal_code: "not_in_play",
      asymmetry: {
        rule: CERTAINTY_IS_ASYMMETRIC,
        position_is_ahead: null,
        protects: "gains", cannot_protect: "losses",
      },
    },
  })),
};

const STRIP = {
  version: "watched-strip-v1",
  generated_at: "2026-09-04T21:05:11Z",
  matches: [AHEAD, BEHIND, UNKNOWN_SIDE, NOT_STARTED, SHARED_LEG],
  monitored_by_source: { manual: [101, 303], open_position: [202, 404, 505] },
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

// THIS TEST PINNED THE DEFECT, AND IT HAD TO CHANGE. Say it loudly,
// because a test that changes is the one place a regression hides.
//
// It used to read: "with the endpoint as it really is today, the strip
// is absent and the board is unharmed", and it asserted
// `toHaveCount(0)` on a non-200. That was TRUE and it was the bug. The
// backend route existed; there was no proxy in front of it; every poll
// in production 404'd; the component's single catch drew nothing for
// "no route, no credential, or a dead backend" alike — so this section
// has never once rendered on namson.dev, and the blank space where it
// should be reads to any operator as "no match is live". It was a claim
// about a set nobody had counted, and this test certified it.
//
// The proxy exists now and the endpoint is operator-gated, so the
// honest answer to an unauthenticated poll is a REFUSAL WITH WORDS. The
// replacement is stricter, not looser: it still runs unmocked against
// the real proxy and the real backend, it still requires the board to
// be unharmed, and it now also requires the section to say what
// happened and to derive the status it prints from the response that
// actually came back.
test("with the endpoint as it really is today, the strip is REFUSED in "
   + "words rather than absent, and the board is unharmed",
  async ({ page }) => {
    // UNMOCKED ON PURPOSE — the real Next proxy and the real backend.
    const resp = await openSettled(page, undefined);
    await expect(page.getByRole("heading", { name: "Every fixture, ranked" }))
      .toBeVisible();
    // NON-VACUITY: it really did ask, and really was refused.
    expect(resp.status()).not.toBe(200);

    const section = strip(page);
    await expect(section).toBeVisible();
    await expect(section).toHaveAttribute("data-state", "refused");

    const gate = page.getByTestId("watched-strip-gate");
    // THE STATUS IS DERIVED FROM THE RESPONSE, not typed here. A number
    // written into this file would go on passing the day the route
    // starts answering something else.
    await expect(gate).toHaveAttribute("data-status", String(resp.status()));
    // No token was typed on this page, and the section says so rather
    // than blaming the backend for it.
    await expect(gate).toHaveAttribute("data-token-held", "false");

    // AND IT MAY NOT CLAIM THE THING IT COULD NOT MEASURE.
    const text = (await section.innerText()).toLowerCase();
    expect(text).toContain("has not been read");
    for (const lie of ["no live matches", "no matches are live",
                       "nothing is live", "no declared match"]) {
      expect(text, `a section that was refused must not claim "${lie}"`)
        .not.toContain(lie);
    }
  });

test("the proxy route exists and relays the BACKEND's answer, not "
   + "Next's 404", async ({ request }) => {
    // The whole defect in one assertion. Before this round
    // /api/bet-suggester/watched-strip was not a route at all, so this
    // returned Next's own 404 page — HTML, authored by the framework,
    // with nothing of the backend in it. Now the status and the body
    // are the backend's.
    const r = await request.get("/api/bet-suggester/watched-strip");
    expect(r.headers()["content-type"]).toContain("application/json");
    const body = await r.json();
    // A refusal is FIRST-CLASS: it arrives with the refusing layer's own
    // sentence under `detail` (FastAPI) or `error` (this proxy, and only
    // when the backend was never reached).
    expect(typeof (body.detail ?? body.error)).toBe("string");
    expect((body.detail ?? body.error).length).toBeGreaterThan(0);
    // and the proxy holds no credential of its own: an unauthenticated
    // call is NOT quietly upgraded into a payload
    expect(r.status()).not.toBe(200);
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
  // DERIVED FROM THE SERVED PAYLOAD. A number typed here goes on being
  // green while a match added to the fixture never renders.
  await expect(page.getByTestId("watched-match"))
    .toHaveCount(STRIP.matches.length);

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
  // DERIVED FROM THE SERVED PAYLOAD, not from a list of matches typed
  // here. The hand-listed version went on being green the moment a
  // fourth match joined the fixture and its positions carried no G1 —
  // the exact shape of a guard that names a rule and checks a subset.
  const served = STRIP.matches
    .reduce((n, m) => n + m.positions.length, 0);
  expect(served).toBeGreaterThan(3);                  // non-vacuity
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

test("every refusal a POSITION carries is named ON THAT POSITION",
  async ({ page }) => {
    // THE STRONGER HALF OF THE RULE ABOVE. Asking only that each code
    // appear SOMEWHERE on the strip is satisfied by a neighbour: the
    // mutation pass showed that dropping every refusal inside
    // `partial_exit` and `entry_map` left that guard green, because
    // thin_bid, stale_quote, thin_cell_floor and thin_book all also
    // appear on other blocks. A refusal belongs to the position whose
    // number could not be produced, and it is named there.
    await open(page, STRIP);
    await expect(page.getByTestId("watched-refusal").first()).toBeVisible();
    let checked = 0;
    for (const m of STRIP.matches) {
      for (const pos of m.positions) {
        const bet = (pos.journal_entry as { bet_id: number }).bet_id;
        const want = [...codesIn(pos)].sort();
        const el = position(page, bet);
        await expect(el).toHaveCount(1);
        const shown = new Set(await el.getByTestId("watched-refusal")
          .evaluateAll((els) => els.map((e) => e.getAttribute("data-code")!)));
        for (const code of want) {
          expect([...shown], `position #${bet} must name ${code} itself`)
            .toContain(code);
          checked += 1;
        }
      }
    }
    expect(checked, "non-vacuity: some position must carry a refusal")
      .toBeGreaterThan(5);
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
  const by = STRIP.monitored_by_source as Record<string, number[]>;
  for (const key of Object.keys(by)) {
    await expect(src).toContainText(`${key.replace(/_/g, " ")} ${by[key].length}`);
  }
  // THE SUM IS THE NUMBER NOBODY MAY PRINT, and it is derived from the
  // served payload rather than typed beside the assertion — a total
  // written here would stop being the total the moment the fixture grew.
  const total = Object.values(by).reduce((n, ids) => n + ids.length, 0);
  expect(Object.keys(by).map((k) => by[k].length)).not.toContain(total);
  await expect(src).not.toContainText(String(total));
});

// -------------------------------------------- 6. B4, the partial exit
//
// Four sizes of one trade, walked down the ACTUAL ladder. What is at
// stake here is the same thing that was at stake for the whole position:
// a figure the operator cannot obtain must never be printed as one, and
// nothing on this surface may look like the answer.

const peOf = (m: { positions: { partial_exit?: unknown }[] }, i = 0) =>
  m.positions[i].partial_exit as {
    fractions: { label: string; obtainable: boolean; refusal_code?: string;
                 realises?: { net_dollars: string };
                 realises_alone_withdrawn?: { net_dollars: string } }[];
    fractions_priced: number; refusal_code?: string | null;
  };

const position = (page: Page, bet: number) =>
  page.locator(`[data-testid="watched-position"][data-bet="${bet}"]`);

test("every fraction the payload carries is drawn, in the payload's own "
   + "order, with what it realises and what it leaves exposed",
  async ({ page }) => {
    await open(page, STRIP);
    const block = position(page, 41).getByTestId("watched-partial-exit");
    await expect(block).toBeVisible();
    // DERIVED FROM THE SERVED BLOCK — the labels, the order and the
    // count all come out of the bytes, never out of a list typed here.
    const served = peOf(AHEAD).fractions;
    const rows = position(page, 41).getByTestId("watched-fraction");
    await expect(rows).toHaveCount(served.length);
    const labels = await rows.evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-label")!));
    expect(labels).toEqual(served.map((f) => f.label));
    for (const f of served) {
      const row = position(page, 41)
        .locator(`[data-testid="watched-fraction"][data-label="${f.label}"]`);
      // what it realises — the payload's own net, to the cent
      await expect(row.getByTestId("watched-fraction-realises"))
        .toContainText(`$${Number(f.realises!.net_dollars).toFixed(2)}`);
      // and what it LEAVES EXPOSED, which is the half a clip hides
      await expect(row.getByTestId("watched-fraction-remains")).toBeVisible();
    }
    // the fee is stated per level walked, not as one fee at the average
    await expect(block).toContainText("PER LEVEL WALKED");
    await expect(block).toContainText("never one fee at the blended average");
  });

test("no fraction is highlighted as a suggestion", async ({ page }) => {
  await open(page, STRIP);
  const rows = position(page, 41).getByTestId("watched-fraction");
  await expect(rows.first()).toBeVisible();
  // IDENTICAL CHROME, ACROSS EVERY ROW ON THE PAGE. Scoped to one
  // position this was vacuous: that position's four rows are all
  // obtainable, so a rule that painted obtainable rows green left them
  // identical to each other and the guard stayed green. The set below
  // spans priced rows, refused rows and withdrawn rows together, and
  // the non-vacuity check proves it does.
  const all = page.getByTestId("watched-fraction");
  const states = new Set(await all.evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-obtainable")!)));
  expect(states, "the page must carry both obtainable and refused rows "
    + "or this guard proves nothing").toEqual(new Set(["true", "false"]));
  const classes = await all.evaluateAll((els) =>
    els.map((e) => e.getAttribute("class")));
  expect(new Set(classes).size).toBe(1);
  // and the block says, in the backend's words, that it ranks none
  const block = position(page, 41).getByTestId("watched-partial-exit");
  await expect(block.getByTestId("watched-partial-exit-not-a-recommendation"))
    .toContainText("Nothing here ranks them, prefers one, or names a moment");
  // No ordering word, no crown, no preference key on any ROW. Scoped to
  // the rows on purpose: the block's own provenance line says "the best
  // level on the ladder does not match the quote's top of book", which
  // is a fact about the book and not a preference between fractions.
  for (const t of await rows.allInnerTexts()) {
    const text = t.toLowerCase();
    for (const word of ["best", "optimal", "suggested", "preferred",
                        "recommended", "you should", "take this"]) {
      expect(text, `no row may say "${word}"`).not.toContain(word);
    }
  }
});

test("a fraction the ladder cannot pay refuses by name and prints no "
   + "figure", async ({ page }) => {
    await open(page, STRIP);
    const served = peOf(BEHIND).fractions;
    const refused = served.filter((f) => f.refusal_code);
    expect(refused.length).toBeGreaterThan(0);         // non-vacuity
    for (const f of refused) {
      const row = position(page, 58)
        .locator(`[data-testid="watched-fraction"][data-label="${f.label}"]`);
      await expect(row).toHaveAttribute("data-obtainable", "false");
      await expect(row.getByTestId("watched-fraction-refused"))
        .toHaveAttribute("data-code", f.refusal_code!);
      // NO FIGURE. Not a dash, not a smaller number, not the part the
      // ladder could have absorbed — the row prices nothing.
      await expect(row.getByTestId("watched-fraction-realises"))
        .toHaveCount(0);
      await expect(row).not.toContainText("net $");
    }
    // the ones that fit still price — this is a refusal, not a blackout
    for (const f of served.filter((x) => !x.refusal_code)) {
      await expect(position(page, 58).locator(
        `[data-testid="watched-fraction"][data-label="${f.label}"]`)
        .getByTestId("watched-fraction-realises")).toBeVisible();
    }
  });

test("a depth read that FAILED is named as a failure, never folded into "
   + "'no depth'", async ({ page }) => {
    await open(page, STRIP);
    const note = position(page, 58)
      .getByTestId("watched-partial-exit-depth-failed");
    await expect(note).toBeVisible();
    await expect(note).toContainText("The depth read failed");
    await expect(note).toContainText("OperationalError");
    await expect(note).toContainText("not because no depth exists");
    // and the ladder says which book it actually walked
    await expect(position(page, 58)
      .getByTestId("watched-partial-exit-book"))
      .toHaveAttribute("data-source", "top_quote_only");
  });

test("a stale book refuses every fraction, and the block says so at its "
   + "own level", async ({ page }) => {
    await open(page, STRIP);
    const pe = peOf(UNKNOWN_SIDE);
    expect(pe.fractions_priced).toBe(0);              // non-vacuity
    const block = position(page, 77).getByTestId("watched-partial-exit");
    await expect(block.getByTestId("watched-partial-exit-refused"))
      .toHaveAttribute("data-code", pe.refusal_code!);
    await expect(block.getByTestId("watched-fraction-realises"))
      .toHaveCount(0);
    const rows = block.getByTestId("watched-fraction");
    await expect(rows).toHaveCount(pe.fractions.length);
    const obtainable = await rows.evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-obtainable")));
    expect(new Set(obtainable)).toEqual(new Set(["false"]));
  });

test("a fraction with no whole contract says so and borrows no registry "
   + "code", async ({ page }) => {
    await open(page, STRIP);
    const row = position(page, 85)
      .locator('[data-testid="watched-fraction"][data-label="25%"]');
    const note = row.getByTestId("watched-fraction-no-whole");
    await expect(note).toBeVisible();
    await expect(note).toContainText("0.75 of a contract");
    // A CODE IS NEVER IMPUTED. This is arithmetic about the position,
    // not a finding about the book, so no refusal element sits on it and
    // no registry name is borrowed for it.
    await expect(row.getByTestId("watched-fraction-refused")).toHaveCount(0);
    // and the rows that DO hold a whole contract still price
    await expect(position(page, 85).locator(
      '[data-testid="watched-fraction"][data-label="100%"]')
      .getByTestId("watched-fraction-realises")).toBeVisible();
  });

test("a row withdrawn on the shared ladder says so, and the figure it "
   + "would have had alone is kept under that name", async ({ page }) => {
    await open(page, STRIP);
    const served = peOf(SHARED_LEG).fractions;
    const withdrawn = served.filter((f) => f.realises_alone_withdrawn);
    expect(withdrawn.length).toBeGreaterThan(0);      // non-vacuity
    for (const bet of [91, 92]) {
      for (const f of withdrawn) {
        const row = position(page, bet).locator(
          `[data-testid="watched-fraction"][data-label="${f.label}"]`);
        await expect(row).toHaveAttribute("data-withdrawn-by",
          "shared_exit_book");
        await expect(row).toHaveAttribute("data-obtainable", "false");
        await expect(row.getByTestId("watched-fraction-refused"))
          .toContainText("held 2 times");
        // THE ALONE FIGURE IS VISIBLE AND LABELLED AS WITHDRAWN — it is
        // history, not an exit this position can take.
        const alone = row.getByTestId("watched-fraction-realises-withdrawn");
        await expect(alone).toContainText("withdrawn");
        await expect(alone).toContainText(
          `$${Number(f.realises_alone_withdrawn!.net_dollars).toFixed(2)}`);
        // and it is NOT the row's own claim
        await expect(row.getByTestId("watched-fraction-realises"))
          .toHaveCount(0);
      }
      // the rows the one ladder CAN pay together still stand, each with
      // the leg's consult beside it
      for (const f of served.filter((x) => !x.realises_alone_withdrawn)) {
        const row = position(page, bet).locator(
          `[data-testid="watched-fraction"][data-label="${f.label}"]`);
        await expect(row).toHaveAttribute("data-obtainable", "true");
        await expect(row.getByTestId("watched-fraction-leg-consult"))
          .toHaveAttribute("data-holds", "true");
      }
    }
  });

test("an absent partial-exit block is named as absent, not as an "
   + "unobtainable clip", async ({ page }) => {
    await open(page, STRIP);
    // the anchor: this position IS drawn, and its sibling DOES carry a
    // block — so the absence below is an absence and not a dead page
    await expect(position(page, 84).getByTestId("watched-g1")).toBeVisible();
    await expect(position(page, 85).getByTestId("watched-partial-exit"))
      .toBeVisible();
    await expect(position(page, 84).getByTestId("watched-partial-exit"))
      .toHaveCount(0);
    const note = position(page, 84)
      .getByTestId("watched-partial-exit-absent");
    await expect(note).toContainText("not a finding that a clip is unobtainable");
  });

// ------------------------------------------- 7. B2, the minute-0 map

const mapOf = (m: { positions: { entry_map?: unknown }[] }, i = 0) =>
  m.positions[i].entry_map as {
    branches: Record<string, Record<string, unknown>>;
    refusals: { total: number };
    match_now: { started: boolean };
  };

test("a watched fixture that has not kicked off carries the minute-0 "
   + "map, with every branch the payload holds", async ({ page }) => {
    await open(page, STRIP);
    const map = position(page, 84).getByTestId("watched-entry-map");
    await expect(map).toBeVisible();
    // THE FIXTURE'S OWN WITNESS, not a clock in the browser
    await expect(map).toHaveAttribute("data-started", "false");
    await expect(map.getByTestId("watched-map-when"))
      .toContainText("neither the fixture row nor any state-tape row");
    // DERIVED: every branch on the payload is drawn, none is dropped and
    // none is invented. (The brief for this surface said three; the
    // backend's registry carries four, and the payload is what is drawn.)
    const names = Object.keys(mapOf(NOT_STARTED).branches);
    expect(names.length).toBeGreaterThanOrEqual(3);
    const rows = map.getByTestId("watched-map-branch");
    await expect(rows).toHaveCount(names.length);
    const drawn = await rows.evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-branch")!));
    expect(drawn.sort()).toEqual([...names].sort());
    // and it calls itself a map rather than a verdict
    await expect(map.getByTestId("watched-map-not-a-verdict"))
      .toContainText("A MAP, NOT A VERDICT");
    await expect(map.getByTestId("watched-map-no-window"))
      .toContainText("M0 MEASURED NO RESPONSE WINDOW");
  });

test("every branch that carries a number carries its n and its band",
  async ({ page }) => {
    await open(page, STRIP);
    const map = position(page, 84).getByTestId("watched-entry-map");
    const branches = mapOf(NOT_STARTED).branches;
    let checked = 0;
    for (const name of Object.keys(branches)) {
      const row = map.locator(
        `[data-testid="watched-map-branch"][data-branch="${name}"]`);
      // the rate for REACHING the state
      await expect(row.getByTestId("watched-map-reached"))
        .toContainText("n=");
      await expect(row.getByTestId("watched-map-reached"))
        .toContainText("band [");
      // and the held contract's own number, where the cell exists
      const contract = row.getByTestId("watched-map-contract");
      if (await contract.count()) {
        await expect(contract).toContainText("n=");
        await expect(contract).toContainText("band [");
        checked += 1;
      }
    }
    expect(checked, "at least one branch must actually price").toBeGreaterThan(0);
  });

test("a win probability and a lower bound never share a bar",
  async ({ page }) => {
    await open(page, STRIP);
    const map = position(page, 84).getByTestId("watched-entry-map");
    // DERIVED FROM THE PAYLOAD'S OWN `quantity_key`, which is how the
    // backend keeps the two apart: they answer different questions, they
    // are not comparable, and they carry their numbers under different
    // keys. On 2026-09-02 comparing them directly manufactured a
    // 13-point edge out of nothing.
    const branches = mapOf(NOT_STARTED).branches;
    const kinds = new Set<string>();
    for (const [name, b] of Object.entries(branches)) {
      const q = (b.your_contract as { quantity?: { quantity_key?: string } }
        | undefined)?.quantity;
      if (!q?.quantity_key) continue;
      kinds.add(q.quantity_key);
      await expect(map.locator(
        `[data-testid="watched-map-branch"][data-branch="${name}"]`))
        .toHaveAttribute("data-quantity", q.quantity_key);
    }
    expect(kinds.size, "the fixture must carry BOTH quantities or this "
      + "guard proves nothing").toBeGreaterThan(1);
    // THE WORD BESIDE EACH NUMBER, read off the LABEL and not off the
    // paragraph. The payload's own `answers` sentence beside the number
    // also says "LOWER BOUND", so a scan of the whole block would keep
    // passing while the label itself drifted to calling a bound an
    // estimate — the mutation pass caught exactly that.
    const words = map.getByTestId("watched-map-quantity-word");
    const byKey: Record<string, string[]> = {};
    for (const el of await words.all()) {
      const key = (await el.getAttribute("data-quantity-key"))!;
      (byKey[key] ??= []).push((await el.innerText()).trim());
    }
    expect(Object.keys(byKey).sort())
      .toEqual([...kinds].sort());
    for (const [key, labels] of Object.entries(byKey)) {
      expect(new Set(labels).size,
        `every ${key} must be labelled the same way`).toBe(1);
    }
    // the two labels must DIFFER, and only the bound may call itself one
    expect(new Set(Object.values(byKey).map((l) => l[0])).size)
      .toBe(Object.keys(byKey).length);
    expect(byKey["lower_bound_on_p_win"][0]).toContain("LOWER BOUND");
    expect(byKey["p_win"][0]).not.toContain("LOWER BOUND");
    // and the wall's own sentence rides on the map
    await expect(map.getByTestId("watched-map-category-rule"))
      .toContainText("NOT THE SAME QUANTITY AND ARE NOT COMPARABLE");
  });

test("no expectation is priced off a lower bound", async ({ page }) => {
  await open(page, STRIP);
  const map = position(page, 84).getByTestId("watched-entry-map");
  const bound = map.locator('[data-quantity="lower_bound_on_p_win"]');
  await expect(bound.first()).toBeVisible();
  const notPriced = bound.getByTestId("watched-map-expected-not-priced");
  await expect(notPriced.first()).toContainText("NOT PRICED");
  // the two settlement figures beside it are exact and still shown
  await expect(bound.getByTestId("watched-map-dollars").first())
    .toContainText("settles $100.00 or $0.00");
  // and no expectation figure sits on that branch
  await expect(bound.getByTestId("watched-map-expected")).toHaveCount(0);
});

test("a cell the grid never measured refuses by name and shows no "
   + "number in its place", async ({ page }) => {
    await open(page, STRIP);
    const map = position(page, 84).getByTestId("watched-entry-map");
    const branches = mapOf(NOT_STARTED).branches;
    const refusedNames = Object.keys(branches).filter((k) =>
      (branches[k].your_contract as { refusal_code?: string } | undefined)
        ?.refusal_code);
    expect(refusedNames.length).toBeGreaterThan(0);    // non-vacuity
    for (const name of refusedNames) {
      const row = map.locator(
        `[data-testid="watched-map-branch"][data-branch="${name}"]`);
      await expect(row.getByTestId("watched-map-contract")).toHaveCount(0);
      // ADDRESSED BY WHERE IT REFUSED, not by "some element in this
      // branch carries this code". The branch's expectation refuses
      // under the same code and the same sentence, so a search by code
      // alone stayed green when the CONTRACT's own code was replaced
      // with a guess — the mutation pass caught it.
      const served = (branches[name].your_contract as
        { refusal_code: string }).refusal_code;
      const at = row.locator(
        `[data-testid="watched-map-refusal"][data-where="${name}.your_contract"]`);
      await expect(at).toHaveCount(1);
      await expect(at).toHaveAttribute("data-code", served);
      await expect(at).toContainText("no pooled or neighbouring one is substituted");
    }
  });

test("when the map refuses, the branch numbers are absent and the "
   + "refusal is named", async ({ page }) => {
    await open(page, STRIP);
    const map = position(page, 91).getByTestId("watched-entry-map");
    await expect(map).toBeVisible();
    const names = Object.keys(mapOf(SHARED_LEG).branches);
    await expect(map.getByTestId("watched-map-branch"))
      .toHaveCount(names.length);
    // ABSENT: no branch prices anything
    await expect(map.getByTestId("watched-map-contract")).toHaveCount(0);
    await expect(map.getByTestId("watched-map-reached")).toHaveCount(0);
    // NAMED: the favourite's own refusal, and each branch's
    await expect(map.locator(
      '[data-testid="watched-map-refusal"][data-where="favourite"]'))
      .toContainText("thin_book");
    for (const name of names) {
      await expect(map.locator(
        `[data-testid="watched-map-refusal"][data-where="${name}.branch"]`))
        .toContainText("conditions on the pre-kickoff favourite");
    }
  });

test("the map states how many refusals it counts on itself and how many "
   + "of them this surface drew", async ({ page }) => {
    await open(page, STRIP);
    for (const [bet, fixture] of [[84, NOT_STARTED], [91, SHARED_LEG]] as
        [number, typeof NOT_STARTED][]) {
      const map = position(page, bet).getByTestId("watched-entry-map");
      const line = map.getByTestId("watched-map-refusal-count");
      // the map's OWN tally, quoted
      await expect(line).toContainText(`${mapOf(fixture).refusals.total} refusal`);
      // and the number said to be drawn is the number actually drawn —
      // derived from the DOM, so a surface that quietly dropped one
      // could not keep claiming it had drawn it
      const drawn = await map.getByTestId("watched-map-refusal").count();
      await expect(line).toContainText(`${drawn} of them`);
      await expect(line).toContainText("this surface does not draw");
    }
  });

test("a position with no map carries no map block at all",
  async ({ page }) => {
    await open(page, STRIP);
    // absent, not empty — and the sibling proves the block can render
    await expect(position(page, 84).getByTestId("watched-entry-map"))
      .toBeVisible();
    await expect(position(page, 85).getByTestId("watched-entry-map"))
      .toHaveCount(0);
  });

// --------------------------------- 8. B3: registered, not pretended

test("no blended rate is drawn, and the strip does not imply one",
  async ({ page }) => {
    await open(page, STRIP);
    // B3 (src/live/live_rates.py) is not in the backend tree this
    // surface was built against, so no payload carries a blended rate,
    // nothing is drawn beside the engine's read, and nothing stands in
    // for it.
    await expect(strip(page).getByTestId("watched-blended-rate"))
      .toHaveCount(0);
    await expect(strip(page).getByTestId("watched-unrendered"))
      .toHaveCount(0);
    // The word alone proves nothing — B4's own fee rule says a fee is
    // "never one fee at the blended average price", which is arithmetic
    // about an order and not a rate. What must be absent is a blended
    // RATE offered as a reading of the match.
    const text = (await strip(page).innerText()).toLowerCase();
    expect(text).not.toContain("blended rate");
    expect(text).not.toContain("second opinion");
    expect(text).not.toContain("live_rates");
  });

test("a payload key this surface has no recorded shape for is NAMED, "
   + "never silently dropped", async ({ page }) => {
    // THE RECORD, PROVEN BOTH WAYS. The strip carries a registry of keys
    // it knows it cannot draw, each with the condition that closes it.
    // Here one of them ARRIVES: the surface must not draw it against a
    // shape nobody recorded, and must not swallow it either.
    const withKey = {
      ...STRIP,
      matches: STRIP.matches.map((m) => m.fixture_id !== 101 ? m : {
        ...m,
        positions: m.positions.map((p) => ({ ...p, blended_rate: {
          note: "a shape this surface has never been shown" } })),
      }),
    };
    await open(page, withKey);
    const named = match(page, 101).getByTestId("watched-unrendered-key");
    await expect(named).toBeVisible();
    await expect(named).toHaveAttribute("data-key", "blended_rate");
    await expect(named).toContainText("no recorded shape for it");
    await expect(named).toContainText("Closes when:");
    await expect(named).toContainText("BESIDE the engine's read");
    // and it is still not DRAWN — naming is not rendering
    await expect(match(page, 101).getByTestId("watched-blended-rate"))
      .toHaveCount(0);
  });

// ------------------------------------- the order the new blocks sit in

test("the partial exit and the map sit after the certainty block and "
   + "before the refusals", async ({ page }) => {
    await open(page, STRIP);
    const seq = await position(page, 84).evaluate((el) => {
      const want = ["watched-ledger", "watched-branches", "watched-certainty",
                    "watched-partial-exit-absent", "watched-entry-map",
                    "watched-position-refusals"];
      const seen: string[] = [];
      el.querySelectorAll("[data-testid]").forEach((n) => {
        const t = n.getAttribute("data-testid")!;
        if (want.includes(t) && !seen.includes(t)) seen.push(t);
      });
      return seen;
    });
    expect(seq).toEqual(["watched-ledger", "watched-branches",
                         "watched-certainty", "watched-partial-exit-absent",
                         "watched-entry-map", "watched-position-refusals"]);
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
    expect(articles).toBe(STRIP.matches.length);
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
                          "we recommend", "advise",
                          "best to sell", "time to sell", "hold on to",
                          "don't sell", "do not sell"]) {
      expect(text, `the strip must not say "${phrase}"`)
        .not.toContain(phrase);
    }
    // A PIN THAT HAD TO CHANGE, AND IT SAYS SO. "recommended" used to be
    // banned outright, which cost nothing while no payload carried the
    // word. B4's block says "no fraction is recommended" — the negation
    // is the point of the block — so the flat ban would now fail on the
    // backend's own charter sentence. The replacement is STRICTER, not
    // looser: every sentence that mentions recommending must carry a
    // negator, so an un-negated recommendation still fails, and the
    // explicit imperatives above stay banned whatever they sit beside.
    const sentences = text.split(/(?<=[.!?])\s+/);
    const recommending = sentences.filter((x) => x.includes("recommend"));
    expect(recommending.length,
      "non-vacuity: the payload's own no-recommendation sentences must "
      + "actually be on the page").toBeGreaterThan(0);
    for (const line of recommending) {
      expect(line, `"${line}" recommends something`)
        .toMatch(/\b(no|not|never|nothing|neither)\b/);
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

// ======================================================================
// THE LIVE SECTION CAN RENDER AT ALL
// ======================================================================
//
// Son's invariant, in his words: "any matches that is selected at any
// moment while it is still in play to be in the Live section". Three
// things broke it and this file owns the first: the section could NEVER
// render. The read is operator-gated, there was no proxy route in front
// of it, and the component's fetch sent no token — so every poll in
// production 404'd and the surface stayed absent. A blank Live section
// reads as "nothing is live", and that was never measured.
//
// What is at stake in this block:
//   - ABSENT AND REFUSED ARE DIFFERENT FACTS. Five rounds have been
//     spent on that distinction and this is the surface where it is
//     most expensive to get wrong.
//   - ONE TOKEN, TWO SURFACES. The token the watch toggle already holds
//     is the token this read sends, as ONE header. A second field for
//     the same secret would be the page inventing a credential.
//   - IN PLAY FIRST AND UNMISTAKABLE, and NOTHING IS FILTERED. The two
//     groups add back to the payload's own set, exactly.

/** The watch panel's own reads, so a token can be typed without the
 *  panel reaching a real backend. Registered by the caller BEFORE the
 *  strip's route, since Playwright matches routes in reverse order. */
async function watchlistRoutes(page: Page) {
  await page.route("**/api/bet-suggester/live-watchlist**", (r) =>
    r.fulfill(json({
      version: "watchlist-v1",
      generated_at: "2026-09-04T12:00:00Z",
      monitored_fixture_ids: [], monitored_by_source: {},
      coverage: [], open_positions_not_monitored: [], log: [],
      registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
    })));
}

/** Type an operator token into the watch panel — the SAME field the
 *  watch toggle uses. Nothing in the bundle knows this value. */
async function typeToken(page: Page, token: string) {
  await page.getByTestId("watch-panel").locator("summary").click();
  await page.locator("#watch-token").fill(token);
}

const gate = (page: Page) => page.getByTestId("watched-strip-gate");

// ------------------------------------------------- refused, not absent

test("with no token typed, the Live section SAYS it needs one — it does "
   + "not vanish", async ({ page }) => {
    // The backend's own refusal shape: FastAPI's HTTPException(403,
    // "operator credentials required"), which is what
    // api/main.py's bet_suggester_watched_strip raises.
    await openSettled(page, { detail: "operator credentials required" }, 403);
    await expect(strip(page)).toBeVisible();
    await expect(gate(page)).toHaveAttribute("data-kind", "needs_token");
    await expect(gate(page)).toHaveAttribute("data-token-held", "false");
    await expect(gate(page)).toHaveAttribute("data-status", "403");
    // the reader is told the section exists, what it needs and where
    await expect(gate(page)).toContainText("no token is held in this tab");
    await expect(gate(page)).toContainText("watch panel");
    // THE BACKEND'S OWN SENTENCE, verbatim — never a paraphrase
    await expect(gate(page)).toContainText("operator credentials required");
    // and no match block is drawn against a payload that never arrived
    await expect(page.getByTestId("watched-match")).toHaveCount(0);
  });

test("a token that the backend refuses is reported as a REFUSED TOKEN, "
   + "not as a missing one", async ({ page }) => {
    // Two states that look identical if the surface only counts blanks:
    // "you have typed nothing" and "what you typed was refused". The
    // second is the one that needs a different action from the reader.
    await watchlistRoutes(page);
    await routes(page, { detail: "operator credentials required" }, 403);
    await page.goto("/bet-suggester");
    await expect(gate(page)).toHaveAttribute("data-kind", "needs_token");
    await typeToken(page, "a-token-the-backend-does-not-like");
    await expect(gate(page)).toHaveAttribute("data-kind", "token_refused");
    await expect(gate(page)).toHaveAttribute("data-token-held", "true");
    await expect(gate(page)).toContainText("was refused by the read");
  });

test("a missing route is named as a missing route, never as an empty "
   + "watchlist", async ({ page }) => {
    await openSettled(page, { error: "not found" }, 404);
    await expect(gate(page)).toHaveAttribute("data-kind", "no_route");
    await expect(gate(page)).toContainText("is not there");
    await expect(gate(page)).toContainText("not an empty watchlist");
    await expect(gate(page)).toContainText("404");
  });

test("a backend that was never reached is named as that, and not as a "
   + "refusal", async ({ page }) => {
    await openSettled(page, {
      error: "proxy_unreachable",
      detail: "the strip's backend was never reached, so there is no "
        + "answer to relay — this is not a refusal and not an empty "
        + "watchlist" }, 502);
    await expect(gate(page)).toHaveAttribute("data-kind", "unreachable");
    await expect(gate(page)).toContainText("never reached");
  });

test("a refused section never claims that nothing is live", async ({ page }) => {
    // THE WHOLE POINT. The set it would have counted is exactly the
    // thing it could not read, so it has no evidence for the sentence a
    // blank space was saying on its behalf.
    for (const [body, status] of [
      [{ detail: "operator credentials required" }, 403],
      [{ error: "not found" }, 404],
      [{ error: "proxy_unreachable" }, 502],
    ] as [unknown, number][]) {
      // Playwright matches routes in reverse registration order, so
      // each pass's handler wins over the last.
      await openSettled(page, body, status);
      const text = (await strip(page).innerText()).toLowerCase();
      expect(text).toContain("has not been read");
      for (const lie of ["no live matches", "no matches are live",
                         "nothing is live", "no declared match",
                         "no match is live"]) {
        expect(text, `status ${status} must not claim "${lie}"`)
          .not.toContain(lie);
      }
    }
  });

test("a 200 that says nothing is declared is still ABSENT — the refusal "
   + "render never swallows the empty case", async ({ page }) => {
    // NON-VACUITY FOR THE OTHER DIRECTION. Now that a failed read draws
    // a section, the honest empty answer must still draw none, or this
    // round would have traded one wrong blank for one wrong box.
    const resp = await openSettled(page, EMPTY);
    expect(resp.status()).toBe(200);
    await expect(strip(page)).toHaveCount(0);
  });

// ------------------------------------------------- one token, one header

test("the read carries the operator token the watch toggle holds, as ONE "
   + "header, and only once a person has typed it", async ({ page }) => {
    const seen: (string | undefined)[] = [];
    const otherCreds: string[] = [];
    await watchlistRoutes(page);
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
    await page.route(`**${STRIP_URL}**`, (r) => {
      const h = r.request().headers();
      seen.push(h["x-admin-token"]);
      for (const k of Object.keys(h)) {
        if (/authorization|cookie|api[-_]?key|token/i.test(k)
            && k !== "x-admin-token") otherCreds.push(k);
      }
      return r.fulfill(json(seen.length === 1 ? EMPTY : STRIP));
    });
    await page.goto("/bet-suggester");
    await expect
      .poll(() => seen.length, { timeout: 15_000 }).toBeGreaterThan(0);
    // BEFORE a token is typed: no header. The site holds no credential
    // and never sends one it does not have.
    expect(seen[0]).toBeUndefined();

    await typeToken(page, "operator-token-typed-by-a-person");
    // Typing it RE-READS — the operator does not reload the page to see
    // the section they were just told needs a credential.
    await expect(strip(page)).toBeVisible();
    await expect(page.getByTestId("watched-match").first()).toBeVisible();
    expect(seen[seen.length - 1]).toBe("operator-token-typed-by-a-person");
    // and nothing else that could be a credential rode along
    expect(otherCreds).toEqual([]);
  });

// ---------------------------------------------- in play first, and marked

/** The payload with its matches in the WORST possible order for this
 *  rule: every not-in-play fixture ahead of every in-play one. The
 *  recorded STRIP already happens to list the live ones first, so a
 *  surface that did no ordering at all would pass against it. */
const REORDERED = {
  ...STRIP,
  matches: [...STRIP.matches].sort(
    (a, b) => Number(a.state.in_play) - Number(b.state.in_play)),
};

test("every in-play match is drawn before every match that is not",
  async ({ page }) => {
    await open(page, REORDERED);
    await expect(strip(page)).toBeVisible();
    // NON-VACUITY: the served order really is the wrong one, so an
    // unordered surface fails here.
    expect(REORDERED.matches.map((m) => m.state.in_play))
      .not.toEqual(REORDERED.matches.map((m) => m.state.in_play).sort(
        (a, b) => Number(b) - Number(a)));

    const drawn = await page.getByTestId("watched-match")
      .evaluateAll((els) => els.map((e) => ({
        fixture: Number(e.getAttribute("data-fixture")),
        live: e.getAttribute("data-in-play") === "true",
      })));
    // EVERY declared match is still here — the ordering filters nothing
    expect(drawn.length).toBe(REORDERED.matches.length);
    expect(new Set(drawn.map((d) => d.fixture)))
      .toEqual(new Set(REORDERED.matches.map((m) => m.fixture_id)));
    // and the live ones are a PREFIX of the drawn order
    const liveFlags = drawn.map((d) => d.live);
    expect(liveFlags).toEqual([...liveFlags].sort(
      (a, b) => Number(b) - Number(a)));
    // DERIVED FROM THE PAYLOAD, never a number typed here
    const expected = REORDERED.matches.filter((m) => m.state.in_play);
    expect(drawn.filter((d) => d.live).map((d) => d.fixture))
      .toEqual(expected.map((m) => m.fixture_id));
  });

test("the two groups partition the declared set — nothing is filtered "
   + "and nothing is counted twice", async ({ page }) => {
    await open(page, REORDERED);
    // Wait for the strip to have DECIDED. `evaluateAll` on an empty
    // locator returns [] and would make every count below vacuously
    // agree with zero.
    await expect(strip(page)).toBeVisible();
    await expect(page.getByTestId("watched-group").first()).toBeVisible();
    const groups = await page.getByTestId("watched-group")
      .evaluateAll((els) => els.map((e) => ({
        group: e.getAttribute("data-group"),
        count: Number(e.getAttribute("data-count")),
      })));
    const total = groups.reduce((n, g) => n + g.count, 0);
    expect(total).toBe(REORDERED.matches.length);
    const live = groups.find((g) => g.group === "in_play");
    expect(live?.count).toBe(
      REORDERED.matches.filter((m) => m.state.in_play).length);
    // the in-play heading is the FIRST of the two in the DOM
    expect(groups[0].group).toBe("in_play");
  });

test("an in-play match is marked in real text, and the mark cites the "
   + "value it was derived from", async ({ page }) => {
    await open(page, STRIP);
    for (const m of STRIP.matches) {
      const card = match(page, m.fixture_id);
      const mark = card.getByTestId("watched-in-play");
      if (m.state.in_play) {
        await expect(mark).toBeVisible();
        // THE WORD IS DERIVED FROM THE VALUE BESIDE IT: `in_play` is
        // `match_state == "in"` upstream, so the mark carries the raw
        // match_state it was computed from and a reader can check one
        // against the other.
        await expect(mark).toHaveAttribute(
          "data-match-state", m.state.match_state ?? "absent");
        // real text in the accessible tree, never a title= attribute
        await expect(mark).toContainText("in play");
        await expect(card).toHaveAttribute("data-in-play", "true");
      } else {
        await expect(mark).toHaveCount(0);
        await expect(card).toHaveAttribute("data-in-play", "false");
      }
    }
    // and the mark carries NOTHING on a title
    expect(await strip(page).locator("[title]").count()).toBe(0);
  });

test("a payload whose in_play disagrees with the match_state it is "
   + "computed from says so, and is still drawn", async ({ page }) => {
    // in_play IS match_state == "in" upstream and is computed from
    // nothing else, so these two cannot disagree on a payload from that
    // emitter. If one ever arrives, the surface may not smooth it over —
    // and it may not drop the fixture either.
    const bent = {
      ...STRIP,
      // THE REGISTRY RIDES ON THE PAYLOAD, and the surface reads it from
      // there. api/main.py publishes `in_play_states` off watchlist's
      // PHASE_OF_STARTED_STATE — it replaced its own `== "in"` with that
      // lookup, so a second started state can join the class in ONE
      // place. A string typed into this file would go on passing while
      // the surface lit a false contradiction on every half-time card.
      in_play_not_declared: { in_play_states: ["in"] },
      matches: STRIP.matches.map((m) => m.fixture_id !== 101 ? m : {
        ...m, state: { ...m.state, match_state: "post" },
      }),
    };
    await open(page, bent);
    const card = match(page, 101);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-in-play", "true");
    await expect(card.getByTestId("watched-in-play"))
      .toHaveAttribute("data-derived", "disagrees");
    await expect(card.getByTestId("watched-in-play-disagrees"))
      .toContainText("post");
    // every other card is unaffected — one bent row is not a reason to
    // annotate the rest
    await expect(page.getByTestId("watched-in-play-disagrees"))
      .toHaveCount(1);
  });

// ------------------------------------ a match may never drop off silently

test("a monitored fixture whose read REFUSES is still drawn, with the "
   + "refusal in its own words", async ({ page }) => {
    // The read is the block most likely to be missing on a live match,
    // and a surface that hid the match when the read failed would lose
    // exactly the fixture Son is asking never to lose.
    const readless = {
      ...STRIP,
      matches: STRIP.matches.map((m) => m.fixture_id !== 202 ? m : {
        ...m,
        read: { version: "live-read-v1", sides: {},
          words: "the live read for this fixture FAILED (relation "
            + "\"live_read\" does not exist), so nothing was read — this "
            + "is not a match in which nothing has happened" },
      }),
    };
    await open(page, readless);
    const card = match(page, 202);
    await expect(card).toBeVisible();
    // still in the in-play group, still first
    await expect(card).toHaveAttribute("data-in-play", "true");
    await expect(card.getByTestId("watched-read-absent"))
      .toContainText("this is not a match in which nothing has happened");
    // and the rest of the set is untouched
    await expect(page.getByTestId("watched-match"))
      .toHaveCount(STRIP.matches.length);
  });

test("a declared fixture the route could not describe is drawn by id "
   + "rather than dropped", async ({ page }) => {
    // api/main.py registers this hole itself
    // (WATCHED_STRIP_OPEN["no_identity_row"]): a monitored fixture with
    // no `fixture` row gets no entry in `matches`, because WatchedMatch
    // needs competition_slug / home / away and the plane holds them
    // nowhere else. The backend's own record says an operator watching
    // the strip alone would not see it. This is the half that closes.
    const undescribed = {
      ...EMPTY,
      monitored_not_described: [{
        fixture_id: 777,
        policy_code: "unknown_fixture",
        refused: "unknown_fixture: this fixture id is not one this live "
          + "plane holds a row for",
        registered: {
          finding: "a monitored fixture whose `fixture` row is not there "
            + "gets no entry in `matches`",
          closes_when: "the strip gains a recorded shape for a declared "
            + "match with no identity row",
        },
      }],
    };
    await open(page, undescribed);
    // it renders even though NOTHING else is on this payload — a
    // declared match missing from the strip is the defect the stage was
    // reported for
    await expect(strip(page)).toBeVisible();
    const row = page.getByTestId("watched-undescribed-row");
    await expect(row).toHaveAttribute("data-fixture", "777");
    await expect(row).toContainText("unknown_fixture");
    await expect(row).toContainText("Closes when:");
    // THE TWO VOCABULARIES STAY DISJOINT: this is a POLICY code about
    // the monitored set, and it is never counted with the refusals.
    await expect(page.getByTestId("watched-undescribed"))
      .toContainText("policy unknown_fixture");
    await expect(page.getByTestId("watched-refusal")).toHaveCount(0);
  });

test("when the newest poll fails, the stale banner says WHY, not just "
   + "that it did", async ({ page }) => {
    // A refused credential and a dead backend leave the same stale
    // figures on the page and are not the same problem.
    let served = 0;
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
    await page.route(`**${STRIP_URL}**`, (r) =>
      served++ === 0 ? r.fulfill(json(STRIP))
        : r.fulfill(json({ detail: "operator credentials required" }, 403)));
    await page.goto("/bet-suggester");
    await expect(strip(page)).toBeVisible();
    const why = page.getByTestId("watched-stale-why");
    await expect(why).toBeVisible({ timeout: 25_000 });
    await expect(why).toContainText("403");
    await expect(why).toContainText("operator credentials required");
    // and the figures are still there
    await expect(match(page, 101).getByTestId("watched-pnl"))
      .toContainText("$31.84");
  });

test("the refused section takes no role=status — the board's skeleton "
   + "count is not this section's to change", async ({ page }) => {
    // A REGRESSION THIS ROUND ACTUALLY CAUSED, kept as a guard. The
    // picker board draws one role="status" skeleton PER LEAGUE while it
    // loads and e2e/restructure.spec.ts asserts `toHaveCount(4)` on
    // them. The refusal notice first shipped with role="status" on it,
    // so the moment this section started rendering at all — which is the
    // whole point of this round — a guard in another file went red for a
    // reason that had nothing to do with the board. The notice is a live
    // region by `aria-live` instead: same announcement, no borrowed
    // role.
    await openSettled(page, { detail: "operator credentials required" }, 403);
    await expect(gate(page)).toBeVisible();
    expect(await strip(page).getByRole("status").count()).toBe(0);
    // and it is STILL announced — dropping the role must not have
    // dropped the announcement
    await expect(gate(page)).toHaveAttribute("aria-live", "polite");
  });

test("a state the payload's own registry does not call in play is NOT "
   + "flagged as a contradiction — the class is read, never guessed",
  async ({ page }) => {
    // THE OTHER DIRECTION OF THE SAME RULE, and the one a hand-listed
    // "in" would fail. The backend's in-play class comes from
    // watchlist.PHASE_OF_STARTED_STATE, so a SECOND started state can
    // join it without a line changing here. A surface that tested
    // `match_state !== "in"` would light a false contradiction on every
    // card carrying that new state.
    const twoStates = {
      ...STRIP,
      in_play_not_declared: { in_play_states: ["in", "ht"] },
      matches: STRIP.matches.map((m) => m.fixture_id !== 101 ? m : {
        ...m, state: { ...m.state, match_state: "ht" },
      }),
    };
    await open(page, twoStates);
    const card = match(page, 101);
    await expect(card.getByTestId("watched-in-play")).toBeVisible();
    await expect(card.getByTestId("watched-in-play"))
      .toHaveAttribute("data-derived", "agrees");
    await expect(page.getByTestId("watched-in-play-disagrees"))
      .toHaveCount(0);
  });

test("with no in-play registry on the payload, the surface makes NO "
   + "claim about the class", async ({ page }) => {
    // The recorded STRIP publishes no `in_play_states`. Absent evidence
    // is not evidence of agreement OR of contradiction, so nothing is
    // asserted either way — and the fixture is still drawn and still
    // marked off its own flag.
    const bent = {
      ...STRIP,
      matches: STRIP.matches.map((m) => m.fixture_id !== 101 ? m : {
        ...m, state: { ...m.state, match_state: "post" },
      }),
    };
    await open(page, bent);
    await expect(match(page, 101).getByTestId("watched-in-play"))
      .toBeVisible();
    await expect(page.getByTestId("watched-in-play-disagrees"))
      .toHaveCount(0);
  });

// ---------------------------- the envelope's registered holes

test("the three envelope sets are disjoint — a registered hole cannot be "
   + "closed without retiring its record", async () => {
    // THE PATTERN THIS ROUND ASKED FOR, both directions. A key that
    // starts being drawn lands in CONSUMED; if its record is left
    // standing in UNRENDERED_ENVELOPE_KEYS the prose outlives the hole,
    // which is the failure the whole registry exists to prevent.
    const sets: [string, string[]][] = [
      ["consumed", [...CONSUMED_ENVELOPE_KEYS]],
      ["bookkeeping", [...BOOKKEEPING_ENVELOPE_KEYS]],
      ["registered", Object.keys(UNRENDERED_ENVELOPE_KEYS)],
    ];
    for (const [an, a] of sets) {
      for (const [bn, b] of sets) {
        if (an >= bn) continue;
        const both = a.filter((k) => b.includes(k));
        expect(both, `${an} and ${bn} both claim ${both.join(", ")}`)
          .toEqual([]);
      }
    }
    // AND EVERY RECORD CARRIES ITS CLOSING CONDITION. A hole written
    // down without one is prose, not a record.
    for (const [k, v] of Object.entries(UNRENDERED_ENVELOPE_KEYS)) {
      expect(v.finding.length, `${k} has no finding`).toBeGreaterThan(40);
      expect(v.closes_when.length, `${k} has no closes_when`)
        .toBeGreaterThan(40);
    }
  });

test("an envelope key no set accounts for is NAMED on the surface",
  async ({ page }) => {
    // A NEW HOLE MUST FAIL LOUDLY. The backend gained a whole new
    // envelope block while this surface was being written; the next one
    // announces itself instead of vanishing.
    await open(page, { ...STRIP, some_new_block: { note: "unrecorded" } });
    const un = page.getByTestId("watched-envelope-unaccounted");
    await expect(un).toBeVisible();
    await expect(un).toHaveAttribute("data-keys", "some_new_block");
    await expect(un).toContainText("no record of it at all");
  });

test("a registered envelope hole that ARRIVES is named with the "
   + "condition that closes it, and is still not drawn",
  async ({ page }) => {
    // `in_play_not_declared` is the block the backend owner was adding
    // to this very route while this surface was being built: matches the
    // tape says are under way that nobody declared. It has no recorded
    // shape here, so it is written down rather than drawn against a
    // shape nobody emitted.
    await open(page, {
      ...STRIP,
      in_play_not_declared: {
        matches: [{ fixture_id: 8888 }], counts: { in_play: 1 },
        in_play_states: ["in"],
      },
    });
    const reg = page.getByTestId("watched-envelope-registered");
    await expect(reg).toBeVisible();
    await expect(reg).toContainText("in_play_not_declared");
    await expect(reg).toContainText("Closes when:");
    // NAMING IS NOT RENDERING: no match block is drawn for a fixture
    // that arrived inside a shape this surface has never been shown.
    await expect(match(page, 8888)).toHaveCount(0);
    await expect(page.getByTestId("watched-match"))
      .toHaveCount(STRIP.matches.length);
    // and nothing unaccounted-for rode in with it
    await expect(page.getByTestId("watched-envelope-unaccounted"))
      .toHaveCount(0);
  });

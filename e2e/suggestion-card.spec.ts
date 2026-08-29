import { expect, test } from "@playwright/test";

// The per-fixture SUGGESTION CARD (card-v1). Hermetic: every request is
// a recorded payload (the card is derived from the real
// /api/mls-2026/card/87 response — a settled fixture, so a full REFUSAL
// rendering), no backend involved.
//
// What is pinned here:
//  1. the board's per-fixture view reaches the card panel;
//  2. a REFUSED headline renders its reason text verbatim — refusals
//     are first-class content, never hidden;
//  3. style notes carry the measured non-predictive label, and the λ
//     number carries its display-only label, both verbatim;
//  4. a card fetch failure names its HTTP status — never a blank panel,
//     never invented content;
//  5. the LIVE BROADCAST: while the payload carries
//     layers.inplay_plan.live_now the card shows the minute, the score
//     and all three probabilities, re-fetches itself on the interval,
//     and holds the last good numbers (marked stale) when a refresh
//     fails. A live_now refusal renders the collector's own sentence
//     verbatim with no numbers behind it, and a payload WITHOUT
//     live_now — every pre and post card — renders no live block at
//     all.
//  6. the LIVE STATE readout under that bar: possession, shots, on
//     target, corners, cards, threat and the exploratory tilt label
//     render what the tape carries — and a stat the tape does NOT
//     carry renders "—", never 0. A real 0 still prints as 0; the two
//     are different facts and this suite pins the difference. A
//     live_now with no state renders the block exactly as before.

const EVENT = "999999";

const MATCH_PAYLOAD = {
  match: {
    id: EVENT, date: "2026-08-19T23:30Z", state: "post",
    detail: "FT", venue: "Test Park",
    home: { name: "Columbus Crew", abbrev: "CLB", score: "0" },
    away: { name: "CF Montréal", abbrev: "MTL", score: "0" },
    stats: [], events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: null, books: [], model: null, lineups: null,
  generated_at: new Date().toISOString(),
};

// --- the ENTRY COST block (backend src/live/card.py _execution) ------
//
// What entering costs by each of the two routes: crossing the spread as
// a taker, or resting at the bid as a maker at a QUARTER of the fee.
// Recorded verbatim from the backend — every string here is the one
// src/live/execution_view.py emits, not a paraphrase, because these are
// the sentences the render is asserted to carry.
//
// Three legs on purpose, one per render path this file has to cover:
//   home  fully priced — both routes and the difference;
//   draw  a ONE-SIDED book. No bid, so the resting route and the
//         comparison refuse while crossing stays priced;
//   away  a spread too wide for the bid to be the same trade, which
//         refuses the comparison rather than reporting a "saving" that
//         is almost entirely spread.
const EXECUTION = {
  "clip_contracts": 100,
  "clip_basis": "EVERY FIGURE BELOW IS FOR THIS CLIP AND NO OTHER. Kalshi rounds the fee UP once per ORDER, so cost per contract is a function of order size and a saving quoted without a size is not a number. The clip is config.EXECUTION_VIEW_CLIP_CONTRACTS, defaulting to the paper policy's own target_contracts so a cost read here and a cost read off the paper ledger are the same clip. It is a reference size for arithmetic — not a suggested stake, and nothing on this card sizes anything.",
  "scope": "WHAT ENTERING COSTS, not whether to enter. Two routes into the same position priced side by side at a stated clip: crossing the spread as a taker, and resting at the bid as a maker at a quarter of the fee. Nothing here places an order, sizes one, or recommends one — this repo has no order path — and the arithmetic is emitted with the two conditions that qualify it attached, never on its own.",
  "book_basis": "BOTH SIDES OFF ONE QUOTE ROW. The execution figures read the ask AND the bid from the SAME newest MarketQuote per leg (the `_quote_book` projection of the same approved regular_time mapping the ask column above is derived from), preferring the provider's exact dollar string over the derived integer cents (V9 eval F7, position.py's reader reused). One capture, one clock, two sides — a spread assembled from two different captures is not a spread, and a saving computed from one would be an artefact of the gap between them. Sub-penny prices therefore make these figures differ in the third decimal from the whole-cent asks above; that is the cent column rounding, not two books.",
  "fill_risk": "A RESTING ORDER IS NOT A CHEAPER POSITION UNTIL IT FILLS. The difference here is between two prices you might pay, and it becomes real only if the bid you joined gets hit. If it is not hit you hold nothing — not a cheaper position, no position — and the move you were pricing can happen without you, which costs nothing in fees and can cost the entire trade. A resting bid also fills preferentially when someone is willing to sell it to you, so the fills you get are not a random sample of the fills you wanted. None of that is measured here: this feed carries no fill data, so the probability of filling is not in any number on this block and cannot be read off it.",
  "not_an_edge": "PAYING LESS TO ENTER IS NOT INFORMATION ABOUT THE OUTCOME. This block compares the cost of two routes into the SAME position. It moves no probability, it makes no outcome more likely, and a cheaper entry does not make a losing position win. It claims no ledger row: the rest-versus-cross figure this surface exists for is filed in research_archive/TEST-LEDGER.md as an ADJACENT MEASUREMENT, listed there beside the fee constant precisely so nobody mistakes it for one of the edge tests — thirteen of which are dead.",
  "break_even_basis": "The break-even is this route's ALL-IN cost per contract — the model probability at which entering by it is EV-zero. It is CLIP-SPECIFIC because the fee rounds up once per order, so it moves with the size above it. The market block's own `break_even_fee_inclusive` is the size-free per-contract taker number from src/execution.py and will differ in the last digits; the two are not in conflict and neither is the other rounded.",
  "effective_rate_basis": "`effective_rate` is what this clip ACTUALLY pays: the rounded per-order fee divided by C·p·(1−p). `rounding_multiple` is that over the headline rate, and it is 1 exactly when the raw fee already lands on a centicent. It rises as the clip shrinks because the round-up is charged once per ORDER — which is the regime a small bankroll trades in by construction. Quoted as a computed number rather than a remembered one so it can never disagree with the fee beside it.",
  "rounding_granularity": "ROUNDING GRANULARITY IS AN OPEN QUESTION, and it is worth up to 2.3x on a small clip. Both fees here round UP once per order to the CENTICENT ($0.0001), which is this repo's implemented policy (paper.FEE_POLICY, V9.1 eval F3). The archived venue capture (research_archive/rn1/venue_fee_params.json) states the form as ceil to the next CENT, which is 100x coarser and is where the 'small clips pay up to 2.3x the headline rate' figure comes from: at p=0.50 one maker contract costs 0.4375c raw, 0.44c rounded to the centicent, 1.00c rounded to the cent. The effective rate quoted beside every figure here is computed under the CENTICENT, so if the venue rounds to the cent these costs are understated on small clips and correct at size. Unresolved on purpose — settling it by choosing the convenient reading is the error, and the fix is a fill receipt at a small clip, not an argument.",
  "fee_helpers": "src.live.paper.order_fee_dollars (taker) and maker_fee_dollars (maker): Decimal, ceil to the centicent, computed ONCE on the whole order. src/execution.py's fee() is an unrounded float per-contract TAKER helper used by the gates; it is deliberately not used for any money figure here.",
  "routes": {
    "cross": "CROSS — a TAKER order that lifts the ask and fills now, at 0.07·p·(1−p) per contract rounded up once on the order.",
    "rest": "REST — a MAKER order that joins the best bid and waits, at 0.0175·p·(1−p) per contract, a quarter of the taker rate, rounded up once on the order. This prices JOINING the bid. Improving on it costs more per contract and is a different figure, not quoted here."
  },
  "outcomes": {
    "home": {
      "clip_contracts": "100",
      "book": {
        "ask": "0.45",
        "bid": "0.43",
        "spread_cents": "2.00"
      },
      "cross": {
        "price": "0.45",
        "contracts": "100",
        "gross_dollars": "45.0000",
        "fee_dollars": "1.7325",
        "all_in_dollars": "46.7325",
        "all_in_cents": 4673,
        "fee_cents": 173,
        "fee_cents_per_contract": "1.7325",
        "break_even": "0.467325",
        "headline_rate": "0.07",
        "effective_rate": "0.070000",
        "rounding_multiple": "1.0000"
      },
      "rest": {
        "price": "0.43",
        "contracts": "100",
        "gross_dollars": "43.0000",
        "fee_dollars": "0.4290",
        "all_in_dollars": "43.4290",
        "all_in_cents": 4343,
        "fee_cents": 43,
        "fee_cents_per_contract": "0.4290",
        "break_even": "0.434290",
        "headline_rate": "0.0175",
        "effective_rate": "0.017503",
        "rounding_multiple": "1.0002"
      },
      "difference": {
        "direction": "CROSSING COSTS MORE",
        "dollars": "3.3035",
        "cents": 330,
        "per_contract_dollars": "0.033035",
        "per_contract_cents": "3.3035",
        "of_which_fee_dollars": "1.3035",
        "of_which_spread_dollars": "2.0000",
        "says": "At 100 contracts, crossing at $0.45 costs $46.7325 all-in and resting at $0.43 costs $43.4290 all-in, a difference of $3.3035 ($1.3035 of it fee, $2.0000 of it spread) — IF the resting order fills, which is the whole condition and is not a number on this block."
      }
    },
    "draw": {
      "clip_contracts": "100",
      "book": {
        "ask": "0.30",
        "bid": null,
        "spread_cents": null
      },
      "cross": {
        "price": "0.30",
        "contracts": "100",
        "gross_dollars": "30.0000",
        "fee_dollars": "1.4700",
        "all_in_dollars": "31.4700",
        "all_in_cents": 3147,
        "fee_cents": 147,
        "fee_cents_per_contract": "1.4700",
        "break_even": "0.314700",
        "headline_rate": "0.07",
        "effective_rate": "0.070000",
        "rounding_multiple": "1.0000"
      },
      "rest": {
        "refused": "NO BID. The book is one-sided: an ask of $0.30 and nothing resting on the buy side to join. There is no resting price to quote, so what resting would cost is unknown rather than cheap, and the ask is never substituted for it. Crossing is priced above; the comparison is not."
      },
      "difference": {
        "refused": "NO BID. The book is one-sided: an ask of $0.30 and nothing resting on the buy side to join. There is no resting price to quote, so what resting would cost is unknown rather than cheap, and the ask is never substituted for it. Crossing is priced above; the comparison is not."
      }
    },
    "away": {
      "clip_contracts": "100",
      "book": {
        "ask": "0.60",
        "bid": "0.40",
        "spread_cents": "20.00"
      },
      "cross": {
        "price": "0.60",
        "contracts": "100",
        "gross_dollars": "60.0000",
        "fee_dollars": "1.6800",
        "all_in_dollars": "61.6800",
        "all_in_cents": 6168,
        "fee_cents": 168,
        "fee_cents_per_contract": "1.6800",
        "break_even": "0.616800",
        "headline_rate": "0.07",
        "effective_rate": "0.070000",
        "rounding_multiple": "1.0000"
      },
      "rest": {
        "refused": "SPREAD 20.00c IS WIDER THAN 8c, so resting at the bid is not the same trade as crossing at the ask. The two prices are far enough apart that a fill at $0.40 happens because the market moved to you, not because you saved a fee — the difference would be mostly spread and would read as a saving. 8c is EXEC_POLICY's max_spread_c, the widest book the paper policy treats as one price; measured median spreads on these series are 1-2c. Named rather than quoted."
      },
      "difference": {
        "refused": "SPREAD 20.00c IS WIDER THAN 8c, so resting at the bid is not the same trade as crossing at the ask. The two prices are far enough apart that a fill at $0.40 happens because the market moved to you, not because you saved a fee — the difference would be mostly spread and would read as a saving. 8c is EXEC_POLICY's max_spread_c, the widest book the paper policy treats as one price; measured median spreads on these series are 1-2c. Named rather than quoted."
      }
    }
  }
};

// Derived from the real GET /api/mls-2026/card/87 (trimmed, structure
// and every load-bearing sentence intact).
const CARD_PAYLOAD = {
  generated_at: "2026-08-21T01:19:15.837047+00:00",
  content_hash:
    "579542986a681a479d9fab35a95d3da9dccf43e45d7e2ee1f3049267281a036f",
  emission: "duplicate (already journaled)",
  prediction_run_id: "ce8944f6-f587-49a1-bd17-552eb1b02713",
  card: {
    card_version: "card-v1",
    competition: "mls-2026",
    fixture_id: 87,
    headline: {
      value: "REFUSED",
      reason: "edge -0.5288 on home_win below the fee floor +0.03 "
        + "(paper exec policy) — priced, and not worth the fee",
    },
    layers: {
      identity: {
        home: "Columbus Crew", away: "CF Montréal",
        kickoff_utc: "2026-08-19T23:30:00+00:00", venue: "Test Park",
        venue_class: "UNAVAILABLE (venue-class read not built on the "
          + "live plane yet — on the pre-pick reading list)",
        status: "post", espn_event_id: EVENT,
      },
      market: {
        source: "latest stored GAME-family ask book "
          + "(live_watch._game_books)",
        asks: { away: 1.0, home: 1.0, draw: 1.0 },
        devig: { away: 0.3333, home: 0.3333, draw: 0.3333 },
        break_even_fee_inclusive: { away: 1.0, home: 1.0, draw: 1.0 },
        fee_basis: "taker 0.07·p·(1−p) per contract (src/execution) "
          + "for the break-evens above; the maker rate is a QUARTER of "
          + "it, 0.0175·p·(1−p), and both round UP PER ORDER "
          + "(paper.MAKER_FEE_RATE, archived capture). What each route "
          + "costs at a stated clip is priced in `execution` below, "
          + "with the effective rate each actually pays",
        execution: EXECUTION,
      },
      pick: {
        model_outcomes: { home_win: 0.4712, draw: 0.2558,
          away_win: 0.273 },
        run_id: "ce8944f6-f587-49a1-bd17-552eb1b02713",
        run_type: "t10", canonical_t10_lock: true,
        captured_at: "2026-08-19T23:19:59.124578+00:00",
        lead: { outcome: "home_win", p: 0.4712 },
        gate: {
          ask: 1.0, all_in_cost: 1.0, edge_fee_inclusive: -0.5288,
          fee_floor: 0.03, verdict: "REFUSED",
          reason: "edge -0.5288 on home_win below the fee floor +0.03 "
            + "(paper exec policy) — priced, and not worth the fee",
        },
      },
      ftts: {
        backtest: "λ-ratio proxy LOSES to the constant even-cell "
          + "baseline (ftts-backtest-v1) — base rates are the standing "
          + "pick, λ is display-only",
        band: "even_lt75",
        band_basis: "de-vigged favourite 0.333 < 0.6 — price-native "
          + "even, the artifact's |elo_diff|<75 cell",
        base_rates: { n: 6226, home_first_pct: 47.4,
          away_first_pct: 44.8, no_goal_pct: 7.8 },
        standing_pick: "home_first",
        lambda_ratio: {
          p_home_first_lambda: 0.5977,
          basis: "simulator expected goals frozen on the run "
            + "(λh/(λh+λa), the backtest's proxy shape)",
          label: "unproven vs constant baseline (ftts-backtest-v1) — "
            + "display only, nothing prices off this number",
        },
      },
      splits: {
        source: "team-splits-v1 (window: last two seasons; raw "
          + "percentages with n and Wilson bands, no shrinkage)",
        home: {
          team: "Columbus Crew", n_total: 55,
          conditions: {
            home: { n: 27, w: 14, d: 7, l: 6, w_pct: 51.9, d_pct: 25.9,
              l_pct: 22.2, wdl: "52/26/22", wilson95_w: [34.0, 69.3],
              wilson95_d: [13.2, 44.7], wilson95_l: [10.6, 40.8] },
            away: { n: 28, w: 6, d: 10, l: 12, w_pct: 21.4, d_pct: 35.7,
              l_pct: 42.9, wdl: "21/36/43", wilson95_w: [10.2, 39.5],
              wilson95_d: [20.7, 54.2], wilson95_l: [26.5, 60.9] },
            favourite: { n: 44, w: 19, d: 13, l: 12, w_pct: 43.2,
              d_pct: 29.5, l_pct: 27.3, wdl: "43/30/27",
              wilson95_w: [29.7, 57.8], wilson95_d: [18.2, 44.2],
              wilson95_l: [16.3, 41.8] },
            underdog: { n: 11, w: 1, d: 4, l: 6, w_pct: 9.1,
              d_pct: 36.4, l_pct: 54.5, wdl: "9/36/55",
              wilson95_w: [1.6, 37.7], wilson95_d: [15.2, 64.6],
              wilson95_l: [28.0, 78.7] },
          },
          unrated: { n: 0, note: "fixtures with no corpus Elo row; in "
            + "home/away above, absent from fav/dog" },
        },
        away: {
          refused: "no splits row under 'CF Montréal' in team-splits-v1 "
            + "— identity mismatch or outside the two-season window, "
            + "and this card never fuzzy-matches a club name "
            + "(AGENTS.md §6)",
        },
      },
      precedents: {
        band: "0-75",
        band_basis: "price-native gap band from the de-vigged book "
          + "(fav 0.333; even<0.6, fav<0.65, heavy>=0.65)",
        cells: [
          { role: "scoreless_fav_decay_70",
            refused: "not a heavy favourite (de-vigged fav 0.333 < "
              + "0.65) — the decay grid is measured only at gap>=150" },
          { role: "comeback_dog_opener", grid: "comeback_by_strength",
            variant: "clean_11v11",
            source_cell: "comeback_by_strength/bands/0-75/dog_opener",
            n: 1199,
            equalized: { p: 57.5, n: 1199, wilson_low: 54.7,
              wilson_high: 60.3 },
            overturned: { p: 20.6, n: 1199, wilson_low: 18.4,
              wilson_high: 23.0 },
            definition: "opener at or before 30': P(equalized "
              + "eventually) and P(overturned at FT), by opener side "
              + "and gap band",
            examples: [
              { home: "FC Dallas", away: "Toronto FC",
                date: "2026-02-22", score: "3-2", source: "mls-2026" },
              { home: "Austin", away: "Minnesota United FC",
                date: "2026-02-22", score: "2-2", source: "mls-2026" },
            ] },
          { role: "late_opener", grid: "late_opener",
            variant: "clean_11v11", source_cell: "late_opener/0-75",
            n: 339,
            wdl: { fav_win: 81.4, draw: 16.8, dog_win: 1.8 },
            wilson_low: { fav_win: 76.9, draw: 13.2, dog_win: 0.8 },
            wilson_high: { fav_win: 85.2, draw: 21.2, dog_win: 3.8 },
            definition: "no goal before 61' and the favourite scores "
              + "first: W/D/L at FT by gap band",
            examples: [
              { home: "FC Cincinnati", away: "Atlanta United FC",
                date: "2026-02-21", score: "2-0", source: "mls-2026" },
            ] },
        ],
      },
      style_notes: {
        label: "context — measured non-predictive to date (styles-v1 "
          + "predictive_status: unproven-display-only)",
        axes: ["opening_intensity", "first_leader_rate", "chase",
          "front_runner_kill", "late_game", "overturn"],
        home: {
          team: "Columbus Crew", matches: 55,
          axes: {
            chase: { league_mean: 0.4235849056603774, n: 39,
              raw: 0.5384615384615384, reason: null, refused: false,
              shrunk: 0.5279433359246782 },
            first_leader_rate: { league_mean: 0.4703337453646477, n: 55,
              raw: 0.5272727272727272, reason: null, refused: false,
              shrunk: 0.5216721716752112 },
          },
        },
        away: {
          refused: "no style row under 'CF Montréal' in styles-v1 — "
            + "identity mismatch, never fuzzy-matched",
        },
      },
      inplay_plan: {
        danger_windows: {
          equalizer_hazard_peak: {
            bin: "75-90", p: 22.0, n: 4764, wilson_low: 20.8,
            wilson_high: 23.2,
            meaning: "P(a one-goal lead is equalized within 15') peaks "
              + "at 22.0% in the 75-90' window — leads never get safer "
              + "per-minute",
          },
          late_opener: { role: "late_opener_danger", grid: "late_opener",
            variant: "clean_11v11", source_cell: "late_opener/0-75",
            n: 339, wdl: { fav_win: 81.4, draw: 16.8, dog_win: 1.8 },
            wilson_low: { fav_win: 76.9, draw: 13.2, dog_win: 0.8 },
            wilson_high: { fav_win: 85.2, draw: 21.2, dog_win: 3.8 },
            definition: "no goal before 61' and the favourite scores "
              + "first: W/D/L at FT by gap band",
            examples: [] },
        },
        red_card_rule: "a red card VOIDS every grid number on this card "
          + "from first sighting — all priors were measured on 11-v-11 "
          + "play (clean_11v11), and the runtime gate refuses from the "
          + "first dismissal (src/live/patterns.py)",
        cash_out_ladder: "NOT YET SHIPPED — no exit policy is quoted; "
          + "placeholder kept so the absence stays on the template",
      },
      evidence: {
        artifacts: {
          grids: { artifact: "inplay-lookup-grids", version: "grids-v1",
            built: "2026-08-20" },
          team_splits: { artifact: "team-splits", version: "1.0.0",
            built: "2026-08-20" },
          styles: { artifact: "team-temporal-style-profiles",
            version: "styles-v1", built: "2026-08-20T00:00:00+00:00" },
          ftts_backtest: { artifact: "ftts-backtest-v1",
            version: "ftts-backtest-v1",
            built: "2026-08-20T00:00:00+00:00" },
        },
        card_version: "card-v1",
        content_hash_basis: "sha256 over the sorted-key card payload "
          + "(this object included, hash excluded); stored on the "
          + "CardEmission row",
      },
    },
  },
};

// --- the live block (backend src/live/card.py _live_now) -------------
//
// Present ONLY while the fixture is in play. Both shapes below are the
// backend's own: the live triple, and a refusal carrying the
// collector's sentence (here live_watch.NO_LOCK, verbatim).
const LIVE_NOW = {
  minute: "63'",
  captured_at: "2026-08-21T19:53:02.114820+00:00",
  score: "1-0",
  p: { home: 0.6412, draw: 0.2411, away: 0.1177 },
  lambdas: { home: 1.4321, away: 1.0212 },
  basis: "inplay-wire-v1 | anchor: canonical T-10 lock ce8944f6 "
    + "de-vigged 3-way | calibration exact | state minute 63 score 1-0",
};

const LIVE_NOW_LATER = {
  minute: "78'",
  captured_at: "2026-08-21T20:08:04.551190+00:00",
  score: "2-1",
  p: { home: 0.5109, draw: 0.2203, away: 0.2688 },
  lambdas: { home: 1.4321, away: 1.0212 },
  basis: "inplay-wire-v1 | anchor: canonical T-10 lock ce8944f6 "
    + "de-vigged 3-way | calibration exact | state minute 78 score 2-1",
};

const LIVE_REFUSAL = "no canonical T-10 lock with a complete frozen "
  + "3-way book — the engine anchors on the belief the lock froze at "
  + "T-10 and will not invent a kickoff belief after kickoff, so NO "
  + "NUMBER is written";

const LIVE_NOW_REFUSED = {
  minute: "45'", captured_at: "2026-08-21T19:35:11.902341+00:00",
  score: "0-0", refused: LIVE_REFUSAL,
};

// --- the state sub-block (live_now.state) ----------------------------
//
// FULL: every field the backend can attach. Note red.home is null while
// red.away is 1 — one side observed, the other not, on the same row.
//
// `tilt_label` is an OBJECT — `{label, note}` — because card.py `_tilt`
// has no branch that returns a string. This block used to carry
// `tilt_label: "SIEGE"` with a `tilt_note` sibling, a shape the backend
// never sends, and the suite was green while every real in-play card
// crashed the page (React #31). Corrected 2026-08-21 to the bytes the
// backend actually emits.
//
// `threat` was the SAME MISTAKE one field over, and it survived that
// correction: it sat here as the bare number `0.72` until 2026-08-24,
// while card.py `_live_state` has emitted `{tilt, fav, basis}` since
// the block shipped. The frontend typed it as a number to match this
// invented payload, so the suite stayed green and every real in-play
// card printed an em-dash beside its SIEGE chip. Both shapes below are
// now RECORDED — generated by calling `_live_state` on the backend at
// 4ad8420 (the revision prod reports) with these very counts, not
// typed out by hand.
const TILT_NOTE = "the favourite has the ball AND the chances (threat "
  + ">= 0.65 with favourite possession >= 60). EXPLORATORY — NOT "
  + "VALIDATED: the threat>=0.65 / possession>=60 splits are the "
  + "2026-08-19 mini-backfill's ad hoc thresholds, chosen by eye off a "
  + "handful of matches with no preregistration, no holdout and no "
  + "measured edge attached. The label describes this row; it "
  + "forecasts nothing.";

const THREAT_BASIS = "the favourite's share of shots + on-target + "
  + "corners (src/live/patterns.py threat_tilt — the pattern library's "
  + "own definition, called here rather than restated, so the card and "
  + "the triggers can never disagree). Favourite side is price-native: "
  + "the de-vigged GAME book, same convention as the bands.";

// 0.7568 is not a decorative number: it is (14+5+9) / (14+5+9+6+1+2),
// the favourite's share of the very counts recorded above it. A tilt
// that did not come off the numbers printed beside it would let this
// payload pin a rendering the backend could never produce (AGENTS.md
// §3, and the reason `threat` carries `fav` at all — a share belongs
// to a side).
const LIVE_STATE = {
  possession: { home: 61.4, away: 38.6 },
  shots: { home: 14, away: 6 },
  on_target: { home: 5, away: 1 },
  corners: { home: 9, away: 2 },
  cards: { yellow: { home: 1, away: 3 }, red: { home: null, away: 1 } },
  threat: { tilt: 0.7568, fav: "home", basis: THREAT_BASIS },
  tilt_label: { label: "SIEGE", note: TILT_NOTE },
};

// The tilt REFUSED, which is what a thin tape produces — and what the
// backend sent on every card whose row lacked shots/on-target/corners.
const TILT_REFUSAL = "no threat tilt, so no tilt label — see threat";

// GAPS: the case the readout exists for. possession is present but
// unknown on both sides; shots knows the home count (which is ZERO —
// a reading, not an absence) and not the away one; on_target is null
// outright; corners knows both, one of them a real 0; threat carries
// the collector's refusal instead of an index; no cards key at all.
//
// The refusal is card.py `_live_state`'s own, VERBATIM for exactly the
// gaps below — shots missing away, on-target missing outright — and it
// ends with the same THREAT_BASIS definition the success shape carries.
// The sentence that stood here before was invented ("no shot-location
// feed on this row"), and the backend has no such branch: nothing on
// this plane refuses for want of shot LOCATIONS, because the tilt is
// computed from counts.
const THREAT_REFUSAL = "the tape omits shots, on-target for one or "
  + "both sides; the tilt needs shots, on-target and corners for both "
  + "and missing is never zero. " + THREAT_BASIS;

const LIVE_STATE_GAPS = {
  possession: { home: null, away: null },
  shots: { home: 0, away: null },
  on_target: null,
  corners: { home: 3, away: 0 },
  threat: { refused: THREAT_REFUSAL },
  tilt_label: null,
};

function withState(live: Record<string, unknown>, state: unknown) {
  return { ...live, state };
}

function withHeadline(headline: unknown) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.headline = headline;
  return c;
}

function withLiveNow(live: unknown) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.layers.inplay_plan.live_now = live;
  return c;
}

// --- the ladder: exposure, the tick age, the position ----------------
//
// Every payload below is the backend's own bytes, taken from
// GET /api/admin/mls-2026/card/1 against a seeded 1-0 lead at 71'
// (trimmed; every load-bearing sentence intact).
//
// EXPOSURE rides on the PUBLIC card — it is a property of the MATCH,
// not of a holding, so a reader with no position still sees it.
// POSITIONS rides BESIDE `card` and only on the operator route, because
// size and position value are staking and the public card takes no
// credential. That split is what these tests pin.

const HONESTY = "A LEAD NEVER GETS SAFER PER MINUTE, AND THERE IS NO "
  + "SAFE WINDOW. grids-v1's equalizer hazard rises from its first "
  + "quotable bin to its 75-90 peak, which is also its maximum — no "
  + "minute of this grid reads as a lead being out of danger, and no "
  + "window in it is risk-free. The artifact's own checks block "
  + "(equalizer_hazard_never_falls) records the ONE interior fall, into "
  + "60-75, and publishes it rather than shipping the claim silently. "
  + "The figure beside this sentence is P(the lead survives the window) "
  + "with its Wilson band and its n — a measured frequency with an "
  + "interval on it, never a reassurance.";

const NOT_A_PLAN = "A MEASURED FREQUENCY, NOT A PLAN. grids-v1 counted "
  + "how often a one-goal lead standing at the start of this minute bin "
  + "had been equalized by the end of it, across the states corpus. It "
  + "describes what happened in those matches; it prescribes nothing, "
  + "prices nothing, and names no moment to do anything.";

const FT_REFUSAL = "comeback_by_strength conditions on an opener at or "
  + "before 30' and this state cannot establish one: the score is 1-0 "
  + "at 71'. The cell is not quoted rather than quoted against a "
  + "conditioning state that may not hold.";

const EXPOSURE = {
  applies: true, subject: "match", minute: 71, score: "1-0",
  lead_held_by: "home",
  next_15: {
    grid: "equalizer_hazard", variant: "clean_11v11",
    source_cell: "equalizer_hazard/60-75",
    n: 4992, p: 17.7, wilson_low: 16.7, wilson_high: 18.8,
    definition: "P(equalize within the next 15' | one-goal lead at the "
      + "bin's START minute); window (m, m+15] in recorded minutes",
  },
  survives: {
    p: 82.3, wilson_low: 81.2, wilson_high: 83.3, units: "percent",
    meaning: "P(the lead is still a lead at the end of this measured "
      + "15-minute window) — the complement of the equalizer cell "
      + "beside it, band reflected",
  },
  cell_window: {
    bin: "60-75", start_minute: 60, end_minute: 75, read_at_minute: 71,
    offset_from_cell_start: 11,
    note: "grids-v1 measures the lead AT THE BIN'S START minute (60') "
      + "over the window (60, 75] in recorded minutes. This read is "
      + "taken at 71', so the cell is the nearest measured conditioning "
      + "state and not a per-minute hazard; the 11-minute offset is "
      + "stated rather than interpolated away.",
  },
  to_full_time: { refused: FT_REFUSAL },
  band_note: "the 15-minute cell above is BAND-FREE: grids-v1's "
    + "equalizer_hazard pools every one-goal lead regardless of the "
    + "sides' strength, so no gap band enters it and none is invented "
    + "for it.",
  variant: "clean_11v11",
  honesty: HONESTY, not_a_plan: NOT_A_PLAN,
};

const RED_CARD_EXPOSURE_REFUSAL = "a dismissal has been seen — every "
  + "grid-derived number on this match refuses. A red card VOIDS every "
  + "grid-derived number from first sighting: the priors were measured "
  + "on eleven-a-side play (clean_11v11) and no ten-man adjustment has "
  + "been measured (grids-v1 red_card_rule, src/live/patterns.py).";

const EXPOSURE_RED_CARD = {
  applies: false, subject: "match",
  refused: RED_CARD_EXPOSURE_REFUSAL,
  honesty: HONESTY, not_a_plan: NOT_A_PLAN,
};

const LIVE_TICK = {
  captured_at: "2026-08-21T19:53:02.114820+00:00",
  age_seconds: 47.0, interval_seconds: 120,
  basis: "HOW OLD THE ARITHMETIC IS. Every live number on this card "
    + "was computed by the collector at the tick that wrote the state "
    + "row.",
};

const LATE_TICK_NOTE = "this state is 402s old against a 120s collector "
  + "interval — at least one tick has not landed, and every live number "
  + "on this card is that old";

const LIVE_TICK_LATE = { ...LIVE_TICK, age_seconds: 402.0,
                         note: LATE_TICK_NOTE };

const NOT_A_SIGNAL = "NO VALIDATED EDGE. This module prices a position "
  + "that is already on: it is fair value against a price, not a "
  + "signal, and no in-play entry edge has been measured on this "
  + "platform. Nothing in this payload is a recommendation and nothing "
  + "in it is an instruction.";

const ENTRY_IS_SUNK = "The entry price is carried for the record and is "
  + "NOT an input to the comparison. Settlement pays $1.00 a contract "
  + "and the exit pays the bid, whatever was paid to get on.";

const HELD_DEFINITION = "HELD means: a journal entry on this fixture "
  + "that resolved to `taken`, names one of the three GAME legs, is the "
  + "head of its correction chain, carries no settlement, and has not "
  + "been closed early.";

const HOLD_VS_EXIT_SAYS = "the live bid pays 5.5c per contract LESS "
  + "than holding is worth at the current read (220.9c across the "
  + "40-contract position)";

function heldPosition(over: Record<string, unknown> = {}) {
  return {
    journal_entry: {
      bet_id: 1, market_ticker: "KXMLSGAME-x-H",
      outcome_key: "home_win", stated_price_dollars: "0.62",
      stated_size: "40", price_basis: "observed_quote",
      executions: { rows: 0, note: "no execution row on this entry" },
    },
    position: {
      outcome_key: "home_win", side: "home", size: "40",
      entry_price: 0.62, entry_cost_dollars: "24.80",
      entry_note: ENTRY_IS_SUNK,
    },
    fair_now: { p: 0.72, source: "live_stat_snapshot#1.p_home" },
    value_now_cents: 2659.07,
    value_at_settlement_cents: 2880.0,
    hold_vs_exit: {
      difference_cents: -220.93,
      difference_cents_per_contract: -5.5232,
      direction: "LESS", says: HOLD_VS_EXIT_SAYS,
      certainty_vs_mean: "This compares a CERTAIN amount against a "
        + "MEAN. The exit figure is what the book pays now; the "
        + "settlement figure is an expected value at the current read.",
      not_a_recommendation: "Which way the arithmetic points is not "
        + "what to do. This states the difference between two figures; "
        + "the operator decides what to do about it.",
    },
    no_bid: null, thin_bid: null, stale_quote: null,
    exposure: EXPOSURE,
    red_card_void: { void: false, witness: null },
    policy: { not_a_signal: NOT_A_SIGNAL },
    ...over,
  };
}

const NO_BID_FINDING = "NO BID. The book is one-sided: an ask of $0.71 "
  + "and nothing resting on the buy side. This position CANNOT BE "
  + "EXITED at any price at this tick — that is the finding, not a "
  + "missing number, and the ask is never substituted for it "
  + "(src/execution.py sell_proceeds).";

const NO_BID_POSITION = heldPosition({
  value_now_cents: null,
  no_bid: { finding: NO_BID_FINDING, ask: 0.71,
    common_case: "A thin or absent bid is THE COMMON CASE in play." },
  hold_vs_exit: { refused: "there is no executable bid, so there is "
    + "nothing to compare holding against. See no_bid." },
});

const RED_CARD_RULE_TEXT = "A red card VOIDS every grid-derived number "
  + "from first sighting: the priors were measured on eleven-a-side "
  + "play (clean_11v11) and no ten-man adjustment has been measured.";

const RED_CARD_POSITION = heldPosition({
  exposure: EXPOSURE_RED_CARD,
  red_card_void: {
    void: true,
    witness: ["the collector's persisted refusal on this row "
      + "(inplay_basis names a dismissal)"],
    rule: RED_CARD_RULE_TEXT,
    survives: "the price arithmetic (bid, fee, exit value) is "
      + "unaffected and is still computed; every grid-derived number "
      + "refuses",
  },
});

function positionsBlock(held: unknown[], over: Record<string, unknown> = {}) {
  return { held, definition: HELD_DEFINITION,
           competition_scope: "mls-2026", ...over };
}

/** A live card: live_now + the PUBLIC exposure block + the tick age,
 *  plus the operator-only `positions` sibling when one is supplied.
 *  `exposure: null` drops the block entirely, which is what a card for
 *  a fixture that is not in play looks like. */
function withLadder(opts: {
  live?: unknown; exposure?: unknown; tick?: unknown;
  positions?: unknown;
} = {}) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.layers.inplay_plan.live_now =
    opts.live ?? withState(LIVE_NOW, LIVE_STATE);
  if (opts.exposure !== null) {
    c.card.layers.inplay_plan.exposure = opts.exposure ?? EXPOSURE;
  }
  c.live_tick = opts.tick ?? LIVE_TICK;
  if (opts.positions !== undefined) c.positions = opts.positions;
  return c;
}

type Pg = import("@playwright/test").Page;

async function serveMatch(page: Pg) {
  await page.route(`**/api/mls/match/${EVENT}`, (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(MATCH_PAYLOAD) }));
}

async function serveCard(page: Pg, body: unknown = CARD_PAYLOAD,
                         status = 200) {
  await page.route(`**/api/card/mls-2026/${EVENT}`, (r) =>
    r.fulfill({ status, contentType: "application/json",
                body: JSON.stringify(body) }));
}

async function serveBoard(page: Pg) {
  await page.route("**/api/mls/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: [{
                  id: EVENT, date: "2026-08-19T23:30Z", state: "pre",
                  detail: "Scheduled", venue: "Test Park",
                  home: { name: "Columbus Crew", abbrev: "CLB" },
                  away: { name: "CF Montréal", abbrev: "MTL" },
                }] }) }));
  for (const [path, body] of [
    ["**/api/mls/standings", { conferences: [] }],
    ["**/api/mls/schedule**", { fixtures: [] }],
    ["**/api/mls/markets", { games: [] }],
    ["**/api/mls/odds", { odds: [] }],
  ] as const) {
    await page.route(path, (r) =>
      r.fulfill({ status: 200, contentType: "application/json",
                  body: JSON.stringify(body) }));
  }
}

test.describe("suggestion card (recorded payloads)", () => {
  test("the board's per-fixture view reaches the card panel",
    async ({ page }) => {
      await serveBoard(page);
      await serveMatch(page);
      await serveCard(page);
      await page.goto("/bet-suggester?league=mls");
      await page.getByText("Columbus Crew").first().click();
      await expect(page).toHaveURL(new RegExp(`/bet-suggester/mls/${EVENT}`));
      await expect(page.getByText(/suggestion card/i).first())
        .toBeVisible();
      // headline first and dominant: the word REFUSED is on screen
      await expect(page.getByText("REFUSED").first()).toBeVisible();
    });

  test("a REFUSED headline renders its reason verbatim, and refused "
    + "blocks stay visible", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the one number that orders action — here the word and its reason
      await expect(page.getByText(/below the fee floor \+0\.03/).first())
        .toBeVisible();
      // a refused block renders its words, never disappears
      await expect(
        page.getByText(/no splits row under 'CF Montréal'/).first())
        .toBeVisible();
      await expect(
        page.getByText(/never fuzzy-matched/).first()).toBeVisible();
      // the in-play plan carries the red-card void sentence and the
      // unshipped cash-out ladder as-is
      await expect(
        page.getByText(/a red card VOIDS every grid number/i).first())
        .toBeVisible();
      await expect(page.getByText(/NOT YET SHIPPED/).first())
        .toBeVisible();
      // decision safety: shadow framing on the panel, never a bare TAKE
      await expect(page.getByText(/shadow · not advice/i).first())
        .toBeVisible();
      await expect(page.getByText(/^TAKE$/)).toHaveCount(0);
    });

  test("style notes carry the measured non-predictive label and λ its "
    + "display-only label", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(
        page.getByText(/measured non-predictive to date/i).first())
        .toBeVisible();
      await expect(
        page.getByText(/display only, nothing prices off this number/i)
          .first()).toBeVisible();
      // base rates are the standing pick — visible with their n
      await expect(page.getByText(/standing pick/i).first())
        .toBeVisible();
    });

  test("a card fetch failure names its HTTP status — never a blank "
    + "panel, never invented content", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, { error: "card unavailable" }, 503);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByText(/card unavailable/i).first())
        .toBeVisible();
      await expect(page.getByText(/http 503/i).first()).toBeVisible();
      // no invented card content behind the failure
      await expect(page.getByText("REFUSED")).toHaveCount(0);
      await expect(page.getByText(/fee floor/)).toHaveCount(0);
    });

  test("a card WITH live_now broadcasts the minute, the score and all "
    + "three probabilities, first in the in-play section",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      // the state on the tape
      await expect(live).toContainText("63'");
      await expect(live).toContainText("1-0");
      // all three outcomes, exact, beneath their own bar segment
      await expect(live).toContainText("64.1%");
      await expect(live).toContainText("24.1%");
      await expect(live).toContainText("11.8%");
      // three segments, one per outcome, sized by the probabilities
      const widths = await live.locator("div.rounded-full > div")
        .evaluateAll((els) => els.map(
          (e) => Math.round(parseFloat((e as HTMLElement).style.width)
                            * 100) / 100));
      expect(widths).toEqual([64.12, 24.11, 11.77]);
      // where the number comes from, and when it was captured
      await expect(live).toContainText(/frozen T-10 lock/);
      await expect(live).toContainText("2026-08-21T19:53:02.114820+00:00");
      await expect(live).toContainText(/updated \d\d:\d\d:\d\dZ/);
      // decision safety travels with the live numbers
      await expect(live).toContainText(/shadow · not advice/);
      // FIRST in the in-play section — the readout, not a footnote
      expect(await live.evaluate(
        (el) => el.parentElement?.firstElementChild === el)).toBe(true);
    });

  test("a live_now refusal renders the collector's words verbatim, with "
    + "no numbers behind it", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW_REFUSED));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      await expect(live).toContainText(LIVE_REFUSAL);
      // the state it refused at is still shown
      await expect(live).toContainText("45'");
      await expect(live).toContainText("0-0");
      // never a zero bar reading as a real forecast (AGENTS.md §2)
      await expect(live.locator("div.rounded-full > div")).toHaveCount(0);
      expect(await live.innerText()).not.toContain("%");
    });

  test("a card WITHOUT live_now renders no live block at all — pre and "
    + "post cards are untouched", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);          // the recorded settled-fixture card
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the in-play section is there, exactly as it always rendered
      await expect(
        page.getByText(/a red card VOIDS every grid number/i).first())
        .toBeVisible();
      await expect(page.getByTestId("live-now")).toHaveCount(0);
      await expect(page.getByText(/live now/i)).toHaveCount(0);
      await expect(page.getByText(/frozen T-10 lock/i)).toHaveCount(0);
      await expect(page.getByText(/updated \d\d:\d\d:\d\dZ/))
        .toHaveCount(0);
    });

  test("live_now.state renders the tape's own counts — possession as a "
    + "share, shots / on target / corners / cards as pairs, and the "
    + "tilt label with its note", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(withState(LIVE_NOW, LIVE_STATE)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      const st = page.getByTestId("live-state");
      await expect(st).toBeVisible();
      // observation, said in words — this is not model output
      await expect(st).toContainText(/observed on the tape, not modelled/);

      // possession: the two shares, and a bar drawn from the SAME pair
      const poss = page.getByTestId("live-stat-possession");
      await expect(poss.locator("span.text-accent")).toHaveText("61.4%");
      await expect(poss.locator("span.text-sky-400")).toHaveText("38.6%");
      const posWidths = await page.getByTestId("possession-bar")
        .locator("div").evaluateAll((els) => els.map(
          (e) => Math.round(parseFloat((e as HTMLElement).style.width)
                            * 10) / 10));
      expect(posWidths).toEqual([61.4, 38.6]);

      // the count pairs, home in the accent and away in the sky — the
      // same two colours the probability bar gives the same two teams
      for (const [id, h, a] of [
        ["shots", "14", "6"], ["on-target", "5", "1"],
        ["corners", "9", "2"], ["yellow", "1", "3"],
      ] as const) {
        const row = page.getByTestId(`live-stat-${id}`);
        await expect(row.locator("span.text-accent")).toHaveText(h);
        await expect(row.locator("span.text-sky-400")).toHaveText(a);
      }
      // one side observed, the other not, on the SAME row
      const red = page.getByTestId("live-stat-red");
      await expect(red.locator("span.text-accent")).toHaveText("\u2014");
      await expect(red.locator("span.text-sky-400")).toHaveText("1");

      await expect(page.getByTestId("live-stat-threat"))
        .toContainText("0.76");

      // the tilt chip, and its note ON SCREEN as well as in the title —
      // an unvalidated split whose caveat is hidden reads as settled
      const chip = page.getByTestId("tilt-chip");
      await expect(chip).toHaveText("SIEGE");
      expect(await chip.getAttribute("title")).toBe(TILT_NOTE);
      await expect(page.getByTestId("live-tilt"))
        .toContainText("EXPLORATORY — NOT VALIDATED");
      await expect(page.getByTestId("live-tilt"))
        .toContainText(/tilt · exploratory/);

      // and the block above it is untouched: minute, score, the triple
      await expect(live).toContainText("63'");
      await expect(live).toContainText("64.1%");
      await expect(page.getByTestId("live-prob-bar").locator("div"))
        .toHaveCount(3);
    });

  // THE EM-DASH BUG, pinned. A computed tilt reached the card as
  // `{tilt, fav, basis}` and the component asked whether it was a
  // number, so it printed — beside a confident SIEGE chip on every
  // real in-play fixture. The assertion that matters is the PAIRING:
  // the number and the label on screen together. A dash there is not a
  // cosmetic miss — a readout showing nothing next to a word like
  // SIEGE reads as broken, and a card that reads as broken gets
  // ignored, or gets its chip believed on its own.
  test("a computed tilt renders as its NUMBER beside its label, with "
    + "the side it is a share of and the definition reachable",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(withState(LIVE_NOW, LIVE_STATE)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);

      const threat = page.getByTestId("live-stat-threat");
      await expect(threat).toBeVisible();
      // the number itself, at the precision liveIndex prints an index
      await expect(threat).toContainText("0.76");
      // ...and NOT the dash it used to be. This is the whole bug.
      await expect(threat).not.toContainText("\u2014");
      // no refusal note stands where a real number exists
      await expect(threat.locator("p")).toHaveCount(0);

      // a share belongs to a side, and the side is on screen with it
      await expect(page.getByTestId("threat-fav")).toHaveText("home");

      // the definition is reachable rather than dropped — rendered
      // from the payload, never retyped in the component
      expect(await threat.getAttribute("title")).toBe(THREAT_BASIS);

      // the pairing: the number and the label sit in the same readout,
      // which is precisely what read as broken while one was a dash
      const state = page.getByTestId("live-state");
      await expect(state).toContainText("0.76");
      await expect(state.getByTestId("tilt-chip")).toHaveText("SIEGE");
    });

  // ...and the other half of the contract: a REFUSED threat still
  // renders the collector's words. `_live_state` emits one shape or the
  // other and never a bare index, so a fix that only handled the object
  // would be half a fix.
  test("a refused threat renders the collector's sentence, not a number "
    + "and not a blank", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page,
        withLiveNow(withState(LIVE_NOW, LIVE_STATE_GAPS)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);

      const threat = page.getByTestId("live-stat-threat");
      await expect(threat).toBeVisible();
      // the row keeps its label, so a reader can see WHICH read
      // declined rather than finding a gap where one used to be
      await expect(threat).toContainText("threat");
      // the refusal verbatim and whole, definition included — that
      // trailing sentence is how a reader knows what was not computed
      await expect(threat).toContainText(THREAT_REFUSAL);
      // no index is stood up beside the words, and no side either: a
      // share that was never computed belongs to nobody
      await expect(threat).not.toContainText("0.7");
      await expect(page.getByTestId("threat-fav")).toHaveCount(0);
    });

  test("a stat the tape does not carry renders \u2014, never 0 — and a "
    + "real 0 still renders 0", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page,
        withLiveNow(withState(LIVE_NOW, LIVE_STATE_GAPS)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("live-state")).toBeVisible();

      // possession unknown on both sides: dashes, no invented 50/50,
      // and NO BAR — a share cannot be drawn from numbers that are
      // not there
      const poss = page.getByTestId("live-stat-possession");
      await expect(poss.locator("span.text-accent")).toHaveText("\u2014");
      await expect(poss.locator("span.text-sky-400")).toHaveText("\u2014");
      await expect(poss).not.toContainText("0");
      await expect(page.getByTestId("possession-bar")).toHaveCount(0);

      // the distinction the block exists for, on two rows: shots knows
      // a real ZERO at home and knows NOTHING away...
      const shots = page.getByTestId("live-stat-shots");
      await expect(shots.locator("span.text-accent")).toHaveText("0");
      await expect(shots.locator("span.text-sky-400")).toHaveText("\u2014");
      // ...corners knows both, and its 0 is a reading that stays a 0
      const corners = page.getByTestId("live-stat-corners");
      await expect(corners.locator("span.text-accent")).toHaveText("3");
      await expect(corners.locator("span.text-sky-400")).toHaveText("0");

      // a null pair still says so rather than vanishing
      const ont = page.getByTestId("live-stat-on-target");
      await expect(ont.locator("span.text-accent")).toHaveText("\u2014");
      await expect(ont.locator("span.text-sky-400")).toHaveText("\u2014");

      // threat: the collector's refusal in its own words, no index
      await expect(page.getByTestId("live-stat-threat"))
        .toContainText(THREAT_REFUSAL);

      // absent keys render nothing at all — no phantom rows of zeroes
      await expect(page.getByTestId("live-stat-yellow")).toHaveCount(0);
      await expect(page.getByTestId("live-stat-red")).toHaveCount(0);
      await expect(page.getByTestId("live-tilt")).toHaveCount(0);
    });

  test("a live_now with NO state renders the block exactly as before — "
    + "no readout, no empty rows", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      // the block that shipped before the readout existed, intact
      await expect(live).toContainText("63'");
      await expect(live).toContainText("1-0");
      await expect(live).toContainText("64.1%");
      await expect(live).toContainText("24.1%");
      await expect(live).toContainText("11.8%");
      await expect(live).toContainText(/frozen T-10 lock/);
      await expect(page.getByTestId("live-prob-bar").locator("div"))
        .toHaveCount(3);
      // ...and nothing of the state readout in the DOM
      await expect(page.getByTestId("live-state")).toHaveCount(0);
      await expect(page.getByTestId("possession-bar")).toHaveCount(0);
      await expect(page.getByText(/observed on the tape/))
        .toHaveCount(0);
    });

  test("a REFUSED triple still shows the state the collector saw — the "
    + "refusal is about the number, not about the tape",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page,
        withLiveNow(withState(LIVE_NOW_REFUSED, LIVE_STATE)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toContainText(LIVE_REFUSAL);
      // no probability bar and no triple behind the refusal
      await expect(page.getByTestId("live-prob-bar")).toHaveCount(0);
      await expect(live).not.toContainText(/frozen T-10 lock/);
      // but the observed counts are still observations
      await expect(page.getByTestId("live-stat-shots"))
        .toContainText("14");
      await expect(page.getByTestId("live-state"))
        .toContainText(/observed on the tape, not modelled/);
    });

  test("while live_now is present the card re-fetches itself and "
    + "updates in place; a failed refresh holds the last good numbers "
    + "and marks them stale", async ({ page }) => {
      await page.clock.install();
      await serveMatch(page);
      let hit = 0;
      await page.route(`**/api/card/mls-2026/${EVENT}`, (r) => {
        hit += 1;
        if (hit >= 3) {
          return r.fulfill({ status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "card unavailable" }) });
        }
        return r.fulfill({ status: 200,
          contentType: "application/json",
          body: JSON.stringify(withLiveNow(
            hit === 1 ? LIVE_NOW : LIVE_NOW_LATER)) });
      });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toContainText("63'");
      await expect(live).toContainText("64.1%");

      // one 60s tick later the card has re-fetched and moved on
      await page.clock.fastForward("01:05");
      await expect(live).toContainText("78'");
      await expect(live).toContainText("2-1");
      await expect(live).toContainText("51.1%");

      // the next refresh fails: the numbers stay, marked stale — a live
      // card that blanked would read as "the match stopped"
      await page.clock.fastForward("01:05");
      await expect(live).toContainText(/stale/);
      await expect(live).toContainText("78'");
      await expect(live).toContainText("51.1%");
      await expect(page.getByText(/card unavailable/i)).toHaveCount(0);
    });
});

test.describe("the ladder: exposure, tick age, and the position", () => {
  // Son's product: for a match he holds a position in, a constantly
  // updating read of what the position is worth now, whether the live
  // bid beats holding to settlement, and how exposed the lead is.
  //
  // The four honesty constraints are asserted ON SCREEN here, not only
  // in the payload: no window reads as safe, no string instructs, the
  // fee arithmetic is the backend's exact figure rendered unchanged,
  // and the entry-side is labelled as no validated edge.

  test("a REFUSED tilt renders its words and the card survives — the "
    + "label is an object, not a string", async ({ page }) => {
      // REGRESSION, found by rendering the backend's real bytes rather
      // than a hand-written stand-in. card.py `_tilt` returns
      // `{label, note}` or `{refused}` and has NO string branch, so the
      // string-typed renderer threw React #31 and the whole card became
      // a client-side exception — on every in-play fixture, while this
      // suite stayed green against a shape nothing emits.
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await serveMatch(page);
      await serveCard(page, withLadder({
        live: withState(LIVE_NOW, {
          ...LIVE_STATE_GAPS,
          tilt_label: { refused: TILT_REFUSAL } }) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the card is ON SCREEN — this is the assertion that would have
      // caught it
      await expect(page.getByTestId("live-now")).toBeVisible();
      await expect(page.getByTestId("exposure")).toBeVisible();
      expect(errors).toEqual([]);
      // the refusal renders in the collector's own words, and no chip
      // is invented to stand in for a label that was declined
      await expect(page.getByTestId("live-tilt"))
        .toContainText(TILT_REFUSAL);
      await expect(page.getByTestId("tilt-chip")).toHaveCount(0);
    });

  test("a tilt that HAS a label renders the label and its note, and "
    + "throws nothing", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await serveMatch(page);
      await serveCard(page, withLadder());
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("tilt-chip")).toHaveText("SIEGE");
      await expect(page.getByTestId("live-tilt")).toContainText(TILT_NOTE);
      expect(errors).toEqual([]);
    });

  test("the exposure read renders for a fixture with NO position — it "
    + "is a property of the match", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder());   // no `positions` key at all
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const exp = page.getByTestId("exposure");
      await expect(exp).toBeVisible();
      // the state the cell conditions on
      await expect(exp).toContainText("home lead 1-0 at 71'");
      // P(equalized) WITH its band and its denominator
      await expect(page.getByTestId("exposure-equalized"))
        .toContainText("17.7%");
      await expect(page.getByTestId("exposure-equalized"))
        .toContainText("[16.7–18.8]");
      await expect(page.getByTestId("exposure-equalized"))
        .toContainText("n=4992");
      // and P(survives) as the reflected complement, also banded
      await expect(page.getByTestId("exposure-survives"))
        .toContainText("82.3%");
      await expect(page.getByTestId("exposure-survives"))
        .toContainText("[81.2–83.3]");
      // the operator-only block is absent from the DOM entirely
      await expect(page.getByTestId("positions")).toHaveCount(0);
      await expect(page.getByTestId("held-position")).toHaveCount(0);
    });

  test("the NO SAFE WINDOW line renders verbatim beside the numbers",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder());
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // verbatim, not paraphrased — this sentence is the constraint
      await expect(page.getByTestId("no-safe-window"))
        .toContainText(HONESTY);
      // and it is styled as a warning, never as a footnote the eye skips
      await expect(page.getByTestId("no-safe-window"))
        .toHaveClass(/text-warn/);
      // the measured-frequency label rides with it
      await expect(page.getByTestId("exposure")).toContainText(NOT_A_PLAN);
    });

  test("nothing on a live card tells the reader a lead is safe",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([heldPosition()]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // not vacuous: the position IS on screen before the scan runs
      await expect(page.getByTestId("held-position")).toBeVisible();
      const text = (await page.locator("#card").innerText()).toLowerCase();
      for (const claim of ["safe now", "risk-free window", "in the clear",
                           "out of the woods", "the lead is safe",
                           "danger has passed"]) {
        expect(text, claim).not.toContain(claim);
      }
      for (const order of ["cash out now", "sell now", "buy now",
                           "you should", "we recommend", "we advise",
                           "act now", "take profit"]) {
        expect(text, order).not.toContain(order);
      }
    });

  test("the refused to-full-time cell renders its words, never a blank",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder());
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("exposure")).toContainText(FT_REFUSAL);
      // the band-free fact is stated rather than a band being invented
      await expect(page.getByTestId("exposure"))
        .toContainText(/BAND-FREE/);
    });

  test("a position renders value now, value at settlement, and the "
    + "comparison in the backend's own words", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([heldPosition()]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const held = page.getByTestId("held-position");
      await expect(held).toBeVisible();
      // the position itself, named
      await expect(held).toContainText("40 × home");
      await expect(held).toContainText("journal #1");
      // 2659.07c and 2880.0c, rendered as dollars and NOT re-scaled
      await expect(page.getByTestId("value-now")).toContainText("$26.59");
      await expect(page.getByTestId("value-settlement"))
        .toContainText("$28.80");
      // the one comparison, verbatim, with its direction
      await expect(page.getByTestId("hold-vs-exit"))
        .toContainText(HOLD_VS_EXIT_SAYS);
      await expect(page.getByTestId("hold-vs-exit")).toContainText("LESS");
      // and the sentence that says the direction is not an instruction
      await expect(held).toContainText(/the operator decides what to do/);
      // constraint 4: in-play entry is not a validated edge
      await expect(page.getByTestId("not-a-signal"))
        .toContainText("NO VALIDATED EDGE");
      // the entry price is on the record AND labelled as not an input
      await expect(held).toContainText(ENTRY_IS_SUNK);
    });

  test("the exit figure is never painted as an opportunity — MORE and "
    + "LESS get no accent colour", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([heldPosition({
          hold_vs_exit: { direction: "MORE",
            says: "the live bid pays 7.2c per contract MORE than "
              + "holding is worth at the current read",
            not_a_recommendation: "Which way the arithmetic points is "
              + "not what to do." } })]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const line = page.getByTestId("hold-vs-exit");
      await expect(line).toContainText("MORE");
      // decision safety: the colour the eye reads as "take this" is
      // withheld from a number that orders no action
      await expect(line).not.toHaveClass(/text-accent/);
    });

  test("NO BID renders the finding verbatim and shows no exit value",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([NO_BID_POSITION]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("no-bid")).toContainText(NO_BID_FINDING);
      // a null value is a DASH, never a zero — 0¢ would read as "this
      // position is worthless", which is a different claim entirely
      await expect(page.getByTestId("value-now")).toContainText("—");
      await expect(page.getByTestId("value-now")).not.toContainText("$0.00");
      // the ask is never substituted for the missing bid
      await expect(page.getByTestId("value-now")).not.toContainText("$0.71");
      // the comparison refuses in its own words rather than vanishing
      await expect(page.getByTestId("held-position"))
        .toContainText(/no executable bid/);
      await expect(page.getByTestId("hold-vs-exit")).toHaveCount(0);
      // holding is still priced — that half is not affected
      await expect(page.getByTestId("value-settlement"))
        .toContainText("$28.80");
    });

  test("a THIN BID prices the clip and names the per-order round-up",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([heldPosition({
          thin_bid: {
            finding: "THIN BID: 3 contract(s) resting at the top of the "
              + "book against a position of 40. what is executable AT "
              + "THIS TICK is 3 contract(s) for 199.4c net.",
            top_of_book_size: "3", position_size: "40",
            clip_fee_warning: "the fee is charged per ORDER and rounded "
              + "UP to the centicent, so an exit dripped out in clips "
              + "pays that round-up once per clip",
          } })]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const thin = page.getByTestId("thin-bid");
      await expect(thin).toContainText("THIN BID: 3 contract(s)");
      await expect(thin).toContainText(/once per clip/);
    });

  test("a RED CARD voids the grid numbers on screen and leaves the "
    + "price arithmetic standing", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        exposure: EXPOSURE_RED_CARD,
        positions: positionsBlock([RED_CARD_POSITION]) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the public block refuses in the backend's words...
      await expect(page.getByTestId("exposure"))
        .toContainText(RED_CARD_EXPOSURE_REFUSAL);
      // ...and NO grid figure is left on screen to be misread
      await expect(page.getByTestId("exposure-equalized")).toHaveCount(0);
      await expect(page.getByTestId("exposure-survives")).toHaveCount(0);
      // the honesty line survives the refusal — it is not a garnish on
      // the success case
      await expect(page.getByTestId("no-safe-window"))
        .toContainText(HONESTY);
      // the rule is on the position too, with the half that survives
      await expect(page.getByTestId("red-card-void"))
        .toContainText(RED_CARD_RULE_TEXT);
      await expect(page.getByTestId("red-card-void"))
        .toContainText(/the price arithmetic .* is unaffected/);
      // and the price arithmetic really is still there
      await expect(page.getByTestId("value-now")).toContainText("$26.59");
    });

  test("nothing held renders the backend's named refusal, not an empty "
    + "panel", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({
        positions: positionsBlock([], {
          refused: "no journal entry on fixture 1 is still on. "
            + HELD_DEFINITION }) }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("positions"))
        .toContainText("no journal entry on fixture 1 is still on");
      await expect(page.getByTestId("positions"))
        .toContainText("HELD means");
      await expect(page.getByTestId("held-position")).toHaveCount(0);
    });

  test("the tick age says how old the STATE is and advances on its own",
    async ({ page }) => {
      await page.clock.install();
      await serveMatch(page);
      await serveCard(page, withLadder());
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const age = page.getByTestId("tick-age");
      await expect(age).toContainText("state captured 47s ago");
      // the collector's own interval, quoted — this file picks no cadence
      await expect(age).toContainText("collector interval 120s");
      // ten seconds later it says so, without a re-fetch
      await page.clock.fastForward("00:10");
      await expect(age).toContainText(/state captured 5[67]s ago/);
    });

  test("a state older than the collector interval says a tick was "
    + "missed", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLadder({ tick: LIVE_TICK_LATE }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const age = page.getByTestId("tick-age");
      await expect(age).toContainText("state captured 402s ago");
      await expect(age).toContainText("a tick has not landed");
      await expect(age).toHaveClass(/text-warn/);
    });

  test("a card with no live_tick renders no age claim at all",
    async ({ page }) => {
      await serveMatch(page);
      const c = withLadder();
      delete c.live_tick;
      await serveCard(page, c);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("tick-age")).toHaveCount(0);
      await expect(page.getByText(/state captured/)).toHaveCount(0);
    });

  test("a pre or post card carries neither block and renders neither",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);      // the recorded settled-fixture card
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("exposure")).toHaveCount(0);
      await expect(page.getByTestId("positions")).toHaveCount(0);
      await expect(page.getByTestId("tick-age")).toHaveCount(0);
      // and the in-play section is otherwise exactly as it was
      await expect(
        page.getByText(/a red card VOIDS every grid number/i).first())
        .toBeVisible();
      await expect(page.getByText(/cash-out ladder: NOT YET SHIPPED/))
        .toBeVisible();
    });
});

test.describe("the disagreement rail is visible, not just present", () => {
  // The rail exists because a LARGE model-market disagreement measured
  // WORSE (ledger row 8). A warned number painted in the accent colour
  // would read as "take this" — which is the exact inversion the rail
  // is there to prevent, so these tests guard the COLOUR as well as
  // the words.
  test("a warned headline shows its warning and drops the accent",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withHeadline({
        value: 0.0933,
        warning: "WARNING — a disagreement this large measured WORSE, not better: the read sat above the market on 17 of 18 real-money legs and lost the Brier head-to-head (ledger row 8). Not an invitation.",
        disagreement_tvd: 0.1766,
        ledger_row: 8,
        meaning: "fee-inclusive edge on away_win — non-lead outcome",
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const w = page.getByTestId("headline-warning");
      await expect(w).toBeVisible();
      await expect(w).toContainText("measured WORSE");
      await expect(w).toContainText("ledger row 8");
      await expect(w).toContainText("0.177");
      // the number is still shown — hiding it would hide information
      await expect(page.getByText("+0.0933")).toBeVisible();
      // ...but never in the accent colour
      const cls = await page.getByText("+0.0933").getAttribute("class");
      expect(cls).toContain("text-warn");
      expect(cls).not.toContain("text-accent");
    });

  test("an unwarned positive headline keeps the accent and shows no "
    + "warning block", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withHeadline({
        value: 0.0412,
        meaning: "fee-inclusive edge on home_win",
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("headline-warning")).toHaveCount(0);
      const cls = await page.getByText("+0.0412").getAttribute("class");
      expect(cls).toContain("text-accent");
    });
});

/* ---------- the ENTRY COST block ---------- */

// The card has always quoted a fee-inclusive break-even and never said
// what entering COSTS, or that there are two prices for it — on series
// where a maker pays a QUARTER of a taker's fee. What is pinned here:
//
//  1. both costs render per outcome, with the difference and the
//     effective rate each route actually pays;
//  2. the FILL-RISK sentence renders verbatim and is styled as the
//     warning it is — a resting order that does not fill is no
//     position, so a saving read without it is the wrong number;
//  3. the NOT-AN-EDGE sentence renders verbatim — paying less to enter
//     moves no probability and claims no ledger row;
//  4. nothing reads as an instruction. The direction is a comparison
//     between two dollar figures and gets no accent colour, exactly as
//     the position ladder's MORE and LESS do not;
//  5. every refusal renders its own words — a one-sided book, a spread
//     too wide to be one trade, and a settled book that can no longer
//     be entered at all;
//  6. a card payload with NO execution key renders exactly what it
//     rendered before the block existed.

function withExecution(execution: unknown) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.layers.market.execution = execution;
  return c;
}

test.describe("entry cost: what crossing costs and what resting costs",
  () => {
    test("both routes render per outcome with the difference and the "
      + "effective rate", async ({ page }) => {
        await serveMatch(page);
        await serveCard(page);
        await page.goto(`/bet-suggester/mls/${EVENT}`);

        const home = page.getByTestId("exec-home");
        await expect(home).toBeVisible();
        // crossing at 45c and resting at 43c, all-in, as the backend
        // computed them — this file does no money arithmetic
        await expect(home).toContainText("$46.7325");
        await expect(home).toContainText("$43.4290");
        // the fee each route pays, a quarter apart
        await expect(home).toContainText("$1.7325");
        await expect(home).toContainText("$0.4290");
        // THE EFFECTIVE RATE EACH ROUTE ACTUALLY PAYS AT THIS CLIP.
        // Crossing lands exactly on the headline 0.07; the maker fee
        // at 43c does not land on a centicent, so the round-up makes
        // this clip pay 0.017503 — 1.0002x the headline — and the
        // multiple renders beside it rather than being left implicit.
        // That number is the whole reason the block quotes a computed
        // rate instead of restating the constant.
        await expect(home).toContainText("0.070000");
        await expect(home).toContainText("0.017503");
        await expect(home).toContainText("1.0002× headline");
        // and the break-even each implies
        await expect(home).toContainText("0.467325");
        await expect(home).toContainText("0.434290");

        // the difference, split into its fee half and its spread half
        const diff = page.getByTestId("exec-diff-home");
        await expect(diff).toContainText("CROSSING COSTS MORE");
        await expect(diff).toContainText("$3.3035");
        await expect(diff).toContainText("$1.3035 fee");
        await expect(diff).toContainText("$2.0000 spread");
        await expect(diff).toContainText("3.3035¢/contract");

        // the clip is on screen: a saving quoted without a size is not
        // a number, and this one is quoted at 100 contracts
        await expect(page.getByText(/at 100 contracts/i).first())
          .toBeVisible();
      });

    test("the fill-risk sentence renders verbatim and reads as a "
      + "warning, not a footnote", async ({ page }) => {
        await serveMatch(page);
        await serveCard(page);
        await page.goto(`/bet-suggester/mls/${EVENT}`);
        const fr = page.getByTestId("fill-risk");
        await expect(fr).toBeVisible();
        await expect(fr).toContainText(
          "A RESTING ORDER IS NOT A CHEAPER POSITION UNTIL IT FILLS");
        await expect(fr).toContainText("you hold nothing");
        await expect(fr).toContainText("no fill data");
        // styled as the warning it is, like the no-safe-window line
        expect(await fr.getAttribute("class")).toContain("text-warn");
        // and the saving carries the condition inside its own sentence
        await expect(page.getByTestId("exec-diff-home"))
          .toContainText("IF the resting order fills");
      });

    test("the not-an-edge sentence renders verbatim", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const ne = page.getByTestId("not-an-edge");
      await expect(ne).toContainText(
        "PAYING LESS TO ENTER IS NOT INFORMATION ABOUT THE OUTCOME");
      await expect(ne).toContainText("moves no probability");
      await expect(ne).toContainText("claims no ledger row");
    });

    test("nothing in the block reads as an instruction", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the comparison gets no accent colour — MORE and LESS are
      // statements about two dollar figures, never a recommendation
      const cls = await page.getByTestId("exec-diff-home")
        .getAttribute("class");
      expect(cls).not.toContain("text-accent");
      // decision safety still holds over the new block
      await expect(page.getByText(/^TAKE$/)).toHaveCount(0);
      await expect(page.getByText(/shadow · not advice/i).first())
        .toBeVisible();
      const block = await page.getByTestId("execution").innerText();
      for (const word of ["you should", "we recommend", "rest this order",
                          "cross now", "best route"]) {
        expect(block.toLowerCase()).not.toContain(word);
      }
    });

    test("a one-sided book refuses the resting route in its own words "
      + "and still prices crossing", async ({ page }) => {
        await serveMatch(page);
        await serveCard(page);
        await page.goto(`/bet-suggester/mls/${EVENT}`);
        // asserted on the REST CELL ITSELF, not on the row: the same
        // sentence also reaches the difference note, so a row-level
        // assertion stays green while this cell renders a dash
        const rest = page.getByTestId("exec-draw-rest");
        await expect(rest).toContainText("NO BID");
        await expect(rest).toContainText("The book is one-sided");
        await expect(rest).toContainText("never substituted for it");
        const draw = page.getByTestId("exec-draw");
        // crossing IS knowable on that leg and is not withheld
        await expect(draw).toContainText("$31.4700");
        // no comparison is drawn against a price that is not there
        await expect(page.getByTestId("exec-diff-draw")).toHaveCount(0);
        // ...and the one reason is stated ONCE. The backend gives the
        // leg and the comparison the same sentence; printing it twice
        // in a row buries what it is trying to say.
        expect((await draw.innerText()).split("NO BID").length - 1)
          .toBe(1);
      });

    test("a spread too wide to be one trade refuses the comparison "
      + "rather than reporting a saving", async ({ page }) => {
        await serveMatch(page);
        await serveCard(page);
        await page.goto(`/bet-suggester/mls/${EVENT}`);
        const awayRest = page.getByTestId("exec-away-rest");
        await expect(awayRest).toContainText(
          "SPREAD 20.00c IS WIDER THAN 8c");
        await expect(awayRest).toContainText("not the same trade");
        const away = page.getByTestId("exec-away");
        await expect(away).toContainText("would read as a saving");
        await expect(page.getByTestId("exec-diff-away")).toHaveCount(0);
      });

    test("a settled book refuses the whole block in words",
      async ({ page }) => {
        await serveMatch(page);
        await serveCard(page, withExecution({
          refused: "NO EXECUTION COST IS QUOTED FOR A SETTLED BOOK. "
            + "Post-settlement the asks are pinned at payout, so there "
            + "is no trade to enter and no spread to cross or rest "
            + "inside — a cost quoted here would be the price of a "
            + "trade that cannot be made, which is worse than no "
            + "number at all.",
        }));
        await page.goto(`/bet-suggester/mls/${EVENT}`);
        await expect(page.getByTestId("execution-refused"))
          .toContainText("NO EXECUTION COST IS QUOTED FOR A SETTLED BOOK");
        await expect(page.getByTestId("execution-refused"))
          .toContainText("cannot be made");
        // no cost figure survives the refusal
        await expect(page.getByTestId("exec-home")).toHaveCount(0);
        await expect(page.getByTestId("fill-risk")).toHaveCount(0);
      });

    test("a payload without the block renders exactly what it rendered "
      + "before the block existed", async ({ page }) => {
        await serveMatch(page);
        await serveCard(page, withExecution(undefined));
        await page.goto(`/bet-suggester/mls/${EVENT}`);
        await expect(page.getByTestId("execution")).toHaveCount(0);
        await expect(page.getByTestId("execution-refused")).toHaveCount(0);
        await expect(page.getByTestId("fill-risk")).toHaveCount(0);
        // the market block itself is untouched
        await expect(page.getByText(/latest stored GAME-family ask book/)
          .first()).toBeVisible();
      });
  });

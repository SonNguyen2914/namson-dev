import { TZ } from "../lib/matchday";
// Thin client for the Python backend, called through the Next.js proxy
// routes in pages/api/bet-suggester/ (keeps the backend URL server-side).

export interface MarketPrediction {
  market_id: string;
  market_title: string;
  outcome_key?: string | null;
  model_probability: number;
  kalshi_odds: number;
  implied_probability: number;
  edge: number;
  expected_value: number;
}

export interface HalfDist {
  home_win: number;
  draw: number;
  away_win: number;
  exp_goals: number;      // expected total goals in the half
  goal_pct: number;       // chance of at least one goal in the half
}

export interface PredictionSummary {
  full_time: { home_win: number; draw: number; away_win: number };
  advance: {
    home: number;
    away: number;
    p_reach_et: number;
    p_reach_pens: number | null;
    method: string;       // "simulated_et_pens" (knockout) | "half_draw_approx"
    // method-of-victory breakdown (the strategy engine's scenario atoms)
    home_win_et?: number; away_win_et?: number;
    home_win_pens?: number; away_win_pens?: number;
  } | null;
  halves: { first_half: HalfDist; second_half: HalfDist } | null;
}

export interface PredictionResponse {
  freshness: "cached" | "fresh" | "locked";
  match_id: string;
  generated_at: string;
  age_seconds: number;
  is_stale: boolean;
  is_final: boolean;
  source: string;
  confidence: number;
  xg: { home: number; away: number } | null;
  archive_note?: string;
  scorelines: { score: string; prob: number }[];
  summary?: PredictionSummary | null;
  markets: MarketPrediction[];
  inference_time_ms?: number;
}

export interface SuggestionRow {
  match_id: string;
  home: string;
  away: string;
  market_id: string;
  market_title: string;
  outcome_key: string | null;
  kickoff: string;
  kalshi_odds: number;
  model_probability: number;
  implied_probability: number;
  edge: number;
  expected_value: number;
  confidence: number;
  is_final: boolean;
}

export interface SuggestionsResponse {
  suggestions: SuggestionRow[];
  tier_used: number | null; // 49, 40, or null when the board is honestly empty
  generated_at: string;
}

export interface RefreshAllResponse {
  refreshed: string[];
  failed: string[];
  duration_ms: number;
  generated_at: string;
}

export interface LiveStateInput {
  current_home: number;
  current_away: number;
  minutes_elapsed: number;
  red_home: number;          // red-card COUNT (0-3)
  red_away: number;
  phase: string;             // auto | regulation | et | pens
  attack_home_mult: number;
  attack_away_mult: number;
}

export interface LiveMarketRow {
  market_id: string;
  market_title: string;
  outcome_key: string | null;
  // market columns are null on MODEL-ONLY rows (Kalshi closed/settled the
  // book in play; the live read still shows the model's number)
  kalshi_odds: number | null;
  market_probability: number | null;
  live_model_probability: number;
  difference: number | null;
  volume_24h: number;
  model_only?: boolean;
}

export interface LivePredictionResponse {
  match_id: string;
  teams: { home: string; away: string };
  stage: string;
  live_state: {
    score: string;
    minutes_elapsed: number;
    minutes_remaining: number;
    phase?: string;                     // regulation | et | pens
    red_home: number | boolean;        // count (legacy responses: boolean)
    red_away: number | boolean;
    lambda_remaining: { home: number; away: number };
  };
  live_outcomes: { home_win: number; draw: number; away_win: number };
  live_advance: {
    home: number; away: number;
    p_reach_et: number; p_reach_pens: number; method: string;
    home_win_et?: number; away_win_et?: number;
    home_win_pens?: number; away_win_pens?: number;
  } | null;
  live_confidence: number;
  user_attack_levers: { home: number; away: number };
  markets: LiveMarketRow[];
  generated_at: string;
  disclaimer: string;
}

export interface LiveAutoResponse {
  match_id: string;
  available: boolean;
  reason?: string;
  teams?: { home: string; away: string };
  live_state?: LivePredictionResponse["live_state"];
  live_outcomes?: { home_win: number; draw: number; away_win: number };
  live_advance?: LivePredictionResponse["live_advance"];
  markets?: LiveMarketRow[];
  levers?: {
    home: number; away: number;
    // openness: symmetric defence multipliers from total shot volume vs
    // the xG-implied expectation (>1 = open game, more goals both ways)
    def_home?: number; def_away?: number;
    // recent-pattern read from the play-by-play: who is attacking NOW
    momentum?: {
      recent_share_home: number;
      pressure_home: number; pressure_away: number;
      window_min: number; as_of_minute: number;
      mult_home: number; mult_away: number;
    } | null;
    source: string;
    basis?: {
      sot_home: number; sot_away: number;
      shots_home: number; shots_away: number;
      actual_share_home: number; expected_share_home: number;
      volume_actual?: number; volume_expected?: number;
      openness_raw?: number; openness?: number;
      minutes: number; weight: number; cap: number[];
      def_cap?: number[];
    } | null;
  };
  status_short?: string;
  stats_available?: boolean;
  // last few threat plays from the ESPN commentary, newest first
  recent_plays?: {
    minute: number; side: "home" | "away"; kind: string;
    weight: number; text: string;
  }[];
  generated_at?: string;
  disclaimer?: string;
}

export interface LiveStateFetch {
  available: boolean;
  match_id: string;
  current_home?: number;
  current_away?: number;
  minutes_elapsed?: number | null;
  red_home?: number | boolean;   // count (legacy: boolean)
  red_away?: number | boolean;
  status_short?: string;
  is_live?: boolean;
  is_finished?: boolean;
  reason?: string;
  budget: {
    calls_today: number; daily_cap: number;
    remaining: number; key_configured: boolean;
  };
}

export interface LiveScoreEntry {
  match_id: string;
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  minutes_elapsed: number | null;
  status_short: string;
  red_home: boolean;
  red_away: boolean;
  goals_list: {
    team: "home" | "away";
    player: string | null;
    minute: number | null;
    detail: string | null;
  }[];
  is_finished?: boolean;
}

export interface PastMatch {
  match_id: string;
  home: string;
  away: string;
  home_goals: number;
  away_goals: number;
  status_short: string;
  goals_list: {
    team: "home" | "away";
    player: string | null;
    minute: number | null;
    detail: string | null;
  }[];
  finished_at: string;
}

export interface PastMatchesResponse {
  past: PastMatch[];
  generated_at: string;
}

export interface LiveScoresResponse {
  live: LiveScoreEntry[];
  budget: { calls_today: number; daily_cap: number; remaining: number;
            key_configured: boolean };
  generated_at: string;
}

export interface UpcomingMatch {
  match_id: string;
  home: string;
  away: string;
  group: string;
  stage: string;
  venue: string;
  kickoff: string;
  seconds_to_kickoff: number;
  has_prediction: boolean;
  is_final: boolean;
  confidence: number | null;
  // bracket auto-resolution
  tbd: boolean;                 // a QF side is still a "X/Y winner" placeholder
  home_resolved: boolean;
  away_resolved: boolean;
  provisional_stats: string[];  // resolved teams running on default (unsourced) stats
}

export interface BracketMatch {
  match_id: string;
  home: string;
  home_resolved: boolean;
  away: string;
  away_resolved: boolean;
  fully_resolved: boolean;
  kickoff: string;
  venue: string;
  stage: string;
  forecast?: {
    home: { team: string; p: number } | null;
    away: { team: string; p: number } | null;
  } | null;
  probs: {
    home_win: number; draw: number; away_win: number;
    // win-market edges served with the bracket so the UI needs no extra calls
    home_edge?: number | null; away_edge?: number | null;
  } | null;
  result: {
    home_goals: number;
    away_goals: number;
    status_short: string;
    winner: "home" | "away" | null;
  } | null;
}

export interface BracketResponse {
  champion_forecast?: { team: string; p: number } | null;
  round_of_16?: BracketMatch[];
  quarterfinals: BracketMatch[];
  semifinals: BracketMatch[];
  third_place: BracketMatch[];
  final: BracketMatch[];
  champion: string | null;
}

export interface PlayerProp {
  player: string;
  shirt: number;
  share: number;        // smoothed share of team scoring (FIFA-PDF sourced)
  goals: number;
  attempts: number;
  matches: number;
  starts: number;
  anytime: number;      // P(scores at any point, 90 min)
  first_goal: number;   // P(scores the match's first goal)
  p2?: number;          // P(2+ goals this match)
  p3?: number;          // P(3+ goals this match)
  tournament_anytime?: number;  // P(scores in the remaining tournament)
  already_scored?: boolean;     // Kalshi tournament market settles Yes
  market_id?: string;   // Kalshi KXWCPLAYERGOALS ticker, when listed
  implied?: number;     // ask as probability
  bid?: number | null;
  tradeable?: boolean;  // false = dead book (huge spread) — never priced
  multiplier?: number | null;
  likelihood?: number;  // anchored (0.6 model + 0.4 market)
  edge?: number;
  squad?: "starter" | "bench" | "out";  // matchday fact, once lineups post
  first_goal_market?: {                 // Kalshi KXWCFIRSTGOAL, when listed
    market_id: string;
    implied: number;
    multiplier: number | null;
    likelihood?: number;                // anchored vs the first-goal race
    edge?: number;
  };
  // per-match Kalshi props (KXWCGOAL 1+/2+/3+ priced; KXWCAST display-only)
  match_goal_markets?: { n: number; market_id: string; implied: number;
                         multiplier: number | null; likelihood?: number;
                         edge?: number }[];
  assist_markets?: { n: number; market_id: string; implied: number;
                     multiplier: number | null }[];
}

export interface PlayerPropsResponse {
  available: boolean;
  match_id: string;
  home_team?: string;
  away_team?: string;
  home?: PlayerProp[];
  away?: PlayerProp[];
  p_no_goal?: number;
  disclaimer?: string;
  reason?: string;
}

export interface LineupPlayer {
  player: string;
  shirt?: string | null;
  pos?: string | null;
}

export interface LiveStatsResponse {
  match_id: string;
  home_team: string;
  away_team: string;
  available: boolean;
  rows: { key: string; label: string; home: string; away: string }[];
}

export interface TeamNewsResponse {
  match_id: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  venue: string;
  available: boolean;
  reason?: string;
  home?: { starters: LineupPlayer[]; bench: LineupPlayer[] };
  away?: { starters: LineupPlayer[]; bench: LineupPlayer[] };
}

export interface ResearchLockRow {
  market_id: string;
  market_title?: string | null;
  outcome_key?: string | null;
  model_probability: number;
  kalshi_odds?: number | null;
  implied_probability?: number | null;
  edge?: number | null;
  confidence?: number | null;
  locked_at?: string | null;
}

export interface ResearchClosingRow {
  market_id: string;
  title?: string | null;
  status?: string | null;
  result?: string | null;       // "yes" | "no" | "" while unsettled
  yes_bid?: string | null;
  yes_ask?: string | null;
  last_price?: string | number | null;
  volume?: number | null;
}

export interface ResearchResponse {
  match_id: string;
  home_team: string;
  away_team: string;
  result: {
    home_goals: number; away_goals: number; status_short: string;
    finished_at?: string | null;
    goals: { team: string; player?: string | null; minute?: number | null }[];
  } | null;
  final_lock: ResearchLockRow[];
  closing: ResearchClosingRow[];
  last_readings: { market_id: string; yes_price: number;
    model_probability?: number | null; edge?: number | null }[];
}

export interface ReferenceOddsRow {
  label: string;
  odd: number;          // median decimal odd across quoting bookmakers
  implied: number;      // 1/odd — includes the books' vig
  books: number;        // how many bookmakers quote this outcome
  model?: number;       // exact joins only (W/D/L, exact scorelines)
}

export interface ReferenceOddsResponse {
  match_id: string;
  source: string;
  home_team: string;
  away_team: string;
  available: boolean;
  reason?: string;
  bookmaker_count?: number;
  groups?: { name: string; rows: ReferenceOddsRow[] }[];
  disclaimer?: string;
  note?: string;          // set when a fallback source served this payload
}

export interface TeamBlurb {
  team: string;
  scouting: string;
  resolved: boolean;
  provisional: boolean;
  attack?: number;
  defence?: number;
  form?: number;
  fatigue?: number;
}

export interface TeamInfoResponse {
  match_id: string;
  home: TeamBlurb;
  away: TeamBlurb;
}

export interface TimelinePoint {
  timestamp: string;
  model_probability: number;
  kalshi_odds: number;
  implied_probability: number;
  edge: number;
  confidence: number;
  xg_home: number;
  xg_away: number;
  source: string;
  is_final: boolean;
}

export interface TimingScore {
  market_id: string;
  score: number;
  status: "no_data" | "provisional" | "learned" | "match_over";
  readings: number;
  current_edge?: number | null;
  current_odds?: number;
  components: Record<string, number>;
  reasons: string[];
}

export interface WatchlistEntry {
  match_id: string;
  market_id: string;
  market_title: string;
  watched_since: string;
  timing: TimingScore;
}

export interface RipenessAlert {
  match_id: string;
  market_id: string;
  market_title: string;
  score: number;
  decimal_odds: number;
  edge: number;
  reasons: string;
  fired_at: string;
}

// In-play BUY/SELL signal on a WATCHED market: fired server-side when the
// live remainder-simulation diverges from the market price beyond the
// configured threshold (with cooldowns, so each one is meaningful).
export interface LiveSignalRow {
  id: number;
  match_id: string;
  market_id: string;
  market_title: string;
  side: "BUY" | "SELL";
  // watched = BUY/SELL on a market you watch; easy_win = any open book
  // the live model calls near-certain while the price still pays
  kind: "watched" | "easy_win";
  live_probability: number;
  market_probability: number;
  difference: number;
  minute: number | null;
  fired_at: string;
}

export interface LiveSignalsResponse {
  min_diff: number;
  signals: LiveSignalRow[];
}

// --- Bot Arena (paper-trading strategy lab) -----------------------------
export interface BotPositionRow {
  match_id: string;
  market_id: string;
  market_title: string;
  entry_price: number;
  contracts: number;
  cost: number;
  note?: string | null;
  opened_at: string | null;
  closed_at?: string;
  close_price?: number;
  close_reason?: string;
  net?: number;
}

export interface BotLedger {
  bot: string;
  name: string;
  emoji: string;
  tagline: string;
  style: string;
  bankroll: number;
  equity: number;
  net_pnl: number;
  open: BotPositionRow[];
  closed: BotPositionRow[];
  trades: number;
  wins: number;
}

export interface BotsResponse {
  start_bankroll: number;
  bots: BotLedger[];
  generated_at: string;
}

// --- the watched strip (the HOLD/EXIT stage's surface) -----------------
//
// docs/HOLD-EXIT-DESIGN.md, "The surface — a live strip above the picker
// board". Three backend modules already hold everything it renders, and
// each of them is per-fixture and operator-only:
//
//   watchlist.state() / .coverage()   the declared monitored set, and
//                                     whether a watch has the whole match
//                                     or joined part-way through it
//   live_read.read_for_fixture()      the four decaying components, per
//                                     side, persisted at the tick
//   card.operator_view()["positions"] position.evaluate() per held leg —
//                                     the branch view, the certainty
//                                     premium, and every refusal by name
//
// ONE READ, NOT N+1. The strip polls a single endpoint that folds those
// three together. A per-fixture fan-out at a 15s cadence would re-ask the
// watchlist once per match and re-read the tape N times for a surface
// whose whole point is that it is bounded by the watchlist.
//
// EVERY FIELD BELOW IS A KEY THE BACKEND ALREADY EMITS. `coverage` is
// watchlist.coverage() verbatim, `read` is read_for_fixture() verbatim,
// and each entry in `positions` is position.evaluate() exactly as
// card.operator_view re-flattens it, with the card's own
// `exit_is_obtainable` withdrawal beside it. Nothing here restates a
// backend sentence in this file's own words.
//
// THE REGISTRIES RIDE ON THE PAYLOAD. `refusal_codes` is
// position.REFUSAL_CODES and `policy_codes` is watchlist.POLICY_CODES,
// both verbatim, so the strip names a refusal in the registry's OWN
// words and derives the set it looks for from the registry rather than
// hand-listing a subset of it.
//
// WHICH MATCHES `matches` HOLDS is the backend's call and not this
// file's: the monitored set whose tape shows play, by the watchlist's
// own startedness rule (tape outranks the calendar). The strip renders
// every match it is handed and filters none — dropping a match because
// one of its numbers is missing is the defect this whole stage exists
// against.

/** watchlist.coverage() — what this watch has actually observed. */
export interface WatchedCoverage {
  monitored: boolean;
  complete_history: boolean;
  no_history_is_not_quiet: string;
  history?: string;
  joined_phase?: string;
  joined_phase_meaning?: string;
  joined_minute?: number | null;
  joined_score_home?: number | null;
  joined_score_away?: number | null;
  unobserved_before_minute?: number | null;
  watching_since?: string | null;
  source?: string;
  source_meaning?: string;
  actor?: string;
  policy?: string;
  policy_code?: string;
  basis?: string | null;
}

/** One component of the live read, as `_Read.as_payload()` emits it.
 *  THE VALUE RIDES UNDER A KEY THAT CARRIES ITS UNIT — `shot_read_per_90`,
 *  `possession_read_percent` — and the block names that key in
 *  `value_key`. Read it as `c[c.value_key]`, never as `c[c.component_key]`:
 *  the value used to ride under the component's own name, which put the
 *  four floats one uniform subscript apart and let the composite the
 *  design forbids fall out of a one-line fold over the four blocks.
 *  Three of these are rates per 90 match-minutes and one is a
 *  percentage; the backend's `the_wall_has_a_limit` says what that does
 *  and does not stop. */
export interface LiveReadComponentPayload {
  component: string;
  component_key: string;
  /** the key on THIS object that carries the number, unit included */
  value_key: string;
  kind: string;
  kind_meaning: string;
  unit: string;
  meaning: string;
  observed_seconds: number | null;
  observed_intervals: number | null;
  note?: string | null;
  no_composite_before_m1: string;
  /** only on possession_read — the input this project distrusts by name */
  possession_is_distrusted?: string;
  [key: string]: unknown;
}

/** live_read.state_key(row): the conditioning coordinates, with the
 *  leading/level/trailing word DERIVED from the two numbers beside it. */
export interface LiveReadState {
  side: string;
  minute: number | null;
  score_home: number | null;
  score_away: number | null;
  goal_difference: number | null;
  score_state: string | null;
  conditionable: boolean;
  read_version: string;
  half_life_seconds: number;
  observed_from_kickoff: boolean;
  baseline_is_not_built: string;
  refusal_code?: string;
  refusal?: string;
}

export interface LiveReadSide {
  side: string;
  captured_at: string;
  live_stat_snapshot_id: number;
  half_life_seconds: number;
  observed_since: string | null;
  observed_from_kickoff: boolean;
  state: LiveReadState;
  components: Record<string, LiveReadComponentPayload>;
  basis?: string | null;
}

export interface LiveReadPayload {
  version: string;
  read_version: string;
  fixture_id: number;
  monitored: boolean;
  coverage: WatchedCoverage;
  components_registry: Record<string, { kind: string; unit: string; meaning: string }>;
  kinds: Record<string, string>;
  sides: Record<string, LiveReadSide>;
  /** present INSTEAD of sides when nothing has been persisted: "not a
   *  match in which nothing has happened" */
  words?: string;
  [key: string]: unknown;
}

/** One branch of an outcome — B1's honest shape. A binary never pays its
 *  expectation: it pays `dollars` with probability `probability`. */
export interface OutcomeBranch {
  outcome: string;
  probability: number;
  percent: number;
  dollars: string;
  cents: number;
}

export interface BranchSide {
  label?: string;
  source?: string;
  expectation_dollars?: string;
  expectation_cents?: number;
  branches?: OutcomeBranch[];
  says?: string;
  why?: string;
  quantity?: { kind?: string; answers?: string; n?: number; band?: (number | null)[] } & Record<string, unknown>;
  /** the sell side refuses by name on a book that cannot pay it */
  refused?: string;
  refusal_code?: string;
  certain_means_obtainable?: string;
  certainty_is_the_product?: string;
}

export interface CertaintyAsymmetry {
  rule: string;
  /** null/undefined is NOT "ahead" — the strip fails closed on it (G1) */
  position_is_ahead?: boolean | null;
  protects?: string;
  cannot_protect?: string;
  finding?: string;
}

export interface CertaintyPremium {
  applies: boolean;
  asymmetry?: CertaintyAsymmetry;
  line?: string;
  minute?: number;
  score?: string;
  held?: { side: string; goals_for: number; goals_against: number;
           state: string; derived_from: string };
  contracts?: string;
  cost_of_certainty_dollars?: string;
  cost_of_certainty_cents?: number;
  cost_of_certainty_fraction_of_hold_ev?: number | null;
  removes?: { probability_of_zero: number; percent: number; says: string };
  premium?: { setting_fraction_of_hold_ev: number;
              cost_is_at_or_below_setting?: boolean; says: string; dial: string };
  sell?: { bid_cents?: number; net_dollars?: string; net_cents?: number;
           gross_dollars?: string; fee_dollars?: string };
  hold?: { expected_dollars?: string; expected_cents?: number } & Record<string, unknown>;
  not_an_edge?: string;
  not_a_recommendation?: string;
  /** refuses by name — no_bid / thin_bid / stale_quote / thin_cell_floor … */
  refused?: string;
  refusal_code?: string;
  refusal_codes?: Record<string, string>;
}

/** card._withdraw_unobtainable_exit(): whether the exit figure is one the
 *  book will actually pay, and the code that withdrew it if not. */
export interface ExitIsObtainable {
  obtainable: boolean;
  consulted?: string[];
  refusal_code?: string | null;
  refused?: string | null;
  withdrawn?: string[];
  rule?: string;
}

// --- B4, the partial exit -------------------------------------------
//
// position._partial_exit(), as it rides on card.operator_view's held
// positions. RECORDED, NOT IMAGINED: every key below was read off a
// payload this repo's own emitter produced (src/live/position.py, via
// tests/test_partial_exit.py's helpers) on 2026-09-06 — see the header
// of e2e/watched-strip.spec.ts for the capture.
//
// THREE THINGS THE TYPES THEMSELVES CARRY.
//  - A REFUSED ROW HAS NO `realises`. It is absent, not zeroed, and the
//    optionality here is the shape the backend actually sends.
//  - A ROW WITHDRAWN ON A SHARED LADDER keeps what it would have
//    realised ALONE, under a different key, so the surface can never
//    print the withdrawn figure as if it stood. `obtainable_alone` and
//    `realises_alone_withdrawn` are that pair.
//  - `no_whole_contract` CARRIES NO CODE. A quarter of three contracts
//    is not a book finding, it is arithmetic, and position.py refuses
//    to borrow a registry name for it — so neither does this type.

export interface PartialExitAllocation {
  seq: number; price: string; qty: string; fee: string;
}

/** What a fraction realises: the walk, the exact per-level fee, the net.
 *  ABSENT on a refused row and on a row with no whole contract. */
export interface PartialExitRealises {
  contracts: string;
  average_price_dollars: string;
  average_price_cents?: number;
  worst_level_price_dollars?: string;
  gross_dollars: string;
  fee_dollars: string;
  fee_cents?: number;
  net_dollars: string;
  net_cents?: number;
  levels_walked: number;
  allocations: PartialExitAllocation[];
  /** duplicated verbatim at block level, where the strip renders it once */
  fee_basis?: string;
}

/** What the fraction LEAVES EXPOSED. The expectation is a MEAN the
 *  remainder never pays, and it refuses in the collector's own words
 *  when the engine's read is withdrawn. */
export interface PartialExitRemains {
  contracts: string;
  settles_yes_dollars?: string;
  settles_no_dollars?: string;
  outcome_if_remainder_settles_yes_dollars?: string;
  outcome_if_remainder_settles_no_dollars?: string;
  expected_at_engine_read_dollars?: string | null;
  expected_at_engine_read_cents?: number | null;
  expected_basis?: string;
  expected_refused?: string;
  says: string;
}

/** card._hold_fractions_to_the_ladder(): what the ONE ladder was asked
 *  on a leg held more than once. Present on every row of such a leg,
 *  whether it held or not. */
export interface PartialExitLegConsult {
  positions_on_leg: number;
  combined_contracts: string;
  ladder_resting_total: string;
  holds: boolean;
  says: string;
  unpriced_contracts?: string;
  positions_not_priced?: number[];
}

export interface PartialExitFraction {
  fraction: number;
  label: string;
  contracts: string;
  of_contracts: string;
  executability: {
    consulted: string[]; refused_under: string[]; rule?: string;
    /** "shared_exit_book" when the leg, not this position, withdrew it */
    refused_by?: string;
  };
  obtainable: boolean;
  realises?: PartialExitRealises;
  remains?: PartialExitRemains;
  matches_whole_position_exit?: boolean | null;
  vs_whole_position?: string;
  says: string;
  /** refused by name — the code is position.REFUSAL_CODES' own */
  refusal_code?: string;
  refused?: string;
  also_refused_under?: string[] | null;
  refusals?: Record<string, string>;
  /** withdrawn on a ladder shared by two positions on one leg */
  obtainable_alone?: boolean;
  realises_alone_withdrawn?: PartialExitRealises;
  vs_whole_position_alone?: string;
  leg_consult?: PartialExitLegConsult;
  /** whole contracts, rounded DOWN — and NO registry code borrowed */
  rounded_down_from?: string;
  rounding?: string;
  no_whole_contract?: string;
}

export interface PartialExitBook {
  source: string;
  quote_id: number | null;
  captured_at?: string | null;
  levels: { price_dollars: string | null; size: string | null }[];
  resting_total: string | null;
  depth_levels_available: number;
  levels_from_another_quote_dropped: number;
  top_of_book?: { bid_dollars: string | null; size: string | null };
  best_level_matches_top_of_book?: boolean | null;
  /** the depth read FAILED — a named absence, never folded into "no depth" */
  depth_read?: string | null;
  depth_read_note?: string;
  basis?: string;
}

export interface PartialExit {
  applies: boolean;
  rule: string;
  fractions: PartialExitFraction[];
  fractions_priced: number;
  book: PartialExitBook;
  executability: {
    consulted: string[]; order_basis?: string;
    refused_under_by_fraction: Record<string, string[]>; rule?: string;
  };
  fee_basis: string;
  whole_contracts: string;
  not_a_recommendation: string;
  common_case: string;
  refusal_code?: string | null;
  refused?: string | null;
  withdrawn_on_shared_ladder?: string[];
  withdrawn_on_shared_ladder_rule?: string;
}

// --- B2, the minute-0 map --------------------------------------------
//
// src/live/entry_map.py's `entry-map-v1`, recorded the same way. The map
// is drawn AT PURCHASE and does not re-condition on the live state; when
// a ball has been kicked the payload says so itself under `match_now`.
//
// THE CATEGORY WALL RIDES IN THE TYPES. A branch's held quantity is
// EITHER a win probability (`quantity_key: "p_win"`) or a LOWER BOUND on
// one (`"lower_bound_on_p_win"`), the two are not comparable, and they
// carry their numbers under DIFFERENT keys. Read the number through
// `quantity_key` — never off a key spelled in the reader — which is the
// same discipline `value_key` enforces on the live read's components.

export interface EntryMapQuantity {
  quantity: string;
  answers: string;
  /** the key on THIS object carrying the fraction; `${key}_percent` and
   *  `${key}_wilson_band_percent` carry the percentage and its band */
  quantity_key: string;
  n: number | null;
  source_cell?: string;
  note?: string;
  category_rule?: string;
  [key: string]: unknown;
}

export interface EntryMapReached {
  state: string;
  p_first_goal_percent?: number;
  p_first_goal_wilson_band_percent?: number[];
  n?: number;
  k?: number;
  composed_from?: string[];
  source_cell?: string;
  either_side?: string;
  /** no grid splits the opener by scorer — refused, never imputed */
  by_side?: { refusal_code?: string; refused?: string };
  refusal_code?: string;
  refused?: string;
}

export interface EntryMapDollars {
  settles?: { if_your_side_wins_dollars: string; otherwise_dollars: string };
  pnl?: { if_your_side_wins_dollars: string; otherwise_dollars: string };
  branches_not_averages?: string;
  /** `priced: false` where the held number is a LOWER BOUND — an
   *  expectation off a bound is the 2026-09-02 substitution in dollars */
  expected?: {
    priced?: boolean; quantity_key?: string; not_priced?: string;
    category_rule?: string;
    settlement_dollars?: string; settlement_dollars_wilson_band?: string[];
    pnl_dollars?: string; pnl_dollars_wilson_band?: string[];
    n?: number; certainty_vs_mean?: string;
    refusal_code?: string; refused?: string;
  };
}

export interface EntryMapBranch {
  state?: string;
  grid?: string;
  minute?: number;
  opener?: { role: string; side: string };
  relation_to_you?: string;
  reached?: EntryMapReached;
  your_contract?: {
    contract: string; held: boolean; quantity?: EntryMapQuantity;
    refusal_code?: string; refused?: string;
  };
  dollars?: EntryMapDollars;
  /** the whole branch refuses — e.g. no pre-kickoff favourite to band on */
  refusal_code?: string;
  refused?: string;
}

export interface EntryMap {
  version: string;
  charter?: string;
  a_map_not_a_verdict: string;
  not_a_signal?: string;
  no_response_window: string;
  drawn_from: string;
  fixture?: { id: number; competition_slug?: string };
  position?: Record<string, unknown>;
  grids?: { variant?: string; min_n_floor?: number; floor_rule?: string };
  favourite?: { fav_side?: string; fav_p?: number; band?: string;
                source?: string; read_from?: string;
                refusal_code?: string; refused?: string };
  // `withdrawal` is an OBJECT (position._red_card: {code, because, rule}),
  // never a string. It was typed `string | null` and rendered as a bare
  // React child, which throws "Objects are not valid as a React child" the
  // first time a watched fixture carries a dismissal or an unreadable tape.
  red_card?: { void?: boolean; withdraws?: boolean;
               withdrawal?: { code?: string; because?: string;
                              rule?: string } | null;
               witness?: unknown; tape_note?: string; rule?: string };
  /** the map's OWN start witnesses — never this file's clock */
  match_now?: { started: boolean; note?: string; witness?: string;
                tape?: Record<string, unknown> };
  you_are?: { role: string; side: string; says: string } | null;
  voided?: boolean;
  branches: Record<string, EntryMapBranch>;
  refusals?: { count_by_code: Record<string, number>; total: number;
               rule?: string; codes?: Record<string, string> };
}

export interface WatchedPosition {
  journal_entry?: {
    bet_id: number; outcome_key: string; market_ticker?: string;
    stated_price_dollars?: string | number | null;
    stated_size?: string | number | null;
    recorded_at?: string | null; size_basis?: string;
  } & Record<string, unknown>;
  position?: {
    outcome_key: string; side: string; size: string;
    entry_price: number | null; entry_cost_dollars: string | null;
    entry_note: string;
  };
  /** null when the exit is not obtainable — WITHDRAWN, not missing */
  value_now_cents?: number | null;
  value_now_withdrawn?: string;
  value_at_settlement_cents?: number | null;
  hold_vs_exit?: { says?: string; refused?: string } & Record<string, unknown>;
  branch_view?: { why?: string; certain_means_obtainable?: string;
                  sell?: BranchSide;
                  hold?: { engine_read?: BranchSide;
                           conditioned_grid?: BranchSide } };
  certainty_premium?: CertaintyPremium;
  exit_is_obtainable?: ExitIsObtainable;
  exposure?: { applies?: boolean; refused?: string; refusal_code?: string }
             & Record<string, unknown>;
  red_card_void?: { refused?: string; refusal_code?: string } & Record<string, unknown>;
  /** B4 — four sizes of one trade, walked down the actual bid ladder.
   *  Rides BESIDE the card, outside content_hash. */
  partial_exit?: PartialExit;
  /** B2 — the map drawn at minute 0, at purchase. */
  entry_map?: EntryMap;
  /** every top-level executability finding rides under its REGISTRY name
   *  (no_bid / thin_bid / stale_quote / …), which is how the strip finds
   *  them without hand-listing one */
  [code: string]: unknown;
}

export interface WatchedMatch {
  fixture_id: number;
  competition_slug: string;
  home: string;
  away: string;
  espn_event_id?: string | null;
  /** the tape row's own state — every field may refuse by name */
  state: {
    in_play: boolean;
    minute: number | null;
    score_home: number | null;
    score_away: number | null;
    clock_display?: string | null;
    match_state?: string | null;
    captured_at?: string | null;
    /** position.REFUSAL_CODES names: not_in_play / no_minute / no_score */
    refusals?: { code: string; refused: string }[];
  };
  coverage: WatchedCoverage;
  read: LiveReadPayload;
  positions: WatchedPosition[];
  /** journal.held_positions()'s own wording when nothing is on */
  positions_note?: string | null;
  /** S1 / G6, card._shared_exit_book: a leg held by TWO positions holds
   *  every fraction row and every whole-position claim to the ONE bid
   *  ladder, and what does not fit is withdrawn IN PLACE on the
   *  positions above. This block carries the leg's own finding.
   *
   *  TYPED AS `unknown` ON PURPOSE. The route emits it (api/main.py
   *  `_positions` returns it and the match block carries it) and this
   *  file had no field for it at all, so the key arrived on every
   *  payload with nothing declaring it. Its inner shape is
   *  card._shared_exit_book's and has NOT been recorded off that
   *  emitter here; writing a plausible one by hand is how a TS type
   *  stops matching what the backend sends, which crashed this very
   *  strip once (a withdrawal typed as a string and sent as an
   *  object). Naming the key without claiming its shape is the honest
   *  half. */
  shared_exit_book?: unknown;
}

export interface WatchedStripResponse {
  version: string;
  generated_at: string;
  /** the live plane is not configured — words, never a plausible empty set */
  dormant?: boolean;
  detail?: string;
  matches: WatchedMatch[];
  /** SPLIT BY SOURCE AND NEVER TOTALLED: a human-selected set carries
   *  selection bias by construction and one that follows open positions
   *  does not, so folding them into one number destroys a distinction no
   *  later work can recover. */
  monitored_by_source: Record<string, number[]>;
  /** a position nobody declared — the census-of-nothing finding */
  open_positions_not_monitored: number[];
  /** A DECLARED FIXTURE THAT IS NOT IN `matches`, and the only way a
   *  monitored match can be missing from the strip. api/main.py's
   *  WATCHED_STRIP_OPEN["no_identity_row"] registers it: WatchedMatch's
   *  identity fields (competition_slug / home / away) come off a
   *  `fixture` row and this plane holds them nowhere else, so the route
   *  reports the id rather than inventing a match block for it. The
   *  surface DRAWS this list — a match that silently drops off the
   *  strip is the defect this stage was reported for, and the backend's
   *  own record says an operator watching `matches` alone would not
   *  see it. */
  monitored_not_described?: {
    fixture_id: number;
    /** watchlist.POLICY_CODES, not position.REFUSAL_CODES */
    policy_code: string;
    refused: string;
    registered?: { finding: string; closes_when: string };
  }[];
  refusal_codes: Record<string, string>;
  policy_codes?: Record<string, string>;
  standing?: Record<string, string>;
  /** SON'S INVARIANT, THE HALF THE PICKER CANNOT SERVE: every fixture
   *  the STATE TAPE shows under way that nobody declared. The watch
   *  toggle lives on the picker board and
   *  src/picker/board.fixtures_from_scoreboard defaults to
   *  states=("pre",), so a fixture leaves that board the instant it
   *  kicks off — this list is the only place an already-started match
   *  can be picked up, and every entry carries the id
   *  watchlist.declare() takes.
   *
   *  NOT DRAWN YET, AND REGISTERED AS SUCH:
   *  WatchedStrip.tsx's UNRENDERED_ENVELOPE_KEYS["in_play_not_declared"]
   *  holds the finding and the condition that retires it. The key is
   *  declared here because the backend emits it on EVERY response
   *  including the dormant one, and a contract that omits a key the
   *  route always sends is a stale type — the shape this repo has
   *  already been bitten by.
   *
   *  `matches` is a list; `in_play` on an entry is `boolean | null`,
   *  and the null is load-bearing: a tape row whose `match_state` is
   *  outside watchlist.TAPE_STATES fails CLOSED into
   *  `state_unclassifiable` with `in_play: null` — WITHDRAWN, never
   *  false — rather than being folded into "not in play". The inner
   *  entry shape is deliberately left open: it has not been recorded
   *  off this route's own emitter, and hand-writing one is what the
   *  registered record above exists to prevent. */
  in_play_not_declared?: {
    matches: unknown[];
    state_unclassifiable: unknown[];
    not_described: unknown[];
    counts: {
      in_play: number;
      state_unclassifiable: number;
      not_described: number;
    };
    window_seconds: number;
    window_basis: string;
    in_play_states: string[];
    /** counts are NULL, never 0, when the tape read itself failed —
     *  `unavailable` then carries the reason and the empty lists above
     *  are not a measurement */
    coverage: {
      rows_in_window: number | null;
      fixtures_in_window: number | null;
      competitions_in_window: string[] | null;
      collector_folds_over: string[];
      models_computed_for: string[];
      unavailable?: string;
      says: string;
    };
    is: string;
    is_not_a_ranking: string;
    not_a_view?: string;
    /** card._layer's shape when the whole block could not be assembled
     *  — the block degrades itself and the declared matches are
     *  untouched */
    unavailable?: string;
  };
}

const base = "/api/bet-suggester";

/** A read that answered with something that is not a payload.
 *
 *  `res.json()` used to be returned straight from here, which folded
 *  three different findings into one: a SyntaxError in the browser's
 *  own vocabulary ("Unexpected end of JSON input") for a 204 or an
 *  HTML error page, and — worse, because it does not throw at all — a
 *  literal `null` body handed back typed as T. A caller that destructures
 *  T then crashes somewhere else entirely, and a caller that guards with
 *  `?.` renders the branch that means "there is nothing".
 *
 *  The status is carried so a caller can tell a refusal from a
 *  malformed answer, and the first bytes of the body are carried as
 *  EVIDENCE rather than paraphrased. */
export class ApiBodyError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, why: string, body: string) {
    super(why);
    this.name = "ApiBodyError";
    this.status = status;
    this.body = body;
  }
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, init);
  const raw = await res.text();
  if (!res.ok) throw new Error(`API ${res.status}: ${raw}`);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new ApiBodyError(res.status,
      `the read answered ${res.status} with a body that is not JSON `
      + `(${raw.length} characters) — this is an ANSWER we could not `
      + "read, not an empty result",
      raw.slice(0, 400));
  }
  if (body === null || body === undefined || typeof body !== "object") {
    // A 200 CARRYING `null` IS NOT AN EMPTY PAYLOAD. Returned as T it
    // reaches every caller as the shape that means "there is nothing".
    //
    // AND NEITHER IS A JSON SCALAR (2026-09-07). This guarded `null` and
    // `undefined` only, while both sibling readers in this same file —
    // `fetchWatchedStrip` and `wlJson` — go on to refuse
    // `typeof body !== "object"`. So a 200 whose body was `0`, `false`,
    // `"error"` or a bare number was cast straight to T, and every
    // caller reads T as a record: `body.matches`, `body.rows`,
    // `body.suggestions` on a number are all `undefined`, which renders
    // as the EMPTY STATE — an answer we could not read, shown as a
    // measured nothing. Every endpoint below is typed as an object or an
    // array (`typeof [] === "object"`, so arrays still pass), and none
    // of them may legitimately answer a scalar.
    throw new ApiBodyError(res.status,
      `the read answered ${res.status} with `
      + `${body === undefined ? "no body" : JSON.stringify(body)} where a `
      + "payload was expected — there is nothing here a caller may read "
      + "as an empty result",
      raw.slice(0, 400));
  }
  return body as T;
}

export const api = {
  suggestions: () => getJson<SuggestionsResponse>("/suggestions"),

  refreshAll: () =>
    getJson<RefreshAllResponse>("/refresh-all", { method: "POST" }),

  upcoming: (hoursAhead = 72) =>
    getJson<{ matches: UpcomingMatch[] }>(`/upcoming?hours_ahead=${hoursAhead}`),

  bracket: () => getJson<BracketResponse>("/bracket"),

  teamInfo: (matchId: string) =>
    getJson<TeamInfoResponse>(`/team-info/${matchId}`),

  playerProps: (matchId: string) =>
    getJson<PlayerPropsResponse>(`/player-props/${matchId}`),

  teamNews: (matchId: string) =>
    getJson<TeamNewsResponse>(`/team-news/${matchId}`),

  liveStats: (matchId: string) =>
    getJson<LiveStatsResponse>(`/live-stats/${matchId}`),

  liveAuto: (matchId: string) =>
    getJson<LiveAutoResponse>(`/live-auto/${matchId}`),

  referenceOdds: (matchId: string) =>
    getJson<ReferenceOddsResponse>(`/reference-odds/${matchId}`),

  research: (matchId: string) =>
    getJson<ResearchResponse>(`/research/${matchId}`),

  pastMatches: () => getJson<PastMatchesResponse>("/past-matches"),

  prediction: (matchId: string, forceRefresh = false) =>
    getJson<PredictionResponse>(
      `/prediction?match_id=${matchId}&force_refresh=${forceRefresh}`
    ),

  timeline: (matchId: string) =>
    getJson<{ points: TimelinePoint[] }>(`/timeline?match_id=${matchId}`),

  livePrediction: (matchId: string, state: LiveStateInput) =>
    getJson<LivePredictionResponse>(`/live?match_id=${matchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }),

  liveState: (matchId: string) =>
    getJson<LiveStateFetch>(`/live-state?match_id=${matchId}`),

  liveScores: () => getJson<LiveScoresResponse>("/live-scores"),

  // --- bet-timing / ripeness ------------------------------------------
  watchlist: () =>
    getJson<{ watchlist: WatchlistEntry[]; alert_threshold: number }>("/watchlist"),

  watch: (matchId: string, marketId: string, marketTitle: string) =>
    getJson<{ status: string }>("/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        match_id: matchId, market_id: marketId, market_title: marketTitle,
      }),
    }),

  unwatch: (marketId: string) =>
    getJson<{ status: string }>(`/watchlist?market_id=${marketId}`, {
      method: "DELETE",
    }),

  timing: (matchId: string, marketId: string) =>
    getJson<TimingScore>(`/timing?match_id=${matchId}&market_id=${marketId}`),

  alerts: () => getJson<{ alerts: RipenessAlert[] }>("/alerts"),

  liveSignals: (matchId?: string) =>
    getJson<LiveSignalsResponse>(
      matchId ? `/live-signals?match_id=${matchId}` : "/live-signals"),

  bots: () => getJson<BotsResponse>("/bots"),

  // The HOLD/EXIT strip's one read. ONE endpoint, polled at 15s beside
  // the backend's live tick — see the contract above.
  //
  // THE TOKEN IS AN ARGUMENT AND IS HELD NOWHERE. The backend gates
  // this read with `_admin_ok` because the payload carries POSITIONS —
  // stated size and price paid, the two fields the journal's public
  // projection redacts. The token is typed by a person into
  // WatchDeclaration's panel and lives in that component's state for as
  // long as the tab does; it is never in an env var, never in
  // localStorage, never in this module. It travels as ONE header,
  // exactly as watchlistApi does, so one token serves the watch toggle
  // and this read alike.
  //
  // A FAILURE THROWS A WatchedStripRefusal, NOT A BARE Error. "no
  // route", "no credential", "the credential you typed was refused" and
  // "nothing answered at all" used to arrive at the surface as one
  // blank space, which is how this strip spent its whole life invisible
  // in production. The status and the backend's own sentence ride on
  // the error so the surface can say WHICH of them it is looking at.
  watchedStrip: (token?: string) => fetchWatchedStrip(token ?? ""),
};

/** A watched-strip read that did not produce a payload.
 *
 *  Every field here is EVIDENCE, never a paraphrase: `status` is the
 *  status the proxy returned (null when nothing answered at all),
 *  `said` is the backend's own `detail`/`error` string verbatim (empty
 *  when it sent none — an absent sentence is not an invented one), and
 *  `sentToken` records whether this client actually had a token to
 *  send. The surface needs all three to keep "you have typed no token"
 *  apart from "the token you typed was refused". */
export class WatchedStripRefusal extends Error {
  readonly status: number | null;
  readonly said: string;
  readonly sentToken: boolean;
  constructor(status: number | null, said: string, sentToken: boolean) {
    super(said || (status == null
      ? "the watched-strip read got no answer at all"
      : `the watched-strip read answered ${status}`));
    this.name = "WatchedStripRefusal";
    this.status = status;
    this.said = said;
    this.sentToken = sentToken;
  }
}

async function fetchWatchedStrip(token: string):
    Promise<WatchedStripResponse> {
  const sent = token !== "";
  let res: Response;
  try {
    res = await fetch(`${base}/watched-strip`,
      { headers: sent ? { "x-admin-token": token } : {} });
  } catch (err) {
    // Nothing answered. NOT folded into a status — an unreachable proxy
    // and a refusal are different findings and the surface says which
    // one it has.
    throw new WatchedStripRefusal(null, String(err), sent);
  }
  let raw: string;
  try {
    raw = await res.text();
  } catch (err) {
    // The proxy ANSWERED and the body stream broke. A status with no
    // body is still a status, so it rides on the refusal.
    throw new WatchedStripRefusal(res.status,
      `the strip read answered ${res.status} and the body could not be `
      + `read to the end (${String(err)})`, sent);
  }
  let parsed = false;
  let body: unknown = null;
  try { body = JSON.parse(raw); parsed = true; }
  catch { /* non-JSON body kept as text below */ }
  if (!res.ok) {
    // The backend's own words, or the proxy's. Never this layer's
    // paraphrase — every refusal on this surface is written down
    // somewhere upstream and a gloss here would be a second claim.
    // A body that is not JSON still carries evidence: the first bytes
    // of an HTML error page name the gateway that produced it, and
    // dropping them left the surface with a bare status.
    const b = body as { detail?: unknown; error?: unknown } | null;
    const said = typeof b?.detail === "string" ? b.detail
      : typeof b?.error === "string" ? b.error
      : parsed ? "" : raw.trim().slice(0, 400);
    throw new WatchedStripRefusal(res.status, said, sent);
  }
  // A 200 IS NOT A PAYLOAD. Until 2026-09-07 an unparseable body left
  // `body` at its initialiser and this line returned `null` typed as
  // WatchedStripResponse — ten lines under a comment promising that a
  // failure THROWS a WatchedStripRefusal. The strip then read a null
  // envelope and rendered the branch that means "nothing is declared",
  // which is the census-of-nothing this whole surface exists against.
  if (!parsed) {
    throw new WatchedStripRefusal(res.status,
      `the strip read answered ${res.status} with a body that is not `
      + `JSON (${raw.length} characters) — an ANSWER WE COULD NOT `
      + "READ, which is not an empty watchlist and not a dormant "
      + `plane: ${raw.trim().slice(0, 200)}`, sent);
  }
  if (body === null || typeof body !== "object") {
    throw new WatchedStripRefusal(res.status,
      `the strip read answered ${res.status} with ${JSON.stringify(body)} `
      + "where an envelope was expected — no version, no matches and no "
      + "registries, so nothing here can be told apart from nothing "
      + "being declared", sent);
  }
  return body as WatchedStripResponse;
}

// -- formatting helpers -------------------------------------------------
export const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
export const signedPct = (x: number) => {
  const v = (x * 100).toFixed(1);
  if (v === "-0.0" || v === "0.0") return "+0.0%"; // avoid a signed zero
  return `${x >= 0 ? "+" : ""}${v}%`;
};
export const money = (x: number) => `${x >= 0 ? "+" : "−"}$${Math.abs(x).toFixed(2)}`;

export function countdown(seconds: number): string {
  if (seconds <= 0) return "kicked off";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Local kickoff date + time in the viewer's timezone, e.g. "Thu, Jul 9 · 4:00 PM".
// Used on the next-match hero and every bracket card so times read in local time.
export function kickoffLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short", month: "short", day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric", minute: "2-digit",
  });
  return `${date} · ${time}`;
}

// National-team flag emoji, keyed by our schedule's team names. Dependency-
// free and instantly recognizable — better than club-style logo PNGs for a
// World Cup. Unknown teams fall back to a neutral marker.
const FLAGS: Record<string, string> = {
  "Argentina": "🇦🇷", "Egypt": "🇪🇬", "Brazil": "🇧🇷", "Norway": "🇳🇴",
  "Mexico": "🇲🇽", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Portugal": "🇵🇹", "Spain": "🇪🇸",
  "United States": "🇺🇸", "Belgium": "🇧🇪", "Switzerland": "🇨🇭",
  "Colombia": "🇨🇴", "France": "🇫🇷", "Morocco": "🇲🇦", "Paraguay": "🇵🇾",
  "Netherlands": "🇳🇱", "Croatia": "🇭🇷", "Japan": "🇯🇵", "Senegal": "🇸🇳",
  "Australia": "🇦🇺", "Cape Verde": "🇨🇻", "Ivory Coast": "🇨🇮",
  "Algeria": "🇩🇿", "Austria": "🇦🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Haiti": "🇭🇹",
  "DR Congo": "🇨🇩", "Canada": "🇨🇦",
  // ASEAN Championship field
  "Vietnam": "🇻🇳", "Thailand": "🇹🇭", "Indonesia": "🇮🇩", "Malaysia": "🇲🇾",
  "Singapore": "🇸🇬", "Philippines": "🇵🇭", "Myanmar": "🇲🇲",
  "Cambodia": "🇰🇭", "Laos": "🇱🇦", "Brunei": "🇧🇳", "Timor-Leste": "🇹🇱",
};

export const flag = (team: string): string => FLAGS[team] ?? "⚽";

// --- B0c, the watchlist: DECLARING which matches are watched ----------
//
// THE RULE THAT DECIDES THIS WHOLE SHAPE. `/api/admin/live/watchlist` is
// operator-gated on all three verbs, and `actor` is required there and
// never defaulted — "a declaration with nobody's name on it cannot be
// held to anything". namson.dev is public and lib/suggesterProxy.ts
// injects no credentials, so every call below takes the operator's own
// token as an ARGUMENT and sends it as one header. Nothing here reads an
// env var, nothing is cached in storage, and no actor is ever supplied
// by this module: a missing name is forwarded as a missing name so the
// backend refuses it in the sentence that owns the rule.
//
// THE SET IS APPEND-ONLY. `remove` is a REQUEST. Once a fixture has
// started the backend refuses it and RECORDS the refusal — a 200 with
// `recorded: true` and a `policy_code` that says which witness refused.
// That is not an error state and this module does not turn it into one:
// every call resolves, and the caller reads `policy` / `policy_code`.

/** One declaration attempt's answer — the shape of watchlist._result().
 *  `policy` leads with its registry code and is the backend's own
 *  wording; render it verbatim rather than paraphrasing it. */
export interface WatchlistDeclaration {
  fixture_id: number;
  recorded: boolean;
  policy_code: string;
  policy: string;
  version: string;
  event_id?: number;
  action?: "add" | "remove" | "remove_refused";
  source?: string;
  actor?: string;
  occurred_at?: string;
  joined_phase?: string | null;
  joined_minute?: number | null;
  basis?: string | null;
  /** the live plane is not configured — words, never a plausible empty set */
  dormant?: boolean;
  detail?: string;
  [standing: string]: unknown;
}

/** What this proxy resolved the board's ESPN reference to, beside the
 *  backend's own bytes. The join is never a guess — see
 *  pages/api/bet-suggester/live-watchlist/index.ts. */
export interface WatchlistDeclareResponse {
  resolved_fixture: {
    espn_event_id: string;
    fixture_id: number;
    competition: string | null;
    kickoff_utc: string | null;
  };
  watchlist: WatchlistDeclaration;
}

/** watchlist.state(). Counts are SPLIT BY SOURCE and never totalled: a
 *  human-selected set carries selection bias by construction and one
 *  that follows open positions does not. */
export interface WatchlistState {
  version: string;
  generated_at: string;
  monitored_fixture_ids: number[];
  monitored_by_source: Record<string, number[]>;
  declared_ever_fixture_ids: number[];
  declared_ever_count: number;
  removed_before_kickoff: number[];
  removed_before_kickoff_count: number;
  currently_removed_fixture_ids: number[];
  re_declarations_count: number;
  removal_attempts_refused_count: number;
  removal_attempts_refused: {
    fixture_id: number; actor: string; occurred_at: string;
    policy_code: string; reason: string | null;
  }[];
  open_positions_not_monitored: number[];
  log_total: number;
  log_truncated: boolean;
  log_truncation: string | null;
  registries?: {
    actions?: Record<string, string>;
    sources?: Record<string, string>;
    policy_codes?: Record<string, string>;
    phases?: Record<string, string>;
  };
  dormant?: boolean;
  detail?: string;
  [standing: string]: unknown;
}

export interface WatchlistSyncResult {
  checked: number;
  declared: number[];
  already_declared: number[];
  unknown_fixture: number[];
  open_positions_not_monitored: number[];
  actor: string;
  generated_at: string;
  version: string;
  dormant?: boolean;
  detail?: string;
  [standing: string]: unknown;
}

/** ESPN reference -> live-plane fixture, for a whole board in one call.
 *  A reference that resolves to nothing carries a null AND a note; the
 *  two absences ("no fixture row" / "we could not ask") stay apart. */
export interface WatchlistResolveResponse {
  resolved: Record<string, {
    fixture_id: number; competition: string | null;
    kickoff_utc: string | null;
  } | null>;
  notes: Record<string, string>;
  asked: number;
  unreadable_references: string[];
}

const wlBase = `${base}/live-watchlist`;

/** The operator token travels as ONE header and lives nowhere else. */
const wlHeaders = (token: string): Record<string, string> =>
  ({ "x-admin-token": token });

/** Read the backend's error body rather than inventing one: every
 *  refusal on this surface is written somewhere in the backend's own
 *  words, and a paraphrase would be this layer's claim, not the
 *  record's. */
async function wlJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let parsed = false;
  let body: unknown = null;
  try { body = JSON.parse(raw); parsed = true; }
  catch { /* non-JSON body kept as text below */ }
  if (!res.ok) {
    const b = body as { detail?: unknown; error?: unknown } | null;
    const said = typeof b?.detail === "string" ? b.detail
      : typeof b?.error === "string" ? b.error
      : raw.slice(0, 400);
    throw new Error(said || `watchlist ${res.status}`);
  }
  // THE SAME SHAPE fetchWatchedStrip HAD, ONE FUNCTION OVER. A 200 with
  // an unparseable body left `body` null and returned it typed as T, so
  // a declare that was never recorded and a declare that answered
  // nothing reached the panel identically. Every caller here reads the
  // result as a RECORD of what the operator declared; a null one reads
  // as "nothing was declared", which is a claim about the operator's
  // own preregistration.
  if (!parsed) {
    throw new Error(
      `the watchlist read answered ${res.status} with a body that is `
      + `not JSON (${raw.length} characters) — an answer we could not `
      + "read, which is not an empty watchlist: "
      + raw.trim().slice(0, 200));
  }
  if (body === null || typeof body !== "object") {
    throw new Error(
      `the watchlist read answered ${res.status} with `
      + `${JSON.stringify(body)} where a payload was expected — `
      + "nothing here can be told apart from nothing being declared");
  }
  return body as T;
}

export const watchlistApi = {
  /** The declared set and its log. Operator-gated: with no token the
   *  backend refuses, and the refusal is the honest answer. */
  state: (token: string, signal?: AbortSignal) =>
    fetch(`${wlBase}?log=200`, { headers: wlHeaders(token), signal })
      .then((r) => wlJson<WatchlistState>(r)),

  /** ESPN references -> fixture ids, so a row can say whether it is in
   *  the set. Gated behind the same token as the read. */
  resolve: (token: string, eventIds: string[], signal?: AbortSignal) =>
    fetch(`${wlBase}/resolve`, {
      method: "POST", signal,
      headers: { ...wlHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ event_ids: eventIds }),
    }).then((r) => wlJson<WatchlistResolveResponse>(r)),

  /** Declare, or ask for a removal. `actor` is passed straight through,
   *  blank included — the backend owns the sentence that refuses a
   *  nameless declaration and it should be the one to say it. */
  declare: (token: string, eventId: string,
            action: "add" | "remove", actor: string, reason?: string) => {
    const qs = new URLSearchParams({ event_id: eventId, action, actor });
    if (reason) qs.set("reason", reason);
    return fetch(`${wlBase}?${qs.toString()}`,
      { method: "POST", headers: wlHeaders(token) })
      .then((r) => wlJson<WatchlistDeclareResponse>(r));
  },

  /** "Watch everything I hold." Idempotent, removes nothing, and names
   *  its own source — it follows the journal's rows, not a preference. */
  syncPositions: (token: string) =>
    fetch(`${wlBase}/sync-positions`,
      { method: "POST", headers: wlHeaders(token) })
      .then((r) => wlJson<WatchlistSyncResult>(r)),
};

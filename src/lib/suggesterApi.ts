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
  refusal_codes: Record<string, string>;
  policy_codes?: Record<string, string>;
  standing?: Record<string, string>;
}

const base = "/api/bet-suggester";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, init);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
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
  // the backend's live tick — see the contract above. A 404 (the proxy
  // and the backend route are not built yet), a 403 (operator
  // credentials) or a dead backend all throw, and the strip renders
  // NOTHING rather than an empty section: absent, not empty.
  watchedStrip: () => getJson<WatchedStripResponse>("/watched-strip"),
};

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

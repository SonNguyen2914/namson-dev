// HERMETIC PAYLOADS FOR THE REDESIGNED CONSOLE (2026-10-07).
//
// Shaped key for key like the backend's own routes (TRIVELA origin/main
// 1317f4f5): src/trading/status.py (trading-status-v0, incl. trading_day,
// daily_budget, careful, news_guard, anomaly_avoid, journal_retention),
// src/trading/console.py (trading-candidates-v1), src/trading/managed.py
// book_view (trading-book-v1) — and the ledger is the RECORDED
// trading-ledger-v1 payload (e2e/trading-ledger-recorded.ts). Values are
// invented, synthetic, and never a real account; timestamps are re-based
// on now. Used by the console's own specs and by the design-QA shots.
import { BOOK_RECORDED, STATUS_RECORDED } from "./trading-console-recorded";
import { LEDGER_RECORDED } from "./trading-ledger-recorded";
import { FOCUS_COMPETITIONS } from "../src/lib/tradingConsole";

type Obj = Record<string, unknown>;
export const at = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();

// --------------------------------------------------------------- status

const CAREFUL: Obj = {
  enabled: true, version: "careful-v1", label: "experimental, unproven",
  knobs: { CAREFUL_EDGE_CEILING: "0.08", CAREFUL_EDGE_FLOOR: "0.02", CAREFUL_HOUR_MAX: "12",
    CAREFUL_MATCH_MAX: "5", CAREFUL_MIN_BOOKS: "3", CAREFUL_SIZE_HIGH: "2", CAREFUL_SIZE_LOW: "1" },
  real_families: ["GAME", "TOTAL", "BTTS"],
  competitions: Object.fromEntries(FOCUS_COMPETITIONS.map((c) => [c, { on: c !== "cnl" }])),
  competitions_count: 11, promoted: [], probation: ["family:TOTAL"],
  tick: { version: "careful-v1", candidates: 41, qualifying: 5, funded: 2, swaps: 1,
    data_errors: 0, paper_rows: 9,
    usage: { hour: { [at(95).slice(0, 13) + ":00:00+00:00"]: "7.46", [at(155).slice(0, 13) + ":00:00+00:00"]: "3.10" },
      match_max: "5", hour_max: "12", matches_at_risk: 3 } },
  situations: {
    "epl|GAME|90-30": { paper_n: 40, paper_x_c: 1.2, real_n: 22, real_x_c: 0.8,
      real_settled_n: 22, real_pnl_c: -310, disagreement: true },
    "laliga|TOTAL|180-90": { paper_n: 18, paper_x_c: 0.4, real_n: 6, real_x_c: -0.2,
      real_settled_n: 5, real_pnl_c: 45, disagreement: false },
  },
  grounds_paper: { "family:SPREAD": { n: 150, matches: 21, mean: 0.9, lo: 0.2, hi: 1.6 },
    "family:BTTS": { n: 34, matches: 9, mean: -0.3, lo: -1.4, hi: 0.8 } },
  grounds_real: { "family:GAME": { n: 22, matches: 14, mean: 0.8, lo: -0.6, hi: 2.1 } },
  scored: 214,
  events: [{ at: at(-600), reason: "promotion_check", ground: "family:SPREAD",
    milestone: 150, proposed: true },
  { at: at(-1440), reason: "scorecard", day: at(-1440).slice(0, 10), scored: 31 }],
};

const BY_COMP_INPLAY = Object.fromEntries(FOCUS_COMPETITIONS.map((c, i) => [c,
  { legs: c === "mls" ? 4 : c === "bundesliga" ? 2 : 0, candidates: c === "mls" ? 4 : 0,
    skipped: c === "mls" ? 41 : c === "bundesliga" ? 12 : i % 3, refused: c === "mls" ? 2 : 0,
    placed: 0, order_failed: 0 }]));

export function qaStatus(over: Obj = {}): Obj {
  const ip = STATUS_RECORDED.in_play_trading as Obj;
  return {
    ...STATUS_RECORDED,
    env: "prod", enabled: true, paper_only: false, mode_banner: null, kill: false, kill_until: null,
    strategy: "consensus-v0",
    halt: { active: false, reason: null, since: null, rearm: null },
    trading_day: { tz: "America/Los_Angeles", configured: "America/Los_Angeles", valid: true,
      day: at(0).slice(0, 10), starts_at: at(-600), ends_at: at(840) },
    daily_budget: { readable: true, why: null, ok: true, used: "6.20", remaining: "13.80",
      limit: "20", realised: "-2.00", realised_counted: 3, open_positions: "5.40",
      resting_orders: "2.80", open_markets: 3, resting_count: 2,
      trading_day: at(0).slice(0, 10), trading_day_tz: "America/Los_Angeles",
      version: "budget-v1", measured_on: "agent journal", refused_today: 1,
      unreadable_today: 0, at: at(-0.2), basis: "today's REALISED loss, NET …" },
    balance: "48.12", marked_equity: "49.37", account_read_at: at(-0.2), account_at: at(-0.2),
    risk_at: at(-0.2), total_at_risk: "8.20", total_limit: "50", bankroll_cap: "50",
    open_agent_orders: 2, open_other_orders: 1, fills_today: 3, placed_today: 4,
    pnl: { agent_total: "-0.63", agent_since_start: "1.41", realized_total: "1.05",
      agent_basis: "the AGENT'S OWN P&L", realized_basis: "REALIZED ON OPEN MARKETS ONLY" },
    daily_loss: { used: "0.63", limit: "20" },
    drawdown: { used: "3.20", limit: "25" },
    in_play: { positions: 1, cost: "3.10", live_mark_total: "2.64", marked: 1, unmarked: 0,
      last_live_update_at: at(-0.3), live_state_at: at(-0.3), at: at(-0.2), basis: "reporting only" },
    in_play_trading: {
      ...ip, strategy: "inplay-maker-v2", strategy_at_tick: "inplay-maker-v2", enabled: true,
      active: true, outcome: "traded", feed_available: true, feed_healthy: true,
      feed_subscriptions: 14, legs_in_play: 6, cooldowns_active: 1, fixtures_cooling: 1,
      global_cooldown: false, feed_gaps: { feed_wide: 0, one_match: 2, unmapped: 0 },
      orders_open: 1, candidates: 6, skipped: 5, refused: 1, order_failed: 0,
      skips_by_reason_last_tick: { inplay_cooldown: 2, inplay_momentum_against: 2, inplay_too_late: 1 },
      refusals_by_reason_last_tick: { per_match_cap: 1 },
      by_competition: BY_COMP_INPLAY, placed_today: 2, cancelled_today: 1,
      shocks_today: { goal: 3, red_card: 1, price_jump: 2 },
      pnl: { settled: "0.84", cost: "6.20", share_of_agent_pnl: "−133%", basis: "in-play legs" },
      at: at(-0.2),
      v2: { ...(ip.v2 as Obj), strategy: "inplay-maker-v2", enabled: true, active: true,
        skipped_by_reason_today: { inplay_live_signals_unreadable: 37, inplay_cooldown: 22,
          inplay_too_late: 9, inplay_momentum_against: 6 },
        refused_by_reason_today: { per_match_cap: 2, inplay_edge_below_min: 1 },
        informed_available_legs: 3, w_mean: "0.4", entries_placed_today: 2,
        entries_cancelled_today: 1, exits_placed_today: 1, protective_exits_placed_today: 1,
        protective_exits_refused_today: 0, protective_exits_cancelled_today: 0,
        marks_today: 5, inplay_clv_rewards: 4, mean_inplay_clv_c: 0.62,
        exit_rewards: 1, mean_exit_reward_c: -0.5, pnl_rewards: 2, at: at(-0.2),
        arms_in_use: { at: at(-0.2), entry: { mls: { "0.5/0.03": 2 } }, exit: { mls: { "0.2/0.02": 1 } },
          anchor: { mls: { "0.5 (ratings_club)": 2 } } } },
    },
    learning: {
      label: "experimental, unproven", enabled: true, strategy: "model-blend-bandit-v2.1",
      trades_by_competition: { epl: 9, laliga: 4, mls: 6, unl: 1 },
      fills_rewarded_by_competition: { epl: 7, laliga: 3, mls: 5 },
      mean_clv_c: 0.44, mean_clv_c_by_competition: { epl: 0.81, laliga: -0.12, mls: 0.31 },
      best_arm_by_competition: { epl: { w: "0.5", threshold: "0.03", posterior_mean_c: 0.71, evidence: 2.1 } },
      default_arm: { w: "0.5", threshold: "0.02" },
      reward_basis: "CLV in cents per contract after fees",
      model_priced_fixtures: 18, model_priced_markets: 54, model_only_markets: 6, candidates: 41,
      ratings_model: { priced_markets: 12, priced_fixtures: 4, version: "ratings-v1", label: "unvalidated" },
      arms_in_use: { at: at(-0.2), pre_match: { epl: { "0.75/0.01": 4, "0.5/0.02": 1 }, unl: { "0.25/0.005": 2 } } },
      competitions: [...FOCUS_COMPETITIONS], at: at(-0.2),
    },
    news_guard: { enabled: true, label: "experimental, unproven", version: "news-guard-v1",
      matches_checked: 22, matches_held: 1, markets_skipped: 4, orders_withdrawn: 0,
      cancelled_today: {}, skips_begun_today: { news_since_consensus: 2, market_moved_since_consensus: 3 },
      at: at(-0.2) },
    anomaly_avoid: { label: "experimental, unvalidated", version: "anomaly-v1", threshold: 0.8,
      threshold_at_tick: 0.8, wording: "An anomaly in public prices and results; public data cannot show that a match was fixed.",
      pre_match: { assessed: 22, avoided: 0 }, in_play: { assessed: 6, avoided: 0 },
      skipped_today: 0, cancelled_today: 0, at: at(-0.2) },
    handover: { label: "experimental, unproven", outcome: "ok", handed_over_contracts: 3,
      managed_contracts: 9, manual_contracts: 8, managed_markets: 2, handed_markets: 1,
      clips: 0, clips_pending: 0, settlement_pending: 0, vanished_ambiguous: 0,
      risk_lowering_closes_today: 1, at: at(-0.2), basis: "counts only" },
    settlement_reads: { window_ticks: 240, window_since: at(-60), due: 30, asked: 12,
      settled: 2, not_listed: 9, unknown_result: 0, refused: 1,
      passes: { nothing_held: 200, read: 40 },
      latest: { outcome: "read", due: 3, asked: 2, settled: 1, not_listed: 1, unknown_result: 0, refused: 0, at: at(-0.2) },
      settled_rows_today: 2, basis: "the RESULT only" },
    fill_reads: { total: 41, today: 3, unreadable: 0, unreadable_today: 0,
      by_terms_basis: { venue: 40, own_order_unreadable: 1 }, by_direction_basis: { outcome_side: 41 },
      legacy_words_disagreed: 0 },
    journal_retention: { label: "experimental", version: "retention-v1", mode: "on", keep_days: 30,
      cutoff: at(-43200), rows_env: 182_344, rows_all: 190_112, rows_yesterday: 9_812,
      last_run: { at: at(-300), pruned: 1_204, outcome: "ok" } },
    last_tick: { at: at(-0.13), outcome: "traded", elapsed_s: 2.4, schedule: null, truncated: false, shed: {} },
    today: {
      by_kind: { tick: 3120, skipped: 214, refused: 3, placed: 4, fill_observed: 3, cancelled: 2, shock: 6 },
      by_reason: {
        tick: { traded: 3001, reconcile_failed: 2, ok: 117 },
        skipped: { no_edge: 96, outside_window: 44, stale_consensus: 21, market_moved_since_consensus: 14,
          no_bid_this_side: 12, inplay_cooldown: 11, order_already_resting: 9, no_learning_context: 7 },
        refused: { per_match_cap: 2, daily_budget_exhausted: 1 },
        shock: { goal: 3, red_card: 1, price_jump: 2 },
      },
    },
    universe: { version: "universe-v1", known: 1820, known_by_category: { soccer: 1820 },
      in_scope: 410, priced: 230, eligible: 61,
      refusals_by_reason: { no_fair_price: 120, stale_book: 29, fixture_unmapped: 60, kickoff_unknown: 3 },
      fixture_unmapped_by_why: { no_espn_event: 52, ambiguous_teams: 8 },
      no_fair_price_by_why: { no_model: 96, no_consensus: 24 },
      catalogue: { rows: 14552, max_rows: 50000, last_full_refresh_at: at(-55) } },
    universe_at: at(-0.2), generated_at: at(0),
    ...over,
  };
}

/** A WARNING DAY: an operator kill in force, the feed unhealthy, a
 *  settlement unclear, a fill unreadable, edges above the ceiling and the
 *  budget nearly spent. Every one of them a field the backend sends. */
export function qaStatusWarning(): Obj {
  const s = qaStatus();
  const ip = s.in_play_trading as Obj;
  return {
    ...s, kill: true, kill_until: at(42),
    daily_budget: { ...(s.daily_budget as Obj), used: "18.90", remaining: "1.10", refused_today: 4 },
    daily_loss: { used: "16.40", limit: "20" }, drawdown: { used: "21.00", limit: "25" },
    total_at_risk: "31.50",
    in_play_trading: { ...ip, feed_healthy: false, global_cooldown: true, cooldowns_active: 3 },
    settlement_reads: { ...(s.settlement_reads as Obj), unknown_result: 2 },
    fill_reads: { ...(s.fill_reads as Obj), unreadable: 2, unreadable_today: 1 },
    careful: { ...CAREFUL, tick: { ...(CAREFUL.tick as Obj), data_errors: 3 } },
    last_tick: { at: at(-4.2), outcome: "reconcile_failed", elapsed_s: 9.8, schedule: null, truncated: false,
      shed: { universe: 9120 } },
    learning: { error: "OperationalError" },
  };
}

export const qaStatusWithCareful = (over: Obj = {}) => qaStatus({ careful: CAREFUL, ...over });

// ----------------------------------------------------------- candidates

const decision = (o: Obj) => ({ action: "skipped", side: null, price_cents: null, count: null,
  reason: null, detail: null, words: null, ...o });

interface Spec {
  comp: string; home: string; away: string; out: string; fam: string; ko: number;
  pm: number | null; pc: number | null; d: Obj; minute?: number; inplay?: Obj;
}
const SPECS: Spec[] = [
  { comp: "epl", home: "Arsenal", away: "West Ham", out: "Arsenal", fam: "GAME", ko: 95, pm: 0.54, pc: 0.51,
    d: decision({ action: "placed", side: "yes", price_cents: 48, count: 4, words: "Placed: a resting maker order went to Kalshi." }) },
  { comp: "epl", home: "Arsenal", away: "West Ham", out: "over 2.5 goals", fam: "TOTAL", ko: 95, pm: 0.58, pc: 0.57,
    d: decision({ reason: "no_edge", words: "Neither side clears the bar: fair minus the price we would bid minus the fee is under the threshold." }) },
  { comp: "epl", home: "Brighton & Hove Albion", away: "Wolverhampton Wanderers", out: "Brighton & Hove Albion to win in regulation time", fam: "GAME", ko: 160, pm: 0.47, pc: 0.49,
    d: decision({ reason: "market_moved_since_consensus", words: "Kalshi's price for this match moved 4c or more since the bookmaker odds we price on. Held back until fresher odds." }) },
  { comp: "epl", home: "Newcastle", away: "Everton", out: "Tie", fam: "GAME", ko: 170, pm: 0.24, pc: 0.26,
    d: decision({ reason: "no_edge", words: "Neither side clears the bar: fair minus the price we would bid minus the fee is under the threshold." }) },
  { comp: "laliga", home: "Real Madrid", away: "Barcelona", out: "over 2.5", fam: "TOTAL", ko: 140, pm: null, pc: 0.602,
    d: decision({ reason: "no_edge", detail: "no side >= 0.02", words: "Neither side clears the bar: fair minus the price we would bid minus the fee is under the threshold." }) },
  { comp: "laliga", home: "Real Madrid", away: "Barcelona", out: "Real Madrid", fam: "GAME", ko: 140, pm: 0.46, pc: 0.44,
    d: decision({ action: "placed", side: "yes", price_cents: 41, count: 6, words: "Placed: a resting maker order went to Kalshi." }) },
  { comp: "laliga", home: "Sevilla", away: "Villarreal", out: "both teams to score", fam: "BTTS", ko: 210, pm: 0.55, pc: 0.53,
    d: decision({ reason: "outside_window", words: "Outside the trading window (180 to 10 minutes before kickoff)." }) },
  { comp: "mls", home: "LAFC", away: "Seattle", out: "LAFC", fam: "GAME", ko: 170, pm: 0.48, pc: null,
    d: decision({ side: "no", reason: "stale_consensus" }) },
  { comp: "mls", home: "Chicago", away: "Vancouver", out: "Vancouver", fam: "GAME", ko: -63, pm: null, pc: null, minute: 63,
    inplay: { minute: 63, period: "2H", momentum: [0.12, 0.39], xg15: [0.21, 0.64], p_engine: 0.4, p_informed: 0.38,
      informed_source: "b3", mode: "protective_exit", held_side: "yes", hot_yes: true, hot_no: false,
      danger_yes: 0.22, danger_no: 0.08, anchor: { w: 0.5, source: "ratings_club", why: null } },
    d: decision({ action: "placed", side: "no", price_cents: 31, count: 2, words: "protective exit: HOT against the held YES" }) },
  { comp: "mls", home: "Austin", away: "Dallas", out: "Austin", fam: "GAME", ko: -38, pm: null, pc: null, minute: 38,
    inplay: { minute: 38, period: "1H", momentum: [0.3, 0.1], xg15: [0.4, 0.1], p_engine: 0.52, p_informed: 0.5 },
    d: decision({ reason: "inplay_cooldown", words: "A shock cool-down holds (a price jump, a goal, a red card)." }) },
  { comp: "mls", home: "Inter Miami", away: "Orlando City", out: "Inter Miami", fam: "GAME", ko: 120, pm: 0.57, pc: 0.55,
    d: decision({ action: "refused", side: "yes", reason: "per_match_cap" }) },
  { comp: "bundesliga", home: "Bayern", away: "Dortmund", out: "Bayern", fam: "GAME", ko: 150, pm: null, pc: null,
    d: decision({ action: "not_eligible", reason: "no_fair_price", words: "No bookmaker consensus price, and no fresh price from our model." }) },
  { comp: "bundesliga", home: "Leverkusen", away: "Stuttgart", out: "over 3.5", fam: "TOTAL", ko: 150, pm: null, pc: null,
    d: decision({ action: "not_eligible", reason: "fixture_unmapped", words: "The Kalshi market is not linked to one of our fixtures." }) },
  { comp: "unl", home: "Spain", away: "Portugal", out: "Spain", fam: "GAME", ko: 60, pm: 0.56, pc: 0.55,
    d: decision({ reason: "order_already_resting", words: "Our order already rests on this market." }) },
  { comp: "unl", home: "Netherlands", away: "Germany", out: "Germany", fam: "GAME", ko: 75, pm: 0.36, pc: 0.39,
    d: decision({ action: "error", reason: "exception", detail: "KeyError: 'yes_bid'" }) },
  { comp: "seriea", home: "Inter", away: "Juventus", out: "Inter", fam: "GAME", ko: 130, pm: 0.5, pc: 0.48,
    d: decision({ reason: "no_bid_this_side", words: "The side that would qualify has no bid to step up from." }) },
  { comp: "ligue1", home: "PSG", away: "Marseille", out: "PSG", fam: "GAME", ko: 175, pm: 0.66, pc: 0.67,
    d: decision({ reason: "no_edge", words: "Neither side clears the bar: fair minus the price we would bid minus the fee is under the threshold." }) },
];

export function qaCandidateRows(): Obj[] {
  return SPECS.map((s, i) => {
    const fair = s.pm !== null && s.pc !== null ? (s.pm + s.pc) / 2 : s.pc ?? s.pm ?? (s.inplay ? 0.4 : null);
    const placed = (s.d as Obj).action === "placed";
    const yb = fair === null ? 50 + (i % 9) : Math.round(fair * 100) - (placed ? 6 : 2);
    const ticker = `KX${s.comp.toUpperCase()}${s.fam}-26OCT07SYNTH${String(i).padStart(2, "0")}${s.home.slice(0, 3).toUpperCase()}${s.away.slice(0, 3).toUpperCase()}-${s.out.slice(0, 3).toUpperCase()}`;
    const eY = fair === null ? null : Math.round((fair * 100 - (yb + 1) - 0.6) * 100) / 100;
    const eN = fair === null ? null : Math.round(((1 - fair) * 100 - (100 - yb - 2) - 0.6) * 100) / 100;
    return {
      ticker: i === 2 ? `${ticker}-REGULATIONTIMEONLY-SYNTHETICLONGIDENTIFIER` : ticker,
      title: `${s.home} vs ${s.away} — ${s.out}`, competition: s.comp, family: s.fam,
      phase: s.minute !== undefined ? "in_play" : "pre_match", kickoff_utc: at(s.ko),
      minute: s.minute ?? null, p_model: s.pm, p_consensus: s.pc,
      w: s.pm !== null && s.pc !== null ? 0.5 : s.pm !== null ? 1 : 0, fair, fair_method: s.pm !== null && s.pc !== null ? "blend" : s.pc !== null ? "consensus" : s.inplay ? "inplay_v2" : null,
      yes_bid: yb, yes_ask: yb + 3, no_bid: 100 - yb - 3, no_ask: 100 - yb,
      maker_yes: fair === null ? null : yb + 1, maker_no: fair === null ? null : 100 - yb - 2,
      edge_yes: eY, edge_no: eN, edge_basis: "maker", threshold: s.comp === "mls" ? 3 : 2,
      inplay: s.inplay ?? null, decision: s.d, minutes_to_kickoff: s.minute !== undefined ? null : s.ko,
      careful: i % 4 === 0 ? { score: 3, size: i === 0 ? 1 : 0, ground: "family:GAME", data_error: false } : null,
    };
  });
}

export function qaCandidates(over: Obj = {}): Obj {
  const rows = qaCandidateRows();
  return {
    version: "trading-candidates-v1", label: "experimental, unproven", env: "prod",
    generated_at: at(0), source: "process", tick_id: "tick-qa", tick_at: at(-0.13),
    age_s: 8, stale: false, complete: true, outcome: "traded", considered: 212, decided: 41,
    shown: rows.length, served: rows.length,
    omitted: { outside_window: 120, market_not_trading: 34, not_in_trading_scope: 17 }, not_served: 0,
    by_competition: Object.fromEntries(FOCUS_COMPETITIONS.map((c) => {
      const mine = rows.filter((r) => r.competition === c);
      return [c, { in_scope: true, assessed: mine.length * 7, eligible: mine.length * 2, in_window_held_back: 0,
        in_play_markets: mine.filter((r) => r.phase === "in_play").length, decided: mine.length,
        model_priced: mine.filter((r) => r.p_model !== null).length,
        placed: mine.filter((r) => (r.decision as Obj).action === "placed").length }];
    })),
    arms_in_use: {}, rows,
    actions: {
      placed: "an order the venue accepted this tick",
      failed: "an approved order the order path could not place",
      refused: "the risk engine refused the strategy's intent",
      error: "one market raised; the tick went on without it",
      proposed: "proposed, and nothing more was recorded about it",
      skipped: "the strategy considered the market and declined it",
      not_run: "the strategy could not run on this tick (a halt, the kill switch, a failed account read, no live feed)",
      not_eligible: "the catalogue held the market back before any strategy saw it",
    },
    units: { probabilities: "0..1, the YES side", prices: "cents", edges: "cents a contract after the maker fee", threshold: "cents" },
    ...over,
  };
}

// ----------------------------------------------------------------- book

const MARK_SOURCES = {
  feed: "in play: the running in-play WebSocket feed's best bid of the held side",
  live_book: "in play: the live Kalshi book the agent's live tracking read",
  book: "before kickoff: the catalogue's order book bid",
  listing: "before kickoff: the catalogue's listing bid",
  none: "no live price: in play with no vouched feed book and no live read",
};

export function qaBook(): Obj {
  const pos = (o: Obj) => ({ competition: "epl", kickoff_utc: at(95), in_play: false, side: "yes",
    contracts: 4, own: 0, handed_over: 0, managed: 0, manual: 0, avg_cost_cents: 48, mark_cents: 49,
    at_risk_dollars: "1.92", live_mark_cents: 49, live_value_dollars: "1.96", unrealised_pl_dollars: "0.04",
    mark_source: "book", ...o });
  return {
    ...BOOK_RECORDED, version: "trading-book-v1", generated_at: at(0), account_read_at: at(-0.2),
    mark_sources: MARK_SOURCES,
    positions: [
      pos({ ticker: "KXEPLGAME-26OCT07SYNTH00ARSWHU-ARS", title: "Arsenal vs West Ham — Arsenal", own: 4, managed: 4 }),
      pos({ ticker: "KXLALIGAGAME-26OCT07SYNTH05REABAR-REA", title: "Real Madrid vs Barcelona — Real Madrid",
        competition: "laliga", kickoff_utc: at(140), contracts: 9, own: 6, handed_over: 3, managed: 9,
        avg_cost_cents: 41.5, mark_cents: 43, at_risk_dollars: "3.74", live_mark_cents: 43,
        live_value_dollars: "3.87", unrealised_pl_dollars: "0.13" }),
      pos({ ticker: "KXMLSGAME-26OCT07SYNTH08CHIVAN-VAN", title: "Chicago vs Vancouver — Vancouver",
        competition: "mls", in_play: true, kickoff_utc: at(-63), side: "yes", contracts: 10, own: 10, managed: 10,
        avg_cost_cents: 31, mark_cents: 30, at_risk_dollars: "3.10", live_mark_cents: 26.4,
        live_value_dollars: "2.64", unrealised_pl_dollars: "-0.46", mark_source: "feed" }),
      pos({ ticker: "KXUNLGAME-26OCT07SYNTH13SPAPOR-SPA", title: "Spain vs Portugal — Spain",
        competition: "unl", kickoff_utc: at(60), contracts: 5, manual: 5, avg_cost_cents: 54,
        at_risk_dollars: "2.70", live_mark_cents: 55, live_value_dollars: "2.75", unrealised_pl_dollars: "0.05" }),
      pos({ ticker: "KXMLSGAME-26OCT07SYNTH10AUSDAL-AUS", title: "Austin vs Dallas — Austin",
        competition: "mls", in_play: true, kickoff_utc: at(-38), contracts: 3, manual: 3, avg_cost_cents: 50,
        at_risk_dollars: "1.50", live_mark_cents: null, live_value_dollars: null, unrealised_pl_dollars: null, mark_source: null }),
    ],
    orders: [
      { order_id: "ord-qa-7f3a91c2-4be1-4e0a-9d3c-1a2b3c4d5e6f", ticker: "KXEPLGAME-26OCT07SYNTH00ARSWHU-ARS",
        title: "Arsenal vs West Ham — Arsenal", competition: "epl", side: "yes", price_cents: 48, remaining: 2,
        owner: "trader", expires_utc: at(85) },
      { order_id: "ord-qa-2", ticker: "KXUNLGAME-26OCT07SYNTH13SPAPOR-SPA", title: "Spain vs Portugal — Spain",
        competition: "unl", side: "no", price_cents: 44, remaining: 1, owner: "other", expires_utc: null },
    ],
    pending_handovers: [
      { ticker: "KXUNLGAME-26OCT07SYNTH13SPAPOR-SPA", side: "yes", count: 2, requested_at: at(-3), status: "queued", reason: null },
    ],
    totals: { positions: 5, orders: 2, managed_contracts: 23, manual_contracts: 8,
      not_listed_positions: 1, not_listed_orders: 0 },
  };
}

export const EMPTY_BOOK = {
  version: "trading-book-v1", generated_at: at(0), account_read_at: at(-0.2), positions: [], orders: [],
  totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
};

export const qaLedger = (): Obj => LEDGER_RECORDED as unknown as Obj;

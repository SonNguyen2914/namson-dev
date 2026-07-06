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

export interface PredictionResponse {
  freshness: "cached" | "fresh";
  match_id: string;
  generated_at: string;
  age_seconds: number;
  is_stale: boolean;
  is_final: boolean;
  source: string;
  confidence: number;
  xg: { home: number; away: number };
  scorelines: { score: string; prob: number }[];
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
  red_home: boolean;
  red_away: boolean;
  attack_home_mult: number;
  attack_away_mult: number;
}

export interface LiveMarketRow {
  market_id: string;
  market_title: string;
  outcome_key: string | null;
  kalshi_odds: number;
  market_probability: number;
  live_model_probability: number;
  difference: number;
  volume_24h: number;
}

export interface LivePredictionResponse {
  match_id: string;
  teams: { home: string; away: string };
  stage: string;
  live_state: {
    score: string;
    minutes_elapsed: number;
    minutes_remaining: number;
    red_home: boolean;
    red_away: boolean;
    lambda_remaining: { home: number; away: number };
  };
  live_outcomes: { home_win: number; draw: number; away_win: number };
  live_advance: {
    home: number; away: number;
    p_reach_et: number; p_reach_pens: number; method: string;
  } | null;
  live_confidence: number;
  user_attack_levers: { home: number; away: number };
  markets: LiveMarketRow[];
  generated_at: string;
  disclaimer: string;
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
};

// -- formatting helpers -------------------------------------------------
export const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
export const signedPct = (x: number) =>
  `${x >= 0 ? "+" : ""}${(x * 100).toFixed(1)}%`;
export const money = (x: number) => `${x >= 0 ? "+" : "−"}$${Math.abs(x).toFixed(2)}`;

export function countdown(seconds: number): string {
  if (seconds <= 0) return "kicked off";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

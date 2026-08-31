// The picker board — types and one fetch, mirroring GET /api/picker/board.
//
// WHAT THIS SURFACE IS. src/picker ranks upcoming fixtures by the size of
// the measured table gap between the two clubs, annotates each with
// within-league quintile tiers, and hands the list over. It RANKS, NEVER
// CUTS: there is no qualifying bar in the backend and none may be added
// here. Stage 2's tiers and shape label, and the Kalshi quote, ANNOTATE —
// they never veto a row. So nothing in this module filters, and the only
// ordering it applies is the one the board is defined by.
//
// It is not a signal surface: no model runs on it, no probability of ours
// exists for these fixtures, and no number here is an edge.

export type Src = "current" | "prior";

/** [favourite's tier, opponent's tier]; 1 = best fifth of the league. */
export type TierPair = [number, number];

export type Shape = "CLEAN" | "HOLLOW" | "SPLIT";

export interface KalshiQuote {
  event_ticker: string | null;
  ticker: string | null;
  ask_c: number | null;
  bid_c: number | null;
  spread_c: number | null;
  ask_size: number | null;
  bid_size: number | null;
  flags: string[];
}

export interface BoardRow {
  refused: false;
  league: string;
  home: string;
  away: string;
  favourite: string;
  opponent: string;
  fav_side: "home" | "away";
  resolution: Record<string, string>;
  ppg_gap: number;
  gdg_gap: number;
  rank_gap: number;
  gp_current: { home: number | null; away: number | null; min: number | null };
  src: Src;
  ranks: { fav: number; opp: number };
  tiers: { ovr: TierPair; atk: TierPair; def: TierPair };
  tier_gaps: { ovr: number; atk: number; def: number };
  shape: Shape;
  event_id: string;
  competition_id: string;
  kickoff: string;
  espn: string;
  kalshi: KalshiQuote | null;
}

/** A fixture the picker would not rate, named with the reason. Refusals
 *  are LISTED, never hidden: a fixture that vanishes without a word is
 *  the defect this whole surface is built against. */
export interface BoardRefusal {
  refused: true;
  league: string;
  home: string;
  away: string;
  club: string;
  reason: string;
  event_id?: string;
  kickoff?: string;
}

export interface LeagueMeta {
  src: Src | null;
  min_current_gp: number | null;
  clubs: number;
  /** the league's own upstream failure — it contributes no rows, and the
   *  rest of the board still renders */
  error?: string;
  /** prices are annotation, so a Kalshi failure costs quotes, not rows */
  kalshi_error?: string;
}

export interface Board {
  generated_at: string;
  date: string;
  days: number;
  leagues: Record<string, LeagueMeta>;
  rows: BoardRow[];
  refusals: BoardRefusal[];
}

/** Display names for the four league slugs the picker covers. An unknown
 *  slug renders as itself rather than as a blank — a new league arriving
 *  in the registry must not disappear from the board. */
export const LEAGUE_LABEL: Record<string, string> = {
  epl: "Premier League",
  laliga: "La Liga",
  mls: "MLS",
  ligamx: "Liga MX",
};

export const leagueLabel = (slug: string) => LEAGUE_LABEL[slug] ?? slug;

/** Below this many games played, Stage 1 takes ALL FOUR inputs from last
 *  season instead — this season's table is still noise. Mirrors
 *  src/picker/tables.decide_source; shown to the reader, never used to
 *  decide anything here. */
export const CURRENT_SEASON_GP_FLOOR = 8;

/** Kalshi annotation flags, in the backend's own thresholds. */
export const WIDE_SPREAD_C = 3;    // spread > 3c
export const THIN_ASK_SIZE = 100;  // ask size < 100

export async function fetchBoard(days: number, signal?: AbortSignal): Promise<Board> {
  let r: Response;
  try {
    r = await fetch(`/api/picker/board?days=${days}`, { signal });
  } catch (e) {
    // An abort is the caller's own cancellation — rethrow it untouched so
    // the caller's signal guard can screen it. Anything else is the
    // browser's raw network failure ("Failed to fetch", "Load failed"…),
    // which is debugging vocabulary, not a message: name the situation.
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new Error(
      "the request never reached the server — check the connection and try again");
  }
  if (!r.ok) {
    // Carry the backend's own words forward. A named 503 ("picker board
    // unavailable") tells the reader something a generic "failed to
    // load" does not.
    let detail = "";
    try {
      const body = await r.json();
      detail = body?.detail || body?.error || "";
    } catch { /* non-JSON body; the status is all we have */ }
    throw new Error(detail || `board request failed (${r.status})`);
  }
  return r.json();
}

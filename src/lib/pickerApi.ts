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

/** How much of a club's rating came from THIS season.
 *
 *  The board no longer switches between two seasons at a threshold — it
 *  BLENDS them per club by that club's own games played,
 *  w_current = GP/(GP+k) with k = 10 (backend ledger row 25). So "which
 *  season" stopped being a yes/no, and `src` survives only as the
 *  rounding of this number that older readers understand.
 *
 *  THE WEIGHT IS THE TRUTH: a row that reports 0.375 can say "38% this
 *  season", which a badge cannot. `null` means no blend ran at all
 *  (a read reconstructed through the legacy switch) — which is a
 *  different fact from a weight of zero, and must not render alike. */
export interface BlendWeights {
  home: number | null;
  away: number | null;
  /** the fixture's own weight: a match is only as current-season as its
   *  less-played club */
  min: number | null;
  k: number;
  /** set only under the frozen-weight research control */
  constant: number | null;
  basis: {
    home: BlendBasis | null;
    away: BlendBasis | null;
  };
}

/** "blend" — both seasons; "current_only" — no prior row at all, and
 *  enough games played to be rated without one (weight reported as 1);
 *  "prior_only" — no games played yet, so there is nothing to weight. */
export type BlendBasis = "blend" | "current_only" | "prior_only";

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
  /** WHICH COMPETITION this fixture is: a league slug or a cup slug. */
  league: string;
  /** WHICH COLUMN it renders in. Equal to `league` for a league fixture;
   *  for a cup fixture whose two clubs share a league it is THAT league,
   *  because that league's table describes the fixture completely and it
   *  belongs beside its own table rather than in a column of its own.
   *  A cross-league cup fixture keeps the cup slug — its gaps are
   *  withheld exactly because neither table can host it. Optional so an
   *  older payload still renders. */
  column?: string;
  /** Last-≤5 results per side — "WDLWW", oldest→newest, each club's own
   *  perspective, derived server-side from a past scoreboard sweep.
   *  null/absent when the sweep knows nothing of the club (early
   *  season, new competition) — a blank is a fact, not an empty
   *  string, and an older payload simply has no strips. */
  form?: { fav?: string | null; opp?: string | null } | null;
  home: string;
  away: string;
  favourite: string;
  opponent: string;
  fav_side: "home" | "away";
  resolution: Record<string, string>;
  /** NULL on a cross-league cup fixture: the two clubs were rated in
   *  different competitions and their rates were never on one scale, so
   *  the difference was never measured. `gap_note` says so in words.
   *  Missing is NOT zero — see lib/pickerSort.ts. */
  ppg_gap: number | null;
  gdg_gap: number | null;
  rank_gap: number | null;
  gp_current: { home: number | null; away: number | null; min: number | null };
  /** the per-club season weights; null on a row built before the blend
   *  (or by the legacy switch) */
  weights?: BlendWeights | null;
  /** true when the two clubs were rated in different leagues */
  cross_league?: boolean;
  /** which league's table each club was rated on */
  rated_in?: { home: string; away: string };
  /** why the Stage-1 gaps are withheld, in the backend's own words */
  gap_note?: string | null;
  /** what the market actually settles on, when that is not the match —
   *  the Leagues Cup legs are regulation time only */
  reg_time_note?: string | null;
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
  /** see BoardRow.column */
  column?: string;
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
  /** "league" — has a table of its own; "cup" — a tournament that has
   *  none, whose clubs are rated on their domestic leagues' tables */
  kind?: "league" | "cup";
  /** for a cup: the league slugs its clubs were rated on */
  rated_on?: string[];
  /** for a cup whose market does not settle the match outright */
  reg_time_note?: string | null;
  /** the blend's shrinkage constant, as the backend ran it */
  blend_k?: number | null;
  /** set only under the frozen-weight research control */
  blend_constant_w?: number | null;
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
  leaguescup: "Leagues Cup",
};

export const leagueLabel = (slug: string) => LEAGUE_LABEL[slug] ?? slug;

/** Where a card goes when opened. The four leagues have a match hub at
 *  /bet-suggester/<slug>/<event_id>; a cup does not — there is no hub
 *  page for `leaguescup` and the backend serves no per-match route for
 *  it — so its card opens the competition page that already exists.
 *  Keyed by the picker's column slug; the value is the comp viewer's
 *  key. A cup slug missing from this map would fall through to the hub
 *  pattern and land on the site's 404, which is exactly how a Leagues
 *  Cup card on the landing page failed on 2026-09-03. */
export const CUP_COMP_KEY: Record<string, string> = {
  leaguescup: "leagues-cup",
};

export const rowHref = (row: { league: string; event_id: string }) => {
  const comp = CUP_COMP_KEY[row.league];
  return comp
    ? `/bet-suggester/comp/${comp}`
    : `/bet-suggester/${row.league}/${row.event_id}`;
};

/** The board's fixed column order. A slug the payload serves that is not
 *  in this list still gets a column, appended after these four — a new
 *  league arriving in the registry must not disappear from the board. */
export const PICKER_LEAGUE_ORDER = ["mls", "epl", "laliga", "ligamx"];

/** The blend's shrinkage constant: w_current = GP/(GP+k). At GP = k a
 *  club is rated half on each season, so k is also the games-played
 *  count at which this season becomes the majority partner. Mirrors
 *  src/picker/tables.SEASON_BLEND_K; shown to the reader, never used to
 *  decide anything here — every row carries the weight the backend
 *  actually used, including under a research override. */
export const SEASON_BLEND_K = 10;

/** A weight as the sentence the board should say. "38% this season" is
 *  a thing a reader can act on; a badge reading "prior szn" is not. */
export const pctThisSeason = (w: number | null | undefined) =>
  w == null ? "—" : `${Math.round(w * 100)}%`;

/** The board's own reading of a weight: at or above half, this season is
 *  the majority partner. Mirrors src/picker/tables.weight_src. */
export const weightIsCurrent = (w: number | null | undefined) =>
  w != null && w >= 0.5;

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

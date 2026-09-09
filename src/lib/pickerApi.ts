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

/** How the three shapes ORDER, declared beside the type they order so
 *  the two cannot drift apart. CLEAN is a gap the tiers back on all
 *  three dimensions and HOLLOW is one they do not back at all, so this
 *  is "how well backed", descending.
 *
 *  It is `Record<Shape, number>` on purpose: a value added to `Shape`
 *  fails the BUILD here rather than falling through a `??` in
 *  lib/pickerSort.ts into the bucket that means "this row has no
 *  shape". A shape the board has never heard of is not a row without
 *  one, and the sort control says so in words when such a row is
 *  actually on the board. */
export const SHAPE_ORDER: Record<Shape, number> = {
  CLEAN: 2, SPLIT: 1, HOLLOW: 0,
};

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

/** THE VENUE-AWARE FAVOURITE — what a rule the board does not act on
 *  WOULD say, carried on every rated row so its disagreement with the
 *  table is countable BEFORE anyone turns it on (backend
 *  src/picker/stages.venue_verdict, 2026-09-03).
 *
 *  The rule is "the ground is worth more than THIS MUCH table gap": if
 *  the side that is genuinely at home is not the table's favourite, and
 *  the gap between them is smaller than a bar derived from the league's
 *  own goals per game, the venue names the home side instead.
 *
 *  IT IS A UNION, NOT AN OPTIONAL BAG, because the backend emits two
 *  genuinely different shapes and folding them into one would let a
 *  reader ask a refusal for its threshold and get `undefined` — a
 *  missing read wearing the clothes of a measured one.
 *
 *    refused: true   a NAMED refusal. `reason` is one of
 *                    no_venue_class / venue_unknown /
 *                    venue_class_unrecognised / no_gdg_gap /
 *                    no_league_gpg / no_threshold. The six verdict
 *                    sub-keys are ABSENT BY CONSTRUCTION, not null —
 *                    e.g. every cross-league cup row refuses with
 *                    `no_gdg_gap`, since the gap the venue would be
 *                    weighed against was itself withheld.
 *    refused: false  a verdict, naming the club, the inputs it used and
 *                    which of the four rules produced it.
 *
 *  `agrees` is about the CLUBS — did the venue reach the same favourite
 *  as the table. `flipped` is about THIS ROW — did the policy actually
 *  move it, which requires the policy to be on. The two are different
 *  questions and the row answers both. */
export type VenueFavourite =
  | {
      refused: true;
      reason: string;
      policy: "on" | "off";
      flipped: false;
      /** present once the class was read; absent when it never was */
      venue_class?: string;
      home_side?: "home" | "away" | null;
    }
  | {
      refused: false;
      venue_class: string;
      /** null on a class where nobody is home (NEUTRAL) */
      home_side: "home" | "away" | null;
      gdg_gap_abs: number;
      threshold: number;
      /** "derived" from the league's goals per game, or "override" */
      threshold_source: string;
      policy: "on" | "off";
      favourite: string;
      side: "home" | "away";
      agrees: boolean;
      /** no_home_side / favourite_already_at_home /
       *  venue_outweighs_table_gap / table_gap_beats_venue */
      reason: string;
      flipped: boolean;
    };

/** THE ONE THING THIS ANNOTATION IS FOR: the rows where the venue rule
 *  and the table name DIFFERENT clubs. Returns the verdict only when it
 *  is a real disagreement — a refusal is not one, and neither is a
 *  verdict that agrees.
 *
 *  A guard on the board reads this and an agreeing row carries no
 *  attribute at all, the same contract `seasonDeparture` keeps: the
 *  derivation outlives the ink, and an ordinary row asserts nothing. */
export function venueDisagreement(row: BoardRow):
    Extract<VenueFavourite, { refused: false }> | null {
  const v = row.venue_favourite;
  if (!v || v.refused !== false || v.agrees) return null;
  return v;
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
  form?: { fav?: string | null; opp?: string | null;
           /** The competition these results were swept from. The sweep is
            *  per COLUMN, so a cup row's WWWW is its cup run — not the
            *  club's league form. */
           scope?: string; scope_is_cup?: boolean } | null;
  home: string;
  away: string;
  favourite: string;
  opponent: string;
  fav_side: "home" | "away";
  /** What THIS SEASON ALONE says, at w=1.0. Annotation, never a second
   *  verdict — the board still ranks on the blend. It exists so a reader
   *  can see that a choice was made: at 6 games played the table is
   *  62.5% LAST season, and on 2026-09-02 the two Leagues Cup semis
   *  ordered one way on the blend and the other way on this season. */
  current_only?: { ppg_gap?: number | null; gdg_gap?: number | null;
                   rank_gap?: number | null } | null;
  venue?: { name?: string | null; city?: string | null;
            country?: string | null } | null;
  /** Whether this venue is anybody's home ground — see the backend's
   *  picker/board.venue_class. DOMESTIC trusts the provider's label;
   *  NEUTRAL means nobody is home; TRUE_HOME / OPPONENT_COUNTRY name
   *  which side actually is, whatever the label says; UNKNOWN refuses. */
  venue_class?: { class: "DOMESTIC" | "NEUTRAL" | "TRUE_HOME"
                       | "OPPONENT_COUNTRY" | "UNKNOWN";
                  home_side: "home" | "away" | null } | null;
  /** WHAT A VENUE-AWARE RULE WOULD SAY ABOUT THIS FIXTURE, and what
   *  actually named the favourite above. Both ride EVERY rated row
   *  (backend src/picker/stages.py, 2026-09-03); see VenueFavourite. */
  venue_favourite?: VenueFavourite | null;
  /** "rank" — the derived whole-league position named the favourite,
   *  which is every row on the board today; "venue" — the venue rule
   *  did, which happens only with PICKER_VENUE_FAVOURITE on. It is not
   *  cosmetic: under "venue" every signed field on this row is oriented
   *  to a side the table rates LOWER, so a negative rank_gap is the row
   *  saying exactly that rather than a sign bug. */
  fav_source?: "rank" | "venue";
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
  /** for a cup where a member league DID NOT BUILD: the members that
   *  actually carry the column, and why the others did not. Both are
   *  ABSENT — not empty — on a healthy column, so "this competition has
   *  no clubs from that league" stays distinguishable from "that
   *  league's table failed to load". `rated_on` remains the spec and
   *  never shrinks; these two say what the spec got. */
  rated_on_built?: string[];
  member_errors?: Record<string, string>;
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
  // The Champions League and the five domestic tables its entrants are
  // rated in (2026-09-08). Those five serve no page of their own — they
  // exist so a UCL club has a real ppg, GD/g, rank and tier — but their
  // names are still printed, on the cup column's "rated on" chip and
  // wherever a row says which table it was rated in. Without an entry
  // here `leagueLabel` falls through to the slug, and the chip would
  // read "bundesliga + seriea + ligue1".
  bundesliga: "Bundesliga",
  seriea: "Serie A",
  ligue1: "Ligue 1",
  eredivisie: "Eredivisie",
  primeiraliga: "Primeira Liga",
  // Added 2026-09-08 with the Champions League's last two rateable
  // member tables. ESPN carries no Czech, Ukrainian, Slovak or
  // Azerbaijani league at all, so those four entrants stay refused by
  // name rather than rated on a guess.
  superlig: "Süper Lig",
  eliteserien: "Eliteserien",
  ucl: "Champions League",
};

/** THE BADGE BESIDE THE FAVOURITE, and what it is allowed to claim.
 *
 *  It used to be `fav_side === "home" ? "H" : "A"`, straight from the
 *  provider's label — which is worthless in the Leagues Cup, where a
 *  "home" fixture is routinely staged in the opponent's country. On
 *  2026-09-02 both semi-finals were Liga MX clubs at US grounds and both
 *  cards printed H.
 *
 *  So the badge now answers a question it can actually support: is the
 *  FAVOURITE at home AT THIS VENUE? "N" when the ground is nobody's,
 *  and nothing at all when the venue is unknown — an absent badge is a
 *  fact, and a wrong one costs 285 rating points of read. */
export function homeBadge(row: BoardRow):
    { text: string; title: string } | null {
  const vc = row.venue_class;
  const favHome = row.fav_side === "home";
  const where = row.venue?.city ? ` — ${row.venue.city}` : "";

  if (!vc || vc.class === "UNKNOWN") return null;
  if (vc.class === "NEUTRAL") {
    return { text: "N",
      title: `neutral ground: neither club plays in this country${where}` };
  }
  // DOMESTIC trusts the label; the two cross-border classes name the
  // side that is genuinely at home, which may not be the labelled one.
  const favIsHome = vc.class === "DOMESTIC"
    ? favHome
    : (vc.home_side === "home") === favHome;
  return favIsHome
    ? { text: "H", title: `the favourite is at home${where}` }
    : { text: "A", title: `the favourite is away${where}` };
}

/** Does this season alone reach a MATERIALLY different number?
 *
 *  0.25 GD/g is a display threshold, not a finding — it is about a goal
 *  every four games, which is roughly the smallest gap that reorders
 *  adjacent rows on a real board. Below it the two views agree closely
 *  enough that showing both is noise; a SIGN flip always qualifies,
 *  because that is the two cuts disagreeing about who is better. */
export const CURRENT_ONLY_MATERIAL = 0.25;

export function seasonDisagreement(row: BoardRow):
    { blended: number; current: number; delta: number } | null {
  const b = row.gdg_gap, c = row.current_only?.gdg_gap;
  if (typeof b !== "number" || typeof c !== "number") return null;
  const delta = c - b;
  const flips = (b >= 0) !== (c >= 0);
  if (!flips && Math.abs(delta) < CURRENT_ONLY_MATERIAL) return null;
  return { blended: b, current: c, delta };
}

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
  // The Champions League joined the board on 2026-09-08. Its cards would
  // otherwise fall through to the hub pattern and land on the 404 — the
  // failure this map was written for, one competition later.
  ucl: "ucl",
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

/** THE SEASON BASIS AS ONE FACT PER LEAGUE, which is what it is. Every
 *  club in a column blends on the same k, so the clubs differ only by
 *  games played — "how much of this table is this season" is a LEAGUE
 *  fact, said once in the header, not a chip repeated on every row.
 *
 *  A RANGE THAT COLLAPSES AT THE PRECISION IT IS PRINTED IN. The
 *  endpoints are the least- and most-current club in the column, and
 *  there is NO tolerance constant to tune: they collapse exactly when
 *  they round to the same whole percent, so the span can never claim a
 *  spread finer than the ink it is written in.
 *
 *  CUPS ARE EXCLUDED BY CONSTRUCTION. A cup's clubs are rated on their
 *  DOMESTIC tables, so one percentage across that column would be an
 *  average over several leagues — a number belonging to no table.
 *
 *  MISSING IS NEVER ZERO. A row without weights is not counted as 0%,
 *  it is not counted at all; a column with none returns null so the
 *  header stays silent rather than printing "0% this szn". */
export function seasonSpan(
  rows: readonly { weights?: BlendWeights | null }[],
  kind?: "league" | "cup" | null,
): { lo: number; hi: number; clubs: number } | null {
  if (kind === "cup") return null;
  const ws: number[] = [];
  for (const r of rows) {
    const w = r.weights;
    if (!w) continue;
    if (w.home != null) ws.push(w.home);
    if (w.away != null) ws.push(w.away);
  }
  if (!ws.length) return null;
  return { lo: Math.min(...ws), hi: Math.max(...ws), clubs: ws.length };
}

/** The span as the header says it: one percent when the endpoints round
 *  together, `68–72%` when they do not. */
export const seasonSpanLabel = (s: { lo: number; hi: number }) => {
  const lo = pctThisSeason(s.lo), hi = pctThisSeason(s.hi);
  return lo === hi ? lo : `${lo.replace("%", "")}\u2013${hi}`;
};

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
  // A 200 IS NOT A PAYLOAD. `return r.json()` folded three findings
  // into one: a SyntaxError in the browser's own vocabulary for a 204
  // or an upstream HTML error page — which is debugging text, not the
  // named situation this function is careful to give every other
  // failure — and, worse because it does not throw at all, a literal
  // `null` body handed back typed as Board. The caller renders that as
  // the board having nothing on it, which is a claim about the slate
  // made off a read that never landed.
  const raw = await r.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(
      `the server answered ${r.status} with a body that is not JSON `
      + `(${raw.length} characters) — that is an answer we could not `
      + "read, not an empty board");
  }
  if (body === null || typeof body !== "object") {
    throw new Error(
      `the server answered ${r.status} with ${JSON.stringify(body)} `
      + "where a board was expected — there is no payload here, and it "
      + "must not be read as an empty one");
  }
  return body as Board;
}

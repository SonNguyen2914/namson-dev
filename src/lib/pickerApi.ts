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

/** [favourite's own rate, opponent's own rate] — each measured on the
 *  scale of the league that club was rated in, which is why the pair
 *  survives a fixture whose two clubs share no scale. Either side is
 *  null when that club has no row in the table in use: MISSING IS NEVER
 *  ZERO, and a 0.00 ppg would read as a side that lost every game. */
export type RatePair = [number | null, number | null];

/** WHAT A LEAGUE-AVERAGE CLUB OF ONE LEAGUE SCORES AGAINST A
 *  LEAGUE-AVERAGE CLUB OF THE OTHER, in goals (backend
 *  src/picker/league_meeting.py, 2026-09-10).
 *
 *  IT IS A CLAIM ABOUT TWO LEAGUES AND NOT ABOUT THESE TWO CLUBS, which
 *  is the whole reason it can be shown where `gdg_gap` is withheld: the
 *  clubs share no scale, the leagues do. `gd` therefore does NOT always
 *  agree in sign with the row — Como is the field favourite over RB
 *  Leipzig while Serie A sits just under the Bundesliga, so this reads
 *  −0.08 on a row the field signs the other way, and that disagreement
 *  is the block being about what it says it is about.
 *
 *  ABSENT, NEVER NULL, when either league has no measured level. */
export interface LeagueGap {
  gd: number;
  gf: number;
  ga: number;
  basis: string;
  leagues: { fav: string; opp: string };
}

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

/** ONE CLUB ON ONE AXIS OF THE FIELD — its place among the competition's
 *  own entrants rather than among its league's.
 *
 *  `tier` is THE FIRST BAND OF `tier_set`, never the read on its own:
 *  the set is every band this club's 95% interval touches, and a surface
 *  printing the bare number asserts a placement the measurement refuses.
 *  See lib/fieldApi.tierSet, which is the one place that is decided. */
export interface FieldSide {
  rank: number;
  tier: number;
  tier_set: number[];
  straddles: boolean;
  below_floor: boolean;
  /** the backend's own reason the placeability floor refused this club
   *  on the first reading — carried so the dagger that marks it can say
   *  why, in those words */
  floor_note?: string | null;
}

export interface FieldAxis {
  fav: FieldSide;
  opp: FieldSide;
  /** THE BACKEND'S OWN SIGNED TIER GAP for this axis, favourite-signed.
   *  Null means the block came from a source that does not carry one —
   *  see fieldApi.fieldFor — and a null is never differenced into a gap
   *  here. The frontend shows; it does not decide. */
  tier_gap: number | null;
}

/** THE FIELD BLOCK ON A CROSS-LEAGUE RATED ROW (backend, 2026-09-09).
 *
 *  WHAT IT IS FOR. A Champions League tie has two clubs from two
 *  different domestic tables, so the `ranks` and `tiers` below are two
 *  facts about two different ladders: "AS Roma #2 v Fenerbahce #2" is
 *  two league positions printed as though they were one comparison, and
 *  ten of twelve league-phase cards read `1v1` on every axis because a
 *  within-league quintile puts nearly every entrant in its own league's
 *  top fifth. The FIELD is the competition's own N-club ladder, which
 *  both clubs really do stand on, so `#7 v #33` is one sentence.
 *
 *  IT IS DATA, NOT A SECOND DESIGN. The card that draws it is the card
 *  the board draws everywhere else; only the numbers behind the ranks
 *  pair, the rank dumbbell, the tier trio and the shape chip change.
 *
 *  OPTIONAL, AND ABSENT IS NOT EMPTY. A board built before this key
 *  exists carries none, and the card then draws exactly what it drew
 *  before — league ranks and league tiers — rather than a field with
 *  nothing in it. */
export interface RowField {
  competition?: string;
  /** how many clubs the field holds — the N of the 1..N axis every rank
   *  in this block is read on. Never assumed to be 36. */
  size: number;
  axes: { ovr: FieldAxis; atk: FieldAxis; def: FieldAxis };
  /** CLEAN / SPLIT / HOLLOW as the BACKEND reads it on the field's own
   *  tiers. Null when the block came from a source that does not carry
   *  it, and the card then keeps the row's own backend shape — which is
   *  still the backend's word. It is never recomputed here. */
  shape?: Shape | null;
}

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
  /** EACH CLUB'S OWN MEASURED RATES, (favourite, opponent) — ppg, GF/g,
   *  GA/g, GD/g on the scale of the league `rated_in` names. On EVERY
   *  row, because a cup row and a league row are one contract.
   *
   *  These are what a cross-league card has INSTEAD OF gaps, and the
   *  distinction is one word wide: a MEASURED RATE is reported, a
   *  CROSS-SCALE SUBTRACTION is refused. The backend has carried them
   *  since 2026-09-08 and this type did not declare them, so the card
   *  went on printing `n/a` over ppg and GD/g figures that were already
   *  in the payload. Either side may be null — a club with no row in
   *  the table in use — and null is never drawn as 0.00. */
  rates?: { ppg: RatePair; gf: RatePair; ga: RatePair; gdg: RatePair };
  /** THE ONE COMPARISON TWO SCALES DO SUPPORT (backend 2026-09-09).
   *  `rates.gdg` differenced: how much more one club outscores its own
   *  league than the other does theirs.
   *
   *  IT IS NOT `gdg_gap` AND MUST NEVER BE DRAWN AS ONE. That gap says
   *  one club is this many goals a game better than the other, needs
   *  both clubs measured on one scale, and is null across leagues for
   *  exactly that reason. This is a different sentence about the same
   *  two numbers, so it has a different name and carries `basis` — the
   *  backend's own words for what it is and what it is not — which the
   *  card hangs on the anchor it replaces. `diff` is null when either
   *  club's own GD/g is missing; missing is never zero. */
  own_gdg?: { diff: number | null; basis: string } | null;
  /** what the market actually settles on, when that is not the match —
   *  the Leagues Cup legs are regulation time only */
  reg_time_note?: string | null;
  src: Src;
  ranks: { fav: number; opp: number };
  tiers: { ovr: TierPair; atk: TierPair; def: TierPair };
  tier_gaps: { ovr: number; atk: number; def: number };
  shape: Shape;
  /** WHERE THESE TWO CLUBS STAND IN THE COMPETITION'S OWN FIELD — see
   *  RowField. Present only on a cross-league rated row of a competition
   *  somebody has measured a field for; the card reads it in place of
   *  the three keys above and degrades to them when it is absent. */
  field?: RowField | null;
  league_gap?: LeagueGap | null;
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
  /** THE ANSWER TO A QUESTION, NOT A DECLARATION.
   *
   *  Present exactly when the caller named competitions with `?leagues=`
   *  (backend fc9bc55, 2026-09-09); it lists what was ASKED FOR. Absent
   *  on the declared board, and that absence is the sentence "this is
   *  what the board declares".
   *
   *  Nothing may read a payload carrying this as the board's column set
   *  — see `declarationOf`, which is the one place that decision is
   *  made. */
  narrowed_to?: string[] | null;
}

/** THE BOARD'S DECLARATION, OR THE ADMISSION THAT THIS PAYLOAD IS NOT IT.
 *
 *  `Object.keys(board.leagues)` is the operator's `BOARD_COLUMNS` — but
 *  ONLY on a payload nobody narrowed. Ask for the Champions League by
 *  name and the very same key set comes back holding `ucl`, and reading
 *  that as the declaration is how a competition climbs back onto the
 *  landing page. It is exactly the confusion that took the board from
 *  six columns to eleven in production, and that walked a FINISHED
 *  Leagues Cup back on after it had been removed.
 *
 *  So a narrowed payload answers `null` — NOT an empty array, which
 *  would read as "the board declares nothing" and is a different claim.
 *  `null` is "this payload was never asked that question".
 *
 *  ONE DOOR, and it is this function: `boardColumns` is fed from here,
 *  and a narrowed payload can therefore never reach it. */
export function declarationOf(board: Board): string[] | null {
  return board.narrowed_to == null ? Object.keys(board.leagues) : null;
}

/** DID THE BOARD ANSWER THE QUESTION WE ASKED IT?
 *
 *  True only when `narrowed_to` covers every slug asked for. A server
 *  that does not know the parameter — a deploy behind the frontend, a
 *  proxy that drops the query — answers 200 with its DECLARED board,
 *  which carries rows for other competitions and none for this one.
 *  Drawing that as "this competition has no fixtures" is the same
 *  failed-read-rendered-as-zero the whole surface is built against, so
 *  the ask is VERIFIED rather than assumed. */
export function askHonoured(
  board: Board, asked: readonly string[],
): boolean {
  const got = board.narrowed_to;
  return Array.isArray(got) && asked.every((s) => got.includes(s));
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
  // The four ESPN carries no league for at all, added 2026-09-09 from
  // API-Football so the last Champions League entrants could be rated.
  // They shipped WITHOUT these entries and the column's "rated on" chip
  // printed raw slugs at the operator — "CZECHLIGA + UKRPREMIER +
  // SLOVAKSUPERLIGA + AZERPREMYER". Names taken from the backend
  // registry's own `display`, not invented here.
  czechliga: "Czech Liga",
  ukrpremier: "Ukrainian Premier League",
  slovaksuperliga: "Slovak Super Liga",
  azerpremyer: "Premyer Liqa",
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

/** THE LIVE PLANE SPELLS ITS COMPETITIONS DIFFERENTLY, and until
 *  2026-09-09 both live surfaces printed that spelling at the operator.
 *
 *  The picker's slug is a bare league key (`mls`, `laliga`). The live
 *  plane's is a SEASONED, HYPHENATED one — `mls-2026`, `la-liga-2026`,
 *  `liga-mx-2026`, `leagues-cup-2026` (backend src/live/competitions.py)
 *  — and the watched-strip match block carries that slug and no display
 *  name at all. So `WatchedStrip` printed `mls-2026` on the identity
 *  line of EVERY row, and `LiveCard` printed it on any card whose
 *  fixture had left the board, which is the ordinary case for a match
 *  in play: the picker board is pre-kickoff by design.
 *
 *  DERIVED, NOT A SECOND TABLE. A live slug is normalised back to a
 *  picker key — drop a trailing four-digit season, drop the separators
 *  — and looked up in the ONE label table this repo already has. All
 *  five of today's live slugs land on an entry that way, and the next
 *  one that follows the same convention needs no edit here. A slug that
 *  still names nothing is returned UNCHANGED: a wrong name is worse
 *  than a visible key, and the guard in e2e/live-surface-audit.spec.ts
 *  fails on the shape rather than on a list, so a new competition
 *  arrives as a red test and not as a slug on his screen. */
export const liveCompLabel = (slug: string) => {
  if (LEAGUE_LABEL[slug]) return LEAGUE_LABEL[slug];
  const key = slug.replace(/-(?:19|20)\d{2}$/, "").replace(/[-_.]/g, "");
  return LEAGUE_LABEL[key] ?? slug;
};

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

/** THE READING ORDER OF THE COLUMNS THE BOARD DECLARES. It ORDERS; it
 *  never ADMITS.
 *
 *  Every slug here is drawn only if the board's own `leagues` map named
 *  it, and a declared slug this list has never heard of is appended
 *  rather than dropped — so this file cannot add a column and cannot
 *  lose one. That distinction is the whole of `boardColumns` below and
 *  the reason this constant survives at all: the operator reads the
 *  board left to right in this order every day, and which competitions
 *  are on it is a different question from what order they sit in. */
export const PICKER_COLUMN_ORDER = ["mls", "epl", "laliga", "ligamx"];

/** THE COLUMN SET IS THE BOARD'S DECLARATION, AND NOTHING ELSE.
 *
 *  `declared` is `Object.keys(board.leagues)` — the backend's
 *  `tables.BOARD_COLUMNS`, which is a hand-written list the operator
 *  edits and the only way a competition joins his board. This function
 *  is the ONE door: it reorders that set and returns it.
 *
 *  IT HAS BEEN THE OTHER WAY TWICE, AND BOTH TIMES A COMPETITION
 *  APPEARED THAT NOBODY HAD ASKED FOR.
 *    - The column set was once DERIVED from the registries and grew
 *      from six to eleven in production without a decision.
 *    - Then this page built its own set from four fixed leagues UNIONED
 *      with the board's leagues, the rows' columns, the refusals'
 *      columns, the review payload's leagues, the finished rows and the
 *      finished refusals — seven doors — and the FINISHED Leagues Cup
 *      walked back onto the board through the last three the day the
 *      backend took it off.
 *
 *  So there is one input. A competition the board does not declare
 *  cannot be conjured by a row, a refusal, a finished match or a
 *  hard-coded league list, because none of them is read here.
 *
 *  WHAT THIS DOES NOT DO is decide what happens to rows in a column
 *  that no longer exists. They are not drawn — the board serves none —
 *  and the competition keeps its own page. Removing a column is not
 *  deleting a competition. */
export function boardColumns(declared: readonly string[]): string[] {
  const seen = new Set(declared);
  return [
    ...PICKER_COLUMN_ORDER.filter((s) => seen.has(s)),
    ...declared.filter((s) => !PICKER_COLUMN_ORDER.includes(s)),
  ];
}

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

/** THE BOARD, OPTIONALLY ASKED FOR COMPETITIONS BY NAME.
 *
 *  `leagues` is the ASK and it is optional in the strongest sense: when
 *  it is absent the request URL is the string it has always been, so the
 *  landing page's read is byte-identical to before and shares the
 *  backend's untouched 90s cache slot. The parameter is sent ONLY by a
 *  narrowed route, and `askHonoured` checks the answer came back
 *  narrowed — asking is not the same as being answered.
 *
 *  ASKING IS NOT DECLARING. Naming `ucl` here does not put the Champions
 *  League on the landing page and cannot: the landing page never passes
 *  this argument, and `declarationOf` refuses to read a narrowed payload
 *  as a column set even if it did. */
export async function fetchBoard(
  days: number, signal?: AbortSignal, leagues?: readonly string[],
): Promise<Board> {
  const ask = leagues && leagues.length > 0
    ? `&leagues=${encodeURIComponent(leagues.join(","))}` : "";
  let r: Response;
  try {
    r = await fetch(`/api/picker/board?days=${days}${ask}`, { signal });
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

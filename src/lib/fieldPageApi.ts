// THE FIELD PAGE'S THREE READS — types, fetchers, and the pure arithmetic
// the page does on them.
//
//   GET /api/field/leagues   every current-season club of the eight
//                            declared board columns, on the union corpus
//                            at the pinned pass count, on three axes
//   GET /api/field/cups      the measured cup fields, one block each,
//                            each on its own corpus and pass count
//   GET /api/field/nations   the four national-team competition fields
//                            (the Championships columns), one block each,
//                            all cut from ONE corpus at ONE pass count
//
// Served by backend src/picker/field_page.py from committed bytes: no
// board, no capture, no write. The page at /bet-suggester/ratings reads
// both; nothing else does. `fieldApi.ts` stays what it was — the board
// card and the competition viewer still read `/api/comp/{key}/ratings`
// through it — so this file shares no type with that one on purpose: two
// payloads with two shapes, and a change to one must not type-check the
// other into a lie.
//
// A FIELD ABSENT FROM AN INTERFACE IS DROPPED SILENTLY. Every caveat key
// the page reads is declared below, optional where the backend may not
// send it, and read with `=== true` / `=== 0` / `!= null` — never with
// truthiness. `bridge_fixtures: 0` is the most important value that key
// takes, and it is the one `!r.bridge_fixtures` would throw away.
//
// NOTHING HERE DECIDES. These functions sort, group and scale what the
// backend measured; they add no number of their own.

/** The exponentiated convenience on a goal axis. `point` is goals
 *  SCORED on attack and goals CONCEDED on defence, where lower is
 *  better — which is why a row is SORTED on `value` (signed so higher
 *  is better on every axis) and never on this. */
export interface GoalsPerMatch {
  point?: number | null;
  low?: number | null;
  high?: number | null;
  means?: string;
  better?: string;
  why_no_interval?: string;
}

/** One club on one axis of the league field. Every key but `club` and
 *  `column` is OPTIONAL: the backend copies a key only where the bundle
 *  row carries it (a goal-axis row has no floor verdict at all), and
 *  absent is a different fact from false. */
export interface LeagueFieldRow {
  club: string;
  column: string;
  value?: number | null;
  lo?: number | null;
  hi?: number | null;
  half_width_95?: number | null;
  /** READ BEFORE THE BAND. Zero is meaningful: a club that played no
   *  bridge fixture draws a narrow band for the reason that makes it
   *  least evidenced. */
  bridge_fixtures?: number | null;
  bridged?: boolean | null;
  evidence_warning?: string | null;
  below_floor?: boolean | null;
  floor_refusal?: string | null;
  floor_failing_condition?: string | null;
  jackknife_replicates?: number | null;
  games_played?: number | null;
  /** WHICH LADDER — data, never typed. Two ladders are two scales. */
  ladder?: string | number | null;
  component?: string | number | null;
  quintiles_spanned_own_league?: number | null;
  placeable_in_a_quintile_of_its_own_league?: boolean | null;
  goals_per_match?: GoalsPerMatch | null;
  /** a promoted club rated on the division it came up from, in the
   *  backend's own sentence */
  rated_on_another_division?: string | null;
  /** the tier cut against THIS column's own current-season roster */
  tier?: number | null;
  tier_set?: number[] | null;
  straddles?: boolean | null;
}

export interface LeagueFieldColumnMeasured {
  measured: true;
  unit?: string | null;
  n_rows?: number;
  value_min?: number | null;
  value_max?: number | null;
  n_clubs?: number | null;
  median_half_width_95?: number | null;
  median_half_width_95_bridged_only?: number | null;
  distinguishable_levels_all_clubs?: number | null;
  distinguishable_levels_bridged_only?: number | null;
  cut_against?: string | null;
}
export interface NotMeasured {
  measured: false;
  what?: string;
  why?: string;
}
export type LeagueFieldColumn = LeagueFieldColumnMeasured | NotMeasured;

export interface LeagueFieldAxis {
  columns: Record<string, LeagueFieldColumn>;
  rows: LeagueFieldRow[];
  scale?: string | null;
}

export interface ProvisionalRow {
  club: string;
  column: string;
  status?: string | null;
  matches_played?: number | null;
  read_this_first?: string | null;
  what_this_value_is_not?: string | null;
  overall_not_measured?: string | null;
  goals_per_match?: Record<string, GoalsPerMatch | null | undefined>;
}

export interface LeagueFieldColumnMeta {
  key: string;
  display: string;
  measured: boolean;
  why?: string;
}

export interface LeagueField {
  source: string;
  slices_sha256?: string;
  corpus_sha256?: string | null;
  passes?: number | string | null;
  jackknife_replicates?: number | null;
  published_sweep?: number[] | null;
  goal_axes_have_no_pass_count?: string | null;
  columns: LeagueFieldColumnMeta[];
  axes: Record<string, LeagueFieldAxis>;
  provisional?: ProvisionalRow[];
  /** Whether this is the fit the live Champions League field is served
   *  on — computed by the backend every process, and the ONLY thing the
   *  page may say "the same corpus and pass count" off. */
  live_ucl_field?: {
    corpus_sha256?: string | null;
    passes?: number | string | null;
    same_fit?: boolean;
  };
  not_a_trading_signal?: boolean;
}

export interface CupRow {
  rank?: number;
  club: string;
  league?: string | null;
  league_display?: string | null;
  board_column?: string | null;
  value?: number | null;
  half_width_95?: number | null;
  lo?: number | null;
  hi?: number | null;
  tier?: number | null;
  tier_set?: number[] | null;
  straddles?: boolean | null;
  below_floor?: boolean | null;
  floor_note?: string | null;
  /** goals per match on a goal axis; null on the Elo axis, which has no
   *  per-game reading */
  rate?: number | null;
}

export interface CupAxis {
  label: string;
  unit?: string;
  bands?: number;
  source?: string;
  artifact?: string | null;
  passes?: number | string;
  rows: CupRow[];
}

export interface CupField {
  key: string;
  aliases: string[];
  display: string;
  passes?: number | string | null;
  corpus_sha256?: string | null;
  admitted_leagues?: string[];
  below_floor_clubs?: string[];
  below_floor_note?: string | null;
  basis?: string | null;
  axes_measured?: string[];
  axes: Record<string, CupAxis>;
  /** false: per-club bridge counts are not part of read_axes' output, so
   *  the cups view draws no bridges column rather than an empty one */
  carries_bridge_counts?: boolean;
}

export interface CupFields {
  cups: CupField[];
  not_a_trading_signal?: boolean;
}

/** One national team on one axis of its competition's field — the
 *  national reader's row (backend `national_team_axes._row`), copied by
 *  name. Optional where the backend may not send it: the LICENSED tier is
 *  absent on every overall row and wherever the licence could not cut. */
export interface NationRow {
  rank?: number;
  team_id: string;
  team: string;
  group?: string | null;
  confederation?: string | null;
  value?: number | null;
  /** the band the field is tiered and floor-checked on (`band`) */
  lo?: number | null;
  hi?: number | null;
  half_width_95?: number | null;
  band?: string | null;
  /** THE FULL BAND — the one to read whenever teams of DIFFERENT
   *  confederations are compared, i.e. across two tables. */
  half_width_95_cross_confederation?: number | null;
  lo_cross_confederation?: number | null;
  hi_cross_confederation?: number | null;
  tier?: number | null;
  tier_set?: number[] | null;
  straddles?: boolean | null;
  tier_licensed?: number | null;
  tier_set_licensed?: number[] | null;
  straddles_licensed?: boolean | null;
  below_floor?: boolean | null;
  floor_refusal?: string | null;
  floor_failing_condition?: string | null;
  below_floor_licensed?: boolean | null;
  floor_failing_condition_licensed?: string | null;
  /** goals per match on a goal axis; null on overall */
  goals_per_match?: number | null;
  bridge_fixtures?: number | null;
  competitive_bridges?: number | null;
  friendly_bridges?: number | null;
  matches?: number | null;
  caveats?: string[];
  /** WHICH RESPONSE CARRIES THIS ROW (backend 6bf7e06b, attack/defence
   *  only): "shots" or "goals" — whether xG or shots on target is the
   *  response for most of the team's own appearances in `signal_block`.
   *  Declared so the recording type-checks; the page does not draw it. */
  signal?: "shots" | "goals" | null;
  signal_mix?: Record<string, number> | null;
  signal_block?: string | null;
}

/** Where a field's attack and defence were read from, said once for the
 *  page and once per competition (backend 6bf7e06b). Not drawn yet. */
export interface NationAttackDefence {
  signal_source?: string | null;
  signal_source_why?: string | null;
  bundle?: string | null;
  signal_note?: string | null;
  sources?: Record<string, NationAttackDefence>;
}

export interface NationAxis {
  label: string;
  unit?: string;
  bands?: number;
  levels?: number | null;
  bands_licensed?: number | null;
  /** true where the declared five bands are more than this field's
   *  resolution licenses — the page then shows the LICENSED cut */
  declared_above_licence?: boolean;
  cuts?: number[];
  cuts_licensed?: number[];
  span?: number[];
  band?: string | null;
  /** on overall only: a goals axis has no pass count */
  passes?: number | string;
  /** "elo" on overall; "shots" or "goals" on attack/defence */
  signal_source?: string | null;
  rows: NationRow[];
}

export interface NationNotMeasured {
  team_id: string;
  team: string;
  group?: string | null;
  axes: string[];
  why: string;
  matches_in_window?: number | null;
}

export interface NationCompetition {
  /** the Championships column key (the payload's own `columns`) */
  key: string;
  field_key?: string;
  display: string;
  competition_display?: string;
  edition?: string;
  confederation: string;
  entrants: number;
  passes?: number | string | null;
  corpus_sha256?: string | null;
  band?: string | null;
  attack_defence?: NationAttackDefence | null;
  axes: Record<string, NationAxis>;
  not_measured: NationNotMeasured[];
}

export interface NationFields {
  source?: string;
  bundle?: string;
  served_because?: string;
  field_sha256?: string;
  manifest_sha256?: string;
  preregistration?: string | null;
  corpus_sha256?: string | null;
  passes?: number | string | null;
  primary_variant?: string;
  /** internationals in the corpus */
  fixtures?: number | null;
  window?: { start?: string | null; end?: string | null };
  jackknife_replicates?: number | null;
  teams_rated?: number | null;
  confederations?: string[];
  /** teams whose every match against another confederation is a friendly */
  friendly_only_bridge_teams?: number | null;
  /** WHETHER THE TABLES MAY SHARE ONE AXIS — computed by the backend from
   *  the four fields' own corpus digests and pass counts. The page draws
   *  one axis across tables only while `one_measurement` is true. */
  shared_axis?: { same_corpus?: boolean; same_passes?: boolean;
    one_measurement?: boolean };
  attack_defence?: NationAttackDefence | null;
  band?: string | null;
  band_note?: string | null;
  no_bridge_caveat_scope?: string | null;
  below_floor_note?: string | null;
  caveat_notes?: Record<string, string>;
  unit_note?: Record<string, string> | null;
  competitions: NationCompetition[];
  not_a_trading_signal?: boolean;
}

/** THE AXES, in the order the page offers them. The backend spells them
 *  the same way on both routes (`cross_league_axes.AXES[*].label`). */
export const FIELD_AXES = ["overall", "attack", "defence"] as const;
export type FieldAxisName = (typeof FIELD_AXES)[number];

// ─────────────────────────────── fetching ──────────────────────────────

/** A read, with every failure NAMED. Same discipline as `fetchRatings`:
 *  a failed read must never reach the renderer looking like a field with
 *  no clubs in it, and a 200 is not a payload until it parses into an
 *  object. */
async function readField<T>(path: string, what: string,
                            signal?: AbortSignal): Promise<T> {
  let r: Response;
  try {
    r = await fetch(path, { signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new Error(`the ${what} request never reached the server — check `
      + "the connection and try again");
  }
  const raw = await r.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`the ${what} read answered ${r.status} with a body that `
      + `is not JSON (${raw.length} characters) — an answer we could not `
      + "read, not a field with no clubs in it");
  }
  if (!r.ok) {
    const b = body as { detail?: unknown; error?: unknown } | null;
    const said = typeof b?.detail === "string" ? b.detail
      : typeof b?.error === "string" ? b.error : "";
    throw new Error(said ? `${said} (${r.status})`
      : `the ${what} read answered ${r.status}`);
  }
  if (body === null || typeof body !== "object") {
    throw new Error(`the ${what} read answered ${r.status} with `
      + `${JSON.stringify(body)} where a field was expected`);
  }
  return body as T;
}

export function fetchLeagueField(signal?: AbortSignal): Promise<LeagueField> {
  return readField<LeagueField>("/api/field/leagues", "league field", signal);
}

export function fetchCupFields(signal?: AbortSignal): Promise<CupFields> {
  return readField<CupFields>("/api/field/cups", "cup field", signal);
}

export function fetchNationFields(signal?: AbortSignal): Promise<NationFields> {
  return readField<NationFields>("/api/field/nations", "national-team field",
    signal);
}

// ─────────────────────────── the page's arithmetic ─────────────────────

/** Anything with a signed value to rank on. */
interface Valued { value?: number | null; club: string }

/** HIGHEST VALUE FIRST, on every axis — each is signed higher-is-better.
 *  An emitter bundle's rows arrive in NAME order, and rendering in data
 *  order printed an alphabetical "rank". A missing value sorts last and
 *  is never treated as zero; the name breaks ties so the order is total. */
export function byValue<T extends Valued>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => {
    const x = a.value, y = b.value;
    const xn = x == null || Number.isNaN(x), yn = y == null || Number.isNaN(y);
    if (xn && yn) return a.club.localeCompare(b.club);
    if (xn) return 1;
    if (yn) return -1;
    return y! - x! || a.club.localeCompare(b.club);
  });
}

/** WHICH LADDER A ROW IS ON — read off the row. `ladder` where the
 *  payload names one, else its component; a row naming neither is on no
 *  ladder this page can put it beside anything on, and is its own
 *  group rather than folded into someone else's. */
export function ladderOf(r: LeagueFieldRow): string {
  if (r.ladder != null && r.ladder !== "") return String(r.ladder);
  if (r.component != null && r.component !== "") return `component ${r.component}`;
  return "no ladder named";
}

/** The rows split by ladder, in order of first appearance. One group is
 *  one ranking; two or more is a refusal of a single ranking. */
export function ladders(rows: readonly LeagueFieldRow[]):
  Array<{ ladder: string; rows: LeagueFieldRow[] }> {
  const out = new Map<string, LeagueFieldRow[]>();
  for (const r of rows) {
    const k = ladderOf(r);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(r);
  }
  return [...out.entries()].map(([ladder, rs]) => ({ ladder, rows: rs }));
}

/** Why a row draws no interval, or null when it draws one. The order is
 *  the reading order: bridges first. */
export function barRefusal(r: LeagueFieldRow): string | null {
  if (r.bridge_fixtures === 0) {
    return r.evidence_warning ?? "no bridge evidence";
  }
  if (r.bridged === false) return "not bridged";
  if (r.lo == null || r.hi == null || r.value == null) {
    return "no interval measured";
  }
  return null;
}

/** ONE TABLE, ONE AXIS. The span every bar in a table is drawn on: the
 *  intervals of the rows it shows that draw one. Per-column scales put a
 *  Serie A club level with Bayern while it ranked eleventh. */
export function tableScale(rows: readonly { lo?: number | null;
  hi?: number | null }[]): { lo: number; hi: number } | null {
  let lo = Infinity, hi = -Infinity;
  for (const r of rows) {
    if (r.lo == null || r.hi == null) continue;
    if (r.lo < lo) lo = r.lo;
    if (r.hi > hi) hi = r.hi;
  }
  return Number.isFinite(lo) && Number.isFinite(hi) ? { lo, hi } : null;
}

/** Percent positions of an interval on a scale, clamped to the track. */
export function place(lo: number, hi: number, point: number,
                      sc: { lo: number; hi: number }) {
  const span = sc.hi - sc.lo || 1;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - sc.lo) / span) * 100));
  const L = pct(lo), R = pct(hi);
  return { left: L, width: Math.max(R - L, 0.6), point: pct(point) };
}

/** THE TIER AS IT IS DRAWN. A straddling club shows the SET's range
 *  min–max — never the point tier and the max, which printed "2–2". A
 *  one-element set is the only case where a club is actually placed. */
export function tierText(t: { tier?: number | null; tier_set?: number[] | null;
  straddles?: boolean | null }): { lo: number; hi: number | null } | null {
  const set = (t.tier_set ?? []).filter((x) => Number.isFinite(x));
  if (set.length > 1) {
    const lo = Math.min(...set), hi = Math.max(...set);
    return lo === hi ? { lo, hi: null } : { lo, hi };
  }
  if (set.length === 1) return { lo: set[0], hi: null };
  if (t.tier != null) return { lo: t.tier, hi: null };
  return null;
}

/** A number, or null — never a string "0.00" for something missing. */
export function fmt(v: number | null | undefined, digits: number): string | null {
  return v == null || Number.isNaN(v) ? null : v.toFixed(digits);
}

export const shortSha = (s: string | null | undefined) =>
  s ? s.slice(0, 8) : null;

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve"];
/** A small count as a word, the way the page's sentences read. */
export const countWord = (n: number) => WORDS[n] ?? String(n);

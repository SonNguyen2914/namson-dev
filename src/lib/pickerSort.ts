// Per-column sorting for the picker board — pure logic, no React.
//
// SORT IS PRESENTATION. A mode reorders the rows a column was served; it
// never adds one, drops one, or gates one. That is the board's founding
// rule (RANKS, NEVER CUTS) restated for the one control that could
// quietly break it, and e2e/picker.spec.ts holds the row count invariant
// across every mode.
//
// NULL POLICY. A row with no value under the active key — a fixture with
// no Kalshi quote, sorted by ask/spread/depth — sorts AFTER every row
// that has one, in BOTH directions. Flipping the direction reverses the
// measured rows only; "missing" is not a small number and not a large
// one, so it must never interleave. The column says so on screen
// ("no quote sorts last") while such a key is active.
//
// SINCE 2026-08-31 THE STAGE-1 GAPS CAN BE NULL TOO. A cross-league
// Leagues Cup fixture (MLS v Liga MX) has no ppg, GD/g or rank gap: the
// two clubs' rates were never measured on one scale, so the difference
// does not exist. `Math.abs(null)` is 0 in JavaScript, which would have
// parked such a row beside a dead-level fixture and, on an ASCENDING
// sort, put a gap nobody measured at the top of the board. So these
// keys answer null, the same null the book keys answer, and they carry
// the same on-screen note.
//
// TIES fall back to the column's default order (|GD/g gap| descending —
// the board's own rule), then to served order, so every sort is
// deterministic and a re-render cannot shuffle equal rows.

import { BoardRow, SHAPE_ORDER } from "./pickerApi";

export type SortDir = "asc" | "desc";

export type SortModeId =
  | "gdg" | "kickoff" | "ppg" | "rank"
  | "tier_ovr" | "tier_atk" | "tier_def" | "shape"
  | "ask" | "spread" | "depth";

export interface SortMode {
  id: SortModeId;
  /** control label — lowercase, the board's own vocabulary */
  label: string;
  /** the direction the mode opens in; the toggle flips it */
  defaultDir: SortDir;
  /** HOW THIS MODE'S ORDERING READS IN PROSE, for the board's standfirst.
   *  Optional — a mode without one reads as "<label> descending". It lives
   *  HERE, beside the key it describes, so a mode added to this table
   *  cannot become a mode the standfirst has no words for. */
  orderNote?: (dir: SortDir) => string;
  /** the sort key. null = "this row has no value here" — sorts last. */
  value: (r: BoardRow) => number | null;
  /** shown beside the control while this key is active */
  nullNote?: string;
  /** show `nullNote` only when the column actually holds such a row.
   *
   *  "no quote" is a standing possibility in EVERY column, so the book
   *  keys state their policy whether or not it bites today. A withheld
   *  Stage-1 gap only exists in a cup column with a cross-league
   *  fixture in it, and printing that sentence over the Premier League
   *  would be an explanation of something that is not there. */
  nullNoteOnlyWhenPresent?: boolean;
}

// The Stage-1 gaps sort by MAGNITUDE (the board's default is |GD/g gap|
// descending, and ppg/rank follow the same reading: how far apart, not
// which way). The tier gaps sort SIGNED — their sign is the finding
// (level and behind are the hollow read) and must order below ahead.
/** |x| for a gap that may not exist. NOT `Math.abs(x ?? 0)`: a withheld
 *  gap is not a zero one, and the difference is the whole reason a
 *  cross-league row must sort last rather than in the middle. */
const magnitude = (v: number | null | undefined) =>
  v == null ? null : Math.abs(v);

const GAP_NULL_NOTE = "no measured gap (cross-league) sorts last";

export const SORT_MODES: SortMode[] = [
  { id: "gdg", label: "GD/g gap", defaultDir: "desc",
    value: (r) => magnitude(r.gdg_gap), nullNote: GAP_NULL_NOTE,
    nullNoteOnlyWhenPresent: true,
    orderNote: (d) => `|GD/g gap| ${d === "desc" ? "descending" : "ascending"}` },
  { id: "kickoff", label: "kickoff", defaultDir: "asc",
    value: (r) => {
      const t = Date.parse(r.kickoff);
      return Number.isNaN(t) ? null : t;
    } },
  { id: "ppg", label: "ppg gap", defaultDir: "desc",
    value: (r) => magnitude(r.ppg_gap), nullNote: GAP_NULL_NOTE,
    nullNoteOnlyWhenPresent: true,
    orderNote: (d) => `|ppg gap| ${d === "desc" ? "descending" : "ascending"}` },
  { id: "rank", label: "rank gap", defaultDir: "desc",
    value: (r) => magnitude(r.rank_gap), nullNote: GAP_NULL_NOTE,
    nullNoteOnlyWhenPresent: true,
    orderNote: (d) => `|rank gap| ${d === "desc" ? "descending" : "ascending"}` },
  { id: "tier_ovr", label: "overall tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.ovr },
  { id: "tier_atk", label: "attack tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.atk },
  { id: "tier_def", label: "defence tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.def },
  // The SHAPE as an ordering (operator ask, 2026-09-01): CLEAN is a gap
  // the tiers back on all three dimensions, HOLLOW is a gap they do not
  // back at all — so descending reads best-backed first, and one flip
  // surfaces the traps. Ties fall to the board's own |GD/g| tiebreak,
  // which is exactly the order wanted inside a bucket.
  //
  // AN UNRECOGNISED SHAPE REFUSES; IT DOES NOT SORT AS "NO SHAPE"
  // (2026-09-07). The rank came from a three-key object literal typed
  // here, with `?? null` behind it and a comment asserting "this key
  // has no null case and no note". Both halves of that were wrong at
  // once: a fourth value from the backend — src/picker is where the
  // vocabulary is decided and it has grown before — folds through the
  // `??` into the SAME null bucket as "this row has no value", which
  // parks it silently at the end of a column while the sentence that
  // would explain the position is suppressed by the very assertion
  // that it cannot happen. The board's own rule is that an unrecognised
  // provider value refuses in words rather than joining a meaningful
  // class, so the note is declared and shown WHEN SUCH A ROW IS THERE.
  // The ranking is derived from SHAPE_ORDER in pickerApi.ts, beside the
  // `Shape` type it orders, so a value added to one is a value the
  // other is missing rather than a value that quietly sorts last.
  { id: "shape", label: "shape", defaultDir: "desc",
    orderNote: (d) => d === "desc"
      ? "clean before split before hollow"
      : "hollow before split before clean",
    value: (r) => SHAPE_ORDER[r.shape] ?? null,
    nullNote: "a shape this board does not recognise sorts last",
    nullNoteOnlyWhenPresent: true },
  { id: "ask", label: "ask price", defaultDir: "asc",
    value: (r) => r.kalshi?.ask_c ?? null,
    nullNote: "no quote sorts last" },
  { id: "spread", label: "spread", defaultDir: "asc",
    value: (r) => r.kalshi?.spread_c ?? null,
    nullNote: "no quote sorts last" },
  { id: "depth", label: "depth", defaultDir: "desc",
    value: (r) => r.kalshi?.ask_size ?? null,
    nullNote: "no quote sorts last" },
];

export interface ColumnSort { mode: SortModeId; dir: SortDir; }

/** The board's own rule: kickoff, earliest first (2026-09-02).
 *
 *  It was |GD/g gap| descending, which made sense when a column was a
 *  ranked list. The board is DAY-MAJOR now — the matchday is the
 *  structure and the sort only ranks within it — so the honest default
 *  inside a day is the order the football actually happens in. A ranking
 *  is a question you ask of a day; time is what a day IS.
 *
 *  |GD/g gap| stays as the tiebreak in defaultOrder() below, so two
 *  fixtures kicking off together still fall in the old order. */
export const DEFAULT_SORT: ColumnSort = { mode: "kickoff", dir: "asc" };

export const modeById = (id: string): SortMode | undefined =>
  SORT_MODES.find((m) => m.id === id);

export const isDefaultSort = (s: ColumnSort): boolean =>
  s.mode === DEFAULT_SORT.mode && s.dir === DEFAULT_SORT.dir;

/** COLUMNS WHOSE DEFAULT SORT IS NOT THE BOARD'S (operator, 2026-09-08;
 *  backend docs/DECISION-ucl-board-sort-2026-09-08.md).
 *
 *  The four league columns rank a fixture by the gap between two clubs
 *  on ONE table, and inside a matchday `kickoff` is the honest default.
 *  A UCL fixture almost never has that gap: nearly every match pairs two
 *  different domestic leagues, and the backend withholds `ppg_gap`,
 *  `gdg_gap` and `rank_gap` outright when the scales differ, because 2.0
 *  ppg in one league is not 2.0 ppg in another.
 *
 *  What survives a change of scale is the TIER — a within-league
 *  quintile means "best fifth of its own league" in every league, which
 *  is the one comparison two different tables genuinely support — and
 *  `shape`, which is derived from the three tier gaps. So that is what
 *  this column ranks on.
 *
 *  KEYED BY SLUG, NOT BY `meta.kind`: this is not a fact about cups. The
 *  Leagues Cup draws on two members of one continent and keeps the
 *  board default; a future cup would have to earn its own entry here. */
export const COLUMN_DEFAULT_SORT: Readonly<Record<string, ColumnSort>> = {
  ucl: { mode: "shape", dir: "desc" },
};

/** The sort a column actually runs under, given what the page handed it.
 *
 *  ONE CONTROL STAYS AUTHORITATIVE. A column's own default applies only
 *  while the board's control is untouched. The moment the operator picks
 *  a sort — board-wide, or as an override on one matchday band — every
 *  column obeys it, this one included, because a control that silently
 *  did not apply to part of the board would be worse than a column that
 *  starts somewhere else. */
/** WHAT AN ORDERING READS AS, in the board's own words.
 *
 *  THE STANDFIRST USED TO BE HAND-TYPED AND SAID THE WRONG THING
 *  (2026-09-09). It read "|GD/g gap| descending within each day" on every
 *  multi-column board — but `DEFAULT_SORT` is `kickoff asc` and |GD/g gap|
 *  is only the TIEBREAK in `defaultOrder` below, so the line named the
 *  tiebreak as though it were the ordering. It also could not see the
 *  operator's own sort control at all: it was keyed on whether the board
 *  was narrowed to one column, so picking any mode left it unchanged.
 *
 *  Deriving it from the mode the board is actually running means a new
 *  mode arrives with its own words instead of inheriting someone else's. */
export function orderPhrase(sort: ColumnSort): string {
  const m = modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  return m.orderNote
    ? m.orderNote(sort.dir)
    : `${m.label} ${sort.dir === "desc" ? "descending" : "ascending"}`;
}

export function columnSort(slug: string, handed: ColumnSort): ColumnSort {
  const own = COLUMN_DEFAULT_SORT[slug];
  return own && isDefaultSort(handed) ? own : handed;
}

/** The board's own tiebreak order, null-safe: a row with no measured
 *  GD/g gap falls to the back of it rather than to the front, which is
 *  what `NaN` from an arithmetic comparison would have done.
 *
 *  WHEN NEITHER ROW CARRIES THE MEASURED GAP, FALL TO `own_gdg`
 *  (2026-09-09). `gdg_gap` is withheld on EVERY cross-league row by
 *  design, so on the Champions League column this comparator returned 0
 *  for every pair and the tiebreak decided nothing. The `shape` mode's
 *  own comment promises that ties "fall to the board's own |GD/g|
 *  tiebreak, which is exactly the order wanted inside a bucket" — and
 *  that promise was empty on the one column that needed it: two shape
 *  buckets of six, each left in the server's arrival order, with the
 *  largest own-league difference (+1.32) sitting eleventh of twelve.
 *
 *  THE TWO KEYS ARE NEVER COMPARED AGAINST EACH OTHER. `gdg_gap` is a
 *  gap measured inside ONE league's scale; `own_gdg` is each club's own
 *  league GD/g differenced ACROSS two, which is why the board publishes
 *  one and withholds the other. So the fallback fires only when NEITHER
 *  side offers the measured gap, and a row that does offer it still
 *  outranks one that does not — every branch that could put the two
 *  numbers on the same axis is unreachable rather than merely unused. */
const defaultOrder = (a: BoardRow, b: BoardRow) => {
  const va = magnitude(a.gdg_gap), vb = magnitude(b.gdg_gap);
  if (va != null && vb != null) return vb - va;
  if (va != null) return -1;
  if (vb != null) return 1;
  const oa = magnitude(a.own_gdg?.diff), ob = magnitude(b.own_gdg?.diff);
  if (oa != null && ob != null) return ob - oa;
  if (oa != null) return -1;
  if (ob != null) return 1;
  return 0;
};

/** THE ordering primitive — reorder, NEVER filter. Output length always
 *  equals input length; there is deliberately no code path that could make
 *  them differ, no predicate parameter, and nowhere to add one.
 *
 *  It is generic and exported because the FINISHED TAIL below each column
 *  sorts on its own keys (lib/pickerReviewSort.ts) and must not own a
 *  second copy of the null policy. Two copies of "missing sorts last, in
 *  both directions" drift, and the one that drifts is the one nobody is
 *  looking at.
 *
 *  `baseOrder` is applied BEFORE the key, so equal values fall back to a
 *  stable, meaningful order rather than to whatever the server happened to
 *  send. */
export function orderBy<T>(
  rows: T[],
  value: (r: T) => number | null,
  dir: SortDir,
  baseOrder: (a: T, b: T) => number,
): T[] {
  const dirMul = dir === "asc" ? 1 : -1;
  return [...rows]
    .sort(baseOrder)
    .map((r, i) => ({ r, i, v: value(r) }))
    .sort((a, b) => {
      if (a.v == null || b.v == null) {
        if (a.v == null && b.v == null) return a.i - b.i; // both missing: default order
        return a.v == null ? 1 : -1;                      // missing sorts last, either dir
      }
      return a.v !== b.v ? dirMul * (a.v - b.v) : a.i - b.i;
    })
    .map((x) => x.r);
}

/** Reorder — NEVER filter — one column's upcoming rows. */
export function sortRows(rows: BoardRow[], sort: ColumnSort): BoardRow[] {
  const mode = modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  return orderBy(rows, mode.value, sort.dir, defaultOrder);
}

/** The note to print under this column's sort control, or null. */
export function nullNoteFor(mode: SortMode, rows: BoardRow[]): string | null {
  if (!mode.nullNote) return null;
  if (mode.nullNoteOnlyWhenPresent
      && !rows.some((r) => mode.value(r) == null)) return null;
  return mode.nullNote;
}

// ---- persistence: a per-viewer convenience, never a requirement ----------
// localStorage can be absent, blocked, or throwing on ACCESS (private
// windows, storage-off browsers) — every touch is inside try/catch and
// the default renders when nothing usable is there.

const storageKey = (league: string) => `picker.colsort.${league}`;

/** The BOARD's default sort (2026-09-01 day-major C): one choice for
 *  every matchday band, remembered on this device. Per-day overrides
 *  are deliberately session-only — a matchday is a one-night decision
 *  and a remembered override for "Saturday" would silently apply to a
 *  DIFFERENT Saturday next week. */
const BOARD_SORT_KEY = "picker:sort:board";

export function loadBoardSort(): ColumnSort {
  try {
    const raw = window.localStorage.getItem(BOARD_SORT_KEY);
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw) as { mode?: unknown; dir?: unknown };
    const mode = typeof parsed.mode === "string" ? modeById(parsed.mode) : undefined;
    if (!mode) return DEFAULT_SORT;
    const dir = parsed.dir === "asc" || parsed.dir === "desc"
      ? parsed.dir : mode.defaultDir;
    return { mode: mode.id, dir };
  } catch {
    return DEFAULT_SORT;
  }
}

export function saveBoardSort(s: ColumnSort): void {
  try {
    if (isDefaultSort(s)) {
      window.localStorage.removeItem(BOARD_SORT_KEY);
    } else {
      window.localStorage.setItem(BOARD_SORT_KEY, JSON.stringify(s));
    }
  } catch { /* convenience only — sorting still works for this visit */ }
}

export function loadColumnSort(league: string): ColumnSort {
  try {
    const raw = window.localStorage.getItem(storageKey(league));
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw) as { mode?: unknown; dir?: unknown };
    const mode = typeof parsed.mode === "string" ? modeById(parsed.mode) : undefined;
    if (!mode) return DEFAULT_SORT;   // a mode we no longer have: default, not a crash
    const dir = parsed.dir === "asc" || parsed.dir === "desc"
      ? parsed.dir : mode.defaultDir;
    return { mode: mode.id, dir };
  } catch {
    return DEFAULT_SORT;
  }
}

export function saveColumnSort(league: string, s: ColumnSort): void {
  try {
    if (isDefaultSort(s)) {
      // reset means FORGET — a stored default would shadow a future
      // change of the default itself
      window.localStorage.removeItem(storageKey(league));
    } else {
      window.localStorage.setItem(storageKey(league), JSON.stringify(s));
    }
  } catch { /* convenience only — sorting still works for this visit */ }
}

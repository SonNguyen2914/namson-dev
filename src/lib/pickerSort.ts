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

import { BoardRow } from "./pickerApi";

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
    nullNoteOnlyWhenPresent: true },
  { id: "kickoff", label: "kickoff", defaultDir: "asc",
    value: (r) => {
      const t = Date.parse(r.kickoff);
      return Number.isNaN(t) ? null : t;
    } },
  { id: "ppg", label: "ppg gap", defaultDir: "desc",
    value: (r) => magnitude(r.ppg_gap), nullNote: GAP_NULL_NOTE,
    nullNoteOnlyWhenPresent: true },
  { id: "rank", label: "rank gap", defaultDir: "desc",
    value: (r) => magnitude(r.rank_gap), nullNote: GAP_NULL_NOTE,
    nullNoteOnlyWhenPresent: true },
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
  // which is exactly the order wanted inside a bucket. Shape exists on
  // every row (tiers survive even a cross-league tie), so this key has
  // no null case and no note.
  { id: "shape", label: "shape", defaultDir: "desc",
    value: (r) => ({ CLEAN: 2, SPLIT: 1, HOLLOW: 0 })[r.shape] ?? null },
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

/** The board's own rule: |GD/g gap| descending. */
export const DEFAULT_SORT: ColumnSort = { mode: "gdg", dir: "desc" };

export const modeById = (id: string): SortMode | undefined =>
  SORT_MODES.find((m) => m.id === id);

export const isDefaultSort = (s: ColumnSort): boolean =>
  s.mode === DEFAULT_SORT.mode && s.dir === DEFAULT_SORT.dir;

/** The board's own tiebreak order, null-safe: a row with no measured
 *  GD/g gap falls to the back of it rather than to the front, which is
 *  what `NaN` from an arithmetic comparison would have done. */
const defaultOrder = (a: BoardRow, b: BoardRow) => {
  const va = magnitude(a.gdg_gap), vb = magnitude(b.gdg_gap);
  if (va == null || vb == null) {
    if (va == null && vb == null) return 0;
    return va == null ? 1 : -1;
  }
  return vb - va;
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

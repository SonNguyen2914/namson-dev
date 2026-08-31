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
// TIES fall back to the column's default order (|GD/g gap| descending —
// the board's own rule), then to served order, so every sort is
// deterministic and a re-render cannot shuffle equal rows.

import { BoardRow } from "./pickerApi";

export type SortDir = "asc" | "desc";

export type SortModeId =
  | "gdg" | "kickoff" | "ppg" | "rank"
  | "tier_ovr" | "tier_atk" | "tier_def"
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
}

// The Stage-1 gaps sort by MAGNITUDE (the board's default is |GD/g gap|
// descending, and ppg/rank follow the same reading: how far apart, not
// which way). The tier gaps sort SIGNED — their sign is the finding
// (level and behind are the hollow read) and must order below ahead.
export const SORT_MODES: SortMode[] = [
  { id: "gdg", label: "GD/g gap", defaultDir: "desc",
    value: (r) => Math.abs(r.gdg_gap) },
  { id: "kickoff", label: "kickoff", defaultDir: "asc",
    value: (r) => {
      const t = Date.parse(r.kickoff);
      return Number.isNaN(t) ? null : t;
    } },
  { id: "ppg", label: "ppg gap", defaultDir: "desc",
    value: (r) => Math.abs(r.ppg_gap) },
  { id: "rank", label: "rank gap", defaultDir: "desc",
    value: (r) => Math.abs(r.rank_gap) },
  { id: "tier_ovr", label: "overall tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.ovr },
  { id: "tier_atk", label: "attack tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.atk },
  { id: "tier_def", label: "defence tier gap", defaultDir: "desc",
    value: (r) => r.tier_gaps.def },
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

const defaultOrder = (a: BoardRow, b: BoardRow) =>
  Math.abs(b.gdg_gap) - Math.abs(a.gdg_gap);

/** Reorder — NEVER filter — one column's rows. Output length always
 *  equals input length; there is deliberately no code path that could
 *  make them differ. */
export function sortRows(rows: BoardRow[], sort: ColumnSort): BoardRow[] {
  const mode = modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  const dirMul = sort.dir === "asc" ? 1 : -1;
  return [...rows]
    .sort(defaultOrder)
    .map((r, i) => ({ r, i, v: mode.value(r) }))
    .sort((a, b) => {
      if (a.v == null || b.v == null) {
        if (a.v == null && b.v == null) return a.i - b.i; // both missing: default order
        return a.v == null ? 1 : -1;                      // missing sorts last, either dir
      }
      return a.v !== b.v ? dirMul * (a.v - b.v) : a.i - b.i;
    })
    .map((x) => x.r);
}

// ---- persistence: a per-viewer convenience, never a requirement ----------
// localStorage can be absent, blocked, or throwing on ACCESS (private
// windows, storage-off browsers) — every touch is inside try/catch and
// the default renders when nothing usable is there.

const storageKey = (league: string) => `picker.colsort.${league}`;

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

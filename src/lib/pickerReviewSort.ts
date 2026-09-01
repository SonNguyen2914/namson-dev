// Sorting for the FINISHED tail — pure logic, no React.
//
// Its own modes, its own default, its own stored choice. The tail sits
// inside the league column but it answers a different question from the
// board above it ("where could I do better?" rather than "where should I
// look?"), and a shared control would force one answer to follow the
// other. Choosing "ask price" above must not reorder the matches below.
//
// EVERY RULE THE BOARD'S SORT KEEPS, THIS ONE KEEPS.
//
//  - SORT IS PRESENTATION. A mode reorders the rows the tail was served;
//    it never adds one, drops one, or gates one. The ordering primitive is
//    IMPORTED from lib/pickerSort.ts rather than reimplemented, so there
//    is exactly one place in the app where "reorder, never filter" lives.
//  - NULL SORTS LAST, IN BOTH DIRECTIONS. A fixture with no pre-kickoff
//    read has no GD/g gap; one with a dead plays feed has no shot share;
//    one whose favourite is unknown has no verdict. "Missing" is not a
//    small number and not a large one, so it must never interleave. The
//    tail says which absence is sorting last while such a key is active.
//  - TIES fall back to the tail's own default order — kickoff, most recent
//    first — so equal values are deterministic and a re-render cannot
//    shuffle them.
//
// AND ONE RULE OF ITS OWN. A verdict key (`fav_won`, `confirmed`) orders
// the matches; it does not COUNT them. Nothing in this module or its
// callers accumulates a hit rate, and sorting by "the favourite won"
// deliberately produces a list, never a tally — a run of green ticks at
// the top of a column is a reading the reader does themselves, over
// matches they can see, not a number this page hands them.

import { orderBy, SortDir } from "./pickerSort";
import { isRead, ReviewRow } from "./pickerReview";

export type ReviewSortModeId =
  | "kickoff" | "gdg" | "ppg" | "rank" | "tier_ovr"
  | "fav_won" | "confirmed" | "share_ft" | "share_20" | "origin";

export interface ReviewSortMode {
  id: ReviewSortModeId;
  label: string;
  defaultDir: SortDir;
  /** the sort key. null = "this row has no value here" — sorts last. */
  value: (r: ReviewRow) => number | null;
  /** shown beside the control while this key is active, naming WHICH
   *  absence is being sorted last — "no quote" and "no pre-kickoff read"
   *  are different facts and a single generic note would blur them */
  nullNote?: string;
}

/** A boolean verdict as a sort key. TRUE/FALSE order; NOT KNOWN is null
 *  and sorts last under both directions — a verdict we do not have must
 *  never queue up beside the ones that came out "no". */
const verdict = (v: boolean | null | undefined) =>
  v == null ? null : (v ? 1 : 0);

/** Evidence strength, as an order. A capture outranks a reconstruction
 *  because it IS stronger evidence; a fixture with no read at all has no
 *  value here and sorts last with every other absence. */
const originRank = (r: ReviewRow) => {
  if (!isRead(r.pre_kickoff.state)) return null;
  return r.pre_kickoff.origin === "captured" ? 2 : 1;
};

const read = (r: ReviewRow) =>
  isRead(r.pre_kickoff.state) ? r.pre_kickoff.state : null;

export const REVIEW_SORT_MODES: ReviewSortMode[] = [
  // The default: a review is read backwards from now.
  { id: "kickoff", label: "kickoff", defaultDir: "desc",
    value: (r) => {
      const t = Date.parse(r.kickoff || "");
      return Number.isNaN(t) ? null : t;
    },
    nullNote: "no kickoff time sorts last" },
  // The board's own key, on the matches that already happened. Magnitude,
  // exactly as above the divider — how far apart, not which way.
  { id: "gdg", label: "GD/g gap", defaultDir: "desc",
    value: (r) => { const s = read(r); return s ? Math.abs(s.gdg_gap) : null; },
    nullNote: "no pre-kickoff read sorts last" },
  { id: "ppg", label: "ppg gap", defaultDir: "desc",
    value: (r) => { const s = read(r); return s ? Math.abs(s.ppg_gap) : null; },
    nullNote: "no pre-kickoff read sorts last" },
  { id: "rank", label: "rank gap", defaultDir: "desc",
    value: (r) => { const s = read(r); return s ? Math.abs(s.rank_gap) : null; },
    nullNote: "no pre-kickoff read sorts last" },
  // Signed, like the board's tier keys: the sign is the finding.
  { id: "tier_ovr", label: "overall tier gap", defaultDir: "desc",
    value: (r) => { const s = read(r); return s ? s.tier_gaps.ovr : null; },
    nullNote: "no pre-kickoff read sorts last" },
  { id: "fav_won", label: "favourite won", defaultDir: "desc",
    value: (r) => verdict(r.fit.favourite_won),
    nullNote: "not known sorts last — a missing verdict is not a “no”" },
  { id: "confirmed", label: "read confirmed", defaultDir: "desc",
    value: (r) => verdict(r.fit.confirmed_at_20),
    nullNote: "not known sorts last — a missing verdict is not a “no”" },
  { id: "share_ft", label: "shot share · FT", defaultDir: "desc",
    value: (r) => r.shot_state.full_time?.shot_share ?? null,
    nullNote: "no shot state sorts last" },
  { id: "share_20", label: "shot share · 20'", defaultDir: "desc",
    value: (r) => r.shot_state.at_20?.shot_share ?? null,
    nullNote: "no shot state sorts last" },
  { id: "origin", label: "captured first", defaultDir: "desc",
    value: originRank,
    nullNote: "no pre-kickoff read sorts last" },
];

export interface ReviewSort { mode: ReviewSortModeId; dir: SortDir; }

/** The tail's own rule: most recent kickoff first. */
export const REVIEW_DEFAULT_SORT: ReviewSort = { mode: "kickoff", dir: "desc" };

export const reviewModeById = (id: string): ReviewSortMode | undefined =>
  REVIEW_SORT_MODES.find((m) => m.id === id);

export const isDefaultReviewSort = (s: ReviewSort): boolean =>
  s.mode === REVIEW_DEFAULT_SORT.mode && s.dir === REVIEW_DEFAULT_SORT.dir;

/** Most recent kickoff first — the tail's default, reused as the
 *  tie-break under every other key. A row with no parseable kickoff goes
 *  to the end of the base order rather than to the front, so a bad
 *  timestamp cannot promote a row it says nothing about. */
const recentFirst = (a: ReviewRow, b: ReviewRow) => {
  const ta = Date.parse(a.kickoff || "");
  const tb = Date.parse(b.kickoff || "");
  const va = Number.isNaN(ta) ? -Infinity : ta;
  const vb = Number.isNaN(tb) ? -Infinity : tb;
  return vb - va;
};

/** Reorder — NEVER filter — one league's finished rows. */
export function sortReviewRows(rows: ReviewRow[], sort: ReviewSort): ReviewRow[] {
  const mode = reviewModeById(sort.mode)
    ?? reviewModeById(REVIEW_DEFAULT_SORT.mode)!;
  return orderBy(rows, mode.value, sort.dir, recentFirst);
}

// ---- persistence: a per-viewer convenience, never a requirement ---------
// A SEPARATE KEY SPACE from the board's `picker.colsort.*`. The two sorts
// are independent by design, and sharing a key would silently couple them
// the first time someone reused a mode id.

const storageKey = (league: string) => `picker.reviewsort.${league}`;

export function loadReviewSort(league: string): ReviewSort {
  try {
    const raw = window.localStorage.getItem(storageKey(league));
    if (!raw) return REVIEW_DEFAULT_SORT;
    const parsed = JSON.parse(raw) as { mode?: unknown; dir?: unknown };
    const mode = typeof parsed.mode === "string"
      ? reviewModeById(parsed.mode) : undefined;
    if (!mode) return REVIEW_DEFAULT_SORT;   // a mode we no longer have
    const dir = parsed.dir === "asc" || parsed.dir === "desc"
      ? parsed.dir : mode.defaultDir;
    return { mode: mode.id, dir };
  } catch {
    return REVIEW_DEFAULT_SORT;
  }
}

export function saveReviewSort(league: string, s: ReviewSort): void {
  try {
    if (isDefaultReviewSort(s)) {
      // reset means FORGET — a stored default would shadow a future
      // change of the default itself
      window.localStorage.removeItem(storageKey(league));
    } else {
      window.localStorage.setItem(storageKey(league), JSON.stringify(s));
    }
  } catch { /* convenience only — sorting still works for this visit */ }
}

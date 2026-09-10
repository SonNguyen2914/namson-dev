// THE CROSS-LEAGUE FIELD, as a payload and as a fixture's read of it.
//
// One competition, three axes — overall (Elo), attack and defence (goals)
// — every club carrying a value, a 95% interval, and the SET of tier
// bands its interval touches. Served by GET /api/comp/{key}/ratings
// (backend src/picker/cross_league_axes.py).
//
// WHY THE TYPES LIVE HERE AND NOT IN THE COMPONENT THAT DRAWS THEM. Two
// surfaces read this payload now — the field page, which renders the
// whole table, and a board card, which renders two clubs' standing in
// it. A shared shape imported from a component would make the card
// depend on the table's renderer to know what a tier is.
//
// NOTHING HERE IS A TRADING SIGNAL, and nothing here decides. The
// backend scores no outcome, reads no price, and grades no ordering
// against a market; these functions rearrange what it says and add
// nothing.

import type {
  BoardRow, FieldSide, RowField,
} from "./pickerApi";

/** One club on one axis. */
export interface AxisRow {
  rank: number;
  club: string;
  league: string | null;
  value: number;
  half_width_95: number;
  interval: [number, number];
  /** THE FIRST BAND OF `tier_set`, NEVER THE READ ON ITS OWN. Kept
   *  because the payload carries it and dropping a field silently is its
   *  own kind of lie — but a surface that prints this number alone
   *  asserts a placement the measurement refuses. See `tierSet`. */
  tier: number;
  /** EVERY BAND THIS CLUB'S 95% INTERVAL TOUCHES. This is the read. On
   *  the attack axis 33 of 36 clubs touch more than one; on defence
   *  almost every one does. */
  tier_set: number[];
  straddles: boolean;
  /** the placeability floor refused to place this club on the first
   *  reading — the rating stands, the band was too wide */
  below_floor: boolean;
  /** per-game rate on the goal axes; null on Elo, which has no per-game
   *  reading and must never be printed as one */
  rate: number | null;
  floor_note: string | null;
}

export interface Axis {
  axis: string;
  label: string;
  bands: number;
  distinguishable_levels: number;
  unit: string;
  why_this_many_bands: string;
  cuts: number[];
  span: [number, number];
  rows: AxisRow[];
  /** how many of this axis's clubs straddle a cut — the payload's own
   *  count, never one recomputed here */
  straddling: number;
  placed: number;
}

export interface Ratings {
  competition: string;
  passes: string;
  axes: Record<string, Axis> | null;
  below_floor_clubs?: string[];
  below_floor_note?: string;
  axes_disagree_note?: string;
  why_not?: string;
  display?: string;
}

/** The reading order of the axes. Overall first because it is the one
 *  ladder a reader already has a question about; attack and defence
 *  after it because they are the pair that CROSS in a fixture. */
export const AXIS_ORDER = ["ovr", "atk", "def"] as const;

/** THE THREE STATES OF A FIELD READ, kept apart because they are three
 *  different facts and only one of them is a blank space.
 *
 *  `error`  — the request failed. NAMED wherever it lands; never drawn
 *             as a club with no rating.
 *  `data`   — it answered. `data.axes === null` is its own fact again:
 *             a competition nobody has measured, which is not an empty
 *             table.
 *  neither  — it has not answered yet. The only one a blank describes. */
export interface FieldRead {
  data: Ratings | null;
  error: string | null;
  loading: boolean;
}

/** A TIER IS A SET, AND THIS IS HOW IT IS SAID.
 *
 *  "2·3" — the bands this club's 95% interval touches, in the payload's
 *  own order. Never "2", and never "2–3" collapsed to a midpoint: the
 *  reason this exists is the `OVR 1v1` defect, where two clubs the
 *  evidence could not separate were printed as level.
 *
 *  Returns null for an empty set rather than an empty string, so a
 *  caller cannot render "tier " with nothing after it — a club with no
 *  band is not a club in band zero. */
/** ONE NUMBER, NOT THE SET (2026-09-10). This joined the whole
 *  `tier_set` with "·", so a club whose interval touched four bands
 *  printed "2·3·4·5" in a 10px trio — and the operator rejected exactly
 *  that: "why ovr has 2.3.4 for sabah and not one concrete number?"
 *
 *  THE UNCERTAINTY IS NOT DROPPED, IT IS MOVED TO WHERE IT READS. The
 *  point `tier` is where the estimate actually falls; the dagger beside
 *  it (FloorMark) says the band is too wide to place in one tier and
 *  carries the backend's own reason on hover. A number plus a mark is
 *  legible at 10px in a four-across track; a four-element set is not.
 *  `tier_set` stays on the payload and in the title attribute, so
 *  nothing measured is lost and a guard can still read it. */
export function tierSet(row: Pick<AxisRow, "tier" | "tier_set">): string | null {
  return row.tier_set.length > 0 ? String(row.tier) : null;
}

/** Every club on one axis, by name. Built per call rather than cached:
 *  the payload is small and a stale index of a refetched field is a
 *  worse bug than a re-walk of 36 rows. */
function byClub(ratings: Ratings, axis: string): Map<string, AxisRow> {
  const a = ratings.axes?.[axis];
  return new Map((a?.rows ?? []).map((r) => [r.club, r]));
}

/** THE FIXTURE'S FIELD BLOCK, FROM WHICHEVER SOURCE HAS IT.
 *
 *  ONE SHAPE, TWO SOURCES, AND THE BACKEND'S ALWAYS WINS. `row.field`
 *  is the block the board itself serves (pickerApi.RowField); the
 *  ratings payload is the SAME numbers, keyed by club, served by an
 *  endpoint that already existed. So a card written against this
 *  function reads the backend's block the day it lands and reads the
 *  field endpoint until then, with nothing in the component changing.
 *
 *  WHAT IT DOES NOT DERIVE. `tier_gap` and `shape` come back NULL from
 *  the ratings join, because that payload does not carry them and
 *  differencing two band sets here would be the frontend deciding
 *  something the backend deliberately decides. A null gap is not a gap
 *  of zero: the caller keeps the row's own backend values, which are
 *  still the backend's word. See PickerRead.TierGaps.
 *
 *  HALF A PAIR IS NOT A PAIR. A club this field does not hold gets no
 *  block at all rather than a block with one side in it — a rank
 *  standing alone beside a blank invites the reader to supply the
 *  missing half, which is the same defect as drawing half a leg. The
 *  card then falls back to its league read whole, and the `i` that
 *  opens the field's ranks is simply not drawn, so the affordance is
 *  never an empty promise.
 *
 *  Every axis is asked, not just the overall one: a club on the Elo
 *  axis and absent from the goals axes is a real shape — they are read
 *  from different measurements with their own floors. */
export function fieldFor(
  row: Pick<BoardRow, "favourite" | "opponent" | "field">,
  ratings: Ratings | null | undefined,
): RowField | null {
  if (row.field) return row.field;
  if (!ratings?.axes) return null;

  const side = (axis: string, club: string): FieldSide | null => {
    const r = byClub(ratings, axis).get(club);
    if (!r) return null;
    return {
      rank: r.rank, tier: r.tier, tier_set: r.tier_set,
      straddles: r.straddles, below_floor: r.below_floor,
      floor_note: r.floor_note,
    };
  };

  const axes = {} as RowField["axes"];
  for (const k of AXIS_ORDER) {
    const fav = side(k, row.favourite), opp = side(k, row.opponent);
    if (!fav || !opp) return null;
    axes[k] = { fav, opp, tier_gap: null };
  }
  /* THE N OF THE 1..N AXIS IS THE PAYLOAD'S OWN COUNT, never 36 typed
     here: the field is refitted whenever a league is admitted or drops
     out, and a total frozen in this file would go on drawing every
     dumbbell against a ladder that no longer exists. */
  return {
    competition: ratings.competition,
    size: ratings.axes.ovr?.rows.length ?? 0,
    axes,
    shape: null,
  };
}

/** THE COMPETITION'S FIELD, FETCHED — with every failure NAMED.
 *
 *  A rejected promise here reaches a renderer that must tell "we could
 *  not read the field" from "this competition has no field": the first
 *  is a broken pipe, the second is a measurement nobody has made, and
 *  they look identical as a blank space. So the failures carry
 *  sentences, and the caller keeps them.
 *
 *  A 200 IS NOT A PAYLOAD. `r.json()` alone hands a literal `null` back
 *  typed as Ratings, which a caller renders as a field with no clubs in
 *  it — a claim about the competition made off a read that never
 *  landed. Same discipline as `fetchBoard`. */
export async function fetchRatings(
  competition: string, signal?: AbortSignal,
): Promise<Ratings> {
  let r: Response;
  try {
    r = await fetch(`/api/comp/${encodeURIComponent(competition)}/ratings`,
                    { signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new Error(
      "the field request never reached the server — check the connection "
      + "and try again");
  }
  if (!r.ok) {
    let detail = "";
    try {
      const body = await r.json();
      detail = body?.detail || body?.error || "";
    } catch { /* non-JSON body; the status is all we have */ }
    throw new Error(detail || `the field read answered ${r.status}`);
  }
  const raw = await r.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(
      `the server answered ${r.status} with a body that is not JSON `
      + `(${raw.length} characters) — that is an answer we could not `
      + "read, not a field with no clubs in it");
  }
  if (body === null || typeof body !== "object") {
    throw new Error(
      `the server answered ${r.status} with ${JSON.stringify(body)} where `
      + "a field was expected — there is no payload here, and it must not "
      + "be read as an unmeasured competition");
  }
  return body as Ratings;
}

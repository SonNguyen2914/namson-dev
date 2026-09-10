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
export function tierSet(row: Pick<AxisRow, "tier_set">): string | null {
  return row.tier_set.length > 0 ? row.tier_set.join("·") : null;
}

/** Every club on one axis, by name. Built per call rather than cached:
 *  the payload is small and a stale index of a refetched field is a
 *  worse bug than a re-walk of 36 rows. */
function byClub(ratings: Ratings, axis: string): Map<string, AxisRow> {
  const a = ratings.axes?.[axis];
  return new Map((a?.rows ?? []).map((r) => [r.club, r]));
}

/** One directed leg of a fixture: somebody's attack against somebody
 *  else's defence. */
export interface CrossLeg {
  attacker: string;
  defender: string;
  attack: AxisRow;
  defence: AxisRow;
}

export interface FixtureField {
  /** the two clubs on the OVERALL axis — the one place side-by-side is
   *  the right comparison, because it is a single ladder */
  ovr: { fav: AxisRow | null; opp: AxisRow | null };
  /** the favourite attacking: its attack against the opponent's DEFENCE */
  favAttacking: CrossLeg | null;
  /** and back the other way */
  oppAttacking: CrossLeg | null;
  /** the clubs this field does not hold, by name. A club we do not hold
   *  is not a club with no attack, so it is NAMED rather than drawn as
   *  a missing value — see the backend's own `crossed()`, which returns
   *  None for such a leg for exactly this reason. */
  missing: string[];
}

/** A FIXTURE'S STANDING IN THE FIELD, WITH THE AXES CROSSED.
 *
 *  In a match the favourite's attack faces the opponent's DEFENCE. A
 *  card comparing attack to attack and defence to defence puts two
 *  clubs side by side, which is not a matchup at all — this pairs them
 *  the way the game does. Mirrors `cross_league_axes.crossed()`; the
 *  ratings payload carries both sides, so the pairing is done where it
 *  is drawn rather than fetched a second time per fixture.
 *
 *  A LEG IS NULL WHEN EITHER END IS ABSENT, and the absent club's name
 *  goes in `missing`. Half a leg would invite the reader to supply the
 *  other half.
 *
 *  Returns null when there is no field at all — an unmeasured
 *  competition, or a read that has not landed. That is the caller's
 *  cue to say which, not to draw a gap. */
export function fixtureField(
  ratings: Ratings | null, favourite: string, opponent: string,
): FixtureField | null {
  if (!ratings?.axes) return null;
  const ovr = byClub(ratings, "ovr");
  const atk = byClub(ratings, "atk");
  const def = byClub(ratings, "def");

  const leg = (a: string, d: string): CrossLeg | null => {
    const attack = atk.get(a), defence = def.get(d);
    if (!attack || !defence) return null;
    return { attacker: a, defender: d, attack, defence };
  };

  /* WHICH CLUB THE FIELD DOES NOT HOLD, asked of every axis rather than
     of one. A club present on the Elo axis and absent from the goals
     axes is a real shape — the two are read from different measurements
     with their own floors — and reporting it as present would leave a
     leg silently undrawn with nothing saying why. */
  const held = (c: string) => ovr.has(c) && atk.has(c) && def.has(c);
  const missing = [favourite, opponent].filter((c) => !held(c));

  return {
    ovr: { fav: ovr.get(favourite) ?? null, opp: ovr.get(opponent) ?? null },
    favAttacking: leg(favourite, opponent),
    oppAttacking: leg(opponent, favourite),
    missing,
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

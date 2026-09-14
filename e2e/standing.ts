// THE HOIST, APPLIED TO A RECORDED PAYLOAD — `watched-strip-v2`.
//
// Backend #129 ("The standing prose is true of every match, so it rides
// once") moves the sentences that were byte-identical on every match —
// 18,989 of the 21,511 bytes a `read` block cost, measured on a 27-match
// production poll — off each match and onto the envelope under
// `standing_blocks`, exactly as `refusal_codes` and `policy_codes`
// already rode once. The payload went 1,225,764 -> 468,276 bytes.
//
// THE v2 FIXTURES ARE DERIVED FROM THE v1 ONES RATHER THAN TYPED.
// This repo has been bitten five times in one day by a fixture written
// from a brief instead of from the emitter, and #129 itself had two
// tests pass vacuously for the same reason. So nothing here invents a
// v2 payload: `toV2` takes a payload RECORDED off this route and
// applies the route's own transformation to it, which means every
// sentence on the v2 side is a sentence the wire actually carried.
//
// WHAT IS DECLARED HERE AND WHERE IT CAME FROM. `DECLARED` below is
// `api/main.py::watched_strip_standing_blocks()` at #129's head
// (d392017), read off the source by AST rather than transcribed:
// `read` is `live_read.STANDING` expanded plus the three registries
// read_for_fixture() names one by one, and the other five blocks are
// the constants the route lists. It is a mirror of a declaration in
// another repository and therefore the one thing here that can go
// stale — so `hoisted()` reports what it actually moved, and the guard
// in watched-strip.spec.ts asserts that every block moved something. A
// key name misspelled here is a red test, not a silent pass.
//
// THAT WAS NOT ENOUGH, AND THE GAP IT LEFT IS WHY e2e/standing-wire.ts
// EXISTS. "Every block moved something" is satisfied by sixteen keys
// exactly as well as by seventeen. A misspelled key is red because it
// moves nothing and its block drops out; a key simply LEFT OUT is
// invisible — it is on no fixture, so nothing here ever asks about it,
// and the sentence goes on riding on all 27 matches. `read` was short
// by `a_rate_needs_time` (3,818 bytes/match) from the day this mirror
// was written until 2026-09-14, with every spec in the suite green.
//
// It could not be caught from inside this file. The v2 fixtures are
// produced BY `toV2()` FROM `DECLARED`, so checking the mirror against
// anything derived from it only proves it agrees with itself.
// `e2e/standing-wire.ts` records the emitter's published declaration —
// key names off production's own `standing_blocks`, which api/main.py
// fills from the registry verbatim before it walks a single match — and
// the guard "the mirror is COMPLETE against the emitter's published
// declaration" asserts SET EQUALITY both ways. A key missing here is
// now red. KEEP THE TWO IN STEP BY RE-READING THE EMITTER, never by
// copying one list into the other: they are two readings of one
// declaration and the value is entirely in their being able to
// disagree.
//
// WHAT DID NOT MOVE, and it is the point of the change rather than an
// exception to it: every refusal, every `basis`, every coded sentence
// and every registered hole that FIRES still rides on its own match.
// So do `model_live.m1` / `.price_baseline_hole`, `states.cut`,
// `states.basis`, everything under `positions[]`, and — load-bearing
// for LiveCard — `states.home.conventions` / `states.away.conventions`.

/** `api/main.py::watched_strip_standing_blocks()`, block by block.
 *  Keyed by the per-match block the words used to ride on. */
export const DECLARED: Record<string, readonly string[]> = {
  read: [
    "read_is_a_description", "every_name_is_counted_and_said",
    "no_composite_before_m1", "the_wall_has_a_limit",
    "baseline_is_joined", "the_join_is_not_state_partitioned",
    "the_favourite_flag_is_price_native", "a_rate_needs_time",
    "possession_is_distrusted", "persisted_at_the_time",
    "the_clock_is_the_match_clock",
    "a_counter_that_falls_is_a_revision",
    "a_dismissal_does_not_void_a_description",
    "no_history_is_not_quiet", "components_registry", "kinds",
    "registered_holes",
  ],
  model_live: [
    "line", "basis", "not_the_number", "coverage_rule",
  ],
  states: [
    "axes", "chances_basis", "score_basis", "contest_basis",
    "conventions", "shows_not_decides", "vocabulary",
  ],
  shared_exit_book: [
    "rule", "consult_rule",
  ],
  coverage: [
    "coverage_is_anchored", "no_history_is_not_quiet",
  ],
  state: [
    "period_stays_on_the_strip",
  ],
};

export const WATCHED_STRIP_V1 = "watched-strip-v1";
export const WATCHED_STRIP_V2 = "watched-strip-v2";

// The route's own three sentences, verbatim off #129's api/main.py.
// A fixture that paraphrases the emitter is a fixture that proves the
// frontend agrees with the frontend.

export const STANDING_RIDES_ONCE =
  "THE STANDING PROSE RIDES ONCE, ON THE ENVELOPE, AND THE MOVE "
  + "IS NAMED HERE RATHER THAN LEFT AS A HOLE. Measured on a "
  + "27-match poll: of the 21,511 bytes `read` cost per match, "
  + "18,989 were BYTE-IDENTICAL on all 27 — the same charters, the "
  + "same component registry and the same registered holes, re-sent "
  + "once per declared fixture, growing linearly with the set an "
  + "operator declares. They are facts about the EMITTER, true of "
  + "every match at once, so they are hoisted to `standing_blocks` "
  + "exactly as `refusal_codes` and `policy_codes` already ride "
  + "once — this route's own precedent, followed rather than "
  + "replaced. WHAT DID NOT MOVE IS THE POINT: every refusal, every "
  + "`basis`, every coded sentence and every registered hole that "
  + "FIRES still rides on the match, at the site where the claim is "
  + "made, in the registry's own words. What moved is the standing "
  + "rule a reader consults AFTER meeting the claim, and "
  + "`standing_blocks.where` says, key by key, where each one went.";

export const STANDING_DECLARED_NOT_DEDUCED =
  "A KEY IS HOISTED BECAUSE IT IS A NAMED MODULE CONSTANT, NEVER "
  + "BECAUSE IT HAPPENED TO BE EQUAL ON THIS POLL. The tempting "
  + "implementation is to fold the matches together and lift "
  + "whatever repeats; it is wrong in both directions, and both "
  + "failures are silent. A one-match poll makes EVERY per-match "
  + "number look standing, and two matches at 1-0 in the 63rd "
  + "minute would hoist a score. So the set is DECLARED — "
  + "`watched_strip_standing_blocks()` names the emitter constant "
  + "behind every key it lifts — and the lift is conditional on the "
  + "emitted value still EQUALLING that constant. A block that "
  + "carries something else under a standing key keeps it, on the "
  + "match, where a reader meets it.";

/** api/main.py's WATCHED_STRIP_PERIOD_STAYS_ON_THE_STRIP — the one
 *  hoisted sentence the ROUTE owns rather than an emitter. */
export const PERIOD_STAYS_ON_THE_STRIP =
  "A MATCH AT THE INTERVAL HAS NOT STOPPED BEING WATCHED. It is "
  + "drawn, it keeps `in_play: true` — the provider holds "
  + "`match_state` at `in` through the break and this surface "
  + "reports the tape rather than second-guessing it — and the "
  + "period axis beside it says the ball is not moving, with the "
  + "refusal naming why no number is computed. Nothing is filtered: "
  + "a card that vanished at half-time would take its positions and "
  + "its exit ladder with it, at the one moment there is time to "
  + "read them.";

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj =>
  v != null && typeof v === "object" && !Array.isArray(v);

/** `api/main.py::_hoisted`, in TypeScript: `block` without the keys
 *  whose value IS the standing prose, and the same rule applied to any
 *  block NESTED inside it that the registry also names (`read` carries
 *  `coverage`). Every key it drops is recorded in `moved` — which is
 *  what keeps a misspelled key name from passing as "nothing to move".
 *
 *  THE RECURSION DESCENDS ONLY THROUGH KEYS THE REGISTRY NAMES, which
 *  is the backend's rule and not a simplification of it: it cannot
 *  wander into `read.sides.<side>.state`, whose key collides with a
 *  registered block name. */
// ONE DELIBERATE DIFFERENCE FROM THE BACKEND, NAMED RATHER THAN LEFT
// TO BE FOUND. `api/main.py::_hoisted` drops a key only while the
// emitted value still EQUALS the declared constant, so a block that
// carries a one-off wording under a standing key keeps it on the
// match. This helper drops by key NAME alone, because it cannot check
// equality without importing the other repository's constants — which
// makes every fixture here the HARDER case (the key is gone) and never
// the easier one. The case it skips is not left untested: the guard
// "no sentence is drawn TWICE when the envelope and the match both
// carry it" in watched-strip.spec.ts puts a value back on the match
// and pins exactly that shape.
function hoisted(name: string, block: unknown, moved: Obj): unknown {
  if (!isObj(block)) return block;
  const standing = DECLARED[name] ?? [];
  const out: Obj = {};
  for (const [k, v] of Object.entries(block)) {
    if (standing.includes(k)) {
      // the value is what the RECORDED payload carried, so the
      // envelope's copy is the emitter's own words by construction
      ((moved[name] ??= {}) as Obj)[k] = v;
      continue;
    }
    out[k] = k in DECLARED ? hoisted(k, v, moved) : v;
  }
  return out;
}

export interface V2Options {
  /** the version string to announce. Defaults to `watched-strip-v2`. */
  version?: string;
}

/** A RECORDED v1 PAYLOAD, AS #129's ROUTE NOW EMITS IT.
 *
 *  Every match block goes through the hoist, the words it dropped ride
 *  once on `standing_blocks.blocks`, and `where` maps each old path to
 *  its new one — derived from what was actually moved, exactly as the
 *  route derives it from what it declared.
 *
 *  A block the recorded payload never carried simply contributes
 *  nothing: these fixtures are cut to the keys a spec exercises, and a
 *  hoist that invented an envelope entry for a key no match ever sent
 *  would be this helper writing the payload rather than transforming
 *  it. */
export function toV2<T extends object>(v1: T, opts: V2Options = {}): Obj {
  const moved: Obj = {};
  const src = v1 as unknown as Obj;
  const matches = Array.isArray(src.matches)
    ? src.matches.map((m) => {
        if (!isObj(m)) return m;
        const out: Obj = {};
        for (const [k, v] of Object.entries(m)) {
          out[k] = k in DECLARED ? hoisted(k, v, moved) : v;
        }
        return out;
      })
    : src.matches;
  const where: Record<string, string> = {};
  for (const block of Object.keys(moved).sort()) {
    for (const key of Object.keys(moved[block] as Obj).sort()) {
      where[`matches[].${block}.${key}`] =
        `standing_blocks.blocks.${block}.${key}`;
    }
  }
  return {
    ...src,
    version: opts.version ?? WATCHED_STRIP_V2,
    ...(matches === undefined ? {} : { matches }),
    standing_blocks: {
      moved: STANDING_RIDES_ONCE,
      declared_not_deduced: STANDING_DECLARED_NOT_DEDUCED,
      moved_from: WATCHED_STRIP_V1,
      moved_in: opts.version ?? WATCHED_STRIP_V2,
      where,
      blocks: moved,
    },
  };
}

/** What `toV2` actually lifted off a payload: `block -> {key: words}`.
 *  Exported so a guard can assert the hoist was not a no-op — a fixture
 *  that moved nothing certifies a reader against a shape the route does
 *  not emit, which is how two of #129's own tests passed vacuously. */
export function movedBy<T extends object>(v1: T): Obj {
  return (toV2(v1).standing_blocks as Obj).blocks as Obj;
}

// IS THIS COMPETITION PLAYING TODAY OR TOMORROW?
//
// One question, asked of the competition's OWN fixture feed, so a chip in
// the top bar can say WHEN — and nothing else.
//
// WHY IT IS NOT READ OFF THE PICKER BOARD. The board is the operator's
// declaration of what he wants ranked, and on 2026-09-09 the Champions
// League left it: `tables.BOARD_COLUMNS` no longer names `ucl`, so
// /api/picker/board serves no UCL row, no UCL league entry and no UCL
// kickoff. A glow derived from that payload would go dark the moment the
// competition came off the board — reading "nothing soon" when what
// actually happened is "the board stopped being asked". Leaving the board
// is not leaving the site, and the competition's own page still has its
// eighteen league-phase fixtures.
//
// So the source is GET /api/comp/{key}/fixtures, which is what
// /bet-suggester/comp/{key} already reads and what `src.competitions`
// serves from `VIEWERS` — a registry that has nothing to do with
// BOARD_COLUMNS. It survives the removal because it never depended on it.
//
// WHAT "TODAY OR TOMORROW" MEANS HERE. The board's own local day, from
// lib/matchday: every matchday band on every surface is bucketed by
// `localDay` in one fixed zone, and a chip with a second notion of today
// would light up on a day the bands below it do not agree exists.
//
// WHAT THIS DELIBERATELY CANNOT SAY. Whether to do anything. It counts
// fixtures on two calendar days; it holds no price, no probability and no
// verdict, and the state it returns has no word in it that could become
// one. See `SoonRead`: the third state is UNKNOWN, and it is the default.
import { localDay, soonDayKeys } from "./matchday";

/** A read of the two days ahead — three states, and the third is why
 *  this is a type rather than a boolean.
 *
 *  MISSING IS NEVER ZERO. `known: false` is a read that has not landed
 *  or did not survive: in flight, refused, network gone, a payload that
 *  was not a fixture list. It is NOT "no match soon" and must never
 *  render as one — a chip that dims on a failed fetch is claiming an
 *  empty slate off a request that never answered.
 *
 *  `known: true` carries the two counts separately because they are two
 *  different days, and "today" and "tomorrow" are the two words the chip
 *  is allowed to say. */
export type SoonRead =
  | { known: false }
  | { known: true; today: number; next: number };

export const UNKNOWN: SoonRead = { known: false };

/** THE WINDOW ASKED OF THE PROVIDER, in days from now.
 *
 *  Three, for a question about two. The endpoint's `days` is a rolling
 *  UTC cut — `kickoff <= now + days*24h` — while the two days we care
 *  about are CALENDAR days in America/Los_Angeles, and at one second past
 *  local midnight the end of tomorrow is 48 hours away, plus an hour on
 *  the day the clocks go back. A 2-day cut would silently drop the last
 *  fixture of tomorrow evening a few times a year. The extra day costs
 *  one page of JSON and the filter below is the authority either way. */
export const SOON_DAYS = 3;

/** The shape this needs out of the comp fixtures payload, and no more.
 *  A fixture with no `kickoff_utc` cannot be placed on a day and is not
 *  counted on one — the same refusal `groupByDay`'s callers make. */
type SoonFixture = { kickoff_utc?: string | null };

/** THE COUNT, from a payload and an instant. Split out from the fetch so
 *  the rule can be tested against a named clock instead of a race, and
 *  so the fetch has nothing in it but I/O.
 *
 *  Anything that is not a fixture ARRAY leaves this UNKNOWN rather than
 *  zero: a 200 carrying an error object, a `{"detail": …}` refusal or a
 *  payload whose shape changed are all reads that did not answer the
 *  question, and every one of them would otherwise arrive as a confident
 *  "nothing on". */
export function countSoon(payload: unknown, now: Date = new Date()): SoonRead {
  const fixtures = (payload as { fixtures?: unknown } | null)?.fixtures;
  if (!Array.isArray(fixtures)) return UNKNOWN;
  const [today, next] = soonDayKeys(now);
  let t = 0, n = 0;
  for (const f of fixtures as SoonFixture[]) {
    const k = f?.kickoff_utc ? localDay(f.kickoff_utc) : "";
    if (!k) continue;
    if (k === today) t += 1;
    else if (k === next) n += 1;
  }
  return { known: true, today: t, next: n };
}

/** Is there anything to point at? Kept beside `countSoon` so the chip
 *  and any guard over it ask one function rather than two conditions
 *  that can drift. An unknown read is never "soon" — and never "not". */
export const isSoon = (r: SoonRead) =>
  r.known && (r.today > 0 || r.next > 0);

/** WHEN, in words, or null when there is nothing to say.
 *
 *  THE WHOLE VOCABULARY OF THIS FEATURE IS IN THIS FUNCTION, and it is
 *  four phrases long. It says which day; it does not say what that is
 *  worth, what to do about it, or that it is worth doing anything at
 *  all. No "don't miss", no "act now", no "value", no exclamation — the
 *  charter is IT SHOWS; IT DOES NOT DECIDE, and a nav chip is the last
 *  place a verdict should be smuggled in.
 *
 *  Null for an unknown read AND for a measured none: silence. An
 *  ordinary chip asserts nothing, which is exactly right for both — one
 *  because there is nothing to report and the other because we do not
 *  know. The two are still distinguishable to a caller that cares (and
 *  to a guard) through `SoonRead` itself; they are simply not worth two
 *  different silences on screen. */
export function soonLabel(r: SoonRead): string | null {
  if (!r.known) return null;
  const { today, next } = r;
  if (today > 0 && next > 0) return "matches today and tomorrow";
  if (today > 0) return today === 1 ? "a match today" : "matches today";
  if (next > 0) return next === 1 ? "a match tomorrow" : "matches tomorrow";
  return null;
}

/** The one request. Separated from React so a caller can await it and a
 *  test can drive it; the hook is in components/CompRail.tsx. */
export async function fetchSoon(
  key: string, signal?: AbortSignal, now?: Date,
): Promise<SoonRead> {
  try {
    const r = await fetch(
      `/api/comp/${encodeURIComponent(key)}/fixtures?days=${SOON_DAYS}`,
      { signal });
    if (!r.ok) return UNKNOWN;
    return countSoon(await r.json(), now);
  } catch {
    /* SWALLOWED(comp:soon-glow) — every failure here is the same
       answer, and it is UNKNOWN. An abort, a dead network, a body that
       is not JSON: none of them measured an empty slate, so none of
       them may dim a chip as though they had. Nothing else on the page
       depends on this read, and the surface it decorates degrades to
       an ordinary chip. */
    return UNKNOWN;
  }
}

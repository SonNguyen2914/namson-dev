// NO EMPTY BOARD COLUMNS (Son, 2026-10-07, "Seasonal and one-off rules").
//
// A competition that is OFF SEASON gets no column; its column returns
// when a match is in the board's window (~8 days ahead, so about a week
// before its next match). Off-season competitions are collapsed into ONE
// quiet line at the end of the tab:
//
//   Off season · Supercopa de España returns Tue Feb 2, 2027 · FA Community Shield — date not announced
//
// THE EXACT DAY OF THE NEXT SCHEDULED MATCH (Son, 2026-10-13: "for any
// competition, check the exact date the nearest match will be on, then
// show that return date"). The backend names it — `leagues[slug].
// next_match`, the kickoff of a match ESPN or API-Football LISTS, and the
// source that listed it (TRIVELA src/picker/next_match.py) — and this
// prints its day in America/Los_Angeles like the rest of the board, with
// the year only when it is not this year. When no source lists one the
// entry says "date not announced" — never a month, never "next season".
// WHICH
// competitions are off season is `isOffSeason` below: an edition that has
// finished or not started, never one that is merely between rounds. Hubs, finished cards and ratings stay reachable: each entry links
// to the competition's own page where one exists.
//
// This applies to every tab (Leagues, Cups, Nations). A narrowed route
// (`/bet-suggester/ucl`) is the competition's own page and keeps its
// column regardless.

import { TZ } from "./matchday";

const DAY = new Intl.DateTimeFormat("en-US", {
  weekday: "short", month: "short", day: "numeric", timeZone: TZ,
});
const YEAR = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: TZ });

/** A DATE-ONLY value ("2026-10-27", a match DAY the backend reads off
 *  ESPN's calendar) is that calendar day everywhere: pinned to noon UTC so
 *  the board's own zone (America/Los_Angeles) cannot pull it back a day.
 *  A full timestamp is returned as it is. */
export function asInstant(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
}

/** "Sat Oct 17" — or "Tue Feb 2, 2027" when the match is not in this
 *  year (both in America/Los_Angeles) — for an ISO kickoff or match day;
 *  null for nothing parseable. `now` is the year it is measured against. */
export function returnDate(iso: string | null | undefined,
                           now: Date = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(asInstant(iso));
  if (Number.isNaN(d.getTime())) return null;
  const day = DAY.format(d).replace(",", "");
  return YEAR.format(d) === YEAR.format(now) ? day : `${day}, ${YEAR.format(d)}`;
}

/** THE BACKEND'S ANSWER (`leagues[slug].next_match`): the kickoff of the
 *  next scheduled match and the source that lists it, or — kickoff null —
 *  why no source lists one. Absent on a column with a fixture in the
 *  window, and on a backend from before 2026-10-13. */
export interface NextMatch {
  kickoff: string | null;
  source?: string | null;
  round?: string | null;
  name?: string | null;
  reason?: string | null;
  checked_at?: string | null;
}

const SOURCE_WORDS: Record<string, string> = {
  espn_scoreboard_year: "ESPN's schedule",
  apifootball_fixtures_next: "API-Football's schedule",
};

/** The hover line under an entry: which match, from which source — or why
 *  no source lists one. */
export function nextMatchTitle(n: NextMatch | null | undefined): string | undefined {
  if (!n) return undefined;
  if (!n.kickoff) return n.reason ? `No source lists a next match: ${n.reason}` : undefined;
  const what = [n.name, n.round].filter(Boolean).join(" · ");
  const src = SOURCE_WORDS[n.source ?? ""] ?? n.source ?? "";
  return [what, src && `listed by ${src}`].filter(Boolean).join(" — ") || undefined;
}

/** The slugs among `slugs` that have at least one fixture (ranked row or
 *  refusal, upcoming or under way) drawn in them. `columnsOf` is the same
 *  reader the columns claim a row with, so the two cannot disagree. */
export function slugsInWindow<R>(
  slugs: readonly string[],
  rows: readonly R[],
  columnsOf: (r: R) => readonly string[],
): Set<string> {
  const want = new Set(slugs);
  const out = new Set<string>();
  for (const r of rows) {
    for (const c of columnsOf(r)) if (want.has(c)) out.add(c);
  }
  return out;
}

export interface OffSeasonEntry {
  slug: string;
  name: string;
  /** "returns Sat Oct 17" · "returns Tue Feb 2, 2027" · "date not announced" */
  when: string;
  /** the competition's own page, when it has one */
  href?: string;
  /** which match and which source, or why none — the entry's hover */
  title?: string;
}

export const NOT_ANNOUNCED = "date not announced";

/** One entry's wording: the exact day of the next scheduled match, else
 *  "date not announced" — never a month, never "next season". */
export function offSeasonWhen(next: string | null | undefined,
                              now: Date = new Date()): string {
  const d = returnDate(next, now);
  return d ? `returns ${d}` : NOT_ANNOUNCED;
}

/** The whole line as text — what the page prints, and what specs read. */
export function entryText(e: OffSeasonEntry): string {
  return e.when.startsWith("returns ") ? `${e.name} ${e.when}`
    : `${e.name} \u2014 ${e.when}`;
}

/** WHICH DATE A COMPETITION RETURNS ON. The backend's `next_match` when it
 *  sent one — its kickoff, or null when no source lists a match (and then
 *  nothing else is consulted: the backend looked). Only a payload with no
 *  `next_match` at all (a backend from before 2026-10-13) falls back to
 *  the day ESPN's calendar lists (`season.next_fixture`). */
export function returnKickoff(meta: {
  next_match?: NextMatch | null;
  season?: { next_fixture?: string | null } | null;
  next_fixture?: string | null;
} | null | undefined): string | null {
  if (!meta) return null;
  if (meta.next_match) return meta.next_match.kickoff ?? null;
  return meta.season?.next_fixture ?? meta.next_fixture ?? null;
}

export function offSeasonLine(entries: readonly OffSeasonEntry[]): string {
  return ["Off season", ...entries.map(entryText)].join(" · ");
}

/* ── IN SEASON OR OFF SEASON (Son, 2026-10-13 correction) ─────────────

   "EFL cup still on going, keep it there." The rule is about the SEASON,
   not the board's window. A competition whose edition is running —
   between rounds, or in a league's quiet week — KEEPS its column, drawn
   as the league's dashed rest-day card ("next · <date>", or "date not
   announced" when no source lists the next fixture — never a guessed
   date). Only a
   competition whose edition has FINISHED or has NOT STARTED folds into
   the off-season line. A one-match competition (the Finals & Super Cups
   group) is never "between rounds": it is drawn only when its match is
   in the window.

   The order of evidence: a fixture in the window (in season, always);
   then the payload's own season state (`meta.season.state`, derived on
   the backend from the edition's last-played and next-scheduled
   fixtures); then a declared fallback (`CupEntry.over`, the edition is
   known finished). With none of those the competition is taken to be IN
   season — keeping a column with "date not announced" is recoverable, hiding a
   running competition is not. */

export type SeasonState = "in_season" | "finished" | "not_started" | "unknown";

export function isOffSeason(input: {
  /** a fixture (ranked, refused, upcoming or under way) in the window */
  ahead: boolean;
  /** the payload's own reading of the edition, when it sends one */
  state?: SeasonState | null;
  /** declared fallback: the last edition is known finished */
  declaredOver?: boolean;
  /** a one-match competition (Finals & Super Cups) */
  oneMatch?: boolean;
}): boolean {
  if (input.ahead) return false;
  if (input.oneMatch) return true;
  if (input.state === "finished" || input.state === "not_started") return true;
  if (input.state === "in_season") return false;
  return Boolean(input.declaredOver);
}

/** The rest-day card's second line for an in-season column with nothing
 *  in the window: the next scheduled fixture's day (with its year when
 *  that is not this year), or "date not announced". */
export function restLine(next: string | null | undefined, cup: boolean,
                         label: (iso: string) => string,
                         now: Date = new Date()): string {
  if (next && !Number.isNaN(new Date(asInstant(next)).getTime())) {
    const at = asInstant(next);
    const y = YEAR.format(new Date(at));
    const year = y === YEAR.format(now) ? "" : `, ${y}`;
    return `next · ${label(at).toLowerCase()}${year}`;
  }
  return cup ? `next round · ${NOT_ANNOUNCED}` : `next fixture · ${NOT_ANNOUNCED}`;
}

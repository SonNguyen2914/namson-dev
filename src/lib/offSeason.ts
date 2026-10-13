// NO EMPTY BOARD COLUMNS (Son, 2026-10-07, "Seasonal and one-off rules").
//
// A competition that is OFF SEASON gets no column; its column returns
// when a match is in the board's window (~8 days ahead, so about a week
// before its next match). Off-season competitions are collapsed into ONE
// quiet line at the end of the tab:
//
//   Off season · Leagues Cup returns Jul 2027 · Campeones Cup returns next season
//
// The month is the month of the next KNOWN fixture (a payload's own
// `next_fixture`), or a declared season start. When neither is known the
// entry says "returns next season" — never a guessed date. WHICH
// competitions are off season is `isOffSeason` below: an edition that has
// finished or not started, never one that is merely between rounds. Hubs, finished cards and ratings stay reachable: each entry links
// to the competition's own page where one exists.
//
// This applies to every tab (Leagues, Cups, Nations). A narrowed route
// (`/bet-suggester/ucl`) is the competition's own page and keeps its
// column regardless.

import { TZ } from "./matchday";

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short", year: "numeric", timeZone: TZ,
});

/** A DATE-ONLY value ("2026-10-27", a match DAY the backend reads off
 *  ESPN's calendar) is that calendar day everywhere: pinned to noon UTC so
 *  the board's own zone (America/Los_Angeles) cannot pull it back a day.
 *  A full timestamp is returned as it is. */
export function asInstant(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
}

/** "Jul 2027" for an ISO kickoff or match day, or null for nothing
 *  parseable. */
export function returnMonth(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(asInstant(iso));
  if (Number.isNaN(d.getTime())) return null;
  return MONTH.format(d);
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
  /** "returns Jul 2027" · "returns next season" */
  when: string;
  /** the competition's own page, when it has one */
  href?: string;
}

/** One entry's wording: the month of the next known fixture (or a
 *  declared season start), else "returns next season" — never a guess. */
export function offSeasonWhen(next: string | null | undefined): string {
  const m = returnMonth(next);
  return m ? `returns ${m}` : "returns next season";
}

/** The whole line as text — what the page prints, and what specs read. */
export function entryText(e: OffSeasonEntry): string {
  return `${e.name} ${e.when}`;
}

export function offSeasonLine(entries: readonly OffSeasonEntry[]): string {
  return ["Off season", ...entries.map(entryText)].join(" · ");
}

/* ── IN SEASON OR OFF SEASON (Son, 2026-10-13 correction) ─────────────

   "EFL cup still on going, keep it there." The rule is about the SEASON,
   not the board's window. A competition whose edition is running —
   between rounds, or in a league's quiet week — KEEPS its column, drawn
   as the league's dashed rest-day card ("next · <date>", or "date TBC"
   when the next fixture is not known — never a guessed date). Only a
   competition whose edition has FINISHED or has NOT STARTED folds into
   the off-season line. A one-match competition (the Finals & Super Cups
   group) is never "between rounds": it is drawn only when its match is
   in the window.

   The order of evidence: a fixture in the window (in season, always);
   then the payload's own season state (`meta.season.state`, derived on
   the backend from the edition's last-played and next-scheduled
   fixtures); then a declared fallback (`CupEntry.over`, the edition is
   known finished). With none of those the competition is taken to be IN
   season — keeping a column with "date TBC" is recoverable, hiding a
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
 *  in the window: the next known fixture, or "date TBC". */
export function restLine(next: string | null | undefined, cup: boolean,
                         label: (iso: string) => string): string {
  if (next && !Number.isNaN(new Date(asInstant(next)).getTime())) {
    return `next · ${label(asInstant(next)).toLowerCase()}`;
  }
  return cup ? "next round · date TBC" : "next fixture · date TBC";
}

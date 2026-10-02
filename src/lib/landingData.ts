// THE LANDING PAGE'S DATA — static, baked once while the page was
// authored, and NEVER fetched at runtime.
//
// Two files, each the verbatim answer of one public READ-ONLY route,
// trimmed to the keys the page draws:
//
//   data/landing/field.json  GET /api/field/leagues — committed bytes
//                            (backend src/picker/field_page.py: "no
//                            board, no capture, no write")
//   data/landing/derby.json  GET /api/minutes/laliga/401882865 — stored
//                            rows only (backend src/live/minutes.py)
//
// WHY BAKED. The home page is the first thing a stranger loads, and it
// must not depend on the backend being up — nor touch the two board
// routes, each of which writes a permanent snapshot row on every read.
// A baked file also cannot drift into showing a fixture from inside the
// sealed window: the match below kicked off on 2026-09-20.
//
// Nothing here measures anything. It selects, rounds and subtracts the
// numbers the routes served, and every derived figure is computed from
// the same two numbers it is printed beside (AGENTS.md §3).
import field from "../data/landing/field.json";
import derby from "../data/landing/derby.json";

export type Tri = { home: number; draw: number; away: number };
export type Outcome = keyof Tri;
export const OUTCOMES: readonly Outcome[] = ["home", "draw", "away"];

export type FieldClub = { club: string; column: string; elo: number };
export const FIELD = field as unknown as {
  route: string; fetched: string; passes: number; corpus_sha256: string;
  columns: { key: string; display: string }[]; clubs: FieldClub[];
  /** the home term, baked beside the field with its source named:
   *  backend CORPUS_HOME_ELO (+65), the constant the board's venue line
   *  reads as lib/pickerApi.HOME_ELO. Baked rather than imported so this
   *  page does not load the board's API module for one number. */
  home_term_elo: number;
};

export type Minute = {
  m: number; tape: boolean | null;
  score: { home: number; away: number } | null;
  model: Tri | null; market: Tri | null;
  refused?: "dismissal" | "interval" | "other"; source?: string;
};
export type MatchEvent = { m: number; type: "goal" | "red" | string;
  team: "home" | "away" | string; score?: { home: number; away: number } };

export const DERBY = derby as unknown as {
  route: string; fetched: string; competition: string; event_id: string;
  kickoff_utc: string; venue: string; label: string; note: string;
  home: { name: string; abbrev: string; color: string };
  away: { name: string; abbrev: string; color: string };
  lock: { t: number; at: string; model: Tri };
  pre_market: { t: number; at: string; market: Tri }[];
  events: MatchEvent[]; minutes: Minute[];
};

/** The two clubs as the FIELD names them (the field's spelling has no
 *  accent; the page prints the club's own). */
export const FOCUS = {
  home: { key: "Atletico Madrid", name: "Atlético Madrid", short: "Atlético" },
  away: { key: "Real Madrid", name: "Real Madrid", short: "Real Madrid" },
} as const;

function eloOf(key: string): number {
  const c = FIELD.clubs.find((r) => r.club === key);
  if (!c) throw new Error(`landing: ${key} is not in the baked field`);
  return c.elo;
}


/** The match's gap, split the way the board's venue line splits it:
 *  the raw rating gap, the venue term, and what is left. Signed to the
 *  side the remainder favours. */
export const GAP = (() => {
  const home = eloOf(FOCUS.home.key), away = eloOf(FOCUS.away.key);
  const raw = Math.round(away - home);        // + = the visitors rated higher
  const venue = FIELD.home_term_elo;          // to the home side
  const net = raw - venue;                    // + = the visitors still ahead
  return { home, away, raw, venue, net, homeAtHome: home + venue };
})();

/** The market as of the T−10 lock: the newest stored quote at or before
 *  the lock's own instant. De-vigged, in percentage points. */
export const MARKET_AT_LOCK = (() => {
  const at = DERBY.pre_market.filter((q) => q.t <= DERBY.lock.t)
    .sort((a, b) => b.t - a.t)[0] ?? null;
  return at;
})();

export const FINAL = (() => {
  const last = [...DERBY.minutes].reverse().find((m) => m.score);
  return last?.score ?? null;
})();

export const fmt1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
export const MINUS = "−";
export const PRIME = "′";
export const signed1 = (v: number) => {
  const r = Math.round(v * 10) / 10;
  return (r > 0 ? "+" : r < 0 ? MINUS : "") + Math.abs(r).toFixed(1);
};
/** The gap is model − market, from the two ROUNDED numbers printed
 *  beside it — the hub's rule, so the three can never disagree. */
export function gapOf(model?: number | null, market?: number | null) {
  if (model == null || market == null) return null;
  const r = (v: number) => Math.round(v * 10) / 10;
  return r(r(model) - r(market));
}

// DOES EACH BOARD PLAY IN THE NEXT THREE DAYS?
//
// The question the board page asks once per mount to decide which boxes
// of the Leagues | Cups | Nations switch to draw. Son, 2026-11-16: the UCL
// and EFL Cup chips left the top bar ("we have them in the cups"), and
// the same day the switch became the place that says what is on — a box
// APPEARS only when its board has a game today, tomorrow or the day after.
//
// ONE READ FOR EVERY COMPETITION. GET /api/board/soon?days=4 answers for
// all three modes at once, cached on the backend and shared by every
// visitor. The old chips asked each competition's own fixture feed, one
// request per chip; the boxes cover dozens of competitions.
//
// WHAT "THE NEXT THREE DAYS" MEANS. Three LOCAL calendar days — today,
// tomorrow and the day after — bucketed by lib/matchday's `localDay`, the
// same buckets as every matchday band on the board.
//
// WHAT THIS CANNOT SAY. Whether to do anything. It places kickoffs on
// days; it holds no price, no probability and no verdict.
//
// MISSING IS NEVER ZERO (kept from the chips this replaced). A read that
// failed, a route that is not deployed yet (404), a payload of the wrong
// shape, or a mode where some competitions could not be looked up and
// none of the rest play, is UNKNOWN — an ordinary, unlit box that asserts
// nothing, never "nothing soon" — so an unknown mode keeps its box.
import { dayKeyOf, localDay, nextDayKey } from "./matchday";

export type SoonMode = "leagues" | "cups" | "nations";
export const SOON_MODES: readonly SoonMode[] = ["leagues", "cups", "nations"];

/** How many local days the boxes look at: today, tomorrow, the day after. */
export const SOON_WINDOW_DAYS = 3;

/** THE WINDOW ASKED OF THE BACKEND, in days. One more than the window:
 *  the backend's cut is a rolling UTC `now + days*24h`, and just after
 *  local midnight the end of the third local day is ~72 h away (73 h on
 *  the day the clocks go back). The day filter below is the authority. */
export const SOON_ASK_DAYS = SOON_WINDOW_DAYS + 1;

/** One competition that plays inside the window, and its EARLIEST day
 *  in it (0 today, 1 tomorrow, 2 the day after). */
export type CompSoon = { slug: string; display: string; day: number };

/** THREE STATES PER MODE. `known: false` is a read that has not landed
 *  or did not survive. `known: true` with no `comps` is a MEASURED quiet
 *  window — but only when `partial` is false: a mode where some
 *  competitions could not be looked up, and none of the rest play, has
 *  not measured the whole mode and is not allowed to say "none". */
export type ModeSoon =
  | { known: false }
  | { known: true; comps: CompSoon[]; partial: boolean };

export type BoardSoonRead = Record<SoonMode, ModeSoon>;

export const UNKNOWN_MODE: ModeSoon = { known: false };
export const UNKNOWN: BoardSoonRead = {
  leagues: UNKNOWN_MODE, cups: UNKNOWN_MODE, nations: UNKNOWN_MODE,
};

/** The window's local-day keys, from ONE instant. */
export function windowDayKeys(now: Date = new Date()): string[] {
  const keys = [dayKeyOf(now)];
  while (keys.length < SOON_WINDOW_DAYS) keys.push(nextDayKey(keys[keys.length - 1]));
  return keys;
}

type ModePayload = {
  comps?: Record<string, { display?: unknown; kickoffs?: unknown } | null>;
  unknown?: unknown;
};

/** ONE MODE, from its block of the payload. Anything that is not the
 *  route's shape is UNKNOWN, never zero. */
export function readMode(block: unknown, keys: readonly string[]): ModeSoon {
  const b = block as ModePayload | null;
  if (!b || typeof b !== "object" || !b.comps || typeof b.comps !== "object"
      || Array.isArray(b.comps)) return UNKNOWN_MODE;
  const comps: CompSoon[] = [];
  for (const [slug, entry] of Object.entries(b.comps)) {
    if (!entry || !Array.isArray(entry.kickoffs)) continue;
    let best = -1;
    for (const k of entry.kickoffs) {
      if (typeof k !== "string") continue;
      const i = keys.indexOf(localDay(k));
      if (i >= 0 && (best < 0 || i < best)) best = i;
    }
    if (best >= 0) {
      const display = typeof entry.display === "string" && entry.display
        ? entry.display : slug;
      comps.push({ slug, display, day: best });
    }
  }
  comps.sort((a, c) => a.day - c.day || a.display.localeCompare(c.display));
  const partial = Array.isArray(b.unknown) && b.unknown.length > 0;
  return { known: true, comps, partial };
}

/** THE READ, from a payload and an instant — split from the fetch so the
 *  rule is testable against a named clock. */
export function readBoardSoon(payload: unknown, now: Date = new Date()): BoardSoonRead {
  const modes = (payload as { modes?: unknown } | null)?.modes;
  if (!modes || typeof modes !== "object" || Array.isArray(modes)) return UNKNOWN;
  const keys = windowDayKeys(now);
  const m = modes as Record<string, unknown>;
  return {
    leagues: readMode(m.leagues, keys),
    cups: readMode(m.cups, keys),
    nations: readMode(m.nations, keys),
  };
}

/** A box's three states, as `data-soon` spells them. */
export function soonState(r: ModeSoon): "soon" | "none" | "unknown" {
  if (!r.known) return "unknown";
  if (r.comps.length > 0) return "soon";
  return r.partial ? "unknown" : "none";
}

/** SHOW THIS BOX? (Son, 2026-11-16: a box appears only when its board
 *  plays within three days.) Only a MEASURED quiet window hides one —
 *  "soon" and "unknown" both show it, because a failed or pending read
 *  must never hide anything. */
export const boxShown = (r: ModeSoon) => soonState(r) !== "none";

/** The one request. Every failure is the same answer: UNKNOWN. */
export async function fetchBoardSoon(
  signal?: AbortSignal, now?: Date,
): Promise<BoardSoonRead> {
  try {
    const r = await fetch(`/api/board/soon?days=${SOON_ASK_DAYS}`, { signal });
    if (!r.ok) return UNKNOWN;
    return readBoardSoon(await r.json(), now);
  } catch {
    /* SWALLOWED(board:soon-boxes) — an abort, a dead network, a body that
       is not JSON: none of them measured an empty window, so none may
       hide a box as though they had. */
    return UNKNOWN;
  }
}

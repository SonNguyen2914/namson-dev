import { useState } from "react";

/** ONE QUIET VOICE PER MATCH FOR A SCREEN READER (audit W10-A11Y-06).
 *
 *  The live pages poll their feed and redraw the score in place, so a goal
 *  changed a number on screen and said nothing to a reader who cannot see
 *  it. This is a visually-hidden polite live region that speaks ONLY when
 *  the score or the match state changes — kick-off, a goal, full time —
 *  and never for the ticking minute: the minute rides along inside a
 *  message a goal already earned, but a minute changing on its own is not
 *  news and re-announcing it every poll would drown the page.
 *
 *  NOTHING IS SAID FOR THE FIRST READING. The page's own content already
 *  states the score the reader arrived to; announcing it again on load is
 *  noise. And a re-render with the same score and state composes nothing
 *  new, so the region's text stays put and is not re-announced.
 *
 *  Derived-state-during-render (React's documented "storing information
 *  from previous renders" pattern), not an effect: the message is part of
 *  the same render that drew the new score. */
export type AnnouncedState = string | null | undefined;

type Snap = { state: AnnouncedState; h: number | null; a: number | null };

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : null;
};

export function scoreMessage(prev: Snap, next: Snap, home: string,
  away: string, minute?: string | null): string | null {
  const line = next.h != null && next.a != null
    ? `${home} ${next.h}, ${away} ${next.a}` : `${home} versus ${away}`;
  const at = minute ? `, ${minute}` : "";
  if (next.state !== prev.state) {
    if (next.state === "in" && prev.state === "pre") return `Kick-off — ${line}`;
    if (next.state === "post") return `Full time — ${line}`;
    if (next.state === "off") return `${home} versus ${away} — not played`;
  }
  if (next.h !== prev.h || next.a !== prev.a) {
    if (next.h == null || next.a == null) return null;
    // the first numbers a match ever carries (0–0 at kick-off) are not a goal
    if (prev.h == null || prev.a == null) return null;
    const up = (next.h > (prev.h ?? 0)) || (next.a > (prev.a ?? 0));
    const down = (prev.h != null && next.h < prev.h)
      || (prev.a != null && next.a < prev.a);
    if (up && !down) {
      const who = next.h > (prev.h ?? 0) && next.a <= (prev.a ?? 0) ? home
        : next.a > (prev.a ?? 0) && next.h <= (prev.h ?? 0) ? away : null;
      return `Goal${who ? ` ${who}` : ""} — ${line}${at}`;
    }
    return `Score corrected — ${line}${at}`;
  }
  return null;
}

export function ScoreAnnouncer({ home, away, homeScore, awayScore, state,
  minute }: {
  home: string; away: string;
  homeScore: unknown; awayScore: unknown;
  /** "pre" | "in" | "post", or "off" for a match that was not played */
  state: AnnouncedState;
  /** included in a goal's message only; never a trigger on its own */
  minute?: string | null;
}) {
  const read: Snap = { state, h: num(homeScore), a: num(awayScore) };
  const [prev, setPrev] = useState<Snap>(read);
  // A READ THAT CARRIED NO SCORE OR NO STATE IS NOT A CHANGE. A failed or
  // partial poll keeps the last known value, so the next good read is not
  // mistaken for a goal (null → 2) or a second kick-off.
  const now: Snap = { state: read.state ?? prev.state,
    h: read.h ?? prev.h, a: read.a ?? prev.a };
  const [msg, setMsg] = useState("");
  if (prev.state !== now.state || prev.h !== now.h || prev.a !== now.a) {
    setPrev(now);
    const said = scoreMessage(prev, now, home, away, minute);
    if (said) setMsg(said);
  }
  return (
    <p data-testid="score-announcer" role="status" aria-live="polite"
      aria-atomic="true" className="sr-only">
      {msg}
    </p>
  );
}

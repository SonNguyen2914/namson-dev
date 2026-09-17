import {
  useEffect, useLayoutEffect, useRef, useState, type TouchEvent,
} from "react";

import { leagueLabel } from "../lib/pickerApi";
import { hueOf } from "./PickerColumn";

/** THE BOARD'S CONTROL ON A PHONE — one league at a time, chosen from a
 *  swipeable strip (operator, 2026-09-16, "Option A · one league, tab
 *  strip").
 *
 *  ── WHY THE RIBBON CANNOT BE THIS ───────────────────────────────────
 *
 *  `LeagueRibbon` divides the width it is given by the number of
 *  columns: eight leagues in 353px of bar is a 91px slot at a tablet and
 *  a 41px slot on a phone, of which the name gets 1px. MEASURED on the
 *  live board at 393px: eight of eight names clipped, "MLS" wanting 18px
 *  and holding 1. The ribbon is not misconfigured — it is a fixed-slot
 *  machine whose whole effect (the lit four never move, the letters
 *  change in place) depends on every league having a slot ON SCREEN at
 *  once, and a phone cannot give eight of anything a readable slot.
 *
 *  So the phone gets a different control rather than a smaller one. Each
 *  tab is sized by its OWN NAME — `flex-none`, `whitespace-nowrap`, no
 *  truncate anywhere — and the strip scrolls. What the ribbon spends on
 *  showing you eight leagues at once, this spends on making one of them
 *  readable.
 *
 *  ── WHY IT IS NOT THE JUMP NAV EITHER ───────────────────────────────
 *
 *  The board already had a second, readable switcher at this width: a
 *  wrapped list of `#picker-col-<slug>` anchors below the hero. It went
 *  with this (index.tsx). Two switchers for one board is two accounts of
 *  where you are, and the anchor list could only ever scroll you to a
 *  column in a 27,000px stack — it named the place without shortening
 *  the journey. This SELECTS: the board draws the picked league and
 *  nothing else, which is where the height went.
 *
 *  ── THE THINGS THAT ARE NOT NEGOTIABLE ──────────────────────────────
 *
 *  ONE HUE LOOKUP. The dot's colour is `hueOf(slug)` — the same function
 *  the column and its header call. Building `var(--lg-${slug})` here by
 *  concatenation is how a colourless pill shipped on 2026-09-15: it is
 *  right for eight slugs and silently empty for the ninth.
 *
 *  THE ORDER IS THE OPERATOR'S. `slugs` arrives from `boardColumns`,
 *  which is `PICKER_COLUMN_ORDER` filtered by the board's declaration.
 *  Nothing here may list a slug, add one, or sort.
 *
 *  A REAL TABLIST. The sticky-header work of 2026-09-15 already moved
 *  the eight league headings out of the reading order and into a rail;
 *  this narrows what is on the page to one league. Both of those are
 *  only safe if the control that does it is announced as what it is — so
 *  `role="tablist"`, `aria-selected` on every tab, `aria-controls`
 *  naming the column, and the drawn column is a `tabpanel` with a name
 *  and a tab stop (see `tabPanel` in components/PickerColumn.tsx).
 *
 *  AUTOMATIC ACTIVATION, which is the right pattern here because
 *  selecting a tab is cheap and has no side effect beyond drawing the
 *  league. Arrow keys move and select in one press; Home and End reach
 *  the ends. Roving tabindex, so Tab enters the strip once and leaves
 *  it, rather than walking eight stops.
 */

/** ONE STEP ALONG THE STRIP, AND IT WRAPS BOTH WAYS (operator,
 *  2026-09-16: "make the carosel a loop, not one sided").
 *
 *  It used to clamp — `Math.max(0, Math.min(len - 1, i + d))` — and the
 *  first entry in `PICKER_COLUMN_ORDER` is `epl`, the league the board
 *  opens on. So the strip's very first state was the one state where one
 *  of its two arrows did nothing at all: ArrowLeft on the Premier League
 *  was a dead key, and the reader's only route to the eighth column was
 *  seven presses the other way. That is the "one sided" in the request.
 *
 *  Modular, in exactly the shape `/bet-suggester/leagues` has used since
 *  it shipped — `(i + delta + n) % n` — because a second, differently
 *  written answer to "what is the league after the last one" is the kind
 *  of copy this tree keeps paying for. ONE STEP FUNCTION, and the arrow
 *  keys and the board's swipe both call it, so the two controls cannot
 *  come to disagree about which league is next.
 *
 *  It does NOT reorder anything. The wrap is a movement over the
 *  operator's declared order, not a rewrite of it.
 *
 *  Null rather than a guess when `from` is not on the strip: a board can
 *  be rebuilt under the reader, and stepping from a league that has left
 *  the declaration has no answer worth inventing. */
export function stepSlug(
  slugs: readonly string[], from: string, d: number,
): string | null {
  const n = slugs.length;
  if (n === 0) return null;
  const i = slugs.indexOf(from);
  if (i < 0) return null;
  /* `+ n` before the modulo: JS `%` keeps the sign of the dividend, so
     `(0 - 1) % 8` is -1 and not 7. */
  return slugs[(((i + d) % n) + n) % n];
}

/** DOES SOMETHING UNDER THIS TOUCH ALREADY OWN SIDEWAYS?
 *
 *  A swipe is only the board's to read if nothing between the finger and
 *  the board body scrolls horizontally — otherwise the same gesture both
 *  scrolls that thing and switches the league, which is a control that
 *  fires while the reader is using a different one.
 *
 *  THE STRIP IS NAMED, and not left to the measurement. It is a real
 *  horizontal scroller with eight leagues on it and the generic test
 *  below would catch it — but a board declaring two columns gives a
 *  strip that fits, and a strip that fits is still the strip. A tab
 *  press is not a board swipe at any column count.
 *
 *  Everything else is asked of the DOM rather than listed: tables, code
 *  blocks, day bands and whatever is added next all answer the same
 *  question — do you overflow sideways, and are you allowed to scroll
 *  it. A list of testids here would be right on the day it was written.
 *
 *  Walks up TO AND INCLUDING the element the handler sits on: if the
 *  board body itself ever becomes a horizontal scroller, the gesture
 *  belongs to it and not to this. */
function carriesTheGesture(target: EventTarget | null, stop: Element): boolean {
  let el: Element | null = target instanceof Element ? target : null;
  for (; el; el = el.parentElement) {
    if (el.matches('[data-testid="league-tabs"]')) return true;
    if (el.scrollWidth - el.clientWidth > 1) {
      const ox = getComputedStyle(el).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    if (el === stop || el === document.body) break;
  }
  return false;
}

/** SWIPE THE BOARD BODY TO CHANGE LEAGUE (operator, 2026-09-16).
 *
 *  Returns the touch handlers to spread onto the board body, or nothing
 *  at all when the strip is not the control on the page — the desktop
 *  and the tablet steer with the ribbon and its own scroll loop, and a
 *  board-level swipe there would be a second, invisible switcher over a
 *  track that already reads horizontal drags itself.
 *
 *  THE THRESHOLD IS THE ONE `/bet-suggester/leagues` HAS RUN SINCE IT
 *  SHIPPED, to the constant: past 48px, and horizontal by half again
 *  over the vertical. The second half is what keeps a phone usable — the
 *  board is a tall column of cards and nearly every gesture on it is a
 *  scroll, so a swipe that merely leaned sideways would change the
 *  league out from under a reader who was reading.
 *
 *  AND THE DIRECTION CONVENTION IS THAT ONE TOO: dragging leftward
 *  (`dx < 0`) carries the NEXT league in from the right, which is the
 *  way the page's content appears to move under the finger.
 *
 *  NOTHING IS PREVENTED. No `preventDefault`, no `touch-action` — the
 *  gesture is read on `touchend` from where the finger started and where
 *  it left, so vertical scrolling is never intercepted, only ignored. */
export function useLeagueSwipe({ enabled, slugs, picked, onPick }: {
  /** is the tab strip the control on this page at all? */
  enabled: boolean;
  slugs: readonly string[];
  picked: string | null;
  onPick: (slug: string) => void;
}) {
  const from = useRef<{ x: number; y: number } | null>(null);

  if (!enabled || !picked || slugs.length < 2) return {};

  return {
    onTouchStart: (e: TouchEvent<HTMLElement>) => {
      /* ONE FINGER. Two is a pinch or a zoom, and the point that
         happens to be reported first in it is not a swipe. */
      if (e.touches.length !== 1) { from.current = null; return; }
      if (carriesTheGesture(e.target, e.currentTarget)) {
        from.current = null;
        return;
      }
      from.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: TouchEvent<HTMLElement>) => {
      const start = from.current;
      from.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      // horizontal-dominant swipes only — vertical scroll stays free
      if (Math.abs(dx) <= 48 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
      const to = stepSlug(slugs, picked, dx < 0 ? 1 : -1);
      if (to && to !== picked) onPick(to);
    },
    /* A GESTURE THE BROWSER TOOK OVER IS NOT ONE THE BOARD MAY ALSO
       READ — a scroll that becomes a pull-to-refresh, a finger that
       leaves the window. */
    onTouchCancel: () => { from.current = null; },
  };
}

/** `useLayoutEffect` DOES NOTHING ON THE SERVER, and React says so in a
 *  warning every time a server-rendered component calls one. The room
 *  measurement below is about the browser's next paint — so on the
 *  server there is nothing to schedule and the passive hook is the
 *  honest stand-in. Chosen once, at module scope, so the hook order
 *  never changes between renders. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function LeagueTabs({ slugs, picked, onPick, counts }: {
  /** every declared column, in the operator's order */
  slugs: readonly string[];
  /** the league the board is drawing */
  picked: string;
  onPick: (slug: string) => void;
  /** fixtures on the board per column — NAMED when there are none, never
   *  rendered as a zero. */
  counts: Record<string, number>;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);

  /* ── EVERY TAB CAN COME TO REST IN THE MIDDLE (operator, 2026-09-16:
     "since PL is the start league, put it in the middle of the
     carrosel") ───────────────────────────────────────────────────────

     NOT BY REORDERING. `slugs` is the operator's declaration and putting
     the Premier League third-of-eight in that array would be this file
     rewriting BOARD_COLUMNS in the one place nobody would look for it.
     What the request is about is where the strip COMES TO REST, and that
     is a scroll position.

     `scrollIntoView({ inline: "center" })` has always asked for the
     middle and has always been able to deliver it for six of the eight:
     a scrollport's range is [0, scrollWidth - clientWidth], so centring
     the FIRST tab needs a negative scrollLeft and centring the LAST
     needs one past the end. Neither exists, so EPL pinned to the left
     edge and the eighth column to the right — the two ends of the board
     being the two that could never be centred.

     SO THE STRIP IS GIVEN THE ROOM. One aria-hidden spacer at each end,
     as wide as the scroll the browser was missing, and the arithmetic is
     then exactly the arithmetic that already worked for the middle six.

     MEASURED, NOT ASSUMED, and it is three numbers rather than one: the
     tabs are sized by their own names, so the room the first needs and
     the room the last needs are different, and `gap-2` sits between the
     spacer and the tab and has to come off both. Hard-coding any of the
     three would be right for one board, one font and one viewport.

     THIS IS NOT A PROGRAMMATIC SCROLL. The note on the scrollport below
     is why that distinction matters: writing `scrollLeft` from script is
     what a mandatory scrollport swallows, and this writes widths. The
     strip still scrolls by `scrollIntoView` and by the reader's finger,
     which is what snapping is built to cooperate with. */
  const [room, setRoom] = useState<{ lead: number; tail: number }>(
    { lead: 0, tail: 0 });
  const declared = slugs.join(",");
  useIsoLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const ends = () => {
      const tabs = strip.querySelectorAll<HTMLElement>(
        '[data-testid="league-tab"]');
      return [tabs[0], tabs[tabs.length - 1]] as const;
    };
    const measure = () => {
      const [first, last] = ends();
      if (!first || !last) return;
      const half = strip.clientWidth / 2;
      /* The gap the flex row puts between the spacer and the tab —
         read off the stylesheet, so `gap-2` becoming `gap-3` moves the
         centring with it. */
      const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      const next = {
        lead: Math.max(0, half - first.offsetWidth / 2 - gap),
        tail: Math.max(0, half - last.offsetWidth / 2 - gap),
      };
      /* Sub-pixel equality, or a ResizeObserver that fires on its own
         effect is a render loop. The spacers cannot change the strip's
         content box or either tab's, so this converges on the first
         pass; the guard is for the fractional noise of a reflow. */
      setRoom((prev) =>
        Math.abs(prev.lead - next.lead) < 0.5
        && Math.abs(prev.tail - next.tail) < 0.5 ? prev : next);
    };
    measure();
    /* THE THREE THINGS THAT MOVE IT: the viewport (rotation), and the
       two end tabs (a webfont landing after first paint, which is the
       same late reflow `--topbar-h` is measured around in index.tsx). */
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    for (const el of ends()) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [declared]);

  /* THE PICKED TAB IS BROUGHT INTO VIEW, and it is found by its slug
     rather than by an index — the strip scrolls, so "the third tab" and
     "the tab you can see" are different things. `nearest` on the block
     axis: this strip is inside a STICKY bar, and `scrollIntoView` with
     the default `start` would scroll the PAGE to put the bar at the top
     every time a tab was pressed.
     RE-RUN WHEN THE ROOM CHANGES, because the room is measured after
     the first paint: on arrival this runs once with no spacers (EPL
     against the left edge, which is the old defect) and again the
     moment the ends are known. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const el = strip.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(picked)}"]`);
    if (!el) return;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");
    el.scrollIntoView({ inline: "center", block: "nearest",
      behavior: quiet.matches ? "auto" : "smooth" });
  }, [picked, room.lead, room.tail]);

  const move = (d: number) => {
    const to = stepSlug(slugs, picked, d);
    if (to && to !== picked) onPick(to);
  };

  return (
    /* SCROLL-SNAP, AND NOT THE BOARD'S REASON FOR REFUSING IT. The
       board's own track cannot snap because the loop writes `scrollLeft`
       from script and a mandatory scrollport swallows those writes. This
       strip has no loop and no programmatic scroll but `scrollIntoView`,
       which snapping leaves alone — so it gets the declarative version,
       one snap point per tab. */
    <div ref={stripRef} data-testid="league-tabs" role="tablist"
      aria-label="leagues on the board — one is drawn at a time"
      aria-orientation="horizontal"
      onKeyDown={(e) => {
        /* THE ARROWS WRAP (2026-09-16) — see `stepSlug`. HOME AND END DO
           NOT: they are the two keys whose whole meaning is an absolute
           end of the set, and a reader pressing Home to reach the first
           league is not asking to be carried past it. */
        if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
        else if (e.key === "Home") { e.preventDefault(); onPick(slugs[0]); }
        else if (e.key === "End") {
          e.preventDefault(); onPick(slugs[slugs.length - 1]);
        }
      }}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* THE ROOM THE FIRST TAB NEEDS TO REACH THE MIDDLE. `aria-hidden`
          and no role: a `tablist` may only own tabs, and scaffolding
          that reached the accessibility tree would be a ninth and tenth
          "league" with no name. It is also why the touch-floor audit
          leaves it alone — it reads `aria-hidden` and skips. */}
      <i aria-hidden data-testid="tab-room" data-end="lead"
        className="flex-none" style={{ width: `${room.lead}px` }} />
      {slugs.map((slug) => {
        const on = slug === picked;
        const n = counts[slug] ?? 0;
        return (
          <button key={slug} type="button" role="tab" data-testid="league-tab"
            data-slug={slug} data-on={on ? "yes" : "no"}
            aria-selected={on}
            /* THE COLUMN THIS TAB DRAWS. The id is the section's own,
               which is also what the jump nav used to point at — the
               anchor went, the address did not. */
            aria-controls={`picker-col-${slug}`}
            /* ROVING TABINDEX: one stop for the whole strip. */
            tabIndex={on ? 0 : -1}
            onClick={() => onPick(slug)}
            /* THE TOUCH FLOOR IS `--tap-floor`, declared once in
               globals.css beside the rule that gives every other control
               on this page the same 44px. A number typed here would be
               the second copy of it. */
            style={{ ["--h" as string]: hueOf(slug),
              minHeight: "var(--tap-floor)",
              minWidth: "var(--tap-floor)" }}
            className={`flex flex-none snap-center items-center gap-2 rounded-full border px-4 font-mono text-[11.5px] uppercase leading-none tracking-[0.06em] whitespace-nowrap transition-colors ${
              on
                ? "border-[var(--h)] bg-[color-mix(in_srgb,var(--h)_12%,transparent)] text-ink-hi"
                : "border-line bg-bs-elev2 text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
            <i aria-hidden
              className="h-2 w-2 flex-none rounded-full bg-[var(--h)] transition-opacity"
              style={{ opacity: on ? 1 : 0.42 }} />
            {/* THE NAME, WHOLE. No `truncate`, no `max-w`, no `min-w-0`:
                a clipped name here is the defect this control exists to
                answer, so there is nothing in the box that could clip
                one. A guard reads `scrollWidth <= clientWidth` on this
                element at 393px. */}
            <span data-testid="tab-name" className="whitespace-nowrap">
              {leagueLabel(slug)}
            </span>
            {/* MISSING IS NEVER ZERO. A league the board holds no
                fixtures for says so in words; it never wears a "0". */}
            <span className="sr-only">
              {n === 0
                ? " — no fixtures on the board"
                : ` — ${n} fixture${n === 1 ? "" : "s"} on the board`}
            </span>
          </button>
        );
      })}
      {/* …and the room the LAST tab needs, which is a different number
          because the tabs are sized by their own names. */}
      <i aria-hidden data-testid="tab-room" data-end="tail"
        className="flex-none" style={{ width: `${room.tail}px` }} />
    </div>
  );
}

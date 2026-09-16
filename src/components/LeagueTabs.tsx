import { useEffect, useRef } from "react";

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

/** THE TOUCH FLOOR, px. Apple's HIG and WCAG 2.5.5 both land here, and
 *  the board's own audit at 393px is what makes it a number rather than
 *  a principle: 90 of 107 controls were under it. Exported so the guard
 *  and the control read the same one. */
export const TAP = 44;

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

  /* THE PICKED TAB IS BROUGHT INTO VIEW, and it is found by its slug
     rather than by an index — the strip scrolls, so "the third tab" and
     "the tab you can see" are different things. `nearest` on the block
     axis: this strip is inside a STICKY bar, and `scrollIntoView` with
     the default `start` would scroll the PAGE to put the bar at the top
     every time a tab was pressed. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const el = strip.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(picked)}"]`);
    if (!el) return;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");
    el.scrollIntoView({ inline: "center", block: "nearest",
      behavior: quiet.matches ? "auto" : "smooth" });
  }, [picked]);

  const move = (d: number) => {
    const i = slugs.indexOf(picked);
    if (i < 0) return;
    const to = Math.max(0, Math.min(slugs.length - 1, i + d));
    if (to !== i) onPick(slugs[to]);
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
        if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
        else if (e.key === "Home") { e.preventDefault(); onPick(slugs[0]); }
        else if (e.key === "End") {
          e.preventDefault(); onPick(slugs[slugs.length - 1]);
        }
      }}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            style={{ ["--h" as string]: hueOf(slug),
              minHeight: `${TAP}px`, minWidth: `${TAP}px` }}
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
    </div>
  );
}

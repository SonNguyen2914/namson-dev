import { useEffect, useRef, useState } from "react";

import { leagueLabel } from "../lib/pickerApi";
import { hueOf } from "./PickerColumn";

/** THE HEADER FOR A BOARD THAT CARRIES MORE COLUMNS THAN IT DRAWS
 *  (operator, 2026-09-15).
 *
 *  WHY IT EXISTS. Card width is arithmetic, not taste: the board's track
 *  is `max-w-[96rem]`, so a card STOPS GROWING at 1536px and a wider
 *  monitor renders the identical one. Measured on the live board — four
 *  columns 356px and the club name intact; five 280px and the name
 *  truncated but readable; six 229px and 20px of name left; seven 193px
 *  and the name at ZERO. Eight leagues cannot sit side by side at any
 *  width. Four is the number, and the eight are carried by moving
 *  through them.
 *
 *  THE LIT FOUR NEVER MOVE. Four slots in the middle are always the
 *  columns on screen; stepping slides the NAMES AND INK through those
 *  slots rather than sliding a highlight along a fixed row. The thing
 *  you are reading stays where you are looking.
 *
 *  AND EVERY LEAGUE KEEPS A PILL whether it is drawn or not — which is
 *  also the wayfinding, because whichever dim pill sits beside the lit
 *  block is what arrives if you keep going that way. A hidden column
 *  would be absent-by-design reading as vanished.
 */

/** The churn a cell shows while it is unrevealed. Letters, digits and
 *  punctuation together — a letters-only churn reads as a word being
 *  typed, which is the one thing this is not. */
const CHURN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-%$.,/#&*+=<>?@";
const CHURN_MS = 1000 / 13;
const REVEAL_MS = 430;
const STAGGER_MS = 26;

const rnd = () => CHURN.charAt(Math.floor(Math.random() * CHURN.length));

/** A random reveal order, so the word assembles out of order rather than
 *  left to right — the "randomize order" the effect turns on. */
function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ONE PILL'S NAME, REVEALED.
 *
 *  Every unrevealed cell shows a RANDOM glyph and keeps rerolling while
 *  it waits; a reveal front crosses the word and locks each cell to its
 *  true character as it passes. THE GLYPHS DO NOT TRAVEL — a character
 *  offset shifts a glyph's index, it does not move the glyph, and two
 *  earlier cuts that had them rolling in from below were both wrong
 *  about the effect.
 *
 *  Monospace is what makes it safe: every glyph is one width, so a cell
 *  rerolling cannot reflow the word or nudge its neighbours. */
function RevealName({ text, hue, delay }: {
  text: string; hue: string; delay: number;
}) {
  const [cells, setCells] = useState<string[]>(() => text.split(""));
  const [open, setOpen] = useState<boolean[]>(() => text.split("").map(() => true));
  const target = useRef(text);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target.current === text) return;
    target.current = text;
    const chars = text.split("");
    const order = shuffled(chars.length);
    const t0 = performance.now() + delay;
    let lastChurn = -1e9;
    if (raf.current !== null) cancelAnimationFrame(raf.current);

    const frame = (now: number) => {
      if (target.current !== text) return;
      const e = now - t0;
      if (e < 0) { raf.current = requestAnimationFrame(frame); return; }
      const prog = Math.min(1, e / REVEAL_MS);
      const lock = Math.round(prog * chars.length);
      const lit = new Set(order.slice(0, lock));
      const churn = now - lastChurn >= CHURN_MS;
      if (churn) lastChurn = now;
      setOpen(chars.map((_, i) => lit.has(i)));
      if (churn || prog >= 1) {
        setCells(chars.map((c, i) => (lit.has(i) ? c : rnd())));
      }
      if (prog < 1) raf.current = requestAnimationFrame(frame);
      else { setCells(chars); setOpen(chars.map(() => true)); raf.current = null; }
    };
    raf.current = requestAnimationFrame(frame);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [text, delay]);

  return (
    <span data-testid="ribbon-name" className="inline-flex">
      {cells.map((c, i) => (
        <i key={i} data-open={open[i] ? "1" : "0"}
          className="inline-block w-[1ch] not-italic text-center"
          style={open[i] ? undefined : { color: hue }}>
          {c === " " ? " " : c}
        </i>
      ))}
    </span>
  );
}

export function LeagueRibbon({ slugs, start, view, onJump }: {
  /** every declared column, in the operator's order */
  slugs: readonly string[];
  /** index in `slugs` of the leftmost column on screen */
  start: number;
  /** how many are drawn at once */
  view: number;
  onJump: (slug: string) => void;
}) {
  const n = slugs.length;
  /* THE LIT FOUR NEVER MOVE (operator, 2026-09-15): "dont move the
     selected 4 left/right, but move the names and colors".
     So the SLOTS are fixed and the CONTENT rotates through them. Slot k
     carries `slugs[(start - REST + k) mod n]`, which makes slots REST..
     REST+view-1 the columns on screen BY CONSTRUCTION — they are lit
     because of where they sit, not because of which league they hold,
     and they sit still while the league in them changes.
     `REST` centres the lit block: two dim slots lead, two trail. */
  const REST = Math.max(0, Math.floor((n - view) / 2));
  const slots = Array.from({ length: n },
    (_, k) => slugs[((start - REST + k) % n + n) % n]);
  return (
    <div data-testid="league-ribbon" role="tablist"
      aria-label="leagues, in strength order"
      className="flex w-full gap-1.5">
      {slots.map((slug, i) => {
        const on = i >= REST && i < REST + view;
        /* THE SAME LOOKUP THE COLUMNS USE. This built the variable name
           by concatenation, which silently produces `var(--lg-campeones)`
           — a custom property nobody declared — for any column the
           palette does not name. An undeclared `var()` with no fallback
           paints nothing, so the Campeones Cup pill drew with no border
           colour and an invisible dot from the day the cup joined the
           board. `hueOf` is the column's own reader and falls back to the
           cup ink, so a competition added tomorrow gets a colour rather
           than a hole. */
        const hue = hueOf(slug);
        /* THE WAVE ENTERS FROM THE SIDE THE NEW LEAGUES COME FROM, so
           the change rolls with the content rather than against it. */
        const wave = n - 1 - i;
        return (
          /* THE KEY IS THE SLOT, NOT THE LEAGUE, and the whole effect
             turns on it. Keyed by slug, React reconciles a rotation by
             MOVING each pill's DOM node to its new position and carrying
             its text along — so `RevealName` never receives a `text` it
             has not already settled on, its `target.current === text`
             guard returns immediately, and no scramble ever runs. What
             the reader saw was the entire ribbon sliding sideways by one
             pill, which is the opposite of the design: the slots are
             meant to hold still while their NAMES change in place.

             Keyed by index, slot i keeps its node and is handed a new
             slug, a new name and a new hue — which is exactly the prop
             change the reveal animates on. */
          <button key={i} type="button" role="tab"
            data-testid="ribbon-pill" data-slug={slug}
            aria-selected={on}
            aria-label={`${leagueLabel(slug)}${on ? ", on screen" : ""}`}
            onClick={() => onJump(slug)}
            style={{ ["--h" as string]: hue }}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] transition-colors ${
              on
                ? "border-[var(--h)] bg-ink-hi/[0.07] text-ink-hi"
                : "border-line bg-bs-elev2 text-ink-faint hover:border-ink-faint hover:text-ink-mid"}`}>
            <i aria-hidden
              className={`h-2 w-2 flex-none rounded-full transition-opacity ${
                on ? "opacity-100" : "opacity-30"}`}
              style={{ background: hue,
                boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${hue} 22%, transparent)` : undefined }} />
            <span className="min-w-0 truncate">
              <RevealName text={leagueLabel(slug)} hue={hue}
                delay={wave * STAGGER_MS} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

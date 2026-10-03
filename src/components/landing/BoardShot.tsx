// THE BOARD, BOTH OF ITS HALVES — Leagues | Championships.
//
// "The every fixture, ranked section only have Championships matches,
//  show clubs matches example too, do it without losing the flow and
//  keep everything smooth"                         (Son, 2026-10-03)
//
// The real board has a Leagues | Championships switch
// (components/BoardModeSwitch.tsx). Both captures are real (2 Oct 2026,
// pre-kickoff cards only), cropped, never composed.
//
// ON A WIDE SCREEN (≥1024px) BOTH HALVES ARE SHOWN AT ONCE, side by side
// — clubs | national teams — with no switch and nothing that moves
// (2026-10-03). Each frame holds ONE whole column of its board, header
// and card, at the SAME capture scale, so the type on both cards is the
// same size: the Eredivisie column (746×880 capture pixels) and the
// Nations League column (1000×880). A club column is narrower than a
// one-column championship board, so the two frames are as wide as their
// crops (cells that grow in the crops' own ratio) — equal height, equal
// scale, nothing cut at either edge. Round 9 centred the club crop on
// one card with its neighbours' halves fading out either side, which
// read as a carousel cut by accident beside a clean single column. The
// new crop has a new file name: the image optimizer and browsers cache by
// URL, and a stale copy of the old crop is a different shape.
// The pair spans the page's one 1240px content column, like every other
// section (round 9 capped it at 1020px, left-aligned).
//
// ON A NARROWER SCREEN ONE FRAME, BEHIND THE BOARD'S OWN SWITCH, holding
// the SAME two crops as the wide pair (2026-10-03, round 11). Round 10
// gave the phone its own card crops — the club card 800px wide, the
// Nations League one 1000px — so drawn to one frame width the club type
// came out 25% larger than the national-team type, and the Nations
// League crop carried a faded, cut-off second card (Iceland) and a date
// rule that ran into the frame's edge. Now:
//   - both captures draw at ONE scale (crop pixels per CSS pixel): the
//     Nations League crop is the wider, so it fills the frame and the
//     Eredivisie column sits centred at its own 746/1000 of that width,
//     the rest the board's own ground — padded, never stretched;
//   - both crops are 880 rows tall, so at one scale they are one height,
//     stacked in one grid cell: a switch moves no pixel of layout, and
//     both images are loaded together;
//   - every frame (pair and switch) keeps an inset of the board's ground
//     inside its hairline, so nothing in a capture — the date rule, a
//     card's edge — touches the frame;
//   - a switch is an opacity crossfade (240 ms), nothing else;
//   - and once, as the frame scrolls up out of the reading zone, it
//     flips to Championships by itself (and back, scrolling down), so a
//     reader who never touches the switch still sees both halves. It
//     waits until the frame's middle has passed a QUARTER of the screen
//     (round 8 flipped at 40%, while the club card was still centred
//     and being read), with a 10%-of-viewport hysteresis band (25% up,
//     35% back) so a resting thumb cannot make it flicker. Two
//     IntersectionObservers on a 1px line — no per-frame work. It never
//     flips while focus is inside the figure, and the first press on the
//     switch ends it: from then on the reader decides.
// Reduced motion: no automatic flip, and the swap is instant.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "../../lib/useScrollScene";
import s from "./landing.module.css";

export type BoardMode = "leagues" | "championships";
const MODES: readonly BoardMode[] = ["leagues", "championships"];
const LABEL: Record<BoardMode, string> = {
  leagues: "Leagues", championships: "Championships" };
/** who plays in each half, said once beside the board's own name */
const WHO: Record<BoardMode, string> = {
  leagues: "clubs", championships: "national teams" };

/** A pin, set just AFTER the thing it names: [the thing's right edge,
 *  its vertical centre], each a share (%) of its image's own box. The pin
 *  starts a fixed 6px past that edge (landing.module.css `.pins li`), so
 *  its clearance is the same at every scale — a pin centred on a share of
 *  the image kept 2–3px from its neighbours at 1024px (round 10). */
type Pin = readonly [number, number];
type Shot = { src: string; w: number; h: number; alt: string; pins: readonly Pin[] };

const ALT: Record<BoardMode, string> = {
  leagues: "The Eredivisie column of the TRIVELA board in Leagues mode, "
    + "captured 2 October 2026: its one fixture card, PSV Eindhoven v "
    + "Heerenveen, a +1.62 goal-difference gap, a split tier read and the "
    + "exchange's book, ask 81 cents.",
  championships: "The TRIVELA board in Championships mode, captured 2 "
    + "October 2026: a UEFA Nations League card, Finland v Albania, with "
    + "a +48 Elo gap split into rating and home terms, tier chips and the "
    + "exchange's book, ask 39 cents.",
};

/* ONE CROP PER HALF, used by the wide pair and the phone switch alike:
   one whole board column each, header, date row and ONE card, nothing
   cut, both 880 capture rows tall at the capture's one scale. Pins: 1
   the gap (after the gap number, on its line — the same place in both),
   2 the tiers (after the # chip), 3 the book (after the last thing on
   the book's line), measured off the captures' pixels. */
const SHOTS: Record<BoardMode, Shot> = {
  leagues: { src: "/landing/board-leagues-column.jpg", w: 746, h: 880,
    alt: ALT.leagues, pins: [[92.76, 45.85], [60.59, 68.69], [87.13, 78.47]] },
  championships: { src: "/landing/board-championships.jpg", w: 1000, h: 880,
    alt: ALT.championships, pins: [[94.4, 53.75], [45.1, 77.39], [54.2, 86.59]] },
};
/** the wider crop sets the switch frame's scale; the other is centred at
 *  its own share of that width */
const SOLO_W = Math.max(...MODES.map((m) => SHOTS[m].w));

/* rendered widths, for the image optimizer. Pair: (content − 20px gap −
   four 14px insets) in the crops' ratio, the content column being 1240px
   from a 1352px window and 100vw − 112px below it. Switch: the frame is
   460px at most, 100vw − 32px below that, less two 10px insets. */
const PAIR_SIZES: Record<BoardMode, string> = {
  leagues: "(min-width: 1352px) 497px, calc(42.7vw - 80px)",
  championships: "(min-width: 1352px) 667px, calc(57.3vw - 108px)",
};
const SOLO_SIZES: Record<BoardMode, string> = {
  leagues: "(min-width: 492px) 329px, calc(74.6vw - 39px)",
  championships: "(min-width: 492px) 440px, calc(100vw - 52px)",
};

function Pins({ pins }: { pins: readonly Pin[] }) {
  return (
    <ol aria-hidden className={s.pins}>
      {pins.map(([x, y], i) => (
        <li key={i} style={{ left: `${x}%`, top: `${y}%` }}>{i + 1}</li>
      ))}
    </ol>
  );
}

export default function BoardShot() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<BoardMode>("leagues");
  const touched = useRef(false);
  const fig = useRef<HTMLElement | null>(null);
  const line = useRef<HTMLSpanElement | null>(null);

  /* THE ONE AUTOMATIC FLIP, narrow screens only (the line lives in the
     switch's frame, which is `display: none` on a wide screen, so it
     never intersects there). The target is a 1px line across the
     frame's middle, watched by two observers whose roots reach from far
     above the page down to a line on the screen: 25% of its height for
     the flip up, 35% for the flip back. "Above the line" is then a
     state the observer reports even after a fling that skips straight
     past the band in one frame (a root that was only the band itself
     missed exactly that — measured). Between the two lines nothing
     changes, which is the hysteresis. */
  useEffect(() => {
    const el = line.current;
    if (reduced || !el || typeof IntersectionObserver === "undefined") return;
    const watch = (bottom: string, on: (above: boolean) => void) => {
      const io = new IntersectionObserver((entries) => {
        if (touched.current) return;
        // never swap the picture out from under someone working in it
        if (fig.current?.contains(document.activeElement)) return;
        const e = entries[entries.length - 1];
        if (e) on(e.isIntersecting);
      }, { rootMargin: `100000px 0px ${bottom} 0px`, threshold: 0 });
      io.observe(el);
      return io;
    };
    const up = watch("-75%", (above) => { if (above) setMode("championships"); });
    const down = watch("-65%", (above) => { if (!above) setMode("leagues"); });
    return () => { up.disconnect(); down.disconnect(); };
  }, [reduced]);

  const pick = (m: BoardMode) => { touched.current = true; setMode(m); };

  return (
    <figure ref={fig} className={s.shot} data-testid="board-shot" data-mode={mode}>
      {/* WIDE: both halves, side by side, still. Each cell grows in its
          crop's width from a base of its two insets, so both images
          draw at one scale and, both crops being 880 rows tall, at one
          height. */}
      <div className={s.shotPair} data-testid="board-shot-pair">
        {MODES.map((m) => {
          const sh = SHOTS[m];
          return (
            <div key={m} className={s.pairCell} data-pair={m}
              style={{ "--grow": sh.w } as CSSProperties}>
              <p className={s.pairLabel}><b>{LABEL[m]}</b> · {WHO[m]}</p>
              <div className={s.shotFrame}>
                <div className={s.shotLayer}>
                  <Image src={sh.src} width={sh.w} height={sh.h} alt={sh.alt}
                    sizes={PAIR_SIZES[m]} className={s.shotImg} />
                  <Pins pins={sh.pins} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NARROW: one frame, behind the board's own switch */}
      <div className={s.shotSolo}>
        <div role="group" aria-label="which board the picture shows"
          className={s.modeSwitch} data-testid="board-shot-switch">
          {MODES.map((m) => (
            <button key={m} type="button" aria-pressed={mode === m}
              data-testid={`board-shot-${m}`} onClick={() => pick(m)}>
              {LABEL[m]}
            </button>
          ))}
        </div>
        <div className={s.shotBox}>
          <span ref={line} aria-hidden className={s.shotLine} />
          <div className={s.shotFrame}>
            {MODES.map((m) => {
              const sh = SHOTS[m];
              const on = mode === m;
              return (
                <div key={m} data-layer={m} data-on={on}
                  aria-hidden={on ? undefined : true} className={s.shotLayer}
                  style={{ width: `${(sh.w / SOLO_W) * 100}%` }}>
                  <Image src={sh.src} width={sh.w} height={sh.h} alt={sh.alt}
                    sizes={SOLO_SIZES[m]} className={s.shotImg} />
                  <Pins pins={sh.pins} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <figcaption className={s.shotCap}>
        <ol className={s.pinKey}>
          <li><b>1</b>the gap</li>
          <li><b>2</b>the tiers</li>
          <li><b>3</b>the exchange&rsquo;s book</li>
        </ol>
        <span className={s.shotMeta}>
          captured 2 Oct 2026 · <span className={s.chip}>shadow · not advice</span>
        </span>
      </figcaption>
    </figure>
  );
}

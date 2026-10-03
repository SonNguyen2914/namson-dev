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
// crops (grid tracks in the crops' own ratio) — equal height, equal
// scale, nothing cut at either edge. Round 9 centred the club crop on
// one card with its neighbours' halves fading out either side, which
// read as a carousel cut by accident beside a clean single column. The
// new crop has a new file name: the image optimizer and browsers cache by
// URL, and a stale copy of the old crop is a different shape.
// The pair spans the page's one 1240px content column, like every other
// section (round 9 capped it at 1020px, left-aligned).
//
// ON A NARROWER SCREEN ONE CARD FILLS THE FRAME, so the switch stays,
// mirroring the board's own part for part — the filled ground, the
// hairline, gold on the live choice. Default Leagues (clubs).
//   - the two captures are stacked in one grid cell, so the frame is the
//     taller one's height in BOTH modes — a switch moves no pixel of
//     layout, and both images are loaded together;
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

/** A pin, at a share of its image's own box: [left %, top %]. */
type Pin = readonly [number, number];
type Shot = { src: string; w: number; h: number; alt: string; pins: readonly Pin[] };

const ALT = {
  pair: "The Eredivisie column of the TRIVELA board in Leagues mode, "
    + "captured 2 October 2026: its one fixture card, PSV Eindhoven v "
    + "Heerenveen, a +1.62 goal-difference gap, a split tier read and the "
    + "exchange's book, ask 81 cents.",
  card: "One club fixture card from the TRIVELA board, captured 2 October "
    + "2026: PSV Eindhoven v Heerenveen, a +1.62 goal-difference gap, a "
    + "split tier read and the exchange's book, ask 81 cents.",
  championships: "The TRIVELA board in Championships mode, captured 2 "
    + "October 2026: a UEFA Nations League card, Finland v Albania, with "
    + "a +48 Elo gap split into rating and home terms, tier chips and the "
    + "exchange's book, ask 39 cents.",
};

/* Pins: 1 the gap · 2 the tiers · 3 the book, measured off the
   captures. `pair` is the wide screen's two frames, one whole column
   each, at one scale; `card` is the phone's one, at the card's own
   proportions, where the Nations League capture's next fixture fades out
   below (`shotFade`) rather than leaving the frame half empty. */
const SHOTS: Record<"pair" | "card", Record<BoardMode, Shot>> = {
  pair: {
    leagues: { src: "/landing/board-leagues-column.jpg", w: 746, h: 880,
      alt: ALT.pair, pins: [[86.3, 53.7], [65.2, 68.5], [91.7, 78.4]] },
    championships: { src: "/landing/board-championships.jpg", w: 1000, h: 880,
      alt: ALT.championships, pins: [[82, 53.9], [48, 77.3], [58, 86.6]] },
  },
  card: {
    leagues: { src: "/landing/board-leagues-card.jpg", w: 800, h: 840,
      alt: ALT.card, pins: [[97.25, 50.8], [64.25, 74.4], [89.1, 84.8]] },
    championships: { src: "/landing/board-championships-card.jpg", w: 1000, h: 1050,
      alt: ALT.championships, pins: [[82, 45.1], [48, 64.8], [58, 72.6]] },
  },
};

/* the pair's rendered widths: (content − 20px gap) in the crops' ratio,
   the content column being 1240px from a 1352px window, 100vw − 112px
   below it */
const PAIR_SIZES: Record<BoardMode, string> = {
  leagues: "(min-width: 1352px) 520px, 39vw",
  championships: "(min-width: 1352px) 700px, 52vw",
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
      {/* WIDE: both halves, side by side, still. The tracks are the
          crops' own widths, so both frames draw at one scale and, since
          both crops are 880 rows tall, at one height. */}
      <div className={s.shotPair} data-testid="board-shot-pair"
        style={{ "--pair-cols": MODES.map((m) => `minmax(0, ${SHOTS.pair[m].w}fr)`).join(" ") } as CSSProperties}>
        {MODES.map((m) => {
          const sh = SHOTS.pair[m];
          return (
            <div key={m} className={s.pairCell} data-pair={m}>
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
              const sh = SHOTS.card[m];
              const on = mode === m;
              return (
                <div key={m} data-layer={m} data-on={on}
                  aria-hidden={on ? undefined : true}
                  className={`${s.shotLayer} ${m === "championships" ? s.shotFade : ""}`}>
                  <Image src={sh.src} width={sh.w} height={sh.h} alt={sh.alt}
                    sizes="(min-width: 500px) 460px, 100vw" className={s.shotImg} />
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

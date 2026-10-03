// THE BOARD, BOTH OF ITS HALVES — Leagues | Championships.
//
// "The every fixture, ranked section only have Championships matches,
//  show clubs matches example too, do it without losing the flow and
//  keep everything smooth"                         (Son, 2026-10-03)
//
// The real board has a Leagues | Championships switch
// (components/BoardModeSwitch.tsx); this mirrors it, part for part — the
// filled ground, the hairline, gold on the live choice — above ONE
// screenshot frame. Default Leagues (clubs). Both captures are real
// (2 Oct 2026, pre-kickoff cards only), cropped, never composed.
//
// NO FOURTH SCROLL MOMENT. Nothing is pinned and nothing is scrubbed:
//   - the two captures are stacked in one grid cell, so the frame is the
//     taller one's height in BOTH modes — a switch moves no pixel of
//     layout, and both images are loaded together;
//   - a switch is an opacity crossfade (240 ms), nothing else;
//   - and once, as the frame rises past the middle of the screen, the
//     frame flips to Championships by itself (and back, scrolling up),
//     so a reader who never touches the switch still sees both halves.
//     Two IntersectionObservers on a 1px line — no per-frame work —
//     with a 10%-of-viewport hysteresis band (40% up, 50% back) so a
//     resting thumb cannot make it flicker. The first press on the
//     switch ends it: from then on the reader decides.
// Reduced motion: no automatic flip, and the swap is instant.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../lib/useScrollScene";
import s from "./landing.module.css";

export type BoardMode = "leagues" | "championships";
const MODES: readonly BoardMode[] = ["leagues", "championships"];
const LABEL: Record<BoardMode, string> = {
  leagues: "Leagues", championships: "Championships" };

/** A pin, at a share of its image's own box: [left %, top %]. */
type Pin = readonly [number, number];
type Shot = { src: string; w: number; h: number; alt: string; pins: readonly Pin[] };

const ALT = {
  leagues: "The TRIVELA board in Leagues mode, captured 2 October 2026: "
    + "Ligue 1, Eredivisie and Liga MX fixture cards, each with its "
    + "goal-difference gap, tier chips and the exchange's live book.",
  card: "One club fixture card from the TRIVELA board, captured 2 October "
    + "2026: PSV Eindhoven v Heerenveen, a +1.62 goal-difference gap, a "
    + "split tier read and the exchange's book, ask 81 cents.",
  championships: "The TRIVELA board in Championships mode, captured 2 "
    + "October 2026: a UEFA Nations League card, Finland v Albania, with "
    + "a +48 Elo gap split into rating and home terms, tier chips and the "
    + "exchange's book, ask 39 cents.",
};

/* Wide screens see all three club columns; a phone sees one card from
   the same capture, at a size it can be read. The Nations League capture
   is one column: cut at the club crop's height on a wide screen (same
   scale, so a switch keeps the type size), and at the club card's
   proportions on a phone, where the next fixture fades out below
   (`shotFade`) rather than leaving the frame half empty. Pins: 1 the
   gap · 2 the tiers · 3 the book, measured off the captures. */
const SHOTS: Record<"wide" | "card", Record<BoardMode, Shot>> = {
  wide: {
    leagues: { src: "/landing/board-leagues.jpg", w: 2040, h: 787,
      alt: ALT.leagues, pins: [[66.67, 48.5], [55, 71], [63.7, 80.9]] },
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

export default function BoardShot() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<BoardMode>("leagues");
  const touched = useRef(false);
  const line = useRef<HTMLSpanElement | null>(null);

  /* THE ONE AUTOMATIC FLIP. The target is a 1px line across the frame's
     middle, watched by two observers whose roots reach from far above
     the page down to a line on the screen: 40% of its height for the
     flip up, 50% for the flip back. "Above the line" is then a state
     the observer reports even after a fling that skips straight past
     the band in one frame (a root that was only the band itself missed
     exactly that — measured). Between the two lines nothing changes,
     which is the hysteresis. */
  useEffect(() => {
    const el = line.current;
    if (reduced || !el || typeof IntersectionObserver === "undefined") return;
    const watch = (bottom: string, on: (above: boolean) => void) => {
      const io = new IntersectionObserver((entries) => {
        if (touched.current) return;
        const e = entries[entries.length - 1];
        if (e) on(e.isIntersecting);
      }, { rootMargin: `100000px 0px ${bottom} 0px`, threshold: 0 });
      io.observe(el);
      return io;
    };
    const up = watch("-60%", (above) => { if (above) setMode("championships"); });
    const down = watch("-50%", (above) => { if (!above) setMode("leagues"); });
    return () => { up.disconnect(); down.disconnect(); };
  }, [reduced]);

  const pick = (m: BoardMode) => { touched.current = true; setMode(m); };

  return (
    <figure className={s.shot} data-testid="board-shot" data-mode={mode}>
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
        {(["wide", "card"] as const).map((fit) => (
          <div key={fit} className={`${s.shotFrame} ${fit === "wide" ? s.shotWide : s.shotNarrow}`}>
            {MODES.map((m) => {
              const sh = SHOTS[fit][m];
              const on = mode === m;
              return (
                <div key={m} data-layer={m} data-on={on}
                  aria-hidden={on ? undefined : true}
                  className={`${s.shotLayer} ${m === "championships" ? (fit === "wide" ? s.shotColumn : s.shotFade) : ""}`}>
                  <Image src={sh.src} width={sh.w} height={sh.h} alt={sh.alt}
                    sizes={fit === "card" ? "(min-width: 500px) 460px, 100vw"
                      : m === "championships" ? "(min-width: 1360px) 448px, 40vw"
                        : "(min-width: 1360px) 1020px, 90vw"}
                    className={s.shotImg} />
                  <ol aria-hidden className={s.pins}>
                    {sh.pins.map(([x, y], i) => (
                      <li key={i} style={{ left: `${x}%`, top: `${y}%` }}>{i + 1}</li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        ))}
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

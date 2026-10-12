// 3 · THREE HOURS BEFORE: THE BOARD.
//
// The heading, one sentence about the card below it, and the board's own
// two halves (BoardShot). From 1024px, when the page's scenes pin, the
// section is one screen of travel: the pair of captures starts a little
// larger and centred in the screen, settles to the column's width as the
// reader scrolls (rounding its corners as it goes), and the heading and
// the labels arrive after it. The settled pair fits ONE screen with its
// heading and caption: the column narrows — never the crops' scale per
// crop — until it does (`fit`). Below 1024px, or when scenes do not pin,
// nothing here moves: the heading rises once, like every still section
// (useRise), and BoardShot's own switch carries both halves.
//
// WHAT THE SENTENCE SAYS ABOUT THE CARD is read off the capture under it
// (the derby, 20 Sep 2026): Real Madrid by a little (second v third in
// the table), the exchange near 49¢, and the model locked at T−10 leaning
// the other way (Atlético 42.2% in lib/landingData's series). Pins 1–3 in
// BoardShot point at the gap, the tiers and the book.
import { useCallback, useEffect, useRef, useState } from "react";
import { easeInOut, easeOut, lerp, span, useScrollScene } from "../../lib/useScrollScene";
import BoardShot from "./BoardShot";
import s from "./landing.module.css";

export default function Board({ pinned }: { pinned: boolean }) {
  const section = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const grid = useRef<HTMLDivElement | null>(null);
  const fitted = useRef({ S0: 1.12, dy0: 0 });
  const [fitV, setFitV] = useState(0);

  const parts = useCallback(() => {
    const el = inner.current;
    if (!el) return null;
    return {
      pair: el.querySelector<HTMLElement>('[data-testid="board-shot-pair"]'),
      labels: [...el.querySelectorAll<HTMLElement>('[data-testid="board-shot-pair"] [data-label]')],
      cap: el.querySelector<HTMLElement>("figcaption"),
    };
  }, []);
  const clear = useCallback(() => {
    const p = parts();
    if (!p?.pair) return;
    p.pair.style.transform = "";
    p.pair.style.removeProperty("--r");
    if (inner.current) inner.current.style.width = "";
    if (grid.current) { grid.current.style.opacity = ""; grid.current.style.transform = ""; }
    if (p.cap) p.cap.style.opacity = "";
    p.labels.forEach((l) => { l.style.opacity = ""; });
  }, [parts]);

  /* the settled pair fits one screen with its heading and caption */
  const fit = useCallback(() => {
    const p = parts(), el = inner.current, st = stage.current;
    if (!p?.pair || !el || !st || !p.labels[0]) return;
    clear();
    const colW = el.clientWidth, stageH = st.clientHeight, inset = 14;
    const ratio = (712 + 966) / 880;
    let W = colW;
    for (let k = 0; k < 3; k++) {
      el.style.width = `${W}px`;
      const used = el.offsetHeight - p.pair.offsetHeight;
      const labH = p.labels[0].offsetHeight + 10;
      const imgH = stageH - 40 - used - labH - 2 * inset;
      W = Math.max(560, Math.min(colW, Math.floor(imgH * ratio + 20 + 4 * inset)));
    }
    el.style.width = `${W}px`;
    const sr = st.getBoundingClientRect(), pr = p.pair.getBoundingClientRect();
    fitted.current = {
      dy0: sr.top + sr.height / 2 - (pr.top + pr.height / 2),
      S0: Math.min(1.12, (innerWidth - 8) / pr.width) };
    setFitV((v) => v + 1);
  }, [parts, clear]);

  useEffect(() => {
    if (!pinned) { clear(); return; }
    let raf = 0;
    const again = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    fit();
    window.addEventListener("resize", again, { passive: true });
    document.fonts?.ready.then(again);
    return () => { window.removeEventListener("resize", again); cancelAnimationFrame(raf); };
  }, [pinned, fit, clear]);

  const draw = useCallback((p: number) => {
    const pt = parts();
    if (!pt?.pair) return;
    const { S0, dy0 } = fitted.current;
    const settle = easeInOut(span(p, 0.08, 0.6));
    pt.pair.style.transform = `translate3d(0,${(dy0 * (1 - settle)).toFixed(1)}px,0) scale(${lerp(S0, 1, settle).toFixed(4)})`;
    pt.pair.style.setProperty("--r", `${(10 * settle).toFixed(2)}px`);
    const hIn = easeOut(span(p, 0.5, 0.78));
    if (grid.current) {
      grid.current.style.opacity = String(hIn);
      grid.current.style.transform = `translate3d(0,${(24 * (1 - hIn)).toFixed(1)}px,0)`;
    }
    const lIn = easeOut(span(p, 0.56, 0.84));
    pt.labels.forEach((l) => { l.style.opacity = String(lIn); });
    if (pt.cap) pt.cap.style.opacity = String(lIn);
    // fitV: a new fit is a new drawing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, fitV]);
  useScrollScene(section, draw, { mode: "pinned", stage, enabled: pinned });

  return (
    <section ref={section} id="board" data-index="board" aria-labelledby="landing-board"
      className={s.board} data-testid="board">
      <div ref={stage} className={s.boardStage}>
        <div className={`${s.wrap} ${s.boardWrap}`}>
          <div ref={inner} className={s.boardInner}>
            <div ref={grid} className={s.boardGrid} data-rise-group
              data-rise-skip={pinned ? "" : undefined}>
              <div>
                <p className={s.eyebrow} data-rise>T{"−"}3h · the board</p>
                <h2 id="landing-board" className={`${s.display} ${s.h2}`} data-rise>Every fixture, ranked.</h2>
              </div>
              <p className={s.body} data-rise>
                Clubs and national teams, ranked by the gap between the
                sides&nbsp;— never picked. On this card, Real Madrid by a
                little: second v third, the exchange near 49¢. Our model,
                locked at T{"−"}10, leaned the other&nbsp;way.
              </p>
            </div>
            <BoardShot />
          </div>
        </div>
      </div>
    </section>
  );
}

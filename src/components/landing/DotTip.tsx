// HOVER A DOT: ITS TEAM AND ITS ELO.
//
// "dot hover with name and Elo" — a quiet glass card that fades in just
// above the nearest dot and glides between neighbours, with a soft halo
// on the dot. Mouse hover, or a tap on touch. It answers only while the
// hero shows the planes (not during the scroll story), and when a
// competition is lit only its own dots answer.
//
// WHAT IT READS. Every dot on both planes carries `data-n` (the team as
// the page prints it), `data-v` (its rating, as the baked field served
// it), `data-c` (its competition's index into COMPS) and, when lit,
// `data-lit`. Nothing here knows a rating: it reads the attribute the
// dot was drawn from, so the card cannot disagree with the dot.
//
// THE CARD IS DECORATION FOR A POINTER. It is `aria-hidden` and the
// dots are not focusable: the same ratings are in the panel (top three
// or low / median / high) and in the planes' accessible names, and a
// screen-reader or keyboard reader loses nothing it can reach.
//
// Positions are written straight onto the two elements (left / top glide
// by CSS transition); React renders them once and the pointer's rAF does
// the rest. The content is built with textContent, never markup.
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { COMPS, fmtElo } from "../../lib/landingField";
import { hueOf } from "../../lib/leagueHue";
import s from "./landing.module.css";

export default function DotTip({ stage, enabled }: {
  stage: RefObject<HTMLElement | null>; enabled: boolean }) {
  const tip = useRef<HTMLDivElement | null>(null);
  const halo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const st = stage.current, tp = tip.current, hl = halo.current;
    if (!st || !tp || !hl) return;
    let raf = 0;
    let at: [number, number] | null = null;
    let cur: Element | null = null;

    const hide = () => {
      if (!cur) return;
      cur = null;
      tp.classList.remove(s.show);
      hl.classList.remove(s.show);
    };
    const cands = () => {
      if (!enabled) return [];
      const all = [...st.querySelectorAll<HTMLElement>("[data-n]")];
      const lit = all.some((el) => el.dataset.lit != null);
      return all.filter((el) => el.style.visibility !== "hidden"
        && (!lit || el.dataset.lit != null));
    };
    const show = (x: number, y: number) => {
      let best: { el: HTMLElement; cx: number; cy: number; top: number } | null = null;
      let bd = Infinity;
      for (const el of cands()) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d <= Math.max(r.width / 2 + 5, 9) && d < bd) { bd = d; best = { el, cx, cy, top: r.top }; }
      }
      if (!best) { hide(); return; }
      if (best.el !== cur) {
        cur = best.el;
        const c = COMPS[Number(best.el.dataset.c)];
        const hue = hueOf(c.k);
        tp.style.setProperty("--hue", hue);
        hl.style.setProperty("--hue", hue);
        const name = document.createElement("b");
        name.textContent = best.el.dataset.n ?? "";
        const elo = document.createElement("span");
        elo.textContent = `${fmtElo(Number(best.el.dataset.v))} Elo`;
        const comp = document.createElement("em");
        comp.append(document.createElement("i"), c.name);
        tp.replaceChildren(name, elo, comp);
      }
      const sr = st.getBoundingClientRect();
      const half = tp.offsetWidth / 2 + 8;
      const lx = Math.min(Math.max(best.cx - sr.left, half), sr.width - half);
      tp.style.left = `${lx.toFixed(1)}px`;
      tp.style.top = `${(best.top - sr.top).toFixed(1)}px`;
      hl.style.left = `${(best.cx - sr.left).toFixed(1)}px`;
      hl.style.top = `${(best.cy - sr.top).toFixed(1)}px`;
      tp.classList.add(s.show);
      hl.classList.add(s.show);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      at = [e.clientX, e.clientY];
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (at) show(at[0], at[1]); });
    };
    const onLeave = () => { at = null; hide(); };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") show(e.clientX, e.clientY); };
    st.addEventListener("pointermove", onMove, { passive: true });
    st.addEventListener("pointerleave", onLeave);
    st.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", hide, { passive: true });
    if (!enabled) hide();
    return () => {
      st.removeEventListener("pointermove", onMove);
      st.removeEventListener("pointerleave", onLeave);
      st.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", hide);
      if (raf) cancelAnimationFrame(raf);
      hide();
    };
  }, [stage, enabled]);

  return (
    <>
      <div ref={halo} aria-hidden className={s.dotHalo} />
      <div ref={tip} role="tooltip" aria-hidden className={s.dotTip} />
    </>
  );
}

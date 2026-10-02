// SCROLL-LINKED SCENES FOR THE LANDING PAGE — one small hook, no library.
//
// A scene is a section whose drawing is a function of how far the reader
// has scrolled through it. The hook reads ONE rect per animation frame
// and hands the progress to a callback that writes transform / opacity /
// clip-path straight onto refs. Nothing here sets React state per frame:
// a scene that needs to re-render (the match clock, once per whole
// minute) decides that itself, and only on a change.
//
// Two shapes:
//   "pinned" — the section is tall and its stage is `position: sticky`.
//              p runs 0→1 while the stage is parked: from the section's
//              top reaching the stage's sticky top, to its bottom
//              leaving it.
//   "pass"   — nothing is pinned. p runs 0→1 as the element's top
//              travels from `from` to `to` (fractions of the viewport
//              height), i.e. while it scrolls through the reading zone.
//
// Listeners are passive; frames are coalesced (one rAF in flight at
// most); the callback runs once on mount so a page loaded mid-scroll
// draws the right state at once. `enabled: false` (reduced motion)
// attaches nothing at all.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** progress through [a, b] of an outer progress p, clamped */
export const span = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));
export const easeInOut = (t: number) =>
  (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Opts =
  | { mode: "pinned"; stage: RefObject<HTMLElement | null>; enabled: boolean }
  | { mode: "pass"; from: number; to: number; enabled: boolean };

export function useScrollScene(
  target: RefObject<HTMLElement | null>,
  onFrame: (p: number) => void,
  opts: Opts,
) {
  const cb = useRef(onFrame);
  const kick = useRef<(() => void) | null>(null);
  /* A NEW DRAWING (a resize re-laid the scene out) is drawn at once, at
     the current scroll position — not on the next scroll event. */
  useEffect(() => { cb.current = onFrame; kick.current?.(); }, [onFrame]);
  const { enabled, mode } = opts;
  const stage = opts.mode === "pinned" ? opts.stage : null;
  const from = opts.mode === "pass" ? opts.from : 0;
  const to = opts.mode === "pass" ? opts.to : 0;

  useEffect(() => {
    if (!enabled) return;
    const el = target.current;
    if (!el) return;
    let raf = 0;
    let stickyTop = 0, stageH = 0;
    const measure = () => {
      const st = stage?.current;
      if (st) {
        stickyTop = parseFloat(getComputedStyle(st).top) || 0;
        stageH = st.offsetHeight;
      }
    };
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      let p: number;
      if (mode === "pinned") {
        const travel = r.height - stageH;
        p = travel > 0 ? clamp01((stickyTop - r.top) / travel) : 0;
      } else {
        const vh = window.innerHeight;
        p = clamp01((vh * from - r.top) / (vh * (from - to)));
      }
      cb.current(p);
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { measure(); ask(); };
    measure();
    tick();
    kick.current = ask;
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      kick.current = null;
    };
  }, [enabled, mode, target, stage, from, to]);
}

// ---- prefers-reduced-motion, SSR-safe -------------------------------
// The server cannot know the preference, so it renders the moving
// version (false); the client answers on hydration and re-renders the
// still one. The CSS carries the same media query, so the tall pinned
// sections are already collapsed before this runs.
const RM = "(prefers-reduced-motion: reduce)";
function subscribe(fn: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe,
    () => window.matchMedia(RM).matches, () => false);
}

/** The size of an element, measured by ResizeObserver. `fallback` is
 *  what the server renders with (and what the first client render uses,
 *  so hydration matches); the real size arrives a frame later. */
export function useSize<T extends HTMLElement>(
  fallback: { w: number; h: number },
): [RefObject<T | null>, { w: number; h: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      const h = Math.round(e.contentRect.height);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

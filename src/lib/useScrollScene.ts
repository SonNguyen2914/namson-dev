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
// ONE FRAME FOR EVERY SCENE, READS BEFORE WRITES (2026-10-03). Each
// scene used to own a scroll listener and a rAF, and read its rect in
// its own callback — after the scene before it had written styles, so
// up to three forced style recalcs a frame — and every scene kept
// drawing at the footer, the field rewriting ~95 elements per frame
// off-screen. Now all scenes share ONE passive scroll listener and ONE
// rAF: the frame reads every scene's rect first, then draws only the
// scenes whose p actually changed. A scene parked at its clamped end
// (p = 0 below the screen, 1 above it) costs one rect read and nothing
// else. (Gating each scene on an IntersectionObserver was measured and
// rejected: its callback lands a frame after a jump — the Home key, a
// link to the top — so the field drew its zoomed-in end for a frame at
// the top of the page, and Chrome then rastered the plane at that zoom
// for the rest of the visit: 0.8 → 9 ms of raster per frame.)
//
// The callback still runs once on mount so a page loaded mid-scroll
// draws the right state at once, and a new drawing (a resize re-laid
// the scene out) is drawn at once too. `enabled: false` (reduced
// motion) registers nothing at all.
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

/* THE SHARED FRAME. Module state, browser-only (it is touched from
   effects alone). */
type Scene = { read: () => number; draw: (p: number) => void; measure: () => void; last: number };
const scenes = new Set<Scene>();
let frameId = 0;
function frame() {
  frameId = 0;
  const list = [...scenes];
  const ps = list.map((sc) => sc.read());            // every read first…
  list.forEach((sc, i) => {                           // …then the writes
    if (ps[i] !== sc.last) { sc.last = ps[i]; sc.draw(ps[i]); }
  });
}
function ask() { if (!frameId) frameId = requestAnimationFrame(frame); }
function onResize() { scenes.forEach((sc) => { sc.measure(); sc.last = NaN; }); ask(); }
function register(sc: Scene) {
  if (scenes.size === 0) {
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
  }
  scenes.add(sc);
  return () => {
    scenes.delete(sc);
    if (scenes.size === 0) {
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", onResize);
      if (frameId) { cancelAnimationFrame(frameId); frameId = 0; }
    }
  };
}

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
    let stickyTop = 0, stageH = 0;
    const measure = () => {
      const st = stage?.current;
      if (st) {
        stickyTop = parseFloat(getComputedStyle(st).top) || 0;
        stageH = st.offsetHeight;
      }
    };
    const read = () => {
      const r = el.getBoundingClientRect();
      if (mode === "pinned") {
        const travel = r.height - stageH;
        return travel > 0 ? clamp01((stickyTop - r.top) / travel) : 0;
      }
      const vh = window.innerHeight;
      return clamp01((vh * from - r.top) / (vh * (from - to)));
    };
    const sc: Scene = { read, measure, last: NaN, draw: (p) => cb.current(p) };
    measure();
    sc.last = read();
    cb.current(sc.last);
    kick.current = () => { sc.last = NaN; ask(); };
    const off = register(sc);
    return () => { off(); kick.current = null; };
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

/** A CSS media query, SSR-safe: the server answers `fallback`, the client
 *  answers on hydration (the same two-render shape as useReducedMotion). */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    },
    () => window.matchMedia(query).matches,
    () => fallback);
}

// ---- the motion gate -------------------------------------------------
/* THE MOTION GATE. Scenes pin only when motion is allowed AND the screen
   is tall enough to hold a stage: 540px, or 620px from 1024px wide (a
   short laptop window cannot hold the hero's first screen pinned).
   Anything else renders every scene as its still.

   A phone's address bar grows and shrinks the viewport by 50–100px as
   the reader scrolls and must never re-flip the gate: the answer is
   recomputed on a resize only when the width changed or the height moved
   by 120px or more (a rotation, a window drag, a keyboard). */
const gate = { w: 0, h: 0, on: true };
const gateOpen = (w = window.innerWidth, h = window.innerHeight) => {
  return !window.matchMedia(RM).matches && h >= 540 && !(w >= 1024 && h < 620);
};
function gateRead() {
  if (typeof window === "undefined") return true;
  if (gate.w === 0) { gate.w = window.innerWidth; gate.h = window.innerHeight; gate.on = gateOpen(); }
  return gate.on;
}
function gateSubscribe(fn: () => void) {
  const mq = window.matchMedia(RM);
  /* RE-READ ON ATTACH. The gate is module state and the listeners below
     live only while a page that reads it is mounted. A reader who leaves
     for another page, rotates the phone (or drags the window short, or
     flips reduced motion) there, and comes back by client-side
     navigation would otherwise get the gate computed for the OLD screen.
     The same hysteresis applies: an address-bar wobble does not re-flip
     it; a width change, a 120px height change or a motion preference
     does. */
  if (gate.w !== 0) {
    const w = window.innerWidth, h = window.innerHeight;
    const moved = w !== gate.w || Math.abs(h - gate.h) >= 120;
    const before = gate.on;
    if (moved) { gate.w = w; gate.h = h; }
    // against the RECORDED size, so a wobble under 120px changes nothing
    gate.on = gateOpen(gate.w, gate.h);
    if (gate.on !== before) fn();
  }
  const onChange = () => { gate.w = window.innerWidth; gate.h = window.innerHeight; gate.on = gateOpen(); fn(); };
  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === gate.w && Math.abs(h - gate.h) < 120) return;
    onChange();
  };
  mq.addEventListener("change", onChange);
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("resize", onResize);
  };
}
/** True when the scenes may pin. The server renders the moving page
 *  (true) and the client answers on hydration. */
export function useMotionGate(): boolean {
  return useSyncExternalStore(gateSubscribe, gateRead, () => true);
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

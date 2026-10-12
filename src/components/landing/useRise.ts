// STILL SECTIONS RISE ONCE.
//
// A block marked `data-rise-group` holds elements marked `data-rise`.
// When the group is still below the fold at load, its elements are armed
// (transparent, 24px low) and, as the group crosses 15% up the screen,
// each rises in turn (120ms apart). THE RESTING STATE IS THE VISIBLE
// ONE: nothing is armed by CSS or by the server, so a reader without
// script, with reduced motion, or whose browser lacks IntersectionObserver
// sees the page whole; a group already on screen at load is left alone;
// and a group marked `data-rise-skip` (the pinned board's heading, which
// its scroll scene fades in) is not touched. Cleaning up disarms
// everything, so a page that stops rising never strands a transparent
// block.
import { useEffect } from "react";
import s from "./landing.module.css";

/** an observer whose root is THIS document: inside a cross-origin frame
 *  the implicit root is the top page and rootMargin would be ignored */
function makeIO(cb: IntersectionObserverCallback, opts: IntersectionObserverInit) {
  try { return new IntersectionObserver(cb, { root: document, ...opts }); }
  catch { return new IntersectionObserver(cb, opts); }
}

/** `skipKey` changes when a group gains or loses `data-rise-skip`. */
export function useRise(enabled: boolean, skipKey: string) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const armed: HTMLElement[] = [];
    const io = makeIO((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll<HTMLElement>("[data-rise]").forEach((el) => {
        el.classList.add(s.riseIn);
        el.classList.remove(s.riseArmed);
        el.addEventListener("transitionend", () => el.classList.remove(s.riseIn), { once: true });
      });
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -15% 0px", threshold: 0 });
    document.querySelectorAll<HTMLElement>("[data-rise-group]").forEach((g) => {
      if (g.hasAttribute("data-rise-skip")) return;
      if (g.getBoundingClientRect().top < innerHeight * 0.85) return;   // seen already: leave it at rest
      g.querySelectorAll<HTMLElement>("[data-rise]").forEach((el, i) => {
        el.style.setProperty("--d", `${(i * 0.12).toFixed(2)}s`);
        el.classList.add(s.riseArmed);
        armed.push(el);
      });
      io.observe(g);
    });
    return () => {
      io.disconnect();
      armed.forEach((el) => el.classList.remove(s.riseArmed, s.riseIn));
    };
  }, [enabled, skipKey]);
}

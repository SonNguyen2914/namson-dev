// THE SECTION INDEX, in the top bar's left slot (wide screens only).
//
// Field · Board · Clock · Review · Record: plain in-page anchors, one per
// section carrying `data-index`, with the link of the section the reader
// is in marked `aria-current="location"` (a hairline under it). The
// marking follows a band across the middle of the screen (40% down to
// 41%), observed — no scroll handler. It names where the reader IS, and
// nothing about the data. Below 1024px the bar has no room for it and it
// is not drawn (landing.module.css), which loses nothing: it is a
// convenience over a page that reads top to bottom.
import { useEffect, useRef } from "react";
import s from "./landing.module.css";

const ITEMS = [
  ["field", "Field"], ["board", "Board"], ["clock", "Clock"],
  ["review", "Review"], ["record", "Record"],
] as const;

export default function LandingIndex() {
  const nav = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = nav.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const links = [...el.querySelectorAll("a")];
    const mark = (k: string) => links.forEach((a) => {
      if (a.getAttribute("href") === `#${k}`) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    const make = (cb: IntersectionObserverCallback, o: IntersectionObserverInit) => {
      try { return new IntersectionObserver(cb, { root: document, ...o }); }
      catch { /* SWALLOWED(landing:io-document-root) */ return new IntersectionObserver(cb, o); }
    };
    const io = make((es) => es.forEach((e) => {
      if (e.isIntersecting) mark((e.target as HTMLElement).dataset.index ?? "");
    }), { rootMargin: "-40% 0px -59% 0px", threshold: 0 });
    document.querySelectorAll("[data-index]").forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, []);
  return (
    <nav ref={nav} className={s.index} aria-label="On this page" data-testid="landing-index">
      {ITEMS.map(([k, label]) => <a key={k} href={`#${k}`}>{label}</a>)}
    </nav>
  );
}

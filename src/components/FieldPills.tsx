// THE FIELD PAGE'S PILLS — the board's LeagueRibbon pill, as a toggle.
//
// NOT `LeagueRibbon` ITSELF, and the reason is structural rather than
// taste. The ribbon's slots are keyed by POSITION and written
// imperatively by `useBoardLoop`, which lights whichever four columns a
// scrolling board has on screen; nothing in it can be pressed to mean
// "include this league". What is reused is everything a reader SEES:
//
//   the pill        `rounded-lg border border-line bg-bs-elev2 py-2
//                   font-mono text-[10px] uppercase leading-tight
//                   tracking-[0.08em] text-ink-faint`, hovering to
//                   `border-ink-faint`, an 8px dot — verbatim, with ONE
//                   measured exception: the side padding is px-2 and the
//                   dot gap 1.5 where the ribbon has px-2.5 and 2. The
//                   ribbon's desktop slot is 182px (a 1536px bar over
//                   eight); this page's is 117px (max-w-5xl over eight),
//                   and "PREMIER LEAGUE" in Geist Mono at 10px/.08em
//                   needed 122px with the ribbon's padding — so the eighth
//                   pill fell off the strip at 1160. 6px back from the
//                   padding and the gap, and none of the type, fits it.
//   LIT             the league's own hue on the border, ink-hi letters,
//                   the dot at full opacity with the ribbon's halo
//                   `0 0 0 3px color-mix(in srgb, <hue> 22%, transparent)`
//   UNLIT           the dot at 0.3
//   the slot        (w − RGAP × (n − 1)) / n, RGAP 6 — measured after
//                   `document.fonts.ready` and on resize, and never
//                   narrower than the widest label needs, so the strip
//                   scrolls sideways rather than clipping a name
//   the reveal      CHURN, 1000/13 ms, 430 ms, 26 ms stagger — the
//                   ribbon's constants — with a token PER PILL: a shared
//                   token stranded pills mid-churn when one was toggled
//                   while another resolved. Silent under reduced motion.
//
// The 44px coarse-pointer floor is the one in globals.css
// (`[data-tap-floor]`, and `tap-floor-room` on the strip, whose y axis
// clips), so there is still one definition of it.
import {
  CSSProperties, ReactNode, RefObject, useCallback, useEffect, useRef,
} from "react";

import { hueOf } from "./PickerColumn";

/** The ribbon's constants, restated because LeagueRibbon keeps them
 *  module-private. e2e/the-field-page.spec.ts pins them equal to the
 *  ribbon's source, so the two cannot drift apart quietly. */
export const CHURN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-%$.,/#&*+=<>?@";
export const CHURN_MS = 1000 / 13;
export const REVEAL_MS = 430;
export const STAGGER_MS = 26;
export const RGAP = 6;

const quiet = () => typeof window !== "undefined" && !!window.matchMedia
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The random letter reveal, over the pills handed to it. Each pill owns
 *  its run: `tok` lives on the element, so only a NEW run on the SAME
 *  pill supersedes one in flight. */
export function useLetterReveal() {
  const toks = useRef(new WeakMap<HTMLElement, number>());
  return useCallback((pills: HTMLElement[]) => {
    const jobs = pills.map((b, k) => {
      const cells = Array.from(
        b.querySelectorAll<HTMLElement>("[data-cell]"));
      const txt = cells.map((c) => c.dataset.cell ?? "");
      const order = txt.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { b, cells, txt, order, start: k * STAGGER_MS };
    });
    const settle = (j: (typeof jobs)[number]) => j.cells.forEach((c, i) => {
      if (c.textContent !== j.txt[i]) c.textContent = j.txt[i];
      c.removeAttribute("data-churn");
    });
    if (quiet()) { jobs.forEach(settle); return; }
    const mine = jobs.map((j) => {
      const t = (toks.current.get(j.b) ?? 0) + 1;
      toks.current.set(j.b, t);
      return t;
    });
    const t0 = performance.now();
    let last = -1e9;
    const frame = (now: number) => {
      const live = jobs.filter((j, i) => toks.current.get(j.b) === mine[i]);
      if (!live.length) return;
      const churn = now - last >= CHURN_MS;
      if (churn) last = now;
      let done = true;
      for (const j of live) {
        const e = now - t0 - j.start;
        if (e < 0) { done = false; continue; }
        const prog = Math.min(1, e / REVEAL_MS);
        if (prog < 1) done = false;
        const open = new Set(j.order.slice(0, Math.round(prog * j.txt.length)));
        j.cells.forEach((c, i) => {
          if (open.has(i) || j.txt[i] === " ") {
            if (c.textContent !== j.txt[i]) c.textContent = j.txt[i];
            c.removeAttribute("data-churn");
          } else if (churn) {
            c.textContent = CHURN.charAt(Math.floor(Math.random() * CHURN.length));
            c.setAttribute("data-churn", "1");
          }
        });
      }
      if (done) { live.forEach(settle); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);
}

/** THE SLOT, by the ribbon's formula, measured after the web font
 *  settles (a slot sized against the fallback clips the longest name)
 *  and again on resize. Written as `--slot` on the strip. */
export function useRibbonSlot(strip: RefObject<HTMLDivElement | null>,
                              deps: unknown[]) {
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const fit = () => {
      const ps = Array.from(el.querySelectorAll<HTMLElement>("[data-pill]"));
      if (!ps.length) return;
      el.style.setProperty("--slot", "auto");
      const need = Math.ceil(Math.max(...ps.map(
        (p) => p.getBoundingClientRect().width)));
      const n = ps.length;
      const slot = Math.floor((el.clientWidth - RGAP * (n - 1)) / n);
      el.style.setProperty("--slot", `${Math.max(slot, need)}px`);
    };
    fit();
    let alive = true;
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => { if (alive) fit(); });
    }
    window.addEventListener("resize", fit);
    return () => { alive = false; window.removeEventListener("resize", fit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** The label as fixed-advance cells, so a churning glyph never shifts
 *  its neighbours. React renders the true characters; the reveal only
 *  ever writes a cell's text and its `data-churn`, and ends on the true
 *  character, so a re-render cannot disagree with it. */
function Cells({ text }: { text: string }) {
  return (
    <span className="inline-flex whitespace-pre">
      {Array.from(text).map((ch, i) => (
        <span key={i} data-cell={ch}
          className="inline-block w-[1ch] text-center data-[churn=1]:text-[var(--h)]">
          {ch}
        </span>
      ))}
    </span>
  );
}

/** One pill. `hue` is a key `hueOf` knows (a board column or a cup), so
 *  this file keeps no second copy of the palette. */
export function RibbonPill({ hueKey, label, on, onClick, title, testId,
  dataKey, disabled, children }: {
  hueKey: string;
  label: string;
  on: boolean;
  onClick: () => void;
  title?: string;
  testId: string;
  dataKey: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const hue = hueOf(hueKey);
  return (
    <button type="button" data-pill data-testid={testId} data-key={dataKey}
      aria-pressed={on} title={title} onClick={onClick} disabled={disabled}
      style={{ "--h": hue, ...(on ? { borderColor: hue } : {}) } as CSSProperties}
      className={`flex w-[var(--slot,auto)] min-w-0 flex-none items-center justify-center gap-1.5 rounded-lg border border-line bg-bs-elev2 px-2 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] transition-colors hover:border-ink-faint ${
        on ? "text-ink-hi" : "text-ink-faint"}`}>
      <i aria-hidden data-testid="pill-dot"
        style={{
          backgroundColor: hue, opacity: on ? 1 : 0.3,
          boxShadow: on
            ? `0 0 0 3px color-mix(in srgb, ${hue} 22%, transparent)` : "none",
        }}
        className="h-2 w-2 flex-none rounded-full transition-opacity" />
      <Cells text={label} />
      {children}
    </button>
  );
}

/** The strip: ONE row that never wraps, scrolling sideways (scrollbar
 *  hidden) rather than wrapping when the window is too narrow. */
export function RibbonStrip({ stripRef, label, children, testId }: {
  stripRef: RefObject<HTMLDivElement | null>;
  label: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <div ref={stripRef} role="group" aria-label={label} data-testid={testId}
      style={{ gap: `${RGAP}px` }}
      className="tap-floor-room flex min-w-0 flex-1 flex-nowrap overflow-x-auto overflow-y-clip [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

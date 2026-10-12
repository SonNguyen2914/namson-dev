// THE OPENING, AND THE FIRST SCROLL MOMENT.
//
// THE HERO (v8). The headline, a switch of the eleven competitions, both
// rating planes and a detail panel share the first screen. Every club of
// the eight board leagues sits on ONE rating scale (the club plane), each
// a small light in its league's own hue (through `hueOf`, the one door a
// slug becomes a colour); the 139 national teams of the three national
// competitions sit on a scale of their own beneath it. Picking a
// competition lifts its dots into a ranked strip at the SAME x (one
// scale), sinks the rest of its plane and fades the other plane. It also
// plays through them on its own, five seconds each, until the reader
// touches anything (the rules are in the cycle effect below).
//
// THEN THE STORY. Scrolling pins the stage and the camera moves in on two
// clubs of one real, finished fixture — Atlético Madrid v Real Madrid,
// 20 Sep 2026 — until their gap fills the frame, and then splits it the
// way the board's venue line does: the rating gap, the home term, and
// what is left. The hero's club dots ARE the story's dots: the hero is
// the story's first state, mapped into the left column by one transform
// on the plane (`G.b`), so nothing is redrawn when the story begins.
//
// MOTION BUDGET. The plane is ONE transformed layer (translate + scale);
// the dots never move individually from script — lifting a competition
// is a class and a CSS transition. The overlay — ticks, the two club
// markers, the brackets — is a few dozen absolutely-placed boxes moved by
// `transform` only. All of it is written straight onto refs from the
// scroll callback; React renders this component once per resize or pick.
//
// THREE RENDERINGS, ONE DRAWING: `scroll` is the pinned scene; `hero` and
// `match` are its two ends as still figures, which is what a reader who
// asked for reduced motion (or has a screen too short to pin) gets — the
// same content, nothing withheld.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { hueOf } from "../../lib/leagueHue";
import { FIELD, FOCUS, GAP } from "../../lib/landingData";
import {
  CLUB_ARIA, COMPS, E0, E1, HPAD, NAT_ARIA, NC, N_TEAMS, PLANE, RANK, SHORT,
  SHOWN_NAME, TICKS, TICK_EDGE, fmtElo, heroBuild, layoutField, litAria,
} from "../../lib/landingField";
import type { HeroGeo, StripMark } from "../../lib/landingField";
import {
  clamp01, easeInOut, easeOut, lerp, span, useScrollScene, useSize,
} from "../../lib/useScrollScene";
import CompPanel from "./CompPanel";
import DotTip from "./DotTip";
import s from "./landing.module.css";

/** "2026-10-07" → "7 Oct" (the day the baked field was read) */
const asOf = (iso: string, year = false) => new Date(`${iso}T12:00:00Z`)
  .toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC",
    ...(year ? { year: "numeric" } : {}) });

/** the story begins at this progress through the scene */
const STORY_AT = 0.012;
/** the cycle: All → each competition, this long on each */
const CYC_MS = 5000;

type Mode = "scroll" | "hero" | "match";
type Vars = CSSProperties & Record<`--${string}`, string | number | undefined>;
const px = (v: number) => `${v.toFixed(1)}px`;
const IDS = [-1, ...COMPS.map((c) => c.i)];

/* WHERE THE HERO LANDED, measured once per build and read by every
   frame: the slot's offset inside the plane (so the story's plane can be
   mapped into the hero's column), and how much the hero overflows or
   under-fills the pinned screen. */
type Meta = { tx: number; ty: number; axisY: number; ax0: number; axW: number;
  extra: number; lift: number; tv: number };

function offsetIn(el: HTMLElement, anc: HTMLElement) {
  let top = 0, left = 0;
  for (let e: HTMLElement | null = el; e && e !== anc; e = e.offsetParent as HTMLElement | null) {
    top += e.offsetTop; left += e.offsetLeft;
  }
  return { top, left };
}

/** One lit strip's marks: the range line, the labels and their leaders. */
function Marks({ marks, shown }: { marks: StripMark[]; shown: number }) {
  return (
    <>
      {marks.map((m, k) => {
        const on = m.c === shown ? s.on : "";
        if (m.kind === "rng") {
          return <i key={k} data-c={m.c} className={`${s.rng} ${on}`}
            style={{ "--hue": hueOf(COMPS[m.c].k), width: m.width,
              transform: `translate(${px(m.x)},${px(m.y)})` } as Vars} />;
        }
        if (m.kind === "lead") {
          return <i key={k} data-c={m.c} className={`${s.lead} ${on}`}
            style={{ height: Math.max(0, m.height),
              transform: `translate(${px(m.x)},${px(m.y)})` }} />;
        }
        const t = m.align === "r" ? `translate(${px(m.x)},${m.y}px) translateX(-100%)`
          : m.align === "l" ? `translate(${px(m.x)},${m.y}px)`
          : `translate(${px(m.x)},${m.y}px) translateX(-50%)`;
        return (
          <span key={k} data-c={m.c} className={`${s.lab} ${on}`} style={{ transform: t }}>
            <b>{m.rank ?? m.word}</b>{m.name}{m.rank ? <em>{m.value}</em> : m.value}
          </span>
        );
      })}
    </>
  );
}

export default function FieldStage({ mode, enabled }: { mode: Mode; enabled: boolean }) {
  const hasHero = mode !== "match";
  const hasStory = mode !== "hero";
  const pinned = mode === "scroll" && enabled;

  const section = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const [planeRef, size] = useSize<HTMLDivElement>({ w: 1200, h: 360 });
  const [slotRef, slotSize] = useSize<HTMLDivElement>({ w: 640, h: 0 });
  const L = useMemo(() => layoutField(size.w, size.h), [size.w, size.h]);
  const G: HeroGeo | null = useMemo(
    () => (hasHero ? heroBuild(L, slotSize.w) : null), [hasHero, L, slotSize.w]);

  const heroBox = useRef<HTMLDivElement | null>(null);
  const hero = useRef<HTMLDivElement | null>(null);
  const h1 = useRef<HTMLHeadingElement | null>(null);
  const heroUi = useRef<HTMLDivElement | null>(null);
  const match = useRef<HTMLDivElement | null>(null);
  const storyH = useRef<HTMLHeadingElement | null>(null);
  const backEl = useRef<HTMLButtonElement | null>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const inner = useRef<HTMLDivElement | null>(null);
  const dim = useRef<HTMLDivElement | null>(null);
  const ticks = useRef<(HTMLDivElement | null)[]>([]);
  const mk = useRef<Record<string, HTMLDivElement | null>>({});
  const note = useRef<HTMLParagraphElement | null>(null);
  const pitch = useRef<SVGSVGElement | null>(null);
  const tabsEl = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ppEl = useRef<HTMLButtonElement | null>(null);
  const meta = useRef<Meta>({ tx: 0, ty: 0, axisY: 0, ax0: 0, axW: 0, extra: 0, lift: 0, tv: 0 });

  /* WHAT IS LIT. `sel` is the reader's pick (or the cycle's); once the
     story has begun the field goes back to all eleven so the La Liga pair
     can zoom out of it. */
  const [sel, setSelState] = useState(-1);
  const selRef = useRef(-1);
  const [story, setStoryState] = useState(false);
  const storyRef = useRef(false);
  const shown = story ? -1 : sel;
  const lit = shown >= 0 ? COMPS[shown] : null;
  const setSel = useCallback((i: number) => { selRef.current = i; setSelState(i); }, []);

  /* THE TWO CLUB LABELS STAY INSIDE THE GUTTER (2026-10-03). At 390px
     "REAL MADRID" ran to 2px from the screen's edge. Their widths are
     measured (they change when Archivo arrives), and the scene clamps
     each label's box inside the page gutter — the dot stays where the
     rating puts it; only its caption slides in. */
  const [labW, setLabW] = useState({ home: 0, away: 0 });
  /* every tick label is five mono characters ("1,300"–"2,100"), so one
     measured width serves them all; it changes when the font arrives */
  const [tickW, setTickW] = useState(34);
  useEffect(() => {
    const el = ticks.current.find((t) => t?.lastElementChild?.tagName === "SPAN")
      ?.lastElementChild as HTMLElement | undefined;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = Math.ceil(el.offsetWidth);
      setTickW((v) => (v === w || w === 0 ? v : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const h = mk.current.homeLab, a = mk.current.awayLab;
    if (!h || !a || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const next = { home: h.offsetWidth, away: a.offsetWidth };
      setLabW((v) => (v.home === next.home && v.away === next.away ? v : next));
    });
    ro.observe(h);
    ro.observe(a);
    return () => ro.disconnect();
  }, []);

  /* THE HERO LANDS (a layout effect: before the browser paints the build).
     The slot's offset inside the plane maps the story's plane into the
     hero's column; the hero's height decides how much of the pinned
     screen it overflows (it then scrolls 1:1 inside it first) or
     under-fills (it then sits in the middle, not on its top). `data-snap`
     stops every transition for the frames in which the build lands:
     first paint and rebuilds land in place. */
  const [metaV, setMetaV] = useState(0);
  const [fontsV, setFontsV] = useState(0);
  useEffect(() => { document.fonts?.ready.then(() => setFontsV((v) => v + 1)); }, []);
  useLayoutEffect(() => {
    const st = stage.current, plane = planeRef.current, slot = slotRef.current;
    const box = heroBox.current, sec = section.current;
    if (!G || !st || !plane || !slot || !box || !sec) return;
    st.setAttribute("data-snap", "");
    box.style.top = "";
    const so = offsetIn(slot, st), po = offsetIn(plane, st);
    const top = so.top - po.top, left = so.left - po.left;
    const m = meta.current;
    m.tx = left + HPAD - L.X(E0) * G.b;
    m.ty = top + G.restY - L.cy * G.b;
    m.axisY = top + G.axisY;
    m.ax0 = left + HPAD - 10;
    m.axW = slotSize.w - 2 * HPAD + 20;
    const tl = tabsEl.current;
    if (tl) tl.toggleAttribute("data-over", tl.scrollWidth > tl.clientWidth + 2);
    /* a hero taller than the pinned screen scrolls 1:1 inside it first (a
       phone, a short laptop); the story's own 260vh is unchanged */
    const over = Math.ceil(box.offsetHeight - st.clientHeight);
    m.extra = pinned ? Math.max(0, over) : 0;
    /* a hero shorter than the pinned screen sits in its middle */
    m.lift = pinned && over < 0 ? Math.floor(-over / 2) : 0;
    if (m.lift) { box.style.top = `${m.lift}px`; m.ty += m.lift; m.axisY += m.lift; }
    sec.style.setProperty("--hero-x", `${m.extra}px`);
    m.tv = pinned ? sec.offsetHeight - st.offsetHeight : 0;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => st.removeAttribute("data-snap"));
    });
    setMetaV((v) => v + 1);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [G, L, pinned, slotSize.w, fontsV, planeRef, slotRef]);

  /* THE STORY BEGINS / ENDS. Focus inside the hero would drop to <body>
     when it goes inert: a keyboard focus goes to the way back (visible,
     and Tab carries on into the story); any other focus to the story's
     own heading. Back at rest, a focus left on the way back returns to
     the selected key. */
  const cycleSync = useRef<() => void>(() => {});
  const onStory = useCallback((on: boolean) => {
    if (on === storyRef.current) return;
    storyRef.current = on;
    const ui = heroUi.current, back = backEl.current;
    if (!ui || !back) return;
    back.inert = !on;
    const a = document.activeElement;
    const kb = (el: Element | null) => { try { return !!el?.matches(":focus-visible"); } catch { return false; } };
    if (on && ui.contains(a)) (kb(a) ? back : storyH.current)?.focus({ preventScroll: true });
    if (!on && a === back) { ui.inert = false; tabRefs.current[selRef.current + 1]?.focus({ preventScroll: true }); }
    ui.inert = on;
    setStoryState(on);
    cycleSync.current();
  }, []);

  /* EVERYTHING THE SCENE DRAWS, AS A FUNCTION OF p (0→1 through the
     story) AND hs (how many px of hero overflow have scrolled by). The
     ranges are the ones in trivela-ops/landing/ARCHITECTURE.md §1+2. */
  const draw = useCallback((p: number, hs = 0) => {
    const M = meta.current, W = size.w, H = size.h;
    const set = (el: HTMLElement | null | undefined, t: string, o?: number) => {
      if (!el) return;
      el.style.transform = t;
      if (o != null) el.style.opacity = String(o);
    };
    if (G) onStory(p > STORY_AT);
    /* hh: how much of the hero is still on (1 at rest → 0 as the story begins) */
    const hh = G ? 1 - easeInOut(span(p, 0.035, 0.11)) : 0;
    const zoom = easeInOut(span(p, 0.10, 0.58));
    const sz = 1 + (L.S - 1) * zoom;
    const tz = L.fx * (1 - sz) + (W / 2 - L.fx) * zoom;
    // on a wide screen the match line settles a little above the
    // plane's centre, closer to the words that explain it
    const lineY = L.cy - (L.narrow ? 0 : Math.min(80, H * 0.2)) * zoom;
    const tyz = L.fy * (1 - sz) + (lineY - L.fy) * zoom;
    const sc = G ? lerp(sz, G.b, hh) : sz;
    const tx = G ? lerp(tz, M.tx, hh) : tz;
    const ty = G ? lerp(tyz, M.ty - hs, hh) : tyz;
    const X = (x: number) => x * sc + tx;
    const Y = (y: number) => y * sc + ty;

    if (heroBox.current) heroBox.current.style.transform = hs ? `translate3d(0,${(-hs).toFixed(1)}px,0)` : "";
    /* the headline lifts, scales 1 → 0.94 from its top-left corner, and
       on a wide screen with a fine pointer softens 0 → 6px; the switch,
       the national plane and the panel fade with it */
    if (hero.current) {
      const out = easeOut(span(p, 0.06, 0.28));
      set(hero.current, `translate3d(0,${(-48 * out).toFixed(2)}px,0) scale(${(1 - 0.06 * out).toFixed(4)})`, 1 - out);
      if (h1.current) {
        const blur = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
        h1.current.style.filter = blur && out > 0.004 ? `blur(${(6 * out).toFixed(2)}px)` : "none";
      }
    }
    if (heroUi.current) heroUi.current.style.opacity = String(1 - easeOut(span(p, STORY_AT, 0.07)));
    set(inner.current, `translate3d(${tx}px,${ty}px,0) scale(${sc})`);
    if (dim.current) dim.current.style.opacity = String(1 - 0.9 * easeOut(span(p, 0.12, 0.45)));
    if (pitch.current) pitch.current.style.opacity = String((1 - hh) * (1 - span(p, 0.08, 0.26)));
    if (match.current) {
      const mIn = mode === "match" ? 1 : easeOut(span(p, 0.28, 0.44));
      set(match.current, `translate3d(0,${(24 * (1 - mIn)).toFixed(2)}px,0)`, mIn);
    }
    // the step lines light in turn: faint until reached, full from then
    const stepT = [span(p, 0.58, 0.66), span(p, 0.72, 0.80), span(p, 0.84, 0.92)];
    steps.current.forEach((el, i) => {
      if (el) el.style.opacity = String(mode === "match" ? 1 : lerp(0.26, 1, stepT[i]));
    });

    // the axis: labelled at the finest step that leaves room to read it
    // (≥ 48px apart at this zoom, 72 in the hero); minor ticks only once they part
    const perPx = L.perElo * sc;
    const step = [20, 50, 100, 200, 400].find((v) => v * perPx >= lerp(48, 72, hh)) ?? 400;
    /* the axis rides from the hero's column (just under the club swarm) to
       the story's full-width line under the plane */
    const dy = G ? (M.axisY - hs - (H + 17)) * hh : 0;
    if (G) set(mk.current.axis, `translate3d(${(M.ax0 * hh).toFixed(1)}px,${dy.toFixed(1)}px,0) scaleX(${lerp(1, M.axW / W, hh).toFixed(4)})`);
    ticks.current.forEach((el, i) => {
      if (!el) return;
      const e = TICKS[i];
      const named = e % step === 0;
      const show = named || e % 100 === 0 ? 1 : 10 * perPx >= 7 ? 0.6 * zoom : 0;
      const at = X(L.X(e));
      set(el, `translate3d(${at}px,${dy}px,0)`, show);
      const lab = el.lastElementChild as HTMLElement | null;
      const onPage = at - tickW / 2 >= TICK_EDGE && at + tickW / 2 <= W - TICK_EDGE;
      if (lab && lab.tagName === "SPAN") lab.style.opacity = named && onPage ? "1" : "0";
    });

    // the two clubs leave the swarm for one line
    const rise = easeInOut(span(p, 0.46, 0.60));
    const labIn = easeOut(span(p, 0.48, 0.60));
    const grow = 1 + 0.9 * zoom;
    const fs = G ? lerp(grow, G.b * G.mh, hh) : grow;
    const hx = X(L.home.x), ax = X(L.away.x);
    const hy = lerp(Y(L.home.y), lineY, rise), ay = lerp(Y(L.away.y), lineY, rise);
    set(mk.current.homeDot, `translate3d(${hx}px, ${hy}px, 0) scale(${fs})`);
    set(mk.current.awayDot, `translate3d(${ax}px, ${ay}px, 0) scale(${fs})`);
    // the page gutter (landing.module.css .root), at the plane's width
    const gut = W < 640 ? 16 : W < 1024 ? 32 : 56;
    const hlx = Math.max(hx, gut + labW.home);          // right-aligned to hx
    const alx = Math.min(ax, W - gut - labW.away);      // left-aligned at ax
    set(mk.current.homeLab, `translate3d(${hlx}px, ${hy}px, 0)`, labIn);
    set(mk.current.awayLab, `translate3d(${alx}px, ${ay}px, 0)`, labIn);

    // step 1 — the rating gap, drawn left to right above the line
    const b1 = easeOut(span(p, 0.58, 0.70));
    const w1 = Math.max(0, ax - hx);
    set(mk.current.bracket, `translate3d(${hx}px, ${lineY}px, 0) scaleX(${(w1 / 1000) * b1})`, b1 > 0 ? 1 : 0);
    set(mk.current.bracketLab, `translate3d(${(hx + ax) / 2}px, ${lineY}px, 0)`, easeOut(span(p, 0.62, 0.72)));

    // step 2 — the home term: Atlético's light, moved by +65
    const v = easeInOut(span(p, 0.72, 0.84));
    const gx = X(L.X(GAP.homeAtHome));
    const ringX = lerp(hx, gx, v);
    set(mk.current.ring, `translate3d(${ringX}px, ${lineY}px, 0)`, v > 0 ? Math.min(1, v * 4) : 0);
    set(mk.current.venue, `translate3d(${hx}px, ${lineY}px, 0) scaleX(${Math.max(0, ringX - hx) / 1000})`, v > 0 ? 1 : 0);
    set(mk.current.venueLab, `translate3d(${(hx + gx) / 2}px, ${lineY}px, 0)`, easeOut(span(p, 0.78, 0.86)));

    // step 3 — what is left
    const n = easeOut(span(p, 0.84, 0.92));
    set(mk.current.rest, `translate3d(${gx}px, ${lineY}px, 0) scaleX(${(Math.max(0, ax - gx) / 1000) * n})`, n > 0 ? 1 : 0);
    set(mk.current.restLab, `translate3d(${(gx + ax) / 2}px, ${lineY}px, 0)`, n);
    if (note.current) note.current.style.opacity = String(mode === "match" ? 1 : span(p, 0.6, 0.7));
    // metaV: the hero landed, so the offsets read above are new
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, G, size.w, size.h, labW, tickW, mode, metaV, onStory]);

  const scroll = mode === "scroll";
  /* the field's scroll: first any hero overflow (1:1), then the story's p.
     useScrollScene hands the progress through the whole travel `tv`, so
     the pixels scrolled are p·tv. */
  const scrolled = useCallback((p: number) => {
    const M = meta.current;
    const q = p * M.tv, ex = Math.min(M.extra, M.tv), rest = M.tv - ex;
    draw(rest > 0 ? clamp01((q - ex) / rest) : 0, Math.min(q, ex));
  }, [draw]);
  useScrollScene(section, scrolled, { mode: "pinned", stage, enabled: scroll && enabled });
  // the still figures, and the first paint of the moving one, are drawn
  // by the same function at a fixed p — after layout, once per size.
  const fixedP = mode === "match" ? 1 : 0;
  const drawn = useRef("");
  const key = `${mode}:${size.w}x${size.h}:${enabled}:${labW.home}/${labW.away}:${tickW}:${metaV}`;
  const paint = useCallback((el: HTMLDivElement | null) => {
    stage.current = el;
    if (el && drawn.current !== key && !(scroll && enabled)) {
      drawn.current = key;
      requestAnimationFrame(() => draw(fixedP));
    }
  }, [key, draw, fixedP, scroll, enabled]);

  // ── the cycle, the holds, the keyboard's way ───────────────────────
  const [playing, setPlaying] = useState<"pause" | "play" | "off">("pause");
  const [live, setLive] = useState(true);

  /* THE CYCLE: All → each competition, every 5 s, only while the hero is
     on screen, in a visible tab and before the story begins. A pointer
     or focus resting on the switch, the planes (where the lit labels
     are) or the panel holds the step (its progress line stops where it
     is), and so does the switch being even partly off screen: the panel
     never changes while its Pause is out of reach (WCAG 2.2.2). The
     first deliberate touch (a pointer pressed anywhere in the hero, so a
     tap or the start of a swipe to read on; a key inside the hero) stops
     it for good; an explicit Play keeps it playing through later touches
     until a pick. Under reduced motion nothing advances on its own. */
  useEffect(() => {
    const ui = heroUi.current, pp = ppEl.current, box = stage.current;
    if (!hasHero || !ui || !pp || !box) return;
    const RM = !enabled;
    const CY = { stopped: false, paused: false, manual: false, inView: false,
      barIn: typeof IntersectionObserver === "undefined", hover: false, focus: false,
      t: 0 as ReturnType<typeof setTimeout> | 0, t0: 0, left: CYC_MS };
    const seen = () => !RM && !CY.stopped && !CY.paused && !storyRef.current && CY.inView && !document.hidden;
    const can = () => seen() && CY.barIn && !CY.hover && !CY.focus;
    const step = () => {
      CY.t = 0; CY.left = CYC_MS;
      setSel(selRef.current + 1 >= NC ? -1 : selRef.current + 1);
      sync();
    };
    function sync() {
      const run = can(), sn = seen();
      if (run && !CY.t) { CY.t0 = performance.now(); CY.t = setTimeout(step, CY.left); }
      else if (!run && CY.t) {
        clearTimeout(CY.t); CY.t = 0;
        CY.left = Math.max(250, CY.left - (performance.now() - CY.t0));
      }
      if (!sn) CY.left = CYC_MS;   // off screen, hidden, paused or stopped: the next step starts afresh
      ui!.toggleAttribute("data-run", sn);
      ui!.toggleAttribute("data-hold", sn && !run);
      setPlaying(RM ? "off" : CY.stopped || CY.paused ? "play" : "pause");
      setLive(!run);
    }
    cycleSync.current = sync;
    const stop = () => { if (!CY.stopped) { CY.stopped = true; sync(); } };
    const touch = () => { if (!CY.manual) stop(); };

    const onPP = () => {
      if (!CY.stopped && !CY.paused) CY.paused = true;
      else { CY.stopped = CY.paused = false; CY.manual = true; CY.hover = false; }   // Play starts now, even under the pointer
      sync();
    };
    pp.addEventListener("click", onPP);
    /* a pointer pressed anywhere in the hero is the reader's hand on it:
       a tap, or a phone's swipe down to read the panel. The headline lets
       pointers through, so the stage hears the press and the hero's box
       decides. Passive: the page's own scroll is never held up. */
    const onDown = (e: PointerEvent) => {
      if (storyRef.current || pp.contains(e.target as Node) || backEl.current?.contains(e.target as Node)) return;
      const r = heroBox.current!.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) touch();
    };
    box.addEventListener("pointerdown", onDown, { passive: true });
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!pp.contains(e.target as Node) && !/^(Shift|Control|Alt|Meta|CapsLock)$/.test(e.key)) touch();
    };
    ui.addEventListener("keydown", onKey);
    const holds = [ui.firstElementChild, ui.lastElementChild].filter(Boolean) as Element[];
    const enter = () => { CY.hover = true; sync(); };
    const leave = () => { CY.hover = false; sync(); };
    holds.forEach((el) => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });

    /* keyboard focus inside the hero: the browser scrolls the page to
       show the control, and on a phone that runs past the hero's own
       overflow into the story (which makes the hero inert and drops
       focus). Settle the page on the least hero scroll that shows the
       control, before the shared frame draws. */
    let raf = 0;
    const reveal = (el: Element) => {
      const M = meta.current, sec = section.current, st = stage.current;
      if (!pinned || !sec || !st || storyRef.current || !ui.contains(el) || document.activeElement !== el) return;
      const top = parseFloat(getComputedStyle(st).top) || 0;
      const q = Math.min(M.tv, Math.max(0, top - sec.getBoundingClientRect().top));
      let kbd = true;
      try { kbd = el.matches(":focus-visible"); } catch { /* keep true */ }
      if (!kbd && q <= M.extra) return;                              // a click on something already in view
      const hb = heroBox.current!.getBoundingClientRect(), er = el.getBoundingClientRect();
      const top0 = top + M.lift;
      const lo = Math.max(0, top0 + (er.bottom - hb.top) - innerHeight + 12);
      const hi = Math.min(M.extra, Math.max(0, (er.top - hb.top) - 12));
      const hs = Math.min(q, M.extra), want = lo > hi ? hi : Math.min(Math.max(hs, lo), hi);
      if (Math.abs(want - q) > 0.5) scrollTo(0, scrollY + want - q);
    };
    const onIn = (e: FocusEvent) => {
      CY.focus = !pp.contains(e.target as Node); sync();
      const el = e.target as Element;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => reveal(el));
    };
    const onOut = (e: FocusEvent) => {
      const r = e.relatedTarget as Node | null;
      CY.focus = !!r && ui.contains(r) && !pp.contains(r);
      sync();
    };
    ui.addEventListener("focusin", onIn);
    ui.addEventListener("focusout", onOut);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);

    // a pick, from the switch (click or key): the reader's choice ends the cycle
    const tl = tabsEl.current;
    const onPick = (e: Event) => { if ((e.target as Element).closest("[role=tab]")) stop(); };
    const onTabKey = (e: globalThis.KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) stop();
    };
    tl?.addEventListener("click", onPick);
    tl?.addEventListener("keydown", onTabKey);

    const ios: IntersectionObserver[] = [];
    if (typeof IntersectionObserver !== "undefined") {
      /* an observer whose root is THIS document: inside a cross-origin
         frame the implicit root is the top page and rootMargin would be
         ignored */
      const make = (cb: IntersectionObserverCallback, o: IntersectionObserverInit) => {
        try { return new IntersectionObserver(cb, { root: document, ...o }); }
        catch { return new IntersectionObserver(cb, o); }
      };
      const a = make((es) => {
        const e = es[es.length - 1];
        CY.inView = !!e && e.isIntersecting && e.intersectionRatio >= 0.2;
        sync();
      }, { threshold: [0, 0.2, 0.5] });
      a.observe(ui);
      ios.push(a);
      /* the switch (its keys, its progress line and its Pause) must be
         wholly on screen below the top bar for a step to run */
      const bar = document.querySelector("header.topbar");
      const barTop = Math.max(0, Math.round(bar?.getBoundingClientRect().bottom ?? 0));
      const b = make((es) => {
        const e = es[es.length - 1];
        CY.barIn = !!e && e.isIntersecting && e.intersectionRatio > 0.99;
        sync();
      }, { rootMargin: `-${barTop}px 0px 0px 0px`, threshold: [0, 0.5, 0.99, 1] });
      b.observe(ui.firstElementChild!);
      ios.push(b);
      /* the switch's masked edge sits wherever there is more to scroll to */
      const ts = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
      if (tl && ts.length) {
        const edge = new IntersectionObserver((es) => es.forEach((e) => tl.toggleAttribute(
          e.target === ts[0] ? "data-start" : "data-end", e.intersectionRatio > 0.97)),
        { root: tl, threshold: [0, 0.5, 0.97, 1] });
        edge.observe(ts[0]);
        edge.observe(ts[ts.length - 1]);
        ios.push(edge);
      }
    }
    sync();
    return () => {
      cycleSync.current = () => {};
      if (CY.t) clearTimeout(CY.t);
      cancelAnimationFrame(raf);
      pp.removeEventListener("click", onPP);
      box.removeEventListener("pointerdown", onDown);
      ui.removeEventListener("keydown", onKey);
      holds.forEach((el) => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
      ui.removeEventListener("focusin", onIn);
      ui.removeEventListener("focusout", onOut);
      document.removeEventListener("visibilitychange", onVis);
      tl?.removeEventListener("click", onPick);
      tl?.removeEventListener("keydown", onTabKey);
      ios.forEach((io) => io.disconnect());
    };
  }, [hasHero, enabled, pinned, setSel]);

  /* keep the selected key clear of the switch's masked edges (16% each side) */
  useEffect(() => {
    const tl = tabsEl.current, t = tabRefs.current[sel + 1];
    if (!tl || !t || tl.scrollWidth <= tl.clientWidth + 2) return;
    const left = t.offsetLeft - tl.offsetLeft, cw = tl.clientWidth;
    if (left < tl.scrollLeft + cw * 0.16 || left + t.offsetWidth > tl.scrollLeft + cw * 0.84) {
      tl.scrollTo({ left: Math.max(0, Math.round(left + t.offsetWidth / 2 - cw / 2)),
        behavior: enabled ? "smooth" : "auto" });
    }
  }, [sel, enabled]);

  const onTabKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (!k && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const tabs = tabRefs.current as HTMLButtonElement[];
    let j = tabs.indexOf(document.activeElement as HTMLButtonElement);
    j = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (j + k + tabs.length) % tabs.length;
    /* focus first and without its own scroll-into-view: a plain focus()
       here cancels the smooth scroll and can leave the focused key under
       the masked edge */
    tabs[j].focus({ preventScroll: true });
    setSel(j - 1);
  };
  const goBack = () => {
    const sec = section.current, st = stage.current;
    if (!sec || !st) return;
    const stickyTop = parseFloat(getComputedStyle(st).top) || 0;
    scrollTo({ top: Math.max(0, scrollY + sec.getBoundingClientRect().top - stickyTop), behavior: "auto" });
    onStory(false);
  };

  // ── what the planes show ───────────────────────────────────────────
  const lg = (slug: string): Vars => ({ "--dot": hueOf(slug) });
  const delay = (c: number, r: number) => (c === shown
    ? `${Math.round((1 - r / Math.max(1, COMPS[c].n - 1)) * 320)}ms` : "0ms");
  const state = (c: number) => (!lit ? "" : c === shown ? s.lit
    : COMPS[c].half === lit.half ? s.sink : "");
  const clubAria = CLUB_ARIA + (lit && lit.half === "L" ? litAria(lit) : "");
  const natAria = NAT_ARIA + (lit && lit.half === "N" ? litAria(lit) : "");

  return (
    <section ref={section} id={mode === "match" ? "field-match" : "field"}
      data-testid={`field-${mode}`} data-index="field"
      aria-labelledby={hasHero ? "landing-h1" : "landing-match"}
      className={`${s.fieldSec} ${scroll ? s.sceneField : s.stillScene}`}>
      <div ref={paint} className={`${s.stage} ${s.fieldStage} ${mode === "match" ? s.stageMatch : ""}`}>
        {hasHero && G && (
          <div ref={heroBox} className={s.hero}>
            <div className={s.heroIn}>
              <div ref={hero} className={s.heroText}>
                {/* the product's name, above the fold on every width: on a
                    phone the bar carries the mark alone */}
                <p className={s.eyebrow}>TRIVELA · 8 leagues · 3 national competitions</p>
                <div className={s.heroHead}>
                  <h1 ref={h1} id="landing-h1" className={`${s.display} ${s.h1}`}>
                    Every match,<br />made readable.
                  </h1>
                  <p className={s.heroLine}>
                    Read against the real market before kickoff, recorded in
                    play, reviewed after the whistle.
                  </p>
                </div>
              </div>
              <div ref={heroUi} className={s.heroUi}>
                <div className={s.compBar}>
                  <div ref={tabsEl} className={s.ctabs} role="tablist" aria-label="Competitions"
                    onKeyDown={onTabKeys}>
                    {IDS.map((i) => (
                      <button key={i} type="button" role="tab" id={`ct${i + 1}`}
                        ref={(el) => { tabRefs.current[i + 1] = el; }}
                        aria-controls={`cp${i + 1}`} aria-selected={sel === i}
                        tabIndex={sel === i ? 0 : -1}
                        data-split={i > 0 && COMPS[i].half !== COMPS[i - 1].half ? "" : undefined}
                        style={{ "--hue": i < 0 ? "var(--ink-hi)" : hueOf(COMPS[i].k) } as Vars}
                        onClick={() => setSel(i)}>
                        <i aria-hidden />{i < 0 ? `All ${NC}` : SHORT[COMPS[i].k]}
                      </button>
                    ))}
                  </div>
                  <button ref={ppEl} type="button" className={s.pp} data-state={playing}
                    disabled={playing === "off"}
                    aria-label={playing === "off"
                      ? "Timer off: with reduced motion nothing advances on its own"
                      : playing === "play"
                        ? "Play: show each competition in turn, every 5 seconds"
                        : "Pause the competitions"}>
                    <span className={s.ppIco} aria-hidden />
                    <span className={s.ppTxt}>{playing === "off" ? "Timer off" : playing === "play" ? "Play" : "Pause"}</span>
                  </button>
                </div>
                <div className={s.heroGrid}>
                  <div className={s.planes}>
                    {/* the eyebrow already counts the leagues and competitions; the headings keep what it does not */}
                    <p className={s.planeHead}>Club plane · {FIELD.clubs.length} clubs · {PLANE.L.passes} passes<span className={s.wideOnly}> · one scale</span></p>
                    <div ref={slotRef} className={s.clubSlot} aria-hidden style={{ height: G.slotH }}>
                      <Marks marks={G.marks} shown={shown} />
                    </div>
                    <p className={`${s.planeHead} ${s.natHead}`}>National plane · {N_TEAMS} teams · {PLANE.N.passes} passes<span className={s.wideOnly}> · own axis</span></p>
                    <div className={s.nat} role="img" aria-label={natAria}
                      data-sel={lit ? "" : undefined}
                      style={{ height: G.nat.height, "--nm": G.nat.nm.toFixed(3) } as Vars}>
                      <i className={s.nax} style={{ left: G.nat.axis.left, right: G.nat.axis.right, top: G.nat.axis.top }} />
                      {G.nat.ticks.map((t, k) => (
                        <span key={k}>
                          <i className={s.ntm} style={{ transform: `translate(${px(t.x)},${G.nat.axisY - 6}px)` }} />
                          {t.label && <span className={s.ntk} style={{ transform: `translate(${px(t.x)},${G.nat.axisY + 7}px) translateX(-50%)` }}>{t.label}</span>}
                        </span>
                      ))}
                      {G.nat.dots.map((d) => (
                        <i key={`${d.c}-${d.ri}`} className={`${s.nd} ${state(d.c)}`}
                          data-c={d.c} data-r={d.ri} data-n={d.n} data-v={d.v}
                          data-lit={d.c === shown ? "" : undefined}
                          style={{ "--hue": hueOf(COMPS[d.c].k), width: 2 * d.r, height: 2 * d.r,
                            "--x": px(d.x), "--y": px(d.y), "--ly": px(d.ly), "--sy": px(d.sy),
                            "--dl": delay(d.c, d.ri) } as Vars} />
                      ))}
                      <Marks marks={G.nat.marks} shown={shown} />
                    </div>
                    <p className={s.planesCap}>
                      <span>Each dot is one team<span className={s.wideOnly}> · left to right = rating</span> · clubs as of {asOf(FIELD.fetched, true)}</span>
                      <span className={s.chip}>shadow · not advice</span>
                    </p>
                  </div>
                  <div className={s.side} aria-live={live ? "polite" : "off"}>
                    {IDS.map((i) => (
                      <div key={i} className={`${s.cp} ${sel === i ? s.on : ""}`} role="tabpanel"
                        id={`cp${i + 1}`} aria-labelledby={`ct${i + 1}`}
                        style={{ "--hue": i < 0 ? "var(--ink-hi)" : hueOf(COMPS[i].k) } as Vars}
                        inert={sel !== i}>
                        <CompPanel i={i} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {scroll && (
          /* the keyboard's way back: while the story plays the hero is
             inert, so this control (in the story's tab order, shown only
             under a keyboard focus) returns to the eleven competitions */
          <button ref={backEl} type="button" className={s.backHero} inert onClick={goBack}>
            <span aria-hidden>↑</span> Back to the competitions
          </button>
        )}

        {hasStory && (
          <div ref={match} className={s.matchText}
            style={scroll ? { opacity: 0 } : undefined}>
            <p className={s.eyebrow}>La Liga · 20 Sep 2026</p>
            {/* a club's name never breaks inside itself: the line breaks
                before "v" or before the visitors, never in "REAL / MADRID" */}
            <h2 ref={storyH} id={hasHero ? "story-h" : "landing-match"} tabIndex={hasHero ? -1 : undefined}
              className={`${s.display} ${s.h3}`}>
              <span className={s.team}>{FOCUS.home.name}</span>{" "}
              <span className={s.vs}>v</span>{" "}
              <span className={s.team}>{FOCUS.away.name}</span>
            </h2>
            <ol className={s.steps}>
              <li ref={(el) => { steps.current[0] = el; }}>
                Real Madrid rate <b>{GAP.raw}</b> points higher.
              </li>
              <li ref={(el) => { steps.current[1] = el; }}>
                Atlético are at home: <b>+{GAP.venue}</b>.
              </li>
              <li ref={(el) => { steps.current[2] = el; }}>
                Net: <b>+{Math.abs(GAP.net)}</b> to {GAP.net >= 0 ? FOCUS.away.name : FOCUS.home.name}.
                Too close to call, so the board asks the market.
              </li>
            </ol>
          </div>
        )}

        <div ref={planeRef} className={`${s.plane} ${mode === "match" ? s.planeMatch : ""}`}
          role="img" aria-label={clubAria}
          data-hero={G && !story ? "" : undefined} data-sel={lit ? "" : undefined}
          style={G ? { "--mh": G.mh.toFixed(3), "--hm": G.hm.toFixed(3),
            "--fhm": (G.hm / G.mh).toFixed(3) } as Vars : undefined}>
          <div ref={inner} className={s.planeInner}>
            {/* the pitch, drawn — the only picture on the page that is not data */}
            <svg ref={pitch} aria-hidden className={s.pitch} width={size.w} height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`} style={G ? { opacity: 0 } : undefined}>
              <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <rect x={L.X(E0) - 8} y={L.cy - size.h * 0.42} width={L.X(E1) - L.X(E0) + 16}
                  height={size.h * 0.84} vectorEffect="non-scaling-stroke" />
                <line x1={size.w / 2} x2={size.w / 2} y1={L.cy - size.h * 0.42} y2={L.cy + size.h * 0.42}
                  vectorEffect="non-scaling-stroke" />
                <circle cx={size.w / 2} cy={L.cy} r={size.h * 0.16} vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <div ref={dim} className={s.dotsF}>
              {L.dots.map((d, i) => {
                const [c, r] = RANK[d.club] ?? [0, 0];
                const g = G?.dots[i];
                return (
                  <i key={d.club} className={`${s.dot} ${state(c)}`}
                    data-c={c} data-r={r} data-n={SHOWN_NAME[d.club] ?? d.club} data-v={d.elo}
                    data-lit={c === shown ? "" : undefined}
                    style={{ ...lg(d.column), width: L.r * 2, height: L.r * 2,
                      "--x": px(d.x - L.r), "--y": px(d.y - L.r),
                      ...(g ? { "--ly": px(g.ly - L.r), "--sy": px(g.sy - L.r), "--hy": px(g.hy - L.r) } : {}),
                      "--dl": delay(c, r),
                      visibility: d.focus ? "hidden" : undefined } as Vars} />
                );
              })}
            </div>
          </div>

          {/* the overlay: crisp at every zoom, because it is never scaled */}
          <div aria-hidden className={s.overlay}>
            <div ref={(el) => { mk.current.axis = el; }} className={s.axis} />
            {TICKS.map((e, i) => {
              const major = e % 100 === 0, mid = e % 20 === 0;
              return (
                <div key={e} ref={(el) => { ticks.current[i] = el; }}
                  className={s.tick} style={{ opacity: major ? 1 : 0,
                    transform: `translate3d(${L.X(e).toFixed(1)}px, 0, 0)` }}>
                  <i className={major ? s.tickMajor : s.tickMinor} />
                  {(mid || e % 50 === 0) && <span style={{ opacity: major && e % 200 === 0 ? 1 : 0 }}>{fmtElo(e)}</span>}
                </div>
              );
            })}
            {(["home", "away"] as const).map((side) => {
              const d = side === "home" ? L.home : L.away;
              const [c, r] = RANK[d.club] ?? [0, 0];
              const g = G?.dots[L.dots.indexOf(d)];
              return (
                <div key={side}>
                  <div ref={(el) => { mk.current[`${side}Dot`] = el; }}
                    className={s.focusDot}
                    style={{ ...lg(d.column), width: L.r * 2, height: L.r * 2,
                      margin: `${-L.r}px 0 0 ${-L.r}px`,
                      transform: `translate(${d.x}px, ${d.y}px)` } as Vars}>
                    <i className={state(c)} data-c={c} data-r={r}
                      data-n={SHOWN_NAME[d.club] ?? d.club} data-v={d.elo}
                      data-lit={c === shown ? "" : undefined}
                      style={{ "--dl": delay(c, r),
                        ...(g && G ? { "--fly": px((g.ly - d.y) / G.mh), "--fsy": px((g.sy - d.y) / G.mh),
                          "--fhy": px((g.hy - d.y) / G.mh) } : {}) } as Vars} />
                  </div>
                  <div ref={(el) => { mk.current[`${side}Lab`] = el; }}
                    className={`${s.focusLab} ${side === "home" ? s.focusLabHome : s.focusLabAway}`}
                    style={{ opacity: 0 }}>
                    <span className={s.focusName}>
                      <span className={s.nameFull}>{FOCUS[side].name}</span>
                      <span className={s.nameShort}>{FOCUS[side].short}</span>
                    </span>
                    <span className={s.focusElo}>{fmtElo(side === "home" ? GAP.home : GAP.away)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={(el) => { mk.current.bracket = el; }} className={s.bracket} style={{ opacity: 0 }} />
            <div ref={(el) => { mk.current.bracketLab = el; }} className={`${s.segLab} ${s.segUp}`} style={{ opacity: 0 }}>
              +{GAP.raw} rating
            </div>
            <div ref={(el) => { mk.current.venue = el; }} className={s.venueSeg} style={{ opacity: 0 }} />
            <div ref={(el) => { mk.current.ring = el; }} className={s.ring}
              style={{ ...lg("laliga"), opacity: 0 } as Vars} />
            <div ref={(el) => { mk.current.venueLab = el; }} className={`${s.segLab} ${s.segDown}`} style={{ opacity: 0 }}>
              +{GAP.venue} at home
            </div>
            <div ref={(el) => { mk.current.rest = el; }} className={s.restSeg} style={{ opacity: 0 }} />
            <div ref={(el) => { mk.current.restLab = el; }} className={`${s.segLab} ${s.segDown} ${s.restLab}`} style={{ opacity: 0 }}>
              +{GAP.net}
            </div>
          </div>
        </div>

        {hasStory && (
          <p ref={note} className={s.fieldNote}
            style={scroll ? { opacity: 0 } : undefined}>
            {/* the diagram carries the numbers; this says only whose
                numbers they are — and a rating keeps its pass count */}
            <span>
              Ratings as of {asOf(FIELD.fetched)}, at {FIELD.passes} passes{" "}— not
              the pre-match{" "}read.
            </span>
            <span className={s.chip}>shadow · not advice</span>
          </p>
        )}
        <DotTip stage={stage} enabled={hasHero && !story} />
      </div>
    </section>
  );
}

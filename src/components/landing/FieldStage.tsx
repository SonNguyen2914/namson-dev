// THE OPENING, AND THE FIRST SCROLL MOMENT.
//
// Every club of the eight board leagues on ONE rating scale, each a
// small light in its league's own hue (through `hueOf`, the one door a
// slug becomes a colour). Scrolling pins the stage and the camera moves
// in on two clubs of one real, finished fixture — Atlético Madrid v Real
// Madrid, 20 Sep 2026 — until their gap fills the frame, and then splits
// it the way the board's venue line does: the rating gap, the home term,
// and what is left.
//
// MOTION BUDGET. The plane is ONE transformed layer (translate + scale);
// the 154 lights never move individually. The overlay — ticks, the two
// club markers, the brackets — is a few dozen absolutely-placed boxes
// moved by `transform` only. All of it is written straight onto refs from
// the scroll callback; React renders this component once per resize.
//
// THREE RENDERINGS, ONE DRAWING: `scroll` is the pinned scene; `hero` and
// `match` are its two ends as still figures, which is what a reader who
// asked for reduced motion gets — the same content, nothing withheld.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { hueOf } from "../../lib/leagueHue";
import { FIELD, FOCUS, GAP } from "../../lib/landingData";
import {
  easeInOut, easeOut, lerp, span, useScrollScene, useSize,
} from "../../lib/useScrollScene";
import s from "./landing.module.css";

const E0 = 1300, E1 = 2100;
const TICKS = Array.from({ length: (E1 - E0) / 10 + 1 }, (_, i) => E0 + i * 10);
const fmtElo = (v: number) => Math.round(v).toLocaleString("en-US");
/** "2026-10-02" → "2 Oct": the day the baked field was read */
const asOf = (iso: string) => new Date(`${iso}T12:00:00Z`)
  .toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

type Dot = { x: number; y: number; column: string; club: string; focus: boolean };

/** A beeswarm along the rating axis: every club at its own rating, nudged
 *  up or down only as far as it takes not to cover a neighbour. Pure and
 *  deterministic, so the server and the client draw the same field. */
function layout(w: number, h: number) {
  const narrow = w < 640;
  const r = narrow ? 2.9 : w < 1024 ? 3.6 : 4.4;
  const padX = Math.max(18, w * 0.05);
  const X = (e: number) => padX + ((e - E0) / (E1 - E0)) * (w - 2 * padX);
  const D = 2 * r + (narrow ? 1.4 : 2.4);
  const cy = h / 2;
  const placed: { x: number; y: number }[] = [];
  const dots: Dot[] = [];
  const clubs = [...FIELD.clubs].sort((a, b) => a.elo - b.elo);
  for (const c of clubs) {
    const x = X(c.elo);
    const blocks: [number, number][] = [];
    for (const p of placed) {
      const dx = Math.abs(p.x - x);
      if (dx < D) {
        const dy = Math.sqrt(D * D - dx * dx);
        blocks.push([p.y - dy, p.y + dy]);
      }
    }
    const cands = [0, ...blocks.flat()].sort((a, b) => Math.abs(a) - Math.abs(b));
    const y = cands.find((v) => blocks.every(([lo, hi]) => v <= lo + 1e-6 || v >= hi - 1e-6)) ?? 0;
    placed.push({ x, y });
    dots.push({ x, y: cy + y, column: c.column, club: c.club,
      focus: c.club === FOCUS.home.key || c.club === FOCUS.away.key });
  }
  const home = dots.find((d) => d.club === FOCUS.home.key)!;
  const away = dots.find((d) => d.club === FOCUS.away.key)!;
  const fx = (home.x + away.x) / 2, fy = (home.y + away.y) / 2;
  const S = ((narrow ? 0.5 : 0.42) * w) / (away.x - home.x);
  const perElo = (w - 2 * padX) / (E1 - E0);
  return { r, X, dots, home, away, fx, fy, S, cy, narrow, perElo };
}

type Mode = "scroll" | "hero" | "match";

export default function FieldStage({ mode, enabled }: {
  mode: Mode; enabled: boolean }) {
  const section = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const [planeRef, size] = useSize<HTMLDivElement>({ w: 1200, h: 360 });
  const L = useMemo(() => layout(size.w, size.h), [size.w, size.h]);

  const hero = useRef<HTMLDivElement | null>(null);
  const match = useRef<HTMLDivElement | null>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const inner = useRef<HTMLDivElement | null>(null);
  const dim = useRef<HTMLDivElement | null>(null);
  const legend = useRef<HTMLDivElement | null>(null);
  const cue = useRef<HTMLDivElement | null>(null);
  const ticks = useRef<(HTMLDivElement | null)[]>([]);
  const mk = useRef<Record<string, HTMLDivElement | null>>({});
  const note = useRef<HTMLParagraphElement | null>(null);
  const pitch = useRef<SVGSVGElement | null>(null);

  /* THE TWO CLUB LABELS STAY INSIDE THE GUTTER (2026-10-03). At 390px
     "REAL MADRID" ran to 2px from the screen's edge. Their widths are
     measured (they change when Archivo arrives), and the scene clamps
     each label's box inside the page gutter — the dot stays where the
     rating puts it; only its caption slides in. */
  const [labW, setLabW] = useState({ home: 0, away: 0 });
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

  /* EVERYTHING THE SCENE DRAWS, AS A FUNCTION OF p. The ranges are the
     ones in trivela-ops/landing/ARCHITECTURE.md §1+2. */
  const draw = useCallback((p: number) => {
    const zoom = easeInOut(span(p, 0.10, 0.58));
    const sc = 1 + (L.S - 1) * zoom;
    const tx = L.fx * (1 - sc) + (size.w / 2 - L.fx) * zoom;
    // on a wide screen the match line settles a little above the
    // plane's centre, closer to the words that explain it
    const lineY = L.cy - (L.narrow ? 0 : Math.min(80, size.h * 0.2)) * zoom;
    const ty = L.fy * (1 - sc) + (lineY - L.fy) * zoom;
    const X = (x: number) => x * sc + tx;
    const Y = (y: number) => y * sc + ty;

    const set = (el: HTMLElement | null | undefined, t: string, o?: number) => {
      if (!el) return;
      el.style.transform = t;
      if (o != null) el.style.opacity = String(o);
    };
    const heroOut = easeOut(span(p, 0.06, 0.28));
    set(hero.current, `translate3d(0, ${-48 * heroOut}px, 0)`, 1 - heroOut);
    set(cue.current, "none", 1 - span(p, 0.02, 0.1));
    set(inner.current, `translate3d(${tx}px, ${ty}px, 0) scale(${sc})`);
    if (dim.current) dim.current.style.opacity = String(1 - 0.9 * easeOut(span(p, 0.12, 0.45)));
    if (pitch.current) pitch.current.style.opacity = String(1 - span(p, 0.08, 0.26));
    if (legend.current) legend.current.style.opacity = String(1 - span(p, 0.12, 0.3));
    const mIn = easeOut(span(p, 0.28, 0.44));
    set(match.current, `translate3d(0, ${24 * (1 - mIn)}px, 0)`, mIn);

    // the step lines light in turn: faint until reached, full from then
    const stepT = [span(p, 0.58, 0.66), span(p, 0.72, 0.80), span(p, 0.84, 0.92)];
    steps.current.forEach((el, i) => {
      if (el) el.style.opacity = String(lerp(0.26, 1, stepT[i]));
    });

    // the axis: labelled at the finest step that leaves room to read
    // it (≥ 48px apart at this zoom); minor ticks only once they part
    const px = L.perElo * sc;
    const step = [20, 50, 100, 200, 400].find((v) => v * px >= 48) ?? 400;
    ticks.current.forEach((el, i) => {
      if (!el) return;
      const e = TICKS[i];
      const named = e % step === 0;
      const show = named || e % 100 === 0 ? 1 : 10 * px >= 7 ? 0.6 * zoom : 0;
      set(el, `translate3d(${X(L.X(e))}px, 0, 0)`, show);
      const lab = el.lastElementChild as HTMLElement | null;
      if (lab && lab.tagName === "SPAN") lab.style.opacity = named ? "1" : "0";
    });

    // the two clubs leave the swarm for one line
    const rise = easeInOut(span(p, 0.46, 0.60));
    const lab = easeOut(span(p, 0.48, 0.60));
    const grow = 1 + 0.9 * zoom;
    const hx = X(L.home.x), ax = X(L.away.x);
    const hy = lerp(Y(L.home.y), lineY, rise), ay = lerp(Y(L.away.y), lineY, rise);
    set(mk.current.homeDot, `translate3d(${hx}px, ${hy}px, 0) scale(${grow})`);
    set(mk.current.awayDot, `translate3d(${ax}px, ${ay}px, 0) scale(${grow})`);
    // the page gutter (landing.module.css .root), at the plane's width
    const gut = size.w < 640 ? 16 : size.w < 1024 ? 32 : 56;
    const hlx = Math.max(hx, gut + labW.home);          // right-aligned to hx
    const alx = Math.min(ax, size.w - gut - labW.away); // left-aligned at ax
    set(mk.current.homeLab, `translate3d(${hlx}px, ${hy}px, 0)`, lab);
    set(mk.current.awayLab, `translate3d(${alx}px, ${ay}px, 0)`, lab);

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
    if (note.current) note.current.style.opacity = String(span(p, 0.6, 0.7));
  }, [L, size.w, size.h, labW]);

  const scroll = mode === "scroll";
  useScrollScene(section, draw, { mode: "pinned", stage, enabled: scroll && enabled });
  // the still figures, and the first paint of the moving one, are drawn
  // by the same function at a fixed p — after layout, once per size.
  const fixedP = mode === "match" ? 1 : 0;
  const drawn = useRef("");
  const key = `${mode}:${size.w}x${size.h}:${enabled}:${labW.home}/${labW.away}`;
  const paint = useCallback((el: HTMLDivElement | null) => {
    stage.current = el;
    if (el && drawn.current !== key && !(scroll && enabled)) {
      drawn.current = key;
      requestAnimationFrame(() => draw(fixedP));
    }
  }, [key, draw, fixedP, scroll, enabled]);

  const showHero = mode !== "match", showMatch = mode !== "hero";
  const lg = (slug: string): CSSProperties => ({
    ["--dot" as string]: hueOf(slug) });

  return (
    <section ref={section} data-testid={`field-${mode}`}
      aria-labelledby={showHero ? "landing-h1" : "landing-match"}
      className={scroll ? s.sceneField : s.stillScene}>
      <div ref={paint} className={`${s.stage} ${mode === "match" ? s.stageMatch : ""}`}>
        {showHero && (
          <div ref={hero} className={s.heroText}>
            {/* the product's name, above the fold on every width: on a
                phone the bar carries the mark alone */}
            <p className={s.eyebrow}>TRIVELA · {FIELD.columns.length} leagues · one scale</p>
            <h1 id="landing-h1" className={`${s.display} ${s.h1}`}>
              Every match,<br />made readable.
            </h1>
            <p className={s.heroLine}>
              Each one read against the real market — before kickoff, in
              play, after the whistle.
            </p>
          </div>
        )}

        {showMatch && (
          <div ref={match} className={s.matchText}
            style={mode === "scroll" ? { opacity: 0 } : undefined}>
            <p className={s.eyebrow}>La Liga · 20 Sep 2026</p>
            {/* a club's name never breaks inside itself: the line breaks
                before "v" or before the visitors, never in "REAL / MADRID" */}
            <h2 id="landing-match" className={`${s.display} ${s.h3}`}>
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
          role="img"
          aria-label={`${FIELD.clubs.length} clubs from eight leagues on one rating scale, from ${fmtElo(FIELD.clubs[FIELD.clubs.length - 1].elo)} to ${fmtElo(FIELD.clubs[0].elo)}.`}>
          <div ref={inner} className={s.planeInner}>
            {/* the pitch, drawn — the only picture on the page that is not data */}
            <svg ref={pitch} aria-hidden className={s.pitch} width={size.w} height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}>
              <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <rect x={L.X(E0) - 8} y={L.cy - size.h * 0.42} width={L.X(E1) - L.X(E0) + 16}
                  height={size.h * 0.84} vectorEffect="non-scaling-stroke" />
                <line x1={size.w / 2} x2={size.w / 2} y1={L.cy - size.h * 0.42} y2={L.cy + size.h * 0.42}
                  vectorEffect="non-scaling-stroke" />
                <circle cx={size.w / 2} cy={L.cy} r={size.h * 0.16} vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <div ref={dim} className={s.dots}>
              {L.dots.map((d) => (
                <i key={d.club} className={s.dot} data-column={d.column}
                  style={{ ...lg(d.column), width: L.r * 2, height: L.r * 2,
                    transform: `translate(${d.x - L.r}px, ${d.y - L.r}px)`,
                    visibility: d.focus ? "hidden" : undefined }} />
              ))}
            </div>
          </div>

          {/* the overlay: crisp at every zoom, because it is never scaled */}
          <div aria-hidden className={s.overlay}>
            <div className={s.axis} />
            {TICKS.map((e, i) => {
              const major = e % 100 === 0, mid = e % 20 === 0;
              return (
                <div key={e} ref={(el) => { ticks.current[i] = el; }}
                  className={s.tick} style={{ opacity: major ? 1 : 0,
                    transform: `translate3d(${L.X(e)}px, 0, 0)` }}>
                  <i className={major ? s.tickMajor : s.tickMinor} />
                  {(mid || e % 50 === 0) && <span style={{ opacity: major && e % 200 === 0 ? 1 : 0 }}>{fmtElo(e)}</span>}
                </div>
              );
            })}
            {(["home", "away"] as const).map((side) => {
              const d = side === "home" ? L.home : L.away;
              return (
                <div key={side}>
                  <div ref={(el) => { mk.current[`${side}Dot`] = el; }}
                    className={s.focusDot}
                    style={{ ...lg(d.column), width: L.r * 2, height: L.r * 2,
                      marginLeft: -L.r, marginTop: -L.r,
                      transform: `translate(${d.x}px, ${d.y}px)` }} />
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
            <div ref={(el) => { mk.current.bracketLab = el; }} className={`${s.segLab} ${s.segLabUp}`} style={{ opacity: 0 }}>
              +{GAP.raw} rating
            </div>
            <div ref={(el) => { mk.current.venue = el; }} className={s.venueSeg} style={{ opacity: 0 }} />
            <div ref={(el) => { mk.current.ring = el; }} className={s.ring}
              style={{ ...lg("laliga"), opacity: 0 }} />
            <div ref={(el) => { mk.current.venueLab = el; }} className={`${s.segLab} ${s.segLabDown}`} style={{ opacity: 0 }}>
              +{GAP.venue} at home
            </div>
            <div ref={(el) => { mk.current.rest = el; }} className={s.restSeg} style={{ opacity: 0 }} />
            <div ref={(el) => { mk.current.restLab = el; }} className={`${s.segLab} ${s.segLabDown} ${s.restLab}`} style={{ opacity: 0 }}>
              +{GAP.net}
            </div>
          </div>
        </div>

        {showHero && (
          <div ref={legend} className={s.legend}>
            <span className={s.legendHead}>
              {FIELD.clubs.length} clubs · 8 leagues
            </span>
            <span className={s.legendKeys}>
              {FIELD.columns.map((c) => (
                <span key={c.key} className={s.legendKey} style={lg(c.key)}>
                  <i aria-hidden />{c.display}
                </span>
              ))}
            </span>
          </div>
        )}
        {mode === "scroll" && (
          <div ref={cue} aria-hidden className={s.cue}><i />scroll</div>
        )}
        {showMatch && (
          <p ref={note} className={s.fieldNote}
            style={mode === "scroll" ? { opacity: 0 } : undefined}>
            {/* the diagram carries the numbers; this says only whose
                numbers they are — and a rating keeps its pass count */}
            <span>
              Ratings as of {asOf(FIELD.fetched)}, at {FIELD.passes} passes — not
              the pre-match read.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

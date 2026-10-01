// MODEL vs MARKET, MINUTE BY MINUTE — the match hub's round-5 section
// (approved by Son 2026-10-01, "looks good, passed"; the draft is
// docs/hub-r5/r5-board.html on the backend's prep/hub-r5-design branch).
//
// ONE chart holds all three outcomes: the model solid and the market
// dashed, each in its outcome's colour, on ONE printed y-axis chosen once
// per match and never refitted while the reader scrubs. A single cursor
// reads every line at one minute; the three price rows under the chart
// are its readout, and the gap printed at each line end is the SAME
// number as that outcome's row, because both are derived here from the
// same two rounded numbers (AGENTS.md §3: derive what you display from
// the numbers beside it). The backend serves no gap for that reason.
//
// DECISION SAFETY. Model output is observational: the section carries
// "shadow · not advice" and "a read, not a signal", and nothing here
// calls a gap anything but a gap. A minute with no reading says so and
// draws nothing — missing is never zero.
//
// THE DATA is GET /api/minutes/{key}/{event_id}, read-only on the
// backend (stored rows only). When it is absent or refused the section
// renders a NAMED state, never a blank and never a crash: the whole
// section sits in its own ErrorBoundary.
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { failureOf, NEVER_ANSWERED } from "../lib/httpFailure";
import { usePoll } from "../lib/usePoll";

export type Tri = { home: number; draw: number; away: number };
type O = keyof Tri;
const OUT: readonly O[] = ["home", "draw", "away"];

export type MinuteRow = {
  m: number; at?: string | null; tape: boolean;
  score?: { home: number; away: number } | null;
  model?: Tri | null; model_from?: number | null; model_refused?: string;
  model_source?: string; market?: Tri | null; market_at?: string | null;
};
export type SeriesEvent = { m: number; type: "goal" | "red" | string;
  team?: "home" | "away" | string; score?: { home: number; away: number } };
export type Series = {
  available: true; competition?: string; event_id?: string;
  kickoff_utc?: string | null; state?: string | null;
  label?: string; note?: string;
  fee_floor?: Partial<Tri>;
  lock?: { t: number; at?: string; model: Tri } | null;
  pre?: { runs?: { t: number; at?: string; model: Tri; lock?: boolean;
                   run_type?: string }[];
          market?: { t: number; at?: string; market: Tri }[] };
  minutes?: MinuteRow[]; events?: SeriesEvent[];
  latest?: { captured_at?: string; minute?: number | null;
             age_seconds?: number } | null;
  generated_at?: string;
};
export type Refused = { available: false; code?: string; reason?: string };

type SideIn = { abbrev?: string; color?: string; alt_color?: string };
export type MvmMatch = { state?: string; minute?: string; date?: string;
  home: SideIn; away: SideIn };

const MINUS = "−";
const PRIME = "′";
/** a tape older than this, while the match is live, is HELD, not current */
const HELD_AFTER_S = 120;

// ---- numbers: one rounding, one gap, one sign ----------------------
export const r1 = (v: number) => {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? 0 : r;
};
const f1 = (v: number) => r1(v).toFixed(1);
export const signed = (v: number) => {
  const r = r1(v);
  return (r > 0 ? "+" : r < 0 ? MINUS : "") + Math.abs(r).toFixed(1);
};
/** THE gap. Rows and line ends both call this, on the same two numbers. */
export function gapOf(model?: number | null, market?: number | null) {
  if (model == null || market == null) return null;
  return r1(r1(model) - r1(market));
}
const signOf = (g: number | null) =>
  g == null ? "none" : g > 0 ? "pos" : g < 0 ? "neg" : "zero";
const gapInk = (g: number | null) =>
  g == null || g === 0 ? "var(--ink-mid)" : g > 0 ? "var(--up)" : "var(--neg)";

// ---- colour: club hues that survive the dark canvas -----------------
function lum(hex: string) {
  const n = parseInt(hex, 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255)
    + 0.0722 * (n & 255)) / 255;
}
function hue(s: SideIn, fallback: string) {
  for (const c of [s.color, s.alt_color]) {
    const h = (c ?? "").replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(h) && lum(h) > 0.12) return `#${h}`;
  }
  return fallback;
}
const DRAW_LINE = "#8b8b95";

// ---- the time model --------------------------------------------------
type Mode = "live" | "held" | "pre" | "post";
type Read = { model: Tri | null; market: Tri | null; modelFrom: number | null;
  stale: boolean; refused?: string; score?: { home: number; away: number } | null;
  at?: string | null; marketAt?: string | null };

function stepAt<T extends { t: number }>(pts: T[], t: number): T | null {
  let hit: T | null = null;
  for (const p of pts) if (p.t <= t + 1e-9) hit = p;
  return hit;
}

function wall(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Everything the chart and rows read, built once per payload. */
function buildSeries(series: Series, match: MvmMatch, nowMs: number) {
  const minutes = (series.minutes ?? []).filter((r) => Number.isFinite(r?.m));
  const state = match.state ?? series.state ?? "";
  const kick = series.kickoff_utc ? new Date(series.kickoff_utc).getTime() : NaN;
  const prePts = {
    runs: (series.pre?.runs ?? []).filter((r) => r?.model)
      .map((r) => ({ ...r, t: Math.max(-60, r.t) })),
    market: (series.pre?.market ?? []).filter((r) => r?.market)
      .map((r) => ({ ...r, t: Math.max(-60, r.t) })),
  };
  const preMode = minutes.length === 0
    && !(state === "in" || state === "post")
    && (prePts.runs.length > 0 || prePts.market.length > 0);
  let mode: Mode;
  if (preMode) mode = "pre";
  else if (state === "post" || series.state === "post") mode = "post";
  else {
    const at = series.latest?.captured_at
      ? new Date(series.latest.captured_at).getTime() : NaN;
    const age = Number.isFinite(at) ? (nowMs - at) / 1000
      : (series.latest?.age_seconds ?? 0);
    mode = age > HELD_AFTER_S ? "held" : "live";
  }

  // the cursor's steps
  let steps: number[];
  let d0: number, d1: number;
  if (mode === "pre") {
    const nowT = Number.isFinite(kick) ? Math.min(0, Math.floor((nowMs - kick) / 60000)) : 0;
    const last = Math.max(...prePts.runs.map((r) => r.t), ...prePts.market.map((r) => r.t), -60);
    const end = Math.max(Math.min(0, Math.max(nowT, Math.ceil(last))), -50);
    d0 = -60; d1 = end;
    steps = [];
    for (let t = d0; t <= d1; t++) steps.push(t);
  } else {
    const last = minutes.length ? minutes[minutes.length - 1].m : 0;
    const cur = parseInt(String(match.minute ?? "").replace(/[^0-9].*$/, ""), 10);
    const nowM = mode === "held" && Number.isFinite(cur) ? Math.max(cur, last) : last;
    // the axis ends at NOW (or full time), so the line ends sit at the
    // right edge with their labels beside them
    d0 = 0; d1 = Math.max(mode === "post" ? 90 : 10, nowM);
    steps = minutes.map((r) => r.m);
  }
  const readAt = (t: number): Read => {
    if (mode === "pre") {
      const run = stepAt(prePts.runs, t);
      const mk = stepAt(prePts.market, t);
      return { model: run?.model ?? null, market: mk?.market ?? null,
        modelFrom: run ? run.t : null, stale: false,
        at: null, marketAt: mk?.at ?? null };
    }
    const row = minutes.find((r) => r.m === t);
    if (!row) return { model: null, market: null, modelFrom: null, stale: false };
    return { model: row.model ?? null, market: row.market ?? null,
      modelFrom: row.model_from ?? null,
      stale: !!row.model && row.model_from != null && row.model_from !== row.m,
      refused: row.model ? undefined : row.model_refused,
      score: row.score ?? null, at: row.at ?? null, marketAt: row.market_at ?? null };
  };
  // ONE axis per match, from every number it will ever draw
  const vals: number[] = [];
  const floors = series.fee_floor ?? {};
  if (mode === "pre") {
    for (const r of prePts.runs) OUT.forEach((o) => vals.push(r.model[o]));
    for (const r of prePts.market) OUT.forEach((o) => {
      vals.push(r.market[o]);
      if (floors[o] != null) vals.push(r.market[o] + (floors[o] as number));
    });
  } else {
    for (const r of minutes) OUT.forEach((o) => {
      if (r.model) vals.push(r.model[o]);
      if (r.market) vals.push(r.market[o]);
    });
  }
  const lo = vals.length ? Math.max(0, Math.floor((Math.min(...vals) - 2) / 10) * 10) : 0;
  let hi = vals.length ? Math.min(100, Math.ceil((Math.max(...vals) + 2) / 10) * 10) : 100;
  if (hi - lo < 20) hi = Math.min(100, lo + 20);
  const events = (series.events ?? []).filter((e) => Number.isFinite(e?.m));
  return { mode, steps, d0, d1, lo, hi, readAt, minutes, prePts, events,
    floors, lastStep: steps[steps.length - 1] };
}
type Built = ReturnType<typeof buildSeries>;

const tLabel = (mode: Mode, t: number) =>
  mode === "pre" ? (t >= 0 ? "KO" : `T${MINUS}${-t}`) : `${t}${PRIME}`;

// ---- the chart ---------------------------------------------------------
function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(343);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    set();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

function Chart({ b, cursor, setCursor, cols, names }: {
  b: Built; cursor: number; setCursor: (t: number) => void;
  cols: Record<O, string>; names: Record<O, string>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const W = useWidth(box);
  const H = W >= 600 ? 364 : 300;
  const x0 = 30, x1 = W - 96, yT = 30, yB = H - 22;
  const X = (t: number) => x0 + ((t - b.d0) / Math.max(1, b.d1 - b.d0)) * (x1 - x0);
  const Y = (v: number) => yT + ((b.hi - v) / (b.hi - b.lo)) * (yB - yT);
  const pre = b.mode === "pre";

  // series as point lists; a null breaks the line
  const runs = (o: O, which: "model" | "market") => {
    const segs: [number, number][][] = [];
    let cur: [number, number][] = [];
    if (pre) {
      const pts = which === "model"
        ? b.prePts.runs.map((r) => ({ t: r.t, v: r.model[o] }))
        : b.prePts.market.map((r) => ({ t: r.t, v: r.market[o] }));
      pts.forEach((p, i) => {
        if (i) cur.push([p.t, cur[cur.length - 1][1]]);
        cur.push([p.t, p.v]);
      });
      if (cur.length) cur.push([b.lastStep, cur[cur.length - 1][1]]);
      segs.push(cur);
      return segs.filter((s) => s.length > 1);
    }
    for (const r of b.minutes) {
      const tri = which === "model" ? r.model : r.market;
      if (!tri) { if (cur.length) segs.push(cur); cur = []; continue; }
      cur.push([r.m, tri[o]]);
    }
    if (cur.length) segs.push(cur);
    return segs;
  };
  const path = (pts: [number, number][]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join("");

  const at = b.readAt(cursor);
  const end = b.readAt(b.lastStep);
  // line-end labels: the gap AT THE CURSOR, beside each name; positions
  // follow the lines' ends and never move while scrubbing
  const labs = OUT.map((o) => {
    const ym = end.model ? Y(end.model[o]) : null;
    const yk = end.market ? Y(end.market[o]) : null;
    const y = ym != null && yk != null ? (ym + yk) / 2 : ym ?? yk ?? Y((b.lo + b.hi) / 2);
    return { o, y, g: gapOf(at.model?.[o], at.market?.[o]) };
  }).sort((p, q) => p.y - q.y);
  for (let i = 1; i < labs.length; i++)
    if (labs[i].y - labs[i - 1].y < 15) labs[i].y = labs[i - 1].y + 15;
  for (let i = labs.length - 1; i >= 0; i--) {
    const max = yB - 2 - (labs.length - 1 - i) * 15;
    if (labs[i].y > max) labs[i].y = max;
  }

  const grid: number[] = [];
  for (let v = b.lo; v <= b.hi + 1e-9; v += 10) grid.push(v);
  const xTicks = pre
    ? [-60, -45, -30, -15, 0].filter((t) => t >= b.d0 && t <= b.d1)
    : [...[0, 15, 30, 45, 60, 75, 90].filter((t) => t <= b.d1 - 6), b.d1];

  const fromPointer = (e: PointerEvent<SVGRectElement>) => {
    const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const t = b.d0 + ((e.clientX - r.left) / Math.max(1, r.width)) * (b.d1 - b.d0);
    let best = b.steps[0], bd = Infinity;
    for (const s of b.steps) { const d = Math.abs(s - t); if (d < bd) { bd = d; best = s; } }
    if (best != null) setCursor(best);
  };
  const lastDataX = X(b.lastStep);

  return (
    <div ref={box} className="relative w-full">
      <svg data-testid="mvm-chart-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        className="block select-none" role="img"
        aria-label={`model and market, ${names.home}, draw and ${names.away}, on one axis ${b.lo} to ${b.hi} percent`}>
        <defs>
          <pattern id="mvm-hatch" width="6" height="6" patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-faint)" strokeWidth="1.2" />
          </pattern>
        </defs>
        {/* gridlines, every 10, labelled */}
        {grid.map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--line, #24242c)"
              strokeWidth="1" opacity="0.6" />
            <text x={x0 - 4} y={Y(v) + 3.5} textAnchor="end" fontSize="11"
              fill="var(--ink-low)">{v === b.hi ? `${v}%` : v}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={X(t)} y={H - 6} textAnchor="middle" fontSize="11"
            fill={t === b.d1 ? "var(--ink-hi)" : "var(--ink-low)"}
            fontWeight={t === b.d1 ? 600 : 400}>
            {pre ? tLabel("pre", t) : t === 0 ? "KO" : t === 45 && t !== b.d1 ? "HT" : `${t}${PRIME}`}</text>
        ))}
        {/* held: no data past the last reading */}
        {b.mode === "held" && b.d1 > b.lastStep && (
          <rect data-testid="mvm-hatch" x={lastDataX} y={yT} width={Math.max(0, X(b.d1) - lastDataX)}
            height={yB - yT} fill="url(#mvm-hatch)" opacity="0.5" />
        )}
        {/* event rail */}
        <line x1={x0} x2={x1} y1={14} y2={14} stroke="var(--ink-faint)" strokeWidth="1" opacity="0.6" />
        {!pre && b.events.filter((e) => e.m <= b.d1).map((e, i) => (
          e.type === "goal"
            ? <circle key={i} cx={X(e.m)} cy={14} r="3.5" fill="var(--ink-hi)"
                data-testid="mvm-ev-goal" />
            : <rect key={i} x={X(e.m) - 2.5} y={9} width="5" height="9" fill="var(--neg)"
                data-testid="mvm-ev-red" />
        ))}
        {!pre && b.events.filter((e) => e.type === "goal").map((e, i) => (
          <line key={`g${i}`} x1={X(e.m)} x2={X(e.m)} y1={yT} y2={yB}
            stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="2 3" />
        ))}
        {pre && b.prePts.runs.map((r, i) => r.lock ? (
          <g key={i} data-testid="mvm-lock" transform={`translate(${X(r.t) - 5},6)`}>
            <rect x="1" y="5" width="8" height="7" rx="1" fill="var(--ink-hi)" />
            <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="var(--ink-hi)" strokeWidth="1.3" fill="none" />
          </g>
        ) : (
          <rect key={i} x={X(r.t) - 3} y={11} width="6" height="6"
            transform={`rotate(45 ${X(r.t)} 14)`} fill="var(--ink-mid)" />
        ))}
        {/* the fee floor band, before kickoff, where the model sits above the market */}
        {pre && OUT.map((o) => {
          const fl = b.floors[o];
          if (fl == null) return null;
          const pts = b.prePts.market;
          return pts.map((p, i) => {
            const runAt = stepAt(b.prePts.runs, p.t);
            if (!runAt || runAt.model[o] <= p.market[o]) return null;
            const tEnd = i + 1 < pts.length ? pts[i + 1].t : b.lastStep;
            return (
              <rect key={`${o}${i}`} data-testid={`mvm-floor-${o}`} x={X(p.t)}
                y={Y(p.market[o] + fl)} width={Math.max(0, X(tEnd) - X(p.t))}
                height={Math.max(0, Y(p.market[o]) - Y(p.market[o] + fl))}
                fill={cols[o]} opacity="0.16" />
            );
          });
        })}
        {/* the gap, as a faint fill in the outcome's hue: identity only */}
        {OUT.map((o) => {
          // sampled at every cursor step, so model and market are read at
          // the SAME instant on both edges of the fill
          const both = b.steps.map((t) => ({ t, r: b.readAt(t) }))
            .filter((p) => p.r.model && p.r.market);
          if (both.length < 2) return null;
          const top = path(both.map((p) => [p.t, (p.r.model as Tri)[o]] as [number, number]));
          const back = [...both].reverse().map((p) =>
            `L${X(p.t).toFixed(1)} ${Y((p.r.market as Tri)[o]).toFixed(1)}`).join("");
          return <path key={`f${o}`} d={`${top}${back}Z`} fill={cols[o]} opacity="0.12" />;
        })}
        {/* the six lines */}
        {OUT.map((o) => (
          <g key={o} data-testid={`mvm-lines-${o}`}>
            {runs(o, "market").map((s, i) => (
              <path key={`k${i}`} d={path(s)} fill="none" stroke={cols[o]}
                strokeOpacity="0.7" strokeWidth="1.6" strokeDasharray="4 3" />
            ))}
            {runs(o, "model").map((s, i) => (
              <path key={`m${i}`} d={path(s)} fill="none" stroke={cols[o]} strokeWidth="2.2" />
            ))}
            {end.model && <circle cx={X(b.lastStep)} cy={Y(end.model[o])} r="3.2" fill={cols[o]} />}
            {end.market && <circle cx={X(b.lastStep)} cy={Y(end.market[o])} r="3.2"
              fill="var(--bs-elev)" stroke={cols[o]} strokeWidth="1.5" />}
          </g>
        ))}
        {/* line-end names, each with its gap at the cursor */}
        {labs.map((l) => (
          <text key={l.o} x={x1 + 8} y={l.y + 4} fontSize="12" fontWeight="600"
            fill={cols[l.o]} data-testid={`mvm-end-${l.o}`}>
            {names[l.o]}{" "}
            <tspan data-testid={`mvm-end-gap-${l.o}`} data-sign={signOf(l.g)}
              data-gap={l.g == null ? "" : f1(l.g)} fill={gapInk(l.g)}>
              {l.g == null ? "—" : signed(l.g)}
            </tspan>
          </text>
        ))}
        {/* the one cursor */}
        <g data-testid="mvm-cursor" data-t={cursor}>
          <line x1={X(cursor)} x2={X(cursor)} y1={yT - 4} y2={yB} stroke="var(--ink-hi)"
            strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          {OUT.map((o) => {
            const m = at.model?.[o], k = at.market?.[o];
            return (
              <g key={o}>
                {m != null && k != null && (
                  <line x1={X(cursor)} x2={X(cursor)} y1={Y(m)} y2={Y(k)} stroke={cols[o]} strokeWidth="2.5" />
                )}
                {k != null && <circle data-testid={`mvm-dot-market-${o}`} cx={X(cursor)} cy={Y(k)} r="3.6"
                  fill="var(--bs-elev)" stroke={cols[o]} strokeWidth="1.6" />}
                {m != null && <circle data-testid={`mvm-dot-model-${o}`} cx={X(cursor)} cy={Y(m)} r="3.8"
                  fill={cols[o]} stroke={at.stale ? "var(--warn)" : "var(--bs-elev)"}
                  strokeWidth={at.stale ? 2 : 1.2} />}
              </g>
            );
          })}
        </g>
        <rect data-testid="mvm-scrub" x={x0} y={0} width={x1 - x0} height={H}
          fill="transparent" style={{ touchAction: "pan-y", cursor: "ew-resize" }}
          onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => { if (e.buttons || e.pointerType === "mouse") fromPointer(e); }} />
      </svg>
    </div>
  );
}

// ---- the section -------------------------------------------------------
function Shell({ children, testState }: { children: ReactNode; testState: string }) {
  return (
    <section id="model-vs-market" data-testid="mvm" data-state={testState}
      className="mt-6 rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-mid">
          model vs market · 3-way
        </h2>
        <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ink-low">
          shadow · not advice
        </span>
      </div>
      {children}
    </section>
  );
}

function Absent({ why, state }: { why: string; state: string }) {
  return (
    <Shell testState={state}>
      <p data-testid="mvm-absent" className="mt-3 rounded-xl border border-dashed border-line px-4 py-3 text-[13px] leading-relaxed text-ink-mid">
        <span className="text-ink-hi">No minute-by-minute read for this match.</span>{" "}
        {why}
      </p>
    </Shell>
  );
}

function Board({ series, match, readAtMs }: {
  series: Series; match: MvmMatch; readAtMs: number }) {
  const b = useMemo(() => buildSeries(series, match, readAtMs),
    [series, match, readAtMs]);
  const [pinned, setPinned] = useState<number | null>(null);
  const cursor = pinned != null && b.steps.includes(pinned) ? pinned : b.lastStep;
  const atNow = cursor === b.lastStep;
  const names: Record<O, string> = {
    home: match.home.abbrev || "Home", draw: "Draw", away: match.away.abbrev || "Away" };
  const cols: Record<O, string> = {
    home: hue(match.home, "#4f7be8"), draw: DRAW_LINE, away: hue(match.away, "#b65fd6") };
  const idx = b.steps.indexOf(cursor);
  const step = (d: number) => {
    const n = b.steps[Math.min(b.steps.length - 1, Math.max(0, idx + d))];
    setPinned(n === b.lastStep ? null : n);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "Home") { e.preventDefault(); setPinned(b.steps[0]); }
    else if (e.key === "End") { e.preventDefault(); setPinned(null); }
  };
  const rd = b.readAt(cursor);
  const ko = b.readAt(b.steps[0]);
  const lastEv = b.mode === "pre"
    ? [...b.prePts.runs].reverse().find((r) => r.t <= cursor && r.t > b.steps[0])
    : [...b.events].reverse().find((e) => e.m <= cursor && e.m > 0);
  const evT = lastEv ? ("t" in lastEv ? lastEv.t : lastEv.m) : null;
  const evRd = evT != null ? b.readAt(evT) : null;
  const evGlyph = lastEv && "type" in lastEv ? (lastEv.type === "goal" ? "●" : "▮") : "◆";
  const latestAt = series.latest?.captured_at;
  const clock = b.mode === "pre"
    ? (series.kickoff_utc ? wall(new Date(new Date(series.kickoff_utc).getTime() + cursor * 60000).toISOString()) : null)
    : wall(rd.at);
  const live = b.mode === "live";
  const sayGap = (o: O) => gapOf(rd.model?.[o], rd.market?.[o]);

  // the pre-kickoff floor read: which outcome comes closest, and by how much
  const nowRd = b.readAt(b.lastStep);
  const floorRead = b.mode === "pre" ? OUT.map((o) => {
    const g = gapOf(nowRd.model?.[o], nowRd.market?.[o]); const fl = b.floors[o];
    return { o, g, fl, short: g != null && fl != null ? r1(fl - g) : null };
  }) : [];
  const closest = floorRead.filter((f) => f.short != null)
    .sort((p, q) => (p.short as number) - (q.short as number))[0];

  const pill = b.mode === "held"
    ? { text: `held · ${b.lastStep}${PRIME}, not current`, cls: "border-warn/50 text-warn" }
    : b.mode === "post" ? { text: "full time · recorded", cls: "border-line text-ink-low" }
    : b.mode === "pre" ? { text: series.lock ? `model locked T${MINUS}10` : "model not locked yet", cls: "border-line text-ink-low" }
    : { text: "live", cls: "" };

  const score = rd.score ? `${rd.score.home}–${rd.score.away}` : null;
  return (
    <Shell testState={b.mode}>
      <div data-testid="mvm-root" data-mode={b.mode} data-cursor={cursor}
        data-now={atNow ? "yes" : "no"}>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-mid">
          <span className="text-ink-hi">A read, not a signal.</span>{" "}
          {b.mode === "pre"
            ? (closest && closest.short != null
              ? (closest.short <= 0
                ? `${names[closest.o]} sits ${signed(closest.g as number)} against its fee floor of +${f1(closest.fl as number)}.`
                : `No outcome clears its fee floor. Closest: ${names[closest.o]}, gap ${signed(closest.g as number)} against +${f1(closest.fl as number)}, ${f1(closest.short)} short.`)
              : "Model runs and market captures before kickoff, as steps.")
            : "The market already knows the score; the model reads minute and score."}
        </p>

        {/* ===== the time row ===== */}
        <div className="mt-3 flex items-center gap-2">
          <button type="button" data-testid="mvm-prev" aria-label="previous minute"
            disabled={idx <= 0} onClick={() => step(-1)}
            className="h-11 w-11 shrink-0 rounded-xl border border-line text-lg text-ink-hi disabled:opacity-30">‹</button>
          <div className="min-w-[4.5rem] text-center">
            <div data-testid="mvm-minute" className="font-mono text-[26px] leading-none tabular-nums text-ink-hi">
              {tLabel(b.mode, cursor)}
            </div>
            <div className={`mt-1 font-mono text-[12px] tabular-nums ${b.mode === "held" && atNow ? "text-warn" : "text-ink-low"}`}>
              {clock ?? "—"}
            </div>
          </div>
          <button type="button" data-testid="mvm-next" aria-label="next minute"
            disabled={idx >= b.steps.length - 1} onClick={() => step(1)}
            className="h-11 w-11 shrink-0 rounded-xl border border-line text-lg text-ink-hi disabled:opacity-30">›</button>
          <div className="ml-auto flex flex-col items-end gap-1">
            <button type="button" data-testid="mvm-live" onClick={() => setPinned(null)}
              disabled={atNow}
              className={`h-9 rounded-xl border px-3 font-mono text-[12px] uppercase tracking-[0.1em] ${
                atNow ? (live ? "border-live/50 text-live" : b.mode === "held" ? "border-warn/50 text-warn" : "border-line text-ink-mid")
                : "border-line text-ink-hi"}`}>
              {atNow
                ? (live ? "● live" : b.mode === "held" ? `held ${b.lastStep}${PRIME}` : b.mode === "pre" ? "● now" : "latest")
                : (live ? "back to live" : b.mode === "pre" ? "back to now" : "back to latest")}
            </button>
          </div>
        </div>
        {!live && (
          <span data-testid="mvm-pill" className={`mt-2 inline-block whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${pill.cls}`}>
            {pill.text}
          </span>
        )}
        <p data-testid="mvm-fresh" className="mt-1 font-mono text-[12px] text-ink-low">
          {b.mode === "pre"
            ? `market ${wall(rd.marketAt) ?? "—"} · model ${series.lock && cursor >= series.lock.t ? `locked ${wall(series.lock.at) ?? ""}` : "latest run"}`
            : `tape ${wall(latestAt) ?? "—"}${b.mode === "held" ? " · feed late, not current" : ""}`}
        </p>

        <div className="mt-2 flex items-center justify-between font-mono text-[12px] text-ink-low">
          <span>── model &nbsp;- - - market</span>
          <span>one axis <span className="text-ink-mid">{b.lo}–{b.hi}%</span></span>
        </div>

        {/* ===== the one chart ===== */}
        <div data-testid="mvm-chart" role="slider" tabIndex={0}
          aria-label="minute shown in the chart and rows"
          aria-valuemin={b.steps[0]} aria-valuemax={b.lastStep} aria-valuenow={cursor}
          aria-valuetext={`${tLabel(b.mode, cursor)}: ${OUT.map((o) => {
            const g = sayGap(o); return `${names[o]} gap ${g == null ? "none" : signed(g)}`; }).join(", ")}`}
          onKeyDown={onKey} className="mt-1 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-ink-mid">
          <Chart b={b} cursor={cursor} setCursor={(t) => setPinned(t === b.lastStep ? null : t)}
            cols={cols} names={names} />
        </div>

        {/* ===== the price rows: the cursor's readout ===== */}
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-0 font-mono text-[12px] text-ink-low">
          <span />
          <span className="text-right">mkt</span>
          <span className="text-right">model</span>
          <span className="min-w-[6.5rem] text-right">since · mkt model</span>
        </div>
        {OUT.map((o) => {
          const g = sayGap(o);
          const m = rd.model?.[o], k = rd.market?.[o];
          const kd = (base: Read | null) => base && base.market && k != null ? signed(k - base.market[o]) : "—";
          const md = (base: Read | null) => base && base.model && m != null ? signed(m - base.model[o]) : "—";
          const fl = b.floors[o];
          const short = g != null && fl != null ? r1(fl - g) : null;
          return (
            <div key={o} data-testid={`mvm-row-${o}`} data-gap={g == null ? "" : f1(g)}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 border-t border-line py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[13px] uppercase text-ink-hi">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: cols[o] }} />
                  <span className="truncate">{names[o]}</span>
                </div>
                <div className="font-mono text-[13px] text-ink-low">
                  gap <b data-testid={`mvm-row-gap-${o}`} className="text-ink-hi">{g == null ? "—" : signed(g)}</b>
                </div>
              </div>
              <span data-testid={`mvm-mkt-${o}`}
                className={`rounded-lg border px-2 py-1 text-center font-mono text-[18px] tabular-nums ${
                  k == null ? "border-dashed border-line text-ink-faint" : b.mode === "held" && atNow ? "border-line text-ink-mid" : "border-ink-faint text-ink-hi"}`}>
                {k == null ? "—" : f1(k)}
              </span>
              <div className="text-right">
                <span data-testid={`mvm-model-${o}`}
                  className={`font-mono text-[16px] tabular-nums ${m == null || rd.stale || (b.mode === "held" && atNow) ? "text-ink-low" : "text-ink-hi"}`}
                  style={{ borderBottom: `2px ${rd.stale || (b.mode === "held" && atNow) ? "dashed" : "solid"} ${cols[o]}` }}>
                  {m == null ? "—" : f1(m)}
                </span>
                {rd.stale && rd.modelFrom != null && (
                  <div data-testid={`mvm-held-${o}`} className="font-mono text-[11px] text-warn">model held {rd.modelFrom}{PRIME}</div>
                )}
                {!rd.stale && b.mode === "held" && atNow && (
                  <div className="font-mono text-[11px] text-warn">held {b.lastStep}{PRIME}</div>
                )}
                {m == null && rd.refused && (
                  <div className="font-mono text-[11px] text-ink-faint">no model read</div>
                )}
              </div>
              <div className="min-w-[6.5rem] text-right font-mono text-[12px] leading-snug tabular-nums text-ink-low">
                <div>{b.mode === "pre" ? "T−60" : "KO"} <span className="text-ink-mid">{kd(ko)}</span> <span className="text-ink-mid">{md(ko)}</span></div>
                {b.mode === "pre"
                  ? <div data-testid={`mvm-floor-row-${o}`}>floor <span className="text-ink-mid">{fl == null ? "—" : `+${f1(fl)}`}</span>
                      {short != null && <span className="hidden sm:inline"> · {short <= 0 ? "clears" : `${f1(short)} short`}</span>}</div>
                  : <div>{evT != null ? `${evGlyph}${evT}${PRIME}` : "—"} <span className="text-ink-mid">{evT != null ? kd(evRd) : ""}</span> <span className="text-ink-mid">{evT != null ? md(evRd) : ""}</span></div>}
              </div>
            </div>
          );
        })}

        <p data-testid="mvm-note" className="mt-2 border-t border-line pt-2 text-[13px] leading-relaxed text-ink-mid">
          <b className="mr-1 rounded bg-ink-hi px-1.5 py-0.5 font-mono text-[12px] text-bs">
            {tLabel(b.mode, cursor)}{atNow ? (b.mode === "held" ? " held" : " now") : ""}
          </b>
          {score ? `${score}. ` : ""}
          {rd.refused
            ? `No model read at this minute: ${rd.refused}. `
            : rd.stale && rd.modelFrom != null
              ? `Missed tape refresh: the model is held from ${rd.modelFrom}${PRIME}. `
              : ""}
          {b.mode === "held" && atNow
            ? `Last reading before the feed went late${wall(latestAt) ? `, ${wall(latestAt)}` : ""}: not current.`
            : "A read, not a signal."}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-low">
          One axis for all three outcomes, {b.lo}–{b.hi}%, fixed for this match.
          Gap = model {MINUS} market. Beside each name at the line end, the gap
          at the cursor: <span style={{ color: "var(--up)" }}>green</span> when
          the model is above the market (+), <span style={{ color: "var(--neg)" }}>red</span> when
          it is below ({MINUS}).
          {b.mode === "pre" ? " The shaded band is the fee floor stacked on the market." : ""}
          {b.mode === "held" ? " Hatched: no data since the feed went late." : ""}
        </p>
        <details className="mt-2 text-[12px] text-ink-low">
          <summary className="cursor-pointer text-ink-mid">How to read it</summary>
          <p className="mt-1 leading-relaxed">
            Solid lines are the model, dashed lines the market with its
            overround removed; colour says which outcome. Drag across the
            chart, tap it, use ‹ › or the arrow keys: one cursor reads all six
            lines at that minute, and the rows below read the same minute. A
            dimmed model reading is held from the minute it names. Shadow, not
            advice: the gap is a difference between two readings, not a claim
            that either is right.
          </p>
        </details>
      </div>
    </Shell>
  );
}

/** The fetcher: one poller, a named failure, and a named absence. */
function Section({ api, eventId, match }: { api: string; eventId: string; match: MvmMatch }) {
  const key = api.replace(/\/+$/, "").split("/").pop() ?? "";
  const [series, setSeries] = useState<Series | Refused | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [readAtMs, setReadAtMs] = useState(0);
  usePoll(async (signal) => {
    let r: Response;
    try {
      r = await fetch(`/api/minutes/${key}/${eventId}`, { signal });
    } catch {
      if (signal.aborted) return "stop";
      setErr(NEVER_ANSWERED);
      return "failed";
    }
    if (!r.ok) { setErr(await failureOf(r)); return "failed"; }
    const d = await r.json();
    if (signal.aborted) return "stop";
    setSeries(d && typeof d === "object" ? d : null);
    setReadAtMs(Date.now());
    setErr(null);
    if (!d?.available) return "stop";
    return d.state === "post" || match.state === "post" ? "stop" : "ok";
  }, 30000, [key, eventId]);

  if (!series) {
    return err
      ? <Absent state="failed" why={`The read failed: ${err}. This is not an empty record.`} />
      : (
        <Shell testState="loading">
          <p className="mt-3 font-mono text-[12px] text-ink-low">reading the minute-by-minute record…</p>
        </Shell>
      );
  }
  if (!series.available) {
    return <Absent state="refused" why={series.reason ? `${series.reason[0].toUpperCase()}${series.reason.slice(1)}.` : "Nothing was recorded for it."} />;
  }
  const hasPre = (series.pre?.runs?.length ?? 0) > 0 || (series.pre?.market?.length ?? 0) > 0;
  const hasMin = (series.minutes?.length ?? 0) > 0;
  const started = match.state === "in" || match.state === "post";
  if (!hasMin && (started || !hasPre)) {
    return <Absent state="empty" why={started
      ? "The state tape holds no reading for it, so there is nothing to draw — not a flat line."
      : "Nothing was recorded for it yet."} />;
  }
  return <Board series={series} match={match} readAtMs={readAtMs} />;
}

export default function ModelVsMarket(props: { api: string; eventId: string; match: MvmMatch }) {
  return (
    <ErrorBoundary resetKey={props.eventId} fallback={() => (
      <Absent state="crashed" why="This section could not be drawn from the record received; the rest of the page does not depend on it." />
    )}>
      <Section {...props} />
    </ErrorBoundary>
  );
}

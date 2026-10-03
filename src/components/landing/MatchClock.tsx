// THE SECOND SCROLL MOMENT: NINETY MINUTES, READ.
//
// The pinned stage turns scroll into the match clock. Its chart is the
// match hub's round-5 design (components/ModelVsMarket.tsx, approved
// 2026-10-01) re-drawn for a page that has to explain itself: all three
// outcomes on one 0–100% axis, the model SOLID and the market DASHED in
// each outcome's colour, the gap between them a faint fill in the same
// hue. As the reader scrolls, the lines draw and one line of type says
// what changed at that minute.
//
// THE DATA IS REAL: the stored series for Atlético Madrid v Real Madrid
// (La Liga, 20 Sep 2026), baked from GET /api/minutes — the in-play
// model's triple and the de-vigged three-way book, minute by minute.
//
// WHERE THE MODEL STOPS, THE CHART SAYS SO (Son, 2026-10-02: "the line
// got cut"). After the 54′ red card the 11-v-11 engine refuses, so the
// model has no reading to 90′. Its three lines END with a cap at their
// last value (53′), and the rest of the plot is a hatched, labelled band
// — "model stands down" — that the market keeps drawing through. Nothing
// is extended or interpolated past the stop. A ONE-OR-TWO-minute hole
// that the series closes again (half-time for the model, 1′ for the
// market) is bridged by a faint dotted connector, so a pause never reads
// as a break; the stand-down is never bridged, because nothing resumes.
//
// MOTION (Son, same day: "laggy when I scroll at the cut part"). Two
// causes, both fixed here:
//   - the scroll→minute warp lingered ~7× on 51–60′ while the cursor
//     SNAPPED to whole minutes, so the chart sat frozen while the reader
//     scrolled — read as lag. The cursor now moves continuously and the
//     warp is gentle (≤3.5×);
//   - each minute re-rendered the whole chart and animated a clip-path
//     (a repaint per frame). The chart is now two memoised layers built
//     once per size; the reveal is a COMPOSITED window (an overflow-clip
//     wrapper and its content translated in opposite directions), and
//     the cursor and the six dots are transforms written from the scroll
//     frame. React re-renders only the text, and only when the whole
//     minute changes.
// The numbers in the rows are always one whole tape minute's reading;
// the dots ride the drawn line between minutes, which is geometry, not
// a reading.
import {
  memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from "react";
import type { ReactNode } from "react";
import {
  DERBY, MINUS, OUTCOMES, PRIME, fmt1, gapOf, signed1,
} from "../../lib/landingData";
import type { Minute, Outcome } from "../../lib/landingData";
import { span, useScrollScene, useSize } from "../../lib/useScrollScene";
import s from "./landing.module.css";

const M = DERBY.minutes;
const LAST = M[M.length - 1].m;            // 90
const COLS: Record<Outcome, string> = {
  home: DERBY.home.color, draw: "#8b8b95", away: DERBY.away.color };
const NAMES: Record<Outcome, string> = {
  home: "Atlético", draw: "Draw", away: "Real Madrid" };
const at = (m: number): Minute => M[Math.max(0, Math.min(M.length - 1, m))];
const sc = (m: number) => {
  const r = at(m).score;
  return r ? `${r.home}–${r.away}` : "0–0";
};

/* WHERE THE MODEL STOPS FOR GOOD: the first minute of the refusal that
   never lifts, and the last minute it read before it. Derived from the
   series, not typed. */
const STOP = (() => {
  let first = -1;
  for (let i = M.length - 1; i >= 0 && !M[i].model && M[i].refused === "dismissal"; i--) first = M[i].m;
  return first < 0 ? null : { from: first, last: first - 1 };
})();
const RED = DERBY.events.find((e) => e.type === "red");

/* WHERE THE MODEL'S LINE BEGINS (round 12): at its first IN-PLAY reading,
   the first tape row that carries one. The rows before it (0′ and 1′)
   hold the T−10 lock carried forward, and drawn as a line they made a
   flat stub and a near-vertical drop at kick-off — a "hook" — in every
   view. The rows are untouched: the readout still says what they hold,
   and the KO caption says the read was locked before. */
const FIRST_READ = M.find((r) => r.tape && r.model)?.m ?? 0;

/* scroll → minute: continuous, lingering gently where the read changed */
const MARKS = [51, 53, 54, 60];
const WEIGHT = Array.from({ length: LAST }, (_, i) => {
  const m = i + 0.5;
  return 1 + MARKS.reduce((a, e) => a + 2.5 * Math.exp(-((m - e) ** 2) / (2 * 1.2 ** 2)), 0)
    + 1.2 * Math.exp(-((m - 45) ** 2) / 2);
});
const CUM = (() => {
  const out = [0]; let t = 0;
  for (const w of WEIGHT) { t += w; out.push(t); }
  return out.map((v) => v / t);                 // CUM[m] = share of scroll at minute m
})();
/** q in [0,1] → a fractional minute in [0, LAST] */
const minuteAt = (q: number) => {
  for (let m = 1; m <= LAST; m++) {
    if (q <= CUM[m]) return m - 1 + (q - CUM[m - 1]) / (CUM[m] - CUM[m - 1]);
  }
  return LAST;
};

type Cap = { id: string; from: number; to: number; tag: string; text: ReactNode };
const pct = (v: number | undefined | null) => (v == null ? "—" : `${fmt1(v)}%`);
const CAPS: Cap[] = (() => {
  const m50 = at(50), m51 = at(51), g = at(53), m60 = at(60);
  return [
    { id: "ko", from: 0, to: 1, tag: `0${PRIME}`, text: <>Kick-off. The model&rsquo;s read was locked ten minutes before.</> },
    { id: "play", from: 2, to: 44, tag: `2${PRIME}`, text: <>In play, model and market start within a point.</> },
    { id: "ht", from: 45, to: 45, tag: "HT", text: <>Half-time. No play, no read.</> },
    { id: "h2", from: 46, to: 50, tag: `46${PRIME}`, text: <>Still 0–0. Both lines lean toward the draw.</> },
    { id: "first", from: 51, to: 52, tag: `51${PRIME}`, text: <>The market moves first: Atlético <b>{pct(m50.market?.home)}</b> → <b>{pct(m51.market?.home)}</b>. The tape hasn&rsquo;t caught up.</> },
    { id: "goal1", from: 53, to: 53, tag: `53${PRIME}`, text: <>Goal, Atlético. {sc(53)}. Model <b>{pct(g.model?.home)}</b>, market <b>{pct(g.market?.home)}</b>.</> },
    { id: "red", from: 54, to: 59, tag: `54${PRIME}`, text: <>Red card, Real Madrid. The model stands down&nbsp;— it reads 11&nbsp;v&nbsp;11 only. The market reads on.</> },
    { id: "goal2", from: 60, to: 67, tag: `60${PRIME}`, text: <>{sc(60)} Atlético. Market: <b>{pct(m60.market?.home)}</b>.</> },
    { id: "flat", from: 68, to: 89, tag: `68${PRIME}`, text: <>The model stays out. The market runs to full time.</> },
    { id: "ft", from: 90, to: 90, tag: `90${PRIME}`, text: <>Real Madrid pull one back. {sc(90)}, full time.</> },
  ];
})();
const capAt = (m: number) => CAPS.find((c) => m >= c.from && m <= c.to) ?? CAPS[0];

function phase(m: number, done: boolean) {
  if (done) return "full time · recorded";
  if (m === 0) return "kick-off";
  if (m === 45) return "half-time";
  return m < 45 ? "first half" : "second half";
}

/* the event rail: a goal's dot radius, a red card's half-width, the
   least gap between two markers, the rail's height, and how far it runs
   past full time so the 90′ marker sits on it whole */
const EV_R = 3.6, EV_HALF_W = 2.5, EV_GAP = 1.5, RAIL_Y = 12, RAIL_PAD = 6;

/** the chart's fixed drawing — rebuilt only when its box changes size */
function geometry(w: number, h: number) {
  const l = 34, r = 12, t = 30, b = 24;
  const X = (m: number) => l + (m / LAST) * (w - l - r);
  const Y = (v: number) => t + (1 - v / 100) * (h - t - b);
  const pt = (m: number, v: number) => `${X(m).toFixed(1)} ${Y(v).toFixed(1)}`;
  /** the runs of one series, and the short holes between them */
  const series = (o: Outcome, k: "model" | "market") => {
    const runs: { m: number; v: number }[][] = []; let cur: { m: number; v: number }[] = [];
    for (const row of M) {
      if (k === "model" && row.m < FIRST_READ) continue;
      const v = row[k]?.[o];
      if (v == null) { if (cur.length) runs.push(cur); cur = []; continue; }
      cur.push({ m: row.m, v });
    }
    if (cur.length) runs.push(cur);
    const lines = runs.filter((r2) => r2.length > 1)
      .map((r2) => r2.map((p, i) => `${i ? "L" : "M"}${pt(p.m, p.v)}`).join(""));
    const bridges: string[] = [];
    for (let i = 1; i < runs.length; i++) {
      const a = runs[i - 1][runs[i - 1].length - 1], z = runs[i][0];
      if (z.m - a.m <= 3) bridges.push(`M${pt(a.m, a.v)}L${pt(z.m, z.v)}`);
    }
    return { lines, bridges };
  };
  const fills = (o: Outcome) => {
    const out: string[] = []; let cur: Minute[] = [];
    const flush = () => {
      if (cur.length > 1) {
        const top = cur.map((r2, i) => `${i ? "L" : "M"}${pt(r2.m, r2.model![o])}`).join("");
        const back = [...cur].reverse().map((r2) => `L${pt(r2.m, r2.market![o])}`).join("");
        out.push(`${top}${back}Z`);
      }
      cur = [];
    };
    for (const row of M) {
      if (row.m < FIRST_READ) continue;
      if (row.model && row.market) cur.push(row); else flush();
    }
    flush();
    return out;
  };
  const caps = STOP ? OUTCOMES.map((o) => {
    const v = at(STOP.last).model?.[o];
    return v == null ? null : { o, x: X(STOP.last), y: Y(v) };
  }).filter(Boolean) as { o: Outcome; x: number; y: number }[] : [];
  /* THE EVENT RAIL, SPACED (round 12). On a phone a minute is ~3px, so
     the 53′ goal dot sat half under the 54′ red card. Markers closer than
     their own half-widths and EV_GAP are pushed apart, symmetrically, as
     far as it takes for both to be whole; the guide lines and the stop
     line stay on the true minutes. */
  const rail = [...DERBY.events].sort((p, q) => p.m - q.m)
    .map((e) => ({ m: e.m, type: e.type, x: X(e.m), half: e.type === "goal" ? EV_R : EV_HALF_W }));
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 1; i < rail.length; i++) {
      const a = rail[i - 1], z = rail[i];
      const short = a.half + z.half + EV_GAP - (z.x - a.x);
      if (short > 0.01) { a.x -= short / 2; z.x += short / 2; moved = true; }
    }
    if (!moved) break;
  }
  return {
    l, r, t, b, X, Y, w, h, caps, rail,
    paths: OUTCOMES.map((o) => ({ o, model: series(o, "model"), market: series(o, "market"), fill: fills(o) })),
  };
}
type Geo = ReturnType<typeof geometry>;

/* THE BAND'S LABEL GOES WHERE NOTHING IS DRAWN (round 11). It was set at
   a fixed spot — 8px past the stop, at the 64% line, as wide as the band
   — so on a short phone (320×568, 375×548) it wrapped to three lines,
   sat flush on the 90′ line and took the Draw and Real Madrid end dots
   (0–3%) on its corner. It is now placed from the series itself: the
   leftmost spot inside the band, clear of the stop line, of the 90′ line
   and its end dots, where the label fits between the market's lines with
   LAB_CLEAR to spare above and below, centred in that gap. If no spot
   fits, the second line (the red card's minute, which the event rail
   marks right above the stop) steps aside and the label is placed again;
   if that does not fit either, the roomier of the two is kept. */
const LAB_LEFT = 8;     // px past the stop line
const LAB_RIGHT = 12;   // px short of the 90′ line: its end dots are 4px either side
const LAB_CLEAR = 6;    // px between the label and any market line
const LAB_GUIDE = 6;    // px between the label and any line drawn down the band

/* AND NO LINE DRAWN DOWN THE BAND RUNS THROUGH IT (round 12). The 60′
   goal's dashed guide crosses the band, and the label — placed clear of
   the market's lines only — sat on it at 360–1440px. Every vertical line
   the chart draws is now kept LAB_GUIDE clear: each event's guide (the
   red card's is the stop line, the band's own left edge), and the
   cursor, which rests on the 90′ line at full time. What is left of the
   band is a run of free spans between those lines; the label is measured
   to the widest and placed in the first that holds it. */
function labelRuns(G: Geo): [number, number][] {
  if (!STOP) return [];
  const x0 = G.X(STOP.from) + LAB_LEFT, x1 = G.X(LAST) - LAB_RIGHT;
  const cuts = [...DERBY.events.map((e) => G.X(e.m)), G.X(LAST)]
    .filter((g) => g > x0 - LAB_GUIDE && g < x1 + LAB_GUIDE).sort((p, q) => p - q);
  const runs: [number, number][] = [];
  let a = x0;
  for (const g of cuts) {
    if (g - LAB_GUIDE > a) runs.push([a, g - LAB_GUIDE]);
    a = Math.max(a, g + LAB_GUIDE);
  }
  if (x1 > a) runs.push([a, x1]);
  return runs;
}
/** the widest free span: the label's measuring width */
const labelMax = (G: Geo) => Math.max(0, ...labelRuns(G).map(([a, b]) => b - a));
type LabSpot = { x: number; y: number; room: number };
/** the market's value for one outcome at a fractional minute, as drawn */
const marketAt = (o: Outcome, f: number) => {
  const i = Math.max(0, Math.min(LAST, Math.floor(f))), j = Math.min(LAST, i + 1);
  const a = at(i).market?.[o], z = at(j).market?.[o];
  if (a == null) return z ?? null;
  if (z == null) return a;
  return a + (z - a) * (f - i);
};
function placeLabel(G: Geo, w: number, h: number): LabSpot | null {
  if (!STOP) return null;
  const top = G.t + 2, bottom = G.h - G.b - 2;
  const perMin = (G.w - G.l - G.r) / LAST;
  /** the tallest run of plot height no market line enters over [xa, xb] */
  const gap = (xa: number, xb: number): [number, number] => {
    const fa = (xa - G.l) / perMin, fb = (xb - G.l) / perMin;
    const used: [number, number][] = [];
    for (const o of OUTCOMES) {
      const vs = [marketAt(o, fa), marketAt(o, fb)];
      for (let m = Math.ceil(fa); m <= Math.floor(fb); m++) vs.push(at(m).market?.[o] ?? null);
      const got = vs.filter((v): v is number => v != null);
      if (got.length) used.push([G.Y(Math.max(...got)) - 1, G.Y(Math.min(...got)) + 1]);
    }
    used.sort((p, q) => p[0] - q[0]);
    let best: [number, number] = [top, top], cur = top;
    for (const [a, b] of used) {
      if (a - cur > best[1] - best[0]) best = [cur, a];
      cur = Math.max(cur, b);
    }
    if (bottom - cur > best[1] - best[0]) best = [cur, bottom];
    return best;
  };
  /* the leftmost spot in [from, to] (the label's left edge) with
     LAB_CLEAR to spare; else the roomiest. The label's whole box, and
     LAB_CLEAR either side of it: a steep stretch of line just outside its
     edge still passes its corner. */
  const scan = (from: number, to: number) => {
    let pick: LabSpot | null = null;
    for (let x = from; ; x = Math.min(x + 2, to)) {
      const [a, b] = gap(x - LAB_CLEAR, x + w + LAB_CLEAR);
      const spot = { x, y: (a + b - h) / 2, room: (b - a - h) / 2 };
      if (!pick || spot.room > pick.room) pick = spot;
      if (spot.room >= LAB_CLEAR || x >= to) return { spot, pick };
    }
  };
  // every free span wide enough, left to right; the first clear spot wins
  let pick: LabSpot | null = null;
  for (const [a, b] of labelRuns(G)) {
    if (b - a < w - 0.5) continue;
    const r = scan(a, Math.max(a, b - w));
    if (r.spot.room >= LAB_CLEAR) return r.spot;
    if (r.pick && (!pick || r.pick.room > pick.room)) pick = r.pick;
  }
  if (pick) return pick;
  // no span holds it (never measured so): the old rule, the whole band
  const x0 = G.X(STOP.from) + LAB_LEFT, x1 = G.X(LAST) - LAB_RIGHT;
  return scan(x0, Math.max(x0, x1 - w)).pick;
}

/** `useLayoutEffect` does nothing on the server, and says so; the label
 *  is placed for the browser's next paint (components/LeagueTabs.tsx) */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** THE GROUND — grid and axis labels. Never changes with the minute. */
const Ground = memo(function Ground({ G }: { G: Geo }) {
  return (
    <svg aria-hidden className={s.chartSvg} width={G.w} height={G.h}>
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <g key={v}>
          <line x1={G.l} x2={G.w - G.r} y1={G.Y(v)} y2={G.Y(v)}
            stroke="var(--line-strong)" strokeOpacity={v === 0 ? 0.9 : 0.35} />
          <text x={G.l - 6} y={G.Y(v) + 3.5} textAnchor="end" className={s.chartTxt}>
            {v === 100 ? "100%" : v}
          </text>
        </g>
      ))}
      {[0, 15, 30, 45, 60, 75, 90].map((t) => (
        <text key={t} x={G.X(t)} y={G.h - 6} textAnchor="middle" className={s.chartTxt}>
          {t === 0 ? "KO" : t === 45 ? "HT" : `${t}${PRIME}`}
        </text>
      ))}
      <line x1={G.l} x2={G.w - G.r + RAIL_PAD} y1={RAIL_Y} y2={RAIL_Y}
        stroke="var(--ink-faint)" strokeOpacity="0.6" data-testid="clock-rail-line" />
    </svg>
  );
});

/** THE INK — everything that is revealed as the clock runs: the goals'
 *  guide lines, the stand-down band, the fills, the six lines, their
 *  bridges and the model's end caps (the rail's markers are drawn whole,
 *  outside the window: Rail). Built once per size; the reveal moves a
 *  window over it and never touches it. */
const Ink = memo(function Ink({ G }: { G: Geo }) {
  const x0 = STOP ? G.X(STOP.from) : 0;
  return (
    <svg aria-hidden width={G.w} height={G.h}>
      <defs>
        <pattern id="landing-hatch" width="7" height="7" patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--ink-faint)" strokeWidth="1" />
        </pattern>
      </defs>
      {STOP && (
        <g data-testid="clock-standdown">
          <rect x={x0} y={G.t} width={G.X(LAST) - x0} height={G.h - G.t - G.b}
            fill="rgba(245,245,247,0.025)" />
          <rect x={x0} y={G.t} width={G.X(LAST) - x0} height={G.h - G.t - G.b}
            fill="url(#landing-hatch)" opacity="0.45" />
          <line x1={x0} x2={x0} y1={G.t - 4} y2={G.h - G.b} stroke="var(--ink-low)"
            strokeDasharray="3 3" />
        </g>
      )}
      {DERBY.events.filter((e) => e.type === "goal").map((e, i) => (
        <line key={`g${i}`} x1={G.X(e.m)} x2={G.X(e.m)} y1={G.t} y2={G.h - G.b}
          stroke="var(--ink-faint)" strokeDasharray="2 3" data-testid="clock-ev-guide" />
      ))}
      {G.paths.map((pp) => (
        <g key={pp.o}>
          {pp.fill.map((d, i) => <path key={`f${i}`} d={d} fill={COLS[pp.o]} opacity="0.12" />)}
          {pp.market.lines.map((d, i) => (
            <path key={`k${i}`} d={d} fill="none" stroke={COLS[pp.o]}
              strokeOpacity="0.7" strokeWidth="1.6" strokeDasharray="4 3" />
          ))}
          {[...pp.market.bridges, ...pp.model.bridges].map((d, i) => (
            <path key={`b${i}`} d={d} fill="none" stroke={COLS[pp.o]} strokeOpacity="0.4"
              strokeWidth="1.2" strokeDasharray="1 3" strokeLinecap="round" />
          ))}
          {pp.model.lines.map((d, i) => (
            <path key={`m${i}`} d={d} fill="none" stroke={COLS[pp.o]} strokeWidth="2.2"
              strokeLinejoin="round" />
          ))}
        </g>
      ))}
      {/* THE MODEL'S LAST READING, capped: a stop, not a cut */}
      {G.caps.map((c) => (
        <g key={c.o} data-testid={`clock-cap-${c.o}`}>
          <line x1={c.x} x2={c.x} y1={c.y - 6} y2={c.y + 6} stroke={COLS[c.o]} strokeWidth="2" />
          <circle cx={c.x} cy={c.y} r="3.4" fill={COLS[c.o]} stroke="var(--bs-bg)" strokeWidth="1.4" />
        </g>
      ))}
    </svg>
  );
});

/** THE EVENT RAIL'S MARKERS, OUTSIDE THE REVEAL WINDOW (round 12). Inside
 *  it, the window's edge — the clock — cut each marker in half on the
 *  minute it was reached, and cut the 90′ goal for good at full time. Out
 *  here a marker is drawn whole from its minute on, at its spaced place
 *  on the rail (geometry). */
function Rail({ G, upTo }: { G: Geo; upTo: number }) {
  return (
    <svg aria-hidden className={s.chartSvg} width={G.w} height={G.h} data-testid="clock-rail">
      {G.rail.map((e, i) => {
        const on = upTo >= e.m;
        return e.type === "goal"
          ? <circle key={i} cx={e.x} cy={RAIL_Y} r={EV_R} fill="var(--ink-hi)"
              opacity={on ? 1 : 0} data-on={on} data-testid="clock-ev-goal" />
          : <rect key={i} x={e.x - EV_HALF_W} y={RAIL_Y - 5.5} width={2 * EV_HALF_W} height="11"
              rx="1" fill="var(--neg)" opacity={on ? 1 : 0} data-on={on}
              data-testid={`clock-ev-${e.type}`} />;
      })}
    </svg>
  );
}

export default function MatchClock({ mode, enabled }: {
  mode: "scroll" | "still"; enabled: boolean }) {
  const section = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const [boxRef, size] = useSize<HTMLDivElement>({ w: 760, h: 380 });
  const G = useMemo(() => geometry(size.w, size.h), [size.w, size.h]);
  const still = mode === "still";
  const [minute, setMinute] = useState(still ? LAST : 0);
  const [done, setDone] = useState(still);
  const m = still ? LAST : minute;
  const fin = still || done;

  /* the band label: measured as drawn (font, wrap), then placed */
  const lab = useRef<HTMLDivElement | null>(null);
  const [labAt, setLabAt] = useState<{ x: number; y: number; w: number; compact: boolean } | null>(null);
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => { if (live) setFonts(true); });
    return () => { live = false; };
  }, []);
  useIsoLayoutEffect(() => {
    const el = lab.current;
    if (!el) return;
    /* a wrapped box keeps its max-width, however short its lines: so it
       is measured at the max-width, then drawn as wide as its longest
       line (and placed at that width). It is measured at the left edge:
       where it last stood (or a first, pre-measure guess) may leave it
       less room than its max-width, and then it wraps word by word. */
    const measure = (compact: boolean) => {
      el.toggleAttribute("data-compact", compact);
      el.style.left = "0px";
      el.style.width = "";
      // a line's extent across all its text runs ("red card ", "54", "′")
      const r = document.createRange();
      const lines = new Map<number, [number, number]>();
      for (const sp of el.children) {
        if (getComputedStyle(sp).display === "none") continue;
        r.selectNodeContents(sp);
        for (const b of r.getClientRects()) {
          const k = Math.round(b.top), e = lines.get(k);
          lines.set(k, e ? [Math.min(e[0], b.left), Math.max(e[1], b.right)] : [b.left, b.right]);
        }
      }
      let line = 0;
      for (const [a, z] of lines.values()) line = Math.max(line, z - a);
      const cs = getComputedStyle(el);
      const chrome = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
        + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      /* the box as laid out, unrounded: `offsetWidth` rounds 144.4 down
         to 144, and a box set to that wrapped its own one line (round 12,
         "model stands / down" at 1440) */
      const box = el.getBoundingClientRect().width;
      // the red card's line does not break: wider than the widest free
      // span, it would run out of the box, so it steps aside instead
      if (line + chrome > box + 0.5) return null;
      const w = Math.min(Math.ceil(box), Math.ceil(line + 1 + chrome));
      el.style.width = `${w}px`;
      const spot = placeLabel(G, w, el.offsetHeight);
      return spot && { ...spot, w, compact };
    };
    let best = measure(false);
    if (!best || best.room < LAB_CLEAR) {
      const c = measure(true);
      if (c && (!best || c.room > best.room)) best = c;
    }
    if (!best) return;
    el.toggleAttribute("data-compact", best.compact);
    el.style.width = `${best.w}px`;
    el.style.left = `${best.x}px`;
    el.style.top = `${best.y}px`;
    setLabAt({ x: best.x, y: best.y, w: best.w, compact: best.compact });
  }, [G, fonts]);

  const win = useRef<HTMLDivElement | null>(null);
  const winInner = useRef<HTMLDivElement | null>(null);
  const cursor = useRef<HTMLDivElement | null>(null);
  const dots = useRef<Record<string, HTMLElement | null>>({});

  /* ONE FRAME: transforms only, no layout read, no React render unless
     the whole minute changed. */
  const place = useCallback((f: number) => {
    const x = G.X(f) + 1;
    if (win.current) win.current.style.transform = `translate3d(${x - G.w}px,0,0)`;
    if (winInner.current) winInner.current.style.transform = `translate3d(${G.w - x}px,0,0)`;
    if (cursor.current) cursor.current.style.transform = `translate3d(${x - 1}px,0,0)`;
    const i = Math.min(LAST, Math.floor(f)), j = Math.min(LAST, i + 1), fr = f - i;
    const a = at(i), z = at(j);
    for (const o of OUTCOMES) {
      for (const k of ["model", "market"] as const) {
        const el = dots.current[`${k}-${o}`];
        if (!el) continue;
        const v0 = a[k]?.[o];
        // a dot rides the drawn line: none before the model's line begins
        if (v0 == null || (k === "model" && f < FIRST_READ)) { el.style.opacity = "0"; continue; }
        const v1 = z[k]?.[o];
        const y = v1 == null ? G.Y(v0) : G.Y(v0) + (G.Y(v1) - G.Y(v0)) * fr;
        el.style.opacity = "1";
        el.style.transform = `translate3d(${G.X(f)}px,${y}px,0)`;
      }
    }
    setMinute((v) => (v === i ? v : i));
  }, [G]);

  const draw = useCallback((p: number) => {
    place(minuteAt(span(p, 0.04, 0.94)));
    const d = p >= 0.94;
    setDone((v) => (v === d ? v : d));
  }, [place]);
  useScrollScene(section, draw, { mode: "pinned", stage, enabled: !still && enabled });
  useEffect(() => {
    if (!still) return;
    const id = requestAnimationFrame(() => place(LAST));
    return () => cancelAnimationFrame(id);
  }, [still, place]);

  const row = at(m);
  const cap = capAt(m);
  const standing = STOP != null && m >= STOP.from;
  /* NO READ IS A DASH, AND IT IS SAID ONCE (2026-10-03). The cells said
     "stood down" three times over, beside a caption, the band's own
     label and a footnote that all said it too — five times in one
     frame. The band label names the stand-down and the caption tells
     it; the cells only show that there is no number. */
  const modelCell = (v: number | null | undefined) => (v != null ? fmt1(v) : "—");

  return (
    <section ref={section} data-testid={`clock-${mode}`} aria-labelledby="landing-clock"
      className={still ? s.stillScene : s.sceneClock}>
      <div ref={stage} className={`${s.stage} ${s.clockStage}`}>
        <div className={`${s.wrap} ${s.clockGrid}`}>
          <div className={s.clockText}>
            <p className={s.eyebrow}>0{PRIME} → 90{PRIME} · in play</p>
            <h2 id="landing-clock" className={`${s.display} ${s.h2}`}>Ninety minutes, read.</h2>
            <div className={s.clockNow} data-testid="clock-minute" data-minute={m}>
              <span className={`${s.display} ${s.minute}`}>{m}{PRIME}</span>
              <span className={s.scoreline}>
                <span>{DERBY.home.abbrev}</span>
                <b>{m < 2 ? "0–0" : sc(m)}</b>
                <span>{DERBY.away.abbrev}</span>
                <em>{phase(m, fin && m === LAST)}</em>
              </span>
            </div>
            {/* EVERY CAPTION, STACKED IN ONE CELL (2026-10-03). The slot
                reserved a typed two lines, and the 54′ caption takes three
                at 1024–1100px and at 360px and below — so the pinned
                stage re-centred by 11–21px at the red card and back at
                60′. All of them now share one grid cell and only the
                current one is visible, so the slot is the tallest
                caption's height at every width and in every font, and
                no caption change can move the stage. */}
            {!still && (
              <div className={s.captionSlot} data-testid="clock-captions">
                {CAPS.map((c) => {
                  const on = c.id === cap.id;
                  return (
                    <p key={c.id} className={s.caption} data-on={on}
                      aria-hidden={on ? undefined : true}
                      data-testid={on ? "clock-caption" : undefined}>
                      {c.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <div className={s.clockChart}>
            <div className={s.chartHead}>
              <span className={s.legendInline}>
                <i className={s.keySolid} />model
                <i className={s.keyDash} />market
              </span>
              <span className={s.chip}>{DERBY.label}</span>
            </div>
            <div ref={boxRef} className={s.chartBox} role="img"
              aria-label={`Model and market for ${DERBY.home.name} v ${DERBY.away.name}, minute by minute, three outcomes on one axis from 0 to 100 percent. The model stands down after the red card at ${RED?.m ?? 54} minutes; the market reads on to full time. Final score ${sc(LAST)}.`}>
              <Ground G={G} />
              {/* the composited window: the frame slides right, its
                  content slides back left by the same amount, so the ink
                  stays put and only the window's edge moves */}
              <div ref={win} className={s.revealWin}
                style={{ transform: `translate3d(${G.X(m) + 1 - G.w}px,0,0)` }}>
                <div ref={winInner} className={s.revealInner}
                  style={{ transform: `translate3d(${G.w - G.X(m) - 1}px,0,0)` }}>
                  <Ink G={G} />
                  {/* the label rides inside the window, so it is wiped in
                      with the band it names — never shown ahead of it. It
                      is placed where no market line runs (placeLabel),
                      clear of the stop, of every guide line, of the 90′
                      line and its dots; it wraps rather than run past
                      the free span it sits in */}
                  {STOP && (
                    <div ref={lab} className={s.standLab} data-testid="clock-standdown-label"
                      data-compact={labAt?.compact || undefined}
                      style={{ left: labAt ? labAt.x : G.X(STOP.from) + LAB_LEFT,
                        top: labAt ? labAt.y : G.Y(64), width: labAt?.w,
                        maxWidth: labelMax(G) }}>
                      <span>model stands down</span>
                      <span>red card {RED?.m ?? STOP.from}{PRIME}</span>
                    </div>
                  )}
                </div>
              </div>
              <Rail G={G} upTo={m} />
              <div ref={cursor} aria-hidden className={s.cursor} data-testid="clock-cursor"
                style={{ transform: `translate3d(${G.X(m)}px,0,0)`, top: G.t - 6, height: G.h - G.t - G.b + 6 }} />
              {OUTCOMES.map((o) => (
                <span key={o} aria-hidden>
                  <i ref={(el) => { dots.current[`market-${o}`] = el; }} className={s.dotMarket}
                    style={{ borderColor: COLS[o], opacity: 0 }} />
                  <i ref={(el) => { dots.current[`model-${o}`] = el; }} className={s.dotModel}
                    style={{ background: COLS[o], opacity: 0 }} />
                </span>
              ))}
            </div>

            <table className={s.readout} data-testid="clock-readout">
              <thead>
                <tr><th scope="col"><span className="sr-only">outcome</span></th>
                  <th scope="col">model</th><th scope="col">market</th><th scope="col">gap</th></tr>
              </thead>
              <tbody>
                {OUTCOMES.map((o) => {
                  const mv = row.model?.[o], kv = row.market?.[o];
                  const g = gapOf(mv, kv);
                  return (
                    <tr key={o}>
                      <th scope="row"><i style={{ background: COLS[o] }} />{NAMES[o]}</th>
                      <td className={mv == null ? s.cellQuiet : undefined}>{modelCell(mv)}</td>
                      <td>{kv == null ? "—" : fmt1(kv)}</td>
                      <td style={{ color: g == null || g === 0 ? "var(--ink-mid)" : g > 0 ? "var(--up)" : "var(--neg)" }}>
                        {g == null ? "—" : signed1(g)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* ONE FIXED SLOT, one line, so the chart never moves when it
                changes. After the red card it goes back to the key: the
                band's label already names the stand-down. On a short
                phone it and the fine print step aside, so the pinned
                stage fits the screen (landing.module.css). */}
            <p className={s.note} data-testid="clock-note">
              {!standing && row.model == null && m > 0
                ? (row.refused === "interval" ? "No model read at half-time." : "No model read this minute.")
                : `Gap = model ${MINUS} market, in points.`}
            </p>
            <p className={s.provenance}>a read, not a signal</p>
          </div>
        </div>

        {still && (
          <ol className={`${s.wrap} ${s.timeline}`} data-testid="clock-timeline">
            {CAPS.map((c) => (
              <li key={c.id}><span className={s.capTag}>{c.tag}</span><span>{c.text}</span></li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

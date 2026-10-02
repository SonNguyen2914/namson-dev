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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const k = at(0), m50 = at(50), m51 = at(51), g = at(53), m60 = at(60);
  return [
    { id: "ko", from: 0, to: 1, tag: `0${PRIME}`, text: <>Kick-off. The model&rsquo;s T{MINUS}10 lock had Atlético at <b>{pct(k.model?.home)}</b>; the market had them at <b>{pct(k.market?.home)}</b>.</> },
    { id: "play", from: 2, to: 44, tag: `2${PRIME}`, text: <>In play, the model reads the minute and the score. The market already knows both — the two start within a point.</> },
    { id: "ht", from: 45, to: 45, tag: "HT", text: <>Half-time. The ball stops, and so does the model: it gives no read while nothing moves.</> },
    { id: "h2", from: 46, to: 50, tag: `46${PRIME}`, text: <>Second half, still 0–0. Both lines have leaned toward the draw.</> },
    { id: "first", from: 51, to: 52, tag: `51${PRIME}`, text: <>The market moves first — Atlético from <b>{pct(m50.market?.home)}</b> to <b>{pct(m51.market?.home)}</b>. The score tape has not caught up yet.</> },
    { id: "goal1", from: 53, to: 53, tag: `53${PRIME}`, text: <>Goal, Atlético. {sc(53)}. Both lines bend: model <b>{pct(g.model?.home)}</b>, market <b>{pct(g.market?.home)}</b>.</> },
    { id: "red", from: 54, to: 59, tag: `54${PRIME}`, text: <>Red card, Real Madrid. The model stands down — it was built for eleven against eleven, and says so instead of guessing. The market keeps reading.</> },
    { id: "goal2", from: 60, to: 67, tag: `60${PRIME}`, text: <>Atlético again, {sc(60)}. The market puts them at <b>{pct(m60.market?.home)}</b>.</> },
    { id: "flat", from: 68, to: 89, tag: `68${PRIME}`, text: <>Ten against eleven, two goals down. The market drifts toward certainty; the model&rsquo;s lines stay ended at 53{PRIME} — no read is drawn where none was made.</> },
    { id: "ft", from: 90, to: 90, tag: `90${PRIME}`, text: <>Real Madrid pull one back. {sc(90)} at the whistle.</> },
  ];
})();
const capAt = (m: number) => CAPS.find((c) => m >= c.from && m <= c.to) ?? CAPS[0];

function phase(m: number, done: boolean) {
  if (done) return "full time · recorded";
  if (m === 0) return "kick-off";
  if (m === 45) return "half-time";
  return m < 45 ? "first half" : "second half";
}

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
    for (const row of M) { if (row.model && row.market) cur.push(row); else flush(); }
    flush();
    return out;
  };
  const caps = STOP ? OUTCOMES.map((o) => {
    const v = at(STOP.last).model?.[o];
    return v == null ? null : { o, x: X(STOP.last), y: Y(v) };
  }).filter(Boolean) as { o: Outcome; x: number; y: number }[] : [];
  return {
    l, r, t, b, X, Y, w, h, caps,
    paths: OUTCOMES.map((o) => ({ o, model: series(o, "model"), market: series(o, "market"), fill: fills(o) })),
  };
}
type Geo = ReturnType<typeof geometry>;

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
      <line x1={G.l} x2={G.w - G.r} y1={12} y2={12} stroke="var(--ink-faint)" strokeOpacity="0.6" />
    </svg>
  );
});

/** THE INK — everything that is revealed as the clock runs: the event
 *  rail, the stand-down band, the fills, the six lines, their bridges and
 *  the model's end caps. Built once per size; the reveal moves a window
 *  over it and never touches it. */
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
      {DERBY.events.map((e, i) => (
        e.type === "goal"
          ? <circle key={i} cx={G.X(e.m)} cy={12} r="3.6" fill="var(--ink-hi)" data-testid="clock-ev-goal" />
          : <rect key={i} x={G.X(e.m) - 2.5} y={6.5} width="5" height="11" rx="1" fill="var(--neg)"
              data-testid={`clock-ev-${e.type}`} />
      ))}
      {DERBY.events.filter((e) => e.type === "goal").map((e, i) => (
        <line key={`g${i}`} x1={G.X(e.m)} x2={G.X(e.m)} y1={G.t} y2={G.h - G.b}
          stroke="var(--ink-faint)" strokeDasharray="2 3" />
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
        if (v0 == null) { el.style.opacity = "0"; continue; }
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
  const modelCell = (v: number | null | undefined) => {
    if (v != null) return fmt1(v);
    if (row.refused === "dismissal") return "stood down";
    if (row.refused === "interval") return "no read";
    return "—";
  };

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
            {!still && (
              <p key={cap.id} className={s.caption} data-testid="clock-caption">
                {cap.text}
              </p>
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
                      with the band it names — never shown ahead of it */}
                  {STOP && (
                    <div className={s.standLab} data-testid="clock-standdown-label"
                      style={{ left: G.X(STOP.from) + 8, top: G.Y(64) }}>
                      <span>model stands down</span>
                      <span>red card {RED?.m ?? STOP.from}{PRIME}</span>
                      <span>built for 11 v 11</span>
                    </div>
                  )}
                </div>
              </div>
              <div ref={cursor} aria-hidden className={s.cursor}
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
            {/* ONE FIXED SLOT for the model's absence, so the chart never
                moves when it appears; the provenance line below is constant. */}
            <p className={s.note} data-testid="clock-note">
              {standing
                ? `Model stood down at the ${RED?.m ?? STOP?.from}${PRIME} red card — its lines end at ${STOP?.last}${PRIME}. The in-play engine reads 11 v 11 only.`
                : row.model == null && m > 0
                  ? (row.refused === "interval" ? "Model: no read at half-time — the dotted link only joins the two halves." : "Model: no read this minute.")
                  : `Gap = model ${MINUS} market, in points.`}
            </p>
            <p className={s.provenance}>
              a read, not a signal · the stored series for this match, not an
              illustration · market = the de-vigged three-way book
            </p>
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

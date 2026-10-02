// THE SECOND SCROLL MOMENT: NINETY MINUTES, READ.
//
// The pinned stage turns scroll into the match clock. Its chart is the
// match hub's round-5 design (components/ModelVsMarket.tsx, approved
// 2026-10-01) re-drawn for a page that has to explain itself: all three
// outcomes on one 0–100% axis, the model SOLID and the market DASHED in
// each outcome's colour, the gap between them a faint fill in the same
// hue. As the reader scrolls, the lines draw minute by minute and one
// line of type says what changed at that minute.
//
// THE DATA IS REAL: the stored series for Atlético Madrid v Real Madrid
// (La Liga, 20 Sep 2026), baked from GET /api/minutes — the in-play
// model's triple and the de-vigged three-way book, minute by minute.
// Where the model gave no read (half-time; after the red card, when the
// 11-v-11 engine refuses) nothing is drawn: missing is never zero.
//
// TIME IS WARPED, NOT INVENTED. Scroll maps to minutes through weights
// that linger where something happened, so the goal and the red card get
// room. The cursor snaps to whole tape minutes; nothing is interpolated
// into a probability.
import { useCallback, useMemo, useRef, useState } from "react";
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

/* scroll → minute, lingering on the minutes where the read changed */
const MARKS = [51, 53, 54, 60, 90];
const WEIGHT = Array.from({ length: LAST + 1 }, (_, m) =>
  1 + MARKS.reduce((a, e) => a + 6 * Math.exp(-((m - e) ** 2) / (2 * 1.1 ** 2)), 0)
    + 3 * Math.exp(-((m - 45) ** 2) / 2));
const CUM = (() => {
  const out: number[] = []; let t = 0;
  for (const w of WEIGHT) { t += w; out.push(t); }
  return out.map((v) => v / t);
})();
const minuteAt = (q: number) => {
  for (let m = 0; m <= LAST; m++) if (q <= CUM[m]) return m;
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
    { id: "goal2", from: 60, to: 89, tag: `60${PRIME}`, text: <>Atlético again, {sc(60)}. The market puts them at <b>{pct(m60.market?.home)}</b>.</> },
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
  const runs = (o: Outcome, k: "model" | "market") => {
    const out: string[] = []; let cur: string[] = [];
    for (const row of M) {
      const v = row[k]?.[o];
      if (v == null) { if (cur.length > 1) out.push(cur.join("")); cur = []; continue; }
      cur.push(`${cur.length ? "L" : "M"}${X(row.m).toFixed(1)} ${Y(v).toFixed(1)}`);
    }
    if (cur.length > 1) out.push(cur.join(""));
    return out;
  };
  const fills = (o: Outcome) => {
    const out: string[] = []; let cur: Minute[] = [];
    const flush = () => {
      if (cur.length > 1) {
        const top = cur.map((r2, i) => `${i ? "L" : "M"}${X(r2.m).toFixed(1)} ${Y(r2.model![o]).toFixed(1)}`).join("");
        const back = [...cur].reverse().map((r2) => `L${X(r2.m).toFixed(1)} ${Y(r2.market![o]).toFixed(1)}`).join("");
        out.push(`${top}${back}Z`);
      }
      cur = [];
    };
    for (const row of M) { if (row.model && row.market) cur.push(row); else flush(); }
    flush();
    return out;
  };
  return {
    l, r, t, b, X, Y,
    paths: OUTCOMES.map((o) => ({ o, model: runs(o, "model"), market: runs(o, "market"), fill: fills(o) })),
  };
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

  const draw = useCallback((p: number) => {
    const next = minuteAt(span(p, 0.04, 0.94));
    setMinute((v) => (v === next ? v : next));
    const d = p >= 0.94;
    setDone((v) => (v === d ? v : d));
  }, []);
  useScrollScene(section, draw, { mode: "pinned", stage, enabled: !still && enabled });

  const row = at(m);
  const cap = capAt(m);
  const cx = G.X(m);
  const clipRight = Math.max(0, size.w - cx - 4);

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
              aria-label={`Model and market for ${DERBY.home.name} v ${DERBY.away.name}, minute by minute, three outcomes on one axis from 0 to 100 percent. Final score ${sc(LAST)}.`}>
              {/* the ground: grid, axis labels, event rail */}
              <svg aria-hidden className={s.chartSvg} width={size.w} height={size.h}>
                {[0, 20, 40, 60, 80, 100].map((v) => (
                  <g key={v}>
                    <line x1={G.l} x2={size.w - G.r} y1={G.Y(v)} y2={G.Y(v)}
                      stroke="var(--line-strong)" strokeOpacity={v === 0 ? 0.9 : 0.35} />
                    <text x={G.l - 6} y={G.Y(v) + 3.5} textAnchor="end" className={s.chartTxt}>
                      {v === 100 ? "100%" : v}
                    </text>
                  </g>
                ))}
                {[0, 15, 30, 45, 60, 75, 90].map((t) => (
                  <text key={t} x={G.X(t)} y={size.h - 6} textAnchor="middle"
                    className={s.chartTxt} fill={t === m ? "var(--ink-hi)" : undefined}>
                    {t === 0 ? "KO" : t === 45 ? "HT" : `${t}${PRIME}`}
                  </text>
                ))}
                <line x1={G.l} x2={size.w - G.r} y1={12} y2={12} stroke="var(--ink-faint)" strokeOpacity="0.6" />
                {DERBY.events.map((e, i) => (
                  <g key={i} className={s.ev} style={{ opacity: m >= e.m ? 1 : 0 }}
                    data-testid={`clock-ev-${e.type}`}>
                    {e.type === "goal"
                      ? <circle cx={G.X(e.m)} cy={12} r="3.6" fill="var(--ink-hi)" />
                      : <rect x={G.X(e.m) - 2.5} y={6.5} width="5" height="11" rx="1" fill="var(--neg)" />}
                  </g>
                ))}
              </svg>
              {/* the lines, revealed up to the cursor */}
              <div className={s.chartLines} style={{ clipPath: `inset(0 ${clipRight}px 0 0)` }}>
                <svg aria-hidden width={size.w} height={size.h}>
                  {DERBY.events.filter((e) => e.type === "goal").map((e, i) => (
                    <line key={i} x1={G.X(e.m)} x2={G.X(e.m)} y1={G.t} y2={size.h - G.b}
                      stroke="var(--ink-faint)" strokeDasharray="2 3" />
                  ))}
                  {G.paths.map((pp) => (
                    <g key={pp.o}>
                      {pp.fill.map((d, i) => <path key={`f${i}`} d={d} fill={COLS[pp.o]} opacity="0.12" />)}
                      {pp.market.map((d, i) => (
                        <path key={`k${i}`} d={d} fill="none" stroke={COLS[pp.o]}
                          strokeOpacity="0.7" strokeWidth="1.6" strokeDasharray="4 3" />
                      ))}
                      {pp.model.map((d, i) => (
                        <path key={`m${i}`} d={d} fill="none" stroke={COLS[pp.o]} strokeWidth="2.2"
                          strokeLinejoin="round" />
                      ))}
                    </g>
                  ))}
                </svg>
              </div>
              {/* the one cursor */}
              <div aria-hidden className={s.cursor} style={{ transform: `translate3d(${cx}px,0,0)`,
                top: G.t - 6, height: size.h - G.t - G.b + 6 }} />
              {OUTCOMES.map((o) => {
                const mv = row.model?.[o], kv = row.market?.[o];
                return (
                  <span key={o} aria-hidden>
                    {kv != null && <i className={s.dotMarket}
                      style={{ borderColor: COLS[o], transform: `translate3d(${cx}px, ${G.Y(kv)}px, 0)` }} />}
                    {mv != null && <i className={s.dotModel}
                      style={{ background: COLS[o], transform: `translate3d(${cx}px, ${G.Y(mv)}px, 0)` }} />}
                  </span>
                );
              })}
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
                      <td>{mv == null ? "—" : fmt1(mv)}</td>
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
              {row.model == null && m > 0
                ? (row.refused === "dismissal"
                  ? "Model stood down after the red card — the in-play engine reads 11 v 11 only."
                  : row.refused === "interval" ? "Model: no read at half-time." : "Model: no read this minute.")
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

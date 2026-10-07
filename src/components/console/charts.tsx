// THE CONSOLE'S CHARTS (redesign, 2026-10-07). Only charts that answer a
// question: settled P&L over days (with the zero line and the daily loss
// line), and ranked bars (primitives BarList). No donut, no gauge, no
// sparkline without an axis. Every bar is focusable and its exact value is
// said on hover and focus; sample size rides with every value.
import { useState } from "react";
import type { DayBucket } from "../../lib/tradingLedger";
import { usd } from "./primitives";

const wlu = (d: DayBucket) => {
  const c = (n: number | null) => (n === null ? "?" : String(n));
  return `${c(d.won)}–${c(d.lost)}–${c(d.unsettled)}`;
};

/** SETTLED P&L BY DAY: bars up for a gain, down for a loss, from an
 *  obvious zero line; the daily loss limit as a dashed line on the loss
 *  side. A day whose P&L was not sent draws no bar and says so. */
export function DailyPnlChart({ days, limit, height = 180, testid }: {
  days: DayBucket[]; limit: number | null; height?: number; testid?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const vals = days.map((d) => d.settled_pnl_dollars ?? 0);
  const top = Math.max(0.01, ...vals.map((v) => Math.max(0, v)));
  const bottom = Math.max(0.01, ...vals.map((v) => Math.max(0, -v)), limit ?? 0);
  const H = height;
  const padT = 8, padB = 8;
  const plotH = H - padT - padB;
  const zeroY = padT + plotH * (top / (top + bottom));
  const scale = plotH / (top + bottom);
  const n = Math.max(1, days.length);
  const W = 1000;
  const slot = W / n;
  const bw = Math.max(2, Math.min(28, slot * 0.62));
  const shown = hover ?? (days.length ? days.length - 1 : null);
  const s = shown !== null ? days[shown] : null;
  return (
    <div data-testid={testid}>
      <div className="mb-2 flex min-h-[20px] flex-wrap items-baseline gap-x-4 gap-y-0.5 text-[12px]">
        {s ? (
          <>
            <span className="font-mono text-ink-mid">{s.key}</span>
            <span className={`tc-num font-medium ${s.settled_pnl_dollars === null ? "text-ink-low"
              : s.settled_pnl_dollars > 0 ? "text-up" : s.settled_pnl_dollars < 0 ? "text-neg" : "text-ink-hi"}`}>
              {s.settled_pnl_dollars === null ? "settled P&L not sent" : usd(s.settled_pnl_dollars, true)}
            </span>
            <span className="tc-num text-ink-low">{s.rows ?? "?"} rows · {wlu(s)}</span>
            <span className="tc-num text-ink-low">open {usd(s.open_cost_dollars)}</span>
            {s.over_daily_limit === true && <span className="text-warn">◆ daily loss limit reached</span>}
          </>
        ) : <span className="text-ink-low">no day in this window</span>}
      </div>
      <div className="relative" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 block h-full w-full"
        role="img"
        aria-label={`settled P&L by day, ${days.length} days${limit !== null ? `, daily loss limit ${usd(limit)}` : ""}`}>
        {/* zero line */}
        <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="var(--ink-faint)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {limit !== null && limit > 0 && (
          <line data-testid="pnl-limit-line" x1={0} x2={W} y1={zeroY + limit * scale} y2={zeroY + limit * scale}
            stroke="var(--warn)" strokeOpacity={0.7} strokeDasharray="6 5" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
        {days.map((d, i) => {
          const v = d.settled_pnl_dollars;
          const x = i * slot + (slot - bw) / 2;
          const h = v === null ? 0 : Math.max(v === 0 ? 0 : 1.5, Math.abs(v) * scale);
          const y = v === null || v >= 0 ? zeroY - h : zeroY;
          return (
            <g key={d.key}>
              <rect x={i * slot} y={0} width={slot} height={H} fill={hover === i ? "rgba(255,255,255,0.04)" : "transparent"} />
              {v !== null && (
                <rect x={x} y={y} width={bw} height={h} rx={1}
                  fill={v > 0 ? "var(--up)" : v < 0 ? "var(--neg)" : "var(--ink-faint)"} fillOpacity={0.8} />
              )}
              {v === null && (
                <rect x={x} y={zeroY - 6} width={bw} height={6} fill="none" stroke="var(--ink-faint)"
                  strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
              )}
            </g>
          );
        })}
      </svg>
      {/* the bars as focusable controls, laid over the plot */}
        <div className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
          {days.map((d, i) => (
            <button key={d.key} type="button" data-testid="pnl-day" data-day={d.key}
              aria-label={`${d.key}: settled ${d.settled_pnl_dollars === null ? "not sent" : usd(d.settled_pnl_dollars, true)}, ${d.rows ?? "?"} rows, won-lost-unsettled ${wlu(d)}`}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              className="h-full flex-1 outline-none focus-visible:ring-1 focus-visible:ring-accent" />
          ))}
        </div>
      </div>
      {days.length > 0 && (
        <div className="mt-1 flex justify-between font-mono text-[10.5px] text-ink-low">
          <span>{days[0].key}</span>
          {days.length > 1 && <span>{days[days.length - 1].key}</span>}
        </div>
      )}
      <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-ink-low">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-[1px] bg-up/80 align-middle" />gain</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-[1px] bg-neg/80 align-middle" />loss</span>
        {limit !== null && <span title="daily loss limit"><span className="mr-1 inline-block w-3 border-t border-dashed border-warn align-middle" />limit {usd(limit)}</span>}
      </div>
    </div>
  );
}

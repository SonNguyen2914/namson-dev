// OVERVIEW (redesign, 2026-10-07): the answers in priority order —
// SAFETY (can it trade, killed, halted), CAPITAL & RISK (money at risk,
// the day, capacity left), ATTENTION (what is wrong, aggregated), the
// NEWEST TICK (what it just did and why nothing traded), the OPEN BOOK,
// and a PERFORMANCE snapshot. Every figure is the backend's; a value it
// did not send reads "—", never 0. Account-wide and agent-only figures
// carry a class tag (ACCT / AGENT).
import type { ReactNode } from "react";
import {
  BADGES, type AttentionItem, type Severity, tickSummary,
} from "../../lib/consoleModel";
import { compLabel, isObj, liveTotals, num, str } from "../../lib/tradingConsole";
import { TradingKillLift } from "../TradingKillLift";
import { OwnerChip, bookDollars, bookPl, plTone } from "../TradingBook";
import { DailyPnlChart } from "./charts";
import {
  DASH, DecisionBadge, Dot, EmptyNote, ErrorNote, Freshness, InfoNote, Label, Metric,
  Panel, RiskBar, SubHead, Tech, agoIso, clockTime, count, numOf, pnlTone, usd, when,
} from "./primitives";
import { hrefOf } from "./route";
import type { SectionReads } from "./useConsoleData";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

const SEV: Record<Severity, { dot: "bad" | "warn" | "info"; word: string; cls: string }> = {
  critical: { dot: "bad", word: "Critical", cls: "text-neg" },
  warning: { dot: "warn", word: "Warning", cls: "text-warn" },
  info: { dot: "info", word: "Info", cls: "text-ink-mid" },
};

// ------------------------------------------------------------- safety

function SafetyCell({ label, value, state, sub, testid }: {
  label: string; value: ReactNode; state: "ok" | "warn" | "bad" | "off" | "info"; sub?: ReactNode; testid?: string;
}) {
  return (
    <div data-testid={testid} data-state={state} className="min-w-0">
      <Label>{label}</Label>
      <div className={`mt-1 flex items-center gap-2 text-[15px] font-semibold ${
        state === "bad" ? "text-neg" : state === "warn" ? "text-warn" : "text-ink-hi"}`}>
        <Dot state={state} />{value}
      </div>
      {sub && <div className="mt-0.5 text-[11.5px] leading-snug text-ink-low">{sub}</div>}
    </div>
  );
}

export function SafetyPanel({ d, now, token, bumpStatus }: {
  d: Obj; now: number; token: string; bumpStatus: () => void;
}) {
  const halt = obj(d.halt);
  const killed = d.kill === true;
  const halted = halt?.active === true;
  const day = obj(d.trading_day);
  const ip = obj(d.in_play_trading);
  const loud = killed || halted;
  return (
    <section data-testid="ops-safety" data-focus="safety" aria-labelledby="safety-h"
      className={`rounded-lg border ${loud ? "border-neg/50 bg-neg/[0.04]" : "border-tc-line-strong bg-tc-panel"}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-tc-line px-4 py-2.5">
        <h2 id="safety-h" className="text-[13px] font-semibold text-ink-hi">Safety &amp; control</h2>
        <span className="text-[11.5px] text-ink-low">
          {loud ? "Nothing is placed while this holds." : "Read from the status route; the console cannot place or stop orders."}
        </span>
      </header>
      <div className="grid gap-x-6 gap-y-4 px-4 py-3 sm:grid-cols-2 lg:grid-cols-6">
        <SafetyCell testid="safety-trading" label="Real trading"
          value={d.enabled === true ? (d.paper_only === true ? "Paper only" : "Enabled")
            : d.enabled === false ? "Disabled" : "Not stated"}
          state={d.enabled === false || d.paper_only === true ? "warn" : d.enabled === true ? "info" : "warn"}
          sub={d.paper_only === true ? (str(d.mode_banner) ?? "no real orders are sent")
            : d.enabled === false ? "TRADING_ENABLED is not true: cancel-first pass only" : "TRADING_ENABLED"} />
        <SafetyCell testid="safety-kill" label="Kill switch"
          value={killed ? "ACTIVE" : d.kill === false ? "Off" : "Not stated"}
          state={killed ? "bad" : d.kill === false ? "info" : "warn"}
          sub={killed ? <>
            {typeof d.kill_until === "string" && d.kill_until !== ""
              ? <>until {when(d.kill_until, true)} · </> : null}
            source not stated by the status route — TRADING_KILL or an operator kill
          </> : "TRADING_KILL or an operator kill"} />
        <SafetyCell testid="safety-halt" label="Loss halt"
          value={halted ? (str(halt?.reason) ?? "ACTIVE").replace(/_/g, " ") : halt?.active === false ? "None" : "Not stated"}
          state={halted ? "bad" : halt?.active === false ? "info" : "warn"}
          sub={halted ? <>since {when(halt?.since)} · re-arm: {str(halt?.rearm) ?? "not sent"}</> : "daily loss or drawdown"} />
        <SafetyCell testid="safety-env" label="Environment" value={(str(d.env) ?? "not stated").toUpperCase()}
          state="info" sub={<>strategy <Tech>{str(d.strategy) ?? DASH}</Tech></>} />
        <SafetyCell testid="safety-inplay" label="In-play trading"
          value={ip?.enabled === true ? "Enabled" : ip?.enabled === false ? "Off" : DASH}
          state={ip?.enabled === true ? "info" : "off"}
          sub={ip ? <><Tech>{str(ip.strategy) ?? "strategy not sent"}</Tech>{ip.active === true ? " · active" : ""}</> : undefined} />
        <SafetyCell testid="safety-day" label="Trading day" value={str(day?.day) ?? DASH} state="info"
          sub={day ? <>{str(day.tz) ?? "zone not sent"}{day.valid === false ? " (zone unreadable: UTC)" : ""} · ends {when(day.ends_at)}</> : undefined} />
      </div>
      <div className="grid gap-4 border-t border-tc-line px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SubHead>Operator kill</SubHead>
          <TradingKillLift token={token} onDone={bumpStatus} />
        </div>
        <div data-testid="ops-stop" className="text-[12.5px] leading-relaxed text-ink-mid">
          <SubHead>How to stop it</SubHead>
          <ul className="list-disc space-y-0.5 pl-4 marker:text-ink-faint">
            <li>
              Set <code className="font-mono text-ink-hi">TRADING_KILL=true</code> on the Railway
              backend service. The next tick places nothing.
            </li>
            <li>Or delete the agent&apos;s Kalshi API key in Kalshi&apos;s settings.</li>
          </ul>
          <p className="mt-1.5 text-[11.5px] text-ink-low">
            This console cannot place or stop anything. It changes three things: which of
            your positions the trader may manage (a take-back also cancels the
            trader&apos;s own resting orders on that market, on its next tick), the
            careful strategy&apos;s per-competition switch (off = paper only), and
            &ldquo;Lift operator kill&rdquo;, which ends an operator kill set through the
            backend&apos;s kill route. It cannot lift TRADING_KILL on Railway.
          </p>
        </div>
      </div>
      <span className="sr-only">checked {agoIso(d.generated_at, now) ?? DASH} ago</span>
    </section>
  );
}

// ------------------------------------------------------ capital & risk

function DailyBudget({ d }: { d: Obj }) {
  const b = obj(d.daily_budget);
  if (!b || b.used === undefined) {
    return (
      <div data-testid="careful-budget-absent">
        <Label>Daily budget</Label>
        <p className="mt-1 text-[12px] text-ink-low">not served yet — this backend sends no daily budget</p>
      </div>
    );
  }
  if (b.readable === false) {
    return (
      <div data-testid="careful-budget">
        <Label>Daily budget</Label>
        <p className="mt-1 text-[12px] text-warn">◆ unreadable — {str(b.why) ?? "no reason sent"}</p>
      </div>
    );
  }
  return (
    <div data-testid="careful-budget">
      <RiskBar label="Daily budget" cls="agent" used={b.used} limit={b.limit} gainAware={false}
        sub={<>
          <span className="tc-num">remaining <span className={numOf(b.remaining) !== null && numOf(b.remaining)! <= 0 ? "text-warn" : "text-ink-hi"}>{usd(b.remaining)}</span></span>
          {" · "}realised (net) {usd(b.realised)} · open {usd(b.open_positions)} · resting {usd(b.resting_orders)}
          <span className="block text-ink-faint">
            every new order must fit with its own worst case · day {str(b.trading_day) ?? DASH} {str(b.trading_day_tz) ?? ""}
            {(numOf(b.refused_today) ?? 0) > 0 ? ` · ${count(b.refused_today)} refused today` : ""}
          </span>
        </>} />
    </div>
  );
}

function KickoffHours({ d }: { d: Obj }) {
  const c = obj(d.careful);
  const usage = obj(obj(c?.tick)?.usage);
  if (!usage) return null;
  const hours = Object.entries(obj(usage.hour) ?? {});
  const cap = numOf(usage.hour_max);
  const worst = hours.reduce<[string, number] | null>((m, [h, v]) => {
    const x = numOf(v);
    return x !== null && (!m || x > m[1]) ? [h, x] : m;
  }, null);
  return (
    <div>
      <RiskBar label="Busiest kickoff hour" cls="agent" used={worst ? worst[1] : 0} limit={usage.hour_max} gainAware={false}
        sub={worst ? `kickoff ${when(worst[0])} · per-hour cap (CAREFUL_HOUR_MAX)` : "nothing at risk in any kickoff hour"} />
      {hours.length > 0 && (
        <ul data-testid="careful-hours" className="mt-1.5 grid gap-x-4 text-[11.5px] sm:grid-cols-2">
          {hours.map(([h, v]) => (
            <li key={h} className="flex justify-between gap-2 border-b border-tc-line py-0.5">
              <span className="text-ink-low">{when(h)}</span>
              <span className={`tc-num ${cap !== null && (numOf(v) ?? 0) >= cap * 0.8 ? "text-warn" : "text-ink-hi"}`}>
                {usd(v)} / {usd(usage.hour_max)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CapitalPanel({ d, now, stale, statusAt }: { d: Obj; now: number; stale: boolean; statusAt: number }) {
  const pnl = obj(d.pnl) ?? {};
  const daily = obj(d.daily_loss) ?? {};
  const dd = obj(d.drawdown) ?? {};
  const play = obj(d.in_play) ?? {};
  const dayUsed = numOf(daily.used);
  return (
    <Panel testid="ops-money" title="Capital & risk"
      meta={<>account read {agoIso(d.account_read_at, now) ? `${agoIso(d.account_read_at, now)} ago` : DASH}{stale ? <span className="text-warn"> · status stale, {Math.round((now - statusAt) / 1000)} s old</span> : null}</>}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        <Metric size="lg" label="Cash" cls="account" value={usd(d.balance)}
          sub={`read ${when(d.account_read_at)}`} />
        <Metric size="lg" label="Marked equity" cls="account" value={usd(d.marked_equity)}
          sub={`bankroll cap ${usd(d.bankroll_cap)}`} />
        <Metric size="lg" label="Agent P&L" cls="agent" value={usd(pnl.agent_total, true)}
          tone={pnlTone(pnl.agent_total)} sub={<>since start <span className={`tc-num ${pnlTone(pnl.agent_since_start)}`}>{usd(pnl.agent_since_start, true)}</span></>} />
        <Metric size="lg" label="Today (halt measure)" cls="agent"
          value={dayUsed === null ? DASH : usd(-dayUsed, true)} tone={dayUsed === null ? "text-ink-hi" : pnlTone(-dayUsed)}
          sub="the day's loss as the daily halt measures it, signed as a result" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-tc-line pt-3 md:grid-cols-4">
        <Metric size="sm" label="Realized, open markets" cls="account" value={usd(pnl.realized_total, true)}
          sub="Kalshi's figure, manual trades included" />
        <Metric size="sm" label="In play (at cost)" cls="agent" value={usd(play.cost)}
          sub={`${count(play.positions)} positions · live ${usd(play.live_mark_total)}`} />
        <Metric size="sm" label="Open orders" value={`${count(d.open_agent_orders)} agent · ${count(d.open_other_orders)} manual`}
          sub={`${count(d.placed_today)} placed · ${count(d.fills_today)} fills today`} />
        <Metric size="sm" label="Risk read" value={when(d.risk_at ?? d.account_at, true)} sub="the tick that measured the limits" />
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-4 border-t border-tc-line pt-3 md:grid-cols-2">
        <RiskBar testid="meter-risk" label="Total at risk" cls="agent" used={d.total_at_risk} limit={d.total_limit}
          gainAware={false} sub="worst-case exposure of the agent's positions and orders" />
        <DailyBudget d={d} />
        <RiskBar testid="meter-daily" label="Daily loss (halt)" cls="agent" used={daily.used} limit={daily.limit}
          sub="halts trading for the day at the limit" />
        <RiskBar testid="meter-drawdown" label="Drawdown" cls="agent" used={dd.used} limit={dd.limit}
          sub="halts until TRADING_REARM_TOKEN changes" />
        <KickoffHours d={d} />
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------ attention

export function AttentionPanel({ items, go }: {
  items: AttentionItem[]; go: (v: string, p?: Record<string, string>) => void;
}) {
  const crit = items.filter((i) => i.severity === "critical").length;
  const warn = items.filter((i) => i.severity === "warning").length;
  const info = items.length - crit - warn;
  return (
    <Panel testid="ops-attention" id="attention" title="Attention"
      meta={<span className="tc-num">{crit ? <span className="text-neg">{crit} critical · </span> : null}{warn ? <span className="text-warn">{warn} warning · </span> : null}{info} info</span>}
      bodyClass="px-1 py-1">
      <div data-focus="attention" />
      {items.length === 0 ? (
        <p data-testid="attention-none" className="px-3 py-3 text-[12.5px] text-ink-low">
          Nothing needs attention. Checked: kill, halt, trading switch, ticks, feed, cool-downs, catalogue,
          settlement and fill reads, hand-over, careful data errors, and every read this console makes.
        </p>
      ) : (
        <ul className="divide-y divide-tc-line">
          {items.map((a) => {
            const s = SEV[a.severity];
            const body = (
              <>
                <span className="mt-[5px]"><Dot state={s.dot} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`text-[12.5px] leading-snug ${a.severity === "info" ? "text-ink-hi" : s.cls}`}>
                      <span className="sr-only">{s.word}: </span>{a.title}
                    </span>
                    {a.count !== undefined && a.count !== null && (
                      <span className="tc-num shrink-0 text-[12.5px] text-ink-hi">{a.count.toLocaleString("en-US")}</span>
                    )}
                  </span>
                  <span className="block text-[11px] leading-snug text-ink-low">
                    {a.subsystem}{a.detail ? ` · ${a.detail}` : ""}{a.at ? ` · ${when(a.at)}` : ""}
                  </span>
                </span>
                {a.link && <span aria-hidden className="mt-[2px] text-[11px] text-ink-faint">→</span>}
              </>
            );
            return (
              <li key={a.id} data-testid="attention-item" data-severity={a.severity} data-id={a.id}>
                {a.link ? (
                  <a href={hrefOf(a.link.view, a.link.params)}
                    onClick={(e) => { e.preventDefault(); go(a.link!.view, a.link!.params); }}
                    className="flex gap-2.5 rounded-md px-3 py-2 outline-none transition-colors hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent">
                    {body}
                  </a>
                ) : <div className="flex gap-2.5 px-3 py-2">{body}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// --------------------------------------------------------- newest tick

function Funnel({ steps }: { steps: { label: string; n: number | null; title?: string }[] }) {
  return (
    <ol className="flex flex-wrap items-stretch gap-y-2">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center" title={s.title}>
          <div className="min-w-[78px] pr-3">
            <div className="tc-num text-[16px] font-medium text-ink-hi">{s.n === null ? DASH : s.n.toLocaleString("en-US")}</div>
            <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink-low">{s.label}</div>
          </div>
          {i < steps.length - 1 && <span aria-hidden className="pr-3 text-ink-faint">›</span>}
        </li>
      ))}
    </ol>
  );
}

export function LatestTick({ d, reads, now, go }: {
  d: Obj; reads: SectionReads; now: number; go: (v: string, p?: Record<string, string>) => void;
}) {
  const c = reads.candidates.last?.data ?? null;
  const t = tickSummary(d, c);
  const u = obj(d.universe);
  const ct = obj(obj(d.careful)?.tick);
  const r = reads.candidates.read;
  return (
    <Panel testid="ops-tick" title="Newest tick"
      meta={<span className="tc-num">{t.at ? <>{clockTime(t.at)} · {agoIso(t.at, now)} ago</> : "no tick on record"}{t.elapsed_s !== null ? ` · took ${t.elapsed_s.toFixed(1)} s` : ""}{t.outcome ? <> · outcome <Tech>{t.outcome}</Tech></> : null}</span>}
      actions={<a href={hrefOf("trading")} onClick={(e) => { e.preventDefault(); go("trading"); }}
        className="text-[12px] text-ink-mid outline-none hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent">Candidates →</a>}>
      <div className="space-y-4">
        <div>
          <SubHead right="the catalogue, as the tick read it">Coverage</SubHead>
          {u ? (
            <Funnel steps={[
              { label: "known", n: num(u.known) }, { label: "in scope", n: num(u.in_scope) },
              { label: "priced", n: num(u.priced) }, { label: "eligible", n: num(u.eligible) }]} />
          ) : <InfoNote>no coverage block on record</InfoNote>}
        </div>
        <div>
          <SubHead right={c ? <Freshness at={reads.candidates.last!.at} now={now} cadenceMs={reads.candidates.cadenceMs} /> : undefined}>Decisions this tick</SubHead>
          {r.kind === "unavailable" ? <InfoNote>Candidates not available on this backend.</InfoNote>
            : r.kind === "error" || r.kind === "refused" ? <InfoNote tone="warn">◆ the candidates read failed — see Attention</InfoNote>
              : !c ? <InfoNote>reading the candidates…</InfoNote> : (
                <>
                  <Funnel steps={[
                    { label: "considered", n: t.considered, title: "markets the tick considered" },
                    { label: "decided", n: c.decided, title: "markets a strategy decided on" },
                    { label: "in snapshot", n: t.shown, title: "rows in the bounded snapshot" },
                    { label: "placed", n: t.placed }]} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(t.byBadge).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                      <button key={k} type="button" onClick={() => go("trading", { decision: k })}
                        className="flex items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent">
                        <DecisionBadge testid="tick-badge" badge={BADGES[k] ?? BADGES.unknown} />
                        <span className="tc-num text-[12px] text-ink-hi">{n}</span>
                      </button>
                    ))}
                  </div>
                  {t.zero && <p data-testid="tick-zero" className="mt-2 text-[12.5px] leading-snug text-ink-mid">{t.zero}</p>}
                </>
              )}
        </div>
        {ct && (
          <div>
            <SubHead right="the careful strategy's gate">Careful gate</SubHead>
            <Funnel steps={[
              { label: "candidates", n: num(ct.candidates) }, { label: "qualifying", n: num(ct.qualifying) },
              { label: "funded", n: num(ct.funded) }, { label: "paper rows", n: num(ct.paper_rows) }]} />
            <p className="mt-1 text-[11.5px] text-ink-low">
              swaps {count(ct.swaps)} · edges above the ceiling{" "}
              <span className={(num(ct.data_errors) ?? 0) > 0 ? "text-warn" : "text-ink-hi"}>{count(ct.data_errors)}</span>{" "}
              (probable data errors, never bet){d.paper_only === true ? " · PAPER ONLY: nothing real is sent" : ""}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------ the book

export function BookSnapshot({ reads, now, go }: {
  reads: SectionReads; now: number; go: (v: string, p?: Record<string, string>) => void;
}) {
  const src = reads.book;
  const book = src.last?.data ?? null;
  const live = book ? liveTotals(book.positions.map((p) => p.live)) : null;
  const agentOrders = book ? book.orders.filter((o) => o.owner === "trader").length : 0;
  return (
    <Panel testid="ops-book-snapshot" title="Open positions & orders"
      meta={book ? <Freshness at={src.last!.at} now={now} cadenceMs={src.cadenceMs} failed={src.read.kind === "error"} /> : undefined}
      actions={<a href={hrefOf("portfolio")} onClick={(e) => { e.preventDefault(); go("portfolio"); }}
        className="text-[12px] text-ink-mid outline-none hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent">Portfolio →</a>}>
      {src.read.kind === "unavailable" ? <InfoNote>Book not available on this backend.</InfoNote>
        : src.read.kind === "error" && !book ? <ErrorNote tone="warn">Could not read account positions (HTTP {src.read.status}) — {src.read.detail}</ErrorNote>
          : src.read.kind === "refused" ? <ErrorNote>token rejected — the backend refused the book read</ErrorNote>
            : !book ? <InfoNote>reading the book…</InfoNote> : (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
                  <Metric size="md" label="Positions" value={count(book.totals.positions)}
                    sub={`agent manages ${book.totals.managed} · manual ${book.totals.manual} contracts`} />
                  <Metric size="md" label="Resting orders" value={count(book.totals.orders)}
                    sub={`${agentOrders} agent · ${book.orders.length - agentOrders} manual`} />
                  <Metric size="md" label="Live value" value={live?.value === null || !live ? DASH : bookDollars(live.value)}
                    sub={live ? `${live.marked} of ${book.positions.length} with a live mark` : undefined} />
                  <Metric size="md" label="Unrealised" value={live ? bookPl(live.unrealised) : DASH}
                    tone={live ? plTone(live.unrealised).replace("text-ink-mid", "text-ink-hi") : "text-ink-hi"}
                    sub="display only — halts count in-play at cost" />
                </div>
                {book.positions.length === 0 ? (
                  <div className="mt-3"><EmptyNote>No open positions{book.totals.notListedPositions > 0 ? " on markets the trader tracks" : ""}.</EmptyNote></div>
                ) : (
                  <div className="tc-scroll mt-3 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
                      <thead>
                        <tr className="text-left">
                          {["market", "side", "owner", "live value", "unrealised"].map((h, i) => (
                            <th key={h} scope="col" className={`border-b border-tc-line px-2 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low first:pl-0 ${i >= 3 ? "text-right" : ""}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {book.positions.slice(0, 6).map((p) => (
                          <tr key={`${p.ticker}|${p.side}`} data-testid="ov-position">
                            <td className="max-w-[280px] border-b border-tc-line py-1.5 pr-2">
                              <span className="block truncate text-ink-hi" title={p.title}>{p.title}</span>
                              <span className="block text-[11px] text-ink-low">{p.competition ? compLabel(p.competition) : DASH}{p.in_play ? <span className="text-live"> · in play</span> : null}</span>
                            </td>
                            <td className="border-b border-tc-line px-2 py-1.5 font-medium uppercase text-ink-hi">{p.side}</td>
                            <td className="border-b border-tc-line px-2 py-1.5">
                              <span className="flex flex-wrap gap-1">
                                {p.own > 0 && <OwnerChip tone="trader" n={p.own} />}
                                {p.handed_over > 0 && <OwnerChip tone="handed" n={p.handed_over} />}
                                {p.manual > 0 && <OwnerChip tone="yours" n={p.manual} />}
                              </span>
                            </td>
                            <td className="tc-num border-b border-tc-line px-2 py-1.5 text-right text-ink-hi">{bookDollars(p.live.live_value_dollars)}</td>
                            <td className={`tc-num border-b border-tc-line py-1.5 pl-2 text-right ${plTone(p.live.unrealised_pl_dollars)}`}>{bookPl(p.live.unrealised_pl_dollars)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {book.positions.length > 6 && (
                      <p className="mt-1.5 text-[11.5px] text-ink-low">and {book.positions.length - 6} more — Portfolio has them all</p>
                    )}
                  </div>
                )}
                {book.pending && book.pending.filter((q) => q.status === "queued").length > 0 && (
                  <p className="mt-2 text-[12px] text-ink-mid">
                    {book.pending.filter((q) => q.status === "queued").length} hand-over(s) queued for the next live price
                  </p>
                )}
              </>
            )}
    </Panel>
  );
}

// ------------------------------------------------------- performance

export function PerformanceSnapshot({ reads, now, go, limit }: {
  reads: SectionReads; now: number; go: (v: string, p?: Record<string, string>) => void; limit: number | null;
}) {
  const src = reads.ledger;
  const l = src.last?.data ?? null;
  const t = l?.summary?.totals ?? null;
  const days = (l?.summary?.by_day ?? []).slice().sort((a, b) => a.key.localeCompare(b.key)).slice(-21);
  const filtered = Object.values(src.filters).some((v) => v !== "");
  const wlu = t ? `${t.won ?? "?"}–${t.lost ?? "?"}–${t.unsettled ?? "?"}` : DASH;
  return (
    <Panel testid="ops-perf-snapshot" title="Performance snapshot"
      meta={<>{l ? <Freshness at={src.last!.at} now={now} cadenceMs={src.cadenceMs} /> : null}{filtered ? <span className="text-warn"> · ledger filters active</span> : null}</>}
      actions={<a href={hrefOf("performance")} onClick={(e) => { e.preventDefault(); go("performance"); }}
        className="text-[12px] text-ink-mid outline-none hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent">Performance →</a>}>
      {src.read.kind === "unavailable" ? <InfoNote>Trades &amp; grounds not available on this backend.</InfoNote>
        : !l ? (src.read.kind === "error" ? <ErrorNote tone="warn">Could not read the ledger (HTTP {src.read.status}) — {src.read.detail}</ErrorNote>
          : <InfoNote>reading the ledger…</InfoNote>)
          : !t ? <InfoNote>the ledger summary was not sent</InfoNote> : (
            <div className="grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3 self-start">
                <Metric size="md" label="Settled P&L" cls="agent" value={usd(t.settled_pnl_dollars, true)} tone={pnlTone(t.settled_pnl_dollars)}
                  sub={`over ${t.won !== null && t.lost !== null ? t.won + t.lost : "?"} settled`} />
                <Metric size="md" label="W–L–U" value={wlu} sub="won · lost · unsettled" />
                <Metric size="md" label="Fees" value={usd(t.fees_dollars)} sub={`filled cost ${usd(t.cost_dollars)}`} />
                <Metric size="sm" label="Orders" value={count(t.orders)} sub={`${count(t.filled)} filled · ${count(t.not_filled)} not`} />
                <Metric size="sm" label="Open cost" value={usd(t.open_cost_dollars)} sub="filled, unsettled" />
                <Metric size="sm" label="Rows" value={count(t.rows)} sub="orders and hand-overs" />
              </div>
              <div>
                {days.length ? <DailyPnlChart days={days} limit={l.summary?.daily_loss_limit_dollars ?? limit} height={120} />
                  : <InfoNote>no day in this window</InfoNote>}
              </div>
            </div>
          )}
      <p className="mt-2 text-[11px] text-ink-faint">
        The trader&apos;s own orders and handed-over contracts only. A small sample: no figure here is evidence of an edge.
      </p>
    </Panel>
  );
}

// -------------------------------------------------------------- view

export function Overview({ d, now, token, reads, attention, bumpStatus, go, statusStale, statusAt }: {
  d: Obj; now: number; token: string; reads: SectionReads; attention: AttentionItem[];
  bumpStatus: () => void; go: (v: string, p?: Record<string, string>) => void;
  statusStale: boolean; statusAt: number;
}) {
  const limit = numOf(obj(d.daily_loss)?.limit);
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12"><SafetyPanel d={d} now={now} token={token} bumpStatus={bumpStatus} /></div>
      <div className="col-span-12 xl:col-span-8"><CapitalPanel d={d} now={now} stale={statusStale} statusAt={statusAt} /></div>
      <div className="col-span-12 xl:col-span-4"><AttentionPanel items={attention} go={go} /></div>
      <div className="col-span-12 xl:col-span-5"><LatestTick d={d} reads={reads} now={now} go={go} /></div>
      <div className="col-span-12 xl:col-span-7"><BookSnapshot reads={reads} now={now} go={go} /></div>
      <div className="col-span-12"><PerformanceSnapshot reads={reads} now={now} go={go} limit={limit} /></div>
    </div>
  );
}

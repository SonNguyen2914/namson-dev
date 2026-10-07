// IN PLAY, inside Trading (2026-10-06 "Show why it skips"; redesigned
// 2026-10-07). The status route's in-play block: whether in-play trading is
// on and active, the live feed, legs, cool-downs, orders, settled P&L and
// mean CLV; the day's in-play skips and refusals per reason in the
// backend's plain words (largest first, the code beside them); every focus
// competition as an in-play row; the shocks by kind; in-play v2's entries,
// exits and learner arms. A field the backend does not send reads "not
// served yet", never 0. The strategy that RAN is drawn (a backend that
// labels it v1 while its v2 block ran v2 is drawn as v2, the lag said).
//
// NO EVENT STREAM IS INVENTED: the status route serves shocks as counts
// by kind for the day, not as timed events, so they are drawn as counts.
import {
  NOT_SERVED, type ReasonsBlock, compLabel, inPlayByCompetition, inPlayReasons,
  inPlayStrategy, isObj, num, type Candidates,
} from "../../lib/tradingConsole";
import { decisionBadge } from "../../lib/consoleModel";
import {
  DASH, DecisionBadge, InfoNote, Metric, Panel, SimpleTable, SubHead, TH, Tech, count, numOf,
  pnlTone, usd, when,
} from "./primitives";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);
const flag = (v: unknown) => (v === true ? "yes" : v === false ? "no" : DASH);
const cents = (v: unknown) => {
  const n = numOf(v);
  return n === null ? DASH : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}¢`;
};
const nOf = (v: unknown, one: string) => `${count(v)} ${one}${numOf(v) === 1 ? "" : "s"}`;

function Reasons({ block, testid, empty }: { block: ReasonsBlock; testid: string; empty: string }) {
  if ("notServed" in block) {
    return <p data-testid={testid} data-served="false" className="text-[12px] text-ink-low">{block.notServed}</p>;
  }
  if (block.rows.length === 0) {
    return <p data-testid={testid} className="text-[12px] text-ink-low">{empty}</p>;
  }
  const max = Math.max(1, ...block.rows.map((r) => r.n ?? 0));
  return (
    <div className="tc-scroll overflow-x-auto">
      <table data-testid={testid} className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th scope="col" className={`${TH} pl-0 text-left`}>reason</th>
            <th scope="col" className={`${TH} pr-0 text-right`}>count</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r) => (
            <tr key={r.code} data-testid="inplay-reason-row" data-code={r.code} data-words={r.from}>
              <td className="border-b border-tc-line py-1.5 pr-3 align-top">
                <span className="block break-words leading-snug text-ink-hi">{r.words}</span>
                <span className="block break-all font-mono text-[10.5px] text-ink-low">{r.code}</span>
                <span aria-hidden className="mt-1 block h-[3px] rounded-full bg-tc-raised">
                  <span className="block h-full rounded-full bg-ink-mid/50" style={{ width: `${((r.n ?? 0) / max) * 100}%` }} />
                </span>
              </td>
              <td data-testid="inplay-reason-count" className="tc-num border-b border-tc-line py-1.5 text-right align-top text-ink-hi">
                {count(r.n)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByComp({ v }: { v: unknown }) {
  const b = inPlayByCompetition(v);
  return (
    <>
      {b.failed && <p className="mb-1 text-[12px] text-warn">◆ the per-competition in-play counts failed on the backend: {b.failed}</p>}
      <div className="tc-scroll overflow-x-auto">
        <table data-testid="inplay-by-comp" data-served={b.served} className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              {["competition", "legs", "skipped", "refused", "placed"].map((h, i) => (
                <th key={h} scope="col" className={`${TH} first:pl-0 last:pr-0 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r) => (
              <tr key={r.competition} data-testid="inplay-comp-row" data-comp={r.competition}>
                <td className="border-b border-tc-line py-1.5 pr-3 text-left text-ink-hi">{r.label}</td>
                {r.counts === null ? (
                  <td colSpan={4} className="border-b border-tc-line py-1.5 pl-3 text-right text-ink-low">{NOT_SERVED}</td>
                ) : (
                  [r.counts.legs, r.counts.skipped, r.counts.refused, r.counts.placed].map((n, i) => (
                    <td key={i} className={`tc-num border-b border-tc-line py-1.5 pl-3 text-right ${n === null ? "text-ink-low" : n === 0 ? "text-ink-low" : "text-ink-hi"}`}>
                      {n === null ? NOT_SERVED : n.toLocaleString("en-US")}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** THE LEARNER'S ARMS IN USE, if the backend sends them — in the route's
 *  shape `{at, <phase>: {competition: {"w/threshold": markets}}}` and in two
 *  simpler ones. Drawn as sent; absent, nothing is claimed. */
export function ArmsInUse({ v, testid, title }: { v: unknown; testid: string; title: string }) {
  if (v === undefined || v === null) return null;
  let rows: (string | number)[][] = [];
  let error: string | null = null;
  const o = obj(v);
  const phased = o !== null && Object.entries(o).some(([k, x]) =>
    k !== "at" && k !== "error" && obj(x) !== null
    && Object.values(obj(x)!).every((y) => obj(y) !== null));
  if (o && typeof o.error === "string") error = o.error;
  const text = (x: unknown) => (x === null || x === undefined || x === "" ? DASH : typeof x === "string" ? x : String(x));
  if (Array.isArray(v)) {
    rows = v.map((a) => {
      const r = obj(a) ?? {};
      const arm = Array.isArray(r.arm) ? r.arm : null;
      const ctx = Array.isArray(r.context) ? r.context.map(text).join(" · ") : text(r.context ?? r.competition);
      return [ctx, `w ${text(r.w ?? arm?.[0])} · t ${text(r.threshold ?? arm?.[1])}`, count(r.count ?? r.ticks ?? r.n)];
    });
  } else if (o && phased) {
    for (const [phase, byComp] of Object.entries(o)) {
      const bc = obj(byComp);
      if (phase === "at" || phase === "error" || !bc) continue;
      for (const [comp, arms] of Object.entries(bc)) {
        for (const [label, n] of Object.entries(obj(arms) ?? {})) {
          rows.push([`${phase.replace(/_/g, "-")} · ${compLabel(comp)}`, label, count(n)]);
        }
      }
    }
  } else if (o) {
    rows = Object.entries(o).filter(([k, a]) => k !== "at" && k !== "error" && a !== null && a !== undefined)
      .map(([k, a]) => {
        const r = obj(a);
        return [k, r ? `w ${text(r.w)} · t ${text(r.threshold)}` : text(a), r ? count(r.count ?? r.ticks ?? r.n) : DASH];
      });
  }
  return (
    <div className="mt-4">
      <SubHead>{title}</SubHead>
      {error && <p className="mb-1 text-[12px] text-warn">◆ the arms read failed on the backend: {error}</p>}
      <SimpleTable testid={testid} head={["phase · competition", "arm (w/threshold)", "markets"]}
        rows={rows.map((r) => [r[0], <Tech key="a" tone="text-ink-hi">{String(r[1])}</Tech>, r[2]])}
        right={[2]} empty="no arm was drawn on the newest tick" />
    </div>
  );
}

function V2({ v, now }: { v: Obj | null; now: number }) {
  void now;
  if (!v) return <p data-testid="inplay-v2-absent" className="text-[12px] text-ink-low">in-play v2 is not on this backend</p>;
  return (
    <div data-testid="inplay-v2">
      {typeof v.error === "string" && <p className="mb-2 text-[12px] text-warn">◆ the in-play v2 summary failed on the backend: {v.error}</p>}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 2xl:grid-cols-5">
        <Metric size="sm" label="v2 enabled" value={flag(v.enabled)} sub={<>strategy <Tech>{typeof v.strategy === "string" ? v.strategy : DASH}</Tech></>} />
        <Metric size="sm" label="v2 active" value={flag(v.active)} sub={`as of ${when(v.at, true)}`} />
        <Metric size="sm" label="legs with a live-stat read" value={count(v.informed_available_legs)}
          sub={`mean w ${numOf(v.w_mean) === null ? DASH : numOf(v.w_mean)!.toFixed(2)}`} />
        <Metric size="sm" label="pressure entries today" value={`${count(v.entries_placed_today)} placed`}
          sub={`${count(v.entries_cancelled_today)} cancelled`} />
        <Metric size="sm" label="exits placed today" value={count(v.exits_placed_today)} />
        <Metric size="sm" label="protective exits today" value={`${count(v.protective_exits_placed_today)} placed`}
          sub={`${count(v.protective_exits_refused_today)} refused · ${count(v.protective_exits_cancelled_today)} cancelled`} />
        <Metric size="sm" label="+5-min marks today" value={count(v.marks_today)} sub="journal only" />
        <Metric size="sm" label="mean in-play CLV" cls="learning" value={cents(v.mean_inplay_clv_c)} sub={nOf(v.inplay_clv_rewards, "reward")} />
        <Metric size="sm" label="mean exit reward" cls="learning" value={cents(v.mean_exit_reward_c)}
          sub={`${nOf(v.exit_rewards, "reward")} · P&L rewards ${count(v.pnl_rewards)}`} />
        {"anchor_rewards" in v && (
          <Metric size="sm" label="mean anchor reward" cls="learning" value={cents(v.mean_anchor_reward_c)}
            sub={`${nOf(v.anchor_rewards, "reward")} · w on our forecast, learned`} />
        )}
      </div>
      <ArmsInUse v={v.arms_in_use} testid="inplay-v2-arms" title="In-play arms in use on the newest tick (entry, exit, anchor)" />
    </div>
  );
}

export function InPlayPanel({ d, now, candidates }: { d: Obj; now: number; candidates: Candidates | null }) {
  const p = obj(d.in_play) ?? {};
  const t = obj(d.in_play_trading) ?? {};
  const tp = obj(t.pnl) ?? {};
  const shocks = Object.entries(obj(t.shocks_today) ?? {})
    .map(([k, n]) => [k, num(n) ?? 0] as [string, number]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const strat = inPlayStrategy(t);
  const v2 = obj(t.v2);
  const gaps = obj(t.feed_gaps);
  const liveRows = (candidates?.rows ?? []).filter((r) => r.minute !== null || r.inplay !== null || r.phase === "in_play");
  return (
    <div data-testid="ops-inplay" className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <Panel title="In-play trading"
          meta={<>strategy <span data-testid="inplay-strategy" className="font-mono text-ink-hi">{strat.label ?? NOT_SERVED}</span>
            {" · "}as of {when(t.at, true)} · experimental, unproven</>}>
          {strat.lag && (
            <p data-testid="inplay-strategy-note" className="mb-3 text-[12px] text-warn">
              ◆ this backend&apos;s status labels in-play trading &ldquo;{strat.sent ?? "nothing"}&rdquo;, but its in-play v2 block
              says the newest in-play tick ran {strat.label}
            </p>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 2xl:grid-cols-8">
            <Metric size="md" label="enabled" value={flag(t.enabled)} sub="TRADING_INPLAY_ENABLED" />
            <Metric size="md" label="active" value={flag(t.active)} sub={<>outcome <Tech>{typeof t.outcome === "string" ? t.outcome : DASH}</Tech></>} />
            <Metric size="md" label="live feed" value={t.feed_healthy === true ? "healthy" : t.feed_healthy === false ? "unhealthy" : DASH}
              tone={t.feed_healthy === false ? "text-warn" : "text-ink-hi"}
              sub={`available ${flag(t.feed_available)} · ${count(t.feed_subscriptions)} subscriptions`} />
            <Metric size="md" label="legs in play" value={count(t.legs_in_play)} sub={`${count(t.candidates)} candidates · ${count(t.order_failed)} failed`} />
            <Metric size="md" label="cool-downs" value={count(t.cooldowns_active)}
              tone={(numOf(t.cooldowns_active) ?? 0) > 0 ? "text-warn" : "text-ink-hi"}
              sub={`global ${flag(t.global_cooldown)} · ${count(t.fixtures_cooling)} fixtures cooling`} />
            <Metric size="md" label="orders open" value={count(t.orders_open)} sub={`${count(t.placed_today)} placed · ${count(t.cancelled_today)} cancelled today`} />
            <Metric size="md" label="settled P&L" cls="agent" value={usd(tp.settled, true)} tone={pnlTone(tp.settled)}
              sub={`cost ${usd(tp.cost)} · share ${tp.share_of_agent_pnl ?? DASH}`} />
            <Metric size="md" label="mean in-play CLV" cls="learning" value={cents(v2?.mean_inplay_clv_c)}
              sub={v2 ? nOf(v2.inplay_clv_rewards, "reward") : "in-play v2 not served"} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-tc-line pt-3 md:grid-cols-4">
            <Metric size="sm" label="positions in play" cls="agent" value={count(p.positions)} sub={`marked ${count(p.marked)} · unmarked ${count(p.unmarked)}`} />
            <Metric size="sm" label="their cost" value={usd(p.cost)} sub="the halts count them at cost until they settle" />
            <Metric size="sm" label="live mark total" value={usd(p.live_mark_total)} sub="display only" />
            <Metric size="sm" label="last live update" value={when(p.last_live_update_at, true)} />
          </div>
          {gaps && (
            <p className="mt-3 text-[12px] text-ink-low">
              feed gaps since the tick before:{" "}
              {Object.entries(gaps).map(([k, n]) => `${k.replace(/_/g, " ")} ${count(n)}`).join(" · ")}
            </p>
          )}
        </Panel>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <Panel title="Why in-play legs were skipped today" meta="journal episodes, not ticks">
          <Reasons testid="inplay-skips" block={inPlayReasons(t.v2, "skipped_by_reason_today", "skips")}
            empty="no in-play skips recorded today" />
        </Panel>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <Panel title="Refused by the risk engine in play today">
          <Reasons testid="inplay-refusals" block={inPlayReasons(t.v2, "refused_by_reason_today", "refusals")}
            empty="no in-play refusals recorded today" />
        </Panel>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <Panel title="In play, every competition" meta={typeof t.by_competition_basis === "string" ? "the newest tick" : undefined}>
          <ByComp v={t.by_competition} />
        </Panel>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <Panel title="Live legs in the candidate snapshot" meta={candidates ? `${liveRows.length} of ${candidates.rows.length} rows` : undefined}>
          {liveRows.length === 0 ? <InfoNote>{candidates ? "No in-play row in the newest candidate snapshot." : "The candidates are not read yet."}</InfoNote> : (
            <SimpleTable head={["market", "minute", "decision", "reason"]} right={[1]}
              rows={liveRows.slice(0, 12).map((r) => [r.title, r.minute === null ? "in play" : `${r.minute}′`,
                <DecisionBadge key="b" badge={decisionBadge(r.decision)} testid="live-leg-badge" />, <Tech key="c">{r.decision.reason ?? DASH}</Tech>])}
              empty="none" />
          )}
          <SubHead>Shocks today, by kind</SubHead>
          <SimpleTable testid="shocks" head={["kind", "count"]} right={[1]}
            rows={shocks.map(([k, n]) => [k, n])} empty="no shocks today" />
          <p className="mt-1 text-[11px] text-ink-faint">The status route serves shocks as counts by kind; per-event times are not served.</p>
        </Panel>
      </div>
      <div className="col-span-12">
        <Panel title="In-play v2 · live stats, pressure entries, protective exits" meta="experimental, unproven">
          <V2 v={v2} now={now} />
        </Panel>
      </div>
    </div>
  );
}

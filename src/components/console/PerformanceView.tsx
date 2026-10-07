// PERFORMANCE (redesign, 2026-10-07): the ledger's own summary, drawn to
// answer questions — settled P&L over days against the daily loss line,
// by competition (ranked), by market type, by phase, by price band and by
// the edge the trader estimated at placement (does a larger estimated edge
// go with better results? — read with the sample beside every number).
//
// Never an average without its sample; never a word of confidence the
// data does not carry. CLV by market type, phase or model-only is not
// served by any route (the learner serves it per competition — Model), so
// it is said to be absent rather than drawn.
import { useMemo } from "react";
import {
  type Bucket, type DayBucket, compLabel, edgeBucketWords, familyWords, phaseWords,
  priceBucketWords, signedDollars,
} from "../../lib/tradingLedger";
import { FOCUS_COMPETITIONS } from "../../lib/tradingConsole";
import { DailyPnlChart } from "./charts";
import {
  BarList, ErrorNote, Freshness, Info, InfoNote, Metric, Panel, TH, ago, count, usd,
} from "./primitives";
import type { LedgerSource } from "./useConsoleData";
import type { SumItem } from "./collapse";
import { freshItem, items as line, plain, readItem, warn } from "./summaries";

/** a breakdown's folded line: its rows and its best and worst settled */
function groupSum(groups: Bucket[] | null, label: (k: string) => string): SumItem[] {
  if (groups === null) return [plain("not sent")];
  if (groups.length === 0) return [plain("none in this window")];
  const by = [...groups].sort((a, b) => (b.settled_pnl_dollars ?? 0) - (a.settled_pnl_dollars ?? 0));
  return [plain(`${groups.length} rows`), plain(`top: ${label(by[0].key)} ${signedDollars(by[0].settled_pnl_dollars)}`)];
}

const plTone = (n: number | null) => (n === null || n === 0 ? "text-ink-mid" : n > 0 ? "text-up" : "text-neg");
function wlu(b: Bucket): string {
  if (b.won === null && b.lost === null && b.unsettled === null) return "not recorded";
  const c = (n: number | null) => (n === null ? "?" : String(n));
  return `${c(b.won)}–${c(b.lost)}–${c(b.unsettled)}`;
}

/** ONE DAY'S SETTLED P&L AS A BAR, zero in the middle, the daily loss limit
 *  as a dashed line on the loss side — at the same place every day. */
function DayBar({ pnl, limit, scale }: { pnl: number | null; limit: number | null; scale: number }) {
  const half = (v: number) => `${Math.min(50, (Math.abs(v) / scale) * 50)}%`;
  return (
    <div className="relative h-3 w-full min-w-[140px] rounded-sm bg-tc-raised" role="presentation">
      <div className="absolute inset-y-0 left-1/2 w-px bg-ink-faint" />
      {pnl !== null && pnl !== 0 && (
        <div data-testid="ledger-day-fill" className={`absolute inset-y-0.5 rounded-sm ${pnl > 0 ? "bg-up/80" : "bg-neg/80"}`}
          style={pnl > 0 ? { left: "50%", width: half(pnl) } : { right: "50%", width: half(pnl) }} />
      )}
      {limit !== null && limit > 0 && (
        <div data-testid="ledger-limit-line" className="absolute -inset-y-0.5 w-0 border-l border-dashed border-warn"
          style={{ left: `calc(50% - ${half(limit)})` }} />
      )}
    </div>
  );
}

function Days({ days, limit, limitFrom }: { days: DayBucket[] | null; limit: number | null; limitFrom: "summary" | "status" | null }) {
  const scale = Math.max(limit ?? 0, ...(days ?? []).map((d) => Math.abs(d.settled_pnl_dollars ?? 0)), 0.01);
  return (
    <>
      <p data-testid="ledger-day-limit" className="mb-1.5 flex items-center gap-1.5 text-[12px] text-ink-low">
        {limit === null ? "no limit line" : `limit ${usd(limit)}`}
        <Info label="the daily loss limit">
          {limit === null ? "Daily loss limit not stated, so no line is drawn."
            : `The daily loss limit ${usd(limit)}${limitFrom === "status" ? " (from the status route)" : ""} is the dashed line.`}
          {" "}By the day an order was placed, as the backend summed it.
        </Info>
      </p>
      {days === null ? <InfoNote>by-day totals not sent</InfoNote>
        : days.length === 0 ? <InfoNote>no day in this window</InfoNote> : (
          <div className="tc-scroll overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
              <thead>
                <tr>
                  {["UTC day", "rows", "W–L–U", "settled P&L", "open", ""].map((h, i) => (
                    <th key={h || i} scope="col" className={`${TH} first:pl-0 ${i === 0 || i === 5 ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((d) => {
                  // THE BACKEND'S FLAG; with none, the line it states
                  const hit = d.over_daily_limit ?? (d.settled_pnl_dollars !== null && limit !== null && d.settled_pnl_dollars <= -limit);
                  return (
                    <tr key={d.key} data-testid="ledger-day" data-day={d.key} data-limit-hit={hit || undefined}>
                      <td className="whitespace-nowrap border-b border-tc-line py-1 pr-3 font-mono text-[11.5px] text-ink-mid">{d.key}</td>
                      <td className="tc-num border-b border-tc-line px-2.5 py-1 text-right text-ink-hi">{count(d.rows)}</td>
                      <td className="tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right text-ink-mid">{wlu(d)}</td>
                      <td className={`tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right ${plTone(d.settled_pnl_dollars)}`}>
                        {signedDollars(d.settled_pnl_dollars)}
                        {hit && <span className="ml-1 text-[11px] text-warn">◆ limit</span>}
                      </td>
                      <td className="tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right text-ink-low">{usd(d.open_cost_dollars)}</td>
                      <td className="w-2/5 border-b border-tc-line py-1 pl-2.5"><DayBar pnl={d.settled_pnl_dollars} limit={limit} scale={scale} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

const COMP_ORDER = new Map(FOCUS_COMPETITIONS.map((c, i) => [c, i]));

function GroupTable({ id, groups, label, order }: {
  id: string; groups: Bucket[] | null; label: (k: string) => string; order?: (a: Bucket, b: Bucket) => number;
}) {
  const rows = groups ? (order ? [...groups].sort(order) : groups) : null;
  if (rows === null) return <InfoNote>not sent</InfoNote>;
  if (rows.length === 0) return <InfoNote>none in this window</InfoNote>;
  return (
    <div className="tc-scroll overflow-x-auto">
      <table data-testid={`ledger-by-${id}`} className="w-full min-w-[460px] border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["", "n", "W–L–U", "cost", "settled P&L", "open"].map((h, i) => (
              <th key={h || i} scope="col" className={`${TH} first:pl-0 last:pr-0 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.key} data-testid="ledger-group-row" data-key={g.key}>
              <td className="max-w-[220px] truncate whitespace-nowrap border-b border-tc-line py-1 pr-3 text-ink-hi" title={label(g.key)}>{label(g.key)}</td>
              <td className="tc-num border-b border-tc-line px-2.5 py-1 text-right text-ink-hi">{count(g.rows)}</td>
              <td className="tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right text-ink-mid">{wlu(g)}</td>
              <td className="tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right text-ink-mid">{usd(g.cost_dollars)}</td>
              <td className={`tc-num whitespace-nowrap border-b border-tc-line px-2.5 py-1 text-right ${plTone(g.settled_pnl_dollars)}`}>{signedDollars(g.settled_pnl_dollars)}</td>
              <td className="tc-num whitespace-nowrap border-b border-tc-line py-1 pl-2.5 text-right text-ink-low">{usd(g.open_cost_dollars)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const famLabel = (k: string) => (k === "unknown" ? "type not stated" : familyWords(k) === k ? k : `${familyWords(k)} (${k})`);
const compL = (k: string) => (k === "unknown" ? "competition not stated" : compLabel(k));

export function PerformanceView({ now, source, go, statusDailyLimit }: {
  now: number; source: LedgerSource; go: (v: string, p?: Record<string, string>) => void; statusDailyLimit: number | null;
}) {
  void go;
  const l = source.last?.data ?? null;
  const s = l?.summary ?? null;
  const t = s?.totals ?? null;
  const limit = s?.daily_loss_limit_dollars ?? statusDailyLimit;
  const limitFrom = s?.daily_loss_limit_dollars != null ? "summary" : statusDailyLimit !== null ? "status" : null;
  const days = useMemo(() => (s?.by_day ? [...s.by_day].sort((a, b) => a.key.localeCompare(b.key)) : null), [s]);
  const filtered = Object.values(source.filters).some((v) => v !== "");
  const byComp = useMemo(() => (s?.by_competition ? [...s.by_competition]
    .sort((a, b) => (b.settled_pnl_dollars ?? 0) - (a.settled_pnl_dollars ?? 0)) : null), [s]);
  const settled = t && t.won !== null && t.lost !== null ? t.won + t.lost : null;
  const hits = (days ?? []).filter((d) => d.over_daily_limit ?? (d.settled_pnl_dollars !== null && limit !== null && d.settled_pnl_dollars <= -limit)).length;
  const daySum = line(
    plain(days ? `${days.length} days` : "not sent"),
    days && days.length ? plain(`last ${signedDollars(days[days.length - 1].settled_pnl_dollars)}`) : null,
    hits > 0 ? warn(`${hits} at limit`, "limit reached") : null,
  );
  const mainSum = t ? line(
    plain(`settled ${signedDollars(t.settled_pnl_dollars)}`), plain(`n ${settled ?? "?"}`), plain(wlu(t)),
    plain(`fees ${usd(t.fees_dollars)}`),
    filtered ? warn("filtered") : null,
    s && !s.complete ? warn("incomplete") : null,
    t.unknown !== null && t.unknown > 0 ? warn(`${t.unknown} P&L unknown`, "pnl unknown") : null,
    l ? freshItem(source.last!.at, now, source.cadenceMs, source.read.kind === "error", ago) : null,
  ) : line(readItem("ledger", source.read) ?? plain(l ? "summary not sent" : "reading…"));
  return (
    <div data-testid="ops-performance" className="grid grid-cols-12 gap-3">
      <div className="col-span-12">
        <Panel title="Performance" cid="performance" summary={mainSum}
          info="A small, capped experiment: a handful of settled orders cannot separate skill from chance. These are counts and sums as the backend summed them — no figure here is evidence of an edge."
          meta={<>
          {l ? <Freshness at={source.last!.at} now={now} cadenceMs={source.cadenceMs} /> : null}
          {filtered ? <span className="text-warn" title="ledger filters active (set in Trades)"> · ◆ filtered: {Object.entries(source.filters).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(", ")}</span> : null}
        </>}>
          {source.read.kind === "unavailable" ? <InfoNote>Ledger not on this backend</InfoNote>
            : source.read.kind === "error" && !l ? <ErrorNote tone="warn">the ledger read failed (HTTP {source.read.status}) — {source.read.detail}</ErrorNote>
              : !l ? <InfoNote>reading…</InfoNote>
                : !s ? <p data-testid="ledger-summary-absent" className="text-[12px] text-ink-low">summary not sent by this backend</p> : (
                  <>
                    {t && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4 xl:grid-cols-7">
                        <Metric size="lg" label="Settled P&L" cls="agent" value={signedDollars(t.settled_pnl_dollars)}
                          tone={t.settled_pnl_dollars === null || t.settled_pnl_dollars === 0 ? "text-ink-hi" : t.settled_pnl_dollars > 0 ? "text-up" : "text-neg"}
                          inline={<span className="tc-num text-ink-low">n {settled ?? "?"}</span>}
                          sub={`n = ${settled ?? "?"} settled rows`} />
                        <Metric size="lg" label="W–L–U" value={wlu(t)} sub="Won · lost · unsettled" />
                        <Metric size="lg" label="Fees" value={usd(t.fees_dollars)} sub={`In ${usd(t.cost_dollars)} filled cost`} />
                        <Metric size="lg" label="Open cost" value={usd(t.open_cost_dollars)} sub="Filled and unsettled — not a P&L" />
                        <Metric size="lg" label="Orders" value={count(t.orders)} sub={`${count(t.filled)} filled · ${count(t.not_filled)} not filled`} />
                        <Metric size="lg" label="Rows" value={count(t.rows)} sub="Orders and hand-over rows" />
                        {t.unknown !== null && t.unknown > 0 && <Metric size="lg" label="P&L unknown" value={`◆ ${count(t.unknown)}`} tone="text-warn" sub="A fill could not be read" />}
                      </div>
                    )}
                    {!s.complete && (
                      <p className="mt-2 text-[12px] text-warn" title="rows whose fill could not be read are not in these sums">◆ incomplete: unreadable fills not summed</p>
                    )}
                  </>
                )}
        </Panel>
      </div>

      {s && (
        <>
          <div className="col-span-12 2xl:col-span-7">
            <Panel title="Settled P&L by day" cid="pnl-chart" summary={daySum} info="Hover or focus a day for its exact figures. Settled P&L by the day the order was placed, as the backend summed it.">
              {days && days.length ? <DailyPnlChart testid="pnl-chart" days={days} limit={limit} height={200} />
                : <InfoNote>{days === null ? "by-day totals not sent" : "no day in this window"}</InfoNote>}
            </Panel>
          </div>
          <div className="col-span-12 2xl:col-span-5">
            <Panel title="By competition" cid="by-comp-bars" summary={groupSum(byComp, compL)} info="Ranked by settled P&L; hover a row for its n, W–L–U and cost.">
              {byComp === null ? <InfoNote>not sent</InfoNote> : byComp.length === 0 ? <InfoNote>none in this window</InfoNote> : (
                <BarList signed testid="perf-by-comp" items={byComp.map((g) => ({
                  key: g.key, value: g.settled_pnl_dollars ?? 0,
                  tone: (g.settled_pnl_dollars ?? 0) > 0 ? "up" : (g.settled_pnl_dollars ?? 0) < 0 ? "neg" : "ink",
                  label: <span title={`n ${count(g.rows)} · W–L–U ${wlu(g)} · cost ${usd(g.cost_dollars)}`}>{compL(g.key)} <span className="tc-num text-[11px] text-ink-low">n {count(g.rows)}</span></span>,
                  display: <span className={plTone(g.settled_pnl_dollars)}>{signedDollars(g.settled_pnl_dollars)}</span>,
                }))} />
              )}
            </Panel>
          </div>
          <div className="col-span-12">
            <Panel title="Day by day" cid="days" summary={daySum}>
              {/* the table AS SENT (the chart above is drawn in date order) */}
              <Days days={s.by_day} limit={limit} limitFrom={limitFrom} />
            </Panel>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <Panel title="By competition · table" cid="by-comp-table" summary={groupSum(s.by_competition, compL)} info="Every competition the window holds.">
              <GroupTable id="competition" groups={s.by_competition} label={compL}
                order={(a, b) => (COMP_ORDER.get(a.key) ?? 99) - (COMP_ORDER.get(b.key) ?? 99) || a.key.localeCompare(b.key)} />
            </Panel>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <Panel title="By market type" cid="by-family" summary={groupSum(s.by_family, famLabel)} info="CLV by market type is not served by the ledger route.">
              <GroupTable id="family" groups={s.by_family} label={famLabel} />
            </Panel>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Panel title="By phase" cid="by-phase" summary={groupSum(s.by_phase, phaseWords)}><GroupTable id="phase" groups={s.by_phase} label={phaseWords} /></Panel>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Panel title="By price band" cid="by-price" summary={groupSum(s.by_price_bucket, priceBucketWords)} info="The price of the side bought."><GroupTable id="price" groups={s.by_price_bucket} label={priceBucketWords} /></Panel>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Panel title="By edge at placement" cid="by-edge" summary={groupSum(s.by_edge_bucket, edgeBucketWords)}
              info="The trader's own estimate. Does a larger estimated edge go with better results? Read the settled P&L down this table with the n beside it. With samples this small, a difference between bands is not a finding.">
              <GroupTable id="edge" groups={s.by_edge_bucket} label={edgeBucketWords} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

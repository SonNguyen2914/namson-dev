// TRADES (redesign of "Trades & grounds", 2026-10-06 → 2026-10-07): every
// order the trader placed and every contract handed over to it — newest
// first, as the backend sends them — with the grounds it recorded when it
// placed, what became of the order and, once its market settled in the
// trader's journal, the result and that row's own P&L.
//
// THE SEAL (Son's decision, 2026-10-06, "Everything, for my bets only"):
// results and P&L for the trader's OWN orders and handed-over contracts
// only. The CSV is the operator's own download, never research data.
//
// FILTERS: the backend's (UTC day range, competition, phase — named query
// parameters, re-read on change) and the page's own over the loaded rows
// (market type, result, side, search). Both outlive every refresh.
//
// MISSING IS NOT ZERO: a value a row did not record reads "not recorded";
// a P&L with no journaled result reads "unsettled"; the CSV writes a
// missing value as an empty cell. "Edge" is the trader's own estimate at
// the time it placed — not a measured edge, not advice.
import { Fragment, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
  type LedgerRow, NOT_RECORDED, ROW_TYPE_WORDS, blendWords, carefulWords, compLabel,
  consensusWords, dollars, edgeGroundWords, edgeNote, edgeWords, fairWords,
  familyWords, feeWords, fillWords, guardLines, handoverWords, inPlayLines,
  ledgerCsv, lifecycleLines, makerWords, modelWords, outcomeLines, phaseWords,
  pnlWords, resultWords, riskLines, signedDollars,
} from "../../lib/tradingLedger";
import {
  CTRL, ErrorNote, Freshness, Info, InfoNote, Metric, Panel, TH, Tech, ago, count, usd, whenShort,
} from "./primitives";
import type { LedgerSource } from "./useConsoleData";

export interface LedgerClientFilters { family: string; result: string; side: string; q: string }
export const NO_LEDGER_CLIENT: LedgerClientFilters = { family: "", result: "", side: "", q: "" };

function when(iso: string | null): string {
  if (!iso) return NOT_RECORDED;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const plTone = (n: number | null) => (n === null || n === 0 ? "text-ink-mid" : n > 0 ? "text-up" : "text-neg");

// ------------------------------------------------------------ grounds

function G({ field, k, children }: { field: string; k: string; children: ReactNode }) {
  return (
    <div data-testid="ledger-ground" data-field={field} className="min-w-0 border-b border-tc-line pb-2">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-low">{k}</dt>
      <dd className="tc-num mt-0.5 break-words text-[12.5px] leading-snug text-ink-hi">{children}</dd>
    </div>
  );
}
function Lines({ ls }: { ls: string[] }) {
  return <>{ls.map((l, i) => <span key={i} className="block">{l}</span>)}</>;
}

function Grounds({ r }: { r: LedgerRow }) {
  const g = r.grounds;
  const order = r.row_type === "order";
  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-snug text-ink-hi">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-low">why</span>
        {r.why ?? NOT_RECORDED}
      </p>
      {order && g.status !== "recorded" && (
        <p className="text-[12px] text-warn">
          ◆ grounds {g.status === "truncated" ? "truncated — the inputs were too large to keep"
            : "not recorded on this row"} — every ground below is named as such
        </p>
      )}
      <div className="grid gap-x-6 gap-y-1 lg:grid-cols-3">
        <dl className="space-y-2">
          <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mid">Pricing</h4>
          {order ? (
            <>
              <G field="fair" k="fair probability (its own)">{fairWords(g, r.side)}</G>
              <G field="consensus" k="bookmaker consensus">{consensusWords(g.consensus)}</G>
              <G field="model" k="our model (unvalidated)">{modelWords(g.model)}</G>
              <G field="blend" k="blend & learner">{blendWords(g.blend)}</G>
              <G field="maker" k="maker price">{makerWords(g)}</G>
              <G field="fee" k="fee">{feeWords(g)}</G>
              <G field="edge" k="edge after fee (its own estimate)">{edgeGroundWords(r)}</G>
            </>
          ) : (
            <G field="handover" k={ROW_TYPE_WORDS[r.row_type]}>{handoverWords(g.handover)}</G>
          )}
        </dl>
        <dl className="space-y-2">
          <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mid">Checks</h4>
          {order && (
            <>
              {g.careful && <G field="careful" k="careful strategy">{carefulWords(g.careful)}</G>}
              <G field="guards" k="guards at placement"><Lines ls={guardLines(g.guards)} /></G>
              <G field="risk" k="risk checks"><Lines ls={riskLines(g.risk)} /></G>
              <G field="in_play" k="in play"><Lines ls={inPlayLines(g.in_play)} /></G>
            </>
          )}
        </dl>
        <dl className="space-y-2">
          <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mid">Lifecycle &amp; result</h4>
          <G field="lifecycle" k="lifecycle"><Lines ls={lifecycleLines(r)} /></G>
          <G field="outcome" k="result (from the journal)"><Lines ls={outcomeLines(r)} /></G>
          <G field="cost" k="cost (fee in)">
            {dollars(r.cost_dollars)}{r.fee_dollars !== null ? ` · fee ${dollars(r.fee_dollars)}` : ""}
          </G>
          <G field="strategy_version" k="strategy"><Tech tone="text-ink-hi">{r.strategy_version ?? NOT_RECORDED}</Tech></G>
          <G field="ticker" k="market">
            <Tech tone="text-ink-hi">{r.market.ticker ?? NOT_RECORDED}</Tech>
            {r.market.outcome_key_source ? ` · key from ${r.market.outcome_key_source}` : ""}
          </G>
          <G field="placed_at" k="placed (UTC)">
            <Tech tone="text-ink-hi">{r.placed_at ?? NOT_RECORDED}</Tech>{r.order_id ? <> · order <Tech tone="text-ink-hi">{r.order_id}</Tech></> : ""}
          </G>
          <G field="not_recorded" k="not recorded on this row">
            {r.not_recorded.length ? r.not_recorded.join(", ") : "nothing missing"}
          </G>
        </dl>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- the row

// WHY is not a default column (the brief's default: time, match, market,
// side, price, size, status, P&L): the trader's sentence is the first line
// of the grounds, one click away, and the row's tooltip.
const HEAD = ["", "time", "match", "market", "side", "price", "size", "edge vs bar", "status", "p&l"];
const RIGHT = new Set([5, 6, 7, 9]);
const TD = "border-b border-tc-line px-2.5 py-1 align-top whitespace-nowrap";

function Row({ r, open, onToggle, boxW }: { r: LedgerRow; open: boolean; onToggle: () => void; boxW: number | null }) {
  const o = r.outcome.status;
  const minute = r.grounds.in_play?.status === "recorded" ? r.grounds.in_play.minute : null;
  const id = `ledger-g-${r.id}`;
  const fx = r.fixture;
  const note = edgeNote(r);
  const cleared = r.row_type === "order" && r.edge.cleared === true;
  return (
    <>
      <tr data-testid="ledger-row" data-row-id={r.id} data-ticker={r.market.ticker ?? ""}
        data-kind={r.row_type} data-result={o ?? "not_recorded"}
        data-placed-at={r.placed_at ?? undefined} data-phase={r.phase ?? ""} title={r.why ?? undefined}
        className={`transition-colors hover:bg-tc-hover ${open ? "bg-tc-raised" : ""}`}>
        <td className={`${TD} pl-4 pr-1`}>
          <button type="button" data-testid="ledger-expand" aria-expanded={open} aria-controls={id} onClick={onToggle}
            aria-label={`${open ? "hide" : "show"} the grounds for ${r.market.contract ?? r.market.ticker ?? "this row"}`}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-tc-line-strong text-[10px] text-ink-mid outline-none transition-colors hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent">
            <span aria-hidden className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          </button>
        </td>
        <td className={`${TD} whitespace-nowrap`}>
          <span data-testid="ledger-time" className="tc-num block text-[12.5px] text-ink-hi" title={when(r.placed_at)}>{r.placed_at ? whenShort(r.placed_at) : NOT_RECORDED}</span>
          <span data-testid="ledger-phase" className="block text-[11px] text-ink-low">
            {phaseWords(r.phase)}{minute !== null && <span className="text-live"> · {minute}′</span>}
          </span>
        </td>
        <td data-testid="ledger-match" className={`${TD} max-w-[230px]`}>
          <span className="block truncate text-[12.5px] leading-snug text-ink-hi" title={fx.label ?? undefined}>
            {fx.label ?? (fx.home === null && fx.away === null ? "match not recorded"
              : `${fx.home ?? "home not recorded"} v ${fx.away ?? "away not recorded"}`)}
          </span>
          <span className="block truncate text-[11px] text-ink-low" title={`${compLabel(r.competition)} · kickoff ${when(fx.kickoff_utc)}`}>
            {compLabel(r.competition)} · {fx.kickoff_utc ? whenShort(fx.kickoff_utc) : NOT_RECORDED}
            {fx.key_source === "same_event" && (
              <span data-testid="ledger-fixture-borrowed" title="fixture from an order on the same Kalshi event (not recorded on this row)"> · borrowed</span>
            )}
          </span>
        </td>
        <td data-testid="ledger-contract" className={`${TD} max-w-[250px]`}>
          <span className="block truncate text-[12.5px] leading-snug text-ink-hi"
            title={`${r.market.contract ?? ""} · ${familyWords(r.market.family)} · ${r.market.outcome_key ?? NOT_RECORDED}`}>
            {r.market.contract ?? `contract ${NOT_RECORDED}`}
            {r.row_type !== "order" && (
              <span data-testid="ledger-handed-chip"
                className="ml-1.5 whitespace-nowrap rounded-[4px] border border-tc-line-strong px-1 text-[10.5px] uppercase tracking-[0.04em] text-ink-mid">
                {ROW_TYPE_WORDS[r.row_type]}
              </span>
            )}
          </span>
          <Tech className="block truncate" title={r.market.ticker ?? undefined}>{r.market.ticker ?? `ticker ${NOT_RECORDED}`}</Tech>
        </td>
        <td data-testid="ledger-side" className={`${TD} font-medium text-ink-hi`}>{r.side ? r.side.toUpperCase() : NOT_RECORDED}</td>
        <td data-testid="ledger-price" className={`${TD} tc-num whitespace-nowrap text-right text-ink-hi`}>
          {cents(r.price_cents)}
          <span className="block text-[11px] text-ink-low" title="the YES book price">YES book {cents(r.yes_book_price_cents)}</span>
        </td>
        <td className={`${TD} tc-num whitespace-nowrap text-right`}>
          <span data-testid="ledger-size" className="block text-ink-hi">{count(r.count)}</span>
          <span data-testid="ledger-cost" className="block text-[11px] text-ink-low">
            {dollars(r.cost_dollars)}{r.fee_dollars !== null && <> · fee {dollars(r.fee_dollars)}</>}
          </span>
        </td>
        <td data-testid="ledger-edge" data-clears={cleared || undefined}
          className={`${TD} tc-num whitespace-nowrap text-right ${cleared ? "font-semibold text-ink-hi" : "text-ink-low"}`}>
          <span title={note ?? undefined}>{edgeWords(r)}{note ? <span className="font-normal text-ink-faint"> *</span> : null}</span>
        </td>
        <td className={`${TD} whitespace-nowrap`}>
          <span data-testid="ledger-fill" className="block max-w-[200px] truncate text-[12px] text-ink-mid"
            title={`${fillWords(r)}${r.lifecycle.cancels.length > 0 ? ` · ${r.lifecycle.cancels.map((c) => c.reason ?? NOT_RECORDED).join(", ")}` : ""}`}>
            {fillWords(r)}
            {r.lifecycle.cancels.length > 0 && (
              <span className="text-[11px] text-ink-low"> · {r.lifecycle.cancels.map((c) => c.reason ?? NOT_RECORDED).join(", ")}</span>
            )}
          </span>
          <span data-testid="ledger-result"
            className={`mt-0.5 block text-[12px] ${o === "won" ? "text-up" : o === "lost" ? "text-neg" : o === "unknown" ? "text-warn" : "text-ink-low"}`}>
            {resultWords(r)}
          </span>
        </td>
        <td data-testid="ledger-pnl"
          className={`${TD} tc-num whitespace-nowrap pr-4 text-right font-medium ${o === "won" || o === "lost" ? plTone(r.outcome.pnl_dollars) : "text-ink-low"}`}>
          {pnlWords(r)}
        </td>
      </tr>
      {open && (
        <tr id={id} data-testid="ledger-grounds" data-row-id={r.id} data-ticker={r.market.ticker ?? ""}
          className="bg-tc-raised">
          <td colSpan={HEAD.length} className="border-b border-tc-line-strong p-0">
            {/* STICKY AT THE BOX'S LEFT EDGE AND THE BOX'S WIDTH, so at phone
                width the grounds are read in view, not off to the side */}
            <div data-testid="ledger-grounds-body" className="tc-fade sticky left-0 px-4 py-4"
              style={boxW ? { width: boxW } : undefined}>
              <Grounds r={r} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function cents(c: number | null): string {
  if (c === null) return NOT_RECORDED;
  const a = Math.abs(c);
  const r = a < 1 && a > 0 ? Math.round(c * 100) / 100 : Math.round(c * 10) / 10;
  return `${r < 0 ? "−" : ""}${Math.abs(r)}¢`;
}

/** "20261006-1405Z" */
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/^(\d{8})T(\d{4}).*$/, "$1-$2Z");

// --------------------------------------------------------------- view

export function TradesView({ now, source, client, setClient, open, setOpen, statusDailyLimit }: {
  now: number; source: LedgerSource; client: LedgerClientFilters;
  setClient: (f: LedgerClientFilters | ((f: LedgerClientFilters) => LedgerClientFilters)) => void;
  /** the rows whose grounds are open — held above the view, so a refresh
   *  or a view switch never collapses them */
  open: Set<number>; setOpen: (f: (s: Set<number>) => Set<number>) => void;
  statusDailyLimit: number | null;
}) {
  void statusDailyLimit;
  const { read, filters, setFilter, clearFilters, known } = source;
  const l = source.last?.data ?? null;
  const at = source.last?.at ?? null;
  const stale = at !== null && (read.kind !== "ok" || now - at > 3 * source.cadenceMs);
  const serverFiltered = Object.values(filters).some((v) => v !== "");
  const clientFiltered = Object.values(client).some((v) => v !== "");
  const [boxW, setBoxW] = useState<number | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const box = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    setBoxW(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const o = new ResizeObserver(() => setBoxW(el.clientWidth));
    o.observe(el);
    observer.current = o;
  }, []);

  const rows = source.rows;
  const families = useMemo(() => [...new Set(rows.map((r) => r.market.family).filter((x): x is string => !!x))].sort(), [rows]);
  const shown = useMemo(() => {
    const q = client.q.trim().toLowerCase();
    return rows.filter((r) => {
      if (client.family && (r.market.family ?? "") !== client.family) return false;
      if (client.result && (r.outcome.status ?? "not_recorded") !== client.result) return false;
      if (client.side && (r.side ?? "") !== client.side) return false;
      if (q) {
        const hay = `${r.fixture.label ?? ""} ${r.fixture.home ?? ""} ${r.fixture.away ?? ""} ${r.market.contract ?? ""} ${r.market.ticker ?? ""} ${r.why ?? ""} ${r.order_id ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, client]);

  const toggle = (k: number) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

  const exportCsv = () => {
    // a BOM, so a spreadsheet reads the file as UTF-8 (≥, —, ¢)
    const blob = new Blob([`﻿${ledgerCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trivela-trades-${stamp()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2_000);
  };

  const page = l?.page ?? null;
  const t = l?.summary?.totals ?? null;
  const setC = (k: keyof LedgerClientFilters, v: string) => setClient((c) => ({ ...c, [k]: v }));

  return (
    <div className="space-y-3">
      <Panel testid="ops-ledger" title="Trades"
        info={<>Every order the trader placed and every contract you handed over to it: the grounds it recorded when
          it placed, what became of the order, and — once its market settled in the trader&apos;s journal — the result
          and that order&apos;s own P&amp;L. &ldquo;Edge&rdquo; is the trader&apos;s own estimate at the time, not
          evidence of an edge, and our model&apos;s number is unvalidated. Only the trader&apos;s orders and handed-over contracts: your own manual
          bets are not here. Prices in cents of the side bought (the YES book beside it); money in dollars.</>}
        meta={l ? <Freshness at={at} now={now} cadenceMs={source.cadenceMs} failed={read.kind === "error"} /> : undefined}
        bodyClass="py-0">

        {/* ---- filters ---- */}
        <div data-testid="ledger-filters" role="group" aria-label="filter the ledger"
          className="flex flex-wrap items-end gap-2 border-b border-tc-line px-4 py-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low" title="UTC day">from</span>
            <input type="date" data-testid="ledger-filter-since" value={filters.since}
              onChange={(e) => setFilter("since", e.target.value)} className={CTRL} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low" title="UTC day">to</span>
            <input type="date" data-testid="ledger-filter-until" value={filters.until}
              onChange={(e) => setFilter("until", e.target.value)} className={CTRL} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">competition</span>
            <select data-testid="ledger-filter-competition" value={filters.competition}
              onChange={(e) => setFilter("competition", e.target.value)} className={CTRL}>
              <option value="">all</option>
              {known.comps.map((c) => <option key={c} value={c}>{compLabel(c)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">phase</span>
            <select data-testid="ledger-filter-phase" value={filters.phase}
              onChange={(e) => setFilter("phase", e.target.value)} className={CTRL}>
              <option value="">all</option>
              {known.phases.map((p) => <option key={p} value={p}>{phaseWords(p)}</option>)}
            </select>
          </label>
          <span aria-hidden className="mx-1 hidden h-8 w-px self-end bg-tc-line sm:block" />
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">market type</span>
            <select data-testid="ledger-filter-family" value={client.family} onChange={(e) => setC("family", e.target.value)} className={CTRL}>
              <option value="">all</option>
              {families.map((f) => <option key={f} value={f}>{familyWords(f)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">result</span>
            <select data-testid="ledger-filter-result" value={client.result} onChange={(e) => setC("result", e.target.value)} className={CTRL}>
              <option value="">all</option><option value="won">won</option><option value="lost">lost</option>
              <option value="unsettled">unsettled</option><option value="not_filled">not filled</option>
              <option value="unknown">unknown</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">side</span>
            <select data-testid="ledger-filter-side" value={client.side} onChange={(e) => setC("side", e.target.value)} className={CTRL}>
              <option value="">both</option><option value="yes">YES</option><option value="no">NO</option>
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 sm:max-w-[280px]">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">search</span>
            <input type="search" data-testid="ledger-filter-search" value={client.q} placeholder="match, ticker, order id"
              onChange={(e) => setC("q", e.target.value)} className={`${CTRL} w-full`} />
          </label>
          {(serverFiltered || clientFiltered) && (
            <button type="button" data-testid="ledger-filter-clear"
              onClick={() => { if (serverFiltered) clearFilters(); setClient(NO_LEDGER_CLIENT); }}
              className={`${CTRL} self-end text-ink-mid`}>Clear</button>
          )}
          {rows.length > 0 && (
            <span className="ml-auto flex items-center gap-1.5 self-end">
              <button type="button" data-testid="ledger-export" onClick={exportCsv}
                className={`${CTRL} border-tc-line-strong font-medium`}>Export CSV</button>
              <Info label="the CSV export">
                The {rows.length} loaded rows · blank cell = not recorded · your own download, never research data.
              </Info>
            </span>
          )}
        </div>

        <div className="px-4 py-2">
          {read.kind === "unavailable" && (
            <p data-testid="ledger-unavailable" className="text-[12.5px] text-ink-low">
              Trades &amp; grounds not available yet
            </p>
          )}
          {read.kind === "refused" && <ErrorNote testid="ledger-error">token rejected — the backend refused it ({read.detail})</ErrorNote>}
          {read.kind === "error" && <ErrorNote testid="ledger-error" tone="warn">the ledger read failed (HTTP {read.status}) — {read.detail}</ErrorNote>}
          {read.kind === "idle" && !l && <InfoNote>reading…</InfoNote>}

          {l && (
            <div data-testid="ledger-body" data-stale={stale || undefined}>
              {page?.scan_complete === false && (
                <p data-testid="ledger-scan-partial" role="note" className="mb-1.5 text-[12px] text-warn"
                  title="the summary and these rows cover those; narrow the dates to see older ones">
                  ◆ only the newest {page.scan_max ?? "?"} journal rows were read
                </p>
              )}
              {!l.summary ? (
                <p data-testid="ledger-summary-absent" className="text-[12px] text-ink-low" title="the rows below are all there is">
                  summary not sent by this backend
                </p>
              ) : t ? (
                <div data-testid="ledger-totals" className="grid grid-cols-3 gap-x-5 gap-y-2 sm:grid-cols-6 xl:grid-cols-12">
                  {([
                    ["rows", "rows", count(t.rows)], ["orders", "placed", count(t.orders)],
                    ["filled", "filled", count(t.filled)], ["not_filled", "not filled", count(t.not_filled)],
                    ["won", "won", count(t.won)], ["lost", "lost", count(t.lost)],
                    ["unsettled", "unsettled", count(t.unsettled)], ["cost", "cost", usd(t.cost_dollars)],
                    ["fees", "fees", usd(t.fees_dollars)],
                    ["pnl", "settled P&L", signedDollars(t.settled_pnl_dollars)],
                    ["open", "open", usd(t.open_cost_dollars)],
                    ...(t.unknown !== null && t.unknown > 0 ? [["unknown", "P&L unknown", count(t.unknown)]] : []),
                  ] as [string, string, string][]).map(([id, k, v]) => (
                    <Metric key={id} testid={`ledger-total-${id}`} size="sm" label={k} value={v}
                      sub={id === "cost" ? "Filled cost (fees in)" : id === "open" ? "Open (unsettled cost)" : undefined}
                      tone={id === "pnl" ? (t.settled_pnl_dollars === null || t.settled_pnl_dollars === 0 ? "text-ink-hi" : t.settled_pnl_dollars > 0 ? "text-up" : "text-neg")
                        : id === "unknown" ? "text-warn" : "text-ink-hi"} />
                  ))}
                </div>
              ) : <p className="text-[12px] text-ink-low">totals not sent</p>}
              {l.summary && !l.summary.complete && (
                <p data-testid="ledger-incomplete" role="note" className="mt-1.5 text-[12px] text-warn">
                  ◆ {`incomplete: ${t?.unknown ?? "some"} row${t?.unknown === 1 ? "" : "s"} had a fill `
                    + "that could not be read, so their cost and P&L are not in these sums"}
                </p>
              )}
              <p data-testid="ledger-count" className="tc-num mt-2 text-[12px] text-ink-low">
                {rows.length} row{rows.length === 1 ? "" : "s"}
                {page?.matching !== null && page?.matching !== undefined && page.matching !== rows.length ? ` of ${page.matching}` : ""}
                {" "}· {source.nextOffset !== null ? "more on the backend" : "all loaded"}
                {clientFiltered ? ` · ${shown.length} match the page's filters` : ""}
                {l.unreadable > 0 && (
                  <span className="text-warn"> · {l.unreadable} row{l.unreadable === 1 ? "" : "s"} unreadable (not a ledger row), not drawn</span>
                )}

                {stale && <span className="text-warn"> · stale, {ago(now - at!)} old</span>}
              </p>
            </div>
          )}
        </div>

        {l && (rows.length === 0 || shown.length === 0 ? (
          <div className="px-4 pb-4">
            <p data-testid="ledger-none" className="rounded-md border border-dashed border-tc-line px-3 py-3 text-[12.5px] text-ink-low">
              {serverFiltered || clientFiltered ? "No orders match these filters." : "No orders on record in this window."}
            </p>
          </div>
        ) : (
          <div ref={box} className="tc-scroll max-h-[75vh] overflow-auto border-t border-tc-line">
            <table data-testid="ledger-table" className="tc-table w-full min-w-[980px] border-collapse text-[12.5px]">
              <thead>
                <tr>
                  {HEAD.map((h, i) => (
                    <th key={h || i} scope="col" className={`${TH} ${i === 0 ? "pl-4" : ""} ${RIGHT.has(i) ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <Fragment key={r.id}>
                    <Row r={r} open={open.has(r.id)} onToggle={() => toggle(r.id)} boxW={boxW} />
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {l && (
          <div className="border-t border-tc-line px-4 py-2">
            {source.nextOffset !== null && (
              <button type="button" data-testid="ledger-more" onClick={() => void source.loadOlder()}
                disabled={source.more.busy} className={`${CTRL} text-ink-mid disabled:opacity-40`}>
                {source.more.busy ? "loading older…" : "Load older"}
              </button>
            )}
            {source.more.error && (
              <p data-testid="ledger-more-error" role="alert" className="mt-1 text-[12px] text-warn">
                the older page could not be read — {source.more.error}
              </p>
            )}
            <p className="mt-1.5 font-mono text-[10.5px] text-ink-faint" title={`generated ${when(l.generated_at)} · read every 60 s while a token is held`}>
              {l.version ?? "version not stated"}{l.env ? ` · ${l.env}` : ""}
            </p>
            {l.seal && <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px] text-ink-faint">seal <Info label="the seal" testid="ledger-seal">{l.seal}</Info></p>}
          </div>
        )}
      </Panel>
    </div>
  );
}

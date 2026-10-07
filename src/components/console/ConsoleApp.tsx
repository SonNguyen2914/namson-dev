// THE CONSOLE APPLICATION (redesign, 2026-10-07): the shell above every
// view, and the ONE place that holds the console's UI state — the view,
// the candidates' filters, search and sort, the ledger's client filters,
// which inspector is open — so a refresh (a poll replacing data) never
// resets a filter, closes a drawer, collapses a row or moves the scroll.
//
// Mounted only once the status has answered (pages/ops/trading.tsx): the
// book, the candidates and the ledger are read from here
// (useSectionReads), never for a plane that refused or is not ready.
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { attention, type ReadState } from "../../lib/consoleModel";
import { liveTotals } from "../../lib/tradingConsole";
import { Freshness } from "./primitives";
import { OperatorStatusBar, ViewNav } from "./shell";
import { useHashRoute } from "./route";
import { type Read, useSectionReads } from "./useConsoleData";
import { Overview } from "./Overview";
import { TradingView, type CandFilters, NO_CAND_FILTERS, candFiltersFrom, candParams } from "./TradingView";
import { PortfolioView } from "./PortfolioView";
import { TradesView, type LedgerClientFilters, NO_LEDGER_CLIENT } from "./TradesView";
import { PerformanceView } from "./PerformanceView";
import { ModelView } from "./ModelView";
import { SystemView } from "./SystemView";

type Obj = Record<string, unknown>;

const asReadState = (r: Read): ReadState => r.kind === "error"
  ? { kind: "error", status: r.status, detail: r.detail }
  : r.kind === "refused" || r.kind === "not_ready" ? { kind: r.kind, detail: r.detail }
    : { kind: r.kind };

export function ConsoleApp({ d, statusAt, statusRead, statusStale, now, token, bumpStatus, tokenField }: {
  d: Obj; statusAt: number; statusRead: Read; statusStale: boolean; now: number;
  token: string; bumpStatus: () => void; tokenField: ReactNode;
}) {
  const reads = useSectionReads(token);
  const { route, go, replaceParams } = useHashRoute();
  const view = route.view;

  // ---- UI state that outlives every refresh and every view switch
  const [cand, setCand] = useState<CandFilters>(NO_CAND_FILTERS);
  const [candSel, setCandSel] = useState<string | null>(null);
  const [ledgerClient, setLedgerClient] = useState<LedgerClientFilters>(NO_LEDGER_CLIENT);
  const [ledgerSel, setLedgerSel] = useState<number | null>(null);
  const [posSel, setPosSel] = useState<string | null>(null);
  const [tradingTab, setTradingTab] = useState<"candidates" | "inplay">("candidates");

  // a link INTO a view (Attention, Why not placed, a deep link) carries its
  // filters in the hash query: read them when the route changes
  const routeKey = `${route.view}?${new URLSearchParams(route.params).toString()}`;
  const [seenRoute, setSeenRoute] = useState("");
  if (routeKey !== seenRoute) {
    // adjusting state to a new route, during render (no effect cascade)
    setSeenRoute(routeKey);
    if (route.view === "trading") {
      if (Object.keys(route.params).some((k) => k !== "tab")) setCand(candFiltersFrom(route.params));
      setTradingTab(route.params.tab === "inplay" ? "inplay" : "candidates");
    }
  }
  useEffect(() => {
    if (route.params.focus) {
      const el = document.querySelector(`[data-focus="${route.params.focus}"]`);
      if (el) el.scrollIntoView({ block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  // the candidates' filters are written back to the hash (no history entry)
  useEffect(() => {
    if (view !== "trading") return;
    replaceParams("trading", { ...candParams(cand), ...(tradingTab === "inplay" ? { tab: "inplay" } : {}) });
  }, [view, cand, tradingTab, replaceParams]);

  const book = reads.book.last?.data ?? null;
  const candidates = reads.candidates.last?.data ?? null;
  const ledger = reads.ledger.last?.data ?? null;

  const nowBucket = Math.floor(now / 30_000);
  const items = useMemo(() => attention({
    status: d, statusRead: asReadState(statusRead),
    statusAgeMs: statusStale ? now - statusAt : null,
    candidates, candidatesRead: asReadState(reads.candidates.read),
    bookRead: asReadState(reads.book.read),
    book: book ? {
      notListed: book.totals.notListedPositions + book.totals.notListedOrders,
      unmarked: liveTotals(book.positions.map((p) => p.live)).unmarked,
    } : null,
    ledgerRead: asReadState(reads.ledger.read),
    ledger: ledger ? {
      incomplete: ledger.summary ? !ledger.summary.complete : false,
      unknown: ledger.summary?.totals?.unknown ?? null,
      scanPartial: ledger.page?.scan_complete === false,
    } : null,
    // the clock only matters at half-minute grain here: keep the list stable
    now: nowBucket * 30_000,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [d, statusRead, statusStale, candidates, reads.candidates.read, book, reads.book.read,
    ledger, reads.ledger.read, nowBucket]);

  const counts = {
    trading: candidates ? String(candidates.rows.length) : undefined,
    portfolio: book ? String(book.positions.length + book.orders.length) : undefined,
    trades: ledger ? String(reads.ledger.rows.length) : undefined,
  };

  const statusFresh = (
    <Freshness testid="fresh-status" at={statusAt} now={now} cadenceMs={15_000}
      failed={statusRead.kind === "error" || statusRead.kind === "not_ready"} label="status" />
  );

  return (
    <div data-testid="ops-console" data-stale={statusStale || undefined}>
      <div className="sticky top-[var(--topbar-h,48px)] z-40">
        <OperatorStatusBar d={d} now={now} attention={items} freshness={statusFresh} />
      </div>
      <div className="border-b border-tc-line bg-tc-app">
        <div className="mx-auto flex max-w-[1760px] flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pt-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-ink-hi">Trading console</h1>
              <span data-testid="ops-disclosure"
                title="The agent's numbers are its own bookkeeping of a small, capped experiment. Model probabilities are unvalidated; an estimated edge is not proof. Nothing here is advice."
                className="rounded-[4px] border border-warn/30 px-1.5 py-[1px] text-[10.5px] font-medium uppercase tracking-[0.08em] text-warn/90">
                experimental · unproven · not advice
              </span>
            </div>
            <ViewNav view={view} counts={counts} />
          </div>
          <div className="pb-2.5">{tokenField}</div>
        </div>
      </div>

      <main className="mx-auto max-w-[1760px] px-4 pb-24 pt-5 sm:px-6">
        {statusRead.kind === "not_ready" && (
          <p data-testid="ops-not-ready" role="alert"
            className="mb-4 rounded-md border border-warn/40 px-3 py-2 text-[12.5px] text-warn">
            trading plane not ready — {statusRead.detail}. The figures below are from the last good read, {Math.round((now - statusAt) / 1000)} s old.
          </p>
        )}
        {statusRead.kind === "error" && (
          <p data-testid="ops-error" role="alert"
            className="mb-4 rounded-md border border-warn/40 px-3 py-2 text-[12.5px] text-warn">
            the status read failed (HTTP {statusRead.status}) — {statusRead.detail}. The figures below are from the last good read, {Math.round((now - statusAt) / 1000)} s old.
          </p>
        )}

        {view === "overview" && (
          <Overview d={d} now={now} token={token} reads={reads} attention={items}
            bumpStatus={bumpStatus} go={go} statusStale={statusStale} statusAt={statusAt} />
        )}
        {view === "trading" && (
          <TradingView d={d} now={now} source={reads.candidates} filters={cand} setFilters={setCand}
            selected={candSel} setSelected={setCandSel} tab={tradingTab}
            setTab={(t) => { setTradingTab(t); }} />
        )}
        {view === "portfolio" && (
          <PortfolioView d={d} now={now} token={token} source={reads.book} onPosted={reads.bumpBook}
            selected={posSel} setSelected={setPosSel} />
        )}
        {view === "trades" && (
          <TradesView now={now} source={reads.ledger} client={ledgerClient} setClient={setLedgerClient}
            selected={ledgerSel} setSelected={setLedgerSel}
            statusDailyLimit={numOrNull((d.daily_loss as Obj | undefined)?.limit)} />
        )}
        {view === "performance" && (
          <PerformanceView now={now} source={reads.ledger} go={go}
            statusDailyLimit={numOrNull((d.daily_loss as Obj | undefined)?.limit)} />
        )}
        {view === "model" && <ModelView d={d} now={now} token={token} />}
        {view === "system" && <SystemView d={d} now={now} candidates={candidates} go={go} />}

        <p className="mt-8 font-mono text-[10.5px] text-ink-faint">
          {typeof d.version === "string" ? d.version : "status version not stated"} · generated {typeof d.generated_at === "string" ? d.generated_at : "—"}
        </p>
      </main>
    </div>
  );
}

function numOrNull(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

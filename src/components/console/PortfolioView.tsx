// PORTFOLIO (redesign, 2026-10-07): every open position and resting order
// on the account, each flagged by whose it is — AGENT (the trader opened
// it), HANDOVER (you handed it over: fully managed), MANUAL (yours: never
// touched) — with the hand-over / take-back controls (components/
// TradingBook.tsx, unchanged semantics: inline confirm, 202 queued), the
// queued hand-overs, the resting orders, and the status route's hand-over
// aggregates. The agent never controls a MANUAL contract, and the page
// never says it does. Live value is display only.
import { useMemo } from "react";
import { compLabel, isObj, liveTotals, markSourceWords } from "../../lib/tradingConsole";
import {
  type Book, MarkLegend, OrdersTable, OwnerChip, PendingList, PositionsTable,
  bookCents, bookDollars, bookPl, bookWhen, keyOf, plTone, plural,
} from "../TradingBook";
import {
  DASH, Drawer, DrawerSection, ErrorNote, Freshness, InfoNote, KV, Metric, Panel,
  SubHead, Tech, ago, count, when,
} from "./primitives";
import type { Source } from "./useConsoleData";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

function HandoverAggregates({ d, now }: { d: Obj; now: number }) {
  void now;
  const keys = ["handed_over_contracts", "managed_markets", "risk_lowering_closes_today", "managed_at"];
  const h: Obj | null = obj(d.handover)
    ?? (keys.some((k) => k in d) ? { ...d, at: d.managed_at } : null);
  return (
    <Panel testid="ops-handover" title="Hand-over, as the newest tick counted it"
      meta="contracts you handed to the trader, what it manages, what stays yours · experimental, unproven">
      {!h ? (
        <p data-testid="handover-absent" className="text-[12px] text-ink-low">hand-over numbers are not on this backend</p>
      ) : (
        <>
          {typeof h.closes_error === "string" && (
            <p className="mb-2 text-[12px] text-warn">◆ today&apos;s risk-lowering closes could not be counted: {h.closes_error}</p>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric size="md" label="handed-over contracts" value={count(h.handed_over_contracts)}
              sub={"handed_markets" in h ? `in ${count(h.handed_markets)} markets` : undefined} />
            <Metric size="md" label="managed contracts" value={count(h.managed_contracts)} sub={`in ${count(h.managed_markets)} markets`} />
            <Metric size="md" label="yours (manual) contracts" value={count(h.manual_contracts)} />
            <Metric size="md" label="risk-lowering closes today" value={count(h.risk_lowering_closes_today)}
              sub="closes that went over a cap because they lowered risk" />
            <Metric size="md" label="clips" value={count(h.clips)} sub={`pending ${count(h.clips_pending)} · sold outside the trader`} />
            <Metric size="md" label="as of" value={when(h.at, true)}
              sub={typeof h.outcome === "string" ? <>reconcile <Tech>{h.outcome}</Tech></> : undefined} />
          </div>
          {("settlement_pending" in h || "vanished_ambiguous" in h) && (
            <p className="mt-3 text-[12px] text-ink-low">
              settlement pending {count(h.settlement_pending)} · vanished ambiguously{" "}
              <span className={(Number(h.vanished_ambiguous) || 0) > 0 ? "text-warn" : ""}>{count(h.vanished_ambiguous)}</span>
            </p>
          )}
        </>
      )}
    </Panel>
  );
}

function PositionInspector({ book, k }: { book: Book; k: string }) {
  const p = book.positions.find((x) => keyOf(x) === k);
  if (!p) return <InfoNote>This position is no longer in the newest book read — it may have closed or settled.</InfoNote>;
  const orders = book.orders.filter((o) => o.ticker === p.ticker);
  const pend = (book.pending ?? []).filter((q) => q.ticker === p.ticker);
  return (
    <div data-testid="position-inspector">
      <DrawerSection title="Ownership">
        <KV k="owners">
          <span className="flex flex-wrap gap-1">
            {p.own > 0 && <OwnerChip tone="trader" n={p.own} />}
            {p.handed_over > 0 && <OwnerChip tone="handed" n={p.handed_over} />}
            {p.manual > 0 && <OwnerChip tone="yours" n={p.manual} />}
          </span>
        </KV>
        <KV k="the trader manages">{p.managed} contracts (its own and the handed-over ones)</KV>
        <KV k="yours">{p.manual} contracts — the trader never touches these</KV>
      </DrawerSection>
      <DrawerSection title="Position">
        <KV k="side · contracts">{p.side.toUpperCase()} · {p.contracts}</KV>
        <KV k="average cost">{bookCents(p.avg_cost_cents)}</KV>
        <KV k="catalogue mark">{bookCents(p.mark_cents)}</KV>
        <KV k="at risk (worst case)">{bookDollars(p.at_risk_dollars)}</KV>
        <KV k="competition">{p.competition ? compLabel(p.competition) : DASH}</KV>
        <KV k="kickoff">{p.in_play ? "in play" : bookWhen(p.kickoff_utc)}</KV>
      </DrawerSection>
      <DrawerSection title="Live value (display only)">
        <KV k="live mark">{bookCents(p.live.live_mark_cents)} · {markSourceWords(p.live.mark_source)}</KV>
        <KV k="live value">{bookDollars(p.live.live_value_dollars)}</KV>
        <KV k="unrealised"><span className={plTone(p.live.unrealised_pl_dollars)}>{bookPl(p.live.unrealised_pl_dollars)}</span></KV>
        <KV k="how the mark was taken">{book.markSources[p.live.mark_source ?? "none"] ?? "the backend sent no description of this source"}</KV>
        <p className="mt-1 text-[11px] text-ink-low">The loss halts still count an in-play position at its cost until it settles.</p>
      </DrawerSection>
      <DrawerSection title={`Resting orders on this market (${orders.length})`}>
        {orders.length === 0 ? <KV k="orders">none</KV> : orders.map((o) => (
          <KV key={o.order_id} k={<>{o.side.toUpperCase()} {bookCents(o.price_cents)}</>}>
            {o.remaining} remaining · {o.owner === "trader" ? "agent" : "yours"} · expires {bookWhen(o.expires_utc)}
            <Tech className="block">{o.order_id}</Tech>
          </KV>
        ))}
      </DrawerSection>
      {pend.length > 0 && (
        <DrawerSection title="Queued hand-overs">
          {pend.map((q, i) => <KV key={i} k={q.status || "status not sent"}>{q.count ?? DASH} {q.side?.toUpperCase() ?? ""} · asked {bookWhen(q.requested_at)}</KV>)}
        </DrawerSection>
      )}
      <DrawerSection title="Technical details">
        <KV k="ticker"><Tech>{p.ticker}</Tech></KV>
        <KV k="mark source code"><Tech>{p.live.mark_source ?? "none"}</Tech></KV>
        <KV k="book version"><Tech>{book.version ?? "not stated"}</Tech></KV>
      </DrawerSection>
    </div>
  );
}

export function PortfolioView({ d, now, token, source, onPosted, selected, setSelected }: {
  d: Obj; now: number; token: string; source: Source<Book>; onPosted: () => void;
  selected: string | null; setSelected: (k: string | null) => void;
}) {
  const read = source.read;
  const book = source.last?.data ?? null;
  const at = source.last?.at ?? null;
  const stale = at !== null && (read.kind !== "ok" || now - at > 3 * source.cadenceMs);
  const live = useMemo(() => (book ? liveTotals(book.positions.map((p) => p.live)) : null), [book]);
  const sum = (f: (p: Book["positions"][number]) => number) => (book ? book.positions.reduce((s, p) => s + f(p), 0) : 0);
  const atRisk = book ? book.positions.filter((p) => p.at_risk_dollars !== null) : [];
  const queued = book?.pending ? book.pending.filter((q) => q.status === "queued").length : null;
  const sel = selected && book ? book.positions.find((p) => keyOf(p) === selected) ?? null : null;
  return (
    <div className="space-y-4">
      <Panel testid="ops-book" title="Positions & orders"
        meta={book ? <Freshness at={at} now={now} cadenceMs={source.cadenceMs} failed={read.kind === "error"} label="book" /> : undefined}>
        {read.kind === "unavailable" && (
          <p data-testid="book-unavailable" className="text-[12.5px] text-ink-low">
            Book not available yet — this backend does not serve the trader&apos;s positions and orders. The rest of the console is unaffected.
          </p>
        )}
        {read.kind === "refused" && <ErrorNote testid="book-error">token rejected — the backend refused it ({read.detail})</ErrorNote>}
        {read.kind === "error" && <ErrorNote testid="book-error" tone="warn">Could not read account positions — the book read failed (HTTP {read.status}) — {read.detail}</ErrorNote>}
        {read.kind === "idle" && !book && <InfoNote>reading the book…</InfoNote>}

        {book && (
          <div data-stale={stale || undefined}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-tc-line pb-3 md:grid-cols-4 xl:grid-cols-8">
              <Metric size="md" label="Positions" value={count(book.totals.positions)} />
              <Metric size="md" label="Resting orders" value={count(book.totals.orders)}
                sub={`${book.orders.filter((o) => o.owner === "trader").length} agent · ${book.orders.filter((o) => o.owner !== "trader").length} yours`} />
              <Metric size="md" label="Agent-opened" value={`${sum((p) => p.own)}`} sub="contracts (AGENT)" />
              <Metric size="md" label="Handed over" value={`${sum((p) => p.handed_over)}`} sub="contracts (HANDOVER)" />
              <Metric size="md" label="Yours" value={`${book.totals.manual}`} sub="contracts (MANUAL) — never touched" />
              <Metric size="md" label="At risk" value={atRisk.length ? bookDollars(atRisk.reduce((s, p) => s + (p.at_risk_dollars ?? 0), 0)) : DASH}
                sub={atRisk.length < book.positions.length ? `${book.positions.length - atRisk.length} without a figure, not summed` : "sum of the positions' worst cases"} />
              <Metric size="md" label="Live value" value={live?.value === null || !live ? DASH : bookDollars(live.value)}
                sub={live ? `${live.marked} of ${book.positions.length} marked` : undefined} />
              <Metric size="md" label="Unrealised" value={live ? bookPl(live.unrealised) : DASH}
                tone={live ? (plTone(live.unrealised) === "text-ink-mid" ? "text-ink-hi" : plTone(live.unrealised)) : "text-ink-hi"}
                sub={queued !== null ? `${queued} hand-over${queued === 1 ? "" : "s"} queued` : "display only"} />
            </div>
            <p data-testid="book-totals" className="tc-num mt-2 text-[12px] text-ink-low">
              {plural(book.totals.positions, "position")} · {plural(book.totals.orders, "resting order")}
              {" "}· trader manages {book.totals.managed} · yours {book.totals.manual}
              {" "}· account read {book.account_read_at
                ? `${when(book.account_read_at)}${Number.isFinite(Date.parse(book.account_read_at))
                  ? ` (${ago(now - Date.parse(book.account_read_at))} ago)` : ""}`
                : "— not yet"}
              {stale && <span className="text-warn"> · stale, {ago(now - at!)} old</span>}
            </p>
            {(book.totals.notListedPositions > 0 || book.totals.notListedOrders > 0) && (
              <p data-testid="book-not-listed" className="mt-0.5 text-[12px] text-warn">
                {plural(book.totals.notListedPositions, "more position")} and{" "}
                {plural(book.totals.notListedOrders, "more resting order")} on markets
                the trader does not track are not shown.
              </p>
            )}
            {live && book.positions.length > 0 && (
              <p data-testid="book-live-totals" className="tc-num mt-0.5 text-[12px] text-ink-low">
                live value <span className="text-ink-hi">{bookDollars(live.value)}</span>
                {" "}· unrealised{" "}
                <span data-testid="book-live-unrealised" className={plTone(live.unrealised)}>{bookPl(live.unrealised)}</span>
                {" "}· {live.marked} of {book.positions.length} with a live mark
                {live.unmarked > 0 && (
                  <span data-testid="book-live-unmarked" className="text-warn"> · {live.unmarked} without one, not counted</span>
                )}
                {live.unrealisedMissing > 0 && (
                  <span className="text-warn"> · {live.unrealisedMissing} with a value but no unrealised P&amp;L, not counted in it</span>
                )}
                {" "}· refreshed every 15 s · experimental, unproven
              </p>
            )}

            <div className="mt-4">
              <SubHead right="click a market for its inspector">Positions</SubHead>
              <PositionsTable book={book} token={token} onPosted={onPosted}
                onInspect={(k) => setSelected(k)} selected={selected} />
              <MarkLegend book={book} />
            </div>

            {book.pending && book.pending.length > 0 && (
              <div className="mt-5">
                <SubHead>Queued hand-overs</SubHead>
                <PendingList book={book} />
              </div>
            )}

            <div className="mt-5">
              <SubHead>Resting orders</SubHead>
              <p data-testid="book-orders-line" className="mb-1.5 text-[12px] text-ink-low">
                Resting orders can&apos;t be handed over yet — positions only.
              </p>
              <OrdersTable book={book} />
            </div>
          </div>
        )}
        <div className="mt-4 space-y-1 border-t border-tc-line pt-3">
          <p data-testid="book-note" className="text-[12px] leading-relaxed text-ink-low">
            The trader never touches positions marked Yours (MANUAL).
            Handed-over positions
            are fully managed: it may add or close within its limits; a close that
            lowers risk may go over a cap, but the halts and the kill switch
            still stop it. Experimental, unproven.
          </p>
          <p data-testid="book-live-note" className="text-[12px] leading-relaxed text-ink-low">
            Live value is what a position would fetch at its live mark now — the
            running in-play feed&apos;s book when the market is in play, the
            catalogue&apos;s bid otherwise. It is for watching only: the loss
            halts still count an in-play position at its cost until it settles.
          </p>
        </div>
      </Panel>

      <HandoverAggregates d={d} now={now} />

      <Drawer open={selected !== null && book !== null} onClose={() => setSelected(null)} testid="position-drawer"
        title={sel?.title ?? "Position"}
        subtitle={sel ? <>{sel.side.toUpperCase()} · {sel.contracts} contracts · <Tech>{sel.ticker}</Tech></> : undefined}>
        {book && selected && <PositionInspector book={book} k={selected} />}
      </Drawer>
    </div>
  );
}

// TRADES & GROUNDS, ON THE OPERATOR CONSOLE (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". So this section lists
// every order the trader placed and every row of contracts he handed over
// to it (handover, takeback, managed clip) — newest first, as the backend
// sends them — with the grounds it recorded when it placed (fair price and
// its parts, the blend weight and the learner's arm and bar, the maker
// price, the fee, the edge after fee against the bar, the guards and the
// risk checks, the in-play reads), what became of the order (fills,
// cancels, resting, expired), and, once its market settled in the
// trader's journal, the result and that row's own P&L. Above the table:
// the summary — totals, P&L by UTC day against the daily loss line the
// backend states, and by competition, market type, phase, price bucket and
// edge bucket.
//
// THE SEAL (Son's decision, 2026-10-06, "Everything, for my bets only"):
// results and P&L are shown for the trader's OWN orders and handed-over
// contracts only — the backend serves nothing else on this route — and
// this page is the operator's, token-gated, never linked for a visitor.
// The CSV is the operator's own download, never research data.
//
// WHAT IT READS: GET /api/ops/trading-ledger (the relay of the backend's
// operator-gated GET /api/admin/trading/ledger, trading-ledger-v1), every
// 60 s while a token is held, through lib/usePoll, with the filters as
// named query parameters; "Load older" asks for the next OFFSET while the
// backend says `page.has_more`. lib/tradingLedger.ts reads the payload and
// is the one place to align if the backend's contract moves; the recorded
// contract test is e2e/ops-trading-ledger-contract.spec.ts.
//
// MISSING IS NOT ZERO, A FAILED READ IS NOT AN EMPTY ONE. A value a row
// did not record reads "not recorded"; a P&L whose market has no journaled
// result reads "unsettled"; the CSV writes a missing value as an empty
// cell. A missing route reads "not available yet"; a refusal, an error, an
// answer that is not JSON, not an object, or carries no rows list is named.
//
// EXPERIMENTAL, UNPROVEN. "Edge" is the trader's own estimate at the time
// it placed — not a measured edge, not advice. This section reads; it
// places, cancels and changes nothing.
import {
  useCallback, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import {
  type Bucket, type DayBucket, LEDGER_PHASES, type Ledger, type LedgerRow,
  NOT_RECORDED, ROW_TYPE_WORDS, type Summary, blendWords, cents, compLabel,
  consensusWords, dollars, edgeBucketWords, edgeGroundWords, edgeNote, edgeWords,
  fairWords, familyWords, feeWords, fillWords, guardLines, handoverWords,
  inPlayLines, ledgerCsv, lifecycleLines, makerWords, modelWords, outcomeLines,
  parseLedger, phaseWords, pnlWords, priceBucketWords, resultWords, riskLines,
  signedDollars,
} from "../lib/tradingLedger";
import { FOCUS_COMPETITIONS } from "../lib/tradingConsole";
import { usePoll, type PollOutcome } from "../lib/usePoll";

const POLL_MS = 60_000;
/** A read older than three cadences is shown dimmed. */
const STALE_MS = 3 * POLL_MS;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

type Read =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "unavailable" }
  | { kind: "refused"; detail: string }
  | { kind: "error"; status: number; detail: string };

interface Filters { competition: string; phase: string; since: string; until: string }
const NO_FILTERS: Filters = { competition: "", phase: "", since: "", until: "" };

/** the query the page asks with — the named filters only. A day is sent
 *  as the bare date: the backend reads `since` from that day's start and
 *  `until` to that day's END. */
function queryOf(f: Filters, offset?: number): string {
  const q = new URLSearchParams();
  if (f.since && /^\d{4}-\d{2}-\d{2}$/.test(f.since)) q.set("since", f.since);
  if (f.until && /^\d{4}-\d{2}-\d{2}$/.test(f.until)) q.set("until", f.until);
  if (f.competition) q.set("competition", f.competition);
  if (f.phase) q.set("phase", f.phase);
  if (offset) q.set("offset", String(offset));
  const s = q.toString();
  return s ? `?${s}` : "";
}

function when(iso: string | null): string {
  if (!iso) return NOT_RECORDED;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const count = (n: number | null) => (n === null ? NOT_RECORDED : n.toLocaleString("en-US"));
const plTone = (n: number | null) => (n === null || n === 0 ? "text-ink-mid"
  : n > 0 ? "text-up" : "text-neg");
/** won–lost–unsettled; a count not sent is "?" (never 0) */
function wlu(b: Bucket): string {
  if (b.won === null && b.lost === null && b.unsettled === null) return NOT_RECORDED;
  const c = (n: number | null) => (n === null ? "?" : String(n));
  return `${c(b.won)}–${c(b.lost)}–${c(b.unsettled)}`;
}

const TH = "border-b border-line pb-1 pr-3 font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint whitespace-nowrap";
const TD = "py-1.5 pr-3 align-top";
const SUB = "mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low";
const CTRL = "rounded-md border border-line bg-bs px-2 py-1 font-mono text-[11px] text-ink-hi outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent";

// ----------------------------------------------------------- the summary

function Tile({ id, k, v, tone = "text-ink-hi" }: {
  id: string; k: string; v: string; tone?: string;
}) {
  return (
    <div data-testid={`ledger-total-${id}`}
      className="min-w-0 rounded-xl border border-line bg-bs px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</p>
      <p className={`mt-0.5 break-words font-mono text-sm tabular-nums ${tone}`}>{v}</p>
    </div>
  );
}

/** ONE DAY'S SETTLED P&L AS A BAR, zero in the middle, the daily loss
 *  limit as a dashed line on the loss side — at the same place every day. */
function DayBar({ pnl, limit, scale }: {
  pnl: number | null; limit: number | null; scale: number;
}) {
  const half = (v: number) => `${Math.min(50, (Math.abs(v) / scale) * 50)}%`;
  return (
    <div className="relative h-3 w-full min-w-[120px] rounded-sm bg-bs" role="presentation">
      <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
      {pnl !== null && pnl !== 0 && (
        <div data-testid="ledger-day-fill"
          className={`absolute inset-y-0.5 rounded-sm ${pnl > 0 ? "bg-up" : "bg-neg"}`}
          style={pnl > 0 ? { left: "50%", width: half(pnl) }
            : { right: "50%", width: half(pnl) }} />
      )}
      {limit !== null && limit > 0 && (
        <div data-testid="ledger-limit-line"
          className="absolute -inset-y-0.5 w-0 border-l border-dashed border-warn"
          style={{ left: `calc(50% - ${half(limit)})` }} />
      )}
    </div>
  );
}

function Days({ days, limit, limitFrom }: {
  days: DayBucket[] | null; limit: number | null;
  limitFrom: "summary" | "status" | null;
}) {
  const scale = Math.max(limit ?? 0,
    ...(days ?? []).map((d) => Math.abs(d.settled_pnl_dollars ?? 0)), 0.01);
  return (
    <>
      <h3 className={SUB}>settled P&amp;L by UTC day</h3>
      <p data-testid="ledger-day-limit" className="mb-1.5 font-mono text-[11px] text-ink-faint">
        {limit === null ? "daily loss limit not stated, so no line is drawn"
          : `daily loss limit ${dollars(limit)}${limitFrom === "status"
            ? " (from the status route)" : ""} — the dashed line`}
        {" "}· the day an order was placed · as the backend summed it
      </p>
      {days === null ? (
        <p className="font-mono text-[11px] text-ink-faint">by-day totals not sent</p>
      ) : days.length === 0 ? (
        <p className="font-mono text-[11px] text-ink-faint">no day in this window</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr>
                {["UTC day", "rows", "W–L–U", "settled P&L", "open", ""].map((h, i) => (
                  <th key={h || i} scope="col"
                    className={`${TH} ${i === 0 || i === 5 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                // THE BACKEND'S FLAG; with none, the line it states
                const hit = d.over_daily_limit ?? (d.settled_pnl_dollars !== null
                  && limit !== null && d.settled_pnl_dollars <= -limit);
                return (
                  <tr key={d.key} data-testid="ledger-day" data-day={d.key}
                    data-limit-hit={hit || undefined} className="border-b border-line/50">
                    <td className="whitespace-nowrap py-1 pr-3 text-ink-mid">{d.key}</td>
                    <td className="py-1 pr-3 text-right text-ink-hi">{count(d.rows)}</td>
                    <td className="py-1 pr-3 text-right text-ink-mid">{wlu(d)}</td>
                    <td className={`whitespace-nowrap py-1 pr-3 text-right ${plTone(d.settled_pnl_dollars)}`}>
                      {signedDollars(d.settled_pnl_dollars)}
                      {hit && <span className="ml-1 text-[10px] text-warn">limit reached</span>}
                    </td>
                    <td className="whitespace-nowrap py-1 pr-3 text-right text-ink-low">
                      {dollars(d.open_cost_dollars)}
                    </td>
                    <td className="w-1/2 py-1">
                      <DayBar pnl={d.settled_pnl_dollars} limit={limit} scale={scale} />
                    </td>
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

function GroupTable({ id, title, groups, label, order }: {
  id: string; title: string; groups: Bucket[] | null;
  label: (k: string) => string; order?: (a: Bucket, b: Bucket) => number;
}) {
  const rows = groups ? (order ? [...groups].sort(order) : groups) : null;
  return (
    <div className="min-w-0">
      <h3 className={SUB}>{title}</h3>
      {rows === null ? (
        <p className="font-mono text-[11px] text-ink-faint">not sent</p>
      ) : rows.length === 0 ? (
        <p className="font-mono text-[11px] text-ink-faint">none in this window</p>
      ) : (
        <div className="overflow-x-auto">
          <table data-testid={`ledger-by-${id}`}
            className="w-full min-w-[400px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr>
                {["", "rows", "W–L–U", "cost", "settled P&L", "open"].map((h, i) => (
                  <th key={h || i} scope="col"
                    className={`${TH} ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.key} data-testid="ledger-group-row" data-key={g.key}
                  className="border-b border-line/50">
                  <td className="min-w-[88px] py-1 pr-3 font-sans text-[12px] text-ink-mid">{label(g.key)}</td>
                  <td className="py-1 pr-3 text-right text-ink-hi">{count(g.rows)}</td>
                  <td className="whitespace-nowrap py-1 pr-3 text-right text-ink-mid">{wlu(g)}</td>
                  <td className="whitespace-nowrap py-1 pr-3 text-right text-ink-mid">{dollars(g.cost_dollars)}</td>
                  <td className={`whitespace-nowrap py-1 pr-3 text-right ${plTone(g.settled_pnl_dollars)}`}>
                    {signedDollars(g.settled_pnl_dollars)}
                  </td>
                  <td className="whitespace-nowrap py-1 text-right text-ink-low">{dollars(g.open_cost_dollars)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryBlock({ s, statusLimit }: { s: Summary | null; statusLimit: number | null }) {
  if (!s) {
    return (
      <p data-testid="ledger-summary-absent" className="font-mono text-[11px] text-ink-faint">
        summary not sent by this backend — the rows below are all there is
      </p>
    );
  }
  const t = s.totals;
  const limit = s.daily_loss_limit_dollars ?? statusLimit;
  const limitFrom = s.daily_loss_limit_dollars !== null ? "summary"
    : statusLimit !== null ? "status" : null;
  return (
    <div data-testid="ledger-summary">
      {t ? (
        <div data-testid="ledger-totals" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <Tile id="rows" k="rows" v={count(t.rows)} />
          <Tile id="orders" k="orders placed" v={count(t.orders)} />
          <Tile id="filled" k="filled" v={count(t.filled)} />
          <Tile id="won" k="won" v={count(t.won)} />
          <Tile id="lost" k="lost" v={count(t.lost)} />
          <Tile id="unsettled" k="unsettled" v={count(t.unsettled)} />
          <Tile id="not_filled" k="not filled" v={count(t.not_filled)} />
          <Tile id="cost" k="filled cost (fees in)" v={dollars(t.cost_dollars)} />
          <Tile id="fees" k="fees" v={dollars(t.fees_dollars)} />
          <Tile id="pnl" k="settled P&L" v={signedDollars(t.settled_pnl_dollars)}
            tone={plTone(t.settled_pnl_dollars)} />
          <Tile id="open" k="open (unsettled cost)" v={dollars(t.open_cost_dollars)} />
          {t.unknown !== null && t.unknown > 0 && (
            <Tile id="unknown" k="P&L unknown" v={count(t.unknown)} tone="text-warn" />
          )}
        </div>
      ) : (
        <p className="font-mono text-[11px] text-ink-faint">totals not sent</p>
      )}
      {!s.complete && (
        <p data-testid="ledger-incomplete" role="note" className="mt-1.5 font-mono text-[11px] text-warn">
          {`incomplete: ${t?.unknown ?? "some"} row${t?.unknown === 1 ? "" : "s"} had a fill `
            + "that could not be read, so their cost and P&L are not in these sums"}
        </p>
      )}
      <Days days={s.by_day} limit={limit} limitFrom={limitFrom} />
      <div className="grid gap-x-6 sm:grid-cols-2">
        <GroupTable id="competition" title="by competition" groups={s.by_competition}
          label={(k) => (k === "unknown" ? "competition not stated" : compLabel(k))}
          order={(a, b) => (COMP_ORDER.get(a.key) ?? 99) - (COMP_ORDER.get(b.key) ?? 99)
            || a.key.localeCompare(b.key)} />
        <GroupTable id="family" title="by market type" groups={s.by_family}
          label={(k) => (k === "unknown" ? "type not stated"
            : familyWords(k) === k ? k : `${familyWords(k)} (${k})`)} />
        <GroupTable id="phase" title="by phase" groups={s.by_phase} label={phaseWords} />
        <GroupTable id="price" title="by price (the side bought)" groups={s.by_price_bucket}
          label={priceBucketWords} />
        <GroupTable id="edge" title="by edge at placement (its own estimate)"
          groups={s.by_edge_bucket} label={edgeBucketWords} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------- the grounds

function G({ field, k, children }: { field: string; k: string; children: ReactNode }) {
  return (
    <div data-testid="ledger-ground" data-field={field} className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{k}</dt>
      <dd className="mt-0.5 break-words font-mono text-[11px] leading-snug text-ink-hi">{children}</dd>
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
      <p className="font-sans text-[12px] leading-snug text-ink-mid">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">why · </span>
        {r.why ?? NOT_RECORDED}
      </p>
      {order && g.status !== "recorded" && (
        <p className="font-mono text-[11px] text-warn">
          grounds {g.status === "truncated" ? "truncated — the inputs were too large to keep"
            : "not recorded on this row"} — every ground below is named as such
        </p>
      )}
      <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {order ? (
          <>
            <G field="fair" k="fair probability (its own)">{fairWords(g, r.side)}</G>
            <G field="consensus" k="bookmaker consensus">{consensusWords(g.consensus)}</G>
            <G field="model" k="our model (unvalidated)">{modelWords(g.model)}</G>
            <G field="blend" k="blend & learner">{blendWords(g.blend)}</G>
            <G field="maker" k="maker price">{makerWords(g)}</G>
            <G field="fee" k="fee">{feeWords(g)}</G>
            <G field="edge" k="edge after fee (its own estimate)">{edgeGroundWords(r)}</G>
            <G field="guards" k="guards at placement"><Lines ls={guardLines(g.guards)} /></G>
            <G field="risk" k="risk checks"><Lines ls={riskLines(g.risk)} /></G>
            <G field="in_play" k="in play"><Lines ls={inPlayLines(g.in_play)} /></G>
          </>
        ) : (
          <G field="handover" k={ROW_TYPE_WORDS[r.row_type]}>{handoverWords(g.handover)}</G>
        )}
        <G field="lifecycle" k="lifecycle"><Lines ls={lifecycleLines(r)} /></G>
        <G field="outcome" k="result (from the journal)"><Lines ls={outcomeLines(r)} /></G>
        <G field="cost" k="cost (fee in)">
          {dollars(r.cost_dollars)}{r.fee_dollars !== null ? ` · fee ${dollars(r.fee_dollars)}` : ""}
        </G>
        <G field="strategy_version" k="strategy">{r.strategy_version ?? NOT_RECORDED}</G>
        <G field="ticker" k="market">
          {r.market.ticker ?? NOT_RECORDED}
          {r.market.outcome_key_source ? ` · key from ${r.market.outcome_key_source}` : ""}
        </G>
        <G field="placed_at" k="placed (UTC)">
          {r.placed_at ?? NOT_RECORDED}{r.order_id ? ` · order ${r.order_id}` : ""}
        </G>
        <G field="not_recorded" k="not recorded on this row">
          {r.not_recorded.length ? r.not_recorded.join(", ") : "nothing missing"}
        </G>
      </dl>
    </div>
  );
}

// ------------------------------------------------------------- the table

const HEAD = ["", "time", "match", "contract", "side", "price",
  "size", "cost", "phase", "edge vs bar", "fill", "result", "P&L", "why"];
const RIGHT = new Set([5, 6, 7, 9, 12]);

function Row({ r, open, onToggle, boxW }: {
  r: LedgerRow; open: boolean; onToggle: () => void; boxW: number | null;
}) {
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
        data-placed-at={r.placed_at ?? undefined}
        data-phase={r.phase ?? ""} className="border-b border-line/50">
        <td className={`${TD} pl-1`}>
          <button type="button" data-testid="ledger-expand" aria-expanded={open}
            aria-controls={id} onClick={onToggle}
            aria-label={`${open ? "hide" : "show"} the grounds for ${r.market.contract ?? r.market.ticker ?? "this row"}`}
            className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-mid transition-colors hover:border-line-strong">
            {open ? "▾" : "▸"}
          </button>
        </td>
        <td data-testid="ledger-time" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {when(r.placed_at)}
        </td>
        <td data-testid="ledger-match" className={`${TD} min-w-[150px]`}>
          <span className="block font-sans text-[12px] text-ink-hi">
            {fx.label ?? (fx.home === null && fx.away === null ? "match not recorded"
              : `${fx.home ?? "home not recorded"} v ${fx.away ?? "away not recorded"}`)}
          </span>
          <span className="block text-[10px] text-ink-faint">
            {compLabel(r.competition)} · kickoff {when(fx.kickoff_utc)}
          </span>
          {fx.key_source === "same_event" && (
            <span data-testid="ledger-fixture-borrowed" className="block text-[10px] text-ink-faint">
              fixture from an order on the same Kalshi event (not recorded on this row)
            </span>
          )}
        </td>
        <td data-testid="ledger-contract" className={`${TD} min-w-[160px]`}>
          <span className="block font-sans text-[12px] text-ink-hi">
            {r.market.contract ?? `contract ${NOT_RECORDED}`}
            {r.row_type !== "order" && (
              <span data-testid="ledger-handed-chip"
                className="ml-1.5 whitespace-nowrap rounded-full border border-accent/50 px-1.5 text-[10px] text-accent">
                {ROW_TYPE_WORDS[r.row_type]}
              </span>
            )}
          </span>
          <span className="block break-all text-[10px] text-ink-faint">{r.market.ticker ?? `ticker ${NOT_RECORDED}`}</span>
          <span className="block text-[10px] text-ink-faint">
            {`${familyWords(r.market.family)} · ${r.market.outcome_key ?? NOT_RECORDED}`}
          </span>
        </td>
        <td data-testid="ledger-side" className={`${TD} text-ink-hi`}>
          {r.side ? r.side.toUpperCase() : NOT_RECORDED}
        </td>
        <td data-testid="ledger-price" className={`${TD} whitespace-nowrap text-right text-ink-hi`}>
          {cents(r.price_cents)}
          <span className="block text-[10px] text-ink-faint">
            YES book {cents(r.yes_book_price_cents)}
          </span>
        </td>
        <td data-testid="ledger-size" className={`${TD} text-right text-ink-hi`}>{count(r.count)}</td>
        <td data-testid="ledger-cost" className={`${TD} whitespace-nowrap text-right text-ink-hi`}>
          {dollars(r.cost_dollars)}
          {r.fee_dollars !== null && (
            <span className="block text-[10px] text-ink-faint">fee {dollars(r.fee_dollars)}</span>
          )}
        </td>
        <td data-testid="ledger-phase" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {phaseWords(r.phase)}
          {minute !== null && <span className="text-live"> · {minute}′</span>}
        </td>
        <td data-testid="ledger-edge" data-clears={cleared || undefined}
          className={`${TD} whitespace-nowrap text-right ${cleared ? "font-semibold text-ink-hi" : "text-ink-low"}`}>
          {edgeWords(r)}
          {note && <span className="block text-[10px] font-normal text-ink-faint">{note}</span>}
        </td>
        <td data-testid="ledger-fill" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {fillWords(r)}
          {r.lifecycle.cancels.length > 0 && (
            <span className="block text-[10px] text-ink-faint">
              {r.lifecycle.cancels.map((c) => c.reason ?? NOT_RECORDED).join(", ")}
            </span>
          )}
        </td>
        <td data-testid="ledger-result"
          className={`${TD} whitespace-nowrap ${o === "won" ? "text-up" : o === "lost" ? "text-neg" : "text-ink-mid"}`}>
          {resultWords(r)}
        </td>
        <td data-testid="ledger-pnl"
          className={`${TD} whitespace-nowrap text-right ${o === "won" || o === "lost"
            ? plTone(r.outcome.pnl_dollars) : "text-ink-mid"}`}>
          {pnlWords(r)}
        </td>
        <td data-testid="ledger-why" className={`${TD} min-w-[260px] max-w-[340px] font-sans text-[12px] leading-snug text-ink-mid`}>
          <span className="line-clamp-3">{r.why ?? NOT_RECORDED}</span>
        </td>
      </tr>
      {open && (
        <tr id={id} data-testid="ledger-grounds" data-row-id={r.id}
          data-ticker={r.market.ticker ?? ""} className="border-b border-line bg-bs/60">
          <td colSpan={HEAD.length} className="p-0">
            {/* STICKY AT THE BOX'S LEFT EDGE AND THE BOX'S WIDTH, so at
                phone width the grounds are read in view, not off to the
                side of a 1,200px table */}
            <div data-testid="ledger-grounds-body" className="sticky left-0 p-3"
              style={boxW ? { width: boxW } : undefined}>
              <Grounds r={r} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// --------------------------------------------------------------- body

/** "20261006-1405Z" */
const stamp = () => new Date().toISOString().replace(/[-:]/g, "")
  .replace(/^(\d{8})T(\d{4}).*$/, "$1-$2Z");

export function TradingLedger({ token, statusDailyLimit }: {
  token: string;
  /** the status route's daily loss limit, dollars — used, and named, only
   *  when the ledger's summary states none */
  statusDailyLimit: number | null;
}) {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ l: Ledger; at: number } | null>(null);
  const [older, setOlder] = useState<LedgerRow[]>([]);
  /** the offset after the older pages; undefined until one is loaded */
  const [olderNext, setOlderNext] = useState<number | null | undefined>(undefined);
  const [more, setMore] = useState<{ busy: boolean; error: string | null }>(
    { busy: false, error: null });
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [now, setNow] = useState(() => Date.now());
  const [boxW, setBoxW] = useState<number | null>(null);
  const [known, setKnown] = useState<{ comps: string[]; phases: string[] }>(
    { comps: [...FOCUS_COMPETITIONS], phases: [...LEDGER_PHASES] });
  const gen = useRef(0);
  const observer = useRef<ResizeObserver | null>(null);
  const q = queryOf(filters);

  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch(`/api/ops/trading-ledger${q}`, {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      if (signal.aborted) return "ok";
      // NAMED, NEVER AN EMPTY LEDGER: an answer that is not JSON is said
      // by its status
      if (r.status === 404) {
        setRead({ kind: "unavailable" });
        setLast(null);
        return "ok";
      }
      if (r.status === 403) {
        setRead({ kind: "refused", detail: "HTTP 403" });
        setLast(null);
        return "stop";
      }
      setRead({ kind: "error", status: r.status,
        detail: `the answer was not JSON (${String(err)})` });
      return "failed";
    }
    if (signal.aborted) return "ok";
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body) && Array.isArray(body.rows)) {
      const l = parseLedger(body);
      const at = Date.now();
      setRead({ kind: "ok" });
      setLast({ l, at });
      setNow(at);
      // the backend's own phase keys are the filter's options; every
      // competition ever named stays one
      const vocab = Object.keys(l.vocab.phases);
      setKnown((k) => ({
        comps: [...new Set([...k.comps,
          ...(l.summary?.by_competition ?? []).map((g) => g.key).filter((c) => c !== "unknown"),
          ...l.rows.map((x) => x.competition).filter((c): c is string => !!c)])],
        phases: vocab.length ? vocab : k.phases,
      }));
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status,
      detail: !r.ok ? detail : !isObj(body)
        ? "the answer was not an object, so there is no ledger to draw"
        : "the answer carried no rows list, so there is no ledger to draw" });
    return "failed";
  }, POLL_MS, [token, q], token !== "");

  useEffect(() => {
    if (!last) return;
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, [last]);

  // THE SCROLL BOX'S WIDTH, so an opened row's grounds fit it. A callback
  // ref: the box mounts only once a read holds rows, and again after a
  // filter empties and refills it.
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

  const reset = () => {
    gen.current += 1;
    setOlder([]);
    setOlderNext(undefined);
    setMore({ busy: false, error: null });
    setLast(null);
    setRead({ kind: "idle" });
  };
  const setFilter = (k: keyof Filters, v: string) => {
    setFilters((f) => ({ ...f, [k]: v }));
    reset();
  };
  const clearFilters = () => {
    setFilters(NO_FILTERS);
    reset();
  };

  const l = last?.l ?? null;
  // AS SENT, newest first; an older page is appended after it. A row
  // already drawn (the window moved between reads) is not drawn twice.
  const rows = useMemo(() => {
    if (!l) return [];
    const seen = new Set<number>();
    const out: LedgerRow[] = [];
    for (const r of [...l.rows, ...older]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  }, [l, older]);
  const nextOffset = olderNext === undefined ? l?.next_offset ?? null : olderNext;
  const stale = last !== null && (read.kind !== "ok" || now - last.at > STALE_MS);
  const filtered = filters.competition !== "" || filters.phase !== ""
    || filters.since !== "" || filters.until !== "";

  // AN OLDER PAGE, by the backend's offset. Every failure is put on the
  // page by name; a page that arrives after the filters changed is
  // dropped, not appended to another window.
  const loadOlder = async () => {
    if (nextOffset === null) return;
    const mine = gen.current;
    const current = () => gen.current === mine;
    setMore({ busy: true, error: null });
    let r: Response;
    try {
      r = await fetch(`/api/ops/trading-ledger${queryOf(filters, nextOffset)}`, {
        headers: { "x-admin-token": token }, cache: "no-store",
      });
    } catch (err) {
      if (current()) setMore({ busy: false, error: `no answer came back (${String(err)})` });
      return;
    }
    let body: unknown;
    try {
      body = await r.json();
    } catch (err) {
      if (current()) {
        setMore({ busy: false,
          error: `HTTP ${r.status} — the answer was not JSON (${String(err)})` });
      }
      return;
    }
    if (!current()) return;
    if (r.ok && isObj(body) && Array.isArray(body.rows)) {
      const page = parseLedger(body);
      setOlder((o) => [...o, ...page.rows]);
      setOlderNext(page.next_offset);
      setMore({ busy: false, error: null });
      return;
    }
    setMore({ busy: false, error: `HTTP ${r.status}${isObj(body)
      && typeof body.detail === "string" ? ` — ${body.detail}` : ""}` });
  };

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

  const toggle = (k: number) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

  const page = l?.page ?? null;

  return (
    <section data-testid="ops-ledger" aria-labelledby="ops-ledger-h"
      className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <h2 id="ops-ledger-h"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        Trades &amp; grounds
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
        <span className="font-mono text-warn">experimental · unproven</span> —
        every order the trader placed and every contract you handed over to
        it: the grounds it recorded when it placed, what became of the
        order, and — once its market settled in the trader&apos;s journal —
        the result and that order&apos;s own P&amp;L. &ldquo;Edge&rdquo; is
        the trader&apos;s own estimate at the time, not evidence of an edge,
        and our model&apos;s number is unvalidated. Only the trader&apos;s
        orders and handed-over contracts: your own manual bets are not here.
        Prices in cents of the side bought (the YES book beside it); money
        in dollars.
      </p>

      <div data-testid="ledger-filters" role="group" aria-label="filter the ledger"
        className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">competition</span>
          <select data-testid="ledger-filter-competition" value={filters.competition}
            onChange={(e) => setFilter("competition", e.target.value)} className={CTRL}>
            <option value="">all</option>
            {known.comps.map((c) => <option key={c} value={c}>{compLabel(c)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">phase</span>
          <select data-testid="ledger-filter-phase" value={filters.phase}
            onChange={(e) => setFilter("phase", e.target.value)} className={CTRL}>
            <option value="">all</option>
            {known.phases.map((p) => <option key={p} value={p}>{phaseWords(p)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">from (UTC day)</span>
          <input type="date" data-testid="ledger-filter-since" value={filters.since}
            onChange={(e) => setFilter("since", e.target.value)} className={CTRL} />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">to (UTC day)</span>
          <input type="date" data-testid="ledger-filter-until" value={filters.until}
            onChange={(e) => setFilter("until", e.target.value)} className={CTRL} />
        </label>
        {filtered && (
          <button type="button" data-testid="ledger-filter-clear" onClick={clearFilters}
            className={`${CTRL} text-ink-mid`}>clear filters</button>
        )}
        {rows.length > 0 && (
          <span className="ml-auto flex flex-col items-end gap-0.5">
            <button type="button" data-testid="ledger-export" onClick={exportCsv}
              className={`${CTRL} border-accent/60`}>Export CSV</button>
            <span className="font-mono text-[10px] text-ink-faint">
              the {rows.length} loaded rows · blank cell = not recorded · your
              own download, never research data
            </span>
          </span>
        )}
      </div>

      <div className="mt-3">
        {read.kind === "unavailable" && (
          <p data-testid="ledger-unavailable" className="font-mono text-[12px] text-ink-low">
            Trades &amp; grounds not available yet — this backend does not serve
            the trader&apos;s ledger. The rest of the console is unaffected.
          </p>
        )}
        {read.kind === "refused" && (
          <p data-testid="ledger-error" role="alert" className="font-mono text-[12px] text-neg">
            token rejected — the backend refused it ({read.detail})
          </p>
        )}
        {read.kind === "error" && (
          <p data-testid="ledger-error" role="alert" className="font-mono text-[12px] text-warn">
            the ledger read failed (HTTP {read.status}) — {read.detail}
          </p>
        )}
        {read.kind === "idle" && !l && (
          <p className="font-mono text-[11px] text-ink-faint">reading the ledger…</p>
        )}

        {l && (
          <div data-testid="ledger-body" data-stale={stale || undefined}
            className={`transition-opacity ${stale ? "opacity-50" : ""}`}>
            {page?.scan_complete === false && (
              <p data-testid="ledger-scan-partial" role="note"
                className="mb-2 font-mono text-[11px] text-warn">
                only the newest {page.scan_max ?? "?"} journal rows were read — the
                summary and these rows cover those; narrow the dates to see older ones
              </p>
            )}
            <SummaryBlock s={l.summary} statusLimit={statusDailyLimit} />

            <h3 className={SUB}>every order, newest first</h3>
            <p data-testid="ledger-count" className="mb-1.5 font-mono text-[11px] text-ink-faint">
              {rows.length} row{rows.length === 1 ? "" : "s"}
              {page?.matching !== null && page?.matching !== undefined
                && page.matching !== rows.length ? ` of ${page.matching}` : ""}
              {" "}· newest first · {nextOffset !== null ? "more on the backend" : "all loaded"}
              {l.unreadable > 0 && (
                <span className="text-warn">
                  {" "}· {l.unreadable} row{l.unreadable === 1 ? "" : "s"} unreadable (not a ledger row), not drawn
                </span>
              )}
              {` · read ${when(new Date(last!.at).toISOString())}`}
              {stale && ` · stale, ${ago(now - last!.at)} old`}
            </p>
            {rows.length === 0 ? (
              <p data-testid="ledger-none" className="font-mono text-[11px] text-ink-faint">
                {filtered ? "No orders match these filters." : "No orders on record in this window."}
              </p>
            ) : (
              <div ref={box} className="overflow-x-auto">
                <table data-testid="ledger-table"
                  className="w-full min-w-[1240px] border-collapse font-mono text-xs tabular-nums">
                  <thead>
                    <tr>
                      {HEAD.map((h, i) => (
                        <th key={h || i} scope="col"
                          className={`${TH} ${RIGHT.has(i) ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <Row key={r.id} r={r} open={open.has(r.id)}
                        onToggle={() => toggle(r.id)} boxW={boxW} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {nextOffset !== null && (
              <button type="button" data-testid="ledger-more" onClick={loadOlder}
                disabled={more.busy} className={`${CTRL} mt-2 text-ink-mid disabled:opacity-40`}>
                {more.busy ? "loading older…" : "Load older"}
              </button>
            )}
            {more.error && (
              <p data-testid="ledger-more-error" role="alert" className="mt-1 font-mono text-[11px] text-warn">
                the older page could not be read — {more.error}
              </p>
            )}
            <p className="mt-3 font-mono text-[10px] text-ink-faint">
              {l.version ?? "version not stated"}{l.env ? ` · ${l.env}` : ""} · generated {when(l.generated_at)}
              {" "}· read every 60 s while a token is held
            </p>
            {l.seal && (
              <p data-testid="ledger-seal" className="mt-1 font-mono text-[10px] text-ink-faint">
                {l.seal}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

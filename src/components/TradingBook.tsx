// THE TRADER'S BOOK, ON THE OPERATOR CONSOLE (2026-10-03; redesigned into
// the Portfolio view 2026-10-07).
//
// Son: "should the trader display every orders, bets, then flag my orders
// and then I can choose in the console whenever I want the trader to take
// care of it, if not then it cant touch it?" — so the Portfolio view shows
// every open position and resting order on the account, each flagged by
// whose it is, and lets him hand a position to the trader or take it back.
// Those on markets the trader's catalogue does not list (combos, markets
// newer than its last refresh) are not drawn; the backend COUNTS them
// (totals.not_listed_*) and the view says how many.
//
// OWNERSHIP, per position (GET /api/ops/trading-book, trading-book-v1):
//   AGENT N      contracts the trader opened itself (`own`)
//   HANDOVER N   contracts he handed to it (`handed_over`) — FULLY managed:
//                it may add or close within its limits
//   MANUAL N     contracts the trader never touches (`manual`, "Yours")
// Only the non-zero ones are drawn. An order whose owner is not stated as
// "trader" is shown as his — this page never claims the trader holds
// something the backend did not say it holds.
//
// WHAT CAN BE HANDED OVER: filled contracts only. Resting orders are
// listed and flagged, with no buttons.
//
// CONFIRMATION IS INLINE (a count field with Confirm / Cancel), never
// window.confirm. After every POST the outcome is said in plain words and
// the book is read again at once. A hand-over the backend queued answers
// 202 {queued: true}: "Queued — hands over at the next live price".
//
// LIVE VALUE is DISPLAY ONLY: the halts keep his "in play at cost until it
// settles" rule. A position with no live mark draws "—" and "no live
// price"; a missing value is never summed as $0. Experimental, unproven.
//
// The book is READ by components/console/useConsoleData.tsx (above every
// view, so a view switch never drops it); this file parses it and holds
// the one write — the hand-over and take-back.
import { Fragment, useState, type ReactNode } from "react";
import {
  compLabel, type LiveValue, markSourceWords, parseLiveValue,
} from "../lib/tradingConsole";
import { Info } from "./console/primitives";

type Obj = Record<string, unknown>;
type Side = "yes" | "no";
type Action = "handover" | "takeback";

export interface Position {
  ticker: string; title: string; competition: string | null;
  kickoff_utc: string | null; in_play: boolean; side: Side;
  contracts: number; own: number; handed_over: number; managed: number;
  manual: number; avg_cost_cents: number | null; mark_cents: number | null;
  at_risk_dollars: number | null;
  /** the live mark, value, unrealised P&L and mark source — display only */
  live: LiveValue;
}

export interface Order {
  order_id: string; ticker: string; title: string; competition: string | null;
  side: Side; price_cents: number | null; remaining: number;
  owner: "trader" | "manual"; expires_utc: string | null;
}

/** A hand-over the backend queued until the market's next live price. */
export interface Pending {
  ticker: string; side: Side | null; count: number | null;
  requested_at: string | null; status: string; reason: string | null;
  price_cents: number | null;
}

export interface Book {
  /** the backend's queued hand-overs; null when it does not send them */
  pending: Pending[] | null;
  version: string | null; generated_at: string | null;
  account_read_at: string | null; positions: Position[]; orders: Order[];
  totals: { positions: number; orders: number; managed: number; manual: number;
            /** on markets the catalogue does not list: counted, not drawn */
            notListedPositions: number; notListedOrders: number };
  /** the backend's own sentence for each live mark source, when sent */
  markSources: Record<string, string>;
}

interface Edit { key: string; action: Action; ticker: string; side: Side; value: string }
interface Outcome { ok: boolean; text: string }

// ------------------------------------------------------------ readers

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const whole = (v: unknown): number => Math.max(0, Math.trunc(num(v) ?? 0));
const str = (v: unknown): string | null =>
  typeof v === "string" && v !== "" ? v : null;
const sideOf = (v: unknown): Side | null => (v === "yes" || v === "no" ? v : null);

export function parseBook(b: Obj): Book {
  const positions: Position[] = [];
  for (const p of Array.isArray(b.positions) ? b.positions : []) {
    if (!isObj(p)) continue;
    const ticker = str(p.ticker);
    const side = sideOf(p.side);
    if (!ticker || !side) continue;
    positions.push({
      ticker, side, title: str(p.title) ?? ticker,
      competition: str(p.competition), kickoff_utc: str(p.kickoff_utc),
      in_play: p.in_play === true, contracts: whole(p.contracts),
      own: whole(p.own), handed_over: whole(p.handed_over),
      managed: whole(p.managed), manual: whole(p.manual),
      avg_cost_cents: num(p.avg_cost_cents), mark_cents: num(p.mark_cents),
      at_risk_dollars: num(p.at_risk_dollars),
      live: parseLiveValue(p),
    });
  }
  const orders: Order[] = [];
  for (const o of Array.isArray(b.orders) ? b.orders : []) {
    if (!isObj(o)) continue;
    const ticker = str(o.ticker);
    const side = sideOf(o.side);
    if (!ticker || !side) continue;
    orders.push({
      order_id: str(o.order_id) ?? `${ticker}-${orders.length}`, ticker, side,
      title: str(o.title) ?? ticker, competition: str(o.competition),
      price_cents: num(o.price_cents), remaining: whole(o.remaining),
      // NOT STATED AS THE TRADER'S IS SHOWN AS HIS
      owner: o.owner === "trader" ? "trader" : "manual",
      expires_utc: str(o.expires_utc),
    });
  }
  // MISSING IS NOT EMPTY: a backend that does not send the field draws
  // nothing; only an array is read
  let pending: Pending[] | null = null;
  if (Array.isArray(b.pending_handovers)) {
    pending = [];
    for (const q of b.pending_handovers) {
      if (!isObj(q)) continue;
      const ticker = str(q.ticker);
      if (!ticker) continue;
      pending.push({
        ticker, side: sideOf(q.side), count: num(q.count),
        requested_at: str(q.requested_at), status: str(q.status) ?? "",
        reason: str(q.reason),
        price_cents: num(q.price_cents) ?? num(q.completed_price_cents),
      });
    }
  }
  const t = isObj(b.totals) ? b.totals : {};
  const markSources: Record<string, string> = {};
  if (isObj(b.mark_sources)) {
    for (const [k, w] of Object.entries(b.mark_sources)) {
      if (typeof w === "string") markSources[k] = w;
    }
  }
  return {
    pending, markSources,
    version: str(b.version), generated_at: str(b.generated_at),
    account_read_at: str(b.account_read_at), positions, orders,
    totals: {
      positions: num(t.positions) ?? positions.length,
      orders: num(t.orders) ?? orders.length,
      managed: num(t.managed_contracts)
        ?? positions.reduce((s, p) => s + p.managed, 0),
      manual: num(t.manual_contracts)
        ?? positions.reduce((s, p) => s + p.manual, 0),
      notListedPositions: whole(t.not_listed_positions),
      notListedOrders: whole(t.not_listed_orders),
    },
  };
}

// --------------------------------------------------------- formatting

export const ABSENT = "—";
export const bookCents = (n: number | null) =>
  n === null ? ABSENT : `${Number.isInteger(n) ? n : n.toFixed(1)}¢`;
export const bookDollars = (n: number | null) => (n === null ? ABSENT : `$${n.toFixed(2)}`);
/** a gain or a loss: "+$1.20", "−$0.40" */
export const bookPl = (n: number | null) => (n === null ? ABSENT
  : `${n > 0 ? "+" : n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`);
export const plTone = (n: number | null) => (n === null || n === 0 ? "text-ink-mid"
  : n > 0 ? "text-up" : "text-neg");
export const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

export function bookWhen(iso: string | null): string {
  if (!iso) return ABSENT;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ------------------------------------------------- what an answer says

const ERROR_WORDS: Record<string, string> = {
  not_held: "you no longer hold this",
  more_than_yours: "that is more contracts than are yours to hand over",
  more_than_handed: "that is more contracts than you handed over",
  market_not_trading: "market closed",
  account_unreadable:
    "the trader hasn't read the account recently — try again in a minute",
  bad_request: "the request wasn't understood, so nothing changed",
};

function describe(e: Edit, n: number, title: string, status: number,
                  body: unknown): Outcome {
  const b = isObj(body) ? body : {};
  const SIDE = e.side.toUpperCase();
  if (status === 202 && b.queued === true) {
    // the backend queued it until the market's next live price
    return { ok: true, text: e.action === "handover"
      ? `Queued — hands over at the next live price (${plural(n, `${SIDE} contract`)} on ${title}).`
      : `Queued — takes back at the next live price (${plural(n, `${SIDE} contract`)} on ${title}).` };
  }
  if (status >= 200 && status < 300 && b.ok === true) {
    const managed = whole(b.managed);
    const manual = whole(b.manual);
    if (b.repeat === true) {
      // the backend's repeat guard: the same request a moment ago
      return { ok: true, text: `Already done a moment ago — nothing new was `
        + `sent. The trader manages ${managed} here; ${manual} `
        + `${manual === 1 ? "is" : "are"} yours.` };
    }
    return e.action === "handover"
      ? { ok: true, text: `Handed ${plural(n, `${SIDE} contract`)} on ${title} `
          + `to the trader. It now manages ${managed} here; ${manual} `
          + `${manual === 1 ? "stays" : "stay"} yours.` }
      : { ok: true, text: `Took back ${plural(n, `${SIDE} contract`)} on ${title}. `
          + `${manual} ${manual === 1 ? "is" : "are"} yours; the trader `
          + `manages ${managed} here.` };
  }
  const verb = e.action === "handover" ? "Hand-over" : "Take-back";
  const code = str(b.error);
  const detail = str(b.detail);
  let why: string;
  if (code === "more_than_yours" && detail) {
    // the backend names what is committed to his resting closing orders
    why = `${ERROR_WORDS[code]} (${detail})`;
  } else if (code && ERROR_WORDS[code]) why = ERROR_WORDS[code];
  else if (status === 403) why = "token rejected";
  else if (status === 404 || b.available === false) {
    why = "hand-over is not available on this backend yet";
  } else if (status === 504) {
    why = "no answer in time — the book below is read again to show "
      + "whether it went through";
  } else {
    why = `HTTP ${status}${code ? ` · ${code}` : ""}${detail ? ` — ${detail}` : ""}`;
  }
  return { ok: false, text: `${verb} failed: ${why}.` };
}

/** A queued hand-over's status, in plain words. An unrecognised status
 *  is said as exactly that — never folded into one of the four. */
export function pendingWords(q: {
  status: string; reason: string | null; price_cents: number | null;
}): string {
  switch (q.status) {
    case "queued": return "queued — will hand over at the next live price";
    case "completed":
      return q.price_cents === null ? "completed" : `completed at ${bookCents(q.price_cents)}`;
    case "expired": return `expired: ${q.reason ?? "no reason given"}`;
    case "cancelled": return q.reason ? `cancelled — ${q.reason}` : "cancelled";
    default: return `status not recognised (${q.status || "none sent"})`;
  }
}

const PENDING_TONE: Record<string, string> = {
  queued: "border-tc-line-strong text-ink-hi",
  completed: "border-tc-line text-ink-mid",
  expired: "border-warn/50 text-warn",
  cancelled: "border-tc-line text-ink-low",
};

// ------------------------------------------------------------- pieces

/** OWNERSHIP, unmistakable and never colour alone: a word and a count. */
const OWNER: Record<"trader" | "handed" | "yours", { cls: string; word: string; title: string }> = {
  trader: { cls: "border-tc-line-strong text-ink-mid", word: "AGENT",
    title: "Contracts the trader opened itself" },
  handed: { cls: "border-ink-mid/50 text-ink-hi", word: "HANDOVER",
    title: "Contracts you handed to the trader: it fully manages them within its limits" },
  yours: { cls: "border-ink-hi/70 bg-ink-hi/[0.06] font-semibold text-ink-hi", word: "MANUAL",
    title: "Yours: the trader never touches these" },
};

export function OwnerChip({ tone, n }: { tone: keyof typeof OWNER; n?: number }) {
  const o = OWNER[tone];
  return (
    <span data-testid={`chip-${tone}`} title={o.title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] border px-1.5 py-[1px] text-[10.5px] tracking-[0.04em] ${o.cls}`}>
      {o.word}{n !== undefined && <>{" "}<span className="tc-num">{n}</span></>}
    </span>
  );
}

const TH = "border-b border-tc-line px-2.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low whitespace-nowrap";
const TD = "border-b border-tc-line px-2.5 py-1 align-top whitespace-nowrap";
const BTN = "whitespace-nowrap rounded-md border px-2 py-1 text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40";

function Market({ title, ticker }: { title: string; ticker: string }) {
  return (
    <>
      <span title={title} className="block truncate text-[12.5px] leading-snug text-ink-hi">{title}</span>
      <span title={ticker} className="block truncate font-mono text-[10.5px] text-ink-low">{ticker}</span>
    </>
  );
}

export const keyOf = (p: { ticker: string; side: Side }) => `${p.ticker}|${p.side}`;

/** The positions table's columns. Live value and unrealised sit next to the
 *  market, so at phone width the live numbers are on screen before
 *  anything is scrolled to. */
const POSITION_HEAD = ["market", "side", "live value", "unrealised",
  "contracts", "owner", "cost · mark", "at risk", "league · time", ""];
const RIGHT = new Set([2, 3, 4, 6, 7]);

// --------------------------------------------------- positions + write

export function PositionsTable({ book, token, onPosted, onInspect, selected }: {
  book: Book; token: string; onPosted: () => void;
  onInspect?: (key: string) => void; selected?: string | null;
}) {
  const [edit, setEdit] = useState<Edit | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const open = (p: Position, action: Action) => {
    const max = action === "handover" ? p.manual : p.handed_over;
    // a hand-over defaults to what is FREE: his contracts less those his
    // own resting orders would close (a buy of the other side), which the
    // backend refuses to hand over (more_than_yours)
    const committed = action !== "handover" ? 0
      : book.orders.filter((o) => o.ticker === p.ticker
        && o.owner === "manual" && o.side !== p.side)
        .reduce((s, o) => s + o.remaining, 0);
    const free = Math.max(0, max - committed);
    setOutcome(null);
    setEdit({ key: keyOf(p), action, ticker: p.ticker, side: p.side,
              value: String(free >= 1 ? free : max) });
  };

  const submit = async (e: Edit, n: number, title: string) => {
    setBusy(true);
    let o: Outcome;
    try {
      const r = await fetch("/api/ops/trading-handover", {
        method: "POST", cache: "no-store",
        headers: { "x-admin-token": token, "content-type": "application/json" },
        body: JSON.stringify({ action: e.action, ticker: e.ticker,
                               side: e.side, contracts: n }),
      });
      let body: unknown = null;
      try { body = await r.json(); } catch {
        /* SWALLOWED(tradingbook:post-body-parse) — registered in
           e2e/missing-is-not-zero.spec.ts with its closes_when. */
      }
      o = describe(e, n, title, r.status, body);
    } catch {
      /* SWALLOWED(tradingbook:post-no-answer) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
      o = { ok: false, text: `${e.action === "handover" ? "Hand-over" : "Take-back"} `
        + "failed: no answer came back — the book below is read again to "
        + "show whether it went through." };
    }
    setBusy(false);
    setEdit(null);
    setOutcome(o);
    onPosted();
  };

  return (
    <>
      {outcome && (
        <p data-testid="book-outcome" data-ok={outcome.ok ? "true" : "false"}
          role={outcome.ok ? "status" : "alert"}
          className={`mb-3 rounded-md border px-3 py-2 text-[12.5px] ${
            outcome.ok ? "border-tc-line-strong text-ink-hi" : "border-warn/40 text-warn"}`}>
          {outcome.text}
        </p>
      )}
      {book.positions.length === 0 ? (
        <p data-testid="book-positions-empty"
          className="rounded-md border border-dashed border-tc-line px-3 py-3 text-[12.5px] text-ink-low">
          {book.totals.notListedPositions > 0
            ? "No open positions on markets the trader tracks."
            : "No open positions on the account."}
        </p>
      ) : (
        <div className="tc-scroll overflow-x-auto">
          <table data-testid="book-positions"
            className="w-full min-w-[820px] border-collapse text-[12.5px]">
            <thead>
              <tr>
                {POSITION_HEAD.map((h, i) => (
                  <th key={`${h}-${i}`} scope="col"
                    className={`${TH} ${RIGHT.has(i) ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {book.positions.map((p) => {
                const k = keyOf(p);
                const editing = edit && edit.key === k ? edit : null;
                const max = editing
                  ? (editing.action === "handover" ? p.manual : p.handed_over) : 0;
                const n = editing && /^\d+$/.test(editing.value.trim())
                  ? Number(editing.value.trim()) : NaN;
                const valid = Number.isInteger(n) && n >= 1 && n <= max;
                const sel = selected === k;
                return (
                  <Fragment key={k}>
                    <tr data-testid="book-position" data-ticker={p.ticker}
                      data-side={p.side} data-selected={sel || undefined}
                      className={`transition-colors hover:bg-tc-hover ${sel ? "bg-tc-raised shadow-[inset_2px_0_0_var(--accent)]" : ""}`}>
                      <td data-testid={onInspect ? "book-inspect" : undefined}
                        role={onInspect ? "button" : undefined} tabIndex={onInspect ? 0 : undefined}
                        aria-label={onInspect ? `inspect ${p.title}` : undefined}
                        onClick={onInspect ? () => onInspect(k) : undefined}
                        onKeyDown={onInspect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onInspect(k); } } : undefined}
                        className={`${TD} max-w-[150px] sm:max-w-[300px] ${onInspect ? "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent" : ""}`}>
                        <Market title={p.title} ticker={p.ticker} />
                      </td>
                      <td className={`${TD} font-medium uppercase text-ink-hi`}>{p.side}</td>
                      <td className={`${TD} text-right`}>
                        <span data-testid="book-live-value"
                          className="tc-num block whitespace-nowrap text-ink-hi">
                          {bookDollars(p.live.live_value_dollars)}
                        </span>
                        {/* the sub line WRAPS, so the column stays narrow
                            enough to sit on a phone's first screen */}
                        <span className="block min-w-[84px] whitespace-normal text-[10.5px] leading-tight text-ink-low">
                          at <span data-testid="book-live-mark" className="tc-num">{bookCents(p.live.live_mark_cents)}</span>
                          {" "}·{" "}
                          <span data-testid="book-mark-source"
                            data-source={p.live.mark_source ?? "none"}>
                            {markSourceWords(p.live.mark_source)}
                          </span>
                        </span>
                      </td>
                      <td data-testid="book-unrealised"
                        className={`${TD} tc-num whitespace-nowrap text-right ${plTone(p.live.unrealised_pl_dollars)}`}>
                        {bookPl(p.live.unrealised_pl_dollars)}
                      </td>
                      <td className={`${TD} tc-num text-right text-ink-hi`}>{p.contracts}</td>
                      <td className={TD}>
                        <span className="flex flex-wrap gap-1">
                          {p.own > 0 && <OwnerChip tone="trader" n={p.own} />}
                          {p.handed_over > 0 && <OwnerChip tone="handed" n={p.handed_over} />}
                          {p.manual > 0 && <OwnerChip tone="yours" n={p.manual} />}
                        </span>
                      </td>
                      <td className={`${TD} tc-num whitespace-nowrap text-right text-ink-mid`}>
                        <span className="block">{bookCents(p.avg_cost_cents)}</span>
                        <span className="block text-[10.5px] text-ink-low">
                          mark {bookCents(p.mark_cents)}
                        </span>
                      </td>
                      <td className={`${TD} tc-num text-right text-ink-hi`}>{bookDollars(p.at_risk_dollars)}</td>
                      <td className={`${TD} max-w-[160px]`}>
                        <span className="block truncate text-ink-mid">
                          {p.competition ? compLabel(p.competition) : ABSENT}
                        </span>
                        <span className="block whitespace-nowrap text-[10.5px]">
                          {p.in_play
                            ? <span className="text-live">in play</span>
                            : <span className="text-ink-low">{bookWhen(p.kickoff_utc)}</span>}
                        </span>
                      </td>
                      <td className={`${TD} text-right`}>
                        <span className="flex justify-end gap-1">
                          {p.manual > 0 && (
                            <button type="button" data-testid="hand-over"
                              disabled={busy} onClick={() => open(p, "handover")}
                              className={`${BTN} border-tc-line-strong text-ink-hi hover:bg-tc-hover`}>
                              Hand to trader
                            </button>
                          )}
                          {p.handed_over > 0 && (
                            <button type="button" data-testid="take-back"
                              disabled={busy} onClick={() => open(p, "takeback")}
                              className={`${BTN} border-tc-line-strong text-ink-hi hover:bg-tc-hover`}>
                              Take back
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                    {editing && max > 0 && (
                      <tr data-testid="book-edit" className="bg-tc-raised">
                        <td colSpan={POSITION_HEAD.length} className="border-b border-tc-line px-3 py-3">
                          <form className="flex flex-wrap items-center gap-2"
                            onSubmit={(ev) => {
                              ev.preventDefault();
                              if (valid && !busy) void submit(editing, n, p.title);
                            }}>
                            <label className="flex items-center gap-2">
                              <span className="text-[12.5px] text-ink-hi">
                                {editing.action === "handover"
                                  ? `Hand to trader — how many of your ${max}?`
                                  : `Take back — how many of the ${max} handed over?`}
                              </span>
                              <input data-testid="book-count" type="number"
                                inputMode="numeric" min={1} max={max} step={1}
                                value={editing.value} autoFocus
                                onChange={(ev) => setEdit({ ...editing, value: ev.target.value })}
                                className="tc-num h-8 w-20 rounded-md border border-tc-line-strong bg-tc-panel px-2 text-[13px] text-ink-hi outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                            </label>
                            <button type="submit" data-testid="book-confirm"
                              disabled={!valid || busy}
                              className={`${BTN} border-accent/70 bg-accent/10 font-medium text-ink-hi hover:bg-accent/20`}>
                              {busy ? "Sending…" : "Confirm"}
                            </button>
                            <button type="button" data-testid="book-cancel"
                              disabled={busy} onClick={() => setEdit(null)}
                              className={`${BTN} border-tc-line text-ink-mid hover:bg-tc-hover`}>
                              Cancel
                            </button>
                            {!valid && (
                              <span className="text-[12px] text-warn">a whole number from 1 to {max}</span>
                            )}
                          </form>
                          <p className="mt-1.5 text-[12px] text-ink-low">
                            {editing.action === "handover"
                              ? "The trader will fully manage these: it may add to them or close them within its limits."
                              : "These become yours again; the trader stops managing them. A close it already had resting is cancelled on its next tick (up to ~15 s) and could fill before then."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** THE LEGEND: each mark source the positions use, in the backend's own
 *  sentence when it sent one. */
export function MarkLegend({ book }: { book: Book }) {
  if (book.positions.length === 0) return null;
  const used = [...new Set(book.positions.map((p) => p.live.mark_source ?? "none"))];
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-low">
      Marks
      <Info label="the live marks">
        <span data-testid="book-mark-legend" className="block space-y-0.5">
          {used.map((k) => (
            <span key={k} data-testid="book-mark-legend-item" className="block">
              <span className="text-ink-hi">{markSourceWords(k === "none" ? null : k)}</span>
              {" "}— {book.markSources[k] ?? "the backend sent no description of this source"}
            </span>
          ))}
        </span>
      </Info>
    </div>
  );
}

export function PendingList({ book }: { book: Book }) {
  if (!book.pending || book.pending.length === 0) return null;
  return (
    <ul data-testid="book-pending-list" className="divide-y divide-tc-line">
      {book.pending.map((q, i) => {
        const title = book.positions.find((p) => p.ticker === q.ticker)?.title ?? q.ticker;
        return (
          <li key={`${q.ticker}-${q.side}-${q.requested_at}-${i}`}
            data-testid="book-pending" data-status={q.status || "none"}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-1 text-[12.5px]">
            <span className="min-w-0 break-words text-ink-hi">{title}</span>
            <span className="font-medium uppercase text-ink-mid">{q.side ?? ABSENT}</span>
            <span className="tc-num text-ink-mid">
              {q.count === null ? ABSENT : plural(q.count, "contract")}
            </span>
            <span className="text-ink-low">asked {bookWhen(q.requested_at)}</span>
            <span className={`ml-auto inline-block rounded-[4px] border px-1.5 py-[1px] text-[11px] ${
              PENDING_TONE[q.status] ?? "border-warn/50 text-warn"}`}>
              {pendingWords(q)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function OrdersTable({ book }: { book: Book }): ReactNode {
  if (book.orders.length === 0) {
    return (
      <p data-testid="book-orders-empty"
        className="rounded-md border border-dashed border-tc-line px-3 py-3 text-[12.5px] text-ink-low">
        {book.totals.notListedOrders > 0
          ? "No resting orders on markets the trader tracks."
          : "No resting orders on the account."}
      </p>
    );
  }
  return (
    <div className="tc-scroll overflow-x-auto">
      <table data-testid="book-orders"
        className="w-full min-w-[560px] border-collapse text-[12.5px]">
        <thead>
          <tr>
            {["market", "side", "price", "remaining", "owner", "expires"].map((h, i) => (
              <th key={h} scope="col"
                className={`${TH} ${i === 2 || i === 3 ? "text-right" : "text-left"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {book.orders.map((o) => (
            <tr key={o.order_id} data-testid="book-order" data-ticker={o.ticker}
              className="hover:bg-tc-hover">
              <td className={`${TD} min-w-[180px] max-w-[320px]`}>
                <Market title={o.title} ticker={o.ticker} />
              </td>
              <td className={`${TD} font-medium uppercase text-ink-hi`}>{o.side}</td>
              <td className={`${TD} tc-num text-right text-ink-mid`}>{bookCents(o.price_cents)}</td>
              <td className={`${TD} tc-num text-right text-ink-hi`}>{o.remaining}</td>
              <td className={TD}>
                {o.owner === "trader"
                  ? <OwnerChip tone="trader" />
                  : <OwnerChip tone="yours" />}
              </td>
              <td className={`${TD} tc-num whitespace-nowrap text-ink-mid`}>{bookWhen(o.expires_utc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

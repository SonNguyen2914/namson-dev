// THE TRADER'S BOOK, ON THE OPERATOR CONSOLE (2026-10-03).
//
// Son: "should the trader display every orders, bets, then flag my orders
// and then I can choose in the console whenever I want the trader to take
// care of it, if not then it cant touch it?" — so this section shows every
// open position and resting order on the account, each flagged by whose
// it is, and lets him hand a position to the trader or take it back.
//
// WHAT THE CHIPS MEAN, per position (from GET /api/ops/trading-book,
// trading-book-v1):
//   Trader N        contracts the trader opened itself (`own`)
//   Handed over N   contracts he handed to it (`handed_over`) — FULLY
//                   managed: it may add or close within its limits
//   Yours N         contracts the trader never touches (`manual`)
// Only the non-zero ones are drawn.
//
// WHAT CAN BE HANDED OVER: filled contracts only ("Positions only for
// now"). Resting orders are listed and flagged, with no buttons; the ones
// he placed stay his. An order whose owner is not stated as "trader" is
// shown as his — this page never claims the trader holds something the
// backend did not say it holds.
//
// CONFIRMATION IS INLINE (a count field with Confirm / Cancel), never
// window.confirm. After every POST the outcome is said in plain words and
// the book is read again at once.
//
// OPEN STATE ONLY: no settled result and no per-match P&L is on the
// payload, so none can be here. Experimental, unproven.
import { useEffect, useState, type ReactNode } from "react";
import { usePoll, type PollOutcome } from "../lib/usePoll";

const POLL_MS = 15_000;
/** A read older than three cadences is shown dimmed. */
const STALE_MS = 3 * POLL_MS;

type Obj = Record<string, unknown>;
type Side = "yes" | "no";
type Action = "handover" | "takeback";

interface Position {
  ticker: string; title: string; competition: string | null;
  kickoff_utc: string | null; in_play: boolean; side: Side;
  contracts: number; own: number; handed_over: number; managed: number;
  manual: number; avg_cost_cents: number | null; mark_cents: number | null;
  at_risk_dollars: number | null;
}

interface Order {
  order_id: string; ticker: string; title: string; competition: string | null;
  side: Side; price_cents: number | null; remaining: number;
  owner: "trader" | "manual"; expires_utc: string | null;
}

interface Book {
  version: string | null; generated_at: string | null;
  account_read_at: string | null; positions: Position[]; orders: Order[];
  totals: { positions: number; orders: number; managed: number; manual: number };
}

type BookRead =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "unavailable" }
  | { kind: "refused"; detail: string }
  | { kind: "error"; status: number; detail: string };

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

function parseBook(b: Obj): Book {
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
  const t = isObj(b.totals) ? b.totals : {};
  return {
    version: str(b.version), generated_at: str(b.generated_at),
    account_read_at: str(b.account_read_at), positions, orders,
    totals: {
      positions: num(t.positions) ?? positions.length,
      orders: num(t.orders) ?? orders.length,
      managed: num(t.managed_contracts)
        ?? positions.reduce((s, p) => s + p.managed, 0),
      manual: num(t.manual_contracts)
        ?? positions.reduce((s, p) => s + p.manual, 0),
    },
  };
}

// --------------------------------------------------------- formatting

const ABSENT = "—";
const cents = (n: number | null) =>
  n === null ? ABSENT : `${Number.isInteger(n) ? n : n.toFixed(1)}¢`;
const dollars = (n: number | null) => (n === null ? ABSENT : `$${n.toFixed(2)}`);
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

function when(iso: string | null): string {
  if (!iso) return ABSENT;
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
  if (status >= 200 && status < 300 && b.ok === true) {
    const managed = whole(b.managed);
    const manual = whole(b.manual);
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
  if (code && ERROR_WORDS[code]) why = ERROR_WORDS[code];
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

// ------------------------------------------------------------- pieces

const CHIP: Record<"trader" | "handed" | "yours", string> = {
  trader: "border-line bg-elev2 text-ink-mid",
  handed: "border-accent/50 text-accent",
  yours: "border-ink-hi/60 font-semibold text-ink-hi",
};

function Chip({ tone, children }: {
  tone: keyof typeof CHIP; children: ReactNode;
}) {
  return (
    <span data-testid={`chip-${tone}`}
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] ${CHIP[tone]}`}>
      {children}
    </span>
  );
}

const TH = "border-b border-line pb-1 pr-3 font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint whitespace-nowrap";
const TD = "py-1.5 pr-3 align-top";
const BTN = "whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors disabled:opacity-40";

function Market({ title, ticker }: { title: string; ticker: string }) {
  return (
    <>
      <span className="block font-sans text-[12px] text-ink-hi">{title}</span>
      <span className="block break-all text-[10px] text-ink-faint">{ticker}</span>
    </>
  );
}

const keyOf = (p: { ticker: string; side: Side }) => `${p.ticker}|${p.side}`;

// --------------------------------------------------------------- body

export function TradingBook({ token }: { token: string }) {
  const [read, setRead] = useState<BookRead>({ kind: "idle" });
  const [last, setLast] = useState<{ book: Book; at: number } | null>(null);
  const [bump, setBump] = useState(0);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // `bump` is in the deps: a POST re-reads the book at once
  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-book", {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try { body = await r.json(); } catch { /* named by its status below */ }
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      // a definite answer: keep asking at the usual cadence, so the
      // section fills in once the backend has the route
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      const at = Date.now();
      setRead({ kind: "ok" });
      setLast({ book: parseBook(body), at });
      setNow(at);
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status, detail });
    return "failed";
  }, POLL_MS, [token, bump], token !== "");

  useEffect(() => {
    if (!last) return;
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, [last]);

  const book = last?.book ?? null;
  const stale = last !== null && (read.kind !== "ok" || now - last.at > STALE_MS);

  const open = (p: Position, action: Action) => {
    const max = action === "handover" ? p.manual : p.handed_over;
    setOutcome(null);
    setEdit({ key: keyOf(p), action, ticker: p.ticker, side: p.side,
              value: String(max) });
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
      try { body = await r.json(); } catch { /* described by its status */ }
      o = describe(e, n, title, r.status, body);
    } catch {
      o = { ok: false, text: `${e.action === "handover" ? "Hand-over" : "Take-back"} `
        + "failed: no answer came back — the book below is read again to "
        + "show whether it went through." };
    }
    setBusy(false);
    setEdit(null);
    setOutcome(o);
    setBump((b) => b + 1);
  };

  return (
    <section data-testid="ops-book" aria-labelledby="ops-book-h"
      className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <h2 id="ops-book-h"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        Positions &amp; orders
      </h2>
      {book && (
        <p data-testid="book-totals" className="mt-1 font-mono text-[11px] text-ink-faint">
          {plural(book.totals.positions, "position")} · {plural(book.totals.orders, "resting order")}
          {" "}· trader manages {book.totals.managed} · yours {book.totals.manual}
          {" "}· account read {book.account_read_at
            ? `${when(book.account_read_at)}${Number.isFinite(Date.parse(book.account_read_at))
              ? ` (${ago(now - Date.parse(book.account_read_at))} ago)` : ""}`
            : "— not yet"}
          {stale && ` · stale, ${ago(now - last!.at)} old`}
        </p>
      )}

      <div className="mt-3">
        {read.kind === "unavailable" && (
          <p data-testid="book-unavailable" className="font-mono text-[12px] text-ink-low">
            Book not available yet — this backend does not serve the trader&apos;s
            positions and orders. The rest of the console is unaffected.
          </p>
        )}
        {read.kind === "refused" && (
          <p data-testid="book-error" role="alert" className="font-mono text-[12px] text-neg">
            token rejected — the backend refused it ({read.detail})
          </p>
        )}
        {read.kind === "error" && (
          <p data-testid="book-error" role="alert" className="font-mono text-[12px] text-warn">
            the book read failed (HTTP {read.status}) — {read.detail}
          </p>
        )}
        {read.kind === "idle" && !book && (
          <p className="font-mono text-[11px] text-ink-faint">reading the book…</p>
        )}

        {outcome && (
          <p data-testid="book-outcome" data-ok={outcome.ok ? "true" : "false"}
            role={outcome.ok ? "status" : "alert"}
            className={`mb-3 rounded-xl border px-3 py-2 font-mono text-[12px] ${
              outcome.ok ? "border-line-strong text-ink-hi" : "border-warn/40 text-warn"}`}>
            {outcome.text}
          </p>
        )}

        {book && (
          <div data-stale={stale || undefined}
            className={`transition-opacity ${stale ? "opacity-50" : ""}`}>
            <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              positions
            </h3>
            {book.positions.length === 0 ? (
              <p data-testid="book-positions-empty" className="font-mono text-[11px] text-ink-faint">
                No open positions on the account.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table data-testid="book-positions"
                  className="w-full min-w-[760px] border-collapse font-mono text-xs tabular-nums">
                  <thead>
                    <tr>
                      {["market", "competition", "kickoff", "side", "contracts",
                        "owner", "avg cost", "mark", "at risk", ""].map((h, i) => (
                        <th key={`${h}-${i}`} scope="col"
                          className={`${TH} ${i >= 4 && i <= 8 && i !== 5 ? "text-right" : "text-left"}`}>
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
                      return [
                        <tr key={k} data-testid="book-position" data-ticker={p.ticker}
                          data-side={p.side} className="border-b border-line/50">
                          <td className={`${TD} min-w-[180px]`}>
                            <Market title={p.title} ticker={p.ticker} />
                          </td>
                          <td className={`${TD} text-ink-mid`}>{p.competition ?? ABSENT}</td>
                          <td className={`${TD} whitespace-nowrap`}>
                            {p.in_play
                              ? <span className="text-live">in play</span>
                              : <span className="text-ink-mid">{when(p.kickoff_utc)}</span>}
                          </td>
                          <td className={`${TD} uppercase text-ink-hi`}>{p.side}</td>
                          <td className={`${TD} text-right text-ink-hi`}>{p.contracts}</td>
                          <td className={TD}>
                            <span className="flex flex-wrap gap-1">
                              {p.own > 0 && <Chip tone="trader">Trader {p.own}</Chip>}
                              {p.handed_over > 0 && (
                                <Chip tone="handed">Handed over {p.handed_over}</Chip>
                              )}
                              {p.manual > 0 && <Chip tone="yours">Yours {p.manual}</Chip>}
                            </span>
                          </td>
                          <td className={`${TD} text-right text-ink-mid`}>{cents(p.avg_cost_cents)}</td>
                          <td className={`${TD} text-right text-ink-mid`}>{cents(p.mark_cents)}</td>
                          <td className={`${TD} text-right text-ink-hi`}>{dollars(p.at_risk_dollars)}</td>
                          <td className={`${TD} text-right`}>
                            <span className="flex justify-end gap-1">
                              {p.manual > 0 && (
                                <button type="button" data-testid="hand-over"
                                  disabled={busy} onClick={() => open(p, "handover")}
                                  className={`${BTN} border-accent/50 text-accent hover:bg-accent/10`}>
                                  Hand to trader
                                </button>
                              )}
                              {p.handed_over > 0 && (
                                <button type="button" data-testid="take-back"
                                  disabled={busy} onClick={() => open(p, "takeback")}
                                  className={`${BTN} border-line-strong text-ink-hi hover:bg-elev2`}>
                                  Take back
                                </button>
                              )}
                            </span>
                          </td>
                        </tr>,
                        editing && max > 0 && (
                          <tr key={`${k}-edit`} data-testid="book-edit"
                            className="border-b border-line/50 bg-bs">
                            <td colSpan={10} className="px-2 py-2">
                              <form className="flex flex-wrap items-center gap-2"
                                onSubmit={(ev) => {
                                  ev.preventDefault();
                                  if (valid && !busy) void submit(editing, n, p.title);
                                }}>
                                <label className="flex items-center gap-2">
                                  <span className="text-[11px] text-ink-mid">
                                    {editing.action === "handover"
                                      ? `Hand to trader — how many of your ${max}?`
                                      : `Take back — how many of the ${max} handed over?`}
                                  </span>
                                  <input data-testid="book-count" type="number"
                                    inputMode="numeric" min={1} max={max} step={1}
                                    value={editing.value}
                                    onChange={(ev) => setEdit({ ...editing, value: ev.target.value })}
                                    className="w-20 rounded-md border border-line bg-elev px-2 py-0.5 font-mono text-[12px] text-ink-hi outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                                </label>
                                <button type="submit" data-testid="book-confirm"
                                  disabled={!valid || busy}
                                  className={`${BTN} border-accent/60 text-accent hover:bg-accent/10`}>
                                  {busy ? "Sending…" : "Confirm"}
                                </button>
                                <button type="button" data-testid="book-cancel"
                                  disabled={busy} onClick={() => setEdit(null)}
                                  className={`${BTN} border-line text-ink-mid hover:bg-elev2`}>
                                  Cancel
                                </button>
                                {!valid && (
                                  <span className="text-[11px] text-warn">a whole number from 1 to {max}</span>
                                )}
                              </form>
                              <p className="mt-1 text-[11px] text-ink-faint">
                                {editing.action === "handover"
                                  ? "The trader will fully manage these: it may add to them or close them within its limits."
                                  : "These become yours again; the trader stops managing them and never touches them."}
                              </p>
                            </td>
                          </tr>
                        ),
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              resting orders
            </h3>
            <p data-testid="book-orders-line" className="mb-1.5 text-[11px] text-ink-faint">
              Resting orders can&apos;t be handed over yet — positions only.
            </p>
            {book.orders.length === 0 ? (
              <p data-testid="book-orders-empty" className="font-mono text-[11px] text-ink-faint">
                No resting orders on the account.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table data-testid="book-orders"
                  className="w-full min-w-[560px] border-collapse font-mono text-xs tabular-nums">
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
                        className="border-b border-line/50">
                        <td className={`${TD} min-w-[180px]`}>
                          <Market title={o.title} ticker={o.ticker} />
                        </td>
                        <td className={`${TD} uppercase text-ink-hi`}>{o.side}</td>
                        <td className={`${TD} text-right text-ink-mid`}>{cents(o.price_cents)}</td>
                        <td className={`${TD} text-right text-ink-hi`}>{o.remaining}</td>
                        <td className={TD}>
                          {o.owner === "trader"
                            ? <Chip tone="trader">Trader</Chip>
                            : <Chip tone="yours">Yours</Chip>}
                        </td>
                        <td className={`${TD} whitespace-nowrap text-ink-mid`}>{when(o.expires_utc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <p data-testid="book-note" className="mt-4 text-xs leading-relaxed text-ink-faint">
        The trader never touches positions marked Yours. Handed-over positions
        are fully managed: it may add or close within its limits; a close that
        lowers risk always goes through. Experimental, unproven.
      </p>
    </section>
  );
}

// TRADES & GROUNDS, ON THE OPERATOR CONSOLE (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". So this section lists
// every order the trader placed and every contract he handed over to it —
// newest first — with the grounds it recorded when it placed (fair price
// and its parts, the blend weight and the learner's bar, the maker price,
// the fee, the edge after fee, the guards and the risk checks, the in-play
// reads), what became of the order (fills, cancels, still resting), and,
// once its market settled in the trader's journal, the result and that
// order's own P&L. Above the table: the summary — P&L by UTC day against
// the daily loss limit, and by competition, market type, phase, price
// bucket and edge bucket.
//
// THE SEAL (Son's decision, 2026-10-06, "Everything, for my bets only"):
// results and P&L are shown for the trader's OWN orders and handed-over
// contracts only — the backend serves nothing else on this route — and
// this page is the operator's, token-gated, never linked for a visitor.
//
// WHAT IT READS: GET /api/ops/trading-ledger (the relay of the backend's
// operator-gated GET /api/admin/trading/ledger), every 60 s while a
// token is held, through lib/usePoll, with the filters as named query
// parameters; "Load older" follows the backend's `next_cursor`.
// lib/tradingLedger.ts reads the payload and is the one place to align if
// the backend's contract moves.
//
// MISSING IS NOT ZERO, A FAILED READ IS NOT AN EMPTY ONE. A value a row
// did not record reads "not recorded" (a P&L with no journaled result
// reads "unsettled"); the CSV writes it as an empty cell. A missing route
// reads "not available yet"; a refusal, an error, an answer that is not
// JSON, not an object, or carries no rows list is named.
//
// EXPERIMENTAL, UNPROVEN. "Edge" is the trader's own estimate at the time
// it placed — not a measured edge, not advice. This section reads; it
// places, cancels and changes nothing.
import {
  useCallback, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import {
  type DayRow, DEFAULT_PHASES, type Group, type Ledger, type LedgerRow,
  NOT_RECORDED, type Summary, age, bucketStart, cents, clears, compLabel,
  composeWhy, dollars, edgeWords, familyWords, fillWords, flat, lines,
  newestFirst, outcomeOf, parseLedger, pct, phaseWords, pnlWords,
  priceBucketWords, resultWords, signedCents, signedDollars, sourceWords,
  statusWords, ledgerCsv,
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

/** the next UTC day's midnight: an `until` day is read to its end */
function endOfDay(d: string): string {
  const t = Date.parse(`${d}T00:00:00Z`);
  return `${new Date(t + 86_400_000).toISOString().slice(0, 10)}T00:00:00Z`;
}

/** the query the page asks with — the named filters only */
function queryOf(f: Filters, cursor?: string): string {
  const q = new URLSearchParams();
  if (f.since && Number.isFinite(Date.parse(f.since))) q.set("since", `${f.since}T00:00:00Z`);
  if (f.until && Number.isFinite(Date.parse(f.until))) q.set("until", endOfDay(f.until));
  if (f.competition) q.set("competition", f.competition);
  if (f.phase) q.set("phase", f.phase);
  if (cursor) q.set("cursor", cursor);
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
/** wins–losses–unsettled; a count not sent is "?" (never 0) */
function wlu(w: number | null, l: number | null, u: number | null): string {
  if (w === null && l === null && u === null) return NOT_RECORDED;
  const c = (n: number | null) => (n === null ? "?" : String(n));
  return `${c(w)}–${c(l)}–${c(u)}`;
}

/** WHY AN ORDER WAS WITHDRAWN, in short words, when the code is known.
 *  The code itself is always printed beside them. */
const CANCEL_WORDS: Record<string, string> = {
  kickoff_window: "the pre-match window closed",
  outside_window: "outside the trading window",
  repriced: "re-priced",
  edge_gone: "the edge was gone",
  stale_book: "the book went stale",
  shock: "a shock (goal, card)",
  kill_switch: "the kill switch",
  expired: "the venue's expiry",
};

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

/** ONE DAY'S P&L AS A BAR, zero in the middle, the daily loss limit as a
 *  dashed line on the loss side — at the same place on every day. */
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
  days: DayRow[] | null; limit: number | null;
  limitFrom: "summary" | "status" | null;
}) {
  const scale = Math.max(limit ?? 0, ...(days ?? []).map((d) => Math.abs(d.pnl ?? 0)), 0.01);
  return (
    <>
      <h3 className={SUB}>P&amp;L by UTC day</h3>
      <p data-testid="ledger-day-limit" className="mb-1.5 font-mono text-[11px] text-ink-faint">
        {limit === null ? "daily loss limit not stated, so no line is drawn"
          : `daily loss limit ${dollars(limit)}${limitFrom === "status"
            ? " (from the status route)" : ""} — the dashed line`}
        {" "}· as the backend summed it
      </p>
      {days === null ? (
        <p className="font-mono text-[11px] text-ink-faint">by-day totals not sent</p>
      ) : days.length === 0 ? (
        <p className="font-mono text-[11px] text-ink-faint">no day in this window</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr>
                {["UTC day", "placed", "W–L–U", "P&L", ""].map((h, i) => (
                  <th key={h || i} scope="col"
                    className={`${TH} ${i === 0 || i === 4 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const hit = d.pnl !== null && limit !== null && d.pnl <= -limit;
                return (
                  <tr key={d.day} data-testid="ledger-day" data-day={d.day}
                    data-limit-hit={hit || undefined} className="border-b border-line/50">
                    <td className="whitespace-nowrap py-1 pr-3 text-ink-mid">{d.day}</td>
                    <td className="py-1 pr-3 text-right text-ink-hi">{count(d.placed)}</td>
                    <td className="py-1 pr-3 text-right text-ink-mid">{wlu(d.wins, d.losses, d.unsettled)}</td>
                    <td className={`whitespace-nowrap py-1 pr-3 text-right ${plTone(d.pnl)}`}>
                      {signedDollars(d.pnl)}
                      {hit && <span className="ml-1 text-[10px] text-warn">limit reached</span>}
                    </td>
                    <td className="w-1/2 py-1"><DayBar pnl={d.pnl} limit={limit} scale={scale} /></td>
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
  id: string; title: string; groups: Group[] | null;
  label: (k: string) => string; order?: (a: Group, b: Group) => number;
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
            className="w-full min-w-[360px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr>
                {["", "placed", "W–L–U", "cost", "P&L"].map((h, i) => (
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
                  <td className="py-1 pr-3 text-right text-ink-hi">{count(g.placed)}</td>
                  <td className="whitespace-nowrap py-1 pr-3 text-right text-ink-mid">
                    {wlu(g.wins, g.losses, g.unsettled)}
                  </td>
                  <td className="whitespace-nowrap py-1 pr-3 text-right text-ink-mid">{dollars(g.cost)}</td>
                  <td className={`whitespace-nowrap py-1 text-right ${plTone(g.pnl)}`}>{signedDollars(g.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const byStart = (a: Group, b: Group) => {
  const x = bucketStart(a.key), y = bucketStart(b.key);
  return Number.isNaN(x) || Number.isNaN(y) ? 0 : x - y;
};

function SummaryBlock({ s, statusLimit }: { s: Summary | null; statusLimit: number | null }) {
  if (!s) {
    return (
      <p data-testid="ledger-summary-absent" className="font-mono text-[11px] text-ink-faint">
        summary not sent by this backend — the rows below are all there is
      </p>
    );
  }
  const t = s.totals;
  const limit = s.daily_limit ?? statusLimit;
  const limitFrom = s.daily_limit !== null ? "summary"
    : statusLimit !== null ? "status" : null;
  return (
    <div data-testid="ledger-summary">
      {t ? (
        <div data-testid="ledger-totals" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          <Tile id="placed" k="orders placed" v={count(t.placed)} />
          <Tile id="handed_over" k="handed over" v={count(t.handed_over)} />
          <Tile id="filled" k="filled" v={count(t.filled)} />
          <Tile id="wins" k="won" v={count(t.wins)} />
          <Tile id="losses" k="lost" v={count(t.losses)} />
          <Tile id="unsettled" k="unsettled" v={count(t.unsettled)} />
          <Tile id="cost" k="cost (fees in)" v={dollars(t.cost)} />
          <Tile id="fees" k="fees" v={dollars(t.fees)} />
          <Tile id="pnl" k="P&L, settled" v={signedDollars(t.pnl)} tone={plTone(t.pnl)} />
        </div>
      ) : (
        <p className="font-mono text-[11px] text-ink-faint">totals not sent</p>
      )}
      <Days days={s.by_day} limit={limit} limitFrom={limitFrom} />
      <div className="grid gap-x-6 sm:grid-cols-2">
        <GroupTable id="competition" title="by competition" groups={s.by_competition}
          label={compLabel}
          order={(a, b) => (COMP_ORDER.get(a.key) ?? 99) - (COMP_ORDER.get(b.key) ?? 99)
            || a.key.localeCompare(b.key)} />
        <GroupTable id="family" title="by market type" groups={s.by_family}
          label={(k) => (familyWords(k) === k ? k : `${familyWords(k)} (${k})`)} />
        <GroupTable id="phase" title="by phase" groups={s.by_phase} label={phaseWords} />
        <GroupTable id="price" title="by price (YES book)" groups={s.by_price_bucket}
          label={priceBucketWords} order={byStart} />
        <GroupTable id="edge" title="by edge at placement (its own estimate)"
          groups={s.by_edge_bucket} label={(k) => k} order={byStart} />
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

function Lines({ v }: { v: unknown }) {
  const ls = lines(v);
  if (!ls) return <>{NOT_RECORDED}</>;
  return <>{ls.map((l, i) => <span key={i} className="block">{l}</span>)}</>;
}

/** the in-play keys drawn by name; any other is drawn as sent */
const INPLAY_NAMED = new Set(["minute", "p_engine", "engine_prob", "engine",
  "anchor_w", "anchor_weight", "anchor", "anchor_source", "signals",
  "live_signals", "hot", "danger"]);

function InPlayGround({ r }: { r: LedgerRow }) {
  const g = r.grounds;
  if (!g) return <>{NOT_RECORDED}</>;
  const ip = g.inplay;
  if (!ip) {
    return <>{r.phase === "pre_match" ? "pre-match order — no in-play reads"
      : "no in-play reads recorded"}</>;
  }
  const out: string[] = [];
  out.push(`minute ${ip.minute === null ? NOT_RECORDED : `${ip.minute}′`}`);
  out.push(`engine ${pct(ip.p_engine)}`);
  out.push(ip.anchor_w === null && ip.anchor_source === null ? "anchor not recorded"
    : `anchor ${ip.anchor_w === null ? "w not recorded" : `w ${ip.anchor_w.toFixed(2)}`} · ${sourceWords(ip.anchor_source)}`);
  if (ip.signals !== null && ip.signals !== undefined) {
    out.push(`signals ${isObj(ip.signals)
      ? Object.entries(ip.signals).map(([k, v]) => `${k}: ${flat(v)}`).join(" · ")
      : flat(ip.signals)}`);
  } else {
    out.push("signals not recorded");
  }
  out.push(`HOT ${ip.hot === null ? NOT_RECORDED : ip.hot ? "yes" : "no"}`);
  out.push(`danger ${pct(ip.danger)}`);
  for (const [k, v] of Object.entries(ip.raw)) {
    if (!INPLAY_NAMED.has(k)) out.push(`${k}: ${flat(v)}`);
  }
  return <>{out.map((l) => <span key={l} className="block">{l}</span>)}</>;
}

function booksWords(c: NonNullable<LedgerRow["grounds"]>["consensus"]): string {
  if (!c) return NOT_RECORDED;
  const n = c.books_n;
  const books = c.books ? `${c.books.length} books (${c.books.join(", ")})`
    : n !== null ? `${n} book${n === 1 ? "" : "s"}` : "books not recorded";
  return `${pct(c.prob)} · ${c.age_s === null ? "age not recorded" : `${age(c.age_s)} old`} · ${books}`;
}

function Grounds({ r }: { r: LedgerRow }) {
  const g = r.grounds;
  const why = r.why ?? composeWhy(r);
  return (
    <div className="space-y-3">
      <p className="font-sans text-[12px] leading-snug text-ink-mid">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">why · </span>
        {why ?? NOT_RECORDED}
        {r.why === null && why !== null && (
          <span className="text-ink-faint"> (composed here from the recorded grounds)</span>
        )}
      </p>
      {!g && (
        <p className="font-mono text-[11px] text-warn">
          no grounds were recorded on this row — every ground below is named as such
        </p>
      )}
      <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        <G field="fair" k="fair probability (its own)">{pct(g?.fair ?? null)}</G>
        <G field="consensus" k="bookmaker consensus">{booksWords(g?.consensus ?? null)}</G>
        <G field="model" k="our model (unvalidated)">
          {g?.model ? `${pct(g.model.prob)} · ${sourceWords(g.model.source)} · ${g.model.run_age_s === null
            ? "run age not recorded" : `run ${age(g.model.run_age_s)} old`}` : NOT_RECORDED}
        </G>
        <G field="w" k="blend weight w (on the model)">
          {g?.w === null || g?.w === undefined ? NOT_RECORDED : g.w.toFixed(2)}
          {g?.arm ? ` · learner arm ${g.arm}` : ""}
        </G>
        <G field="threshold" k="bar (min edge)">{cents(g?.threshold ?? null)}</G>
        <G field="maker_price" k="maker price (its side)">{cents(g?.maker_price ?? null)}</G>
        <G field="fee" k="fee (a contract)">{cents(g?.fee ?? null)}</G>
        <G field="edge" k="edge after fee (its own estimate)">
          {signedCents(g?.edge ?? null)}
          {g && g.edge !== null && g.threshold !== null
            ? (clears(g) ? " — clears the bar" : " — under the bar") : ""}
        </G>
        <G field="guards" k="guards at placement (news, anomaly)"><Lines v={g?.guards} /></G>
        <G field="risk" k="risk checks"><Lines v={g?.risk} /></G>
        <G field="inplay" k="in play"><InPlayGround r={r} /></G>
        <G field="fills" k="fills">
          {r.fills === null ? NOT_RECORDED
            : `${count(r.fills.count)} filled${r.fills.avg_price === null ? ""
              : ` @ ${cents(r.fills.avg_price)}`} · fees ${dollars(r.fills.fees)}${r.fills.last_at
              ? ` · last ${when(r.fills.last_at)}` : ""}`}
        </G>
        <G field="status" k="status">
          {statusWords(r.status)}
          {r.cancel_reason ? ` — ${r.cancel_reason}${CANCEL_WORDS[r.cancel_reason]
            ? ` (${CANCEL_WORDS[r.cancel_reason]})` : ""}` : ""}
        </G>
        <G field="result" k="result (from the journal)">
          {r.result === null
            ? (r.result_other === null ? "unsettled — no journaled result"
              : `${r.result_other} (as sent)`)
            : `settled ${r.result.toUpperCase()}${["won", "lost"].includes(outcomeOf(r))
              ? ` · ${outcomeOf(r)}` : ""}`}
        </G>
        <G field="pnl" k="this order's P&L">{pnlWords(r)}</G>
        <G field="cost" k="cost (fee in)">{dollars(r.cost)}</G>
        <G field="strategy_version" k="strategy">{r.strategy_version ?? NOT_RECORDED}</G>
        <G field="ticker" k="market">{r.ticker}</G>
        <G field="placed_at" k="placed (UTC)">{r.placed_at ?? NOT_RECORDED}</G>
      </dl>
    </div>
  );
}

// ------------------------------------------------------------- the table

const HEAD = ["", "time", "match", "contract", "side", "price (YES book)",
  "size", "cost", "phase", "edge vs bar", "fill", "result", "P&L", "why"];
const RIGHT = new Set([5, 6, 7, 9, 12]);

function Row({ r, open, onToggle, boxW, idx }: {
  r: LedgerRow; open: boolean; onToggle: () => void; boxW: number | null; idx: number;
}) {
  const g = r.grounds;
  const composed = r.why === null ? composeWhy(r) : null;
  const o = outcomeOf(r);
  const minute = g?.inplay?.minute ?? null;
  const id = `ledger-g-${idx}`;
  return (
    <>
      <tr data-testid="ledger-row" data-ticker={r.ticker} data-kind={r.kind}
        data-result={o} data-placed-at={r.placed_at ?? undefined}
        data-phase={r.phase ?? ""} className="border-b border-line/50">
        <td className={`${TD} pl-1`}>
          <button type="button" data-testid="ledger-expand" aria-expanded={open}
            aria-controls={id} onClick={onToggle}
            aria-label={`${open ? "hide" : "show"} the grounds for ${r.contract ?? r.ticker}`}
            className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-mid transition-colors hover:border-line-strong">
            {open ? "▾" : "▸"}
          </button>
        </td>
        <td data-testid="ledger-time" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {when(r.placed_at)}
        </td>
        <td data-testid="ledger-match" className={`${TD} min-w-[150px]`}>
          <span className="block font-sans text-[12px] text-ink-hi">
            {r.home === null && r.away === null ? "match not recorded"
              : `${r.home ?? "home not recorded"} v ${r.away ?? "away not recorded"}`}
          </span>
          <span className="block text-[10px] text-ink-faint">
            {compLabel(r.competition)} · kickoff {when(r.kickoff_utc)}
          </span>
        </td>
        <td data-testid="ledger-contract" className={`${TD} min-w-[160px]`}>
          <span className="block font-sans text-[12px] text-ink-hi">
            {r.contract ?? `contract ${NOT_RECORDED}`}
            {r.kind === "handover" && (
              <span data-testid="ledger-handed-chip"
                className="ml-1.5 whitespace-nowrap rounded-full border border-accent/50 px-1.5 text-[10px] text-accent">
                handed over
              </span>
            )}
          </span>
          <span className="block break-all text-[10px] text-ink-faint">{r.ticker}</span>
          <span className="block text-[10px] text-ink-faint">
            {r.family === null && r.outcome_key === null ? `market type ${NOT_RECORDED}`
              : `${familyWords(r.family)} · ${r.outcome_key ?? NOT_RECORDED}`}
          </span>
        </td>
        <td data-testid="ledger-side" className={`${TD} text-ink-hi`}>
          {r.side ? r.side.toUpperCase() : NOT_RECORDED}
        </td>
        <td data-testid="ledger-price" className={`${TD} whitespace-nowrap text-right text-ink-hi`}>
          {cents(r.price)}
          {r.side === "no" && r.price !== null && (
            <span className="block text-[10px] text-ink-faint">NO at {cents(100 - r.price)}</span>
          )}
        </td>
        <td data-testid="ledger-size" className={`${TD} text-right text-ink-hi`}>{count(r.count)}</td>
        <td data-testid="ledger-cost" className={`${TD} whitespace-nowrap text-right text-ink-hi`}>{dollars(r.cost)}</td>
        <td data-testid="ledger-phase" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {phaseWords(r.phase)}
          {minute !== null && <span className="text-live"> · {minute}′</span>}
        </td>
        <td data-testid="ledger-edge" data-clears={clears(g) || undefined}
          className={`${TD} whitespace-nowrap text-right ${clears(g) ? "font-semibold text-ink-hi" : "text-ink-low"}`}>
          {edgeWords(g)}
        </td>
        <td data-testid="ledger-fill" className={`${TD} whitespace-nowrap text-ink-mid`}>
          {fillWords(r)}
          {r.cancel_reason && (
            <span className="block text-[10px] text-ink-faint">
              {r.cancel_reason}{CANCEL_WORDS[r.cancel_reason] ? ` · ${CANCEL_WORDS[r.cancel_reason]}` : ""}
            </span>
          )}
        </td>
        <td data-testid="ledger-result"
          className={`${TD} whitespace-nowrap ${o === "won" ? "text-up" : o === "lost" ? "text-neg" : "text-ink-mid"}`}>
          {resultWords(r)}
        </td>
        <td data-testid="ledger-pnl" className={`${TD} whitespace-nowrap text-right ${plTone(r.pnl)}`}>
          {pnlWords(r)}
        </td>
        <td data-testid="ledger-why" className={`${TD} min-w-[260px] max-w-[340px] font-sans text-[12px] leading-snug text-ink-mid`}>
          <span className="line-clamp-3">{r.why ?? composed ?? NOT_RECORDED}</span>
          {composed !== null && (
            <span className="block text-[10px] text-ink-faint">composed here from the recorded grounds</span>
          )}
        </td>
      </tr>
      {open && (
        <tr id={id} data-testid="ledger-grounds" data-ticker={r.ticker}
          className="border-b border-line bg-bs/60">
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
  /** the cursor after the older pages; undefined until one is loaded */
  const [olderCursor, setOlderCursor] = useState<string | null | undefined>(undefined);
  const [more, setMore] = useState<{ busy: boolean; error: string | null }>(
    { busy: false, error: null });
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [now, setNow] = useState(() => Date.now());
  const [boxW, setBoxW] = useState<number | null>(null);
  const [known, setKnown] = useState<{ comps: string[]; phases: string[] }>(
    { comps: [...FOCUS_COMPETITIONS], phases: [...DEFAULT_PHASES] });
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
      // every competition and phase ever named stays a filter option
      setKnown((k) => ({
        comps: [...new Set([...k.comps, ...(l.summary?.by_competition ?? []).map((g) => g.key),
          ...l.rows.map((x) => x.competition).filter((c): c is string => !!c)])],
        phases: [...new Set([...k.phases, ...(l.summary?.by_phase ?? []).map((g) => g.key),
          ...l.rows.map((x) => x.phase).filter((p): p is string => !!p)])],
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

  const setFilter = (k: keyof Filters, v: string) => {
    gen.current += 1;
    setFilters((f) => ({ ...f, [k]: v }));
    setOlder([]);
    setOlderCursor(undefined);
    setMore({ busy: false, error: null });
    setLast(null);
    setRead({ kind: "idle" });
  };
  const clearFilters = () => {
    gen.current += 1;
    setFilters(NO_FILTERS);
    setOlder([]);
    setOlderCursor(undefined);
    setMore({ busy: false, error: null });
    setLast(null);
    setRead({ kind: "idle" });
  };

  const l = last?.l ?? null;
  const rows = useMemo(() => {
    if (!l) return [];
    const seen = new Set<string>();
    const out: LedgerRow[] = [];
    for (const r of [...l.rows, ...older]) {
      if (seen.has(r.key)) continue;
      seen.add(r.key);
      out.push(r);
    }
    return newestFirst(out);
  }, [l, older]);
  const cursor = olderCursor === undefined ? l?.next_cursor ?? null : olderCursor;
  const stale = last !== null && (read.kind !== "ok" || now - last.at > STALE_MS);
  const filtered = filters.competition !== "" || filters.phase !== ""
    || filters.since !== "" || filters.until !== "";

  // AN OLDER PAGE, by the backend's cursor. Every failure is put on the
  // page by name (the read that failed, and why); a page that arrives
  // after the filters changed is dropped, not appended to another window.
  const loadOlder = async () => {
    if (!cursor) return;
    const mine = gen.current;
    const current = () => gen.current === mine;
    setMore({ busy: true, error: null });
    let r: Response;
    try {
      r = await fetch(`/api/ops/trading-ledger${queryOf(filters, cursor)}`, {
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
      setOlderCursor(page.next_cursor);
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

  const toggle = (k: string) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

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
        Prices in cents on the YES book; money in dollars.
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
              the {rows.length} loaded rows · blank cell = not recorded · for
              your review only, never research data
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
            <SummaryBlock s={l.summary} statusLimit={statusDailyLimit} />

            <h3 className={SUB}>every order, newest first</h3>
            <p data-testid="ledger-count" className="mb-1.5 font-mono text-[11px] text-ink-faint">
              {rows.length} row{rows.length === 1 ? "" : "s"} · newest first · {cursor
                ? "more on the backend" : "all loaded"}
              {l.unreadable > 0 && (
                <span className="text-warn">
                  {" "}· {l.unreadable} row{l.unreadable === 1 ? "" : "s"} unreadable (no ticker), not drawn
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
                    {rows.map((r, i) => (
                      <Row key={r.key} r={r} idx={i} open={open.has(r.key)}
                        onToggle={() => toggle(r.key)} boxW={boxW} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {cursor && (
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
              {l.version ?? "version not stated"} · generated {when(l.generated_at)}
              {" "}· read every 60 s while a token is held
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

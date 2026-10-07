// THE TRADES & GROUNDS LEDGER, AS READ (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". The operator console's
// "Trades & grounds" section (components/TradingLedger.tsx) reads
// GET /api/ops/trading-ledger, the relay of the backend's operator-gated
// GET /api/admin/trading/ledger, and EVERYTHING that turns that payload
// into something drawn or exported lives here, in one place, so a
// contract change on the backend is aligned by editing this file alone.
//
// THE SEAL (Son's decision, 2026-10-06: "Everything, for my bets only").
// The console may show the result and P&L of the trader's OWN orders and
// of contracts he handed over to it — and only those — including matches
// inside the research seal. Nothing here may feed research: this module
// is imported by the console and its tests only; no public page reads it.
//
// THE CONTRACT: trading-ledger-v1 (backend src/trading/ledger.py,
// docs/TRADING-AGENT.md §33), read AS SENT. It was first built against a
// guessed flat shape and drew an empty table against the real route (the
// review of 2026-10-06); e2e/ops-trading-ledger-contract.spec.ts now
// serves payloads RECORDED from the backend (e2e/trading-ledger-recorded.ts)
// so a field read under another name fails there. In short:
//
//   {version, label, env, generated_at, basis, seal, not_recorded,
//    filters, page: {limit, offset, returned, matching, has_more, scanned,
//                    scan_max, scan_complete},
//    vocab: {phases, row_types, states, outcomes}, units,
//    summary: {totals, daily_loss_limit_dollars, by_competition, by_family,
//              by_phase, by_price_bucket, by_edge_bucket,
//              by_day: [{key, …, over_daily_limit}]},
//    rows: [{id, row_type (order|handover|takeback|managed_clip), placed_at,
//            day, competition, fixture{…}, market{ticker, family,
//            outcome_key, contract}, side, price_cents,
//            yes_book_price_cents, count, cost_dollars, fee_dollars, phase,
//            strategy_version, order_id, edge{cents, basis, threshold_cents,
//            threshold_kind, cleared, gate_cents, gate_basis},
//            grounds{status, fair, consensus, model, blend, in_play, maker,
//                    fee, guards, risk, handover},
//            lifecycle{state, filled_count, avg_fill_price_cents, …,
//                      fills[], cancels[]},
//            outcome{status, result, settled_at, payout_dollars,
//                    pnl_dollars, words}, why, not_recorded[],
//            would_be (v1.1) — see THE WOULD-BE below}],
//    would_be_summary (v1.1)}
//
// UNITS are the backend's: prices and edges in CENTS (`*_cents`), money in
// DOLLARS (`*_dollars`), probabilities 0..1, ages in seconds. Nothing is
// converted here.
//
// MISSING IS NOT ZERO. Every reader answers null for a value that was not
// sent or is not a number; every formatter draws null as "not recorded";
// a block's own `status` (not_recorded / not_used / not_applicable /
// absent / truncated) is said in words; the CSV writes null as an EMPTY
// cell — never 0.
//
// THE RESULT IS NEVER GUESSED. `outcome.status` is the backend's, from the
// journal's own `settled` rows: won / lost / unsettled / not_filled /
// unknown. Nothing here derives a result from a side, a price or a score.
//
// EXPERIMENTAL, UNPROVEN. "Edge" is the trader's own estimate at the time
// it placed; nothing here measures one.
//
// THE WOULD-BE (Son, 2026-10-07; trading-ledger-v1.1): an order that ended
// cancelled or expired with contracts UNFILLED carries `would_be` — what
// those contracts would have made at the order's own price, the fee
// included: won / lost / pending / no_result / postponed. NOT MONEY. It is
// read by `parseWouldBe` and drawn by `wouldBeTag` / `wouldBeLines` in dim
// ink only; nothing that sums money here (the totals, `pnlWords`, the
// sort's P&L, the CSV's `pnl_dollars`) reads it — the CSV carries it in
// its own `would_be_*` columns. An old backend that sends no `would_be`
// draws nothing extra: absent is null, never a zero.
import { ANCHOR_SOURCE_WORDS, compLabel } from "./tradingConsole";

type Obj = Record<string, unknown>;
export type Side = "yes" | "no";

export const NOT_RECORDED = "not recorded";
export const LEDGER_VERSION = "trading-ledger-v1";

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const bool = (v: unknown): boolean | null =>
  v === true ? true : v === false ? false : null;

const strs = (v: unknown): string[] | null =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : null;

const sideOf = (v: unknown): Side | null => (v === "yes" || v === "no" ? v : null);

// ----------------------------------------------------------- the query

/** THE PHASES THE BACKEND FILTERS BY (ledger.py PHASES). The proxy refuses
 *  any other value before a backend is asked; the page offers the payload's
 *  own `vocab.phases` once it has one. */
export const LEDGER_PHASES = ["pre_match", "in_play", "protective_exit",
  "managed_close", "handover"] as const;

/** THE FILTERS THE PROXY MAY PASS ON, in the order it writes them. The
 *  route (pages/api/ops/trading-ledger.ts) reads each by name and sends
 *  the backend a query REBUILT from these alone: any other key is
 *  dropped, and a value that is not what its filter is is refused 400
 *  before any backend is asked. */
export const LEDGER_PARAMS = ["since", "until", "competition", "phase",
  "offset", "limit"] as const;
export type LedgerParam = typeof LEDGER_PARAMS[number];

/** The backend's bounds (ledger.py MAX_LIMIT, SCAN_MAX). */
export const LEDGER_LIMIT_MAX = 200;
export const LEDGER_OFFSET_MAX = 5000;

const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})?)?$/;
const wholeIn = (v: string, lo: number, hi: number) =>
  /^\d{1,5}$/.test(v) && Number(v) >= lo && Number(v) <= hi;

export const LEDGER_PARAM_RULES: Record<LedgerParam, {
  test: (v: string) => boolean; words: string;
}> = {
  since: { test: (v) => ISO.test(v) && Number.isFinite(Date.parse(v)),
    words: "an ISO date or date-time (2026-01-31 or 2026-01-31T00:00:00Z)" },
  until: { test: (v) => ISO.test(v) && Number.isFinite(Date.parse(v)),
    words: "an ISO date or date-time (2026-01-31 or 2026-01-31T00:00:00Z); "
      + "a bare date means the end of that UTC day" },
  // the backend's own rule (ledger.py _COMPETITION)
  competition: { test: (v) => /^[a-z0-9_-]{1,16}$/.test(v),
    words: "a competition key (lower-case letters, digits, `_` or `-`, at most 16)" },
  phase: { test: (v) => (LEDGER_PHASES as readonly string[]).includes(v),
    words: `one of the backend's phases (${LEDGER_PHASES.join(", ")})` },
  offset: { test: (v) => wholeIn(v, 0, LEDGER_OFFSET_MAX),
    words: `a whole number of rows from 0 to ${LEDGER_OFFSET_MAX}` },
  limit: { test: (v) => wholeIn(v, 1, LEDGER_LIMIT_MAX),
    words: `a whole number of rows from 1 to ${LEDGER_LIMIT_MAX}` },
};

export type LedgerQuery =
  | { ok: true; search: string }
  | { ok: false; parameter: LedgerParam; detail: string };

/** The backend query for these request values, or the first refusal. An
 *  absent or empty value is no filter; a repeated one is refused rather
 *  than one half of it chosen. */
export function ledgerQuery(values: Partial<Record<LedgerParam, unknown>>): LedgerQuery {
  const out = new URLSearchParams();
  for (const p of LEDGER_PARAMS) {
    const v = values[p];
    if (v === undefined || v === "") continue;
    if (typeof v !== "string" || !LEDGER_PARAM_RULES[p].test(v)) {
      return { ok: false, parameter: p,
        detail: `\`${p}\` must be ${LEDGER_PARAM_RULES[p].words}. This `
          + "refusal is authored here: no backend was contacted." };
    }
    out.set(p, v);
  }
  return { ok: true, search: out.toString() };
}

// ------------------------------------------------------------- the rows

export type RowType = "order" | "handover" | "takeback" | "managed_clip";
const ROW_TYPES: readonly string[] = ["order", "handover", "takeback", "managed_clip"];

export type OutcomeStatus = "won" | "lost" | "unsettled" | "not_filled" | "unknown";
const OUTCOME_STATUSES: readonly string[] = ["won", "lost", "unsettled",
  "not_filled", "unknown"];

export interface Fixture {
  key: string | null;
  /** "recorded" on the row, or "same_event": borrowed from an order on the
   *  same Kalshi event — said beside it */
  key_source: string | null; home: string | null; away: string | null;
  label: string | null; kickoff_utc: string | null;
  kickoff_source: string | null; names_source: string | null;
}

export interface Market {
  ticker: string | null; family: string | null; outcome_key: string | null;
  outcome_key_source: string | null; contract: string | null;
}

export interface Edge {
  cents: number | null; basis: string | null;
  threshold_cents: number | null; threshold_kind: string | null;
  cleared: boolean | null; gate_cents: number | null; gate_basis: string | null;
}

export interface Consensus {
  status: string | null; p_yes: number | null; p_side: number | null;
  method: string | null; age_s: number | null; books: string[] | null;
  per_book: Record<string, number | null> | null; captured_at: string | null;
}

export interface ModelGround {
  status: string | null; p_yes: number | null; p_side: number | null;
  source: string | null; model: string | null; run_id: unknown;
  run_type: string | null; age_s: number | null; captured_at: string | null;
  label: string | null; why_absent: string | null;
}

export interface Blend {
  status: string | null; w: number | null; source: string | null;
  arm: string[] | null; context: string[] | null; threshold: number | null;
}

export interface ExitGround {
  hot_by: string[] | null; momentum_against: number | null;
  xg15_against: number | null; sot15_against: number | null;
  danger: number | null; danger_threshold: number | null;
  tolerance: number | null; window_min: number | null;
  held_side: Side | null; held_by_agent: number | null; rates: string | null;
}

export interface InPlay {
  status: string | null; minute: number | null; period: unknown;
  score: [number, number] | null; p_engine: number | null;
  p_tape: number | null; p_informed: number | null;
  informed_source: string | null; w: number | null;
  anchor: { w: number | null; source: string | null; why: string | null } | null;
  signals: Obj | null; exit: ExitGround | null;
  model_age_s: number | null; book_verified_age_s: number | null;
}

export interface RiskCheck {
  name: string; words: string | null; value: number | null;
  limit: number | [number, number] | null; unit: string | null;
  rule: string | null; passed: boolean | null; exempted: boolean;
}

export interface Guards {
  status: string | null;
  news: { words: string | null; enabled: boolean | null; applies: boolean | null } | null;
  anomaly: { words: string | null; assessed: boolean | null; avoid: boolean | null;
             score: number | null; threshold: number | null } | null;
  error: string | null;
}

export interface Handover {
  reason: string | null; mark_cents: number | null; mark_source: string | null;
  basis: string | null; account_read_at: string | null;
}

export interface Grounds {
  status: string | null;
  fair: { yes: number | null; side: number | null; method: string | null } | null;
  consensus: Consensus | null;
  model: ModelGround | null;
  blend: Blend | null;
  /** THE CAREFUL STRATEGY (2026-10-06): its score, size and ground, as
   *  placed; null for an order another strategy placed */
  careful: CarefulGround | null;
  in_play: InPlay | null;
  maker: { price_cents: number | null; maker_yes_cents: number | null;
           maker_no_cents: number | null; ceiling_cents: number | null } | null;
  fee: { per_contract_cents: number | null; order_dollars: number | null;
         order_basis: string | null } | null;
  guards: Guards | null;
  risk: { status: string | null; path: string | null; version: string | null;
          checks: RiskCheck[]; exemption: string | null } | null;
  handover: Handover | null;
}

export interface Fill {
  at: string | null; count: number | null; price_cents: number | null;
  fee_dollars: number | null; side: Side | null; taker: boolean | null;
  /** THE FILL CORRECTION (backend, 2026-10-06): the count came from the
   *  venue's order record because the fill row's own was unreadable */
  corrected: boolean;
}

export interface Cancel { at: string | null; reason: string | null; words: string | null }

export interface Lifecycle {
  state: string | null; words: string | null;
  filled_count: number | null; remaining: number | null;
  avg_fill_price_cents: number | null; fill_cost_dollars: number | null;
  fill_fees_dollars: number | null; first_fill_at: string | null;
  last_fill_at: string | null; fills: Fill[]; fills_total: number | null;
  fills_readable: boolean | null; cancels: Cancel[];
  cancels_total: number | null; venue_expiry_at: string | null;
}

export interface Outcome {
  status: OutcomeStatus | null; result: Side | null; settled_at: string | null;
  payout_dollars: number | null; pnl_dollars: number | null; words: string | null;
}

export interface LedgerRow {
  /** the journal row's id: unique, and the page's key */
  id: number;
  row_type: RowType;
  placed_at: string | null; day: string | null;
  competition: string | null;
  fixture: Fixture;
  market: Market;
  side: Side | null;
  /** the side bought, cents */
  price_cents: number | null;
  /** the venue's YES-book price, cents (100 − price for a NO buy) */
  yes_book_price_cents: number | null;
  count: number | null;
  /** dollars, fee included */
  cost_dollars: number | null;
  fee_dollars: number | null;
  phase: string | null;
  strategy_version: string | null;
  order_id: string | null;
  edge: Edge;
  grounds: Grounds;
  lifecycle: Lifecycle;
  outcome: Outcome;
  /** NOT MONEY (v1.1): the unfilled remainder's would-be result; null when
   *  the row has none or the backend did not send one */
  would_be: WouldBe | null;
  why: string | null;
  /** the paths this row did not record, as the backend named them */
  not_recorded: string[];
}

const EMPTY_EDGE: Edge = { cents: null, basis: null, threshold_cents: null,
  threshold_kind: null, cleared: null, gate_cents: null, gate_basis: null };

function parseFixture(v: unknown): Fixture {
  const f = obj(v) ?? {};
  return { key: str(f.key), key_source: str(f.key_source), home: str(f.home), away: str(f.away),
    label: str(f.label), kickoff_utc: str(f.kickoff_utc),
    kickoff_source: str(f.kickoff_source), names_source: str(f.names_source) };
}

function parseMarket(v: unknown): Market {
  const m = obj(v) ?? {};
  return { ticker: str(m.ticker), family: str(m.family),
    outcome_key: str(m.outcome_key), outcome_key_source: str(m.outcome_key_source),
    contract: str(m.contract) };
}

function parseEdge(v: unknown): Edge {
  const e = obj(v);
  if (!e) return EMPTY_EDGE;
  return { cents: num(e.cents), basis: str(e.basis),
    threshold_cents: num(e.threshold_cents), threshold_kind: str(e.threshold_kind),
    cleared: bool(e.cleared), gate_cents: num(e.gate_cents),
    gate_basis: str(e.gate_basis) };
}

function parseConsensus(v: unknown): Consensus | null {
  const c = obj(v);
  if (!c) return null;
  const pb = obj(c.per_book);
  return { status: str(c.status), p_yes: num(c.p_yes), p_side: num(c.p_side),
    method: str(c.method), age_s: num(c.age_s), books: strs(c.books),
    per_book: pb ? Object.fromEntries(Object.entries(pb).map(([k, x]) => [k, num(x)])) : null,
    captured_at: str(c.captured_at) };
}

function parseModel(v: unknown): ModelGround | null {
  const m = obj(v);
  if (!m) return null;
  return { status: str(m.status), p_yes: num(m.p_yes), p_side: num(m.p_side),
    source: str(m.source), model: str(m.model), run_id: m.run_id ?? null,
    run_type: str(m.run_type), age_s: num(m.age_s), captured_at: str(m.captured_at),
    label: str(m.label), why_absent: str(m.why_absent) };
}

function parseBlend(v: unknown): Blend | null {
  const b = obj(v);
  if (!b) return null;
  return { status: str(b.status), w: num(b.w), source: str(b.source),
    arm: strs(b.arm), context: strs(b.context), threshold: num(b.threshold) };
}

function parseExit(v: unknown): ExitGround | null {
  const x = obj(v);
  if (!x) return null;
  return { hot_by: strs(x.hot_by), momentum_against: num(x.momentum_against),
    xg15_against: num(x.xg15_against), sot15_against: num(x.sot15_against),
    danger: num(x.danger), danger_threshold: num(x.danger_threshold),
    tolerance: num(x.tolerance), window_min: num(x.window_min),
    held_side: sideOf(x.held_side), held_by_agent: num(x.held_by_agent),
    rates: str(x.rates) };
}

function parseInPlay(v: unknown): InPlay | null {
  const p = obj(v);
  if (!p) return null;
  const sc = Array.isArray(p.score) && p.score.length === 2
    && p.score.every((x) => num(x) !== null)
    ? [p.score[0] as number, p.score[1] as number] as [number, number] : null;
  const a = obj(p.anchor);
  return { status: str(p.status), minute: num(p.minute), period: p.period ?? null,
    score: sc, p_engine: num(p.p_engine), p_tape: num(p.p_tape),
    p_informed: num(p.p_informed), informed_source: str(p.informed_source),
    w: num(p.w),
    anchor: a ? { w: num(a.w), source: str(a.source), why: str(a.why) } : null,
    signals: obj(p.signals), exit: parseExit(p.exit),
    model_age_s: num(p.model_age_s), book_verified_age_s: num(p.book_verified_age_s) };
}

function parseChecks(v: unknown): RiskCheck[] {
  if (!Array.isArray(v)) return [];
  const out: RiskCheck[] = [];
  for (const c of v) {
    const k = obj(c);
    const name = k && str(k.name);
    if (!k || !name) continue;
    const lim = Array.isArray(k.limit) && k.limit.length === 2
      && num(k.limit[0]) !== null && num(k.limit[1]) !== null
      ? [k.limit[0] as number, k.limit[1] as number] as [number, number]
      : num(k.limit);
    out.push({ name, words: str(k.words), value: num(k.value), limit: lim,
      unit: str(k.unit), rule: str(k.rule), passed: bool(k.passed),
      exempted: k.exempted === true });
  }
  return out;
}

function parseGuards(v: unknown): Guards | null {
  const g = obj(v);
  if (!g) return null;
  const n = obj(g.news_guard);
  const a = obj(g.anomaly);
  return { status: str(g.status),
    news: n ? { words: str(n.words), enabled: bool(n.enabled), applies: bool(n.applies) } : null,
    anomaly: a ? { words: str(a.words), assessed: bool(a.assessed), avoid: bool(a.avoid),
      score: num(a.score), threshold: num(a.threshold) } : null,
    error: str(g.error) };
}

function parseGrounds(v: unknown): Grounds {
  const g = obj(v) ?? {};
  const fair = obj(g.fair);
  const maker = obj(g.maker);
  const fee = obj(g.fee);
  const risk = obj(g.risk);
  const h = obj(g.handover);
  return {
    status: str(g.status),
    fair: fair ? { yes: num(fair.yes), side: num(fair.side), method: str(fair.method) } : null,
    consensus: parseConsensus(g.consensus),
    model: parseModel(g.model),
    blend: parseBlend(g.blend),
    careful: parseCareful(g.careful),
    in_play: parseInPlay(g.in_play),
    maker: maker ? { price_cents: num(maker.price_cents),
      maker_yes_cents: num(maker.maker_yes_cents), maker_no_cents: num(maker.maker_no_cents),
      ceiling_cents: num(maker.ceiling_cents) } : null,
    fee: fee ? { per_contract_cents: num(fee.per_contract_cents),
      order_dollars: num(fee.order_dollars), order_basis: str(fee.order_basis) } : null,
    guards: parseGuards(g.guards),
    risk: risk ? { status: str(risk.status), path: str(risk.path),
      version: str(risk.version), checks: parseChecks(risk.checks),
      exemption: str(risk.exemption) } : null,
    handover: h ? { reason: str(h.reason), mark_cents: num(h.mark_cents),
      mark_source: str(h.mark_source), basis: str(h.basis),
      account_read_at: str(h.account_read_at) } : null,
  };
}

function parseLifecycle(v: unknown): Lifecycle {
  const l = obj(v) ?? {};
  const fills: Fill[] = (Array.isArray(l.fills) ? l.fills : []).filter(isObj)
    .map((f) => ({ at: str(f.at), count: num(f.count), price_cents: num(f.price_cents),
      fee_dollars: num(f.fee_dollars), side: sideOf(f.side), taker: bool(f.taker),
      corrected: f.corrected === true }));
  const cancels: Cancel[] = (Array.isArray(l.cancels) ? l.cancels : []).filter(isObj)
    .map((c) => ({ at: str(c.at), reason: str(c.reason), words: str(c.words) }));
  return { state: str(l.state), words: str(l.words),
    filled_count: num(l.filled_count), remaining: num(l.remaining),
    avg_fill_price_cents: num(l.avg_fill_price_cents),
    fill_cost_dollars: num(l.fill_cost_dollars), fill_fees_dollars: num(l.fill_fees_dollars),
    first_fill_at: str(l.first_fill_at), last_fill_at: str(l.last_fill_at),
    fills, fills_total: num(l.fills_total), fills_readable: bool(l.fills_readable),
    cancels, cancels_total: num(l.cancels_total), venue_expiry_at: str(l.venue_expiry_at) };
}

function parseOutcome(v: unknown): Outcome {
  const o = obj(v) ?? {};
  const s = str(o.status);
  return { status: s !== null && OUTCOME_STATUSES.includes(s) ? s as OutcomeStatus : null,
    result: sideOf(o.result), settled_at: str(o.settled_at),
    payout_dollars: num(o.payout_dollars), pnl_dollars: num(o.pnl_dollars),
    words: str(o.words) };
}

/** One row as sent, or null when it is not a ledger row at all (no
 *  numeric id or no known row type) — counted, never dropped silently. */
export function parseRow(r: unknown): LedgerRow | null {
  const o = obj(r);
  if (!o) return null;
  const id = num(o.id);
  const rt = str(o.row_type);
  if (id === null || rt === null || !ROW_TYPES.includes(rt)) return null;
  return {
    id, row_type: rt as RowType,
    placed_at: str(o.placed_at), day: str(o.day),
    competition: str(o.competition),
    fixture: parseFixture(o.fixture), market: parseMarket(o.market),
    side: sideOf(o.side),
    price_cents: num(o.price_cents), yes_book_price_cents: num(o.yes_book_price_cents),
    count: num(o.count), cost_dollars: num(o.cost_dollars), fee_dollars: num(o.fee_dollars),
    phase: str(o.phase), strategy_version: str(o.strategy_version),
    order_id: str(o.order_id),
    edge: parseEdge(o.edge), grounds: parseGrounds(o.grounds),
    lifecycle: parseLifecycle(o.lifecycle), outcome: parseOutcome(o.outcome),
    would_be: parseWouldBe(o.would_be),
    why: str(o.why), not_recorded: strs(o.not_recorded) ?? [],
  };
}

// ---------------------------------------------------------- the summary

export interface Bucket {
  key: string;
  rows: number | null; orders: number | null; filled: number | null;
  contracts: number | null; cost_dollars: number | null; fees_dollars: number | null;
  /** the P&L of the SETTLED rows only */
  settled_pnl_dollars: number | null;
  /** what the filled, unsettled rows cost: open, never a P&L */
  open_cost_dollars: number | null;
  won: number | null; lost: number | null; unsettled: number | null;
  not_filled: number | null; unknown: number | null;
}

export interface DayBucket extends Bucket { over_daily_limit: boolean | null }

export interface Summary {
  totals: Bucket | null;
  /** false when a row's P&L could not be read (`unknown`) or the backend
   *  says its totals are incomplete: the money then covers the readable
   *  rows only */
  complete: boolean;
  daily_loss_limit_dollars: number | null;
  by_day: DayBucket[] | null;
  by_competition: Bucket[] | null;
  by_family: Bucket[] | null;
  by_phase: Bucket[] | null;
  by_price_bucket: Bucket[] | null;
  by_edge_bucket: Bucket[] | null;
}

function bucketOf(v: Obj): Bucket | null {
  const key = str(v.key);
  if (key === null) return null;
  return { key, rows: num(v.rows), orders: num(v.orders), filled: num(v.filled),
    contracts: num(v.contracts), cost_dollars: num(v.cost_dollars),
    fees_dollars: num(v.fees_dollars), settled_pnl_dollars: num(v.settled_pnl_dollars),
    open_cost_dollars: num(v.open_cost_dollars), won: num(v.won), lost: num(v.lost),
    unsettled: num(v.unsettled), not_filled: num(v.not_filled), unknown: num(v.unknown) };
}

const buckets = (v: unknown): Bucket[] | null => (Array.isArray(v)
  ? v.filter(isObj).map(bucketOf).filter((b): b is Bucket => b !== null) : null);

export function parseSummary(v: unknown): Summary | null {
  const s = obj(v);
  if (!s) return null;
  const t = obj(s.totals);
  const totals = t ? bucketOf({ key: "all", ...t }) : null;
  const days = Array.isArray(s.by_day)
    ? s.by_day.filter(isObj).map((d) => {
      const b = bucketOf(d);
      return b ? { ...b, over_daily_limit: bool(d.over_daily_limit) } : null;
    }).filter((d): d is DayBucket => d !== null) : null;
  return {
    totals,
    complete: !(t && (t.complete === false || (num(t.unknown) ?? 0) > 0)),
    daily_loss_limit_dollars: num(s.daily_loss_limit_dollars),
    by_day: days,
    by_competition: buckets(s.by_competition),
    by_family: buckets(s.by_family),
    by_phase: buckets(s.by_phase),
    by_price_bucket: buckets(s.by_price_bucket),
    by_edge_bucket: buckets(s.by_edge_bucket),
  };
}

// ------------------------------------------------- the would-be (v1.1)

/** THE WOULD-BE STATUSES (backend ledger.py WOULD_BE). Any other word is
 *  not drawn: never guessed. */
export const WOULD_BE_STATUSES = ["won", "lost", "pending", "no_result", "postponed"] as const;
export type WouldBeStatus = typeof WOULD_BE_STATUSES[number];

/** What a row's unfilled contracts would have made. NOT MONEY. */
export interface WouldBe {
  status: WouldBeStatus;
  words: string | null;
  result: Side | null;
  /** the unfilled remainder */
  contracts: number | null;
  /** the order's own price, cents */
  price_cents: number | null;
  /** the maker fee of one order of the remainder, dollars */
  fee_dollars: number | null;
  /** won / lost only; null otherwise — never 0 */
  pnl_dollars: number | null;
  source: string | null;
  /** cancelled | expired */
  state: string | null;
  cancel_reason: string | null;
  reason_group: string | null;
  label: string | null;
  why: string | null;
}

/** The hover's first words when the backend sent none. */
export const WOULD_BE_LABEL = "not a real result: this order never filled";

export function parseWouldBe(v: unknown): WouldBe | null {
  const w = obj(v);
  if (!w) return null;
  const st = str(w.status);
  if (st === null || !(WOULD_BE_STATUSES as readonly string[]).includes(st)) return null;
  // the backend marks it not money; a block that says otherwise is not drawn
  if (w.real_money !== undefined && w.real_money !== false) return null;
  const status = st as WouldBeStatus;
  const settled = status === "won" || status === "lost";
  return { status, words: str(w.words), result: sideOf(w.result),
    contracts: num(w.contracts), price_cents: num(w.price_cents),
    fee_dollars: num(w.fee_dollars),
    pnl_dollars: settled ? num(w.pnl_dollars) : null,
    source: str(w.source), state: str(w.state),
    cancel_reason: str(w.cancel_reason), reason_group: str(w.reason_group),
    label: str(w.label), why: str(w.why) };
}

export interface WouldBeBucket {
  key: string; group: string | null; words: string | null;
  orders: number | null; cancelled: number | null; expired: number | null;
  contracts: number | null; won: number | null; lost: number | null;
  pending: number | null; no_result: number | null; postponed: number | null;
  /** the would-be P&L of the won and lost ones: NOT MONEY */
  pnl_dollars: number | null;
}

export interface WouldBeSummary {
  label: string | null; basis: string | null;
  totals: WouldBeBucket | null;
  by_reason: WouldBeBucket[];
  by_group: WouldBeBucket[];
  groups: Record<string, string>;
}

function wbBucket(v: Obj): WouldBeBucket | null {
  const key = str(v.key);
  if (key === null) return null;
  return { key, group: str(v.group), words: str(v.words), orders: num(v.orders),
    cancelled: num(v.cancelled), expired: num(v.expired), contracts: num(v.contracts),
    won: num(v.won), lost: num(v.lost), pending: num(v.pending),
    no_result: num(v.no_result), postponed: num(v.postponed),
    pnl_dollars: num(v.pnl_dollars) };
}

const wbBuckets = (v: unknown): WouldBeBucket[] => (Array.isArray(v)
  ? v.filter(isObj).map(wbBucket).filter((b): b is WouldBeBucket => b !== null) : []);

export function parseWouldBeSummary(v: unknown): WouldBeSummary | null {
  const s = obj(v);
  if (!s) return null;
  if (s.real_money !== undefined && s.real_money !== false) return null;
  const t = obj(s.totals);
  return { label: str(s.label), basis: str(s.basis),
    totals: t ? wbBucket({ key: "all", ...t }) : null,
    by_reason: wbBuckets(s.by_reason), by_group: wbBuckets(s.by_group),
    groups: words(s.groups) };
}

/** The row's would-be tag, short: "NOT FILLED · would have WON +$0.52",
 *  "NOT FILLED ×7 · would have LOST −$2.90" (the unfilled part of a
 *  partly filled order), "NOT FILLED · result pending", "NOT FILLED ·
 *  postponed", "NOT FILLED · no result". null when the row has none. */
export function wouldBeTag(r: LedgerRow): string | null {
  const w = r.would_be;
  if (!w) return null;
  const filled = r.lifecycle.filled_count;
  const part = filled !== null && filled > 0 && w.contracts !== null ? ` ×${whole(w.contracts)}` : "";
  const head = `NOT FILLED${part}`;
  switch (w.status) {
    case "won": case "lost":
      return `${head} · would have ${w.status.toUpperCase()} ${signedDollars(w.pnl_dollars)}`;
    case "pending": return `${head} · result pending`;
    case "postponed": return `${head} · postponed`;
    case "no_result": return `${head} · no result`;
    default: return null;
  }
}

/** The tag's hover: never a real result, then the backend's sentence. */
export function wouldBeTitle(r: LedgerRow): string | null {
  const w = r.would_be;
  if (!w) return null;
  return `${w.label ?? WOULD_BE_LABEL}${w.why ? ` — ${w.why}` : ""}`;
}

/** The inspector's lines for the would-be. */
export function wouldBeLines(r: LedgerRow): string[] {
  const w = r.would_be;
  if (!w) return [];
  const out = [`${w.status.replace(/_/g, " ")}${w.words ? ` — ${w.words}` : ""}`];
  out.push(`${w.contracts === null ? NOT_RECORDED : whole(w.contracts)} unfilled`
    + ` @ ${cents(w.price_cents)} · fee ${dollars(w.fee_dollars)}`
    + ` · would-be ${w.pnl_dollars === null ? "—" : signedDollars(w.pnl_dollars)}`
    + `${w.result ? ` · market ${w.result.toUpperCase()}` : ""}`);
  out.push(`${w.state === "expired" ? "expired at Kalshi" : `cancelled: ${w.cancel_reason ?? NOT_RECORDED}`}`
    + `${w.reason_group ? ` (${w.reason_group.replace(/_/g, " ")})` : ""}`
    + ` · source ${w.source ? w.source.replace(/_/g, " ") : "none yet"}`);
  if (w.why) out.push(w.why);
  return out;
}

/** The summary line's words: "cancelled 12 · would have won 5, lost 7 ·
 *  would-be −$1.30" (pending, postponed and no-result named when any). */
export function wouldBeSummaryWords(s: WouldBeSummary | null): string | null {
  const t = s?.totals;
  if (!t || t.orders === null) return null;
  const extra = [
    t.pending ? `${t.pending} pending` : null,
    t.postponed ? `${t.postponed} postponed` : null,
    t.no_result ? `${t.no_result} no result` : null,
  ].filter(Boolean).join(", ");
  // nothing won or lost yet: no would-be dollars to state — never $0.00
  const settled = (t.won ?? 0) + (t.lost ?? 0) > 0;
  return `cancelled ${t.orders} · would have won ${t.won ?? "?"}, lost ${t.lost ?? "?"}`
    + `${extra ? ` (${extra})` : ""}${settled ? ` · would-be ${t.pnl_dollars === null
      ? NOT_RECORDED : signedDollars(t.pnl_dollars)}` : ""}`;
}

/** A cancel reason in short words; the backend's code otherwise. */
export const reasonWords = (k: string): string =>
  k === "venue_expired" ? "Kalshi expiry" : k.replace(/_/g, " ");

// -------------------------------------------------------------- a page

export interface Page {
  limit: number | null; offset: number | null; returned: number | null;
  matching: number | null; has_more: boolean | null; scanned: number | null;
  scan_max: number | null; scan_complete: boolean | null;
}

export interface Ledger {
  version: string | null; label: string | null; env: string | null;
  generated_at: string | null; basis: string | null; seal: string | null;
  rows: LedgerRow[];
  /** rows the payload carried that are not ledger rows (no id or no known
   *  row type) — counted and said, never dropped silently */
  unreadable: number;
  summary: Summary | null;
  /** NOT MONEY (v1.1): the would-be results, overall and by cancel reason;
   *  null when the backend did not send them */
  would_be_summary: WouldBeSummary | null;
  page: Page | null;
  /** the offset of the next, older page — null when there is none */
  next_offset: number | null;
  vocab: { phases: Record<string, string>; row_types: Record<string, string>;
           states: Record<string, string>; outcomes: Record<string, string> };
}

const words = (v: unknown): Record<string, string> => {
  const o = obj(v);
  if (!o) return {};
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(o)) { const s = str(x); if (s) out[k] = s; }
  return out;
};

export function parseLedger(b: Obj): Ledger {
  const rows: LedgerRow[] = [];
  let unreadable = 0;
  for (const r of Array.isArray(b.rows) ? b.rows : []) {
    const row = parseRow(r);
    if (row) rows.push(row); else unreadable += 1;
  }
  const p = obj(b.page);
  const page: Page | null = p ? { limit: num(p.limit), offset: num(p.offset),
    returned: num(p.returned), matching: num(p.matching), has_more: bool(p.has_more),
    scanned: num(p.scanned), scan_max: num(p.scan_max),
    scan_complete: bool(p.scan_complete) } : null;
  // THE NEXT PAGE IS THE NEXT OFFSET, while the backend says there is more
  const next = page && page.has_more === true && page.offset !== null
    && page.returned !== null && page.returned > 0
    ? page.offset + page.returned : null;
  const v = obj(b.vocab) ?? {};
  return {
    version: str(b.version), label: str(b.label), env: str(b.env),
    generated_at: str(b.generated_at), basis: str(b.basis), seal: str(b.seal),
    // AS SENT: the backend serves newest first
    rows, unreadable,
    summary: parseSummary(b.summary),
    would_be_summary: parseWouldBeSummary(b.would_be_summary),
    page,
    next_offset: next !== null && next <= LEDGER_OFFSET_MAX ? next : null,
    vocab: { phases: words(v.phases), row_types: words(v.row_types),
      states: words(v.states), outcomes: words(v.outcomes) },
  };
}

// ------------------------------------------------------------ the words

/** THE PHASES, in short words (ledger.py PHASES; the long words come in
 *  the payload's vocab). A code not listed is drawn as itself. */
export const PHASE_WORDS: Record<string, string> = {
  pre_match: "pre-match", in_play: "in-play", protective_exit: "protective exit",
  managed_close: "managed close", handover: "handover",
};

export const phaseWords = (p: string | null): string =>
  p === null ? NOT_RECORDED : PHASE_WORDS[p] ?? p.replace(/_/g, " ");

/** A row type that is not an order, in short words. */
export const ROW_TYPE_WORDS: Record<RowType, string> = {
  order: "order", handover: "handed over", takeback: "taken back",
  managed_clip: "sold outside the trader",
};

/** THE MARKET FAMILIES, in plain words (backend
 *  src/trading/fixture_map.py FAMILIES). Unlisted: drawn as sent. */
export const FAMILY_WORDS: Record<string, string> = {
  GAME: "match result", TOTAL: "total goals", BTTS: "both teams to score",
  SPREAD: "goal spread", TEAMTOTAL: "team total goals",
  SCORE: "correct score", FTTS: "first team to score",
  MOV: "margin of victory", "1H": "first-half result",
  "1HTOTAL": "first-half total goals", "1HSPREAD": "first-half spread",
  "1HBTTS": "first-half both teams to score", "1HSCORE": "first-half score",
  "2H": "second-half result",
};

export const familyWords = (f: string | null): string =>
  f === null ? NOT_RECORDED : FAMILY_WORDS[f] ?? f;

/** The backend's bucket keys in words; unlisted keys as sent. */
const BUCKET_WORDS: Record<string, string> = {
  not_recorded: NOT_RECORDED, not_applicable: "not applicable (handover rows)",
  unknown: "not stated",
};

/** "0-20" -> "0–20¢"; the backend's other keys in words. */
export function priceBucketWords(k: string): string {
  const m = /^(\d{1,3})-(\d{1,3})$/.exec(k);
  return m ? `${m[1]}–${m[2]}¢` : BUCKET_WORDS[k] ?? k;
}

/** "<0" -> "below 0¢", "1-2" -> "1–2¢", "5+" -> "5¢ and up". */
export function edgeBucketWords(k: string): string {
  if (k === "<0") return "below 0¢";
  const m = /^(\d+)-(\d+)$/.exec(k);
  if (m) return `${m[1]}–${m[2]}¢`;
  const up = /^(\d+)\+$/.exec(k);
  if (up) return `${up[1]}¢ and up`;
  return BUCKET_WORDS[k] ?? k;
}

/** A sub-block's status, in words (the backend's codes). */
export const BLOCK_STATUS_WORDS: Record<string, string> = {
  not_recorded: NOT_RECORDED, not_used: "not used", not_applicable: "not applicable",
  absent: "absent", truncated: "truncated — the inputs were too large to keep",
};
export const blockWords = (s: string | null): string =>
  s === null ? NOT_RECORDED : BLOCK_STATUS_WORDS[s] ?? s.replace(/_/g, " ");

export { compLabel };

// ------------------------------------------------------- the formatting

/** a probability as a percentage, one decimal */
export const pct = (p: number | null): string =>
  p === null ? NOT_RECORDED : `${(p * 100).toFixed(1)}%`;

/** cents, whole when whole, else one decimal (two under a cent) */
export function cents(c: number | null): string {
  if (c === null) return NOT_RECORDED;
  const a = Math.abs(c);
  const r = a < 1 && a > 0 ? Math.round(c * 100) / 100 : Math.round(c * 10) / 10;
  return `${r < 0 ? "−" : ""}${Math.abs(r)}¢`;
}

/** cents to two decimals, trimmed: the grounds' own precision */
export function cents2(c: number | null): string {
  if (c === null) return NOT_RECORDED;
  const r = Math.round(c * 100) / 100;
  return `${r < 0 ? "−" : ""}${Math.abs(r)}¢`;
}

/** signed cents: an edge */
export function signedCents(c: number | null, precise = false): string {
  if (c === null) return NOT_RECORDED;
  const body = (precise ? cents2 : cents)(Math.abs(c));
  return `${c > 0 ? "+" : c < 0 ? "−" : ""}${body}`;
}

/** dollars, two decimals */
export const dollars = (n: number | null): string =>
  n === null ? NOT_RECORDED : `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`;

/** a gain or a loss: "+$1.20", "−$0.40", "$0.00" */
export const signedDollars = (n: number | null): string =>
  n === null ? NOT_RECORDED
    : `${n > 0 ? "+" : n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`;

/** an age in seconds, short: "45s", "20m", "3h", "3h 12m", "2d" */
export function age(s: number | null): string {
  if (s === null) return NOT_RECORDED;
  const t = Math.max(0, Math.round(s));
  if (t < 60) return `${t}s`;
  const m = Math.floor(t / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const whole = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/** the anchor's or a model's source, in short words (lib/tradingConsole.ts) */
export const sourceWords = (s: string | null): string =>
  s === null ? "source not recorded" : ANCHOR_SOURCE_WORDS[s] ?? s.replace(/_/g, " ");

// ------------------------------------------------- the cells of a row

/** The result cell, from outcome.status alone: "YES · won", "unsettled",
 *  "not filled", "unknown — a fill could not be read". */
export function resultWords(r: LedgerRow): string {
  const o = r.outcome;
  const R = o.result ? o.result.toUpperCase() : null;
  switch (o.status) {
    case "won": case "lost": return `${R ?? "?"} · ${o.status}`;
    case "unsettled": return "unsettled";
    case "not_filled": return R ? `not filled · settled ${R}` : "not filled";
    case "unknown": return "unknown — a fill could not be read";
    default: return NOT_RECORDED;
  }
}

/** The P&L cell: the backend's dollars for a settled row; "unsettled"
 *  while its market has no journaled result; "$0.00 · not filled" for an
 *  order that spent nothing; "unknown" when a fill could not be read. */
export function pnlWords(r: LedgerRow): string {
  const o = r.outcome;
  switch (o.status) {
    case "won": case "lost": return signedDollars(o.pnl_dollars);
    case "unsettled": return "unsettled";
    case "not_filled": return `${o.pnl_dollars === null ? NOT_RECORDED
      : dollars(o.pnl_dollars)} · not filled`;
    case "unknown": return "unknown";
    default: return NOT_RECORDED;
  }
}

/** The fill cell: "filled 12/12 @ 41¢", "cancelled 0/5", "resting 0/3". */
export function fillWords(r: LedgerRow): string {
  const l = r.lifecycle;
  if (r.row_type !== "order") {
    return `${ROW_TYPE_WORDS[r.row_type]} ${l.filled_count === null ? NOT_RECORDED
      : whole(l.filled_count)}${l.avg_fill_price_cents === null ? ""
      : ` @ ${cents(l.avg_fill_price_cents)}`}`;
  }
  if (l.state === null) return NOT_RECORDED;
  const state = l.state === "unknown" ? "no fill, cancel or expiry recorded" : l.state;
  if (l.filled_count === null) {
    return `${state} · fills unreadable`;
  }
  const of = r.count === null ? "" : `/${whole(r.count)}`;
  const avg = l.avg_fill_price_cents === null ? "" : ` @ ${cents(l.avg_fill_price_cents)}`;
  return `${state} ${whole(l.filled_count)}${of}${avg}`;
}

/** The edge cell: "+6.9¢ vs 3¢"; a protective exit's bar is minus its
 *  tolerance; a handover row has none. */
export function edgeWords(r: LedgerRow): string {
  if (r.row_type !== "order") return "not applicable";
  const e = r.edge;
  const mine = e.cents ?? e.gate_cents;
  if (mine === null) return NOT_RECORDED;
  const thr = e.threshold_cents === null ? " (no bar recorded)"
    : ` vs ${cents(e.threshold_cents)}`;
  return `${signedCents(mine)}${thr}`;
}

/** what the edge cell notes under it: the bar's kind and the edge's basis */
export function edgeNote(r: LedgerRow): string | null {
  if (r.row_type !== "order") return null;
  const e = r.edge;
  const bits: string[] = [];
  if (e.threshold_kind === "exit_tolerance") bits.push("exit tolerance");
  if (e.cents === null && e.gate_cents !== null) bits.push(`the gate's edge (${e.gate_basis ?? "basis not recorded"})`);
  else if (e.basis === "computed") bits.push("computed from the recorded fair");
  return bits.length ? bits.join(" · ") : null;
}

// ---------------------------------------------- the grounds, in words

export function fairWords(g: Grounds, side: Side | null): string {
  const f = g.fair;
  if (!f || (f.side === null && f.yes === null)) return NOT_RECORDED;
  const s = side ? side.toUpperCase() : "the side";
  return `${s} ${pct(f.side)} · YES ${pct(f.yes)}${f.method ? ` · ${f.method}` : ""}`;
}

export function consensusWords(c: Consensus | null): string {
  if (!c) return NOT_RECORDED;
  if (c.status !== "recorded") return blockWords(c.status);
  const books = c.books === null ? "books not recorded"
    : `${c.books.length} book${c.books.length === 1 ? "" : "s"} (${c.books.join(", ")})`;
  return [`${pct(c.p_side)} for the side (YES ${pct(c.p_yes)})`,
    c.age_s === null ? "age not recorded" : `${age(c.age_s)} old`,
    books, c.method ? `method ${c.method}` : "method not recorded"].join(" · ");
}

export function modelWords(m: ModelGround | null): string {
  if (!m) return NOT_RECORDED;
  if (m.status === "absent") {
    return `absent — ${m.why_absent ?? "why not recorded"}`;
  }
  if (m.status !== "recorded") {
    return m.status === "not_used" ? "not used — the bookmakers alone priced it"
      : blockWords(m.status);
  }
  const run = [m.model, m.run_type, m.run_id === null || m.run_id === undefined
    ? null : `run ${String(m.run_id)}`].filter(Boolean).join(", ");
  return [`${pct(m.p_side)} for the side (YES ${pct(m.p_yes)})`,
    `${sourceWords(m.source)}${run ? ` (${run})` : ""}`,
    m.age_s === null ? "run age not recorded" : `${age(m.age_s)} old`,
    "unvalidated"].join(" · ");
}

export interface CarefulGround {
  score: number | null; size_dollars: number | null;
  worst_dollars: number | null; ground: string | null;
  /** (2026-10-07) out of 5 pre-match, 3 on the in-play ladder */
  score_of?: number | null;
  /** (2026-10-07) the in-play ladder's signals (deep, fresh, spare) */
  signals?: string[] | null;
}

function parseCareful(v: unknown): CarefulGround | null {
  const c = obj(v);
  if (!c) return null;
  return { score: num(c.score), size_dollars: num(c.size_dollars),
    worst_dollars: num(c.worst_dollars), ground: str(c.ground),
    score_of: num(c.score_of),
    signals: Array.isArray(c.signals)
      ? c.signals.filter((x): x is string => typeof x === "string") : null };
}

/** The careful strategy's grounds, in words; "" for another strategy. */
export function carefulWords(c: CarefulGround | null): string {
  if (!c) return "";
  const sig = c.signals == null ? ""
    : ` (${c.signals.length ? c.signals.join(", ") : "no signal"})`;
  return `confidence ${c.score ?? "?"}/${c.score_of ?? 5}${sig} · size $${c.size_dollars ?? "?"}`
    + ` (worst case ${dollars(c.worst_dollars)}) · ${c.ground ?? "ground not recorded"}`;
}

export function blendWords(b: Blend | null): string {
  if (!b) return NOT_RECORDED;
  if (b.status !== "recorded") return blockWords(b.status);
  return [`w ${b.w === null ? NOT_RECORDED : b.w.toFixed(2)} on the model`,
    `arm ${b.arm ? b.arm.join("/") : NOT_RECORDED}`,
    `bar ${cents(b.threshold)}`, b.source ? `source ${b.source}` : null,
    b.context ? `context ${b.context.join(", ")}` : null]
    .filter(Boolean).join(" · ");
}

export function makerWords(g: Grounds): string {
  const m = g.maker;
  if (!m || m.price_cents === null) return NOT_RECORDED;
  const parts = [`${cents(m.price_cents)} (its own price)`];
  if (m.maker_yes_cents !== null) parts.push(`maker YES ${cents(m.maker_yes_cents)}`);
  if (m.maker_no_cents !== null) parts.push(`maker NO ${cents(m.maker_no_cents)}`);
  if (m.ceiling_cents !== null) parts.push(`ceiling ${cents(m.ceiling_cents)}`);
  return parts.join(" · ");
}

export function feeWords(g: Grounds): string {
  const f = g.fee;
  if (!f || (f.per_contract_cents === null && f.order_dollars === null)) return NOT_RECORDED;
  return `${cents2(f.per_contract_cents)} a contract · order ${dollars(f.order_dollars)}`
    + `${f.order_basis ? ` (${f.order_basis})` : ""}`;
}

export function edgeGroundWords(r: LedgerRow): string {
  const e = r.edge;
  if (r.row_type !== "order") return "not applicable";
  if (e.cents === null && e.gate_cents === null) return NOT_RECORDED;
  const parts: string[] = [];
  if (e.cents !== null) parts.push(`${signedCents(e.cents, true)} after the fee (${e.basis ?? "basis not recorded"})`);
  if (e.gate_cents !== null) parts.push(`gate ${signedCents(e.gate_cents, true)} (${e.gate_basis ?? "basis not recorded"})`);
  parts.push(e.threshold_cents === null ? "bar not recorded"
    : `bar ${cents2(e.threshold_cents)} (${e.threshold_kind === "exit_tolerance"
      ? "exit tolerance" : e.threshold_kind === "min_edge" ? "min edge"
        : e.threshold_kind ?? "kind not recorded"})`);
  if (e.cleared !== null) parts.push(e.cleared ? "clears the bar" : "under the bar");
  return parts.join(" · ");
}

const pair = (v: unknown): string | null =>
  Array.isArray(v) && v.length === 2 && v.every((x) => num(x) !== null)
    ? `${v[0]}, ${v[1]}` : null;

export function inPlayLines(ip: InPlay | null): string[] {
  if (!ip) return [NOT_RECORDED];
  if (ip.status !== "recorded") return [blockWords(ip.status)];
  const out: string[] = [];
  out.push(`minute ${ip.minute === null ? NOT_RECORDED : whole(ip.minute)}${ip.score
    ? ` · ${ip.score[0]}-${ip.score[1]} (home-away)` : " · score not recorded"}`);
  out.push(`engine ${pct(ip.p_engine)} YES`
    + (ip.p_tape !== null ? ` · tape ${pct(ip.p_tape)}` : "")
    + (ip.p_informed !== null ? ` · live-informed ${pct(ip.p_informed)}` : "")
    + (ip.w !== null ? ` · w ${ip.w.toFixed(2)}` : "")
    + (ip.informed_source ? ` · ${ip.informed_source}` : ""));
  out.push(ip.anchor ? `anchor w ${ip.anchor.w === null ? NOT_RECORDED
    : ip.anchor.w.toFixed(2)} · ${sourceWords(ip.anchor.source)}` : "anchor not recorded");
  if (ip.signals) {
    const s = ip.signals;
    const bits = ["momentum", "xg15", "sot15", "rating_delta"]
      .map((k) => { const p = pair(s[k]); return p ? `${k} ${p}` : null; })
      .filter(Boolean);
    out.push(`signals (home, away): ${bits.length ? bits.join(" · ") : "none"}`
      + `${str(s.profile) ? ` · ${s.profile}` : ""}`);
  } else {
    out.push("signals not recorded");
  }
  const x = ip.exit;
  if (x) {
    out.push(`HOT by ${x.hot_by && x.hot_by.length ? x.hot_by.join(", ") : "nothing recorded"}`
      + ` · danger ${pct(x.danger)}${x.danger_threshold !== null
        ? ` ≥ ${pct(x.danger_threshold)}` : ""}`
      + `${x.window_min !== null ? ` in ${whole(x.window_min)} min` : ""}`);
    out.push(`held ${x.held_side ? x.held_side.toUpperCase() : NOT_RECORDED}`
      + `${x.held_by_agent !== null ? ` × ${whole(x.held_by_agent)}` : ""}`
      + ` · tolerance ${x.tolerance === null ? NOT_RECORDED : cents2(x.tolerance * 100)}`
      + `${x.rates ? ` · rates ${x.rates}` : ""}`);
  }
  out.push(`model age ${age(ip.model_age_s)} · feed vouched ${age(ip.book_verified_age_s)} ago`);
  return out;
}

export function guardLines(g: Guards | null): string[] {
  if (!g) return [NOT_RECORDED];
  if (g.status !== "recorded") {
    return [`${blockWords(g.status)}${g.error ? ` (${g.error})` : ""}`];
  }
  return [`news guard: ${g.news?.words ?? NOT_RECORDED}`,
    `anomaly: ${g.anomaly?.words ?? NOT_RECORDED}${g.anomaly && g.anomaly.score !== null
      ? ` (score ${g.anomaly.score}${g.anomaly.threshold !== null
        ? ` vs ${g.anomaly.threshold}` : ""})` : ""}`];
}

const RULE_SIGN: Record<string, string> = { max: "≤", below: "<", min: "≥" };

export function riskLines(r: Grounds["risk"]): string[] {
  if (!r) return [NOT_RECORDED];
  if (r.status !== "recorded") return [blockWords(r.status)];
  const out = r.checks.map((c) => {
    const lim = Array.isArray(c.limit) ? `${c.limit[0]}..${c.limit[1]}`
      : c.limit === null ? "limit not recorded" : String(c.limit);
    const sign = c.rule === "between" ? "in" : RULE_SIGN[c.rule ?? ""] ?? "vs";
    const v = c.value === null ? NOT_RECORDED : String(c.value);
    const verdict = c.exempted ? "exempted" : c.passed === null ? "not checkable"
      : c.passed ? "passed" : "FAILED";
    return `${c.name}: ${v} ${sign} ${lim}${c.unit ? ` ${c.unit}` : ""} — ${verdict}`;
  });
  if (!out.length) out.push("no checks recorded");
  if (r.exemption) out.push(`exemption: ${r.exemption}`);
  return out;
}

export function lifecycleLines(r: LedgerRow): string[] {
  const l = r.lifecycle;
  const out = [`${l.state ?? NOT_RECORDED}${l.words ? ` — ${l.words}` : ""}`];
  if (l.filled_count !== null) {
    out.push(`filled ${whole(l.filled_count)}${l.avg_fill_price_cents !== null
      ? ` @ ${cents2(l.avg_fill_price_cents)}` : ""} · cost ${dollars(l.fill_cost_dollars)}`
      + ` · fees ${dollars(l.fill_fees_dollars)}`);
  } else if (l.fills_readable === false) {
    out.push("a fill row could not be read");
  }
  for (const f of l.fills) {
    out.push(`fill ${f.at ?? "time not recorded"}: ${f.count === null ? "?" : whole(f.count)}`
      + ` ${f.side ? f.side.toUpperCase() : ""} @ ${cents2(f.price_cents)}`
      + ` · fee ${dollars(f.fee_dollars)}${f.taker === true ? " · taker" : ""}`
      + (f.corrected ? " · count corrected from the venue's order record" : ""));
  }
  if (l.fills_total !== null && l.fills_total > l.fills.length) {
    out.push(`… ${l.fills_total - l.fills.length} more fills`);
  }
  for (const c of l.cancels) {
    out.push(`cancelled ${c.at ?? "time not recorded"}: ${c.reason ?? NOT_RECORDED}`
      + `${c.words ? ` — ${c.words}` : ""}`);
  }
  if (l.venue_expiry_at) out.push(`venue expiry ${l.venue_expiry_at}`);
  return out;
}

export function outcomeLines(r: LedgerRow): string[] {
  const o = r.outcome;
  return [`${o.status ?? NOT_RECORDED}${o.words ? ` — ${o.words}` : ""}`,
    `journaled result ${o.result ? o.result.toUpperCase() : "none"}${o.settled_at
      ? ` (${o.settled_at})` : ""}`,
    `payout ${o.payout_dollars === null ? "—" : dollars(o.payout_dollars)} · this row's P&L ${pnlWords(r)}`];
}

export function handoverWords(h: Handover | null): string {
  if (!h) return NOT_RECORDED;
  return [`mark ${cents(h.mark_cents)}`, `mark source ${h.mark_source ?? NOT_RECORDED}`,
    h.reason ? `reason ${h.reason}` : null, h.basis].filter(Boolean).join(" · ");
}

// ------------------------------------------------------------ the CSV

/** THE CSV'S COLUMNS, in order. Prices and edges in cents a contract,
 *  money in dollars, probabilities 0..1, ages in seconds. A value not
 *  recorded is an EMPTY cell — never 0. */
export const LEDGER_CSV_COLUMNS = [
  "id", "placed_at", "row_type", "phase", "competition", "home", "away",
  "kickoff_utc", "ticker", "family", "outcome_key", "contract", "side",
  "price_cents", "yes_book_price_cents", "count", "cost_dollars", "fee_dollars",
  "strategy_version", "fair_side", "fair_yes", "consensus_p_side",
  "consensus_age_s", "consensus_books", "model_p_side", "model_source",
  "model_age_s", "blend_w", "blend_arm", "edge_cents", "edge_basis",
  "threshold_cents", "threshold_kind", "edge_cleared", "maker_price_cents",
  "fee_per_contract_cents", "inplay_minute", "inplay_score", "inplay_p_engine",
  "anchor_w", "anchor_source", "exit_hot_by", "exit_danger", "news_guard",
  "anomaly", "risk_checks", "state", "filled_count", "avg_fill_price_cents",
  "fill_fees_dollars", "cancel_reasons", "result", "outcome", "pnl_dollars",
  "why", "not_recorded",
  // NOT MONEY (v1.1): the unfilled remainder's would-be, apart from the
  // real `pnl_dollars` above; empty when the row has none
  "would_be_status", "would_be_result", "would_be_contracts",
  "would_be_price_cents", "would_be_fee_dollars", "would_be_pnl_dollars",
  "would_be_source", "would_be_cancel_reason", "would_be_reason_group",
] as const;

type Cell = string | number | null;

/** one CSV field: numbers as numbers; text quoted when it must be, and
 *  defused when a spreadsheet would run it as a formula */
function field(v: Cell): string {
  if (v === null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  let s = v;
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const yn = (b: boolean | null): Cell => (b === null ? null : b ? "yes" : "no");

export function ledgerCsvRow(r: LedgerRow): Cell[] {
  const g = r.grounds;
  const ip = g.in_play;
  const recorded = (s: string | null | undefined) => s === "recorded";
  const byCol: Record<typeof LEDGER_CSV_COLUMNS[number], Cell> = {
    id: r.id, placed_at: r.placed_at, row_type: r.row_type, phase: r.phase,
    competition: r.competition, home: r.fixture.home, away: r.fixture.away,
    kickoff_utc: r.fixture.kickoff_utc, ticker: r.market.ticker,
    family: r.market.family, outcome_key: r.market.outcome_key,
    contract: r.market.contract, side: r.side, price_cents: r.price_cents,
    yes_book_price_cents: r.yes_book_price_cents, count: r.count,
    cost_dollars: r.cost_dollars, fee_dollars: r.fee_dollars,
    strategy_version: r.strategy_version,
    fair_side: g.fair?.side ?? null, fair_yes: g.fair?.yes ?? null,
    consensus_p_side: g.consensus?.p_side ?? null,
    consensus_age_s: g.consensus?.age_s ?? null,
    consensus_books: g.consensus?.books ? g.consensus.books.join("|") : null,
    model_p_side: g.model?.p_side ?? null,
    model_source: recorded(g.model?.status) ? g.model?.source ?? null : null,
    model_age_s: g.model?.age_s ?? null,
    blend_w: g.blend?.w ?? null,
    blend_arm: g.blend?.arm ? g.blend.arm.join("/") : null,
    edge_cents: r.edge.cents ?? r.edge.gate_cents, edge_basis: r.edge.cents !== null
      ? r.edge.basis : r.edge.gate_cents !== null ? `gate:${r.edge.gate_basis ?? ""}` : null,
    threshold_cents: r.edge.threshold_cents, threshold_kind: r.edge.threshold_kind,
    edge_cleared: yn(r.edge.cleared),
    maker_price_cents: g.maker?.price_cents ?? null,
    fee_per_contract_cents: g.fee?.per_contract_cents ?? null,
    inplay_minute: recorded(ip?.status) ? ip?.minute ?? null : null,
    inplay_score: ip?.score ? `${ip.score[0]}-${ip.score[1]}` : null,
    inplay_p_engine: ip?.p_engine ?? null,
    anchor_w: ip?.anchor?.w ?? null, anchor_source: ip?.anchor?.source ?? null,
    exit_hot_by: ip?.exit?.hot_by ? ip.exit.hot_by.join("|") : null,
    exit_danger: ip?.exit?.danger ?? null,
    news_guard: g.guards?.news?.words ?? null,
    anomaly: g.guards?.anomaly?.words ?? null,
    risk_checks: g.risk && g.risk.checks.length ? g.risk.checks.map((c) =>
      `${c.name}:${c.exempted ? "exempted" : c.passed === null ? "unknown"
        : c.passed ? "passed" : "failed"}`).join("|") : null,
    state: r.lifecycle.state, filled_count: r.lifecycle.filled_count,
    avg_fill_price_cents: r.lifecycle.avg_fill_price_cents,
    fill_fees_dollars: r.lifecycle.fill_fees_dollars,
    cancel_reasons: r.lifecycle.cancels.length
      ? r.lifecycle.cancels.map((c) => c.reason ?? "").join("|") : null,
    result: r.outcome.result, outcome: r.outcome.status,
    // a P&L only where the backend settled one: unsettled is EMPTY
    pnl_dollars: r.outcome.pnl_dollars,
    why: r.why, not_recorded: r.not_recorded.length ? r.not_recorded.join("|") : null,
    would_be_status: r.would_be?.status ?? null,
    would_be_result: r.would_be?.result ?? null,
    would_be_contracts: r.would_be?.contracts ?? null,
    would_be_price_cents: r.would_be?.price_cents ?? null,
    would_be_fee_dollars: r.would_be?.fee_dollars ?? null,
    would_be_pnl_dollars: r.would_be?.pnl_dollars ?? null,
    would_be_source: r.would_be?.source ?? null,
    would_be_cancel_reason: r.would_be?.cancel_reason ?? null,
    would_be_reason_group: r.would_be?.reason_group ?? null,
  };
  return LEDGER_CSV_COLUMNS.map((c) => byCol[c]);
}

/** The rows as a CSV document (RFC 4180, CRLF line ends, header first). */
export function ledgerCsv(rows: LedgerRow[]): string {
  return [LEDGER_CSV_COLUMNS.join(","),
    ...rows.map((r) => ledgerCsvRow(r).map(field).join(","))].join("\r\n");
}

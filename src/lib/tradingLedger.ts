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
// THE CONTRACT, AS BUILT AGAINST (both tracks built it the same day):
//
//   {rows: [{placed_at, competition, fixture: {home, away, kickoff_utc},
//            ticker, family, outcome_key, contract, side, price, count,
//            cost, phase, strategy_version,
//            grounds: {fair, consensus: {prob, age_s, books},
//                      model: {prob, source, run_age_s}, w, threshold,
//                      maker_price, fee, edge, guards, risk, inplay},
//            why, fills: {count, avg_price, fees, last_at}, status,
//            cancel_reason, result, pnl}],
//    summary: {totals, by_day: [{day, pnl, placed, wins, losses,
//              unsettled}], by_competition, by_family, by_phase,
//              by_price_bucket, by_edge_bucket, daily_limit},
//    next_cursor}
//
// Read leniently where the contract left a choice open: a handed-over
// contract is its own row type (`kind` / `row_type` "handover", or a
// phase / status of "handed_over"); a breakdown may be an object keyed by
// group or a list of `{key | bucket | …, …}`; `books` may be a list of
// names or a count; `daily_limit` a number or `{dollars | limit}`.
//
// UNITS. A `units` block, when sent, says what was sent and wins:
// `{prices, edges, money}`, each "cents" or "dollars". Without one:
//   - a PRICE (the YES-book `price`, `maker_price`, a fill's `avg_price`)
//     is read by magnitude, which is unambiguous on Kalshi: a price is
//     1..99 cents or 0.01..0.99 dollars, so below 1 is dollars;
//   - an EDGE, FEE or THRESHOLD takes the unit of the row's own prices
//     (the grounds' maker price, else the row's YES-book price), because
//     one block is written in one unit — the journal's decimal dollars
//     ("0.028") or the console's cents (2.8); with no price on the row, a
//     threshold under 0.5 says dollars (no bar is half a cent);
//   - MONEY (cost, fees, P&L, the daily limit) is dollars.
// Everything is drawn in cents a contract or in dollars.
//
// MISSING IS NOT ZERO. Every reader answers null for a value that was
// not sent or is not a number, every formatter draws null as "not
// recorded" (or "unsettled" for a P&L whose market has no journaled
// result), and the CSV writes null as an EMPTY cell — never 0.
//
// THE RESULT IS NEVER GUESSED. `result` is the backend's, from the
// journal's own `settled` rows: "yes" / "no", or null for a market with
// no journaled result. Won / lost is derived from that result and the
// row's side — the two values printed beside it — and only for a row
// that held contracts (a fill, or a hand-over).
//
// EXPERIMENTAL, UNPROVEN. "Edge" is the trader's own estimate at the
// time it placed; nothing here measures one.
import { ANCHOR_SOURCE_WORDS, compLabel } from "./tradingConsole";

type Obj = Record<string, unknown>;
export type Side = "yes" | "no";

export const NOT_RECORDED = "not recorded";

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

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const bool = (v: unknown): boolean | null =>
  v === true ? true : v === false ? false : null;

/** a probability (0..1); above 1 it was sent as a percentage */
function prob(v: unknown): number | null {
  const n = num(v);
  if (n === null) return null;
  const p = n > 1 ? n / 100 : n;
  return p >= 0 && p <= 1 ? p : null;
}

/** rounding away float dust from a unit change (0.44 * 100) */
const tidy = (n: number) => Math.round(n * 1e6) / 1e6;

// ----------------------------------------------------------- the query

/** THE FILTERS THE PROXY MAY PASS ON, in the order it writes them. The
 *  route (pages/api/ops/trading-ledger.ts) reads each by name and sends
 *  the backend a query REBUILT from these alone: any other key is
 *  dropped, and a value that is not what its filter is is refused 400
 *  before any backend is asked. */
export const LEDGER_PARAMS = ["since", "until", "competition", "phase",
  "cursor", "limit"] as const;
export type LedgerParam = typeof LEDGER_PARAMS[number];

/** The most rows one page may ask for. */
export const LEDGER_LIMIT_MAX = 500;

const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export const LEDGER_PARAM_RULES: Record<LedgerParam, {
  test: (v: string) => boolean; words: string;
}> = {
  since: { test: (v) => ISO.test(v) && Number.isFinite(Date.parse(v)),
    words: "an ISO date or date-time (2026-01-31 or 2026-01-31T00:00:00Z)" },
  until: { test: (v) => ISO.test(v) && Number.isFinite(Date.parse(v)),
    words: "an ISO date or date-time (2026-01-31 or 2026-01-31T00:00:00Z)" },
  competition: { test: (v) => /^[a-z0-9-]{1,40}$/.test(v),
    words: "a competition key (lower-case letters, digits or `-`, at most 40)" },
  phase: { test: (v) => /^[a-z][a-z_-]{0,31}$/.test(v),
    words: "a phase code (lower-case letters, `_` or `-`, at most 32)" },
  // an opaque cursor the backend minted: no whitespace, no `/`, no `#`,
  // no `..` — nothing a path or a fragment could be made of
  cursor: { test: (v) => /^(?!.*\.\.)[A-Za-z0-9_.:+=|~,-]{1,256}$/.test(v),
    words: "the backend's own `next_cursor`, unchanged" },
  limit: { test: (v) => /^\d{1,4}$/.test(v) && Number(v) >= 1
      && Number(v) <= LEDGER_LIMIT_MAX,
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

type Unit = "cents" | "dollars";
interface Units { prices: Unit | null; edges: Unit | null; money: Unit }

function unitOf(v: unknown): Unit | null {
  if (typeof v !== "string") return null;
  if (/^\s*dollars/i.test(v)) return "dollars";
  if (/^\s*cents/i.test(v)) return "cents";
  return null;
}

function unitsOf(v: unknown): Units {
  const u = isObj(v) ? v : {};
  return { prices: unitOf(u.prices), edges: unitOf(u.edges ?? u.prices),
           money: unitOf(u.money) ?? "dollars" };
}

/** a price in cents: the stated unit, else by magnitude (below 1 is
 *  dollars — no Kalshi price is under a cent) */
function priceCents(v: unknown, unit: Unit | null): number | null {
  const n = num(v);
  if (n === null) return null;
  const u = unit ?? (Math.abs(n) < 1 ? "dollars" : "cents");
  return u === "dollars" ? tidy(n * 100) : n;
}

const inCents = (v: unknown, unit: Unit): number | null => {
  const n = num(v);
  return n === null ? null : unit === "dollars" ? tidy(n * 100) : n;
};

const inDollars = (v: unknown, unit: Unit): number | null => {
  const n = num(v);
  return n === null ? null : unit === "cents" ? tidy(n / 100) : n;
};

export interface Consensus {
  prob: number | null; age_s: number | null;
  /** the books' names, when sent as a list */
  books: string[] | null;
  /** how many books, when sent as a count or a list */
  books_n: number | null;
}

export interface ModelGround {
  prob: number | null; source: string | null; run_age_s: number | null;
}

export interface InPlayGround {
  minute: number | null; p_engine: number | null;
  anchor_w: number | null; anchor_source: string | null;
  signals: unknown; hot: boolean | null; danger: number | null;
  /** the block as sent, every key — drawn in full on the row's expand */
  raw: Obj;
}

export interface Grounds {
  fair: number | null;
  consensus: Consensus | null;
  model: ModelGround | null;
  w: number | null;
  /** the learner's arm, when the backend names it ("0.25/0.02") */
  arm: string | null;
  /** cents a contract */
  threshold: number | null; maker_price: number | null;
  fee: number | null; edge: number | null;
  /** the guards' state at placement and the risk checks passed, as sent */
  guards: unknown; risk: unknown;
  inplay: InPlayGround | null;
}

export interface Fills {
  count: number | null;
  /** cents */
  avg_price: number | null;
  /** dollars */
  fees: number | null;
  last_at: string | null;
}

export interface LedgerRow {
  key: string;
  /** "order" — the trader placed it; "handover" — you handed it over */
  kind: "order" | "handover";
  placed_at: string | null;
  competition: string | null;
  home: string | null; away: string | null; kickoff_utc: string | null;
  ticker: string;
  family: string | null; outcome_key: string | null;
  contract: string | null;
  side: Side | null;
  /** the venue YES-book price, cents */
  price: number | null;
  count: number | null;
  /** dollars, fee included */
  cost: number | null;
  phase: string | null;
  strategy_version: string | null;
  /** null: the row recorded no grounds at all */
  grounds: Grounds | null;
  /** the backend's own sentence */
  why: string | null;
  fills: Fills | null;
  status: string | null;
  cancel_reason: string | null;
  /** the journaled settlement: "yes" / "no", or null (unsettled) */
  result: Side | null;
  /** a result the backend sent that is not yes/no, as sent */
  result_other: string | null;
  /** dollars */
  pnl: number | null;
}

export interface Group {
  key: string;
  placed: number | null; filled: number | null; wins: number | null;
  losses: number | null; unsettled: number | null;
  cost: number | null; pnl: number | null;
}

export interface DayRow {
  day: string; pnl: number | null; placed: number | null;
  wins: number | null; losses: number | null; unsettled: number | null;
}

export interface Totals {
  placed: number | null; handed_over: number | null; filled: number | null;
  wins: number | null; losses: number | null; unsettled: number | null;
  cost: number | null; fees: number | null; pnl: number | null;
}

export interface Summary {
  totals: Totals | null;
  by_day: DayRow[] | null;
  by_competition: Group[] | null;
  by_family: Group[] | null;
  by_phase: Group[] | null;
  by_price_bucket: Group[] | null;
  by_edge_bucket: Group[] | null;
  /** dollars: the daily loss limit, when the backend states it */
  daily_limit: number | null;
}

export interface Ledger {
  version: string | null; generated_at: string | null;
  rows: LedgerRow[];
  /** rows the payload carried that could not be read (no ticker) */
  unreadable: number;
  summary: Summary | null;
  next_cursor: string | null;
}

const sideOf = (v: unknown): Side | null => {
  const s = typeof v === "string" ? v.toLowerCase() : null;
  return s === "yes" || s === "no" ? s : null;
};

const HANDOVER = new Set(["handover", "handed_over", "handed-over"]);

function parseInPlay(v: unknown): InPlayGround | null {
  if (!isObj(v)) return null;
  const a = isObj(v.anchor) ? v.anchor : {};
  const minute = num(v.minute);
  return {
    minute: minute === null ? null : Math.trunc(minute),
    p_engine: prob(v.p_engine ?? v.engine_prob ?? v.engine),
    anchor_w: prob(v.anchor_w ?? v.anchor_weight ?? a.w),
    anchor_source: str(v.anchor_source) ?? str(a.source),
    signals: v.signals ?? v.live_signals ?? null,
    hot: bool(v.hot),
    danger: prob(v.danger),
    raw: v,
  };
}

function parseGrounds(v: unknown, rowPrice: unknown, u: Units): Grounds | null {
  if (!isObj(v)) return null;
  const c = isObj(v.consensus) ? v.consensus : null;
  const m = isObj(v.model) ? v.model : null;
  // ONE BLOCK, ONE UNIT: the edge, fee and threshold are read in the
  // unit of the block's own maker price (else the row's YES-book price)
  const anchor = num(v.maker_price) ?? num(rowPrice);
  const t = num(v.threshold);
  const edges: Unit = u.edges ?? (anchor !== null
    ? (Math.abs(anchor) < 1 ? "dollars" : "cents")
    : t !== null && Math.abs(t) < 0.5 ? "dollars" : "cents");
  const books = c ? c.books : undefined;
  const names = Array.isArray(books)
    ? books.filter((b): b is string => typeof b === "string" && b !== "")
    : null;
  return {
    fair: prob(v.fair),
    consensus: c ? {
      prob: prob(c.prob), age_s: num(c.age_s),
      books: names && names.length ? names : null,
      books_n: Array.isArray(books) ? books.length : num(books),
    } : null,
    model: m ? { prob: prob(m.prob), source: str(m.source),
                 run_age_s: num(m.run_age_s) } : null,
    w: num(v.w),
    arm: str(v.arm) ?? (isObj(v.arm)
      ? `${num(v.arm.w) ?? "?"}/${num(v.arm.threshold) ?? "?"}` : null),
    threshold: inCents(v.threshold, edges),
    maker_price: priceCents(v.maker_price, u.prices),
    fee: inCents(v.fee, edges),
    edge: inCents(v.edge, edges),
    guards: v.guards ?? null,
    risk: v.risk ?? null,
    inplay: parseInPlay(v.inplay),
  };
}

function parseFills(v: unknown, u: Units): Fills | null {
  if (!isObj(v)) return null;
  const count = num(v.count);
  return {
    count: count === null ? null : Math.trunc(count),
    avg_price: priceCents(v.avg_price, u.prices),
    fees: inDollars(v.fees, u.money),
    last_at: str(v.last_at),
  };
}

function parseRow(r: Obj, u: Units): LedgerRow | null {
  const ticker = str(r.ticker);
  if (!ticker) return null;
  const fx = isObj(r.fixture) ? r.fixture : {};
  const kindRaw = (str(r.kind) ?? str(r.row_type) ?? str(r.type) ?? "")
    .toLowerCase();
  const phase = str(r.phase);
  const status = str(r.status);
  const handover = HANDOVER.has(kindRaw)
    || (phase !== null && HANDOVER.has(phase.toLowerCase()))
    || (status !== null && HANDOVER.has(status.toLowerCase()));
  const count = num(r.count);
  const result = sideOf(r.result);
  const placed_at = str(r.placed_at);
  const side = sideOf(r.side);
  const id = str(r.order_id) ?? str(r.client_order_id) ?? str(r.id);
  return {
    key: id ?? `${placed_at ?? "?"}|${ticker}|${side ?? "?"}|${num(r.price) ?? "?"}|${count ?? "?"}|${handover ? "h" : "o"}`,
    kind: handover ? "handover" : "order",
    placed_at,
    competition: str(r.competition),
    home: str(fx.home), away: str(fx.away), kickoff_utc: str(fx.kickoff_utc),
    ticker,
    family: str(r.family), outcome_key: str(r.outcome_key),
    contract: str(r.contract),
    side,
    price: priceCents(r.price, u.prices),
    count: count === null ? null : Math.trunc(count),
    cost: inDollars(r.cost, u.money),
    phase,
    strategy_version: str(r.strategy_version),
    grounds: parseGrounds(r.grounds, r.price, u),
    why: str(r.why),
    fills: parseFills(r.fills, u),
    status,
    cancel_reason: str(r.cancel_reason),
    result,
    result_other: result === null && r.result !== null && r.result !== undefined
      ? (typeof r.result === "string" ? r.result : JSON.stringify(r.result))
      : null,
    pnl: inDollars(r.pnl, u.money),
  };
}

/** the counting keys a breakdown entry may carry, by what they mean */
function groupOf(key: string, v: Obj, money: Unit): Group {
  const n = (...ks: string[]) => {
    for (const k of ks) { const x = num(v[k]); if (x !== null) return x; }
    return null;
  };
  return {
    key,
    placed: n("placed", "orders", "count", "n", "rows"),
    filled: n("filled", "fills"),
    wins: n("wins", "won"), losses: n("losses", "lost"),
    unsettled: n("unsettled"),
    cost: inDollars(v.cost, money), pnl: inDollars(v.pnl, money),
  };
}

const GROUP_KEYS = ["key", "bucket", "competition", "family", "phase",
  "label", "name", "range"];

function groupsOf(v: unknown, money: Unit): Group[] | null {
  if (Array.isArray(v)) {
    const out: Group[] = [];
    for (const e of v) {
      if (!isObj(e)) continue;
      let key: string | null = null;
      for (const k of GROUP_KEYS) { key = str(e[k]); if (key) break; }
      out.push(groupOf(key ?? "not stated", e, money));
    }
    return out;
  }
  if (isObj(v)) {
    return Object.entries(v).map(([k, e]) =>
      groupOf(k, isObj(e) ? e : { pnl: e }, money));
  }
  return null;
}

function parseSummary(v: unknown, money: Unit): Summary | null {
  if (!isObj(v)) return null;
  const t = isObj(v.totals) ? v.totals : null;
  const days: DayRow[] | null = Array.isArray(v.by_day) ? [] : null;
  for (const d of Array.isArray(v.by_day) ? v.by_day : []) {
    if (!isObj(d)) continue;
    const day = str(d.day) ?? str(d.date);
    if (!day) continue;
    days!.push({ day, pnl: inDollars(d.pnl, money), placed: num(d.placed),
      wins: num(d.wins), losses: num(d.losses), unsettled: num(d.unsettled) });
  }
  days?.sort((a, b) => b.day.localeCompare(a.day));
  const dl = v.daily_limit;
  return {
    totals: t ? {
      placed: num(t.placed ?? t.orders), handed_over: num(t.handed_over),
      filled: num(t.filled), wins: num(t.wins), losses: num(t.losses),
      unsettled: num(t.unsettled), cost: inDollars(t.cost, money),
      fees: inDollars(t.fees, money), pnl: inDollars(t.pnl, money),
    } : null,
    by_day: days,
    by_competition: groupsOf(v.by_competition, money),
    by_family: groupsOf(v.by_family, money),
    by_phase: groupsOf(v.by_phase, money),
    by_price_bucket: groupsOf(v.by_price_bucket, money),
    by_edge_bucket: groupsOf(v.by_edge_bucket, money),
    daily_limit: inDollars(isObj(dl)
      ? dl.dollars ?? dl.limit ?? dl.value ?? dl.loss : dl, money),
  };
}

const placedMs = (r: LedgerRow) => {
  const t = r.placed_at ? Date.parse(r.placed_at) : NaN;
  return Number.isFinite(t) ? t : -Infinity;
};

/** Newest first; a row with no readable time sinks to the bottom. */
export function newestFirst(rows: LedgerRow[]): LedgerRow[] {
  return [...rows].sort((a, b) => placedMs(b) - placedMs(a));
}

export function parseLedger(b: Obj): Ledger {
  const u = unitsOf(b.units);
  const rows: LedgerRow[] = [];
  let unreadable = 0;
  const seen = new Map<string, number>();
  for (const r of Array.isArray(b.rows) ? b.rows : []) {
    const row = isObj(r) ? parseRow(r, u) : null;
    if (!row) { unreadable += 1; continue; }
    // two rows the backend did not tell apart are still two rows
    const n = seen.get(row.key) ?? 0;
    seen.set(row.key, n + 1);
    rows.push(n ? { ...row, key: `${row.key}#${n}` } : row);
  }
  return {
    version: str(b.version), generated_at: str(b.generated_at),
    rows: newestFirst(rows), unreadable,
    summary: parseSummary(b.summary, u.money),
    next_cursor: str(b.next_cursor),
  };
}

// ------------------------------------------------------------ the words

/** THE PHASES, in plain words (backend journal `placed` rows: the
 *  pre-match and in-play strategies, the in-play v2 protective exit, the
 *  managed close of a handed-over position; and the hand-over itself). A
 *  code not listed is drawn as itself, underscores as spaces. */
export const PHASE_WORDS: Record<string, string> = {
  pre_match: "pre-match", in_play: "in-play", inplay: "in-play",
  protective_exit: "protective exit", exit: "exit",
  managed_close: "managed close", entry: "in-play entry",
  handover: "handed over", handed_over: "handed over",
};

export const phaseWords = (p: string | null): string =>
  p === null ? NOT_RECORDED : PHASE_WORDS[p] ?? p.replace(/_/g, " ");

/** The phases the filter offers before the backend has named its own. */
export const DEFAULT_PHASES = ["pre_match", "in_play", "protective_exit",
  "managed_close", "handed_over"] as const;

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

/** An order's status, in plain words. Unlisted: drawn as sent. */
export const STATUS_WORDS: Record<string, string> = {
  filled: "filled", executed: "filled",
  partially_filled: "partly filled", partial: "partly filled",
  resting: "resting", open: "resting",
  cancelled: "cancelled", canceled: "cancelled",
  expired: "expired", handed_over: "handed over", handover: "handed over",
  settled: "settled", rejected: "rejected", failed: "failed",
};

export const statusWords = (s: string | null): string =>
  s === null ? NOT_RECORDED : STATUS_WORDS[s] ?? s.replace(/_/g, " ");

/** "0-20" -> "0–20¢"; anything else as sent. */
export function priceBucketWords(k: string): string {
  const m = /^(\d{1,3})\s*[-–]\s*(\d{1,3})\s*(c|¢)?$/.exec(k);
  return m ? `${m[1]}–${m[2]}¢` : k;
}

/** a bucket's lower bound, for ordering ("40-60" -> 40); else NaN */
export const bucketStart = (k: string): number => {
  const m = /^\s*(-?\d+(\.\d+)?)/.exec(k);
  return m ? Number(m[1]) : NaN;
};

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
  return `${Number.isInteger(r) ? r : r.toString()}¢`;
}

/** signed cents: an edge */
export function signedCents(c: number | null): string {
  if (c === null) return NOT_RECORDED;
  const body = cents(Math.abs(c));
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

/** ANY RECORDED VALUE, in short words — a guard's state, a risk check's
 *  list, an in-play signal. Nested blocks read "key value · key value";
 *  a list reads "a, b". Null is "not recorded". */
export function flat(v: unknown): string {
  if (v === null || v === undefined) return NOT_RECORDED;
  if (v === true) return "yes";
  if (v === false) return "no";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : NOT_RECORDED;
  if (typeof v === "string") return v === "" ? NOT_RECORDED : v;
  if (Array.isArray(v)) return v.length ? v.map(flat).join(", ") : "none";
  if (isObj(v)) {
    const e = Object.entries(v);
    return e.length ? e.map(([k, x]) => `${k} ${flat(x)}`).join(" · ") : "none";
  }
  return String(v);
}

/** A recorded block as lines, one per top-level key: "news: clear". */
export function lines(v: unknown): string[] | null {
  if (v === null || v === undefined) return null;
  if (isObj(v)) {
    const e = Object.entries(v);
    return e.length ? e.map(([k, x]) => `${k}: ${flat(x)}`) : ["none"];
  }
  return [flat(v)];
}

/** the anchor's source, in short words (lib/tradingConsole.ts) */
export const sourceWords = (s: string | null): string =>
  s === null ? "source not recorded" : ANCHOR_SOURCE_WORDS[s] ?? s;

// ------------------------------------------------------ what it settled

/** WHAT BECAME OF THE ORDER, from the journaled result and the side
 *  printed beside it. Won / lost only for a row that held contracts — a
 *  fill on record, or a hand-over; a settled market with no fill on
 *  record is just "settled". */
export type Outcome = "won" | "lost" | "settled" | "unsettled";

export function outcomeOf(r: LedgerRow): Outcome {
  if (r.result === null) return r.result_other === null ? "unsettled" : "settled";
  const held = r.kind === "handover" || (r.fills?.count ?? 0) > 0;
  if (!held || r.side === null) return "settled";
  return r.result === r.side ? "won" : "lost";
}

/** The result cell: "YES · won", "NO", "unsettled". */
export function resultWords(r: LedgerRow): string {
  if (r.result === null) {
    return r.result_other === null ? "unsettled" : `${r.result_other} (as sent)`;
  }
  const o = outcomeOf(r);
  const R = r.result.toUpperCase();
  return o === "won" || o === "lost" ? `${R} · ${o}`
    : r.fills?.count === 0 ? `${R} · no fill` : R;
}

/** The P&L cell: the backend's dollars; "unsettled" for a market with no
 *  journaled result; "not recorded" for a settled one with no P&L. */
export const pnlWords = (r: LedgerRow): string =>
  r.pnl !== null ? signedDollars(r.pnl)
    : r.result === null && r.result_other === null ? "unsettled" : NOT_RECORDED;

/** The fill cell: "filled 4/4 @ 44¢", "resting 0/3", "not recorded". */
export function fillWords(r: LedgerRow): string {
  const f = r.fills;
  if (f === null && r.status === null) return NOT_RECORDED;
  const s = statusWords(r.status);
  if (f === null || f.count === null) return r.status === null ? NOT_RECORDED : s;
  const of = r.count === null ? "" : `/${r.count}`;
  const avg = f.avg_price === null ? "" : ` @ ${cents(f.avg_price)}`;
  return `${r.status === null ? "fills" : s} ${f.count}${of}${avg}`;
}

/** The edge cell: "+2.8¢ vs 2¢". */
export function edgeWords(g: Grounds | null): string {
  if (!g || g.edge === null) return NOT_RECORDED;
  return g.threshold === null ? `${signedCents(g.edge)} (no bar recorded)`
    : `${signedCents(g.edge)} vs ${cents(g.threshold)}`;
}

export const clears = (g: Grounds | null): boolean =>
  g !== null && g.edge !== null && g.threshold !== null && g.edge >= g.threshold;

// ---------------------------------------------------------- the why

/** A WHY COMPOSED FROM THE RECORDED GROUNDS, for a row whose backend sent
 *  none — every number in it is one the row recorded, none is computed,
 *  and a part that was not recorded is left out rather than guessed:
 *
 *    Fair 47.2% (books 46.0% 3h old, model 49.0% w=0.25) vs our YES bid
 *    44¢ + 0.4¢ fee = edge 2.8¢ ≥ threshold 2¢
 *
 *  Null when the row recorded neither a fair price nor an edge. The page
 *  says, beside it, that it was composed here. */
export function composeWhy(r: LedgerRow): string | null {
  const g = r.grounds;
  if (!g || (g.fair === null && g.edge === null)) return null;
  const parts: string[] = [];
  const c = g.consensus;
  if (c && c.prob !== null) {
    parts.push(`books ${pct(c.prob)}${c.age_s !== null ? ` ${age(c.age_s)} old` : ""}`);
  }
  const m = g.model;
  const model = m && m.prob !== null ? `model ${pct(m.prob)}` : null;
  const w = g.w !== null ? `w=${g.w.toFixed(2)}` : null;
  if (model || w) parts.push([model, w].filter(Boolean).join(" "));
  const fair = g.fair === null ? null
    : `Fair ${pct(g.fair)}${parts.length ? ` (${parts.join(", ")})` : ""}`;
  const plain = (n: number) => `${n < 0 ? "−" : ""}${cents(Math.abs(n))}`;
  const side = r.side ? `${r.side.toUpperCase()} ` : "";
  let price: string | null = null;
  if (g.maker_price !== null) {
    price = `our ${side}bid ${cents(g.maker_price)}`
      + (g.fee !== null ? ` + ${cents(g.fee)} fee` : "");
  }
  let edge: string | null = null;
  if (g.edge !== null) {
    edge = `edge ${plain(g.edge)}` + (g.threshold === null ? ""
      : ` ${g.edge >= g.threshold ? "≥" : "<"} threshold ${cents(g.threshold)}`);
  }
  const rhs = [price, edge].filter(Boolean).join(" = ");
  return [fair, rhs].filter(Boolean).join(" vs ");
}

// ------------------------------------------------------------ the CSV

/** THE CSV'S COLUMNS, in order. Prices and edges in cents a contract,
 *  money in dollars, probabilities 0..1, ages in seconds; a block the
 *  row recorded (guards, risk, in-play) as its JSON. A value not recorded
 *  is an EMPTY cell — never 0. */
export const LEDGER_CSV_COLUMNS = [
  "placed_at", "kind", "competition", "home", "away", "kickoff_utc",
  "ticker", "family", "outcome_key", "contract", "side", "price_yes_cents",
  "count", "cost_dollars", "phase", "strategy_version", "fair",
  "consensus_prob", "consensus_age_s", "consensus_books", "model_prob",
  "model_source", "model_run_age_s", "w", "arm", "threshold_cents",
  "maker_price_cents", "fee_cents", "edge_cents", "guards", "risk",
  "inplay", "why", "why_source", "fills_count", "fills_avg_price_cents",
  "fills_fees_dollars", "fills_last_at", "status", "cancel_reason",
  "result", "pnl_dollars",
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

const blockJson = (v: unknown): string | null =>
  v === null || v === undefined ? null : JSON.stringify(v);

export function ledgerCsvRow(r: LedgerRow): Cell[] {
  const g = r.grounds;
  const composed = r.why === null ? composeWhy(r) : null;
  const books = g?.consensus
    ? (g.consensus.books ? g.consensus.books.join("|") : g.consensus.books_n)
    : null;
  const byCol: Record<typeof LEDGER_CSV_COLUMNS[number], Cell> = {
    placed_at: r.placed_at, kind: r.kind, competition: r.competition,
    home: r.home, away: r.away, kickoff_utc: r.kickoff_utc,
    ticker: r.ticker, family: r.family, outcome_key: r.outcome_key,
    contract: r.contract, side: r.side, price_yes_cents: r.price,
    count: r.count, cost_dollars: r.cost, phase: r.phase,
    strategy_version: r.strategy_version, fair: g?.fair ?? null,
    consensus_prob: g?.consensus?.prob ?? null,
    consensus_age_s: g?.consensus?.age_s ?? null,
    consensus_books: books ?? null,
    model_prob: g?.model?.prob ?? null, model_source: g?.model?.source ?? null,
    model_run_age_s: g?.model?.run_age_s ?? null, w: g?.w ?? null,
    arm: g?.arm ?? null, threshold_cents: g?.threshold ?? null,
    maker_price_cents: g?.maker_price ?? null, fee_cents: g?.fee ?? null,
    edge_cents: g?.edge ?? null, guards: blockJson(g?.guards),
    risk: blockJson(g?.risk), inplay: blockJson(g?.inplay?.raw),
    why: r.why ?? composed,
    why_source: r.why !== null ? "backend" : composed !== null ? "composed" : null,
    fills_count: r.fills?.count ?? null,
    fills_avg_price_cents: r.fills?.avg_price ?? null,
    fills_fees_dollars: r.fills?.fees ?? null,
    fills_last_at: r.fills?.last_at ?? null, status: r.status,
    cancel_reason: r.cancel_reason,
    result: r.result ?? r.result_other, pnl_dollars: r.pnl,
  };
  return LEDGER_CSV_COLUMNS.map((c) => byCol[c]);
}

/** The rows as a CSV document (RFC 4180, CRLF line ends, header first). */
export function ledgerCsv(rows: LedgerRow[]): string {
  return [LEDGER_CSV_COLUMNS.join(","),
    ...rows.map((r) => ledgerCsvRow(r).map(field).join(","))].join("\r\n");
}

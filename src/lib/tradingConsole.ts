// THE CONSOLE'S READERS — the candidates table and the book's live value
// (2026-10-05).
//
// Son, 2026-10-03: "also let me see the candidate too, transparency is
// also the purpose of the console", and 2026-10-04: the console should
// show the ACTUAL fluctuating value of in-play positions, not the fixed
// cost (the halts keep his "in play at cost" rule — this is display only).
//
// Everything that turns a backend payload into something drawn lives
// here, in ONE place, so a contract change on the backend is aligned by
// editing this file and nothing else.
//
// THE CANDIDATES CONTRACT, AS READ. GET /api/admin/trading/candidates
// (relayed by pages/api/ops/trading-candidates.ts). Two spellings of it
// are read, because the console and the route were built side by side on
// 2026-10-05 and the integrator aligns the last details:
//
//   the brief's:  {version, generated_at, tick_at, rows: [{ticker, title,
//     competition, kickoff_utc, minute, family, side_considered, p_model,
//     p_consensus, w, fair, yes_bid, yes_ask, no_bid, no_ask, maker_yes,
//     maker_no, edge_yes, edge_no, threshold,
//     inplay: {momentum, xg15, danger, hot} | null,
//     decision: {kind: "placed"|"skipped", price_cents, count, reason,
//     words}}]}
//
//   the route's (src/trading/console.py, trading-candidates-v1): the same
//     row fields plus `phase`, `fair_method`, `edge_basis`,
//     `minutes_to_kickoff`; `decision: {action, side, price_cents, count,
//     reason, detail, words}` where action is one of placed / failed /
//     refused / error / proposed / skipped / not_run / not_eligible;
//     in-play extras as (home, away) PAIRS plus per-side `hot_yes`,
//     `danger_yes`…; and a head: `units`, `stale`, `age_s`, `considered`,
//     `shown`, `served`, `omitted` {reason: n}, `not_served`,
//     `by_competition` {comp: {in_scope, eligible, decided, placed, …}},
//     `arms_in_use`, `actions` {action: words}.
//
// ALIGNED AT INTEGRATION (mon-integration, 2026-10-05), against payloads
// recorded from the integrated backend (e2e/trading-console-recorded.ts):
//   - `by_competition[c].in_scope` is a BOOLEAN (is the competition in
//     the trader's scope), not a count; `assessed` is the count of its
//     markets the tick assessed, `in_window_held_back` those held back.
//   - `omitted` counts EVERY market not in the snapshot by its reason —
//     mostly by design (`outside_window`, `market_not_trading`, …). Only
//     `row_bound` / `size_bound` mean the snapshot was CUT to its bound.
//   - an in-play row's `inplay.anchor` = {w, source, why}: the weight on
//     OUR pre-match forecast the in-play engine number started from (0 =
//     the market's T-10 price alone) and the forecast's source.
//
// UNITS. The payload's `units` block says what it sent (the route sends
// cents for prices, edges and the threshold, and 0..1 for probabilities).
// A payload that says nothing is read as cents. `units` saying "dollars"
// (decimal dollars, as the journal stores them: a 47c bid is "0.47") is
// converted. `price_cents` is whole cents, as its name says.
//
// MISSING IS NOT ZERO. Every reader answers null for a value that was not
// sent or is not a number, and every formatter draws null as "—". No
// absent mark, value or edge is ever drawn as 0, and an empty `rows` is
// only "considered no markets" when the payload says a fresh tick
// considered none (`emptyWhy`).
//
// EXPERIMENTAL, UNPROVEN. These are the trader's own numbers about a
// small, capped experiment. Our model's probability is UNVALIDATED.
import { liveCompLabel, PICKER_COLUMN_ORDER } from "./pickerApi";

export type Obj = Record<string, unknown>;
export type Side = "yes" | "no";

export const ABSENT = "—";

export const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const num = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const str = (v: unknown): string | null =>
  typeof v === "string" && v !== "" ? v : null;

const bool = (v: unknown): boolean | null =>
  v === true ? true : v === false ? false : null;

const sideOf = (v: unknown): Side | null =>
  v === "yes" || v === "no" ? v : null;

// ----------------------------------------------------------- formatting

/** A probability (0..1) as a percentage, one decimal. */
export function pct(p: number | null): string {
  return p === null ? ABSENT : `${(p * 100).toFixed(1)}%`;
}

/** Cents, whole when whole, one decimal otherwise. */
export function cents(c: number | null): string {
  if (c === null) return ABSENT;
  const r = Math.round(c * 10) / 10;
  return `${Number.isInteger(r) ? r : r.toFixed(1)}¢`;
}

/** Signed cents, two decimals: an edge or a reward. */
export function signedCents(c: number | null): string {
  if (c === null) return ABSENT;
  return `${c > 0 ? "+" : c < 0 ? "−" : ""}${Math.abs(c).toFixed(2)}¢`;
}

/** A probability. Above 1 it was sent as a percentage. */
function prob(v: unknown): number | null {
  const n = num(v);
  if (n === null) return null;
  const p = n > 1 ? n / 100 : n;
  return p >= 0 && p <= 1 ? p : null;
}

// ------------------------------------------------------ the candidates

type Unit = "cents" | "dollars";
interface Units { prices: Unit; edges: Unit; threshold: Unit }

function unitOf(v: unknown): Unit {
  return typeof v === "string" && /^\s*dollars/i.test(v) ? "dollars" : "cents";
}
function unitsOf(v: unknown): Units {
  const u = isObj(v) ? v : {};
  return { prices: unitOf(u.prices), edges: unitOf(u.edges),
           threshold: unitOf(u.threshold ?? u.edges) };
}
const inCents = (v: unknown, u: Unit): number | null => {
  const n = num(v);
  return n === null ? null : u === "dollars" ? n * 100 : n;
};

/** A (home, away) pair, or one number. */
export type Pair = { home: number; away: number } | { one: number } | null;

function pairOf(v: unknown): Pair {
  if (Array.isArray(v) && v.length >= 2) {
    const h = num(v[0]), a = num(v[1]);
    return h === null || a === null ? null : { home: h, away: a };
  }
  const n = num(v);
  return n === null ? null : { one: n };
}

export interface InPlayExtras {
  minute: number | null; period: string | null; mode: string | null;
  momentum: Pair; xg15: Pair;
  /** P(a goal that hurts the side soon), per side and/or as one number */
  danger: number | null; danger_yes: number | null; danger_no: number | null;
  hot: boolean | null; hot_yes: boolean | null; hot_no: boolean | null;
  p_engine: number | null; p_informed: number | null;
  /** the in-play anchor: w on OUR forecast (0..1), its source, and why
   *  nothing was re-run; null when the decision carried none */
  anchor: { w: number | null; source: string | null; why: string | null } | null;
}

/** What the trader did with a market, in the route's vocabulary. */
export const ACTION_ORDER = ["placed", "failed", "refused", "error",
  "proposed", "skipped", "not_run", "not_eligible"] as const;
export const ACTION_LABEL: Record<string, string> = {
  placed: "Placed", failed: "Failed", refused: "Refused", error: "Error",
  proposed: "Proposed", skipped: "Skipped", not_run: "Not run",
  not_eligible: "Not eligible", unknown: "Not stated",
};

export interface Decision {
  /** placed / skipped / … / "unknown" when the payload names none */
  action: string;
  side: Side | null;
  price_cents: number | null; count: number | null;
  reason: string | null; words: string | null; detail: string | null;
}

export interface Candidate {
  key: string;
  ticker: string; title: string; competition: string | null;
  kickoff_utc: string | null; minute: number | null; family: string | null;
  phase: string | null;
  side_considered: Side | null;
  p_model: number | null; p_consensus: number | null; w: number | null;
  fair: number | null; fair_method: string | null;
  yes_bid: number | null; yes_ask: number | null;
  no_bid: number | null; no_ask: number | null;
  maker_yes: number | null; maker_no: number | null;
  edge_yes: number | null; edge_no: number | null; edge_basis: string | null;
  threshold: number | null;
  inplay: InPlayExtras | null;
  decision: Decision;
}

export interface CompCounts {
  /** is the competition in the trader's scope (the route sends a
   *  boolean; a number from the brief's spelling reads as > 0) */
  in_scope: boolean | null;
  assessed: number | null; eligible: number | null;
  in_window_held_back: number | null;
  in_play_markets: number | null; decided: number | null;
  model_priced: number | null; placed: number | null;
}

export interface Candidates {
  version: string | null; generated_at: string | null;
  tick_at: string | null;
  /** the snapshot is older than the route serves: rows withheld */
  stale: boolean | null;
  age_s: number | null;
  /** the competitions the trader had in scope, when the backend says */
  scope: string[] | null;
  /** per-competition counts for every competition in scope, if sent */
  by_competition: Record<string, CompCounts> | null;
  /** how many markets the tick considered in all, when the backend says */
  considered: number | null;
  /** markets left out of the snapshot, by reason (mostly by design) */
  omitted: Record<string, number>;
  /** of those, the ones CUT by the snapshot's bound (row_bound,
   *  size_bound) */
  cut: number;
  /** rows of the snapshot withheld because their market stopped trading */
  not_served: number | null;
  /** true when rows were cut to the snapshot's bound — `truncated`
   *  sent, or a `row_bound` / `size_bound` omission; never the
   *  by-design omissions */
  truncated: boolean;
  /** the route's words for each action, when sent */
  actions: Record<string, string>;
  rows: Candidate[];
  /** rows the payload carried that could not be read (no ticker) */
  unreadable: number;
}

function parseDecision(v: unknown): Decision {
  const d = isObj(v) ? v : {};
  const action = str(d.kind) ?? str(d.action) ?? "unknown";
  const count = num(d.count);
  return {
    action,
    side: sideOf(d.side),
    price_cents: num(d.price_cents),
    count: count === null ? null : Math.trunc(count),
    reason: str(d.reason),
    words: str(d.words),
    detail: str(d.detail),
  };
}

function parseInPlay(v: unknown): InPlayExtras | null {
  if (!isObj(v)) return null;
  const minute = num(v.minute);
  const ex = isObj(v.exit) ? v.exit : {};
  return {
    minute: minute === null ? null : Math.trunc(minute),
    period: str(v.period), mode: str(v.mode),
    momentum: pairOf(v.momentum), xg15: pairOf(v.xg15),
    danger: prob(v.danger ?? ex.danger),
    danger_yes: prob(v.danger_yes), danger_no: prob(v.danger_no),
    hot: bool(v.hot), hot_yes: bool(v.hot_yes), hot_no: bool(v.hot_no),
    p_engine: prob(v.p_engine), p_informed: prob(v.p_informed),
    anchor: isObj(v.anchor)
      ? { w: prob(v.anchor.w), source: str(v.anchor.source),
          why: str(v.anchor.why) }
      : null,
  };
}

function countsOf(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!isObj(v)) return out;
  for (const [k, n] of Object.entries(v)) {
    const x = num(n);
    if (x !== null) out[k] = x;
  }
  return out;
}

function byCompetition(v: unknown): Record<string, CompCounts> | null {
  if (!isObj(v)) return null;
  const out: Record<string, CompCounts> = {};
  for (const [k, o] of Object.entries(v)) {
    const c = isObj(o) ? o : {};
    const sc = num(c.in_scope);
    out[k] = {
      in_scope: typeof c.in_scope === "boolean" ? c.in_scope
        : sc === null ? null : sc > 0,
      assessed: num(c.assessed), eligible: num(c.eligible),
      in_window_held_back: num(c.in_window_held_back),
      in_play_markets: num(c.in_play_markets), decided: num(c.decided),
      model_priced: num(c.model_priced), placed: num(c.placed) };
  }
  return Object.keys(out).length ? out : null;
}

/** The `omitted` reasons that mean the snapshot was CUT to its bound
 *  (backend src/trading/console.py: MAX_ROWS rows, MAX_BYTES bytes).
 *  Every other reason is a market left out by design. */
export const BOUND_REASONS = ["row_bound", "size_bound"] as const;

/** THE ANCHOR'S SOURCE, in short words (backend
 *  src/trading/inplay_anchor.py SOURCES). A code not listed here is drawn
 *  as itself. */
export const ANCHOR_SOURCE_WORDS: Record<string, string> = {
  served: "our served model",
  served_unapproved: "our model (not approved on its plane)",
  ratings_club: "ratings model, club (unvalidated)",
  ratings_national: "ratings model, nations (unvalidated)",
  market_only: "the market alone",
};

export function anchorWords(a: InPlayExtras["anchor"]): string | null {
  if (!a) return null;
  const src = a.source === null ? "source not stated"
    : ANCHOR_SOURCE_WORDS[a.source] ?? a.source;
  return a.w === null ? `anchor ${src}` : `anchor w ${a.w.toFixed(2)} · ${src}`;
}

export function parseCandidates(b: Obj): Candidates {
  const u = unitsOf(b.units);
  const rows: Candidate[] = [];
  let unreadable = 0;
  for (const r of Array.isArray(b.rows) ? b.rows : []) {
    const ticker = isObj(r) ? str(r.ticker) : null;
    if (!isObj(r) || !ticker) { unreadable += 1; continue; }
    const decision = parseDecision(r.decision);
    const inplay = parseInPlay(r.inplay);
    const minute = num(r.minute) ?? inplay?.minute ?? null;
    rows.push({
      key: `${ticker}|${rows.length}`,
      ticker, title: str(r.title) ?? ticker,
      competition: str(r.competition), kickoff_utc: str(r.kickoff_utc),
      minute: minute === null ? null : Math.trunc(minute),
      family: str(r.family), phase: str(r.phase),
      side_considered: sideOf(r.side_considered) ?? decision.side,
      p_model: prob(r.p_model), p_consensus: prob(r.p_consensus),
      w: num(r.w), fair: prob(r.fair), fair_method: str(r.fair_method),
      yes_bid: inCents(r.yes_bid, u.prices), yes_ask: inCents(r.yes_ask, u.prices),
      no_bid: inCents(r.no_bid, u.prices), no_ask: inCents(r.no_ask, u.prices),
      maker_yes: inCents(r.maker_yes, u.prices),
      maker_no: inCents(r.maker_no, u.prices),
      edge_yes: inCents(r.edge_yes, u.edges), edge_no: inCents(r.edge_no, u.edges),
      edge_basis: str(r.edge_basis),
      threshold: inCents(r.threshold, u.threshold),
      inplay, decision,
    });
  }
  const scope = Array.isArray(b.scope)
    ? b.scope.filter((s): s is string => typeof s === "string" && s !== "")
    : null;
  const considered = num(b.considered);
  const omitted = countsOf(b.omitted);
  const cut = BOUND_REASONS.reduce((s, k) => s + (omitted[k] ?? 0), 0);
  const actions: Record<string, string> = {};
  if (isObj(b.actions)) {
    for (const [k, w] of Object.entries(b.actions)) {
      if (typeof w === "string") actions[k] = w;
    }
  }
  return {
    version: str(b.version), generated_at: str(b.generated_at),
    tick_at: str(b.tick_at), stale: bool(b.stale), age_s: num(b.age_s),
    scope, by_competition: byCompetition(b.by_competition),
    considered: considered === null ? null : Math.trunc(considered),
    omitted, cut, not_served: num(b.not_served),
    truncated: b.truncated === true || cut > 0,
    actions, rows, unreadable,
  };
}

/** WHY A PAYLOAD CARRIES NO ROWS, in words — the one place an empty table
 *  is explained. Only a fresh snapshot that considered nothing reads as
 *  "considered no markets"; a stale snapshot, no snapshot at all, or rows
 *  withheld or cut are each said as what they are. */
export function emptyWhy(c: Candidates): { code: string; text: string } {
  if (c.stale === true) {
    return { code: "stale", text: `The newest snapshot is ${c.age_s === null
      ? "too old" : `${Math.round(c.age_s / 60)} minutes old`} — older than the backend serves — so its rows are withheld. This is not "no candidates": the trader may not have ticked recently.` };
  }
  if (c.tick_at === null) {
    // no tick named at all: the route's answer before any snapshot
    return { code: "no_snapshot", text: "No snapshot on record yet — the trader has not kept one since this backend started." };
  }
  if ((c.not_served ?? 0) > 0) {
    return { code: "not_served", text: `The newest tick's ${c.not_served} row${c.not_served === 1 ? "" : "s"} were all for markets Kalshi no longer lists as trading, so none is shown.` };
  }
  if (c.truncated || (c.considered ?? 0) > 0) {
    return { code: "none_shown", text: `The newest tick considered ${c.considered ?? "some"} market${c.considered === 1 ? "" : "s"}, and none is in the snapshot${c.truncated ? " (left out by its bound)" : ""}.` };
  }
  return { code: "none", text: "The newest tick considered no markets." };
}

/** THE PLAIN WORDS FOR A SKIP, when the backend sent a code and no
 *  `words`. The backend's own `words` always win; a code that is not in
 *  this table is drawn as itself with a note that no words came with it
 *  — never a blank, never a guess. Codes from src/trading/strategy_*.py. */
export const SKIP_WORDS: Record<string, string> = {
  no_edge: "no side clears its minimum edge after fees",
  no_bid_this_side: "nobody is bidding on the side with the edge, so there is no price to rest at",
  crossed_book: "the YES and NO bids add up to $1 or more — a crossed book is never traded",
  order_already_resting: "an order of the trader's already rests here",
  opposite_position_held: "the account already holds the other side of this market",
  maker_price_unavailable: "no maker price exists below the ask",
  model_only_stale: "only our model prices it, and that run is older than 90 minutes",
  no_price_either_source: "neither our model nor the bookmakers price it",
  no_fair_price: "no fair price for this market",
  no_learning_context: "it falls outside the learner's kickoff windows",
  inplay_v2_no_learning_context: "it falls outside the in-play learner's windows",
  stale_consensus: "the bookmaker price is too old to trust",
  stale_book: "the Kalshi book is too old to trust",
  fee_rounding_loses: "the fee, rounded up to the cent, would eat the whole edge",
  client_order_id_spent: "these exact terms were already sent once and withdrawn",
  caps_exhausted: "the money caps leave nothing to place",
  per_order_cap: "the per-order cap leaves nothing to place",
  outside_window: "outside the trading window (180 to 10 minutes before kickoff)",
  outside_trading_window: "outside the trading window (180 to 10 minutes before kickoff)",
  fixture_unmapped: "the market could not be matched to a fixture",
  not_in_trading_scope: "the competition is not in the trader's scope",
  market_not_trading: "the market is not trading",
  kickoff_unknown: "the kickoff time is not known",
  inplay_edge_below_min: "in play, the edge is under the in-play minimum",
  inplay_book_thin: "in play, the book is too thin",
  inplay_book_stale: "in play, the book is too old",
  inplay_cooldown: "in play, cooling down after a shock (goal, card)",
  inplay_feed_unhealthy: "in play, the live price feed is unhealthy",
  inplay_no_live_model: "in play, there is no live model for this match",
  inplay_too_late: "in play, too late in the match",
  inplay_fixture_not_live: "the match is not live",
  inplay_period_not_running: "the match clock is stopped",
  inplay_minute_unknown: "the match minute is not known",
  inplay_family_not_traded: "this market type is not traded in play",
  inplay_exit_too_dear: "the protective exit would cost more than its tolerance",
  kill_switch: "the kill switch is on",
  daily_loss_halt: "halted: the daily loss limit was reached",
  drawdown_halt: "halted: the drawdown limit was reached",
  trading_disabled: "trading is switched off",
};

/** What the decision column says, in words. */
export function decisionWords(d: Decision): { text: string; sentWords: boolean } {
  if (d.words) return { text: d.words, sentWords: true };
  if (d.reason && SKIP_WORDS[d.reason]) {
    return { text: SKIP_WORDS[d.reason], sentWords: false };
  }
  if (d.reason) {
    return { text: `${d.reason} (no plain words were sent for this code)`,
             sentWords: false };
  }
  return { text: d.action === "placed" ? "placed" : "no reason was sent",
           sentWords: false };
}

// ---------------------------------------------------- every competition

/** THE ELEVEN FOCUS COMPETITIONS, used only when the candidates payload
 *  names none (no `scope`, no `by_competition`). Not typed afresh: the
 *  eight are the board's own column order (PICKER_COLUMN_ORDER), and the
 *  three are the Championships board's columns as the backend keys them
 *  (`src/championships/registry.CHAMPIONSHIP_COLUMNS`). What the payload
 *  names always wins — it is the trader's actual scope and may be
 *  narrower or wider than this. */
export const NATIONS_COLUMNS = ["unl", "cnl", "afcon"] as const;
export const FOCUS_COMPETITIONS: readonly string[] =
  [...PICKER_COLUMN_ORDER, ...NATIONS_COLUMNS];

export const compLabel = (c: string | null) =>
  c === null || c === "" ? "competition not stated" : liveCompLabel(c);

export interface CompCoverage {
  competition: string; label: string; considered: number; placed: number;
  declared: boolean; counts: CompCounts | null;
}

/** Where the competition list came from, said on the page. */
export function scopeSource(c: Candidates): "scope" | "by_competition" | "focus" {
  if (c.scope && c.scope.length > 0) return "scope";
  if (c.by_competition) return "by_competition";
  return "focus";
}

/** One row per competition: every one the payload names (its `scope`, or
 *  its `by_competition`), else every focus competition — each with what
 *  this snapshot holds of it — then any competition the rows name that
 *  the list does not. A competition with no row says so; it is NOT drawn
 *  as "considered 0", because a bounded snapshot can leave one out. */
export function coverage(c: Candidates): CompCoverage[] {
  const src = scopeSource(c);
  const declared = src === "scope" ? c.scope!
    : src === "by_competition" ? Object.keys(c.by_competition!)
      : FOCUS_COMPETITIONS;
  const seen = new Map<string, { considered: number; placed: number }>();
  for (const r of c.rows) {
    const k = r.competition ?? "";
    const s = seen.get(k) ?? { considered: 0, placed: 0 };
    s.considered += 1;
    if (r.decision.action === "placed") s.placed += 1;
    seen.set(k, s);
  }
  const counts = (k: string) => c.by_competition?.[k] ?? null;
  const out: CompCoverage[] = [];
  const done = new Set<string>();
  for (const k of declared) {
    if (done.has(k)) continue;
    done.add(k);
    const s = seen.get(k) ?? { considered: 0, placed: 0 };
    out.push({ competition: k, label: compLabel(k), ...s, declared: true,
               counts: counts(k) });
  }
  for (const [k, s] of [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (done.has(k)) continue;
    done.add(k);
    out.push({ competition: k, label: compLabel(k), ...s, declared: false,
               counts: counts(k) });
  }
  return out;
}

// --------------------------------------------- the book's live value

/** HOW A POSITION'S LIVE MARK WAS TAKEN, in short words. The backend's
 *  codes (src/trading/managed.py LIVE_MARK_SOURCES): `feed`, `live_book`
 *  in play; `book`, `listing` before kickoff; `none`. The book payload's
 *  own `mark_sources` sentences are drawn as a legend under the table. A
 *  code not listed here is drawn as itself. */
export const MARK_SOURCE_WORDS: Record<string, string> = {
  feed: "live feed",
  live_book: "live book read",
  book: "catalogue book bid",
  listing: "catalogue listing bid",
  catalogue: "catalogue bid",
  in_play_at_cost: "at cost (no live book)",
  none: "no live price",
};

export function markSourceWords(src: string | null): string {
  if (src === null) return "no live price";
  return MARK_SOURCE_WORDS[src] ?? src;
}

export interface LiveValue {
  live_mark_cents: number | null;
  live_value_dollars: number | null;
  unrealised_pl_dollars: number | null;
  mark_source: string | null;
}

export function parseLiveValue(p: Obj): LiveValue {
  return {
    live_mark_cents: num(p.live_mark_cents),
    live_value_dollars: num(p.live_value_dollars),
    unrealised_pl_dollars: num(p.unrealised_pl_dollars),
    mark_source: str(p.mark_source),
  };
}

/** The book's live totals over the positions that HAVE a live value.
 *  The ones without are counted and named, never summed as $0; so are the
 *  ones with a value and no unrealised P&L. */
export function liveTotals(ps: LiveValue[]): {
  value: number | null; unrealised: number | null; marked: number;
  unmarked: number; unrealisedMissing: number;
} {
  let value = 0, unrealised = 0, marked = 0, unmarked = 0, withPl = 0,
    unrealisedMissing = 0;
  for (const p of ps) {
    if (p.live_value_dollars === null) { unmarked += 1; continue; }
    marked += 1;
    value += p.live_value_dollars;
    if (p.unrealised_pl_dollars === null) { unrealisedMissing += 1; continue; }
    withPl += 1;
    unrealised += p.unrealised_pl_dollars;
  }
  return { value: marked ? value : null, unrealised: withPl ? unrealised : null,
           marked, unmarked, unrealisedMissing };
}

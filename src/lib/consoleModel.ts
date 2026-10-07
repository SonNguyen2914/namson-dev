// THE CONSOLE'S DERIVATIONS (redesign, 2026-10-07).
//
// Pure functions from the four reads (status, book, candidates, ledger)
// to what the operator console draws ABOUT them: the decision badge a
// candidate wears, the group a reason code belongs to, the exceptions
// aggregated for the Attention list, the newest tick's funnel and the
// sentence that explains a zero. Nothing here fetches, and nothing here
// invents a number: every count is one the backend sent, summed or
// sorted; a value it did not send stays null ("missing is not zero").
//
// The reason GROUPS are presentation only — a way to rank why nothing was
// placed. They change no decision; the raw code is always one interaction
// away (the drawer's TECHNICAL DETAILS, the bar's secondary line).
import {
  type Candidate, type Candidates, type Decision, PLAIN_WORDS, REGISTRY_WORDS,
  SKIP_WORDS, decisionWords, isObj, num, str,
} from "./tradingConsole";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

// ------------------------------------------------------- decision badges

/** The badge states the console draws. `tone` is the ONLY colour rule:
 *  neutral for routine skips, caution (amber) for operational holds, danger
 *  (red) for real errors; placed is ink, never gold and never green — a
 *  placement is the trader's rule at work, not a verdict. */
export type BadgeTone = "placed" | "neutral" | "muted" | "caution" | "danger";
export interface Badge { key: string; label: string; tone: BadgeTone }

/** Reasons that mean a shock cool-down holds (PLAIN). */
export const COOLDOWN_REASONS = new Set(["inplay_cooldown", "inplay_recent_goal_or_red"]);

export function decisionBadge(d: Pick<Decision, "action" | "reason">): Badge {
  switch (d.action) {
    case "placed": return { key: "placed", label: "Placed", tone: "placed" };
    case "skipped":
      return d.reason && COOLDOWN_REASONS.has(d.reason)
        ? { key: "cooldown", label: "Cooldown", tone: "caution" }
        : { key: "skipped", label: "Skipped", tone: "neutral" };
    case "not_eligible": return { key: "not_eligible", label: "Not eligible", tone: "muted" };
    case "refused": return { key: "blocked", label: "Blocked", tone: "caution" };
    case "not_run": return { key: "blocked", label: "Blocked", tone: "caution" };
    case "proposed": return { key: "proposed", label: "Proposed", tone: "neutral" };
    case "failed": return { key: "error", label: "Error", tone: "danger" };
    case "error": return { key: "error", label: "Error", tone: "danger" };
    default: return { key: "unknown", label: "Not stated", tone: "muted" };
  }
}

/** Every badge by its key, for filters and legends. */
export const BADGES: Record<string, Badge> = {
  placed: { key: "placed", label: "Placed", tone: "placed" },
  error: { key: "error", label: "Error", tone: "danger" },
  blocked: { key: "blocked", label: "Blocked", tone: "caution" },
  cooldown: { key: "cooldown", label: "Cooldown", tone: "caution" },
  proposed: { key: "proposed", label: "Proposed", tone: "neutral" },
  skipped: { key: "skipped", label: "Skipped", tone: "neutral" },
  not_eligible: { key: "not_eligible", label: "Not eligible", tone: "muted" },
  unknown: { key: "unknown", label: "Not stated", tone: "muted" },
};

/** What each badge means, for the legend and the filter's title. */
export const BADGE_MEANING: Record<string, string> = {
  placed: "an order the venue accepted this tick (backend action `placed`)",
  skipped: "the strategy considered the market and declined it (`skipped`)",
  cooldown: "skipped while a shock cool-down holds (`skipped` · inplay_cooldown / inplay_recent_goal_or_red)",
  not_eligible: "the catalogue held the market back before any strategy saw it (`not_eligible`)",
  blocked: "the risk engine refused it (`refused`), or the strategy could not run this tick — a halt, the kill switch, a failed account read (`not_run`)",
  proposed: "proposed, and nothing more was recorded about it (`proposed`)",
  error: "the order path could not place an approved order (`failed`), or the market raised (`error`)",
  unknown: "the payload named no action",
};

export const BADGE_ORDER = ["placed", "error", "blocked", "cooldown", "proposed",
  "skipped", "not_eligible", "unknown"];

// ------------------------------------------------------------ reasons

export type ReasonGroup = "data" | "market" | "model" | "timing" | "inplay"
  | "risk" | "news" | "duplicate" | "system" | "other";

export const GROUP_LABEL: Record<ReasonGroup, string> = {
  data: "Data & mapping", market: "Market quality", model: "Model & consensus",
  timing: "Timing", inplay: "In-play safety", risk: "Risk & safety",
  news: "News & shock", duplicate: "Duplication & order state",
  system: "System", other: "Not grouped",
};

const G = (group: ReasonGroup, codes: string[]) => codes.map((c) => [c, group] as const);
const REASON_GROUP = new Map<string, ReasonGroup>([
  ...G("data", ["fixture_unmapped", "kickoff_unknown", "candidate_unreadable",
    "market_not_trading", "not_in_trading_scope", "inplay_minute_unknown",
    "inplay_live_signals_unreadable", "inplay_dismissal_unwitnessed",
    "book_mismatch", "order_malformed", "shard_unfunded"]),
  ...G("market", ["no_bid_this_side", "no_bid_other_side", "crossed_book",
    "maker_price_unavailable", "stale_book", "inplay_book_stale",
    "inplay_book_thin", "would_cross", "maker_only", "fee_rounding_loses"]),
  ...G("model", ["no_edge", "no_fair_price", "no_price_either_source",
    "model_only_stale", "stale_consensus", "no_learning_context",
    "inplay_v2_no_learning_context", "inplay_no_live_model",
    "unproven_weight_over_cap", "inplay_edge_below_min"]),
  ...G("timing", ["outside_window", "outside_trading_window", "in_play",
    "inplay_too_late", "inplay_period_not_running", "inplay_fixture_not_live",
    "inplay_expiry_invalid", "inplay_expiry_too_long"]),
  ...G("inplay", ["inplay_cooldown", "inplay_recent_goal_or_red",
    "inplay_feed_unhealthy", "inplay_feed_unavailable", "inplay_dismissal_seen",
    "inplay_momentum_against", "inplay_xg15_against", "inplay_ratings_against",
    "inplay_sot15_against", "inplay_exit_too_dear", "inplay_exit_not_hot",
    "inplay_family_not_traded", "inplay_opposite_not_agents"]),
  ...G("risk", ["caps_exhausted", "per_order_cap", "per_match_cap",
    "bankroll_cap", "daily_loss_halt", "drawdown_halt", "drawdown_halted",
    "daily_anchor_missing", "starting_balance_unrecorded",
    "agent_pnl_unreadable", "limit_misconfigured", "halted", "killed",
    "kill_switch", "trading_disabled", "daily_budget_exhausted",
    "daily_budget_unreadable", "account_snapshot_stale", "account_unreadable",
    "approval_missing", "approval_mismatch", "approval_forged",
    "approval_expired", "careful_hour_cap", "careful_match_cap"]),
  ...G("news", ["news_since_consensus", "news_since_model",
    "market_moved_since_consensus", "market_moved_since_model",
    "news_guard_unreadable", "anomaly_avoid"]),
  ...G("duplicate", ["order_already_resting", "opposite_position_held",
    "client_order_id_spent"]),
  ...G("system", ["reconcile_failed", "pnl_unreadable", "journal_unwritable",
    "not_decided", "exception", "agent_on_request_thread"]),
]);

export function reasonGroup(code: string): ReasonGroup {
  const g = REASON_GROUP.get(code);
  if (g) return g;
  if (code.startsWith("trade_")) return "duplicate";
  if (code.startsWith("inplay_")) return "inplay";
  if (code.startsWith("approval_")) return "risk";
  return "other";
}

/** A code's plain words: the backend's PLAIN (mirrored), else the
 *  registry-derived words, else the older skip words, else null — the
 *  caller then says no words came with it. */
export function codeWords(code: string): string | null {
  return PLAIN_WORDS[code] ?? REGISTRY_WORDS[code] ?? SKIP_WORDS[code] ?? null;
}

export interface ReasonBar {
  code: string; words: string; group: ReasonGroup; n: number; share: number;
}

/** {code: n} blocks summed, then ranked: the bars of "why not placed". */
export function rankReasons(blocks: (Record<string, number> | null | undefined)[]): ReasonBar[] {
  const m = new Map<string, number>();
  for (const b of blocks) {
    if (!b) continue;
    for (const [k, n] of Object.entries(b)) {
      if (typeof n === "number" && Number.isFinite(n) && n > 0) m.set(k, (m.get(k) ?? 0) + n);
    }
  }
  const total = [...m.values()].reduce((s, n) => s + n, 0);
  return [...m.entries()]
    .map(([code, n]) => ({ code, n, share: total ? n / total : 0, group: reasonGroup(code),
      words: codeWords(code) ?? `${code} (no plain words for this code yet)` }))
    .sort((a, b) => b.n - a.n || a.code.localeCompare(b.code));
}

/** A {kind: {reason: n}} journal block's reasons for the given kinds. */
export function reasonsOfKinds(byReason: unknown, kinds: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  const o = obj(byReason);
  if (!o) return out;
  for (const k of kinds) {
    const r = obj(o[k]);
    if (!r) continue;
    for (const [code, n] of Object.entries(r)) {
      const x = num(n);
      if (x !== null) out[code] = (out[code] ?? 0) + x;
    }
  }
  return out;
}

/** The newest tick's not-placed reasons, from the candidate rows. */
export function rowReasons(rows: Candidate[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (r.decision.action === "placed") continue;
    const k = r.decision.reason ?? `(${r.decision.action}, no reason sent)`;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** The short reason a row shows: the backend's words, else the mirrors. */
export function shortReason(d: Decision): string {
  if (d.action === "placed") return d.words ?? "Placed";
  return decisionWords(d).text;
}

// ---------------------------------------------------- the newest tick

export interface TickSummary {
  at: string | null; elapsed_s: number | null; outcome: string | null;
  considered: number | null; shown: number; byBadge: Record<string, number>;
  placed: number; truncated: boolean;
  /** the sentence a zero gets — null when something was placed */
  zero: string | null;
}

export function tickSummary(status: Obj | null, c: Candidates | null): TickSummary {
  const last = obj(status?.last_tick);
  const byBadge: Record<string, number> = {};
  for (const r of c?.rows ?? []) {
    const b = decisionBadge(r.decision).key;
    byBadge[b] = (byBadge[b] ?? 0) + 1;
  }
  const placed = byBadge.placed ?? 0;
  let zero: string | null = null;
  if (c && placed === 0) {
    if (c.rows.length === 0) {
      zero = "No orders placed — the newest snapshot holds no rows.";
    } else {
      const top = rankReasons([rowReasons(c.rows)]).slice(0, 2);
      const parts = BADGE_ORDER.filter((k) => k !== "placed" && byBadge[k])
        .map((k) => `${byBadge[k]} ${k === "not_eligible" ? "not eligible" : k}`);
      zero = `No orders placed — ${parts.join(", ")}.`
        + (top.length ? ` Most common: ${top.map((t) => `${t.words.replace(/\.$/, "")} (${t.n})`).join("; ")}.` : "");
    }
  }
  return {
    at: str(last?.at), elapsed_s: num(last?.elapsed_s), outcome: str(last?.outcome),
    considered: c?.considered ?? null, shown: c?.rows.length ?? 0, byBadge, placed,
    truncated: c?.truncated ?? false, zero,
  };
}

// ------------------------------------------------------------ attention

export type Severity = "critical" | "warning" | "info";
export interface AttentionItem {
  id: string; severity: Severity; subsystem: string; title: string;
  detail?: string; count?: number | null; at?: string | null;
  /** where it is looked into: a view and its hash query */
  link?: { view: string; params?: Record<string, string> };
}

const SEV_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export interface ReadState {
  kind: "idle" | "ok" | "unavailable" | "refused" | "not_ready" | "error";
  status?: number; detail?: string;
}

export interface AttentionInput {
  status: Obj | null; statusRead: ReadState; statusAgeMs: number | null;
  candidates: Candidates | null; candidatesRead: ReadState;
  bookRead: ReadState; book: { notListed: number; unmarked: number } | null;
  ledgerRead: ReadState; ledger: { incomplete: boolean; unknown: number | null; scanPartial: boolean } | null;
  now: number;
}

const sumOf = (v: unknown): number => {
  const o = obj(v);
  if (!o) return 0;
  return Object.values(o).reduce<number>((s, n) => s + (num(n) ?? 0), 0);
};

/** EVERY EXCEPTION THE READS CARRY, IN ONE LIST — most severe first.
 *  Severity: critical = it cannot or may not trade, or a read failed so the
 *  console cannot say; warning = something degraded that blocks or
 *  distorts trades; info = routine-but-worth-knowing counts. */
export function attention(i: AttentionInput): AttentionItem[] {
  const out: AttentionItem[] = [];
  const d = i.status;
  const push = (a: AttentionItem) => out.push(a);
  const rd = (name: string, view: string, r: ReadState) => {
    if (r.kind === "refused") push({ id: `${name}-refused`, severity: "critical", subsystem: name,
      title: `${name} read refused — token rejected`, detail: r.detail, link: { view } });
    else if (r.kind === "not_ready") push({ id: `${name}-not-ready`, severity: "critical", subsystem: name,
      title: "Trading plane not ready", detail: r.detail, link: { view } });
    else if (r.kind === "error") push({ id: `${name}-error`, severity: "warning", subsystem: name,
      title: `Could not read ${name}${r.status ? ` (HTTP ${r.status})` : ""}`, detail: r.detail, link: { view } });
    else if (r.kind === "unavailable") push({ id: `${name}-unavailable`, severity: "info", subsystem: name,
      title: `${name} not available on this backend`, link: { view } });
  };
  rd("status", "overview", i.statusRead);
  if (i.statusAgeMs !== null && i.statusAgeMs > 45_000) {
    push({ id: "status-stale", severity: "warning", subsystem: "status",
      title: `Status has not refreshed for ${Math.round(i.statusAgeMs / 1000)} seconds`,
      detail: "Every figure from the status route is older than three read cadences.",
      link: { view: "overview" } });
  }
  if (d) {
    if (d.kill === true) {
      push({ id: "kill", severity: "critical", subsystem: "safety", title: "Kill switch active",
        detail: typeof d.kill_until === "string" ? `until ${d.kill_until}` : "no end time sent",
        at: str(d.kill_until), link: { view: "overview", params: { focus: "safety" } } });
    }
    const halt = obj(d.halt);
    if (halt?.active === true) {
      push({ id: "halt", severity: "critical", subsystem: "safety",
        title: `Trading halted — ${str(halt.reason) ?? "reason not sent"}`,
        detail: str(halt.rearm) ?? undefined, at: str(halt.since),
        link: { view: "overview", params: { focus: "safety" } } });
    }
    if (d.enabled === false) {
      push({ id: "disabled", severity: "warning", subsystem: "safety",
        title: "Trading disabled (TRADING_ENABLED is not true)",
        detail: "Ticks run the cancel-first pass only; nothing new is placed.",
        link: { view: "overview", params: { focus: "safety" } } });
    }
    if (d.paper_only === true) {
      push({ id: "paper", severity: "info", subsystem: "safety",
        title: str(d.mode_banner) ?? "Paper only — no real orders",
        link: { view: "overview", params: { focus: "safety" } } });
    }
    const last = obj(d.last_tick);
    const lastAt = str(last?.at);
    if (!last) {
      push({ id: "no-tick", severity: "warning", subsystem: "agent", title: "No tick on record" });
    } else if (lastAt) {
      const age = i.now - Date.parse(lastAt);
      if (Number.isFinite(age) && age > 120_000) {
        push({ id: "tick-old", severity: "warning", subsystem: "agent",
          title: `Last tick ${Math.round(age / 60_000)} min ago`,
          detail: "The loop ticks every 15 s; this console flags a tick older than 2 minutes.",
          at: lastAt, link: { view: "system" } });
      }
      const oc = str(last.outcome) ?? "";
      if (/error|fail|refus|unreadable|exception/i.test(oc)) {
        push({ id: "tick-outcome", severity: "warning", subsystem: "agent",
          title: `Newest tick outcome: ${oc}`, at: lastAt, link: { view: "system" } });
      }
      if (last.truncated === true || (obj(last.shed) && Object.keys(obj(last.shed)!).length > 0)) {
        push({ id: "tick-shed", severity: "info", subsystem: "journal",
          title: "Newest tick row was over the journal cap",
          detail: last.truncated === true ? "stored as a marker (truncated)"
            : `blocks left out: ${Object.keys(obj(last.shed)!).join(", ")}`,
          link: { view: "system" } });
      }
    }
    // the daily budget
    const b = obj(d.daily_budget);
    if (b && b.readable === false) {
      push({ id: "budget-unreadable", severity: "warning", subsystem: "risk",
        title: "Daily budget unreadable", detail: str(b.why) ?? undefined, link: { view: "overview" } });
    } else if (b && num(b.remaining) !== null && num(b.remaining)! <= 0) {
      push({ id: "budget-spent", severity: "warning", subsystem: "risk",
        title: "Daily budget exhausted — new orders cannot fit", link: { view: "overview" } });
    }
    if (b && (num(b.refused_today) ?? 0) > 0) {
      push({ id: "budget-refused", severity: "info", subsystem: "risk",
        title: "Orders refused by the daily budget today", count: num(b.refused_today),
        link: { view: "trading", params: { reason: "daily_budget_exhausted" } } });
    }
    // in play
    const ip = obj(d.in_play_trading);
    if (ip && ip.enabled === true) {
      if (ip.feed_healthy === false) push({ id: "feed", severity: "warning", subsystem: "in-play feed",
        title: "Live price feed unhealthy", at: str(ip.at), link: { view: "trading", params: { tab: "inplay" } } });
      if (ip.feed_available === false) push({ id: "feed-na", severity: "warning", subsystem: "in-play feed",
        title: "Live price feed unavailable", at: str(ip.at), link: { view: "trading", params: { tab: "inplay" } } });
      if (ip.global_cooldown === true) push({ id: "global-cool", severity: "warning", subsystem: "in-play",
        title: "Global shock cool-down holds", link: { view: "trading", params: { tab: "inplay" } } });
    }
    if (ip && (num(ip.cooldowns_active) ?? 0) > 0) {
      push({ id: "cooldowns", severity: "info", subsystem: "in-play", title: "Shock cool-downs active",
        count: num(ip.cooldowns_active), link: { view: "trading", params: { tab: "inplay" } } });
    }
    const gaps = sumOf(ip?.feed_gaps);
    if (gaps > 0) push({ id: "feed-gaps", severity: "info", subsystem: "in-play feed",
      title: "Feed gaps since the tick before", count: gaps, link: { view: "trading", params: { tab: "inplay" } } });
    // coverage and catalogue
    const u = obj(d.universe);
    if (u && typeof u.error === "string") push({ id: "universe-error", severity: "warning",
      subsystem: "catalogue", title: "Coverage read failed on the tick", detail: u.error, link: { view: "system" } });
    const unmapped = sumOf(u?.fixture_unmapped_by_why);
    if (unmapped > 0) push({ id: "unmapped", severity: "info", subsystem: "catalogue",
      title: "Markets not linked to a fixture", count: unmapped, at: str(d.universe_at), link: { view: "system" } });
    const noPrice = sumOf(u?.no_fair_price_by_why);
    if (noPrice > 0) push({ id: "no-price", severity: "info", subsystem: "catalogue",
      title: "Markets with no fair price", count: noPrice, at: str(d.universe_at), link: { view: "system" } });
    const staleBooks = num(obj(u?.refusals_by_reason)?.stale_book);
    if (staleBooks && staleBooks > 0) push({ id: "stale-books", severity: "info", subsystem: "catalogue",
      title: "Markets refused for a stale book", count: staleBooks, link: { view: "system" } });
    // settlements and fills
    const s = obj(d.settlement_reads);
    if (s && typeof s.error === "string") push({ id: "settle-error", severity: "warning", subsystem: "settlement",
      title: "Settlement-read summary failed", detail: s.error, link: { view: "system" } });
    const ambiguous = num(s?.unknown_result);
    if (ambiguous && ambiguous > 0) push({ id: "settle-ambiguous", severity: "warning", subsystem: "settlement",
      title: "Settlement results unclear (not one clean yes/no)", count: ambiguous, link: { view: "system" } });
    const fr = obj(d.fill_reads);
    if (fr && typeof fr.error === "string") push({ id: "fill-error", severity: "warning", subsystem: "fills",
      title: "Fill-read summary failed", detail: fr.error, link: { view: "system" } });
    const unreadable = num(fr?.unreadable_today);
    if (unreadable && unreadable > 0) push({ id: "fills-unreadable", severity: "warning", subsystem: "fills",
      title: "Fills unreadable today", count: unreadable, link: { view: "system" } });
    // hand-over
    const h = obj(d.handover);
    if (h && typeof h.closes_error === "string") push({ id: "closes-error", severity: "warning",
      subsystem: "hand-over", title: "Risk-lowering closes could not be counted", detail: h.closes_error,
      link: { view: "portfolio" } });
    const vanished = num(h?.vanished_ambiguous);
    if (vanished && vanished > 0) push({ id: "vanished", severity: "warning", subsystem: "hand-over",
      title: "Handed-over contracts vanished ambiguously", count: vanished, link: { view: "portfolio" } });
    if (h && typeof h.outcome === "string" && /fail|error/i.test(h.outcome)) push({ id: "reconcile",
      severity: "warning", subsystem: "reconcile", title: `Hand-over reconcile: ${h.outcome}`, link: { view: "portfolio" } });
    // careful strategy
    const ct = obj(obj(d.careful)?.tick);
    const de = num(ct?.data_errors);
    if (de && de > 0) push({ id: "careful-data", severity: "warning", subsystem: "careful",
      title: "Edges above the ceiling — probable data errors, never bet", count: de, link: { view: "model" } });
    // blocks the backend says failed
    for (const [k, label] of [["learning", "learner summary"], ["news_guard", "news guard"],
      ["anomaly_avoid", "anomaly avoidance"], ["journal_retention", "journal retention"],
      ["careful", "careful strategy"]] as const) {
      const blk = obj(d[k]);
      if (blk && typeof blk.error === "string") push({ id: `${k}-error`, severity: "warning",
        subsystem: label, title: `The ${label} block failed on the backend`, detail: blk.error,
        link: { view: k === "journal_retention" ? "system" : "model" } });
    }
    const v2 = obj(ip?.v2);
    if (v2 && typeof v2.error === "string") push({ id: "v2-error", severity: "warning", subsystem: "in-play v2",
      title: "The in-play v2 summary failed on the backend", detail: v2.error,
      link: { view: "trading", params: { tab: "inplay" } } });
  }
  // the other reads
  rd("candidates", "trading", i.candidatesRead);
  const c = i.candidates;
  if (c) {
    if (c.stale === true) push({ id: "cand-stale", severity: "warning", subsystem: "candidates",
      title: "Newest candidate snapshot is too old to serve",
      detail: c.age_s === null ? undefined : `${Math.round(c.age_s / 60)} minutes old`, link: { view: "trading" } });
    if (c.cut > 0) push({ id: "cand-cut", severity: "info", subsystem: "candidates",
      title: "Candidate snapshot cut to its bound", count: c.cut, link: { view: "trading" } });
    if (c.unreadable > 0) push({ id: "cand-unreadable", severity: "warning", subsystem: "candidates",
      title: "Candidate rows unreadable (no ticker)", count: c.unreadable, link: { view: "trading" } });
    const errs = c.rows.filter((r) => decisionBadge(r.decision).key === "error").length;
    if (errs > 0) push({ id: "cand-errors", severity: "warning", subsystem: "candidates",
      title: "Markets that errored or failed to place this tick", count: errs,
      link: { view: "trading", params: { decision: "error" } } });
  }
  rd("book", "portfolio", i.bookRead);
  if (i.book && i.book.notListed > 0) push({ id: "book-not-listed", severity: "info", subsystem: "book",
    title: "Positions or orders on markets the trader does not track", count: i.book.notListed,
    link: { view: "portfolio" } });
  if (i.book && i.book.unmarked > 0) push({ id: "book-unmarked", severity: "info", subsystem: "book",
    title: "Positions with no live price", count: i.book.unmarked, link: { view: "portfolio" } });
  rd("ledger", "trades", i.ledgerRead);
  if (i.ledger?.incomplete) push({ id: "ledger-incomplete", severity: "warning", subsystem: "ledger",
    title: "Ledger P&L incomplete — a fill could not be read", count: i.ledger.unknown,
    link: { view: "trades" } });
  if (i.ledger?.scanPartial) push({ id: "ledger-partial", severity: "info", subsystem: "ledger",
    title: "Ledger read only the newest journal rows", link: { view: "trades" } });
  return out.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
}

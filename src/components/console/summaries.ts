// THE ONE-LINE SUMMARIES A FOLDED SECTION KEEPS (collapse, 2026-10-07).
//
// Small builders shared by the views, so that every folded header says
// its amber and red states the same way the open section does: a bar at
// 80 % of its limit is red (■), a stale read amber (◆), a failed read red,
// a cool-down / blocked badge amber, an error badge red. Each alarm item
// carries a stable `key` — no count or clock in it — so a figure that only
// ticks over never unfolds a section the operator folded; a state that
// changes does.
import type { SumItem } from "./collapse";

const n2 = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** "daily loss 3%", red ■ from 80 % (the RiskBar's own rule) */
export function barItem(label: string, used: unknown, limit: unknown): SumItem {
  const u = n2(used), l = n2(limit);
  if (u === null || l === null || l <= 0) return { t: `${label} —` };
  const share = u <= 0 ? 0 : u / l;
  const p = `${Math.round(Math.min(share, 9.99) * 100)}%`;
  return share >= 0.8
    ? { t: `${label} ${p}`, tone: "bad", key: `${label}:${share >= 1 ? "at" : "near"} limit` }
    : { t: `${label} ${p}` };
}

/** the age of a section's own read: ■ failed, ◆ stale, else "7s ago" */
export function freshItem(at: number | null, now: number, cadenceMs: number, failed: boolean,
  ago: (ms: number) => string): SumItem | null {
  if (at === null) return failed ? { t: "read failed", tone: "bad", key: "read failed" } : null;
  const age = Math.max(0, now - at);
  if (failed) return { t: `read failed · ${ago(age)} old`, tone: "bad", key: "read failed" };
  if (age > 3 * cadenceMs) return { t: `stale · ${ago(age)}`, tone: "warn", key: "stale" };
  return { t: `${ago(age)} ago` };
}

/** a read that is not ok, said as the open section says it */
export function readItem(name: string, r: { kind: string; status?: number }): SumItem | null {
  if (r.kind === "refused") return { t: `${name}: token rejected`, tone: "bad", key: `${name} refused` };
  if (r.kind === "error") return { t: `${name} read failed${r.status ? ` (HTTP ${r.status})` : ""}`, tone: "warn", key: `${name} error` };
  if (r.kind === "not_ready") return { t: `${name} not ready`, tone: "bad", key: `${name} not ready` };
  if (r.kind === "unavailable") return { t: `${name} not on this backend` };
  return null;
}

/** the decision badges a section draws: amber (cooldown, blocked) and red
 *  (error) ones are alarms; the routine ones are counts */
export function badgeItems(byBadge: Record<string, number>): SumItem[] {
  const out: SumItem[] = [];
  if (byBadge.error) out.push({ t: `${byBadge.error} error`, tone: "bad", key: "badge error" });
  if (byBadge.blocked) out.push({ t: `${byBadge.blocked} blocked`, tone: "warn", key: "badge blocked" });
  if (byBadge.cooldown) out.push({ t: `${byBadge.cooldown} cooldown`, tone: "warn", key: "badge cooldown" });
  return out;
}

/** an amber flag with a stable key */
export const warn = (t: string, key = t): SumItem => ({ t, tone: "warn", key });
export const bad = (t: string, key = t): SumItem => ({ t, tone: "bad", key });
export const plain = (t: string): SumItem => ({ t });
/** drop the nulls */
export const items = (...xs: (SumItem | null | undefined | false)[]): SumItem[] =>
  xs.filter((x): x is SumItem => !!x);

// Ported from trivela-analyst lib/limits.ts (ccb8f07). Best-effort spend
// guard for a public page: a per-visitor hourly limit on Ask and a daily
// cap on LLM calls site-wide, charged per call (a verification retry is a
// second call). In-memory, so it resets when a serverless
// instance starts cold; the Anthropic Console spend limit is the hard
// backstop. Defaults: 5 asks per visitor per hour, 300 calls per day.

const perIp = new Map<string, number[]>();
const previewPerIp = new Map<string, number[]>();
let day = "";
let calls = 0;

export const ASK_CAP_MESSAGE = "You've asked VAR a lot this hour. Try again in a little while.";
export const BUDGET_MESSAGE = "Today's VAR budget is used up. Trivela's own numbers are still on the page.";

export const DEFAULT_ASK_PER_IP_PER_HOUR = 5;
export const DEFAULT_LLM_DAILY_CALLS = 300;
/** Preview CACHE MISSES (each one is up to two LLM calls) per visitor per
 *  hour (review finding 4, 2026-10-25): a cached preview is free and is
 *  never counted; a visitor walking every uncached match is. */
export const DEFAULT_PREVIEW_MISS_PER_IP_PER_HOUR = 10;
export const PREVIEW_CAP_REASON = "VAR has written a lot of fresh previews for you this hour";

const envInt = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
};
export const askLimit = () => envInt(process.env.ASK_PER_IP_PER_HOUR, DEFAULT_ASK_PER_IP_PER_HOUR);
export const dailyCap = () => envInt(process.env.LLM_DAILY_CALLS, DEFAULT_LLM_DAILY_CALLS);
export const previewMissLimit = () =>
  envInt(process.env.PREVIEW_MISS_PER_IP_PER_HOUR, DEFAULT_PREVIEW_MISS_PER_IP_PER_HOUR);

function allowHourly(map: Map<string, number[]>, limit: number, ip: string, now: number): boolean {
  const recent = (map.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (recent.length >= limit) { map.set(ip, recent); return false; }
  recent.push(now);
  map.set(ip, recent);
  // keep the map from growing without bound on a long-lived instance
  if (map.size > 5000) for (const [k, v] of map) if (!v.some((t) => now - t < 3600_000)) map.delete(k);
  return true;
}

export function allowAsk(ip: string, now = Date.now()): boolean {
  return allowHourly(perIp, askLimit(), ip, now);
}

export function allowPreviewMiss(ip: string, now = Date.now()): boolean {
  return allowHourly(previewPerIp, previewMissLimit(), ip, now);
}

export function takeDailyCall(now = new Date()): boolean {
  const d = now.toISOString().slice(0, 10);
  if (d !== day) { day = d; calls = 0; }
  if (calls >= dailyCap()) return false;
  calls += 1;
  return true;
}

/** Budget used today on this instance (for the status read). */
export function budgetUsed(now = new Date()) {
  const d = now.toISOString().slice(0, 10);
  return { day: d, calls: d === day ? calls : 0, cap: dailyCap() };
}

/** Test hook: forget every counter. */
export function resetLimits() { perIp.clear(); previewPerIp.clear(); day = ""; calls = 0; }

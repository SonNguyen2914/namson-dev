// VAR's error counter, for the ops view (/ops/trading → System → VAR
// health). Counts the reads that failed on this instance today: a match
// that could not be loaded, and an LLM reply that did not come back or
// could not be read (the panel then draws Trivela's raw numbers). A spent
// budget is not an error — it is on the budget line already.
// In-memory per serverless instance, like the budget and the cache: a cold
// start begins again at zero, and the view says so.

export type VarErrorKind = "load" | "preview" | "ask";

let day = "";
const counts: Record<VarErrorKind, number> = { load: 0, preview: 0, ask: 0 };
let last: { at: string; kind: VarErrorKind; why: string } | null = null;

function roll(now: Date) {
  const d = now.toISOString().slice(0, 10);
  if (d !== day) { day = d; counts.load = 0; counts.preview = 0; counts.ask = 0; }
}

export function noteError(kind: VarErrorKind, why: string, now = new Date()) {
  roll(now);
  counts[kind] += 1;
  last = { at: now.toISOString(), kind, why: why.slice(0, 120) };
}

/** Errors today on this instance, and the most recent one (any day). */
export function errorStats(now = new Date()) {
  roll(now);
  return { day, total: counts.load + counts.preview + counts.ask, ...counts, last };
}

/** Test hook. */
export function resetErrors() { day = ""; counts.load = 0; counts.preview = 0; counts.ask = 0; last = null; }

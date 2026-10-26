// The preview cache: one LLM preview per (league, event, model run), shared
// by every visitor, for at most 6 hours. A new model run is a new key, so a
// re-priced match gets a fresh read without waiting out the TTL.
// In-memory per serverless instance; a cold start simply misses.

export const PREVIEW_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 500;

type Entry<T> = { at: number; value: T };
const store = new Map<string, Entry<unknown>>();
let hits = 0;
let misses = 0;

export const cacheKey = (league: string, eventId: string, runId: string) =>
  `${league}:${eventId}:${runId}`;

export function cacheGet<T>(key: string, now = Date.now()): T | null {
  const e = store.get(key);
  if (e && now - e.at < PREVIEW_TTL_MS) { hits += 1; return e.value as T; }
  if (e) store.delete(key);
  misses += 1;
  return null;
}

export function cacheSet<T>(key: string, value: T, now = Date.now()) {
  store.delete(key);
  store.set(key, { at: now, value });
  // Map keeps insertion order, so the first key is the oldest write
  while (store.size > MAX_ENTRIES) store.delete(store.keys().next().value as string);
}

export const cacheStats = () => ({ hits, misses, size: store.size });

// ONE PREVIEW IN FLIGHT PER KEY (review finding 4, 2026-10-25). Before
// this, every visitor who opened an uncached match while its first preview
// was still being written started another LLM run for the same key. A
// request that finds one in flight waits for it instead.
const inflight = new Map<string, Promise<unknown>>();

export function inflightGet<T>(key: string): Promise<T> | null {
  return (inflight.get(key) as Promise<T> | undefined) ?? null;
}

/** Runs `make` as the one in-flight read for `key`, and forgets it when it
 *  settles (either way). */
export function inflightRun<T>(key: string, make: () => Promise<T>): Promise<T> {
  const p = make().finally(() => { if (inflight.get(key) === p) inflight.delete(key); });
  inflight.set(key, p);
  return p;
}

/** Test hook. */
export function cacheClear() { store.clear(); inflight.clear(); hits = 0; misses = 0; }

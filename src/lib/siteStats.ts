// THE HOME PAGE'S RECORD NUMBERS — read live, with a fallback that is the
// page's own baked figures.
//
// GET /api/site/stats (backend src/site_stats.py, schema site-stats-v1)
// serves four counts, each as `raw` (the count), `display` (a FLOOR of it,
// never rounded up: 123,110 → "120,000+") and the `label` that says what
// was counted. The home page shows four of them:
//
//   matches studied          corpus_matches   (+ its sublabel)
//   competitions             competitions
//   Kalshi markets tracked   markets
//   backend test functions   tests
//
// WHEN THE ROUTE DOES NOT ANSWER, THE PAGE IS NOT EMPTY AND NOT WRONG. The
// backend can be down (Railway had no active deployment on 2026-10-12),
// slow, or answering with something that is not a payload. The page then
// shows FALLBACK: the four figures as the approved draft baked them on
// 7 Oct 2026 from this same route (45,500 / 11 / 98,000+ / 12,000+),
// which are floors of true counts under their true labels. Nothing waits
// on the network: the server renders FALLBACK, the first client render
// agrees with it (no hydration mismatch), and a good answer replaces
// figures after mount. There is no spinner, no skeleton and no error
// text, because a number that has not arrived is a number the page
// already has.
//
// A FIGURE IS REPLACED ONLY BY A WHOLE, WELL-FORMED ONE. A figure the
// backend has not counted yet is served as `raw: null` — never zero — and
// stays on its baked value, as does one served as a zero (raw 0 or a
// display of "0"): the page never shows a zero for a missing figure.
// One with a `display` that is not a number is ignored. A label is taken
// from the route only when it is a plain string of sane length, so a
// figure never stands under a label it does not mean; otherwise the baked
// label stays.
//
// READ ONCE PER VISIT, never polled: the backend caches the payload for
// ten minutes and the figures change daily at the fastest. Public,
// GET-only and provider-free on the backend; it reaches no board.
// Guards: e2e/the-record-reads-live-with-a-fallback.spec.ts.
import { useEffect, useState } from "react";

export type FigureKey = "matches" | "competitions" | "markets" | "tests";
export type Figure = { key: FigureKey; display: string; label: string; sub?: string };
/** where the figures on screen came from */
export type FigureSource = "baked" | "live";

/** The approved draft's figures, in the page's order. */
export const FALLBACK: readonly Figure[] = [
  { key: "matches", display: "45,500", label: "matches studied", sub: "49 competitions since 2010" },
  { key: "competitions", display: "11", label: "competitions" },
  { key: "markets", display: "98,000+", label: "Kalshi markets tracked" },
  { key: "tests", display: "12,000+", label: "backend test functions" },
];

/** page slot → the route's figure that fills it */
const ROUTE_KEY: Record<FigureKey, string> = {
  matches: "corpus_matches", competitions: "competitions",
  markets: "markets", tests: "tests" };

/** "45,500", "98,000+": digits in thousands groups, an optional plus */
const DISPLAY = /^\d{1,3}(,\d{3})*\+?$/;
const text = (v: unknown, max: number) =>
  (typeof v === "string" && v.trim() !== "" && v.length <= max ? v : undefined);

/** The figures to show for a response body: each slot is the route's
 *  figure when that one is whole, else its baked value. Anything that is
 *  not a site-stats-v1 payload leaves all four baked. */
export function mergeStats(body: unknown): { figures: Figure[]; source: FigureSource } {
  const baked = FALLBACK.map((f) => ({ ...f }));
  if (typeof body !== "object" || body === null) return { figures: baked, source: "baked" };
  const doc = body as { schema?: unknown; figures?: unknown };
  if (doc.schema !== "site-stats-v1" || typeof doc.figures !== "object" || doc.figures === null) {
    return { figures: baked, source: "baked" };
  }
  const got = doc.figures as Record<string, Record<string, unknown> | null>;
  let live = 0;
  const figures = baked.map((f) => {
    const r = got[ROUTE_KEY[f.key]];
    // a count of zero is a figure nobody has counted yet as far as this
    // page is concerned: never show "0", keep the baked floor
    if (!r || typeof r.raw !== "number" || !Number.isFinite(r.raw) || r.raw <= 0) return f;
    const display = text(r.display, 16);
    if (!display || !DISPLAY.test(display) || /^[0,]+\+?$/.test(display)) return f;
    live += 1;
    return { key: f.key, display,
      label: text(r.label, 60) ?? f.label,
      ...(f.key === "matches" ? { sub: text(r.sublabel, 60) ?? f.sub } : {}) };
  });
  return { figures, source: live > 0 ? "live" : "baked" };
}

const READ_MS = 8000;

/** The figures for the record section. Baked on the server and on the
 *  first client render; replaced once, after mount, by a good answer. */
export function useSiteStats(): { figures: readonly Figure[]; source: FigureSource } {
  const [state, setState] = useState<{ figures: readonly Figure[]; source: FigureSource }>(
    { figures: FALLBACK, source: "baked" });
  useEffect(() => {
    const ctl = new AbortController();
    const clock = setTimeout(() => ctl.abort(), READ_MS);
    (async () => {
      try {
        const r = await fetch("/api/site/stats", { signal: ctl.signal });
        if (!r.ok) return;
        const next = mergeStats(await r.json());
        if (next.source === "live") setState(next);
      } catch {
        /* unreachable, slow, or not JSON: the baked figures stand */
      } finally {
        clearTimeout(clock);
      }
    })();
    return () => { clearTimeout(clock); ctl.abort(); };
  }, []);
  return state;
}

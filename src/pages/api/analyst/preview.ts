// GET /api/analyst/preview?league=<epl|laliga|mls|ligamx>&id=<event id>
//     /api/analyst/preview?demo=<slug>
//
// The Analyst's written match preview, verified number by number. Cached
// per (league, event, model run) for 6 h and shared by every visitor, so a
// match costs at most one LLM read per model run (lib/analyst/cache.ts).
// A failed or over-budget read answers 200 with `ok: false` and the fact
// sheet, and the panel draws Trivela's raw numbers from it. So does a
// visitor past PREVIEW_MISS_PER_IP_PER_HOUR fresh previews (default 10; a
// cached preview is never counted), and a started match whose frozen
// pre-kickoff read is unavailable (no LLM call, never cached).
//
// 404 unless ANALYST_ENABLED=true (the kill switch). A site route, not a
// backend proxy: the backend reads are the match route the match page
// already loads and, after kickoff or when that read is gone, the saved
// pre-kickoff rung (VAR v2), both made server-side in
// lib/analyst/analyst.ts through the league proxy's allowlist.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  analystEnabled, isLoadError, loadMatch, runPreview, type PreviewOut,
} from "../../../lib/analyst/analyst";
import { cacheGet, cacheKey, cacheSet, inflightGet, inflightRun } from "../../../lib/analyst/cache";
import { allowPreviewMiss, PREVIEW_CAP_REASON, takeDailyCall } from "../../../lib/analyst/limits";
import { noteError } from "../../../lib/analyst/health";

/** THE FUNCTION'S CLOCK (review finding 10, 2026-10-25). A cache miss is
 *  the match read, then an LLM call that may wait LLM_TIMEOUT_MS (55 s);
 *  without an explicit budget the platform default could cut it off. 60 s
 *  is the ceiling every other long route on this site already sets (the
 *  boards, the comp proxy), so it is one the plan is known to accept. */
export const config = { maxDuration: 60 };

const fallback = (sheet: PreviewOut["sheet"], why: string): PreviewOut =>
  ({ ok: false, sheet, trace: [], provider: "", model: "", system: "", fallbackReason: why });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!analystEnabled()) return res.status(404).json({ error: "not found" });
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const league = String(req.query.league ?? "");
  const id = String(req.query.id ?? "");
  const demo = req.query.demo ? String(req.query.demo) : undefined;
  let loaded;
  try { loaded = await loadMatch(league, id, demo); }
  catch (e) {
    const status = isLoadError(e) ? e.status : 502;
    const why = e instanceof Error ? e.message : String(e);
    // a bad request (400) is the caller's, not VAR's; only a failed read counts
    if (status >= 500) noteError("load", why);
    return res.status(status).json({ error: `Could not load this match: ${why}` });
  }
  const { sheet, runId } = loaded;
  // a started match with no frozen read: no LLM call, and nothing cached
  if (sheet.frozenUnavailable) return res.status(200).json(fallback(sheet, sheet.frozenUnavailable));
  const key = cacheKey(demo ? `demo-${sheet.league}` : sheet.league, sheet.eventId, runId);
  const hit = cacheGet<PreviewOut>(key);
  if (hit) return res.status(200).json({ ...hit, cached: true });
  // the same preview already being written for another visitor: wait for it
  const pending = inflightGet<PreviewOut>(key);
  if (pending) return res.status(200).json(await pending);
  const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "?").split(",")[0].trim();
  if (!allowPreviewMiss(ip)) return res.status(200).json(fallback(sheet, PREVIEW_CAP_REASON));
  const out = await inflightRun(key, async () => {
    // charged per LLM call, so a verification retry is counted too
    const o = await runPreview(sheet, undefined, { charge: () => takeDailyCall() });
    if (o.ok) cacheSet(key, o);
    return o;
  });
  if (!out.ok && !out.budgetSpent) noteError("preview", out.fallbackReason ?? "the reply could not be used");
  return res.status(200).json(out);
}

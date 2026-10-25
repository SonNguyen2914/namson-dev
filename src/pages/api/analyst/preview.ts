// GET /api/analyst/preview?league=<epl|laliga|mls|ligamx>&id=<event id>
//     /api/analyst/preview?demo=<slug>
//
// The Analyst's written match preview, verified number by number. Cached
// per (league, event, model run) for 6 h and shared by every visitor, so a
// match costs at most one LLM read per model run (lib/analyst/cache.ts).
// A failed or over-budget read answers 200 with `ok: false` and the fact
// sheet, and the panel draws Trivela's raw numbers from it.
//
// 404 unless ANALYST_ENABLED=true (the kill switch). A site route, not a
// backend proxy: the one backend read is the match route the match page
// already loads, made server-side in lib/analyst/analyst.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  analystEnabled, isLoadError, loadMatch, runPreview, type PreviewOut,
} from "../../../lib/analyst/analyst";
import { cacheGet, cacheKey, cacheSet } from "../../../lib/analyst/cache";
import { takeDailyCall } from "../../../lib/analyst/limits";

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
    return res.status(status).json({ error: `Could not load this match: ${e instanceof Error ? e.message : String(e)}` });
  }
  const { sheet, runId } = loaded;
  const key = cacheKey(demo ? `demo-${sheet.league}` : sheet.league, sheet.eventId, runId);
  const hit = cacheGet<PreviewOut>(key);
  if (hit) return res.status(200).json({ ...hit, cached: true });
  if (!takeDailyCall()) {
    return res.status(200).json({ ok: false, sheet, trace: [], provider: "", model: "", system: "", fallbackReason: "today's analyst budget is used up" } satisfies PreviewOut);
  }
  const out = await runPreview(sheet);
  if (out.ok) cacheSet(key, out);
  return res.status(200).json(out);
}

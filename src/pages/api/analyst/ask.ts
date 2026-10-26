// POST /api/analyst/ask  { league, id, demo?, question }
//
// One question about one match, answered from its fact sheet and verified
// the same way as the preview. Capped at ASK_PER_IP_PER_HOUR per visitor
// (default 5) and LLM_DAILY_CALLS site-wide (default 300); at a cap it
// answers 429 with a sentence the page shows as it is.
//
// 404 unless ANALYST_ENABLED=true. The site's only Analyst POST, and a
// site route, not a backend proxy: nothing here is forwarded anywhere.
import type { NextApiRequest, NextApiResponse } from "next";
import { analystEnabled, isLoadError, loadMatch, runAsk } from "../../../lib/analyst/analyst";
import {
  allowAsk, ASK_CAP_MESSAGE, BUDGET_MESSAGE, takeDailyCall,
} from "../../../lib/analyst/limits";
import { noteError } from "../../../lib/analyst/health";

/** See preview.ts: the LLM's own 55 s timeout under the site's 60 s ceiling. */
export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!analystEnabled()) return res.status(404).json({ error: "not found" });
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const body = (req.body && typeof req.body === "object") ? req.body as Record<string, unknown> : {};
  const q = String(body.question ?? "").trim();
  if (!q) return res.status(400).json({ error: "Type a question first." });
  if (q.length > 300) return res.status(400).json({ error: "Keep questions under 300 characters." });
  const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "?").split(",")[0].trim();
  if (!allowAsk(ip)) return res.status(429).json({ error: ASK_CAP_MESSAGE });
  let sheet;
  try {
    sheet = (await loadMatch(String(body.league ?? ""), String(body.id ?? ""), body.demo ? String(body.demo) : undefined)).sheet;
  } catch (e) {
    const status = isLoadError(e) ? e.status : 502;
    const why = e instanceof Error ? e.message : String(e);
    if (status >= 500) noteError("load", why);
    return res.status(status).json({ error: `Could not load this match: ${why}` });
  }
  // the daily budget is charged per LLM call, AFTER the match loaded: a
  // bad id or a backend that did not answer spends nothing (finding 4)
  const out = await runAsk(sheet, q, undefined, { charge: () => takeDailyCall() });
  if (out.budgetSpent) return res.status(429).json({ error: BUDGET_MESSAGE });
  if (!out.ok) noteError("ask", out.fallbackReason ?? "the reply could not be used");
  return res.status(200).json(out);
}

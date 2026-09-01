// Catch-all proxy for the picker board (read-only GETs).
//
// Two routes: /api/picker/board (src/picker's ranked cross-league slate)
// and /api/picker/review (the finished matches under each column, with
// the pre-kickoff read that was frozen or rebuilt for each). Neither
// carries a model, an edge, a probability or any money — so there is
// deliberately no odds/decision route here to add later.
//
// The ALLOWED set is spelled out rather than pattern-matched. The comp
// proxy learned this the expensive way twice: a regex written against
// the keys that existed at the time silently 404'd the seventh, and then
// the resource list did the same to "tournament" on prod while nine
// hermetic specs stayed green (their route mocks intercept in the
// browser, so no test ever exercised the proxy file). e2e/picker.spec.ts
// carries an unmocked proxy test pinning exactly this file.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

const ALLOWED = new Set(["board", "review"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !ALLOWED.has(segs)) {
    return res.status(404).json({ error: "unknown picker route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/picker/${segs}${qs}`);
}

// Catch-all proxy for the club-friendlies viewer endpoints (read-only
// GETs). The backend surface is deliberately tiny — no standings (none
// exist for friendlies), no odds, no admin — and the allowlist mirrors
// exactly that.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

// "coverage" was MISSING here, so the backend census route was
// unreachable from the deployed frontend. "fixtures" is the hub's list.
const ALLOWED = new Set(["scoreboard", "schedule", "markets", "coverage",
                         "fixtures"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  const ok = ALLOWED.has(segs)
    || /^match\/\d{1,12}$/.test(segs)
    || /^fixtures\/\d{1,12}$/.test(segs);
  if (req.method !== "GET" || !ok) {
    return res.status(404).json({ error: "unknown friendlies route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/friendlies/${segs}${qs}`);
}

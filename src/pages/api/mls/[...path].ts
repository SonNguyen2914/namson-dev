// Catch-all proxy for the MLS data endpoints (read-only GETs).
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

const ALLOWED = new Set(["scoreboard", "schedule", "standings", "markets"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !ALLOWED.has(segs)) {
    return res.status(404).json({ error: "unknown mls route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/mls/${segs}${qs}`);
}

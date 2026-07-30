// Catch-all proxy for the Conference League read surface (read-only GETs).
// Deliberately tiny, and deliberately WITHOUT an odds route: ECL has no
// model and no approval decision, so there is nothing for one to serve.
// See src/ecl.py for the measured reason (median 4 matches per club).
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

const ALLOWED = new Set(["fixtures", "markets", "status"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !ALLOWED.has(segs)) {
    return res.status(404).json({ error: "unknown ecl route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/ecl/${segs}${qs}`);
}

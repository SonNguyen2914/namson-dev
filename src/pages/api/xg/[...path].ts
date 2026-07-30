// Catch-all proxy for the league-derived xG read endpoints.
//
// Read-only GETs, and the allowlist is the whole surface: there is no ingest
// or admin route to expose. Spending the provider's shared daily quota is an
// operator action run from the backend's own script, never something a page
// load or a crafted URL can trigger.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

const ALLOWED = new Set(["summary", "friendlies"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  const ok = ALLOWED.has(segs) || /^league\/\d{1,8}$/.test(segs);
  if (req.method !== "GET" || !ok) {
    return res.status(404).json({ error: "unknown xg route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/xg/${segs}${qs}`);
}

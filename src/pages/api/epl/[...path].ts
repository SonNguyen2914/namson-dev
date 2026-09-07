// Catch-all proxy for the EPL data endpoints (read-only GETs).
// The forwarded set is LEAGUE_PROXY_ALLOWED.epl in lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import { leagueRouteAllowed, proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("epl", segs)) {
    return res.status(404).json({ error: "unknown epl route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/epl/${segs}${qs}`);
}

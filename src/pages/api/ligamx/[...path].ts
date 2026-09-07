// Catch-all proxy for the Liga MX data endpoints (read-only GETs).
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.ligamx in lib/suggesterProxy.ts,
// with the eight prefixes side by side. It was spelled out here, copied
// from the MLS list, and so never carried `markets/discovery` — a route
// the backend has served all along. See that file.
import type { NextApiRequest, NextApiResponse } from "next";
import { leagueRouteAllowed, proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("ligamx", segs)) {
    return res.status(404).json({ error: "unknown ligamx route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/ligamx/${segs}${qs}`);
}

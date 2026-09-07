// Catch-all proxy for the Kalshi market-hunter read surface (read-only
// GETs), following the MLS league-proxy pattern. The hunter ships on a
// separate backend branch: a backend without it answers 404, and that
// status is passed through VERBATIM so the panel can render its explicit
// "hunter not deployed" state instead of a spinner.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.hunter in
// lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import { leagueRouteAllowed, proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("hunter", segs)) {
    return res.status(404).json({ error: "unknown hunter route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/hunter/${segs}${qs}`);
}

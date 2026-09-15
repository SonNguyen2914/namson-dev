// Catch-all proxy for the Kalshi market-hunter read surface (read-only
// GETs), following the MLS league-proxy pattern. The hunter ships on a
// separate backend branch: a backend without it answers 404, and that
// status is passed through VERBATIM so the panel can render its explicit
// "hunter not deployed" state instead of a spinner.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.hunter in
// lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("hunter", segs)) {
    // The refusal is authored in lib/suggesterProxy.ts so all ten
    // proxies say it in one shape — JSON that names the competition
    // and which finding this is, never Next's HTML 404 page.
    return refuseLeagueRoute(res, "hunter", segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/hunter/${segs}${qs}`);
}

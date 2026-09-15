// Catch-all proxy for the MLS data endpoints (read-only GETs).
// The forwarded set is LEAGUE_PROXY_ALLOWED.mls in lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("mls", segs)) {
    // The refusal is authored in lib/suggesterProxy.ts so all ten
    // proxies say it in one shape — JSON that names the competition
    // and which finding this is, never Next's HTML 404 page.
    return refuseLeagueRoute(res, "mls", segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/mls/${segs}${qs}`);
}

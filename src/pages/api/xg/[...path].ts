// Catch-all proxy for the league-derived xG read endpoints.
//
// Read-only GETs, and the allowlist is the whole surface: there is no ingest
// or admin route to expose. Spending the provider's shared daily quota is an
// operator action run from the backend's own script, never something a page
// load or a crafted URL can trigger.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.xg in lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("xg", segs)) {
    // The refusal is authored in lib/suggesterProxy.ts so all ten
    // proxies say it in one shape — JSON that names the competition
    // and which finding this is, never Next's HTML 404 page.
    return refuseLeagueRoute(res, "xg", segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/xg/${segs}${qs}`);
}

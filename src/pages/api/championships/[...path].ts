// Catch-all proxy for the Championships board (read-only GETs).
//
// ONE ROUTE: /api/championships/board — the four national-team columns
// (UEFA Nations League, Concacaf Nations League, AFC Asian Cup, Africa
// Cup of Nations) in the picker board's own payload shape. It WRITES
// NOTHING on the backend, which is the difference that matters beside
// /api/picker/board: that route freezes a snapshot row on every GET and
// this one is held read-only by the backend's own tests.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.championships in
// lib/suggesterProxy.ts, spelled out rather than pattern-matched, for the
// reasons pages/api/picker/[...path].ts gives.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("championships", segs)) {
    return refuseLeagueRoute(res, "championships", segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/championships/${segs}${qs}`);
}

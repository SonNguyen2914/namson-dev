// Catch-all proxy for the La Liga read surface (read-only GETs). The
// backend has served these since 2026-07-30 and nothing could reach them:
// this file did not exist, so the board rendered "coming soon" for a
// competition that was fully wired.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.laliga in
// lib/suggesterProxy.ts, and it carries no `approval` — the backend has
// never served /api/laliga/approval. e2e/proxy-allowlists.spec.ts pins
// that refusal.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed("laliga", segs)) {
    // The refusal is authored in lib/suggesterProxy.ts so all ten
    // proxies say it in one shape — JSON that names the competition
    // and which finding this is, never Next's HTML 404 page.
    return refuseLeagueRoute(res, "laliga", segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/laliga/${segs}${qs}`);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

// The query string is BUILT, never interpolated: `match_id=1%26x%3D1`
// used to arrive upstream as `?match_id=1&x=1`, a parameter nobody sent.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.match_id === undefined) {
    return proxy(req, res, "/api/live-signals", "/api/live-signals");
  }
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  const qs = new URLSearchParams({ match_id: matchId });
  return proxy(req, res, `/api/live-signals?${qs}`, "/api/live-signals");
}

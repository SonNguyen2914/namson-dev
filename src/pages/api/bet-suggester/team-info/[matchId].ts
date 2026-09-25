import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../../lib/suggesterProxy";

// The path value is checked for what it is before it is interpolated —
// see lib/suggesterProxy.ts, "THE PATH A PROXY PUTS ON THE BACKEND SOCKET
// IS CONFINED" (`team-info/..%2Fmls%2Fjournal` used to reach the
// withheld GET /api/mls/journal).
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = segment(req.query.matchId, "matchId");
  if (!matchId) return refuseParam(res, "matchId", "matchId");
  return proxy(req, res, `/api/team-info/${matchId}`, `/api/team-info/${matchId}`);
}

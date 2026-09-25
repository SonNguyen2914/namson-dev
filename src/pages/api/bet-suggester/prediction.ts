import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

// Every interpolated value is checked for what it is before it goes
// anywhere near a path (see "THE PATH A PROXY PUTS ON THE BACKEND SOCKET
// IS CONFINED" in lib/suggesterProxy.ts): `match_id=../mls/risk%23` used
// to reach GET /api/mls/risk from here.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  const force = req.query.force_refresh === "true" ? "true" : "false";
  return proxy(req, res, `/api/prediction/${matchId}?force_refresh=${force}`,
               `/api/prediction/${matchId}`);
}

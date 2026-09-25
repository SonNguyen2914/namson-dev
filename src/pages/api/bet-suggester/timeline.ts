import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

// See lib/suggesterProxy.ts, "THE PATH A PROXY PUTS ON THE BACKEND SOCKET
// IS CONFINED": `match_id=../comp/ucl/drift%23` used to reach the
// withheld, quota-spending GET /api/comp/ucl/drift from here.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  return proxy(req, res, `/api/prediction/${matchId}/timeline`,
               `/api/prediction/${matchId}/timeline`);
}

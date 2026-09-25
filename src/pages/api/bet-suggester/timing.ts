import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

// Two interpolated values, each checked for what it is. See
// lib/suggesterProxy.ts, "THE PATH A PROXY PUTS ON THE BACKEND SOCKET IS
// CONFINED": `market_id=../mls/model-eval%23` used to leave /api entirely.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  const marketId = segment(req.query.market_id, "marketId");
  if (!marketId) return refuseParam(res, "market_id", "marketId");
  return proxy(req, res, `/api/timing/${matchId}/${marketId}`,
               `/api/timing/${matchId}/${marketId}`);
}

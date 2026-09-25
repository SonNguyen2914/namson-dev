import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  return proxy(req, res, `/api/prediction/${matchId}/live-state`,
               `/api/prediction/${matchId}/live-state`);
}

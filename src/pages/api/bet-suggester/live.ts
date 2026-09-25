import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  const matchId = segment(req.query.match_id, "matchId");
  if (!matchId) return refuseParam(res, "match_id", "matchId");
  return proxy(req, res, `/api/prediction/${matchId}/live`,
               `/api/prediction/${matchId}/live`);
}

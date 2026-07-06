import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const matchId = req.query.match_id;
  if (typeof matchId !== "string") {
    return res.status(400).json({ error: "match_id required" });
  }
  return proxy(req, res, `/api/prediction/${matchId}/live-state`);
}

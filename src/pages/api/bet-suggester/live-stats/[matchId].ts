import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { matchId } = req.query;
  return proxy(req, res, `/api/live-stats/${matchId}`);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { match_id } = req.query;
  return proxy(req, res, match_id
    ? `/api/live-signals?match_id=${match_id}`
    : "/api/live-signals");
}

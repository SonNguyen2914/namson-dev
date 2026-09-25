import type { NextApiRequest, NextApiResponse } from "next";
import { proxy, refuseParam, segment } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const marketId = segment(req.query.market_id, "marketId");
    if (!marketId) return refuseParam(res, "market_id", "marketId");
    return proxy(req, res, `/api/watchlist/${marketId}`,
                 `/api/watchlist/${marketId}`);
  }
  return proxy(req, res, "/api/watchlist", "/api/watchlist");
}

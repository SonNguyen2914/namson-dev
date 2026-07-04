import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "./_proxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { market_id } = req.query;
    return proxy(req, res, `/api/watchlist/${market_id}`);
  }
  return proxy(req, res, "/api/watchlist");
}

import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "./_proxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxy(req, res, "/api/alerts/recent?limit=20");
}

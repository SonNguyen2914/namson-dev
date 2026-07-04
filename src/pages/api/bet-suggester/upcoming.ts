import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const hours = req.query.hours_ahead || "72";
  return proxy(req, res, `/api/matches/upcoming?hours_ahead=${hours}`);
}

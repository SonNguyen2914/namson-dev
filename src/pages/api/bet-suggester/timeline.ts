import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { match_id } = req.query;
  return proxy(req, res, `/api/prediction/${match_id}/timeline`);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { match_id, force_refresh } = req.query;
  return proxy(
    req,
    res,
    `/api/prediction/${match_id}?force_refresh=${force_refresh || "false"}`
  );
}

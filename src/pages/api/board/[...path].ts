import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

/** `board/soon` (2026-11-16): which competitions of each board mode kick
 *  off in the next few days, to decide which switch boxes are drawn. Room for a cold sweep
 *  (BOARD_SOON_TIMEOUT_MS in lib/suggesterProxy.ts) under the 60s cap
 *  every Vercel plan allows. */
export const config = { maxDuration: 60 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "board");
}

// Catch-all proxy for the MLS data endpoints (read-only GETs).
// The forwarded set is LEAGUE_PROXY_ALLOWED.mls in lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "mls");
}

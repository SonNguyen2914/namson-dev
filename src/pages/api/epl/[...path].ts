// Catch-all proxy for the EPL data endpoints (read-only GETs).
// The forwarded set is LEAGUE_PROXY_ALLOWED.epl in lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "epl");
}

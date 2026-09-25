// Catch-all proxy for the Liga MX data endpoints (read-only GETs).
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.ligamx in lib/suggesterProxy.ts,
// with the eight prefixes side by side. It was spelled out here, copied
// from the MLS list, and so never carried `markets/discovery` — a route
// the backend has served all along. See that file.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "ligamx");
}

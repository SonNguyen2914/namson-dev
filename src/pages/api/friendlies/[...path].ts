// Catch-all proxy for the club-friendlies viewer endpoints (read-only
// GETs). The backend surface is deliberately tiny — no standings (none
// exist for friendlies), no odds, no admin — and the allowlist mirrors
// exactly that. "coverage" was MISSING once, so the backend census
// route was unreachable from the deployed frontend.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.friendlies in
// lib/suggesterProxy.ts.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "friendlies");
}

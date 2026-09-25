// Catch-all proxy for the La Liga read surface (read-only GETs). The
// backend has served these since 2026-07-30 and nothing could reach them:
// this file did not exist, so the board rendered "coming soon" for a
// competition that was fully wired.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.laliga in
// lib/suggesterProxy.ts, and it carries no `approval` — the backend has
// never served /api/laliga/approval. e2e/proxy-allowlists.spec.ts pins
// that refusal.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "laliga");
}

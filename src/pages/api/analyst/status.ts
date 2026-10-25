// GET /api/analyst/status — whether the Analyst is switched on, for the
// client. Always 200 and always JSON, so a page that asks never logs a
// failed request: the match-page panel, the "Analyst" chip on the board
// and /bet-suggester/var read this before anything else and draw
// nothing when `enabled` is false. Same shape of switch as the trading
// console's `enabled` (TRADING_ENABLED), read off one env flag.
//
// A SITE ROUTE, NOT A BACKEND PROXY: it contacts no backend and is not in
// LEAGUE_PROXY_ALLOWED. `analyst` is a static directory, which Next
// resolves ahead of the /api/[league]/[...path] catch-all.
import type { NextApiRequest, NextApiResponse } from "next";
import { analystEnabled, LEAGUES } from "../../../lib/analyst/analyst";
import { budgetUsed } from "../../../lib/analyst/limits";
import { cacheStats } from "../../../lib/analyst/cache";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  if (!analystEnabled()) return res.status(200).json({ enabled: false });
  // health for the ops view: this instance's budget and cache, nothing else
  return res.status(200).json({
    enabled: true, leagues: LEAGUES, budget: budgetUsed(), cache: cacheStats(),
  });
}

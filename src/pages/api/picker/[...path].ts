// Catch-all proxy for the picker board (read-only GETs).
//
// Two routes: /api/picker/board (src/picker's ranked cross-league slate)
// and /api/picker/review (the finished matches under each column, with
// the pre-kickoff read that was frozen or rebuilt for each). Neither
// carries a model, an edge, a probability or any money — so there is
// deliberately no odds/decision route here to add later.
//
// The forwarded set is LEAGUE_PROXY_ALLOWED.picker in
// lib/suggesterProxy.ts, spelled out rather than pattern-matched. The
// comp proxy learned this the expensive way twice: a regex written
// against the keys that existed at the time silently 404'd the seventh,
// and then the resource list did the same to "tournament" on prod while
// nine hermetic specs stayed green (their route mocks intercept in the
// browser, so no test ever exercised the proxy file). e2e/picker.spec.ts
// carries an unmocked proxy test pinning exactly this file.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxyLeague } from "../../../lib/suggesterProxy";

/** Room for the board's 110s proxy clock (PROXY_TIMEOUT_BY_ROUTE in
 *  lib/suggesterProxy.ts; 45s until 2026-11-15, when a cold board build
 *  took ~80s in prod). Over 60s needs Fluid compute on the project; a
 *  plan that refuses it fails the deploy loudly, never silently. */
export const config = { maxDuration: 120 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyLeague(req, res, "picker");
}

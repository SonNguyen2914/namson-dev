// THE OPERATOR HALT — POST /api/ops/trading-halt (2026-10-07, Son).
//
// "Stop buying, keep protecting": the backend journals an operator halt
// for `minutes` (1..1440): no new buys, resting buys cancelled, positions
// held, protective sells continue. It cannot lift or override TRADING_KILL.
// A backend without the route answers 404 {"available":false} (lib/
// operatorRelay.ts), which the console says as "not on this backend yet".
//
//   POST /api/admin/trading/halt
import type { NextApiRequest, NextApiResponse } from "next";
import { OPERATOR_WRITE_PATHS, emergencyRoute } from "../../../lib/operatorRelay";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export const BACKEND_PATH = OPERATOR_WRITE_PATHS.halt;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return emergencyRoute(req, res, BACKEND_PATH, "the operator halt", true);
}

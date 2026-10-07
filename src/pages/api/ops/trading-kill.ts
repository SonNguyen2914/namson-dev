// THE OPERATOR KILL — POST /api/ops/trading-kill (2026-10-07, Son).
//
// "Stop everything": the backend journals an operator kill for `minutes`
// (1..1440); its tick cancels every resting agent order and places
// nothing until it ends or is lifted (/api/ops/trading-kill-lift). It
// cannot set, lift or override TRADING_KILL on Railway.
//
// The body is `{minutes}`, checked and REBUILT (lib/operatorRelay.ts
// parseMinutesBody); no token → 401 here, nothing sent; one literal
// backend path from OPERATOR_WRITE_PATHS:
//
//   POST /api/admin/trading/kill
import type { NextApiRequest, NextApiResponse } from "next";
import { OPERATOR_WRITE_PATHS, emergencyRoute } from "../../../lib/operatorRelay";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export const BACKEND_PATH = OPERATOR_WRITE_PATHS.kill;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return emergencyRoute(req, res, BACKEND_PATH, "the operator kill", true);
}

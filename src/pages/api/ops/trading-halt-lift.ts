// LIFT THE OPERATOR HALT — POST /api/ops/trading-halt-lift (2026-10-07).
//
// Ends an operator halt early. No body is read or sent. It cannot lift a
// loss halt or the kill, and nothing here touches TRADING_KILL.
//
//   POST /api/admin/trading/halt/lift
import type { NextApiRequest, NextApiResponse } from "next";
import { OPERATOR_WRITE_PATHS, emergencyRoute } from "../../../lib/operatorRelay";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export const BACKEND_PATH = OPERATOR_WRITE_PATHS.haltLift;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return emergencyRoute(req, res, BACKEND_PATH, "the halt lift", false);
}

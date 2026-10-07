// Lift the operator kill — POST /api/ops/trading-kill-lift (2026-10-06).
//
// The backend's POST /api/admin/trading/kill journals an operator kill
// until a bounded time; POST /api/admin/trading/kill/lift ends it early
// and answers `{lifted: bool, kill_until: null|iso}` — `kill_until` is a
// kill still in force after the lift (TRADING_KILL on Railway, or its
// five-minute echo). Nothing here, nor on the backend route, can lift
// TRADING_KILL itself.
//
// The caller's body is NEVER read or forwarded: this route sends no body
// to ONE literal backend path:
//
//   POST /api/admin/trading/kill/lift
//
// Everything else is lib/operatorRelay.ts: one header across
// (`x-admin-token`), status and body through unedited, a missing backend
// route as 404 `{"available":false}`, `Cache-Control: private, no-store`.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  OPERATOR_BACKEND, OPERATOR_WRITE_PATHS, operatorHeaders, relayOperator,
} from "../../../lib/operatorRelay";

// nothing from the caller's body is used; read none of it
export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export const KILL_LIFT_BACKEND_PATH = OPERATOR_WRITE_PATHS.killLift;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false, error: "method_not_allowed",
      detail: `lifting the kill is a POST; ${req.method} is not a verb this `
        + "route has",
    });
  }
  return relayOperator(res, `${OPERATOR_BACKEND}${KILL_LIFT_BACKEND_PATH}`, {
    method: "POST", headers: operatorHeaders(req),
  }, "the kill lift");
}

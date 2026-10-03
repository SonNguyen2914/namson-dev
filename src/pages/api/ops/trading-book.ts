// The trader's book, relayed — GET /api/ops/trading-book (2026-10-03).
//
// The operator console's "Positions & orders" section reads this. The
// backend route (`GET /api/admin/trading/book`) is operator-gated by the
// same admin-token guard as the status route, and serves OPEN state
// only: current positions (with how many contracts are the trader's own,
// handed over to it, or the operator's) and resting orders. Never settled
// results, never per-match P&L.
//
// Same shape as trading-status.ts — one fixed backend path, one header
// across, status and body through unedited, `Cache-Control: private,
// no-store` — with the shared relay in lib/operatorRelay.ts. A backend
// that has no book route yet answers 404 `{"available":false}`.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  OPERATOR_BACKEND, operatorHeaders, relayOperator,
} from "../../../lib/operatorRelay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: `the trading book is a read; ${req.method} is not a verb `
        + "this route has",
    });
  }
  return relayOperator(res, `${OPERATOR_BACKEND}/api/admin/trading/book`,
    { headers: operatorHeaders(req) }, "the trading book");
}

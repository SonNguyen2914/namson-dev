// The trader's candidates, relayed — GET /api/ops/trading-candidates
// (2026-10-05).
//
// Son, 2026-10-03: "also let me see the candidate too, transparency is
// also the purpose of the console". The console's Candidates table reads
// this. The backend route (`GET /api/admin/trading/candidates`) is
// operator-gated by the same admin-token guard as the status route and
// serves the newest tick's bounded snapshot of the markets the trader
// considered — current and upcoming markets only, never a settled result.
//
// Same shape as trading-book.ts — one fixed backend path, nothing from
// the request interpolated into it (no query, no segment), one header
// across (`x-admin-token`), status and body through unedited,
// `Cache-Control: private, no-store` — with the shared relay in
// lib/operatorRelay.ts. A backend that has no candidates route yet
// answers 404 `{"available":false}`.
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
      error: `the trading candidates are a read; ${req.method} is not a `
        + "verb this route has",
    });
  }
  return relayOperator(res,
    `${OPERATOR_BACKEND}/api/admin/trading/candidates`,
    { headers: operatorHeaders(req) }, "the trading candidates");
}

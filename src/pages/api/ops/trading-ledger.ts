// The trader's ledger, relayed — GET /api/ops/trading-ledger (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". The console's "Trades &
// grounds" section reads this. The backend route
// (`GET /api/admin/trading/ledger`) is operator-gated by the same
// admin-token guard as the status route, read-only, and serves stored
// state only: one row per order the trader placed and per contract handed
// over to it, the grounds it recorded, what became of the order, and —
// for the trader's OWN orders and handed-over contracts only (Son's seal
// decision of 2026-10-06) — the journaled result and its P&L.
//
// Same shape as trading-candidates.ts beside it — one fixed backend path,
// one header across (`x-admin-token`), status and body through unedited,
// `Cache-Control: private, no-store`, the shared relay in
// lib/operatorRelay.ts, and a backend without the route answered 404
// `{"available":false}` — with ONE difference, and it is bounded:
//
//   THE FILTERS CROSS, AND NOTHING ELSE DOES. The ledger is paginated
//   and filtered on the backend, so six named query parameters — since,
//   until, competition, phase, cursor, limit (lib/tradingLedger.ts
//   LEDGER_PARAMS) — are read here BY NAME, each checked against its own
//   pattern, and the backend is sent a query REBUILT from the checked
//   values alone. Any other key is dropped. A value that is not what its
//   filter is answers `400 {"reason":"invalid_parameter","parameter":…}`
//   and no backend is contacted. The PATH is a literal; the final path is
//   then held to lib/suggesterProxy.ts `confinementBreach` as a second
//   wall (e2e/proxy-traversal.spec.ts fires traversal payloads at every
//   parameter read here and reads the stand-in's log).
import type { NextApiRequest, NextApiResponse } from "next";
import {
  OPERATOR_BACKEND, operatorHeaders, relayOperator,
} from "../../../lib/operatorRelay";
import { confinementBreach } from "../../../lib/suggesterProxy";
import { ledgerQuery } from "../../../lib/tradingLedger";

const BACKEND_PATH = "/api/admin/trading/ledger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: `the trading ledger is a read; ${req.method} is not a verb `
        + "this route has",
    });
  }
  const { since, until, competition, phase, cursor, limit } = req.query;
  const q = ledgerQuery({ since, until, competition, phase, cursor, limit });
  if (!q.ok) {
    return res.status(400).json({
      error: "invalid_parameter", reason: "invalid_parameter",
      parameter: q.parameter, detail: q.detail,
    });
  }
  const path = q.search ? `${BACKEND_PATH}?${q.search}` : BACKEND_PATH;
  const breach = confinementBreach(path, BACKEND_PATH);
  if (breach) {
    return res.status(400).json({
      error: "proxy_path_refused", reason: "proxy_path_refused",
      detail: `this proxy refused to forward: ${breach}. No backend was `
        + "contacted.",
    });
  }
  return relayOperator(res, `${OPERATOR_BACKEND}${path}`,
    { headers: operatorHeaders(req) }, "the trading ledger");
}

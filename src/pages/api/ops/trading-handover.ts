// Hand a position to the trader, or take it back —
// POST /api/ops/trading-handover (2026-10-03).
//
// Son's rule: the trader shows every position and resting order on the
// account, flags the ones he placed himself, and touches none of his
// until he hands it over here. A handed-over position is fully managed
// (it may add or close within its limits); "Take back" returns it. Only
// FILLED contracts can be handed over — resting orders stay his.
//
// The body is `{action: "handover"|"takeback", ticker, side, contracts}`.
// It is checked here and REBUILT — the backend is sent
// `{ticker, side, contracts}` this layer wrote, never the caller's bytes
// — and `action` only chooses between two literal backend paths:
//
//   handover -> POST /api/admin/trading/handover
//   takeback -> POST /api/admin/trading/takeback
//
// A body that fails the check is answered `400 {"ok":false,
// "error":"bad_request"}` and the backend is never called. Everything
// else is lib/operatorRelay.ts: one header across (`x-admin-token`),
// status and body through unedited, a missing backend route as 404
// `{"available":false}`, `Cache-Control: private, no-store`.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  OPERATOR_BACKEND, operatorHeaders, relayOperator,
} from "../../../lib/operatorRelay";

// a hand-over body is four short fields; nothing larger is read
export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

const BACKEND_PATH = {
  handover: "/api/admin/trading/handover",
  takeback: "/api/admin/trading/takeback",
} as const;
type Action = keyof typeof BACKEND_PATH;

/** A Kalshi market ticker: letters, digits, `.`, `_` and `-`. */
const TICKER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const MAX_CONTRACTS = 100_000;
const KEYS = new Set(["action", "ticker", "side", "contracts"]);

type Parsed =
  | { ok: true; action: Action;
      payload: { ticker: string; side: "yes" | "no"; contracts: number } }
  | { ok: false; detail: string };

function parse(body: unknown): Parsed {
  let b = body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch { return { ok: false, detail: "the body is not JSON" }; }
  }
  if (typeof b !== "object" || b === null || Array.isArray(b)) {
    return { ok: false, detail: "the body must be a JSON object" };
  }
  const o = b as Record<string, unknown>;
  const extra = Object.keys(o).filter((k) => !KEYS.has(k));
  if (extra.length) {
    return { ok: false, detail: `unexpected field(s): ${extra.join(", ")}` };
  }
  if (o.action !== "handover" && o.action !== "takeback") {
    return { ok: false, detail: "action must be \"handover\" or \"takeback\"" };
  }
  if (typeof o.ticker !== "string" || !TICKER.test(o.ticker)) {
    return { ok: false, detail: "ticker must be a market ticker" };
  }
  if (o.side !== "yes" && o.side !== "no") {
    return { ok: false, detail: "side must be \"yes\" or \"no\"" };
  }
  if (typeof o.contracts !== "number" || !Number.isInteger(o.contracts)
      || o.contracts < 1 || o.contracts > MAX_CONTRACTS) {
    return { ok: false,
      detail: `contracts must be a whole number from 1 to ${MAX_CONTRACTS}` };
  }
  return { ok: true, action: o.action,
    payload: { ticker: o.ticker, side: o.side, contracts: o.contracts } };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false, error: "method_not_allowed",
      detail: `a hand-over is a POST; ${req.method} is not a verb this `
        + "route has",
    });
  }
  const p = parse(req.body);
  if (!p.ok) {
    return res.status(400).json({ ok: false, error: "bad_request", detail: p.detail });
  }
  return relayOperator(res, `${OPERATOR_BACKEND}${BACKEND_PATH[p.action]}`, {
    method: "POST",
    headers: { ...operatorHeaders(req), "content-type": "application/json" },
    body: JSON.stringify(p.payload),
  }, `the ${p.action === "handover" ? "hand-over" : "take-back"}`);
}

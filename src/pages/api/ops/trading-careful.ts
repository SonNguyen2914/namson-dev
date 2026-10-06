// The careful strategy's switches — POST /api/ops/trading-careful
// (2026-10-06, Son's careful strategy; backend docs/TRADING-AGENT.md §38).
//
// Son's per-competition switch (all eleven on by default) and his
// promotion decision: a competition paper only or back on; a ground
// promoted to real money (the backend refuses one no section-4 check
// proposed — never automatic) or moved back to paper.
//
// The body is `{op, competition?, ground?}`. It is checked here and
// REBUILT — the backend is sent only the fields this layer wrote, never the
// caller's bytes — and goes to ONE literal backend path:
//
//   POST /api/admin/trading/careful
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

export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

const BACKEND_PATH = "/api/admin/trading/careful";
const OPS = ["competition_off", "competition_on", "promote", "demote"] as const;
type Op = typeof OPS[number];
const KEYS = new Set(["op", "competition", "ground"]);
/** a competition key: lower-case letters and digits */
const COMP = /^[a-z0-9]{2,24}$/;
/** a ground id: `family:SPREAD`, `converted_lines`, `band:10-25`, ... */
const GROUND = /^[A-Za-z0-9_:.-]{1,48}$/;

type Parsed =
  | { ok: true; payload: { op: Op; competition?: string; ground?: string } }
  | { ok: false; detail: string };

export function parseCarefulBody(body: unknown): Parsed {
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
  if (typeof o.op !== "string" || !(OPS as readonly string[]).includes(o.op)) {
    return { ok: false, detail: `op must be one of ${OPS.join(", ")}` };
  }
  const op = o.op as Op;
  if (op.startsWith("competition")) {
    if (typeof o.competition !== "string" || !COMP.test(o.competition)) {
      return { ok: false, detail: "competition must be a competition key" };
    }
    return { ok: true, payload: { op, competition: o.competition } };
  }
  if (typeof o.ground !== "string" || !GROUND.test(o.ground)) {
    return { ok: false, detail: "ground must be a ground id" };
  }
  return { ok: true, payload: { op, ground: o.ground } };
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
      detail: `a switch is a POST; ${req.method} is not a verb this route has`,
    });
  }
  const p = parseCarefulBody(req.body);
  if (!p.ok) {
    return res.status(400).json({ ok: false, error: "bad_request", detail: p.detail });
  }
  return relayOperator(res, `${OPERATOR_BACKEND}${BACKEND_PATH}`, {
    method: "POST",
    headers: { ...operatorHeaders(req), "content-type": "application/json" },
    body: JSON.stringify(p.payload),
  }, "the careful switch");
}

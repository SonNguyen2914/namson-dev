// THE OPERATOR RELAY — what the trading book, candidates, ledger and
// hand-over routes share (2026-10-03; candidates 2026-10-05; ledger
// 2026-10-06).
//
// pages/api/ops/trading-book.ts, trading-candidates.ts,
// trading-ledger.ts, trading-handover.ts, trading-kill-lift.ts and (2026-10-07)
// the emergency routes trading-kill.ts, trading-halt.ts and
// trading-halt-lift.ts are the same shape as
// trading-status.ts beside them, and for the same reasons:
//
//   * FIXED BACKEND PATHS. Each route names its backend path(s) as
//     literals; nothing from the request is interpolated into a URL —
//     save the ledger's six NAMED filters (lib/tradingLedger.ts
//     LEDGER_PARAMS), each checked against its own pattern and rebuilt
//     into the query by URLSearchParams; any other key is dropped, and a
//     bad value is a 400 before any backend is asked.
//   * ONE HEADER CROSSES, `x-admin-token`, byte for byte as the caller
//     sent it. This layer holds no credential and logs nothing — not the
//     token, not the body. (The hand-over route also sets its own
//     `content-type: application/json` on the body IT wrote; that is this
//     layer describing its own bytes, not a caller's header passed on.)
//   * THE STATUS AND THE BODY PASS THROUGH UNEDITED, with one exception:
//     a backend 404 that is NOT one of the route's own refusals
//     (`{"ok":false,"error":<code>}`) means the backend has no such route
//     yet, and is answered `404 {"available":false}` so the console can
//     say "not available yet" instead of an error.
//   * THE ONLY OTHER ANSWERS AUTHORED HERE are 405 for a verb a route
//     does not have, 400 for a body the hand-over route will not send,
//     504 for a backend that did not answer in time, and 502 when the
//     backend was never reached or its body could not be read.
import type { NextApiRequest, NextApiResponse } from "next";
import { reach, timeoutAnswer } from "./suggesterProxy";

export const OPERATOR_BACKEND =
  process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** The only header that crosses this boundary. */
export function operatorHeaders(req: NextApiRequest): Record<string, string> {
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  return token ? { "x-admin-token": token } : {};
}

/** A 404 whose body is not one of the route's own named refusals: the
 *  route itself is missing (FastAPI's `{"detail":"Not Found"}`). */
function routeMissing(status: number, raw: string): boolean {
  if (status !== 404) return false;
  try {
    const b: unknown = JSON.parse(raw);
    return !(typeof b === "object" && b !== null && !Array.isArray(b)
      && (b as Record<string, unknown>).ok === false
      && typeof (b as Record<string, unknown>).error === "string");
  } catch {
    return true;
  }
}

/** Fetch `url` and relay the answer to `res`. `what` names the backend
 *  in the answers this layer authors ("the trading book"). */
export async function relayOperator(
  res: NextApiResponse, url: string, init: RequestInit, what: string,
): Promise<void> {
  const got = await reach(url, init);
  if (!got.reached && got.timedOut) {
    return res.status(504).json(timeoutAnswer());
  }
  if (!got.reached) {
    return res.status(502).json({
      error: "proxy_unreachable",
      detail: `${what} backend was never reached, so there is no answer `
        + "to relay — this is not a refusal",
      cause: got.detail,
    });
  }
  const r = got.res;
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    return res.status(502).json({
      error: "proxy_body_unreadable",
      upstream_status: r.status,
      detail: `${what} backend answered ${r.status} and the body could `
        + "not be read to the end, so there is nothing to relay",
      cause: String(err),
    });
  }
  if (routeMissing(r.status, raw)) {
    return res.status(404).json({
      available: false,
      detail: `the backend has no ${what} route yet`,
    });
  }
  res.status(r.status);
  res.setHeader("content-type",
    r.headers.get("content-type") || "application/json");
  res.send(raw);
}

// ------------------------------------------------- the operator writes

/** THE ALLOWLIST OF OPERATOR WRITES (2026-10-07): every backend path a
 *  console route may POST to, as literals. A route names its path from
 *  here; e2e/ops-trading-emergency.spec.ts checks that each route uses one
 *  of these and nothing else. */
export const OPERATOR_WRITE_PATHS = {
  handover: "/api/admin/trading/handover",
  takeback: "/api/admin/trading/takeback",
  careful: "/api/admin/trading/careful",
  kill: "/api/admin/trading/kill",
  killLift: "/api/admin/trading/kill/lift",
  halt: "/api/admin/trading/halt",
  haltLift: "/api/admin/trading/halt/lift",
} as const;

/** A KILL or HALT body: `{minutes}` only, a whole number 1..1440. Checked
 *  and REBUILT here; the caller's bytes never reach the backend. */
export function parseMinutesBody(body: unknown):
  { ok: true; payload: { minutes: number } } | { ok: false; detail: string } {
  let b = body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch { return { ok: false, detail: "the body is not JSON" }; }
  }
  if (typeof b !== "object" || b === null || Array.isArray(b)) {
    return { ok: false, detail: "the body must be a JSON object" };
  }
  const o = b as Record<string, unknown>;
  const extra = Object.keys(o).filter((k) => k !== "minutes");
  if (extra.length) return { ok: false, detail: `unexpected field(s): ${extra.join(", ")}` };
  const m = o.minutes;
  if (typeof m !== "number" || !Number.isInteger(m) || m < 1 || m > 1440) {
    return { ok: false, detail: "minutes must be a whole number from 1 to 1440" };
  }
  return { ok: true, payload: { minutes: m } };
}

/** An emergency write with no token is refused HERE (401), never sent:
 *  a press that reaches the backend unauthenticated must not be what the
 *  operator learns a missing token from. */
export function refuseWithoutToken(req: NextApiRequest, res: NextApiResponse): boolean {
  if (operatorHeaders(req)["x-admin-token"]) return false;
  res.status(401).json({ ok: false, error: "token_missing",
    detail: "no operator token was sent; nothing was forwarded" });
  return true;
}

/** The emergency POST routes' one handler: POST only, a token, the body
 *  rebuilt (or none), one literal backend path. */
export async function emergencyRoute(req: NextApiRequest, res: NextApiResponse,
  path: string, what: string, withMinutes: boolean): Promise<void> {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, error: "method_not_allowed",
      detail: `${what} is a POST; ${req.method} is not a verb this route has` });
    return;
  }
  if (refuseWithoutToken(req, res)) return;
  if (withMinutes) {
    const p = parseMinutesBody(req.body);
    if (!p.ok) {
      res.status(400).json({ ok: false, error: "bad_request", detail: p.detail });
      return;
    }
    return relayOperator(res, `${OPERATOR_BACKEND}${path}`, {
      method: "POST",
      headers: { ...operatorHeaders(req), "content-type": "application/json" },
      body: JSON.stringify(p.payload),
    }, what);
  }
  return relayOperator(res, `${OPERATOR_BACKEND}${path}`, {
    method: "POST", headers: operatorHeaders(req),
  }, what);
}

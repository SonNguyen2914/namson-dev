// THE OPERATOR RELAY — what the trading book, candidates and hand-over
// routes share (2026-10-03; candidates 2026-10-05).
//
// pages/api/ops/trading-book.ts, trading-candidates.ts and
// trading-handover.ts are the same shape as trading-status.ts beside
// them, and for the same reasons:
//
//   * FIXED BACKEND PATHS. Each route names its backend path(s) as
//     literals; nothing from the request is interpolated into a URL.
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

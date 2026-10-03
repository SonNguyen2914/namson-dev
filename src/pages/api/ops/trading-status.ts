// The trading agent's status, relayed — GET /api/ops/trading-status.
//
// The operator console at /ops/trading reads this and nothing else. The
// backend route (`GET /api/admin/trading/status`) is operator-gated with
// `_admin_ok` and serves AGGREGATES ONLY — counts, dollar sums, flags and
// clocks; no ticker, fixture or order id ever leaves it.
//
// SAME SHAPE AS watched-strip.ts BESIDE IT, for the same reasons:
//
//   * ONE FIXED BACKEND PATH. Nothing from the request is interpolated
//     into it — no query, no segment — so there is nothing to traverse
//     (e2e/proxy-traversal.spec.ts walks every route file here).
//   * ONE HEADER CROSSES, `x-admin-token`, byte for byte as the caller
//     sent it. This layer holds no credential: no env var, nothing
//     stored between requests. The token lives in the console's React
//     state and nowhere else.
//   * THE STATUS AND THE BODY PASS THROUGH UNEDITED. A 403 stays the
//     backend's 403 ("token rejected" on the page); a 503 stays the
//     backend's 503 ("trading plane not ready").
//   * THE ONLY ANSWERS AUTHORED HERE are 405 for a verb this route does
//     not have, 504 for a backend that did not answer in time, and 502
//     when the backend was never reached or its body could not be read.
//
// `Cache-Control: private, no-store` on every answer: the payload is an
// operator's account state and must never sit in a shared cache.
import type { NextApiRequest, NextApiResponse } from "next";
import { reach, timeoutAnswer } from "../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** The only header that crosses this boundary. */
function operatorHeaders(req: NextApiRequest): Record<string, string> {
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  return token ? { "x-admin-token": token } : {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: `the trading status is a read; ${req.method} is not a verb `
        + "this route has",
    });
  }
  const got = await reach(`${BACKEND}/api/admin/trading/status`,
    { headers: operatorHeaders(req) });
  if (!got.reached && got.timedOut) {
    return res.status(504).json(timeoutAnswer());
  }
  if (!got.reached) {
    return res.status(502).json({
      error: "proxy_unreachable",
      detail: "the trading status backend was never reached, so there is "
        + "no answer to relay — this is not a refusal",
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
      detail: `the trading status backend answered ${r.status} and the `
        + "body could not be read to the end, so there is nothing to relay",
      cause: String(err),
    });
  }
  res.status(r.status);
  res.setHeader("content-type",
    r.headers.get("content-type") || "application/json");
  return res.send(raw);
}

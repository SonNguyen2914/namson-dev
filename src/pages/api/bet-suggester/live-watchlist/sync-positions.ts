// "What am I holding" — POST /api/admin/live/watchlist/sync-positions.
//
// A READ, AND READING IS THE WHOLE ROUTE. It reports every fixture the
// journal holds an open position on and, for each, whether a human
// declared it and whether it could be declared at all. It appends
// nothing: the held set is derived from the journal on every read and
// stored in no row (backend api/main.py live_admin_watchlist_sync,
// src/live/watchlist.held_positions_view, rule
// watchlist.A_POSITION_IS_NOT_A_DECLARATION).
//
// IT USED TO DECLARE THEM AND THIS FILE USED TO SAY SO (retired
// 2026-09-09; the backend stopped writing on 2026-09-06). The sentence
// is replaced rather than deleted, because it is why the route has the
// name and the method it has: "The AUTOMATIC half of B0c's selection:
// it declares every fixture the journal holds an open position on, at
// most once ever per fixture, and it removes nothing." One press of
// that wrote 37 permanent rows. The path and the POST are kept so the
// existing caller keeps working, and neither is a claim that anything
// is written.
//
// Same credential rule as the sibling route: exactly one header crosses
// this boundary, `x-admin-token` as the caller sent it. Nothing is
// stored here and no actor is supplied — there is no row for an actor
// to be written on, and `watchlist.declare` has no `source` parameter
// left to write one with.
import type { NextApiRequest, NextApiResponse } from "next";
import { reach } from "../../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "unknown watchlist method" });
  }
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  const got = await reach(
    `${BACKEND}/api/admin/live/watchlist/sync-positions`,
    { method: "POST",
      headers: token ? { "x-admin-token": token } : {} });
  if (!got.reached) {
    // THE ONLY 502 THIS ROUTE AUTHORS. The fetch threw, so nothing
    // upstream is known and NO ANSWER WAS READ — which is a different
    // fact from a backend that answered and declined.
    return res.status(502).json({
      error: "Backend unreachable",
      reason: "backend_unreachable",
      detail: got.detail });
  }
  const r = got.res;
  // REACHED: the status is a fact and is relayed. A body stream that
  // then breaks is named for what it is rather than folded into
  // "unreachable" — the request DID reach the backend, and saying it
  // was never contacted would be a claim about what happened there.
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    // THIS DETAIL IS OPERATOR-FACING — WatchDeclaration renders it
    // verbatim as `watch-sync-error`. It said "this write may well have
    // LANDED … it is idempotent and removes nothing, so it is safe to
    // ask again" (retired 2026-09-09): the first half named a write
    // this route has not made since 2026-09-06, and the second told the
    // operator what to do. It now says what is and is not known.
    return res.status(502).json({
      error: "Backend unreachable",
      reason: "backend_body_unreadable",
      upstream_status: r.status,
      detail: `the backend answered ${r.status} and the body could not `
        + `be read to the end (${String(err)}) — the request WAS `
        + "delivered and its answer is unknown. The route it reached "
        + "appends nothing (watchlist.held_positions_view reports "
        + "`writes_nothing`), so what is unknown here is the answer, "
        + "not the state of the declared set",
    });
  }
  res.status(r.status);
  res.setHeader("content-type",
    r.headers.get("content-type") || "application/json");
  return res.send(raw);
}

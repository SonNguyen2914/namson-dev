// "Watch everything I hold" — POST /api/admin/live/watchlist/sync-positions.
//
// The AUTOMATIC half of B0c's selection: it declares every fixture the
// journal holds an open position on, at most once ever per fixture, and
// it removes nothing. It also does not fight the operator — a fixture
// un-declared before kickoff is REPORTED under
// `open_positions_not_monitored` rather than silently re-added.
//
// Same credential rule as the sibling route: exactly one header crosses
// this boundary, `x-admin-token` as the caller sent it. Nothing is
// stored here and no actor is supplied — the backend names this source
// `sync:open_positions` itself, because it follows the rows rather than
// a preference, and that is a different kind of evidence from a human
// selection. The two are never totalled.
import type { NextApiRequest, NextApiResponse } from "next";

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
  try {
    const r = await fetch(
      `${BACKEND}/api/admin/live/watchlist/sync-positions`,
      { method: "POST",
        headers: token ? { "x-admin-token": token } : {} });
    const raw = await r.text();
    res.status(r.status);
    res.setHeader("content-type",
      r.headers.get("content-type") || "application/json");
    return res.send(raw);
  } catch (err) {
    return res.status(502).json({
      error: "Backend unreachable", detail: String(err) });
  }
}

// The HOLD/EXIT watchlist — B0c's declaration, relayed. Read and write.
//
// WHY THIS ROUTE CARRIES NO CREDENTIAL OF ITS OWN.
// All three backend watchlist verbs are operator-gated, and `actor` is
// required there and never defaulted: "a declaration with nobody's name
// on it cannot be held to anything". namson.dev is public and
// lib/suggesterProxy.ts injects nothing, so a public button could never
// satisfy either rule. This file therefore forwards EXACTLY ONE header —
// `x-admin-token`, byte for byte as the caller sent it — and nothing
// else. There is no env var for a token here, nothing is stored, and no
// actor is ever supplied by this layer. A caller with no header still
// reaches the backend and is refused there, in the backend's own words,
// which are what the page renders.
//
// IDENTITY IS RESOLVED, NEVER GUESSED.
// The board keys fixtures by ESPN event id; the watchlist keys them by
// the live plane's internal fixture id. The one public resolver between
// them is GET /api/news/fixture/{ref} — the same one
// pages/api/card/[competition]/[eventId].ts uses. A reference that does
// not resolve FAILS EXPLICITLY with the reason in words. It is never
// mapped by kickoff, by club name, or by any other coincidence: the
// live plane's own `(competition_slug, espn_event_id)` uniqueness is
// the only join this route will make.
//
// APPEND-ONLY, SO THERE IS NO DELETE TWIN. `action=remove` is a request
// that the backend records either as a removal or as a REFUSAL, and a
// refusal is a 200 with `recorded: true`. This route never rewrites
// that into an error.
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** The only header that crosses this boundary. */
function operatorHeaders(req: NextApiRequest): Record<string, string> {
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  return token ? { "x-admin-token": token } : {};
}

async function passThrough(res: NextApiResponse, r: Response) {
  const raw = await r.text();
  res.status(r.status);
  res.setHeader("content-type",
    r.headers.get("content-type") || "application/json");
  return res.send(raw);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const log = typeof req.query.log === "string" && /^\d{1,4}$/.test(req.query.log)
      ? req.query.log : "200";
    try {
      const r = await fetch(
        `${BACKEND}/api/admin/live/watchlist?log=${log}`,
        { headers: operatorHeaders(req) });
      return passThrough(res, r);
    } catch (err) {
      return res.status(502).json({
        error: "Backend unreachable", detail: String(err) });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "unknown watchlist method" });
  }

  const eventId = typeof req.query.event_id === "string"
    ? req.query.event_id : "";
  const action = typeof req.query.action === "string" ? req.query.action : "";
  // Deliberately NOT defaulted, NOT trimmed to something, NOT replaced by
  // "web": an empty actor is forwarded as an empty actor so the backend
  // refuses it in the sentence that owns the rule.
  const actor = typeof req.query.actor === "string" ? req.query.actor : "";
  const reason = typeof req.query.reason === "string" ? req.query.reason : "";

  if (!/^\d{1,12}$/.test(eventId)) {
    return res.status(400).json({
      error: `event_id ${JSON.stringify(eventId)} is not an ESPN event `
        + "reference — nothing is declared about an id this route cannot "
        + "read",
    });
  }
  if (action !== "add" && action !== "remove") {
    return res.status(400).json({
      error: `action must be 'add' or 'remove', not ${JSON.stringify(action)}`,
    });
  }

  try {
    const rr = await fetch(`${BACKEND}/api/news/fixture/${eventId}`);
    if (!rr.ok) {
      return res.status(rr.status === 404 ? 404 : 502).json({
        error: `event ${eventId} did not resolve to a live-plane fixture `
          + `(resolver returned ${rr.status}) — refusing to declare a `
          + "fixture this route cannot name",
      });
    }
    const resolved = (await rr.json())?.resolved_fixture;
    if (!resolved?.fixture_id) {
      return res.status(404).json({
        error: `event ${eventId} resolves to no live-plane fixture, so `
          + "there is nothing to declare",
        resolver_note: resolved?.note ?? null,
      });
    }
    const qs = new URLSearchParams({
      fixture_id: String(resolved.fixture_id), action, actor,
    });
    if (reason) qs.set("reason", reason);
    const wr = await fetch(
      `${BACKEND}/api/admin/live/watchlist?${qs.toString()}`,
      { method: "POST", headers: operatorHeaders(req) });
    const raw = await wr.text();
    // The resolved identity rides BESIDE the backend's own bytes so the
    // page can say which fixture id the declaration landed on, and in
    // which live competition, without this layer editing the record.
    let body: unknown;
    try { body = JSON.parse(raw); } catch { body = { raw }; }
    res.status(wr.status);
    return res.json({
      resolved_fixture: {
        espn_event_id: eventId,
        fixture_id: resolved.fixture_id,
        competition: resolved.competition ?? null,
        kickoff_utc: resolved.kickoff_utc ?? null,
      },
      watchlist: body,
    });
  } catch (err) {
    return res.status(502).json({
      error: "Backend unreachable", detail: String(err) });
  }
}

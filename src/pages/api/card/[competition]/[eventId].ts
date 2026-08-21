// Per-fixture SUGGESTION CARD proxy (card-v1, Phase B).
//
// The backend card route is keyed by the live plane's INTERNAL fixture
// id — GET /api/{competition}/card/{fixture_id} — but every frontend
// surface keys fixtures by ESPN event id. The one public resolver from
// an ESPN event id to the internal id is /api/news/fixture/{ref}, whose
// `resolved_fixture` names the fixture_id and its competition. So this
// route makes two backend reads: resolve, then fetch the card.
//
// An unresolvable or cross-competition reference fails EXPLICITLY with
// the reason in words (AGENTS.md: an ambiguous identity match must fail
// explicitly, never silently pick a fixture). The backend's own card
// statuses (404 unknown fixture, 503 plane dormant) pass through
// unchanged so the client can render the real status.
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

const COMPETITIONS = new Set(["mls-2026", "epl-2026", "la-liga-2026"]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const competition = typeof req.query.competition === "string"
    ? req.query.competition : "";
  const eventId = typeof req.query.eventId === "string"
    ? req.query.eventId : "";
  if (req.method !== "GET" || !COMPETITIONS.has(competition)
      || !/^\d{1,12}$/.test(eventId)) {
    return res.status(404).json({ error: "unknown card route" });
  }
  try {
    const rr = await fetch(`${BACKEND}/api/news/fixture/${eventId}`);
    if (!rr.ok) {
      return res.status(rr.status === 404 ? 404 : 502).json({
        error: `event ${eventId} did not resolve to a live-plane fixture `
          + `(resolver returned ${rr.status})`,
      });
    }
    const resolved = (await rr.json())?.resolved_fixture;
    if (!resolved?.fixture_id) {
      return res.status(404).json({
        error: `event ${eventId} resolves to no live-plane fixture — `
          + "no card exists for it",
      });
    }
    if (resolved.competition !== competition) {
      return res.status(404).json({
        error: `identity mismatch: event ${eventId} belongs to `
          + `${resolved.competition}, not ${competition} — refusing to `
          + "serve a cross-competition card",
      });
    }
    const cr = await fetch(
      `${BACKEND}/api/${competition}/card/${resolved.fixture_id}`);
    const data = await cr.json();
    return res.status(cr.status).json(data);
  } catch (err) {
    return res.status(502).json({
      error: "Backend unreachable", detail: String(err) });
  }
}

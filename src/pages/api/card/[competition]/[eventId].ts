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
import { reach, readJson, statusForUnreadableAnswer }
  from "../../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

const COMPETITIONS = new Set(["mls-2026", "epl-2026", "la-liga-2026"]);

/** A hole in this route that is NOT closed, with the condition that
 *  closes it. Registered rather than quietly left, and registered
 *  rather than papered over with a wall this file cannot honestly
 *  build. */
export const CARD_PROXY_OPEN: Record<string, {
  finding: string; closes_when: string;
}> = {
  identity_guard_can_be_skipped_silently: {
    finding:
      "the wrong-fixture guard below reads "
      + "`JSON.parse(raw)?.card?.layers?.identity?.espn_event_id` and "
      + "compares it ONLY when that optional chain produces a truthy "
      + "value. Three different situations therefore pass the guard "
      + "without it ever running, and none of them is distinguishable "
      + "from a card whose identity matched: the body is not JSON; the "
      + "backend moves or renames that path (card.py builds it at ONE "
      + "site, `\"espn_event_id\": fx.espn_event_id`); or the value is "
      + "null. A guard that is disabled by the very drift it exists to "
      + "survive is a guard that asserts presence rather than truth — "
      + "it went in because ONE transient wrong-fixture serve was "
      + "actually observed (event 761726 answering with fixture 144's "
      + "card, 5-match audit 2026-08-20), so a silent skip returns the "
      + "surface to the state that audit found. It is not closed here "
      + "because refusing on an absent key would 502 the card page on "
      + "a shape this route has never recorded off the emitter, and "
      + "guessing which absence is legitimate is how a plausible "
      + "hand-written contract gets written.",
    closes_when:
      "the card payload's identity block is RECORDED off "
      + "api/main.py's card emitter (as e2e/watched-strip.spec.ts's "
      + "fixtures were recorded, not written), so this route knows "
      + "whether `espn_event_id` can legitimately be absent or null on "
      + "a 200. If it cannot, the guard refuses on absence and this "
      + "record retires; if it can, the legitimate case is named here "
      + "and the guard refuses on every other absence.",
  },
};

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
    const rg = await reach(`${BACKEND}/api/news/fixture/${eventId}`);
    if (!rg.reached) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: `the resolver was never reached (${rg.detail}), so no `
          + "card can be asked for — this says nothing about whether "
          + "the fixture or its card exists",
      });
    }
    const rr = rg.res;
    if (!rr.ok) {
      return res.status(rr.status === 404 ? 404 : 502).json({
        error: `event ${eventId} did not resolve to a live-plane fixture `
          + `(resolver returned ${rr.status})`,
      });
    }
    const rp = await readJson(rr);
    if (!rp.ok) {
      // AN ANSWER WE COULD NOT READ. Not "no such fixture" (that is the
      // 404 below, and it is a claim about the live plane) and not an
      // unreachable backend (that is the 502 above). The resolver's own
      // status travels as `upstream_status` so the three stay apart.
      //
      // THIS BRANCH IS ALWAYS 2xx: `!rr.ok` returned above it, so
      // `rr.status` here can only be a success code and
      // `res.status(rr.status)` shipped this error object under a 200
      // on every single occurrence — not a race, a certainty. A card
      // reader branching on `res.ok` took it for the card and read a
      // payload with no `card` key, which renders as a fixture with
      // nothing on it. statusForUnreadableAnswer computes the status
      // instead of this line choosing it.
      return res.status(statusForUnreadableAnswer(rr.status)).json({
        error: "resolver_response_not_json",
        reason: "backend_response_not_json",
        upstream_status: rr.status,
        detail: `${rp.why} — whether event ${eventId} has a live-plane `
          + "fixture is UNKNOWN, and no card is served off an identity "
          + "this route could not read",
        body: rp.raw === null ? null : rp.raw.slice(0, 2000),
      });
    }
    const resolved = (rp.body as { resolved_fixture?: {
      fixture_id?: number; competition?: string | null } } | null)
      ?.resolved_fixture;
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
    const cg = await reach(
      `${BACKEND}/api/${competition}/card/${resolved.fixture_id}`);
    if (!cg.reached) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: `the card read was never reached (${cg.detail}) for `
          + `fixture ${resolved.fixture_id} — the identity resolved, `
          + "so this is not an unknown fixture",
      });
    }
    const cr = cg.res;
    // Pass the backend's BYTES through untouched: content_hash is
    // sha256 over the backend's own serialization, and re-encoding here
    // (float formatting, accent escapes) made the hash unverifiable
    // from the dashboard (5-match audit, 2026-08-20). Parse a copy only
    // to guard identity.
    // BYTES, UNTOUCHED — content_hash is sha256 over the backend's own
    // serialization. A stream that breaks here is named for what it is:
    // the card route ANSWERED, and reporting it as unreachable would
    // send the dashboard a false sentence about the backend.
    let raw: string;
    try {
      raw = await cr.text();
    } catch (err) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_body_unreadable",
        upstream_status: cr.status,
        detail: `the card route answered ${cr.status} and the body `
          + `could not be read to the end (${String(err)}) — the `
          + "backend was reached and the card may well exist",
      });
    }
    if (cr.ok) {
      // The same audit caught ONE transient wrong-fixture serve (event
      // 761726 briefly answered with fixture 144's card). Whatever the
      // resolver race was, the card names its own espn_event_id — so
      // refuse loudly rather than hand the user another match's card.
      try {
        const espn = JSON.parse(raw)?.card?.layers?.identity
          ?.espn_event_id;
        if (espn && String(espn) !== eventId) {
          return res.status(502).json({
            error: `resolver mismatch: asked for event ${eventId} but `
              + `the card identifies as event ${espn} — refusing to `
              + "serve the wrong match's card; retry",
          });
        }
      } catch { /* unparseable guard input never blocks the passthrough */ }
    }
    // CARD_PROXY_OPEN["identity_guard_can_be_skipped_silently"] applies
    // to the block above and is registered rather than closed here.
    res.status(cr.status);
    res.setHeader("content-type",
      cr.headers.get("content-type") || "application/json");
    return res.send(raw);
  } catch (err) {
    // Both backend reads on this route go through `reach`, so an
    // unreachable backend is answered above by name. Anything still
    // arriving here is this route's own bug and is labelled as one.
    return res.status(500).json({
      error: "proxy_route_failed",
      reason: "proxy_route_failed",
      detail: `this route threw while assembling the answer `
        + `(${String(err)}). The backend is NOT known to be `
        + "unreachable.",
    });
  }
}

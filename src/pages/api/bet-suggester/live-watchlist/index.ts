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
import { reach, readJson, statusForUnreadableAnswer }
  from "../../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** The only header that crosses this boundary. */
function operatorHeaders(req: NextApiRequest): Record<string, string> {
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  return token ? { "x-admin-token": token } : {};
}

async function passThrough(res: NextApiResponse, r: Response) {
  // THE BACKEND WAS REACHED AND GAVE A STATUS. If the body stream then
  // breaks, that status is still a fact and the finding is named for
  // what it is — not folded into "unreachable", which would say the
  // backend never answered when it did.
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    return res.status(502).json({
      error: "Backend unreachable",
      reason: "backend_body_unreadable",
      upstream_status: r.status,
      detail: `the backend answered ${r.status} and the body could not `
        + `be read to the end (${String(err)}) — the backend was `
        + "reached, and this is not a refusal and not an empty "
        + "watchlist",
    });
  }
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
    const got = await reach(
      `${BACKEND}/api/admin/live/watchlist?log=${log}`,
      { headers: operatorHeaders(req) });
    if (!got.reached) {
      // THE ONLY 502 ON THIS BRANCH. The fetch threw, so there is no
      // status and no body: nothing upstream is known.
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: got.detail });
    }
    return passThrough(res, got.res);
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
    const rg = await reach(`${BACKEND}/api/news/fixture/${eventId}`);
    if (!rg.reached) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: `the resolver was never reached (${rg.detail}), so this `
          + "route cannot name the fixture and declares nothing",
      });
    }
    const rr = rg.res;
    if (!rr.ok) {
      return res.status(rr.status === 404 ? 404 : 502).json({
        error: `event ${eventId} did not resolve to a live-plane fixture `
          + `(resolver returned ${rr.status}) — refusing to declare a `
          + "fixture this route cannot name",
      });
    }
    const rp = await readJson(rr);
    if (!rp.ok) {
      // AN ANSWER WE COULD NOT READ IS NOT "no such fixture", and it is
      // not an unreachable backend either. The resolver's status is
      // relayed so the surface can tell the three apart.
      return res.status(rr.status).json({
        error: "resolver_response_not_json",
        reason: "backend_response_not_json",
        upstream_status: rr.status,
        detail: `${rp.why} — whether event ${eventId} has a live-plane `
          + "fixture is UNKNOWN, and nothing is declared on an id this "
          + "route could not read",
        body: rp.raw === null ? null : rp.raw.slice(0, 2000),
      });
    }
    const resolved = (rp.body as { resolved_fixture?: {
      fixture_id?: number; competition?: string | null;
      kickoff_utc?: string | null; note?: string | null } } | null)
      ?.resolved_fixture;
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
    const wg = await reach(
      `${BACKEND}/api/admin/live/watchlist?${qs.toString()}`,
      { method: "POST", headers: operatorHeaders(req) });
    if (!wg.reached) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: `the declaration was never delivered (${wg.detail}) — `
          + "nothing was recorded",
      });
    }
    const wr = wg.res;
    const wp = await readJson(wr);
    const raw = wp.raw ?? "";
    // The resolved identity rides BESIDE the backend's own bytes so the
    // page can say which fixture id the declaration landed on, and in
    // which live competition, without this layer editing the record.
    // The backend's own bytes, parsed when they parse and QUOTED with a
    // named reason when they do not — never silently `{ raw }`, which
    // reads to a caller as a payload shape rather than as a failure.
    const body: unknown = wp.ok ? wp.body : { unreadable: wp.why, raw };
    // AND THE STATUS SAYS SO TOO. Quoting the unreadable answer in the
    // body was the right half; shipping it under the backend's own 200
    // was the other half undone. WatchlistDeclareResponse carries an
    // index signature, so `{ unreadable, raw }` typechecks as a
    // WatchlistDeclaration, `recorded` reads undefined, and the panel
    // draws "nothing was recorded" — a claim about the operator's own
    // preregistration, made off an answer this route could not read,
    // for a POST that may well have LANDED. A non-2xx from the backend
    // still relays unchanged; only the success code, which is the one
    // that lies to `res.ok`, is refused here.
    res.status(wp.ok ? wr.status : statusForUnreadableAnswer(wr.status));
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
    // Every backend read on this route goes through `reach`, so an
    // unreachable backend is answered above by name. What reaches here
    // is this route's own bug and says so.
    return res.status(500).json({
      error: "proxy_route_failed",
      reason: "proxy_route_failed",
      detail: `this route threw while assembling the answer `
        + `(${String(err)}). The backend is NOT known to be `
        + "unreachable.",
    });
  }
}

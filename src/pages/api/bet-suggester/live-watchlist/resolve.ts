// ESPN event id -> live-plane fixture id, in one request for a board.
//
// WHY IT EXISTS. The declared set is a list of live-plane fixture ids.
// The board is a list of ESPN event ids. Without a join, a watch toggle
// cannot say whether the row under it is declared — and a toggle that
// cannot say that is a control with no state. The join is
// GET /api/news/fixture/{ref}, one call per reference; this route makes
// them server-side so the board makes one.
//
// IT ADDS NO PUBLIC SURFACE. The per-reference resolver is already
// public, but a BULK form of it is a different thing from N single
// lookups, so this one is gated: it first asks the operator watchlist
// with `log=0` using the caller's own `x-admin-token`, and forwards the
// backend's refusal unchanged when that fails. No token, no bulk join.
//
// A REFERENCE THAT DOES NOT RESOLVE IS REPORTED, NOT DROPPED. `resolved`
// carries a null for it and `notes` carries the resolver's own sentence,
// so "this event has no fixture row" and "we did not ask" cannot render
// alike.
import type { NextApiRequest, NextApiResponse } from "next";
import { reach, readJson } from "../../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

const MAX_IDS = 200;
const CONCURRENCY = 6;
// An espn id's fixture row does not move once it exists, so a hit is
// cached for ten minutes; a MISS is cached for one, because ingest can
// create the row at any moment and a stale "no fixture" would make the
// toggle lie for the rest of the session.
const HIT_TTL_MS = 10 * 60_000;
const MISS_TTL_MS = 60_000;

type Resolved = { fixture_id: number; competition: string | null;
                  kickoff_utc: string | null } | null;

const cache = new Map<string, { at: number; value: Resolved; note: string | null }>();

async function resolveOne(id: string):
    Promise<{ value: Resolved; note: string | null }> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < (hit.value ? HIT_TTL_MS : MISS_TTL_MS)) {
    return { value: hit.value, note: hit.note };
  }
  const got = await reach(`${BACKEND}/api/news/fixture/${id}`);
  if (!got.reached) {
    // NOT cached and NOT folded into "no fixture". It also does not
    // throw: this runs inside a worker pool, and until 2026-09-07 one
    // bad answer escaped the pool, hit the handler's catch and turned
    // the WHOLE batch into a 502 — throwing away every id that HAD
    // resolved. A failure is now this id's own note and nobody else's.
    return { value: null,
             note: `the resolver was never reached for this event `
                 + `(${got.detail}), so whether it has a live-plane `
                 + "fixture is unknown" };
  }
  const r = got.res;
  if (!r.ok) {
    // NOT cached and NOT folded into "no fixture": a failed read is not
    // evidence of an absent row.
    return { value: null,
             note: `the resolver answered ${r.status} for this event, so `
                 + "whether it has a live-plane fixture is unknown" };
  }
  const parsed = await readJson(r);
  if (!parsed.ok) {
    // A 200 CARRYING SOMETHING THAT IS NOT JSON IS AN ANSWER WE COULD
    // NOT READ, never "this event resolves to nothing". Not cached
    // either — an unreadable answer is not a fact about the fixture.
    return { value: null,
             note: `${parsed.why} for this event, so whether it has a `
                 + "live-plane fixture is unknown" };
  }
  const rf = (parsed.body as { resolved_fixture?: {
    fixture_id?: number; competition?: string | null;
    kickoff_utc?: string | null; note?: string | null } } | null)
    ?.resolved_fixture;
  const value: Resolved = rf?.fixture_id
    ? { fixture_id: rf.fixture_id, competition: rf.competition ?? null,
        kickoff_utc: rf.kickoff_utc ?? null }
    : null;
  const note: string | null = value ? null : (rf?.note ?? null);
  cache.set(id, { at: Date.now(), value, note });
  return { value, note };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "unknown watchlist method" });
  }
  const t = req.headers["x-admin-token"];
  const token = Array.isArray(t) ? t[0] : t;
  // A REQUEST BODY WE COULD NOT READ IS NOT AN EMPTY ONE. The parse
  // failure used to fold into `{}`, which then failed the `event_ids`
  // check below and told the caller its ARRAY was wrong when the truth
  // was that its whole body never parsed. Same shape as everything else
  // this round closed, pointing upstream instead of down.
  let body: { event_ids?: unknown } | null;
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch (err) {
      return res.status(400).json({
        error: "request_body_not_json",
        detail: `the request body is ${req.body.length} characters that `
          + `do not parse as JSON (${String(err)}) — this route read `
          + "no event references at all, which is not the same as "
          + "being sent none",
      });
    }
  } else {
    body = (req.body ?? {}) as { event_ids?: unknown } | null;
  }
  const raw: unknown = body?.event_ids;
  if (!Array.isArray(raw)) {
    return res.status(400).json({
      error: "event_ids must be an array of ESPN event references" });
  }
  const ids = [...new Set(raw.map(String))].filter((s) => /^\d{1,12}$/.test(s));
  const unreadable = [...new Set(raw.map(String))]
    .filter((s) => !/^\d{1,12}$/.test(s));
  if (ids.length > MAX_IDS) {
    return res.status(400).json({
      error: `${ids.length} references asked for; this route resolves at `
        + `most ${MAX_IDS} in one call` });
  }

  try {
    // The gate. `log=0` asks for the smallest possible operator payload.
    const gated = await reach(`${BACKEND}/api/admin/live/watchlist?log=0`,
      { headers: token ? { "x-admin-token": token } : {} });
    if (!gated.reached) {
      return res.status(502).json({
        error: "Backend unreachable",
        reason: "backend_unreachable",
        detail: gated.detail });
    }
    const gate = gated.res;
    if (!gate.ok) {
      // THE REFUSAL'S OWN STATUS SURVIVES A BROKEN BODY STREAM. This
      // read sat outside the try, so a 403 whose body broke mid-stream
      // threw into the handler's catch and came back as a 500
      // `proxy_route_failed` — this layer taking the blame for a
      // refusal the backend had already issued, and throwing away the
      // status that named it. The gate's status is a fact from the
      // moment it arrives; only the body can go missing.
      let gr: string;
      try {
        gr = await gate.text();
      } catch (err) {
        return res.status(gate.status).json({
          error: "gate_body_unreadable",
          upstream_status: gate.status,
          detail: `the operator gate answered ${gate.status} and the `
            + `body could not be read to the end (${String(err)}), so `
            + "its own words are lost — the status above is the "
            + "backend's and this bulk join was NOT performed",
        });
      }
      res.status(gate.status);
      res.setHeader("content-type",
        gate.headers.get("content-type") || "application/json");
      return res.send(gr);
    }

    const resolved: Record<string, Resolved> = {};
    const notes: Record<string, string> = {};
    let cursor = 0;
    const workers = Array.from(
      { length: Math.min(CONCURRENCY, ids.length || 1) }, async () => {
        for (;;) {
          const i = cursor++;
          if (i >= ids.length) return;
          const id = ids[i];
          const out = await resolveOne(id);
          resolved[id] = out.value;
          if (out.note) notes[id] = out.note;
        }
      });
    await Promise.all(workers);

    return res.status(200).json({
      resolved, notes,
      asked: ids.length,
      // a reference this route could not even read is named, never
      // silently absent from the answer
      unreadable_references: unreadable,
    });
  } catch (err) {
    // EVERY BACKEND READ ON THIS ROUTE NOW GOES THROUGH `reach`, so a
    // backend that was never contacted is answered above, by name, with
    // the batch's partial results intact. Anything still arriving here
    // is this route's OWN bug and is labelled as one — calling it an
    // unreachable backend would be this layer blaming the network for
    // its own defect.
    return res.status(500).json({
      error: "proxy_route_failed",
      reason: "proxy_route_failed",
      detail: `this route threw while assembling the answer `
        + `(${String(err)}). The backend is NOT known to be `
        + "unreachable — every read here reports that by name.",
    });
  }
}

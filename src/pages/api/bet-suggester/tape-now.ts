// The operator's own press on the tape — POST /api/admin/live/tape-now.
//
// WHY THIS ROUTE EXISTS. The state collector writes on its own clock,
// and until 2026-09-11 that clock was the only way a row ever landed:
// the operator watching a match could see the age of the tape climb and
// had nothing to do about it. Son asked for a press that takes a row
// NOW — "with a tape button I can tape whenever I want new info" — so
// the backend grew a sweep it can be asked for, and this file is the
// only way the browser reaches it.
//
// WHY THIS ROUTE CARRIES NO CREDENTIAL OF ITS OWN. The same rule as
// watched-strip.ts beside it, for the same reason: the sweep writes
// rows on the operator's live plane, so the backend gates it with the
// `x-admin-token` header. namson.dev is public and
// lib/suggesterProxy.ts injects nothing. This file forwards EXACTLY ONE
// header and nothing else. There is no env var for a token here,
// nothing is stored, and this layer holds no credential between
// requests. A caller with no header still reaches the backend and is
// refused THERE, in the backend's own words, which are what the button
// renders.
//
// THE STATUS AND THE BODY ARE PASSED THROUGH UNEDITED, and on this
// route that matters more than on the read beside it. A press made too
// soon after the last sweep is answered **200** with `swept: 0`, a
// named refusal and a `next_allowed_at` — a NORMAL ANSWER, not an
// error. Nothing here may turn that into a failure, and nothing here
// may turn a failure into it: the button decides what the answer means
// and this layer does not paraphrase either one.
//
// THE ONLY ANSWERS THIS ROUTE AUTHORS are the 405 for a verb it does
// not have, and the two 502s below — `proxy_unreachable` when the fetch
// itself threw (the backend was never reached, so there is no status
// and no sentence to relay) and `proxy_body_unreadable` when it
// answered and the body stream broke. They are labelled so the surface
// can say which of them it is looking at, and so that neither is ever
// read as "the sweep was refused".
import type { NextApiRequest, NextApiResponse } from "next";
import { reach } from "../../../lib/suggesterProxy";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** The only header that crosses this boundary.
 *
 *  AND THE DUPLICATE CASE, HANDLED RATHER THAN GUARDED AGAINST WITH A
 *  BRANCH THAT CANNOT FIRE. watched-strip.ts beside this file reads the
 *  header as `Array.isArray(t) ? t[0] : t`, and for THIS header the
 *  first arm is dead code: node:http merges duplicate request header
 *  fields into ONE comma-joined string (`"a, b"`) and keeps an array
 *  for exactly one field, `set-cookie`. So two `x-admin-token` headers
 *  never arrive as `["a", "b"]`; they arrive as a single string that is
 *  neither token, and the guard written for them steps aside for it.
 *
 *  WHAT HAPPENS INSTEAD IS THE HEADER RULE, APPLIED HONESTLY: whatever
 *  arrived is forwarded, byte for byte, and NO HALF OF A MERGED PAIR IS
 *  EVER CHOSEN. Picking `a` over `b` would be this layer deciding which
 *  of two credentials the operator meant — a decision it has no
 *  standing to take, no way to report, and every reason not to make
 *  silently on a route that WRITES. A merged value is not a token the
 *  backend holds, so the backend refuses it, in the backend's own
 *  words, which is the answer the operator gets.
 *
 *  The array arm below is kept only because `NextApiRequest["headers"]`
 *  is typed `string | string[] | undefined` for every field and this
 *  file does not get to narrow the type by asserting a runtime fact.
 *  It does not choose either: it reproduces node's own merge, so the
 *  bytes that leave here are the same whichever shape arrived. */
function operatorHeaders(req: NextApiRequest): Record<string, string> {
  const t = req.headers["x-admin-token"];
  const token = typeof t === "string" ? t
    : Array.isArray(t) ? t.join(", ")
    : undefined;
  return token ? { "x-admin-token": token } : {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: `taking a tape row is a write; ${req.method} is not a verb `
        + "this route has",
    });
  }
  // NO BODY IS FORWARDED, because the press carries no argument: the
  // sweep's subject is the declared set the backend already holds, and
  // a body invented here would be this layer telling the backend which
  // fixtures the operator meant.
  const got = await reach(`${BACKEND}/api/admin/live/tape-now`,
    { method: "POST", headers: operatorHeaders(req) });
  if (!got.reached) {
    return res.status(502).json({
      error: "proxy_unreachable",
      detail: "the sweep's backend was never reached, so no tape was "
        + "taken and there is no answer to relay — this is not a "
        + "refusal and not a sweep that swept nothing",
      cause: got.detail,
    });
  }
  const r = got.res;
  // REACHED, AND THE STATUS IS THE ANSWER. Only the fetch was inside a
  // try; the body read is below, so a stream that breaks after the
  // backend answered cannot be relayed as `proxy_unreachable`. The
  // distinction is sharper here than on a read: this route asks for a
  // WRITE, and "we never asked" and "we asked and cannot hear the
  // answer" are opposite things to tell an operator deciding whether to
  // press again.
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    return res.status(502).json({
      error: "proxy_body_unreadable",
      upstream_status: r.status,
      detail: `the sweep's backend answered ${r.status} and the body `
        + "could not be read to the end, so there is nothing to relay. "
        + "THE REQUEST WAS DELIVERED: this is not `proxy_unreachable` "
        + "and not a refusal, and whether a row was written is unknown "
        + "rather than answered — the age of the tape on the next poll "
        + "is what says",
      cause: String(err),
    });
  }
  res.status(r.status);
  res.setHeader("content-type",
    r.headers.get("content-type") || "application/json");
  return res.send(raw);
}

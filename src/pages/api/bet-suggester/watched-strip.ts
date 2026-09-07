// The HOLD/EXIT strip's ONE read, relayed — GET /api/bet-suggester/watched-strip.
//
// WHY THIS ROUTE EXISTS AT ALL. The strip has been mounted on the
// landing page since 707a564 and has NEVER RENDERED IN PRODUCTION. The
// backend route shipped (api/main.py, `bet_suggester_watched_strip`),
// but there was no proxy in front of it, so every poll left Next's own
// 404 page and the component took that as "no route, no credential, or
// a dead backend" and stayed absent. Three facts were collapsed into
// one blank space; this file separates the first of them out.
//
// WHY THIS ROUTE CARRIES NO CREDENTIAL OF ITS OWN. Same rule as the
// live-watchlist proxies beside it, for the same reason: the strip
// carries POSITIONS — stated size and price paid, the two fields the
// journal's public projection redacts — so the backend gates it with
// `_admin_ok`. namson.dev is public and lib/suggesterProxy.ts injects
// nothing. This file therefore forwards EXACTLY ONE header,
// `x-admin-token`, byte for byte as the caller sent it, and nothing
// else. There is no env var for a token here, nothing is stored, and
// this layer holds no credential between requests. A caller with no
// header still reaches the backend and is refused THERE, in the
// backend's own words, which are what the page renders.
//
// THE STATUS AND THE BODY ARE PASSED THROUGH UNEDITED. A 403 stays a
// 403 and its `detail` stays the backend's sentence. This route never
// rewrites a refusal into an empty payload, and never invents a
// `dormant: true` or an empty `matches` on the backend's behalf: on
// this surface "refused" and "nothing is declared" are different facts
// and the whole stage has spent five rounds keeping them apart.
//
// THE ONE ANSWER THIS ROUTE AUTHORS is 502 when the fetch itself throws
// — the backend was never reached, so there is no status and no
// sentence to relay, and saying nothing would be indistinguishable from
// a refusal. It is labelled `proxy_unreachable` so the surface can name
// which of the two it is looking at.
import type { NextApiRequest, NextApiResponse } from "next";

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
  if (req.method !== "GET") {
    return res.status(405).json({
      error: `the watched strip is a read; ${req.method} is not a verb `
        + "this route has",
    });
  }
  try {
    const r = await fetch(`${BACKEND}/api/bet-suggester/watched-strip`,
      { headers: operatorHeaders(req) });
    const raw = await r.text();
    res.status(r.status);
    res.setHeader("content-type",
      r.headers.get("content-type") || "application/json");
    return res.send(raw);
  } catch (err) {
    return res.status(502).json({
      error: "proxy_unreachable",
      detail: "the strip's backend was never reached, so there is no "
        + "answer to relay — this is not a refusal and not an empty "
        + "watchlist",
      cause: String(err),
    });
  }
}

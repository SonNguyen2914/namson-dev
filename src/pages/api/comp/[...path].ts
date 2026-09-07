// Catch-all proxy for the viewer competitions (read-only GETs).
// Deliberately no odds route: these competitions have no model, so there is
// nothing for one to serve. See src/competitions.py.
import type { NextApiRequest, NextApiResponse } from "next";
import { leagueRouteAllowed, proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  // THE PATTERN MOVED to lib/suggesterProxy.ts (COMP_RESOURCES and
  // LEAGUE_PROXY_ID_ROUTES.comp) on 2026-09-07, and the move IS the
  // fix. Living here as an inline literal is why comp was the one proxy
  // in the tree `proxyAllowlistDrift` never audited — and, measured
  // against the backend's own route table that day, the only one still
  // holding unregistered holes when the other eight came back clean.
  // `{key}/match/{event_id}` was one of them: the per-match live read
  // built to close the 2026-09-02 Leagues Cup gap, unreachable from
  // here ever since.
  //
  // (A bare /api/comp never reaches a NON-optional catch-all, so the
  // old `segs === ""` "listing" branch was dead code wearing a comment.)
  //
  // This route's own rot, twice, kept because it is the reason for the
  // move: the first key pattern was written against the six keys that
  // existed at the time and silently 404'd the seventh — the LAFC-alias
  // class of rot, applied to a regex. Then the RESOURCE list caught the
  // same disease: "tournament" shipped backend-first and this allowlist
  // silently 404'd it on prod while the hermetic specs stayed green
  // (their route mocks intercept in the browser, so no test exercised
  // this file). e2e/asean.spec.ts has an unmocked proxy test pinning
  // exactly this.
  if (req.method !== "GET" || !leagueRouteAllowed("comp", segs)) {
    return res.status(404).json({ error: "unknown comp route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/comp/${segs}${qs}`);
}

// THE PROXY FOR EVERY LEAGUE PREFIX THAT HAS NO DIRECTORY OF ITS OWN —
// and the reason /api/<anything>/<anything> stopped answering in HTML.
//
// WHAT WAS WRONG. The board declares eight league columns. Four of them
// — bundesliga, seriea, ligue1, eredivisie — joined it on 2026-09-08
// and `src/pages/api/` grew no directory for any of them, so on
// 2026-09-15 all four answered /api/<slug>/standings with NEXT'S OWN
// HTML 404 PAGE while the backend answered the same request with a real
// table. The folded Campeones Cup answered the same page for a
// different reason: there is genuinely nothing to serve.
//
// WHY A DYNAMIC SEGMENT RATHER THAN FOUR MORE DIRECTORIES. Copying
// epl/[...path].ts four times would have fixed today's four and left
// the NEXT league to fail in exactly this way — the second-copy-of-a-
// fact this tree keeps paying for, and the reason `markets/discovery`
// and `tournament` each shipped backend-first into a silent 404. The
// fact of WHICH prefixes exist and WHICH routes each forwards already
// lives in one place, LEAGUE_PROXY_ALLOWED, so this file adds no list:
// it hands the URL's own prefix to the same `leagueRouteAllowed` the
// nine hand-written proxies call and forwards only what that says yes
// to. A league added to that table is reachable the moment it is
// added, with no file to remember.
//
// Next resolves a static segment ahead of a dynamic one, so every
// existing directory — bet-suggester, card, comp, epl, friendlies,
// hunter, laliga, ligamx, mls, picker, xg — still answers for itself
// and this file is reached only by a prefix none of them claims.
//
// IT IS NOT AN OPEN PROXY, and the reason is that it admits nothing on
// its own authority. The prefix is attacker-supplied, so it is checked
// as an OWN key of the allowlist (see `ownEntry`: `constructor` and
// `__proto__` answer truthily on a plain object and would have thrown
// a 500 HTML page out of a route written to stop returning HTML), and
// the sub-path must be on that prefix's own list — the same list, and
// therefore the same narrow set, the per-league directories enforce.
// Nothing here widens the surface; PR #41's allowlists are the whole
// admission rule.
import type { NextApiRequest, NextApiResponse } from "next";
import {
  leagueRouteAllowed,
  proxy,
  refuseLeagueRoute,
} from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const prefix = String(req.query.league ?? "");
  const segs = ((req.query.path as string[]) || []).join("/");
  if (req.method !== "GET" || !leagueRouteAllowed(prefix, segs)) {
    // JSON, naming the competition and which of the two findings this
    // is — never the HTML page, which cannot be told from a breakage.
    return refuseLeagueRoute(res, prefix, segs);
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/${prefix}/${segs}${qs}`);
}

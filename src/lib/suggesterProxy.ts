// Shared proxy helper for all bet-suggester API routes, and the one
// place the league allowlists are written down.
//
// A REACHED BACKEND IS NEVER REPORTED AS AN UNREACHED ONE. Until
// 2026-09-07 the `await r.json()` sat inside the same `try` as the
// fetch, so THREE different findings arrived at every caller as one
// 502 "Backend unreachable":
//
//   - the backend was never reached (the only true 502 here);
//   - the backend answered 200 with a body that is not JSON — an
//     upstream HTML error page, a proxy's own interstitial, an empty
//     204;
//   - the backend answered 404/500/503 with a non-JSON body, and the
//     real status was thrown away with it.
//
// The second and third are answers. Folding an answer into "we never
// reached it" is the same shape as folding a failed read into an empty
// one: the surface is told nothing happened when in fact something
// did, and the status that named it is gone. So the fetch is now the
// ONLY thing inside the first try, and everything after it relays the
// UPSTREAM STATUS — a 404 stays a 404, a 503 stays a 503 — with the
// unparseable bytes carried as evidence rather than paraphrased.
import type { NextApiRequest, NextApiResponse } from "next";
// The ONE table of competition display names this repo has. Imported so
// a refusal can NAME the competition it is refusing instead of handing
// the caller a bare slug; `pickerApi` imports nothing, so this is a
// one-way edge and not a cycle.
import { LEAGUE_LABEL } from "./pickerApi";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

/** How much of an unparseable body travels back as evidence. Enough to
 *  identify an HTML error page or a gateway interstitial by eye, and
 *  bounded so a runaway upstream cannot be relayed whole. */
export const RELAYED_BODY_CHARS = 2000;

/** The named answers this helper AUTHORS, as opposed to relays. Every
 *  one is a distinct finding and none of them may be produced for
 *  another's situation. Exported so a guard names them from here
 *  rather than typing the strings a second time. */
export const PROXY_AUTHORED_ERRORS = {
  backend_unreachable: "the fetch itself threw: no status, no body, no "
    + "answer of any kind. THE ONLY 502 this helper authors, and the "
    + "only case in which nothing upstream is known.",
  backend_body_unreadable: "the backend answered with a status and the "
    + "response body could not be read to the end (a broken stream). "
    + "The upstream status is known and travels as `upstream_status`; "
    + "this is NOT `backend_unreachable`.",
  backend_response_not_json: "the backend answered with a status and a "
    + "body that is not JSON — an HTML error page, a gateway "
    + "interstitial, or no body at all. THE UPSTREAM STATUS IS "
    + "RELAYED, not replaced: a 404 stays a 404 and a 200 stays a 200, "
    + "because what the backend said is evidence and this layer has "
    + "no better answer than the one it was given.",
} as const;

/** THE STATUS AN AUTHORED FINDING MAY TRAVEL UNDER, computed — never
 *  chosen at a call site.
 *
 *  The 2026-09-07 fix above is right and stays: a REACHED backend's
 *  status is a fact and a 404 must stay a 404. But relaying the status
 *  is only half a contract. `res.status` is what every reader in
 *  lib/*.ts branches on FIRST — `if (!res.ok) throw` — and under a 2xx
 *  they all fall through to "this is the payload". So when the upstream
 *  answered 2xx and the body was NOT a payload, relaying the 2xx hands
 *  the reader THIS LAYER'S OWN ERROR OBJECT typed as the thing it asked
 *  for:
 *
 *      getJson<SuggestionsResponse>  ->  { error: "…", upstream_status }
 *      fetchBoard                    ->  a Board with no `rows`
 *      wlJson<WatchlistState>        ->  a state with no `monitored_*`
 *
 *  Each of those renders as the branch that means THERE IS NOTHING —
 *  the same census-of-nothing the whole round closed one layer down.
 *  The three body-shape guards those readers gained ("a 200 is not a
 *  payload") cannot catch it either: this object IS an object, so it
 *  passes every one of them.
 *
 *  The wall is that the status is DERIVED from the upstream status
 *  rather than passed in. A non-2xx upstream relays unchanged, exactly
 *  as before. A 2xx cannot: the answer was not a payload, so 502 —
 *  "invalid response from the upstream server", which is literally the
 *  finding — and the upstream's own 2xx travels in `upstream_status`
 *  where it is evidence rather than a contract. `reason` is what tells
 *  this apart from `backend_unreachable`; a reader that words 502 as
 *  "unreachable" without reading `reason` is saying something this
 *  helper never claimed (`backend_body_unreadable` has answered 502 on
 *  a reached backend since 2026-09-07 and has the same requirement). */
export function statusForUnreadableAnswer(upstream: number): number {
  return upstream >= 200 && upstream < 300 ? 502 : upstream;
}

export async function proxy(
  req: NextApiRequest,
  res: NextApiResponse,
  backendPath: string
) {
  let r: Response;
  try {
    r = await fetch(`${BACKEND}${backendPath}`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["POST", "PUT"].includes(req.method || "") ? JSON.stringify(req.body) : undefined,
    });
  } catch (err) {
    // NEVER REACHED. Nothing upstream is known, so there is no status
    // to relay and no body to quote. This is the only 502 below.
    return res.status(502).json({
      error: "Backend unreachable",
      reason: "backend_unreachable",
      detail: String(err),
    });
  }
  // REACHED. From here the upstream status is a FACT and is relayed.
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    return res.status(502).json({
      error: "Backend unreachable",
      reason: "backend_body_unreadable",
      upstream_status: r.status,
      detail: `the backend answered ${r.status} and the body could not `
        + `be read to the end (${String(err)}) — this is not an `
        + "unreachable backend, and the status above is what it said",
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // AN ANSWER, NOT AN ABSENCE — and not a payload either. The
    // backend's own status is carried as `upstream_status`; the status
    // this response travels under is DERIVED (see
    // statusForUnreadableAnswer) so that a 2xx upstream cannot hand a
    // reader this object typed as the payload it asked for.
    res.status(statusForUnreadableAnswer(r.status));
    return res.json({
      error: "backend_response_not_json",
      reason: "backend_response_not_json",
      upstream_status: r.status,
      upstream_content_type: r.headers.get("content-type"),
      detail: `the backend answered ${r.status} with a body that is not `
        + `JSON (${raw.length} characters). That status is the `
        + "backend's own and is quoted above unchanged; the body is "
        + "quoted below rather than paraphrased. This is NOT an "
        + "unreachable backend, and it is NOT an empty payload.",
      body: raw.slice(0, RELAYED_BODY_CHARS),
      body_truncated: raw.length > RELAYED_BODY_CHARS,
    });
  }
  res.status(r.status).json(parsed);
}

// --------------------------------------------------------------------
// THE LEAGUE PROXY SURFACE, IN ONE PLACE
//
// Every `pages/api/<prefix>/[...path].ts` spelled out its own ALLOWED
// set, so the eight lists could only be compared by reading eight
// files — and they had drifted: the backend has served
// /api/ligamx/markets/discovery since the Liga MX plane shipped and
// this proxy 404'd it, exactly as it once 404'd `tournament` on comp
// and `coverage` on friendlies.
//
// WRITING THEM HERE DOES NOT MAKE THE GUARD DERIVED — it makes it
// POSSIBLE. A hand-typed list checked against another hand-typed list
// is one claim checked against a copy of itself. The real route
// surface is a thing the backend PUBLISHES: it is a FastAPI app with
// default settings, so it serves its whole path table at
// /openapi.json. `proxyAllowlistDrift()` below takes that document and
// returns the difference in BOTH directions, so a guard can assert on
// what the backend actually serves instead of on four hand-typed pairs
// — the shape that is why this drift survived an audit that named
// three others. WIRED 2026-09-07 by e2e/proxy-allowlists.spec.ts
// ("every allowlist agrees with the backend's own route table, both
// ways"); until then the function was written and uncalled, and this
// list was still only ever compared to a copy of itself.
export const LEAGUE_PROXY_ALLOWED: Record<string, readonly string[]> = {
  mls: ["scoreboard", "schedule", "standings", "markets", "odds",
        "approval"],
  // `markets/discovery` added 2026-09-07: the backend has served
  // /api/ligamx/markets/discovery all along (config.py names it as the
  // Liga MX discovery probe) and this list, copied from the MLS one
  // rather than from the route surface, never carried it.
  ligamx: ["scoreboard", "schedule", "standings", "markets",
           "markets/discovery", "odds", "status", "approval"],
  epl: ["scoreboard", "schedule", "standings", "markets",
        "markets/discovery", "odds", "approval"],
  // No `approval`: the backend has never served /api/laliga/approval
  // (mls, epl and ligamx have one; La Liga's approval state is read
  // from /status). The entry was copied from the EPL list and
  // forwarded to a backend 404 — e2e/proxy-allowlists.spec.ts pins the
  // refusal.
  laliga: ["scoreboard", "schedule", "standings", "markets", "odds",
           "status"],
  // THE FOUR LEAGUES THAT JOINED THE BOARD ON 2026-09-08 AND HAD NO
  // PROXY PREFIX AT ALL until 2026-09-15. Measured that day on
  // namson.dev: /api/bundesliga/standings, /api/seriea/standings,
  // /api/ligue1/standings and /api/eredivisie/standings each answered
  // NEXT'S HTML 404 PAGE — 3,729 bytes of `text/html` to a caller that
  // had asked for JSON — while the backend answered all four with a
  // real 200 table on the same request. `src/picker/tables.py` marks
  // these four `routed: False`, which is true of a MATCH HUB and was
  // read as true of the standings route too; the backend has served
  // their tables since the day they joined.
  //
  // ONE ROUTE EACH, AND ONLY ONE. Read off the backend's own
  // /openapi.json the same day: `/api/bundesliga/`, `/api/seriea/`,
  // `/api/ligue1/` and `/api/eredivisie/` hold exactly ONE path apiece
  // — `standings` — against epl's eight and mls's twenty. These leagues
  // serve no page of their own; they exist so a Champions League club
  // has a real ppg, GD/g, rank and tier (see LEAGUE_LABEL in
  // lib/pickerApi.ts), and so the board can rank them. A list copied
  // from the EPL one beside it would have forwarded scoreboard,
  // schedule, markets, odds and approval to a guaranteed backend 404 —
  // the `laliga/approval` shape this file already carries a scar for —
  // so these four stay exact. The drift guard checks both directions
  // against that document, so they cannot quietly stop being exact.
  bundesliga: ["standings"],
  seriea: ["standings"],
  ligue1: ["standings"],
  eredivisie: ["standings"],
  // Deliberately tiny: no standings (none exist for friendlies), no
  // odds, no admin. "coverage" was MISSING here once, so the backend
  // census route was unreachable from the deployed frontend.
  friendlies: ["scoreboard", "schedule", "markets", "coverage",
               "fixtures"],
  hunter: ["findings", "live-coverage"],
  xg: ["summary", "friendlies"],
  picker: ["board", "review"],
  // THE FIELD PAGE'S TWO READS (2026-09-23), both committed measurements
  // re-served by the backend: the league field off the union-corpus
  // bundle and the three cup fields off `read_axes`. GET-only on the
  // backend, no board assembly behind either, so nothing here can reach
  // the capture that `picker/board` does. Reached through the dynamic
  // `[league]/[...path].ts` proxy — no directory of its own, which is
  // the point of that file.
  field: ["leagues", "cups"],
  // THE CHAMPIONSHIPS BOARD (2026-09-24): the four national-team columns
  // in the club board's payload shape. ONE ROUTE, and it WRITES NOTHING —
  // unlike `picker/board`, whose every GET freezes a snapshot row, the
  // backend holds this one read-only by construction (its
  // tests/test_championships_route.py makes the club assembly and its
  // capture raise and the route still answers). Forwarded AHEAD of the
  // backend's deploy: see LEAGUE_PROXY_AHEAD.
  championships: ["board"],
  // COMP HAS NO LITERAL ROUTES — every one of its paths begins with a
  // competition KEY, so its whole surface lives in the id-route table
  // below. It is listed here anyway, with an empty list, because THIS
  // OBJECT'S KEY SET IS THE SET A DERIVED GUARD ITERATES: a prefix that
  // is not a key here is a prefix `proxyAllowlistDrift` is never asked
  // about, which is precisely how comp came to be the one proxy in the
  // tree still carrying the defect the other eight were audited for.
  // See COMP_RESOURCES.
  comp: [],
};

/** The comp proxy's resource set, as a pattern rather than a list.
 *
 *  WHY THIS IS THE ONE PREFIX WITH A REGEX. Every other proxy's routes
 *  are literals under a fixed prefix; comp's are `{key}/{resource}` for
 *  an OPEN set of competition keys (asean, leagues-cup, ucl, uel …), so
 *  the key cannot be enumerated and the resource must be matched
 *  positionally. The regex was already here — it lived inline in
 *  pages/api/comp/[...path].ts, which is exactly why it was invisible
 *  to the drift check that audits the other eight.
 *
 *  WHAT THAT COST, MEASURED 2026-09-07 against the backend's own route
 *  table (`@app.get("/api/comp/…")` in api/main.py): the backend serves
 *  SEVEN comp routes and this proxy forwarded four. The three it 404'd
 *  had no record anywhere, which is the same silent-subset shape as the
 *  Liga MX `markets/discovery` hole — and one of them is worse than
 *  that one was:
 *
 *    {key}/match/{event_id}  NOW FORWARDED. It is the per-match live
 *      read, and the backend's own docstring says why it exists: on the
 *      2026-09-02 Leagues Cup semi-final night the operator watched a
 *      live match with SCORE AND MINUTE ONLY because every competition
 *      outside the four league planes had no per-match route. The route
 *      was then built to close exactly that, mirrors
 *      /api/mls/match/{event_id} key for key — and the four league
 *      proxies forward THEIR twin while this one did not, so the fix
 *      shipped backend-first and could not be reached from the
 *      deployed frontend. Forwarding it exposes no class of data the
 *      mls/epl/laliga/ligamx proxies do not already forward.
 *    {key}/drift and {key}/journal  WITHHELD, with reasons, below.
 *
 *  A note on what this check still cannot see: `/api/comp` itself is a
 *  real backend route and does not start with `/api/comp/`, so
 *  `proxyAllowlistDrift` filters it out. That is not a hole — a bare
 *  `/api/comp` can never reach a NON-optional catch-all, so this proxy
 *  could not forward it whatever the list said. */
export const COMP_KEY = "[a-z][a-z-]{1,20}";
export const COMP_RESOURCES = ["fixtures", "markets", "ratings", "status",
                               "tournament"] as const;

/** Per prefix, the id-bearing routes the allowlist cannot spell out.
 *  Kept beside the list rather than typed into eight handlers, so a
 *  prefix that gains an id route gains it in one place. */
export const LEAGUE_PROXY_ID_ROUTES: Record<string, readonly RegExp[]> = {
  mls: [/^match\/\d{1,12}$/],
  ligamx: [/^match\/\d{1,12}$/],
  epl: [/^match\/\d{1,12}$/],
  laliga: [/^match\/\d{1,12}$/],
  friendlies: [/^match\/\d{1,12}$/, /^fixtures\/\d{1,12}$/],
  hunter: [],
  xg: [/^league\/\d{1,8}$/],
  picker: [],
  field: [],
  championships: [],
  comp: [
    new RegExp(`^${COMP_KEY}/(${COMP_RESOURCES.join("|")})$`),
    // the per-match live read — see COMP_RESOURCES for why this was the
    // loudest of the three holes
    new RegExp(`^${COMP_KEY}/match/\\d{1,12}$`),
  ],
};

/** ROUTES THIS PROXY FORWARDS BEFORE THE BACKEND IT TALKS TO SERVES
 *  THEM — registered, with the reason and the condition that retires the
 *  record, exactly like LEAGUE_PROXY_WITHHELD below, pointing the other
 *  way.
 *
 *  WHY THIS EXISTS AT ALL. The drift guard reads the DEPLOYED backend's
 *  /openapi.json and fails on any forwarded route that table does not
 *  list — the La Liga `approval` shape, a request travelling to a
 *  guaranteed 404 with this layer's blessing. A frontend that ships a
 *  route before its backend deploy is that shape for the length of the
 *  gap, and the honest way through it is to SAY so rather than to wait
 *  or to weaken the guard. A record here is excused from `unserved`; the
 *  moment the backend lists the route the record goes STALE and fails
 *  (`staleAhead`), so it cannot outlive the gap it describes.
 *
 *  In the gap a forwarded request reaches the backend's own 404, which
 *  the page names like any other failed read — never an empty board. */
export const LEAGUE_PROXY_AHEAD: Record<string, Record<string, string>> = {
  championships: {
    board: "GET /api/championships/board ships on the backend branch "
      + "`championships-integrated` (a994f9e) and is not on the deployed "
      + "backend yet. Retire this record when the deployed /openapi.json "
      + "lists /api/championships/board — the drift guard fails on it "
      + "from that moment.",
  },
};

/** ROUTES THE BACKEND SERVES THAT THIS PROXY DELIBERATELY DOES NOT
 *  FORWARD — registered, with the reason, one entry per route.
 *
 *  WHY A REGISTER AND NOT SILENCE. Run against the backend's own
 *  /openapi.json on 2026-09-07, `proxyAllowlistDrift` returned thirteen
 *  MLS routes the backend serves and this proxy 404s. Every one of them
 *  is a deliberate narrowing and NOT ONE OF THEM SAID SO ANYWHERE: the
 *  same silent-subset shape as the Liga MX discovery hole beside it,
 *  pointing the other way. A reader comparing the two lists could not
 *  tell a decision from an omission, which is the only thing that made
 *  `markets/discovery` survive an audit that named three other drifts.
 *
 *  So the check FAILS BOTH WAYS, which is what makes it converge:
 *  a served route in neither the allowlist nor this register is a NEW
 *  hole and fails; and a record here for a route the backend no longer
 *  serves is a record left standing after its condition closed, and
 *  fails too. Adding a route to the allowlist means deleting its record
 *  here — the two cannot both be true.
 *
 *  NONE OF THESE IS CALLED FROM ANY SURFACE IN src/ (checked 2026-09-07
 *  by enumerating every /api/<prefix>/ literal in the tree). If one is
 *  ever needed, the entry is removed and the route added above — that
 *  is the decision, taken once, in the open. */
export const LEAGUE_PROXY_WITHHELD: Record<string, Record<string, string>> = {
  mls: {
    // THE JOURNAL SURFACE. These carry stated size, price paid, P&L and
    // open exposure — the fields the journal's public projection
    // redacts and the reason the watched-strip route is `_admin_ok`
    // gated. namson.dev is public and this proxy injects no credential,
    // so forwarding them would put the operator's positions behind a
    // URL and nothing else.
    journal: "the personal journal: considered, taken and passed, with "
      + "the denominator. Positions, on a public frontend.",
    paper: "the paper-trading ledger's P&L — signals, fills, rejections "
      + "and settled economics. Positions, on a public frontend.",
    risk: "the risk engine's live state and CURRENT OPEN EXPOSURE. The "
      + "route calls itself public read-only; this proxy still does not "
      + "forward it, because exposure is a position figure and the "
      + "decision to publish one is not this file's to take.",
    // THE ANALYSIS SURFACE. Expensive by construction — the backend's
    // own comments put corpus / audit / model-eval in one cost class
    // (a rolling-origin ladder and a bootstrap over 300-510 fixtures) —
    // and none of it is read by a browser. A public proxy in front of
    // them is an unauthenticated way to spend the backend's CPU.
    corpus: "full-corpus assembly and download. The backend files it in "
      + "the same cost class as model-eval.",
    audit: "per-lock replay and hash recomputation. Same cost class.",
    "model-eval": "the rolling-origin ladder with a bootstrap over "
      + "300-510 fixtures. Same cost class.",
    "replay/{run_id}": "an independent reproducibility check that "
      + "replays a run from its stored input artifact. Operator "
      + "evidence, and expensive.",
    scorer: "settled journal rows scored — CLV, then calibration "
      + "against the market's Brier. Reads the journal.",
    slate: "the slate scorecard: every fixture on a matchday "
      + "classified. Operator evidence.",
    // THE OPERATIONAL SURFACE. Observability and per-fixture briefings
    // built for a live operator session, not for a page load.
    metrics: "scheduler health, quote freshness, lock success and "
      + "missed locks — observability, for the operator.",
    "briefing/{event_id}": "everything needed to reason about one "
      + "fixture right now, in one call. Built for a live session; the "
      + "public per-fixture surface is the card route.",
    "decision-sheet/{event_id}": "the same, at one instant. Built for a "
      + "live session, and no browser surface reads it.",
    "stats-coverage": "how many completed matches hold team, provider-xG "
      + "and player stats. An ingest verification read.",
  },
  // Keyed by the route's OPENAPI SPELLING, `{key}` included — that is
  // the string `proxyAllowlistDrift` compares against, so a record
  // written any other way would read as stale on the first run.
  comp: {
    "{key}/journal": "the personal journal for one viewer competition, "
      + "with its denominator: entries considered, taken and passed. "
      + "Positions, on a public frontend — the same reason the mls "
      + "journal is withheld above. src/pages/bet-suggester/leagues.tsx "
      + "already tells the reader the backend still serves it.",
    "{key}/drift": "how each leg of one Kalshi event has PRICED over "
      + "time. Withheld because it is EXPENSIVE BY CONSTRUCTION and "
      + "unread: the backend's own docstring records that folding it "
      + "into the fixtures payload means 100+ throttled candlestick "
      + "calls per page load and that the exchange 429s well before "
      + "that (measured 2026-08-10). A public proxy in front of it is "
      + "an unauthenticated way to spend the operator's exchange "
      + "quota. No surface in src/ reads it (checked 2026-09-07). If a "
      + "drift chart is ever built, this record is deleted and the "
      + "route added to COMP_RESOURCES — the two cannot both be true.",
  },
};

/** A concrete value to stand in for one OpenAPI path parameter, by the
 *  parameter's own name. Anything not named here probes as "1", which
 *  is right for every numeric id on this surface. */
export const OPENAPI_PROBE_VALUES: Record<string, string> = {
  // a competition key is a slug, never a number — "leagues-cup" is a
  // real one and carries the hyphen that broke an earlier regex
  key: "leagues-cup",
};

/** GUARDS THIS FILE HAS WRITTEN AND NOT WIRED — registered, because an
 *  unrun guard is prose and this file has already said what prose is
 *  worth. Empty is the correct state; a name parked here is a hole with
 *  a closing condition, not a shrug.
 *
 *  RETIRED 2026-09-07 — `allowlist_drift_unwired`. It recorded that
 *  `proxyAllowlistDrift` and LEAGUE_PROXY_WITHHELD had no caller, so
 *  the allowlists were checked only against typed pairs in
 *  e2e/proxy-allowlists.spec.ts — one claim checked against a copy of
 *  itself — and every drift named in this file (comp/match,
 *  ligamx/markets/discovery, laliga/approval, comp/tournament,
 *  friendlies/coverage) had been found by a person reading two lists
 *  rather than by a test. Its closing condition was that the spec fetch
 *  the backend's /openapi.json and assert, for every key of
 *  LEAGUE_PROXY_ALLOWED derived with Object.keys, that
 *  proxyAllowlistDrift returns unforwarded, unserved and staleWithheld
 *  all empty, failing loudly rather than skipping when the document
 *  cannot be read. That test now exists ("every allowlist agrees with
 *  the backend's own route table, both ways"), and the same spec pins
 *  the retirement both ways: the record may not still stand, and the
 *  register may not be emptied of records that still carry a hole. */
export const PROXY_GUARDS_OPEN: Record<string, {
  finding: string; closes_when: string;
}> = {};

/** An OWN entry of a slug-keyed table, or undefined.
 *
 *  `table[prefix]` is not the same question as "is `prefix` declared in
 *  this table", and the difference stopped being academic the day the
 *  prefix came out of the URL. `LEAGUE_PROXY_ALLOWED["constructor"]`
 *  answers with Object's constructor — TRUTHY, and with no `.includes`
 *  — so the guard below would have passed its `if (!list)` check and
 *  then thrown a TypeError, which Next renders as a 500 HTML page. A
 *  request that names nothing would have come back looking exactly like
 *  a broken server, which is the whole defect this round is about,
 *  arriving through the fix for it. `toString`, `valueOf` and
 *  `__proto__` are the same shape. */
function ownEntry<T>(table: Record<string, T>, prefix: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(table, prefix)
    ? table[prefix] : undefined;
}

/** True when `segs` is a route this prefix's proxy forwards. */
export function leagueRouteAllowed(prefix: string, segs: string): boolean {
  const list = ownEntry(LEAGUE_PROXY_ALLOWED, prefix);
  if (!list) return false;
  return list.includes(segs)
    || (ownEntry(LEAGUE_PROXY_ID_ROUTES, prefix) || []).some(
         (re) => re.test(segs));
}

/** WHY AN ABSENT ROUTE MAY NOT RENDER AS HTML.
 *
 *  Measured on namson.dev 2026-09-15: five slugs the board names —
 *  bundesliga, seriea, ligue1, eredivisie and the folded campeones —
 *  answered /api/<slug>/standings with Next's own 404 PAGE: 3,729 bytes
 *  of `text/html` beginning `<!DOCTYPE html>`. Every caller on this
 *  surface asks for JSON and parses what it gets, so that page does not
 *  arrive as "there is no such route". It arrives as whatever the
 *  parser does with a `<` — a SyntaxError in one reader, a null in
 *  another, a rendered census-of-nothing in a third — and not one of
 *  those says the route is absent. An absence and a breakage became
 *  indistinguishable, which is the same folding `proxy()` above was
 *  rewritten to refuse one layer down.
 *
 *  So a refusal is AUTHORED, in JSON, and it names which of two
 *  findings it is. Both travel under 404 — "not a thing here", as
 *  distinct from the 502 `proxy()` authors for "we could not get an
 *  answer" — and neither contacts a backend at all:
 *
 *    route_not_forwarded      the prefix IS a declared proxy and this
 *                             sub-path is not on its list. The refusal
 *                             the nine per-league handlers have always
 *                             authored.
 *    competition_not_proxied  no prefix is declared for this slug, so
 *                             nothing under it is forwarded. campeones
 *                             is the case that prompted this: it is
 *                             FOLDED into the mls and ligamx columns
 *                             rather than drawn as one of its own, and
 *                             the backend publishes no /api/campeones/
 *                             path of any kind (checked against
 *                             /openapi.json the same day), so a route
 *                             here would forward to a guaranteed 404.
 *
 *  `error` keeps the exact sentence the nine handlers already emitted —
 *  every guard in e2e/proxy-allowlists.spec.ts reads it — and the rest
 *  is added beside it rather than in place of it. */
export type LeagueRouteRefusal = {
  error: string;
  reason: "route_not_forwarded" | "competition_not_proxied";
  competition: string;
  /** Only when a name is actually known. A prefix like `comp` or
   *  `hunter` has none, and inventing one from the slug would put a
   *  machine key where a reader expects a competition. */
  competition_name?: string;
  route: string;
  detail: string;
};

/** A path segment, bounded and stripped, safe to quote back. The prefix
 *  and the sub-path both come from the URL now, so neither is echoed
 *  unedited. */
const quotable = (s: string, max: number) =>
  s.replace(/[^A-Za-z0-9/_.-]/g, "").slice(0, max) || "(unnamed)";

export function leagueRouteRefusal(
  prefix: string, segs: string
): LeagueRouteRefusal {
  const slug = quotable(prefix, 40);
  const route = quotable(segs, 120);
  const declared = ownEntry(LEAGUE_PROXY_ALLOWED, prefix) !== undefined;
  const name = ownEntry(LEAGUE_LABEL, prefix);
  return {
    error: `unknown ${slug} route`,
    reason: declared ? "route_not_forwarded" : "competition_not_proxied",
    competition: slug,
    ...(name ? { competition_name: name } : {}),
    route,
    detail: declared
      ? `the ${slug} proxy forwards a named set of routes and `
        + `"${route}" is not one of them (GET only). This refusal is `
        + "authored here: no backend was contacted, so it is not an "
        + "upstream 404 and not a failure of one."
      : `${name ? `${name} (${slug})` : `"${slug}"`} has no proxy prefix `
        + "in this frontend, so no route under it is forwarded — "
        + "standings included. That is a declaration in "
        + "LEAGUE_PROXY_ALLOWED, not a breakage: no backend was "
        + "contacted. An absent route is a fact, and this JSON says so "
        + "where Next's HTML 404 page could only be guessed at.",
  };
}

/** The refusal, written to the response. One line at every call site so
 *  the shape cannot drift between the ten handlers that author it. */
export function refuseLeagueRoute(
  res: NextApiResponse, prefix: string, segs: string
) {
  return res.status(404).json(leagueRouteRefusal(prefix, segs));
}

/** One prefix's drift against the backend's OWN published path table.
 *
 *  `paths` is the `paths` object of the backend's /openapi.json — the
 *  real route surface, not a copy of this file. Returns both
 *  directions, because each is a different defect:
 *
 *    unforwarded  the backend serves it and this proxy 404s it. The
 *                 Liga MX discovery shape: a working backend route
 *                 that no browser can reach.
 *    unserved     this proxy forwards it and the backend has no such
 *                 route. The La Liga `approval` shape: a request that
 *                 travels to a guaranteed 404 with the proxy's blessing.
 *
 *  A route with a `{param}` segment is reported under its literal
 *  OpenAPI spelling; the id patterns above are matched against it so a
 *  templated path this proxy DOES forward is not reported as a hole.
 */
export function proxyAllowlistDrift(
  prefix: string,
  paths: Record<string, unknown>
): { unforwarded: string[]; unserved: string[]; staleWithheld: string[];
     staleAhead: string[] } {
  const head = `/api/${prefix}/`;
  const served = Object.keys(paths)
    .filter((p) => p.startsWith(head))
    .map((p) => p.slice(head.length));
  const idRe = LEAGUE_PROXY_ID_ROUTES[prefix] || [];
  const withheld = LEAGUE_PROXY_WITHHELD[prefix] || {};
  // A templated segment stands for the ids the pattern accepts, so a
  // pattern that would match a concrete id under this template counts
  // the route as forwarded rather than missing.
  //
  // The substitution is PER PARAMETER NAME, read out of the backend's
  // own spelling of the path. It was a bare "1", which is a fine stand-
  // in for `{event_id}` / `{fixture_id}` / `{run_id}` and a wrong one
  // for `{key}`: a competition key is a slug, so every comp route
  // probed as "1/fixtures" and could never match a pattern written for
  // the keys the backend actually takes. A guard that cannot match
  // reports every route as a hole, which is as useless as one that
  // matches everything.
  const probe = (tpl: string) => tpl.replace(
    /\{([^}]+)\}/g, (_m, name: string) => OPENAPI_PROBE_VALUES[name] ?? "1");
  // A NEW HOLE: the backend serves it, the proxy 404s it, and nobody
  // has written down that this was a decision.
  const unforwarded = served.filter((s) =>
    !(LEAGUE_PROXY_ALLOWED[prefix] || []).includes(s)
    && !Object.prototype.hasOwnProperty.call(withheld, s)
    && !idRe.some((re) => re.test(probe(s))));
  // FORWARDED TO A GUARANTEED 404 — the La Liga `approval` shape.
  const servedProbes = new Set(served.map(probe));
  const ahead = LEAGUE_PROXY_AHEAD[prefix] || {};
  const isAhead = (a: string) =>
    Object.prototype.hasOwnProperty.call(ahead, a);
  const unserved = (LEAGUE_PROXY_ALLOWED[prefix] || [])
    .filter((a) => !served.includes(a) && !servedProbes.has(a)
      && !isAhead(a));
  // …AND AN "AHEAD" RECORD THE BACKEND HAS CAUGHT UP WITH, or one naming
  // a route this proxy does not even forward. Either way it is prose
  // that outlived the gap it described.
  const staleAhead = Object.keys(ahead).filter((a) =>
    served.includes(a) || servedProbes.has(a)
    || !(LEAGUE_PROXY_ALLOWED[prefix] || []).includes(a));
  // A RECORD LEFT STANDING AFTER ITS CONDITION CLOSED. The register
  // names a route the backend no longer serves, or one the allowlist
  // has since adopted — either way the prose has outlived the hole,
  // which is the failure the register exists to prevent.
  const allowed = new Set(LEAGUE_PROXY_ALLOWED[prefix] || []);
  const staleWithheld = Object.keys(withheld)
    .filter((w) => !served.includes(w) || allowed.has(w));
  return {
    unforwarded: unforwarded.sort(),
    unserved: [...unserved].sort(),
    staleWithheld: staleWithheld.sort(),
    staleAhead: staleAhead.sort(),
  };
}

// --------------------------------------------------------------------
// THE SAME SPLIT, FOR THE HAND-WRITTEN PROXIES
//
// `proxy()` above is used by 30-odd routes; five more are written by
// hand because they resolve an identity, forward exactly one header, or
// pass bytes through unedited. Every one of them had the SAME shape the
// helper had — the fetch AND the body read inside one `try`, with a
// single 502 "Backend unreachable" at the bottom — so a resolver that
// answered 200 with an HTML error page was reported to the surface as a
// backend that was never contacted. In resolve.ts it was worse than a
// wrong word: one unparseable answer threw out of the worker pool and
// took every successfully resolved id on the batch with it.
//
// These two helpers exist so the split is made once instead of five
// times. Neither invents a sentence: each returns the evidence and lets
// the route say what it means in its own words.

/** A backend read that keeps "never reached" apart from "answered". */
export type Reached =
  | { reached: true; res: Response }
  | { reached: false; detail: string };

/** fetch(), with the throw turned into a value. NOTHING else is inside
 *  the try — the body is read by `readJson` below, so a body that
 *  cannot be parsed can never be reported as a backend that was never
 *  contacted. */
export async function reach(url: string, init?: RequestInit):
    Promise<Reached> {
  try {
    return { reached: true, res: await fetch(url, init) };
  } catch (err) {
    return { reached: false, detail: String(err) };
  }
}

/** A response body, parsed, or a NAMED reason it could not be. `raw` is
 *  null only when the stream itself broke — which is a different fact
 *  from a body that arrived and is not JSON, and the two are never
 *  folded. */
export type ParsedBody =
  | { ok: true; raw: string; body: unknown }
  | { ok: false; raw: string | null; why: string };

export async function readJson(r: Response): Promise<ParsedBody> {
  let raw: string;
  try {
    raw = await r.text();
  } catch (err) {
    return { ok: false, raw: null,
             why: `the backend answered ${r.status} and the body could `
                + `not be read to the end (${String(err)})` };
  }
  try {
    return { ok: true, raw, body: JSON.parse(raw) };
  } catch {
    return { ok: false, raw,
             why: `the backend answered ${r.status} with a body that is `
                + `not JSON (${raw.length} characters, content-type `
                + `${r.headers.get("content-type") ?? "absent"})` };
  }
}

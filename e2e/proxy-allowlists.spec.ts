import { test, expect } from "@playwright/test";
import { BACKEND_URL } from "./backend";
import {
  COMP_RESOURCES,
  LEAGUE_PROXY_ALLOWED,
  OPENAPI_PROBE_VALUES,
  PROXY_GUARDS_OPEN,
  leagueRouteAllowed,
  proxyAllowlistDrift,
} from "../src/lib/suggesterProxy";

// The league and hunter proxies under src/pages/api/*/[...path].ts each
// forward a set spelled out in LEAGUE_PROXY_ALLOWED, and every other
// spec mocks fetch in the BROWSER, so the allowlists are never
// exercised by them — which is how the comp proxy 404'd a real backend
// route on prod behind nine green specs (see e2e/picker.spec.ts,
// "unmocked on purpose"). The requests here hit the real dev server.
// Whatever the backend answers (payload, error, unreachable), the ONE
// response that proves the allowlist rejected a route is the proxy's
// own 404 body, and the one that proves it forwards a route it must
// not is the absence of that body.
//
// Audit of 2026-09-03: the laliga list carried `approval`, a route the
// backend has never served (only mls, epl and ligamx have one); the mls
// and ligamx lists omitted theirs; hunter omitted `live-coverage`. Each
// case below went red against the previous build before it went green.
//
// ======================================================================
// REWRITTEN 2026-09-07 — WHAT THIS GUARD ASKS, AND WHOM IT ASKS
//
// This file used to name the drift rule and then enumerate FOUR typed
// [prefix, resource] pairs. That is the shape that lets the omitted
// case drift, and it already had: `ligamx/markets/discovery` was 404'd
// by the proxy while the backend served it all along, and no pair
// covered it.
//
// The first repair derived the pairs from LEAGUE_PROXY_ALLOWED and
// fired one unmocked request per pair — 38 of them, against the live
// shadow backend. IT COULD NOT CATCH THE DEFECT IT WAS WRITTEN FOR. A
// test derived from the allowlist can only ask about routes the
// allowlist already names, and `markets/discovery` was missing FROM
// that list, so a derivation over it is silent about exactly the case
// four typed pairs were silent about. What the fan-out did do was
// measurable: +43s of backend work per suite run (five `markets` reads
// at 2.2-5.6s each and `picker/review` at 9.1s, timed against an idle
// backend), on the single Railway instance five Playwright workers
// already share with every other unmocked spec. Four live-data tests
// in three other files then blew their 45s deadline — including a
// second, concurrent read of `picker/review`. The guard's own cost
// broke the suite around it.
//
// So the question is now put to the party that can answer it. The
// backend PUBLISHES its route table at /openapi.json, and comparing
// the allowlists against that document catches BOTH directions at
// once — a served route this proxy 404s (the Liga MX shape) and a
// forwarded route the backend never served (the La Liga shape) — for
// ONE cheap fetch instead of 38 live reads, while seeing the routes
// the allowlist does not name, which no derivation over the allowlist
// ever can. `proxyAllowlistDrift()` and LEAGUE_PROXY_WITHHELD were
// written for this and had no caller; src/lib/suggesterProxy.ts
// recorded that as PROXY_GUARDS_OPEN.allowlist_drift_unwired with a
// closing condition, and the drift test below is that condition, met.
// The record is retired, and the last test here pins the retirement
// both ways.
//
// The real requests that remain are the ones only a real request can
// make: that a URL reaches the right proxy file, that the file
// consults ITS OWN list, and that an allowed route is forwarded rather
// than refused. They are per PREFIX, derived with Object.keys so no
// proxy can be left out of the question, and every refusal among them
// is authored locally before any backend is contacted.
// ======================================================================

/** Every proxy prefix, from the object the handlers themselves read. */
const PREFIXES = Object.keys(LEAGUE_PROXY_ALLOWED);

/** Every [prefix, resource] pair the proxies forward, derived. */
const FORWARDED: Array<[string, string]> = Object.entries(
  LEAGUE_PROXY_ALLOWED).flatMap(([prefix, list]) =>
    list.map((resource) => [prefix, resource] as [string, string]));

test("the derived set is not vacuous and matches the allowlist exactly",
  async () => {
    // A derivation that quietly produced [] would make every claim
    // below true by never being about anything. It is pinned against
    // the source it derives from, both ways.
    expect(FORWARDED.length).toBeGreaterThanOrEqual(30);
    expect(PREFIXES.length).toBeGreaterThanOrEqual(7);
    const total = Object.values(LEAGUE_PROXY_ALLOWED)
      .reduce((n, l) => n + l.length, 0);
    expect(FORWARDED.length).toBe(total);
  });

test("every allowlist agrees with the backend's own route table, both ways",
  async ({ request }) => {
    // THE DOCUMENT IS THE POINT. Not a copy of the allowlist and not a
    // second hand-list: the path table the backend serves out of its
    // own router. Read from BACKEND_URL, which is the value the app
    // under test is proxying to (e2e/backend.ts), so this cannot come
    // back clean about a server the app never talks to.
    const r = await request.get(`${BACKEND_URL}/openapi.json`);
    expect(r.ok(), "the backend's route table could not be fetched from "
      + `${BACKEND_URL}/openapi.json (${r.status()}). This FAILS rather `
      + "than skips: an unread document is an unchecked allowlist, not "
      + "a clean one, and skipping here would report a hole nobody "
      + "looked for as an absence of holes").toBeTruthy();
    const doc = await r.json() as { paths?: Record<string, unknown> };
    const paths = doc.paths ?? {};
    const apiPaths = Object.keys(paths).filter((p) => p.startsWith("/api/"));
    expect(apiPaths.length, "the document parsed to no /api/ paths at "
      + "all — every allowlist would then read as fully forwarded and "
      + "fully served, which is the vacuous pass this assertion exists "
      + "to refuse").toBeGreaterThan(50);

    // EVERY PAIR, STILL — read off the table rather than fetched in 38
    // round trips, and named one by one so a failure says which pair.
    const served = new Set(apiPaths);
    const unserved = FORWARDED.filter(
      ([p, res]) => !served.has(`/api/${p}/${res}`));
    expect(unserved, "forwarded by the proxy and served by nothing — "
      + "each of these travels to a guaranteed backend 404 with this "
      + "layer's blessing (the La Liga `approval` shape)").toEqual([]);

    // AND THE DIRECTION NO DERIVATION OVER THE ALLOWLIST CAN SEE: a
    // route the backend serves that this proxy refuses, and a withheld
    // record left standing after its condition closed.
    const findings: string[] = [];
    for (const prefix of PREFIXES) {
      const d = proxyAllowlistDrift(prefix, paths);
      if (d.unforwarded.length) {
        findings.push(`${prefix}: the backend serves and this proxy 404s `
          + `${d.unforwarded.join(", ")} — either forward it or register `
          + "it in LEAGUE_PROXY_WITHHELD with the reason");
      }
      if (d.unserved.length) {
        findings.push(`${prefix}: forwarded to a backend that serves no `
          + `such route: ${d.unserved.join(", ")}`);
      }
      if (d.staleWithheld.length) {
        findings.push(`${prefix}: LEAGUE_PROXY_WITHHELD still records `
          + `${d.staleWithheld.join(", ")}, which the backend no longer `
          + "serves or the allowlist has since adopted — the prose has "
          + "outlived the hole it describes");
      }
    }
    expect(findings).toEqual([]);
  });

/** Every resource any proxy forwards, so a prefix can be handed one of
 *  somebody else's. */
const ALL_RESOURCES = [...new Set(
  Object.values(LEAGUE_PROXY_ALLOWED).flat())].sort();

/** Per prefix, a resource ANOTHER prefix forwards and this one must
 *  not. Derived, so no proxy is left out of the question. */
const FOREIGN: Array<[string, string | undefined]> = PREFIXES.map(
  (prefix) => [prefix,
    ALL_RESOURCES.find((res) => !leagueRouteAllowed(prefix, res))]);

test("every prefix has a foreign resource to be asked about", async () => {
  // Non-vacuity for the loop below: a prefix whose foreign resource
  // came back undefined would be silently unasked, which is the
  // omitted-case shape this whole file is about.
  expect(FOREIGN.length).toBe(PREFIXES.length);
  expect(FOREIGN.filter(([, res]) => !res)).toEqual([]);
});

for (const [prefix, resource] of FOREIGN) {
  test(`the ${prefix} proxy refuses ${resource}, which is another list's`,
    async ({ request }) => {
      // THE COPY-PASTE DEFECT, ASKED OF EVERY PROXY. Each handler calls
      // leagueRouteAllowed("<its own prefix>", segs) with the prefix
      // typed into the file — nine near-identical files, and a wrong
      // literal in one of them would forward another league's set while
      // every forwarding test stayed green. `laliga/approval` further
      // down is the case that actually shipped; this asks it of all
      // nine, derived.
      //
      // HERMETIC AND CHEAP BY CONSTRUCTION: a refusal is authored
      // before any fetch, so this contacts no backend at all.
      const r = await request.get(`/api/${prefix}/${resource}`);
      expect(r.status()).toBe(404);
      expect(await r.text()).toContain(`unknown ${prefix} route`);
    });
}

/** Per prefix, one resource it really does forward: the first entry on
 *  its own list — a RULE, not a chosen pair. `comp` has no literal
 *  list (its whole surface is `{key}/{resource}`), so it probes the
 *  first COMP_RESOURCES entry under a real competition key. */
const PROBE: Array<[string, string]> = PREFIXES.map((prefix) => {
  const list = LEAGUE_PROXY_ALLOWED[prefix];
  return [prefix, list.length ? list[0]
    : `${OPENAPI_PROBE_VALUES.key}/${COMP_RESOURCES[0]}`];
});

test("every prefix is probed for forwarding, none skipped", async () => {
  expect(PROBE.length).toBe(PREFIXES.length);
  expect(PROBE.filter(([, res]) => !res)).toEqual([]);
});

for (const [prefix, resource] of PROBE) {
  test(`the ${prefix} proxy forwards ${resource} — unmocked on purpose`,
    async ({ request }) => {
      // What a real request adds that the route table cannot: that this
      // URL reaches this handler, gets past the allowlist, and is
      // rewritten into a backend path. Whatever the backend answers,
      // the one response that would prove the allowlist rejected the
      // route is the proxy's own 404 body.
      const r = await request.get(`/api/${prefix}/${resource}`);
      expect(await r.text(), `${resource} rejected by the proxy allowlist`)
        .not.toContain(`unknown ${prefix} route`);
    });
}

test("the laliga proxy refuses approval, which the backend never served",
  async ({ request }) => {
    // Hermetic: the allowlist answers before any backend is contacted,
    // so this holds with no backend at all. Kept as its own test after
    // the derived pass above because it is the case that shipped, and a
    // named regression outlives the derivation that generalised it.
    const r = await request.get("/api/laliga/approval");
    expect(r.status()).toBe(404);
    expect(await r.text()).toContain("unknown laliga route");
  });

test("each proxy still refuses a route that is on no list",
  async ({ request }) => {
    // DERIVED over every prefix (2026-09-07). This used to name four of
    // the nine — mls, ligamx, laliga, hunter — which is the same
    // hand-typed subset this file's header calls out: the five it
    // omitted could each have forwarded anything without failing here.
    for (const prefix of PREFIXES) {
      const r = await request.get(`/api/${prefix}/decision`);
      expect(r.status(), `${prefix}/decision must be refused`).toBe(404);
      expect(await r.text()).toContain(`unknown ${prefix} route`);
    }
  });

test("the drift guard is wired, and the record that said it was not is gone",
  async () => {
    // BOTH WAYS, exactly like the withheld register it retires. The
    // record's closing condition was: this spec fetches
    // ${SUGGESTER_BACKEND_URL}/openapi.json and asserts
    // proxyAllowlistDrift returns all three lists empty for every key
    // of LEAGUE_PROXY_ALLOWED, failing loudly rather than skipping.
    // That is the test above, so a record still standing here is prose
    // that has outlived its hole.
    expect(Object.keys(PROXY_GUARDS_OPEN))
      .not.toContain("allowlist_drift_unwired");
    // ...and emptying the register is not the way to pass this: a
    // record that remains must still carry a finding and the condition
    // that closes it, so a future hole cannot be parked here mute.
    for (const [name, rec] of Object.entries(PROXY_GUARDS_OPEN)) {
      expect(rec.finding.length, name).toBeGreaterThan(30);
      expect(rec.closes_when.length, name).toBeGreaterThan(30);
    }
  });

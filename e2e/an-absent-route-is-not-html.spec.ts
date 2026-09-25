import { test, expect } from "@playwright/test";
import { LIVE_TAG } from "./backend";
import { liveGet, unanswered } from "./live-read";
import {
  LEAGUE_PROXY_ALLOWED,
  leagueRouteAllowed,
} from "../src/lib/suggesterProxy";
import { LEAGUE_LABEL, PICKER_COLUMN_ORDER } from "../src/lib/pickerApi";

// ======================================================================
// AN ABSENT ROUTE IS NOT A BROKEN ONE, AND NEITHER IS AN HTML PAGE.
//
// Measured on namson.dev 2026-09-15, GET /api/<slug>/standings:
//
//   epl, laliga, mls, ligamx     200 application/json  (a real table)
//   bundesliga, seriea,          404 text/html         3,729 bytes,
//   ligue1, eredivisie                                 `<!DOCTYPE html>`
//   campeones                    404 text/html         the same page
//
// The backend answered ALL EIGHT leagues with a real 200 table on the
// same day (checked against its own /openapi.json: those four new
// prefixes publish exactly one path apiece, `standings`). So four
// working backend routes were unreachable from the deployed frontend —
// the `markets/discovery` shape — and the ninth, the folded Campeones
// Cup, had nothing to serve at all. BOTH CAME BACK AS THE SAME BYTES.
//
// That is the defect this file is about, and it is not the 404. It is
// that an HTML error page is not an answer a JSON caller can read: it
// arrives as whatever the parser does with a `<`, which is a
// SyntaxError in one reader and a null in the next, and NONE of those
// says "there is no such route". An absence and a breakage became
// indistinguishable.
//
// So these tests ask two things a route table cannot: that every column
// the operator declared can actually be READ through the proxy, and
// that the ones with nothing behind them REFUSE IN JSON, naming what
// they are refusing and why.
//
// Every claim here is derived from a registry rather than typed, and
// every absence is asserted in the same test as its presence — an
// assertion that something is missing proves nothing unless the same
// request shape is shown working.
// ======================================================================

/** The prefixes the proxies admit, from the object the handlers read. */
const PROXY_PREFIXES = Object.keys(LEAGUE_PROXY_ALLOWED);

/** Is this response Next's error PAGE rather than an authored answer? */
const looksLikeHtml = (ct: string | undefined, body: string) =>
  (ct ?? "").includes("text/html") || body.trimStart().startsWith("<");

/** THE KEYS A STANDINGS PAYLOAD GROUPS ITS RANKED CLUBS UNDER.
 *
 *  MEASURED AGAINST THE ROUTE, not assumed from one league. Seven of
 *  the eight columns answer with `tables` — one table apiece — and MLS
 *  answers with `conferences`, Eastern and Western, because that is the
 *  shape MLS's table actually has. The first draft of this file knew
 *  only `tables` and called a perfectly correct MLS payload a broken
 *  one, which is this tree's own recurring lesson: a fixture that
 *  speaks the code's vocabulary instead of the feed's certifies a bug. */
const GROUP_KEYS = ["tables", "conferences"] as const;

/** The groups of ranked clubs, or null. An unrecognised shape is NEVER
 *  folded into "empty" — the caller names the keys it actually got. */
function clubGroups(parsed: Record<string, unknown>): unknown[] | null {
  for (const key of GROUP_KEYS) {
    const v = parsed[key];
    if (Array.isArray(v)) return v;
  }
  return null;
}

/** A standings response that really is a table of clubs. Returns how
 *  many clubs were in its first group, so a caller can prove the
 *  payload is not merely well-shaped and empty. */
function clubsInFirstGroup(body: string, where: string): number {
  const parsed = JSON.parse(body) as Record<string, unknown>;
  const groups = clubGroups(parsed);
  expect(groups, `${where} parsed, but groups its clubs under none of `
    + `[${GROUP_KEYS.join(", ")}] — got keys `
    + `[${Object.keys(parsed).join(", ")}]`).not.toBeNull();
  expect(groups!.length, `${where} carries an EMPTY group list`)
    .toBeGreaterThan(0);
  const first = groups![0] as { entries?: unknown[] };
  return first.entries?.length ?? 0;
}

test("the operator's declared columns are a real set, and each one has a "
  + "proxy prefix", async () => {
    // THE TIE THAT WOULD HAVE CAUGHT THIS. PICKER_COLUMN_ORDER gained
    // bundesliga, seriea, ligue1 and eredivisie on 2026-09-08 and
    // LEAGUE_PROXY_ALLOWED did not, so the board drew four columns whose
    // data route answered in HTML. The two lists are different facts —
    // one is the reading order of the board, the other is what may be
    // proxied — but a column with no prefix is a column the frontend
    // cannot read, and that is checkable here rather than on prod.
    //
    // Non-vacuity first: a derivation that quietly produced [] would
    // make the claim below true by never being about anything.
    expect(PICKER_COLUMN_ORDER.length).toBeGreaterThanOrEqual(8);
    expect(PROXY_PREFIXES.length).toBeGreaterThanOrEqual(7);

    const unproxied = PICKER_COLUMN_ORDER.filter(
      (slug) => !Object.prototype.hasOwnProperty.call(
        LEAGUE_PROXY_ALLOWED, slug));
    expect(unproxied, "declared as a board column and carrying no proxy "
      + "prefix — the frontend draws the column and cannot read a single "
      + "route behind it. Add the slug to LEAGUE_PROXY_ALLOWED with the "
      + "routes the backend actually serves for it")
      .toEqual([]);

    // ...and every one of them can be asked for a table, which is the
    // one route all eight columns share. Hermetic: the allowlist
    // answers with no backend at all.
    const noStandings = PICKER_COLUMN_ORDER.filter(
      (slug) => !leagueRouteAllowed(slug, "standings"));
    expect(noStandings, "a board column whose standings route is not "
      + "forwarded").toEqual([]);
  });

for (const slug of PICKER_COLUMN_ORDER) {
  test(`the ${slug} column's standings proxy answers JSON, not a page — `
    + "unmocked on purpose", { tag: LIVE_TAG }, async ({ request }) => {
      // WHAT ONLY A REAL REQUEST CAN SAY. The allowlist test above is
      // hermetic and would stay green if no handler file existed at
      // all: four of these eight had an allowlist entry and no
      // directory for a week, and that is precisely the state that
      // rendered HTML. This asks the deployed route surface whether the
      // URL reaches a handler, clears the allowlist, and comes back as
      // something a JSON caller can parse.
      // BOUNDED, AND AN UNANSWERED READ IS NOT AN HTML PAGE. Eight of
      // these go to the live backend in one file; on 2026-09-23 one of
      // them held a 45s budget open and this test's name was printed
      // under "failed", which reads as the defect it exists for — the
      // route answering with Next's HTML 404. It had answered nothing.
      // The claim is read off the answer, so no answer is a skip with
      // its reason named; every assertion below is unchanged.
      const r = await liveGet(request, `/api/${slug}/standings`);
      test.skip(!r, unanswered(`/api/${slug}/standings`));
      if (!r) return;
      const body = await r.text();
      const ct = r.headers()["content-type"];

      expect(looksLikeHtml(ct, body),
        `/api/${slug}/standings came back as an HTML page (${ct}, `
        + `${body.length} bytes). A JSON caller cannot tell that from a `
        + "broken backend — which is the whole of this defect")
        .toBe(false);
      expect(r.status(), `/api/${slug}/standings`).toBe(200);

      // AND IT IS A TABLE OF CLUBS, not merely valid JSON. A refusal is
      // also JSON, so parsing alone would pass on the very failure
      // above.
      expect(clubsInFirstGroup(body, `/api/${slug}/standings`),
        `/api/${slug}/standings returned a table with no clubs in it`)
        .toBeGreaterThan(0);
    });
}

test("the folded Campeones Cup is refused BY NAME in JSON, while a league "
  + "that has a table still answers with one", { tag: LIVE_TAG },
  async ({ request }) => {
    // THE NINTH SLUG, AND WHY IT GETS NO ROUTE. campeones is FOLDED:
    // its one fixture is drawn in the MLS and Liga MX columns rather
    // than in a column of its own, and the backend publishes no
    // /api/campeones/ path of ANY kind (checked against its
    // /openapi.json on 2026-09-15 — zero paths, against one apiece for
    // the four new leagues). A proxy route for it would forward to a
    // guaranteed backend 404, which is the `laliga/approval` shape this
    // tree already carries a scar for. So the decision is that there is
    // no route — and the job of this test is that the decision READS as
    // one instead of as a breakage.
    expect(Object.prototype.hasOwnProperty.call(
      LEAGUE_PROXY_ALLOWED, "campeones"),
      "campeones has acquired a proxy prefix. If the backend now serves "
      + "it, this test is what has to change — deliberately, with the "
      + "route table as the evidence").toBe(false);

    // The competition is NAMED, and the name is real rather than the
    // slug falling through — otherwise the assertion below would
    // compare undefined to undefined and hold for the wrong reason.
    const name = LEAGUE_LABEL.campeones;
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(3);
    expect(name).not.toBe("campeones");

    const r = await request.get("/api/campeones/standings");
    const body = await r.text();
    const ct = r.headers()["content-type"];

    expect(looksLikeHtml(ct, body),
      "the absent route came back as Next's HTML page again").toBe(false);
    expect(ct).toContain("application/json");
    // 404 is "not a thing here". The 502 proxy() authors is "we could
    // not get an answer" — a different finding, and this must never
    // wear it.
    expect(r.status()).toBe(404);

    const refusal = JSON.parse(body) as Record<string, string>;
    expect(refusal.reason).toBe("competition_not_proxied");
    expect(refusal.competition).toBe("campeones");
    expect(refusal.competition_name).toBe(name);
    expect(refusal.detail.length).toBeGreaterThan(40);

    // NON-VACUITY, IN THIS TEST RATHER THAN IN A NEIGHBOURING ONE. A
    // refusal proves nothing if the same request shape refuses
    // everything: a frontend that had simply stopped serving
    // /api/*/standings would pass every assertion above. So the same
    // path, one slug over, on a competition that really does have a
    // table.
    // THE CONTROL IS LIVE, AND AN UNANSWERED CONTROL CONTROLS NOTHING.
    // Its own comment says the refusal above proves nothing without it,
    // so a backend that did not answer takes the whole test with it —
    // as a skip naming why, never as a refusal that failed.
    const ok = await liveGet(request, "/api/mls/standings");
    test.skip(!ok, unanswered("/api/mls/standings"));
    if (!ok) return;
    expect(ok.status(), "the control request failed, so the refusal "
      + "above is not evidence of anything").toBe(200);
    expect(clubsInFirstGroup(await ok.text(), "/api/mls/standings"),
      "the control request came back with no clubs, so the refusal "
      + "above is not evidence of anything").toBeGreaterThan(0);
  });

test("a declared prefix refuses an undeclared sub-path as a DIFFERENT "
  + "finding from a competition with no prefix", { tag: LIVE_TAG },
  async ({ request }) => {
    // The two refusals are not the same fact and must not read as one.
    // bundesliga is a declared prefix that forwards exactly one route,
    // so `markets` is a sub-path refusal; campeones has no prefix at
    // all. Both are 404 JSON; only `reason` tells them apart, and a
    // caller deciding whether to retry, to drop the column or to report
    // a bug needs that difference.
    const sub = await request.get("/api/bundesliga/markets");
    expect(sub.status()).toBe(404);
    const subBody = JSON.parse(await sub.text()) as Record<string, string>;
    expect(subBody.reason).toBe("route_not_forwarded");
    expect(subBody.error).toBe("unknown bundesliga route");
    expect(subBody.route).toBe("markets");

    const none = JSON.parse(
      await (await request.get("/api/campeones/markets")).text()
    ) as Record<string, string>;
    expect(none.reason).toBe("competition_not_proxied");
    expect(subBody.reason).not.toBe(none.reason);

    // NON-VACUITY: the prefix that refused `markets` is not refusing
    // everything — its one real route still forwards.
    // Live, and the same reasoning as the control above: without it the
    // two refusals are not evidence that the prefix still forwards.
    const ok = await liveGet(request, "/api/bundesliga/standings");
    test.skip(!ok, unanswered("/api/bundesliga/standings"));
    if (!ok) return;
    expect(ok.status(), "bundesliga refuses its own standings route, so "
      + "the refusal above says nothing about sub-paths").toBe(200);
  });

/** Keys that answer TRUTHILY on any plain object. The prefix now comes
 *  out of the URL, so these reach the allowlist lookup as candidate
 *  league slugs. */
const PROTOTYPE_KEYS = ["constructor", "__proto__", "toString", "valueOf"];

for (const key of PROTOTYPE_KEYS) {
  test(`the generic proxy refuses "${key}" in JSON rather than throwing `
    + "a 500 page", async ({ request }) => {
      // THE HAZARD THE DYNAMIC SEGMENT INTRODUCED. `LEAGUE_PROXY_ALLOWED
      // ["constructor"]` is Object's constructor: truthy, and with no
      // `.includes`. Before `ownEntry`, the guard would have passed its
      // `if (!list)` check and then thrown a TypeError, which Next
      // renders as a 500 HTML page — a request naming nothing coming
      // back looking exactly like a broken server, out of the route
      // written to stop returning HTML.
      const r = await request.get(`/api/${key}/standings`);
      const body = await r.text();
      expect(looksLikeHtml(r.headers()["content-type"], body),
        `/api/${key}/standings came back as a page`).toBe(false);
      expect(r.status(), `/api/${key}/standings must be a refusal, not a `
        + "server error").toBe(404);
      expect(JSON.parse(body).reason).toBe("competition_not_proxied");
      // It must also never have been forwarded.
      expect(leagueRouteAllowed(key, "standings")).toBe(false);
    });
}

test("the prototype keys above are refused because they are undeclared, "
  + "not because the check refuses everything", { tag: LIVE_TAG },
  async ({ request }) => {
    // The non-vacuity half of the loop: the same lookup that rejects
    // `constructor` still admits every real prefix, so the hardening
    // narrowed nothing.
    for (const prefix of PROXY_PREFIXES) {
      const list = LEAGUE_PROXY_ALLOWED[prefix];
      if (!list.length) continue;  // comp: its surface is {key}/{resource}
      expect(leagueRouteAllowed(prefix, list[0]),
        `${prefix}/${list[0]} is on its own allowlist and was refused`)
        .toBe(true);
    }
    // And a real prefix answers over the wire, so the loop above is not
    // agreeing with itself in memory while the routes are dead.
    const r = await liveGet(request, "/api/eredivisie/standings");
    test.skip(!r, unanswered("/api/eredivisie/standings"));
    if (!r) return;
    expect(r.status()).toBe(200);
  });

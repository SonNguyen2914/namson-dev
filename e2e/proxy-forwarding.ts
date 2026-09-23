// WHAT "THE PROXY FORWARDS THIS ROUTE" IS A CLAIM ABOUT, WRITTEN ONCE.
//
// Three specs make it — e2e/proxy-allowlists.spec.ts (once per prefix,
// derived), e2e/picker.spec.ts and e2e/finished-is-asked-for.spec.ts —
// and all three used to make it the same way: fire a real request at
// `/api/<prefix>/<resource>` and assert the answer is not the proxy's
// own `unknown <prefix> route` 404. Every other test in those files
// mocks in the BROWSER, so `src/pages/api/<prefix>/[...path].ts` is
// never exercised by them; that is why the requests are real, and it is
// still why they are real here. (Not a .spec.ts, so the runner does not
// collect it.)
//
// ─── WHAT WAS WRONG WITH ASKING THE BACKEND ──────────────────────────
//
// The claim is about the APP: that this URL reaches this handler, gets
// past that handler's own allowlist, and is rewritten into a backend
// path with its query string intact. The backend's ANSWER was never
// part of it — the assertion accepts a payload, a 500 and an
// unreachable-backend 502 alike, because the one response that would
// prove the allowlist rejected the route is authored locally, before
// anything upstream is contacted.
//
// But the round trip was part of it, and on 2026-09-22 that cost the
// tree three red CI runs on a PR that touched none of these files
// (attempts 1/2/4 of run 35793175865: 8, 11 and 1 failures, a set that
// varied between runs). `picker/review` is measured at 9.1s cold and
// the eleven prefix probes add ~43s of backend work per run, on ONE
// Railway instance this suite does not own and shares with every other
// unmocked spec in it. When that instance is slow, a test that never
// reached its subject reports a failure OF that subject: a failed read
// rendered as a finding, which is the shape this tree exists to refuse.
//
// ─── WHAT IT ASKS INSTEAD, AND WHY IT IS STRICTLY MORE ───────────────
//
// The hold-out (e2e/board-holdout.mjs) is already the single socket
// between the app under test and the backend, and it already answers
// `?__holdout_probe` itself WITHOUT forwarding — the sentinel
// `the-board-writes-nothing.spec.ts` uses to prove the app is talking
// to it. The probe now echoes `req.url`, which is the path the app's
// proxy handler REWROTE and put on that socket.
//
// So the request still travels the whole real surface — no page.route,
// no mock, the built app, the real handler file, the real allowlist,
// the real rewrite — and what comes back is the rewritten URL itself
// rather than whatever a remote backend felt like saying. That is a
// STRONGER assertion than the one it replaces:
//
//   * "not refused" is kept, unchanged, and still fails instantly for a
//     route the allowlist drops; and
//   * the prefix, sub-path and query string are now asserted to have
//     arrived VERBATIM, which no amount of backend round-tripping ever
//     checked. `finished-is-asked-for.spec.ts` is named for that exact
//     property and could not previously see it.
//
// NOTHING ABOUT THE BACKEND IS LOST HERE, because no test here ever
// claimed it. Whether the backend actually serves each forwarded route
// is `proxy-allowlists.spec.ts`'s drift test, which reads the backend's
// own /openapi.json and reports both directions — a served route the
// proxy 404s, and a forwarded route the backend never served.
import { test } from "@playwright/test";
import { liveGet, unanswered, LIVE_READ_MS } from "./live-read";
import { expect, type APIRequestContext } from "@playwright/test";
import { BOARD_HOLDOUT } from "./backend";

/** The hold-out's own query parameter. Answered by the hold-out and
 *  never forwarded upstream; the league proxies pass `req.url`'s query
 *  string through untouched, so it arrives. */
export const PROBE_PARAM = "__holdout_probe";

/** `/api/<prefix>/<resource>` with the probe appended, keeping whatever
 *  query string the caller already wrote. */
export function probeUrl(prefix: string, resource: string): string {
  const sep = resource.includes("?") ? "&" : "?";
  return `/api/${prefix}/${resource}${sep}${PROBE_PARAM}=1`;
}

/**
 * Assert that `/api/<prefix>/<resource>` is forwarded — that it reaches
 * that prefix's handler, passes its allowlist, and is rewritten onto the
 * backend socket with its query string verbatim.
 *
 * `resource` is everything after the prefix, query string included:
 * `"scoreboard"`, `"review?back=7"`, `"ucl/ratings"`.
 */
export async function expectForwarded(
  request: APIRequestContext, prefix: string, resource: string,
): Promise<void> {
  const url = probeUrl(prefix, resource);

  if (!BOARD_HOLDOUT) {
    // SUGGESTER_E2E_BOARD=live was set deliberately: the hold-out is out
    // of the path by request, the sentinel cannot come back, and the
    // probe parameter travels to a backend that ignores unknown query
    // parameters. That leaves exactly the claim this helper replaced —
    // asked the old way, and bounded so a slow backend is named rather
    // than reported as a refusal that never happened.
    let text: string;
    try {
      text = await (await request.get(url, { timeout: 20_000 })).text();
    } catch (e) {
      throw new Error(
        `the backend behind the live opt-out (SUGGESTER_E2E_BOARD=live) `
        + `did not answer ${url} within 20s. With the hold-out in the `
        + `path this claim needs no backend at all — unset that variable `
        + `rather than reading this as a proxy defect (${String(e).slice(0, 120)})`);
    }
    expect(text, `${prefix}/${resource} rejected by the proxy allowlist`)
      .not.toContain(`unknown ${prefix} route`);
    return;
  }

  /* AND THE HOLD-OUT BRANCH IS BOUNDED TOO. Its sibling above already
     was, at 20s; this one carried no timeout of its own, so the only
     clock on it was the TEST's — and a read that hung here spent the
     whole 45s and died as `apiRequestContext.get: Test timeout`, which
     names the request and says nothing about the forwarding this test
     is actually about. Measured 2026-09-23: two specs failed that way
     in three consecutive runs, in runs whose own setup had already
     printed `/api/ready no answer in 60003ms`. The hold-out needs no
     backend, so a stall here is a fact about the run — but it must be
     SAID, not inferred from a timeout on a line that mentions neither
     the hold-out nor the proxy. */
  /* AND AN UNANSWERED READ IS A SKIP, NOT A FAILURE. This branch had no
     clock of its own, so the only one on it was the TEST's: a stall
     spent the whole 45s and died as `apiRequestContext.get: Test
     timeout`, an error that names the request and says nothing about
     the forwarding this test is about. Measured 2026-09-23: two specs
     failed that way in three consecutive runs, every one of them in a
     run whose own global-setup had already printed `/api/ready no
     answer in 60003ms`. The setup said the backend was unreachable and
     the specs then reported it as themselves.

     `live-read.ts` is explicit that the CALLER says what an unanswered
     read means for its own claim, and for this one it means the claim
     was never evaluated: what the proxy forwards cannot be read off a
     response that did not arrive. So it skips, with the reason named —
     which is the opposite of relaxing the assertion, because a test
     that could not reach its subject has no evidence either way and
     saying so is the honest report. */
  const r = await liveGet(request, url, LIVE_READ_MS);
  if (r === null) { test.skip(true, unanswered(url)); return; }
  const text = await r.text();

  // THE CLAIM THAT WAS ALWAYS HERE, unchanged and asked first: a route
  // the allowlist drops is refused locally, in this body, before any
  // socket is opened.
  expect(text, `${prefix}/${resource} rejected by the proxy allowlist`)
    .not.toContain(`unknown ${prefix} route`);

  let body: { __board_holdout?: boolean; path?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `${url} came back as something other than the hold-out's sentinel `
      + `JSON (${r.status()}, ${text.length} chars). If the app under test `
      + `is talking to a real backend instead of to the hold-out, a board `
      + `GET from this run would write a permanent pre-kickoff snapshot `
      + `there — a stale 'npm start' on the port adopted by `
      + `reuseExistingServer is the usual cause. Body: ${text.slice(0, 200)}`);
  }

  // IT REACHED THE SOCKET. Not "a backend answered": the hold-out is
  // the app's backend, and this sentinel is authored by the hold-out
  // without forwarding anything.
  expect(body.__board_holdout,
    `${url} did not reach the board hold-out, so nothing here says the `
    + `${prefix} proxy forwarded it`).toBe(true);

  // AND IT REACHED IT AS ITSELF. `pages/api/<prefix>/[...path].ts`
  // rebuilds the backend path as `/api/<prefix>/<segs><qs>`, so the URL
  // the hold-out saw must be the URL that was asked for — every segment
  // and every query parameter, in order. A prefix typed wrong in one of
  // the ten near-identical handler files, or a query string dropped on
  // the way through, is a different string here.
  expect(body.path,
    `the ${prefix} proxy put a different URL on the backend socket than `
    + `the one it was asked for`).toBe(url);
}

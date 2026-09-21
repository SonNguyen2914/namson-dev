// THE BACKEND THIS SUITE IS POINTED AT, WRITTEN ONCE.
//
// playwright.config.ts hands `BACKEND_URL` to the app under test as
// SUGGESTER_BACKEND_URL, and e2e/proxy-allowlists.spec.ts reads the SAME
// address's /openapi.json directly to check the proxy allowlists against
// the route table the backend actually publishes.
//
// Those two must be the same server or the check is clean about a
// backend the app never talks to — a guard passing on the wrong
// evidence, which is worse than no guard. So the value lives here and
// both import it, rather than each carrying its own copy of the
// default. (Not a .spec.ts, so the runner does not collect it.)
//
// TWO ADDRESSES NOW, AND THE INVARIANT ABOVE IS UNCHANGED (2026-09-17).
//
//   UPSTREAM_URL  the real backend — what a reader means by "which
//                 backend is this suite pointed at", and what
//                 SUGGESTER_BACKEND_URL still sets.
//   BACKEND_URL   the address the app under test is GIVEN, and the one
//                 proxy-allowlists.spec.ts reads. Still ONE address
//                 shared by both.
//
// They differ because BACKEND_URL is the board hold-out
// (e2e/board-holdout.mjs), which forwards every path to UPSTREAM_URL
// except `GET /api/picker/board` — the one route on the backend that
// WRITES. See that file for why a board GET is not a read.
export const UPSTREAM_URL = process.env.SUGGESTER_BACKEND_URL
  || "https://wc26-bet-suggester-production.up.railway.app";

export const HOLDOUT_PORT = Number(process.env.SUGGESTER_E2E_HOLDOUT_PORT || 3124);

/** THE OPT-OUT IS DELIBERATE, NAMED, AND NEVER SET IN CI.
 *
 *  `SUGGESTER_E2E_BOARD=live` takes the hold-out out of the path, for
 *  the one case that wants a real board assembly: an operator smoke-
 *  testing a deploy against a backend they own. It is spelled as a word
 *  rather than a truthy flag so it cannot be switched on by an
 *  environment that happens to export a stray `1`. */
export const BOARD_HOLDOUT = process.env.SUGGESTER_E2E_BOARD !== "live";

export const HOLDOUT_URL = `http://127.0.0.1:${HOLDOUT_PORT}`;

export const BACKEND_URL = BOARD_HOLDOUT ? HOLDOUT_URL : UPSTREAM_URL;

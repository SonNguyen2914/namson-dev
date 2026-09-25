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
//
// THREE ADDRESSES SINCE 2026-09-25, AND THE DEFAULT IS NOT PRODUCTION.
//
// The default suite forwarded 1,786-2,072 GETs per run to the production
// backend (measured that day against a counting stand-in), on the
// morning that backend hung twice from worker-pool starvation. Almost
// none of them were claims about the backend: they were CompRail's cup
// fixtures on every landing-page test, the watched strip polled from
// every anonymous tab, and three "mocked" tests that had never mocked
// the Leagues Cup field. So the suite now has two MODES:
//
//   hermetic (default)  UPSTREAM_URL is the local stand-in
//                       (e2e/stand-in-backend.mjs), which answers every
//                       read with a named 503 and logs it. Tests tagged
//                       `@live` are not run. Nothing reaches a real
//                       backend, whatever SUGGESTER_BACKEND_URL says.
//   live                SUGGESTER_E2E_MODE=live. Only the `@live` tests
//                       run, on one worker, through a hold-out that spaces
//                       its forwarded reads; UPSTREAM_URL is
//                       SUGGESTER_BACKEND_URL or production.
export const PRODUCTION_URL =
  "https://wc26-bet-suggester-production.up.railway.app";

/** Spelled as a word, like SUGGESTER_E2E_BOARD below, so a stray `1`
 *  cannot turn it on. */
export const LIVE = process.env.SUGGESTER_E2E_MODE === "live";

export const STANDIN_PORT = Number(process.env.SUGGESTER_E2E_STANDIN_PORT || 3125);
export const STANDIN_URL = `http://127.0.0.1:${STANDIN_PORT}`;

export const UPSTREAM_URL = LIVE
  ? (process.env.SUGGESTER_BACKEND_URL || PRODUCTION_URL)
  : STANDIN_URL;

/** The tag a test carries when its claim is about the DEPLOYED backend
 *  and cannot be made against the stand-in. */
export const LIVE_TAG = "@live";

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

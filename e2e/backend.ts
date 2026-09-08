// THE BACKEND THIS SUITE IS POINTED AT, WRITTEN ONCE.
//
// playwright.config.ts hands this to the app under test as
// SUGGESTER_BACKEND_URL, and e2e/proxy-allowlists.spec.ts reads the
// SAME backend's /openapi.json directly to check the proxy allowlists
// against the route table the backend actually publishes.
//
// Those two must be the same server or the check is clean about a
// backend the app never talks to — a guard passing on the wrong
// evidence, which is worse than no guard. So the value lives here and
// both import it, rather than each carrying its own copy of the
// default. (Not a .spec.ts, so the runner does not collect it.)
export const BACKEND_URL = process.env.SUGGESTER_BACKEND_URL
  || "https://wc26-bet-suggester-production.up.railway.app";

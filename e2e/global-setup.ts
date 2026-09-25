// THE READINESS GATE — a cold backend named once, up front, instead of
// as a dozen unrelated red specs.
//
// WHAT THIS IS FOR. Most of this suite is hermetic, but a declared
// minority reads the live shadow backend because the live answer IS the
// claim: that every board column's standings route comes back as a JSON
// table and not an HTML page, that the allowlists agree with the
// backend's own /openapi.json, that a match page's absence block is
// only drawn once an XI exists. Those reads are cheap against a warm
// backend and expensive against a cold one — /api/picker/review is
// measured at 9.1s cold and 0.19s warm — and the suite's per-test
// budgets are sized for the warm number.
//
// WHAT WENT WRONG WITHOUT IT. Run 35793175865 (2026-09-22) failed three
// attempts on a PR that touched none of the failing specs, with a set
// that varied between runs: 8 failures, then 11, then 1. Every one of
// them was a live read that never came back inside its deadline, and
// every one of them was reported as a failure of the thing it never
// reached — a nav link "missing" from a page that never rendered, a
// proxy "refusing" a route it had forwarded. The same attempts took
// 19.7 and 18.7 minutes against the 9.0 of the attempt that passed, so
// what varied was the backend, not the tree.
//
// WHAT IT DOES, AND WHAT IT DELIBERATELY DOES NOT DO. It waits for
// /api/ready, then walks the expensive live routes ONCE, in sequence,
// and prints what each cost. Warming them in series before the workers
// start is the opposite of what the suite does to itself when two
// workers race the same cold route from inside their own deadlines.
//
// IT NEVER FAILS THE RUN. A backend that is down is not this repository
// being broken, and turning somebody else's outage into a red PR is the
// same error in the other direction. The specs that need a live answer
// carry their own bounded reads and name their own skips; what this
// adds is that the run SAYS so at the top, in one place, with numbers —
// so the next person reading a red CI log can tell "the backend was
// cold" from "the code is wrong" without opening a trace.
//
// IT WARMS, IT DOES NOT PROBE. Every path below is a read the suite
// already performs; nothing new is asked of production. `/api/picker/
// board` is NOT here and must never be: a board GET is an assembly, and
// an assembly freezes a permanent pre-kickoff snapshot. See
// e2e/board-holdout.mjs. That is asserted rather than remembered.
import { LIVE, UPSTREAM_URL } from "./backend";
import { PICKER_COLUMN_ORDER } from "../src/lib/pickerApi";

/** How long to wait for the backend to say it is up at all. */
const READY_MS = 60_000;
/** Per warm read. Past this the route is slow; that is the finding. */
const WARM_MS = 30_000;

/** THE LIVE READS THIS SUITE MAKES, each with the spec that makes it.
 *  Derived where a registry exists, so a league added to the board is
 *  warmed without anybody remembering to add it here. */
function warmPaths(): string[] {
  return [
    // proxy-allowlists.spec.ts — the allowlist/route-table drift check
    "/openapi.json",
    // an-absent-route-is-not-html.spec.ts — one per declared column,
    // and it asserts a 200 with real clubs in it, so a cold table is a
    // red spec rather than a slow one
    ...PICKER_COLUMN_ORDER.map((slug) => `/api/${slug}/standings`),
    // (an-absent-route's OTHER reads — campeones/standings,
    // campeones/markets, bundesliga/markets — are refused by the proxy
    // before any socket opens, so there is nothing upstream to warm and
    // they are deliberately not listed: a warm-up that walks locally
    // authored refusals is a list nobody can read the cost off.)
    // decision-safety.spec.ts — the schedule its fixture scan starts at
    "/api/mls/schedule?days=7",
    // lineups.spec.ts (both tests) and scouting-consistency.spec.ts,
    // same fixture
    `/api/mls/match/${process.env.E2E_EVENT_ID || "761439"}`,
    // (watched-strip is NOT warmed any more, 2026-09-25: it is operator-
    // only, so an unauthenticated warm-up is a guaranteed 403 that costs
    // the backend an auth check and proves nothing, and no `@live` test
    // reads it.)
  ];
}

export default async function globalSetup(): Promise<void> {
  // THE HERMETIC RUN WARMS NOTHING AND REACHES NOTHING (2026-09-25). Its
  // upstream is the local stand-in, so there is no cache to fill — and a
  // default run that could be pointed at a real backend is the thing this
  // mode exists to rule out, so that is asserted rather than trusted.
  if (!LIVE) {
    const host = new URL(UPSTREAM_URL).hostname;
    if (host !== "127.0.0.1" && host !== "localhost") {
      throw new Error(`the hermetic e2e run is pointed at ${UPSTREAM_URL}, `
        + "which is not the local stand-in. The default suite never reads "
        + "a real backend; set SUGGESTER_E2E_MODE=live for the @live set.");
    }
    if (process.env.SUGGESTER_BACKEND_URL) {
      console.log("[e2e] hermetic run: SUGGESTER_BACKEND_URL is ignored "
        + "here (it names the upstream of the @live set only)");
    }
    console.log(`[e2e] hermetic run: upstream is the stand-in at `
      + `${UPSTREAM_URL}; @live tests are excluded`);
    return;
  }
  const paths = warmPaths();

  // THE ONE PATH THAT MUST NEVER BE HERE, asserted rather than trusted.
  // A warm-up list is exactly the kind of convenience where somebody
  // adds "the board is slow, warm it too" without knowing that a board
  // GET writes. Matched on the pathname the way the hold-out matches
  // it, so a query string cannot smuggle one past.
  const board = paths.filter((p) => /^\/api\/picker\/board(\/|\?|$)/.test(p));
  if (board.length) {
    throw new Error(
      "e2e/global-setup.ts lists GET /api/picker/board. That is not a "
      + "read: it assembles the board, which freezes a permanent, "
      + "first-write-wins pre-kickoff snapshot for every fixture on it, "
      + "on a table with no delete path. See e2e/board-holdout.mjs. "
      + `Remove it: ${board.join(", ")}`);
  }

  const get = async (path: string, ms: number) => {
    const started = Date.now();
    try {
      const r = await fetch(`${UPSTREAM_URL}${path}`,
                            { signal: AbortSignal.timeout(ms) });
      // the body is read to the end: a status arrives before the work
      // that fills the cache is finished, and the cache is the point
      await r.arrayBuffer();
      return { ms: Date.now() - started, status: String(r.status) };
    } catch (e) {
      return { ms: Date.now() - started,
               status: `no answer (${String(e).slice(0, 60)})` };
    }
  };

  console.log(`[e2e] warming ${UPSTREAM_URL} — ${paths.length} live reads `
    + "this suite makes, in sequence, before any worker starts");

  const ready = await get("/api/ready", READY_MS);
  console.log(`[e2e]   /api/ready ${ready.status} in ${ready.ms}ms`);
  if (!ready.status.startsWith("2")) {
    console.log(
      "[e2e] *** THE SHADOW BACKEND DID NOT REPORT READY. The live-read "
      + "specs in this suite will skip or fail for that reason and not "
      + "for a defect in this branch; read their skip messages before "
      + "reading their names. ***");
    return;
  }

  let slowest = { path: "", ms: 0 };
  for (const path of paths) {
    const r = await get(path, WARM_MS);
    if (r.ms > slowest.ms) slowest = { path, ms: r.ms };
    if (r.ms > 5_000 || !r.status.startsWith("2")) {
      console.log(`[e2e]   ${path} ${r.status} in ${r.ms}ms`);
    }
  }
  console.log(`[e2e] warmed; slowest was ${slowest.path} at ${slowest.ms}ms`);
}

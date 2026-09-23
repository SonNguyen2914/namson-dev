import { defineConfig, devices } from "@playwright/test";
import {
  BACKEND_URL as BACKEND, UPSTREAM_URL, HOLDOUT_PORT, HOLDOUT_URL,
  BOARD_HOLDOUT,
} from "./e2e/backend";

// V8.1 evaluation Phase 9/10 — decision-safety E2E. Builds and starts
// the app, proxying to the live shadow backend (read-only GETs), and
// asserts the invariants that must hold regardless of volatile data:
// the shadow / not-advice labelling that keeps the UI decision-safe.
//
// The backend URL moved to e2e/backend.ts on 2026-09-07: a spec now
// reads that backend's OWN route table, and a second copy of the
// default here would let the app and that check point at different
// servers.

// Overridable so a second checkout/agent can run the suite WITHOUT
// inheriting whatever server (and backend stub) already holds 3123 —
// reuseExistingServer would silently adopt it, stale build and all.
const PORT = Number(process.env.SUGGESTER_E2E_PORT || 3123);

// HOW MANY OF US MAY READ THE ONE BACKEND AT ONCE (2026-09-07).
//
// Playwright's default is half the machine's cores, so this suite ran
// two workers on the CI runner and five on a developer's laptop: the
// same suite behaving differently per machine, against a SINGLE shared
// Railway backend it does not own and does not share with a queue.
//
// MEASURED, not guessed. /api/mls/match/761439 answers in 1.35s
// against an idle backend; at five workers it blew the 45s per-test
// deadline — a 33x amplification — and five tests across four specs
// went red. Every one of them reads live data, every one of them
// passes alone, and not one of them was about the app: what they had
// measured was this suite racing itself for the backend. A timeout
// produced by our own concurrency, reported as a decision-safety
// failure, is a failed read rendered as a finding — the shape this
// tree exists to refuse.
//
// So the concurrency is CAPPED rather than the deadlines lengthened:
// the cure for contention is fewer readers, not more patience, and a
// longer deadline would have left the number depending on the laptop.
// The hermetic majority (page.route mocks; the match pages are
// statically prerendered, so a mocked spec touches no backend) pays
// for this in wall-clock and nothing else.
const WORKERS = Number(process.env.SUGGESTER_E2E_WORKERS || 2);

export default defineConfig({
  testDir: "./e2e",
  // THE BACKEND IS WARMED, AND SAID TO BE WARMED, BEFORE ANY WORKER
  // STARTS. The cap above is the cure for this suite racing itself; it
  // does nothing about the FIRST reader of a cold route paying for the
  // cache every other reader then enjoys. Run 35793175865 lost three
  // attempts to that on a PR touching none of the failing specs. The
  // setup never fails the run — a backend that is down is not this
  // branch being broken — it walks the live reads once, in sequence,
  // and prints what they cost, so a red log says which of the two it
  // was. See e2e/global-setup.ts.
  globalSetup: "./e2e/global-setup.ts",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: WORKERS,
  reporter: "line",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // TWO SERVERS, AND THE ORDER MATTERS. Playwright starts these in the
  // listed order and waits for each `url` to answer, so the hold-out is
  // listening before the app that will be pointed at it ever boots.
  //
  // THE HOLD-OUT IS NOT AN OPTIMISATION. `GET /api/picker/board` WRITES
  // — it freezes a permanent, first-write-wins pre-kickoff snapshot for
  // every fixture on the board, on a table with no delete path. Measured
  // on 2026-09-17, three spec files alone sent 23 of them in one run,
  // against production, on every PR. e2e/board-holdout.mjs forwards
  // everything else untouched and refuses that one path. See its header.
  webServer: [
    ...(BOARD_HOLDOUT ? [{
      command: "node e2e/board-holdout.mjs",
      url: `${HOLDOUT_URL}/__holdout/ledger`,
      timeout: 30_000,
      // NEVER REUSED, EVEN LOCALLY. A hold-out already on the port was
      // started with some other upstream, and adopting it would point
      // this run at a backend nobody chose — the same trap the app
      // server's comment below is about, on the one server whose whole
      // job is to be trusted.
      reuseExistingServer: false,
      env: {
        SUGGESTER_E2E_UPSTREAM: UPSTREAM_URL,
        SUGGESTER_E2E_HOLDOUT_PORT: String(HOLDOUT_PORT),
      },
    }] : []),
    {
      command: `npm run start -- --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      timeout: 120_000,
      // A SERVER ADOPTED HERE MAY BE POINTED ANYWHERE. `reuseExistingServer`
      // keeps whatever `SUGGESTER_BACKEND_URL` the running process booted
      // with, which for any server started before 2026-09-17 is production
      // DIRECT — hold-out bypassed, board GETs landing in the store. That
      // is not left to discipline: `the-board-writes-nothing.spec.ts`
      // probes the app for the hold-out's sentinel on every run and fails
      // when the app is talking to anything else.
      reuseExistingServer: !process.env.CI,
      env: { SUGGESTER_BACKEND_URL: BACKEND },
    },
  ],
});

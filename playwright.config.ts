import { defineConfig, devices } from "@playwright/test";
import { BACKEND_URL as BACKEND } from "./e2e/backend";

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
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: { SUGGESTER_BACKEND_URL: BACKEND },
  },
});

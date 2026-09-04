import { defineConfig, devices } from "@playwright/test";

// V8.1 evaluation Phase 9/10 — decision-safety E2E. Builds and starts
// the app, proxying to the live shadow backend (read-only GETs), and
// asserts the invariants that must hold regardless of volatile data:
// the shadow / not-advice labelling that keeps the UI decision-safe.
const BACKEND = process.env.SUGGESTER_BACKEND_URL
  || "https://wc26-bet-suggester-production.up.railway.app";

// Overridable so a second checkout/agent can run the suite WITHOUT
// inheriting whatever server (and backend stub) already holds 3123 —
// reuseExistingServer would silently adopt it, stale build and all.
const PORT = Number(process.env.SUGGESTER_E2E_PORT || 3123);

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
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
    env: {
      SUGGESTER_BACKEND_URL: BACKEND,
      // Never let a developer's private Study Hub catalog/database leak into
      // the hermetic public-shell browser tests.
      STUDY_HUB_COURSES_JSON: "",
      STUDY_HUB_DATABASE_PATH: "",
      STUDY_HUB_ACCESS_PASSWORD: "",
      STUDY_HUB_SESSION_SECRET: "",
    },
  },
});

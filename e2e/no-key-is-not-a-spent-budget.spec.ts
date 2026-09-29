import { expect, test, type Page } from "@playwright/test";

import { LIVE_SCORES, LIVE_STATE_KEYED, LIVE_STATE_KEYLESS }
  from "./live-state-recorded";

// NO KEY IS NOT A SPENT BUDGET (audit 2026-09-28, frontend 8e7b335 /
// backend e40efef1).
//
// THE DEFECT. After "Auto-fill from live feed", LivePanel appended
// `${s.budget.remaining} feed calls left today`. On a deployment with no
// API-Football key the backend sends `remaining: 0` — it cannot make a
// call at all — and says so in `remaining_means` (live_feed.budget_status,
// fixed on the backend 2026-09-09 after the operator misread exactly
// this). The panel dropped that sentence and printed "0 feed calls left
// today" on the very fill the keyless ESPN reader had just answered: a
// zero that meant "no key", read as "budget spent".
//
// HERMETIC: both live-state bodies are the backend route's own output,
// run in process (e2e/live-state-recorded.ts); every other read answers
// a named 503 from here.

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

async function autoFill(page: Page, state: unknown) {
  await page.route("**/api/**", (r) =>
    r.fulfill(json({ detail: "not served in this recorded world" }, 503)));
  await page.route("**/api/bet-suggester/live-scores",
    (r) => r.fulfill(json(LIVE_SCORES)));
  await page.route("**/api/bet-suggester/live-state**",
    (r) => r.fulfill(json(state)));
  await page.goto("/bet-suggester/wc26");
  await page.getByRole("button", { name: /Manual override/i }).click();
  await page.getByRole("button", { name: /Auto-fill from live feed/i }).click();
  const msg = page.getByText(/^Filled from live feed/);
  await expect(msg).toBeVisible();
  return msg;
}

test("with no API-Football key the fill says WHY there are no calls — the "
   + "backend's own sentence, and no bare zero", async ({ page }) => {
    const b = LIVE_STATE_KEYLESS.budget;
    expect(b.key_configured).toBe(false);
    expect(b.remaining, "the wire's keyless zero").toBe(0);
    const msg = await autoFill(page, LIVE_STATE_KEYLESS);
    // the state itself still filled — this is about the budget clause
    await expect(msg).toContainText(
      `Filled from live feed: ${LIVE_STATE_KEYLESS.current_home}-`
      + `${LIVE_STATE_KEYLESS.current_away}`);
    await expect(msg).toContainText(b.remaining_means);
    await expect(msg).not.toContainText(/\b0 (feed )?calls/);
    await expect(msg).not.toContainText("calls left today");
  });

test("with a key the count is the cap arithmetic, and says what it counts",
  async ({ page }) => {
    // THE NON-VACUITY HALF. A panel that never printed a number would
    // pass the test above; a keyed read has a real one to print.
    const b = LIVE_STATE_KEYED.budget;
    expect(b.key_configured).toBe(true);
    const msg = await autoFill(page, LIVE_STATE_KEYED);
    await expect(msg).toContainText(`${b.remaining} ${b.remaining_means}`);
    await expect(msg).not.toContainText(LIVE_STATE_KEYLESS.budget.remaining_means);
  });

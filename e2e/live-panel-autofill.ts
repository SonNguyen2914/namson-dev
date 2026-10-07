import type { Locator, Page } from "@playwright/test";

// THE LIVE PANEL'S AUTO-FILL, OPENED IN A RECORDED WORLD (2026-10-07).
//
// One in-play scoreboard entry and one live-state body, both the backend
// routes' own output (e2e/live-state-recorded.ts); every other read is a
// named 503 from here, registered FIRST so the two specific routes win
// (Playwright runs routes newest-first). Then /bet-suggester/wc26, the
// live card's "Manual override", and the panel inside it.
//
// The parts are located by ROLE AND STRUCTURE, not by a test id this
// branch added: a guard has to be runnable against the build before the
// fix (AGENTS.md §7), and a locator that only exists after it would fail
// there for the wrong reason. (Not a .spec.ts, so the runner does not
// collect it.)

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

export interface LivePanelParts {
  panel: Locator;
  /** the minute slider — the first range input; the attack levers below
   *  it sit inside a closed <details> */
  minute: Locator;
  /** "⟳ Auto-fill from live feed" */
  fill: Locator;
  /** the line the fill writes, directly under its button */
  msg: Locator;
}

export async function openManualOverride(
  page: Page, scores: unknown, state: unknown,
): Promise<LivePanelParts> {
  await page.route("**/api/**", (r) =>
    r.fulfill(json({ detail: "not served in this recorded world" }, 503)));
  await page.route("**/api/bet-suggester/live-scores",
    (r) => r.fulfill(json(scores)));
  await page.route("**/api/bet-suggester/live-state**",
    (r) => r.fulfill(json(state)));
  await page.goto("/bet-suggester/wc26");
  await page.getByRole("button", { name: /Manual override/i }).click();
  const panel = page.locator("section", { hasText: "Live read — experimental" });
  const fill = panel.getByRole("button", { name: /Auto-fill from live feed/i });
  return {
    panel,
    minute: panel.locator('input[type="range"]').first(),
    fill,
    msg: fill.locator("xpath=following-sibling::p[1]"),
  };
}

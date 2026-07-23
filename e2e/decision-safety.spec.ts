import { test, expect } from "@playwright/test";

// Decision-safety invariants (V8.1 evaluation). These must hold no
// matter what the volatile shadow data looks like: the UI must never
// present model output as advice, and must label shadow/paper state.

test("MLS board loads in league mode with the shadow framing", async ({ page }) => {
  await page.goto("/bet-suggester?league=mls");
  // the league carousel lands on MLS (deep-link), not WC26
  await expect(page.getByRole("heading", { name: /MLS/i }).first())
    .toBeVisible();
  // shadow / not-advice framing is present on the market copy
  await expect(page.getByText(/shadow mode/i).first()).toBeVisible();
  await expect(page.getByText(/real-money signals are disabled/i).first())
    .toBeVisible();
});

test("match hub shows the model as shadow, never as advice", async ({ page }) => {
  // Columbus vs Cincinnati — a fixture the shadow plane prices
  await page.goto("/bet-suggester/mls/761680");
  await expect(page).toHaveTitle(/MLS/i);

  // the match-info card and the model/market comparison render
  await expect(page.getByText(/mls-2026-v0/i).first()).toBeVisible();
  await expect(page.getByText(/shadow · not advice/i).first())
    .toBeVisible();

  // the every-market table exists with the NET EDGE column (fee-aware),
  // not a bare "edge" and never a generic "TAKE"
  await expect(page.getByText(/every kalshi market on this match/i))
    .toBeVisible();
  await expect(page.getByText(/net edge/i).first()).toBeVisible();
  await expect(page.getByText(/^TAKE$/)).toHaveCount(0);

  // the closing disclaimer states the mode plainly
  await expect(
    page.getByText(/shadow model, observational only · not betting advice/i)
  ).toBeVisible();
});

test("back from a match returns to the MLS board, not WC26", async ({ page }) => {
  await page.goto("/bet-suggester/mls/761680");
  await page.getByRole("link", { name: /mls board/i }).click();
  await expect(page).toHaveURL(/league=mls/);
});

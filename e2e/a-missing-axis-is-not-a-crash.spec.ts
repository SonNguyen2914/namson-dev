/** A MISSING AXIS IS NOT A CRASH (2026-10-01).
 *
 *  The Championships board's finished tail draws each national row with
 *  `TierGaps` and NO field block. A national team is measured on Elo
 *  alone, so its row can carry `tiers.atk: null` / `tiers.def: null` —
 *  and the trio indexed that null. In Safari, which remembered the
 *  Championships view, that one row took the whole page down with
 *  "null is not an object (evaluating 'c[0]')"; Brave, on the Leagues
 *  view, never drew the row.
 *
 *  The rule is the one effectiveRead already keeps on the block path
 *  (2026-09-24): an axis the read carries no pair for is drawn nowhere.
 *
 *  HERMETIC: both boards and the review are served by page.route from
 *  recordings; anything unrouted reaches only the stand-in backend. */
import { test, expect, type Page } from "@playwright/test";
import { openDetails } from "./review-details";
import { routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { NATIONS_REVIEW } from "./nations-review-recorded";

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

/** The recorded review with every national row's attack and defence
 *  reading removed, the way the backend serves a team measured on Elo
 *  alone. */
function eloOnly(review: unknown): unknown {
  const copy = JSON.parse(JSON.stringify(review));
  const walk = (o: unknown): void => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    for (const key of ["tiers", "tier_gaps"]) {
      const t = rec[key];
      if (t && typeof t === "object" && !Array.isArray(t)
          && "ovr" in (t as object)) {
        (t as Record<string, unknown>).atk = null;
        (t as Record<string, unknown>).def = null;
      }
    }
    Object.values(rec).forEach(walk);
  };
  walk(copy);
  return copy;
}

async function openChampionships(page: Page, review: unknown) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/board**",
    (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.route("**/api/championships/review**",
    (r) => r.fulfill(json(review)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
  return errors;
}

test("an Elo-only national row draws its overall tier and no attack or defence cell",
  async ({ page }) => {
    const errors = await openChampionships(page, eloOnly(NATIONS_REVIEW));
    const unl = page.locator('[data-testid="review-tail"][data-league="unl"]');
    if (await unl.getByTestId("review-body").count() === 0) {
      await unl.getByTestId("review-toggle").click();
    }
    const rows = unl.getByTestId("review-row");
    await expect(rows.first()).toBeVisible();
    // the tiers live under each card's Details since the quiet pass
    await openDetails(unl);
    await expect(unl.locator('[data-tier-pair="ovr"]').first()).toBeVisible();
    await expect(unl.locator('[data-tier-pair="atk"]')).toHaveCount(0);
    await expect(unl.locator('[data-tier-pair="def"]')).toHaveCount(0);
    await expect(page.getByTestId("review-card-error")).toHaveCount(0);
    await expect(page.getByText("Application error")).toHaveCount(0);
    expect(errors, errors.join("\n")).toEqual([]);
  });

test("the recorded three-axis rows still draw all three cells",
  async ({ page }) => {
    const errors = await openChampionships(page, NATIONS_REVIEW);
    const unl = page.locator('[data-testid="review-tail"][data-league="unl"]');
    if (await unl.getByTestId("review-body").count() === 0) {
      await unl.getByTestId("review-toggle").click();
    }
    await expect(unl.getByTestId("review-row").first()).toBeVisible();
    await openDetails(unl);
    await expect(unl.locator('[data-tier-pair="ovr"]').first()).toBeVisible();
    await expect(unl.locator('[data-tier-pair="atk"]').first()).toBeVisible();
    await expect(unl.locator('[data-tier-pair="def"]').first()).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

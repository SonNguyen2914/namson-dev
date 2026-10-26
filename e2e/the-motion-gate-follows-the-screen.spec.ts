/** THE MOTION GATE FOLLOWS THE SCREEN IT IS ON (2026-10-25).
 *
 *  lib/useScrollScene keeps the landing page's motion gate in a module-
 *  level record, and only listens for a resize while the landing page is
 *  mounted. A reader who left for the board, rotated the phone (or
 *  dragged the window short) there, and came back by client-side
 *  navigation got the gate computed for the OLD screen: scenes pinned on
 *  a viewport too short to hold a stage. The gate is re-read whenever
 *  the landing page subscribes again.
 *
 *  HERMETIC: the board's reads are answered 503 here.
 */
import { expect, test } from "@playwright/test";

test("a screen that changed while the landing was away is re-read on return",
  async ({ page }) => {
    await page.route("**/api/**", (r) => r.fulfill({ status: 503,
      contentType: "application/json", body: '{"detail":"stub"}' }));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const landing = page.getByTestId("landing");
    await expect(landing).toHaveAttribute("data-motion", "on");

    await page.getByTestId("landing-cta").click();
    await page.waitForURL("**/bet-suggester");
    // the rotation happens while the landing page is not mounted
    await page.setViewportSize({ width: 900, height: 400 });
    await page.goBack();
    await page.waitForURL((u) => u.pathname === "/");
    await expect(landing).toHaveAttribute("data-motion", "off");
  });

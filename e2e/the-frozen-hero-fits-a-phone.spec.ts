/** THE FROZEN MATCH HERO FITS A PHONE (2026-10-25).
 *
 *  `/bet-suggester/market/<id>` is statically generated from
 *  src/data/wc26/matches/*.json, so nothing here is fetched. Two defects
 *  in its hero at 390px:
 *
 *   - the two flag+name units and the "vs" between them had no break
 *     opportunity between them (JSX drops the newlines), so the whole
 *     matchup was ONE unbreakable line and "Egypt 🇪🇬" ran off the right
 *     edge of the screen;
 *   - "Archived 2026-10-21 from the backend's last answer." rendered as
 *     "2026-10-21from" in the production build.
 */
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

// the shortest-margin pairs in the archive: the long names
for (const id of ["ARG_EGY", "ARG_SUI", "SUI_COL", "USA_BEL"]) {
  test(`${id}: the matchup stays on screen at 390px`, async ({ page }) => {
    await page.route("**/api/**", (r) => r.fulfill({ status: 503,
      contentType: "application/json", body: '{"detail":"stub"}' }));
    await page.goto(`/bet-suggester/market/${id}`);
    const h1 = page.locator("header h1");
    await expect(h1).toBeVisible();
    const box = await h1.evaluate((el) => {
      let right = 0;
      for (const n of el.querySelectorAll("span")) {
        right = Math.max(right, n.getBoundingClientRect().right);
      }
      return { right, vw: document.documentElement.clientWidth,
               sw: document.documentElement.scrollWidth };
    });
    expect(box.right).toBeLessThanOrEqual(box.vw);
    expect(box.sw).toBeLessThanOrEqual(box.vw);
  });
}

test("the archive line keeps the space after its date", async ({ page }) => {
  await page.goto("/bet-suggester/market/ARG_EGY");
  const line = page.getByTestId("match-frozen");
  await expect(line).toBeVisible();
  expect(await line.innerText()).toMatch(/Archived \d{4}-\d\d-\d\d from /);
});

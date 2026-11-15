import { expect, test } from "@playwright/test";
import { analystOn, EPL_EVENT, hermetic, json, previewFor } from "./analyst-fixtures";

// /trivela/analyst -> /trivela/var (2026-10-25). The Trivela
// Analyst was renamed Trivela VAR and its page moved; the old address is a
// permanent redirect in next.config.ts, not a page, and it keeps the query
// string so a match hub's deep link still opens that match. Hermetic: the
// preview is the pipeline's own output with the mock model.

test("/trivela/analyst redirects permanently to /trivela/var, query kept", async ({ request }) => {
  const r = await request.get("/trivela/analyst?league=epl&id=1", { maxRedirects: 0 });
  expect(r.status()).toBe(308);
  expect(r.headers()["location"]).toBe("/trivela/var?league=epl&id=1");
});

test("an old deep link lands on /var with that match open", async ({ page }) => {
  const preview = await previewFor("arsenal-everton");
  await hermetic(page);
  await analystOn(page);
  await page.route("**/api/analyst/preview**", (r) => r.fulfill(json(preview)));
  await page.goto(`/trivela/analyst?league=epl&id=${EPL_EVENT}`);
  await expect(page).toHaveURL(`/trivela/var?league=epl&id=${EPL_EVENT}`);
  await expect(page.getByTestId("analyst-match")).toHaveText("Arsenal vs Everton");
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
});

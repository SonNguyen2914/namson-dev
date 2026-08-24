import { expect, test } from "@playwright/test";

// The five viewer competitions the operator retired on 2026-08-24 —
// Conference League (ecl), Europa League (uel), Brasileirão, Liga
// Profesional Argentina, USL Championship.
//
// Two things must hold, and they are different claims:
//
//  - they are GONE FROM NAVIGATION. Nothing on the board offers them.
//  - a bookmarked URL still says what happened. The shared /comp/[key]
//    page reads the backend's named 404 and renders it, rather than
//    rendering "Loading", an empty no-model card and a zero board while
//    re-fetching a competition that will never come back. A permanent
//    absence dressed as a transient one is the empty-state defect this
//    repo already refuses for a missing prediction.
//
// Hermetic: the 404 body is the recorded shape of the backend's
// `_comp_404` refusal, so this passes with no backend at all.

const RETIRED = ["ecl", "uel", "brasileirao", "argentina", "usl"];
const KEPT = ["ucl", "leagues-cup", "asean"];

const GONE_DETAIL =
  "UEFA Europa League was retired on 2026-08-24 by operator decision — " +
  "nothing is collected for it any more. Nothing recorded was deleted: " +
  "journal entries stay readable at /api/comp/uel/journal, and the " +
  "research corpus is unchanged";

test("the board offers none of the five, and still offers the three",
  async ({ page }) => {
    await page.goto("/bet-suggester");
    for (const k of RETIRED) {
      await expect(
        page.locator(`a[href="/bet-suggester/comp/${k}"]`),
        `${k} must not be linked from the board`,
      ).toHaveCount(0);
    }
    for (const k of KEPT) {
      await expect(
        page.locator(`a[href="/bet-suggester/comp/${k}"]`).first(),
        `${k} must still be reachable`,
      ).toBeVisible();
    }
  });

test("a bookmarked retired competition says it was retired, and stops asking",
  async ({ page }) => {
    let asked = 0;
    await page.route("**/api/comp/uel/fixtures**", (r) => {
      asked += 1;
      return r.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: GONE_DETAIL }),
      });
    });
    await page.route("**/api/comp/uel/markets**", (r) =>
      r.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: GONE_DETAIL }),
      }));

    await page.goto("/bet-suggester/comp/uel");

    // the reason, in the backend's own words — not a spinner
    await expect(page.getByText(/retired on 2026-08-24/).first())
      .toBeVisible();
    // and the reassurance that the evidence is still there
    await expect(page.getByText(/Nothing recorded was deleted/).first())
      .toBeVisible();
    // never the transient story
    const body = (await page.textContent("body")) || "";
    expect(body).not.toContain("retrying every 60s");
    expect(body).not.toContain("Loading");
    // no empty model card claiming a competition is served here
    expect(body).not.toContain("no model · by design");
    expect(body).not.toContain("no model · not built yet");
    // asked once; the poll does not resume against a permanent 404
    expect(asked).toBe(1);
  });

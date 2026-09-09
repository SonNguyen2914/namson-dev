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
// The two that are LIVE keep a chip on the board's rail: Leagues Cup is
// at its semi-finals, UCL's league phase has not kicked off.
// KEY -> THE HREF ITS RAIL CHIP ACTUALLY POINTS AT. These are not both
// `/comp/<key>` any more: on 2026-09-08 the Champions League got a
// picker BOARD of its own (`/bet-suggester/ucl`, the landing page's own
// component narrowed to one column) and its chip was repointed there.
// The Leagues Cup keeps the competition viewer, because no board route
// was asked for it.
const KEPT_CHIPS: [string, string][] = [
  ["ucl", "/bet-suggester/ucl"],
  ["leagues-cup", "/bet-suggester/comp/leagues-cup"],
];
// ASEAN is kept too, but it FINISHED (0 upcoming, 28 played), so on
// 2026-08-30 it moved into the Archive dropdown at the top-left, with
// WC26. "Still reachable" is unchanged as a claim — it is reached
// through the control that says what it is, instead of sitting in a rail
// of live competitions. Retired and finished are different things and
// this spec must not blur them: a retired competition is offered
// nowhere, a finished one is filed.
const KEPT_IN_ARCHIVE = ["asean"];

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
    // SCOPED TO THE RAIL, WHICH IS WHAT THIS TEST CLAIMS.
    //
    // It used to search the WHOLE PAGE for `a[href="/comp/<k>"]`, and
    // that is how it went on passing after the ucl chip was repointed on
    // 2026-09-08: every Champions League CARD on the board links to
    // `/comp/ucl` through `pickerApi.rowHref`, so the selector kept
    // finding one. The rail link was gone and the assertion could not
    // see it. It failed in CI, where that day's live board happened to
    // carry no UCL row — so the guard was reporting the presence of
    // FIXTURES as the presence of NAVIGATION.
    //
    // The nav is the rail (`components/chrome.tsx` TopBar), so the
    // locator lives there. A card link now proves nothing here, which is
    // the point.
    const rail = page.locator("header.topbar nav");
    for (const [k, href] of KEPT_CHIPS) {
      await expect(
        rail.locator(`a[href="${href}"]`).first(),
        `${k} must still be reachable from the rail, at ${href}`,
      ).toBeVisible();
    }
    // and the retired ones must not be in the rail either — the check
    // above for the whole page stands, this adds the narrower claim
    for (const k of RETIRED) {
      await expect(
        rail.locator(`a[href*="/comp/${k}"]`),
        `${k} must not be in the rail`,
      ).toHaveCount(0);
    }
    // the finished one is behind the archive control, and the control
    // must actually produce it — "it is in a menu somewhere" is not a
    // reachability claim
    await page.getByRole("button", { name: /archive/i }).click();
    for (const k of KEPT_IN_ARCHIVE) {
      await expect(
        page.locator(`a[href="/bet-suggester/comp/${k}"]`).first(),
        `${k} must still be reachable from the archive dropdown`,
      ).toBeVisible();
    }
    // and it is NOT also sitting in the live rail
    await expect(
      page.getByRole("navigation")
        .locator(`a[href="/bet-suggester/comp/asean"]`),
    ).toHaveCount(0);
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

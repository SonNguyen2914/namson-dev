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
// The one that is LIVE keeps a chip on the board's rail: UCL's league
// phase opened on 2026-09-08.
// KEY -> THE HREF ITS RAIL CHIP ACTUALLY POINTS AT. Not `/comp/<key>`:
// on 2026-09-08 the Champions League got a picker BOARD of its own
// (`/bet-suggester/ucl`, the landing page's own component narrowed to one
// column) and its chip was repointed there.
const KEPT_CHIPS: [string, string][] = [
  ["ucl", "/bet-suggester/ucl"],
];
// KEPT, BUT FILED. ASEAN FINISHED (0 upcoming, 28 played) and moved into
// the Archive dropdown at the top-left on 2026-08-30, with WC26. THE
// LEAGUES CUP JOINED THEM ON 2026-09-09 — Toluca 2-0 Monterrey on 09-07
// was its final — and this is the assertion that changed shape with it:
// it used to be in KEPT_CHIPS above, and it was put there deliberately so
// that "archived" could not quietly become "removed". THAT CLAIM IS NOT
// DROPPED, IT IS MOVED: reachability is still asserted, against the
// control that says what the competition is instead of against a rail of
// live ones. Retired and finished are different things and this spec must
// not blur them: a retired competition is offered nowhere, a finished one
// is filed.
//
// KEY -> ITS ARCHIVE HREF, because these are not both `/comp/<key>`
// either. ASEAN points at the shared competition viewer; the Leagues Cup
// has three seasons of bracket that viewer cannot draw, so it points at
// its own archive page. Filing a competition never retired a route:
// `/comp/leagues-cup` still answers, it is simply not offered in the rail.
const KEPT_IN_ARCHIVE: [string, string][] = [
  ["asean", "/bet-suggester/comp/asean"],
  ["leagues-cup", "/bet-suggester/leagues-cup"],
];

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
    for (const [k, href] of KEPT_IN_ARCHIVE) {
      await expect(
        page.locator(`a[href="${href}"]`).first(),
        `${k} must still be reachable from the archive dropdown`,
      ).toBeVisible();
    }
    // and none of them is ALSO sitting in the live rail. Matched on the
    // key rather than on the archive href: the Leagues Cup's rail chip
    // pointed at `/comp/leagues-cup` while its archive item points at
    // `/leagues-cup`, so an equality check on the second would have
    // passed with the first still in the bar — which is exactly the
    // state this assertion was added to end.
    for (const [k] of KEPT_IN_ARCHIVE) {
      await expect(
        rail.locator(`a[href*="/${k}"]`),
        `${k} is filed in the archive and must not also be in the rail`,
      ).toHaveCount(0);
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

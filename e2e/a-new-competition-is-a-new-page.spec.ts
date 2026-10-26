/** A NEW COMPETITION IS A NEW PAGE (2026-10-25).
 *
 *  `/bet-suggester/comp/[key]` is one page for every viewer competition,
 *  and Next keeps it MOUNTED across a client-side change of `[key]` — the
 *  Archive menu's Link from `/comp/ucl` to `/comp/asean` is exactly that.
 *  Every piece of per-key state used to survive the move: the previous
 *  competition's title and fixtures under the new URL until (and, for the
 *  markets count, after) the new read landed, the previous key's failed
 *  ratings read drawn as THIS key's, and a retired key's "not served"
 *  page that never went away however far the reader navigated.
 *
 *  HERMETIC: every /api read is routed here; the catch-all answers 503.
 */
import { expect, test, type Page } from "@playwright/test";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

const UCL = {
  display: "UEFA Champions League", count: 1,
  fixtures: [{ fixture_id: 1,
    kickoff_utc: new Date(Date.now() + 3_600_000).toISOString(),
    status: "NS", home: { name: "Arsenal" }, away: { name: "Inter" } }],
  model: { state: "no_model_by_design", why: "UCL WHY", instead: "x" },
};
const ASEAN = {
  display: "ASEAN Championship", count: 0, fixtures: [],
  model: { state: "no_model_by_design", why: "ASEAN WHY", instead: "y" },
};

/** ASEAN's fixtures answer only when `release()` is called, so the test
 *  can look at the page in the window between the URL changing and the
 *  new competition's read landing. */
async function routeAsean(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((r) => { release = r; });
  await page.route("**/api/comp/asean/fixtures**", async (r) => {
    await gate;
    await r.fulfill(json(ASEAN)).catch(() => undefined);
  });
  await page.route("**/api/comp/asean/markets**",
    (r) => r.fulfill(json({ detail: "Not Found" }, 404)));
  await page.route("**/api/comp/asean/ratings**",
    (r) => r.fulfill(json({ competition: "asean", axes: null,
                            why_not: "ASEAN has no cross-league field" })));
  return () => release();
}

async function toAsean(page: Page) {
  await page.getByRole("button", { name: /archive/i }).first().click();
  await page.getByRole("menuitem", { name: /asean/i }).first().click();
  await page.waitForURL("**/comp/asean");
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "stub" }, 503)));
});

test("a client-side move to another competition draws nothing of the last one",
  async ({ page }) => {
    await page.route("**/api/comp/ucl/fixtures**", (r) => r.fulfill(json(UCL)));
    await page.route("**/api/comp/ucl/markets**", (r) => r.fulfill(json({
      status: "ok", series: "KXUCLGAME", listed_events: 77,
      tradeable_events: 33 })));
    await page.route("**/api/comp/ucl/ratings**",
      (r) => r.fulfill(json({ detail: "ucl ratings down" }, 502)));
    const release = await routeAsean(page);

    await page.goto("/bet-suggester/comp/ucl");
    const h1 = page.locator("main h1");
    await expect(h1).toHaveText("UEFA Champions League");
    await expect(page.getByText("33 tradeable on kalshi", { exact: false }))
      .toBeVisible();
    await expect(page.getByTestId("field-axes-error")).toBeVisible();

    await toAsean(page);
    // BEFORE ASEAN's read lands: not the Champions League's page under
    // ASEAN's URL — no title, no fixture, no book count, no failed read
    await expect(h1).not.toHaveText("UEFA Champions League");
    await expect(page.locator("main").getByText("Arsenal")).toHaveCount(0);
    await expect(page.getByText(/tradeable on kalshi/)).toHaveCount(0);
    await expect(page.getByText("UCL WHY")).toHaveCount(0);
    // ASEAN's own ratings answered: its absent field, not UCL's failure
    await expect(page.getByTestId("field-axes-absent")).toBeVisible();
    await expect(page.getByTestId("field-axes-error")).toHaveCount(0);

    release();
    await expect(h1).toHaveText("ASEAN Championship");
    await expect(page.getByText("ASEAN WHY")).toBeVisible();
    // ASEAN's markets 404: the count is unread, never the UCL's 33
    await expect(page.getByText(/tradeable on kalshi/)).toHaveCount(0);
    await expect(page.getByTestId("field-axes-error")).toHaveCount(0);
  });

test("a retired key's 'not served' page does not follow the reader to a served one",
  async ({ page }) => {
    await page.route("**/api/comp/ecl/fixtures**", (r) => r.fulfill(json({
      detail: "the viewer was retired on 2026-08-24" }, 404)));
    const release = await routeAsean(page);
    release();
    await page.goto("/bet-suggester/comp/ecl");
    await expect(page.getByText("not served here")).toBeVisible();
    await toAsean(page);
    await expect(page.locator("main h1")).toHaveText("ASEAN Championship");
    await expect(page.getByText("not served here")).toHaveCount(0);
    await expect(page.getByText(/retired on 2026-08-24/)).toHaveCount(0);
  });

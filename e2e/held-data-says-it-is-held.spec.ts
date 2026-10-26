/** HELD DATA SAYS IT IS HELD (2026-10-25).
 *
 *  The match hub learned this first (epl-match.spec.ts, "a failed refresh
 *  is not an up-to-date page"): a poll that fails keeps the last good
 *  payload on screen, which is right, and must SAY so, or held numbers
 *  read as current ones. Three more polled surfaces kept the payload and
 *  said nothing — they drew a failure only when there was nothing to
 *  hold (`err && !d`). Each now draws the hub's `feed-stale` line.
 *
 *  HERMETIC: every /api read is routed here; the catch-all answers 503.
 *  The clock is installed BEFORE the page loads, so it owns the poll's
 *  timers from mount.
 */
import { expect, test, type Page } from "@playwright/test";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

/** Answers `first` once, then 503 for ever. */
async function okThenDown(page: Page, glob: string, first: unknown) {
  let calls = 0;
  await page.route(glob, (r) => {
    calls += 1;
    return calls === 1 ? r.fulfill(json(first))
      : r.fulfill(json({ detail: "upstream down" }, 503));
  });
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "stub" }, 503)));
  await page.clock.install();
});

test("the competition viewer says its fixtures are held after a failed refresh",
  async ({ page }) => {
    await okThenDown(page, "**/api/comp/ucl/fixtures**", {
      display: "UEFA Champions League", count: 1,
      fixtures: [{ fixture_id: 1,
        kickoff_utc: new Date(Date.now() + 86_400_000).toISOString(),
        status: "NS", home: { name: "Arsenal" }, away: { name: "Inter" } }],
      model: { state: "no_model_by_design", why: "UCL WHY", instead: "x" },
    });
    await page.goto("/bet-suggester/comp/ucl");
    await expect(page.locator("main h1")).toHaveText("UEFA Champions League");
    await expect(page.getByTestId("feed-stale")).toHaveCount(0);
    await page.clock.runFor("01:05");
    const stale = page.getByTestId("feed-stale");
    await expect(stale).toContainText("last refresh FAILED");
    await expect(stale).toContainText("not current");
    // held, not blanked
    await expect(page.getByText("Arsenal").first()).toBeVisible();
    await expect(page.getByTestId("comp-read-failed")).toHaveCount(0);
  });

test("a friendly's page says its feed is held after a failed refresh",
  async ({ page }) => {
    await okThenDown(page, "**/api/friendlies/fixtures/55**", {
      fixture: { fixture_id: 55,
        kickoff_utc: new Date(Date.now() + 86_400_000).toISOString(),
        status: "NS", status_long: "Not Started",
        home: { name: "Liverpool" }, away: { name: "Wrexham" } },
    });
    await page.goto("/bet-suggester/friendlies/55");
    await expect(page.getByText("Liverpool").first()).toBeVisible();
    await expect(page.getByTestId("feed-stale")).toHaveCount(0);
    await page.clock.runFor("00:35");
    const stale = page.getByTestId("feed-stale");
    await expect(stale).toContainText("last refresh FAILED");
    await expect(stale).toContainText("not current");
    await expect(page.getByText("Liverpool").first()).toBeVisible();
  });

test("the friendlies dashboard says its scoreboard is held after a failed refresh",
  async ({ page }) => {
    await okThenDown(page, "**/api/friendlies/scoreboard", {
      fixtures: [{ id: "1", date: new Date().toISOString(), state: "pre",
        detail: "Scheduled", venue: "Test Ground",
        home: { name: "Liverpool" }, away: { name: "Wrexham" } }],
    });
    for (const glob of ["**/api/friendlies/markets",
      "**/api/friendlies/schedule**", "**/api/xg/friendlies**"]) {
      await page.route(glob, (r) => r.fulfill(json({ fixtures: [] })));
    }
    await page.goto("/bet-suggester/friendlies");
    await expect(page.getByText("Liverpool").first()).toBeVisible();
    await expect(page.getByTestId("feed-stale")).toHaveCount(0);
    await page.clock.runFor("01:05");
    const stale = page.getByTestId("feed-stale");
    await expect(stale).toContainText("last refresh FAILED");
    await expect(stale).toContainText("not current");
    await expect(page.getByText("Liverpool").first()).toBeVisible();
  });

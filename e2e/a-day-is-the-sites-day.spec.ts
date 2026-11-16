import { expect, test, type Page } from "@playwright/test";

/* A DAY ON THE LEAGUE DASHBOARDS IS THE SITE'S DAY, WHEREVER THE READER
 * IS (audit W8-FE-03, 2026-11-15).
 *
 * The EPL and Liga MX dashboards kept private copies of the day helpers
 * that keyed a fixture's day with getFullYear/getMonth/getDate — the
 * VIEWER's calendar — while `dayLabel` printed the day in LA
 * (lib/matchday.TZ). MLS, LaLiga and the friendlies import lib/matchday,
 * which fixed exactly this. A reader in Ho Chi Minh City (UTC+7) saw an
 * EPL weekend as "Saturday, Nov 21 [12:30, 15:00] | Saturday, Nov 21
 * [17:30, 14:00 Sun, 16:30 Sun]": Sunday's games under a Saturday
 * heading, and two identical headings.
 *
 * The browser's zone is set here, so the claim is made where it failed.
 * Hermetic: every league read is answered from this file.
 */

test.use({ timezoneId: "Asia/Ho_Chi_Minh", locale: "en-US" });

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

/** A Saturday/Sunday slate a year out, so it is never "today". 12:30,
 *  15:00 and 17:30 UTC on Saturday; 14:00 and 16:30 UTC on Sunday — LA's
 *  Saturday morning and Sunday morning, HCM's Saturday evening, Sunday
 *  small hours and Sunday night. */
const SLATE = [
  ["a", "2027-11-20T12:30:00Z"], ["b", "2027-11-20T15:00:00Z"],
  ["c", "2027-11-20T17:30:00Z"], ["d", "2027-11-21T14:00:00Z"],
  ["e", "2027-11-21T16:30:00Z"],
].map(([id, date]) => ({
  id, date, state: "pre", detail: "Scheduled", venue: "Test Ground",
  home: { name: `Home ${id}` }, away: { name: `Away ${id}` },
}));

async function serve(page: Page, lg: string) {
  const bodies: Record<string, unknown> = {
    standings: { tables: [] }, "schedule**": { fixtures: [] },
    markets: { games: [] },
    "markets/discovery": { game_series: "X", series_exists: true, open_events: 0 },
    odds: { odds: [], shadow: true, model_dark: true, model_state: "dark" },
    scoreboard: { fixtures: SLATE },
  };
  for (const [path, body] of Object.entries(bodies)) {
    await page.route(`**/api/${lg}/${path}`, (r) => r.fulfill(json(body)));
  }
}

for (const lg of ["epl", "ligamx"]) {
  test(`the ${lg} slate is grouped by the LA day in a UTC+7 browser`,
    async ({ page }) => {
      await serve(page, lg);
      await page.goto(`/trivela/leagues?league=${lg}`);
      // non-vacuity: the browser really is in Ho Chi Minh City
      expect(await page.evaluate(() => new Date().getTimezoneOffset()))
        .toBe(-420);
      const sec = page.locator("section")
        .filter({ hasText: "ESPN live feed" }).first();
      await expect(sec.getByText("Home a")).toBeVisible();
      const headings = sec.locator("h4");
      await expect(headings).toHaveCount(2);
      await expect(headings.nth(0)).toContainText("Saturday, Nov 20");
      await expect(headings.nth(1)).toContainText("Sunday, Nov 21");
      // and Sunday's games sit under Sunday
      const sunday = headings.nth(1).locator("xpath=..");
      await expect(sunday).toContainText("Home d");
      await expect(sunday).toContainText("Home e");
      await expect(sunday).not.toContainText("Home c");
    });
}

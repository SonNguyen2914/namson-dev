import { expect, test } from "@playwright/test";

// REVIEW FINDING 6 (2026-10-25): a time printed in the VIEWER's zone. The
// site prints every kickoff and clock in one zone, America/Los_Angeles
// (lib/matchday.ts TZ — the operator's, said, not inferred); the friendly
// match page used a bare toLocaleString(). This browser sits in Tokyo so a
// time in the viewer's zone cannot pass for the site's.
// (The model-vs-market clock has its own case in model-vs-market.spec.ts.)

test.use({ timezoneId: "Asia/Tokyo", locale: "en-US" });

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body) });

test("the friendly match page prints its kickoff in Los Angeles time", async ({ page }) => {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/friendlies/fixtures/1234567**", (r) => r.fulfill(json({
    fixture: {
      fixture_id: 1234567, kickoff_utc: "2026-10-26T18:00:00Z", status: "NS",
      status_long: "Not Started", league_name: "Club Friendlies",
      home: { name: "Bayern Munich" }, away: { name: "RB Salzburg" },
      goals: { home: null, away: null },
    },
    books: { status: "unmapped" },
  })));
  await page.goto("/bet-suggester/friendlies/1234567");
  const k = page.getByText(/11:00\s?AM PDT/);
  await expect(k).toBeVisible();
  // and not Tokyo's 3:00 the next morning
  await expect(page.getByText(/3:00:00\s?AM/)).toHaveCount(0);
});

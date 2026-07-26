import { expect, test } from "@playwright/test";

// Two defects reported from the live MLS hub on 2026-07-26, both pinned
// here against RECORDED payloads so they fail deterministically:
//
//  1. the fixture card said only "Scheduled" — which hid that the match
//     under "Today's slate" was four days away (ESPN's scoreboard
//     returns the next matchday when nothing is on today);
//  2. every Western club appeared TWICE in the standings, once in each
//     table, because ESPN's child named "Eastern Conference" carried all
//     30 clubs. A Western club sat top of the Eastern table.

const SCOREBOARD = {
  fixtures: [{
    id: "401864004",
    date: "2026-07-30T00:00Z",
    state: "pre",
    detail: "Scheduled",
    venue: "Bank of America Stadium",
    home: { name: "MLS All-Stars", abbrev: "MLS" },
    away: { name: "Liga MX All-Stars", abbrev: "LIGA" },
  }],
};

// what the corrected backend now returns: each club once, in its own
// conference, ranked 1..n
const STANDINGS = {
  conferences: [
    {
      conference: "Eastern Conference",
      entries: [
        { team: "Nashville SC", abbrev: "NSH", rank: 1, played: 17,
          wins: 12, losses: 2, ties: 3, points: 39, goal_diff: 21 },
        { team: "Inter Miami CF", abbrev: "MIA", rank: 2, played: 17,
          wins: 11, losses: 2, ties: 4, points: 37, goal_diff: 13 },
      ],
    },
    {
      conference: "Western Conference",
      entries: [
        { team: "Vancouver Whitecaps", abbrev: "VAN", rank: 1, played: 16,
          wins: 10, losses: 3, ties: 3, points: 33, goal_diff: 21 },
        { team: "LAFC", abbrev: "LAFC", rank: 2, played: 18,
          wins: 10, losses: 5, ties: 3, points: 33, goal_diff: 16 },
      ],
    },
  ],
};

async function serve(page: import("@playwright/test").Page) {
  await page.route("**/api/mls/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(SCOREBOARD) }));
  await page.route("**/api/mls/standings", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(STANDINGS) }));
  await page.route("**/api/mls/schedule**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: [] }) }));
  await page.route("**/api/mls/markets", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ games: [] }) }));
  await page.route("**/api/mls/odds", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ odds: [] }) }));
}

test.describe("MLS hub", () => {
  test("an upcoming fixture shows WHEN it kicks off, not 'Scheduled'",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=mls");
      await expect(page.getByText("MLS All-Stars").first()).toBeVisible();
      // the bare provider string must be gone from the card
      await expect(page.getByText(/^scheduled$/i)).toHaveCount(0);
      // and a real date + time must be there instead. The fixture is
      // 2026-07-30T00:00Z, which is Jul 29 or 30 depending on the
      // viewer's timezone — assert the shape, not one timezone's answer.
      await expect(
        page.getByText(/JUL\s+(29|30).*\d{1,2}:\d{2}/i).first()
      ).toBeVisible();
    });

  test("no club is listed in two conferences", async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester?league=mls");
    await expect(page.getByText("Nashville SC").first()).toBeVisible();
    // the exact defect: a Western club rendered in BOTH tables
    await expect(page.getByText("Vancouver Whitecaps")).toHaveCount(1);
    await expect(page.getByText("LAFC")).toHaveCount(1);
    await expect(page.getByText("Nashville SC")).toHaveCount(1);
  });

  test("each conference ranks its clubs 1..n with no repeats",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=mls");
      await expect(page.getByText("Nashville SC").first()).toBeVisible();
      const body = (await page.locator("body").innerText())
        .replace(/\s+/g, " ");
      // Vancouver is a WESTERN club — it must not lead the East
      const east = body.indexOf("EASTERN CONFERENCE");
      const west = body.indexOf("WESTERN CONFERENCE");
      expect(east).toBeGreaterThan(-1);
      expect(west).toBeGreaterThan(-1);
      const eastBlock = body.slice(east, west > east ? west : undefined);
      expect(eastBlock).not.toMatch(/Vancouver/);
      expect(eastBlock).toMatch(/Nashville SC/);
    });
});

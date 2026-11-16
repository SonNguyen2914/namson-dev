import { expect, test, type Page } from "@playwright/test";
import { shortClub, shortClubPair } from "../src/lib/clubName";

/* THE TWO STRENGTH CHIPS ON A FRIENDLY (audit W8-FE-04 and W8-FE-05,
 * 2026-11-15). Each chip is "CLUB nn%", and the pair is read as a
 * split of one fixture's points.
 *
 *   04 — the friendlies table rounded each side on its own, so 0.125 /
 *        0.875 printed "13% · 88%" (101) and 0.505 / 0.495 "51% · 50%".
 *        lib/pointsShare.shareChips exists for exactly this, and the
 *        competition page already uses it.
 *   05 — shortClub cuts each name to its longest word, so a same-city
 *        pair collapsed to one label: Manchester United / Manchester
 *        City both read MANCHESTE, and the chip that exists to say whose
 *        percentage is whose said nothing.
 *
 * Hermetic: the friendlies page's reads are answered from this file.
 */

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b),
});

// ----------------------------------------------------------- the rule

test("same-city pairs get labels that tell them apart", () => {
  // the defect, demonstrated on the single-name labeller
  expect(shortClub("Manchester United")).toBe(shortClub("Manchester City"));
  expect(shortClubPair("Manchester United", "Manchester City"))
    .toEqual({ home: "UNITED", away: "CITY" });
  expect(shortClubPair("Newcastle United", "Newcastle Jets"))
    .toEqual({ home: "UNITED", away: "JETS" });
  expect(shortClubPair("Sporting CP", "Sporting Kansas City"))
    .toEqual({ home: "CP", away: "KANSAS" });
  // CONTROL: labels that already differ are exactly shortClub's
  expect(shortClubPair("FC Augsburg", "Wolverhampton Wanderers"))
    .toEqual({ home: "AUGSBURG", away: "WOLVERHAM" });
});

// ---------------------------------------------------------- the page

async function serve(page: Page, home: string, away: string,
  share: { home: number; away: number }) {
  await page.route("**/api/friendlies/fixtures**", (r) => r.fulfill(json({
    fixtures: [{
      fixture_id: 1,
      kickoff_utc: new Date(Date.now() + 864e5).toISOString(),
      status: "NS", league_name: "Club Friendlies", venue: "Test Ground",
      home: { name: home }, away: { name: away },
      goals: { home: null, away: null },
      kalshi: { state: "bridged", event_ticker: "KXCLUBFGAME-TEST" },
      market_vs_read: null,
      strength: {
        available: true, expected_points_share: share, source: "clubelo",
        home: { club: home, rated: true, rating: 1900, source: "clubelo" },
        away: { club: away, rated: true, rating: 1500, source: "clubelo" },
      },
    }],
    count: 1, kalshi_only: [], kalshi_registry_read: true,
    finished_hidden: 0, kalshi_tradeable_total: 1, kalshi_listed_total: 1,
  })));
  await page.route("**/api/friendlies/scoreboard", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/friendlies/markets", (r) =>
    r.fulfill(json({ fixtures: [], listed: null })));
  await page.route("**/api/friendlies/schedule**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/xg/friendlies**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.goto("/trivela/friendlies");
}

const percents = (text: string) =>
  [...text.matchAll(/(\d+)%/g)].map((m) => Number(m[1]));

test("the friendlies chips sum to 100", async ({ page }) => {
  await serve(page, "Chelsea", "Kawasaki", { home: 0.875, away: 0.125 });
  const chips = page.getByText(/\d+%\s*·\s*\d+%/).first();
  await expect(chips).toBeVisible();
  const [h, a] = percents(await chips.innerText());
  expect(h + a, `printed ${h}% · ${a}%`).toBe(100);
  expect([h, a]).toEqual([88, 12]);
});

test("a Manchester derby's chips name both clubs", async ({ page }) => {
  await serve(page, "Manchester United", "Manchester City",
    { home: 0.45, away: 0.55 });
  const chips = page.getByText(/\d+%\s*·\s*\d+%/).first();
  await expect(chips).toBeVisible();
  const text = await chips.innerText();
  expect(text).toMatch(/UNITED\s*45%/);
  expect(text).toMatch(/55%\s*CITY/);
  expect(text).not.toContain("MANCHESTE");
});

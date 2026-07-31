import { expect, test } from "@playwright/test";

// La Liga hub — hermetic, recorded-shape payloads (no backend). The
// three assertions that matter are decision-safety invariants:
//
//  1. PRESEASON standings arrive as tables=[] + preseason=true (the
//     backend suppresses ESPN's real 20-row all-zero payload). The
//     surface must show the explicit reason — never a zero-row table
//     that reads as a season, never a bare "unavailable".
//  2. The model is DARK (laliga-2026-v0 has no approval): no odds chip
//     may render, the dark state must be stated in words, and no bare
//     TAKE may appear anywhere.
//  3. Kalshi coverage is unverified: the books empty state carries the
//     probe's answer (series listed, no 2026-27 events), not a guess.

const SCOREBOARD = {
  fixtures: [{
    id: "401882926",
    date: "2026-08-15T17:30Z",
    state: "pre",
    detail: "Sat, August 15th at 1:30 PM EDT",
    venue: "Mendizorrotza",
    home: { name: "Alavés", abbrev: "ALA" },
    away: { name: "Getafe", abbrev: "GET" },
  }],
};

const PRESEASON_STANDINGS = { tables: [], preseason: true,
                              generated_at: "2026-07-28T12:00:00Z" };

const MARKETS = {
  games: [],
  futures: [],
  kalshi: { series: "KXLALIGAGAME", series_exists: true,
            open_events: 0, coverage_verified: false },
};

const DARK_ODDS = { odds: [], shadow: true, model_dark: true,
                    real_money_signals: false };

async function serve(page: import("@playwright/test").Page) {
  await page.route("**/api/laliga/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(SCOREBOARD) }));
  await page.route("**/api/laliga/standings", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(PRESEASON_STANDINGS) }));
  await page.route("**/api/laliga/schedule**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: SCOREBOARD.fixtures }) }));
  await page.route("**/api/laliga/markets", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(MARKETS) }));
  await page.route("**/api/laliga/odds", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(DARK_ODDS) }));
}

test.describe("La Liga hub", () => {
  test("preseason standings show the explicit reason, never a zero table",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(
        page.getByText(/no standings yet.*season kicks off/i)
      ).toBeVisible();
      // no standings table may exist (the fixture list is a list, not
      // a table — so an accidental zero-row TABLE is detectable)
      await expect(page.locator("table")).toHaveCount(0);
      await expect(page.getByText(/^standings unavailable$/i))
        .toHaveCount(0);
    });

  test("dark model: no odds chip, the dark state is stated, no bare TAKE",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(page.getByText("Alavés").first()).toBeVisible();
      // the dark posture is stated in words on the markets section
      await expect(page.getByText(/laliga-2026-v0 is\s+dark/i))
        .toBeVisible();
      // no shadow-odds chip renders anywhere (H · D · A pattern)
      await expect(page.getByText(/H \d+ · D \d+ · A \d+/)).toHaveCount(0);
      // decision safety: never a bare TAKE on any league surface
      await expect(page.getByText(/\bTAKE\b/)).toHaveCount(0);
    });

  test("books empty state carries the probe's verified answer",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(
        page.getByText(/kalshi lists the KXLALIGAGAME series but no 2026-27 events yet/i)
      ).toBeVisible();
    });

  test("fixture card shows WHEN it kicks off and accented names intact",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(page.getByText("Alavés").first()).toBeVisible();
      // the derived kickoff (Aug 15/16 depending on viewer TZ), never
      // the provider's bare detail string
      await expect(
        page.getByText(/AUG\s+1[56].*\d{1,2}:\d{2}/i).first()
      ).toBeVisible();
    });
});

test.describe("La Liga match page", () => {
  const MATCH = {
    match: {
      id: "401882926", date: "2026-08-15T17:30Z", state: "pre",
      detail: "Sat, August 15th", venue: "Mendizorrotza",
      home: { name: "Alavés", abbrev: "ALA" },
      away: { name: "Getafe", abbrev: "GET" },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [], model: null, lineups: null,
  };

  test("dark model is stated on the hero and in the model bar",
    async ({ page }) => {
      await page.route("**/api/laliga/match/401882926", (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH) }));
      await page.goto("/bet-suggester/laliga/401882926");
      await expect(
        page.getByText(/dark — no approval, no prediction/i)
      ).toBeVisible();
      await expect(
        page.getByText(/no approved model, so no prediction exists/i)
      ).toBeVisible();
      // the market bar's own empty state (no open book matched)
      await expect(
        page.getByText(/no open kalshi book matched/i)
      ).toBeVisible();
      // decision safety holds here too
      await expect(page.getByText(/\bTAKE\b/)).toHaveCount(0);
      await expect(page.getByText(/shadow/i).first()).toBeVisible();
    });
});

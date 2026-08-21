import { expect, test } from "@playwright/test";

// V9.3 eval F18: the existing E2E tests depend on a live backend, current
// production data and a hard-coded fixture — useful smoke tests, but they
// cannot fail deterministically and they cannot cover states production
// does not happen to be in right now.
//
// These tests serve a RECORDED payload from the route layer instead, so
// they are hermetic: same input, same assertion, every run. They pin the
// decision-safety behaviour that must hold for states we cannot summon on
// demand — an unreleased lineup, a stale model run, a missing quote.

const EVENT = "999999";

function payload(over: Record<string, unknown> = {}) {
  return {
    match: {
      id: EVENT, date: "2026-07-25T23:30Z", state: "pre",
      detail: "Pre", venue: "Test Park",
      home: { name: "Alpha FC", abbrev: "ALP", score: null },
      away: { name: "Beta FC", abbrev: "BET", score: null },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [], model: null, lineups: null,
    generated_at: new Date().toISOString(),
    ...over,
  };
}

async function serve(page: import("@playwright/test").Page, body: unknown) {
  await page.route(`**/api/mls/match/${EVENT}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(body) }));
  // the match hub now mounts the suggestion card; stub its fetch so
  // this spec stays hermetic (no backend involved)
  await page.route("**/api/card/**", (route) =>
    route.fulfill({ status: 404, contentType: "application/json",
                    body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
}

test.describe("deterministic contract tests (recorded payloads)", () => {
  test("an UNRELEASED lineup never renders absences as fact", async ({ page }) => {
    await serve(page, payload({
      lineups: {
        strength_available: true,
        home: { formation: null, confirmed: false, released: false,
                starters: [], bench: [], goalkeeper: null,
                key_absences: [] },
        away: { formation: null, confirmed: false, released: false,
                starters: [], bench: [], goalkeeper: null,
                key_absences: [] },
      },
    }));
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await page.getByText(/team news/i).first().click();
    await expect(page.getByText(/awaiting team news/i).first()).toBeVisible();
    // the section must not claim anyone is out when no XI exists
    await expect(page.getByText(/not starting/i)).toHaveCount(0);
  });

  test("team news is labelled CURRENT, never as the frozen T-10 input",
    async ({ page }) => {
      await serve(page, payload({
        lineups: {
          strength_available: true,
          home: { formation: "4-3-3", confirmed: true, released: true,
                  goalkeeper: "Keeper One", bench: [],
                  starters: Array.from({ length: 11 }, (_, i) => ({
                    name: `Player ${i}`, position: i === 0 ? "G" : "M",
                    jersey: String(i + 1), xg90: 0.1, apps: 5,
                    is_goalkeeper: i === 0 })),
                  key_absences: [{ name: "Star Striker", xg90: 0.62,
                                   apps: 9, status: "out" }] },
          away: null,
        },
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // a RELEASED lineup opens the section by default — clicking here
      // would close it
      await expect(page.getByText(/frozen at t-10/i).first()).toBeVisible();
      await expect(page.getByText(/star striker/i).first()).toBeVisible();
      await expect(page.getByText(/the model does not use lineups/i).first())
        .toBeVisible();
    });

  test("no model run: explicit empty state, never fabricated numbers",
    async ({ page }) => {
      await serve(page, payload());          // model: null
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // wait for the fixture to actually render before reading the body
      await expect(page.getByText("Alpha FC").first()).toBeVisible();
      const body = await page.locator("body").innerText();
      // it must render the fixture rather than an error shell...
      expect(body).toMatch(/Alpha FC/);
      expect(body).toMatch(/Beta FC/);
      // ...and must never surface arithmetic on absent data
      expect(body).not.toMatch(/NaN|undefined|Infinity/);
      // the model section may still be present, but it must say plainly
      // that there is nothing, rather than render an empty/zero bar that
      // reads as a real forecast
      expect(body).toMatch(/no completed prediction run/i);
      expect(body).not.toMatch(/\b0\.0%|\b0%\s*draw/i);
      // and the shadow framing survives the empty state
      expect(body).toMatch(/shadow mode|not advice|recommendations disabled/i);
    });

  test("scouting rows: the result letter always matches its own scoreline",
    async ({ page }) => {
      await serve(page, payload({
        match: {
          ...payload().match,
          scouting: {
            last_five: [{
              team: "Alpha FC", abbrev: "ALP", form: "W L D",
              games: [
                { result: "W", team_score: 3, opponent_score: 1,
                  at_vs: "vs", opponent: "BET", date: "2026-05-01" },
                { result: "L", team_score: 0, opponent_score: 2,
                  at_vs: "@", opponent: "GAM", date: "2026-05-08" },
                { result: "D", team_score: 1, opponent_score: 1,
                  at_vs: "vs", opponent: "DEL", date: "2026-05-15" },
              ],
            }],
            head_to_head: [],
          },
        },
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await page.getByText(/ESPN form/i).first().click();
      const rows = await page.locator('div.font-mono.text-\\[11px\\]').all();
      let checked = 0;
      for (const r of rows) {
        const txt = (await r.innerText()).replace(/\s+/g, " ").trim();
        const m = txt.match(/^([WLD])\s+(\d+)[–-](\d+)/);
        if (!m) continue;
        const [, letter, a, b] = m;
        expect(letter).toBe(+a > +b ? "W" : +a < +b ? "L" : "D");
        checked++;
      }
      expect(checked).toBeGreaterThan(0);
    });
});

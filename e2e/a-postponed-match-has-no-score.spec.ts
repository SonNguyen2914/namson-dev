import { expect, test, type Page } from "@playwright/test";
import { POSTPONED_NO_RESULT } from "../src/lib/notPlayed";

/* A MATCH THAT WAS NOT PLAYED HAS NO SCORE (audit W8-FE-02, 2026-11-15).
 *
 * ESPN serves a postponed, cancelled, abandoned or suspended match with
 * state `post` — or still `pre` — and scores "0". The backend tags it
 * `postponed: true` and says beside the tag that those scores are NOT a
 * result (TRIVELA src/mls.py parse_event and the match summary, via
 * src/live/final_result.is_not_played). The hub drew a big "0–0" and
 * titled the tab "NE 0–0 MIA · MLS"; the league dashboards printed each
 * side's 0 beside "Postponed"; a postponed match still `pre` got a live
 * countdown to a kickoff that is not happening.
 *
 * Fixtures speak the wire's vocabulary: `postponed` is the key the
 * backend emits, and "0" is what ESPN sends beside it. Hermetic.
 */

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const EVENT = "401879377";

function hubPayload(match: Record<string, unknown>) {
  return {
    match: {
      id: EVENT, venue: "Gillette Stadium",
      home: { name: "New England Revolution", abbrev: "NE", score: "0" },
      away: { name: "Inter Miami CF", abbrev: "MIA", score: "0" },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
      ...match,
    },
    book: null, books: [], model: null, lineups: null,
    generated_at: new Date().toISOString(),
  };
}

async function openHub(page: Page, match: Record<string, unknown>) {
  await page.route("**/api/card/**", (r) =>
    r.fulfill(json({ error: "no live-plane fixture in this recorded world" }, 404)));
  await page.route(`**/api/mls/match/${EVENT}`, (r) =>
    r.fulfill(json(hubPayload(match))));
  await page.goto(`/trivela/mls/${EVENT}`);
  await expect(page.getByText("New England Revolution").first()).toBeVisible();
}

test.describe("the match hub", () => {
  test("a postponed match (ESPN state post, scores 0) shows no score",
    async ({ page }) => {
      await openHub(page, {
        state: "post", detail: "Postponed", postponed: true,
        date: "2026-10-18T23:30:00Z",
      });
      await expect(page.getByText(POSTPONED_NO_RESULT)).toBeVisible();
      // never the score ESPN sent beside the tag
      await expect(page.getByText("0–0")).toHaveCount(0);
      // and the tab title is the fixture, not a result
      await expect(page).toHaveTitle(/NE vs MIA/);
      expect(await page.title()).not.toMatch(/0–0/);
    });

  test("a postponed match still `pre` gets no countdown", async ({ page }) => {
    await openHub(page, {
      state: "pre", detail: "Postponed", postponed: true,
      date: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    });
    await expect(page.getByText(POSTPONED_NO_RESULT)).toBeVisible();
    await expect(page.getByText(/^in \d/)).toHaveCount(0);
  });

  test("CONTROL: a played match keeps its score and title", async ({ page }) => {
    await openHub(page, {
      state: "post", detail: "FT", postponed: false,
      date: "2026-10-18T23:30:00Z",
      home: { name: "New England Revolution", abbrev: "NE", score: "2" },
      away: { name: "Inter Miami CF", abbrev: "MIA", score: "1" },
    });
    await expect(page.getByText("2–1", { exact: true }).first()).toBeVisible();
    await expect(page).toHaveTitle(/NE 2–1 MIA/);
    await expect(page.getByText(POSTPONED_NO_RESULT)).toHaveCount(0);
  });
});

// --------------------------------------------------- the dashboards

const fixture = (id: string, over: Record<string, unknown>) => ({
  id, date: "2026-10-18T23:30:00Z", venue: "Test Ground",
  home: { name: `Home ${id}`, score: "0" },
  away: { name: `Away ${id}`, score: "0" },
  ...over,
});

async function serveDashboard(page: Page, lg: string, fixtures: unknown[]) {
  const empty: Record<string, unknown> = {
    standings: { tables: [] }, "schedule**": { fixtures: [] },
    markets: { games: [] },
    "markets/discovery": { game_series: "X", series_exists: true, open_events: 0 },
    odds: { odds: [], shadow: true, model_dark: true, model_state: "dark" },
    status: {},
  };
  for (const [path, body] of Object.entries(empty)) {
    await page.route(`**/api/${lg}/${path}`, (r) => r.fulfill(json(body)));
  }
  await page.route(`**/api/${lg}/scoreboard`, (r) =>
    r.fulfill(json({ fixtures })));
}

for (const lg of ["mls", "epl", "laliga", "ligamx"]) {
  test(`the ${lg} dashboard prints no score for a postponed fixture`,
    async ({ page }) => {
      await serveDashboard(page, lg, [
        fixture("p1", { state: "post", detail: "Postponed", postponed: true }),
        // CONTROL: a played 0–0 keeps its zeros
        fixture("f1", { state: "post", detail: "FT", postponed: false }),
      ]);
      await page.goto(`/trivela/leagues?league=${lg}`);
      const pp = page.locator(`a[href="/trivela/${lg}/p1"]`);
      const ft = page.locator(`a[href="/trivela/${lg}/f1"]`);
      await expect(pp).toBeVisible();
      await expect(pp).toContainText(POSTPONED_NO_RESULT);
      expect(await pp.innerText()).not.toMatch(/(^|\s)0(\s|$)/);
      await expect(ft).toBeVisible();
      expect(await ft.innerText()).toMatch(/(^|\s)0(\s|$)/);
    });
}

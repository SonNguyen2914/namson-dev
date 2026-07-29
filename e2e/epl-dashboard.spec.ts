import { expect, test } from "@playwright/test";

// EPL hub invariants, pinned against RECORDED payloads so they fail
// deterministically. Two are EPL-specific honesty guards:
//
//  1. PRESEASON STANDINGS: ESPN serves 20 all-zero rows ranked
//     alphabetically before a ball is kicked (archived 2026-07-28).
//     The backend withholds the table ([]); the hub must render the
//     explicit "season not started" state — never a zero table that
//     crowns AFC Bournemouth.
//  2. DARK MODEL: epl-2026-v0 is unapproved and produces no output.
//     The odds board arrives empty with model_dark=true; no fixture
//     card may show an odds chip, and the dark status must be stated
//     in words.
//
// The matchday-heading rules are the same derived-not-asserted contract
// the MLS hub enforces (ESPN's bucket is a matchday, not a day — and
// preseason the default bucket is WEEKS away, so it matters more here).

function fixture(id: string, date: string, home: string, away: string) {
  return { id, date, state: "pre", detail: "Scheduled",
           venue: "Test Ground", home: { name: home }, away: { name: away } };
}

// A fixture N days out pinned to a UTC hour; 12:00Z and 13:00Z share a
// local calendar day at every offset from -12 to +14.
function inDays(n: number, utcHour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toISOString();
}

async function serve(page: import("@playwright/test").Page, opts?: {
  scoreboard?: unknown; tables?: unknown[]; odds?: unknown;
  oddsStatus?: number;
}) {
  await page.route("**/api/epl/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(opts?.scoreboard ?? { fixtures: [
                  fixture("401879301", inDays(24, 19),
                          "Arsenal", "Coventry City")] }) }));
  await page.route("**/api/epl/standings", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ tables: opts?.tables ?? [] }) }));
  await page.route("**/api/epl/schedule**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: [] }) }));
  await page.route("**/api/epl/markets", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ games: [] }) }));
  await page.route("**/api/epl/markets/discovery", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ game_series: "KXEPLGAME",
                  series_exists: true, open_events: 0 }) }));
  await page.route("**/api/epl/odds", (r) => {
    if (opts?.oddsStatus && opts.oddsStatus >= 400) {
      return r.fulfill({ status: opts.oddsStatus,
                         contentType: "application/json",
                         body: JSON.stringify({ detail: "boom" }) });
    }
    return r.fulfill({ status: 200, contentType: "application/json",
                       body: JSON.stringify(opts?.odds
                         ?? { odds: [], shadow: true, model_dark: true,
                              model_state: "dark" }) });
  });
}

test.describe("EPL hub", () => {
  test("preseason standings render the explicit empty state, never a zero table",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=epl");
      await expect(page.getByText(/season not started/i)).toBeVisible();
      // no standings table exists — and in particular no club sits at #1
      await expect(page.getByText("AFC Bournemouth")).toHaveCount(0);
      await expect(page.locator("table")).toHaveCount(0);
    });

  test("a real table renders once games have been played", async ({ page }) => {
    await serve(page, { tables: [{
      table: "2026-27 English Premier League",
      entries: [
        { team: "Liverpool", abbrev: "LIV", rank: 1, played: 3,
          wins: 3, losses: 0, ties: 0, points: 9, goal_diff: 6 },
        { team: "Arsenal", abbrev: "ARS", rank: 2, played: 3,
          wins: 2, losses: 0, ties: 1, points: 7, goal_diff: 4 },
      ],
    }] });
    await page.goto("/bet-suggester?league=epl");
    await expect(page.getByText("Liverpool").first()).toBeVisible();
    await expect(page.getByText(/season not started/i)).toHaveCount(0);
    // rank order INSIDE the table (the page also shows Arsenal in a
    // fixture card above it, so the scope matters)
    const table = (await page.locator("table").innerText())
      .replace(/\s+/g, " ");
    expect(table.indexOf("Liverpool")).toBeLessThan(
      table.indexOf("Arsenal"));
  });

  test("the dark model is stated in words and paints no odds chip",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=epl");
      await expect(page.getByText(/epl-2026-v0 — dark/i)).toBeVisible();
      // dark = no model numbers anywhere: no H/D/A chip renders
      await expect(page.getByText(/H \d+ · D \d+ · A \d+/)).toHaveCount(0);
      // and the empty market state names the verified series reality
      await expect(
        page.getByText(/lists no 2026-27 events yet/i)).toBeVisible();
    });

  // --- P0-5: approval, empty data and failure are THREE states --------
  // The hub initialised `modelDark` to true and never left it on a
  // failed fetch, so a broken backend rendered as a deliberate design
  // decision — the one story a reader accepts and stops investigating.

  test("an APPROVED model with no runs says so — never 'dark'",
    async ({ page }) => {
      await serve(page, { odds: { odds: [], shadow: true,
                                  model_dark: false,
                                  model_state: "approved_no_runs" } });
      await page.goto("/bet-suggester?league=epl");
      await expect(
        page.getByTestId("model-status-approved_no_runs")).toBeVisible();
      await expect(page.getByText(/approved \/ no runs/i)).toBeVisible();
      await expect(page.getByText(/epl-2026-v0 — dark/i)).toHaveCount(0);
    });

  test("a REJECTED odds fetch says unavailable — never 'dark'",
    async ({ page }) => {
      await serve(page, { oddsStatus: 503 });
      await page.goto("/bet-suggester?league=epl");
      await expect(
        page.getByTestId("model-status-unavailable")).toBeVisible();
      await expect(page.getByText(/model status · unavailable/i))
        .toBeVisible();
      await expect(page.getByText(/epl-2026-v0 — dark/i)).toHaveCount(0);
    });

  test("only an explicit unapproved answer paints the dark block",
    async ({ page }) => {
      await serve(page);            // model_state: "dark"
      await page.goto("/bet-suggester?league=epl");
      await expect(page.getByTestId("model-status-dark")).toBeVisible();
      await expect(
        page.getByTestId("model-status-unavailable")).toHaveCount(0);
      await expect(
        page.getByTestId("model-status-approved_no_runs")).toHaveCount(0);
    });

  test("an APPROVED model with runs shows odds and no status block",
    async ({ page }) => {
      await serve(page, { odds: { shadow: true, model_dark: false,
        model_state: "approved",
        odds: [{ espn_event_id: "401879301", run_type: "scheduled",
                 outcomes: { home_win: 0.5, draw: 0.25,
                             away_win: 0.25 } }] } });
      await page.goto("/bet-suggester?league=epl");
      await expect(page.getByText(/H 50 · D 25 · A 25/)).toBeVisible();
      await expect(page.getByText(/model status ·/i)).toHaveCount(0);
    });

  test("an upcoming fixture shows WHEN it kicks off, not 'Scheduled'",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=epl");
      await expect(page.getByText("Coventry City").first()).toBeVisible();
      await expect(page.getByText(/^scheduled$/i)).toHaveCount(0);
    });

  // ESPN's bucket is a matchday: preseason it returns fixtures WEEKS
  // away, so asserting "Today's slate" would be wrong most of the time.
  const slate = (page: import("@playwright/test").Page) =>
    page.locator("section").filter({ hasText: "ESPN live feed" }).first();

  test("a future matchday is not labelled Today's slate", async ({ page }) => {
    await serve(page, { scoreboard: { fixtures: [
      fixture("f1", inDays(24), "Arsenal", "Coventry City")] } });
    await page.goto("/bet-suggester?league=epl");
    const sec = slate(page);
    await expect(sec.getByText("Arsenal")).toBeVisible();
    await expect(sec.locator("h3")).toContainText("Next matchday");
    await expect(sec.locator("h3")).not.toContainText("Today's slate");
    await expect(sec.locator("h4")).toHaveCount(1);
  });

  test("today's fixtures keep the Today's slate heading", async ({ page }) => {
    await serve(page, { scoreboard: { fixtures: [
      fixture("f1", new Date().toISOString(), "Arsenal", "Chelsea")] } });
    await page.goto("/bet-suggester?league=epl");
    const sec = slate(page);
    await expect(sec.getByText("Arsenal")).toBeVisible();
    await expect(sec.locator("h3")).toContainText("Today's slate");
    await expect(sec.locator("h4")).toHaveCount(0);
  });

  test("one evening stays one group, even across two UTC dates",
    async ({ page }) => {
      await serve(page, { scoreboard: { fixtures: [
        fixture("f1", inDays(3, 12), "Arsenal", "Chelsea"),
        fixture("f2", inDays(3, 13), "Everton", "Fulham")] } });
      await page.goto("/bet-suggester?league=epl");
      const sec = slate(page);
      await expect(sec.getByText("Arsenal")).toBeVisible();
      await expect(sec.getByText("Everton")).toBeVisible();
      await expect(sec.locator("h4")).toHaveCount(1);
    });

  test("fixtures on different days are separated", async ({ page }) => {
    await serve(page, { scoreboard: { fixtures: [
      fixture("f1", inDays(3), "Arsenal", "Chelsea"),
      fixture("f2", inDays(5), "Everton", "Fulham")] } });
    await page.goto("/bet-suggester?league=epl");
    const sec = slate(page);
    await expect(sec.getByText("Arsenal")).toBeVisible();
    await expect(sec.locator("h4")).toHaveCount(2);
  });
});

import { expect, test } from "@playwright/test";

// Liga MX hub — hermetic: every payload below is reduced from the REAL
// archived responses of 2026-07-29 (backend research_archive/ligamx_*),
// served via route interception so no backend is needed and nothing
// rots when the Apertura moves on.
//
// What is pinned here:
//   1. SPLIT SEASONS — every standings table carries the tournament
//      ESPN names, two tournaments render as two tables (never merged),
//      and zero tournaments render as an honest empty;
//   2. the DARK MODEL is stated in words — no odds chips, no zero bars,
//      no bare TAKE anywhere;
//   3. the matchday heading is DERIVED from the fixtures (ESPN's bucket
//      is a matchday, not a calendar day);
//   4. the not-deployed state: a backend serving 404s must produce the
//      honest unavailable/empty states, never a crash or invented data.

const TOURNAMENT = {
  name: "Torneo Apertura",
  label: "2026 Liga MX Apertura",
  season_display: "2026-27 Liga BBVA MX",
};

// real fixture 401877027 (Guadalajara at Puebla, 2026-08-01T01:00Z)
const SCOREBOARD = {
  tournament: TOURNAMENT,
  fixtures: [{
    id: "401877027",
    date: "2026-08-01T01:00Z",
    state: "pre",
    detail: "8/1 - 1:00 AM UTC",
    venue: "Estadio Cuauhtémoc",
    tournament: "torneo-apertura",
    home: { name: "Puebla", abbrev: "PUE" },
    away: { name: "Guadalajara", abbrev: "GDL" },
  }],
};

// the real Apertura table shape (top three as archived), plus what a
// played Clausura child will look like — the same club in BOTH tables
// is correct (separate tournaments), merging them is the defect.
const STANDINGS = {
  tables: [
    {
      table: "2026 Torneo Apertura", tournament: "2026 Torneo Apertura",
      entries: [
        { team: "Tijuana", abbrev: "TIJ", rank: 1, played: 2,
          wins: 2, losses: 0, ties: 0, points: 6, goal_diff: 4 },
        { team: "Cruz Azul", abbrev: "CAZ", rank: 2, played: 2,
          wins: 2, losses: 0, ties: 0, points: 6, goal_diff: 3 },
        { team: "América", abbrev: "AME", rank: 3, played: 2,
          wins: 1, losses: 0, ties: 1, points: 4, goal_diff: 2 },
      ],
    },
    {
      table: "2027 Torneo Clausura", tournament: "2027 Torneo Clausura",
      entries: [
        { team: "América", abbrev: "AME", rank: 1, played: 1,
          wins: 1, losses: 0, ties: 0, points: 3, goal_diff: 2 },
        { team: "Tijuana", abbrev: "TIJ", rank: 2, played: 1,
          wins: 0, losses: 1, ties: 0, points: 0, goal_diff: -2 },
      ],
    },
  ],
};

// the real open PUECDG game book (asks/bids as archived 2026-07-29)
const MARKETS = {
  games: [{
    event_ticker: "KXLIGAMXGAME-26JUL31PUECDG",
    title: "Puebla vs Guadalajara",
    markets: [
      { ticker: "KXLIGAMXGAME-26JUL31PUECDG-CDG", label: "Guadalajara",
        yes_ask: "0.59", yes_bid: "0.58", status: "active" },
      { ticker: "KXLIGAMXGAME-26JUL31PUECDG-PUE", label: "Puebla",
        yes_ask: "0.21", yes_bid: "0.20", status: "active" },
      { ticker: "KXLIGAMXGAME-26JUL31PUECDG-TIE", label: "Tie",
        yes_ask: "0.21", yes_bid: "0.20", status: "active" },
    ],
  }],
};

function inDays(n: number, utcHour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toISOString();
}

function fixture(id: string, date: string, home: string, away: string) {
  return { id, date, state: "pre", detail: "Scheduled",
           venue: "Estadio Test", tournament: "torneo-apertura",
           home: { name: home }, away: { name: away } };
}

type Pg = import("@playwright/test").Page;

async function serve(page: Pg, overrides: {
  scoreboard?: unknown; standings?: unknown; markets?: unknown;
} = {}) {
  await page.route("**/api/ligamx/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(overrides.scoreboard ?? SCOREBOARD) }));
  await page.route("**/api/ligamx/standings", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(overrides.standings ?? STANDINGS) }));
  await page.route("**/api/ligamx/schedule**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: [] }) }));
  await page.route("**/api/ligamx/markets", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(overrides.markets ?? MARKETS) }));
  // the DARK reality: the odds board is an explicit empty
  await page.route("**/api/ligamx/odds", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ odds: [], shadow: true,
                                       model_dark: true }) }));
}

test.describe("Liga MX board", () => {
  test("standings tables carry the tournament label", async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester?league=ligamx");
    await expect(page.getByText("2026 Torneo Apertura")).toBeVisible();
    // and the split-season explainer names both tournaments
    await expect(page.getByText(/Apertura \(Jul–Dec\)/)).toBeVisible();
  });

  test("two tournaments are two tables — never merged", async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester?league=ligamx");
    await expect(page.getByText("2026 Torneo Apertura")).toBeVisible();
    await expect(page.getByText("2027 Torneo Clausura")).toBeVisible();
    // the same club appears once PER TOURNAMENT TABLE (here: both)
    await expect(page.getByRole("cell", { name: "Tijuana" })).toHaveCount(2);
    await expect(page.getByRole("cell", { name: "América" })).toHaveCount(2);
    await expect(page.getByRole("cell", { name: "Cruz Azul" })).toHaveCount(1);
  });

  test("no tournament played yet is an honest empty, not a table",
    async ({ page }) => {
      await serve(page, { standings: { tables: [] } });
      await page.goto("/bet-suggester?league=ligamx");
      await expect(
        page.getByText(/no tournament has produced a result yet/i)
      ).toBeVisible();
    });

  test("the dark model is stated in words and no odds render",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=ligamx");
      await expect(page.getByText(/liga-mx-2026-v0 is/).first()).toBeVisible();
      const body = (await page.locator("body").innerText());
      expect(body).toMatch(/dark/i);
      expect(body).toMatch(/unapproved/i);
      // decision safety: never a bare TAKE, nowhere
      expect(body).not.toMatch(/\bTAKE\b/);
      // the dark board renders no shadow odds chip (H · D · A)
      expect(body).not.toMatch(/H \d+ · D \d+ · A \d+/);
    });

  test("real Kalshi books render with both sides (ask / bid)",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=ligamx");
      await expect(page.getByText("Puebla vs Guadalajara")).toBeVisible();
      await expect(page.getByText("59¢ / 58¢")).toBeVisible();
    });

  test("a future matchday is not labelled Today's slate", async ({ page }) => {
    await serve(page, { scoreboard: { tournament: TOURNAMENT, fixtures: [
      fixture("f1", inDays(3), "Toluca", "Necaxa")] } });
    await page.goto("/bet-suggester?league=ligamx");
    const sec = page.locator("section")
      .filter({ hasText: "ESPN live feed" }).first();
    await expect(sec.getByText("Toluca")).toBeVisible();
    await expect(sec.locator("h3")).toContainText("Next matchday");
    await expect(sec.locator("h3")).not.toContainText("Today's slate");
    await expect(sec.locator("h4")).toHaveCount(1);
  });

  test("today's fixtures keep the Today's slate heading", async ({ page }) => {
    await serve(page, { scoreboard: { tournament: TOURNAMENT, fixtures: [
      fixture("f1", new Date().toISOString(), "Toluca", "Necaxa")] } });
    await page.goto("/bet-suggester?league=ligamx");
    const sec = page.locator("section")
      .filter({ hasText: "ESPN live feed" }).first();
    await expect(sec.getByText("Toluca")).toBeVisible();
    await expect(sec.locator("h3")).toContainText("Today's slate");
    await expect(sec.locator("h4")).toHaveCount(0);
  });

  test("a not-deployed backend yields honest placeholders, not a crash",
    async ({ page }) => {
      for (const route of ["scoreboard", "standings", "schedule**",
                           "markets", "odds"]) {
        await page.route(`**/api/ligamx/${route}`, (r) =>
          r.fulfill({ status: 404, contentType: "application/json",
                      body: JSON.stringify({ error: "unknown ligamx route" }) }));
      }
      await page.goto("/bet-suggester?league=ligamx");
      // the page stands, states its loading placeholders, invents nothing
      await expect(page.getByText(/loading fixtures/i)).toBeVisible();
      await expect(page.getByText(/loading standings/i)).toBeVisible();
      const body = (await page.locator("body").innerText());
      expect(body).not.toMatch(/\bTAKE\b/);
      expect(body).not.toMatch(/H \d+ · D \d+ · A \d+/);
    });
});

// ---- the match hub, model dark --------------------------------------------

// reduced from the real summary + the real archived PUECDG books; the
// model section is null — exactly what the dark backend serves today
const MATCH = {
  match: {
    id: "401877027", date: "2026-08-01T01:00Z", state: "pre",
    detail: "8/1 - 1:00 AM UTC", venue: "Estadio Cuauhtémoc",
    home: { name: "Puebla", abbrev: "PUE" },
    away: { name: "Guadalajara", abbrev: "GDL" },
    stats: [], events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: MARKETS.games[0],
  books: [
    { key: "winner", label: "Winner · 3-way",
      event_ticker: "KXLIGAMXGAME-26JUL31PUECDG",
      markets: MARKETS.games[0].markets.map((m) => ({
        ...m, model_key: null })) },
    { key: "total", label: "Total goals",
      event_ticker: "KXLIGAMXTOTAL-26JUL31PUECDG",
      markets: [
        { ticker: "KXLIGAMXTOTAL-26JUL31PUECDG-3",
          label: "Over 2.5 goals scored", yes_ask: "0.57",
          yes_bid: "0.54", status: "active", model_key: "over_2_5" },
      ] },
  ],
  model: null,
  lineups: null,
};

test.describe("Liga MX match hub (model dark)", () => {
  test("dark model is stated; markets show prices but no likelihoods",
    async ({ page }) => {
      await page.route("**/api/ligamx/match/401877027", (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH) }));
      await page.goto("/bet-suggester/ligamx/401877027");
      await expect(page.getByText(/liga-mx-2026-v0 · dark/)).toBeVisible();
      await expect(
        page.getByText(/liga-mx-2026-v0 is dark — unapproved/)
      ).toBeVisible();
      // the market bar renders from real prices (normalized 59/21/21)
      await expect(page.getByText(/implied % — normalized/)).toBeVisible();
      // the every-market table renders the family with its price…
      await expect(page.getByText("Total goals")).toBeVisible();
      const body = (await page.locator("body").innerText());
      // …but no model likelihood/edge number exists anywhere
      expect(body).not.toMatch(/\bTAKE\b/);
      expect(body).toMatch(/model dark · not advice/i);
    });

  test("a missing match is the honest unavailable state", async ({ page }) => {
    await page.route("**/api/ligamx/match/999999", (r) =>
      r.fulfill({ status: 404, contentType: "application/json",
                  body: JSON.stringify({ detail: "unknown event" }) }));
    await page.goto("/bet-suggester/ligamx/999999");
    await expect(
      page.getByText(/match feed unavailable — retrying every 30s/)
    ).toBeVisible();
  });
});

import { expect, test, type Locator, type Page } from "@playwright/test";
import { serveEight } from "./eight-columns";

/* WHAT THE EYE SEES, THE EAR HEARS (audit W10-A11Y, 2026-11-16).
 *
 * Accessibility fixes that change no pixel — every guard below asks the
 * page through the accessibility tree (role, name, state) or the
 * keyboard, never through a class name, so a markup change that keeps
 * the semantics stays green and one that loses them goes red.
 *
 *  -01  a board card's link is named by its CONTENT (both form strips,
 *       the headline figure and its key), not by an aria-label over it
 *  -02  at xl, each column's day divider stays in reading order
 *  -03  the per-day sort select has a name
 *  -06  one polite live region per match speaks score and state changes
 *       only — never the ticking minute — and never twice for one change
 *  -08  toggles say their state (aria-pressed / aria-current /
 *       aria-expanded); the window buttons are spoken as days
 *  -09  the hub's stake inputs and the market fund input are labelled
 *  -10  the match hub has <main>, an h1, and h2 section headings; the
 *       friendly fixture page has an h1
 *  -12  the board's arrow keys do not hijack a focused control
 *  -13  the leagues page goes h1 → h2, not h1 → h3
 *  -14  standings tables carry a caption and expanded abbreviations
 *
 * Hermetic: every /api read is answered here; anything unlisted is a 503.
 */

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function stubAll(page: Page) {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "stub" }, 503)));
}

/* ------------------------------------------------------------- board */

function inHours(h: number) {
  const base = Date.UTC(2026, 11, 10, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
}

const RANKED = {
  refused: false, league: "laliga",
  home: "Barcelona", away: "Rayo Vallecano",
  favourite: "Barcelona", opponent: "Rayo Vallecano", fav_side: "home",
  resolution: { Barcelona: "exact", "Rayo Vallecano": "exact" },
  ppg_gap: 1.1578947368421053, gdg_gap: 1.631578947368421, rank_gap: 7,
  gp_current: { home: 2, away: 2, min: 2 },
  src: "prior", ranks: { fav: 1, opp: 8 },
  tiers: { ovr: [1, 2], atk: [1, 4], def: [1, 1] },
  tier_gaps: { ovr: 1, atk: 3, def: 0 },
  shape: "SPLIT",
  form: { fav: "WWDLW", opp: "LDLWD", scope: "La Liga" },
  event_id: "401882903", competition_id: "401882903",
  kickoff: inHours(9), espn: "esp.1", kalshi: null,
};

const REFUSED = {
  refused: true, league: "epl",
  home: "Sunderland", away: "Promoted Rovers FC",
  club: "Promoted Rovers FC",
  reason: "no row in the prior-season top-flight table",
  form: { home: "WDW", away: "LLD", scope: "Premier League" },
  event_id: "401879999", kickoff: inHours(30),
};

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260831", days: 7,
  leagues: {
    epl: { src: "prior", min_current_gp: 1, clubs: 20 },
    laliga: { src: "prior", min_current_gp: 2, clubs: 20 },
  },
  rows: [RANKED],
  refusals: [REFUSED],
};

async function openBoard(page: Page) {
  await stubAll(page);
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json({ detail: "stub" }, 503)));
  await page.goto("/trivela");
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
}

test.describe("the board", () => {
  test("-01 a ranked card's link is named by its content: both form strips, "
    + "the headline figure and its key", async ({ page }) => {
    await openBoard(page);
    const row = page.getByTestId("picker-row")
      .filter({ hasText: "Rayo Vallecano" }).first();
    const figure = ((await row.getByTestId("row-anchor").textContent()) ?? "").trim();
    const key = ((await row.getByTestId("anchor-key").textContent()) ?? "").trim();
    expect(figure, "non-vacuity: the card draws a figure").not.toBe("");
    expect(key, "non-vacuity: the card draws a key").not.toBe("");
    const link = row.getByRole("link", { name: /^open Barcelona\b/ });
    await expect(link).toHaveCount(1);
    // in reading order: open, the favourite, its strip, versus, the
    // opponent, its strip, the figure, the key
    await expect(link).toHaveAccessibleName(new RegExp(
      "^open Barcelona\\b.*Barcelona — last 5 in La Liga, oldest to newest: W W D L W"
      + ".*\\bversus Rayo Vallecano\\b"
      + ".*Rayo Vallecano — last 5 in La Liga, oldest to newest: L D L W D"
      + `.*${esc(figure)}\\s*${esc(key)}\\s*$`, "i"));
    // the drawn "vs" is not read as well as "versus"
    await expect(link).not.toHaveAccessibleName(/\bvs\b/);
  });

  test("-01 a refused card's link is named by its content too",
    async ({ page }) => {
      await openBoard(page);
      const link = page.getByTestId("refusal-hub-link").first();
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAccessibleName(new RegExp(
        "^open Sunderland\\b.*Sunderland — last 3 in Premier League"
        + ".*\\bversus Promoted Rovers FC\\b"
        + ".*Promoted Rovers FC — last 3 in Premier League", "i"));
    });

  test("-02 at xl each column's day divider stays in reading order, and "
    + "-03 the per-day sort select has a name", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openBoard(page);
    const band = page.getByTestId("day-band").first();
    await expect(band, "non-vacuity: at xl the full-width band is drawn")
      .toBeVisible();
    const day = await band.getAttribute("data-day");
    const divider = page.locator(
      `[data-testid="day-track"][data-day="${day}"] [data-testid="day-divider"]`).first();
    // NOT display:none — it has a box, so it is in the accessibility tree
    await expect(divider).toBeVisible();
    const label = ((await band.locator("span").first().textContent()) ?? "").trim();
    await expect(divider).toHaveText(label);
    // …and it is not drawn: one pixel, clipped (`sr-only`)
    const box = await divider.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(1);
    expect(box!.height).toBeLessThanOrEqual(1);

    await expect(page.getByRole("combobox", {
      name: new RegExp(`^sort order for ${esc(label)}$`, "i") })).toBeVisible();
  });

  test("-12 the arrow keys do not rotate the board from a focused card link, "
    + "and still do from the page", async ({ page }) => {
    await page.route("**/api/**", (r) => r.fulfill(json({ detail: "stub" }, 503)));
    await serveEight(page);
    const lit = () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug).join(","));
    const start = await lit();
    // a card link in a column that is on screen, focused without scrolling
    const focused = await page.evaluate(() => {
      const t = document.querySelector<HTMLElement>('[data-testid="board-track"]')!;
      const box = t.getBoundingClientRect();
      const a = [...t.querySelectorAll<HTMLAnchorElement>(
        '[data-testid="picker-row"] a[href]')].find((x) => {
        const r = x.getBoundingClientRect();
        return r.left >= box.left && r.right <= box.right && r.width > 0;
      });
      if (!a) return false;
      a.focus({ preventScroll: true });
      return document.activeElement === a;
    });
    expect(focused, "non-vacuity: a visible card link holds focus").toBe(true);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);
    expect(await lit(), "an arrow on a focused link is the link's").toBe(start);

    // CONTROL: from the page itself the ribbon still steps
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("ArrowRight");
    await expect.poll(lit, { timeout: 5_000 }).not.toBe(start);
  });
});

/* --------------------------------------------------------- match hub */

const EVENT = "401879377";
const HOME = "New England Revolution";
const AWAY = "Inter Miami CF";

function hubPayload(match: Record<string, unknown>) {
  return {
    match: {
      id: EVENT, venue: "Gillette Stadium", date: "2026-10-18T23:30:00Z",
      home: { name: HOME, abbrev: "NE", score: "1" },
      away: { name: AWAY, abbrev: "MIA", score: "0" },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
      ...match,
    },
    book: {
      event_ticker: "KXMLSGAME-SAMPLE",
      markets: [
        { ticker: "T-NE", label: HOME, yes_ask: "0.55", yes_bid: "0.53" },
        { ticker: "T-TIE", label: "Tie", yes_ask: "0.25", yes_bid: "0.23" },
        { ticker: "T-MIA", label: AWAY, yes_ask: "0.22", yes_bid: "0.20" },
      ],
    },
    books: [], model: null, lineups: null,
    generated_at: new Date().toISOString(),
  };
}

const side = (score: string, name: string, abbrev: string) =>
  ({ name, abbrev, score });

async function openHub(page: Page, first: Record<string, unknown>) {
  let cur = hubPayload(first);
  await stubAll(page);
  await page.route(`**/api/mls/match/${EVENT}`, (r) => r.fulfill(json(cur)));
  await page.clock.install();
  await page.goto(`/trivela/mls/${EVENT}`);
  await expect(page.getByText(HOME).first()).toBeVisible();
  return {
    /** serve `next` and let the 30 s poll land */
    async next(m: Record<string, unknown>) {
      cur = hubPayload(m);
      await page.clock.runFor(31_000);
    },
  };
}

/** count every change the live region's text ever undergoes */
async function watchRegion(region: Locator) {
  await region.evaluate((el) => {
    const w = window as unknown as { __said: string[] };
    w.__said = [];
    new MutationObserver(() => w.__said.push(el.textContent ?? ""))
      .observe(el, { childList: true, characterData: true, subtree: true });
  });
}
const said = (page: Page) => page.evaluate(() =>
  [...new Set((window as unknown as { __said: string[] }).__said)]);

test.describe("the match hub", () => {
  test("-06 a goal and full time are spoken once; the ticking minute is not",
    async ({ page }) => {
      const hub = await openHub(page, { state: "in", detail: "60'", minute: "60'" });
      const region = page.locator("main").getByRole("status")
        .filter({ has: page.locator("xpath=self::*[@aria-live='polite']") });
      await expect(region).toHaveCount(1);
      await expect(region).toHaveText("");
      await watchRegion(region);

      // the minute moves, nothing else: silence
      await hub.next({ state: "in", detail: "61'", minute: "61'" });
      await expect(page.getByText("live · 61'")).toBeVisible();
      await expect(region).toHaveText("");

      // a goal
      await hub.next({ state: "in", detail: "63'", minute: "63'",
        home: side("2", HOME, "NE"), away: side("0", AWAY, "MIA") });
      await expect(region).toHaveText(
        `Goal ${HOME} — ${HOME} 2, ${AWAY} 0, 63'`);

      // the same score again, a later minute: not said a second time
      await hub.next({ state: "in", detail: "64'", minute: "64'",
        home: side("2", HOME, "NE"), away: side("0", AWAY, "MIA") });
      await expect(page.getByText("live · 64'")).toBeVisible();
      expect(await said(page)).toEqual([`Goal ${HOME} — ${HOME} 2, ${AWAY} 0, 63'`]);

      // full time
      await hub.next({ state: "post", detail: "FT",
        home: side("2", HOME, "NE"), away: side("0", AWAY, "MIA") });
      await expect(region).toHaveText(`Full time — ${HOME} 2, ${AWAY} 0`);
    });

  test("-10 the hub has a main landmark, an h1 and h2 section headings; "
    + "-08 the market families say whether they are open; "
    + "-09 every stake input is labelled", async ({ page }) => {
    await openHub(page, { state: "pre", detail: "Scheduled" });
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 }))
      .toHaveText(`${HOME} v ${AWAY}`);
    await expect(page.getByRole("heading", { level: 2,
      name: /market · kalshi three-way/i })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2,
      name: "Betting strategy" })).toHaveCount(1);

    const fam = page.getByRole("button", { name: /winner · 3-way/i });
    await expect(fam).toHaveAttribute("aria-expanded", "true");
    await fam.click();
    await expect(fam).toHaveAttribute("aria-expanded", "false");

    await page.getByRole("button", { name: "Betting strategy" }).click();
    for (const who of [HOME, "Tie", AWAY]) {
      await expect(page.getByRole("textbox",
        { name: new RegExp(`^stake on ${esc(who)}\\b`) })).toHaveCount(1);
    }
  });
});

/* ---------------------------------------------- friendly fixture page */

function friendlyFixture(over: Record<string, unknown>) {
  return { fixture: {
    fixture_id: 55, kickoff_utc: "2026-10-26T18:00:00Z",
    status: "1H", status_long: "First Half", elapsed: 20,
    league_name: "Club Friendlies",
    home: { name: "Bayern Munich" }, away: { name: "RB Salzburg" },
    goals: { home: 0, away: 0 },
    ...over,
  }, books: null };
}

test("-06/-10 the friendly fixture page: an h1, and a goal spoken once — "
  + "not the minute", async ({ page }) => {
  let cur = friendlyFixture({});
  await stubAll(page);
  await page.route("**/api/friendlies/fixtures/55**", (r) => r.fulfill(json(cur)));
  await page.clock.install();
  await page.goto("/trivela/friendlies/55");
  await expect(page.getByText("Bayern Munich").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 }))
    .toHaveText("Bayern Munich v RB Salzburg");
  const region = page.getByTestId("score-announcer");
  await expect(region).toHaveAttribute("aria-live", "polite");
  await expect(region).toHaveText("");

  cur = friendlyFixture({ elapsed: 21 });
  await page.clock.runFor(31_000);
  await expect(page.getByText("live 21'")).toBeVisible();
  await expect(region).toHaveText("");

  cur = friendlyFixture({ elapsed: 24, goals: { home: 0, away: 1 } });
  await page.clock.runFor(31_000);
  await expect(region).toHaveText(
    "Goal RB Salzburg — Bayern Munich 0, RB Salzburg 1, 24'");
});

/* -------------------------------------------- friendlies + comp toggles */

test("-08 the friendlies window and filter buttons say their state, in days",
  async ({ page }) => {
    await stubAll(page);
    await page.route("**/api/friendlies/fixtures?**", (r) =>
      r.fulfill(json({ fixtures: [], count: 0 })));
    await page.goto("/trivela/friendlies");
    const two = page.getByRole("button", { name: "2 days", exact: true });
    const eight = page.getByRole("button", { name: "8 days", exact: true });
    await expect(two).toHaveAttribute("aria-pressed", "true");
    await expect(eight).toHaveAttribute("aria-pressed", "false");
    await eight.click();
    await expect(eight).toHaveAttribute("aria-pressed", "true");
    await expect(two).toHaveAttribute("aria-pressed", "false");
    const rated = page.getByRole("button", { name: /^rated or priced only/ });
    await expect(rated).toHaveAttribute("aria-pressed", "true");
    await rated.click();
    await expect(rated).toHaveAttribute("aria-pressed", "false");
  });

test("-08 the competition viewer's window and filter buttons say their state",
  async ({ page }) => {
    await stubAll(page);
    await page.route("**/api/comp/ucl/fixtures**", (r) => r.fulfill(json({
      display: "UEFA Champions League", count: 1,
      fixtures: [{ fixture_id: 1,
        kickoff_utc: new Date(Date.now() + 86_400_000).toISOString(),
        status: "NS", home: { name: "Arsenal" }, away: { name: "Inter" } }],
      model: { state: "no_model_by_design", why: "UCL WHY", instead: "x" },
    })));
    await page.goto("/trivela/comp/ucl");
    await expect(page.locator("main h1")).toHaveText("UEFA Champions League");
    const pressed = page.locator('button[aria-pressed="true"]')
      .filter({ hasText: /^\d+d$/ });
    await expect(pressed).toHaveCount(1);
    const thirty = page.getByRole("button", { name: "30 days", exact: true });
    await thirty.click();
    await expect(thirty).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /^rated only/ }))
      .toHaveAttribute("aria-pressed", /true|false/);
  });

/* ------------------------------------------------------- leagues page */

async function openEpl(page: Page) {
  await stubAll(page);
  await page.route("**/api/epl/scoreboard", (r) => r.fulfill(json({ fixtures: [
    { id: "401879301", date: "2026-12-12T15:00:00Z", state: "pre",
      detail: "Scheduled", venue: "Test Ground",
      home: { name: "Arsenal" }, away: { name: "Coventry City" } }] })));
  await page.route("**/api/epl/standings", (r) => r.fulfill(json({ tables: [{
    table: "2026-27 English Premier League",
    entries: [
      { team: "Liverpool", abbrev: "LIV", rank: 1, played: 3,
        wins: 3, losses: 0, ties: 0, points: 9, goal_diff: 6 },
      { team: "Arsenal", abbrev: "ARS", rank: 2, played: 3,
        wins: 2, losses: 0, ties: 1, points: 7, goal_diff: 4 },
    ] }] })));
  await page.goto("/trivela/leagues?league=epl");
  await expect(page.getByText("Liverpool").first()).toBeVisible();
}

test("-13 the leagues page never skips a heading level; -08 the shown "
  + "league's dot is aria-current; -14 the standings table has a caption "
  + "and spelled-out headers", async ({ page }) => {
  await openEpl(page);
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
      .map((h) => Number(h.tagName[1])));
  expect(levels[0], "the page opens on its h1").toBe(1);
  expect(levels.filter((l) => l === 2).length,
    "non-vacuity: the dashboard's sections are h2").toBeGreaterThan(0);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `heading ${i}: h${levels[i - 1]} → h${levels[i]}`)
      .toBeLessThanOrEqual(1);
  }

  const dots = page.locator('button[aria-label^="switch to "]');
  expect(await dots.count()).toBeGreaterThan(1);
  await expect(page.locator('button[aria-label^="switch to "][aria-current="true"]'))
    .toHaveCount(1);

  const table = page.getByRole("table", { name: /2026-27 English Premier League/ });
  await expect(table).toHaveCount(1);
  for (const [abbr, full] of [["gp", "games played"], ["w", "won"], ["d", "drawn"],
    ["l", "lost"], ["gd", "goal difference"], ["pts", "points"]]) {
    await expect(table.getByRole("columnheader", { name: abbr, exact: true })
      .locator("abbr")).toHaveAttribute("title", full);
  }
});

/* --------------------------------------------------- market fund input */

test("-09 the market viewer's fund input is labelled by its visible words",
  async ({ page }) => {
    await stubAll(page);
    await page.goto("/trivela/market/FINAL");
    await expect(page.getByRole("spinbutton", { name: "Fund to divide",
      exact: true })).toHaveCount(1);
  });

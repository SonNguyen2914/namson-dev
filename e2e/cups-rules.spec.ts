/** THE CUPS TAB'S FIVE RULES, ON REAL RECORDED PAYLOADS (Son, 2026-10-07/08,
 *  corrected 2026-10-13). Every board here is e2e/cups-rules-recorded.ts —
 *  the backend's own in-process assembly of all 22 cups and of the declared
 *  Leagues board on 2026-10-13 — or a recorded Campeones Cup / Nations
 *  payload, edited only where a test says so.
 *
 *    1. off season is ONE line at the end of the tab, with ESPN's month or
 *       "returns next season"; an in-season cup keeps its column;
 *    2. no column is drawn empty;
 *    3. Finals & Super Cups appears only with an upcoming match;
 *    4. no cup tie is drawn in a league column;
 *    5. the chooser lists all 33 competitions in Son's order. */
import { test, expect, type Page } from "@playwright/test";
import { CAMPEONES_BOARD } from "./campeones-board";
import { CHAMP_BOARD } from "./championships-recorded";
import {
  CUPS_RULES_BOARD, CUPS_RULES_REVIEW, LEAGUES_RULES_BOARD,
  LEAGUES_RULES_REVIEW, RULES_CLOCK,
} from "./cups-rules-recorded";

type Obj = Record<string, unknown>;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

const CUPS_TAB = [
  "ucl", "uel", "uecl", "concacafcc", "leaguescup",
  "campeones", "uefasuper", "communityshield", "supercopa", "dflsupercup",
  "supercoppa", "tropheechampions", "johancruijff", "campeondecampeones",
  "facup", "eflcup", "copadelrey", "dfbpokal", "coppaitalia",
  "coupedefrance", "knvbbeker", "usopencup",
];

async function open(page: Page, mode: string, opts: {
  cups?: unknown; leagues?: unknown; asked?: (string | null)[];
} = {}) {
  await page.clock.install({ time: new Date(RULES_CLOCK) });
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
  await page.route("**/api/picker/board**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    opts.asked?.push(asked);
    return r.fulfill(json(asked ? (opts.cups ?? CUPS_RULES_BOARD)
      : (opts.leagues ?? LEAGUES_RULES_BOARD)));
  });
  await page.route("**/api/picker/review**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? CUPS_RULES_REVIEW : LEAGUES_RULES_REVIEW));
  });
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}

const colSlugs = (page: Page) => page.locator('[data-testid="league-col"]')
  .evaluateAll((e) => e.map((x) => x.getAttribute("data-league")));
const col = (page: Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);

test.describe("the Cups tab on the recorded 22-cup board", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("asks for all 22 cups by name, in one read", async ({ page }) => {
    const asked: (string | null)[] = [];
    await open(page, "cups", { asked });
    expect(asked.filter(Boolean).length).toBeGreaterThan(0);
    for (const a of asked.filter(Boolean)) expect(a).toBe(CUPS_TAB.join(","));
  });

  test("off season is one line at the end of the tab, with ESPN's month or "
    + "'returns next season' — never a guessed date", async ({ page }) => {
    await open(page, "cups");
    const line = page.getByTestId("off-season-line");
    await expect(line).toHaveCount(1);
    await expect(line).toHaveText([
      "Off season",
      "Concacaf Champions Cup returns next season",
      "Leagues Cup returns next season",
      "Campeones Cup returns next season",
      "UEFA Super Cup returns next season",
      "FA Community Shield returns next season",
      "Supercopa de España returns Feb 2027",
      "DFL-Supercup returns next season",
      "Supercoppa Italiana returns Dec 2026",
      "Trophée des Champions returns next season",
      "Johan Cruijff Schaal returns next season",
      "Campeón de Campeones returns next season",
      "FA Cup returns next season",
      "Coupe de France returns next season",
    ].join(" · "));
    // it is the LAST thing on the board's section
    const after = await line.evaluate((el) => {
      const track = document.querySelector('[data-testid="board-track"]')!;
      return Boolean(track.compareDocumentPosition(el)
        & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(after, "the line is below the columns").toBe(true);
  });

  test("in-season cups keep their columns; off-season ones have none",
    async ({ page }) => {
      await open(page, "cups");
      expect(await colSlugs(page)).toEqual([
        "ucl", "uel", "uecl", "eflcup", "copadelrey", "dfbpokal",
        "coppaitalia", "knvbbeker", "usopencup"]);
      // the EFL Cup is between rounds: a rest-day card naming the date ESPN
      // lists for its fourth round
      const cell = col(page, "eflcup").locator('[data-testid="rest-day"]:visible').first();
      await expect(cell).toContainText("EFL Cup — rest day");
      await expect(cell).toContainText(/next · \w+, oct 27/i);
    });

  test("no column is drawn empty, on any tab", async ({ page }) => {
    for (const mode of ["cups", "leagues", "nations"]) {
      await open(page, mode);
      for (const slug of await colSlugs(page)) {
        await expect(col(page, slug!).getByTestId("col-empty"), `${mode}/${slug}`)
          .toHaveCount(0);
      }
    }
  });

  test("Finals & Super Cups appears only with an upcoming match, each card "
    + "with its badge", async ({ page }) => {
    await open(page, "cups");
    await expect(col(page, "finals")).toHaveCount(0);
    // the recorded Campeones Cup tie, moved into this window
    const b = clone(CUPS_RULES_BOARD) as unknown as Obj;
    const camp = (clone(CAMPEONES_BOARD) as unknown as Obj).refusals as Obj[];
    b.refusals = [...(b.refusals as Obj[]),
      ...camp.filter((r) => r.league === "campeones")
        .map((r) => ({ ...r, kickoff: "2026-10-16T00:00Z" }))];
    const fresh = await page.context().newPage();
    await fresh.setViewportSize({ width: 1440, height: 900 });
    await open(fresh, "cups", { cups: b });
    const finals = col(fresh, "finals");
    await expect(finals).toHaveCount(1);
    await expect(finals.getByTestId("competition-badge").first())
      .toContainText("Campeones Cup");
    await expect(col(fresh, "campeones")).toHaveCount(0);
    await expect(fresh.getByTestId("off-season-line")).not.toContainText("Campeones Cup");
  });
});

test.describe("no cup tie in a league column", () => {
  test("the recorded Leagues board carries none, and a stamped one is not drawn",
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // the backend (cups-rules) no longer folds: every row is its column's
      const rows = (LEAGUES_RULES_BOARD as unknown as Obj).rows as Obj[];
      for (const r of rows) {
        expect(r.columns ?? [r.column], String(r.event_id)).toEqual([r.league]);
      }
      // and an older payload's stamped Campeones tie (columns mls+ligamx)
      // is still not drawn in either league column
      const b = clone(LEAGUES_RULES_BOARD) as unknown as Obj;
      const camp = (clone(CAMPEONES_BOARD) as unknown as Obj).refusals as Obj[];
      b.refusals = [...(b.refusals as Obj[]),
        ...camp.filter((r) => r.league === "campeones")
          .map((r) => ({ ...r, kickoff: "2026-10-16T00:00Z" }))];
      await open(page, "leagues", { leagues: b });
      await expect(page.getByTestId("league-col").first()).toBeAttached();
      await expect(page.locator('[data-testid="league-col"] [data-testid="picker-refusal"]',
        { hasText: "Inter Miami" }).filter({ hasText: "Cruz Azul" })).toHaveCount(0);
      await expect(page.getByTestId("competition-badge")).toHaveCount(0);
    });
});

test("the chooser lists all 33 competitions in Son's order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const names = async (p: Page) => {
    await p.getByTestId("column-chooser-summary").click();
    return p.getByTestId("column-chip").evaluateAll((els) => els.flatMap((e) => {
      const name = e.querySelector('[data-testid="column-chip-name"]')!.textContent!;
      const members = e.querySelector('[data-testid="column-chip-members"]');
      return members ? members.textContent!.split(" · ") : [name];
    }));
  };
  await open(page, "leagues");
  const leagues = await names(page);
  const p2 = await page.context().newPage();
  await p2.setViewportSize({ width: 1440, height: 900 });
  await open(p2, "cups");
  const cups = await names(p2);
  const p3 = await page.context().newPage();
  await p3.setViewportSize({ width: 1440, height: 900 });
  await open(p3, "nations");
  const nations = await names(p3);
  expect(leagues).toEqual(["Premier League", "La Liga", "Bundesliga", "Serie A",
    "Ligue 1", "Eredivisie", "MLS", "Liga MX"]);
  expect(nations).toEqual(["UEFA Nations League", "Concacaf Nations League",
    "AFCON Qualifiers"]);
  expect(cups).toEqual([
    "Champions League", "Europa League", "Conference League",
    "Concacaf Champions Cup", "Leagues Cup",
    "Campeones Cup", "UEFA Super Cup", "FA Community Shield",
    "Supercopa de España", "DFL-Supercup", "Supercoppa Italiana",
    "Trophée des Champions", "Johan Cruijff Schaal", "Campeón de Campeones",
    "FA Cup", "EFL Cup", "Copa del Rey", "DFB-Pokal", "Coppa Italia",
    "Coupe de France", "KNVB Beker", "US Open Cup"]);
  expect(leagues.length + cups.length + nations.length).toBe(33);
});

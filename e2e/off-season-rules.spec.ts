/** IN SEASON KEEPS ITS COLUMN; OFF SEASON FOLDS INTO ONE LINE.
 *
 *  Son, 2026-10-07 ("Seasonal and one-off rules"), as corrected 2026-10-13
 *  ("EFL cup still on going, keep it there"):
 *    - no EMPTY columns, and no "season over" column card;
 *    - a competition whose edition is RUNNING keeps its column even with
 *      nothing in the board's window, drawn as the league's dashed
 *      rest-day card: "next · <date>" when the next fixture is known,
 *      "next round · date TBC" when it is not — never a guessed date;
 *    - a competition whose edition has FINISHED or NOT STARTED has no
 *      column and is named in ONE quiet line at the end of its tab:
 *      "Off season · X returns <Mon YYYY>" (or "returns next season");
 *    - one-match competitions share the "Finals & Super Cups" column,
 *      drawn ONLY when one of their matches is in the window, each card
 *      with its competition badge;
 *    - the same rule on every tab.
 *  The rule itself is `isOffSeason` (src/lib/offSeason.ts), pinned here as
 *  a truth table and then through the page. Hermetic: every board is the
 *  recorded cups payload (e2e/cups-board.ts) or the recorded eight-column
 *  one (e2e/eight-columns.ts), edited only where a test says so. */
import { test, expect, type Page } from "@playwright/test";
import { isOffSeason, offSeasonWhen, restLine } from "../src/lib/offSeason";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import { CHAMP_BOARD } from "./championships-recorded";
import { CUPS_CLOCK, cupsBoardWith, routeCups } from "./cups-board";

type Obj = Record<string, unknown>;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

async function remember(page: Page, mode: string) {
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
}

async function openCups(page: Page, board?: unknown) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.install({ time: new Date(CUPS_CLOCK) });
  await remember(page, "cups");
  await routeCups(page, board);
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}

const col = (page: Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);
const colSlugs = (page: Page) => page.locator('[data-testid="league-col"]')
  .evaluateAll((e) => e.map((x) => x.getAttribute("data-league")));

/** drop every row and refusal of competition `slug` from a board */
const without = (slug: string) => (b: Obj) => {
  b.rows = (b.rows as Obj[]).filter((r) => r.league !== slug);
  b.refusals = (b.refusals as Obj[]).filter((r) => r.league !== slug);
};
/** set competition `slug`'s season block, wherever its meta sits */
const season = (slug: string, s: Obj) => (b: Obj) => {
  for (const k of ["leagues", "folded"]) {
    const m = (b[k] as Record<string, Obj> | undefined)?.[slug];
    if (m) m.season = s;
  }
};

test.describe("the rule (lib/offSeason.isOffSeason)", () => {
  test("a fixture in the window always keeps the column", () => {
    for (const state of ["in_season", "finished", "not_started", "unknown", null] as const) {
      expect(isOffSeason({ ahead: true, state, declaredOver: true })).toBe(false);
    }
    expect(isOffSeason({ ahead: true, oneMatch: true })).toBe(false);
  });
  test("nothing in the window: the season decides, then the declaration", () => {
    expect(isOffSeason({ ahead: false, state: "in_season", declaredOver: true })).toBe(false);
    expect(isOffSeason({ ahead: false, state: "finished" })).toBe(true);
    expect(isOffSeason({ ahead: false, state: "not_started" })).toBe(true);
    expect(isOffSeason({ ahead: false, state: "unknown", declaredOver: true })).toBe(true);
    expect(isOffSeason({ ahead: false, declaredOver: true })).toBe(true);
    // no evidence at all: IN season (a column with "date TBC" is
    // recoverable; hiding a running competition is not)
    expect(isOffSeason({ ahead: false })).toBe(false);
    expect(isOffSeason({ ahead: false, state: "unknown" })).toBe(false);
    // a one-match group is never "between rounds"
    expect(isOffSeason({ ahead: false, state: "in_season", oneMatch: true })).toBe(true);
  });
  test("the words never guess a date", () => {
    expect(offSeasonWhen(null)).toBe("returns next season");
    expect(offSeasonWhen("not a date")).toBe("returns next season");
    expect(offSeasonWhen("2027-07-20T00:00Z")).toBe("returns Jul 2027");
    expect(restLine(null, true, () => "x")).toBe("next round · date TBC");
    expect(restLine(null, false, () => "x")).toBe("next fixture · date TBC");
    expect(restLine("2026-10-28T19:45Z", true, () => "Wednesday, Oct 28"))
      .toBe("next · wednesday, oct 28");
  });
});

test.describe("the Cups tab under the rule", () => {
  test("an IN-SEASON cup with nothing in the window keeps its column as a "
    + "rest-day card, date TBC when its next round is not known", async ({ page }) => {
    await openCups(page, cupsBoardWith(without("eflcup")));
    const efl = col(page, "eflcup");
    await expect(efl).toBeAttached();
    await expect(efl.getByTestId("col-empty")).toHaveCount(0);
    await expect(efl).not.toContainText("No EFL Cup fixtures");
    const cell = efl.locator('[data-testid="rest-day"]:visible').first();
    await expect(cell).toContainText("EFL Cup — rest day");
    await expect(cell).toContainText("next round · date TBC");
    await expect(page.getByTestId("off-season-line")).not.toContainText("EFL Cup");
  });

  test("…and names the next round when the payload knows it", async ({ page }) => {
    await openCups(page, cupsBoardWith((b) => {
      without("eflcup")(b);
      season("eflcup", { state: "in_season", next_fixture: "2026-10-28T19:45Z" })(b);
    }));
    const cell = col(page, "eflcup").locator('[data-testid="rest-day"]:visible').first();
    await expect(cell).toContainText(/next · \w+, oct 28/i);
  });

  test("a cup the payload says has FINISHED folds into the line, with the "
    + "month of its next known fixture", async ({ page }) => {
    await openCups(page, cupsBoardWith((b) => {
      without("eflcup")(b);
      season("eflcup", { state: "finished", next_fixture: "2027-08-11T18:45Z" })(b);
    }));
    await expect(col(page, "eflcup")).toHaveCount(0);
    await expect(page.getByTestId("off-season-line"))
      .toHaveText("Off season · Leagues Cup returns next season · EFL Cup returns Aug 2027");
  });

  test("an in-season payload state beats the declared 'finished' fallback",
    async ({ page }) => {
      await openCups(page, cupsBoardWith(
        season("leaguescup", { state: "in_season", next_fixture: null })));
      await expect(col(page, "leaguescup")).toBeAttached();
      await expect(page.getByTestId("off-season-line")).toHaveCount(0);
    });

  test("Finals & Super Cups appears ONLY with a match in the window", async ({ page }) => {
    await openCups(page, cupsBoardWith(without("campeones")));
    expect(await colSlugs(page)).toEqual(["ucl", "eflcup"]);
    await expect(col(page, "finals")).toHaveCount(0);
    await expect(page.locator('[data-testid="column-chip"][data-slug="finals"]'))
      .toHaveAttribute("data-resting", "nothing upcoming");
    await expect(page.getByTestId("off-season-line"))
      .toHaveText("Off season · Leagues Cup returns next season · Campeones Cup returns next season");
  });

  test("no cup column is ever drawn empty", async ({ page }) => {
    await openCups(page);
    for (const slug of await colSlugs(page)) {
      await expect(col(page, slug!).getByTestId("col-empty"), slug!).toHaveCount(0);
    }
  });
});

test.describe("the same rule on the Leagues tab", () => {
  test("a league whose season has not started folds into the line; a league "
    + "between matchdays keeps its column", async ({ page }) => {
    const b = clone(BOARD_EIGHT) as unknown as Obj;
    without("eredivisie")(b);
    without("seriea")(b);
    (b.leagues as Record<string, Obj>).eredivisie.season =
      { state: "not_started", next_fixture: "2027-01-16T19:00Z" };
    await page.setViewportSize({ width: 1440, height: 900 });
    await remember(page, "leagues");
    await routeEight(page, b);
    await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await expect(col(page, "eredivisie")).toHaveCount(0);
    await expect(page.getByTestId("off-season-line"))
      .toHaveText("Off season · Eredivisie returns Jan 2027");
    await expect(page.locator('[data-testid="column-chip"][data-slug="eredivisie"]'))
      .toHaveAttribute("data-resting", "off season");
    // Serie A sent no season state and has nothing in the window: in season
    // by default, a rest-day card and never the "No … fixtures" box
    const sa = col(page, "seriea");
    await expect(sa).toBeAttached();
    await expect(sa.getByTestId("col-empty")).toHaveCount(0);
  });
});

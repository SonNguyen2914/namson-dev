/** IN SEASON KEEPS ITS COLUMN; OFF SEASON FOLDS INTO ONE LINE.
 *
 *  Son, 2026-10-07 ("Seasonal and one-off rules"), as corrected 2026-10-13
 *  ("EFL cup still on going, keep it there"):
 *    - no EMPTY columns, and no "season over" column card;
 *    - a competition whose edition is RUNNING keeps its column even with
 *      nothing in the board's window, drawn as the league's dashed
 *      rest-day card: "next · <date>" when the next fixture is known,
 *      "next round · date not announced" when no source lists it — never
 *      a guessed date;
 *    - a competition whose edition has FINISHED or NOT STARTED has no
 *      column and is named in ONE quiet line at the end of its tab:
 *      "Off season · X returns <Sat Oct 17>" — the exact day of the next
 *      scheduled match (Son, 2026-10-13), with its year when not this
 *      year — or "X — date not announced";
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
    // no evidence at all: IN season (a column with "date not announced" is
    // recoverable; hiding a running competition is not)
    expect(isOffSeason({ ahead: false })).toBe(false);
    expect(isOffSeason({ ahead: false, state: "unknown" })).toBe(false);
    // a one-match group is never "between rounds"
    expect(isOffSeason({ ahead: false, state: "in_season", oneMatch: true })).toBe(true);
  });
  test("the words never guess a date: the exact day, or 'not announced'", () => {
    const now = new Date("2026-10-13T15:00:00Z");
    expect(offSeasonWhen(null, now)).toBe("date not announced");
    expect(offSeasonWhen("not a date", now)).toBe("date not announced");
    // THE DAY IN LOS ANGELES: 2026-10-17T14:00Z is Sat Oct 17 07:00 PT
    expect(offSeasonWhen("2026-10-17T14:00Z", now)).toBe("returns Sat Oct 17");
    // a late kickoff UTC is the previous day here: 00:00Z Oct 22 is Wed Oct 21
    expect(offSeasonWhen("2026-10-22T00:00Z", now)).toBe("returns Wed Oct 21");
    // the year only when it is not this year
    expect(offSeasonWhen("2027-02-02T19:00Z", now)).toBe("returns Tue Feb 2, 2027");
    // a date-only match day is that calendar day everywhere
    expect(offSeasonWhen("2026-12-22", now)).toBe("returns Tue Dec 22");
    expect(restLine(null, true, () => "x", now)).toBe("next round · date not announced");
    expect(restLine(null, false, () => "x", now)).toBe("next fixture · date not announced");
    expect(restLine("2026-10-28T19:45Z", true, () => "Wednesday, Oct 28", now))
      .toBe("next · wednesday, oct 28");
    expect(restLine("2027-02-03T19:45Z", true, () => "Wednesday, Feb 3", now))
      .toBe("next · wednesday, feb 3, 2027");
  });
});

test.describe("the Cups tab under the rule", () => {
  test("an IN-SEASON cup with nothing in the window keeps its column as a "
    + "rest-day card, 'date not announced' when no source lists its next round",
  async ({ page }) => {
    await openCups(page, cupsBoardWith(without("eflcup")));
    const efl = col(page, "eflcup");
    await expect(efl).toBeAttached();
    await expect(efl.getByTestId("col-empty")).toHaveCount(0);
    await expect(efl).not.toContainText("No EFL Cup fixtures");
    const cell = efl.locator('[data-testid="rest-day"]:visible').first();
    await expect(cell).toContainText("EFL Cup — rest day");
    await expect(cell).toContainText("next round · date not announced");
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
    + "exact day of its next listed fixture", async ({ page }) => {
    await openCups(page, cupsBoardWith((b) => {
      without("eflcup")(b);
      season("eflcup", { state: "finished", next_fixture: "2027-08-11T18:45Z" })(b);
    }));
    await expect(col(page, "eflcup")).toHaveCount(0);
    await expect(page.getByTestId("off-season-line"))
      .toHaveText("Off season · Leagues Cup \u2014 date not announced · "
        + "EFL Cup returns Wed Aug 11, 2027");
  });

  test("the backend's next_match decides: its kickoff, or 'not announced' "
    + "even where ESPN's calendar names a day", async ({ page }) => {
    await openCups(page, cupsBoardWith((b) => {
      without("eflcup")(b);
      season("eflcup", { state: "finished", next_fixture: "2027-08-11T18:45Z" })(b);
      const metaOf = (slug: string) => ["leagues", "folded"]
        .map((k) => (b[k] as Record<string, Obj> | undefined)?.[slug])
        .filter(Boolean) as Obj[];
      for (const m of metaOf("eflcup")) m.next_match = { kickoff: "2027-08-10T18:45Z",
        source: "espn_scoreboard_year", name: "A at B", round: "first-round" };
      for (const m of metaOf("leaguescup")) m.next_match = { kickoff: null, source: null,
        reason: "ESPN lists no scheduled match in 2026 or 2027" };
      season("leaguescup", { state: "finished", next_fixture: "2027-07-20" })(b);
    }));
    const line = page.getByTestId("off-season-line");
    await expect(line).toHaveText("Off season · Leagues Cup \u2014 date not announced · "
      + "EFL Cup returns Tue Aug 10, 2027");
    // the hover names the match and its source, or why there is none
    await expect(line.locator('[data-slug="eflcup"]'))
      .toHaveAttribute("title", "A at B · first-round — listed by ESPN's schedule");
    await expect(line.locator('[data-slug="leaguescup"]'))
      .toHaveAttribute("title", /No source lists a next match: ESPN lists no scheduled/);
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
      .toHaveText("Off season · Leagues Cup \u2014 date not announced · "
        + "Campeones Cup \u2014 date not announced");
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
      .toHaveText("Off season · Eredivisie returns Sat Jan 16, 2027");
    await expect(page.locator('[data-testid="column-chip"][data-slug="eredivisie"]'))
      .toHaveAttribute("data-resting", "off season");
    // Serie A sent no season state and has nothing in the window: in season
    // by default, a rest-day card and never the "No … fixtures" box
    const sa = col(page, "seriea");
    await expect(sa).toBeAttached();
    await expect(sa.getByTestId("col-empty")).toHaveCount(0);
  });
});

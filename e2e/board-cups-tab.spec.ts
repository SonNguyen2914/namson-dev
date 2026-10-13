/** LEAGUES | CUPS | NATIONS — cups plan Phase A (2026-10-12).
 *
 *  Son's naming decision of 2026-10-07 (roadmap 05b), as the page must
 *  keep it:
 *    - the switch is Leagues | Cups | Nations, in that order; "Nations" is
 *      the old Championships board under its UI name, still read from
 *      /api/championships/* — and a viewer who left on "championships"
 *      comes back to it;
 *    - the Cups tab IS the board (Son, 2026-10-12: "the same thing as the
 *      other competitions", then "make everything match perfectly"): one
 *      read of /api/picker/board and /review with `?leagues=` naming the
 *      cups the backend builds, never /api/championships/*. Every cup is
 *      a chip in the column chooser, continental then domestic; the built
 *      ones are drawn, the rest undrawn, and a chosen one says "not on
 *      the board yet" on its rest-day cells and asks for nothing;
 *    - a cup tie the backend folded into a league column is not drawn there;
 *    - AFCON reads "AFCON Qualifiers" while it is qualifying.
 *  Hermetic: every board is a recorded payload served by page.route. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { CUPS_ASK, CUPS_CLOCK, routeCups } from "./cups-board";

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

type Calls = { board: number; review: number; champ: number };

async function routeAll(page: Page, board: unknown = BOARD_EIGHT): Promise<Calls> {
  const calls: Calls = { board: 0, review: 0, champ: 0 };
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith("/api/picker/board")) calls.board += 1;
    if (u.pathname.startsWith("/api/picker/review")) calls.review += 1;
    if (u.pathname.startsWith("/api/championships")) calls.champ += 1;
  });
  await routeEight(page, board);
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  return calls;
}

async function remember(page: Page, mode: string) {
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
}

test.describe("the board's three tabs", () => {
  test("the switch reads Leagues | Cups | Nations", async ({ page }) => {
    await routeAll(page);
    await page.goto("/bet-suggester");
    const group = page.getByRole("group", { name: "which board this page shows" });
    await expect(group.getByRole("button")).toHaveText(["Leagues", "Cups", "Nations"]);
    await expect(group.getByRole("button", { name: "Championships" })).toHaveCount(0);
  });

  test("a remembered 'championships' opens the Nations board", async ({ page }) => {
    await page.clock.install({ time: new Date(CHAMP_CLOCK) });
    await remember(page, "championships");
    const calls = await routeAll(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    await expect(page.getByTestId("board-mode-nations")).toHaveAttribute("aria-pressed", "true");
    expect(calls.board).toBe(0);
  });

  test("AFCON reads 'AFCON Qualifiers' while it is qualifying", async ({ page }) => {
    await page.clock.install({ time: new Date(CHAMP_CLOCK) });
    await remember(page, "nations");
    await routeAll(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"][data-league="afcon"]');
    await expect(page.getByText("AFCON Qualifiers").first()).toBeAttached();
    await expect(page.getByText("Africa Cup of Nations", { exact: true })).toHaveCount(0);
  });
});

test.describe("the Cups tab is the board (2026-10-12)", () => {
  /** Requests the page made, by route, with the `leagues` each one asked. */
  function watch(page: Page) {
    const seen = { board: [] as (string | null)[], review: [] as (string | null)[],
                   champ: 0 };
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.pathname.startsWith("/api/picker/board")) seen.board.push(u.searchParams.get("leagues"));
      if (u.pathname.startsWith("/api/picker/review")) seen.review.push(u.searchParams.get("leagues"));
      if (u.pathname.startsWith("/api/championships")) seen.champ += 1;
    });
    return seen;
  }
  async function openCups(page: Page) {
    await page.clock.install({ time: new Date(CUPS_CLOCK) });
    await remember(page, "cups");
    const seen = watch(page);
    await routeCups(page);
    await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"][data-league="ucl"]');
    return seen;
  }
  const colSlugs = (page: Page) => page.locator('[data-testid="league-col"]')
    .evaluateAll((e) => e.map((x) => x.getAttribute("data-league")));

  test("asks the club board and its review for the cups BY NAME, and nothing else",
    async ({ page }) => {
      const seen = await openCups(page);
      await page.waitForSelector('[data-testid="review-count"]');
      await expect(page.getByTestId("board-mode-cups")).toHaveAttribute("aria-pressed", "true");
      expect(seen.board.length).toBeGreaterThan(0);
      for (const l of [...seen.board, ...seen.review]) {
        expect(l).toBe(CUPS_ASK.join(","));
      }
      expect(seen.champ).toBe(0);
    });

  test("every cup is a chip in the column chooser, continental then domestic; "
    + "the cups the board builds are drawn", async ({ page }) => {
      await openCups(page);
      // no sub-switch: the tab is shaped like Leagues and Nations
      await expect(page.locator('[data-testid^="cups-scope-"]')).toHaveCount(0);
      await expect(page.getByTestId("cups-coming")).toHaveCount(0);
      const chips = page.getByTestId("column-chip");
      expect(await chips.evaluateAll((e) => e.map((x) => x.getAttribute("data-slug"))))
        .toEqual(["ucl", "leaguescup", "campeones", "uel", "uecl", "concacafcc",
                  "eflcup", "facup", "copadelrey", "dfbpokal", "coppaitalia",
                  "coupedefrance", "knvbbeker", "usopencup"]);
      expect(await chips.evaluateAll((e) => e
        .filter((x) => x.getAttribute("data-drawn") === "yes")
        .map((x) => x.getAttribute("data-slug"))))
        .toEqual(["ucl", "leaguescup", "campeones", "eflcup"]);
      await expect(page.getByTestId("column-chooser-summary")).toContainText("4 of 14 drawn");
      expect(await colSlugs(page)).toEqual(["ucl", "leaguescup", "campeones", "eflcup"]);
      // THE CAMPEONES TIE IS IN ITS OWN COLUMN, not lost to the league
      // columns the backend stamps it with (and which this tab does not draw)
      await expect(page.locator('[data-testid="league-col"][data-league="campeones"]'))
        .toContainText("Inter Miami");
      await expect(page.locator('[data-testid="league-col"][data-league="eflcup"]'))
        .toContainText("Norwich");
      await expect(page.locator('[data-testid="league-col"][data-league="mls"]')).toHaveCount(0);
      // the narrowed-page note is a narrowed PAGE's; on the tab it would
      // link the reader to the page they are on
      await expect(page.getByTestId("board-narrowed")).toHaveCount(0);
    });

  test("the columns read like league columns: kickoff order, the same header chips",
    async ({ page }) => {
      await openCups(page);
      await expect(page.getByTestId("board-rank-heading")).toHaveText("Ranked by kickoff");
      await expect(page.getByTestId("col-own-sort")).toHaveCount(0);
      await expect(page.getByTestId("col-cup")).toHaveCount(0);
      // the "rated on" fact is in the (i), not lost
      const head = page.locator('[data-testid="col-head"][data-league="ucl"]');
      await expect(head.getByTestId("col-notes-open")).toHaveAttribute("data-notes", /basis/);
      await head.getByTestId("col-notes-open").click();
      await expect(head.getByTestId("basis-note")).toContainText("Premier League + La Liga + Bundesliga");
    });

  test("a finished cup says 'season over' on the rest-day cell, as a league says rest day",
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openCups(page);
      const lc = page.locator('[data-testid="league-col"][data-league="leaguescup"]');
      await expect(lc.getByTestId("col-empty")).toHaveCount(0);
      const cell = lc.locator('[data-testid="rest-day"][data-placeholder="yes"]:visible').first();
      await expect(cell).toContainText("Leagues Cup — season over");
      await expect(cell).toContainText("2026 edition finished");
      await expect(cell).not.toContainText(/\b0 fixtures\b/i);
    });

  test("choosing a cup the board does not build draws its column and asks for nothing",
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const seen = await openCups(page);
      await page.waitForTimeout(300);
      const before = seen.board.length + seen.review.length;
      await page.getByTestId("column-chooser-summary").click();
      await page.locator('[data-testid="column-chip"][data-slug="uel"]').click();
      const uel = page.locator('[data-testid="league-col"][data-league="uel"]');
      await expect(uel).toBeAttached();
      await expect(uel.locator('[data-testid="rest-day"]:visible').first())
        .toContainText("Europa League — not on the board yet");
      await expect(uel.getByTestId("col-no-board-entry")).toHaveCount(0);
      await expect(uel.locator('[data-slot="tail-track"]')).toHaveCount(0);
      await page.waitForTimeout(300);
      expect(seen.board.length + seen.review.length, "choosing a column asks for nothing")
        .toBe(before);
    });

  test("every cup card opens a page that exists, or says it has none", async ({ page }) => {
    await openCups(page);
    const cards = page.locator('[data-testid="picker-row"]');
    expect(await cards.count()).toBeGreaterThan(0);
    const seen = await cards.evaluateAll((els) => els.map((e) => ({
      href: e.querySelector("a[href]")?.getAttribute("href") ?? null,
      unlinked: !!e.querySelector('[data-testid="card-unlinked"], [data-testid="review-unlinked"]'),
    })));
    for (const s of seen) expect(s.href == null).toBe(s.unlinked);
    for (const href of new Set(seen.map((s) => s.href).filter(Boolean) as string[])) {
      const res = await page.request.get(href, { maxRedirects: 0 });
      expect(res.status(), href).toBe(200);
    }
  });

  test("a backend that answers the cups with a failure names it, it draws no stale board",
    async ({ page }) => {
      await page.clock.install({ time: new Date(CUPS_CLOCK) });
      await remember(page, "cups");
      await page.route("**/api/picker/**", (r) => r.fulfill({
        status: 422, contentType: "application/json",
        body: JSON.stringify({ detail: "not a board competition: ucl" }) }));
      await page.goto("/bet-suggester");
      await expect(page.getByTestId("board-error")).toBeVisible();
      await expect(page.locator('[data-testid="picker-row"]')).toHaveCount(0);
    });

  test("leaving the Cups tab reads the declared Leagues board again", async ({ page }) => {
    const seen = await openCups(page);
    await page.getByTestId("board-mode-leagues").click();
    await page.waitForSelector('[data-testid="league-col"][data-league="epl"]');
    expect(seen.board).toContain(null);
    await expect(page.getByTestId("column-chip")).toHaveCount(8);
  });
});

test.describe("cup ties leave the league columns", () => {
  /** The recorded board plus one EFL Cup tie the backend folded into the
   *  EPL column — a copy of an EPL row under the cup's slug. */
  function withFoldedTie() {
    const b = structuredClone(BOARD_EIGHT) as unknown as {
      rows: Record<string, unknown>[];
    };
    const epl = b.rows.find((r) => r.league === "epl")!;
    b.rows.push({ ...epl, league: "eflcup", column: "epl", columns: ["epl"],
                  event_id: "999000111" });
    return { b, epl };
  }

  test("a folded cup tie is not drawn in the league column", async ({ page }) => {
    const { b, epl } = withFoldedTie();
    await routeAll(page, b);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await expect(page.locator('[data-testid="picker-row"][data-event="999000111"]')).toHaveCount(0);
    await expect(page.locator(`[data-testid="picker-row"][data-event="${epl.event_id}"]`).first())
      .toBeAttached();
    await expect(page.getByTestId("cup-ties-left")).toContainText("1 cup tie");
  });

  test("with no cup tie on the board, the note is absent, not '0'", async ({ page }) => {
    await routeAll(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await expect(page.getByTestId("cup-ties-left")).toHaveCount(0);
  });
});

for (const width of [1440, 390]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`the Cups tab has no horizontal scroll at ${width}px, ${scheme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.clock.install({ time: new Date(CUPS_CLOCK) });
      await remember(page, "cups");
      await routeCups(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');
      const over = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, "the Cups tab overflows").toBeLessThanOrEqual(0);
    });
  }
}

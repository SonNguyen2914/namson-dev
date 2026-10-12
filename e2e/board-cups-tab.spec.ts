/** LEAGUES | CUPS | NATIONS — cups plan Phase A (2026-10-12).
 *
 *  Son's naming decision of 2026-10-07 (roadmap 05b), as the page must
 *  keep it:
 *    - the switch is Leagues | Cups | Nations, in that order; "Nations" is
 *      the old Championships board under its UI name, still read from
 *      /api/championships/* — and a viewer who left on "championships"
 *      comes back to it;
 *    - the Cups tab reads NO board: no /api/picker/*, no /api/championships/*;
 *    - Continental and Domestic each list the cups that have pages, linked,
 *      and the rest as "coming" with no number on them at all;
 *    - a cup tie the backend folded into a league column is not drawn there;
 *    - AFCON reads "AFCON Qualifiers" while it is qualifying.
 *  Hermetic: every board is a recorded payload served by page.route. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";

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

test.describe("the Cups tab", () => {
  test("reads no board, either way", async ({ page }) => {
    await remember(page, "cups");
    const calls = await routeAll(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="cups-tab"]');
    await page.waitForTimeout(700);
    expect(calls).toEqual({ board: 0, review: 0, champ: 0 });
    await expect(page.getByTestId("board-mode-cups")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-testid="league-col"]')).toHaveCount(0);
  });

  test("Continental: the cups with pages link to them; the rest are coming, "
    + "with no number", async ({ page }) => {
    await routeAll(page);
    await page.goto("/bet-suggester");
    await page.getByTestId("board-mode-cups").click();
    const tab = page.getByTestId("cups-tab");
    await expect(tab).toHaveAttribute("data-scope", "continental");
    const live = tab.getByTestId("cup-live");
    await expect(live).toHaveCount(3);
    expect(await live.evaluateAll((e) => e.map((x) => x.getAttribute("data-cup"))))
      .toEqual(["ucl", "leaguescup", "campeones"]);
    const hrefs = await tab.getByTestId("cup-link")
      .evaluateAll((e) => e.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([
      "/bet-suggester/ucl", "/bet-suggester/comp/ucl",
      "/bet-suggester/comp/leagues-cup", "/bet-suggester/leagues-cup",
      "/bet-suggester/ratings?comp=campeones",
    ]);
    const coming = tab.getByTestId("cup-coming");
    expect(await coming.evaluateAll((e) => e.map((x) => x.getAttribute("data-cup"))))
      .toEqual(["uel", "uecl", "concacafcc"]);
    for (const t of await coming.allInnerTexts()) {
      expect(t, "a coming cup carries no number").not.toMatch(/\d/);
      expect(t.toLowerCase()).toContain("coming");
    }
  });

  test("Domestic: the EFL Cup links to its board; the national cups are coming",
    async ({ page }) => {
      await remember(page, "cups");
      await routeAll(page);
      await page.goto("/bet-suggester");
      await page.getByTestId("cups-scope-domestic").click();
      const tab = page.getByTestId("cups-tab");
      await expect(tab).toHaveAttribute("data-scope", "domestic");
      await expect(tab.getByTestId("cup-live")).toHaveCount(1);
      await expect(tab.getByTestId("cup-link")).toHaveAttribute("href", "/bet-suggester/efl-cup");
      const coming = tab.getByTestId("cup-coming");
      await expect(coming).toHaveCount(7);
      for (const t of await coming.allInnerTexts()) expect(t).not.toMatch(/\d/);
    });

  test("leaving the Cups tab reads the Leagues board again", async ({ page }) => {
    await remember(page, "cups");
    const calls = await routeAll(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="cups-tab"]');
    await page.getByTestId("board-mode-leagues").click();
    await page.waitForSelector('[data-testid="league-col"]');
    expect(calls.board).toBeGreaterThan(0);
    await expect(page.getByTestId("cups-tab")).toHaveCount(0);
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
      await remember(page, "cups");
      await routeAll(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="cups-tab"]');
      for (const s of ["continental", "domestic"]) {
        await page.getByTestId(`cups-scope-${s}`).click();
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${s} overflows`).toBeLessThanOrEqual(0);
      }
    });
  }
}

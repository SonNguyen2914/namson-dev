/** THE CHAMPIONSHIPS BOARD — the landing page's second board.
 *
 *  `/bet-suggester` carries two boards behind one switch: the club board
 *  it has always been (GET /api/picker/board) and the four national-team
 *  competitions (GET /api/championships/board). Everything here runs on
 *  a RECORDED payload off the real route (e2e/championships-recorded.ts),
 *  so the cards are measured on the provider's own vocabulary, never on
 *  a shape written from a brief.
 *
 *  TWO GUARDS ARE ABOUT REQUESTS, NOT PIXELS, and they are the reason
 *  this file exists before any of the rendering ones:
 *    - the Leagues board makes ZERO calls to the championships route;
 *    - the Championships board makes ZERO calls to the club board — which
 *      matters more, because every club-board GET freezes a pre-kickoff
 *      snapshot row on the backend (e2e/board-holdout.mjs), and a viewer
 *      who left the page on Championships must not cost it one on the
 *      way back. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK, SAMPLE_REFUSAL } from "./championships-recorded";

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

type Calls = { board: number; review: number; champ: number };

/** Route BOTH boards, and count every request to each. */
async function routeBoth(page: Page, champ: unknown = CHAMP_BOARD): Promise<Calls> {
  const calls: Calls = { board: 0, review: 0, champ: 0 };
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith("/api/picker/board")) calls.board += 1;
    if (u.pathname.startsWith("/api/picker/review")) calls.review += 1;
    if (u.pathname.startsWith("/api/championships")) calls.champ += 1;
  });
  await routeEight(page);
  await page.route("**/api/championships/**",
    (r) => r.fulfill(json(champ)));
  return calls;
}

/** Open the landing page on the Championships board, the way a returning
 *  viewer arrives: the choice already remembered. */
async function openChampionships(page: Page, champ: unknown = CHAMP_BOARD) {
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  const calls = await routeBoth(page, champ);
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
  return calls;
}

const COLUMNS = CHAMP_BOARD.columns as readonly string[];

test.describe("the Championships board", () => {
  test("the Leagues board makes no call to the championships route",
    async ({ page }) => {
      const calls = await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');
      await expect(page.locator('[data-testid="board-mode-leagues"]'))
        .toHaveAttribute("aria-pressed", "true");
      // the board moved and the page settled: still nothing
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(700);
      expect(calls.board).toBeGreaterThan(0);
      expect(calls.champ).toBe(0);
    });

  test("the Championships board makes no call to the club board",
    async ({ page }) => {
      const calls = await openChampionships(page);
      await page.waitForTimeout(700);
      expect(calls.champ).toBeGreaterThan(0);
      expect(calls.board, "a club-board GET freezes snapshot rows").toBe(0);
      expect(calls.review).toBe(0);
    });

  test("the switch flips the board, each way, one route per mode",
    async ({ page }) => {
      const calls = await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"][data-league="epl"]');
      const boardBefore = calls.board;
      await page.click('[data-testid="board-mode-championships"]');
      await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
      await expect(page.locator('[data-testid="league-col"][data-league="epl"]'))
        .toHaveCount(0);
      expect(calls.champ).toBeGreaterThan(0);
      expect(calls.board).toBe(boardBefore);
      await page.click('[data-testid="board-mode-leagues"]');
      await page.waitForSelector('[data-testid="league-col"][data-league="epl"]');
      await expect(page.locator('[data-testid="league-col"][data-league="unl"]'))
        .toHaveCount(0);
    });

  test("the choice is remembered across a reload", async ({ page }) => {
    await routeBoth(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await page.click('[data-testid="board-mode-championships"]');
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    await page.reload();
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    await expect(page.locator('[data-testid="board-mode-championships"]'))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("the columns are the payload's `columns`, in its order",
    async ({ page }) => {
      await openChampionships(page);
      const drawn = await page.locator('[data-testid="league-col"]')
        .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.league));
      expect(drawn).toEqual([...COLUMNS]);
    });

  test("every column wears its own light, and none is the brand gold",
    async ({ page }) => {
      await openChampionships(page);
      const got = await page.evaluate((cols) => {
        const root = getComputedStyle(document.documentElement);
        const probe = document.createElement("i");
        document.body.appendChild(probe);
        const ink = (v: string) => { probe.style.color = v; return getComputedStyle(probe).color; };
        const out = cols.map((c) => {
          const rail = document.querySelector(
            `[data-testid="col-head"][data-league="${c}"] [data-testid="col-rail"]`) as HTMLElement | null;
          return { slug: c, token: root.getPropertyValue(`--lg-${c}`).trim(),
                   rail: rail ? getComputedStyle(rail).backgroundColor : null,
                   want: ink(`var(--lg-${c})`) };
        });
        const gold = ink("var(--accent)");
        probe.remove();
        return { out, gold };
      }, [...COLUMNS]);
      for (const c of got.out) {
        expect(c.token, `--lg-${c.slug} is declared`).not.toBe("");
        expect(c.rail, `${c.slug}'s rail`).toBe(c.want);
        expect(c.rail).not.toBe(got.gold);
      }
      expect(new Set(got.out.map((c) => c.rail)).size).toBe(COLUMNS.length);
    });

  test("a ranked national card reads the field: favourite, tiers, a below-floor mark",
    async ({ page }) => {
      await openChampionships(page);
      const ranked = page.locator('[data-testid="picker-row"]');
      await expect(ranked).toHaveCount(CHAMP_BOARD.rows.length);
      // attack and defence are below the floor for every team: marked,
      // the way a below-floor club side is
      expect(await page.locator('[data-testid="field-floor-mark"]').count())
        .toBeGreaterThan(0);
      // the field block is the one a club cup card draws
      expect(await page.locator('[data-testid="picker-row"] [data-testid="field-ranks-open"]').count())
        .toBeGreaterThan(0);
    });

  test("a side without a rating is a refusal, listed with its reason",
    async ({ page }) => {
      // the merged recording rates every side in its window; the route's
      // own refused card for one of its fixtures stands in for that
      // fixture's ranked row (see championships-recorded.ts)
      await openChampionships(page, { ...CHAMP_BOARD,
        rows: CHAMP_BOARD.rows.filter((r) => r.event_id !== SAMPLE_REFUSAL.event_id),
        refusals: [...CHAMP_BOARD.refusals, SAMPLE_REFUSAL] });
      const refused = page.locator('[data-testid="picker-refusal"]');
      await expect(refused).toHaveCount(1);
      await expect(refused.locator('[data-testid="refusal-reason"]'))
        .toHaveText("no_national_rating");
      // a refusal to RANK is not a refusal to show the book or the facts
      await expect(refused).toContainText("ask 53¢");
      await expect(refused.locator('[data-testid="national-read"]')).toBeAttached();
    });

  test("a Kalshi price is drawn the way the board draws one, with its side named",
    async ({ page }) => {
      await openChampionships(page);
      const priced = page.locator('[data-testid="national-price-side"]');
      expect(await priced.count()).toBeGreaterThan(0);
      const card = page.locator('article:has([data-testid="national-price-side"])').first();
      await expect(card).toContainText(/ask \d+¢/);
    });

  test("the national reader: friendlies marked, head-to-head, lineups",
    async ({ page }) => {
      await openChampionships(page);
      await expect(page.locator('[data-testid="national-read"]').first()).toBeAttached();
      expect(await page.locator('[data-testid="national-form-game"][data-friendly="1"]').count())
        .toBeGreaterThan(0);
      await expect(page.locator('[data-testid="national-form-key"]').first()).toBeAttached();
      await expect(page.locator('[data-testid="national-h2h"]').first()).toBeAttached();
      await expect(page.locator('[data-testid="national-lineups"]').first()).toBeAttached();
    });

  test("the Leagues board draws no national reader and no switch-born change to its cards",
    async ({ page }) => {
      await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');
      await expect(page.locator('[data-testid="national-read"]')).toHaveCount(0);
      expect(await page.locator('[data-testid="league-col"]').count())
        .toBe(Object.keys(BOARD_EIGHT.leagues).length);
    });
});

/** THE BOARD THAT CARRIES MORE COLUMNS THAN IT DRAWS.
 *
 *  Four is MEASURED, not chosen — the track is max-w-[96rem], so a card
 *  stops growing at 1536px and eight leagues cannot sit side by side at
 *  any width. These pin the window, the loop, and the two properties the
 *  design turns on: the lit four never move, and a league that is not
 *  drawn is still NAMED rather than vanished. */
import { test, expect } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT, serveEight } from "./eight-columns";

test.describe("eight columns on a four-column board", () => {
  test("draws four of eight, and every league keeps a pill", async ({ page }) => {
    await serveEight(page);
    const cols = page.locator('[data-testid="league-col"]');
    await expect(cols).toHaveCount(4);
    await expect(page.locator('[data-testid="ribbon-pill"]')).toHaveCount(8);
    const lit = page.locator('[data-testid="ribbon-pill"][aria-selected="true"]');
    await expect(lit).toHaveCount(4);
  });

  test("the header names exactly what the board draws", async ({ page }) => {
    await serveEight(page);
    const drawn = await page.locator('[data-testid="league-col"]')
      .evaluateAll((es) => es.map((e) => e.getAttribute("data-league")));
    const litNames = await page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug));
    expect(litNames.slice().sort()).toEqual(drawn.slice().sort());
  });

  test("it LOOPS — stepping past the last column reaches the first", async ({ page }) => {
    await serveEight(page);
    const lit = () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug).join(","));
    const start = await lit();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(90);
    }
    // eight columns, eight steps: all the way round and back
    expect(await lit()).toBe(start);
  });

  test("a pill jumps to its league, and the board follows", async ({ page }) => {
    await serveEight(page);
    for (const slug of ["eredivisie", "ligamx", "epl"]) {
      await page.locator(`[data-testid="ribbon-pill"][data-slug="${slug}"]`).click();
      await page.waitForTimeout(150);
      const first = await page.locator('[data-testid="league-col"]').first()
        .getAttribute("data-league");
      expect(first).toBe(slug);
    }
  });

  test("THE LIT FOUR NEVER MOVE — what travels is the content", async ({ page }) => {
    await serveEight(page);
    const boxes = async () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => Math.round(e.getBoundingClientRect().left)));
    const before = await boxes();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(700);
    expect(await boxes()).toEqual(before);
  });

  test("a league that is not drawn is NAMED, never hidden", async ({ page }) => {
    await serveEight(page);
    const dim = page.locator('[data-testid="ribbon-pill"][aria-selected="false"]');
    await expect(dim).toHaveCount(4);
    for (const t of await dim.allInnerTexts()) expect(t.trim().length).toBeGreaterThan(0);
  });

  test("every column's ink is its own, and none is the brand gold", async ({ page }) => {
    await serveEight(page);
    const inks = await page.evaluate(() => {
      const out: Record<string, string> = {};
      document.querySelectorAll('[data-testid="ribbon-pill"]').forEach((b) => {
        const slug = (b as HTMLElement).dataset.slug!;
        out[slug] = getComputedStyle(document.documentElement)
          .getPropertyValue(`--lg-${slug}`).trim();
      });
      return { inks: out,
        cup: getComputedStyle(document.documentElement).getPropertyValue("--lg-cup").trim() };
    });
    const vals = Object.values(inks.inks);
    expect(vals.filter(Boolean)).toHaveLength(8);
    expect(new Set(vals).size).toBe(8);
    expect(vals).not.toContain(inks.cup);
  });

  test("the window is a NO-OP at four columns — today's board is untouched",
    async ({ page }) => {
      const four = { ...BOARD_EIGHT, leagues: Object.fromEntries(
        Object.entries(BOARD_EIGHT.leagues).slice(0, 4)) };
      await serveEight(page, four);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(4);
      await expect(page.locator('[data-testid="league-ribbon"]')).toHaveCount(0);
    });
});

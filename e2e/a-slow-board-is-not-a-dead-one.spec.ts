/** A SLOW BOARD IS NOT A DEAD ONE (2026-09-26).
 *
 *  At 03:45 PT the Championships board showed "the board could not be
 *  built: the backend did not answer within 15s" on a healthy backend.
 *  Its provider cache expires every five minutes (the club board's every
 *  90s) and the next reader pays for the rebuild ON THE REQUEST PATH:
 *  measured 3.0s, 4.9s and 8.5s cold, and past 15s under Kalshi
 *  throttling. The proxy's 15s clock (fe#95) then failed the page while
 *  the backend finished moments later.
 *
 *  So: the two board routes wait 45s and every other route keeps 15s,
 *  and the page asks ONCE more after a proxy timeout, showing a quiet
 *  building state instead of the red card. The red card only follows a
 *  second timeout, and a stale board is never drawn in the meantime.
 *
 *  HERMETIC. The slow backend is the stand-in (`__standin_delay_ms`,
 *  e2e/stand-in-backend.mjs) reached through the app's REAL proxy; the
 *  board payload itself is the recorded one, served with page.route. */
import { test, expect, type Page, type Route } from "@playwright/test";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { routeEight } from "./eight-columns";
import * as proxyLib from "../src/lib/suggesterProxy";

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

/** The proxy's own 504 body, word for word — the page must recognise
 *  exactly this, not any 504. */
const TIMEOUT_504 = json(proxyLib.timeoutAnswer(), 504);

/** Record whether the red card was EVER attached, not just whether it is
 *  there when the test looks. */
async function watchForErrorCard(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __boardErrorSeen?: boolean };
    new MutationObserver(() => {
      if (document.querySelector('[data-testid="board-error"]'))
        w.__boardErrorSeen = true;
    }).observe(document, { childList: true, subtree: true });
  });
}
const errorCardSeen = (page: Page) => page.evaluate(
  () => Boolean((window as unknown as { __boardErrorSeen?: boolean })
    .__boardErrorSeen));

async function onChampionships(page: Page) {
  // the club board is routed too, though this mode never asks it: a
  // board GET that slipped through would WRITE a snapshot
  // (e2e/the-board-writes-nothing.spec.ts)
  await routeEight(page);
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
}

// ------------------------------------------------ the proxy's clocks

test.describe("the proxy's clock, per route", () => {
  test("a championships board that takes 20s is answered, not timed out",
    async ({ request }) => {
      test.setTimeout(60_000);
      const started = Date.now();
      const r = await request.get(
        "/api/championships/board?days=8&__standin_delay_ms=20000",
        { timeout: 50_000 });
      const took = Date.now() - started;
      expect(r.status(), await r.text()).toBe(200);
      expect((await r.json()).delayed_ms).toBe(20_000);
      expect(took).toBeGreaterThanOrEqual(19_000);
    });

  test("every other route still stops waiting at 15s", async ({ request }) => {
    test.setTimeout(60_000);
    const started = Date.now();
    const r = await request.get("/api/mls/scoreboard?__standin_delay_ms=20000",
      { timeout: 50_000 });
    const took = Date.now() - started;
    expect(r.status()).toBe(504);
    const body = await r.json();
    expect(body.reason).toBe("backend_timeout");
    expect(body.detail).toMatch(/did not answer within 15s/);
    expect(took).toBeGreaterThanOrEqual(14_000);
    expect(took).toBeLessThan(19_000);
  });

  test("the table gives 45s to the two boards and 15s to everything else",
    () => {
      // Read through the namespace so this file still loads — and this
      // test fails by name — on a tree that has no table.
      const at = (proxyLib as Record<string, unknown>).proxyTimeoutMs as
        ((route: string) => number) | undefined;
      expect(typeof at, "no per-route timeout table").toBe("function");
      if (!at) return;
      expect(at("championships/board")).toBe(45_000);
      expect(at("picker/board")).toBe(45_000);
      for (const other of ["picker/review", "mls/scoreboard", "epl/schedule",
                           "comp/ucl/fixtures", "hunter/findings"]) {
        expect(at(other), other).toBe(proxyLib.PROXY_TIMEOUT_MS);
      }
      expect(proxyLib.PROXY_TIMEOUT_MS).toBe(15_000);
    });
});

// ------------------------------------------------------- the page

test.describe("the board page on a slow rebuild", () => {
  test("a 20s board read through the real proxy draws the board, no red card",
    async ({ page }) => {
      test.setTimeout(90_000);
      await watchForErrorCard(page);
      await onChampionships(page);
      const upstream: number[] = [];
      await page.route("**/api/championships/**", async (r: Route) => {
        // the SAME request, sent through the app's own proxy to a
        // stand-in that takes 20s; the proxy's verdict decides what the
        // page gets
        const resp = await r.fetch({
          url: `${r.request().url()}&__standin_delay_ms=20000`,
          timeout: 60_000,
        });
        upstream.push(resp.status());
        if (resp.status() === 200) return r.fulfill(json(CHAMP_BOARD));
        return r.fulfill({ response: resp });
      });
      await page.goto("/bet-suggester");
      await page.locator('[data-testid="league-col"][data-league="unl"]')
        .waitFor({ timeout: 70_000 });
      expect(upstream[0], "the proxy stopped waiting on a 20s board").toBe(200);
      expect(await errorCardSeen(page)).toBe(false);
    });

  for (const mode of ["championships", "leagues"] as const) {
    test(`${mode}: one proxy timeout shows the building state, then the board`,
      async ({ page }) => {
        await watchForErrorCard(page);
        let asked = 0;
        if (mode === "championships") {
          await onChampionships(page);
          await page.route("**/api/championships/**", (r) => {
            asked += 1;
            return r.fulfill(asked === 1 ? TIMEOUT_504 : json(CHAMP_BOARD));
          });
        } else {
          await routeEight(page);
          // registered last, so asked first; the second read falls back
          // to the recorded eight-column board
          await page.route("**/api/picker/board**", (r) => {
            asked += 1;
            return asked === 1 ? r.fulfill(TIMEOUT_504) : r.fallback();
          });
        }
        await page.goto("/bet-suggester");
        const building = page.getByTestId("board-building");
        await expect(building).toBeVisible();
        await expect(building).toContainText("Building the board");
        // nothing stale stands in for the board while it is rebuilt
        await expect(page.locator('[data-testid="league-col"]')).toHaveCount(0);
        await page.locator('[data-testid="league-col"]').first().waitFor();
        await expect(building).toHaveCount(0);
        expect(asked).toBe(2);
        expect(await errorCardSeen(page)).toBe(false);
      });
  }

  test("two proxy timeouts show the red card, and only then", async ({ page }) => {
    await onChampionships(page);
    let asked = 0;
    await page.route("**/api/championships/**", (r) => {
      asked += 1;
      return r.fulfill(TIMEOUT_504);
    });
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("board-building")).toBeVisible();
    await expect(page.getByTestId("board-error")).toHaveCount(0);
    const card = page.getByTestId("board-error");
    await expect(card).toBeVisible();
    await expect(card).toContainText(/the board could not be built/i);
    await expect(card).toContainText(
      "Nothing is being shown from an earlier request");
    await expect(page.locator('[data-testid="league-col"]')).toHaveCount(0);
    expect(asked).toBe(2);
    // one retry, not a loop
    await page.waitForTimeout(3_000);
    expect(asked).toBe(2);
  });
});

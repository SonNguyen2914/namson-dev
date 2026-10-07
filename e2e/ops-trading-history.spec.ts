import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import { routeEight } from "./eight-columns";
import { qaBook, qaCandidates, qaLedger, qaStatusWithCareful } from "./console-fixtures";

// "← BOARD" GOES TO THE BOARD, AND BACK LEAVES THE CONSOLE (Son's bug,
// 2026-10-07). Before: every console view switch pushed a history entry
// and "← board" was history.back(), so from Trades → Portfolio → Trading it
// stepped back through each view before reaching the board — and the
// browser's own Back did the same. Now a view switch REPLACES the URL's
// hash and "← board" is a plain link to the board (the BOARD chip's own
// target). Checked here the way he hit it: arriving from the board, with a
// same-origin referrer and history behind the console.

const TOKEN = "ops-history-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function routes(page: Page) {
  await routeEight(page);
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, qaStatusWithCareful())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(200, qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(200, qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(json(200, qaLedger())));
}
async function token(page: Page) {
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
}
/** the board first, then the console FROM it (a same-origin referrer and
 *  a history entry behind — the case history.back() used to take) */
async function fromTheBoard(page: Page, hash = "") {
  await routes(page);
  await page.goto("/bet-suggester");
  await expect(page).toHaveURL(/\/bet-suggester$/);
  const origin = new URL(page.url()).origin;
  await page.goto(`/ops/trading${hash}`, { referer: `${origin}/bet-suggester` });
  await token(page);
}
async function tour(page: Page) {
  for (const v of ["trades", "portfolio", "trading", "performance"]) {
    await page.getByTestId(`nav-${v}`).click();
    await expect(page.getByTestId(`nav-${v}`)).toHaveAttribute("aria-current", "page");
    await expect.poll(() => new URL(page.url()).hash).toBe(`#${v}`);
  }
}

test.describe("leaving the console", () => {
  test("after several views, ← board lands on the board in one click", async ({ page }) => {
    await fromTheBoard(page);
    expect(await page.evaluate(() => document.referrer)).toContain("/bet-suggester");
    const before = await page.evaluate(() => history.length);
    await tour(page);
    // the tour added no history entry
    expect(await page.evaluate(() => history.length)).toBe(before);
    await page.locator('[data-testid="topbar-left"] a[href="/bet-suggester"]').click();
    await expect(page).toHaveURL(/\/bet-suggester$/);
    await expect(page.getByTestId("ops-console")).toHaveCount(0);
  });

  test("after several views, the browser's Back once leaves the console", async ({ page }) => {
    await fromTheBoard(page);
    await tour(page);
    // the rail's pills and Attention's links are view links too
    await page.getByTestId("rail-learning").click();
    await expect(page.getByTestId("nav-model")).toHaveAttribute("aria-current", "page");
    await page.goBack();
    await expect(page).toHaveURL(/\/bet-suggester$/);
  });

  test("the BOARD, LEAGUES and FIELD chips go to their pages directly", async ({ page }) => {
    for (const [href, re] of [["/bet-suggester", /\/bet-suggester$/], ["/bet-suggester/leagues", /\/bet-suggester\/leagues$/],
      ["/bet-suggester/ratings", /\/bet-suggester\/ratings$/]] as const) {
      await fromTheBoard(page);
      await tour(page);
      await page.locator(`header nav a[href="${href}"]`).first().click();
      await expect(page, href).toHaveURL(re);
    }
  });
});

test.describe("a view is still in the URL", () => {
  test("a deep link opens its view, a switch rewrites the URL, and a reload keeps it", async ({ page }) => {
    await routes(page);
    await page.goto("/ops/trading#trades");
    await token(page);
    await expect(page.getByTestId("nav-trades")).toHaveAttribute("aria-current", "page");
    await page.getByTestId("nav-portfolio").click();
    await expect.poll(() => new URL(page.url()).hash).toBe("#portfolio");
    await page.reload();
    await token(page);
    await expect(page.getByTestId("nav-portfolio")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("ops-book")).toBeVisible();
  });

  test("a filtered deep link survives a reload, and its filters survive a view switch", async ({ page }) => {
    await routes(page);
    await page.goto("/ops/trading#trading?decision=skipped");
    await token(page);
    const skipped = page.locator('[data-testid="cand-decision"][data-decision="skipped"]');
    await expect(skipped).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await token(page);
    await expect(skipped).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("nav-system").click();
    await page.getByTestId("nav-trading").click();
    await expect(skipped).toHaveAttribute("aria-pressed", "true");
    expect(page.url()).toContain("decision=skipped");
  });

  test("a new-tab click on a view link is left to the browser", async ({ page }) => {
    await routes(page);
    await page.goto("/ops/trading");
    await token(page);
    const popup = page.context().waitForEvent("page");
    await page.getByTestId("nav-trades").click({ modifiers: [process.platform === "darwin" ? "Meta" : "Control"] });
    const p = await popup;
    await expect.poll(() => p.url()).toContain("/ops/trading#trades");
    await expect(page.getByTestId("nav-overview")).toHaveAttribute("aria-current", "page");
    await p.close();
  });
});

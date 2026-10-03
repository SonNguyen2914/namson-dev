import { expect, test, devices, type Page, type Request } from "@playwright/test";
import { routeEight } from "./eight-columns";
import { armToken, E2E_OPERATOR_TOKEN as TOKEN } from "./operator-token";
import { pageRoutes, PAGE_COUNT } from "./page-routes";
import { auditFloor } from "./the-touch-floor";

/* HIDDEN CHIP + ONE TOKEN (Son, 2026-10-03).
 *
 * A Trading chip appears in the header ONLY once the operator token is
 * typed, and the token typed on the board is the one the trading console
 * (/ops/trading) uses after the chip's client-side hop — typed once per
 * visit. Each claim, checked here:
 *
 *   - with no token there is no chip on ANY page, and no link to the
 *     console at all (the page set is the pages directory's own);
 *   - typing the token on the board draws the chip;
 *   - pressing it lands on the console ALREADY AUTHENTICATED: one status
 *     read, carrying the token, with no typing and no debounce wait — the
 *     page never once says "held in this tab only" (which is what it
 *     says while no token is armed);
 *   - the token is in no storage, and a reload forgets it and the chip;
 *   - the console has a way back to everything: the logo goes home, the
 *     back arrow and the chips go to the board, the leagues and the
 *     field, and the token survives the hop back to the board;
 *   - on a phone the chip sits in the rail's own row, at the touch floor.
 *
 * Hermetic: the board is the eight-column recording, the status read is
 * served below, and everything else fails against the stand-in. */

const STATUS = "**/api/ops/trading-status";

/** trading-status-v0, trimmed to what the console's top strip and money
 *  section read; values invented. */
const PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v0", env: "prod", enabled: true,
  universe_enabled: true, kill: false,
  halt: { active: false, reason: null, since: null, rearm: null },
  balance: "48.12", marked_equity: "49.37",
  total_at_risk: "7.40", total_limit: "20.00", bankroll_cap: "50",
  open_agent_orders: 3, open_other_orders: 1, fills_today: 2, placed_today: 5,
  pnl: { agent_total: "-0.63", realized_total: "1.05" },
  daily_loss: { used: "0.63", limit: "10" },
  drawdown: { used: "0.63", limit: "15" },
  last_tick: { at: "2026-10-03T17:59:50+00:00", outcome: "ok" },
  generated_at: "2026-10-03T18:00:00+00:00",
};

/** Every status read the page makes, as it leaves. */
function statusReads(page: Page): Request[] {
  const seen: Request[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === "/api/ops/trading-status") seen.push(r);
  });
  return seen;
}

async function serveStatus(page: Page) {
  await page.route(STATUS, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify(PAYLOAD),
  }));
}

/** The board, from its recording, with the operator token typed into the
 *  watch panel — the one place a visitor to the board could type it. */
async function boardWithToken(page: Page) {
  await routeEight(page);
  await page.goto("/bet-suggester");
  await armToken(page);
}

/** The token is in no storage this origin has. */
async function expectNotStored(page: Page) {
  const stored = await page.evaluate(() => JSON.stringify({
    l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie,
  }));
  expect(stored).not.toContain(TOKEN);
  expect((await page.context().cookies()).map((c) => c.value))
    .not.toContain(TOKEN);
}

// ─────────────────────────────── a visitor never sees it ─────────────

const routes = pageRoutes();

test("with no token, no page draws the chip or links to the console",
  async ({ page }) => {
    expect(routes.length).toBe(PAGE_COUNT);
    test.setTimeout(6_000 * routes.length * 1.5);
    await routeEight(page);
    const findings: string[] = [];
    for (const { url } of routes) {
      await page.goto(url, { waitUntil: "load", timeout: 6_000 });
      await page.waitForSelector("header.topbar");
      // after hydration, and after the client's first effects
      await page.waitForTimeout(300);
      const n = await page.evaluate(() => ({
        chip: document.querySelectorAll('[data-testid="trading-chip"]').length,
        links: document.querySelectorAll('a[href="/ops/trading"]').length,
      }));
      if (n.chip) findings.push(`${url}: ${n.chip} trading chip(s)`);
      if (n.links) findings.push(`${url}: ${n.links} link(s) to /ops/trading`);
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });

// ───────────────────────── typed once, on the board ──────────────────

test("a token typed on the board draws the chip, and pressing it opens the "
  + "console already authenticated — one read, no retyping", async ({ page }) => {
    await serveStatus(page);
    const reads = statusReads(page);
    await routeEight(page);
    await page.goto("/bet-suggester");
    const chip = page.getByTestId("trading-chip");
    // the board itself, before anything is typed: no chip
    await expect(page.getByTestId("watch-panel")).toBeVisible();
    await expect(chip).toHaveCount(0);

    await armToken(page);
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute("href", "/ops/trading");
    await expect(chip).not.toHaveAttribute("aria-current", "page");
    await expectNotStored(page);
    expect(reads, "the board does not read the console's route").toEqual([]);

    /* THE HOP MUST BE CLIENT-SIDE — a document load would build a new
       app shell and the token with it would be gone — and the console
       must never show its "no token armed" line on the way in. Both are
       watched from the window itself, which a client-side hop keeps. */
    await page.evaluate(() => {
      const w = window as unknown as { __shell: number; __unarmed: number };
      w.__shell = 1;
      w.__unarmed = 0;
      new MutationObserver(() => {
        const s = document.querySelector('[data-testid="ops-state"]');
        if (s?.textContent?.includes("held in this tab only")) w.__unarmed += 1;
      }).observe(document.body,
        { childList: true, subtree: true, characterData: true });
    });
    await chip.click();
    await expect(page).toHaveURL(/\/ops\/trading$/);
    await expect(page.getByTestId("ops-console")).toBeVisible();
    await expect(page.getByTestId("ops-money")).toContainText("$48.12");
    // the console's field shows the token it is using, and nobody typed it
    await expect(page.locator("#watch-token")).toHaveValue(TOKEN);
    // and the chip says where you are
    await expect(chip).toHaveAttribute("aria-current", "page");

    // one debounce window and more: whatever was going to fire has fired
    await page.waitForTimeout(1_200);
    expect(reads.length, "status reads on arrival").toBe(1);
    expect(reads[0].method()).toBe("GET");
    expect(reads[0].headers()["x-admin-token"]).toBe(TOKEN);
    const w = await page.evaluate(() => {
      const x = window as unknown as { __shell?: number; __unarmed?: number };
      return { shell: x.__shell, unarmed: x.__unarmed };
    });
    expect(w.shell, "the hop kept the window — a client-side navigation")
      .toBe(1);
    expect(w.unarmed, "the console never showed itself unarmed").toBe(0);
    await expectNotStored(page);

    // A RELOAD FORGETS IT: the token, the chip, and every read
    const after = statusReads(page);
    await page.reload();
    await expect(page.locator("#watch-token")).toHaveValue("");
    await expect(page.getByTestId("ops-state"))
      .toContainText("held in this tab only");
    await page.waitForTimeout(1_200);
    await expect(chip).toHaveCount(0);
    await expect(page.locator('a[href="/ops/trading"]')).toHaveCount(0);
    await expect(page.getByTestId("ops-console")).toHaveCount(0);
    expect(after, "no read after a reload").toEqual([]);
  });

test("emptying the field takes the chip away", async ({ page }) => {
  await boardWithToken(page);
  const chip = page.getByTestId("trading-chip");
  await expect(chip).toBeVisible();
  await page.locator("#watch-token").fill("");
  await expect(chip).toHaveCount(0);
});

// ──────────────────────── and a way back to everything ───────────────

test("from the console: the logo goes home, the back arrow and chips go to "
  + "the board, the leagues and the field", async ({ page }) => {
    await routeEight(page);
    await page.goto("/ops/trading");
    // a direct visit, no token: the way out is there, the chip is not
    await expect(page.getByTestId("trading-chip")).toHaveCount(0);
    const rail = page.locator('header.topbar [data-testid="topbar-right"] nav');
    await expect(rail.locator('a[href="/bet-suggester"]')).toHaveCount(1);
    await expect(rail.locator('a[href="/bet-suggester/leagues"]')).toHaveCount(1);
    await expect(rail.locator('a[href="/bet-suggester/ratings"]')).toHaveCount(1);
    const back = page.getByRole("link", { name: "board", exact: true })
      .and(page.locator('[data-testid="topbar-left"] a'));
    await expect(back).toHaveAttribute("href", "/bet-suggester");

    await page.getByTestId("home-logo").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("landing")).toBeVisible();

    await page.goto("/ops/trading");
    await rail.locator('a[href="/bet-suggester/ratings"]').click();
    await expect(page).toHaveURL(/\/bet-suggester\/ratings$/);

    await page.goto("/ops/trading");
    await rail.locator('a[href="/bet-suggester/leagues"]').click();
    await expect(page).toHaveURL(/\/bet-suggester\/leagues$/);

    await page.goto("/ops/trading");
    await back.click();
    await expect(page).toHaveURL(/\/bet-suggester$/);
    await expect(page.getByTestId("watch-panel")).toBeVisible();
  });

test("the token survives the hop back to the board, and every hop after it",
  async ({ page }) => {
    await serveStatus(page);
    await boardWithToken(page);
    const chip = page.getByTestId("trading-chip");
    await chip.click();
    await expect(page).toHaveURL(/\/ops\/trading$/);
    await expect(page.getByTestId("ops-console")).toBeVisible();

    // back to the board by the back arrow: the field still holds it
    await page.locator('[data-testid="topbar-left"] a[href="/bet-suggester"]')
      .click();
    await expect(page).toHaveURL(/\/bet-suggester$/);
    await expect(chip).toBeVisible();
    const panel = page.getByTestId("watch-panel");
    await panel.locator("summary").click();
    await expect(page.locator("#watch-token")).toHaveValue(TOKEN);
    await expect(page.getByTestId("watch-panel-chip"))
      .not.toContainText("operator only");

    // to the field and home: the chip rides along on every page
    await page.getByTestId("field-link").click();
    await expect(page).toHaveURL(/\/bet-suggester\/ratings$/);
    await expect(chip).toBeVisible();
    await page.getByTestId("home-logo").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(chip).toBeVisible();

    // and from home straight back into the console, still authenticated
    const reads = statusReads(page);
    await chip.click();
    await expect(page).toHaveURL(/\/ops\/trading$/);
    await expect(page.getByTestId("ops-console")).toBeVisible();
    await page.waitForTimeout(1_000);
    expect(reads.length).toBe(1);
    expect(reads[0].headers()["x-admin-token"]).toBe(TOKEN);
  });

// ───────────────────────────────────── on a phone, with a finger ─────

test("on a phone the chip is in the rail's own row, in view, and every "
  + "control still answers at the touch floor", async ({ browser }) => {
    test.setTimeout(90_000);
    const phone: Record<string, unknown> = { ...devices["iPhone 13"] };
    delete phone.defaultBrowserType;
    const ctx = await browser.newContext({ ...phone, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await serveStatus(page);
    await routeEight(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await armToken(page);
    const chip = page.getByTestId("trading-chip");
    await expect(chip).toBeVisible();

    const where = async () => page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>("header.topbar")!;
      const nav = bar.querySelector<HTMLElement>('[data-testid="topbar-right"] nav')!;
      const logo = bar.querySelector<HTMLElement>('[data-testid="home-logo"]')!;
      const chip = bar.querySelector<HTMLElement>('[data-testid="trading-chip"]')!;
      const nb = nav.getBoundingClientRect();
      const cb = chip.getBoundingClientRect();
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;height:var(--topbar-h)";
      bar.appendChild(probe);
      const th = probe.getBoundingClientRect().height;
      probe.remove();
      return {
        rail: bar.getAttribute("data-rail"),
        navTop: nb.top, logoBottom: logo.getBoundingClientRect().bottom,
        inRail: cb.left >= nb.left - 1 && cb.right <= nb.right + 1,
        inView: cb.left >= 0 && cb.right <= innerWidth,
        barH: bar.getBoundingClientRect().height, th,
        doc: document.documentElement.scrollWidth, vw: innerWidth,
      };
    });
    const floor = async (label: string) => {
      const a = await auditFloor(page);
      expect(a.examples, `${label}: controls under the floor`).toEqual([]);
      expect(a.small, label).toBe(0);
      expect(a.pressFail, label).toBe(0);
      expect(a.thefts, label).toEqual([]);
      expect(a.repositioned, label).toEqual([]);
      expect(a.doc, `${label}: no sideways scroll`).toBeLessThanOrEqual(a.vw + 1);
    };

    // the board: its rail was a row already, and the chip leads it. The
    // watch panel is shut again first — the route walk audits the board
    // with it shut, and this test is about the bar, not the panel.
    await page.getByTestId("watch-panel").locator("summary").click();
    let m = await where();
    expect(m.rail).toBe("row");
    expect(m.navTop).toBeGreaterThanOrEqual(m.logoBottom - 4);
    expect(m.inRail && m.inView, "the chip is in the rail, in view").toBe(true);
    expect(m.doc).toBeLessThanOrEqual(m.vw + 1);
    await floor("board");

    // the console, reached by the chip
    await chip.click();
    await expect(page).toHaveURL(/\/ops\/trading$/);
    await expect(page.getByTestId("ops-console")).toBeVisible();
    m = await where();
    expect(m.rail).toBe("row");
    expect(m.navTop).toBeGreaterThanOrEqual(m.logoBottom - 4);
    expect(m.inRail && m.inView).toBe(true);
    expect(m.th, "--topbar-h is the bar's height").toBeCloseTo(m.barH, 0);
    await floor("console");

    // home: one short chip that fit beside the logo, plus this one, does
    // not — so the rail takes the row under the bar and the parking height
    // follows it
    await page.getByTestId("home-logo").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("landing")).toBeVisible();
    await expect(chip).toBeVisible();
    m = await where();
    expect(m.rail).toBe("row");
    expect(m.navTop).toBeGreaterThanOrEqual(m.logoBottom - 4);
    expect(m.inRail && m.inView).toBe(true);
    expect(m.th).toBeCloseTo(m.barH, 0);
    await floor("home");
    await ctx.close();
  });

test("at a desktop width the chip is the first thing in the board's rail, "
  + "in view", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await boardWithToken(page);
    const m = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>(
        'header.topbar [data-testid="topbar-right"] nav')!;
      const chip = nav.querySelector<HTMLElement>('[data-testid="trading-chip"]')!;
      const nb = nav.getBoundingClientRect();
      const cb = chip.getBoundingClientRect();
      return {
        first: nav.firstElementChild === chip,
        inView: cb.left >= nb.left - 1 && cb.right <= nb.right + 1,
        doc: document.documentElement.scrollWidth, vw: innerWidth,
      };
    });
    expect(m.first).toBe(true);
    expect(m.inView).toBe(true);
    expect(m.doc).toBeLessThanOrEqual(m.vw + 1);
  });

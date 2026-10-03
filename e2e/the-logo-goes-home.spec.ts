import { test, expect } from "@playwright/test";
import { routeEight } from "./eight-columns";
import { pageRoutes, PAGE_COUNT } from "./page-routes";

/* THE LOGO IN THE MIDDLE OF EVERY BAR GOES HOME (Son, 2026-10-03:
   "put the Logo in the middle of the header bar to go back to landing
   page").

   It lives in the shared TopBar (components/chrome.tsx), so the claim is
   about every page, and the page set is the pages directory's own
   (`pageRoutes`) rather than a list typed here. Per page, at a phone and
   a desktop width, MEASURED rather than read off the markup:
     - one logo, a link to "/", named "TRIVELA home";
     - on the bar's own centre line (the grid keeps both side tracks
       equal, so anything else is a regression);
     - a 44px box, answered by a press at its centre;
     - and nothing in the left cluster or the chip rail reaches into it.
   Hermetic: every read on these pages fails against the stand-in, which
   is the state the chrome must survive anyway. */

const routes = pageRoutes();

test("the walk covers every page", () => {
  expect(routes.length).toBe(PAGE_COUNT);
});

for (const width of [390, 1440]) {
  test(`every page's bar has the logo, centred and clear, at ${width}px`,
    async ({ page }) => {
      const NAV_MS = 6_000;
      test.setTimeout(NAV_MS * routes.length * 1.5);
      await page.setViewportSize({ width, height: 900 });
      // the walk passes through the board: serve it from the recording,
      // never as an assembly (e2e/the-board-writes-nothing.spec.ts)
      await routeEight(page);
      const findings: string[] = [];
      for (const { url } of routes) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_MS });
        const logo = page.getByTestId("home-logo");
        await expect(logo, `no logo on ${url}`).toHaveCount(1);
        await expect(logo).toHaveAttribute("href", "/");
        await expect(logo).toHaveAccessibleName("TRIVELA home");
        const m = await page.evaluate(() => {
          const row = document.querySelector("header.topbar")!
            .firstElementChild as HTMLElement;
          const logo = document.querySelector(
            '[data-testid="home-logo"]') as HTMLElement;
          const left = document.querySelector(
            '[data-testid="topbar-left"]') as HTMLElement;
          const nav = document.querySelector(
            '[data-testid="topbar-right"] nav') as HTMLElement | null;
          const rb = row.getBoundingClientRect();
          const cs = getComputedStyle(row);
          const mid = (rb.left + parseFloat(cs.paddingLeft)
            + rb.right - parseFloat(cs.paddingRight)) / 2;
          const lb = logo.getBoundingClientRect();
          let reach = -Infinity;
          left.querySelectorAll<HTMLElement>("*").forEach((e) => {
            const b = e.getBoundingClientRect();
            if (b.width && b.height && e.checkVisibility()) {
              reach = Math.max(reach, b.right);
            }
          });
          const hit = document.elementFromPoint(lb.left + lb.width / 2,
            lb.top + lb.height / 2);
          return {
            off: lb.left + lb.width / 2 - mid, w: lb.width, h: lb.height,
            l: lb.left, r: lb.right, reach,
            navL: nav ? nav.getBoundingClientRect().left : null,
            pressed: !!hit && logo.contains(hit),
          };
        });
        if (Math.abs(m.off) > 1) findings.push(`${url}: off-centre ${m.off.toFixed(1)}px`);
        if (m.w < 44 || m.h < 44) findings.push(`${url}: logo ${m.w}x${m.h}`);
        if (!m.pressed) findings.push(`${url}: a press at its centre lands elsewhere`);
        if (m.reach > m.l - 2) findings.push(`${url}: the left cluster reaches under it`);
        if (m.navL !== null && m.navL < m.r + 2) findings.push(`${url}: the chip rail reaches under it`);
      }
      expect(findings, findings.join("\n")).toEqual([]);
    });
}

test("it goes home — from a page deep in the app to the landing page",
  async ({ page }) => {
    await page.goto("/bet-suggester/ratings");
    await page.getByTestId("home-logo").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("landing")).toBeVisible();
    // and on the landing page itself it says so
    await expect(page.getByTestId("home-logo"))
      .toHaveAttribute("aria-current", "page");
  });

test("the mark is the brand's gold on a page that re-themes its accent",
  async ({ page }) => {
    /* Nine pages set --accent to their league's colour; the mark reads
       --brand, so it stays gold on La Liga's red page too. */
    await page.goto("/bet-suggester/laliga/761439");
    const fill = await page.getByTestId("home-logo").locator("circle")
      .evaluate((c) => getComputedStyle(c).fill);
    expect(fill).toBe("rgb(245, 197, 66)");
  });

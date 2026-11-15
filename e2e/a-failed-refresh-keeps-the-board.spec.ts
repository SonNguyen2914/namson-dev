/** A FAILED REFRESH KEEPS THE BOARD (audit C-19, 2026-11-15).
 *
 *  Visitors saw 503s that afternoon while a cold club board was rebuilt.
 *  Two halves, each held here:
 *
 *  1. THE PROXY lets Vercel's CDN hold a 200 from the four public,
 *     undated board/review reads (`s-maxage=60, stale-while-revalidate=
 *     600`) — and never an error, a dated read, a request carrying a
 *     cookie or a token, or any other route.
 *  2. THE PAGE keeps the board it already shows when a re-read of the
 *     SAME question fails retryably, says so with the time it was built,
 *     and asks again on a backoff; with no board yet it shows a bounded
 *     retrying state before the red card.
 *
 *  HERMETIC. The proxy half goes through the app's REAL proxy to the
 *  stand-in (`__standin_delay_ms=0` is its 200; anything else is its
 *  named 503). The page half serves recorded payloads with page.route
 *  and drives the clock. */
import { test, expect, type Page } from "@playwright/test";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";

const EDGE = "public, s-maxage=60, stale-while-revalidate=600";

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
const UNAVAILABLE = json({ detail: "picker board unavailable" }, 503);

// ------------------------------------------------------- the proxy

test.describe("the edge may hold a public board read", () => {
  for (const path of ["/api/picker/review?back=8",
                      "/api/championships/board?days=8",
                      "/api/championships/review?back=8"]) {
    test(`a 200 on ${path} carries a short s-maxage with stale-while-revalidate`,
      async ({ request }) => {
        const r = await request.get(`${path}&__standin_delay_ms=0`);
        expect(r.status(), await r.text()).toBe(200);
        expect(r.headers()["cache-control"]).toBe(EDGE);
      });
  }

  test("an error is never held", async ({ request }) => {
    // the stand-in's default answer is a named 503
    const r = await request.get("/api/championships/board?days=8");
    expect(r.status()).toBe(503);
    expect(r.headers()["cache-control"] ?? "").not.toMatch(/s-maxage/);
  });

  test("a dated read, a cookie, a token or another route is never held",
    async ({ request }) => {
      const cases: Array<[string, Record<string, string>]> = [
        ["/api/championships/board?days=8&date=20261115", {}],
        ["/api/championships/board?days=8", { cookie: "a=b" }],
        ["/api/championships/board?days=8", { authorization: "Bearer x" }],
        ["/api/championships/board?days=8", { "x-admin-token": "x" }],
        ["/api/mls/scoreboard?x=1", {}],
      ];
      for (const [path, headers] of cases) {
        const r = await request.get(`${path}&__standin_delay_ms=0`, { headers });
        expect(r.status(), path).toBe(200);
        expect(r.headers()["cache-control"] ?? "", `${path} ${JSON.stringify(headers)}`)
          .not.toMatch(/s-maxage/);
      }
    });
});

// ------------------------------------------------------- the page

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

test("first load: a 503 shows a retrying state, then the board — no red card",
  async ({ page }) => {
    await watchForErrorCard(page);
    await page.clock.install({ time: new Date(CHAMP_CLOCK) });
    await page.route("**/api/picker/**", (r) => r.fulfill(UNAVAILABLE));
    await page.addInitScript(() => {
      try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
    });
    let asked = 0;
    await page.route("**/api/championships/board**", (r) => {
      asked += 1;
      return r.fulfill(asked === 1 ? UNAVAILABLE : json(CHAMP_BOARD));
    });
    await page.goto("/trivela");
    const retrying = page.getByTestId("board-retrying");
    await expect(retrying).toBeVisible();
    await expect(retrying).toContainText("asking again in 15s");
    await expect(page.getByTestId("board-error")).toHaveCount(0);
    await page.clock.fastForward(16_000);
    await page.locator('[data-testid="league-col"]').first().waitFor();
    await expect(retrying).toHaveCount(0);
    expect(asked).toBe(2);
    expect(await errorCardSeen(page)).toBe(false);
  });

test("a failed re-read keeps the board on screen, says so, and asks again",
  async ({ page }) => {
    await watchForErrorCard(page);
    await page.clock.install({ time: new Date("2026-09-15T12:00:00Z") });
    // A NARROWED payload on /trivela is the one state whose own button
    // re-reads the SAME question while a board is on screen.
    const narrowed = { ...BOARD_EIGHT, narrowed_to: ["ucl"] };
    let asked = 0;
    let reviews = 0;
    await page.route("**/api/picker/board**", (r) => {
      asked += 1;
      return r.fulfill(asked === 1 ? json(narrowed)
        : asked === 2 ? UNAVAILABLE : json(BOARD_EIGHT));
    });
    await page.route("**/api/picker/review**", (r) => {
      reviews += 1;
      return r.fulfill(reviews === 2 ? UNAVAILABLE : json(REVIEW_EIGHT));
    });
    await page.goto("/trivela");
    const held = page.getByTestId("board-not-a-declaration");
    await expect(held).toBeVisible();
    await held.getByRole("button", { name: "ask again" }).click();

    const stale = page.getByTestId("board-stale");
    await expect(stale).toBeVisible();
    await expect(stale).toContainText("couldn't refresh — showing data from");
    await expect(page.getByTestId("review-stale")).toBeVisible();
    // the last good board is still the one on screen, and no red card
    await expect(held).toBeVisible();
    expect(asked).toBe(2);
    expect(await errorCardSeen(page)).toBe(false);

    await page.clock.fastForward(16_000);
    await page.locator('[data-testid="league-col"]').first().waitFor();
    await expect(stale).toHaveCount(0);
    await expect(page.getByTestId("review-stale")).toHaveCount(0);
    expect(asked).toBe(3);
    expect(await errorCardSeen(page)).toBe(false);
  });

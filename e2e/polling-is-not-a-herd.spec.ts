import { test, expect, type Page } from "@playwright/test";
import { routeEight } from "./eight-columns";
import { nextDelay, MAX_BACKOFF_MS } from "../src/lib/usePoll";

// POLLING IS NOT A HERD (2026-09-25, audit F4 + F5).
//
// The production backend hung twice that day: its 40-thread worker pool
// filled during a provider rate-limit storm, and the frontend's own
// pollers were built to make a stall worse. Every tab asked the
// operator-only watched strip every 15s for a certain 403; no poller
// paused in a hidden tab; none but one refused to stack a request on one
// still in flight; none backed off after a failure; and `proxy()` waited
// on a hung backend for as long as the platform let it.
//
// Each claim below is made against the built app with the clock driven,
// and each one counts requests rather than reading a flag.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

/** Make the page believe its tab is hidden (or visible again), the way a
 *  browser does: the property changes and the event fires. */
async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((h) => {
    Object.defineProperty(document, "visibilityState",
      { configurable: true, get: () => (h ? "hidden" : "visible") });
    Object.defineProperty(document, "hidden",
      { configurable: true, get: () => h });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

// ------------------------------------------------------------ the rule

test("the backoff rule: the cadence after one failure, then doubling with "
  + "jitter, never past the cap", () => {
    expect(nextDelay(60_000, 0)).toBe(60_000);
    expect(nextDelay(60_000, 1)).toBe(60_000);
    // jitter is "equal jitter": between half the backoff and all of it
    expect(nextDelay(60_000, 2, () => 0)).toBe(60_000);
    expect(nextDelay(60_000, 2, () => 1)).toBe(120_000);
    expect(nextDelay(60_000, 3, () => 1)).toBe(240_000);
    // …and it stops growing at the cap, whatever the failure count
    expect(nextDelay(60_000, 30, () => 1)).toBe(MAX_BACKOFF_MS);
    expect(nextDelay(15_000, 30, () => 0)).toBe(MAX_BACKOFF_MS / 2);
  });

// ------------------------------------------------- F4: the watched strip

test("an anonymous tab never asks for the operator-only watched strip",
  async ({ page }) => {
    let asked = 0;
    await page.route("**/api/bet-suggester/watched-strip**", (r) => {
      asked += 1;
      return r.fulfill(json({ detail: "operator only" }, 403));
    });
    await page.clock.install();
    await routeEight(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    // four 15s cadences, and then some: the old feed asked 5+ times here
    await page.clock.runFor(70_000);
    expect(asked, "an anonymous tab asked for a route that can only answer "
      + "it 403").toBe(0);
  });

test("with the operator token the strip is read — and not while the tab is "
  + "hidden", async ({ page }) => {
    let asked = 0;
    await page.route("**/api/bet-suggester/watched-strip**", (r) => {
      asked += 1;
      return r.fulfill(json({ detail: "operator token refused" }, 403));
    });
    await page.route("**/api/bet-suggester/live-watchlist**",
      (r) => r.fulfill(json({ detail: "operator token refused" }, 403)));
    await page.clock.install();
    await routeEight(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    expect(asked).toBe(0);

    await page.getByTestId("watch-panel").locator("summary").click();
    await page.locator("#watch-token").fill("an-operator-token");
    // non-vacuity: the token is what starts the read
    await expect.poll(() => asked).toBeGreaterThan(0);

    await setHidden(page, true);
    await page.clock.runFor(5_000);      // let any read in flight settle
    const whileHidden = asked;
    await page.clock.runFor(120_000);
    expect(asked, "a hidden tab kept polling the strip").toBe(whileHidden);

    // and the read that fell due while hidden is made on return
    await setHidden(page, false);
    await expect.poll(() => asked).toBeGreaterThan(whileHidden);
  });

// ---------------------------------------------- F5: every other poller

test("a failing read backs off instead of retrying at full cadence",
  async ({ page }) => {
    let asked = 0;
    await page.route("**/api/hunter/findings**", (r) => {
      asked += 1;
      return r.fulfill(json({ detail: "the scanner is down" }, 503));
    });
    await page.clock.install();
    await page.goto("/bet-suggester/hunter");
    await expect.poll(() => asked).toBe(1);
    // ten minutes at a 60s cadence was eleven reads; with the backoff
    // (60s, 60s, 60-120s, 120-240s, 240-300s…) it is at most six
    for (let i = 0; i < 20; i += 1) await page.clock.runFor(30_000);
    expect(asked).toBeGreaterThan(1);
    expect(asked, "a 503 was retried at full cadence").toBeLessThanOrEqual(6);
  });

test("a read still in flight is never stacked on, and a hidden tab does "
  + "not read at all", async ({ page }) => {
    let asked = 0;
    // the first answer is withheld: the backend has hung
    const hung: Array<() => void> = [];
    await page.route("**/api/hunter/findings**", (r) => {
      asked += 1;
      if (asked === 1) {
        hung.push(() => { void r.fulfill(json({ ready: false, reason: "x" })); });
        return;
      }
      return r.fulfill(json({ ready: false, reason: "dormant" }));
    });
    await page.clock.install();
    await page.goto("/bet-suggester/hunter");
    await expect.poll(() => asked).toBe(1);
    // five cadences while the first read hangs: the old setInterval asked
    // five more times on top of it
    await page.clock.runFor(300_000);
    expect(asked, "a new read was stacked on one still in flight").toBe(1);

    // it answers; the chain resumes
    hung[0]();
    await page.clock.runFor(61_000);
    await expect.poll(() => asked).toBe(2);

    // hidden: nothing, however long
    await setHidden(page, true);
    await page.clock.runFor(600_000);
    expect(asked, "a hidden tab kept polling").toBe(2);
    await setHidden(page, false);
    await expect.poll(() => asked).toBe(3);
  });

// ------------------------------------------------ F5: the proxy's clock

test("a backend that hangs is a named 504 in JSON after 15s, never an HTML "
  + "page and never an endless wait", async ({ request }) => {
    test.setTimeout(45_000);
    // `__standin_hang` makes the stand-in backend accept the request and
    // never answer. The league proxies forward the query string verbatim,
    // so it arrives.
    const started = Date.now();
    const r = await request.get("/api/mls/scoreboard?__standin_hang=1",
      { timeout: 30_000 });
    const took = Date.now() - started;
    expect(r.status()).toBe(504);
    expect(r.headers()["content-type"]).toContain("application/json");
    const body = await r.json();
    expect(body.reason).toBe("backend_timeout");
    expect(body.detail).toMatch(/did not answer within 15s/);
    expect(took).toBeGreaterThanOrEqual(14_000);
    expect(took).toBeLessThan(25_000);
  });

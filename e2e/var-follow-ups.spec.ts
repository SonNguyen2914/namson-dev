import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, serveEight } from "./eight-columns";
import { analystOn, json } from "./analyst-fixtures";
import { hydrated, view } from "./operator-console";
import { qaBook, qaCandidates, qaLedger, qaStatusWithCareful } from "./console-fixtures";
import { errorStats, noteError, resetErrors } from "../src/lib/analyst/health";

/* TRIVELA VAR FOLLOW-UPS (C7, 2026-10-25).
 *
 *   1. "ASK VAR" ON THE BOARD CARD — the four VAR leagues only (epl,
 *      laliga, mls, ligamx), only while VAR is on, linking to
 *      /bet-suggester/var?league=&id= for that card's own event. The
 *      switch is the one /api/analyst/status read the top bar already
 *      makes, so the board sends it once, however many cards carry it.
 *   2. VAR HEALTH IN THE OPS VIEW — budget, cache hits/misses and errors
 *      from /api/analyst/status, in the console's System view.
 *
 * Hermetic: the recorded eight-column board and the console's QA
 * payloads; the status is served here. */

const VAR_LEAGUES = new Set(["epl", "laliga", "mls", "ligamx"]);
const rows = (BOARD_EIGHT as unknown as { rows: { league: string; event_id: string }[] }).rows;

test.describe("the Ask VAR chip on the board", () => {
  test("on: every card in a VAR league links to its own match on /bet-suggester/var, and no other card has one",
    async ({ page }) => {
      let reads = 0;
      await page.route("**/api/analyst/status", (r) => {
        reads += 1;
        return r.fulfill(json({ enabled: true, leagues: [...VAR_LEAGUES] }));
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await serveEight(page);
      const cards = page.getByTestId("picker-row");
      await expect(page.getByTestId("ask-var-chip").first()).toBeVisible();
      const n = await cards.count();
      expect(n).toBeGreaterThan(0);
      let withChip = 0;
      for (let i = 0; i < n; i += 1) {
        const c = cards.nth(i);
        const league = (await c.getAttribute("data-league"))!;
        const id = (await c.getAttribute("data-event"))!;
        const chip = c.getByTestId("ask-var-chip");
        if (VAR_LEAGUES.has(league)) {
          await expect(chip, `${league} ${id}`).toHaveCount(1);
          await expect(chip).toHaveAttribute("href", `/bet-suggester/var?league=${league}&id=${id}`);
          await expect(chip).toHaveText(/ask VAR/i);
          withChip += 1;
        } else {
          await expect(chip, `${league} ${id}`).toHaveCount(0);
        }
      }
      // the recording holds rows from both kinds of league
      expect(withChip).toBeGreaterThan(0);
      expect(withChip).toBeLessThan(n);
      expect(rows.some((r) => !VAR_LEAGUES.has(r.league))).toBe(true);
      // one status read for the whole page — the top bar's and every card's
      expect(reads).toBe(1);
      // the chip sits in the footer beside the model box, not on the top row
      const epl = cards.locator(":scope", { has: page.getByTestId("ask-var-chip") }).first();
      await expect(epl.getByTestId("watch-line").getByTestId("ask-var-chip")).toHaveCount(1);
    });

  test("off: no card carries the chip", async ({ page }) => {
    await analystOn(page, false);
    await serveEight(page);
    await expect(page.getByTestId("picker-row").first()).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.getByTestId("ask-var-chip")).toHaveCount(0);
  });
});

// ------------------------------------------------------------ ops view

const TOKEN = "var-health-token-typed-by-a-person";
const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

async function console_(page: Page, status: unknown) {
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(ok(qaStatusWithCareful())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(ok(qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(ok(qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(ok(qaLedger())));
  await page.route("**/api/analyst/status", (r) => r.fulfill(ok(status)));
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
  await view(page, "#system");
  return page.getByTestId("ops-var");
}

test.describe("VAR health in the console's System view", () => {
  test("on: budget used, cache hits and misses, errors and the last one", async ({ page }) => {
    const p = await console_(page, {
      enabled: true, leagues: [...VAR_LEAGUES],
      budget: { day: "2026-10-25", calls: 42, cap: 300 },
      cache: { hits: 30, misses: 10, size: 9 },
      errors: { day: "2026-10-25", total: 3, load: 1, preview: 2, ask: 0,
        last: { at: "2026-10-25T08:00:00Z", kind: "preview", why: "the language model did not answer (Claude API 529)" } },
    });
    await expect(p).toBeVisible();
    await expect(p.getByTestId("var-budget")).toContainText("42 / 300");
    await expect(p.getByTestId("var-cache-hits")).toContainText("30");
    await expect(p.getByTestId("var-cache-misses")).toContainText("10");
    await expect(p.getByTestId("var-errors")).toContainText("3");
    await expect(p.getByTestId("var-last-error")).toContainText("Claude API 529");
  });

  test("off: says VAR is switched off rather than drawing zeros", async ({ page }) => {
    const p = await console_(page, { enabled: false });
    await expect(p.getByTestId("var-health-off")).toContainText("switched off");
    await expect(p.getByTestId("var-budget")).toHaveCount(0);
  });
});

test("the error counter counts by kind, keeps the last one and rolls over at UTC midnight", () => {
  resetErrors();
  const d1 = new Date("2026-10-25T10:00:00Z");
  noteError("load", "the backend answered 503", d1);
  noteError("preview", "the language model did not answer", d1);
  const s = errorStats(d1);
  expect([s.total, s.load, s.preview, s.ask]).toEqual([2, 1, 1, 0]);
  expect(s.last).toMatchObject({ kind: "preview" });
  const next = errorStats(new Date("2026-10-26T00:00:01Z"));
  expect(next.total).toBe(0);
  // the most recent error stays visible across the day boundary
  expect(next.last).toMatchObject({ kind: "preview" });
  resetErrors();
});

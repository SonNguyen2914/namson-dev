import { expect, test, type Page } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import {
  qaBook, qaCandidates, qaLedger, qaStatusWarning, qaStatusWithCareful,
} from "./console-fixtures";

// EVERY SECTION FOLDS (Son, 2026-10-07: "sometimes I don't need all of
// that info"). What a fold promises, each checked here, hermetic:
//
//   - the header row is the click target; the title is a real disclosure
//     button (aria-expanded / aria-controls) that Enter and Space work;
//   - a folded header keeps a one-line summary of the key figures, and
//     every amber / red state inside it, with its word and shape;
//   - the fold is the viewer's, remembered across a reload (localStorage),
//     and a store that throws only means "all expanded";
//   - a folded section whose amber/red state CHANGES unfolds itself; folded
//     again under the same state, it stays folded;
//   - the unfolded Safety & control panel never folds while its alarm
//     holds, not even under "Collapse all", and the lift stays on screen;
//   - folding re-reads nothing and keeps filters, sort and the inspector.

const TOKEN = "ops-collapse-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

interface Opts { hash?: string; fakeClock?: boolean }
async function open(page: Page, status: () => unknown, o: Opts = {}) {
  const reads = { status: 0, book: 0, cand: 0, ledger: 0 };
  await page.route("**/api/ops/trading-status", (r) => { reads.status += 1; return r.fulfill(json(200, status())); });
  await page.route("**/api/ops/trading-book", (r) => { reads.book += 1; return r.fulfill(json(200, qaBook())); });
  await page.route("**/api/ops/trading-candidates", (r) => { reads.cand += 1; return r.fulfill(json(200, qaCandidates())); });
  await page.route("**/api/ops/trading-ledger**", (r) => { reads.ledger += 1; return r.fulfill(json(200, qaLedger())); });
  await page.goto(`/ops/trading${o.hash ?? ""}`);
  await token(page, o.fakeClock);
  return reads;
}
async function token(page: Page, fakeClock = false) {
  await hydrated(page, fakeClock);
  await page.locator("#watch-token").fill(TOKEN);
  if (fakeClock) {
    await expect.poll(async () => {
      await page.clock.runFor(700);
      return page.getByTestId("ops-console").count();
    }).toBeGreaterThan(0);
  }
  await expect(page.getByTestId("ops-console")).toBeVisible();
}
const section = (page: Page, testid: string) => page.getByTestId(testid);
const toggle = (page: Page, testid: string) => section(page, testid).getByTestId("panel-toggle").first();
const summary = (page: Page, testid: string) => section(page, testid).getByTestId("panel-summary");

test.describe("every section folds to a header that still says what matters", () => {
  test("a fold hides the body, keeps a summary, and outlives a reload", async ({ page }) => {
    const reads = await open(page, () => qaStatusWithCareful());
    const cap = section(page, "ops-money");
    const btn = toggle(page, "ops-money");
    await expect(cap).toHaveAttribute("data-collapsed", "false");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    const body = page.locator(`[id="${await btn.getAttribute("aria-controls")}"]`);
    await expect(body).toBeVisible();
    await expect.poll(() => reads.ledger).toBe(1);
    const before = { ...reads };

    await btn.click();
    await expect(cap).toHaveAttribute("data-collapsed", "true");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(body).toBeHidden();
    // the summary: its key figures in one line
    const s = summary(page, "ops-money");
    await expect(s).toBeVisible();
    for (const t of ["equity $49.37", "today −$0.63", "budget 31%", "daily loss 3%", "drawdown 13%"]) {
      await expect(s, t).toContainText(t);
    }
    // a normal day: nothing in it is toned
    await expect(s.locator("[data-tone]")).toHaveCount(0);
    // folding read nothing again
    expect({ book: reads.book, cand: reads.cand, ledger: reads.ledger })
      .toEqual({ book: before.book, cand: before.cand, ledger: before.ledger });

    // the viewer's: a reload (which forgets the token) keeps the fold
    await page.reload();
    await token(page);
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "true");
    await expect(summary(page, "ops-money")).toContainText("equity $49.37");
    // the WHOLE header row is the click target, not just the title
    await section(page, "ops-money").locator("header").click({ position: { x: 600, y: 12 } });
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "false");
  });

  test("Enter and Space work the toggle; aria-controls names the body", async ({ page }) => {
    await open(page, () => qaStatusWithCareful());
    const btn = toggle(page, "ops-perf-snapshot");
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(section(page, "ops-perf-snapshot")).toHaveAttribute("data-collapsed", "true");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(summary(page, "ops-perf-snapshot")).toContainText("settled −$1.02");
    await page.keyboard.press("Space");
    await expect(section(page, "ops-perf-snapshot")).toHaveAttribute("data-collapsed", "false");
    await expect(btn).toBeFocused();
  });

  test("a folded section carries its amber and red states, word and shape", async ({ page }) => {
    await open(page, () => qaStatusWarning());
    await toggle(page, "ops-money").click();
    const s = summary(page, "ops-money");
    const red = s.locator('[data-tone="bad"]');
    await expect(red.filter({ hasText: "daily loss 82%" })).toContainText("■");
    await expect(red.filter({ hasText: "drawdown 84%" })).toHaveCount(1);
    await expect(red.filter({ hasText: /budget 9\d%/ })).toHaveCount(1);
    // folded under that alarm, it stays folded — the operator saw it
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "true");
    await toggle(page, "ops-attention").click();
    await expect(summary(page, "ops-attention").locator('[data-tone="bad"]')).toContainText("1 critical");
    await expect(summary(page, "ops-attention").locator('[data-tone="warn"]')).toContainText("◆");
  });

  test("a folded section whose state turns red unfolds itself; folded again it stays", async ({ page }) => {
    await page.clock.install();
    let warning = false;
    await open(page, () => (warning ? qaStatusWarning() : qaStatusWithCareful()), { fakeClock: true });
    await toggle(page, "ops-money").click();
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "true");
    // the next status read carries a daily loss at 82 %
    warning = true;
    await page.clock.runFor(16_000);
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "false");
    await expect(section(page, "ops-money").getByTestId("meter-daily")).toContainText("near limit");
    // the operator folds it again, under the same alarm: it stays folded
    await toggle(page, "ops-money").click();
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "true");
    await page.clock.runFor(16_000);
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "true");
    await expect(summary(page, "ops-money").locator('[data-tone="bad"]').first()).toBeVisible();
  });

  test("Safety & control never folds while its alarm holds, even under Collapse all", async ({ page }) => {
    await open(page, () => qaStatusWarning());
    const safety = section(page, "ops-safety");
    const btn = safety.getByTestId("panel-toggle");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(btn).toHaveAttribute("aria-disabled", "true");
    // aria-disabled: a click is refused as a disabled control's would be
    await btn.click({ force: true });
    await safety.locator("header").click({ position: { x: 400, y: 12 } });
    await page.getByTestId("collapse-all").click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(safety.getByTestId("safety-kill")).toBeVisible();
    await expect(safety.getByRole("button", { name: "Lift operator kill" })).toBeVisible();
    // …while everything else folded
    for (const t of ["ops-money", "ops-tick", "ops-book-snapshot", "ops-perf-snapshot"]) {
      await expect(section(page, t), t).toHaveAttribute("data-collapsed", "true");
    }
    // the status rail is never foldable
    await expect(page.getByTestId("ops-strip").getByTestId("panel-toggle")).toHaveCount(0);
    await page.getByTestId("expand-all").click();
    await expect(section(page, "ops-money")).toHaveAttribute("data-collapsed", "false");
  });

  test("folding the candidates keeps the filters, the sort and the inspector", async ({ page }) => {
    const reads = await open(page, () => qaStatusWithCareful(), { hash: "#trading?decision=skipped" });
    await expect(page.locator('[data-testid="cand-decision"][data-decision="skipped"]')).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("cand-sort-edge").click();
    await page.getByTestId("cand-row").first().click();
    await expect(page.getByTestId("cand-inspector")).toBeVisible();
    const ticker = await page.getByTestId("cand-inspector").getAttribute("data-ticker");
    await page.keyboard.press("Escape");
    const order = await page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker")));
    const cand = reads.cand;

    await toggle(page, "ops-why").click();
    await expect(summary(page, "ops-why")).toContainText("top: no edge");
    await toggle(page, "ops-candidates").click();
    await expect(summary(page, "ops-candidates")).toContainText("1 filter");
    await toggle(page, "ops-candidates").click();
    await expect(page.locator('[data-testid="cand-decision"][data-decision="skipped"]')).toHaveAttribute("aria-pressed", "true");
    expect(await page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker")))).toEqual(order);
    await page.locator(`[data-testid="cand-row"][data-ticker="${ticker}"]`).click();
    await expect(page.getByTestId("cand-inspector")).toHaveAttribute("data-ticker", ticker!);
    expect(reads.cand).toBe(cand);
    // the In play tab's sections fold under their own keys
    await view(page, "#trading?tab=inplay");
    await expect(page.getByTestId("ops-inplay").locator('[data-collapsed="true"]')).toHaveCount(0);
  });

  test("a store that throws leaves everything expanded, and a fold still works", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("blocked"); };
      Storage.prototype.setItem = () => { throw new Error("blocked"); };
    });
    await open(page, () => qaStatusWithCareful());
    await expect(page.locator('[data-collapsed="true"]')).toHaveCount(0);
    await toggle(page, "ops-tick").click();
    await expect(section(page, "ops-tick")).toHaveAttribute("data-collapsed", "true");
    await expect(summary(page, "ops-tick")).toContainText("3 placed");
  });
});

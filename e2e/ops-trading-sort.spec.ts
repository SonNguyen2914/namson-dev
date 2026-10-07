import { expect, test, type Locator, type Page } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import {
  qaBook, qaCandidates, qaLedger, qaStatusWithCareful,
} from "./console-fixtures";

// EVERY TABLE SORTS, ONE WAY (Son, 2026-10-07: "the console trade board
// need to be sortable"). What the rule promises, checked on the recorded
// and QA payloads, hermetic:
//
//   - a header is a button: press → sorted, again → reversed, a third time
//     → the backend's order; Enter and Space work it; `aria-sort` sits on
//     the active header only;
//   - rows sort by VALUE (money as numbers, times as timestamps), and a
//     missing value ("—", unsettled, not sent) is last in BOTH directions;
//     ties keep the backend's order;
//   - the sort survives a poll, a view switch and a fold, and a reload
//     (per table, per viewer); the ledger says when it sorts only the rows
//     loaded; the CSV follows the sort.

const TOKEN = "ops-sort-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function open(page: Page, o: { hash?: string; ledger?: unknown; fakeClock?: boolean } = {}) {
  const reads = { ledger: 0 };
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, qaStatusWithCareful())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(200, qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(200, qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => { reads.ledger += 1; return r.fulfill(json(200, o.ledger ?? qaLedger())); });
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

/** "−$1.52" → -1.52; "$0.00 · not filled" → 0; words with no money → null */
const money = (t: string): number | null => {
  const m = /([−+-]?)\$([\d,]+(?:\.\d+)?)/.exec(t);
  if (!m) return null;
  return (m[1] === "−" || m[1] === "-" ? -1 : 1) * Number(m[2].replace(/,/g, ""));
};
const pct = (t: string): number | null => {
  const m = /(-?[\d.]+)%/.exec(t);
  return m ? Number(m[1]) : null;
};
const int = (t: string): number | null => {
  const m = /^\s*([\d,]+)\s*$/.exec(t);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

/** sorted by value, nulls last in either direction */
function expectSorted(vals: (number | string | null)[], dir: "asc" | "desc", what: string) {
  const firstNull = vals.findIndex((v) => v === null);
  if (firstNull >= 0) expect(vals.slice(firstNull).every((v) => v === null), `${what}: missing values are last`).toBe(true);
  const present = vals.filter((v): v is number | string => v !== null);
  for (let i = 1; i < present.length; i++) {
    const a = present[i - 1], b = present[i];
    const c = typeof a === "number" && typeof b === "number" ? a - b
      : String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
    expect(dir === "asc" ? c <= 0 : c >= 0, `${what}: ${JSON.stringify(present)} is ${dir}`).toBe(true);
  }
  expect(present.length, `${what}: something to sort`).toBeGreaterThan(1);
}
const ariaOf = (btn: Locator) => btn.locator("xpath=ancestor::th[1]");

test.describe("every console table sorts the same way", () => {
  test("the ledger: P&L (money), time and market; missing last; third press is the backend's order", async ({ page }) => {
    await open(page, { hash: "#trades" });
    const rows = page.getByTestId("ledger-row");
    await expect(rows.first()).toBeVisible();
    const ids = () => rows.evaluateAll((els) => els.map((e) => e.getAttribute("data-row-id")));
    const sent = await ids();

    const pnl = page.getByTestId("ledger-sort-pnl");
    const pnls = async () => (await page.getByTestId("ledger-pnl").allTextContents()).map(money);
    await pnl.click();
    await expect(ariaOf(pnl)).toHaveAttribute("aria-sort", "descending");
    await expect(pnl).toContainText("▼");
    expectSorted(await pnls(), "desc", "P&L desc");
    // unsettled is NOT a zero: it sits below every settled loss
    const texts = await page.getByTestId("ledger-pnl").allTextContents();
    expect(texts[texts.length - 1]).toMatch(/unsettled|unknown|not recorded/);
    await pnl.click();
    await expect(ariaOf(pnl)).toHaveAttribute("aria-sort", "ascending");
    expectSorted(await pnls(), "asc", "P&L asc");
    expect((await page.getByTestId("ledger-pnl").allTextContents()).pop()).toMatch(/unsettled|unknown|not recorded/);
    await pnl.click();
    await expect(ariaOf(pnl)).not.toHaveAttribute("aria-sort", /./);
    expect(await ids()).toEqual(sent);
    // only the active header says aria-sort
    await page.getByTestId("ledger-sort-time").click();
    await expect(page.locator('[data-testid="ledger-table"] th[aria-sort]')).toHaveCount(1);
    const times = await rows.evaluateAll((els) => els.map((e) => {
      const t = Date.parse(e.getAttribute("data-placed-at") ?? "");
      return Number.isFinite(t) ? t : null;
    }));
    expectSorted(times, "desc", "time desc (newest first)");
    await page.getByTestId("ledger-sort-market").click();
    await expect(ariaOf(page.getByTestId("ledger-sort-market"))).toHaveAttribute("aria-sort", "ascending");
    const markets = await page.getByTestId("ledger-contract").evaluateAll((els) =>
      els.map((e) => (e.querySelector("span")?.textContent ?? "").replace(/(handed over|taken back)$/i, "").trim() || null));
    expectSorted(markets, "asc", "market A→Z");
  });

  test("the ledger's CSV follows the sort, and a sort over loaded rows says so", async ({ page }) => {
    const base = qaLedger() as Record<string, unknown>;
    const n = (base.rows as unknown[]).length;
    const more = { ...base, page: { ...(base.page as object), offset: 0, returned: n, has_more: true } };
    await open(page, { hash: "#trades", ledger: more });
    await expect(page.getByTestId("ledger-sort-note")).toHaveCount(0);
    await page.getByTestId("ledger-sort-pnl").click();
    await expect(page.getByTestId("ledger-sort-note")).toHaveText("· sorted within loaded rows");
    const shown = await page.getByTestId("ledger-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-row-id")));
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByTestId("ledger-export").click()]);
    const csv = await (await import("node:fs/promises")).readFile(await dl.path(), "utf8");
    const csvIds = csv.replace(/^﻿/, "").trim().split("\n").slice(1).map((l) => l.split(",")[0]);
    expect(csvIds).toEqual(shown);
  });

  test("positions: live value (missing last both ways), kickoff time, market; orders by price", async ({ page }) => {
    await open(page, { hash: "#portfolio" });
    const live = page.getByTestId("book-sort-live");
    const vals = async () => (await page.getByTestId("book-live-value").allTextContents()).map(money);
    const tickers = () => page.getByTestId("book-position").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker")));
    const sent = await tickers();
    await live.click();
    expectSorted(await vals(), "desc", "live value desc");
    expect((await vals()).pop()).toBeNull();          // the unmarked position: last
    await live.click();
    expectSorted(await vals(), "asc", "live value asc");
    expect((await vals()).pop()).toBeNull();          // …and still last
    await live.click();
    expect(await tickers()).toEqual(sent);
    await page.getByTestId("book-sort-market").click();
    const titles = await page.getByTestId("book-position").evaluateAll((els) =>
      els.map((e) => e.querySelector("td span")?.textContent ?? null));
    expectSorted(titles, "asc", "market A→Z");
    await page.getByTestId("orders-sort-price").click();
    const prices = (await page.getByTestId("book-order").evaluateAll((els) =>
      els.map((e) => e.querySelectorAll("td")[2]?.textContent ?? ""))).map((t) => (/([\d.]+)¢/.exec(t) ? Number(/([\d.]+)¢/.exec(t)![1]) : null));
    expectSorted(prices, "desc", "order price desc");
  });

  test("every competition (numbers, words), performance (money, days) and a system table", async ({ page }) => {
    await open(page, { hash: "#trading" });
    const t = page.getByTestId("cand-by-comp");
    await page.getByTestId("by-comp-sort-assessed").click();
    const assessed = (await t.locator("tbody tr").evaluateAll((els) => els.map((e) => e.querySelectorAll("td")[2]?.textContent ?? ""))).map(int);
    expectSorted(assessed, "desc", "assessed desc");
    await page.getByTestId("by-comp-sort-competition").click();
    const names = await t.locator("tbody tr").evaluateAll((els) => els.map((e) => e.querySelector("td")?.textContent ?? null));
    expectSorted(names, "asc", "competition A→Z");

    await view(page, "#performance");
    const comp = page.getByTestId("ledger-by-competition");
    await comp.locator('[data-testid="group-sort-pnl"]').click();
    const pnl = (await comp.locator("tbody tr").evaluateAll((els) => els.map((e) => e.querySelectorAll("td")[4]?.textContent ?? ""))).map(money);
    expectSorted(pnl, "desc", "settled P&L by competition desc");
    await page.getByTestId("days-sort-key").click();
    const days = await page.getByTestId("ledger-day").evaluateAll((els) => els.map((e) => Date.parse(e.getAttribute("data-day") ?? "")));
    expectSorted(days, "desc", "days newest first");

    await view(page, "#system");
    const kinds = page.getByTestId("by-kind");
    await kinds.locator('th button[data-sort-key="1"]').click();
    await expect(kinds.locator("th").nth(1)).toHaveAttribute("aria-sort", "descending");
    const n = (await kinds.locator("tbody tr").evaluateAll((els) => els.map((e) => e.querySelectorAll("td")[1]?.textContent ?? ""))).map(int);
    expectSorted(n, "desc", "rows by kind desc");
  });

  test("the candidates grid is the same: three presses, missing last, aria-sort", async ({ page }) => {
    await open(page, { hash: "#trading" });
    const tickers = () => page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker")));
    const sent = await tickers();
    const model = page.getByTestId("cand-sort-model");
    const vals = async () => (await page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.querySelectorAll("td")[5]?.textContent ?? ""))).map(pct);
    await model.click();
    await expect(ariaOf(model)).toHaveAttribute("aria-sort", "descending");
    expectSorted(await vals(), "desc", "model desc");
    expect((await vals()).pop()).toBeNull();          // a row with no model price: last
    await model.click();
    expectSorted(await vals(), "asc", "model asc");
    expect((await vals()).pop()).toBeNull();
    await model.click();
    expect(await tickers()).toEqual(sent);
  });

  test("the sort survives a poll, a view switch and a fold, and a reload", async ({ page }) => {
    await page.clock.install();
    const reads = await open(page, { hash: "#trades", fakeClock: true });
    await page.getByTestId("ledger-sort-pnl").click();
    const order = await page.getByTestId("ledger-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-row-id")));
    const n = reads.ledger;
    await page.clock.runFor(61_000);
    await expect.poll(() => reads.ledger, "the ledger is read again").toBeGreaterThan(n);
    await page.clock.runFor(500);
    await expect(ariaOf(page.getByTestId("ledger-sort-pnl"))).toHaveAttribute("aria-sort", "descending");
    expect(await page.getByTestId("ledger-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-row-id")))).toEqual(order);
    await view(page, "#overview");
    await view(page, "#trades");
    await expect(ariaOf(page.getByTestId("ledger-sort-pnl"))).toHaveAttribute("aria-sort", "descending");
    await page.getByTestId("ops-ledger").getByTestId("panel-toggle").click();
    await page.getByTestId("ops-ledger").getByTestId("panel-toggle").click();
    expect(await page.getByTestId("ledger-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-row-id")))).toEqual(order);
  });

  test("a sort is remembered per table across a reload", async ({ page }) => {
    await open(page, { hash: "#portfolio" });
    await page.getByTestId("book-sort-live").click();
    await page.getByTestId("book-sort-live").click();   // ascending
    await page.reload();
    await token(page);
    await expect(ariaOf(page.getByTestId("book-sort-live"))).toHaveAttribute("aria-sort", "ascending");
    // another table keeps its own (none)
    await expect(page.locator('[data-testid="book-orders"] th[aria-sort]')).toHaveCount(0);
  });

  test("Enter and Space work a header", async ({ page }) => {
    await open(page, { hash: "#trades" });
    const size = page.getByTestId("ledger-sort-size");
    await size.focus();
    await page.keyboard.press("Enter");
    await expect(ariaOf(size)).toHaveAttribute("aria-sort", "descending");
    await page.keyboard.press("Space");
    await expect(ariaOf(size)).toHaveAttribute("aria-sort", "ascending");
    await page.keyboard.press("Enter");
    await expect(ariaOf(size)).not.toHaveAttribute("aria-sort", /./);
    await expect(size).toBeFocused();
  });

  test("a store that throws leaves every table in the backend's order, and sorting still works", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("blocked"); };
      Storage.prototype.setItem = () => { throw new Error("blocked"); };
    });
    await open(page, { hash: "#trades" });
    await expect(page.locator("th[aria-sort]")).toHaveCount(0);
    await page.getByTestId("ledger-sort-price").click();
    await expect(ariaOf(page.getByTestId("ledger-sort-price"))).toHaveAttribute("aria-sort", "descending");
  });
});

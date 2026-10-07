import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import {
  EMPTY_BOOK, qaBook, qaCandidates, qaLedger, qaStatusWarning, qaStatusWithCareful,
} from "./console-fixtures";

// THE REDESIGN'S DESIGN-QA SHOTS (2026-10-07). Not a test of behaviour —
// a camera. Skipped unless CONSOLE_SHOTS=1; every payload is hermetic
// (e2e/console-fixtures.ts), nothing reaches a backend. Writes PNGs to
// CONSOLE_SHOTS_DIR (default ~/dev/trivela-ops/console-redesign/shots).
test.skip(process.env.CONSOLE_SHOTS !== "1", "design-QA camera: CONSOLE_SHOTS=1 only");

const DIR = process.env.CONSOLE_SHOTS_DIR
  ?? join(homedir(), "dev", "trivela-ops", "console-redesign", "shots");
mkdirSync(DIR, { recursive: true });
const TOKEN = "qa-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function open(page: Page, o: {
  status?: unknown; book?: unknown; bookStatus?: number; cand?: unknown; candStatus?: number;
  ledger?: unknown; hash?: string; width?: number; height?: number;
} = {}) {
  await page.setViewportSize({ width: o.width ?? 1440, height: o.height ?? 900 });
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, o.status ?? qaStatusWithCareful())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(o.bookStatus ?? 200, o.book ?? qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(o.candStatus ?? 200, o.cand ?? qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(json(200, o.ledger ?? qaLedger())));
  await page.goto(`/ops/trading${o.hash ?? ""}`);
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
  await page.waitForTimeout(900);
}
const shot = (page: Page, name: string, full = true) =>
  page.screenshot({ path: join(DIR, `${name}.png`), fullPage: full });

test("overview 1440", async ({ page }) => { await open(page); await shot(page, "01-overview-1440"); });
test("overview 1920", async ({ page }) => { await open(page, { width: 1920, height: 1080 }); await shot(page, "02-overview-1920"); });
test("overview warning", async ({ page }) => {
  await open(page, { status: qaStatusWarning() }); await shot(page, "03-overview-warning");
});
test("trading candidates", async ({ page }) => {
  await open(page, { hash: "#trading" });
  await expect(page.getByTestId("cand-row").first()).toBeVisible();
  await shot(page, "04-candidates");
});
test("candidate inspector", async ({ page }) => {
  await open(page, { hash: "#trading" });
  await page.getByTestId("cand-row").nth(8).click();
  await expect(page.getByTestId("cand-inspector")).toBeVisible();
  await page.waitForTimeout(400);
  await shot(page, "05-candidate-inspector", false);
});
test("long market name + long ticker", async ({ page }) => {
  await open(page, { hash: "#trading" });
  await page.getByTestId("cand-row").nth(2).click();
  await expect(page.getByTestId("cand-inspector")).toBeVisible();
  await page.waitForTimeout(400);
  await shot(page, "06-long-strings", false);
});
test("filters active", async ({ page }) => {
  await open(page, { hash: "#trading?decision=skipped&phase=pre&q=vs" });
  await page.getByTestId("cand-sort-edge").click();
  await shot(page, "07-filters-active");
});
test("in play", async ({ page }) => {
  await open(page, { hash: "#trading?tab=inplay" }); await shot(page, "08-inplay");
});
test("portfolio", async ({ page }) => {
  await open(page, { hash: "#portfolio" }); await shot(page, "09-portfolio");
});
test("position inspector (long technical id)", async ({ page }) => {
  await open(page, { hash: "#portfolio" });
  await page.getByTestId("book-inspect").first().click();
  await page.waitForTimeout(400);
  await shot(page, "10-position-inspector-long-id", false);
});
test("empty positions", async ({ page }) => {
  await open(page, { hash: "#portfolio", book: EMPTY_BOOK }); await shot(page, "11-portfolio-empty");
});
test("trades ledger", async ({ page }) => {
  await open(page, { hash: "#trades" }); await shot(page, "12-trades");
});
test("trade detail", async ({ page }) => {
  await open(page, { hash: "#trades" });
  await page.getByTestId("ledger-expand").first().click();
  await shot(page, "13-trade-detail");
});
test("performance", async ({ page }) => {
  await open(page, { hash: "#performance" }); await shot(page, "14-performance");
});
test("model", async ({ page }) => {
  await open(page, { hash: "#model" }); await shot(page, "15-model");
});
test("system", async ({ page }) => {
  await open(page, { hash: "#system" }); await shot(page, "16-system");
});
test("read errors", async ({ page }) => {
  await open(page, { bookStatus: 500, book: { detail: "the account snapshot store fell over" },
    candStatus: 502, cand: { detail: "backend not reached" } });
  await shot(page, "17-read-errors");
});
test("mobile overview", async ({ page }) => {
  await open(page, { width: 390, height: 844 }); await shot(page, "18-mobile-overview");
});
test("mobile candidates", async ({ page }) => {
  await open(page, { width: 390, height: 844, hash: "#trading" }); await shot(page, "19-mobile-candidates");
});
test("token gate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ops/trading");
  await shot(page, "20-token-gate", false);
});

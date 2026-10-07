import { mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import { LEDGER_RECORDED } from "./trading-ledger-recorded";
import { LEDGER_WOULD_BE } from "./trading-ledger-would-be-recorded";
import {
  LEDGER_CSV_COLUMNS, ledgerCsv, parseLedger, parseWouldBe, pnlWords, wouldBeTag,
} from "../src/lib/tradingLedger";

// THE WOULD-BE RESULT OF AN UNFILLED ORDER, ON THE CONSOLE'S TRADES VIEW
// (Son, 2026-10-07: "show the would-be WON/LOST result on the trader's
// CANCELLED / UNFILLED orders ... It must be clearly not real money").
//
// Served the backend's own RECORDED payload (trading-ledger-v1.1,
// e2e/trading-ledger-would-be-recorded.ts) — no backend:
//
//   - every state's tag: would have WON / LOST with its would-be dollars,
//     result pending, postponed, no result; a partly filled order keeps its
//     real result and tags the unfilled rest (×7); grey ink only — never
//     the P&L's green or red — and the hover says it is not a real result;
//   - the totals, the P&L cells and the CSV's `pnl_dollars` are the real
//     money alone; the CSV carries the would-be in `would_be_*` columns;
//   - the summary line above the table and its breakdown by the journal's
//     cancel reason (sortable), folding with the section;
//   - an OLD backend's payload (no `would_be`) draws nothing extra — never
//     a zero;
//   - only the ledger's reader and the Trades view name the would-be.
//
// EXPERIMENTAL, UNPROVEN. NOT MONEY.

type Obj = Record<string, unknown>;
const REC = LEDGER_WOULD_BE as unknown as Obj;
const ROWS = LEDGER_WOULD_BE.rows as readonly Obj[];
const TOKEN = "ops-would-be-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
const idOf = (oid: string) => (ROWS.find((r) => r.order_id === oid)!.id as number);

/** the recorded payload as an OLD backend (v1) would send it */
function oldBackend(): Obj {
  const { would_be_summary: _s, ...rest } = REC;
  void _s;
  return { ...rest, version: "trading-ledger-v1",
    rows: ROWS.map((r) => { const { would_be: _w, ...x } = r; void _w; return x; }) };
}

async function openTrades(page: Page, ledger: unknown = REC) {
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, {
    label: "experimental, unproven", version: "trading-status-v0", env: "prod",
    enabled: true, kill: false, halt: { active: false }, generated_at: new Date().toISOString(),
  })));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(200, {
    version: "trading-book-v1", positions: [], orders: [],
    totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 } })));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(200, {
    version: "trading-candidates-v1", rows: [] })));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(json(200, ledger)));
  await page.goto("/ops/trading#trades");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-ledger")).toBeVisible();
  await expect(page.getByTestId("ledger-row")).toHaveCount(ROWS.length);
}

const row = (page: Page, oid: string) =>
  page.locator(`[data-testid="ledger-row"][data-row-id="${idOf(oid)}"]`);

test.describe("the would-be on the Trades view (not money)", () => {
  test("every state's tag, in grey ink, with the not-real hover", async ({ page }) => {
    await openTrades(page);
    const want: [string, string, string][] = [
      ["wb-won", "won", "NOT FILLED · would have WON +$7.02"],
      ["wb-lost", "lost", "NOT FILLED · would have LOST −$4.60"],
      ["wb-part", "lost", "NOT FILLED ×7 · would have LOST −$2.90"],
      ["wb-pend", "pending", "NOT FILLED · result pending"],
      ["wb-exp", "pending", "NOT FILLED · result pending"],
      ["wb-post", "postponed", "NOT FILLED · postponed"],
      ["wb-void", "no_result", "NOT FILLED · no result"],
    ];
    for (const [oid, status, text] of want) {
      const tag = row(page, oid).getByTestId("ledger-would-be");
      await expect(tag, oid).toHaveAttribute("data-would-be", status);
      await expect(tag, oid).toContainText(text);
      await expect(tag, oid).toHaveAttribute("title", /^not a real result: this order never filled — /);
      const cls = (await tag.getAttribute("class")) ?? "";
      expect(cls, oid).toContain("text-ink-low");
      expect(cls, oid).not.toMatch(/\btext-(up|neg)\b/);
    }
    // the REAL order carries no tag
    await expect(row(page, "ord-1").getByTestId("ledger-would-be")).toHaveCount(0);
  });

  test("the totals and the P&L cells are the real money alone", async ({ page }) => {
    await openTrades(page);
    // the backend's own summary: the would-be never enters it
    await expect(page.getByTestId("ledger-total-pnl")).toContainText("+$4.94");
    await expect(page.getByTestId("ledger-total-won")).toContainText("1");
    await expect(page.getByTestId("ledger-total-lost")).toContainText("1");
    // a would-be WIN's P&L cell is the real one: nothing filled
    await expect(row(page, "wb-won").getByTestId("ledger-pnl")).toHaveText("$0.00 · not filled");
    // a partly filled order's P&L cell is its REAL part: −$2.08
    await expect(row(page, "wb-part").getByTestId("ledger-pnl")).toHaveText("−$2.08");
    await expect(row(page, "wb-part").getByTestId("ledger-result")).toHaveText("NO · lost");
    // and the same page served WITHOUT the would-be shows the same money
    const real = await page.getByTestId("ledger-totals").innerText();
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await openTrades(page, oldBackend());
    expect(await page.getByTestId("ledger-totals").innerText()).toBe(real);
  });

  test("the summary line and its breakdown by cancel reason, sortable, folding with the section",
    async ({ page }) => {
      await openTrades(page);
      const line = page.getByTestId("ledger-would-be-line");
      await expect(line).toHaveText(
        "cancelled 7 · would have won 1, lost 2 (2 pending, 1 postponed, 1 no result) · would-be −$0.48");
      const fold = page.getByTestId("ledger-would-be-breakdown");
      await expect(page.getByTestId("ledger-would-be-reasons")).toBeHidden();
      await fold.locator("summary").click();
      const table = page.getByTestId("ledger-would-be-reasons");
      await expect(table).toBeVisible();
      const reasons = () => table.locator("tbody tr td:first-child").allInnerTexts();
      expect(await reasons()).toEqual(["cancel t minus 5", "careful swap", "edge gone",
        "kill switch", "market moved since consensus", "stale consensus", "Kalshi expiry"]);
      // sorted by the would-be dollars, as every console table sorts
      await table.getByRole("button", { name: /would-be/ }).click();
      const first = (await reasons())[0];
      await table.getByRole("button", { name: /would-be/ }).click();
      expect((await reasons())[0]).not.toBe(first);
      expect([first, (await reasons())[0]].sort()).toEqual(["cancel t minus 5", "edge gone"]);
      // the section folds, and the line with it
      const toggle = page.getByTestId("ops-ledger").getByTestId("panel-toggle").first();
      await toggle.click();
      await expect(page.getByTestId("ops-ledger")).toHaveAttribute("data-collapsed", "true");
      await expect(line).toBeHidden();
      await toggle.click();
      await expect(line).toBeVisible();
    });

  test("the inspector says what the unfilled contracts would have done", async ({ page }) => {
    await openTrades(page);
    await row(page, "wb-part").getByTestId("ledger-expand").click();
    const g = page.locator(`[data-testid="ledger-grounds"][data-row-id="${idOf("wb-part")}"]`);
    const wb = g.locator('[data-testid="ledger-ground"][data-field="would_be"]');
    await expect(wb).toContainText("would-be (not real money)");
    await expect(wb).toContainText("7 unfilled @ 41¢ · fee $0.03 · would-be −$2.90 · market NO");
    await expect(wb).toContainText("cancelled: stale_consensus (stale) · source journal settled");
    // the real result stays the journal's own
    await expect(g.locator('[data-field="outcome"]')).toContainText("lost");
  });

  test("the CSV keeps pnl_dollars real and adds would_be_* columns", async ({ page }) => {
    await openTrades(page);
    const [download] = await Promise.all([page.waitForEvent("download"),
      page.getByTestId("ledger-export").click()]);
    const table = parseCsv(readFileSync((await download.path())!, "utf8").slice(1));
    const head = table[0];
    for (const c of ["would_be_status", "would_be_result", "would_be_contracts",
      "would_be_price_cents", "would_be_fee_dollars", "would_be_pnl_dollars",
      "would_be_source", "would_be_cancel_reason", "would_be_reason_group"]) {
      expect(head, c).toContain(c);
    }
    const rec = (oid: string) => {
      const r = table.find((x) => x[head.indexOf("id")] === String(idOf(oid)))!;
      return Object.fromEntries(r.map((v, i) => [head[i], v]));
    };
    const won = rec("wb-won");
    expect(won.pnl_dollars).toBe("0");              // the real figure: nothing filled
    expect(won.would_be_status).toBe("won");
    expect(won.would_be_pnl_dollars).toBe("7.02");
    expect(won.would_be_contracts).toBe("12");
    expect(won.would_be_cancel_reason).toBe("edge_gone");
    const part = rec("wb-part");
    expect(part.pnl_dollars).toBe("-2.08");
    expect(part.would_be_pnl_dollars).toBe("-2.9");
    // pending: no would-be P&L — EMPTY, never 0
    expect(rec("wb-pend").would_be_pnl_dollars).toBe("");
    expect(rec("wb-pend").would_be_status).toBe("pending");
    // the real order: every would_be_* cell empty
    const real = rec("ord-1");
    for (const c of head.filter((h) => h.startsWith("would_be_"))) expect(real[c], c).toBe("");
  });

  test("an old backend's payload draws nothing extra, never a zero", async ({ page }) => {
    await openTrades(page, oldBackend());
    await expect(page.getByTestId("ledger-would-be")).toHaveCount(0);
    await expect(page.getByTestId("ledger-would-be-summary")).toHaveCount(0);
    await expect(row(page, "wb-won").getByTestId("ledger-pnl")).toHaveText("$0.00 · not filled");
    await expect(page.getByTestId("ops-ledger")).not.toContainText("would");
  });
});

test.describe("the would-be's readers", () => {
  const L = parseLedger(REC);

  test("read as sent; a missing, unknown or 'real money' block is no block", () => {
    expect(L.version).toBe("trading-ledger-v1.1");
    const wb = L.rows.find((r) => r.order_id === "wb-won")!.would_be!;
    expect(wb).toMatchObject({ status: "won", result: "yes", contracts: 12,
      price_cents: 41, fee_dollars: 0.06, pnl_dollars: 7.02, cancel_reason: "edge_gone",
      reason_group: "edge_gone", state: "cancelled" });
    expect(L.rows.find((r) => r.order_id === "ord-1")!.would_be).toBeNull();
    expect(L.would_be_summary!.totals!.orders).toBe(7);
    expect(parseWouldBe(undefined)).toBeNull();
    expect(parseWouldBe({ status: "maybe" })).toBeNull();
    expect(parseWouldBe({ status: "won", pnl_dollars: 1, real_money: true })).toBeNull();
    // a P&L is never read off a pending block
    expect(parseWouldBe({ status: "pending", pnl_dollars: 0 })!.pnl_dollars).toBeNull();
    const old = parseLedger(oldBackend());
    expect(old.rows.every((r) => r.would_be === null)).toBe(true);
    expect(old.would_be_summary).toBeNull();
    expect(old.rows.map((r) => wouldBeTag(r))).toEqual(old.rows.map(() => null));
  });

  test("the money readers never read it", () => {
    for (const r of L.rows) {
      const plain = { ...r, would_be: null };
      expect(pnlWords(r)).toBe(pnlWords(plain));
    }
    // the CSV's columns: v1's first, unchanged, then the would-be's
    const v1 = ledgerCsv(parseLedger(LEDGER_RECORDED as unknown as Obj).rows).split("\r\n")[0].split(",");
    expect(v1).toEqual([...LEDGER_CSV_COLUMNS]);
    const firstWb = LEDGER_CSV_COLUMNS.indexOf("would_be_status" as never);
    expect(LEDGER_CSV_COLUMNS.slice(firstWb).every((c) => c.startsWith("would_be_"))).toBe(true);
    expect(LEDGER_CSV_COLUMNS.indexOf("pnl_dollars" as never)).toBeLessThan(firstWb);
  });

  test("only the ledger's reader and the Trades view name the would-be", () => {
    const root = join(__dirname, "..", "src");
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(f) && /would_be|wouldBe|WouldBe/.test(readFileSync(p, "utf8"))) {
          hits.push(relative(root, p));
        }
      }
    };
    walk(root);
    expect(hits.sort()).toEqual(["components/console/TradesView.tsx", "lib/tradingLedger.ts"]);
    // and inside the view, no total and no P&L reads it
    const view = readFileSync(join(root, "components/console/TradesView.tsx"), "utf8");
    for (const fn of ["ledgerSortVal", "plTone"]) {
      const at = view.indexOf(fn);
      const body = view.slice(at, view.indexOf("\n}\n", at));
      expect(body, fn).not.toMatch(/would_be|wouldBe/);
    }
  });
});

// THE CAMERA (not a test of behaviour): WOULDBE_SHOTS=1 writes the Trades
// view with real and would-be rows, and the summary, to
// ~/dev/trivela-ops/console-redesign/shots-wouldbe/.
test.describe("the would-be shots", () => {
  test.skip(process.env.WOULDBE_SHOTS !== "1", "camera: WOULDBE_SHOTS=1 only");
  const DIR = join(homedir(), "dev", "trivela-ops", "console-redesign", "shots-wouldbe");

  test("trades with real and would-be rows, the summary open", async ({ page }) => {
    mkdirSync(DIR, { recursive: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openTrades(page);
    await page.getByTestId("ledger-would-be-breakdown").locator("summary").click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(DIR, "01-trades-would-be-1440.png"), fullPage: true });
    await row(page, "wb-part").getByTestId("ledger-expand").click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(DIR, "02-trades-partial-inspector-1440.png"), fullPage: true });
    await row(page, "wb-won").getByTestId("ledger-would-be").hover();
    await page.waitForTimeout(300);
    await page.getByTestId("ledger-table").screenshot({ path: join(DIR, "03-table-close-up.png") });
    await row(page, "wb-part").getByTestId("ledger-expand").click();
    await page.setViewportSize({ width: 400, height: 900 });
    await page.getByTestId("ledger-would-be-summary").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(DIR, "04-summary-400.png") });
    // the table scrolls in its own box at phone width: bring the tags in
    await row(page, "wb-won").getByTestId("ledger-would-be").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(DIR, "05-rows-400.png") });
  });
});

/** A small RFC 4180 reader: quoted fields, doubled quotes, newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let out: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      out.push(field); rows.push(out); out = []; field = "";
    } else field += c;
  }
  if (field !== "" || out.length) { out.push(field); rows.push(out); }
  return rows;
}

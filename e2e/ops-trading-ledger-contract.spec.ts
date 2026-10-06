import { expect, test, type Page, type Request } from "@playwright/test";
import { hydrated } from "./operator-console";
import {
  LEDGER_PAGE_1, LEDGER_PAGE_2, LEDGER_RECORDED,
} from "./trading-ledger-recorded";

// THE LEDGER READS WHAT THE BACKEND SENDS (2026-10-06, review fix).
//
// The first build of "Trades & grounds" read a contract guessed before the
// backend existed: a flat row (`ticker`, `price`, `pnl`, `fills`…), a flat
// grounds block, a cursor. The backend's trading-ledger-v1 nests the market
// under `market`, the money under `cost_dollars` / `outcome.pnl_dollars`,
// the fills under `lifecycle`, the edge under `edge`, and pages by
// `offset` / `page.has_more`. Against the real route the page drew an EMPTY
// table (every row "unreadable": no top-level ticker), null totals, no
// daily bars and a "Load older" that never came — while its own tests,
// which served the guessed shape, stayed green.
//
// These tests serve the payloads RECORDED from the backend's own route
// (e2e/trading-ledger-recorded.ts) exactly as sent, so a field this page
// reads under another name or shape fails here:
//
//   - every recorded row is drawn, none "unreadable", newest first as sent;
//   - the money is the backend's: cost, the settled P&L, the totals, the
//     P&L by day against the $10 line it states, the day it flags;
//   - the result is the journaled outcome.status: won / lost / unsettled /
//     not filled, never guessed and never a 0 for "unsettled";
//   - the grounds read from their nested blocks (fair, consensus, model,
//     blend, maker, fee, edge, in_play, guards, risk), each block's status
//     said in words;
//   - "Load older" asks for the next OFFSET while page.has_more;
//   - the phase filter offers the backend's own phase keys (handover, not
//     handed_over).
//
// Fully mocked with page.route; no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const LEDGER = "**/api/ops/trading-ledger**";
const TOKEN = "ops-ledger-contract-token-typed-by-a-person";

const STATUS_PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  env: "demo", enabled: true, kill: false, halt: { active: false },
  generated_at: new Date().toISOString(),
};
const EMPTY_BOOK = {
  version: "trading-book-v1", positions: [], orders: [],
  totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
};

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Rec = (typeof LEDGER_RECORDED)["rows"][number];
const REC = LEDGER_RECORDED.rows as readonly Rec[];
/** the recorded row placed under this order id (or of this row type) */
const byOrder = (oid: string) => REC.find((r) => r.order_id === oid)!;
const byType = (t: string) => REC.find((r) => r.row_type === t)!;

const WON = byOrder("ord-1");          // v0, 41c x 12, settled YES: +$7.02
const V2 = byOrder("v2-1");            // blend order, filled, UNSETTLED
const CANCELLED = byOrder("tie-1");    // edge_gone, never filled
const INPLAY = byOrder("ip-1");        // in-play v2 entry, minute 38, won
const EXIT = byOrder("px-1");          // protective exit, minute 71, lost
const MLS = byOrder("mls-1");          // the day past the $10 line
const OLD = byOrder("old-2");          // recorded nothing at all
const HANDOVER = byType("handover");
const TAKEBACK = byType("takeback");

async function openConsole(page: Page,
                           ledger: (url: URL) => unknown = () => LEDGER_RECORDED) {
  const reads: Request[] = [];
  await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_PAYLOAD)));
  await page.route(BOOK, (r) => r.fulfill(json(200, EMPTY_BOOK)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200,
    { version: "trading-candidates-v1", rows: [] })));
  await page.route(LEDGER, (r) => {
    reads.push(r.request());
    return r.fulfill(json(200, ledger(new URL(r.request().url()))));
  });
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-ledger")).toBeVisible();
  return reads;
}

const row = (page: Page, r: Rec) =>
  page.locator(`[data-testid="ledger-row"][data-row-id="${r.id}"]`);
const cell = (page: Page, r: Rec, id: string) =>
  row(page, r).getByTestId(`ledger-${id}`);

async function open(page: Page, r: Rec) {
  await row(page, r).getByTestId("ledger-expand").click();
  const panel = page.locator(
    `[data-testid="ledger-grounds"][data-row-id="${r.id}"]`);
  await expect(panel).toBeVisible();
  return panel;
}
const ground = (panel: ReturnType<Page["locator"]>, field: string) =>
  panel.locator(`[data-testid="ledger-ground"][data-field="${field}"]`);

test.describe("the ledger reads the backend's trading-ledger-v1", () => {
  test("every recorded row is drawn, newest first as sent, none unreadable",
    async ({ page }) => {
      await openConsole(page);
      await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);
      expect(await page.getByTestId("ledger-row").evaluateAll(
        (els) => els.map((e) => Number(e.getAttribute("data-row-id")))))
        .toEqual(REC.map((r) => r.id));
      await expect(page.getByTestId("ledger-count")).not.toContainText("unreadable");
      await expect(page.getByTestId("ledger-count"))
        .toContainText(`${REC.length} rows · newest first · all loaded`);
    });

  test("the won pre-match order, number by number, from its nested blocks",
    async ({ page }) => {
      await openConsole(page);
      for (const [id, text] of [
        ["match", "Synthetic Home v Synthetic Away"], ["match", "Premier League"],
        ["contract", "Synthetic Home to win"], ["contract", WON.market.ticker],
        ["contract", "match result · home_win"], ["side", "YES"],
        ["price", "41¢"], ["price", "YES book 41¢"], ["size", "12"],
        ["cost", "$4.98"], ["cost", "fee $0.06"], ["phase", "pre-match"],
        ["edge", "+6.9¢ vs 3¢"], ["fill", "filled 12/12 @ 41¢"],
        ["result", "YES · won"], ["pnl", "+$7.02"], ["why", WON.why!],
      ] as const) {
        await expect(cell(page, WON, id), `${id}: ${text}`).toContainText(text);
      }
      await expect(cell(page, WON, "edge")).toHaveAttribute("data-clears", "true");
      await expect(row(page, WON)).toHaveAttribute("data-result", "won");
      await expect(row(page, WON)).toHaveAttribute("data-kind", "order");
    });

  test("a NO buy shows its own price and the YES book's; lost and won read "
    + "from outcome.status", async ({ page }) => {
      await openConsole(page);
      await expect(cell(page, MLS, "side")).toHaveText("NO");
      await expect(cell(page, MLS, "price")).toContainText("50¢");
      await expect(cell(page, MLS, "price")).toContainText("YES book 50¢");
      await expect(cell(page, EXIT, "price")).toContainText("30¢");
      await expect(cell(page, EXIT, "price")).toContainText("YES book 70¢");
      await expect(cell(page, MLS, "result")).toHaveText("YES · lost");
      await expect(cell(page, MLS, "pnl")).toHaveText("−$11.10");
      await expect(row(page, MLS)).toHaveAttribute("data-result", "lost");
      await expect(cell(page, INPLAY, "result")).toHaveText("NO · won");
      await expect(cell(page, INPLAY, "pnl")).toHaveText("+$2.01");
    });

  test("unsettled says so — never $0.00, never 'not recorded'",
    async ({ page }) => {
      await openConsole(page);
      await expect(cell(page, V2, "result")).toHaveText("unsettled");
      await expect(cell(page, V2, "pnl")).toHaveText("unsettled");
      await expect(row(page, V2)).toHaveAttribute("data-result", "unsettled");
      await expect(cell(page, V2, "contract")).toContainText("Over 2.5 goals");
      await expect(cell(page, V2, "edge")).toContainText("+2.8¢ vs 2¢");
    });

  test("a cancelled order names its reason; nothing filled, nothing owed",
    async ({ page }) => {
      await openConsole(page);
      await expect(cell(page, CANCELLED, "contract")).toContainText("Tie");
      await expect(cell(page, CANCELLED, "fill")).toContainText("cancelled 0/5");
      await expect(cell(page, CANCELLED, "fill")).toContainText("edge_gone");
      await expect(cell(page, CANCELLED, "result")).toContainText("not filled");
      await expect(cell(page, CANCELLED, "pnl")).toContainText("not filled");
      await expect(row(page, CANCELLED)).toHaveAttribute("data-result", "not_filled");
    });

  test("in play: the minute and the protective exit's tolerance bar",
    async ({ page }) => {
      await openConsole(page);
      await expect(cell(page, INPLAY, "phase")).toContainText("in-play");
      await expect(cell(page, INPLAY, "phase")).toContainText("38′");
      await expect(cell(page, EXIT, "phase")).toContainText("protective exit");
      await expect(cell(page, EXIT, "phase")).toContainText("71′");
      await expect(cell(page, EXIT, "edge")).toContainText("−0.37¢ vs −2¢");
      await expect(cell(page, EXIT, "edge")).toContainText("exit tolerance");
    });

  test("handover and takeback are their own rows, from the mark",
    async ({ page }) => {
      await openConsole(page);
      await expect(row(page, HANDOVER)).toHaveAttribute("data-kind", "handover");
      await expect(row(page, TAKEBACK)).toHaveAttribute("data-kind", "takeback");
      await expect(cell(page, HANDOVER, "contract")).toContainText("handed over");
      await expect(cell(page, TAKEBACK, "contract")).toContainText("taken back");
      await expect(cell(page, HANDOVER, "phase")).toContainText("handover");
      await expect(cell(page, HANDOVER, "edge")).toHaveText("not applicable");
      await expect(cell(page, HANDOVER, "pnl")).toHaveText("+$3.71");
      await expect(cell(page, TAKEBACK, "pnl")).toHaveText("−$1.14");
      await expect(cell(page, HANDOVER, "why")).toContainText("handed 6 YES");
    });

  test("the old row: every missing value says so, never a zero",
    async ({ page }) => {
      await openConsole(page);
      await expect(cell(page, OLD, "edge")).toHaveText("not recorded");
      // its fixture was not recorded: the backend borrowed the one an order
      // on the same Kalshi event recorded, and the page says so
      await expect(cell(page, OLD, "match")).toContainText(
        "fixture from an order on the same Kalshi event");
      await expect(cell(page, WON, "match")).not.toContainText("same Kalshi event");
      await expect(cell(page, OLD, "why")).toContainText("Fair not recorded");
      const panel = await open(page, OLD);
      for (const f of ["fair", "edge", "guards", "risk"]) {
        await expect(ground(panel, f), f).toContainText("not recorded");
      }
      await expect(ground(panel, "not_recorded"))
        .toContainText("grounds.fair");
    });

  test("a row opens to its nested grounds, each block said in words",
    async ({ page }) => {
      await openConsole(page);
      const v2 = await open(page, V2);
      for (const [field, text] of [
        ["fair", "47.5%"],
        ["consensus", "47.0%"], ["consensus", "3h old"],
        ["consensus", "3 books (Pinnacle, Bet365, Unibet)"],
        ["model", "49.0%"], ["model", "45m old"], ["model", "ratings_club"],
        ["blend", "w 0.25"], ["blend", "arm 0.25/0.02"], ["blend", "bar 2¢"],
        ["maker", "44¢"], ["fee", "0.43¢ a contract"], ["fee", "$0.07"],
        ["edge", "+2.83¢"], ["edge", "clears"],
        ["guards", "clear: no news or market move"],
        ["guards", "assessed, below the avoid threshold"],
        ["risk", "per_order_cap"], ["risk", "passed"],
        ["in_play", "not applicable"],
        ["lifecycle", "every contract filled"],
        ["outcome", "no journaled result"],
      ] as const) {
        await expect(ground(v2, field), `${field}: ${text}`).toContainText(text);
      }
      const won = await open(page, WON);
      await expect(ground(won, "model")).toContainText("not used");
      await expect(ground(won, "blend")).toContainText("not used");

      const ip = await open(page, INPLAY);
      for (const [field, text] of [
        ["in_play", "minute 38"], ["in_play", "1-0"],
        ["in_play", "engine 29.0%"], ["in_play", "live-informed 27.0%"],
        ["in_play", "anchor w 0.50"], ["in_play", "momentum 0.62, 0.38"],
        ["consensus", "not applicable"],
      ] as const) {
        await expect(ground(ip, field), `${field}: ${text}`).toContainText(text);
      }
      const ex = await open(page, EXIT);
      for (const [field, text] of [
        ["in_play", "HOT by momentum, xg15"], ["in_play", "danger 23.1%"],
        ["in_play", "≥ 20.0%"], ["in_play", "held YES"],
      ] as const) {
        await expect(ground(ex, field), `${field}: ${text}`).toContainText(text);
      }
      const h = await open(page, HANDOVER);
      await expect(ground(h, "handover")).toContainText("mark 40¢");
      await expect(ground(h, "handover")).toContainText("bid");
    });

  test("the summary: totals, P&L by day against the stated $10 line, and the "
    + "breakdowns", async ({ page }) => {
      await openConsole(page);
      const t = LEDGER_RECORDED.summary.totals;
      const totals = page.getByTestId("ledger-totals");
      for (const [k, v] of [["rows", String(t.rows)], ["orders", String(t.orders)],
        ["won", String(t.won)], ["lost", String(t.lost)],
        ["unsettled", String(t.unsettled)], ["pnl", "−$1.02"],
        ["open", "$3.56"], ["cost", "$28.58"]] as const) {
        await expect(totals.getByTestId(`ledger-total-${k}`), k).toContainText(v);
      }
      await expect(page.getByTestId("ledger-day-limit"))
        .toContainText("daily loss limit $10.00");
      await expect(page.getByTestId("ledger-day-limit"))
        .not.toContainText("from the status route");
      const days = page.getByTestId("ledger-day");
      await expect(days).toHaveCount(LEDGER_RECORDED.summary.by_day.length);
      expect(await days.evaluateAll((els) => els.map((e) => e.getAttribute("data-day"))))
        .toEqual(LEDGER_RECORDED.summary.by_day.map((d) => d.key));
      const over = LEDGER_RECORDED.summary.by_day.find((d) => d.over_daily_limit)!;
      const bad = page.locator(`[data-testid="ledger-day"][data-day="${over.key}"]`);
      await expect(bad).toHaveAttribute("data-limit-hit", "true");
      await expect(bad).toContainText("−$11.10");
      await expect(page.getByTestId("ledger-limit-line"))
        .toHaveCount(LEDGER_RECORDED.summary.by_day.length);

      const group = (table: string, key: string) => page.locator(
        `[data-testid="ledger-by-${table}"] [data-testid="ledger-group-row"][data-key="${key}"]`);
      await expect(group("competition", "mls")).toContainText("−$11.10");
      await expect(group("family", "TOTAL")).toContainText("total goals");
      await expect(group("phase", "handover")).toContainText("+$2.57");
      await expect(group("price", "40-60")).toContainText("40–60¢");
      await expect(group("edge", "5+")).toContainText("−$2.07");
      await expect(group("edge", "not_applicable")).toContainText("not applicable");
    });

  test("'Load older' asks for the next offset while page.has_more",
    async ({ page }) => {
      const reads = await openConsole(page, (url) =>
        url.searchParams.get("offset") === "3" ? LEDGER_PAGE_2 : LEDGER_PAGE_1);
      await expect(page.getByTestId("ledger-row")).toHaveCount(3);
      await expect(page.getByTestId("ledger-count")).toContainText("more on the backend");
      await page.getByTestId("ledger-more").click();
      await expect(page.getByTestId("ledger-row")).toHaveCount(6);
      const last = new URL(reads.at(-1)!.url());
      expect(last.searchParams.get("offset")).toBe("3");
      expect(last.searchParams.has("cursor")).toBe(false);
      expect(await page.getByTestId("ledger-row").evaluateAll(
        (els) => els.map((e) => Number(e.getAttribute("data-row-id")))))
        .toEqual([...LEDGER_PAGE_1.rows, ...LEDGER_PAGE_2.rows].map((r) => r.id));
    });

  test("the phase filter offers the backend's own keys", async ({ page }) => {
    const reads = await openConsole(page);
    const values = await page.getByTestId("ledger-filter-phase").locator("option")
      .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    expect(values.filter(Boolean).sort())
      .toEqual(Object.keys(LEDGER_RECORDED.vocab.phases).sort());
    await page.getByTestId("ledger-filter-phase").selectOption("handover");
    await expect.poll(() => new URL(reads.at(-1)!.url()).searchParams.get("phase"))
      .toBe("handover");
  });

  test("a summary that read only part of the journal says so",
    async ({ page }) => {
      await openConsole(page, () => ({ ...LEDGER_RECORDED,
        page: { ...LEDGER_RECORDED.page, scan_complete: false } }));
      await expect(page.getByTestId("ledger-scan-partial"))
        .toContainText("only the newest 5000 journal rows were read");
    });
});

test.describe("the ledger proxy speaks the backend's paging", () => {
  test("offset crosses; limit stops at the backend's 200; the phase and "
    + "competition rules are the backend's", async ({ request }) => {
      const ok = ["offset=3", "limit=200", "phase=handover",
        "competition=ligue_1", "competition=a-b_c"];
      for (const q of ok) {
        const r = await request.get(`/api/ops/trading-ledger?${q}`,
          { headers: { "x-admin-token": "proxy-test-token" } });
        expect(r.status(), q).not.toBe(400);
      }
      const bad: [string, string][] = [["limit", "201"], ["offset", "5001"],
        ["offset", "-1"], ["phase", "handed_over"],
        ["competition", "a".repeat(17)], ["cursor", "c2"]];
      for (const [k, v] of bad) {
        const r = await request.get(`/api/ops/trading-ledger?${k}=${v}`,
          { headers: { "x-admin-token": "proxy-test-token" } });
        if (k === "cursor") {
          // no longer a filter: dropped, not refused
          expect(r.status(), `${k}=${v}`).not.toBe(400);
          continue;
        }
        expect(r.status(), `${k}=${v}`).toBe(400);
        expect((await r.json()).parameter, `${k}=${v}`).toBe(k);
      }
    });
});

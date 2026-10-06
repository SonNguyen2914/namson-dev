import { expect, test, type Page } from "@playwright/test";
import { LIVE, STANDIN_URL } from "./backend";
import { hydrated } from "./operator-console";
import {
  BOOK_RECORDED, CANDIDATES_RECORDED, STATUS_RECORDED,
} from "./trading-console-recorded";

// LIFT KILL AND QUEUED HAND-OVERS ON THE CONSOLE (2026-10-06).
//
//   - "Lift kill" sits beside the kill switch; it asks an in-page
//     Confirm (never window.confirm), POSTs /api/ops/trading-kill-lift,
//     and says the backend's {lifted, kill_until} in plain words; the
//     page says it cannot lift the Railway-level TRADING_KILL;
//   - the book's `pending_handovers` are drawn with a status chip in plain
//     words; a book without the field draws nothing;
//   - a hand-over answered 202 {queued: true} reads "Queued — hands over
//     at the next live price", never an error.
//
// Fully mocked with page.route, save the last block, which drives the
// real proxy against the hermetic stand-in. Values invented.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const LIFT = "**/api/ops/trading-kill-lift";
const HANDOVER = "**/api/ops/trading-handover";
const TOKEN = "ops-kill-lift-token-typed-by-a-person";

type Obj = Record<string, unknown>;
const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const MANUAL = "KXEPLGAME-26OCT10ARSWHU-ARS";
const BOOK_WITH_MANUAL: Obj = {
  ...BOOK_RECORDED,
  positions: [{
    ticker: MANUAL, title: "Arsenal vs West Ham — Arsenal", competition: "epl",
    kickoff_utc: "2026-10-10T14:00:00+00:00", in_play: false, side: "yes",
    contracts: 4, own: 0, handed_over: 0, managed: 0, manual: 4,
    avg_cost_cents: 52, mark_cents: 55, at_risk_dollars: "2.08",
  }],
  orders: [],
};

const PENDING = [
  { ticker: MANUAL, side: "yes", count: 2, requested_at: "2026-10-10T13:00:00+00:00",
    status: "queued" },
  { ticker: MANUAL, side: "yes", count: 1, requested_at: "2026-10-10T12:00:00+00:00",
    status: "completed", price_cents: 54 },
  { ticker: "KXMLSGAME-26OCT10LAFCSEA-LAFC", side: "no", count: 3,
    requested_at: "2026-10-10T11:00:00+00:00", status: "expired",
    reason: "the market closed before a live price came" },
  { ticker: MANUAL, side: "yes", count: 1, requested_at: "2026-10-10T10:00:00+00:00",
    status: "cancelled" },
];

async function openConsole(page: Page, status: Obj, book: Obj) {
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, book)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
  page.on("dialog", (d) => { throw new Error(`a dialog opened: ${d.message()}`); });
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
}

test.describe("Lift kill", () => {
  test("confirm in-page, POST with the token, say lifted", async ({ page }) => {
    const sent: { token: string | undefined; method: string }[] = [];
    await page.route(LIFT, async (r) => {
      sent.push({ token: r.request().headers()["x-admin-token"],
                  method: r.request().method() });
      await r.fulfill(json(200, { lifted: true, kill_until: null }));
    });
    await openConsole(page, { ...STATUS_RECORDED, kill: true }, BOOK_RECORDED);
    const box = page.getByTestId("kill-lift");
    await expect(box).toContainText("cannot lift TRADING_KILL");
    await box.getByRole("button", { name: "Lift kill" }).click();
    expect(sent).toEqual([]);   // nothing is sent before Confirm
    await box.getByTestId("kill-lift-confirm").click();
    await expect(page.getByTestId("kill-lift-result")).toContainText("Kill lifted");
    await expect(page.getByTestId("kill-lift-result")).toHaveAttribute("data-ok", "true");
    expect(sent).toEqual([{ token: TOKEN, method: "POST" }]);
  });

  test("cancel sends nothing", async ({ page }) => {
    let hits = 0;
    await page.route(LIFT, async (r) => { hits += 1; await r.fulfill(json(200, {})); });
    await openConsole(page, STATUS_RECORDED, BOOK_RECORDED);
    const box = page.getByTestId("kill-lift");
    await box.getByRole("button", { name: "Lift kill" }).click();
    await box.getByTestId("kill-lift-cancel").click();
    await expect(box.getByTestId("kill-lift-confirm")).toHaveCount(0);
    expect(hits).toBe(0);
  });

  test("a kill still in force is named, with TRADING_KILL", async ({ page }) => {
    await page.route(LIFT, (r) => r.fulfill(json(200,
      { lifted: false, kill_until: "2026-10-10T15:00:00+00:00" })));
    await openConsole(page, { ...STATUS_RECORDED, kill: true }, BOOK_RECORDED);
    const box = page.getByTestId("kill-lift");
    await box.getByRole("button", { name: "Lift kill" }).click();
    await box.getByTestId("kill-lift-confirm").click();
    const res = page.getByTestId("kill-lift-result");
    await expect(res).toHaveAttribute("data-ok", "false");
    await expect(res).toContainText("still in force until");
    await expect(res).toContainText("TRADING_KILL");
  });

  test("a backend without the route says so", async ({ page }) => {
    await page.route(LIFT, (r) => r.fulfill(json(404, { available: false })));
    await openConsole(page, STATUS_RECORDED, BOOK_RECORDED);
    const box = page.getByTestId("kill-lift");
    await box.getByRole("button", { name: "Lift kill" }).click();
    await box.getByTestId("kill-lift-confirm").click();
    await expect(page.getByTestId("kill-lift-result"))
      .toContainText("not available on this backend yet");
  });
});

test.describe("queued hand-overs", () => {
  test("each status in plain words", async ({ page }) => {
    await openConsole(page, STATUS_RECORDED,
      { ...BOOK_WITH_MANUAL, pending_handovers: PENDING });
    const rows = page.getByTestId("book-pending");
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toHaveAttribute("data-status", "queued");
    await expect(rows.nth(0)).toContainText("queued — will hand over at the next live price");
    await expect(rows.nth(1)).toContainText("completed at 54¢");
    await expect(rows.nth(2)).toContainText(
      "expired: the market closed before a live price came");
    await expect(rows.nth(3)).toContainText("cancelled");
  });

  test("a book without the field draws nothing", async ({ page }) => {
    await openConsole(page, STATUS_RECORDED, BOOK_WITH_MANUAL);
    await expect(page.getByTestId("book-position")).toHaveCount(1);
    await expect(page.getByTestId("book-pending-list")).toHaveCount(0);
  });

  test("a 202 {queued:true} hand-over reads as queued, not an error",
    async ({ page }) => {
      await page.route(HANDOVER, (r) => r.fulfill(json(202, { queued: true })));
      await openConsole(page, STATUS_RECORDED, BOOK_WITH_MANUAL);
      await page.getByTestId("hand-over").click();
      await page.getByTestId("book-confirm").click();
      const o = page.getByTestId("book-outcome");
      await expect(o).toHaveAttribute("data-ok", "true");
      await expect(o).toContainText("Queued — hands over at the next live price");
      await expect(o).not.toContainText("failed");
    });
});

test.describe("the kill-lift proxy", () => {
  test.skip(LIVE, "posts to the kill-lift route — hermetic runs only");

  test("a POST reaches exactly its allowlisted backend path; GET is 405",
    async ({ request }) => {
      const started = new Date().toISOString();
      const r = await request.post("/api/ops/trading-kill-lift", {
        data: { minutes: 9999, path: "../halt" },
        headers: { "x-admin-token": "proxy-test-token" },
      });
      expect(r.status()).toBe(503);   // the stand-in's named 503, relayed
      expect(r.headers()["cache-control"]).toBe("private, no-store");
      const get = await request.get("/api/ops/trading-kill-lift");
      expect(get.status()).toBe(405);
      expect(get.headers()["allow"]).toBe("POST");
      const log = await (await request.get(`${STANDIN_URL}/__standin/log`)).json() as
        { requests: { at: string; method: string; url: string }[] };
      expect(log.requests.filter((e) => e.at >= started
        && e.url.startsWith("/api/admin/trading/kill"))
        .map((e) => `${e.method} ${e.url}`))
        .toEqual(["POST /api/admin/trading/kill/lift"]);
    });
});

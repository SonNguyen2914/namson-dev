import { expect, test, type Page, type Request } from "@playwright/test";
import { LIVE, STANDIN_URL } from "./backend";

// THE TRADER'S BOOK ON THE OPERATOR CONSOLE (2026-10-03).
//
// Son's rule, checked here: the console shows every open position and
// resting order on the account, each flagged by whose it is; the trader
// touches none of his until he hands it over, and he can take it back.
// Only positions can be handed over — orders carry no buttons.
//
//   - the chips: "Trader N", "Handed over N", "Yours N", non-zero only;
//   - "Hand to trader" posts EXACTLY {action, ticker, side, contracts},
//     with the token, after an inline count + Confirm (never a dialog),
//     says what happened, and reads the book again;
//   - each backend refusal code is said in plain words;
//   - "Take back" is the same flow the other way;
//   - a backend without the route reads "Book not available yet" and the
//     rest of the console stands;
//   - orders have no buttons; empty lists say so; 400 px has no sideways
//     page scroll.
//
// Every UI test serves BOTH routes with page.route — no live backend. The
// last block drives the real proxy routes against the hermetic stand-in
// (a named 503 for everything) to prove the allowlisted paths and that a
// bad body never leaves the proxy.
//
// The payload follows the contract trading-book-v1; values invented.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const HANDOVER = "**/api/ops/trading-handover";
const TOKEN = "ops-book-token-typed-by-a-person";

const STATUS_PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v0", env: "prod", enabled: true, kill: false,
  halt: { active: false }, balance: "48.12", marked_equity: "49.37",
  total_at_risk: "7.40", total_limit: "20.00",
  generated_at: "2026-10-03T18:00:00+00:00",
};

/** all his */
const MANUAL = "KXEPLGAME-26OCT04ARSWHU-ARS";
/** the trader's 2, 3 he handed over, 1 still his */
const MIXED = "KXLALIGAGAME-26OCT04RMABAR-RMA";
/** the trader's own, nothing of his */
const TRADER = "KXMLSGAME-26OCT04LAFCSEA-LAFC";

const BOOK_PAYLOAD = {
  version: "trading-book-v1",
  generated_at: "2026-10-03T18:00:00+00:00",
  account_read_at: "2026-10-03T17:59:55+00:00",
  positions: [
    { ticker: MANUAL, title: "Arsenal vs West Ham — Arsenal", competition: "epl",
      kickoff_utc: "2026-10-04T14:00:00+00:00", in_play: false, side: "yes",
      contracts: 4, own: 0, handed_over: 0, managed: 0, manual: 4,
      avg_cost_cents: 52, mark_cents: 55, at_risk_dollars: "2.08" },
    { ticker: MIXED, title: "Real Madrid vs Barcelona — Real Madrid",
      competition: "laliga", kickoff_utc: "2026-10-03T17:00:00+00:00",
      in_play: true, side: "no", contracts: 6, own: 2, handed_over: 3,
      managed: 5, manual: 1, avg_cost_cents: 41.5, mark_cents: 38,
      at_risk_dollars: "2.49" },
    { ticker: TRADER, title: "LAFC vs Seattle — LAFC", competition: "mls",
      kickoff_utc: "2026-10-05T02:30:00+00:00", in_play: false, side: "yes",
      contracts: 5, own: 5, handed_over: 0, managed: 5, manual: 0,
      avg_cost_cents: 30, mark_cents: null, at_risk_dollars: "1.50" },
  ],
  orders: [
    { order_id: "ord-trader-1", ticker: TRADER, title: "LAFC vs Seattle — LAFC",
      competition: "mls", side: "yes", price_cents: 29, remaining: 3,
      owner: "trader", expires_utc: "2026-10-05T02:20:00+00:00",
      created_utc: "2026-10-03T17:50:00+00:00" },
    { order_id: "ord-manual-1", ticker: MANUAL,
      title: "Arsenal vs West Ham — Arsenal", competition: "epl", side: "yes",
      price_cents: 48, remaining: 10, owner: "manual", expires_utc: null,
      created_utc: "2026-10-03T16:00:00+00:00" },
  ],
  totals: { positions: 3, orders: 2, managed_contracts: 10, manual_contracts: 5 },
};

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

/** Serve the status and the book, open the console, type the token. */
async function openConsole(page: Page, book: { status: number; body: unknown }) {
  const bookReads: Request[] = [];
  const dialogs: string[] = [];
  page.on("dialog", (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_PAYLOAD)));
  await page.route(BOOK, (r) => {
    bookReads.push(r.request());
    return r.fulfill(json(book.status, book.body));
  });
  await page.goto("/ops/trading");
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-book")).toBeVisible();
  return { bookReads, dialogs };
}

type Posted = { method: string; body: unknown; token: string | undefined };

/** Answer each hand-over POST with the next of `answers`. */
async function serveHandover(page: Page,
                             answers: { status: number; body: unknown }[]) {
  const posted: Posted[] = [];
  await page.route(HANDOVER, (r) => {
    const q = r.request();
    posted.push({ method: q.method(), body: q.postDataJSON(),
                  token: q.headers()["x-admin-token"] });
    const a = answers[Math.min(posted.length - 1, answers.length - 1)];
    return r.fulfill(json(a.status, a.body));
  });
  return posted;
}

const row = (page: Page, ticker: string) =>
  page.locator(`[data-testid="book-position"][data-ticker="${ticker}"]`);

test.describe("the trader's book on the console", () => {
  test("every position and order, each flagged by whose it is; orders "
    + "have no buttons", async ({ page }) => {
      const { bookReads } = await openConsole(page, { status: 200, body: BOOK_PAYLOAD });
      await expect(page.getByTestId("book-position")).toHaveCount(3);
      expect(bookReads[0].method()).toBe("GET");
      expect(bookReads[0].headers()["x-admin-token"]).toBe(TOKEN);

      const mixed = row(page, MIXED);
      await expect(mixed.getByTestId("chip-trader")).toHaveText("Trader 2");
      await expect(mixed.getByTestId("chip-handed")).toHaveText("Handed over 3");
      await expect(mixed.getByTestId("chip-yours")).toHaveText("Yours 1");
      await expect(mixed).toContainText("in play");
      await expect(mixed).toContainText(MIXED);
      await expect(mixed).toContainText("41.5¢");
      await expect(mixed).toContainText("$2.49");
      await expect(mixed.getByTestId("hand-over")).toHaveText("Hand to trader");
      await expect(mixed.getByTestId("take-back")).toHaveText("Take back");

      const manual = row(page, MANUAL);
      await expect(manual.getByTestId("chip-yours")).toHaveText("Yours 4");
      await expect(manual.getByTestId("chip-trader")).toHaveCount(0);
      await expect(manual.getByTestId("chip-handed")).toHaveCount(0);
      await expect(manual.getByTestId("hand-over")).toHaveCount(1);
      await expect(manual.getByTestId("take-back")).toHaveCount(0);

      // the trader's own: nothing to hand over, nothing to take back
      const own = row(page, TRADER);
      await expect(own.getByTestId("chip-trader")).toHaveText("Trader 5");
      await expect(own.getByTestId("chip-yours")).toHaveCount(0);
      await expect(own.locator("button")).toHaveCount(0);

      const orders = page.getByTestId("book-orders");
      await expect(orders.getByTestId("book-order")).toHaveCount(2);
      await expect(orders.locator("button")).toHaveCount(0);
      await expect(page.locator('[data-testid="book-order"][data-ticker="'
        + MANUAL + '"]').getByTestId("chip-yours")).toHaveText("Yours");
      await expect(page.locator('[data-testid="book-order"][data-ticker="'
        + TRADER + '"]').getByTestId("chip-trader")).toHaveText("Trader");
      await expect(page.getByTestId("book-orders-line")).toHaveText(
        "Resting orders can't be handed over yet — positions only.");
      await expect(page.getByTestId("book-note")).toContainText(
        "The trader never touches positions marked Yours.");
      await expect(page.getByTestId("book-note")).toContainText(
        "a close that lowers risk always goes through. Experimental, unproven.");
      await expect(page.getByTestId("book-totals")).toContainText("3 positions");
    });

  test("hand to trader: inline count, Confirm posts the exact body, says "
    + "so, and reads the book again", async ({ page }) => {
      const posted = await serveHandover(page, [
        { status: 200, body: { ok: true, handed_over: 3, managed: 3, manual: 1 } },
      ]);
      const { bookReads, dialogs } = await openConsole(page,
        { status: 200, body: BOOK_PAYLOAD });
      await expect(page.getByTestId("book-position")).toHaveCount(3);

      await row(page, MANUAL).getByTestId("hand-over").click();
      const count = page.getByTestId("book-count");
      await expect(count).toHaveValue("4");
      await expect(count).toHaveAttribute("max", "4");
      const confirm = page.getByTestId("book-confirm");
      for (const bad of ["5", "0", "1.5", ""]) {
        await count.fill(bad);
        await expect(confirm, `count ${JSON.stringify(bad)}`).toBeDisabled();
      }
      await count.fill("3");
      await expect(confirm).toBeEnabled();
      expect(posted).toEqual([]);

      const readsBefore = bookReads.length;
      await confirm.click();
      const outcome = page.getByTestId("book-outcome");
      await expect(outcome).toHaveAttribute("data-ok", "true");
      await expect(outcome).toContainText("Handed 3 YES contracts on Arsenal vs West Ham");
      await expect(outcome).toContainText("It now manages 3 here; 1 stays yours.");
      expect(posted).toEqual([{ method: "POST", token: TOKEN,
        body: { action: "handover", ticker: MANUAL, side: "yes", contracts: 3 } }]);
      await expect(page.getByTestId("book-edit")).toHaveCount(0);
      await expect.poll(() => bookReads.length, "the book is read again")
        .toBeGreaterThan(readsBefore);
      expect(dialogs, "confirmation is inline, never a browser dialog").toEqual([]);
    });

  test("each refusal code is said in plain words", async ({ page }) => {
    const cases: [string, string][] = [
      ["account_unreadable",
        "the trader hasn't read the account recently — try again in a minute"],
      ["not_held", "you no longer hold this"],
      ["market_not_trading", "market closed"],
      ["more_than_yours", "that is more contracts than are yours to hand over"],
    ];
    const posted = await serveHandover(page, cases.map(([code]) => ({
      status: 409, body: { ok: false, error: code, detail: `backend says ${code}` },
    })));
    await openConsole(page, { status: 200, body: BOOK_PAYLOAD });
    for (const [code, words] of cases) {
      await row(page, MANUAL).getByTestId("hand-over").click();
      await page.getByTestId("book-confirm").click();
      const outcome = page.getByTestId("book-outcome");
      await expect(outcome, code).toHaveAttribute("data-ok", "false");
      await expect(outcome, code).toContainText(`Hand-over failed: ${words}`);
    }
    expect(posted).toHaveLength(cases.length);
  });

  test("take back: Cancel sends nothing; Confirm posts the take-back",
    async ({ page }) => {
      const posted = await serveHandover(page, [
        { status: 200, body: { ok: true, handed_over: 1, managed: 3, manual: 3 } },
      ]);
      const { dialogs } = await openConsole(page, { status: 200, body: BOOK_PAYLOAD });
      const mixed = row(page, MIXED);

      await mixed.getByTestId("take-back").click();
      await expect(page.getByTestId("book-count")).toHaveValue("3");
      await expect(page.getByTestId("book-count")).toHaveAttribute("max", "3");
      await page.getByTestId("book-cancel").click();
      await expect(page.getByTestId("book-edit")).toHaveCount(0);
      expect(posted).toEqual([]);

      await mixed.getByTestId("take-back").click();
      await page.getByTestId("book-count").fill("2");
      await page.getByTestId("book-confirm").click();
      const outcome = page.getByTestId("book-outcome");
      await expect(outcome).toHaveAttribute("data-ok", "true");
      await expect(outcome).toContainText("Took back 2 NO contracts on Real Madrid vs Barcelona");
      await expect(outcome).toContainText("3 are yours; the trader manages 3 here.");
      expect(posted).toEqual([{ method: "POST", token: TOKEN,
        body: { action: "takeback", ticker: MIXED, side: "no", contracts: 2 } }]);
      expect(dialogs).toEqual([]);
    });

  test("a backend without the book route: 'not available yet', and the "
    + "console stands", async ({ page }) => {
      await openConsole(page, { status: 404, body: { available: false } });
      await expect(page.getByTestId("book-unavailable"))
        .toContainText("Book not available yet");
      await expect(page.getByTestId("book-positions")).toHaveCount(0);
      await expect(page.getByTestId("ops-strip")).toBeVisible();
      await expect(page.getByTestId("ops-money")).toContainText("$48.12");
    });

  test("empty lists say so", async ({ page }) => {
    await openConsole(page, { status: 200, body: {
      ...BOOK_PAYLOAD, positions: [], orders: [],
      totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
    } });
    await expect(page.getByTestId("book-positions-empty"))
      .toHaveText("No open positions on the account.");
    await expect(page.getByTestId("book-orders-empty"))
      .toHaveText("No resting orders on the account.");
    await expect(page.locator('[data-testid="ops-book"] button')).toHaveCount(0);
  });

  test("at 400 px the tables scroll inside their boxes and the page does "
    + "not scroll sideways", async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 900 });
      await openConsole(page, { status: 200, body: BOOK_PAYLOAD });
      await expect(page.getByTestId("book-position")).toHaveCount(3);
      const { page: pageW, view, table, box } = await page.evaluate(() => {
        const t = document.querySelector('[data-testid="book-positions"]')!;
        return {
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
          table: t.scrollWidth,
          box: t.parentElement!.clientWidth,
        };
      });
      expect(pageW, "no sideways page scroll").toBeLessThanOrEqual(view);
      expect(table, "the table is wider than its box, so the box scrolls")
        .toBeGreaterThan(box);
    });
});

// ---------------------------------------------- the proxies themselves

test.describe("the book and hand-over proxies", () => {
  test.skip(LIVE, "posts to the hand-over route — hermetic runs only");

  async function handoverHits(request: import("@playwright/test").APIRequestContext,
                              since: string) {
    const r = await request.get(`${STANDIN_URL}/__standin/log`);
    expect(r.ok(), "the stand-in's log is readable").toBe(true);
    const log = await r.json() as { requests: { at: string; method: string; url: string }[] };
    return log.requests.filter((e) => e.at >= since
      && /^\/api\/admin\/trading\/(handover|takeback)/.test(e.url))
      .map((e) => `${e.method} ${e.url}`);
  }

  test("a bad body is refused 400 bad_request and never leaves the proxy",
    async ({ request }) => {
      const started = new Date().toISOString();
      const good = { action: "handover", ticker: MANUAL, side: "yes", contracts: 1 };
      const bad: unknown[] = [
        {}, [], "x",
        { ...good, action: "sell" },
        { ...good, ticker: "../mls/risk" },
        { ...good, ticker: "" },
        { ...good, side: "maybe" },
        { ...good, contracts: 0 },
        { ...good, contracts: 1.5 },
        { ...good, contracts: "3" },
        { ...good, extra: true },
      ];
      for (const body of bad) {
        const r = await request.post("/api/ops/trading-handover", {
          data: body, headers: { "x-admin-token": "proxy-test-token" },
        });
        expect(r.status(), JSON.stringify(body)).toBe(400);
        const j = await r.json();
        expect(j.ok, JSON.stringify(body)).toBe(false);
        expect(j.error, JSON.stringify(body)).toBe("bad_request");
        expect(r.headers()["cache-control"]).toBe("private, no-store");
      }
      const notJson = await request.post("/api/ops/trading-handover", {
        data: "not json", headers: { "content-type": "text/plain" },
      });
      expect(notJson.status()).toBe(400);
      expect((await notJson.json()).error).toBe("bad_request");
      expect(await handoverHits(request, started)).toEqual([]);
    });

  test("a good body reaches exactly its allowlisted backend path, and the "
    + "answer is relayed", async ({ request }) => {
      const started = new Date().toISOString();
      for (const action of ["handover", "takeback"]) {
        const r = await request.post("/api/ops/trading-handover", {
          data: { action, ticker: MIXED, side: "no", contracts: 2 },
          headers: { "x-admin-token": "proxy-test-token" },
        });
        // the stand-in's named 503, passed through unedited
        expect(r.status(), action).toBe(503);
        expect(r.headers()["cache-control"]).toBe("private, no-store");
      }
      expect(await handoverHits(request, started)).toEqual([
        "POST /api/admin/trading/handover", "POST /api/admin/trading/takeback",
      ]);
    });

  test("the verbs: the book is a GET, the hand-over a POST", async ({ request }) => {
    const book = await request.get("/api/ops/trading-book");
    expect(book.status()).toBe(503);
    expect(book.headers()["cache-control"]).toBe("private, no-store");
    expect((await request.post("/api/ops/trading-book")).status()).toBe(405);
    const get = await request.get("/api/ops/trading-handover");
    expect(get.status()).toBe(405);
    expect(get.headers()["allow"]).toBe("POST");
  });
});

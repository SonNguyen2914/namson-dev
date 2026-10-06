import { expect, test, type Page, type Request } from "@playwright/test";
import { STANDIN_URL } from "./backend";

// THE OPERATOR'S TRADING CONSOLE, /ops/trading (2026-10-03).
//
// What it promises, each claim checked here:
//
//   - with no token it shows the field and asks NOTHING — not the status
//     route, not any /api/ route;
//   - a typed token makes exactly ONE status call, through
//     /api/ops/trading-status, carrying the token as `x-admin-token`
//     (debounced: a token typed key by key is sent once, whole) — and,
//     once that read succeeds, ONE book read (/api/ops/trading-book, the
//     "Positions & orders" section; its own behaviour is
//     e2e/ops-trading-book.spec.ts) and ONE candidates read
//     (/api/ops/trading-candidates, 2026-10-05; its own behaviour is
//     e2e/ops-trading-candidates.spec.ts);
//   - the token is held in React state only: not in localStorage,
//     sessionStorage or a cookie, and a reload forgets it;
//   - a 200 renders every section the payload carries, and a payload
//     without a block (learning, before trading-v2) skips that section;
//   - a 403 reads "token rejected", a 503 "trading plane not ready" —
//     the 503 case is the REAL proxy against the hermetic stand-in, so it
//     also proves the route reaches the fixed backend path.
//
// The payload below follows the backend's `src/trading/status.py`
// (trading-status-v0) with the trading-v2 `learning` block — key for
// key, values invented. It carries no ticker, fixture or order id,
// because the backend never sends one.

const ROUTE = "**/api/ops/trading-status";
const TOKEN = "ops-console-token-typed-by-a-person";

const LEARNING = {
  label: "experimental, unproven", version: "learner-v0",
  trades_by_competition: { epl: 4, mls: 2 },
  fills_rewarded_by_competition: { epl: 3 },
  mean_clv_c: 0.8125,
  mean_clv_c_by_competition: { epl: 0.8125 },
  best_arm_by_competition: {
    epl: { w: "0.5", threshold: "0.03", posterior_mean_c: 0.71, evidence: 2.1 },
  },
  default_arm: { w: "0.5", threshold: "0.03" },
  reward_basis: "CLV in cents per contract after fees",
  enabled: true, strategy: "consensus-v2",
  model_priced_fixtures: 18, model_priced_markets: 54,
  model_only_markets: 6, candidates: 9,
  at: "2026-10-03T17:59:45+00:00",
};

const PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v0", env: "prod", enabled: true,
  universe_enabled: true, kill: false,
  halt: { active: false, reason: null, since: null, rearm: null },
  balance: "48.12", marked_equity: "49.37",
  account_read_at: "2026-10-03T17:59:50+00:00",
  total_at_risk: "7.40", total_limit: "20.00", bankroll_cap: "50",
  open_agent_orders: 3, open_other_orders: 1,
  fills_today: 2, placed_today: 5,
  pnl: {
    agent_total: "-0.63", agent_basis: "the AGENT'S OWN P&L",
    agent_since_start: "-0.63", realized_total: "1.05",
    realized_basis: "Kalshi's realized_pnl",
  },
  daily_loss: { used: "0.63", limit: "10" },
  drawdown: { used: "0.63", limit: "15" },
  in_play: {
    positions: 2, cost: "3.10", live_mark_total: "2.85", marked: 2,
    unmarked: 0, last_live_update_at: "2026-10-03T17:59:40+00:00",
    live_state_at: "2026-10-03T17:59:40+00:00",
    at: "2026-10-03T17:59:50+00:00", basis: "reporting only",
  },
  in_play_trading: {
    label: "experimental, unproven", strategy: "inplay-v1", enabled: false,
    active: false, outcome: "disabled", feed_available: true,
    feed_healthy: true, feed_subscriptions: 12, legs_in_play: 4,
    cooldowns_active: 1, global_cooldown: false, orders_open: 0,
    placed_today: 0, cancelled_today: 0,
    shocks_today: { goal: 3, red_card: 1 },
    pnl: { settled: null, cost: null, share_of_agent_pnl: null, basis: null },
    at: "2026-10-03T17:59:50+00:00",
  },
  learning: LEARNING,
  last_tick: {
    at: "2026-10-03T17:59:50+00:00", outcome: "ok", elapsed_s: 2.4,
    schedule: null,
  },
  today: {
    by_kind: { fill_observed: 2, placed: 5, skipped: 141, tick: 240 },
    by_reason: {
      skipped: { book_too_thin: 37, below_threshold: 96, cooldown: 8 },
      tick: { ok: 240 },
    },
  },
  universe: {
    version: "universe-v1", known: 1820,
    known_by_category: { soccer: 1820 }, in_scope: 410, priced: 230,
    eligible: 61,
    refusals_by_reason: { no_fair_price: 120, stale_book: 29,
      fixture_unmapped: 60 },
    fixture_unmapped_by_why: { no_espn_event: 60 },
    no_fair_price_by_why: { no_model: 120 },
    catalogue: { rows: 14552, max_rows: 50000,
      last_full_refresh_at: "2026-10-03T17:00:00+00:00" },
  },
  universe_at: "2026-10-03T17:59:50+00:00",
  account_at: "2026-10-03T17:59:50+00:00",
  generated_at: "2026-10-03T18:00:00+00:00",
};

/** Every request the page makes to an /api/ route, as it leaves. */
function apiCalls(page: Page): Request[] {
  const seen: Request[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) seen.push(r);
  });
  return seen;
}

async function serve(page: Page, status: number, body: unknown) {
  await page.route(ROUTE, (route) => route.fulfill({
    status, contentType: "application/json", body: JSON.stringify(body),
  }));
  // the candidates are read once the status answers; served empty here
  await page.route("**/api/ops/trading-candidates", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ version: "trading-candidates-v1", rows: [] }),
  }));
  // the book section is read once the status answers; served empty here
  await page.route("**/api/ops/trading-book", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ version: "trading-book-v1", positions: [],
      orders: [], totals: { positions: 0, orders: 0, managed_contracts: 0,
        manual_contracts: 0 } }),
  }));
}

test.describe("the operator trading console", () => {
  test("with no token: the bar, the field, and no request at all",
    async ({ page }) => {
      const calls = apiCalls(page);
      await page.goto("/ops/trading");
      await expect(page.locator("header.topbar")).toHaveCount(1);
      await expect(page.getByTestId("home-logo")).toHaveCount(1);
      const field = page.locator("#watch-token");
      await expect(field).toHaveAttribute("type", "password");
      await expect(field).toHaveAttribute("autocomplete", "off");
      await expect(page.locator('meta[name="robots"]'))
        .toHaveAttribute("content", /noindex/);
      await page.waitForTimeout(1500);
      expect(calls.map((r) => r.url())).toEqual([]);
      await expect(page.getByTestId("ops-console")).toHaveCount(0);
    });

  test("a typed token makes exactly one status call, one book read and one "
    + "candidates read, with the header, and every section renders",
  async ({ page }) => {
      await serve(page, 200, PAYLOAD);
      const calls = apiCalls(page);
      await page.goto("/ops/trading");
      // key by key: the debounce must send the WHOLE token, once
      await page.locator("#watch-token").pressSequentially(TOKEN, { delay: 20 });
      await expect(page.getByTestId("ops-console")).toBeVisible();
      await page.waitForTimeout(1000);
      // the status first; the book and the candidates are siblings read
      // once it answers, so their order between themselves is not a claim
      const paths = calls.map((r) => new URL(r.url()).pathname);
      expect(paths[0]).toBe("/api/ops/trading-status");
      expect(paths.slice(1).sort())
        .toEqual(["/api/ops/trading-book", "/api/ops/trading-candidates"]);
      for (const c of calls) {
        expect(c.method()).toBe("GET");
        expect(c.headers()["x-admin-token"]).toBe(TOKEN);
      }

      for (const id of ["strip", "book", "candidates", "money", "activity",
                        "inplay", "handover", "learning", "settlements",
                        "catalogue", "stop"]) {
        await expect(page.getByTestId(`ops-${id}`), id).toBeVisible();
      }
      const strip = page.getByTestId("ops-strip");
      await expect(strip).toContainText("experimental, unproven");
      await expect(strip).toContainText("prod");
      const money = page.getByTestId("ops-money");
      await expect(money).toContainText("$48.12");
      await expect(money).toContainText("$49.37");
      await expect(money).toContainText("−$0.63");
      await expect(page.getByTestId("meter-risk")).toContainText("37%");
      // "why it skipped": the largest reason first
      await expect(page.getByTestId("by-reason").locator("tbody tr").first())
        .toContainText("tick · ok");
      await expect(page.getByTestId("by-reason").locator("tbody tr").nth(1))
        .toContainText("skipped · below_threshold");
      await expect(page.getByTestId("shocks")).toContainText("goal");
      // competitions are named (2026-10-05), not printed as their keys
      await expect(page.getByTestId("learning-comps")).toContainText("Premier League");
      await expect(page.getByTestId("learning-comps")).toContainText("+0.81¢");
      await expect(page.getByTestId("refusals").locator("tbody tr").first())
        .toContainText("no_fair_price");
      await expect(page.getByTestId("ops-catalogue")).toContainText("14,552");
      await expect(page.getByTestId("ops-state")).toContainText("last updated");

      // held in React state only, and a reload forgets it
      const stored = await page.evaluate(() => JSON.stringify({
        l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie,
      }));
      expect(stored).not.toContain(TOKEN);
      expect((await page.context().cookies()).map((c) => c.value))
        .not.toContain(TOKEN);
      const after = apiCalls(page);
      await page.reload();
      await expect(page.locator("#watch-token")).toHaveValue("");
      await page.waitForTimeout(1200);
      expect(after.filter((r) => r.url().includes("/api/ops/"))).toEqual([]);
      await expect(page.getByTestId("ops-console")).toHaveCount(0);
    });

  test("a payload without a learning block skips that section",
    async ({ page }) => {
      const { learning: _drop, ...older } = PAYLOAD;
      void _drop;
      await serve(page, 200, older);
      await page.goto("/ops/trading");
      await page.locator("#watch-token").fill(TOKEN);
      await expect(page.getByTestId("ops-money")).toBeVisible();
      await expect(page.getByTestId("ops-learning")).toHaveCount(0);
      await expect(page.getByTestId("ops-strip"))
        .toContainText("not on this backend");
    });

  test("the halt meters fill on a loss and stay empty on a gain",
    async ({ page }) => {
      // the backend's day_loss / drawdown are NEGATIVE after a settled win
      // (risk.py halt_loss): a gain spends none of the limit
      await serve(page, 200, { ...PAYLOAD,
        daily_loss: { used: "-6.00", limit: "10" },
        drawdown: { used: "12.00", limit: "15" } });
      await page.goto("/ops/trading");
      await page.locator("#watch-token").fill(TOKEN);
      const daily = page.getByTestId("meter-daily");
      await expect(daily).toContainText("+$6.00 up");
      await expect(daily).toContainText("0%");
      await expect(daily.locator("div.h-full")).toHaveAttribute(
        "style", /width: 0%/);
      const dd = page.getByTestId("meter-drawdown");
      await expect(dd).toContainText("$12.00");
      await expect(dd).toContainText("80%");
      await expect(dd.locator("div.h-full")).toHaveClass(/bg-neg/);
    });

  test("a 403 reads as a rejected token", async ({ page }) => {
    await serve(page, 403, { detail: "operator credentials required" });
    await page.goto("/ops/trading");
    await page.locator("#watch-token").fill("wrong-token");
    await expect(page.getByTestId("ops-refused")).toContainText("token rejected");
    await expect(page.getByTestId("ops-console")).toHaveCount(0);
  });

  test("a 503 through the real proxy reads as the plane not ready",
    async ({ page, request }) => {
      // NOT MOCKED: the app's own route relays the stand-in's 503
      const started = new Date().toISOString();
      const calls = apiCalls(page);
      await page.goto("/ops/trading");
      await page.locator("#watch-token").fill(TOKEN);
      await expect(page.getByTestId("ops-not-ready"))
        .toContainText("trading plane not ready");
      const log = await (await request.get(`${STANDIN_URL}/__standin/log`))
        .json() as { requests: { at: string; method: string; url: string }[] };
      // only the STATUS path is counted off the shared stand-in: other
      // workers' pages read /api/admin/trading/book through it in parallel
      const hits = log.requests.filter((e) => e.at >= started
        && e.url.startsWith("/api/admin/trading/status"));
      expect(hits.map((e) => `${e.method} ${e.url}`))
        .toEqual(["GET /api/admin/trading/status"]);
      // a plane that is not ready is not asked for its book or its
      // candidates — read off this page's own requests, which no other
      // worker shares
      expect(calls.map((r) => new URL(r.url()).pathname))
        .not.toContain("/api/ops/trading-book");
      expect(calls.map((r) => new URL(r.url()).pathname))
        .not.toContain("/api/ops/trading-candidates");
    });

  test("the route is a read: other verbs are 405, and nothing is cached",
    async ({ request }) => {
      const post = await request.post("/api/ops/trading-status");
      expect(post.status()).toBe(405);
      expect(post.headers()["cache-control"]).toBe("private, no-store");
      const get = await request.get("/api/ops/trading-status");
      expect(get.headers()["cache-control"]).toBe("private, no-store");
    });
});

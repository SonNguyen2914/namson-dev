import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import {
  BOOK_RECORDED, CANDIDATES_RECORDED, STATUS_RECORDED,
} from "./trading-console-recorded";
import { FOCUS_COMPETITIONS } from "../src/lib/tradingConsole";
import { parseCarefulBody } from "../src/pages/api/ops/trading-careful";

// THE CAREFUL STRATEGY ON THE CONSOLE (2026-10-06, Son's decisions;
// backend src/trading/careful.py, docs/TRADING-AGENT.md §38).
//
// THE CONTRACT, as release-careful serves it on the status route:
//
//   daily_budget   used / remaining / limit, realised (NET), open_positions,
//                  resting_orders, trading_day, trading_day_tz
//   careful        enabled, competitions {slug: {on}}, tick {funded,
//                  qualifying, swaps, data_errors, usage {hour, hour_max}},
//                  situations {k: {paper_n, paper_x_c, real_n, real_x_c,
//                  real_pnl_c, disagreement}}, grounds_paper / grounds_real
//                  {g: {n, matches, mean, lo, hi}}, promoted, probation,
//                  events
//
// Checked: the budget and its parts; the per-kickoff-hour usage against
// $12; probable data errors counted; every one of the eleven competitions
// a switch, derived from the registry, its POST rebuilt by the proxy; a
// disagreement flagged; a backend without the block reads "not served
// yet". Fully mocked with page.route; no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const SWITCH = "**/api/ops/trading-careful";
const TOKEN = "ops-careful-token-typed-by-a-person";

type Obj = Record<string, unknown>;
const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const CAREFUL: Obj = {
  enabled: true, version: "careful-v1", label: "experimental, unproven",
  competitions: Object.fromEntries(FOCUS_COMPETITIONS.map((c) =>
    [c, { on: c !== "mls" }])),
  competitions_count: 11, promoted: [], probation: [],
  tick: { funded: 2, qualifying: 5, swaps: 1, data_errors: 3,
    usage: { hour: { "2026-10-10T19:00:00+00:00": "7.46" }, hour_max: "12" } },
  situations: {
    "epl|GAME|90-30": { paper_n: 40, paper_x_c: 1.2, real_n: 22,
      real_x_c: 0.8, real_settled_n: 22, real_pnl_c: -310, disagreement: true },
  },
  grounds_paper: { "family:SPREAD": { n: 150, matches: 21, mean: 0.9,
    lo: 0.2, hi: 1.6 } },
  grounds_real: {},
  events: [{ at: "2026-10-10T18:00:00+00:00", reason: "promotion_check",
    ground: "family:SPREAD", milestone: 150, proposed: true }],
};
const BUDGET: Obj = { used: "6.20", remaining: "13.80", limit: "20",
  realised: "-2.00", open_positions: "5.40", resting_orders: "2.80",
  trading_day: "2026-10-10", trading_day_tz: "America/Los_Angeles" };
const SERVED: Obj = { ...STATUS_RECORDED, careful: CAREFUL, daily_budget: BUDGET };

async function openConsole(page: Page, status: unknown) {
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-careful")).toBeVisible();
}

test.describe("the careful strategy on the console", () => {
  test("the budget: used, remaining, $20, its NET parts and the LA day",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const b = page.getByTestId("careful-budget");
      await expect(b).toContainText("$6.20 / $20.00");
      await expect(b).toContainText("$13.80");
      await expect(b).toContainText("−$2.00 · $5.40 · $2.80");
      await expect(b).toContainText("America/Los_Angeles");
    });

  test("per kickoff hour against $12, and edges above 8c counted",
    async ({ page }) => {
      await openConsole(page, SERVED);
      await expect(page.getByTestId("careful-hours")).toContainText("$7.46 / $12.00");
      const t = page.getByTestId("careful-tick");
      await expect(t).toContainText("2 / 5");
      await expect(t).toContainText("probable data errors");
      await expect(t).toContainText("3");
    });

  test("every one of the eleven is a switch; off posts a rebuilt body",
    async ({ page }) => {
      const sent: unknown[] = [];
      await page.route(SWITCH, async (r) => {
        sent.push(JSON.parse(r.request().postData() ?? "null"));
        await r.fulfill(json(200, { ok: true }));
      });
      await openConsole(page, SERVED);
      const sw = page.getByTestId("careful-comp");
      await expect(sw).toHaveCount(11);
      await expect(page.locator('[data-testid="careful-comp"][data-competition="mls"]'))
        .toHaveAttribute("data-on", "false");
      const epl = page.locator('[data-testid="careful-comp"][data-competition="epl"]');
      await expect(epl).toHaveAttribute("data-on", "true");
      await epl.click();
      await expect(epl).toHaveAttribute("data-on", "false");
      expect(sent).toEqual([{ op: "competition_off", competition: "epl" }]);
      await expect(page.getByTestId("careful-said")).toContainText("paper only");
    });

  test("a disagreement (CLV good, money losing) is flagged; a proposal is said",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const row = page.getByTestId("careful-situation");
      await expect(row).toHaveAttribute("data-flag", "true");
      await expect(row).toContainText("CLV and money disagree");
      await expect(page.getByTestId("careful-events")).toContainText("PROPOSED (Son decides)");
      await expect(page.getByTestId("careful-grounds")).toContainText("family:SPREAD");
    });

  test("a backend without the careful block says so, never zeros",
    async ({ page }) => {
      await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_RECORDED)));
      await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
      await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
      await page.goto("/ops/trading");
      await hydrated(page);
      await page.locator("#watch-token").fill(TOKEN);
      await expect(page.getByTestId("careful-absent")).toContainText("not served yet");
    });

  test("the proxy rebuilds the body and refuses anything else", () => {
    expect(parseCarefulBody({ op: "competition_off", competition: "epl" }))
      .toEqual({ ok: true, payload: { op: "competition_off", competition: "epl" } });
    expect(parseCarefulBody({ op: "promote", ground: "family:SPREAD" }))
      .toEqual({ ok: true, payload: { op: "promote", ground: "family:SPREAD" } });
    expect(parseCarefulBody({ op: "kill" }).ok).toBe(false);
    expect(parseCarefulBody({ op: "competition_off", competition: "epl", x: 1 }).ok)
      .toBe(false);
    expect(parseCarefulBody({ op: "competition_on", competition: "EPL; drop" }).ok)
      .toBe(false);
  });
});

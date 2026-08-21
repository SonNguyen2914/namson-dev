import { expect, test } from "@playwright/test";

import { maxContractsForStake, orderCostDollars, orderFeeDollars,
  unitFeeDollars } from "../src/lib/fee";

// The EPL match hub's scenario engine, pinned to the backend's CANONICAL
// fee policy (src/live/paper.py `order_fee_dollars` / `FEE_POLICY`):
//
//     fee = ceil_to_centicent(0.07 * C * P * (1 - P))
//
// charged ONCE on the whole order, in exact arithmetic. The page applied
// 0.07*P*(1-P) per contract in binary floating point, which disagrees
// with the policy on both counts.
//
// Hermetic: every request is a recorded payload, no backend involved.
//
// Honest note on what each test can prove. The old per-contract fee is
// the canonical one MINUS the ceiling, so the two disagree by at most
// one centicent ($0.0001) — below the page's own two-decimal display
// precision. No UI-level assertion on a rendered dollar figure can
// therefore discriminate them, and pretending otherwise would be a test
// that passes for the wrong reason. The VALUE guard lives at module
// level (first test) and is red against a float implementation; the UI
// tests assert that the page is wired to the module and states the
// policy it actually applies.

const EVENT = "401879301";

const MATCH_PAYLOAD = {
  match: {
    id: EVENT,
    date: new Date(Date.now() + 86_400_000).toISOString(),
    state: "pre",
    detail: "Scheduled",
    venue: "Emirates Stadium",
    home: { name: "Arsenal", abbrev: "ARS" },
    away: { name: "Manchester United", abbrev: "MAN" },
    stats: [],
    events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: {
    event_ticker: "KXEPLGAME-26AUG22ARSMUN",
    title: "Arsenal vs Man Utd",
    markets: [
      { ticker: "KXEPLGAME-26AUG22ARSMUN-ARS", label: "Arsenal",
        yes_ask: "0.10", yes_bid: "0.09", status: "active" },
    ],
  },
  books: [],
  book_match: { status: "mapped",
                candidates: ["KXEPLGAME-26AUG22ARSMUN"],
                loose_candidates: [] },
  model: null,
  lineups: null,
  generated_at: new Date().toISOString(),
};

test.describe("EPL scenario fee policy", () => {
  test("the fee module reproduces the backend's canonical values",
    () => {
      // the backend's own worked example (tests/test_mls_shadow.py):
      // 100 @ $0.10 is 63.00c EXACTLY, not 64c. In IEEE-754
      // 0.07*100*0.10*0.90 is 0.6300000000000001, so a naive ceil to the
      // centicent bills 63.01c — this is why the module is integer-based.
      expect(orderFeeDollars(0.10, 100)).toBeCloseTo(0.63, 10);
      expect(Math.ceil(0.07 * 100 * 0.10 * 0.90 * 10000) / 10000)
        .toBeGreaterThan(0.63);           // the trap, demonstrated
      // ceiling actually applied where the raw value is fractional:
      // 100 @ $0.3333 is 1.55547777... which the venue bills as $1.5555
      expect(orderFeeDollars(0.3333, 1)).toBeCloseTo(0.0156, 10);
      expect(orderFeeDollars(0.3333, 100)).toBeCloseTo(1.5555, 10);
      expect(0.07 * 100 * 0.3333 * (1 - 0.3333))
        .toBeLessThan(orderFeeDollars(0.3333, 100));   // no-ceiling gap
      // guards match the backend's
      expect(orderFeeDollars(0, 100)).toBe(0);
      expect(orderFeeDollars(1, 100)).toBe(0);
      expect(orderFeeDollars(0.5, 0)).toBe(0);
      // the whole-order cost, and the contract count it supports
      expect(orderCostDollars(0.10, 100)).toBeCloseTo(10.63, 10);
      expect(maxContractsForStake(0.10, 10.63)).toBe(100);
      expect(maxContractsForStake(0.10, 10.62)).toBe(99);
      // the per-contract gate fee stays UNQUANTIZED, as paper.py's
      // net-edge comparison requires
      expect(unitFeeDollars(0.10)).toBeCloseTo(0.0063, 12);
    });

  test("the scenario table buys the contracts the policy allows",
    async ({ page }) => {
      // CONTROL (passes both ways): $10.63 at a 10c ask is exactly 100
      // contracts — 100 x $0.10 plus the $0.63 whole-order fee — and the
      // linear float agrees at this price. It pins that the wiring is
      // live and produces the canonical numbers end to end.
      await page.route("**/api/card/**", (route) =>   // hermetic: the card fetch stays recorded too
        route.fulfill({ status: 404, contentType: "application/json",
                        body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
      await page.route(`**/api/epl/match/${EVENT}`, (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH_PAYLOAD) }));
      await page.goto(`/bet-suggester/epl/${EVENT}`);
      // the scenario engine ships collapsed
      await page.getByRole("button", { name: /betting strategy/i })
        .click();
      const cell = page.getByTestId(
        "scenario-contracts-KXEPLGAME-26AUG22ARSMUN-ARS");
      await expect(cell).toBeVisible();
      await page.locator('input[inputmode="decimal"]').first()
        .fill("10.63");
      await expect(cell).toContainText("100 ×");
      await expect(page.getByText(/total at risk \$10\.63/i))
        .toBeVisible();
    });

  test("the scenario states which fees are NOT modelled",
    async ({ page }) => {
      await page.route("**/api/card/**", (route) =>   // hermetic: the card fetch stays recorded too
        route.fulfill({ status: 404, contentType: "application/json",
                        body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
      await page.route(`**/api/epl/match/${EVENT}`, (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH_PAYLOAD) }));
      await page.goto(`/bet-suggester/epl/${EVENT}`);
      // the scenario engine ships collapsed
      await page.getByRole("button", { name: /betting strategy/i })
        .click();
      await expect(page.getByText(/general taker only/i)).toBeVisible();
      await expect(page.getByText(/ceil-to-centicent/i)).toBeVisible();
    });
});

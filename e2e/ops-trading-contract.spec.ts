import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import {
  BOOK_RECORDED, CANDIDATES_RECORDED, STATUS_RECORDED,
} from "./trading-console-recorded";

// THE CONSOLE READS WHAT THE INTEGRATED BACKEND SENDS (2026-10-05).
//
// The candidates table, the live value and the status fields were built
// side by side with the backend routes (T6b beside T6a), each against a
// written contract. These tests serve the payloads RECORDED from the
// integrated backend (e2e/trading-console-recorded.ts) exactly as sent, so
// a field this page reads under another name or type fails here:
//
//   - `by_competition[c].in_scope` is a BOOLEAN: the competition table
//     says "yes" / "no", never a dash (it read the field as a count);
//   - `assessed` is its own column;
//   - `omitted` counts every market not in the snapshot, mostly BY DESIGN
//     (far-off kickoffs, not trading): only `row_bound` / `size_bound`
//     say the snapshot was cut to its bound, and only they are a warning;
//   - an in-play row says what its engine number started from: the
//     in-play ANCHOR, w on our (unvalidated) pre-match forecast and its
//     source;
//   - the status page draws the anchor's arms in use, its reward, and the
//     ratings model's share — said to be unvalidated;
//   - the book draws a recorded position's live value.
//
// Fully mocked with page.route; no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const TOKEN = "ops-contract-token-typed-by-a-person";

const PLACED = "KXBUNDESLIGAGAME-26NOV04BMUBVB-BMU";
const STALE_LEG = "KXBUNDESLIGAGAME-26NOV04BMUBVB-BVB";
const HELD = "KXEPLGAME-26NOV04ARSCHE-ARS";

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

async function openConsole(page: Page, candidates: unknown) {
  await page.route(STATUS, (r) => r.fulfill(json(200, STATUS_RECORDED)));
  await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, candidates)));
  await page.goto("/ops/trading");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-candidates")).toBeVisible();
  await expect(page.getByTestId("cand-row").first()).toBeVisible();
}

const row = (page: Page, ticker: string) =>
  page.locator(`[data-testid="cand-row"][data-ticker="${ticker}"]`);
const compRow = (page: Page, comp: string) =>
  page.locator(`[data-testid="cand-by-comp-row"][data-comp="${comp}"]`);

/** the recorded payload with `omitted` replaced */
const withOmitted = (omitted: Record<string, number>) =>
  ({ ...CANDIDATES_RECORDED, omitted });

test.describe("the console reads the integrated backend's payloads", () => {
  test("the competition table reads in_scope as a yes/no and shows what "
    + "was assessed", async ({ page }) => {
      await openConsole(page, CANDIDATES_RECORDED);
      const bund = compRow(page, "bundesliga");
      await expect(bund.getByTestId("cand-by-comp-in-scope")).toHaveText("yes");
      // assessed 3, eligible 0, in play 3, decided 3, model-priced 0,
      // placed 1, in this snapshot 3 — as recorded
      await expect(bund.locator("td")).toHaveText(
        [/Bundesliga/, "yes", "3", "0", "3", "3", "0", "1", "3"]);
      // every focus competition is a row, and each says yes or no
      await expect(page.getByTestId("cand-by-comp-row")).toHaveCount(11);
      for (const cell of await page.getByTestId("cand-by-comp-in-scope").all()) {
        await expect(cell).toHaveText(/^(yes|no)$/);
      }
    });

  test("markets left out by design are said in neutral words; only a cut "
    + "to the bound is a warning", async ({ page }) => {
      await openConsole(page, withOmitted(
        { outside_window: 120, market_not_trading: 40 }));
      const summary = page.getByTestId("cand-summary");
      await expect(page.getByTestId("cand-truncated")).toHaveCount(0);
      await expect(summary).not.toContainText("cut to its bound");
      await expect(page.getByTestId("cand-not-shown")).toHaveText(
        "· 160 not shown by design (outside_window 120, market_not_trading 40)");
    });

  test("a cut to the snapshot's bound is still a warning", async ({ page }) => {
    await openConsole(page, withOmitted(
      { row_bound: 5, outside_window: 120 }));
    await expect(page.getByTestId("cand-truncated")).toContainText(
      "snapshot cut to its bound — 5 left out (row_bound 5)");
    await expect(page.getByTestId("cand-not-shown")).toContainText(
      "120 not shown by design (outside_window 120)");
  });

  test("an in-play row says what its engine number started from: the "
    + "anchor's weight on our forecast and its source", async ({ page }) => {
      await openConsole(page, CANDIDATES_RECORDED);
      const placed = row(page, PLACED);
      await expect(placed).toHaveAttribute("data-decision", "placed");
      await expect(placed).toContainText("in play 38′");
      await expect(placed).toContainText("engine 39.0%");
      await expect(placed.getByTestId("cand-anchor")).toHaveText(
        "anchor w 0.50 · ratings model, club (unvalidated)");
      // a leg whose decision carried no anchor draws none — not "w 0"
      await expect(row(page, STALE_LEG).getByTestId("cand-anchor"))
        .toHaveCount(0);
    });

  test("the status page draws the anchor's arms and reward and the ratings "
    + "model's share, said to be unvalidated", async ({ page }) => {
      await openConsole(page, CANDIDATES_RECORDED);
      const arms = page.getByTestId("inplay-v2-arms");
      await expect(arms).toContainText("anchor · Bundesliga");
      await expect(arms).toContainText("0.5 (ratings_club)");
      await expect(arms).toContainText("entry · Bundesliga");
      await expect(page.getByTestId("inplay-v2"))
        .toContainText("mean anchor reward");
      const learning = page.getByTestId("ops-learning");
      await expect(learning).toContainText("ratings model · unvalidated");
      await expect(learning).toContainText("ratings-poisson-v1");
    });

  test("the book draws the recorded position's live value", async ({ page }) => {
    await openConsole(page, CANDIDATES_RECORDED);
    const p = page.locator(`[data-testid="book-position"][data-ticker="${HELD}"]`);
    await expect(p.getByTestId("book-live-mark")).toHaveText("50¢");
    await expect(p.getByTestId("book-live-value")).toHaveText("$4.82");
    await expect(p.getByTestId("book-unrealised")).toHaveText("+$0.82");
    await expect(p.getByTestId("book-mark-source")).toHaveText("live feed");
  });
});

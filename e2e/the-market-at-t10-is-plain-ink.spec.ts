import { expect, test, type Page } from "@playwright/test";
import { openDetails } from "./review-details";

/* THE MARKET SIDE OF A FINISHED CARD (Son, 2026-10-01).
 *
 * The review card shows the book the match archive froze at the T-10
 * lock: all three legs in cents (ask and mid), the price clock and the
 * overround, and the market's favourite named BESIDE the picker's. In
 * plain ink — never coloured as a verdict.
 *
 * Every payload here is SYNTHETIC and MOCKED with `page.route`: invented
 * clubs, invented prices, kickoffs on or before 2026-09-27. Nothing
 * reaches a backend.
 *
 * What this pins:
 *   - present: three legs, ask and mid, the clock, the overround, both
 *     favourites by name;
 *   - absent: the backend's own note, never a blank;
 *   - no block at all (an older backend): named, and the card still draws;
 *   - a three-way tie names no favourite;
 *   - none of it is coloured, and none of it uses advice words;
 *   - 375 and 1280 wide, no horizontal scroll. */

const HOME = "Synthetic Athletic Football Club of Long Name";
const AWAY = "Placeholder Rovers";

const state = {
  refused: false, league: "ucl", home: HOME, away: AWAY,
  favourite: AWAY, opponent: HOME, fav_side: "away",
  resolution: {}, ppg_gap: 0.4, gdg_gap: 0.6, rank_gap: 3,
  gp_current: { home: 5, away: 5, min: 5 },
  cross_league: false, fav_source: "field",
  tiers: { ovr: [1, 2], atk: [1, 2], def: [2, 3] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "SPLIT",
  form: { fav: null, opp: null, scope: "Champions League",
          scope_is_cup: true },
  src: "current", weights: null, kalshi: null, venue: null,
  venue_class: null,
  current_only: { gdg_gap: null, ppg_gap: null, rank_gap: null },
  gap_note: null, reg_time_note: null,
  table_notes: { home: null, away: null },
  ranks: { fav: 2, opp: 5 }, refused_reason: null,
};

const leg = (label: string, ask: number | null, mid: number | null) =>
  ({ label, ticker: `SYNTH-${label}`, ask_c: ask, mid_c: mid,
     bid_c: mid == null || ask == null ? null : 2 * mid - ask });

const present = (over: Record<string, unknown> = {}) => ({
  status: "present", absent_reason: null, absent_detail: null,
  absent_note: null, source: "match_archive.prematch.t10", rung: "t10",
  captured_at: "2026-09-20T18:50:00+00:00", seconds_before_kickoff: 600,
  price_clock: { quotes_captured_at: "2026-09-20T18:50:04+00:00",
                 seconds_before_kickoff: 596,
                 basis: "archive clock when the book was read" },
  event_ticker: "SYNTH-26SEP20",
  legs: { home: leg(HOME, 54, 53), draw: leg("Draw", 26, 25),
          away: leg(AWAY, 25, 24.5) },
  ask_sum_c: 105, mid_sum_c: 102.5, overround_c: 5, overround_reason: null,
  market_favourite: { side: "home", label: HOME, basis: "mid", price_c: 53,
                      tie: false, tied_sides: [], reason: null },
  picker_favourite: { side: "away", label: AWAY },
  ...over,
});

const absent = {
  status: "absent", absent_reason: "no_t10_book",
  absent_detail: "no_event_for_fixture", absent_note: "no T-10 book stored",
  source: "match_archive.prematch.t10", rung: "t10",
  captured_at: null, seconds_before_kickoff: null, price_clock: null,
  event_ticker: null, legs: null, ask_sum_c: null, mid_sum_c: null,
  overround_c: null, overround_reason: null, market_favourite: null,
  picker_favourite: { side: "away", label: AWAY },
};

/** One finished row; `market` undefined means the KEY IS ABSENT. */
const finished = (market?: unknown) => ({
  league: "ucl", espn: "uefa.champions", kind: "cup",
  event_id: "900001", competition_id: "900001",
  kickoff: "2026-09-20T19:00Z", status_detail: "FT", home: HOME, away: AWAY,
  result: { home: 1, away: 1, winner: "draw", source: "espn_scoreboard" },
  shot_state: { at_20: null, full_time: null, before_first_goal: null,
                first_goal_minute: null, error: null },
  fit: { favourite_won: false, confirmed_at_20: null,
         favourite_won_reason: "winner=draw fav_side=away",
         confirm_reason: "no_shot_state", checkpoint_minute: 20,
         confirm_note: "EXPLORATORY" },
  pre_kickoff: {
    origin: "captured", origin_label: "CAPTURED",
    origin_note: "frozen from the live board before kickoff",
    captured_at: "2026-09-19T18:00:00Z",
    captured_seconds_before_kickoff: 90000,
    board_date: "20260919", reconstructed_from: null,
    unavailable_reason: null, store_read: "ok", store_read_error: null,
    superseded: [], corrections: 0, state,
  },
  ...(market === undefined ? {} : { market_t10: market }),
});

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b) });

async function open(page: Page, rows: unknown[]) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(
    { generated_at: "x", date: "20260921", days: 7, leagues: { ucl: {} },
      rows: [], refusals: [], off_board: [], off_board_counts: {},
      folded: {}, narrowed_to: ["ucl"] })));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ competition: "ucl", axes: null, why_not: "n/a" })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(
    { generated_at: "x", date: "20260921", back: 7,
      window: { from: "20260914", to: "20260921" }, store: {},
      leagues: { ucl: { finished: rows.length, captured: rows.length,
                        reconstructed: 0, unavailable: 0, error: null,
                        kind: "cup", pre_kickoff_limit: null } },
      finished: rows, refusals: [], narrowed_to: ["ucl"] })));
  // the tail opens closed by default; seed the key it reads (see
  // the-capture-names-its-rule.spec.ts for why seeding beats clicking)
  await page.addInitScript(() => {
    try { window.localStorage.setItem("picker.reviewopen.ucl", "1"); } catch {}
  });
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("review-row")).toHaveCount(rows.length);
}

const market = (page: Page) =>
  page.getByTestId("review-row").first().getByTestId("market-t10");

/* A VERDICT COLOUR IS ANY OF THE SITE'S SIGNAL HUES. The line is drawn in
   the ink scale only. */
const VERDICT_INK = ["pos", "neg", "warn", "accent", "live", "skylive",
                     "gold", "green", "red", "emerald", "rose", "amber"];

async function assertPlainInk(page: Page) {
  const classes = await market(page).evaluate((el) =>
    [el, ...Array.from(el.querySelectorAll("*"))]
      .map((n) => n.getAttribute("class") ?? "").join(" "));
  for (const hue of VERDICT_INK) {
    expect(classes, `market line uses ${hue}`).not.toMatch(
      new RegExp(`(?:^|\\s)(?:text|bg|border)-${hue}(?:[\\s/-]|$)`));
  }
}

async function assertNoAdviceWords(page: Page) {
  const text = (await market(page).innerText()).toLowerCase();
  expect(text).not.toMatch(/\b(buy|sell|edge|bet|bets|value|take)\b/);
}

async function assertNoHorizontalScroll(page: Page) {
  const over = await page.evaluate(() =>
    document.documentElement.scrollWidth
      - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
}

test("present: three legs in cents, the clock, the overround, both "
   + "favourites by name, plain ink", async ({ page }) => {
  await open(page, [finished(present())]);
  const m = market(page);
  await expect(m).toHaveAttribute("data-status", "present");
  const legs = m.getByTestId("market-t10-leg");
  await expect(legs).toHaveCount(3);
  await expect(legs.nth(0)).toContainText(HOME);
  await expect(legs.nth(0)).toContainText("ask 54¢ · mid 53¢");
  await expect(legs.nth(1)).toContainText("Draw");
  await expect(legs.nth(1)).toContainText("ask 26¢ · mid 25¢");
  await expect(legs.nth(2)).toContainText("ask 25¢ · mid 24.5¢");
  await expect(m.getByTestId("market-t10-clock"))
    .toContainText("9m before kickoff");
  await expect(m.getByTestId("market-t10-overround"))
    .toContainText("overround +5¢ (asks sum 105¢)");
  await expect(m.getByTestId("market-t10-fav")).toContainText(
    `market favourite: ${HOME}`);
  await expect(m.getByTestId("market-t10-picker-fav")).toContainText(AWAY);
  await assertPlainInk(page);
  await assertNoAdviceWords(page);
});

test("absent: the backend's own note is printed, never a blank",
  async ({ page }) => {
    await open(page, [finished(absent)]);
    const m = market(page);
    await expect(m).toHaveAttribute("data-status", "absent");
    await expect(m).toHaveAttribute("data-reason", "no_t10_book");
    await expect(m.getByTestId("market-t10-absent"))
      .toHaveText("no T-10 book stored");
    await expect(m.getByTestId("market-t10-leg")).toHaveCount(0);
    await assertPlainInk(page);
  });

test("no block at all: named, and the card still draws", async ({ page }) => {
  await open(page, [finished(undefined)]);
  await expect(page.getByTestId("review-card-error")).toHaveCount(0);
  const m = market(page);
  await expect(m).toHaveAttribute("data-status", "missing");
  await expect(m).toContainText(/not in this payload/);
  // the rest of the card is untouched
  await expect(page.getByTestId("review-row").first()
    .getByTestId("review-score")).toContainText("1–1");
});

test("a malformed block costs the line, not the page", async ({ page }) => {
  /* `present` with its legs missing and a null favourite: the line falls
     back to the absent branch rather than dereferencing. */
  await open(page, [finished(present({ legs: null, market_favourite: null,
                                        price_clock: null }))]);
  await expect(page.getByTestId("review-card-error")).toHaveCount(0);
  await expect(market(page)).toHaveAttribute("data-status", "absent");
});

test("a three-way tie names no favourite", async ({ page }) => {
  await open(page, [finished(present({
    legs: { home: leg(HOME, 34, 33), draw: leg("Draw", 34, 33),
            away: leg(AWAY, 34, 33) },
    ask_sum_c: 102, mid_sum_c: 99, overround_c: 2,
    market_favourite: { side: null, label: null, basis: "mid", price_c: 33,
                        tie: true, tied_sides: ["home", "draw", "away"],
                        reason: "tie_at_top" },
  }))]);
  const fav = market(page).getByTestId("market-t10-fav");
  await expect(fav).toContainText("none — three-way tie at 33¢");
  // and it does not quietly name the first leg
  await expect(fav).not.toContainText(`market favourite: ${HOME}`);
  await assertPlainInk(page);
});

for (const width of [375, 1280]) {
  test(`${width} wide: the line fits, no horizontal scroll`,
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, [finished(present()), finished(absent),
                        finished(undefined)]);
      await expect(page.getByTestId("market-t10")).toHaveCount(3);
      await openDetails(page);
      await expect(market(page)).toBeVisible();
      await assertNoHorizontalScroll(page);
      const box = await market(page).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    });
}

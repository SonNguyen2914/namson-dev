import { expect, test, type Page } from "@playwright/test";

/* A LIVE MINUTE HAS AN AGE (audit W8-FE-01, 2026-11-15).
 *
 * The /trivela board was read once per mount. An in-play row printed the
 * minute it was first drawn with — "LIVE 45'+5'" — for as long as the
 * tab stayed open, with nothing saying when that minute was read, while
 * the board itself may be served minutes old by the edge and the
 * backend's own cache. A tab left open read as a match still at 45'
 * long after it had ended.
 *
 * Two claims, both made against the built app with the page clock
 * driven, both counting rather than reading a flag:
 *
 *   1. past CLOCK_STALE_AFTER_MS the kickoff cell says when its minute
 *      was read ("· as of 1:15 PM", LA time), and a fresh minute does not;
 *   2. while a row is in play the board is asked again on its own clock
 *      — never while the tab is hidden, never when nothing is in play,
 *      and a refresh that fails keeps the board on screen (audit C-19).
 *
 * Hermetic: the board and the review are served from here.
 */

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const LEAGUES = {
  epl: { src: "current", min_current_gp: 12, clubs: 20 },
  laliga: { src: "current", min_current_gp: 12, clubs: 20 },
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
  ligamx: { src: "current", min_current_gp: 12, clubs: 18 },
};

/** 13:15:18 in Los Angeles, the site's zone (lib/matchday.TZ). */
const CAPTURED = "2026-12-10T21:15:18Z";
const CAPTURED_MS = Date.parse(CAPTURED);

function row(over: Record<string, unknown> = {}) {
  return {
    refused: false, league: "ligamx",
    home: "Leon", away: "Atletico de San Luis",
    favourite: "Leon", opponent: "Atletico de San Luis",
    fav_side: "home",
    resolution: { Leon: "exact", "Atletico de San Luis": "exact" },
    ppg_gap: 0.9, gdg_gap: 1.4, rank_gap: 8,
    gp_current: { home: 12, away: 12, min: 12 },
    venue_class: { class: "DOMESTIC", home_side: "home" },
    src: "current", ranks: { fav: 2, opp: 10 },
    tiers: { ovr: [1, 4], atk: [1, 4], def: [2, 4] },
    tier_gaps: { ovr: 3, atk: 3, def: 2 },
    shape: "CLEAN",
    event_id: "401882950", competition_id: "401882950",
    kickoff: "2026-12-10T20:30:00Z", espn: "mex.1", kalshi: null,
    state: "pre", in_play: false,
    ...over,
  };
}

const LIVE_ROW = row({
  state: "in", in_play: true,
  live: {
    in_play: true, read_at: "2026-12-10T21:16:00Z", window_seconds: 600,
    row_age_seconds: 42.0,
    clock: {
      minute: 45, clock_display: "45'+5'", score_home: 2, score_away: 1,
      status_detail: "HT", period: "stopped",
      period_basis: "the tape's status detail is 'HT'", match_state: "in",
      captured_at: CAPTURED,
    },
    absent: null,
    basis: "WHERE THE MATCH IS, off the live plane's state tape.",
  },
});

const PRE_ROW = row({
  event_id: "401882951", home: "Toluca", away: "Pumas UNAM",
  favourite: "Toluca", opponent: "Pumas UNAM",
  resolution: { Toluca: "exact", "Pumas UNAM": "exact" },
  gdg_gap: 0.6,
});

const BOARD = (rows: unknown[]) => ({
  generated_at: "2026-12-10T21:16:00Z", date: "20261210", days: 2,
  leagues: LEAGUES, rows, refusals: [], folded: {},
  off_board: [], off_board_counts: {},
});

const REVIEW = {
  generated_at: "2026-12-10T21:16:00Z", date: "20261210", back: 7,
  window: { from: "20261203", to: "20261210" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

/** Serve the board (each answer from `answer`, by ask number) and count
 *  the asks. The page clock is installed at `at` before the page opens. */
async function open(page: Page, at: number,
  answer: (n: number) => ReturnType<typeof json>) {
  const asks = { n: 0 };
  await page.route("**/api/picker/board**", (r) => {
    asks.n += 1;
    return r.fulfill(answer(asks.n));
  });
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json({ detail: "no token" }, 401)));
  await page.clock.install({ time: at });
  await page.goto("/trivela");
  await page.getByTestId("picker-row").first().waitFor({ timeout: 15_000 });
  return asks;
}

async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((h) => {
    Object.defineProperty(document, "visibilityState",
      { configurable: true, get: () => (h ? "hidden" : "visible") });
    Object.defineProperty(document, "hidden",
      { configurable: true, get: () => h });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

/** Move the page clock on `ms`, letting any read that falls due land. */
async function advance(page: Page, ms: number) {
  for (let left = ms; left > 0; left -= 15_000) {
    await page.clock.runFor(Math.min(15_000, left));
    await page.waitForTimeout(50);
  }
}

const liveCell = (page: Page) =>
  page.locator('[data-testid="picker-row"][data-event="401882950"]')
    .getByTestId("row-kickoff");

// ============================================== 1. the minute's age

test("a minute read ten minutes ago says when it was read",
  async ({ page }) => {
    await open(page, CAPTURED_MS + 10 * 60_000,
      () => json(BOARD([LIVE_ROW, PRE_ROW])));
    const cell = liveCell(page);
    await expect(cell.getByTestId("row-clock")).toHaveText("45'+5'");
    const asOf = cell.getByTestId("row-clock-asof");
    await expect(asOf).toBeVisible();
    // the read time, in the site's zone — 21:15Z is 1:15 PM in LA
    await expect(asOf).toHaveText(/as of 1:15\s?PM/);
    await expect(asOf).toHaveClass(/text-warn/);
  });

test("a fresh minute carries no age", async ({ page }) => {
  // CONTROL: the same row, read one minute ago
  await open(page, CAPTURED_MS + 60_000,
    () => json(BOARD([LIVE_ROW, PRE_ROW])));
  const cell = liveCell(page);
  await expect(cell.getByTestId("row-clock")).toHaveText("45'+5'");
  await expect(cell.getByTestId("row-clock-asof")).toHaveCount(0);
});

// ================================== 2. an in-play board is asked again

test("while a match is in play the board is asked again — and not while "
  + "the tab is hidden", async ({ page }) => {
    const asks = await open(page, CAPTURED_MS + 60_000,
      () => json(BOARD([LIVE_ROW, PRE_ROW])));
    expect(asks.n).toBe(1);
    // the minute moves on: the board is re-read on its own clock
    await advance(page, 90_000);
    await expect.poll(() => asks.n).toBe(2);
    // …but never as a herd: a minute and a half more is one more read
    await advance(page, 90_000);
    expect(asks.n).toBeLessThanOrEqual(3);

    const before = asks.n;
    await setHidden(page, true);
    await advance(page, 600_000);
    expect(asks.n, "a hidden tab kept re-reading the board").toBe(before);
    // the read that fell due while hidden is made on return
    await setHidden(page, false);
    await expect.poll(() => asks.n).toBe(before + 1);
  });

test("a board with nothing in play is not asked again", async ({ page }) => {
  // CONTROL: without it a page that simply polled everything would pass
  const asks = await open(page, CAPTURED_MS + 60_000,
    () => json(BOARD([PRE_ROW])));
  await advance(page, 300_000);
  expect(asks.n).toBe(1);
});

test("a re-read that fails keeps the live board on screen, said",
  async ({ page }) => {
    const asks = await open(page, CAPTURED_MS + 60_000, (n) => n === 1
      ? json(BOARD([LIVE_ROW, PRE_ROW]))
      : json({ detail: "the board is being rebuilt" }, 503));
    await advance(page, 90_000);
    await expect.poll(() => asks.n).toBeGreaterThanOrEqual(2);
    await expect(page.getByTestId("board-stale")).toBeVisible();
    await expect(liveCell(page).getByTestId("row-clock")).toHaveText("45'+5'");
    await expect(page.getByTestId("board-error")).toHaveCount(0);
  });

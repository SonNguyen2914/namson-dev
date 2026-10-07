import { expect, test, type Page, type Request } from "@playwright/test";
import { hydrated, view } from "./operator-console";

// LIVE VALUE AND THE REST OF THE STATUS ON THE CONSOLE (2026-10-05).
//
// Son, 2026-10-04: the console should show the ACTUAL fluctuating value
// of in-play positions, not the fixed cost; the halts keep his "in play at
// cost" rule. And the status route's in-play v2, learning, hand-over and
// settlement-read numbers belong on the page. Each claim checked here:
//
//   - each position draws its live mark, live value, unrealised P&L
//     (signed, toned) and HOW the mark was taken, in words, with a legend
//     in the backend's own sentences (`mark_sources`);
//   - a position with no live mark draws "—" and "no live price" — never
//     $0.00 — and the totals line names how many were left out of the sums;
//   - the values move with the book, read again every 15 s;
//   - the page says the live value is display only: the halts still count
//     in-play positions at cost;
//   - the in-play v2 block (with its arms in use), the hand-over block
//     (and, on an older backend, its top-level counts), the learner's
//     default arm / reward basis / arms in use / every focus competition as
//     a row, the settlement-read outcomes (each in words) and the
//     unreadable-fill count render;
//   - a backend that sends none of them says "not on this backend" for
//     each — and a backend that sends ZEROS draws zeros (non-vacuity).
//
// Fully mocked with page.route; values invented, dates derived from now.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const TOKEN = "ops-live-token-typed-by-a-person";

const at = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();

const BASE_STATUS = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v0", env: "prod", enabled: true, kill: false,
  halt: { active: false }, balance: "48.12", generated_at: at(0),
  in_play_trading: { strategy: "inplay-v1", enabled: true },
};

const FULL_STATUS = {
  ...BASE_STATUS,
  in_play_trading: {
    ...BASE_STATUS.in_play_trading,
    v2: {
      label: "experimental, unproven", strategy: "inplay-v2", enabled: true,
      active: true, informed_available_legs: 3, w_mean: "0.4",
      entries_placed_today: 2, entries_cancelled_today: 1,
      exits_placed_today: 1, protective_exits_placed_today: 1,
      protective_exits_refused_today: 2, protective_exits_cancelled_today: 0,
      marks_today: 3, inplay_clv_rewards: 2, mean_inplay_clv_c: 1.25,
      exit_rewards: 1, mean_exit_reward_c: -0.5, pnl_rewards: 0, at: at(0),
      arms_in_use: { at: at(0), entry: { mls: { "0.5/0.03": 2 } },
        exit: { mls: { "0.2/0.02": 1 } } },
    },
  },
  learning: {
    label: "experimental, unproven", enabled: true, strategy: "model-blend-bandit-v2.1",
    trades_by_competition: { epl: 1 }, mean_clv_c: 0.5,
    default_arm: { w: "0.5", threshold: "0.02" },
    reward_basis: "CLV in cents per contract after fees",
    arms_in_use: { at: at(0), pre_match: {
      epl: { "0.75/0.01": 4, "0.5/0.02": 1 }, unl: { "0.25/0.005": 2 } } },
    competitions: ["epl", "laliga", "mls", "ligamx", "bundesliga", "seriea",
      "ligue1", "eredivisie", "unl", "cnl", "afcon"],
  },
  handover: {
    label: "experimental, unproven", outcome: "ok",
    handed_over_contracts: 3, managed_contracts: 9, manual_contracts: 8,
    managed_markets: 2, handed_markets: 1, clips: 0, clips_pending: 0,
    risk_lowering_closes_today: 1, at: at(0), basis: "counts only",
  },
  // ops T5's shape: sums over a window of ticks, the newest pass, passes
  settlement_reads: {
    window_ticks: 240, window_since: at(-60), due: 30, asked: 12,
    settled: 2, not_listed: 9, unknown_result: 0, refused: 1,
    passes: { nothing_held: 200, read: 40 },
    latest: { outcome: "read", due: 3, asked: 2, settled: 1, not_listed: 1,
      unknown_result: 0, refused: 0, at: at(0) },
    settled_rows_today: 2, basis: "the RESULT only",
  },
  fill_reads: {
    total: 9, today: 2, unreadable: 2, unreadable_today: 1,
    by_terms_basis: { venue: 7, own_order_unreadable: 1, legacy_unreadable: 1 },
    by_direction_basis: { outcome_side: 7 }, legacy_words_disagreed: 0,
    basis: "counts only",
  },
};

const MANUAL = "KXEPLGAME-SYNTH11ARSWHU-ARS";
const MIXED = "KXLALIGAGAME-SYNTH12RMABAR-RMA";
const UNMARKED = "KXMLSGAME-SYNTH13LAFCSEA-LAFC";

const position = (ticker: string, extra: Record<string, unknown>) => ({
  ticker, title: `${ticker} title`, competition: "epl",
  kickoff_utc: at(90), in_play: false, side: "yes", contracts: 4, own: 0,
  handed_over: 0, managed: 0, manual: 4, avg_cost_cents: 52, mark_cents: 55,
  at_risk_dollars: "2.08", ...extra,
});

const MARK_SOURCES = {
  feed: "in play: the running in-play WebSocket feed's best bid of the held side",
  live_book: "in play: the live Kalshi book the agent's live tracking read",
  book: "before kickoff: the catalogue's order book bid",
  listing: "before kickoff: the catalogue's listing bid",
  none: "no live price: in play with no vouched feed book and no live read",
};

const book = (mixedLive: Record<string, unknown>) => ({
  version: "trading-book-v1", generated_at: at(0), account_read_at: at(0),
  mark_sources: MARK_SOURCES,
  positions: [
    position(MANUAL, { live_mark_cents: 57, live_value_dollars: "2.28",
      unrealised_pl_dollars: "0.20", mark_source: "book" }),
    position(MIXED, { competition: "laliga", in_play: true, kickoff_utc: at(-30),
      side: "no", contracts: 6, own: 6, managed: 6, manual: 0,
      avg_cost_cents: 41.5, ...mixedLive }),
    position(UNMARKED, { competition: "mls", live_mark_cents: null,
      live_value_dollars: null, unrealised_pl_dollars: null,
      mark_source: null }),
  ],
  orders: [],
  totals: { positions: 3, orders: 0, managed_contracts: 6, manual_contracts: 8 },
});

const FIRST = { live_mark_cents: 44, live_value_dollars: "2.64",
  unrealised_pl_dollars: "0.15", mark_source: "feed" };
const SECOND = { live_mark_cents: 30, live_value_dollars: "1.80",
  unrealised_pl_dollars: "-0.69", mark_source: "feed" };

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

async function open(page: Page, status: unknown, books: unknown[],
                    { fakeClock = false } = {}) {
  const bookReads: Request[] = [];
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(404, { available: false })));
  await page.route(BOOK, (r) => {
    bookReads.push(r.request());
    return r.fulfill(json(200, books[Math.min(bookReads.length - 1, books.length - 1)]));
  });
  await page.goto("/ops/trading#portfolio");
  await hydrated(page, fakeClock);
  await page.locator("#watch-token").fill(TOKEN);
  // UNDER AN INSTALLED CLOCK the token's 600 ms debounce waits for it —
  // and React may schedule the effect that arms that timer only after a
  // first advance, so the clock is advanced until the console answers
  if (fakeClock) {
    await expect.poll(async () => {
      await page.clock.runFor(700);
      return page.getByTestId("ops-console").count();
    }, "the console opens once the debounce has run").toBeGreaterThan(0);
  }
  await expect(page.getByTestId("ops-console")).toBeVisible();
  return bookReads;
}

const pos = (page: Page, ticker: string) =>
  page.locator(`[data-testid="book-position"][data-ticker="${ticker}"]`);

test.describe("live value on the book", () => {
  test("each position draws its live mark, value, unrealised P&L and mark "
    + "source; a missing mark is a dash, never $0.00", async ({ page }) => {
      await open(page, BASE_STATUS, [book(FIRST)]);
      await expect(page.getByTestId("book-position")).toHaveCount(3);

      const manual = pos(page, MANUAL);
      await expect(manual.getByTestId("book-live-mark")).toHaveText("57¢");
      await expect(manual.getByTestId("book-live-value")).toHaveText("$2.28");
      await expect(manual.getByTestId("book-unrealised")).toHaveText("+$0.20");
      await expect(manual.getByTestId("book-unrealised")).toHaveClass(/text-up/);
      await expect(manual.getByTestId("book-mark-source")).toHaveText("catalogue book bid");

      const mixed = pos(page, MIXED);
      await expect(mixed.getByTestId("book-live-mark")).toHaveText("44¢");
      await expect(mixed.getByTestId("book-live-value")).toHaveText("$2.64");
      await expect(mixed.getByTestId("book-mark-source")).toHaveText("live feed");

      // MISSING IS NOT ZERO
      const none = pos(page, UNMARKED);
      await expect(none.getByTestId("book-live-mark")).toHaveText("—");
      await expect(none.getByTestId("book-live-value")).toHaveText("—");
      await expect(none.getByTestId("book-unrealised")).toHaveText("—");
      await expect(none.getByTestId("book-mark-source")).toHaveText("no live price");
      await expect(none).not.toContainText("$0.00");

      // the legend: each source in use, in the backend's own sentence
      const legend = page.getByTestId("book-mark-legend");
      await expect(legend.locator("li")).toHaveCount(3);
      await expect(legend).toContainText("catalogue book bid — before kickoff: the catalogue's order book bid");
      await expect(legend).toContainText("live feed — in play: the running in-play WebSocket feed's best bid");
      await expect(legend).toContainText("no live price — no live price: in play with no vouched feed book");

      const totals = page.getByTestId("book-live-totals");
      await expect(totals).toContainText("live value $4.92");
      await expect(totals).toContainText("unrealised +$0.35");
      await expect(totals).toContainText("2 of 3 with a live mark");
      await expect(page.getByTestId("book-live-unmarked"))
        .toContainText("1 without one, not counted");
      await expect(totals).toContainText("experimental, unproven");
      await expect(page.getByTestId("book-live-note"))
        .toContainText("the loss halts still count an in-play position at its cost");
    });

  test("the live value moves with the book, read again every 15 s",
    async ({ page }) => {
      await page.clock.install();
      const reads = await open(page, BASE_STATUS, [book(FIRST), book(SECOND)],
        { fakeClock: true });
      const mixed = pos(page, MIXED);
      await expect(mixed.getByTestId("book-live-value")).toHaveText("$2.64");
      const before = reads.length;
      await page.clock.runFor(16_000);
      await expect.poll(() => reads.length, "the book is read again")
        .toBeGreaterThan(before);
      await expect(mixed.getByTestId("book-live-mark")).toHaveText("30¢");
      await expect(mixed.getByTestId("book-live-value")).toHaveText("$1.80");
      await expect(mixed.getByTestId("book-unrealised")).toHaveText("−$0.69");
      await expect(mixed.getByTestId("book-unrealised")).toHaveClass(/text-neg/);
      await expect(page.getByTestId("book-live-unrealised")).toHaveText("−$0.49");
    });
});

test("at 400 px a position's live value is on screen without scrolling the "
  + "table, and the page does not scroll sideways", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await open(page, BASE_STATUS, [book(FIRST)]);
    await expect(page.getByTestId("book-position")).toHaveCount(3);
    const m = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="book-positions"]')!;
      const box = t.parentElement!.getBoundingClientRect();
      const v = document.querySelector('[data-testid="book-live-value"]')!
        .getBoundingClientRect();
      const u = document.querySelector('[data-testid="book-unrealised"]')!
        .getBoundingClientRect();
      return { page: document.documentElement.scrollWidth,
        view: document.documentElement.clientWidth, boxRight: box.right,
        valueRight: v.right, unrealisedLeft: u.left };
    });
    expect(m.page, "no sideways page scroll").toBeLessThanOrEqual(m.view);
    expect(m.valueRight, "the live value is inside the visible box")
      .toBeLessThanOrEqual(m.boxRight);
    expect(m.unrealisedLeft, "the unrealised P&L starts inside the visible box")
      .toBeLessThan(m.boxRight);
  });

test("at desktop width the whole positions table fits its box — the live "
  + "columns did not push the hand-over buttons off screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, BASE_STATUS, [book(FIRST)]);
    await expect(page.getByTestId("book-position")).toHaveCount(3);
    const m = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="book-positions"]')!;
      const box = t.parentElement!;
      const btn = document.querySelector('[data-testid="hand-over"]')!
        .getBoundingClientRect();
      return { table: t.scrollWidth, box: box.clientWidth,
        btnRight: btn.right, boxRight: box.getBoundingClientRect().right };
    });
    expect(m.table, "the table fits its box").toBeLessThanOrEqual(m.box);
    expect(m.btnRight, "Hand to trader is on screen").toBeLessThanOrEqual(m.boxRight);
  });

test.describe("in-play v2, learning, hand-over and settlement reads", () => {
  test("every block the status carries is drawn", async ({ page }) => {
    await open(page, FULL_STATUS, [book(FIRST)]);

    await view(page, "#trading?tab=inplay");
    const v2 = page.getByTestId("inplay-v2");
    for (const s of ["inplay-v2", "legs with a live-stat read", "mean w 0.40",
      "2 placed", "1 cancelled", "2 refused · 0 cancelled", "+1.25¢",
      "2 rewards", "−0.50¢", "journal only"]) {
      await expect(v2, s).toContainText(s);
    }

    await expect(page.getByTestId("inplay-v2-arms").locator("tbody tr")).toHaveCount(2);
    await expect(page.getByTestId("inplay-v2-arms")).toContainText("entry · MLS");
    await expect(page.getByTestId("inplay-v2-arms")).toContainText("exit · MLS");
    await expect(page.getByTestId("inplay-v2-arms")).toContainText("0.2/0.02");

    await view(page, "#portfolio");
    const ho = page.getByTestId("ops-handover");
    for (const s of ["handed-over contracts", "in 1 markets", "managed contracts",
      "in 2 markets", "yours (manual) contracts", "risk-lowering closes today",
      "clips", "reconcile ok"]) {
      await expect(ho, s).toContainText(s);
    }
    await expect(page.getByTestId("handover-absent")).toHaveCount(0);

    await view(page, "#model");
    const learning = page.getByTestId("ops-learning");
    await expect(learning).toContainText("w 0.5 · t 0.02");
    await expect(page.getByTestId("learning-basis"))
      .toContainText("CLV in cents per contract after fees");
    const arms = page.getByTestId("learning-arms");
    await expect(arms.locator("tbody tr")).toHaveCount(3);
    await expect(arms.locator("tbody tr").first())
      .toHaveText(/pre-match · Premier League\s*0\.75\/0\.01\s*4/);
    await expect(arms).toContainText("pre-match · UEFA Nations League");
    await expect(arms).toContainText("0.25/0.005");
    // EVERY FOCUS COMPETITION IS A ROW of the by-competition table: a
    // competition with nothing traded reads 0 (the count map was sent),
    // its best arm "prior only"
    const comps = page.getByTestId("learning-comps");
    await expect(comps.locator("tbody tr")).toHaveCount(11);
    await expect(comps.locator("tbody tr").first()).toContainText("Premier League");
    await expect(comps.locator("tbody tr").nth(3)).toHaveText(/Liga MX\s*0\s*—\s*—\s*prior only/);

    await view(page, "#system");
    const out = page.getByTestId("settlement-outcomes");
    await expect(out.locator("thead")).toContainText("last 240 ticks");
    await expect(out.locator("tbody tr")).toHaveCount(4);
    await expect(out.locator("tbody tr").nth(0)).toHaveText(
      /settled — the account's settlement data gave one yes\/no result\s*1\s*2/);
    await expect(out.locator("tbody tr").nth(1)).toHaveText(/not listed yet.*\s*1\s*9/);
    await expect(out.locator("tbody tr").nth(1)).toContainText("not listed yet");
    await expect(out.locator("tbody tr").nth(2)).toContainText("unclear result");
    await expect(out.locator("tbody tr").nth(3)).toContainText("read refused");
    const st = page.getByTestId("ops-settlements");
    for (const t of ["due a read", "a win is never assumed", "asked Kalshi",
      "30 over the window", "settled rows today", "the last 240 ticks",
      "passes nothing held awaits a result 200 · asked Kalshi 40"]) {
      await expect(st, t).toContainText(t);
    }
    const fills = page.getByTestId("unreadable-fills");
    await expect(fills).toContainText("unreadable: 1 today · 2 in all");
    await expect(fills).toContainText("(of 2 fills today · 9 in all)");
    await expect(page.getByTestId("fill-terms").locator("tbody tr")).toHaveCount(3);
  });

  test("at 400 px, with every block filled, the page does not scroll "
    + "sideways", async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 900 });
      await open(page, FULL_STATUS, [book(FIRST)]);
      // every view, filled, at 400 px
      for (const [hash, id] of [["#system", "settlement-outcomes"],
        ["#trading?tab=inplay", "inplay-v2-arms"], ["#overview", "ops-money"],
        ["#portfolio", "book-positions"], ["#model", "learning-comps"],
        ["#trades", "ops-ledger"], ["#performance", "ops-performance"]] as const) {
        await view(page, hash);
        await expect(page.getByTestId(id), hash).toBeVisible();
        const m = await page.evaluate(() => ({
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
        }));
        expect(m.page, `${hash}: no sideways page scroll`).toBeLessThanOrEqual(m.view);
      }
    });

  test("an older backend: each missing block says 'not on this backend'",
    async ({ page }) => {
      await open(page, BASE_STATUS, [book(FIRST)]);
      await expect(page.getByTestId("handover-absent"))
        .toHaveText("hand-over numbers are not on this backend");
      await view(page, "#trading?tab=inplay");
      await expect(page.getByTestId("inplay-v2-absent"))
        .toHaveText("in-play v2 is not on this backend");
      await expect(page.getByTestId("inplay-v2")).toHaveCount(0);
      await view(page, "#system");
      await expect(page.getByTestId("settlements-absent"))
        .toHaveText("settlement-read outcomes are not on this backend");
      await expect(page.getByTestId("unreadable-fills"))
        .toContainText("not on this backend");
      await expect(page.getByTestId("inplay-v2")).toHaveCount(0);
    });

  test("a backend that sends zeros draws zeros — absence and zero are two "
    + "different answers", async ({ page }) => {
      await open(page, {
        ...BASE_STATUS, handed_over_contracts: 0, managed_markets: 0,
        risk_lowering_closes_today: 0,
        settlement_reads: { outcome: "nothing_held" },
        unreadable_fills: 0,
      }, [book(FIRST)]);
      await expect(page.getByTestId("handover-absent")).toHaveCount(0);
      await expect(page.getByTestId("ops-handover")).toContainText("0");
      await view(page, "#system");
      await expect(page.getByTestId("settlements-absent")).toHaveCount(0);
      await expect(page.getByTestId("ops-settlements"))
        .toContainText("nothing held awaits a result");
      // a flat block: the newest pass's counts are the "last read" column,
      // and an outcome it did not send is a dash, not 0
      await expect(page.getByTestId("settlement-outcomes").locator("tbody tr").first())
        .toHaveText(/settled.*—$/);
      await expect(page.getByTestId("unreadable-fills")).not.toContainText("not on this backend");
      await expect(page.getByTestId("unreadable-fills")).toContainText("0");
    });
});

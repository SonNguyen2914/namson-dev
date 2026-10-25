import { expect, test, type Page } from "@playwright/test";

/* THIN AND UNAVAILABLE BOOKS, SAID ON THE PAGE (C26, backend #277).
 *
 * Backend #277 (A7, E2) added `thin_book` + `thin_reasons` to every league
 * book and `unavailable` to every league grid — events whose markets could
 * not be read are NAMED rather than dropped as if settled. The four league
 * dashboards (one shared BookCard) and the friendly match page now say
 * both:
 *   - a thin book keeps its raw cents, under a THIN tag whose hover gives
 *     the backend's reasons in words;
 *   - an unavailable event is listed by name with "could not be read",
 *     and a grid that is ALL unavailable is not "no open books";
 *   - the friendly page, the one surface that turns an ask into an
 *     implied %, withholds that % on a thin book.
 *
 * Hermetic: the shapes are src/mls.py `parse_game_books` /
 * `assemble_series_books` and src/friendlies.py `match_fixture_book`, as
 * of backend 9451aae9; every other read is refused by name. */

const json = (b: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(b) });

const leg = (ticker: string, label: string, ask: string | null, bid: string | null) => ({
  ticker, label, yes_ask: ask, yes_bid: bid, status: "active",
  spread: ask !== null && bid !== null ? Math.round((parseFloat(ask) - parseFloat(bid)) * 1e4) / 1e4 : null,
});

const QUOTED = {
  event_ticker: "KXMLSGAME-26OCT24NSHMIA", title: "Nashville SC vs Inter Miami CF",
  markets: [leg("KXMLSGAME-26OCT24NSHMIA-NSH", "Nashville SC", "0.3500", "0.3400"),
    leg("KXMLSGAME-26OCT24NSHMIA-TIE", "Tie", "0.2700", "0.2600"),
    leg("KXMLSGAME-26OCT24NSHMIA-MIA", "Inter Miami CF", "0.4000", "0.3900")],
  ask_sum: 1.02, thin_book: false, thin_reasons: [],
};
const STUB = {
  event_ticker: "KXMLSGAME-26OCT24ATLCLT", title: "Atlanta United vs Charlotte FC",
  markets: [leg("KXMLSGAME-26OCT24ATLCLT-ATL", "Atlanta United", "0.9900", "0.0100"),
    leg("KXMLSGAME-26OCT24ATLCLT-TIE", "Tie", "0.9900", null),
    leg("KXMLSGAME-26OCT24ATLCLT-CLT", "Charlotte FC", "0.9900", "0.0100")],
  ask_sum: 2.97, thin_book: true, thin_reasons: ["missing_quote", "wide_spread", "ask_sum_high"],
};
const UNAV = { event_ticker: "KXMLSGAME-26OCT21CINDCU", title: "FC Cincinnati vs D.C. United",
  reason: "series_markets_read_failed" };

async function mls(page: Page, markets: unknown) {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/mls/markets", (r) => r.fulfill(json(markets)));
  await page.goto("/bet-suggester/leagues?league=mls");
}

test.describe("league BookCards", () => {
  test("a thin book keeps its cents under a THIN tag with the reasons in words; a quoted book has none",
    async ({ page }) => {
      await mls(page, { games: [QUOTED, STUB], unavailable: [],
        markets_read: { status: "live", read_at: "2026-10-24T12:00:00Z", age_seconds: 0 } });
      const stub = page.locator(`[data-testid="book-card"][data-event="${STUB.event_ticker}"]`);
      const quoted = page.locator(`[data-testid="book-card"][data-event="${QUOTED.event_ticker}"]`);
      await expect(stub).toHaveAttribute("data-thin", "true");
      await expect(quoted).toHaveAttribute("data-thin", "false");
      const tag = stub.getByTestId("book-thin");
      await expect(tag).toHaveText(/thin/i);
      await expect(tag).toHaveAttribute("data-reasons", "missing_quote,wide_spread,ask_sum_high");
      const title = (await tag.getAttribute("title")) ?? "";
      expect(title).toContain("missing its ask or its bid");
      expect(title).toContain("spread is over 20¢");
      expect(title).toContain("sum to more than 115¢");
      expect(title).toContain("297¢");
      // the raw cents are still the exchange's own, never a probability
      await expect(stub).toContainText("99¢");
      await expect(stub).not.toContainText("%");
      await expect(quoted.getByTestId("book-thin")).toHaveCount(0);
      await expect(page.getByTestId("books-unavailable")).toHaveCount(0);
    });

  test("an unreadable event is named, never dropped; an all-unavailable grid is not 'no open books'",
    async ({ page }) => {
      await mls(page, { games: [], unavailable: [UNAV],
        markets_read: { status: "unavailable", read_at: null, age_seconds: null,
          reason: "series_markets_read_failed" } });
      const box = page.getByTestId("books-unavailable");
      await expect(box).toBeVisible();
      await expect(box).toContainText("1 book unavailable");
      const row = box.getByTestId("book-unavailable");
      await expect(row).toHaveAttribute("data-event", UNAV.event_ticker);
      await expect(row).toContainText("FC Cincinnati vs D.C. United");
      await expect(row).toContainText("could not be read");
      await expect(page.getByText(/no open MLS books/i)).toHaveCount(0);
    });

  test("a grid with neither books nor unavailable events still says so", async ({ page }) => {
    await mls(page, { games: [], unavailable: [] });
    await expect(page.getByText(/no open MLS books right now/i)).toBeVisible();
    await expect(page.getByTestId("books-unavailable")).toHaveCount(0);
  });
});

// ------------------------------------------------------------ friendlies

const FIXTURE = {
  fixture_id: 1234567, kickoff_utc: "2026-10-26T18:00:00Z", status: "NS",
  status_long: "Not Started", league_name: "Club Friendlies",
  home: { name: "Bayern Munich" }, away: { name: "RB Salzburg" },
  goals: { home: null, away: null },
};
const friendlyBook = (thin: boolean) => ({
  event_ticker: "KXCLUBFGAME-26OCT26BAYSAL", title: "Bayern Munich vs RB Salzburg",
  markets: thin
    ? [leg("T-BAY", "Bayern Munich", "0.9900", "0.0100"), leg("T-TIE", "Tie", "0.9900", null),
       leg("T-SAL", "RB Salzburg", "0.9900", "0.0100")]
    : [leg("T-BAY", "Bayern Munich", "0.6600", "0.6500"), leg("T-TIE", "Tie", "0.1800", "0.1700"),
       leg("T-SAL", "RB Salzburg", "0.1800", "0.1700")],
  ask_sum: thin ? 2.97 : 1.02, thin_book: thin,
  thin_reasons: thin ? ["missing_quote", "wide_spread", "ask_sum_high"] : [],
});

async function friendly(page: Page, books: unknown) {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/friendlies/fixtures/1234567**", (r) =>
    r.fulfill(json({ fixture: FIXTURE, books })));
  await page.goto("/bet-suggester/friendlies/1234567");
}

test.describe("the friendly match page", () => {
  test("a thin book: the cents stay, the implied % is withheld, and the tag says why", async ({ page }) => {
    await friendly(page, { status: "mapped", book: friendlyBook(true) });
    await expect(page.getByTestId("friendly-book-thin")).toBeVisible();
    await expect(page.getByTestId("friendly-book-thin").getByTestId("book-thin"))
      .toHaveAttribute("title", /missing its ask or its bid/);
    const implied = page.getByTestId("friendly-implied");
    await expect(implied).toHaveCount(3);
    for (const t of await implied.allInnerTexts()) expect(t.trim()).toBe("—");
    await expect(page.getByText("99¢").first()).toBeVisible();
  });

  test("a quoted book still shows its implied %", async ({ page }) => {
    await friendly(page, { status: "mapped", book: friendlyBook(false) });
    await expect(page.getByTestId("friendly-implied").first()).toHaveText("66.0%");
    await expect(page.getByTestId("friendly-book-thin")).toHaveCount(0);
  });

  test("an unavailable book is named unavailable, never 'no book exists'", async ({ page }) => {
    await friendly(page, { status: "unavailable", book: null, candidates: [] });
    const empty = page.getByTestId("friendly-book-empty");
    await expect(empty).toHaveAttribute("data-status", "unavailable");
    await expect(empty.getByTestId("friendly-book-unavailable")).toHaveText(/unavailable/i);
    await expect(empty).toContainText("not “no book exists”");
  });
});

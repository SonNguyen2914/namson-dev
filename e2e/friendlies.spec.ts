import { expect, test } from "@playwright/test";

// Club Friendlies viewer — hermetic, recorded payloads only (no backend).
// The scope line IS the feature, so the scope is what gets tested:
//  - the framing must say NO model runs here and must never imply one is
//    coming; no bare TAKE/BUY/SELL anywhere;
//  - the matchday heading is DERIVED from fixtures (ESPN's bucket is a
//    matchday, not a calendar day);
//  - a mapped fixture shows the book, an unmapped one says so in words,
//    and an AMBIGUOUS mapping refuses to show a price at all;
//  - the not-deployed (404) and unreachable states are explicit;
//  - structural findings are linked out to the market hunter.

// A fixture N days out at 12:00Z: same LOCAL calendar day at every UTC
// offset from -12 to +14, so day assertions hold wherever the suite runs.
function inDays(n: number, utcHour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toISOString();
}

function fixture(id: string, date: string, home: string, away: string,
                 over: Record<string, unknown> = {}) {
  return { id, date, state: "pre", detail: "Scheduled",
           venue: "Test Ground", home: { name: home }, away: { name: away },
           ...over };
}

const BOOK = {
  event_ticker: "KXCLUBFGAME-26JUL29LFCWRE",
  title: "Liverpool vs Wrexham",
  markets: [
    { ticker: "KXCLUBFGAME-26JUL29LFCWRE-LFC", label: "Liverpool",
      yes_ask: "0.6900", yes_bid: "0.6800", status: "active" },
    { ticker: "KXCLUBFGAME-26JUL29LFCWRE-TIE", label: "Tie",
      yes_ask: "0.1800", yes_bid: "0.1600", status: "active" },
    { ticker: "KXCLUBFGAME-26JUL29LFCWRE-WRE", label: "Wrexham",
      yes_ask: "0.1400", yes_bid: "0.1300", status: "active" },
  ],
};

type ServeOpts = {
  scoreboard?: unknown;
  markets?: unknown;
  schedule?: unknown;
};

async function serve(page: import("@playwright/test").Page,
                     opts: ServeOpts = {}) {
  const json = (body: unknown) => ({
    status: 200, contentType: "application/json",
    body: JSON.stringify(body),
  });
  await page.route("**/api/friendlies/scoreboard", (r) =>
    r.fulfill(json(opts.scoreboard ?? { fixtures: [] })));
  await page.route("**/api/friendlies/markets", (r) =>
    r.fulfill(json(opts.markets ?? { fixtures: [], listed: null })));
  await page.route("**/api/friendlies/schedule**", (r) =>
    r.fulfill(json(opts.schedule ?? { fixtures: [] })));
}

test.describe("club friendlies viewer (recorded payloads)", () => {
  test("framing: modelless surface stated plainly, nothing implied as coming",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("1", inDays(0), "Liverpool", "Wrexham")] },
      });
      await page.goto("/bet-suggester/friendlies");
      await expect(page.getByText("Liverpool").first()).toBeVisible();
      const body = await page.locator("body").innerText();
      // the honest framing block
      expect(body).toMatch(/no model runs here, and none is planned/i);
      expect(body).toMatch(/not advice/i);
      // never imply predictions are on the way
      expect(body).not.toMatch(/coming soon|arriving|predictions (soon|pending)|model (soon|pending|in progress)/i);
      // decision safety: no bare directives anywhere on the surface
      expect(body).not.toMatch(/\b(TAKE|BUY|SELL)\b/);
      // no fabricated numbers on absent data
      expect(body).not.toMatch(/NaN|undefined|Infinity/);
    });

  test("hunter panel is linked as the home of structural findings",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester/friendlies");
      const link = page.locator('a[href="/bet-suggester/hunter"]').first();
      await expect(link).toBeVisible();
      await expect(link).toContainText(/structural findings/i);
    });

  test("heading derives from the fixtures: today reads as today",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("1", inDays(0), "Liverpool", "Wrexham")] },
      });
      await page.goto("/bet-suggester/friendlies");
      await expect(page.getByText(/today's friendlies/i)).toBeVisible();
    });

  test("heading derives from the fixtures: a future bucket is never 'today'",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("1", inDays(2), "Cerezo Osaka", "Borussia Dortmund")] },
      });
      await page.goto("/bet-suggester/friendlies");
      await expect(page.getByText(/next friendlies/i)).toBeVisible();
      await expect(page.getByText(/today's friendlies/i)).toHaveCount(0);
      // and the group carries its real day label
      const label = new Date(inDays(2)).toLocaleDateString(undefined, {
        weekday: "long", month: "short", day: "numeric",
      });
      await expect(page.getByText(label).first()).toBeVisible();
    });

  test("mapped fixture shows the book; unmapped says so in words",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("10", inDays(0), "Liverpool", "Wrexham"),
          fixture("11", inDays(0), "Al Nassr", "Mérida"),
        ] },
        markets: { fixtures: [
          { fixture_id: "10", home: "Liverpool", away: "Wrexham",
            status: "mapped", book: BOOK,
            candidates: [BOOK.event_ticker] },
          { fixture_id: "11", home: "Al Nassr", away: "Mérida",
            status: "unmapped", book: null, candidates: [] },
        ], listed: { count: 200, truncated: true } },
      });
      await page.goto("/bet-suggester/friendlies");
      // mapped: prices render in cents, labelled ask/bid
      await expect(page.getByText("69¢").first()).toBeVisible();
      await expect(page.getByText(/ask \/ bid/i).first()).toBeVisible();
      // unmapped: words, not absence
      const unmapped = page.locator("div.rounded-xl", { hasText: "Al Nassr" });
      await expect(unmapped.getByText(/no kalshi book matched/i)).toBeVisible();
      // the census line reports the lower bound honestly
      await expect(page.getByText(/200\+ club-friendly match events/i))
        .toBeVisible();
    });

  test("ambiguous mapping refuses to price: words, candidates, no cents",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("12", inDays(0), "Albacete", "Real Madrid Castilla")] },
        markets: { fixtures: [
          { fixture_id: "12", home: "Albacete",
            away: "Real Madrid Castilla", status: "ambiguous", book: null,
            candidates: ["KXCLUBFGAME-26JUL31ALBRM",
                         "KXCLUBFGAME-26JUL31ALBRMA"] },
        ], listed: null },
      });
      await page.goto("/bet-suggester/friendlies");
      const card = page.locator("div.rounded-xl", { hasText: "Albacete" });
      await expect(card.getByText(/ambiguous kalshi match/i)).toBeVisible();
      await expect(card.getByText(/not\s+guessing/i)).toBeVisible();
      // refusing means REFUSING: no price renders on that card
      expect(await card.innerText()).not.toMatch(/¢/);
    });

  test("live fixture renders its scores from the two per-side fields",
    async ({ page }) => {
      // never a provider composite string: home and away scores arrive
      // and render as separate fields beside their own team names
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("13", inDays(0), "PSV Eindhoven", "FC Eindhoven", {
            state: "in", minute: "61'",
            home: { name: "PSV Eindhoven", score: "3" },
            away: { name: "FC Eindhoven", score: "1" },
          })] },
      });
      await page.goto("/bet-suggester/friendlies");
      const card = page.locator("div.rounded-xl", { hasText: "PSV Eindhoven" });
      await expect(card.getByText("LIVE 61'")).toBeVisible();
      const txt = await card.innerText();
      // each score sits with its own side — no "3-1" composite anywhere
      expect(txt).toMatch(/PSV Eindhoven[\s\S]*3/);
      expect(txt).toMatch(/FC Eindhoven[\s\S]*1/);
      expect(txt).not.toMatch(/3\s*[–-]\s*1/);
    });

  test("empty bucket is an explicit empty state", async ({ page }) => {
    await serve(page);           // fixtures: []
    await page.goto("/bet-suggester/friendlies");
    await expect(page.getByText(/no club friendlies in espn's bucket/i))
      .toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/NaN|undefined/);
  });

  test("not-deployed backend (404) states it in words", async ({ page }) => {
    const nf = { status: 404, contentType: "application/json",
                 body: JSON.stringify({ detail: "Not Found" }) };
    await page.route("**/api/friendlies/scoreboard", (r) => r.fulfill(nf));
    await page.route("**/api/friendlies/markets", (r) => r.fulfill(nf));
    await page.route("**/api/friendlies/schedule**", (r) => r.fulfill(nf));
    await page.goto("/bet-suggester/friendlies");
    await expect(page.getByText(/does not serve the friendlies api yet/i))
      .toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/NaN|undefined/);
    // no skeleton pretending data is on the way
    expect(body).not.toMatch(/loading fixtures/i);
  });

  test("unreachable backend states it in words", async ({ page }) => {
    await page.route("**/api/friendlies/**", (r) => r.abort());
    await page.goto("/bet-suggester/friendlies");
    await expect(page.getByText(/backend unreachable/i)).toBeVisible();
  });

  test("the board links to the friendlies page", async ({ page }) => {
    // the board itself talks to the WC26 + MLS APIs; abort them so this
    // stays hermetic (an aborted fetch takes the board's catch paths —
    // a `{}` stub instead feeds .map() undefined and crashes the page)
    await page.route("**/api/**", (r) => r.abort());
    await page.goto("/bet-suggester");
    const chip = page.locator('a[href="/bet-suggester/friendlies"]').first();
    await expect(chip).toBeVisible();
  });
});

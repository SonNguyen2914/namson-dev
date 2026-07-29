import { expect, test } from "@playwright/test";

// Club Friendlies viewer — hermetic, recorded payloads only (no backend).
// The scope line IS the feature, so the scope is what gets tested:
//  - the framing must say NO model runs here and must never imply one is
//    coming; no bare TAKE/BUY/SELL anywhere;
//  - the matchday heading is DERIVED from fixtures (ESPN's bucket is a
//    matchday, not a calendar day);
//  - a mapped fixture shows the book; every non-mapped state is DISTINCT
//    words: unmapped, ambiguous, unresolved_name (a near-miss is never
//    priced), unavailable (a failed fetch is never "closed"),
//    registry_incomplete (a partial registry never claims absence), and
//    a stale cache shows its age (review P0-2, 2026-07-29);
//  - the not-deployed (404) and unreachable states are explicit;
//  - the market-hunter link renders only where the hunter API answers.

// A fixture N days out at 12:00Z: 12:00Z fixtures built for the SAME n
// share one local calendar day at every UTC offset, and n >= 2 is never
// "today" anywhere (worst case, offset -12 sees day n at n-1 local).
function inDays(n: number, utcHour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toISOString();
}

// "Today" at EVERY offset is only guaranteed by NOW itself: a pinned
// 12:00Z is already tomorrow at UTC+13/+14. Heading tests that assert
// today therefore use the current instant, not a pinned hour.
const NOW = () => new Date().toISOString();

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

function row(fixture_id: string, home: string, away: string,
             status: string, over: Record<string, unknown> = {}) {
  return { fixture_id, home, away, status, book: null, candidates: [],
           freshness: null, ...over };
}

type ServeOpts = {
  scoreboard?: unknown;
  markets?: unknown;
  schedule?: unknown;
  hunter?: boolean;          // does /api/hunter/findings answer 200?
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
  if (opts.hunter) {
    await page.route("**/api/hunter/findings", (r) =>
      r.fulfill(json({ findings: [] })));
  }
  // when opts.hunter is falsy the probe hits the app's real route
  // table, which has no /api/hunter — an honest 404
}

test.describe("club friendlies viewer (recorded payloads)", () => {
  test("framing: modelless surface stated plainly, nothing implied as coming",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("1", NOW(), "Liverpool", "Wrexham")] },
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

  test("hunter link renders when the hunter API answers", async ({ page }) => {
    await serve(page, { hunter: true });
    await page.goto("/bet-suggester/friendlies");
    const link = page.locator('a[href="/bet-suggester/hunter"]').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText(/structural findings/i);
  });

  test("hunter link is absent when the hunter API 404s", async ({ page }) => {
    // this build has no /api/hunter route, so the probe 404s for real —
    // the page must not link a surface this deployment cannot serve
    await serve(page, {
      markets: { fixtures: [],
                 listed: { count: 200, truncated: true, complete: true } },
    });
    await page.goto("/bet-suggester/friendlies");
    // census renders (so the link WOULD have had a home)...
    await expect(page.getByText(/club-friendly match events/i)).toBeVisible();
    // ...but no hunter link anywhere
    await expect(page.locator('a[href="/bet-suggester/hunter"]'))
      .toHaveCount(0);
  });

  test("heading derives from the fixtures: today reads as today",
    async ({ page }) => {
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("1", NOW(), "Liverpool", "Wrexham")] },
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
          fixture("10", NOW(), "Liverpool", "Wrexham"),
          fixture("11", NOW(), "Al Nassr", "Mérida"),
        ] },
        markets: { fixtures: [
          row("10", "Liverpool", "Wrexham", "mapped",
              { book: BOOK, candidates: [BOOK.event_ticker] }),
          row("11", "Al Nassr", "Mérida", "unmapped"),
        ], listed: { count: 200, truncated: true, complete: true } },
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
          fixture("12", NOW(), "Albacete", "Real Madrid Castilla")] },
        markets: { fixtures: [
          row("12", "Albacete", "Real Madrid Castilla", "ambiguous",
              { candidates: ["KXCLUBFGAME-26JUL31ALBRM",
                             "KXCLUBFGAME-26JUL31ALBRMA"] }),
        ], listed: null },
      });
      await page.goto("/bet-suggester/friendlies");
      const card = page.locator("div.rounded-xl", { hasText: "Albacete" });
      await expect(card.getByText(/ambiguous kalshi match/i)).toBeVisible();
      await expect(card.getByText(/not\s+guessing/i)).toBeVisible();
      // refusing means REFUSING: no price renders on that card
      expect(await card.innerText()).not.toMatch(/¢/);
    });

  test("a near-miss name (B-team shape) is words, never a price",
    async ({ page }) => {
      // review P0-1 at the page boundary: unresolved_name is its own
      // state — not "unmapped", and absolutely not a priced book
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("13", NOW(), "Albacete", "Real Madrid")] },
        markets: { fixtures: [
          row("13", "Albacete", "Real Madrid", "unresolved_name",
              { candidates: ["KXCLUBFGAME-26JUL31ALBRMA"] }),
        ], listed: null },
      });
      await page.goto("/bet-suggester/friendlies");
      const card = page.locator("div.rounded-xl", { hasText: "Albacete" });
      await expect(card.getByText(/name not exact/i)).toBeVisible();
      await expect(card.getByText(/not pricing/i)).toBeVisible();
      const txt = await card.innerText();
      expect(txt).not.toMatch(/¢/);
      expect(txt).not.toMatch(/no kalshi book matched/i);
    });

  test("a failed market fetch reads unavailable, never closed",
    async ({ page }) => {
      // review P0-2: "we couldn't look" must never render as an
      // authoritative absence
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("14", NOW(), "Liverpool", "Wrexham")] },
        markets: { fixtures: [
          row("14", "Liverpool", "Wrexham", "unavailable",
              { candidates: [BOOK.event_ticker] }),
        ], listed: null },
      });
      await page.goto("/bet-suggester/friendlies");
      const card = page.locator("div.rounded-xl", { hasText: "Liverpool" });
      await expect(card.getByText(/book unavailable/i)).toBeVisible();
      await expect(card.getByText(/fetch failed/i)).toBeVisible();
      const txt = await card.innerText();
      expect(txt).not.toMatch(/no kalshi book matched|book closed/i);
      expect(txt).not.toMatch(/¢/);
    });

  test("an incomplete registry never claims unmapped", async ({ page }) => {
    await serve(page, {
      scoreboard: { fixtures: [
        fixture("15", NOW(), "Al Nassr", "Mérida")] },
      markets: { fixtures: [
        row("15", "Al Nassr", "Mérida", "registry_incomplete"),
      ], listed: { count: 118, truncated: false, complete: false } },
    });
    await page.goto("/bet-suggester/friendlies");
    const card = page.locator("div.rounded-xl", { hasText: "Al Nassr" });
    await expect(card.getByText(/registry incomplete/i)).toBeVisible();
    await expect(card.getByText(/couldn't check/i)).toBeVisible();
    expect(await card.innerText()).not.toMatch(/no kalshi book matched/i);
    // and the census says it is a floor, not a count
    await expect(page.getByText(/census incomplete/i)).toBeVisible();
  });

  test("a stale book is priced WITH its age on display", async ({ page }) => {
    await serve(page, {
      scoreboard: { fixtures: [
        fixture("16", NOW(), "Liverpool", "Wrexham")] },
      markets: { fixtures: [
        row("16", "Liverpool", "Wrexham", "mapped",
            { book: BOOK, candidates: [BOOK.event_ticker],
              freshness: { state: "stale", age_seconds: 42 } }),
      ], listed: null },
    });
    await page.goto("/bet-suggester/friendlies");
    const card = page.locator("div.rounded-xl", { hasText: "Liverpool" });
    await expect(card.getByText("69¢").first()).toBeVisible();
    await expect(card.getByText(/stale/i)).toBeVisible();
    await expect(card.getByText(/42s/i)).toBeVisible();
  });

  test("live fixture renders its scores from the two per-side fields",
    async ({ page }) => {
      // never a provider composite string: home and away scores arrive
      // and render as separate fields beside their own team names
      await serve(page, {
        scoreboard: { fixtures: [
          fixture("17", NOW(), "PSV Eindhoven", "FC Eindhoven", {
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

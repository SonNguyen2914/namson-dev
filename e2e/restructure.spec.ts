import { expect, test } from "@playwright/test";

// The 2026-08-30 restructure (board landing / leagues carousel / archive)
// — coverage the two audit lanes found missing, plus pins on every fix
// they demanded. Hermetic where the board is involved (same recorded
// shapes as picker.spec.ts); chrome-only assertions elsewhere, so no
// test depends on tonight's fixtures.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

function inHours(h: number) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

const ROW = {
  refused: false, league: "laliga",
  home: "Barcelona", away: "Rayo Vallecano",
  favourite: "Barcelona", opponent: "Rayo Vallecano", fav_side: "home",
  resolution: {}, ppg_gap: 1.15, gdg_gap: 1.63, rank_gap: 7,
  gp_current: { home: 2, away: 2, min: 2 },
  src: "prior", ranks: { fav: 1, opp: 8 },
  tiers: { ovr: [1, 2], atk: [1, 4], def: [1, 1] },
  tier_gaps: { ovr: 1, atk: 3, def: 0 }, shape: "SPLIT",
  event_id: "401882903", competition_id: "401882903",
  kickoff: inHours(9), espn: "esp.1", kalshi: null,
};
const ZERO = {
  ...ROW, home: "Osasuna", away: "Getafe", favourite: "Getafe",
  opponent: "Osasuna", fav_side: "away", gdg_gap: 0.0, ppg_gap: 0.2,
  rank_gap: 9, event_id: "401882901", competition_id: "401882901",
};
const BOARD = {
  // FIXED timestamp: 06:11:22Z on 2026-08-31 is 23:11:22 the evening
  // before in America/Los_Angeles — the header must say Aug 30.
  generated_at: "2026-08-31T06:11:22Z",
  date: "20260831", days: 2,
  leagues: {
    epl: { src: "prior", min_current_gp: 1, clubs: 20 },
    laliga: { src: "prior", min_current_gp: 2, clubs: 20 },
    mls: { src: "current", min_current_gp: 21, clubs: 30 },
    ligamx: { src: "prior", min_current_gp: 5, clubs: 18 },
  },
  rows: [ZERO, ROW], refusals: [],
};

async function openBoard(page: import("@playwright/test").Page) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.goto("/bet-suggester");
  await expect(page.getByTestId("picker-row")).toHaveCount(2);
}

// ------------------------- rows are the way in (D1) -------------------------

test("each row's fixture line is a link into its match page", async ({ page }) => {
  await openBoard(page);
  const top = page.getByTestId("picker-row").first();
  const link = top.getByRole("link", { name: /open Barcelona versus Rayo/i });
  await expect(link).toHaveAttribute("href", "/bet-suggester/laliga/401882903");
  await link.focus();
  await expect(link).toBeFocused();
});

// --------------------- the built/slate header line (D2) ---------------------

test("the header dates the board: built (LA), slate (ET), fixture count",
  async ({ page }) => {
    await openBoard(page);
    const line = page.getByText(/built .+ · slate .+ ET · \d+ fixtures?/);
    await expect(line).toBeVisible();
    await expect(line).toContainText("Aug 30");        // LA evening before
    await expect(line).toContainText("11:11:22");
    await expect(line).toContainText("slate 2026-08-31 ET");
    await expect(line).toContainText("2 fixtures");
  });

// ------------- window switches re-enter loading honestly (D3 + F6) -------------

test("a window switch shows skeletons and hides the previous board's header line",
  async ({ page }) => {
    await openBoard(page);
    await page.unroute("**/api/picker/board**");
    await page.route("**/api/picker/board**", async (r) => {
      await new Promise((res) => setTimeout(res, 1200));
      await r.fulfill(json(BOARD));
    });
    // 3d, NOT 7d: since the four-column board (2026-08-31) the page's
    // default window IS 7 - clicking the already-active chip is a no-op
    // and would never re-enter loading.
    await page.getByRole("button", { name: "3d" }).click();
    // four columns, four skeleton stacks - one per league since 2026-08-31
    await expect(page.getByRole("status")).toHaveCount(4);
    await expect(page.getByRole("status").first()).toBeVisible();
    await expect(page.getByTestId("picker-row")).toHaveCount(0);
    // the OLD board's "built …" line must not stand beside skeletons —
    // the error state promises nothing stale is ever shown, and the
    // loading state holds itself to the same rule
    await expect(page.getByText(/built .+ · slate/)).toHaveCount(0);
    await expect(page.getByTestId("picker-row")).toHaveCount(2);
    await expect(page.getByText(/built .+ · slate/)).toBeVisible();
  });

// ------------------- a network failure is named, not pasted -------------------

test("a dead network renders a sentence, not the browser's raw string",
  async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.abort());
    await page.goto("/bet-suggester");
    const err = page.getByTestId("board-error");
    await expect(err).toBeVisible();
    await expect(err).toContainText("the request never reached the server");
    await expect(err).not.toContainText("Failed to fetch");
  });

// ----------------------- archive menu ARIA wiring -----------------------

test("aria-controls exists only while the panel it names exists",
  async ({ page }) => {
    await openBoard(page);
    const btn = page.getByRole("button", { name: /archive/i });
    // closed: no dangling reference to an id that is not in the DOM
    await expect(btn).not.toHaveAttribute("aria-controls", /.+/);
    await btn.click();
    await expect(btn).toHaveAttribute("aria-controls", "archive-menu");
    await expect(page.locator("#archive-menu")).toHaveCount(1);
  });

test("the legend toggle's accessible name is its title, nothing glued on",
  async ({ page }) => {
    await openBoard(page);
    // exact: the eyebrow ("legend") and the visual "show" hint must not
    // concatenate into the name
    const btn = page.getByRole("button", { name: "How to read a row", exact: true });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
  });

// -------------------- legacy ?league= edge cases --------------------

test("an EMPTY ?league= hard load lands on the carousel, not a dead param on the board",
  async ({ page }) => {
    await page.goto("/bet-suggester?league=");
    await expect(page).toHaveURL(/\/bet-suggester\/leagues/);
    await expect(page.getByRole("heading", { name: "MLS" }).first())
      .toBeVisible();
  });

test("a client-side ?league= transition in any CASE is caught by the board's guard",
  async ({ page }) => {
    await openBoard(page);
    // a <Link> transition never consults next.config.ts — this is the
    // client guard's own path, uppercase on purpose
    await page.evaluate(() => {
      (window as unknown as {
        next: { router: { push: (u: string) => void } };
      }).next.router.push("/bet-suggester?league=EPL");
    });
    await page.waitForURL(/\/bet-suggester\/leagues\?league=epl/);
    await expect(page.getByRole("heading", { name: "Premier League" }).first())
      .toBeVisible();
  });

test("?league=WC26 in the wrong case still means the archive page, never MLS",
  async ({ page }) => {
    await page.goto("/bet-suggester?league=WC26");
    await page.waitForURL(/\/bet-suggester\/wc26/);
    await expect(page.getByRole("heading", { name: /World Cup 26/ }).first())
      .toBeVisible();
  });

// ------------- comp pages carry the archive they belong to (F1) -------------

test("a finished competition's own page still has the Archive control, marked current",
  async ({ page }) => {
    await page.route("**/api/comp/asean/fixtures**", (r) => r.fulfill(json({
      display: "ASEAN Championship", count: 0, fixtures: [],
      model: { state: "no_model_by_design", why: "cup", instead: "viewer" },
    })));
    await page.route("**/api/comp/asean/markets**", (r) => r.fulfill(json({})));
    await page.route("**/api/comp/asean/tournament**", (r) =>
      r.fulfill(json({ detail: "no tournament surface" }, 404)));
    await page.goto("/bet-suggester/comp/asean");
    const btn = page.getByRole("button", { name: /archive/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByRole("menuitem", { name: /ASEAN Championship/ }))
      .toHaveAttribute("aria-current", "page");
    // and the other archive entry is one click away — no dead end
    await expect(page.getByRole("menuitem", { name: /World Cup 26/ }))
      .toBeVisible();
  });

test("even the not-served comp page keeps the Archive control", async ({ page }) => {
  await page.route("**/api/comp/gone-comp/fixtures**", (r) =>
    r.fulfill(json({ detail: "retired by operator decision" }, 404)));
  await page.route("**/api/comp/gone-comp/markets**", (r) =>
    r.fulfill(json({ detail: "retired" }, 404)));
  await page.goto("/bet-suggester/comp/gone-comp");
  await expect(page.getByText(/retired by operator decision/)).toBeVisible();
  await expect(page.getByRole("button", { name: /archive/i })).toBeVisible();
});

// ----------------------- SSR titles exist (five pages) -----------------------

for (const path of [
  "/bet-suggester/leagues",
  "/bet-suggester/wc26",
  "/bet-suggester/comp/asean",
  "/bet-suggester/market/104",
  "/bet-suggester/friendlies/12345",
]) {
  test(`SSR HTML carries a real <title> for ${path}`, async ({ request }) => {
    // next/head silently DROPS a multi-child <title> at SSR; the client
    // corrects it later, which is exactly why only a raw-HTML check can
    // catch the regression.
    const r = await request.get(path);
    const html = await r.text();
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/);
    expect(m, `no <title> in SSR HTML of ${path}`).not.toBeNull();
    expect(m![1]).toContain("namson.dev");
  });
}

// -------------------- back links changed by the restructure --------------------

test("bots and market pages both point back to the wc26 archive page",
  async ({ page }) => {
    await page.goto("/bet-suggester/bots");
    await expect(page.getByRole("link", { name: "wc26" }))
      .toHaveAttribute("href", "/bet-suggester/wc26");
    await page.goto("/bet-suggester/market/104");
    await expect(page.getByRole("link", { name: "wc26" }))
      .toHaveAttribute("href", "/bet-suggester/wc26");
  });

// ------------------------- chips ride the client router -------------------------

test("a top-bar chip navigates client-side, not with a full document load",
  async ({ page }) => {
    await openBoard(page);
    await page.evaluate(() => {
      (window as unknown as { __spa_marker?: number }).__spa_marker = 1;
    });
    await page.getByRole("link", { name: "Leagues", exact: true }).click();
    await page.waitForURL(/\/bet-suggester\/leagues/);
    // a hard load would have wiped the marker with the JS heap
    expect(await page.evaluate(() =>
      (window as unknown as { __spa_marker?: number }).__spa_marker)).toBe(1);
  });

// ------------------------------- custom 404 -------------------------------

test("an unknown address gets the app's own 404, with a way back",
  async ({ page, request }) => {
    const r = await request.get("/bet-suggester/no-such-page");
    expect(r.status()).toBe(404);
    await page.goto("/bet-suggester/no-such-page");
    await expect(page.getByRole("heading",
      { name: /There is nothing at this address/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /go to the picker board/i }))
      .toHaveAttribute("href", "/bet-suggester");
  });

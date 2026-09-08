import { expect, test } from "@playwright/test";

// La Liga hub — recorded-shape payloads: every /api/laliga read this
// surface makes is answered from this file, and a tripwire in serve()
// enforces that rather than trusting it (see the note there for the
// one class of live read that remains, and why). The three assertions
// that matter are decision-safety invariants:
//
//  1. PRESEASON standings arrive as tables=[] + preseason=true (the
//     backend suppresses ESPN's real 20-row all-zero payload). The
//     surface must show the explicit reason — never a zero-row table
//     that reads as a season, never a bare "unavailable".
//  2. The model is DARK (laliga-2026-v0 has no approval): no odds chip
//     may render, the dark state must be stated in words, and no bare
//     TAKE may appear anywhere.
//  3. Kalshi coverage is unverified: the books empty state carries the
//     probe's answer (series listed, no 2026-27 events), not a guess.

const SCOREBOARD = {
  fixtures: [{
    id: "401882926",
    date: "2026-08-15T17:30Z",
    state: "pre",
    detail: "Sat, August 15th at 1:30 PM EDT",
    venue: "Mendizorrotza",
    home: { name: "Alavés", abbrev: "ALA" },
    away: { name: "Getafe", abbrev: "GET" },
  }],
};

const PRESEASON_STANDINGS = { tables: [], preseason: true,
                              generated_at: "2026-07-28T12:00:00Z" };

const MARKETS = {
  games: [],
  futures: [],
  kalshi: { series: "KXLALIGAGAME", series_exists: true,
            open_events: 0, coverage_verified: false },
};

const DARK_ODDS = { odds: [], shadow: true, model_dark: true,
                    real_money_signals: false };

// THE SIXTH READ (added 2026-09-07). LaligaDashboard fetches six URLs
// in ONE `Promise.all`, and this file recorded five: `/api/laliga/
// status` went to the real backend on every test in this describe.
// Because the six are awaited together, that one unmocked read gated
// the whole render — the hub sat at "loading fixtures…" and "State
// unavailable" with all five recorded payloads in hand — so under
// suite contention the assertions below timed out on a read they were
// written not to depend on. Worse while it passed: the "dark" tests
// were reading PRODUCTION's La Liga approval state, so an approval
// landing on prod would have flipped a recorded-world assertion.
const DARK_STATUS = {
  model_version: "laliga-2026-v0",
  model_dark: true,
  model_dark_note: "No odds render until an approval is earned through "
    + "the evaluation ladder on real 2026-27 results.",
  counts: { blockers: [] },
};

/** Serve the recorded La Liga world, and REFUSE any La Liga read it
 *  did not record.
 *
 *  The header of this file claims "no backend". For the surface under
 *  test that was an intention, not a construction: a laliga fetch
 *  nobody thought to record simply left for the live backend, and the
 *  reader of this file could not tell. The tripwire is registered
 *  FIRST so every specific route below overrides it (Playwright
 *  matches routes in reverse registration order), which makes an
 *  unrecorded read fail fast and by name instead of hanging a
 *  Promise.all on the internet.
 *
 *  SCOPED TO /api/laliga/ ON PURPOSE, and the scope is a finding, not
 *  an oversight: measured 2026-09-07, loading `?league=laliga` also
 *  fires five MLS reads (scoreboard, markets, odds, schedule,
 *  standings) because the carousel mounts the MLS pane on the way
 *  through to the deep-linked one. They are real live reads and they
 *  are NOT this spec's subject — MlsDashboard is a different component
 *  with its own Promise.all, so its latency cannot gate the La Liga
 *  render the way `/api/laliga/status` did. They are left alone rather
 *  than recorded because recording them would put a second hub's empty
 *  states on the page, and two assertions here — "no <table> exists"
 *  and "no element reads exactly `standings unavailable`" — are about
 *  the WHOLE page and would then be answered by the wrong pane.
 *
 *  Returns the La Liga paths that escaped, so a test can assert. */
async function serve(page: import("@playwright/test").Page) {
  const escaped: string[] = [];
  await page.route("**/api/laliga/**", (r) => {
    escaped.push(new URL(r.request().url()).pathname);
    return r.fulfill({ status: 599, contentType: "application/json",
      body: JSON.stringify({ error: "unrecorded read", detail:
        "this spec answers the La Liga surface from its own recorded "
        + "payloads: every /api/laliga read it depends on must be "
        + "written here, and this one was not" }) });
  });
  await page.route("**/api/laliga/status", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(DARK_STATUS) }));
  await page.route("**/api/laliga/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(SCOREBOARD) }));
  await page.route("**/api/laliga/standings", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(PRESEASON_STANDINGS) }));
  await page.route("**/api/laliga/schedule**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: SCOREBOARD.fixtures }) }));
  await page.route("**/api/laliga/markets", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(MARKETS) }));
  await page.route("**/api/laliga/odds", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(DARK_ODDS) }));
  return escaped;
}

test.describe("La Liga hub", () => {
  test("every La Liga read this page makes is one this file recorded",
    async ({ page }) => {
      // THE COUNTERWEIGHT to the tripwire above: it must be watching a
      // page that really reads, or "nothing escaped" would also be
      // true of a page that fetched nothing at all. So a recorded
      // fixture has to be on screen before the escape list is read,
      // and this test is what makes the file's header a construction
      // rather than a sentence.
      const escaped = await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(page.getByText("Alavés").first()).toBeVisible();
      expect(escaped, "these La Liga reads left for the live backend — "
        + "record them here, or this spec is only hermetic on a good day")
        .toEqual([]);
    });

  test("preseason standings show the explicit reason, never a zero table",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(
        page.getByText(/no standings yet.*season kicks off/i)
      ).toBeVisible();
      // no standings table may exist (the fixture list is a list, not
      // a table — so an accidental zero-row TABLE is detectable)
      await expect(page.locator("table")).toHaveCount(0);
      await expect(page.getByText(/^standings unavailable$/i))
        .toHaveCount(0);
    });

  test("dark model: no odds chip, the dark state is stated, no bare TAKE",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(page.getByText("Alavés").first()).toBeVisible();
      // the dark posture is stated in words on the markets section
      await expect(page.getByText(/laliga-2026-v0 is\s+dark/i))
        .toBeVisible();
      // no shadow-odds chip renders anywhere (H · D · A pattern)
      await expect(page.getByText(/H \d+ · D \d+ · A \d+/)).toHaveCount(0);
      // decision safety: never a bare TAKE on any league surface
      await expect(page.getByText(/\bTAKE\b/)).toHaveCount(0);
    });

  test("books empty state carries the probe's verified answer",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(
        page.getByText(/kalshi lists the KXLALIGAGAME series but no 2026-27 events yet/i)
      ).toBeVisible();
    });

  test("fixture card shows WHEN it kicks off and accented names intact",
    async ({ page }) => {
      await serve(page);
      await page.goto("/bet-suggester?league=laliga");
      await expect(page.getByText("Alavés").first()).toBeVisible();
      // the derived kickoff (Aug 15/16 depending on viewer TZ), never
      // the provider's bare detail string
      await expect(
        page.getByText(/AUG\s+1[56].*\d{1,2}:\d{2}/i).first()
      ).toBeVisible();
    });
});

test.describe("La Liga match page", () => {
  const MATCH = {
    match: {
      id: "401882926", date: "2026-08-15T17:30Z", state: "pre",
      detail: "Sat, August 15th", venue: "Mendizorrotza",
      home: { name: "Alavés", abbrev: "ALA" },
      away: { name: "Getafe", abbrev: "GET" },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [], model: null, lineups: null,
  };

  test("dark model is stated on the hero and in the model bar",
    async ({ page }) => {
      await page.route("**/api/card/**", (route) =>   // hermetic: the card fetch stays recorded too
        route.fulfill({ status: 404, contentType: "application/json",
                        body: JSON.stringify({ error: "no live-plane fixture in this recorded world" }) }));
      await page.route("**/api/laliga/match/401882926", (r) =>
        r.fulfill({ status: 200, contentType: "application/json",
                    body: JSON.stringify(MATCH) }));
      await page.goto("/bet-suggester/laliga/401882926");
      await expect(
        page.getByText(/dark — no approval, no prediction/i)
      ).toBeVisible();
      await expect(
        page.getByText(/no approved model, so no prediction exists/i)
      ).toBeVisible();
      // the market bar's own empty state (no open book matched)
      await expect(
        page.getByText(/no open kalshi book matched/i)
      ).toBeVisible();
      // decision safety holds here too
      await expect(page.getByText(/\bTAKE\b/)).toHaveCount(0);
      await expect(page.getByText(/shadow/i).first()).toBeVisible();
    });
});

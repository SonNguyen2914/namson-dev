import { expect, test, type Page } from "@playwright/test";

import { RATINGS_COPY } from "../src/components/RatingsBlock";

// THE LIVE PLAYER-RATINGS +/- BLOCK ON THE MATCH HUB (2026-10-01).
//
// Hermetic: the hub's match read, the card read and the live-performance
// read are all served here with page.route. The live-performance payloads
// are shaped exactly as TRIVELA src/live_perf/read.py `fixture_view`
// builds them (schema `live-performance-v0`): `latest.home/away` carry
// live_rating / expected_rating / delta / players_rated_on_pitch,
// `series[].h/a` are [live, expected, delta, sot, xg], and
// `espn.series[].h/a` are [xg, xg_last15, momentum, sot, corners, red
// cards]. Nothing here reaches a backend.
//
// The states Son approved, each pinned: collection off (the route's 404 —
// LIVE_PERF_ENABLED is unset on Railway, so it is every match today),
// live, held, the red-card break with its caption, missing ratings named,
// and the framing (untested · shadow · not advice · a read, not a signal)
// on every one of them — at 375 and 1280, with no horizontal scroll and
// no page error.

const EVENT = "401879311";

const MATCH = {
  match: {
    id: EVENT,
    date: new Date(Date.now() - 70 * 60_000).toISOString(),
    state: "in",
    detail: "70'",
    minute: "70'",
    venue: "Emirates Stadium",
    home: { name: "Arsenal", abbrev: "ARS", score: "1" },
    away: { name: "Manchester United", abbrev: "MAN", score: "0" },
    stats: [],
    events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: null,
  books: [],
  model: null,
  lineups: null,
  generated_at: new Date().toISOString(),
};

type Side = { live_rating: number | null; expected_rating: number | null;
  delta: number | null; players_rated_on_pitch: number | null };

const side = (live: number | null, exp: number | null,
  n: number | null): Side => ({
  live_rating: live, expected_rating: exp,
  delta: live != null && exp != null ? Math.round((live - exp) * 1e4) / 1e4
    : null,
  players_rated_on_pitch: n });

/** A per-minute apif series, every 5', both sides rated. */
function series(toMinute: number) {
  const rows = [];
  for (let m = 5; m <= toMinute; m += 5) {
    const dh = 0.05 * Math.sin(m / 10);
    const da = -0.04 * Math.cos(m / 12);
    rows.push({ m, t: "", st: m <= 45 ? "1H" : "2H", g: [0, 0],
      h: [6.9 + dh, 6.9, dh, 1, 0.4], a: [6.8 + da, 6.8, da, 1, 0.3],
      cad: 60 });
  }
  return rows;
}

/** ESPN state rows; `redAwayFrom` sets the away side's red-card count. */
function espnSeries(toMinute: number, redAwayFrom?: number) {
  const rows = [];
  for (let m = 5; m <= toMinute; m += 5) {
    const red = redAwayFrom != null && m >= redAwayFrom ? 1 : 0;
    rows.push({ m, t: "", st: "2H", g: [1, 0],
      h: [0.5, 0.1, 0.02, 2, 3, 0], a: [0.3, 0.05, 0.01, 1, 2, red] });
  }
  return rows;
}

function perf(over: Partial<{ latest: unknown; series: unknown;
  espn: unknown }> = {}) {
  return {
    schema_version: "live-performance-v0",
    generated_at: new Date().toISOString(),
    competition: "epl", event_id: EVENT, apif_fixture_id: 1,
    kickoff: MATCH.match.date,
    home: "Arsenal", away: "Manchester United",
    latest: {
      minute: 70, elapsed: 70, extra: null, status: "2H",
      captured_at: new Date().toISOString(), age_s: 20,
      score: { home: 1, away: 0 },
      home: side(7.12, 6.9, 11), away: side(6.71, 6.8, 11),
      delta_gap: 0.31, goals_share: {}, cadence_s: 60, source: "apif" },
    series: series(70),
    espn: { available: true, series: espnSeries(70) },
    notes: {},
    ...over,
  };
}

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body) });

async function openHub(page: Page,
  answer: { status: number; body: unknown }) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("**/api/card/**", (r) =>
    r.fulfill(json({ detail: "not served in this spec" }, 404)));
  await page.route(`**/api/epl/match/${EVENT}`, (r) => r.fulfill(json(MATCH)));
  await page.route(`**/api/live-performance/${EVENT}`, (r) =>
    r.fulfill(json(answer.body, answer.status)));
  await page.goto(`/bet-suggester/epl/${EVENT}`);
  const block = page.getByTestId("ratings-block");
  await expect(block).toBeVisible();
  return { block, errors };
}

async function framed(block: ReturnType<Page["getByTestId"]>) {
  await expect(block.getByTestId("ratings-untested")).toHaveText(
    RATINGS_COPY.untested);
  await expect(block).toContainText(RATINGS_COPY.shadow);
  await expect(block).toContainText(RATINGS_COPY.read);
  // never a bare TAKE, never an "edge" claim on this surface
  await expect(block).not.toContainText(/\bTAKE\b/);
  await expect(block).not.toContainText(/\bedge\b/i);
}

async function noSideScroll(page: Page) {
  const over = await page.evaluate(() =>
    document.documentElement.scrollWidth
      - document.documentElement.clientWidth);
  expect(over, "the page scrolls sideways").toBeLessThanOrEqual(0);
}

for (const width of [375, 1280]) {
  test.describe(`ratings block at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("collection off: the 404 is named, never a zero", async ({ page }) => {
      const { block, errors } = await openHub(page, { status: 404,
        body: { detail: `no live-performance record for event ${EVENT}` } });
      await expect(block.getByTestId("ratings-off")).toContainText(
        RATINGS_COPY.off);
      await expect(block).toContainText("This is not a zero");
      await expect(block.getByTestId("ratings-line")).toHaveCount(0);
      await expect(block.getByTestId("ratings-home")).toHaveCount(0);
      await framed(block);
      await noSideScroll(page);
      expect(errors).toEqual([]);
    });

    test("collection off, said by the payload itself", async ({ page }) => {
      const { block, errors } = await openHub(page, { status: 200,
        body: { ...perf(), collection_enabled: false } });
      await expect(block.getByTestId("ratings-off")).toContainText(
        RATINGS_COPY.off);
      await expect(block.getByTestId("ratings-home")).toHaveCount(0);
      expect(errors).toEqual([]);
    });

    test("live: each side's +/- in plain ink with its two numbers",
      async ({ page }) => {
        const { block, errors } = await openHub(page,
          { status: 200, body: perf() });
        await expect(block.getByTestId("ratings-live")).toBeVisible();
        await expect(block.getByTestId("ratings-live")).toContainText(
          "reading at 70'");
        const home = block.getByTestId("ratings-home");
        const away = block.getByTestId("ratings-away");
        await expect(home).toContainText("Arsenal");
        await expect(home).toContainText("+0.22");
        await expect(home).toContainText("7.12 vs 6.90");
        await expect(away).toContainText("−0.09");
        // PLAIN INK: the +/- carries no verdict colour. Both signs are
        // drawn in the same colour, and it is not a green or a red.
        const colour = async (l: typeof home) => l.locator(
          "span.font-mono").first().evaluate((e) => getComputedStyle(e).color);
        const ch = await colour(home);
        expect(await colour(away)).toBe(ch);
        // the ink tokens are hex, so they compute to rgb(); any Tailwind
        // palette hue (green-, red-, emerald-…) computes to oklch/lab
        expect(ch, `the +/- is not in an ink token (${ch})`).toMatch(/^rgb/);
        const [r, g, b] = (ch.match(/\d+(\.\d+)?/g) ?? []).map(Number);
        expect(Math.max(r, g, b) - Math.min(r, g, b),
          `the +/- is tinted (${ch})`).toBeLessThan(30);
        await expect(block.getByTestId("ratings-line")).toBeVisible();
        // no red card: one unbroken line per side
        await expect(block.getByTestId("ratings-seg-home")).toHaveCount(1);
        await expect(block.getByTestId("ratings-red-mark")).toHaveCount(0);
        await framed(block);
        await noSideScroll(page);
        expect(errors).toEqual([]);
      });

    test("held: an old reading is dimmed and carries its minute",
      async ({ page }) => {
        const body = perf();
        body.latest = { ...(body.latest as object), minute: 63, age_s: 600 };
        const { block, errors } = await openHub(page, { status: 200, body });
        const held = block.getByTestId("ratings-held");
        await expect(held).toBeVisible();
        await expect(held).toContainText("held · last reading 63'");
        expect(Number(await held.evaluate(
          (e) => getComputedStyle(e).opacity))).toBeLessThan(1);
        await expect(block.getByTestId("ratings-live")).toHaveCount(0);
        await framed(block);
        expect(errors).toEqual([]);
      });

    test("red card: the line breaks at the minute, is marked, and the "
      + "caption says the +/- covers the 10 still on", async ({ page }) => {
      const body = perf({ espn: { available: true,
        series: espnSeries(70, 58) } });
      const { block, errors } = await openHub(page, { status: 200, body });
      // ESPN rows every 5': the first one down a man is 60'
      await expect(block.getByTestId("ratings-red-mark")).toHaveCount(1);
      await expect(block.getByTestId("ratings-seg-home")).toHaveCount(2);
      await expect(block.getByTestId("ratings-seg-away")).toHaveCount(2);
      const cap = block.getByTestId("ratings-red-caption");
      await expect(cap).toContainText("Red card 60'");
      await expect(cap).toContainText("Manchester United");
      await expect(cap).toContainText("covers the 10 still on");
      // and the +/- KEEPS showing after it
      await expect(block.getByTestId("ratings-away")).toContainText(
        "−0.09");
      await framed(block);
      await noSideScroll(page);
      expect(errors).toEqual([]);
    });

    test("missing ratings are named, never blank", async ({ page }) => {
      const body = perf();
      body.latest = { ...(body.latest as object),
        home: side(null, 6.9, 0), away: side(6.7, null, 10) };
      const { block, errors } = await openHub(page, { status: 200, body });
      await expect(block.getByTestId("ratings-home-missing")).toHaveText(
        "rating missing — no player on the pitch carries a rating yet");
      await expect(block.getByTestId("ratings-away-missing")).toHaveText(
        "rating missing — no pre-match expectation was frozen for this side");
      await framed(block);
      expect(errors).toEqual([]);
    });

    test("a record with no rated minute says there is no +/-",
      async ({ page }) => {
        const { block, errors } = await openHub(page, { status: 200,
          body: perf({ latest: null, series: [],
            espn: { available: false, series: [] } }) });
        await expect(block.getByTestId("ratings-no-reading")).toHaveText(
          RATINGS_COPY.noReading);
        await expect(block.getByTestId("ratings-line")).toHaveCount(0);
        expect(errors).toEqual([]);
      });

    test("a failed read is named with its status", async ({ page }) => {
      const { block, errors } = await openHub(page, { status: 503,
        body: { detail: "live performance lives on the live plane, which "
          + "is not configured here" } });
      await expect(block.getByTestId("ratings-failed")).toContainText(
        "HTTP 503");
      await expect(block.getByTestId("ratings-off")).toHaveCount(0);
      await framed(block);
      expect(errors).toEqual([]);
    });
  });
}

test("the block is not on a hub before kickoff", async ({ page }) => {
  await page.route("**/api/card/**", (r) =>
    r.fulfill(json({ detail: "not served in this spec" }, 404)));
  await page.route(`**/api/epl/match/${EVENT}`, (r) => r.fulfill(json({
    ...MATCH, match: { ...MATCH.match, state: "pre", detail: "Scheduled",
      date: new Date(Date.now() + 86_400_000).toISOString() } })));
  let asked = false;
  await page.route(`**/api/live-performance/**`, (r) => {
    asked = true;
    return r.fulfill(json({}, 404));
  });
  await page.goto(`/bet-suggester/epl/${EVENT}`);
  await expect(page.getByText("Arsenal").first()).toBeVisible();
  await expect(page.getByTestId("ratings-block")).toHaveCount(0);
  expect(asked).toBe(false);
});

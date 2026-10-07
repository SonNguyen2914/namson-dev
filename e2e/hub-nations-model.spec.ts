/** EVERY HUB SHOWS OUR MODEL WHERE THE BACKEND HAS A READ (hub-champ-fix,
 *  2026-10-06).
 *
 *  Son: "I didn't see any model in the championships matches". The
 *  payload did carry the trader's model (`traders_model`, unified-nb-v1,
 *  tested) on every UNL / CNL / AFCON hub, but the page drew it as one
 *  small line and then contradicted it three times: a box headed "no
 *  model read for this competition … no model number appears on this
 *  page", a markets-card bar reading "no model read — no prediction
 *  exists", and a model-vs-market chart whose SOLID line is the in-play
 *  engine run on the T-10 Kalshi book (no model at all) labelled "model".
 *  And the chart's "mkt" (Kalshi quotes STORED while the book was open)
 *  sat above a panel saying no open Kalshi book matched, with nothing to
 *  say the two read different moments.
 *
 *  What is pinned, on every nations hub and one league:
 *   1. the trader's 1X2 is in the hero AND in the markets card, labelled
 *      tested/untested and "shadow · not advice";
 *   2. the refusal names a missing SHADOW model and never denies the
 *      trader's line;
 *   3. the chart names Kalshi (and its event) as the market, and on a
 *      state-only competition calls its solid line the engine, not a model;
 *   4. the Kalshi panel says it reads the CURRENT open list, and that the
 *      chart draws the stored quotes;
 *   5. absent and not-served trader reads are NAMED.
 *
 *  HERMETIC. Every /api/ read is answered in the page with SYNTHETIC
 *  payloads in the routes' real shapes (TRIVELA src/match_hubs.py,
 *  src/trading/hub_line.py, src/live/minutes.py). Teams are invented and
 *  every kickoff is on or before 2026-09-27.
 *
 *  Screenshots: with HUB_SHOT_DIR set, the last test writes a CNL, UNL,
 *  AFCON and MLS hub at 1440 and 400 px into that directory. */
import { test, expect, type Page } from "@playwright/test";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});
const EVENT = "990077";
const KICK = "2026-09-26T18:00:00Z";
const CLOCK = "2026-09-26T21:00:00Z";
const MINUS = "−";

const SERIES_OF: Record<string, string> = {
  unl: "KXUEFANLGAME", cnl: "KXCONCACAFNLGAME", afcon: "KXAFCONGAME",
};

/** `traders_model` exactly as src/trading/hub_line.py builds it. */
function trader(tested: boolean, p: [number, number, number]) {
  return {
    title: tested ? "trader's model (tested)" : "trader's model (untested)",
    tested, available: true,
    means: "What the trading agent prices this match from, read through the "
      + "same interface it uses. EXPERIMENTAL, UNPROVEN: 'tested' means only "
      + "that it passed a pre-registered replay of pre-seal history against "
      + "the model it replaced — not a forecast of profit.",
    label: "experimental, unproven", fixture_key: "live:9001",
    source: tested ? "unified_model" : "ratings_model",
    model: tested ? "unified-nb-v1" : "ratings-v2",
    verdict: tested ? "NOT_WORSE" : null, read_at: KICK,
    p_home: p[0], p_draw: p[1], p_away: p[2],
    lam_home: 1.41, lam_away: 0.88, inputs_as_of: "2026-09-25T00:00:00+00:00",
  };
}

const REFUSAL = {
  state: "no_model_plane",
  why: "no shadow model is fitted for this competition, so no approval "
    + "decision exists and no shadow-model number appears on this page. The "
    + "trader's model line (`traders_model`), when served, is the trading "
    + "agent's own pre-match read — experimental, labelled tested or "
    + "untested, not an approved shadow model. The board's own pre-kickoff "
    + "read, when one was frozen, is under `board_read` — a read, not a "
    + "signal.",
  instead: "board_read", note: null,
};

/** /api/comp/{key}/match/{id} for a nations hub, post-match, no open book. */
function nationsHub(key: string, extra: Record<string, unknown> = {}) {
  return {
    competition: key, display: key.toUpperCase(), espn_league: "synthetic",
    match: {
      id: EVENT, date: "2026-09-26T18:00Z", state: "post", detail: "FT",
      venue: "Synthetic National Stadium",
      home: { name: "Northland", abbrev: "NOR", score: "1", color: "1f6fd1" },
      away: { name: "Southmark", abbrev: "SOU", score: "0", color: "c8332b" },
      stats: [{ key: "possessionPct", label: "Possession", home: "61", away: "39" }],
      events: [{ minute: "31'", type: "Goal", team: "NOR", text: "Goal", scoring: true }],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [],
    book_meta: {
      series: SERIES_OF[key] ?? "KXSYNTHGAME", tradeable_events: 0,
      truncated: false, max_age_seconds: 300.0, observed_at: null,
      status: "unavailable", bridge: "unmapped",
      means: "no open event on this series names both teams on this date. "
        + "A settled book LEAVES the open list, so for a finished match this "
        + "is expected",
      families: {},
      families_not_read_because: "the winner event was not bridged to this "
        + "match, so there is no ticker suffix to join any other family by",
      other_series: [],
    },
    model: null, model_refusal: REFUSAL,
    board_read: { origin: "unavailable", origin_label: "NOT AVAILABLE",
      origin_note: "no pre-kickoff board read was frozen for this fixture",
      unavailable_reason: "not_frozen", store_read: "ok", state: null },
    venue_class: null, lineups: null,
    framing: "Shadow · not advice — a read, not a signal.",
    generated_at: CLOCK,
    traders_model: trader(true, [0.612, 0.231, 0.157]),
    ...extra,
  };
}

/** /api/minutes/{key}/{id} for a STATE-ONLY competition (src/live/minutes.py):
 *  model_label "NO MODEL", the solid line the engine on the T-10 book. */
function anchoredSeries(key: string, withSource = true) {
  const kick = new Date(KICK).getTime();
  const at = (m: number) => new Date(kick + m * 60_000 + 40_000).toISOString();
  const minutes = [];
  for (let m = 0; m <= 90; m++) {
    const goal = m >= 31 ? 1 : 0;
    const eng = goal
      ? { home: 78.4, draw: 15.1, away: 6.5 }
      : { home: Math.round((58 - m * 0.05) * 10) / 10, draw: 25.0,
          away: Math.round((17 + m * 0.05) * 10) / 10 };
    const mk = goal
      ? { home: 80.2, draw: 13.9, away: 5.9 }
      : { home: Math.round((57 - m * 0.04) * 10) / 10, draw: 26.0,
          away: Math.round((17 + m * 0.04) * 10) / 10 };
    minutes.push({ m, at: at(m), tape: true,
      score: { home: goal, away: 0 }, model: eng, model_from: m,
      market: mk, market_at: at(m) });
  }
  const ticker = `${SERIES_OF[key] ?? "KXSYNTHGAME"}-26SEP26NORSOU`;
  return {
    available: true, competition: key, event_id: EVENT, kickoff_utc: KICK,
    state: "post",
    units: "percentage points, one decimal; each model or market triple is one instant's reading",
    model_basis: "NO MODEL · state-only competition: the line is the in-play "
      + "engine run on the de-vigged T-10 MARKET book (anchor=t10_market_devig), "
      + "not a model's belief — no model run, approval or lock exists for it",
    model_label: "NO MODEL",
    market_basis: "market: Kalshi's de-vigged three-way ASK book as of that "
      + "instant (the newest stored quote per leg). De-vig removes the "
      + "overround, not the half-spread",
    ...(withSource ? { market_source: { venue: "kalshi", event_ticker: ticker,
      series: SERIES_OF[key] ?? "KXSYNTHGAME",
      means: "Kalshi's regular-time three-way event mapped to this match on "
        + "the live plane: the quotes it stored while the book was open, as "
        + "of each instant — not the current open book, which a settled book "
        + "leaves" } } : {}),
    label: "shadow · not advice", note: "a read, not a signal",
    fee_floor: { home: 5.16, draw: 3.0, away: 4.59 }, lock: null,
    pre: { runs: [], market: [
      { t: -60, at: "2026-09-26T17:00:00+00:00", market: { home: 57.4, draw: 25.8, away: 16.8 } },
      { t: -12, at: "2026-09-26T17:48:00+00:00", market: { home: 57.0, draw: 26.0, away: 17.0 } },
    ] },
    minutes,
    events: [{ m: 31, type: "goal", team: "home", score: { home: 1, away: 0 } }],
    latest: { captured_at: at(90), minute: 90, age_seconds: 9000 },
    generated_at: CLOCK,
  };
}

/** /api/mls/match/{id} — a league with a fitted shadow model. */
function mlsHub() {
  return {
    match: {
      id: EVENT, date: "2026-09-26T18:00Z", state: "post", detail: "FT",
      venue: "Synthetic Park",
      home: { name: "Harbour FC (illustrative)", abbrev: "HAR", score: "1", color: "4f7be8" },
      away: { name: "Redgate SC (illustrative)", abbrev: "RDG", score: "0", color: "b65fd6" },
      stats: [{ key: "possessionPct", label: "Possession", home: "52", away: "48" }],
      events: [], scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [],
    model: { model_version: "mls-2026-v0", shadow: true,
      primary: { run_type: "t10", captured_at: "2026-09-26T17:50:00Z", seed: 7,
        n_simulations: 20000,
        outcomes: { home_win: 0.468, draw: 0.262, away_win: 0.270 },
        xg: { home: 1.52, away: 1.11 },
        scorelines: [{ score: "1-1", prob: 0.121 }, { score: "1-0", prob: 0.104 }] },
      t10_lock: { run_type: "t10", captured_at: "2026-09-26T17:50:00Z" } },
    lineups: null, generated_at: CLOCK,
    traders_model: trader(false, [0.455, 0.27, 0.275]),
  };
}

function modelSeries() {
  const s = anchoredSeries("mls") as Record<string, unknown>;
  return { ...s, competition: "mls",
    model_basis: "model · live: the in-play engine's triple stored with each "
      + "state-tape row; before kickoff, each complete model run, the T-10 "
      + "lock among them",
    model_label: null,
    market_source: { venue: "kalshi", event_ticker: "KXMLSGAME-26SEP26HARRDG",
      series: "KXMLSGAME", means: "stored while the book was open" } };
}

async function open(page: Page, path: string, routes: Record<string, unknown>) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: new Date(CLOCK) });
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  for (const [glob, body] of Object.entries(routes))
    await page.route(glob, (r) => r.fulfill(json(body)));
  await page.goto(path);
  return errors;
}

const NATIONS = ["unl", "cnl", "afcon"] as const;

for (const key of NATIONS) {
  test(`${key} hub shows the trader's model, names Kalshi, and never denies either`, async ({ page }) => {
    const errors = await open(page, `/bet-suggester/${key}/${EVENT}`, {
      [`**/api/comp/${key}/match/${EVENT}`]: nationsHub(key),
      [`**/api/minutes/${key}/${EVENT}`]: anchoredSeries(key),
    });
    // 1. the hero line: tested, 1X2, shadow · not advice
    const line = page.getByTestId("traders-model");
    await expect(line).toHaveAttribute("data-tested", "yes");
    await expect(line).toContainText("trader's model (tested)");
    await expect(page.getByTestId("traders-model-shadow")).toHaveText(/shadow · not advice/i);
    await expect(page.getByTestId("traders-model-1x2"))
      .toContainText("NOR 61.2% · draw 23.1% · SOU 15.7%");
    // ... and the markets card carries the same three numbers, by name
    const card = page.getByTestId("markets-traders-model");
    await expect(card).toHaveAttribute("data-tested", "yes");
    await expect(card).toContainText(/trader's model \(tested\) · shadow · not advice/i);
    await expect(card).toContainText("61.2%");
    await expect(card).toContainText("15.7%");
    await expect(page.getByText(/no shadow model for this competition, and no trader/i)).toHaveCount(0);
    // 2. the refusal names a missing SHADOW model and points at the line
    const refusal = page.getByTestId("model-refusal");
    await expect(refusal).toContainText("no shadow model for this competition");
    await expect(refusal).toContainText("trader's model line above, when served");
    await expect(refusal).not.toContainText("no model number appears");
    await expect(refusal).not.toContainText("`");
    // 3. the chart: Kalshi is the market, the solid line is the ENGINE
    const src = page.getByTestId("mvm-source");
    await expect(src).toHaveAttribute("data-anchored", "yes");
    await expect(src).toContainText("Kalshi");
    await expect(src).toContainText(`${SERIES_OF[key]}-26SEP26NORSOU`);
    await expect(src).toContainText("not the current open book");
    await expect(src).toContainText("no model");
    await expect(page.getByTestId("mvm-legend")).toContainText("engine");
    await expect(page.getByTestId("mvm-legend")).toContainText("Kalshi");
    await expect(page.getByTestId("mvm-col-market")).toHaveText("Kalshi");
    await expect(page.getByTestId("mvm-col-model")).toHaveText("engine");
    await expect(page.getByTestId("mvm")).toContainText(`Gap = engine ${MINUS} Kalshi`);
    // 4. the panel reads the CURRENT open list, and says so
    await expect(page.getByText(/no open kalshi book for this fixture right now/i)).toBeVisible();
    await expect(page.getByTestId("book-vs-chart")).toContainText("CURRENT open list");
    await expect(page.getByTestId("book-meta")).toContainText("settled book LEAVES the open list");
    await expect(page.getByText(/^TAKE$/)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("a series from before market_source still names Kalshi as the market", async ({ page }) => {
  const errors = await open(page, `/bet-suggester/cnl/${EVENT}`, {
    [`**/api/comp/cnl/match/${EVENT}`]: nationsHub("cnl"),
    [`**/api/minutes/cnl/${EVENT}`]: anchoredSeries("cnl", false),
  });
  const src = page.getByTestId("mvm-source");
  await expect(src).toContainText("Kalshi");
  await expect(src).toHaveAttribute("data-ticker", "");
  expect(errors).toEqual([]);
});

test("an untested trader with no read is named, and the markets card says both are absent", async ({ page }) => {
  const absent = { title: "trader's model (untested)", tested: false, available: false,
    means: "…", label: "experimental, unproven", why: "fixture_not_keyed",
    detail: "the trader has no fixture for this match" };
  const errors = await open(page, `/bet-suggester/afcon/${EVENT}`, {
    [`**/api/comp/afcon/match/${EVENT}`]: nationsHub("afcon", { traders_model: absent }),
    [`**/api/minutes/afcon/${EVENT}`]: { available: false, code: "no_fixture",
      reason: "this match is not on the live plane, so no minute-by-minute read was recorded for it" },
  });
  await expect(page.getByTestId("traders-model")).toHaveAttribute("data-available", "no");
  await expect(page.getByTestId("traders-model-absent")).toContainText("fixture_not_keyed");
  await expect(page.getByTestId("markets-traders-model")).toHaveCount(0);
  await expect(page.getByText(/no shadow model for this competition, and no trader's read of this match/i)).toBeVisible();
  await expect(page.getByTestId("mvm-absent")).toContainText("not on the live plane");
  expect(errors).toEqual([]);
});

test("a payload without traders_model says the line was not served", async ({ page }) => {
  const body = nationsHub("unl") as Record<string, unknown>;
  delete body.traders_model;
  const errors = await open(page, `/bet-suggester/unl/${EVENT}`, {
    [`**/api/comp/unl/match/${EVENT}`]: body,
    [`**/api/minutes/unl/${EVENT}`]: anchoredSeries("unl"),
  });
  await expect(page.getByTestId("traders-model-missing")).toContainText("not in this payload");
  expect(errors).toEqual([]);
});

test("a league with a shadow model keeps 'model' on the chart and its own bar in the card", async ({ page }) => {
  const errors = await open(page, `/bet-suggester/mls/${EVENT}`, {
    [`**/api/mls/match/${EVENT}`]: mlsHub(),
    [`**/api/minutes/mls/${EVENT}`]: modelSeries(),
  });
  await expect(page.getByTestId("traders-model")).toHaveAttribute("data-tested", "no");
  await expect(page.getByTestId("traders-model-shadow")).toBeVisible();
  await expect(page.getByTestId("mvm-source")).toHaveAttribute("data-anchored", "no");
  await expect(page.getByTestId("mvm-source")).toContainText("KXMLSGAME-26SEP26HARRDG");
  await expect(page.getByTestId("mvm-legend")).toContainText("model");
  await expect(page.getByTestId("mvm-col-model")).toHaveText("model");
  await expect(page.getByTestId("markets-traders-model")).toHaveCount(0);
  await expect(page.getByText("model outcome probabilities")).toBeVisible();
  expect(errors).toEqual([]);
});

test("screenshots: nations and league hubs at 1440 and 400", async ({ browser }) => {
  const dir = process.env.HUB_SHOT_DIR;
  test.skip(!dir, "HUB_SHOT_DIR not set");
  test.setTimeout(180_000);
  const cases: Array<[string, string, Record<string, unknown>]> = [
    ...NATIONS.map((k) => [k, `/bet-suggester/${k}/${EVENT}`, {
      [`**/api/comp/${k}/match/${EVENT}`]: nationsHub(k),
      [`**/api/minutes/${k}/${EVENT}`]: anchoredSeries(k),
    }] as [string, string, Record<string, unknown>]),
    ["mls", `/bet-suggester/mls/${EVENT}`, {
      [`**/api/mls/match/${EVENT}`]: mlsHub(),
      [`**/api/minutes/mls/${EVENT}`]: modelSeries(),
    }],
  ];
  for (const [name, path, routes] of cases) {
    for (const width of [1440, 400]) {
      const ctx = await browser.newContext({ viewport: { width, height: 1000 } });
      const page = await ctx.newPage();
      const errors = await open(page, path, routes);
      await expect(page.getByTestId("mvm-root")).toBeVisible();
      await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = false; }));
      const [sw, iw] = await page.evaluate(() =>
        [document.documentElement.scrollWidth, window.innerWidth]);
      expect(sw, `${name}@${width} scrolls sideways`).toBeLessThanOrEqual(iw);
      // scroll the whole page once so every scroll-revealed block draws
      for (let y = 0; y < sw * 20; y += 600) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(60);
        if (await page.evaluate((yy) => yy > document.body.scrollHeight, y)) break;
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      // the fake clock holds scroll-reveal fades mid-way; show the end state
      await page.addStyleTag({ content: ".reveal,.reveal-row{opacity:1!important;transform:none!important}" });
      await page.waitForTimeout(1200);
      await expect(page.getByTestId(name === "mls" ? "traders-model" : "markets-traders-model")).toBeVisible();
      await page.screenshot({ path: `${dir}/hub-${name}-${width}.png`, fullPage: true });
      expect(errors).toEqual([]);
      await ctx.close();
    }
  }
});

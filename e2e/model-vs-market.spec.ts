import { expect, test, type Page, type Route } from "@playwright/test";

// MODEL vs MARKET, minute by minute — the match hub's round-5 section
// (components/ModelVsMarket.tsx), approved by Son on 2026-10-01.
//
// HERMETIC, every test: the hub's match feed, its card and the series
// itself are served with page.route, and the fixture is INVENTED
// ("HAR v RDG", illustrative numbers, not a real match and not model
// output). Nothing here reaches a backend.
//
// What is pinned:
//   1. live — the time row, the pill, one chart with six lines and
//      their line-end gaps, three rows;
//   2. ONE cursor — the minute, the chart's cursor and the rows move
//      together, by stepper, by key and by a tap on the chart;
//   3. the gap at each line end is the SAME number as its row, and is
//      green when +, red when −, neutral at 0.0 or "—";
//   4. a missed tape minute dims the model and names the minute it is
//      held from; a late feed is HELD, with a hatched no-data stretch;
//   5. before kickoff — steps, the T−10 padlock, the fee-floor band and
//      the per-row floor;
//   6. absent, refused, failed and malformed series are NAMED states,
//      never a crash;
//   7. at 375 and 1280 px: no horizontal scroll, no page error.

const EVENT = "401999123";
const MINUS = "−";

type Tri = { home: number; draw: number; away: number };
const r1 = (v: number) => Math.round(v * 10) / 10;
const tri = (h: number, d: number): Tri =>
  ({ home: r1(h), draw: r1(d), away: r1(100 - r1(h) - r1(d)) });

/** An invented match: home scores at 28′, the tape misses 27′, and the
 *  three gaps are deliberately one positive, one negative and one level
 *  at the end so every colour is exercised. */
function liveSeries(opts: { last: number; tapeAgeS: number }) {
  const now = Date.now();
  const lastAt = now - opts.tapeAgeS * 1000;
  const kick = lastAt - opts.last * 60_000 - 40_000;
  const minutes = [];
  let held: Tri | null = null;
  for (let m = 0; m <= opts.last; m++) {
    const goal = m >= 28 ? 6 : 0;
    const model = tri(58 - 0.1 * m + goal, 25.5 + 0.08 * m - goal / 2);
    const market = m === opts.last
      ? { home: r1(model.home - 3.6), draw: r1(model.draw + 3.6), away: model.away }
      : tri(55 - 0.08 * m + goal, 27 + 0.05 * m - goal / 2);
    const tape = m !== 27;
    if (tape) held = model;
    minutes.push({
      m, at: new Date(kick + m * 60_000 + 40_000).toISOString(), tape,
      score: { home: m >= 28 ? 1 : 0, away: 0 },
      model: tape ? model : held, model_from: tape ? m : 26,
      market, market_at: new Date(kick + m * 60_000 + 30_000).toISOString(),
    });
  }
  return {
    available: true, competition: "mls", event_id: EVENT,
    kickoff_utc: new Date(kick).toISOString(), state: "in",
    label: "shadow · not advice", note: "a read, not a signal",
    fee_floor: { home: 5.16, draw: 3.0, away: 4.59 },
    lock: { t: -10, at: new Date(kick - 600_000).toISOString(),
            model: tri(58, 25.5) },
    pre: { runs: [], market: [] },
    minutes,
    events: [{ m: 28, type: "goal", team: "home",
               score: { home: 1, away: 0 } }],
    latest: { captured_at: new Date(lastAt).toISOString(),
              minute: opts.last, age_seconds: opts.tapeAgeS },
    generated_at: new Date(now).toISOString(),
  };
}

function preSeries() {
  const now = Date.now();
  const kick = now + 6 * 60_000 + 20_000;
  const at = (t: number) => new Date(kick + t * 60_000).toISOString();
  return {
    available: true, competition: "mls", event_id: EVENT,
    kickoff_utc: new Date(kick).toISOString(), state: "pre",
    label: "shadow · not advice",
    fee_floor: { home: 5.16, draw: 3.0, away: 4.59 },
    lock: { t: -10, at: at(-10), model: { home: 33.8, draw: 24.8, away: 41.4 } },
    pre: {
      runs: [
        { t: -55, at: at(-55), lock: false, run_type: "scheduled",
          model: { home: 34.1, draw: 24.9, away: 41.0 } },
        { t: -10, at: at(-10), lock: true, run_type: "t10",
          model: { home: 33.8, draw: 24.8, away: 41.4 } },
      ],
      market: [
        { t: -60, at: at(-60), market: { home: 34.1, draw: 26.6, away: 39.3 } },
        { t: -30, at: at(-30), market: { home: 35.2, draw: 26.8, away: 38.0 } },
        { t: -8, at: at(-8), market: { home: 36.0, draw: 27.0, away: 37.0 } },
      ],
    },
    minutes: [], events: [], latest: null,
    generated_at: new Date(now).toISOString(),
  };
}

function matchPayload(state: "pre" | "in", minute?: string) {
  return {
    match: {
      id: EVENT,
      date: state === "pre"
        ? new Date(Date.now() + 6 * 60_000).toISOString()
        : new Date(Date.now() - 70 * 60_000).toISOString(),
      state, detail: state === "pre" ? "Scheduled" : minute, minute,
      venue: "Illustrative Ground",
      home: { name: "Harbour (illustrative)", abbrev: "HAR", color: "4f7be8" },
      away: { name: "Redgate (illustrative)", abbrev: "RDG", color: "b65fd6" },
      stats: [], events: [],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [], model: null, lineups: null,
    generated_at: new Date().toISOString(),
  };
}

async function serve(page: Page, opts: {
  state: "pre" | "in"; minute?: string;
  series: unknown;
}) {
  await page.route(`**/api/mls/match/${EVENT}`, (r) =>
    r.fulfill({ json: matchPayload(opts.state, opts.minute) }));
  await page.route("**/api/card/**", (r) =>
    r.fulfill({ status: 503, json: { detail: "not served in this test" } }));
  await page.route(`**/api/minutes/mls/${EVENT}`, (r) =>
    typeof opts.series === "function"
      ? (opts.series as (x: typeof r) => Promise<void>)(r)
      : r.fulfill({ json: opts.series }));
}

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

async function noHorizontalScroll(page: Page) {
  const [sw, iw] = await page.evaluate(() =>
    [document.documentElement.scrollWidth, window.innerWidth]);
  expect(sw, "the page scrolls sideways").toBeLessThanOrEqual(iw);
}

/** Every outcome: the row's gap, the line end's gap and its colour agree. */
async function expectGapsAgree(page: Page) {
  for (const o of ["home", "draw", "away"]) {
    const rowGap = await page.getByTestId(`mvm-row-gap-${o}`).textContent();
    const end = page.getByTestId(`mvm-end-gap-${o}`);
    await expect(end, `${o}: line end equals row`).toHaveText(rowGap ?? "");
    const sign = await end.getAttribute("data-sign");
    const fill = await end.getAttribute("fill");
    const t = (rowGap ?? "").trim();
    const want = t === "—" ? "none" : t.startsWith("+") ? "pos"
      : t.startsWith(MINUS) ? "neg" : "zero";
    expect(sign, `${o}: sign of ${t}`).toBe(want);
    expect(fill, `${o}: colour of ${t}`).toBe(
      want === "pos" ? "var(--up)" : want === "neg" ? "var(--neg)" : "var(--ink-mid)");
  }
}

for (const width of [375, 1280]) {
  test.describe(`model vs market @ ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("live: time row, one chart, three rows, gaps in colour", async ({ page }) => {
      const errors = watchErrors(page);
      await serve(page, { state: "in", minute: "63'",
        series: liveSeries({ last: 63, tapeAgeS: 12 }) });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const root = page.getByTestId("mvm-root");
      await expect(root).toHaveAttribute("data-mode", "live");
      await expect(page.getByTestId("mvm-minute")).toHaveText("63′");
      await expect(page.getByTestId("mvm-fresh")).toContainText("tape");
      await expect(page.getByTestId("mvm-live")).toHaveText(/live/i);
      await expect(page.getByTestId("mvm")).toContainText("shadow · not advice");
      await expect(page.getByTestId("mvm")).toContainText("A read, not a signal");
      for (const o of ["home", "draw", "away"])
        await expect(page.getByTestId(`mvm-lines-${o}`).locator("path")).toHaveCount(2);
      // at now: home +3.6 (green), draw −3.6 (red), away 0.0 (neutral)
      await expect(page.getByTestId("mvm-end-gap-home")).toHaveText("+3.6");
      await expect(page.getByTestId("mvm-end-gap-draw")).toHaveText(`${MINUS}3.6`);
      await expect(page.getByTestId("mvm-end-gap-away")).toHaveText("0.0");
      await expectGapsAgree(page);
      // the row's gap is PLAIN ink, never the traffic light
      const rowInk = await page.getByTestId("mvm-row-gap-home").evaluate(
        (el) => getComputedStyle(el).color);
      const upInk = await page.evaluate(() => {
        const d = document.createElement("span");
        d.style.color = "var(--up)"; document.body.appendChild(d);
        const c = getComputedStyle(d).color; d.remove(); return c;
      });
      expect(rowInk).not.toBe(upInk);
      await expect(page.getByTestId("mvm-ev-goal")).toHaveCount(1);
      await noHorizontalScroll(page);
      expect(errors).toEqual([]);
    });

    test("one cursor: minute, chart and rows move together", async ({ page }) => {
      const errors = watchErrors(page);
      await serve(page, { state: "in", minute: "63'",
        series: liveSeries({ last: 63, tapeAgeS: 12 }) });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const root = page.getByTestId("mvm-root");
      await expect(root).toHaveAttribute("data-cursor", "63");
      // stepper
      await page.getByTestId("mvm-prev").click();
      await expect(root).toHaveAttribute("data-cursor", "62");
      await expect(page.getByTestId("mvm-minute")).toHaveText("62′");
      await expect(page.getByTestId("mvm-cursor")).toHaveAttribute("data-t", "62");
      await expect(page.getByTestId("mvm-live")).toHaveText(/back to live/i);
      await expectGapsAgree(page);
      // keys
      await page.getByTestId("mvm-chart").focus();
      await page.keyboard.press("Home");
      await expect(root).toHaveAttribute("data-cursor", "0");
      await expect(page.getByTestId("mvm-minute")).toHaveText("0′");
      await expectGapsAgree(page);
      // a tap on the chart, about a third of the way across
      const box = await page.getByTestId("mvm-scrub").boundingBox();
      if (!box) throw new Error("no scrub area");
      await page.mouse.click(box.x + box.width * 0.3, box.y + box.height / 2);
      const t = Number(await root.getAttribute("data-cursor"));
      expect(t).toBeGreaterThan(15);
      expect(t).toBeLessThan(40);
      await expect(page.getByTestId("mvm-minute")).toHaveText(`${t}′`);
      await expect(page.getByTestId("mvm-cursor")).toHaveAttribute("data-t", String(t));
      // the six cursor dots sit on the cursor's x
      const cx = await page.getByTestId("mvm-cursor").locator("circle").evaluateAll(
        (cs) => [...new Set(cs.map((c) => c.getAttribute("cx")))]);
      expect(cx).toHaveLength(1);
      await expect(page.getByTestId("mvm-cursor").locator("circle")).toHaveCount(6);
      await expectGapsAgree(page);
      // back to live
      await page.getByTestId("mvm-live").click();
      await expect(root).toHaveAttribute("data-cursor", "63");
      await expect(page.getByTestId("mvm-end-gap-home")).toHaveText("+3.6");
      expect(errors).toEqual([]);
    });

    test("a missed tape minute is held and names its minute", async ({ page }) => {
      await serve(page, { state: "in", minute: "63'",
        series: liveSeries({ last: 63, tapeAgeS: 12 }) });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await page.getByTestId("mvm-chart").focus();
      await page.keyboard.press("Home");
      for (let i = 0; i < 27; i++) await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("mvm-root")).toHaveAttribute("data-cursor", "27");
      await expect(page.getByTestId("mvm-held-home")).toHaveText("model held 26′");
      await expect(page.getByTestId("mvm-dot-model-home")).toHaveAttribute("stroke", "var(--warn)");
      await expectGapsAgree(page);
    });

    test("held: a late feed is held, hatched and not current", async ({ page }) => {
      const errors = watchErrors(page);
      await serve(page, { state: "in", minute: "63'",
        series: liveSeries({ last: 60, tapeAgeS: 600 }) });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("mvm-root")).toHaveAttribute("data-mode", "held");
      await expect(page.getByTestId("mvm-pill")).toHaveText(`held · 60′, not current`);
      await expect(page.getByTestId("mvm-live")).toHaveText(/held 60/i);
      await expect(page.getByTestId("mvm-hatch")).toHaveCount(1);
      await expect(page.getByTestId("mvm-fresh")).toContainText("not current");
      await expectGapsAgree(page);
      await noHorizontalScroll(page);
      expect(errors).toEqual([]);
    });

    test("pre-kickoff: steps, padlock, fee floor", async ({ page }) => {
      const errors = watchErrors(page);
      await serve(page, { state: "pre", series: preSeries() });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const root = page.getByTestId("mvm-root");
      await expect(root).toHaveAttribute("data-mode", "pre");
      await expect(page.getByTestId("mvm-minute")).toHaveText(new RegExp(`^T${MINUS}\\d+$`));
      await expect(page.getByTestId("mvm-pill")).toHaveText(/model locked T.10/i);
      await expect(page.getByTestId("mvm-lock")).toHaveCount(1);
      // away: model 41.4 above market 37.0, so its floor band is drawn
      await expect(page.getByTestId("mvm-floor-away").first()).toBeAttached();
      await expect(page.getByTestId("mvm-floor-row-away")).toContainText("floor +4.6");
      await expect(page.getByTestId("mvm-end-gap-away")).toHaveText("+4.4");
      await expect(page.getByTestId("mvm")).toContainText("0.2 short");
      await expectGapsAgree(page);
      // step back before the lock: the model is the scheduled run
      await page.getByTestId("mvm-chart").focus();
      await page.keyboard.press("Home");
      await expect(page.getByTestId("mvm-minute")).toHaveText(`T${MINUS}60`);
      // no model run yet at T−60: a dash and a neutral "—", never a zero
      await expect(page.getByTestId("mvm-model-away")).toHaveText("\u2014");
      await expect(page.getByTestId("mvm-end-gap-away")).toHaveText("\u2014");
      await expectGapsAgree(page);
      for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("mvm-minute")).toHaveText(`T${MINUS}55`);
      await expect(page.getByTestId("mvm-model-away")).toHaveText("41.0");
      await expectGapsAgree(page);
      await noHorizontalScroll(page);
      expect(errors).toEqual([]);
    });
  });
}

test.describe("named absences, never a crash", () => {
  test("refused by the backend", async ({ page }) => {
    const errors = watchErrors(page);
    await serve(page, { state: "in", minute: "63'", series: {
      available: false, code: "no_fixture",
      reason: "this match is not on the live plane, so no minute-by-minute read was recorded for it" } });
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await expect(page.getByTestId("mvm-absent")).toContainText(
      "No minute-by-minute read for this match.");
    await expect(page.getByTestId("mvm-absent")).toContainText("not on the live plane");
    expect(errors).toEqual([]);
  });

  test("a live match whose tape is empty", async ({ page }) => {
    const s = { ...liveSeries({ last: 10, tapeAgeS: 5 }), minutes: [] };
    await serve(page, { state: "in", minute: "63'", series: s });
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await expect(page.getByTestId("mvm")).toHaveAttribute("data-state", "empty");
    await expect(page.getByTestId("mvm-absent")).toContainText("not a flat line");
  });

  test("a failed read is named, not empty", async ({ page }) => {
    await serve(page, { state: "in", minute: "63'", series: (r: Route) =>
      r.fulfill({ status: 503, json: { detail: "busy" } }) });
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await expect(page.getByTestId("mvm")).toHaveAttribute("data-state", "failed");
    await expect(page.getByTestId("mvm-absent")).toContainText("The read failed");
  });

  test("a malformed series costs this section only", async ({ page }) => {
    await serve(page, { state: "in", minute: "63'", series: {
      ...liveSeries({ last: 10, tapeAgeS: 5 }), events: "not a list" } });
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await expect(page.getByTestId("mvm")).toHaveAttribute("data-state", "crashed");
    await expect(page.getByTestId("mvm-absent")).toContainText(
      "No minute-by-minute read for this match.");
    // the rest of the hub still drew
    await expect(page.getByText("Harbour (illustrative)").first()).toBeVisible();
  });
});

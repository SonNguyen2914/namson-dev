import { expect, test } from "@playwright/test";

// THE LAST "BET NOW" SURFACE, BROUGHT UNDER THE CHARTER (2026-09-06).
//
// Until today /bet-suggester/wc26 shipped a live, publicly readable,
// un-walled ripeness board. Its Discord leg was walled as MODEL_SIGNAL and
// refused; its HTTP leg and this UI were walled by nothing. What it drew:
//
//   * "alert fires at 75/100" in the section heading — a trigger;
//   * rows sorted by a 0-100 composite descending — a ranking, beside a
//     Watch button, which is a recommendation however it is captioned;
//   * at score >= 75: a clock emoji, `border-warn`, `bg-warn`, `text-warn`
//     and a `bg-warn` progress bar — a GO state, drawn in the ink family
//     WatchedStrip reserves for REFUSALS;
//   * an `urgency` component ramping over the final twelve hours — a
//     moment named to act, which entry_map.NO_RESPONSE_WINDOW forbids by
//     name on the other stage and which research_archive/
//     pre_kickoff_horizons measured dead at every horizon 120h-12h,
//     hindsight ceiling included;
//   * "Recent bet-window alerts", `text-warn`, clock emoji, bare clock
//     times on rows that are months old.
//
// None of the eight numbers behind the composite was ever measured. The
// backend withdrew it (src/timing.py WITHDRAWN) and this spec holds the
// render to the same charter: IT SHOWS; IT DOES NOT DECIDE.
//
// HOW THESE TESTS ARE WRITTEN. Two halves, always. The forbidding half
// pins that a verdict word / a GO colour / a ranking is absent — but an
// absence test alone stays green against a page that renders nothing at
// all, which is exactly the collapse `failed-read-is-not-empty.spec.ts`
// exists for. So every forbidding assertion is paired with a positive one
// that the panel DID render its numbers, its refusals and its charter. And
// the ordering test is derived from the payload rather than restated: the
// spec serves three markets in a known declaration order whose composite
// ordering would be the exact reverse, so a re-introduced ranking cannot
// pass by coincidence.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
type Page = import("@playwright/test").Page;

// --- the backend's own vocabulary, quoted -----------------------------
// These strings are src/timing.py's registry values verbatim. They are the
// ONLY strings on the payload allowed to carry a verdict word, which is
// the same rule the backend guard derives (tests/test_timing_charter.py
// ::test_no_payload_string_carries_a_verdict_word_outside_the_registries).
const NOT_A_RANKING =
  "THE ORDER OF THESE ROWS IS NOT A PREFERENCE. They come back in the "
  + "order they were declared, oldest first, and that order is stated on "
  + "the payload beside them. Until 2026-09-06 this endpoint sorted by a "
  + "composite score descending, which is a ranking, and a ranked list of "
  + "markets on a page with a Watch button is a recommendation however it "
  + "is captioned.";

const PREDICTIVE_STATUS_UNMEASURED =
  "EVERY OBSERVATION BELOW IS A TRUE DESCRIPTION OF THE STORED TAPE AND "
  + "AN UNMEASURED PREDICTOR OF ANYTHING ELSE.";

const WITHDRAWN = {
  score: {
    was: "0-100 composite = 100 * sum(WEIGHTS[k] * component[k])",
    why: "not one of those eight numbers was fitted, checked or bounded by "
       + "any measurement in research_archive/",
    licensed_by: "an out-of-sample measurement of the composite against a "
       + "stated outcome, with n, a band, and the plane's noise floor cleared",
  },
  urgency: {
    was: "clamp(1.0 - hours_to_kickoff / 12.0), weighted 0.10",
    why: "a moment to act, which NO_MOMENT_TO_ACT refuses by name on "
       + "measured grounds",
    licensed_by: "a measured relationship between time-to-kickoff and an "
       + "outcome",
  },
};

const UNMEASURED_CONSTANTS = {
  LOOKBACK_HOURS_DEFAULT: {
    value: 24, unit: "hours", measured: false,
    what_it_does: "how far back the tape is read",
    note: "a round number chosen when this module was written. Nothing "
        + "measured it",
  },
};

function observation(name: string, over: Record<string, unknown> = {}) {
  return {
    name, describes: `what ${name} describes`, unit: "u", value: 1.5, n: 12,
    predictive_status: "unmeasured", refusal_code: null, refused: null,
    ...over,
  };
}

function refused(name: string, code: string, reason: string) {
  return observation(name, {
    value: null, n: 0, refusal_code: code, refused: `${code}: ${reason}`,
  });
}

/** A tape read in the shape src/timing.py emits. `refusals` names which of
 *  the five observations refuse, so a case can be built by naming it. */
function tapeRead(marketId: string, refusals: Record<string, [string, string]> = {}) {
  const names = ["edge_deviate", "price_percentile", "edge_change", "clock",
                 "volume_24h"];
  const observations: Record<string, unknown> = {};
  const counts: Record<string, number> = {};
  const codes: Record<string, string> = {};
  for (const n of names) {
    if (refusals[n]) {
      const [code, reason] = refusals[n];
      observations[n] = refused(n, code, reason);
      counts[code] = (counts[code] ?? 0) + 1;
      codes[code] = reason;
    } else {
      observations[n] = observation(n, {
        value: n === "clock" ? -18.5 : n === "volume_24h" ? 50000 : 0.42,
        unit: n === "clock" ? "hours" : n === "volume_24h" ? "dollars" : "u",
        caveat: n === "clock" ? "signed and unclamped" : undefined,
      });
    }
  }
  return {
    market_id: marketId, readings: 23, window_hours: 24,
    observations, refusal_counts: counts, refusal_codes: codes,
    charter: {
      not_a_ranking: NOT_A_RANKING,
      no_moment_to_act: "NOTHING HERE NAMES A MOMENT TO ACT",
      predictive_status_unmeasured: PREDICTIVE_STATUS_UNMEASURED,
      refusals_are_counted: "EVERY ABSENCE HERE CARRIES A CODE",
    },
    withdrawn: WITHDRAWN,
    unmeasured_constants: UNMEASURED_CONSTANTS,
    registered_holes: {},
  };
}

// Declaration order A, B, C. If a composite ever came back, B would have
// been top of a descending sort — so an accidental re-ranking cannot
// reproduce this order.
const WATCHLIST = {
  watchlist: [
    { match_id: "m1", market_id: "MKT-A", market_title: "Alpha to win",
      watched_since: "2026-07-01T00:00:00+00:00", timing: tapeRead("MKT-A") },
    { match_id: "m1", market_id: "MKT-B", market_title: "Bravo to win",
      watched_since: "2026-07-02T00:00:00+00:00",
      timing: tapeRead("MKT-B", {
        volume_24h: ["volume_not_reported",
          "the provider sent no 24h volume on this reading. Missing is never "
          + "zero, and the retired form folded it to zero with `or 0`"],
      }) },
    { match_id: "m1", market_id: "MKT-C", market_title: "Charlie to win",
      watched_since: "2026-07-03T00:00:00+00:00",
      timing: tapeRead("MKT-C", {
        edge_deviate: ["degenerate_dispersion",
          "every edge in the window is the same value"],
        price_percentile: ["too_few_for_percentile",
          "there are no PRIOR readings in the window"],
      }) },
  ],
  order: {
    key: "watched_since", direction: "asc", is_a_ranking: false,
    note: NOT_A_RANKING,
  },
  charter: { not_a_ranking: NOT_A_RANKING },
};

const RETIRED_ROWS = {
  alerts: [{
    match_id: "m1", market_id: "MKT-A", market_title: "Alpha to win",
    score: 83.3, decimal_odds: 2.14, edge: 0.205,
    reasons: "…", fired_at: "2026-07-04T18:22:00+00:00",
  }],
};

async function board(page: Page) {
  await page.route("**/api/bet-suggester/watchlist**",
    (r) => r.fulfill(json(WATCHLIST)));
  await page.route("**/api/bet-suggester/alerts**",
    (r) => r.fulfill(json(RETIRED_ROWS)));
  await page.route("**/api/bet-suggester/suggestions**",
    (r) => r.fulfill(json({ suggestions: [], tier_used: 49 })));
  await page.route("**/api/bet-suggester/upcoming**",
    (r) => r.fulfill(json({ matches: [] })));
  await page.route("**/api/bet-suggester/live-scores**",
    (r) => r.fulfill(json({ live: [] })));
  await page.goto("/bet-suggester/wc26");
  await expect(page.getByTestId("tape-read-section")).toBeVisible();
}

async function words(page: Page): Promise<string> {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

// ---------------------------------------------------------------- ranking

test("the watched panel renders in DECLARATION order and says it is not a "
   + "ranking — the retired form sorted by a composite descending",
  async ({ page }) => {
    await board(page);
    const rows = page.getByTestId("tape-read-row");
    await expect(rows).toHaveCount(3);
    // the positive half: the rows are really there, in the payload's order
    await expect(rows.nth(0)).toContainText("Alpha to win");
    await expect(rows.nth(1)).toContainText("Bravo to win");
    await expect(rows.nth(2)).toContainText("Charlie to win");
    // and the order is DECLARED on the surface, not left to be inferred
    const order = page.getByTestId("tape-read-order");
    await expect(order).toContainText("order: watched_since asc");
    await expect(order).toContainText("is_a_ranking: false");
    await expect(order).toContainText(/is not a preference/i);
  });

test("no threshold is printed and no composite is printed", async ({ page }) => {
    await board(page);
    const w = await words(page);
    // the forbidding half
    expect(w).not.toContain("alert fires at");
    // the column whose control is "Watch" used to be headed "Alert" — the
    // last place on the board still promising a notification
    expect(w).not.toMatch(/\bALERT\b/i);
    expect(w).not.toMatch(/\/100\b/);
    expect(w).not.toMatch(/\bripe\b/i);
    expect(w).not.toContain("BET WINDOW");
    // the non-vacuity half: the panel DID draw, with its numbers
    await expect(page.getByTestId("tape-read-row").first())
      .toContainText("23 readings in the last 24h");
  });

// ------------------------------------------------------------ GO colouring

/** Every `class` attribute on and BELOW an element. The first version of
 *  this helper used `locator("[class*='warn']")`, which searches
 *  DESCENDANTS ONLY — so a warn class put back on the row element itself
 *  passed the guard. That is the round's own lesson in miniature: the
 *  check held at the site it was written for and the same shape stood one
 *  element up. Both are read here. */
async function inkClasses(scope: import("@playwright/test").Locator) {
  return scope.evaluate((el) => [el, ...Array.from(el.querySelectorAll("*"))]
    .map((n) => (n as Element).getAttribute("class") ?? ""));
}

test("no row is coloured as a GO state — `warn` appears only on refusals",
  async ({ page }) => {
    await board(page);
    // Alpha refuses nothing, so NOTHING in its subtree — the row element
    // included — may carry warn ink of any kind.
    const alpha = page.getByTestId("tape-read-row").nth(0);
    const alphaInk = await inkClasses(alpha);
    expect(alphaInk.filter((c) => c.includes("warn"))).toEqual([]);
    // resting ink only: `hover:text-accent` on the market link is the
    // page's navigation affordance, not a claim about the market. What
    // would be a verdict is a figure coloured at rest.
    const resting = alphaInk.map(
      (c) => c.split(/\s+/).filter((u) => !u.includes(":")).join(" "));
    expect(resting.filter((c) => /accent|text-up|text-neg/.test(c))).toEqual([]);

    // Bravo refuses one observation, so warn appears — on the refusal, and
    // ONLY there. The non-vacuity half: it proves the reader above finds
    // warn ink when warn ink is present, on the same element shape.
    const bravo = page.getByTestId("tape-read-row").nth(1);
    const bravoInk = (await inkClasses(bravo)).filter((c) => c.includes("warn"));
    expect(bravoInk.length).toBe(1);
    const warned = bravo.locator("[class*='text-warn']");
    await expect(warned).toHaveCount(1);
    await expect(warned).toContainText("volume_not_reported");

    // no progress bar, and no clock emoji anywhere on the panel
    expect(await page.getByTestId("tape-read-section")
      .locator("[style*='width']").count()).toBe(0);
    expect(await words(page)).not.toContain("⏰");
  });

// -------------------------------------------------------------- refusals

test("every refusal is drawn by NAME with the registry's own definition, "
   + "and counted — never imputed and never a zero", async ({ page }) => {
    await board(page);
    const bravo = page.getByTestId("tape-read-row").nth(1);
    await expect(bravo.getByTestId("refusal-volume_24h"))
      .toContainText("volume_not_reported");
    await expect(bravo.getByTestId("refusal-volume_24h"))
      .toContainText("Missing is never zero");
    await expect(bravo).toContainText("1 of 5 refused");
    // the row must NOT print a number where a refusal stands
    await expect(bravo.getByTestId("refusal-volume_24h")).not.toContainText("$0");

    const charlie = page.getByTestId("tape-read-row").nth(2);
    await expect(charlie.getByTestId("refusal-edge_deviate"))
      .toContainText("degenerate_dispersion");
    await expect(charlie.getByTestId("refusal-price_percentile"))
      .toContainText("too_few_for_percentile");
    await expect(charlie).toContainText("2 of 5 refused");
  });

test("a market whose whole tape refuses draws five names, not five zeroes",
  async ({ page }) => {
    const empty = {
      ...WATCHLIST,
      watchlist: [{
        match_id: "m1", market_id: "MKT-Z", market_title: "Zulu to win",
        watched_since: "2026-07-01T00:00:00+00:00",
        timing: tapeRead("MKT-Z", Object.fromEntries(
          ["edge_deviate", "price_percentile", "edge_change", "clock",
           "volume_24h"].map((n) => [n, ["no_readings",
             "the tape holds no reading for this market inside the window"]]))),
      }],
    };
    await page.route("**/api/bet-suggester/watchlist**",
      (r) => r.fulfill(json(empty)));
    await page.route("**/api/bet-suggester/alerts**",
      (r) => r.fulfill(json({ alerts: [] })));
    await page.route("**/api/bet-suggester/suggestions**",
      (r) => r.fulfill(json({ suggestions: [], tier_used: 49 })));
    await page.route("**/api/bet-suggester/upcoming**",
      (r) => r.fulfill(json({ matches: [] })));
    await page.route("**/api/bet-suggester/live-scores**",
      (r) => r.fulfill(json({ live: [] })));
    await page.goto("/bet-suggester/wc26");
    const row = page.getByTestId("tape-read-row");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("5 of 5 refused");
    for (const n of ["edge_deviate", "price_percentile", "edge_change",
                     "clock", "volume_24h"]) {
      await expect(row.getByTestId(`refusal-${n}`)).toContainText("no_readings");
    }
    // and nowhere does an absence arrive as the number zero
    const w = await words(page);
    expect(w).not.toMatch(/\b0\/100\b/);
    expect(w).not.toContain("no_data");
  });

// -------------------------------------------------- charter and provenance

test("the charter and the withdrawal ride on the page, so a reader meets "
   + "what was taken away without opening the repo", async ({ page }) => {
    await board(page);
    const charter = page.getByTestId("tape-read-charter");
    await expect(charter).toContainText("UNMEASURED PREDICTOR");
    await expect(charter).toContainText("no threshold and no notification");
    // the clause that does the actual work, and the one the first version
    // of this test left unpinned: a surface may print "no notification"
    // and still name a moment to act.
    await expect(charter).toContainText("says when to do anything");
    await expect(charter).toContainText("each with its n");
    const withdrawn = page.getByTestId("tape-read-withdrawn");
    await expect(withdrawn).toContainText("what this panel used to show");
    await withdrawn.locator("summary").click();
    await expect(withdrawn).toContainText("score");
    await expect(withdrawn).toContainText("WEIGHTS[k] * component[k]");
    await expect(withdrawn).toContainText("urgency");
    await expect(withdrawn).toContainText("a moment to act");
    await expect(withdrawn).toContainText("what would bring it back");
  });

test("every surviving constant is labelled unmeasured where the reader "
   + "meets it", async ({ page }) => {
    await board(page);
    const c = page.getByTestId("tape-read-constants");
    await expect(c).toContainText("LOOKBACK_HOURS_DEFAULT = 24 hours");
    await expect(c).toContainText("unmeasured:");
  });

// ------------------------------------------------ the retired trigger's rows

test("the archived notifications are dated in full, drawn in plain ink, and "
   + "say the trigger that wrote them is withdrawn", async ({ page }) => {
    await board(page);
    const sec = page.getByTestId("retired-trigger-section");
    await expect(sec).toContainText("Notifications the retired trigger sent");
    await expect(page.getByTestId("retired-trigger-note"))
      .toContainText("NOT ADOPTED");
    await expect(page.getByTestId("retired-trigger-note"))
      .toContainText("cannot grow");
    // the row is still there — the information is kept
    await expect(sec).toContainText("Alpha to win");
    await expect(sec).toContainText("withdrawn composite at the time 83");
    // dated, not a bare clock time on a row that is months old
    await expect(sec).toContainText(/Jul \d+, 2026/);
    // and not coloured as a live signal
    expect(await sec.locator("[class*='text-warn']").count()).toBe(0);
    expect(await sec.innerText()).not.toContain("⏰");
  });

// ------------------------------------------------------- the match page

// The first version of this test routed every read to `{}`, so the markets
// table never rendered and every `expect(...).not.toContain(...)` below
// passed against a page with no Watch controls on it at all. That is the
// vacuity the spec header warns about, caught by its own mutation proof:
// putting the `title=` tooltip back left the test green. The prediction is
// served for real now and the presence of the buttons is asserted FIRST.
const PREDICTION = {
  freshness: "cached", match_id: "m1",
  generated_at: "2026-07-04T12:00:00+00:00", age_seconds: 60,
  is_stale: false, is_final: false, source: "test", confidence: 0.7,
  xg: { home: 1.4, away: 1.1 }, scorelines: [{ score: "1-0", prob: 0.12 }],
  markets: [
    { market_id: "MKT-A", market_title: "Alpha to win",
      model_probability: 0.55, kalshi_odds: 2.1, implied_probability: 0.48,
      edge: 0.07, expected_value: 0.14 },
    { market_id: "MKT-B", market_title: "Over 2.5 goals",
      model_probability: 0.51, kalshi_odds: 1.9, implied_probability: 0.53,
      edge: -0.02, expected_value: -0.03 },
  ],
};

test("the market page's Watch control promises no notification and names "
   + "no moment, and its claim is real text rather than a title attribute",
  async ({ page }) => {
    // Playwright matches the MOST RECENTLY ADDED route first, so the
    // catch-all goes on first and the named reads override it. It answers
    // 503 rather than `{}`: every unrelated read on this page is wrapped
    // in its own catch and hides its section when it fails, whereas a
    // well-formed-but-empty body walks into `.scouting` / `.markets` on
    // shapes that never declared those fields optional.
    await page.route("**/api/bet-suggester/**",
      (r) => r.fulfill(json({ error: "not served in this spec" }, 503)));
    await page.route("**/api/bet-suggester/upcoming**",
      (r) => r.fulfill(json({ matches: [] })));
    await page.route("**/api/bet-suggester/live-scores**",
      (r) => r.fulfill(json({ live: [] })));
    await page.route("**/api/bet-suggester/watchlist**",
      (r) => r.fulfill(json(WATCHLIST)));
    await page.route("**/api/bet-suggester/timeline**",
      (r) => r.fulfill(json({ points: [] })));
    await page.route("**/api/bet-suggester/prediction**",
      (r) => r.fulfill(json(PREDICTION)));
    await page.goto("/bet-suggester/market/m1");

    // NON-VACUITY FIRST: the markets table and its Watch controls really
    // rendered, and one of them is in the watching state (MKT-A is on the
    // served watchlist) so the watching branch's markup is exercised too.
    const watchButtons = page.getByRole("button", { name: /^Watch(ing)?$/ });
    await expect(watchButtons.first()).toBeVisible({ timeout: 20000 });
    expect(await watchButtons.count()).toBeGreaterThan(1);
    await expect(page.getByRole("button", { name: "Watching" }).first())
      .toBeVisible();

    // the sentence that says what Watch does is real text in the tree
    const means = page.getByTestId("watch-means-what");
    await expect(means).toContainText("Nothing is dispatched");
    await expect(means).toContainText("no moment is named to act");
    await expect(means).toContainText("was never measured and is");

    const w = await words(page);
    expect(w).not.toMatch(/\bALERT\b/i);
    expect(w).not.toContain("you'll be pinged");
    expect(w).not.toContain("ripeness score crosses");
    expect(w).not.toContain("alert threshold");

    // and NO Watch control carries its meaning on a title= attribute: a
    // title is not in the accessible tree, so a screen-reader user gets
    // the button and loses the claim. Derived over every button on the
    // page rather than pattern-matched, so a re-worded tooltip is caught
    // too — a Watch control may carry no title at all.
    const titled = await watchButtons.evaluateAll(
      (els) => els.map((e) => e.getAttribute("title")).filter(Boolean));
    expect(titled).toEqual([]);
    // the watching-state control is drawn in plain ink: `warn` is the
    // refusal family on this stage and "watching" is not a refusal
    const watchingInk = await page.getByRole("button", { name: "Watching" })
      .first().getAttribute("class");
    expect(watchingInk).not.toContain("warn");
  });

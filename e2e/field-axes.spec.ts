// THE FIELD ON THREE AXES, on the competition viewer.
//
// The operator asked for two things at once and the pair is the point:
//
//   "for 11 refused, just get their elo and anymore data you got to
//    compute their rank and tier"
//   "make sure to mark those 11 somehow ... Subtlely"
//
// So: they are ranked among everyone else, and they are marked with a
// dagger and a hairline — not a badge, not a separate table, and above
// all not sorted to the bottom, which would say the evidence failing to
// place a club makes it a worse club.
//
// The other claim under guard is that the BAR is the read. On two of the
// three axes almost every interval crosses a cut, so a bare tier number
// would assert a placement the measurement refuses. That is the same
// defect as `OVR 1v1` on the board, which is what started this work.

import { expect, test } from "@playwright/test";

const json = (b: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(b),
});

/** Two axes, six clubs, arranged so every claim below has a case:
 *  - `hi` is placed (narrow band, inside tier 1)
 *  - `mid` straddles a cut
 *  - `floor2` is BELOW FLOOR and outranks two admitted clubs, which is
 *    what stops "ranked with everyone else" from being decorative */
const RATINGS = {
  competition: "ucl",
  display: "UEFA Champions League",
  passes: "10",
  below_floor_clubs: ["Floor High", "Floor Low"],
  below_floor_note: "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING.",
  axes_disagree_note:
    "The three axes are read from two different measurements and do not agree.",
  not_a_trading_signal: true,
  axes: {
    ovr: {
      axis: "ovr", label: "overall", bands: 5, distinguishable_levels: 6.12,
      unit: "elo", why_this_many_bands: "6.12 levels; five bands sit inside it",
      cuts: [1900, 1800, 1700, 1600], span: [1500, 2000],
      straddling: 2, placed: 4,
      rows: [
        { rank: 1, club: "Alpha", league: "epl", value: 1960,
          half_width_95: 20, interval: [1940, 1980], tier: 1, tier_set: [1],
          straddles: false, below_floor: false, rate: null, floor_note: null },
        { rank: 2, club: "Floor High", league: "super-lig", value: 1910,
          half_width_95: 160, interval: [1750, 2070], tier: 1,
          tier_set: [1, 2, 3], straddles: true, below_floor: true, rate: null,
          floor_note: "its league did not clear the floor" },
        { rank: 3, club: "Beta", league: "la-liga", value: 1850,
          half_width_95: 30, interval: [1820, 1880], tier: 2, tier_set: [2],
          straddles: false, below_floor: false, rate: null, floor_note: null },
        { rank: 4, club: "Gamma", league: "serie-a", value: 1805,
          half_width_95: 40, interval: [1765, 1845], tier: 2, tier_set: [2, 3],
          straddles: true, below_floor: false, rate: null, floor_note: null },
        { rank: 5, club: "Floor Low", league: "eliteserien", value: 1650,
          half_width_95: 150, interval: [1500, 1800], tier: 4,
          tier_set: [2, 3, 4, 5], straddles: true, below_floor: true,
          rate: null, floor_note: "its league did not clear the floor" },
        { rank: 6, club: "Delta", league: "epl", value: 1560,
          half_width_95: 25, interval: [1535, 1585], tier: 5, tier_set: [5],
          straddles: false, below_floor: false, rate: null, floor_note: null },
      ],
    },
    atk: {
      axis: "atk", label: "attack", bands: 3, distinguishable_levels: 2.41,
      unit: "log_goals",
      why_this_many_bands: "2.41 levels; five bands would be narrower than a club's own interval",
      cuts: [0.6, 0.2], span: [0.0, 1.0], straddling: 5, placed: 1,
      rows: [
        { rank: 1, club: "Beta", league: "la-liga", value: 0.95,
          half_width_95: 0.05, interval: [0.9, 1.0], tier: 1, tier_set: [1],
          straddles: false, below_floor: false, rate: 2.4, floor_note: null },
        { rank: 2, club: "Floor High", league: "super-lig", value: 0.7,
          half_width_95: 0.3, interval: [0.4, 1.0], tier: 1, tier_set: [1, 2],
          straddles: true, below_floor: true, rate: 1.8,
          floor_note: "its league did not clear the floor" },
        { rank: 3, club: "Alpha", league: "epl", value: 0.5,
          half_width_95: 0.25, interval: [0.25, 0.75], tier: 2,
          tier_set: [1, 2], straddles: true, below_floor: false, rate: 1.6,
          floor_note: null },
        { rank: 4, club: "Gamma", league: "serie-a", value: 0.3,
          half_width_95: 0.2, interval: [0.1, 0.5], tier: 2,
          tier_set: [2, 3], straddles: true, below_floor: false, rate: 1.3,
          floor_note: null },
        { rank: 5, club: "Floor Low", league: "eliteserien", value: 0.15,
          half_width_95: 0.35, interval: [-0.2, 0.5], tier: 3,
          tier_set: [2, 3], straddles: true, below_floor: true, rate: 1.1,
          floor_note: "its league did not clear the floor" },
        { rank: 6, club: "Delta", league: "epl", value: 0.05,
          half_width_95: 0.15, interval: [-0.1, 0.2], tier: 3,
          tier_set: [3], straddles: false, below_floor: false, rate: 0.9,
          floor_note: null },
      ],
    },
  },
};

const FIXTURES = {
  competition: "ucl", display: "UEFA Champions League", accent: "#f174cc",
  model: { why: "a cup with qualifying rounds", note: null,
           instead: "the cross-league strength read is used meanwhile" },
  fixtures: [], counts: { upcoming: 0 },
};

async function open(page: import("@playwright/test").Page, ratings: unknown = RATINGS) {
  await page.route("**/api/comp/ucl/fixtures**", (r) => r.fulfill(json(FIXTURES)));
  await page.route("**/api/comp/ucl/markets**", (r) => r.fulfill(json({ events: [] })));
  await page.route("**/api/comp/ucl/ratings**", (r) => r.fulfill(json(ratings)));
  await page.goto("/bet-suggester/comp/ucl");
}

test("the field draws every club on the opening axis", async ({ page }) => {
  await open(page);
  const rows = page.getByTestId("axis-row");
  await expect(rows).toHaveCount(6);
  await expect(page.getByTestId("axis-table")).toHaveAttribute("data-axis", "ovr");
});

test("all three-axis tabs are offered and switching redraws the table",
  async ({ page }) => {
    await open(page);
    const tabs = page.getByTestId("axis-tab");
    await expect(tabs).toHaveCount(2);   // this payload carries two
    await tabs.filter({ hasText: /attack/i }).click();
    await expect(page.getByTestId("axis-table")).toHaveAttribute("data-axis", "atk");
    // the attack axis has a rate column populated; overall does not
    await expect(page.getByTestId("axis-row").first()).toContainText("2.40");
  });

test("the eleven kind are RANKED among everyone, not sorted to the bottom",
  async ({ page }) => {
    await open(page);
    // `evaluateAll` does NOT auto-wait: read it bare and it returns [] on
    // a page that has not drawn yet, which fails looking exactly like a
    // column that sorted wrong. The count assertion is the wait.
    await expect(page.getByTestId("axis-row")).toHaveCount(6);
    const clubs = await page.getByTestId("axis-row")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-club")));
    expect(clubs).toEqual(["Alpha", "Floor High", "Beta", "Gamma",
                           "Floor Low", "Delta"]);
    // the load-bearing half: a below-floor club outranks admitted ones
    expect(clubs.indexOf("Floor High")).toBeLessThan(clubs.indexOf("Beta"));
  });

test("a below-floor club is marked, and only a below-floor club is",
  async ({ page }) => {
    await open(page);
    const marks = page.getByTestId("floor-mark");
    await expect(marks).toHaveCount(2);
    for (const club of ["Floor High", "Floor Low"]) {
      await expect(page.locator(`[data-club="${club}"] [data-testid="floor-mark"]`))
        .toHaveCount(1);
    }
    for (const club of ["Alpha", "Beta", "Gamma", "Delta"]) {
      await expect(page.locator(`[data-club="${club}"] [data-testid="floor-mark"]`))
        .toHaveCount(0);
    }
  });

test("the mark is subtle — a dagger with its reason on hover, not a badge",
  async ({ page }) => {
    await open(page);
    const mark = page.locator('[data-club="Floor High"] [data-testid="floor-mark"]');
    await expect(mark).toHaveText("†");
    await expect(mark).toHaveAttribute("title", /did not clear the floor/);
    await expect(page.getByTestId("floor-footnote"))
      .toContainText(/refused by the placeability floor/i);
  });

test("every row carries an interval bar, and a straddling one is marked",
  async ({ page }) => {
    await open(page);
    // `evaluateAll` does NOT auto-wait, so the count assertion above it is
    // what makes this read safe rather than a race that returns []
    await expect(page.getByTestId("axis-row")).toHaveCount(6);
    const straddles = await page.getByTestId("axis-row")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-straddles")));
    expect(straddles.filter((s) => s === "true").length).toBe(3);
  });

test("a tier is drawn as a SET, so a straddling club shows every band it touches",
  async ({ page }) => {
    await open(page);
    await expect(page.locator('[data-club="Floor Low"]')).toContainText("2");
    await expect(page.locator('[data-club="Floor Low"]')).toContainText("5");
    // and a placed club shows exactly one
    const alpha = await page.locator('[data-club="Alpha"] td:last-child i').count();
    expect(alpha).toBe(1);
  });

test("a competition with no measured field says so, and draws no empty table",
  async ({ page }) => {
    await open(page, {
      competition: "leagues-cup", display: "Leagues Cup", axes: null,
      why_not: "no cross-league field has been measured for this competition.",
    });
    await expect(page.getByTestId("field-axes-absent")).toBeVisible();
    await expect(page.getByTestId("field-axes-absent"))
      .toContainText(/has been measured/);
    await expect(page.getByTestId("axis-row")).toHaveCount(0);
  });

test("a failed ratings read is NAMED, never drawn as an absent field",
  async ({ page }) => {
    await page.route("**/api/comp/ucl/fixtures**", (r) => r.fulfill(json(FIXTURES)));
    await page.route("**/api/comp/ucl/markets**", (r) => r.fulfill(json({ events: [] })));
    await page.route("**/api/comp/ucl/ratings**", (r) => r.abort());
    await page.goto("/bet-suggester/comp/ucl");
    // the failure is drawn, in its own words
    await expect(page.getByTestId("field-axes-error")).toBeVisible();
    await expect(page.getByTestId("field-axes-error"))
      .toContainText(/did not answer|answered \d+/);
    // and it does NOT claim the competition has no rating — that is the
    // other surface's sentence and they are different facts
    await expect(page.getByTestId("field-axes-absent")).toHaveCount(0);
    await expect(page.getByTestId("axis-row")).toHaveCount(0);
    // the rest of the page is untouched
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

test("a 404 from the field read carries its status into the words",
  async ({ page }) => {
    await page.route("**/api/comp/ucl/fixtures**", (r) => r.fulfill(json(FIXTURES)));
    await page.route("**/api/comp/ucl/markets**", (r) => r.fulfill(json({ events: [] })));
    await page.route("**/api/comp/ucl/ratings**",
      (r) => r.fulfill({ status: 404, contentType: "application/json", body: "{}" }));
    await page.goto("/bet-suggester/comp/ucl");
    await expect(page.getByTestId("field-axes-error")).toContainText("404");
  });

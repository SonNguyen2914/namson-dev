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
//
// AND THE THIRD, ADDED 2026-09-10 WITH THE RECUT: how many bands there
// are is a DECLARATION, and the page must not draw it as a finding. The
// operator cut attack and defence into five with the measurement in
// front of him; that measurement licenses three. The old line rendered
// the pair as "5 bands · 2.41 distinguishable levels", which reads the
// licence as the count's reason — the exact misreading the backend
// added `band_count_note` to refuse. So the tests below pin four
// separate facts and they are four, not one:
//
//   * the number drawn as the cut is the DECLARED one, never the licence
//   * the licence is drawn beside it and NAMED as a licence
//   * the backend's note is printed where the declaration is finer than
//     the licence, and absent where it is not
//   * a payload from before the recut carries none of these keys, and a
//     page that turned a missing flag into `false` would assert an
//     agreement nobody measured — so it must assert nothing at all
//
// DIFFERING AND OVERREACHING ARE NOT THE SAME FACT. `ovr` declares five
// against a licence of SEVEN: the two numbers differ, the flag is false,
// and no note is sent. A test that said "a note appears whenever they
// differ" would be a paraphrase of the contract that the real payload
// falsifies on its first axis, so the guard below is written against
// `declared_above_licence`, which is what actually rides the note.

import { expect, test } from "@playwright/test";

const json = (b: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(b),
});

/** THE BACKEND'S OWN PARAGRAPH, verbatim — `DECLARED_ABOVE_LICENCE_NOTE`
 *  in `src/picker/cross_league_axes.py`. Copied whole rather than
 *  matched on a fragment: the claim under test is that the page PRINTS
 *  the backend's words instead of restating them, and a regex over half
 *  a sentence would pass just as happily against a paraphrase. */
const ABOVE_LICENCE_NOTE =
  "DECLARED ABOVE WHAT THE MEASUREMENT LICENSES, AND THAT IS A DECISION "
  + "RATHER THAN A BUG. The band count on this axis is the operator's "
  + "declaration — he asked for this many bands with the measurement in "
  + "front of him — and it is finer than the distinguishable levels beside "
  + "it support. What that buys is a wider spread of point tiers across the "
  + "field. What it costs is that most clubs' 95% intervals reach into more "
  + "than one band, so `tier_set` is the reading and `tier` is only where "
  + "the estimate falls. NOTHING HERE CLAIMS THE EVIDENCE SEPARATES THIS "
  + "MANY LEVELS: `bands_licensed` is what it separates, `bands_declared` "
  + "is how finely the operator asked for it to be drawn, and the two are "
  + "published side by side precisely so neither can be read as the other.";

/** Two axes, six clubs, arranged so every claim below has a case:
 *  - `hi` is placed (narrow band, inside tier 1)
 *  - `mid` straddles a cut
 *  - `floor2` is BELOW FLOOR and outranks two admitted clubs, which is
 *    what stops "ranked with everyone else" from being decorative
 *
 *  THE BAND NUMBERS ARE THE FIELD'S REAL ONES, not round ones invented
 *  here: `ovr` 5 declared against a licence of 7, `atk` 5 declared
 *  against 3, with the levels (6.12, 2.41) and `atk`'s equal-width cuts
 *  taken off the recut payload. A fixture that spoke its own dialect
 *  would certify a renderer against numbers the backend never sends —
 *  which is how a venue bug once passed twelve green tests here.
 *
 *  AND `atk` IS CUT INTO FIVE FOR REAL. It used to carry `bands: 3` with
 *  two cuts and tiers running 1..3; declaring five while leaving two
 *  cuts in place would make the fixture contradict itself, so the cuts,
 *  the point tiers and every `tier_set` below are recomputed against the
 *  five-band geometry. Two of the six are placed cleanly, which is the
 *  same 2-of-36 shape the real attack axis has after the recut. */
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
      unit: "elo",
      // DECLARED BELOW ITS LICENCE — the pair that differ in the other
      // direction. Five is still the operator's number; seven is what
      // the evidence would have allowed. No flag, no note.
      bands_declared: 5, bands_licensed_by_the_measurement: 7,
      band_count_is_declared_not_derived: true,
      declared_above_licence: false, band_count_note: null,
      why_this_many_bands:
        "five bands, declared. The measurement licenses more than five "
        + "here — 6.12 distinguishable levels — so the cut sits inside "
        + "what the evidence supports. BAND COUNT: 5 declared, 7 licensed "
        + "by the measurement (6.12 distinguishable levels — the field's "
        + "span over the typical club's 95% interval). The declared count "
        + "is the operator's and sits inside the licence, so a single-band "
        + "`tier_set` on this axis is a placement the evidence will stand "
        + "behind.",
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
      axis: "atk", label: "attack", bands: 5, distinguishable_levels: 2.41,
      unit: "log_goals",
      // DECLARED ABOVE ITS LICENCE — five asked for, three measured, and
      // the note rides the flag the way `floor_note` rides `below_floor`.
      bands_declared: 5, bands_licensed_by_the_measurement: 3,
      band_count_is_declared_not_derived: true,
      declared_above_licence: true, band_count_note: ABOVE_LICENCE_NOTE,
      why_this_many_bands:
        "five bands, declared by the operator on 2026-09-10 after seeing "
        + "this measurement. It is a finer cut than the evidence licenses "
        + "and is meant to spread the point tiers out; the interval beside "
        + "each club is what it costs. BAND COUNT: 5 declared, 3 licensed "
        + "by the measurement (2.41 distinguishable levels — the field's "
        + "span over the typical club's 95% interval). The declared count "
        + "is the operator's and it is 2 above the licence. That is a "
        + "decision about how finely to draw this axis, taken with the "
        + "measurement in view, and not a claim that the evidence "
        + "separates 5 levels — read `tier_set`, which names every band a "
        + "club's interval touches, and treat `tier` as where the estimate "
        + "falls.",
      // the recut geometry, off the payload: equal-width, best-first
      cuts: [0.899551, 0.654605, 0.409659, 0.164713],
      span: [-0.08023, 1.14450], straddling: 4, placed: 2,
      rows: [
        // clear of the top cut (0.8996) at both ends — one of the two
        // this axis still places
        { rank: 1, club: "Beta", league: "la-liga", value: 0.96,
          half_width_95: 0.04, interval: [0.92, 1.0], tier: 1, tier_set: [1],
          straddles: false, below_floor: false, rate: 2.4, floor_note: null },
        // four bands of five, the widest set the real axis produces
        { rank: 2, club: "Floor High", league: "super-lig", value: 0.7,
          half_width_95: 0.3, interval: [0.4, 1.0], tier: 2,
          tier_set: [1, 2, 3, 4], straddles: true, below_floor: true,
          rate: 1.8, floor_note: "its league did not clear the floor" },
        { rank: 3, club: "Alpha", league: "epl", value: 0.5,
          half_width_95: 0.25, interval: [0.25, 0.75], tier: 3,
          tier_set: [2, 3, 4], straddles: true, below_floor: false, rate: 1.6,
          floor_note: null },
        { rank: 4, club: "Gamma", league: "serie-a", value: 0.3,
          half_width_95: 0.2, interval: [0.1, 0.5], tier: 4,
          tier_set: [3, 4, 5], straddles: true, below_floor: false, rate: 1.3,
          floor_note: null },
        { rank: 5, club: "Floor Low", league: "eliteserien", value: 0.15,
          half_width_95: 0.35, interval: [-0.2, 0.5], tier: 5,
          tier_set: [3, 4, 5], straddles: true, below_floor: true, rate: 1.1,
          floor_note: "its league did not clear the floor" },
        // under the bottom cut (0.1647) at both ends — the other placed
        { rank: 6, club: "Delta", league: "epl", value: 0.05,
          half_width_95: 0.09, interval: [-0.04, 0.14], tier: 5,
          tier_set: [5], straddles: false, below_floor: false, rate: 0.9,
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

// ------------------- the band count is a DECLARATION, not a finding ---

/** Switch to the attack axis and wait for the table to actually be that
 *  axis. The click and the redraw are not one event, and every band
 *  assertion below reads a single element that both axes render — so a
 *  read taken before the swap lands measures `ovr` while claiming to
 *  measure `atk`, and passes or fails for reasons that have nothing to
 *  do with the band count. The attribute assertion IS the wait. */
async function attack(page: import("@playwright/test").Page) {
  await page.getByTestId("axis-tab").filter({ hasText: /attack/i }).click();
  await expect(page.getByTestId("axis-table"))
    .toHaveAttribute("data-axis", "atk");
}

test("the count drawn is the DECLARED one, and the licence is drawn beside "
   + "it as a licence", async ({ page }) => {
    await open(page);
    await attack(page);
    // FIVE is what the field is cut into and what the page must draw.
    // Three is what the measurement licenses. Drawing three here would
    // be the page quietly overruling the operator; drawing five with no
    // three beside it would be it hiding what the evidence said.
    const declared = page.getByTestId("band-declared");
    await expect(declared).toHaveCount(1);
    await expect(declared).toHaveAttribute("data-bands", "5");
    await expect(declared).toContainText(/declared/i);

    const licence = page.getByTestId("band-licence");
    await expect(licence).toHaveCount(1);
    await expect(licence).toHaveAttribute("data-bands-licensed", "3");
    await expect(licence).toContainText(/licensed by the measurement/i);

    // AND THE LEVELS BELONG TO THE LICENCE, NOT TO THE COUNT. This is
    // the whole defect the recut exposed: "5 bands · 2.41
    // distinguishable levels" put the measurement next to the
    // declaration with a middot between them, which reads as the reason
    // for it. 2.41 is what licenses THREE, so it sits with the three.
    await expect(licence).toContainText("2.41");
    await expect(declared).not.toContainText("2.41");
  });

test("where the declaration is above the licence the backend's own note is "
   + "PRINTED, whole", async ({ page }) => {
    await open(page);
    await attack(page);
    await expect(page.getByTestId("band-count"))
      .toHaveAttribute("data-declared-above-licence", "true");
    const note = page.getByTestId("band-count-note");
    await expect(note).toHaveCount(1);
    // verbatim. A paraphrase would be this page deciding how much of the
    // operator's reasoning the reader is allowed to have, and a trimmed
    // version would soften a decision he took with the measurement in
    // front of him.
    await expect(note).toHaveText(ABOVE_LICENCE_NOTE);
  });

test("an axis declared BELOW its licence differs from it without a note, and "
   + "nothing there implies overreach", async ({ page }) => {
    await open(page);   // opens on `ovr`
    await expect(page.getByTestId("axis-table"))
      .toHaveAttribute("data-axis", "ovr");
    // 5 declared, 7 licensed: the two numbers DIFFER, and this is the
    // direction that is not a caution. Both are drawn…
    await expect(page.getByTestId("band-declared"))
      .toHaveAttribute("data-bands", "5");
    await expect(page.getByTestId("band-licence"))
      .toHaveAttribute("data-bands-licensed", "7");
    // …and the flag the note rides is false, so no note is drawn. A page
    // that keyed the note on "the numbers differ" would print an
    // overreach warning on the one axis that sits inside its evidence.
    await expect(page.getByTestId("band-count"))
      .toHaveAttribute("data-declared-above-licence", "false");
    await expect(page.getByTestId("band-count-note")).toHaveCount(0);
  });

test("the note is ABSENT where the declaration and the licence agree",
  async ({ page }) => {
    // The backend's own counterfactual, run on the frontend: move the
    // measurement until the licence catches the declaration up, and the
    // note must go. Nothing about the field changed — only what the
    // evidence separates.
    const agreeing = JSON.parse(JSON.stringify(RATINGS));
    agreeing.axes.ovr.distinguishable_levels = 4.80;
    agreeing.axes.ovr.bands_licensed_by_the_measurement = 5;
    agreeing.axes.ovr.declared_above_licence = false;
    agreeing.axes.ovr.band_count_note = null;
    await open(page, agreeing);
    await expect(page.getByTestId("band-declared"))
      .toHaveAttribute("data-bands", "5");
    await expect(page.getByTestId("band-licence"))
      .toHaveAttribute("data-bands-licensed", "5");
    await expect(page.getByTestId("band-count"))
      .toHaveAttribute("data-declared-above-licence", "false");
    await expect(page.getByTestId("band-count-note")).toHaveCount(0);
  });

test("a payload from before the recut draws its count and asserts NOTHING "
   + "about a licence", async ({ page }) => {
    // Every declaration key stripped — which is exactly what the served
    // payload looked like until 2026-09-10, and what a cached or
    // rolled-back backend still serves.
    const before = JSON.parse(JSON.stringify(RATINGS));
    for (const k of Object.keys(before.axes)) {
      const a = before.axes[k];
      delete a.bands_declared;
      delete a.bands_licensed_by_the_measurement;
      delete a.band_count_is_declared_not_derived;
      delete a.declared_above_licence;
      delete a.band_count_note;
    }
    await open(page, before);

    // it still renders, whole
    await expect(page.getByTestId("axis-row")).toHaveCount(6);
    // and the count is drawn as the plain count it was. NOT "declared":
    // on that payload the number WAS a derivation, and calling it the
    // operator's would invent a decision nobody took.
    const declared = page.getByTestId("band-declared");
    await expect(declared).toHaveAttribute("data-bands", "5");
    await expect(declared).not.toContainText(/declared/i);

    // nothing is claimed about a licence, because nothing was sent
    await expect(page.getByTestId("band-licence")).toHaveCount(0);
    await expect(page.getByTestId("band-count-note")).toHaveCount(0);

    // MISSING IS NEVER FALSE. `getAttribute` does not auto-wait, but the
    // assertions above have already settled this element, so a null here
    // is the absent attribute and not an unrendered page. A page that
    // defaulted the flag would publish `false` — an agreement between
    // two numbers, one of which this payload does not contain.
    const flag = await page.getByTestId("band-count")
      .getAttribute("data-declared-above-licence");
    expect(flag).toBeNull();

    // the measurement it DID carry is still on the page, not dropped on
    // the way past: losing a figure the page used to show would be its
    // own quiet edit
    await expect(page.getByTestId("band-levels")).toContainText("6.12");
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

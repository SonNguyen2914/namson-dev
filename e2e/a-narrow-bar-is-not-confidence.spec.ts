// A NARROW BAR IS NOT CONFIDENCE, AND ZERO BRIDGES IS THE CASE THAT
// PROVES IT.
//
// WHAT THE INTERVAL ACTUALLY MEASURES. `half_width_95` on every rating
// surface is a delete-d jackknife over BRIDGE FIXTURES — the archive's
// own words: it measures "how much the rating depends on WHICH BRIDGE
// FIXTURES ARE IN THE CORPUS". So a club that played NONE barely moves
// when bridges are deleted, and comes back with the narrowest interval
// in the field. The measurement says this out loud, under
// `row_field_meanings.bridge_fixtures`:
//
//   "How many cross-league fixtures this club actually played. READ
//    THIS BEFORE half_width_95. A club with zero played no bridges, so
//    deleting bridges barely moves it and it draws a NARROW bar for the
//    reason that makes it LEAST evidenced."
//
// MEASURED, NOT ASSERTED. Across the ten league slices of
// research_archive/league_field_cups_2026-09-17/slices.json: 701 rows at
// zero bridges with a MEDIAN half-width of 0.00, against 937 bridged
// rows at 19.44. Every one of the 701 carries a non-null
// `evidence_warning`, and not one of the 937 does. The thinnest marks in
// that field are its emptiest rows, and the ratio runs the wrong way by
// a factor there is no reading of "precision" that survives.
//
// SO THE CLAIM UNDER GUARD IS A BICONDITIONAL, AND IT IS DERIVED. For
// every row on every rating surface: `bridge_fixtures === 0` iff the
// warning is in the DOM. Both directions matter — a page that printed
// the warning on every row would pass a one-directional check while
// saying nothing, and a page that printed it nowhere would pass a check
// that forgot to count.
//
// AND IT IS COUNTED, NOT SAMPLED. The expected set is enumerated FROM
// THE PAYLOAD'S OWN ROWS and its LENGTH is asserted against what the DOM
// rendered. This repository has been bitten by exactly the other shape:
// a guard that named a rule, then checked a hand-typed subset, and
// stayed green for as long as it took the omitted case to drift — La
// Liga disarmed itself on every boot underneath a test called "both
// planes" that listed two of three. A hand-typed list of clubs here
// would go green the day a row is added to the fixture and never
// mention it.
//
// NOTHING HERE IS A RECOMMENDATION. These assertions are about what the
// page SHOWS; no string under test tells a reader to do anything.

import { expect, test, type Page } from "@playwright/test";

const json = (b: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(b),
});

/** THE MEASUREMENT'S OWN SENTENCE, verbatim from
 *  `scripts/measure_league_field.py` by way of the archive. Copied whole
 *  rather than matched on a fragment: the claim is that the page PRINTS
 *  the backend's words rather than composing its own caution, and a
 *  regex over half a clause would pass just as happily against a
 *  paraphrase written here. */
const WARNING =
  "THIS CLUB PLAYED NO CROSS-LEAGUE FIXTURES. Its 95% half-width is a "
  + "delete-d jackknife over bridge fixtures, and deleting a subset of an "
  + "empty set returns exactly zero — so the narrow interval beside this "
  + "rating measures the ABSENCE of bridge evidence, not agreement about "
  + "where this club stands. Read `bridge_fixtures` before `half_width_95`.";

/** Two axes, arranged so the biconditional has cases in both directions
 *  and on both sides of the tier geometry.
 *
 *  THE SHAPE IS THE REAL ONE. Zero-bridge rows carry a half-width of
 *  0.00 and an interval of zero width, which is what the league field
 *  actually publishes for them (median 0.00 across 701 rows) — and it is
 *  precisely the value the old renderer drew as a 0.6%-wide sliver, the
 *  thinnest mark it could produce. `Unbridged Leader` is rank 1 on the
 *  overall axis on purpose: the inversion is worst where the reader is
 *  most likely to look, and a fixture that parked every zero-bridge club
 *  at the bottom would let a renderer pass by accident.
 *
 *  BRIDGED ROWS CARRY THE KEY TOO, WITH A NON-ZERO COUNT. A fixture
 *  where only the zero rows had `bridge_fixtures` would let a renderer
 *  key off the key's PRESENCE and still pass, which is the truthiness
 *  bug this guard exists to catch. */
const row = (
  rank: number, club: string, value: number, hw: number,
  tier: number, tier_set: number[], bridges: number,
) => ({
  rank, club, league: "epl", value,
  half_width_95: hw, interval: [value - hw, value + hw],
  tier, tier_set, straddles: tier_set.length > 1,
  below_floor: false, rate: null, floor_note: null,
  bridge_fixtures: bridges,
  evidence_warning: bridges === 0 ? WARNING : null,
});

const RATINGS = {
  competition: "ucl",
  display: "UEFA Champions League",
  passes: "10",
  below_floor_clubs: [],
  below_floor_note: "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING.",
  axes_disagree_note:
    "The three axes are read from two different measurements and do not agree.",
  not_a_trading_signal: true,
  axes: {
    ovr: {
      axis: "ovr", label: "overall", bands: 5, distinguishable_levels: 6.12,
      unit: "elo",
      bands_declared: 5, bands_licensed_by_the_measurement: 7,
      band_count_is_declared_not_derived: true,
      declared_above_licence: false, band_count_note: null,
      why_this_many_bands: "five bands, declared.",
      cuts: [1900, 1800, 1700, 1600], span: [1500, 2000],
      straddling: 1, placed: 4,
      rows: [
        // THE INVERSION, AT RANK 1: zero bridges, zero width, and under
        // the old renderer the thinnest — most certain-looking — mark on
        // the page.
        row(1, "Unbridged Leader", 1960, 0, 1, [1], 0),
        row(2, "Bridged Alpha", 1880, 34, 2, [1, 2], 210),
        row(3, "Bridged Beta", 1770, 28, 3, [3], 168),
        // and at the bottom, where a reader reads it as "we are very
        // sure this is the worst club in the field"
        row(4, "Unbridged Tail", 1540, 0, 5, [5], 0),
      ],
    },
    atk: {
      axis: "atk", label: "attack", bands: 5, distinguishable_levels: 2.41,
      unit: "log_goals",
      bands_declared: 5, bands_licensed_by_the_measurement: 3,
      band_count_is_declared_not_derived: true,
      declared_above_licence: false, band_count_note: null,
      why_this_many_bands: "five bands, declared.",
      cuts: [0.9, 0.65, 0.41, 0.16], span: [-0.08, 1.14],
      straddling: 1, placed: 3,
      rows: [
        row(1, "Bridged Alpha", 0.96, 0.04, 1, [1], 210),
        row(2, "Unbridged Leader", 0.7, 0, 2, [2], 0),
        row(3, "Bridged Beta", 0.3, 0.2, 4, [3, 4], 168),
        row(4, "Unbridged Tail", 0.05, 0, 5, [5], 0),
      ],
    },
  },
};

type Row = { club: string; bridge_fixtures: number };
type Axis = { axis: string; rows: Row[] };

/** THE EXPECTED SETS, READ OFF THE PAYLOAD AND NEVER TYPED OUT.
 *
 *  This is the whole discipline of the guard. Add a row to `RATINGS`
 *  above and this walks it; a hand-written list would not, and the
 *  omitted row is always the one that drifts. */
const axesOf = (r: typeof RATINGS): Axis[] =>
  Object.values(r.axes) as unknown as Axis[];
const zeroBridge = (a: Axis) => a.rows.filter((x) => x.bridge_fixtures === 0);
const bridged = (a: Axis) => a.rows.filter((x) => x.bridge_fixtures !== 0);

/** THE GUARD ITSELF, run against whatever page is showing a field.
 *
 *  IT IS A FUNCTION BECAUSE THERE IS MORE THAN ONE RATING SURFACE. The
 *  field page and the competition viewer draw the SAME component off the
 *  SAME endpoint, and a rule checked on one of them is a rule that holds
 *  on one of them. */
async function everyRowOnEveryAxis(page: Page) {
  const axes = axesOf(RATINGS);
  expect(axes.length, "the fixture must carry more than one axis, or "
    + "the tab walk below proves nothing").toBeGreaterThan(1);

  for (const a of axes) {
    await page.getByTestId("axis-tab").filter({ hasText: new RegExp(
      a.axis === "ovr" ? "^overall$" : "^attack$", "i") }).click();
    await expect(page.getByTestId("axis-table")).toHaveAttribute(
      "data-axis", a.axis);

    const expectZero = zeroBridge(a);
    const expectBridged = bridged(a);

    // NEITHER SIDE MAY BE EMPTY. A guard whose expected set is empty
    // passes by having nothing to check, which is the failure mode this
    // whole file is written against.
    expect(expectZero.length,
      `axis ${a.axis} has no zero-bridge rows to check`).toBeGreaterThan(0);
    expect(expectBridged.length,
      `axis ${a.axis} has no bridged rows to contrast against`)
      .toBeGreaterThan(0);

    // ---- THE COUNT. Asserted as a length, against the DOM's own. ----
    const warnings = page.getByTestId("axis-table")
      .getByTestId("evidence-warning-row");
    await expect(warnings,
      `axis ${a.axis}: one warning per zero-bridge row, no more and no `
      + "less").toHaveCount(expectZero.length);

    // ---- FORWARD: every zero-bridge row SAYS SO, in the backend's
    //      own words, and draws NO bar. ----
    for (const r of expectZero) {
      const tr = page.getByTestId("axis-row").filter({
        has: page.locator(`[data-club="${r.club}"]`),
      }).or(page.locator(`tr[data-testid="axis-row"][data-club="${r.club}"]`));

      await expect(tr.first(),
        `${a.axis}/${r.club}: the row must carry its bridge count`)
        .toHaveAttribute("data-bridge-fixtures", "0");

      // THE WARNING IS IN THE DOM, WHOLE. Not a title attribute, not a
      // truncation: `toContainText` against the entire sentence.
      const warn = page.locator(
        `tr[data-testid="evidence-warning-row"][data-club="${r.club}"]`);
      await expect(warn,
        `${a.axis}/${r.club}: zero bridges and no warning in the DOM — `
        + "this is the inversion, rendered").toHaveCount(1);
      await expect(warn).toContainText(WARNING);

      // AND NO BAR. The refusal is the treatment: a zero-width interval
      // drawn as the thinnest possible sliver is the visual vocabulary
      // for maximum certainty, applied to no evidence at all.
      await expect(tr.first().getByTestId("bar-refused"),
        `${a.axis}/${r.club}: a bar was drawn for a club with no bridge `
        + "evidence").toHaveCount(1);
      await expect(tr.first().getByTestId("bar-refused"))
        .toHaveText("no bridge evidence");
    }

    // ---- BACKWARD: a bridged row carries NO warning and DOES draw its
    //      bar. Without this the page could print the caution on every
    //      row and pass the forward half while saying nothing. ----
    for (const r of expectBridged) {
      await expect(page.locator(
        `tr[data-testid="evidence-warning-row"][data-club="${r.club}"]`),
      `${a.axis}/${r.club}: a bridged row must not carry the no-evidence `
      + "warning").toHaveCount(0);

      const tr = page.locator(
        `tr[data-testid="axis-row"][data-club="${r.club}"]`);
      await expect(tr).toHaveAttribute(
        "data-bridge-fixtures", String(r.bridge_fixtures));
      await expect(tr.getByTestId("bar-refused"),
        `${a.axis}/${r.club}: a bridged row's interval must still be drawn`)
        .toHaveCount(0);
    }

    // ---- THE COUNT IS ON THE PAGE AS A COUNT, to the LEFT of the
    //      interval. The archive's instruction is "READ THIS BEFORE
    //      half_width_95", which is a statement about reading ORDER. ----
    await expect(page.getByTestId("axis-table")
      .getByTestId("bridge-count")).toHaveCount(a.rows.length);
  }
}

test.describe("a narrow bar is not confidence", () => {
  test("the field page: every zero-bridge row names its absence",
    async ({ page }) => {
      await page.route("**/api/comp/ucl/ratings**", (r) =>
        r.fulfill(json(RATINGS)));
      await page.goto("/bet-suggester/ratings?comp=ucl");
      await expect(page.getByTestId("field-axes")).toBeVisible();
      await everyRowOnEveryAxis(page);
    });

  test("the competition viewer: the same rule on the same component",
    async ({ page }) => {
      await page.route("**/api/comp/ucl/ratings**", (r) =>
        r.fulfill(json(RATINGS)));
      await page.route("**/api/comp/ucl/fixtures**", (r) =>
        r.fulfill(json({ competition: "ucl", display: "UEFA Champions League",
          fixtures: [], model: { state: "no_model_by_design",
            why: "a cup with qualifying rounds", note: null } })));
      await page.route("**/api/comp/ucl/markets**", (r) =>
        r.fulfill(json({ markets: [] })));
      await page.goto("/bet-suggester/comp/ucl");
      await expect(page.getByTestId("field-axes")).toBeVisible();
      await everyRowOnEveryAxis(page);
    });

  /* THE FIT IS NAMED. `passes` rode the payload and the type since this
     page existed and was read by NOTHING, so two surfaces could draw two
     different fits of one club and neither said which — Arsenal is ~199
     elo apart between the 10-pass live field and the 1-pass archived
     league bundles, which is more than five times the widest interval on
     that axis. */
  test("the field says which fit it is", async ({ page }) => {
    await page.route("**/api/comp/ucl/ratings**", (r) =>
      r.fulfill(json(RATINGS)));
    await page.goto("/bet-suggester/ratings?comp=ucl");
    await expect(page.getByTestId("field-passes")).toHaveAttribute(
      "data-passes", "10");
    await expect(page.getByTestId("field-passes")).toContainText("10-pass");
  });

  /* MISSING IS NOT ZERO, and it is the case a renderer keyed on
     truthiness gets wrong in the quietest way. Today's live payload
     carries NO `bridge_fixtures` at all — verified against production on
     2026-09-22 — and a page that read `!r.bridge_fixtures` would brand
     all 36 Champions League clubs as having no bridge evidence, which is
     a claim about the corpus made off a key that was never sent. */
  test("a payload with no bridge counts asserts nothing about bridges",
    async ({ page }) => {
      const stripped = JSON.parse(JSON.stringify(RATINGS));
      for (const a of Object.values(stripped.axes) as { rows: Record<
        string, unknown>[] }[]) {
        for (const r of a.rows) {
          delete r.bridge_fixtures;
          delete r.evidence_warning;
        }
      }
      await page.route("**/api/comp/ucl/ratings**", (r) =>
        r.fulfill(json(stripped)));
      await page.goto("/bet-suggester/ratings?comp=ucl");
      await expect(page.getByTestId("field-axes")).toBeVisible();

      // No warning anywhere, and no attribute claiming a count of zero.
      await expect(page.getByTestId("evidence-warning-row")).toHaveCount(0);
      await expect(page.locator("[data-bridge-fixtures]")).toHaveCount(0);
      // And no column of nothing: a bridges header with 4 blank cells
      // under it is indistinguishable from a column that broke.
      await expect(page.getByTestId("bridge-count")).toHaveCount(0);

      // THE ZERO-WIDTH ROWS ARE STILL REFUSED. This is the half of the
      // fix that is correct on TODAY's payload: a 95% interval of zero
      // width is not a precise measurement, it is an interval that
      // measured nothing, and it must not be drawn as the former merely
      // because the payload cannot say which it is.
      await expect(page.locator(
        'tr[data-club="Unbridged Leader"] [data-testid="bar-refused"]'))
        .toHaveText("zero-width interval");
    });
});

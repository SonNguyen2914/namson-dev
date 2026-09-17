import { expect, test } from "@playwright/test";

// THE NUMBER THE TIER WAS READ OFF, ON THE CARD.
//
//   "they all have ovr, atk, def tiers but dont have the actual number
//    to rank is not consistent and doesnt make sense"
//                                       (operator, 2026-09-16)
//
// WHAT HE WAS COMPARING. Two surfaces of ONE fit. `/bet-suggester/
// ratings` has always drawn `value ± half_width_95` for these clubs;
// the board card drew the RANK and the TIER that are computed from
// them and could not draw the numbers themselves — because
// `stages._field_side` published the first two and dropped the last
// three on the way to the wire.
//
// ─── WHAT IS AT STAKE, and why each is a property here ──────────────
//
//  1. THE NUMBER IS BESIDE ITS TIER. Not on another page, not behind a
//     click: on the card, under the band it produced.
//
//  2. A VALUE AND ITS HALF-WIDTH TRAVEL TOGETHER. A bare figure asserts
//     a precision the measurement refuses — the same defect `tier_set`
//     exists to stop `tier` committing. So the two are ONE string and
//     no layout can separate them, and a payload carrying one without
//     the other draws neither.
//
//  3. THE THREE AXES ARE NOT ONE SCALE. `ovr` is elo and the goals axes
//     are log-goals. The figures are written to the scale's own
//     precision and the scale is NAMED where a reader can reach it.
//
//  4. DEFENCE IS SIGNED SO THAT HIGHER IS BETTER. The card must not
//     re-invert it: rank 1 on defence has the HIGHEST value and the
//     LOWEST concede rate, and a card that flipped the sign would
//     disagree with the ladder it is drawn from.
//
//  5. ABSENT IS NOT ZERO. A board from a backend that predates this
//     carries no measurement, and the card must then be the card it was
//     before — no 0, no dash where a rating goes.
//
//  6. IT SHOWS; IT DOES NOT DECIDE. Nothing rendered here tells anyone
//     to do anything.
//
// EVERY EXPECTATION IS READ OFF THE FIXTURE, never typed beside it —
// the rule `field-on-the-card.spec.ts` states and the reason its own
// fixture went four days disagreeing with the wire.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const FLOOR_NOTE =
  "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's "
  + "league did not clear the floor: its median club interval is wider "
  + "than one band of the field, so the evidence does not place it in a "
  + "tier. The rating itself stands and is shown — the wide interval "
  + "beside it IS the refusal.";

/** One club on one axis, shaped like the wire. `tier` is a parameter
 *  and not `set[0]`: on the live payload those differ on 31 of 36
 *  attack rows. */
const axisRow = (rank: number, club: string, value: number, hw: number,
                 set: number[], tier: number, below = false,
                 rate: number | null = null) => ({
  rank, club, league: "ucl", value, half_width_95: hw,
  interval: [value - hw, value + hw], tier, tier_set: set,
  straddles: set.length > 1, below_floor: below, rate,
  floor_note: below ? FLOOR_NOTE : null,
});

/* THE TWO UNITS, AND THE FIGURES CHOSEN TO TELL THEM APART.
 *
 * `ovr` runs in the high 1000s and `atk`/`def` between 0 and about 1.2,
 * which is the whole reason the unit has to travel: a card drawing
 * 1964 six pixels from 1.14 says nothing about the two being different
 * kinds of quantity.
 *
 * DEFENCE READS THE SAME WAY ROUND AS THE OTHER TWO — rank 1 holds the
 * HIGHEST value and the LOWEST `rate`, because the artifact signs
 * defence so that higher is better. A fixture with `value` ascending
 * against rank would be the axis inverted against its own feed. */
const AXES = {
  ovr: {
    axis: "ovr", label: "overall", bands: 5, distinguishable_levels: 6.12,
    unit: "elo", cuts: [1900, 1800, 1700, 1600], span: [1550, 2000],
    why_this_many_bands: "five bands, declared.",
    rows: [
      axisRow(1, "Barcelona", 1964.4368, 33.6449, [1], 1),
      axisRow(2, "Feyenoord", 1726.6327, 92.9285, [2, 3], 3, true),
      axisRow(3, "Kairat Almaty", 1600.5, 40.25, [3, 4], 4),
    ],
    straddling: 2, placed: 1,
  },
  atk: {
    axis: "atk", label: "attack", bands: 5, distinguishable_levels: 2.41,
    unit: "log_goals", cuts: [1.0, 0.8, 0.6, 0.4], span: [0.2, 1.2],
    why_this_many_bands: "five bands, declared by the operator.",
    rows: [
      axisRow(1, "Barcelona", 1.1445, 0.2044, [1], 1, false, 3.3547),
      axisRow(2, "Feyenoord", 0.8669, 0.3800, [1, 2, 3, 4], 2, true, 2.1),
      axisRow(3, "Kairat Almaty", 0.3864, 0.3310, [3, 4, 5], 5, false, 1.4),
    ],
    straddling: 2, placed: 1,
  },
  def: {
    axis: "def", label: "defence", bands: 5, distinguishable_levels: 2.33,
    unit: "log_goals", cuts: [1.0, 0.8, 0.6, 0.4], span: [0.2, 1.2],
    why_this_many_bands: "five bands, declared by the operator.",
    rows: [
      // HIGHEST value, LOWEST rate — the signed axis, the way round the
      // artifact publishes it
      axisRow(1, "Barcelona", 1.1491, 0.3704, [1, 2], 1, false, 0.3385),
      axisRow(2, "Feyenoord", 0.4516, 0.4200, [2, 3, 4, 5], 4, true, 0.6800),
      axisRow(3, "Kairat Almaty", 0.2100, 0.2900, [4, 5], 5, false, 1.1620),
    ],
    straddling: 3, placed: 0,
  },
} as const;

type AxisKey = keyof typeof AXES;
const AXIS_KEYS = ["ovr", "atk", "def"] as AxisKey[];

const RATINGS = {
  competition: "ucl", passes: "10", axes: AXES,
  below_floor_clubs: ["Feyenoord"], below_floor_note: FLOOR_NOTE,
};

/* THE BOARD ROW, SHAPED THE WAY THE WIRE SHAPES IT. Lifted from
 * `field-on-the-card.spec.ts` rather than minimised: a card that does
 * not draw is a card none of these properties can be read off, and the
 * keys a row needs to render at all are not this file's subject. */
const meta = { src: "current", min_current_gp: 4, clubs: 3, kind: "cup",
               rated_on: ["epl", "laliga"], reg_time_note: null,
               blend_k: 10, blend_constant_w: null };

const kickoff = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 3_600_000).toISOString();

const row = (i: number, favourite: string, opponent: string) => ({
  refused: false, league: "ucl", column: "ucl",
  home: favourite, away: opponent, favourite, opponent,
  fav_side: "home", fav_source: "rank", resolution: {},
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  gp_current: { home: 4, away: 4, min: 4 },
  weights: { home: 0.28, away: 0.28, min: 0.28, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  src: "current", cross_league: true,
  rated_in: { home: "laliga", away: "epl" },
  gap_note: "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld.",
  reg_time_note: null, table_notes: { home: null, away: null },
  ranks: { fav: 1, opp: 4 },
  rates: { ppg: [2.6, 2.0], gf: [2.8, 2.2], ga: [0.7, 1.3], gdg: [2.1, 0.9] },
  own_gdg: { diff: 1.2, basis: "EACH CLUB'S OWN GD/g, DIFFERENCED" },
  tiers: { ovr: [1, 3], atk: [1, 2], def: [1, 4] },
  tier_gaps: { ovr: 2, atk: 1, def: 3 },
  shape: "CLEAN", event_id: `ucl-${i}`, competition_id: `ucl-${i}`,
  kickoff: kickoff(i), espn: "uefa.champions", venue: null, venue_class: null,
  kalshi: null, current_only: null,
  form: { fav: "WWDLW", opp: "LDWLL", scope: "ucl", scope_is_cup: true },
});

const BOARD = {
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: { ucl: meta },
  rows: [row(1, "Barcelona", "Feyenoord")],
  refusals: [], off_board: [], off_board_counts: {}, folded: {},
  narrowed_to: ["ucl"],
  field_unit_notes: {
    elo: "ELO, on the one cross-league scale this field is fitted on.",
    log_goals: "LOG-GOALS. Higher is better on both attack and defence.",
  },
};

const review = { finished: [], refusals: [], leagues: {}, store: null };

async function openBoard(page: import("@playwright/test").Page,
                         ratings: unknown = RATINGS,
                         board: unknown = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
  await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(ratings)));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("picker-row").first()).toBeAttached();
}

const cell = (page: import("@playwright/test").Page, axis: string) =>
  page.locator(`[data-measure="${axis}"]`).first();

/** How the fixture says a figure on this axis is written — the rule the
 *  app is asked to have applied, derived from the unit rather than
 *  typed beside each expectation. */
const decimals = (k: AxisKey) => (AXES[k].unit === "elo" ? 0 : 2);

const expected = (k: AxisKey, which: "fav" | "opp") => {
  const club = which === "fav" ? "Barcelona" : "Feyenoord";
  const r = AXES[k].rows.find((x) => x.club === club)!;
  const d = decimals(k);
  return `${r.value.toFixed(d)}±${r.half_width_95.toFixed(d)}`;
};

// ─────────────────────────────────── 0. the fixture could be emitted ─

test("the fixture speaks the wire's language, not the code's",
  async () => {
    for (const k of AXIS_KEYS) {
      const a = AXES[k];
      // ranks are dense and start at 1
      expect(a.rows.map((r) => r.rank)).toEqual(
        a.rows.map((_, i) => i + 1));
      // HIGHER IS BETTER ON EVERY AXIS, defence included — the ordering
      // the backend's descending sort produces
      for (let i = 0; i + 1 < a.rows.length; i++) {
        expect(a.rows[i].value).toBeGreaterThan(a.rows[i + 1].value);
      }
      // THE REFUSED CLUB CARRIES THE WIDEST BAND, which is what
      // BELOW_FLOOR_NOTE claims — "the wide interval beside it IS the
      // refusal". A fixture where a placed club is vaguer than a
      // refused one describes a field the floor could not have
      // produced.
      const refused = a.rows.filter((r) => r.below_floor);
      const placed = a.rows.filter((r) => !r.below_floor);
      expect(refused.length).toBeGreaterThan(0);
      expect(placed.length).toBeGreaterThan(0);
      expect(Math.min(...refused.map((r) => r.half_width_95)))
        .toBeGreaterThan(Math.max(...placed.map((r) => r.half_width_95)));
      for (const r of a.rows) {
        // a value and its half-width travel together, and the interval
        // is theirs
        expect(r.interval[0]).toBeCloseTo(r.value - r.half_width_95, 9);
        expect(r.interval[1]).toBeCloseTo(r.value + r.half_width_95, 9);
        expect(r.half_width_95).toBeGreaterThan(0);
        expect(r.straddles).toBe(r.tier_set.length > 1);
        expect(r.tier_set).toContain(r.tier);
        // a value may not sit outside the field's own span
        expect(r.value).toBeGreaterThanOrEqual(a.span[0]);
        expect(r.value).toBeLessThanOrEqual(a.span[1]);
      }
    }
    // THE GOALS AXES CARRY THE EXPONENTIATED FIGURE AND ELO DOES NOT:
    // elo is a rating, not a rate, and has no per-match reading.
    expect(AXES.ovr.rows.every((r) => r.rate === null)).toBe(true);
    expect(AXES.atk.rows.every((r) => r.rate !== null)).toBe(true);
    // AND DEFENCE'S RATE RUNS THE OTHER WAY FROM ITS VALUE — best
    // defence, fewest conceded. This is the inversion the card must
    // never perform on the value itself.
    const d = AXES.def.rows;
    expect(d[0].value).toBeGreaterThan(d[d.length - 1].value);
    expect(d[0].rate!).toBeLessThan(d[d.length - 1].rate!);
    // the two units really differ in magnitude, or point 3 proves
    // nothing
    expect(AXES.ovr.rows[0].value).toBeGreaterThan(100);
    expect(AXES.atk.rows[0].value).toBeLessThan(10);
  });

// ───────────────────────────────── 1. the number is beside its tier ─

test("every axis draws the figure its tier was read off", async ({ page }) => {
  await openBoard(page);
  for (const k of AXIS_KEYS) {
    const c = cell(page, k);
    await expect(c).toBeVisible();
    // the trio's own cell for this axis holds BOTH the tier pair and
    // the figures — "beside its tier" is a DOM fact, not a screenshot
    const trio = page.locator(`[data-tier="${k}"]`).first();
    await expect(trio.locator(`[data-measure="${k}"]`)).toHaveCount(1);
    await expect(c.locator('[data-measure-side="fav"]'))
      .toHaveText(expected(k, "fav"));
    await expect(c.locator('[data-measure-side="opp"]'))
      .toHaveText(expected(k, "opp"));
  }
});

test("the figure is written to its own scale's precision",
  async ({ page }) => {
    await openBoard(page);
    // ELO IS WHOLE POINTS and log-goals is two places. Asserted as a
    // SHAPE — digits after the separator — so it cannot pass by
    // matching a hard-coded string that happens to agree.
    const decimalsShown = async (axis: AxisKey) => {
      const t = await cell(page, axis)
        .locator('[data-measure-side="fav"]').innerText();
      const head = t.split("±")[0];
      return head.includes(".") ? head.split(".")[1].length : 0;
    };
    for (const k of AXIS_KEYS) {
      expect(await decimalsShown(k)).toBe(decimals(k));
    }
    // and the two rules really are different, or this proves nothing
    expect(decimals("ovr")).not.toBe(decimals("atk"));
  });

test("the value and its half-width are one string a layout cannot split",
  async ({ page }) => {
    await openBoard(page);
    for (const k of AXIS_KEYS) {
      for (const which of ["fav", "opp"] as const) {
        const el = cell(page, k).locator(`[data-measure-side="${which}"]`);
        const text = await el.innerText();
        // BOTH HALVES, IN ONE ELEMENT. A value in one node and a
        // half-width in another is a value a narrow column can wrap
        // away from its band, and a bare number is the precision this
        // whole change refuses to assert.
        expect(text).toContain("±");
        expect(text.split("±")).toHaveLength(2);
        expect(text.split("±")[0].length).toBeGreaterThan(0);
        expect(text.split("±")[1].length).toBeGreaterThan(0);
        // one line, so the pair cannot be broken across two
        expect(await el.evaluate((n) =>
          getComputedStyle(n).whiteSpace)).toBe("nowrap");
      }
    }
  });

test("the scale is named where a reader can reach it", async ({ page }) => {
  await openBoard(page);
  for (const k of AXIS_KEYS) {
    const c = cell(page, k);
    // THE UNIT TRAVELS WITH THE NUMBER, off the payload rather than
    // restated here
    await expect(c).toHaveAttribute("data-unit", AXES[k].unit);
    const title = await c.getAttribute("title");
    expect(title).toBeTruthy();
    // the axis's own word for itself, and the scale in a reader's
    expect(title!).toContain(AXES[k].label);
    expect(title!).toContain(AXES[k].unit === "elo" ? "elo" : "log-goals");
    // and the interval IN FULL, both bounds, from the payload
    const fav = AXES[k].rows.find((r) => r.club === "Barcelona")!;
    const d = decimals(k);
    expect(title!).toContain(fav.interval[0].toFixed(d));
    expect(title!).toContain(fav.interval[1].toFixed(d));
  }
});

test("defence is not re-inverted on its way to the card",
  async ({ page }) => {
    await openBoard(page);
    // THE CARD DRAWS THE SIGNED VALUE. Barcelona is rank 1 on defence
    // and holds the HIGHEST value; a card that flipped the sign
    // because "conceding less is better" would print the favourite
    // BELOW the opponent and disagree with the ladder the tier came
    // from.
    const read = async (which: "fav" | "opp") => {
      const t = await cell(page, "def")
        .locator(`[data-measure-side="${which}"]`).innerText();
      return Number(t.split("±")[0]);
    };
    const fav = await read("fav"), opp = await read("opp");
    const rows = AXES.def.rows;
    const barca = rows.find((r) => r.club === "Barcelona")!;
    const feyen = rows.find((r) => r.club === "Feyenoord")!;
    expect(fav).toBeCloseTo(barca.value, 2);
    expect(opp).toBeCloseTo(feyen.value, 2);
    expect(fav).toBeGreaterThan(opp);
    expect(barca.rank).toBeLessThan(feyen.rank);
    // the better-ranked club really does concede fewer, so "higher is
    // better" and the rank agree on this axis
    expect(barca.rate!).toBeLessThan(feyen.rate!);
  });

// ──────────────── 2. a refused club, and the width that refuses it ───

test("a below-floor club shows its rating, and the width is the refusal",
  async ({ page }) => {
    await openBoard(page);
    // THE FLOOR REFUSED TO PLACE IT, NOT TO MEASURE IT. Feyenoord is
    // the refused club here and its number is drawn like everybody
    // else's — withholding it would invent an absence the backend does
    // not report.
    for (const k of AXIS_KEYS) {
      await expect(cell(page, k).locator('[data-measure-side="opp"]'))
        .toHaveText(expected(k, "opp"));
    }
    // THE WIDTH IS WHERE THE REFUSAL SHOWS, so the refused club's
    // figure is the one with the widest band on the card. Compared
    // against what is actually RENDERED rather than against the
    // fixture — asserting a fixture back at itself proves nothing, and
    // the backend measures the same property over the real field in
    // tests/test_picker_field_value_on_wire.py.
    for (const k of AXIS_KEYS) {
      const width = async (which: "fav" | "opp") => {
        const t = await cell(page, k)
          .locator(`[data-measure-side="${which}"]`).innerText();
        return Number(t.split("±")[1]);
      };
      expect(await width("opp")).toBeGreaterThan(await width("fav"));
    }
    // the dagger that says so is still beside the band, unchanged
    await expect(page.getByTestId("field-floor-mark").first())
      .toBeVisible();
  });

// ───────────────────────────── 3. absent is not empty, and not zero ──

test("a board with no measurement draws the card it drew before",
  async ({ page }) => {
    // A BACKEND THAT PREDATES THE CHANGE. The ordering constraint
    // between the two repositories: this frontend ships first and must
    // tolerate the old payload, so the three keys are stripped from
    // every row of the field the card reads.
    const stripped = {
      ...RATINGS,
      axes: Object.fromEntries(AXIS_KEYS.map((k) => [k, {
        ...AXES[k],
        rows: AXES[k].rows.map(({ value, half_width_95, interval, ...rest }) =>
          rest),
      }])),
    };
    await openBoard(page, stripped);
    // NOT DRAWN AT ALL — no 0, no "0.00", no dash where a rating goes
    await expect(page.locator("[data-measure]")).toHaveCount(0);
    // and the card is otherwise the card it was: the trio and its
    // bands are untouched
    for (const k of AXIS_KEYS) {
      await expect(page.locator(`[data-tier="${k}"]`).first())
        .toBeVisible();
    }
    const body = await page.getByTestId("picker-row").first().innerText();
    expect(body).not.toMatch(/\b0\.00\b/);
  });

test("half a measurement is no measurement", async ({ page }) => {
    // A VALUE WITHOUT ITS HALF-WIDTH IS THE ONE THING THAT MUST NOT
    // REACH A READER. The backend has no path that emits it; if one
    // ever appears, the card refuses the pair rather than printing a
    // bare number that asserts a precision nothing measured.
    const halved = {
      ...RATINGS,
      axes: Object.fromEntries(AXIS_KEYS.map((k) => [k, {
        ...AXES[k],
        rows: AXES[k].rows.map(({ half_width_95, interval, ...rest }) => rest),
      }])),
    };
    await openBoard(page, halved);
    await expect(page.locator("[data-measure]")).toHaveCount(0);
  });

// ──────────────────────────────────── 4. it shows; it does not decide ─

test("nothing the figures added tells anybody what to do",
  async ({ page }) => {
    await openBoard(page);
    const forbidden = /\b(cash out|sell|you should|buy now|take the)\b/i;
    for (const k of AXIS_KEYS) {
      const c = cell(page, k);
      expect(await c.innerText()).not.toMatch(forbidden);
      expect(await c.getAttribute("title")).not.toMatch(forbidden);
    }
  });

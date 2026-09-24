import { expect, test } from "@playwright/test";
import { routeEight } from "./eight-columns";
import {
  CAMPEONES_FIELD_BOARD, CAMPEONES_FIELD_ROW, WIDE_PARTIAL,
  WIDE_PARTIAL_MEASURED,
} from "./campeones-field";

// THE FIELD, ON THE MATCH CARD — and on a page of its own.
//
// "The data like the artifact we are having on the actual UCL page is to
//  connect to the match cards and display on it, it actually showing it.
//  But this give me another idea, create a stat page on the web, put in
//  on the left upper side of the web for me to check rankings and tier
//  rankings anytime i need."              (operator, 2026-09-09)
//
// ─── WHAT IS AT STAKE, and why each of these is a property ───────────
//
//  1. A TIER IS A SET. Every club carries a 95% interval; on the attack
//     axis 33 of 36 clubs' intervals cross a band cut and on defence
//     almost every one does. A card printing "ATK 2" asserts a placement
//     the measurement refuses — which is the `OVR 1v1` defect the
//     operator objected to, the one that started this work: two clubs
//     the evidence could not separate, printed as level. So the set is
//     drawn whole, at every width, INCLUDING a set of one.
//
//  2. THE AXES CROSS. In a fixture the favourite's attack faces the
//     opponent's DEFENCE. Attack beside attack and defence beside
//     defence is two clubs printed adjacently, which is not a matchup —
//     it is an invitation to pair them wrongly. The backend has
//     `cross_league_axes.crossed()` for the shape; the card must draw
//     that shape and not the side-by-side one.
//
//  3. A FACT ABOUT THE WHOLE COLUMN GOES IN THE COLUMN HEADER, ONCE.
//     The operator's rule, given four separate times now — the season
//     share, the cross-league warning, the fit-block method note, and
//     this. How to read a tier set and what a dagger means are true of
//     every card in the column; on a six-abreast matchday, repeated per
//     card, they are most of the ink on the page.
//
//  4. MISSING IS NEVER ZERO, in two distinct shapes that look identical
//     on screen. A field read that FAILED and a club the field does not
//     hold both produce a card with no bands on it — and they are
//     different facts. Each is named, and named in a different place:
//     the failure belongs to the column (one fetch, one failure, one
//     sentence), the absent club belongs to the card.
//
//  5. THE MARK ON THE ELEVEN IS SUBTLE. "make sure to mark those 11
//     somehow for me to know their data were refused at first.
//     Subtlely." A dagger carrying the backend's own reason on hover —
//     the same mark the field page uses, so one convention covers both.
//
// EVERY EXPECTATION BELOW IS READ OFF THE FIXTURE, never typed beside
// it. A test that spells out "2·3" passes while the payload it describes
// changes underneath it; a test that asserts `tier_set.join("·")` cannot.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const kickoff = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 3_600_000).toISOString();

// ───────────────────────────────────────────── the field, as measured

const FLOOR_NOTE =
  "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's "
  + "league did not clear the floor: its median club interval is wider "
  + "than one band of the field, so the evidence does not place it in a "
  + "tier.";

/** THE BACKEND'S OWN PARAGRAPH when an axis is cut finer than the
 *  measurement licenses. `FieldAxes` prints it verbatim beside the two
 *  figures, so the fixture carries the real one. */
const ABOVE_LICENCE_NOTE =
  "DECLARED ABOVE WHAT THE MEASUREMENT LICENSES, AND THAT IS A DECISION "
  + "RATHER THAN A BUG. The band count on this axis is the operator's "
  + "declaration — he asked for this many bands with the measurement in "
  + "front of him — and it is finer than the distinguishable levels "
  + "beside it support. What that buys is a wider spread of point tiers "
  + "across the field. What it costs is that most clubs' 95% intervals "
  + "reach into more than one band, so `tier_set` is the reading and "
  + "`tier` is only where the estimate falls. NOTHING HERE CLAIMS THE "
  + "EVIDENCE SEPARATES THIS MANY LEVELS: `bands_licensed` is what it "
  + "separates, `bands_declared` is how finely the operator asked for it "
  + "to be drawn, and the two are published side by side precisely so "
  + "neither can be read as the other.";

/** One club on one axis.
 *
 *  `tier` IS A PARAMETER, NOT `set[0]` (corrected 2026-09-14). This
 *  helper computed `tier: set[0]`, and on the live field it is nothing
 *  of the kind: `tier` is the band the POINT ESTIMATE falls in and
 *  `tier_set` is every band the 95% interval touches, so on the real
 *  Champions League payload they differ on 31 of 36 attack rows and 32
 *  of 36 defence rows. The trio test above says in its own words that
 *  the card must draw "not the set's first member either" — and with
 *  every fixture row making those two the same number, that assertion
 *  could not tell them apart. A fixture that speaks the code's
 *  vocabulary instead of the feed's is the shape that certified a venue
 *  bug through twelve green tests. */
const axisRow = (rank: number, club: string, league: string, value: number,
                 hw: number, set: number[], tier: number, below = false,
                 rate: number | null = null) => ({
  rank, club, league, value, half_width_95: hw,
  interval: [value - hw, value + hw], tier, tier_set: set,
  straddles: set.length > 1, below_floor: below, rate,
  floor_note: below ? FLOOR_NOTE : null,
});

/* ── THE THREE AXES, AGAINST THE WIRE (corrected 2026-09-14) ─────────
 *
 * WHAT WAS WRONG. Attack and defence carried `bands: 3` with two cuts —
 * the geometry from before the operator declared FIVE bands on all
 * three axes (2026-09-10). `GET /api/comp/ucl/ratings` answers
 * `bands: 5` on every axis today, and `e2e/field-axes.spec.ts` was
 * recut for it on the day; this file was missed. Nothing asserted the
 * number, so it was harmless — and a fixture that disagrees with the
 * wire while nobody reads it is exactly the thing that produced five
 * separate bugs on 2026-09-11.
 *
 * WHAT ELSE DID NOT MATCH, found while correcting it. Read off the live
 * payload, not guessed:
 *
 *   CUTS RUN BEST-FIRST. The wire lists them descending — ovr
 *   [1845.99, 1727.54, 1609.10, 1490.65]. This file had them ascending.
 *   They are also EQUAL-WIDTH over the span, so a cut list and a band
 *   count that disagree is not a payload the backend can emit: five
 *   bands is four cuts, and each one sits a fifth of the span apart.
 *
 *   THE SPAN IS THE FIELD'S OWN RANGE — [lowest club's value, highest
 *   club's value] — not a pair of round numbers outside it. An interval
 *   may reach past either end; a VALUE may not.
 *
 *   DEFENCE READS THE SAME WAY ROUND AS THE OTHER TWO. On the wire
 *   rank 1 on `def` has the HIGHEST value (Arsenal, 1.149) and the
 *   LOWEST concede rate (0.338): `value` is defensive strength, `rate`
 *   is goals against. This file had `value` ascending with rank, so
 *   the fixture's best defence was its smallest number — the axis
 *   inverted against the feed it claims to be.
 *
 *   `tier` IS NOT `tier_set[0]`. See `axisRow` above.
 *
 *   THE DECLARATION KEYS ARE CARRIED. `bands_declared`,
 *   `bands_licensed_by_the_measurement`, `declared_above_licence` and
 *   `band_count_note` are what `FieldAxes.BandCount` reads to tell a
 *   count that OUTRAN its evidence (atk, def: 5 declared, 3 licensed)
 *   from one that sits inside it (ovr: 5 declared, 7 licensed). Without
 *   them this fixture exercised only the pre-recut fallback path.
 *
 * STILL ABSENT, AND DELIBERATELY: `five_band_price` (top level) and
 * each axis's `combined_reading`. Both ride the live payload; no
 * surface in this repo reads either, so carrying them here would be
 * ink asserting nothing. */
const AXES = {
  ovr: {
    axis: "ovr", label: "overall", bands: 5, distinguishable_levels: 6.12,
    unit: "elo",
    // DECLARED BELOW ITS LICENCE — five asked for, seven measured. No
    // flag and no note, and that is the difference this axis exists to
    // hold against the two below it.
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
    // span = [lowest value, highest value]; cuts every 76 elo, best first
    cuts: [2004, 1928, 1852, 1776], span: [1700, 2080],
    rows: [
      // [2040, 2120] — clear of the top cut at both ends, the one club
      // this axis places
      axisRow(1, "Barcelona", "la-liga", 2080, 40, [1], 1),
      // [1855, 1945] — band 3 to band 2; the ESTIMATE is in band 3
      axisRow(2, "Feyenoord", "eredivisie", 1900, 45, [2, 3], 3),
      // [1540, 1860] — three bands wide, and the estimate is in the
      // bottom one: `tier` 5 against a set that opens at 3
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 1700, 160,
              [3, 4, 5], 5, true),
    ],
    straddling: 2, placed: 1,
  },
  atk: {
    axis: "atk", label: "attack", bands: 5, distinguishable_levels: 2.41,
    unit: "log_goals",
    // DECLARED ABOVE ITS LICENCE — five asked for, three measured, and
    // the backend's own paragraph rides the flag.
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
    cuts: [0.676, 0.532, 0.388, 0.244], span: [0.10, 0.82],
    rows: [
      axisRow(1, "Barcelona", "la-liga", 0.82, 0.11, [1], 1, false, 2.61),
      axisRow(2, "Feyenoord", "eredivisie", 0.44, 0.14, [2, 3, 4], 3,
              false, 1.98),
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 0.10, 0.31,
              [3, 4, 5], 5, true, 1.21),
    ],
    straddling: 2, placed: 1,
  },
  def: {
    axis: "def", label: "defence", bands: 5, distinguishable_levels: 2.33,
    unit: "log_goals",
    bands_declared: 5, bands_licensed_by_the_measurement: 3,
    band_count_is_declared_not_derived: true,
    declared_above_licence: true, band_count_note: ABOVE_LICENCE_NOTE,
    why_this_many_bands:
      "five bands, declared by the operator on 2026-09-10 after seeing "
      + "this measurement. It is the finest cut of the three against the "
      + "widest intervals, so on this axis the set is the read and the "
      + "point tier is only where the estimate falls. BAND COUNT: 5 "
      + "declared, 3 licensed by the measurement (2.33 distinguishable "
      + "levels — the field's span over the typical club's 95% "
      + "interval). The declared count is the operator's and it is 2 "
      + "above the licence. That is a decision about how finely to draw "
      + "this axis, taken with the measurement in view, and not a claim "
      + "that the evidence separates 5 levels — read `tier_set`, which "
      + "names every band a club's interval touches, and treat `tier` as "
      + "where the estimate falls.",
    /* VALUE IS DEFENSIVE STRENGTH, HIGHEST FIRST, and `rate` is goals
       CONCEDED, lowest first — the wire's polarity, which this axis had
       backwards. Rank 1 now has the biggest number on the axis and the
       smallest number beside it, as Arsenal does on the live payload. */
    cuts: [0.684, 0.558, 0.432, 0.306], span: [0.18, 0.81],
    rows: [
      axisRow(1, "Barcelona", "la-liga", 0.81, 0.11, [1], 1, false, 0.74),
      axisRow(2, "Feyenoord", "eredivisie", 0.52, 0.16, [2, 3, 4], 3,
              false, 1.32),
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 0.18, 0.29,
              [3, 4, 5], 5, true, 1.90),
    ],
    straddling: 2, placed: 1,
  },
};

const RATINGS = {
  competition: "ucl", passes: "10", display: "UEFA Champions League",
  // a corpus hash is 64 hex on the wire; "deadbeef" was eight, which is
  // the shape of a git abbreviation and not of this field
  corpus_sha256:
    "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
  admitted_leagues: ["la-liga", "eredivisie"],
  below_floor_clubs: ["Kairat Almaty"],
  below_floor_note: FLOOR_NOTE,
  // the backend's whole sentence, which `FieldAxes` prints; this had
  // only its first clause, and the clause it dropped is the REASON
  axes_disagree_note: "The three axes are read from two different "
    + "measurements and do not agree. Attack and defence come from "
    + "goals, not from Elo, because Elo is a single number and any "
    + "decomposition of it would order the clubs identically twice.",
  not_a_trading_signal: true,
  axes: AXES,
};

/** The one club the FIELD does not hold, on a fixture the BOARD does. */
const UNHELD = "Pafos";

/** The axes' reading order, taken from the fixture rather than typed
 *  below it: a spec that spells out ["ovr","atk","def"] goes on passing
 *  if the card ever drops one. */
const AXIS_KEYS = Object.keys(AXES) as (keyof typeof AXES)[];

/** The two field rows a given card reads on one axis — resolved the way
 *  `fieldFor` resolves them (by club name, uncrossed), so this follows
 *  the component rather than restating it. Defaults to card ucl-1,
 *  Barcelona v Feyenoord: both held, both above the floor. */
const FIELD_ROW = (axis: string, fav = "Barcelona", opp = "Feyenoord") => {
  const rows = (AXES as Record<string, { rows: ReturnType<typeof axisRow>[] }>)
    [axis].rows;
  return { fav: rows.find((x) => x.club === fav)!,
           opp: rows.find((x) => x.club === opp)! };
};

// ───────────────────────────────────────────── the board, as narrowed

const meta = { src: "current", min_current_gp: 4, clubs: 36, kind: "cup",
               rated_on: ["epl", "laliga"], reg_time_note: null,
               blend_k: 10, blend_constant_w: null };

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
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 },
  shape: "CLEAN", event_id: `ucl-${i}`, competition_id: `ucl-${i}`,
  kickoff: kickoff(i), espn: "uefa.champions", venue: null, venue_class: null,
  kalshi: null, current_only: null,
  /* THE FORM STRIPS ARE PART OF THE CARD the operator is holding this
     page to, so the fixture carries them rather than leaving the one
     element that could silently stop drawing untested. */
  form: { fav: "WWDLW", opp: "LDWLL", scope: "ucl", scope_is_cup: true },
});

const BOARD = {
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: { ucl: meta },
  /* THREE FIXTURES, THREE STATES OF THE FIELD, and they must stay
     apart: both clubs held and above the floor; both held with one
     REFUSED by the placeability floor; and one club the field does not
     hold at all. Folding the last two into one row is what hid the
     dagger behind the fallback the first time this was written. */
  rows: [row(1, "Barcelona", "Feyenoord"),
         row(2, "Kairat Almaty", "Feyenoord"),
         row(3, "Barcelona", UNHELD)],
  refusals: [], off_board: [], off_board_counts: {}, folded: {},
  narrowed_to: ["ucl"],
};

const review = { finished: [], refusals: [], leagues: {}, store: null };

/** `ratings` is what the field endpoint answers with; pass a status to
 *  make the read FAIL instead, and `rows` to serve a board with
 *  something other than the three fixtures above on it. */
async function openBoard(page: import("@playwright/test").Page,
                         ratings: unknown = RATINGS, status = 200,
                         rows: unknown[] = BOARD.rows) {
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json({ ...BOARD, rows })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json(status === 200 ? ratings : { detail: "field unavailable" },
                   status)));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("picker-row").first()).toBeAttached();
}

const card = (page: import("@playwright/test").Page, event: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${event}"]`);

// ────────────────────── 0. the fixture speaks the backend's language ─
//
// THE HALF THE CORRECTION ABOVE DID NOT CLOSE. `bands: 3` stood on
// attack and defence for four days after the operator declared five;
// the cuts ran ascending where the wire runs best-first; defence was
// inverted against its own feed; `tier` was `tier_set[0]`, which the
// trio test names in its own words as the thing the card must not
// draw. Every one of those was corrected by reading the live payload —
// and NOT ONE of them was found by this suite, because every test here
// reads its expectation off `AXES`, which makes `AXES` being wrong the
// one failure none of them can see. The fixture is right today and
// nothing here would notice the day it stops being.
//
// So the rules are asserted, and they are THE EMITTER'S rather than
// this file's opinion: src/picker/cross_league_axes.py's
// `equal_width_cuts` (bands - 1 cuts, equal-width over the span, BEST
// FIRST), `tier_of` (1 = best; a value ON a cut takes the better
// tier), `tier_set_of` (every band the 95% interval touches),
// `supported_bands` (int(levels) + 1, floor 2), and the descending
// sort that assigns the ranks. A fixture that disagrees with any of
// them describes a payload the backend cannot emit.
//
// AN INTERVAL MAY REACH PAST THE SPAN AND A VALUE MAY NOT, which is
// the block above's own sentence: the span IS the field's range of
// values, so a value outside it is a fixture claiming a field that
// does not contain its own clubs.

const tierOf = (v: number, cuts: number[]) => {
  for (let i = 0; i < cuts.length; i++) if (v >= cuts[i]) return i + 1;
  return cuts.length + 1;
};
const tierSetOf = (lo: number, hi: number, cuts: number[]) => {
  const out: number[] = [];
  for (let i = tierOf(hi, cuts); i <= tierOf(lo, cuts); i++) out.push(i);
  return out;
};
const equalWidthCuts = (lo: number, hi: number, bands: number) => {
  const w = (hi - lo) / bands;
  return Array.from({ length: bands - 1 }, (_, k) => hi - w * (k + 1));
};

test("the fixture is a payload the backend could actually emit",
  async () => {
    expect(AXIS_KEYS.length).toBeGreaterThan(0);
    for (const k of AXIS_KEYS) {
      const a = AXES[k];
      const where = `axis ${k}`;
      // THE CUT GEOMETRY *IS* THE BAND COUNT. Declaring one without
      // recutting the other is the contradiction that stood here, and
      // it is a single subtraction to catch.
      expect(a.cuts.length, `${where}: cuts for ${a.bands} bands`)
        .toBe(a.bands - 1);
      expect(a.bands_declared, `${where}: bands vs bands_declared`)
        .toBe(a.bands);
      const want = equalWidthCuts(a.span[0], a.span[1], a.bands);
      a.cuts.forEach((c, i) => expect(c, `${where}: cut ${i}, best first`)
        .toBeCloseTo(want[i], 6));
      // the declaration beside the measurement, and the note that
      // rides the flag the way `floor_note` rides `below_floor`
      expect(a.bands_licensed_by_the_measurement, `${where}: licence`)
        .toBe(Math.max(Math.trunc(a.distinguishable_levels) + 1, 2));
      expect(a.declared_above_licence, `${where}: above-licence flag`)
        .toBe(a.bands_declared > a.bands_licensed_by_the_measurement);
      expect(a.band_count_note !== null, `${where}: note rides the flag`)
        .toBe(a.declared_above_licence);
      let straddling = 0;
      let placed = 0;
      for (const r of a.rows) {
        const seat = `${where}/${r.club}`;
        expect(r.interval, `${seat}: interval`)
          .toEqual([r.value - r.half_width_95, r.value + r.half_width_95]);
        const set = tierSetOf(r.interval[0], r.interval[1], a.cuts);
        expect(r.tier_set, `${seat}: tier_set`).toEqual(set);
        // THE POINT TIER, NOT THE SET'S FIRST MEMBER
        expect(r.tier, `${seat}: point tier`).toBe(tierOf(r.value, a.cuts));
        expect(r.tier_set, `${seat}: point tier is in the set`)
          .toContain(r.tier);
        expect(r.straddles, `${seat}: straddles`).toBe(set.length > 1);
        expect(Boolean(r.floor_note), `${seat}: floor note rides the flag`)
          .toBe(r.below_floor);
        // a value outside the span is a field that does not contain
        // its own clubs; an INTERVAL past either end is ordinary
        expect(r.value, `${seat}: value inside the span`)
          .toBeGreaterThanOrEqual(Math.min(...a.span));
        expect(r.value, `${seat}: value inside the span`)
          .toBeLessThanOrEqual(Math.max(...a.span));
        straddling += set.length > 1 ? 1 : 0;
        placed += set.length === 1 ? 1 : 0;
      }
      expect(a.straddling, `${where}: straddling count`).toBe(straddling);
      expect(a.placed, `${where}: placed count`).toBe(placed);
      // the backend sorts DESCENDING by value on every axis, defence
      // included — `value` there is defensive strength and `rate` is
      // the goals conceded that produce it
      const byRank = [...a.rows].sort((x, y) => x.rank - y.rank)
        .map((r) => r.value);
      expect(byRank, `${where}: ranks descend by value`)
        .toEqual([...byRank].sort((x, y) => y - x));
    }
  });

// ─────────────────────────────────────── 1. the ranks are the FIELD'S ─

test("the ranks pair is read on the FIELD's ladder, of N — not on two "
   + "domestic tables", async ({ page }) => {
    /* THE COMPLAINT THIS ANSWERS, in the operator's own arithmetic:
       "#7 v #33 = rank of 36". The board served `ranks: {fav: 1, opp: 4}`
       for this fixture — Barcelona's place in La Liga and Feyenoord's in
       the Eredivisie, two positions in two tables of different lengths,
       printed as though they were one comparison. The field is a single
       ladder both clubs stand on, so its ranks are the ones drawn.
       READ OFF THE FIXTURE, never typed beside it. */
    await openBoard(page);
    const c = card(page, "ucl-1");
    const r = BOARD.rows[0];
    const fav = AXES.ovr.rows.find((x) => x.club === r.favourite)!;
    const opp = AXES.ovr.rows.find((x) => x.club === r.opponent)!;
    const pairEl = c.getByTestId("rank-pair");
    await expect(pairEl).toHaveText(`#${fav.rank} v #${opp.rank}`);
    await expect(pairEl).toHaveAttribute("data-basis", "field");
    await expect(pairEl).toHaveAttribute("data-of",
                                         String(AXES.ovr.rows.length));
    // and it is emphatically NOT the league pair the payload also carries
    await expect(pairEl).not.toHaveText(`#${r.ranks.fav} v #${r.ranks.opp}`);
    // the card says which ladder it read, for a guard and for a reader
    await expect(c).toHaveAttribute("data-field", RATINGS.competition);
  });

test("a card with no field keeps its LEAGUE ranks and says so — the "
   + "control", async ({ page }) => {
    await openBoard(page, { competition: "ucl", axes: null,
                            why_not: "nobody has measured it" });
    const c = card(page, "ucl-1");
    const r = BOARD.rows[0];
    await expect(c.getByTestId("rank-pair"))
      .toHaveText(`#${r.ranks.fav} v #${r.ranks.opp}`);
    await expect(c.getByTestId("rank-pair"))
      .toHaveAttribute("data-basis", "league");
    // and it does not claim a ladder it was not read on
    expect(await c.getAttribute("data-field")).toBeNull();
  });

// ─────────────────────────── 2. the dumbbell's refusal, kept and named ─

test("the rank dumbbell draws on the FIELD's 1..N axis — the instrument "
   + "a cross-league tie could never have", async ({ page }) => {
    /* `RankDumbbell` opened `if (row.cross_league) return null`, because
       a cross-league tie has no shared axis and so gets no instrument.
       Every UCL league-phase fixture is cross-league — UEFA's draw
       forbids two clubs of one association from meeting — so as written
       it drew nothing on this whole board. The refusal was never about
       the word "cross-league": it was about there being no shared
       ladder, and a measured field IS one. */
    await openBoard(page);
    const d = card(page, "ucl-1").getByTestId("rank-dumbbell");
    await expect(d).toHaveCount(1);
    await expect(d).toHaveAttribute("data-basis", "field");
    await expect(d).toHaveAttribute("data-of", String(AXES.ovr.rows.length));
    // the instrument and the number beside it read the same ladder, so
    // they can never come from different tables
    const pairEl = card(page, "ucl-1").getByTestId("rank-pair");
    expect(await d.getAttribute("data-of"))
      .toBe(await pairEl.getAttribute("data-of"));
  });

test("and it STILL refuses a cross-league row with no field — the "
   + "judgement that was kept, not deleted", async ({ page }) => {
    await openBoard(page, { competition: "ucl", axes: null,
                            why_not: "nobody has measured it" });
    for (const ev of BOARD.rows.map((r) => r.event_id)) {
      await expect(card(page, ev).getByTestId("rank-dumbbell")).toHaveCount(0);
    }
  });

// ─────────────────────────────────────────────── 3. a tier is a SET ──

test("the trio draws ONE number per side — the point tier, with the set "
   + "kept as data and marked when it is wide", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-1");
    /* THE COUNT IS DERIVED: three axes, and a card that quietly stopped
       drawing one of them would otherwise pass every text assertion
       below. */
    const cells = c.locator("[data-tier]");
    await expect(cells).toHaveCount(AXIS_KEYS.length);
    const drawn = await cells.evaluateAll((els) => els.map((e) => ({
      axis: e.getAttribute("data-tier"),
      fav: e.getAttribute("data-fav-set"),
      opp: e.getAttribute("data-opp-set"),
      /* THE PAIR, NOT THE WHOLE CELL (2026-09-16). The cell also
         holds the figures the tier was read off now, so a whole-cell
         read would return "ovr1v32080±401900±45" and this assertion
         would be about the card's layout rather than about the trio
         drawing one number per side. */
      text: (e.querySelector("[data-tier-pair]")?.textContent || "")
        .replace(/†/g, "").trim(),
    })));
    /* ONE NUMBER, AND IT IS THE POINT TIER — not the set joined, and
       not the set's first member either. The operator rejected the
       joined form outright ("why ovr has 2.3.4 for sabah and not one
       concrete number?"), and the first-member shortcut is the `OVR
       1v1` defect, so this pins the ONLY remaining correct answer: the
       band the estimate actually falls in.
       THE SET IS NOT DISCARDED, IT IS DEMOTED TO DATA. `data-fav-set`
       and `data-opp-set` still carry it, so a reader — or this test —
       can still see what the interval touched, and the mark below says
       when that matters. */
    for (const t of drawn) {
      const row = FIELD_ROW(t.axis!);
      expect(t.text).toBe(`${row.fav.tier}v${row.opp.tier}`);
      // the set survives as an attribute, whole
      expect((t.fav || "").split(",")).toEqual(row.fav.tier_set.map(String));
      expect((t.opp || "").split(",")).toEqual(row.opp.tier_set.map(String));
    }
  });

test("a wide interval is MARKED, so one number never reads as a placement "
   + "the evidence refused", async ({ page }) => {
    /* The point tier alone would assert a band on the def axis 34 times
       out of 36 — the payload's own note there reads "every one of the
       36 straddles a cut, so the set is the read". The mark is what
       keeps the number honest: "if the +- is too big, put a subtle mark
       there and I will know" (operator). */
    await openBoard(page);
    const c = card(page, "ucl-1");
    /* `toHaveCount`, NOT `await locator.count()`. `count()` reports
       whatever is attached the instant it runs and does not retry, so a
       marks-not-drawn-yet read is indistinguishable from a
       marks-not-drawn one. Written with `count()` this passed here every
       time and failed in CI on the ovr cell, expected 1 received 0 — the
       repo's own auto-wait trap, and the reason a value assertion on
       this surface has to go through `expect`. */
    for (const axis of AXIS_KEYS) {
      const row = FIELD_ROW(axis);
      const owed = Number(row.fav.straddles || row.fav.below_floor)
                 + Number(row.opp.straddles || row.opp.below_floor);
      await expect(c.locator(`[data-tier="${axis}"]`)
        .getByTestId("field-floor-mark"),
        `${axis}: one mark per side whose band is not settled`)
        .toHaveCount(owed);
    }
  });

test("a set of ONE is still drawn as the set, not as a stronger claim",
  async ({ page }) => {
    /* The control for the test above. Barcelona is a single band on the
       overall axis; if a "collapse a one-member set to a number"
       shortcut ever appears it looks correct there and wrong nowhere
       else. */
    await openBoard(page);
    const ovr = card(page, "ucl-1").locator('[data-tier="ovr"]');
    const r = BOARD.rows[0];
    const fav = AXES.ovr.rows.find((x) => x.club === r.favourite)!;
    expect(fav.tier_set.length).toBe(1);
    await expect(ovr).toHaveAttribute("data-fav-set", String(fav.tier_set[0]));
    await expect(ovr).toContainText(`${fav.tier_set[0]}v`);
  });

test("a card with no field keeps the LEAGUE quintile pair — the control",
  async ({ page }) => {
    await openBoard(page, { competition: "ucl", axes: null, why_not: "x" });
    const c = card(page, "ucl-1");
    const t = BOARD.rows[0].tiers;
    await expect(c.locator('[data-tier="ovr"]'))
      .toHaveText(`ovr${t.ovr[0]}v${t.ovr[1]}`);
    // and it carries no field sets at all rather than empty ones
    expect(await c.locator('[data-tier="ovr"]').getAttribute("data-fav-set"))
      .toBeNull();
  });

// ─────────────────────── 4. the shape, and who is allowed to say it ──

test("the CLEAN / SPLIT / HOLLOW chip is on every card, and it is the "
   + "BACKEND's word", async ({ page }) => {
    /* The operator noticed this chip missing from a draft and asked for
       it back by name. It is also the one read on this card the frontend
       may never compute: `field.shape` when the board's own block
       carries one, the row's own shape until then — never a verdict
       reached here. */
    await openBoard(page);
    for (const r of BOARD.rows) {
      const chip = card(page, r.event_id).getByTestId("shape-chip");
      await expect(chip).toBeVisible();
      await expect(chip).toHaveText(r.shape);
    }
  });

test("when the board serves its OWN field block, that block wins — and "
   + "its shape is drawn without being recomputed", async ({ page }) => {
    /* THE CONTRACT WITH THE BACKEND. `row.field` is the block the board
       itself will serve; the ratings endpoint is the same numbers under
       a different roof. When both are present the row's own block is the
       one drawn, so the day the backend ships it nothing in the frontend
       changes — and its `shape` is drawn even when it CONTRADICTS the
       row's, which is the only way to prove nothing here is deciding. */
    const block = {
      competition: "ucl", size: 36, shape: "CLEAN",
      axes: Object.fromEntries(AXIS_KEYS.map((k) => [k, {
        fav: { rank: 7, tier: 1, tier_set: [1], straddles: false,
               below_floor: false, floor_note: null },
        opp: { rank: 33, tier: 4, tier_set: [4], straddles: false,
               below_floor: false, floor_note: null },
        tier_gap: 3,
      }])),
    };
    const board = { ...BOARD,
      rows: [{ ...BOARD.rows[0], shape: "HOLLOW", field: block },
             BOARD.rows[1]] };
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
    await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(RATINGS)));
    await page.goto("/bet-suggester/ucl");
    const c = card(page, "ucl-1");
    await expect(c.getByTestId("rank-pair")).toHaveText("#7 v #33");
    // the block's shape, not the row's, and not the ratings join's
    await expect(c.getByTestId("shape-chip")).toHaveText("CLEAN");
    await expect(c.locator('[data-tier="ovr"]')).toHaveText("ovr1v4");
  });

// ───────────────────────────── 5. the eleven, marked subtly ──────────

test("the mark says THE BAND IS NOT SETTLED — a refused league keeps its "
   + "own reason, a straddle gets the plain one, a settled side gets "
   + "neither", async ({ page }) => {
    /* WHAT THIS MARK MEANS WIDENED WITH THE TRIO (2026-09-10). While the
       trio drew the whole set, the set WAS the caveat and this mark
       carried only the placeability floor. The trio now draws one
       number, so the mark is the only thing left saying when that
       number is not a placement the evidence will stand behind:
       "if the +- is too big, put a subtle mark there and I will know."
       Below-floor still gets the backend's own sentence; a straddle
       gets a plain one naming the bands its interval touched. */
    await openBoard(page);

    // Kairat Almaty is below the floor on every axis, and its reason is
    // the backend's, not one written here.
    const c2 = card(page, "ucl-2");
    const marks2 = c2.getByTestId("field-floor-mark");
    await expect(marks2.first()).toBeVisible();
    await expect(marks2.first()).toHaveAttribute("title", FLOOR_NOTE);
    // a mark, not an alert: one glyph, no colour of its own
    await expect(marks2.first()).toHaveText("†");

    /* THE COUNT IS DERIVED FROM THE FIXTURE, not typed: one per side
       whose band is unsettled, on each axis. A card that started
       marking everyone, or stopped marking anyone, fails here. */
    const owed = (fav: string, opp: string) => AXIS_KEYS.reduce((n, a) => {
      const r = FIELD_ROW(a, fav, opp);
      return n + Number(r.fav.straddles || r.fav.below_floor)
               + Number(r.opp.straddles || r.opp.below_floor);
    }, 0);
    await expect(marks2).toHaveCount(owed("Kairat Almaty", "Feyenoord"));

    const c1 = card(page, "ucl-1");
    await expect(c1.getByTestId("field-floor-mark"))
      .toHaveCount(owed("Barcelona", "Feyenoord"));

    /* THE CONTROL, and it has to be a SIDE rather than a card now.
       Barcelona is a single band above the floor on the overall axis —
       settled by both tests — so that side may carry no mark at all,
       while Feyenoord beside it straddles and must. One cell, both
       answers: this is what stops "mark it when unsure" degrading into
       "mark everything". */
    const ovr = FIELD_ROW("ovr");
    expect(ovr.fav.tier_set.length, "fixture: Barcelona is one band").toBe(1);
    expect(ovr.fav.below_floor).toBeFalsy();
    expect(ovr.opp.tier_set.length, "fixture: Feyenoord straddles")
      .toBeGreaterThan(1);
    await expect(c1.locator('[data-tier="ovr"]')
      .getByTestId("field-floor-mark")).toHaveCount(1);
  });

// ─────────────────────────────────── 6. THE ONE ADDITION: the `i` ────

test("an `i` beside the trio opens the field's three RANK pairs — and "
   + "holds nothing else", async ({ page }) => {
    /* "make sure to use the exact design, only with new 'i' added."
       So this panel says the one thing the trio cannot: the same three
       axes, as ranks. No club names — they are the largest type on the
       card, six lines above. No heading, no caption. No daggers: the
       trio carries those, beside the bands they qualify. */
    await openBoard(page);
    const c = card(page, "ucl-1");
    const r = BOARD.rows[0];
    await c.getByTestId("field-ranks-open").click();
    const panel = c.getByTestId("field-ranks");
    await expect(panel).toBeVisible();

    const rows = await panel.locator("[data-rank-axis]")
      .evaluateAll((els) => els.map((e) => ({
        axis: e.getAttribute("data-rank-axis"),
        text: (e.textContent || "").replace(/\s+/g, " ").trim(),
      })));
    expect(rows.map((x) => x.axis)).toEqual([...AXIS_KEYS]);
    for (const x of rows) {
      const ax = AXES[x.axis as keyof typeof AXES];
      const fav = ax.rows.find((y) => y.club === r.favourite)!;
      const opp = ax.rows.find((y) => y.club === r.opponent)!;
      /* THE LABEL AND THE PAIR ARE TWO STACKED SPANS, so textContent
         runs them together; the shape asserted is the axis's own name
         over its own two ranks, read off the fixture. */
      expect(x.text).toBe(`${x.axis}#${fav.rank}v#${opp.rank}`);
    }
    // ONLY that. No club name, no dagger, no heading anywhere inside.
    const inside = (await panel.textContent()) || "";
    expect(inside).not.toContain(r.favourite);
    expect(inside).not.toContain(r.opponent);
    expect(inside).not.toContain("†");
    await expect(panel.getByTestId("field-floor-mark")).toHaveCount(0);
  });

test("it opens on hover and on keyboard focus as well as on click — the "
   + "two openings a pointer does not provide", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-1");
    const trigger = c.getByTestId("field-ranks-open");
    await expect(c.getByTestId("field-ranks")).toHaveCount(0);
    await trigger.hover();
    await expect(c.getByTestId("field-ranks")).toBeVisible();
    // away again, and it closes: an unpinned panel follows the pointer
    await c.getByTestId("row-anchor").hover();
    await expect(c.getByTestId("field-ranks")).toHaveCount(0);
    // there is no hover on a phone and none from a keyboard
    await trigger.focus();
    await expect(c.getByTestId("field-ranks")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

test("a click PINS it, and Escape or a click outside closes it",
  async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-1");
    const trigger = c.getByTestId("field-ranks-open");
    await trigger.click();
    // pinned: the pointer moving away no longer closes it
    await c.getByTestId("row-anchor").hover();
    await expect(c.getByTestId("field-ranks")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(c.getByTestId("field-ranks")).toHaveCount(0);
    // and a click anywhere outside closes it too
    await trigger.click();
    await expect(c.getByTestId("field-ranks")).toBeVisible();
    await page.getByTestId("league-col").first().click({ position: { x: 4, y: 4 } });
    await expect(c.getByTestId("field-ranks")).toHaveCount(0);
  });

test("the panel opens on the card's RIGHT-HAND SIDE, clear of the numbers "
   + "it reads and clear of its own trigger, at every width",
  async ({ page }) => {
    /* THE PLACEMENT THE OPERATOR ASKED FOR, 2026-09-10: "the hover
       ranking must display on the right hand".
       WHAT IT REPLACES, measured before it moved: anchored `left-0
       top-0` on the trio, the panel was drawn ACROSS the three tier
       cells it is a second reading of — and across its own trigger.
       At 390px it spanned 143→279 with the circle at 245→260
       underneath it; at 1024px, 33→169 with the circle at 135→150.
       `z-30` on the circle kept the click working, which is why that
       shipped, and is not a reason to draw a panel over the numbers.
       THIS TEST WAS THE ALIGNMENT ONE. It asserted that the panel's
       label row landed on the trio's label row, to one device pixel —
       a real virtue of hanging the panel on the trio, and the price of
       opening on the right. It is replaced rather than loosened: the
       property that survives is the one that was always load-bearing —
       the trigger stays clickable — and it is now asserted at every step
       of the ladder rather than at one width, because "on the right
       hand" is a claim about all of them.
       WHY THE WHOLE LADDER. `right-0` here means the TIER BLOCK's right
       edge, which is one card-content wide; the card is 237px at lg and
       350px on a phone, and the panel is a fixed ~136px. Only a
       measurement can tell those apart. */
    await openBoard(page);
    const c = card(page, "ucl-1");

    /* A LAYOUT READ MUST WAIT FOR THE LAYOUT. `evaluate` reads the DOM
       as it stands and a viewport resize is not synchronous with
       reflow, so a read taken straight after one can faithfully
       describe the PREVIOUS width. Settled means two consecutive reads
       agree — the rule cardBoxes uses in picker-ucl-column.spec.ts. */
    const read = () => c.evaluate((el) => {
      const panel = el.querySelector('[data-testid="field-ranks"]')!;
      const trigger = el.querySelector('[data-testid="field-ranks-open"]')!;
      const box = (n: Element) => n.getBoundingClientRect();
      const t = box(trigger), p = box(panel), cs = getComputedStyle(el);
      const cr = box(el);
      /* WHAT THE POINTER WOULD ACTUALLY HIT at the circle's centre.
         The geometry that matters is not clearance in the abstract —
         it is whether the CLICK still lands on the thing that closes
         the panel. */
      const hit = document.elementFromPoint(t.left + t.width / 2,
                                            t.top + t.height / 2);
      return {
        // the card's CONTENT box: the panel is inside the padding, not
        // merely inside the border
        content: [cr.left + parseFloat(cs.borderLeftWidth)
                    + parseFloat(cs.paddingLeft),
                  cr.right - parseFloat(cs.borderRightWidth)
                    - parseFloat(cs.paddingRight)],
        panel: [p.left, p.right, p.top, p.bottom],
        trigger: [t.left, t.right, t.top, t.bottom],
        hitIsTrigger: trigger === hit || trigger.contains(hit),
      };
    });
    const settled = async () => {
      let prev = await read();
      for (let i = 0; i < 25; i++) {
        const next = await read();
        if (JSON.stringify(next) === JSON.stringify(prev)) return next;
        prev = next;
      }
      throw new Error("the panel never stopped moving");
    };

    for (const width of [390, 820, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await c.getByTestId("field-ranks-open").click();
      await expect(c.getByTestId("field-ranks")).toBeVisible();
      const g = await settled();
      const at = `at ${width}px`;

      // ON THE RIGHT-HAND SIDE: the panel's right edge IS the card's
      // content edge. Said as an equality, not as "inside the card" —
      // a panel that drifted back over the trio would still be inside.
      expect(g.panel[1], `${at}: the panel is right-aligned to the card`)
        .toBeCloseTo(g.content[1], 0);
      /* AND IT NEVER LEAVES THE CARD ON THE OTHER SIDE. `html {
         overflow-x: clip }` (globals.css) means an overhang is CLIPPED
         rather than scrolled to, so a reader would never learn the
         panel had been cut off. */
      expect(g.panel[0], `${at}: the panel starts inside the card`)
        .toBeGreaterThanOrEqual(g.content[0] - 0.5);
      // still readable: a panel squeezed to nothing is its own defect
      expect(g.panel[1] - g.panel[0], `${at}: the panel is readable`)
        .toBeGreaterThan(120);
      /* CLEAR OF ITS OWN TRIGGER — the 2026-09-07 property, kept in a
         stronger form. The panel starts BELOW the whole tier block, so
         nothing that is in that block can be inside it, however the
         `flex-wrap` row breaks at this width. */
      expect(g.panel[2], `${at}: the panel opens below its trigger`)
        .toBeGreaterThanOrEqual(g.trigger[3]);
      expect(g.hitIsTrigger, `${at}: the trigger is still under the pointer`)
        .toBe(true);
      // and the round trip really works: a second click closes it
      await c.getByTestId("field-ranks-open").click();
      await expect(c.getByTestId("field-ranks")).toHaveCount(0);
    }
  });

test("no field, no `i` — the affordance is never an empty promise",
  async ({ page }) => {
    await openBoard(page, { competition: "ucl", axes: null, why_not: "x" });
    await expect(page.getByTestId("field-ranks-open")).toHaveCount(0);
  });

// ─────────────────────────── 7. one fact, in the header, once ────────

test("how to read a tier set is said ONCE for the whole column, and on no "
   + "card at all", async ({ page }) => {
    await openBoard(page);
    // it is behind the header's `i`, which has to be opened
    await expect(page.getByTestId("field-note")).toHaveCount(0);
    await page.getByTestId("col-notes-open").click();
    const note = page.getByTestId("field-note");
    await expect(note).toHaveCount(1);
    await expect(note).toContainText(/a tier is a set/i);
    // and it describes the marks the card actually draws
    await expect(note).toContainText(/ranks pair and the dumbbell/i);
    await expect(note).toContainText(`1–${AXES.ovr.rows.length}`);
    await expect(note).toContainText(/circled i opens/i);
    // the dagger's meaning travels with it, in the backend's own words
    await expect(note).toContainText(RATINGS.below_floor_note.slice(0, 60));
    // and NOT on the cards: eighteen copies of this is the ink the
    // operator's rule exists to remove
    for (const ev of BOARD.rows.map((r) => r.event_id)) {
      await expect(card(page, ev).getByTestId("field-note")).toHaveCount(0);
    }
  });

test("the circle's accessible name lists every section behind it, and the "
   + "markup handle agrees with what is drawn", async ({ page }) => {
    /* THE AFFORDANCE MUST NOT BE AN EMPTY PROMISE, and it must not be a
       partial one either: a reader who opens it for the field note has
       to have been told the field note is in there. Name, handle and
       panel are all derived from ONE list, so this asserts they agree
       rather than asserting three separately-maintained strings. */
    await openBoard(page);
    const trigger = page.getByTestId("col-notes-open");
    await expect(trigger).toHaveAttribute("data-notes", "gap+field");
    await expect(trigger).toHaveAccessibleName(
      "why this column withholds gaps, and how to read the field on each card");
    await trigger.click();
    // the handle names exactly the sections the panel drew
    const drawn = await page.getByTestId("col-notes")
      .locator("[data-testid$='-note']")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
    expect(drawn).toEqual(["gap-note", "field-note"]);
  });

test("the straddle counts in that note are the PAYLOAD's, not numbers "
   + "typed into the frontend", async ({ page }) => {
    /* A count frozen in the component would go on asserting the old fit
       forever after a refit — the hand-typed-subset defect wearing a
       different hat. Proved by serving a field whose counts differ from
       the fixture above and reading the note back. */
    const bumped = {
      ...RATINGS,
      axes: { ...AXES, atk: { ...AXES.atk, straddling: 33 } },
    };
    await openBoard(page, bumped);
    await page.getByTestId("col-notes-open").click();
    const note = page.getByTestId("field-note");
    await expect(note).toContainText(`attack 33 of ${AXES.atk.rows.length}`);
    await expect(note)
      .toContainText(`defence ${AXES.def.straddling} of ${AXES.def.rows.length}`);
  });

// ─────────────────── 8. missing is never zero, in both its shapes ────

test("a FAILED field read is named — once, for the column — and no card "
   + "claims a field at all", async ({ page }) => {
    await openBoard(page, null, 503);
    // not one card pretends to a reading
    await expect(page.locator("[data-testid='picker-row'][data-field]"))
      .toHaveCount(0);
    await expect(page.getByTestId("field-ranks-open")).toHaveCount(0);
    /* AND THE COLUMN SAYS WHY, IN THE BACKEND'S OWN WORDS. A named
       failure tells the reader something "could not load" does not, so
       the `detail` the server sent is carried through rather than
       replaced by the status code — the same contract `fetchBoard`
       keeps. */
    await page.getByTestId("col-notes-open").click();
    const err = page.getByTestId("field-error-note");
    await expect(err).toHaveCount(1);
    await expect(err).toContainText("field unavailable");
    /* AND IT DOES NOT ALSO EXPLAIN HOW TO READ SOMETHING NO CARD DID.
       The two notes are opposite facts and must never both be shown:
       instructions for a missing read tell the reader to look for it. */
    await expect(page.getByTestId("field-note")).toHaveCount(0);
  });

test("a healthy read draws no failure note — the control", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("col-notes-open").click();
    await expect(page.getByTestId("field-error-note")).toHaveCount(0);
    /* EVERY ROW WHOSE CLUBS THE FIELD HOLDS, and only those: the third
       fixture names a club it does not hold, so a count of `rows.length`
       here would pass only while that fallback was broken. Derived from
       the fixture, never typed. */
    await expect(page.locator("[data-testid='picker-row'][data-field]"))
      .toHaveCount(BOARD.rows.filter(
        (r) => ![r.favourite, r.opponent].includes(UNHELD)).length);
  });

test("a club the field does not hold leaves its card on the LEAGUE read "
   + "whole, never half a pair", async ({ page }) => {
    /* Half a rank pair — the one club the field holds, beside a blank —
       invites the reader to supply the other half, which is the same
       defect as drawing half a crossed leg. So the card falls back
       entire: league ranks, league tiers, no `i`, and no claim to a
       ladder it could not be read on. `rated-in` on the card already
       names the two tables those numbers came from. */
    await openBoard(page);
    const c = card(page, "ucl-3");
    const r = BOARD.rows[2];
    expect(await c.getAttribute("data-field")).toBeNull();
    await expect(c.getByTestId("rank-pair"))
      .toHaveAttribute("data-basis", "league");
    await expect(c.getByTestId("rank-pair"))
      .toHaveText(`#${r.ranks.fav} v #${r.ranks.opp}`);
    await expect(c.getByTestId("field-ranks-open")).toHaveCount(0);
    // and the two tables it WAS read on are named, as they always were
    await expect(c.getByTestId("rated-in")).toBeVisible();
  });

test("a competition with no field measured draws no failure and keeps "
   + "every row", async ({ page }) => {
    /* The third state, and the one that must not be folded into either
       of the other two: the read LANDED and there is no field. */
    await openBoard(page, { competition: "ucl", display: "UEFA Champions League",
                            axes: null, why_not: "nobody has measured it" });
    await expect(page.locator("[data-testid='picker-row'][data-field]"))
      .toHaveCount(0);
    await expect(page.getByTestId("picker-row"))
      .toHaveCount(BOARD.rows.length);
    const opener = page.getByTestId("col-notes-open");
    if (await opener.count() > 0) {
      await opener.click();
      await expect(page.getByTestId("field-note")).toHaveCount(0);
      await expect(page.getByTestId("field-error-note")).toHaveCount(0);
    }
  });

// ───────────────── 9. ONE CARD COMPONENT, TWO PAGES ──────────────────

test("the Champions League card is the board's own card — every element "
   + "the landing card draws is on it", async ({ page }) => {
    /* "REUSE the landing page's own card component." The page renders
       PickerBoard with its column set narrowed to one, so this is the
       same `RowCard` the four league columns draw and there is no UCL
       variant to drift from it. Asserted as the ELEMENT SET rather than
       as an import, because an import is not what a reader sees: if a
       fork ever appears, this is the test that finds the mark it
       dropped. The operator has already caught one — the shape chip. */
    await openBoard(page);
    const c = card(page, "ucl-1");
    for (const id of ["row-rank", "row-anchor", "anchor-key", "rank-pair",
                      "rank-dumbbell", "form-strip", "tier-cell",
                      "shape-chip", "watch-toggle"]) {
      await expect(c.getByTestId(id).first(),
                   `${id} is missing from the UCL card`).toBeAttached();
    }
    /* `tier-read` IS THE ONE ELEMENT DELIBERATELY NOT HERE, and it is
       the exception that has to be stated rather than quietly dropped
       from the list above. The operator: "keep the #, remove the i
       since it is repetitive and outdated data formatting."
       On THIS card the `#` already opens the same three axes as ranks,
       so the `i` is a second identical circle beside it, and its panel
       reads the within-league gaps — the reading the field replaced.
       Neither is true on a league column, where there is no `#` and the
       tiers really are quintiles, so it stays there. The pair of
       assertions below is the whole rule: absent where a field is read,
       present where one is not. */
    await expect(c.getByTestId("tier-read"),
                 "the field card must not carry a second circle")
      .toHaveCount(0);
    // the two club lines, the three tier cells, the three trio cells
    await expect(c.getByTestId("form-strip")).toHaveCount(2);
    await expect(c.getByTestId("tier-cell")).toHaveCount(3);
    await expect(c.locator("[data-tier]")).toHaveCount(3);
    // the Kalshi line — this fixture has no event, which is one of its
    // three named states and never a blank
    await expect(c).toContainText("no kalshi event");
  });

test("and a card with NO field keeps the `i` — the landing board is not "
   + "changed by any of this", async ({ page }) => {
    /* THE OTHER HALF OF THE RULE, and the one that protects the surface
       the operator ring-fenced: "only with new 'i' added. Consistency
       is key." A league column reads no field, so it draws no `#`, and
       the shape explainer is neither repetitive nor stale there. If the
       removal above ever widens to every card, this is what fails. */
    await openBoard(page, { competition: "ucl", axes: null, why_not: "x" });
    const c = card(page, "ucl-1");
    await expect(c.getByTestId("tier-read").first()).toBeAttached();
    await expect(c.getByTestId("field-ranks-open")).toHaveCount(0);
  });

// ───────────────────────── 10. the field's own page ──────────────────


/* RETIRED 2026-09-23, AND MOVED RATHER THAN DROPPED. Five tests stood
   here for the field's own page when that page WAS `FieldAxes` over
   `/api/comp/{key}/ratings`: it opened on the ranked field, it carried
   the charter, a failed read was named, a wordless failure still said
   its status, and an unmeasured competition said so in the backend's
   words. The page was rebuilt to the operator's approved design and now
   reads `/api/field/leagues` and `/api/field/cups`, so these five mocked
   a route the page no longer asks for — they would have gone on
   passing or failing about nothing.

   Where each claim lives now:
     opens on the ranked field     e2e/the-field-page.spec.ts ("the page
                                   opens on the league field …")
     the charter + no directive    e2e/the-field-page.spec.ts ("no decide
       vocabulary                  vocabulary on either view …")
     a failed read is named        e2e/the-field-page.spec.ts ("a failed
     a wordless failure's status   read is NAMED …" and "…and a failure
                                   with nothing to say …")
     an unmeasured competition     e2e/field-axes.spec.ts ("a competition
                                   with no measured field says so …") —
                                   `FieldAxes` still draws that state, on
                                   the competition viewer, and the new
                                   page has no per-competition query that
                                   could reach it. */

// ───────────────────────────── 7. reachable from the upper left ──────

test("the link to it sits in the TOP-LEFT of every page that carries the "
   + "nav", async ({ page }) => {
    /* "put in on the left upper side of the web ... anytime i need."
       The set of pages is not typed here as three or four favourites: it
       is every route in the app that renders the top bar, walked. */
    // The landing board is the one route here that would otherwise be a
    // live board assembly — which WRITES a pre-kickoff snapshot upstream
    // (e2e/board-holdout.mjs). This test is about the nav bar, so the
    // board under it is served from the recording.
    //
    // AND SO IS EVERY OTHER READ ON THESE TEN ROUTES (2026-09-22). The
    // sentence above was right and stopped one route short of its own
    // reasoning. The other nine each fetch their own live data through
    // the proxy, none of which this test reads: on run 35793175865 the
    // walk reached `/bet-suggester/bots` with its 90s budget already
    // spent on the routes before it, died inside `page.goto`, and
    // reported THE NAV LINK as missing from a page it never rendered.
    //
    // THE CLAIM IS NOT WEAKENED BY THIS, because the claim was never
    // about data. `FieldLink` sits in `TopBar` (src/components/chrome),
    // it is server-rendered chrome, and it takes no props from any
    // payload — so a page that renders its header only when a read
    // succeeds is still caught here, by the same `toHaveCount(1)` that
    // has always been the assertion. What is removed is ten routes'
    // worth of unmocked backend work that this test performs and does
    // not measure, on the single Railway instance the whole suite
    // shares.
    //
    // REGISTERED BEFORE `routeEight`, because Playwright prefers the
    // handler registered LATER: the board and the review keep their
    // recordings, and everything else is answered here.
    await page.route("**/api/**", (r) => r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "field-on-the-card's nav walk answers every read itself: "
          + "the top bar is server-rendered chrome and carries no data, "
          + "so ten routes' worth of live fetches are cost without "
          + "coverage. A failed read is the honest stand-in — this "
          + "surface must name it, and must still draw its header.",
        reason: "e2e_nav_walk_no_live_reads",
      }),
    }));
    await routeEight(page);
    const routes = [
      "/bet-suggester",
      "/bet-suggester/ucl",
      "/bet-suggester/ratings",
      "/bet-suggester/leagues",
      "/bet-suggester/bots",
      "/bet-suggester/hunter",
      "/bet-suggester/friendlies",
      "/bet-suggester/wc26",
      "/bet-suggester/leagues-cup",
      "/bet-suggester/comp/ucl",
    ];
    /* `domcontentloaded`, NOT `load`, and the distinction is the whole
       reason this went red on CI while passing locally. The claim here
       is about the CHROME — a link that ships with the shell of every
       page. Waiting for `load` waits for every image and deferred asset
       on the route as well, so `/bet-suggester/bots` (the twelve-bot
       leaderboard) blew the 45s budget on a slower runner and the test
       failed for page weight, which is a thing it does not test.

       The link is in the server-rendered header, so it is present at
       DOM-ready; `toHaveCount` auto-waits from there if hydration is
       still in flight. */
    /* THE BUDGET IS DERIVED FROM THE WALK, not typed as a round number
       that stops covering it when a route is added. With every read
       answered in-process a navigation is a static document and a
       bundle; 6s apiece is generous and the whole walk normally spends
       a fraction of it. Per-navigation too, so a route that hangs is
       named at once instead of eating the routes behind it. */
    const NAV_MS = 6_000;
    test.setTimeout(NAV_MS * routes.length * 1.5);
    for (const r of routes) {
      await page.goto(r, { waitUntil: "domcontentloaded",
                           timeout: NAV_MS });
      const link = page.getByTestId("field-link");
      await expect(link, `no field link on ${r}`).toHaveCount(1);
      await expect(link).toHaveAttribute("href", "/bet-suggester/ratings");
      /* UPPER LEFT, MEASURED rather than asserted from the markup order:
         it is inside the header, and it is the leftmost interactive
         thing in it. */
      const box = await link.boundingBox();
      const header = await page.locator("header").first().boundingBox();
      expect(box, `no box on ${r}`).not.toBeNull();
      expect(header).not.toBeNull();
      expect(box!.y).toBeLessThan(header!.y + header!.height);
      expect(box!.x).toBeLessThan(header!.x + header!.width / 2);
    }
  });

test("it names a page and nothing else — no count, no glow, no state",
  async ({ page }) => {
    /* A chip in this bar that changed with the data would become a
       signal about what is worth looking at, which is a thing this
       surface never says. */
    await page.goto("/bet-suggester/ratings");
    const link = page.getByTestId("field-link");
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(link).not.toHaveAttribute("data-soon", /.*/);
    await expect(link).not.toHaveText(/\d/);
  });

// ═══════════════════════════════════════════════════════════════════════
// 11. A FIELD MEASURED ON FEWER AXES THAN `shape` IS DEFINED ON
// ═══════════════════════════════════════════════════════════════════════
//
// Backend #141, 2026-09-15. A SECOND cross-league field — MLS + Liga MX,
// which is the Campeones Cup and the Leagues Cup — measured on the
// OVERALL axis ALONE. Attack and defence exist for neither league
// anywhere in the backend: the goals artifact holds the 36 Champions
// League entrants and no club of either. So the block carries `ovr`,
// carries no `atk` and no `def`, and carries no `shape` — which is
// CLEAN/CUT/HOLLOW read off all three gaps together.
//
// IT RIDES UNDER ITS OWN KEY BECAUSE OF THIS FILE'S OWN SUBJECT. The
// card built above walked `field.axes.ovr`, `.atk` and `.def` with no
// guard, so a one-axis block under `field` did not degrade the card, it
// threw inside it — and `tierSet` would have read `.length` off nothing.
// The backend therefore publishes `field_partial`, leaves `field` a
// three-axis contract, and carries its reasoning on the block itself as
// `why_not_field`.
//
// ─── WHAT IS AT STAKE HERE, beyond the five properties above ─────────
//
//  6. AN AXIS NOBODY MEASURED IS NOT A CLUB THE FIELD FAILED TO PLACE.
//     Property 4 said missing is never zero; this is its sharper form —
//     TWO KINDS OF MISSING, and on screen they are one band apart. "no
//     band" is a club whose interval touched none of a MEASURED axis's
//     bands, a fact about that club. An absent axis is a fact about the
//     EVIDENCE, true of all 48 clubs at once, and there is nothing for a
//     cell to be empty of. So the axes the block has are drawn exactly
//     as a whole field's are, and the axes it has not are drawn NOWHERE
//     — no cell, no label, no band, and above all no fallback to the
//     row's own within-league quintiles, which would put one field band
//     beside two league quintiles in one trio and call it one reading.
//
//  7. AN ABSENCE DRAWN NOWHERE IS AN ABSENCE NOBODY CAN ASK ABOUT. So it
//     is named where the field's own detail already lives — behind the
//     `#` — in `shape_absent.why`, the backend's words, verbatim.
//
//  8. NOBODY INVENTS A SHAPE. The block has no `shape` key at all. The
//     card keeps the ROW's own backend shape, which is the fallback the
//     component was already built on, rather than composing a label out
//     of one measured gap and two absences.

const REVIEW_EMPTY = { back: 7, leagues: {}, finished: [], refusals: [],
                       store: null };
const STRIP_EMPTY = {
  version: "watched-strip-v1", generated_at: "2026-12-10T12:00:00Z",
  matches: [], monitored_by_source: { manual: [], open_position: [] },
  open_positions_not_monitored: [], refusal_codes: {}, policy_codes: {},
};

/** THE ROW UNDER TEST, READ OFF THE PAYLOAD rather than named beside it
 *  — the discipline `one-fixture-two-columns.spec.ts` keeps over the
 *  same fixture one backend PR earlier. */
const P_ROW = CAMPEONES_FIELD_ROW;
const P_BLOCK = P_ROW.field_partial;
/** The axes the block CARRIES and the ones it names as missing, both
 *  DERIVED: a block that gains an axis tomorrow moves every expectation
 *  below with it rather than leaving a stale list here asserting the
 *  measurement it used to have. */
const P_HAS: string[] = Object.keys(P_BLOCK.axes);
const P_ABSENT: string[] = P_BLOCK.shape_absent.axes_absent;

/** THE WORD EACH AXIS WEARS ON `data-dim`. This is the COMPONENT's
 *  vocabulary and not the payload's, so it cannot be read off a
 *  fixture — it is checked against a WHOLE field's own three cells in
 *  the control below, which is what stops it going stale. */
const DIM_WORD: Record<string, string> = {
  ovr: "overall", atk: "attack", def: "defence",
};

/** The landing board, with whatever row list a test needs. Every route
 *  is served; an unmatched `/api/` answers 599 rather than reaching a
 *  live backend. */
async function openFolded(page: import("@playwright/test").Page,
                          rows: unknown[] = CAMPEONES_FIELD_BOARD.rows) {
  await page.route("**/api/**", (r) =>
    r.fulfill(json({ detail: "unmocked route" }, 599)));
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json({ ...CAMPEONES_FIELD_BOARD, rows })));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(REVIEW_EMPTY)));
  await page.route("**/api/comp/**", (r) => r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json(STRIP_EMPTY)));
  await page.goto("/bet-suggester");
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
}

/** The fixture's card AS DRAWN IN one column. It rides in two —
 *  `FOLDED_INTO_COLUMNS` — and both must draw the same reading. */
const foldedCard = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`)
    .locator(`[data-testid="picker-row"][data-event="${P_ROW.event_id}"]`);

/** The span the trio's three cells hang off — the one that carries the
 *  hover sentence about what a tier is here. Located by its own direct
 *  children so nothing depends on how deep it sits. */
const trioBox = (c: ReturnType<typeof foldedCard>) =>
  c.locator(':has(> [data-tier])');

// ──────────────────── 0. the partial block speaks the wire's language ─

test("the partial block is a payload the backend could actually emit",
  async () => {
    /* THE FIXTURE'S OWN GUARD, for the reason section 0 gives at
       length: every expectation below reads its numbers off this block,
       which makes the block being wrong the one failure none of them
       can see. These are `stages.field_block`'s rules, not this file's
       opinion. */
    expect(P_HAS.length).toBeGreaterThan(0);
    for (const k of P_HAS) {
      const ax = (P_BLOCK.axes as Record<string, typeof P_BLOCK.axes.ovr>)[k];
      expect(AXIS_KEYS as readonly string[]).toContain(k);
      expect(typeof ax.tier_gap).toBe("number");
      for (const side of [ax.fav, ax.opp]) {
        expect(side.tier_set.length).toBeGreaterThan(0);
        expect(side.tier_set).toContain(side.tier);
        expect(side.straddles).toBe(side.tier_set.length > 1);
        expect(side.rank).toBeGreaterThanOrEqual(1);
        expect(side.rank).toBeLessThanOrEqual(P_BLOCK.size);
      }
      // TIER 1 IS BEST, so a favourite-signed gap is opponent − favourite
      expect(ax.tier_gap).toBe(ax.opp.tier - ax.fav.tier);
    }
    // it is PARTIAL: fewer axes than a shape is defined on, and it says
    // which rather than padding the rest out with nulls
    expect(P_HAS.length).toBeLessThan(AXIS_KEYS.length);
    expect(P_BLOCK.axes_measured).toEqual(P_HAS);
    expect("shape" in P_BLOCK).toBe(false);
    expect(P_ABSENT).toEqual(
      (AXIS_KEYS as readonly string[]).filter((k) => !P_HAS.includes(k)));
    // and both of its sentences are PROSE a card can print
    for (const said of [P_BLOCK.why_not_field, P_BLOCK.shape_absent.why]) {
      expect(said.length).toBeGreaterThan(80);
      expect(said).toMatch(/[a-z]{3,} [a-z]{3,}/);
    }
    // the row carries no `field`: one key or the other, never both
    expect("field" in P_ROW).toBe(false);
    // and the favourite came from the field, which is the whole point —
    // this fixture was a `no_shared_scale` refusal one backend PR ago
    expect(P_ROW.refused).toBe(false);
    expect(P_ROW.fav_source).toBe("field");
    expect(P_ROW.favourite).toBe(P_BLOCK.clubs.fav);
  });

// ───────────────── 1. the axes it HAS are drawn as a field's are ──────

test("the axes the block carries are drawn exactly as a three-axis "
   + "field's are — the field's bands, its ranks, its ladder",
  async ({ page }) => {
    /* NOT A SECOND DESIGN. The Champions League card is the board's own
       card with the data behind it substituted; this is that same card
       with a shorter list of axes behind it, and nothing else. */
    await openFolded(page);
    const c = foldedCard(page, "mls");
    await expect(c).toBeVisible();

    // it says which ladder it is reading, and which axes of it
    await expect(c).toHaveAttribute("data-field", P_BLOCK.competition);
    await expect(c).toHaveAttribute("data-field-size", String(P_BLOCK.size));
    await expect(c).toHaveAttribute("data-field-axes", P_HAS.join(","));

    // the ranks pair and the dumbbell are on the FIELD's 1..N, not on
    // two domestic tables that have never been measured against one another
    const rp = c.getByTestId("rank-pair");
    await expect(rp).toHaveAttribute("data-basis", "field");
    await expect(rp).toHaveAttribute("data-of", String(P_BLOCK.size));
    await expect(rp).toHaveText(
      `#${P_BLOCK.axes.ovr.fav.rank} v #${P_BLOCK.axes.ovr.opp.rank}`);
    await expect(c.getByTestId("rank-dumbbell"))
      .toHaveAttribute("data-basis", "field");

    // the trio prints the FIELD's point band with the payload's own set
    // behind it — the same marks, read the same way, as section 3
    const ovr = c.locator('[data-tier="ovr"]');
    await expect(ovr).toHaveAttribute(
      "data-fav-set", P_BLOCK.axes.ovr.fav.tier_set.join(","));
    await expect(ovr).toHaveAttribute(
      "data-opp-set", P_BLOCK.axes.ovr.opp.tier_set.join(","));
    expect((await ovr.textContent())!.replace(/\s+/g, "")).toBe(
      `ovr${P_BLOCK.axes.ovr.fav.tier}v${P_BLOCK.axes.ovr.opp.tier}`);

    // and its cell is coloured by the FIELD's gap, not by the row's
    await expect(c.locator('[data-testid="tier-cell"][data-dim="overall"]'))
      .toHaveAttribute("data-gap", String(P_BLOCK.axes.ovr.tier_gap));

    // both columns it rides in draw the same reading — it is one fixture
    const other = foldedCard(page, "ligamx");
    await expect(other).toHaveAttribute("data-field-axes", P_HAS.join(","));
    await expect(other.getByTestId("rank-pair")).toHaveText(
      `#${P_BLOCK.axes.ovr.fav.rank} v #${P_BLOCK.axes.ovr.opp.rank}`);
  });

test("the straddle dagger still fires on a partial block — the mark says "
   + "THE BAND IS NOT SETTLED wherever the band is drawn",
  async ({ page }) => {
    /* NEITHER CLUB OF THE REAL FIXTURE STRADDLES A CUT, so that card
       draws no dagger and cannot prove the mark survived. `WIDE_PARTIAL`
       is the same emitter asked for Cruz Azul against Austin, whose 95%
       interval touches two bands; only the BLOCK changes — the row it
       hangs on is the fixture's own. */
    const opp = WIDE_PARTIAL.axes.ovr.opp;
    expect(opp.straddles).toBe(true);
    expect(WIDE_PARTIAL.axes.ovr.fav.straddles).toBe(false);
    await openFolded(page, [{ ...P_ROW, field_partial: WIDE_PARTIAL }]);
    const ovr = foldedCard(page, "mls").locator('[data-tier="ovr"]');
    // the POINT tier is printed, and the dagger beside it says that
    // point is not a placement the evidence will narrow to
    expect((await ovr.textContent())!.replace(/\s+/g, "")).toBe(
      `ovr${WIDE_PARTIAL.axes.ovr.fav.tier}v${opp.tier}†`);
    const mark = ovr.getByTestId("field-floor-mark");
    await expect(mark).toHaveCount(1);
    await expect(mark).toHaveAttribute(
      "title", new RegExp(`bands ${opp.tier_set.join("·")}\\b`));
  });

test("the one axis a partial block HAS is drawn with its number, "
   + "because both keys' axes are the same FieldSide", async ({ page }) => {
    /* THE SEAM BETWEEN THIS KEY AND #81, MEASURED.
       `field_partial` was written on 2026-09-15 and the value/half-width
       pair landed on `FieldSide` the day after — on `FieldSide`
       deliberately, rather than on `RowField`, so that an axis arriving
       under EITHER key carries the measurement. That inheritance is a
       property of the types, and a property nothing exercised: every
       partial fixture in this file predates the pair, so a card that
       read the figure off `field` alone would draw this block's tier
       with no number beside it and no test would have said so — for
       exactly the leagues (MLS + Liga MX) this key exists to serve.
       So: the same block, from a backend that carries the pair. */
    const ax = WIDE_PARTIAL_MEASURED.axes.ovr;
    await openFolded(page, [{ ...P_ROW, field_partial: WIDE_PARTIAL_MEASURED }]);
    const ovr = foldedCard(page, "mls").locator('[data-tier="ovr"]');

    // the figure is drawn, on the scale the AXIS declares it is on
    const m = ovr.locator('[data-measure="ovr"]');
    await expect(m).toHaveCount(1);
    await expect(m).toHaveAttribute("data-unit", "elo");
    // elo is a whole number — `axisDecimals`, not a rounding typed here
    await expect(m.locator('[data-measure-side="fav"]'))
      .toHaveText(`${ax.fav.value}±${ax.fav.half_width_95}`);
    await expect(m.locator('[data-measure-side="opp"]'))
      .toHaveText(`${ax.opp.value}±${ax.opp.half_width_95}`);

    /* AND IT IS BESIDE ITS TIER, not instead of it. The band, the
       dagger that says the band is not settled, and the figure the band
       was read off are three marks about one axis and the card carries
       all three. */
    const text = (await ovr.textContent())!.replace(/\s+/g, "");
    expect(text).toContain(`ovr${ax.fav.tier}v${ax.opp.tier}†`);

    /* THE ABSENT AXES GAIN NOTHING FROM THE MEASUREMENT EITHER. An axis
       nobody measured has no figure for the same reason it has no band:
       there is no row for it. */
    for (const k of P_ABSENT) {
      await expect(ovr.page().locator(`[data-measure="${k}"]`)).toHaveCount(0);
    }
  });

test("a partial block from a backend that predates the measurement draws "
   + "no figure — and never a zero", async ({ page }) => {
    /* THE OTHER HALF OF THE SAME RULE, and the one that decides whether
       the pair may be read unguarded. The block above and this one are
       the SAME reading from two backends; this is the one that carries
       no measurement, and the card must be the card it was before
       rather than a club whose elo is 0.00. */
    expect("value" in WIDE_PARTIAL.axes.ovr.fav).toBe(false);
    await openFolded(page, [{ ...P_ROW, field_partial: WIDE_PARTIAL }]);
    const c = foldedCard(page, "mls");
    await expect(c.locator("[data-measure]")).toHaveCount(0);
    // the band is still drawn — an absent figure removes a line, not the axis
    await expect(c.locator('[data-tier="ovr"]')).toHaveCount(1);
    // and no zero stands in for it anywhere on the card
    const text = (await c.textContent())!.replace(/\s+/g, "");
    expect(text).not.toContain("0±0");
  });

// ──────────── 2. an axis nobody measured is drawn NOWHERE at all ──────

test("an axis the block does not carry is drawn nowhere — not as an "
   + "empty band, and never as the row's own league quintile",
  async ({ page }) => {
    /* THE DISTINCTION THE WHOLE KEY IS BUILT AROUND, and the second
       half is the one that could have shipped quietly: the row still
       carries its within-league `tiers`, and falling back to them would
       draw one FIELD band beside two LEAGUE quintiles in a trio of
       three — the two-ladders defect this field exists to end,
       reassembled inside the mark that replaced it. */
    expect(P_ABSENT.length).toBeGreaterThan(0);
    await openFolded(page);
    const c = foldedCard(page, "mls");

    for (const k of P_ABSENT) {
      await expect(c.locator(`[data-tier="${k}"]`)).toHaveCount(0);
      await expect(c.locator(
        `[data-testid="tier-cell"][data-dim="${DIM_WORD[k]}"]`))
        .toHaveCount(0);
    }
    // exactly as many cells as there are axes …
    await expect(c.getByTestId("tier-cell")).toHaveCount(P_HAS.length);
    /* … and the trio is the axes the block HAS, each reading the
       FIELD's own bands. This is what rules the fallback out: had the
       missing axes kept the row's quintiles, there would be three
       groups here carrying two ladders between them. */
    const shown = await c.locator("[data-tier]").evaluateAll((els) =>
      els.map((e) => ({
        axis: e.getAttribute("data-tier"),
        text: (e.textContent || "").replace(/\s+/g, ""),
      })));
    expect(shown.map((x) => x.axis)).toEqual(P_HAS);
    for (const x of shown) {
      const ax = (P_BLOCK.axes as Record<string, typeof P_BLOCK.axes.ovr>)
        [x.axis!];
      expect(x.text).toBe(`${x.axis}${ax.fav.tier}v${ax.opp.tier}`);
    }

    /* AND NOWHERE ELSE ON THE CARD EITHER — the popover, a hover, a
       stray copy. Checked only for a pair the card does not
       legitimately draw: the field's own `ovr` reads 1v1 here and so
       does the row's within-league `atk`, and a substring search cannot
       tell a collision from a fallback. The trio above is what covers
       the colliding ones. */
    const drawnPairs = new Set(P_HAS.map((k) => {
      const ax = (P_BLOCK.axes as Record<string, typeof P_BLOCK.axes.ovr>)[k];
      return `${ax.fav.tier}v${ax.opp.tier}`;
    }));
    const text = (await c.textContent())!.replace(/\s+/g, "");
    for (const k of P_ABSENT) {
      const q = (P_ROW.tiers as Record<string, number[]>)[k];
      const said = `${q[0]}v${q[1]}`;
      if (drawnPairs.has(said)) continue;
      expect(text, `${k} fell back to the row's league quintiles`)
        .not.toContain(said);
    }
  });

test("the axes nobody measured are NAMED, in the backend's own words, "
   + "behind the field's own affordance", async ({ page }) => {
    /* AN ABSENCE DRAWN NOWHERE IS AN ABSENCE NOBODY CAN ASK ABOUT. The
       account rides the `#` — the field's own detail on this card — and
       it is `shape_absent.why` VERBATIM: which axes are missing, why no
       shape can be read off what is left, and the registry's own
       account of what this field IS. The backend composes it off the
       reading, so a field that gains an axis moves the sentence with
       it; restated here it would be this surface asserting a
       measurement it never made. */
    await openFolded(page);
    const c = foldedCard(page, "mls");
    const trigger = c.getByTestId("field-ranks-open");

    // the affordance says there is something missing before it is opened
    await expect(trigger).toHaveAttribute("data-axes", P_HAS.join(","));
    await expect(trigger)
      .toHaveAttribute("data-axes-absent", P_ABSENT.join(","));
    await expect(trigger).toHaveAccessibleName(
      new RegExp(`no ${P_ABSENT.join(" or ")} axis`));

    await trigger.click();
    const panel = c.getByTestId("field-ranks");
    // it holds the ranks of the axes that EXIST — one row, not three
    const rows = await panel.locator("[data-rank-axis]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-rank-axis")));
    expect(rows).toEqual(P_HAS);
    // and the reason there are no others, word for word
    await expect(panel.getByTestId("field-axes-absent"))
      .toHaveText(P_BLOCK.shape_absent.why);

    // the hover on the numbers says there is one, and points at it
    await expect(trioBox(c)).toHaveAttribute(
      "title", new RegExp(`no ${P_ABSENT.join(" or ")} axis`));
  });

test("a whole field says none of that — the control", async ({ page }) => {
    /* THE THREE-AXIS PANEL IS BYTE FOR BYTE WHAT IT WAS. A field that is
       missing nothing must not grow a sentence about absence, and its
       trigger must not grow an attribute naming one. This is also where
       DIM_WORD above is held to the component: three cells, in the
       reading order, wearing the three words the trio uses. */
    await openBoard(page);
    const c = card(page, "ucl-1");
    const dims = await c.getByTestId("tier-cell")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-dim")));
    expect(dims).toEqual(AXIS_KEYS.map((k) => DIM_WORD[k]));

    const trigger = c.getByTestId("field-ranks-open");
    await expect(trigger).toHaveAttribute("data-axes", AXIS_KEYS.join(","));
    await expect(trigger).not.toHaveAttribute("data-axes-absent", /.*/);
    await trigger.click();
    await expect(c.getByTestId("field-axes-absent")).toHaveCount(0);
    await expect(trioBox(c)).not.toHaveAttribute("title", /axis/);
  });

// ─────────────────────── 3. nobody invents a shape ───────────────────

test("the shape chip is the ROW's own backend shape — the block carries "
   + "none, and none is composed here", async ({ page }) => {
    /* `shape` IS CLEAN/CUT/HOLLOW READ OFF THREE GAPS TOGETHER and this
       field has one, so the block has no `shape` key at all. The
       fallback the component was already built on — the block's shape
       where it carries one, the row's where it does not — is the answer,
       and the row's is still the backend's own word. A label composed
       from one measured gap and two absences would be a sentence about
       the fixture that no measurement stands behind. */
    await openFolded(page);
    const c = foldedCard(page, "mls");
    /* THE CARD IS READING THE FIELD, asserted first and not assumed. A
       card that ignored `field_partial` altogether would also print the
       row's shape — that is the no-field path — so without this line
       the test passes before the fix as well as after it, and proves
       nothing. */
    await expect(c).toHaveAttribute("data-field-axes", P_HAS.join(","));
    await expect(c).toHaveAttribute("data-shape", P_ROW.shape);
    await expect(c.getByTestId("shape-chip")).toHaveText(P_ROW.shape);
    /* AND THE SHAPE IS THE ROW'S THREE GAPS, not a label read off the
       one gap the field measured. The field's `ovr` is level here; a
       word composed from that alone could not be the row's. */
    expect(P_BLOCK.axes.ovr.tier_gap).toBe(0);
    expect(P_ROW.shape).toBe(
      (P_ROW.tier_gaps.ovr > 0 && P_ROW.tier_gaps.atk > 0
        && P_ROW.tier_gaps.def > 0) ? "CLEAN"
        : (P_ROW.tier_gaps.atk <= 0 && P_ROW.tier_gaps.def <= 0) ? "HOLLOW"
          : "SPLIT");
  });

test("the `i` that explains a shape is not drawn on a partial card "
   + "either — its sentence reads three gaps together", async ({ page }) => {
    /* THE CONDITION IS THE FIELD, NOT THE PAGE (2026-09-10), and a
       partial field is a field here. Both halves of the operator's
       reason hold on one: the `#` is drawn six pixels away, so the `i`
       would be the second identical circle; and this panel's prose
       names attack and defence outright, which on a card whose field
       measures neither would put two within-league quintiles into a
       sentence about a cross-league fixture. */
    await openFolded(page);
    const c = foldedCard(page, "mls");
    await expect(c.getByTestId("field-ranks-open")).toHaveCount(1);
    await expect(c.getByTestId("tier-read")).toHaveCount(0);
    // and an ordinary league card on the same board keeps it — the
    // control that stops this becoming "no `i` anywhere"
    const league = page
      .locator('[data-testid="league-col"][data-league="mls"]')
      .locator('[data-testid="picker-row"]:not([data-field])');
    await expect(league.first().getByTestId("tier-read")).toHaveCount(1);
    await expect(league.first().getByTestId("field-ranks-open"))
      .toHaveCount(0);
  });

// ───────── 4. the guard is a guard, not a special case for one field ──

test("a block with no OVERALL axis keeps the card's league ranks rather "
   + "than throwing inside it", async ({ page }) => {
    /* THE PROPERTY IS "ASK THE BLOCK", NOT "HANDLE THE ONE-AXIS CASE".
       Every field measured today carries `ovr`, and a guard tested only
       against the shape that exists is not tested at all — which is
       exactly how `field.axes.atk` came to be walked unguarded. So the
       block under test is the real one with its single axis MOVED to
       `atk`: no emitter produces this today, and the card must degrade
       to the two league positions rather than throw. */
    const moved = {
      ...P_BLOCK,
      axes: { atk: P_BLOCK.axes.ovr },
      axes_measured: ["atk"],
      shape_absent: { ...P_BLOCK.shape_absent, axes_absent: ["ovr", "def"] },
    };
    await openFolded(page, [{ ...P_ROW, field_partial: moved }]);
    const c = foldedCard(page, "mls");
    await expect(c).toBeVisible();
    await expect(c).toHaveAttribute("data-field-axes", "atk");
    // the ranks fall back to the row's own two league positions, and the
    // dumbbell keeps refusing a ladder these two clubs do not share
    const rp = c.getByTestId("rank-pair");
    await expect(rp).toHaveAttribute("data-basis", "league");
    await expect(rp).toHaveText(`#${P_ROW.ranks.fav} v #${P_ROW.ranks.opp}`);
    await expect(c.getByTestId("rank-dumbbell")).toHaveCount(0);
    // and the attack axis the block DOES carry is still drawn off it
    await expect(c.locator('[data-tier="atk"]')).toHaveAttribute(
      "data-fav-set", P_BLOCK.axes.ovr.fav.tier_set.join(","));
    await expect(c.locator("[data-tier]")).toHaveCount(1);
  });

test("a row carrying BOTH keys draws the three-axis block — they are "
   + "never read together", async ({ page }) => {
    /* THE EMITTER CANNOT PRODUCE THIS: it picks the key off the block's
       own axis set. The ordering is asserted anyway, because what is
       being guarded is that the client never MERGES the two — a card
       that combined them would draw a trio with a field band and two
       league quintiles in it, or one axis where a whole field was
       served. It draws the whole field, which is the object every other
       mark on the card was written for. */
    const both = [{ ...BOARD.rows[0], field_partial: P_BLOCK },
                  ...BOARD.rows.slice(1)];
    await openBoard(page, RATINGS, 200, both);
    const c = card(page, "ucl-1");
    await expect(c).toHaveAttribute("data-field-axes", AXIS_KEYS.join(","));
    await expect(c.locator("[data-tier]")).toHaveCount(AXIS_KEYS.length);
    await expect(c.getByTestId("tier-cell")).toHaveCount(AXIS_KEYS.length);
    await expect(c.getByTestId("field-ranks-open"))
      .not.toHaveAttribute("data-axes-absent", /.*/);
    await c.getByTestId("field-ranks-open").click();
    await expect(c.getByTestId("field-axes-absent")).toHaveCount(0);
  });

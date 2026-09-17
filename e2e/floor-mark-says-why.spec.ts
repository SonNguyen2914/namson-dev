import { expect, test } from "@playwright/test";

// THE DAGGER SAYS WHY — on the BOARD-FED CARD, which is the one it
// never did.
//
// WHAT WAS BROKEN (2026-09-16, found while landing #160/#81). A club
// the placeability floor refused is marked with a `†` whose hover
// sentence is the backend's own `BELOW_FLOOR_NOTE`. The card asked for
// that sentence at `side.fav.floor_note` — a key the RATINGS payload
// carries per row and the BOARD has never sent at all. So on every card
// fed by `/api/picker/board`, `FloorMark` rendered `title=""`: a mark
// that says "something is off about this number" and then refuses to
// say what, sitting directly beside the rating #160 had just put on the
// card, and being the only thing there claiming that number is not a
// placement the evidence will stand behind.
//
// WHY THE FIX IS NOT A KEY PER SIDE, which is the shape the card was
// already asking for. `BELOW_FLOOR_NOTE` is one ~500-byte constant. A
// Champions League card whose two clubs are both refused on all three
// axes would carry SIX copies of it inside one block, and the backend
// freezes whole rows onto its volume on every production GET
// (`snapshots.capture_rows`) — ~3KB per cup row per capture, forever,
// which is the growth pattern that filled that volume on 2026-07-25 and
// took every prediction write down behind a silent `{"created":0}`.
//
// So both producers say it ONCE, on the envelope — `field_floor_note`
// on the board, `below_floor_note` on the ratings payload — and
// `fieldApi.floorNoteFor` is the single place a card joins the two back
// up, in `fieldFor`'s own precedence.
//
// ─── WHAT IS AT STAKE, and why each is a property here ──────────────
//
//  1. A BOARD-FED DAGGER SPEAKS. The defect, as a test: a card drawn
//     from `row.field` with no ratings read anywhere near it still says
//     why the club was refused.
//
//  2. A RATINGS-FED DAGGER SPEAKS TOO, off that payload's own envelope
//     key — both producers, one reader.
//
//  3. THE SENTENCE FOLLOWS THE NUMBERS. A card reading the board's
//     block takes the BOARD's note even when a ratings read succeeded
//     beside it, because the note is about the numbers on the card.
//
//  4. IT IS SAID ONCE. The whole point of the shape; asserted by
//     counting what actually crossed the wire.
//
//  5. ABSENT IS NOT EMPTY. A board that predates the key leaves the
//     dagger exactly as it was — the mark is still drawn, because the
//     club really was refused, and nothing is invented for it.
//
//  6. THE STRADDLE DAGGER IS UNTOUCHED. That sentence is about THIS
//     club's own bands, so it differs per side and is still composed on
//     the card; a fix that hoisted it too would print one club's bands
//     against another's.
//
// Every expectation is read off the fixture rather than typed beside
// it — the rule `field-on-the-card.spec.ts` states.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

/* THE BACKEND'S OWN SENTENCE, quoted whole. It is the fixture's, not
   the app's: nothing in the frontend composes this, and a test that
   retyped a paraphrase would go green against a card printing the
   paraphrase. The em dash is the backend's. */
const FLOOR_NOTE =
  "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's "
  + "league did not clear the floor: its median club interval is wider "
  + "than one band of the field, so the evidence does not place it in a "
  + "tier. The rating itself stands and is shown — the wide interval "
  + "beside it IS the refusal, and it is what stops the rank being read "
  + "as precision.";

/* A SECOND, DIFFERENT SENTENCE, so "the card took the board's note"
   and "the card took the ratings payload's note" are distinguishable
   outcomes rather than the same string arriving twice. */
const RATINGS_NOTE = FLOOR_NOTE + " (said by the ratings payload.)";

const side = (rank: number, value: number, hw: number, set: number[],
              tier: number, below = false) => ({
  rank, tier, tier_set: set, straddles: set.length > 1,
  below_floor: below, value, half_width_95: hw,
  interval: [value - hw, value + hw],
});

/* THE FAVOURITE IS REFUSED AND THE OPPONENT IS NOT, on every axis. Both
   states on one card is what lets the count in property 4 mean
   something: one dagger's worth of note, not two. */
const AXES = {
  ovr: {
    fav: side(2, 1726.6327, 92.9285, [2], 2, true),
    opp: side(1, 1964.4368, 33.6449, [1], 1),
    tier_gap: -1, unit: "elo", label: "overall",
  },
  atk: {
    fav: side(2, 0.8669, 0.38, [2], 2, true),
    opp: side(1, 1.1445, 0.2044, [1], 1),
    tier_gap: -1, unit: "log_goals", label: "attack",
  },
  def: {
    fav: side(2, 0.4516, 0.42, [4], 4, true),
    opp: side(1, 1.1491, 0.3704, [1], 1),
    tier_gap: -3, unit: "log_goals", label: "defence",
  },
} as const;

/* THE SAME CLUBS WITH NOBODY REFUSED AND THE FAVOURITE STRADDLING — the
   other branch of the same mark, kept here so property 6 is read off a
   fixture rather than off the absence of one. */
const STRADDLE_AXES = {
  ovr: {
    fav: side(2, 1726.6327, 92.9285, [2, 3], 2),
    opp: side(1, 1964.4368, 33.6449, [1], 1),
    tier_gap: -1, unit: "elo", label: "overall",
  },
  atk: { ...AXES.atk, fav: side(2, 0.8669, 0.38, [2, 3], 2) },
  def: { ...AXES.def, fav: side(2, 0.4516, 0.42, [4, 5], 4) },
} as const;

/* THE BLOCK AS THE WIRE SHAPES IT, not as `RowField` declares it.
   `stages.field_block` emits `axes_measured`, `basis`, `clubs` and
   `field_basis` too, and the card reads none of them — but a fixture
   written in the TYPE's vocabulary rather than the payload's is the
   defect `test-fixtures-speak-the-providers-language` records, so the
   keys are carried here. Checked against a real `ucl` block rather than
   copied from the interface. */
const FIELD = (axes: unknown = AXES) => ({
  competition: "ucl", size: 36, axes, shape: "CLEAN",
  axes_measured: ["ovr", "atk", "def"],
  clubs: { fav: "Feyenoord", opp: "Barcelona" },
  basis: "rated on the competition's own FIELD — its whole entrant set "
    + "on one cross-league scale — and not on either club's domestic "
    + "league.",
  field_basis: "the 36 entrants of the 2026-27 league phase, on three "
    + "axes: overall from the Elo measurement, attack and defence from "
    + "the goals measurement.",
});

const meta = { src: "current", min_current_gp: 4, clubs: 36, kind: "cup",
               rated_on: ["epl", "laliga"], reg_time_note: null,
               blend_k: 10, blend_constant_w: null };

const row = (field: unknown) => ({
  refused: false, league: "ucl", column: "ucl",
  home: "Feyenoord", away: "Barcelona",
  favourite: "Feyenoord", opponent: "Barcelona",
  fav_side: "home", fav_source: "rank", resolution: {},
  ppg_gap: null, gdg_gap: null, rank_gap: null,
  gp_current: { home: 4, away: 4, min: 4 },
  weights: { home: 0.28, away: 0.28, min: 0.28, k: 10, constant: null,
             basis: { home: "blend", away: "blend" } },
  src: "current", cross_league: true,
  rated_in: { home: "epl", away: "laliga" },
  gap_note: "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld.",
  reg_time_note: null, table_notes: { home: null, away: null },
  ranks: { fav: 2, opp: 1 },
  rates: { ppg: [2.0, 2.6], gf: [2.2, 2.8], ga: [1.3, 0.7], gdg: [0.9, 2.1] },
  own_gdg: { diff: -1.2, basis: "EACH CLUB'S OWN GD/g, DIFFERENCED" },
  tiers: { ovr: [2, 1], atk: [2, 1], def: [4, 1] },
  tier_gaps: { ovr: -1, atk: -1, def: -3 },
  shape: "CLEAN", event_id: "ucl-1", competition_id: "ucl-1",
  kickoff: "2026-12-15T20:00:00.000Z", espn: "uefa.champions",
  venue: null, venue_class: null, kalshi: null, current_only: null,
  form: { fav: "WWDLW", opp: "LDWLL", scope: "ucl", scope_is_cup: true },
  ...(field === undefined ? {} : { field }),
});

const BOARD = (opts: { field?: unknown; note?: string | null } = {}) => ({
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: { ucl: meta },
  rows: [row(opts.field)],
  refusals: [], off_board: [], off_board_counts: {}, folded: {},
  narrowed_to: ["ucl"],
  field_unit_notes: {
    elo: "ELO, on the one cross-league scale this field is fitted on.",
    log_goals: "LOG-GOALS. Higher is better on both attack and defence.",
  },
  ...(opts.note === undefined ? {} : { field_floor_note: opts.note }),
});

/* THE RATINGS PAYLOAD, keyed by club the way that endpoint keys it. */
const ratingsAxis = (k: "ovr" | "atk" | "def", axes: typeof AXES) => ({
  axis: k, label: axes[k].label, bands: 5, distinguishable_levels: 4,
  unit: axes[k].unit, cuts: [4, 3, 2, 1], span: [0, 5],
  why_this_many_bands: "five bands, declared.",
  rows: [
    { ...axes[k].opp, club: "Barcelona", league: "laliga", rate: null },
    { ...axes[k].fav, club: "Feyenoord", league: "epl", rate: null },
  ],
  straddling: 0, placed: 2,
});

const RATINGS = (axes: typeof AXES = AXES, note: string | null = RATINGS_NOTE) => ({
  competition: "ucl", passes: "10",
  axes: { ovr: ratingsAxis("ovr", axes), atk: ratingsAxis("atk", axes),
          def: ratingsAxis("def", axes) },
  below_floor_clubs: ["Feyenoord"],
  ...(note === null ? {} : { below_floor_note: note }),
});

const review = { finished: [], refusals: [], leagues: {}, store: null };

async function openBoard(
  page: import("@playwright/test").Page,
  board: unknown,
  ratings: unknown,
) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
  await page.route("**/api/comp/*/ratings", (r) =>
    ratings === null
      ? r.fulfill(json({ detail: "field unavailable" }, 503))
      : r.fulfill(json(ratings)));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("picker-row").first()).toBeAttached();
}

const marks = (page: import("@playwright/test").Page) =>
  page.getByTestId("field-floor-mark");

/** The band sets the straddle fixture publishes, written the way the
 *  card writes them. DERIVED, so an axis whose bands move in the
 *  fixture moves the expectation with it. */
const straddleBands = () => new Set(
  (["ovr", "atk", "def"] as const)
    .map((k) => STRADDLE_AXES[k].fav.tier_set.join("·")));

// ─────────────────────────────────── 0. the fixture could be emitted ─

test("the fixture speaks the wire's language, not the card's",
  async () => {
    // BOTH STATES ARE ON THE CARD, or the count in property 4 is the
    // count of a card with only one club on it.
    for (const k of ["ovr", "atk", "def"] as const) {
      expect(AXES[k].fav.below_floor).toBe(true);
      expect(AXES[k].opp.below_floor).toBe(false);
      // THE REFUSED SIDE CARRIES THE WIDER BAND, which is what the note
      // claims — "the wide interval beside it IS the refusal". A
      // fixture where the placed club is vaguer describes a field the
      // floor could not have produced.
      expect(AXES[k].fav.half_width_95)
        .toBeGreaterThan(AXES[k].opp.half_width_95);
      // REFUSED AND STRADDLING ARE DIFFERENT FACTS and this fixture
      // keeps them apart: every refused side here sits in ONE band, so
      // a note that reached the card could only have come through the
      // below-floor branch.
      expect(AXES[k].fav.straddles).toBe(false);
      expect(AXES[k].fav.tier_set).toHaveLength(1);
      // ...and the straddle fixture is the mirror image, or property 6
      // proves nothing
      expect(STRADDLE_AXES[k].fav.straddles).toBe(true);
      expect(STRADDLE_AXES[k].fav.below_floor).toBe(false);
    }
    // THE TWO NOTES DIFFER, so "which producer spoke" is answerable
    expect(RATINGS_NOTE).not.toEqual(FLOOR_NOTE);
    // and the block the board sends carries no prose of its own — the
    // storage rule, checked on the fixture that claims to be the wire
    expect(JSON.stringify(FIELD())).not.toContain("REFUSED BY THE");
    // THE SIDE IS THE WIRE'S SIDE, key for key. Read off a real `ucl`
    // block from `stages.field_block`, so a fixture that quietly grew
    // a key the backend does not send — `floor_note` above all — fails
    // here rather than certifying a card against a payload that cannot
    // occur.
    expect(Object.keys(AXES.ovr.fav).sort()).toEqual([
      "below_floor", "half_width_95", "interval", "rank", "straddles",
      "tier", "tier_set", "value",
    ]);
    expect(Object.keys(AXES.ovr).sort()).toEqual(
      ["fav", "label", "opp", "tier_gap", "unit"]);
  });

// ──────────────────────────── 1. the board-fed dagger says why at all ─

test("a card drawn from the board's own block says why the floor refused",
  async ({ page }) => {
    // THE DEFECT, AS A TEST. The ratings read FAILS here, so the only
    // sentence anywhere on this page is the board's own — which is the
    // exact condition the board block exists to serve, and the one
    // under which the dagger used to render `title=""`.
    await openBoard(page, BOARD({ field: FIELD(), note: FLOOR_NOTE }), null);

    const all = marks(page);
    await expect(all.first()).toBeAttached();
    const n = await all.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(all.nth(i)).toHaveAttribute("title", FLOOR_NOTE);
    }
  });

test("one refused club, one dagger per axis, and never one for the placed one",
  async ({ page }) => {
    await openBoard(page, BOARD({ field: FIELD(), note: FLOOR_NOTE }), null);
    // THREE AXES, ONE REFUSED SIDE EACH — derived from the fixture, so
    // a card that grew a fourth axis or marked the placed club fails
    // here rather than passing a hand-typed 3.
    const expected = (["ovr", "atk", "def"] as const)
      .filter((k) => AXES[k].fav.below_floor || AXES[k].opp.below_floor)
      .length;
    await expect(marks(page)).toHaveCount(expected);
  });

// ───────────────────────── 2. the other producer, through one reader ─

test("a card drawn from the ratings payload says why, off its own envelope",
  async ({ page }) => {
    // NO `field` ON THE ROW, so `fieldFor` falls through to the ratings
    // join — the path that used to be the only one with a sentence.
    await openBoard(page, BOARD({ note: FLOOR_NOTE }), RATINGS());
    const all = marks(page);
    await expect(all.first()).toBeAttached();
    const n = await all.count();
    for (let i = 0; i < n; i++) {
      await expect(all.nth(i)).toHaveAttribute("title", RATINGS_NOTE);
    }
  });

// ────────────────────── 3. the sentence follows the numbers it marks ─

test("a board-fed card takes the board's note even with a ratings read beside it",
  async ({ page }) => {
    // BOTH PRODUCERS ANSWER, and they say different things. The card is
    // drawing the BOARD's numbers, so it must say the BOARD's sentence:
    // a note taken from a payload the numbers did not come from is a
    // card quoting the wrong measurement about itself.
    await openBoard(page, BOARD({ field: FIELD(), note: FLOOR_NOTE }),
                    RATINGS());
    const all = marks(page);
    await expect(all.first()).toBeAttached();
    const n = await all.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(all.nth(i)).toHaveAttribute("title", FLOOR_NOTE);
      await expect(all.nth(i)).not.toHaveAttribute("title", RATINGS_NOTE);
    }
  });

// ──────────────────────────────────────────── 4. it is said once ────

test("the note crosses the wire once, however many daggers it feeds",
  async ({ page }) => {
    // THE STORAGE CLAIM, MEASURED ON THE PAYLOAD rather than argued in
    // a comment. Three daggers on this card; one copy of the sentence
    // in the bytes that produced them.
    const board = BOARD({ field: FIELD(), note: FLOOR_NOTE });
    const blob = JSON.stringify(board);
    const copies = blob.split(FLOOR_NOTE).length - 1;
    expect(copies).toBe(1);

    await openBoard(page, board, null);
    const drawn = await marks(page).count();
    expect(drawn).toBeGreaterThan(copies);   // and it still feeds them all
  });

// ────────────────────────────────── 5. absent is not empty ──────────

test("a board that predates the key draws the mark and promises nothing",
  async ({ page }) => {
    // THE CLUB REALLY WAS REFUSED, so the mark stays: dropping it would
    // lose a fact the payload states. What must not happen is a tooltip
    // invented here to fill the gap.
    await openBoard(page, BOARD({ field: FIELD() }), null);
    const all = marks(page);
    await expect(all.first()).toBeAttached();
    const n = await all.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(all.nth(i)).toHaveAttribute("title", "");
    }
  });

// ─────────────────────────── 6. the straddle sentence is untouched ──

test("a straddling club still composes its own sentence, per side",
  async ({ page }) => {
    // NOT THE SAME KIND OF FACT. The floor note is one constant about
    // the evidence; a straddle sentence names THIS club's own bands, so
    // it differs per side and cannot be hoisted onto the response
    // without printing one club's bands against another's.
    await openBoard(page,
                    BOARD({ field: FIELD(STRADDLE_AXES), note: FLOOR_NOTE }),
                    null);
    const all = marks(page);
    await expect(all.first()).toBeAttached();
    const n = await all.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const title = await all.nth(i).getAttribute("title");
      expect(title).not.toEqual(FLOOR_NOTE);
      expect(title).toContain("the 95% interval touches bands");
      // THE BANDS NAMED ARE ONES THIS FIXTURE ACTUALLY PUBLISHES, and
      // the expectation is derived from it rather than typed: the three
      // axes straddle DIFFERENT bands here (2·3 on the overall, 4·5 on
      // defence), which is the whole reason this sentence cannot be
      // hoisted onto the response the way the floor note is. Matched
      // against the set rather than by DOM position, so the property is
      // about the sentences and not about the order they are drawn in.
      expect([...straddleBands()].some((b) => title!.includes(`bands ${b}`)))
        .toBe(true);
    }
    // ...and every axis's own sentence really did reach the card, or
    // this passed on three copies of one of them.
    const titles = await all.evaluateAll(
      (els) => els.map((e) => e.getAttribute("title")));
    expect(new Set(titles).size).toBe(straddleBands().size);
  });

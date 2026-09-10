import { expect, test } from "@playwright/test";

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

/** One club on one axis. `tier_set` is the read and `tier` is only its
 *  first member — carried because the payload carries it, and never the
 *  thing a surface prints on its own. */
const axisRow = (rank: number, club: string, league: string, value: number,
                 hw: number, set: number[], below = false,
                 rate: number | null = null) => ({
  rank, club, league, value, half_width_95: hw,
  interval: [value - hw, value + hw], tier: set[0], tier_set: set,
  straddles: set.length > 1, below_floor: below, rate,
  floor_note: below ? FLOOR_NOTE : null,
});

const AXES = {
  ovr: {
    axis: "ovr", label: "overall", bands: 5, distinguishable_levels: 6.12,
    unit: "elo",
    why_this_many_bands: "6.12 distinguishable levels; five bands sit inside it",
    cuts: [1750, 1850, 1950, 2050], span: [1600, 2150],
    rows: [
      axisRow(1, "Barcelona", "la-liga", 2080, 40, [1]),
      axisRow(2, "Feyenoord", "eredivisie", 1900, 70, [2, 3]),
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 1700, 160,
              [3, 4, 5], true),
    ],
    straddling: 2, placed: 1,
  },
  atk: {
    axis: "atk", label: "attack", bands: 3, distinguishable_levels: 2.41,
    unit: "log_goals",
    why_this_many_bands: "2.41 distinguishable levels; five bands would "
      + "assign every club to a band narrower than its own interval",
    cuts: [0.35, 0.75], span: [-0.2, 1.1],
    rows: [
      axisRow(1, "Barcelona", "la-liga", 0.82, 0.11, [2, 3], false, 2.61),
      axisRow(2, "Feyenoord", "eredivisie", 0.44, 0.14, [2], false, 1.98),
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 0.10, 0.31,
              [1, 2], true, 1.21),
    ],
    straddling: 2, placed: 1,
  },
  def: {
    axis: "def", label: "defence", bands: 3, distinguishable_levels: 2.33,
    unit: "log_goals",
    why_this_many_bands: "2.33 distinguishable levels; on this axis every "
      + "one of the clubs straddles a cut, so the set is the read",
    cuts: [0.30, 0.70], span: [-0.3, 1.0],
    rows: [
      axisRow(1, "Barcelona", "la-liga", 0.18, 0.13, [1], false, 0.74),
      axisRow(2, "Feyenoord", "eredivisie", 0.52, 0.16, [1, 2], false, 1.32),
      axisRow(3, "Kairat Almaty", "azerbaijan-premyer-liqa", 0.81, 0.29,
              [2, 3], true, 1.90),
    ],
    straddling: 2, placed: 1,
  },
};

const RATINGS = {
  competition: "ucl", passes: "10", display: "UEFA Champions League",
  corpus_sha256: "deadbeef", admitted_leagues: ["la-liga", "eredivisie"],
  below_floor_clubs: ["Kairat Almaty"],
  below_floor_note: FLOOR_NOTE,
  axes_disagree_note: "The three axes are read from two different "
    + "measurements and do not agree.",
  not_a_trading_signal: true,
  axes: AXES,
};

/** The one club the FIELD does not hold, on a fixture the BOARD does. */
const UNHELD = "Pafos";

/** The axes' reading order, taken from the fixture rather than typed
 *  below it: a spec that spells out ["ovr","atk","def"] goes on passing
 *  if the card ever drops one. */
const AXIS_KEYS = Object.keys(AXES) as (keyof typeof AXES)[];

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
 *  make the read FAIL instead. */
async function openBoard(page: import("@playwright/test").Page,
                         ratings: unknown = RATINGS, status = 200) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review)));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json(status === 200 ? ratings : { detail: "field unavailable" },
                   status)));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("picker-row").first()).toBeAttached();
}

const card = (page: import("@playwright/test").Page, event: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${event}"]`);

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

test("every band set in the tier trio is drawn WHOLE — never its first "
   + "member alone", async ({ page }) => {
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
      text: (e.textContent || "").replace(/†/g, "").trim(),
    })));
    for (const t of drawn) {
      const fav = (t.fav || "").split(","), opp = (t.opp || "").split(",");
      // the payload's own sets, joined — not strings typed in this file
      expect(t.text).toBe(`${t.axis}${fav.join("·")}v${opp.join("·")}`);
      // and never a bare first member where the set has more than one:
      // that is the `OVR 1v1` defect exactly
      if (fav.length > 1) expect(t.text).not.toContain(`${t.axis}${fav[0]}v`);
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

test("a club below the floor carries a dagger and its REASON on the tier "
   + "trio; one above the floor carries neither", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-2");   // Kairat Almaty is below the floor,
                                     // and BOTH its clubs are held
    const marks = c.getByTestId("field-floor-mark");
    await expect(marks.first()).toBeVisible();
    await expect(marks.first()).toHaveAttribute("title", FLOOR_NOTE);
    // and it is a mark, not an alert: no colour of its own, no words
    await expect(marks.first()).toHaveText("†");
    // one per below-floor END of the three axes, and no more
    await expect(marks).toHaveCount(AXIS_KEYS.length);

    /* THE CONTROL. Every club on the other card cleared the floor, so
       not one of its cells may carry the mark — otherwise "marked
       subtly" would be satisfied by marking everyone. */
    await expect(card(page, "ucl-1").getByTestId("field-floor-mark"))
      .toHaveCount(0);
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

test("the panel's label row aligns with the TRIO's label row, and it sits "
   + "beside the `i` rather than off the card's edge", async ({ page }) => {
    /* Two placements were rejected. Anchored to the 15px button, a
       196px panel hangs off the card's right edge and `overflow-x: clip`
       CLIPS it; right-anchored to the card — what the shape popover
       does — it opens nowhere near what opened it. Anchored to the trio
       it is beside the button, inside the card by construction, and its
       three labels land on the trio's three labels. */
    await page.setViewportSize({ width: 1280, height: 900 });
    await openBoard(page);
    const c = card(page, "ucl-1");
    await c.getByTestId("field-ranks-open").click();
    const geom = await c.evaluate((el) => {
      const panel = el.querySelector('[data-testid="field-ranks"]')!;
      const label = panel.querySelector("[data-rank-axis] span")!;
      const trioLabel = el.querySelector('[data-tier="ovr"] span')!;
      const trigger = el.querySelector('[data-testid="field-ranks-open"]')!;
      const box = (n: Element) => n.getBoundingClientRect();
      const t = box(trigger);
      /* WHAT THE POINTER WOULD ACTUALLY HIT at the circle's centre.
         The geometry that matters is not "does the panel reach past the
         trigger" — the trio's width varies with the band sets, so it
         sometimes does — it is whether the CLICK still lands. */
      const hit = document.elementFromPoint(t.left + t.width / 2,
                                            t.top + t.height / 2);
      return {
        card: [box(el).left, box(el).right],
        panel: [box(panel).left, box(panel).right],
        hitIsTrigger: trigger === hit || trigger.contains(hit),
        labelTop: box(label).top, trioLabelTop: box(trioLabel).top,
      };
    });
    // the label rows are the same row — one device pixel of rounding,
    // never a line of leading (12px was the inline-flex baseline bug)
    expect(Math.abs(geom.labelTop - geom.trioLabelTop)).toBeLessThanOrEqual(1);
    // it starts at the trio's own left edge, inside the card
    expect(geom.panel[0]).toBeGreaterThanOrEqual(geom.card[0] - 0.5);
    /* AND IT NEVER LEAVES THE CARD. This is the xl breakpoint, where
       the board lays six matches across and the card is ~197px — the
       narrowest track this panel is ever drawn in. `html { overflow-x:
       clip }` means an overhang past the page would be CLIPPED rather
       than scrolled to, and a reader would never learn a column had
       been cut off; the card is the stricter bar, and the same one the
       shape popover beside it is held to. */
    expect(geom.panel[1]).toBeLessThanOrEqual(geom.card[1] + 0.5);
    /* AND THE TRIGGER IS STILL THE THING UNDER THE POINTER. At 820px
       it was not: the panel is anchored to the trio and, when the band
       sets are short, is wider than it — so it covered the circle that
       opened it and swallowed the click that closes it, which is the
       2026-09-07 bug in the popover next door, found here before it
       shipped. Asserted as a hit test rather than as clearance, because
       the hit is the property; the clearance varies with the sets. */
    expect(geom.hitIsTrigger).toBe(true);
    // and the round trip really works: a second click closes it
    await c.getByTestId("field-ranks-open").click();
    await expect(c.getByTestId("field-ranks")).toHaveCount(0);
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
                      "shape-chip", "tier-read", "watch-toggle"]) {
      await expect(c.getByTestId(id).first(),
                   `${id} is missing from the UCL card`).toBeAttached();
    }
    // the two club lines, the three tier cells, the three trio cells
    await expect(c.getByTestId("form-strip")).toHaveCount(2);
    await expect(c.getByTestId("tier-cell")).toHaveCount(3);
    await expect(c.locator("[data-tier]")).toHaveCount(3);
    // the Kalshi line — this fixture has no event, which is one of its
    // three named states and never a blank
    await expect(c).toContainText("no kalshi event");
  });

// ───────────────────────── 10. the field's own page ──────────────────


test("the field has a page of its own, and it opens on the ranked field",
  async ({ page }) => {
    await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(RATINGS)));
    await page.goto("/bet-suggester/ratings");
    await expect(page.getByTestId("field-axes")).toBeVisible();
    // the competition it is showing, by its DISPLAY name
    await expect(page.getByTestId("field-comp")).toHaveText(RATINGS.display);
    // all three axes offered, derived from the payload
    await expect(page.getByTestId("axis-tab"))
      .toHaveCount(Object.keys(AXES).length);
    // and the whole field is already drawn — nothing to expand
    await expect(page.getByTestId("axis-row"))
      .toHaveCount(AXES.ovr.rows.length);
  });

test("it carries the charter, because an ordering is the easiest thing on "
   + "this site to mistake for advice", async ({ page }) => {
    await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json(RATINGS)));
    await page.goto("/bet-suggester/ratings");
    const charter = page.getByTestId("field-charter");
    await expect(charter).toContainText(/no model runs on this page/i);
    await expect(charter)
      .toContainText(/no number below is a probability or an edge of ours/i);
    await expect(charter).toContainText(/nothing here is a recommendation/i);
    /* NO DIRECTIVE COPY ANYWHERE ON IT. The page is one long ranking, so
       the vocabulary check is worth making over the whole document
       rather than over one block. */
    const body = (await page.locator("main").innerText()).toLowerCase();
    for (const banned of ["you should", "bet on", "back the", "cash out",
                          "sell now", "buy now", "best pick"]) {
      expect(body).not.toContain(banned);
    }
  });

test("a failed read on that page is NAMED, never drawn as an empty field",
  async ({ page }) => {
    await page.route("**/api/comp/*/ratings", (r) =>
      r.fulfill(json({ detail: "field unavailable" }, 503)));
    await page.goto("/bet-suggester/ratings");
    await expect(page.getByTestId("field-axes-error")).toBeVisible();
    // the backend's own sentence, carried rather than replaced
    await expect(page.getByTestId("field-axes-error"))
      .toContainText("field unavailable");
    await expect(page.getByTestId("field-axes")).toHaveCount(0);
    // and the empty-field block is NOT what a failure shows
    await expect(page.getByTestId("field-axes-absent")).toHaveCount(0);
  });

test("a failure with NOTHING to say still says the status, rather than "
   + "falling silent", async ({ page }) => {
    /* The other half of the contract above. When the server sends no
       words of its own there is still a fact to report, and the one
       thing this must not do is degrade to a blank — a page that renders
       nothing after a failed read is indistinguishable from one whose
       field is genuinely empty. */
    await page.route("**/api/comp/*/ratings", (r) =>
      r.fulfill({ status: 502, contentType: "text/html", body: "<h1>bad</h1>" }));
    await page.goto("/bet-suggester/ratings");
    await expect(page.getByTestId("field-axes-error")).toBeVisible();
    await expect(page.getByTestId("field-axes-error")).toContainText("502");
    await expect(page.getByTestId("field-axes-absent")).toHaveCount(0);
  });

test("an unmeasured competition says so in the backend's own words",
  async ({ page }) => {
    await page.route("**/api/comp/*/ratings", (r) =>
      r.fulfill(json({ competition: "epl", display: "Premier League",
                       axes: null,
                       why_not: "no cross-league field has been measured "
                                + "for this competition." })));
    await page.goto("/bet-suggester/ratings?comp=epl");
    await expect(page.getByTestId("field-axes-absent")).toBeVisible();
    await expect(page.getByTestId("field-axes-absent"))
      .toContainText("no cross-league field has been measured");
    await expect(page.getByTestId("field-axes-error")).toHaveCount(0);
  });

// ───────────────────────────── 7. reachable from the upper left ──────

test("the link to it sits in the TOP-LEFT of every page that carries the "
   + "nav", async ({ page }) => {
    /* "put in on the left upper side of the web ... anytime i need."
       The set of pages is not typed here as three or four favourites: it
       is every route in the app that renders the top bar, walked. */
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
    test.setTimeout(90_000);
    for (const r of routes) {
      await page.goto(r, { waitUntil: "domcontentloaded" });
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

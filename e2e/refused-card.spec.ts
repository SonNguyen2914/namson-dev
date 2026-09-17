import { expect, test } from "@playwright/test";
// THE STRIP IS SERVED AS `watched-strip-v2` (backend #129). The
// fixtures below stay the shape RECORDED off this route and `toV2`
// applies the route's OWN hoist to them at the serve site, so the
// v2 payload under test is a transformation of a real one rather
// than a v2 shape typed into this file. See e2e/standing.ts.
import { toV2 } from "./standing";

/** The recorded v1 fixture, as the route emits it under v2. A
 *  non-object body (a 404 detail, a string) is served untouched. */
const asV2 = (b: unknown): unknown =>
  b != null && typeof b === "object" && !Array.isArray(b)
    ? toV2(b as object) : b;

// the SAME day-key function the board groups by, so a test can never
// disagree with the page about which band a kickoff belongs to
import { localDay as localDayOf } from "../src/lib/matchday";

/* THE REFUSED CARD IS A FULL CARD (operator, 2026-09-11).
 *
 *   "for refused promoted team, also give them a normal board but with
 *    highlighted border and a #refused tag. You can use any data we have
 *    up to date for those promoted team."
 *
 * Until today a refused fixture drew a four-line stub: two club names, a
 * reason, a dashed amber border. Beside a full ranked card that read as a
 * fixture the board had NOTHING on — which is false, and is the exact
 * failure mode (absent-by-design rendering as nothing-was-measured) this
 * whole surface is built against. The board holds the promoted club's
 * whole current season, both clubs' form, the kickoff, the book, and the
 * games-played count that ends the refusal.
 *
 * AND IT IS THE SIZE OF ONE (operator, 2026-09-15): "the refused card
 * MUST be the size of other cards". Nothing measured was cut to get
 * there — the size came out of DELETING DUPLICATED WORDING. The header
 * said `rank refused` while the `#refused` tag beside it and the axes
 * row below it both said it too, so the REASON stands in that slot now;
 * the rank-gap cell repeated the header and is gone; the tier trio and
 * the shape chip each said `refused` separately, over three stacked
 * labels, and are ONE span naming all four axes once; `ppg H 0.75 · A
 * 1.30` became `ppg 0.75/1.30` with the labels in the title; and every
 * paragraph moved behind the circled i, including the general rule that
 * used to be printed once per column under the first refused card a
 * reader met.
 *
 * WHAT THIS SPEC IS FOR. Four properties, none of which a prettier card
 * could quietly lose:
 *
 *   1. SAME FOOTPRINT. A refused card and a ranked card in one column are
 *      the same width and carry the same blocks in the same order, at
 *      390 and at 1280. That is what "a normal board" means.
 *   2. SAME SIZE. Six blocks each, and the same height under the chip
 *      row — measured on the cards' own content extents rather than on
 *      the boxes a stretching grid hands them, which are equal whatever
 *      either card holds.
 *   3. UNMISTAKABLE. `#refused` in words, a highlighted border that is
 *      neither dashed nor gold nor the traffic light, NO rank number,
 *      and the word `refused` standing in every slot where a comparison
 *      between the two clubs would be.
 *   4. MISSING IS NEVER ZERO — the rule this repo enforces absolutely.
 *      No cell on this card may render `0`, `0.00`, `—` or nothing at
 *      all. A refused figure says `refused`; an unsent figure says `not
 *      stated`; an absent block says it is absent, in a sentence. ONE
 *      branch stopped doing that on 2026-09-15 and is named where it is
 *      asserted: an absent admission countdown now draws nothing.
 *
 * Hermetic: every route the board touches is served here, and an
 * unmatched `/api/` request fails the test rather than reaching
 * production.
 */

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// DETERMINISTIC and SAME-PT-DAY, borrowed from picker.spec.ts: a fixed
// future midnight PT plus 25-minute steps, so every fixture below lands
// in ONE matchday band and the ranked card and the refused card are
// genuinely neighbours rather than accidentally so.
function inHours(h: number) {
  const base = Date.UTC(2026, 11, 10, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
}

const LEAGUES = {
  epl: { src: "prior", min_current_gp: 1, clubs: 20 },
};

/** The ranked card the refused one has to stand beside. */
const RANKED = {
  refused: false, league: "epl",
  home: "Aston Villa", away: "Arsenal",
  favourite: "Arsenal", opponent: "Aston Villa", fav_side: "away",
  resolution: { "Aston Villa": "exact", Arsenal: "exact" },
  ppg_gap: 0.53, gdg_gap: 0.97, rank_gap: 3,
  gp_current: { home: 4, away: 4, min: 4 },
  src: "prior", ranks: { fav: 1, opp: 4 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 },
  shape: "CLEAN",
  form: { fav: "WWDWW", opp: "LDWLW", scope: "Premier League",
          scope_is_cup: false },
  /* SO THE RANKED CARD DRAWS ITS VENUE BADGE TOO. Without a venue class
     `homeBadge` returns null, and the side-by-side picture this test
     emits would compare a refused card that has a badge against a ranked
     card that has none — a difference in the FIXTURE showing up as a
     difference in the card. */
  venue_class: { class: "DOMESTIC", home_side: "home" },
  event_id: "401879295", competition_id: "401879295",
  kickoff: inHours(9), espn: "eng.1",
  kalshi: {
    event_ticker: "KXEPLGAME-SAMPLE-AVLARS",
    ticker: "KXEPLGAME-SAMPLE-AVLARS-ARS",
    ask_c: 64, bid_c: 59, spread_c: 5,
    ask_size: 40, bid_size: 220, flags: [],
  },
};

/** picker/stages.REFUSAL_WITHHELD, VERBATIM off the emitter and
 *  verified on the live board. The card printed a paragraph of its own
 *  in this slot until 2026-09-11 — six cells' worth of hover text and
 *  one more copy underneath — while this sentence, written by the
 *  module that made the decision and naming the seven figures rather
 *  than gesturing at them, sat on the same payload.
 *
 *  RE-COPIED 2026-09-16, AND THAT IS THE POINT OF THE DATE. The emitter
 *  rewrote this sentence on 2026-09-14: the old one ended "this club has
 *  no row in the ordering the other club's rank and tier are positions
 *  in", which was true of every refusal there was and is FALSE of the
 *  `no_shared_scale` refusal added that day, where both clubs are rated
 *  and it is the two orderings that have never met. The new one names
 *  BOTH shapes and points at `case` for which applies. This constant
 *  went on carrying the old wording for two days, under a comment
 *  claiming it was verbatim — which is what a hand-typed copy of another
 *  repository's string does, and why `campeones-board.ts` and
 *  `efl-cup-recorded.ts` are RECORDED rather than typed. Both of those
 *  already carried the rewrite. */
const WITHHELD =
  "every figure that compares the two clubs — the ppg, GD/g and rank "
  + "gaps, the favourite, the tiers, the shape and the venue-aware "
  + "annotation. The comparison is what was refused, and `case` beside "
  + "this says which rule refused it: either this club has no row in "
  + "the ordering the other club's rank and tier are positions in, or "
  + "each club has a row in an ordering the other is not in and the two "
  + "orderings have never been measured against one another.";

/** THE WHOLE CONTRACT, as the backend serves it for a `no_prior_row`
 *  refusal. Sunderland resolved; Promoted Rovers FC did not. */
const FULL = {
  refused: true, league: "epl",
  home: "Sunderland", away: "Promoted Rovers FC",
  club: "Promoted Rovers FC",
  reason: "no row in the prior-season top-flight table",
  event_id: "401879999", kickoff: inHours(11),
  admission: {
    k: 10, gp: 6, games_until_rated: 4,
    gate: "a club with no prior-season row is rated only once this "
      + "season's weight reaches the majority — w_current = GP/(GP+k) "
      + ">= 0.5 at k = 10, which is GP >= 10",
    basis_when_admitted: "current_only",
    says: "Promoted Rovers FC has no prior-season row, so the board needs "
      + "10 games of this one before it can rate the club on this season "
      + "alone. It has played 6; 4 to go. Until then it has no row in the "
      + "table every other club is placed in, so no comparison is shown.",
  },
  this_season: { gp: 6, ppg: 1.5, gf: 1.33, ga: 1.17, gdg: 0.16 },
  // `gp_current` IS THE WIRE'S NAME FOR IT — this fixture said `gp`
  // until 2026-09-11 and every test below passed while the LIVE board
  // printed "gp not stated/3" for Chelsea v Hull City over a payload
  // carrying `gp_current: 3`. The fixture was speaking the brief's
  // vocabulary instead of the backend's, which is the failure this repo
  // has already paid for once on venue classes. Verified against
  // production: picker/stages.rated_side emits `gp_current`.
  opponent_row: { club: "Sunderland", rank: 12, gp_current: 4, ppg: 1.25,
                  gf: 1.0, ga: 1.25, gdg: -0.25 },
  form: { home: ["W", "D", "L", "W", "W"], away: "LWWDW",
          scope: "Premier League", scope_is_cup: false },
  kalshi: {
    event_ticker: "KXEPLGAME-SAMPLE-SUNPRO",
    ticker: "KXEPLGAME-SAMPLE-SUNPRO-SUN",
    ask_c: 71, bid_c: 66, spread_c: 5,
    ask_size: 90, bid_size: 140, flags: [],
  },
  /* THE REFUSAL'S OWN ACCOUNT OF ITSELF — picker/stages.refused_row,
     and VERIFIED on the live board 2026-09-11 (Chelsea v Hull City,
     Crystal Palace v Ipswich Town, Racing Santander v Alavés, Atlante v
     Pachuca all carry it, all `below_admission`, all with `absent: {}`).
     `withheld` is REFUSAL_WITHHELD verbatim and `why` is
     REFUSAL_CASES["below_admission"] verbatim; `carries` and `absent`
     are DERIVED upstream from REFUSAL_BLOCKS against the row itself.

     THE CARD WROTE ALL OF THIS OUT IN ITS OWN WORDS until the same day,
     over a payload that had been carrying it. */
  refusal: {
    reason: "no_prior_row",
    case: "below_admission",
    why: "the club has no prior-season row and has not yet played "
      + "enough of this one, so the blend gives it no row to compare "
      + "with. Its OWN current season is measured and is reported, "
      + "beside the gate it has not passed yet.",
    carries: ["this_season", "admission", "opponent_row"],
    absent: {},
    withheld: WITHHELD,
  },
};

/** picker/stages.REFUSAL_WITHHELD, verbatim: one sentence, identical
 *  under every reason, naming what no refusal will ever carry. */
const AMBIGUOUS = {
  refused: true, league: "epl",
  home: "Sunderland", away: "Rovers",
  club: "Rovers",
  reason: "ambiguous:2",
  event_id: "401879888", kickoff: inHours(13),
  /* THE BLOCKS THIS CASE CANNOT CARRY, each with the backend's own
     sentence for why — `_league_refusal` sets `this_season` to None
     under every stem but `not_in_this_season`, and `admission_why`
     follows from that. A card that drew nothing here would read as a
     card that forgot, rather than as a board that declined. */
  refusal: {
    reason: "ambiguous:2",
    case: "ambiguous",
    why: "the club's name matched more than one club in the table and "
      + "the board refuses to guess which. NO figures can be reported: "
      + "this club may well have a prior row, and printing a "
      + "candidate's season would attribute some other club's football "
      + "to this fixture — invisible on the board and wrong in every "
      + "number on the card.",
    carries: ["opponent_row"],
    absent: {
      this_season: "the club's name matched more than one club in the "
        + "table and the board refuses to guess which. NO figures can "
        + "be reported: this club may well have a prior row, and "
        + "printing a candidate's season would attribute some other "
        + "club's football to this fixture — invisible on the board and "
        + "wrong in every number on the card.",
      admission: "there is no current-season line to be short of",
    },
    withheld: WITHHELD,
  },
  opponent_row: { club: "Sunderland", rank: 12, gp_current: 4, ppg: 1.25,
                  gf: 1.0, ga: 1.25, gdg: -0.25 },
};

/** THE SAME REFUSAL FROM A BOARD THAT PREDATES THE CONTRACT — every
 *  optional key absent. This is not a hypothetical: the backend half of
 *  this change is a separate PR, so this is what production serves until
 *  it lands, and the card must be honest on it rather than merely not
 *  crash. */
const BARE = {
  refused: true, league: "epl",
  home: "Sunderland", away: "Promoted Rovers FC",
  club: "Promoted Rovers FC",
  reason: "no row in the prior-season top-flight table",
  event_id: "401879999", kickoff: inHours(11),
};

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20261210", days: 7,
  leagues: LEAGUES,
  rows: [RANKED],
  refusals: [FULL],
};

const REVIEW = { back: 7, leagues: {}, finished: [], refusals: [], store: null };

/** The HOLD/EXIT strip's own read — the landing page polls it whether or
 *  not an operator token is present, so a spec that did not serve it
 *  would leave the page's slowest element on the live backend. */
const STRIP = {
  version: "watched-strip-v1",
  generated_at: "2026-12-10T12:00:00Z",
  matches: [],
  monitored_by_source: { manual: [], open_position: [] },
  open_positions_not_monitored: [],
  refusal_codes: {}, policy_codes: {},
};

async function open(page: import("@playwright/test").Page,
                    refusals: unknown[] = [FULL]) {
  /* EVERY ROUTE THE BOARD TOUCHES, AND A FLOOR UNDER THE REST. The
     catch-all is registered FIRST so the three specific handlers below
     take precedence (Playwright matches the most recently added route),
     and it FAILS rather than passing a request through: a spec that
     silently reaches the live backend is a spec whose result depends on
     the weather. */
  const stray: string[] = [];
  await page.route("**/api/**", (r) => {
    stray.push(r.request().url());
    return r.fulfill(json({ detail: "unmocked route" }, 599));
  });
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json({ ...BOARD, refusals })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  // the competition rail asks each declared column for its fixtures
  await page.route("**/api/comp/**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json(asV2(STRIP))));
  await page.goto("/bet-suggester");
  await expect(page.getByTestId("picker-refusal")).toHaveCount(1);
  return () => stray;
}

const epl = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="league-col"][data-league="epl"]');
const refused = (page: import("@playwright/test").Page) =>
  page.getByTestId("picker-refusal");
const ranked = (page: import("@playwright/test").Page) =>
  page.getByTestId("picker-row");

// ─────────────────────────────────────────── 1. the same footprint ───

test("a refused card and a ranked card are the same card, at 390 and 1280",
  async ({ page }) => {
    /* "also give them a normal board" — the operator's first four words.
       Same track, same width, same padding family. Measured at the
       phone width where the board is one column and at the width where a
       matchday lays four across, because the narrow one is where a card
       that did not take the reflow would give itself away. */
    for (const w of [390, 1280]) {
      await page.setViewportSize({ width: w, height: 1400 });
      await open(page);
      const a = await ranked(page).first().boundingBox();
      const b = await refused(page).first().boundingBox();
      expect(a, `ranked card has a box at ${w}`).not.toBeNull();
      expect(b, `refused card has a box at ${w}`).not.toBeNull();
      // same track: within a pixel of each other's width
      expect(Math.abs(a!.width - b!.width),
        `widths agree at ${w} (ranked ${a!.width}, refused ${b!.width})`)
        .toBeLessThanOrEqual(1);
      // and it is a CARD, not a strip
      expect(b!.height / a!.height,
        `refused card is card-sized at ${w}`).toBeGreaterThan(0.6);

      /* AND THE PICTURE, at the two widths this test already opens. The
         operator reads this surface by looking at it, so the review of a
         card change should be able to as well — and a screenshot that is
         a by-product of the geometry assertion can never drift from what
         the assertion measured. `test-results/` is gitignored, so this
         writes an artefact and commits nothing. */
      await page.locator('[data-testid="day-track"]')
        .filter({ has: page.getByTestId("picker-refusal") })
        .screenshot({ path: `test-results/shots/refused-beside-ranked-${w}.png` });
    }
  });

/** THE NATURAL HEIGHT OF A CARD — what it would be if nothing stretched
 *  it. `boundingBox()` reports the GRID's answer: both cards sit in one
 *  day track, tracks stretch their items, so at 1280 the two boxes are
 *  319.97px each whatever either card holds. A height assertion on that
 *  number is an assertion about CSS Grid, and it passes over a stub.
 *
 *  So the measure is the card's own content extent: the bottom of its
 *  last block, plus the padding under it, from the card's top. */
async function naturalHeight(loc: import("@playwright/test").Locator) {
  return loc.evaluate((el) => {
    const pad = parseFloat(getComputedStyle(el).paddingBottom);
    const last = el.lastElementChild as HTMLElement;
    return last.getBoundingClientRect().bottom
      - el.getBoundingClientRect().top + pad;
  });
}

/** TWO CONSECUTIVE READS THAT AGREE. `evaluate` does not auto-wait and a
 *  viewport change is not synchronous with reflow, so one read can
 *  faithfully describe the PREVIOUS layout — the bug that once reported
 *  three tracks at 1440 where there are six. */
async function settled(read: () => Promise<number>) {
  let prev = await read();
  for (let i = 0; i < 25; i++) {
    const next = await read();
    if (Math.abs(next - prev) < 0.5) return next;
    prev = next;
  }
  throw new Error("the layout never settled — 25 consecutive reads disagreed");
}

test("the refused card is the SIZE of a ranked card — six blocks, and the "
   + "same skeleton under the chip row", async ({ page }) => {
    /* THE OPERATOR'S REQUIREMENT, 2026-09-15: "the refused card MUST be
       the size of other cards". Nothing pinned it. The old check above
       asks only that the refused card be more than 60% of a ranked one's
       STRETCHED box — which a grid guarantees and a four-line stub would
       have squeaked past on a short day.

       WHAT IS MEASURED, and why it is measured in two parts:

         1. THE SAME NUMBER OF BLOCKS. Six each, counted off both cards
            rather than typed: chip row, matchup + anchor, dumbbell,
            Stage 1, Stage 2, market + watch. This is the "same skeleton"
            half of the requirement and it is the half a restyle breaks
            first — the tier trio was stacked over three labels and the
            reason sat on a line of its own until today, which is two
            blocks this card no longer spends.

         2. THE SAME HEIGHT UNDER THE CHIP ROW. Everything below the
            first block is the ranked card's own furniture and measures
            within a few pixels of it (4.75px at 390, measured). The chip
            row itself is the one block that CANNOT match: it carries the
            refusal's REASON, whose length is the backend's and whose
            wrap is the column's width. So the whole-card difference is
            asserted to be ACCOUNTED FOR by that one row — which is a
            tighter statement than a tolerance on the total, and goes red
            if any other block grows. */
    for (const w of [390, 1280]) {
      await page.setViewportSize({ width: w, height: 1600 });
      await open(page);
      const r = ranked(page).first();
      const f = refused(page).first();

      const blocks = async (loc: import("@playwright/test").Locator) =>
        loc.evaluate((el) => el.children.length);
      const rBlocks = await blocks(r);
      expect(await blocks(f), `the refused card's block count at ${w}`)
        .toBe(rBlocks);
      /* AND SIX IS THE NUMBER, said absolutely as well as relatively:
         "both cards have the same count" is satisfied by both of them
         collapsing together, which is a card losing its skeleton rather
         than matching one. */
      expect(rBlocks, `the ranked card's block count at ${w}`).toBe(6);

      const rTotal = await settled(() => naturalHeight(r));
      const fTotal = await settled(() => naturalHeight(f));
      const chip = async (loc: import("@playwright/test").Locator) =>
        loc.evaluate((el) =>
          (el.children[0] as HTMLElement).getBoundingClientRect().height);
      const rChip = await chip(r);
      const fChip = await chip(f);

      // the skeleton under the chip row is the ranked card's, to the pixel
      expect(Math.abs((fTotal - fChip) - (rTotal - rChip)),
        `under the chip row the two cards differ at ${w} `
        + `(refused ${fTotal - fChip}, ranked ${rTotal - rChip})`)
        .toBeLessThanOrEqual(8);

      // and the whole difference is the reason's own wrap, nothing else
      expect(Math.abs((fTotal - rTotal) - (fChip - rChip)),
        `the card's height difference at ${w} is not accounted for by the `
        + "chip row").toBeLessThanOrEqual(8);

      // NON-VACUITY: a stub would satisfy neither, and a card that never
      // rendered would satisfy both. Both cards were drawn and both have
      // a real height.
      expect(rTotal, `the ranked card has a height at ${w}`).toBeGreaterThan(100);
      expect(fTotal, `the refused card has a height at ${w}`).toBeGreaterThan(100);
    }
  });

test("it carries the ranked card's blocks, in the ranked card's order",
  async ({ page }) => {
    await open(page);
    const c = refused(page);
    const chips = ["refused-rank", "refused-tag", "refused-kickoff"];
    /* THE READ BELOW THE CHIP ROW, top to bottom: matchup + anchor slot,
       dumbbell slot, Stage 1, Stage 2, and the admission chip.

       `refused-shape` IS NOT IN THIS LIST AND NO LONGER EXISTS. The shape
       chip and the tier trio each said `refused` separately, over three
       stacked labels; they are ONE span now — `refused-tiers`, carrying
       `data-shape-refused` and reading `OVR ATK DEF SHAPE refused`. Every
       axis is still NAMED (asserted below); the fact is said once. That
       is a block this card no longer spends, which is how it came to the
       same height as a ranked one.

       AND THE ADMISSION CHIP SHARES STAGE 2's ROW rather than opening a
       block of its own, beside the fold marker and the circled i — where
       a ranked card keeps its tiers and its own i. */
    const order = ["anchor-block", "refused-dumbbell", "refused-rank-pair",
                   "refused-ppg", "refused-gp", "refused-tiers",
                   "refused-admission"];
    await expect(c.getByTestId("refused-shape"),
      "the shape chip merged into refused-tiers and must not come back "
      + "as a second slot saying the same word").toHaveCount(0);
    // the REASON stands where the rank number would be — the one thing
    // neither the `#refused` tag nor the axes row says
    await expect(c.getByTestId("refused-rank")
      .getByTestId("refusal-reason")).toHaveCount(1);
    for (const id of [...chips, ...order]) {
      await expect(c.getByTestId(id), `${id} is drawn`).toHaveCount(1);
    }
    const box = async (id: string) => (await c.getByTestId(id).boundingBox())!;
    const card = (await c.boundingBox())!;

    /* THE CHIP ROW IS A ROW, NOT A SEQUENCE. Its items wrap onto a second
       line in a narrow track, so asserting them in order would be
       asserting a layout that is allowed to change. What is NOT allowed
       to change is where the DATE lands: topmost and rightmost, which is
       the operator's own rule from #55 and the reason the chips and the
       date are two boxes here rather than one wrapping row. */
    for (const id of chips) {
      const b = await box(id);
      expect(b.y - card.y, `${id} is in the card's top band`)
        .toBeLessThan(card.height * 0.25);
    }
    const kick = await box("refused-kickoff");
    for (const id of ["refused-rank", "refused-tag"]) {
      const b = await box(id);
      expect(kick.y, `the kickoff is at or above ${id}`)
        .toBeLessThanOrEqual(b.y + 1);
      expect(kick.x, `the kickoff is right of ${id}`).toBeGreaterThan(b.x);
    }

    /* AND THE BLOCKS BELOW IT ARE A SEQUENCE. The tolerance is for
       siblings on one baseline row — the tier trio and the shape chip
       share a line, and a row laid out `items-end` puts a shorter item a
       few pixels LOWER in the flow than a taller one beside it. 6px is
       under half the shortest block here, so a block that genuinely
       moved above its predecessor still fails. */
    const tops = await Promise.all(order.map(async (id) => (await box(id)).y));
    for (let i = 1; i < tops.length; i++) {
      expect(tops[i], `${order[i]} sits at or below ${order[i - 1]}`)
        .toBeGreaterThanOrEqual(tops[i - 1] - 6);
    }
    expect(tops[0], "the read starts below the chip row")
      .toBeGreaterThan(kick.y);
  });

// ────────────────────────────────────── 2. and it is unmistakable ────

test("the tag says #refused in words, and the border is a highlight rather "
  + "than damage", async ({ page }) => {
    await open(page);
    const c = refused(page);
    await expect(c.getByTestId("refused-tag")).toHaveText("#refused");

    const style = await c.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.borderTopStyle, width: s.borderTopWidth,
               color: s.borderTopColor, shadow: s.boxShadow };
    });
    /* ONE FINDINGS LIST, so a border that broke two of these rules at
       once reports both rather than hiding the second behind the first.
       Every check below is on the COMPUTED INK, never on a class name,
       so a restyle cannot quietly re-borrow a colour it is not allowed. */
    const findings: string[] = [];
    // SOLID, not dashed. A dashed border is this system's vocabulary for
    // a placeholder (the rest-day cell IS one) and this card is full of
    // measured numbers. The operator's word was "highlighted", and the
    // treatment it replaced — dashed, amber — read as damage.
    if (style.style !== "solid")
      findings.push(`border is ${style.style}, not solid`);
    // and it is genuinely lit rather than merely bordered
    if (style.shadow === "none") findings.push("border carries no highlight");
    // NEITHER GOLD NOR THE TRAFFIC LIGHT. Gold (#f5c542) is the brand and
    // rank 01; --warn (#fbbf24), --up (#34d399) and --neg (#f87171) are
    // verdicts about a fixture, and a refusal is a statement about the
    // BOARD'S COVERAGE, not a judgement on the match.
    const ink = `${style.color} ${style.shadow}`.toLowerCase();
    for (const banned of [
      ["gold/brand", [245, 197, 66]], ["warn", [251, 191, 36]],
      ["up", [52, 211, 153]], ["neg", [248, 113, 113]],
    ] as const) {
      const [name, [r, g, b]] = banned;
      if (ink.includes(`${r}, ${g}, ${b}`))
        findings.push(`the highlight borrows ${name}: ${ink}`);
    }
    expect(findings).toEqual([]);
  });

test("there is NO rank number — a refused row is not in the ladder",
  async ({ page }) => {
    await open(page);
    // the ranked card has one; the refused card's slot says so instead
    await expect(ranked(page).first().getByTestId("row-rank"))
      .toHaveText("01");
    await expect(refused(page).getByTestId("row-rank")).toHaveCount(0);
    const slot = refused(page).getByTestId("refused-rank");
    /* WHAT STANDS IN THE LADDER'S PLACE, and why it is no longer the
       words "rank refused". Those two words were a THIRD copy of a fact
       the `#refused` tag beside them and the axes row below them both
       carry. The REASON stands there now — the one thing neither of them
       says — and the slot's own hover keeps the ladder sentence, so the
       claim "this row is not in the ladder" is still made in the ladder's
       own place, by the slot, the tag and the title together. */
    await expect(slot.getByTestId("refusal-reason"))
      .toHaveText(FULL.reason);
    // `toHaveAttribute` retries for 15s and can wait out a transient;
    // this title is fixed at render, so read it once and assert on it.
    const says = (await slot.getAttribute("title")) ?? "";
    expect(says).toContain("no position in the day's ladder");
    expect(says).toContain("A number here would be a placement nobody "
      + "measured");
    // and the status is still said in WORDS, beside it, for a reader who
    // never hovers
    await expect(refused(page).getByTestId("refused-tag"))
      .toHaveText("#refused");
    /* AND NO LADDER POSITION HIDING ANYWHERE IN THAT SLOT. The fixture's
       reason carries no digit of its own, which is what makes the sweep
       below mean "no number" rather than "no number that isn't already
       in the reason" — stated here so the check cannot quietly become
       unfalsifiable behind a reason string that grows one. */
    expect(FULL.reason, "this fixture's reason carries a digit, so the "
      + "sweep below no longer proves the slot prints no rank")
      .not.toMatch(/\d/);
    expect(await slot.innerText()).not.toMatch(/\d/);
  });

test("every comparison cell is refused BY NAME, in the cell where the "
  + "number would be", async ({ page }) => {
    await open(page);
    const c = refused(page);
    /* THE SLOTS THAT PRINT THE WORD, DERIVED FROM THE CARD rather than
       typed beside it — a hand-typed list stays green the day a slot
       stops saying it. Every `data-refused` on the card is read back and
       the SET is asserted, so a slot that vanished fails here and a slot
       that appeared has to be named here too.

       THREE SLOTS PRINT THE WORD NOW, NOT SIX, AND NOTHING MEASURED WENT
       WITH THE OTHER THREE:
         - the RANK GAP cell is gone. The card's own header said "rank
           refused" in the ladder's place and the gap cell said it again
           one row down; a second copy of a fact is the copy that rots.
         - the SHAPE chip merged into the tier span, which names all four
           axes and says the word once (asserted below).
         - the RANK SLOT carries the REASON now, which is the thing the
           `#refused` tag and the axes row do not say. It is still marked
           — `refused-tag`, in words — and its hover still gives the
           ladder sentence; both are pinned in the test above.
       The ranks PAIR keeps its `data-refused` mark because the GAP
       between two positions in two orderings is what was refused, while
       the positions themselves are measured and printed. */
    await expect(c.locator("[data-refused]").first()).toBeAttached();
    const marks = await c.locator("[data-refused]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-refused")!));
    expect([...marks].sort(),
      "the set of refused slots on the card")
      .toEqual(["anchor", "dumbbell", "rank-pair", "tiers"]);
    for (const what of ["anchor", "dumbbell", "tiers"]) {
      const cell = c.locator(`[data-refused="${what}"]`);
      await expect(cell, `the ${what} cell exists`).toHaveCount(1);
      await expect(cell, `the ${what} cell says refused`)
        .toContainText("refused");
    }
    // the anchor's KEY still names which figure is gone — "refused" alone
    // would say a figure is missing without saying which
    await expect(c.getByTestId("anchor-key")).toHaveText("gd/g gap");
    /* AND THE MERGED SPAN STILL NAMES EVERY AXIS. This is the whole of
       what the trio and the shape chip said between them: a reader has
       to know WHICH figures are gone, and the fourth name is the one the
       separate `refused-shape` chip used to carry. */
    const tiers = c.getByTestId("refused-tiers");
    for (const axis of ["ovr", "atk", "def", "shape"]) {
      await expect(tiers, `the axes row names ${axis}`).toContainText(axis);
    }
    await expect(tiers).toHaveAttribute("data-shape-refused", "1");
    // said ONCE, not four times: the word appears a single time in the span
    expect(((await tiers.innerText()).match(/refused/gi) ?? []).length,
      "the axes row says `refused` once for four named axes").toBe(1);
    /* THE RULE IS SAID ONCE, NOT SIX TIMES — AND IT IS THE BACKEND'S
       SENTENCE (2026-09-11). This assertion read
       `/measured on different scales/i` until then, and what it pinned
       was a paragraph THIS FILE'S SOURCE wrote while
       `refusal.withheld` — authored by the module that made the
       decision, and naming the seven figures rather than gesturing at
       them — sat on the same payload unread. Two authors for one fact
       is how a frontend goes on asserting a rule the backend has moved,
       which is exactly what `refusal-reason` below already avoids by
       quoting.

       THE EXPECTED TEXT IS THE FIXTURE'S OWN CONSTANT, not a literal:
       the fixture speaks the emitter's vocabulary, so a reader that
       re-paraphrases fails this whatever words it chooses. */
    /* IT LIVES BEHIND THE CIRCLED i NOW. All of this card's prose moved
       into `refusal-notes`; `refused-rule` is that panel's "what is
       withheld" section. `data-source` went with the move, and what
       replaced it is better than an attribute: the section that quotes
       the payload OPENS with the word `Withheld`, and the file's own
       fallback opens "REFUSED, not missing" — so a reader, not only a
       guard, can tell whose sentence they are being shown. Both halves
       are asserted, here and in the fallback test below. */
    await expect(c.getByTestId("refused-rule")).toHaveCount(1);
    await expect(c.getByTestId("refused-rule")).toContainText("Withheld —");
    await expect(c.getByTestId("refused-rule")).toContainText(WITHHELD);
    /* AND IT TRAVELS WITH EVERY CELL THAT PRINTS THE WORD — the same
       sentence, never a second account of one refusal. The set is the
       `Refused` component's own (`refused-cell`) plus the three slots
       that print the word inline, so it is derived from what rendered
       rather than from a list typed here. Anchored on a visible first
       match before `evaluateAll`, which does not auto-wait. */
    await expect(c.getByTestId("refused-cell").first()).toBeVisible();
    const said = await c.getByTestId("refused-cell")
      .evaluateAll((els) => els.map((e) => e.getAttribute("title")));
    expect(said.length, "no refused cell rendered — this loop would "
      + "pass over an empty set").toBeGreaterThan(0);
    for (const t of said) expect(t).toBe(WITHHELD);
    for (const slot of ["refused-dumbbell", "refused-tiers"]) {
      await expect(c.getByTestId(slot))
        .toHaveAttribute("title", WITHHELD);
    }
    /* THE CASE'S OWN SENTENCE, which is a different fact from
       `withheld`: what THIS refusal can honestly carry, versus what no
       refusal ever carries. It is the panel's "why this case" section
       now; `data-case` moved off the element with the prose, so the
       sentence itself — the payload's, verbatim — is the assertion. */
    await expect(c.getByTestId("refused-case"))
      .toContainText(FULL.refusal.why);
    /* A RANKED CARD CAN NEVER SAY ANY OF THIS — which is what makes the
       two unmistakable even cropped to their middles, with the border
       out of frame. Both the card ELEMENT and its descendants, because
       an attribute smuggled onto the `<article>` itself is not a
       descendant of it and a selector that only looked inside would
       miss exactly that. */
    await expect(page.locator(
      '[data-testid="picker-row"][data-refused],'
      + ' [data-testid="picker-row"] [data-refused]')).toHaveCount(0);
    expect(await ranked(page).first().innerText()).not.toMatch(/refused/i);
  });

test("the ranks pair prints the rank that EXISTS and names the absence of "
  + "the other — never half a pair", async ({ page }) => {
    await open(page);
    const pair = refused(page).getByTestId("refused-rank-pair");
    // Sunderland resolved and is #12; Promoted Rovers FC has no row at
    // all, so it has no position. Both halves are stated.
    await expect(pair).toHaveText("#12 v no rank");
    await expect(pair).toHaveAttribute("data-opp-rank", "12");
    expect(await pair.innerText()).not.toContain("—");
  });

// ───────────────────────────── 3. what is measured is drawn, in place ─

test("the measured cells are FILLED: kickoff, both clubs, both form strips, "
  + "games played, the book and the watch control", async ({ page }) => {
    await open(page);
    const c = refused(page);

    // the kickoff, top right, exactly as a ranked card places it
    const date = c.getByTestId("refused-kickoff");
    await expect(date).toContainText(/\w{3},? \d/);
    const box = (await date.boundingBox())!;
    const card = (await c.boundingBox())!;
    expect(box.x + box.width).toBeGreaterThan(card.x + card.width * 0.6);
    expect(box.y - card.y).toBeLessThan(card.height * 0.25);

    // both clubs, with the venue label on the side it is about
    await expect(c).toContainText("Sunderland");
    await expect(c).toContainText("Promoted Rovers FC");
    await expect(c.getByTestId("refused-venue")).toHaveText("H");

    // both form strips — the payload spells one as a list and one as a
    // string, and a serialisation choice must not cost a club its form
    await expect(c.getByTestId("form-strip")).toHaveCount(2);
    await expect(c.getByTestId("form-strip").first())
      .toHaveAttribute("aria-label", /Sunderland .*W D L W W/);
    await expect(c.getByTestId("form-strip").nth(1))
      .toHaveAttribute("aria-label", /Promoted Rovers FC .*L W W D W/);

    // games played, per side, from the two different sources they come
    // from — 6 is the refused club's, 4 the club that resolved
    const gp = c.getByTestId("refused-gp");
    await expect(gp).toHaveText("gp 4/6");
    await expect(gp).toHaveAttribute("data-home-gp", "4");
    await expect(gp).toHaveAttribute("data-away-gp", "6");

    // the market line, in the same cell a ranked card uses
    await expect(c).toContainText("ask 71¢");
    await expect(c).toContainText("spread 5¢");
    await expect(c).toContainText("size 90");

    // and the watch control, which the stub never had
    await expect(c.getByTestId("watch-toggle")).toHaveCount(1);
    await expect(c.getByTestId("watch-toggle"))
      .toHaveAttribute("data-event", "401879999");
  });

test("ppg is CONVERTED from a gap to the two sides' own rates, labelled, "
  + "with no difference anywhere", async ({ page }) => {
    await open(page);
    /* A ranked card prints `ppg +0.53` — the two clubs' rates
       SUBTRACTED. That subtraction is the refused act, so the refused
       card prints the two rates themselves. Both are real, both are
       measured this season, and neither is derived from the other. */
    await expect(ranked(page).first()).toContainText(/ppg\s*\+0\.53/);

    /* `ppg H 1.25 · A 1.30` BECAME `ppg 1.25/1.50` (2026-09-15). Same
       two measured values, same order — home over away — and the labels
       did not vanish: they moved to the title, which spells both club
       names out rather than abbreviating them. The cell that carried
       them inline was the one pushing this row onto a second line while
       the ranked card beside it sat on one. */
    const cell = refused(page).getByTestId("refused-ppg");
    await expect(cell).toHaveText("ppg 1.25/1.50");
    await expect(cell).toHaveAttribute("data-home-ppg", "1.25");
    await expect(cell).toHaveAttribute("data-away-ppg", "1.5");
    /* AND BOTH ARE STILL LABELLED — which club owns which rate, said in
       the payload's own club names and readable without hovering the
       other cells. An unlabelled pair is two numbers and a guess. */
    const label = (await cell.getAttribute("title")) ?? "";
    expect(label).toContain("Sunderland 1.25 points per game");
    expect(label).toContain("Promoted Rovers FC 1.50 points per game");
    // the ORDER on the card is the order in the title, so the pair can
    // be read off the ink without opening anything
    expect(label.indexOf("Sunderland")).toBeLessThan(
      label.indexOf("Promoted Rovers FC"));
    // NO DIFFERENCE IS PRINTED. A signed figure in this cell would be
    // the cross-scale subtraction the whole card refuses, and 1.50−1.25
    // = +0.25 is exactly the number a careless restyle would reach for.
    const text = await cell.innerText();
    expect(text).not.toMatch(/[+−-]\s*\d/);
    expect(text).not.toContain("0.25");
    // both values are present, in the home-then-away order the card's
    // own vocabulary uses six lines up
    expect(text).toMatch(/1\.25\s*\/\s*1\.50/);
  });

test("the admission countdown says when the refusal ends, in the backend's "
  + "own words", async ({ page }) => {
    await open(page);
    /* THE ONE LINE A RANKED CARD DOES NOT HAVE. A refusal with no stated
       end reads as a permanent verdict on a club; it is a gate on games
       played, and the board knows the number. */
    /* IT IS A CHIP IN STAGE 2's ROW NOW, not a block of its own — the
       countdown, the fold marker and the circled i share the line a
       ranked card spends on its tiers. The FIGURE a reader needs at a
       glance is the one that changes every week, so that is what the
       chip prints; the arithmetic behind it rides the hover and the
       panel, where the rest of this card's prose went. */
    const c = refused(page);
    const a = c.getByTestId("refused-admission");
    await expect(a).toHaveText("4 to go");
    await expect(a).toHaveAttribute("data-k", "10");
    await expect(a).toHaveAttribute("data-gp", "6");
    await expect(a).toHaveAttribute("data-to-go", "4");
    // the arithmetic, and the gate itself in the policy's own words
    const gate = (await a.getAttribute("title")) ?? "";
    expect(gate).toContain("rated at 10 games");
    expect(gate).toContain("played 6");
    expect(gate).toMatch(/w_current = GP\/\(GP\+k\)/);
    // the backend's own sentence, verbatim — not a paraphrase free to
    // drift from the policy it came from
    const says = c.getByTestId("admission-says");
    await expect(says).toContainText("It has played 6; 4 to go.");
    // with the arithmetic under it, and the basis it will be rated on
    await expect(says).toContainText("rated at 10 games · played 6");
    await expect(says).toContainText("then rated on · current_only");
    // a ranked card has neither the chip nor the section
    await expect(ranked(page).first().getByTestId("refused-admission"))
      .toHaveCount(0);
    await expect(ranked(page).first().getByTestId("admission-says"))
      .toHaveCount(0);
  });

// ───────────────────────── 4. missing is never zero, on every branch ──

test("a board that predates the contract names every absence, and renders "
  + "no zero, dash or blank anywhere", async ({ page }) => {
    /* THE BACKEND HALF OF THIS CHANGE IS A SEPARATE PR, so this shape is
       what production serves until it lands — not a hypothetical. Every
       optional key is gone and the card has to be HONEST on it, which is
       a stronger requirement than not crashing. */
    await open(page, [BARE]);
    const c = refused(page);

    /* THE ABSENT BLOCKS SAY THEY ARE ABSENT — with ONE gone, and it is
       reported rather than quietly dropped from this guard.

       THE CLAIM THAT NO LONGER HOLDS: an absent admission countdown used
       to draw its own named absence — `refused-admission` with
       `data-absent="1"`, reading "This refusal carries no admission
       countdown, so the board cannot say here how many games away this
       club is from being rated." The 2026-09-15 rebuild made the
       countdown a chip (`{adm && …}`), so a payload with no admission
       block now draws NOTHING in its place. The card's own doc comment
       still promises "a sentence for an admission block that is not
       there at all", so this is a slip rather than a decision — reported
       to the operator, not papered over here. Absent-by-design reading
       as vanished is the defect this whole surface exists to refuse.

       What IS still asserted is that nothing invents a countdown. */
    await expect(c.getByTestId("refused-admission")).toHaveCount(0);
    expect(await c.innerText(), "a card with no admission block must not "
      + "print a countdown it was never sent").not.toMatch(/to go|rated at/i);
    await expect(c.getByTestId("refused-no-market"))
      .toContainText(/did not say whether Kalshi lists/i);
    // an absent form strip is simply not drawn — a strip of five empty
    // slots would be a club with five unplayed games
    await expect(c.getByTestId("form-strip")).toHaveCount(0);

    // the unsent NUMBERS say they were not sent, rather than reading 0
    await expect(c.getByTestId("refused-gp"))
      .toHaveText("gp not stated/not stated");
    await expect(c.getByTestId("refused-ppg"))
      .toHaveText("ppg not stated/not stated");
    // with no opponent_row there is no rank to print, and the cell says
    // that rather than inventing one or printing half a pair. "not
    // stated" and "no rank" are DIFFERENT facts and stay apart: one club
    // has a rank the payload did not send, the other has no rank at all.
    await expect(c.getByTestId("refused-rank-pair"))
      .toHaveText("not stated v no rank");

    /* AND THE ABSOLUTE RULE, SWEPT OVER EVERY FIGURE-BEARING CELL: not
       one of them may render a bare zero, a dash, or nothing at all.
       Cell by cell rather than over the card's whole text, because the
       card's PROSE legitimately contains an em-dash ("Promoted Rovers FC
       — no row in…") and a rule that could not tell punctuation from a
       placeholder would be unfalsifiable.

       IT REPORTS AN EMPTY LIST rather than failing on the first cell, so
       a second offending cell arrives as its own sentence in the failure
       instead of hiding behind the first one. */
    const findings: string[] = [];
    for (const id of ["refused-rank", "anchor-block", "refused-dumbbell",
                      "refused-rank-pair", "refused-ppg", "refused-gp",
                      "refused-tiers"]) {
      const t = (await c.getByTestId(id).innerText()).trim();
      if (t === "") findings.push(`${id} is empty`);
      if (/[—–]/.test(t)) findings.push(`${id} renders a dash: "${t}"`);
      if (/(^|[^\d.])0(\.0+)?([^\d]|$)/.test(t))
        findings.push(`${id} renders a bare zero: "${t}"`);
    }
    expect(findings).toEqual([]);
    // the refused slots are still all present and still all named, and
    // the axes row still names every axis on a payload that carried none
    // of them
    await expect(c.locator("[data-refused]").first()).toBeAttached();
    const marks = await c.locator("[data-refused]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-refused")!));
    expect([...marks].sort())
      .toEqual(["anchor", "dumbbell", "rank-pair", "tiers"]);
    for (const axis of ["ovr", "atk", "def", "shape"]) {
      await expect(c.getByTestId("refused-tiers")).toContainText(axis);
    }
  });

test("the blocks a refusal cannot carry are named, each with the "
   + "backend's own sentence for why", async ({ page }) => {
    /* `carries` and `absent` are DERIVED upstream from REFUSAL_BLOCKS
       against the row itself — "a hand-written list of what this reason
       carries is a list that stays green while the case it forgot
       drifts", in the emitter's own words. The card reads them for the
       same reason: a season block missing under an AMBIGUOUS name is a
       decision ("printing a candidate's season would attribute some
       other club's football to this fixture"), not a card that forgot
       to draw one, and only the payload knows which. */
    await open(page, [AMBIGUOUS]);
    const c = refused(page);
    /* THE PROSE IS BEHIND THE CIRCLED i (2026-09-15). These were blocks
       on the card's face with `data-case`, `data-carries` and one `li`
       per absent block; they are sections of `refusal-notes` now, and
       the attributes went with the markup. So the assertions are on the
       SENTENCES — the payload's own, which is what the reader is being
       shown and what a drifting frontend would stop quoting. Opened
       first, because a claim about what a reader can read should be made
       against a panel a reader has opened. */
    await c.getByTestId("refusal-why-open").click();
    await expect(c.getByTestId("refusal-notes")).toBeVisible();

    const why = c.getByTestId("refused-case");
    await expect(why).toContainText(AMBIGUOUS.refusal.why);

    /* EACH ABSENT BLOCK, NAMED, WITH THE BACKEND'S OWN SENTENCE FOR WHY.
       Derived from the payload's keys: a list typed here would stay
       green the day the emitter adds a block this card never draws. */
    const absent = c.getByTestId("refused-absent");
    const blocks = Object.entries(AMBIGUOUS.refusal.absent);
    expect(blocks.length, "the payload carries no absent blocks to check")
      .toBe(2);
    for (const [block, words] of blocks) {
      await expect(absent, `${block} is named as absent`)
        .toContainText(block);
      await expect(absent, `${block} carries the backend's sentence`)
        .toContainText(words);
    }
    // the sentence naming what NO refusal carries is a different fact
    // and is still said, once, in its own slot
    await expect(c.getByTestId("refused-rule")).toContainText(WITHHELD);
  });

test("a board that ships no refusal block says so — the card falls back "
   + "and marks the fallback as its own", async ({ page }) => {
    /* THE HONEST HALF OF QUOTING A PAYLOAD: a board built before the
       contract carries none of it, and the card must not present its
       own fallback as the backend's sentence. `data-source` is what
       separates them, and the two case blocks are absent rather than
       invented. */
    await open(page, [BARE]);
    const c = refused(page);
    /* `data-source` MOVED INTO THE READER'S OWN VIEW. The panel's "what
       is withheld" section opens with `Withheld —` when it is quoting
       the payload and with "REFUSED, not missing" when it is this file's
       named fallback, so the two are told apart by anyone reading them
       rather than only by a guard reading an attribute. */
    await expect(c.getByTestId("refused-rule"))
      .toContainText("REFUSED, not missing");
    await expect(c.getByTestId("refused-rule")).not.toContainText("Withheld —");
    await expect(c.getByTestId("refused-rule")).not.toContainText(WITHHELD);
    await expect(c.getByTestId("refused-case")).toHaveCount(0);
    await expect(c.getByTestId("refused-absent")).toHaveCount(0);
    // and the fallback still travels with every cell that prints the
    // word, so one card never shows two accounts of one refusal
    await expect(c.getByTestId("refused-cell").first()).toBeVisible();
    const said = await c.getByTestId("refused-cell")
      .evaluateAll((els) => els.map((e) => e.getAttribute("title")));
    expect(said.length).toBeGreaterThan(0);
    expect(new Set(said).size, "one card, one account of its refusal")
      .toBe(1);
  });

test("a refusal with no kickoff says so in the date's own slot",
  async ({ page }) => {
    await open(page, [{ ...FULL, kickoff: undefined }]);
    await expect(refused(page).getByTestId("refused-kickoff"))
      .toHaveText("no kickoff");
    await expect(refused(page)).toHaveAttribute("data-dated", "0");
  });

test("a refusal with no event id keeps the control's slot and says what is "
  + "missing", async ({ page }) => {
    await open(page, [{ ...FULL, event_id: undefined }]);
    await expect(refused(page).getByTestId("watch-toggle")).toHaveCount(0);
    await expect(refused(page).getByTestId("refused-no-watch"))
      .toContainText(/no event id/i);
  });

test("a null kalshi block is a DIFFERENT silence from an absent one",
  async ({ page }) => {
    /* `kalshi: null` is the board saying it looked and matched no event.
       A payload with no `kalshi` key never said anything about the
       market at all. Printing the first over the second would be this
       card making a claim on the backend's behalf. */
    await open(page, [{ ...FULL, kalshi: null }]);
    await expect(refused(page)).toContainText("no kalshi event");
    await expect(refused(page).getByTestId("refused-no-market"))
      .toHaveCount(0);
  });

// ──────────────────────────────── 5. the placement does not change ────

test("it still sits in its own matchday band, beside that day's ranked "
  + "cards", async ({ page }) => {
    /* The operator asked for this on 2026-09-07 and nothing here
       supersedes it: a refusal is a fixture that will be played at a
       known time, so it belongs on its own date rather than swept to a
       block at the column's foot. */
    await open(page);
    const day = localDayOf(FULL.kickoff);
    const band = epl(page).locator(`[data-testid="day-track"][data-day="${day}"]`);
    await expect(band.getByTestId("picker-refusal")).toHaveCount(1);
    await expect(band.getByTestId("picker-row")).toHaveCount(1);
    await expect(epl(page).getByTestId("refusals")).toHaveCount(0);
    /* THE PER-COLUMN PARAGRAPH IS GONE, AND ITS SENTENCE IS NOT
       (operator, 2026-09-15: "remove the paragraph below it and put it
       into the same hovering i symbol"). `RefusalWhy` printed the general
       rule once per column, under the first refused card a reader met —
       four lines of prose at a distance from the card it explained, on a
       board that scrolls sideways. It is the FIRST section of every
       refused card's own panel now, which is nearer the card and costs
       nothing until asked for.

       RESTATED 2026-09-16 — WHAT MOVED IS WHOSE SENTENCE IT IS. This
       pinned `refusal-rule-general` first, and its two phrases: "cannot
       be ranked against one that has a row" and "refuses it by name
       instead of imputing a number". That section was a paragraph
       PickerColumn.tsx wrote, hung unconditionally over EVERY refusal,
       and its claim — one club has no row — is false of the
       `no_shared_scale` refusal added on 2026-09-14, where both clubs
       are rated. So it is deleted rather than reworded: the payload has
       carried a general sentence that is true under every reason since
       2026-09-11, and `refused-rule` quotes it.

       THE CLAIM THIS TEST MAKES IS UNCHANGED. A reader who opens the i
       still meets a general account of the refusal FIRST, before the
       case, the absent blocks and the detail. Only the author changed,
       and the text is now read off the fixture — so it cannot drift into
       a false paraphrase again, which is the failure being fixed. */
    await expect(epl(page).getByTestId("refusal-why")).toHaveCount(0);
    const panel = refused(page).getByTestId("refusal-notes");
    const first = await panel.evaluate((el) =>
      el.querySelector("[data-testid]")!.getAttribute("data-testid"));
    expect(first, "the general rule is the panel's FIRST section — a "
      + "reader meeting a refused card for the first time reads it first")
      .toBe("refused-rule");
    await expect(refused(page).getByTestId("refused-rule"))
      .toContainText("Withheld —");
    await expect(refused(page).getByTestId("refused-rule"))
      .toContainText(WITHHELD);
    /* AND NO SECOND GENERAL SENTENCE STANDS ANYWHERE ON THE CARD. The
       deleted one is named so a reader of this file can see which copy
       went, and the phrase is banned outright so re-adding it under a
       different id fails here too. */
    await expect(refused(page).getByTestId("refusal-rule-general"))
      .toHaveCount(0);
    await expect(refused(page))
      .not.toContainText("cannot be ranked against one that has a row");
    // the backend's own reason string survives on the card itself
    await expect(refused(page).getByTestId("refusal-reason"))
      .toContainText("no row in the prior-season top-flight table");
  });

// ───────────────── 6. the panel opens without React being there ──────

test("the i opens on HOVER with no JavaScript state — the panel is always "
   + "in the DOM and the hover is CSS", async ({ page }) => {
    /* THE THING THAT BROKE SILENTLY. `NotesPanel`'s panel used to be
       MOUNTED ONLY WHILE OPEN — `{open && <div …>}` — which meant it
       existed solely because React was running: correct in the app, and
       completely dead anywhere the markup is rendered without it. Hover
       and keyboard-focus are plain CSS on the wrapper now and the panel
       is always in the DOM; state only adds the PINNED case, which
       genuinely needs it. Nothing pinned that, and a revert would look
       identical in every other test in this file, because Playwright
       drives a browser with React attached and cannot tell the two
       mechanisms apart by hovering.

       SO THE PROOF IS A CLONE. `cloneNode(true)` copies the markup, the
       classes and the ids and copies NO event listeners — React's
       `onMouseEnter` does not travel. A clone parked in the page and
       hovered is the markup answering on its own. If the panel ever goes
       back to being state-mounted, the clone has no panel to show and
       this goes red; if the CSS rule is dropped, the clone stays shut. */
    await open(page);
    const c = refused(page);
    const panel = c.getByTestId("refusal-notes");

    // AT REST: in the DOM, and shut. Both halves matter — "attached" is
    // the half the old build failed, "hidden" is the half that keeps
    // this from passing on a panel that is simply always open.
    await expect(panel).toHaveCount(1);
    await expect(panel).toBeAttached();
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute("data-open", "hover");
    await expect(c.getByTestId("refusal-why-open"))
      .toHaveAttribute("aria-expanded", "false");

    /* THE MARKUP, ON ITS OWN. Parked at a fixed point with no React
       behind it; the mouse is then moved onto it for real, so what
       answers is the stylesheet. */
    const at = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="picker-refusal"]')!;
      const wrap = card
        .querySelector('[data-testid="refusal-why-open"]')!.parentElement!;
      const clone = wrap.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-detached-copy", "1");
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:40px;top:40px;z-index:9999";
      host.appendChild(clone);
      document.body.appendChild(host);
      const b = clone
        .querySelector('[data-testid="refusal-why-open"]')! .getBoundingClientRect();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    });
    const copy = page.locator(
      '[data-detached-copy="1"] [data-testid="refusal-notes"]');
    const display = () => copy.evaluate((e) => getComputedStyle(e).display);

    // it exists in the copy at all — a state-mounted panel would not
    await expect(copy).toHaveCount(1);
    expect(await display(), "the detached copy's panel is shut at rest")
      .toBe("none");

    await page.mouse.move(at.x, at.y);
    /* SETTLED MEANS TWO CONSECUTIVE READS AGREE. `evaluate` does not
       auto-wait, and a pointer move is not synchronous with a style
       recalc. */
    let prev = await display();
    for (let i = 0; i < 25 && !(prev === "block" && await display() === "block");
         i++) prev = await display();
    expect(prev, "the panel did not open on hover with no React behind it "
      + "— either the group-hover rule is gone or the panel is "
      + "state-mounted again").toBe("block");

    await page.mouse.move(5, 5);
    let off = await display();
    for (let i = 0; i < 25 && !(off === "none" && await display() === "none");
         i++) off = await display();
    expect(off, "the panel stayed open after the pointer left").toBe("none");

    /* AND THE RULE ITSELF, read out of the CSSOM — the mechanism named,
       not merely its effect. Tailwind puts utilities inside `@layer`, so
       the walk has to descend into grouping rules; a top-level scan
       finds nothing and would report "no rule" over a sheet that has
       one. */
    const rules = await page.evaluate(() => {
      const out: string[] = [];
      const walk = (rs: CSSRuleList) => {
        for (const r of Array.from(rs)) {
          const sr = r as CSSStyleRule;
          if (sr.selectorText && /group-hover|group-focus-within/
            .test(sr.selectorText) && /display:\s*block/.test(sr.style.cssText))
            out.push(sr.selectorText);
          const inner = (r as CSSGroupingRule).cssRules;
          if (inner) walk(inner);
        }
      };
      for (const s of Array.from(document.styleSheets)) {
        try { walk((s as CSSStyleSheet).cssRules); } catch { /* cross-origin */ }
      }
      return out;
    });
    expect(rules.some((r) => r.includes("group-hover")),
      `no group-hover rule shows the panel; found ${JSON.stringify(rules)}`)
      .toBe(true);
    // and the keyboard half, which is the same mechanism for a reader
    // who never touches a mouse
    expect(rules.some((r) => r.includes("group-focus-within")),
      "the panel has no focus-within rule, so a keyboard reader cannot "
      + "open it without pinning it").toBe(true);

    // CLICK IS THE ONLY THING STATE DOES. It pins, and the pin survives
    // the pointer leaving — which is exactly what CSS cannot do.
    await c.getByTestId("refusal-why-open").click();
    await expect(panel).toBeVisible();
    await expect(c.getByTestId("refusal-why-open"))
      .toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(5, 5);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-open", "pinned");
  });

test("no request left the mocks", async ({ page }) => {
  // a spec that silently reaches production is a spec whose result
  // depends on the weather — this proves the routes above cover the page
  const stray = await open(page);
  await page.waitForTimeout(500);
  expect(stray()).toEqual([]);
});

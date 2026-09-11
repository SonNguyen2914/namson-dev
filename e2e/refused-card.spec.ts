import { expect, test } from "@playwright/test";
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
 * WHAT THIS SPEC IS FOR. Three properties, none of which a prettier card
 * could quietly lose:
 *
 *   1. SAME FOOTPRINT. A refused card and a ranked card in one column are
 *      the same width and carry the same blocks in the same order, at
 *      390 and at 1280. That is what "a normal board" means.
 *   2. UNMISTAKABLE. `#refused` in words, a highlighted border that is
 *      neither dashed nor gold nor the traffic light, NO rank number, and
 *      the word `refused` standing in every comparison cell.
 *   3. MISSING IS NEVER ZERO — the rule this repo enforces absolutely.
 *      No cell on this card may render `0`, `0.00`, `—` or nothing at
 *      all. A refused figure says `refused`; an unsent figure says `not
 *      stated`; an absent block says it is absent, in a sentence.
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
  opponent_row: { club: "Sunderland", rank: 12, gp: 4, ppg: 1.25,
                  gf: 1.0, ga: 1.25, gdg: -0.25 },
  form: { home: ["W", "D", "L", "W", "W"], away: "LWWDW",
          scope: "Premier League", scope_is_cup: false },
  kalshi: {
    event_ticker: "KXEPLGAME-SAMPLE-SUNPRO",
    ticker: "KXEPLGAME-SAMPLE-SUNPRO-SUN",
    ask_c: 71, bid_c: 66, spread_c: 5,
    ask_size: 90, bid_size: 140, flags: [],
  },
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
    r.fulfill(json(STRIP)));
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
      // and it is a CARD, not a strip: a refused card's height is within
      // half of a ranked one's rather than a quarter of it
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

test("it carries the ranked card's blocks, in the ranked card's order",
  async ({ page }) => {
    await open(page);
    const c = refused(page);
    const chips = ["refused-rank", "refused-tag", "refused-kickoff"];
    // the read below the chip row, top to bottom: matchup + anchor slot,
    // dumbbell slot, Stage 1, Stage 2, and the admission block
    const order = ["anchor-block", "refused-dumbbell", "refused-rank-pair",
                   "refused-ppg", "refused-gp", "refused-tiers",
                   "refused-shape", "refused-admission"];
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
    await expect(slot).toContainText("rank");
    await expect(slot).toContainText("refused");
    // and no two-digit ladder position hiding anywhere in that slot
    expect(await slot.innerText()).not.toMatch(/\d/);
  });

test("every comparison cell is refused BY NAME, in the cell where the "
  + "number would be", async ({ page }) => {
    await open(page);
    const c = refused(page);
    /* THE FIVE THE OPERATOR NAMED, plus the rank gap that travels with
       them: the rank number, the anchor and its GD/g key, the dumbbell,
       the ranks pair, the shape chip and the tier trio. All of them are
       one fact — a comparison between two clubs measured on different
       scales — and each says so in its own slot rather than going
       blank. */
    const cells = ["rank", "anchor", "dumbbell", "rank-gap", "tiers",
                   "shape"];
    for (const what of cells) {
      const cell = c.locator(`[data-refused="${what}"]`);
      await expect(cell, `the ${what} cell exists`).toHaveCount(1);
      await expect(cell, `the ${what} cell says refused`)
        .toContainText("refused");
    }
    // the anchor's KEY still names which figure is gone — "refused" alone
    // would say a figure is missing without saying which
    await expect(c.getByTestId("anchor-key")).toHaveText("gd/g gap");
    // and the tier trio keeps its three axis names for the same reason
    const tiers = c.getByTestId("refused-tiers");
    for (const axis of ["ovr", "atk", "def"]) {
      await expect(tiers).toContainText(axis);
    }
    // the rule is said ONCE, not six times
    await expect(c.getByTestId("refused-rule")).toHaveCount(1);
    await expect(c.getByTestId("refused-rule"))
      .toContainText(/measured on different scales/i);
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

    const cell = refused(page).getByTestId("refused-ppg");
    await expect(cell).toHaveText("ppg H 1.25 · A 1.50");
    await expect(cell).toHaveAttribute("data-home-ppg", "1.25");
    await expect(cell).toHaveAttribute("data-away-ppg", "1.5");
    // NO DIFFERENCE IS PRINTED. A signed figure in this cell would be
    // the cross-scale subtraction the whole card refuses, and 1.50−1.25
    // = +0.25 is exactly the number a careless restyle would reach for.
    const text = await cell.innerText();
    expect(text).not.toMatch(/[+−-]\s*\d/);
    expect(text).not.toContain("0.25");
    // each side is labelled — an unlabelled pair is two numbers and a
    // guess about which club owns which
    expect(text).toMatch(/H\s*1\.25/);
    expect(text).toMatch(/A\s*1\.50/);
  });

test("the admission countdown says when the refusal ends, in the backend's "
  + "own words", async ({ page }) => {
    await open(page);
    /* THE ONE LINE A RANKED CARD DOES NOT HAVE. A refusal with no stated
       end reads as a permanent verdict on a club; it is a gate on games
       played, and the board knows the number. */
    const a = refused(page).getByTestId("refused-admission");
    await expect(a).toContainText("rated at 10 games");
    await expect(a).toContainText("played 6");
    await expect(a).toContainText("4 to go");
    await expect(a).toHaveAttribute("data-k", "10");
    await expect(a).toHaveAttribute("data-to-go", "4");
    // the backend's own sentence, verbatim — not a paraphrase free to
    // drift from the policy it came from
    await expect(a.getByTestId("admission-says"))
      .toContainText("It has played 6; 4 to go.");
    // and the gate itself, in the policy's words, on the figure it made
    await expect(a.locator("p", { hasText: "rated at 10 games" }))
      .toHaveAttribute("title", /w_current = GP\/\(GP\+k\)/);
    // a ranked card has no such block
    await expect(ranked(page).first().getByTestId("refused-admission"))
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

    // the absent blocks SAY they are absent
    await expect(c.getByTestId("refused-admission"))
      .toHaveAttribute("data-absent", "1");
    await expect(c.getByTestId("refused-admission"))
      .toContainText(/no admission countdown/i);
    await expect(c.getByTestId("refused-no-market"))
      .toContainText(/did not say whether Kalshi lists/i);
    // an absent form strip is simply not drawn — a strip of five empty
    // slots would be a club with five unplayed games
    await expect(c.getByTestId("form-strip")).toHaveCount(0);

    // the unsent NUMBERS say they were not sent, rather than reading 0
    await expect(c.getByTestId("refused-gp"))
      .toHaveText("gp not stated/not stated");
    await expect(c.getByTestId("refused-ppg"))
      .toHaveText("ppg H not stated · A not stated");
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
                      "refused-tiers", "refused-shape"]) {
      const t = (await c.getByTestId(id).innerText()).trim();
      if (t === "") findings.push(`${id} is empty`);
      if (/[—–]/.test(t)) findings.push(`${id} renders a dash: "${t}"`);
      if (/(^|[^\d.])0(\.0+)?([^\d]|$)/.test(t))
        findings.push(`${id} renders a bare zero: "${t}"`);
    }
    expect(findings).toEqual([]);
    // the refused cells are still all present and still all named
    for (const what of ["rank", "anchor", "dumbbell", "rank-gap", "tiers",
                        "shape"]) {
      await expect(c.locator(`[data-refused="${what}"]`)).toHaveCount(1);
    }
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
    // and the reason a refusal exists at all is still said once, per
    // column, where a reader first meets one
    await expect(epl(page).getByTestId("refusal-why")).toHaveCount(1);
    // the backend's own reason string survives on the card itself
    await expect(refused(page).getByTestId("refusal-reason"))
      .toContainText("no row in the prior-season top-flight table");
  });

test("no request left the mocks", async ({ page }) => {
  // a spec that silently reaches production is a spec whose result
  // depends on the weather — this proves the routes above cover the page
  const stray = await open(page);
  await page.waitForTimeout(500);
  expect(stray()).toEqual([]);
});

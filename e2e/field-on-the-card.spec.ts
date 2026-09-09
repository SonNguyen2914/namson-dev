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
  kalshi: null, current_only: null, form: null,
});

const BOARD = {
  generated_at: "2026-12-15T08:00:00Z", date: "20261215", days: 7,
  leagues: { ucl: meta },
  rows: [row(1, "Barcelona", "Feyenoord"),
         row(2, "Kairat Almaty", UNHELD)],
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

// ─────────────────────────────────────────────── 1. a tier is a SET ──

test("every band set on a card is drawn WHOLE — never its first member "
   + "alone", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-1");
    const tiers = c.getByTestId("field-tier");
    /* THE COUNT IS DERIVED: overall draws both clubs, and each of the
       two crossed legs draws an attack end and a defence end. A card
       that quietly stopped drawing one of them would otherwise pass
       every text assertion below. */
    await expect(tiers).toHaveCount(2 + 2 * 2);
    const drawn = await tiers.evaluateAll((els) => els.map((e) => ({
      set: e.getAttribute("data-tier-set"),
      text: (e.textContent || "").replace("†", "").trim(),
    })));
    for (const t of drawn) {
      const members = (t.set || "").split(",");
      // the payload's own set, joined — not a string typed in this file
      expect(t.text).toBe(members.join("·"));
      // and never the bare first member when the set has more than one:
      // that is the `OVR 1v1` defect exactly
      if (members.length > 1) expect(t.text).not.toBe(members[0]);
    }
  });

test("a set of ONE is still drawn as the set, not as a stronger claim",
  async ({ page }) => {
    /* The control for the test above. Barcelona is a single band on the
       overall axis and on defence; if a "collapse a one-member set to a
       number" shortcut ever appears it will look correct there and wrong
       nowhere else. */
    await openBoard(page);
    const single = card(page, "ucl-1").getByTestId("field-tier")
      .filter({ hasNot: page.locator("sup") })
      .and(page.locator('[data-tier-set="1"]'));
    await expect(single.first()).toHaveText("1");
  });

// ────────────────────────────────────── 2. the axes cross ────────────

test("the favourite's ATTACK is paired with the opponent's DEFENCE, and "
   + "back the other way", async ({ page }) => {
    await openBoard(page);
    const legs = card(page, "ucl-1").getByTestId("field-leg");
    await expect(legs).toHaveCount(2);
    const pairs = await legs.evaluateAll((els) => els.map((e) => ({
      side: e.getAttribute("data-side"),
      attacker: e.getAttribute("data-attacker"),
      defender: e.getAttribute("data-defender"),
    })));
    const r = BOARD.rows[0];
    expect(pairs).toEqual([
      { side: "fav", attacker: r.favourite, defender: r.opponent },
      { side: "opp", attacker: r.opponent, defender: r.favourite },
    ]);
    // and the ends really are read off the two DIFFERENT axes
    const fav = legs.filter({ has: page.locator('[data-side="fav"]') }).first();
    const sets = await fav.getByTestId("field-tier")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-tier-set")));
    expect(sets).toEqual([
      AXES.atk.rows.find((x) => x.club === r.favourite)!.tier_set.join(","),
      AXES.def.rows.find((x) => x.club === r.opponent)!.tier_set.join(","),
    ]);
  });

test("attack is never paired with attack — the side-by-side read this "
   + "replaces", async ({ page }) => {
    await openBoard(page);
    const legs = card(page, "ucl-1").getByTestId("field-leg");
    const n = await legs.count();
    for (let i = 0; i < n; i++) {
      const leg = legs.nth(i);
      // a leg's two ends are two different clubs, by construction
      const a = await leg.getAttribute("data-attacker");
      const d = await leg.getAttribute("data-defender");
      expect(a).not.toBe(d);
    }
  });

// ─────────────────────────────── 3. one fact, in the header, once ────

test("how to read a tier set is said ONCE for the whole column, and on no "
   + "card at all", async ({ page }) => {
    await openBoard(page);
    // it is behind the header's `i`, which has to be opened
    await expect(page.getByTestId("field-note")).toHaveCount(0);
    await page.getByTestId("col-notes-open").click();
    const note = page.getByTestId("field-note");
    await expect(note).toHaveCount(1);
    await expect(note).toContainText(/a tier is a set/i);
    await expect(note).toContainText(/attack faces the opponent/i);
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

// ───────────────────────────── 4. the eleven, marked subtly ──────────

test("a club below the floor carries a dagger and its REASON; one above "
   + "the floor carries neither", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-2");   // Kairat Almaty is below the floor
    const marks = c.getByTestId("field-floor-mark");
    await expect(marks.first()).toBeVisible();
    await expect(marks.first()).toHaveAttribute("title", FLOOR_NOTE);
    // and it is a mark, not an alert: no colour of its own, no words
    await expect(marks.first()).toHaveText("†");

    /* THE CONTROL. Every tier cell on the other card belongs to a club
       the floor accepted, so not one of them may carry the mark —
       otherwise "marked subtly" would be satisfied by marking everyone. */
    const clean = card(page, "ucl-1");
    await expect(clean.getByTestId("field-floor-mark")).toHaveCount(0);
    const flags = await clean.getByTestId("field-tier")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-below-floor")));
    expect(flags.every((f) => f === "false")).toBe(true);
  });

// ─────────────────── 5. missing is never zero, in both its shapes ────

test("a FAILED field read is named — once, for the column — and no card "
   + "draws a field at all", async ({ page }) => {
    await openBoard(page, null, 503);
    // not one card pretends to a reading
    await expect(page.getByTestId("field-cross")).toHaveCount(0);
    /* AND THE COLUMN SAYS WHY, IN THE BACKEND'S OWN WORDS. A named
       failure tells the reader something "could not load" does not, so
       the `detail` the server sent is carried through rather than
       replaced by the status code — the same contract `fetchBoard`
       keeps. */
    await page.getByTestId("col-notes-open").click();
    const err = page.getByTestId("field-error-note");
    await expect(err).toHaveCount(1);
    await expect(err).toContainText("field unavailable");
    /* AND IT DOES NOT ALSO EXPLAIN HOW TO READ A BLOCK THAT IS NOT
       THERE. The two notes are opposite facts and must never both be
       shown: instructions for a missing thing read as though the thing
       were merely elsewhere on the page. */
    await expect(page.getByTestId("field-note")).toHaveCount(0);
  });

test("a healthy read draws no failure note — the control", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("col-notes-open").click();
    await expect(page.getByTestId("field-error-note")).toHaveCount(0);
    await expect(page.getByTestId("field-cross"))
      .toHaveCount(BOARD.rows.length);
  });

test("a club the field does not hold is NAMED on its card, not left as a "
   + "blank half of a pair", async ({ page }) => {
    await openBoard(page);
    const c = card(page, "ucl-2");
    const missing = c.getByTestId("field-missing");
    await expect(missing).toBeVisible();
    await expect(missing).toContainText(UNHELD);
    await expect(missing).toContainText(/not a rating of\s+zero/i);
    // and no leg is drawn over the gap: half a leg invites the reader to
    // supply the other half
    await expect(c.getByTestId("field-leg")).toHaveCount(0);
    // the club that IS held keeps its overall standing, which is a fact
    // the field really does have
    await expect(c.getByTestId("field-tier")).toHaveCount(1);
  });

test("and a fixture whose clubs are BOTH held names nobody — the control",
  async ({ page }) => {
    await openBoard(page);
    await expect(card(page, "ucl-1").getByTestId("field-missing"))
      .toHaveCount(0);
  });

test("a competition with no field measured draws no block and no failure",
  async ({ page }) => {
    /* The third state, and the one that must not be folded into either
       of the other two: the read LANDED and there is no field. */
    await openBoard(page, { competition: "ucl", display: "UEFA Champions League",
                            axes: null, why_not: "nobody has measured it" });
    await expect(page.getByTestId("field-cross")).toHaveCount(0);
    await expect(page.getByTestId("picker-row"))
      .toHaveCount(BOARD.rows.length);
    const opener = page.getByTestId("col-notes-open");
    if (await opener.count() > 0) {
      await opener.click();
      await expect(page.getByTestId("field-note")).toHaveCount(0);
      await expect(page.getByTestId("field-error-note")).toHaveCount(0);
    }
  });

// ───────────────────────────── 6. the field's own page ───────────────

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
    for (const r of routes) {
      await page.goto(r);
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

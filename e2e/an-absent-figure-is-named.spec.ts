// AN ABSENT FIGURE IS NAMED — AND HALF A PAIR IS NOT A PAIR.
//
// Two rules this tree writes down in several places and then broke in
// several others, guarded here together because they fail as one defect:
// a mark that LOOKS like a figure, standing where a figure is missing.
//
//   * MISSING IS NEVER ZERO AND NEVER A BARE DASH. A dash is a
//     character in a number's slot. It reads as "this value is
//     unavailable" if you already know the column, and as a value if you
//     do not — and the words around it go on asserting that the quantity
//     exists and merely went missing.
//
//   * HALF A PAIR IS NOT A PAIR. `fieldApi` says it in capitals and the
//     backend enforces it outright: `club_strength_estimate` refuses to
//     combine two providers because that "would produce a number with no
//     referent". A comparison with one side filled in is the same
//     refusal one step earlier — and the reader supplies the missing
//     half themselves, which is the number they act on.
//
// THE CASE THAT MADE THIS CONCRETE. `MarketVsRead` gated its raw-elo
// line on an `||`, so one resolved side printed:
//
//     elo · Chelsea 1834 · Kawasaki — (clubelo)
//
// Three claims and two of them false: a dash standing in for a rating,
// and BOTH clubs attributed to ClubElo when ClubElo is precisely what
// does not hold the second one.
//
// AND A 200 IS NOT A PAYLOAD. The competition viewer read the field with
// its own `fetch(...).then(r => r.ok ? r.json() : reject)`, skipping the
// guard `fieldApi.fetchRatings` exists for. A `200 null` therefore
// produced `data=null, error=null` and `FieldAxes` returned null from
// `if (!data)` — the whole panel gone, with no message at all. That is
// the quietest failure on any of these surfaces: not a wrong number, but
// a page that looks complete while a section of it silently is not.
//
// NOTHING HERE IS A RECOMMENDATION. Every string asserted below
// describes what is known or what is missing; none tells a reader to do
// anything.

import { expect, test, type Page } from "@playwright/test";

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b),
});

/* ====================================================================
   1. A 200 null MAKES THE PANEL SAY SO, INSTEAD OF VANISHING
   ==================================================================== */

async function serveComp(page: Page, ratings: unknown, status = 200) {
  await page.route("**/api/comp/ucl/fixtures**", (r) =>
    r.fulfill(json({ competition: "ucl", display: "UEFA Champions League",
      fixtures: [], model: { state: "no_model_by_design",
        why: "a cup with qualifying rounds", note: null } })));
  await page.route("**/api/comp/ucl/markets**", (r) =>
    r.fulfill(json({ markets: [] })));
  await page.route("**/api/comp/ucl/ratings**", (r) => r.fulfill({
    status, contentType: "application/json", body: JSON.stringify(ratings),
  }));
}

test.describe("a 200 is not a payload, on the viewer as on the page", () => {
  /* THE DEFECT ITSELF. Before this, the panel simply was not there:
     `setRat(null)` with `ratErr` still null, and the component's
     `if (!data) return null`. No error box, no "nobody measured this",
     nothing — and nothing is the one state that genuinely means "the
     request has not answered yet". */
  test("a literal null body is NAMED, not rendered as an absent field",
    async ({ page }) => {
      await serveComp(page, null);
      await page.goto("/bet-suggester/comp/ucl");

      // The page itself still renders — this is about one panel.
      await expect(page.getByText("UEFA Champions League").first())
        .toBeVisible();

      const err = page.getByTestId("field-axes-error");
      await expect(err, "a 200 null must not be silence").toBeVisible();
      // The sentence is `fetchRatings`'s own, carried through
      // `readFailure`. It says there is NO PAYLOAD, which is the fact —
      // never that the competition has no field.
      await expect(err).toContainText(/no payload|could not be read/i);

      // AND IT MUST NOT CLAIM THE OTHER THING. "nobody has measured this
      // competition" is a statement about the measurement; this was a
      // statement about the request.
      await expect(page.getByTestId("field-axes-absent")).toHaveCount(0);
    });

  /* THE CONTROL, in both directions — without these the test above
     passes on a page that renders the error box unconditionally. */
  test("a real field still draws, unchanged", async ({ page }) => {
    await serveComp(page, {
      competition: "ucl", display: "UEFA Champions League", passes: "10",
      below_floor_clubs: [], below_floor_note: "n/a",
      axes_disagree_note: "the axes are read from two measurements",
      axes: {
        ovr: {
          axis: "ovr", label: "overall", bands: 5,
          distinguishable_levels: 6.12, unit: "elo",
          why_this_many_bands: "five bands, declared.",
          cuts: [1900, 1800, 1700, 1600], span: [1500, 2000],
          straddling: 0, placed: 1,
          rows: [{ rank: 1, club: "Alpha", league: "epl", value: 1960,
            half_width_95: 20, interval: [1940, 1980], tier: 1,
            tier_set: [1], straddles: false, below_floor: false,
            rate: null, floor_note: null }],
        },
      },
    });
    await page.goto("/bet-suggester/comp/ucl");
    await expect(page.getByTestId("field-axes")).toBeVisible();
    await expect(page.getByTestId("field-axes-error")).toHaveCount(0);
  });

  test("an UNMEASURED competition is its own fact, not an error",
    async ({ page }) => {
      await serveComp(page, {
        competition: "ucl", display: "UEFA Champions League", passes: "10",
        axes: null,
        why_not: "nobody has measured a cross-league field for this "
          + "competition — that is a gap in the evidence, not a claim "
          + "that its clubs have no rating",
      });
      await page.goto("/bet-suggester/comp/ucl");
      await expect(page.getByTestId("field-axes-absent")).toBeVisible();
      await expect(page.getByTestId("field-axes-absent"))
        .toContainText("nobody has measured");
      await expect(page.getByTestId("field-axes-error")).toHaveCount(0);
    });

  /* A NON-JSON 200 IS THE SAME CLASS OF LIE and reaches the same place.
     `fetchRatings` names the length of what came back, because "we got
     4,096 characters of something" is a different problem from "the
     server said no" and an operator acts on them differently. */
  test("a 200 whose body is not JSON is named as that", async ({ page }) => {
    await page.route("**/api/comp/ucl/fixtures**", (r) =>
      r.fulfill(json({ competition: "ucl", display: "UEFA Champions League",
        fixtures: [], model: { state: "no_model_by_design",
          why: "a cup", note: null } })));
    await page.route("**/api/comp/ucl/markets**", (r) =>
      r.fulfill(json({ markets: [] })));
    await page.route("**/api/comp/ucl/ratings**", (r) => r.fulfill({
      status: 200, contentType: "text/html", body: "<html>nope</html>",
    }));
    await page.goto("/bet-suggester/comp/ucl");
    await expect(page.getByTestId("field-axes-error")).toBeVisible();
  });
});

/* ====================================================================
   2. HALF A PAIR IS NOT A PAIR
   ==================================================================== */

/** THE ROW SHAPE THE CARD ACTUALLY READS. `AllFriendlies` loads
 *  `/api/friendlies/fixtures?days=N` — not the scoreboard/markets pair
 *  the ESPN board below it uses — and its `Row` carries `fixture_id`,
 *  `kickoff_utc` and `home`/`away` as objects. A fixture speaking the
 *  other endpoint's dialect renders nothing at all, silently. */
const ROW = (over: Record<string, unknown> = {}) => ({
  fixture_id: 1,
  kickoff_utc: new Date(Date.now() + 864e5).toISOString(),
  status: "NS",
  league_name: "Club Friendlies",
  venue: "Test Ground",
  home: { name: "Chelsea" }, away: { name: "Kawasaki" },
  goals: { home: null, away: null },
  /* BRIDGED ON PURPOSE. The board's "rated or priced" filter is ON by
     default and drops a row with neither a strength read nor a priced
     book — so a fixture testing the NO-strength case would vanish
     before it could be asserted against. */
  kalshi: { state: "bridged", event_ticker: "KXCLUBFGAME-TEST" },
  ...over,
});

/** The market-vs-read block. `available: true` because the raw-elo line
 *  under test only exists on the available branch — the unavailable one
 *  renders the backend's reason and stops. */
const MVR = {
  available: true,
  our_points_share: 0.62, market_points_share: 0.58,
  note: "this compares a rating read with the book's own prices.",
};

async function serveFriendlies(
  page: Page, strength: unknown, mvr: unknown = MVR,
) {
  await page.route("**/api/friendlies/fixtures**", (r) =>
    r.fulfill(json({
      fixtures: [ROW({ strength, market_vs_read: mvr })],
      count: 1, kalshi_only: [], kalshi_registry_read: true,
      finished_hidden: 0, kalshi_tradeable_total: 1, kalshi_listed_total: 1,
    })));
  // The ESPN board below is a different surface on the same page; stub
  // it empty so nothing here depends on a live backend.
  await page.route("**/api/friendlies/scoreboard", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/friendlies/markets", (r) =>
    r.fulfill(json({ fixtures: [], listed: null })));
  await page.route("**/api/friendlies/schedule**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/xg/friendlies**", (r) =>
    r.fulfill(json({ fixtures: [] })));
}

/** Open the fixture's disclosure so the card body is in the DOM. */
async function openCard(page: Page) {
  await page.goto("/bet-suggester/friendlies");
  const summary = page.locator("details summary").first();
  await expect(summary).toBeVisible();
  await summary.click();
}

const BOTH = {
  available: true, expected_points_share: { home: 0.62, away: 0.38 },
  source: "clubelo",
  home: { club: "Chelsea", rating: 1834, rated: true, source: "clubelo" },
  away: { club: "Kawasaki", rating: 1502, rated: true, source: "clubelo" },
};

test.describe("half a pair is not a pair", () => {
  test("both sides rated: the pair prints, with its source named",
    async ({ page }) => {
      await serveFriendlies(page, BOTH);
      await openCard(page);
      const pair = page.getByTestId("raw-elo-pair").first();
      await expect(pair).toBeVisible();
      await expect(pair).toContainText("1834");
      await expect(pair).toContainText("1502");
      await expect(page.getByTestId("raw-elo-refused")).toHaveCount(0);
    });

  /* THE DEFECT, BOTH WAYS ROUND. One side resolving is not a rarer
     version of two — it is a different fact, and it used to be printed
     in the shape of the first. */
  for (const [missing, strength] of [
    ["away", { ...BOTH, away: { club: "Kawasaki", rated: false,
      reason: "no_elo_coverage" } }],
    ["home", { ...BOTH, home: { club: "Chelsea", rated: false,
      reason: "no_elo_coverage" }, source: "clubelo" }],
  ] as const) {
    test(`only the ${missing === "away" ? "home" : "away"} side rated: `
      + "refused in words, and no number invented", async ({ page }) => {
      await serveFriendlies(page, strength);
      await openCard(page);

      const refused = page.getByTestId("raw-elo-refused").first();
      await expect(refused).toBeVisible();
      await expect(refused).toHaveAttribute("data-missing-side", missing);

      // THE PAIR LINE IS GONE. Not "gone and replaced by a quieter
      // pair" — gone.
      await expect(page.getByTestId("raw-elo-pair")).toHaveCount(0);

      // AND NO NUMBER IS PRINTED AT ALL — neither invented for the
      // missing side nor left standing alone for the resolved one.
      // Asserted as "no digit anywhere in the refusal" rather than as
      // "no dash": an em dash is sentence punctuation here and appears
      // all over this tree's prose. The rule was never about the
      // character, it is about a mark occupying a NUMBER'S SLOT, and
      // the way to say that is that the slot is not there.
      await expect(refused).toContainText(
        missing === "away" ? "Kawasaki" : "Chelsea");
      expect(await refused.innerText(),
        "the refusal must not carry a figure of any kind")
        .not.toMatch(/\d/);
    });
  }

  /* NEITHER SIDE: nothing to say and nothing said. Without this the
     refusal could be rendered unconditionally and still pass above. */
  test("neither side rated: the line is simply absent", async ({ page }) => {
    await serveFriendlies(page, {
      available: false, expected_points_share: null, source: "clubelo",
      home: { club: "Chelsea", rated: false, reason: "no_elo_coverage" },
      away: { club: "Kawasaki", rated: false, reason: "no_elo_coverage" },
    });
    await openCard(page);
    await expect(page.getByTestId("raw-elo-pair")).toHaveCount(0);
    await expect(page.getByTestId("raw-elo-refused")).toHaveCount(0);
  });

  /* A RATING OF ZERO IS A RATING. `!= null` rather than truthiness on
     each side — the check that would have quietly reclassified a real
     figure as a missing one. */
  test("a rating of 0 is printed, not refused", async ({ page }) => {
    await serveFriendlies(page, {
      ...BOTH,
      away: { club: "Kawasaki", rating: 0, rated: true, source: "clubelo" },
    });
    await openCard(page);
    await expect(page.getByTestId("raw-elo-pair").first()).toBeVisible();
    await expect(page.getByTestId("raw-elo-refused")).toHaveCount(0);
  });
});

/* ====================================================================
   3. NO DASH STANDS IN FOR A NUMBER ON THE FRIENDLIES TABLE
   ==================================================================== */

test.describe("an absent strength read is named", () => {
  /* NO `strength` KEY AT ALL — the case that answered with a bare dash
     six lines under a comment reading "never a dash standing in for a
     number". It is a different fact from the three named reasons below
     it: those are reads that HAPPENED and came back unusable, this is a
     fixture the board never attached a read to. */
  test("a fixture with no strength block says so", async ({ page }) => {
    /* `market_vs_read: null` on purpose: `StrengthCell` is drawn on the
       summary only where the market block is NOT available, because the
       grid otherwise carries its own read row and showing both put the
       RAW read beside the CALIBRATED one, both labelled ours. */
    await serveFriendlies(page, undefined, null);
    await page.goto("/bet-suggester/friendlies");
    const cell = page.getByTestId("strength-unattached").first();
    await expect(cell).toBeVisible();
    // NAMED, not marked. The old branch returned exactly "—".
    expect((await cell.innerText()).trim()).not.toBe("—");
    await expect(cell).toContainText(/no read attached/i);
  });

  test("a read that failed keeps its own named reason", async ({ page }) => {
    await serveFriendlies(page, {
      available: false, expected_points_share: null,
      home: { club: "Chelsea", rated: false, reason: "name_ambiguous",
        reason_words: "this name matches more than one club" },
      away: { club: "Kawasaki", rated: true },
    }, null);
    await page.goto("/bet-suggester/friendlies");
    await expect(page.getByText("ambiguous name").first()).toBeVisible();
    // and it is NOT the unattached case — the two are kept apart
    await expect(page.getByTestId("strength-unattached")).toHaveCount(0);
  });
});

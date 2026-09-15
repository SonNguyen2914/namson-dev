import { expect, test } from "@playwright/test";
import { TZ } from "../src/lib/matchday";

// THE PROSE ABOVE THE BOARD (2026-09-06 cut).
//
// The board opened with a three-line intro, a boxed multi-sentence
// explainer about the season blend, and a two-line note about timezones
// and caching — roughly a screen of paragraphs before the first fixture.
// Son: "there are lots of descriptions here, minimal use only."
//
// The cut had one rule and this file is that rule as assertions:
//
//   KEEP every sentence that is a DECISION-SAFETY invariant, and every
//   sentence that says what a NUMBER MEANS or caveats it.
//   DROP the tutorial — the derivation of the blend weight, what the
//   cache does, why the zone is fixed — or move it behind a disclosure
//   the reader opens.
//
// Two of these assertions are new pins on sentences that had none and
// were therefore deletable by the next tidy-up. The third pins the
// ABSENCE of a sentence that went, which is the only way a cut stays
// cut. The blend disclosure has its own pin in
// e2e/picker-blend-cup.spec.ts ("the season basis is a chip on its own
// column"), moved there with the sentence it follows.
//
// 2026-09-15: the operator cut the season-basis BANNER out of the
// landing page as well, so the third test below now asserts the same
// keep/drop rule against where those two halves live instead — the
// caveat on the column's own chip, the arithmetic in the legend.
//
// Hermetic.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const kickoff = new Date(Date.UTC(2026, 11, 10, 20, 0, 0)).toISOString();

const ROW = {
  refused: false, league: "epl", fav_side: "home", resolution: {},
  src: "current", gp_current: { home: 8, away: 8, min: 8 },
  shape: "SPLIT", espn: "eng.1",
  home: "Arsenal", away: "Everton", favourite: "Arsenal",
  opponent: "Everton",
  ppg_gap: 0.5, gdg_gap: 0.8, rank_gap: 4,
  ranks: { fav: 3, opp: 7 },
  tiers: { ovr: [1, 3], atk: [2, 3], def: [1, 2] },
  tier_gaps: { ovr: 2, atk: 1, def: 1 },
  kalshi: null,
  event_id: "401000001", competition_id: "401000001", kickoff,
};

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260906", days: 7,
  leagues: {
    epl: { src: "current", min_current_gp: 8, clubs: 20 },
    laliga: { src: "current", min_current_gp: 8, clubs: 20 },
    mls: { src: "current", min_current_gp: 21, clubs: 30 },
    ligamx: { src: "current", min_current_gp: 9, clubs: 18 },
  },
  rows: [ROW], refusals: [],
};

const REVIEW = {
  generated_at: new Date().toISOString(),
  back: 7, leagues: {}, finished: [], refusals: [],
  store: { backend: "memory", writable: true },
};

async function open(page: import("@playwright/test").Page) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json({ error: "not found" }, 404)));
  await page.goto("/bet-suggester");
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
}

test("the intro keeps every charter sentence and drops the scene-setting",
  async ({ page }) => {
    await open(page);
    const intro = page.getByTestId("board-framing");
    // WHAT STAYS. Three decision-safety invariants and the ranking key —
    // what the big number on each card means.
    await expect(intro).toContainText(/no model runs on this page/i);
    await expect(intro)
      .toContainText(/no number below is a probability or an edge of ours/i);
    await expect(intro).toContainText(/nothing here is a recommendation/i);
    await expect(intro).toContainText(/you are the one who picks/i);
    await expect(intro)
      .toContainText(/ranked by how far apart the two clubs sit/i);

    // WHAT WENT. The opening inventory: the H1, the four league lights
    // beside it and the four columns below already say it, and it stood
    // between the reader and the board.
    await expect(page.locator("body"))
      .not.toContainText(/every upcoming fixture in the four in-season leagues/i);
    // and the whole framing is now one short paragraph, not three lines
    // of scene-setting
    const words = ((await intro.textContent()) || "").trim().split(/\s+/).length;
    expect(words, "the framing paragraph").toBeLessThan(55);
  });

test("the times note keeps the two facts and sends the reasoning to the legend",
  async ({ page }) => {
    await open(page);
    // WHAT STAYS, beside the numbers it qualifies: which zone the
    // kickoffs are in, and what the "built" stamp actually is.
    const note = page.getByTestId("board-times");
    await expect(note).toBeVisible();
    // the zone the page actually renders kickoffs in, not a typed one
    await expect(note).toContainText(TZ);
    await expect(note)
      .toContainText("“built” is when the board was assembled, not when you asked for it");

    // WHAT MOVED: why the zone is fixed, and what the cache is doing.
    // Gone from the top of the page…
    await expect(note).not.toContainText("the same page twice");
    // …and present in the legend, which is a disclosure the reader opens.
    await expect(page.getByTestId("legend")).toHaveCount(0);
    await page.getByRole("button", { name: /how to read a row/i }).click();
    const legend = page.getByTestId("legend");
    await expect(legend.getByText("times · caching")).toBeVisible();
    await expect(legend).toContainText("the page is the same page twice");
    await expect(legend).toContainText("cached for 90 seconds");
  });

test("the season basis arrives on its own column, and the derivation stays "
   + "one click away", async ({ page }) => {
    /* 2026-09-15, THE SAME CUT ONE STEP FURTHER (operator). This test
       used to pin the season-basis BANNER: the caveat on arrival, the
       blend's arithmetic behind a `prior-banner-blend` disclosure shut
       under it. The banner is gone from the landing page.

       THE RULE IT CARRIED IS UNCHANGED and is asserted here still —
       KEEP the sentence that says what a number is made of, MOVE the
       derivation behind a disclosure. Only the two addresses changed:
       the caveat is now the column's own chip, which is the same fact
       said where it applies rather than a page-wide box that had to name
       every league to say it once, and the arithmetic is in the legend,
       which is exactly the disclosure the test above sends reasoning to.

       So this asserts THREE things: no second copy above the board, the
       caveat present on arrival where the numbers it qualifies are, and
       the derivation still in the document behind one deliberate click. */
    await open(page);
    // This board has no prior-season league, so no column would carry
    // the chip — re-serve one that does.
    await page.route("**/api/picker/board**", (r) => r.fulfill(json({
      ...BOARD,
      leagues: { ...BOARD.leagues,
                 epl: { src: "prior", min_current_gp: 1, clubs: 20 } },
    })));
    await page.reload();
    await expect(page.getByTestId("picker-row").first()).toBeVisible();

    // NO SECOND COPY ABOVE THE BOARD — neither half of it.
    await expect(page.getByTestId("prior-banner")).toHaveCount(0);
    await expect(page.getByTestId("prior-banner-blend")).toHaveCount(0);

    // ON ARRIVAL, on the column the caveat is ABOUT: which season the
    // table is, visible without opening anything.
    const chip = page.locator('[data-testid="league-col"][data-league="epl"]')
      .getByTestId("col-season");
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(/prior szn/);
    // and it is a CHIP, not the paragraph it replaced
    const words = ((await chip.textContent()) || "").trim().split(/\s+/);
    expect(words.length, "the column's season chip").toBeLessThan(10);

    // THE DERIVATION IS STILL IN THE DOCUMENT, and still shut on
    // arrival: the legend is the disclosure the reader opens.
    await expect(page.getByTestId("legend")).toHaveCount(0);
    await page.getByRole("button", { name: /how to read a row/i }).click();
    const legend = page.getByTestId("legend");
    await expect(legend)
      .toContainText("weighted average of this season and last");
    await expect(legend).toContainText("GP / (GP + 10)");
  });

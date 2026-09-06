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
// e2e/picker-blend-cup.spec.ts ("the banner explains the blend rather
// than a threshold"), moved there with the sentence it follows.
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

test("the season banner opens with the caveat, not with the derivation",
  async ({ page }) => {
    await open(page);
    // This board has no prior-season league, so the banner is absent —
    // re-serve one that does.
    await page.route("**/api/picker/board**", (r) => r.fulfill(json({
      ...BOARD,
      leagues: { ...BOARD.leagues,
                 epl: { src: "prior", min_current_gp: 1, clubs: 20 } },
    })));
    await page.reload();
    const banner = page.getByTestId("prior-banner");
    await expect(banner).toBeVisible();
    // The derivation is behind a disclosure and the disclosure is SHUT
    // when the reader arrives. Present in the accessible tree, not
    // shouting.
    await expect(banner.getByTestId("prior-banner-blend"))
      .not.toHaveAttribute("open", /.*/);
    // ON ARRIVAL: which leagues, how many games, and what that does to
    // the numbers. Nothing else.
    await expect(banner.getByText(/LAST SEASON carries most of the rating/))
      .toBeVisible();
    const visible = ((await banner.textContent()) || "");
    const shown = visible.split("how the two seasons are weighed")[0];
    expect(shown.trim().split(/\s+/).length,
      "the banner's text above its disclosure").toBeLessThan(40);
  });

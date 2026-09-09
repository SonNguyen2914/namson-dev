import { expect, test, type Page } from "@playwright/test";
import raw from "../src/data/leagues-cup-brackets.json";

// The archived Leagues Cup bracket at /bet-suggester/leagues-cup.
//
// Hermetic by construction: the page imports its data, so this spec
// touches no backend and nothing here can be flaky because a live read
// was slow.
//
// EVERY SET BELOW IS DERIVED FROM THE DATA FILE AND ITS LENGTH ASSERTED.
// A guard that names a rule and then enumerates a hand-typed subset
// stays green while the omitted case drifts — La Liga disarmed itself on
// every boot for as long as a test called "both planes" listed two of
// three. So the seasons come from the file, the ties come from the file,
// and the counts are compared, not sampled.
//
// WHAT THIS SURFACE MUST NEVER DO, in one line: render a shootout as a
// win. `ft_winner` is who was ahead at ninety plus stoppage — what Kalshi
// settles a three-way on, and what cost real money on bet 42 when it was
// confused with going through. `advanced` is who went to the next round.
// 11 of the 48 derived ties across three seasons have `advanced` set to a
// club that `ft_winner` does not name, so this is most of the difference
// between two questions and not an edge case.

type Tie = {
  fixture_id: number; home: string; away: string;
  ft_home: number; ft_away: number; ft_winner: string | null;
  went_to_penalties: boolean; advanced: string | null;
};
type Season = {
  season: number; champion: string | null;
  rounds: { name: string; size: number; ties: Tie[] }[];
  third_place: { ties: Tie[] };
  unreconstructed: { n: number; fixtures: Tie[] };
};
const DOC = raw as unknown as { seasons: Season[] };
const SEASONS = [...DOC.seasons].sort((a, b) => b.season - a.season);

/** Every tie the bracket for `s` must draw — rounds plus third place. */
const bracketTies = (s: Season): Tie[] =>
  [...s.rounds.flatMap((r) => r.ties), ...s.third_place.ties];

async function open(page: Page) {
  await page.goto("/bet-suggester/leagues-cup");
  await expect(page.getByRole("heading", { name: "Leagues Cup", level: 1 }))
    .toBeVisible();
}

async function showSeason(page: Page, season: number) {
  await page.getByRole("tab", { name: new RegExp(`^${season}`) }).click();
  await expect(page.getByRole("tab", { name: new RegExp(`^${season}`) }))
    .toHaveAttribute("aria-selected", "true");
}

// ---------------------------------------------------------------------
// the page exists, and holds every season the archive holds
// ---------------------------------------------------------------------

test("the archive page offers every season in the data, newest first",
  async ({ page }) => {
    await open(page);
    const tabs = page.getByTestId("lc-season-tab");
    await expect(tabs).toHaveCount(SEASONS.length);
    expect(await tabs.allInnerTexts()).toEqual(
      SEASONS.map((s) => expect.stringContaining(String(s.season))));
  });

test("it is reached from the Archive dropdown, and the dropdown now holds "
   + "three finished competitions", async ({ page }) => {
    await open(page);
    const button = page.getByRole("button", { name: /archive/i });
    await button.click();
    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem")).toHaveCount(3);
    // the entry for THIS page marks itself as the current one, so the
    // menu is wayfinding and not just a list of links
    await expect(menu.getByRole("menuitem", { name: /Leagues Cup/ }))
      .toHaveAttribute("aria-current", "page");
    await expect(menu.getByRole("menuitem", { name: /World Cup 26/ }))
      .toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /ASEAN Championship/ }))
      .toBeVisible();
  });

// ---------------------------------------------------------------------
// the bracket draws every tie, and only the derived ones
// ---------------------------------------------------------------------

for (const s of SEASONS) {
  test(`${s.season} draws every derived tie and names its champion`,
    async ({ page }) => {
      await open(page);
      await showSeason(page, s.season);

      const want = bracketTies(s);
      const cards = page.getByTestId("lc-tie");
      await expect(cards).toHaveCount(want.length);

      // IDENTITY, NOT COUNT. Equal counts would pass on a bracket
      // drawing the right NUMBER of the wrong ties.
      const drawn = await cards.evaluateAll((els) =>
        els.map((e) => Number(e.getAttribute("data-fixture"))));
      expect(new Set(drawn)).toEqual(new Set(want.map((t) => t.fixture_id)));

      const champ = page.getByTestId("lc-champion");
      await expect(champ).toHaveAttribute("data-champion", s.champion ?? "");
      if (s.champion) await expect(champ).toContainText(s.champion);

      // every round the data derived is labelled, and no round is drawn
      // half-empty: a round of size n shows n ties
      for (const r of s.rounds) {
        expect(r.ties.length, `${s.season} ${r.name}`).toBe(r.size);
      }
    });

  test(`${s.season} shows a shootout as advancing, never as winning`,
    async ({ page }) => {
      await open(page);
      await showSeason(page, s.season);

      const rows = await page.getByTestId("lc-tie").evaluateAll((els) =>
        els.map((e) => ({
          id: Number(e.getAttribute("data-fixture")),
          ft: e.getAttribute("data-ft-winner") ?? "",
          adv: e.getAttribute("data-advanced") ?? "",
          pens: e.getAttribute("data-pens") === "true",
        })));
      const byId = new Map(rows.map((r) => [r.id, r]));
      expect(byId.size).toBe(bracketTies(s).length);

      for (const t of bracketTies(s)) {
        const got = byId.get(t.fixture_id)!;
        expect(got, `tie ${t.fixture_id} missing from the page`).toBeTruthy();
        expect(got.pens).toBe(t.went_to_penalties);
        expect(got.ft).toBe(t.ft_winner ?? "");
        expect(got.adv).toBe(t.advanced ?? "");
        // THE INVARIANT. A tie that went to penalties was level at 90,
        // so NOBODY won it — the page may not name a full-time winner
        // there, whatever it says about who went through.
        if (t.went_to_penalties) {
          expect(got.ft, `${t.fixture_id} named a winner of a shootout`)
            .toBe("");
          expect(t.ft_home).toBe(t.ft_away);
        }
      }

      // and every shootout carries the amber chip AND a line saying so
      const pens = bracketTies(s).filter((t) => t.went_to_penalties);
      await expect(page.getByTestId("lc-pens-chip")).toHaveCount(pens.length);
      await expect(page.getByTestId("lc-pens-note")).toHaveCount(pens.length);
    });

  test(`${s.season} names the phase it could not reconstruct instead of `
     + `drawing it`, async ({ page }) => {
      await open(page);
      await showSeason(page, s.season);

      const panel = page.getByTestId("lc-refusal");
      await expect(panel).toHaveAttribute(
        "data-refused-count", String(s.unreconstructed.n));
      await expect(panel).toContainText(String(s.unreconstructed.n));
      // it says WHICH check stopped the walk — a refusal without the
      // reason is a shrug
      await expect(panel).toContainText(/PAIRING|ADVANCEMENT|ELIMINATION|ORDER/);

      // MISSING IS NOT DRAWN AS EMPTY: before the list is opened there
      // is not one placeholder tie for the phase, and after it is opened
      // every one of those fixtures is a real row with a real score.
      await expect(page.getByTestId("lc-phase-row")).toHaveCount(0);
      await panel.getByRole("button", { name: /show the/i }).click();
      await expect(page.getByTestId("lc-phase-row"))
        .toHaveCount(s.unreconstructed.n);
      // the bracket itself did not grow: those rows are a listing, not
      // bracket slots
      await expect(page.getByTestId("lc-tie"))
        .toHaveCount(bracketTies(s).length);
    });
}

// ---------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------

/** A settled measurement.
 *
 *  `evaluate` reports whatever is laid out at the instant it runs, and a
 *  viewport resize is NOT synchronous with reflow — a read taken right
 *  after one can faithfully describe the PREVIOUS width. Settled means
 *  TWO CONSECUTIVE READS AGREE, which holds for any cause of reflow (a
 *  resize, a font landing) rather than for one guessed delay a slower
 *  machine invalidates. A wrong number here is worse than a timeout: it
 *  reads as a real layout defect.
 */
async function settledScroll(page: Page) {
  const read = () => page.evaluate(() => ({
    w: document.documentElement.scrollWidth,
    c: document.documentElement.clientWidth,
  }));
  let prev = await read();
  for (let i = 0; i < 25; i++) {
    const next = await read();
    if (next.w === prev.w && next.c === prev.c) return next;
    prev = next;
  }
  throw new Error("the page never stopped reflowing — 25 consecutive reads "
    + "disagreed, so no measurement here would describe a real layout");
}

for (const width of [1440, 1024, 390]) {
  test(`the bracket does not scroll the page sideways at ${width}px`,
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      // the widest season is the one to test: 2024's round of 32 is 16
      // ties, four times anything else
      const widest = [...SEASONS].sort(
        (a, b) => Math.max(...b.rounds.map((r) => r.size))
                - Math.max(...a.rounds.map((r) => r.size)))[0];
      await showSeason(page, widest.season);
      await page.getByTestId("lc-refusal")
        .getByRole("button", { name: /show the/i }).click();
      await expect(page.getByTestId("lc-phase-row").first()).toBeVisible();

      const { w, c } = await settledScroll(page);
      // one pixel of slack for sub-pixel layout; a real sideways scroll
      // is tens of pixels at least
      expect(w, `document is ${w}px wide inside a ${c}px viewport`)
        .toBeLessThanOrEqual(c + 1);

      // the wide thing has its OWN scroller, which is where the width
      // is allowed to go
      const table = page.locator("table").first();
      const overflow = await table.evaluate((el) =>
        getComputedStyle(el.parentElement!).overflowX);
      expect(overflow).toBe("auto");
    });
}

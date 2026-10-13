/** ONE MATCH CARD — AGENTS.md §8, Son 2026-10-13: "make it exactly the
 *  same as Leagues, otherwise we have lots of inconsistencies."
 *
 *  One card from each source, each off a REAL recording (no relabelled
 *  league rows — that is how the Oct 12 parity pass shipped two cards):
 *    - league: e2e/league-recorded.ts (Leagues tab)
 *    - cross-league cup: e2e/cups-recorded.ts, Lens v Sporting CP (Cups tab)
 *    - nations: e2e/championships-recorded.ts (Nations tab)
 *  and the ordered list of slots inside each card must be the SAME list.
 *  A slot is a `data-testid`; the cells that differ only by their DATA
 *  (a percentage or a "—", a THIN chip or a NO FULL BOOK chip or nothing)
 *  are normalised to the slot they fill, never dropped.
 *
 *  Add a new source here when you add one (AGENTS.md §8). */
import { test, expect, type Page } from "@playwright/test";
import { routeCups } from "./cups-board";
import { CHAMP_BOARD } from "./championships-recorded";
import { SOURCES, type Source } from "./card-sources";

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b),
});

async function openCard(page: Page, s: Source) {
  await page.clock.install({ time: new Date(s.clock) });
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, s.mode);
  await routeCups(page);
  if (s.board) await page.route("**/api/picker/board**", (r) => r.fulfill(json(s.board)));
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  const sel = s.event
    ? `[data-testid="picker-row"][data-event="${s.event}"]`
    : '[data-testid="picker-row"]';
  await page.waitForSelector(sel);
  return page.locator(sel).first();
}

/** the card's slots, in document order, normalised to what they fill */
const SLOT = (id: string) => id
  .replace(/^mm-(model|market)-(h|d|a|empty|[hda]-none)$/, "mm-$1-cell")
  .replace(/^mm-(?:tail|why)-(model|market)$|^mm-book-flag$/, (m, lab) =>
    `mm-${lab ?? "market"}-tail`);
/** slots whose presence is a fact about the data, not the format */
const OPTIONAL = new Set(["home-badge", "form-strip", "rank-dumbbell"]);

async function slots(card: ReturnType<Page["locator"]>) {
  const ids = await card.evaluate((el) =>
    [...el.querySelectorAll("[data-testid]")].map((e) => e.getAttribute("data-testid")!));
  return ids.map(SLOT).filter((id) => !OPTIONAL.has(id));
}

test("every source draws the league card, slot for slot", async ({ browser }) => {
  const seen: Record<string, string[]> = {};
  for (const s of SOURCES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const card = await openCard(await ctx.newPage(), s);
    seen[s.name] = await slots(card);
    await ctx.close();
  }
  expect(seen["cross-league cup"], "cup card v league card").toEqual(seen.league);
  expect(seen.nations, "nations card v league card").toEqual(seen.league);
});

for (const s of SOURCES) {
  test(`${s.name}: the face is the league card's, line by line`, async ({ page }) => {
    const card = await openCard(page, s);
    // 1. top row: index and kickoff, nothing else
    for (const chip of ["competition-badge", "rated-in", "group-chip", "xi-chip",
                        "fav-source-venue"]) {
      await expect(card.getByTestId(chip)).toHaveCount(0);
    }
    // 2. headline: the figure and ONE label line
    await expect(card.getByTestId("anchor-key").locator(".block")).toHaveCount(0);
    // 3. stats: one line, #a v #b · ppg · rank · gp · h2h
    const stats = card.getByTestId("stats-row");
    expect(await stats.evaluate((el) =>
      [...el.children].map((c) => c.getAttribute("data-testid"))))
      .toEqual(["rank-pair", "stat-ppg", "stat-rank", "stat-gp", "h2h"]);
    await expect(stats).not.toContainText("n/a");
    const tops = await stats.evaluate((el) =>
      [...new Set([...el.children].map((c) => Math.round(c.getBoundingClientRect().top)))]);
    expect(tops.length, "the stats line is one line").toBe(1);
    // 4. tiers: compact pairs, no ± values and no daggers on the face
    await expect(card.locator("[data-measure]")).toHaveCount(0);
    await expect(card.getByTestId("field-floor-mark")).toHaveCount(0);
    // 5. model / market: the table, never a sentence
    await expect(card.getByTestId("mm-lines")).toBeVisible();
    for (const k of ["h", "d", "a"]) await expect(card.getByTestId(`mm-head-${k}`)).toBeVisible();
    await expect(card.getByTestId("mm-lines")).not.toContainText("no model read");
    await expect(card.getByTestId("mm-lines")).not.toContainText("no full Kalshi book");
    // 6. footer: the WATCH chip and the MODEL chip
    await expect(card.getByTestId("watch-toggle")).toBeVisible();
    await expect(card.getByTestId("mm-verdict")).toBeVisible();
  });
}

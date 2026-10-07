import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, serveEight, routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { withModelMarket } from "./model-market";

/* THE LAST COLUMN KEEPS ITS RIGHT EDGE (Son, 2026-10-07).
 *
 * His screenshot, a ~1800px desktop window: the farthest-right column's
 * cards lost their right border and corner radius where the board's area
 * ended, while the left columns were fine. The board's track is a
 * horizontal scroller from `md` up (it clips at its padding box), and its
 * columns were laid edge to edge across it with no gutter at either end —
 * so the last column's right border sat ON the clip line, and any
 * sub-pixel remainder in the track's width or seat cut it off.
 *
 * At every width below, in BOTH modes, scrolled fully right wherever the
 * board scrolls: each visible column's widest card must end at least 1px
 * inside its clipping ancestor's visible right edge, and that card's own
 * right border must be drawn (not clipped). */

const json = (body: unknown) => ({ status: 200, contentType: "application/json",
  body: JSON.stringify(body) });

const WIDTHS = [1280, 1440, 1600, 1813, 1920];

async function openLeagues(page: Page) {
  await serveEight(page, withModelMarket(BOARD_EIGHT));
}

async function openChampionships(page: Page) {
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/board**",
    (r) => r.fulfill(json(withModelMarket(CHAMP_BOARD as never))));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
}

/** Scroll the board's track as far right as it goes, and let the loop
 *  settle wherever it seats. */
async function scrollFullyRight(page: Page) {
  await page.evaluate(() => {
    const t = document.querySelector<HTMLElement>('[data-testid="board-track"]');
    if (t) t.scrollLeft = t.scrollWidth;
  });
  await page.waitForTimeout(700);
}

type Finding = string;

async function edgeFindings(page: Page): Promise<Finding[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const clipOf = (el: Element): HTMLElement | null => {
      for (let a = el.parentElement; a; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox !== "visible") return a;
      }
      return null;
    };
    for (const col of document.querySelectorAll<HTMLElement>('[data-testid="league-col"]')) {
      const cards = [...col.querySelectorAll<HTMLElement>(
        '[data-testid="picker-row"], [data-testid="picker-refusal"]')];
      if (cards.length === 0) continue;
      const widest = cards.reduce((a, b) =>
        (b.getBoundingClientRect().right > a.getBoundingClientRect().right ? b : a));
      const r = widest.getBoundingClientRect();
      const clip = clipOf(widest);
      const cr = clip ? clip.getBoundingClientRect() : null;
      const visL = cr ? cr.left + clip!.clientLeft : 0;
      const visR = cr ? cr.left + clip!.clientLeft + clip!.clientWidth
                      : document.documentElement.clientWidth;
      // only the columns a reader can see: any overlap with the clip box
      if (r.right <= visL || r.left >= visR) continue;
      const lg = col.dataset.league;
      if (r.right > visR - 1)
        out.push(`${lg}: widest card ends at ${r.right.toFixed(2)}, clip edge `
          + `${visR.toFixed(2)} (needs <= ${(visR - 1).toFixed(2)})`);
      // and its right border is DRAWN: a 1px border wholly inside the box
      const bw = parseFloat(getComputedStyle(widest).borderRightWidth);
      if (!(bw >= 1)) out.push(`${lg}: card has no right border (${bw})`);
      if (r.right - bw < visR - 1 && r.right > visR)
        out.push(`${lg}: right border straddles the clip edge`);
      // and the column's left edge is not cut either, at the other end
      if (r.left < visL - 0.01 && r.right > visL)
        out.push(`${lg}: card starts at ${r.left.toFixed(2)}, left of the `
          + `clip edge ${visL.toFixed(2)}`);
    }
    // THE DAY BAND'S SORT CONTROLS sit over the last column too, and must
    // end inside the same clip — the gutter is room, not a place to park
    // a control half out of sight
    for (const btn of document.querySelectorAll<HTMLElement>(
      '[data-testid="band-dir"], [data-testid="band-sort"]')) {
      const r = btn.getBoundingClientRect();
      if (r.width === 0) continue;
      const clip = clipOf(btn);
      if (!clip) continue;
      const cr = clip.getBoundingClientRect();
      const visR = cr.left + clip.clientLeft + clip.clientWidth;
      if (r.right > visR - 1)
        out.push(`${btn.dataset.testid} ${btn.dataset.day}: ends at `
          + `${r.right.toFixed(2)}, clip edge ${visR.toFixed(2)}`);
    }
    return out;
  });
}

for (const mode of ["leagues", "championships"] as const) {
  test.describe(`${mode}: the rightmost column is not clipped`, () => {
    for (const w of WIDTHS) {
      test(`at ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 1000 });
        await (mode === "leagues" ? openLeagues(page) : openChampionships(page));
        await page.waitForTimeout(400);
        const before = await edgeFindings(page);
        await scrollFullyRight(page);
        const after = await edgeFindings(page);
        expect([...before.map((f) => `at rest: ${f}`),
                ...after.map((f) => `scrolled right: ${f}`)]).toEqual([]);
      });
    }
  });
}

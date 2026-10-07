import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight, serveEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";

/* THE STATS ROW STAYS ON ONE LINE (Son, 2026-10-07).
 *
 * "#27 v #29 · ppg +0.17 · rank +2 · gp 27/27 · h2h 3-2-0" is ~42
 * characters at 10.5px. With four 16px gaps it overran a ~320px card and
 * dropped h2h onto a line of its own. The row now spreads its items with
 * `justify-between` over a smaller minimum gap; `flex-wrap` remains only
 * for a genuinely long fallback string, so nothing is ever clipped.
 *
 * Measured at the board's REAL column width (1440px, four columns on the
 * scroller), by comparing the h2h item's top with the ranks pair's. */

const json = (body: unknown) => ({ status: 200, contentType: "application/json",
  body: JSON.stringify(body) });

function withStats(tally: { home: number; draw: number; away: number }) {
  const b = JSON.parse(JSON.stringify(BOARD_EIGHT));
  const row = b.rows.find((r: { event_id: string }) => r.event_id === "761823");
  row.ranks = { fav: 27, opp: 29 };
  row.gp_current = { home: 27, away: 27, min: 27 };
  row.h2h = { available: true, source: "corpus",
    window: { from: "2024-02-01", label: "since 2024" }, tally,
    meetings: [], last_meeting: null, reason: null };
  return b;
}

async function sameLine(page: Page, eventId: string) {
  const c = page.locator(`[data-testid="picker-row"][data-event="${eventId}"]`);
  await c.scrollIntoViewIfNeeded();
  const row = c.getByTestId("stats-row");
  const rank = (await row.getByTestId("rank-pair").boundingBox())!;
  const h2h = (await row.getByTestId("h2h").boundingBox())!;
  return { rank, h2h, width: (await c.boundingBox())!.width,
           text: await row.innerText() };
}

for (const [label, tally, want] of [
  // the favourite here (Philadelphia) is the AWAY side, and the card signs
  // the head-to-head from the favourite: won-drew-lost
  ["3-2-0", { home: 0, draw: 2, away: 3 }, "h2h 3-2-0"],
  ["10-5-3", { home: 3, draw: 5, away: 10 }, "h2h 10-5-3"],
] as const) {
  test(`two-digit ranks, gp 27/27 and h2h ${label} share one line`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await serveEight(page, withStats(tally));
    const m = await sameLine(page, "761823");
    expect(m.text).toContain("#27 v #29");
    expect(m.text).toContain("gp 27/27");
    expect(m.text.replace(/\s+/g, " ")).toContain(want);
    expect(m.width, "measured at the board's real column width").toBeLessThan(340);
    expect(Math.abs(m.h2h.y - m.rank.y),
      `h2h (${m.h2h.y}) sits on the ranks' line (${m.rank.y})`).toBeLessThanOrEqual(2);
  });
}

test("a long fallback still wraps rather than clipping", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const b = withStats({ home: 10, draw: 5, away: 3 });
  const row = b.rows.find((r: { event_id: string }) => r.event_id === "761823");
  row.gp_current = { home: 27, away: null, min: null };
  await serveEight(page, b);
  const c = page.locator('[data-testid="picker-row"][data-event="761823"]');
  await c.scrollIntoViewIfNeeded();
  const cb = (await c.boundingBox())!;
  const items = await c.getByTestId("stats-row").evaluate((el) =>
    [...el.children].map((ch) => ch.getBoundingClientRect().right));
  for (const right of items) expect(right).toBeLessThanOrEqual(cb.x + cb.width);
  await expect(c.getByTestId("stats-row")).toContainText("away not counted");
});

test("every card whose stats fit one line keeps them on one line — league "
  + "and national", async ({ page }) => {
    const check = async () => page.$$eval('[data-testid="stats-row"]', (rows) =>
      rows.flatMap((row) => {
        const kids = [...row.children] as HTMLElement[];
        if (kids.length < 2 || row.getBoundingClientRect().width === 0) return [];
        const need = kids.reduce((s, k) => s + k.getBoundingClientRect().width, 0)
          + 8 * (kids.length - 1);
        if (need > row.getBoundingClientRect().width) return [];  // a real wrap
        const tops = new Set(kids.map((k) => Math.round(k.getBoundingClientRect().top)));
        return tops.size > 1 ? [(row as HTMLElement).innerText.replace(/\s+/g, " ")] : [];
      }));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await serveEight(page, withStats({ home: 3, draw: 2, away: 0 }));
    expect(await check()).toEqual([]);

    await page.clock.install({ time: new Date(CHAMP_CLOCK) });
    await page.addInitScript(() => {
      try { window.localStorage.setItem("board-mode", "championships"); } catch { /* */ }
    });
    await routeEight(page);
    await page.route("**/api/championships/board**", (r) => r.fulfill(json(CHAMP_BOARD)));
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    expect(await page.getByTestId("stats-row").count()).toBeGreaterThan(0);
    expect(await check()).toEqual([]);
  });

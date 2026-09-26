/** EVERY CARD OPENS A PAGE THAT EXISTS — OR SAYS IT HAS NONE.
 *
 *  Frontend audit F2 (2026-09-25): a card's link was the typed pattern
 *  `/bet-suggester/<league>/<event_id>`, and only four leagues have a
 *  match hub. Measured on the landing page, 9 of 22 links opened the
 *  site's 404 (every Bundesliga, Serie A, Ligue 1 and Eredivisie card),
 *  and by the same path every EFL Cup card, every national card and every
 *  finished Champions League / Leagues Cup card. The file's own comment
 *  records the same failure on 2026-09-03 and 2026-09-08.
 *
 *  So this walks EVERY card of EVERY recorded board — both modes of the
 *  landing page, the EFL Cup page, the folded Campeones boards, and the
 *  finished tail — and asks the running app for each href. A link must
 *  answer 200; a card with nowhere to go must be drawn unlinked with its
 *  reason. The leagues covered are read off the recordings, never listed
 *  here. HERMETIC: every /api/ read is answered in the page, and the app
 *  server itself is pointed at a local stand-in. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { CLUB_H2H_BOARD, CLUB_H2H_CLOCK } from "./club-h2h-recorded";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { rebased } from "./efl-cup-recorded";
import { CAMPEONES_BOARD } from "./campeones-board";
import { CAMPEONES_FIELD_BOARD } from "./campeones-field";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});
const EMPTY_REVIEW = { rows: [], refusals: [], leagues: {} };

type Board = { rows: readonly { league: string }[]; refusals?: readonly unknown[] };
const BOARDS: Array<{ name: string; path: string; board: unknown; review?: unknown;
                      clock?: string; champ?: boolean }> = [
  { name: "the eight-column board + its finished tail", path: "/bet-suggester",
    board: BOARD_EIGHT, review: REVIEW_EIGHT, clock: "2026-09-15T11:32:30Z" },
  { name: "the club board with its head-to-head", path: "/bet-suggester",
    board: CLUB_H2H_BOARD, clock: CLUB_H2H_CLOCK },
  { name: "the Championships board", path: "/bet-suggester",
    board: CHAMP_BOARD, clock: CHAMP_CLOCK, champ: true },
  { name: "the EFL Cup page", path: "/bet-suggester/efl-cup", board: rebased() },
  { name: "the Campeones Cup fold", path: "/bet-suggester", board: CAMPEONES_BOARD,
    clock: "2026-12-10T12:00:00Z" },
  { name: "the Campeones Cup field fold", path: "/bet-suggester", board: CAMPEONES_FIELD_BOARD,
    clock: "2026-12-10T12:00:00Z" },
];

async function open(page: Page, b: typeof BOARDS[number]) {
  if (b.clock) await page.clock.install({ time: new Date(b.clock) });
  if (b.champ) {
    await page.addInitScript(() => {
      try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
    });
  }
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(b.board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(b.review ?? EMPTY_REVIEW)));
  await page.route("**/api/championships/**", (r) => r.fulfill(json(b.champ ? b.board : {}, b.champ ? 200 : 503)));
  await page.goto(b.path);
  await page.waitForSelector('[data-testid="picker-row"]');
  if (b.review) {
    // the finished tail is collapsed; open every column's
    await page.waitForSelector('[data-testid="review-toggle"]', { state: "attached" });
    await page.locator('[data-testid="review-toggle"]').evaluateAll((bs) =>
      bs.forEach((x) => (x as HTMLButtonElement).click()));
    await page.waitForSelector('[data-testid="review-row"]', { state: "attached" });
  }
}

test("every card on every recorded board opens a page that exists, or says it has none",
  async ({ browser, page }) => {
    test.setTimeout(180_000);
    const leagues = new Set<string>();
    const hrefs = new Map<string, string>();   // href -> the board it came from
    let unlinked = 0;
    for (const b of BOARDS) {
      for (const r of (b.board as Board).rows) leagues.add(r.league);
      // a fresh context per board: a clock, a remembered mode and routes
      // are per page, and one board must not inherit another's
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await open(p, b);
      const cards = p.locator('[data-testid="picker-row"], [data-testid="review-row"]');
      const n = await cards.count();
      expect(n, `${b.name} drew cards`).toBeGreaterThan(0);
      const seen = await cards.evaluateAll((els) => els.map((e) => {
        const a = e.querySelector("a[href]");
        const u = e.querySelector('[data-testid="card-unlinked"], [data-testid="review-unlinked"]');
        return { href: a?.getAttribute("href") ?? null,
                 unlinked: u ? (u.getAttribute("title") ?? "") : null };
      }));
      for (const s of seen) {
        // a card is one or the other, never neither and never both
        expect(s.href == null, `${b.name}: a card with no link and no reason`)
          .toBe(s.unlinked != null);
        if (s.href) hrefs.set(s.href, b.name);
        else {
          unlinked += 1;
          expect(s.unlinked).toMatch(/^no match page exists for .+ fixtures yet/);
        }
      }
      await ctx.close();
    }
    expect(hrefs.size).toBeGreaterThan(0);
    const dead: string[] = [];
    for (const [href, from] of hrefs) {
      const res = await page.request.get(href, { maxRedirects: 0 });
      if (res.status() !== 200) dead.push(`${res.status()} ${href} (from ${from})`);
    }
    expect(dead, "links into pages that do not exist").toEqual([]);
    // non-vacuity: the recordings hold hub leagues, hub-less ones and nations
    expect(leagues.size).toBeGreaterThan(8);
    expect(unlinked).toBeGreaterThan(0);
  });

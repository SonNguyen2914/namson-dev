/** EVERY MATCH CARD, ON ALL THREE TABS, OPENS A MATCH HUB (Son, 2026-10-13:
 *  "all matches should have a match hub, currently cups matches don't have
 *  it").
 *
 *  Leagues, Cups (both recorded cup boards, so the continental cups, the
 *  EFL Cup and the Finals & Super Cups column are all drawn) and Nations:
 *  every card on the board and in its finished tail carries a link of the
 *  hub shape `/bet-suggester/<competition>/<event id>`, and the running app
 *  answers 200 for every one. A competition page is not a hub, and a card
 *  drawn unlinked fails here.
 *
 *  HERMETIC. Every /api/ read is answered in the page from RECORDED boards
 *  (e2e/eight-columns.ts, e2e/cups-board.ts, e2e/cups-rules-recorded.ts,
 *  e2e/championships-recorded.ts); the app server's own backend is the
 *  local stand-in. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { CUPS_BOARD, CUPS_CLOCK, CUPS_REVIEW } from "./cups-board";
import {
  CUPS_RULES_BOARD, CUPS_RULES_REVIEW, RULES_CLOCK,
} from "./cups-rules-recorded";
import { ALL_CUPS } from "../src/lib/cupsTab";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

type Tab = { name: string; mode: string; clock: string; board: unknown;
             review: unknown };
const TABS: Tab[] = [
  { name: "Leagues", mode: "leagues", clock: "2026-09-15T11:32:30Z",
    board: BOARD_EIGHT, review: REVIEW_EIGHT },
  { name: "Cups (UCL, EFL Cup, Finals & Super Cups)", mode: "cups",
    clock: CUPS_CLOCK, board: CUPS_BOARD, review: CUPS_REVIEW },
  { name: "Cups (UCL, Europa, Conference)", mode: "cups",
    clock: RULES_CLOCK, board: CUPS_RULES_BOARD, review: CUPS_RULES_REVIEW },
  { name: "Nations", mode: "nations", clock: CHAMP_CLOCK,
    board: CHAMP_BOARD, review: { rows: [], refusals: [], leagues: {} } },
];

async function open(page: Page, t: Tab) {
  await page.clock.install({ time: new Date(t.clock) });
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, t.mode);
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(t.board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(t.review)));
  await page.route("**/api/championships/board**", (r) =>
    r.fulfill(json(t.mode === "nations" ? t.board : {}, t.mode === "nations" ? 200 : 503)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"]');
  const toggles = page.locator('[data-testid="review-toggle"]');
  if (await toggles.count()) {
    await toggles.evaluateAll((bs) => bs.forEach((x) => (x as HTMLButtonElement).click()));
  }
}

const HUB = /^\/bet-suggester\/([a-z0-9]+)\/(\d{1,12})$/;

test("every card on the Leagues, Cups and Nations tabs links to a match hub that resolves",
  async ({ browser, page }) => {
    test.setTimeout(180_000);
    const hrefs = new Map<string, string>();
    const comps = new Set<string>();
    const bad: string[] = [];
    for (const t of TABS) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await open(p, t);
      // ranked cards, finished cards AND refused cards: a fixture the
      // board declined to rank is still a match with a hub
      const cards = p.locator('[data-testid="picker-row"], [data-testid="review-row"], '
        + '[data-testid="picker-refusal"]');
      const n = await cards.count();
      expect(n, `${t.name} drew cards`).toBeGreaterThan(0);
      const seen = await cards.evaluateAll((els) => els.map((e) =>
        (e.matches("a[href]") ? e : e.querySelector("a[href]"))
          ?.getAttribute("href") ?? null));
      for (const href of seen) {
        const m = href ? HUB.exec(href) : null;
        if (!m) { bad.push(`${t.name}: ${href ?? "unlinked card"}`); continue; }
        comps.add(m[1]);
        hrefs.set(href!, t.name);
      }
      await ctx.close();
    }
    expect(bad, "cards with no hub link").toEqual([]);
    const dead: string[] = [];
    for (const [href, from] of hrefs) {
      const res = await page.request.get(href, { maxRedirects: 0 });
      if (res.status() !== 200) dead.push(`${res.status()} ${href} (from ${from})`);
    }
    expect(dead, "hub links that do not resolve").toEqual([]);
    // non-vacuity: league, cup (continental, domestic, one-match) and nation
    for (const c of ["ucl", "uel", "eflcup", "campeones", "epl", "unl"]) {
      expect([...comps], `a ${c} card was walked`).toContain(c);
    }
  });

test("all 22 cups have a hub page at /bet-suggester/<cup>/<event id>", async ({ page }) => {
  expect(ALL_CUPS.length).toBe(22);
  const dead: string[] = [];
  for (const c of ALL_CUPS) {
    const res = await page.request.get(`/bet-suggester/${c.key}/401915417`, { maxRedirects: 0 });
    if (res.status() !== 200) dead.push(`${res.status()} ${c.key}`);
  }
  expect(dead).toEqual([]);
});

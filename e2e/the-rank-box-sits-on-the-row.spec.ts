/** THE `#` BOX OPENS ON ITS OWN ROW (operator, 2026-09-25).
 *
 *  "keep this same format, just move the whole box to be on the same line
 *  of SPLIT, tiers, and (#) itself." The box is unchanged; it opens BESIDE
 *  the `#`, its label row on the trio's label row, covering none of the
 *  chip, the trio or the `#`. It is an overlay, so it may reach over the
 *  neighbouring card and the row never moves. Past the viewport's right
 *  edge it opens on the card's LEFT; where neither side has room (a
 *  one-column phone) it drops below the row as before.
 *
 *  The worst case is measured: three-digit ranks on all three axes (a
 *  154-club league field, via `field_rank`, the backend's documented shape
 *  — src/picker/field_rank.py on board-data-gaps, not yet recorded; the
 *  ranks are this test's own), on the Leagues board at every width from a
 *  phone up, and the national field on the Championships board. */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { routeEight } from "./eight-columns";
import { CLUB_H2H_BOARD, CLUB_H2H_CLOCK } from "./club-h2h-recorded";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";

const json = (b: unknown) => ({ status: 200, contentType: "application/json",
  body: JSON.stringify(b) });

/** Every rated club row gains three-digit field ranks on all three axes. */
function worstCaseBoard() {
  const board = JSON.parse(JSON.stringify(CLUB_H2H_BOARD));
  for (const [i, r] of board.rows.entries()) {
    const n = 100 + i;
    r.field_rank = { size: 154, axes: {
      ovr: { fav: { rank: n }, opp: { rank: n + 25 } },
      atk: { fav: { rank: n + 1 }, opp: { rank: n + 30 } },
      def: { fav: { rank: n + 2 }, opp: { rank: n + 44 } } } };
  }
  return board;
}

async function leagues(page: Page) {
  await page.clock.install({ time: new Date(CLUB_H2H_CLOCK) });
  await routeEight(page, worstCaseBoard());
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"] [data-testid="field-ranks-open"]');
}

async function championships(page: Page) {
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"] [data-testid="field-ranks-open"]');
}

/** Everything the rule is about, in one read, once the layout settles. */
async function geometry(page: Page, card: Locator) {
  const read = () => card.evaluate((el) => {
    const r = (n: Element | null) => {
      if (!n) return null;
      const b = n.getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom };
    };
    const btn = el.querySelector('[data-testid="field-ranks-open"]')!;
    const trio = btn.parentElement!.previousElementSibling!;
    const chip = el.querySelector('[data-testid="shape-chip"], [data-testid="shape-absent"]');
    const box = document.querySelector('[data-testid="field-ranks"]');
    const row = trio.closest("div.flex")!;
    const price = el.querySelector('[data-testid="watch-toggle"]')?.parentElement ?? null;
    const c = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
    const lab = (n: Element | null) => n?.getBoundingClientRect().top ?? null;
    return {
      labels: [lab(trio.querySelector("[data-tier] > span")),
               lab(box?.querySelector("[data-rank-axis] > span") ?? null)],
      place: box?.getAttribute("data-place") ?? null,
      btn: r(btn), trio: r(trio), chip: r(chip), box: r(box), row: r(row),
      price: r(price), card: r(el),
      hitIsButton: hit === btn || btn.contains(hit),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      vw: document.documentElement.clientWidth,
    };
  });
  let prev = JSON.stringify(await read());
  for (let i = 0; i < 25; i++) {
    const next = await read();
    if (JSON.stringify(next) === prev) return next;
    prev = JSON.stringify(next);
  }
  throw new Error("the layout never settled");
}

/** The cards with a # whose card lies within the viewport horizontally —
 *  the board's track scrolls sideways, and a card parked off to the side
 *  is not one a reader can open. Rightmost first, so the edge case is
 *  always among those measured. */
async function onScreen(page: Page) {
  await page.waitForTimeout(300);
  return page.locator('[data-testid="picker-row"]').evaluateAll((els) => {
    const vw = document.documentElement.clientWidth;
    return els.map((e, i) => ({ i, b: e.getBoundingClientRect(),
      has: !!e.querySelector('[data-testid="field-ranks-open"]') }))
      .filter((x) => x.has && x.b.width > 0 && x.b.left >= 0 && x.b.right <= vw)
      .sort((a, b) => b.b.right - a.b.right).map((x) => x.i);
  });
}

type Box = { l: number; r: number; t: number; b: number } | null;
const meets = (a: Box, b: Box) => !!a && !!b
  && a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;

/** The rule, asserted on one open box. Returns where it opened. */
async function assertOnTheRow(page: Page, card: Locator, at: string) {
  const btn = card.getByTestId("field-ranks-open");
  const before = await geometry(page, card);
  await btn.click();
  await expect(page.getByTestId("field-ranks")).toBeVisible();
  const g = await geometry(page, card);
  expect(g.overflow, `${at}: no page horizontal overflow`).toBeLessThanOrEqual(0);
  expect(g.row!.b - g.row!.t, `${at}: the row's height is unchanged`)
    .toBeCloseTo(before.row!.b - before.row!.t, 1);
  expect(g.hitIsButton, `${at}: the # stays clickable`).toBe(true);
  if (g.place === "drop") {
    // the phone fallback: today's placement, below the row, inside the card
    expect(g.box!.t, `${at}: dropped below the row`).toBeGreaterThanOrEqual(g.btn!.b);
    expect(g.box!.l).toBeGreaterThanOrEqual(g.card!.l - 0.5);
    expect(g.box!.r).toBeLessThanOrEqual(g.card!.r + 0.5);
  } else {
    const mid = (x: NonNullable<Box>) => (x.t + x.b) / 2;
    expect(Math.abs(mid(g.box!) - mid(g.trio!)),
      `${at}: the box's centre is on the trio row's centre`).toBeLessThanOrEqual(2);
    expect(Math.abs(g.labels[0]! - g.labels[1]!), `${at}: its label row is the trio's`)
      .toBeLessThanOrEqual(1);
    for (const [name, other] of [["chip", g.chip], ["trio", g.trio], ["#", g.btn]] as const) {
      expect(meets(g.box, other), `${at}: the box covers the ${name}`).toBe(false);
    }
    expect(g.box!.l, `${at}: inside the viewport`).toBeGreaterThanOrEqual(0);
    expect(g.box!.r, `${at}: inside the viewport`).toBeLessThanOrEqual(g.vw);
    if (g.place === "left") {
      expect(g.box!.r, `${at}: a left box ends at the card's left edge`)
        .toBeLessThanOrEqual(g.card!.l);
    } else {
      expect(g.box!.l, `${at}: a right box starts past the #`).toBeGreaterThanOrEqual(g.btn!.r);
    }
  }
  // a second press closes it
  await btn.click();
  await expect(page.getByTestId("field-ranks")).toHaveCount(0);
  return g.place;
}

test("three-digit ranks on the Leagues board: on the row at every width, "
   + "right of the #, left of the card at the viewport's edge, dropped on a phone",
  async ({ page }) => {
    test.setTimeout(240_000);
    await leagues(page);
    const seen = new Map<number, Set<string>>();
    for (const width of [390, 860, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const idx = await onScreen(page);
      expect(idx.length, `${width}px: cards to measure`).toBeGreaterThan(0);
      const cards = page.locator('[data-testid="picker-row"]');
      const places = new Set<string>();
      for (const i of idx.slice(0, 6)) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        places.add((await assertOnTheRow(page, card, `${width}px card ${i}`))!);
      }
      seen.set(width, places);
    }
    // non-vacuity: every placement the rule has was exercised somewhere
    const all = new Set([...seen.values()].flatMap((s) => [...s]));
    expect(all.has("right"), "some box opened to the right").toBe(true);
    expect(all.has("left"), "some box opened to the left").toBe(true);
    expect(all.has("drop"), "the phone fell back to the drop").toBe(true);
    expect(seen.get(390)).toEqual(new Set(["drop"]));
  });

test("the national field on the Championships board: the same rule",
  async ({ page }) => {
    test.setTimeout(180_000);
    await championships(page);
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const idx = await onScreen(page);
      expect(idx.length).toBeGreaterThan(0);
      const cards = page.locator('[data-testid="picker-row"]');
      for (const i of idx.slice(0, 5)) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await assertOnTheRow(page, card, `championships ${width}px card ${i}`);
      }
    }
  });

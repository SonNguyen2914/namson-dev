/** THE LEAGUE HEADERS FOLLOW THE READER DOWN, AND EACH ONE STAYS OVER
 *  ITS OWN COLUMN.
 *
 *  The operator's screenshot: PREMIER LEAGUE / 7 FIXTURES / PRIOR SZN ·
 *  29% THIS SZN, sliced horizontally by the bottom edge of the pills bar
 *  — the header scrolling up UNDERNEATH the bar and being cut, instead of
 *  stopping against it. "make the league header still going with me when
 *  I go down. It need to go too right under the pills."
 *
 *  WHY IT COULD NOT JUST BE MADE STICKY. `overflow-x: auto` on the board
 *  track forces `overflow-y` to compute to `auto` as well, so the track is
 *  a scrollport in BOTH axes — and `position: sticky` sticks to the
 *  nearest scrollport, never to the viewport. The track's height is its
 *  content height, so a header in there has nothing to stick to at all:
 *  parked at `top: var(--topbar-h)` it measured from the TRACK's edge and
 *  sat ~103px down its own column, permanently. The headers therefore
 *  LEAVE the scrollport — each column portals its own header into the
 *  board's sticky rail — and the rail is carried sideways by the loop.
 *
 *  So there are two things to hold, and they are the two halves of this
 *  file. VERTICALLY the header must come to rest flush under the pills
 *  bar, clipped by nothing. HORIZONTALLY it must be over its own column
 *  at every scroll position, INCLUDING immediately after a rotation —
 *  which is the failure mode a rail invites: the loop rebases
 *  `scrollLeft` by a whole column in the same paint that it turns the
 *  order, and a rail that keeps its own account of where the board is
 *  ends up naming a league one column away from the one underneath it.
 *
 *  And the third half is that none of this reaches a board that never
 *  had the problem: at four columns or fewer there is no overflow, a
 *  narrowed page draws one column, and below `md` the board draws the
 *  one league its tab strip has selected. Those all keep the
 *  sticky-inside-the-column header they always had, and a rail built for
 *  them would be a regression dressed as a feature.
 *
 *  ── WHERE THAT LINE IS, RESTATED 2026-09-16 ─────────────────────────
 *
 *  It was `xl`. The board became a sideways scroller from `md` up on
 *  2026-09-16 — two columns at a time instead of a four-deep stack of
 *  two-wide rows — so the scrollport, and therefore the rail, now start
 *  there. A tablet is on the RAIL side of the line and gets the same
 *  eight tests below; the only width with no rail is the phone, which
 *  has no scrollport because it draws one column.
 *
 *  Nothing about the claim moved. "A header sticks to the viewport and
 *  stays over its own column" is asserted at exactly the widths where a
 *  header is in a rail, and "a board that fits keeps its header inside
 *  its column" at exactly the widths where one is. What moved is which
 *  widths those are, and this file now says so in both directions
 *  rather than only one.
 */
import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, serveEight } from "./eight-columns";
import { boardColumns } from "../src/lib/pickerApi";

const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));

/** A BOARD THAT FITS, off the same payload as the one that does not.
 *  Four columns is the board's whole width, so nothing overflows, no
 *  loop is built and no rail with it — and deriving it from the eight
 *  keeps the two cases the SAME board with a different declaration,
 *  which is the only difference under test. */
const BOARD_FOUR = (() => {
  const keep = COLUMNS.slice(0, 4);
  const leagues = Object.fromEntries(Object.entries(BOARD_EIGHT.leagues)
    .filter(([k]) => keep.includes(k)));
  return {
    ...BOARD_EIGHT, leagues,
    rows: BOARD_EIGHT.rows.filter((r: { league: string }) =>
      keep.includes(r.league)),
    refusals: (BOARD_EIGHT.refusals ?? [])
      .filter((r: { league: string }) => keep.includes(r.league)),
  };
})();

/** Where every header is, where every column is, and where the pills bar
 *  ends — one read, so nothing here compares two different moments.
 *
 *  A HEADER IS FOUND BY ITS OWN LEAGUE, not by its position in a list.
 *  The rail's slots rotate, so index 0 is a different competition after
 *  every step; `data-league` on the section and `data-rail-slot` on the
 *  slot are the two ends of the claim under test and they are read
 *  separately on purpose. A header drawn in its column (the boards
 *  without a rail) reports the league of the section it is inside. */
const geometry = (page: Page) => page.evaluate(() => {
  const el = (s: string) => document.querySelector<HTMLElement>(s);
  const bar = el('[data-testid="board-pillbar"]')?.getBoundingClientRect();
  const rail = el('[data-testid="board-head-rail"]');
  const track = el('[data-testid="board-track"]')!;
  const mid = (b: DOMRect) => b.x + b.width / 2;
  const heads: Record<string, {
    top: number; centre: number; height: number; position: string;
    railed: boolean; ink: string;
  }> = {};
  for (const h of Array.from(
    document.querySelectorAll<HTMLElement>('[data-testid="col-head"]'))) {
    const slot = h.parentElement!;
    const league = slot.dataset.railSlot
      ?? h.closest<HTMLElement>('[data-testid="league-col"]')!.dataset.league!;
    const b = h.getBoundingClientRect();
    heads[league] = {
      top: b.y, centre: mid(b), height: b.height,
      position: getComputedStyle(h).position,
      railed: Boolean(slot.dataset.railSlot),
      /* THE PAINTED INK of the league's own 2px rail. `--lg` is set on
         the section, and a portalled header is no longer INSIDE the
         section — a custom property inherits down the DOM and not down
         the React tree, so a header that leaned on its section's would
         draw this in nothing at all. Read as a resolved colour rather
         than as a token name, which is the only reading that catches
         it. */
      ink: getComputedStyle(
        h.querySelector<HTMLElement>('[data-testid="col-rail"]')!,
      ).backgroundColor,
    };
  }
  const columns: Record<string, number> = {};
  for (const c of Array.from(
    track.querySelectorAll<HTMLElement>('[data-testid="league-col"]'))) {
    columns[c.dataset.league!] = mid(c.getBoundingClientRect());
  }
  return {
    barBottom: bar ? bar.y + bar.height : null,
    hasRail: Boolean(rail),
    railTop: rail ? rail.getBoundingClientRect().y : null,
    scrollLeft: track.scrollLeft,
    pos: Number(el('[data-testid="league-ribbon"]')?.dataset.pos ?? NaN),
    heads, columns,
  };
});

/** TWO AGREEING READS BEFORE A NUMBER IS BELIEVED. `evaluate` does not
 *  auto-wait, and a step is a 300ms glide: a single read lands mid-flight
 *  and describes a board nobody was shown. Agreement is on the scroll
 *  offset AND on every header's centre, because the whole claim here is
 *  that those two move together — a rail lagging the track by a frame
 *  would be invisible to a check on the scroller alone. */
async function still(page: Page) {
  let prev = await geometry(page);
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(80);
    const now = await geometry(page);
    const same = Math.abs(now.scrollLeft - prev.scrollLeft) < 0.5
      && Object.keys(now.heads).length === Object.keys(prev.heads).length
      && Object.entries(now.heads).every(([lg, h]) =>
        prev.heads[lg] && Math.abs(prev.heads[lg].centre - h.centre) < 0.5);
    if (same) return now;
    prev = now;
  }
  throw new Error("the board never came to rest");
}

const openEight = async (page: Page) => {
  await serveEight(page);
  await expect(page.locator('[data-testid="league-col"]'))
    .toHaveCount(COLUMNS.length);
  await expect(page.getByTestId("board-head-rail")).toBeVisible();
  return still(page);
};

/** Far enough down that the board's own rows have replaced the hero, so
 *  a header that did not follow is a header that is gone. */
const readDown = async (page: Page, px = 1400) => {
  await page.mouse.wheel(0, px);
  await page.waitForTimeout(250);
  return still(page);
};

// ── vertically: it stops at the pills bar ───────────────────────────────

test.describe("a scrolled-down board keeps its league headers", () => {
  test("every header comes to rest flush under the pills bar, whole",
    async ({ page }) => {
      await openEight(page);
      const g = await readDown(page);

      expect(g.hasRail, "the eight-column board builds the header rail")
        .toBe(true);
      expect(Object.keys(g.heads).sort(),
        "every declared column still has exactly one header, and it is "
        + "the same one — the rail is where the headers WENT, not a "
        + "second set drawn beside them")
        .toEqual([...COLUMNS].sort());

      for (const [league, h] of Object.entries(g.heads)) {
        expect(h.railed, `${league}'s header is in the rail`).toBe(true);
        /* FLUSH. Not "above the fold", not "somewhere on screen": the
           header's top edge is the pills bar's bottom edge. A gap is a
           strip of rows showing between two bars that should read as one
           stack; an overlap is the operator's screenshot. */
        expect(h.top, `${league}'s header rests ON the pills bar's bottom `
          + "edge — the defect was it sliding underneath and being cut")
          .toBeCloseTo(g.barBottom!, 1);
        /* AND IT IS WHOLE. A header parked at the right y but clipped to
           a sliver would satisfy the line above. */
        expect(h.height, `${league}'s header is drawn at its full height`)
          .toBeGreaterThan(40);
        expect(h.ink, `${league}'s league rail still resolves to a real `
          + "colour in the rail — `--lg` inherits down the DOM, and a "
          + "portalled header is no longer inside its section")
          .toMatch(/^rgba?\((?!0,\s*0,\s*0,\s*0\))/);
      }
    });

  test("the three-line header is intact, and it is the ONE header — "
    + "scrolled down, it is what names the league", async ({ page }) => {
      await openEight(page);
      await readDown(page);
      /* The operator's own layout: name, then fixture count, then the
         season basis. All three, in the rail, reading as they did. */
      const head = page.getByTestId("board-head-rail")
        .locator('[data-testid="col-head"]')
        .filter({ hasText: /premier league/i });
      await expect(head).toHaveCount(1);
      await expect(head.getByRole("heading", { level: 3 }))
        .toHaveText(/premier league/i);
      await expect(head.getByTestId("col-count")).toBeVisible();
      await expect(head.getByTestId("col-season")).toBeVisible();
      /* AND NOTHING WAS LEFT BEHIND IN THE COLUMN. A rail that is a
         COPY is the defect this is built against — two accounts of the
         fixture count, free to drift apart. */
      await expect(page.getByTestId("board-track")
        .locator('[data-testid="col-head"]')).toHaveCount(0);
    });

  test("the pills bar still sticks, because the headers are measured off "
    + "it", async ({ page }) => {
      const before = await openEight(page);
      const after = await readDown(page);
      expect(after.barBottom, "the pills bar scrolled away with the page, "
        + "taking the headers' resting place with it")
        .toBeCloseTo(before.barBottom!, 0);
      /* The offset is MEASURED, never typed: nav plus pills, both read
         off the DOM. This is the arithmetic, checked rather than
         assumed. */
      const topbar = await page.locator("header.topbar").boundingBox();
      const bar = await page.getByTestId("board-pillbar").boundingBox();
      /* EXACTLY the two heights added — not each of them rounded and
         then added, which is half a pixel longer than the stack it
         measures and was how the headers first came to rest 0.5px below
         the bar with a hairline of the page between them. */
      expect(after.railTop!,
        "the rail rests at nav height plus pills height, measured")
        .toBeCloseTo(topbar!.height + bar!.height, 1);
    });
});

// ── horizontally: it stays over its own column ──────────────────────────

test.describe("a header never drifts from the league it names", () => {
  /** Every header's centre against its own column's, in px. */
  const drift = (g: Awaited<ReturnType<typeof geometry>>) =>
    Object.entries(g.heads).map(([lg, h]) =>
      [lg, Math.abs(h.centre - g.columns[lg])] as const);

  test("at every scroll position the board can be left in, including the "
    + "one immediately after a rotation", async ({ page }) => {
      const at: { where: string; g: Awaited<ReturnType<typeof geometry>> }[] =
        [{ where: "at rest", g: await openEight(page) }];

      /* A STEP ON THIS BOARD IS A ROTATION. The loop turns the column
         order and takes exactly one column back off `scrollLeft` in the
         same paint, which is why `scrollLeft` below is UNCHANGED while
         the position advances — and it is exactly the moment a rail with
         its own bookkeeping lands one column out. */
      for (const n of [1, 2, 3]) {
        await page.keyboard.press("ArrowRight");
        at.push({ where: `after ${n} step(s) right`, g: await still(page) });
      }
      await page.keyboard.press("ArrowLeft");
      at.push({ where: "back one", g: await still(page) });
      /* A free scroll, which rests wherever the settle puts it rather
         than on a step boundary. */
      await page.mouse.move(400, 400);
      await page.mouse.wheel(260, 0);
      at.push({ where: "after a free scroll", g: await still(page) });
      /* And scrolled down, where the headers are sticking as well as
         sliding — the two motions at once. */
      at.push({ where: "read down", g: await readDown(page) });

      /* NON-VACUITY: the board genuinely moved, and it genuinely
         rotated. Without this the loop below could pass on a board that
         never left its seat. */
      const seen = new Set(at.map((a) => a.g.pos));
      expect(seen.size, "the board was left in several different places")
        .toBeGreaterThan(2);
      const rebased = at.slice(1, 4).every((a, i) =>
        Math.abs(a.g.scrollLeft - at[i].g.scrollLeft) < 1
        && Math.abs(a.g.pos - at[i].g.pos - 1) < 0.01);
      expect(rebased, "each step rotated the order and rebased the scroll "
        + "by exactly one column — the position advanced while the "
        + "offset did not, which is the seam the rail has to follow")
        .toBe(true);

      for (const { where, g } of at) {
        for (const [league, d] of drift(g)) {
          expect(d, `${where}: ${league}'s header is over ${league}'s `
            + "column. A header a column away from its own league is "
            + "worse than no sticky header at all")
            .toBeLessThan(3);
        }
      }
    });

  test("mid-rotation, while the board is still sliding", async ({ page }) => {
    await openEight(page);
    await readDown(page);
    await page.keyboard.press("ArrowRight");
    /* INSIDE the 300ms glide, not after it. A rail synced in the
       throttled rAF instead of the scroll event is a frame behind here
       and nowhere else — a lag that no settled read can see. */
    const seen: number[] = [];
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(40);
      const g = await geometry(page);
      seen.push(...drift(g).map(([, d]) => d));
      expect(Math.max(...drift(g).map(([, d]) => d)),
        "the headers travel WITH the columns, not after them")
        .toBeLessThan(6);
    }
    expect(seen.length).toBeGreaterThan(20);
  });
});

// ── and the boards that never had the problem ───────────────────────────

test.describe("nothing is done to a board that fits", () => {
  /** A header that sticks INSIDE its own column: the arrangement every
   *  board but the scrolling one has always had, and the one this change
   *  must not touch. */
  const staysSticky = async (page: Page, where: string) => {
    const head = page.getByTestId("col-head").first();
    await expect(head).toBeVisible();
    await expect(page.getByTestId("board-head-rail"), `${where} builds no `
      + "header rail — there is no scrollport to escape from")
      .toHaveCount(0);
    expect(await head.evaluate((e) => getComputedStyle(e).position),
      `${where} keeps a header that sticks in its own column`)
      .toBe("sticky");
    const before = await head.boundingBox();
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
    const after = await head.boundingBox();
    expect(after!.y, `${where}: the header followed the reader down`)
      .toBeGreaterThan(before!.y - 900 + 100);
    await expect(head).toBeVisible();
  };

  test("below md the board draws ONE league, and its header sticks where "
    + "it is", async ({ page }) => {
      /* RESTATED 2026-09-16 — this ran at 1100px and said "below xl the
         columns stack". Both halves of that moved on the same day: the
         stack became a sideways scroller from `md` up (so 1100 now
         RAILS, asserted in the test below), and below `md` the board
         stopped stacking at all and started drawing the one league its
         tab strip names. 393px is where "a board with nothing to scroll
         sideways" now lives, and the property under test — a header that
         sticks inside its own column, with no rail built for it — is the
         one this test always asserted. */
      await page.setViewportSize({ width: 393, height: 780 });
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(1);
      await page.waitForTimeout(400);
      await staysSticky(page, "a phone drawing one league");
    });

  test("…and a tablet is on the OTHER side of that line: two columns, a "
    + "scrollport, and the rail that goes with one", async ({ page }) => {
      /* THE OTHER HALF OF THE SAME CHANGE, asserted rather than assumed.
         The test above used to cover 1100px and claimed no rail is built
         there; a restatement that simply moved to 393 would leave the
         tablet unasserted in either direction, which is how a guard
         quietly stops covering the case it was written for. */
      await page.setViewportSize({ width: 1100, height: 780 });
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      await expect(page.getByTestId("board-head-rail")).toBeVisible();
      const g = await still(page);
      expect(g.hasRail, "a tablet builds the header rail").toBe(true);
      /* AND EVERY HEADER IS IN IT, over its own column — the same two
         claims the eight-column desktop board makes, at a width where
         the board shows two of the eight. */
      expect(Object.keys(g.heads).sort()).toEqual([...COLUMNS].sort());
      for (const [league, h] of Object.entries(g.heads)) {
        expect(h.railed, `${league}'s header is in the rail`).toBe(true);
        expect(Math.abs(h.centre - g.columns[league]),
          `${league}'s header is over ${league}'s column at 1100px`)
          .toBeLessThan(3);
      }
      const down = await readDown(page);
      for (const [league, h] of Object.entries(down.heads)) {
        expect(h.top, `${league}'s header rests on the pills bar's bottom `
          + "edge at 1100px too").toBeCloseTo(down.barBottom!, 1);
      }
    });

  test("a four-column board has nothing to scroll and keeps its headers "
    + "in its columns", async ({ page }) => {
      await serveEight(page, BOARD_FOUR);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(4);
      await page.waitForTimeout(400);
      await staysSticky(page, "a four-column board");
    });

  test("a narrowed page draws one column and keeps its header",
    async ({ page }) => {
      await page.route("**/api/picker/board**",
        (r) => r.fulfill({ status: 200, contentType: "application/json",
          body: JSON.stringify(BOARD_EIGHT) }));
      await page.route("**/api/picker/review**",
        (r) => r.fulfill({ status: 200, contentType: "application/json",
          body: JSON.stringify({ leagues: {}, rows: [], refusals: [] }) }));
      await page.route("**/api/comp/*/ratings",
        (r) => r.fulfill({ status: 200, contentType: "application/json",
          body: JSON.stringify({ competition: "ucl", axes: null,
            why_not: "no field is fitted for this competition" }) }));
      await page.goto("/bet-suggester/ucl");
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(1);
      await page.waitForTimeout(400);
      await staysSticky(page, "/bet-suggester/ucl");
    });
});

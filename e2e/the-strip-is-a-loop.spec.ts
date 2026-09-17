/** THE PHONE'S LEAGUE STRIP IS A LOOP, IT CENTRES, AND THE BOARD BODY
 *  ANSWERS A SWIPE (operator, 2026-09-16: "add it, also since PL is the
 *  start league, put it in the middle of the carrosel, make the carosel
 *  a loop, not one sided").
 *
 *  ── THE THREE CLAIMS ────────────────────────────────────────────────
 *
 *  A LOOP. `move` clamped, and `epl` is the first entry in
 *  `PICKER_COLUMN_ORDER` — which is the league the board opens on. So
 *  the strip's arrival state was the one state where one of its arrows
 *  was dead: ArrowLeft on the Premier League did nothing, and the eighth
 *  column was seven presses away in the only direction that moved. That
 *  is the "one sided". Proven here in BOTH directions and for BOTH
 *  inputs, because a wrap written once and reached two ways can be right
 *  in one of them.
 *
 *  THE MIDDLE, BY SCROLL POSITION. `scrollIntoView({ inline: "center" })`
 *  has always asked for it and could never deliver it at the ends: a
 *  scrollport's range stops at 0, so centring the first tab wants a
 *  negative scrollLeft. MEASURED before this change, iPhone 15 Pro at
 *  393px: `epl` sat 98.5px left of the strip's centre and `ligamx` 125px
 *  right of it — the two ends of the board being the two that could not
 *  be centred. The fix is room at each end, not a reordering: the
 *  declared order is the operator's and this file never lists a slug.
 *
 *  A SWIPE THAT IS NOT STOLEN. The strip is a horizontal scroller and
 *  the board body is a tall stack of cards, so the gesture has to be
 *  scoped twice over — once away from the strip, once away from
 *  anything under the finger that already owns sideways — and the
 *  vertical scroll that is nearly every gesture on a phone has to stay
 *  untouched.
 *
 *  ── REAL TOUCH, NOT A CLICK ─────────────────────────────────────────
 *
 *  Every gesture here is dispatched through `Input.dispatchTouchEvent`
 *  over CDP: a touch sequence the browser's own input pipeline delivers,
 *  which is the only kind that can prove a drag inside the strip SCROLLS
 *  THE STRIP. A synthesised `TouchEvent` would reach React's handler and
 *  scroll nothing, so the half of the claim that matters — the gesture
 *  went somewhere else — would be untestable.
 *
 *  NOTHING HERE READS A LIST OF SLUGS. Every position comes from
 *  `boardColumns(Object.keys(board.leagues))`, the app's own one door
 *  from a declaration to a column set, so a competition joining or
 *  leaving the board moves these expectations with it.
 */
import {
  expect, test, devices, type Browser, type BrowserContext, type CDPSession,
  type Page,
} from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { boardColumns } from "../src/lib/pickerApi";

const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));
const FIRST = COLUMNS[0];
const LAST = COLUMNS[COLUMNS.length - 1];
const MIDDLE = COLUMNS[Math.floor(COLUMNS.length / 2)];

/** Open the eight-column board on a real device.
 *
 *  The board and the review are BOTH fulfilled from the fixture, so
 *  nothing in this file reaches a backend — `/api/picker/board` captures
 *  a pre-kickoff snapshot on every request it answers for real, and a
 *  test suite is not a reason to freeze rows. */
async function open(browser: Browser, device: keyof typeof devices) {
  const { defaultBrowserType: _drop, ...dev } =
    devices[device] as Record<string, unknown>;
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  const json = (body: unknown) => ({
    status: 200, contentType: "application/json", body: JSON.stringify(body),
  });
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
  await page.route("**/api/picker/review**",
    (r) => r.fulfill(json(REVIEW_EIGHT)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
  return { ctx, page };
}

/** TWO AGREEING READS, because `evaluate` does not auto-wait and this
 *  file measures boxes almost exclusively — and the strip's centring
 *  scroll is SMOOTH, so a number read once is a position the strip was
 *  passing through rather than one it came to rest at. */
async function settled<T>(page: Page, read: () => Promise<T>): Promise<T> {
  let prev = await read();
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(80);
    const now = await read();
    if (JSON.stringify(now) === JSON.stringify(prev)) return now;
    prev = now;
  }
  throw new Error("the strip never came to rest");
}

type Pt = { x: number; y: number };

/** ONE FINGER, DOWN, ACROSS AND UP — through the browser's real input
 *  pipeline.
 *
 *  Paced: the moves are spread over frames rather than fired in a burst,
 *  because a scroll is recognised by the compositor from the motion
 *  between touchmoves and an instantaneous jump is not motion. Without
 *  the pacing the strip's own scroll never starts, and the test that the
 *  gesture went to the strip would be measuring the pacing. */
async function drag(page: Page, cdp: CDPSession, from: Pt, to: Pt) {
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart", touchPoints: [{ x: from.x, y: from.y, id: 1 }],
  });
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t, id: 1,
      }],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent",
    { type: "touchEnd", touchPoints: [] });
}

/** A POINT ON THE BOARD BODY THAT IS ACTUALLY ON SCREEN, and that the
 *  document agrees belongs to the board body. The track runs past the
 *  fold, and a gesture dispatched at a viewport coordinate the browser
 *  hit-tests to the sticky bar — or to nothing — would pass or fail for
 *  reasons that have nothing to do with the swipe. */
async function boardPoint(page: Page): Promise<Pt> {
  const p = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>(
      '[data-testid="board-track"]')!;
    const r = track.getBoundingClientRect();
    const top = Math.max(r.top, 0);
    const bottom = Math.min(r.bottom, window.innerHeight);
    const pt = { x: Math.round(r.left + r.width / 2),
      y: Math.round(top + (bottom - top) / 2) };
    const hit = document.elementFromPoint(pt.x, pt.y);
    return { ...pt,
      onBoard: Boolean(hit?.closest('[data-testid="board-track"]')) };
  });
  expect(p.onBoard, "the gesture starts on the board body — a point the "
    + "document hit-tests elsewhere would prove nothing").toBe(true);
  return { x: p.x, y: p.y };
}

/** Which league the board is drawing, off the strip's own lit tab AND
 *  the drawn column — two readers, because a lit tab over the wrong
 *  column is exactly the failure a single reader cannot see. */
async function showing(page: Page): Promise<string> {
  const lit = await page.locator('[data-testid="league-tabs"] '
    + '[role="tab"][aria-selected="true"]').getAttribute("data-slug");
  const cols = await page.locator('[data-testid="league-col"]')
    .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.league!));
  expect(cols, "one league is drawn, and it is the one the lit tab names")
    .toEqual([lit]);
  return lit!;
}

/** How far the named tab's centre sits from the strip's centre, in px. */
const offCentre = (page: Page, slug: string) => page.evaluate((s) => {
  const strip = document.querySelector<HTMLElement>(
    '[data-testid="league-tabs"]')!;
  const tab = strip.querySelector<HTMLElement>(`[data-slug="${s}"]`)!;
  const sr = strip.getBoundingClientRect();
  const tr = tab.getBoundingClientRect();
  return Math.round((((tr.left + tr.right) - (sr.left + sr.right)) / 2) * 10)
    / 10;
}, slug);

const pick = async (page: Page, slug: string) => {
  await page.locator(`[data-testid="league-tabs"] [data-slug="${slug}"]`)
    .click();
  expect(await showing(page)).toBe(slug);
};

/** Put the keyboard on the strip. Roving tabindex means the selected tab
 *  is the strip's only stop, so this is where a reader's Tab lands. */
const focusStrip = (page: Page) => page.locator(
  '[data-testid="league-tabs"] [role="tab"][aria-selected="true"]').focus();

async function cdpFor(ctx: BrowserContext, page: Page) {
  return ctx.newCDPSession(page);
}

// ───────────────────────────────────────────────────── the loop ────

test.describe("the strip loops, and it loops both ways", () => {
  test("ArrowLeft on the FIRST declared column lands on the LAST — the "
    + "press that used to do nothing at all", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");

      /* THE ARRIVAL STATE IS THE BROKEN ONE, which is why this is the
         case worth naming: the board opens on the first declared column
         and that is where ArrowLeft was dead. */
      expect(await showing(page), "the board opens on the first declared "
        + "column").toBe(FIRST);

      await focusStrip(page);
      await page.keyboard.press("ArrowLeft");
      expect(await showing(page), `ArrowLeft from ${FIRST} wraps to ${LAST} `
        + "— it used to clamp and leave the board exactly where it was")
        .toBe(LAST);

      /* AND BACK OVER THE SAME SEAM, the other way. */
      await focusStrip(page);
      await page.keyboard.press("ArrowRight");
      expect(await showing(page),
        `ArrowRight from ${LAST} wraps to ${FIRST}`).toBe(FIRST);
      await ctx.close();
    });

  test("and it still steps one at a time everywhere else — a wrap is not "
    + "a jump", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      /* WALKING THE WHOLE DECLARED SET, forwards, from the first column
         back round to it. A modulo that was right at the seam and wrong
         in the middle would pass the test above. */
      for (let i = 1; i <= COLUMNS.length; i++) {
        await focusStrip(page);
        await page.keyboard.press("ArrowRight");
        expect(await showing(page), `${i} presses right of ${FIRST}`)
          .toBe(COLUMNS[i % COLUMNS.length]);
      }
      /* …and backwards over the same ground. */
      for (let i = 1; i <= COLUMNS.length; i++) {
        await focusStrip(page);
        await page.keyboard.press("ArrowLeft");
        expect(await showing(page), `${i} presses left of ${FIRST}`)
          .toBe(COLUMNS[(COLUMNS.length - (i % COLUMNS.length))
            % COLUMNS.length]);
      }
      await ctx.close();
    });

  test("Home and End still mean the ENDS, not one more step round",
    async ({ browser }) => {
      /* THE TWO KEYS WHOSE WHOLE MEANING IS ABSOLUTE. A reader pressing
         Home to reach the first league is not asking to be carried past
         it, so the loop deliberately does not reach them. */
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      await pick(page, MIDDLE);

      await focusStrip(page);
      await page.keyboard.press("Home");
      expect(await showing(page), "Home reaches the first declared column")
        .toBe(FIRST);
      /* …AND STAYS THERE. Home on the first column is the press that
         would wrap if the loop had been written into these two. */
      await focusStrip(page);
      await page.keyboard.press("Home");
      expect(await showing(page), "Home on the first column holds").toBe(FIRST);

      await focusStrip(page);
      await page.keyboard.press("End");
      expect(await showing(page), "End reaches the last declared column")
        .toBe(LAST);
      await focusStrip(page);
      await page.keyboard.press("End");
      expect(await showing(page), "End on the last column holds").toBe(LAST);
      await ctx.close();
    });
});

// ──────────────────────────────────────────────── the middle ────

test.describe("every tab comes to rest in the middle", () => {
  test("the FIRST, a MIDDLE and the LAST declared column each centre — the "
    + "two ends are the two that could not", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      /* A FEW PIXELS. Not zero: the room at each end is a measured
         half-width and a tab is free to be an odd number of pixels
         wide, so the centre lands on a half-pixel. Before this change
         the first column measured 98.5px off and the last 125px — the
         numbers this tolerance exists to separate itself from. */
      const NEAR = 3;

      for (const slug of [FIRST, MIDDLE, LAST]) {
        await pick(page, slug);
        const off = await settled(page, () => offCentre(page, slug));
        expect(Math.abs(off), `${slug} rests ${off}px from the strip's `
          + "centre — the first and last columns used to pin to the edges "
          + "because a scrollport cannot scroll past its own ends")
          .toBeLessThanOrEqual(NEAR);
      }

      /* AND SO DOES EVERY OTHER ONE. The claim is about the set, not
         about three of it. */
      for (const slug of COLUMNS) {
        await pick(page, slug);
        const off = await settled(page, () => offCentre(page, slug));
        expect(Math.abs(off), `${slug} rests ${off}px off centre`)
          .toBeLessThanOrEqual(NEAR);
      }
      await ctx.close();
    });

  test("the room is scaffolding, not leagues — the strip still offers "
    + "exactly the declared set", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const strip = page.getByTestId("league-tabs");

      /* THE SPACERS ARE NOT TABS AND ARE NOT NAMED. A `tablist` may own
         tabs, and scaffolding that reached the accessibility tree would
         be a ninth and tenth league with no name. */
      await expect(strip.getByRole("tab")).toHaveCount(COLUMNS.length);
      const rooms = strip.locator('[data-testid="tab-room"]');
      await expect(rooms).toHaveCount(2);
      for (const r of await rooms.all()) {
        await expect(r).toHaveAttribute("aria-hidden", /.*/);
      }

      /* THE ORDER IS UNTOUCHED. The middle was bought with scroll
         position; if it had been bought by reordering, this is the line
         that would say so — `boardColumns` is the operator's
         declaration and the strip must read out in exactly its order. */
      const order = await strip.locator('[role="tab"]').evaluateAll((es) =>
        es.map((e) => (e as HTMLElement).dataset.slug!));
      expect(order, "the strip reads out in the declared order — nothing "
        + "here reorders the operator's board").toEqual([...COLUMNS]);

      /* AND THE STRIP IS STILL A REAL SCROLLER, which is what pays for
         eight readable names. */
      const scrolls = await strip.evaluate((e) =>
        e.scrollWidth - e.clientWidth > 4);
      expect(scrolls).toBe(true);

      /* THE ROOM DOES NOT LEAK ONTO THE PAGE. A spacer wide enough to
         centre a 156px tab in a 369px bar is ~99px of extra content,
         and content past the viewport's edge is content nobody can
         reach. The strip contains its own overflow. */
      const { doc, vw } = await settled(page, () => page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        vw: document.documentElement.clientWidth,
      })));
      expect(doc, `the document is ${doc}px wide in a ${vw}px viewport`)
        .toBeLessThanOrEqual(vw + 1);
      await ctx.close();
    });
});

// ───────────────────────────────────────────────── the swipe ────

test.describe("the board body answers a swipe", () => {
  test("dragging the board leftward carries the NEXT league in, and it "
    + "wraps at both seams", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const cdp = await cdpFor(ctx, page);
      const p = await boardPoint(page);

      /* THE DIRECTION CONVENTION, which is `/bet-suggester/leagues`'s:
         dragging leftward (`dx < 0`) carries the next league in from
         the right, the way the content appears to move under a finger. */
      expect(await showing(page)).toBe(FIRST);
      await drag(page, cdp, p, { x: p.x - 150, y: p.y });
      expect(await showing(page), `a leftward drag from ${FIRST} advances `
        + `to ${COLUMNS[1]}`).toBe(COLUMNS[1]);

      await drag(page, cdp, p, { x: p.x + 150, y: p.y });
      expect(await showing(page), "and a rightward drag goes back")
        .toBe(FIRST);

      /* THE SEAM, BACKWARDS: the previous-league gesture on the first
         declared column. This is the swipe half of the dead ArrowLeft. */
      await drag(page, cdp, p, { x: p.x + 150, y: p.y });
      expect(await showing(page), `a rightward drag from ${FIRST} wraps to `
        + `${LAST} — a clamped strip would have stayed put`).toBe(LAST);

      /* AND FORWARDS OVER THE SAME SEAM. */
      await drag(page, cdp, p, { x: p.x - 150, y: p.y });
      expect(await showing(page),
        `a leftward drag from ${LAST} wraps to ${FIRST}`).toBe(FIRST);
      await ctx.close();
    });

  test("…including from down inside the card list, which is where a "
    + "reader actually is", async ({ browser }) => {
      /* THE GESTURE AT SCROLL 0 IS THE EASY ONE. A phone board is a
         column of cards and the reader doing the switching is halfway
         down it, on top of a fixture rather than on the empty top of
         the track — which is a different hit-test, a different set of
         ancestors between the finger and the handler, and the case the
         scoping walk actually has to survive. */
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const cdp = await cdpFor(ctx, page);
      const before = await showing(page);

      const rows = page.locator('[data-testid="picker-row"]');
      expect(await rows.count(), "there are cards to swipe on")
        .toBeGreaterThan(0);
      const card = rows.last();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const deep = await page.evaluate(() => window.scrollY);
      expect(deep, "the reader is down the page, not at the top")
        .toBeGreaterThan(200);

      const b = (await card.boundingBox())!;
      const p = { x: Math.round(b.x + b.width / 2),
        y: Math.round(b.y + Math.min(b.height, 120) / 2) };
      expect(before).toBe(FIRST);
      await drag(page, cdp, p, { x: p.x - 150, y: p.y });
      expect(await showing(page), "a swipe that starts on a fixture card "
        + `advances to ${COLUMNS[1]}, the same as one on the empty track`)
        .toBe(COLUMNS[1]);
      await ctx.close();
    });

  test("a mostly-vertical drag scrolls the page and changes nothing",
    async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const cdp = await cdpFor(ctx, page);
      const p = await boardPoint(page);
      const before = await showing(page);

      /* THE GESTURE THE BOARD IS MADE OF. A phone board is a tall column
         of cards and nearly every drag on it is a scroll; a swipe that
         merely leaned sideways would change the league out from under a
         reader who was reading. */
      const y0 = await page.evaluate(() => window.scrollY);
      await drag(page, cdp, { x: p.x, y: p.y + 120 }, { x: p.x, y: p.y - 120 });
      expect(await showing(page), "a straight vertical drag changes nothing")
        .toBe(before);
      const y1 = await settled(page, () => page.evaluate(() => window.scrollY));
      expect(y1, "…and the page really did scroll — a drag that moved "
        + "nothing would satisfy the line above trivially")
        .toBeGreaterThan(y0);

      /* AND A DIAGONAL THAT IS NOT DOMINANT ENOUGH. 120 across and 120
         down clears the 48px threshold on its own and is refused by the
         1.5x rule — which is the half of the gate that keeps a phone
         usable. */
      await page.evaluate(() => window.scrollTo(0, 0));
      const q = await boardPoint(page);
      const held = await showing(page);
      await drag(page, cdp, q, { x: q.x - 120, y: q.y + 120 });
      expect(await showing(page), "a 45-degree drag is not a swipe")
        .toBe(held);

      /* …AND A SHORT ONE. 30px across is a tap that wandered. */
      await drag(page, cdp, q, { x: q.x - 30, y: q.y });
      expect(await showing(page), "a 30px drag is under the 48px threshold")
        .toBe(held);
      await ctx.close();
    });

  test("a drag that starts INSIDE the tab strip scrolls the strip and "
    + "leaves the board where it was", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const cdp = await cdpFor(ctx, page);
      const strip = page.getByTestId("league-tabs");
      const before = await showing(page);

      const box = (await strip.boundingBox())!;
      /* Away from the lit tab's own ink, so this is a scroll gesture on
         the strip and not a press that wandered. */
      const from = { x: Math.round(box.x + box.width - 12),
        y: Math.round(box.y + box.height / 2) };
      const at0 = await settled(page, () => strip.evaluate((e) => e.scrollLeft));

      await drag(page, cdp, from, { x: from.x - 160, y: from.y });

      const at1 = await settled(page, () => strip.evaluate((e) => e.scrollLeft));
      expect(at1, `the strip scrolled (${at0} to ${at1}) — the gesture went `
        + "to the control the finger was on").toBeGreaterThan(at0);
      expect(await showing(page), "…and the board is still drawing the same "
        + "league. A swipe scoped to the page would have fired here too, "
        + "so the reader would have scrolled the strip AND switched")
        .toBe(before);
      await ctx.close();
    });

  test("a drag that starts inside any OTHER horizontal scroller is left "
    + "to it", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const cdp = await cdpFor(ctx, page);
      const before = await showing(page);

      /* THE CONDITION IS BUILT, AND SAID SO PLAINLY. Measured on this
         fixture at 393px: the board body holds NO horizontally
         scrollable descendant today — so a test that waited for one
         would be a test of the fixture. What the guard has to survive is
         the one that arrives next (a market table, a code block, a day
         band), and that is a DOM condition — overflows sideways, allowed
         to scroll it — rather than a list of testids. So the condition
         is created, inside the real board body, and the real gesture is
         driven at it. */
      const none = await page.evaluate(() => {
        const track = document.querySelector<HTMLElement>(
          '[data-testid="board-track"]')!;
        return Array.from(track.querySelectorAll<HTMLElement>("*")).filter(
          (e) => {
            const ox = getComputedStyle(e).overflowX;
            return (ox === "auto" || ox === "scroll")
              && e.scrollWidth - e.clientWidth > 1;
          }).length;
      });
      expect(none, "today's board body has no sideways scroller of its own "
        + "— which is why the next one has to be built here").toBe(0);

      const spot = await page.evaluate(() => {
        const track = document.querySelector<HTMLElement>(
          '[data-testid="board-track"]')!;
        const box = document.createElement("div");
        box.dataset.testid = "a-sideways-thing";
        box.style.cssText = "overflow-x:auto;width:100%;height:64px;"
          + "white-space:nowrap";
        const wide = document.createElement("div");
        wide.style.cssText = "width:2000px;height:48px";
        box.append(wide);
        track.prepend(box);
        const r = box.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2),
          y: Math.round(r.top + r.height / 2),
          scrolls: box.scrollWidth - box.clientWidth };
      });
      expect(spot.scrolls, "the built scroller really does overflow")
        .toBeGreaterThan(1000);

      const at0 = await page.locator('[data-testid="a-sideways-thing"]')
        .evaluate((e) => e.scrollLeft);
      await drag(page, cdp, { x: spot.x, y: spot.y },
        { x: spot.x - 160, y: spot.y });
      const at1 = await settled(page, () =>
        page.locator('[data-testid="a-sideways-thing"]')
          .evaluate((e) => e.scrollLeft));

      expect(at1, `the scroller scrolled (${at0} to ${at1})`)
        .toBeGreaterThan(at0);
      expect(await showing(page), "and the league did not also change — one "
        + "gesture drove one control").toBe(before);
      await ctx.close();
    });
});

// ───────────────────────────────────── the other two shapes ────

test.describe("the swipe is the phone's, and only the phone's", () => {
  test("a tablet keeps the ribbon and takes no board-level swipe",
    async ({ browser }) => {
      /* THE TABLET STEERS WITH THE RIBBON over a track that reads
         horizontal drags ITSELF — it is a real scroller there, with a
         loop of its own. A board-level swipe would be a second,
         invisible switcher competing with the scroll the reader
         actually started. */
      const { ctx, page } = await open(browser, "iPad (gen 7)");
      await expect(page.getByTestId("league-tabs")).toHaveCount(0);
      await expect(page.getByTestId("board-track"))
        .not.toHaveAttribute("data-swipe", /.*/);
      await ctx.close();
    });

  test("and neither does the desktop board", async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 950 });
    const json = (body: unknown) => ({
      status: 200, contentType: "application/json", body: JSON.stringify(body),
    });
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
    await page.route("**/api/picker/review**",
      (r) => r.fulfill(json(REVIEW_EIGHT)));
    await page.goto("/bet-suggester");
    await expect(page.locator('[data-testid="league-col"]'))
      .toHaveCount(COLUMNS.length);
    await expect(page.getByTestId("league-tabs")).toHaveCount(0);
    await expect(page.getByTestId("board-track"))
      .not.toHaveAttribute("data-swipe", /.*/);
  });
});

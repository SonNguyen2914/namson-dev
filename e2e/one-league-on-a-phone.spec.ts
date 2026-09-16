/** THE BOARD HAS THREE SHAPES, AND THIS IS WHERE THEY ARE ASSERTED.
 *
 *  ── THE MEASUREMENTS THAT DECIDED IT (2026-09-16) ───────────────────
 *
 *  Taken on the live board, iPhone 15 Pro and iPad (gen 7):
 *
 *                          iPhone 393        iPad 810
 *    pill names clipped    8 of 8            3 of 8
 *                          "MLS" wants 18px, "Premier League"
 *                          and holds 1       wants 84px, holds 53
 *    ribbon width          443px in 393      964px in 810
 *    board scrolls         no                no
 *    page height           27,093px          15,493px
 *
 *  The deciding arithmetic is one line: a board column is 356px and a
 *  phone viewport is 393, so only one column is EVER visible. The board
 *  drew all eight anyway, stacked, with a control whose every name was a
 *  sliver — and a second, readable control further down that could only
 *  move you deeper into the same stack. The operator's choice of two
 *  drafts: one league at a time, chosen from a swipeable tab strip.
 *
 *  ── WHAT IS UNDER TEST HERE ─────────────────────────────────────────
 *
 *  Three shapes, three describes, and the third is the point of the
 *  other two: the desktop board shipped on 2026-09-15 and was verified
 *  then, so the phone and the tablet are only allowed to be right if
 *  1680px still behaves exactly as it did.
 *
 *  REAL DEVICE EMULATION, not a viewport resize. `isMobile`, `hasTouch`
 *  and the device pixel ratio change what a layout does — a touch device
 *  has no hover, its scrollbars take no width, and its layout viewport is
 *  driven by the viewport meta. A `setViewportSize` sweep is a desktop
 *  browser in a narrow window, which is not the thing being shipped.
 *  The contexts are built by hand rather than with `test.use`: a device
 *  preset carries `defaultBrowserType`, which `test.use` refuses inside
 *  a describe.
 *
 *  NOTHING HERE READS A LIST OF SLUGS. Every count comes from
 *  `boardColumns(Object.keys(board.leagues))` — the app's own one door
 *  from a declaration to a column set — so a competition joining or
 *  leaving the board changes these expectations with it.
 */
import { expect, test, devices, type Browser, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { boardColumns, leagueLabel } from "../src/lib/pickerApi";
import { auditFloor } from "./the-touch-floor";

const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));

/** Open the eight-column board on a real device.
 *
 *  A device preset carries `defaultBrowserType`, which `newContext`
 *  rejects, so it is stripped here — the one place, rather than at every
 *  call. */
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
 *  file measures boxes almost exclusively. A number read once, mid-
 *  layout, describes a board nobody was shown. */
async function settled<T>(page: Page, read: () => Promise<T>): Promise<T> {
  let prev = await read();
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(80);
    const now = await read();
    if (JSON.stringify(now) === JSON.stringify(prev)) return now;
    prev = now;
  }
  throw new Error("the board never came to rest");
}

/** Which leagues have a column drawn on the page, in track order. */
const drawn = (page: Page) =>
  page.locator('[data-testid="league-col"]')
    .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.league!));

/** DO THE REAL PILLS FIT INSIDE THE BAR?
 *
 *  NOT `scrollWidth`, which has always exceeded the bar and says nothing:
 *  the strip carries two BUFFER slots past each end — aria-hidden
 *  scaffolding for the slide to come from and go to — so its content box
 *  is two slots wider than the bar at every width, clipped at `xl` and
 *  scrolled below it. The question that separates the two shapes is
 *  whether the LEAGUES are all on screen at once, which is what the
 *  desktop's letter reveal depends on and what a phone cannot give
 *  eight of. So it is read off the first and last real pill. */
const pillsFit = (page: Page) => page.evaluate(() => {
  const win = document.querySelector<HTMLElement>(
    '[data-testid="league-ribbon-window"]')!;
  const pills = Array.from(document.querySelectorAll<HTMLElement>(
    '[data-testid="ribbon-pill"]'));
  const w = win.getBoundingClientRect();
  const first = pills[0].getBoundingClientRect();
  const last = pills[pills.length - 1].getBoundingClientRect();
  return {
    overflowX: getComputedStyle(win).overflowX,
    fits: first.left >= w.left - 1 && last.right <= w.right + 1,
    spill: Math.round(last.right - w.right),
  };
});

/** THE PAGE'S OWN HORIZONTAL EXTENT. `documentElement.scrollWidth`, which
 *  is what `e2e/layout-audit.spec.ts` has always read — a number that
 *  exceeds the viewport is content the reader can never reach, whether
 *  or not the page happens to scroll to it. */
const docWidth = (page: Page) => page.evaluate(() => ({
  doc: document.documentElement.scrollWidth,
  vw: document.documentElement.clientWidth,
}));

// ─────────────────────────────────────────────────────── the phone ────

test.describe("a phone draws one league, and its name fits", () => {
  test("every tab names its league WHOLE — the defect this replaces was "
    + "eight names clipped to a sliver", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const strip = page.getByTestId("league-tabs");
      await expect(strip).toBeVisible();
      await expect(strip.getByRole("tab")).toHaveCount(COLUMNS.length);

      const names = await settled(page, () =>
        strip.locator('[data-testid="tab-name"]').evaluateAll((es) =>
          es.map((e) => ({
            text: (e.textContent || "").trim(),
            wants: (e as HTMLElement).scrollWidth,
            has: (e as HTMLElement).clientWidth,
          }))));

      /* NON-VACUITY: a label that is not drawn at all would satisfy
         `scrollWidth <= clientWidth` trivially. Every declared league's
         full label is here, spelled by `leagueLabel`. */
      expect(names.map((n) => n.text).sort())
        .toEqual(COLUMNS.map(leagueLabel).sort());
      for (const n of names) {
        expect(n.wants, `"${n.text}" is drawn whole — it wants ${n.wants}px `
          + `and the box gives it ${n.has}. The ribbon this replaced gave `
          + `"MLS" 1px of the 18 it asks for`)
          .toBeLessThanOrEqual(n.has + 1);
      }
      /* AND THE STRIP ITSELF SCROLLS, which is what pays for the width:
         eight readable names cannot fit a 393px bar at once, and the
         answer is to carry them rather than to shrink them. */
      const scrolls = await strip.evaluate((e) =>
        e.scrollWidth - e.clientWidth > 4);
      expect(scrolls, "the strip is a real horizontal scroller").toBe(true);
      await ctx.close();
    });

  test("exactly one league's cards are drawn, and pressing another tab "
    + "changes which", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const strip = page.getByTestId("league-tabs");
      const lit = strip.locator('[role="tab"][aria-selected="true"]');

      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(1);
      await expect(lit).toHaveCount(1);
      const first = (await drawn(page))[0];
      expect(first, "the drawn column is the one the lit tab names")
        .toBe(await lit.getAttribute("data-slug"));

      /* EVERY OTHER DECLARED LEAGUE IS REACHABLE, and each press draws
         ITS cards and only its cards. Walking all of them rather than
         one, because "the tab strip works" is a claim about the set. */
      for (const slug of COLUMNS) {
        await strip.locator(`[role="tab"][data-slug="${slug}"]`).click();
        await expect(page.locator('[data-testid="league-col"]'))
          .toHaveCount(1);
        expect(await drawn(page), `pressing ${slug} draws ${slug}`)
          .toEqual([slug]);
        await expect(lit).toHaveAttribute("data-slug", slug);
        /* …and the cards on screen belong to it. A column that drew the
           right header over the wrong fixtures would pass every line
           above. */
        const leagues = await page.locator('[data-testid="picker-row"]')
          .evaluateAll((es) => [...new Set(es.map((e) =>
            (e as HTMLElement).closest<HTMLElement>(
              '[data-testid="league-col"]')!.dataset.league!))]);
        for (const l of leagues) expect(l).toBe(slug);
      }

      /* ONE SWITCHER. The wrapped anchor list that used to sit below the
         hero at this width is gone, and the ribbon is not drawn here. */
      await expect(page.getByTestId("league-jump")).toHaveCount(0);
      await expect(page.getByTestId("league-ribbon")).toHaveCount(0);
      await ctx.close();
    });

  test("the page does not scroll sideways, at any tab", async ({ browser }) => {
    const { ctx, page } = await open(browser, "iPhone 15 Pro");
    const strip = page.getByTestId("league-tabs");
    for (const slug of COLUMNS) {
      await strip.locator(`[role="tab"][data-slug="${slug}"]`).click();
      await expect(page.locator(
        `[data-testid="league-col"][data-league="${slug}"]`)).toHaveCount(1);
      const { doc, vw } = await settled(page, () => docWidth(page));
      expect(doc, `${slug}: the document is ${doc}px wide in a ${vw}px `
        + "viewport — content past the edge is content nobody can reach")
        .toBeLessThanOrEqual(vw + 1);
    }
    await ctx.close();
  });

  test("the page is a screenful of one league, not a stack of eight",
    async ({ browser }) => {
      /* THE CEILING, AND WHY IT IS THIS NUMBER. The live board at 393px
         measured 27,093px on 2026-09-16 (9,361px on the smaller slate
         the operator first audited). This fixture is a trimmed board —
         two ranked rows and one refusal per league — so its absolute
         height is its own; what the ceiling has to say is that the page
         holds ONE league's worth of it. Measured at 1,714px with the
         hero's paragraph folded; 2,400 is that with room for a fixture
         or two more before anybody should have to look at this again. */
      const CEILING = 2_400;
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const strip = page.getByTestId("league-tabs");

      const heights: Record<string, number> = {};
      for (const slug of COLUMNS) {
        await strip.locator(`[role="tab"][data-slug="${slug}"]`).click();
        await expect(page.locator(
          `[data-testid="league-col"][data-league="${slug}"]`)).toHaveCount(1);
        heights[slug] = await settled(page, () => page.evaluate(() =>
          Math.max(document.documentElement.scrollHeight,
            document.body.scrollHeight)));
        expect(heights[slug], `${slug}: the page is ${heights[slug]}px`)
          .toBeLessThan(CEILING);
      }

      /* NON-VACUITY, and it is the whole claim. A ceiling met because
         the board is small says nothing. The eight leagues TOGETHER are
         several times it — which is the stack this replaced, and the
         reason one screenful is worth having. */
      const together = Object.values(heights).reduce((a, b) => a + b, 0);
      expect(together, "the eight leagues hold far more than one page — if "
        + "they did not, drawing one of them would not be what made this "
        + "page short, and this ceiling would be measuring nothing")
        .toBeGreaterThan(CEILING * 3);
      await ctx.close();
    });

  test("every control has a thumb — 44x44, and it is a real hit area",
    async ({ browser }) => {
      /* RESTATED 2026-09-16, SAME DAY, AND WHAT MOVED IS THE GATE, not
         the claim. This test still says exactly what it said: at phone
         size every control carries a 44px hit area and the hit area is
         real. What changed underneath it is WHY it applies here — the
         floor was gated on `width < 48rem` and is now gated on
         `any-pointer: coarse`, because an iPad is a touch device that
         sits above the phone line and kept the mouse-sized controls.
         This device emulates touch, so it is still floored, and it is
         the phone half of the same claim that
         `e2e/the-floor-is-the-pointer-not-the-width.spec.ts` makes at
         810, 1080 and 1680.

         THE AUDIT ITSELF MOVED TO `e2e/the-touch-floor.ts` and is no
         longer written out here. It was the second copy the moment a
         tablet needed the same question asked, and a copy of a
         measurement is the copy that rots — this one had already drifted
         from the truth in two places a rect cannot see: it counted
         controls inside a closed `<details>`, which report a healthy box
         and are not rendered, and disabled ones, which Chromium will not
         hit-test at all. */
      const { ctx, page } = await open(browser, "iPhone 15 Pro");
      const a = await auditFloor(page);

      /* THE FLOOR IS READ OFF THE STYLESHEET, not typed here: one
         `--tap-floor`, declared in globals.css, used by the rule that
         grows the hit areas and by the tab strip's own min size. */
      expect(a.floor, "--tap-floor is declared").toBeGreaterThanOrEqual(44);

      /* NON-VACUITY: this page really is full of controls, and they are
         really still small ink. An empty list over an empty control set
         is the shape this refuses, and so is a floor that grew the ink. */
      expect(a.census, "the audit found the page's controls")
        .toBeGreaterThan(20);
      expect(a.smallInk, "the ink is still small — the floor is a hit area "
        + "and not the padding it was written not to be")
        .toBeGreaterThan(a.census / 3);
      expect(a.examples,
        `these controls are under ${a.floor}px at phone width`).toEqual([]);
      expect(a.small).toBe(0);
      expect(a.pressFail, "every control answered a press at the floor")
        .toBe(0);
      expect(a.theft, "and none of them answered for a neighbour").toBe(0);

      /* AND THE HIT AREA IS REAL, not a computed style that happens to
         exist. A 15x15 `i` must answer a press well outside its ink —
         which is the only reading that tells a floor from a decoration.
         Kept as a named, readable case on top of the derived audit. */
      const i = page.getByTestId("tier-read").first();
      await i.scrollIntoViewIfNeeded();
      const box = await settled(page, async () => (await i.boundingBox())!);
      expect(box.height, "the tier-read glyph is still small ink — if it "
        + "had grown to 44px this would no longer be testing the hit area")
        .toBeLessThan(a.floor);
      await expect(i).toHaveAttribute("aria-expanded", "false");
      await page.mouse.click(box.x + box.width / 2,
        box.y + box.height / 2 - (a.floor / 2 - 4));
      await expect(i).toHaveAttribute("aria-expanded", "true");
      await ctx.close();
    });

  test("the hero folds and nothing in it is deleted", async ({ browser }) => {
    const { ctx, page } = await open(browser, "iPhone 15 Pro");
    /* THE TITLE AND THE EYEBROW STAY ON SCREEN — they are what says
       whose board this is. */
    await expect(page.getByRole("heading", { name: "Every fixture, ranked" }))
      .toBeVisible();

    /* THE PARAGRAPH IS FOLDED, NOT CUT. Closed on arrival, behind a
       summary that says what opening it gets you… */
    const intro = page.getByTestId("board-intro");
    await expect(intro).not.toHaveAttribute("open", /.*/);
    const summary = page.getByTestId("board-intro-summary");
    await expect(summary).toBeVisible();
    /* …and every charter sentence is behind it, unchanged. This is the
       same `<p>` e2e/picker-prose.spec.ts pins, in the same place — a
       phone-only short version would have been a second copy of a
       decision-safety invariant, free to drift. */
    await summary.click();
    await expect(intro).toHaveAttribute("open", /.*/);
    const framing = page.getByTestId("board-framing");
    await expect(framing).toBeVisible();
    for (const phrase of [
      /no model runs on this page/i,
      /no number below is a probability or an edge of ours/i,
      /nothing here is a recommendation/i,
      /you are the one who picks/i,
    ]) await expect(framing).toContainText(phrase);

    /* THE PROVENANCE IS ONE ROW, AND STILL SAYS EVERYTHING. Truncated at
       the viewport's edge — which is a decision about the ellipsis, not
       about the text: the whole sentence is in the element, so a screen
       reader reads it and the page has not quietly lost the zone its
       kickoffs are in. */
    const prov = page.getByTestId("board-provenance");
    await expect(prov).toBeVisible();
    await expect(prov).toContainText("kickoffs in");
    await expect(prov).toContainText(/built /);
    await expect(prov).toContainText(/slate /);
    const box = await settled(page, async () => (await prov.boundingBox())!);
    const lineH = await prov.evaluate((e) =>
      parseFloat(getComputedStyle(e).lineHeight) || 16);
    expect(box.height, `the provenance is one line (${Math.round(box.height)}px `
      + `against a ${Math.round(lineH)}px line) — it was five`)
      .toBeLessThan(lineH * 2);
    await ctx.close();
  });
});

// ────────────────────────────────────────────────────── the tablet ────

test.describe("a tablet scrolls the board instead of stacking it", () => {
  test("the track is a real horizontal scroller, and it loops",
    async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPad (gen 7)");
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      const track = page.getByTestId("board-track");

      const geom = await settled(page, () => track.evaluate((e) => ({
        scrolls: e.scrollWidth - e.clientWidth > 4,
        overflowX: getComputedStyle(e).overflowX,
        cols: e.style.getPropertyValue("--cols"),
        colw: Math.round(parseFloat(e.style.getPropertyValue("--colw")) || 0),
        client: Math.round(e.clientWidth),
      })));
      expect(geom.scrolls, "the board scrolls sideways at tablet width — it "
        + "used to stack four rows of two").toBe(true);
      expect(geom.overflowX).toBe("auto");
      expect(geom.cols, "every declared column is on the track")
        .toBe(String(COLUMNS.length));
      /* TWO COLUMNS ON SCREEN, and a column exactly the width
         `md:grid-cols-2` already gave it: (track − one 24px gutter) / 2.
         The board is reached differently; the card is not redrawn. */
      expect(geom.colw, "a column is half the track less one gutter")
        .toBeCloseTo((geom.client - 24) / 2, 0);

      /* AND IT LOOPS. The end is removed by rotating the column order
         and rebasing `scrollLeft` by exactly one column, so stepping
         past the last column arrives at the first rather than stopping.
         Read off the ribbon's own position, which is the loop's account
         of where the board is. */
      const pos = () => page.getByTestId("league-ribbon")
        .evaluate((e) => Number((e as HTMLElement).dataset.pos));
      const start = await settled(page, pos);
      for (let i = 0; i < COLUMNS.length + 2; i++) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(360);
      }
      const end = await settled(page, pos);
      expect(end - start, "the board advanced one column per step and never "
        + "hit an end — a bounded scroller would have stopped short")
        .toBeCloseTo(COLUMNS.length + 2, 1);
      await ctx.close();
    });

  test("the ribbon's names are whole here too — four at a time, and it "
    + "scrolls for the rest", async ({ browser }) => {
      const { ctx, page } = await open(browser, "iPad (gen 7)");
      const pills = page.locator('[data-testid="ribbon-pill"]');
      await expect(pills).toHaveCount(COLUMNS.length);
      const names = await settled(page, () =>
        pills.locator('[data-testid="ribbon-name"]').evaluateAll((es) =>
          es.map((e) => ({
            text: (e.textContent || "").trim(),
            wants: (e as HTMLElement).scrollWidth,
            has: (e as HTMLElement).clientWidth,
          }))));
      expect(names.length).toBe(COLUMNS.length);
      for (const n of names) {
        expect(n.text.length, "a pill with no letters in it would satisfy "
          + "the next line trivially").toBeGreaterThan(0);
        expect(n.wants, `"${n.text}" is drawn whole at tablet width — it `
          + `wants ${n.wants}px and holds ${n.has}. It used to hold 53`)
          .toBeLessThanOrEqual(n.has + 1);
      }
      /* …WHICH IT PAYS FOR BY SCROLLING rather than by dividing the bar
         eight ways. Eight readable names do not fit an iPad's 770px bar
         and the answer is to carry them: the window is a real scroller
         here, and the eighth pill is genuinely past its right edge. */
      const fit = await settled(page, () => pillsFit(page));
      expect(fit.overflowX, "the strip's window scrolls at tablet width")
        .toBe("auto");
      expect(fit.fits, "all eight pills fit the bar, so nothing is being "
        + "carried and the slot width did not change after all").toBe(false);
      expect(fit.spill, "the eighth pill is past the bar's right edge")
        .toBeGreaterThan(40);
      await ctx.close();
    });
});

// ───────────────────────────────────────────────────── the desktop ────

test.describe("the desktop board is exactly what shipped", () => {
  test("at 1680px: four columns on screen, eight on the track, a rail, a "
    + "loop and no clipped name", async ({ page }) => {
      /* NON-REGRESSION. The scroll loop, the headers parked at the pills
         bar, the letter reveal and the colour sweep all shipped on
         2026-09-15 and were verified then. Nothing in the phone or
         tablet work may reach them, and 1680 is a width neither of those
         describes touches. */
      await page.setViewportSize({ width: 1680, height: 950 });
      const json = (body: unknown) => ({
        status: 200, contentType: "application/json",
        body: JSON.stringify(body),
      });
      await page.route("**/api/picker/board**",
        (r) => r.fulfill(json(BOARD_EIGHT)));
      await page.route("**/api/picker/review**",
        (r) => r.fulfill(json(REVIEW_EIGHT)));
      await page.goto("/bet-suggester");
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      await expect(page.getByTestId("board-head-rail")).toBeVisible();

      const g = await settled(page, () =>
        page.getByTestId("board-track").evaluate((e) => ({
          colw: Math.round(parseFloat(e.style.getPropertyValue("--colw")) || 0),
          client: Math.round(e.clientWidth),
          scrolls: e.scrollWidth - e.clientWidth > 4,
        })));
      expect(g.scrolls).toBe(true);
      /* FOUR ON SCREEN — the measured desktop number, untouched by the
         tablet's two. */
      expect(g.colw, "four columns fill the track exactly")
        .toBeCloseTo((g.client - 24 * 3) / 4, 0);

      /* THE STRIP STILL HOLDS EVERY LEAGUE AT ONCE HERE, which is what
         makes the letter reveal legible: the slots hold still and their
         names change in place, and a strip the reader can scroll would
         move them. Both halves — the window cannot scroll, and every
         pill is inside it. */
      const fit = await settled(page, () => pillsFit(page));
      expect(fit.overflowX,
        "the desktop strip's window is clipped, not scrollable").toBe("clip");
      expect(fit.fits, `every league's pill is inside the bar — the last `
        + `one overhangs by ${fit.spill}px`).toBe(true);
      const names = await settled(page, () =>
        page.locator('[data-testid="ribbon-pill"] [data-testid="ribbon-name"]')
          .evaluateAll((es) => es.map((e) => ({
            text: (e.textContent || "").trim(),
            wants: (e as HTMLElement).scrollWidth,
            has: (e as HTMLElement).clientWidth,
          }))));
      for (const n of names) {
        expect(n.wants, `"${n.text}" at 1680px`)
          .toBeLessThanOrEqual(n.has + 1);
      }

      /* AND NEITHER NARROW CONTROL IS ON THE PAGE. */
      await expect(page.getByTestId("league-tabs")).toHaveCount(0);
      await expect(page.getByTestId("league-jump")).toHaveCount(0);

      /* THE HERO IS A PARAGRAPH, not a disclosure: the `<details>` is
         open and its summary is not drawn. */
      await expect(page.getByTestId("board-framing")).toBeVisible();
      await expect(page.getByTestId("board-intro"))
        .toHaveAttribute("open", /.*/);
      await expect(page.getByTestId("board-intro-summary")).toBeHidden();

      const { doc, vw } = await settled(page, () => docWidth(page));
      expect(doc, "the desktop page does not scroll sideways either")
        .toBeLessThanOrEqual(vw + 1);
    });
});

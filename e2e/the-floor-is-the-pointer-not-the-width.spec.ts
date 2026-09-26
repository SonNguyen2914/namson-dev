/** A FINGER IS NOT A WIDTH.
 *
 *  ── THE MEASUREMENT THAT DECIDED IT (2026-09-16) ────────────────────
 *
 *  The touch floor shipped that morning gated at `@media (width <
 *  48rem)` — the line the BOARD changes shape at, which is a fact about
 *  columns and not about hands. Measured on the live board hours later:
 *
 *                          controls under 44x44
 *    phone 393             passes — the floor applies
 *    tablet portrait 810   210 of 279
 *    tablet landscape 1080 210 of 279
 *    desktop 1680          222 of 291   (a mouse; left alone on purpose)
 *
 *  An iPad is a touch device and it sits above the phone line, so it
 *  kept the mouse-sized controls.
 *
 *  ── WHY `any-pointer` AND NOT `pointer` ─────────────────────────────
 *
 *  `pointer` describes the PRIMARY pointer only. Attach a Magic Keyboard
 *  to an iPad and iPadOS starts reporting `pointer: fine` and `hover:
 *  hover`, so a tablet would lose its touch floor the moment a trackpad
 *  came within reach of the same screen and get it back when the
 *  keyboard came off — the layout changing shape under the reader's
 *  hands. A Windows or ChromeOS touch laptop reads the same way, its
 *  trackpad primary and its touchscreen ignored. `any-pointer: coarse`
 *  asks whether ANY available input is coarse, which is the question
 *  worth asking: there is a finger on this screen. Hover was considered
 *  and gets that same iPad wrong in the same direction.
 *
 *  ── WHAT IS UNDER TEST ──────────────────────────────────────────────
 *
 *  The claim is not "the tablet is wide enough now". It is that THE GATE
 *  IS THE POINTER, so the last test here runs ONE width — 1080 — under
 *  two pointers and requires opposite answers. Widen the media query
 *  back to a width and that test fails on the half it would now catch;
 *  narrow it to `pointer: coarse` and the tablet halves fail.
 *
 *  REAL DEVICE EMULATION, not a viewport resize: `pointer` only reports
 *  coarse when the context actually emulates touch, so a `setViewportSize`
 *  sweep would test a desktop browser in a narrow window and conclude
 *  the floor was broken. A device preset carries `defaultBrowserType`,
 *  which `test.use` refuses inside a describe and `newContext` rejects,
 *  so it is stripped in `open` — the one place.
 *
 *  REDUCED MOTION IS HONOURED, and it is load-bearing twice: the charter
 *  asks it of the page, and the page sets `html { scroll-behavior:
 *  smooth }` — an audit that scrolls a control into view and then reads
 *  `elementFromPoint` while that scroll is still travelling measures two
 *  different offsets and calls a healthy control unreachable.
 */
import { expect, test, devices, type Browser } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT, routeEight } from "./eight-columns";
import { pageRoutes, PAGE_COUNT } from "./page-routes";
import { auditFloor } from "./the-touch-floor";

/** iPad (gen 7) is 810x1080 portrait and 1080x810 landscape, which are
 *  the two widths the live audit was taken at. */
async function open(browser: Browser, dev: Record<string, unknown>) {
  const { defaultBrowserType: _drop, ...rest } = dev;
  const ctx = await browser.newContext({ ...rest, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const json = (body: unknown) => ({ status: 200,
    contentType: "application/json", body: JSON.stringify(body) });
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
  await page.route("**/api/picker/review**",
    (r) => r.fulfill(json(REVIEW_EIGHT)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
  return { ctx, page };
}

const TOUCH = {
  "tablet portrait 810": devices["iPad (gen 7)"],
  "tablet landscape 1080": devices["iPad (gen 7) landscape"],
} as Record<string, Record<string, unknown>>;

/** A MOUSE AT THE SAME SIZE. No `hasTouch`, no `isMobile` — this is what
 *  a desktop browser is, at whatever width we hand it. */
const mouse = (width: number, height: number) => ({
  ...devices["Desktop Chrome"], viewport: { width, height },
}) as Record<string, unknown>;

// ───────────────────────────────────── a tablet is a touch device ────

test.describe("a coarse pointer gets the floor, at both orientations", () => {
  for (const [label, dev] of Object.entries(TOUCH)) {
    test(`${label}: every control answers a press at the floor`,
      async ({ browser }) => {
        const { ctx, page } = await open(browser, dev);
        const a = await auditFloor(page);

        expect(a.floor, "--tap-floor is declared, and read off the "
          + "stylesheet rather than typed here").toBeGreaterThanOrEqual(44);

        /* NON-VACUITY, FIRST HALF: this page really is full of controls,
           and they really are small. An audit over an empty set, or over
           a page whose controls were all 44px anyway, would satisfy the
           next assertion while measuring nothing. */
        expect(a.census, "the audit found the board's controls")
          .toBeGreaterThan(40);
        expect(a.smallInk, "the controls are still SMALL INK — if the floor "
          + "had inflated them this would be near zero and the floor would "
          + "be the padding it was written not to be")
          .toBeGreaterThan(a.census / 3);
        expect(a.grown, "…and they carry hit areas")
          .toBeGreaterThan(a.census / 2);

        /* THE CENSUS: nothing is under the floor once the hit area
           counts. `examples` carries both the controls that measured
           short and the ones that did not answer a press, so it is
           asserted first — an empty list is the readable failure. */
        expect(a.examples, `${label}: controls under ${a.floor}px, or that `
          + `did not answer a press at it`).toEqual([]);
        expect(a.small, `${label}: controls under the floor`).toBe(0);

        /* AND THE PART A BOX CANNOT TELL YOU. Every control pressed 18px
           outside its own ink answered for itself. */
        expect(a.pressed, "controls were actually pressed — a press audit "
          + "that reached nothing proves nothing").toBeGreaterThan(8);
        expect(a.pressFail, `${label}: controls that did not answer a press `
          + `at the floor`).toBe(0);

        /* THE FLOOR DOES NOT STEAL. A 44px box around a 15px glyph can
           reach over its neighbour, and a press aimed at one control
           answered by the one beside it is worse than no floor at all. */
        expect(a.thefts).toEqual([]);
        expect(a.theft, `${label}: presses answered by the wrong control`)
          .toBe(0);

        /* AND THE PAGE STILL DOES NOT SCROLL SIDEWAYS. A latent
           containing-block bug stretched this document to 1514px in an
           810px viewport once; the floor adds `position: relative` to
           every control, which is exactly the kind of change that could
           do it again. */
        expect(a.doc, `${label}: the document is no wider than the viewport`)
          .toBeLessThanOrEqual(a.vw + 1);
        await ctx.close();
      });
  }
});

// ────────────────────────────────────── and a mouse does not ─────────

test.describe("a fine pointer is left exactly as it shipped", () => {
  test("at 1680 no control is inflated and none carries a hit area",
    async ({ browser }) => {
      const { ctx, page } = await open(browser, mouse(1680, 950));
      const a = await auditFloor(page);

      /* NOT ONE. The floor is off here, and `grown` is the direct read of
         that: no control has an `::after` from the floor rule at all. */
      expect(a.grown, "a mouse needs no thumb, and 44px boxes around inline "
        + "links at 1680 would overlap each other").toBe(0);

      /* WHICH MEANS THE DESKTOP IS UNCHANGED, and the proof that it is
         unchanged is that the controls are STILL SMALL — the count the
         live audit took at 1680 and deliberately left alone. A floor
         that had leaked onto the desktop would drive this to zero. */
      expect(a.census).toBeGreaterThan(40);
      expect(a.small, "the desktop's controls are the size they shipped")
        .toBeGreaterThan(a.census / 3);
      expect(a.small).toBe(a.smallInk);

      /* AND THE RIBBON'S BAR IS STILL THE HEIGHT THE PARKED HEADERS AND
         THE LETTER REVEAL WERE MEASURED AGAINST. The one rule that does
         change a box — room for a hit area the scroller would otherwise
         clip — is on the same coarse-pointer gate, so it must not be
         here. */
      const win = page.getByTestId("league-ribbon-window");
      const h = await win.evaluate((e) =>
        Math.round(e.getBoundingClientRect().height));
      expect(h, "the desktop ribbon is not given touch room")
        .toBeLessThan(44);
      await ctx.close();
    });
});

// ─────────────────────── the same width, and two different answers ────

test.describe("the gate is the pointer, and this is how you know", () => {
  test("1080px wide twice: coarse gets the floor, fine does not",
    async ({ browser }) => {
      /* THE WHOLE CLAIM IN ONE TEST. Both halves are 1080px across, so
         WIDTH cannot explain the difference between them and only the
         pointer can. Restore `@media (width < 48rem)` and the coarse
         half fails; widen it to cover the desktop and the fine half
         fails; narrow it to `pointer: coarse` and the coarse half fails
         again, because a device with a trackpad in reach reports a fine
         primary pointer. */
      const t = await open(browser, TOUCH["tablet landscape 1080"]);
      const coarse = await auditFloor(t.page);
      const q = await t.page.evaluate(() => ({
        any: matchMedia("(any-pointer: coarse)").matches,
        primary: matchMedia("(pointer: coarse)").matches,
        vw: innerWidth,
      }));
      await t.ctx.close();

      const m = await open(browser, mouse(1080, 810));
      const fine = await auditFloor(m.page);
      const fq = await m.page.evaluate(() => ({
        any: matchMedia("(any-pointer: coarse)").matches,
        vw: innerWidth,
      }));
      await m.ctx.close();

      expect(q.vw, "the touch half is 1080 across").toBe(1080);
      expect(fq.vw, "and so is the mouse half").toBe(1080);
      expect(q.any, "the tablet reports a coarse pointer available").toBe(true);
      expect(fq.any, "the desktop reports none").toBe(false);

      expect(coarse.grown, "at 1080 WITH a finger, the controls are floored")
        .toBeGreaterThan(0);
      expect(fine.grown, "at the SAME 1080 with only a mouse, they are not")
        .toBe(0);
      expect(coarse.small, "nothing under the floor on the touch half").toBe(0);
      expect(fine.small, "and the mouse half keeps its small controls, which "
        + "is the desktop that shipped").toBeGreaterThan(0);
    });
});

// ─────────────────────── and the floor is on every page, not four ────

/* EVERY ROUTE, AT A PHONE, WITH A FINGER (2026-09-25, audit F11).
 *
 * The floor shipped as a subtree rule on the board, and the board is
 * what the tests above walk — so they stayed green while the floor
 * covered four surfaces of nineteen. Measured on an iPhone 13 that
 * morning: every control on the other fourteen routes was under 44px,
 * the back link at 8x17 and the field link at 23x19.
 *
 * The routes come from the pages directory (e2e/page-routes.ts), never
 * a list: a page added tomorrow is walked here without anybody
 * remembering to. Each is read HERMETICALLY — the board from its
 * eight-column recording, everything else in the failed-read state the
 * stand-in backend gives every unmocked read, which is a real state the
 * page has to be pressable in, and whose chrome is every page's. */
const ROUTES = pageRoutes();

test("the route walk is every page the app serves", () => {
  expect(ROUTES.length, "pages under src/pages, one route each")
    .toBe(PAGE_COUNT);
  expect(new Set(ROUTES.map((r) => r.url)).size).toBe(ROUTES.length);
});

test.describe("a phone with a finger gets the floor on every route", () => {
  for (const r of ROUTES) {
    test(`${r.template} at 390: every control answers a press at the floor`,
      async ({ browser }) => {
        const phone: Record<string, unknown> = { ...devices["iPhone 13"] };
        delete phone.defaultBrowserType;
        const ctx = await browser.newContext({ ...phone,
          reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await routeEight(page);
        await page.goto(r.url, { waitUntil: "load" });
        await page.waitForSelector("header.topbar");
        await page.waitForTimeout(700);
        const vw = await page.evaluate(() => innerWidth);
        const coarse = await page.evaluate(() =>
          matchMedia("(any-pointer: coarse)").matches);
        const a = await auditFloor(page);

        expect(vw, "a phone is 390 across").toBe(390);
        expect(coarse, "and reports a finger").toBe(true);
        /* NON-VACUITY: every page carries the nav, so every page has
           controls, and some of them were pressed. */
        expect(a.census, `${r.template}: the audit found controls`)
          .toBeGreaterThan(0);
        expect(a.pressed, `${r.template}: controls were pressed`)
          .toBeGreaterThan(0);

        expect(a.examples, `${r.template}: controls under ${a.floor}px, or `
          + `that did not answer a press at it`).toEqual([]);
        expect(a.small, `${r.template}: controls under the floor`).toBe(0);
        expect(a.pressFail, `${r.template}: presses at the floor that `
          + `nothing answered`).toBe(0);
        expect(a.thefts).toEqual([]);
        expect(a.theft, `${r.template}: presses answered by the wrong `
          + `control`).toBe(0);
        /* AND IT MOVES NOTHING. The floor grows a hit area and nothing
           else; a control that positions itself keeps its position. */
        expect(a.repositioned, `${r.template}: controls the floor moved`)
          .toEqual([]);
        expect(a.doc, `${r.template}: no sideways scroll`)
          .toBeLessThanOrEqual(a.vw + 1);
        await ctx.close();

        /* AND A MOUSE AT THE SAME 390 GETS NOTHING. The floor is on the
           app shell now, so "the desktop is unchanged" is a claim about
           every page, and it is checked on every page: no control
           carries a hit area without a coarse pointer. */
        const desk = mouse(390, 844);
        delete desk.defaultBrowserType;
        const m = await browser.newContext({ ...desk,
          reducedMotion: "reduce" });
        const mp = await m.newPage();
        await routeEight(mp);
        await mp.goto(r.url, { waitUntil: "load" });
        await mp.waitForSelector("header.topbar");
        const fine = await auditFloor(mp);
        expect(fine.census, `${r.template}: the mouse half found controls`)
          .toBeGreaterThan(0);
        expect(fine.grown, `${r.template}: a mouse gets no hit areas`)
          .toBe(0);
        await m.close();
      });
  }
});

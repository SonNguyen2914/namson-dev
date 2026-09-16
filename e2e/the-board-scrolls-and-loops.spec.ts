/** THE BOARD MOVES, AND THE RIBBON IS A FUNCTION OF WHERE IT IS.
 *
 *  The operator approved a draft whose board is a continuously scrolling,
 *  seamlessly looped horizontal track. What shipped drew FOUR columns and
 *  swapped all four of them on a keypress: no scroll, no position, no
 *  motion of any kind — the final form of the judder the draft's own
 *  notes describe, where a ribbon animated on DISCRETE position changes
 *  beside a board that scrolled CONTINUOUSLY.
 *
 *  These pin the mechanism rather than the look, because the look is the
 *  thing that was lost while every existing guard stayed green: the lit
 *  SET is identical whether the board slides or teleports.
 */
import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, serveEight } from "./eight-columns";
import { boardColumns } from "../src/lib/pickerApi";

const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));
const VIEW = 4;

/** WHERE THE TRACK IS, read off the track itself rather than off the
 *  ribbon — the ribbon is the thing under test and cannot be its own
 *  witness. `lead` is the column whose left edge is nearest the
 *  scrollport's, which is the leftmost column on screen. */
const trackState = (page: Page) => page.evaluate(() => {
  const t = document.querySelector<HTMLElement>('[data-testid="board-track"]')!;
  const box = t.getBoundingClientRect();
  const cols = [...t.querySelectorAll<HTMLElement>('[data-testid="league-col"]')]
    .map((c) => ({ slug: c.dataset.league!,
                   x: c.getBoundingClientRect().left - box.left }));
  const lead = cols.slice().sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
  const onScreen = cols
    .filter((c) => c.x > -4 && c.x < box.width - 4)
    .sort((a, b) => a.x - b.x).map((c) => c.slug);
  const strip = document.querySelector<HTMLElement>('[data-testid="league-ribbon"]')!;
  return {
    scrollLeft: t.scrollLeft,
    max: t.scrollWidth - t.clientWidth,
    clientWidth: t.clientWidth,
    columns: cols.length,
    lead: lead.slug,
    leadOffset: lead.x,
    onScreen,
    pos: Number(strip.dataset.pos),
    transform: getComputedStyle(strip).transform,
  };
});

/** TWO AGREEING READS BEFORE A VALUE IS BELIEVED. `page.evaluate` does
 *  not auto-wait, and a smooth scroll plus a 430ms reveal means a single
 *  read lands mid-flight and describes a state nobody was ever shown. */
async function settled(page: Page) {
  let prev = await trackState(page);
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(70);
    const next = await trackState(page);
    if (next.lead === prev.lead
        && Math.abs(next.scrollLeft - prev.scrollLeft) < 0.5) return next;
    prev = next;
  }
  throw new Error("the board never came to rest");
}

const openBoard = async (page: Page) => {
  await serveEight(page);
  await expect(page.locator('[data-testid="league-col"]'))
    .toHaveCount(COLUMNS.length);
  await expect(page.getByTestId("board-track")).toBeVisible();
  return settled(page);
};

test.describe("the board is a looped scroller", () => {
  test("the track is a REAL horizontal scroller carrying every declared "
    + "column, showing four", async ({ page }) => {
      const s = await openBoard(page);
      /* THE DEFECT ITSELF, stated as arithmetic. A board that renders
         only the four it draws has nothing beside them to scroll to, and
         `scrollWidth === clientWidth` is exactly what that looks like. */
      expect(s.columns, "every declared column is on the track")
        .toBe(COLUMNS.length);
      expect(s.max, "the track has no overflow at all — there is nothing "
        + "beside the four on screen to scroll to, which is the shipped "
        + "board this rewrite is about").toBeGreaterThan(s.clientWidth / 2);
      expect(s.onScreen.length,
        `${s.onScreen.join(", ")} fit the scrollport`).toBe(VIEW);
      // and it rests INSIDE its own range, never against an end
      expect(s.scrollLeft).toBeGreaterThan(1);
      expect(s.scrollLeft).toBeLessThan(s.max - 1);
    });

  test("it LOOPS in BOTH directions and never reaches an end",
    async ({ page }) => {
      /* THE SEAM. Two laps forward and two laps back, reading the
         scroll offset at every step: a track that has run out pins at 0
         or at `scrollWidth - clientWidth` and stops answering. The
         rotation rebases it by exactly one column instead, so the offset
         must stay strictly inside its own range at every single step —
         for twice as many steps as there are columns. */
      await openBoard(page);
      const seen: string[] = [];
      for (const dir of ["ArrowRight", "ArrowLeft"] as const) {
        for (let i = 0; i < COLUMNS.length * 2; i++) {
          await page.keyboard.press(dir);
          const s = await settled(page);
          seen.push(s.lead);
          expect(s.scrollLeft, `${dir} step ${i}: the track pinned at an end`)
            .toBeGreaterThan(0.5);
          expect(s.scrollLeft, `${dir} step ${i}: the track pinned at its end`)
            .toBeLessThan(s.max - 0.5);
          expect(Math.abs(s.leadOffset),
            `${dir} step ${i}: the board came to rest between two columns`)
            .toBeLessThan(6);
          expect(s.onScreen.length, `${dir} step ${i}`).toBe(VIEW);
        }
      }
      /* NON-VACUITY: it actually went somewhere. Two laps each way must
         have led every column, or this is a guard about a board that
         did not move. */
      expect([...new Set(seen)].sort()).toEqual([...COLUMNS].sort());
    });

  test("a flick past several columns still lands on a column, with four "
    + "on screen", async ({ page }) => {
      /* THE FAST FLICK. A rotation per frame is bounded by the column
         count; a wheel gesture that crosses more than that in one frame
         is what breaks a loop built on "rotate once and hope". */
      const s0 = await openBoard(page);
      for (const px of [s0.clientWidth * 3, -s0.clientWidth * 5,
                        s0.clientWidth * 9]) {
        await page.evaluate((d) => {
          const t = document.querySelector<HTMLElement>(
            '[data-testid="board-track"]')!;
          t.scrollBy({ left: d, behavior: "auto" });
        }, px);
        const s = await settled(page);
        expect(s.scrollLeft, `after a ${px}px flick the track pinned`)
          .toBeGreaterThan(0.5);
        expect(s.scrollLeft, `after a ${px}px flick the track pinned at its end`)
          .toBeLessThan(s.max - 0.5);
        expect(s.onScreen.length, `after a ${px}px flick`).toBe(VIEW);
        expect(COLUMNS).toContain(s.lead);
      }
    });

  test("the ribbon is driven by a REAL-VALUED position, not by an integer "
    + "step", async ({ page }) => {
      /* WHAT THE FIRST CUT DID NOT HAVE. `absPos` is
         `spins + scrollLeft/oneW() - REST`, so the ribbon knows where the
         board is BETWEEN two columns and not merely which one it last
         passed. A window driven by an integer `windowStart` can only ever
         publish whole numbers here, however smooth the scroll looks.

         Measured by parking the board HALF a column along and reading the
         position back — and then proving the same reading returns to a
         whole number when it settles, so this is a continuous quantity
         and not simply a noisy one. */
      const s0 = await openBoard(page);
      expect(Number.isInteger(Math.round(s0.pos * 1000) / 1000),
        "a settled board is a whole number of columns along").toBe(true);

      const half = (s0.clientWidth + 24) / VIEW / 2;   // half a column + gap
      await page.evaluate((d) => {
        const t = document.querySelector<HTMLElement>(
          '[data-testid="board-track"]')!;
        t.scrollBy({ left: d, behavior: "auto" });
      }, half);
      await page.waitForTimeout(160);
      const mid = await trackState(page);
      const frac = Math.abs(mid.pos - Math.round(mid.pos));
      expect(frac, `the board is half a column along and the ribbon reads `
        + `${mid.pos} — a whole number, which is a position that can only `
        + "have come from an integer window").toBeGreaterThan(0.2);

      /* AND THE STRIP IS PLACED WITH A TRANSFORM, off that geometry —
         `translateX(-unit)`, one slot, which is what the two buffer
         slots are for. Read as a matrix because that is what the browser
         computes it to. */
      expect(mid.transform, "the strip carries no translate at all")
        .toMatch(/^matrix\(/);
      const tx = Number(mid.transform.slice(7, -1).split(",")[4]);
      expect(tx, "the strip is parked one slot to the left, so a slot's "
        + "worth of ribbon exists on each side to slide from")
        .toBeLessThan(-10);
    });

  test("THE LIT FOUR ARE THE FOUR ON SCREEN, wherever the scroll rests",
    async ({ page }) => {
      /* The rail's whole claim. Checked at every position of one full
         lap, because a rail that is right at the opening position and
         wrong everywhere else is the failure a single read cannot see. */
      await openBoard(page);
      for (let i = 0; i < COLUMNS.length; i++) {
        const s = await settled(page);
        const lit = await page
          .locator('[data-testid="ribbon-pill"][aria-selected="true"]')
          .evaluateAll((es) =>
            es.map((e) => (e as HTMLElement).dataset.slug!));
        expect(lit.slice().sort(),
          `lap ${i}: the rail lights ${lit.join(", ")} and the board shows `
          + s.onScreen.join(", ")).toEqual(s.onScreen.slice().sort());
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(80);
      }
    });

  test("the two BUFFER slots are scaffolding, not leagues the reader is "
    + "offered twice", async ({ page }) => {
      /* The strip is one slot wider than the board at each end so there
         is somewhere to slide from. With eight leagues in ten slots two
         of them are named twice — and the duplicates sit off-screen, are
         `aria-hidden`, and are not tabs. A tablist carrying a duplicate
         tab would be telling a screen reader there are ten leagues. */
      await openBoard(page);
      const pills = page.getByTestId("ribbon-pill");
      const buffers = page.getByTestId("ribbon-buffer");
      await expect(pills).toHaveCount(COLUMNS.length);
      await expect(buffers).toHaveCount(2);
      const slugs = await pills.evaluateAll((es) =>
        es.map((e) => (e as HTMLElement).dataset.slug!));
      expect(slugs.slice().sort(), "the pills name every league exactly once")
        .toEqual([...COLUMNS].sort());
      for (const b of await buffers.evaluateAll((es) => es.map((e) => ({
        hidden: e.getAttribute("aria-hidden"), role: e.getAttribute("role"),
        slug: (e as HTMLElement).dataset.slug })))) {
        expect(b.hidden).toBe("true");
        expect(b.role).toBeNull();
        // NON-VACUITY: it is a real slot holding a real league, not an
        // empty box that would satisfy this for the wrong reason
        expect(COLUMNS).toContain(b.slug);
      }
    });
});

test.describe("the pills bar is the page's own header", () => {
  test("it sits under the nav and ABOVE the hero", async ({ page }) => {
    /* Operator, 2026-09-15: "use the name option, but now extend it fully
       on the header and remove everything else". It was ~700px down,
       inside the board section below "Ranked by kickoff". */
    await openBoard(page);
    const bar = await page.getByTestId("board-pillbar").boundingBox();
    const hero = await page.getByRole("heading", { level: 1 }).boundingBox();
    const head = await page.getByTestId("col-head").first().boundingBox();
    expect(bar).toBeTruthy();
    expect(hero).toBeTruthy();
    expect(head).toBeTruthy();
    expect(bar!.y + bar!.height,
      "the pills bar is below the hero, which is where it used to be")
      .toBeLessThan(hero!.y);
    const nav = await page.locator("header.topbar").boundingBox();
    expect(bar!.y, "the pills bar is not seated against the nav")
      .toBeLessThan(nav!.y + nav!.height + 2);
    /* AND THE BOARD STARTS HIGHER FOR IT. The draft's first column head
       measured y=488 against the shipped page's y=801; this pins the
       direction rather than the pixel, which depends on the payload. */
    expect(head!.y, "the first column head is still most of a screen down")
      .toBeLessThan(620);
  });

  test("it STAYS while the board is read, which is what pays for the "
    + "column headers", async ({ page }) => {
      /* The trade the draft makes: a track with `overflow-x` is a
         scrollport in both axes, so a column header inside it sticks to
         the TRACK and not to the viewport. The pills bar does that job
         instead — so it has to genuinely stick, and the headers must be
         `static` rather than parked 103px down their own columns. */
      await openBoard(page);
      const before = await page.getByTestId("board-pillbar").boundingBox();
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(250);
      const after = await page.getByTestId("board-pillbar").boundingBox();
      expect(after!.y, "the pills bar scrolled away with the page")
        .toBeCloseTo(before!.y, 0);

      const head = page.getByTestId("col-head").first();
      const pos = await head.evaluate((e) => getComputedStyle(e).position);
      expect(pos, "a column header left half-sticky inside the track parks "
        + "itself `--topbar-h` down its own column and stays there — the "
        + "known regression this trade is made against").toBe("static");
      /* NON-VACUITY: the header is still THERE and still readable, it
         has simply stopped following. */
      await expect(head).toBeVisible();
    });
});

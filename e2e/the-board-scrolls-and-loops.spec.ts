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

/** AGREEING READS BEFORE A VALUE IS BELIEVED. `page.evaluate` does not
 *  auto-wait, and a step's 300ms glide plus a 430ms reveal means a single
 *  read lands mid-flight and describes a state nobody was ever shown.
 *
 *  THREE OF THEM, NOT TWO (2026-09-15). A free scroll is now corrected to
 *  the nearest whole column 120ms after the last scroll event, so a board
 *  that has been still for 140ms is not necessarily a board that has
 *  finished: two agreeing 70ms reads could be taken entirely inside that
 *  debounce and call a position "rest" that the loop was about to leave.
 *  Three span 210ms, which is past it. */
async function settled(page: Page) {
  const reads = [await trackState(page)];
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(70);
    reads.push(await trackState(page));
    const [a, b, c] = reads.slice(-3);
    if (reads.length >= 3 && a.lead === c.lead && b.lead === c.lead
        && Math.abs(a.scrollLeft - c.scrollLeft) < 0.5
        && Math.abs(b.scrollLeft - c.scrollLeft) < 0.5) return c;
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

/** ONE KEYPRESS IS ONE MOVEMENT, AND NOTHING RESTS BETWEEN TWO COLUMNS.
 *
 *  Two defects the operator was looking at on the live board, and the
 *  lit-set guards above cannot see either: the lit SET is identical
 *  whether the board arrives in one movement or in two, and identical
 *  whether it rests on a column or halfway across one.
 *
 *  1. THE STEP THAT ARRIVED TWICE. A step was handed to the browser as
 *     `scrollBy({behavior:"smooth"})`, so the loop's rebase had to fire
 *     INSIDE that animation. Instrumented on the live board at 200ms:
 *
 *         t=  0ms scrollLeft= 760 pos=0.000
 *         t=200ms scrollLeft=1116 pos=0.937
 *         t=400ms scrollLeft= 759 pos=0.997
 *
 *     — the board slid, settled, and then moved again. Reproduced here
 *     off a board parked mid-column, where it is worse: the threshold is
 *     crossed at 92ms rather than at 99.7% of the way, the `scrollLeft`
 *     write that rebases the loop ABORTS the browser's animation where it
 *     stands, and one ArrowRight delivered 0.611 of a column.
 *
 *  2. THE BOARD THAT RESTED MID-COLUMN. Nothing settled a free scroll, so
 *     a wheel or trackpad flick stopped wherever momentum ran out —
 *     measured resting at 0.316, 0.632 and 0.947 of a column, which is
 *     the board in the operator's screenshot: a sliver clipped at the
 *     left, Serie A clipped at the right, headers cut in half.
 *
 *  They are the same defect said twice, so they are guarded together: the
 *  board must never REST at a fractional position, and the correction
 *  that keeps it there must never be visible. */

type Sample = { t: number; pos: number; lead: string; leadX: number; on: number };

/** SAMPLE EVERY FRAME, FROM INSIDE THE PAGE. A `page.evaluate` round-trip
 *  is ~10ms of its own and coalesces with the compositor, so a Playwright
 *  polling loop cannot see a one-frame artefact — and one frame is
 *  exactly what a rotation whose rebase lands a paint late looks like. */
async function traceKey(page: Page, key: string, ms: number): Promise<Sample[]> {
  await page.evaluate(() => {
    const w = window as unknown as { __tr: Sample[]; __trRaf: number };
    const t = document.querySelector<HTMLElement>('[data-testid="board-track"]')!;
    const strip = document.querySelector<HTMLElement>(
      '[data-testid="league-ribbon"]')!;
    const t0 = performance.now();
    w.__tr = [];
    const take = () => {
      const box = t.getBoundingClientRect();
      const cols = [...t.querySelectorAll<HTMLElement>(
        '[data-testid="league-col"]')]
        .map((c) => ({ slug: c.dataset.league!,
                       x: c.getBoundingClientRect().left - box.left }));
      const lead = cols.slice().sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
      w.__tr.push({
        t: performance.now() - t0, pos: Number(strip.dataset.pos),
        lead: lead.slug, leadX: lead.x,
        on: cols.filter((c) => c.x > -4 && c.x < box.width - 4).length,
      });
      w.__trRaf = requestAnimationFrame(take);
    };
    take();
  });
  await page.keyboard.press(key);
  await page.waitForTimeout(ms);
  return page.evaluate(() => {
    const w = window as unknown as { __tr: Sample[]; __trRaf: number };
    cancelAnimationFrame(w.__trRaf);
    return w.__tr;
  });
}

const wrapIdx = (x: number, n: number) => ((x % n) + n) % n;

/** THE RENDERED POSITION, BUILT FROM PIXELS ALONE.
 *
 *  `strip.dataset.pos` is the loop's OWN published position, and it is
 *  written one animation frame AFTER the scroll it describes: on a loaded
 *  CI runner it read 0.000 while the board was already 46px along. That
 *  is a stale witness rather than a defect, and the ribbon cannot be the
 *  witness for the board anyway.
 *
 *  So the position under test is reconstructed from geometry read in the
 *  same frame — which league is drawn against the scrollport's left edge,
 *  and how far into it the board is — and walked into a continuous number
 *  of columns travelled. It never consults the thing it is measuring.
 *
 *  It is also what makes the atomicity claim measurable. A rotation whose
 *  `scrollLeft` rebase lands a paint LATE draws the columns one place over
 *  with the scroll unchanged, so the league at the left edge advances a
 *  whole place while its offset does not move — a one-frame discontinuity
 *  of exactly one column in this number, and invisible in every other. */
function rendered(fs: Sample[], oneW: number, cols: readonly string[]) {
  const n = cols.length;
  const walk = (a: string, b: string) => {
    const d = wrapIdx(cols.indexOf(b) - cols.indexOf(a), n);
    return d > n / 2 ? d - n : d;          /* the nearer way round */
  };
  const out = [-fs[0].leadX / oneW];
  for (let i = 1; i < fs.length; i++) {
    out.push(out[i - 1] + walk(fs[i - 1].lead, fs[i].lead)
             - (fs[i].leadX - fs[i - 1].leadX) / oneW);
  }
  return out;
}

test.describe("one keypress is one movement", () => {
  /** Assert the whole shape of one step over a frame-by-frame trace. */
  function pinStep(fs: Sample[], dir: number, oneW: number, what: string) {
    const r = rendered(fs, oneW, COLUMNS);
    const still = (a: number, b: number) => Math.abs(a - b) * oneW <= 0.5;

    /* Drop the frames before the keypress reached the page — the sampler
       is started first, and that head of stillness is not the board
       having settled. The board turning its ORDER is not movement either:
       a step rotates first, and that is a no-op on screen by design. */
    const off = r.findIndex((v) => !still(v, r[0]));
    expect(off, `${what}: the board never moved at all, so everything below `
      + "would pass for the wrong reason").toBeGreaterThan(0);
    const fr = fs.slice(off - 1);
    const pos = r.slice(off - 1);
    const last = pos.length - 1;

    /* (a) IT ARRIVES AT THE NEXT WHOLE COLUMN IN THE DIRECTION PRESSED.
       Stated against where it STARTED, so a step taken from a board that
       is already mid-column is held to the same thing: one keypress, one
       column, landing on an edge. A rebase that aborts the animation
       under-delivers and a rebase the animation outruns over-delivers;
       this refuses both. */
    const arrive = Math.round(pos[0]) + dir;
    expect(Math.abs(pos[last] - arrive) * oneW,
      `${what}: one ${dir > 0 ? "ArrowRight" : "ArrowLeft"} from `
      + `${pos[0].toFixed(3)} columns left the board at `
      + `${pos[last].toFixed(3)}, and the next whole column that way is `
      + `${arrive}`).toBeLessThan(2);
    expect(Math.abs(fr[last].leadX),
      `${what}: the board came to rest ${fr[last].leadX.toFixed(1)}px into a `
      + "column — a sliver clipped at one edge and a cut header at the "
      + "other").toBeLessThan(2);
    expect(fr[last].on, `${what}: ${fr[last].on} columns fit the scrollport`)
      .toBe(VIEW);

    /* (b) IT ONLY EVER GOES THAT WAY. An overshoot that comes back is two
       movements the reader has to watch, whatever it nets out to. */
    for (let i = 1; i <= last; i++) {
      expect((pos[i] - pos[i - 1]) * dir * oneW,
        `${what}: at t=${fr[i].t | 0}ms the board went `
        + `${((pos[i - 1] - pos[i]) * dir * oneW).toFixed(1)}px AGAINST the `
        + `key pressed, from ${pos[i - 1].toFixed(3)} to `
        + `${pos[i].toFixed(3)} columns`).toBeGreaterThan(-1);
    }

    /* (c) IT DOES NOT SETTLE AND THEN MOVE AGAIN — the live 200/400ms
       shape. The first place the board holds for 150ms is the place it
       has arrived at, and it must hold it for the rest of the trace. */
    for (let i = 0; i <= last; i++) {
      let j = i;
      while (j + 1 <= last && still(pos[j + 1], pos[i])) j += 1;
      if (fr[j].t - fr[i].t < 150) continue;
      expect(j, `${what}: the board held ${pos[i].toFixed(3)} columns for `
        + `${(fr[j].t - fr[i].t) | 0}ms and then moved again at `
        + `t=${(fr[j + 1]?.t ?? 0) | 0}ms, to `
        + `${pos[j + 1]?.toFixed(3)} — one keypress, two movements`)
        .toBe(last);
      break;
    }

    /* (d) AND IT IS CONTINUOUS. The rotation and the `scrollLeft` that
       cancels it have to land in the SAME paint; a frame in which the
       order has turned and the scroll has not moves the board a WHOLE
       column at once. The glide's cubic opens at three times its average
       speed and so covers at most 0.31 of a column in 34ms — anything
       past half a column inside one short frame is not the animation.
       Long frames are skipped rather than given a wider bound: a runner
       that stalled for 200ms legitimately has a lot of ground to make up,
       and a bound loose enough to allow that would allow the defect. */
    let checked = 0;
    for (let i = 1; i <= last; i++) {
      const dt = fr[i].t - fr[i - 1].t;
      if (dt > 34) continue;
      checked += 1;
      expect(Math.abs(pos[i] - pos[i - 1]),
        `${what}: the board moved `
        + `${Math.abs((pos[i] - pos[i - 1]) * oneW).toFixed(1)}px in the `
        + `${dt | 0}ms to t=${fr[i].t | 0}ms, jumping from `
        + `${pos[i - 1].toFixed(3)} to ${pos[i].toFixed(3)} columns — the `
        + "order turned in one paint and the scroll that cancels it in "
        + "another").toBeLessThan(0.5);
    }
    expect(checked, `${what}: every frame of the trace was longer than 34ms, `
      + "so the continuity check never ran").toBeGreaterThan(3);
  }

  test("a step arrives ONCE and lands on a whole column — from a settled "
    + "board and from one left mid-column", async ({ page }) => {
      const s0 = await openBoard(page);
      const oneW = (s0.clientWidth + 24) / VIEW;

      pinStep(await traceKey(page, "ArrowRight", 2600), 1, oneW,
        "from a settled board");
      await settled(page);
      pinStep(await traceKey(page, "ArrowLeft", 2600), -1, oneW,
        "back the other way");

      /* AND FROM THE BROKEN BOARD ITSELF. Park it mid-column the way a
         trackpad flick used to leave it — this is where the rebase fires
         early enough to abort the animation, and where the step measured
         0.611 of a column. The settle is suppressed for the duration by
         holding the scroll offset there directly. */
      await settled(page);
      await page.evaluate((d) => {
        const t = document.querySelector<HTMLElement>(
          '[data-testid="board-track"]')!;
        t.scrollBy({ left: d, behavior: "auto" });
      }, oneW * 0.45);
      await page.waitForTimeout(90);           /* inside the settle debounce */
      pinStep(await traceKey(page, "ArrowRight", 2600), 1, oneW,
        "from a board left mid-column");
    });

  test("a free scroll comes to REST on a whole column", async ({ page }) => {
    const s0 = await openBoard(page);
    const oneW = (s0.clientWidth + 24) / VIEW;
    const box = (await page.getByTestId("board-track").boundingBox())!;
    /* Fractions chosen so momentum cannot land on an edge by luck: each
       leaves the board well inside a column, which is exactly where it
       used to stay. */
    for (const frac of [0.45, 0.8, -0.35, 1.55, 0.6]) {
      await page.mouse.move(box.x + box.width / 2, box.y + 120);
      await page.mouse.wheel(Math.round(frac * oneW), 0);
      const s = await settled(page);
      expect(Math.abs(s.pos - Math.round(s.pos)) * oneW,
        `a ${frac} column wheel left the board resting at ${s.pos} — `
        + "between two columns, with a sliver clipped at each edge")
        .toBeLessThan(2);
      expect(Math.abs(s.leadOffset),
        `a ${frac} column wheel left ${s.lead} ${s.leadOffset.toFixed(1)}px `
        + "into the scrollport").toBeLessThan(2);
      expect(s.onScreen.length,
        `a ${frac} column wheel left ${s.onScreen.length} columns on screen, `
        + `not ${VIEW}: ${s.onScreen.join(", ")}`).toBe(VIEW);
      expect(s.scrollLeft, "the track pinned at an end").toBeGreaterThan(0.5);
      expect(s.scrollLeft, "the track pinned at its end")
        .toBeLessThan(s.max - 0.5);
    }
  });

  test("a reader who asked for less motion still lands on a column, with no "
    + "animation to watch", async ({ page }) => {
      /* The settle is a correction, and a correction is still motion. It
         has to happen — a board resting mid-column is the defect — but it
         must arrive rather than travel. */
      await page.emulateMedia({ reducedMotion: "reduce" });
      const s0 = await openBoard(page);
      const oneW = (s0.clientWidth + 24) / VIEW;
      const box = (await page.getByTestId("board-track").boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + 120);
      await page.mouse.wheel(Math.round(0.45 * oneW), 0);
      await page.waitForTimeout(450);
      const a = await trackState(page);
      await page.waitForTimeout(120);
      const b = await trackState(page);
      expect(Math.abs(a.pos - Math.round(a.pos)) * oneW,
        `the board rests at ${a.pos} — between two columns`).toBeLessThan(2);
      expect(b.scrollLeft, "the board was still travelling 450ms after the "
        + "wheel stopped, which is an animation a reader asked not to see")
        .toBeCloseTo(a.scrollLeft, 0);
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

  test("it STAYS while the board is read, and the column headers park on "
    + "it", async ({ page }) => {
      /* RESTATED 2026-09-15 — the second half of this test was written
         against an arrangement that has since been replaced.
         WHAT IT SAID. A track with `overflow-x` is a scrollport in both
         axes, so a column header inside it sticks to the TRACK and not
         to the viewport; the trade was to make the headers `static` and
         let the pills bar carry the wayfinding alone, and this asserted
         that `static` as the shape of the trade.
         WHAT MOVED. The operator's screenshot of a league name sliced in
         half by this bar is what that trade looked like to read — "make
         the league header still going with me when I go down. It need to
         go too right under the pills." The headers now LEAVE the
         scrollport (portalled into the board's own sticky rail) and come
         to rest against this bar's bottom edge, so `static` is no longer
         the point: a header can follow the reader again, and it is this
         bar that says where it stops.
         WHAT SURVIVES UNCHANGED is the reason that clause was here at
         all — the bar has to genuinely stick. It is now load-bearing
         twice over: it is the wayfinding AND it is the shelf the headers
         park on, measured. The header's own behaviour is pinned in
         e2e/the-headers-park-under-the-pills.spec.ts, which is where the
         detail belongs. */
      await openBoard(page);
      const before = await page.getByTestId("board-pillbar").boundingBox();
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(250);
      const after = await page.getByTestId("board-pillbar").boundingBox();
      expect(after!.y, "the pills bar scrolled away with the page")
        .toBeCloseTo(before!.y, 0);

      /* AND NOT ONE OF THEM IS STILL IN THE SCROLLPORT. That is the
         original defect stated as a place rather than as a CSS value: a
         header inside the track has the track for a scrollport and
         cannot reach the viewport from there, whatever `position` says.
         Read off the track itself, so a header that quietly moved back
         inside it fails here. */
      await expect(page.getByTestId("board-track")
        .locator('[data-testid="col-head"]'),
      "a column header inside the track has the TRACK for a scrollport "
      + "and parks itself `--topbar-h` down its own column — the known "
      + "regression the rail exists to escape").toHaveCount(0);

      const head = page.getByTestId("col-head").first();
      await expect(head).toBeVisible();
      const box = await head.boundingBox();
      expect(box!.y, "the header came to rest on this bar's bottom edge")
        .toBeCloseTo(after!.y + after!.height, 1);
    });
});

test.describe("a reader who asked for less motion gets less motion", () => {
  /** Every name on the rail, in slot order, as one string. */
  const say = (page: Page) => page.getByTestId("ribbon-pill")
    .evaluateAll((es) => es.map((e) => (e.textContent || "").trim()).join("|"));

  /** Sample the rail across a step, fast enough to catch a ~430ms reveal
   *  with a ~77ms churn, and return the frames that are neither the
   *  before nor the after. */
  async function between(page: Page) {
    const before = await say(page);
    const seen: string[] = [];
    await page.keyboard.press("ArrowRight");
    for (let i = 0; i < 14; i++) {
      seen.push(await say(page));
      await page.waitForTimeout(55);
    }
    await page.waitForTimeout(900);
    const after = await say(page);
    return { before, after, seen };
  }

  test("no churn and no slide — it lands on the settled state", async ({ page }) => {
    /* BOTH HALVES IN ONE FILE. The reduced-motion branch is an ABSENCE,
       and an absence passes on a board whose ribbon never animates at
       all — which is the board this whole rewrite is about. So the
       churn is proved PRESENT under the default setting first, with the
       same sampler, and only then required to be gone. */
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openBoard(page);
    const loud = await between(page);
    expect(loud.after, "the board did not move at all").not.toBe(loud.before);
    const finals = new Set(loud.after.replace(/\|/g, "").split(""));
    expect(loud.seen.some((s) => s.replace(/\|/g, "").split("")
      .some((c) => !finals.has(c))),
      "no churn ran even with motion allowed, so the assertion below "
      + "would pass for the wrong reason").toBe(true);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await openBoard(page);
    const quiet = await between(page);
    expect(quiet.after, "the board did not move at all").not.toBe(quiet.before);

    /* NO CHURN: every sampled frame is one of the two settled states.
       A glyph the final names do not contain is the churn, and there
       must not be one. */
    const settledNames = new Set(
      (quiet.before + quiet.after).replace(/\|/g, "").split(""));
    for (const frame of quiet.seen) {
      for (const c of frame.replace(/\|/g, "").split("")) {
        expect(settledNames, `"${frame}" holds ${JSON.stringify(c)}, which `
          + "belongs to neither the old names nor the new — a reader who "
          + "asked for less motion is watching letters churn")
          .toContain(c);
      }
    }
    /* NO SLIDE: the board arrived. A smooth scroll is still running two
       frames in; an instant one has already landed on a whole column. */
    const s = await trackState(page);
    expect(Math.abs(s.pos - Math.round(s.pos)),
      `the board rests at ${s.pos} — part-way between two columns`)
      .toBeLessThan(0.02);
  });
});

import { test, expect, type Page } from "@playwright/test";
import { DERBY } from "../src/lib/landingData";

/** the model's first IN-PLAY reading: the first tape row that carries one */
const FIRST_READ = DERBY.minutes.find((r) => r.tape && r.model)!.m;

/* THE LANDING PAGE HOLDS STILL WHERE IT PROMISES TO (round 9, 2026-10-03).

   1. REDUCED MOTION SHOWS EVERYTHING. The full-time review card is
      drawn by a scroll scene, and under reduced motion the hydration
      render is still the moving one (useReducedMotion answers the
      server's `false` until it has hydrated), so the scene's mount frame
      wrote the folded state — clip-path at 100%, every row and the coda
      at opacity 0 — and nothing ever unwrote it: the final score, both
      T−10 columns, the events and the why-this-match line were all
      invisible. Playwright's `toBeVisible` counts opacity 0 as visible,
      which is why nothing caught it; this reads the computed styles.

   2. THE PINNED CLOCK NEVER RE-CENTRES. Its caption slot reserved two
      lines and the 54′ caption takes three at 1024–1100px and at 360px,
      so the sticky stage jumped 11–21px at the red card and back at
      60′. Stepped through the minutes where the caption, the note and
      the score change, the minute counter and the chart must not move
      by a pixel.

   3. THE PINNED CLOCK FITS A SHORT PHONE (round 10). The stage shared a
      560px floor with the field scenes, so in a 548px window it ran
      49→609px and its last lines sat below the fold for the whole
      scene. At every phone size from an SE with its toolbars up to a
      tall phone, at 0′, 54′ and 90′, everything the stage draws is on
      screen — and the "shadow · not advice" chip with it, and at 90′
      the "model stands down" label sits whole inside its band (at 360px
      and below one line ran past the band's edge and was cut).

   4. THE BAND'S LABEL SITS WHERE NOTHING IS DRAWN (round 11). At 320×568
      and 375×548 it sat flush on the 90′ line with the Draw and Real
      Madrid end dots on its corner. At 90′, at every phone size, the
      label keeps clear of the stop line and the 90′ line, inside the
      band, and no market line or end dot comes within a few pixels of
      it — measured off the drawn paths, not the code's own sums.

   5. NOTHING DRAWN DOWN THE BAND RUNS THROUGH IT EITHER, AND THE RAIL IS
      WHOLE (round 12). The label sat on the 60′ goal's dashed guide at
      360–1440px; the 90′ goal dot was cut in half by the reveal window
      at every width; on a phone the 53′ goal dot hid half under the 54′
      red card; and every model line began with a hook — a flat stub of
      the T−10 lock and a drop at kick-off. At 90′: the label is clear of
      every guide line, the stop line and the cursor; all four markers
      are drawn, whole, on the rail, and no two overlap; and each model
      line begins at the model's first in-play reading. */

for (const width of [1440, 390]) {
  test(`under reduced motion the review card and its why-this-match line are drawn whole — ${width}px`,
    async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce",
        viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      await page.goto("/");
      const card = page.getByTestId("review-card");
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const st = await page.evaluate(() => {
        const c = document.querySelector<HTMLElement>('[data-testid="review-card"]')!;
        const clip = getComputedStyle(c).clipPath;
        return {
          clip,
          rows: [...c.querySelectorAll<HTMLElement>("[data-row]")]
            .map((r) => Number(getComputedStyle(r).opacity)),
          why: Number(getComputedStyle(
            document.querySelector('[data-testid="why-this-match"]')!).opacity),
        };
      });
      // nothing clipped off: no clip-path, or an inset that cuts 0%
      expect(st.clip === "none" || /^inset\(0(px|%)? 0(px|%)? 0(px|%)?/.test(st.clip),
        `review card clipped: ${st.clip}`).toBe(true);
      expect(st.rows.length).toBeGreaterThanOrEqual(4);
      expect(st.rows, "a review row is transparent").toEqual(st.rows.map(() => 1));
      expect(st.why, "the why-this-match line is transparent").toBe(1);
      await expect(page.getByTestId("why-this-match"))
        .toContainText("Picked for its full stored record");
      await ctx.close();
    });
}

/** the scroll offset at which the pinned clock first reads `target` */
async function scrollToMinute(page: Page, target: number) {
  const span = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-testid="clock-scroll"]')!;
    const st = el.firstElementChild as HTMLElement;
    const top = el.getBoundingClientRect().top + scrollY;
    const stickyTop = parseFloat(getComputedStyle(st).top) || 0;
    return { a: top - stickyTop, b: top - stickyTop + el.offsetHeight - st.offsetHeight };
  });
  const minuteAt = async (y: number) => {
    await page.evaluate((y) => scrollTo(0, y), Math.round(y));
    await page.waitForTimeout(80);
    return page.evaluate(() => Number(document.querySelector<HTMLElement>(
      '[data-testid="clock-minute"]')!.dataset.minute));
  };
  let lo = span.a, hi = span.b;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (await minuteAt(mid) >= target) hi = mid; else lo = mid;
  }
  const got = await minuteAt(hi + 2);
  await page.waitForTimeout(450);          // the caption's own fade-in
  return got;
}

for (const [w, h] of [[1024, 768], [1100, 800], [360, 740]] as const) {
  test(`the pinned clock never moves as the minutes turn — ${w}x${h}`,
    async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
      await page.evaluate(() => document.fonts.ready);
      const seen: string[] = [];
      let base: { minute: number; chart: number } | null = null;
      for (const m of [0, 45, 53, 54, 60, 68, 90]) {
        const got = await scrollToMinute(page, m);
        const at = await page.evaluate(() => {
          const sec = document.querySelector('[data-testid="clock-scroll"]')!;
          return {
            minute: sec.querySelector('[data-testid="clock-minute"]')!
              .getBoundingClientRect().top,
            chart: sec.querySelector('[role="img"]')!.getBoundingClientRect().top,
            caption: sec.querySelector('[data-testid="clock-caption"]')?.textContent ?? "",
          };
        });
        seen.push(`${got}′ minute@${at.minute.toFixed(1)} chart@${at.chart.toFixed(1)} "${at.caption.slice(0, 24)}"`);
        if (!base) base = at;
        expect(Math.abs(at.minute - base.minute), seen.join("\n")).toBeLessThan(0.5);
        expect(Math.abs(at.chart - base.chart), seen.join("\n")).toBeLessThan(0.5);
      }
      // the walk really reached the red card and full time
      expect(seen.some((s) => s.startsWith("54′")), seen.join("\n")).toBe(true);
      expect(seen.some((s) => s.startsWith("90′")), seen.join("\n")).toBe(true);
    });
}

for (const [w, h] of [[375, 548], [320, 568], [360, 640], [390, 664], [390, 844]] as const) {
  test(`the pinned clock fits the screen at 0′, 54′ and 90′, chip and band label whole — ${w}x${h}`,
    async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
      await page.evaluate(() => document.fonts.ready);
      for (const m of [0, 54, 90]) {
        const got = await scrollToMinute(page, m);
        expect(got).toBeGreaterThanOrEqual(m);
        const at = await page.evaluate(() => {
          const sec = document.querySelector('[data-testid="clock-scroll"]')!;
          const stage = (sec.firstElementChild as HTMLElement).getBoundingClientRect();
          // the stage's one grid: both columns, whatever is displayed
          const ink = sec.firstElementChild!.firstElementChild!.getBoundingClientRect();
          const chip = [...sec.querySelectorAll<HTMLElement>("span")]
            .find((el) => el.textContent === "shadow · not advice");
          const c = chip?.getBoundingClientRect();
          // the stand-down label rides inside the reveal window; at 90′
          // the window is the whole band, and the label must be within it
          const lab = sec.querySelector('[data-testid="clock-standdown-label"]')!
            .getBoundingClientRect();
          const win = sec.querySelector('[data-testid="clock-standdown-label"]')!
            .parentElement!.parentElement!.getBoundingClientRect();
          /* the band, and how near any market line or end dot comes to
             the label's box: every half pixel of every drawn market path */
          const band = sec.querySelector('[data-testid="clock-standdown"] rect')!
            .getBoundingClientRect();
          const gapTo = (x0: number, y0: number, x1: number, y1: number) => Math.hypot(
            Math.max(lab.left - x1, 0, x0 - lab.right), Math.max(lab.top - y1, 0, y0 - lab.bottom));
          let line = Infinity;
          const paths = sec.querySelectorAll<SVGPathElement>('path[stroke-dasharray="4 3"]');
          for (const p of paths) {
            const ctm = p.getScreenCTM()!, n = p.getTotalLength();
            for (let d = 0; d <= n; d += 0.5) {
              const q = p.getPointAtLength(d).matrixTransform(ctm);
              line = Math.min(line, gapTo(q.x, q.y, q.x, q.y));
            }
          }
          // the six riding dots (model and market, one per outcome)
          const dot = Math.min(...[...sec.querySelectorAll<HTMLElement>('[role="img"] i')]
            .filter((d) => getComputedStyle(d).opacity !== "0")
            .map((d) => { const b = d.getBoundingClientRect(); return gapTo(b.left, b.top, b.right, b.bottom); }));
          // every line drawn down the band: the goals' guides, the stop
          // line and the cursor (at rest on the 90′ line)
          const mid = (el: Element) => { const b = el.getBoundingClientRect(); return (b.left + b.right) / 2; };
          const verticals = [...sec.querySelectorAll('[data-testid="clock-ev-guide"]'),
            sec.querySelector('[data-testid="clock-standdown"] line')!,
            sec.querySelector('[data-testid="clock-cursor"]')!].map(mid);
          const guide = Math.min(...verticals.map((g) => Math.max(lab.left - g, g - lab.right)));
          // the rail's markers, as drawn, against the rail and each other
          const railLine = sec.querySelector('[data-testid="clock-rail-line"]')!.getBoundingClientRect();
          const chart = sec.querySelector('[role="img"]')!.getBoundingClientRect();
          const marks = [...sec.querySelectorAll('[data-testid="clock-rail"] [data-on="true"]')]
            .map((e) => e.getBoundingClientRect()).sort((p, q) => p.left - q.left);
          const railOut = Math.max(0, ...marks.map((b) => Math.max(railLine.left - b.left,
            b.right - railLine.right, chart.left - b.left, b.right - chart.right)));
          const railGap = Math.min(Infinity, ...marks.slice(1).map((b, i) => b.left - marks[i].right));
          // where each model line begins, against the minute axis
          const txt = (t: string) => mid([...sec.querySelectorAll("svg text")]
            .find((e) => e.textContent === t)!);
          const ko = txt("KO"), ft = txt("90′");
          const starts = [...sec.querySelectorAll<SVGPathElement>('path[stroke-width="2.2"]')]
            .map((p) => p.getPointAtLength(0).matrixTransform(p.getScreenCTM()!).x);
          return {
            guide: Math.round(guide * 10) / 10, marks: marks.length,
            railOut: Math.round(railOut * 10) / 10, railGap: Math.round(railGap * 10) / 10,
            firstStart: Math.round((Math.min(...starts) - ko) / ((ft - ko) / 90) * 100) / 100,
            label: [Math.round(lab.left), Math.round(lab.right)],
            box: [lab.left, lab.top, lab.right, lab.bottom].map(Math.round),
            band: [band.left, band.top, band.right, band.bottom].map(Math.round),
            paths: paths.length, line: Math.round(line * 10) / 10, dot: Math.round(dot * 10) / 10,
            window: [Math.round(win.left), Math.round(win.right)],
            vh: innerHeight,
            stage: [Math.round(stage.top), Math.round(stage.bottom)],
            ink: [Math.round(ink.top), Math.round(ink.bottom)],
            chip: c && chip!.checkVisibility({ opacityProperty: true, visibilityProperty: true })
              ? [Math.round(c.top), Math.round(c.bottom)] : null,
          };
        });
        const said = `${got}′ ${JSON.stringify(at)}`;
        expect(at.stage[1], `stage runs below the fold: ${said}`).toBeLessThanOrEqual(at.vh);
        expect(at.ink[0], said).toBeGreaterThanOrEqual(at.stage[0]);
        expect(at.ink[1], `the clock's last line is below the fold: ${said}`)
          .toBeLessThanOrEqual(at.vh);
        expect(at.chip, `no shadow chip on screen: ${said}`).not.toBeNull();
        expect(at.chip![0], said).toBeGreaterThanOrEqual(at.stage[0]);
        expect(at.chip![1], said).toBeLessThanOrEqual(at.vh);
        if (m === 90) {
          expect(at.label[1], `the stand-down label is cut by the band's edge: ${said}`)
            .toBeLessThanOrEqual(at.window[1]);
          // inside the band, clear of the stop line and of the 90′ line
          expect(at.box[0] - at.band[0], `label on the stop line: ${said}`).toBeGreaterThanOrEqual(6);
          expect(at.band[2] - at.box[2], `label on the 90′ line: ${said}`).toBeGreaterThanOrEqual(10);
          expect(at.box[1], said).toBeGreaterThanOrEqual(at.band[1]);
          expect(at.box[3], said).toBeLessThanOrEqual(at.band[3]);
          // and nothing drawn runs into it (the market's dashed lines, one
          // run or more per outcome, sampled every half pixel)
          expect(at.paths, said).toBeGreaterThanOrEqual(3);
          expect(at.line, `a market line runs into the label: ${said}`).toBeGreaterThanOrEqual(4);
          expect(at.dot, `an end dot sits on the label: ${said}`).toBeGreaterThanOrEqual(6);
          // nor any line drawn down the band: guides, stop line, cursor
          expect(at.guide, `a guide line runs through the label: ${said}`).toBeGreaterThanOrEqual(5);
          // the rail: all four events, whole, on the rail, none on another
          expect(at.marks, said).toBe(DERBY.events.length);
          expect(at.railOut, `a rail marker is cut at the rail's end: ${said}`).toBeLessThanOrEqual(0);
          expect(at.railGap, `two rail markers overlap: ${said}`).toBeGreaterThanOrEqual(1);
          // the model's lines begin at its first in-play reading — no hook
          expect(Math.abs(at.firstStart - FIRST_READ), `a model line starts before ${FIRST_READ}′: ${said}`)
            .toBeLessThanOrEqual(0.3);
        }
      }
    });
}

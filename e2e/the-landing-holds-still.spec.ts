import { test, expect, type Page } from "@playwright/test";

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
      by a pixel. */

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

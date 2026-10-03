import { test, expect, type Page } from "@playwright/test";

/* THE HOME PAGE SHOWS BOTH BOARDS (Son, 2026-10-03: "The every feature,
   ranked section only have Championships matches, show clubs matches
   example too, do it without losing the flow and keep everything
   smooth").

   The board section mirrors the real board's Leagues | Championships
   switch above one screenshot frame (components/landing/BoardShot.tsx).
   What is asserted, at a desktop and a phone width:
     - it is a real button group: two buttons, `aria-pressed`, Leagues
       first and pressed, each at least 44px tall;
     - a press swaps which capture is shown and which is hidden from
       assistive tech, and the frame does not move by a pixel — both
       captures share one grid cell and are loaded together;
     - and none of it fetches anything: the home page makes no /api/
       request at all (the board routes WRITE a snapshot per read).
   And the one automatic flip: scrolling the frame past the middle of
   the screen shows Championships, scrolling back shows Leagues — but
   not under reduced motion, and not once the reader has pressed. */

async function openSection(page: Page) {
  const api: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) api.push(r.url());
  });
  await page.goto("/");
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  const shot = page.getByTestId("board-shot");
  await shot.scrollIntoViewIfNeeded();
  return { api, shot };
}

/** the frame actually on screen at this width (wide or card) and the
 *  opacity of each capture in it */
async function frameState(page: Page) {
  return page.evaluate(() => {
    const frames = [...document.querySelectorAll<HTMLElement>(
      '[data-testid="board-shot"] [data-layer]')]
      .filter((l) => l.parentElement!.checkVisibility());
    const of = (m: string) => frames.find((l) => l.dataset.layer === m)!;
    const lg = of("leagues"), ch = of("championships");
    const imgs = [lg, ch].map((l) => l.querySelector("img")!);
    return {
      frameH: lg.parentElement!.getBoundingClientRect().height,
      leagues: Number(getComputedStyle(lg).opacity),
      championships: Number(getComputedStyle(ch).opacity),
      hidden: frames.filter((l) => l.getAttribute("aria-hidden") === "true")
        .map((l) => l.dataset.layer),
      loaded: imgs.every((i) => i.complete && i.naturalWidth > 0),
      /* said, not just counted, so a capture that failed to load names
         itself in the failure */
      images: imgs.map((i) => `${i.complete ? "complete" : "pending"} `
        + `${i.naturalWidth}w ${i.currentSrc.replace(/^.*url=/, "")}`),
    };
  });
}

for (const width of [1440, 390]) {
  test(`the switch shows clubs, then national teams, and fetches nothing — ${width}px`,
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const { api, shot } = await openSection(page);
      const group = shot.getByRole("group");
      const buttons = group.getByRole("button");
      await expect(buttons).toHaveText(["Leagues", "Championships"]);
      const leagues = group.getByRole("button", { name: "Leagues" });
      const champs = group.getByRole("button", { name: "Championships" });
      await expect(leagues).toHaveAttribute("aria-pressed", "true");
      await expect(champs).toHaveAttribute("aria-pressed", "false");
      for (const b of [leagues, champs]) {
        expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }

      // both captures are in, and Leagues is the one shown
      await expect.poll(async () => {
        const st = await frameState(page);
        return st.loaded ? "loaded" : st.images.join(" | ");
      }).toBe("loaded");
      const before = await frameState(page);
      expect(before.leagues).toBe(1);
      expect(before.championships).toBe(0);
      expect(before.hidden).toEqual(["championships"]);

      await champs.click();
      await expect(champs).toHaveAttribute("aria-pressed", "true");
      await expect(leagues).toHaveAttribute("aria-pressed", "false");
      await expect.poll(async () => (await frameState(page)).championships)
        .toBe(1);
      const after = await frameState(page);
      expect(after.leagues).toBe(0);
      expect(after.hidden).toEqual(["leagues"]);
      expect(after.frameH, "the frame moved when the capture swapped")
        .toBe(before.frameH);

      await leagues.click();
      await expect.poll(async () => (await frameState(page)).leagues).toBe(1);
      expect((await frameState(page)).frameH).toBe(before.frameH);

      await page.waitForLoadState("networkidle");
      expect(api, "the home page reached for the backend").toEqual([]);
    });
}

/** scroll so the frame's middle sits at this share of the viewport */
async function frameMidAt(page: Page, share: number) {
  await page.evaluate((share) => {
    const box = document.querySelector('[data-testid="board-shot"] [data-layer]')!
      .parentElement!.parentElement!.getBoundingClientRect();
    const mid = box.top + box.height / 2 + scrollY;
    scrollTo(0, mid - innerHeight * share);
  }, share);
}

test("scrolling past the middle flips it once, and back — until the reader presses",
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { shot } = await openSection(page);
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    await frameMidAt(page, 0.3);
    await expect(shot).toHaveAttribute("data-mode", "championships");
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    // a fling straight past the whole band still lands on the right side
    await frameMidAt(page, -0.5);
    await expect(shot).toHaveAttribute("data-mode", "championships");
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    // the reader presses: from now on the reader decides
    await shot.getByRole("button", { name: "Leagues" }).click();
    await frameMidAt(page, 0.3);
    await page.waitForTimeout(300);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
  });

test("under reduced motion nothing flips by itself", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const { shot } = await openSection(page);
  await frameMidAt(page, 0.7);
  await frameMidAt(page, 0.2);
  await page.waitForTimeout(300);
  await expect(shot).toHaveAttribute("data-mode", "leagues");
  // and a press swaps at once, with no transition to wait for
  await shot.getByRole("button", { name: "Championships" }).click();
  expect((await frameState(page)).championships).toBe(1);
  await ctx.close();
});

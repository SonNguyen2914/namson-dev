import { test, expect, type Page } from "@playwright/test";

/* THE HOME PAGE SHOWS BOTH BOARDS (Son, 2026-10-03: "The every feature,
   ranked section only have Championships matches, show clubs matches
   example too, do it without losing the flow and keep everything
   smooth").

   components/landing/BoardShot.tsx. What is asserted:
     - ON A WIDE SCREEN (1440) both halves are on screen at once, side
       by side — clubs | national teams — one whole board column per
       frame, at the same top, height and SCALE (each frame as wide as
       its crop, so the type on both cards is one size), nothing faded
       in at the edges, both captures loaded, no switch, and scrolling
       changes nothing (round 9: the single frame flipped, under the
       reader's eyes, to a one-column capture that left half of it
       black; round 10: the club frame was cut through its neighbours);
     - AT 1024, 1440 AND 1920 the heading, the intro and the pair span
       the same content column as the section below, and the heading
       keeps to two lines (round 9 capped them at 1020px: a 220px empty
       band at 1440, a three-line heading at 1920);
     - ON A PHONE (390) the board's own switch: a real button group, two
       buttons, `aria-pressed`, Leagues first and pressed, each at least
       44px tall; a press swaps which capture is shown and which is
       hidden from assistive tech, and the frame does not move by a
       pixel — both captures share one grid cell and load together;
     - and none of it fetches anything: the home page makes no /api/
       request at all (the board routes WRITE a snapshot per read).
   And the one automatic flip, phones only: once the frame's middle has
   passed a quarter of the screen it shows Championships, and back below
   35% — but not under reduced motion, not while focus is inside the
   figure, and not once the reader has pressed. */

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

/** the phone frame (the switch's) and the opacity of each capture in it */
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

/** the wide screen's two frames, measured */
async function pairState(page: Page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll<HTMLElement>(
      '[data-testid="board-shot-pair"] [data-pair]')];
    return cells.map((c) => {
      const frame = c.lastElementChild as HTMLElement;
      const b = frame.getBoundingClientRect();
      const img = frame.querySelector("img")!;
      const layer = img.parentElement!;
      const ls = getComputedStyle(layer);
      return {
        pair: c.dataset.pair, label: c.firstElementChild!.textContent,
        visible: frame.checkVisibility({ opacityProperty: true }),
        opacity: Number(ls.opacity),
        hidden: layer.getAttribute("aria-hidden"),
        /* a faded edge is a mask; one whole column needs none */
        mask: ls.maskImage || ls.getPropertyValue("-webkit-mask-image") || "none",
        top: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height),
        /* drawn width per CROP pixel — the img's own width attribute is
           the crop's; naturalWidth is whichever srcset size was served */
        scale: b.width / Number(img.getAttribute("width")),
        aspect: Number(img.getAttribute("width")) / Number(img.getAttribute("height")),
        loaded: img.complete && img.naturalWidth > 0,
      };
    });
  });
}

test("on a wide screen both halves are shown at once, side by side, and nothing moves — 1440px",
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { api, shot } = await openSection(page);
    // no switch to press: both are already there
    await expect(shot.getByTestId("board-shot-switch")).toBeHidden();
    await expect.poll(async () => (await pairState(page)).every((c) => c.loaded))
      .toBe(true);
    const a = await pairState(page);
    expect(a.map((c) => c.pair)).toEqual(["leagues", "championships"]);
    expect(a.map((c) => c.label)).toEqual(["Leagues · clubs",
      "Championships · national teams"]);
    for (const c of a) {
      expect(c.visible, `${c.pair} frame not on screen`).toBe(true);
      expect(c.opacity).toBe(1);
      expect(c.hidden, `${c.pair} hidden from assistive tech`).toBeNull();
      expect(c.mask, `${c.pair} frame fades something in at its edges`).toBe("none");
    }
    // side by side: same top, same height, and ONE scale — each frame is
    // as wide as its crop, so the club column (narrower than a one-column
    // championship board) is not blown up to match it
    expect(a[0].top).toBe(a[1].top);
    expect(Math.abs(a[0].h - a[1].h), JSON.stringify(a)).toBeLessThanOrEqual(1);
    expect(Math.abs(a[0].scale / a[1].scale - 1), JSON.stringify(a)).toBeLessThan(0.002);
    // the club crop is one column: taller than wide, unlike the old
    // three-column slice
    expect(a[0].aspect).toBeLessThan(0.9);
    expect(a[0].w).toBeGreaterThan(400);
    // scrolling the frames through the whole screen changes nothing
    for (const share of [0.7, 0.3, 0.1, -0.5, 0.7]) {
      await page.evaluate((share) => {
        const box = document.querySelector('[data-testid="board-shot-pair"]')!
          .getBoundingClientRect();
        scrollTo(0, box.top + box.height / 2 + scrollY - innerHeight * share);
      }, share);
      await page.waitForTimeout(150);
      expect((await pairState(page)).map((c) => c.opacity)).toEqual([1, 1]);
    }
    await page.waitForLoadState("networkidle");
    expect(api, "the home page reached for the backend").toEqual([]);
  });

for (const width of [1024, 1440, 1920]) {
  test(`the board spans the page's one content column and its heading keeps to two lines — ${width}px`,
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openSection(page);
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(() => {
        const content = (sec: Element) => {
          const b = sec.getBoundingClientRect(), cs = getComputedStyle(sec);
          return [b.left + parseFloat(cs.paddingLeft), b.right - parseFloat(cs.paddingRight)]
            .map(Math.round);
        };
        const edges = (el: Element) => {
          const b = el.getBoundingClientRect();
          return [Math.round(b.left), Math.round(b.right)];
        };
        const h2 = document.getElementById("landing-board")!;
        const grid = h2.parentElement!.parentElement!;
        const r = document.createRange();
        r.selectNodeContents(h2);
        return {
          board: content(h2.closest("section")!),
          below: content(document.getElementById("landing-record")!.closest("section")!),
          grid: edges(grid),
          intro: edges(grid.lastElementChild!),
          pair: edges(document.querySelector('[data-testid="board-shot-pair"]')!),
          lines: new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size,
        };
      });
      const said = JSON.stringify(m);
      expect(m.board, said).toEqual(m.below);
      expect(m.grid, said).toEqual(m.below);
      expect(m.pair, said).toEqual(m.below);
      // the intro ends where the pictures end
      expect(m.intro[1], said).toBe(m.pair[1]);
      expect(m.lines, said).toBe(2);
    });
}

test("on a phone the switch shows clubs, then national teams, and fetches nothing — 390px",
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { api, shot } = await openSection(page);
    await expect(shot.getByTestId("board-shot-pair")).toBeHidden();
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

/** scroll so the phone frame's middle sits at this share of the viewport */
async function frameMidAt(page: Page, share: number) {
  await page.evaluate((share) => {
    const box = document.querySelector('[data-testid="board-shot"] [data-layer]')!
      .parentElement!.getBoundingClientRect();
    const mid = box.top + box.height / 2 + scrollY;
    scrollTo(0, mid - innerHeight * share);
  }, share);
}

test("on a phone, scrolling the frame up past a quarter flips it once, and back — until the reader presses",
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { shot } = await openSection(page);
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    // centred and being read: still the clubs (round 8 flipped here)
    await frameMidAt(page, 0.4);
    await page.waitForTimeout(250);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    await frameMidAt(page, 0.15);
    await expect(shot).toHaveAttribute("data-mode", "championships");
    // inside the hysteresis band nothing changes
    await frameMidAt(page, 0.3);
    await page.waitForTimeout(250);
    await expect(shot).toHaveAttribute("data-mode", "championships");
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    // a fling straight past the whole band still lands on the right side
    await frameMidAt(page, -0.5);
    await expect(shot).toHaveAttribute("data-mode", "championships");
    await frameMidAt(page, 0.7);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    // focus inside the figure: the picture is not swapped out from under it
    await shot.getByRole("button", { name: "Leagues" }).focus();
    await frameMidAt(page, 0.1);
    await page.waitForTimeout(300);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await frameMidAt(page, 0.7);
    await page.waitForTimeout(150);
    // the reader presses: from now on the reader decides
    await shot.getByRole("button", { name: "Leagues" }).click();
    await frameMidAt(page, 0.1);
    await page.waitForTimeout(300);
    await expect(shot).toHaveAttribute("data-mode", "leagues");
  });

test("under reduced motion nothing flips by itself", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce",
    viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const { shot } = await openSection(page);
  await frameMidAt(page, 0.7);
  await frameMidAt(page, 0.1);
  await page.waitForTimeout(300);
  await expect(shot).toHaveAttribute("data-mode", "leagues");
  // and a press swaps at once, with no transition to wait for
  await shot.getByRole("button", { name: "Championships" }).click();
  expect((await frameState(page)).championships).toBe(1);
  await ctx.close();
});

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
     - ON A PHONE AND A TABLET (390, 768) the two captures behind the
       switch are the wide pair's own crops, drawn at ONE scale and one
       height, unmasked, whole inside the frame with an inset all round
       (round 10: the club crop drew 25% larger than the national one,
       the national crop faded a cut-off second card in at its foot and
       its date rule ran into the frame's edge);
     - EVERYWHERE, pin 1 sits just after the gap number, on its line, at
       the same offset in both frames, inside its frame and clear of the
       label under the number (round 10: 2–3px from "GD/G GAP" at 1024,
       and below the number in one frame, beside it in the other);
     - and the intro under the heading is two even lines from 390 to
       1920 (round 10: "picked." alone on a third line at 1920, on a
       second at 768);
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
           the crop's; naturalWidth is whichever srcset size was served.
           The image's own box, not the frame's: the frame adds an inset */
        scale: img.getBoundingClientRect().width / Number(img.getAttribute("width")),
        aspect: Number(img.getAttribute("width")) / Number(img.getAttribute("height")),
        loaded: img.complete && img.naturalWidth > 0,
      };
    });
  });
}

/* WHAT PIN 1 POINTS AT, AND WHAT IT MUST KEEP CLEAR OF, in each crop's
   own pixels — measured off the captures (public/landing/*.jpg): the gap
   number, and the label(s) under it. */
const GAP_NUMBER: Record<string, { num: number[]; under: number[][] }> = {
  "board-leagues-column.jpg": { num: [577, 389, 692, 418], under: [[598, 436, 691, 449]] },
  "board-championships.jpg": { num: [878, 459, 944, 487],
    under: [[863, 506, 943, 517], [660, 525, 943, 541]] },
};

/** press the switch to one capture and wait out the crossfade, so it is
 *  the only one drawn */
async function shownAlone(page: Page, m: "leagues" | "championships") {
  await page.getByTestId(`board-shot-${m}`).click();
  const other = m === "leagues" ? "championships" : "leagues";
  await expect.poll(async () => {
    const st = await frameState(page);
    return st[m] === 1 && st[other] === 0;
  }).toBe(true);
}

/** every visible frame's image, its frame, and pin 1 against the gap number */
async function framesAndPins(page: Page) {
  return page.evaluate((GAP) => {
    return [...document.querySelectorAll<HTMLImageElement>('[data-testid="board-shot"] img')]
      .filter((img) => img.checkVisibility({ opacityProperty: true }))
      .map((img) => {
        const layer = img.parentElement!, frame = layer.parentElement!;
        const i = img.getBoundingClientRect(), f = frame.getBoundingClientRect();
        const file = img.getAttribute("src")!.match(/board-[a-z-]+\.jpg/)![0];
        const k = i.width / Number(img.getAttribute("width"));
        const toCss = ([x0, y0, x1, y1]: number[]) =>
          [i.left + x0 * k, i.top + y0 * k, i.left + x1 * k, i.top + y1 * k];
        const pin = layer.querySelector<HTMLElement>("ol > li")!.getBoundingClientRect();
        // a crop this table does not know measures as NaN, and fails
        const g = GAP[file] ?? { num: [NaN, NaN, NaN, NaN], under: [[NaN, NaN, NaN, NaN]] };
        const num = toCss(g.num);
        const gapTo = (b: number[]) => Math.hypot(Math.max(b[0] - pin.right, 0, pin.left - b[2]),
          Math.max(b[1] - pin.bottom, 0, pin.top - b[3]));
        const mask = getComputedStyle(layer).maskImage
          || getComputedStyle(layer).getPropertyValue("-webkit-mask-image") || "none";
        return {
          file, scale: k, mask,
          img: [i.left, i.top, i.right, i.bottom], frame: [f.left, f.top, f.right, f.bottom],
          inset: [i.left - f.left, i.top - f.top, f.right - i.right, f.bottom - i.bottom],
          // pin 1 against the gap number: its offset past the number's
          // right edge, and its centre against the number's
          after: pin.left - num[2],
          drop: (pin.top + pin.bottom) / 2 - (num[1] + num[3]) / 2,
          clear: Math.min(...g.under.map((u) => gapTo(toCss(u)))),
          pinInFrame: pin.left >= f.left && pin.right <= f.right - 2
            && pin.top >= f.top && pin.bottom <= f.bottom,
        };
      });
  }, GAP_NUMBER);
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
    // nothing in either capture reaches the frame's hairline
    for (const f of await framesAndPins(page)) {
      expect(Math.min(...f.inset), JSON.stringify(f)).toBeGreaterThanOrEqual(8);
    }
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

for (const [w, h] of [[390, 844], [768, 1024]] as const) {
  test(`behind the switch both captures draw at one scale and one height, whole and inset — ${w}px`,
    async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await openSection(page);
      await expect.poll(async () => (await frameState(page)).loaded).toBe(true);
      // both layers are measurable whichever is shown: show each in turn
      const seen: Awaited<ReturnType<typeof framesAndPins>> = [];
      for (const m of ["championships", "leagues"] as const) {
        await shownAlone(page, m);
        seen.push((await framesAndPins(page))[0]);
      }
      const said = JSON.stringify(seen);
      // the wide pair's own crops: one whole column each, one card
      expect(seen.map((f) => f.file).sort(), said)
        .toEqual(["board-championships.jpg", "board-leagues-column.jpg"]);
      // one scale, so the type is one size in both; one height
      expect(Math.abs(seen[0].scale / seen[1].scale - 1), said).toBeLessThan(0.002);
      expect(Math.abs((seen[0].img[3] - seen[0].img[1]) - (seen[1].img[3] - seen[1].img[1])), said)
        .toBeLessThanOrEqual(1);
      for (const f of seen) {
        expect(f.mask, `${f.file} fades something in: ${said}`).toBe("none");
        // whole inside the frame, an inset all round: no date rule or
        // card edge reaches the hairline, nothing is cut at the foot
        expect(Math.min(...f.inset), `${f.file} touches its frame: ${said}`)
          .toBeGreaterThanOrEqual(8);
      }
    });
}

for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]] as const) {
  test(`pin 1 sits after the gap number, the same in both frames, clear of its label — ${w}px`,
    async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await openSection(page);
      await page.evaluate(() => document.fonts.ready);
      const seen: Awaited<ReturnType<typeof framesAndPins>> = [];
      if (w < 1024) {
        for (const m of ["leagues", "championships"] as const) {
          await shownAlone(page, m);
          seen.push((await framesAndPins(page))[0]);
        }
      } else {
        seen.push(...await framesAndPins(page));
      }
      const said = JSON.stringify(seen);
      expect(seen.length, said).toBe(2);
      for (const f of seen) {
        // just after the number, on its line
        expect(f.after, `${f.file}: ${said}`).toBeGreaterThanOrEqual(4);
        expect(f.after, `${f.file}: ${said}`).toBeLessThanOrEqual(10);
        expect(Math.abs(f.drop), `${f.file}: ${said}`).toBeLessThanOrEqual(2);
        // clear of the label(s) under the number, and inside the frame
        expect(f.clear, `${f.file} pin 1 crowds the label under the gap: ${said}`)
          .toBeGreaterThanOrEqual(4);
        expect(f.pinInFrame, `${f.file} pin 1 leaves its frame: ${said}`).toBe(true);
      }
      // and in the same place in both
      expect(Math.abs(seen[0].after - seen[1].after), said).toBeLessThanOrEqual(1);
      expect(Math.abs(seen[0].drop - seen[1].drop), said).toBeLessThanOrEqual(1);
    });
}

for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]] as const) {
  test(`the intro is two even lines, no word left alone — ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await openSection(page);
    await page.evaluate(() => document.fonts.ready);
    const lines = await page.evaluate(() => {
      const body = document.getElementById("landing-board")!.parentElement!.parentElement!
        .lastElementChild!;
      const r = document.createRange();
      r.selectNodeContents(body);
      const by = new Map<number, number>();
      for (const b of r.getClientRects()) {
        const k = Math.round(b.top);
        by.set(k, (by.get(k) ?? 0) + b.width);
      }
      return [...by.values()].map(Math.round);
    });
    expect(lines.length, JSON.stringify(lines)).toBe(2);
    expect(Math.min(...lines) / Math.max(...lines), JSON.stringify(lines))
      .toBeGreaterThanOrEqual(0.6);
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

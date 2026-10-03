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
     - EVERYWHERE, pin 1 sits just under the gap number's label(s),
       right-aligned to the number, the same in both frames, clear of
       every label and of the row below it — and EVERY pin is inside its
       CARD, not merely its frame (round 10: 2–3px from "GD/G GAP" at
       1024; round 11: set after the number, pin 1 sat on the card's gold
       border in every frame — the number is the last thing on its line,
       33 capture px from the border, 11–23px drawn, and a pin is 16–20);
     - each crop is one card wide, border to border, so the Nations
       League date rule ends where the card does (round 11: it ran ~6px
       past the card's right edge — the capture's own edge);
     - and the intro under the heading is two even lines from 390 to
       1920 (round 10: "picked." alone on a third line at 1920, on a
       second at 768), and beside the heading (1024–1920) both lines END
       on the frames' right edge (round 11: flush left, it stopped ~44px
       short of it);
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
   number, the label(s) under it, the next row below that on the number's
   side, and the card's own border box (each crop is one card wide). */
const GAP_NUMBER: Record<string, {
  num: number[]; under: number[][]; below: number[][]; card: number[] }> = {
  "board-leagues-eredivisie.jpg": { num: [560, 389, 677, 419], under: [[580, 435, 675, 450]],
    below: [[529, 532, 640, 549]], card: [0, 298, 712, 800] },
  "board-championships-unl.jpg": { num: [861, 459, 930, 489], under: [[620, 506, 928, 543]],
    below: [[34, 600, 418, 630]], card: [0, 362, 966, 868] },
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
        const pins = [...layer.querySelectorAll<HTMLElement>("ol > li")]
          .map((li) => li.getBoundingClientRect());
        const pin = pins[0];
        // a crop this table does not know measures as NaN, and fails
        const NAN = [NaN, NaN, NaN, NaN];
        const g = GAP[file] ?? { num: NAN, under: [NAN], below: [NAN], card: NAN };
        const num = toCss(g.num);
        const gapTo = (b: number[]) => Math.hypot(Math.max(b[0] - pin.right, 0, pin.left - b[2]),
          Math.max(b[1] - pin.bottom, 0, pin.top - b[3]));
        // the card's INNER edge: its border is 2 capture px
        const c = toCss(g.card), bw = 2 * k;
        const inCard = pins.map((p) => Math.min(p.left - (c[0] + bw), p.top - (c[1] + bw),
          (c[2] - bw) - p.right, (c[3] - bw) - p.bottom));
        const mask = getComputedStyle(layer).maskImage
          || getComputedStyle(layer).getPropertyValue("-webkit-mask-image") || "none";
        return {
          file, scale: k, mask,
          img: [i.left, i.top, i.right, i.bottom], frame: [f.left, f.top, f.right, f.bottom],
          inset: [i.left - f.left, i.top - f.top, f.right - i.right, f.bottom - i.bottom],
          // pin 1 against the gap number: its right edge against the
          // number's, and its top against the lowest label under it
          rightOff: pin.right - num[2],
          below: pin.top - Math.max(...g.under.map((u) => toCss(u)[3])),
          clear: Math.min(...g.under.map((u) => gapTo(toCss(u)))),
          clearBelow: Math.min(...g.below.map((u) => gapTo(toCss(u)))),
          // every pin's least distance inside its card's border
          inCard: Math.min(...inCard),
          pins: pins.length,
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
        // where each line of the intro ENDS (its last text run's right)
        const ir = document.createRange();
        ir.selectNodeContents(grid.lastElementChild!);
        const ends = new Map<number, number>();
        for (const b of ir.getClientRects()) {
          const k = Math.round(b.top);
          ends.set(k, Math.max(ends.get(k) ?? -Infinity, b.right));
        }
        return {
          board: content(h2.closest("section")!),
          below: content(document.getElementById("landing-record")!.closest("section")!),
          grid: edges(grid),
          intro: edges(grid.lastElementChild!),
          pair: edges(document.querySelector('[data-testid="board-shot-pair"]')!),
          lines: new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size,
          introEnds: [...ends.values()],
        };
      });
      const said = JSON.stringify(m);
      expect(m.board, said).toEqual(m.below);
      expect(m.grid, said).toEqual(m.below);
      expect(m.pair, said).toEqual(m.below);
      // the intro ends where the pictures end — its box, and every line
      // of its text (set right: balanced lines are shorter than the box)
      expect(m.intro[1], said).toBe(m.pair[1]);
      expect(m.introEnds.length, said).toBe(2);
      for (const e of m.introEnds) expect(Math.abs(e - m.pair[1]), said).toBeLessThanOrEqual(1);
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
        .toEqual(["board-championships-unl.jpg", "board-leagues-eredivisie.jpg"]);
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
      /* EACH CROP IS ONE CARD WIDE, BORDER TO BORDER (round 12), read off
         the asset's own pixels: halfway down the card, the first and last
         columns are its border and the columns just inside are its
         ground. The Nations League date rule runs to the capture's edge,
         so cut anywhere but the card's border it ran past the card. */
      const edges = await page.evaluate(async (files) => Promise.all(files.map(async (f) => {
        const bmp = await createImageBitmap(await (await fetch(`/landing/${f}`)).blob());
        const cv = document.createElement("canvas");
        cv.width = bmp.width; cv.height = bmp.height;
        const cx = cv.getContext("2d")!;
        cx.drawImage(bmp, 0, 0);
        const y = Math.round(bmp.height * 0.7);
        const lum = (x: number) => Math.max(...cx.getImageData(x, y, 1, 1).data.slice(0, 3));
        return { f, w: bmp.width, edge: [lum(0), lum(bmp.width - 1)], inside: [lum(6), lum(bmp.width - 7)] };
      })), seen.map((f) => f.file));
      for (const e of edges) {
        expect(Math.min(...e.edge), JSON.stringify(e)).toBeGreaterThanOrEqual(60);
        expect(Math.max(...e.inside), JSON.stringify(e)).toBeLessThan(40);
        expect(e.w, JSON.stringify(e)).toBe(GAP_NUMBER[e.f].card[2]);
      }
    });
}

for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]] as const) {
  test(`pin 1 sits under the gap number, the same in both frames, and every pin is inside its card — ${w}px`,
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
        // right-aligned to the number, a few px under its label
        expect(Math.abs(f.rightOff), `${f.file}: ${said}`).toBeLessThanOrEqual(1);
        expect(f.below, `${f.file}: ${said}`).toBeGreaterThanOrEqual(3);
        expect(f.below, `${f.file}: ${said}`).toBeLessThanOrEqual(8);
        // clear of the label(s) under the number and of the row below
        expect(f.clear, `${f.file} pin 1 crowds the label under the gap: ${said}`)
          .toBeGreaterThanOrEqual(3);
        expect(f.clearBelow, `${f.file} pin 1 crowds the row below: ${said}`)
          .toBeGreaterThanOrEqual(4);
        // all three pins inside the card — none on or past its border
        expect(f.pins, said).toBe(3);
        expect(f.inCard, `${f.file} a pin sits on or past its card's border: ${said}`)
          .toBeGreaterThanOrEqual(2);
      }
      // and in the same place in both
      expect(Math.abs(seen[0].rightOff - seen[1].rightOff), said).toBeLessThanOrEqual(1);
      expect(Math.abs(seen[0].below - seen[1].below), said).toBeLessThanOrEqual(1);
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

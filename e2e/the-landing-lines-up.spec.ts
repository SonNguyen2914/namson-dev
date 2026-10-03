import { test, expect, type Page } from "@playwright/test";

/* THE HOME PAGE LINES UP (round 12, 2026-10-03). Small things a reader's
   eye catches before any test did:

   1. NO WORD LEFT ALONE, NO LINE OPENED BY A DASH. The 54′ caption left
      "on." alone at 320×568, the record left "tell." alone at 390, and the
      54′ caption began a line with "—" at 390. Body copy and captions now
      break `pretty`, and every em dash is bound to the word before it by
      a no-break space. Every paragraph and list item on the page, at six
      sizes: a paragraph of two lines or more never ends on one word, and
      no line starts with an em dash. Read word by word off the layout.

   2. ONE LEFT EDGE FOR THE CONTACT VALUES. As wrapped inline pairs the
      email and the GitHub address started 8px apart at 390 ("github" is
      wider than "email"). They now share one label column.

   3. THE FOOTER'S RULE IS IN THE CONTENT COLUMN, like every other rule
      on the page: as a border on the padded wrap it ran 44–1396px at
      1440, past the 100–1340 column.

   4. THE AXIS'S WORDS STAY ON THE SCREEN. At the end of the field's zoom
      on a wide screen "2,000" sat on the screen's edge, cut to "2". Every
      shown tick label keeps at least 16px from either edge, through the
      whole scene. */

async function open(page: Page, w: number, h: number) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto("/");
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => document.fonts.ready);
}

for (const [w, h] of [[320, 568], [360, 640], [375, 548], [390, 844], [768, 1024], [1440, 900]] as const) {
  test(`no paragraph ends on one word and no line starts with a dash — ${w}x${h}`, async ({ page }) => {
    await open(page, w, h);
    const found = await page.evaluate(() => {
      const out: string[] = [];
      const blocks = [...document.querySelectorAll<HTMLElement>(
        '[data-testid="landing"] main p, [data-testid="landing"] main li')]
        // a block that holds blocks of its own is read through them
        .filter((el) => !el.querySelector("p"));
      for (const el of blocks) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const lines: { top: number; bottom: number; words: string[] }[] = [];
        const r = document.createRange();
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = n.textContent ?? "";
          for (const m of text.matchAll(/[^\s]+/g)) {
            r.setStart(n, m.index!);
            r.setEnd(n, m.index! + m[0].length);
            // a word broken at its own hyphen ("walk-" / "forward") is a
            // fragment on each line it reaches; one not drawn has no box
            for (const b of [...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0)) {
              const cur = lines[lines.length - 1];
              if (cur && b.top < cur.bottom - b.height / 2) {
                cur.words.push(m[0]);
                cur.bottom = Math.max(cur.bottom, b.bottom);
              } else {
                lines.push({ top: b.top, bottom: b.bottom, words: [m[0]] });
              }
            }
          }
        }
        const said = lines.map((l) => l.words.join(" ")).join(" / ");
        if (lines.length >= 2 && lines[lines.length - 1].words.length < 2) {
          out.push(`one word alone: ${said}`);
        }
        for (const l of lines.slice(1)) {
          if (/^[—–]/.test(l.words[0])) out.push(`a line starts with a dash: ${said}`);
        }
      }
      return out;
    });
    expect(found, found.join("\n")).toEqual([]);
  });
}

for (const [w, h] of [[390, 844], [1440, 900]] as const) {
  test(`the contact values share one left edge, and the footer's rule keeps to the content column — ${w}px`,
    async ({ page }) => {
      await open(page, w, h);
      const m = await page.evaluate(() => {
        const values = [...document.querySelectorAll('[data-testid="landing-contact"] li a')]
          .map((a) => a.getBoundingClientRect().left);
        const sec = document.getElementById("landing-record")!.closest("section")!;
        const b = sec.getBoundingClientRect(), cs = getComputedStyle(sec);
        const column = [b.left + parseFloat(cs.paddingLeft), b.right - parseFloat(cs.paddingRight)];
        const foot = document.querySelector("footer")!;
        const f = foot.getBoundingClientRect(), rule = getComputedStyle(foot, "::before");
        return {
          values, column,
          rule: [f.left + parseFloat(rule.left), f.right - parseFloat(rule.right)],
          ruleH: parseFloat(rule.height), border: getComputedStyle(foot).borderTopWidth,
        };
      });
      const said = JSON.stringify(m);
      expect(m.values.length, said).toBeGreaterThanOrEqual(2);
      expect(Math.max(...m.values) - Math.min(...m.values), said).toBeLessThanOrEqual(0.5);
      expect(Math.abs(m.rule[0] - m.column[0]), said).toBeLessThanOrEqual(0.5);
      expect(Math.abs(m.rule[1] - m.column[1]), said).toBeLessThanOrEqual(0.5);
      expect(m.ruleH, said).toBe(1);
      // and no second, full-bleed rule under it
      expect(m.border, said).toBe("0px");
    });
}

for (const [w, h] of [[390, 844], [768, 1024], [1440, 900], [1920, 1080]] as const) {
  test(`every tick label on the field's axis stays 16px inside the screen, through the zoom — ${w}px`,
    async ({ page }) => {
      await open(page, w, h);
      const sec = await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>('[data-testid="field-scroll"]')!;
        const st = el.firstElementChild as HTMLElement;
        return { top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight,
          stageH: st.offsetHeight, stickyTop: parseFloat(getComputedStyle(st).top) || 0 };
      });
      const seen: string[] = [];
      let shown = 0;
      for (const p of [0, 0.3, 0.6, 0.8, 0.97]) {
        await page.evaluate((y) => scrollTo(0, y),
          Math.round(sec.top - sec.stickyTop + p * (sec.h - sec.stageH)));
        await page.waitForTimeout(450);              // the labels' own fade
        const labs = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(
          '[data-testid="field-scroll"] [aria-hidden] > div > span')]
          .filter((sp) => Number(getComputedStyle(sp).opacity) > 0
            && Number(getComputedStyle(sp.parentElement!).opacity) > 0)
          .map((sp) => { const b = sp.getBoundingClientRect(); return [sp.textContent, b.left, b.right] as const; }));
        shown += labs.length;
        for (const [t, l, r] of labs) {
          if (l < 16 || r > w - 16) seen.push(`p=${p}: "${t}" at ${l.toFixed(1)}–${r.toFixed(1)}`);
        }
      }
      // the walk saw labels at all (a selector that found none proves nothing)
      expect(shown).toBeGreaterThan(10);
      expect(seen, seen.join("\n")).toEqual([]);
    });
}

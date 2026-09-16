/** THROWAWAY — the operator's measurement table, reproduced.
 *  Not part of the suite: deleted before the PR. Run with
 *    MEASURE_URL=https://namson.dev/bet-suggester npx playwright test zz-measure
 */
import { test, expect, devices } from "@playwright/test";

const URL = process.env.MEASURE_URL || "/bet-suggester";

const RIGS = [
  { name: "iPhone 15 Pro", dev: devices["iPhone 15 Pro"] },
  { name: "iPad (gen 7)", dev: devices["iPad (gen 7)"] },
];

for (const rig of RIGS) {
  test(`measure ${rig.name}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const { defaultBrowserType, ...dev } = rig.dev as Record<string, unknown>;
    void defaultBrowserType;
    const ctx = await browser.newContext(dev);
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector('[data-testid="league-col"]', { timeout: 60_000 });
    await page.waitForTimeout(4000);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const clipped: string[] = [];
      const labels = Array.from(document.querySelectorAll<HTMLElement>(
        '[data-testid="ribbon-pill"] [data-testid="ribbon-name"],'
        + '[data-testid="league-tab"] [data-testid="tab-name"]'));
      for (const l of labels) {
        const want = l.scrollWidth, has = l.clientWidth;
        if (want > has + 1) clipped.push(`${l.textContent} wants ${want} has ${has}`);
      }
      const strip = document.querySelector<HTMLElement>(
        '[data-testid="league-ribbon"],[data-testid="league-tabs"]');
      const stripWin = strip?.parentElement ?? null;
      const track = document.querySelector<HTMLElement>('[data-testid="board-track"]');
      // every interactive control, and how many are under 44x44
      const sel = 'a[href],button,select,input,textarea,summary,[role="tab"],[tabindex]:not([tabindex="-1"])';
      const ctrls = Array.from(document.querySelectorAll<HTMLElement>(sel))
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return b.width > 0 && b.height > 0
            && getComputedStyle(e).visibility !== "hidden";
        });
      const small = ctrls.filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width < 44 || b.height < 44;
      });
      const cols = Array.from(document.querySelectorAll<HTMLElement>(
        '[data-testid="league-col"]'));
      const shown = cols.filter((c) => c.getBoundingClientRect().height > 0);
      return {
        vw,
        labels: labels.length,
        clipped: clipped.length,
        clippedSample: clipped.slice(0, 3),
        stripWidth: strip ? Math.round(strip.scrollWidth) : null,
        stripClient: stripWin ? Math.round(stripWin.clientWidth) : null,
        stripScrolls: stripWin
          ? stripWin.scrollWidth - stripWin.clientWidth > 4 : null,
        boardScrolls: track ? track.scrollWidth - track.clientWidth > 4 : null,
        pageHeight: Math.max(de.scrollHeight, document.body.scrollHeight),
        docScrollWidth: de.scrollWidth,
        controls: ctrls.length,
        under44: small.length,
        under44Sample: small.slice(0, 6).map((e) => {
          const b = e.getBoundingClientRect();
          return `${e.tagName.toLowerCase()}${e.dataset.testid ? `[${e.dataset.testid}]` : ""} ${Math.round(b.width)}x${Math.round(b.height)}`;
        }),
        columns: cols.length,
        columnsDrawn: shown.length,
        drawn: shown.map((c) => c.dataset.league),
      };
    });
    console.log(`\n=== ${rig.name} @ ${m.vw}px — ${URL} ===\n`
      + JSON.stringify(m, null, 2));
    await ctx.close();
    expect(m.vw).toBeGreaterThan(0);
  });
}

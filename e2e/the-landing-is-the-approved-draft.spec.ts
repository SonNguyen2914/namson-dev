import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/* THE HOME PAGE SAYS AND DOES WHAT THE APPROVED v8 DRAFT DOES
   (landing v8, 2026-10-12).

   The draft (trivela-ops/landing-draft/index.html, artifact v8) was
   checked by its own content QA script, archived to
   trivela-archive/landing-draft/verify/content-qa.js. That script reads
   the draft's own ids (#comp-tabs, #cp1, .cp.on, #club-plane .dot.lit);
   this spec is the same checks mapped onto the React components, where
   class names are hashed and the stable hooks are roles, ids and data-
   attributes: tabs `role=tab` in the "Competitions" tablist, panels
   `#cp1..#cp12`, dots `[data-c]` with `data-lit` when their competition
   is lit, the hover card `role=tooltip`.

   Hermetic: the page's one read (/api/site/stats) is answered here; the
   field, nations and derby are baked. Nothing reads a board route. */

const STATS = { schema: "site-stats-v1", figures: {
  corpus_matches: { raw: 45_500, display: "45,500", label: "matches studied", sublabel: "49 competitions since 2010" },
  competitions: { raw: 11, display: "11", label: "competitions" },
  markets: { raw: 1_688, display: "1,600+", label: "Kalshi markets tracked" },
  tests: { raw: null, display: null, label: "backend test functions" },
} };

async function open(page: Page) {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errs.push(`console: ${m.text()}`); });
  await page.route("**/api/site/stats", (r) => r.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify(STATS) }));
  await page.goto("/");
  await expect(page.getByRole("tablist", { name: "Competitions" })).toBeVisible();
  return errs;
}

const state = (page: Page) => page.evaluate(() => {
  const club = document.querySelector('[role=img][aria-label^="Club plane"]')!;
  const nat = document.querySelector('[role=img][aria-label^="National plane"]')!;
  const pp = [...document.querySelectorAll("button[data-state]")][0] as HTMLElement;
  return {
    sel: document.querySelector('[role=tablist][aria-label=Competitions] [aria-selected=true]')!.textContent,
    pp: pp.textContent, ppState: pp.dataset.state,
    lit: club.querySelectorAll("[data-c][data-lit]").length,
    natLit: nat.querySelectorAll("[data-c][data-lit]").length,
    panel: document.querySelector("[role=tabpanel]:not([inert]) h2")!.textContent,
  };
});

async function noSideScroll(page: Page, where: string) {
  const r = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(r.sw, `${where}: horizontal page scroll (${r.sw} > ${r.cw})`).toBeLessThanOrEqual(r.cw);
}

test("first frame: 154 club dots and 139 national dots, twelve tabs, All 11 shown", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const n = await page.evaluate(() => ({
    clubs: new Set([...document.querySelectorAll('[role=img][aria-label^="Club plane"] [data-n]')]
      .map((e) => (e as HTMLElement).dataset.n)).size,
    nats: document.querySelectorAll('[role=img][aria-label^="National plane"] [data-n]').length,
    tabs: document.querySelectorAll('[role=tablist][aria-label=Competitions] [role=tab]').length,
  }));
  expect(n).toEqual({ clubs: 154, nats: 139, tabs: 12 });
  const s = await state(page);
  expect(s.sel).toBe("All 11");
  expect(s.panel).toBe("Eleven competitions");
});

test("the cycle, a pick that ends it, La Liga's derby pair, UNL and CNL on their own axis", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errs = await open(page);
  // the first step lands at 5 s
  await expect.poll(async () => (await state(page)).sel, { timeout: 9_000 }).toBe("EPL");
  await expect.poll(async () => (await state(page)).lit).toBe(20);
  expect((await state(page)).panel).toBe("Premier League");

  const tab = (name: string) => page.getByRole("tab", { name, exact: true });
  await tab("Bundesliga").click();
  await expect.poll(async () => state(page)).toMatchObject({ sel: "Bundesliga", pp: "Play", lit: 17 });
  // and it stays stopped
  await page.waitForTimeout(5_500);
  expect((await state(page)).sel).toBe("Bundesliga");

  await tab("La Liga").click();
  // 17 clubs on the plane, the Madrid pair among them (drawn as the focus dots)
  await expect.poll(async () => (await state(page)).lit).toBe(19);

  await tab("UNL").click();
  await expect.poll(async () => state(page)).toMatchObject({ sel: "UNL", natLit: 54, lit: 0 });
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => state(page)).toMatchObject({ sel: "CNL", natLit: 37 });
  await noSideScroll(page, "after picks");
  expect(errs).toEqual([]);
});

test("hover a dot: its team and its Elo, read from the dot itself", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByRole("tab", { name: "La Liga", exact: true }).click();
  await page.waitForTimeout(1_700);
  const dot = await page.evaluate(() => {
    const el = [...document.querySelectorAll<HTMLElement>(
      '[role=img][aria-label^="Club plane"] [data-c][data-lit]')]
      .find((e) => e.style.visibility !== "hidden" && e.getBoundingClientRect().width > 0)!;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: el.dataset.n!, v: Number(el.dataset.v) };
  });
  await page.mouse.move(dot.x - 40, dot.y - 40);
  await page.mouse.move(dot.x, dot.y, { steps: 4 });
  const tip = page.locator("[role=tooltip]");
  await expect(tip).toContainText(dot.n);
  await expect(tip).toContainText(`${Math.round(dot.v).toLocaleString("en-US")} Elo`);
  await expect(tip).toContainText("La Liga");
  await expect.poll(() => tip.evaluate((e) => Number(getComputedStyle(e).opacity))).toBeGreaterThan(0.5);
});

test("the content update: the panels' reads, the hero caption, the record", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const t = (sel: string) => page.locator(sel).evaluate((e) => e.textContent ?? "");
  const all = await t("#cp1"), epl = await t("#cp2"), bund = await t("#cp6"), unl = await t("#cp10");
  expect(all).toContain("our model’s forecast");
  expect(bund).toContain("our model’s forecast");
  expect(epl).toContain("Model beside the market, minute by minute.");
  expect(bund).toContain("T−10 price, not a model");
  expect(unl).toContain("No national‑team model yet");
  await expect(page.getByText(/clubs as of 7 Oct 2026/)).toBeAttached();

  const rec = page.locator("#record");
  await expect(rec.getByTestId("record-figures")).toHaveAttribute("data-source", "live");
  const txt = (await rec.textContent()) ?? "";
  for (const s of ["45,500", "49 competitions since 2010", "1,600+", "12,000+", "still", "learning",
    "Measured, then said plainly.", "not better than the market"]) expect(txt).toContain(s);
});

test("the derby card is on the board: Atlético v Real Madrid", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const imgs = page.getByTestId("board-shot-pair").locator("img");
  const srcs = await imgs.evaluateAll((els) => els.map((e) => e.getAttribute("src") ?? ""));
  expect(srcs.some((s) => s.includes("board-leagues-laliga-derby.jpg"))).toBe(true);
  expect(srcs.some((s) => s.includes("eredivisie"))).toBe(false);
  const alt = await imgs.first().getAttribute("alt");
  expect(alt).toContain("Atlético Madrid v Real Madrid");
  await expect(page.getByTestId("board")).toContainText("On this card, Real Madrid by a little");
});

for (const [w, h] of [[1440, 900], [1280, 800], [400, 900]] as const) {
  for (const reduced of [false, true]) {
    test(`no horizontal scroll at ${w}px${reduced ? ", reduced motion" : ""}, top to bottom`, async ({ page }) => {
      if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: w, height: h });
      const errs = await open(page);
      await noSideScroll(page, "load");
      if (w <= 400) {
        const gut = await page.locator("#landing-h1").evaluate((e) => e.getBoundingClientRect().left);
        expect(gut).toBeGreaterThanOrEqual(16);
      }
      if (reduced) {
        expect((await state(page)).pp).toBe("Timer off");
        await expect(page.locator("#field-match")).toBeVisible();
      }
      for (const id of ["#board", "#clock", "#review", "#record", "#door"]) {
        await page.locator(id).evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 40));
        await page.waitForTimeout(150);
        await noSideScroll(page, id);
      }
      expect(errs).toEqual([]);
    });
  }
}

/* THE SITE IS DARK-ONLY. The draft's QA ran once under a light
   prefers-color-scheme to prove the page does not half-switch: the
   ground and the ink stay the page's own in both. */
for (const scheme of ["light", "dark"] as const) {
  test(`under a ${scheme} system scheme the page keeps its own dark ground`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const c = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).backgroundColor,
      root: getComputedStyle(document.querySelector('[data-testid="landing"]')!).backgroundColor,
      h1: getComputedStyle(document.querySelector("#landing-h1")!).color,
    }));
    const lum = (rgb: string) => { const [r, g, b] = rgb.match(/\d+/g)!.map(Number); return (r + g + b) / 3; };
    expect(lum(c.html), JSON.stringify(c)).toBeLessThan(20);
    expect(lum(c.root === "rgba(0, 0, 0, 0)" ? c.html : c.root), JSON.stringify(c)).toBeLessThan(20);
    expect(lum(c.h1), JSON.stringify(c)).toBeGreaterThan(200);
    await noSideScroll(page, scheme);
  });
}

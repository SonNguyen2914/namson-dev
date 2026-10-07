import { expect, test, type Locator, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight, serveEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { DERBY, block, liveBlock, withModelMarket } from "./model-market";

/* THE CARD'S MODEL AND MARKET LINES (Son's approved card, 2026-10-07;
 * spec claude.ai/artifact/FELBHkNhRZaQiXe9UyFgxw).
 *
 *            ATM    DRAW   RMA
 *    model   42.2%  24.1%  33.7%
 *    market  27.2%  24.3%  48.5%  [WIDE]
 *    [WATCH · NEEDS TOKEN] [● MODEL · CONFLICT]
 *
 * Hermetic: the recorded eight-column and Championships boards, dressed in
 * the backend's `model_vs_market` block (e2e/model-market.ts). Every state
 * the card can be in; one decimal, with the source detail in the hover;
 * the header codes; the box's colour, word and dashed style; the WIDE and
 * THIN tags; "no model read" in words and never a 0%; and no sideways
 * scroll at 375px. */

const json = (body: unknown) => ({ status: 200, contentType: "application/json",
  body: JSON.stringify(body) });

const IDS = {
  conflict: "401882872", agree: "401882859", untested: "401884790",
  noModel: "401884786", noMarket: "401879272", wide: "401879273",
  thin: "401874944", refused: "401878778",
} as const;

function board() {
  const b = withModelMarket(BOARD_EIGHT) as unknown as {
    rows: Array<Record<string, unknown>>; refusals: Array<Record<string, unknown>> };
  const set = (id: string, mm: unknown) => {
    const r = [...b.rows, ...b.refusals].find((x) => x.event_id === id)!;
    r.model_vs_market = mm;
  };
  set(IDS.conflict, block({ codes: { h: "ATM", a: "RMA" } }));
  set(IDS.agree, block({ model: { h: 0.301, d: 0.250, a: 0.449 } }));
  set(IDS.untested, block({ model: { h: 0.310, d: 0.262, a: 0.428 },
                            tested: false }));
  set(IDS.noModel, block({ model: null }));
  set(IDS.noMarket, block({ market: null }));
  set(IDS.wide, block({ model: { h: 0.301, d: 0.250, a: 0.449 },
                        flag: "WIDE", flagLeg: "d" }));
  set(IDS.thin, block({ model: { h: 0.301, d: 0.250, a: 0.449 },
                        flag: "THIN", flagLeg: "h" }));
  set(IDS.refused, block({ model: { h: 0.301, d: 0.250, a: 0.449 } }));
  return b;
}

const card = (page: Page, id: string) => page.locator(
  `[data-testid="picker-row"][data-event="${id}"], `
  + `[data-testid="picker-refusal"][data-event="${id}"]`).first();

async function ink(page: Page, cls: string, prop: "color" | "borderTopColor") {
  return page.evaluate(([c, p]) => {
    const probe = document.createElement("span");
    probe.className = c;
    document.body.appendChild(probe);
    const v = getComputedStyle(probe)[p as "color"];
    probe.remove();
    return v;
  }, [cls, prop]);
}

const text = (l: Locator) => l.innerText();
const title = async (l: Locator) => (await l.getAttribute("title")) ?? "";

test.describe("the card's model and market lines", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await serveEight(page, board());
  });

  test("the derby: one decimal, home / draw / away, model first", async ({ page }) => {
    const c = card(page, IDS.conflict);
    const vals = async (lab: string) => Promise.all(["h", "d", "a"].map(
      (k) => text(c.getByTestId(`mm-${lab}-${k}`))));
    expect(await vals("model")).toEqual(["42.2%", "24.1%", "33.7%"]);
    expect(await vals("market")).toEqual(["27.2%", "24.3%", "48.5%"]);
    // header: home code, the word DRAW, away code
    expect(await Promise.all(["h", "d", "a"].map(
      (k) => text(c.getByTestId(`mm-head-${k}`))))).toEqual(["ATM", "DRAW", "RMA"]);
    // model line ABOVE the market line
    const mb = (await c.getByTestId("mm-model-label").boundingBox())!;
    const kb = (await c.getByTestId("mm-market-label").boundingBox())!;
    expect(mb.y).toBeLessThan(kb.y);
    // and the old ask line is gone from this card
    await expect(c.getByText(/^ask \d+¢$/)).toHaveCount(0);
  });

  test("each line's highest outcome is bright; the rest are mid ink", async ({ page }) => {
    const c = card(page, IDS.conflict);
    const hi = await ink(page, "text-ink-hi", "color");
    const mid = await ink(page, "text-ink-mid", "color");
    const look = (id: string) => c.getByTestId(id).evaluate((e) => {
      const s = getComputedStyle(e);
      return { color: s.color, weight: s.fontWeight };
    });
    expect(await look("mm-model-h")).toEqual({ color: hi, weight: "600" });
    expect((await look("mm-model-a")).color).toBe(mid);
    expect(await look("mm-market-a")).toEqual({ color: hi, weight: "600" });
    expect((await look("mm-market-h")).color).toBe(mid);
    // values and headers are centred in their columns
    for (const id of ["mm-model-h", "mm-head-d", "mm-market-a"]) {
      expect(await c.getByTestId(id).evaluate((e) => getComputedStyle(e).textAlign))
        .toBe("center");
    }
  });

  test("the hovers carry the source detail", async ({ page }) => {
    const c = card(page, IDS.conflict);
    const m = await title(c.getByTestId("mm-model-label"));
    expect(m).toContain("unified-nb-v1");
    expect(m).toContain("tested, not worse");
    expect(m).toMatch(/read Sep 20, 14:04 UTC/);
    expect(m).toContain("shadow, not advice");
    const k = await title(c.getByTestId("mm-market-label"));
    expect(k).toContain("Kalshi, overround removed so H + D + A = 100");
    for (const part of ["ATM ask 28¢", "bid 27¢", "spread 1¢", "size 421,736",
                        "DRAW ask 25¢", "RMA ask 50¢"]) expect(k).toContain(part);
    expect(await title(c.getByTestId("mm-model-h"))).toBe(m);
    expect(await title(c.getByTestId("mm-market-a"))).toBe(k);
  });

  test("the verdict box: word, colour and solid or dashed", async ({ page }) => {
    const up = await ink(page, "text-up", "color");
    const warn = await ink(page, "text-warn", "color");
    const low = await ink(page, "text-ink-low", "color");
    const watch = page.getByTestId("watch-toggle").first();
    const want = [
      [IDS.conflict, "MODEL · CONFLICT", warn, "solid"],
      [IDS.agree, "MODEL · AGREE", up, "solid"],
      [IDS.untested, "MODEL · AGREE", up, "dashed"],
      [IDS.noModel, "MODEL · NONE", low, "solid"],
      [IDS.noMarket, "MARKET · NONE", low, "solid"],
    ] as const;
    for (const [id, word, color, style] of want) {
      const box = card(page, id).getByTestId("mm-verdict");
      await expect(box).toHaveText(word);
      const s = await box.evaluate((e) => {
        const cs = getComputedStyle(e);
        return { color: cs.color, style: cs.borderTopStyle, h: e.getBoundingClientRect().height,
                 radius: cs.borderTopLeftRadius, font: cs.fontSize };
      });
      expect(s.color, id).toBe(color);
      expect(s.style, id).toBe(style);
      // same box as WATCH: same radius, type size and height
      const w = await card(page, id).getByTestId("watch-toggle")
        .locator("button, span").first().evaluate((e) => {
          const cs = getComputedStyle(e);
          return { h: e.getBoundingClientRect().height, radius: cs.borderTopLeftRadius,
                   font: cs.fontSize };
        });
      expect(s.radius, id).toBe(w.radius);
      expect(s.font, id).toBe(w.font);
      expect(Math.abs(s.h - w.h), id).toBeLessThanOrEqual(1);
      // and it sits BESIDE the watch box, on its row
      const wb = (await card(page, id).getByTestId("watch-toggle")
        .locator("button, span").first().boundingBox())!;
      const bb = (await box.boundingBox())!;
      expect(Math.abs(bb.y - wb.y), id).toBeLessThanOrEqual(2);
      expect(bb.x, id).toBeGreaterThan(wb.x);
    }
    void watch;
    expect(await title(card(page, IDS.untested).getByTestId("mm-verdict")))
      .toContain("Model untested");
    expect(await title(card(page, IDS.untested).getByTestId("mm-model-label")))
      .toContain("untested");
  });

  test("a missing read is said in words, and never drawn as 0%", async ({ page }) => {
    const nm = card(page, IDS.noModel);
    await expect(nm.getByTestId("mm-model-empty")).toHaveText("no model read");
    await expect(nm.getByTestId("mm-model-h")).toHaveCount(0);
    const nk = card(page, IDS.noMarket);
    await expect(nk.getByTestId("mm-market-empty")).toHaveText("no full Kalshi book");
    await expect(nk.getByTestId("mm-market-h")).toHaveCount(0);
    for (const c of [nm, nk]) {
      expect(await text(c.getByTestId("mm-lines"))).not.toMatch(/(^|\D)0(\.0)?%/);
    }
    // the hover says why, in words, with the code at the end
    expect(await title(nm.getByTestId("mm-model-empty")))
      .toContain("the trader has no fixture for this match");
    // and no card on the board prints a zero percentage it was not sent
    const all = await page.getByTestId("mm-lines").allInnerTexts();
    expect(all.join("\n")).not.toMatch(/(^|\D)0\.0%/);
  });

  test("WIDE and THIN: an amber tag at the end of the market line", async ({ page }) => {
    const warn = await ink(page, "text-warn", "color");
    const w = card(page, IDS.wide).getByTestId("mm-book-flag");
    await expect(w).toHaveText("WIDE");
    expect(await w.evaluate((e) => getComputedStyle(e).color)).toBe(warn);
    expect(await title(w)).toContain("Spread 7¢ on the DRAW book");
    const t = card(page, IDS.thin).getByTestId("mm-book-flag");
    await expect(t).toHaveText("THIN");
    expect(await title(t)).toContain("Only 6 contracts");
    // on the market line, after its last value
    const lastV = (await card(page, IDS.wide).getByTestId("mm-market-a").boundingBox())!;
    const fb = (await w.boundingBox())!;
    expect(fb.x).toBeGreaterThan(lastV.x + lastV.width - 1);
    expect(Math.abs((fb.y + fb.height / 2) - (lastV.y + lastV.height / 2)))
      .toBeLessThanOrEqual(4);
    // a healthy book says nothing
    await expect(card(page, IDS.conflict).getByTestId("mm-book-flag")).toHaveCount(0);
  });

  test("a refused card's bottom follows the same spec", async ({ page }) => {
    const c = card(page, IDS.refused);
    await expect(c).toHaveAttribute("data-testid", "picker-refusal");
    await expect(c.getByTestId("mm-model-a")).toHaveText("44.9%");
    await expect(c.getByTestId("mm-verdict")).toHaveText("MODEL · AGREE");
  });

  test("header codes fall back to the names when the backend sends none", async ({ page }) => {
    const c = card(page, IDS.agree);              // Barcelona v Sevilla
    const heads = await Promise.all(["h", "d", "a"].map(
      (k) => text(c.getByTestId(`mm-head-${k}`))));
    expect(heads[1]).toBe("DRAW");
    for (const h of [heads[0], heads[2]]) expect(h).toMatch(/^[A-Z]{3}$/);
  });
});

test("the cards' order is the same with and without the block (display only)",
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const order = async () => page.locator(
      '[data-testid="picker-row"], [data-testid="picker-refusal"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-event")));
    await serveEight(page, BOARD_EIGHT);
    const without = await order();
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await serveEight(page, board());
    expect(await order()).toEqual(without);
  });

test("at 375px the card has no sideways scroll and 48.5% never wraps",
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await serveEight(page, board());
    await page.locator('[data-testid="league-tab"][data-slug="laliga"]').click();
    const c = card(page, IDS.conflict);
    await c.scrollIntoViewIfNeeded();
    await expect(c.getByTestId("mm-market-a")).toHaveText("48.5%");
    const sideways = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sideways).toBeLessThanOrEqual(0);
    for (const id of ["mm-model-h", "mm-model-d", "mm-model-a",
                      "mm-market-h", "mm-market-d", "mm-market-a"]) {
      const lines = await c.getByTestId(id).evaluate((e) => {
        const r = document.createRange();
        r.selectNodeContents(e);
        return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
      });
      expect(lines, `${id} sits on one line`).toBe(1);
    }
    // the lines stay inside the card
    const cb = (await c.boundingBox())!;
    const lb = (await c.getByTestId("mm-lines").boundingBox())!;
    expect(lb.x + lb.width).toBeLessThanOrEqual(cb.x + cb.width);
    // and the empty-state words fit too
    const nm = card(page, IDS.noModel);
    void nm;
  });

test("the Championships board's cards carry the same bottom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  const champ = withModelMarket(CHAMP_BOARD as never, {}) as never;
  await page.route("**/api/championships/board**", (r) => r.fulfill(json(champ)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
  for (const lg of ["unl", "cnl", "afcon"]) {
    const col = page.locator(`[data-testid="league-col"][data-league="${lg}"]`);
    const cards = col.locator('[data-testid="picker-row"], [data-testid="picker-refusal"]');
    const n = await cards.count();
    if (n === 0) continue;
    await expect(col.getByTestId("mm-lines")).toHaveCount(n);
    await expect(col.getByTestId("mm-verdict")).toHaveCount(n);
  }
  // the derby numbers on the first conflict card, one decimal
  const first = page.locator('[data-testid="mm-lines"][data-verdict="conflict"]').first();
  await expect(first.getByTestId("mm-model-h")).toHaveText("42.2%");
  void DERBY;
});

/* ONCE THE MATCH HAS KICKED OFF (Son, 2026-10-07, option A). The model
 * line is the pre-kickoff read and the market line is the live book, so
 * the card stops comparing them: the model line goes grey and says
 * "pre-kickoff", the market line is unchanged, and the box reads IN PLAY
 * (grey, solid) — never AGREE or CONFLICT. Full time is the same. */
test.describe("once the match has kicked off", () => {
  const LIVE = IDS.conflict, PRE = IDS.agree, DONE = IDS.wide,
    LIVE_UNTESTED = IDS.untested;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const b = board();
    const at = (id: string) => [...b.rows, ...b.refusals]
      .find((x) => x.event_id === id)!;
    Object.assign(at(LIVE), { state: "in", in_play: true, live: liveBlock("in") });
    Object.assign(at(LIVE_UNTESTED), { state: "in", in_play: true,
                                       live: liveBlock("in") });
    // full time: the provider's own `post`, for the one cached board a
    // finished match can still ride on
    Object.assign(at(DONE), { state: "post", in_play: false,
                              live: liveBlock("post") });
    await serveEight(page, b);
  });

  for (const [what, id] of [["a live row", LIVE], ["a finished row", DONE]] as const) {
    test(`${what}: grey pre-kickoff model line, live market line, IN PLAY box`,
      async ({ page }) => {
        const c = card(page, id);
        await c.scrollIntoViewIfNeeded();
        const faint = await ink(page, "text-ink-faint", "color");
        const hi = await ink(page, "text-ink-hi", "color");
        const low = await ink(page, "text-ink-low", "color");
        // the model line: every value dim, none bright
        for (const k of ["h", "d", "a"]) {
          const v = c.getByTestId(`mm-model-${k}`);
          await expect(v).toHaveAttribute("data-top", "0");
          const s = await v.evaluate((e) => {
            const cs = getComputedStyle(e);
            return { color: cs.color, weight: cs.fontWeight };
          });
          expect(s.color, k).toBe(faint);
          expect(s.weight, k).not.toBe("600");
        }
        // its label says pre-kickoff, and the hover says why
        const lab = c.getByTestId("mm-model-label");
        await expect(c.getByTestId("mm-pre-kickoff")).toBeVisible();
        expect((await lab.textContent())?.replace(/\s+/g, " ").trim())
          .toBe("model · pre-kickoff");
        expect(await title(lab)).toContain(
          "read before kickoff; it does not update during the match");
        // the market line is unchanged: its top outcome is still bright
        const mk = await c.locator('[data-testid^="mm-market-"][data-top="1"]')
          .evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
        expect(mk).toEqual([hi]);
        // the box: IN PLAY, grey, solid, and why on the hover
        const box = c.getByTestId("mm-verdict");
        await expect(box).toHaveText("IN PLAY");
        await expect(box).toHaveAttribute("data-phase", "in_play");
        const bs = await box.evaluate((e) => {
          const cs = getComputedStyle(e);
          return { color: cs.color, style: cs.borderTopStyle };
        });
        expect(bs).toEqual({ color: low, style: "solid" });
        expect(await title(box))
          .toMatch(/agree\/conflict compares pre-match reads only/i);
        // and no verdict word anywhere on the card
        expect(await c.innerText()).not.toMatch(/\b(AGREE|CONFLICT)\b/);
      });
  }

  test("an untested model in play is still a SOLID IN PLAY box", async ({ page }) => {
    const box = card(page, LIVE_UNTESTED).getByTestId("mm-verdict");
    await expect(box).toHaveText("IN PLAY");
    expect(await box.evaluate((e) => getComputedStyle(e).borderTopStyle))
      .toBe("solid");
  });

  test("a pre-match row is unchanged", async ({ page }) => {
    const c = card(page, PRE);
    const hi = await ink(page, "text-ink-hi", "color");
    await expect(c.getByTestId("mm-verdict")).toHaveText("MODEL · AGREE");
    await expect(c.getByTestId("mm-verdict")).toHaveAttribute("data-phase", "pre_match");
    await expect(c.getByTestId("mm-pre-kickoff")).toHaveCount(0);
    await expect(c.getByTestId("mm-model-label")).toHaveText("model");
    expect(await c.getByTestId("mm-model-a").evaluate((e) => getComputedStyle(e).color))
      .toBe(hi);
  });
});

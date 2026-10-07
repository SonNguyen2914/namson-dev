import { expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, serveEight } from "./eight-columns";
import { withModelMarket } from "./model-market";

/* REFUSED CARDS IN KICKOFF ORDER, AND THE SIZE OF A RANKED CARD
 * (Son, 2026-10-07, off a screenshot of the board in KICKOFF sort).
 *
 *  - In KICKOFF sort a refused card sits between the cards whose kickoffs
 *    bracket it (it used to drop to the bottom of its day), and takes its
 *    number in kickoff order like any other card.
 *  - In a GAP sort it has no gap, so it stays after every ranked card and
 *    carries no number.
 *  - It is drawn the size of the cards around it: same width, the same
 *    frame and no raised glow, and the same rows (its refused stats and
 *    tiers rows stand in for the normal ones; they are not extra rows).
 *
 * Fixture: the recorded eight-column board, Serie A's Sunday. Napoli v
 * Fiorentina kicks off 10:30Z and AC Milan v Lecce 18:45Z; the refused
 * Monza v Sassuolo is moved to 13:00Z the same day, between them. */

function sunday() {
  const b = withModelMarket(BOARD_EIGHT) as unknown as {
    refusals: Array<Record<string, unknown>> };
  const monza = b.refusals.find((r) => r.event_id === "401874756")!;
  monza.kickoff = "2026-09-20T13:00Z";
  return b;
}

const NAPOLI = "401874934", MILAN = "401874944", MONZA = "401874756";

async function dayOrder(page: Page) {
  const ref = page.locator(`[data-testid="picker-refusal"][data-event="${MONZA}"]`);
  const track = ref.locator("xpath=ancestor::*[@data-testid='day-track'][1]");
  return track.locator('[data-testid="picker-row"], [data-testid="picker-refusal"]')
    .evaluateAll((els) => els.map((e) => ({
      id: e.getAttribute("data-event"),
      n: (e.querySelector('[data-testid="row-rank"], [data-testid="refused-number"]')
        ?.textContent ?? "").trim() })));
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await serveEight(page, sunday());
});

test("KICKOFF sort: the refused card lands between the kickoffs that bracket "
  + "it, and is numbered in that order", async ({ page }) => {
    const order = await dayOrder(page);
    const ids = order.map((o) => o.id);
    expect(ids.indexOf(NAPOLI)).toBeLessThan(ids.indexOf(MONZA));
    expect(ids.indexOf(MONZA)).toBeLessThan(ids.indexOf(MILAN));
    // numbers are kickoff positions, the refused card's included
    expect(order.map((o) => o.n))
      .toEqual(order.map((_, i) => String(i + 1).padStart(2, "0")));
  });

test("GAP sort: the refused card comes after every ranked card, unnumbered",
  async ({ page }) => {
    const ref = page.locator(`[data-testid="picker-refusal"][data-event="${MONZA}"]`);
    const day = await ref.locator("xpath=ancestor::*[@data-testid='day-track'][1]")
      .getAttribute("data-day");
    await page.locator(`[data-testid="band-sort"][data-day="${day}"]`).selectOption("gdg");
    const order = await dayOrder(page);
    const last = order.map((o) => o.id).indexOf(MONZA);
    expect(last).toBe(order.length - 1);
    expect(order[last].n).toBe("");
    expect(order.slice(0, -1).map((o) => o.n))
      .toEqual(order.slice(0, -1).map((_, i) => String(i + 1).padStart(2, "0")));
  });

test("the refused card is the size of the ranked cards around it", async ({ page }) => {
  const ref = page.locator(`[data-testid="picker-refusal"][data-event="${MONZA}"]`);
  const nap = page.locator(`[data-testid="picker-row"][data-event="${NAPOLI}"]`);
  await ref.scrollIntoViewIfNeeded();
  const r = (await ref.boundingBox())!, n = (await nap.boundingBox())!;
  expect(Math.abs(r.width - n.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(r.height - n.height),
    `refused ${r.height}px v ranked ${n.height}px`).toBeLessThanOrEqual(6);
  const look = (l: typeof ref) => l.evaluate((e) => {
    const s = getComputedStyle(e);
    return { shadow: s.boxShadow, bw: s.borderTopWidth, radius: s.borderTopLeftRadius,
             pad: `${s.paddingTop} ${s.paddingLeft}` };
  });
  const a = await look(ref), b = await look(nap);
  expect(a.shadow).toBe("none");
  expect(a.bw).toBe(b.bw);
  expect(a.radius).toBe(b.radius);
  expect(a.pad).toBe(b.pad);
  // the refused stats and tiers rows STAND IN for the ranked ones: the
  // same number of blocks between the chip row and the bottom section
  const blocks = (l: typeof ref) => l.evaluate((e) => e.children.length);
  expect(await blocks(ref)).toBe(await blocks(nap));
});

/* AND ON ANOTHER MACHINE'S FONT METRICS (CI, 2026-10-07). On Linux the
 * refused card's chip row — "02 · NEW TO THE LEAGUE · Sun, Sep 20, 6:00 AM"
 * — measured wider than on macOS, wrapped, and the card came out 317px
 * against its neighbour's 294. The fix is the CARD (a one-line chip row
 * with room to spare, truncating rather than wrapping); this proves it
 * by widening every glyph on the page the way a different rasteriser
 * does, and by narrowing the track, and asking the same two questions:
 * is the chip row one line, and is the card its neighbour's size? */
for (const [label, width, spacing] of [
  ["wider glyphs at 1440", 1440, "0.03em"],
  ["a narrower track at 1280", 1280, "0em"],
] as const) {
  test(`the refused chip row stays one line — ${label}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    await page.addStyleTag({ content: `[data-testid="picker-row"],
      [data-testid="picker-refusal"] { letter-spacing: ${spacing} !important }` });
    const ref = page.locator(`[data-testid="picker-refusal"][data-event="${MONZA}"]`);
    const nap = page.locator(`[data-testid="picker-row"][data-event="${NAPOLI}"]`);
    await ref.scrollIntoViewIfNeeded();
    const tops = await ref.evaluate((c) => [...c.querySelectorAll(
      '[data-testid="refused-number"], [data-testid="refusal-reason"], '
      + '[data-testid="refused-kickoff"]')]
      .map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops.length).toBe(3);
    expect(Math.max(...tops) - Math.min(...tops), `chip tops ${tops}`)
      .toBeLessThanOrEqual(2);
    const r = (await ref.boundingBox())!, n = (await nap.boundingBox())!;
    expect(Math.abs(r.height - n.height),
      `refused ${r.height}px v ranked ${n.height}px`).toBeLessThanOrEqual(6);
    // the reason is never cut without its words on the hover
    expect(await ref.getByTestId("refusal-reason").getAttribute("title"))
      .toContain("no_prior_row");
  });
}

/** THIS SEASON ALONE REVERSES THE ORDER — the one counterfactual the card
 *  draws (Son, 2026-10-19).
 *
 *  The board ranks on the blended table; `current_only` is the same table
 *  on this season alone (backend src/picker/board.py, `orient_current_only`,
 *  every gap signed from the ROW's favourite). Until today the card carried
 *  it as data only (`data-season-alt` + a hover on the anchor). Now a
 *  SIGN flip — the two cuts naming different clubs as the better side —
 *  draws one quiet `season-flip` chip, and nothing else changes:
 *    - a material same-sign difference keeps the attribute and gets NO chip;
 *    - an ordinary row carries neither;
 *    - the chip's hover is the anchor's own sentence.
 *
 *  REAL PAYLOAD SHAPES (AGENTS.md §8). The board is the recorded league
 *  board (e2e/league-recorded.ts, backend 7525d7b9). No recorded row flips
 *  — in that recording every counterfactual agrees on the favourite — so
 *  ONE recorded row's `current_only` is rewritten in the exact shape
 *  `orient_current_only` emits when the current-only table picks the
 *  OTHER club: `favourite` the opponent, `reoriented: true`, every gap
 *  negated. Nothing is relabelled; the other five rows are untouched, and
 *  Bayern v Leipzig is the recording's own material-but-same-sign row. */
import { test, expect, type Page } from "@playwright/test";
import { routeCups } from "./cups-board";
import { CHAMP_BOARD } from "./championships-recorded";
import { LEAGUE_RECORDED, LEAGUE_RECORDED_CLOCK } from "./league-recorded";

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b),
});

/** Real Madrid v Sevilla: blend +1.37 GD/g, this season (recorded) +1.25 */
const FLIP_EVENT = "401882839";
/** Bayern v RB Leipzig: blend +1.45, this season +0.40 — same sign, material */
const MATERIAL_EVENT = "401884772";
/** Arsenal v Nottingham Forest: blend +1.27, this season +1.33 — agrees */
const QUIET_EVENT = "401878769";

type Row = { event_id: string; opponent: string; current_only: Record<string, unknown> };

function flippedBoard() {
  const board = structuredClone(LEAGUE_RECORDED) as unknown as { rows: Row[] };
  const row = board.rows.find((r) => r.event_id === FLIP_EVENT)!;
  // what orient_current_only serves when the current-only table names the
  // opponent: its own pick beside the gaps, every gap negated
  row.current_only = {
    ...row.current_only,
    favourite: row.opponent,
    gdg_gap: -0.25, ppg_gap: -0.125, rank_gap: -1,
    reoriented: true,
  };
  return board;
}

async function openBoard(page: Page, board: unknown) {
  await page.clock.install({ time: new Date(LEAGUE_RECORDED_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "leagues"); } catch { /* none */ }
  });
  await routeCups(page);
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"]');
}

const card = (page: Page, ev: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${ev}"]`).first();

test("a sign flip draws ONE quiet chip, with the anchor's own sentence",
  async ({ page }) => {
    await openBoard(page, flippedBoard());
    const c = card(page, FLIP_EVENT);
    const chip = c.getByTestId("season-flip");
    await expect(chip).toHaveCount(1);
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText("this season: reversed");
    await expect(chip).toHaveAttribute("data-season-alt", "−0.25");
    await expect(chip).toHaveAttribute("data-season-blend", "+1.37");
    const anchor = c.getByTestId("row-anchor");
    // ONE sentence for both — they cannot give two accounts of one fact
    expect(await chip.getAttribute("title"))
      .toBe(await anchor.getAttribute("title"));
    await expect(chip).toHaveAttribute("title", /ON THIS SEASON ALONE/);
    // the figure itself is untouched: no qualifier ink on the number
    await expect(anchor).toHaveText(/^\s*\+1\.37\s*$/);
    // outside the link: the chip is a statement, not a way in
    expect(await chip.evaluate((el) => el.closest("a") === null)).toBe(true);
    // and it is the only one on the board
    await expect(page.getByTestId("season-flip")).toHaveCount(1);
  });

test("the chip's hover names the GD/g gap whatever the column sorts on (C26): its numbers are always GD/g",
  async ({ page }) => {
    // sorted on the ppg gap, the anchor's key reads "ppg gap"; the hover
    // used to borrow that key and said "the ppg gap is −0.25, not +1.37"
    // about two GD/g figures
    // the day bands' sort control is drawn from xl up
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openBoard(page, flippedBoard());
    const bands = page.getByTestId("band-sort");
    expect(await bands.count()).toBeGreaterThan(0);
    for (let i = 0; i < await bands.count(); i += 1) {
      await bands.nth(i).selectOption("ppg");
    }
    const c = card(page, FLIP_EVENT);
    await expect(c.getByTestId("anchor-key")).toHaveText(/ppg/i);
    const chip = c.getByTestId("season-flip");
    await expect(chip).toHaveAttribute("title",
      /^ON THIS SEASON ALONE the GD\/g gap is −0\.25, not \+1\.37 /);
    expect(await chip.getAttribute("title")).not.toMatch(/ppg/i);
  });

test("a material SAME-SIGN difference stays data: attribute, no chip",
  async ({ page }) => {
    await openBoard(page, flippedBoard());
    const c = card(page, MATERIAL_EVENT);
    await expect(c.getByTestId("row-anchor")).toHaveAttribute("data-season-alt", "+0.40");
    await expect(c.getByTestId("season-flip")).toHaveCount(0);
  });

test("an agreeing row carries neither the attribute nor the chip",
  async ({ page }) => {
    await openBoard(page, flippedBoard());
    const c = card(page, QUIET_EVENT);
    expect(await c.getByTestId("row-anchor").getAttribute("data-season-alt")).toBeNull();
    await expect(c.getByTestId("season-flip")).toHaveCount(0);
  });

test("the recording as served draws no chip anywhere", async ({ page }) => {
  await openBoard(page, LEAGUE_RECORDED);
  await expect(page.getByTestId("season-flip")).toHaveCount(0);
});

for (const vp of [{ width: 1440, height: 1000 }, { width: 390, height: 900 }]) {
  test(`the chip sits inside its card at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp);
    await openBoard(page, flippedBoard());
    // a phone draws one league at a time: open La Liga's tab
    const tab = page.getByRole("tab", { name: /^La Liga/ });
    if (await tab.isVisible()) await tab.click();
    const c = card(page, FLIP_EVENT);
    const chip = c.getByTestId("season-flip");
    await chip.scrollIntoViewIfNeeded();
    const [cb, kb] = await Promise.all([c.boundingBox(), chip.boundingBox()]);
    expect(kb!.x).toBeGreaterThanOrEqual(cb!.x);
    expect(kb!.x + kb!.width).toBeLessThanOrEqual(cb!.x + cb!.width);
    if (process.env.SEASON_FLIP_SHOTS) {
      await c.screenshot({ path: `${process.env.SEASON_FLIP_SHOTS}/season-flip-${vp.width}.png` });
    }
  });
}

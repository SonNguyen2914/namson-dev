/** THE CUPS TAB'S CARDS SHOW THE CUP MODEL (Son, 2026-10-14: "where is
 *  the model for Cups?").
 *
 *  Every Cups-tab card's model row said "no model read" because the
 *  backend's card block never asked the cup model the cup hubs show. It
 *  does now (TRIVELA backend, `model_market` reads `match_hubs.cup_line`).
 *  This spec renders the RECORDED payload (e2e/cups-model-recorded.ts:
 *  a real in-process assembly, with production's own hub lines) through
 *  the Cups tab and pins the Leagues card format (AGENTS.md §8.5):
 *
 *    - a continental tie: the model row is the hub's numbers, one
 *      decimal, untested (dashed box) and PAPER ONLY in the hover;
 *    - a tie the cup model refuses, a cup whose pool failed and a cup in
 *      no pool: "—" in all three cells, the NO MODEL chip, and the hub's
 *      own reason in its hover. Never a sentence in place of the table.
 *  Hermetic: every board is served by page.route. */
import { expect, test, type Page } from "@playwright/test";
import { CHAMP_BOARD } from "./championships-recorded";
import { CUPS_CLOCK, cupsBoardWith, routeCups } from "./cups-board";
import { CUP_NO_MODEL_BLOCKS, CUPS_MODEL_UCL } from "./cups-model-recorded";

type Obj = Record<string, unknown>;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

const BAYERN = "401915312";       // Bayern Munich v Arsenal: a cup model read
const VILLA = "401915394";        // Aston Villa v Viking FK: cups_side_unrated

/** The recorded Cups board, its UCL rows replaced by the recorded ones and
 *  its EFL Cup row and Campeones refusal carrying the backend's own
 *  no-model blocks. */
function board(): Obj {
  return cupsBoardWith((b) => {
    const ucl = clone(CUPS_MODEL_UCL) as unknown as { rows: Obj[]; refusals: Obj[] };
    const mm = (key: keyof typeof CUP_NO_MODEL_BLOCKS) => clone(CUP_NO_MODEL_BLOCKS[key]);
    b.rows = [...(b.rows as Obj[]).filter((r) => r.league !== "ucl"), ...ucl.rows]
      .map((r) => (r.league === "eflcup" ? { ...r, model_vs_market: mm("eflcup") } : r));
    b.refusals = [...(b.refusals as Obj[]).filter((r) => r.league !== "ucl"), ...ucl.refusals]
      .map((r) => (r.league === "campeones" ? { ...r, model_vs_market: mm("campeones") } : r));
  });
}

async function openCups(page: Page) {
  await page.clock.install({ time: new Date(CUPS_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "cups"); } catch { /* none */ }
  });
  await routeCups(page, board());
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="ucl"]');
}

const card = (page: Page, id: string) => page.locator(
  `[data-testid="picker-row"][data-event="${id}"], `
  + `[data-testid="picker-refusal"][data-event="${id}"]`).first();
const title = async (p: Promise<string | null>) => (await p) ?? "";

test("a UCL card's model row is the cup hub's line: untested, paper only", async ({ page }) => {
  await openCups(page);
  const c = card(page, BAYERN);
  await c.scrollIntoViewIfNeeded();
  // production's hub line for this tie: 0.352604 · 0.241472 · 0.405923
  await expect(c.getByTestId("mm-model-h")).toHaveText("35.3%");
  await expect(c.getByTestId("mm-model-d")).toHaveText("24.1%");
  await expect(c.getByTestId("mm-model-a")).toHaveText("40.6%");
  await expect(c.getByTestId("mm-why-model")).toHaveCount(0);
  const hover = await title(c.getByTestId("mm-model-label").getAttribute("title"));
  expect(hover).toContain("unified-cups-nb-v1");
  expect(hover).toContain("untested");
  expect(hover).toContain("experimental, unproven — cups: paper only");
  // untested: the verdict box is dashed, as on every untested card
  await expect(c.getByTestId("mm-verdict")).toHaveAttribute("data-untested", "1");
});

test("no model is '—' with the NO MODEL chip and the hub's reason", async ({ page }) => {
  await openCups(page);
  const cases: Array<[string, string, string]> = [
    // the cup model's own refusal of this tie
    [VILLA, "is not rated in any of the eight unified league streams",
     "(cups_side_unrated)"],
  ];
  for (const [id, words, code] of cases) {
    const c = card(page, id);
    await c.scrollIntoViewIfNeeded();
    await expect(c.getByTestId("mm-model-empty")).toHaveText("—");
    await expect(c.getByTestId("mm-model-d-none")).toHaveText("—");
    await expect(c.getByTestId("mm-model-a-none")).toHaveText("—");
    await expect(c.getByTestId("mm-why-model")).toHaveText("NO MODEL");
    const hover = await title(c.getByTestId("mm-why-model").getAttribute("title"));
    expect(hover).toContain(words);
    expect(hover).toContain(code);
  }
  // a cup in no pool (EFL Cup): the hub's sentence, word for word
  const efl = page.locator('[data-testid="league-col"][data-league="eflcup"]')
    .locator('[data-testid="picker-row"], [data-testid="picker-refusal"]').first();
  await efl.scrollIntoViewIfNeeded();
  await expect(efl.getByTestId("mm-model-empty")).toHaveText("—");
  await expect(efl.getByTestId("mm-why-model")).toHaveText("NO MODEL");
  const eflHover = await title(efl.getByTestId("mm-why-model").getAttribute("title"));
  expect(eflHover).toContain(
    CUP_NO_MODEL_BLOCKS.eflcup.model_why_detail.replace(/\.\s*$/, ""));
  expect(eflHover).toContain("(cups_not_a_pooled_cup)");
});

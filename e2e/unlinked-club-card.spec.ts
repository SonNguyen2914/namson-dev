/** A CUP CLUB IN A LEAGUE THE CUP DOES NOT RATE ON, FILLED IN (Son,
 *  2026-10-14: "get only those teams' data and fill in the fields").
 *
 *  The backend now reads such a club's OWN domestic table and sends both
 *  clubs' figures under `sides`, each with its within-league tiers
 *  (`league_tiers`), on a refusal of reason `unlinked_league`. The card
 *  stays the Leagues card (AGENTS.md §8): the same refused card, its
 *  empty cells now carrying measured values, the tier row the ranked
 *  card's `OVR 1v4` pairs, and the shape — a reading of the DIFFERENCE —
 *  still refused.
 *
 *  Hermetic, and on RECORDED wire payloads (e2e/unlinked-clubs-recorded.ts)
 *  laid into the recorded Cups-tab board. */
import { expect, test, type Page } from "@playwright/test";
import { CHAMP_BOARD } from "./championships-recorded";
import { CUPS_CLOCK, cupsBoardWith, routeCups } from "./cups-board";
import { UNLINKED_AFTER, UNLINKED_BEFORE } from "./unlinked-clubs-recorded";

type Obj = Record<string, unknown>;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

async function openWith(page: Page, refusals: unknown[]) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.install({ time: new Date(CUPS_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "cups"); } catch { /* none */ }
  });
  const board = cupsBoardWith((b: Obj) => {
    b.refusals = [...(b.refusals as Obj[]), ...clone(refusals) as Obj[]];
  });
  await routeCups(page, board);
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}

const card = (page: Page, home: string) => page
  .locator('[data-testid="league-col"][data-league="ucl"] [data-testid="picker-refusal"]')
  .filter({ hasText: home });

test("LASK v Liverpool: both clubs' own rank, ppg, gp and tiers; shape still refused",
  async ({ page }) => {
    await openWith(page, UNLINKED_AFTER);
    const c = card(page, "LASK Linz");
    await expect(c).toHaveCount(1);
    await expect(c.getByTestId("refused-rank-pair")).toHaveText(/H #3 of 12\s*·\s*A #4 of 17/);
    await expect(c.getByTestId("refused-ppg")).toHaveText(/ppg\s*2\.00\s*\/\s*1\.55/);
    await expect(c.getByTestId("refused-gp")).toHaveText(/gp\s*8\s*\/\s*6/);
    const tiers = c.getByTestId("refused-tiers");
    await expect(tiers).toHaveAttribute("data-tiers", "own-league");
    await expect(tiers.locator('[data-tier-pair="ovr"]')).toHaveText(/ovr\s*1v1/i);
    await expect(tiers.locator('[data-tier-pair="atk"]')).toHaveText(/atk\s*1v3/i);
    await expect(tiers.locator('[data-tier-pair="def"]')).toHaveText(/def\s*1v2/i);
    await expect(tiers).toContainText(/shape\s*refused/i);
    // the league is named in words, never the provider's slug
    await expect(c.getByTestId("refused-rank-pair"))
      .toHaveAttribute("title", /Austrian Bundesliga/);
    await expect(c.getByTestId("refused-rank-pair"))
      .not.toHaveAttribute("title", /aut\.1/);
    await expect(c.getByTestId("refusal-reason")).toHaveText(/no shared ladder/i);
    // nothing on the face is left empty or says "not stated"/"no rank"
    await expect(c).not.toContainText("not stated");
    await expect(c).not.toContainText("no rank");
    // and no gap was invented: the anchor is still refused
    await expect(c.getByTestId("anchor-block")).toContainText(/refused/i);
    // the picture, for review (test-results/ is gitignored)
    await c.screenshot({ path: "test-results/shots/unlinked-lask-v-liverpool.png" });
  });

test("Shakhtar v AEK: AEK's Greek table fills the side that said 'no rank'",
  async ({ page }) => {
    await openWith(page, UNLINKED_AFTER);
    const c = card(page, "Shakhtar Donetsk");
    await expect(c.getByTestId("refused-rank-pair")).toHaveText(/H #1 of 13\s*·\s*A #2 of 14/);
    await expect(c.getByTestId("refused-ppg")).toHaveText(/ppg\s*2\.50\s*\/\s*2\.33/);
    await expect(c.getByTestId("refused-tiers").locator('[data-tier-pair="ovr"]'))
      .toHaveText(/ovr\s*1v1/i);
  });

test("the unfilled refusal is unchanged: no rank, not stated, tiers refused",
  async ({ page }) => {
    await openWith(page, UNLINKED_BEFORE);
    const c = card(page, "LASK Linz");
    await expect(c.getByTestId("refused-rank-pair")).toHaveText(/no rank v #4/);
    await expect(c.getByTestId("refused-tiers")).toHaveAttribute("data-refused", "tiers");
  });

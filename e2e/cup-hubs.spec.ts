/** A CUP MATCH HUB IS THE LEAGUE MATCH HUB (Son, 2026-10-13: "all matches
 *  should have a match hub, currently cups matches don't have it").
 *
 *  One template: a cup hub is components/MatchHub with lib/compHub.ts
 *  `cupHubCfg`, reading the generic `/api/comp/{cup}/match/{event_id}`.
 *  This spec opens the RECORDED payloads of a Champions League cross-league
 *  tie (Arsenal v Lille) and an EFL Cup cross-tier tie (Fleetwood v
 *  Arsenal) beside a recorded league hub (MLS, Red Bull NY v Charlotte),
 *  and holds the cup pages to the league page's sections, with each gap
 *  NAMED in the backend's words.
 *
 *  HERMETIC: every /api/ read is answered in the page.
 *
 *  SCREENSHOTS for review are written only when CUP_HUB_SHOTS names a
 *  directory (never in CI). */
import { test, expect, type Page } from "@playwright/test";
import {
  EFL_HUB_EVENT, EFL_HUB_PAYLOAD, UCL_HUB_EVENT, UCL_HUB_PAYLOAD,
} from "./cup-hubs-recorded";
import { MLS_HUB_EVENT, MLS_HUB_PAYLOAD } from "./mls-hub-recorded";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

type Hub = { name: string; path: string; api: string; body: unknown;
             minutesKey: string; event: string };
const UCL: Hub = { name: "ucl", path: `/bet-suggester/ucl/${UCL_HUB_EVENT}`,
  api: `/api/comp/ucl/match/${UCL_HUB_EVENT}`, body: UCL_HUB_PAYLOAD,
  minutesKey: "ucl", event: UCL_HUB_EVENT };
const EFL: Hub = { name: "eflcup", path: `/bet-suggester/eflcup/${EFL_HUB_EVENT}`,
  api: `/api/comp/eflcup/match/${EFL_HUB_EVENT}`, body: EFL_HUB_PAYLOAD,
  minutesKey: "eflcup", event: EFL_HUB_EVENT };
const MLS: Hub = { name: "league-mls", path: `/bet-suggester/mls/${MLS_HUB_EVENT}`,
  api: `/api/mls/match/${MLS_HUB_EVENT}`, body: MLS_HUB_PAYLOAD,
  minutesKey: "mls", event: MLS_HUB_EVENT };

async function open(page: Page, h: Hub) {
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/card/**", (r) => r.fulfill(json(
    { error: "no live-plane fixture in this recorded world" }, 404)));
  // the backend's own named absence for a chart with no tape
  await page.route(`**/api/minutes/${h.minutesKey}/${h.event}`, (r) => r.fulfill(json({
    available: false, competition: h.minutesKey, event_id: h.event,
    code: "no_live_plane",
    reason: "no minute-by-minute read is recorded for this competition",
    label: "shadow · not advice" })));
  await page.route(`**${h.api}`, (r) => r.fulfill(json(h.body)));
  await page.goto(h.path);
  await page.waitForSelector("#markets");
}

/** The hub's section skeleton: the nav chips and the section anchors. */
async function skeleton(page: Page) {
  const nav = await page.locator("nav a, header a").evaluateAll((as) =>
    as.map((a) => a.textContent?.trim() ?? "").filter((t) =>
      ["Markets", "Prediction", "Strategy", "Live"].includes(t)));
  const ids = await page.locator("section[id]").evaluateAll((ss) =>
    ss.map((s) => s.id));
  return { nav, ids };
}

test("a cup hub draws the league hub's sections, from the same template", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, MLS);
  const league = await skeleton(page);
  for (const h of [UCL, EFL]) {
    await open(page, h);
    const cup = await skeleton(page);
    expect(cup.nav, `${h.name}: nav`).toEqual(league.nav);
    for (const id of cup.ids) expect(league.ids, `${h.name}: #${id}`).toContain(id);
    expect(cup.ids).toContain("markets");
    // the trader's model line is on every hub, named when absent
    await expect(page.getByTestId("traders-model")).toBeVisible();
    await expect(page.getByTestId("traders-model")).toContainText("trader's model (untested)");
    // no shadow model, in the backend's words, with the board read beside it
    await expect(page.getByTestId("model-refusal")).toBeVisible();
    await expect(page.getByTestId("board-read")).toBeVisible();
    // the settlement rule: regulation time only
    await expect(page.getByTestId("settles-on")).toContainText("regulation time only");
  }
});

test("the Champions League tie carries its Kalshi book and the paper cup model's position",
  async ({ page }) => {
    await open(page, UCL);
    await expect(page.getByText("Arsenal").first()).toBeVisible();
    await expect(page.getByTestId("model-refusal")).toContainText(/PAPER ONLY/);
    await expect(page.getByTestId("traders-model")).toContainText("cups: paper only");
    await expect(page.getByTestId("model-refusal")).toHaveAttribute(
      "data-state", "cup_model_paper_only");
    await expect(page.getByTestId("families-means")).toBeVisible();
    await expect(page.getByTestId("book-meta")).toHaveCount(0);
  });

test("the EFL Cup tie names its missing book and its missing model", async ({ page }) => {
  await open(page, EFL);
  await expect(page.getByText("Fleetwood Town").first()).toBeVisible();
  await expect(page.getByTestId("model-refusal")).toHaveAttribute("data-state", "cup_not_pooled");
  await expect(page.getByTestId("model-refusal")).toContainText(/lower-division/);
  await expect(page.getByTestId("book-meta")).toBeVisible();
  await expect(page.getByTestId("traders-model-absent")).toBeVisible();
  // the Sofascore panel is hidden: no Sofascore id was supplied
  await expect(page.getByTestId("sofascore-momentum")).toHaveCount(0);
});

test("review screenshots (only when CUP_HUB_SHOTS is set)", async ({ page }) => {
  const dir = process.env.CUP_HUB_SHOTS;
  test.skip(!dir, "screenshots are for a human review, not CI");
  test.setTimeout(120_000);
  for (const [w, h] of [[1440, 900], [375, 812]] as const) {
    await page.setViewportSize({ width: w, height: h });
    for (const hub of [MLS, UCL, EFL]) {
      await open(page, hub);
      // walk the page so every Reveal section has entered the viewport
      const tall = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y <= tall; y += Math.floor(h / 2)) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${dir}/hub-${hub.name}-${w}.png`, fullPage: true });
    }
  }
});

/** A KNOCKOUT DECIDED ON PENALTIES NAMES WHO WENT THROUGH (round 3,
 *  2026-10-26). The backend has served `match.shootout` on every cup hub
 *  since 2026-09-03 (comp_match.parse_shootout) and the hub drew only the
 *  level score, so a 1-1 tie Lille won 5-4 on penalties read as a draw
 *  with no winner. The line reads the backend's derived `advanced` and
 *  never the score; with no derived winner it prints the backend's reason. */
test("a cup tie decided on penalties names the side that advanced", async ({ page }) => {
  const body = structuredClone(UCL_HUB_PAYLOAD) as typeof UCL_HUB_PAYLOAD & {
    match: Record<string, unknown> };
  const m = body.match as Record<string, any>;
  m.state = "post"; m.detail = "FT-Pens";
  m.home.score = "1"; m.away.score = "1";
  m.shootout = {
    teams: [{ team: "Arsenal", taken: 5, scored: 4 },
            { team: "Lille", taken: 5, scored: 5 }],
    advanced: "Lille", advanced_unavailable_reason: null,
  };
  await open(page, { ...UCL, body });
  await expect(page.getByTestId("shootout")).toContainText(
    "Lille advanced on penalties (Arsenal 4–5 Lille)");

  m.shootout = { ...m.shootout, advanced: null,
    advanced_unavailable_reason: "the provider did not send every kick" };
  await open(page, { ...UCL, body });
  await expect(page.getByTestId("shootout")).toContainText(
    "the provider did not send every kick");
  await expect(page.getByTestId("shootout")).not.toContainText("advanced on");
});

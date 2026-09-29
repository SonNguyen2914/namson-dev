import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { MLS_HUB_EVENT, MLS_HUB_PAYLOAD } from "./mls-hub-recorded";

// THE MATCH HUB SAYS WHAT ITS NUMBERS ARE (audit 2026-09-28, frontend
// 8e7b335 / backend e40efef1). Two labels, one rule: a number that
// reads like a measurement must say when it is not one.
//
//   1. THE SCOUTING PANEL. ESPN form and head-to-head were MEASURED
//      non-predictive, and the panel carried no word of it — while the
//      suggestion card's style notes, the same kind of context, carry
//      their finding with the numbers. The panel ships collapsed, so the
//      label has to be on the HEADER to be read at all.
//
//   2. THE RAIL'S xG. `model.primary.xg` is the simulator's Poisson
//      means (backend src/live/model_mls.py returns `out["xg"]`). Liga MX
//      said "sim xG" through a per-league switch; MLS printed plain "xG"
//      — on the one hub that ALSO shows real measured xG (official MLS
//      stats, xg/90 in the lineups). EPL and La Liga, whose own configs
//      say no xG source exists for them, printed plain "xG" too. What the
//      number is does not vary by league, so neither does the label.
//
// HERMETIC: the hub payload is a recorded production read
// (e2e/mls-hub-recorded.ts); the card fetch answers a named 404.

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

async function openHub(page: Page, body: unknown = MLS_HUB_PAYLOAD) {
  await page.route("**/api/card/**", (r) => r.fulfill(json(
    { error: "no live-plane fixture in this recorded world" }, 404)));
  await page.route(`**/api/mls/match/${MLS_HUB_EVENT}`,
    (r) => r.fulfill(json(body)));
  await page.goto(`/bet-suggester/mls/${MLS_HUB_EVENT}`);
}

const scoutingButton = (page: Page) =>
  page.getByRole("button", { name: /ESPN form \+ H2H/i });

test("the scouting header says form and H2H are display only — while the "
   + "panel is still closed", async ({ page }) => {
    const sc = MLS_HUB_PAYLOAD.match.scouting;
    expect(sc.last_five.length + sc.head_to_head.length,
      "the recording carries scouting").toBeGreaterThan(0);
    await openHub(page);
    const btn = scoutingButton(page);
    await expect(btn).toBeVisible();
    // closed: the label is already on screen, not behind the click
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    const label = page.getByTestId("scouting-display-only");
    await expect(label).toBeVisible();
    await expect(label).toHaveText("display only — measured non-predictive");
    // in the accessible name, not a hover tooltip
    await expect(btn).toHaveAccessibleName(
      /ESPN form \+ H2H display only — measured non-predictive/i);
    // opening the panel keeps it, and the panel is the scouting one
    await btn.click();
    await expect(label).toBeVisible();
    await expect(page.getByText(/recent meetings/i)).toBeVisible();
  });

test("the rail labels the simulator's xG as sim xG, with the recorded "
   + "values", async ({ page }) => {
    const { home, away } = MLS_HUB_PAYLOAD.model.primary.xg;
    const h = MLS_HUB_PAYLOAD.match.home.abbrev;
    const a = MLS_HUB_PAYLOAD.match.away.abbrev;
    await openHub(page);
    // each label on its own tile, beside the value the payload carries
    const tile = (label: string) => page.locator("div.rounded-2xl", {
      has: page.getByText(label, { exact: true }) });
    await expect(tile(`${h} sim xG`)).toHaveCount(1);
    await expect(tile(`${h} sim xG`)).toContainText(home.toFixed(2));
    await expect(tile(`${a} sim xG`)).toHaveCount(1);
    await expect(tile(`${a} sim xG`)).toContainText(away.toFixed(2));
    // the bare label — the defect — is nowhere, and neither is the share
    // line's "of xG"
    await expect(page.getByText(`${h} xG`, { exact: true })).toHaveCount(0);
    await expect(page.getByText(`${a} xG`, { exact: true })).toHaveCount(0);
    await expect(page.getByText(/% of sim xG/)).toBeVisible();
    await expect(page.getByText(/% of xG/)).toHaveCount(0);
  });

test("no league config can switch the sim qualifier off", () => {
    // A per-league switch is how three of four hubs came to print model
    // means as plain "xG". HubCfg no longer HAS the key, so a hub config
    // that sets it fails `tsc` on its own object literal; this pins the
    // component side — the qualifier is in the label unconditionally.
    const hub = readFileSync(
      join(__dirname, "..", "src", "components", "MatchHub.tsx"), "utf8");
    expect(hub).not.toMatch(/simXg/);
    expect(hub).toContain("sim xG`}");
    expect(hub).toContain("of sim xG");
  });

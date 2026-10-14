// EVERY RATING SAYS HOW CURRENT IT IS (Son, 2026-10-14: "rebuild and make
// the stats up to date constantly whenever they finish a match").
//
// The backend sends `ratings_as_of` on each field read (TRIVELA
// src/picker/display_source.as_of_block): live or frozen, and the date of
// the last finished match the ratings include. The page draws
// "as of <date> · live|frozen" under the lede of the view, with the full
// sentence (and why a frozen part is not live) on hover — and draws
// NOTHING when the block is absent: never a guessed date.
//
// HERMETIC: the three field reads are the recordings with the block
// spliced in; every other /api/ read is a named 503.
import { expect, test, type Page } from "@playwright/test";

import { CUPS, LEAGUES } from "./field-page-recorded";
import { NATIONS } from "./nations-recorded";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

const LIVE = {
  as_of: "2026-10-12", source: "live",
  parts: [{ path: "research_archive/goal_axes_every_club_2026-09-25/league_field/slices.json",
            source: "live", as_of: "2026-10-12", build_id: 7,
            as_of_match: "Arsenal 2-1 Tottenham Hotspur (epl)" }],
};
const FROZEN = {
  as_of: "2026-09-17", source: "frozen",
  parts: [{ path: "research_archive/elo_cups_union_2026-09-23/elo-secondary/resolution_ucl_field.json",
            source: "frozen", reason: "no_live_build_yet", as_of: "2026-09-17" }],
};

async function serve(page: Page, leagues: unknown, cups: unknown,
                     nations: unknown) {
  await page.route("**/api/**", (r) => r.fulfill(json({
    detail: "ratings-say-as-of answers every non-field read itself" }, 503)));
  await page.route("**/api/field/leagues", (r) => r.fulfill(json(leagues)));
  await page.route("**/api/field/cups", (r) => r.fulfill(json(cups)));
  await page.route("**/api/field/nations", (r) => r.fulfill(json(nations)));
}

test("the league view says as of which match, and that it is live", async ({ page }) => {
  await serve(page, { ...clone(LEAGUES), ratings_as_of: LIVE },
              clone(CUPS), clone(NATIONS));
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  const line = page.getByTestId("ratings-as-of");
  await expect(line).toHaveText("as of 12 Oct 2026 · live");
  await expect(line).toHaveAttribute("data-source", "live");
  await expect(line).toHaveAttribute("title",
    /last finished match they include \(Arsenal 2-1 Tottenham Hotspur \(epl\)\)/);
});

test("a frozen view says frozen, and why, on hover", async ({ page }) => {
  await serve(page, clone(LEAGUES),
              { ...clone(CUPS), ratings_as_of: FROZEN }, clone(NATIONS));
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await page.getByTestId("mode-cups").click();
  const line = page.getByTestId("ratings-as-of");
  await expect(line).toHaveText("as of 17 Sep 2026 · frozen");
  await expect(line).toHaveAttribute("title", /no live rebuild yet/);
});

test("no block, no label — never a guessed date", async ({ page }) => {
  const leagues = clone(LEAGUES) as Record<string, unknown>;
  delete leagues.ratings_as_of;
  await serve(page, leagues, clone(CUPS), clone(NATIONS));
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await expect(page.getByTestId("ratings-as-of")).toHaveCount(0);
});

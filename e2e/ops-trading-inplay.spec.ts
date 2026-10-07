import { expect, test, type Locator, type Page } from "@playwright/test";
import { hydrated } from "./operator-console";
import {
  BOOK_RECORDED, CANDIDATES_RECORDED, STATUS_RECORDED,
} from "./trading-console-recorded";
import { FOCUS_COMPETITIONS, compLabel } from "../src/lib/tradingConsole";

// WHY THE TRADER SKIPS IN PLAY, ON THE CONSOLE (2026-10-06).
//
// The diagnosis of 2026-10-06: the trader had never placed an in-play
// order, and nothing on the console said why — the status route counted
// in-play v2's skips and refusals and served only its placements and
// cancellations, and its in-play strategy label still read v1 while v2
// ran. Son's decision, "Show why it skips": the console shows the day's
// in-play skips and refusals per reason, in plain words, and every focus
// competition as an in-play row; no money effect.
//
// THE CONTRACT, as the backend track (b4-inplay-ops) serves it on the
// status route:
//
//   in_play_trading.v2.skipped_by_reason_today   {reason code: n}
//   in_play_trading.v2.refused_by_reason_today   {reason code: n}
//   in_play_trading.by_competition               {slug: {legs, skipped,
//                                                  refused, placed}}
//   in_play_trading.strategy                     the in-play strategy
//                                                  that runs
//
// What it promises, each claim checked here:
//
//   - a reason is drawn in the BACKEND'S plain words (its
//     src/trading/console.py PLAIN registry, mirrored), largest first,
//     with its code beside it; a code no registry names is drawn as
//     itself and said to have no words — never a blank, never a guess;
//   - every one of the eleven focus competitions is a row, derived from
//     the registry (FOCUS_COMPETITIONS), never typed here;
//   - MISSING IS NOT ZERO: a backend that predates these fields (the
//     RECORDED status, e2e/trading-console-recorded.ts, served as sent)
//     reads "not served yet" in every place, and no cell reads 0; a
//     served 0 reads 0, and a served empty map reads "none today";
//   - the strategy label is the one that RAN: a backend that labels
//     in-play trading v1 while its v2 block says the newest in-play tick
//     ran v2 is drawn as v2, and the lag is said.
//
// Fully mocked with page.route; no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const TOKEN = "ops-inplay-token-typed-by-a-person";

type Obj = Record<string, unknown>;

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const RECORDED_IP = STATUS_RECORDED.in_play_trading as Obj;
const RECORDED_V2 = RECORDED_IP.v2 as Obj;

/** The eleven, from the registry; the counts are made up per slug. */
const SERVED_BY_COMP: Record<string, Obj> = Object.fromEntries(
  FOCUS_COMPETITIONS.map((c, i) => [c, { legs: i, skipped: 3 * i,
    refused: i % 3, placed: 0 }]));
SERVED_BY_COMP.bundesliga = { legs: 3, skipped: 41, refused: 2, placed: 1 };

/** The recorded status with the in-play block replaced. */
function withInPlay(ip: Obj): Obj {
  return { ...STATUS_RECORDED, in_play_trading: ip };
}

/** The status as the backend track serves it. */
const SERVED = withInPlay({
  ...RECORDED_IP,
  strategy: "inplay-maker-v2",
  by_competition: SERVED_BY_COMP,
  v2: {
    ...RECORDED_V2,
    skipped_by_reason_today: {
      inplay_cooldown: 12,
      inplay_live_signals_unreadable: 37,
      inplay_too_late: 4,
      inplay_brand_new_code: 1,
    },
    refused_by_reason_today: {
      inplay_edge_below_min: 1,
      per_match_cap: 2,
    },
  },
});

async function openConsole(page: Page, status: unknown) {
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, BOOK_RECORDED)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, CANDIDATES_RECORDED)));
  await page.goto("/ops/trading#trading?tab=inplay");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-inplay")).toBeVisible();
}

const reasonRows = (table: Locator) => table.getByTestId("inplay-reason-row");
const compRows = (page: Page) => page.getByTestId("inplay-comp-row");
const compRow = (page: Page, comp: string) =>
  page.locator(`[data-testid="inplay-comp-row"][data-comp="${comp}"]`);

test.describe("the console says why the trader skips in play", () => {
  test("the registry names eleven focus competitions", () => {
    // the competition set every per-competition claim below runs over
    expect(FOCUS_COMPETITIONS).toHaveLength(11);
    expect(new Set(FOCUS_COMPETITIONS).size).toBe(11);
  });

  test("the day's in-play skips are drawn per reason, in the backend's "
    + "plain words, largest first", async ({ page }) => {
      await openConsole(page, SERVED);
      const skips = page.getByTestId("inplay-skips");
      await expect(reasonRows(skips)).toHaveCount(4);
      const codes = await reasonRows(skips).evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-code")));
      expect(codes).toEqual(["inplay_live_signals_unreadable",
        "inplay_cooldown", "inplay_too_late", "inplay_brand_new_code"]);
      // the backend's PLAIN words, verbatim (src/trading/console.py)
      const first = reasonRows(skips).first();
      await expect(first).toContainText(
        "Live stats (momentum, last-15 xG, ratings) are missing or old.");
      await expect(first).toContainText("inplay_live_signals_unreadable");
      await expect(first.getByTestId("inplay-reason-count")).toHaveText("37");
      await expect(reasonRows(skips).nth(1)).toContainText(
        "A shock cool-down holds (a price jump, a goal, a red card).");
      await expect(reasonRows(skips).nth(2)).toContainText(
        "Too late in the match for a new in-play order.");
      // a code no registry names: itself, and said to have no words
      await expect(reasonRows(skips).nth(3)).toContainText(
        "inplay_brand_new_code");
      await expect(reasonRows(skips).nth(3)).toContainText(
        "no plain words for this code yet");
    });

  test("the day's in-play refusals are drawn per reason, in plain words",
    async ({ page }) => {
      await openConsole(page, SERVED);
      const refused = page.getByTestId("inplay-refusals");
      await expect(reasonRows(refused)).toHaveCount(2);
      const first = reasonRows(refused).first();
      await expect(first).toHaveAttribute("data-code", "per_match_cap");
      await expect(first).toContainText("$10 per-match cap");
      await expect(first.getByTestId("inplay-reason-count")).toHaveText("2");
      await expect(reasonRows(refused).nth(1)).toContainText(
        "under the in-play minimum edge");
      // the risk engine's code, not a word from nowhere
      await expect(reasonRows(refused).nth(1)).toContainText(
        "inplay_edge_below_min");
    });

  test("the backend's own words win when it sends them", async ({ page }) => {
    await openConsole(page, withInPlay({
      ...RECORDED_IP,
      v2: { ...RECORDED_V2,
        skipped_by_reason_today: {
          inplay_cooldown: { count: 5, words: "The backend's own sentence." },
        },
        refused_by_reason_today: {} },
    }));
    const row = reasonRows(page.getByTestId("inplay-skips")).first();
    await expect(row).toContainText("The backend's own sentence.");
    await expect(row).not.toContainText("A shock cool-down holds");
    await expect(row.getByTestId("inplay-reason-count")).toHaveText("5");
    // served and empty: none today — a real answer, said as one
    await expect(page.getByTestId("inplay-refusals")).toHaveText(
      "no in-play refusals recorded today");
  });

  test("every focus competition is an in-play row, in the registry's "
    + "order, with its counts", async ({ page }) => {
      await openConsole(page, SERVED);
      await expect(compRows(page)).toHaveCount(FOCUS_COMPETITIONS.length);
      const comps = await compRows(page).evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-comp")));
      expect(comps).toEqual([...FOCUS_COMPETITIONS]);
      for (const c of FOCUS_COMPETITIONS) {
        await expect(compRow(page, c).locator("td").first())
          .toHaveText(compLabel(c));
      }
      await expect(compRow(page, "bundesliga").locator("td"))
        .toHaveText([compLabel("bundesliga"), "3", "41", "2", "1"]);
      // a served zero is a zero
      const epl = FOCUS_COMPETITIONS.indexOf("epl");
      await expect(compRow(page, "epl").locator("td")).toHaveText(
        [compLabel("epl"), String(epl), String(3 * epl), String(epl % 3), "0"]);
    });

  test("a competition the backend left out, or a count it did not send, "
    + "is not served — not 0", async ({ page }) => {
      const partial = { ...SERVED_BY_COMP,
        bundesliga: { legs: 3, skipped: 41, refused: 2 } };
      delete (partial as Record<string, unknown>).afcon;
      await openConsole(page, withInPlay({
        ...(SERVED.in_play_trading as Obj), by_competition: partial }));
      await expect(compRows(page)).toHaveCount(FOCUS_COMPETITIONS.length);
      await expect(compRow(page, "afcon").locator("td"))
        .toHaveText([compLabel("afcon"), "not served yet"]);
      await expect(compRow(page, "bundesliga").locator("td"))
        .toHaveText([compLabel("bundesliga"), "3", "41", "2", "not served yet"]);
    });

  test("a backend before these fields says 'not served yet', never zero",
    async ({ page }) => {
      // THE RECORDED STATUS, AS SENT: no skipped/refused maps, no
      // per-competition block
      expect("skipped_by_reason_today" in RECORDED_V2).toBe(false);
      expect("by_competition" in RECORDED_IP).toBe(false);
      await openConsole(page, STATUS_RECORDED);
      await expect(page.getByTestId("inplay-skips")).toContainText("not served yet");
      await expect(page.getByTestId("inplay-refusals")).toContainText("not served yet");
      await expect(reasonRows(page.getByTestId("ops-inplay"))).toHaveCount(0);
      // every competition is still a row, and none reads 0
      await expect(compRows(page)).toHaveCount(FOCUS_COMPETITIONS.length);
      for (const c of FOCUS_COMPETITIONS) {
        await expect(compRow(page, c).locator("td"))
          .toHaveText([compLabel(c), "not served yet"]);
      }
      const cells = await page.getByTestId("inplay-by-comp").locator("td")
        .allTextContents();
      expect(cells).toHaveLength(2 * FOCUS_COMPETITIONS.length);
      expect(cells.filter((c) => /^\s*0\s*$/.test(c))).toEqual([]);
    });

  test("an in-play v2 block that failed on the backend is said as a "
    + "failure, not as none", async ({ page }) => {
      await openConsole(page, withInPlay({
        ...RECORDED_IP, v2: { error: "OperationalError" } }));
      for (const id of ["inplay-skips", "inplay-refusals"]) {
        await expect(page.getByTestId(id)).toContainText("not served");
        await expect(page.getByTestId(id)).toContainText("failed on the backend");
        await expect(page.getByTestId(id)).not.toContainText("none");
      }
    });

  test("the strategy label is the one that ran", async ({ page }) => {
    // the recorded backend: labelled v1 while its newest tick ran v2
    expect(RECORDED_IP.strategy).toBe("inplay-maker-v1");
    expect(RECORDED_V2.active).toBe(true);
    await openConsole(page, STATUS_RECORDED);
    await expect(page.getByTestId("inplay-strategy")).toHaveText("inplay-maker-v2");
    await expect(page.getByTestId("inplay-strategy-note"))
      .toContainText("inplay-maker-v1");
  });

  test("a corrected label is drawn as sent, with no note", async ({ page }) => {
    await openConsole(page, SERVED);
    await expect(page.getByTestId("inplay-strategy")).toHaveText("inplay-maker-v2");
    await expect(page.getByTestId("inplay-strategy-note")).toHaveCount(0);
  });

  test("v1 alone is drawn as v1, and an absent label is not served",
    async ({ page }) => {
      const { v2: _v2, ...v1only } = RECORDED_IP;
      void _v2;
      await openConsole(page, withInPlay(v1only));
      await expect(page.getByTestId("inplay-strategy")).toHaveText("inplay-maker-v1");
      await expect(page.getByTestId("inplay-strategy-note")).toHaveCount(0);
      // no v2 block at all: its maps are not served
      await expect(page.getByTestId("inplay-skips")).toContainText("not served yet");

      const { strategy: _s, ...unlabelled } = v1only;
      void _s;
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await openConsole(page, withInPlay(unlabelled));
      await expect(page.getByTestId("inplay-strategy")).toHaveText("not served yet");
    });
});

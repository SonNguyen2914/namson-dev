/** THE RETURN DATE IS THE DAY OF A LISTED MATCH (Son, 2026-10-13).
 *
 *  "for any competition, check the exact date the nearest match will be
 *  on, then show that return date". Every off-season competition names
 *  the exact day of its next SCHEDULED match — the backend's
 *  `leagues[slug].next_match`, a kickoff ESPN or API-Football lists
 *  (TRIVELA src/picker/next_match.py) — in America/Los_Angeles, with the
 *  year only when it is not this year; or "date not announced" when no
 *  source lists one. Never a month, never "next season". The in-season
 *  rest-day card reads the same answer.
 *
 *  Every board here is e2e/return-dates-recorded.ts: the backend's own
 *  in-process assembly of all 22 cups, the declared Leagues board and the
 *  Nations board on 2026-10-13, untouched apart from trimming. */
import { test, expect, type Page } from "@playwright/test";
import {
  RETURN_CLOCK, RETURN_CUPS_BOARD, RETURN_CUPS_REVIEW, RETURN_LEAGUES_BOARD,
  RETURN_LEAGUES_REVIEW, RETURN_NATIONS_BOARD,
} from "./return-dates-recorded";

type Obj = Record<string, unknown>;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

async function open(page: Page, mode: string) {
  await page.clock.install({ time: new Date(RETURN_CLOCK) });
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
  await page.route("**/api/picker/board**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? RETURN_CUPS_BOARD : RETURN_LEAGUES_BOARD));
  });
  await page.route("**/api/picker/review**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? RETURN_CUPS_REVIEW : RETURN_LEAGUES_REVIEW));
  });
  await page.route("**/api/championships/**",
    (r) => r.fulfill(json(RETURN_NATIONS_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}

const col = (page: Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);
const restOf = (page: Page, slug: string) =>
  col(page, slug).locator('[data-testid="rest-day"]:visible');

/** The backend's own answer for a slug, read off the recording — so the
 *  page is checked against what the backend said, not against a copy. */
function nextMatch(board: unknown, slug: string): Obj | undefined {
  const b = board as Obj;
  for (const k of ["leagues", "folded"]) {
    const m = (b[k] as Record<string, Obj> | undefined)?.[slug];
    if (m?.next_match) return m.next_match as Obj;
  }
  return undefined;
}

test.describe("return dates on the recorded 2026-10-13 boards", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("the recording carries the backend's answer for every competition "
    + "with nothing in the window", () => {
    const listed: Record<string, [string, string]> = {
      supercopa: ["2027-02-02T19:00Z", "espn_scoreboard_year"],
      supercoppa: ["2026-12-22T20:00Z", "espn_scoreboard_year"],
      facup: ["2026-10-17T14:00Z", "apifootball_fixtures_next"],
      eflcup: ["2026-10-27T19:45Z", "espn_scoreboard_year"],
      copadelrey: ["2026-10-27T17:30Z", "apifootball_fixtures_next"],
      dfbpokal: ["2026-10-27T17:00Z", "espn_scoreboard_year"],
      coppaitalia: ["2026-12-01T20:00Z", "espn_scoreboard_year"],
      knvbbeker: ["2026-10-27T17:45Z", "espn_scoreboard_year"],
      usopencup: ["2026-10-22T00:00Z", "espn_scoreboard_year"],
    };
    for (const [slug, [kickoff, source]] of Object.entries(listed)) {
      const n = nextMatch(RETURN_CUPS_BOARD, slug);
      expect(n?.kickoff, slug).toBe(kickoff);
      expect(n?.source, slug).toBe(source);
    }
    for (const slug of ["concacafcc", "leaguescup", "campeones", "uefasuper",
      "communityshield", "dflsupercup", "tropheechampions", "johancruijff",
      "campeondecampeones", "coupedefrance"]) {
      const n = nextMatch(RETURN_CUPS_BOARD, slug);
      expect(n, slug).toBeTruthy();
      expect(n!.kickoff, slug).toBeNull();
      expect(String(n!.reason), slug).toMatch(/ESPN lists no scheduled match/);
    }
    const afcon = nextMatch(RETURN_NATIONS_BOARD, "afcon");
    expect([afcon?.kickoff, afcon?.source])
      .toEqual(["2026-11-11T17:00Z", "apifootball_fixtures_next"]);
  });

  test("Cups: every off-season cup names the exact day, or 'date not "
    + "announced' — never a month, never 'next season'", async ({ page }) => {
    await open(page, "cups");
    const line = page.getByTestId("off-season-line");
    await expect(line).toHaveText([
      "Off season",
      "Concacaf Champions Cup — date not announced",
      "Leagues Cup — date not announced",
      "Campeones Cup — date not announced",
      "UEFA Super Cup — date not announced",
      "FA Community Shield — date not announced",
      "Supercopa de España returns Tue Feb 2, 2027",
      "DFL-Supercup — date not announced",
      "Supercoppa Italiana returns Tue Dec 22",
      "Trophée des Champions — date not announced",
      "Johan Cruijff Schaal — date not announced",
      "Campeón de Campeones — date not announced",
      // API-Football's FA Cup fixture: the fourth qualifying round
      "FA Cup returns Sat Oct 17",
      "Coupe de France — date not announced",
    ].join(" · "));
    await expect(line).not.toContainText(/next season|returns [A-Z][a-z]{2} 20\d\d/);
    // the hover says which match and which source, or why none
    await expect(line.locator('[data-slug="facup"]')).toHaveAttribute("title",
      "AFC Rushden & Diamonds v Morecambe · 4th Round Qualifying — listed by "
      + "API-Football's schedule");
    await expect(line.locator('[data-slug="communityshield"]')).toHaveAttribute(
      "title", /^No source lists a next match: ESPN lists no scheduled match in 2026 or 2027; API-Football league 528 lists no next fixture$/);
  });

  test("Cups: an in-season cup's rest-day card is its real next fixture",
    async ({ page }) => {
      await open(page, "cups");
      const want: Record<string, RegExp> = {
        eflcup: /next · tuesday, oct 27$/,
        copadelrey: /next · tuesday, oct 27$/,     // API-Football's R128
        dfbpokal: /next · tuesday, oct 27$/,
        coppaitalia: /next · tuesday, dec 1$/,
        knvbbeker: /next · tuesday, oct 27$/,
        // 00:00Z on Oct 22 is the evening of Wed Oct 21 in Los Angeles
        usopencup: /next · wednesday, oct 21$/,
      };
      for (const [slug, re] of Object.entries(want)) {
        await expect(restOf(page, slug).last(), slug).toHaveText(re);
      }
    });

  test("Nations: the off-season line and the rest-day card read the same "
    + "answer", async ({ page }) => {
    await open(page, "nations");
    await expect(page.getByTestId("off-season-line"))
      .toHaveText("Off season · UEFA Nations League returns Thu Nov 12");
    // AFCON's qualifiers: ESPN lists nothing ahead, API-Football does
    await expect(restOf(page, "afcon").last()).toHaveText(/next · wednesday, nov 11$/);
    await expect(restOf(page, "cnl").last()).toHaveText(/next · thursday, nov 12$/);
  });

  test("Leagues: every league plays in the window, so nothing is folded and "
    + "nothing was looked up", async ({ page }) => {
    await open(page, "leagues");
    await expect(page.getByTestId("off-season-line")).toHaveCount(0);
    for (const slug of ["epl", "laliga", "bundesliga", "seriea", "ligue1",
      "eredivisie", "mls", "ligamx"]) {
      expect(nextMatch(RETURN_LEAGUES_BOARD, slug), slug).toBeUndefined();
    }
  });
});

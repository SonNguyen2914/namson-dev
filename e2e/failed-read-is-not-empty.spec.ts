import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

// A FAILED READ MUST NOT RENDER AS AN EMPTY ONE (2026-09-06).
//
// The shape, stated once. A fetch rejects; the catch swallows it; the
// state stays at whatever it was initialised to; and the surface draws
// the branch that initial value means. On these five surfaces that
// branch was one of two lies:
//
//   - "loading …", for ever, on four league hubs whose reads all ended
//     in `.catch(() => {})` over a state initialised to `null`;
//   - "there is nothing", on LiveScoreboard — whose worst instance was
//     the live-signal poll, where an operator reads "no signals" when
//     the truth is "we could not ask", and on the two hub maps (`odds`,
//     `maps`, `xg`) where an empty `{}` renders per fixture as "no
//     shadow run exists" / "no book matched" / "no xG form". Those are
//     claims about a model, about Kalshi and about the clubs, made off
//     a read that never landed.
//
// The move already existed in this codebase, in LaligaDashboard.tsx's
// `settle()`: "Loading, failed and empty are three different facts.
// Collapsing them is how a dead backend renders as 'no fixtures
// today'." Same three-state type, now on all five.
//
// WHAT THESE TESTS HOLD, AND WHY THEY ARE WRITTEN THIS WAY. Each pair
// serves the SAME surface twice — once with a 503 and once with a
// well-formed empty answer — and asserts that the two do not render the
// same words. A test that only pinned the failure copy would stay green
// against a surface that printed it for an empty answer too, which is
// the same collapse pointing the other way.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
type Page = import("@playwright/test").Page;

/** Every read a hub makes, answered — then the named ones broken.
 *  Registered in order: Playwright matches most-recently-added first,
 *  so `dead` wins over the healthy default for the paths it names. */
async function hub(page: Page, league: string, dead: string[] = []) {
  const ok: Record<string, unknown> = {
    scoreboard: { fixtures: [] },
    "schedule**": { fixtures: [] },
    standings: { tables: [], conferences: [] },
    markets: { games: [] },
    odds: { odds: [] },
    status: {},
    "markets/discovery": {},
  };
  for (const [path, body] of Object.entries(ok)) {
    await page.route(`**/api/${league}/${path}`, (r) => r.fulfill(json(body)));
  }
  for (const path of dead) {
    await page.route(`**/api/${league}/${path}`,
      (r) => r.fulfill(json({ error: "upstream is down" }, 503)));
  }
}

/** The whole rendered hub as one flattened string. These surfaces print
 *  their states as prose in `Empty` blocks, so the assertion is on the
 *  words a reader actually gets. */
async function words(page: Page): Promise<string> {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

// ------------------------------------------------------- the four hubs
//
// DERIVED FROM THE REGISTRY, NOT TYPED (2026-09-07).
//
// This list used to be three literals: mls, epl, ligamx. There were
// four built hubs. La Liga was the one hand-typed out — and La Liga was
// also the one hub whose odds map was still a bare `{}` initialised in
// `useState`, i.e. the one hub still carrying the exact defect these
// tests exist to pin. A guard that names a rule and then enumerates a
// subset stays green while the omitted case drifts; this repo has paid
// for that sentence before, on a test called "both planes" that listed
// two of three.
//
// So the set is read out of the shipping registry — `BUILT_LEAGUES` in
// leagues.tsx, which is the same set the page dispatches a dashboard
// from, kept beside that dispatch precisely so the two cannot drift.
// A league added there is covered here on the next run, or this file
// fails loudly rather than quietly skipping it.
const BUILT_LEAGUES: string[] = (() => {
  const src = readFileSync(
    join(__dirname, "..", "src", "pages", "bet-suggester", "leagues.tsx"),
    "utf8");
  const m = src.match(/const BUILT_LEAGUES = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) {
    throw new Error(
      "leagues.tsx no longer declares `const BUILT_LEAGUES = new Set([...])`. "
      + "This spec derives its hub list from that registry on purpose. Point "
      + "it at the new registry — do not re-type the league ids here.");
  }
  const ids = [...m[1].matchAll(/"([a-z0-9_-]+)"/g)].map((x) => x[1]);
  if (ids.length === 0) {
    throw new Error("BUILT_LEAGUES parsed to an empty set — a guard over an "
                    + "empty set is not a guard.");
  }
  return ids;
})();

const HUBS: { league: string; url: string; name: string }[] =
  BUILT_LEAGUES.map((league) => ({
    league, url: `/bet-suggester?league=${league}`, name: league,
  }));

for (const h of HUBS) {
  test(`${h.name}: a dead fixture feed says so — it does not load for ever`,
    async ({ page }) => {
      await hub(page, h.league, ["scoreboard"]);
      await page.goto(h.url);
      // THE NON-VACUITY HALF: the same surface, served a well-formed
      // EMPTY answer, must say something different. Read it first so
      // the comparison is against a real render rather than a guess.
      await expect
        .poll(async () => (await words(page)).includes("UNAVAILABLE"),
              { timeout: 10000 }).toBe(true);
      const dead = await words(page);
      expect(dead).not.toContain("LOADING FIXTURES");
    });

  // A GATE THAT WAITS FOR PROSE IS NOT WAITING FOR THE READ (2026-09-07).
  //
  // Both tests below opened with `toContainText(/no .* fixtures/i)` as
  // their readiness gate. On the La Liga hub `.*` bridges two unrelated
  // sentences — "**No** odds render until an approval is earned through
  // the evaluation ladder on real 2026-27 results. **FIXTURES** · LIVE
  // DATA" satisfies it on the very first paint, while all six reads are
  // still in flight. The test then walked on against a page that said
  // LOADING FIXTURES and failed the assertion it exists to make,
  // whenever the hub happened to be slow. That is the "single failure,
  // a different spec on each run" this suite has been living with, and
  // it was a gate matching text that is not the fact it waits for.
  //
  // The gate is now the loading state being GONE, which is the fact the
  // rest of the test needs, and the empty sentence is matched with a
  // class that cannot cross a sentence boundary.
  const settled = async (page: Page) => {
    await expect
      .poll(async () => (await words(page)).includes("LOADING FIXTURES"),
            { timeout: 10000 }).toBe(false);
  };
  // …AND SCOPED TO THE SECTION UNDER TEST. `/no .* fixtures/i` over the
  // whole body is satisfied by the SEVEN-DAY section's own empty line
  // ("no fixtures inside seven days"), so a today's-slate section that
  // said nothing at all would still pass. The assertion is made against
  // the slate section itself, found by its own heading.
  const slate = (page: Page) => page.locator("section").filter({
    has: page.getByRole("heading", { name: /Today's slate|Next matchday/ }),
  });
  const NO_FIXTURES = /\bno [a-z ]{0,40}fixtures\b/i;

  test(`${h.name}: an EMPTY fixture feed does not borrow the failure's words`,
    async ({ page }) => {
      await hub(page, h.league);
      await page.goto(h.url);
      await settled(page);
      const empty = await words(page);
      expect((await slate(page).first().innerText()).replace(/\s+/g, " "))
        .toMatch(NO_FIXTURES);
      expect(empty).not.toContain("UNAVAILABLE — RETRYING");
      expect(empty).not.toContain("LOADING FIXTURES");
    });

  test(`${h.name}: a dead shadow-odds read is named, not drawn as "no run"`,
    async ({ page }) => {
      // The map is the defect: `{}` per fixture reads as "this fixture
      // has no completed prediction run", which is a claim about the
      // model made off a read that never happened.
      await hub(page, h.league, ["odds"]);
      await page.goto(h.url);
      await expect
        .poll(async () => (await words(page)).includes("SHADOW-ODDS READ FAILED"),
              { timeout: 10000 }).toBe(true);
    });

  test(`${h.name}: a healthy odds read prints no failure line`,
    async ({ page }) => {
      await hub(page, h.league);
      await page.goto(h.url);
      await settled(page);
      expect((await slate(page).first().innerText()).replace(/\s+/g, " "))
        .toMatch(NO_FIXTURES);
      expect(await words(page)).not.toContain("SHADOW-ODDS READ FAILED");
    });

  test(`${h.name}: a dead standings feed is not "no standings"`,
    async ({ page }) => {
      await hub(page, h.league, ["standings"]);
      await page.goto(h.url);
      await expect
        .poll(async () => /STANDINGS FEED UNAVAILABLE/.test(await words(page)),
              { timeout: 10000 }).toBe(true);
    });
}

// ------------------------------------------------------ the friendlies

async function friendlies(page: Page, dead: string[] = []) {
  await page.route("**/api/friendlies/scoreboard",
    (r) => r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/friendlies/schedule**",
    (r) => r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/friendlies/markets",
    (r) => r.fulfill(json({ fixtures: [], listed: null })));
  await page.route("**/api/xg/friendlies**",
    (r) => r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/hunter/findings",
    (r) => r.fulfill(json({ findings: [] })));
  for (const path of dead) {
    await page.route(`**${path}`,
      (r) => r.fulfill(json({ error: "upstream is down" }, 503)));
  }
}

test("friendlies: a dead market read is named — the cards do not read as "
   + "'no book matched'", async ({ page }) => {
    await friendlies(page, ["/api/friendlies/markets"]);
    await page.goto("/bet-suggester/friendlies");
    await expect
      .poll(async () => (await words(page)).includes("KALSHI MARKET READ FAILED"),
            { timeout: 10000 }).toBe(true);
  });

test("friendlies: a dead xG read is named — the cards do not read as "
   + "'no xG form'", async ({ page }) => {
    await friendlies(page, ["/api/xg/friendlies**"]);
    await page.goto("/bet-suggester/friendlies");
    await expect
      .poll(async () => (await words(page)).includes("XG FORM READ FAILED"),
            { timeout: 10000 }).toBe(true);
  });

test("friendlies: healthy reads print no failure line at all",
  async ({ page }) => {
    await friendlies(page);
    await page.goto("/bet-suggester/friendlies");
    await expect(page.locator("body"))
      .toContainText(/no club friendlies/i);
    const w = await words(page);
    expect(w).not.toContain("READ FAILED");
    expect(w).not.toContain("LOADING SCHEDULE");
  });

// --------------------------------------------------- the live scoreboard

// FIXTURES SPEAK THE PROVIDER'S VOCABULARY, NOT THE CODE'S. `red_home`
// was `false` here — the shape `LiveScoreEntry` declares. The backend
// has never sent a boolean: the value comes off
// `MatchLiveSnapshot.red_home` / `MatchResult.red_home`, both
// `Column(Integer, default=0)`, counted up by `src/live_feed.py`
// (`red_home += 1`) and handed out unchanged by
// `live_state.scoreboard_entries()`. The hand-written boolean was
// certifying the stale type. Integers now, and
// `missing-is-not-zero.spec.ts` pins what the render does with them.
const LIVE_MATCH = {
  match_id: "m1", home: "Spain", away: "France",
  home_goals: 2, away_goals: 1, minutes_elapsed: 65,
  status_short: "2H", red_home: 0, red_away: 0,
  goals_list: [], is_finished: false,
};

const SB = "**/api/bet-suggester/live-scores";

test("the live scoreboard says a failed read failed — a blank section is "
   + "read as 'nothing is live' and this one had no evidence for that",
  async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ error: "feed off" }, 503)));
    await page.goto("/bet-suggester/wc26");
    const notice = page.getByTestId("live-scores-failed");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("could not ask");
  });

test("an EMPTY live-score read renders nothing — the section still keeps "
   + "the board clear pre-match", async ({ page }) => {
    // The other half. If the failure notice fired here too it would be
    // the same collapse pointing the other way.
    const answered = page.waitForResponse((r) => r.url().includes("live-scores"));
    await page.route(SB, (r) => r.fulfill(json({ live: [] })));
    await page.goto("/bet-suggester/wc26");
    await answered;
    await page.waitForTimeout(500);
    await expect(page.getByTestId("live-scores-failed")).toHaveCount(0);
  });

test("a failed live-SIGNAL read is named on the card — the worst of the "
   + "five, because 'no signals' is what an operator reads",
  async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [LIVE_MATCH] })));
    for (const p of ["**/api/bet-suggester/live-signals**",
                     "**/api/bet-suggester/live-auto/**",
                     "**/api/bet-suggester/live-stats/**",
                     "**/api/bet-suggester/team-news/**"]) {
      await page.route(p, (r) => r.fulfill(json({ error: "down" }, 503)));
    }
    await page.goto("/bet-suggester/wc26");
    const sig = page.getByTestId("live-signals-failed");
    await expect(sig).toBeVisible();
    await expect(sig).toContainText("we could not ask");
    // and all four reads are named, not just the one that was noticed
    for (const id of ["live-auto-failed", "live-stats-failed",
                      "live-news-failed", "live-signals-failed"]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
  });

test("a read that ANSWERED and said it has nothing for this match is a "
   + "different sentence from one that failed", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [LIVE_MATCH] })));
    await page.route("**/api/bet-suggester/live-auto/**", (r) => r.fulfill(
      json({ match_id: "m1", available: false,
             reason: "no completed run for this fixture" })));
    await page.route("**/api/bet-suggester/live-stats/**", (r) => r.fulfill(
      json({ match_id: "m1", home_team: "Spain", away_team: "France",
             available: false, rows: [] })));
    await page.route("**/api/bet-suggester/live-signals**",
      (r) => r.fulfill(json({ signals: [] })));
    await page.route("**/api/bet-suggester/team-news/**",
      (r) => r.fulfill(json({ error: "down" }, 503)));
    await page.goto("/bet-suggester/wc26");
    const un = page.getByTestId("live-auto-unavailable");
    await expect(un).toBeVisible();
    await expect(un).toContainText("no completed run for this fixture");
    await expect(page.getByTestId("live-stats-unavailable")).toBeVisible();
    // the reads that ANSWERED carry no failure line…
    await expect(page.getByTestId("live-auto-failed")).toHaveCount(0);
    await expect(page.getByTestId("live-stats-failed")).toHaveCount(0);
    await expect(page.getByTestId("live-signals-failed")).toHaveCount(0);
    // …and the one that did not, does
    await expect(page.getByTestId("live-news-failed")).toBeVisible();
  });

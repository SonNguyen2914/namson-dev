import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

// MISSING IS NOT ZERO, A FAILED READ IS NOT AN EMPTY ONE, AND A CAVEAT
// ON A `title=` IS NOT IN THE ACCESSIBLE TREE — round five (2026-09-07).
//
// Four rounds each fixed the site they were handed and the same shape
// stood one function over. This file is written to the rule that came
// out of that: either the thing is impossible by absence or by
// construction, or it is REGISTERED with the condition that closes it —
// and the guard fails BOTH if a new hole appears unregistered AND if a
// registered one is closed without retiring its record.
//
// Three shapes are pinned here, each with its non-vacuity half — the
// same surface served the OTHER fact, asserted not to render the same
// words. A test that only pinned the failure copy would stay green
// against a surface that printed it for a measured value too, which is
// the same collapse pointing the other way.
//
//   1. THE BRACKET. `.catch(() => {})` over `useState(null)` and then
//      `if (!b || b.quarterfinals.length === 0) return null` on the very
//      next line: a 503 and "the knockout draw has not been made" were
//      the identical vanished section.
//   2. THE TOURNAMENT. `setT(null)` on every non-200, and the header
//      says the 404 is the feature switch — so a 500 borrowed the
//      switch and rendered as "this competition has no tournament".
//   3. THE LIVE STAT BARS. `parseFloat(r.home) || 0` then
//      `tot > 0 ? h/tot : 50`: a value the feed never sent drew a
//      perfect half-and-half bar, a measured dead heat off nothing.
//
// Plus the stale type behind the red-card marker, and the source-derived
// registry guard at the foot of the file.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
type Page = import("@playwright/test").Page;

const words = async (page: Page): Promise<string> =>
  (await page.locator("body").innerText()).replace(/\s+/g, " ");

// --------------------------------------------------------- the bracket

const BRACKET_URL = "**/api/bet-suggester/bracket";

/** A bracket whose quarter-finals exist — the state in which the
 *  component draws a road. Minimal, and every field it reads is here. */
const A_DRAWN_BRACKET = {
  champion: null,
  champion_forecast: null,
  round_of_16: [],
  quarterfinals: [{
    match_id: "QF1", home: "Spain", away: "France",
    home_resolved: true, away_resolved: true, fully_resolved: true,
    kickoff: "2030-07-01T18:00:00+00:00", venue: "MetLife", stage: "QF",
    probs: { home_win: 0.52, draw: 0.24, away_win: 0.24 },
    result: null, forecast: null,
  }],
  semifinals: [], third_place: [], final: [],
};

test("the bracket says a failed read failed — a vanished section is read "
   + "as 'there is no bracket' and this one had no evidence for that",
  async ({ page }) => {
    await page.route(BRACKET_URL,
      (r) => r.fulfill(json({ error: "bracket build failed" }, 503)));
    await page.goto("/bet-suggester/wc26");
    const notice = page.getByTestId("bracket-read-failed");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("could not ask");
  });

test("a bracket that ANSWERED with no quarter-finals renders nothing — the "
   + "draw is not made, and that is a fact the backend supplied",
  async ({ page }) => {
    // The non-vacuity half. If the failure notice fired here too it
    // would be the same collapse pointing the other way.
    const answered = page.waitForResponse((r) => r.url().includes("/bracket"));
    await page.route(BRACKET_URL, (r) => r.fulfill(json({
      ...A_DRAWN_BRACKET, quarterfinals: [],
    })));
    await page.goto("/bet-suggester/wc26");
    await answered;
    await page.waitForTimeout(500);
    await expect(page.getByTestId("bracket-read-failed")).toHaveCount(0);
    expect(await words(page)).not.toContain("could not ask");
  });

test("a bracket that answered and then stopped answering keeps the road and "
   + "says the read behind it is the earlier one", async ({ page }) => {
    // THE POLL IS SIXTY SECONDS AND THIS TEST HAS TO SEE THE SECOND ONE.
    // A version of this that fired a `focus` event and asserted nothing
    // afterwards would pass against a component that dropped the road
    // entirely — a test that cannot fail, which is one of the shapes
    // this round is hunting. The clock is driven instead.
    await page.clock.install();
    let calls = 0;
    await page.route(BRACKET_URL, (r) => {
      calls += 1;
      return calls === 1
        ? r.fulfill(json(A_DRAWN_BRACKET))
        : r.fulfill(json({ error: "the bracket build fell over" }, 503));
    });
    await page.goto("/bet-suggester/wc26");
    // the first read landed and the road is drawn
    await expect(page.locator("body")).toContainText("Road to the final");
    await expect(page.getByTestId("bracket-read-failed")).toHaveCount(0);
    // …and when the next poll fails the road STAYS, labelled as the
    // earlier read rather than vanishing
    await page.clock.fastForward(61_000);
    const notice = page.getByTestId("bracket-read-failed");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("has not been refreshed");
    await expect(page.locator("body")).toContainText("Road to the final");
    expect(calls).toBeGreaterThan(1);
  });

// A LEADER IS A COMPARISON AND A COMPARISON NEEDS TWO NUMBERS.
//
// The bracket card tints one side in the accent ink it uses to mean
// "the model's pick". That verdict was computed from
// `const hp = m.probs?.home_win ?? 0; const ap = m.probs?.away_win ?? 0`
// — so a card carrying one side's probability and not the other still
// produced a winner, off a zero nobody measured, and drew it in the
// colour that says the model chose it. The tint is read here through
// `data-leader`, which is derived from the same value the class is: a
// colour is not something a test can assert on honestly, so the claim
// rides where it can be read.

const oneSided = {
  ...A_DRAWN_BRACKET,
  quarterfinals: [{
    ...A_DRAWN_BRACKET.quarterfinals[0],
    probs: { home_win: 0.52 } as Record<string, number>,
  }],
};

test("a bracket card missing one side's probability picks NEITHER side — "
   + "the accent ink is a verdict and a zero-fill is not evidence",
  async ({ page }) => {
    await page.route(BRACKET_URL, (r) => r.fulfill(json(oneSided)));
    await page.goto("/bet-suggester/wc26");
    await expect(page.locator("body")).toContainText("Road to the final");
    const leaders = page.locator('[data-testid="bracket-team"][data-leader="true"]');
    await expect(leaders).toHaveCount(0);
    // …and the side that WAS sent still prints its number, so this is a
    // withheld verdict and not a withheld read
    await expect(page.locator("body")).toContainText("52.0%");
  });

test("a bracket card with BOTH probabilities does pick a side", async ({ page }) => {
    // THE NON-VACUITY HALF. A card that tinted nobody, ever, would pass
    // the test above and mean nothing.
    await page.route(BRACKET_URL, (r) => r.fulfill(json(A_DRAWN_BRACKET)));
    await page.goto("/bet-suggester/wc26");
    await expect(page.locator("body")).toContainText("Road to the final");
    const leaders = page.locator('[data-testid="bracket-team"][data-leader="true"]');
    await expect(leaders).toHaveCount(1);
    await expect(leaders).toHaveText(/Spain/);
  });

// ------------------------------------------------------ the tournament

const COMP = "asean";
const TOURNAMENT_URL = `**/api/comp/${COMP}/tournament`;

async function compShell(page: Page) {
  // everything else the /comp/[key] page reads, answered, so the
  // assertion is about the tournament read alone
  await page.route(`**/api/comp/${COMP}`, (r) => r.fulfill(json({
    key: COMP, display: "ASEAN", available: true,
  })));
}

test("a tournament read that answered 500 is named — a competition with no "
   + "tournament answers 404, and that is the only silence the switch buys",
  async ({ page }) => {
    await compShell(page);
    await page.route(TOURNAMENT_URL,
      (r) => r.fulfill(json({ error: "sim crashed" }, 500)));
    await page.goto(`/bet-suggester/comp/${COMP}`);
    const notice = page.getByTestId("tournament-read-failed");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("answers 404, and this did not");
  });

test("a 404 tournament read stays silent — the feature switch still "
   + "switches", async ({ page }) => {
    // The non-vacuity half, and the one the header of TournamentView
    // depends on: /comp/[key] mounts the component unconditionally and
    // relies on the 404 to render nothing at all.
    await compShell(page);
    const answered = page.waitForResponse((r) => r.url().includes("/tournament"));
    await page.route(TOURNAMENT_URL,
      (r) => r.fulfill(json({ detail: "no tournament" }, 404)));
    await page.goto(`/bet-suggester/comp/${COMP}`);
    await answered;
    await page.waitForTimeout(500);
    await expect(page.getByTestId("tournament-read-failed")).toHaveCount(0);
    await expect(page.getByTestId("tournament-read-stale")).toHaveCount(0);
    expect(await words(page)).not.toContain("could not ask");
  });

// -------------------------------------------- the live scoreboard rows

const SB = "**/api/bet-suggester/live-scores";

const liveMatch = (over: Record<string, unknown> = {}) => ({
  match_id: "m1", home: "Spain", away: "France",
  home_goals: 2, away_goals: 1, minutes_elapsed: 65,
  status_short: "2H",
  // the provider's vocabulary: `Column(Integer, default=0)`
  red_home: 0, red_away: 0,
  goals_list: [], is_finished: false, ...over,
});

/** The three side reads the live card makes, answered with "nothing for
 *  this match", so a test about ONE of them is not measuring the
 *  others' failure lines. */
async function quietExtras(page: Page) {
  await page.route("**/api/bet-suggester/live-auto/**", (r) => r.fulfill(
    json({ match_id: "m1", available: false, reason: "no run" })));
  await page.route("**/api/bet-suggester/live-signals**",
    (r) => r.fulfill(json({ signals: [] })));
  await page.route("**/api/bet-suggester/team-news/**", (r) => r.fulfill(
    json({ home_team: "Spain", away_team: "France", kickoff:
           "2030-07-01T18:00:00+00:00", available: false })));
}

const statsPayload = (rows: { key: string; label: string;
                              home: string; away: string }[]) => ({
  match_id: "m1", home_team: "Spain", away_team: "France",
  available: true, rows,
});

test("a stat the feed did not send draws NO share bar — `|| 0` made an "
   + "unread pair a measured 50/50", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**", (r) => r.fulfill(
      json(statsPayload([
        { key: "possession", label: "Possession", home: "—", away: "—" },
        { key: "shots", label: "Shots", home: "9", away: "4" },
      ]))));
    await page.goto("/bet-suggester/wc26");
    const undrawn = page.getByTestId("stat-share-undrawn");
    await expect(undrawn).toHaveCount(1);
    await expect(undrawn).toHaveAttribute("data-key", "possession");
    await expect(undrawn).toContainText("not a number");
  });

test("a stat both sides genuinely scored 0 on says THAT, and not the same "
   + "sentence as one that was never sent", async ({ page }) => {
    // The non-vacuity half. A measured 0-0 and an unread pair both fail
    // `tot > 0`; they are different facts and must not share a sentence.
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**", (r) => r.fulfill(
      json(statsPayload([
        { key: "corners", label: "Corners", home: "0", away: "0" },
      ]))));
    await page.goto("/bet-suggester/wc26");
    const undrawn = page.getByTestId("stat-share-undrawn");
    await expect(undrawn).toContainText("both sides zero");
    await expect(undrawn).not.toContainText("not a number");
  });

test("a stat with a real split still draws its bar", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**", (r) => r.fulfill(
      json(statsPayload([
        { key: "shots", label: "Shots", home: "9", away: "4" },
      ]))));
    await page.goto("/bet-suggester/wc26");
    await expect(page.locator("body")).toContainText("Shots");
    await expect(page.getByTestId("stat-share-undrawn")).toHaveCount(0);
  });

test("an available stats read with no rows says so — it fell between the "
   + "unavailable line and the block and drew nothing at all",
  async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json(statsPayload([]))));
    await page.goto("/bet-suggester/wc26");
    await expect(page.getByTestId("live-stats-empty")).toBeVisible();
    // and it is NOT the sentence a read that never landed gets
    await expect(page.getByTestId("live-stats-failed")).toHaveCount(0);
  });

// ------------------------------------------------------ the red cards

test("no red card renders no marker — and never the literal 0 that "
   + "`{m.red_home && …}` draws over an integer", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json({ match_id: "m1", available: false, rows: [] })));
    await page.goto("/bet-suggester/wc26");
    await expect(page.locator("body")).toContainText("Spain");
    await expect(page.getByTestId("red-cards")).toHaveCount(0);
    await expect(page.getByTestId("red-unreadable")).toHaveCount(0);
    // the defect this pins: React draws `0` as a text node, so the name
    // rendered as "Spain 0" on every card without a dismissal
    expect(await words(page)).not.toContain("Spain 0");
  });

test("TWO red cards are two, not one — the count the feed carried was "
   + "thrown away at the render", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({
      live: [liveMatch({ red_home: 2, red_away: 1 })] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json({ match_id: "m1", available: false, rows: [] })));
    await page.goto("/bet-suggester/wc26");
    const marks = page.getByTestId("red-cards");
    await expect(marks).toHaveCount(2);
    // and the count is REAL TEXT, not a colour and not a `title=`
    await expect(page.locator("body")).toContainText("Spain: 2 red cards");
    await expect(page.locator("body")).toContainText("France: 1 red card");
  });

test("a red-card field in a shape neither vocabulary uses REFUSES — it "
   + "does not fold into a clean sheet", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({
      live: [liveMatch({ red_home: "two", red_away: null })] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json({ match_id: "m1", available: false, rows: [] })));
    await page.goto("/bet-suggester/wc26");
    await expect(page.getByTestId("red-unreadable")).toHaveCount(2);
  });

test("the legacy boolean shape still reads as one card", async ({ page }) => {
    // `LiveStateFetch` documents "count (legacy: boolean)"; the coercion
    // keeps that door open rather than refusing a shape the feed has
    // demonstrably sent before.
    await page.route(SB, (r) => r.fulfill(json({
      live: [liveMatch({ red_home: true, red_away: false })] })));
    await quietExtras(page);
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json({ match_id: "m1", available: false, rows: [] })));
    await page.goto("/bet-suggester/wc26");
    await expect(page.getByTestId("red-cards")).toHaveCount(1);
    await expect(page.locator("body")).toContainText("Spain: 1 red card");
  });

// --------------------------------- the caveats that rode on a tooltip

test("the auto levers' derivation is real text, not a hover", async ({ page }) => {
    await page.route(SB, (r) => r.fulfill(json({ live: [liveMatch()] })));
    await page.route("**/api/bet-suggester/live-signals**",
      (r) => r.fulfill(json({ signals: [] })));
    await page.route("**/api/bet-suggester/team-news/**", (r) => r.fulfill(
      json({ home_team: "Spain", away_team: "France",
             kickoff: "2030-07-01T18:00:00+00:00", available: false })));
    await page.route("**/api/bet-suggester/live-stats/**",
      (r) => r.fulfill(json({ match_id: "m1", available: false, rows: [] })));
    await page.route("**/api/bet-suggester/live-auto/**", (r) => r.fulfill(json({
      match_id: "m1", available: true,
      teams: { home: "Spain", away: "France" },
      markets: [],
      levers: {
        home: 1.08, away: 0.94, source: "shots",
        basis: { sot_home: 5, sot_away: 2, shots_home: 12, shots_away: 6,
                 actual_share_home: 0.67, expected_share_home: 0.55,
                 volume_actual: 18, volume_expected: 15,
                 minutes: 65, weight: 0.4, cap: [0.85, 1.15] },
        momentum: { recent_share_home: 0.71, pressure_home: 3.1,
                    pressure_away: 1.2, window_min: 10, as_of_minute: 65,
                    mult_home: 1.06, mult_away: 0.95 },
      },
    })));
    await page.goto("/bet-suggester/wc26");
    // the block is behind a <details>, which IS in the accessible tree
    // and IS reachable by keyboard — unlike the `title=` it replaced
    const basis = page.getByTestId("lever-basis");
    await expect(basis).toBeVisible();
    await basis.getByRole("group").or(basis).first().click();
    await expect(basis).toContainText("against an expected");
    const mom = page.getByTestId("momentum-basis");
    await mom.click();
    await expect(mom).toContainText("not a forecast of the next few");
    // and the instruction to hover is gone
    expect(await words(page)).not.toContain("Hover the levers");
  });

// ================================================================
// THE REGISTER — every read on the owned surfaces that still ends in
// a swallow, with the condition that closes it.
// ================================================================
//
// A payload is not a wall and this registry does not pretend to be one.
// It is the honest, finite, converging alternative: the sites are
// DERIVED from the source on every run, so a new swallow appears here
// as a failure rather than as a silence — and a registered one that is
// closed also fails, because a stale record is how a hand-typed `sites`
// tuple went stale on the backend and hid the only remaining route to a
// fee-inclusive edge.

type Swallow = { finding: string; closes_when: string };

/** Catches on the owned surfaces that discard the failure ON PURPOSE,
 *  each with why it is judged safe and what would close it. Keyed by
 *  the marker written into the source at the site. */
export const REGISTERED_SWALLOWS: Record<string, Swallow> = {
  "livepanel:saved-read-parse": {
    finding:
      "LivePanel.loadSaved() folds a corrupt or unreadable localStorage "
      + "entry to null. The value is this browser's own cached copy of a "
      + "past state, not a read of anything: losing it restores the "
      + "component's initial inputs, which are visibly the initial "
      + "inputs, and no sentence anywhere claims the cache was consulted.",
    closes_when:
      "the saved read is ever presented as evidence of a past state "
      + "rather than as a form's remembered inputs — then a parse "
      + "failure must be named the way a fetch failure is.",
  },
  "livepanel:storage-write": {
    finding:
      "LivePanel's persist effect swallows a localStorage write failure "
      + "(quota, private mode). Nothing on the surface promises the "
      + "state was saved except the 'saved locally' line, which is "
      + "printed from savedAt on the render path, not from the write.",
    closes_when:
      "the 'saved locally' line is derived from the write succeeding "
      + "rather than from the fetch that produced the value.",
  },
  "market:live-chip": {
    finding:
      "The match page's top-bar live chip polls /live-scores every 45s "
      + "and swallows a rejection. The chip's absence reads as 'nothing "
      + "is in play', which is the same shape LiveScoreboard closed — "
      + "but this page draws no scoreboard, so there is nowhere on it "
      + "for a failure line to sit that is not the top bar itself, and "
      + "a warn strip in the nav on every backend blip is a worse "
      + "surface than a missing convenience link.",
    closes_when:
      "the chip stops being the only live indicator on this page (a "
      + "watched strip or a live block lands here), or the top bar "
      + "gains a place to state a coverage fact; then name it there.",
  },
  "comp:kalshi-market-counts": {
    finding:
      "The competition page's /markets read adds a ' · N tradeable on "
      + "kalshi' suffix and one footnote sentence, both rendered only "
      + "when the fields are non-null. A failure drops the suffix, which "
      + "is silence about Kalshi rather than a claim of zero — the "
      + "count is never zero-filled.",
    closes_when:
      "any number derived from this read is drawn with a default, or "
      + "the read starts backing a sentence about what Kalshi lists.",
  },
  "market:team-name-resolution": {
    finding:
      "The match page's display-name read falls back to the match id's "
      + "own codes. The fallback is VISIBLE and TRUE ('BRA vs SRB'), so "
      + "the failure does not render as a lookalike absence — there is "
      + "no claim to correct.",
    closes_when:
      "anything on that page reads the resolved names as evidence "
      + "(a scouting join, a market match) rather than as a heading.",
  },
};

/** Every file this round owns. Derived by walking the tree, minus the
 *  four components another agent held open in the same checkout — named
 *  rather than silently skipped, with the condition that retires the
 *  exclusion. */
const NOT_MINE_THIS_ROUND = new Set([
  "SuggestionCard.tsx", "MatchHub.tsx", "WatchedStrip.tsx",
  "WatchDeclaration.tsx",
]);
const NOT_MINE_CLOSES_WHEN =
  "this round's four-agent ownership split ends; then delete "
  + "NOT_MINE_THIS_ROUND and let the walk cover every component.";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx") && !NOT_MINE_THIS_ROUND.has(name)) out.push(p);
  }
  return out;
}

const SRC = join(__dirname, "..", "src");
const OWNED = [
  ...walk(join(SRC, "components")).filter((p) => !p.includes("/pages/")),
  ...walk(join(SRC, "pages")),
];

/** Blank every comment and string literal, preserving length so an
 *  offset into the result is the same offset into the original. Without
 *  this the scan reads its OWN prose: three files carry the sentence
 *  "used to end in `.catch(() => {})`", and a guard that fires on a
 *  comment describing the fix is a guard nobody can keep green.
 *
 *  A NESTED TEMPLATE LITERAL IS WHY THIS IS NOT A REGEX. LiveScoreboard
 *  builds a signal tooltip as `${cond ? "a" : `${x} b`}` — a template
 *  inside a `${}` inside a template. A scanner that ends a template at
 *  the next backtick desynchronises there and treats the whole rest of
 *  the file as inverted: prose becomes code and code becomes prose, and
 *  the guard then fires on a comment 380 lines later. It did, before
 *  this was written properly. `${}` bodies are scanned as CODE.
 */
function codeOnly(src: string): string {
  const out = src.split("");
  const blank = (a: number, b: number) => {
    for (let k = Math.max(a, 0); k < b && k < out.length; k += 1) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };
  /** returns the index just past the construct starting at i, or -1 if
   *  nothing at i opens one */
  const skip = (i: number): number => {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") {
      const e = src.indexOf("\n", i);
      const end = e === -1 ? src.length : e;
      blank(i, end);
      return end;
    }
    if (c === "/" && d === "*") {
      const e = src.indexOf("*/", i + 2);
      const end = e === -1 ? src.length : e + 2;
      blank(i, end);
      return end;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) { j += 1; break; }
        j += 1;
      }
      blank(i + 1, j - 1);
      return j;
    }
    if (c === "`") {
      let lit = i + 1, j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "`") { blank(lit, j); return j + 1; }
        if (src[j] === "$" && src[j + 1] === "{") {
          blank(lit, j);
          let depth = 1, k = j + 2;
          while (k < src.length && depth > 0) {
            const n = skip(k);
            if (n > k) { k = n; continue; }
            if (src[k] === "{") depth += 1;
            else if (src[k] === "}") depth -= 1;
            k += 1;
          }
          j = k; lit = k;
          continue;
        }
        j += 1;
      }
      blank(lit, j);
      return j;
    }
    return -1;
  };
  let i = 0;
  while (i < src.length) {
    const n = skip(i);
    i = n > i ? n : i + 1;
  }
  return out.join("");
}

/** A `catch` whose block neither binds the error into something the
 *  surface can say, nor rethrows. The scan is deliberately crude and
 *  deliberately over-eager: a false positive costs one registry entry
 *  with a reason, which is exactly the artefact this round wants.
 *
 *  Detection runs on the comment-blanked source; the MARKER is read back
 *  out of the original at the same offsets, because the marker lives in
 *  a comment on purpose — it is a note to the next reader, not code. */
function swallows(source: string): { marker: string | null; body: string }[] {
  const code = codeOnly(source);
  const found: { marker: string | null; body: string }[] = [];
  const re = /catch\s*(?:\(([^)]*)\)\s*)?\{/g;
  while (re.exec(code) !== null) {
    // read to the matching close brace
    let depth = 1, i = re.lastIndex;
    while (i < code.length && depth > 0) {
      if (code[i] === "{") depth += 1;
      else if (code[i] === "}") depth -= 1;
      i += 1;
    }
    const body = code.slice(re.lastIndex, i - 1);
    // "names the failure" = the failure reaches the surface: a state
    // write the render reads, a toast the reader sees, or a rethrow that
    // hands the decision up. Nothing else counts.
    const named =
      /\bset[A-Z]\w*\s*\(/.test(body) || /\bthrow\b/.test(body)
      || /\btoast\s*\(/.test(body);
    if (named) continue;
    const marker = source.slice(re.lastIndex, i - 1)
      .match(/SWALLOWED\(([^)]+)\)/)?.[1] ?? null;
    found.push({ marker, body });
  }
  // arrow-form `.catch(() => {})` — nothing at all reaches the surface.
  // The body is blank in `code` whether it held nothing or held only a
  // comment, so the MARKER is read back out of the original span.
  const arrow = /\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/g;
  for (const a of code.matchAll(arrow)) {
    const span = source.slice(a.index!, a.index! + a[0].length);
    found.push({ marker: span.match(/SWALLOWED\(([^)]+)\)/)?.[1] ?? null,
                 body: a[0] });
  }
  return found;
}

test("no read on an owned surface swallows a failure without a record",
  () => {
    expect(OWNED.length).toBeGreaterThan(10);   // never vacuous
    const unregistered: string[] = [];
    const seen = new Set<string>();
    for (const file of OWNED) {
      for (const s of swallows(readFileSync(file, "utf8"))) {
        if (s.marker && REGISTERED_SWALLOWS[s.marker]) { seen.add(s.marker); continue; }
        unregistered.push(
          `${file.slice(SRC.length + 1)} :: ${s.marker
            ? `marker ${s.marker} is not in REGISTERED_SWALLOWS`
            : `unmarked catch — ${s.body.trim().slice(0, 90)}`}`);
      }
    }
    expect(unregistered,
      "A failed read that renders as an empty one is this repo's most "
      + "repeated defect. Either name the failure (route it into state "
      + "the surface prints) or add a `/* SWALLOWED(key) */` marker and "
      + "a REGISTERED_SWALLOWS entry saying why it is safe and what "
      + "closes it.").toEqual([]);

    // …AND THE OTHER DIRECTION. A registered hole that no longer exists
    // is a stale record, which is how the backend's hand-typed `sites`
    // tuple hid the only remaining route to a fee-inclusive edge.
    const stale = Object.keys(REGISTERED_SWALLOWS).filter((k) => !seen.has(k));
    expect(stale,
      "These swallows are registered but no longer present. Retire the "
      + "record — a register that outlives its holes stops being read.")
      .toEqual([]);
  });

test("the ownership exclusion is a record, not a habit", () => {
  // The one hand-listed set in this file, named so it cannot go quiet.
  expect(NOT_MINE_CLOSES_WHEN).toContain("delete NOT_MINE_THIS_ROUND");
  expect(NOT_MINE_THIS_ROUND.size).toBe(4);
});

// =====================================================================
// MISSING IS NOT ZERO — THE SEVEN-DAY SHADOW CHIP ON ALL FOUR HUBS
// =====================================================================
//
// The twin, found by searching for the shape rather than the site.
//
// Each league hub draws a model's three-way probabilities in two
// places. `OddsChip`, on the fixture card, was written with the rule on
// it — "dark model: no chip at all — never a zero bar" — and its own
// local formatter that prints an em dash for a key the backend did not
// send. The SEVEN-DAY LIST, in the same file, a hundred-odd lines up,
// carried an inline copy that read
//
//     {Math.round((oddsMap[f.id].outcomes!.home_win ?? 0) * 100)}
//     /{Math.round((oddsMap[f.id].outcomes!.draw ?? 0) * 100)}
//     /{Math.round((oddsMap[f.id].outcomes!.away_win ?? 0) * 100)}
//
// on all three legs, in all four files. A payload carrying home_win and
// away_win but no `draw` rendered "45/0/30": the model saying this
// fixture cannot be drawn, printed off a number nobody computed. The
// row's only label — whose odds these are, and that they are not advice
// — rode on a `title=`, so a reader of the accessible tree met three
// bare numbers with nothing attached.
//
// Both halves are closed by CONSTRUCTION rather than policed: there is
// now exactly one `outcomePct` per file and both call sites go through
// it, and the label is real text. The scan below is the guard that the
// second formatter does not grow back.
//
// THE LIST OF FILES IS DERIVED FROM THE PAGE'S OWN DISPATCH, NOT TYPED.
// leagues.tsx names the component it mounts per league id on the same
// lines it gates them with `BUILT_LEAGUES`, and both are read here: a
// league added to the registry without a dashboard row, or a dashboard
// renamed, fails this file loudly instead of quietly dropping a hub —
// which is exactly how La Liga was the one hub left carrying the defect
// the last time a guard hand-listed three of four.

const LEAGUES_TSX = readFileSync(
  join(SRC, "pages", "bet-suggester", "leagues.tsx"), "utf8");

const REGISTERED_LEAGUES: string[] = (() => {
  const m = LEAGUES_TSX.match(/const BUILT_LEAGUES = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) {
    throw new Error(
      "leagues.tsx no longer declares `const BUILT_LEAGUES = new Set([...])`. "
      + "This spec derives its hub list from that registry on purpose — "
      + "point it at the new one, do not re-type the league ids.");
  }
  return [...m[1].matchAll(/"([a-z0-9_-]+)"/g)].map((x) => x[1]);
})();

const HUB_DASHBOARDS: { league: string; component: string; file: string }[] =
  [...LEAGUES_TSX.matchAll(/league\.id === "([a-z0-9_-]+)" && <(\w+) \/>/g)]
    .map((m) => ({
      league: m[1], component: m[2],
      file: join(SRC, "components", `${m[2]}.tsx`),
    }));

test("the hub list this file scans is the one the page dispatches", () => {
  expect(REGISTERED_LEAGUES.length).toBeGreaterThan(0);
  expect(HUB_DASHBOARDS.map((h) => h.league).sort())
    .toEqual([...REGISTERED_LEAGUES].sort());
});

for (const h of HUB_DASHBOARDS) {
  test(`${h.league}: one outcome formatter, and no zero-filled outcome`,
    () => {
      const src = readFileSync(h.file, "utf8");
      const code = codeOnly(src);   // its own prose quotes the defect

      // ONE FORMATTER. Two is how the fixed one and the broken one sat
      // in the same file for four rounds without disagreeing loudly.
      expect((code.match(/function outcomePct\(/g) ?? []).length,
        `${h.component} must declare exactly one outcomePct`).toBe(1);
      expect((code.match(/outcomePct\(/g) ?? []).length,
        `${h.component} declares outcomePct but nothing calls it — an `
        + "unused formatter is not a fix").toBeGreaterThan(2);

      // AND NO SECOND ONE, ANYWHERE. Any `?? 0` or `|| 0` reached from
      // an `outcomes` read is a probability defaulted to a measured
      // zero; that is the defect, spelled however it is spelled.
      const zeroFilled = [...code.matchAll(/outcomes[^;\n]{0,140}?(\?\?|\|\|)\s*0\b/g)]
        .map((m) => m[0].trim());
      expect(zeroFilled,
        `${h.component}: a model outcome is being defaulted to 0. "0%" is `
        + "a claim that the model gave this result no chance; a key the "
        + "backend never sent was never measured. Route it through "
        + "outcomePct, which prints an em dash.").toEqual([]);
    });
}

/** The reads a hub makes, all answered, with `odds` supplied by the
 *  caller so the two halves differ in exactly one payload. */
async function hubWithOdds(page: Page, league: string, odds: unknown) {
  const fx = {
    id: "wk1", date: "2030-05-01T19:00:00Z", state: "pre",
    venue: "Somewhere", home: { name: "Home FC", short: "HOM" },
    away: { name: "Away FC", short: "AWY" },
  };
  const ok: Record<string, unknown> = {
    scoreboard: { fixtures: [] },
    "schedule**": { fixtures: [fx] },
    standings: { tables: [], conferences: [] },
    markets: { games: [] },
    status: {},
    "markets/discovery": {},
  };
  for (const [path, body] of Object.entries(ok)) {
    await page.route(`**/api/${league}/${path}`, (r) => r.fulfill(json(body)));
  }
  await page.route(`**/api/${league}/odds`, (r) => r.fulfill(json(odds)));
}

const PARTIAL = { odds: [{ espn_event_id: "wk1", locked: false,
  outcomes: { home_win: 0.45, away_win: 0.3 } }] };
const WHOLE = { odds: [{ espn_event_id: "wk1", locked: false,
  outcomes: { home_win: 0.45, draw: 0.25, away_win: 0.3 } }] };

for (const h of HUB_DASHBOARDS) {
  test(`${h.league}: an outcome the backend did not send is a dash, not 0`,
    async ({ page }) => {
      await hubWithOdds(page, h.league, PARTIAL);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      // EXACTLY where the dash is. The two legs that WERE sent still
      // read, so this pins the dash to the missing one rather than to
      // a chip that gave up wholesale — and nothing renders a 0.
      expect(text).toMatch(/45\/—\/30/);
      expect(text).not.toMatch(/\b0\b/);
    });

  test(`${h.league}: a whole outcome set draws three numbers and no dash`,
    async ({ page }) => {
      // THE NON-VACUITY HALF. A chip that printed a dash for everything
      // would pass the test above and say nothing true.
      await hubWithOdds(page, h.league, WHOLE);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      expect(text).toMatch(/45\/25\/30/);
      // and no dash anywhere in the chip: inside it an em dash means
      // "this leg was not measured" and nothing else, which is why the
      // spoken label beside it carries none.
      expect(text).not.toContain("—");
    });

  test(`${h.league}: the seven-day chip says whose numbers these are`,
    async ({ page }) => {
      // A CAVEAT ON A `title=` IS NOT IN THE ACCESSIBLE TREE. This row
      // used to carry "<model> shadow odds — not advice" on a title
      // attribute and nothing else; three bare numbers reached a screen
      // reader with no owner and no disclaimer.
      await hubWithOdds(page, h.league, WHOLE);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      // innerText excludes `title` attributes and includes sr-only text
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      expect(text).toMatch(/not advice/i);
      expect(text).toMatch(/-2026-v0/);
    });
}

// =====================================================================
// LA LIGA'S MODEL-STATE READS — THE THIRD COLLAPSE IN THE FILE THAT
// INVENTED `settle()`
// =====================================================================
//
// `/api/laliga/odds` and `/api/laliga/status` were both
// `.catch(() => null)`-ed into `model` and `status`, and every sentence
// the model section prints is derived from those two: the heading
// ("Dark — no approval decision exists" / "State unavailable"), the
// blocker chips (`status?.counts?.blockers ?? []`), the xG note, and
// the model version in the eyebrow, which falls back to a literal
// "laliga-2026-v0" this page carries itself. A 503 therefore produced
// the same pixels as a backend that answered and had nothing to add —
// a claim about a model, made off a read that never happened, in the
// one file whose own header says "Loading, failed and empty are three
// different facts."
//
// `odds` was closed in the round before this one. These two are the
// same shape one state over.

const LALIGA_OK: Record<string, unknown> = {
  scoreboard: { fixtures: [] },
  "schedule**": { fixtures: [] },
  standings: { tables: [], conferences: [] },
  markets: { games: [] },
  odds: { odds: [], model_state: "dark", model_version: "laliga-2026-v0" },
  status: { model_dark: true, model_version: "laliga-2026-v0",
            model_dark_note: "no approval decision exists",
            xg_note: "xg join is thin", counts: { blockers: ["needs-results"] } },
};

async function laliga(page: Page, dead: string[] = []) {
  for (const [path, body] of Object.entries(LALIGA_OK)) {
    await page.route(`**/api/laliga/${path}`, (r) => r.fulfill(json(body)));
  }
  for (const path of dead) {
    await page.route(`**/api/laliga/${path}`,
      (r) => r.fulfill(json({ error: "upstream is down" }, 503)));
  }
}

for (const dead of [["status"], ["odds"], ["status", "odds"]]) {
  test(`la liga: a dead ${dead.join(" + ")} read is named, not drawn as a `
     + "model with nothing to say", async ({ page }) => {
      await laliga(page, dead);
      await page.goto("/bet-suggester?league=laliga");
      const notice = page.getByTestId("model-state-read-failed");
      await expect(notice).toBeVisible();
      await expect(notice).toContainText("did not land");
      // the blockers and the note are things this read CARRIES, so the
      // line has to say their absence is unread — not print them empty
      await expect(notice).toContainText("unread rather than unstated");
    });
}

test("la liga: two healthy model-state reads print no failure line, and the "
   + "section says what they said", async ({ page }) => {
    // THE NON-VACUITY HALF. A page that always printed the warning would
    // pass all three tests above and mean nothing.
    await laliga(page);
    await page.goto("/bet-suggester?league=laliga");
    await expect(page.locator("body")).toContainText("no approval decision");
    await expect(page.getByTestId("model-state-read-failed")).toHaveCount(0);
    await expect(page.locator("body")).toContainText("needs-results");
    await expect(page.locator("body")).toContainText("xg join is thin");
  });

// ======================================================================
// THE FEED'S ABSENT FIELDS ARE NOT ZEROS (2026-09-06 audit, fixed
// 2026-09-07)
//
// LivePanel.autoFill filled the operator's live-state form with
// `s.current_home ?? 0`, `s.current_away ?? 0` and
// `Math.min(3, Number(s.red_home) || 0)`. Every one of those fields is
// OPTIONAL on LiveStateFetch, so a feed response that carried no score
// produced a measured 0-0 with no red cards — and the panel then ran a
// real live prediction against it. This is the plane's oldest trap on
// the one surface where the operator cannot see the payload behind the
// number.
// ======================================================================

const LIVE_PANEL = readFileSync(
  join(SRC, "components", "LivePanel.tsx"), "utf8");

test("LivePanel never coerces an absent feed field into a number",
  async () => {
    // The three literals that shipped the defect. A source guard rather
    // than a DOM one because the defect is the DEFAULT — a rendered 0 is
    // indistinguishable from a real 0, which is the whole problem, so
    // the only place it can be caught is where the 0 is invented.
    for (const bad of ["current_home ?? 0", "current_away ?? 0",
                       "Number(s.red_home) || 0",
                       "Number(s.red_away) || 0"]) {
      expect(LIVE_PANEL, `LivePanel invents a zero: ${bad}`)
        .not.toContain(bad);
    }
    // NON-VACUITY: the fields are still read, so the guard is watching
    // live code and not a deleted block.
    expect(LIVE_PANEL).toContain("s.current_home");
    expect(LIVE_PANEL).toContain("s.red_home");
  });

test("LivePanel says which fields the feed did not carry", async () => {
    // A field left alone silently is the same blank as a field zeroed
    // silently: the operator cannot tell the panel skipped it. The
    // absence is named on the message the fill writes.
    expect(LIVE_PANEL).toContain("notCarried");
    expect(LIVE_PANEL).toContain("did not carry");
    expect(LIVE_PANEL).toContain("not zeroed");
  });

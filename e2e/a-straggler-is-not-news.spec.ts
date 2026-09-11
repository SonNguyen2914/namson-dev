import { expect, test } from "@playwright/test";

// THE LIVE SURFACE'S POLL — what it was found doing on 2026-09-11, and
// the shape of each finding so a repeat cannot pass.
//
// Every test here is a MEASUREMENT that was taken against the build
// immediately before it, and every one of them was red there. None of
// them is about pixels:
//
//   - A LATE RESPONSE REWROTE THE SCREEN WITH OLDER DATA. The effect
//     carried an `alive` flag for unmount and nothing for ORDERING, so
//     the last response to arrive won regardless of the order the
//     requests went out in. Demonstrated with a delayed first poll and
//     a fast second one: the fresh read drew, and then the straggler
//     landed and the screen reverted. On a moving match that is the
//     score and the clock going BACKWARDS, with nothing on the page
//     saying so.
//   - A HUNG POLL WAS INVISIBLE AND ACCUMULATED. There was no
//     AbortController and no timeout on this read at all. Four polls
//     fired, three never answered, and the stale banner never drew —
//     the figures sat on screen with nothing saying they were from an
//     earlier read, which is the exact opposite of the section's own
//     charter: "when the newest poll fails the strip keeps showing what
//     it had and SAYS the numbers are from the earlier read".
//   - ONE MISSING ENVELOPE KEY DISARMED THE WHOLE STALE MACHINERY. The
//     banner was armed by `if (lastOk.current)` and `lastOk` held
//     `generated_at`, so a good poll whose envelope carried no
//     `generated_at`, followed by a 403, drew no banner, no gate and
//     nothing else: the read was being REFUSED and not one thing on
//     screen said so.
//   - THERE WAS NO FAULT ISOLATION ANYWHERE ON THE PAGE. No error
//     boundary existed in this frontend, so an unexpected shape inside
//     the strip unmounted the whole tree: `<main>` gone, body text down
//     to 127 characters, and THE PICKER BOARD AND EVERY LEAGUE COLUMN
//     DEAD with a section that shares nothing with them but a page.
//   - TWO COMPONENTS POLLED THE SAME READ ON SEPARATE TIMERS. Measured
//     on production: two requests per cycle, 2.4s out of phase, ~139KB
//     each — and two independent reads of one moving match drawn side
//     by side as a single screen.
//
// SLOW BY CONSTRUCTION, AND THAT IS NOT AN ACCIDENT. The cadence is
// 15s and the ceiling is one period plus five seconds; a test of what
// happens across two polls cannot be faster than two polls. Each one
// that needs the wall clock says how long it needs and why.
//
// HERMETIC. Every route the board touches is served here.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Page = import("@playwright/test").Page;

const STRIP_URL = "/api/bet-suggester/watched-strip";

// ---------------------------------------------------------------- board

const LEAGUES = { mls: { src: "current", min_current_gp: 21, clubs: 30 } };

const BOARD = {
  generated_at: "2026-09-11T12:00:00Z", date: "20260911", days: 7,
  leagues: LEAGUES, rows: [], refusals: [],
};

const REVIEW = {
  generated_at: "2026-09-11T12:00:00Z", date: "20260911", back: 7,
  window: { from: "20260904", to: "20260911" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

// -------------------------------------------------------- the payloads
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY: every key below is one
// api/main.py's watched-strip route actually emits — the envelope's
// `version`/`generated_at`/`monitored_by_source`, the match block's
// `fixture_id`/`competition_slug`/`home`/`away`/`espn_event_id`, and
// `_state()`'s own fields. Blocks this file does not exercise are left
// ABSENT rather than invented; the card refuses them by name, which
// e2e/live-card.spec.ts already pins.

/** One declared match under way, at a named score and a named clock. */
const strip = (generatedAt: string, home: number, away: number) => ({
  version: "watched-strip-v1",
  generated_at: generatedAt,
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {}, policy_codes: {},
  matches: [{
    fixture_id: 101, competition_slug: "mls-2026",
    home: "Austin FC", away: "St. Louis City SC",
    espn_event_id: "401882901",
    state: {
      in_play: true, minute: 65, score_home: home, score_away: away,
      clock_display: "65'", match_state: "in", refusals: [],
      captured_at: generatedAt,
    },
    positions: [],
  }],
});

/** THE EARLIER READ — one-nil at 21:05:00. */
const OLD = strip("2026-09-11T21:05:00Z", 1, 0);
/** THE LATER READ — two-one at 21:05:15, which is the one that must
 *  stay on screen once it has landed. */
const NEW = strip("2026-09-11T21:05:15Z", 2, 1);

const section = (page: Page) => page.getByTestId("watched-strip");
const scoreline = (page: Page) => page.getByTestId("watched-scoreline");

/** Every route the board touches, with the strip served by a function
 *  of the request NUMBER so a test can shape the sequence rather than
 *  the clock. Returns the hit counter. */
type Answer = { body: unknown; status?: number; delayMs?: number };

async function serve(page: Page, answer: (n: number) => Answer | undefined) {
  const hits = { strip: 0 };
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/comp/*/fixtures**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/live-watchlist**", (r) =>
    r.fulfill(json({
      version: "watchlist-v1", generated_at: "2026-09-11T21:05:00Z",
      monitored_fixture_ids: [], monitored_by_source: {},
      coverage: [], open_positions_not_monitored: [], log: [],
      registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
    })));
  // THE RESOLVER IS A DIFFERENT SHAPE AND MUST NOT BE SERVED THE ONE
  // ABOVE. Registered after it so it wins — Playwright matches routes
  // in REVERSE registration order — because `**/live-watchlist**` also
  // matches `/live-watchlist/resolve`.
  await page.route("**/api/bet-suggester/live-watchlist/resolve**", (r) =>
    r.fulfill(json({ resolved: {}, notes: {}, asked: 0,
                     unreadable_references: [] })));
  await page.route(`**${STRIP_URL}**`, (r) => {
    hits.strip += 1;
    const out = answer(hits.strip);
    // `undefined` = NEVER ANSWER. The handler returns without
    // fulfilling, which is a request the page issued and that nothing
    // ever came back for — the hung poll, exactly.
    if (out === undefined) return;
    // A LATE ANSWER IS SCHEDULED, NEVER AWAITED INSIDE THE HANDLER.
    // `await sleep(...)` here holds the handler open, and a held
    // handler holds the NEXT request behind it: the second poll then
    // cannot answer before the first one does, the straggler is no
    // longer a straggler, and the test passes against a build with no
    // ordering guard at all. It did. So the route is parked and
    // fulfilled off a timer, which is the only way to get two answers
    // genuinely in flight and genuinely out of order.
    if (out.delayMs) {
      setTimeout(() => {
        void r.fulfill(json(out.body, out.status ?? 200)).catch(() => {});
      }, out.delayMs);
      return;
    }
    return r.fulfill(json(out.body, out.status ?? 200));
  });
  return hits;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ============================ 1. a straggler never reaches the screen

test("a response that left BEFORE the one already on screen never lands",
  async ({ page }) => {
    // TWO POLLS, AND THE SLOW ONE IS THE OLD ONE. Poll 1 is held for
    // 17s and answers with the 21:05:00 read; poll 2 goes out at 15s
    // and answers 21:05:15 immediately. So the fresh read is on screen
    // at ~15s and the straggler arrives at ~17s. Under the build before
    // this one the screen went back to one-nil at that moment.
    //
    // WITHIN THE CEILING ON PURPOSE. The read is abandoned at one
    // period plus five seconds, so a 17s straggler is a response that
    // genuinely ARRIVES and is genuinely DISCARDED — the ordering guard
    // is what this measures, not the ceiling.
    test.setTimeout(90_000);
    await serve(page, (n) => (n === 1
      ? { body: OLD, delayMs: 17_000 }
      : { body: NEW }));
    await page.goto("/bet-suggester");
    // THE WAIT IS MEASURED FROM THE NAVIGATION, NOT FROM THE ASSERTION
    // ABOVE IT. A `sleep` chained after a `toHaveAttribute` is measured
    // from whenever that resolved, which moves with the build under
    // test — and a red-proof that shifts its own window is a test of
    // the clock. This one always looks at the same wall time.
    const t0 = Date.now();

    // The fresh read draws first, because the first one is still out.
    await expect(section(page)).toHaveAttribute(
      "data-generated-at", NEW.generated_at, { timeout: 30_000 });
    await expect(scoreline(page)).toContainText("2–1");

    // AND THEN THE STRAGGLER LANDS AND CHANGES NOTHING.
    //
    // SAMPLED, AND DELIBERATELY NOT AUTO-WAITED. `toHaveAttribute`
    // RETRIES for fifteen seconds, and the third poll lands at 30s with
    // the fresh read — so a retrying assertion placed after the
    // straggler waits out the revert and goes green on the poll that
    // corrected it. It did exactly that, against a build with no
    // ordering guard at all, while the screen was demonstrably showing
    // one-nil the whole time. Every sample between the straggler (17s)
    // and the next poll (30s) must be the fresh read, so the check is a
    // snapshot per second across that window and not one look with
    // patience.
    const seen: { at: number; stamp: string | null; score: string }[] = [];
    while (Date.now() - t0 < 28_000) {
      await sleep(1_000);
      if (Date.now() - t0 < 18_000) continue;
      const shot = await section(page).evaluate((el) => ({
        stamp: el.getAttribute("data-generated-at"),
        score: el.querySelector<HTMLElement>(
          '[data-testid="watched-scoreline"]')?.innerText ?? "",
      }));
      seen.push({ at: Math.round((Date.now() - t0) / 1000), ...shot });
    }
    expect(seen.length, "the window between the two polls was sampled")
      .toBeGreaterThan(5);
    for (const s of seen) {
      expect(s.stamp, `at ${s.at}s the screen went back to an older read`)
        .toBe(NEW.generated_at);
      expect(s.score, `at ${s.at}s the SCORE went backwards`)
        .toContain("2–1");
    }
    // THE CLOCK THE STALE BANNER WOULD QUOTE WAS WALKED BACKWARDS TOO,
    // and a payload that never reached the screen must not have reached
    // that either: the newest read SUCCEEDED, so there is no banner.
    await expect(page.getByTestId("watched-stale")).toHaveCount(0);
  });

// ================================ 2. a hung read is abandoned, and said

test("a read that never answers is abandoned and DRAWN — a section that "
   + "has not been read does not sit blank forever", async ({ page }) => {
    // NOTHING EVER ANSWERS. Before this round there was no
    // AbortController and no timeout on this read, so the page sat with
    // no strip and no notice of any kind for as long as the tab was
    // open — which is indistinguishable from "nothing is declared", the
    // one conclusion this surface exists against.
    test.setTimeout(90_000);
    await serve(page, () => undefined);
    await page.goto("/bet-suggester");
    const gate = page.getByTestId("watched-strip-gate");
    await expect(gate).toBeVisible({ timeout: 40_000 });
    // IT SAYS WHOSE SENTENCE THIS IS. Every other refusal on this
    // surface is quoted from the layer that produced it; nothing
    // produced this one, and the words say so rather than putting a
    // backend's voice on a request that never came back.
    await expect(gate).toContainText("gave up on the request");
    await expect(gate).toContainText("NOTHING UPSTREAM REFUSED IT");
    // AND IT CLAIMS NOTHING IT COULD NOT MEASURE.
    const text = (await section(page).innerText()).toLowerCase();
    for (const lie of ["no live matches", "nothing is live",
                       "no match is live"]) {
      expect(text, `an abandoned read must not claim "${lie}"`)
        .not.toContain(lie);
    }
  });

test("a hung poll AFTER a good one marks the figures as the earlier "
   + "read — the charter's own promise", async ({ page }) => {
    // THE MEASUREMENT THAT NAMED THIS DEFECT: four polls fired, three
    // never answered, `watched-stale` count 0. The component's charter
    // at the top of its own file promises the opposite in as many
    // words. Poll 1 lands; poll 2 goes out at 15s and never comes back;
    // it is abandoned one period plus five seconds later, and THAT is
    // the failure that arms the banner.
    test.setTimeout(120_000);
    await serve(page, (n) => (n === 1 ? { body: NEW } : undefined));
    await page.goto("/bet-suggester");
    await expect(section(page)).toHaveAttribute(
      "data-generated-at", NEW.generated_at, { timeout: 30_000 });
    const stale = page.getByTestId("watched-stale");
    await expect(stale).toBeVisible({ timeout: 60_000 });
    await expect(stale).toHaveAttribute("data-since", NEW.generated_at);
    await expect(stale).toContainText(NEW.generated_at);
    await expect(page.getByTestId("watched-stale-why"))
      .toContainText("gave up on the request");
    // THE FIGURES ARE STILL THERE. Keeping them is the other half of
    // the promise — a failed poll is not a quiet match, and it is not
    // an empty one either.
    await expect(scoreline(page)).toContainText("2–1");
  });

// =========== 3. one missing envelope key must not disarm the machinery

test("a good read with no `generated_at`, then a refusal, still says "
   + "the figures are from the earlier read", async ({ page }) => {
    // MEASURED: stale banner 0, gate 0, cards still up — the read was
    // being REFUSED and nothing on screen said so, because the banner
    // was armed off the STAMP rather than off the fact that there had
    // been a good read. Whether there was an earlier read and when it
    // was taken are two different facts; one of them missing is not a
    // reason to withhold the other.
    test.setTimeout(90_000);
    const NO_STAMP: Record<string, unknown> = { ...NEW };
    delete NO_STAMP.generated_at;
    const REFUSED_SAID = "operator token refused by the live plane";
    await serve(page, (n) => (n === 1
      ? { body: NO_STAMP }
      : { body: { detail: REFUSED_SAID }, status: 403 }));
    await page.goto("/bet-suggester");
    await expect(scoreline(page)).toContainText("2–1", { timeout: 30_000 });
    const stale = page.getByTestId("watched-stale");
    await expect(stale).toBeVisible({ timeout: 40_000 });
    // NO STAMP TO QUOTE, AND THE ABSENCE IS NAMED RATHER THAN FILLED.
    await expect(stale).toHaveAttribute("data-since", "");
    await expect(stale).toContainText("CARRIED NO");
    await expect(stale).toContainText("cannot say when it was taken");
    // AND THE REFUSAL IS THE BACKEND'S OWN, with its status beside it.
    const why = page.getByTestId("watched-stale-why");
    await expect(why).toContainText("403");
    await expect(why).toContainText(REFUSED_SAID);
  });

// ========================== 4. one bad shape does not take the board down

test("a shape the strip cannot draw stops the STRIP and nothing else",
  async ({ page }) => {
    // THE PAGE-LEVEL FINDING. With no error boundary anywhere in this
    // frontend, one unexpected shape inside this section unmounted the
    // whole tree: `document.body.innerText` dropped to 127 characters
    // and `<main>` disappeared, so the picker board and every league
    // column died with the strip.
    //
    // THE SHAPE IS DELIBERATELY NOT ONE OF THE READS THAT WERE GUARDED.
    // `monitored_not_described` is an OPTIONAL list this surface maps
    // over; handed a string it raises, and that is the point — the
    // boundary is for the shape nobody guarded, which is every shape
    // that has not happened yet.
    await serve(page, () => ({ body: {
      ...NEW, monitored_not_described: "not a list" } }));
    await page.goto("/bet-suggester");

    // THE BOARD LIVES. This is the assertion the whole test exists for.
    await expect(page.getByTestId("board-rank-heading"))
      .toBeVisible({ timeout: 30_000 });
    await expect(page.locator("main")).toHaveCount(1);
    const chars = await page.evaluate(() => document.body.innerText.length);
    expect(chars, "the page collapsed to a client-side exception")
      .toBeGreaterThan(1000);
    // AND IT IS NOT AN "Application error" page.
    expect(await page.locator("body").innerText())
      .not.toContain("Application error");

    // AND THE SECTION SAYS WHAT HAPPENED RATHER THAN GOING BLANK. A
    // silent blank strip is the exact failure this stage exists to
    // prevent, so a boundary that renders nothing is not an answer.
    const boundary = page.getByTestId("watched-strip-boundary");
    await expect(boundary).toBeVisible();
    await expect(boundary).toContainText("could not be drawn");
    await expect(boundary)
      .toContainText("NOTHING HERE IS A CLAIM ABOUT YOUR WATCHLIST");
    // THE EVIDENCE, VERBATIM — the raised message and nothing invented
    // around it.
    await expect(page.getByTestId("watched-strip-boundary-said"))
      .toContainText("TypeError");
  });

// ================================= 5. one read, for every surface on it

test("the two surfaces that draw this read share ONE poll", async ({ page }) => {
    // MEASURED ON PRODUCTION: WatchedStrip and LiveCard's LiveSection
    // each ran their own 15s timer against the same operator-gated
    // route — two requests per cycle, 2.4s out of phase, ~139KB each.
    // The phase drift is what made the straggler defect visible rather
    // than theoretical, and two independent reads of one moving match
    // were being rendered side by side as one screen.
    test.setTimeout(90_000);
    const hits = await serve(page, () => ({ body: NEW }));
    await page.goto("/bet-suggester");

    // BOTH SURFACES ARE GENUINELY ON SCREEN. Without this the count
    // below could pass because one of them never mounted.
    await expect(section(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("live-section")).toBeVisible();

    // TWO TICKS OF THE CADENCE. One request each, not two.
    await sleep(18_000);
    expect(hits.strip,
      "one read per cycle, however many surfaces draw it")
      .toBeLessThanOrEqual(2);
    expect(hits.strip, "and the poll is still running").toBeGreaterThan(1);

    // AND THE TWO SURFACES ARE DRAWING THE SAME READ, which is the half
    // of this that is not about bandwidth.
    await expect(section(page))
      .toHaveAttribute("data-generated-at", NEW.generated_at);
    await expect(page.getByTestId("live-tape")).toBeVisible();
  });

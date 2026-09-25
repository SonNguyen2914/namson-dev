import { expect, test } from "@playwright/test";
import { armToken, E2E_OPERATOR_TOKEN } from "./operator-token";
// THE STRIP IS SERVED AS `watched-strip-v2` (backend #129). The
// fixtures below stay the shape RECORDED off this route and `toV2`
// applies the route's OWN hoist to them at the serve site, so the
// v2 payload under test is a transformation of a real one rather
// than a v2 shape typed into this file. See e2e/standing.ts.
import { toV2 } from "./standing";

/** The recorded v1 fixture, as the route emits it under v2. A
 *  non-object body (a 404 detail, a string) is served untouched. */
const asV2 = (b: unknown): unknown =>
  b != null && typeof b === "object" && !Array.isArray(b)
    ? toV2(b as object) : b;


// THE AGE OF THE TAPE IS ALSO THE PRESS THAT TAKES A NEW ONE.
//
// Son asked for two things on 2026-09-11: "I want the tape set at 30s
// each to follow the match closer rather than 120", and "with a tape
// button I can tape whenever I want new info" — "you can make the tape
// button with the seconds display right on it". The interval is the
// backend's half. This file is the button's.
//
// WHAT IS AT STAKE HERE, and none of it is pixels:
//
//   - THE AGE IS THE INFORMATION AND THE PRESS IS THE EXTRA. `live-tape`
//     carries the age words and nothing else in every state — no token,
//     in flight, refused. A control that swallowed the readout while it
//     worked would take away the one number that says whether anything
//     on the card is current, at the exact moment the operator asked
//     about it.
//   - A CONTROL THAT CANNOT WORK MUST NOT LOOK AS THOUGH IT COULD. With
//     no operator token held there is no button at all.
//   - A REFUSAL IS A 200 AND IS DRAWN AS AN ANSWER. Pressed inside the
//     backend's own floor the route answers `swept: 0` with a named
//     refusal and `next_allowed_at`. That is the backend saying "I heard
//     you, and it is too soon" — not a failure, and not warn ink.
//   - THE WORDS ARE THE BACKEND'S. Every sentence this control prints
//     came off the wire; the only strings it authors are FIELD NAMES.
//   - A PRESS THAT WROTE A ROW RE-READS. The strip polls on its own 15s
//     timer and the operator pressed because he did not want to wait for
//     it, so the row he just took must appear without one.
//
// HERMETIC. Every route the page touches is served here — the board, the
// review, the watch panel's own read, the strip, and the press — so
// nothing in this file depends on the weather or on a live backend.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

type Page = import("@playwright/test").Page;

// ------------------------------------------------------------- fixtures
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY. Every key below is the one
// api/main.py actually emits — the match block's
// fixture_id / competition_slug / home / away / espn_event_id / state,
// and `_state()`'s own fields. The blocks this file does not exercise
// (the live read, the states, the positions) are left ABSENT rather
// than invented: the card refuses them by name, which is the behaviour
// e2e/live-card.spec.ts already pins.

const LEAGUES = {
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
};

const BOARD = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", days: 7,
  leagues: LEAGUES,
  rows: [{
    refused: false, league: "mls",
    home: "Austin FC", away: "St. Louis City SC",
    favourite: "Austin FC", opponent: "St. Louis City SC",
    fav_side: "home",
    form: { fav: "WWDWW", opp: "LDLLW", scope: "mls", scope_is_cup: false },
    resolution: { "Austin FC": "exact", "St. Louis City SC": "exact" },
    ppg_gap: 1.16, gdg_gap: 1.3, rank_gap: 13,
    gp_current: { home: 26, away: 26, min: 26 },
    venue_class: { class: "DOMESTIC", home_side: "home" },
    src: "current", ranks: { fav: 4, opp: 17 },
    tiers: { ovr: [1, 5], atk: [1, 5], def: [2, 5] },
    tier_gaps: { ovr: 4, atk: 4, def: 3 },
    shape: "CLEAN",
    event_id: "401882901", competition_id: "401882901",
    kickoff: "2026-12-10T20:30:00Z", espn: "usa.1",
  }],
  refusals: [],
};

const REVIEW = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", back: 7,
  window: { from: "20261202", to: "20261209" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

/** One declared match under way, with a tape that read. `generatedAt`
 *  and `capturedAt` are the two clocks the age is the distance between
 *  — never this machine's. */
const strip = (generatedAt: string, capturedAt: string) => ({
  version: "watched-strip-v1",
  generated_at: generatedAt,
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {},
  policy_codes: {},
  matches: [{
    fixture_id: 101, competition_slug: "mls-2026",
    home: "Austin FC", away: "St. Louis City SC",
    espn_event_id: "401882901",
    state: {
      in_play: true, minute: 65, score_home: 2, score_away: 1,
      clock_display: "65'", match_state: "in", refusals: [],
      captured_at: capturedAt,
    },
    positions: [],
  }],
});

/** 21:05:12 against a row taken at 21:05:00 — `tape 12s`. */
const FIRST = strip("2026-12-10T21:05:12Z", "2026-12-10T21:05:00Z");
/** The read AFTER a press wrote a row: 21:06:00 against 21:05:58. */
const AFTER = strip("2026-12-10T21:06:00Z", "2026-12-10T21:05:58Z");

/** A sweep that took a row. */
// THE STAMPS ARE THE WIRE'S, NOT THE BRIEF'S. api/main.py sends
// `utcnow().isoformat()` on a TZ-AWARE datetime, which is
// `2026-12-10T21:05:58.472913+00:00` — microseconds, and a `+00:00`
// offset rather than a `Z`. The brief these fixtures were first written
// against said `Z`, and a fixture that speaks the brief certifies a
// reader that has never met the wire (AGENTS.md, and #57 one payload
// over). `utcClock` slices the clock out of either shape and labels it
// Z because the offset IS zero; with a `Z` fixture nothing here ever
// asked it to.
const SWEPT = {
  swept: 1, rows_written: 1, fixtures: [101],
  refusals: [],
  captured_at: "2026-12-10T21:05:58.472913+00:00",
  min_interval_seconds: 30,
  next_allowed_at: "2026-12-10T21:06:28.472913+00:00",
};

/** THE BACKEND'S OWN SENTENCE for a press made inside the floor —
 *  api/main.py's `too_soon` reason, in its shape. Written here EXACTLY
 *  ONCE and asserted from this constant, so the test proves the
 *  sentence travelled rather than proving that two copies of a string
 *  match. */
const TOO_SOON_REASON =
  "the last press was at 2026-12-10T21:05:47+00:00, 11s ago, and the "
  + "floor is one collector period (30s). NOTHING WAS ASKED OF ANY "
  + "PROVIDER and nothing was written. The next press is allowed at "
  + "2026-12-10T21:06:17+00:00.";

/** 200, `swept: 0`, a named refusal and a stamp. A NORMAL ANSWER.
 *
 *  `too_soon` IS THE CODE, AND `fixture_id` IS NULL. Both are the
 *  route's, checked against api/main.py's `TAPE_NOW_REFUSALS` and its
 *  refusal literal rather than invented here: this fixture said
 *  `min_interval_not_elapsed` with `fixture_id: 101` while the backend
 *  half was still hypothetical, and both were wrong — the first is a
 *  name the registry does not contain, and the second states a match
 *  for an answer that is about the PRESS. `too_soon` is one of three
 *  SLATE-WIDE codes (with `plane_dormant` and
 *  `nothing_declared_in_play`) and every one of them sends null. */
const TOO_SOON = {
  swept: 0, rows_written: 0, fixtures: [],
  refusals: [{ code: "too_soon", fixture_id: null,
               reason: TOO_SOON_REASON }],
  captured_at: "2026-12-10T21:05:58.472913+00:00",
  min_interval_seconds: 30,
  next_allowed_at: "2026-12-10T21:06:17.000000+00:00",
};

/** A PER-FIXTURE REFUSAL, which is the half that DOES name a match.
 *  `row_not_written` is api/main.py's own code for it, and the
 *  `fixture_id` beside it is why the card prints one at all: a sweep
 *  that refused ONE of several declared fixtures has to say which. */
const PARTLY_REFUSED = {
  swept: 2, rows_written: 1, fixtures: [101],
  refusals: [{ code: "row_not_written", fixture_id: 202,
               reason: "the provider answered, the tape read, and the "
                 + "row did not land — nothing was written for this "
                 + "fixture and nothing about it is current" }],
  captured_at: "2026-12-10T21:05:58.472913+00:00",
  min_interval_seconds: 30,
  next_allowed_at: "2026-12-10T21:06:28.472913+00:00",
};

// -------------------------------------------------------------- helpers

const card = (page: Page) =>
  page.locator('[data-testid="live-card"][data-fixture="101"]');
const readout = (page: Page) => card(page).getByTestId("live-tape");
const button = (page: Page) => card(page).getByTestId("live-tape-now");
const said = (page: Page) => card(page).getByTestId("live-tape-said");

/** Every route the page touches.
 *
 *  THE STRIP IS SERVED BY PHASE, NOT BY HIT COUNT. Typing a token
 *  re-runs the section's effect and so costs a read, and so does the
 *  15s poll; a fixture list advanced by hit count would hand the card a
 *  newer tape before the press was ever made, and the re-read test
 *  would pass against a surface that never re-read. The TEST moves the
 *  phase, immediately before the press it is measuring. */
async function serve(page: Page, opts: {
  strips?: unknown[];
  stripStatus?: number;
} = {}) {
  const strips = opts.strips ?? [FIRST];
  const hits = { strip: 0, phase: 0 };
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  // THE COMPETITION RAIL'S OWN READ, which the board makes on every
  // load. Unmocked it left this page at a 502 — a spec reaching a real
  // service for a chip it is not testing, which is the rot §6 of
  // AGENTS.md names. Served empty and deterministic.
  await page.route("**/api/comp/*/fixtures**", (r) =>
    r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/live-watchlist**", (r) =>
    r.fulfill(json({
      version: "watchlist-v1",
      generated_at: "2026-12-10T21:05:12Z",
      monitored_fixture_ids: [], monitored_by_source: {},
      coverage: [], open_positions_not_monitored: [], log: [],
      registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
    })));
  // THE RESOLVER, WHICH IS A DIFFERENT SHAPE AND MUST NOT BE SERVED THE
  // ONE ABOVE. Registered after it so it wins — Playwright matches
  // routes in REVERSE registration order — because `**/live-watchlist**`
  // also matches `/live-watchlist/resolve`, and handing the panel a
  // state payload where it expects `{resolved, notes}` took the whole
  // page down with `Object.entries(undefined)` while this file was
  // being written. A mock that is merely close enough is a spec
  // certifying a reader that cannot read the real thing.
  await page.route("**/api/bet-suggester/live-watchlist/resolve**", (r) =>
    r.fulfill(json({ resolved: {}, notes: {}, asked: 0,
                     unreadable_references: [] })));
  await page.route("**/api/bet-suggester/watched-strip**", (r) => {
    hits.strip += 1;
    const body = strips[Math.min(hits.phase, strips.length - 1)];
    return r.fulfill(json(asV2(body), opts.stripStatus ?? 200));
  });
  return hits;
}

/** WAIT FOR THE READS THE PRESS DID NOT CAUSE.
 *
 *  A TOKEN CHANGE COSTS A READ. lib/watchedStripFeed.ts holds ONE feed
 *  PER TOKEN — a different credential is a different read — so typing
 *  one tears down the anonymous feed and starts a fresh one, and that
 *  first read lands whenever it lands. (Until #58 there were TWO such
 *  reads, one per component, on two timers; the count this waits out
 *  is smaller now and the reason for waiting it out is unchanged.) A
 *  count sampled before it arrives is attributed to the press, which is
 *  how a re-read test passes against a surface that never re-read and
 *  how its control fails against one that behaved perfectly. So the
 *  count is allowed to go quiet first, and only then is the press
 *  measured. Bounded: the poll cadence is the ceiling, and this returns
 *  long before it. */
async function settle(page: Page, hits: { strip: number }) {
  for (let i = 0; i < 10; i += 1) {
    const n = hits.strip;
    await page.waitForTimeout(700);
    if (hits.strip === n) return;
  }
  throw new Error("the strip never stopped being read");
}

/** Type the operator token into the watch panel — the SAME field the
 *  watch toggle uses, and the only place this secret is ever typed.
 *  Shared since 2026-09-25 (e2e/operator-token.ts), and idempotent: the
 *  panel is opened only if it is shut. */
const typeToken = armToken;

/** Load the board, hold the token, and wait for the live section.
 *
 *  THE TOKEN COMES FIRST SINCE AUDIT F4 (2026-09-25). The strip is
 *  operator-only and the frontend no longer asks for it without a token
 *  — every anonymous tab used to poll it every 15s for a certain 403 —
 *  so there is no live section to wait for until one is held. */
async function openBoard(page: Page, token = E2E_OPERATOR_TOKEN) {
  await page.goto("/bet-suggester");
  await typeToken(page, token);
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
  await expect(readout(page)).toHaveText("tape 12s");
}

// ================================================ the readout is the press

test("with no token held there is no button — and no read to press on",
  async ({ page }) => {
    // RESTATED 2026-09-25 (audit F4). This used to assert that an
    // anonymous tab drew the live card with its age and no button. That
    // card was drawn off a read the backend always refuses without a
    // token (a 403, every 15s, from every anonymous tab) — the page no
    // longer makes it, so with no credential there is no card, no age
    // and no control, and the strip is never asked.
    const hits = await serve(page);
    await page.goto("/bet-suggester");
    await page.getByTestId("picker-row").first().waitFor({ timeout: 15_000 });
    await page.waitForTimeout(1_000);
    await expect(button(page)).toHaveCount(0);
    await expect(page.getByTestId("live-section")).toHaveCount(0);
    expect(hits.strip, "an anonymous tab asked for the operator-only strip")
      .toBe(0);

    // NON-VACUITY. Typing the token is the one thing that makes the
    // read, the card, its age and the control exist.
    await typeToken(page);
    await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
    await expect(button(page)).toHaveCount(1);
    await expect(readout(page)).toHaveText("tape 12s");
  });

test("the seconds display IS the button — the age sits inside the "
  + "control, and the control says what pressing it does",
  async ({ page }) => {
    await serve(page);
    await openBoard(page);
    await typeToken(page);
    // Son's shape: not a button beside the number, the number as the
    // button. The readout is a DESCENDANT of the control.
    await expect(button(page).getByTestId("live-tape")).toHaveText("tape 12s");
    // The accessible name says what the press does AND what it is
    // showing — a glyph alone is not in the accessible tree as words.
    await expect(button(page))
      .toHaveAttribute("aria-label", "take a tape row now · tape 12s");
    await expect(button(page)).toBeEnabled();
  });

// ============================================= one token, one header, once

test("the press carries the operator token as ONE header, and nothing "
  + "else that could be a credential", async ({ page }) => {
    const seen: (string | undefined)[] = [];
    const others: string[] = [];
    const verbs: string[] = [];
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**", (r) => {
      const h = r.request().headers();
      seen.push(h["x-admin-token"]);
      for (const k of Object.keys(h)) {
        if (/authorization|cookie|api[-_]?key|token/i.test(k)
            && k !== "x-admin-token") others.push(k);
      }
      verbs.push(r.request().method());
      return r.fulfill(json(SWEPT));
    });
    await openBoard(page);
    await typeToken(page, "the-one-secret");
    await button(page).click();
    await expect.poll(() => seen.length).toBe(1);
    expect(seen[0]).toBe("the-one-secret");
    expect(others).toEqual([]);
    // TAKING A TAPE ROW IS A WRITE, and travels as one.
    expect(verbs).toEqual(["POST"]);
  });

test("a GET on the press route is refused by the proxy — taking a tape "
  + "row is a write", async ({ request }) => {
    // HERMETIC BY CONSTRUCTION: the verb is rejected before any fetch,
    // so this test reaches no backend at all.
    const r = await request.get("/api/bet-suggester/tape-now");
    expect(r.status()).toBe(405);
    expect((await r.json()).error).toContain("is a write");
  });

// ================================================== in flight, said on the
//                                                    control, and once only

test("in flight the control SAYS SO and is disabled, and two presses in "
  + "one tick make one request", async ({ page }) => {
    let release: () => void = () => {};
    const held = new Promise<void>((r) => { release = r; });
    let presses = 0;
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**", async (r) => {
      presses += 1;
      await held;
      return r.fulfill(json(SWEPT));
    });
    await openBoard(page);
    await typeToken(page);
    // NON-VACUITY FOR THE DISABLED ASSERTION BELOW: it is enabled now,
    // so a control that were never disabled would fail the next block.
    await expect(button(page)).toBeEnabled();
    await expect(button(page)).toHaveAttribute("data-flight", "false");

    // TWO CLICKS IN ONE TICK. `disabled` cannot stop this — the second
    // click lands before React has re-rendered — so what is under test
    // is the REF guard inside the press. A guard held in state rather
    // than a ref fires twice here.
    await button(page).evaluate((el: HTMLElement) => {
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
    });

    await expect(button(page)).toHaveAttribute("data-flight", "true");
    await expect(button(page)).toBeDisabled();
    // IN WORDS, ON THE CONTROL — and beside the age, never instead of
    // it.
    await expect(button(page).getByTestId("live-tape-flight"))
      .toHaveText("taping…");
    await expect(readout(page)).toHaveText("tape 12s");

    release();
    await expect(button(page)).toHaveAttribute("data-flight", "false");
    await expect(button(page)).toBeEnabled();
    expect(presses, "two clicks in one tick must make ONE request")
      .toBe(1);
  });

// ==================================================== a press that wrote a
//                                                      row re-reads the strip

test("a press that wrote a row re-reads the strip at once — the operator "
  + "does not wait for the next poll", async ({ page }) => {
    const hits = await serve(page, { strips: [FIRST, AFTER] });
    await page.route("**/api/bet-suggester/tape-now**",
      (r) => r.fulfill(json(SWEPT)));
    await openBoard(page);
    await typeToken(page);
    await settle(page, hits);
    // From here the strip has a NEWER row to give — so the age can only
    // move if something goes and asks for it.
    hits.phase = 1;
    const before = hits.strip;
    await button(page).click();
    // The new row is on the card WELL INSIDE the 15s poll, so what is
    // measured is the press and not the timer.
    await expect(readout(page)).toHaveText("tape 2s", { timeout: 5_000 });
    expect(hits.strip).toBeGreaterThan(before);
  });

test("a press that wrote NOTHING costs no re-read — the strip's read is "
  + "operator-gated and scans the whole table", async ({ page }) => {
    // THE CONTROL FOR THE TEST ABOVE. Without it, that one is satisfied
    // by a card that re-reads on every press, or by the 15s poll
    // landing inside the window — neither of which is the rule.
    const hits = await serve(page, { strips: [FIRST, AFTER] });
    await page.route("**/api/bet-suggester/tape-now**",
      (r) => r.fulfill(json(TOO_SOON)));
    await openBoard(page);
    await typeToken(page);
    await settle(page, hits);
    // A newer row IS waiting, exactly as in the test above — so a card
    // that re-read on every press would show `tape 2s` here and fail.
    hits.phase = 1;
    const before = hits.strip;
    await button(page).click();
    await expect(said(page)).toBeVisible();
    // Same window as the test above, and the age has NOT moved.
    await page.waitForTimeout(3_000);
    expect(hits.strip).toBe(before);
    await expect(readout(page)).toHaveText("tape 12s");
  });

// ====================================================== too soon is an
//                                                        ANSWER, not an error

test("pressed too soon, the card says when the next one is allowed — in "
  + "the backend's own words, and without calling it a failure",
  async ({ page }) => {
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**",
      (r) => r.fulfill(json(TOO_SOON)));
    await openBoard(page);
    await typeToken(page);
    await button(page).click();

    const answer = said(page);
    await expect(answer).toBeVisible();
    // THE BACKEND'S OWN SENTENCE, VERBATIM off the constant the route
    // served — never a paraphrase written on this surface.
    await expect(answer).toContainText(TOO_SOON_REASON);
    // NAMED WITH ITS CODE — the route's own, off `TAPE_NOW_REFUSALS`.
    await expect(answer).toContainText("too_soon");
    // AND WITH NO FIXTURE, BECAUSE THE ANSWER IS ABOUT NO FIXTURE.
    // `too_soon` is slate-wide and ships `fixture_id: null`; a card
    // that filled that in would be naming a match the backend did not.
    // The per-fixture half is the test below.
    await expect(answer).not.toContainText("fixture ");
    // WHEN THE NEXT ONE IS ALLOWED, off the field that carries it, as
    // the backend sent it — the clock sliced out of a `+00:00` stamp
    // with no conversion to this laptop's zone and no countdown against
    // this laptop's clock.
    await expect(answer).toContainText("next_allowed_at 21:06:17Z");
    // AND IT IS NOT AN ERROR. `swept: 0` with a reason is a 200 and the
    // backend answering the question it was asked.
    await expect(answer).toHaveAttribute("data-ok", "true");
    await expect(button(page)).toHaveAttribute("data-answered", "swept");
    // The readout is untouched by any of it.
    await expect(readout(page)).toHaveText("tape 12s");
  });

test("a refusal that IS about a fixture names it — the sweep answers "
  + "for the whole declared set", async ({ page }) => {
    // THE OTHER HALF OF THE NULL ABOVE, and the reason the card prints
    // a fixture at all. api/main.py's per-fixture codes carry an id;
    // a sweep that took one row and refused another has to say WHICH,
    // or one card's answer reads as the whole sweep's.
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**",
      (r) => r.fulfill(json(PARTLY_REFUSED)));
    await openBoard(page);
    await typeToken(page);
    await button(page).click();
    const answer = said(page);
    await expect(answer).toBeVisible();
    await expect(answer).toContainText("swept 2");
    await expect(answer).toContainText("1 rows written");
    await expect(answer).toContainText("row_not_written");
    // 202 is NOT the card this press was made on (101). The answer is
    // the SWEEP's, so it names a fixture this card does not draw.
    await expect(answer).toContainText("fixture 202");
    // Still an answer, still plain ink.
    await expect(answer).toHaveAttribute("data-ok", "true");
  });

test("the cadence floor is READ off the answer, never typed on this "
  + "surface", async ({ page }) => {
    // The collector's period moved from 120s to 30s on 2026-09-11 and
    // can move again with an env value. Two presses, two different
    // floors, one surface: a number typed into this repo fails here.
    const floors = [30, 45];
    let n = 0;
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**", (r) => {
      const min = floors[Math.min(n, floors.length - 1)];
      n += 1;
      return r.fulfill(json({ ...TOO_SOON, min_interval_seconds: min }));
    });
    await openBoard(page);
    await typeToken(page);
    await button(page).click();
    await expect(said(page)).toContainText("min interval 30s");
    await button(page).click();
    await expect(said(page)).toContainText("min interval 45s");
    // and never the number this repo used to have written down
    await expect(said(page)).not.toContainText("120s");
  });

test("a sweep that took rows says what it took, and dates itself",
  async ({ page }) => {
    await serve(page, { strips: [FIRST, AFTER] });
    await page.route("**/api/bet-suggester/tape-now**",
      (r) => r.fulfill(json(SWEPT)));
    await openBoard(page);
    await typeToken(page);
    await button(page).click();
    const answer = said(page);
    await expect(answer).toContainText("swept 1");
    await expect(answer).toContainText("1 rows written");
    // SELF-DATING, so it cannot be misread as current five minutes
    // later: the answer names the instant it describes.
    await expect(answer).toContainText("captured_at 21:05:58Z");
    await expect(answer).toHaveAttribute("data-ok", "true");
  });

// ================================================ a failure is named, and
//                                                  the gate is not said twice

test("an answer that is not a sweep report is NAMED BY ITS CODE, and "
  + "takes the warn ink a refusal does not", async ({ page }) => {
    await serve(page);
    await page.route("**/api/bet-suggester/tape-now**", (r) =>
      r.fulfill(json({
        error: "proxy_unreachable",
        detail: "the sweep's backend was never reached, so no tape was "
          + "taken and there is no answer to relay — this is not a "
          + "refusal and not a sweep that swept nothing",
      }, 502)));
    await openBoard(page);
    await typeToken(page);
    await button(page).click();
    const answer = said(page);
    await expect(answer).toContainText("proxy_unreachable");
    await expect(answer).toContainText("never reached");
    // THE ONE PLACE THE TWO ARE TOLD APART. A refusal is an answer and
    // is drawn plain; this is a read that did not happen.
    await expect(answer).toHaveAttribute("data-ok", "false");
    await expect(button(page)).toHaveAttribute("data-answered", "failed");
  });

test("on a 403 the card says so ITSELF, now that nothing else on the page "
  + "does", async ({ page }) => {
    await serve(page);
    /* THE PREMISE OF THIS GUARD CHANGED, SO THE GUARD DID (2026-09-15).
       It used to assert SILENCE here, and the reason was sound while it
       held: WatchedStrip was mounted on this same page, against this same
       gate, with this same token, and drew the refusal with its status.
       Saying it again would have been the operator reading one fact
       twice.

       The strip came off the landing page. The silence outlived its
       reason, and an operator whose token is refused pressed a button and
       read NOTHING — the blank that says "nothing is live" when what
       happened is "you were not allowed to ask". A suppression that
       depends on a neighbour has to die with the neighbour.

       So a 403 is now named here like every other answer. If the strip is
       ever mounted beside this again, the duplication will be VISIBLE —
       which is the failure worth having, against a silence that is not. */
    await page.route("**/api/bet-suggester/tape-now**", (r) =>
      r.fulfill(json({ detail: "operator credentials required" }, 403)));
    await openBoard(page);
    await typeToken(page);
    await button(page).click();
    await expect(button(page)).toHaveAttribute("data-answered", "failed");
    const answer = said(page);
    await expect(answer).toHaveCount(1);
    await expect(answer).toContainText("the press answered 403");
    await expect(answer).toContainText("operator credentials required");
    // a refusal is an ANSWER — it is not the read-never-happened case
    await expect(answer).toHaveAttribute("data-ok", "false");

    // AND 401 IS THE SAME FACT, not a second silence hiding behind the
    // first: the two statuses were suppressed together and must speak
    // together.
    await page.route("**/api/bet-suggester/tape-now**", (r) =>
      r.fulfill(json({ detail: "operator credentials required" }, 401)));
    await button(page).click();
    await expect(said(page)).toContainText("the press answered 401");
  });

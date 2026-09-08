import { expect, test } from "@playwright/test";

// THE LIVE SECTION — the cards for matches under way, above the ranked
// board on /bet-suggester (components/LiveCard.tsx).
//
// Hermetic: every test serves a recorded SHAPE of
// GET /api/bet-suggester/watched-strip plus the board and review reads
// the page makes anyway, so none of it depends on the weather.
//
// FIXTURES SPEAK THE PROVIDER'S VOCABULARY. Every key below is the one
// the backend actually emits — `api/main.py`'s match block
// (fixture_id / competition_slug / home / away / espn_event_id / state /
// coverage / read / positions) and `_state()`'s own fields — and the
// live-read components carry their value under `value_key`, which is
// where the backend puts it, not under the component's own name. A
// fixture written in the code's vocabulary would certify a reader that
// cannot read the real payload; this repo has been burnt by exactly
// that once already.
//
// WHAT IS AT STAKE, and it is not pixels:
//
//   - THE AGE OF THE TAPE IS ALWAYS THERE. The provider's minute keeps
//     looking healthy after a feed stops, so the age is the one number
//     that says whether anything below it is current. A card without it
//     is making a claim it cannot support, so the slot is never blank —
//     a fixture with no readable tape says so IN THAT SLOT.
//   - A FAILED READ IS NEVER A ZERO AND NEVER AN EMPTY. A tape that
//     could not be read must not render as 0–0 at 0', and must not
//     quietly drop the card out of the section either: `state.in_play`
//     is FAIL-CLOSED false on a failed read, so filtering on it alone
//     would delete exactly the fixtures whose state is unknown.
//   - THE DRAW LABEL IS PLACED BY MEASUREMENT, NOT BY A THRESHOLD. The
//     same 2% fits on a wide card and does not on a narrow one, so a
//     percentage typed as a cut-off would be wrong on one of them.
//   - THE FLIP TURNS ONE BLOCK. The scoreboard, the tape age and the
//     position stay put; only `live stats` turns, and its back is the
//     RANKED BOARD'S OWN COMPONENTS — same testids, because it is
//     literally the same component (PickerColumn.RowRead), not a
//     second layout for one read.
//   - NOTHING HERE IS RANKED, and the section says so.

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// ------------------------------------------------------------- board
//
// The rows the live cards JOIN to, on espn_event_id → event_id. The
// prematch face renders the board's own card off exactly these.

const LEAGUES = {
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
  epl: { src: "current", min_current_gp: 12, clubs: 20 },
  laliga: { src: "current", min_current_gp: 12, clubs: 20 },
  ligamx: { src: "current", min_current_gp: 12, clubs: 18 },
};

function boardRow(over: Record<string, unknown> = {}) {
  return {
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
    kalshi: {
      event_ticker: "KXMLSGAME-SAMPLE-ATX",
      ticker: "KXMLSGAME-SAMPLE-ATX-ATX",
      ask_c: 59, bid_c: 58, spread_c: 1,
      ask_size: 83812, bid_size: 4100, flags: [],
    },
    ...over,
  };
}

const BOARD = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", days: 7,
  leagues: LEAGUES,
  rows: [boardRow()],
  refusals: [],
};

const REVIEW = {
  generated_at: "2026-12-09T12:00:00Z",
  date: "20261209", back: 7,
  window: { from: "20261202", to: "20261209" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

// ------------------------------------------------------- the payload
//
// The prose the backend attaches to every component, verbatim — the
// sentence that forbids a tilt is the reason the dynamics block refuses,
// so the fixture has to carry it or the test would prove nothing.
const NO_COMPOSITE =
  "NO COMPOSITE BEFORE M1: the weights have not been fitted, and a "
  + "number made out of these four would be a claim.";

function component(key: string, value: number | null, unit: string,
                   kind: string) {
  const valueKey = `${key}_${kind === "level" ? "percent" : "per_90"}`;
  return {
    component: key, component_key: key,
    value_key: valueKey,
    [valueKey]: value,
    kind, unit,
    kind_meaning: kind === "rate"
      ? "an amount per unit of match time" : "a level, not an amount",
    meaning: `${key} — persisted at the tick, decaying`,
    observed_seconds: 1440.0, observed_intervals: 12,
    note: null,
    no_composite_before_m1: NO_COMPOSITE,
  };
}

function side(name: string, mult = 1) {
  return {
    side: name,
    captured_at: "2026-12-10T21:05:00Z",
    live_stat_snapshot_id: 9001,
    half_life_seconds: 600.0,
    observed_since: "2026-12-10T20:30:00Z",
    observed_from_kickoff: true,
    state: {
      side: name, minute: 65, score_home: 2, score_away: 1,
      goal_difference: name === "home" ? 1 : -1,
      score_state: name === "home" ? "leading" : "trailing",
      conditionable: true,
      read_version: "live-read-components-v1",
      half_life_seconds: 600.0, observed_from_kickoff: true,
      baseline_is_not_built:
        "the baseline this read owes a comparison to is not built",
    },
    components: {
      shot_read: component("shot_read", 14.2 * mult,
        "shots per 90 match-minutes", "rate"),
      on_target_read: component("on_target_read", 5.6 * mult,
        "shots on target per 90 match-minutes", "rate"),
      corner_read: component("corner_read", 3.1 * mult,
        "corners per 90 match-minutes", "rate"),
      possession_read: component("possession_read", name === "home" ? 58.4 : 41.6,
        "percent of possession", "level"),
    },
    basis: "shot=12i/1440s on_target=12i/1440s corner=12i/1440s",
  };
}

const COVERAGE = {
  monitored: true, complete_history: true,
  history: "declared before kickoff",
  no_history_is_not_quiet:
    "NO HISTORY IS NOT A QUIET MATCH: a decaying read that starts at "
    + "zero at minute 63 is arithmetically indistinguishable from a side "
    + "that had done nothing for an hour, and they are different matches.",
};

/** The clean case: in play, both sides read, a position held. */
function liveMatch(over: Record<string, unknown> = {}) {
  return {
    fixture_id: 101, competition_slug: "mls-2026",
    home: "Austin FC", away: "St. Louis City SC",
    espn_event_id: "401882901",
    state: {
      in_play: true, minute: 65, score_home: 2, score_away: 1,
      clock_display: "65'", match_state: "in", refusals: [],
      captured_at: "2026-12-10T21:05:00Z",
    },
    coverage: COVERAGE,
    read: {
      version: "live-read-v1", read_version: "live-read-components-v1",
      fixture_id: 101, monitored: true, coverage: COVERAGE,
      components_registry: {}, kinds: {},
      sides: { home: side("home"), away: side("away", 0.6) },
    },
    positions: [{
      journal_entry: { bet_id: 41, outcome_key: "home_win" },
      position: {
        outcome_key: "home_win", side: "home", size: "100",
        entry_price: 0.46, entry_cost_dollars: "46.00",
        entry_note: "THE ENTRY IS SUNK",
      },
      value_now_cents: 7784.0,
      certainty_premium: { applies: true, sell: { bid_cents: 77 } },
      exit_is_obtainable: { obtainable: true },
    }],
    ...over,
  };
}

/** A declared fixture whose tape read FAILED — `api/main.py`'s own
 *  `_state` under `tape_failed`: every field withdrawn, `in_play`
 *  FAIL-CLOSED false, one coded refusal. */
const TAPE_FAILED = {
  fixture_id: 606, competition_slug: "mls-2026",
  home: "Portland Timbers", away: "Vancouver Whitecaps",
  espn_event_id: "401882999",
  state: {
    in_play: false, minute: null, score_home: null, score_away: null,
    clock_display: null, match_state: null, captured_at: null,
    refusals: [{ code: "tape_unreadable",
      refused: "tape_unreadable: the state-tape read for this response "
        + "FAILED (OperationalError), so nothing above was read: "
        + "`in_play` is FAIL-CLOSED false and is not a measurement." }],
    basis: "NO STATE WAS READ FOR THIS RESPONSE. Every field above is "
      + "withdrawn, not measured.",
  },
  coverage: COVERAGE,
  read: { version: "live-read-v1", fixture_id: 606, monitored: true,
          coverage: COVERAGE, components_registry: {}, kinds: {},
          sides: {},
          words: "no component read has been persisted for this fixture" },
  positions: [],
};

const ENVELOPE = {
  version: "watched-strip-v1",
  generated_at: "2026-12-10T21:05:12Z",
  monitored_by_source: { manual: [101] },
  open_positions_not_monitored: [],
  refusal_codes: {},
  policy_codes: {},
};

const STRIP = { ...ENVELOPE, matches: [liveMatch()] };

// ------------------------------------------------------------- helpers

type Page = import("@playwright/test").Page;

/** ONE LIVE CARD, BY FIXTURE — SCOPED TO THE LIVE SECTION. The watched
 *  strip renders on the same page and stamps `data-fixture` on its own
 *  rows, so a bare attribute selector resolves to two elements and
 *  Playwright's strict mode fails on the collision. Which is the useful
 *  failure: the two surfaces really do describe the same fixture, and a
 *  spec that matched either at random would prove nothing about this one. */
const liveCard = (page: Page, id: number | string) =>
  page.locator(`[data-testid="live-card"][data-fixture="${id}"]`);

async function open(page: Page, strip: unknown, board = BOARD) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**",
    (r) => r.fulfill(json(strip)));
  await page.goto("/bet-suggester");
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
}

// ================================================================ tape

test("the age of the tape is on every card, always", async ({ page }) => {
  await open(page, { ...STRIP, matches: [liveMatch(), TAPE_FAILED] });
  const cards = page.getByTestId("live-card");
  await expect(cards).toHaveCount(2);
  // EVERY card carries the slot, and none of them is blank — derived
  // from the cards actually drawn, never from a hand-typed count.
  const n = await cards.count();
  for (let i = 0; i < n; i += 1) {
    const tape = cards.nth(i).getByTestId("live-tape");
    await expect(tape).toBeVisible();
    expect((await tape.innerText()).trim()).not.toBe("");
  }
  // The read that landed says its age, measured against the envelope's
  // own generated_at (21:05:12 − 21:05:00) and not this machine's clock.
  await expect(liveCard(page, 101).getByTestId("live-tape"))
    .toHaveText("tape 12s");
});

test("a tape that could not be read says so IN THE AGE SLOT, and is "
  + "never a zero and never an empty", async ({ page }) => {
  await open(page, { ...ENVELOPE, matches: [TAPE_FAILED] });
  const card = liveCard(page, 606);
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-tape", "failed");
  await expect(card.getByTestId("live-tape")).toHaveText("tape read failed");

  // NEVER A ZERO. The score and the minute are withdrawn, not floored:
  // 0–0 at 0' is a claim about a match nobody could look at.
  await expect(card.getByTestId("live-score")).toHaveText("—");
  await expect(card.getByTestId("live-minute")).toHaveText("no minute");

  // NEVER AN EMPTY. `in_play` is FAIL-CLOSED false on a failed read, so
  // a section filtering on it alone would have deleted this card
  // outright — which reads as "no such match is live", the one
  // conclusion this payload cannot support.
  await expect(page.getByTestId("live-card")).toHaveCount(1);

  // And no stat bar is drawn off a read that did not happen.
  await expect(card.getByTestId("live-stat")).toHaveCount(0);
  await expect(card.getByTestId("live-stats-absent")).toBeVisible();
});

// ================================================== the flip, and what
//                                                     it does NOT turn

test("the flip turns the stats block ONLY — the scoreboard, the tape "
  + "age and the position stay put", async ({ page }) => {
  await open(page, STRIP);
  const card = liveCard(page, 101);

  // WHERE THE HEAD SITS IN ITS OWN CARD, not where it sits on the page.
  // The watched strip above this section polls on its own clock and
  // changes height as it settles, so a page coordinate measured here
  // and again after the click compares two different page layouts and
  // fails for a reason that has nothing to do with the flip. "Stays
  // put" is a claim about the CARD: the scoreboard does not move
  // relative to the card it heads, whichever face is showing.
  const head = card.getByTestId("live-head");
  const offsetInCard = async () => {
    const h = await head.boundingBox();
    const c = await card.boundingBox();
    return { dy: h!.y - c!.y, w: Math.round(h!.width) };
  };
  const before = await offsetInCard();
  await expect(card.getByTestId("live-face-stats")).toBeVisible();
  await expect(card.getByTestId("live-stat")).toHaveCount(4);

  await card.getByTestId("live-flip").click();
  await expect(card).toHaveAttribute("data-flipped", "true");

  // THE STATS TURNED.
  await expect(card.getByTestId("live-face-prematch")).toBeVisible();
  await expect(card.getByTestId("live-face-stats")).not.toBeVisible();

  // NOTHING ELSE DID. The score, the minute and the tape age are the
  // three facts that cannot wait for a flip, and the position is the
  // other thing you cannot lose mid-match.
  await expect(head).toBeVisible();
  await expect(card.getByTestId("live-score")).toHaveText("2–1");
  await expect(card.getByTestId("live-tape")).toHaveText("tape 12s");
  await expect(card.getByTestId("live-position")).toBeVisible();
  expect(await offsetInCard()).toEqual(before);

  await card.getByTestId("live-unflip").click();
  await expect(card).toHaveAttribute("data-flipped", "false");
  await expect(card.getByTestId("live-face-stats")).toBeVisible();
});

test("the prematch face is the RANKED BOARD'S OWN CARD, not a second "
  + "layout for one read", async ({ page }) => {
  await open(page, STRIP);
  const card = liveCard(page, 101);
  await card.getByTestId("live-flip").click();
  const back = card.getByTestId("live-face-prematch");

  // These testids belong to PickerColumn/PickerRead and are asserted by
  // e2e/picker.spec.ts against the columns below. Finding them here is
  // the proof that the flip renders THE SAME COMPONENTS rather than a
  // hand-copied lookalike free to drift from them.
  await expect(back.getByTestId("row-anchor")).toBeVisible();
  await expect(back.getByTestId("row-anchor")).toHaveText(/1\.30/);
  await expect(back.getByTestId("rank-dumbbell")).toHaveCount(1);
  await expect(back.getByTestId("form-strip")).toHaveCount(2);
  await expect(back.getByTestId("home-badge")).toHaveText("H");
  await expect(back.getByTestId("shape-chip")).toHaveText("CLEAN");
  // Stage 1, in the board's own words, and the book beneath it.
  await expect(back).toContainText("#4 v #17");
  await expect(back).toContainText("ask 59¢");

  // NO SEASON BADGE ON ANY CARD — the league header carries the basis,
  // and it is one sentence about a league, not a fact about a fixture.
  await expect(card.getByTestId("season-weight")).toHaveCount(0);

  // The columns below are untouched: their own cards still render, and
  // the live card is not one of them.
  await expect(page.getByTestId("picker-row")).toHaveCount(1);
});

// ============================================ the draw label, MEASURED

/** A model/market pair on the match block. No recorded response off this
 *  route carries one — the block refuses on the real board — so the
 *  bars, and the measurement that places their draw label, are exercised
 *  against a payload that does. */
function withTriples(model: number[], market: number[]) {
  return liveMatch({
    model_v_market: {
      model: { home: model[0], draw: model[1], away: model[2] },
      market: { home: market[0], draw: market[1], away: market[2] },
      side: "home",
    },
  });
}

test("a draw wide enough for its own label keeps it INSIDE the segment; "
  + "one that is not takes a chip — decided by measuring, not by a "
  + "typed percentage", async ({ page }) => {
  // A 27% draw on a four-up card is comfortably wider than "27%".
  await open(page, {
    ...ENVELOPE, matches: [withTriples([58, 27, 15], [57, 26, 17])],
  });
  const card = liveCard(page, 101);
  const labels = card.getByTestId("live-draw-label");
  await expect(labels).toHaveCount(2);
  await expect(labels.first()).toHaveAttribute("data-fit", "inside");

  // THE SAME CARD, THE SAME WIDTH, A NARROWER DRAW. 1% of the track is
  // about two pixels and the label needs about twenty-two, so it cannot
  // sit inside its own segment and takes the chip instead. Nothing in
  // the component was told that 1 is small: the label's rendered width
  // was compared against its rendered segment.
  await page.unroute("**/api/bet-suggester/watched-strip**");
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json({
      ...ENVELOPE, matches: [withTriples([97, 1, 2], [96, 2, 2])],
    })));
  await page.reload();
  await page.getByTestId("live-section").waitFor();
  const narrow = liveCard(page, 101)
    .getByTestId("live-draw-label").first();
  await expect(narrow).toHaveAttribute("data-fit", "chip");

  // AND IT IS CLAMPED INSIDE THE TRACK. A narrow draw near an end must
  // not hang off the edge of the card.
  const bar = liveCard(page, 101)
    .getByTestId("live-price-bar").first();
  const track = await bar.locator("div.relative").boundingBox();
  const box = await narrow.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(track!.x - 1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(track!.x + track!.width + 1);
});

test("ONE PERCENTAGE, TWO VERDICTS: the same draw sits inside its "
  + "segment on a one-up card and takes the chip on a four-up one",
  async ({ page }) => {
    // THIS IS THE WHOLE ARGUMENT FOR MEASURING. Any percentage typed
    // into the component as a cut-off would have to be right at both of
    // these widths, and 9% is a counter-example: on a phone the section
    // is one column and the track is wide enough to hold "9%"; at
    // desktop the board's own four columns leave a track a fraction of
    // that, and the same 9% cannot. A component that decided from the
    // number alone would give one of these two the wrong answer, and
    // this test is what fails when somebody replaces the measurement
    // with a threshold.
    await open(page, {
      ...ENVELOPE, matches: [withTriples([58, 9, 33], [57, 10, 33])],
    });
    const label = () => liveCard(page, 101)
      .getByTestId("live-draw-label").first();

    // FOUR-UP, at the desktop viewport this suite runs: too narrow.
    await expect(label()).toHaveAttribute("data-fit", "chip");

    // ONE-UP, at a phone width: the same 9%, now wide enough — and the
    // component re-measured to get here, because nothing about the
    // payload changed.
    await page.setViewportSize({ width: 400, height: 900 });
    await expect(label()).toHaveAttribute("data-fit", "inside");

    // And back, so the re-measure is proven in both directions rather
    // than once in the direction that happens to work.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(label()).toHaveAttribute("data-fit", "chip");
  });

test("a percentage above zero that rounds to zero reads <1%, never 0%",
  async ({ page }) => {
    await open(page, {
      ...ENVELOPE, matches: [withTriples([99.4, 0.4, 0.2], [99, 0.6, 0.4])],
    });
    const card = liveCard(page, 101);
    await expect(card.getByTestId("live-draw-label").first())
      .toHaveText("<1%");
    await expect(card.getByTestId("live-price-bar").first())
      .not.toContainText("0%");
  });

// ================================================ refusals, not blanks

test("the blocks this payload cannot fill REFUSE BY NAME — and a "
  + "refusal that had to be made is not drawn like a routine absence",
  async ({ page }) => {
    await open(page, STRIP);
    const card = liveCard(page, 101);

    // A TILT IS A COMPOSITE AND THE READ FORBIDS IT, in the backend's
    // own sentence. Somebody decided that, so it gets the band.
    const tilt = card.getByTestId("live-tilt-refused");
    await expect(tilt).toContainText("NO COMPOSITE BEFORE M1");
    await expect(tilt).toHaveAttribute("data-absence", "refused");

    // NO MODEL TRIPLE AND NO DE-VIGGED BOOK on this read — a normal
    // night, so a quiet line, and NO BAR drawn off half a comparison.
    const model = card.getByTestId("live-model-absent");
    await expect(model).toHaveAttribute("data-absence", "routine");
    await expect(card.getByTestId("live-price-bar")).toHaveCount(0);
    await expect(card.getByTestId("live-gap")).toHaveCount(0);

    // THE CAVEAT IS NOT OPTIONAL. It is the literal truth of
    // state_probabilities(minute, score, λ): the model never sees the
    // four component reads drawn above it.
    await expect(card.getByTestId("live-caveat"))
      .toHaveText(/minute and score only.*de-vigged book/);

    // NO CARD COUNT IS ON THIS PAYLOAD, and the line says so rather
    // than disappearing — a missing card row reads as a match with no
    // cards in it, which is a claim.
    await expect(card.getByTestId("live-cards-absent"))
      .toHaveAttribute("data-absence", "routine");
  });

test("a dismissal is a refusal that had to be MADE, and takes the band",
  async ({ page }) => {
    const dismissed = liveMatch({
      fixture_id: 202,
      positions: [{
        position: { outcome_key: "home_win", side: "home", size: "100",
          entry_price: 0.46, entry_cost_dollars: "46.00",
          entry_note: "sunk" },
        red_card_void: { refusal_code: "dismissal",
          refused: "dismissal: a red card has been seen — every "
            + "grid-derived number voids from first sighting" },
      }],
    });
    await open(page, { ...ENVELOPE, matches: [dismissed] });
    const band = liveCard(page, 202)
      .getByTestId("live-dismissal");
    await expect(band).toHaveAttribute("data-absence", "refused");
    await expect(band).toContainText("a red card has been seen");
    await expect(liveCard(page, 202)
      .getByTestId("live-cards-absent")).toHaveCount(0);
  });

// ============================================== the section's own rules

test("the section says nothing in it is ranked, and prints no rank on "
  + "any card", async ({ page }) => {
  await open(page, STRIP);
  await expect(page.getByTestId("live-not-ranked"))
    .toContainText("nothing here is ranked");
  // The ranked board prints 01/02/03 down each column; a live card
  // printing one would be a number a reader is entitled to read as an
  // order, in a section that has just said there is none.
  await expect(page.getByTestId("live-card").getByTestId("row-rank"))
    .toHaveCount(0);
});

test("a ninth live match starts a second page, ordered by kickoff, and "
  + "the page a reader is on survives a poll", async ({ page }) => {
  // Nine, with kickoffs DESCENDING in the payload so a section that
  // drew them in arrival order would fail this.
  const nine = Array.from({ length: 9 }, (_, i) => liveMatch({
    fixture_id: 900 + i,
    espn_event_id: `evt-${9 - i}`,
    home: `Home ${9 - i}`, away: `Away ${9 - i}`,
  }));
  const rows = Array.from({ length: 9 }, (_, i) => boardRow({
    event_id: `evt-${i + 1}`,
    favourite: `Home ${i + 1}`, opponent: `Away ${i + 1}`,
    home: `Home ${i + 1}`, away: `Away ${i + 1}`,
    kickoff: `2026-12-10T${String(12 + i).padStart(2, "0")}:00:00Z`,
  }));
  // COUNT THE POLLS. Asserting the page is still 2 without waiting for
  // a poll to actually land proves nothing: the attribute is already 2
  // and the assertion passes on the first tick. The counter makes the
  // wait REAL — the test does not move on until the section has re-read
  // the endpoint at least twice.
  let polls = 0;
  await page.route("**/api/bet-suggester/watched-strip**", (r) => {
    polls += 1;
    return r.fulfill(json({ ...ENVELOPE, matches: nine }));
  });
  await page.route("**/api/picker/board**",
    (r) => r.fulfill(json({ ...BOARD, rows })));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.goto("/bet-suggester");
  await page.getByTestId("live-section").waitFor({ timeout: 15_000 });

  const section = page.getByTestId("live-section");
  await expect(section).toHaveAttribute("data-pages", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(8);
  // KICKOFF ORDER, NOT ARRIVAL ORDER: the earliest kickoff is first.
  await expect(page.getByTestId("live-card").first())
    .toContainText("Home 1");

  // A NINTH STARTS PAGE TWO rather than a third row.
  await page.getByTestId("live-page").nth(1).click();
  await expect(section).toHaveAttribute("data-page", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(1);
  await expect(page.getByTestId("live-card")).toContainText("Home 9");

  // AND THE PAGE SURVIVES A POLL. The section re-reads every 15s; a
  // reader walked back to page one mid-read loses their place for a
  // reason that has nothing to do with the match. WatchedStrip polls
  // the same endpoint on the same clock, so the counter climbs by two
  // per tick; waiting for it to pass the first response is enough to
  // guarantee at least one re-read has been applied to this section.
  const seen = polls;
  await expect.poll(() => polls, { timeout: 30_000 })
    .toBeGreaterThan(seen);
  await expect(section).toHaveAttribute("data-page", "2");
  await expect(page.getByTestId("live-card")).toHaveCount(1);
  await expect(page.getByTestId("live-card")).toContainText("Home 9");
});

test("the live section is ABOVE the ranked board and outside it",
  async ({ page }) => {
    await open(page, STRIP);
    const order = await page.evaluate(() => {
      const live = document.querySelector('[data-testid="live-section"]');
      const board = Array.from(document.querySelectorAll("h2"))
        .find((h) => h.textContent?.includes("Ranked by table gap"));
      if (!live || !board) return null;
      return {
        before: !!(live.compareDocumentPosition(board)
          & Node.DOCUMENT_POSITION_FOLLOWING),
        nested: live.contains(board) || board.contains(live),
      };
    });
    expect(order).toEqual({ before: true, nested: false });
  });

test("nothing is drawn at all when no declared match is under way",
  async ({ page }) => {
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
    await page.route("**/api/bet-suggester/watched-strip**", (r) =>
      r.fulfill(json({ ...ENVELOPE, matches: [] })));
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("picker-row").first()).toBeVisible();
    // ABSENT, NOT EMPTY: an empty frame headed "Under way" reads as a
    // claim that nothing is, and this read did not say that.
    await expect(page.getByTestId("live-section")).toHaveCount(0);
  });

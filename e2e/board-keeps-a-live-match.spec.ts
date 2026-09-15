import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
// THE ABSENT-CLOCK WORDS ARE THE READER'S, never typed here — the same
// rule e2e/live-card.spec.ts follows, and for the same reason: a fixture
// speaking the guard's vocabulary rather than the surface's is how
// twelve green tests once certified a venue bug.
import { BOARD_CLOCK_ABSENT } from "../src/components/PickerRead";
import { toV2 } from "./standing";

/* A MATCH KEEPS ITS PLACE ON THE BOARD WHEN IT KICKS OFF.
 *
 * The operator, 2026-09-14, after watching León v Atlético de San Luis
 * leave the board at kickoff:
 *
 *   "when a match is inplay:
 *    1. if not chosen to watch live: still show it in its match card
 *       spot and instead of showing the kickoff date and time, shows
 *       live with minute just like the live cards.
 *    2. If chosen to watch live: live both in the match cards spot and
 *       the live match section, and says live with minute just like the
 *       live cards"
 *
 * WHAT CAME BEFORE, AND WHY IT WAS NOT ENOUGH. `board.
 * fixtures_from_scoreboard` defaulted to `states=("pre",)`, so a fixture
 * left the board at kickoff; on 2026-09-10 that was made VISIBLE — an
 * `off_board` entry naming the match and where it had gone. The surface
 * it pointed at is behind `x-admin-token`, so for a reader without one
 * the match was still nowhere. Being told where a match went is not the
 * same as the match still being there.
 *
 * WHAT IS AT STAKE HERE, and none of it is pixels:
 *
 *   - THE CARD DOES NOT MOVE. Same column, same rank, same contract
 *     keys. Only the date cell changes.
 *   - ONE CLOCK READER, NOW ON THREE SURFACES. The strip printed 45'
 *     over a card printing 45'+5' for one match on one screen
 *     (2026-09-11) because each had its own precedence.
 *     `lib/suggesterApi.readMatchClock` is the only place any of them
 *     learns what a clock says, and this board is the third to use it.
 *   - AN IN-PLAY ROW WITH NO CLOCK SAYS SO. Never a stale kickoff time,
 *     never a blank, never minute 0 — the collector going quiet is a
 *     fact about our coverage, not about the match.
 *   - A LIVE MINUTE DOES NOT MAKE THE NUMBERS LIVE. Every figure on the
 *     card is still the pre-kickoff read.
 *
 * FIXTURES SPEAK THE WIRE'S VOCABULARY. Every key below is one
 * `src/picker/board.py` actually emits, read off an assembled payload:
 * `state` (the provider's token), `in_play` (the backend's own
 * derivation off `board.IN_PLAY_STATES`) and `live` ({in_play, read_at,
 * window_seconds, row_age_seconds, clock, absent, basis}), whose `clock`
 * carries ESPN's `clock_display` beside the integer `patterns._minute`
 * parsed out of it.
 *
 * Hermetic: the board, the review and the watched strip are all served
 * from here. Nothing reaches a backend.
 */

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const LEAGUES = {
  epl: { src: "current", min_current_gp: 12, clubs: 20 },
  laliga: { src: "current", min_current_gp: 12, clubs: 20 },
  mls: { src: "current", min_current_gp: 21, clubs: 30 },
  ligamx: { src: "current", min_current_gp: 12, clubs: 18 },
};

/** One matchday, fixed, so the day-major board cannot straddle midnight
 *  and reorder itself between runs. */
const KICKOFF = "2026-12-10T20:30:00Z";

/** `live`, as the assembler emits it. `read_at` is the board's own clock
 *  for the tape read — not the viewer's — and either `clock` or `absent`
 *  is set, never both and never neither. */
function liveBlock(over: Record<string, unknown> = {}) {
  return {
    in_play: true,
    read_at: "2026-12-10T21:16:00Z",
    window_seconds: 600,
    row_age_seconds: 42.0,
    clock: {
      // ESPN's own stoppage spelling, and the integer parsed out of it.
      // The pair is the whole point: one surface preferring the parse
      // and another the source is the 2026-09-11 defect.
      minute: 45, clock_display: "45'+5'",
      score_home: 2, score_away: 1,
      status_detail: "HT", period: "stopped",
      period_basis: "the tape's status detail is 'HT'",
      match_state: "in",
      captured_at: "2026-12-10T21:15:18Z",
    },
    absent: null,
    basis: "WHERE THE MATCH IS, off the live plane's state tape. "
      + "THE MATCH IS LIVE; THE NUMBERS ARE NOT.",
    ...over,
  };
}

function row(over: Record<string, unknown> = {}) {
  return {
    refused: false, league: "ligamx",
    home: "Leon", away: "Atletico de San Luis",
    favourite: "Leon", opponent: "Atletico de San Luis",
    fav_side: "home",
    resolution: { Leon: "exact", "Atletico de San Luis": "exact" },
    ppg_gap: 0.9, gdg_gap: 1.4, rank_gap: 8,
    gp_current: { home: 12, away: 12, min: 12 },
    venue_class: { class: "DOMESTIC", home_side: "home" },
    src: "current", ranks: { fav: 2, opp: 10 },
    tiers: { ovr: [1, 4], atk: [1, 4], def: [2, 4] },
    tier_gaps: { ovr: 3, atk: 3, def: 2 },
    shape: "CLEAN",
    event_id: "401882950", competition_id: "401882950",
    kickoff: KICKOFF, espn: "mex.1", kalshi: null,
    state: "pre", in_play: false,
    ...over,
  };
}

/** The in-play row: the SAME fixture the operator watched vanish, with
 *  the widest gap on the board so its position is a real assertion. */
const LIVE_ROW = row({
  event_id: "401882950", state: "in", in_play: true, gdg_gap: 1.4,
  live: liveBlock(),
});

/** Its neighbour, still ahead — the control that makes every assertion
 *  below a comparison rather than a screenshot. */
const PRE_ROW = row({
  event_id: "401882951", home: "Toluca", away: "Pumas UNAM",
  favourite: "Toluca", opponent: "Pumas UNAM",
  resolution: { Toluca: "exact", "Pumas UNAM": "exact" },
  gdg_gap: 0.6, state: "pre", in_play: false,
});

const BOARD = (rows: unknown[], refusals: unknown[] = []) => ({
  generated_at: "2026-12-10T21:16:00Z", date: "20261210", days: 2,
  leagues: LEAGUES, rows, refusals, folded: {},
  off_board: [], off_board_counts: {},
});

const REVIEW = {
  generated_at: "2026-12-10T21:16:00Z", date: "20261210", back: 7,
  window: { from: "20261203", to: "20261210" },
  store: { backend: "postgres", writable: true },
  leagues: {}, finished: [], refusals: [],
};

const STRIP_ENVELOPE = {
  version: "watched-strip-v1",
  generated_at: "2026-12-10T21:16:00Z",
  monitored_by_source: { manual: [77] },
  open_positions_not_monitored: [],
  refusal_codes: {}, policy_codes: {},
};

/** The DECLARED match, as the watched strip emits it — the same fixture
 *  as LIVE_ROW, joined on espn_event_id, carrying the SAME clock values
 *  so the two surfaces can be compared word for word. */
const DECLARED = {
  fixture_id: 77, competition_slug: "liga-mx-2026",
  home: "Leon", away: "Atletico de San Luis",
  espn_event_id: "401882950",
  state: {
    in_play: true, minute: 45, score_home: 2, score_away: 1,
    clock_display: "45'+5'", match_state: "in", refusals: [],
    captured_at: "2026-12-10T21:15:18Z",
  },
  read: null, positions: [],
};

async function open(page: Page, board: unknown, strip: unknown = null) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(strip == null
      ? { status: 401, contentType: "application/json",
          body: JSON.stringify({ detail: "no token" }) }
      : json(toV2(strip))));
  await page.goto("/bet-suggester");
  await page.getByTestId("picker-row").first().waitFor({ timeout: 15_000 });
}

const card = (page: Page, event: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${event}"]`);

// ============================================ 1. the card does not move

test("an in-play match is still a card, in its own column, ranked",
  async ({ page }) => {
    await open(page, BOARD([LIVE_ROW, PRE_ROW]));
    const live = card(page, "401882950");
    await expect(live).toHaveCount(1);
    // ITS COLUMN, not a separate strip and not the foot of the board
    await expect(live).toHaveAttribute("data-column", "ligamx");
    // AND ITS RANK. The board ranks on |GD/g gap|, a pre-kickoff fact
    // that does not move when a ball is kicked, so the widest gap is
    // still 01 — a row sorted to the end by its state would fail here.
    await expect(live.getByTestId("row-rank")).toHaveText("01");
    await expect(card(page, "401882951").getByTestId("row-rank"))
      .toHaveText("02");
  });

test("the numbers on it are the SAME read the card beside it carries",
  async ({ page }) => {
    /* A live minute must not make the figures look live. The card is
       rendered by the same component under both states, so this asserts
       the property that would break if a branch were added: the in-play
       card draws every read cell its pre-kickoff neighbour draws. */
    await open(page, BOARD([LIVE_ROW, PRE_ROW]));
    const cells = ["row-anchor", "row-rank", "row-kickoff"];
    for (const id of cells) {
      await expect(card(page, "401882950").getByTestId(id)).toHaveCount(1);
      await expect(card(page, "401882951").getByTestId(id)).toHaveCount(1);
    }
  });

// ======================================= 2. the date cell is a clock

test("the kickoff cell says LIVE and the minute, not a date",
  async ({ page }) => {
    await open(page, BOARD([LIVE_ROW, PRE_ROW]));
    const cell = card(page, "401882950").getByTestId("row-kickoff");
    await expect(cell).toHaveAttribute("data-in-play", "true");
    await expect(cell).toContainText("LIVE");
    await expect(cell).toContainText("45'+5'");
    // THE DATE IS GONE FROM IT — "instead of showing the kickoff date
    // and time", the operator. December is the month every fixture in
    // this file kicks off in, so its absence is the assertion.
    expect(await cell.innerText()).not.toMatch(/Dec/i);
  });

test("a pre-kickoff card beside it still shows its date",
  async ({ page }) => {
    /* THE CONTROL. A board that had simply stopped drawing dates would
       pass every assertion above. */
    await open(page, BOARD([LIVE_ROW, PRE_ROW]));
    const cell = card(page, "401882951").getByTestId("row-kickoff");
    await expect(cell).toHaveAttribute("data-in-play", "false");
    await expect(cell).not.toContainText("LIVE");
    expect(await cell.innerText()).toMatch(/Dec/i);
  });

test("the clock comes off the PROVIDER'S string, not the parse",
  async ({ page }) => {
    /* THE 2026-09-11 DEFECT, CHECKED ON A THIRD SURFACE. `minute` is
       what patterns._minute parsed OUT of `clock_display`, so stoppage
       time exists only in the second; a surface preferring the parse
       prints 45' beside another printing 45'+5' for one match.
       `data-source` names the FIELD the text came off, so this reads
       the source rather than the sentence. */
    await open(page, BOARD([LIVE_ROW]));
    const clock = card(page, "401882950").getByTestId("row-clock");
    await expect(clock).toHaveAttribute("data-source", "clock_display");
    await expect(clock).toHaveText("45'+5'");
  });

test("with only a minute on the tape, the minute is drawn as one",
  async ({ page }) => {
    /* The other branch of the one reader: no provider string, so the
       parse is all there is — and it is rendered as a clock rather than
       as a bare integer. */
    await open(page, BOARD([row({
      event_id: "401882950", state: "in", in_play: true,
      live: liveBlock({ clock: { ...liveBlock().clock,
                                 clock_display: null, minute: 67 } }),
    })]));
    const clock = card(page, "401882950").getByTestId("row-clock");
    await expect(clock).toHaveAttribute("data-source", "minute");
    await expect(clock).toHaveText("67'");
  });

// =============================== 3. an in-play row with no clock says so

test("a live match with no readable clock says so, and stays live",
  async ({ page }) => {
    /* THE FAILURE MODE THAT MATTERS MOST. The collector can go quiet
       while the match is very much on: the board's witness for "under
       way" is the provider status on `in_play`, and the tape only says
       WHERE. So the card must keep saying LIVE and name the absence —
       never fall back to the kickoff time, which is the original defect
       restored by a second route. */
    await open(page, BOARD([row({
      event_id: "401882950", state: "in", in_play: true,
      live: liveBlock({
        clock: null, row_age_seconds: null,
        absent: { code: "no_row_in_window",
                  why: "the collector has written nothing for this "
                    + "fixture inside the freshness window" },
      }),
    })]));
    const cell = card(page, "401882950").getByTestId("row-kickoff");
    await expect(cell).toContainText("LIVE");
    await expect(cell.getByTestId("row-clock"))
      .toHaveAttribute("data-source", "unstated");
    await expect(cell).toContainText(BOARD_CLOCK_ABSENT);
    // NOT a stale kickoff, NOT a blank, NOT minute 0
    const text = await cell.innerText();
    expect(text).not.toMatch(/Dec/i);
    expect(text.trim()).not.toBe("");
    expect(text).not.toMatch(/\b0'\B/);
    // and the BACKEND'S OWN sentence for the absence, not a second
    // voice on it
    await expect(cell).toHaveAttribute(
      "title", /collector has written nothing/);
  });

test("an in-play row with no live block at all still says LIVE",
  async ({ page }) => {
    /* THE KEY SEPARATION, ON THE WIRE. `in_play` is the ASSEMBLY's
       verdict off the state registry; `live` is the annotation, and a
       tape read that raised is named one level up as the column's
       `live_error`. A card that inferred liveness from having a clock
       would put a kickoff time back on a started match every time that
       read failed. */
    await open(page, BOARD([row({
      event_id: "401882950", state: "in", in_play: true,
    })]));
    const cell = card(page, "401882950").getByTestId("row-kickoff");
    await expect(cell).toHaveAttribute("data-in-play", "true");
    await expect(cell).toContainText("LIVE");
    await expect(cell).toContainText(BOARD_CLOCK_ABSENT);
    expect(await cell.innerText()).not.toMatch(/Dec/i);
  });

// ========================== 4. a refused fixture is a fixture too

test("a refused fixture that kicked off also says LIVE", async ({ page }) => {
    /* The refusal is of ONE act — placing two clubs on a single scale —
       and says nothing about whether the match is being played. This
       card draws a date in a ranked card's place for it, so without
       this it would be the one card on the board still showing a
       kickoff time for a match under way. */
    await open(page, BOARD([PRE_ROW], [{
      refused: true, league: "ligamx", column: "ligamx",
      home: "Leon", away: "Promoted Rovers",
      club: "Promoted Rovers", reason: "no_prior_row",
      event_id: "401882960", kickoff: KICKOFF,
      state: "in", in_play: true, live: liveBlock(),
    }]));
    const refused = page.locator(
      '[data-testid="picker-refusal"][data-event="401882960"]');
    await expect(refused).toHaveCount(1);
    const cell = refused.getByTestId("refused-kickoff");
    await expect(cell).toContainText("LIVE");
    await expect(cell).toContainText("45'+5'");
    expect(await cell.innerText()).not.toMatch(/Dec/i);
  });

// ================= 5. a DECLARED match is in BOTH places, both live

test("a declared in-play match is on the board AND in the live section",
  async ({ page }) => {
    /* THE OPERATOR'S SECOND CLAUSE, whole: "live both in the match cards
       spot and the live match section, and says live with minute just
       like the live cards".

       BOTH, not either. Nothing dedupes the two surfaces and nothing
       may start to: the board answers "what is ranked" and the section
       answers "what is under way", and a match can be both. */
    await open(page, BOARD([LIVE_ROW, PRE_ROW]),
               { ...STRIP_ENVELOPE, matches: [DECLARED] });
    await page.getByTestId("live-section").waitFor({ timeout: 15_000 });

    // in its board spot, live
    const boardCell = card(page, "401882950").getByTestId("row-kickoff");
    await expect(boardCell).toContainText("LIVE");
    await expect(boardCell.getByTestId("row-clock")).toHaveText("45'+5'");

    // and in the live section, live
    const liveCard = page.locator(
      '[data-testid="live-card"][data-fixture="77"]');
    await expect(liveCard).toHaveCount(1);
    await expect(liveCard.getByTestId("live-minute")).toHaveText("45'+5'");
  });

test("the two surfaces print the SAME clock, off the one reader",
  async ({ page }) => {
    /* THE DEFECT THIS EXISTS AGAINST, stated across the two surfaces it
       would now appear on: 45' in one place and 45'+5' in the other,
       one match, one screen. Both fixtures carry the same pair, so a
       surface that applied its own precedence would print a different
       string here — and `data-source` says which field each read. */
    await open(page, BOARD([LIVE_ROW]),
               { ...STRIP_ENVELOPE, matches: [DECLARED] });
    await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
    const onBoard = card(page, "401882950").getByTestId("row-clock");
    const inSection = page.locator(
      '[data-testid="live-card"][data-fixture="77"]')
      .getByTestId("live-minute");
    expect(await onBoard.innerText()).toBe(await inSection.innerText());
    await expect(onBoard).toHaveAttribute("data-source", "clock_display");
    await expect(inSection).toHaveAttribute("data-source", "clock_display");
  });

test("the live card can now name the column its match belongs to",
  async ({ page }) => {
    /* A CONSEQUENCE OF THE BOARD KEEPING THE ROW, asserted because it
       is load-bearing rather than incidental. `LiveCard.columnOf` joins
       a live match to a board row on espn_event_id — and until
       2026-09-14 an in-play match had LEFT the board, so that join
       found nothing and a narrowed board counted it `unplaceable`. */
    await open(page, BOARD([LIVE_ROW]),
               { ...STRIP_ENVELOPE, matches: [DECLARED] });
    await page.getByTestId("live-section").waitFor({ timeout: 15_000 });
    await expect(page.locator(
      '[data-testid="live-card"][data-fixture="77"]'))
      .toHaveAttribute("data-column", "ligamx");
  });

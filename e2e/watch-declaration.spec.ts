import { expect, test } from "@playwright/test";
import {
  closingConditionsLabel, SYNC_PREVIEW_OPEN, SYNC_PREVIEW_RETIRED,
  syncPreviewHolesClosed,
} from "../src/components/WatchDeclaration";

// SELECTING MATCHES TO WATCH, from the picker board (B0c, 2026-09-06).
//
// docs/HOLD-EXIT-DESIGN.md's watchlist is a PREREGISTRATION: declared
// before the evidence, append-only, operator-gated, and `actor` is
// required and never defaulted — "a declaration with nobody's name on it
// cannot be held to anything". namson.dev is public and
// lib/suggesterProxy.ts injects no credentials, so what is at stake in
// this file is not a button. It is:
//
//   - the control RENDERS with no token and says what it needs, and
//     pressing it opens the panel that asks for it. Never a silent
//     no-op, never hidden;
//   - the operator's own NAME rides as `actor` — never "web", never a
//     default — and with no name the acting controls are disabled and
//     point at the one sentence that says why;
//   - the token is typed by a person and travels as ONE header. It is
//     not in the bundle, not in an env var, and not in storage;
//   - IDENTITY IS RESOLVED, NEVER GUESSED. The board keys fixtures by
//     ESPN event id and the watchlist by the live plane's fixture id; a
//     reference that resolves to nothing says so and offers nothing to
//     press, rather than reading as "not declared";
//   - A REFUSED REMOVAL RENDERS THE BACKEND'S WORDS VERBATIM and is NOT
//     an error state. `recorded: true` — the row that carries the wish
//     is the only proof the sample stayed fair.
//
// Hermetic: every request the page makes is served here.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

function inHours(h: number) {
  const base = Date.UTC(2026, 11, 10, 8, 0, 0);
  return new Date(base + h * 25 * 60_000).toISOString();
}

// Three EPL rows: one declared, one not, one that is no live-plane
// fixture at all. The third is the case a naive join would have shown as
// "not declared", which is a different fact.
function row(over: Record<string, unknown>) {
  return {
    refused: false, league: "epl", fav_side: "home", resolution: {},
    src: "current", gp_current: { home: 8, away: 8, min: 8 },
    shape: "SPLIT", espn: "eng.1",
    ppg_gap: 0.5, gdg_gap: 0.8, rank_gap: 4,
    ranks: { fav: 3, opp: 7 },
    tiers: { ovr: [1, 3], atk: [2, 3], def: [1, 2] },
    tier_gaps: { ovr: 2, atk: 1, def: 1 },
    kalshi: null,
    ...over,
  };
}

const DECLARED = row({
  home: "Arsenal", away: "Everton", favourite: "Arsenal",
  opponent: "Everton",
  event_id: "401000001", competition_id: "401000001", kickoff: inHours(6),
});
const UNDECLARED = row({
  home: "Chelsea", away: "Brentford", favourite: "Chelsea",
  opponent: "Brentford",
  event_id: "401000002", competition_id: "401000002", kickoff: inHours(9),
});
const NO_FIXTURE = row({
  home: "Fulham", away: "Brighton", favourite: "Fulham",
  opponent: "Brighton",
  event_id: "401000003", competition_id: "401000003", kickoff: inHours(12),
});

const BOARD = {
  generated_at: new Date().toISOString(),
  date: "20260906", days: 7,
  leagues: {
    epl: { src: "current", min_current_gp: 8, clubs: 20 },
    laliga: { src: "current", min_current_gp: 8, clubs: 20 },
    mls: { src: "current", min_current_gp: 21, clubs: 30 },
    ligamx: { src: "current", min_current_gp: 9, clubs: 18 },
  },
  rows: [DECLARED, UNDECLARED, NO_FIXTURE],
  refusals: [],
};

const REVIEW = {
  generated_at: new Date().toISOString(),
  back: 7, leagues: {}, finished: [], refusals: [],
  store: { backend: "memory", writable: true },
};

// watchlist.state()'s own shape. Counts are SPLIT BY SOURCE and never
// totalled; the log is bounded and says so.
const STATE = {
  version: "watchlist-v1",
  generated_at: new Date().toISOString(),
  monitored_fixture_ids: [4101],
  monitored_by_source: { manual: [4101], open_position: [] },
  coverage: [],
  complete_history_count: 1,
  partial_history_fixture_ids: [],
  declared_ever_fixture_ids: [4101, 4199],
  declared_ever_count: 2,
  removed_before_kickoff: [4199],
  removed_before_kickoff_count: 1,
  removed_before_kickoff_events: [],
  currently_removed_fixture_ids: [4199],
  re_declarations_count: 0,
  re_declared_fixture_ids: [],
  removal_attempts_refused_count: 1,
  removal_attempts_refused: [{
    fixture_id: 4101, actor: "son", occurred_at: new Date().toISOString(),
    policy_code: "tape_shows_play", reason: null,
  }],
  open_positions_not_monitored: [4321],
  // THE ROWS A SWEEP WROTE BEFORE THE BACKEND STOPPED SWEEPING
  // (watchlist.state, added with A_POSITION_IS_NOT_A_DECLARATION). In
  // the log, on the payload, and in no declared set — the "only" list
  // is the one the 37-row incident was about.
  mechanically_added_fixture_ids: [4321],
  mechanically_added_count: 1,
  mechanically_added_only_fixture_ids: [4321],
  log: [],
  log_total: 12,
  log_truncated: false,
  log_truncation: null,
  registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
};

// WHAT `sync-positions` NOW ANSWERS — recorded off
// src/live/watchlist.py `held_positions_view`, which is the whole route
// (api/main.py live_admin_watchlist_sync). It WRITES NOTHING: the held
// set is derived from the journal on every read and stored in no row.
//
// THREE KEYS THE OLD FIXTURE CARRIED ARE GONE, and their absence is the
// point rather than an omission: `declared`, `already_declared` and
// `actor` named rows a sweep had just written. The backend dropped them
// on 2026-09-06 so that a reader prints its own "not on the payload"
// instead of reading a `[]` as "nothing new was declared", and
// tests/test_watchlist.py::test_the_held_route_reports_and_writes_nothing
// asserts none of them is on the body.
//
// The per-fixture `policy` sentences and the tape-refusal buckets
// (`competition_not_taped` / `fixture_not_taped`, derived in the backend
// from live_watch.TAPE_UNREACHABLE) are the emitter's own.
const HELD = {
  checked: 3,
  writes_nothing: true,
  held_fixture_ids: [4101, 4102, 4321],
  held: [
    { fixture_id: 4101, competition_slug: "epl-2026", monitored: true,
      declarable: true, policy_code: "already_declared",
      policy: "already_declared: a standing declaration already covers "
        + "this fixture. Nothing was written. It is a statement about "
        + "the record, not a refusal — `held_positions_view` says it of "
        + "a held fixture somebody had already declared" },
    { fixture_id: 4102, competition_slug: "epl-2026", monitored: false,
      declarable: true, policy_code: "not_watched",
      policy: "not_watched: nothing to un-declare: no standing "
        + "declaration covers this fixture" },
    { fixture_id: 4321, competition_slug: "epl-2026", monitored: false,
      declarable: true, policy_code: "not_watched",
      policy: "not_watched: nothing to un-declare: no standing "
        + "declaration covers this fixture" },
  ],
  declared_of_the_held: [4101],
  open_positions_not_monitored: [4102, 4321],
  unknown_fixture: [],
  competition_not_taped: [],
  fixture_not_taped: [],
  generated_at: new Date().toISOString(),
  version: "watchlist-v1",
  a_position_is_not_a_declaration:
    "A POSITION YOU HOLD IS NOT A MATCH YOU CHOSE TO WATCH. This record "
    + "answers one question — which fixtures did a HUMAN declare, before "
    + "the evidence — and its whole worth is that somebody declared each "
    + "entry. A sweep that follows the journal's rows declares nothing; "
    + "it reports.",
};

// The resolver's own sentence for a reference with no fixture row.
const NO_FIXTURE_NOTE =
  "this reference resolves to no live-plane fixture. Club friendlies "
  + "have no fixture row by design, so news is keyed on the provider "
  + "reference alone";

const RESOLVED = {
  resolved: {
    "401000001": { fixture_id: 4101, competition: "epl-2026",
                   kickoff_utc: inHours(6) },
    "401000002": { fixture_id: 4102, competition: "epl-2026",
                   kickoff_utc: inHours(9) },
    "401000003": null,
  },
  notes: { "401000003": NO_FIXTURE_NOTE },
  asked: 3,
  unreadable_references: [],
};

// watchlist.undeclare() on a match the tape says is under way. A 200
// with recorded: true — the refusal IS the record.
const REFUSAL_WORDS =
  "tape_shows_play: REFUSED: the state tape already holds an in-play or "
  + "post row for this fixture, whatever the schedule says. The tape "
  + "outranks the calendar";

const REMOVE_REFUSED = {
  resolved_fixture: { espn_event_id: "401000001", fixture_id: 4101,
                      competition: "epl-2026", kickoff_utc: inHours(6) },
  watchlist: {
    fixture_id: 4101, recorded: true, policy_code: "tape_shows_play",
    policy: REFUSAL_WORDS, version: "watchlist-v1",
    event_id: 91, action: "remove_refused", source: "manual",
    actor: "son", occurred_at: new Date().toISOString(),
    joined_phase: "in_play", joined_minute: 63, basis: null,
    once_started_it_stays:
      "a fixture that has started never leaves the monitored set",
  },
};

const DECLARE_OK = {
  resolved_fixture: { espn_event_id: "401000002", fixture_id: 4102,
                      competition: "epl-2026", kickoff_utc: inHours(9) },
  watchlist: {
    fixture_id: 4102, recorded: true, policy_code: "declared",
    policy: "declared: the declaration was recorded",
    version: "watchlist-v1",
    event_id: 92, action: "add", source: "manual", actor: "son",
    occurred_at: new Date().toISOString(),
    joined_phase: "pre_kickoff", joined_minute: null, basis: null,
  },
};

type Seen = {
  declareUrls: string[];
  declareTokens: (string | undefined)[];
  stateTokens: (string | undefined)[];
  syncCalls: number;
};

async function serve(page: import("@playwright/test").Page, opts: {
  state?: unknown; stateStatus?: number;
  resolved?: unknown; resolveStatus?: number;
  declare?: unknown; declareStatus?: number;
  sync?: unknown; syncStatus?: number;
} = {}): Promise<Seen> {
  const seen: Seen = {
    declareUrls: [], declareTokens: [], stateTokens: [], syncCalls: 0,
  };
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  // The strip's route does not exist on the backend yet; its own spec
  // pins the real 404. Served here so this file stays hermetic.
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json({ error: "not found" }, 404)));

  // Registered GENERIC FIRST: Playwright matches routes in the reverse
  // order they were added, so the two specific paths below win.
  await page.route("**/api/bet-suggester/live-watchlist?**", (r) => {
    const req = r.request();
    const token = req.headers()["x-admin-token"];
    if (req.method() === "GET") {
      seen.stateTokens.push(token);
      return r.fulfill(json(opts.state ?? STATE, opts.stateStatus ?? 200));
    }
    seen.declareUrls.push(req.url());
    seen.declareTokens.push(token);
    return r.fulfill(json(opts.declare ?? DECLARE_OK, opts.declareStatus ?? 200));
  });
  await page.route("**/api/bet-suggester/live-watchlist/resolve", (r) =>
    r.fulfill(json(opts.resolved ?? RESOLVED, opts.resolveStatus ?? 200)));
  await page.route("**/api/bet-suggester/live-watchlist/sync-positions", (r) => {
    seen.syncCalls += 1;
    return r.fulfill(json(opts.sync ?? HELD, opts.syncStatus ?? 200));
  });
  return seen;
}

const toggle = (page: import("@playwright/test").Page, eventId: string) =>
  page.locator(`[data-testid="watch-toggle"][data-event="${eventId}"]`);

/** Type the operator's credentials the way a person would: into the
 *  panel, by hand. Nothing in the bundle knows either value. */
async function arm(page: import("@playwright/test").Page,
                   token = "operator-token", actor = "son") {
  await page.getByTestId("watch-panel").locator("summary").click();
  if (token) await page.locator("#watch-token").fill(token);
  if (actor) await page.locator("#watch-actor").fill(actor);
}

// ------------------------------------------------ with no token at all

test("with no token every row still carries the control, and it says what it needs",
  async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("picker-row")).toHaveCount(3);
    // one control per row — the board hides none of them
    await expect(page.getByTestId("watch-toggle")).toHaveCount(3);
    for (const id of ["401000001", "401000002", "401000003"]) {
      await expect(toggle(page, id)).toHaveAttribute("data-state", "needs-token");
    }
    // the panel says the same thing on its own chip rather than
    // pretending it has read a set it cannot read
    await expect(page.getByTestId("watch-panel-chip"))
      .toHaveText("operator only");
    // and the explanation exists ONCE, in the accessible tree, with
    // every control pointing at it
    const needs = page.getByTestId("watch-needs");
    await expect(needs).toHaveAttribute("id", "watch-declare-needs");
    await expect(needs).toContainText("operator-only");
    await expect(needs).toContainText("a reload clears them");
    await expect(
      toggle(page, "401000001").getByRole("button"))
      .toHaveAttribute("aria-describedby", "watch-declare-needs");
  });

test("pressing an unarmed control opens the panel and asks for the token — never a silent no-op",
  async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester");
    const panel = page.getByTestId("watch-panel");
    await expect(panel).not.toHaveAttribute("open", /.*/);
    await toggle(page, "401000002").getByRole("button").click();
    await expect(panel).toHaveAttribute("open", /.*/);
    await expect(page.locator("#watch-token")).toBeFocused();
  });

test("no token means no read: nothing is fetched and no set is implied",
  async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("watch-toggle").first()).toBeVisible();
    expect(seen.stateTokens).toEqual([]);
    // no "0 declared" anywhere — an unread set is not an empty one
    await expect(page.getByTestId("watch-state")).toHaveCount(0);
  });

// ------------------------------------------------------ with the token

test("the declared set is read with the operator's own token and marks the rows it names",
  async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await expect(page.getByTestId("watch-panel-chip")).toHaveText("1 declared");
    expect(seen.stateTokens).toContain("operator-token");
    // fixture 4101 is in the set and event 401000001 resolves to it
    await expect(toggle(page, "401000001"))
      .toHaveAttribute("data-state", "declared");
    await expect(toggle(page, "401000001")).toContainText("watching");
    // 4102 is not
    await expect(toggle(page, "401000002"))
      .toHaveAttribute("data-state", "undeclared");
    await expect(toggle(page, "401000002")).toContainText("not watched");
  });

test("a reference that resolves to no fixture says so, and is not shown as undeclared",
  async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    const t = toggle(page, "401000003");
    await expect(t).toHaveAttribute("data-state", "no-fixture");
    await expect(t.getByTestId("watch-no-fixture"))
      .toHaveText("not a live-plane fixture");
    // nothing to press: a declaration about a row the live plane does
    // not hold is not offered
    await expect(t.getByRole("button")).toHaveCount(0);
    // the resolver's own sentence appears ONCE, in the panel, not on
    // every card it applies to
    const note = page.getByTestId("watch-unresolved");
    await expect(note).toContainText("1 of 3");
    await expect(note).toContainText(NO_FIXTURE_NOTE);
    await expect(page.getByText(NO_FIXTURE_NOTE)).toHaveCount(1);
  });

test("the operator's name rides as actor, and the token as one header",
  async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page, "operator-token", "son");
    await toggle(page, "401000002").getByRole("button").click();
    await expect(toggle(page, "401000002").getByTestId("watch-result"))
      .toBeVisible();
    expect(seen.declareUrls).toHaveLength(1);
    const url = new URL(seen.declareUrls[0]);
    expect(url.searchParams.get("event_id")).toBe("401000002");
    expect(url.searchParams.get("action")).toBe("add");
    // NOT "web", NOT a default — the person who typed it
    expect(url.searchParams.get("actor")).toBe("son");
    expect(seen.declareTokens[0]).toBe("operator-token");
    // and the record that came back is drawn in the backend's words
    const rec = toggle(page, "401000002").getByTestId("watch-result");
    await expect(rec).toHaveAttribute("data-code", "declared");
    await expect(rec).toContainText("declared: the declaration was recorded");
    await expect(rec).toContainText("written as event 92, actor son");
    await expect(rec).toContainText("fixture 4102 (epl-2026)");
  });

test("a token with no name cannot declare anything, and the control says which sentence says why",
  async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page, "operator-token", "");
    // the set is still READ — the name is required to declare, not to look
    await expect(page.getByTestId("watch-panel-chip")).toHaveText("1 declared");
    const b = toggle(page, "401000002").getByRole("button");
    await expect(b).toBeDisabled();
    await expect(b).toHaveAttribute("aria-describedby", "watch-declare-needs");
    expect(seen.declareUrls).toEqual([]);
    // and the gate is the NAME, not something else that happens to
    // correlate with it: type one and the control arms, clear it and it
    // disarms again
    await page.locator("#watch-actor").fill("son");
    await expect(b).toBeEnabled();
    await expect(b).not.toHaveAttribute("aria-describedby", /.*/);
    await page.locator("#watch-actor").fill("");
    await expect(b).toBeDisabled();
    expect(seen.declareUrls).toEqual([]);
  });

// WHAT THIS FILE DOES NOT COVER, said rather than left to be assumed.
// The claim "a blank name is forwarded blank, so the BACKEND refuses it
// in the sentence that owns the rule" has no assertion here, because the
// only route to the wire is the control above and that control is
// disabled while the name is blank. A `|| "web"` added to
// suggesterApi.watchlistApi.declare would therefore not turn this file
// red on its own — the disabled button is what stops it. Both halves are
// deliberate and both are load-bearing; if the button is ever made
// pressable with a blank name, the wire-level assertion has to arrive in
// the same change.

// -------------------------------------------- the refusal is the record

test("a refused removal renders the backend's words verbatim and is not an error",
  async ({ page }) => {
    await serve(page, { declare: REMOVE_REFUSED });
    await page.goto("/bet-suggester");
    await arm(page);
    await toggle(page, "401000001")
      .getByRole("button", { name: /ask for .* to leave/i }).click();
    const rec = toggle(page, "401000001").getByTestId("watch-result");
    await expect(rec).toHaveAttribute("data-code", "tape_shows_play");
    // RECORDED. The wish is evidence about the monitored set and the row
    // that carries it is the only proof the sample stayed fair.
    await expect(rec).toHaveAttribute("data-recorded", "true");
    await expect(rec).toContainText(REFUSAL_WORDS);
    await expect(rec).toContainText("written as event 91, actor son");
    // it is NOT rendered as a failure: the error branch is a different
    // element and it is absent
    await expect(toggle(page, "401000001").getByTestId("watch-error"))
      .toHaveCount(0);
  });

// -------------------------------------------------- what am I holding
//
// THE BUTTON THAT WROTE 37 PERMANENT RECORDS ON ONE CLICK, AND THE
// ROUTE BEHIND IT THAT NOW WRITES NONE.
//
// Pressing "watch everything I hold" used to POST sync-positions
// straight from its onClick, and the only place a count ever appeared
// was the result line afterwards. What it wrote could not be taken
// back: the record is append-only and a removal after kickoff is
// REFUSED by design. Son pressed it, did not expect that, and said so.
// So the press ARMED a step that said what was about to be written.
//
// THE BACKEND THEN STOPPED WRITING (2026-09-06, api/main.py
// live_admin_watchlist_sync + watchlist.held_positions_view: a position
// you hold is not a match you chose to watch). The route derives the
// held set from the journal on every read, persists nothing, answers
// `writes_nothing: true`, and carries no `declared` / `already_declared`
// / `actor` at all — the backend dropped those three deliberately so a
// reader cannot read a `[]` as "nothing new was declared".
//
// WHICH LEFT THE STEP WARNING ABOUT A WRITE THAT NO LONGER HAPPENS
// (fixed 2026-09-09). These tests now hold TWO things: that the press
// still reaches the wire only from inside the step — `seen.syncCalls`
// is the only witness that counts, because a panel that renders while
// the request is already gone would satisfy every DOM assertion in this
// file — and that not one sentence in it claims a write.

test("pressing what-am-I-holding ASKS NOTHING — it opens a step that "
   + "says what the read is for, and how many this panel can already "
   + "count", async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await expect(page.getByTestId("watch-sync-confirm")).toHaveCount(0);
    await page.getByTestId("watch-sync").click();

    const c = page.getByTestId("watch-sync-confirm");
    await expect(c).toBeVisible();
    // THE WIRE IS UNTOUCHED. Give the request a chance to have been
    // made before asserting it was not: a bare count check on the next
    // tick passes for the wrong reason.
    await page.waitForTimeout(500);
    expect(seen.syncCalls).toBe(0);

    // WHAT it is about to ask for — the journal's open positions, and
    // that it is not the board and not what you looked at.
    await expect(c.getByTestId("watch-sync-what"))
      .toContainText("open position");
    await expect(c.getByTestId("watch-sync-what"))
      .toContainText(/not the fixtures on the board/i);
    // …AND THAT IT APPENDS NOTHING, in the words of the rule that owns
    // it, before the press rather than after.
    const nw = c.getByTestId("watch-sync-writes-nothing");
    await expect(nw).toContainText("It appends nothing");
    await expect(nw).toContainText("A_POSITION_IS_NOT_A_DECLARATION");
    await expect(nw).toContainText("writes_nothing");
  });

// THE WARNING THAT WAS FALSE ABOUT A MONEY-ADJACENT PRESS.
//
// The step told the operator that pressing this declared every held
// fixture into an append-only record and that the declaration could not
// be revoked once a match started. The backend stopped writing on
// 2026-09-06, so from that day the consent being asked for was consent
// to an action that is not the one behind the control.
//
// THE ASSERTION IS OVER THE WHOLE STEP AND EVERY CONTROL IN IT, NOT
// OVER THE ONE PARAGRAPH THAT CARRIED IT — a hand-typed subset stays
// green while the omitted case drifts, and this warning lived in five
// places at once (a heading, two paragraphs, a button label and an
// accessible name). Nothing inside the step, and nothing on the control
// that opens it, may claim a write.
test("not one sentence in the step claims this press writes anything",
  async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);

    // the control that OPENS it — label and accessible name both
    const opener = page.getByTestId("watch-sync");
    for (const words of [await opener.innerText(),
                         (await opener.getAttribute("aria-label")) ?? ""]) {
      expect(words, "the opener must not name a write")
        .not.toMatch(/declar|permanent|cannot be undone|append/i);
    }

    await opener.click();
    const c = page.getByTestId("watch-sync-confirm");
    await expect(c).toBeVisible();

    // …AND EVERY AFFIRMATIVE CLAIM OF A WRITE, over the whole block.
    // The ban is on the CLAIM, not on the vocabulary: "declared"
    // survives in one honest reading — the count of what a HUMAN
    // declared, which is a fact about the existing set and not about
    // this press — so each pattern below is a sentence that can only
    // mean this press writes.
    const whole = await c.innerText();
    for (const claim of [
      /this writes/i, /will declare/i, /declare them/i,
      /cannot be undone/i, /cannot be taken back/i,
      /permanent record/i, /nothing has been written yet/i,
    ]) {
      expect(whole, `the step still claims a write: ${claim}`)
        .not.toMatch(claim);
    }
    // the heading says what the press ASKS FOR, not what it writes
    await expect(c.locator("#watch-sync-confirm-h"))
      .toHaveText(/asks what your journal holds/i);

    // THE APPEND-ONLY RULE IS REAL AND IT IS NAMED — it governs the
    // declared set and the per-match controls on the board. What made
    // the old copy false was attaching it to THIS press. So it may
    // appear exactly where it is scoped away, and nowhere else in the
    // step: a sentence that mentions it without the boundary is the
    // defect coming back.
    const scoped = c.getByTestId("watch-sync-writes-nothing");
    await expect(scoped).toContainText("ONCE_STARTED_IT_STAYS");
    await expect(scoped).toContainText("not what this control touches");
    const elsewhere = whole.replace(await scoped.innerText(), "");
    for (const rule of [/append-only/i, /once a match has started/i,
                        /removal is refused/i]) {
      expect(elsewhere,
        `the append-only rule is stated outside the paragraph that `
        + `scopes it away from this press: ${rule}`).not.toMatch(rule);
    }

    // the two controls say what they do, and neither says "declare"
    await expect(c.getByTestId("watch-sync-go")).toHaveText(/ask what i hold/i);
    await expect(c.getByTestId("watch-sync-cancel"))
      .toHaveText(/ask nothing/i);
  });

test("the step counts what this panel can already read, and cancelling "
   + "asks nothing either", async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    const c = page.getByTestId("watch-sync-confirm");

    // HOW MANY — every count is DERIVED from the served state payload,
    // never a number typed into this assertion.
    const counts = c.getByTestId("watch-sync-counts");
    await expect(counts).toContainText(
      String(STATE.open_positions_not_monitored.length));
    await expect(counts).toContainText(
      String(STATE.monitored_fixture_ids.length));
    await expect(counts).toContainText(String(STATE.declared_ever_count));

    await c.getByTestId("watch-sync-cancel").click();
    await expect(page.getByTestId("watch-sync-confirm")).toHaveCount(0);
    await page.waitForTimeout(300);
    expect(seen.syncCalls).toBe(0);
  });

test("a count the payload does not carry is NOT ZERO on the confirmation",
  async ({ page }) => {
    // The panel's own discipline one layer over: `countOf` returns null
    // for an absent field and the confirmation must print the words,
    // not a plausible 0 — "no position is unwatched" is a claim, and an
    // answer that carried no such key made none.
    const thin: Record<string, unknown> = { ...STATE };
    delete thin.open_positions_not_monitored;
    await serve(page, { state: thin });
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    const counts = page.getByTestId("watch-sync-confirm")
      .getByTestId("watch-sync-counts");
    await expect(counts).toContainText("not on the payload");
    await expect(counts).not.toContainText("held, and not in the set right now 0");
  });

test("with the set unread the confirmation says it can count nothing — "
   + "not zero", async ({ page }) => {
    await serve(page, { state: { error: "boom" }, stateStatus: 503 });
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    const c = page.getByTestId("watch-sync-confirm");
    await expect(c.getByTestId("watch-sync-counts")).toHaveCount(0);
    await expect(c.getByTestId("watch-sync-uncounted"))
      .toContainText("no count at all");
    // and what the press does is stated whether or not anything counted
    await expect(c.getByTestId("watch-sync-writes-nothing"))
      .toContainText("It appends nothing");
  });

// ------------------------------------------------------- THE REGISTER
//
// A REGISTERED HOLE IS A NUMBER THIS PANEL CANNOT SHOW BEFORE A PRESS,
// WRITTEN DOWN RATHER THAN INVENTED. Two directions are guarded: a
// record in the register must be drawn, and a record whose closing
// condition has been MET must not still be standing.
//
// AND THE DETECTOR IS THE HALF THAT WAS BROKEN. `closes_when` on the
// one record here read "the watchlist state payload carries
// `open_position_fixture_ids` (or the sync route grows a dry-run that
// returns its own `checked`/`declared` without writing)" — TWO
// branches. The detector read ONE hand-picked key off ONE payload
// (`closed_by_state_key`), and that key names a field
// `watchlist.state()` does not carry and never has. So branch 2 could
// be satisfied — as it was, on 2026-09-06, and more completely than it
// asked for, since the route stopped writing altogether — and neither
// the surface nor this file could notice. A two-branch condition with a
// one-branch detector is this repo's hand-typed-subset lesson in a new
// place, and the fix is the same one: derive the check from what the
// record declares.
//
// WHAT THIS FILE CANNOT COVER TODAY, SAID RATHER THAN IMPLIED. The open
// register is EMPTY (its one record retired 2026-09-09), so the two DOM
// paths that draw a record — the row and the stale banner — have
// nothing to draw and are asserted absent rather than exercised. The
// detector and the label they are built from are guarded directly
// below, against synthetic registers, which is what keeps them honest
// until a record is registered again.

test("the open register is drawn exactly, and nothing is drawn from an "
   + "empty one", async ({ page }) => {
    await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    const c = page.getByTestId("watch-sync-confirm");
    const keys = Object.keys(SYNC_PREVIEW_OPEN);
    await expect(c.getByTestId("watch-sync-open")).toHaveCount(keys.length);
    for (const k of keys) {
      const row = c.locator(`[data-testid="watch-sync-open"][data-key="${k}"]`);
      await expect(row).toContainText(SYNC_PREVIEW_OPEN[k].finding);
      // THE FINDING IS PROSE, THE CLOSING CONDITION IS A BINDING. The
      // finding is operator-facing and is read as text. The
      // `closes_when` is bookkeeping about this repo's unfinished
      // business and does not belong in front of an operator, so the
      // row carries the conditions it closes on as data — EVERY branch
      // of them, which is what the count attribute pins.
      expect(SYNC_PREVIEW_OPEN[k].closes_when.length,
        `${k} must declare what closes it`).toBeGreaterThan(0);
      expect(SYNC_PREVIEW_OPEN[k].closed_by.length,
        `${k} must declare closed_by, not only prose`).toBeGreaterThan(0);
      await expect(row).toHaveAttribute("data-closes-when",
        closingConditionsLabel(SYNC_PREVIEW_OPEN[k]));
      await expect(row).toHaveAttribute("data-closes-when-branches",
        String(SYNC_PREVIEW_OPEN[k].closed_by.length));
    }
    // nothing is stale on payloads that close nothing
    await expect(c.getByTestId("watch-sync-open-stale")).toHaveCount(0);
  });

// --- the detector, over both payloads and every branch ----------------

/** A payload pair carrying exactly the keys ONE branch names, and
 *  nothing else. Built from the branch itself, so a branch this file
 *  has never seen is still checked the moment it is registered. */
function onlyBranch(b: { payload: "state" | "held"; keys: string[] }) {
  const carrier = Object.fromEntries(b.keys.map((k) => [k, []]));
  return b.payload === "state"
    ? { state: carrier as never, held: null }
    : { state: null, held: carrier as never };
}

test("EVERY branch of a registered hole can close it — not only the first",
  () => {
    // THE BUG, DIRECTLY. Walked over both registers, so this covers the
    // records that stand and the records that retired; a third branch
    // added to any of them is checked without an edit here.
    const all = { ...SYNC_PREVIEW_OPEN, ...SYNC_PREVIEW_RETIRED };
    const names = Object.keys(all);
    expect(names.length,
      "there is nothing to check — both registers are empty")
      .toBeGreaterThan(0);
    let multi = 0;
    for (const k of names) {
      const rec = all[k];
      expect(rec.closed_by.length, `${k} declares no closing condition`)
        .toBeGreaterThan(0);
      if (rec.closed_by.length > 1) multi += 1;
      for (const b of rec.closed_by) {
        expect(b.keys.length, `${k}: a branch with no keys closes on nothing`)
          .toBeGreaterThan(0);
        expect(syncPreviewHolesClosed(onlyBranch(b), { [k]: rec }),
          `${k}: the branch ${b.payload}:${b.keys.join("+")} cannot close it`)
          .toContain(k);
        // …AND IT IS THE NAMED PAYLOAD THAT CLOSES IT. The same keys on
        // the OTHER answer must not: "the state payload carries X" and
        // "the held view carries X" are different facts, and a detector
        // that cannot tell them apart is the one being replaced.
        const other = b.payload === "state" ? "held" : "state";
        expect(syncPreviewHolesClosed(
          onlyBranch({ payload: other, keys: b.keys }), { [k]: rec }),
          `${k}: keys on ${other} must not close a ${b.payload} branch`)
          .toEqual([]);
      }
    }
    // and at least one record really does declare more than one branch,
    // so the loop above is not passing over a register of singletons
    expect(multi,
      "no registered record declares two branches — this guard would "
      + "pass on the very shape it exists to catch").toBeGreaterThan(0);
  });

test("a record is only retired once its condition is actually met, and "
   + "an unread payload closes nothing", () => {
    // RETIREMENT IS EARNED, NOT ASSERTED. Every retired record is run
    // through the same detector against the payloads this panel really
    // reads: retire one early and this goes red rather than shipping.
    const retired = Object.keys(SYNC_PREVIEW_RETIRED);
    expect(retired.length).toBeGreaterThan(0);
    const closed = syncPreviewHolesClosed(
      { state: STATE as never, held: HELD as never }, SYNC_PREVIEW_RETIRED);
    for (const k of retired) {
      expect(SYNC_PREVIEW_RETIRED[k].retired_on,
        `${k} must be retired BY DATE`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(SYNC_PREVIEW_RETIRED[k].retired_because.length,
        `${k} must say what closed it`).toBeGreaterThan(0);
      // the sentence is KEPT, never deleted
      expect(SYNC_PREVIEW_RETIRED[k].finding.length).toBeGreaterThan(0);
      expect(closed, `${k} was retired on a condition that is NOT met`)
        .toContain(k);
    }
    // MISSING IS NOT SATISFIED. With no answers in hand nothing closes:
    // `undefined` on a payload nobody has read is not evidence that a
    // key is absent from it.
    expect(syncPreviewHolesClosed({ state: null, held: null },
                                  SYNC_PREVIEW_RETIRED)).toEqual([]);
    expect(syncPreviewHolesClosed({}, SYNC_PREVIEW_RETIRED)).toEqual([]);
  });

test("the closing-condition label names every branch, not the first",
  () => {
    // What the DOM attribute and the stale banner are both built from.
    const two = {
      finding: "f", closes_when: "w",
      closed_by: [
        { payload: "state" as const, keys: ["a"] },
        { payload: "held" as const, keys: ["b", "c"] },
      ],
    };
    const label = closingConditionsLabel(two);
    expect(label).toContain("state:a");
    expect(label).toContain("held:b+c");
    expect(label.split(" | ")).toHaveLength(two.closed_by.length);
  });

test("what am I holding reaches the wire only from the step, and reports "
   + "the answer in the answer's own numbers", async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    await page.getByTestId("watch-sync-confirm")
      .getByTestId("watch-sync-go").click();
    await expect(page.getByTestId("watch-sync-result")).toBeVisible();
    expect(seen.syncCalls).toBe(1);
    // the step closes once it has fired: "this asks what your journal
    // holds — nothing has been asked yet" standing beside the answer is
    // two claims about one press
    await expect(page.getByTestId("watch-sync-confirm")).toHaveCount(0);
    const out = page.getByTestId("watch-sync-result");
    // DERIVED FROM THE SERVED ANSWER, never a number typed here
    await expect(out).toContainText(`held ${HELD.checked}`);
    await expect(out).toContainText(
      `declared of those ${HELD.declared_of_the_held.length}`);
    // a position on a match nobody declared is NAMED — the ordinary
    // case now, and a report rather than a disagreement
    await expect(out).toContainText(
      `held and undeclared ${HELD.open_positions_not_monitored.join(", ")}`);
    // …and the route's OWN word for what it did, not this file's
    await expect(out.getByTestId("watch-sync-wrote"))
      .toHaveAttribute("data-writes-nothing", "true");
    await expect(out).not.toContainText(/already declared/i);
  });

test("an answer that does not carry writes_nothing does not read as "
   + "'wrote nothing'", async ({ page }) => {
    // MISSING IS NEVER ZERO, on the one field that says whether a
    // permanent record was made. A body without it is an answer that
    // did not say — never a promise that nothing was written.
    const quiet: Record<string, unknown> = { ...HELD };
    delete quiet.writes_nothing;
    await serve(page, { sync: quiet });
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    await page.getByTestId("watch-sync-confirm")
      .getByTestId("watch-sync-go").click();
    const wrote = page.getByTestId("watch-sync-result")
      .getByTestId("watch-sync-wrote");
    await expect(wrote).toHaveAttribute("data-writes-nothing", "absent");
    await expect(wrote).toContainText("not on the payload");
    await expect(wrote).not.toContainText("wrote nothing");
  });

// ------------------------------------------------- the plane is dormant

test("a dormant live plane is words, never a plausible empty set",
  async ({ page }) => {
    const detail = "the live plane is not configured, so no declaration "
      + "can be recorded or read";
    await serve(page, {
      state: { dormant: true, detail, version: "watchlist-v1" },
    });
    await page.goto("/bet-suggester");
    await arm(page);
    await expect(page.getByTestId("watch-dormant")).toContainText(detail);
    // and no counts are drawn beside it
    await expect(page.getByTestId("watch-state")).toHaveCount(0);
    await expect(page.getByTestId("watch-panel-chip"))
      .toHaveText("plane dormant");
    // EVERY ROW SAYS IT TOO. A dormant plane holds no set, so "not
    // watched" would be a claim about a set that does not exist — the
    // plausible-empty-set failure this rule is named after.
    for (const id of ["401000001", "401000002", "401000003"]) {
      await expect(toggle(page, id)).toHaveAttribute("data-state", "dormant");
      await expect(toggle(page, id).getByTestId("watch-row-dormant"))
        .toHaveText("live plane not configured");
      await expect(toggle(page, id)).not.toContainText("not watched");
    }
  });

test("a payload that carries no set is not an empty set",
  async ({ page }) => {
    // THE SAME FOLD ONE LAYER OVER. `state !== null` was the test for
    // "the set is known"; a non-dormant answer that simply omits
    // monitored_fixture_ids would have rendered as "0 declared" on the
    // chip and "not watched" on every row — this surface inventing the
    // one number it exists to report. The shape is read now, not the
    // truthiness.
    await serve(page, { state: {
      version: "watchlist-v1", generated_at: new Date().toISOString(),
    } });
    await page.goto("/bet-suggester");
    await arm(page);
    await expect(page.getByTestId("watch-panel-chip"))
      .toHaveText("set not on the payload");
    for (const id of ["401000001", "401000002"]) {
      await expect(toggle(page, id)).toHaveAttribute("data-state", "unread");
      await expect(toggle(page, id)).not.toContainText("not watched");
      await expect(toggle(page, id)).not.toContainText("watching");
    }
    // and every count in the panel names the absence rather than
    // printing a zero. "no removal was refused" and "the record did not
    // say" are different facts and only one of them is a claim.
    const counts = page.getByTestId("watch-state");
    await expect(counts).toContainText("removals refused");
    await expect(counts.getByText("not on the payload").first()).toBeVisible();
    await expect(counts).not.toContainText(/\b0\b/);
  });

test("a failed read drops the set rather than leaving a stale one beside live rows",
  async ({ page }) => {
    await serve(page, {
      state: { detail: "operator credentials required" }, stateStatus: 403 });
    await page.goto("/bet-suggester");
    await arm(page);
    await expect(page.getByTestId("watch-state-error"))
      .toContainText("operator credentials required");
    await expect(page.getByTestId("watch-state")).toHaveCount(0);
    await expect(page.getByTestId("watch-panel-chip")).toHaveText("unread");
    // and no row claims membership either way off a read that failed
    for (const id of ["401000001", "401000002"]) {
      await expect(toggle(page, id)).toHaveAttribute("data-state", "unread");
      await expect(toggle(page, id).getByTestId("watch-row-unread"))
        .toHaveText("declared set unread");
    }
  });

// ------------------------------------ the proxy refuses a guessed identity

test("the declare proxy refuses a reference it cannot read — unmocked on purpose",
  async ({ request }) => {
    // Hermetic in effect: the route validates the reference BEFORE it
    // contacts any backend, so this holds with no backend at all. What
    // it pins is that the ESPN -> fixture join is resolved and never
    // guessed.
    const r = await request.post(
      "/api/bet-suggester/live-watchlist"
      + "?event_id=not-an-id&action=add&actor=son");
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain("is not an ESPN event reference");
  });

test("the declare proxy refuses an action that is not add or remove — unmocked on purpose",
  async ({ request }) => {
    const r = await request.post(
      "/api/bet-suggester/live-watchlist"
      + "?event_id=401000001&action=delete&actor=son");
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain("must be 'add' or 'remove'");
  });

test("a watchlist payload with NO source split says so, rather than "
   + "drawing no sources", async ({ page }) => {
    // THE SAME FOLD `countOf` REFUSES ONE FIELD OVER.
    // `st?.monitored_by_source ?? {}` rendered no rows at all when the
    // block was missing, beside four counts that did arrive — which
    // reads as "there are no sources" off an answer that named none.
    // WatchedStrip already states this case ("no source counts on this
    // payload"); this panel did not.
    const noSplit: Record<string, unknown> = { ...STATE };
    delete noSplit.monitored_by_source;
    await serve(page, { state: noSplit });
    await page.goto("/bet-suggester");
    await arm(page);
    const absent = page.getByTestId("watch-sources-absent");
    await expect(absent).toBeVisible();
    await expect(absent).toContainText("not on the payload");
    // and the counts that DID arrive are still counts
    await expect(page.getByTestId("watch-state")).toContainText("declared ever");
  });

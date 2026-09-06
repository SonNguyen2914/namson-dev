import { expect, test } from "@playwright/test";

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
  log: [],
  log_total: 12,
  log_truncated: false,
  log_truncation: null,
  registries: { actions: {}, sources: {}, policy_codes: {}, phases: {} },
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
    return r.fulfill(json(opts.sync ?? {
      checked: 3, declared: [4102], already_declared: [4101],
      unknown_fixture: [], open_positions_not_monitored: [4321],
      actor: "sync:open_positions", generated_at: new Date().toISOString(),
      version: "watchlist-v1",
    }, opts.syncStatus ?? 200));
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

// -------------------------------------------------- watch what I hold

test("watch everything I hold is wired, and reports what it did in its own numbers",
  async ({ page }) => {
    const seen = await serve(page);
    await page.goto("/bet-suggester");
    await arm(page);
    await page.getByTestId("watch-sync").click();
    await expect(page.getByTestId("watch-sync-result")).toBeVisible();
    expect(seen.syncCalls).toBe(1);
    const out = page.getByTestId("watch-sync-result");
    await expect(out).toContainText("checked 3");
    await expect(out).toContainText("declared 1");
    await expect(out).toContainText("already declared 1");
    // a position on a match nobody is watching is NAMED, never silently
    // re-added
    await expect(out).toContainText("held but undeclared 4321");
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

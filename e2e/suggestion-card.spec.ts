import { expect, test } from "@playwright/test";

// The per-fixture SUGGESTION CARD (card-v1). Hermetic: every request is
// a recorded payload (the card is derived from the real
// /api/mls-2026/card/87 response — a settled fixture, so a full REFUSAL
// rendering), no backend involved.
//
// What is pinned here:
//  1. the board's per-fixture view reaches the card panel;
//  2. a REFUSED headline renders its reason text verbatim — refusals
//     are first-class content, never hidden;
//  3. style notes carry the measured non-predictive label, and the λ
//     number carries its display-only label, both verbatim;
//  4. a card fetch failure names its HTTP status — never a blank panel,
//     never invented content;
//  5. the LIVE BROADCAST: while the payload carries
//     layers.inplay_plan.live_now the card shows the minute, the score
//     and all three probabilities, re-fetches itself on the interval,
//     and holds the last good numbers (marked stale) when a refresh
//     fails. A live_now refusal renders the collector's own sentence
//     verbatim with no numbers behind it, and a payload WITHOUT
//     live_now — every pre and post card — renders no live block at
//     all.
//  6. the LIVE STATE readout under that bar: possession, shots, on
//     target, corners, cards, threat and the exploratory tilt label
//     render what the tape carries — and a stat the tape does NOT
//     carry renders "—", never 0. A real 0 still prints as 0; the two
//     are different facts and this suite pins the difference. A
//     live_now with no state renders the block exactly as before.

const EVENT = "999999";

const MATCH_PAYLOAD = {
  match: {
    id: EVENT, date: "2026-08-19T23:30Z", state: "post",
    detail: "FT", venue: "Test Park",
    home: { name: "Columbus Crew", abbrev: "CLB", score: "0" },
    away: { name: "CF Montréal", abbrev: "MTL", score: "0" },
    stats: [], events: [],
    scouting: { last_five: [], head_to_head: [] },
  },
  book: null, books: [], model: null, lineups: null,
  generated_at: new Date().toISOString(),
};

// Derived from the real GET /api/mls-2026/card/87 (trimmed, structure
// and every load-bearing sentence intact).
const CARD_PAYLOAD = {
  generated_at: "2026-08-21T01:19:15.837047+00:00",
  content_hash:
    "579542986a681a479d9fab35a95d3da9dccf43e45d7e2ee1f3049267281a036f",
  emission: "duplicate (already journaled)",
  prediction_run_id: "ce8944f6-f587-49a1-bd17-552eb1b02713",
  card: {
    card_version: "card-v1",
    competition: "mls-2026",
    fixture_id: 87,
    headline: {
      value: "REFUSED",
      reason: "edge -0.5288 on home_win below the fee floor +0.03 "
        + "(paper exec policy) — priced, and not worth the fee",
    },
    layers: {
      identity: {
        home: "Columbus Crew", away: "CF Montréal",
        kickoff_utc: "2026-08-19T23:30:00+00:00", venue: "Test Park",
        venue_class: "UNAVAILABLE (venue-class read not built on the "
          + "live plane yet — on the pre-pick reading list)",
        status: "post", espn_event_id: EVENT,
      },
      market: {
        source: "latest stored GAME-family ask book "
          + "(live_watch._game_books)",
        asks: { away: 1.0, home: 1.0, draw: 1.0 },
        devig: { away: 0.3333, home: 0.3333, draw: 0.3333 },
        break_even_fee_inclusive: { away: 1.0, home: 1.0, draw: 1.0 },
        fee_basis: "taker 0.07·p·(1−p) per contract (src/execution); "
          + "maker is 0.0175·p·(1−p) and ROUNDS UP PER ORDER — small "
          + "clips pay up to 2.3x headline (fee-schedule memory); "
          + "resting economics are not quoted here",
      },
      pick: {
        model_outcomes: { home_win: 0.4712, draw: 0.2558,
          away_win: 0.273 },
        run_id: "ce8944f6-f587-49a1-bd17-552eb1b02713",
        run_type: "t10", canonical_t10_lock: true,
        captured_at: "2026-08-19T23:19:59.124578+00:00",
        lead: { outcome: "home_win", p: 0.4712 },
        gate: {
          ask: 1.0, all_in_cost: 1.0, edge_fee_inclusive: -0.5288,
          fee_floor: 0.03, verdict: "REFUSED",
          reason: "edge -0.5288 on home_win below the fee floor +0.03 "
            + "(paper exec policy) — priced, and not worth the fee",
        },
      },
      ftts: {
        backtest: "λ-ratio proxy LOSES to the constant even-cell "
          + "baseline (ftts-backtest-v1) — base rates are the standing "
          + "pick, λ is display-only",
        band: "even_lt75",
        band_basis: "de-vigged favourite 0.333 < 0.6 — price-native "
          + "even, the artifact's |elo_diff|<75 cell",
        base_rates: { n: 6226, home_first_pct: 47.4,
          away_first_pct: 44.8, no_goal_pct: 7.8 },
        standing_pick: "home_first",
        lambda_ratio: {
          p_home_first_lambda: 0.5977,
          basis: "simulator expected goals frozen on the run "
            + "(λh/(λh+λa), the backtest's proxy shape)",
          label: "unproven vs constant baseline (ftts-backtest-v1) — "
            + "display only, nothing prices off this number",
        },
      },
      splits: {
        source: "team-splits-v1 (window: last two seasons; raw "
          + "percentages with n and Wilson bands, no shrinkage)",
        home: {
          team: "Columbus Crew", n_total: 55,
          conditions: {
            home: { n: 27, w: 14, d: 7, l: 6, w_pct: 51.9, d_pct: 25.9,
              l_pct: 22.2, wdl: "52/26/22", wilson95_w: [34.0, 69.3],
              wilson95_d: [13.2, 44.7], wilson95_l: [10.6, 40.8] },
            away: { n: 28, w: 6, d: 10, l: 12, w_pct: 21.4, d_pct: 35.7,
              l_pct: 42.9, wdl: "21/36/43", wilson95_w: [10.2, 39.5],
              wilson95_d: [20.7, 54.2], wilson95_l: [26.5, 60.9] },
            favourite: { n: 44, w: 19, d: 13, l: 12, w_pct: 43.2,
              d_pct: 29.5, l_pct: 27.3, wdl: "43/30/27",
              wilson95_w: [29.7, 57.8], wilson95_d: [18.2, 44.2],
              wilson95_l: [16.3, 41.8] },
            underdog: { n: 11, w: 1, d: 4, l: 6, w_pct: 9.1,
              d_pct: 36.4, l_pct: 54.5, wdl: "9/36/55",
              wilson95_w: [1.6, 37.7], wilson95_d: [15.2, 64.6],
              wilson95_l: [28.0, 78.7] },
          },
          unrated: { n: 0, note: "fixtures with no corpus Elo row; in "
            + "home/away above, absent from fav/dog" },
        },
        away: {
          refused: "no splits row under 'CF Montréal' in team-splits-v1 "
            + "— identity mismatch or outside the two-season window, "
            + "and this card never fuzzy-matches a club name "
            + "(AGENTS.md §6)",
        },
      },
      precedents: {
        band: "0-75",
        band_basis: "price-native gap band from the de-vigged book "
          + "(fav 0.333; even<0.6, fav<0.65, heavy>=0.65)",
        cells: [
          { role: "scoreless_fav_decay_70",
            refused: "not a heavy favourite (de-vigged fav 0.333 < "
              + "0.65) — the decay grid is measured only at gap>=150" },
          { role: "comeback_dog_opener", grid: "comeback_by_strength",
            variant: "clean_11v11",
            source_cell: "comeback_by_strength/bands/0-75/dog_opener",
            n: 1199,
            equalized: { p: 57.5, n: 1199, wilson_low: 54.7,
              wilson_high: 60.3 },
            overturned: { p: 20.6, n: 1199, wilson_low: 18.4,
              wilson_high: 23.0 },
            definition: "opener at or before 30': P(equalized "
              + "eventually) and P(overturned at FT), by opener side "
              + "and gap band",
            examples: [
              { home: "FC Dallas", away: "Toronto FC",
                date: "2026-02-22", score: "3-2", source: "mls-2026" },
              { home: "Austin", away: "Minnesota United FC",
                date: "2026-02-22", score: "2-2", source: "mls-2026" },
            ] },
          { role: "late_opener", grid: "late_opener",
            variant: "clean_11v11", source_cell: "late_opener/0-75",
            n: 339,
            wdl: { fav_win: 81.4, draw: 16.8, dog_win: 1.8 },
            wilson_low: { fav_win: 76.9, draw: 13.2, dog_win: 0.8 },
            wilson_high: { fav_win: 85.2, draw: 21.2, dog_win: 3.8 },
            definition: "no goal before 61' and the favourite scores "
              + "first: W/D/L at FT by gap band",
            examples: [
              { home: "FC Cincinnati", away: "Atlanta United FC",
                date: "2026-02-21", score: "2-0", source: "mls-2026" },
            ] },
        ],
      },
      style_notes: {
        label: "context — measured non-predictive to date (styles-v1 "
          + "predictive_status: unproven-display-only)",
        axes: ["opening_intensity", "first_leader_rate", "chase",
          "front_runner_kill", "late_game", "overturn"],
        home: {
          team: "Columbus Crew", matches: 55,
          axes: {
            chase: { league_mean: 0.4235849056603774, n: 39,
              raw: 0.5384615384615384, reason: null, refused: false,
              shrunk: 0.5279433359246782 },
            first_leader_rate: { league_mean: 0.4703337453646477, n: 55,
              raw: 0.5272727272727272, reason: null, refused: false,
              shrunk: 0.5216721716752112 },
          },
        },
        away: {
          refused: "no style row under 'CF Montréal' in styles-v1 — "
            + "identity mismatch, never fuzzy-matched",
        },
      },
      inplay_plan: {
        danger_windows: {
          equalizer_hazard_peak: {
            bin: "75-90", p: 22.0, n: 4764, wilson_low: 20.8,
            wilson_high: 23.2,
            meaning: "P(a one-goal lead is equalized within 15') peaks "
              + "at 22.0% in the 75-90' window — leads never get safer "
              + "per-minute",
          },
          late_opener: { role: "late_opener_danger", grid: "late_opener",
            variant: "clean_11v11", source_cell: "late_opener/0-75",
            n: 339, wdl: { fav_win: 81.4, draw: 16.8, dog_win: 1.8 },
            wilson_low: { fav_win: 76.9, draw: 13.2, dog_win: 0.8 },
            wilson_high: { fav_win: 85.2, draw: 21.2, dog_win: 3.8 },
            definition: "no goal before 61' and the favourite scores "
              + "first: W/D/L at FT by gap band",
            examples: [] },
        },
        red_card_rule: "a red card VOIDS every grid number on this card "
          + "from first sighting — all priors were measured on 11-v-11 "
          + "play (clean_11v11), and the runtime gate refuses from the "
          + "first dismissal (src/live/patterns.py)",
        cash_out_ladder: "NOT YET SHIPPED — no exit policy is quoted; "
          + "placeholder kept so the absence stays on the template",
      },
      evidence: {
        artifacts: {
          grids: { artifact: "inplay-lookup-grids", version: "grids-v1",
            built: "2026-08-20" },
          team_splits: { artifact: "team-splits", version: "1.0.0",
            built: "2026-08-20" },
          styles: { artifact: "team-temporal-style-profiles",
            version: "styles-v1", built: "2026-08-20T00:00:00+00:00" },
          ftts_backtest: { artifact: "ftts-backtest-v1",
            version: "ftts-backtest-v1",
            built: "2026-08-20T00:00:00+00:00" },
        },
        card_version: "card-v1",
        content_hash_basis: "sha256 over the sorted-key card payload "
          + "(this object included, hash excluded); stored on the "
          + "CardEmission row",
      },
    },
  },
};

// --- the live block (backend src/live/card.py _live_now) -------------
//
// Present ONLY while the fixture is in play. Both shapes below are the
// backend's own: the live triple, and a refusal carrying the
// collector's sentence (here live_watch.NO_LOCK, verbatim).
const LIVE_NOW = {
  minute: "63'",
  captured_at: "2026-08-21T19:53:02.114820+00:00",
  score: "1-0",
  p: { home: 0.6412, draw: 0.2411, away: 0.1177 },
  lambdas: { home: 1.4321, away: 1.0212 },
  basis: "inplay-wire-v1 | anchor: canonical T-10 lock ce8944f6 "
    + "de-vigged 3-way | calibration exact | state minute 63 score 1-0",
};

const LIVE_NOW_LATER = {
  minute: "78'",
  captured_at: "2026-08-21T20:08:04.551190+00:00",
  score: "2-1",
  p: { home: 0.5109, draw: 0.2203, away: 0.2688 },
  lambdas: { home: 1.4321, away: 1.0212 },
  basis: "inplay-wire-v1 | anchor: canonical T-10 lock ce8944f6 "
    + "de-vigged 3-way | calibration exact | state minute 78 score 2-1",
};

const LIVE_REFUSAL = "no canonical T-10 lock with a complete frozen "
  + "3-way book — the engine anchors on the belief the lock froze at "
  + "T-10 and will not invent a kickoff belief after kickoff, so NO "
  + "NUMBER is written";

const LIVE_NOW_REFUSED = {
  minute: "45'", captured_at: "2026-08-21T19:35:11.902341+00:00",
  score: "0-0", refused: LIVE_REFUSAL,
};

// --- the state sub-block (live_now.state) ----------------------------
//
// FULL: every field the backend can attach. Note red.home is null while
// red.away is 1 — one side observed, the other not, on the same row.
const LIVE_STATE = {
  possession: { home: 61.4, away: 38.6 },
  shots: { home: 14, away: 6 },
  on_target: { home: 5, away: 1 },
  corners: { home: 9, away: 2 },
  cards: { yellow: { home: 1, away: 3 }, red: { home: null, away: 1 } },
  threat: 0.72,
  tilt_label: "SIEGE",
  tilt_note: "one side is camped in the other's half — an EXPLORATORY "
    + "split of the live state, not a measured pattern: nothing is "
    + "backtested behind it and no number prices off it",
};

// GAPS: the case the readout exists for. possession is present but
// unknown on both sides; shots knows the home count (which is ZERO —
// a reading, not an absence) and not the away one; on_target is null
// outright; corners knows both, one of them a real 0; threat carries
// the collector's refusal instead of an index; no cards key at all.
const THREAT_REFUSAL = "no shot-location feed on this row — the threat "
  + "index is not computed from counts, and this card will not stand "
  + "one up from the ones it has";

const LIVE_STATE_GAPS = {
  possession: { home: null, away: null },
  shots: { home: 0, away: null },
  on_target: null,
  corners: { home: 3, away: 0 },
  threat: { refused: THREAT_REFUSAL },
  tilt_label: null,
};

function withState(live: Record<string, unknown>, state: unknown) {
  return { ...live, state };
}

function withHeadline(headline: unknown) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.headline = headline;
  return c;
}

function withLiveNow(live: unknown) {
  const c = JSON.parse(JSON.stringify(CARD_PAYLOAD));
  c.card.layers.inplay_plan.live_now = live;
  return c;
}

type Pg = import("@playwright/test").Page;

async function serveMatch(page: Pg) {
  await page.route(`**/api/mls/match/${EVENT}`, (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify(MATCH_PAYLOAD) }));
}

async function serveCard(page: Pg, body: unknown = CARD_PAYLOAD,
                         status = 200) {
  await page.route(`**/api/card/mls-2026/${EVENT}`, (r) =>
    r.fulfill({ status, contentType: "application/json",
                body: JSON.stringify(body) }));
}

async function serveBoard(page: Pg) {
  await page.route("**/api/mls/scoreboard", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
                body: JSON.stringify({ fixtures: [{
                  id: EVENT, date: "2026-08-19T23:30Z", state: "pre",
                  detail: "Scheduled", venue: "Test Park",
                  home: { name: "Columbus Crew", abbrev: "CLB" },
                  away: { name: "CF Montréal", abbrev: "MTL" },
                }] }) }));
  for (const [path, body] of [
    ["**/api/mls/standings", { conferences: [] }],
    ["**/api/mls/schedule**", { fixtures: [] }],
    ["**/api/mls/markets", { games: [] }],
    ["**/api/mls/odds", { odds: [] }],
  ] as const) {
    await page.route(path, (r) =>
      r.fulfill({ status: 200, contentType: "application/json",
                  body: JSON.stringify(body) }));
  }
}

test.describe("suggestion card (recorded payloads)", () => {
  test("the board's per-fixture view reaches the card panel",
    async ({ page }) => {
      await serveBoard(page);
      await serveMatch(page);
      await serveCard(page);
      await page.goto("/bet-suggester?league=mls");
      await page.getByText("Columbus Crew").first().click();
      await expect(page).toHaveURL(new RegExp(`/bet-suggester/mls/${EVENT}`));
      await expect(page.getByText(/suggestion card/i).first())
        .toBeVisible();
      // headline first and dominant: the word REFUSED is on screen
      await expect(page.getByText("REFUSED").first()).toBeVisible();
    });

  test("a REFUSED headline renders its reason verbatim, and refused "
    + "blocks stay visible", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the one number that orders action — here the word and its reason
      await expect(page.getByText(/below the fee floor \+0\.03/).first())
        .toBeVisible();
      // a refused block renders its words, never disappears
      await expect(
        page.getByText(/no splits row under 'CF Montréal'/).first())
        .toBeVisible();
      await expect(
        page.getByText(/never fuzzy-matched/).first()).toBeVisible();
      // the in-play plan carries the red-card void sentence and the
      // unshipped cash-out ladder as-is
      await expect(
        page.getByText(/a red card VOIDS every grid number/i).first())
        .toBeVisible();
      await expect(page.getByText(/NOT YET SHIPPED/).first())
        .toBeVisible();
      // decision safety: shadow framing on the panel, never a bare TAKE
      await expect(page.getByText(/shadow · not advice/i).first())
        .toBeVisible();
      await expect(page.getByText(/^TAKE$/)).toHaveCount(0);
    });

  test("style notes carry the measured non-predictive label and λ its "
    + "display-only label", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(
        page.getByText(/measured non-predictive to date/i).first())
        .toBeVisible();
      await expect(
        page.getByText(/display only, nothing prices off this number/i)
          .first()).toBeVisible();
      // base rates are the standing pick — visible with their n
      await expect(page.getByText(/standing pick/i).first())
        .toBeVisible();
    });

  test("a card fetch failure names its HTTP status — never a blank "
    + "panel, never invented content", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, { error: "card unavailable" }, 503);
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByText(/card unavailable/i).first())
        .toBeVisible();
      await expect(page.getByText(/http 503/i).first()).toBeVisible();
      // no invented card content behind the failure
      await expect(page.getByText("REFUSED")).toHaveCount(0);
      await expect(page.getByText(/fee floor/)).toHaveCount(0);
    });

  test("a card WITH live_now broadcasts the minute, the score and all "
    + "three probabilities, first in the in-play section",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      // the state on the tape
      await expect(live).toContainText("63'");
      await expect(live).toContainText("1-0");
      // all three outcomes, exact, beneath their own bar segment
      await expect(live).toContainText("64.1%");
      await expect(live).toContainText("24.1%");
      await expect(live).toContainText("11.8%");
      // three segments, one per outcome, sized by the probabilities
      const widths = await live.locator("div.rounded-full > div")
        .evaluateAll((els) => els.map(
          (e) => Math.round(parseFloat((e as HTMLElement).style.width)
                            * 100) / 100));
      expect(widths).toEqual([64.12, 24.11, 11.77]);
      // where the number comes from, and when it was captured
      await expect(live).toContainText(/frozen T-10 lock/);
      await expect(live).toContainText("2026-08-21T19:53:02.114820+00:00");
      await expect(live).toContainText(/updated \d\d:\d\d:\d\dZ/);
      // decision safety travels with the live numbers
      await expect(live).toContainText(/shadow · not advice/);
      // FIRST in the in-play section — the readout, not a footnote
      expect(await live.evaluate(
        (el) => el.parentElement?.firstElementChild === el)).toBe(true);
    });

  test("a live_now refusal renders the collector's words verbatim, with "
    + "no numbers behind it", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW_REFUSED));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      await expect(live).toContainText(LIVE_REFUSAL);
      // the state it refused at is still shown
      await expect(live).toContainText("45'");
      await expect(live).toContainText("0-0");
      // never a zero bar reading as a real forecast (AGENTS.md §2)
      await expect(live.locator("div.rounded-full > div")).toHaveCount(0);
      expect(await live.innerText()).not.toContain("%");
    });

  test("a card WITHOUT live_now renders no live block at all — pre and "
    + "post cards are untouched", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page);          // the recorded settled-fixture card
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // the in-play section is there, exactly as it always rendered
      await expect(
        page.getByText(/a red card VOIDS every grid number/i).first())
        .toBeVisible();
      await expect(page.getByTestId("live-now")).toHaveCount(0);
      await expect(page.getByText(/live now/i)).toHaveCount(0);
      await expect(page.getByText(/frozen T-10 lock/i)).toHaveCount(0);
      await expect(page.getByText(/updated \d\d:\d\d:\d\dZ/))
        .toHaveCount(0);
    });

  test("live_now.state renders the tape's own counts — possession as a "
    + "share, shots / on target / corners / cards as pairs, and the "
    + "tilt label with its note", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(withState(LIVE_NOW, LIVE_STATE)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      const st = page.getByTestId("live-state");
      await expect(st).toBeVisible();
      // observation, said in words — this is not model output
      await expect(st).toContainText(/observed on the tape, not modelled/);

      // possession: the two shares, and a bar drawn from the SAME pair
      const poss = page.getByTestId("live-stat-possession");
      await expect(poss.locator("span.text-accent")).toHaveText("61.4%");
      await expect(poss.locator("span.text-sky-400")).toHaveText("38.6%");
      const posWidths = await page.getByTestId("possession-bar")
        .locator("div").evaluateAll((els) => els.map(
          (e) => Math.round(parseFloat((e as HTMLElement).style.width)
                            * 10) / 10));
      expect(posWidths).toEqual([61.4, 38.6]);

      // the count pairs, home in the accent and away in the sky — the
      // same two colours the probability bar gives the same two teams
      for (const [id, h, a] of [
        ["shots", "14", "6"], ["on-target", "5", "1"],
        ["corners", "9", "2"], ["yellow", "1", "3"],
      ] as const) {
        const row = page.getByTestId(`live-stat-${id}`);
        await expect(row.locator("span.text-accent")).toHaveText(h);
        await expect(row.locator("span.text-sky-400")).toHaveText(a);
      }
      // one side observed, the other not, on the SAME row
      const red = page.getByTestId("live-stat-red");
      await expect(red.locator("span.text-accent")).toHaveText("\u2014");
      await expect(red.locator("span.text-sky-400")).toHaveText("1");

      await expect(page.getByTestId("live-stat-threat"))
        .toContainText("0.72");

      // the tilt chip, and its note ON SCREEN as well as in the title —
      // an unvalidated split whose caveat is hidden reads as settled
      const chip = page.getByTestId("tilt-chip");
      await expect(chip).toHaveText("SIEGE");
      expect(await chip.getAttribute("title"))
        .toBe(LIVE_STATE.tilt_note);
      await expect(page.getByTestId("live-tilt"))
        .toContainText("EXPLORATORY split of the live state, not a "
          + "measured pattern");
      await expect(page.getByTestId("live-tilt"))
        .toContainText(/tilt · exploratory/);

      // and the block above it is untouched: minute, score, the triple
      await expect(live).toContainText("63'");
      await expect(live).toContainText("64.1%");
      await expect(page.getByTestId("live-prob-bar").locator("div"))
        .toHaveCount(3);
    });

  test("a stat the tape does not carry renders \u2014, never 0 — and a "
    + "real 0 still renders 0", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page,
        withLiveNow(withState(LIVE_NOW, LIVE_STATE_GAPS)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("live-state")).toBeVisible();

      // possession unknown on both sides: dashes, no invented 50/50,
      // and NO BAR — a share cannot be drawn from numbers that are
      // not there
      const poss = page.getByTestId("live-stat-possession");
      await expect(poss.locator("span.text-accent")).toHaveText("\u2014");
      await expect(poss.locator("span.text-sky-400")).toHaveText("\u2014");
      await expect(poss).not.toContainText("0");
      await expect(page.getByTestId("possession-bar")).toHaveCount(0);

      // the distinction the block exists for, on two rows: shots knows
      // a real ZERO at home and knows NOTHING away...
      const shots = page.getByTestId("live-stat-shots");
      await expect(shots.locator("span.text-accent")).toHaveText("0");
      await expect(shots.locator("span.text-sky-400")).toHaveText("\u2014");
      // ...corners knows both, and its 0 is a reading that stays a 0
      const corners = page.getByTestId("live-stat-corners");
      await expect(corners.locator("span.text-accent")).toHaveText("3");
      await expect(corners.locator("span.text-sky-400")).toHaveText("0");

      // a null pair still says so rather than vanishing
      const ont = page.getByTestId("live-stat-on-target");
      await expect(ont.locator("span.text-accent")).toHaveText("\u2014");
      await expect(ont.locator("span.text-sky-400")).toHaveText("\u2014");

      // threat: the collector's refusal in its own words, no index
      await expect(page.getByTestId("live-stat-threat"))
        .toContainText(THREAT_REFUSAL);

      // absent keys render nothing at all — no phantom rows of zeroes
      await expect(page.getByTestId("live-stat-yellow")).toHaveCount(0);
      await expect(page.getByTestId("live-stat-red")).toHaveCount(0);
      await expect(page.getByTestId("live-tilt")).toHaveCount(0);
    });

  test("a live_now with NO state renders the block exactly as before — "
    + "no readout, no empty rows", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withLiveNow(LIVE_NOW));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toBeVisible();
      // the block that shipped before the readout existed, intact
      await expect(live).toContainText("63'");
      await expect(live).toContainText("1-0");
      await expect(live).toContainText("64.1%");
      await expect(live).toContainText("24.1%");
      await expect(live).toContainText("11.8%");
      await expect(live).toContainText(/frozen T-10 lock/);
      await expect(page.getByTestId("live-prob-bar").locator("div"))
        .toHaveCount(3);
      // ...and nothing of the state readout in the DOM
      await expect(page.getByTestId("live-state")).toHaveCount(0);
      await expect(page.getByTestId("possession-bar")).toHaveCount(0);
      await expect(page.getByText(/observed on the tape/))
        .toHaveCount(0);
    });

  test("a REFUSED triple still shows the state the collector saw — the "
    + "refusal is about the number, not about the tape",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page,
        withLiveNow(withState(LIVE_NOW_REFUSED, LIVE_STATE)));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toContainText(LIVE_REFUSAL);
      // no probability bar and no triple behind the refusal
      await expect(page.getByTestId("live-prob-bar")).toHaveCount(0);
      await expect(live).not.toContainText(/frozen T-10 lock/);
      // but the observed counts are still observations
      await expect(page.getByTestId("live-stat-shots"))
        .toContainText("14");
      await expect(page.getByTestId("live-state"))
        .toContainText(/observed on the tape, not modelled/);
    });

  test("while live_now is present the card re-fetches itself and "
    + "updates in place; a failed refresh holds the last good numbers "
    + "and marks them stale", async ({ page }) => {
      await page.clock.install();
      await serveMatch(page);
      let hit = 0;
      await page.route(`**/api/card/mls-2026/${EVENT}`, (r) => {
        hit += 1;
        if (hit >= 3) {
          return r.fulfill({ status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "card unavailable" }) });
        }
        return r.fulfill({ status: 200,
          contentType: "application/json",
          body: JSON.stringify(withLiveNow(
            hit === 1 ? LIVE_NOW : LIVE_NOW_LATER)) });
      });
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const live = page.getByTestId("live-now");
      await expect(live).toContainText("63'");
      await expect(live).toContainText("64.1%");

      // one 60s tick later the card has re-fetched and moved on
      await page.clock.fastForward("01:05");
      await expect(live).toContainText("78'");
      await expect(live).toContainText("2-1");
      await expect(live).toContainText("51.1%");

      // the next refresh fails: the numbers stay, marked stale — a live
      // card that blanked would read as "the match stopped"
      await page.clock.fastForward("01:05");
      await expect(live).toContainText(/stale/);
      await expect(live).toContainText("78'");
      await expect(live).toContainText("51.1%");
      await expect(page.getByText(/card unavailable/i)).toHaveCount(0);
    });
});

test.describe("the disagreement rail is visible, not just present", () => {
  // The rail exists because a LARGE model-market disagreement measured
  // WORSE (ledger row 8). A warned number painted in the accent colour
  // would read as "take this" — which is the exact inversion the rail
  // is there to prevent, so these tests guard the COLOUR as well as
  // the words.
  test("a warned headline shows its warning and drops the accent",
    async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withHeadline({
        value: 0.0933,
        warning: "WARNING — a disagreement this large measured WORSE, not better: the read sat above the market on 17 of 18 real-money legs and lost the Brier head-to-head (ledger row 8). Not an invitation.",
        disagreement_tvd: 0.1766,
        ledger_row: 8,
        meaning: "fee-inclusive edge on away_win — non-lead outcome",
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      const w = page.getByTestId("headline-warning");
      await expect(w).toBeVisible();
      await expect(w).toContainText("measured WORSE");
      await expect(w).toContainText("ledger row 8");
      await expect(w).toContainText("0.177");
      // the number is still shown — hiding it would hide information
      await expect(page.getByText("+0.0933")).toBeVisible();
      // ...but never in the accent colour
      const cls = await page.getByText("+0.0933").getAttribute("class");
      expect(cls).toContain("text-warn");
      expect(cls).not.toContain("text-accent");
    });

  test("an unwarned positive headline keeps the accent and shows no "
    + "warning block", async ({ page }) => {
      await serveMatch(page);
      await serveCard(page, withHeadline({
        value: 0.0412,
        meaning: "fee-inclusive edge on home_win",
      }));
      await page.goto(`/bet-suggester/mls/${EVENT}`);
      await expect(page.getByTestId("headline-warning")).toHaveCount(0);
      const cls = await page.getByText("+0.0412").getAttribute("class");
      expect(cls).toContain("text-accent");
    });
});

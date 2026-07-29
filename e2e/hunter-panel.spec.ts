import { expect, test } from "@playwright/test";

// Market Hunter panel — hermetic contract + decision-safety tests.
// Recorded payloads built from the backend branch's API shape
// (origin/feat-market-hunter: hunter.findings_report), served from the
// route layer so the suite needs no backend and cannot rot with live
// data. Pinned invariants:
//   - the 404 / not-deployed state is explicit, never a spinner
//   - a dead scanner READS as dead (the API's own heartbeat doc)
//   - findings counts never appear without their denominators
//   - no imperative order language anywhere on the page
//   - context findings are labelled "context — not a win"
//   - MODEL_EDGE renders the API's qualifier verbatim
//   - IN_PLAY_OVERREACTION carries its conditionality sentence

const PAGE = "/bet-suggester/hunter";

const FRAMING =
  "shadow mode — observational record only; no order was or will be " +
  "placed, and nothing here is advice";
const HEARTBEAT_NOTE =
  "age_seconds far above the poll cadence means the scanner is DEAD, " +
  "not that the market is quiet";
const QUALIFIER_NOTE =
  "point estimate only; the interval includes zero unless " +
  "'significant' is true — never read this as an established edge";
const CONDITIONALITY =
  "the conditioning match event (goal, red card, abandonment...) is " +
  "UNOBSERVED by this scanner; a large move may be a CORRECT instant " +
  "repricing — this row claims a move happened, never that the market " +
  "is wrong";

const QUALIFIER = {
  edge_vs_baseline: 0.0078, ci_low: -0.0126, ci_high: 0.0282,
  n_scored: 177, significant: false, decision_id: 4,
  decision_content_hash: "79c32d7d", note: QUALIFIER_NOTE,
};

const ISO = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

function findings() {
  return [
    { // structural, open, fully sized
      id: 61, competition_slug: null, series: "KXEPLGAME",
      event_ticker: "KXEPLGAME-26AUG01ARSCHE", market_ticker: null,
      finding_type: "SUM_BELOW_ONE", is_context: false, context_note: null,
      net_margin_dollars: "0.0112", fee_policy_version: "kalshi-general-v1",
      legs: {
        rule: "1 - sum(yes_ask) - sum(fee_per_leg) > 0 over a full 3-way partition",
        captured_at: ISO(400e3),
        legs: [
          { ticker: "KXEPLGAME-26AUG01ARSCHE-ARS",
            yes_ask_dollars: "0.44", yes_ask_size: "25", fee_dollars: "0.0173" },
          { ticker: "KXEPLGAME-26AUG01ARSCHE-TIE",
            yes_ask_dollars: "0.27", yes_ask_size: "12", fee_dollars: "0.0138" },
          { ticker: "KXEPLGAME-26AUG01ARSCHE-CHE",
            yes_ask_dollars: "0.24", yes_ask_size: "40", fee_dollars: "0.0128" },
        ],
        sum_asks_dollars: "0.95", sum_fees_dollars: "0.0439",
        payout_dollars: "1", net_margin_dollars: "0.0112",
        liquidity: {
          status: "sized",
          sizes: { "yes_ask_size:KXEPLGAME-26AUG01ARSCHE-ARS": "25",
                   "yes_ask_size:KXEPLGAME-26AUG01ARSCHE-TIE": "12",
                   "yes_ask_size:KXEPLGAME-26AUG01ARSCHE-CHE": "40" },
          limiting_quantity: "12",
          note: "executable at top-of-book up to limiting_quantity contracts",
        },
        fee_policy: "kalshi-general-v1",
      },
      model_qualifier: null,
      first_captured_at: ISO(400e3), last_seen_at: ISO(130e3),
      observed_cycles: 2, detected_at: ISO(399e3), persisted_at: ISO(398e3),
      espn_captured_at: null, status: "open", expired_at: null,
      alerted_at: ISO(390e3), alert_results: null,
    },
    { // structural, open, MODEL_EDGE with its qualifier
      id: 60, competition_slug: "mls-2026", series: "KXMLSGAME",
      event_ticker: "KXMLSGAME-26AUG02LAFCSEA",
      market_ticker: "KXMLSGAME-26AUG02LAFCSEA-LAFC",
      finding_type: "MODEL_EDGE", is_context: false, context_note: null,
      net_margin_dollars: "0.0410", fee_policy_version: "kalshi-general-v1",
      legs: {
        rule: "model_p - yes_ask - fee >= 0.03 (readout of the existing " +
              "shadow model; observational)",
        captured_at: ISO(410e3), outcome_key: "home_win",
        model_probability: 0.52, prediction_run_id: 9114,
        model_approval_decision_id: 4, yes_ask_dollars: "0.46",
        fee_dollars: "0.0190", net_edge_dollars: "0.0410",
        fee_policy: "kalshi-general-v1", standing_qualifier: QUALIFIER,
      },
      model_qualifier: QUALIFIER,
      first_captured_at: ISO(410e3), last_seen_at: ISO(130e3),
      observed_cycles: 3, detected_at: ISO(409e3), persisted_at: ISO(408e3),
      espn_captured_at: null, status: "open", expired_at: null,
      alerted_at: null, alert_results: null,
    },
    { // context, open, conditionality-disciplined
      id: 59, competition_slug: null, series: "KXLIGAGAME",
      event_ticker: "KXLIGAGAME-26AUG02RMABAR",
      market_ticker: "KXLIGAGAME-26AUG02RMABAR-RMA",
      finding_type: "IN_PLAY_OVERREACTION", is_context: true,
      context_note: "liquidity context, not a win",
      net_margin_dollars: null, fee_policy_version: null,
      legs: {
        rule: "|mid_now - mid_prev| >= 0.15 AND > max(spread_prev, " +
              "spread_now), event dated today (context flag, not a win)",
        capture_pair: {
          prev: { captured_at: ISO(1000e3), yes_bid_dollars: "0.55",
                  yes_ask_dollars: "0.58", mid_dollars: "0.565",
                  spread_dollars: "0.03" },
          now: { captured_at: ISO(420e3), yes_bid_dollars: "0.30",
                 yes_ask_dollars: "0.34", mid_dollars: "0.32",
                 spread_dollars: "0.04" },
        },
        mid_move_dollars: "0.245",
        in_play_basis: "ticker date segment matches today US/Eastern; " +
          "kickoff and live state are UNVERIFIED for unmapped competitions",
        conditionality: CONDITIONALITY,
      },
      model_qualifier: null,
      first_captured_at: ISO(420e3), last_seen_at: ISO(420e3),
      observed_cycles: 1, detected_at: ISO(419e3), persisted_at: ISO(418e3),
      espn_captured_at: null, status: "open", expired_at: null,
      alerted_at: null, alert_results: null,
    },
    { // context, open, liquidity_unknown
      id: 58, competition_slug: null, series: "KXBUNDGAME",
      event_ticker: "KXBUNDGAME-26AUG02BAYDOR",
      market_ticker: "KXBUNDGAME-26AUG02BAYDOR-BAY",
      finding_type: "THIN_BOOK", is_context: true,
      context_note: "liquidity context, not a win",
      net_margin_dollars: null, fee_policy_version: null,
      legs: {
        rule: "top-of-book size below threshold, missing " +
              "(liquidity_unknown) or one-sided book (context flag, not a win)",
        captured_at: ISO(430e3),
        reasons: ["yes_ask_size_missing:liquidity_unknown"],
        yes_bid_dollars: "0.61", yes_ask_dollars: "0.66",
        yes_bid_size: "8", yes_ask_size: null,
      },
      model_qualifier: null,
      first_captured_at: ISO(430e3), last_seen_at: ISO(130e3),
      observed_cycles: 2, detected_at: ISO(429e3), persisted_at: ISO(428e3),
      espn_captured_at: null, status: "open", expired_at: null,
      alerted_at: null, alert_results: null,
    },
    { // structural, EXPIRED — episode history stays visible but receded
      id: 41, competition_slug: null, series: "KXEPLGAME",
      event_ticker: "KXEPLGAME-26JUL30LIVMCI",
      market_ticker: "KXEPLGAME-26JUL30LIVMCI-LIV",
      finding_type: "CROSSED_BOOK", is_context: false, context_note: null,
      net_margin_dollars: "0.0021", fee_policy_version: "kalshi-general-v1",
      legs: {
        rule: "yes_bid + no_bid - 1 - fee(1-yes_bid) - fee(1-no_bid) > 0",
        captured_at: ISO(7200e3), yes_bid_dollars: "0.53",
        no_bid_dollars: "0.49", fee_leg_yes_dollars: "0.0174",
        fee_leg_no_dollars: "0.0175", net_margin_dollars: "0.0021",
        liquidity: {
          status: "liquidity_unknown",
          reasons: ["no_bid_side_size_missing"],
          sizes: { yes_bid_size: "10", no_bid_side_size: null },
          no_bid_size_basis: "UNKNOWN — mirror identity no_bid == 1 - " +
            "yes_ask did not hold, no no-side size exists",
          note: "NOT alertable: a structural finding needs a positive " +
            "executable size proven on every required leg; missing size " +
            "is unknown liquidity, never assumed depth",
        },
        fee_policy: "kalshi-general-v1",
      },
      model_qualifier: null,
      first_captured_at: ISO(7200e3), last_seen_at: ISO(3800e3),
      observed_cycles: 5, detected_at: ISO(7199e3), persisted_at: ISO(7198e3),
      espn_captured_at: null, status: "expired", expired_at: ISO(3600e3),
      alerted_at: null, alert_results: null,
    },
  ];
}

function report(over: Record<string, unknown> = {}) {
  return {
    ready: true,
    framing: FRAMING,
    capture_clock: "all capture timestamps are OUR clock; Kalshi " +
      "publishes no quote timestamp (updated_time is the definition clock)",
    fee_policy: "kalshi-general-v1",
    denominators: {
      cycles_run: 412,
      cycles_by_status: { complete: 400, degraded: 11, failed: 1 },
      markets_scanned_total: 183440,
      last_cycle: {
        status: "complete", completed_at: ISO(120e3), age_seconds: 120,
        series_scanned: 14, series_failed: 0, incomplete_series: null,
        markets_scanned: 431, roster_size: 17, active_series: 14,
        discovery_at: ISO(3600e3), discovery_error: null, error: null,
      },
      heartbeat_note: HEARTBEAT_NOTE,
      roster_note: "between discoveries only recently-active series are " +
        "scanned: a series going active is seen with up to 360 minutes of lag",
    },
    findings_per_type: {
      SUM_BELOW_ONE: { open: 1, expired: 0 },
      CROSSED_BOOK: { open: 0, expired: 1 },
      POST_CERTAINTY: { open: 0, expired: 0 },
      WIDE_SPREAD: { open: 0, expired: 0 },
      THIN_BOOK: { open: 1, expired: 0 },
      IN_PLAY_OVERREACTION: { open: 1, expired: 0 },
      MODEL_EDGE: { open: 1, expired: 0 },
    },
    findings_per_type_scope: "global — totals across ALL findings, NOT " +
      "filtered by this query's parameters",
    model_status: { "mls-2026": QUALIFIER, all_other_competitions: "no model" },
    findings: findings(),
    ...over,
  };
}

async function serve(page: import("@playwright/test").Page, body: unknown,
                     status = 200) {
  await page.route("**/api/hunter/findings*", (route) =>
    route.fulfill({ status, contentType: "application/json",
                    body: JSON.stringify(body) }));
}

test.describe("hunter panel (hermetic recorded payloads)", () => {

  test("backend without the hunter branch: explicit 'not deployed', never a spinner",
    async ({ page }) => {
      await serve(page, { detail: "Not Found" }, 404);
      await page.goto(PAGE);
      await expect(page.getByText(/hunter not deployed/i).first())
        .toBeVisible();
      // the skeleton loader must be gone — no spinner-forever
      await expect(page.locator('[aria-label="loading"]')).toHaveCount(0);
      // and no findings/heartbeat shell pretending there is data
      await expect(page.locator("#findings")).toHaveCount(0);
    });

  test("dormant live plane is its own explicit state", async ({ page }) => {
    await serve(page, { ready: false, reason: "live plane dormant" });
    await page.goto(PAGE);
    await expect(page.getByText(/live plane dormant/i).first()).toBeVisible();
    await expect(page.getByText(/no scan is happening/i)).toBeVisible();
    await expect(page.locator('[aria-label="loading"]')).toHaveCount(0);
  });

  test("a dead scanner READS as dead, prominently", async ({ page }) => {
    const den = report().denominators;
    await serve(page, report({
      denominators: {
        ...den,
        last_cycle: {
          ...den.last_cycle,
          status: "complete", completed_at: ISO(86400e3),
          age_seconds: 86400,
        },
      },
    }));
    await page.goto(PAGE);
    await expect(page.getByText(/scanner presumed dead/i)).toBeVisible();
    // the API's own heartbeat doc rides along verbatim
    await expect(page.getByText(HEARTBEAT_NOTE).first()).toBeVisible();
  });

  test("no cycle on record also reads as dead", async ({ page }) => {
    await serve(page, report({
      denominators: { ...report().denominators, last_cycle: null,
        cycles_run: 0, markets_scanned_total: 0,
        cycles_by_status: { complete: 0, degraded: 0, failed: 0 } },
      findings: [], findings_per_type: {},
    }));
    await page.goto(PAGE);
    await expect(page.getByText(/scanner presumed dead/i)).toBeVisible();
    await expect(page.getByText(/never completed a pass/i)).toBeVisible();
  });

  test("degraded last cycle and incomplete series are stated with reasons",
    async ({ page }) => {
      const den = report().denominators;
      await serve(page, report({
        denominators: {
          ...den,
          last_cycle: {
            ...den.last_cycle,
            status: "degraded", series_failed: 2,
            incomplete_series: {
              KXSERIEAGAME: { outcome: "REQUEST_FAILED",
                              detail: "HTTPSConnectionPool timeout" },
              KXUCLGAME: { outcome: "PAGINATION_CAP",
                           detail: "cursor still live after 3x200 markets" },
            },
          },
        },
      }));
      await page.goto(PAGE);
      await expect(page.getByText(/last cycle degraded/i)).toBeVisible();
      await expect(page.getByText("KXSERIEAGAME")).toBeVisible();
      await expect(page.getByText("REQUEST_FAILED")).toBeVisible();
      await expect(page.getByText("PAGINATION_CAP")).toBeVisible();
      await expect(page.getByText(/HTTPSConnectionPool timeout/)).toBeVisible();
    });

  test("healthy report: heartbeat, denominators and grouped findings render",
    async ({ page }) => {
      await serve(page, report());
      await page.goto(PAGE);

      // heartbeat with cycles by status
      await expect(page.getByText(/scanner state/i)).toBeVisible();
      await expect(page.getByText("cycles complete")).toBeVisible();
      await expect(page.getByText("400").first()).toBeVisible();

      // denominators beside the findings count — never a bare count
      await expect(page.getByText(/over 412 cycles/)).toBeVisible();
      await expect(page.getByText(/183440 markets scanned/)).toBeVisible();
      await expect(page.getByText(/findings per type/i)).toBeVisible();
      await expect(page.getByText(/global — totals across ALL findings/i))
        .toBeVisible();

      // structural vs context grouping, context labelled verbatim
      await expect(page.getByText(/mechanically defined, net of exact fees/))
        .toBeVisible();
      await expect(
        page.getByText(/liquidity and repricing context; observational flags/))
        .toBeVisible();
      await expect(page.getByText("context — not a win").first())
        .toBeVisible();

      // arithmetic: the SUM_BELOW_ONE legs and net margin
      await expect(page.getByText("sum(yes_ask)", { exact: true }))
        .toBeVisible();
      await expect(page.getByText("$0.95").first()).toBeVisible();
      await expect(page.getByText("net margin / contract").first())
        .toBeVisible();
      await expect(page.getByText(/limiting executable quantity/i).first())
        .toBeVisible();

      // liquidity_unknown flagged, never passed as depth
      await expect(page.getByText("liquidity_unknown").first()).toBeVisible();

      // expired episode visible but receded
      const expired = page.locator('article[data-status="expired"]');
      await expect(expired).toHaveCount(1);
      await expect(expired.getByText("expired").first()).toBeVisible();
      await expect(expired).toHaveClass(/opacity-55/);

      // the shadow framing footer rides along verbatim
      await expect(page.getByText(FRAMING)).toBeVisible();
    });

  test("MODEL_EDGE carries the API's qualifier verbatim", async ({ page }) => {
    await serve(page, report());
    await page.goto(PAGE);
    const card = page.locator('article[data-type="MODEL_EDGE"]');
    await expect(card).toHaveCount(1);
    await expect(card.getByText(QUALIFIER_NOTE)).toBeVisible();
    await expect(card.getByText("n_scored")).toBeVisible();
    await expect(card.getByText("[-0.0126, 0.0282]")).toBeVisible();
    await expect(card.getByText("false").first()).toBeVisible();
  });

  test("a MODEL_EDGE row missing its qualifier says so — never synthesized",
    async ({ page }) => {
      const rows = findings().map((f) =>
        f.finding_type === "MODEL_EDGE"
          ? { ...f, model_qualifier: null } : f);
      await serve(page, report({ findings: rows }));
      await page.goto(PAGE);
      const card = page.locator('article[data-type="MODEL_EDGE"]');
      await expect(card.getByText(/qualifier missing from the payload/i))
        .toBeVisible();
      await expect(card.getByText(QUALIFIER_NOTE)).toHaveCount(0);
    });

  test("IN_PLAY_OVERREACTION carries its conditionality sentence",
    async ({ page }) => {
      await serve(page, report());
      await page.goto(PAGE);
      const card = page.locator('article[data-type="IN_PLAY_OVERREACTION"]');
      await expect(card).toHaveCount(1);
      await expect(card.getByText(CONDITIONALITY)).toBeVisible();
      // capture-paired: both of OUR clocks shown
      await expect(card.getByText("capture · prev")).toBeVisible();
      await expect(card.getByText("capture · now")).toBeVisible();
      await expect(card.getByText("context — not a win")).toBeVisible();
    });

  test("no imperative order language anywhere on the panel",
    async ({ page }) => {
      await serve(page, report());
      await page.goto(PAGE);
      await expect(page.getByText(/scanner state/i)).toBeVisible();
      await expect(page.getByText(FRAMING)).toBeVisible();
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/\b(buy|sell|take)\b/i);
      expect(body).not.toMatch(/\b(bet now|place|order now)\b/i);
      expect(body).not.toMatch(/NaN|undefined|Infinity/);
    });

  test("empty findings still show their denominators", async ({ page }) => {
    await serve(page, report({ findings: [] }));
    await page.goto(PAGE);
    await expect(page.getByText(/no findings on record/i)).toBeVisible();
    await expect(page.getByText(/412 cycles run/)).toBeVisible();
    await expect(page.getByText(/183440 markets scanned/).first())
      .toBeVisible();
  });
});

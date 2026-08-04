import { expect, test } from "@playwright/test";

// ASEAN Championship viewer — the first NATIONAL-TEAM competition on the
// shared /comp/[key] page. Hermetic: recorded backend shapes only.
//
// What is at stake here is the shape boundary, not pixels:
//  - the page renders a registry-served competition it has never seen
//    (no per-competition frontend code exists, and none may be added);
//  - the national Elo read flows through the SAME Strength type as the
//    club read (elo_difference, expected_points_share) — if it needed a
//    new component, the backend shape-mirroring failed;
//  - an unrated side renders a NAMED refusal, never a number;
//  - no model number appears anywhere, because no model exists.

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

function inHours(h: number) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

const PAYLOAD = {
  competition: "asean",
  display: "ASEAN Championship",
  accent: "#fbbf24",
  season: 2025,
  count: 2,
  with_strength_read: 1,
  finished_hidden: 17,
  framing:
    "Fixtures, real Kalshi prices, and an EXTERNAL strength read. No model " +
    "runs on this surface and no approval decision exists for it, so no " +
    "model number appears anywhere. Nothing here is a recommendation.",
  model: {
    state: "no_model_by_design",
    why: "a national-team cup. Every fitted model in this codebase rates " +
      "clubs within one league's population; no national-team model " +
      "exists here and none is claimed.",
    instead: "the cross-league strength read is used meanwhile",
    note: null,
  },
  strength_notes: { estimate_class: "EXTERNAL_UNEVALUATED" },
  fixtures: [
    {
      fixture_id: 1400001,
      kickoff_utc: inHours(30),
      status: "NS",
      round: "Group Stage - 5",
      home: { name: "Vietnam" },
      away: { name: "Cambodia" },
      goals: { home: null, away: null },
      strength: {
        available: true,
        source: "eloratings_national",
        elo_difference: 516,
        expected_points_share: { home: 0.9512, away: 0.0488 },
        home: { rated: true, club: "Vietnam", source: "eloratings_national",
                rating: 1389 },
        away: { rated: true, club: "Cambodia", source: "eloratings_national",
                rating: 873 },
      },
      kalshi_event: "KXASEANGAME-26AUG07VIECAM",
      meaning: {
        round: "Group Stage - 5",
        stakes: {
          format: "group stage: two groups, single round-robin; the top " +
            "two per group advance to two-legged semi-finals",
          home: { played: 3, w: 3, d: 0, l: 0, points: 9 },
          away: { played: 3, w: 0, d: 1, l: 2, points: 1 },
        },
      },
    },
    {
      fixture_id: 1400002,
      kickoff_utc: inHours(54),
      status: "NS",
      round: "Group Stage - 5",
      home: { name: "Atlantis" },
      away: { name: "Thailand" },
      goals: { home: null, away: null },
      strength: {
        available: false,
        expected_points_share: null,
        home: { rated: false, club: "Atlantis", reason: "name_unmapped",
                reason_words: "no eloratings.net team matches this name; " +
                  "nothing was fuzzy-matched in its place" },
        away: { rated: true, club: "Thailand",
                source: "eloratings_national", rating: 1395 },
      },
    },
  ],
};

const MARKETS = {
  status: "ok",
  series: "KXASEANGAME",
  listed_events: 18,
  tradeable_events: 6,
  events: [],
};

const TOURNAMENT = {
  available: true,
  format: "two groups, single round-robin; top two per group advance",
  forecast_kind:
    "EXTERNAL-RATING FORECAST — a Monte-Carlo simulation on " +
    "eloratings.net's published national Elo. No model of ours runs on " +
    "this competition and no number here is a model probability, an " +
    "edge, or a recommendation.",
  assumptions: {
    draw: "p_draw(E) = 0.163 * (1 - |2E-1|); the anchor is MEASURED",
    two_leg_ties: "P(advance) = single-match Elo expectation",
  },
  groups: [
    { name: "Group A", table: [
      { team: "Thailand", played: 3, w: 2, d: 0, l: 1, gf: 9, ga: 2,
        gd: 7, points: 6 },
      { team: "Malaysia", played: 3, w: 2, d: 0, l: 1, gf: 5, ga: 2,
        gd: 3, points: 6 },
      { team: "Laos", played: 3, w: 0, d: 0, l: 3, gf: 1, ga: 13,
        gd: -12, points: 0 },
    ] },
    { name: "Group B", table: [
      { team: "Vietnam", played: 3, w: 2, d: 1, l: 0, gf: 11, ga: 1,
        gd: 10, points: 7 },
      { team: "Singapore", played: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2,
        gd: 3, points: 7 },
      { team: "Timor-Leste", played: 3, w: 0, d: 0, l: 3, gf: 0, ga: 15,
        gd: -15, points: 0 },
    ] },
  ],
  remaining_group_matches: 6,
  knockout_fixtures_published: 0,
  n_sims: 20000,
  tiebreak_proxy_share: 0.2572,
  champion: null,
  champion_forecast: [
    { team: "Vietnam", p_champion: 0.3608, p_final: 0.6551,
      p_semis: 1.0 },
    { team: "Thailand", p_champion: 0.3572, p_final: 0.6442,
      p_semis: 0.9842 },
    { team: "Laos", p_champion: 0.0, p_final: 0.0, p_semis: 0.0 },
  ],
  champion_forecast_leader: { team: "Vietnam", p: 0.3608 },
  bracket: {
    projected: true,
    basis: "slots filled by simulating the remaining group matches from " +
      "current standings — the pairings are NOT drawn until the groups " +
      "finish",
    semifinals: [
      { name: "SF1",
        home_slot: { label: "Group A winner",
          dist: [{ team: "Thailand", p: 0.62 },
                 { team: "Malaysia", p: 0.38 }] },
        away_slot: { label: "Group B runner-up",
          dist: [{ team: "Singapore", p: 0.55 },
                 { team: "Indonesia", p: 0.41 }] },
        winner_dist: [{ team: "Thailand", p: 0.52 }] },
      { name: "SF2",
        home_slot: { label: "Group B winner",
          dist: [{ team: "Vietnam", p: 0.71 }] },
        away_slot: { label: "Group A runner-up",
          dist: [{ team: "Malaysia", p: 0.5 }] },
        winner_dist: [{ team: "Vietnam", p: 0.63 }] },
    ],
    final: {
      home_slot: { label: "SF1 winner",
        dist: [{ team: "Thailand", p: 0.52 }] },
      away_slot: { label: "SF2 winner",
        dist: [{ team: "Vietnam", p: 0.63 }] },
    },
  },
};

async function open(page: import("@playwright/test").Page) {
  await page.route("**/api/comp/asean/fixtures**", (r) =>
    r.fulfill(json(PAYLOAD)));
  await page.route("**/api/comp/asean/markets**", (r) =>
    r.fulfill(json(MARKETS)));
  await page.route("**/api/comp/asean/tournament", (r) =>
    r.fulfill(json(TOURNAMENT)));
  await page.goto("/bet-suggester/comp/asean");
}

test("a national-team competition renders from the registry alone", async ({
  page,
}) => {
  await open(page);
  await expect(page.getByText("ASEAN Championship").first()).toBeVisible();
  // the reason there is no model is the competition's own, and it says so
  await expect(page.getByText(/national-team cup/).first()).toBeVisible();
});

test("the national Elo read flows through the club read's surface", async ({
  page,
}) => {
  await open(page);
  // 95% carries its own side label — a bare percentage says nothing
  await expect(page.getByText(/VIETNAM\s*95%/).first()).toBeVisible();
});

test("an unrated side is a named refusal, never a number", async ({
  page,
}) => {
  await open(page);
  await expect(page.getByText("no read").first()).toBeVisible();
  // and nothing invented a percentage for the unmapped pairing
  await expect(page.getByText(/ATLANTIS\s*\d+%/)).toHaveCount(0);
});

test("no bare trade verbs on a surface with no model", async ({ page }) => {
  await open(page);
  const body = (await page.textContent("body")) || "";
  expect(body).not.toMatch(/\b(TAKE|BUY NOW|SELL NOW)\b/);
});

test("the tournament surface crowns nobody and names its kind", async ({
  page,
}) => {
  await open(page);
  // the champion spot carries the % inside it, explicitly NOT crowned
  const box = page.locator("section", { hasText: "Road to the title" })
    .getByText("36%", { exact: true });
  await expect(box.first()).toBeVisible();
  await expect(page.getByText(/not crowned/).first()).toBeVisible();
  // the kind disclaimer is on the page, not buried in a tooltip
  await expect(
    page.getByText(/external-rating forecast, not a model/i).first(),
  ).toBeVisible();
});

test("bracket cards ghost their slots as forecast, never model", async ({
  page,
}) => {
  await open(page);
  // slot labels render with their most likely occupant and its %
  await expect(page.getByText("Group A winner").first()).toBeVisible();
  await expect(page.getByText(/Thailand 62%/).first()).toBeVisible();
  // the projected disclaimer sits under the cards
  await expect(
    page.getByText(/pairings are not drawn until the groups finish/i)
      .first(),
  ).toBeVisible();
  // the ghost line says forecast — the word "model:" may not appear
  const body = (await page.textContent("body")) || "";
  expect(body).toMatch(/forecast:/);
  expect(body).not.toMatch(/model:/);
});

test("group tables render with qualification markers", async ({ page }) => {
  await open(page);
  await expect(page.getByText("Group A").first()).toBeVisible();
  const vnRow = page.getByRole("row").filter({ hasText: "Vietnam" });
  await expect(vnRow.first()).toBeVisible();
});

test("the group-phase record renders standard draws, not undefined", async ({
  page,
}) => {
  // ASEAN serves `d` where Leagues Cup serves `d_shootout`; the renderer
  // must read both. This shipped as "3W undefinedD 0L" on prod because
  // the mock carried the right key but nothing asserted the line.
  await open(page);
  // the record lives inside a collapsed match card — attached, not
  // visible, is the honest assertion; the undefined check reads the
  // whole DOM either way
  await expect(page.getByText(/3W 0D 0L · 9 pts/).first()).toBeAttached();
  const body = (await page.textContent("body")) || "";
  expect(body).not.toContain("undefined");
});

test("a withheld forecast renders its reason, never a stale board", async ({
  page,
}) => {
  await page.route("**/api/comp/asean/fixtures**", (r) =>
    r.fulfill(json(PAYLOAD)));
  await page.route("**/api/comp/asean/markets**", (r) =>
    r.fulfill(json(MARKETS)));
  await page.route("**/api/comp/asean/tournament", (r) =>
    r.fulfill(json({ available: false,
                     reason: "unrated teams: Atlantis: name_unmapped" })));
  await page.goto("/bet-suggester/comp/asean");
  await expect(page.getByText(/forecast withheld/).first()).toBeVisible();
  await expect(page.getByText(/Group A/)).toHaveCount(0);
});

test("the comp proxy forwards tournament — unmocked on purpose", async ({
  request,
}) => {
  // Every other test mocks fetch routes in the browser, so the Next API
  // proxy at src/pages/api/comp/[...path].ts is never exercised — which
  // is exactly how "tournament" shipped backend-first and 404'd on prod
  // behind nine green specs. This hits the real dev server. Whatever the
  // backend answers (payload, error, unreachable), the one response that
  // proves the ALLOWLIST rejected it is the proxy's own 404 body.
  for (const resource of ["fixtures", "markets", "tournament", "status"]) {
    const r = await request.get(`/api/comp/asean/${resource}`);
    const body = await r.text();
    expect(body, `${resource} rejected by the proxy allowlist`)
      .not.toContain("unknown comp route");
  }
});

test("no tournament backend leaves the page intact", async ({ page }) => {
  await page.route("**/api/comp/asean/fixtures**", (r) =>
    r.fulfill(json(PAYLOAD)));
  await page.route("**/api/comp/asean/markets**", (r) =>
    r.fulfill(json(MARKETS)));
  await page.route("**/api/comp/asean/tournament", (r) =>
    r.fulfill({ status: 404, contentType: "application/json",
                body: JSON.stringify({ detail: "no tournament surface" }) }));
  await page.goto("/bet-suggester/comp/asean");
  await expect(page.getByText("ASEAN Championship").first()).toBeVisible();
  await expect(page.getByText(/Road to the title/)).toHaveCount(0);
});

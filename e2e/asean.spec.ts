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

async function open(page: import("@playwright/test").Page) {
  await page.route("**/api/comp/asean/fixtures**", (r) =>
    r.fulfill(json(PAYLOAD)));
  await page.route("**/api/comp/asean/markets**", (r) =>
    r.fulfill(json(MARKETS)));
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

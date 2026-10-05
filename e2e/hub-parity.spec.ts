/** PARITY ON THE SHARED MATCH HUB — every feature on all eleven (2026-10-05).
 *
 *  Son's standing order (2026-10-03): a feature ships for ALL matches of
 *  all eleven focus competitions at once, and where a source does not
 *  exist the gap is NAMED. The parity audit's Wave 1 display items:
 *
 *    W1.4   a nation hub reads the match archive's frozen pre-kickoff read,
 *           and says so by name while that read is not served yet
 *    W1.5   a nation review card's missing shot state is a STATED gap,
 *           not a failed read; AFCON qualifiers are a data wall
 *    W1.6   provider absences on every hub, every empty state in words
 *    W1.11  every non-winner Kalshi family is on every hub, present or
 *           named as not served
 *    W1.12  the venue is labelled; neutral ground is never drawn as home,
 *           and ESPN's neutral-site flag is never read as a measurement
 *
 *  HERMETIC. Every /api/ read is answered in the page: a catch-all 503
 *  first, then the reads under test. The payloads are SYNTHETIC, written
 *  in the backend routes' own shapes (TRIVELA src/match_hubs.py `build`,
 *  src/live/team_news.py `fixture_news`, src/match_archive/tail.py), and
 *  every fixture in them kicks off on or before 2026-09-27. The one
 *  recording used (nations-review-recorded.ts) is pre-seal too.
 *
 *  THE ELEVEN ARE DERIVED from the hub pages that exist on disk — the
 *  same directory the build reads its card-link table from
 *  (next.config.ts MATCH_HUBS) — and their count is asserted. */
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { NO_MODEL_HUBS } from "../src/lib/compHub";
import {
  ABSENCE_GAPS, KALSHI_FAMILIES, NATION_HUBS, PLANE_HUBS, SHOT_GAP_WORDS,
  TEAM_NEWS_LABEL,
} from "../src/lib/hubParity";
import { routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { NATIONS_REVIEW } from "./nations-review-recorded";
import { expectForwarded } from "./proxy-forwarding";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

const PAGES = join(__dirname, "..", "src", "pages", "bet-suggester");
/** Every hub page on disk: a directory holding `[eventId].tsx`. */
const HUBS = readdirSync(PAGES, { withFileTypes: true })
  .filter((e) => e.isDirectory()
    && existsSync(join(PAGES, e.name, "[eventId].tsx")))
  .map((e) => e.name).sort();
const GENERIC = new Set(Object.keys(NO_MODEL_HUBS));

const EVENT = "990001";
/** Synthetic, and on or before 2026-09-27. */
const PRE = { date: "2026-09-27T18:00Z", clock: "2026-09-27T12:00:00Z" };
const POST = { date: "2026-09-20T18:00Z", clock: "2026-09-22T12:00:00Z" };

const winnerRows = [
  { ticker: "KXSYN-26SEP27NTHSTH-NTH", label: "Northtown", yes_ask: "0.48",
    yes_bid: "0.46", status: "active", model_key: null },
  { ticker: "KXSYN-26SEP27NTHSTH-TIE", label: "Tie", yes_ask: "0.27",
    yes_bid: "0.25", status: "active", model_key: null },
  { ticker: "KXSYN-26SEP27NTHSTH-STH", label: "Southport", yes_ask: "0.29",
    yes_bid: "0.27", status: "active", model_key: null },
];
const WINNER = { key: "winner", label: "Winner · 3-way",
  event_ticker: "KXSYN-26SEP27NTHSTH", title: "Northtown vs Southport",
  markets: winnerRows };

/** A hub payload in the route's shape. The four planes get no
 *  `model_refusal` / `board_read` — their own payloads carry none. */
function hub(slug: string, over: Record<string, unknown> = {},
  when: typeof PRE = PRE, state: "pre" | "post" = "pre") {
  const generic = GENERIC.has(slug);
  return {
    ...(generic ? {
      competition: slug, display: slug, espn_league: "synthetic",
      model_refusal: { state: "no_model_plane",
        why: "no shadow model is fitted for this competition",
        instead: "board_read", note: null },
      board_read: { origin: "unavailable", origin_label: "NOT AVAILABLE",
        origin_note: "no pre-kickoff board read was frozen for this fixture",
        unavailable_reason: "not_frozen", store_read: "ok", state: null },
      book_meta: { status: "ok", series: "KXSYNGAME", means: "mapped" },
    } : {}),
    match: {
      id: EVENT, date: when.date, state,
      detail: state === "post" ? "FT" : "Sun, September 27th",
      venue: "Synthetic Ground",
      home: { name: "Northtown", abbrev: "NTH",
        score: state === "post" ? "2" : undefined },
      away: { name: "Southport", abbrev: "STH",
        score: state === "post" ? "1" : undefined },
      stats: [], events: [], scouting: { last_five: [], head_to_head: [] },
      neutral_site: false,
    },
    book: WINNER, books: [WINNER],
    model: null, lineups: null,
    generated_at: when.clock,
    ...over,
  };
}

const FRESH = { state: "ok", raw_state: "ok",
  captured_at: "2026-09-27T11:50:00+00:00", age_seconds: 600, stale: false,
  stale_after_seconds: 21600,
  means: "a real read, inside this feed's tolerance" };

/** `/api/news/fixture/{ref}` in `team_news.fixture_news`'s shape. */
function news(absences: Record<string, unknown> | null = {},
  extra: Record<string, unknown> = {}) {
  return {
    fixture_ref: EVENT, generated_at: PRE.clock,
    _not_a_model_input: "Team news is reader context.",
    _provider_words: "type and reason are the provider's own strings",
    ...(absences === null ? {} : { absences: {
      provider: "apifootball",
      records: [
        { player_name: "Avery Keeper", team_name: "Northtown FC",
          provider_type: "Missing Fixture", provider_reason: "Knee Injury",
          provider: "apifootball", still_reported: true,
          captured_at: FRESH.captured_at, first_seen_at: FRESH.captured_at,
          last_seen_at: FRESH.captured_at },
        { player_name: "Blake Winger", team_name: "Southport",
          provider_type: "Questionable", provider_reason: "Hamstring",
          provider: "apifootball", still_reported: false,
          captured_at: FRESH.captured_at, first_seen_at: FRESH.captured_at,
          last_seen_at: "2026-09-27T08:00:00+00:00" },
      ],
      record_count: 2, stored_records: 2, freshness: FRESH, note: null,
      ...absences } }),
    lineup: { by_provider: { espn: {
      sides: {
        home: { team_name: "Northtown", lineup_state: "released",
          released: true, released_minutes_before_kickoff: 58,
          first_released_at: "2026-09-27T17:02:00+00:00" },
        away: { team_name: "Southport", lineup_state: "not_released",
          released: false, released_minutes_before_kickoff: null,
          first_released_at: null },
      },
      freshness: FRESH, note: null } } },
    resolved_fixture: { fixture_id: null, note: "none" },
    ...extra,
  };
}

const NEVER = { records: [], record_count: null, stored_records: 0,
  freshness: { state: "never_captured", captured_at: null, age_seconds: null,
    stale: null, stale_after_seconds: 21600,
    means: "no capture attempt has been recorded for this feed" } };
const EMPTY = { records: [], record_count: 0, stored_records: 0,
  freshness: { ...FRESH, state: "empty", raw_state: "empty",
    means: "the provider answered with an empty list. This is not a "
      + "claim that the list is truly empty" } };

type Serve = { hub: unknown; news?: { status: number; body: unknown } };

async function open(page: Page, slug: string, s: Serve,
  clock = PRE.clock): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: new Date(clock) });
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  const api = GENERIC.has(slug) ? `/api/comp/${slug}` : `/api/${slug}`;
  await page.route(`**${api}/match/${EVENT}`, (r) => r.fulfill(json(s.hub)));
  if (s.news) {
    const n = s.news;
    await page.route(`**/api/news/fixture/${EVENT}`,
      (r) => r.fulfill(json(n.body, n.status)));
  }
  await page.goto(`/bet-suggester/${slug}/${EVENT}`);
  // the hero drew (the top bar's "NTH vs STH" is hidden on a phone)
  await expect(page.getByTestId("venue-class")).toBeVisible();
  return errors;
}

/** Text a reader must never meet: the payload's own codes. */
const CODES = /never_captured|plane_dormant|not_bridged_here|none_listed|championships_board_freezes_nothing|OPPONENT_COUNTRY|TRUE_HOME|finals_hosts|venue_country|unresolved_why|no_tape_yet|no_commentary/i;

// ── the eleven ──────────────────────────────────────────────────────

test("the hub set is the eleven, and every register covers exactly them", () => {
  expect(HUBS.length, `hubs on disk: ${HUBS.join(", ")}`).toBe(11);
  expect([...PLANE_HUBS, ...Object.keys(NO_MODEL_HUBS)].sort()).toEqual(HUBS);
  expect(Object.keys(ABSENCE_GAPS).sort()).toEqual(HUBS);
  expect([...NATION_HUBS].sort()).toEqual(["afcon", "cnl", "unl"]);
  // the family register is the planes' twelve: the winner plus eleven
  expect(KALSHI_FAMILIES.length).toBe(12);
  expect(new Set(KALSHI_FAMILIES.map((f) => f.key)).size).toBe(12);
});

for (const slug of HUBS) {
  test(`${slug} hub: absences, venue and every Kalshi family, each present or named`,
    async ({ page }) => {
      const errors = await open(page, slug,
        { hub: hub(slug), news: { status: 200, body: news() } });
      const tn = page.getByTestId("team-news");
      await expect(tn).toHaveAttribute("data-state", "read");
      // the label rides on the block, verbatim
      await expect(tn.getByTestId("team-news-label")).toHaveText(TEAM_NEWS_LABEL);
      const recs = tn.getByTestId("absence");
      await expect(recs).toHaveCount(2);
      // the provider's words, verbatim — never re-worded into ours
      await expect(recs.nth(0)).toContainText("Avery Keeper");
      await expect(recs.nth(0)).toContainText("Missing Fixture");
      await expect(recs.nth(0)).toContainText("Knee Injury");
      // a retraction is information: kept and flagged, never dropped
      await expect(tn.getByTestId("absence").filter({ hasText: "Blake Winger" }))
        .toHaveAttribute("data-retracted", "true");
      // sides are attributed only on a clear name match
      await expect(tn.getByTestId("absence-group").first())
        .toHaveAttribute("data-side", "home");
      // the XI release minute, per provider, as an upper bound
      await expect(tn.getByTestId("xi-release").first()).toContainText("58");
      // no count is folded onto the fixture (backend: no aggregate)
      await expect(tn).not.toContainText(/2 absen|2 players/i);

      // W1.12: the venue line exists on every hub, and with no derived
      // class it says so rather than reading the provider's flag
      const venue = page.getByTestId("venue-class");
      await expect(venue).toHaveAttribute("data-class", "absent");
      await expect(venue).not.toContainText(/home ground|hosts this/i);

      // W1.11: the eleven non-winner families, each named on this hub
      await page.getByTestId("families-unserved-toggle").click();
      const gaps = page.getByTestId("family-unserved");
      await expect(gaps).toHaveCount(KALSHI_FAMILIES.length - 1);
      await expect(gaps.first()).toHaveAttribute("data-reason",
        GENERIC.has(slug) ? "not_bridged_here" : "none_listed");
      // the reason, said once, in words
      await expect(page.getByTestId("families-unserved-why")).toContainText(
        GENERIC.has(slug) ? "bridges only the winner series"
          : "this page cannot tell which");
      for (const f of KALSHI_FAMILIES.filter((x) => x.key !== "winner")) {
        await expect(page.locator(
          `[data-testid="family-unserved"][data-family="${f.key}"]`))
          .toContainText(f.label);
      }

      expect(await page.locator("body").innerText()).not.toMatch(CODES);
      await expect(page.getByTestId("section-down")).toHaveCount(0);
      expect(errors, "the page threw").toEqual([]);
    });

  test(`${slug} hub: no absence read recorded is named, never "nobody is missing"`,
    async ({ page }) => {
      await open(page, slug, { hub: hub(slug), news: { status: 200, body: news(NEVER) } });
      const ab = page.getByTestId("absences");
      await expect(ab).toHaveAttribute("data-state", "never_captured");
      await expect(page.getByTestId("absences-never"))
        .toContainText("NOT a statement that nobody is missing");
      const gap = ABSENCE_GAPS[slug as keyof typeof ABSENCE_GAPS].never;
      if (gap) await expect(page.getByTestId("absences-gap")).toContainText(gap);
      else await expect(page.getByTestId("absences-gap")).toHaveCount(0);
      await expect(page.getByTestId("absence")).toHaveCount(0);
      expect(await page.locator("body").innerText()).not.toMatch(CODES);
    });
}

// ── W1.6: every state of the read, in words ─────────────────────────

test("an empty provider list says the provider lists none, with Liga MX's wall named", async ({ page }) => {
  await open(page, "ligamx", { hub: hub("ligamx"), news: { status: 200, body: news(EMPTY) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-state", "empty");
  await expect(page.getByTestId("absences-empty")).toContainText("the provider lists none");
  await expect(page.getByTestId("absences-empty")).toContainText("NOT a statement that nobody is missing");
  await expect(page.getByTestId("absences-gap")).toContainText(ABSENCE_GAPS.ligamx.empty!);
});

test("an empty list where the competition has nothing to add carries no gap note", async ({ page }) => {
  await open(page, "epl", { hub: hub("epl"), news: { status: 200, body: news(EMPTY) } });
  await expect(page.getByTestId("absences-empty")).toBeVisible();
  await expect(page.getByTestId("absences-gap")).toHaveCount(0);
});

test("a stale absence read is drawn HELD, dimmed, with its clock", async ({ page }) => {
  const stale = { freshness: { ...FRESH, state: "stale", stale: true,
    age_seconds: 30000, means: "a real read, but older than this feed's tolerance" } };
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200, body: news(stale) } });
  const ab = page.getByTestId("absences");
  await expect(ab).toHaveAttribute("data-state", "stale");
  await expect(ab).toHaveAttribute("data-held", "true");
  await expect(ab).toHaveClass(/opacity-/);
  await expect(page.getByTestId("absences-held")).toContainText("held");
  await expect(page.getByTestId("absence")).toHaveCount(2);
});

test("a fresh read is NOT drawn held — the non-vacuity half", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200, body: news() } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-held", "false");
  await expect(page.getByTestId("absences-held")).toHaveCount(0);
});

test("an unavailable absence read is unknown, not empty", async ({ page }) => {
  const un = { records: [], record_count: null, note: "in-process request ceiling reached",
    freshness: { ...FRESH, state: "unavailable", raw_state: "unavailable",
      means: "the last fetch did not succeed; the truth is UNKNOWN, not empty" } };
  await open(page, "seriea", { hub: hub("seriea"), news: { status: 200, body: news(un) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-state", "unavailable");
  await expect(page.getByTestId("absences-unavailable")).toContainText("UNKNOWN");
  await expect(page.getByTestId("absences-empty")).toHaveCount(0);
});

test("a dormant live plane is 'we did not look', not an empty feed", async ({ page }) => {
  await open(page, "unl", { hub: hub("unl"), news: { status: 200,
    body: { fixture_ref: EVENT, availability: { state: "plane_dormant", feed: "all",
      stored: 0, means: "the live plane is not ready" } } } });
  await expect(page.getByTestId("team-news")).toHaveAttribute("data-state", "dormant");
  await expect(page.getByTestId("team-news-dormant")).toContainText("not an empty result");
  await expect(page.getByTestId("absence")).toHaveCount(0);
});

test("a failed team-news read is named with its status, never drawn as no news", async ({ page }) => {
  await open(page, "cnl", { hub: hub("cnl"),
    news: { status: 503, body: { detail: "team news unavailable" } } });
  await expect(page.getByTestId("team-news")).toHaveAttribute("data-state", "failed");
  await expect(page.getByTestId("team-news-failed")).toContainText("HTTP 503");
  await expect(page.getByTestId("team-news-failed")).toContainText("NOT a statement that nobody is missing");
});

test("an absence block the payload never carried is named, not blank", async ({ page }) => {
  await open(page, "eredivisie", { hub: hub("eredivisie"), news: { status: 200, body: news(null) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-state", "not_sent");
  await expect(page.getByTestId("absences-not-sent")).toContainText("NOT a statement that nobody is missing");
});

test("the news proxy forwards a fixture read and refuses what it does not serve", async ({ request }) => {
  await expectForwarded(request, "news", `fixture/${EVENT}`);
  for (const bad of ["fixture/abc", "fixture/1/x", "coverage", "decision"]) {
    const r = await request.get(`/api/news/${bad}`);
    expect(await r.text(), bad).toContain("unknown news route");
  }
});

// ── W1.4: the nation hubs' frozen read ──────────────────────────────

test("a nation hub draws the archive's frozen read: its rung, its lead and the favourite it named", async ({ page }) => {
  const read = { origin: "captured", origin_label: "CAPTURED",
    origin_note: "frozen by the match archive at T-10, before kickoff — this is what the board said",
    captured_at: "2026-09-20T17:50:00+00:00", captured_seconds_before_kickoff: 600,
    archive_rung: "t10", unavailable_reason: null, store_read: "ok",
    state: { favourite: "Northtown", opponent: "Southport", fav_side: "home",
      ranks: { fav: 3, opp: 9 } } };
  await open(page, "unl", { hub: hub("unl", { board_read: read }, POST, "post"),
    news: { status: 200, body: news() } }, POST.clock);
  const br = page.getByTestId("board-read");
  await expect(br).toHaveAttribute("data-origin", "captured");
  await expect(page.getByTestId("board-read-rung")).toHaveText(/T-10/);
  await expect(br).toContainText("10m before kickoff");
  await expect(page.getByTestId("board-read-favourite")).toContainText("Northtown");
  await expect(page.getByTestId("board-read-favourite")).toContainText("Southport");
  // the read's numbers stay on the review card
  await expect(br).not.toContainText("fav_side");
  await expect(page.getByTestId("board-read-pending")).toHaveCount(0);
});

for (const slug of ["unl", "cnl", "afcon"]) {
  test(`${slug}: the Championships board's absent read names the archive's read as not served yet`, async ({ page }) => {
    const absent = { origin: "unavailable", origin_label: "NOT AVAILABLE",
      origin_note: "the Championships board computes its cards on request and freezes nothing",
      unavailable_reason: "championships_board_freezes_nothing",
      store_read: "not_attempted", state: null };
    await open(page, slug, { hub: hub(slug, { board_read: absent }),
      news: { status: 200, body: news() } });
    await expect(page.getByTestId("board-read")).toHaveAttribute("data-origin", "unavailable");
    await expect(page.getByTestId("board-read-pending")).toContainText("match archive");
    await expect(page.getByTestId("board-read-pending")).toContainText("not served on this page yet");
    expect(await page.locator("body").innerText()).not.toMatch(CODES);
  });
}

test("a league hub with no frozen read carries no nation pending note", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200, body: news() } });
  await expect(page.getByTestId("board-read-pending")).toHaveCount(0);
});

// ── W1.12: the venue ────────────────────────────────────────────────

test("AFCON on neutral ground: labelled neutral, and 'home' is only the listing order", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon", { venue_class: { class: "NEUTRAL",
    home_side: null, basis: "finals_hosts", country: null } }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "NEUTRAL");
  await expect(v).toContainText("neutral ground");
  await expect(v).toContainText("listing order");
  await expect(v).toContainText("placed by the finals' declared hosts");
  expect(await page.locator("body").innerText()).not.toMatch(CODES);
});

test("an unresolved venue gives no side the host and says which link failed", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon", { venue_class: { class: "UNKNOWN",
    home_side: null, basis: "unresolved", country: null,
    unresolved_why: "finals_host_side_venue_unknown" } }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "UNKNOWN");
  await expect(v).toContainText("no side is treated as host");
  await expect(v).toContainText("a host nation is playing");
});

test("a venue in the listed away side's country names that side as host", async ({ page }) => {
  await open(page, "unl", { hub: hub("unl", { venue_class: { class: "OPPONENT_COUNTRY",
    home_side: "away", basis: "venue_country", country: "Southport" } }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "OPPONENT_COUNTRY");
  await expect(v).toContainText("Southport hosts");
});

test("a nation hub with no derived class does not read ESPN's flag as a fact", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon"), news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "absent");
  await expect(v).toContainText("not read as a measurement");
});

test("ESPN's own neutral flag is quoted as the provider's flag, never as a class", async ({ page }) => {
  const h = hub("unl");
  (h.match as Record<string, unknown>).neutral_site = true;
  await open(page, "unl", { hub: h, news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "absent");
  await expect(v).toContainText("the provider's flag, not a derived class");
});

test("a club hub whose derived class is the listed home side's ground says so", async ({ page }) => {
  await open(page, "eredivisie", { hub: hub("eredivisie", { venue_class: { class: "TRUE_HOME",
    home_side: "home", basis: "venue_name", country: null } }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "TRUE_HOME");
  await expect(v).toContainText("Northtown hosts — the listed home side's own ground");
  await expect(v).toContainText("placed by the venue's name");
});

test("a venue class this page does not know is refused, not read as home", async ({ page }) => {
  await open(page, "cnl", { hub: hub("cnl", { venue_class: { class: "HOME_ISH" } }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "unrecognised");
  await expect(v).toContainText("not read as home or as neutral");
});

// ── W1.11: a served family lights up; the rest stay named ───────────

test("a family the payload carries is drawn from its rows and leaves the named list", async ({ page }) => {
  const total = { key: "total", label: "Total goals", event_ticker: "KXSYNTOTAL-26SEP27NTHSTH",
    markets: [{ ticker: "KXSYNTOTAL-26SEP27NTHSTH-3", label: "Over 2.5 goals",
      yes_ask: "0.55", yes_bid: "0.52", status: "active", model_key: null }] };
  await open(page, "seriea", { hub: hub("seriea", { books: [WINNER, total] }),
    news: { status: 200, body: news() } });
  await expect(page.getByText("Over 2.5 goals")).toBeVisible();
  await expect(page.getByText("55¢").first()).toBeVisible();
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.getByTestId("family-unserved")).toHaveCount(KALSHI_FAMILIES.length - 2);
  await expect(page.locator('[data-testid="family-unserved"][data-family="total"]')).toHaveCount(0);
});

test("no book: the backend's own reason is shown, and no family claims a price", async ({ page }) => {
  const means = "no tradeable event on this series names both clubs";
  await open(page, "ligue1", { hub: hub("ligue1", { book: null, books: [],
    book_meta: { status: "unavailable", series: "KXLIGUE1GAME", means } }),
    news: { status: 200, body: news() } });
  await expect(page.getByText(/no open kalshi book matched/i)).toBeVisible();
  await expect(page.getByTestId("book-meta")).toContainText(means);
  await expect(page.getByTestId("families-none")).toBeVisible();
  await expect(page.getByText(/every kalshi market on this match/i)).toHaveCount(0);
});

// ── 400 px ──────────────────────────────────────────────────────────

for (const slug of ["afcon", "mls"]) {
  test(`${slug} hub at 400px: every new block fits, nothing scrolls the page sideways`, async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await open(page, slug, { hub: hub(slug, { venue_class: { class: "NEUTRAL",
      home_side: null, basis: "venue_city", country: null } }),
      news: { status: 200, body: news() } });
    await expect(page.getByTestId("team-news")).toBeVisible();
    await page.getByTestId("families-unserved-toggle").click();
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, "the page scrolls sideways at 400px").toBeLessThanOrEqual(0);
    for (const id of ["team-news", "venue-class"]) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box, id).not.toBeNull();
      expect(box!.x + box!.width, `${id} overflows 400px`).toBeLessThanOrEqual(400);
    }
  });
}

// ── W1.5: the nation review cards' shot state ───────────────────────

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

async function openChampionships(page: Page, review: unknown) {
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/board**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.route("**/api/championships/review**", (r) => r.fulfill(json(review)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
}

async function openTail(page: Page, slug: string) {
  const t = page.locator(`[data-testid="review-tail"][data-league="${slug}"]`);
  if (await t.getByTestId("review-body").count() === 0) {
    await t.getByTestId("review-toggle").click();
  }
  return t;
}

/** The recorded tail plus one synthetic AFCON QUALIFIER row (pre-seal,
 *  invented teams) carrying the archive's own no-tape sentence. */
function withQualifier() {
  const r = clone(NATIONS_REVIEW) as unknown as {
    leagues: Record<string, Record<string, unknown>>;
    finished: Array<Record<string, unknown>>;
  };
  const base = clone(r.finished[0]);
  const row = { ...base, league: "afcon", espn: "caf.nations_qual",
    event_id: "990777", competition_id: "990777",
    kickoff: "2026-09-25T16:00Z", home: "Northland", away: "Southmark",
    result: { home: 1, away: 1, winner: "draw", source: "espn_scoreboard" },
    column: "afcon", columns: ["afcon"] };
  r.finished.push(row);
  r.leagues.afcon = { ...r.leagues.cnl, finished: 1, unavailable: 1, error: null };
  return r;
}

test("a national row with no tape is a stated gap, not a failed read", async ({ page }) => {
  await openChampionships(page, withQualifier());
  const unl = await openTail(page, "unl");
  const row = unl.getByTestId("review-row").first();
  await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", "no_tape_yet");
  await expect(row.getByTestId("shot-gap")).toContainText("not built yet");
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
  await expect(row.getByTestId("tape-sentence")).not.toContainText("could not be read");
});

test("an AFCON qualifier row names the commentary wall", async ({ page }) => {
  await openChampionships(page, withQualifier());
  const afcon = await openTail(page, "afcon");
  const row = afcon.getByTestId("review-row").filter({ hasText: "Northland" });
  await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", "no_commentary");
  await expect(row.getByTestId("shot-gap")).toContainText(
    SHOT_GAP_WORDS.no_commentary.slice(0, 40));
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
  expect(await row.innerText()).not.toMatch(CODES);
});

test("a national row whose tape read really FAILED still says it failed", async ({ page }) => {
  const r = withQualifier();
  (r.finished[0].shot_state as Record<string, unknown>).error =
    "the ESPN play-by-play answered 503, the provider's own service failed";
  await openChampionships(page, r);
  const unl = await openTail(page, "unl");
  const row = unl.getByTestId("review-row").filter({ hasText: "Albania" });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId("shot-error")).toBeVisible();
  await expect(row.getByTestId("shot-gap")).toHaveCount(0);
});

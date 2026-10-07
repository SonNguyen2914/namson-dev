/** PARITY ON THE SHARED MATCH HUB — every feature on all eleven (2026-10-05).
 *
 *  Son's standing order (2026-10-03): a feature ships for ALL matches of
 *  all eleven focus competitions at once, and where a source does not
 *  exist the gap is NAMED. The parity audit's Wave 1 display items:
 *
 *    W1.4   a generic hub draws the frozen pre-kickoff read — the board's
 *           snapshot or the match archive's T-60/T-10 rung — or the
 *           backend's own reason there is none
 *    W1.5   a nation review card's missing shot state is a STATED gap by
 *           the backend's code, not a failed read
 *    W1.6   provider absences on every hub, every empty state in words,
 *           the competition's gap in the BACKEND'S words
 *    W1.11  every Kalshi family is on every hub, present or named with the
 *           backend's own per-family status; the competition's other
 *           listed series named
 *    W1.12  the venue is labelled from the route's own derived class
 *           (every hub route serves one), else the frozen read's; neutral
 *           ground is never drawn as home, and ESPN's neutral-site flag is
 *           never read as a measurement
 *
 *  THE CONTRACT IS THE BACKEND'S (fix round, 2026-10-05). The first cut of
 *  this file mocked shapes the backend did not send (a top-level
 *  `venue_class` before any route served one, `shot_state
 *  .unavailable_reason`, a winner-only generic hub) and so passed against
 *  a contract nobody produced. Every payload below is written in the
 *  shapes of TRIVELA branch mon-parity-backend @4caab8f8:
 *  src/match_hubs.py `build` / `venue_class_of` (book_meta.families over
 *  all 21 FAMILIES, other_series, families_not_read_because, venue_class
 *  on every route, board_read.source / archive_rung / archive_read /
 *  state.venue_class), src/live/team_news.py `fixture_news`
 *  (absences.resolved_by / provider_gap) and src/match_archive/tail.py
 *  (`shot_state.not_known_reason` / `source`, `_shots`). Backend sentences
 *  copied here are copied verbatim, and named as copies.
 *
 *  HERMETIC. Every /api/ read is answered in the page: a catch-all 503
 *  first, then the reads under test. The payloads are SYNTHETIC and every
 *  fixture in them kicks off on or before 2026-09-27. The one recording
 *  used (nations-review-recorded.ts) is pre-seal too.
 *
 *  THE ELEVEN ARE DERIVED from the hub pages that exist on disk — the
 *  same directory the build reads its card-link table from
 *  (next.config.ts MATCH_HUBS) — and their count is asserted. */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { NO_MODEL_HUBS } from "../src/lib/compHub";
import {
  ARCHIVE_READ_UNKNOWN, EXTRA_FAMILIES, FAMILY_REASON_WORDS,
  KALSHI_FAMILIES, LINEUP_STATE_UNKNOWN, NATION_HUBS, PLANE_HUBS,
  SHOT_GAP_WORDS, SHOT_NOT_KNOWN_CODES, TEAM_NEWS_LABEL, VENUE_GAP_WORDS,
  VENUE_SOURCE_WORDS, VENUE_UNRESOLVED_UNKNOWN,
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

// ── the backend's family contract (src/match_hubs.py) ───────────────

/** The generic hubs' family vocabulary — match_hubs.FAMILIES at the
 *  backend branch's head (the plane hubs' twelve less the winner, then
 *  the ten beyond them), as keys. */
const BACKEND_FAMILIES = ["total", "btts", "spread", "team_total", "score",
  "ftts", "mov", "h1", "h1_total", "h1_spread", "h1_btts", "h1_score", "h2",
  "h2_total", "h2_spread", "h2_btts", "first_goal", "goal", "corners",
  "team_corners", "advance"];
/** match_hubs.KALSHI_FAMILIES_LISTED, as KEYS. */
const FULL_TIME = ["total", "btts", "spread", "team_total", "score", "ftts", "mov"];
const FIRST_HALF = ["h1", "h1_total", "h1_spread", "h1_btts"];
const SECOND_HALF = ["h2", "h2_total", "h2_spread", "h2_btts"];
const PROPS = ["h1_score", "first_goal", "corners", "team_corners"];
const LISTED: Record<string, string[]> = {
  bundesliga: [...FULL_TIME, ...FIRST_HALF, ...PROPS, "advance"],
  seriea: [...FULL_TIME, ...FIRST_HALF, ...SECOND_HALF, ...PROPS, "advance"],
  ligue1: [...FULL_TIME, ...FIRST_HALF, ...PROPS, "advance"],
  eredivisie: [...FULL_TIME.filter((k) => !["score", "ftts", "mov"].includes(k)),
    ...FIRST_HALF, "advance"],
  unl: [...FULL_TIME, ...FIRST_HALF, "first_goal", "advance"],
  cnl: [...FULL_TIME.filter((k) => !["team_total", "score", "ftts", "mov"].includes(k)),
    ...FIRST_HALF],
  afcon: [...FULL_TIME, ...FIRST_HALF, "advance"],
};
/** match_hubs.FAMILY_WORDS, verbatim. */
const FAMILY_MEANS: Record<string, string> = {
  ok: "one event on this family's series carries the winner's suffix",
  not_listed_for_fixture: "the series' COMPLETE listing holds no tradeable "
    + "event with this match's suffix — not yet listed, or settled and gone; "
    + "NOT a claim it never priced",
  listing_incomplete: "the series' listing was CUT OFF (one page of the "
    + "registry, and a cursor said more existed), and this match's event "
    + "was not on the page read — so whether Kalshi lists it is UNKNOWN, "
    + "not 'not listed'",
  not_listed_for_competition: "Kalshi's series inventory (2026-09-25) lists "
    + "no such series for this competition, so it is not asked for",
  unavailable: "the Kalshi registry read for this family FAILED, so whether "
    + "it lists this match is UNKNOWN — this is not 'no book exists'",
};
/** match_hubs.FAMILIES_NOT_READ, verbatim. */
const FAMILIES_NOT_READ = "the winner event was not bridged to this match, "
  + "so there is no ticker suffix to join any other family by — every "
  + "family is UNREAD here, which is not a finding that none is listed";
const PREFIX = "KXSYN";
/** match_hubs.other_series for a competition with outrights. */
const OTHER_SERIES = [
  { series: PREFIX, means: "the season's outright winner — not a market on one match" },
  { series: `${PREFIX}TOP4`, means: "a top-four outright — not a market on one match" },
];

/** `book_meta.families` as `family_books` builds it for a bridged winner:
 *  EVERY key of FAMILIES — each listed family `ok` when in `served`, else
 *  `not_listed_for_fixture`; each unlisted one
 *  `not_listed_for_competition`. `over` replaces single records. */
function familiesFor(slug: string, served: string[] = [],
  over: Record<string, unknown> = {}) {
  const out: Record<string, unknown> = {};
  for (const k of BACKEND_FAMILIES) {
    const series = `${PREFIX}${k.toUpperCase()}`;
    const status = !(LISTED[slug] ?? []).includes(k)
      ? "not_listed_for_competition"
      : served.includes(k) ? "ok" : "not_listed_for_fixture";
    out[k] = { series, status, means: FAMILY_MEANS[status],
      ...(status === "ok" ? { event_ticker: `${series}-26SEP27NTHSTH` } : {}) };
  }
  return { ...out, ...over };
}

function bookMeta(slug: string, served: string[] = [],
  over: Record<string, unknown> = {}) {
  return {
    status: "ok", series: `${PREFIX}GAME`,
    means: "the winner event was bridged by this page's own rule; each "
      + "other family Kalshi lists for this competition was joined to it "
      + `by the event's ticker suffix (${served.length} of `
      + `${(LISTED[slug] ?? []).length} listed families carry this match `
      + "— see `families`). A display, not a claim.",
    winner_means: "mapped", families_read: 1 + served.length,
    families: familiesFor(slug, served, over),
    other_series: OTHER_SERIES,
  };
}

/** The reason a family should be drawn under, on the default payload. */
function expectedReason(slug: string, key: string): string {
  if (!GENERIC.has(slug)) {
    return EXTRA_FAMILIES.some((f) => f.key === key)
      ? "plane_does_not_read" : "none_listed";
  }
  return (LISTED[slug] ?? []).includes(key)
    ? "not_listed_for_fixture" : "not_listed_for_competition";
}

/** Every family a hub names when only the winner is drawn. */
const ALL_OTHER = [...KALSHI_FAMILIES, ...EXTRA_FAMILIES]
  .filter((f) => f.key !== "winner");

// ── the venue (src/match_hubs.py venue_class_of) ────────────────────

/** `venue_class` as every hub route serves it: the club board's rule for
 *  a league (DOMESTIC at the league's own ground), the Championships
 *  board's for a nation. `rule` is the backend's prose, never shown. */
function routeVenue(slug: string, over: Record<string, unknown> = {}) {
  const nation = NATION_HUBS.includes(slug);
  return {
    class: nation ? "TRUE_HOME" : "DOMESTIC", home_side: "home",
    basis: nation ? "venue_country" : "league_countries",
    venue: { name: "Synthetic Ground", city: "Northtown City",
      country: "Northland" },
    rule: nation
      ? "championships.espn.venue_class — the Championships board's own rule"
      : "picker.board.venue_class — the club board's own rule",
    neutral_site_flag_read: false,
    ...over,
  };
}

// ── the board read (src/match_hubs.py board_read) ───────────────────

const NOT_FROZEN = { origin: "unavailable", origin_label: "NOT AVAILABLE",
  origin_note: "no pre-kickoff board read was frozen for this fixture",
  unavailable_reason: "not_frozen", store_read: "ok", store_read_error: null,
  source: "board_snapshot", captured_at: null,
  captured_seconds_before_kickoff: null, state: null };

/** A nation's read frozen by the match archive (tail._pre_kickoff). */
function archived(state: Record<string, unknown> | null, rung = "t10") {
  return { origin: "captured", origin_label: "CAPTURED",
    origin_note: `frozen by the match archive at ${rung.toUpperCase()}, `
      + "before kickoff — this is what the board said",
    captured_at: "2026-09-20T17:50:00+00:00",
    captured_seconds_before_kickoff: rung === "t10" ? 600 : 3600,
    captured_lead_band: null, captured_lead_band_means: null,
    archive_rung: rung, unavailable_reason: null, store_read: "ok",
    store_read_error: null, source: "match_archive", state };
}

/** A hub payload in the route's shape. The four planes get no
 *  `model_refusal` / `board_read` / `book_meta` — their own payloads
 *  carry none; every route carries `venue_class`. */
function hub(slug: string, over: Record<string, unknown> = {},
  when: typeof PRE = PRE, state: "pre" | "post" = "pre") {
  const generic = GENERIC.has(slug);
  return {
    ...(generic ? {
      competition: slug, display: slug, espn_league: "synthetic",
      model_refusal: { state: "no_model_plane",
        why: "no shadow model is fitted for this competition",
        instead: "board_read", note: null },
      board_read: NOT_FROZEN,
      book_meta: bookMeta(slug),
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
    venue_class: routeVenue(slug),
    generated_at: when.clock,
    ...over,
  };
}

// ── team news (src/live/team_news.py fixture_news) ──────────────────

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
      provider: "apifootball", subject_ref: "1490001",
      resolved_by: "archive_bridge", competition: "bundesliga",
      provider_gap: null,
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
    ...extra,
  };
}

/** No capture recorded: `freshness(feed, None, "unavailable")`, and the
 *  ESPN id joined to nothing (`absence_ref_for` -> "none"). */
const NEVER = { records: [], record_count: null, stored_records: 0,
  resolved_by: "none", subject_ref: EVENT, competition: null,
  provider_gap: null,
  freshness: { state: "never_captured", captured_at: null, age_seconds: null,
    stale: null, stale_after_seconds: 21600,
    means: "no capture attempt has been recorded for this feed" } };
const EMPTY = { records: [], record_count: 0, stored_records: 0,
  freshness: { ...FRESH, state: "empty", raw_state: "empty",
    means: "the provider answered with an empty list. This is not a "
      + "claim that the list is truly empty" } };

/** team_news.ABSENCE_GAPS["ligamx"], verbatim. */
const LIGAMX_GAP = "API-Football returns NO injuries for Liga MX: empty on "
  + "3 of 3 upcoming fixtures and on a completed one, on the same key in "
  + "the same minute MLS returned 26 (research_archive/"
  + "team_news_coverage_2026-07-30*.json). An empty list here is the "
  + "provider's silence about this league, not a healthy squad";

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

/** Text a reader must never meet: the payload's own codes, and the
 *  first cut's retired claims. */
const CODES = new RegExp([
  "never_captured", "plane_dormant", "not_bridged_here", "none_listed",
  "championships_board_freezes_nothing", "OPPONENT_COUNTRY", "TRUE_HOME",
  "DOMESTIC", "finals_hosts", "venue_country", "unresolved_why",
  "not_listed_for_fixture", "not_listed_for_competition", "not_stated",
  "listed_not_sent", "status_unrecognised", "no_family_report",
  "plane_sends_none", "no_frozen_read", "refused_read", "read_without_class",
  "frozen_read", ...SHOT_NOT_KNOWN_CODES, "not_known_reason",
  "espn_play_by_play", "archive_bridge", "live_plane", "resolved_by",
  "archive_sweep", "sweep_off",
  "provider_gap", "board_snapshot", "match_archive", "research_archive",
  "\\.json", "caf\\.nations_qual", "archive_not_reached", "archive_failed",
  "not_archived", "archive_not_configured", "listing_incomplete",
  "plane_does_not_read", "hub_route", "league_countries",
  "no_venue_in_summary", "country_not_in_league_registry",
  "not_classified_here", "classifier_failed", "venue_class",
  "picker\\.board", "families_not_read_because", "other_series",
  // the first cut's hard-coded claims, made false by the backend's W1.6
  "not swept yet", "never been measured", "bridges only the winner series",
  "not built yet",
].join("|"), "i");

const bodyText = async (page: Page) =>
  (await page.locator("body").innerText());

// ── the eleven ──────────────────────────────────────────────────────

test("the hub set is the eleven, and every register covers exactly them", () => {
  expect(HUBS.length, `hubs on disk: ${HUBS.join(", ")}`).toBe(11);
  expect([...PLANE_HUBS, ...Object.keys(NO_MODEL_HUBS)].sort()).toEqual(HUBS);
  expect([...NATION_HUBS].sort()).toEqual(["afcon", "cnl", "unl"]);
  // the family register is the planes' twelve: the winner plus eleven
  expect(KALSHI_FAMILIES.length).toBe(12);
  expect(new Set(KALSHI_FAMILIES.map((f) => f.key)).size).toBe(12);
  // the two registers, in order, ARE the backend's generic-hub families
  expect(ALL_OTHER.map((f) => f.key as string)).toEqual(BACKEND_FAMILIES);
});

test("no per-competition absence sentence is typed on the frontend", () => {
  // The backend's `absences.provider_gap` is the one source of a
  // competition's absence gap. The first cut hard-coded eleven entries
  // here, two kinds of which were false the day the backend's sweep
  // landed; derive the check from the source rather than trust a list.
  const SRC = join(__dirname, "..", "src");
  for (const f of ["lib/hubParity.ts", "components/HubTeamNews.tsx"]) {
    // code only: the files' comments record the retired claims on purpose
    const code = readFileSync(join(SRC, f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(code, f).not.toMatch(/ABSENCE_GAPS/);
    expect(code, f).not.toMatch(/not swept yet|never been measured/);
  }
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
      // how the backend joined this ESPN match to the provider's fixture
      await expect(tn.getByTestId("absences")).toHaveAttribute(
        "data-resolved-by", "archive_bridge");
      await expect(tn.getByTestId("absences-joined")).toContainText(
        "match archive's bridge");
      // the XI release minute, per provider, as an upper bound
      await expect(tn.getByTestId("xi-release").first()).toContainText("58");
      // no count is folded onto the fixture (backend: no aggregate)
      await expect(tn).not.toContainText(/2 absen|2 players/i);

      // W1.12: every route serves its own derived class — the board
      // column's rule for the competition — and the line reads it, with
      // where the ground is and by what it was placed
      const venue = page.getByTestId("venue-class");
      const nation = NATION_HUBS.includes(slug);
      await expect(venue).toHaveAttribute("data-class",
        nation ? "TRUE_HOME" : "DOMESTIC");
      await expect(venue).toHaveAttribute("data-source", "hub_route");
      await expect(venue).toContainText("Northtown hosts");
      await expect(venue).toContainText("Synthetic Ground, Northland");
      await expect(venue).toContainText(nation ? "placed by the venue's country"
        : "against the countries the league plays in");
      await expect(venue).toContainText(VENUE_SOURCE_WORDS.hub_route);
      // the backend's own rule prose names a function: never shown
      await expect(venue).not.toContainText("club board's own rule");

      // W1.11: every non-winner family, each named with ITS reason —
      // on a generic hub the backend's own per-family status
      await page.getByTestId("families-unserved-toggle").click();
      const gaps = page.getByTestId("family-unserved");
      await expect(gaps).toHaveCount(ALL_OTHER.length);
      for (const f of ALL_OTHER) {
        const chip = page.locator(
          `[data-testid="family-unserved"][data-family="${f.key}"]`);
        await expect(chip).toContainText(f.label);
        await expect(chip, f.key).toHaveAttribute("data-reason",
          expectedReason(slug, f.key));
      }
      // each reason said once, in words, over its own group
      const groups = page.getByTestId("families-unserved-group");
      const reasons = await groups.evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-reason")));
      expect(new Set(reasons).size, "a reason said twice").toBe(reasons.length);
      for (const r of reasons) {
        await expect(page.locator(
          `[data-testid="families-unserved-group"][data-reason="${r}"] `
          + '[data-testid="families-unserved-why"]'))
          .toHaveText(FAMILY_REASON_WORDS[r as keyof typeof FAMILY_REASON_WORDS]);
      }
      if (GENERIC.has(slug)) {
        // how the other families were joined, in the backend's words
        await expect(page.getByTestId("families-means")).toContainText(
          "ticker suffix");
        // and the competition's other listed series, named
        await expect(page.getByTestId("other-series-row")).toHaveCount(
          OTHER_SERIES.length);
      } else {
        await expect(page.getByTestId("families-means")).toHaveCount(0);
        await expect(page.getByTestId("other-series")).toHaveCount(0);
      }

      expect(await bodyText(page)).not.toMatch(CODES);
      await expect(page.getByTestId("section-down")).toHaveCount(0);
      expect(errors, "the page threw").toEqual([]);
    });

  test(`${slug} hub: no absence read recorded is named, never "nobody is missing"`,
    async ({ page }) => {
      await open(page, slug, { hub: hub(slug), news: { status: 200, body: news(NEVER) } });
      const ab = page.getByTestId("absences");
      await expect(ab).toHaveAttribute("data-state", "never_captured");
      await expect(ab).toHaveAttribute("data-resolved-by", "none");
      await expect(page.getByTestId("absences-never"))
        .toContainText("not joined to any API-Football fixture yet");
      await expect(page.getByTestId("absences-never"))
        .toContainText("NOT a statement that nobody is missing");
      // the backend sent no gap for this match, so none is drawn — no
      // competition's words are supplied by the frontend
      await expect(page.getByTestId("absences-gap")).toHaveCount(0);
      await expect(page.getByTestId("absence")).toHaveCount(0);
      expect(await bodyText(page)).not.toMatch(CODES);
    });
}

// ── W1.6: every state of the read, in words ─────────────────────────

test("a join never attempted (the backend's archive sweep is off) is said so, not blamed on a failed join", async ({ page }) => {
  // RED FIRST (review, 2026-10-05): `none` read "not joined ... yet ...
  // Joins are made only when both clubs and the kickoff match exactly",
  // when the sweep that makes the join was switched off and never ran
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200,
    body: news({ ...NEVER, competition: "bundesliga", archive_sweep: false }) } });
  const ab = page.getByTestId("absences");
  await expect(ab).toHaveAttribute("data-resolved-by", "none");
  await expect(ab).toHaveAttribute("data-archive-sweep", "false");
  const never = page.getByTestId("absences-never");
  await expect(never).toContainText("no join was attempted");
  await expect(never).toContainText("switched off on this deployment");
  await expect(never).not.toContainText("Joins are made only when");
  await expect(never).toContainText("NOT a statement that nobody is missing");
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("with the archive sweep on, an unjoined match keeps the join words", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200,
    body: news({ ...NEVER, competition: "bundesliga", archive_sweep: true }) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-archive-sweep", "true");
  await expect(page.getByTestId("absences-never")).toContainText(
    "Joins are made only when both clubs and the kickoff match exactly");
});

test("an empty provider list says the provider lists none, with the backend's own Liga MX wall", async ({ page }) => {
  await open(page, "ligamx", { hub: hub("ligamx"), news: { status: 200,
    body: news({ ...EMPTY, competition: "ligamx", provider_gap: LIGAMX_GAP,
      resolved_by: "live_plane" }) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-state", "empty");
  await expect(page.getByTestId("absences-empty")).toContainText("the provider lists none");
  await expect(page.getByTestId("absences-empty")).toContainText("NOT a statement that nobody is missing");
  const gap = page.getByTestId("absences-gap");
  // the backend's sentence, verbatim — less its evidence file path
  await expect(gap).toContainText("API-Football returns NO injuries for Liga MX");
  await expect(gap).toContainText("the same minute MLS returned 26. An empty list here");
  await expect(gap).toContainText("not a healthy squad");
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("the backend's gap is drawn for whichever competition it names — never one typed here", async ({ page }) => {
  const words = "SYNTHETIC: the provider publishes no absences for this competition";
  await open(page, "unl", { hub: hub("unl"), news: { status: 200,
    body: news({ ...NEVER, competition: "unl", provider_gap: words,
      resolved_by: "archive_bridge" }) } });
  await expect(page.getByTestId("absences-never")).toContainText(
    "joined to API-Football's fixture (by the match archive's bridge), but no absence read is recorded under it yet");
  await expect(page.getByTestId("absences-gap")).toHaveText(`${words}.`);
});

test("an empty list where the backend sends no gap carries no gap note", async ({ page }) => {
  await open(page, "epl", { hub: hub("epl"), news: { status: 200, body: news(EMPTY) } });
  await expect(page.getByTestId("absences-empty")).toBeVisible();
  await expect(page.getByTestId("absences-gap")).toHaveCount(0);
});

test("a payload from before the join says it did not say whether the two ids are joined", async ({ page }) => {
  // undefined is dropped on the wire: the key is absent, as it was
  const legacy = { ...NEVER, resolved_by: undefined };
  await open(page, "seriea", { hub: hub("seriea"), news: { status: 200, body: news(legacy) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-resolved-by", "not_sent");
  await expect(page.getByTestId("absences-never")).toContainText(
    "the payload did not say whether the two are joined");
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

test("an unavailable absence read is unknown, not empty — and keeps the backend's gap", async ({ page }) => {
  const un = { records: [], record_count: null, note: "in-process request ceiling reached",
    provider_gap: LIGAMX_GAP, competition: "ligamx",
    freshness: { ...FRESH, state: "unavailable", raw_state: "unavailable",
      means: "the last fetch did not succeed; the truth is UNKNOWN, not empty" } };
  await open(page, "ligamx", { hub: hub("ligamx"), news: { status: 200, body: news(un) } });
  await expect(page.getByTestId("absences")).toHaveAttribute("data-state", "unavailable");
  await expect(page.getByTestId("absences-unavailable")).toContainText("UNKNOWN");
  await expect(page.getByTestId("absences-empty")).toHaveCount(0);
  await expect(page.getByTestId("absences-gap")).toContainText("Liga MX");
});

test("a lineup state the backend did not name is NOT read as 'not released'", async ({ page }) => {
  // The fold the parity review found on the backend's side of this feed
  // (no roster read as an unreleased XI) must not be made again here: a
  // state this page has no words for — or none at all — is not known.
  const n = news();
  const sides = (n.lineup.by_provider.espn.sides) as Record<string, Record<string, unknown>>;
  sides.away = { team_name: "Southport", lineup_state: "unknown",
    released: false, released_minutes_before_kickoff: null, first_released_at: null };
  await open(page, "cnl", { hub: hub("cnl"), news: { status: 200, body: n } });
  const away = page.locator('[data-testid="xi-release"][data-side="away"]');
  await expect(away).toHaveAttribute("data-state", "unknown");
  await expect(away).toContainText(LINEUP_STATE_UNKNOWN);
  await expect(away).not.toContainText("not released yet");
});

test("an unreleased XI the backend NAMED is still 'not released yet' — the non-vacuity half", async ({ page }) => {
  await open(page, "cnl", { hub: hub("cnl"), news: { status: 200, body: news() } });
  const away = page.locator('[data-testid="xi-release"][data-side="away"]');
  await expect(away).toHaveAttribute("data-state", "not_released");
  await expect(away).toContainText("not released yet");
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

// ── W1.4: the frozen read, from either store ────────────────────────

const RATED = { favourite: "Northtown", opponent: "Southport",
  fav_side: "home", ranks: { fav: 3, opp: 9 } };

/** A backend from before every route served a class: the key absent
 *  (undefined is dropped on the wire). */
const NO_ROUTE_VENUE = { venue_class: undefined };

test("a nation hub draws the archive's frozen read: its rung, its lead and the favourite it named", async ({ page }) => {
  const read = archived({ ...RATED, venue_class: { class: "NEUTRAL",
    home_side: null, basis: "finals_hosts" } });
  await open(page, "afcon", { hub: hub("afcon", { board_read: read }, POST, "post"),
    news: { status: 200, body: news() } }, POST.clock);
  const br = page.getByTestId("board-read");
  await expect(br).toHaveAttribute("data-origin", "captured");
  await expect(br).toHaveAttribute("data-source", "match_archive");
  await expect(page.getByTestId("board-read-rung")).toHaveText(/T-10/);
  await expect(br).toContainText("10m before kickoff");
  await expect(page.getByTestId("board-read-favourite")).toContainText("Northtown");
  await expect(page.getByTestId("board-read-favourite")).toContainText("Southport");
  // the read's numbers stay on the review card
  await expect(br).not.toContainText("fav_side");
  expect(await bodyText(page)).not.toMatch(CODES);
});

/** Every reason a nation hub's read can be absent (match_hubs
 *  BOARD_READ_ABSENT + tail._pre_kickoff), each with its backend note. */
const ARCHIVE_ABSENT: Record<string, string> = {
  archive_not_configured: "the match archive is not configured on this "
    + "deployment (no live plane), so no archived pre-kickoff read could be "
    + "looked up — this is not a finding that none was frozen",
  archive_failed: "the match archive could not be read, so whether a "
    + "pre-kickoff read was frozen for this fixture is UNKNOWN — this is not "
    + "a finding that none was",
  not_archived: "the match archive holds no row for this fixture, so no "
    + "pre-kickoff read was frozen for it. The archive records a fixture "
    + "from its scoreboard discovery and freezes our read at T-60 and T-10",
  archive_not_reached: "the match archive freezes our read at T-60 and T-10 "
    + "before kickoff, and this fixture has reached neither yet",
  prematch_not_captured: "the match archive holds no pre-kickoff read for "
    + "this fixture (prematch_not_captured); a national team has no season "
    + "archive to rebuild one from",
};

for (const slug of ["unl", "cnl", "afcon"]) {
  test(`${slug}: an absent archived read carries the backend's reason, and no retired pending note`, async ({ page }) => {
    for (const [code, note] of Object.entries(ARCHIVE_ABSENT)) {
      const absent = { ...NOT_FROZEN, source: "match_archive",
        unavailable_reason: code, origin_note: note,
        store_read: code === "archive_failed" ? "failed"
          : code === "archive_not_configured" ? "not_attempted" : "ok" };
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await open(page, slug, { hub: hub(slug, { board_read: absent }),
        news: { status: 200, body: news() } });
      const br = page.getByTestId("board-read");
      await expect(br, code).toHaveAttribute("data-origin", "unavailable");
      await expect(br, code).toHaveAttribute("data-reason", code);
      await expect(br, code).toContainText("no board read on record");
      await expect(br, code).toContainText(note.slice(0, 40));
      // the first cut's "not served on this page yet" is retired: the
      // archive's read IS served now, and its absence has a reason
      await expect(page.getByTestId("board-read-pending")).toHaveCount(0);
      // and the venue line does not depend on a read: the route's own
      await expect(page.getByTestId("venue-class")).toHaveAttribute(
        "data-source", "hub_route");
    }
  });
}

test("a league's not_frozen carries the archive's own answer beside it, in words", async ({ page }) => {
  for (const [code, words] of [
    ["archive_not_reached", "T-60 and T-10 rungs are not reached yet"],
    ["not_archived", "holds no row for this fixture either"],
    ["a_code_from_later", ARCHIVE_READ_UNKNOWN]] as const) {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await open(page, "ligue1", { hub: hub("ligue1", { board_read: {
      ...NOT_FROZEN, archive_read: code } }),
      news: { status: 200, body: news() } });
    const a = page.getByTestId("board-read-archive");
    await expect(a, code).toHaveAttribute("data-archive", code);
    await expect(a, code).toContainText(words);
    await expect(a, code).not.toContainText(code);
  }
});

test("a league whose archive read FAILED is unknown, not 'nothing frozen'", async ({ page }) => {
  const failed = { ...NOT_FROZEN, source: "match_archive",
    unavailable_reason: "archive_failed", store_read: "failed",
    origin_note: ARCHIVE_ABSENT.archive_failed, snapshot_read: "not_frozen" };
  await open(page, "seriea", { hub: hub("seriea", { board_read: failed }),
    news: { status: 200, body: news() } });
  const br = page.getByTestId("board-read");
  await expect(br).toHaveAttribute("data-reason", "archive_failed");
  await expect(br).toContainText("UNKNOWN");
  await expect(page.getByTestId("board-read-archive")).toHaveCount(0);
});

test("a frozen refusal is a read: the board refused and named no favourite", async ({ page }) => {
  const read = archived({ refused: true, league: "cnl", home: "Northtown",
    away: "Southport", club: null, reason: "no_national_rating" });
  await open(page, "cnl", { hub: hub("cnl", { board_read: read }),
    news: { status: 200, body: news() } });
  await expect(page.getByTestId("board-read-refused")).toContainText(
    "refused this pairing and named no favourite");
  await expect(page.getByTestId("board-read-favourite")).toHaveCount(0);
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("a league hub with no frozen read carries no pending note and no refusal line", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200, body: news() } });
  await expect(page.getByTestId("board-read-pending")).toHaveCount(0);
  await expect(page.getByTestId("board-read-refused")).toHaveCount(0);
  await expect(page.getByTestId("board-read")).toHaveAttribute("data-source", "board_snapshot");
});

// ── W1.12: the venue ────────────────────────────────────────────────

test("the route's own class wins over the frozen read's, and says where it came from", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon", {
    venue_class: routeVenue("afcon", { class: "NEUTRAL", home_side: null,
      basis: "finals_hosts", venue: { name: "Stade Synthetique",
        city: "Elsewhere", country: "Thirdland" } }),
    board_read: archived({ ...RATED, venue_class: { class: "TRUE_HOME",
      home_side: "home", basis: "venue_country" } }) }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "NEUTRAL");
  await expect(v).toHaveAttribute("data-source", "hub_route");
  await expect(v).toContainText("neutral ground");
  await expect(v).toContainText("listing order");
  await expect(v).toContainText("placed by the finals' declared hosts");
  await expect(v).toContainText("Stade Synthetique, Thirdland");
  await expect(v).not.toContainText("Northtown hosts");
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("a backend with no route class falls back to the frozen read's, and says so", async ({ page }) => {
  await open(page, "unl", { hub: hub("unl", { ...NO_ROUTE_VENUE,
    board_read: archived({ ...RATED, venue_class: { class: "NEUTRAL",
      home_side: null, basis: "venue_city" } }) }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "NEUTRAL");
  await expect(v).toHaveAttribute("data-source", "frozen_read");
  await expect(v).toContainText(VENUE_SOURCE_WORDS.frozen_read);
});

for (const [name, over, source] of [
  ["a plane route with no class", {}, "plane_sends_none"],
  ["a generic route with no class and no read", {}, "no_frozen_read"],
  ["a generic route with no class and a refused read", { board_read: archived({
    refused: true, league: "cnl", home: "Northtown", away: "Southport",
    club: null, reason: "no_national_rating" }) }, "refused_read"],
  ["a generic route with no class and a read without one",
    { board_read: archived(RATED, "t60") }, "read_without_class"],
] as const) {
  test(`${name}: the venue line says why there is no class`, async ({ page }) => {
    const slug = source === "plane_sends_none" ? "laliga" : "cnl";
    await open(page, slug, { hub: hub(slug, { ...NO_ROUTE_VENUE, ...over }),
      news: { status: 200, body: news() } });
    const v = page.getByTestId("venue-class");
    await expect(v).toHaveAttribute("data-class", "absent");
    await expect(v).toHaveAttribute("data-source", source);
    await expect(v).toContainText(VENUE_GAP_WORDS[source]);
    await expect(v).not.toContainText(/Northtown hosts/);
  });
}

test("an unresolved venue gives no side the host and says which link failed", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon", { venue_class: routeVenue("afcon", {
    class: "UNKNOWN", home_side: null, basis: "unresolved",
    unresolved_why: "finals_host_side_venue_unknown" }) }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "UNKNOWN");
  await expect(v).toContainText("no side is treated as host");
  await expect(v).toContainText("a host nation is playing");
});

test("every refusal the venue classifiers name has words, and an unknown one says so", async ({ page }) => {
  for (const [code, words] of [
    ["city_conflict", "belongs to more than one country"],
    ["no_venue_in_summary", "ESPN's match summary names no venue"],
    ["country_not_in_league_registry", "not one the league registry knows"],
    ["classifier_failed: KeyError", "the venue classifier failed"],
    ["not_classified_here: this competition is a Viewer outside the eleven",
      "no venue rule registered"],
    ["some_new_refusal", VENUE_UNRESOLVED_UNKNOWN]] as const) {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await open(page, "eredivisie", { hub: hub("eredivisie", {
      venue_class: routeVenue("eredivisie", { class: "UNKNOWN",
        home_side: null, basis: "unresolved", unresolved_why: code }) }),
      news: { status: 200, body: news() } });
    const v = page.getByTestId("venue-class");
    await expect(v, code).toContainText(words);
    await expect(v, code).not.toContainText(code.split(":")[0]);
  }
});

test("a venue in the listed away side's country names that side as host", async ({ page }) => {
  await open(page, "unl", { hub: hub("unl", { venue_class: routeVenue("unl", {
    class: "OPPONENT_COUNTRY", home_side: "away" }) }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "OPPONENT_COUNTRY");
  await expect(v).toContainText("Southport hosts");
});

test("a nation hub with no derived class does not read ESPN's flag as a fact", async ({ page }) => {
  await open(page, "afcon", { hub: hub("afcon", NO_ROUTE_VENUE), news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "absent");
  await expect(v).toContainText("not read as a measurement");
});

test("ESPN's own neutral flag is quoted as the provider's flag, never as a class", async ({ page }) => {
  const h = hub("unl", NO_ROUTE_VENUE);
  (h.match as Record<string, unknown>).neutral_site = true;
  await open(page, "unl", { hub: h, news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "absent");
  await expect(v).toContainText("the provider's flag, not a derived class");
});

test("a league snapshot's DOMESTIC class names the listed home side as host, by the board's rule", async ({ page }) => {
  // The club board's own vocabulary (board.venue_class): both clubs'
  // league plays in the venue's country. A league snapshot carries it,
  // and a backend with no route class falls back to it.
  const snap = { origin: "captured", origin_label: "CAPTURED",
    origin_note: "frozen from the live board before kickoff — this is what the picker actually said",
    captured_at: "2026-09-26T18:00:00+00:00", captured_seconds_before_kickoff: 86400,
    captured_lead_band_means: "taken the day before kickoff",
    unavailable_reason: null, store_read: "ok", corrections: 0,
    source: "board_snapshot",
    state: { ...RATED, venue_class: { class: "DOMESTIC", home_side: "home" } } };
  await open(page, "eredivisie", { hub: hub("eredivisie", { ...NO_ROUTE_VENUE, board_read: snap }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "DOMESTIC");
  await expect(v).toHaveAttribute("data-source", "frozen_read");
  await expect(v).toContainText("Northtown hosts — both clubs' league plays in the venue's country");
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("a venue class this page does not know is refused, not read as home", async ({ page }) => {
  await open(page, "cnl", { hub: hub("cnl", { venue_class: routeVenue("cnl", {
    class: "HOME_ISH" }) }),
    news: { status: 200, body: news() } });
  const v = page.getByTestId("venue-class");
  await expect(v).toHaveAttribute("data-class", "unrecognised");
  await expect(v).toContainText("not read as home or as neutral");
});

// ── W1.11: the families, by the backend's own status ────────────────

const familyRow = (key: string, label: string, mLabel: string) => ({
  key, label, event_ticker: `${PREFIX}${key.toUpperCase()}-26SEP27NTHSTH`,
  title: "Northtown vs Southport",
  markets: [{ ticker: `${PREFIX}${key.toUpperCase()}-26SEP27NTHSTH-1`,
    label: mLabel, yes_ask: "0.55", yes_bid: "0.52", status: "active",
    model_key: null }] });
const labelOf = (k: string) => ALL_OTHER.find((f) => f.key === k)!.label;

test("Eredivisie: served families are drawn, its unlisted ones say so, and nothing says 'winner only'", async ({ page }) => {
  // The parity review's own case: an Eredivisie hub where the winner
  // bridges and every listed family carries the match.
  const listed = LISTED.eredivisie;
  const books = [WINNER, ...listed.map((k) => familyRow(k, labelOf(k), `${labelOf(k)} line`))];
  await open(page, "eredivisie", { hub: hub("eredivisie", { books,
    book_meta: bookMeta("eredivisie", listed) }),
    news: { status: 200, body: news() } });
  await expect(page.getByText("Total goals line")).toBeVisible();
  await page.getByTestId("families-unserved-toggle").click();
  const unlisted = BACKEND_FAMILIES.filter((k) => !listed.includes(k));
  await expect(page.getByTestId("families-unserved-toggle")).toContainText(
    `${unlisted.length} not on this page`);
  for (const k of unlisted) {
    await expect(page.locator(`[data-testid="family-unserved"][data-family="${k}"]`), k)
      .toHaveAttribute("data-reason", "not_listed_for_competition");
  }
  await expect(page.locator('[data-testid="family-unserved"][data-family="mov"]'))
    .toHaveText("Method of victory");
  await expect(page.getByTestId("families-means")).toContainText(
    `${listed.length} of ${listed.length} listed families carry this match`);
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("a family missing from the backend's report is 'not stated', never assumed", async ({ page }) => {
  const meta = bookMeta("bundesliga");
  delete (meta.families as Record<string, unknown>).mov;
  await open(page, "bundesliga", { hub: hub("bundesliga", { book_meta: meta }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.locator('[data-testid="family-unserved"][data-family="mov"]'))
    .toHaveAttribute("data-reason", "not_stated");
});

test("a family whose read FAILED is unknown, said first, never 'not listed'", async ({ page }) => {
  await open(page, "ligue1", { hub: hub("ligue1", { book_meta: bookMeta("ligue1", [],
    { btts: { series: `${PREFIX}BTTS`, status: "unavailable",
      means: FAMILY_MEANS.unavailable, error: "TimeoutError" } }) }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.locator('[data-testid="family-unserved"][data-family="btts"]'))
    .toHaveAttribute("data-reason", "unavailable");
  const first = page.getByTestId("families-unserved-group").first();
  await expect(first).toHaveAttribute("data-reason", "unavailable");
  await expect(first).toContainText("UNKNOWN");
  await expect(first).not.toContainText("TimeoutError");
});

test("a family whose listing was CUT OFF is unknown, never 'not listed'", async ({ page }) => {
  await open(page, "seriea", { hub: hub("seriea", { book_meta: bookMeta("seriea", [],
    { corners: { series: `${PREFIX}CORNERS`, status: "listing_incomplete",
      means: FAMILY_MEANS.listing_incomplete } }) }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  const chip = page.locator('[data-testid="family-unserved"][data-family="corners"]');
  await expect(chip).toHaveAttribute("data-reason", "listing_incomplete");
  await expect(chip).toHaveText("Total corners");
  await expect(page.locator(
    '[data-testid="families-unserved-group"][data-reason="listing_incomplete"]'))
    .toContainText("UNKNOWN");
});

test("a family the backend calls listed but sends no rows for is drawn as that contradiction", async ({ page }) => {
  await open(page, "seriea", { hub: hub("seriea", { book_meta: bookMeta("seriea", ["total"]) }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.locator('[data-testid="family-unserved"][data-family="total"]'))
    .toHaveAttribute("data-reason", "listed_not_sent");
});

test("a family or status the backend adds later is drawn, not dropped", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga", { book_meta: bookMeta("bundesliga", [],
    { penalty_shootout: { series: `${PREFIX}PENS`, status: "not_listed_for_fixture",
        means: FAMILY_MEANS.not_listed_for_fixture },
      corners: { series: `${PREFIX}CORNERS`, status: "a_status_from_later",
        means: "later" } }) }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  const ps = page.locator('[data-testid="family-unserved"][data-family="penalty_shootout"]');
  await expect(ps).toHaveText("Penalty shootout");
  await expect(ps).toHaveAttribute("data-reason", "not_listed_for_fixture");
  const co = page.locator('[data-testid="family-unserved"][data-family="corners"]');
  await expect(co).toHaveText("Total corners");
  await expect(co).toHaveAttribute("data-reason", "status_unrecognised");
  await expect(page.getByTestId("family-unserved")).toHaveCount(ALL_OTHER.length + 1);
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("a payload with no family report names that, and claims nothing about the exchange", async ({ page }) => {
  const meta = bookMeta("unl") as Record<string, unknown>;
  delete meta.families;
  await open(page, "unl", { hub: hub("unl", { book_meta: meta }),
    news: { status: 200, body: news() } });
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.locator('[data-testid="family-unserved"][data-reason="no_family_report"]'))
    .toHaveCount(ALL_OTHER.length);
  await expect(page.getByTestId("families-means")).toHaveCount(0);
});

test("a family the payload carries is drawn from its rows and leaves the named list", async ({ page }) => {
  const total = familyRow("total", "Total goals", "Over 2.5 goals");
  await open(page, "seriea", { hub: hub("seriea", { books: [WINNER, total],
    book_meta: bookMeta("seriea", ["total"]) }),
    news: { status: 200, body: news() } });
  await expect(page.getByText("Over 2.5 goals")).toBeVisible();
  await expect(page.getByText("55¢").first()).toBeVisible();
  await page.getByTestId("families-unserved-toggle").click();
  await expect(page.getByTestId("family-unserved")).toHaveCount(ALL_OTHER.length - 1);
  await expect(page.locator('[data-testid="family-unserved"][data-family="total"]')).toHaveCount(0);
});

test("no book: the backend's own reasons are shown, every family UNREAD, and no family claims a price", async ({ page }) => {
  const means = "no tradeable event on this series names both clubs";
  await open(page, "ligue1", { hub: hub("ligue1", { book: null, books: [],
    book_meta: { status: "unavailable", series: "KXLIGUE1GAME", means,
      families: {}, other_series: OTHER_SERIES,
      families_not_read_because: FAMILIES_NOT_READ } }),
    news: { status: 200, body: news() } });
  await expect(page.getByText(/no open kalshi book for this fixture/i)).toBeVisible();
  await expect(page.getByTestId("book-meta")).toContainText(means);
  await expect(page.getByTestId("families-none")).toContainText(
    "every family is UNREAD here, which is not a finding that none is listed");
  await expect(page.getByTestId("families-means")).toHaveCount(0);
  // the competition's other series are named even with no book
  await expect(page.getByTestId("other-series-row")).toHaveCount(OTHER_SERIES.length);
  await expect(page.getByText(/every kalshi market on this match/i)).toHaveCount(0);
  expect(await bodyText(page)).not.toMatch(CODES);
});

test("the competition's other listed series are named in words, never as tickers", async ({ page }) => {
  await open(page, "bundesliga", { hub: hub("bundesliga"), news: { status: 200, body: news() } });
  const os = page.getByTestId("other-series");
  await expect(os).toContainText("not markets on this match");
  await os.locator("summary").click();
  await expect(page.getByTestId("other-series-row").first()).toHaveText(OTHER_SERIES[0].means);
  await expect(os).not.toContainText(PREFIX);
});

// ── 400 px ──────────────────────────────────────────────────────────

for (const slug of ["afcon", "mls"]) {
  test(`${slug} hub at 400px: every new block fits, nothing scrolls the page sideways`, async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });
    await open(page, slug, { hub: hub(slug, { venue_class: routeVenue(slug, {
      class: "NEUTRAL", home_side: null }) }),
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

/** tail.SHOTS_NOT_KNOWN, verbatim — the `error` sentence beside each
 *  code (`{slug}` filled as the backend fills it). */
const NO_TAPE = "the match archive keeps goal and red-card minutes and the "
  + "team totals, not a shot-by-shot tape, so no checkpoint can be read";
const SHOTS_NOT_KNOWN: Record<string, (slug: string) => string> = {
  not_requested: () => "shot state not requested: " + NO_TAPE + ", and the "
    + "play-by-play is read only when the review asks",
  no_play_by_play_published: (slug) => `ESPN publishes no play-by-play for ${slug} `
    + "(AFCON qualifiers: 0 of 26 probed matches carried commentary), so no "
    + "checkpoint can be read — not known, never a no",
  empty_play_by_play: () => "ESPN's play-by-play feed returned no plays for "
    + "this match, so no checkpoint can be read — not known, and NOT a "
    + "goalless tape",
  team_ids_missing: () => "the two ESPN team ids are missing or identical, "
    + "so plays cannot be attributed to a side — not known",
};

type Row = Record<string, unknown> & { shot_state: Record<string, unknown> };

/** `tail._shots(first_goal, code, slug)`. */
function notKnown(row: Row, code: string) {
  const slug = String(row.espn);
  row.shot_state = { at_20: null, before_first_goal: null, full_time: null,
    first_goal_minute: row.shot_state.first_goal_minute ?? null,
    source: null, not_known_reason: code,
    error: (SHOTS_NOT_KNOWN[code] ?? (() => "a reason from later"))(slug) };
}

/** The recorded tail, upgraded to the W1.5 contract: every row
 *  `not_requested`, as the backend serves a row before its shot pass —
 *  plus one synthetic AFCON QUALIFIER row (pre-seal, invented teams). */
function withShots() {
  const r = clone(NATIONS_REVIEW) as unknown as {
    leagues: Record<string, Record<string, unknown>>;
    finished: Row[];
  };
  for (const row of r.finished) notKnown(row, "not_requested");
  const base = clone(r.finished[0]);
  const row = { ...base, league: "afcon", espn: "caf.nations_qual",
    event_id: "990777", competition_id: "990777",
    kickoff: "2026-09-25T16:00Z", home: "Northland", away: "Southmark",
    result: { home: 1, away: 1, winner: "draw", source: "espn_scoreboard" },
    column: "afcon", columns: ["afcon"] } as Row;
  notKnown(row, "no_play_by_play_published");
  r.finished.push(row);
  r.leagues.afcon = { ...r.leagues.cnl, finished: 1, unavailable: 1, error: null };
  return r;
}

const rowOf = (tail: ReturnType<Page["locator"]>, team: string) =>
  tail.getByTestId("review-row").filter({ hasText: team });

for (const code of SHOT_NOT_KNOWN_CODES.filter((c) => c !== "no_play_by_play_published")) {
  test(`a national row whose shot state is not known (${code}) is a stated gap, not a failed read`, async ({ page }) => {
    const r = withShots();
    notKnown(r.finished.find((x) => x.home === "Albania")!, code);
    await openChampionships(page, r);
    const row = rowOf(await openTail(page, "unl"), "Albania");
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", code);
    await expect(row.getByTestId("shot-gap")).toContainText(
      SHOT_GAP_WORDS[code].slice(0, 40));
    await expect(row.getByTestId("shot-error")).toHaveCount(0);
    await expect(row.getByTestId("tape-sentence")).not.toContainText("could not be read");
    // the fit's own reason does not call the gap a failed read either
    await expect(row.getByTestId("fit-read")).not.toContainText("could not be read");
    expect(await row.innerText()).not.toMatch(CODES);
  });
}

test("an AFCON qualifier row names the play-by-play wall by the backend's code", async ({ page }) => {
  await openChampionships(page, withShots());
  const row = rowOf(await openTail(page, "afcon"), "Northland");
  await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", "no_play_by_play_published");
  await expect(row.getByTestId("shot-gap")).toContainText("A data wall, not a pending build");
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
  expect(await row.innerText()).not.toMatch(CODES);
});

test("a not-known code this page has no words for is still a stated gap", async ({ page }) => {
  const r = withShots();
  notKnown(r.finished.find((x) => x.home === "Iceland")!, "a_reason_from_later");
  await openChampionships(page, r);
  const row = rowOf(await openTail(page, "unl"), "Iceland");
  await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", "unrecognised");
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
  await expect(row).not.toContainText("a_reason_from_later");
});

test("a national row whose play-by-play read really FAILED still says it failed", async ({ page }) => {
  // tail.shot_state's failure branch: no code, the failure in `error`
  const r = withShots();
  const albania = r.finished.find((x) => x.home === "Albania")!;
  albania.shot_state = { at_20: null, before_first_goal: null, full_time: null,
    first_goal_minute: null, source: null, not_known_reason: null,
    error: "the ESPN play-by-play feed answered 503, the provider's own service failed" };
  await openChampionships(page, r);
  const row = rowOf(await openTail(page, "unl"), "Albania");
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId("shot-error")).toBeVisible();
  await expect(row.getByTestId("shot-gap")).toHaveCount(0);
});

test("a national row with a READ tape draws its checkpoints and says where they came from", async ({ page }) => {
  const r = withShots();
  const eng = r.finished.find((x) => x.home === "England")!;
  const side = (shots: number, ot: number) =>
    ({ shots, on_target: ot, corners: 1, crosses: 2, take_ons: 3, saves: 1 });
  const cp = (label: string, minute: number | null, h: number, a: number) => ({
    checkpoint: label, cutoff_minute: minute, home: side(h, 1), away: side(a, 2),
    score: { home: 0, away: 0 }, included_plays: 300, fav_side: null,
    shot_share: null, tilt: null, tilt_label: null, tilt_band: 0.65,
    tilt_note: "EXPLORATORY — NOT VALIDATED", on_target: null });
  eng.shot_state = { at_20: cp("20'", 20, 2, 3), before_first_goal: null,
    full_time: cp("FT", null, 9, 14), first_goal_minute: null,
    source: "espn_play_by_play", not_known_reason: null, error: null };
  await openChampionships(page, r);
  const row = rowOf(await openTail(page, "unl"), "England");
  await expect(row.getByTestId("shot-gap")).toHaveCount(0);
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
  await expect(row.getByTestId("shot-source")).toContainText("ESPN's play-by-play");
  expect(await row.innerText()).not.toMatch(CODES);
});

test("a backend from before W1.5 (its no-tape sentence, no code) is read as not requested", async ({ page }) => {
  const r = withShots();
  const albania = r.finished.find((x) => x.home === "Albania")!;
  albania.shot_state = { at_20: null, before_first_goal: null, full_time: null,
    first_goal_minute: null, error: NO_TAPE };
  await openChampionships(page, r);
  const row = rowOf(await openTail(page, "unl"), "Albania");
  await expect(row.getByTestId("shot-gap")).toHaveAttribute("data-gap", "not_requested");
  await expect(row.getByTestId("shot-error")).toHaveCount(0);
});

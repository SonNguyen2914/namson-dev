// THE PARITY REGISTERS FOR THE SHARED MATCH HUB (2026-10-05).
//
// Son's standing order of 2026-10-03: every feature ships for ALL matches
// of all eleven focus competitions at once, and where a source does not
// exist for one of them the gap is NAMED, never left as a quiet blank.
// The parity audit (trivela-ops/parity/proposal.html, Wave 1) listed the
// display items this file backs:
//
//   W1.4   a nation hub reads the match archive's frozen pre-kickoff read
//   W1.5   nation review cards carry a shot state, or say why they cannot
//   W1.6   team news (provider absences) on every hub, gaps named
//   W1.11  the non-winner Kalshi families on every hub, each present or
//          named as not served
//   W1.12  the venue labelled: neutral ground is never drawn as home
//
// THE BACKEND'S CONTRACT, READ — NOT GUESSED (fix round, 2026-10-05). The
// first cut of this file was written beside the backend branch, not
// against it, and the parity review found the two halves disagreeing on
// three fields. Every reader below now takes the backend's OWN field
// (TRIVELA branch mon-parity-backend @4caab8f8, its review-fix head):
//
//   W1.5   shot_state.not_known_reason + shot_state.source
//          (src/match_archive/tail.py SHOTS_NOT_KNOWN / SHOTS_SOURCE)
//   W1.11  book_meta.families — {key: {series, status, means, ...}} for
//          every key of match_hubs.FAMILIES once the winner bridged, plus
//          book_meta.other_series and families_not_read_because
//          (src/match_hubs.py family_books / FAMILY_WORDS)
//   W1.12  `venue_class` on EVERY hub route, the four planes included
//          (match_hubs.venue_class_of: the board column's own rule for
//          the competition); a backend from before that serves the class
//          only on the frozen read, board_read.state.venue_class, and the
//          line falls back to it
//   W1.6   absences.provider_gap + absences.resolved_by
//          (src/live/team_news.py ABSENCE_GAPS / absence_ref_for)
//
// Every register below is keyed so a guard can DERIVE the set it covers
// and assert its length (e2e/hub-parity.spec.ts). Nothing here is a
// number about a match: these are words for absences, and the vocabulary
// the backend already serves.
//
// Words: a read, not a signal; shadow · not advice.
import { NO_MODEL_HUBS } from "./compHub";

/** The four league planes, whose hubs read their own `/api/<slug>/match`
 *  route. Named here only so the registers below can be checked to
 *  cover all eleven; the hub pages themselves are the authority on
 *  which hubs exist (next.config.ts MATCH_HUBS). */
export const PLANE_HUBS = ["mls", "epl", "laliga", "ligamx"] as const;
export type PlaneHub = (typeof PLANE_HUBS)[number];
export type HubSlug = PlaneHub | keyof typeof NO_MODEL_HUBS;

/** The three national-team competitions, DERIVED from the hub config's
 *  own board assignment rather than typed a second time. */
export const NATION_HUBS: readonly string[] = Object.entries(NO_MODEL_HUBS)
  .filter(([, v]) => v.board === "championships").map(([k]) => k);

export const isNationHub = (slug: string) => NATION_HUBS.includes(slug);
export const isPlaneHub = (slug: string) =>
  (PLANE_HUBS as readonly string[]).includes(slug);

// ---------------------------------------------------------------- W1.11

/** EVERY PER-MATCH KALSHI FAMILY, in the backend's own vocabulary.
 *
 *  This is `MATCH_FAMILIES` as the four league planes declare it (TRIVELA
 *  src/mls.py, src/laliga.py, src/ligamx.py; src/epl.py carries the same
 *  keys less `mov`) — the `key` is what each served family arrives under
 *  in the hub payload's `books`, the `series` is the tail of the Kalshi
 *  series ticker after the competition's prefix (KXEPL + TOTAL). A family
 *  the payload carries is drawn from its rows; one it does not carry is
 *  drawn as a NAMED row saying why, so the reader sees every family the
 *  exchange can list and which of them this page has. A family the
 *  backend reports that is NOT in this register (a series Kalshi adds
 *  later) is drawn too, under the backend's label or its own key in
 *  words — never dropped for being unfamiliar. */
export const KALSHI_FAMILIES = [
  { key: "winner", series: "GAME", label: "Winner · 3-way" },
  { key: "total", series: "TOTAL", label: "Total goals" },
  { key: "btts", series: "BTTS", label: "Both teams to score" },
  { key: "spread", series: "SPREAD", label: "Spread" },
  { key: "team_total", series: "TEAMTOTAL", label: "Team totals" },
  { key: "score", series: "SCORE", label: "Correct score" },
  { key: "ftts", series: "FTTS", label: "First team to score" },
  { key: "mov", series: "MOV", label: "Method of victory" },
  { key: "h1", series: "1H", label: "1st half · winner" },
  { key: "h1_total", series: "1HTOTAL", label: "1st half · total" },
  { key: "h1_spread", series: "1HSPREAD", label: "1st half · spread" },
  { key: "h1_btts", series: "1HBTTS", label: "1st half · BTTS" },
] as const;

/** THE FAMILIES BEYOND THE PLANE HUBS' TWELVE that the generic hubs
 *  read (TRIVELA src/match_hubs.py FAMILIES, after `h1_btts`; labels
 *  copied from there). Kalshi lists each on at least one of the eleven
 *  (the 2026-09-25 series inventory). The four league planes do not read
 *  them, and their hubs say so by name rather than leave them out. */
export const EXTRA_FAMILIES = [
  { key: "h1_score", series: "1HSCORE", label: "1st half · correct score" },
  { key: "h2", series: "2H", label: "2nd half · winner" },
  { key: "h2_total", series: "2HTOTAL", label: "2nd half · total" },
  { key: "h2_spread", series: "2HSPREAD", label: "2nd half · spread" },
  { key: "h2_btts", series: "2HBTTS", label: "2nd half · BTTS" },
  { key: "first_goal", series: "FIRSTGOAL", label: "First goalscorer" },
  { key: "goal", series: "GOAL", label: "Player to score" },
  { key: "corners", series: "CORNERS", label: "Total corners" },
  { key: "team_corners", series: "TCORNERS", label: "Team corners" },
  { key: "advance", series: "ADVANCE", label: "To advance" },
] as const;

/** One family's record in the generic hub's `book_meta.families`
 *  (src/match_hubs.py `family_books`). */
export type FamilyStatus = { series?: string | null; status?: string | null;
  means?: string | null; event_ticker?: string | null;
  error?: string | null; label?: string | null };

/** The backend's family statuses (src/match_hubs.py FAMILY_WORDS), read
 *  by code. `ok` is a served family and is drawn from its rows. */
export const BACKEND_FAMILY_STATUSES = [
  "ok", "not_listed_for_fixture", "listing_incomplete",
  "not_listed_for_competition", "unavailable",
] as const;

/** WHY A FAMILY IS NOT IN THE TABLE, by the backend's status where it
 *  sent one, and by what this page can establish where it did not:
 *
 *    not_listed_for_fixture      the backend's: the family's COMPLETE
 *                                listing has no event for this match
 *    listing_incomplete          the backend's: the listing was cut off
 *                                before this match — UNKNOWN
 *    not_listed_for_competition  the backend's: the recorded series
 *                                inventory has no such series here
 *    unavailable                 the backend's: the registry read FAILED
 *                                — UNKNOWN, never "none"
 *    listed_not_sent             the backend said `ok` and sent no rows:
 *                                a contradiction, drawn as one
 *    status_unrecognised         a status this page has no words for
 *    not_stated                  the backend's family report does not
 *                                name this family at all
 *    no_family_report            the payload carried no family report
 *                                (a backend from before W1.11)
 *    none_listed                 a league plane, which keeps a family
 *                                only when it came back with markets and
 *                                sends no per-family status
 *    plane_does_not_read         a family beyond the planes' twelve: a
 *                                league plane never asks for it */
export type FamilyReason =
  | "not_listed_for_fixture" | "listing_incomplete"
  | "not_listed_for_competition" | "unavailable"
  | "listed_not_sent" | "status_unrecognised" | "not_stated"
  | "no_family_report" | "none_listed" | "plane_does_not_read";

export const FAMILY_REASON_WORDS: Record<FamilyReason, string> = {
  not_listed_for_fixture:
    "Kalshi's complete listing for these families holds no tradeable "
    + "event for this match — not listed yet, or settled and gone. Not a "
    + "claim the exchange never priced them, and no price is implied",
  listing_incomplete:
    "Kalshi's listing for these families was CUT OFF before this match "
    + "(one page read, and more existed), so whether they list it is "
    + "UNKNOWN — not \u201cnot listed\u201d",
  not_listed_for_competition:
    "Kalshi listed no such series for this competition when its series "
    + "inventory was recorded, so this page does not ask for them; a "
    + "series added since would not show here",
  unavailable:
    "the Kalshi read for these families FAILED, so whether they list this "
    + "match is UNKNOWN — this is not “no market exists”",
  listed_not_sent:
    "the backend reports these families listed for this match but sent "
    + "no rows for them, so nothing is drawn and no price is implied",
  status_unrecognised:
    "the backend gave these families a status this page has no words "
    + "for, so they are read as neither listed nor unlisted",
  not_stated:
    "the backend's family report does not name these families for this "
    + "hub, so whether Kalshi lists them for this match is not "
    + "established here — and no price is implied",
  no_family_report:
    "this page's payload carried no per-family report, so whether Kalshi "
    + "lists these families for this match is not established here — "
    + "and no price is implied",
  none_listed:
    "no market in these families was read for this match — not listed, "
    + "or the read came back empty; this page cannot tell which",
  plane_does_not_read:
    "this hub's league plane does not read these families, so whether "
    + "Kalshi lists them for this match is not established here — and no "
    + "price is implied",
};

/** Display order of the reasons: the UNKNOWNS first, because a failed
 *  read is the one a reader must not mistake for an absence. */
export const FAMILY_REASON_ORDER: readonly FamilyReason[] = [
  "unavailable", "listing_incomplete", "listed_not_sent",
  "status_unrecognised", "not_stated", "no_family_report",
  "not_listed_for_fixture", "not_listed_for_competition", "none_listed",
  "plane_does_not_read",
];

const REGISTER_LABEL: Record<string, string> = Object.fromEntries(
  [...KALSHI_FAMILIES, ...EXTRA_FAMILIES].map((f) => [f.key, f.label]));

/** A family key in words, for a family outside the register. */
export const familyLabel = (key: string, rec?: FamilyStatus | null) =>
  REGISTER_LABEL[key]
    || (typeof rec?.label === "string" ? rec.label.trim() : "")
    || key.replace(/[_-]+/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase());

export type UnservedFamily = { key: string; label: string;
  reason: FamilyReason };

/** EVERY FAMILY NOT DRAWN IN THE TABLE, WITH WHY.
 *
 *  `families` is the payload's `book_meta.families` exactly as received:
 *  `undefined`/non-object means the payload carried no report. A league
 *  plane (`generic: false`) sends none by design and keeps a family only
 *  when it came back with markets, so its missing families of the
 *  twelve are `none_listed` and the families beyond them
 *  `plane_does_not_read`. The set covered is both registers' non-winner
 *  families PLUS every key the backend reports — a family the backend
 *  names that no register does is drawn, not dropped. */
export function unservedFamilies(opts: {
  generic: boolean; served: ReadonlySet<string>; families: unknown;
}): UnservedFamily[] {
  const { generic, served } = opts;
  const report = opts.families && typeof opts.families === "object"
    && !Array.isArray(opts.families)
    ? opts.families as Record<string, FamilyStatus | null> : null;
  const keys: string[] = [...KALSHI_FAMILIES, ...EXTRA_FAMILIES]
    .map((f) => f.key as string).filter((k) => k !== "winner");
  const extra = new Set<string>(EXTRA_FAMILIES.map((f) => f.key));
  if (generic && report) {
    for (const k of Object.keys(report).sort()) {
      if (k !== "winner" && !keys.includes(k)) keys.push(k);
    }
  }
  const out: UnservedFamily[] = [];
  for (const key of keys) {
    if (served.has(key)) continue;
    const rec = report?.[key] ?? null;
    let reason: FamilyReason;
    if (!generic) reason = extra.has(key) ? "plane_does_not_read"
      : "none_listed";
    else if (!report) reason = "no_family_report";
    else if (!rec || typeof rec !== "object") reason = "not_stated";
    else if (rec.status === "ok") reason = "listed_not_sent";
    else if (rec.status === "not_listed_for_fixture"
      || rec.status === "listing_incomplete"
      || rec.status === "not_listed_for_competition"
      || rec.status === "unavailable") reason = rec.status;
    else reason = "status_unrecognised";
    out.push({ key, label: familyLabel(key, rec), reason });
  }
  return out;
}

// ---------------------------------------------------------------- W1.4

/** A LEAGUE hub's `not_frozen` carries the match archive's own answer
 *  beside it (`board_read.archive_read`, src/match_hubs.py board_read):
 *  no snapshot was frozen, and here is what the archive said. A FAILED
 *  archive read is not carried this way — it is served as the absence
 *  itself (`archive_failed`, UNKNOWN). */
export const ARCHIVE_READ_WORDS: Record<string, string> = {
  not_archived: "the match archive holds no row for this fixture either",
  archive_not_reached:
    "the match archive's T-60 and T-10 rungs are not reached yet",
  archive_not_configured: "the match archive is not configured on this "
    + "deployment, so it was not asked — unknown there, not none",
  prematch_not_captured:
    "the match archive captured no pre-kickoff read for it",
  prematch_read_missing: "the match archive's rungs hold no read for it",
};
export const ARCHIVE_READ_UNKNOWN =
  "the match archive answered with a reason this page has no words for";

// ---------------------------------------------------------------- W1.6

/** HOW THE BACKEND FOUND THIS MATCH'S ABSENCES (team_news
 *  `absence_ref_for`): a hub holds ESPN's event id, absences are stored
 *  under API-Football's fixture id, and the backend crosses that by a
 *  stored row or not at all — never by a guess. */
export const ABSENCE_RESOLVED_BY = ["own", "archive_bridge", "live_plane",
  "none"] as const;
export type AbsenceResolvedBy = (typeof ABSENCE_RESOLVED_BY)[number];

/** How the read was joined, in words (shown beside a read). */
export const RESOLVED_BY_WORDS: Record<AbsenceResolvedBy, string> = {
  own: "captured under this match's own reference",
  archive_bridge: "joined to API-Football's fixture by the match archive's "
    + "bridge (both clubs and the kickoff, exact)",
  live_plane: "joined to API-Football's fixture through the live plane's "
    + "own fixture row",
  none: "not joined to any API-Football fixture",
};

/** Why no absence read is recorded, by how far the join got —
 *  `sweep_off`: no join was ATTEMPTED, because the backend's match-archive
 *  absence sweep (the one that makes the archive_bridge joins, and the
 *  only one that reaches the competitions with no live plane) is switched
 *  off there (`absences.archive_sweep === false`). */
export const NEVER_CAPTURED_WORDS: Record<AbsenceResolvedBy | "not_sent"
  | "unrecognised" | "sweep_off", (who: string) => string> = {
  own: (who) => `no absence read from ${who} is recorded for this match`,
  archive_bridge: (who) => `this match is joined to ${who}'s fixture (by the `
    + `match archive's bridge), but no absence read is recorded under it yet`,
  live_plane: (who) => `this match is joined to ${who}'s fixture (through the `
    + `live plane), but no absence read is recorded under it yet`,
  none: (who) => `this match is not joined to any ${who} fixture yet — no `
    + `bridge row and no live-plane row names it — so there is no absence `
    + `read to find. Joins are made only when both clubs and the kickoff `
    + `match exactly, never guessed`,
  sweep_off: (who) => `this match is not joined to any ${who} fixture, and `
    + `no join was attempted: the absence sweep that makes these joins is `
    + `switched off on this deployment (an operator setting that spends `
    + `metered ${who} requests), and no live-plane row names it. So there `
    + `is no absence read to find`,
  not_sent: (who) => `no absence read is recorded for this match. ${who} `
    + `absences are stored under ${who}'s own fixture id, and this page `
    + `reads by ESPN's; the payload did not say whether the two are joined`,
  unrecognised: (who) => `no absence read is recorded for this match, and `
    + `the backend joined it to ${who} by a route this page has no words for`,
};

export const resolvedByOf = (v: unknown):
  AbsenceResolvedBy | "not_sent" | "unrecognised" =>
  v == null ? "not_sent"
    : (ABSENCE_RESOLVED_BY as readonly string[]).includes(String(v))
      ? v as AbsenceResolvedBy : "unrecognised";

/** THE BACKEND'S GAP SENTENCE, FOR A READER. Shown verbatim except for
 *  two things a reader is never handed: a parenthesised evidence FILE
 *  PATH (the Liga MX sentence cites "(research_archive/team_news_
 *  coverage_2026-07-30*.json)") and a payload key in backticks. The
 *  sentence's claim is untouched — only its citation of a file is. */
export const gapWords = (t: string) => t
  .replace(/\s*\([^()]*\/[^()]*\.(?:json|gz|csv|parquet)[^()]*\)/g, "")
  .replace(/`([^`]*)`/g, "$1").trim();

/** The words every team-news block carries (news proposal 1d, pinned by
 *  e2e/hub-parity.spec.ts). */
export const TEAM_NEWS_LABEL =
  "a read, not a signal · shadow · not advice · the live shadow model "
  + "does not use this";

/** A provider's lineup state for one side (team_news
 *  `_lineup_state_word`), in words. Only these are read; ANY other value
 *  — absent, or a state the backend adds — is "not known", never folded
 *  into "not released": that fold is the false-integrity-signal shape
 *  the parity review found on the backend's side of this very feed. */
export const LINEUP_STATE_WORDS: Record<string, string> = {
  released: "released",
  not_released: "not released yet — not a claim that anyone is out",
  no_coverage: "this provider carries no roster for this match",
};
export const LINEUP_STATE_UNKNOWN =
  "lineup state not known for this side — not a claim that the XI is or "
  + "is not out";

// ---------------------------------------------------------------- W1.12

/** The venue classes the backend derives, in BOTH vocabularies a hub can
 *  carry: the championships derivation (src/championships/espn.py
 *  `venue_class`, a nation) and the club board's (src/picker/board.py
 *  `venue_class`, a club league), which adds DOMESTIC — both clubs'
 *  league plays in the venue's country, so the listed home side is taken
 *  as host. The class is a DERIVATION from the venue's place — ESPN's own
 *  `neutralSite` flag is not one: it was false on every one of 341
 *  recorded national summaries, neutral grounds included. So the flag is
 *  never read as "home", and only a derived class may say who hosts. */
export type VenueClass = "TRUE_HOME" | "OPPONENT_COUNTRY" | "NEUTRAL"
  | "DOMESTIC" | "UNKNOWN";
export const VENUE_CLASSES: readonly VenueClass[] =
  ["TRUE_HOME", "OPPONENT_COUNTRY", "NEUTRAL", "DOMESTIC", "UNKNOWN"];

/** `venue_class` as match_hubs.venue_class_of serves it on every hub
 *  route (and as a frozen read carries its narrower copy). `rule` is the
 *  backend's prose naming its own function, and is not shown. */
export type VenueRead = { class?: string | null; home_side?: string | null;
  basis?: string | null; country?: string | null;
  unresolved_why?: string | null;
  venue?: { name?: string | null; city?: string | null;
    country?: string | null } | null;
  rule?: string | null; neutral_site_flag_read?: boolean | null };

/** Where the derivation placed the venue from, in words. */
export const VENUE_BASIS_WORDS: Record<string, string> = {
  venue_country: "placed by the venue's country",
  venue_city: "placed by the venue's city",
  venue_name: "placed by the venue's name",
  finals_hosts: "placed by the finals' declared hosts",
  league_countries: "placed by the venue's country against the countries "
    + "the league plays in",
  unresolved: "the venue could not be placed",
};

/** Why an unresolved venue stayed unresolved, in words — every refusal
 *  `identity.resolve_venue_place`, `espn.venue_class` and
 *  `match_hubs.venue_class_of` name. A code with a `: detail` tail
 *  (`classifier_failed: KeyError`, `not_classified_here: …`) is read by
 *  its head. A code outside this table is said to be one, not guessed. */
export const VENUE_UNRESOLVED_WORDS: Record<string, string> = {
  team_unresolved: "one side's identity did not resolve",
  finals_host_side_venue_unknown:
    "a host nation is playing and the venue's country is not recorded",
  no_venue: "the provider named no venue",
  city_not_in_table: "the venue's city is not in the recorded place table",
  city_conflict: "the venue's city name belongs to more than one country",
  name_not_in_table: "the venue's name is not among the reviewed venues",
  no_venue_in_summary: "ESPN's match summary names no venue",
  sides_not_in_summary: "ESPN's match summary does not name both sides",
  country_not_in_league_registry:
    "the venue's country is not one the league registry knows",
  classifier_failed: "the venue classifier failed on this match",
  not_classified_here:
    "this competition has no venue rule registered on this page",
};
export const VENUE_UNRESOLVED_UNKNOWN =
  "the backend named a reason this page has no words for";

export const venueUnresolvedWords = (why: string) =>
  VENUE_UNRESOLVED_WORDS[why]
    ?? VENUE_UNRESOLVED_WORDS[why.split(":", 1)[0].trim()]
    ?? VENUE_UNRESOLVED_UNKNOWN;

/** WHERE THE VENUE LINE'S CLASS CAME FROM, or why there is none.
 *
 *    hub_route            the payload's own `venue_class` — every hub
 *                         route serves one (match_hubs.venue_class_of)
 *    frozen_read          board_read.state.venue_class — the class the
 *                         frozen pre-kickoff read was computed with, read
 *                         only when the route sends none (a backend from
 *                         before the venue line)
 *    plane_sends_none     a league plane's route carrying no class (a
 *                         backend from before the venue line)
 *    no_frozen_read       a generic hub with no class on the route and no
 *                         captured read to carry one
 *    refused_read         ... whose frozen read was a refusal, which
 *                         keeps no venue class (match_archive `_state`)
 *    read_without_class   ... whose captured read carries no class */
export type VenueSource = "hub_route" | "frozen_read" | "plane_sends_none"
  | "no_frozen_read" | "refused_read" | "read_without_class";

type ReadLike = { origin?: string | null;
  state?: Record<string, unknown> | null } | null | undefined;

const isObj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);

export function venueFrom(slug: string, routeClass: unknown,
  boardRead: ReadLike): { v: VenueRead | null; source: VenueSource } {
  if (isObj(routeClass)) {
    return { v: routeClass as VenueRead, source: "hub_route" };
  }
  if (isPlaneHub(slug)) return { v: null, source: "plane_sends_none" };
  if (!boardRead || boardRead.origin !== "captured"
      || !isObj(boardRead.state)) {
    return { v: null, source: "no_frozen_read" };
  }
  const st = boardRead.state;
  if (isObj(st.venue_class)) {
    return { v: st.venue_class as VenueRead, source: "frozen_read" };
  }
  if (st.refused === true) return { v: null, source: "refused_read" };
  return { v: null, source: "read_without_class" };
}

/** Why the line has no class, in words (the reader's half of the
 *  VenueSource codes). */
export const VENUE_GAP_WORDS: Record<
  Exclude<VenueSource, "hub_route" | "frozen_read">, string> = {
  plane_sends_none: "this hub's match route carries no derived venue "
    + "class and no frozen pre-kickoff read",
  no_frozen_read: "this hub's match route carries no derived venue class, "
    + "and there is no frozen pre-kickoff read on this page to carry one",
  refused_read: "this hub's match route carries no derived venue class, "
    + "and the frozen pre-kickoff read was a refusal, which keeps none",
  read_without_class: "this hub's match route carries no derived venue "
    + "class, and the frozen pre-kickoff read on this page carries none",
};

/** Where the class on the line came from, in words. */
export const VENUE_SOURCE_WORDS: Record<"hub_route" | "frozen_read",
  string> = {
  hub_route: "classified by the board's own rule for this competition",
  frozen_read: "as the frozen pre-kickoff read classified it",
};

// ---------------------------------------------------------------- W1.5

/** WHY A NATIONAL SHOT STATE IS NOT KNOWN, by the backend's own code
 *  (`shot_state.not_known_reason`, TRIVELA src/match_archive/tail.py
 *  SHOTS_NOT_KNOWN). Each is "not known" — never a no, never zero shots,
 *  and never a provider failure: a FAILED feed arrives with no code and
 *  its failure in `error`, and the card still draws that as a failure. */
export const SHOT_NOT_KNOWN_CODES = ["not_requested",
  "no_play_by_play_published", "empty_play_by_play",
  "team_ids_missing"] as const;
export type ShotNotKnown = (typeof SHOT_NOT_KNOWN_CODES)[number];
export type ShotGap = ShotNotKnown | "unrecognised";

export const SHOT_GAP_WORDS: Record<ShotGap, string> = {
  not_requested:
    "no shot state was asked for on this read. The match archive keeps "
    + "goal and red-card minutes and the team totals, not a shot-by-shot "
    + "tape, and ESPN's play-by-play is read only when the review asks "
    + "for it. Not known — not a goalless tape, and not a failed read",
  no_play_by_play_published:
    "no shot state can be read for this match: ESPN publishes no "
    + "play-by-play for this competition's feed (AFCON qualifiers: none "
    + "of 26 probed matches carried commentary), so there is nothing to "
    + "count shots from. A data wall, not a pending build — not known, "
    + "never a no",
  empty_play_by_play:
    "ESPN's play-by-play feed came back with no plays for this match, so "
    + "no checkpoint can be read. Not known — and NOT a goalless tape",
  team_ids_missing:
    "the two sides' ESPN team ids are missing or identical in the match "
    + "archive, so a play cannot be credited to either side. Not known — "
    + "not a goalless tape",
  unrecognised:
    "the backend says this match's shot state is not known, for a reason "
    + "this page has no words for. Not known — not a goalless tape, and "
    + "not a failed read",
};

/** Where a read shot state came from (`shot_state.source`), in words. */
export const SHOT_SOURCE_WORDS: Record<string, string> = {
  espn_play_by_play: "shots counted off ESPN's play-by-play",
};

/** THE ARCHIVE'S PRE-W1.5 SENTENCE for a national row with no tape —
 *  TRIVELA src/match_archive/tail.py `NO_TAPE`, which a backend from
 *  before the play-by-play read sends in `error` with no code. It is the
 *  same fact the backend now codes `not_requested` (whose sentence opens
 *  with it), so it is read as that code: recognised by exact text, never
 *  by a fuzzy match, and retired with the last backend that sends it. */
export const LEGACY_NO_TAPE_SENTENCE =
  "the match archive keeps goal and red-card minutes and the team totals, "
  + "not a shot-by-shot tape, so no checkpoint can be read";

/** Why a finished row has no shot state BY DESIGN, or null when it is
 *  not that case (a real tape, or a real failure, which the card draws
 *  as it always has). */
export function shotGap(row: {
  league: string; espn?: string | null;
  shot_state: { at_20: unknown; before_first_goal: unknown;
    full_time: unknown; error: string | null;
    not_known_reason?: string | null };
}): ShotGap | null {
  const s = row.shot_state;
  if (s.at_20 || s.before_first_goal || s.full_time) return null;
  const code = s.not_known_reason;
  if (typeof code === "string" && code) {
    return (SHOT_NOT_KNOWN_CODES as readonly string[]).includes(code)
      ? code as ShotNotKnown : "unrecognised";
  }
  if (isNationHub(row.league)
      && (s.error ?? "").trim() === LEGACY_NO_TAPE_SENTENCE) {
    return "not_requested";
  }
  return null;
}

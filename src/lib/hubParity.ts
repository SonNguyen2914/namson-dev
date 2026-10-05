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
 *  exchange can list and which of them this page has. */
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

/** Why a family the page does not carry is missing, in words.
 *
 *  Two different facts, and the hub knows which one it is in:
 *    not_bridged_here  a hub on the generic route, which bridges ONLY the
 *                      winner (GAME) series today (TRIVELA
 *                      docs/MATCH-HUBS.md: "books — 0 or 1 entry").
 *                      Whether Kalshi lists the family for this match is
 *                      not established on this page — the family was
 *                      never asked for.
 *    none_listed       a league plane, which reads every family off the
 *                      winner event and keeps a family only when it came
 *                      back with markets. Absent means nothing was read
 *                      for it — not listed, or the read returned nothing;
 *                      the page cannot tell which. */
export type FamilyGap = "not_bridged_here" | "none_listed";

export function familyGap(generic: boolean): FamilyGap {
  return generic ? "not_bridged_here" : "none_listed";
}

export const FAMILY_GAP_WORDS: Record<FamilyGap, (tag: string) => string> = {
  not_bridged_here: (tag) =>
    `not on this page yet — the ${tag} hub bridges only the winner `
    + "series; whether Kalshi lists this family for this match is not "
    + "established here, and no price is implied",
  none_listed: () =>
    "no market in this family was read for this match — not listed, or "
    + "the read came back empty; this page cannot tell which",
};

// ---------------------------------------------------------------- W1.6

/** Why a competition's provider absences may be missing, per competition
 *  and per state of the read. ALL ELEVEN are keys, including those with
 *  nothing to add (`{}`), so a twelfth hub cannot join without a decision
 *  here — the guard asserts the key set equals the hub pages.
 *
 *    never  shown when no absence capture has been recorded under this
 *           match's reference
 *    empty  shown when the provider answered with an empty list
 *
 *  A competition-specific note is ADDED to the block's own sentence for
 *  the state, never substituted for it: the state sentence always says
 *  that an empty block is not "nobody is missing". */
export const ABSENCE_GAPS: Record<HubSlug, { never?: string; empty?: string }> = {
  mls: {
    empty: "API-Football's MLS injury list is thin, so a short or empty "
      + "list is weak evidence either way",
  },
  epl: {},
  laliga: {},
  ligamx: {
    never: "API-Football returns no injuries for Liga MX — measured "
      + "empty on upcoming and completed fixtures alike — so this block "
      + "stays empty whatever the read: a data wall, not a pending build",
    empty: "API-Football returns no injuries for Liga MX — measured "
      + "empty on upcoming and completed fixtures alike — so an empty "
      + "list here is the provider's silence, not the squad's",
  },
  bundesliga: {
    never: "this league's absences are not swept yet: the injuries read "
      + "covers the four league planes, and widening it to all eight "
      + "board leagues is still to land",
  },
  seriea: {
    never: "this league's absences are not swept yet: the injuries read "
      + "covers the four league planes, and widening it to all eight "
      + "board leagues is still to land",
  },
  ligue1: {
    never: "this league's absences are not swept yet: the injuries read "
      + "covers the four league planes, and widening it to all eight "
      + "board leagues is still to land",
  },
  eredivisie: {
    never: "this league's absences are not swept yet: the injuries read "
      + "covers the four league planes, and widening it to all eight "
      + "board leagues is still to land",
  },
  unl: {
    never: "national teams are not swept for absences: their provider "
      + "coverage has never been measured, so the read is skipped until a "
      + "probe shows the provider lists them",
  },
  cnl: {
    never: "national teams are not swept for absences: their provider "
      + "coverage has never been measured, so the read is skipped until a "
      + "probe shows the provider lists them",
  },
  afcon: {
    never: "national teams are not swept for absences: their provider "
      + "coverage has never been measured, so the read is skipped until a "
      + "probe shows the provider lists them",
  },
};

/** The words every team-news block carries (news proposal 1d, pinned by
 *  e2e/hub-parity.spec.ts). */
export const TEAM_NEWS_LABEL =
  "a read, not a signal · shadow · not advice · the live shadow model "
  + "does not use this";

// ---------------------------------------------------------------- W1.12

/** The venue classes the backend derives (TRIVELA src/championships/
 *  espn.py `venue_class`, the club board's shared vocabulary). The class
 *  is a DERIVATION from the venue's place — ESPN's own `neutralSite` flag
 *  is not one: it was false on every one of 341 recorded national
 *  summaries, neutral grounds included. So the flag is never read as
 *  "home", and only a derived class may say who hosts. */
export type VenueClass = "TRUE_HOME" | "OPPONENT_COUNTRY" | "NEUTRAL"
  | "UNKNOWN";
export const VENUE_CLASSES: readonly VenueClass[] =
  ["TRUE_HOME", "OPPONENT_COUNTRY", "NEUTRAL", "UNKNOWN"];

export type VenueRead = { class?: string | null; home_side?: string | null;
  basis?: string | null; country?: string | null;
  unresolved_why?: string | null };

/** Where the derivation placed the venue from, in words. */
export const VENUE_BASIS_WORDS: Record<string, string> = {
  venue_country: "placed by the venue's country",
  venue_city: "placed by the venue's city",
  venue_name: "placed by the venue's name",
  finals_hosts: "placed by the finals' declared hosts",
  unresolved: "the venue could not be placed",
};

/** Why an unresolved venue stayed unresolved, in words. */
export const VENUE_UNRESOLVED_WORDS: Record<string, string> = {
  team_unresolved: "one side's identity did not resolve",
  finals_host_side_venue_unknown:
    "a host nation is playing and the venue's country is not recorded",
};

// ---------------------------------------------------------------- W1.5

/** THE ARCHIVE'S OWN SENTENCE for a national review row with no tape —
 *  copied verbatim from TRIVELA src/match_archive/tail.py `NO_TAPE`, so a
 *  backend that serves it today is recognised as a STATED GAP and not
 *  drawn as a provider failure. A backend that sends a reason code
 *  (`shot_state.unavailable_reason`) is read by code instead; any other
 *  error text stays a failure, named as one. */
export const NO_TAPE_SENTENCE =
  "the match archive keeps goal and red-card minutes and the team totals, "
  + "not a shot-by-shot tape, so no checkpoint can be read";

/** ESPN's AFCON qualifier slug. ESPN publishes no commentary for these
 *  matches, so no shot state can be read for them by any build. */
export const AFCON_QUALIFIER_SLUG = "caf.nations_qual";

export type ShotGap = "no_tape_yet" | "no_commentary";

export const SHOT_GAP_WORDS: Record<ShotGap, string> = {
  no_tape_yet:
    "no shot state for this match yet. The match archive keeps goal and "
    + "red-card minutes and the team totals, not a shot-by-shot tape; "
    + "reading national matches' shots off ESPN's play-by-play is not "
    + "built yet. This is a stated gap, not a failed read, and it is not "
    + "a claim about the match",
  no_commentary:
    "no shot state can exist for this match: ESPN publishes no "
    + "play-by-play for AFCON qualifiers, so there is nothing to read the "
    + "shots from. A data wall, not a pending build — and not a claim "
    + "about the match",
};

/** Codes a backend may send as `shot_state.unavailable_reason`. */
const SHOT_GAP_CODES: Record<string, ShotGap> = {
  no_tape: "no_tape_yet",
  no_tape_in_archive: "no_tape_yet",
  archive_has_no_tape: "no_tape_yet",
  no_commentary: "no_commentary",
  espn_no_commentary: "no_commentary",
};

/** Why a finished national row has no shot state BY DESIGN, or null when
 *  it is not that case (a real tape, or a real failure, which the card
 *  draws as it always has). */
export function shotGap(row: {
  league: string; espn?: string | null;
  shot_state: { at_20: unknown; before_first_goal: unknown;
    full_time: unknown; error: string | null;
    unavailable_reason?: string | null };
}): ShotGap | null {
  const s = row.shot_state;
  if (s.at_20 || s.before_first_goal || s.full_time) return null;
  const code = s.unavailable_reason ? SHOT_GAP_CODES[s.unavailable_reason]
    : undefined;
  if (code) return code;
  if (!isNationHub(row.league)) return null;
  if (row.espn === AFCON_QUALIFIER_SLUG) return "no_commentary";
  if ((s.error ?? "").trim() === NO_TAPE_SENTENCE) return "no_tape_yet";
  return null;
}

// The review tail — types and one fetch, mirroring GET /api/picker/review.
//
// WHAT THIS SURFACE IS. The board loses a fixture at kickoff. This is the
// other half: the finished matches of the last few days, each carrying
// THREE things that are deliberately never collapsed into one.
//
//   1. WHAT THE PICKER SAID BEFORE KICKOFF — the tier gaps, the shape, the
//      Stage-1 gaps, and (when it was frozen) the price at capture.
//   2. WHAT HAPPENED — the final score AND the shot state, because the
//      result alone hides the evidence behind it.
//   3. WHETHER IT FIT — two verdicts, `favourite_won` (the scoreboard) and
//      `confirmed_at_20` (the tape), derived separately. They disagree,
//      and the disagreement is the whole value of the page.
//
// THE ONE RULE THIS FILE EXISTS TO CARRY INTO THE UI. A CAPTURED read and
// a RECONSTRUCTED one are not the same evidence and must never be drawn
// the same. A capture is what the picker actually said, frozen before the
// match. A reconstruction is the picker's own code re-run over an archive
// rewound to that kickoff — honest, but rebuilt after the fact, and weaker
// for it. `origin` is the discriminator; the renderer branches on it
// structurally, not merely by colour (see components/ReviewCard.tsx).
//
// NOT A SIGNAL SURFACE, and less so than the board: nothing here is a
// probability, an edge or a recommendation, and NO RUNNING TALLY of hits
// is kept anywhere in this module or the components that read it. A hit
// count over a handful of matches reads as evidence it is not.

import {
  BlendWeights, KalshiQuote, Shape, Src, TierPair,
} from "./pickerApi";

/** The two ways a pre-kickoff read can exist. A third state — neither —
 *  is carried as `state: null` with `unavailable_reason` naming why. */
export type ReviewOrigin = "captured" | "reconstructed";

/** The picker row as it stood before kickoff. A CAPTURED state is a whole
 *  board row (it was one), so it carries `kalshi`; a RECONSTRUCTED state
 *  is `stages.compare` output, which has no book snapshot and no event id
 *  — that absence is a fact about reconstruction and is rendered as one,
 *  never as an empty price cell. */
export interface PreKickoffRow {
  refused: false;
  league: string;
  home: string;
  away: string;
  favourite: string;
  opponent: string;
  fav_side: "home" | "away";
  resolution: Record<string, string>;
  ppg_gap: number;
  gdg_gap: number;
  rank_gap: number;
  gp_current: { home: number | null; away: number | null; min: number | null };
  /** present on a read frozen after the season blend shipped
   *  (2026-08-31); absent on a RECONSTRUCTION, which is rebuilt through
   *  the legacy hard switch on purpose — re-rating a finished match
   *  under a design the picker did not have at kickoff is the one thing
   *  the reconstruction path exists to prevent. */
  weights?: BlendWeights | null;
  /** WHICH RULE NAMED THE FAVOURITE THIS CAPTURE IS SIGNED FROM, and
   *  the field it was named on when there was one.
   *
   *  All three are OPTIONAL because a capture frozen before they
   *  existed carries none, and a reader that turned a missing
   *  `fav_source` into "the current rule" would date a record it never
   *  read. The current rule emits `"field"` with a `field` block on a
   *  cross-league row; the superseded one emitted `"rank"` and carried
   *  no field, which is how a pre-8dfa813 capture is recognised without
   *  comparing timestamps to a deploy. */
  cross_league?: boolean | null;
  fav_source?: string | null;
  field?: unknown;
  src: Src;
  ranks: { fav: number; opp: number };
  tiers: { ovr: TierPair; atk: TierPair; def: TierPair };
  tier_gaps: { ovr: number; atk: number; def: number };
  shape: Shape;
  kickoff?: string | null;
  event_id?: string | null;
  /** captured reads only — a reconstruction never has a book */
  kalshi?: KalshiQuote | null;
}

/** `stages.compare` refuses a fixture whose club has no row in the table
 *  in use (a promoted side, most often). A reconstruction can hit that
 *  too, and it is a READ THAT DOES NOT EXIST — not a read of zero. */
export interface PreKickoffRefusal {
  refused: true;
  league?: string;
  home?: string;
  away?: string;
  club: string;
  reason: string;
}

export type PreKickoffState = PreKickoffRow | PreKickoffRefusal;

/** Everything the reconstruction discloses about itself. A refusal keeps
 *  this object with `season_file: null` and the candidate files it looked
 *  at — "your archive stops before this match" is a fixable fact and must
 *  reach the screen. */
export interface ReconSource {
  season_file: string | null;
  season_file_sha256?: string | null;
  season_file_last_fixture?: string | null;
  season_year?: string | null;
  prior_file?: string | null;
  results_in_table?: number | null;
  src?: Src | null;
  min_current_gp?: number | null;
  rewound_to?: string | null;
  archive_fixture_id?: number | null;
  archive_result?: { home: number; away: number } | null;
  considered?: { path: string; last_fixture: string | null }[];
}

export interface PreKickoff {
  origin: ReviewOrigin;
  origin_label: string;
  origin_note: string;
  /** captured only */
  captured_at: string | null;
  captured_seconds_before_kickoff: number | null;
  board_date: string | null;
  /** reconstructed only */
  reconstructed_from: ReconSource | null;
  unavailable_reason: string | null;
  state: PreKickoffState | null;
}

export interface SideCounts {
  shots: number;
  on_target: number;
  corners: number;
  crosses: number;
  take_ons: number;
  saves: number;
}

/** One checkpoint of the tape. RAW COUNTS ALWAYS — the event count is
 *  part of the answer, and a bare share hides that 0-0 on target and 3-1
 *  on target are different matches. Favourite-relative fields are null
 *  when no pre-kickoff favourite is known: the page never invents a side
 *  to have been right about. */
export interface Checkpoint {
  checkpoint: string;
  cutoff_minute: number | null;
  home: SideCounts;
  away: SideCounts;
  score: { home: number; away: number };
  included_plays: number | null;
  fav_side: "home" | "away" | null;
  shot_share: number | null;
  tilt: number | null;
  tilt_label: string | null;
  tilt_band: number;
  tilt_note: string;
  on_target: { fav: number; opp: number; lead: number } | null;
}

export interface ShotState {
  at_20: Checkpoint | null;
  before_first_goal: Checkpoint | null;
  full_time: Checkpoint | null;
  first_goal_minute: number | null;
  error: string | null;
}

/** TWO verdicts, never one tick. Either can be null, which means NOT
 *  KNOWN and must never render as a no. */
export interface Fit {
  favourite_won: boolean | null;
  favourite_won_reason: string | null;
  confirmed_at_20: boolean | null;
  confirm_reason: string | null;
  confirm_rule: string;
  confirm_note: string;
  checkpoint_minute: number;
}

export interface ReviewRow {
  league: string;
  espn: string;
  event_id: string;
  competition_id: string;
  kickoff: string | null;
  home: string | null;
  away: string | null;
  status_detail: string | null;
  result: {
    home: number; away: number;
    winner: "home" | "away" | "draw";
    source: string;
  } | null;
  pre_kickoff: PreKickoff;
  shot_state: ShotState;
  fit: Fit;
}

/** A `post` fixture that did not actually complete — postponed, abandoned.
 *  Listed, never filtered: treating one as a 0-0 would invent a result. */
export interface ReviewRefusal {
  league: string;
  espn: string;
  event_id: string;
  competition_id?: string;
  kickoff?: string | null;
  home?: string | null;
  away?: string | null;
  status_detail?: string | null;
  reason: string;
}

/** Per-league provenance inventory. These are counts of EVIDENCE, not of
 *  outcomes: how many finished fixtures had a frozen read, how many had to
 *  be rebuilt, how many have no read at all. They sum to `finished`, so
 *  every one of them is shown against its own n. No outcome is tallied
 *  here or anywhere else on this surface. */
export interface ReviewLeagueMeta {
  finished: number;
  captured: number;
  reconstructed: number;
  unavailable: number;
  error: string | null;
}

/** Which snapshot backend answered, and whether it can write at all. This
 *  is why "nothing was captured" can always be told apart from "capture
 *  was never configured here" — and on a box where it is not configured,
 *  the page has to say so, because otherwise every read being a
 *  reconstruction looks like a coincidence. */
export interface StoreDescription {
  backend: string;
  writable: boolean;
  note?: string | null;
  [k: string]: unknown;
}

export interface Review {
  generated_at: string;
  date: string;
  back: number;
  window: { from: string; to: string };
  store: StoreDescription;
  /** THE COMPETITIONS THIS SWEEP ACTUALLY READ, one entry each.
   *
   *  A key is written for every competition the backend swept, BEFORE
   *  it fetched anything — so a competition that was read and failed
   *  still has one (carrying `error`), and a competition with NO KEY
   *  AT ALL was never read. That is not a subtlety; it is the whole
   *  difference between "nothing finished" and "we never looked", and
   *  it is the only place the payload records it. See `readHere`. */
  leagues: Record<string, ReviewLeagueMeta>;
  finished: ReviewRow[];
  refusals: ReviewRefusal[];
  /** PRESENT ONLY WHEN THE CALLER NARROWED THE SWEEP (backend PR #123,
   *  2026-09-10); it lists what was ASKED FOR. Absent on the declared
   *  review, and that absence is the sentence "this is what the board
   *  declares".
   *
   *  It matters here for the same reason it matters on the board:
   *  `leagues` is the shape a DECLARATION has, the landing page derives
   *  per-column state from it, and a finished Leagues Cup once walked
   *  back onto a board that had removed it through exactly this
   *  payload. Nothing may read a narrowed key set as the operator's
   *  columns. */
  narrowed_to?: string[] | null;
}

/** DID THIS SWEEP READ THAT COMPETITION AT ALL?
 *
 *  The three states a finished tail must keep apart, and this function
 *  separates the second from the first:
 *
 *    1. ASKED, AND NONE FINISHED — a key, `finished: 0`, no error. The
 *       tail says "no fixtures finished in this window", which is a
 *       measurement.
 *    2. NEVER ASKED — no key. The tail must NOT say zero. Nothing was
 *       measured, and rendering an unread competition as an empty one
 *       is the defect `review_competitions()` was written against:
 *       "No Champions League fixtures finished in the last 7 days" over
 *       six that were played.
 *    3. ASKED AND THE READ FAILED — a key carrying `error`, in the
 *       backend's own words. Already distinguished by `meta.error`.
 *
 *  `meta === undefined` IS the payload's own record of (2), not an
 *  inference: `assemble_review` writes each competition's meta before
 *  it fetches, so the key survives every failure and is absent only
 *  when the sweep never covered it. */
export function readHere(review: Review | null, slug: string): boolean {
  return !!review && Object.prototype.hasOwnProperty.call(review.leagues, slug);
}

/** THE REVIEW'S DECLARATION, OR THE ADMISSION THAT THIS PAYLOAD IS NOT
 *  IT — the exact counterpart of `pickerApi.declarationOf`, and here for
 *  the same reason.
 *
 *  Nothing derives the landing page's column set from this payload
 *  today; that door was closed on 2026-09-08 after the review's keys
 *  walked a removed Leagues Cup back onto the board. This function
 *  exists so that if anything ever reads these keys as columns again,
 *  it reads them through a check that can tell a narrowed answer from
 *  the operator's declaration — rather than through `Object.keys`,
 *  which cannot. `null` is "this payload was never asked that
 *  question"; an empty array would be the different claim "it declares
 *  nothing". */
export function reviewDeclarationOf(review: Review): string[] | null {
  return review.narrowed_to == null ? Object.keys(review.leagues) : null;
}

/** DID THE REVIEW ANSWER THE QUESTION WE ASKED IT?
 *
 *  True only when `narrowed_to` covers every slug asked for. A backend
 *  deployed behind this frontend does not know the parameter, drops it,
 *  and answers 200 with its DECLARED sweep — four other competitions'
 *  finished matches and none of this one. `readHere` already refuses to
 *  render that as zero; this names WHY, so the page can say the read
 *  did not answer rather than leaving the reader to guess. Mirrors
 *  `pickerApi.askHonoured` exactly. */
export function reviewAskHonoured(
  review: Review, asked: readonly string[],
): boolean {
  const got = review.narrowed_to;
  return Array.isArray(got) && asked.every((s) => got.includes(s));
}

/** The back-window choices. The endpoint accepts 1..30 and 422s outside
 *  it rather than clamping, so this list may never grow past 30. 7 is the
 *  default because it MATCHES THE BOARD'S FORWARD WINDOW: a league column
 *  should tell one continuous story, and two different windows above and
 *  below the divider would make the tail read as a separate page. */
export const REVIEW_WINDOWS = [1, 3, 7, 14, 30];
export const DEFAULT_BACK = 7;
export const MAX_BACK = 30;

/** True when this pre-kickoff state is a full read rather than a refusal
 *  or an absence. Written as a guard so no caller has to remember which
 *  of the three shapes it is holding. */
export function isRead(s: PreKickoffState | null | undefined): s is PreKickoffRow {
  return !!s && s.refused === false;
}

/** The favourite's share of the shots at a checkpoint, as a percentage
 *  string. Null renders as an em dash — a checkpoint with no favourite is
 *  not a 50%. */
export const pct = (v: number | null | undefined) =>
  v == null ? "—" : `${Math.round(v * 100)}%`;

/** `leagues` ASKS FOR COMPETITIONS BY NAME, exactly as `fetchBoard`
 *  does, and the two are deliberately the same shape: a page narrowed
 *  to one competition asks BOTH endpoints the same question, or its
 *  upper half is about the Champions League and its finished tail is
 *  about somebody else's week.
 *
 *  OMITTING IT IS WHAT KEEPS A REMOVED COMPETITION OFF THE LANDING
 *  PAGE. `/bet-suggester` passes nothing, so the request URL, the
 *  backend's cache key and the payload are the strings they have always
 *  been, and the answer carries no `narrowed_to` to be mistaken for a
 *  declaration.
 *
 *  The query parameter needs no proxy allowlist change:
 *  `pages/api/picker/[...path].ts` forwards `req.url`'s query string
 *  verbatim and gates only on the PATH, which `picker: ["board",
 *  "review"]` already allows. Confirmed by reading that handler, not
 *  assumed — and pinned by the unmocked proxy test in
 *  e2e/finished-is-asked-for.spec.ts. */
export async function fetchReview(
  back: number, signal?: AbortSignal, leagues?: readonly string[],
): Promise<Review> {
  const ask = leagues && leagues.length > 0
    ? `&leagues=${encodeURIComponent(leagues.join(","))}` : "";
  let r: Response;
  try {
    r = await fetch(`/api/picker/review?back=${back}${ask}`, { signal });
  } catch (e) {
    // Same rule as the board's fetch: an abort is the caller's own
    // cancellation and is rethrown untouched; anything else is the
    // browser's raw network vocabulary, which is not a message.
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new Error(
      "the request never reached the server — check the connection and try again");
  }
  if (!r.ok) {
    let detail = "";
    try {
      const body = await r.json();
      detail = body?.detail || body?.error || "";
    } catch { /* non-JSON body; the status is all we have */ }
    throw new Error(detail || `review request failed (${r.status})`);
  }
  // A 200 IS NOT A PAYLOAD. `return r.json()` folded three findings
  // into one: a SyntaxError in the browser's own vocabulary for a 204
  // or an upstream HTML error page — which is debugging text, not the
  // named situation this function is careful to give every other
  // failure — and, worse because it does not throw at all, a literal
  // `null` body handed back typed as Review. The caller renders that as
  // the review having nothing on it, which is a claim about the slate
  // made off a read that never landed.
  const raw = await r.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(
      `the server answered ${r.status} with a body that is not JSON `
      + `(${raw.length} characters) — that is an answer we could not `
      + "read, not an empty review");
  }
  if (body === null || typeof body !== "object") {
    throw new Error(
      `the server answered ${r.status} with ${JSON.stringify(body)} `
      + "where a review was expected — there is no payload here, and it "
      + "must not be read as an empty one");
  }
  return body as Review;
}

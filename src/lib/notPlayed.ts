// A MATCH THAT WAS NOT PLAYED HAS NO SCORE (audit W8-FE-02, 2026-11-15).
//
// ESPN serves a postponed, cancelled, abandoned or suspended match with
// state `post` (or still `pre`) and scores "0". The backend tags those
// `postponed: true` (TRIVELA src/mls.py parse_event and the match
// summary, via src/live/final_result.is_not_played) and says beside the
// tag that the scores are NOT a result. The hubs and league dashboards
// drew them anyway: a big "0–0", a tab titled "NE 0–0 MIA", or a live
// countdown to a kickoff that is not going to happen.
//
// One flag reader and one sentence, so every surface says the same.

/** The words in a score slot whose match was not played. */
export const POSTPONED_NO_RESULT = "postponed — no result";

/** The score placeholder for a match that was not played. */
export const NO_SCORE = "—";

/** The backend's own verdict, read — never inferred here from a detail
 *  string, which would be a second copy of the provider's vocabulary. */
export function isNotPlayed(m: { postponed?: boolean | null } | null | undefined): boolean {
  return m?.postponed === true;
}

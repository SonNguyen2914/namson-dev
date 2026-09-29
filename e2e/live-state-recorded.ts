/* THE WC26 LIVE-STATE READ, RECORDED OFF THE ROUTE — not off a brief
 * (2026-09-28).
 *
 * `GET /api/prediction/CAN_MAR/live-state` (backend api/main.py
 * `fetch_live_state`) called IN PROCESS through FastAPI's TestClient on
 * backend a69f15b2, with ONE substitution: `live_state_for` — the provider
 * read — returned a state in the parser's own output shape
 * (src/live_feed.py: the ESPN reader stamps `source: "espn"`, the
 * API-Football parser `"api-football"`), so no provider was asked.
 * Everything else — `minute_unread`, and the whole `budget` block from
 * `live_feed.budget_status()` — is the route's own output. No production
 * backend holds the keyless shape (it has a key), which is why this is
 * the route run locally rather than a production read.
 *
 * KEYLESS: `API_FOOTBALL_KEY` unset. `budget.remaining` is 0 and
 *   `remaining_means` says WHY — no key, so no call can be made, which is
 *   not a spent budget (the backend's 2026-09-09 fix).
 * KEYED: a key set, so `remaining` is the cap arithmetic again and
 *   `remaining_means` is "calls left against today's cap".
 *
 * LIVE_SCORES is `/api/live-scores` for the same match: the keys of
 * `live_state.scoreboard_entries()`' in-play branch (the internal `_sort`
 * is not served), filled from the state above and the schedule's own
 * names for CAN_MAR, with the keyless `budget_status()` beside it. */
export const LIVE_STATE_KEYLESS = {
 "available": true,
 "match_id": "CAN_MAR",
 "current_home": 1,
 "current_away": 0,
 "minutes_elapsed": 55.0,
 "red_home": 0,
 "red_away": 0,
 "status_short": "2H",
 "is_live": true,
 "is_finished": false,
 "goals_list": [],
 "source": "espn",
 "minute_unread": false,
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 0,
  "remaining_means": "NO API-Football key is configured, so no call can be made today regardless of the cap. This is not a spent budget — the counter below never moved because nothing was ever asked. The keyless ESPN reader carries the live state",
  "key_configured": false,
  "fallback": "espn"
 }
};

export const LIVE_STATE_KEYED = {
 "available": true,
 "match_id": "CAN_MAR",
 "current_home": 1,
 "current_away": 0,
 "minutes_elapsed": 55.0,
 "red_home": 0,
 "red_away": 0,
 "status_short": "2H",
 "is_live": true,
 "is_finished": false,
 "goals_list": [],
 "source": "api-football",
 "minute_unread": false,
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 90,
  "remaining_means": "calls left against today's cap",
  "key_configured": true,
  "fallback": "espn"
 }
};

export const LIVE_SCORES = {
 "live": [
  {
   "match_id": "CAN_MAR",
   "home": "Canada",
   "away": "Morocco",
   "home_goals": 1,
   "away_goals": 0,
   "minutes_elapsed": 55.0,
   "status_short": "2H",
   "red_home": 0,
   "red_away": 0,
   "goals_list": [],
   "is_finished": false
  }
 ],
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 0,
  "remaining_means": "NO API-Football key is configured, so no call can be made today regardless of the cap. This is not a spent budget — the counter below never moved because nothing was ever asked. The keyless ESPN reader carries the live state",
  "key_configured": false,
  "fallback": "espn"
 },
 "generated_at": "2026-09-28T00:00:00+00:00"
};

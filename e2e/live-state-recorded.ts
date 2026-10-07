/* THE WC26 LIVE-STATE READ, RECORDED OFF THE ROUTE — not off a brief
 * (2026-10-07; same method as the audit-0928 recording).
 *
 * `GET /api/prediction/CAN_MAR/live-state` (backend api/main.py
 * `fetch_live_state`) called IN PROCESS through FastAPI's TestClient on
 * backend 78b59fe6, with ONE substitution: `live_state_for` — the provider
 * read — returned a state in the parsers' own output shape
 * (src/live_feed.py: `_espn_states` stamps `source: "espn"`,
 * `_parse_fixture` `"api-football"`), or None for a refusal. No
 * provider was asked: `requests` was refused outright for the run and
 * the proxy pointed at a dead port. Everything else — `minutes_elapsed`
 * after `sim_minutes`, `minute_unread`, `reason`, and the whole
 * `budget` block from `live_feed.budget_status()` — is the route's own
 * output. No production backend holds the keyless shape (it has a key),
 * which is why this is the route run locally rather than a prod read.
 *
 * KEYLESS: `API_FOOTBALL_KEY` unset; `budget.remaining` is 0 and
 *   `remaining_means` says it is no key, not a spent budget.
 * KEYED: a fake key set (never sent anywhere).
 * MINUTE_UNREAD: the provider state's `minutes_elapsed` was None. The
 *   route folds it (`or 0.0`) and `sim_minutes` launders it into the
 *   period floor — 45.0 under 2H, 0.0 under 1H — and says so with
 *   `minute_unread: true`.
 * REFUSED: `live_state_for` returned None; `reason` names which
 *   provider ran (keyless: the ESPN scoreboard; keyed: API-Football
 *   first, ESPN second).
 *
 * LIVE_SCORES*: the real `GET /api/live-scores` over a temp SQLite store
 * whose one snapshot row was written by the real
 * `live_state._upsert_snapshot` from the same state the poller would have
 * been handed — so an unread clock is `minutes_elapsed: null` there. */

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

export const LIVE_STATE_MINUTE_UNREAD = {
 "available": true,
 "match_id": "CAN_MAR",
 "current_home": 1,
 "current_away": 0,
 "minutes_elapsed": 45.0,
 "red_home": 0,
 "red_away": 0,
 "status_short": "2H",
 "is_live": true,
 "is_finished": false,
 "goals_list": [],
 "source": "espn",
 "minute_unread": true,
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 0,
  "remaining_means": "NO API-Football key is configured, so no call can be made today regardless of the cap. This is not a spent budget — the counter below never moved because nothing was ever asked. The keyless ESPN reader carries the live state",
  "key_configured": false,
  "fallback": "espn"
 }
};

export const LIVE_STATE_MINUTE_UNREAD_1H = {
 "available": true,
 "match_id": "CAN_MAR",
 "current_home": 1,
 "current_away": 0,
 "minutes_elapsed": 0.0,
 "red_home": 0,
 "red_away": 0,
 "status_short": "1H",
 "is_live": true,
 "is_finished": false,
 "goals_list": [],
 "source": "espn",
 "minute_unread": true,
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 0,
  "remaining_means": "NO API-Football key is configured, so no call can be made today regardless of the cap. This is not a spent budget — the counter below never moved because nothing was ever asked. The keyless ESPN reader carries the live state",
  "key_configured": false,
  "fallback": "espn"
 }
};

export const LIVE_STATE_REFUSED_KEYLESS = {
 "available": false,
 "match_id": "CAN_MAR",
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 0,
  "remaining_means": "NO API-Football key is configured, so no call can be made today regardless of the cap. This is not a spent budget — the counter below never moved because nothing was ever asked. The keyless ESPN reader carries the live state",
  "key_configured": false,
  "fallback": "espn"
 },
 "reason": "no live or finished fixture for this pair was found. No API-Football key is configured, so the KEYLESS ESPN scoreboard was read instead — this is an answer from a provider that ran, not a feature that is switched off. A read that FAILED backs off separately and is never cached as this answer (live_feed._fail_until)"
};

export const LIVE_STATE_REFUSED_KEYED = {
 "available": false,
 "match_id": "CAN_MAR",
 "budget": {
  "calls_today": 0,
  "daily_cap": 90,
  "remaining": 90,
  "remaining_means": "calls left against today's cap",
  "key_configured": true,
  "fallback": "espn"
 },
 "reason": "no live or finished fixture for this pair was found. API-Football was asked first and the keyless ESPN scoreboard second. A read that FAILED backs off separately and is never cached as this answer (live_feed._fail_until)"
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
 "generated_at": "2026-10-07T14:00:19.974728+00:00"
};

export const LIVE_SCORES_MINUTE_UNREAD = {
 "live": [
  {
   "match_id": "CAN_MAR",
   "home": "Canada",
   "away": "Morocco",
   "home_goals": 1,
   "away_goals": 0,
   "minutes_elapsed": null,
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
 "generated_at": "2026-10-07T14:00:19.978729+00:00"
};

export const LIVE_SCORES_MINUTE_UNREAD_1H = {
 "live": [
  {
   "match_id": "CAN_MAR",
   "home": "Canada",
   "away": "Morocco",
   "home_goals": 1,
   "away_goals": 0,
   "minutes_elapsed": null,
   "status_short": "1H",
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
 "generated_at": "2026-10-07T14:00:19.982041+00:00"
};

"""FastAPI app — the on-demand layer.

Endpoints
  GET  /api/health
  GET  /api/matches/upcoming?hours_ahead=48
  GET  /api/suggestions                      likelihood ranking board (tiered)
  GET  /api/prediction/{match_id}            cached (or fresh if stale/missing)
  GET  /api/prediction/{match_id}?force_refresh=true
  GET  /api/prediction/{match_id}/timeline   how one outcome evolved
  POST /api/prediction/{match_id}/refresh    force a fresh run (one match)
  POST /api/prediction/{match_id}/live       price markets vs a live state
  GET  /api/prediction/{match_id}/live-state  auto-fetch live state (feed)
  GET  /api/live-feed/budget                  API-Football calls remaining today
  POST /api/refresh-all                      force fresh runs (all trackable)
  GET  /api/settings                         current thresholds
  POST /api/settings                         update thresholds
"""
from __future__ import annotations

import time
from datetime import timedelta

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select

import config
from src.cache import latest_for_match, timeline_for_match
from src.db import (SessionLocal, get_setting, init_db,
                    set_setting, utcnow)
from src.live_feed import budget_status, live_state_for
from src.model_cache import refresh_model_cache
from src.schedule_data import (get_match, has_sourced_stats, is_trackable,
                               load_schedule, provisional_teams)
from src.suggester import SuggesterEngine
from src import spike_detector
from src.bracket import bracket_status

app = FastAPI(title="Kalshi WC26 Bet Suggester", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SuggesterEngine()


@app.on_event("startup")
def _startup() -> None:
    init_db()


# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": config.DEMO_MODE, "time": utcnow().isoformat()}


@app.get("/api/matches/upcoming")
def upcoming_matches(hours_ahead: int = Query(48, ge=1, le=720)):
    now = utcnow()
    horizon = now + timedelta(hours=hours_ahead)
    out = []
    for m in load_schedule():
        if not (now < m.kickoff <= horizon):
            continue
        cached = latest_for_match(m.match_id)
        # A QF slot whose feeder hasn't finished yet is a placeholder ("USA/BEL
        # winner"); the UI shows it as TBD and skips the prediction link. A
        # resolved team with no sourced TEAM_STATS runs on _DEFAULT — flagged
        # provisional so the model's humility is visible, never hidden.
        tbd = not m.fully_resolved
        prov = [t for t in (m.home, m.away)
                if (t == m.home and m.home_resolved or
                    t == m.away and m.away_resolved)
                and not has_sourced_stats(t)]
        out.append({
            "match_id": m.match_id,
            "home": m.home,
            "away": m.away,
            "group": m.group,
            "stage": m.stage,
            "venue": m.venue,
            "kickoff": m.kickoff.isoformat(),
            "seconds_to_kickoff": int((m.kickoff - now).total_seconds()),
            "has_prediction": cached is not None,
            "is_final": bool(cached and cached["is_final"]),
            "confidence": cached["confidence"] if cached else None,
            "tbd": tbd,
            "home_resolved": m.home_resolved,
            "away_resolved": m.away_resolved,
            "provisional_stats": prov,
        })
    out.sort(key=lambda x: x["seconds_to_kickoff"])
    return {"matches": out, "generated_at": now.isoformat()}


@app.get("/api/suggestions")
def suggestions(limit: int = Query(50, ge=1, le=200)):
    """Ranking board: every market on every trackable match, filtered by
    LIKELIHOOD only — edge is displayed, never a gate — sorted most-likely
    first with a deterministic tiebreak (likelihood ↓, edge ↓, kickoff ↑).

    Tier 1 keeps markets at/above SUGGEST_PRIMARY_FLOOR (49%). If nothing
    across ALL matches clears it, tier 2 falls back to SUGGEST_FALLBACK_FLOOR
    (40%). If even that is empty, the board is honestly empty: tier_used is
    null so the frontend can say so instead of pretending. No per-match cap —
    one match may contribute many rows. TAKE/alert logic stays edge-based
    elsewhere; this endpoint is purely the likelihood board.
    """
    now = utcnow()
    pool: list[dict] = []
    for m in load_schedule():
        if not is_trackable(m, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                            config.TRACK_HOURS_AFTER_KICKOFF):
            continue
        snap = latest_for_match(m.match_id)
        if not snap:
            continue
        for mkt in snap["markets"]:
            pool.append({
                "match_id": m.match_id,
                "home": m.home,
                "away": m.away,
                "market_id": mkt["market_id"],
                "market_title": mkt["market_title"],
                "outcome_key": mkt.get("outcome_key"),
                "kickoff": m.kickoff.isoformat(),
                "kalshi_odds": mkt["kalshi_odds"],
                "model_probability": mkt["model_probability"],
                "implied_probability": mkt["implied_probability"],
                "edge": mkt["edge"],
                "expected_value": mkt["expected_value"],
                "confidence": snap["confidence"],
                "is_final": snap["is_final"],
            })

    tier_used = None
    floor = config.SUGGEST_PRIMARY_FLOOR
    board = [s for s in pool if s["model_probability"] >= floor]
    if board:
        tier_used = int(round(floor * 100))
    else:
        floor = config.SUGGEST_FALLBACK_FLOOR
        board = [s for s in pool if s["model_probability"] >= floor]
        if board:
            tier_used = int(round(floor * 100))

    board.sort(key=lambda s: (-s["model_probability"], -s["edge"], s["kickoff"]))
    return {"suggestions": board[:limit], "tier_used": tier_used,
            "generated_at": now.isoformat()}


@app.get("/api/prediction/{match_id}")
def get_prediction(match_id: str, force_refresh: bool = False):
    match = get_match(match_id)
    if not match:
        raise HTTPException(404, f"Unknown match_id '{match_id}'")

    if not force_refresh:
        cached = latest_for_match(match_id)
        if cached and not cached["is_stale"]:
            return {"freshness": "cached", **cached}

    t0 = time.time()
    result = engine.run_for_match(match, source="on_demand")
    refresh_model_cache(result)   # keep the ripeness poller's edge current
    fresh = latest_for_match(match_id)
    return {
        "freshness": "fresh",
        "inference_time_ms": round((time.time() - t0) * 1000),
        "suggestions": result["suggestions"],
        **fresh,
    }


class LiveStateIn(BaseModel):
    current_home: int = 0
    current_away: int = 0
    minutes_elapsed: float = 0.0
    red_home: bool = False
    red_away: bool = False
    # user-set attack levers for qualitative reads (1.0 = no adjustment)
    attack_home_mult: float = 1.0
    attack_away_mult: float = 1.0


@app.post("/api/prediction/{match_id}/live")
def live_prediction(match_id: str, state: LiveStateIn):
    """Layer 3: price current markets against a manually-entered live state.
    Ephemeral (not persisted), edge-ungated, honestly framed — see
    SuggesterEngine.price_live()."""
    match = get_match(match_id)
    if not match:
        raise HTTPException(404, f"Unknown match_id '{match_id}'")
    if state.current_home < 0 or state.current_away < 0:
        raise HTTPException(422, "score cannot be negative")
    if not (0 <= state.minutes_elapsed <= 130):
        raise HTTPException(422, "minutes_elapsed out of range")
    for m in (state.attack_home_mult, state.attack_away_mult):
        if not (0.25 <= m <= 3.0):
            raise HTTPException(422, "attack lever out of range (0.25-3.0)")
    try:
        return engine.price_live(
            match, state.current_home, state.current_away,
            state.minutes_elapsed, state.red_home, state.red_away,
            state.attack_home_mult, state.attack_away_mult)
    except ValueError as exc:
        raise HTTPException(422, str(exc))


@app.get("/api/prediction/{match_id}/live-state")
def fetch_live_state(match_id: str):
    """Layer 2: auto-fetch the real current state (score/minute/red cards)
    for a match from API-Football, so the live panel can pre-fill instead of
    the user typing it. Returns {available: false, ...} (never an error) when
    the feed is unconfigured, over budget, or the match isn't live — the UI
    then falls back to manual entry."""
    match = get_match(match_id)
    if not match:
        raise HTTPException(404, f"Unknown match_id '{match_id}'")
    state = live_state_for(match.home, match.away)
    if state is None:
        return {"available": False, "match_id": match_id,
                "budget": budget_status(),
                "reason": ("feed not configured" if not config.API_FOOTBALL_KEY
                           else "no live match found or feed unavailable")}
    return {
        "available": True,
        "match_id": match_id,
        "current_home": state["home_goals"],
        "current_away": state["away_goals"],
        "minutes_elapsed": state["minutes_elapsed"],
        "red_home": state["red_home"],
        "red_away": state["red_away"],
        "status_short": state["status_short"],
        "is_live": state["is_live"],
        "is_finished": state["is_finished"],
        "goals_list": state.get("goals_list", []),
        "budget": budget_status(),
    }


@app.get("/api/live-scores")
def live_scores():
    """Live scoreboard for the landing page: current score/minute/scorers for
    every trackable match that's in progress. Uses ONE feed call (the shared
    /fixtures?live=all) regardless of how many matches are live, so a whole
    board refresh costs a single request. Returns [] gracefully when the feed
    is off or nothing is live."""
    now = utcnow()
    out = []
    for m in load_schedule():
        if not is_trackable(m, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                            config.TRACK_HOURS_AFTER_KICKOFF):
            continue
        state = live_state_for(m.home, m.away)  # cached; shared live pull
        if state is None or not state.get("is_live"):
            continue
        out.append({
            "match_id": m.match_id,
            "home": m.home,
            "away": m.away,
            "home_goals": state["home_goals"],
            "away_goals": state["away_goals"],
            "minutes_elapsed": state["minutes_elapsed"],
            "status_short": state["status_short"],
            "red_home": state["red_home"],
            "red_away": state["red_away"],
            "goals_list": state.get("goals_list", []),
        })
    return {"live": out, "budget": budget_status(),
            "generated_at": now.isoformat()}


@app.get("/api/bracket")
def bracket():
    """Current knockout bracket: which QF sides are known vs still placeholders,
    plus the list of resolved teams running on provisional (unsourced) stats.
    Read-only — the resolver job does the feed work on its own schedule."""
    status = bracket_status()
    status["provisional_teams"] = provisional_teams()
    status["generated_at"] = utcnow().isoformat()
    return status


@app.get("/api/live-feed/budget")
def live_feed_budget():
    """How many API-Football calls remain today (transparency + debugging)."""
    return budget_status()


@app.get("/api/spike-detector/state")
def spike_detector_state():
    """LOG-ONLY Layer 1: the scoreline the detector currently infers per
    trackable match, from Kalshi's score markets. Read-only, drives nothing —
    it's here so the detector can be eyeballed live while its thresholds are
    still being tuned."""
    now = utcnow()
    out = []
    for m in load_schedule():
        if not is_trackable(m, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                            config.TRACK_HOURS_AFTER_KICKOFF):
            continue
        leader = spike_detector.current_leader(m.match_id)
        out.append({
            "match_id": m.match_id,
            "inferred_score": f"{leader[0]}-{leader[1]}" if leader else None,
        })
    return {"matches": out, "note": "log-only; does not affect predictions"}


@app.get("/api/prediction/{match_id}/timeline")
def prediction_timeline(match_id: str, outcome_key: str = "home_win"):
    if not get_match(match_id):
        raise HTTPException(404, f"Unknown match_id '{match_id}'")
    points = timeline_for_match(match_id, outcome_key=outcome_key)
    return {"match_id": match_id, "outcome_key": outcome_key,
            "points": points, "count": len(points)}


@app.post("/api/prediction/{match_id}/refresh")
def refresh_prediction(match_id: str):
    match = get_match(match_id)
    if not match:
        raise HTTPException(404, f"Unknown match_id '{match_id}'")
    result = engine.run_for_match(match, source="on_demand")
    refresh_model_cache(result)   # keep the ripeness poller's edge current
    return {"status": "refreshed", "match_id": match_id,
            "suggestions": result["suggestions"],
            "generated_at": result["generated_at"]}


@app.post("/api/refresh-all")
def refresh_all():
    """Force a fresh simulation + live Kalshi prices for every trackable
    match. One failing match never blocks the rest: it lands in `failed`
    and the loop continues, so the response always says exactly which
    matches are current and which are showing last-known data."""
    now = utcnow()
    t0 = time.time()
    refreshed: list[str] = []
    failed: list[str] = []
    for m in load_schedule():
        if not is_trackable(m, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                            config.TRACK_HOURS_AFTER_KICKOFF):
            continue
        try:
            result = engine.run_for_match(m, source="on_demand")
            refresh_model_cache(result)
            refreshed.append(m.match_id)
        except Exception as exc:          # isolate, report, move on
            print(f"[refresh-all] {m.match_id} FAILED: {exc}")
            failed.append(m.match_id)
    return {"refreshed": refreshed, "failed": failed,
            "duration_ms": round((time.time() - t0) * 1000),
            "generated_at": utcnow().isoformat()}


# ---------------------------------------------------------------------------
# Watchlist + ripeness timing
# ---------------------------------------------------------------------------
from src.db import TimingAlert, WatchlistItem
from src.timing import compute_timing


class WatchIn(BaseModel):
    match_id: str
    market_id: str
    market_title: str | None = None


@app.get("/api/watchlist")
def get_watchlist():
    """Watched markets, each with its live ripeness score."""
    with SessionLocal() as session:
        items = session.execute(select(WatchlistItem)).scalars().all()
    out = []
    for item in items:
        match = get_match(item.match_id)
        timing = (compute_timing(item.market_id, match.kickoff)
                  if match else {"score": 0, "status": "match_over",
                                 "readings": 0, "components": {}, "reasons": []})
        out.append({
            "match_id": item.match_id,
            "market_id": item.market_id,
            "market_title": item.market_title,
            "watched_since": item.created_at.isoformat(),
            "timing": timing,
        })
    out.sort(key=lambda x: x["timing"]["score"], reverse=True)
    return {"watchlist": out, "alert_threshold": config.RIPENESS_ALERT_THRESHOLD}


@app.post("/api/watchlist")
def add_watch(body: WatchIn):
    if not get_match(body.match_id):
        raise HTTPException(404, f"Unknown match_id '{body.match_id}'")
    with SessionLocal() as session:
        exists = session.execute(
            select(WatchlistItem).where(WatchlistItem.market_id == body.market_id)
        ).scalar_one_or_none()
        if exists:
            return {"status": "already_watching", "market_id": body.market_id}
        session.add(WatchlistItem(match_id=body.match_id, market_id=body.market_id,
                                  market_title=body.market_title))
        session.commit()
    return {"status": "watching", "market_id": body.market_id,
            "note": f"You'll be alerted when the ripeness score crosses "
                    f"{config.RIPENESS_ALERT_THRESHOLD:.0f} with positive edge."}


@app.delete("/api/watchlist/{market_id}")
def remove_watch(market_id: str):
    with SessionLocal() as session:
        item = session.execute(
            select(WatchlistItem).where(WatchlistItem.market_id == market_id)
        ).scalar_one_or_none()
        if not item:
            raise HTTPException(404, "Not on watchlist")
        session.delete(item)
        session.commit()
    return {"status": "removed", "market_id": market_id}


@app.get("/api/timing/{match_id}/{market_id}")
def get_timing(match_id: str, market_id: str):
    """Full ripeness breakdown for any market (watched or not)."""
    match = get_match(match_id)
    if not match:
        raise HTTPException(404, f"Unknown match_id '{match_id}'")
    return compute_timing(market_id, match.kickoff)


@app.get("/api/alerts/recent")
def recent_alerts(limit: int = Query(20, ge=1, le=100)):
    """Notification feed: every ripeness alert that has fired."""
    with SessionLocal() as session:
        rows = session.execute(
            select(TimingAlert).order_by(TimingAlert.created_at.desc()).limit(limit)
        ).scalars().all()
    return {"alerts": [
        {
            "match_id": r.match_id,
            "market_id": r.market_id,
            "market_title": r.market_title,
            "score": r.score,
            "decimal_odds": r.decimal_odds,
            "edge": r.edge,
            "reasons": r.reasons,
            "fired_at": r.created_at.isoformat(),
        } for r in rows
    ]}


# ---------------------------------------------------------------------------
class SettingsIn(BaseModel):
    min_edge: float | None = None
    min_confidence: float | None = None
    min_volume: float | None = None


@app.get("/api/settings")
def get_settings():
    with SessionLocal() as session:
        return {
            "min_edge": get_setting(session, "min_edge", config.MIN_EDGE),
            "min_confidence": get_setting(session, "min_confidence", config.MIN_CONFIDENCE),
            "min_volume": get_setting(session, "min_volume", config.MIN_VOLUME_24H),
        }


@app.post("/api/settings")
def update_settings(body: SettingsIn):
    with SessionLocal() as session:
        for key, value in body.model_dump(exclude_none=True).items():
            set_setting(session, key, value)
    return {"status": "saved", **get_settings()}

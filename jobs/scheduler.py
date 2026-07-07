"""Background jobs.

  poll_odds          : every ODDS_POLL_SECONDS (default 30s), record an
                       OddsReading for every open market on matches within
                       the prediction window — this is the learning corpus —
                       then score every watched market and fire a ripeness
                       alert the moment one crosses the threshold.
  hourly_predictions : every hour, re-simulate every match kicking off within
                       the configured window and refresh suggestions.
  final_lock_check   : every minute, lock a FINAL decision exactly once when a
                       match is <= 10 minutes from kickoff.
"""
from __future__ import annotations

from datetime import timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import select

import config
from src.alerts import alert_final_lock, alert_new_take, alert_ripe, send_discord
from src.bracket import resolve_bracket
from src.db import SessionLocal, WatchlistItem, utcnow
from src.kalshi_client import KalshiClient
from src.model_cache import get_model_prob, refresh_model_cache
from src.schedule_data import is_trackable, load_schedule
from src import spike_detector
from src.suggester import SuggesterEngine
from src.timing import compute_timing, record_reading, save_alert, should_alert

engine = SuggesterEngine()
kalshi = KalshiClient()
_finalized: set[str] = set()          # match_ids already locked this process


def hourly_predictions() -> None:
    now = utcnow()
    for match in load_schedule():
        if not is_trackable(match, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                            config.TRACK_HOURS_AFTER_KICKOFF):
            continue
        try:
            result = engine.run_for_match(match, source="scheduled")
        except Exception as exc:  # one bad match must never kill the batch
            print(f"[hourly] {match.match_id} FAILED: {exc}")
            continue
        refresh_model_cache(result)
        takes = [s for s in result["suggestions"] if s["recommendation"] == "TAKE"]
        print(f"[hourly] {match.match_id}: {len(takes)} TAKE / "
              f"{len(result['suggestions'])} markets")
        for s in takes[:3]:  # don't spam Discord
            alert_new_take(f"{match.home} vs {match.away}",
                           s["market_title"], s["edge"], s["expected_value"])


def poll_odds() -> None:
    """The always-on heartbeat: record every market's price, then check
    whether any watched bet just became ripe."""
    now = utcnow()
    matches = [m for m in load_schedule()
               if is_trackable(m, now, config.HOURLY_PREDICTION_WINDOW_HOURS,
                               config.TRACK_HOURS_AFTER_KICKOFF)]
    if not matches:
        return

    with SessionLocal() as session:
        watched = {w.market_id: w for w in
                   session.execute(select(WatchlistItem)).scalars().all()}

    for match in matches:
        try:
            mkts = kalshi.get_markets_for_match(match)
            # Layer 1 (LOG-ONLY): infer goals from the scoreline
            # distribution. Wrapped separately so a detector hiccup can
            # never disturb polling, and it touches nothing downstream.
            try:
                spike_detector.inspect(match.match_id, mkts)
            except Exception as exc:
                print(f"[spike] {match.match_id} detector error: {exc}")

            for mkt in mkts:
                record_reading(match.match_id, mkt,
                               get_model_prob(mkt["market_id"]))

                item = watched.get(mkt["market_id"])
                if not item:
                    continue
                timing = compute_timing(mkt["market_id"], match.kickoff)
                if should_alert(mkt["market_id"], timing):
                    save_alert(match.match_id, mkt["market_id"], mkt["title"],
                               timing)
                    alert_ripe(f"{match.home} vs {match.away}", mkt["title"],
                               timing)
                    print(f"[RIPE {timing['score']:.0f}] {mkt['title']}")
        except Exception as exc:  # keep polling the other matches
            print(f"[poll] {match.match_id} FAILED: {exc}")
            continue


def final_lock_check() -> None:
    now = utcnow()
    lock_delta = timedelta(minutes=config.FINAL_LOCK_MINUTES_BEFORE_KICKOFF)
    for match in load_schedule():
        if match.match_id in _finalized:
            continue
        time_left = match.kickoff - now
        if timedelta(0) < time_left <= lock_delta:
            try:
                result = engine.run_for_match(match, source="final_lock",
                                              is_final=True)
            except Exception as exc:  # retry on the next minute tick
                print(f"[final_lock] {match.match_id} FAILED: {exc}")
                continue
            refresh_model_cache(result)
            _finalized.add(match.match_id)
            takes = [s for s in result["suggestions"] if s["recommendation"] == "TAKE"]
            best = takes[0] if takes else None
            alert_final_lock(f"{match.home} vs {match.away}", best)
            print(f"[FINAL LOCK] {match.match_id} locked at T-{time_left}")


def resolve_bracket_job() -> None:
    """Fill QF placeholder slots as R16 results land (fixtures only; team
    stats stay hand-sourced). Cheap and idempotent: does nothing once the
    bracket is fully known, so this can run often without burning feed budget.
    Announces each newly-decided matchup to Discord once."""
    try:
        changed = resolve_bracket()
    except Exception as exc:  # never let bracket work disturb the scheduler
        print(f"[bracket] resolve FAILED: {exc}")
        return
    for c in changed:
        send_discord(
            f"🗓️ Quarter-final set: **{c['team']}** advances into "
            f"{c['qf']} ({c['side']}).")


def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(hourly_predictions, "cron", minute=0, id="hourly")
    scheduler.add_job(final_lock_check, "cron", second=0, id="final_lock")
    scheduler.add_job(poll_odds, "interval",
                      seconds=config.ODDS_POLL_SECONDS, id="odds_poll")
    # Bracket resolution: low frequency (the bracket changes at most a handful
    # of times all tournament) and self-skipping once fully known, so it's
    # nearly free. Interval, not cron, so it also runs shortly after boot.
    scheduler.add_job(resolve_bracket_job, "interval",
                      minutes=config.BRACKET_RESOLVE_MINUTES, id="bracket")
    scheduler.start()
    # Prime the cache immediately on boot so the dashboard isn't empty
    # and the poller has model probabilities to compute edge with.
    scheduler.add_job(hourly_predictions, "date", id="prime_predictions")
    scheduler.add_job(poll_odds, "date", id="prime_poll")
    scheduler.add_job(resolve_bracket_job, "date", id="prime_bracket")
    return scheduler

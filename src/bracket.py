"""Bracket auto-resolution — fill QF placeholder slots as R16 results land.

The quarter-final slots in `schedule_data` are seeded with placeholder team
names ("USA/BEL winner") and feeder match_ids. This module reads the finished
Round-of-16 results from the live feed and swaps each placeholder for the real
winner, the moment that feeder match is decided.

Design mirrors the rest of the live layer:
  - budget-disciplined: reuses live_feed's ONE shared /fixtures?live=all pull
    when possible, and otherwise makes at most one extra /fixtures?round call;
  - graceful: no key / over budget / feed error / match not final -> it simply
    does nothing and leaves the placeholders in place;
  - idempotent: re-running after everything's resolved is a no-op (no calls,
    no writes), so it's safe to schedule frequently and cheaply.

It resolves FIXTURES only. Team STATS stay hand-sourced in schedule_data — a
freshly-resolved team with no TEAM_STATS entry runs on _DEFAULT and is flagged
provisional by `schedule_data.provisional_teams()`. This module never invents
model inputs.
"""
from __future__ import annotations

from datetime import timezone

import config
from src import live_feed
from src.schedule_data import Match, load_schedule, resolve_side


def _feeder_slots() -> list[tuple[str, str, str]]:
    """Every still-unresolved (feeder_match_id, qf_match_id, side) triple.

    Empty once the bracket is fully known — the caller uses that to skip all
    feed work, so a resolved bracket costs zero API calls.
    """
    out: list[tuple[str, str, str]] = []
    for m in load_schedule():
        if not m.home_resolved:
            for f in m.home_feeders:
                out.append((f, m.match_id, "home"))
        if not m.away_resolved:
            for f in m.away_feeders:
                out.append((f, m.match_id, "away"))
    return out


def _winner_of(feeder: Match, state: dict) -> str | None:
    """Given a FINISHED feeder's live-feed state (already oriented to our
    home/away order), return the winning team name, or None if we can't tell
    (not finished, or a draw with no shootout info — knockouts always resolve,
    so a clean draw means the feed hasn't posted the ET/pens winner yet)."""
    if not state.get("is_finished"):
        return None
    hg = state.get("home_goals") or 0
    ag = state.get("away_goals") or 0
    if hg > ag:
        return feeder.home
    if ag > hg:
        return feeder.away
    # Level after the feed's reported score. For AET/PEN the aggregate goals
    # usually already reflect ET; a true tie here means penalties decided it
    # and we can't read the shootout from the goals field alone -> defer to
    # the next run (the feed's status/score settles shortly after).
    return None


def resolve_bracket() -> list[dict]:
    """Resolve every QF placeholder whose feeder has finished. Returns a list
    of {qf, side, team} dicts for what actually changed this run (so the caller
    can log/alert exactly once per resolution). Safe and cheap to call often.
    """
    slots = _feeder_slots()
    if not slots:
        return []  # bracket fully known — no feed work at all

    if not config.API_FOOTBALL_KEY:
        return []  # no feed configured; placeholders stay, UI shows "TBD"

    changed: list[dict] = []
    schedule = {m.match_id: m for m in load_schedule()}

    # De-dupe feeder lookups: several slots can't share a feeder, but a feeder
    # appears once per unresolved side it feeds — look each up at most once.
    seen_state: dict[str, dict | None] = {}
    for feeder_id, qf_id, side in slots:
        feeder = schedule.get(feeder_id)
        if feeder is None:
            continue
        if feeder_id not in seen_state:
            # live_state_for pulls the shared cached /fixtures?live=all; a
            # just-finished match still appears there briefly, and the feed's
            # own cache means this is usually free.
            seen_state[feeder_id] = live_feed.live_state_for(
                feeder.home, feeder.away)
        state = seen_state[feeder_id]
        if not state:
            continue
        winner = _winner_of(feeder, state)
        if not winner:
            continue
        if resolve_side(qf_id, side, winner):
            changed.append({"qf": qf_id, "side": side, "team": winner,
                            "feeder": feeder_id})
            print(f"[bracket] {qf_id} {side} = {winner} "
                  f"(won {feeder_id})")

    return changed


def bracket_status() -> dict:
    """Snapshot of the bracket for the API/UI: which QF sides are known and
    which are still placeholders. Read-only, no feed calls."""
    qfs = []
    for m in load_schedule():
        if m.group != "QF":
            continue
        qfs.append({
            "match_id": m.match_id,
            "home": m.home, "home_resolved": m.home_resolved,
            "away": m.away, "away_resolved": m.away_resolved,
            "fully_resolved": m.fully_resolved,
            "kickoff": m.kickoff.astimezone(timezone.utc).isoformat(),
            "venue": m.venue,
        })
    return {"quarterfinals": qfs}

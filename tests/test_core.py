"""Core sanity tests: simulator math, suggester logic, API endpoints.

Run:  pytest tests/ -v
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

from src.db import init_db
from src.models.simulator import MatchSimulator
from src.schedule_data import get_team_stats, load_schedule
from src.suggester import SuggesterEngine


@pytest.fixture(scope="session", autouse=True)
def _db():
    init_db()


# ---------------------------------------------------------------------------
class TestSimulator:
    def setup_method(self):
        self.sim = MatchSimulator(n_simulations=20_000, seed=42)
        self.result = self.sim.simulate(get_team_stats("Brazil"), get_team_stats("Serbia"))

    def test_probabilities_sum_to_one(self):
        o = self.result["outcomes"]
        # outputs are rounded to 4dp, so allow rounding slack
        assert abs(o["home_win"] + o["draw"] + o["away_win"] - 1.0) < 1e-3

    def test_favorite_is_favored(self):
        assert self.result["outcomes"]["home_win"] > self.result["outcomes"]["away_win"]

    def test_probabilities_in_bounds(self):
        for p in {**self.result["outcomes"], **self.result["props"]}.values():
            assert 0.0 <= p <= 1.0

    def test_over_under_complementary(self):
        p = self.result["props"]
        assert abs(p["over_2_5"] + p["under_2_5"] - 1.0) < 1e-6

    def test_confidence_in_bounds(self):
        assert 0.0 < self.result["confidence"] <= 1.0

    def test_scoreline_lookup(self):
        p = self.sim.prob_for_outcome_key(self.result, "home_2_0")
        assert p is not None and 0.0 <= p <= 1.0

    def test_even_match_is_uncertain(self):
        even = self.sim.simulate(get_team_stats("Portugal"), get_team_stats("Spain"))
        lopsided = self.sim.simulate(get_team_stats("France"), get_team_stats("Egypt"))
        assert even["confidence"] < lopsided["confidence"]


# ---------------------------------------------------------------------------
class TestSuggester:
    def test_run_for_match_produces_suggestions(self):
        match = load_schedule()[0]
        result = SuggesterEngine().run_for_match(match, source="on_demand")
        assert len(result["suggestions"]) >= 5
        for s in result["suggestions"]:
            assert s["recommendation"] in ("TAKE", "SKIP")
            assert abs(s["edge"] - (s["model_probability"] - s["implied_probability"])) < 1e-6

    def test_suggestions_sorted_by_ev(self):
        match = load_schedule()[0]
        evs = [s["expected_value"]
               for s in SuggesterEngine().run_for_match(match)["suggestions"]]
        assert evs == sorted(evs, reverse=True)


# ---------------------------------------------------------------------------
class TestAPI:
    def setup_method(self):
        from api.main import app
        self.client = TestClient(app)

    def test_health(self):
        assert self.client.get("/api/health").json()["status"] == "ok"

    def test_upcoming(self):
        data = self.client.get("/api/matches/upcoming?hours_ahead=72").json()
        assert len(data["matches"]) >= 1

    def test_on_demand_prediction(self):
        match_id = load_schedule()[0].match_id
        data = self.client.get(f"/api/prediction/{match_id}?force_refresh=true").json()
        assert data["freshness"] == "fresh"
        assert data["age_seconds"] == 0
        assert len(data["markets"]) >= 5

    def test_cache_hit_after_fresh(self):
        match_id = load_schedule()[0].match_id
        self.client.get(f"/api/prediction/{match_id}?force_refresh=true")
        data = self.client.get(f"/api/prediction/{match_id}").json()
        assert data["freshness"] == "cached"

    def test_timeline(self):
        match_id = load_schedule()[0].match_id
        self.client.get(f"/api/prediction/{match_id}?force_refresh=true")
        data = self.client.get(f"/api/prediction/{match_id}/timeline").json()
        assert data["count"] >= 1

    def test_unknown_match_404(self):
        assert self.client.get("/api/prediction/NOT_A_MATCH").status_code == 404

    def test_settings_roundtrip(self):
        resp = self.client.post("/api/settings", json={"min_edge": 0.07}).json()
        assert resp["min_edge"] == 0.07
        self.client.post("/api/settings", json={"min_edge": 0.05})


class TestDedupeMarkets:
    """Half-1 build: KXWCGAME vs KXWCMOV-REG duplicates collapse to one
    buyer-favorable contract per outcome_key."""

    def _mkt(self, mid, key, yes, vol):
        return {"market_id": mid, "outcome_key": key, "yes_price": yes,
                "volume_24h": vol, "decimal_odds": round(1 / yes, 2),
                "title": mid}

    def test_keeps_cheapest_yes_price(self):
        from src.suggester import SuggesterEngine
        mkts = [self._mkt("KXWCGAME-BRA", "home_win", 0.55, 9000),
                self._mkt("KXWCMOV-BRAREG", "home_win", 0.53, 2000)]
        out = SuggesterEngine._dedupe_markets(mkts)
        assert len(out) == 1
        assert out[0]["market_id"] == "KXWCMOV-BRAREG"  # cheaper yes wins

    def test_tie_breaks_to_higher_volume(self):
        from src.suggester import SuggesterEngine
        mkts = [self._mkt("KXWCGAME-X-NOR", "away_win", 0.30, 500),
                self._mkt("KXWCMOV-X-NORREG", "away_win", 0.30, 8000)]
        out = SuggesterEngine._dedupe_markets(mkts)
        assert len(out) == 1 and out[0]["market_id"] == "KXWCMOV-X-NORREG"

    def test_distinct_keys_untouched(self):
        from src.suggester import SuggesterEngine
        mkts = [self._mkt("A", "home_win", 0.5, 1),
                self._mkt("B", "over_2_5", 0.4, 1),
                self._mkt("C", None, 0.3, 1)]  # unclassified passes through
        assert len(SuggesterEngine._dedupe_markets(mkts)) == 3


class TestTrackingWindow:
    """Half-1 build: matches stay trackable through kickoff + N hours."""

    def test_is_trackable_spans_kickoff(self):
        from datetime import datetime, timedelta, timezone
        from src.schedule_data import is_trackable, load_schedule
        m = load_schedule()[0]
        before = m.kickoff - timedelta(hours=1)
        during = m.kickoff + timedelta(hours=1)
        after = m.kickoff + timedelta(hours=5)
        assert is_trackable(m, before, 72, 4)
        assert is_trackable(m, during, 72, 4)      # in-play: still tracked
        assert not is_trackable(m, after, 72, 4)   # 4h past kickoff: done
        far = m.kickoff - timedelta(hours=100)
        assert not is_trackable(m, far, 72, 4)     # outside look-ahead


class TestOutcomeKeyPlumbing:
    """Half-1 build: outcome_key persists to Prediction rows and the
    timeline filters on it (the live-mode timeline fix)."""

    def setup_method(self):
        import config
        config.DEMO_MODE = True
        from src.db import init_db
        init_db()

    def test_prediction_rows_carry_outcome_key(self):
        from sqlalchemy import select
        from src.db import Prediction, SessionLocal
        from src.schedule_data import load_schedule
        from src.suggester import SuggesterEngine
        eng = SuggesterEngine()
        m = load_schedule()[0]
        eng.run_for_match(m, source="test")
        with SessionLocal() as s:
            keys = [r.outcome_key for r in s.execute(
                select(Prediction).where(Prediction.match_id == m.match_id)
            ).scalars().all()]
        assert keys and any(k == "home_win" for k in keys)

    def test_timeline_filters_by_outcome_key(self):
        from src.cache import timeline_for_match
        from src.schedule_data import load_schedule
        from src.suggester import SuggesterEngine
        eng = SuggesterEngine()
        m = load_schedule()[0]
        eng.run_for_match(m, source="test")
        pts = timeline_for_match(m.match_id, outcome_key="home_win")
        assert len(pts) >= 1
        assert timeline_for_match(m.match_id, outcome_key="no_such_key") == []


class TestLikelihoodBoard:
    """Half-2 build: /api/suggestions is a likelihood-first ranking board
    with tiered floors, no edge gate, no per-match cap."""

    def setup_method(self):
        import config
        from fastapi.testclient import TestClient
        from src.db import init_db
        from api.main import app
        config.DEMO_MODE = True
        init_db()
        self.config = config
        self.client = TestClient(app)
        self._floors = (config.SUGGEST_PRIMARY_FLOOR,
                        config.SUGGEST_FALLBACK_FLOOR)
        self._window = (config.HOURLY_PREDICTION_WINDOW_HOURS,
                        config.TRACK_HOURS_AFTER_KICKOFF)
        # make every schedule match trackable regardless of container clock
        config.HOURLY_PREDICTION_WINDOW_HOURS = 100000
        config.TRACK_HOURS_AFTER_KICKOFF = 100000
        self.client.post("/api/refresh-all")  # populate predictions

    def teardown_method(self):
        (self.config.SUGGEST_PRIMARY_FLOOR,
         self.config.SUGGEST_FALLBACK_FLOOR) = self._floors
        (self.config.HOURLY_PREDICTION_WINDOW_HOURS,
         self.config.TRACK_HOURS_AFTER_KICKOFF) = self._window

    def test_refresh_all_shape(self):
        data = self.client.post("/api/refresh-all").json()
        assert data["failed"] == []
        # Every FULLY-RESOLVED match refreshes; placeholder QF slots (a side
        # still "X/Y winner") are not trackable, so they're excluded. With the
        # window forced open above, that's the 6 R16 fixtures + any QF whose
        # teams are already known (MAR_FRA), and never an unresolved slot.
        from src.schedule_data import load_schedule
        expected = [m.match_id for m in load_schedule() if m.fully_resolved]
        assert sorted(data["refreshed"]) == sorted(expected)
        assert all(m.match_id in data["refreshed"] or not m.fully_resolved
                   for m in load_schedule())
        assert isinstance(data["duration_ms"], int)
        assert "generated_at" in data

    def test_tier1_no_cap_sorted(self):
        self.config.SUGGEST_PRIMARY_FLOOR = 0.01    # everything qualifies
        data = self.client.get("/api/suggestions?limit=200").json()
        assert data["tier_used"] == 1
        s = data["suggestions"]
        assert len(s) > self.config.MAX_SUGGESTIONS_PER_MATCH  # cap is gone
        probs = [x["model_probability"] for x in s]
        assert probs == sorted(probs, reverse=True)  # likelihood desc
        assert any(x["edge"] < 0 for x in s)         # negative edge NOT gated
        assert {"outcome_key", "expected_value", "home",
                "away"} <= set(s[0].keys())

    def test_fallback_tier_fires(self):
        self.config.SUGGEST_PRIMARY_FLOOR = 0.999   # tier 1 empty
        self.config.SUGGEST_FALLBACK_FLOOR = 0.01
        data = self.client.get("/api/suggestions").json()
        assert data["tier_used"] == 1               # int(round(0.01*100))
        assert len(data["suggestions"]) > 0

    def test_honest_empty_state(self):
        self.config.SUGGEST_PRIMARY_FLOOR = 0.999
        self.config.SUGGEST_FALLBACK_FLOOR = 0.999
        data = self.client.get("/api/suggestions").json()
        assert data["suggestions"] == []
        assert data["tier_used"] is None


class TestFirstGoalHotfix:
    """Regression: KXWCTEAMFIRSTGOAL player props must never classify as
    win markets, scorer language must never map via fallback, and dedup
    must never let an unverified family replace a real moneyline."""

    def _match(self):
        from src.schedule_data import load_schedule
        return [m for m in load_schedule() if m.match_id == "MEX_ENG"][0]

    def test_teamfirstgoal_family_skipped(self):
        from src.kalshi_client import _classify_outcome
        mkt = {"ticker": "KXWCTEAMFIRSTGOAL-26JUL05MEXENG-MEX-ELIRA6",
               "title": "Mexico First Goalscorer",
               "yes_sub_title": "E. Lira"}
        assert _classify_outcome(
            self._match(), mkt,
            "KXWCTEAMFIRSTGOAL-26JUL05MEXENG") is None

    def test_scorer_language_blocked_in_fallback(self):
        from src.kalshi_client import _classify_outcome
        # Unknown family + prop language: guard must return None even
        # though exactly one team is named.
        mkt = {"ticker": "KXWCNEWPROP-26JUL05MEXENG-MEX",
               "title": "Mexico to score the first goal"}
        assert _classify_outcome(
            self._match(), mkt, "KXWCNEWPROP-26JUL05MEXENG") is None

    def test_dedup_never_collapses_unverified_families(self):
        from src.suggester import SuggesterEngine
        real = {"market_id": "KXWCGAME-26JUL05MEXENG-MEX",
                "outcome_key": "home_win", "yes_price": 0.34,
                "volume_24h": 9000, "decimal_odds": 2.94,
                "title": "Mexico to win (90 min)"}
        prop = {"market_id": "KXWCXX-26JUL05MEXENG-MEX-PLAYER1",
                "outcome_key": "home_win", "yes_price": 0.01,
                "volume_24h": 40, "decimal_odds": 100.0,
                "title": "mislabeled prop"}
        out = SuggesterEngine._dedupe_markets([real, prop])
        ids = {m["market_id"] for m in out}
        assert len(out) == 2 and real["market_id"] in ids  # moneyline survives

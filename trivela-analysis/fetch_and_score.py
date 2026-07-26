#!/usr/bin/env python3
"""Pull the deployed Trivela API, snapshot it, and score bet candidates.

Reads only. Writes only under this directory. Never touches model code and
never calls anything but the deployed Railway API (see CLAUDE.md rule 2).

Order of operations is deliberate: every raw response is written to
data/snapshots/<run-id>/ and made read-only BEFORE it is parsed, so a run can
always be re-derived from bytes on disk even if the scorer later crashes.

Usage:
    python3 fetch_and_score.py                  # both boards
    python3 fetch_and_score.py --board mls
    python3 fetch_and_score.py --probe          # reachability/schema check
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import platform
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SNAPSHOT_DIR = ROOT / "data" / "snapshots"
RUNS_DIR = ROOT / "runs"

DEFAULT_BASE = "https://wc26-bet-suggester-production.up.railway.app"
API_BASE = os.environ.get("TRIVELA_API_BASE", DEFAULT_BASE).rstrip("/")

USER_AGENT = "trivela-analysis/1.0 (read-only analysis session)"
TIMEOUT = 30
RETRIES = 3

# Kalshi's entry fee per contract, as the deployed frontend applies it.
KALSHI_FEE = lambda p: 0.07 * p * (1.0 - p)  # noqa: E731

# Endpoints tried, in order, to establish what version of the API answered.
VERSION_PATHS = ["/api/version", "/api/health", "/health", "/version", "/"]

# Sanity bands. Breaching one is REPORTED, never corrected (CLAUDE.md rule 4).
MAX_PLAUSIBLE_EDGE = 0.25
MAX_MODEL_STALENESS_S = 6 * 3600
PROB_SUM_TOLERANCE = 0.01
IMPLIED_XCHECK_TOLERANCE = 0.005


# --------------------------------------------------------------------------
# plumbing
# --------------------------------------------------------------------------

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(value) -> datetime | None:
    if not value:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000 if value > 1e11 else value,
                                      tz=timezone.utc)
    text = str(value).strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def input_fingerprint(model_run: dict) -> str:
    """Hash of everything the model actually consumed for one fixture.

    The deployed model is deterministic: same inputs and seed produce the same
    probabilities. `captured_at` therefore advances on every scheduled re-run
    whether or not anything was learned, and clock age is a bad proxy for how
    current a model is. This fingerprint is what changes when the model has
    genuinely seen something new.
    """
    payload = json.dumps({
        "xg": model_run.get("xg"),
        "basis": model_run.get("basis"),
        "input_quality": model_run.get("input_quality"),
        "seed": model_run.get("seed"),
        "n_simulations": model_run.get("n_simulations"),
    }, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def output_fingerprint(model_run: dict) -> str:
    """Hash of the probabilities a bet would actually be priced off.

    Inputs can jitter in the fourth decimal without moving anything decision-
    relevant, so the input hash alone under-reports. This is the stricter test
    of whether a re-capture changed the numbers you would act on.
    """
    payload = json.dumps({
        "outcomes": {k: round(v, 4) for k, v in
                     sorted((model_run.get("outcomes") or {}).items())
                     if isinstance(v, (int, float))},
        "props": {k: round(v, 4) for k, v in
                  sorted((model_run.get("props") or {}).items())
                  if isinstance(v, (int, float))},
    }, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def prior_model_inputs() -> tuple[str | None, dict]:
    """Fingerprints recorded by the most recent completed run, if any."""
    if not RUNS_DIR.exists():
        return None, {}
    done = sorted(p for p in RUNS_DIR.iterdir()
                  if p.is_dir() and (p / "meta.json").exists())
    if not done:
        return None, {}
    try:
        meta = json.loads((done[-1] / "meta.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None, {}
    return done[-1].name, (meta.get("model_inputs") or {})


class Fetcher:
    """GETs the deployed API and snapshots every response before parsing."""

    def __init__(self, run_dir: Path, verbose: bool = True):
        self.dir = run_dir
        self.dir.mkdir(parents=True, exist_ok=True)
        self.records: list[dict] = []
        self.verbose = verbose
        self.log_path = self.dir / "fetch.log"

    def _log(self, line: str) -> None:
        with self.log_path.open("a", encoding="utf-8") as fh:
            fh.write(f"{iso(utc_now())} {line}\n")
        if self.verbose:
            print(f"  {line}", file=sys.stderr)

    def get(self, path: str, name: str, optional: bool = False):
        """Fetch, snapshot verbatim, then parse. Returns (payload, record)."""
        url = f"{API_BASE}{path}"
        last_err = None
        for attempt in range(1, RETRIES + 1):
            started = time.monotonic()
            try:
                req = urllib.request.Request(
                    url, headers={"User-Agent": USER_AGENT,
                                  "Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                    body = resp.read()
                    status = resp.status
                    headers = dict(resp.headers)
                elapsed_ms = round((time.monotonic() - started) * 1000)
                break
            except urllib.error.HTTPError as exc:
                body, status, headers = exc.read(), exc.code, dict(exc.headers)
                elapsed_ms = round((time.monotonic() - started) * 1000)
                last_err = f"HTTP {exc.code}"
                if 400 <= exc.code < 500:
                    break          # client errors are not worth retrying
            except Exception as exc:                      # noqa: BLE001
                last_err = f"{type(exc).__name__}: {exc}"
                body, status, headers, elapsed_ms = b"", None, {}, None
                if attempt < RETRIES:
                    time.sleep(2 ** attempt)
                    continue
        fetched_at = utc_now()

        # snapshot FIRST, parse second — immutably (CLAUDE.md rule 3)
        snap = self.dir / f"{name}.json"
        snap.write_bytes(body)
        try:
            os.chmod(snap, 0o444)
        except OSError:
            pass

        record = {
            "name": name,
            "url": url,
            "path": str(snap.relative_to(ROOT)),
            "http_status": status,
            "bytes": len(body),
            "sha256": sha256_file(snap) if body else None,
            "fetched_at_utc": iso(fetched_at),
            "elapsed_ms": elapsed_ms,
            "server_date_header": headers.get("Date"),
            "error": None,
            "optional": optional,
        }

        payload = None
        if status == 200 and body:
            try:
                payload = json.loads(body)
            except json.JSONDecodeError as exc:
                record["error"] = f"invalid JSON: {exc}"
        else:
            record["error"] = last_err or f"HTTP {status}"

        self.records.append(record)
        self._log(f"GET {path} -> {status or 'ERR'} "
                  f"{record['bytes']}B {record['elapsed_ms'] or '-'}ms"
                  + (f" [{record['error']}]" if record["error"] else ""))
        return payload, record


# --------------------------------------------------------------------------
# scoring primitives
# --------------------------------------------------------------------------

def kelly(model_p: float, cost: float) -> float:
    """Full-Kelly stake for a $1 binary contract bought at `cost`.

    Win -> receive 1 (profit 1-cost); lose -> forfeit cost.
        f* = (p - cost) / (1 - cost)
    """
    if not (0.0 < cost < 1.0):
        return 0.0
    f = (model_p - cost) / (1.0 - cost)
    return max(0.0, min(1.0, f))


def fnum(value):
    """Float or None — never raises, never substitutes a default."""
    if value is None or value == "":
        return None
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    return out if out == out else None       # reject NaN


class Run:
    """Accumulates rows, skips and anomalies for one scoring run."""

    def __init__(self, run_id: str):
        self.run_id = run_id
        self.rows: list[dict] = []
        self.skipped: list[dict] = []
        self.anomalies: list[dict] = []
        self.boards: dict[str, dict] = {}
        # event_id -> {fingerprint, captured_at, run_type}; compared against the
        # previous run so a re-capture that learned nothing is visible
        self.model_inputs: dict[str, dict] = {}

    def skip(self, board: str, market_id: str, reason: str, **extra) -> None:
        self.skipped.append({"board": board, "market_id": market_id,
                             "reason": reason, **extra})

    def flag(self, kind: str, detail: str, **extra) -> None:
        self.anomalies.append({"kind": kind, "detail": detail, **extra})
        print(f"  ANOMALY [{kind}] {detail}", file=sys.stderr)


# --------------------------------------------------------------------------
# board: WC26  (/api/suggestions)
# --------------------------------------------------------------------------

def score_wc26(fetcher: Fetcher, run: Run) -> None:
    payload, rec = fetcher.get("/api/suggestions?limit=100", "wc26_suggestions")
    board = {"endpoint": "/api/suggestions?limit=100",
             "http_status": rec["http_status"], "markets_seen": 0,
             "markets_priced": 0, "generated_at": None, "tier_used": None}
    run.boards["wc26"] = board

    if payload is None:
        board["error"] = rec["error"]
        run.flag("board_unavailable", f"wc26 board did not return JSON: {rec['error']}",
                 board="wc26")
        return

    suggestions = payload.get("suggestions") or []
    board["markets_seen"] = len(suggestions)
    board["generated_at"] = payload.get("generated_at")
    board["tier_used"] = payload.get("tier_used")

    if not suggestions:
        # Expected once the tournament settles — recorded, not treated as failure.
        board["note"] = ("board returned no suggestions "
                         f"(tier_used={payload.get('tier_used')!r})")
        return

    generated = parse_iso(payload.get("generated_at"))

    for s in suggestions:
        market_id = s.get("market_id") or "<missing>"
        title = s.get("market_title") or market_id
        match = f"{s.get('home', '?')} v {s.get('away', '?')}"

        if s.get("is_final"):
            run.skip("wc26", market_id, "match already final", market=title)
            continue

        model_p = fnum(s.get("model_probability"))
        odds = fnum(s.get("kalshi_odds"))
        api_implied = fnum(s.get("implied_probability"))

        if model_p is None:
            run.skip("wc26", market_id, "no model probability", market=title)
            continue
        if odds is None or odds <= 1.0:
            run.skip("wc26", market_id,
                     f"unusable kalshi_odds ({s.get('kalshi_odds')!r})", market=title)
            continue

        cost = 1.0 / odds

        # cross-check the API's own implied probability against the odds it
        # shipped alongside it — report disagreement, never reconcile it
        if api_implied is not None and abs(api_implied - cost) > IMPLIED_XCHECK_TOLERANCE:
            run.flag("implied_vs_odds_mismatch",
                     f"{market_id}: API implied_probability={api_implied:.4f} but "
                     f"1/kalshi_odds={cost:.4f} (odds={odds})",
                     board="wc26", market_id=market_id)

        edge = model_p - cost
        api_edge = fnum(s.get("edge"))
        if api_edge is not None and abs(api_edge - edge) > IMPLIED_XCHECK_TOLERANCE:
            run.flag("edge_vs_recomputed_mismatch",
                     f"{market_id}: API edge={api_edge:.4f} vs recomputed "
                     f"{edge:.4f} from model_probability - 1/kalshi_odds",
                     board="wc26", market_id=market_id)

        if abs(edge) > MAX_PLAUSIBLE_EDGE:
            run.flag("implausible_edge",
                     f"{market_id}: edge {edge:+.3f} exceeds ±{MAX_PLAUSIBLE_EDGE}",
                     board="wc26", market_id=market_id)

        notes = []
        conf = fnum(s.get("confidence"))
        if conf is not None:
            notes.append(f"api confidence {conf:.2f}")
        notes.append("fee NOT applied (kalshi_odds fee-basis unconfirmed)")
        if generated:
            age_min = (utc_now() - generated).total_seconds() / 60
            notes.append(f"board generated {age_min:.0f}m ago")
        if s.get("outcome_key"):
            notes.append(f"outcome={s['outcome_key']}")

        run.rows.append({
            "run_id": run.run_id,
            "board": "wc26",
            "match": match,
            "kickoff": s.get("kickoff") or "",
            "market_id": market_id,
            "market": title,
            "model_key": s.get("outcome_key") or "",
            "model_prob": round(model_p, 6),
            "implied_prob": round(cost, 6),
            "implied_prob_devig": "",
            "decimal_odds": round(odds, 4),
            "fee": "",
            "fee_model": "not_applied",
            "entry_cost": round(cost, 6),
            "edge": round(edge, 6),
            "kelly_full": round(kelly(model_p, cost), 6),
            "kelly_quarter": round(kelly(model_p, cost) / 4.0, 6),
            "run_type": "",
            "model_captured_at": payload.get("generated_at") or "",
            "confidence": "" if conf is None else round(conf, 4),
            "confidence_note": "; ".join(notes),
        })
        board["markets_priced"] += 1


# --------------------------------------------------------------------------
# board: MLS  (/api/mls/*)
# --------------------------------------------------------------------------

def devig_three_way(book_rows: list[dict], winner_by_ticker: dict) -> tuple[dict, str]:
    """Normalized bid/ask midpoints for the 3-way winner family.

    Mirrors the deployed frontend: midpoint per side, ask-only when there is no
    bid, then normalize the three to sum to 1. Returns ({} , reason) when the
    book is not complete enough to devig.
    """
    mids: dict[str, float] = {}
    ask_only = 0
    for r in book_rows:
        outcome = winner_by_ticker.get(r.get("ticker"))
        if not outcome and (r.get("label") or "").strip().lower() == "tie":
            outcome = "draw"
        if not outcome:
            continue
        ask, bid = fnum(r.get("yes_ask")), fnum(r.get("yes_bid"))
        if ask is not None and bid is not None:
            mid = (ask + bid) / 2.0
        elif ask is not None:
            mid, ask_only = ask, ask_only + 1
        else:
            continue
        mids[outcome] = mid

    if not {"home_win", "draw", "away_win"} <= mids.keys():
        return {}, "incomplete 3-way book"
    total = sum(mids.values())
    if total <= 0:
        return {}, "3-way midpoints sum to zero"
    method = (f"{ask_only} side(s) ask-only" if ask_only else "bid/ask midpoints")
    return ({k: v / total for k, v in mids.items()},
            f"{method}, overround {total:.4f}")


def score_mls(fetcher: Fetcher, run: Run, days: int, include_final: bool) -> None:
    board = {"endpoints": ["/api/mls/scoreboard", f"/api/mls/schedule?days={days}",
                           "/api/mls/match/{event_id}", "/api/mls/markets"],
             "fixtures_seen": 0, "fixtures_fetched": 0,
             "markets_seen": 0, "markets_priced": 0, "model_version": None,
             "shadow": None, "fixtures_book_from_fallback": 0}
    run.boards["mls"] = board

    prior_run_id, prior_inputs = prior_model_inputs()
    if prior_run_id:
        board["compared_against_run"] = prior_run_id

    scoreboard, sb_rec = fetcher.get("/api/mls/scoreboard", "mls_scoreboard")
    schedule, _ = fetcher.get(f"/api/mls/schedule?days={days}", "mls_schedule",
                              optional=True)
    # The standalone markets feed carries the same Kalshi books as the per-match
    # payload, and has been observed to hold a fixture the match endpoint omits
    # (event 761694, LAFC v Sporting KC). Pull it so a fixture whose match feed
    # ships no book is priced from the API rather than dropped.
    markets_feed, _ = fetcher.get("/api/mls/markets", "mls_markets", optional=True)
    fallback_games = []
    for game in ((markets_feed or {}).get("games") or []):
        game_rows = game.get("markets") or []
        fallback_games.append({
            "event_ticker": game.get("event_ticker"),
            "markets": game_rows,
            "tickers": {r.get("ticker") for r in game_rows if r.get("ticker")},
        })

    fixtures: dict[str, dict] = {}
    for payload in (scoreboard, schedule):
        for f in ((payload or {}).get("fixtures") or []):
            if f.get("id"):
                fixtures.setdefault(str(f["id"]), f)

    if not fixtures:
        board["error"] = sb_rec["error"] or "no fixtures returned"
        run.flag("board_unavailable",
                 f"mls board produced no fixtures: {board['error']}", board="mls")
        return

    board["fixtures_seen"] = len(fixtures)

    for event_id, fixture in sorted(fixtures.items()):
        state = fixture.get("state")
        home = (fixture.get("home") or {}).get("name") or "?"
        away = (fixture.get("away") or {}).get("name") or "?"
        match = f"{home} v {away}"

        if state == "post" and not include_final:
            run.skip("mls", f"event:{event_id}", "fixture already final",
                     market=match)
            continue

        payload, rec = fetcher.get(f"/api/mls/match/{event_id}",
                                   f"mls_match_{event_id}")
        if payload is None:
            run.skip("mls", f"event:{event_id}",
                     f"match feed unavailable ({rec['error']})", market=match)
            continue
        board["fixtures_fetched"] += 1
        book_fetched_at = parse_iso(rec["fetched_at_utc"])

        model = payload.get("model") or {}
        if board["model_version"] is None:
            board["model_version"] = model.get("model_version")
            board["shadow"] = model.get("shadow")

        # primary IS the canonical T-10 lock once it exists; a later scheduled
        # run must never silently supersede it (V8 eval F9)
        model_run = model.get("primary") or model.get("latest")
        if not model_run:
            run.skip("mls", f"event:{event_id}", "no model run stored for fixture",
                     market=match)
            continue

        run_type = model_run.get("run_type") or "unknown"
        captured_at = parse_iso(model_run.get("captured_at"))

        # information age, not clock age: a model that re-ran on identical
        # inputs is no fresher than the run before it, however new its
        # captured_at looks
        self_inputs = {"fingerprint": input_fingerprint(model_run),
                       "output_fingerprint": output_fingerprint(model_run),
                       "captured_at": model_run.get("captured_at") or "",
                       "run_type": run_type}
        run.model_inputs[str(event_id)] = self_inputs
        was = prior_inputs.get(str(event_id))
        if was and was.get("captured_at") != self_inputs["captured_at"]:
            same_out = was.get("output_fingerprint") == self_inputs["output_fingerprint"]
            same_in = was.get("fingerprint") == self_inputs["fingerprint"]
            if same_out:
                detail = ("every outcome and prop is identical to 4dp"
                          if not same_in else
                          "xg, basis, seed, input_quality AND every probability "
                          "are identical")
                run.flag("model_recaptured_without_new_output",
                         f"event {event_id} ({match}): captured_at advanced "
                         f"{was.get('captured_at', '')[:19]} -> "
                         f"{self_inputs['captured_at'][:19]} but {detail} "
                         f"(vs run {prior_run_id}) — this model is no fresher "
                         "than the previous one, whatever its timestamp says",
                         board="mls", market_id=f"event:{event_id}")

        outcomes = model_run.get("outcomes") or {}
        if outcomes:
            three = [fnum(outcomes.get(k)) for k in ("home_win", "draw", "away_win")]
            if all(v is not None for v in three):
                total = sum(three)
                if abs(total - 1.0) > PROB_SUM_TOLERANCE:
                    run.flag("model_probs_do_not_sum",
                             f"event {event_id} ({match}): home/draw/away sum to "
                             f"{total:.4f}", board="mls", market_id=f"event:{event_id}")

        staleness_s = None
        if captured_at and book_fetched_at:
            staleness_s = (book_fetched_at - captured_at).total_seconds()
            if staleness_s > MAX_MODEL_STALENESS_S:
                run.flag("model_older_than_book",
                         f"event {event_id} ({match}): {run_type} model captured "
                         f"{staleness_s / 3600:.1f}h before this book pull — a gap "
                         f"across two moments, not necessarily an edge (V9 F16)",
                         board="mls", market_id=f"event:{event_id}")

        # every probability the stored run knows, keyed the way the backend
        # keys each market row (model_key)
        probs: dict[str, float] = {}
        probs.update({k: v for k, v in outcomes.items() if fnum(v) is not None})
        probs.update({k: v for k, v in (model_run.get("props") or {}).items()
                      if fnum(v) is not None})
        for s in (model_run.get("scorelines") or []):
            score, prob = s.get("score"), fnum(s.get("prob"))
            if score and prob is not None and "-" in str(score):
                h, a = str(score).split("-", 1)
                probs[f"score_{h}_{a}"] = prob

        tickers = model_run.get("tickers") or {}
        winner_by_ticker = {t: o for o, t in tickers.items()}

        book = payload.get("book")
        families = payload.get("books") or []
        if not families and book:
            families = [{"key": "winner", "label": "Winner · 3-way",
                         "event_ticker": book.get("event_ticker"),
                         "markets": book.get("markets") or []}]

        # join this fixture to the standalone markets feed by ticker — the model
        # run's own ticker map is the authority, so no string parsing is needed
        fallback = next((g for g in fallback_games
                         if g["tickers"] & set(tickers.values())), None)

        if not families and fallback:
            # the match endpoint shipped no book but the API does carry one.
            # Price it from the fallback and say so loudly: this is a backend
            # inconsistency, and it previously vanished into `skipped` looking
            # like an absent market.
            families = [{"key": "winner", "label": "Winner · 3-way",
                         "event_ticker": fallback["event_ticker"],
                         "markets": fallback["markets"]}]
            board["fixtures_book_from_fallback"] += 1
            run.flag("book_missing_from_match_endpoint",
                     f"event {event_id} ({match}): /api/mls/match/{event_id} shipped "
                     f"no book, but /api/mls/markets carries "
                     f"{fallback['event_ticker']} with {len(fallback['markets'])} "
                     "market(s) — priced from the fallback feed, 3-way only",
                     board="mls", market_id=f"event:{event_id}")
        elif families and fallback:
            # both endpoints serve this fixture; a price disagreement between
            # them is reported, never reconciled (CLAUDE.md rule 4)
            match_rows = {r["ticker"]: r for fam in families
                          if (fam.get("key") or "winner") == "winner"
                          for r in (fam.get("markets") or []) if r.get("ticker")}
            for r in fallback["markets"]:
                other = match_rows.get(r.get("ticker"))
                if not other:
                    continue
                a_match, a_feed = fnum(other.get("yes_ask")), fnum(r.get("yes_ask"))
                if a_match is None or a_feed is None or a_match == a_feed:
                    continue
                run.flag("book_endpoints_disagree",
                         f"{r['ticker']}: /api/mls/match yes_ask={a_match} vs "
                         f"/api/mls/markets yes_ask={a_feed} "
                         f"({(a_feed - a_match) * 100:+.1f}c) — priced from the "
                         "match endpoint",
                         board="mls", market_id=r["ticker"])

        if not families:
            run.skip("mls", f"event:{event_id}", "no Kalshi book on this fixture "
                     "(absent from both /api/mls/match and /api/mls/markets)",
                     market=match)
            continue

        devig, devig_note = ({}, "no winner family")
        winner_rows = next((f.get("markets") or [] for f in families
                            if f.get("key") == "winner"), None)
        if winner_rows is None and book:
            winner_rows = book.get("markets") or []
        if winner_rows:
            devig, devig_note = devig_three_way(winner_rows, winner_by_ticker)

        for family in families:
            fam_key = family.get("key") or "winner"
            for r in (family.get("markets") or []):
                board["markets_seen"] += 1
                ticker = r.get("ticker") or "<missing>"
                label = r.get("label") or ticker

                status = (r.get("status") or "").lower()
                if status and status not in ("active", "open", ""):
                    run.skip("mls", ticker, f"book status {status!r}", market=match)
                    continue

                # the winner family joins by ticker through the approved
                # mapping; every other family carries its own model_key
                if fam_key == "winner":
                    model_key = winner_by_ticker.get(ticker)
                    if not model_key and (r.get("label") or "").strip().lower() == "tie":
                        model_key = "draw"
                else:
                    model_key = r.get("model_key")

                if not model_key:
                    run.skip("mls", ticker, "no model_key — cannot join to a "
                             "model probability", market=match, family=fam_key)
                    continue

                model_p = fnum(probs.get(model_key))
                if model_p is None:
                    run.skip("mls", ticker,
                             f"model run has no probability for key {model_key!r}",
                             market=match, family=fam_key)
                    continue

                ask = fnum(r.get("yes_ask"))
                if ask is None:
                    run.skip("mls", ticker, "no ask — nothing buyable",
                             market=match, family=fam_key)
                    continue
                if not (0.0 < ask < 1.0):
                    run.skip("mls", ticker,
                             f"ask {ask!r} outside (0,1) — unexpected price unit",
                             market=match, family=fam_key)
                    run.flag("price_out_of_range",
                             f"{ticker}: yes_ask={r.get('yes_ask')!r} is not a "
                             "dollar price in (0,1)", board="mls", market_id=ticker)
                    continue

                fee = KALSHI_FEE(ask)
                cost = ask + fee
                edge = model_p - cost

                if abs(edge) > MAX_PLAUSIBLE_EDGE:
                    run.flag("implausible_edge",
                             f"{ticker} ({label}): edge {edge:+.3f} exceeds "
                             f"±{MAX_PLAUSIBLE_EDGE}", board="mls", market_id=ticker)

                bid = fnum(r.get("yes_bid"))
                notes = [f"{run_type} run"]
                if model.get("shadow"):
                    notes.append("SHADOW — observational, not a recommendation")
                if bid is None:
                    notes.append("ask-only, no bid (illiquid)")
                elif ask - bid > 0.05:
                    notes.append(f"wide spread {(ask - bid) * 100:.0f}c")
                if staleness_s is not None and staleness_s > MAX_MODEL_STALENESS_S:
                    notes.append(f"model {staleness_s / 3600:.1f}h older than book")
                if fam_key == "winner" and devig:
                    notes.append(devig_note)
                if state == "in":
                    notes.append("fixture IN PLAY — pre-match model vs live book")
                iq = model_run.get("input_quality") or {}
                missing = [k for k, ok in iq.items() if ok is False]
                if missing:
                    notes.append("degraded inputs: " + ",".join(sorted(missing)))

                run.rows.append({
                    "run_id": run.run_id,
                    "board": "mls",
                    "match": match,
                    "kickoff": fixture.get("date") or "",
                    "market_id": ticker,
                    "market": label,
                    "model_key": model_key,
                    "model_prob": round(model_p, 6),
                    "implied_prob": round(ask, 6),
                    "implied_prob_devig": (round(devig[model_key], 6)
                                           if fam_key == "winner" and model_key in devig
                                           else ""),
                    "decimal_odds": round(1.0 / ask, 4),
                    "fee": round(fee, 6),
                    "fee_model": "kalshi_0.07p(1-p)",
                    "entry_cost": round(cost, 6),
                    "edge": round(edge, 6),
                    "kelly_full": round(kelly(model_p, cost), 6),
                    "kelly_quarter": round(kelly(model_p, cost) / 4.0, 6),
                    "run_type": run_type,
                    "model_captured_at": model_run.get("captured_at") or "",
                    "confidence": "",
                    "confidence_note": "; ".join(notes),
                })
                board["markets_priced"] += 1


# --------------------------------------------------------------------------
# version probe
# --------------------------------------------------------------------------

def probe_version(fetcher: Fetcher) -> dict:
    """Establish which build of the API answered. Never guesses a version."""
    result = {"source": None, "version": None, "git_sha": None, "payload": None,
              "tried": []}
    for path in VERSION_PATHS:
        name = "version_probe_" + path.strip("/").replace("/", "_") or "version_probe_root"
        payload, rec = fetcher.get(path, name, optional=True)
        result["tried"].append({"path": path, "http_status": rec["http_status"]})
        if payload is None or not isinstance(payload, dict):
            continue
        result["source"] = path
        result["payload"] = payload
        for key in ("version", "api_version", "build", "release"):
            if payload.get(key):
                result["version"] = str(payload[key])
                break
        for key in ("git_sha", "sha", "commit", "git_commit", "revision"):
            if payload.get(key):
                result["git_sha"] = str(payload[key])
                break
        if result["version"] or result["git_sha"]:
            break
    if not result["version"] and not result["git_sha"]:
        result["note"] = ("no version/SHA endpoint answered — this run is pinned "
                          "by snapshot SHA-256 instead")
    return result


# --------------------------------------------------------------------------
# outputs
# --------------------------------------------------------------------------

PICK_COLUMNS = [
    "run_id", "board", "match", "kickoff", "market_id", "market", "model_key",
    "model_prob", "implied_prob", "implied_prob_devig", "decimal_odds",
    "fee", "fee_model", "entry_cost", "edge", "kelly_full", "kelly_quarter",
    "run_type", "model_captured_at", "confidence", "confidence_note",
]


def write_picks(run: Run, out_dir: Path) -> Path:
    path = out_dir / "picks.csv"
    rows = sorted(run.rows, key=lambda r: r["edge"], reverse=True)
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=PICK_COLUMNS)
        w.writeheader()
        w.writerows(rows)
    return path


def write_meta(run: Run, fetcher: Fetcher, out_dir: Path, version: dict,
               started: datetime, odds_pulled_at: str | None,
               boards_requested: list[str]) -> Path:
    meta = {
        "run_id": run.run_id,
        "script": {
            "name": Path(__file__).name,
            "sha256": sha256_file(Path(__file__).resolve()),
        },
        "api": {
            "base_url": API_BASE,
            "version": version.get("version"),
            "git_sha": version.get("git_sha"),
            "version_source": version.get("source"),
            "version_payload": version.get("payload"),
            "version_probe_note": version.get("note"),
            "endpoints_tried": version.get("tried"),
        },
        "timing": {
            "started_at_utc": iso(started),
            "odds_pulled_at_utc": odds_pulled_at,
            "finished_at_utc": iso(utc_now()),
        },
        "boards_requested": boards_requested,
        "boards": run.boards,
        "counts": {
            "markets_seen": sum(b.get("markets_seen", 0) for b in run.boards.values()),
            "markets_priced": len(run.rows),
            "markets_skipped": len(run.skipped),
            "anomalies": len(run.anomalies),
        },
        "skipped": run.skipped,
        "anomalies": run.anomalies,
        "model_inputs": run.model_inputs,
        "snapshots": fetcher.records,
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
        },
        "notes": [
            "Raw responses were written to data/snapshots/<run_id>/ and made "
            "read-only before parsing. Re-derive this run from those bytes.",
            "MLS edge is net of Kalshi's 0.07*P*(1-P) entry fee. WC26 edge is "
            "NOT, because it is unconfirmed whether kalshi_odds is already net "
            "of fees — see CLAUDE.md.",
            "Anomalies are reported, never corrected (CLAUDE.md rule 4).",
            "A fixture whose /api/mls/match payload ships no book is priced from "
            "/api/mls/markets instead of being dropped; those fixtures are "
            "counted in boards.mls.fixtures_book_from_fallback, flagged as "
            "book_missing_from_match_endpoint, and carry the 3-way only. Where "
            "both endpoints serve a fixture, a price disagreement is flagged as "
            "book_endpoints_disagree and the match endpoint is used.",
        ],
    }
    path = out_dir / "meta.json"
    path.write_text(json.dumps(meta, indent=2, sort_keys=False) + "\n",
                    encoding="utf-8")
    return path


# --------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--board", choices=["wc26", "mls", "both"], default="both")
    ap.add_argument("--days", type=int, default=3,
                    help="MLS schedule lookahead in days (default 3)")
    ap.add_argument("--include-final", action="store_true",
                    help="score fixtures already finished (default: skip)")
    ap.add_argument("--probe", action="store_true",
                    help="check reachability and schema only; write no run")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    started = utc_now()
    run_id = started.strftime("%Y-%m-%d-%H%M")

    if args.probe:
        return probe(args, run_id, started)

    run_dir = RUNS_DIR / run_id
    if run_dir.exists():
        print(f"error: runs/{run_id} already exists — a run is never overwritten.\n"
              "       Wait a minute or move the existing directory aside.",
              file=sys.stderr)
        return 2
    run_dir.mkdir(parents=True)

    print(f"trivela-analysis run {run_id}", file=sys.stderr)
    print(f"  api  {API_BASE}", file=sys.stderr)

    fetcher = Fetcher(SNAPSHOT_DIR / run_id, verbose=not args.quiet)
    run = Run(run_id)

    version = probe_version(fetcher)
    odds_pulled_at = iso(utc_now())

    boards = ["wc26", "mls"] if args.board == "both" else [args.board]
    if "wc26" in boards:
        score_wc26(fetcher, run)
    if "mls" in boards:
        score_mls(fetcher, run, args.days, args.include_final)

    picks = write_picks(run, run_dir)
    meta = write_meta(run, fetcher, run_dir, version, started, odds_pulled_at, boards)

    positive = [r for r in run.rows if r["edge"] > 0]
    print(f"\n  {len(run.rows)} markets priced, {len(positive)} with positive edge, "
          f"{len(run.skipped)} skipped, {len(run.anomalies)} anomalies",
          file=sys.stderr)
    print(f"  {picks.relative_to(ROOT)}\n  {meta.relative_to(ROOT)}", file=sys.stderr)

    if not run.rows:
        print("\n  no priced markets — see meta.json 'skipped' and 'boards' for why",
              file=sys.stderr)
        return 1
    return 0


def probe(args, run_id: str, started: datetime) -> int:
    """Reachability + shape check. Writes a snapshot dir, no run."""
    print(f"probing {API_BASE}", file=sys.stderr)
    fetcher = Fetcher(SNAPSHOT_DIR / f"probe-{run_id}", verbose=True)

    version = probe_version(fetcher)
    checks = [
        ("/openapi.json", "openapi", ["paths"]),
        ("/api/suggestions?limit=5", "wc26_suggestions", ["suggestions"]),
        ("/api/mls/scoreboard", "mls_scoreboard", ["fixtures"]),
        ("/api/mls/markets", "mls_markets", ["games"]),
        ("/api/mls/odds", "mls_odds", ["odds"]),
    ]
    ok = True
    for path, name, expected in checks:
        payload, rec = fetcher.get(path, name, optional=True)
        if payload is None:
            print(f"  MISS {path}: {rec['error']}", file=sys.stderr)
            ok = False
            continue
        missing = [k for k in expected if k not in payload]
        keys = ", ".join(sorted(payload)[:8]) if isinstance(payload, dict) else type(payload).__name__
        print(f"  OK   {path}  keys=[{keys}]"
              + (f"  MISSING {missing}" if missing else ""), file=sys.stderr)
        if missing:
            ok = False

    print(f"\n  api version: {version.get('version') or '—'}  "
          f"sha: {version.get('git_sha') or '—'}  "
          f"(source {version.get('source') or 'none'})", file=sys.stderr)
    print(f"  snapshots: data/snapshots/probe-{run_id}/", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

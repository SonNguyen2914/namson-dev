#!/usr/bin/env python3
"""Settle logged bets against real results and score the model's calibration.

Two jobs, both post-hoc, both read-only with respect to anything already
written:

  settle     every row in paper_bets.csv is graded against the final score and
             written to runs/settlement-<date>.csv. paper_bets.csv is NEVER
             touched — it is append-only (CLAUDE.md), and the settled/result/pnl
             columns it reserves cannot be filled without rewriting a row.

  calibrate  three-way Brier scores for the model and for the devigged book,
             over the same fixtures. This is the question the P&L cannot answer:
             P&L is dominated by which way the league broke on the day, Brier
             is not.

Results come from the deployed API (CLAUDE.md rule 2), never from a local
source, and every response is snapshotted before it is parsed.

Usage:
    python3 evaluate.py --run 2026-07-25-2225
    python3 evaluate.py --run 2026-07-25-2225 --settle-only
    python3 evaluate.py --run 2026-07-25-2225 --calibrate-only
"""

from __future__ import annotations

import argparse
import csv
import json
import statistics as st
import sys
from collections import defaultdict
from pathlib import Path

from fetch_and_score import (Fetcher, RUNS_DIR, SNAPSHOT_DIR, fnum, iso,
                             utc_now)

ROOT = Path(__file__).resolve().parent
LEDGER = ROOT / "paper_bets.csv"

def settle_market(model_key: str, home: int, away: int) -> bool | None:
    """True/False if the market settled yes/no, None if not gradeable here.

    Markets needing goal timings (first-team-to-score, no-goal) fall through to
    None and are left ungraded rather than guessed — CLAUDE.md rule 4.
    """
    total = home + away
    if model_key == "home_win":
        return home > away
    if model_key == "away_win":
        return away > home
    if model_key == "draw":
        return home == away
    if model_key.startswith("home_team_over_"):
        return home > float(model_key.rsplit("over_", 1)[1].replace("_", "."))
    if model_key.startswith("away_team_over_"):
        return away > float(model_key.rsplit("over_", 1)[1].replace("_", "."))
    if model_key.startswith("over_"):
        return total > float(model_key.split("over_", 1)[1].replace("_", "."))
    if model_key == "btts":
        return home > 0 and away > 0
    if model_key in ("home_margin_2", "home_margin_3"):
        return home - away >= int(model_key[-1])
    if model_key in ("away_margin_2", "away_margin_3"):
        return away - home >= int(model_key[-1])
    if model_key.startswith("score_"):
        _, h, a = model_key.split("_")
        return home == int(h) and away == int(a)
    return None


def run_event_ids(run_id: str) -> list[str]:
    """Fixtures the run actually pulled, from its own snapshot directory.

    Deliberately NOT taken from a live /api/mls/scoreboard: by the time a slate
    is settled the scoreboard has rolled forward to the next matchday and no
    longer lists the fixtures being evaluated.
    """
    snaps = SNAPSHOT_DIR / run_id
    return sorted(p.name[len("mls_match_"):-len(".json")]
                  for p in snaps.glob("mls_match_*.json"))


def fetch_results(fetcher: Fetcher, run_id: str) -> dict:
    """Final scores for exactly the fixtures the evaluated run priced."""
    out: dict[str, dict] = {}
    for eid in run_event_ids(run_id):
        payload, _ = fetcher.get(f"/api/mls/match/{eid}", f"mls_match_{eid}")
        m = (payload or {}).get("match") or {}
        hs = (m.get("home") or {}).get("score")
        away_s = (m.get("away") or {}).get("score")
        name = f"{(m.get('home') or {}).get('name')} v {(m.get('away') or {}).get('name')}"
        out[name] = {
            "event_id": eid,
            "state": m.get("state"),
            "home": None if hs is None else int(hs),
            "away": None if away_s is None else int(away_s),
        }
    return out


SETTLE_COLUMNS = [
    "bet_id", "portfolio", "run_id", "match", "market", "model_key",
    "contracts", "stake", "entry_cost", "model_prob", "final_score",
    "settled_result", "payout", "pnl", "settled_at_utc",
]


def settle(results: dict, out_dir: Path) -> Path | None:
    if not LEDGER.exists():
        print("  no paper_bets.csv — nothing to settle", file=sys.stderr)
        return None
    with LEDGER.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if not rows:
        print("  paper_bets.csv is empty", file=sys.stderr)
        return None

    now = iso(utc_now())
    out, ungraded = [], 0
    for r in rows:
        res = results.get(r["match"])
        key = r["model_key"]
        won = None
        if res and res["home"] is not None and res["state"] == "post":
            won = settle_market(key, res["home"], res["away"])
        if won is None:
            ungraded += 1
        n = int(r["contracts"] or 0)
        stake = fnum(r["stake"]) or 0.0
        payout = float(n) if won else 0.0
        # portfolio column was added later; fall back to parsing the note
        tag = r.get("portfolio") or ""
        if not tag:
            tag = r.get("note", "").split(" (")[0].split(":")[0].strip()
        out.append({
            "bet_id": r["bet_id"], "portfolio": tag, "run_id": r["run_id"],
            "match": r["match"], "market": r["market"], "model_key": key,
            "contracts": n, "stake": f"{stake:.4f}",
            "entry_cost": r["entry_cost"], "model_prob": r["model_prob"],
            "final_score": ("—" if not res or res["home"] is None
                            else f"{res['home']}-{res['away']}"),
            "settled_result": ("UNGRADED" if won is None
                               else ("WON" if won else "LOST")),
            "payout": f"{payout:.4f}", "pnl": f"{payout - stake:+.4f}",
            "settled_at_utc": now,
        })

    path = out_dir / f"settlement-{utc_now():%Y-%m-%d}.csv"
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=SETTLE_COLUMNS)
        w.writeheader()
        w.writerows(out)

    # ungraded rows are excluded from P&L entirely — counting an unsettled bet
    # as a zero-payout loss would read as a 100% wipeout that never happened
    agg: dict[str, list] = defaultdict(lambda: [0, 0, 0, 0.0, 0.0])
    for r in out:
        a = agg[r["portfolio"] or "(untagged)"]
        if r["settled_result"] == "UNGRADED":
            a[2] += 1
            continue
        a[0] += 1
        a[1] += r["settled_result"] == "WON"
        a[3] += float(r["stake"])
        a[4] += float(r["payout"])
    print(f"\n  {'portfolio':<24}{'legs':>5}{'won':>5}{'n/a':>5}{'staked':>10}"
          f"{'returned':>10}{'P&L':>10}{'ROI':>9}", file=sys.stderr)
    for tag, (n, w_, ung, s, p) in sorted(agg.items()):
        roi = f"{100 * (p - s) / s:+.1f}%" if s else "—"
        print(f"  {tag:<24}{n:>5}{w_:>5}{ung:>5}{s:>10.2f}{p:>10.2f}"
              f"{p - s:>+10.2f}{roi:>9}", file=sys.stderr)
    if ungraded:
        print(f"  {ungraded} row(s) UNGRADED and excluded from P&L "
              "(not final, or needs goal timings)", file=sys.stderr)
    return path


def calibrate(run_id: str, results: dict) -> dict:
    """Three-way Brier: the model against the devigged book, same fixtures."""
    picks = RUNS_DIR / run_id / "picks.csv"
    if not picks.exists():
        sys.exit(f"error: {picks.relative_to(ROOT)} not found")
    with picks.open(newline="", encoding="utf-8") as fh:
        rows = [r for r in csv.DictReader(fh)
                if r["model_key"] in ("home_win", "draw", "away_win")]

    three: dict[str, dict] = defaultdict(dict)
    for r in rows:
        three[r["match"]][r["model_key"]] = r

    per, model_b, book_b = [], [], []
    for match, sides in sorted(three.items()):
        res = results.get(match)
        if len(sides) < 3 or not res or res["home"] is None or res["state"] != "post":
            continue
        h, a = res["home"], res["away"]
        actual = {"home_win": int(h > a), "draw": int(h == a), "away_win": int(a > h)}
        mp = {k: fnum(v["model_prob"]) or 0.0 for k, v in sides.items()}
        bp = {k: (fnum(v["implied_prob_devig"]) or fnum(v["implied_prob"]) or 0.0)
              for k, v in sides.items()}
        bm = sum((mp[k] - actual[k]) ** 2 for k in actual)
        bk = sum((bp[k] - actual[k]) ** 2 for k in actual)
        model_b.append(bm)
        book_b.append(bk)
        per.append({"match": match, "score": f"{h}-{a}",
                    "model_brier": round(bm, 4), "book_brier": round(bk, 4),
                    "model_minus_book": round(bm - bk, 4)})

    if not model_b:
        print("  no settled fixtures with a complete 3-way — cannot calibrate",
              file=sys.stderr)
        return {}

    mb, bb = st.mean(model_b), st.mean(book_b)
    better = "book" if bb < mb else "model"
    print(f"\n  three-way Brier over {len(model_b)} settled fixtures "
          f"(lower is better)", file=sys.stderr)
    print(f"    model {mb:.4f}   book {bb:.4f}   -> {better} better by "
          f"{abs(mb - bb):.4f} ({100 * abs(mb - bb) / max(mb, bb):.1f}%)",
          file=sys.stderr)
    per.sort(key=lambda p: p["model_minus_book"])
    print(f"    model beat the book most: "
          f"{', '.join(p['match'][:24] for p in per[:2])}", file=sys.stderr)
    print(f"    book beat the model most: "
          f"{', '.join(p['match'][:24] for p in per[-2:])}", file=sys.stderr)
    return {"fixtures": len(model_b), "model_brier": round(mb, 6),
            "book_brier": round(bb, 6), "better": better, "per_fixture": per}


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run", required=True,
                    help="run id whose picks.csv supplies the probabilities")
    ap.add_argument("--settle-only", action="store_true")
    ap.add_argument("--calibrate-only", action="store_true")
    args = ap.parse_args()

    if args.settle_only and args.calibrate_only:
        sys.exit("error: --settle-only and --calibrate-only are exclusive")

    stamp = utc_now().strftime("%Y-%m-%d-%H%M")
    out_dir = RUNS_DIR / args.run
    if not out_dir.exists():
        sys.exit(f"error: run {args.run} not found")

    print(f"evaluate run {args.run}", file=sys.stderr)
    fetcher = Fetcher(SNAPSHOT_DIR / f"evaluate-{stamp}", verbose=True)
    results = fetch_results(fetcher, args.run)
    final = sum(1 for r in results.values() if r["state"] == "post")
    print(f"  {final}/{len(results)} fixtures from this run are final", file=sys.stderr)

    report: dict = {"evaluated_run": args.run,
                    "evaluated_at_utc": iso(utc_now()),
                    "fixtures_final": final, "fixtures_seen": len(results)}

    if not args.calibrate_only:
        path = settle(results, out_dir)
        if path:
            report["settlement_file"] = str(path.relative_to(ROOT))
    if not args.settle_only:
        cal = calibrate(args.run, results)
        if cal:
            report["calibration"] = cal

    rp = out_dir / "evaluation.json"
    rp.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"\n  {rp.relative_to(ROOT)}", file=sys.stderr)
    print(f"  snapshots: data/snapshots/evaluate-{stamp}/", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

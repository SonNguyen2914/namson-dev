#!/usr/bin/env python3
"""Append selected rows from a run to paper_bets.csv.

paper_bets.csv is append-only. This script opens it in "a" mode and nothing
else, refuses to write a header over an existing file, and verifies after every
write that the pre-existing lines are byte-for-byte unchanged. If that check
fails the run aborts loudly rather than leaving a rewritten log behind.

Usage:
    python3 append_paper_bets.py --run 2026-07-25-1430 --list
    python3 append_paper_bets.py --run 2026-07-25-1430 --rows 1,4,7 --stake 25
    python3 append_paper_bets.py --run 2026-07-25-1430 --min-edge 0.03 \
        --bankroll 1000 --dry-run
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RUNS_DIR = ROOT / "runs"
LEDGER = ROOT / "paper_bets.csv"

LEDGER_COLUMNS = [
    "bet_id", "appended_at_utc", "run_id", "board", "match", "kickoff",
    "market_id", "market", "model_key", "model_prob", "implied_prob",
    "entry_cost", "edge", "kelly_quarter", "stake", "contracts",
    "confidence_note", "note",
    # reserved for settlement, filled by a later step — present from the start
    # so settling never requires rewriting an existing row
    "settled", "result", "pnl", "settled_at_utc",
]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def bet_id(run_id: str, board: str, market_id: str, model_key: str) -> str:
    raw = f"{run_id}|{board}|{market_id}|{model_key}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def load_picks(run_id: str) -> list[dict]:
    path = RUNS_DIR / run_id / "picks.csv"
    if not path.exists():
        sys.exit(f"error: {path.relative_to(ROOT)} not found. "
                 f"Available runs: {', '.join(sorted(p.name for p in RUNS_DIR.iterdir() if p.is_dir())) or 'none'}")
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def existing_ids() -> set[str]:
    if not LEDGER.exists():
        return set()
    with LEDGER.open(newline="", encoding="utf-8") as fh:
        return {r["bet_id"] for r in csv.DictReader(fh) if r.get("bet_id")}


def fnum(value, default=0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def fmt_row(i: int, r: dict) -> str:
    return (f"  [{i:>3}] {r['board']:<5} {r['market'][:44]:<44} "
            f"model {fnum(r['model_prob']) * 100:5.1f}%  "
            f"ask {fnum(r['implied_prob']) * 100:5.1f}%  "
            f"edge {fnum(r['edge']) * 100:+5.1f}%  "
            f"¼K {fnum(r['kelly_quarter']) * 100:5.2f}%")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run", required=True, help="run id, e.g. 2026-07-25-1430")

    sel = ap.add_argument_group("row selection")
    sel.add_argument("--rows", help="1-based row numbers from --list, e.g. 1,4,7")
    sel.add_argument("--market-id", action="append", default=[],
                     help="select by market_id/ticker (repeatable)")
    sel.add_argument("--all", action="store_true", help="every row in the run")
    sel.add_argument("--min-edge", type=float,
                     help="every row with edge >= this (e.g. 0.03)")

    size = ap.add_argument_group("sizing")
    size.add_argument("--stake", type=float,
                      help="flat dollar stake per bet")
    size.add_argument("--bankroll", type=float,
                      help="size each bet at quarter-Kelly of this bankroll")

    ap.add_argument("--note", default="", help="free-text note on every bet")
    ap.add_argument("--list", action="store_true", help="show rows and exit")
    ap.add_argument("--dry-run", action="store_true",
                    help="show exactly what would be appended, write nothing")
    ap.add_argument("--allow-duplicate", action="store_true",
                    help="append even if this bet_id is already logged")
    args = ap.parse_args()

    picks = load_picks(args.run)
    if not picks:
        sys.exit(f"error: run {args.run} has no picks")

    if args.list:
        print(f"run {args.run} — {len(picks)} rows (already sorted by edge)\n")
        for i, r in enumerate(picks, 1):
            print(fmt_row(i, r))
        return 0

    # ---- selection -------------------------------------------------------
    selected: list[dict] = []
    if args.all:
        selected = list(picks)
    else:
        if args.rows:
            try:
                idx = [int(x) for x in args.rows.split(",") if x.strip()]
            except ValueError:
                sys.exit(f"error: --rows must be comma-separated integers, got {args.rows!r}")
            for i in idx:
                if not 1 <= i <= len(picks):
                    sys.exit(f"error: row {i} out of range (run has {len(picks)} rows)")
                selected.append(picks[i - 1])
        for mid in args.market_id:
            hits = [r for r in picks if r["market_id"] == mid]
            if not hits:
                sys.exit(f"error: market_id {mid!r} not in run {args.run}")
            selected.extend(hits)
        if args.min_edge is not None:
            selected.extend(r for r in picks if fnum(r["edge"], -9) >= args.min_edge)

    if not selected:
        sys.exit("error: nothing selected — use --rows, --market-id, --min-edge, "
                 "--all, or --list to see what is available")

    # de-dupe within this invocation, preserving order
    seen, unique = set(), []
    for r in selected:
        key = (r["market_id"], r["model_key"])
        if key not in seen:
            seen.add(key)
            unique.append(r)
    selected = unique

    if args.stake is None and args.bankroll is None:
        sys.exit("error: give --stake DOLLARS or --bankroll DOLLARS (quarter-Kelly)")
    if args.stake is not None and args.bankroll is not None:
        sys.exit("error: --stake and --bankroll are mutually exclusive")

    already = existing_ids()
    now = utc_now_iso()
    to_append, skipped = [], []

    for r in selected:
        bid = bet_id(r["run_id"], r["board"], r["market_id"], r["model_key"])
        if bid in already and not args.allow_duplicate:
            skipped.append((bid, r))
            continue

        cost = fnum(r["entry_cost"])
        if args.stake is not None:
            stake = args.stake
        else:
            stake = args.bankroll * fnum(r["kelly_quarter"])
        contracts = math.floor(stake / cost) if cost > 0 else 0
        if contracts < 1:
            skipped.append((bid, r))
            print(f"  skip {r['market_id']}: stake ${stake:.2f} buys 0 contracts "
                  f"at ${cost:.4f}", file=sys.stderr)
            continue

        to_append.append({
            "bet_id": bid,
            "appended_at_utc": now,
            "run_id": r["run_id"],
            "board": r["board"],
            "match": r["match"],
            "kickoff": r.get("kickoff", ""),
            "market_id": r["market_id"],
            "market": r["market"],
            "model_key": r["model_key"],
            "model_prob": r["model_prob"],
            "implied_prob": r["implied_prob"],
            "entry_cost": r["entry_cost"],
            "edge": r["edge"],
            "kelly_quarter": r["kelly_quarter"],
            "stake": f"{contracts * cost:.4f}",
            "contracts": contracts,
            "confidence_note": r.get("confidence_note", ""),
            "note": args.note,
            "settled": "", "result": "", "pnl": "", "settled_at_utc": "",
        })
        already.add(bid)

    for bid, r in skipped:
        if bid in existing_ids():
            print(f"  already logged, skipping: {r['market_id']} ({bid})",
                  file=sys.stderr)

    if not to_append:
        print("nothing to append.", file=sys.stderr)
        return 1

    if args.dry_run:
        print(f"DRY RUN — would append {len(to_append)} row(s) to "
              f"{LEDGER.relative_to(ROOT)}:\n")
        for row in to_append:
            print(f"  {row['bet_id']}  {row['board']:<5} {row['market'][:40]:<40} "
                  f"{row['contracts']:>4} @ ${float(row['entry_cost']):.4f} "
                  f"= ${float(row['stake']):.2f}")
        return 0

    # ---- append, and prove nothing else moved ----------------------------
    is_new = not LEDGER.exists() or LEDGER.stat().st_size == 0
    before = b"" if is_new else LEDGER.read_bytes()

    with LEDGER.open("a", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=LEDGER_COLUMNS)
        if is_new:
            writer.writeheader()
        writer.writerows(to_append)

    after = LEDGER.read_bytes()
    if not after.startswith(before):
        sys.exit("FATAL: paper_bets.csv was modified, not appended to. "
                 "The pre-existing bytes changed. Investigate before trusting "
                 "this file.")

    added = after[len(before):].decode("utf-8").count("\n") - (1 if is_new else 0)
    if added != len(to_append):
        sys.exit(f"FATAL: expected to append {len(to_append)} rows but the file "
                 f"grew by {added}. Investigate before trusting this file.")

    print(f"appended {len(to_append)} bet(s) from run {args.run} to "
          f"{LEDGER.relative_to(ROOT)}", file=sys.stderr)
    for row in to_append:
        print(f"  {row['bet_id']}  {row['market'][:44]:<44} "
              f"{row['contracts']:>4} @ ${float(row['entry_cost']):.4f}",
              file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

# Trivela — analysis session

This directory is the **analysis** side of Trivela. It pulls data, calls the
deployed model, and produces bet candidates for review. It does not contain
model code and never will.

## Standing rules

1. **`~/dev/wc26-bet-suggester` is off-limits.** Never edit, create, or delete
   files there. Do not run its code, do not import from it, do not "just fix"
   something in it. Reading it to understand a field name is fine; writing to
   it is not. Model changes happen in the build session, not here.

2. **All model calls go to the deployed Railway API, never to local code.**
   The base URL is `TRIVELA_API_BASE` (default
   `https://wc26-bet-suggester-production.up.railway.app`). No local imports of
   model modules, no local re-implementation of model math, no localhost
   backend. If the deployed API is down, the run fails — it does not fall back.

3. **Every run is reproducible and version-stamped.** Raw responses are written
   to `data/snapshots/<run-id>/` *before* anything parses them, and are made
   read-only. Every run writes a `meta.json` recording the API version/SHA, the
   model version, the UTC pull timestamp, a SHA-256 of every snapshot payload,
   and the SHA-256 of the script that produced it. A run you cannot re-derive
   from its snapshot is not a run.

4. **If a number looks wrong, report it — do not fix it.** Anomalies go in
   `meta.json` under `anomalies` and are printed to stderr. Do not clamp,
   patch, smooth, or "correct" a suspicious model probability, price, or edge
   on the way through. The scorer's job is to surface the number the API
   actually returned. Fixes happen in the build session.

## Layout

```
runs/<YYYY-MM-DD-HHMM>/picks.csv    bet candidates for review
runs/<YYYY-MM-DD-HHMM>/meta.json    provenance + skips + anomalies
data/snapshots/<YYYY-MM-DD-HHMM>/   raw API responses, chmod 444, immutable
paper_bets.csv                      append-only log, never rewritten
```

## Usage

```bash
python3 fetch_and_score.py                      # both boards
python3 fetch_and_score.py --board mls          # one board
python3 fetch_and_score.py --probe              # endpoint/schema check, no run
python3 append_paper_bets.py --run 2026-07-25-1430 --rows 1,4 --stake 25
```

## What the numbers mean

- **Prices are dollars per $1 contract.** MLS `yes_ask` / `yes_bid` arrive as
  decimal strings in `[0, 1]` — `"0.45"` is 45¢. WC26 `kalshi_odds` is a
  *decimal payout multiple* (`1.85x`), so its price is `1 / kalshi_odds`. The
  two boards do not share a price convention; `picks.csv` tags every row with
  its board for that reason.
- **Kalshi's entry fee is `0.07·P·(1−P)`** per contract, added to the ask. On
  the MLS board `edge = model_prob − (ask + fee)`, matching how the deployed
  frontend computes net edge. On WC26 the fee is **not** applied, because it is
  not yet confirmed whether `kalshi_odds` is already net of fees — every WC26
  row carries `fee_model=not_applied` and the question is logged as an anomaly
  rather than guessed at.
- **Two implied probabilities.** `implied_prob` is the raw buyable ask — the
  price you actually pay. `implied_prob_devig` is the three-way bid/ask
  midpoints normalized to sum to 1, which is the fairer read of what the market
  believes but is not tradeable. Edge is computed off the raw ask.
- **Kelly** for a binary contract bought at effective cost `c` paying $1 is
  `f* = (p − c) / (1 − c)`, clamped to `[0, 1]`. `kelly_quarter` is that over 4
  and is the column to actually look at.
- **Temporal basis matters.** The backend keeps a frozen `t10` lock run, a
  `latest` diagnostic run, and the live book. Comparing a frozen model to a
  current market produces a gap across two moments, which is not the same thing
  as an edge (the V9 evaluation flagged exactly this, F16). Every row records
  `run_type` and `model_captured_at`; rows whose model is materially older than
  the book are flagged, not silently priced.
- **The MLS model is shadow.** `mls-2026-v0` is labeled observational and
  real-money signals are disabled server-side. Nothing in `picks.csv` is a
  recommendation.

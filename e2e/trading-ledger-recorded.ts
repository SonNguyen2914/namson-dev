// THE TRADES & GROUNDS LEDGER, RECORDED FROM THE BACKEND (2026-10-06,
// branch ledger-backend @5179fdd of SonNguyen2914/TRIVELA).
//
// These payloads are what GET /api/admin/trading/ledger (trading-ledger-v1,
// src/trading/ledger.py) returned in the backend's own hermetic test world
// (tests/test_trading_ledger.py's helpers: tests/_trading_seed.py's EPL
// fixture, FakeKalshi, a throwaway SQLite live plane; no network, no real
// account, market or result). One world, nine rows:
//   - a v0 pre-match order filled 12 @ 41c, settled YES: won, +$7.02
//     (placed, filled and settled by the agent's own tick);
//   - Son's handover (6 YES at the 40c bid, won +$3.71) and takeback (2 at
//     45c, lost -$1.14) on the same market;
//   - a v2 blend order (books 47%, model 49%, w 0.25, 2c bar) filled on
//     TOTAL 2.5 and UNSETTLED;
//   - a cancelled order (edge_gone) on the TIE leg, never filled;
//   - an in-play v2 entry at minute 38 (anchor w 0.5, commentary signals),
//     settled in its favour;
//   - an in-play PROTECTIVE EXIT at minute 71 (HOT by momentum and xg15,
//     danger 23.1% >= 20%), lost;
//   - an MLS order the day before, lost past the $10 daily line;
//   - an OLD row that recorded nothing at all.
// The in-play and v2 rows' journaled INPUTS were written by the recording
// test in the shapes the strategies journal (strategy_inplay_v2 /
// strategy_v2); every field below was then produced by the backend's own
// ledger.view through the real route — nothing here was typed by hand.
//
// LEDGER_RECORDED is limit=200 (every row), LEDGER_PAGE_1 / _2 are limit=3
// at offset 0 and 3. Timestamps are as recorded (the seed's T0 sits in the
// future of the recording); nothing on the page compares them with now.
// EXPERIMENTAL, UNPROVEN.

export const LEDGER_RECORDED = {
 "basis": "every order the trader placed, and every handover row of its book, newest first, with the grounds it recorded when it placed it, what became of the order, and its own P&L against the journaled result. Experimental, unproven: an 'edge' is the trader's own estimate at the time, from unvalidated inputs, and a P&L of a few small orders is a record, not a verdict",
 "env": "demo",
 "filters": {
  "competition": null,
  "phase": null,
  "since": null,
  "until": null
 },
 "generated_at": "2026-11-05T16:30:00+00:00",
 "label": "experimental, unproven",
 "not_recorded": "not recorded",
 "page": {
  "has_more": false,
  "limit": 200,
  "matching": 9,
  "offset": 0,
  "returned": 9,
  "scan_complete": true,
  "scan_max": 5000,
  "scanned": 9
 },
 "rows": [
  {
   "client_order_id": "trv0-px-1",
   "competition": "epl",
   "cost_dollars": 1.55,
   "count": 5,
   "day": "2026-11-05",
   "edge": {
    "basis": "computed",
    "cents": -0.3675,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": -1.05,
    "threshold_cents": -2.0,
    "threshold_kind": "exit_tolerance"
   },
   "env": "demo",
   "fee_dollars": 0.05,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_recorded",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": null,
     "p_side": null,
     "p_yes": null,
     "per_book": null,
     "status": "not_applicable"
    },
    "fair": {
     "method": null,
     "side": 0.3,
     "yes": 0.7
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.05,
     "per_contract_cents": 0.3675
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": {
      "danger": 0.231,
      "danger_threshold": 0.2,
      "held_by_agent": 5.0,
      "held_side": "yes",
      "hot_by": [
       "momentum",
       "xg15"
      ],
      "momentum_against": 0.4,
      "rates": "informed",
      "sot15_against": null,
      "tolerance": 0.02,
      "window_min": 10.0,
      "xg15_against": 0.43
     },
     "informed_source": null,
     "minute": 71,
     "model_age_s": null,
     "p_engine": 0.69,
     "p_informed": null,
     "p_tape": null,
     "period": 2,
     "score": [
      1,
      1
     ],
     "signals": {
      "missing": [],
      "momentum": [
       0.3,
       0.7
      ],
      "profile": "commentary",
      "rating_delta": null,
      "sot15": null,
      "xg15": [
       0.05,
       0.48
      ]
     },
     "status": "recorded",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 30.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_applicable",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": "protective_exit",
     "path": "in_play",
     "status": "recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 23,
   "lifecycle": {
    "avg_fill_price_cents": 30.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 1.52,
    "fill_fees_dollars": 0.02,
    "filled_count": 5,
    "fills": [
     {
      "at": "2026-11-05T14:41:10+00:00",
      "count": 5,
      "fee_dollars": 0.02,
      "price_cents": 30.0,
      "side": "no",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T14:41:10+00:00",
    "last_fill_at": "2026-11-05T14:41:10+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T14:42:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [
    "grounds.blend",
    "grounds.guards"
   ],
   "order_id": "px-1",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": -1.52,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "lost",
    "words": "the market settled against the side this row holds"
   },
   "phase": "protective_exit",
   "placed_at": "2026-11-05T14:41:00+00:00",
   "price_cents": 30.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "inplay-maker-v2",
   "why": "Protective exit at minute 71, 1-1: HOT (momentum, xg15) and danger 23.1% ≥ 20.0%; buying NO at 30c to close 5 held YES; fair NO 30.0%, edge -0.4c within the 2.0c tolerance.",
   "yes_book_price_cents": 70.0
  },
  {
   "client_order_id": "trv0-ip-1",
   "competition": "epl",
   "cost_dollars": 4.0,
   "count": 6,
   "day": "2026-11-05",
   "edge": {
    "basis": "computed",
    "cents": 5.6073,
    "cleared": true,
    "gate_basis": "ask",
    "gate_cents": 5.33,
    "threshold_cents": 5.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.04,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": [
      "0.5",
      "0.05"
     ],
     "context": null,
     "source": "blend",
     "status": "recorded",
     "threshold": 5.0,
     "w": 0.5
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": null,
     "p_side": null,
     "p_yes": null,
     "per_book": null,
     "status": "not_applicable"
    },
    "fair": {
     "method": null,
     "side": 0.72,
     "yes": 0.28
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.04,
     "per_contract_cents": 0.3927
    },
    "guards": {
     "anomaly": {
      "assessed": false,
      "avoid": null,
      "exemption": null,
      "score": null,
      "threshold": null,
      "top": null,
      "words": "not assessed (no score for this match)"
     },
     "error": null,
     "news_guard": {
      "applies": false,
      "enabled": null,
      "model_dropped": null,
      "unreadable": null,
      "words": "does not run in play"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": {
      "forecast_source": "ratings_club",
      "source": "ratings_club",
      "w": 0.5,
      "why": null
     },
     "book_verified_age_s": 3.0,
     "exit": null,
     "informed_source": "blend",
     "minute": 38,
     "model_age_s": 12.0,
     "p_engine": 0.29,
     "p_informed": 0.27,
     "p_tape": 0.3,
     "period": 1,
     "score": [
      1,
      0
     ],
     "signals": {
      "missing": [],
      "momentum": [
       0.62,
       0.38
      ],
      "profile": "commentary",
      "rating_delta": null,
      "sot15": null,
      "xg15": [
       0.41,
       0.12
      ]
     },
     "status": "recorded",
     "w": 0.5
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 66.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_applicable",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": null,
       "name": "per_order_cap",
       "passed": null,
       "rule": "max",
       "unit": "dollars",
       "value": 4.0,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 20.0,
       "name": "feed_vouched_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 3.0,
       "words": "when the live feed last vouched for the book"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "model_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 12.0,
       "words": "the live model row's age"
      },
      {
       "exempted": false,
       "limit": 80.0,
       "name": "minute",
       "passed": true,
       "rule": "max",
       "unit": "minute",
       "value": 38.0,
       "words": "the match minute, against the last minute traded"
      },
      {
       "exempted": false,
       "limit": 3.0,
       "name": "inplay_edge",
       "passed": true,
       "rule": "min",
       "unit": "cents",
       "value": 5.33,
       "words": "fair minus the order's price, against the in-play bar"
      }
     ],
     "exemption": null,
     "path": "in_play",
     "status": "recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 20,
   "lifecycle": {
    "avg_fill_price_cents": 66.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 3.99,
    "fill_fees_dollars": 0.03,
    "filled_count": 6,
    "fills": [
     {
      "at": "2026-11-05T14:08:20+00:00",
      "count": 6,
      "fee_dollars": 0.03,
      "price_cents": 66.0,
      "side": "no",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T14:08:20+00:00",
    "last_fill_at": "2026-11-05T14:08:20+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T14:09:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Away to win",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-CHE"
   },
   "not_recorded": [],
   "order_id": "ip-1",
   "outcome": {
    "payout_dollars": 6.0,
    "pnl_dollars": 2.01,
    "result": "no",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "won",
    "words": "the market settled on the side this row holds"
   },
   "phase": "in_play",
   "placed_at": "2026-11-05T14:08:00+00:00",
   "price_cents": 66.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "inplay-maker-v2",
   "why": "Minute 38, 1-0: fair NO 72.0% (engine 29.0%, live-informed 27.0%, w=0.50) vs our bid 66c + 0.4c fee = edge 5.6c ≥ threshold 5.0c.",
   "yes_book_price_cents": 34.0
  },
  {
   "client_order_id": "trv0-v2-1",
   "competition": "epl",
   "cost_dollars": 3.59,
   "count": 8,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 2.83,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": 2.83,
    "threshold_cents": 2.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.07,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": [
      "0.25",
      "0.02"
     ],
     "context": [
      "epl",
      "total"
     ],
     "source": "blend",
     "status": "recorded",
     "threshold": 2.0,
     "w": 0.25
    },
    "consensus": {
     "age_s": 10800.0,
     "books": [
      "Pinnacle",
      "Bet365",
      "Unibet"
     ],
     "captured_at": null,
     "method": "pinnacle",
     "p_side": 0.47,
     "p_yes": 0.47,
     "per_book": {
      "Bet365": 0.465,
      "Pinnacle": 0.47,
      "Unibet": 0.476
     },
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.475,
     "yes": 0.475
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.07,
     "per_contract_cents": 0.4312
    },
    "guards": {
     "anomaly": {
      "assessed": true,
      "avoid": false,
      "exemption": null,
      "score": 0.12,
      "threshold": 0.6,
      "top": null,
      "words": "assessed, below the avoid threshold"
     },
     "error": null,
     "news_guard": {
      "applies": true,
      "enabled": true,
      "model_dropped": null,
      "unreadable": false,
      "words": "clear: no news or market move had overtaken the price"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": 44.0,
     "price_cents": 44.0
    },
    "model": {
     "age_s": 2700.0,
     "captured_at": "2026-11-05T11:20:00+00:00",
     "label": null,
     "model": "ratings_club",
     "p_side": 0.49,
     "p_yes": 0.49,
     "run_id": 41,
     "run_type": "pre_match",
     "source": "served_run",
     "status": "recorded",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": 5.0,
       "name": "per_order_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 3.59,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "per_match_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 8.57,
       "words": "the match's worst case after the order"
      },
      {
       "exempted": false,
       "limit": 50.0,
       "name": "bankroll_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 8.57,
       "words": "the account's worst case after the order, against min(the cap, equity)"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "daily_loss",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss today"
      },
      {
       "exempted": false,
       "limit": 30.0,
       "name": "book_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 4.0,
       "words": "the order book's age"
      },
      {
       "exempted": false,
       "limit": 21600.0,
       "name": "price_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 10800.0,
       "words": "the fair price read's age (the consensus pre-match, the live model in play)"
      },
      {
       "exempted": false,
       "limit": [
        600.0,
        10800.0
       ],
       "name": "window",
       "passed": true,
       "rule": "between",
       "unit": "seconds",
       "value": 5100.0,
       "words": "seconds to kickoff, inside T-180..T-10"
      }
     ],
     "exemption": null,
     "path": "pre_match",
     "status": "recorded",
     "version": "risk-v1"
    },
    "status": "recorded"
   },
   "id": 16,
   "lifecycle": {
    "avg_fill_price_cents": 44.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 3.56,
    "fill_fees_dollars": 0.04,
    "filled_count": 8,
    "fills": [
     {
      "at": "2026-11-05T12:09:00+00:00",
      "count": 8,
      "fee_dollars": 0.04,
      "price_cents": 44.0,
      "side": "yes",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T12:09:00+00:00",
    "last_fill_at": "2026-11-05T12:09:00+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T13:25:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Over 2.5 goals",
    "family": "TOTAL",
    "outcome_key": "over_2_5",
    "outcome_key_source": "recorded",
    "ticker": "KXEPLTOTAL-26NOV05ARSCHE-3"
   },
   "not_recorded": [],
   "order_id": "v2-1",
   "outcome": {
    "payout_dollars": null,
    "pnl_dollars": null,
    "result": null,
    "settled_at": null,
    "status": "unsettled",
    "words": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:05:00+00:00",
   "price_cents": 44.0,
   "row_type": "order",
   "side": "yes",
   "strategy_version": "model-blend-bandit-v2.1",
   "why": "Fair YES 47.5% (books 47.0% pinnacle, 3h old; model 49.0% w=0.25) vs our bid 44c + 0.4c fee = edge 2.8c ≥ threshold 2.0c.",
   "yes_book_price_cents": 44.0
  },
  {
   "client_order_id": "trv0-tie-1",
   "competition": "epl",
   "cost_dollars": 3.52,
   "count": 5,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 4.66,
    "cleared": true,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.02,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": "pinnacle",
     "p_side": 0.75,
     "p_yes": 0.25,
     "per_book": null,
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.75,
     "yes": 0.25
    },
    "fee": {
     "order_basis": "computed",
     "order_dollars": 0.02,
     "per_contract_cents": 0.3675
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 70.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": null,
     "path": null,
     "status": "not_recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 18,
   "lifecycle": {
    "avg_fill_price_cents": null,
    "cancels": [
     {
      "at": "2026-11-05T12:06:00+00:00",
      "outcome": "cancelled",
      "reason": "edge_gone",
      "words": "The order's OWN edge — the side's fair price minus the resting price minus the maker fee there, never the ask — is under the threshold it was placed at (v0: MIN_EDGE; v2: the arm's recorded threshold…"
     }
    ],
    "cancels_total": 1,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "filled_count": 0,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": null,
    "last_fill_at": null,
    "remaining": 5,
    "state": "cancelled",
    "venue_expiry_at": null,
    "words": "the trader cancelled what had not filled"
   },
   "market": {
    "contract": "Tie",
    "family": "GAME",
    "outcome_key": "draw",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-TIE"
   },
   "not_recorded": [
    "grounds.consensus.age_s",
    "grounds.consensus.books",
    "grounds.guards",
    "grounds.risk"
   ],
   "order_id": "tie-1",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "result": null,
    "settled_at": null,
    "status": "not_filled",
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:02:00+00:00",
   "price_cents": 70.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "consensus-maker-v0.1",
   "why": "Fair NO 75.0% (books 75.0% pinnacle, age not recorded) vs our bid 70c + 0.4c fee = edge 4.7c ≥ threshold 3.0c.",
   "yes_book_price_cents": 30.0
  },
  {
   "client_order_id": "trv0-580945d3-2d90-5ae7-9509-658c8b054b5e",
   "competition": "epl",
   "cost_dollars": 4.98,
   "count": 12,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 6.8525,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": 6.8525,
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.06,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": 900.0,
     "books": [
      "Pinnacle"
     ],
     "captured_at": "2026-11-05T11:45:00+00:00",
     "method": "pinnacle",
     "p_side": 0.482759,
     "p_yes": 0.482759,
     "per_book": {
      "Pinnacle": 0.482759
     },
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.482759,
     "yes": 0.482759
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.06,
     "per_contract_cents": 0.4233
    },
    "guards": {
     "anomaly": {
      "assessed": true,
      "avoid": false,
      "exemption": null,
      "score": null,
      "threshold": 1.0,
      "top": null,
      "words": "assessed: no component could be scored, so not avoided"
     },
     "error": null,
     "news_guard": {
      "applies": true,
      "enabled": true,
      "model_dropped": null,
      "unreadable": false,
      "words": "clear: no news or market move had overtaken the price"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": {
      "no": {
       "ask": 60.0,
       "bid": 55.0
      },
      "yes": {
       "ask": 45.0,
       "bid": 40.0
      }
     },
     "ceiling_cents": 41.0,
     "maker_no_cents": 56.0,
     "maker_yes_cents": 41.0,
     "price_cents": 41.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": 5.0,
       "name": "per_order_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "per_match_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the match's worst case after the order"
      },
      {
       "exempted": false,
       "limit": 50.0,
       "name": "bankroll_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the account's worst case after the order, against min(the cap, equity)"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "daily_loss",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss today"
      },
      {
       "exempted": false,
       "limit": 25.0,
       "name": "drawdown",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss since its starting point"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "book_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 0.0,
       "words": "the order book's age"
      },
      {
       "exempted": false,
       "limit": 21600.0,
       "name": "price_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 900.0,
       "words": "the fair price read's age (the consensus pre-match, the live model in play)"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "account_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 0.0,
       "words": "the account snapshot's age"
      },
      {
       "exempted": false,
       "limit": [
        600.0,
        10800.0
       ],
       "name": "window",
       "passed": true,
       "rule": "between",
       "unit": "seconds",
       "value": 5400.0,
       "words": "seconds to kickoff, inside T-180..T-10"
      }
     ],
     "exemption": null,
     "path": "pre_match",
     "status": "recorded",
     "version": "trading-risk-v0"
    },
    "status": "recorded"
   },
   "id": 4,
   "lifecycle": {
    "avg_fill_price_cents": 41.0,
    "cancels": [
     {
      "at": "2026-11-05T15:00:00+00:00",
      "outcome": "cancelled",
      "reason": "in_play",
      "words": "The match has kicked off: pre-match trading is closed."
     }
    ],
    "cancels_total": 1,
    "fill_cost_dollars": 4.98,
    "fill_fees_dollars": 0.06,
    "filled_count": 12,
    "fills": [
     {
      "at": "2026-11-05T12:00:40+00:00",
      "count": 12,
      "fee_dollars": 0.06,
      "price_cents": 41.0,
      "side": "yes",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T12:00:40+00:00",
    "last_fill_at": "2026-11-05T12:00:40+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T13:25:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [],
   "order_id": "ord-1",
   "outcome": {
    "payout_dollars": 12.0,
    "pnl_dollars": 7.02,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "won",
    "words": "the market settled on the side this row holds"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:00:00+00:00",
   "price_cents": 41.0,
   "row_type": "order",
   "side": "yes",
   "strategy_version": "consensus-maker-v0.1",
   "why": "Fair YES 48.3% (books 48.3% pinnacle, 15m old) vs our bid 41c + 0.4c fee = edge 6.9c ≥ threshold 3.0c.",
   "yes_book_price_cents": 41.0
  },
  {
   "client_order_id": null,
   "competition": "epl",
   "cost_dollars": 1.14,
   "count": 2,
   "day": "2026-11-05",
   "edge": {
    "basis": null,
    "cents": null,
    "cleared": null,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": null,
    "threshold_kind": null
   },
   "env": "demo",
   "fee_dollars": 0.04,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "same_event",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "handover": {
     "account_read_at": null,
     "basis": "the trader's book takes these contracts at the side's bid then (managed.synthetic_fill): its P&L on them counts from that mark",
     "before": null,
     "mark_cents": 45.0,
     "mark_source": "bid",
     "reason": "operator_takeback"
    },
    "status": "not_applicable"
   },
   "id": 15,
   "lifecycle": {
    "avg_fill_price_cents": 45.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 1.14,
    "fill_fees_dollars": 0.04,
    "filled_count": 2,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": "2026-11-05T11:30:00+00:00",
    "last_fill_at": "2026-11-05T11:30:00+00:00",
    "remaining": null,
    "state": "not_applicable",
    "venue_expiry_at": null,
    "words": "a handover row: not an order"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [],
   "order_id": null,
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": -1.14,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "lost",
    "words": "the market settled against the side this row holds"
   },
   "phase": "handover",
   "placed_at": "2026-11-05T11:30:00+00:00",
   "price_cents": 45.0,
   "row_type": "takeback",
   "side": "yes",
   "strategy_version": "trading-managed-v1",
   "why": "Son took 2 YES contracts back; they left the trader's book at 45c (mark: bid).",
   "yes_book_price_cents": 45.0
  },
  {
   "client_order_id": null,
   "competition": "epl",
   "cost_dollars": 2.29,
   "count": 6,
   "day": "2026-11-05",
   "edge": {
    "basis": null,
    "cents": null,
    "cleared": null,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": null,
    "threshold_kind": null
   },
   "env": "demo",
   "fee_dollars": -0.11,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "same_event",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "handover": {
     "account_read_at": null,
     "basis": "the trader's book takes these contracts at the side's bid then (managed.synthetic_fill): its P&L on them counts from that mark",
     "before": null,
     "mark_cents": 40.0,
     "mark_source": "bid",
     "reason": "operator_handover"
    },
    "status": "not_applicable"
   },
   "id": 14,
   "lifecycle": {
    "avg_fill_price_cents": 40.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 2.29,
    "fill_fees_dollars": -0.11,
    "filled_count": 6,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": "2026-11-05T11:00:00+00:00",
    "last_fill_at": "2026-11-05T11:00:00+00:00",
    "remaining": null,
    "state": "not_applicable",
    "venue_expiry_at": null,
    "words": "a handover row: not an order"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [],
   "order_id": null,
   "outcome": {
    "payout_dollars": 6.0,
    "pnl_dollars": 3.71,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "won",
    "words": "the market settled on the side this row holds"
   },
   "phase": "handover",
   "placed_at": "2026-11-05T11:00:00+00:00",
   "price_cents": 40.0,
   "row_type": "handover",
   "side": "yes",
   "strategy_version": "trading-managed-v1",
   "why": "Son handed 6 YES contracts to the trader at the 40c bid (mark: bid).",
   "yes_book_price_cents": 40.0
  },
  {
   "client_order_id": "trv0-mls-1",
   "competition": "mls",
   "cost_dollars": 11.1,
   "count": 22,
   "day": "2026-11-04",
   "edge": {
    "basis": "recorded",
    "cents": 9.56,
    "cleared": true,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.1,
   "fixture": {
    "away": null,
    "home": null,
    "key": null,
    "key_source": null,
    "kickoff_source": null,
    "kickoff_utc": null,
    "label": null,
    "names_source": null
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": "pinnacle",
     "p_side": 0.6,
     "p_yes": 0.4,
     "per_book": null,
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.6,
     "yes": 0.4
    },
    "fee": {
     "order_basis": "computed",
     "order_dollars": 0.1,
     "per_contract_cents": 0.4375
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 50.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": null,
     "path": null,
     "status": "not_recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 25,
   "lifecycle": {
    "avg_fill_price_cents": 50.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 11.1,
    "fill_fees_dollars": 0.1,
    "filled_count": 22,
    "fills": [
     {
      "at": "2026-11-04T12:01:00+00:00",
      "count": 22,
      "fee_dollars": 0.1,
      "price_cents": 50.0,
      "side": "no",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-04T12:01:00+00:00",
    "last_fill_at": "2026-11-04T12:01:00+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": null,
    "words": "every contract filled"
   },
   "market": {
    "contract": "SEA to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "ticker",
    "ticker": "KXMLSGAME-26NOV05SEANSH-SEA"
   },
   "not_recorded": [
    "fixture.key",
    "fixture.kickoff_utc",
    "grounds.consensus.age_s",
    "grounds.consensus.books",
    "grounds.guards",
    "grounds.risk"
   ],
   "order_id": "mls-1",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": -11.1,
    "result": "yes",
    "settled_at": "2026-11-04T15:00:00+00:00",
    "status": "lost",
    "words": "the market settled against the side this row holds"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-04T12:00:00+00:00",
   "price_cents": 50.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "consensus-maker-v0.1",
   "why": "Fair NO 60.0% (books 60.0% pinnacle, age not recorded) vs our bid 50c + 0.4c fee = edge 9.6c ≥ threshold 3.0c.",
   "yes_book_price_cents": 50.0
  },
  {
   "client_order_id": "trv0-old-2",
   "competition": "epl",
   "cost_dollars": 4.98,
   "count": 12,
   "day": "2026-11-03",
   "edge": {
    "basis": null,
    "cents": null,
    "cleared": null,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": null,
    "threshold_kind": null
   },
   "env": "demo",
   "fee_dollars": 0.06,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "same_event",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": null,
     "p_side": null,
     "p_yes": null,
     "per_book": null,
     "status": "not_recorded"
    },
    "fair": {
     "method": null,
     "side": null,
     "yes": null
    },
    "fee": {
     "order_basis": "computed",
     "order_dollars": 0.06,
     "per_contract_cents": 0.4233
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 41.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": null,
     "path": null,
     "status": "not_recorded",
     "version": null
    },
    "status": "not_recorded"
   },
   "id": 28,
   "lifecycle": {
    "avg_fill_price_cents": null,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "filled_count": 0,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": null,
    "last_fill_at": null,
    "remaining": 12,
    "state": "unknown",
    "venue_expiry_at": null,
    "words": "no fill, cancel or expiry is recorded for the rest of it (an old row that recorded no kickoff)"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [
    "edge",
    "grounds.consensus.age_s",
    "grounds.consensus.books",
    "grounds.consensus.method",
    "grounds.consensus.p_yes",
    "grounds.fair",
    "grounds.guards",
    "grounds.risk"
   ],
   "order_id": "old-2",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "not_filled",
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-03T12:00:00+00:00",
   "price_cents": 41.0,
   "row_type": "order",
   "side": "yes",
   "strategy_version": null,
   "why": "Fair not recorded; our bid 41c + 0.4c fee = edge not recorded.",
   "yes_book_price_cents": 41.0
  }
 ],
 "seal": "Son, 2026-10-06, \"Everything, for my bets only\": the results and P&L of the trader's own orders and handed-over contracts, for the operator only. Never exported, archived, or read by research; public routes do not serve it",
 "summary": {
  "by_competition": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "epl",
    "lost": 2,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "mls",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_day": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "2026-11-05",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "over_daily_limit": false,
    "rows": 7,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "2026-11-04",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": true,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "2026-11-03",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": false,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_edge_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "<0",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "2-3",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "3-5",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 40.0,
    "cost_dollars": 20.07,
    "fees_dollars": 0.19,
    "filled": 3,
    "key": "5+",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 3,
    "rows": 3,
    "settled_pnl_dollars": -2.07,
    "unknown": 0,
    "unsettled": 0,
    "won": 2
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "not_recorded",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "not_applicable",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_family": [
   {
    "contracts": 53.0,
    "cost_dollars": 25.02,
    "fees_dollars": 0.14,
    "filled": 6,
    "key": "GAME",
    "lost": 3,
    "not_filled": 2,
    "open_cost_dollars": 0,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": -1.02,
    "unknown": 0,
    "unsettled": 0,
    "won": 3
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "TOTAL",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   }
  ],
  "by_phase": [
   {
    "contracts": 42.0,
    "cost_dollars": 19.64,
    "fees_dollars": 0.2,
    "filled": 3,
    "key": "pre_match",
    "lost": 1,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "rows": 5,
    "settled_pnl_dollars": -4.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 1
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "in_play",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   },
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "protective_exit",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "handover",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_price_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "20-40",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 50.0,
    "cost_dollars": 23.07,
    "fees_dollars": 0.13,
    "filled": 5,
    "key": "40-60",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 4,
    "rows": 6,
    "settled_pnl_dollars": -1.51,
    "unknown": 0,
    "unsettled": 1,
    "won": 2
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "60-80",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 2,
    "rows": 2,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "daily_loss_limit_dollars": 10.0,
  "totals": {
   "contracts": 61.0,
   "cost_dollars": 28.58,
   "fees_dollars": 0.18,
   "filled": 7,
   "key": "all",
   "lost": 3,
   "not_filled": 2,
   "open_cost_dollars": 3.56,
   "orders": 7,
   "rows": 9,
   "settled_pnl_dollars": -1.02,
   "unknown": 0,
   "unsettled": 1,
   "won": 3
  }
 },
 "units": {
  "ages": "seconds",
  "edges": "cents a contract after the maker fee at the order's own price; threshold_cents is the bar it was placed against (a protective exit's is minus its tolerance)",
  "money": "dollars",
  "prices": "cents of the side bought; yes_book_price_cents is the venue's YES-book price (100 - price for a NO buy)",
  "probabilities": "0..1 (`yes` the YES side, `side` the side bought)"
 },
 "version": "trading-ledger-v1",
 "vocab": {
  "outcomes": {
   "lost": "the market settled against the side this row holds",
   "not_filled": "nothing filled: nothing was spent and nothing is owed",
   "unknown": "a fill row could not be read, so what it cost is not known: never shown as a P&L",
   "unsettled": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no",
   "won": "the market settled on the side this row holds"
  },
  "phases": {
   "handover": "Son's filled contracts handed to the trader, taken back, or clipped when he sold them outside it — a row of the trader's book at the mark, not an order",
   "in_play": "an in-play entry: a short-lived maker order on the live engine's price",
   "managed_close": "an in-play exit: buying the side opposite to contracts the trader manages (its own fills and any Son handed over), closing them",
   "pre_match": "a resting maker order before kickoff (T-180..T-10), on the bookmaker consensus or our model blended with it",
   "protective_exit": "an in-play protective exit: buying the other side to get out of a held side when the match is HOT and a goal that hurts it is likely"
  },
  "row_types": {
   "handover": "Son handed filled contracts to the trader: they enter its book at the side's bid then",
   "managed_clip": "Son sold contracts the trader managed outside it: they leave its book at the bid then",
   "order": "an order the trader placed (a `placed` journal row)",
   "takeback": "Son took handed-over contracts back: they leave the trader's book at the bid then"
  },
  "states": {
   "cancelled": "the trader cancelled what had not filled",
   "expired": "Kalshi's own expiry passed with contracts unfilled (T-5 before kickoff, or a minute after an in-play order)",
   "filled": "every contract filled",
   "not_applicable": "a handover row: not an order",
   "resting": "still resting at Kalshi (as far as the journal knows)",
   "unknown": "no fill, cancel or expiry is recorded for the rest of it (an old row that recorded no kickoff)"
  }
 }
};

export const LEDGER_PAGE_1 = {
 "basis": "every order the trader placed, and every handover row of its book, newest first, with the grounds it recorded when it placed it, what became of the order, and its own P&L against the journaled result. Experimental, unproven: an 'edge' is the trader's own estimate at the time, from unvalidated inputs, and a P&L of a few small orders is a record, not a verdict",
 "env": "demo",
 "filters": {
  "competition": null,
  "phase": null,
  "since": null,
  "until": null
 },
 "generated_at": "2026-11-05T16:30:00+00:00",
 "label": "experimental, unproven",
 "not_recorded": "not recorded",
 "page": {
  "has_more": true,
  "limit": 3,
  "matching": 9,
  "offset": 0,
  "returned": 3,
  "scan_complete": true,
  "scan_max": 5000,
  "scanned": 9
 },
 "rows": [
  {
   "client_order_id": "trv0-px-1",
   "competition": "epl",
   "cost_dollars": 1.55,
   "count": 5,
   "day": "2026-11-05",
   "edge": {
    "basis": "computed",
    "cents": -0.3675,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": -1.05,
    "threshold_cents": -2.0,
    "threshold_kind": "exit_tolerance"
   },
   "env": "demo",
   "fee_dollars": 0.05,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_recorded",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": null,
     "p_side": null,
     "p_yes": null,
     "per_book": null,
     "status": "not_applicable"
    },
    "fair": {
     "method": null,
     "side": 0.3,
     "yes": 0.7
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.05,
     "per_contract_cents": 0.3675
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": {
      "danger": 0.231,
      "danger_threshold": 0.2,
      "held_by_agent": 5.0,
      "held_side": "yes",
      "hot_by": [
       "momentum",
       "xg15"
      ],
      "momentum_against": 0.4,
      "rates": "informed",
      "sot15_against": null,
      "tolerance": 0.02,
      "window_min": 10.0,
      "xg15_against": 0.43
     },
     "informed_source": null,
     "minute": 71,
     "model_age_s": null,
     "p_engine": 0.69,
     "p_informed": null,
     "p_tape": null,
     "period": 2,
     "score": [
      1,
      1
     ],
     "signals": {
      "missing": [],
      "momentum": [
       0.3,
       0.7
      ],
      "profile": "commentary",
      "rating_delta": null,
      "sot15": null,
      "xg15": [
       0.05,
       0.48
      ]
     },
     "status": "recorded",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 30.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_applicable",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": "protective_exit",
     "path": "in_play",
     "status": "recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 23,
   "lifecycle": {
    "avg_fill_price_cents": 30.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 1.52,
    "fill_fees_dollars": 0.02,
    "filled_count": 5,
    "fills": [
     {
      "at": "2026-11-05T14:41:10+00:00",
      "count": 5,
      "fee_dollars": 0.02,
      "price_cents": 30.0,
      "side": "no",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T14:41:10+00:00",
    "last_fill_at": "2026-11-05T14:41:10+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T14:42:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [
    "grounds.blend",
    "grounds.guards"
   ],
   "order_id": "px-1",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": -1.52,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "lost",
    "words": "the market settled against the side this row holds"
   },
   "phase": "protective_exit",
   "placed_at": "2026-11-05T14:41:00+00:00",
   "price_cents": 30.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "inplay-maker-v2",
   "why": "Protective exit at minute 71, 1-1: HOT (momentum, xg15) and danger 23.1% ≥ 20.0%; buying NO at 30c to close 5 held YES; fair NO 30.0%, edge -0.4c within the 2.0c tolerance.",
   "yes_book_price_cents": 70.0
  },
  {
   "client_order_id": "trv0-ip-1",
   "competition": "epl",
   "cost_dollars": 4.0,
   "count": 6,
   "day": "2026-11-05",
   "edge": {
    "basis": "computed",
    "cents": 5.6073,
    "cleared": true,
    "gate_basis": "ask",
    "gate_cents": 5.33,
    "threshold_cents": 5.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.04,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": [
      "0.5",
      "0.05"
     ],
     "context": null,
     "source": "blend",
     "status": "recorded",
     "threshold": 5.0,
     "w": 0.5
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": null,
     "p_side": null,
     "p_yes": null,
     "per_book": null,
     "status": "not_applicable"
    },
    "fair": {
     "method": null,
     "side": 0.72,
     "yes": 0.28
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.04,
     "per_contract_cents": 0.3927
    },
    "guards": {
     "anomaly": {
      "assessed": false,
      "avoid": null,
      "exemption": null,
      "score": null,
      "threshold": null,
      "top": null,
      "words": "not assessed (no score for this match)"
     },
     "error": null,
     "news_guard": {
      "applies": false,
      "enabled": null,
      "model_dropped": null,
      "unreadable": null,
      "words": "does not run in play"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": {
      "forecast_source": "ratings_club",
      "source": "ratings_club",
      "w": 0.5,
      "why": null
     },
     "book_verified_age_s": 3.0,
     "exit": null,
     "informed_source": "blend",
     "minute": 38,
     "model_age_s": 12.0,
     "p_engine": 0.29,
     "p_informed": 0.27,
     "p_tape": 0.3,
     "period": 1,
     "score": [
      1,
      0
     ],
     "signals": {
      "missing": [],
      "momentum": [
       0.62,
       0.38
      ],
      "profile": "commentary",
      "rating_delta": null,
      "sot15": null,
      "xg15": [
       0.41,
       0.12
      ]
     },
     "status": "recorded",
     "w": 0.5
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 66.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_applicable",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": null,
       "name": "per_order_cap",
       "passed": null,
       "rule": "max",
       "unit": "dollars",
       "value": 4.0,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 20.0,
       "name": "feed_vouched_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 3.0,
       "words": "when the live feed last vouched for the book"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "model_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 12.0,
       "words": "the live model row's age"
      },
      {
       "exempted": false,
       "limit": 80.0,
       "name": "minute",
       "passed": true,
       "rule": "max",
       "unit": "minute",
       "value": 38.0,
       "words": "the match minute, against the last minute traded"
      },
      {
       "exempted": false,
       "limit": 3.0,
       "name": "inplay_edge",
       "passed": true,
       "rule": "min",
       "unit": "cents",
       "value": 5.33,
       "words": "fair minus the order's price, against the in-play bar"
      }
     ],
     "exemption": null,
     "path": "in_play",
     "status": "recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 20,
   "lifecycle": {
    "avg_fill_price_cents": 66.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 3.99,
    "fill_fees_dollars": 0.03,
    "filled_count": 6,
    "fills": [
     {
      "at": "2026-11-05T14:08:20+00:00",
      "count": 6,
      "fee_dollars": 0.03,
      "price_cents": 66.0,
      "side": "no",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T14:08:20+00:00",
    "last_fill_at": "2026-11-05T14:08:20+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T14:09:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Away to win",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-CHE"
   },
   "not_recorded": [],
   "order_id": "ip-1",
   "outcome": {
    "payout_dollars": 6.0,
    "pnl_dollars": 2.01,
    "result": "no",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "won",
    "words": "the market settled on the side this row holds"
   },
   "phase": "in_play",
   "placed_at": "2026-11-05T14:08:00+00:00",
   "price_cents": 66.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "inplay-maker-v2",
   "why": "Minute 38, 1-0: fair NO 72.0% (engine 29.0%, live-informed 27.0%, w=0.50) vs our bid 66c + 0.4c fee = edge 5.6c ≥ threshold 5.0c.",
   "yes_book_price_cents": 34.0
  },
  {
   "client_order_id": "trv0-v2-1",
   "competition": "epl",
   "cost_dollars": 3.59,
   "count": 8,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 2.83,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": 2.83,
    "threshold_cents": 2.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.07,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": [
      "0.25",
      "0.02"
     ],
     "context": [
      "epl",
      "total"
     ],
     "source": "blend",
     "status": "recorded",
     "threshold": 2.0,
     "w": 0.25
    },
    "consensus": {
     "age_s": 10800.0,
     "books": [
      "Pinnacle",
      "Bet365",
      "Unibet"
     ],
     "captured_at": null,
     "method": "pinnacle",
     "p_side": 0.47,
     "p_yes": 0.47,
     "per_book": {
      "Bet365": 0.465,
      "Pinnacle": 0.47,
      "Unibet": 0.476
     },
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.475,
     "yes": 0.475
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.07,
     "per_contract_cents": 0.4312
    },
    "guards": {
     "anomaly": {
      "assessed": true,
      "avoid": false,
      "exemption": null,
      "score": 0.12,
      "threshold": 0.6,
      "top": null,
      "words": "assessed, below the avoid threshold"
     },
     "error": null,
     "news_guard": {
      "applies": true,
      "enabled": true,
      "model_dropped": null,
      "unreadable": false,
      "words": "clear: no news or market move had overtaken the price"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": 44.0,
     "price_cents": 44.0
    },
    "model": {
     "age_s": 2700.0,
     "captured_at": "2026-11-05T11:20:00+00:00",
     "label": null,
     "model": "ratings_club",
     "p_side": 0.49,
     "p_yes": 0.49,
     "run_id": 41,
     "run_type": "pre_match",
     "source": "served_run",
     "status": "recorded",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": 5.0,
       "name": "per_order_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 3.59,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "per_match_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 8.57,
       "words": "the match's worst case after the order"
      },
      {
       "exempted": false,
       "limit": 50.0,
       "name": "bankroll_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 8.57,
       "words": "the account's worst case after the order, against min(the cap, equity)"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "daily_loss",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss today"
      },
      {
       "exempted": false,
       "limit": 30.0,
       "name": "book_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 4.0,
       "words": "the order book's age"
      },
      {
       "exempted": false,
       "limit": 21600.0,
       "name": "price_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 10800.0,
       "words": "the fair price read's age (the consensus pre-match, the live model in play)"
      },
      {
       "exempted": false,
       "limit": [
        600.0,
        10800.0
       ],
       "name": "window",
       "passed": true,
       "rule": "between",
       "unit": "seconds",
       "value": 5100.0,
       "words": "seconds to kickoff, inside T-180..T-10"
      }
     ],
     "exemption": null,
     "path": "pre_match",
     "status": "recorded",
     "version": "risk-v1"
    },
    "status": "recorded"
   },
   "id": 16,
   "lifecycle": {
    "avg_fill_price_cents": 44.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 3.56,
    "fill_fees_dollars": 0.04,
    "filled_count": 8,
    "fills": [
     {
      "at": "2026-11-05T12:09:00+00:00",
      "count": 8,
      "fee_dollars": 0.04,
      "price_cents": 44.0,
      "side": "yes",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T12:09:00+00:00",
    "last_fill_at": "2026-11-05T12:09:00+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T13:25:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Over 2.5 goals",
    "family": "TOTAL",
    "outcome_key": "over_2_5",
    "outcome_key_source": "recorded",
    "ticker": "KXEPLTOTAL-26NOV05ARSCHE-3"
   },
   "not_recorded": [],
   "order_id": "v2-1",
   "outcome": {
    "payout_dollars": null,
    "pnl_dollars": null,
    "result": null,
    "settled_at": null,
    "status": "unsettled",
    "words": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:05:00+00:00",
   "price_cents": 44.0,
   "row_type": "order",
   "side": "yes",
   "strategy_version": "model-blend-bandit-v2.1",
   "why": "Fair YES 47.5% (books 47.0% pinnacle, 3h old; model 49.0% w=0.25) vs our bid 44c + 0.4c fee = edge 2.8c ≥ threshold 2.0c.",
   "yes_book_price_cents": 44.0
  }
 ],
 "seal": "Son, 2026-10-06, \"Everything, for my bets only\": the results and P&L of the trader's own orders and handed-over contracts, for the operator only. Never exported, archived, or read by research; public routes do not serve it",
 "summary": {
  "by_competition": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "epl",
    "lost": 2,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "mls",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_day": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "2026-11-05",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "over_daily_limit": false,
    "rows": 7,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "2026-11-04",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": true,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "2026-11-03",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": false,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_edge_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "<0",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "2-3",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "3-5",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 40.0,
    "cost_dollars": 20.07,
    "fees_dollars": 0.19,
    "filled": 3,
    "key": "5+",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 3,
    "rows": 3,
    "settled_pnl_dollars": -2.07,
    "unknown": 0,
    "unsettled": 0,
    "won": 2
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "not_recorded",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "not_applicable",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_family": [
   {
    "contracts": 53.0,
    "cost_dollars": 25.02,
    "fees_dollars": 0.14,
    "filled": 6,
    "key": "GAME",
    "lost": 3,
    "not_filled": 2,
    "open_cost_dollars": 0,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": -1.02,
    "unknown": 0,
    "unsettled": 0,
    "won": 3
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "TOTAL",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   }
  ],
  "by_phase": [
   {
    "contracts": 42.0,
    "cost_dollars": 19.64,
    "fees_dollars": 0.2,
    "filled": 3,
    "key": "pre_match",
    "lost": 1,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "rows": 5,
    "settled_pnl_dollars": -4.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 1
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "in_play",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   },
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "protective_exit",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "handover",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_price_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "20-40",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 50.0,
    "cost_dollars": 23.07,
    "fees_dollars": 0.13,
    "filled": 5,
    "key": "40-60",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 4,
    "rows": 6,
    "settled_pnl_dollars": -1.51,
    "unknown": 0,
    "unsettled": 1,
    "won": 2
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "60-80",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 2,
    "rows": 2,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "daily_loss_limit_dollars": 10.0,
  "totals": {
   "contracts": 61.0,
   "cost_dollars": 28.58,
   "fees_dollars": 0.18,
   "filled": 7,
   "key": "all",
   "lost": 3,
   "not_filled": 2,
   "open_cost_dollars": 3.56,
   "orders": 7,
   "rows": 9,
   "settled_pnl_dollars": -1.02,
   "unknown": 0,
   "unsettled": 1,
   "won": 3
  }
 },
 "units": {
  "ages": "seconds",
  "edges": "cents a contract after the maker fee at the order's own price; threshold_cents is the bar it was placed against (a protective exit's is minus its tolerance)",
  "money": "dollars",
  "prices": "cents of the side bought; yes_book_price_cents is the venue's YES-book price (100 - price for a NO buy)",
  "probabilities": "0..1 (`yes` the YES side, `side` the side bought)"
 },
 "version": "trading-ledger-v1",
 "vocab": {
  "outcomes": {
   "lost": "the market settled against the side this row holds",
   "not_filled": "nothing filled: nothing was spent and nothing is owed",
   "unknown": "a fill row could not be read, so what it cost is not known: never shown as a P&L",
   "unsettled": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no",
   "won": "the market settled on the side this row holds"
  },
  "phases": {
   "handover": "Son's filled contracts handed to the trader, taken back, or clipped when he sold them outside it — a row of the trader's book at the mark, not an order",
   "in_play": "an in-play entry: a short-lived maker order on the live engine's price",
   "managed_close": "an in-play exit: buying the side opposite to contracts the trader manages (its own fills and any Son handed over), closing them",
   "pre_match": "a resting maker order before kickoff (T-180..T-10), on the bookmaker consensus or our model blended with it",
   "protective_exit": "an in-play protective exit: buying the other side to get out of a held side when the match is HOT and a goal that hurts it is likely"
  },
  "row_types": {
   "handover": "Son handed filled contracts to the trader: they enter its book at the side's bid then",
   "managed_clip": "Son sold contracts the trader managed outside it: they leave its book at the bid then",
   "order": "an order the trader placed (a `placed` journal row)",
   "takeback": "Son took handed-over contracts back: they leave the trader's book at the bid then"
  },
  "states": {
   "cancelled": "the trader cancelled what had not filled",
   "expired": "Kalshi's own expiry passed with contracts unfilled (T-5 before kickoff, or a minute after an in-play order)",
   "filled": "every contract filled",
   "not_applicable": "a handover row: not an order",
   "resting": "still resting at Kalshi (as far as the journal knows)",
   "unknown": "no fill, cancel or expiry is recorded for the rest of it (an old row that recorded no kickoff)"
  }
 }
};

export const LEDGER_PAGE_2 = {
 "basis": "every order the trader placed, and every handover row of its book, newest first, with the grounds it recorded when it placed it, what became of the order, and its own P&L against the journaled result. Experimental, unproven: an 'edge' is the trader's own estimate at the time, from unvalidated inputs, and a P&L of a few small orders is a record, not a verdict",
 "env": "demo",
 "filters": {
  "competition": null,
  "phase": null,
  "since": null,
  "until": null
 },
 "generated_at": "2026-11-05T16:30:00+00:00",
 "label": "experimental, unproven",
 "not_recorded": "not recorded",
 "page": {
  "has_more": true,
  "limit": 3,
  "matching": 9,
  "offset": 3,
  "returned": 3,
  "scan_complete": true,
  "scan_max": 5000,
  "scanned": 9
 },
 "rows": [
  {
   "client_order_id": "trv0-tie-1",
   "competition": "epl",
   "cost_dollars": 3.52,
   "count": 5,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 4.66,
    "cleared": true,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.02,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": null,
     "books": null,
     "captured_at": null,
     "method": "pinnacle",
     "p_side": 0.75,
     "p_yes": 0.25,
     "per_book": null,
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.75,
     "yes": 0.25
    },
    "fee": {
     "order_basis": "computed",
     "order_dollars": 0.02,
     "per_contract_cents": 0.3675
    },
    "guards": {
     "anomaly": null,
     "error": null,
     "news_guard": null,
     "status": "not_recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": null,
     "ceiling_cents": null,
     "maker_no_cents": null,
     "maker_yes_cents": null,
     "price_cents": 70.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [],
     "exemption": null,
     "path": null,
     "status": "not_recorded",
     "version": null
    },
    "status": "recorded"
   },
   "id": 18,
   "lifecycle": {
    "avg_fill_price_cents": null,
    "cancels": [
     {
      "at": "2026-11-05T12:06:00+00:00",
      "outcome": "cancelled",
      "reason": "edge_gone",
      "words": "The order's OWN edge — the side's fair price minus the resting price minus the maker fee there, never the ask — is under the threshold it was placed at (v0: MIN_EDGE; v2: the arm's recorded threshold…"
     }
    ],
    "cancels_total": 1,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "filled_count": 0,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": null,
    "last_fill_at": null,
    "remaining": 5,
    "state": "cancelled",
    "venue_expiry_at": null,
    "words": "the trader cancelled what had not filled"
   },
   "market": {
    "contract": "Tie",
    "family": "GAME",
    "outcome_key": "draw",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-TIE"
   },
   "not_recorded": [
    "grounds.consensus.age_s",
    "grounds.consensus.books",
    "grounds.guards",
    "grounds.risk"
   ],
   "order_id": "tie-1",
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "result": null,
    "settled_at": null,
    "status": "not_filled",
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:02:00+00:00",
   "price_cents": 70.0,
   "row_type": "order",
   "side": "no",
   "strategy_version": "consensus-maker-v0.1",
   "why": "Fair NO 75.0% (books 75.0% pinnacle, age not recorded) vs our bid 70c + 0.4c fee = edge 4.7c ≥ threshold 3.0c.",
   "yes_book_price_cents": 30.0
  },
  {
   "client_order_id": "trv0-580945d3-2d90-5ae7-9509-658c8b054b5e",
   "competition": "epl",
   "cost_dollars": 4.98,
   "count": 12,
   "day": "2026-11-05",
   "edge": {
    "basis": "recorded",
    "cents": 6.8525,
    "cleared": true,
    "gate_basis": "maker",
    "gate_cents": 6.8525,
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge"
   },
   "env": "demo",
   "fee_dollars": 0.06,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "recorded",
    "kickoff_source": "recorded",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "blend": {
     "arm": null,
     "context": null,
     "source": null,
     "status": "not_used",
     "threshold": null,
     "w": null
    },
    "consensus": {
     "age_s": 900.0,
     "books": [
      "Pinnacle"
     ],
     "captured_at": "2026-11-05T11:45:00+00:00",
     "method": "pinnacle",
     "p_side": 0.482759,
     "p_yes": 0.482759,
     "per_book": {
      "Pinnacle": 0.482759
     },
     "status": "recorded"
    },
    "fair": {
     "method": "pinnacle",
     "side": 0.482759,
     "yes": 0.482759
    },
    "fee": {
     "order_basis": "recorded",
     "order_dollars": 0.06,
     "per_contract_cents": 0.4233
    },
    "guards": {
     "anomaly": {
      "assessed": true,
      "avoid": false,
      "exemption": null,
      "score": null,
      "threshold": 1.0,
      "top": null,
      "words": "assessed: no component could be scored, so not avoided"
     },
     "error": null,
     "news_guard": {
      "applies": true,
      "enabled": true,
      "model_dropped": null,
      "unreadable": false,
      "words": "clear: no news or market move had overtaken the price"
     },
     "status": "recorded"
    },
    "handover": null,
    "in_play": {
     "anchor": null,
     "book_verified_age_s": null,
     "exit": null,
     "informed_source": null,
     "minute": null,
     "model_age_s": null,
     "p_engine": null,
     "p_informed": null,
     "p_tape": null,
     "period": null,
     "score": null,
     "signals": null,
     "status": "not_applicable",
     "w": null
    },
    "maker": {
     "book": {
      "no": {
       "ask": 60.0,
       "bid": 55.0
      },
      "yes": {
       "ask": 45.0,
       "bid": 40.0
      }
     },
     "ceiling_cents": 41.0,
     "maker_no_cents": 56.0,
     "maker_yes_cents": 41.0,
     "price_cents": 41.0
    },
    "model": {
     "age_s": null,
     "captured_at": null,
     "label": null,
     "model": null,
     "p_side": null,
     "p_yes": null,
     "run_id": null,
     "run_type": null,
     "source": null,
     "status": "not_used",
     "why_absent": null
    },
    "risk": {
     "checks": [
      {
       "exempted": false,
       "limit": 5.0,
       "name": "per_order_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the order's cost with its fee, against $5 an order"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "per_match_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the match's worst case after the order"
      },
      {
       "exempted": false,
       "limit": 50.0,
       "name": "bankroll_cap",
       "passed": true,
       "rule": "max",
       "unit": "dollars",
       "value": 4.98,
       "words": "the account's worst case after the order, against min(the cap, equity)"
      },
      {
       "exempted": false,
       "limit": 10.0,
       "name": "daily_loss",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss today"
      },
      {
       "exempted": false,
       "limit": 25.0,
       "name": "drawdown",
       "passed": true,
       "rule": "below",
       "unit": "dollars",
       "value": 0.0,
       "words": "the trader's own loss since its starting point"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "book_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 0.0,
       "words": "the order book's age"
      },
      {
       "exempted": false,
       "limit": 21600.0,
       "name": "price_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 900.0,
       "words": "the fair price read's age (the consensus pre-match, the live model in play)"
      },
      {
       "exempted": false,
       "limit": 60.0,
       "name": "account_age",
       "passed": true,
       "rule": "max",
       "unit": "seconds",
       "value": 0.0,
       "words": "the account snapshot's age"
      },
      {
       "exempted": false,
       "limit": [
        600.0,
        10800.0
       ],
       "name": "window",
       "passed": true,
       "rule": "between",
       "unit": "seconds",
       "value": 5400.0,
       "words": "seconds to kickoff, inside T-180..T-10"
      }
     ],
     "exemption": null,
     "path": "pre_match",
     "status": "recorded",
     "version": "trading-risk-v0"
    },
    "status": "recorded"
   },
   "id": 4,
   "lifecycle": {
    "avg_fill_price_cents": 41.0,
    "cancels": [
     {
      "at": "2026-11-05T15:00:00+00:00",
      "outcome": "cancelled",
      "reason": "in_play",
      "words": "The match has kicked off: pre-match trading is closed."
     }
    ],
    "cancels_total": 1,
    "fill_cost_dollars": 4.98,
    "fill_fees_dollars": 0.06,
    "filled_count": 12,
    "fills": [
     {
      "at": "2026-11-05T12:00:40+00:00",
      "count": 12,
      "fee_dollars": 0.06,
      "price_cents": 41.0,
      "side": "yes",
      "taker": false,
      "terms_basis": "venue"
     }
    ],
    "fills_readable": true,
    "fills_total": 1,
    "first_fill_at": "2026-11-05T12:00:40+00:00",
    "last_fill_at": "2026-11-05T12:00:40+00:00",
    "remaining": 0,
    "state": "filled",
    "venue_expiry_at": "2026-11-05T13:25:00+00:00",
    "words": "every contract filled"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [],
   "order_id": "ord-1",
   "outcome": {
    "payout_dollars": 12.0,
    "pnl_dollars": 7.02,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "won",
    "words": "the market settled on the side this row holds"
   },
   "phase": "pre_match",
   "placed_at": "2026-11-05T12:00:00+00:00",
   "price_cents": 41.0,
   "row_type": "order",
   "side": "yes",
   "strategy_version": "consensus-maker-v0.1",
   "why": "Fair YES 48.3% (books 48.3% pinnacle, 15m old) vs our bid 41c + 0.4c fee = edge 6.9c ≥ threshold 3.0c.",
   "yes_book_price_cents": 41.0
  },
  {
   "client_order_id": null,
   "competition": "epl",
   "cost_dollars": 1.14,
   "count": 2,
   "day": "2026-11-05",
   "edge": {
    "basis": null,
    "cents": null,
    "cleared": null,
    "gate_basis": null,
    "gate_cents": null,
    "threshold_cents": null,
    "threshold_kind": null
   },
   "env": "demo",
   "fee_dollars": 0.04,
   "fixture": {
    "away": "Synthetic Away",
    "home": "Synthetic Home",
    "key": "live:7",
    "key_source": "same_event",
    "kickoff_source": "fixture",
    "kickoff_utc": "2026-11-05T13:30:00+00:00",
    "label": "Synthetic Home v Synthetic Away",
    "names_source": "match_archive"
   },
   "grounds": {
    "handover": {
     "account_read_at": null,
     "basis": "the trader's book takes these contracts at the side's bid then (managed.synthetic_fill): its P&L on them counts from that mark",
     "before": null,
     "mark_cents": 45.0,
     "mark_source": "bid",
     "reason": "operator_takeback"
    },
    "status": "not_applicable"
   },
   "id": 15,
   "lifecycle": {
    "avg_fill_price_cents": 45.0,
    "cancels": [],
    "cancels_total": 0,
    "fill_cost_dollars": 1.14,
    "fill_fees_dollars": 0.04,
    "filled_count": 2,
    "fills": [],
    "fills_readable": true,
    "fills_total": 0,
    "first_fill_at": "2026-11-05T11:30:00+00:00",
    "last_fill_at": "2026-11-05T11:30:00+00:00",
    "remaining": null,
    "state": "not_applicable",
    "venue_expiry_at": null,
    "words": "a handover row: not an order"
   },
   "market": {
    "contract": "Synthetic Home to win",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "ticker": "KXEPLGAME-26NOV05ARSCHE-ARS"
   },
   "not_recorded": [],
   "order_id": null,
   "outcome": {
    "payout_dollars": 0.0,
    "pnl_dollars": -1.14,
    "result": "yes",
    "settled_at": "2026-11-05T15:00:00+00:00",
    "status": "lost",
    "words": "the market settled against the side this row holds"
   },
   "phase": "handover",
   "placed_at": "2026-11-05T11:30:00+00:00",
   "price_cents": 45.0,
   "row_type": "takeback",
   "side": "yes",
   "strategy_version": "trading-managed-v1",
   "why": "Son took 2 YES contracts back; they left the trader's book at 45c (mark: bid).",
   "yes_book_price_cents": 45.0
  }
 ],
 "seal": "Son, 2026-10-06, \"Everything, for my bets only\": the results and P&L of the trader's own orders and handed-over contracts, for the operator only. Never exported, archived, or read by research; public routes do not serve it",
 "summary": {
  "by_competition": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "epl",
    "lost": 2,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "mls",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_day": [
   {
    "contracts": 39.0,
    "cost_dollars": 17.48,
    "fees_dollars": 0.08,
    "filled": 6,
    "key": "2026-11-05",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "over_daily_limit": false,
    "rows": 7,
    "settled_pnl_dollars": 10.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 3
   },
   {
    "contracts": 22.0,
    "cost_dollars": 11.1,
    "fees_dollars": 0.1,
    "filled": 1,
    "key": "2026-11-04",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": true,
    "rows": 1,
    "settled_pnl_dollars": -11.1,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "2026-11-03",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "over_daily_limit": false,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   }
  ],
  "by_edge_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "<0",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "2-3",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "3-5",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 40.0,
    "cost_dollars": 20.07,
    "fees_dollars": 0.19,
    "filled": 3,
    "key": "5+",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 3,
    "rows": 3,
    "settled_pnl_dollars": -2.07,
    "unknown": 0,
    "unsettled": 0,
    "won": 2
   },
   {
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "filled": 0,
    "key": "not_recorded",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "not_applicable",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_family": [
   {
    "contracts": 53.0,
    "cost_dollars": 25.02,
    "fees_dollars": 0.14,
    "filled": 6,
    "key": "GAME",
    "lost": 3,
    "not_filled": 2,
    "open_cost_dollars": 0,
    "orders": 6,
    "rows": 8,
    "settled_pnl_dollars": -1.02,
    "unknown": 0,
    "unsettled": 0,
    "won": 3
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.56,
    "fees_dollars": 0.04,
    "filled": 1,
    "key": "TOTAL",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 3.56,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 0,
    "unknown": 0,
    "unsettled": 1,
    "won": 0
   }
  ],
  "by_phase": [
   {
    "contracts": 42.0,
    "cost_dollars": 19.64,
    "fees_dollars": 0.2,
    "filled": 3,
    "key": "pre_match",
    "lost": 1,
    "not_filled": 2,
    "open_cost_dollars": 3.56,
    "orders": 5,
    "rows": 5,
    "settled_pnl_dollars": -4.08,
    "unknown": 0,
    "unsettled": 1,
    "won": 1
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "in_play",
    "lost": 0,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   },
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "protective_exit",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 8.0,
    "cost_dollars": 3.43,
    "fees_dollars": -0.07,
    "filled": 2,
    "key": "handover",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 0,
    "rows": 2,
    "settled_pnl_dollars": 2.57,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "by_price_bucket": [
   {
    "contracts": 5.0,
    "cost_dollars": 1.52,
    "fees_dollars": 0.02,
    "filled": 1,
    "key": "20-40",
    "lost": 1,
    "not_filled": 0,
    "open_cost_dollars": 0,
    "orders": 1,
    "rows": 1,
    "settled_pnl_dollars": -1.52,
    "unknown": 0,
    "unsettled": 0,
    "won": 0
   },
   {
    "contracts": 50.0,
    "cost_dollars": 23.07,
    "fees_dollars": 0.13,
    "filled": 5,
    "key": "40-60",
    "lost": 2,
    "not_filled": 1,
    "open_cost_dollars": 3.56,
    "orders": 4,
    "rows": 6,
    "settled_pnl_dollars": -1.51,
    "unknown": 0,
    "unsettled": 1,
    "won": 2
   },
   {
    "contracts": 6.0,
    "cost_dollars": 3.99,
    "fees_dollars": 0.03,
    "filled": 1,
    "key": "60-80",
    "lost": 0,
    "not_filled": 1,
    "open_cost_dollars": 0,
    "orders": 2,
    "rows": 2,
    "settled_pnl_dollars": 2.01,
    "unknown": 0,
    "unsettled": 0,
    "won": 1
   }
  ],
  "daily_loss_limit_dollars": 10.0,
  "totals": {
   "contracts": 61.0,
   "cost_dollars": 28.58,
   "fees_dollars": 0.18,
   "filled": 7,
   "key": "all",
   "lost": 3,
   "not_filled": 2,
   "open_cost_dollars": 3.56,
   "orders": 7,
   "rows": 9,
   "settled_pnl_dollars": -1.02,
   "unknown": 0,
   "unsettled": 1,
   "won": 3
  }
 },
 "units": {
  "ages": "seconds",
  "edges": "cents a contract after the maker fee at the order's own price; threshold_cents is the bar it was placed against (a protective exit's is minus its tolerance)",
  "money": "dollars",
  "prices": "cents of the side bought; yes_book_price_cents is the venue's YES-book price (100 - price for a NO buy)",
  "probabilities": "0..1 (`yes` the YES side, `side` the side bought)"
 },
 "version": "trading-ledger-v1",
 "vocab": {
  "outcomes": {
   "lost": "the market settled against the side this row holds",
   "not_filled": "nothing filled: nothing was spent and nothing is owed",
   "unknown": "a fill row could not be read, so what it cost is not known: never shown as a P&L",
   "unsettled": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no",
   "won": "the market settled on the side this row holds"
  },
  "phases": {
   "handover": "Son's filled contracts handed to the trader, taken back, or clipped when he sold them outside it — a row of the trader's book at the mark, not an order",
   "in_play": "an in-play entry: a short-lived maker order on the live engine's price",
   "managed_close": "an in-play exit: buying the side opposite to contracts the trader manages (its own fills and any Son handed over), closing them",
   "pre_match": "a resting maker order before kickoff (T-180..T-10), on the bookmaker consensus or our model blended with it",
   "protective_exit": "an in-play protective exit: buying the other side to get out of a held side when the match is HOT and a goal that hurts it is likely"
  },
  "row_types": {
   "handover": "Son handed filled contracts to the trader: they enter its book at the side's bid then",
   "managed_clip": "Son sold contracts the trader managed outside it: they leave its book at the bid then",
   "order": "an order the trader placed (a `placed` journal row)",
   "takeback": "Son took handed-over contracts back: they leave the trader's book at the bid then"
  },
  "states": {
   "cancelled": "the trader cancelled what had not filled",
   "expired": "Kalshi's own expiry passed with contracts unfilled (T-5 before kickoff, or a minute after an in-play order)",
   "filled": "every contract filled",
   "not_applicable": "a handover row: not an order",
   "resting": "still resting at Kalshi (as far as the journal knows)",
   "unknown": "no fill, cancel or expiry is recorded for the rest of it (an old row that recorded no kickoff)"
  }
 }
};

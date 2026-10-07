// THE LEDGER'S WOULD-BE RESULTS, RECORDED FROM THE BACKEND (2026-10-07,
// branch ledger-would-be @c743fdb8 of SonNguyen2914/TRIVELA).
//
// What GET /api/admin/trading/ledger (trading-ledger-v1.1,
// src/trading/ledger.py) returned in the backend's own hermetic test world
// (tests/test_trading_ledger_would_be.py's helpers on tests/_trading_seed.py's
// EPL fixture, FakeKalshi, a throwaway SQLite live plane; no network, no
// real account, market or result). Eight rows:
//   - ord-1: a v0 order filled 12 @ 41c, settled YES: REAL, won +$7.02;
//   - wb-won: 12 YES @ 41c cancelled (edge_gone), never filled — the
//     market settled YES: would have WON +$7.02 (not money);
//   - wb-lost: 8 NO @ 57c cancelled (cancel_t_minus_5): would have LOST;
//   - wb-part: 12 YES @ 41c on the TIE leg, 5 FILLED then cancelled
//     (stale_consensus); TIE settled NO: the real 5 lost, and the
//     unfilled 7 would have lost too;
//   - wb-pend: cancelled by the news guard, no result yet: pending;
//   - wb-post: cancelled (careful_swap), its match postponed;
//   - wb-void: cancelled (kill_switch), the market void: no result;
//   - wb-exp: left to Kalshi's expiry, no result yet: pending.
// The results pass (careful_run.order_results_pass) wrote the would-be
// rows it could; the postponed and void rows were journaled in the shape
// that pass writes. Every field below was produced by the backend's own
// ledger.view through the real route — nothing here was typed by hand.
// EXPERIMENTAL, UNPROVEN. NOT MONEY: a `would_be` is never a P&L.

export const LEDGER_WOULD_BE = {
 "version": "trading-ledger-v1.1",
 "label": "experimental, unproven",
 "env": "demo",
 "generated_at": "2026-11-06T15:26:00+00:00",
 "basis": "every order the trader placed, and every handover row of its book, newest first, with the grounds it recorded when it placed it, what became of the order, and its own P&L against the journaled result. Experimental, unproven: an 'edge' is the trader's own estimate at the time, from unvalidated inputs, and a P&L of a few small orders is a record, not a verdict",
 "seal": "Son, 2026-10-06, \"Everything, for my bets only\": the results and P&L of the trader's own orders and handed-over contracts, for the operator only: never exported to research or archives, never read by research or training, and public routes do not serve it; the operator's own CSV download is allowed",
 "not_recorded": "not recorded",
 "filters": {
  "since": null,
  "until": null,
  "competition": null,
  "phase": null
 },
 "page": {
  "limit": 200,
  "offset": 0,
  "returned": 8,
  "matching": 8,
  "has_more": false,
  "scanned": 8,
  "scan_max": 5000,
  "scan_complete": true
 },
 "vocab": {
  "phases": {
   "pre_match": "a resting maker order before kickoff (T-180..T-10), on the bookmaker consensus or our model blended with it",
   "in_play": "an in-play entry: a short-lived maker order on the live engine's price",
   "protective_exit": "an in-play protective exit: buying the other side to get out of a held side when the match is HOT and a goal that hurts it is likely",
   "managed_close": "an in-play exit: buying the side opposite to contracts the trader manages (its own fills and any Son handed over), closing them",
   "handover": "Son's filled contracts handed to the trader, taken back, or clipped when he sold them outside it — a row of the trader's book at the mark, not an order"
  },
  "row_types": {
   "order": "an order the trader placed (a `placed` journal row)",
   "handover": "Son handed filled contracts to the trader: they enter its book at the side's bid then",
   "takeback": "Son took handed-over contracts back: they leave the trader's book at the bid then",
   "managed_clip": "Son sold contracts the trader managed outside it: they leave its book at the bid then"
  },
  "states": {
   "filled": "every contract filled",
   "resting": "still resting at Kalshi (as far as the journal knows)",
   "cancelled": "the trader cancelled what had not filled",
   "expired": "Kalshi's own expiry passed with contracts unfilled (T-5 before kickoff, or a minute after an in-play order)",
   "unknown": "no fill, cancel or expiry is recorded for the rest of it (an old row that recorded no kickoff)",
   "not_applicable": "a handover row: not an order"
  },
  "outcomes": {
   "won": "the market settled on the side this row holds",
   "lost": "the market settled against the side this row holds",
   "unsettled": "filled, and the market has no journaled result yet: the trader books it only once Kalshi's settlement data says yes or no",
   "not_filled": "nothing filled: nothing was spent and nothing is owed",
   "unknown": "a fill row could not be read, so what it cost is not known: never shown as a P&L"
  },
  "would_be": {
   "won": "had the unfilled contracts filled at the order's price, the market's verified result says they would have won",
   "lost": "had the unfilled contracts filled at the order's price, the market's verified result says they would have lost",
   "pending": "the market has no result the journal holds yet",
   "no_result": "the market ended with no yes / no (void, scalar), or nothing answered within 3 days: never guessed",
   "postponed": "the match was not played at the order's kickoff: no result is read for it"
  },
  "reason_groups": {
   "edge_gone": "the edge was gone at the order's own price",
   "cancel_t_minus_5": "the kickoff rule: T-5, in play, outside the window or no kickoff known",
   "budget": "a loss halt, or room made for a better bet (the careful swap, an unproven weight over its cap)",
   "shard": "the exchange shard's balance",
   "stale": "a price read too old or gone: the consensus, the book, the fair price or the live feed",
   "news_guard": "the news guard: news or a market move overtook the price",
   "expired": "Kalshi's own expiry passed with the contracts unfilled",
   "other": "anything else the journal names: a kill, a shock, anomaly avoidance, a takeback, a market gone"
  }
 },
 "units": {
  "probabilities": "0..1 (`yes` the YES side, `side` the side bought)",
  "prices": "cents of the side bought; yes_book_price_cents is the venue's YES-book price (100 - price for a NO buy)",
  "edges": "cents a contract after the maker fee at the order's own price; threshold_cents is the bar it was placed against (a protective exit's is minus its tolerance)",
  "money": "dollars",
  "ages": "seconds",
  "would_be": "a row's `would_be` is NOT money: what its unfilled contracts would have made, never in a total"
 },
 "summary": {
  "totals": {
   "key": "all",
   "rows": 8,
   "orders": 8,
   "filled": 2,
   "contracts": 17.0,
   "cost_dollars": 7.06,
   "fees_dollars": 0.09,
   "settled_pnl_dollars": 4.94,
   "open_cost_dollars": 0,
   "won": 1,
   "lost": 1,
   "unsettled": 0,
   "not_filled": 6,
   "unknown": 0,
   "complete": true,
   "note": null
  },
  "daily_loss_limit_dollars": 10.0,
  "by_competition": [
   {
    "key": "epl",
    "rows": 8,
    "orders": 8,
    "filled": 2,
    "contracts": 17.0,
    "cost_dollars": 7.06,
    "fees_dollars": 0.09,
    "settled_pnl_dollars": 4.94,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 6,
    "unknown": 0,
    "complete": true,
    "note": null
   }
  ],
  "by_family": [
   {
    "key": "GAME",
    "rows": 8,
    "orders": 8,
    "filled": 2,
    "contracts": 17.0,
    "cost_dollars": 7.06,
    "fees_dollars": 0.09,
    "settled_pnl_dollars": 4.94,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 6,
    "unknown": 0,
    "complete": true,
    "note": null
   }
  ],
  "by_phase": [
   {
    "key": "pre_match",
    "rows": 8,
    "orders": 8,
    "filled": 2,
    "contracts": 17.0,
    "cost_dollars": 7.06,
    "fees_dollars": 0.09,
    "settled_pnl_dollars": 4.94,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 6,
    "unknown": 0,
    "complete": true,
    "note": null
   }
  ],
  "by_price_bucket": [
   {
    "key": "20-40",
    "rows": 2,
    "orders": 2,
    "filled": 0,
    "contracts": 0,
    "cost_dollars": 0,
    "fees_dollars": 0,
    "settled_pnl_dollars": 0,
    "open_cost_dollars": 0,
    "won": 0,
    "lost": 0,
    "unsettled": 0,
    "not_filled": 2,
    "unknown": 0,
    "complete": true,
    "note": null
   },
   {
    "key": "40-60",
    "rows": 6,
    "orders": 6,
    "filled": 2,
    "contracts": 17.0,
    "cost_dollars": 7.06,
    "fees_dollars": 0.09,
    "settled_pnl_dollars": 4.94,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 4,
    "unknown": 0,
    "complete": true,
    "note": null
   }
  ],
  "by_edge_bucket": [
   {
    "key": "5+",
    "rows": 1,
    "orders": 1,
    "filled": 1,
    "contracts": 12.0,
    "cost_dollars": 4.98,
    "fees_dollars": 0.06,
    "settled_pnl_dollars": 7.02,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 0,
    "unsettled": 0,
    "not_filled": 0,
    "unknown": 0,
    "complete": true,
    "note": null
   },
   {
    "key": "not_recorded",
    "rows": 7,
    "orders": 7,
    "filled": 1,
    "contracts": 5.0,
    "cost_dollars": 2.08,
    "fees_dollars": 0.03,
    "settled_pnl_dollars": -2.08,
    "open_cost_dollars": 0,
    "won": 0,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 6,
    "unknown": 0,
    "complete": true,
    "note": null
   }
  ],
  "by_day": [
   {
    "key": "2026-11-06",
    "rows": 8,
    "orders": 8,
    "filled": 2,
    "contracts": 17.0,
    "cost_dollars": 7.06,
    "fees_dollars": 0.09,
    "settled_pnl_dollars": 4.94,
    "open_cost_dollars": 0,
    "won": 1,
    "lost": 1,
    "unsettled": 0,
    "not_filled": 6,
    "unknown": 0,
    "over_daily_limit": false,
    "complete": true,
    "note": null
   }
  ]
 },
 "would_be_summary": {
  "label": "not a real result: this order never filled",
  "real_money": false,
  "basis": "orders that ended cancelled or expired with contracts unfilled: what those contracts would have made at the order's own price, the fee included, against the market's verified result. Not money: never in the totals, the P&L, the halts, the budget or the learner",
  "totals": {
   "key": "all",
   "orders": 7,
   "cancelled": 6,
   "expired": 1,
   "contracts": 45.0,
   "won": 1,
   "lost": 2,
   "pending": 2,
   "no_result": 1,
   "postponed": 1,
   "pnl_dollars": -0.48
  },
  "by_reason": [
   {
    "key": "cancel_t_minus_5",
    "group": "cancel_t_minus_5",
    "words": "An unfilled agent order is cancelled five minutes before kickoff (Son's rule): v0 holds only what filled, and never rests in play.",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 8.0,
    "won": 0,
    "lost": 1,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": -4.6
   },
   {
    "key": "careful_swap",
    "group": "budget",
    "words": "a loss halt, or room made for a better bet (the careful swap, an unproven weight over its cap)",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 4.0,
    "won": 0,
    "lost": 0,
    "pending": 0,
    "no_result": 0,
    "postponed": 1,
    "pnl_dollars": 0
   },
   {
    "key": "edge_gone",
    "group": "edge_gone",
    "words": "The order's OWN edge — the side's fair price minus the resting price minus the maker fee there, never the ask — is under the threshold it was placed at (v0: MIN_EDGE; v2: the arm's recorded threshold…",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 12.0,
    "won": 1,
    "lost": 0,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 7.02
   },
   {
    "key": "kill_switch",
    "group": "other",
    "words": "TRADING_KILL is set.",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 3.0,
    "won": 0,
    "lost": 0,
    "pending": 0,
    "no_result": 1,
    "postponed": 0,
    "pnl_dollars": 0
   },
   {
    "key": "market_moved_since_consensus",
    "group": "news_guard",
    "words": "Kalshi's price for this match moved 4c or more since the bookmaker odds we price on. Held back until fresher odds; a close still goes.",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 6.0,
    "won": 0,
    "lost": 0,
    "pending": 1,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 0
   },
   {
    "key": "stale_consensus",
    "group": "stale",
    "words": "The consensus (fair-price) read is older than TRADING_CONSENSUS_MAX_AGE_SECONDS (a model-only read: older than MODEL_ONLY_MAX_AGE_SECONDS, 90 min), or absent.",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 7.0,
    "won": 0,
    "lost": 1,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": -2.9
   },
   {
    "key": "venue_expired",
    "group": "expired",
    "words": "Kalshi's own expiry passed with the contracts unfilled",
    "orders": 1,
    "cancelled": 0,
    "expired": 1,
    "contracts": 5.0,
    "won": 0,
    "lost": 0,
    "pending": 1,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 0
   }
  ],
  "by_group": [
   {
    "key": "edge_gone",
    "words": "the edge was gone at the order's own price",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 12.0,
    "won": 1,
    "lost": 0,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 7.02
   },
   {
    "key": "cancel_t_minus_5",
    "words": "the kickoff rule: T-5, in play, outside the window or no kickoff known",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 8.0,
    "won": 0,
    "lost": 1,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": -4.6
   },
   {
    "key": "budget",
    "words": "a loss halt, or room made for a better bet (the careful swap, an unproven weight over its cap)",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 4.0,
    "won": 0,
    "lost": 0,
    "pending": 0,
    "no_result": 0,
    "postponed": 1,
    "pnl_dollars": 0
   },
   {
    "key": "stale",
    "words": "a price read too old or gone: the consensus, the book, the fair price or the live feed",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 7.0,
    "won": 0,
    "lost": 1,
    "pending": 0,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": -2.9
   },
   {
    "key": "news_guard",
    "words": "the news guard: news or a market move overtook the price",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 6.0,
    "won": 0,
    "lost": 0,
    "pending": 1,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 0
   },
   {
    "key": "expired",
    "words": "Kalshi's own expiry passed with the contracts unfilled",
    "orders": 1,
    "cancelled": 0,
    "expired": 1,
    "contracts": 5.0,
    "won": 0,
    "lost": 0,
    "pending": 1,
    "no_result": 0,
    "postponed": 0,
    "pnl_dollars": 0
   },
   {
    "key": "other",
    "words": "anything else the journal names: a kill, a shock, anomaly avoidance, a takeback, a market gone",
    "orders": 1,
    "cancelled": 1,
    "expired": 0,
    "contracts": 3.0,
    "won": 0,
    "lost": 0,
    "pending": 0,
    "no_result": 1,
    "postponed": 0,
    "pnl_dollars": 0
   }
  ],
  "groups": {
   "edge_gone": "the edge was gone at the order's own price",
   "cancel_t_minus_5": "the kickoff rule: T-5, in play, outside the window or no kickoff known",
   "budget": "a loss halt, or room made for a better bet (the careful swap, an unproven weight over its cap)",
   "shard": "the exchange shard's balance",
   "stale": "a price read too old or gone: the consensus, the book, the fair price or the live feed",
   "news_guard": "the news guard: news or a market move overtook the price",
   "expired": "Kalshi's own expiry passed with the contracts unfilled",
   "other": "anything else the journal names: a kill, a shock, anomaly avoidance, a takeback, a market gone"
  }
 },
 "rows": [
  {
   "id": 28,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-CHE",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Away to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 30.0,
   "yes_book_price_cents": 30.0,
   "count": 5,
   "cost_dollars": 4.98,
   "fee_dollars": 0.02,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-exp",
   "client_order_id": "trv0-wb-exp",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 30.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.3675,
     "order_dollars": 0.02,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "expired",
    "words": "Kalshi's own expiry passed with contracts unfilled (T-5 before kickoff, or a minute after an in-play order)",
    "filled_count": 0,
    "remaining": 5,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [],
    "cancels_total": 0,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": null,
    "settled_at": null,
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 30c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "pending",
    "words": "the market has no result the journal holds yet",
    "result": null,
    "contracts": 5,
    "price_cents": 30.0,
    "fee_dollars": 0.02,
    "pnl_dollars": null,
    "source": null,
    "state": "expired",
    "cancel_reason": "venue_expired",
    "reason_group": "expired",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 5 contracts never filled (expired at Kalshi); the market has no result yet."
   }
  },
  {
   "id": 26,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-CHE",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Away to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 22.0,
   "yes_book_price_cents": 22.0,
   "count": 3,
   "cost_dollars": 4.98,
   "fee_dollars": 0.01,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-void",
   "client_order_id": "trv0-wb-void",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 22.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.3003,
     "order_dollars": 0.01,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 0,
    "remaining": 3,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "kill_switch",
      "outcome": "cancelled",
      "words": "TRADING_KILL is set."
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": null,
    "settled_at": null,
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 22c + 0.3c fee = edge not recorded.",
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
   "would_be": {
    "status": "no_result",
    "words": "the market ended with no yes / no (void, scalar), or nothing answered within 3 days: never guessed",
    "result": null,
    "contracts": 3,
    "price_cents": 22.0,
    "fee_dollars": 0.01,
    "pnl_dollars": null,
    "source": "public_market",
    "state": "cancelled",
    "cancel_reason": "kill_switch",
    "reason_group": "other",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 3 contracts never filled (cancelled: kill_switch); the market ended with no yes / no result."
   }
  },
  {
   "id": 24,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-CHE",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Away to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 41.0,
   "yes_book_price_cents": 41.0,
   "count": 4,
   "cost_dollars": 4.98,
   "fee_dollars": 0.02,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-post",
   "client_order_id": "trv0-wb-post",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 41.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.4233,
     "order_dollars": 0.02,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 0,
    "remaining": 4,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "careful_swap",
      "outcome": "cancelled",
      "words": null
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": null,
    "settled_at": null,
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 41c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "postponed",
    "words": "the match was not played at the order's kickoff: no result is read for it",
    "result": null,
    "contracts": 4,
    "price_cents": 41.0,
    "fee_dollars": 0.02,
    "pnl_dollars": null,
    "source": "fixture_check",
    "state": "cancelled",
    "cancel_reason": "careful_swap",
    "reason_group": "budget",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 4 contracts never filled (cancelled: careful_swap); the match was postponed, so no result is read."
   }
  },
  {
   "id": 22,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-CHE",
    "family": "GAME",
    "outcome_key": "away_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Away to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 41.0,
   "yes_book_price_cents": 41.0,
   "count": 6,
   "cost_dollars": 4.98,
   "fee_dollars": 0.03,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-pend",
   "client_order_id": "trv0-wb-pend",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 41.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.4233,
     "order_dollars": 0.03,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 0,
    "remaining": 6,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "market_moved_since_consensus",
      "outcome": "cancelled",
      "words": "Kalshi's price for this match moved 4c or more since the bookmaker odds we price on. Held back until fresher odds; a close still goes."
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": null,
    "settled_at": null,
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 41c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "pending",
    "words": "the market has no result the journal holds yet",
    "result": null,
    "contracts": 6,
    "price_cents": 41.0,
    "fee_dollars": 0.03,
    "pnl_dollars": null,
    "source": null,
    "state": "cancelled",
    "cancel_reason": "market_moved_since_consensus",
    "reason_group": "news_guard",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 6 contracts never filled (cancelled: market_moved_since_consensus); the market has no result yet."
   }
  },
  {
   "id": 18,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-TIE",
    "family": "GAME",
    "outcome_key": "draw",
    "outcome_key_source": "market_contract",
    "contract": "Tie"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 41.0,
   "yes_book_price_cents": 41.0,
   "count": 12,
   "cost_dollars": 4.98,
   "fee_dollars": 0.06,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-part",
   "client_order_id": "trv0-wb-part",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 41.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.4233,
     "order_dollars": 0.06,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 5,
    "remaining": 7,
    "avg_fill_price_cents": 41.0,
    "fill_cost_dollars": 2.08,
    "fill_fees_dollars": 0.03,
    "first_fill_at": "2026-11-06T12:01:00+00:00",
    "last_fill_at": "2026-11-06T12:01:00+00:00",
    "fills": [
     {
      "at": "2026-11-06T12:01:00+00:00",
      "count": 5,
      "price_cents": 41.0,
      "fee_dollars": 0.03,
      "side": "yes",
      "terms_basis": "venue",
      "taker": false,
      "corrected": false,
      "correction_id": null
     }
    ],
    "fills_total": 1,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "stale_consensus",
      "outcome": "cancelled",
      "words": "The consensus (fair-price) read is older than TRADING_CONSENSUS_MAX_AGE_SECONDS (a model-only read: older than MODEL_ONLY_MAX_AGE_SECONDS, 90 min), or absent."
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "lost",
    "result": "no",
    "settled_at": "2026-11-06T15:00:00+00:00",
    "payout_dollars": 0.0,
    "pnl_dollars": -2.08,
    "words": "the market settled against the side this row holds"
   },
   "why": "Fair not recorded; our bid 41c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "lost",
    "words": "had the unfilled contracts filled at the order's price, the market's verified result says they would have lost",
    "result": "no",
    "contracts": 7,
    "price_cents": 41.0,
    "fee_dollars": 0.03,
    "pnl_dollars": -2.9,
    "source": "journal_settled",
    "state": "cancelled",
    "cancel_reason": "stale_consensus",
    "reason_group": "stale",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 7 contracts never filled (cancelled: stale_consensus). At 41c and a $0.03 fee they would have lost −$2.90: the market settled NO."
   }
  },
  {
   "id": 16,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-ARS",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Home to win"
   },
   "row_type": "order",
   "side": "no",
   "price_cents": 57.0,
   "yes_book_price_cents": 43.0,
   "count": 8,
   "cost_dollars": 4.98,
   "fee_dollars": 0.04,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-lost",
   "client_order_id": "trv0-wb-lost",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 57.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.4289,
     "order_dollars": 0.04,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 0,
    "remaining": 8,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "cancel_t_minus_5",
      "outcome": "cancelled",
      "words": "An unfilled agent order is cancelled five minutes before kickoff (Son's rule): v0 holds only what filled, and never rests in play."
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": "yes",
    "settled_at": "2026-11-06T15:00:00+00:00",
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 57c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "lost",
    "words": "had the unfilled contracts filled at the order's price, the market's verified result says they would have lost",
    "result": "yes",
    "contracts": 8,
    "price_cents": 57.0,
    "fee_dollars": 0.04,
    "pnl_dollars": -4.6,
    "source": "journal_settled",
    "state": "cancelled",
    "cancel_reason": "cancel_t_minus_5",
    "reason_group": "cancel_t_minus_5",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 8 contracts never filled (cancelled: cancel_t_minus_5). At 57c and a $0.04 fee they would have lost −$4.60: the market settled YES."
   }
  },
  {
   "id": 14,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-ARS",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Home to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 41.0,
   "yes_book_price_cents": 41.0,
   "count": 12,
   "cost_dollars": 4.98,
   "fee_dollars": 0.06,
   "phase": "pre_match",
   "strategy_version": null,
   "order_id": "wb-won",
   "client_order_id": "trv0-wb-won",
   "edge": {
    "cents": null,
    "basis": null,
    "threshold_cents": null,
    "threshold_kind": null,
    "cleared": null,
    "gate_cents": null,
    "gate_basis": null
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": null,
     "side": null,
     "method": null,
     "basis": null
    },
    "consensus": {
     "status": "not_recorded",
     "p_yes": null,
     "p_side": null,
     "method": null,
     "captured_at": null,
     "age_s": null,
     "books": null,
     "per_book": null
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 41.0,
     "maker_yes_cents": null,
     "maker_no_cents": null,
     "ceiling_cents": null,
     "book": null
    },
    "fee": {
     "per_contract_cents": 0.4233,
     "order_dollars": 0.06,
     "order_basis": "computed"
    },
    "guards": {
     "status": "not_recorded",
     "news_guard": null,
     "anomaly": null,
     "error": null
    },
    "risk": {
     "status": "not_recorded",
     "path": null,
     "checks": [],
     "exemption": null,
     "version": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "cancelled",
    "words": "the trader cancelled what had not filled",
    "filled_count": 0,
    "remaining": 12,
    "avg_fill_price_cents": null,
    "fill_cost_dollars": 0.0,
    "fill_fees_dollars": 0.0,
    "first_fill_at": null,
    "last_fill_at": null,
    "fills": [],
    "fills_total": 0,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T12:02:00+00:00",
      "reason": "edge_gone",
      "outcome": "cancelled",
      "words": "The order's OWN edge — the side's fair price minus the resting price minus the maker fee there, never the ask — is under the threshold it was placed at (v0: MIN_EDGE; v2: the arm's recorded threshold…"
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "not_filled",
    "result": "yes",
    "settled_at": "2026-11-06T15:00:00+00:00",
    "payout_dollars": 0.0,
    "pnl_dollars": 0.0,
    "words": "nothing filled: nothing was spent and nothing is owed"
   },
   "why": "Fair not recorded; our bid 41c + 0.4c fee = edge not recorded.",
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
   "would_be": {
    "status": "won",
    "words": "had the unfilled contracts filled at the order's price, the market's verified result says they would have won",
    "result": "yes",
    "contracts": 12,
    "price_cents": 41.0,
    "fee_dollars": 0.06,
    "pnl_dollars": 7.02,
    "source": "journal_settled",
    "state": "cancelled",
    "cancel_reason": "edge_gone",
    "reason_group": "edge_gone",
    "real_money": false,
    "label": "not a real result: this order never filled",
    "why": "Not a real result: 12 contracts never filled (cancelled: edge_gone). At 41c and a $0.06 fee they would have won +$7.02: the market settled YES."
   }
  },
  {
   "id": 4,
   "placed_at": "2026-11-06T12:00:00+00:00",
   "day": "2026-11-06",
   "env": "demo",
   "competition": "epl",
   "fixture": {
    "key": "live:7",
    "key_source": "recorded",
    "home": "Synthetic Home",
    "away": "Synthetic Away",
    "names_source": "match_archive",
    "label": "Synthetic Home v Synthetic Away",
    "kickoff_utc": "2026-11-06T13:30:00+00:00",
    "kickoff_source": "recorded"
   },
   "market": {
    "ticker": "KXEPLGAME-26NOV06ARSCHE-ARS",
    "family": "GAME",
    "outcome_key": "home_win",
    "outcome_key_source": "market_contract",
    "contract": "Synthetic Home to win"
   },
   "row_type": "order",
   "side": "yes",
   "price_cents": 41.0,
   "yes_book_price_cents": 41.0,
   "count": 12,
   "cost_dollars": 4.98,
   "fee_dollars": 0.06,
   "phase": "pre_match",
   "strategy_version": "consensus-maker-v0.1",
   "order_id": "ord-1",
   "client_order_id": "trv0-427311ae-6908-571f-98e4-eb5b673172c4",
   "edge": {
    "cents": 6.8525,
    "basis": "recorded",
    "threshold_cents": 3.0,
    "threshold_kind": "min_edge",
    "cleared": true,
    "gate_cents": 6.8525,
    "gate_basis": "maker"
   },
   "grounds": {
    "status": "recorded",
    "fair": {
     "yes": 0.482759,
     "side": 0.482759,
     "method": "pinnacle",
     "basis": "recorded"
    },
    "consensus": {
     "status": "recorded",
     "p_yes": 0.482759,
     "p_side": 0.482759,
     "method": "pinnacle",
     "captured_at": "2026-11-06T11:45:00+00:00",
     "age_s": 900.0,
     "books": [
      "Pinnacle"
     ],
     "per_book": {
      "Pinnacle": 0.482759
     }
    },
    "model": {
     "status": "not_used",
     "p_yes": null,
     "p_side": null,
     "source": null,
     "model": null,
     "run_id": null,
     "run_type": null,
     "captured_at": null,
     "age_s": null,
     "label": null,
     "why_absent": null
    },
    "blend": {
     "status": "not_used",
     "w": null,
     "source": null,
     "arm": null,
     "context": null,
     "threshold": null
    },
    "in_play": {
     "status": "not_applicable",
     "minute": null,
     "period": null,
     "score": null,
     "p_engine": null,
     "p_tape": null,
     "p_informed": null,
     "informed_source": null,
     "w": null,
     "anchor": null,
     "signals": null,
     "exit": null,
     "model_age_s": null,
     "book_verified_age_s": null
    },
    "maker": {
     "price_cents": 41.0,
     "maker_yes_cents": 41.0,
     "maker_no_cents": 56.0,
     "ceiling_cents": 41.0,
     "book": {
      "yes": {
       "bid": 40.0,
       "ask": 45.0
      },
      "no": {
       "bid": 55.0,
       "ask": 60.0
      }
     }
    },
    "fee": {
     "per_contract_cents": 0.4233,
     "order_dollars": 0.06,
     "order_basis": "recorded"
    },
    "guards": {
     "status": "recorded",
     "news_guard": {
      "applies": true,
      "enabled": true,
      "unreadable": false,
      "model_dropped": null,
      "words": "clear: no news or market move had overtaken the price"
     },
     "anomaly": {
      "assessed": true,
      "avoid": false,
      "score": null,
      "threshold": 1.0,
      "top": null,
      "exemption": null,
      "words": "assessed: no component could be scored, so not avoided"
     },
     "error": null
    },
    "risk": {
     "status": "recorded",
     "version": "trading-risk-v0",
     "path": "pre_match",
     "checks": [
      {
       "name": "per_order_cap",
       "words": "the order's cost with its fee, against $5 an order",
       "value": 4.98,
       "limit": 5.0,
       "unit": "dollars",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "per_match_cap",
       "words": "the match's worst case after the order",
       "value": 4.98,
       "limit": 10.0,
       "unit": "dollars",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "bankroll_cap",
       "words": "the account's worst case after the order, against min(the cap, equity)",
       "value": 4.98,
       "limit": 50.0,
       "unit": "dollars",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "daily_loss",
       "words": "the trader's own loss today",
       "value": 0.0,
       "limit": 10.0,
       "unit": "dollars",
       "rule": "below",
       "passed": true,
       "exempted": false
      },
      {
       "name": "drawdown",
       "words": "the trader's own loss since its starting point",
       "value": 0.0,
       "limit": 25.0,
       "unit": "dollars",
       "rule": "below",
       "passed": true,
       "exempted": false
      },
      {
       "name": "book_age",
       "words": "the order book's age",
       "value": 0.0,
       "limit": 60.0,
       "unit": "seconds",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "price_age",
       "words": "the fair price read's age (the consensus pre-match, the live model in play)",
       "value": 900.0,
       "limit": 21600.0,
       "unit": "seconds",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "account_age",
       "words": "the account snapshot's age",
       "value": 0.0,
       "limit": 60.0,
       "unit": "seconds",
       "rule": "max",
       "passed": true,
       "exempted": false
      },
      {
       "name": "window",
       "words": "seconds to kickoff, inside T-180..T-10",
       "value": 5400.0,
       "limit": [
        600.0,
        10800.0
       ],
       "unit": "seconds",
       "rule": "between",
       "passed": true,
       "exempted": false
      }
     ],
     "exemption": null
    },
    "handover": null,
    "careful": null
   },
   "lifecycle": {
    "state": "filled",
    "words": "every contract filled",
    "filled_count": 12,
    "remaining": 0,
    "avg_fill_price_cents": 41.0,
    "fill_cost_dollars": 4.98,
    "fill_fees_dollars": 0.06,
    "first_fill_at": "2026-11-06T12:00:40+00:00",
    "last_fill_at": "2026-11-06T12:00:40+00:00",
    "fills": [
     {
      "at": "2026-11-06T12:00:40+00:00",
      "count": 12,
      "price_cents": 41.0,
      "fee_dollars": 0.06,
      "side": "yes",
      "terms_basis": "venue",
      "taker": false,
      "corrected": false,
      "correction_id": null
     }
    ],
    "fills_total": 1,
    "fills_readable": true,
    "cancels": [
     {
      "at": "2026-11-06T15:00:00+00:00",
      "reason": "in_play",
      "outcome": "cancelled",
      "words": "The match has kicked off: pre-match trading is closed."
     }
    ],
    "cancels_total": 1,
    "venue_expiry_at": "2026-11-06T13:25:00+00:00"
   },
   "outcome": {
    "status": "won",
    "result": "yes",
    "settled_at": "2026-11-06T15:00:00+00:00",
    "payout_dollars": 12.0,
    "pnl_dollars": 7.02,
    "words": "the market settled on the side this row holds"
   },
   "why": "Fair YES 48.3% (books 48.3% pinnacle, 15m old) vs our bid 41c + 0.4c fee = edge 6.9c ≥ threshold 3.0c.",
   "not_recorded": [],
   "would_be": null
  }
 ]
} as const;

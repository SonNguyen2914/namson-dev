// THE OPERATOR CONSOLE'S CONTRACT, RECORDED FROM THE INTEGRATED BACKEND
// (2026-10-05, branch mon-integration of SonNguyen2914/TRIVELA).
//
// These three payloads are what GET /api/admin/trading/candidates, /status
// and /book returned in the integrated backend's own tests (hermetic,
// synthetic fixtures; no real account, market or result):
//   - CANDIDATES_RECORDED and STATUS_RECORDED: a Bundesliga leg traded in
//     play at minute 38, its engine number re-run from the in-play ANCHOR
//     (w 0.5 on our UNVALIDATED ratings-model forecast, the rest the
//     market's T-10 price) — tests/test_inplay_everywhere.py's bridged
//     in-play world;
//   - BOOK_RECORDED: 10 YES held in play, valued at the feed's 50c bid —
//     tests/test_trading_console_inplay.py's live-value world.
// Every timestamp is re-based on now (`at(seconds)` from the recording
// instant), so nothing here pins a calendar date; the tickers keep the
// synthetic fixtures' own date codes. Prices are EXPERIMENTAL, UNPROVEN.
//
// The point: e2e/ops-trading-contract.spec.ts serves these as sent, so a
// field the page reads under another name or type fails there.

const at = (seconds: number) =>
  new Date(Date.now() + seconds * 1000).toISOString();

export const CANDIDATES_RECORDED = {
  "actions": {
    "error": "one market raised; the tick went on without it",
    "failed": "an approved order the order path could not place",
    "not_eligible": "the catalogue held the market back before any strategy saw it",
    "not_run": "the strategy could not run on this tick (a halt, the kill switch, a failed account read, no live feed)",
    "placed": "an order the venue accepted this tick",
    "proposed": "proposed, and nothing more was recorded about it",
    "refused": "the risk engine refused the strategy's intent",
    "skipped": "the strategy considered the market and declined it"
  },
  "age_s": 5.0,
  "arms_in_use": {
    "in_play_anchor": {
      "bundesliga": {
        "0.5 (ratings_club)": 1
      }
    },
    "in_play_entry": {
      "bundesliga": {
        "0.5/0.05": 1
      }
    },
    "in_play_exit": {},
    "pre_match": {}
  },
  "basis": "what the trader's newest tick considered, market by market, and what it decided: the strategy's own inputs. Experimental, unproven; our models' prices are unvalidated. Current and upcoming markets only: a market the catalogue no longer lists as trading is never served, and no result, settlement or P&L is in it",
  "bounds": {
    "bytes": 24576,
    "journal_every_s": 60,
    "rows": 80,
    "serve_max_age_s": 600
  },
  "by_competition": {
    "afcon": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "bundesliga": {
      "assessed": 3,
      "decided": 3,
      "eligible": 0,
      "in_play_markets": 3,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 1
    },
    "cnl": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "epl": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "eredivisie": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "laliga": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "ligamx": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "ligue1": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "mls": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "seriea": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    },
    "unl": {
      "assessed": 0,
      "decided": 0,
      "eligible": 0,
      "in_play_markets": 0,
      "in_scope": true,
      "in_window_held_back": 0,
      "model_priced": 0,
      "placed": 0
    }
  },
  "columns": [
    "ticker",
    "title",
    "competition",
    "family",
    "phase",
    "kickoff_utc",
    "minute",
    "p_model",
    "p_consensus",
    "w",
    "fair",
    "fair_method",
    "yes_bid",
    "yes_ask",
    "no_bid",
    "no_ask",
    "maker_yes",
    "maker_no",
    "edge_yes",
    "edge_no",
    "edge_basis",
    "threshold",
    "inplay",
    "decision",
    "minutes_to_kickoff"
  ],
  "complete": true,
  "considered": 3,
  "decided": 3,
  "env": "demo",
  "generated_at": at(0),
  "inplay_note": null,
  "label": "experimental, unproven",
  "not_served": 0,
  "omitted": {},
  "outcome": "traded",
  "rows": [
    {
      "competition": "bundesliga",
      "decision": {
        "action": "placed",
        "count": 15,
        "detail": null,
        "price_cents": 31,
        "reason": "created",
        "side": "yes",
        "words": "Placed: yes at 31c x 15, resting as a maker order."
      },
      "edge_basis": "maker",
      "edge_no": -5.36,
      "edge_yes": 7.59,
      "fair": 0.3897,
      "fair_method": null,
      "family": "GAME",
      "inplay": {
        "anchor": {
          "source": "ratings_club",
          "w": 0.5,
          "why": null
        },
        "danger_no": null,
        "danger_yes": null,
        "exit": null,
        "extras_error": false,
        "held_side": null,
        "hot_by_no": [],
        "hot_by_yes": [],
        "hot_no": false,
        "hot_yes": false,
        "informed_source": "refused",
        "minute": 38,
        "mode": "entry",
        "momentum": [
          0.1,
          0.1
        ],
        "p_engine": 0.3897,
        "p_informed": null,
        "period": "running",
        "xg15": [
          0.1,
          0.1
        ]
      },
      "kickoff_utc": at(-2405),
      "maker_no": 66,
      "maker_yes": 31,
      "minute": 38,
      "minutes_to_kickoff": null,
      "no_ask": 70,
      "no_bid": 65,
      "p_consensus": null,
      "p_model": null,
      "phase": "in_play",
      "threshold": 5,
      "ticker": "KXBUNDESLIGAGAME-26NOV04BMUBVB-BMU",
      "title": "Synthetic KXBUNDESLIGAGAME-26NOV04BMUBVB-BMU? · Bayern Munich",
      "w": 0.0,
      "yes_ask": 35,
      "yes_bid": 30
    },
    {
      "competition": "bundesliga",
      "decision": {
        "action": "skipped",
        "count": null,
        "detail": "vouched for Nones ago, stale True",
        "price_cents": null,
        "reason": "inplay_book_stale",
        "side": null,
        "words": "The live book was not vouched for recently."
      },
      "edge_basis": null,
      "edge_no": null,
      "edge_yes": null,
      "fair": 0.2571,
      "fair_method": null,
      "family": "GAME",
      "inplay": {
        "anchor": null,
        "danger_no": null,
        "danger_yes": null,
        "exit": null,
        "extras_error": false,
        "held_side": null,
        "hot_by_no": [],
        "hot_by_yes": [],
        "hot_no": false,
        "hot_yes": false,
        "informed_source": null,
        "minute": 38,
        "mode": null,
        "momentum": [
          0.1,
          0.1
        ],
        "p_engine": 0.2571,
        "p_informed": null,
        "period": "running",
        "xg15": [
          0.1,
          0.1
        ]
      },
      "kickoff_utc": at(-2405),
      "maker_no": null,
      "maker_yes": null,
      "minute": 38,
      "minutes_to_kickoff": null,
      "no_ask": null,
      "no_bid": null,
      "p_consensus": null,
      "p_model": null,
      "phase": "in_play",
      "threshold": null,
      "ticker": "KXBUNDESLIGAGAME-26NOV04BMUBVB-BVB",
      "title": "Synthetic KXBUNDESLIGAGAME-26NOV04BMUBVB-BVB? · Borussia Dortmund",
      "w": null,
      "yes_ask": null,
      "yes_bid": null
    },
    {
      "competition": "bundesliga",
      "decision": {
        "action": "skipped",
        "count": null,
        "detail": "vouched for Nones ago, stale True",
        "price_cents": null,
        "reason": "inplay_book_stale",
        "side": null,
        "words": "The live book was not vouched for recently."
      },
      "edge_basis": null,
      "edge_no": null,
      "edge_yes": null,
      "fair": 0.4136,
      "fair_method": null,
      "family": "GAME",
      "inplay": {
        "anchor": null,
        "danger_no": null,
        "danger_yes": null,
        "exit": null,
        "extras_error": false,
        "held_side": null,
        "hot_by_no": [],
        "hot_by_yes": [],
        "hot_no": null,
        "hot_yes": false,
        "informed_source": null,
        "minute": 38,
        "mode": null,
        "momentum": [
          0.1,
          0.1
        ],
        "p_engine": 0.4136,
        "p_informed": null,
        "period": "running",
        "xg15": [
          0.1,
          0.1
        ]
      },
      "kickoff_utc": at(-2405),
      "maker_no": null,
      "maker_yes": null,
      "minute": 38,
      "minutes_to_kickoff": null,
      "no_ask": null,
      "no_bid": null,
      "p_consensus": null,
      "p_model": null,
      "phase": "in_play",
      "threshold": null,
      "ticker": "KXBUNDESLIGAGAME-26NOV04BMUBVB-TIE",
      "title": "Synthetic KXBUNDESLIGAGAME-26NOV04BMUBVB-TIE?",
      "w": null,
      "yes_ask": null,
      "yes_bid": null
    }
  ],
  "served": 3,
  "shown": 3,
  "source": "process",
  "stale": false,
  "strategy": {
    "in_play": "inplay-maker-v2",
    "pre_match": "model-blend-bandit-v2.1"
  },
  "tick_at": at(-5),
  "tick_id": "20261104T141000Z-dabe41ea",
  "units": {
    "edges": "cents a contract after the maker fee; edge_basis 'maker' is fair minus the price we would rest at, 'ask' is fair minus the ask (in play v1)",
    "prices": "cents",
    "probabilities": "0..1, the YES side",
    "threshold": "cents"
  },
  "version": "trading-candidates-v1"
};

export const STATUS_RECORDED = {
  "account_at": at(-5),
  "account_read_at": at(-5),
  "balance": "50",
  "bankroll_cap": "50",
  "daily_loss": {
    "limit": "10",
    "used": "0"
  },
  "drawdown": {
    "limit": "25",
    "used": "0"
  },
  "enabled": true,
  "env": "demo",
  "fill_reads": {
    "basis": "every fill of an agent order is journaled at its OWN order's side and limit price (post-only: a resting order trades at its own price, on its own direction); `own_order_*` counts rows where the venue row was unreadable or disagreed, `unreadable_unknown_order` rows the P&L still takes at $1 a contract, never paid out",
    "by_direction_basis": {},
    "by_terms_basis": {},
    "legacy_words_disagreed": 0,
    "today": 0,
    "total": 0,
    "unreadable": 0,
    "unreadable_today": 0
  },
  "fills_today": 0,
  "generated_at": at(0),  // the route stamps its own clock; re-based to the read
  "halt": {
    "active": false,
    "rearm": null,
    "reason": null,
    "since": null
  },
  "handed_over_contracts": "0",
  "handover": {
    "at": at(-5),
    "basis": "Son's handed-over contracts the trader manages as its own, the trader's own, and Son's manual ones, from the newest reconcile; clips are contracts sold outside the trader that left its book",
    "clips": 0,
    "clips_pending": 0,
    "handed_markets": 0,
    "handed_over_contracts": "0",
    "label": "experimental, unproven",
    "managed_contracts": "0",
    "managed_markets": 0,
    "manual_contracts": "3",
    "outcome": "ok",
    "risk_lowering_closes_today": 0
  },
  "in_play": {
    "at": at(-5),
    "basis": "the agent's positions in fixtures that have kicked off and not settled: how many, what they cost, and what they would fetch sold into the LIVE Kalshi bids (each read at most every 30 s, used for 2 minutes; less the taker fee). Reporting only: the halts count them AT COST until they settle (Son's option 2), and nothing is placed in play",
    "cost": "0",
    "last_live_update_at": null,
    "live_mark_total": "0",
    "live_state_at": null,
    "marked": 0,
    "positions": 0,
    "unmarked": 0
  },
  "in_play_trading": {
    "active": true,
    "at": at(-5),
    "cancelled_today": 0,
    "cooldowns_active": 0,
    "enabled": true,
    "feed_available": true,
    "feed_healthy": true,
    "feed_subscriptions": 3,
    "global_cooldown": false,
    "label": "experimental, unproven",
    "legs_in_play": 3,
    "orders_open": 1,
    "outcome": "decided",
    "placed_today": 1,
    "pnl": {
      "basis": "the in-play orders' own fills: settled markets at their verified result, unsettled ones at cost",
      "cost": "0",
      "settled": "0",
      "share_of_agent_pnl": null
    },
    "shocks_today": {},
    "strategy": "inplay-maker-v1",
    "v2": {
      "active": true,
      "anchor_rewards": 0,
      "arms_in_use": {
        "anchor": {
          "bundesliga": {
            "0.5 (ratings_club)": 1
          }
        },
        "at": at(-5),
        "entry": {
          "bundesliga": {
            "0.5/0.05": 1
          }
        },
        "exit": {}
      },
      "at": at(-5),
      "enabled": true,
      "entries_cancelled_today": 0,
      "entries_placed_today": 1,
      "exit_rewards": 0,
      "exits_placed_today": 0,
      "informed_available_legs": 0,
      "inplay_clv_rewards": 0,
      "label": "experimental, unproven",
      "marks_today": 0,
      "mean_anchor_reward_c": null,
      "mean_exit_reward_c": null,
      "mean_inplay_clv_c": null,
      "pnl_rewards": 0,
      "protective_exits_cancelled_today": 0,
      "protective_exits_placed_today": 0,
      "protective_exits_refused_today": 0,
      "strategy": "inplay-maker-v2",
      "w_mean": "0"
    }
  },
  "kill": false,
  "label": "experimental, unproven",
  "last_tick": {
    "at": at(-5),
    "elapsed_s": 0.0,
    "outcome": "traded",
    "schedule": {
      "interval_s": 15,
      "overran": false,
      "skipped_runs_before": 0,
      "wall_s": 0.269
    }
  },
  "learning": {
    "arms_in_use": {
      "at": at(-5),
      "pre_match": {}
    },
    "at": at(-5),
    "best_arm_by_competition": {},
    "candidates": 0,
    "competitions": [
      "epl",
      "laliga",
      "mls",
      "ligamx",
      "bundesliga",
      "seriea",
      "ligue1",
      "eredivisie",
      "unl",
      "cnl",
      "afcon"
    ],
    "default_arm": {
      "threshold": "0.02",
      "w": "0.5"
    },
    "enabled": true,
    "fills_rewarded_by_competition": {},
    "label": "experimental, unproven",
    "mean_clv_c": null,
    "mean_clv_c_by_competition": {},
    "model_only_markets": 0,
    "model_priced_fixtures": 0,
    "model_priced_markets": 0,
    "ratings_model": {
      "label": "unvalidated — experimental, unproven",
      "priced_fixtures": 0,
      "priced_markets": 0,
      "version": "ratings-poisson-v1"
    },
    "reward_basis": "CLV in cents per contract after fees (the side's last stored mid before kickoff, market data only), weight 1; settled P&L per contract, weight 0.25",
    "strategy": "model-blend-bandit-v2.1",
    "trades_by_competition": {},
    "version": "trading-learner-v2"
  },
  "managed_at": at(-5),
  "managed_markets": 0,
  "marked_equity": "50",
  "open_agent_orders": 0,
  "open_other_orders": 0,
  "placed_today": 1,
  "pnl": {
    "agent_basis": "the AGENT'S OWN P&L from its journal: its fills (fees included) and the verified settlements of its positions; an unsettled position at a fresh bid, never above cost, and at 0 with no fresh bid. No deposit, withdrawal or trade of Son's enters it. What the halts measure",
    "agent_since_start": "0",
    "agent_total": "0",
    "realized_basis": "Kalshi's realized_pnl summed over every position row the venue served at the last reconcile — account-wide, Son's manual trades included; null when any row lacked it. Reporting only: no halt reads it",
    "realized_total": "0"
  },
  "risk_lowering_closes_today": 0,
  "settlement_reads": {
    "asked": 0,
    "basis": "the settlement read of every held market that stopped trading (GET /portfolio/settlements, the RESULT only): only `settled` credits a market; `not_listed`, `unknown_result` and `refused` leave it valued at 0 and ask again later",
    "due": 0,
    "latest": {
      "at": at(-5),
      "outcome": "nothing_held"
    },
    "not_listed": 0,
    "passes": {
      "nothing_held": 1
    },
    "refused": 0,
    "settled": 0,
    "settled_rows_today": 0,
    "unknown_result": 0,
    "window_since": at(-5),
    "window_ticks": 1
  },
  "strategy": "consensus-maker-v0.1",
  "today": {
    "by_kind": {
      "candidates": 1,
      "day_anchor": 1,
      "placed": 1,
      "skipped": 2,
      "starting_balance": 1,
      "tick": 1
    },
    "by_reason": {
      "candidates": {
        "candidates_snapshot": 1
      },
      "placed": {
        "created": 1
      },
      "skipped": {
        "inplay_book_stale": 2
      },
      "tick": {
        "traded": 1
      }
    }
  },
  "total_at_risk": "1.2000",
  "total_limit": "50",
  "universe": {
    "catalogue": {
      "last_full_refresh_at": at(-7805),
      "max_rows": 150000,
      "rows": 3
    },
    "eligible": 0,
    "fixture_unmapped_by_why": {},
    "in_scope": 3,
    "known": 3,
    "known_by_category": {
      "Sports": 3
    },
    "no_fair_price_by_why": {},
    "not_catalogued": {
      "multivariate_combos": "GET /events leaves out multivariate (combo) events per Kalshi's documentation (demo smoke 2026-10-02: 0 KXMVE events among 14,552), so on-demand parlay markets are not in the catalogue"
    },
    "priced": 3,
    "refusals_by_reason": {
      "in_play": 3
    },
    "version": "trading-universe-v0"
  },
  "universe_at": at(-5),
  "universe_enabled": false,
  "version": "trading-status-v0"
};

export const BOOK_RECORDED = {
  "account_read_at": at(-1025),
  "generated_at": at(-1020),
  "label": "experimental, unproven",
  "live_value_basis": "DISPLAY ONLY, experimental: what each position would fetch sold into its LIVE best bid now, less the taker fee rounded up to the cent (risk.liquidation_value's rule), against its cost (Kalshi's market_exposure plus the fees paid). In play the bid is the in-play feed's (or the agent's live read); before kickoff the catalogue's. The halts do NOT read it: they keep Son's 'in play at cost' rule (2026-10-02, option 2) until a position settles",
  "mark_sources": {
    "book": "before kickoff: the catalogue's order book bid (fetched within 30 minutes)",
    "feed": "in play: the running in-play WebSocket feed's best bid of the held side, vouched for within FEED_MARK_MAX_AGE (60 s)",
    "listing": "before kickoff: the catalogue's listing bid (captured within 45 minutes)",
    "live_book": "in play: the live Kalshi book the agent's live tracking read for a position it holds (at most live_track.LIVE_MARK_MAX_AGE, 2 minutes, old)",
    "none": "no live price: in play with no vouched feed book and no live read (the catalogue keeps no in-play price), or no fresh bid at all"
  },
  "orders": [],
  "positions": [
    {
      "at_risk_dollars": "4.00",
      "avg_cost_cents": 40,
      "competition": "epl",
      "contracts": 10,
      "cost_dollars": "4.00",
      "handed_over": 0,
      "in_play": true,
      "kickoff_utc": at(-2405),
      "live_mark_cents": 50,
      "live_value_dollars": "4.82",
      "managed": 0,
      "manual": 10,
      "mark_cents": null,
      "mark_source": "feed",
      "own": 0,
      "side": "yes",
      "ticker": "KXEPLGAME-26NOV04ARSCHE-ARS",
      "title": "Synthetic KXEPLGAME-26NOV04ARSCHE-ARS?",
      "unrealised_pl_dollars": "0.82"
    }
  ],
  "totals": {
    "cost_dollars": "4.00",
    "live_value_dollars": "4.82",
    "managed_contracts": 0,
    "manual_contracts": 10,
    "orders": 0,
    "positions": 1,
    "unmarked_positions": 0,
    "unrealised_pl_dollars": "0.82"
  },
  "version": "trading-book-v1"
};

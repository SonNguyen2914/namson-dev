/* A LEAGUE BOARD, RECORDED THE SAME WAY as e2e/cups-recorded.ts — in
 * process, capture off, nothing written, no board route called:
 * `_picker_board_assemble("20261017", 3, ["laliga","bundesliga","epl"],
 * capture=False)` on backend origin/main 7525d7b9, 2026-10-12. Trimmed to
 * two rows per league and one refusal; nothing else touched. The model
 * store is unreachable locally, so `model_vs_market` reads `no_model`
 * on every row — `withModelMarket` (e2e/model-market.ts) dresses rows in
 * the block's exact wire shape where a spec needs a priced one. */
export const LEAGUE_RECORDED_CLOCK = "2026-10-16T09:00:00Z";
export const LEAGUE_RECORDED = {
 "date": "20261017",
 "days": 3,
 "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "folded": {},
 "generated_at": "2026-10-13T03:18:03.437908+00:00",
 "leagues": {
  "bundesliga": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 15,
   "kind": "league",
   "min_current_gp": 5,
   "src": "prior"
  },
  "epl": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 17,
   "kind": "league",
   "min_current_gp": 6,
   "src": "prior"
  },
  "laliga": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 17,
   "kind": "league",
   "min_current_gp": 6,
   "src": "prior"
  }
 },
 "off_board": [],
 "off_board_counts": {
  "event_unreadable": 0,
  "finished": 0,
  "kicked_off": 0,
  "no_state": 0,
  "not_yet_kicked_off": 0,
  "state_unrecognised": 0
 },
 "refusals": [
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 2,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 8,
    "k": 10.0,
    "says": "Racing Santander has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 8; 2 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Racing Santander",
   "club": "Racing Santander",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882840",
   "espn": "esp.1",
   "event_id": "401882840",
   "form": {
    "away": "LWLLD",
    "home": "LLLDL",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Racing Santander",
      "resolved_by": "exact_outside_league"
     },
     "home": {
      "corpus_name": "Osasuna",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-10, corpus to 2026-04-18; this season's results 2026-09-05 to 2026-10-17). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-10-09",
     "corpus_to": "2026-04-18",
     "from": "2024-10-09",
     "label": "since 2024-10, corpus to 2026-04-18; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Osasuna",
   "in_play": false,
   "kalshi": {
    "ask_c": 50,
    "ask_size": 6549,
    "bid_c": 48,
    "bid_size": 350,
    "event_ticker": "KXLALIGAGAME-26OCT18OSASAN",
    "flags": [],
    "side": "Osasuna",
    "spread_c": 2,
    "ticker": "KXLALIGAGAME-26OCT18OSASAN-OSA"
   },
   "kickoff": "2026-10-18T12:00Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "RAC",
     "h": "OSA"
    },
    "market": {
     "a": 0.25,
     "d": 0.269231,
     "h": 0.480769
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 26,
       "ask_size": 4288,
       "bid_c": 24,
       "bid_size": 363,
       "spread_c": 2,
       "ticker": "KXLALIGAGAME-26OCT18OSASAN-SAN"
      },
      "d": {
       "ask_c": 28,
       "ask_size": 1662,
       "bid_c": 25,
       "bid_size": 8840,
       "spread_c": 3,
       "ticker": "KXLALIGAGAME-26OCT18OSASAN-TIE"
      },
      "h": {
       "ask_c": 50,
       "ask_size": 6549,
       "bid_c": 48,
       "bid_size": 350,
       "spread_c": 2,
       "ticker": "KXLALIGAGAME-26OCT18OSASAN-OSA"
      }
     },
     "overround": 1.04,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "h"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent_row": {
    "basis": "blend",
    "club": "Osasuna",
    "ga": 1.7309941520467838,
    "gdg": -0.6432748538011697,
    "gf": 1.087719298245614,
    "gp_current": 8,
    "of": 17,
    "ppg": 1.0584795321637428,
    "rank": 14,
    "rated": true,
    "rated_in": "laliga",
    "resolved_by": "exact",
    "table_club": "Osasuna",
    "table_note": null,
    "weight": 0.4444444444444444
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Racing Santander",
    "ga": 2.875,
    "gdg": -1.25,
    "gf": 1.625,
    "gp": 8,
    "ppg": 1.0,
    "rated_in": "laliga",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Racing Santander"
   },
   "venue": {
    "city": "Pamplona",
    "country": "Spain",
    "name": "El Sadar"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  }
 ],
 "rows": [
  {
   "away": "Borussia Dortmund",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884769",
   "cross_league": false,
   "current_only": {
    "favourite": "Borussia Dortmund",
    "gdg_gap": 3.8,
    "ppg_gap": 1.8,
    "rank_gap": 11,
    "reoriented": false,
    "signed_from": "Borussia Dortmund"
   },
   "espn": "ger.1",
   "event_id": "401884769",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Borussia Dortmund",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 14
      },
      "opp": {
       "rank": 94
      }
     },
     "def": {
      "fav": {
       "rank": 5
      },
      "opp": {
       "rank": 85
      }
     },
     "ovr": {
      "fav": {
       "rank": 16
      },
      "opp": {
       "rank": 88
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWWD",
    "opp": "LLLW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 2.2470588235294118,
   "gp_current": {
    "away": 5,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Borussia Dortmund",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Union Berlin",
      "resolved_by": "contained"
     }
    },
    "last_meeting": {
     "away": "Borussia Dortmund",
     "away_score": 3,
     "competition": "bundesliga",
     "completed": true,
     "date": "2026-01-24T17:30:00+00:00",
     "home": "Union Berlin",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Borussia Dortmund",
      "away_score": 1,
      "competition": "bundesliga",
      "completed": true,
      "date": "2024-10-05T13:30:00+00:00",
      "home": "Union Berlin",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Union Berlin",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-02-22T17:30:00+00:00",
      "home": "Borussia Dortmund",
      "home_score": 6,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Union Berlin",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-08-31T15:30:00+00:00",
      "home": "Borussia Dortmund",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Borussia Dortmund",
      "away_score": 3,
      "competition": "bundesliga",
      "completed": true,
      "date": "2026-01-24T17:30:00+00:00",
      "home": "Union Berlin",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 0,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-09-02",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-09-02; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "1. FC Union Berlin",
   "in_play": false,
   "kalshi": {
    "ask_c": 60,
    "ask_size": 147,
    "bid_c": 59,
    "bid_size": 436,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-BVB"
   },
   "kickoff": "2026-10-17T13:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "DOR",
     "h": "FCU"
    },
    "market": {
     "a": 0.588235,
     "d": 0.215686,
     "h": 0.196078
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 60,
       "ask_size": 147,
       "bid_c": 59,
       "bid_size": 436,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-BVB"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 964,
       "bid_c": 21,
       "bid_size": 1477,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-TIE"
      },
      "h": {
       "ask_c": 20,
       "ask_size": 1059,
       "bid_c": 19,
       "bid_size": 330,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-UNI"
      }
     },
     "overround": 1.02,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "a"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "1. FC Union Berlin",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 2.2470588235294118
   },
   "ppg_gap": 1.2666666666666664,
   "rank_gap": 12,
   "ranks": {
    "fav": 2,
    "opp": 14
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     0.9333333333333333,
     2.2705882352941176
    ],
    "gdg": [
     1.1725490196078432,
     -1.0745098039215684
    ],
    "gf": [
     2.1058823529411765,
     1.1960784313725492
    ],
    "ppg": [
     2.2980392156862743,
     1.031372549019608
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "1. FC Union Berlin": "exact",
    "Borussia Dortmund": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 4,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Berlin",
    "country": "Germany",
    "name": "Stadion An der Alten Försterei"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Borussia Dortmund",
    "flipped": false,
    "gdg_gap_abs": 2.2470588235294118,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.4529298823529409,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.3333333333333333,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.3333333333333333,
    "k": 10.0,
    "min": 0.3333333333333333
   }
  },
  {
   "away": "Barcelona",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882846",
   "cross_league": false,
   "current_only": {
    "favourite": "Barcelona",
    "gdg_gap": 2.75,
    "ppg_gap": 0.625,
    "rank_gap": 2,
    "reoriented": false,
    "signed_from": "Barcelona"
   },
   "espn": "esp.1",
   "event_id": "401882846",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Barcelona",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 24
      }
     },
     "def": {
      "fav": {
       "rank": 29
      },
      "opp": {
       "rank": 76
      }
     },
     "ovr": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 32
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWWWW",
    "opp": "WWDW",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.9239766081871346,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Barcelona",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Real Betis",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Real Betis",
     "away_score": 1,
     "competition": "la-liga",
     "completed": true,
     "date": "2026-05-17T19:15:00+00:00",
     "home": "Barcelona",
     "home_score": 3,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Barcelona",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2024-12-07T15:15:00+00:00",
      "home": "Real Betis",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "copa-del-rey",
      "completed": true,
      "date": "2025-01-15T20:00:00+00:00",
      "home": "Barcelona",
      "home_score": 5,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-04-05T19:00:00+00:00",
      "home": "Barcelona",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Barcelona",
      "away_score": 5,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-12-06T17:30:00+00:00",
      "home": "Real Betis",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2026-05-17T19:15:00+00:00",
      "home": "Barcelona",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "from": "2024-08-15",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Real Betis",
   "in_play": false,
   "kalshi": {
    "ask_c": 71,
    "ask_size": 5748,
    "bid_c": 70,
    "bid_size": 79,
    "event_ticker": "KXLALIGAGAME-26OCT17RBBBAR",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLALIGAGAME-26OCT17RBBBAR-BAR"
   },
   "kickoff": "2026-10-17T16:30Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "BAR",
     "h": "BET"
    },
    "market": {
     "a": 0.682692,
     "d": 0.163462,
     "h": 0.153846
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 71,
       "ask_size": 5748,
       "bid_c": 70,
       "bid_size": 79,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-BAR"
      },
      "d": {
       "ask_c": 17,
       "ask_size": 5134,
       "bid_c": 16,
       "bid_size": 400,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-TIE"
      },
      "h": {
       "ask_c": 16,
       "ask_size": 3069,
       "bid_c": 15,
       "bid_size": 475,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-RBB"
      }
     },
     "overround": 1.04,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "a"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Real Betis",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.9239766081871346
   },
   "ppg_gap": 0.7748538011695907,
   "rank_gap": 3,
   "ranks": {
    "fav": 1,
    "opp": 4
   },
   "rated_in": {
    "away": "laliga",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.915204678362573,
     1.2017543859649122
    ],
    "gdg": [
     2.3625730994152048,
     0.4385964912280702
    ],
    "gf": [
     3.2777777777777777,
     1.6403508771929824
    ],
    "ppg": [
     2.7076023391812867,
     1.932748538011696
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Barcelona": "exact",
    "Real Betis": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     2
    ],
    "def": [
     1,
     2
    ],
    "ovr": [
     1,
     1
    ]
   },
   "venue": {
    "city": "Sevilla",
    "country": "Spain",
    "name": "Estadio La Cartuja"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Barcelona",
    "flipped": false,
    "gdg_gap_abs": 1.9239766081871346,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3680569659442722,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "RB Leipzig",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884772",
   "cross_league": false,
   "current_only": {
    "favourite": "Bayern Munich",
    "gdg_gap": 0.40000000000000036,
    "ppg_gap": 0.40000000000000013,
    "rank_gap": 2,
    "reoriented": false,
    "signed_from": "Bayern Munich"
   },
   "espn": "ger.1",
   "event_id": "401884772",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Bayern Munich",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 23
      }
     },
     "def": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 45
      }
     },
     "ovr": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 27
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DWWD",
    "opp": "LWLW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.447058823529412,
   "gp_current": {
    "away": 5,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "RB Leipzig",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Bayern München",
      "resolved_by": "alias"
     }
    },
    "last_meeting": {
     "away": "RB Leipzig",
     "away_score": 0,
     "competition": "dfb-pokal",
     "completed": true,
     "date": "2026-02-11T19:45:00+00:00",
     "home": "Bayern München",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "RB Leipzig",
      "away_score": 1,
      "competition": "bundesliga",
      "completed": true,
      "date": "2024-12-20T19:30:00+00:00",
      "home": "Bayern München",
      "home_score": 5,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Bayern München",
      "away_score": 3,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-05-03T13:30:00+00:00",
      "home": "RB Leipzig",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "RB Leipzig",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-08-22T18:30:00+00:00",
      "home": "Bayern München",
      "home_score": 6,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Bayern München",
      "away_score": 5,
      "competition": "bundesliga",
      "completed": true,
      "date": "2026-01-17T17:30:00+00:00",
      "home": "RB Leipzig",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "RB Leipzig",
      "away_score": 0,
      "competition": "dfb-pokal",
      "completed": true,
      "date": "2026-02-11T19:45:00+00:00",
      "home": "Bayern München",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 1,
     "home": 4
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2026-09-02",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2026-09-02; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Bayern Munich",
   "in_play": false,
   "kalshi": {
    "ask_c": 80,
    "ask_size": 855,
    "bid_c": 78,
    "bid_size": 3953,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-BMU"
   },
   "kickoff": "2026-10-17T16:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "RBL",
     "h": "MUN"
    },
    "market": {
     "a": 0.098039,
     "d": 0.117647,
     "h": 0.784314
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 10,
       "ask_size": 5638,
       "bid_c": 9,
       "bid_size": 330,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-RBL"
      },
      "d": {
       "ask_c": 12,
       "ask_size": 2181,
       "bid_c": 11,
       "bid_size": 550,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-TIE"
      },
      "h": {
       "ask_c": 80,
       "ask_size": 855,
       "bid_c": 78,
       "bid_size": 3953,
       "spread_c": 2,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-BMU"
      }
     },
     "overround": 1.02,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "h"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "RB Leipzig",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.447058823529412
   },
   "ppg_gap": 0.603921568627451,
   "rank_gap": 2,
   "ranks": {
    "fav": 1,
    "opp": 3
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     0.9725490196078432,
     1.2549019607843137
    ],
    "gdg": [
     2.4862745098039216,
     1.0392156862745097
    ],
    "gf": [
     3.458823529411765,
     2.2941176470588234
    ],
    "ppg": [
     2.4784313725490197,
     1.8745098039215686
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Bayern Munich": "exact",
    "RB Leipzig": "exact"
   },
   "shape": "HOLLOW",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 0,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     1
    ],
    "def": [
     1,
     1
    ],
    "ovr": [
     1,
     1
    ]
   },
   "venue": {
    "city": "München",
    "country": "Germany",
    "name": "Allianz Arena"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Bayern Munich",
    "flipped": false,
    "gdg_gap_abs": 1.447058823529412,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.4529298823529409,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.3333333333333333,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.3333333333333333,
    "k": 10.0,
    "min": 0.3333333333333333
   }
  },
  {
   "away": "Sevilla",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882839",
   "cross_league": false,
   "current_only": {
    "favourite": "Real Madrid",
    "gdg_gap": 1.25,
    "ppg_gap": 0.5,
    "rank_gap": 1,
    "reoriented": false,
    "signed_from": "Real Madrid"
   },
   "espn": "esp.1",
   "event_id": "401882839",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Real Madrid",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 61
      }
     },
     "def": {
      "fav": {
       "rank": 22
      },
      "opp": {
       "rank": 119
      }
     },
     "ovr": {
      "fav": {
       "rank": 7
      },
      "opp": {
       "rank": 89
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLW",
    "opp": "DWWLD",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3742690058479528,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Sevilla",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Real Madrid",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Real Madrid",
     "away_score": 1,
     "competition": "la-liga",
     "completed": true,
     "date": "2026-05-17T17:00:00+00:00",
     "home": "Sevilla",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Sevilla",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2024-12-22T15:15:00+00:00",
      "home": "Real Madrid",
      "home_score": 4,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Madrid",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-05-18T17:00:00+00:00",
      "home": "Sevilla",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Sevilla",
      "away_score": 0,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-12-20T20:00:00+00:00",
      "home": "Real Madrid",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Madrid",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2026-05-17T17:00:00+00:00",
      "home": "Sevilla",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 4
    },
    "window": {
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "from": "2024-08-15",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Real Madrid",
   "in_play": false,
   "kalshi": {
    "ask_c": 79,
    "ask_size": 3123,
    "bid_c": 78,
    "bid_size": 4,
    "event_ticker": "KXLALIGAGAME-26OCT18RMASEV",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLALIGAGAME-26OCT18RMASEV-RMA"
   },
   "kickoff": "2026-10-18T19:00Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": "THIN",
    "codes": {
     "a": "SEV",
     "h": "RMA"
    },
    "market": {
     "a": 0.096154,
     "d": 0.144231,
     "h": 0.759615
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 10,
       "ask_size": 2132,
       "bid_c": 9,
       "bid_size": 29,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-SEV"
      },
      "d": {
       "ask_c": 15,
       "ask_size": 4753,
       "bid_c": 13,
       "bid_size": 1377,
       "spread_c": 2,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-TIE"
      },
      "h": {
       "ask_c": 79,
       "ask_size": 3123,
       "bid_c": 78,
       "bid_size": 4,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-RMA"
      }
     },
     "overround": 1.04,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "h"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Sevilla",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3742690058479528
   },
   "ppg_gap": 0.8508771929824563,
   "rank_gap": 4,
   "ranks": {
    "fav": 2,
    "opp": 6
   },
   "rated_in": {
    "away": "laliga",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.956140350877193,
     1.543859649122807
    ],
    "gdg": [
     1.225146198830409,
     -0.14912280701754366
    ],
    "gf": [
     2.181286549707602,
     1.3947368421052633
    ],
    "ppg": [
     2.257309941520468,
     1.4064327485380117
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Real Madrid": "exact",
    "Sevilla": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 2,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     1,
     2
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     2
    ]
   },
   "venue": {
    "city": "Madrid",
    "country": "Spain",
    "name": "Santiago Bernabéu"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Real Madrid",
    "flipped": false,
    "gdg_gap_abs": 1.3742690058479528,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3680569659442722,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Arsenal",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401878769",
   "cross_league": false,
   "current_only": {
    "favourite": "Arsenal",
    "gdg_gap": 1.3333333333333333,
    "ppg_gap": 1.6666666666666665,
    "rank_gap": 10,
    "reoriented": false,
    "signed_from": "Arsenal"
   },
   "espn": "eng.1",
   "event_id": "401878769",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Arsenal",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 6
      },
      "opp": {
       "rank": 48
      }
     },
     "def": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 18
      }
     },
     "ovr": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 21
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLW",
    "opp": "DWLL",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.2730263157894737,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Arsenal",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Nottingham Forest",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Arsenal",
     "away_score": 0,
     "competition": "epl",
     "completed": true,
     "date": "2026-01-17T17:30:00+00:00",
     "home": "Nottingham Forest",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Nottingham Forest",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2024-11-23T15:00:00+00:00",
      "home": "Arsenal",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Arsenal",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-02-26T19:30:00+00:00",
      "home": "Nottingham Forest",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Nottingham Forest",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-09-13T11:30:00+00:00",
      "home": "Arsenal",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Arsenal",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2026-01-17T17:30:00+00:00",
      "home": "Nottingham Forest",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Nottingham Forest",
   "in_play": false,
   "kalshi": {
    "ask_c": 62,
    "ask_size": 63232,
    "bid_c": 61,
    "bid_size": 933,
    "event_ticker": "KXEPLGAME-26OCT18NFOARS",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT18NFOARS-ARS"
   },
   "kickoff": "2026-10-18T15:30Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "ARS",
     "h": "NFO"
    },
    "market": {
     "a": 0.607843,
     "d": 0.245098,
     "h": 0.147059
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 62,
       "ask_size": 63232,
       "bid_c": 61,
       "bid_size": 933,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18NFOARS-ARS"
      },
      "d": {
       "ask_c": 25,
       "ask_size": 16114,
       "bid_c": 23,
       "bid_size": 11190,
       "spread_c": 2,
       "ticker": "KXEPLGAME-26OCT18NFOARS-TIE"
      },
      "h": {
       "ask_c": 15,
       "ask_size": 14900,
       "bid_c": 13,
       "bid_size": 28911,
       "spread_c": 2,
       "ticker": "KXEPLGAME-26OCT18NFOARS-NFO"
      }
     },
     "overround": 1.02,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "a"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Nottingham Forest",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2730263157894737
   },
   "ppg_gap": 1.2993421052631575,
   "rank_gap": 13,
   "ranks": {
    "fav": 2,
    "opp": 15
   },
   "rated_in": {
    "away": "epl",
    "home": "epl"
   },
   "rates": {
    "ga": [
     0.756578947368421,
     1.338815789473684
    ],
    "gdg": [
     1.036184210526316,
     -0.23684210526315774
    ],
    "gf": [
     1.792763157894737,
     1.1019736842105263
    ],
    "ppg": [
     2.3355263157894735,
     1.036184210526316
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Arsenal": "exact",
    "Nottingham Forest": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 2,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Nottingham",
    "country": "England",
    "name": "The City Ground"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Arsenal",
    "flipped": false,
    "gdg_gap_abs": 1.2730263157894737,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3613416408668728,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.375,
    "k": 10.0,
    "min": 0.375
   }
  },
  {
   "away": "Crystal Palace",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401879261",
   "cross_league": false,
   "current_only": {
    "favourite": "Brighton & Hove Albion",
    "gdg_gap": 2.6666666666666665,
    "ppg_gap": 0.9999999999999998,
    "rank_gap": 7,
    "reoriented": false,
    "signed_from": "Brighton & Hove Albion"
   },
   "espn": "eng.1",
   "event_id": "401879261",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Brighton & Hove Albion",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 36
      },
      "opp": {
       "rank": 83
      }
     },
     "def": {
      "fav": {
       "rank": 9
      },
      "opp": {
       "rank": 16
      }
     },
     "ovr": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 25
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DWWW",
    "opp": "WLDW",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.2631578947368418,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Crystal Palace",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Brighton",
      "resolved_by": "contained"
     }
    },
    "last_meeting": {
     "away": "Crystal Palace",
     "away_score": 1,
     "competition": "epl",
     "completed": true,
     "date": "2026-02-08T14:00:00+00:00",
     "home": "Brighton",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Crystal Palace",
      "away_score": 3,
      "competition": "epl",
      "completed": true,
      "date": "2024-12-15T14:00:00+00:00",
      "home": "Brighton",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Brighton",
      "away_score": 1,
      "competition": "epl",
      "completed": true,
      "date": "2025-04-05T14:00:00+00:00",
      "home": "Crystal Palace",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Brighton",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-11-09T14:00:00+00:00",
      "home": "Crystal Palace",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Crystal Palace",
      "away_score": 1,
      "competition": "epl",
      "completed": true,
      "date": "2026-02-08T14:00:00+00:00",
      "home": "Brighton",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 1,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-05 to 2026-10-17",
     "sweep": {
      "from": "2026-09-05",
      "to": "2026-10-17"
     },
     "to": "2026-10-17"
    }
   },
   "home": "Brighton & Hove Albion",
   "in_play": false,
   "kalshi": {
    "ask_c": 63,
    "ask_size": 10948,
    "bid_c": 62,
    "bid_size": 2,
    "event_ticker": "KXEPLGAME-26OCT18BRICRY",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT18BRICRY-BRI"
   },
   "kickoff": "2026-10-18T13:00Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": "THIN",
    "codes": {
     "a": "CRY",
     "h": "BHA"
    },
    "market": {
     "a": 0.174757,
     "d": 0.213592,
     "h": 0.61165
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 18,
       "ask_size": 9880,
       "bid_c": 17,
       "bid_size": 594,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-CRY"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 8171,
       "bid_c": 21,
       "bid_size": 1120,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-TIE"
      },
      "h": {
       "ask_c": 63,
       "ask_size": 10948,
       "bid_c": 62,
       "bid_size": 2,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-BRI"
      }
     },
     "overround": 1.03,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [
      "h"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Crystal Palace",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2631578947368418
   },
   "ppg_gap": 0.506578947368421,
   "rank_gap": 9,
   "ranks": {
    "fav": 3,
    "opp": 12
   },
   "rated_in": {
    "away": "epl",
    "home": "epl"
   },
   "rates": {
    "ga": [
     1.069078947368421,
     1.588815789473684
    ],
    "gdg": [
     0.9111842105263157,
     -0.3519736842105261
    ],
    "gf": [
     1.9802631578947367,
     1.236842105263158
    ],
    "ppg": [
     1.6842105263157894,
     1.1776315789473684
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Brighton & Hove Albion": "exact",
    "Crystal Palace": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 3,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     4
    ],
    "ovr": [
     1,
     4
    ]
   },
   "venue": {
    "city": "Falmer",
    "country": "England",
    "name": "American Express Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Brighton & Hove Albion",
    "flipped": false,
    "gdg_gap_abs": 1.2631578947368418,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3613416408668728,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.375,
    "k": 10.0,
    "min": 0.375
   }
  }
 ]
} as const;

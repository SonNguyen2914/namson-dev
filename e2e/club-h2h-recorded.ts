/* A CLUB BOARD WITH ITS HEAD-TO-HEAD, RECORDED — not off a brief.
 *
 * `api.main._picker_board_assemble("20261010", 3)` — the club board
 * route's own per-competition merge — called IN PROCESS on the backend
 * branch `board-data-gaps` and REPLAYED from that branch's recorded
 * provider responses (research_archive/board_data_gaps_2026-09-25/
 * club_board/http_20261010_3d.json.gz), with every assembly forced to
 * `capture=False` and the snapshot capture made to raise: nothing was
 * written anywhere and no request reached this project's API. Assembled
 * 2026-09-26T01:05:55.532199+00:00: 58 ranked rows, 17 refusals.
 *
 * Every rated row carries `field_rank` (backend 585d813f): each side's rank
 * in the league field on each axis, of `size`, a side the field cannot
 * place as null. Every row and refusal carries `h2h` (backend 2026-09-25, the national
 * card's `head_to_head` shape): `source` "club_corpus+board_sweep" or
 * "club_corpus", its `window` stated per pairing, a tally keyed by THIS
 * fixture's home and away.
 *
 * TRIMMED to 19 rows — two per league, a measured absence, the
 * HOLLOW row, three SPLITs, and Nottingham Forest v Crystal Palace — and 3 refusals: one whose pairing
 * met, one a measured absence, and one whose club the corpus REFUSED
 * (ambiguous or unknown, `window: null`). Every kept key, value and absence
 * is the wire's. */
export const CLUB_H2H_CLOCK = "2026-09-26T01:05:55.532199+00:00";

export const CLUB_H2H_BOARD = {
 "generated_at": "2026-09-26T01:05:55.532199+00:00",
 "date": "20261010",
 "days": 3,
 "leagues": {
  "epl": {
   "src": "prior",
   "min_current_gp": 5,
   "clubs": 17,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "laliga": {
   "src": "prior",
   "min_current_gp": 6,
   "clubs": 17,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "mls": {
   "src": "current",
   "min_current_gp": 25,
   "clubs": 30,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "ligamx": {
   "src": "prior",
   "min_current_gp": 8,
   "clubs": 17,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "bundesliga": {
   "src": "prior",
   "min_current_gp": 4,
   "clubs": 15,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "seriea": {
   "src": "prior",
   "min_current_gp": 5,
   "clubs": 17,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "ligue1": {
   "src": "prior",
   "min_current_gp": 5,
   "clubs": 16,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  },
  "eredivisie": {
   "src": "prior",
   "min_current_gp": 7,
   "clubs": 15,
   "kind": "league",
   "blend_k": 10,
   "blend_constant_w": null
  }
 },
 "rows": [
  {
   "refused": false,
   "league": "bundesliga",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "home": "FC Augsburg",
   "away": "Bayern Munich",
   "favourite": "Bayern Munich",
   "opponent": "FC Augsburg",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 2.6428571428571432,
    "threshold": 0.44633344537815095,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Bayern Munich",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "FC Augsburg": "exact",
    "Bayern Munich": "exact"
   },
   "ppg_gap": 1.1806722689075628,
   "gdg_gap": 2.6428571428571432,
   "rank_gap": 7,
   "gp_current": {
    "home": 4,
    "away": 4,
    "min": 4
   },
   "weights": {
    "home": 0.2857142857142857,
    "away": 0.2857142857142857,
    "min": 0.2857142857142857,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "bundesliga",
    "away": "bundesliga"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 1,
    "opp": 8
   },
   "rates": {
    "ppg": [
     2.584033613445378,
     1.403361344537815
    ],
    "gf": [
     3.563025210084034,
     1.73109243697479
    ],
    "ga": [
     0.8991596638655461,
     1.7100840336134455
    ],
    "gdg": [
     2.6638655462184877,
     0.021008403361344463
    ]
   },
   "own_gdg": {
    "diff": 2.6428571428571432,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     1,
     3
    ],
    "def": [
     1,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 2
   },
   "shape": "CLEAN",
   "event_id": "401884777",
   "competition_id": "401884777",
   "kickoff": "2026-10-10T13:30Z",
   "espn": "ger.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "WWK Arena",
    "city": "Augsburg",
    "country": "Germany"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "DWW",
    "opp": "WWDL",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.75,
    "gdg_gap": 1.75,
    "rank_gap": 2,
    "favourite": "Bayern Munich",
    "signed_from": "Bayern Munich",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 72
      }
     },
     "atk": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 87
      }
     },
     "def": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 97
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-16",
     "to": "2026-10-10",
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-09-02",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-09-02; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 1,
     "draw": 0,
     "away": 3
    },
    "meetings": [
     {
      "date": "2024-11-22T19:30:00+00:00",
      "home": "Bayern München",
      "away": "FC Augsburg",
      "home_score": 3,
      "away_score": 0,
      "completed": true,
      "competition": "bundesliga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-04T18:30:00+00:00",
      "home": "FC Augsburg",
      "away": "Bayern München",
      "home_score": 1,
      "away_score": 3,
      "completed": true,
      "competition": "bundesliga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-08-30T16:30:00+00:00",
      "home": "FC Augsburg",
      "away": "Bayern München",
      "home_score": 2,
      "away_score": 3,
      "completed": true,
      "competition": "bundesliga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-01-24T14:30:00+00:00",
      "home": "Bayern München",
      "away": "FC Augsburg",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "bundesliga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-01-24T14:30:00+00:00",
     "home": "Bayern München",
     "away": "FC Augsburg",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "bundesliga",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "FC Augsburg",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Bayern München",
      "resolved_by": "alias"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "laliga",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "home": "Barcelona",
   "away": "Getafe",
   "favourite": "Barcelona",
   "opponent": "Getafe",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 2.594427244582043,
    "threshold": 0.364698980149335,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Barcelona",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Barcelona": "exact",
    "Getafe": "exact"
   },
   "ppg_gap": 1.4303405572755419,
   "gdg_gap": 2.594427244582043,
   "rank_gap": 8,
   "gp_current": {
    "home": 7,
    "away": 7,
    "min": 7
   },
   "weights": {
    "home": 0.4117647058823529,
    "away": 0.4117647058823529,
    "min": 0.4117647058823529,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "laliga",
    "away": "laliga"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 1,
    "opp": 9
   },
   "rates": {
    "ppg": [
     2.6904024767801857,
     1.2600619195046439
    ],
    "gf": [
     3.2941176470588234,
     0.7306501547987616
    ],
    "ga": [
     0.9690402476780186,
     1
    ],
    "gdg": [
     2.3250773993808047,
     -0.2693498452012384
    ]
   },
   "own_gdg": {
    "diff": 2.594427244582043,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     1
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 4,
    "def": 0
   },
   "shape": "SPLIT",
   "event_id": "401882853",
   "competition_id": "401882853",
   "kickoff": "2026-10-10T16:30Z",
   "espn": "esp.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Spotify Camp Nou",
    "city": "Barcelona",
    "country": "Spain"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WWWWW",
    "opp": "LDDLW",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.8571428571428572,
    "gdg_gap": 3.8571428571428577,
    "rank_gap": 9,
    "favourite": "Barcelona",
    "signed_from": "Barcelona",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 67
      }
     },
     "atk": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 134
      }
     },
     "def": {
      "fav": {
       "rank": 29
      },
      "opp": {
       "rank": 26
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-15",
     "to": "2026-10-10",
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 3,
     "draw": 1,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-09-25T19:00:00+00:00",
      "home": "Barcelona",
      "away": "Getafe",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "competition": "la-liga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-01-18T20:00:00+00:00",
      "home": "Getafe",
      "away": "Barcelona",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "la-liga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-09-21T19:00:00+00:00",
      "home": "Barcelona",
      "away": "Getafe",
      "home_score": 3,
      "away_score": 0,
      "completed": true,
      "competition": "la-liga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-25T14:15:00+00:00",
      "home": "Getafe",
      "away": "Barcelona",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "competition": "la-liga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-04-25T14:15:00+00:00",
     "home": "Getafe",
     "away": "Barcelona",
     "home_score": 0,
     "away_score": 2,
     "completed": true,
     "competition": "la-liga",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Barcelona",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Getafe",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "seriea",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "home": "Internazionale",
   "away": "Parma",
   "favourite": "Internazionale",
   "opponent": "Parma",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.9298245614035086,
    "threshold": 0.32761114551083576,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Internazionale",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Internazionale": "exact",
    "Parma": "exact"
   },
   "ppg_gap": 1.3368421052631583,
   "gdg_gap": 1.9298245614035086,
   "rank_gap": 13,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "seriea",
    "away": "seriea"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 1,
    "opp": 14
   },
   "rates": {
    "ppg": [
     2.392982456140351,
     1.056140350877193
    ],
    "gf": [
     2.56140350877193,
     0.7578947368421053
    ],
    "ga": [
     1.1473684210526316,
     1.2736842105263158
    ],
    "gdg": [
     1.4140350877192982,
     -0.5157894736842105
    ]
   },
   "own_gdg": {
    "diff": 1.9298245614035086,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     4
    ],
    "atk": [
     1,
     5
    ],
    "def": [
     3,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 4,
    "def": 0
   },
   "shape": "SPLIT",
   "event_id": "401875021",
   "competition_id": "401875021",
   "kickoff": "2026-10-10T16:00Z",
   "espn": "ita.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "San Siro",
    "city": "Milano",
    "country": "Italy"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WWWD",
    "opp": "LDLW",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.8,
    "gdg_gap": 1.9999999999999998,
    "rank_gap": 10,
    "favourite": "Internazionale",
    "signed_from": "Internazionale",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 11
      },
      "opp": {
       "rank": 119
      }
     },
     "atk": {
      "fav": {
       "rank": 8
      },
      "opp": {
       "rank": 151
      }
     },
     "def": {
      "fav": {
       "rank": 32
      },
      "opp": {
       "rank": 70
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-03",
     "to": "2026-10-10",
     "corpus_from": "2024-08-03",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 3,
     "draw": 1,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-12-06T17:30:00+00:00",
      "home": "Inter",
      "away": "Parma",
      "home_score": 3,
      "away_score": 1,
      "completed": true,
      "competition": "serie-a",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-05T16:00:00+00:00",
      "home": "Parma",
      "away": "Inter",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "competition": "serie-a",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-01-07T19:45:00+00:00",
      "home": "Parma",
      "away": "Inter",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "competition": "serie-a",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-05-03T18:45:00+00:00",
      "home": "Inter",
      "away": "Parma",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "competition": "serie-a",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-05-03T18:45:00+00:00",
     "home": "Inter",
     "away": "Parma",
     "home_score": 2,
     "away_score": 0,
     "completed": true,
     "competition": "serie-a",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Inter",
      "resolved_by": "contained"
     },
     "away": {
      "corpus_name": "Parma",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "mls",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "home": "Austin FC",
   "away": "Nashville SC",
   "favourite": "Nashville SC",
   "opponent": "Austin FC",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.3748748748748747,
    "threshold": 0.4032721485499559,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Nashville SC",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Austin FC": "exact",
    "Nashville SC": "exact"
   },
   "ppg_gap": 0.8152736069402737,
   "gdg_gap": 1.3748748748748747,
   "rank_gap": 21,
   "gp_current": {
    "home": 26,
    "away": 26,
    "min": 26
   },
   "weights": {
    "home": 0.7222222222222222,
    "away": 0.7222222222222222,
    "min": 0.7222222222222222,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "mls",
    "away": "mls"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 1,
    "opp": 22
   },
   "rates": {
    "ppg": [
     2.0112612612612613,
     1.1959876543209875
    ],
    "gf": [
     1.9301801801801801,
     1.1898148148148149
    ],
    "ga": [
     0.9812312312312312,
     1.6157407407407407
    ],
    "gdg": [
     0.9489489489489489,
     -0.4259259259259258
    ]
   },
   "own_gdg": {
    "diff": 1.3748748748748747,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     4
    ],
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 4,
    "def": 2
   },
   "shape": "CLEAN",
   "event_id": "761856",
   "competition_id": "761856",
   "kickoff": "2026-10-11T00:30Z",
   "espn": "usa.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Q2 Stadium",
    "city": "Austin, Texas",
    "country": "USA"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WDLDW",
    "opp": "WDDWD",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.0384615384615388,
    "gdg_gap": 1.692307692307692,
    "rank_gap": 22,
    "favourite": "Nashville SC",
    "signed_from": "Nashville SC",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 76
      },
      "opp": {
       "rank": 133
      }
     },
     "atk": {
      "fav": {
       "rank": 44
      },
      "opp": {
       "rank": 115
      }
     },
     "def": {
      "fav": {
       "rank": 3
      },
      "opp": {
       "rank": 134
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-02-22",
     "to": "2026-10-10",
     "corpus_from": "2024-02-22",
     "corpus_to": "2026-08-12",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-02, corpus to 2026-08-12; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 1,
     "draw": 0,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-08-25T00:30:00+00:00",
      "home": "Nashville SC",
      "away": "Austin",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "competition": "mls",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-10-02T00:00:00+00:00",
      "home": "Austin",
      "away": "Nashville SC",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "us-open-cup",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2025-10-02T00:00:00+00:00",
     "home": "Austin",
     "away": "Nashville SC",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "us-open-cup",
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Austin",
      "resolved_by": "normalised"
     },
     "away": {
      "corpus_name": "Nashville SC",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "ligamx",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "home": "FC Juarez",
   "away": "Tijuana",
   "favourite": "Tijuana",
   "opponent": "FC Juarez",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.2506218129486826,
    "threshold": 0.36719211306627453,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Tijuana",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "FC Juarez": "exact",
    "Tijuana": "exact"
   },
   "ppg_gap": 0.778559723158061,
   "gdg_gap": 1.2506218129486826,
   "rank_gap": 12,
   "gp_current": {
    "home": 9,
    "away": 8,
    "min": 8
   },
   "weights": {
    "home": 0.47368421052631576,
    "away": 0.4444444444444444,
    "min": 0.4444444444444444,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "ligamx",
    "away": "ligamx"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 5,
    "opp": 17
   },
   "rates": {
    "ppg": [
     1.5735735735735736,
     0.7950138504155126
    ],
    "gf": [
     1.4774774774774775,
     1.105263157894737
    ],
    "ga": [
     1.2462462462462462,
     2.1246537396121883
    ],
    "gdg": [
     0.23123123123123124,
     -1.0193905817174513
    ]
   },
   "own_gdg": {
    "diff": 1.2506218129486826,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     2,
     5
    ],
    "atk": [
     3,
     5
    ],
    "def": [
     2,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 2,
    "def": 3
   },
   "shape": "CLEAN",
   "event_id": "401876952",
   "competition_id": "401876952",
   "kickoff": "2026-10-10T23:00Z",
   "espn": "mex.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estadio Olímpico Benito Juárez",
    "city": "Ciudad Juárez",
    "country": "Mexico"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "LD",
    "opp": "LLLW",
    "scope": "Liga MX",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.4166666666666667,
    "gdg_gap": 2.138888888888889,
    "rank_gap": 12,
    "favourite": "Tijuana",
    "signed_from": "Tijuana",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 127
      },
      "opp": {
       "rank": 132
      }
     },
     "atk": {
      "fav": {
       "rank": 109
      },
      "opp": {
       "rank": 99
      }
     },
     "def": {
      "fav": {
       "rank": 64
      },
      "opp": {
       "rank": 130
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-07-05",
     "to": "2026-10-10",
     "corpus_from": "2024-07-05",
     "corpus_to": "2026-08-12",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-07, corpus to 2026-08-12; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 1,
     "draw": 2,
     "away": 2
    },
    "meetings": [
     {
      "date": "2024-11-07T03:06:00+00:00",
      "home": "FC Juarez",
      "away": "Club Tijuana",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "liga-mx",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-02-15T03:00:00+00:00",
      "home": "Club Tijuana",
      "away": "FC Juarez",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "liga-mx",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-07-26T03:00:00+00:00",
      "home": "Club Tijuana",
      "away": "FC Juarez",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "liga-mx",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-11-21T03:00:00+00:00",
      "home": "Club Tijuana",
      "away": "FC Juarez",
      "home_score": 3,
      "away_score": 1,
      "completed": true,
      "competition": "liga-mx",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-11T03:06:00+00:00",
      "home": "FC Juarez",
      "away": "Club Tijuana",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "liga-mx",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-04-11T03:06:00+00:00",
     "home": "FC Juarez",
     "away": "Club Tijuana",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "liga-mx",
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "FC Juarez",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Club Tijuana",
      "resolved_by": "normalised"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "mls",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "home": "Inter Miami CF",
   "away": "D.C. United",
   "favourite": "Inter Miami CF",
   "opponent": "D.C. United",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.2324813258636784,
    "threshold": 0.4032721485499559,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Inter Miami CF",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Inter Miami CF": "exact",
    "D.C. United": "exact"
   },
   "ppg_gap": 0.7862745098039217,
   "gdg_gap": 1.2324813258636784,
   "rank_gap": 24,
   "gp_current": {
    "home": 26,
    "away": 25,
    "min": 25
   },
   "weights": {
    "home": 0.7222222222222222,
    "away": 0.7142857142857143,
    "min": 0.7142857142857143,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "mls",
    "away": "mls"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 3,
    "opp": 27
   },
   "rates": {
    "ppg": [
     1.8333333333333333,
     1.0470588235294116
    ],
    "gf": [
     2.451388888888889,
     1.1378151260504201
    ],
    "ga": [
     1.7500000000000002,
     1.66890756302521
    ],
    "gdg": [
     0.7013888888888886,
     -0.5310924369747898
    ]
   },
   "own_gdg": {
    "diff": 1.2324813258636784,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     5
    ],
    "atk": [
     1,
     5
    ],
    "def": [
     4,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 4,
    "atk": 4,
    "def": 0
   },
   "shape": "SPLIT",
   "event_id": "761847",
   "competition_id": "761847",
   "kickoff": "2026-10-10T23:30Z",
   "espn": "usa.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Nu Stadium",
    "city": "Miami, Florida",
    "country": "USA"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WDDDD",
    "opp": "DWDL",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.6092307692307692,
    "gdg_gap": 0.8969230769230767,
    "rank_gap": 19,
    "favourite": "Inter Miami CF",
    "signed_from": "Inter Miami CF",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 40
      },
      "opp": {
       "rank": 140
      }
     },
     "atk": {
      "fav": {
       "rank": 16
      },
      "opp": {
       "rank": 101
      }
     },
     "def": {
      "fav": {
       "rank": 113
      },
      "opp": {
       "rank": 103
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-02-22",
     "to": "2026-10-10",
     "corpus_from": "2024-02-22",
     "corpus_to": "2026-08-08",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-02, corpus to 2026-08-08; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 4,
     "draw": 1,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-03-16T18:00:00+00:00",
      "home": "DC United",
      "away": "Inter Miami",
      "home_score": 1,
      "away_score": 3,
      "completed": true,
      "competition": "mls",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2024-05-18T23:30:00+00:00",
      "home": "Inter Miami",
      "away": "DC United",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "competition": "mls",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-08-23T23:30:00+00:00",
      "home": "DC United",
      "away": "Inter Miami",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "mls",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-09-20T23:30:00+00:00",
      "home": "Inter Miami",
      "away": "DC United",
      "home_score": 3,
      "away_score": 2,
      "completed": true,
      "competition": "mls",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-03-07T21:30:00+00:00",
      "home": "DC United",
      "away": "Inter Miami",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "mls",
      "season": 2026,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-03-07T21:30:00+00:00",
     "home": "DC United",
     "away": "Inter Miami",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "mls",
     "season": 2026,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Inter Miami",
      "resolved_by": "normalised"
     },
     "away": {
      "corpus_name": "DC United",
      "resolved_by": "normalised"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "epl",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "home": "Sunderland",
   "away": "Brighton & Hove Albion",
   "favourite": "Brighton & Hove Albion",
   "opponent": "Sunderland",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.2105263157894737,
    "threshold": 0.3553604953560369,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Brighton & Hove Albion",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Sunderland": "exact",
    "Brighton & Hove Albion": "exact"
   },
   "ppg_gap": 0.38245614035087727,
   "gdg_gap": 1.2105263157894737,
   "rank_gap": 8,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "epl",
    "away": "epl"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 4,
    "opp": 12
   },
   "rates": {
    "ppg": [
     1.5964912280701755,
     1.2140350877192982
    ],
    "gf": [
     1.9789473684210528,
     1.136842105263158
    ],
    "ga": [
     1.1403508771929824,
     1.5087719298245614
    ],
    "gdg": [
     0.8385964912280703,
     -0.37192982456140333
    ]
   },
   "own_gdg": {
    "diff": 1.2105263157894737,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     4
    ],
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 3,
    "def": 3
   },
   "shape": "CLEAN",
   "event_id": "401878772",
   "competition_id": "401878772",
   "kickoff": "2026-10-10T14:00Z",
   "espn": "eng.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Stadium of Light",
    "city": "Sunderland",
    "country": "England"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "LDWW",
    "opp": "WDLL",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.2,
    "gdg_gap": 3,
    "rank_gap": 9,
    "favourite": "Brighton & Hove Albion",
    "signed_from": "Brighton & Hove Albion",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 29
      }
     },
     "atk": {
      "fav": {
       "rank": 36
      },
      "opp": {
       "rank": 81
      }
     },
     "def": {
      "fav": {
       "rank": 9
      },
      "opp": {
       "rank": 11
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-13",
     "to": "2026-10-10",
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 1,
     "away": 1
    },
    "meetings": [
     {
      "date": "2025-12-20T15:00:00+00:00",
      "home": "Brighton",
      "away": "Sunderland",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-03-14T15:00:00+00:00",
      "home": "Sunderland",
      "away": "Brighton",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-03-14T15:00:00+00:00",
     "home": "Sunderland",
     "away": "Brighton",
     "home_score": 0,
     "away_score": 1,
     "completed": true,
     "competition": "epl",
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Sunderland",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Brighton",
      "resolved_by": "contained"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "bundesliga",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "home": "TSG Hoffenheim",
   "away": "Hamburg SV",
   "favourite": "TSG Hoffenheim",
   "opponent": "Hamburg SV",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.138655462184874,
    "threshold": 0.44633344537815095,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "TSG Hoffenheim",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "TSG Hoffenheim": "exact",
    "Hamburg SV": "exact"
   },
   "ppg_gap": 0.48319327731092443,
   "gdg_gap": 1.138655462184874,
   "rank_gap": 5,
   "gp_current": {
    "home": 4,
    "away": 4,
    "min": 4
   },
   "weights": {
    "home": 0.2857142857142857,
    "away": 0.2857142857142857,
    "min": 0.2857142857142857,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "bundesliga",
    "away": "bundesliga"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 7,
    "opp": 12
   },
   "rates": {
    "ppg": [
     1.495798319327731,
     1.0126050420168067
    ],
    "gf": [
     1.865546218487395,
     0.9831932773109244
    ],
    "ga": [
     1.80672268907563,
     2.0630252100840334
    ],
    "gdg": [
     0.05882352941176494,
     -1.079831932773109
    ]
   },
   "own_gdg": {
    "diff": 1.138655462184874,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     2,
     4
    ],
    "atk": [
     3,
     5
    ],
    "def": [
     3,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 1
   },
   "shape": "CLEAN",
   "event_id": "401884779",
   "competition_id": "401884779",
   "kickoff": "2026-10-10T13:30Z",
   "espn": "ger.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "PreZero Arena",
    "city": "Sinsheim",
    "country": "Germany"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "LLWL",
    "opp": "LLLW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0,
    "gdg_gap": 2,
    "rank_gap": 2,
    "favourite": "TSG Hoffenheim",
    "signed_from": "TSG Hoffenheim",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 49
      },
      "opp": {
       "rank": 77
      }
     },
     "atk": {
      "fav": {
       "rank": 25
      },
      "opp": {
       "rank": 113
      }
     },
     "def": {
      "fav": {
       "rank": 69
      },
      "opp": {
       "rank": 71
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-16",
     "to": "2026-10-10",
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-09-02",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-09-02; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 0,
     "away": 0
    },
    "meetings": [
     {
      "date": "2025-12-13T14:30:00+00:00",
      "home": "1899 Hoffenheim",
      "away": "Hamburger SV",
      "home_score": 4,
      "away_score": 1,
      "completed": true,
      "competition": "bundesliga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-25T16:30:00+00:00",
      "home": "Hamburger SV",
      "away": "1899 Hoffenheim",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "bundesliga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-04-25T16:30:00+00:00",
     "home": "Hamburger SV",
     "away": "1899 Hoffenheim",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "bundesliga",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "1899 Hoffenheim",
      "resolved_by": "alias"
     },
     "away": {
      "corpus_name": "Hamburger SV",
      "resolved_by": "alias"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "eredivisie",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "home": "Fortuna Sittard",
   "away": "FC Twente",
   "favourite": "FC Twente",
   "opponent": "Fortuna Sittard",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.1003460207612459,
    "threshold": 0.44316634700939167,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "FC Twente",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Fortuna Sittard": "exact",
    "FC Twente": "exact"
   },
   "ppg_gap": 0.5051903114186853,
   "gdg_gap": 1.1003460207612459,
   "rank_gap": 4,
   "gp_current": {
    "home": 7,
    "away": 7,
    "min": 7
   },
   "weights": {
    "home": 0.4117647058823529,
    "away": 0.4117647058823529,
    "min": 0.4117647058823529,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "eredivisie",
    "away": "eredivisie"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 4,
    "opp": 8
   },
   "rates": {
    "ppg": [
     1.944636678200692,
     1.4394463667820068
    ],
    "gf": [
     1.9031141868512111,
     1.6124567474048441
    ],
    "ga": [
     1.1038062283737025,
     1.9134948096885813
    ],
    "gdg": [
     0.7993079584775087,
     -0.3010380622837372
    ]
   },
   "own_gdg": {
    "diff": 1.1003460207612459,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     2,
     4
    ],
    "def": [
     1,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 3
   },
   "shape": "CLEAN",
   "event_id": "401875588",
   "competition_id": "401875588",
   "kickoff": "2026-10-10T18:00Z",
   "espn": "ned.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Fortuna Sittard Stadion",
    "city": "Sittard",
    "country": "Netherlands"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WDWWW",
    "opp": "WLW",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.4285714285714284,
    "gdg_gap": 1.2857142857142856,
    "rank_gap": 2,
    "favourite": "FC Twente",
    "signed_from": "FC Twente",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 62
      },
      "opp": {
       "rank": 137
      }
     },
     "atk": {
      "fav": {
       "rank": 94
      },
      "opp": {
       "rank": 121
      }
     },
     "def": {
      "fav": {
       "rank": 99
      },
      "opp": {
       "rank": 151
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-09",
     "to": "2026-10-10",
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 1,
     "away": 3
    },
    "meetings": [
     {
      "date": "2024-11-23T20:00:00+00:00",
      "home": "Fortuna Sittard",
      "away": "Twente",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-05T16:45:00+00:00",
      "home": "Twente",
      "away": "Fortuna Sittard",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-09-26T18:00:00+00:00",
      "home": "Twente",
      "away": "Fortuna Sittard",
      "home_score": 3,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-03-21T15:30:00+00:00",
      "home": "Fortuna Sittard",
      "away": "Twente",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-03-21T15:30:00+00:00",
     "home": "Fortuna Sittard",
     "away": "Twente",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "eredivisie",
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Fortuna Sittard",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Twente",
      "resolved_by": "normalised"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "ligamx",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "home": "Atlas",
   "away": "Guadalajara",
   "favourite": "Guadalajara",
   "opponent": "Atlas",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 1.0745614035087718,
    "threshold": 0.36719211306627453,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Guadalajara",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Atlas": "exact",
    "Guadalajara": "exact"
   },
   "ppg_gap": 0.5029239766081872,
   "gdg_gap": 1.0745614035087718,
   "rank_gap": 7,
   "gp_current": {
    "home": 9,
    "away": 9,
    "min": 9
   },
   "weights": {
    "home": 0.47368421052631576,
    "away": 0.47368421052631576,
    "min": 0.47368421052631576,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "ligamx",
    "away": "ligamx"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 3,
    "opp": 10
   },
   "rates": {
    "ppg": [
     1.8684210526315792,
     1.365497076023392
    ],
    "gf": [
     1.8157894736842106,
     1.2982456140350878
    ],
    "ga": [
     1.0657894736842106,
     1.6228070175438596
    ],
    "gdg": [
     0.75,
     -0.32456140350877183
    ]
   },
   "own_gdg": {
    "diff": 1.0745614035087718,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     1,
     3
    ],
    "def": [
     1,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 3
   },
   "shape": "CLEAN",
   "event_id": "401876951",
   "competition_id": "401876951",
   "kickoff": "2026-10-11T01:00Z",
   "espn": "mex.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estadio Jalisco",
    "city": "Guadalajara",
    "country": "Mexico"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "DWWD",
    "opp": "LDLD",
    "scope": "Liga MX",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.4444444444444444,
    "gdg_gap": 1.2222222222222223,
    "rank_gap": 7,
    "favourite": "Guadalajara",
    "signed_from": "Guadalajara",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 95
      },
      "opp": {
       "rank": 138
      }
     },
     "atk": {
      "fav": {
       "rank": 66
      },
      "opp": {
       "rank": 138
      }
     },
     "def": {
      "fav": {
       "rank": 58
      },
      "opp": {
       "rank": 117
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-07-05",
     "to": "2026-10-10",
     "corpus_from": "2024-07-05",
     "corpus_to": "2026-08-12",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-07, corpus to 2026-08-12; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 1,
     "away": 2
    },
    "meetings": [
     {
      "date": "2024-10-06T01:05:00+00:00",
      "home": "Guadalajara Chivas",
      "away": "Atlas",
      "home_score": 2,
      "away_score": 3,
      "completed": true,
      "competition": "liga-mx",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2024-11-22T01:05:00+00:00",
      "home": "Guadalajara Chivas",
      "away": "Atlas",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "liga-mx",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-20T03:15:00+00:00",
      "home": "Atlas",
      "away": "Guadalajara Chivas",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "liga-mx",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-10-26T00:07:00+00:00",
      "home": "Guadalajara Chivas",
      "away": "Atlas",
      "home_score": 4,
      "away_score": 1,
      "completed": true,
      "competition": "liga-mx",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-03-08T01:05:00+00:00",
      "home": "Atlas",
      "away": "Guadalajara Chivas",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "liga-mx",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-03-08T01:05:00+00:00",
     "home": "Atlas",
     "away": "Guadalajara Chivas",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "competition": "liga-mx",
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Atlas",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Guadalajara Chivas",
      "resolved_by": "contained"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "ligue1",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "home": "Lille",
   "away": "Le Havre AC",
   "favourite": "Lille",
   "opponent": "Le Havre AC",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.9960784313725493,
    "threshold": 0.35980578877005326,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Lille",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Lille": "exact",
    "Le Havre AC": "exact"
   },
   "ppg_gap": 1.0431372549019609,
   "gdg_gap": 0.9960784313725493,
   "rank_gap": 12,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "ligue1",
    "away": "ligue1"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 4,
    "opp": 16
   },
   "rates": {
    "ppg": [
     1.8627450980392157,
     0.8196078431372549
    ],
    "gf": [
     1.5529411764705885,
     0.8941176470588237
    ],
    "ga": [
     0.9921568627450981,
     1.3294117647058825
    ],
    "gdg": [
     0.5607843137254904,
     -0.43529411764705883
    ]
   },
   "own_gdg": {
    "diff": 0.9960784313725493,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     5
    ],
    "atk": [
     3,
     5
    ],
    "def": [
     1,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 4,
    "atk": 2,
    "def": 2
   },
   "shape": "CLEAN",
   "event_id": "401876446",
   "competition_id": "401876446",
   "kickoff": "2026-10-10T15:15Z",
   "espn": "fra.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Decathlon Arena - Stade Pierre-Mauroy",
    "city": "Lille",
    "country": "France"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WWL",
    "opp": "DLDL",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.6,
    "gdg_gap": 1.4,
    "rank_gap": 12,
    "favourite": "Lille",
    "signed_from": "Lille",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 38
      },
      "opp": {
       "rank": 107
      }
     },
     "atk": {
      "fav": {
       "rank": 56
      },
      "opp": {
       "rank": 140
      }
     },
     "def": {
      "fav": {
       "rank": 21
      },
      "opp": {
       "rank": 43
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-16",
     "to": "2026-10-10",
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-05-29",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-29; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 1,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-09-28T17:00:00+00:00",
      "home": "Le Havre",
      "away": "Lille",
      "home_score": 0,
      "away_score": 3,
      "completed": true,
      "competition": "ligue-1",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-02-08T18:00:00+00:00",
      "home": "Lille",
      "away": "Le Havre",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "ligue-1",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-11-30T16:15:00+00:00",
      "home": "Le Havre",
      "away": "Lille",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "competition": "ligue-1",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-05-03T13:00:00+00:00",
      "home": "Lille",
      "away": "Le Havre",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "ligue-1",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-05-03T13:00:00+00:00",
     "home": "Lille",
     "away": "Le Havre",
     "home_score": 1,
     "away_score": 1,
     "completed": true,
     "competition": "ligue-1",
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Lille",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Le Havre",
      "resolved_by": "contained"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "eredivisie",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "home": "Go Ahead Eagles",
   "away": "Sparta Rotterdam",
   "favourite": "Go Ahead Eagles",
   "opponent": "Sparta Rotterdam",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.9273356401384081,
    "threshold": 0.44316634700939167,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Go Ahead Eagles",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Go Ahead Eagles": "exact",
    "Sparta Rotterdam": "exact"
   },
   "ppg_gap": 0.20761245674740492,
   "gdg_gap": 0.9273356401384081,
   "rank_gap": 2,
   "gp_current": {
    "home": 7,
    "away": 7,
    "min": 7
   },
   "weights": {
    "home": 0.4117647058823529,
    "away": 0.4117647058823529,
    "min": 0.4117647058823529,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "eredivisie",
    "away": "eredivisie"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 11,
    "opp": 13
   },
   "rates": {
    "ppg": [
     1.245674740484429,
     1.0380622837370241
    ],
    "gf": [
     1.875432525951557,
     1.2802768166089966
    ],
    "ga": [
     1.740484429065744,
     2.0726643598615917
    ],
    "gdg": [
     0.134948096885813,
     -0.7923875432525951
    ]
   },
   "own_gdg": {
    "diff": 0.9273356401384081,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     4,
     4
    ],
    "atk": [
     2,
     4
    ],
    "def": [
     4,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 2,
    "def": 0
   },
   "shape": "SPLIT",
   "event_id": "401875590",
   "competition_id": "401875590",
   "kickoff": "2026-10-10T14:30Z",
   "espn": "ned.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "De Adelaarshorst",
    "city": "Deventer",
    "country": "Netherlands"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "LDDD",
    "opp": "LDLL",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.7142857142857143,
    "gdg_gap": 1.2857142857142854,
    "rank_gap": 3,
    "favourite": "Go Ahead Eagles",
    "signed_from": "Go Ahead Eagles",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 126
      },
      "opp": {
       "rank": 131
      }
     },
     "atk": {
      "fav": {
       "rank": 108
      },
      "opp": {
       "rank": 143
      }
     },
     "def": {
      "fav": {
       "rank": 139
      },
      "opp": {
       "rank": 148
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-09",
     "to": "2026-10-10",
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 2,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-09-15T10:15:00+00:00",
      "home": "Sparta Rotterdam",
      "away": "GO Ahead Eagles",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2024-12-18T19:00:00+00:00",
      "home": "Sparta Rotterdam",
      "away": "GO Ahead Eagles",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "knvb-beker",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides",
      "shootout": true
     },
     {
      "date": "2025-02-14T19:00:00+00:00",
      "home": "GO Ahead Eagles",
      "away": "Sparta Rotterdam",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-08-23T14:30:00+00:00",
      "home": "GO Ahead Eagles",
      "away": "Sparta Rotterdam",
      "home_score": 0,
      "away_score": 3,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-05-03T14:45:00+00:00",
      "home": "Sparta Rotterdam",
      "away": "GO Ahead Eagles",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-05-03T14:45:00+00:00",
     "home": "Sparta Rotterdam",
     "away": "GO Ahead Eagles",
     "home_score": 2,
     "away_score": 2,
     "completed": true,
     "competition": "eredivisie",
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "GO Ahead Eagles",
      "resolved_by": "normalised"
     },
     "away": {
      "corpus_name": "Sparta Rotterdam",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "epl",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "home": "Arsenal",
   "away": "Leeds United",
   "favourite": "Arsenal",
   "opponent": "Leeds United",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.8947368421052633,
    "threshold": 0.3553604953560369,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Arsenal",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Arsenal": "exact",
    "Leeds United": "exact"
   },
   "ppg_gap": 0.8666666666666667,
   "gdg_gap": 0.8947368421052633,
   "rank_gap": 6,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "epl",
    "away": "epl"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 2,
    "opp": 8
   },
   "rates": {
    "ppg": [
     2.2912280701754386,
     1.424561403508772
    ],
    "gf": [
     1.7789473684210528,
     1.3263157894736843
    ],
    "ga": [
     0.7403508771929825,
     1.1824561403508773
    ],
    "gdg": [
     1.0385964912280703,
     0.14385964912280702
    ]
   },
   "own_gdg": {
    "diff": 0.8947368421052633,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     1,
     3
    ],
    "def": [
     1,
     2
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 1
   },
   "shape": "CLEAN",
   "event_id": "401879268",
   "competition_id": "401879268",
   "kickoff": "2026-10-10T11:30Z",
   "espn": "eng.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Emirates Stadium",
    "city": "London",
    "country": "England"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WWWL",
    "opp": "DDWD",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.5999999999999999,
    "gdg_gap": 1.1102230246251565e-16,
    "rank_gap": 3,
    "favourite": "Arsenal",
    "signed_from": "Arsenal",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 22
      }
     },
     "atk": {
      "fav": {
       "rank": 6
      },
      "opp": {
       "rank": 45
      }
     },
     "def": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 37
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-13",
     "to": "2026-10-10",
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 0,
     "away": 0
    },
    "meetings": [
     {
      "date": "2025-08-23T16:30:00+00:00",
      "home": "Arsenal",
      "away": "Leeds",
      "home_score": 5,
      "away_score": 0,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-01-31T15:00:00+00:00",
      "home": "Leeds",
      "away": "Arsenal",
      "home_score": 0,
      "away_score": 4,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-01-31T15:00:00+00:00",
     "home": "Leeds",
     "away": "Arsenal",
     "home_score": 0,
     "away_score": 4,
     "completed": true,
     "competition": "epl",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Arsenal",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Leeds",
      "resolved_by": "contained"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "laliga",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "home": "Real Betis",
   "away": "Osasuna",
   "favourite": "Real Betis",
   "opponent": "Osasuna",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.7925696594427245,
    "threshold": 0.364698980149335,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Real Betis",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Real Betis": "exact",
    "Osasuna": "exact"
   },
   "ppg_gap": 0.7492260061919502,
   "gdg_gap": 0.7925696594427245,
   "rank_gap": 10,
   "gp_current": {
    "home": 7,
    "away": 7,
    "min": 7
   },
   "weights": {
    "home": 0.4117647058823529,
    "away": 0.4117647058823529,
    "min": 0.4117647058823529,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "laliga",
    "away": "laliga"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 4,
    "opp": 14
   },
   "rates": {
    "ppg": [
     1.8699690402476778,
     1.1207430340557276
    ],
    "gf": [
     1.4427244582043344,
     1.0340557275541795
    ],
    "ga": [
     1.1547987616099071,
     1.5386996904024768
    ],
    "gdg": [
     0.28792569659442724,
     -0.5046439628482973
    ]
   },
   "own_gdg": {
    "diff": 0.7925696594427245,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     4
    ],
    "atk": [
     2,
     5
    ],
    "def": [
     2,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 3,
    "def": 2
   },
   "shape": "CLEAN",
   "event_id": "401882855",
   "competition_id": "401882855",
   "kickoff": "2026-10-11T16:30Z",
   "espn": "esp.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estadio La Cartuja",
    "city": "Sevilla",
    "country": "Spain"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "LWWWD",
    "opp": "WLLLD",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 1.1428571428571428,
    "gdg_gap": 1.2857142857142858,
    "rank_gap": 9,
    "favourite": "Real Betis",
    "signed_from": "Real Betis",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 32
      },
      "opp": {
       "rank": 73
      }
     },
     "atk": {
      "fav": {
       "rank": 24
      },
      "opp": {
       "rank": 73
      }
     },
     "def": {
      "fav": {
       "rank": 76
      },
      "opp": {
       "rank": 81
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-15",
     "to": "2026-10-10",
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 2,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-10-19T14:15:00+00:00",
      "home": "Osasuna",
      "away": "Real Betis",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "competition": "la-liga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-05-11T19:00:00+00:00",
      "home": "Real Betis",
      "away": "Osasuna",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "la-liga",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-09-28T19:00:00+00:00",
      "home": "Real Betis",
      "away": "Osasuna",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "competition": "la-liga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-12T12:00:00+00:00",
      "home": "Osasuna",
      "away": "Real Betis",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "la-liga",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-04-12T12:00:00+00:00",
     "home": "Osasuna",
     "away": "Real Betis",
     "home_score": 1,
     "away_score": 1,
     "completed": true,
     "competition": "la-liga",
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Real Betis",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Osasuna",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "ligue1",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "home": "Nice",
   "away": "Strasbourg",
   "favourite": "Strasbourg",
   "opponent": "Nice",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.7860566448801745,
    "threshold": 0.35980578877005326,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Strasbourg",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Nice": "exact",
    "Strasbourg": "exact"
   },
   "ppg_gap": 0.5058823529411764,
   "gdg_gap": 0.7860566448801745,
   "rank_gap": 7,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "ligue1",
    "away": "ligue1"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 8,
    "opp": 15
   },
   "rates": {
    "ppg": [
     1.5058823529411764,
     1
    ],
    "gf": [
     1.8039215686274512,
     0.9592592592592593
    ],
    "ga": [
     1.5882352941176472,
     1.5296296296296297
    ],
    "gdg": [
     0.21568627450980404,
     -0.5703703703703704
    ]
   },
   "own_gdg": {
    "diff": 0.7860566448801745,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     3,
     5
    ],
    "atk": [
     1,
     5
    ],
    "def": [
     5,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 4,
    "def": -1
   },
   "shape": "SPLIT",
   "event_id": "401876443",
   "competition_id": "401876443",
   "kickoff": "2026-10-11T13:00Z",
   "espn": "fra.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Allianz Riviera",
    "city": "Nice",
    "country": "France"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WWDL",
    "opp": "LDLW",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.3999999999999999,
    "gdg_gap": 0.6,
    "rank_gap": 5,
    "favourite": "Strasbourg",
    "signed_from": "Strasbourg",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 45
      },
      "opp": {
       "rank": 92
      }
     },
     "atk": {
      "fav": {
       "rank": 35
      },
      "opp": {
       "rank": 119
      }
     },
     "def": {
      "fav": {
       "rank": 63
      },
      "opp": {
       "rank": 112
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-16",
     "to": "2026-10-10",
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-05-29",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-29; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 2,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-11-24T19:45:00+00:00",
      "home": "Nice",
      "away": "Strasbourg",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "competition": "ligue-1",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-12T19:05:00+00:00",
      "home": "Strasbourg",
      "away": "Nice",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "competition": "ligue-1",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-01-03T18:00:00+00:00",
      "home": "Nice",
      "away": "Strasbourg",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "ligue-1",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-04T15:00:00+00:00",
      "home": "Strasbourg",
      "away": "Nice",
      "home_score": 3,
      "away_score": 1,
      "completed": true,
      "competition": "ligue-1",
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-04-22T19:00:00+00:00",
      "home": "Strasbourg",
      "away": "Nice",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "competition": "coupe-de-france",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-04-22T19:00:00+00:00",
     "home": "Strasbourg",
     "away": "Nice",
     "home_score": 0,
     "away_score": 2,
     "completed": true,
     "competition": "coupe-de-france",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Nice",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Strasbourg",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "seriea",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "home": "Sassuolo",
   "away": "AC Milan",
   "favourite": "AC Milan",
   "opponent": "Sassuolo",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.785964912280702,
    "threshold": 0.32761114551083576,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "AC Milan",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Sassuolo": "exact",
    "AC Milan": "exact"
   },
   "ppg_gap": 0.6350877192982456,
   "gdg_gap": 0.785964912280702,
   "rank_gap": 7,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "seriea",
    "away": "seriea"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 3,
    "opp": 10
   },
   "rates": {
    "ppg": [
     1.96140350877193,
     1.3263157894736843
    ],
    "gf": [
     1.5964912280701755,
     1.407017543859649
    ],
    "ga": [
     0.880701754385965,
     1.4771929824561405
    ],
    "gdg": [
     0.7157894736842105,
     -0.07017543859649145
    ]
   },
   "own_gdg": {
    "diff": 0.785964912280702,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     2,
     2
    ],
    "def": [
     1,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 0,
    "def": 3
   },
   "shape": "SPLIT",
   "event_id": "401874789",
   "competition_id": "401874789",
   "kickoff": "2026-10-11T16:00Z",
   "espn": "ita.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Mapei Stadium",
    "city": "Reggio Emilia",
    "country": "Italy"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "DDW",
    "opp": "WDWL",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.8000000000000003,
    "gdg_gap": 1.2,
    "rank_gap": 4,
    "favourite": "AC Milan",
    "signed_from": "AC Milan",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 46
      },
      "opp": {
       "rank": 101
      }
     },
     "atk": {
      "fav": {
       "rank": 82
      },
      "opp": {
       "rank": 106
      }
     },
     "def": {
      "fav": {
       "rank": 25
      },
      "opp": {
       "rank": 88
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-03",
     "to": "2026-10-10",
     "corpus_from": "2024-08-03",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-12-03T20:00:00+00:00",
      "home": "AC Milan",
      "away": "Sassuolo",
      "home_score": 6,
      "away_score": 1,
      "completed": true,
      "competition": "coppa-italia",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-12-14T11:30:00+00:00",
      "home": "AC Milan",
      "away": "Sassuolo",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "competition": "serie-a",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-05-03T13:00:00+00:00",
      "home": "Sassuolo",
      "away": "AC Milan",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "competition": "serie-a",
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-05-03T13:00:00+00:00",
     "home": "Sassuolo",
     "away": "AC Milan",
     "home_score": 2,
     "away_score": 0,
     "completed": true,
     "competition": "serie-a",
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Sassuolo",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "AC Milan",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "eredivisie",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "home": "Feyenoord Rotterdam",
   "away": "AZ Alkmaar",
   "favourite": "Feyenoord Rotterdam",
   "opponent": "AZ Alkmaar",
   "fav_side": "home",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.6816608996539792,
    "threshold": 0.44316634700939167,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Feyenoord Rotterdam",
    "side": "home",
    "agrees": true,
    "reason": "favourite_already_at_home",
    "flipped": false
   },
   "resolution": {
    "Feyenoord Rotterdam": "exact",
    "AZ Alkmaar": "exact"
   },
   "ppg_gap": 0.10726643598615926,
   "gdg_gap": 0.6816608996539792,
   "rank_gap": 1,
   "gp_current": {
    "home": 7,
    "away": 7,
    "min": 7
   },
   "weights": {
    "home": 0.4117647058823529,
    "away": 0.4117647058823529,
    "min": 0.4117647058823529,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "eredivisie",
    "away": "eredivisie"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 2,
    "opp": 3
   },
   "rates": {
    "ppg": [
     2.124567474048443,
     2.017301038062284
    ],
    "gf": [
     2.6816608996539792,
     2.0622837370242215
    ],
    "ga": [
     1.1730103806228374,
     1.2352941176470589
    ],
    "gdg": [
     1.508650519031142,
     0.8269896193771626
    ]
   },
   "own_gdg": {
    "diff": 0.6816608996539792,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     1,
     1
    ],
    "atk": [
     1,
     1
    ],
    "def": [
     1,
     1
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": 0
   },
   "shape": "HOLLOW",
   "event_id": "401875591",
   "competition_id": "401875591",
   "kickoff": "2026-10-10T16:45Z",
   "espn": "ned.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "De Kuip",
    "city": "Rotterdam",
    "country": "Netherlands"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "DWWW",
    "opp": "WWDW",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": -0.28571428571428603,
    "gdg_gap": 0.8571428571428572,
    "rank_gap": -1,
    "favourite": "AZ Alkmaar",
    "signed_from": "Feyenoord Rotterdam",
    "reoriented": true
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 58
      },
      "opp": {
       "rank": 64
      }
     },
     "atk": {
      "fav": {
       "rank": 57
      },
      "opp": {
       "rank": 97
      }
     },
     "def": {
      "fav": {
       "rank": 121
      },
      "opp": {
       "rank": 136
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-09",
     "to": "2026-10-10",
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 2,
     "draw": 2,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-11-02T20:00:00+00:00",
      "home": "Feyenoord",
      "away": "AZ Alkmaar",
      "home_score": 3,
      "away_score": 2,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-04-05T14:30:00+00:00",
      "home": "AZ Alkmaar",
      "away": "Feyenoord",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "competition": "eredivisie",
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-09-21T14:45:00+00:00",
      "home": "AZ Alkmaar",
      "away": "Feyenoord",
      "home_score": 3,
      "away_score": 3,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-05-10T14:45:00+00:00",
      "home": "Feyenoord",
      "away": "AZ Alkmaar",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "eredivisie",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-05-10T14:45:00+00:00",
     "home": "Feyenoord",
     "away": "AZ Alkmaar",
     "home_score": 1,
     "away_score": 1,
     "completed": true,
     "competition": "eredivisie",
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Feyenoord",
      "resolved_by": "contained"
     },
     "away": {
      "corpus_name": "AZ Alkmaar",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": false,
   "league": "mls",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "home": "Red Bull New York",
   "away": "San Diego FC",
   "favourite": "San Diego FC",
   "opponent": "Red Bull New York",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.5730266465560583,
    "threshold": 0.4032721485499559,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "San Diego FC",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Red Bull New York": "exact",
    "San Diego FC": "exact"
   },
   "ppg_gap": 0.11308027484498062,
   "gdg_gap": 0.5730266465560583,
   "rank_gap": 5,
   "gp_current": {
    "home": 26,
    "away": 26,
    "min": 26
   },
   "weights": {
    "home": 0.7222222222222222,
    "away": 0.7222222222222222,
    "min": 0.7222222222222222,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "mls",
    "away": "mls"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 14,
    "opp": 19
   },
   "rates": {
    "ppg": [
     1.3810541310541309,
     1.2679738562091503
    ],
    "gf": [
     1.7492877492877492,
     1.3366013071895426
    ],
    "ga": [
     1.556980056980057,
     1.7173202614379086
    ],
    "gdg": [
     0.1923076923076923,
     -0.380718954248366
    ]
   },
   "own_gdg": {
    "diff": 0.5730266465560583,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     3,
     3
    ],
    "atk": [
     2,
     4
    ],
    "def": [
     2,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 2,
    "def": 2
   },
   "shape": "SPLIT",
   "event_id": "761853",
   "competition_id": "761853",
   "kickoff": "2026-10-10T23:30Z",
   "espn": "usa.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Red Bull Arena",
    "city": "Harrison, New Jersey",
    "country": "USA"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "WLLLD",
    "opp": "LDLWW",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": -0.07692307692307687,
    "gdg_gap": 0.5384615384615385,
    "rank_gap": -4,
    "favourite": "Red Bull New York",
    "signed_from": "San Diego FC",
    "reoriented": true
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 100
      },
      "opp": {
       "rank": 123
      }
     },
     "atk": {
      "fav": {
       "rank": 50
      },
      "opp": {
       "rank": 105
      }
     },
     "def": {
      "fav": {
       "rank": 90
      },
      "opp": {
       "rank": 138
      }
     }
    }
   },
   "h2h": {
    "available": false,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2025-02-22",
     "to": "2026-10-10",
     "corpus_from": "2025-02-22",
     "corpus_to": "2026-08-08",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2025-02, corpus to 2026-08-08; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "meetings": [],
    "last_meeting": null,
    "identity": {
     "home": {
      "corpus_name": "New York Red Bulls",
      "resolved_by": "alias"
     },
     "away": {
      "corpus_name": "San Diego",
      "resolved_by": "normalised"
     }
    },
    "reason": "no meeting in our corpus (since 2025-02, corpus to 2026-08-08; this season's results 2026-08-29 to 2026-10-10). A measured absence over that window, not a claim the clubs never met"
   }
  },
  {
   "refused": false,
   "league": "epl",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "home": "Crystal Palace",
   "away": "Nottingham Forest",
   "favourite": "Nottingham Forest",
   "opponent": "Crystal Palace",
   "fav_side": "away",
   "fav_source": "rank",
   "venue_favourite": {
    "refused": false,
    "venue_class": "DOMESTIC",
    "home_side": "home",
    "gdg_gap_abs": 0.3894736842105264,
    "threshold": 0.3553604953560369,
    "threshold_source": "derived",
    "policy": "off",
    "favourite": "Nottingham Forest",
    "side": "away",
    "agrees": true,
    "reason": "table_gap_beats_venue",
    "flipped": false
   },
   "resolution": {
    "Crystal Palace": "exact",
    "Nottingham Forest": "exact"
   },
   "ppg_gap": 0.04912280701754401,
   "gdg_gap": 0.3894736842105264,
   "rank_gap": 1,
   "gp_current": {
    "home": 5,
    "away": 5,
    "min": 5
   },
   "weights": {
    "home": 0.3333333333333333,
    "away": 0.3333333333333333,
    "min": 0.3333333333333333,
    "k": 10,
    "constant": null,
    "basis": {
     "home": "blend",
     "away": "blend"
    }
   },
   "src": "prior",
   "cross_league": false,
   "rated_in": {
    "home": "epl",
    "away": "epl"
   },
   "gap_note": null,
   "reg_time_note": null,
   "table_notes": {
    "home": null,
    "away": null
   },
   "ranks": {
    "fav": 14,
    "opp": 15
   },
   "rates": {
    "ppg": [
     1.105263157894737,
     1.056140350877193
    ],
    "gf": [
     1.1087719298245615,
     1.1192982456140352
    ],
    "ga": [
     1.2280701754385965,
     1.6280701754385967
    ],
    "gdg": [
     -0.11929824561403501,
     -0.5087719298245614
    ]
   },
   "own_gdg": {
    "diff": 0.3894736842105264,
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
   },
   "tiers": {
    "ovr": [
     4,
     5
    ],
    "atk": [
     5,
     5
    ],
    "def": [
     3,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 0,
    "def": 2
   },
   "shape": "SPLIT",
   "event_id": "401879266",
   "competition_id": "401879266",
   "kickoff": "2026-10-11T13:00Z",
   "espn": "eng.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Selhurst Park",
    "city": "London",
    "country": "England"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "fav": "DDWL",
    "opp": "WLD",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "current_only": {
    "ppg_gap": 0.19999999999999996,
    "gdg_gap": 0.8000000000000003,
    "rank_gap": 3,
    "favourite": "Nottingham Forest",
    "signed_from": "Nottingham Forest",
    "reoriented": false
   },
   "field_rank": {
    "size": 154,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 21
      },
      "opp": {
       "rank": 25
      }
     },
     "atk": {
      "fav": {
       "rank": 48
      },
      "opp": {
       "rank": 83
      }
     },
     "def": {
      "fav": {
       "rank": 18
      },
      "opp": {
       "rank": 16
      }
     }
    }
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-13",
     "to": "2026-10-10",
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 3,
     "away": 1
    },
    "meetings": [
     {
      "date": "2024-10-21T19:00:00+00:00",
      "home": "Nottingham Forest",
      "away": "Crystal Palace",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "competition": "epl",
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-05-05T19:00:00+00:00",
      "home": "Crystal Palace",
      "away": "Nottingham Forest",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "epl",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-08-24T13:00:00+00:00",
      "home": "Crystal Palace",
      "away": "Nottingham Forest",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2026-02-01T14:00:00+00:00",
      "home": "Nottingham Forest",
      "away": "Crystal Palace",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "epl",
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2026-02-01T14:00:00+00:00",
     "home": "Nottingham Forest",
     "away": "Crystal Palace",
     "home_score": 1,
     "away_score": 1,
     "completed": true,
     "competition": "epl",
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Crystal Palace",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": "Nottingham Forest",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  }
 ],
 "refusals": [
  {
   "refused": true,
   "club": "Ipswich Town",
   "reason": "no_prior_row",
   "home": "Ipswich Town",
   "away": "Fulham",
   "league": "epl",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "reg_time_note": null,
   "this_season": {
    "club": "Ipswich Town",
    "table_club": "Ipswich Town",
    "resolved_by": "exact",
    "rated_in": "epl",
    "gp": 5,
    "ppg": 1.2,
    "gf": 1.4,
    "ga": 2.2,
    "gdg": -0.8,
    "rates_absent": null
   },
   "admission": {
    "k": 10,
    "gp": 5,
    "games_until_rated": 5,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "basis_when_admitted": "current_only",
    "says": "Ipswich Town has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 5; 5 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "opponent_row": {
    "club": "Fulham",
    "table_club": "Fulham",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "epl",
    "table_note": null,
    "ppg": 1.0456140350877194,
    "gf": 1.1578947368421053,
    "ga": 1.4280701754385965,
    "gdg": -0.2701754385964912,
    "gp_current": 5,
    "rank": 16,
    "of": 17,
    "weight": 0.3333333333333333,
    "basis": "blend"
   },
   "sides": null,
   "refusal": {
    "reason": "no_prior_row",
    "case": "below_admission",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "event_id": "401879265",
   "competition_id": "401879265",
   "kickoff": "2026-10-10T14:00Z",
   "espn": "eng.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Portman Road",
    "city": "Ipswich",
    "country": "England"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "home": "LLWL",
    "away": "LLDD",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-13",
     "to": "2026-10-10",
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-16",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-16; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 2,
     "away": 0
    },
    "meetings": [
     {
      "date": "2024-08-31T14:00:00+00:00",
      "home": "Ipswich",
      "away": "Fulham",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "competition": "epl",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "date": "2025-01-05T14:00:00+00:00",
      "home": "Fulham",
      "away": "Ipswich",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "competition": "epl",
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "date": "2025-01-05T14:00:00+00:00",
     "home": "Fulham",
     "away": "Ipswich",
     "home_score": 2,
     "away_score": 2,
     "completed": true,
     "competition": "epl",
     "season": 2024,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "identity": {
     "home": {
      "corpus_name": "Ipswich",
      "resolved_by": "contained"
     },
     "away": {
      "corpus_name": "Fulham",
      "resolved_by": "exact"
     }
    },
    "reason": null
   }
  },
  {
   "refused": true,
   "club": "Hull City",
   "reason": "no_prior_row",
   "home": "Hull City",
   "away": "Everton",
   "league": "epl",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "reg_time_note": null,
   "this_season": {
    "club": "Hull City",
    "table_club": "Hull City",
    "resolved_by": "exact",
    "rated_in": "epl",
    "gp": 5,
    "ppg": 1.6,
    "gf": 1.2,
    "ga": 0.8,
    "gdg": 0.4,
    "rates_absent": null
   },
   "admission": {
    "k": 10,
    "gp": 5,
    "games_until_rated": 5,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "basis_when_admitted": "current_only",
    "says": "Hull City has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 5; 5 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "opponent_row": {
    "club": "Everton",
    "table_club": "Everton",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "epl",
    "table_note": null,
    "ppg": 1.4596491228070176,
    "gf": 1.224561403508772,
    "ga": 1.0771929824561406,
    "gdg": 0.14736842105263137,
    "gp_current": 5,
    "rank": 7,
    "of": 17,
    "weight": 0.3333333333333333,
    "basis": "blend"
   },
   "sides": null,
   "refusal": {
    "reason": "no_prior_row",
    "case": "below_admission",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "event_id": "401878774",
   "competition_id": "401878774",
   "kickoff": "2026-10-11T13:00Z",
   "espn": "eng.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "The MKM Stadium",
    "city": "Hull",
    "country": "England"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "home": "WDDL",
    "away": "DDDW",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "club_corpus+board_sweep",
    "window": {
     "from": "2024-08-13",
     "to": "2026-10-10",
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-16",
     "sweep": {
      "from": "2026-08-29",
      "to": "2026-10-10"
     },
     "label": "since 2024-08, corpus to 2026-05-16; this season's results 2026-08-29 to 2026-10-10"
    },
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "meetings": [],
    "last_meeting": null,
    "identity": {
     "home": {
      "corpus_name": "Hull City",
      "resolved_by": "name_join"
     },
     "away": {
      "corpus_name": "Everton",
      "resolved_by": "exact"
     }
    },
    "reason": "no meeting in our corpus (since 2024-08, corpus to 2026-05-16; this season's results 2026-08-29 to 2026-10-10). A measured absence over that window, not a claim the clubs never met"
   }
  },
  {
   "refused": true,
   "club": "Deportivo",
   "reason": "no_prior_row",
   "home": "Real Sociedad",
   "away": "Deportivo",
   "league": "laliga",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "reg_time_note": null,
   "this_season": {
    "club": "Deportivo",
    "table_club": "Deportivo",
    "resolved_by": "exact",
    "rated_in": "laliga",
    "gp": 7,
    "ppg": 1.4285714285714286,
    "gf": 1.4285714285714286,
    "ga": 1.1428571428571428,
    "gdg": 0.2857142857142857,
    "rates_absent": null
   },
   "admission": {
    "k": 10,
    "gp": 7,
    "games_until_rated": 3,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "basis_when_admitted": "current_only",
    "says": "Deportivo has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 7; 3 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "opponent_row": {
    "club": "Real Sociedad",
    "table_club": "Real Sociedad",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "laliga",
    "table_note": null,
    "ppg": 1.3003095975232197,
    "gf": 1.4427244582043344,
    "ga": 1.7089783281733748,
    "gdg": -0.26625386996904044,
    "gp_current": 7,
    "rank": 8,
    "of": 17,
    "weight": 0.4117647058823529,
    "basis": "blend"
   },
   "sides": null,
   "refusal": {
    "reason": "no_prior_row",
    "case": "below_admission",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "event_id": "401882847",
   "competition_id": "401882847",
   "kickoff": "2026-10-11T14:15Z",
   "espn": "esp.1",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Reale Arena",
    "city": "San Sebastian",
    "country": "Spain"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "kalshi": null,
   "form": {
    "home": "WDWLW",
    "away": "WWDLD",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "club_corpus",
    "window": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "meetings": [],
    "last_meeting": null,
    "identity": {
     "home": {
      "corpus_name": "Real Sociedad",
      "resolved_by": "exact"
     },
     "away": {
      "corpus_name": null,
      "resolved_by": "ambiguous:9"
     }
    },
    "reason": "no head-to-head: Deportivo (ambiguous:9) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed"
   }
  }
 ],
 "off_board": [],
 "off_board_counts": {
  "kicked_off": 0,
  "finished": 0,
  "not_yet_kicked_off": 0,
  "state_unrecognised": 0,
  "no_state": 0,
  "event_unreadable": 0
 },
 "folded": {
  "campeones": {
   "src": "prior",
   "min_current_gp": 8,
   "clubs": 47,
   "kind": "cup",
   "rated_on": [
    "mls",
    "ligamx"
   ],
   "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
   "field": {
    "competition": "campeones",
    "size": 48,
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "passes": "3",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "below_floor_clubs": [],
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads."
   },
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "mu": 0.06585639874539755,
    "leagues_measured": 13,
    "members_measured": [],
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit"
   },
   "folded_into": [],
   "fixtures": 0,
   "refusals": 0,
   "off_board": 0
  }
 },
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that."
} as const;

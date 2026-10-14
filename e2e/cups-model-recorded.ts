/* THE CUPS TAB'S CARDS WITH THE CUP MODEL, RECORDED (2026-10-14, Son:
 * "where is the model for Cups?").
 *
 * HOW. `api.main._picker_board_assemble("20261021", 1, ["ucl"],
 * capture=False)` run IN PROCESS on backend branch cup-card-model
 * (TRIVELA, the fix that makes a cup card read the cup hub's line), with
 * `snapshots.capture_rows` made to raise. No request reached
 * /api/picker/board, locally or in production, and nothing was written.
 * Live ESPN, Kalshi and the field were read. The cup model's line for each
 * tie is PRODUCTION'S OWN: `match_hubs.cup_line` was served the
 * `traders_model` that GET /api/comp/ucl/match/{event} answered on
 * production (code_revision 7dfd6013) that morning, because the trader's
 * store is not reachable from a local assembly. So these are the numbers
 * the hub shows, on the card.
 *
 * TRIMMED, NOTHING ELSE TOUCHED: three ranked UCL rows (Bayern Munich v
 * Arsenal and Como v Manchester United carry the cup model; Aston Villa v
 * Viking FK is the cup model's own refusal, `cups_side_unrated`) and the
 * first refusal. `CUP_NO_MODEL_BLOCKS` is `model_market.attach` run on a
 * row of each cup with no model, verbatim: the hub's code and sentence. */
export const CUPS_MODEL_CLOCK = "2026-10-14T09:00:00Z";
export const CUPS_MODEL_UCL = {
 "refusals": [
  {
   "admission": null,
   "away": "Galatasaray",
   "club": "Lille",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915396",
   "espn": "uefa.champions",
   "event_id": "401915396",
   "form": {
    "away": "WLW",
    "home": "WLW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Galatasaray",
      "resolved_by": "exact_outside_league"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Lille (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Lille",
   "in_play": false,
   "kalshi": {
    "ask_c": 74,
    "ask_size": 100,
    "bid_c": 28,
    "bid_size": 4,
    "event_ticker": "KXUCLGAME-26OCT21LILGAL",
    "flags": [
     "WIDE"
    ],
    "side": "Lille",
    "spread_c": 46,
    "ticker": "KXUCLGAME-26OCT21LILGAL-LIL"
   },
   "kickoff": "2026-10-21T16:45Z",
   "league": "ucl",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "GAL",
     "h": "LILL"
    },
    "market": {
     "a": 0.27381,
     "d": 0.285714,
     "h": 0.440476
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 46,
       "ask_size": 3,
       "bid_c": 19,
       "bid_size": 1,
       "spread_c": 27,
       "ticker": "KXUCLGAME-26OCT21LILGAL-GAL"
      },
      "d": {
       "ask_c": 48,
       "ask_size": 100,
       "bid_c": 13,
       "bid_size": 88,
       "spread_c": 35,
       "ticker": "KXUCLGAME-26OCT21LILGAL-TIE"
      },
      "h": {
       "ask_c": 74,
       "ask_size": 100,
       "bid_c": 28,
       "bid_size": 4,
       "spread_c": 46,
       "ticker": "KXUCLGAME-26OCT21LILGAL-LIL"
      }
     },
     "overround": 1.68,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "cups_side_unrated",
    "model_why_detail": "CUP MODEL: a side is not rated in any of the eight unified league streams at this kickoff (another league, too few or too old league matches, or absent from its league in season)",
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
    "club": "Galatasaray",
    "ga": 1.1660899653979238,
    "gdg": 1.1072664359861593,
    "gf": 2.273356401384083,
    "gp_current": 7,
    "of": 15,
    "ppg": 2.273356401384083,
    "rank": 1,
    "rated": true,
    "rated_in": "superlig",
    "resolved_by": "exact",
    "table_club": "Galatasaray",
    "table_note": null,
    "weight": 0.4117647058823529
   },
   "reason": "ambiguous_across_leagues:2",
   "refusal": {
    "absent": {
     "admission": "there is no current-season line to be short of",
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet.",
     "this_season": "the club resolved in more than one of the cup's member leagues and the board refuses to guess which one rates it. Same consequence as an ambiguous name inside one table, one level up: no figures, because the figures would be a coin toss."
    },
    "carries": [
     "opponent_row"
    ],
    "case": "ambiguous_across_leagues",
    "reason": "ambiguous_across_leagues:2",
    "why": "the club resolved in more than one of the cup's member leagues and the board refuses to guess which one rates it. Same consequence as an ambiguous name inside one table, one level up: no figures, because the figures would be a coin toss.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Lille",
    "country": "France",
    "name": "Decathlon Arena - Stade Pierre-Mauroy"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  }
 ],
 "rows": [
  {
   "away": "Manchester United",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915395",
   "cross_league": true,
   "current_only": {
    "favourite": "Manchester United",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Manchester United"
   },
   "espn": "uefa.champions",
   "event_id": "401915395",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Manchester United",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.25395044651627685,
       "interval": [
        0.607709120938618,
        1.1156100139711715
       ],
       "rank": 5,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.8616595674548948
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.3028584340249812,
       "interval": [
        0.2231072888476145,
        0.8288241568975769
       ],
       "rank": 21,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.5259657228725957
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.30077162404072133,
       "interval": [
        0.2325315454353717,
        0.8340747935168144
       ],
       "rank": 10,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.533303169476093
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.49019048111416846,
       "interval": [
        0.20046402209496944,
        1.1808449843233064
       ],
       "rank": 5,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.6906545032091379
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 26.971412137279597,
       "interval": [
        1907.513603041048,
        1961.4564273156075
       ],
       "rank": 8,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1934.4850151783278
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 32.5202444466565,
       "interval": [
        1737.1855862964396,
        1802.2260751897527
       ],
       "rank": 26,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 1769.7058307430962
      },
      "tier_gap": 2,
      "unit": "elo"
     }
    },
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
    "clubs": {
     "fav": "Manchester United",
     "opp": "Como"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "LDD",
    "opp": "WLD",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Manchester United",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Como",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (no corpus season holds both clubs; this season's results 2026-09-09 to 2026-10-21). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": null,
     "corpus_to": null,
     "from": "2026-09-09",
     "label": "no corpus season holds both clubs; this season's results 2026-09-09 to 2026-10-21",
     "sweep": {
      "from": "2026-09-09",
      "to": "2026-10-21"
     },
     "to": "2026-10-21"
    }
   },
   "home": "Como",
   "in_play": false,
   "kalshi": {
    "ask_c": 38,
    "ask_size": 9,
    "bid_c": 32,
    "bid_size": 1,
    "event_ticker": "KXUCLGAME-26OCT21COMMUN",
    "flags": [
     "WIDE",
     "THIN"
    ],
    "spread_c": 6,
    "ticker": "KXUCLGAME-26OCT21COMMUN-MUN"
   },
   "kickoff": "2026-10-21T16:45Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.7315858460983641,
    "gd": 0.684247372462569,
    "gf": 1.415833218560933,
    "leagues": {
     "fav": "epl",
     "opp": "seriea"
    },
    "measured_as": {
     "fav": "epl",
     "opp": "serie-a"
    }
   },
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "MAN",
     "h": "COMO"
    },
    "market": {
     "a": 0.292308,
     "d": 0.3,
     "h": 0.407692
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 38,
       "ask_size": 9,
       "bid_c": 32,
       "bid_size": 1,
       "spread_c": 6,
       "ticker": "KXUCLGAME-26OCT21COMMUN-MUN"
      },
      "d": {
       "ask_c": 39,
       "ask_size": 100,
       "bid_c": 11,
       "bid_size": 94,
       "spread_c": 28,
       "ticker": "KXUCLGAME-26OCT21COMMUN-TIE"
      },
      "h": {
       "ask_c": 53,
       "ask_size": 3,
       "bid_c": 30,
       "bid_size": 200,
       "spread_c": 23,
       "ticker": "KXUCLGAME-26OCT21COMMUN-COM"
      }
     },
     "overround": 1.3,
     "stale": null
    },
    "market_why": null,
    "model": {
     "a": 0.333278,
     "d": 0.255857,
     "h": 0.410865
    },
    "model_meta": {
     "label": "experimental, unproven — cups: paper only",
     "name": "unified-cups-nb-v1",
     "paper_only": true,
     "read_at": "2026-10-14T09:07:44.577644+00:00",
     "source": "unified_cups",
     "status": "untested",
     "test_verdict": "PASS_NOT_WORSE"
    },
    "model_why": null,
    "model_why_detail": null,
    "top": {
     "market": [
      "h"
     ],
     "model": [
      "h"
     ]
    },
    "verdict": "agree"
   },
   "opponent": "Como",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -0.4671052631578947
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 5,
    "opp": 6
   },
   "rated_in": {
    "away": "epl",
    "home": "seriea"
   },
   "rates": {
    "ga": [
     1.3848684210526316,
     0.8519736842105263
    ],
    "gdg": [
     0.3125,
     0.7796052631578947
    ],
    "gf": [
     1.6973684210526316,
     1.631578947368421
    ],
    "ppg": [
     1.542763157894737,
     1.855263157894737
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Como": "exact",
    "Manchester United": "exact"
   },
   "shape": "HOLLOW",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": -1,
    "def": -2,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     2,
     1
    ],
    "def": [
     3,
     1
    ],
    "ovr": [
     2,
     2
    ]
   },
   "venue": {
    "city": "Como",
    "country": "Italy",
    "name": "Giuseppe Sinigaglia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": "home",
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "TRUE_HOME"
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
   "away": "Viking FK",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915394",
   "cross_league": true,
   "current_only": {
    "favourite": "Aston Villa",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Aston Villa"
   },
   "espn": "uefa.champions",
   "event_id": "401915394",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Aston Villa",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.2934561928478999,
       "interval": [
        0.3577617147075983,
        0.9446741004033982
       ],
       "rank": 13,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.6512179075554982
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.31230706695762955,
       "interval": [
        0.18180119360727554,
        0.8064153275225346
       ],
       "rank": 22,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.4941082605649051
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.3081566551408684,
       "interval": [
        0.25867713533617825,
        0.874990445617915
       ],
       "rank": 8,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.5668337904770466
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4499788848210479,
       "interval": [
        -0.4092284973476874,
        0.49072927229440844
       ],
       "rank": 31,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.040750387473360516
      },
      "tier_gap": 2,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 36.98689989813637,
       "interval": [
        1911.0544936362446,
        1985.0282934325176
       ],
       "rank": 6,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1948.041393534381
      },
      "label": "overall",
      "opp": {
       "below_floor": true,
       "half_width_95": 181.11311536696198,
       "interval": [
        1405.2066763239138,
        1767.4329070578376
       ],
       "rank": 32,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 1586.3197916908757
      },
      "tier_gap": 3,
      "unit": "elo"
     }
    },
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
    "clubs": {
     "fav": "Aston Villa",
     "opp": "Viking FK"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "LWD",
    "opp": "WWW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 22,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": null,
      "resolved_by": "not_in_corpus"
     },
     "home": {
      "corpus_name": "Aston Villa",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Viking FK (not_in_corpus) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Aston Villa",
   "in_play": false,
   "kalshi": {
    "ask_c": 76,
    "ask_size": 11,
    "bid_c": 62,
    "bid_size": 14,
    "event_ticker": "KXUCLGAME-26OCT21AVLVIK",
    "flags": [
     "WIDE",
     "THIN"
    ],
    "spread_c": 14,
    "ticker": "KXUCLGAME-26OCT21AVLVIK-AVL"
   },
   "kickoff": "2026-10-21T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.6244452771698168,
    "gd": 1.5941199529812835,
    "gf": 2.2185652301511003,
    "leagues": {
     "fav": "epl",
     "opp": "eliteserien"
    },
    "measured_as": {
     "fav": "epl",
     "opp": "eliteserien"
    }
   },
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "VIK",
     "h": "AVL"
    },
    "market": {
     "a": 0.181818,
     "d": 0.242424,
     "h": 0.575758
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 24,
       "ask_size": 100,
       "bid_c": 6,
       "bid_size": 15,
       "spread_c": 18,
       "ticker": "KXUCLGAME-26OCT21AVLVIK-VIK"
      },
      "d": {
       "ask_c": 32,
       "ask_size": 14,
       "bid_c": 7,
       "bid_size": 100,
       "spread_c": 25,
       "ticker": "KXUCLGAME-26OCT21AVLVIK-TIE"
      },
      "h": {
       "ask_c": 76,
       "ask_size": 11,
       "bid_c": 62,
       "bid_size": 14,
       "spread_c": 14,
       "ticker": "KXUCLGAME-26OCT21AVLVIK-AVL"
      }
     },
     "overround": 1.32,
     "stale": null
    },
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": "cups_side_unrated",
    "model_why_detail": "CUP MODEL: a side is not rated in any of the eight unified league streams at this kickoff (another league, too few or too old league matches, or absent from its league in season)",
    "top": {
     "market": [
      "h"
     ],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Viking FK",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -1.7494517543859651
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 9,
    "opp": 1
   },
   "rated_in": {
    "away": "eliteserien",
    "home": "epl"
   },
   "rates": {
    "ga": [
     1.493421052631579,
     1.0
    ],
    "gdg": [
     -0.19736842105263164,
     1.5520833333333335
    ],
    "gf": [
     1.2960526315789473,
     2.5520833333333335
    ],
    "ppg": [
     1.381578947368421,
     2.3958333333333335
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Aston Villa": "exact",
    "Viking FK": "exact"
   },
   "shape": "HOLLOW",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": -2,
    "def": -2,
    "ovr": -2
   },
   "tiers": {
    "atk": [
     3,
     1
    ],
    "def": [
     3,
     1
    ],
    "ovr": [
     3,
     1
    ]
   },
   "venue": {
    "city": "Birmingham",
    "country": "England",
    "name": "Villa Park"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": "home",
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "TRUE_HOME"
   },
   "weights": {
    "away": 0.6875,
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
   "away": "Arsenal",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915312",
   "cross_league": true,
   "current_only": {
    "favourite": "Bayern Munich",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Bayern Munich"
   },
   "espn": "uefa.champions",
   "event_id": "401915312",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Bayern Munich",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.20437807541351002,
       "interval": [
        0.9401187952127952,
        1.3488749460398153
       ],
       "rank": 1,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1.1444968706263052
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.23662633847746606,
       "interval": [
        0.6303230133932205,
        1.1035756903481526
       ],
       "rank": 4,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.8669493518706866
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.3421868694740265,
       "interval": [
        0.1832336817574693,
        0.8676074207055222
       ],
       "rank": 11,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.5254205512314958
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.3704181241313197,
       "interval": [
        0.7786870450085158,
        1.5195232932711553
       ],
       "rank": 1,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1.1491051691398355
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 54.15246901718159,
       "interval": [
        2009.5504869734953,
        2117.8554250078582
       ],
       "rank": 1,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 2063.702955990677
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 43.10529591550382,
       "interval": [
        2002.59780163583,
        2088.8083934668375
       ],
       "rank": 2,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 2045.7030975513337
      },
      "tier_gap": 0,
      "unit": "elo"
     }
    },
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
    "clubs": {
     "fav": "Bayern Munich",
     "opp": "Arsenal"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "WWD",
    "opp": "WLW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Arsenal",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Bayern München",
      "resolved_by": "alias"
     }
    },
    "last_meeting": {
     "away": "Bayern München",
     "away_score": 1,
     "competition": "ucl",
     "completed": true,
     "date": "2025-11-26T20:00:00+00:00",
     "home": "Arsenal",
     "home_score": 3,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Bayern München",
      "away_score": 1,
      "competition": "ucl",
      "completed": true,
      "date": "2025-11-26T20:00:00+00:00",
      "home": "Arsenal",
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
     "away": 1,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2026-05-30",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2026-05-30; this season's results 2026-09-09 to 2026-10-21",
     "sweep": {
      "from": "2026-09-09",
      "to": "2026-10-21"
     },
     "to": "2026-10-21"
    }
   },
   "home": "Bayern Munich",
   "in_play": false,
   "kalshi": {
    "ask_c": 45,
    "ask_size": 3294,
    "bid_c": 42,
    "bid_size": 11,
    "event_ticker": "KXUCLGAME-26OCT21BMUARS",
    "flags": [],
    "spread_c": 3,
    "ticker": "KXUCLGAME-26OCT21BMUARS-BMU"
   },
   "kickoff": "2026-10-21T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 1.5431317868946073,
    "gd": -0.6835363411231522,
    "gf": 0.8595954457714551,
    "leagues": {
     "fav": "bundesliga",
     "opp": "epl"
    },
    "measured_as": {
     "fav": "bundesliga",
     "opp": "epl"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "ARS",
     "h": "MUN"
    },
    "market": {
     "a": 0.367925,
     "d": 0.207547,
     "h": 0.424528
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 39,
       "ask_size": 140,
       "bid_c": 36,
       "bid_size": 75,
       "spread_c": 3,
       "ticker": "KXUCLGAME-26OCT21BMUARS-ARS"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 47,
       "bid_c": 19,
       "bid_size": 13,
       "spread_c": 3,
       "ticker": "KXUCLGAME-26OCT21BMUARS-TIE"
      },
      "h": {
       "ask_c": 45,
       "ask_size": 3294,
       "bid_c": 42,
       "bid_size": 11,
       "spread_c": 3,
       "ticker": "KXUCLGAME-26OCT21BMUARS-BMU"
      }
     },
     "overround": 1.06,
     "stale": null
    },
    "market_why": null,
    "model": {
     "a": 0.405923,
     "d": 0.241472,
     "h": 0.352604
    },
    "model_meta": {
     "label": "experimental, unproven — cups: paper only",
     "name": "unified-cups-nb-v1",
     "paper_only": true,
     "read_at": "2026-10-14T09:08:06.732082+00:00",
     "source": "unified_cups",
     "status": "untested",
     "test_verdict": "PASS_NOT_WORSE"
    },
    "model_why": null,
    "model_why_detail": null,
    "top": {
     "market": [
      "h"
     ],
     "model": [
      "a"
     ]
    },
    "verdict": "conflict"
   },
   "opponent": "Arsenal",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.4500902992776057
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 2
   },
   "rated_in": {
    "away": "epl",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     0.9725490196078432,
     0.756578947368421
    ],
    "gdg": [
     2.4862745098039216,
     1.036184210526316
    ],
    "gf": [
     3.458823529411765,
     1.792763157894737
    ],
    "ppg": [
     2.4784313725490197,
     2.3355263157894735
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Arsenal": "exact",
    "Bayern Munich": "exact"
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
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": "home",
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "TRUE_HOME"
   },
   "weights": {
    "away": 0.375,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.3333333333333333,
    "k": 10.0,
    "min": 0.3333333333333333
   }
  }
 ]
} as const;
export const CUP_NO_MODEL_BLOCKS = {
 "campeones": {
  "book_flag": null,
  "codes": {
   "a": null,
   "h": null
  },
  "market": null,
  "market_meta": null,
  "market_why": "no_three_way_book",
  "model": null,
  "model_meta": null,
  "model_why": "cups_pool_not_passed",
  "model_why_detail": "no model. This cup is in the cup model's MLS–Liga MX (Leagues Cup, Concacaf Champions Cup, Campeones Cup) pool, and that pool did not pass its pre-registered test (FAIL_VOID_CONTROL, research_archive/unified_cups_2026-10-12), so no model prices this tie, on paper or otherwise. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "top": {
   "market": [],
   "model": []
  },
  "verdict": "no_model"
 },
 "concacafcc": {
  "book_flag": null,
  "codes": {
   "a": null,
   "h": null
  },
  "market": null,
  "market_meta": null,
  "market_why": "no_three_way_book",
  "model": null,
  "model_meta": null,
  "model_why": "cups_pool_not_passed",
  "model_why_detail": "no model. This cup is in the cup model's MLS–Liga MX (Leagues Cup, Concacaf Champions Cup, Campeones Cup) pool, and that pool did not pass its pre-registered test (FAIL_VOID_CONTROL, research_archive/unified_cups_2026-10-12), so no model prices this tie, on paper or otherwise. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "top": {
   "market": [],
   "model": []
  },
  "verdict": "no_model"
 },
 "eflcup": {
  "book_flag": null,
  "codes": {
   "a": null,
   "h": null
  },
  "market": null,
  "market_meta": null,
  "market_why": "no_three_way_book",
  "model": null,
  "model_meta": null,
  "model_why": "cups_not_a_pooled_cup",
  "model_why_detail": "no model. This competition is in none of the cup model's tested pools: most ties pair a rated club with a lower-division or amateur club that has no rating here, so too few rated-v-rated ties exist to test a model on; second-tier ratings come first (not built). No model prices this tie, on paper or otherwise. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "top": {
   "market": [],
   "model": []
  },
  "verdict": "no_model"
 },
 "leaguescup": {
  "book_flag": null,
  "codes": {
   "a": null,
   "h": null
  },
  "market": null,
  "market_meta": null,
  "market_why": "no_three_way_book",
  "model": null,
  "model_meta": null,
  "model_why": "cups_pool_not_passed",
  "model_why_detail": "no model. This cup is in the cup model's MLS–Liga MX (Leagues Cup, Concacaf Champions Cup, Campeones Cup) pool, and that pool did not pass its pre-registered test (FAIL_VOID_CONTROL, research_archive/unified_cups_2026-10-12), so no model prices this tie, on paper or otherwise. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "top": {
   "market": [],
   "model": []
  },
  "verdict": "no_model"
 }
} as const;

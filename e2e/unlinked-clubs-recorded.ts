/* THE TWO CUPS-TAB CARDS SON NAMED ON 2026-10-14, RECORDED OFF THE WIRE.
 *
 * LASK Linz v Liverpool and Shakhtar Donetsk v AEK Athens, Champions
 * League, 2026-10-14. HOW: backend branch `unrated-club-fields`
 * (src/picker/unlinked_clubs.py), GET /api/picker/board?date=20261014&
 * days=1&leagues=ucl through FastAPI's TestClient IN PROCESS, every
 * upstream served from that branch's recorded payloads
 * (tests/fixtures/unlinked_clubs_2026-10-14/: ESPN's UCL scoreboard, the
 * team documents, the Austrian, Greek and English tables and form
 * scoreboards, API-Football's Ukrainian table). Kalshi off, nothing
 * written (`snapshots.capture_rows` made a no-op), no request to
 * production.
 *
 * BEFORE is the same route with the fill switched off — the cards Son
 * saw: "no rank v #4 · ppg not stated/1.55 · gp not stated/6" and
 * "#1 v no rank · ppg 2.50/not stated". AFTER is the fill: reason
 * `unlinked_league`, both clubs' own figures under `sides`, and each
 * side's within-league tiers under `league_tiers`. Verbatim. */
export const UNLINKED_BEFORE = [
 {
  "refused": true,
  "club": "LASK Linz",
  "reason": "no_prior_row",
  "home": "LASK Linz",
  "away": "Liverpool",
  "league": "ucl",
  "column": "ucl",
  "columns": [
   "ucl"
  ],
  "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "this_season": null,
  "admission": null,
  "opponent_row": {
   "club": "Liverpool",
   "table_club": "Liverpool",
   "resolved_by": "exact",
   "rated": true,
   "rated_in": "epl",
   "table_note": null,
   "ppg": 1.549342105263158,
   "gf": 1.473684210526316,
   "ga": 1.3092105263157894,
   "gdg": 0.16447368421052655,
   "gp_current": 6,
   "rank": 4,
   "of": 17,
   "weight": 0.375,
   "basis": "blend"
  },
  "sides": null,
  "refusal": {
   "reason": "no_prior_row",
   "case": "not_in_this_season",
   "why": "the club has no row in the table the board compares on, and this season's standings do not list it either — so there are no figures to report, only the fact that the name reached no table.",
   "carries": [
    "opponent_row"
   ],
   "absent": {
    "this_season": "no member league's current season lists the club — epl: this season's standings do not list the club; laliga: this season's standings do not list the club; bundesliga: this season's standings do not list the club; seriea: this season's standings do not list the club; ligue1: this season's standings do not list the club; eredivisie: this season's standings do not list the club; primeiraliga: this season's standings do not list the club; superlig: this season's standings do not list the club; eliteserien: this season's standings do not list the club; czechliga: this season's standings do not list the club; ukrpremier: this season's standings do not list the club; slovaksuperliga: this season's standings do not list the club; azerpremyer: this season's standings do not list the club",
    "admission": "there is no current-season line to be short of",
    "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
   },
   "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
  },
  "event_id": "401915415",
  "competition_id": "401915415",
  "kickoff": "2026-10-14T16:45Z",
  "espn": "uefa.champions",
  "state": "pre",
  "in_play": false,
  "venue": {
   "name": "Raiffeisen Arena (Linz)",
   "city": "Linz",
   "country": "Austria"
  },
  "venue_class": {
   "class": "UNKNOWN",
   "home_side": null
  },
  "kalshi": {
   "event_ticker": "KXUCLGAME-26OCT14ASKLFC",
   "ticker": "KXUCLGAME-26OCT14ASKLFC-ASK",
   "ask_c": 12,
   "bid_c": 11,
   "spread_c": 1,
   "ask_size": 312733,
   "bid_size": 48329,
   "flags": [],
   "side": "LASK Linz"
  },
  "form": {
   "home": null,
   "away": "WDWL",
   "scope": "its own league",
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
     "corpus_name": null,
     "resolved_by": "no_rated_league"
    },
    "away": {
     "corpus_name": "Liverpool",
     "resolved_by": "exact"
    }
   },
   "reason": "no head-to-head: LASK Linz (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed"
  },
  "model_vs_market": {
   "model": null,
   "market": {
    "h": 0.118812,
    "d": 0.168317,
    "a": 0.712871
   },
   "verdict": "no_model",
   "model_meta": null,
   "book_flag": null,
   "top": {
    "model": [],
    "market": [
     "a"
    ]
   },
   "codes": {
    "h": "LAS",
    "a": "LIV"
   },
   "model_why": "plane_not_ready",
   "model_why_detail": null,
   "market_why": null,
   "market_meta": {
    "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
    "overround": 1.01,
    "legs": {
     "h": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-ASK",
      "ask_c": 12,
      "bid_c": 11,
      "spread_c": 1,
      "ask_size": 312733,
      "bid_size": 48329
     },
     "d": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-TIE",
      "ask_c": 17,
      "bid_c": 16,
      "spread_c": 1,
      "ask_size": 186155,
      "bid_size": 150035
     },
     "a": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-LFC",
      "ask_c": 72,
      "bid_c": 71,
      "spread_c": 1,
      "ask_size": 488690,
      "bid_size": 47890
     }
    },
    "book_flag_leg": null,
    "stale": null
   }
  }
 },
 {
  "refused": true,
  "club": "AEK Athens",
  "reason": "no_prior_row",
  "home": "Shakhtar Donetsk",
  "away": "AEK Athens",
  "league": "ucl",
  "column": "ucl",
  "columns": [
   "ucl"
  ],
  "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "this_season": null,
  "admission": null,
  "opponent_row": {
   "club": "Shakhtar Donetsk",
   "table_club": "Shakhtar Donetsk",
   "resolved_by": "exact",
   "rated": true,
   "rated_in": "ukrpremier",
   "table_note": null,
   "ppg": 2.5,
   "gf": 2.314814814814815,
   "ga": 0.6111111111111112,
   "gdg": 1.7037037037037037,
   "gp_current": 8,
   "rank": 1,
   "of": 13,
   "weight": 0.4444444444444444,
   "basis": "blend"
  },
  "sides": null,
  "refusal": {
   "reason": "no_prior_row",
   "case": "not_in_this_season",
   "why": "the club has no row in the table the board compares on, and this season's standings do not list it either — so there are no figures to report, only the fact that the name reached no table.",
   "carries": [
    "opponent_row"
   ],
   "absent": {
    "this_season": "no member league's current season lists the club — epl: this season's standings do not list the club; laliga: this season's standings do not list the club; bundesliga: this season's standings do not list the club; seriea: this season's standings do not list the club; ligue1: this season's standings do not list the club; eredivisie: this season's standings do not list the club; primeiraliga: this season's standings do not list the club; superlig: this season's standings do not list the club; eliteserien: this season's standings do not list the club; czechliga: this season's standings do not list the club; ukrpremier: this season's standings do not list the club; slovaksuperliga: this season's standings do not list the club; azerpremyer: this season's standings do not list the club",
    "admission": "there is no current-season line to be short of",
    "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
   },
   "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
  },
  "event_id": "401915406",
  "competition_id": "401915406",
  "kickoff": "2026-10-14T19:00Z",
  "espn": "uefa.champions",
  "state": "pre",
  "in_play": false,
  "venue": {
   "name": "Stamford Bridge",
   "city": "London",
   "country": "England"
  },
  "venue_class": {
   "class": "UNKNOWN",
   "home_side": null
  },
  "kalshi": {
   "event_ticker": "KXUCLGAME-26OCT14SHAAEK",
   "ticker": "KXUCLGAME-26OCT14SHAAEK-SHA",
   "ask_c": 35,
   "bid_c": 34,
   "spread_c": 1,
   "ask_size": 1281,
   "bid_size": 67937,
   "flags": [],
   "side": "Shakhtar Donetsk"
  },
  "form": {
   "home": null,
   "away": null,
   "scope": "its own league",
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
     "corpus_name": "Shakhtar Donetsk",
     "resolved_by": "exact_outside_league"
    },
    "away": {
     "corpus_name": null,
     "resolved_by": "no_rated_league"
    }
   },
   "reason": "no head-to-head: AEK Athens (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed"
  },
  "model_vs_market": {
   "model": null,
   "market": {
    "h": 0.35,
    "d": 0.28,
    "a": 0.37
   },
   "verdict": "no_model",
   "model_meta": null,
   "book_flag": null,
   "top": {
    "model": [],
    "market": [
     "a"
    ]
   },
   "codes": {
    "h": "SHK",
    "a": "AEK"
   },
   "model_why": "plane_not_ready",
   "model_why_detail": null,
   "market_why": null,
   "market_meta": {
    "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
    "overround": 1.0,
    "legs": {
     "h": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-SHA",
      "ask_c": 35,
      "bid_c": 34,
      "spread_c": 1,
      "ask_size": 1281,
      "bid_size": 67937
     },
     "d": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-TIE",
      "ask_c": 28,
      "bid_c": 27,
      "spread_c": 1,
      "ask_size": 21802,
      "bid_size": 107344
     },
     "a": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-AEK",
      "ask_c": 37,
      "bid_c": 36,
      "spread_c": 1,
      "ask_size": 128033,
      "bid_size": 442
     }
    },
    "book_flag_leg": null,
    "stale": null
   }
  }
 }
];

export const UNLINKED_AFTER = [
 {
  "refused": true,
  "club": null,
  "reason": "unlinked_league",
  "home": "LASK Linz",
  "away": "Liverpool",
  "league": "ucl",
  "column": "ucl",
  "columns": [
   "ucl"
  ],
  "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "this_season": null,
  "admission": null,
  "opponent_row": null,
  "sides": {
   "home": {
    "club": "LASK Linz",
    "table_club": "LASK Linz",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "aut.1",
    "table_note": null,
    "ppg": 2.0,
    "gf": 2.375,
    "ga": 1.125,
    "gdg": 1.25,
    "gp_current": 8,
    "rank": 3,
    "of": 12,
    "weight": 1.0,
    "basis": "current_only",
    "rated_in_name": "Austrian Bundesliga",
    "table_source": "ESPN standings for Austrian Bundesliga, this season only",
    "league_tiers": {
     "ovr": 1,
     "atk": 1,
     "def": 1,
     "of": 12,
     "rule": "within-league quintiles of this club's own table (ppg, GF/g, GA/g), 1 = best fifth — the rule every league card uses; a position in ONE league, never compared with the other side's"
    }
   },
   "away": {
    "club": "Liverpool",
    "table_club": "Liverpool",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "epl",
    "table_note": null,
    "ppg": 1.549342105263158,
    "gf": 1.473684210526316,
    "ga": 1.3092105263157894,
    "gdg": 0.16447368421052655,
    "gp_current": 6,
    "rank": 4,
    "of": 17,
    "weight": 0.375,
    "basis": "blend",
    "rated_in_name": "Premier League",
    "table_source": "Premier League, a member league of this cup",
    "league_tiers": {
     "ovr": 1,
     "atk": 3,
     "def": 2,
     "of": 17,
     "rule": "within-league quintiles of this club's own table (ppg, GF/g, GA/g), 1 = best fifth — the rule every league card uses; a position in ONE league, never compared with the other side's"
    }
   }
  },
  "refusal": {
   "reason": "unlinked_league",
   "case": "unlinked_league",
   "why": "a club in this tie plays in a league that is not one of this cup's member tables, so the board has no table that rates it beside the other club. Its OWN domestic table was read for this card (src/picker/unlinked_clubs.py), and `sides` reports each club on its own league: rank and the size of that ordering, rates, games played and the within-league OVR/ATK/DEF quintile tiers. Those are positions in two different leagues, shown side by side and never set against each other: no favourite, no gap, no league gap, no tier gap and no shape.",
   "carries": [
    "sides"
   ],
   "absent": {
    "this_season": "this block is the REFUSED club's own current season, and this refusal names no club. Both clubs' figures are in `sides`, off the blended table the board ranks on; repeating one of them here on this season alone would be the same club under two names on two weightings, which is how a card comes to contradict itself.",
    "admission": "the admission gate is a promoted club's countdown inside a table the board rates on; this club's league is not one of this cup's member tables, so there is no gate to count down to — playing more games does not link the league",
    "opponent_row": "nothing was refused about one club, so neither of these two is the OPPONENT of the other here — `sides` reports them both, each on its own league's table, and neither is signed against the other."
   },
   "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
   "detail": {
    "unlinked_league": "LASK Linz is rated here only on its own domestic table, read for this card. That league is not one of this cup's member tables, so no favourite, gap, league gap, tier gap or shape is computed, and no model runs on it."
   }
  },
  "event_id": "401915415",
  "competition_id": "401915415",
  "kickoff": "2026-10-14T16:45Z",
  "espn": "uefa.champions",
  "state": "pre",
  "in_play": false,
  "venue": {
   "name": "Raiffeisen Arena (Linz)",
   "city": "Linz",
   "country": "Austria"
  },
  "venue_class": {
   "class": "UNKNOWN",
   "home_side": null
  },
  "kalshi": {
   "event_ticker": "KXUCLGAME-26OCT14ASKLFC",
   "ticker": "KXUCLGAME-26OCT14ASKLFC-ASK",
   "ask_c": 12,
   "bid_c": 11,
   "spread_c": 1,
   "ask_size": 312733,
   "bid_size": 48329,
   "flags": [],
   "side": "LASK Linz"
  },
  "form": {
   "home": "LDL",
   "away": "WDWL",
   "scope": "its own league",
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
     "corpus_name": null,
     "resolved_by": "no_rated_league"
    },
    "away": {
     "corpus_name": "Liverpool",
     "resolved_by": "exact"
    }
   },
   "reason": "no head-to-head: LASK Linz (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed"
  },
  "model_vs_market": {
   "model": null,
   "market": {
    "h": 0.118812,
    "d": 0.168317,
    "a": 0.712871
   },
   "verdict": "no_model",
   "model_meta": null,
   "book_flag": null,
   "top": {
    "model": [],
    "market": [
     "a"
    ]
   },
   "codes": {
    "h": "LAS",
    "a": "LIV"
   },
   "model_why": "plane_not_ready",
   "model_why_detail": null,
   "market_why": null,
   "market_meta": {
    "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
    "overround": 1.01,
    "legs": {
     "h": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-ASK",
      "ask_c": 12,
      "bid_c": 11,
      "spread_c": 1,
      "ask_size": 312733,
      "bid_size": 48329
     },
     "d": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-TIE",
      "ask_c": 17,
      "bid_c": 16,
      "spread_c": 1,
      "ask_size": 186155,
      "bid_size": 150035
     },
     "a": {
      "ticker": "KXUCLGAME-26OCT14ASKLFC-LFC",
      "ask_c": 72,
      "bid_c": 71,
      "spread_c": 1,
      "ask_size": 488690,
      "bid_size": 47890
     }
    },
    "book_flag_leg": null,
    "stale": null
   }
  }
 },
 {
  "refused": true,
  "club": null,
  "reason": "unlinked_league",
  "home": "Shakhtar Donetsk",
  "away": "AEK Athens",
  "league": "ucl",
  "column": "ucl",
  "columns": [
   "ucl"
  ],
  "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "this_season": null,
  "admission": null,
  "opponent_row": null,
  "sides": {
   "home": {
    "club": "Shakhtar Donetsk",
    "table_club": "Shakhtar Donetsk",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "ukrpremier",
    "table_note": null,
    "ppg": 2.5,
    "gf": 2.314814814814815,
    "ga": 0.6111111111111112,
    "gdg": 1.7037037037037037,
    "gp_current": 8,
    "rank": 1,
    "of": 13,
    "weight": 0.4444444444444444,
    "basis": "blend",
    "rated_in_name": "Ukrainian Premier League",
    "table_source": "Ukrainian Premier League, a member league of this cup",
    "league_tiers": {
     "ovr": 1,
     "atk": 1,
     "def": 1,
     "of": 13,
     "rule": "within-league quintiles of this club's own table (ppg, GF/g, GA/g), 1 = best fifth — the rule every league card uses; a position in ONE league, never compared with the other side's"
    }
   },
   "away": {
    "club": "AEK Athens",
    "table_club": "AEK Athens",
    "resolved_by": "exact",
    "rated": true,
    "rated_in": "gre.1",
    "table_note": null,
    "ppg": 2.3333333333333335,
    "gf": 2.6666666666666665,
    "ga": 0.5,
    "gdg": 2.1666666666666665,
    "gp_current": 6,
    "rank": 2,
    "of": 14,
    "weight": 1.0,
    "basis": "current_only",
    "rated_in_name": "Greek Super League",
    "table_source": "ESPN standings for Greek Super League, this season only",
    "league_tiers": {
     "ovr": 1,
     "atk": 1,
     "def": 1,
     "of": 14,
     "rule": "within-league quintiles of this club's own table (ppg, GF/g, GA/g), 1 = best fifth — the rule every league card uses; a position in ONE league, never compared with the other side's"
    }
   }
  },
  "refusal": {
   "reason": "unlinked_league",
   "case": "unlinked_league",
   "why": "a club in this tie plays in a league that is not one of this cup's member tables, so the board has no table that rates it beside the other club. Its OWN domestic table was read for this card (src/picker/unlinked_clubs.py), and `sides` reports each club on its own league: rank and the size of that ordering, rates, games played and the within-league OVR/ATK/DEF quintile tiers. Those are positions in two different leagues, shown side by side and never set against each other: no favourite, no gap, no league gap, no tier gap and no shape.",
   "carries": [
    "sides"
   ],
   "absent": {
    "this_season": "this block is the REFUSED club's own current season, and this refusal names no club. Both clubs' figures are in `sides`, off the blended table the board ranks on; repeating one of them here on this season alone would be the same club under two names on two weightings, which is how a card comes to contradict itself.",
    "admission": "the admission gate is a promoted club's countdown inside a table the board rates on; this club's league is not one of this cup's member tables, so there is no gate to count down to — playing more games does not link the league",
    "opponent_row": "nothing was refused about one club, so neither of these two is the OPPONENT of the other here — `sides` reports them both, each on its own league's table, and neither is signed against the other."
   },
   "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
   "detail": {
    "unlinked_league": "AEK Athens is rated here only on its own domestic table, read for this card. That league is not one of this cup's member tables, so no favourite, gap, league gap, tier gap or shape is computed, and no model runs on it."
   }
  },
  "event_id": "401915406",
  "competition_id": "401915406",
  "kickoff": "2026-10-14T19:00Z",
  "espn": "uefa.champions",
  "state": "pre",
  "in_play": false,
  "venue": {
   "name": "Stamford Bridge",
   "city": "London",
   "country": "England"
  },
  "venue_class": {
   "class": "UNKNOWN",
   "home_side": null
  },
  "kalshi": {
   "event_ticker": "KXUCLGAME-26OCT14SHAAEK",
   "ticker": "KXUCLGAME-26OCT14SHAAEK-SHA",
   "ask_c": 35,
   "bid_c": 34,
   "spread_c": 1,
   "ask_size": 1281,
   "bid_size": 67937,
   "flags": [],
   "side": "Shakhtar Donetsk"
  },
  "form": {
   "home": null,
   "away": "WDWW",
   "scope": "its own league",
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
     "corpus_name": "Shakhtar Donetsk",
     "resolved_by": "exact_outside_league"
    },
    "away": {
     "corpus_name": null,
     "resolved_by": "no_rated_league"
    }
   },
   "reason": "no head-to-head: AEK Athens (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed"
  },
  "model_vs_market": {
   "model": null,
   "market": {
    "h": 0.35,
    "d": 0.28,
    "a": 0.37
   },
   "verdict": "no_model",
   "model_meta": null,
   "book_flag": null,
   "top": {
    "model": [],
    "market": [
     "a"
    ]
   },
   "codes": {
    "h": "SHK",
    "a": "AEK"
   },
   "model_why": "plane_not_ready",
   "model_why_detail": null,
   "market_why": null,
   "market_meta": {
    "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
    "overround": 1.0,
    "legs": {
     "h": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-SHA",
      "ask_c": 35,
      "bid_c": 34,
      "spread_c": 1,
      "ask_size": 1281,
      "bid_size": 67937
     },
     "d": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-TIE",
      "ask_c": 28,
      "bid_c": 27,
      "spread_c": 1,
      "ask_size": 21802,
      "bid_size": 107344
     },
     "a": {
      "ticker": "KXUCLGAME-26OCT14SHAAEK-AEK",
      "ask_c": 37,
      "bid_c": 36,
      "spread_c": 1,
      "ask_size": 128033,
      "bid_size": 442
     }
    },
    "book_flag_leg": null,
    "stale": null
   }
  }
 }
];

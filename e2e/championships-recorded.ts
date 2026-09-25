/* THE CHAMPIONSHIPS BOARD, RECORDED OFF THE ROUTE — not off a brief.
 *
 * `api.main.championships_board(date=20260925, days=14)` — the
 * route's own handler, called IN PROCESS on the backend branch
 * `board-data-gaps` (read-only; the route writes nothing), assembled
 * 2026-09-25T23:48:22.023313+00:00: 178 ranked rows, 0 refusals,
 * 24 off the board. Columns ["unl","cnl","afcon"]: on
 * 2026-09-25 the AFC Asian Cup left the board (it starts in 2027), and the
 * Arabian Gulf Cup that replaced it was dropped the same day (no Kalshi
 * series lists it).
 *
 * WHAT THIS RECORDING CARRIES THAT THE LAST ONE DID NOT: the served
 * `headline` on every card; attack and defence at the LICENSED band count
 * (`field.axes.atk|def.licensed`) beside the declared five; the national
 * head-to-head filled from our own corpus where ESPN lists no meeting
 * (`source: "corpus_since_2018"`, with its `window`), including the
 * measured absence ("no meeting since 2018 in our corpus").
 *
 * HOW IT WAS TRIMMED, AND NOTHING ELSE WAS TOUCHED. Cut to the page's own
 * ask (`days=8`) exactly as `payload._in_window` cuts it, then to
 * 19 rows — the first five of each declared column by kickoff, the
 * `field_partial` rows, one whose group has started, a corpus meeting,
 * two corpus absences, a form strip with a disputed result ("?"), two
 * rows whose licensed pair differs from the
 * five-band one, and the fixture SAMPLE_REFUSAL stands in for — and three
 * of the off-board entries. `competitions` is cut to what a surface
 * reads: stages, derived group tables, and the last column's next fixtures.
 * Every kept key, value and absence is the wire's.
 *
 * THREE CONSTANTS ARE KEPT FROM THE 2026-09-24 RECORDING, BY NAME:
 *  - SAMPLE_REFUSAL, the route's own refused card for Georgia v Northern
 *    Ireland ("401861049", in this window too), built by the backend's
 *    own code at aca990d — see the spec that swaps it in;
 *  - XI_LINEUPS, the `national.lineups` block of Dominican Republic v
 *    Nicaragua (401900637) as recorded then with both XIs announced.
 *    kept as the XI spec's fallback for a recording in which no fixture
 *    has published an XI yet;
 *  - INTERIM_DR_NIC, the whole ranked row of Dominican Republic v Nicaragua
 *    (401900637) as served BEFORE the backend sent a headline, with
 *    its clock INTERIM_CLOCK. Every card in this window carries the served
 *    headline, so the card's interim venue-adjusted fallback — still the
 *    path for a payload without one — is proved on the row it was built
 *    for. */
export const CHAMP_CLOCK = "2026-09-25T23:48:22.023313+00:00";

export const CHAMP_BOARD = {
 "generated_at": "2026-09-25T23:48:22.023313+00:00",
 "date": "2026-09-25",
 "days": 8,
 "mode": "championships",
 "columns": [
  "unl",
  "cnl",
  "afcon"
 ],
 "leagues": {
  "unl": {
   "kind": "championship",
   "display": "UEFA Nations League",
   "edition": "2026-27",
   "confederation": "UEFA",
   "espn": [
    "uefa.nations"
   ],
   "src": null,
   "min_current_gp": null,
   "clubs": 54,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through."
  },
  "cnl": {
   "kind": "championship",
   "display": "Concacaf Nations League",
   "edition": "2026-27",
   "confederation": "CONCACAF",
   "espn": [
    "concacaf.nations.league"
   ],
   "src": null,
   "min_current_gp": null,
   "clubs": 37,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through."
  },
  "afcon": {
   "kind": "championship",
   "display": "Africa Cup of Nations",
   "edition": "2027",
   "confederation": "CAF",
   "espn": [
    "caf.nations_qual",
    "caf.nations"
   ],
   "src": null,
   "min_current_gp": null,
   "clubs": 48,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through."
  }
 },
 "rows": [
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "Slovenia",
   "away": "Scotland",
   "favourite": "Slovenia",
   "opponent": "Scotland",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Slovenia": "espn_id",
    "Scotland": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 23,
    "opp": 22
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
     2
    ],
    "atk": [
     2,
     2
    ],
    "def": [
     2,
     2
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": 0
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Slovenia",
     "opp": "Scotland"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 23,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1680.3509317792189,
       "half_width_95": 15.850958904382917,
       "interval": [
        1664.499972874836,
        1696.2018906836017
       ]
      },
      "opp": {
       "rank": 22,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1699.9591761507338,
       "half_width_95": 28.87747144146387,
       "interval": [
        1671.0817047092698,
        1728.8366475921978
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 19.94094583055174,
       "opp": 32.794278524768934
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 33,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.29771379505986795,
       "half_width_95": 0.30747364167255037,
       "interval": [
        -0.009759846612682421,
        0.6051874367324184
       ]
      },
      "opp": {
       "rank": 23,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4713141651248924,
       "half_width_95": 0.30132724471881744,
       "interval": [
        0.16998692040607494,
        0.7726414098437098
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.32128797590281827,
       "opp": 0.31952513893504547
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2,
         3
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 23,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.40801093865298965,
       "half_width_95": 0.3270633160101072,
       "interval": [
        0.08094762264288247,
        0.7350742546630968
       ]
      },
      "opp": {
       "rank": 17,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4983174553847277,
       "half_width_95": 0.316702123099071,
       "interval": [
        0.18161533228565674,
        0.8150195784837987
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.34105605674914247,
       "opp": 0.3334465863090908
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "HOLLOW",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861057",
   "competition_id": "401861057",
   "kickoff": "2026-09-26T13:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Stadion Stozice",
    "city": "Ljubljana",
    "country": "Slovenia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26SLOSCO",
    "ticker": "KXUEFANLGAME-26SEP26SLOSCO-SLO",
    "ask_c": 37,
    "bid_c": 36,
    "spread_c": 1,
    "ask_size": 17080,
    "bid_size": 14860,
    "flags": []
   },
   "form": {
    "fav": "DLWDL",
    "opp": "WWWLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "152444",
      "date": "2004-09-08T19:00:00Z",
      "home": "Scotland",
      "away": "Slovenia",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "178924",
      "date": "2005-10-12T18:30:00Z",
      "home": "Slovenia",
      "away": "Scotland",
      "home_score": 0,
      "away_score": 3,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "337311",
      "date": "2012-02-29T19:45:00Z",
      "home": "Slovenia",
      "away": "Scotland",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "431768",
      "date": "2017-03-26T18:45:00Z",
      "home": "Scotland",
      "away": "Slovenia",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "431663",
      "date": "2017-10-08T16:00:00Z",
      "home": "Slovenia",
      "away": "Scotland",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 0,
     "draw": 3,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "431663",
     "date": "2017-10-08T16:00:00Z",
     "home": "Slovenia",
     "away": "Scotland",
     "home_score": 2,
     "away_score": 2,
     "completed": true,
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group B1",
    "leg": null,
    "status_detail": "Sat, September 26th at 9:00 AM EDT",
    "venue_country": "Slovenia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "slovenia",
      "espn_id": "472",
      "name": "Slovenia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 23,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1680.3509317792189,
         "half_width_95": 15.850958904382917,
         "interval": [
          1664.499972874836,
          1696.2018906836017
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 19.94094583055174,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 33,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.29771379505986795,
         "half_width_95": 0.30747364167255037,
         "interval": [
          -0.009759846612682421,
          0.6051874367324184
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.32128797590281827,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 23,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.40801093865298965,
         "half_width_95": 0.3270633160101072,
         "interval": [
          0.08094762264288247,
          0.7350742546630968
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.34105605674914247,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DLWDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724919",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Sweden",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401857704",
         "date": "2026-03-28T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Hungary",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401856620",
         "date": "2026-03-31T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Montenegro",
         "venue": "away",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401867323",
         "date": "2026-06-04T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cyprus",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401856623",
         "date": "2026-06-07T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Croatia",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "scotland",
      "espn_id": "580",
      "name": "Scotland",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 22,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1699.9591761507338,
         "half_width_95": 28.87747144146387,
         "interval": [
          1671.0817047092698,
          1728.8366475921978
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 32.794278524768934,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 23,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4713141651248924,
         "half_width_95": 0.30132724471881744,
         "interval": [
          0.16998692040607494,
          0.7726414098437098
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.31952513893504547,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 17,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4983174553847277,
         "half_width_95": 0.316702123099071,
         "interval": [
          0.18161533228565674,
          0.8150195784837987
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3334465863090908,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401856621",
         "date": "2026-05-30T12:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Curaçao",
         "venue": "home",
         "gf": 4,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401868148",
         "date": "2026-06-06T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bolivia",
         "venue": "away",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760418",
         "date": "2026-06-14T01:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Haiti",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760445",
         "date": "2026-06-19T22:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Morocco",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760465",
         "date": "2026-06-24T22:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Brazil",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "152444",
       "date": "2004-09-08T19:00:00Z",
       "home": "Scotland",
       "away": "Slovenia",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "178924",
       "date": "2005-10-12T18:30:00Z",
       "home": "Slovenia",
       "away": "Scotland",
       "home_score": 0,
       "away_score": 3,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "337311",
       "date": "2012-02-29T19:45:00Z",
       "home": "Slovenia",
       "away": "Scotland",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "431768",
       "date": "2017-03-26T18:45:00Z",
       "home": "Scotland",
       "away": "Slovenia",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "431663",
       "date": "2017-10-08T16:00:00Z",
       "home": "Slovenia",
       "away": "Scotland",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 0,
      "draw": 3,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "431663",
      "date": "2017-10-08T16:00:00Z",
      "home": "Slovenia",
      "away": "Scotland",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Slovenia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Scotland",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26SLOSCO",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Slovenia vs Scotland",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26SLOSCO",
       "ticker": "KXUEFANLGAME-26SEP26SLOSCO-SLO",
       "ask_c": 37,
       "bid_c": 36,
       "spread_c": 1,
       "ask_size": 17080,
       "bid_size": 14860,
       "flags": [],
       "name": "Slovenia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26SLOSCO",
       "ticker": "KXUEFANLGAME-26SEP26SLOSCO-TIE",
       "ask_c": 31,
       "bid_c": 30,
       "spread_c": 1,
       "ask_size": 22685,
       "bid_size": 15050,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26SLOSCO",
       "ticker": "KXUEFANLGAME-26SEP26SLOSCO-SCO",
       "ask_c": 33,
       "bid_c": 32,
       "spread_c": 1,
       "ask_size": 33052,
       "bid_size": 5551,
       "flags": [],
       "name": "Scotland"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 45.4,
     "favourite_side": "home",
     "home_minus_away": 45.4,
     "components": {
      "elo": {
       "home": 1680.4,
       "away": 1700
      },
      "raw_gap_home_minus_away": -19.6,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": true,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "Iceland",
   "away": "Estonia",
   "favourite": "Iceland",
   "opponent": "Estonia",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Iceland": "espn_id",
    "Estonia": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 34,
    "opp": 42
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     3
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     4,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 1,
    "def": 0
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Iceland",
     "opp": "Estonia"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 34,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1557.9406842870235,
       "half_width_95": 29.467963761403677,
       "interval": [
        1528.4727205256197,
        1587.4086480484273
       ]
      },
      "opp": {
       "rank": 42,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1407.1153462997117,
       "half_width_95": 13.860310336519568,
       "interval": [
        1393.255035963192,
        1420.9756566362314
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 33.18837777517045,
       "opp": 17.780585341784562
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 21,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4772426755359381,
       "half_width_95": 0.3515049117159797,
       "interval": [
        0.12573776381995838,
        0.8287475872519178
       ]
      },
      "opp": {
       "rank": 42,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.17167149679158972,
       "half_width_95": 0.46939713544753475,
       "interval": [
        -0.6410686322391245,
        0.29772563865594504
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.35359209777020584,
       "opp": 0.47967770189311604
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3,
         4
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 41,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.02872704679885857,
       "half_width_95": 0.2939158118747097,
       "interval": [
        -0.26518876507585115,
        0.3226428586735683
       ]
      },
      "opp": {
       "rank": 48,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.17464791131475726,
       "half_width_95": 0.2624216323206335,
       "interval": [
        -0.43706954363539074,
        0.08777372100587622
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.303019760816733,
       "opp": 0.2790862026433804
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861058",
   "competition_id": "401861058",
   "kickoff": "2026-09-26T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Laugardalsvöllur",
    "city": "Reykjavik",
    "country": "Iceland"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26ISLEST",
    "ticker": "KXUEFANLGAME-26SEP26ISLEST-ISL",
    "ask_c": 78,
    "bid_c": 77,
    "spread_c": 1,
    "ask_size": 21850,
    "bid_size": 3000,
    "flags": []
   },
   "form": {
    "fav": "LDDLL",
    "opp": "DLWDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "71227",
      "date": "2002-11-20T16:00:00Z",
      "home": "Estonia",
      "away": "Iceland",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "392349",
      "date": "2014-06-04T19:15:00Z",
      "home": "Iceland",
      "away": "Estonia",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "418646",
      "date": "2015-03-31T16:00:00Z",
      "home": "Estonia",
      "away": "Iceland",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "533551",
      "date": "2019-01-15T16:45:00Z",
      "home": "Iceland",
      "away": "Estonia",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "658264",
      "date": "2023-01-08T17:00:00Z",
      "home": "Iceland",
      "away": "Estonia",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 3,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "658264",
     "date": "2023-01-08T17:00:00Z",
     "home": "Iceland",
     "away": "Estonia",
     "home_score": 1,
     "away_score": 1,
     "completed": true,
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group C4",
    "leg": null,
    "status_detail": "Sat, September 26th at 12:00 PM EDT",
    "venue_country": "Iceland",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "iceland",
      "espn_id": "470",
      "name": "Iceland",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 34,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1557.9406842870235,
         "half_width_95": 29.467963761403677,
         "interval": [
          1528.4727205256197,
          1587.4086480484273
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 33.18837777517045,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 21,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4772426755359381,
         "half_width_95": 0.3515049117159797,
         "interval": [
          0.12573776381995838,
          0.8287475872519178
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.35359209777020584,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 41,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.02872704679885857,
         "half_width_95": 0.2939158118747097,
         "interval": [
          -0.26518876507585115,
          0.3226428586735683
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.303019760816733,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LDDLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401842389",
         "date": "2026-02-26T02:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Mexico",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401856638",
         "date": "2026-03-28T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Canada",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401856641",
         "date": "2026-03-31T17:35Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Haiti",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401867618",
         "date": "2026-05-31T10:25Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Japan",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401867950",
         "date": "2026-06-10T01:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Argentina",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "estonia",
      "espn_id": "444",
      "name": "Estonia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 42,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1407.1153462997117,
         "half_width_95": 13.860310336519568,
         "interval": [
          1393.255035963192,
          1420.9756566362314
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 17.780585341784562,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 42,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.17167149679158972,
         "half_width_95": 0.46939713544753475,
         "interval": [
          -0.6410686322391245,
          0.29772563865594504
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.47967770189311604,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 48,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.17464791131475726,
         "half_width_95": 0.2624216323206335,
         "interval": [
          -0.43706954363539074,
          0.08777372100587622
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2790862026433804,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DLWDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724872",
         "date": "2025-10-14T16:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Moldova",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "724875",
         "date": "2025-11-13T17:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Norway",
         "venue": "away",
         "gf": 1,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "731578",
         "date": "2025-11-18T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cyprus",
         "venue": "away",
         "gf": 4,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401862401",
         "date": "2026-03-27T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kenya",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "W",
         "provider_agrees": false,
         "shootout": {
          "for": 5,
          "against": 4,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "401866740",
         "date": "2026-03-30T17:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Rwanda",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "71227",
       "date": "2002-11-20T16:00:00Z",
       "home": "Estonia",
       "away": "Iceland",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "392349",
       "date": "2014-06-04T19:15:00Z",
       "home": "Iceland",
       "away": "Estonia",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "418646",
       "date": "2015-03-31T16:00:00Z",
       "home": "Estonia",
       "away": "Iceland",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "533551",
       "date": "2019-01-15T16:45:00Z",
       "home": "Iceland",
       "away": "Estonia",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "658264",
       "date": "2023-01-08T17:00:00Z",
       "home": "Iceland",
       "away": "Estonia",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 3,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "658264",
      "date": "2023-01-08T17:00:00Z",
      "home": "Iceland",
      "away": "Estonia",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Iceland",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Estonia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26ISLEST",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Iceland vs Estonia",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26ISLEST",
       "ticker": "KXUEFANLGAME-26SEP26ISLEST-ISL",
       "ask_c": 78,
       "bid_c": 77,
       "spread_c": 1,
       "ask_size": 21850,
       "bid_size": 3000,
       "flags": [],
       "name": "Iceland"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26ISLEST",
       "ticker": "KXUEFANLGAME-26SEP26ISLEST-TIE",
       "ask_c": 16,
       "bid_c": 15,
       "spread_c": 1,
       "ask_size": 20388,
       "bid_size": 1488,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26ISLEST",
       "ticker": "KXUEFANLGAME-26SEP26ISLEST-EST",
       "ask_c": 8,
       "bid_c": 7,
       "spread_c": 1,
       "ask_size": 13871,
       "bid_size": 9905,
       "flags": [],
       "name": "Estonia"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 215.8,
     "favourite_side": "home",
     "home_minus_away": 215.8,
     "components": {
      "elo": {
       "home": 1557.9,
       "away": 1407.1
      },
      "raw_gap_home_minus_away": 150.8,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "San Marino",
   "away": "Finland",
   "favourite": "Finland",
   "opponent": "San Marino",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "San Marino": "espn_id",
    "Finland": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 36,
    "opp": 54
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     5
    ],
    "atk": [
     2,
     4
    ],
    "def": [
     3,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 2,
    "def": 2
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Finland",
     "opp": "San Marino"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 36,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1543.6142852667072,
       "half_width_95": 27.627898732215655,
       "interval": [
        1515.9863865344914,
        1571.2421839989229
       ]
      },
      "opp": {
       "rank": 54,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": false,
       "value": 923.062738785647,
       "half_width_95": 32.805499933510696,
       "interval": [
        890.2572388521363,
        955.8682387191576
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 29.647683077325745,
       "opp": 35.22246163362113
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 34,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.2325430827062404,
       "half_width_95": 0.3617340370719922,
       "interval": [
        -0.1291909543657518,
        0.5942771197782326
       ]
      },
      "opp": {
       "rank": 51,
       "tier": 4,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.8569688616230563,
       "half_width_95": 0.40304737113683936,
       "interval": [
        -1.2600162327598956,
        -0.45392149048621694
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.37810973420305266,
       "opp": 0.417033246904103
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 4,
        "tier_set": [
         4,
         5
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 36,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.15313083635157504,
       "half_width_95": 0.27151394101886983,
       "interval": [
        -0.11838310466729479,
        0.42464477737044487
       ]
      },
      "opp": {
       "rank": 54,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": true,
       "value": -0.6169307951226548,
       "half_width_95": 0.29619835711775133,
       "interval": [
        -0.9131291522404061,
        -0.3207324380049035
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.28245692829725244,
       "opp": 0.3058479333094007
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         3
        ],
        "straddles": false
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861059",
   "competition_id": "401861059",
   "kickoff": "2026-09-26T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "San Marino Stadium",
    "city": "Serravalle",
    "country": "San Marino"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26SMRFIN",
    "ticker": "KXUEFANLGAME-26SEP26SMRFIN-FIN",
    "ask_c": 91,
    "bid_c": 90,
    "spread_c": 1,
    "ask_size": 14664,
    "bid_size": 75,
    "flags": []
   },
   "form": {
    "fav": "WWDLL",
    "opp": "LLDLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "299382",
      "date": "2010-11-17T16:30:00Z",
      "home": "Finland",
      "away": "San Marino",
      "home_score": 8,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "299413",
      "date": "2011-06-03T18:30:00Z",
      "home": "San Marino",
      "away": "Finland",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "655318",
      "date": "2023-06-19T16:00:00Z",
      "home": "Finland",
      "away": "San Marino",
      "home_score": 6,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "655466",
      "date": "2023-11-20T19:45:00Z",
      "home": "San Marino",
      "away": "Finland",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 4
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "655466",
     "date": "2023-11-20T19:45:00Z",
     "home": "San Marino",
     "away": "Finland",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group C1",
    "leg": null,
    "status_detail": "Sat, September 26th at 12:00 PM EDT",
    "venue_country": "San Marino",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "san-marino",
      "espn_id": "588",
      "name": "San Marino",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 54,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": false,
         "value": 923.062738785647,
         "half_width_95": 32.805499933510696,
         "interval": [
          890.2572388521363,
          955.8682387191576
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 35.22246163362113,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 51,
         "tier": 4,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.8569688616230563,
         "half_width_95": 0.40304737113683936,
         "interval": [
          -1.2600162327598956,
          -0.45392149048621694
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.417033246904103,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 4,
          "tier_set": [
           4,
           5
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 54,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": true,
         "value": -0.6169307951226548,
         "half_width_95": 0.29619835711775133,
         "interval": [
          -0.9131291522404061,
          -0.3207324380049035
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3058479333094007,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLDLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724920",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Romania",
         "venue": "away",
         "gf": 1,
         "ga": 7,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401865146",
         "date": "2026-03-28T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Faroe Islands",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401860868",
         "date": "2026-03-31T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Andorra",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401873734",
         "date": "2026-06-05T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bangladesh",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401871580",
         "date": "2026-06-09T18:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Azerbaijan",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "finland",
      "espn_id": "458",
      "name": "Finland",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 36,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1543.6142852667072,
         "half_width_95": 27.627898732215655,
         "interval": [
          1515.9863865344914,
          1571.2421839989229
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 29.647683077325745,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 34,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2325430827062404,
         "half_width_95": 0.3617340370719922,
         "interval": [
          -0.1291909543657518,
          0.5942771197782326
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.37810973420305266,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 36,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.15313083635157504,
         "half_width_95": 0.27151394101886983,
         "interval": [
          -0.11838310466729479,
          0.42464477737044487
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.28245692829725244,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWDLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "733166",
         "date": "2025-11-17T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Andorra",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401856601",
         "date": "2026-03-27T06:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "New Zealand",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401856602",
         "date": "2026-03-30T03:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cape Verde",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "L",
         "provider_agrees": false,
         "shootout": {
          "for": 2,
          "against": 4,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "758381",
         "date": "2026-05-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Germany",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401861779",
         "date": "2026-06-05T17:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Hungary",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "299382",
       "date": "2010-11-17T16:30:00Z",
       "home": "Finland",
       "away": "San Marino",
       "home_score": 8,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "299413",
       "date": "2011-06-03T18:30:00Z",
       "home": "San Marino",
       "away": "Finland",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "655318",
       "date": "2023-06-19T16:00:00Z",
       "home": "Finland",
       "away": "San Marino",
       "home_score": 6,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "655466",
       "date": "2023-11-20T19:45:00Z",
       "home": "San Marino",
       "away": "Finland",
       "home_score": 1,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 4
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "655466",
      "date": "2023-11-20T19:45:00Z",
      "home": "San Marino",
      "away": "Finland",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "San Marino",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Finland",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26SMRFIN",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "San Marino vs Finland",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26SMRFIN",
       "ticker": "KXUEFANLGAME-26SEP26SMRFIN-SMR",
       "ask_c": 3,
       "bid_c": 2,
       "spread_c": 1,
       "ask_size": 6161,
       "bid_size": 9967,
       "flags": [],
       "name": "San Marino"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26SMRFIN",
       "ticker": "KXUEFANLGAME-26SEP26SMRFIN-TIE",
       "ask_c": 8,
       "bid_c": 7,
       "spread_c": 1,
       "ask_size": 13297,
       "bid_size": 4326,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26SMRFIN",
       "ticker": "KXUEFANLGAME-26SEP26SMRFIN-FIN",
       "ask_c": 91,
       "bid_c": 90,
       "spread_c": 1,
       "ask_size": 14664,
       "bid_size": 75,
       "flags": [],
       "name": "Finland"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 555.6,
     "favourite_side": "away",
     "home_minus_away": -555.6,
     "components": {
      "elo": {
       "home": 923.1,
       "away": 1543.6
      },
      "raw_gap_home_minus_away": -620.6,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "Faroe Islands",
   "away": "Kazakhstan",
   "favourite": "Kazakhstan",
   "opponent": "Faroe Islands",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Faroe Islands": "espn_id",
    "Kazakhstan": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 41,
    "opp": 45
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     4
    ],
    "atk": [
     3,
     3
    ],
    "def": [
     4,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 0,
    "def": 0
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Kazakhstan",
     "opp": "Faroe Islands"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 41,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1436.8535230387054,
       "half_width_95": 37.78064983116059,
       "interval": [
        1399.0728732075447,
        1474.634172869866
       ]
      },
      "opp": {
       "rank": 45,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1371.3664284067236,
       "half_width_95": 4.69740702153115,
       "interval": [
        1366.6690213851923,
        1376.0638354282548
       ]
      },
      "tier_gap": 1,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 42.32641755515065,
       "opp": 11.74070486895078
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 48,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3351664809331327,
       "half_width_95": 0.272029456200858,
       "interval": [
        -0.6071959371339908,
        -0.06313702473227473
       ]
      },
      "opp": {
       "rank": 46,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3014787234128804,
       "half_width_95": 0.22560033528936177,
       "interval": [
        -0.5270790587022421,
        -0.07587838812351863
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2886802332531289,
       "opp": 0.24658321935159339
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 3,
        "tier_set": [
         3,
         4
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         3,
         4
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 46,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.13668942653152244,
       "half_width_95": 0.23273988079769953,
       "interval": [
        -0.36942930732922197,
        0.09605045426617709
       ]
      },
      "opp": {
       "rank": 39,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.04623804109925897,
       "half_width_95": 0.3068125070666189,
       "interval": [
        -0.2605744659673599,
        0.3530505481658779
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.24611613165330784,
       "opp": 0.3110964751469065
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "HOLLOW",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861060",
   "competition_id": "401861060",
   "kickoff": "2026-09-26T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Tórsvollur",
    "city": "Tórshavn",
    "country": "Faroe Islands"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26FROKAZ",
    "ticker": "KXUEFANLGAME-26SEP26FROKAZ-KAZ",
    "ask_c": 29,
    "bid_c": 28,
    "spread_c": 1,
    "ask_size": 2730,
    "bid_size": 1708,
    "flags": []
   },
   "form": {
    "fav": "LWWDL",
    "opp": "WWLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "334751",
      "date": "2013-09-06T15:00:00Z",
      "home": "Kazakhstan",
      "away": "Faroe Islands",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "334791",
      "date": "2013-10-11T17:00:00Z",
      "home": "Faroe Islands",
      "away": "Kazakhstan",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "760047",
      "date": "2025-11-18T17:00:00Z",
      "home": "Faroe Islands",
      "away": "Kazakhstan",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "760047",
     "date": "2025-11-18T17:00:00Z",
     "home": "Faroe Islands",
     "away": "Kazakhstan",
     "home_score": 1,
     "away_score": 0,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group C3",
    "leg": null,
    "status_detail": "Sat, September 26th at 12:00 PM EDT",
    "venue_country": "Faroe Islands",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "faroe-islands",
      "espn_id": "447",
      "name": "Faroe Islands",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 45,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1371.3664284067236,
         "half_width_95": 4.69740702153115,
         "interval": [
          1366.6690213851923,
          1376.0638354282548
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 11.74070486895078,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 46,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3014787234128804,
         "half_width_95": 0.22560033528936177,
         "interval": [
          -0.5270790587022421,
          -0.07587838812351863
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.24658321935159339,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 39,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.04623804109925897,
         "half_width_95": 0.3068125070666189,
         "interval": [
          -0.2605744659673599,
          0.3530505481658779
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3110964751469065,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724831",
         "date": "2025-10-09T18:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Montenegro",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "724852",
         "date": "2025-10-12T16:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Czechia",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "724887",
         "date": "2025-11-14T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Croatia",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760047",
         "date": "2025-11-18T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kazakhstan",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401865146",
         "date": "2026-03-28T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "San Marino",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "kazakhstan",
      "espn_id": "2619",
      "name": "Kazakhstan",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 41,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1436.8535230387054,
         "half_width_95": 37.78064983116059,
         "interval": [
          1399.0728732075447,
          1474.634172869866
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 42.32641755515065,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 48,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3351664809331327,
         "half_width_95": 0.272029456200858,
         "interval": [
          -0.6071959371339908,
          -0.06313702473227473
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2886802332531289,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 46,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.13668942653152244,
         "half_width_95": 0.23273988079769953,
         "interval": [
          -0.36942930732922197,
          0.09605045426617709
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.24611613165330784,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWWDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760047",
         "date": "2025-11-18T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Faroe Islands",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866497",
         "date": "2026-03-25T12:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Namibia",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401859221",
         "date": "2026-03-31T12:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Comoros",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866137",
         "date": "2026-06-06T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Armenia",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401861661",
         "date": "2026-06-09T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Hungary",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "334751",
       "date": "2013-09-06T15:00:00Z",
       "home": "Kazakhstan",
       "away": "Faroe Islands",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "334791",
       "date": "2013-10-11T17:00:00Z",
       "home": "Faroe Islands",
       "away": "Kazakhstan",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "760047",
       "date": "2025-11-18T17:00:00Z",
       "home": "Faroe Islands",
       "away": "Kazakhstan",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "760047",
      "date": "2025-11-18T17:00:00Z",
      "home": "Faroe Islands",
      "away": "Kazakhstan",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Faroe Islands",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Kazakhstan",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26FROKAZ",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Faroe Islands vs Kazakhstan",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26FROKAZ",
       "ticker": "KXUEFANLGAME-26SEP26FROKAZ-FRO",
       "ask_c": 41,
       "bid_c": 40,
       "spread_c": 1,
       "ask_size": 130,
       "bid_size": 2437,
       "flags": [],
       "name": "Faroe Islands"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26FROKAZ",
       "ticker": "KXUEFANLGAME-26SEP26FROKAZ-TIE",
       "ask_c": 31,
       "bid_c": 30,
       "spread_c": 1,
       "ask_size": 984,
       "bid_size": 3683,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26FROKAZ",
       "ticker": "KXUEFANLGAME-26SEP26FROKAZ-KAZ",
       "ask_c": 29,
       "bid_c": 28,
       "spread_c": 1,
       "ask_size": 2730,
       "bid_size": 1708,
       "flags": [],
       "name": "Kazakhstan"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 0.5,
     "favourite_side": "away",
     "home_minus_away": -0.5,
     "components": {
      "elo": {
       "home": 1371.4,
       "away": 1436.9
      },
      "raw_gap_home_minus_away": -65.5,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "Bulgaria",
   "away": "Luxembourg",
   "favourite": "Bulgaria",
   "opponent": "Luxembourg",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Bulgaria": "espn_id",
    "Luxembourg": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 39,
    "opp": 40
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     3
    ],
    "atk": [
     3,
     3
    ],
    "def": [
     3,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": 0
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Bulgaria",
     "opp": "Luxembourg"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 39,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1477.8946644105104,
       "half_width_95": 30.68544959884152,
       "interval": [
        1447.2092148116687,
        1508.580114009352
       ]
      },
      "opp": {
       "rank": 40,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1453.902881244118,
       "half_width_95": 7.0108543888298716,
       "interval": [
        1446.8920268552881,
        1460.9137356329477
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 32.88354832502811,
       "opp": 13.416962776623903
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 40,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.016257333837550847,
       "half_width_95": 0.37704601007608585,
       "interval": [
        -0.3933033439136367,
        0.360788676238535
       ]
      },
      "opp": {
       "rank": 49,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.351907317193616,
       "half_width_95": 0.39732435929895943,
       "interval": [
        -0.7492316764925755,
        0.04541704210534342
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3780672684402188,
       "opp": 0.4094437518036951
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 3,
        "tier_set": [
         2,
         3,
         4
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         3,
         4
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 37,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.11255523992570188,
       "half_width_95": 0.2395163468342034,
       "interval": [
        -0.12696110690850151,
        0.35207158675990524
       ]
      },
      "opp": {
       "rank": 28,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.32033923281763454,
       "half_width_95": 0.29801309618677263,
       "interval": [
        0.022326136630861915,
        0.6183523290044072
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.268994784093188,
       "opp": 0.31252007025388756
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "HOLLOW",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861061",
   "competition_id": "401861061",
   "kickoff": "2026-09-26T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Hristo Botev Stadium, Plovdiv",
    "city": "Plovdiv",
    "country": "Bulgaria"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26BULLUX",
    "ticker": "KXUEFANLGAME-26SEP26BULLUX-BUL",
    "ask_c": 42,
    "bid_c": 41,
    "spread_c": 1,
    "ask_size": 13818,
    "bid_size": 5319,
    "flags": []
   },
   "form": {
    "fav": "WWWLD",
    "opp": "LWWLW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "431869",
      "date": "2016-09-06T18:45:00Z",
      "home": "Bulgaria",
      "away": "Luxembourg",
      "home_score": 4,
      "away_score": 3,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "431642",
      "date": "2017-10-10T18:45:00Z",
      "home": "Luxembourg",
      "away": "Bulgaria",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "653323",
      "date": "2022-11-20T14:00:00Z",
      "home": "Luxembourg",
      "away": "Bulgaria",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698953",
      "date": "2024-10-12T16:00:00Z",
      "home": "Bulgaria",
      "away": "Luxembourg",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698996",
      "date": "2024-11-15T19:45:00Z",
      "home": "Luxembourg",
      "away": "Bulgaria",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 2,
     "draw": 3,
     "away": 0
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "698996",
     "date": "2024-11-15T19:45:00Z",
     "home": "Luxembourg",
     "away": "Bulgaria",
     "home_score": 0,
     "away_score": 1,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group C4",
    "leg": null,
    "status_detail": "Sat, September 26th at 12:00 PM EDT",
    "venue_country": "Bulgaria",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "bulgaria",
      "espn_id": "462",
      "name": "Bulgaria",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 39,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1477.8946644105104,
         "half_width_95": 30.68544959884152,
         "interval": [
          1447.2092148116687,
          1508.580114009352
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 32.88354832502811,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 40,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.016257333837550847,
         "half_width_95": 0.37704601007608585,
         "interval": [
          -0.3933033439136367,
          0.360788676238535
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3780672684402188,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 37,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.11255523992570188,
         "half_width_95": 0.2395163468342034,
         "interval": [
          -0.12696110690850151,
          0.35207158675990524
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.268994784093188,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWWLD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724916",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Georgia",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401861601",
         "date": "2026-03-27T08:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Solomon Islands",
         "venue": "away",
         "gf": 10,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866865",
         "date": "2026-03-30T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Indonesia",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401869442",
         "date": "2026-06-01T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Montenegro",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401867937",
         "date": "2026-06-05T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Moldova",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "luxembourg",
      "espn_id": "582",
      "name": "Luxembourg",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 40,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1453.902881244118,
         "half_width_95": 7.0108543888298716,
         "interval": [
          1446.8920268552881,
          1460.9137356329477
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 13.416962776623903,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 49,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.351907317193616,
         "half_width_95": 0.39732435929895943,
         "interval": [
          -0.7492316764925755,
          0.04541704210534342
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4094437518036951,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 28,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.32033923281763454,
         "half_width_95": 0.29801309618677263,
         "interval": [
          0.022326136630861915,
          0.6183523290044072
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.31252007025388756,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWWLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724910",
         "date": "2025-11-17T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Northern Ireland",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "723733",
         "date": "2026-03-26T17:00Z",
         "competition": "UEFA Nations League",
         "kind": "competitive",
         "opponent": "Malta",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "723734",
         "date": "2026-03-31T16:00Z",
         "competition": "UEFA Nations League",
         "kind": "competitive",
         "opponent": "Malta",
         "venue": "home",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401869325",
         "date": "2026-06-03T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Italy",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870098",
         "date": "2026-06-06T18:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Albania",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "431869",
       "date": "2016-09-06T18:45:00Z",
       "home": "Bulgaria",
       "away": "Luxembourg",
       "home_score": 4,
       "away_score": 3,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "431642",
       "date": "2017-10-10T18:45:00Z",
       "home": "Luxembourg",
       "away": "Bulgaria",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "653323",
       "date": "2022-11-20T14:00:00Z",
       "home": "Luxembourg",
       "away": "Bulgaria",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698953",
       "date": "2024-10-12T16:00:00Z",
       "home": "Bulgaria",
       "away": "Luxembourg",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698996",
       "date": "2024-11-15T19:45:00Z",
       "home": "Luxembourg",
       "away": "Bulgaria",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 2,
      "draw": 3,
      "away": 0
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "698996",
      "date": "2024-11-15T19:45:00Z",
      "home": "Luxembourg",
      "away": "Bulgaria",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Bulgaria",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Luxembourg",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26BULLUX",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Bulgaria vs Luxembourg",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26BULLUX",
       "ticker": "KXUEFANLGAME-26SEP26BULLUX-BUL",
       "ask_c": 42,
       "bid_c": 41,
       "spread_c": 1,
       "ask_size": 13818,
       "bid_size": 5319,
       "flags": [],
       "name": "Bulgaria"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26BULLUX",
       "ticker": "KXUEFANLGAME-26SEP26BULLUX-TIE",
       "ask_c": 30,
       "bid_c": 29,
       "spread_c": 1,
       "ask_size": 1693,
       "bid_size": 10561,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26BULLUX",
       "ticker": "KXUEFANLGAME-26SEP26BULLUX-LUX",
       "ask_c": 29,
       "bid_c": 28,
       "spread_c": 1,
       "ask_size": 18002,
       "bid_size": 1746,
       "flags": [],
       "name": "Luxembourg"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 89,
     "favourite_side": "home",
     "home_minus_away": 89,
     "components": {
      "elo": {
       "home": 1477.9,
       "away": 1453.9
      },
      "raw_gap_home_minus_away": 24,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "Slovakia",
   "away": "Moldova",
   "favourite": "Slovakia",
   "opponent": "Moldova",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Slovakia": "espn_id",
    "Moldova": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 26,
    "opp": 48
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
     4
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     3,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 1,
    "def": 2
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Slovakia",
     "opp": "Moldova"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 26,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1635.3911441013277,
       "half_width_95": 5.63235313504874,
       "interval": [
        1629.7587909662789,
        1641.0234972363764
       ]
      },
      "opp": {
       "rank": 48,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1320.9776580661953,
       "half_width_95": 10.923172220840655,
       "interval": [
        1310.0544858453547,
        1331.900830287036
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 13.084116722991782,
       "opp": 15.872524628597166
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 26,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.396569020457504,
       "half_width_95": 0.2281419108165383,
       "interval": [
        0.16842710964096566,
        0.6247109312740423
       ]
      },
      "opp": {
       "rank": 44,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.20465181369503754,
       "half_width_95": 0.35656703378827853,
       "interval": [
        -0.5612188474833161,
        0.151915220093241
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.248718733181186,
       "opp": 0.3722564171446534
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         3,
         4
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 33,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.2260406289269722,
       "half_width_95": 0.25620455100155065,
       "interval": [
        -0.030163922074578464,
        0.48224517992852284
       ]
      },
      "opp": {
       "rank": 51,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.29962274989430354,
       "half_width_95": 0.30126304410650306,
       "interval": [
        -0.6008857940008066,
        0.0016402942121995223
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.27337816754533556,
       "opp": 0.3187976499277787
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2
        ],
        "straddles": false
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861064",
   "competition_id": "401861064",
   "kickoff": "2026-09-26T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Futbal Tatran Arena",
    "city": "Prešov",
    "country": "Slovakia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
    "ticker": "KXUEFANLGAME-26SEP26SVKMDA-SVK",
    "ask_c": 83,
    "bid_c": 82,
    "spread_c": 1,
    "ask_size": 5483,
    "bid_size": 10803,
    "flags": []
   },
   "form": {
    "fav": "LLWWD",
    "opp": "LLLDD",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group C3",
    "leg": null,
    "status_detail": "Sat, September 26th at 2:45 PM EDT",
    "venue_country": "Slovakia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "slovakia",
      "espn_id": "468",
      "name": "Slovakia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 26,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1635.3911441013277,
         "half_width_95": 5.63235313504874,
         "interval": [
          1629.7587909662789,
          1641.0234972363764
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 13.084116722991782,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 26,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.396569020457504,
         "half_width_95": 0.2281419108165383,
         "interval": [
          0.16842710964096566,
          0.6247109312740423
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.248718733181186,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 33,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2260406289269722,
         "half_width_95": 0.25620455100155065,
         "interval": [
          -0.030163922074578464,
          0.48224517992852284
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.27337816754533556,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLWWD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724911",
         "date": "2025-11-17T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Germany",
         "venue": "away",
         "gf": 0,
         "ga": 6,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761382",
         "date": "2026-03-26T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Kosovo",
         "venue": "home",
         "gf": 3,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866739",
         "date": "2026-03-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Romania",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401869443",
         "date": "2026-06-01T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Malta",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401869444",
         "date": "2026-06-05T16:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Montenegro",
         "venue": "home",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "moldova",
      "espn_id": "483",
      "name": "Moldova",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 48,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1320.9776580661953,
         "half_width_95": 10.923172220840655,
         "interval": [
          1310.0544858453547,
          1331.900830287036
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 15.872524628597166,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 44,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.20465181369503754,
         "half_width_95": 0.35656703378827853,
         "interval": [
          -0.5612188474833161,
          0.151915220093241
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3722564171446534,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 51,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.29962274989430354,
         "half_width_95": 0.30126304410650306,
         "interval": [
          -0.6008857940008066,
          0.0016402942121995223
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3187976499277787,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLLDD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724905",
         "date": "2025-11-16T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Israel",
         "venue": "away",
         "gf": 1,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401851163",
         "date": "2026-03-26T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Lithuania",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401850919",
         "date": "2026-03-30T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cyprus",
         "venue": "away",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401867937",
         "date": "2026-06-05T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bulgaria",
         "venue": "home",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866138",
         "date": "2026-06-09T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Armenia",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Slovakia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Moldova",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Slovakia vs Moldova",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
       "ticker": "KXUEFANLGAME-26SEP26SVKMDA-SVK",
       "ask_c": 83,
       "bid_c": 82,
       "spread_c": 1,
       "ask_size": 5483,
       "bid_size": 10803,
       "flags": [],
       "name": "Slovakia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
       "ticker": "KXUEFANLGAME-26SEP26SVKMDA-TIE",
       "ask_c": 13,
       "bid_c": 12,
       "spread_c": 1,
       "ask_size": 13072,
       "bid_size": 1228,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
       "ticker": "KXUEFANLGAME-26SEP26SVKMDA-MDA",
       "ask_c": 6,
       "bid_c": 5,
       "spread_c": 1,
       "ask_size": 11647,
       "bid_size": 3585,
       "flags": [],
       "name": "Moldova"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 379.4,
     "favourite_side": "home",
     "home_minus_away": 379.4,
     "components": {
      "elo": {
       "home": 1635.4,
       "away": 1321
      },
      "raw_gap_home_minus_away": 314.4,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "unl",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "home": "North Macedonia",
   "away": "Switzerland",
   "favourite": "Switzerland",
   "opponent": "North Macedonia",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "North Macedonia": "espn_id",
    "Switzerland": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "unl",
    "away": "unl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 11,
    "opp": 35
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     1,
     3
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     2,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 1,
    "def": 1
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Switzerland",
     "opp": "North Macedonia"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 11,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1831.0878075530911,
       "half_width_95": 33.872709504160845,
       "interval": [
        1797.2150980489303,
        1864.960517057252
       ]
      },
      "opp": {
       "rank": 35,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1555.2283219078952,
       "half_width_95": 13.389279519675354,
       "interval": [
        1541.83904238822,
        1568.6176014275704
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 37.686563211780715,
       "opp": 19.205269978544962
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 15,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.6126095124190893,
       "half_width_95": 0.2793766003960558,
       "interval": [
        0.33323291202303357,
        0.8919861128151452
       ]
      },
      "opp": {
       "rank": 41,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.03783486560276961,
       "half_width_95": 0.31559092180923537,
       "interval": [
        -0.353425787412005,
        0.27775605620646576
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2925076372217161,
       "opp": 0.335030809111292
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 5,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 9,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.6839163834473458,
       "half_width_95": 0.2847755763009092,
       "interval": [
        0.3991408071464366,
        0.9686919597482551
       ]
      },
      "opp": {
       "rank": 38,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.0875255145712254,
       "half_width_95": 0.34782917549039816,
       "interval": [
        -0.2603036609191728,
        0.43535469006162353
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3044317812288735,
       "opp": 0.3659777390510645
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861065",
   "competition_id": "401861065",
   "kickoff": "2026-09-26T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Toše Proeski Arena",
    "city": "Skopje",
    "country": "North Macedonia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP26MKDSUI",
    "ticker": "KXUEFANLGAME-26SEP26MKDSUI-SUI",
    "ask_c": 71,
    "bid_c": 70,
    "spread_c": 1,
    "ask_size": 24770,
    "bid_size": 3455,
    "flags": []
   },
   "form": {
    "fav": "WWWDL",
    "opp": "LLDDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "unl",
    "stage": "league-phase",
    "stage_kind": "unrecognised",
    "group": "Group B1",
    "leg": null,
    "status_detail": "Sat, September 26th at 2:45 PM EDT",
    "venue_country": "North Macedonia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "north-macedonia",
      "espn_id": "463",
      "name": "North Macedonia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 35,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1555.2283219078952,
         "half_width_95": 13.389279519675354,
         "interval": [
          1541.83904238822,
          1568.6176014275704
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 19.205269978544962,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 41,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.03783486560276961,
         "half_width_95": 0.31559092180923537,
         "interval": [
          -0.353425787412005,
          0.27775605620646576
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.335030809111292,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 38,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.0875255145712254,
         "half_width_95": 0.34782917549039816,
         "interval": [
          -0.2603036609191728,
          0.43535469006162353
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3659777390510645,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLDDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724918",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Wales",
         "venue": "away",
         "gf": 1,
         "ga": 7,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761379",
         "date": "2026-03-26T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Denmark",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866866",
         "date": "2026-03-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Republic of Ireland",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401869326",
         "date": "2026-05-29T18:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bosnia-Herzegovina",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401871359",
         "date": "2026-06-01T17:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Türkiye",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "switzerland",
      "espn_id": "475",
      "name": "Switzerland",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 11,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1831.0878075530911,
         "half_width_95": 33.872709504160845,
         "interval": [
          1797.2150980489303,
          1864.960517057252
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 37.686563211780715,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 15,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.6126095124190893,
         "half_width_95": 0.2793766003960558,
         "interval": [
          0.33323291202303357,
          0.8919861128151452
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2925076372217161,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 9,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.6839163834473458,
         "half_width_95": 0.2847755763009092,
         "interval": [
          0.3991408071464366,
          0.9686919597482551
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3044317812288735,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWWDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760439",
         "date": "2026-06-18T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Bosnia-Herzegovina",
         "venue": "home",
         "gf": 4,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760463",
         "date": "2026-06-24T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Canada",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760498",
         "date": "2026-07-03T03:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Algeria",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760508",
         "date": "2026-07-07T20:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Colombia",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "W",
         "provider_agrees": false,
         "shootout": {
          "for": 4,
          "against": 3,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "760513",
         "date": "2026-07-12T01:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Argentina",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "North Macedonia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Switzerland",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXUEFANLGAME-26SEP26MKDSUI",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "North Macedonia vs Switzerland",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP26MKDSUI",
       "ticker": "KXUEFANLGAME-26SEP26MKDSUI-MKD",
       "ask_c": 11,
       "bid_c": 10,
       "spread_c": 1,
       "ask_size": 1029,
       "bid_size": 25688,
       "flags": [],
       "name": "North Macedonia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26MKDSUI",
       "ticker": "KXUEFANLGAME-26SEP26MKDSUI-TIE",
       "ask_c": 20,
       "bid_c": 19,
       "spread_c": 1,
       "ask_size": 25065,
       "bid_size": 211,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26MKDSUI",
       "ticker": "KXUEFANLGAME-26SEP26MKDSUI-SUI",
       "ask_c": 71,
       "bid_c": 70,
       "spread_c": 1,
       "ask_size": 24770,
       "bid_size": 3455,
       "flags": [],
       "name": "Switzerland"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 210.9,
     "favourite_side": "away",
     "home_minus_away": -210.9,
     "components": {
      "elo": {
       "home": 1555.2,
       "away": 1831.1
      },
      "raw_gap_home_minus_away": -275.9,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Bonaire",
   "away": "St. Kitts and Nevis",
   "favourite": "St. Kitts and Nevis",
   "opponent": "Bonaire",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "resolution": {
    "Bonaire": "espn_id",
    "St. Kitts and Nevis": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 26,
    "opp": 30
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     4,
     4
    ],
    "atk": [
     3,
     3
    ],
    "def": [
     3,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": 1
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "St. Kitts and Nevis",
     "opp": "Bonaire"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 26,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1295.7294514093028,
       "half_width_95": 31.007473455505504,
       "interval": [
        1264.7219779537972,
        1326.7369248648083
       ]
      },
      "opp": {
       "rank": 30,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1199.3363771126044,
       "half_width_95": 12.251210851049109,
       "interval": [
        1187.0851662615553,
        1211.5875879636535
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 34.600193802981416,
       "opp": 15.100135024788413
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 25,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.45723199085527133,
       "half_width_95": 0.3857685333831612,
       "interval": [
        -0.8430005242384325,
        -0.07146345747211014
       ]
      },
      "opp": {
       "rank": 28,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.6168968145602325,
       "half_width_95": 0.39243734949437575,
       "interval": [
        -1.0093341640546083,
        -0.22445946506585673
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4172604581286715,
       "opp": 0.42463176874518854
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 20,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.5088707378177916,
       "half_width_95": 0.2532027508652312,
       "interval": [
        -0.7620734886830227,
        -0.2556679869525604
       ]
      },
      "opp": {
       "rank": 30,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.8865531465242209,
       "half_width_95": 0.5339344997048451,
       "interval": [
        -1.4204876462290659,
        -0.3526186468193758
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2875869562970411,
       "opp": 0.5476741601946167
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900627",
   "competition_id": "401900627",
   "kickoff": "2026-09-26T00:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "SKNFA Technical Centre",
    "city": "Basseterre",
    "country": "St Kitts and Nevis"
   },
   "venue_class": {
    "class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
    "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-KNA",
    "ask_c": 73,
    "bid_c": 53,
    "spread_c": 20,
    "ask_size": 3,
    "bid_size": 0,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "LDLLW",
    "opp": "LLLWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League B, Group C",
    "leg": null,
    "status_detail": "Fri, September 25th at 8:00 PM EDT",
    "venue_country": "St Kitts and Nevis",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "bonaire",
      "espn_id": "19314",
      "name": "Bonaire",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 30,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1199.3363771126044,
         "half_width_95": 12.251210851049109,
         "interval": [
          1187.0851662615553,
          1211.5875879636535
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 15.100135024788413,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 28,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.6168968145602325,
         "half_width_95": 0.39243734949437575,
         "interval": [
          -1.0093341640546083,
          -0.22445946506585673
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.42463176874518854,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 30,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.8865531465242209,
         "half_width_95": 0.5339344997048451,
         "interval": [
          -1.4204876462290659,
          -0.3526186468193758
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5476741601946167,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLLWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "734512",
         "date": "2025-03-25T20:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Niger",
         "venue": "away",
         "gf": 0,
         "ga": 6,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760871",
         "date": "2025-11-12T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Barbados",
         "venue": "away",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760889",
         "date": "2025-11-15T23:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Guyana",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866384",
         "date": "2026-03-27T00:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Vincent and the Grenadines",
         "venue": "home",
         "gf": 3,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866392",
         "date": "2026-03-30T00:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Martin",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "st-kitts-and-nevis",
      "espn_id": "2662",
      "name": "St. Kitts and Nevis",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 26,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1295.7294514093028,
         "half_width_95": 31.007473455505504,
         "interval": [
          1264.7219779537972,
          1326.7369248648083
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 34.600193802981416,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 25,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.45723199085527133,
         "half_width_95": 0.3857685333831612,
         "interval": [
          -0.8430005242384325,
          -0.07146345747211014
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4172604581286715,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 20,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.5088707378177916,
         "half_width_95": 0.2532027508652312,
         "interval": [
          -0.7620734886830227,
          -0.2556679869525604
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2875869562970411,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LDLLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "698192",
         "date": "2025-06-10T19:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Grenada",
         "venue": "home",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761047",
         "date": "2025-11-12T23:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Sint Maarten",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "761286",
         "date": "2025-11-18T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Belize",
         "venue": "home",
         "gf": 2,
         "ga": 6,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401861602",
         "date": "2026-03-27T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Indonesia",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401867001",
         "date": "2026-03-30T08:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Solomon Islands",
         "venue": "home",
         "gf": 4,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": true,
     "sides": {
      "home": {
       "team": "Bonaire",
       "formation": "4-4-2",
       "announced": true,
       "starters": [
        {
         "name": "Denyor Cicilia",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Milan Blanken",
         "jersey": "14",
         "position": "CD-L"
        },
        {
         "name": "Jevairo Pengel",
         "jersey": "18",
         "position": "CD-R"
        },
        {
         "name": "Jaydelmar Jansen",
         "jersey": "2",
         "position": "LB"
        },
        {
         "name": "Shedwin Martina",
         "jersey": "15",
         "position": "RB"
        },
        {
         "name": "Berry Sonnenschein",
         "jersey": "8",
         "position": "CM-L"
        },
        {
         "name": "Ayrton Cicilia",
         "jersey": "9",
         "position": "CM-R"
        },
        {
         "name": "Myron Bostdorp",
         "jersey": "17",
         "position": "LM"
        },
        {
         "name": "Robin Cijntje",
         "jersey": "19",
         "position": "RM"
        },
        {
         "name": "Suerainy Efhraim Angel Naïm Coffy",
         "jersey": "6",
         "position": "CF-L"
        },
        {
         "name": "Siginho Gerardo",
         "jersey": "10",
         "position": "CF-R"
        }
       ],
       "bench": 11
      },
      "away": {
       "team": "St. Kitts and Nevis",
       "formation": "4-2-3-1",
       "announced": true,
       "starters": [
        {
         "name": "Julani Archibald",
         "jersey": "18",
         "position": "G"
        },
        {
         "name": "Omari Sterling-James",
         "jersey": "22",
         "position": "CD-L"
        },
        {
         "name": "Jordan Bowery",
         "jersey": "6",
         "position": "CD-R"
        },
        {
         "name": "Micaah Dominique Gladwin Garnette",
         "jersey": "12",
         "position": "LB"
        },
        {
         "name": "Rico Browne",
         "jersey": "3",
         "position": "RB"
        },
        {
         "name": "Harry Panayiotou",
         "jersey": "10",
         "position": "AM"
        },
        {
         "name": "Kyle Kelly",
         "jersey": "20",
         "position": "LM"
        },
        {
         "name": "Romaine Sawyers",
         "jersey": "19",
         "position": "RM"
        },
        {
         "name": "Tyreece Simpson",
         "jersey": "9",
         "position": "F"
        },
        {
         "name": "Theo Wharton",
         "jersey": "14",
         "position": "AM-L"
        },
        {
         "name": "Tiquanny Williams",
         "jersey": "7",
         "position": "AM-R"
        }
       ],
       "bench": 10
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Bonaire vs Saint Kitts and Nevis",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-BON",
       "ask_c": 50,
       "bid_c": 25,
       "spread_c": 25,
       "ask_size": 30,
       "bid_size": 4,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Bonaire"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-TIE",
       "ask_c": 26,
       "bid_c": 18,
       "spread_c": 8,
       "ask_size": 4,
       "bid_size": 4,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-KNA",
       "ask_c": 73,
       "bid_c": 53,
       "spread_c": 20,
       "ask_size": 3,
       "bid_size": 0,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Saint Kitts and Nevis"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 161.4,
     "favourite_side": "away",
     "home_minus_away": -161.4,
     "components": {
      "elo": {
       "home": 1199.3,
       "away": 1295.7
      },
      "raw_gap_home_minus_away": -96.4,
      "venue_term_home_minus_away": -65,
      "venue_class": "OPPONENT_COUNTRY",
      "host_side": "away",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Barbados",
   "away": "St. Lucia",
   "favourite": "St. Lucia",
   "opponent": "Barbados",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "resolution": {
    "Barbados": "espn_id",
    "St. Lucia": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 24,
    "opp": 29
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     4
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     3,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 1,
    "def": 1
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "St. Lucia",
     "opp": "Barbados"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 24,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1307.7305748698388,
       "half_width_95": 19.2869531650953,
       "interval": [
        1288.4436217047435,
        1327.0175280349342
       ]
      },
      "opp": {
       "rank": 29,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1218.128322493046,
       "half_width_95": 4.9701796766124895,
       "interval": [
        1213.1581428164334,
        1223.0985021696586
       ]
      },
      "tier_gap": 1,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 21.22709192450022,
       "opp": 11.920883318190718
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 19,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.27875450755929204,
       "half_width_95": 0.3040205985964387,
       "interval": [
        -0.5827751061557307,
        0.025266091037146665
       ]
      },
      "opp": {
       "rank": 30,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.6638112810640575,
       "half_width_95": 0.4215340007947988,
       "interval": [
        -1.0853452818588563,
        -0.2422772802692587
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.33523569608890724,
       "opp": 0.44130510160642666
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 18,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.41653532535233684,
       "half_width_95": 0.26802985932294676,
       "interval": [
        -0.6845651846752836,
        -0.14850546602939008
       ]
      },
      "opp": {
       "rank": 27,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.7865305301282592,
       "half_width_95": 0.33410014248614134,
       "interval": [
        -1.1206306726144006,
        -0.4524303876421179
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2967852110435332,
       "opp": 0.3428098253647509
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2
        ],
        "straddles": false
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900629",
   "competition_id": "401900629",
   "kickoff": "2026-09-26T00:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Beausejour Stadium",
    "city": "Gros Islet",
    "country": "St Lucia"
   },
   "venue_class": {
    "class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
    "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-LCA",
    "ask_c": 45,
    "bid_c": 44,
    "spread_c": 1,
    "ask_size": 395,
    "bid_size": 1845,
    "flags": []
   },
   "form": {
    "fav": "LWLLL",
    "opp": "LWLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "487750",
      "date": "2017-07-02T21:30:00Z",
      "home": "Barbados",
      "away": "St. Lucia",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "537111",
      "date": "2019-03-06T21:00:00Z",
      "home": "St. Lucia",
      "away": "Barbados",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698196",
      "date": "2025-06-10T22:00:00Z",
      "home": "St. Lucia",
      "away": "Barbados",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "698196",
     "date": "2025-06-10T22:00:00Z",
     "home": "St. Lucia",
     "away": "Barbados",
     "home_score": 2,
     "away_score": 1,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League B, Group B",
    "leg": null,
    "status_detail": "Fri, September 25th at 8:00 PM EDT",
    "venue_country": "St Lucia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "barbados",
      "espn_id": "2637",
      "name": "Barbados",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 29,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1218.128322493046,
         "half_width_95": 4.9701796766124895,
         "interval": [
          1213.1581428164334,
          1223.0985021696586
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 11.920883318190718,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 30,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.6638112810640575,
         "half_width_95": 0.4215340007947988,
         "interval": [
          -1.0853452818588563,
          -0.2422772802692587
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.44130510160642666,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 27,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.7865305301282592,
         "half_width_95": 0.33410014248614134,
         "interval": [
          -1.1206306726144006,
          -0.4524303876421179
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3428098253647509,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "698196",
         "date": "2025-06-10T22:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "St. Lucia",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760871",
         "date": "2025-11-12T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bonaire",
         "venue": "home",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760887",
         "date": "2025-11-15T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Aruba",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866381",
         "date": "2026-03-26T22:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Martin",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866388",
         "date": "2026-03-29T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Vincent and the Grenadines",
         "venue": "home",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "st-lucia",
      "espn_id": "2661",
      "name": "St. Lucia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 24,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1307.7305748698388,
         "half_width_95": 19.2869531650953,
         "interval": [
          1288.4436217047435,
          1327.0175280349342
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 21.22709192450022,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 19,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.27875450755929204,
         "half_width_95": 0.3040205985964387,
         "interval": [
          -0.5827751061557307,
          0.025266091037146665
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.33523569608890724,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 18,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.41653532535233684,
         "half_width_95": 0.26802985932294676,
         "interval": [
          -0.6845651846752836,
          -0.14850546602939008
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2967852110435332,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "698176",
         "date": "2025-06-06T23:30Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Curaçao",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "698196",
         "date": "2025-06-10T22:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Barbados",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761046",
         "date": "2025-11-12T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cuba",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761284",
         "date": "2025-11-16T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Vincent and the Grenadines",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401861921",
         "date": "2026-03-27T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Azerbaijan",
         "venue": "away",
         "gf": 1,
         "ga": 6,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "487750",
       "date": "2017-07-02T21:30:00Z",
       "home": "Barbados",
       "away": "St. Lucia",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "537111",
       "date": "2019-03-06T21:00:00Z",
       "home": "St. Lucia",
       "away": "Barbados",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698196",
       "date": "2025-06-10T22:00:00Z",
       "home": "St. Lucia",
       "away": "Barbados",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "698196",
      "date": "2025-06-10T22:00:00Z",
      "home": "St. Lucia",
      "away": "Barbados",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": true,
     "sides": {
      "home": {
       "team": "Barbados",
       "formation": "5-4-1",
       "announced": true,
       "starters": [
        {
         "name": "Jamal Blackman",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Andre Applewhaite",
         "jersey": "3",
         "position": "CD"
        },
        {
         "name": "Ajani Jamel Banton",
         "jersey": "14",
         "position": "CD-L"
        },
        {
         "name": "Mario Williams",
         "jersey": "4",
         "position": "CD-R"
        },
        {
         "name": "Zachary Applewhite",
         "jersey": "22",
         "position": "LB"
        },
        {
         "name": "Tyrique Bailey-Edwards",
         "jersey": "20",
         "position": "RB"
        },
        {
         "name": "Omani Leacock",
         "jersey": "8",
         "position": "CM-L"
        },
        {
         "name": "Jaheim Neblett",
         "jersey": "5",
         "position": "CM-R"
        },
        {
         "name": "Thierry Gale",
         "jersey": "11",
         "position": "LM"
        },
        {
         "name": "Niall Reid-Stephen",
         "jersey": "10",
         "position": "RM"
        },
        {
         "name": "Colin Griffith",
         "jersey": "19",
         "position": "F"
        }
       ],
       "bench": 11
      },
      "away": {
       "team": "St. Lucia",
       "formation": "4-1-4-1",
       "announced": true,
       "starters": [
        {
         "name": "Vino Barclett",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Kurt Frederick",
         "jersey": "2",
         "position": "CD-L"
        },
        {
         "name": "Melvin Doxilly",
         "jersey": "6",
         "position": "CD-R"
        },
        {
         "name": "Ajani Louis",
         "jersey": "3",
         "position": "DM"
        },
        {
         "name": "Terell Thomas",
         "jersey": "4",
         "position": "LB"
        },
        {
         "name": "Shevon Byron",
         "jersey": "19",
         "position": "RB"
        },
        {
         "name": "Yanic Noel",
         "jersey": "9",
         "position": "CM-L"
        },
        {
         "name": "Lester Joseph",
         "jersey": "8",
         "position": "CM-R"
        },
        {
         "name": "Gregson President",
         "jersey": "21",
         "position": "LM"
        },
        {
         "name": "Doneal Lionel",
         "jersey": "5",
         "position": "RM"
        },
        {
         "name": "Caniggia Elva",
         "jersey": "14",
         "position": "F"
        }
       ],
       "bench": 12
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Barbados vs Saint Lucia",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-BAR",
       "ask_c": 29,
       "bid_c": 28,
       "spread_c": 1,
       "ask_size": 712,
       "bid_size": 1887,
       "flags": [],
       "name": "Barbados"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-TIE",
       "ask_c": 27,
       "bid_c": 26,
       "spread_c": 1,
       "ask_size": 362,
       "bid_size": 753,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-LCA",
       "ask_c": 45,
       "bid_c": 44,
       "spread_c": 1,
       "ask_size": 395,
       "bid_size": 1845,
       "flags": [],
       "name": "Saint Lucia"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 154.6,
     "favourite_side": "away",
     "home_minus_away": -154.6,
     "components": {
      "elo": {
       "home": 1218.1,
       "away": 1307.7
      },
      "raw_gap_home_minus_away": -89.6,
      "venue_term_home_minus_away": -65,
      "venue_class": "OPPONENT_COUNTRY",
      "host_side": "away",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Jamaica",
   "away": "Guatemala",
   "favourite": "Jamaica",
   "opponent": "Guatemala",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Jamaica": "espn_id",
    "Guatemala": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 2,
    "opp": 5
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
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
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "Jamaica",
     "opp": "Guatemala"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 2,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1618.891661915762,
       "half_width_95": 29.543294252970785,
       "interval": [
        1589.3483676627911,
        1648.4349561687327
       ]
      },
      "opp": {
       "rank": 5,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1573.4687264587872,
       "half_width_95": 23.823922802985514,
       "interval": [
        1549.6448036558018,
        1597.2926492617726
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 35.4854714625729,
       "opp": 30.073916066444163
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 8,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.10883001256005584,
       "half_width_95": 0.24410664607682167,
       "interval": [
        -0.13527663351676583,
        0.3529366586368775
       ]
      },
      "opp": {
       "rank": 5,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.25722873364011456,
       "half_width_95": 0.2816399444780588,
       "interval": [
        -0.02441121083794423,
        0.5388686781181733
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2664380465436152,
       "opp": 0.30177218460220856
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       }
      }
     },
     "def": {
      "fav": {
       "rank": 4,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.28758743465038517,
       "half_width_95": 0.2589158654951738,
       "interval": [
        0.02867156915521135,
        0.546503300145559
       ]
      },
      "opp": {
       "rank": 1,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.49489448455483,
       "half_width_95": 0.3925744774718665,
       "interval": [
        0.10232000708296346,
        0.8874689620266965
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.27018392145584474,
       "opp": 0.38895181254027333
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       }
      }
     }
    },
    "shape": "HOLLOW",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900631",
   "competition_id": "401900631",
   "kickoff": "2026-09-26T00:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Independence Park",
    "city": "Sabina Park",
    "country": "Jamaica"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
    "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-JAM",
    "ask_c": 56,
    "bid_c": 55,
    "spread_c": 1,
    "ask_size": 6182,
    "bid_size": 574,
    "flags": []
   },
   "form": {
    "fav": "WLWL?",
    "opp": "WLLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "333969",
      "date": "2012-10-13T02:00:00Z",
      "home": "Guatemala",
      "away": "Jamaica",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "678985",
      "date": "2023-07-09T21:00:00Z",
      "home": "Guatemala",
      "away": "Jamaica",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "690105",
      "date": "2023-11-12T00:00:00Z",
      "home": "Guatemala",
      "away": "Jamaica",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698194",
      "date": "2025-06-10T23:00:00Z",
      "home": "Jamaica",
      "away": "Guatemala",
      "home_score": 3,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "735323",
      "date": "2025-06-17T02:00:00Z",
      "home": "Jamaica",
      "away": "Guatemala",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 2,
     "draw": 1,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "735323",
     "date": "2025-06-17T02:00:00Z",
     "home": "Jamaica",
     "away": "Guatemala",
     "home_score": 0,
     "away_score": 1,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League A, Group B",
    "leg": null,
    "status_detail": "Fri, September 25th at 8:00 PM EDT",
    "venue_country": "Jamaica",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "jamaica",
      "espn_id": "1038",
      "name": "Jamaica",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1618.891661915762,
         "half_width_95": 29.543294252970785,
         "interval": [
          1589.3483676627911,
          1648.4349561687327
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 35.4854714625729,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 8,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.10883001256005584,
         "half_width_95": 0.24410664607682167,
         "interval": [
          -0.13527663351676583,
          0.3529366586368775
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2664380465436152,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 4,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.28758743465038517,
         "half_width_95": 0.2589158654951738,
         "interval": [
          0.02867156915521135,
          0.546503300145559
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.27018392145584474,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLWL?",
       "disputed": 1,
       "withheld": 1,
       "games": [
        {
         "event_id": "761388",
         "date": "2026-03-27T03:00Z",
         "competition": "FIFA World Cup Qualifying - Playoff Tournament",
         "kind": "competitive",
         "opponent": "New Caledonia",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761389",
         "date": "2026-03-31T21:00Z",
         "competition": "FIFA World Cup Qualifying - Playoff Tournament",
         "kind": "competitive",
         "opponent": "Congo DR",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401873506",
         "date": "2026-05-27T18:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "India",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "D",
         "provider_agrees": false
        },
        {
         "event_id": "401874104",
         "date": "2026-05-30T18:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Nigeria",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401875160",
         "date": "2026-06-06T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "South Africa",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "?",
         "provider_letter": "L",
         "provider_agrees": true,
         "letter_if_espn": "L",
         "disputed": {
          "letter": "?",
          "why": "the providers disagree on this match's score, so no letter is drawn as if it were certain; both readings are below, each lettered from this team's side",
          "source": "research_archive/national_team_field_v2_2026-09-25/fill_report.json",
          "espn": {
           "score": [
            0,
            1
           ],
           "for": 0,
           "against": 1,
           "letter": "L"
          },
          "apifootball": {
           "score": [
            1,
            1
           ],
           "for": 1,
           "against": 1,
           "letter": "D",
           "status": null,
           "fixture": 1550809
          },
          "score_is": "home-away of that match, as ESPN lists its sides"
         }
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "guatemala",
      "espn_id": "2652",
      "name": "Guatemala",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 5,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1573.4687264587872,
         "half_width_95": 23.823922802985514,
         "interval": [
          1549.6448036558018,
          1597.2926492617726
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 30.073916066444163,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 5,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.25722873364011456,
         "half_width_95": 0.2816399444780588,
         "interval": [
          -0.02441121083794423,
          0.5388686781181733
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.30177218460220856,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 1,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.49489448455483,
         "half_width_95": 0.3925744774718665,
         "interval": [
          0.10232000708296346,
          0.8874689620266965
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.38895181254027333,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "754269",
         "date": "2025-11-19T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Suriname",
         "venue": "home",
         "gf": 3,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401844264",
         "date": "2026-01-18T03:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Canada",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401862318",
         "date": "2026-03-27T19:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Algeria",
         "venue": "away",
         "gf": 0,
         "ga": 7,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870095",
         "date": "2026-06-05T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Czechia",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870000",
         "date": "2026-06-07T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Ecuador",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "333969",
       "date": "2012-10-13T02:00:00Z",
       "home": "Guatemala",
       "away": "Jamaica",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "678985",
       "date": "2023-07-09T21:00:00Z",
       "home": "Guatemala",
       "away": "Jamaica",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "690105",
       "date": "2023-11-12T00:00:00Z",
       "home": "Guatemala",
       "away": "Jamaica",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698194",
       "date": "2025-06-10T23:00:00Z",
       "home": "Jamaica",
       "away": "Guatemala",
       "home_score": 3,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "735323",
       "date": "2025-06-17T02:00:00Z",
       "home": "Jamaica",
       "away": "Guatemala",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 2,
      "draw": 1,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "735323",
      "date": "2025-06-17T02:00:00Z",
      "home": "Jamaica",
      "away": "Guatemala",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": true,
     "sides": {
      "home": {
       "team": "Jamaica",
       "formation": "4-2-3-1",
       "announced": true,
       "starters": [
        {
         "name": "Andre Blake",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Damion Lowe",
         "jersey": "17",
         "position": "CD-L"
        },
        {
         "name": "Richard King",
         "jersey": "6",
         "position": "CD-R"
        },
        {
         "name": "Ronaldo Webster",
         "jersey": "22",
         "position": "LB"
        },
        {
         "name": "Joel Latibeaudiere",
         "jersey": "15",
         "position": "RB"
        },
        {
         "name": "Kasey Palmer",
         "jersey": "8",
         "position": "AM"
        },
        {
         "name": "Rumarn Burrell",
         "jersey": "21",
         "position": "LM"
        },
        {
         "name": "Isaac Hayden",
         "jersey": "14",
         "position": "RM"
        },
        {
         "name": "Javon East",
         "jersey": "12",
         "position": "F"
        },
        {
         "name": "Tyreece Campbell",
         "jersey": "11",
         "position": "AM-L"
        },
        {
         "name": "Karoy Anderson",
         "jersey": "16",
         "position": "AM-R"
        }
       ],
       "bench": 12
      },
      "away": {
       "team": "Guatemala",
       "formation": "4-2-3-1",
       "announced": true,
       "starters": [
        {
         "name": "Kenderson Navarro",
         "jersey": "12",
         "position": "G"
        },
        {
         "name": "Allen Yanes",
         "jersey": "15",
         "position": "D"
        },
        {
         "name": "Aaron Herrera",
         "jersey": "7",
         "position": "D"
        },
        {
         "name": "Nicolás Samayoa",
         "jersey": "3",
         "position": "D"
        },
        {
         "name": "José Morales",
         "jersey": "16",
         "position": "D"
        },
        {
         "name": "José Rosales",
         "jersey": "5",
         "position": "M"
        },
        {
         "name": "Jorge Aparicio",
         "jersey": "23",
         "position": "M"
        },
        {
         "name": "Rubio Rubín",
         "jersey": "9",
         "position": "M"
        },
        {
         "name": "Rudy Muñoz",
         "jersey": "11",
         "position": "M"
        },
        {
         "name": "Óscar Santis",
         "jersey": "18",
         "position": "M"
        },
        {
         "name": "Darwin Lom",
         "jersey": "14",
         "position": "F"
        }
       ],
       "bench": 12
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Jamaica vs Guatemala",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-JAM",
       "ask_c": 56,
       "bid_c": 55,
       "spread_c": 1,
       "ask_size": 6182,
       "bid_size": 574,
       "flags": [],
       "name": "Jamaica"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-TIE",
       "ask_c": 25,
       "bid_c": 24,
       "spread_c": 1,
       "ask_size": 1659,
       "bid_size": 954,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-GTM",
       "ask_c": 22,
       "bid_c": 20,
       "spread_c": 2,
       "ask_size": 60,
       "bid_size": 4589,
       "flags": [
        "THIN"
       ],
       "name": "Guatemala"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 110.4,
     "favourite_side": "home",
     "home_minus_away": 110.4,
     "components": {
      "elo": {
       "home": 1618.9,
       "away": 1573.5
      },
      "raw_gap_home_minus_away": 45.4,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Honduras",
   "away": "Suriname",
   "favourite": "Honduras",
   "opponent": "Suriname",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Honduras": "espn_id",
    "Suriname": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 3,
    "opp": 6
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     1,
     1
    ],
    "atk": [
     1,
     2
    ],
    "def": [
     1,
     2
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 1,
    "def": 1
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "Honduras",
     "opp": "Suriname"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1609.7221851754666,
       "half_width_95": 18.471362835618276,
       "interval": [
        1591.2508223398484,
        1628.1935480110849
       ]
      },
      "opp": {
       "rank": 6,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1545.4590060753458,
       "half_width_95": 21.057420681693387,
       "interval": [
        1524.4015853936523,
        1566.5164267570392
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 26.067508514543423,
       "opp": 27.783523931597088
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 2,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": true,
       "value": 0.4087233846456625,
       "half_width_95": 0.3017719990133148,
       "interval": [
        0.10695138563234768,
        0.7104953836589774
       ]
      },
      "opp": {
       "rank": 12,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.017378623584883207,
       "half_width_95": 0.2569478458431311,
       "interval": [
        -0.2743264694280143,
        0.23956922225824787
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3058315901678289,
       "opp": 0.2774441405696797
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.36239530614130566,
       "half_width_95": 0.28969398046125533,
       "interval": [
        0.07270132568005033,
        0.6520892866025609
       ]
      },
      "opp": {
       "rank": 12,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.05065436634459272,
       "half_width_95": 0.316522124040958,
       "interval": [
        -0.36717649038555067,
        0.2658677576963653
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3065288765904071,
       "opp": 0.3295016385686674
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900633",
   "competition_id": "401900633",
   "kickoff": "2026-09-26T01:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estadio José de la Paz Herrera Uclés",
    "city": "Estadio Nacional Chelato Uclés",
    "country": "Honduras"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR",
    "ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR-HND",
    "ask_c": 60,
    "bid_c": 59,
    "spread_c": 1,
    "ask_size": 30746,
    "bid_size": 4364,
    "flags": []
   },
   "form": {
    "fav": "WLDDL",
    "opp": "DDWLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League A, Group B",
    "leg": null,
    "status_detail": "Fri, September 25th at 9:00 PM EDT",
    "venue_country": "Honduras",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "honduras",
      "espn_id": "215",
      "name": "Honduras",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1609.7221851754666,
         "half_width_95": 18.471362835618276,
         "interval": [
          1591.2508223398484,
          1628.1935480110849
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 26.067508514543423,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": true,
         "value": 0.4087233846456625,
         "half_width_95": 0.3017719990133148,
         "interval": [
          0.10695138563234768,
          0.7104953836589774
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3058315901678289,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.36239530614130566,
         "half_width_95": 0.28969398046125533,
         "interval": [
          0.07270132568005033,
          0.6520892866025609
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3065288765904071,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLDDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "754255",
         "date": "2025-10-14T00:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Haiti",
         "venue": "home",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "754261",
         "date": "2025-11-14T02:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Nicaragua",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "754270",
         "date": "2025-11-19T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Costa Rica",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401862402",
         "date": "2026-03-31T18:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Peru",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401868047",
         "date": "2026-06-07T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Argentina",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "suriname",
      "espn_id": "2664",
      "name": "Suriname",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 6,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1545.4590060753458,
         "half_width_95": 21.057420681693387,
         "interval": [
          1524.4015853936523,
          1566.5164267570392
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 27.783523931597088,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 12,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.017378623584883207,
         "half_width_95": 0.2569478458431311,
         "interval": [
          -0.2743264694280143,
          0.23956922225824787
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2774441405696797,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 12,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.05065436634459272,
         "half_width_95": 0.316522124040958,
         "interval": [
          -0.36717649038555067,
          0.2658677576963653
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3295016385686674,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DDWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "754253",
         "date": "2025-10-10T21:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Guatemala",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "754257",
         "date": "2025-10-15T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Panama",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "754260",
         "date": "2025-11-13T22:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "El Salvador",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "754269",
         "date": "2025-11-19T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Guatemala",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761387",
         "date": "2026-03-26T22:00Z",
         "competition": "FIFA World Cup Qualifying - Playoff Tournament",
         "kind": "competitive",
         "opponent": "Bolivia",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Honduras",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Suriname",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Honduras vs Suriname",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR",
       "ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR-HND",
       "ask_c": 60,
       "bid_c": 59,
       "spread_c": 1,
       "ask_size": 30746,
       "bid_size": 4364,
       "flags": [],
       "name": "Honduras"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR",
       "ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR-TIE",
       "ask_c": 26,
       "bid_c": 25,
       "spread_c": 1,
       "ask_size": 13220,
       "bid_size": 280,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR",
       "ticker": "KXCONCACAFNLGAME-26SEP25HNDSUR-SUR",
       "ask_c": 17,
       "bid_c": 16,
       "spread_c": 1,
       "ask_size": 4197,
       "bid_size": 3948,
       "flags": [],
       "name": "Suriname"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 129.3,
     "favourite_side": "home",
     "home_minus_away": 129.3,
     "components": {
      "elo": {
       "home": 1609.7,
       "away": 1545.5
      },
      "raw_gap_home_minus_away": 64.3,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "El Salvador",
   "away": "Martinique",
   "favourite": "El Salvador",
   "opponent": "Martinique",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "El Salvador": "espn_id",
    "Martinique": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 9,
    "opp": 12
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
     2
    ],
    "atk": [
     2,
     1
    ],
    "def": [
     1,
     2
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": -1,
    "def": 1
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "El Salvador",
     "opp": "Martinique"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 9,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1484.5806761877063,
       "half_width_95": 14.607990457107574,
       "interval": [
        1469.9726857305989,
        1499.1886666448138
       ]
      },
      "opp": {
       "rank": 12,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1470.597524028651,
       "half_width_95": 5.687364744285085,
       "interval": [
        1464.9101592843658,
        1476.284888772936
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 22.110186319329873,
       "opp": 15.429424729688574
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 18,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.20336648115566852,
       "half_width_95": 0.38393357296452346,
       "interval": [
        -0.587300054120192,
        0.18056709180885494
       ]
      },
      "opp": {
       "rank": 4,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": true,
       "value": 0.3706193519055657,
       "half_width_95": 0.2728831799917205,
       "interval": [
        0.0977361719138452,
        0.6435025318972862
       ]
      },
      "tier_gap": -1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.39515700934895637,
       "opp": 0.2967008372198139
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       }
      }
     },
     "def": {
      "fav": {
       "rank": 5,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.2621300241076153,
       "half_width_95": 0.23737427445576112,
       "interval": [
        0.024755749651854203,
        0.4995042985633764
       ]
      },
      "opp": {
       "rank": 15,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.12878939717559532,
       "half_width_95": 0.33356821502930195,
       "interval": [
        -0.46235761220489724,
        0.20477881785370664
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.251704093896381,
       "opp": 0.35524731065537674
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
       "opp": "shots"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900632",
   "competition_id": "401900632",
   "kickoff": "2026-09-26T03:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estadio Mágico González",
    "city": "San Salvador",
    "country": "El Salvador"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ",
    "ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ-SLV",
    "ask_c": 53,
    "bid_c": 52,
    "spread_c": 1,
    "ask_size": 4527,
    "bid_size": 906,
    "flags": []
   },
   "form": {
    "fav": "LDWLD",
    "opp": "LLDDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "668481",
      "date": "2023-06-26T22:30:00Z",
      "home": "El Salvador",
      "away": "Martinique",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "680551",
      "date": "2023-10-13T23:00:00Z",
      "home": "Martinique",
      "away": "El Salvador",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "680557",
      "date": "2023-10-18T01:00:00Z",
      "home": "El Salvador",
      "away": "Martinique",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "401866387",
      "date": "2026-03-29T19:00:00Z",
      "home": "Martinique",
      "away": "El Salvador",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "401866387",
     "date": "2026-03-29T19:00:00Z",
     "home": "Martinique",
     "away": "El Salvador",
     "home_score": 0,
     "away_score": 1,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League A, Group B",
    "leg": null,
    "status_detail": "Fri, September 25th at 11:00 PM EDT",
    "venue_country": "El Salvador",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "el-salvador",
      "espn_id": "2650",
      "name": "El Salvador",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 9,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1484.5806761877063,
         "half_width_95": 14.607990457107574,
         "interval": [
          1469.9726857305989,
          1499.1886666448138
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 22.110186319329873,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 18,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.20336648115566852,
         "half_width_95": 0.38393357296452346,
         "interval": [
          -0.587300054120192,
          0.18056709180885494
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.39515700934895637,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 5,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2621300241076153,
         "half_width_95": 0.23737427445576112,
         "interval": [
          0.024755749651854203,
          0.4995042985633764
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.251704093896381,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LDWLD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "754266",
         "date": "2025-11-19T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Panama",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866383",
         "date": "2026-03-27T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Dominican Republic",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866387",
         "date": "2026-03-29T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Martinique",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401871496",
         "date": "2026-06-04T01:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "South Korea",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870103",
         "date": "2026-06-06T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Qatar",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "martinique",
      "espn_id": "2728",
      "name": "Martinique",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 12,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1470.597524028651,
         "half_width_95": 5.687364744285085,
         "interval": [
          1464.9101592843658,
          1476.284888772936
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 15.429424729688574,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 4,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": true,
         "value": 0.3706193519055657,
         "half_width_95": 0.2728831799917205,
         "interval": [
          0.0977361719138452,
          0.6435025318972862
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2967008372198139,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 15,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.12878939717559532,
         "half_width_95": 0.33356821502930195,
         "interval": [
          -0.46235761220489724,
          0.20477881785370664
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.35524731065537674,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLDDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "734186",
         "date": "2025-03-25T23:00Z",
         "competition": "Concacaf Gold Cup Qualifying",
         "kind": "competitive",
         "opponent": "Suriname",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761285",
         "date": "2025-11-16T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cuba",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760901",
         "date": "2025-11-18T23:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Dominican Republic",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866380",
         "date": "2026-03-26T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cuba",
         "venue": "home",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866387",
         "date": "2026-03-29T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "El Salvador",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "668481",
       "date": "2023-06-26T22:30:00Z",
       "home": "El Salvador",
       "away": "Martinique",
       "home_score": 1,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "680551",
       "date": "2023-10-13T23:00:00Z",
       "home": "Martinique",
       "away": "El Salvador",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "680557",
       "date": "2023-10-18T01:00:00Z",
       "home": "El Salvador",
       "away": "Martinique",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "401866387",
       "date": "2026-03-29T19:00:00Z",
       "home": "Martinique",
       "away": "El Salvador",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "401866387",
      "date": "2026-03-29T19:00:00Z",
      "home": "Martinique",
      "away": "El Salvador",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "El Salvador",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Martinique",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "El Salvador vs Martinique",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ",
       "ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ-SLV",
       "ask_c": 53,
       "bid_c": 52,
       "spread_c": 1,
       "ask_size": 4527,
       "bid_size": 906,
       "flags": [],
       "name": "El Salvador"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ",
       "ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ-TIE",
       "ask_c": 27,
       "bid_c": 26,
       "spread_c": 1,
       "ask_size": 2324,
       "bid_size": 1788,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ",
       "ticker": "KXCONCACAFNLGAME-26SEP25SLVMTQ-MTQ",
       "ask_c": 21,
       "bid_c": 20,
       "spread_c": 1,
       "ask_size": 1975,
       "bid_size": 2774,
       "flags": [],
       "name": "Martinique"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 79,
     "favourite_side": "home",
     "home_minus_away": 79,
     "components": {
      "elo": {
       "home": 1484.6,
       "away": 1470.6
      },
      "raw_gap_home_minus_away": 14,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Montserrat",
   "away": "British Virgin Islands",
   "favourite": "Montserrat",
   "opponent": "British Virgin Islands",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "NEUTRAL",
    "home_side": null
   },
   "resolution": {
    "Montserrat": "espn_id",
    "British Virgin Islands": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 1,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "cnl",
    "away": "cnl"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 19,
    "opp": 34
   },
   "rates": {
    "ppg": [
     3,
     null
    ],
    "gf": [
     2,
     null
    ],
    "ga": [
     0,
     null
    ],
    "gdg": [
     2,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     5
    ],
    "atk": [
     2,
     5
    ],
    "def": [
     3,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 3,
    "def": 2
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "Montserrat",
     "opp": "British Virgin Islands"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 19,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1351.925316321585,
       "half_width_95": 5.32922046162652,
       "interval": [
        1346.5960958599583,
        1357.2545367832115
       ]
      },
      "opp": {
       "rank": 34,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1106.443730228283,
       "half_width_95": 26.247310351536804,
       "interval": [
        1080.1964198767462,
        1132.6910405798196
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 11.881047730080242,
       "opp": 29.28674043853181
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 20,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.29265824152334186,
       "half_width_95": 0.3819325738783774,
       "interval": [
        -0.6745908154017193,
        0.08927433235503557
       ]
      },
      "opp": {
       "rank": 35,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -1.2929278406504578,
       "half_width_95": 0.4484625902479296,
       "interval": [
        -1.7413904308983874,
        -0.8444652504025283
       ]
      },
      "tier_gap": 3,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4126488869080883,
       "opp": 0.48982734797255273
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         3
        ],
        "straddles": false
       }
      }
     },
     "def": {
      "fav": {
       "rank": 21,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.5309151637403463,
       "half_width_95": 0.2931111743036538,
       "interval": [
        -0.824026338044,
        -0.2378039894366925
       ]
      },
      "opp": {
       "rank": 34,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -1.028478146650849,
       "half_width_95": 0.33131060020905573,
       "interval": [
        -1.3597887468599048,
        -0.6971675464417932
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 37,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3098546195779769,
       "opp": 0.35460595903564207
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900624",
   "competition_id": "401900624",
   "kickoff": "2026-09-26T19:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "TCIFA National Stadium",
    "city": "Providenciales",
    "country": "Turks and Caicos Islands"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB",
    "ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB-MSR",
    "ask_c": 79,
    "bid_c": 72,
    "spread_c": 7,
    "ask_size": 10,
    "bid_size": 30,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "LLWLW",
    "opp": "WWDWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "cnl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "League C, Group A",
    "leg": null,
    "status_detail": "Sat, September 26th at 3:00 PM EDT",
    "venue_country": "Turks and Caicos Islands",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "montserrat",
      "espn_id": "2655",
      "name": "Montserrat",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 19,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1351.925316321585,
         "half_width_95": 5.32922046162652,
         "interval": [
          1346.5960958599583,
          1357.2545367832115
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 11.881047730080242,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 20,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.29265824152334186,
         "half_width_95": 0.3819325738783774,
         "interval": [
          -0.6745908154017193,
          0.08927433235503557
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4126488869080883,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 21,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.5309151637403463,
         "half_width_95": 0.2931111743036538,
         "interval": [
          -0.824026338044,
          -0.2378039894366925
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3098546195779769,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLWLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "702806",
         "date": "2024-11-14T20:00Z",
         "competition": "Concacaf Nations League",
         "kind": "competitive",
         "opponent": "St. Vincent and the Grenadines",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "702815",
         "date": "2024-11-18T01:00Z",
         "competition": "Concacaf Nations League",
         "kind": "competitive",
         "opponent": "El Salvador",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "698173",
         "date": "2025-06-04T21:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Belize",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "698191",
         "date": "2025-06-11T00:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Guyana",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401900641",
         "date": "2026-09-23T19:00Z",
         "competition": "Concacaf Nations League",
         "kind": "competitive",
         "opponent": "Turks and Caicos Islands",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "british-virgin-islands",
      "espn_id": "2644",
      "name": "British Virgin Islands",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 34,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1106.443730228283,
         "half_width_95": 26.247310351536804,
         "interval": [
          1080.1964198767462,
          1132.6910405798196
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 29.28674043853181,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 35,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -1.2929278406504578,
         "half_width_95": 0.4484625902479296,
         "interval": [
          -1.7413904308983874,
          -0.8444652504025283
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.48982734797255273,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           3
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 34,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -1.028478146650849,
         "half_width_95": 0.33131060020905573,
         "interval": [
          -1.3597887468599048,
          -0.6971675464417932
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.35460595903564207,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWDWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760874",
         "date": "2025-11-13T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cayman Islands",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760888",
         "date": "2025-11-15T21:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bahamas",
         "venue": "away",
         "gf": 6,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866382",
         "date": "2026-03-27T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Cayman Islands",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866389",
         "date": "2026-03-29T21:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Anguilla",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401872614",
         "date": "2026-06-03T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Gibraltar",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Montserrat",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "British Virgin Islands",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Montserrat vs Virgin Islands, British",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB",
       "ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB-MSR",
       "ask_c": 79,
       "bid_c": 72,
       "spread_c": 7,
       "ask_size": 10,
       "bid_size": 30,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Montserrat"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB",
       "ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB-TIE",
       "ask_c": 19,
       "bid_c": 7,
       "spread_c": 12,
       "ask_size": 5,
       "bid_size": 72,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB",
       "ticker": "KXCONCACAFNLGAME-26SEP26MSRIVB-IVB",
       "ask_c": 13,
       "bid_c": 6,
       "spread_c": 7,
       "ask_size": 8,
       "bid_size": 343,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Virgin Islands, British"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 245.5,
     "favourite_side": "home",
     "home_minus_away": 245.5,
     "components": {
      "elo": {
       "home": 1351.9,
       "away": 1106.4
      },
      "raw_gap_home_minus_away": 245.5,
      "venue_term_home_minus_away": 0,
      "venue_class": "NEUTRAL",
      "host_side": null,
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "South Africa",
   "away": "Guinea",
   "favourite": "South Africa",
   "opponent": "Guinea",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "South Africa": "espn_id",
    "Guinea": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 13,
    "opp": 20
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     4
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     3,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 1,
    "def": 0
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "South Africa",
     "opp": "Guinea"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 13,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1622.504197195422,
       "half_width_95": 38.42372180255895,
       "interval": [
        1584.080475392863,
        1660.927918997981
       ]
      },
      "opp": {
       "rank": 20,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1534.1110612015761,
       "half_width_95": 20.5537773872117,
       "interval": [
        1513.5572838143644,
        1554.664838588788
       ]
      },
      "tier_gap": 1,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 42.08827604598037,
       "opp": 23.45807609641644
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 12,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.387319846591821,
       "half_width_95": 0.3285789272426485,
       "interval": [
        0.05874091934917253,
        0.7158987738344695
       ]
      },
      "opp": {
       "rank": 28,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.06148527595717511,
       "half_width_95": 0.35973838508235173,
       "interval": [
        -0.42122366103952685,
        0.2982531091251766
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.33973788613675515,
       "opp": 0.3790461474655317
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 2,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 17,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.2516054289841171,
       "half_width_95": 0.3969198015739894,
       "interval": [
        -0.1453143725898723,
        0.6485252305581064
       ]
      },
      "opp": {
       "rank": 18,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.14905745451182426,
       "half_width_95": 0.4212564602776592,
       "interval": [
        -0.2721990057658349,
        0.5703139147894835
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4108616182357666,
       "opp": 0.4318590273733757
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920034",
   "competition_id": "401920034",
   "kickoff": "2026-09-26T13:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Orlando Stadium",
    "city": "Johannesburg",
    "country": "South Africa"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP26RSAGUI",
    "ticker": "KXAFCONGAME-26SEP26RSAGUI-RSA",
    "ask_c": 51,
    "bid_c": 50,
    "spread_c": 1,
    "ask_size": 1290,
    "bid_size": 1221,
    "flags": []
   },
   "form": {
    "fav": "?LDWL",
    "opp": "WDDLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "190226",
      "date": "2006-01-22T18:00:00Z",
      "home": "South Africa",
      "away": "Guinea",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "632920",
      "date": "2022-03-25T17:00:00Z",
      "home": "South Africa",
      "away": "Guinea",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "748079",
      "date": "2025-08-11T14:00:00Z",
      "home": "South Africa",
      "away": "Guinea",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "748079",
     "date": "2025-08-11T14:00:00Z",
     "home": "South Africa",
     "away": "Guinea",
     "home_score": 2,
     "away_score": 1,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group D",
    "leg": null,
    "status_detail": "Sat, September 26th at 9:00 AM EDT",
    "venue_country": "South Africa",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "south-africa",
      "espn_id": "467",
      "name": "South Africa",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 13,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1622.504197195422,
         "half_width_95": 38.42372180255895,
         "interval": [
          1584.080475392863,
          1660.927918997981
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 42.08827604598037,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 12,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.387319846591821,
         "half_width_95": 0.3285789272426485,
         "interval": [
          0.05874091934917253,
          0.7158987738344695
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.33973788613675515,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 17,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2516054289841171,
         "half_width_95": 0.3969198015739894,
         "interval": [
          -0.1453143725898723,
          0.6485252305581064
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4108616182357666,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "?LDWL",
       "disputed": 1,
       "withheld": 1,
       "games": [
        {
         "event_id": "401875160",
         "date": "2026-06-06T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Jamaica",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "?",
         "provider_letter": "W",
         "provider_agrees": true,
         "letter_if_espn": "W",
         "disputed": {
          "letter": "?",
          "why": "the providers disagree on this match's score, so no letter is drawn as if it were certain; both readings are below, each lettered from this team's side",
          "source": "research_archive/national_team_field_v2_2026-09-25/fill_report.json",
          "espn": {
           "score": [
            0,
            1
           ],
           "for": 1,
           "against": 0,
           "letter": "W"
          },
          "apifootball": {
           "score": [
            1,
            1
           ],
           "for": 1,
           "against": 1,
           "letter": "D",
           "status": null,
           "fixture": 1550809
          },
          "score_is": "home-away of that match, as ESPN lists its sides"
         }
        },
        {
         "event_id": "760415",
         "date": "2026-06-11T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Mexico",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760438",
         "date": "2026-06-18T16:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Czechia",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760466",
         "date": "2026-06-25T01:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "South Korea",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760486",
         "date": "2026-06-28T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Canada",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 1,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "guinea",
      "espn_id": "2847",
      "name": "Guinea",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 20,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1534.1110612015761,
         "half_width_95": 20.5537773872117,
         "interval": [
          1513.5572838143644,
          1554.664838588788
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 23.45807609641644,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 28,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.06148527595717511,
         "half_width_95": 0.35973838508235173,
         "interval": [
          -0.42122366103952685,
          0.2982531091251766
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3790461474655317,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 18,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.14905745451182426,
         "half_width_95": 0.4212564602776592,
         "interval": [
          -0.2721990057658349,
          0.5703139147894835
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4318590273733757,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WDDLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "761131",
         "date": "2025-11-15T16:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Liberia",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760897",
         "date": "2025-11-18T15:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Niger",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866400",
         "date": "2026-03-27T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Togo",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866399",
         "date": "2026-03-31T18:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Benin",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401871360",
         "date": "2026-06-04T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Northern Ireland",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "190226",
       "date": "2006-01-22T18:00:00Z",
       "home": "South Africa",
       "away": "Guinea",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "632920",
       "date": "2022-03-25T17:00:00Z",
       "home": "South Africa",
       "away": "Guinea",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "748079",
       "date": "2025-08-11T14:00:00Z",
       "home": "South Africa",
       "away": "Guinea",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "748079",
      "date": "2025-08-11T14:00:00Z",
      "home": "South Africa",
      "away": "Guinea",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "South Africa",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Guinea",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP26RSAGUI",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "South Africa vs Guinea",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP26RSAGUI",
       "ticker": "KXAFCONGAME-26SEP26RSAGUI-RSA",
       "ask_c": 51,
       "bid_c": 50,
       "spread_c": 1,
       "ask_size": 1290,
       "bid_size": 1221,
       "flags": [],
       "name": "South Africa"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP26RSAGUI",
       "ticker": "KXAFCONGAME-26SEP26RSAGUI-TIE",
       "ask_c": 31,
       "bid_c": 30,
       "spread_c": 1,
       "ask_size": 4,
       "bid_size": 504,
       "flags": [
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP26RSAGUI",
       "ticker": "KXAFCONGAME-26SEP26RSAGUI-GUI",
       "ask_c": 20,
       "bid_c": 19,
       "spread_c": 1,
       "ask_size": 960,
       "bid_size": 249,
       "flags": [],
       "name": "Guinea"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 153.4,
     "favourite_side": "home",
     "home_minus_away": 153.4,
     "components": {
      "elo": {
       "home": 1622.5,
       "away": 1534.1
      },
      "raw_gap_home_minus_away": 88.4,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "Kenya",
   "away": "Eritrea",
   "favourite": "Kenya",
   "opponent": "Eritrea",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Kenya": "espn_id",
    "Eritrea": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 23,
    "opp": 38
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     4,
     4
    ],
    "atk": null,
    "def": null
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": null,
    "def": null
   },
   "shape": null,
   "current_only": null,
   "field_partial": {
    "competition": "afconq",
    "clubs": {
     "fav": "Kenya",
     "opp": "Eritrea"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 23,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1522.7789787886122,
       "half_width_95": 21.074143130083286,
       "interval": [
        1501.704835658529,
        1543.8531219186955
       ]
      },
      "opp": {
       "rank": 38,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1442.0052662819621,
       "half_width_95": 7.511878205841013,
       "interval": [
        1434.4933880761212,
        1449.517144487803
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 24.74544507497767,
       "opp": 7.2943279069119304
      },
      "signal_source": "elo"
     }
    },
    "shape_absent": {
     "axes_absent": [
      "atk",
      "def"
     ],
     "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and one of these two teams has no measured atk or def. A label composed from fewer gaps would be a sentence about the fixture no measurement stands behind."
    },
    "axes_measured": [
     "ovr"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "why_not_field": "THE FIELD PLACED BOTH TEAMS ON FEWER AXES THAN `field` IS DEFINED ON: one of them has no measured attack or defence (the goals estimator's own refusal, named on its rating). This key is not `field` because `field` is a three-axis contract its readers walk unguarded. Nothing is padded: an axis a team was not measured on is absent, not a pair of nulls. `shape_absent` says which axes are missing and why."
   },
   "event_id": "401920035",
   "competition_id": "401920035",
   "kickoff": "2026-09-26T13:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Nyayo National Stadium",
    "city": "Nairobi",
    "country": "Kenya"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP26KENERI",
    "ticker": "KXAFCONGAME-26SEP26KENERI-KEN",
    "ask_c": 74,
    "bid_c": 73,
    "spread_c": 1,
    "ask_size": 2566,
    "bid_size": 367,
    "flags": []
   },
   "form": {
    "fav": "LDWDW",
    "opp": "LLLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [
     {
      "event_id": "apif-362511",
      "date": "2019-12-17T10:00:00+00:00",
      "home": "Kenya",
      "away": "Eritrea",
      "home_score": 1,
      "away_score": 4,
      "completed": true,
      "competition": "apif.competitive",
      "kind": "competitive",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "last_meeting": {
     "event_id": "apif-362511",
     "date": "2019-12-17T10:00:00+00:00",
     "home": "Kenya",
     "away": "Eritrea",
     "home_score": 1,
     "away_score": 4,
     "completed": true,
     "competition": "apif.competitive",
     "kind": "competitive",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 1
    },
    "reason": null,
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group D",
    "leg": null,
    "status_detail": "Sat, September 26th at 9:00 AM EDT",
    "venue_country": "Kenya",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "kenya",
      "espn_id": "2848",
      "name": "Kenya",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 23,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1522.7789787886122,
         "half_width_95": 21.074143130083286,
         "interval": [
          1501.704835658529,
          1543.8531219186955
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 24.74544507497767,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 30,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.06894316139479342,
         "half_width_95": 0.5608157080751855,
         "interval": [
          -0.6297588694699789,
          0.49187254668039215
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5646458467862586,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 38,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.2474102702168519,
         "half_width_95": 0.5749522487626619,
         "interval": [
          -0.8223625189795138,
          0.32754197854581
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5850274974006331,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LDWDW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760824",
         "date": "2025-11-18T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Senegal",
         "venue": "away",
         "gf": 0,
         "ga": 8,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401862401",
         "date": "2026-03-27T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Estonia",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "L",
         "provider_agrees": false,
         "shootout": {
          "for": 4,
          "against": 5,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "401866741",
         "date": "2026-03-30T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Grenada",
         "venue": "away",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401874168",
         "date": "2026-06-04T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Lesotho",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401874169",
         "date": "2026-06-07T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Lesotho",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 5,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "eritrea",
      "espn_id": "5774",
      "name": "Eritrea",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 38,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1442.0052662819621,
         "half_width_95": 7.511878205841013,
         "interval": [
          1434.4933880761212,
          1449.517144487803
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 7.2943279069119304,
         "signal_source": "elo"
        }
       },
       "axes_absent": [
        "atk",
        "def"
       ],
       "not_measured_because": "in a fitted league but in no domestic block — no club deviation, refused rather than set to the league average"
      },
      "form": {
       "available": true,
       "letters": "LLLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "436345",
         "date": "2015-10-13T17:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Botswana",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "554680",
         "date": "2019-09-04T13:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Namibia",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "554664",
         "date": "2019-09-10T17:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Namibia",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401850985",
         "date": "2026-03-25T16:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Eswatini",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401850990",
         "date": "2026-03-31T14:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Eswatini",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [
      {
       "event_id": "apif-362511",
       "date": "2019-12-17T10:00:00+00:00",
       "home": "Kenya",
       "away": "Eritrea",
       "home_score": 1,
       "away_score": 4,
       "completed": true,
       "competition": "apif.competitive",
       "kind": "competitive",
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "last_meeting": {
      "event_id": "apif-362511",
      "date": "2019-12-17T10:00:00+00:00",
      "home": "Kenya",
      "away": "Eritrea",
      "home_score": 1,
      "away_score": 4,
      "completed": true,
      "competition": "apif.competitive",
      "kind": "competitive",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 1
     },
     "reason": null,
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Kenya",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Eritrea",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP26KENERI",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Kenya vs Eritrea",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "ticker": "KXAFCONGAME-26SEP26KENERI-KEN",
       "ask_c": 74,
       "bid_c": 73,
       "spread_c": 1,
       "ask_size": 2566,
       "bid_size": 367,
       "flags": [],
       "name": "Kenya"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "ticker": "KXAFCONGAME-26SEP26KENERI-TIE",
       "ask_c": 20,
       "bid_c": 19,
       "spread_c": 1,
       "ask_size": 2314,
       "bid_size": 249,
       "flags": []
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "ticker": "KXAFCONGAME-26SEP26KENERI-ERI",
       "ask_c": 8,
       "bid_c": 7,
       "spread_c": 1,
       "ask_size": 606,
       "bid_size": 3414,
       "flags": [],
       "name": "Eritrea"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 145.8,
     "favourite_side": "home",
     "home_minus_away": 145.8,
     "components": {
      "elo": {
       "home": 1522.8,
       "away": 1442
      },
      "raw_gap_home_minus_away": 80.8,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "Zimbabwe",
   "away": "Congo DR",
   "favourite": "Congo DR",
   "opponent": "Zimbabwe",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "TRUE_HOME",
    "home_side": "home"
   },
   "resolution": {
    "Zimbabwe": "espn_id",
    "Congo DR": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 1,
    "away": 1,
    "min": 1
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 7,
    "opp": 26
   },
   "rates": {
    "ppg": [
     3,
     3
    ],
    "gf": [
     2,
     3
    ],
    "ga": [
     0,
     2
    ],
    "gdg": [
     2,
     1
    ]
   },
   "own_gdg": {
    "diff": 1,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
     4
    ],
    "atk": [
     2,
     3
    ],
    "def": [
     1,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 2,
    "atk": 1,
    "def": 2
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "Congo DR",
     "opp": "Zimbabwe"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 7,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1696.0991586154955,
       "half_width_95": 30.878675665595587,
       "interval": [
        1665.2204829498999,
        1726.9778342810912
       ]
      },
      "opp": {
       "rank": 26,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1506.6490985121868,
       "half_width_95": 26.775125468718848,
       "interval": [
        1479.873973043468,
        1533.4242239809057
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 34.43993658391481,
       "opp": 30.40738756179544
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 11,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.3913413420812138,
       "half_width_95": 0.2621554237736156,
       "interval": [
        0.12918591830759818,
        0.6534967658548294
       ]
      },
      "opp": {
       "rank": 26,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.010076452081634785,
       "half_width_95": 0.386761562150925,
       "interval": [
        -0.39683801423255977,
        0.37668511006929023
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2786894321534872,
       "opp": 0.3896314311511124
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 2,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.8160887050955432,
       "half_width_95": 0.4624387308431383,
       "interval": [
        0.3536499742524049,
        1.2785274359386816
       ]
      },
      "opp": {
       "rank": 26,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.025216077984835245,
       "half_width_95": 0.34804074410333574,
       "interval": [
        -0.32282466611850047,
        0.373256822088171
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4810739238784542,
       "opp": 0.36873680166514244
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920031",
   "competition_id": "401920031",
   "kickoff": "2026-09-28T16:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Harare National Sports Stadium",
    "city": "Harare",
    "country": "Zimbabwe"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP28ZIMCOD",
    "ticker": "KXAFCONGAME-26SEP28ZIMCOD-COD",
    "ask_c": 70,
    "bid_c": 21,
    "spread_c": 49,
    "ask_size": 13,
    "bid_size": 2,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "DLWLW",
    "opp": "LWLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "501795",
      "date": "2018-10-13T17:30:00Z",
      "home": "Congo DR",
      "away": "Zimbabwe",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "501753",
      "date": "2018-10-16T17:00:00Z",
      "home": "Zimbabwe",
      "away": "Congo DR",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "539288",
      "date": "2019-06-30T19:00:00Z",
      "home": "Zimbabwe",
      "away": "Congo DR",
      "home_score": 0,
      "away_score": 4,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "539288",
     "date": "2019-06-30T19:00:00Z",
     "home": "Zimbabwe",
     "away": "Congo DR",
     "home_score": 0,
     "away_score": 4,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group E",
    "leg": null,
    "status_detail": "Mon, September 28th at 12:00 PM EDT",
    "venue_country": "Zimbabwe",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "zimbabwe",
      "espn_id": "4214",
      "name": "Zimbabwe",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 26,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1506.6490985121868,
         "half_width_95": 26.775125468718848,
         "interval": [
          1479.873973043468,
          1533.4242239809057
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 30.40738756179544,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 26,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.010076452081634785,
         "half_width_95": 0.386761562150925,
         "interval": [
          -0.39683801423255977,
          0.37668511006929023
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3896314311511124,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 26,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.025216077984835245,
         "half_width_95": 0.34804074410333574,
         "interval": [
          -0.32282466611850047,
          0.373256822088171
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.36873680166514244,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "732159",
         "date": "2025-12-29T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "South Africa",
         "venue": "home",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401867105",
         "date": "2026-03-31T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Zambia",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401867936",
         "date": "2026-05-26T18:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Nigeria",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401874051",
         "date": "2026-05-30T13:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "India",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401920051",
         "date": "2026-09-24T19:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Sierra Leone",
         "venue": "away",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 3,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "congo-dr",
      "espn_id": "2850",
      "name": "Congo DR",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 7,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1696.0991586154955,
         "half_width_95": 30.878675665595587,
         "interval": [
          1665.2204829498999,
          1726.9778342810912
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 34.43993658391481,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 11,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.3913413420812138,
         "half_width_95": 0.2621554237736156,
         "interval": [
          0.12918591830759818,
          0.6534967658548294
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2786894321534872,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.8160887050955432,
         "half_width_95": 0.4624387308431383,
         "interval": [
          0.3536499742524049,
          1.2785274359386816
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4810739238784542,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DLWLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760435",
         "date": "2026-06-17T17:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Portugal",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760459",
         "date": "2026-06-24T02:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Colombia",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760482",
         "date": "2026-06-27T23:30Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Uzbekistan",
         "venue": "home",
         "gf": 3,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760495",
         "date": "2026-07-01T16:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "England",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401920055",
         "date": "2026-09-24T16:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Equatorial Guinea",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "501795",
       "date": "2018-10-13T17:30:00Z",
       "home": "Congo DR",
       "away": "Zimbabwe",
       "home_score": 1,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "501753",
       "date": "2018-10-16T17:00:00Z",
       "home": "Zimbabwe",
       "away": "Congo DR",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "539288",
       "date": "2019-06-30T19:00:00Z",
       "home": "Zimbabwe",
       "away": "Congo DR",
       "home_score": 0,
       "away_score": 4,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "539288",
      "date": "2019-06-30T19:00:00Z",
      "home": "Zimbabwe",
      "away": "Congo DR",
      "home_score": 0,
      "away_score": 4,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Zimbabwe",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Congo DR",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP28ZIMCOD",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Zimbabwe vs Congo DR",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP28ZIMCOD",
       "ticker": "KXAFCONGAME-26SEP28ZIMCOD-ZIM",
       "ask_c": 69,
       "bid_c": 6,
       "spread_c": 63,
       "ask_size": 5,
       "bid_size": 1959,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Zimbabwe"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP28ZIMCOD",
       "ticker": "KXAFCONGAME-26SEP28ZIMCOD-TIE",
       "ask_c": 69,
       "bid_c": 6,
       "spread_c": 63,
       "ask_size": 5,
       "bid_size": 1959,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP28ZIMCOD",
       "ticker": "KXAFCONGAME-26SEP28ZIMCOD-COD",
       "ask_c": 70,
       "bid_c": 21,
       "spread_c": 49,
       "ask_size": 13,
       "bid_size": 2,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Congo DR"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 124.5,
     "favourite_side": "away",
     "home_minus_away": -124.5,
     "components": {
      "elo": {
       "home": 1506.6,
       "away": 1696.1
      },
      "raw_gap_home_minus_away": -189.5,
      "venue_term_home_minus_away": 65,
      "venue_class": "TRUE_HOME",
      "host_side": "home",
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "Central African Republic",
   "away": "Burkina Faso",
   "favourite": "Burkina Faso",
   "opponent": "Central African Republic",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "NEUTRAL",
    "home_side": null
   },
   "resolution": {
    "Central African Republic": "espn_id",
    "Burkina Faso": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 1,
    "away": 1,
    "min": 1
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 12,
    "opp": 44
   },
   "rates": {
    "ppg": [
     1,
     0
    ],
    "gf": [
     1,
     1
    ],
    "ga": [
     1,
     3
    ],
    "gdg": [
     0,
     -2
    ]
   },
   "own_gdg": {
    "diff": 2,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     5
    ],
    "atk": [
     2,
     4
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
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "Burkina Faso",
     "opp": "Central African Republic"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 12,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1651.5581238973518,
       "half_width_95": 12.270212506033682,
       "interval": [
        1639.2879113913182,
        1663.8283364033855
       ]
      },
      "opp": {
       "rank": 44,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1403.1355207272643,
       "half_width_95": 10.247501530432361,
       "interval": [
        1392.888019196832,
        1413.3830222576967
       ]
      },
      "tier_gap": 2,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 16.159782583833948,
       "opp": 16.0241576238026
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 6,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.5204930993174943,
       "half_width_95": 0.27442368677662066,
       "interval": [
        0.24606941254087367,
        0.794916786094115
       ]
      },
      "opp": {
       "rank": 38,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.27261220110633627,
       "half_width_95": 0.5527108169512234,
       "interval": [
        -0.8253230180575597,
        0.2800986158448871
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2820256443245015,
       "opp": 0.561384485890229
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 2,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 1,
        "tier_set": [
         1
        ],
        "straddles": false
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 12,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.3120532113837916,
       "half_width_95": 0.37404312306982396,
       "interval": [
        -0.06198991168603235,
        0.6860963344536155
       ]
      },
      "opp": {
       "rank": 45,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.4076265862120835,
       "half_width_95": 0.38120424878136605,
       "interval": [
        -0.7888308349934495,
        -0.026422337430717424
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3744825828075929,
       "opp": 0.3944944679007192
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 3,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920032",
   "competition_id": "401920032",
   "kickoff": "2026-09-28T16:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Stade Larbi Zaouli",
    "city": "Casablanca",
    "country": "Morocco"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP28CAFBUR",
    "ticker": "KXAFCONGAME-26SEP28CAFBUR-BUR",
    "ask_c": 68,
    "bid_c": 11,
    "spread_c": 57,
    "ask_size": 5,
    "bid_size": 5,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "LWLLD",
    "opp": "LLWLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "748069",
      "date": "2025-08-06T14:00:00Z",
      "home": "Burkina Faso",
      "away": "Central African Republic",
      "home_score": 4,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "748069",
     "date": "2025-08-06T14:00:00Z",
     "home": "Burkina Faso",
     "away": "Central African Republic",
     "home_score": 4,
     "away_score": 2,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group F",
    "leg": null,
    "status_detail": "Mon, September 28th at 12:00 PM EDT",
    "venue_country": "Morocco",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "central-african-republic",
      "espn_id": "10528",
      "name": "Central African Republic",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 44,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1403.1355207272643,
         "half_width_95": 10.247501530432361,
         "interval": [
          1392.888019196832,
          1413.3830222576967
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 16.0241576238026,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 38,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.27261220110633627,
         "half_width_95": 0.5527108169512234,
         "interval": [
          -0.8253230180575597,
          0.2800986158448871
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.561384485890229,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 45,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.4076265862120835,
         "half_width_95": 0.38120424878136605,
         "interval": [
          -0.7888308349934495,
          -0.026422337430717424
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3944944679007192,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 3,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "687379",
         "date": "2025-09-07T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Comoros",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "687369",
         "date": "2025-10-08T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Ghana",
         "venue": "home",
         "gf": 0,
         "ga": 5,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "687380",
         "date": "2025-10-12T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Chad",
         "venue": "away",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401873740",
         "date": "2026-06-09T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Angola",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401920054",
         "date": "2026-09-24T16:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Mauritania",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 1,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "burkina-faso",
      "espn_id": "2845",
      "name": "Burkina Faso",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 12,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1651.5581238973518,
         "half_width_95": 12.270212506033682,
         "interval": [
          1639.2879113913182,
          1663.8283364033855
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 16.159782583833948,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 6,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5204930993174943,
         "half_width_95": 0.27442368677662066,
         "interval": [
          0.24606941254087367,
          0.794916786094115
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2820256443245015,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 12,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.3120532113837916,
         "half_width_95": 0.37404312306982396,
         "interval": [
          -0.06198991168603235,
          0.6860963344536155
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3744825828075929,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWLLD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "732153",
         "date": "2025-12-28T17:30Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Algeria",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732166",
         "date": "2025-12-31T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Sudan",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "732176",
         "date": "2026-01-06T19:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Ivory Coast",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870854",
         "date": "2026-06-05T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Russia",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401871492",
         "date": "2026-06-09T16:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Belarus",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "748069",
       "date": "2025-08-06T14:00:00Z",
       "home": "Burkina Faso",
       "away": "Central African Republic",
       "home_score": 4,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "748069",
      "date": "2025-08-06T14:00:00Z",
      "home": "Burkina Faso",
      "away": "Central African Republic",
      "home_score": 4,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Central African Republic",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Burkina Faso",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP28CAFBUR",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Central African Republic vs Burkina Faso",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP28CAFBUR",
       "ticker": "KXAFCONGAME-26SEP28CAFBUR-CAF",
       "ask_c": 68,
       "bid_c": 7,
       "spread_c": 61,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Central African Republic"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP28CAFBUR",
       "ticker": "KXAFCONGAME-26SEP28CAFBUR-TIE",
       "ask_c": 68,
       "bid_c": 7,
       "spread_c": 61,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP28CAFBUR",
       "ticker": "KXAFCONGAME-26SEP28CAFBUR-BUR",
       "ask_c": 68,
       "bid_c": 11,
       "spread_c": 57,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Burkina Faso"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 248.4,
     "favourite_side": "away",
     "home_minus_away": -248.4,
     "components": {
      "elo": {
       "home": 1403.1,
       "away": 1651.6
      },
      "raw_gap_home_minus_away": -248.4,
      "venue_term_home_minus_away": 0,
      "venue_class": "NEUTRAL",
      "host_side": null,
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "Equatorial Guinea",
   "away": "Sierra Leone",
   "favourite": "Equatorial Guinea",
   "opponent": "Sierra Leone",
   "fav_side": "home",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "NEUTRAL",
    "home_side": null
   },
   "resolution": {
    "Equatorial Guinea": "espn_id",
    "Sierra Leone": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 1,
    "away": 1,
    "min": 1
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 28,
    "opp": 37
   },
   "rates": {
    "ppg": [
     0,
     0
    ],
    "gf": [
     0,
     2
    ],
    "ga": [
     2,
     3
    ],
    "gdg": [
     -2,
     -1
    ]
   },
   "own_gdg": {
    "diff": -1,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     4,
     4
    ],
    "atk": [
     4,
     3
    ],
    "def": [
     3,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": -1,
    "def": 0
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "Equatorial Guinea",
     "opp": "Sierra Leone"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 28,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1489.2218602998273,
       "half_width_95": 16.463641022860884,
       "interval": [
        1472.7582192769664,
        1505.6855013226882
       ]
      },
      "opp": {
       "rank": 37,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1444.6251054949425,
       "half_width_95": 4.431452356218468,
       "interval": [
        1440.1936531387241,
        1449.056557851161
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 20.008898717798772,
       "opp": 10.952070472077484
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 37,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.261845040970055,
       "half_width_95": 0.38105510287162336,
       "interval": [
        -0.6429001438416784,
        0.11921006190156835
       ]
      },
      "opp": {
       "rank": 27,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.05132036526145457,
       "half_width_95": 0.49762894432924243,
       "interval": [
        -0.548949309590697,
        0.44630857906778787
       ]
      },
      "tier_gap": -1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.40210092948209786,
       "opp": 0.5191063923189487
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 2,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 30,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.040727684153137184,
       "half_width_95": 0.2890050771760687,
       "interval": [
        -0.3297327613292059,
        0.24827739302293153
       ]
      },
      "opp": {
       "rank": 24,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.04937724705276233,
       "half_width_95": 0.5843399504807101,
       "interval": [
        -0.5349627034279477,
        0.6337171975334724
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.30360840874583966,
       "opp": 0.5995587063756126
      },
      "signal_source": "shots",
      "signal": {
       "fav": "goals",
       "opp": "goals"
      },
      "licensed": {
       "bands": 3,
       "below_floor": true,
       "failing_condition": "G3",
       "fav": {
        "tier": 2,
        "tier_set": [
         2,
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 2,
        "tier_set": [
         1,
         2,
         3
        ],
        "straddles": true
       }
      }
     }
    },
    "shape": "HOLLOW",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920033",
   "competition_id": "401920033",
   "kickoff": "2026-09-28T16:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Stade Omnisport Ahmadou Ahidjo",
    "city": "Yaoundé",
    "country": "Cameroon"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP28GEQSLE",
    "ticker": "KXAFCONGAME-26SEP28GEQSLE-GEQ",
    "ask_c": 68,
    "bid_c": 7,
    "spread_c": 61,
    "ask_size": 5,
    "bid_size": 5,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "LLWLL",
    "opp": "LWDLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "233497",
      "date": "2008-06-01T14:30:00Z",
      "home": "Equatorial Guinea",
      "away": "Sierra Leone",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "233505",
      "date": "2008-09-06T16:30:00Z",
      "home": "Sierra Leone",
      "away": "Equatorial Guinea",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "334414",
      "date": "2012-06-09T17:00:00Z",
      "home": "Equatorial Guinea",
      "away": "Sierra Leone",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "334451",
      "date": "2013-09-07T16:30:00Z",
      "home": "Sierra Leone",
      "away": "Equatorial Guinea",
      "home_score": 3,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "618240",
      "date": "2022-01-20T16:00:00Z",
      "home": "Sierra Leone",
      "away": "Equatorial Guinea",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 2,
     "draw": 1,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "618240",
     "date": "2022-01-20T16:00:00Z",
     "home": "Sierra Leone",
     "away": "Equatorial Guinea",
     "home_score": 0,
     "away_score": 1,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group E",
    "leg": null,
    "status_detail": "Mon, September 28th at 12:00 PM EDT",
    "venue_country": "Cameroon",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "equatorial-guinea",
      "espn_id": "8938",
      "name": "Equatorial Guinea",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 28,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1489.2218602998273,
         "half_width_95": 16.463641022860884,
         "interval": [
          1472.7582192769664,
          1505.6855013226882
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 20.008898717798772,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 37,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.261845040970055,
         "half_width_95": 0.38105510287162336,
         "interval": [
          -0.6429001438416784,
          0.11921006190156835
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.40210092948209786,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 30,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.040727684153137184,
         "half_width_95": 0.2890050771760687,
         "interval": [
          -0.3297327613292059,
          0.24827739302293153
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.30360840874583966,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "732154",
         "date": "2025-12-28T15:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Sudan",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732165",
         "date": "2025-12-31T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Algeria",
         "venue": "home",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866395",
         "date": "2026-03-25T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kyrgyz Republic",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401873676",
         "date": "2026-06-09T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Comoros",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401920055",
         "date": "2026-09-24T16:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Congo DR",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "sierra-leone",
      "espn_id": "8600",
      "name": "Sierra Leone",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 37,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1444.6251054949425,
         "half_width_95": 4.431452356218468,
         "interval": [
          1440.1936531387241,
          1449.056557851161
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 10.952070472077484,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 27,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.05132036526145457,
         "half_width_95": 0.49762894432924243,
         "interval": [
          -0.548949309590697,
          0.44630857906778787
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5191063923189487,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 24,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.04937724705276233,
         "half_width_95": 0.5843399504807101,
         "interval": [
          -0.5349627034279477,
          0.6337171975334724
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5995587063756126,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2,
           3
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LWDLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "687129",
         "date": "2025-10-08T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Burkina Faso",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "687140",
         "date": "2025-10-12T19:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Djibouti",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866531",
         "date": "2026-03-30T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Azerbaijan",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "L",
         "provider_agrees": false,
         "shootout": {
          "for": 1,
          "against": 2,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "401875461",
         "date": "2026-06-09T18:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Liberia",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401920051",
         "date": "2026-09-24T19:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Zimbabwe",
         "venue": "home",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "233497",
       "date": "2008-06-01T14:30:00Z",
       "home": "Equatorial Guinea",
       "away": "Sierra Leone",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "233505",
       "date": "2008-09-06T16:30:00Z",
       "home": "Sierra Leone",
       "away": "Equatorial Guinea",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "334414",
       "date": "2012-06-09T17:00:00Z",
       "home": "Equatorial Guinea",
       "away": "Sierra Leone",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "334451",
       "date": "2013-09-07T16:30:00Z",
       "home": "Sierra Leone",
       "away": "Equatorial Guinea",
       "home_score": 3,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "618240",
       "date": "2022-01-20T16:00:00Z",
       "home": "Sierra Leone",
       "away": "Equatorial Guinea",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 2,
      "draw": 1,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "618240",
      "date": "2022-01-20T16:00:00Z",
      "home": "Sierra Leone",
      "away": "Equatorial Guinea",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Equatorial Guinea",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Sierra Leone",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP28GEQSLE",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Equatorial Guinea vs Sierra Leone",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP28GEQSLE",
       "ticker": "KXAFCONGAME-26SEP28GEQSLE-GEQ",
       "ask_c": 68,
       "bid_c": 7,
       "spread_c": 61,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Equatorial Guinea"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP28GEQSLE",
       "ticker": "KXAFCONGAME-26SEP28GEQSLE-TIE",
       "ask_c": 68,
       "bid_c": 7,
       "spread_c": 61,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP28GEQSLE",
       "ticker": "KXAFCONGAME-26SEP28GEQSLE-SLE",
       "ask_c": 68,
       "bid_c": 11,
       "spread_c": 57,
       "ask_size": 5,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Sierra Leone"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 44.6,
     "favourite_side": "home",
     "home_minus_away": 44.6,
     "components": {
      "elo": {
       "home": 1489.2,
       "away": 1444.6
      },
      "raw_gap_home_minus_away": 44.6,
      "venue_term_home_minus_away": 0,
      "venue_class": "NEUTRAL",
      "host_side": null,
      "venue_assumed": false
     },
     "raw_favourite_side": "home",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  },
  {
   "refused": false,
   "league": "afcon",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "home": "Eritrea",
   "away": "South Africa",
   "favourite": "South Africa",
   "opponent": "Eritrea",
   "fav_side": "away",
   "fav_source": "field",
   "venue_favourite": {
    "refused": true,
    "reason": "no_gdg_gap",
    "policy": "off",
    "flipped": false,
    "venue_class": "NEUTRAL",
    "home_side": null
   },
   "resolution": {
    "Eritrea": "espn_id",
    "South Africa": "espn_id"
   },
   "ppg_gap": null,
   "gdg_gap": null,
   "rank_gap": null,
   "gp_current": {
    "home": 0,
    "away": 0,
    "min": 0
   },
   "weights": null,
   "src": "current",
   "cross_league": false,
   "rated_in": {
    "home": "afcon",
    "away": "afcon"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "ranks": {
    "fav": 13,
    "opp": 38
   },
   "rates": {
    "ppg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ]
   },
   "own_gdg": {
    "diff": null,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     3,
     4
    ],
    "atk": null,
    "def": null
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": null,
    "def": null
   },
   "shape": null,
   "current_only": null,
   "field_partial": {
    "competition": "afconq",
    "clubs": {
     "fav": "South Africa",
     "opp": "Eritrea"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 13,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1622.504197195422,
       "half_width_95": 38.42372180255895,
       "interval": [
        1584.080475392863,
        1660.927918997981
       ]
      },
      "opp": {
       "rank": 38,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1442.0052662819621,
       "half_width_95": 7.511878205841013,
       "interval": [
        1434.4933880761212,
        1449.517144487803
       ]
      },
      "tier_gap": 1,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 42.08827604598037,
       "opp": 7.2943279069119304
      },
      "signal_source": "elo"
     }
    },
    "shape_absent": {
     "axes_absent": [
      "atk",
      "def"
     ],
     "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and one of these two teams has no measured atk or def. A label composed from fewer gaps would be a sentence about the fixture no measurement stands behind."
    },
    "axes_measured": [
     "ovr"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "why_not_field": "THE FIELD PLACED BOTH TEAMS ON FEWER AXES THAN `field` IS DEFINED ON: one of them has no measured attack or defence (the goals estimator's own refusal, named on its rating). This key is not `field` because `field` is a three-axis contract its readers walk unguarded. Nothing is padded: an axis a team was not measured on is absent, not a pair of nulls. `shape_absent` says which axes are missing and why."
   },
   "event_id": "401919991",
   "competition_id": "401919991",
   "kickoff": "2026-09-30T16:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Al Salam Stadium",
    "city": "Cairo",
    "country": "Egypt"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
    "ticker": "KXAFCONGAME-26SEP30ERIRSA-RSA",
    "ask_c": 70,
    "bid_c": 11,
    "spread_c": 59,
    "ask_size": 21,
    "bid_size": 5,
    "flags": [
     "WIDE",
     "THIN"
    ]
   },
   "form": {
    "fav": "?LDWL",
    "opp": "LLLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "source": "corpus_since_2018",
    "window": {
     "from": "2018-01-01",
     "to": "2026-09-24T22:40:32+00:00",
     "label": "since 2018, corpus to 2026-09-24"
    },
    "meetings": [],
    "last_meeting": null,
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 0
    },
    "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
    "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
   },
   "national": {
    "competition": "afcon",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group D",
    "leg": null,
    "status_detail": "Wed, September 30th at 12:00 PM EDT",
    "venue_country": "Egypt",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "eritrea",
      "espn_id": "5774",
      "name": "Eritrea",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 38,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1442.0052662819621,
         "half_width_95": 7.511878205841013,
         "interval": [
          1434.4933880761212,
          1449.517144487803
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 7.2943279069119304,
         "signal_source": "elo"
        }
       },
       "axes_absent": [
        "atk",
        "def"
       ],
       "not_measured_because": "in a fitted league but in no domestic block — no club deviation, refused rather than set to the league average"
      },
      "form": {
       "available": true,
       "letters": "LLLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "436345",
         "date": "2015-10-13T17:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Botswana",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "554680",
         "date": "2019-09-04T13:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Namibia",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "554664",
         "date": "2019-09-10T17:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Namibia",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401850985",
         "date": "2026-03-25T16:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Eswatini",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401850990",
         "date": "2026-03-31T14:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Eswatini",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "south-africa",
      "espn_id": "467",
      "name": "South Africa",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 13,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1622.504197195422,
         "half_width_95": 38.42372180255895,
         "interval": [
          1584.080475392863,
          1660.927918997981
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 42.08827604598037,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 12,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.387319846591821,
         "half_width_95": 0.3285789272426485,
         "interval": [
          0.05874091934917253,
          0.7158987738344695
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.33973788613675515,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 1,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 17,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2516054289841171,
         "half_width_95": 0.3969198015739894,
         "interval": [
          -0.1453143725898723,
          0.6485252305581064
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4108616182357666,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 3,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           1,
           2
          ],
          "straddles": true
         }
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "?LDWL",
       "disputed": 1,
       "withheld": 1,
       "games": [
        {
         "event_id": "401875160",
         "date": "2026-06-06T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Jamaica",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "?",
         "provider_letter": "W",
         "provider_agrees": true,
         "letter_if_espn": "W",
         "disputed": {
          "letter": "?",
          "why": "the providers disagree on this match's score, so no letter is drawn as if it were certain; both readings are below, each lettered from this team's side",
          "source": "research_archive/national_team_field_v2_2026-09-25/fill_report.json",
          "espn": {
           "score": [
            0,
            1
           ],
           "for": 1,
           "against": 0,
           "letter": "W"
          },
          "apifootball": {
           "score": [
            1,
            1
           ],
           "for": 1,
           "against": 1,
           "letter": "D",
           "status": null,
           "fixture": 1550809
          },
          "score_is": "home-away of that match, as ESPN lists its sides"
         }
        },
        {
         "event_id": "760415",
         "date": "2026-06-11T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Mexico",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760438",
         "date": "2026-06-18T16:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Czechia",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760466",
         "date": "2026-06-25T01:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "South Korea",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760486",
         "date": "2026-06-28T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Canada",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 1,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     }
    },
    "fixture_source": "espn",
    "kickoff_status": null,
    "apifootball": null,
    "head_to_head": {
     "available": false,
     "source": "corpus_since_2018",
     "window": {
      "from": "2018-01-01",
      "to": "2026-09-24T22:40:32+00:00",
      "label": "since 2018, corpus to 2026-09-24"
     },
     "meetings": [],
     "last_meeting": null,
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 0
     },
     "reason": "no meeting since 2018 in our corpus (senior internationals to 2026-09-24). A measured absence over that window, not a claim the two teams never met",
     "espn_reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met"
    },
    "lineups": {
     "announced": false,
     "sides": {
      "home": {
       "team": "Eritrea",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "South Africa",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Eritrea vs South Africa",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-ERI",
       "ask_c": 9,
       "bid_c": 5,
       "spread_c": 4,
       "ask_size": 5,
       "bid_size": 472,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Eritrea"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-TIE",
       "ask_c": 70,
       "bid_c": 5,
       "spread_c": 65,
       "ask_size": 55,
       "bid_size": 606,
       "flags": [
        "WIDE",
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-RSA",
       "ask_c": 70,
       "bid_c": 11,
       "spread_c": 59,
       "ask_size": 21,
       "bid_size": 5,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "South Africa"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 180.5,
     "favourite_side": "away",
     "home_minus_away": -180.5,
     "components": {
      "elo": {
       "home": 1442,
       "away": 1622.5
      },
      "raw_gap_home_minus_away": -180.5,
      "venue_term_home_minus_away": 0,
      "venue_class": "NEUTRAL",
      "host_side": null,
      "venue_assumed": false
     },
     "raw_favourite_side": "away",
     "venue_flips_raw_order": false,
     "tie_broken_by_rank": false,
     "basis": "The venue-adjusted Elo gap: the two teams' overall ratings on this competition's national-team field, differenced, plus the club home term given to the side whose country hosts, and nothing on neutral ground. The card's favourite and its quoted Kalshi leg are read off this same number. A preregistered out-of-sample bake-off chose it: no alternative beat it by a margin whose 95% interval excluded zero (see research_archive/national_headline_bakeoff_2026-09-25/RESULTS.json)."
    }
   }
  }
 ],
 "refusals": [],
 "off_board": [
  {
   "event_id": "401861049",
   "competition_id": "401861049",
   "kickoff": "2026-09-25T16:00Z",
   "state": "post",
   "home": "Georgia",
   "away": "Northern Ireland",
   "code": "finished",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
   "league": "unl"
  },
  {
   "event_id": "401861050",
   "competition_id": "401861050",
   "kickoff": "2026-09-25T16:00Z",
   "state": "post",
   "home": "Armenia",
   "away": "Latvia",
   "code": "finished",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
   "league": "unl"
  },
  {
   "event_id": "401861051",
   "competition_id": "401861051",
   "kickoff": "2026-09-25T18:45Z",
   "state": "post",
   "home": "Sweden",
   "away": "Romania",
   "code": "finished",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
   "league": "unl"
  }
 ],
 "off_board_counts": {
  "kicked_off": 0,
  "finished": 24,
  "not_yet_kicked_off": 0,
  "state_unrecognised": 0,
  "no_state": 0,
  "event_unreadable": 0
 },
 "competitions": {
  "unl": {
   "structure": {
    "stages": [
     {
      "key": "group-stage",
      "label": "League phase (Leagues A-D)",
      "kind": "group",
      "dates": "MD1 24-26 Sep, MD2 27-29 Sep, MD3 30 Sep-3 Oct, MD4 4-6 Oct, MD5 12-14 Nov, MD6 15-17 Nov 2026",
      "on_provider": true
     },
     {
      "key": "quarterfinals",
      "label": "League A quarter-finals (two legs)",
      "kind": "knockout",
      "dates": "25-30 Mar 2027",
      "on_provider": false
     },
     {
      "key": "promotion-relegation-playoffs",
      "label": "League A/B and B/C promotion/relegation play-offs",
      "kind": "playoff",
      "dates": "25-30 Mar 2027",
      "on_provider": false
     },
     {
      "key": "finals",
      "label": "Final tournament (four teams)",
      "kind": "finals",
      "dates": "9-13 Jun 2027",
      "on_provider": false
     },
     {
      "key": "league-cd-playoffs",
      "label": "League C/D play-offs",
      "kind": "playoff",
      "dates": "23-28 Mar 2028",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A1": [
      {
       "espn_id": "459",
       "name": "Belgium",
       "key": "belgium",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "478",
       "name": "France",
       "key": "france",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "162",
       "name": "Italy",
       "key": "italy",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "465",
       "name": "Türkiye",
       "key": "turkiye",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group A2": [
      {
       "espn_id": "481",
       "name": "Germany",
       "key": "germany",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "455",
       "name": "Greece",
       "key": "greece",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "449",
       "name": "Netherlands",
       "key": "netherlands",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "6757",
       "name": "Serbia",
       "key": "serbia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group A3": [
      {
       "espn_id": "477",
       "name": "Croatia",
       "key": "croatia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "450",
       "name": "Czechia",
       "key": "czechia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "448",
       "name": "England",
       "key": "england",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "164",
       "name": "Spain",
       "key": "spain",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group A4": [
      {
       "espn_id": "479",
       "name": "Denmark",
       "key": "denmark",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "464",
       "name": "Norway",
       "key": "norway",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "482",
       "name": "Portugal",
       "key": "portugal",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "578",
       "name": "Wales",
       "key": "wales",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group B1": [
      {
       "espn_id": "463",
       "name": "North Macedonia",
       "key": "north-macedonia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "580",
       "name": "Scotland",
       "key": "scotland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "472",
       "name": "Slovenia",
       "key": "slovenia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "475",
       "name": "Switzerland",
       "key": "switzerland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group B2": [
      {
       "espn_id": "584",
       "name": "Georgia",
       "key": "georgia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "480",
       "name": "Hungary",
       "key": "hungary",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "586",
       "name": "Northern Ireland",
       "key": "northern-ireland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "457",
       "name": "Ukraine",
       "key": "ukraine",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group B3": [
      {
       "espn_id": "474",
       "name": "Austria",
       "key": "austria",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "461",
       "name": "Israel",
       "key": "israel",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "18272",
       "name": "Kosovo",
       "key": "kosovo",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "476",
       "name": "Republic of Ireland",
       "key": "republic-of-ireland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group B4": [
      {
       "espn_id": "452",
       "name": "Bosnia-Herzegovina",
       "key": "bosnia-herzegovina",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "471",
       "name": "Poland",
       "key": "poland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "473",
       "name": "Romania",
       "key": "romania",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "466",
       "name": "Sweden",
       "key": "sweden",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group C1": [
      {
       "espn_id": "585",
       "name": "Albania",
       "key": "albania",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "583",
       "name": "Belarus",
       "key": "belarus",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "458",
       "name": "Finland",
       "key": "finland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "588",
       "name": "San Marino",
       "key": "san-marino",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group C2": [
      {
       "espn_id": "579",
       "name": "Armenia",
       "key": "armenia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "445",
       "name": "Cyprus",
       "key": "cyprus",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "456",
       "name": "Latvia",
       "key": "latvia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "6775",
       "name": "Montenegro",
       "key": "montenegro",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group C3": [
      {
       "espn_id": "447",
       "name": "Faroe Islands",
       "key": "faroe-islands",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2619",
       "name": "Kazakhstan",
       "key": "kazakhstan",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "483",
       "name": "Moldova",
       "key": "moldova",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "468",
       "name": "Slovakia",
       "key": "slovakia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group C4": [
      {
       "espn_id": "462",
       "name": "Bulgaria",
       "key": "bulgaria",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "444",
       "name": "Estonia",
       "key": "estonia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "470",
       "name": "Iceland",
       "key": "iceland",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "582",
       "name": "Luxembourg",
       "key": "luxembourg",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group D1": [
      {
       "espn_id": "587",
       "name": "Andorra",
       "key": "andorra",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "16721",
       "name": "Gibraltar",
       "key": "gibraltar",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "453",
       "name": "Malta",
       "key": "malta",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group D2": [
      {
       "espn_id": "581",
       "name": "Azerbaijan",
       "key": "azerbaijan",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "589",
       "name": "Liechtenstein",
       "key": "liechtenstein",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "460",
       "name": "Lithuania",
       "key": "lithuania",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   }
  },
  "cnl": {
   "structure": {
    "stages": [
     {
      "key": "group-stage",
      "label": "Group stage (Leagues A, B, C)",
      "kind": "group",
      "dates": "21 Sep-6 Oct 2026; League B also 9-17 Nov 2026",
      "on_provider": true
     },
     {
      "key": "quarterfinals",
      "label": "League A quarter-finals (two legs)",
      "kind": "knockout",
      "dates": "9-17 Nov 2026",
      "on_provider": false
     },
     {
      "key": "finals",
      "label": "League A Finals, SoFi Stadium",
      "kind": "finals",
      "dates": "25-28 Mar 2027",
      "on_provider": false
     },
     {
      "key": "league-bc-championships",
      "label": "League B and League C Championships",
      "kind": "finals",
      "dates": "22-30 Mar 2027",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "League A, Group A": [
      {
       "espn_id": "11678",
       "name": "Curaçao",
       "key": "curacao",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 4,
       "ga": 3,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2649",
       "name": "Dominican Republic",
       "key": "dominican-republic",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 2,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "2654",
       "name": "Haiti",
       "key": "haiti",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 2,
       "gd": 1,
       "pts": 3,
       "position": 3
      },
      {
       "espn_id": "214",
       "name": "Costa Rica",
       "key": "costa-rica",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 3,
       "ga": 4,
       "gd": -1,
       "pts": 0,
       "position": 4
      },
      {
       "espn_id": "2658",
       "name": "Nicaragua",
       "key": "nicaragua",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 2,
       "ga": 3,
       "gd": -1,
       "pts": 0,
       "position": 5
      },
      {
       "espn_id": "2627",
       "name": "Trinidad and Tobago",
       "key": "trinidad-and-tobago",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 2,
       "ga": 3,
       "gd": -1,
       "pts": 0,
       "position": 6
      }
     ],
     "League A, Group B": [
      {
       "espn_id": "2650",
       "name": "El Salvador",
       "key": "el-salvador",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2652",
       "name": "Guatemala",
       "key": "guatemala",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "215",
       "name": "Honduras",
       "key": "honduras",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "1038",
       "name": "Jamaica",
       "key": "jamaica",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2728",
       "name": "Martinique",
       "key": "martinique",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2664",
       "name": "Suriname",
       "key": "suriname",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "League B, Group A": [
      {
       "espn_id": "2653",
       "name": "Guyana",
       "key": "guyana",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 1,
       "ga": 0,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2646",
       "name": "Cayman Islands",
       "key": "cayman-islands",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 1,
       "position": 2
      },
      {
       "espn_id": "13582",
       "name": "Dominica",
       "key": "dominica",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 1,
       "position": 3
      },
      {
       "espn_id": "11766",
       "name": "Puerto Rico",
       "key": "puerto-rico",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 1,
       "gd": -1,
       "pts": 0,
       "position": 4
      }
     ],
     "League B, Group B": [
      {
       "espn_id": "7657",
       "name": "Guadeloupe",
       "key": "guadeloupe",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 1,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2637",
       "name": "Barbados",
       "key": "barbados",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 2
      },
      {
       "espn_id": "2661",
       "name": "St. Lucia",
       "key": "st-lucia",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "2643",
       "name": "Bermuda",
       "key": "bermuda",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 4
      }
     ],
     "League B, Group C": [
      {
       "espn_id": "2647",
       "name": "Cuba",
       "key": "cuba",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 0,
       "gd": 3,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "19314",
       "name": "Bonaire",
       "key": "bonaire",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 2
      },
      {
       "espn_id": "2662",
       "name": "St. Kitts and Nevis",
       "key": "st-kitts-and-nevis",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "2651",
       "name": "Grenada",
       "key": "grenada",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 3,
       "gd": -3,
       "pts": 0,
       "position": 4
      }
     ],
     "League B, Group D": [
      {
       "espn_id": "2641",
       "name": "Belize",
       "key": "belize",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "10532",
       "name": "French Guiana",
       "key": "french-guiana",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "18243",
       "name": "Sint Maarten",
       "key": "sint-maarten",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "13584",
       "name": "St. Vincent and the Grenadines",
       "key": "st-vincent-and-the-grenadines",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "League C, Group A": [
      {
       "espn_id": "2655",
       "name": "Montserrat",
       "key": "montserrat",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2644",
       "name": "British Virgin Islands",
       "key": "british-virgin-islands",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 2
      },
      {
       "espn_id": "2665",
       "name": "Turks and Caicos Islands",
       "key": "turks-and-caicos-islands",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 3
      }
     ],
     "League C, Group B": [
      {
       "espn_id": "2642",
       "name": "Aruba",
       "key": "aruba",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 1,
       "ga": 0,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "8942",
       "name": "Anguilla",
       "key": "anguilla",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 2
      },
      {
       "espn_id": "2638",
       "name": "Antigua and Barbuda",
       "key": "antigua-and-barbuda",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 1,
       "gd": -1,
       "pts": 0,
       "position": 3
      }
     ],
     "League C, Group C": [
      {
       "espn_id": "10596",
       "name": "St. Martin",
       "key": "st-martin",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 8,
       "ga": 0,
       "gd": 8,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2645",
       "name": "US Virgin Islands",
       "key": "us-virgin-islands",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": 2
      },
      {
       "espn_id": "2640",
       "name": "Bahamas",
       "key": "bahamas",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 8,
       "gd": -8,
       "pts": 0,
       "position": 3
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   }
  },
  "afcon": {
   "structure": {
    "stages": [
     {
      "key": "preliminary-round",
      "label": "Qualifying preliminary round (two legs)",
      "kind": "knockout",
      "dates": "25-31 Mar 2026",
      "on_provider": true
     },
     {
      "key": "group-stage",
      "label": "Qualifying groups (12 groups of 4, home and away)",
      "kind": "group",
      "dates": "MD1-2 24 Sep-6 Oct 2026, MD3-4 9-17 Nov 2026, MD5-6 22-30 Mar 2027",
      "on_provider": true
     },
     {
      "key": "finals",
      "label": "Finals, Kenya / Uganda / Tanzania",
      "kind": "finals",
      "dates": "19 Jun-17 Jul 2027",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A": [
      {
       "espn_id": "2869",
       "name": "Morocco",
       "key": "morocco",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "8937",
       "name": "Niger",
       "key": "niger",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 1,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "6640",
       "name": "Lesotho",
       "key": "lesotho",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "4231",
       "name": "Gabon",
       "key": "gabon",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group B": [
      {
       "espn_id": "4325",
       "name": "Malawi",
       "key": "malawi",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 1,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "653",
       "name": "Angola",
       "key": "angola",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 1,
       "position": 2
      },
      {
       "espn_id": "2620",
       "name": "Egypt",
       "key": "egypt",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 1,
       "position": 3
      },
      {
       "espn_id": "14075",
       "name": "South Sudan",
       "key": "south-sudan",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 4
      }
     ],
     "Group C": [
      {
       "espn_id": "4789",
       "name": "Ivory Coast",
       "key": "ivory-coast",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "7368",
       "name": "Gambia",
       "key": "gambia",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 1,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "5776",
       "name": "Somalia",
       "key": "somalia",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "4469",
       "name": "Ghana",
       "key": "ghana",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group D": [
      {
       "espn_id": "5774",
       "name": "Eritrea",
       "key": "eritrea",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2847",
       "name": "Guinea",
       "key": "guinea",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "2848",
       "name": "Kenya",
       "key": "kenya",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      },
      {
       "espn_id": "467",
       "name": "South Africa",
       "key": "south-africa",
       "gp": 0,
       "w": 0,
       "d": 0,
       "l": 0,
       "gf": 0,
       "ga": 0,
       "gd": 0,
       "pts": 0,
       "position": null
      }
     ],
     "Group E": [
      {
       "espn_id": "2850",
       "name": "Congo DR",
       "key": "congo-dr",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "4214",
       "name": "Zimbabwe",
       "key": "zimbabwe",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 2,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "8600",
       "name": "Sierra Leone",
       "key": "sierra-leone",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 2,
       "ga": 3,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "8938",
       "name": "Equatorial Guinea",
       "key": "equatorial-guinea",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group F": [
      {
       "espn_id": "8940",
       "name": "Mauritania",
       "key": "mauritania",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 1,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2844",
       "name": "Benin",
       "key": "benin",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 2
      },
      {
       "espn_id": "2845",
       "name": "Burkina Faso",
       "key": "burkina-faso",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 3
      },
      {
       "espn_id": "10528",
       "name": "Central African Republic",
       "key": "central-african-republic",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 3,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group G": [
      {
       "espn_id": "656",
       "name": "Cameroon",
       "key": "cameroon",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 1,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "6725",
       "name": "Namibia",
       "key": "namibia",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 1,
       "ga": 0,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "4276",
       "name": "Congo",
       "key": "congo",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 1,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "8601",
       "name": "Comoros",
       "key": "comoros",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 3,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group H": [
      {
       "espn_id": "4245",
       "name": "Botswana",
       "key": "botswana",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 2,
       "ga": 2,
       "gd": 0,
       "pts": 1,
       "position": 1
      },
      {
       "espn_id": "2621",
       "name": "Libya",
       "key": "libya",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 2,
       "ga": 2,
       "gd": 0,
       "pts": 1,
       "position": 2
      },
      {
       "espn_id": "659",
       "name": "Tunisia",
       "key": "tunisia",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 3
      },
      {
       "espn_id": "4211",
       "name": "Uganda",
       "key": "uganda",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 4
      }
     ],
     "Group I": [
      {
       "espn_id": "624",
       "name": "Algeria",
       "key": "algeria",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 1,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "4356",
       "name": "Togo",
       "key": "togo",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 1,
       "ga": 0,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "5779",
       "name": "Burundi",
       "key": "burundi",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 1,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "4277",
       "name": "Zambia",
       "key": "zambia",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 3,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group J": [
      {
       "espn_id": "4319",
       "name": "Sudan",
       "key": "sudan",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 1,
       "ga": 0,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "8939",
       "name": "Mozambique",
       "key": "mozambique",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 2
      },
      {
       "espn_id": "654",
       "name": "Senegal",
       "key": "senegal",
       "gp": 1,
       "w": 0,
       "d": 1,
       "l": 0,
       "gf": 1,
       "ga": 1,
       "gd": 0,
       "pts": 1,
       "position": 3
      },
      {
       "espn_id": "5777",
       "name": "Ethiopia",
       "key": "ethiopia",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 1,
       "gd": -1,
       "pts": 0,
       "position": 4
      }
     ],
     "Group K": [
      {
       "espn_id": "2849",
       "name": "Mali",
       "key": "mali",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 1,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "2851",
       "name": "Rwanda",
       "key": "rwanda",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 1,
       "gd": 2,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "2597",
       "name": "Cape Verde",
       "key": "cape-verde",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 3,
       "gd": -2,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "4205",
       "name": "Liberia",
       "key": "liberia",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 3,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ],
     "Group L": [
      {
       "espn_id": "8602",
       "name": "Guinea-Bissau",
       "key": "guinea-bissau",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "657",
       "name": "Nigeria",
       "key": "nigeria",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 1,
       "gd": 1,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "5533",
       "name": "Madagascar",
       "key": "madagascar",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "5778",
       "name": "Tanzania",
       "key": "tanzania",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 4
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   },
   "teams": {
    "morocco": {
     "name": "Morocco",
     "espn_id": "2869",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401920006",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Lesotho"
     }
    },
    "niger": {
     "name": "Niger",
     "espn_id": "8937",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401919993",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Gabon"
     }
    },
    "lesotho": {
     "name": "Lesotho",
     "espn_id": "6640",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401920006",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Morocco"
     }
    },
    "gabon": {
     "name": "Gabon",
     "espn_id": "4231",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401919993",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Niger"
     }
    },
    "malawi": {
     "name": "Malawi",
     "espn_id": "4325",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401919990",
      "kickoff": "2026-10-06T19:00Z",
      "opponent": "Angola"
     }
    },
    "angola": {
     "name": "Angola",
     "espn_id": "653",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401919990",
      "kickoff": "2026-10-06T19:00Z",
      "opponent": "Malawi"
     }
    },
    "egypt": {
     "name": "Egypt",
     "espn_id": "2620",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401920027",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "South Sudan"
     }
    },
    "south-sudan": {
     "name": "South Sudan",
     "espn_id": "14075",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401920027",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Egypt"
     }
    },
    "ivory-coast": {
     "name": "Ivory Coast",
     "espn_id": "4789",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401919996",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Somalia"
     }
    },
    "gambia": {
     "name": "Gambia",
     "espn_id": "7368",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401919999",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Ghana"
     }
    },
    "somalia": {
     "name": "Somalia",
     "espn_id": "5776",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401919996",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Ivory Coast"
     }
    },
    "ghana": {
     "name": "Ghana",
     "espn_id": "4469",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401919999",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Gambia"
     }
    },
    "eritrea": {
     "name": "Eritrea",
     "espn_id": "5774",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401920035",
      "kickoff": "2026-09-26T13:00Z",
      "opponent": "Kenya"
     }
    },
    "guinea": {
     "name": "Guinea",
     "espn_id": "2847",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401920034",
      "kickoff": "2026-09-26T13:00Z",
      "opponent": "South Africa"
     }
    },
    "kenya": {
     "name": "Kenya",
     "espn_id": "2848",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401920035",
      "kickoff": "2026-09-26T13:00Z",
      "opponent": "Eritrea"
     }
    },
    "south-africa": {
     "name": "South Africa",
     "espn_id": "467",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401920034",
      "kickoff": "2026-09-26T13:00Z",
      "opponent": "Guinea"
     }
    },
    "congo-dr": {
     "name": "Congo DR",
     "espn_id": "2850",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401920031",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Zimbabwe"
     }
    },
    "zimbabwe": {
     "name": "Zimbabwe",
     "espn_id": "4214",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401920031",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Congo DR"
     }
    },
    "sierra-leone": {
     "name": "Sierra Leone",
     "espn_id": "8600",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401920033",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Equatorial Guinea"
     }
    },
    "equatorial-guinea": {
     "name": "Equatorial Guinea",
     "espn_id": "8938",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401920033",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Sierra Leone"
     }
    },
    "mauritania": {
     "name": "Mauritania",
     "espn_id": "8940",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401919992",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Benin"
     }
    },
    "benin": {
     "name": "Benin",
     "espn_id": "2844",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401919992",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Mauritania"
     }
    },
    "burkina-faso": {
     "name": "Burkina Faso",
     "espn_id": "2845",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401920032",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Central African Republic"
     }
    },
    "central-african-republic": {
     "name": "Central African Republic",
     "espn_id": "10528",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401920032",
      "kickoff": "2026-09-28T16:00Z",
      "opponent": "Burkina Faso"
     }
    },
    "cameroon": {
     "name": "Cameroon",
     "espn_id": "656",
     "group": "Group G",
     "next_fixture": {
      "event_id": "401919995",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Congo"
     }
    },
    "namibia": {
     "name": "Namibia",
     "espn_id": "6725",
     "group": "Group G",
     "next_fixture": {
      "event_id": "401920029",
      "kickoff": "2026-09-29T12:00Z",
      "opponent": "Comoros"
     }
    },
    "congo": {
     "name": "Congo",
     "espn_id": "4276",
     "group": "Group G",
     "next_fixture": {
      "event_id": "401919995",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Cameroon"
     }
    },
    "comoros": {
     "name": "Comoros",
     "espn_id": "8601",
     "group": "Group G",
     "next_fixture": {
      "event_id": "401920029",
      "kickoff": "2026-09-29T12:00Z",
      "opponent": "Namibia"
     }
    },
    "botswana": {
     "name": "Botswana",
     "espn_id": "4245",
     "group": "Group H",
     "next_fixture": {
      "event_id": "401920030",
      "kickoff": "2026-09-28T19:00Z",
      "opponent": "Tunisia"
     }
    },
    "libya": {
     "name": "Libya",
     "espn_id": "2621",
     "group": "Group H",
     "next_fixture": {
      "event_id": "401920001",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Uganda"
     }
    },
    "tunisia": {
     "name": "Tunisia",
     "espn_id": "659",
     "group": "Group H",
     "next_fixture": {
      "event_id": "401920030",
      "kickoff": "2026-09-28T19:00Z",
      "opponent": "Botswana"
     }
    },
    "uganda": {
     "name": "Uganda",
     "espn_id": "4211",
     "group": "Group H",
     "next_fixture": {
      "event_id": "401920001",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Libya"
     }
    },
    "algeria": {
     "name": "Algeria",
     "espn_id": "624",
     "group": "Group I",
     "next_fixture": {
      "event_id": "401920028",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Burundi"
     }
    },
    "togo": {
     "name": "Togo",
     "espn_id": "4356",
     "group": "Group I",
     "next_fixture": {
      "event_id": "401919998",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Zambia"
     }
    },
    "burundi": {
     "name": "Burundi",
     "espn_id": "5779",
     "group": "Group I",
     "next_fixture": {
      "event_id": "401920028",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Algeria"
     }
    },
    "zambia": {
     "name": "Zambia",
     "espn_id": "4277",
     "group": "Group I",
     "next_fixture": {
      "event_id": "401919998",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Togo"
     }
    },
    "sudan": {
     "name": "Sudan",
     "espn_id": "4319",
     "group": "Group J",
     "next_fixture": {
      "event_id": "401920004",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Mozambique"
     }
    },
    "mozambique": {
     "name": "Mozambique",
     "espn_id": "8939",
     "group": "Group J",
     "next_fixture": {
      "event_id": "401920004",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Sudan"
     }
    },
    "senegal": {
     "name": "Senegal",
     "espn_id": "654",
     "group": "Group J",
     "next_fixture": {
      "event_id": "401920005",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Ethiopia"
     }
    },
    "ethiopia": {
     "name": "Ethiopia",
     "espn_id": "5777",
     "group": "Group J",
     "next_fixture": {
      "event_id": "401920005",
      "kickoff": "2026-09-29T13:00Z",
      "opponent": "Senegal"
     }
    },
    "mali": {
     "name": "Mali",
     "espn_id": "2849",
     "group": "Group K",
     "next_fixture": {
      "event_id": "401919994",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Liberia"
     }
    },
    "rwanda": {
     "name": "Rwanda",
     "espn_id": "2851",
     "group": "Group K",
     "next_fixture": {
      "event_id": "401920003",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Cape Verde"
     }
    },
    "cape-verde": {
     "name": "Cape Verde",
     "espn_id": "2597",
     "group": "Group K",
     "next_fixture": {
      "event_id": "401920003",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Rwanda"
     }
    },
    "liberia": {
     "name": "Liberia",
     "espn_id": "4205",
     "group": "Group K",
     "next_fixture": {
      "event_id": "401919994",
      "kickoff": "2026-09-29T19:00Z",
      "opponent": "Mali"
     }
    },
    "guinea-bissau": {
     "name": "Guinea-Bissau",
     "espn_id": "8602",
     "group": "Group L",
     "next_fixture": {
      "event_id": "401920000",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Nigeria"
     }
    },
    "nigeria": {
     "name": "Nigeria",
     "espn_id": "657",
     "group": "Group L",
     "next_fixture": {
      "event_id": "401920000",
      "kickoff": "2026-09-29T16:00Z",
      "opponent": "Guinea-Bissau"
     }
    },
    "madagascar": {
     "name": "Madagascar",
     "espn_id": "5533",
     "group": "Group L",
     "next_fixture": {
      "event_id": "401920002",
      "kickoff": "2026-09-29T14:00Z",
      "opponent": "Tanzania"
     }
    },
    "tanzania": {
     "name": "Tanzania",
     "espn_id": "5778",
     "group": "Group L",
     "next_fixture": {
      "event_id": "401920002",
      "kickoff": "2026-09-29T14:00Z",
      "opponent": "Madagascar"
     }
    }
   }
  }
 },
 "identity": {
  "path": "src/data/national_teams.json",
  "teams": 173
 },
 "source": "live",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "field_floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This team's confederation did not clear the floor on this axis for this competition's field — on the goal axes that is G3: the median entrant's 95% interval is wider than one equal-width band of the field. The value is measured and shown; the interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else, because a team the evidence cannot place is not thereby a worse team.",
 "capture": {
  "backend": "not_requested",
  "writable": false
 }
} as const;

export const SAMPLE_REFUSAL = {
 "refused": true,
 "club": null,
 "reason": "no_national_rating",
 "home": "Georgia",
 "away": "Northern Ireland",
 "league": "unl",
 "column": "unl",
 "columns": [
  "unl"
 ],
 "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
 "this_season": null,
 "admission": null,
 "opponent_row": null,
 "sides": {
  "home": {
   "club": "Georgia",
   "table_club": "Georgia",
   "resolved_by": "espn_id",
   "rated": false,
   "rated_in": "unl",
   "key": "georgia",
   "table_note": "this team's own record in THIS competition's current group, per game. It is not a rating and not a table the other team is ranked in unless both are in the same group; `rank`/`of` are the derived group position (see standings.ordering_note). Group: Group B2.",
   "ppg": null,
   "gf": null,
   "ga": null,
   "gdg": null,
   "gp_current": 0,
   "rank": null,
   "of": 4,
   "weight": null,
   "basis": null,
   "totals": {
    "w": 0,
    "d": 0,
    "l": 0,
    "gf": 0,
    "ga": 0,
    "gd": 0,
    "pts": 0
   }
  },
  "away": {
   "club": "Northern Ireland",
   "table_club": "Northern Ireland",
   "resolved_by": "espn_id",
   "rated": false,
   "rated_in": "unl",
   "key": "northern-ireland",
   "table_note": "this team's own record in THIS competition's current group, per game. It is not a rating and not a table the other team is ranked in unless both are in the same group; `rank`/`of` are the derived group position (see standings.ordering_note). Group: Group B2.",
   "ppg": null,
   "gf": null,
   "ga": null,
   "gdg": null,
   "gp_current": 0,
   "rank": null,
   "of": 4,
   "weight": null,
   "basis": null,
   "totals": {
    "w": 0,
    "d": 0,
    "l": 0,
    "gf": 0,
    "ga": 0,
    "gd": 0,
    "pts": 0
   }
  }
 },
 "refusal": {
  "reason": "no_national_rating",
  "case": "no_national_rating",
  "why": "a national-team fixture that the national-team field cannot place: either no field is served on this build, or one of the two teams has no overall row in it. There is no ordering to place the two teams in and nothing to take a favourite from. Each team's OWN record in this competition is reported under `sides`; nothing compares them.",
  "carries": [
   "sides"
  ],
  "absent": {
   "this_season": "a national team has no season table; its own record in this competition is under `sides`",
   "admission": "there is no blend and no admission gate here",
   "opponent_row": "this refusal is of the pairing, not of one team; both teams are under `sides`"
  },
  "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
  "detail": {
   "no_national_rating": "the field has no overall row for Georgia or Northern Ireland"
  }
 },
 "event_id": "401861049",
 "competition_id": "401861049",
 "kickoff": "2026-09-25T16:00Z",
 "espn": "uefa.nations",
 "state": "pre",
 "in_play": false,
 "venue": {
  "city": "Tbilisi",
  "country": "Georgia",
  "name": "Boris Paichadze Dinamo Arena"
 },
 "venue_class": {
  "class": "TRUE_HOME",
  "home_side": "home"
 },
 "kalshi": {
  "ask_c": 53,
  "ask_size": 12601,
  "bid_c": 52,
  "bid_size": 1000,
  "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
  "flags": [],
  "spread_c": 1,
  "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO",
  "side": "Georgia"
 },
 "form": {
  "home": "LDWDW",
  "away": "WLDWL",
  "scope": "all senior internationals, friendlies marked",
  "scope_is_cup": false
 },
 "national": {
  "competition": "unl",
  "group": "Group B2",
  "head_to_head": {
   "available": true,
   "meetings": [
    {
     "away": "Georgia",
     "away_score": 1,
     "completed": true,
     "date": "2008-03-26T19:45:00Z",
     "event_id": "236855",
     "home": "Northern Ireland",
     "home_score": 4,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    }
   ],
   "reason": null,
   "source": "seasonseries",
   "tally": {
    "away": 1,
    "draw": 0,
    "home": 0
   }
  },
  "leg": null,
  "lineups": {
   "announced": false,
   "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
   "sides": {
    "away": {
     "announced": false,
     "bench": 0,
     "formation": null,
     "starters": [],
     "team": "Northern Ireland"
    },
    "home": {
     "announced": false,
     "bench": 0,
     "formation": null,
     "starters": [],
     "team": "Georgia"
    }
   }
  },
  "market": {
   "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
   "legs": {
    "away": {
     "ask_c": 22,
     "ask_size": 13685,
     "bid_c": 20,
     "bid_size": 6388,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [],
     "name": "Northern Ireland",
     "spread_c": 2,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-NIR"
    },
    "home": {
     "ask_c": 53,
     "ask_size": 12601,
     "bid_c": 52,
     "bid_size": 1000,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [],
     "name": "Georgia",
     "spread_c": 1,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO"
    },
    "tie": {
     "ask_c": 27,
     "ask_size": 88,
     "bid_c": 26,
     "bid_size": 7720,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [
      "THIN"
     ],
     "spread_c": 1,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-TIE"
    }
   },
   "orientation": "same",
   "status": "mapped",
   "status_words": "one open Kalshi event names both teams on this date",
   "title": "Georgia vs Northern Ireland"
  },
  "neutral": false,
  "neutral_provider_flag": false,
  "stage": "group-stage",
  "stage_kind": "group",
  "status_detail": "Fri, September 25th at 12:00 PM EDT",
  "teams": {
   "home": {
    "espn_id": "584",
    "form": {
     "available": true,
     "friendlies": 4,
     "games": [
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2025-11-18T19:45Z",
       "event_id": "724916",
       "ga": 2,
       "gf": 1,
       "kind": "competitive",
       "letter": "L",
       "opponent": "Bulgaria",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-26T17:00Z",
       "event_id": "763032",
       "ga": 2,
       "gf": 2,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Israel",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-29T13:00Z",
       "event_id": "763033",
       "ga": 0,
       "gf": 2,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Lithuania",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-02T17:00Z",
       "event_id": "401865145",
       "ga": 1,
       "gf": 1,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Romania",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-05T16:00Z",
       "event_id": "401870001",
       "ga": 0,
       "gf": 2,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Bahrain",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      }
     ],
     "letters": "LDWDW",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "georgia",
    "name": "Georgia",
    "rating": {
     "available": false,
     "reason": "the field has no overall row for Georgia or Northern Ireland"
    }
   },
   "away": {
    "espn_id": "586",
    "form": {
     "available": true,
     "friendlies": 3,
     "games": [
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2025-11-17T19:45Z",
       "event_id": "724910",
       "ga": 0,
       "gf": 1,
       "kind": "competitive",
       "letter": "W",
       "opponent": "Luxembourg",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2026-03-26T19:45Z",
       "event_id": "761380",
       "ga": 2,
       "gf": 0,
       "kind": "competitive",
       "letter": "L",
       "opponent": "Italy",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-31T18:45Z",
       "event_id": "401866761",
       "ga": 1,
       "gf": 1,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Wales",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-04T16:00Z",
       "event_id": "401871360",
       "ga": 0,
       "gf": 1,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Guinea",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-08T19:10Z",
       "event_id": "401869804",
       "ga": 3,
       "gf": 1,
       "kind": "friendly",
       "letter": "L",
       "opponent": "France",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      }
     ],
     "letters": "WLDWL",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "northern-ireland",
    "name": "Northern Ireland",
    "rating": {
     "available": false,
     "reason": "the field has no overall row for Georgia or Northern Ireland"
    }
   }
  },
  "venue_country": "Georgia"
 }
} as const;

export const XI_LINEUPS = {
 "announced": true,
 "reason": null,
 "sides": {
  "away": {
   "announced": true,
   "bench": 10,
   "formation": "5-4-1",
   "starters": [
    {
     "jersey": "23",
     "name": "Jason Vega",
     "position": "G"
    },
    {
     "jersey": "2",
     "name": "Joab Gutiérrez",
     "position": "D"
    },
    {
     "jersey": "6",
     "name": "Emmanuel Gómez",
     "position": "D"
    },
    {
     "jersey": "19",
     "name": "Juan Rodriguez",
     "position": "D"
    },
    {
     "jersey": "5",
     "name": "Justing Cano",
     "position": "D"
    },
    {
     "jersey": "4",
     "name": "Marvin David Fletes",
     "position": "D"
    },
    {
     "jersey": "14",
     "name": "Kadeem Cole",
     "position": "M"
    },
    {
     "jersey": "16",
     "name": "Raheem Giusseppe Cole Martinez",
     "position": "M"
    },
    {
     "jersey": "20",
     "name": "Jonathan Moncada",
     "position": "M"
    },
    {
     "jersey": "11",
     "name": "Efraín Antonio Mejía Alfaro",
     "position": "M"
    },
    {
     "jersey": "9",
     "name": "Jaime Moreno",
     "position": "F"
    }
   ],
   "team": "Nicaragua"
  },
  "home": {
   "announced": true,
   "bench": 11,
   "formation": "4-3-3",
   "starters": [
    {
     "jersey": "1",
     "name": "Xavier Valdez",
     "position": "G"
    },
    {
     "jersey": "5",
     "name": "Noah Dollenmayer",
     "position": "D"
    },
    {
     "jersey": "3",
     "name": "Junior Firpo",
     "position": "D"
    },
    {
     "jersey": "21",
     "name": "Juan Castillo",
     "position": "D"
    },
    {
     "jersey": "23",
     "name": "Luiyi de Lucas",
     "position": "D"
    },
    {
     "jersey": "14",
     "name": "Jean Carlos López",
     "position": "M"
    },
    {
     "jersey": "6",
     "name": "Pablo Rosario",
     "position": "M"
    },
    {
     "jersey": "8",
     "name": "Heinz Mörschel",
     "position": "M"
    },
    {
     "jersey": "19",
     "name": "Peter Federico",
     "position": "F"
    },
    {
     "jersey": "9",
     "name": "Mariano Díaz",
     "position": "F"
    },
    {
     "jersey": "11",
     "name": "Edarlyn Reyes",
     "position": "F"
    }
   ],
   "team": "Dominican Republic"
  }
 }
} as const;

export const INTERIM_CLOCK = "2026-09-24T23:32:30.506453+00:00";

export const INTERIM_DR_NIC = {
 "away": "Nicaragua",
 "column": "cnl",
 "columns": [
  "cnl"
 ],
 "competition_id": "401900637",
 "cross_league": false,
 "current_only": null,
 "espn": "concacaf.nations.league",
 "event_id": "401900637",
 "fav_side": "away",
 "fav_source": "field",
 "favourite": "Nicaragua",
 "field": {
  "axes": {
   "atk": {
    "fav": {
     "below_floor": true,
     "half_width_95": 0.31177945672676244,
     "interval": [
      -0.29202354267958996,
      0.3315353707739349
     ],
     "rank": 7,
     "straddles": true,
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "value": 0.019755914047172474
    },
    "field_size": 37,
    "floor": {
     "below_floor": true,
     "failing_condition": "G3"
    },
    "label": "attack",
    "opp": {
     "below_floor": true,
     "half_width_95": 0.3237226825292346,
     "interval": [
      -0.47098372680160727,
      0.1764616382568619
     ],
     "rank": 11,
     "straddles": true,
     "tier": 2,
     "tier_set": [
      1,
      2
     ],
     "value": -0.1472610442723727
    },
    "tier_gap": 1,
    "unit": "log_goals"
   },
   "def": {
    "fav": {
     "below_floor": true,
     "half_width_95": 0.42929433394837696,
     "interval": [
      -0.572330581596761,
      0.2862580862999929
     ],
     "rank": 6,
     "straddles": true,
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "value": -0.14303624764838407
    },
    "field_size": 37,
    "floor": {
     "below_floor": true,
     "failing_condition": "G3"
    },
    "label": "defence",
    "opp": {
     "below_floor": true,
     "half_width_95": 0.6082841330787719,
     "interval": [
      -1.031420825845823,
      0.18514744031172092
     ],
     "rank": 13,
     "straddles": true,
     "tier": 2,
     "tier_set": [
      1,
      2,
      3
     ],
     "value": -0.423136692767051
    },
    "tier_gap": 1,
    "unit": "log_goals"
   },
   "ovr": {
    "fav": {
     "below_floor": false,
     "half_width_95": 28.04371263951985,
     "interval": [
      1446.3658843209873,
      1502.4533096000268
     ],
     "rank": 11,
     "straddles": false,
     "tier": 2,
     "tier_set": [
      2
     ],
     "value": 1474.409596960507
    },
    "field_size": 37,
    "floor": {
     "below_floor": false,
     "failing_condition": null
    },
    "label": "overall",
    "opp": {
     "below_floor": false,
     "half_width_95": 21.094833608511905,
     "interval": [
      1417.5723271779498,
      1459.7619943949735
     ],
     "rank": 13,
     "straddles": false,
     "tier": 2,
     "tier_set": [
      2
     ],
     "value": 1438.6671607864616
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
  "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
  "clubs": {
   "fav": "Nicaragua",
   "opp": "Dominican Republic"
  },
  "competition": "cnl",
  "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
  "shape": "SPLIT",
  "size": 37
 },
 "form": {
  "fav": "WLLDL",
  "opp": "WDDDL",
  "scope": "all senior internationals, friendlies marked",
  "scope_is_cup": false
 },
 "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
 "gdg_gap": null,
 "gp_current": {
  "away": 0,
  "home": 0,
  "min": 0
 },
 "home": "Dominican Republic",
 "in_play": false,
 "kalshi": {
  "ask_c": 19,
  "ask_size": 24584,
  "bid_c": 17,
  "bid_size": 3480,
  "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
  "flags": [],
  "spread_c": 2,
  "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-NIC"
 },
 "kickoff": "2026-09-25T00:00Z",
 "league": "cnl",
 "national": {
  "competition": "cnl",
  "group": "League A - Group A",
  "head_to_head": {
   "available": true,
   "meetings": [
    {
     "away": "Dominican Republic",
     "away_score": 3,
     "completed": true,
     "date": "2017-11-09T00:30:00Z",
     "event_id": "498510",
     "home": "Nicaragua",
     "home_score": 0,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    {
     "away": "Nicaragua",
     "away_score": 0,
     "completed": true,
     "date": "2017-11-11T20:00:00Z",
     "event_id": "498534",
     "home": "Dominican Republic",
     "home_score": 1,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    {
     "away": "Nicaragua",
     "away_score": 2,
     "completed": true,
     "date": "2023-09-08T23:00:00Z",
     "event_id": "680806",
     "home": "Dominican Republic",
     "home_score": 0,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    {
     "away": "Dominican Republic",
     "away_score": 0,
     "completed": true,
     "date": "2023-11-22T02:00:00Z",
     "event_id": "680856",
     "home": "Nicaragua",
     "home_score": 0,
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    }
   ],
   "reason": null,
   "source": "seasonseries",
   "tally": {
    "away": 1,
    "draw": 1,
    "home": 2
   }
  },
  "leg": null,
  "lineups": {
   "announced": true,
   "reason": null,
   "sides": {
    "away": {
     "announced": true,
     "bench": 10,
     "formation": "5-4-1",
     "starters": [
      {
       "jersey": "23",
       "name": "Jason Vega",
       "position": "G"
      },
      {
       "jersey": "2",
       "name": "Joab Gutiérrez",
       "position": "D"
      },
      {
       "jersey": "6",
       "name": "Emmanuel Gómez",
       "position": "D"
      },
      {
       "jersey": "19",
       "name": "Juan Rodriguez",
       "position": "D"
      },
      {
       "jersey": "5",
       "name": "Justing Cano",
       "position": "D"
      },
      {
       "jersey": "4",
       "name": "Marvin David Fletes",
       "position": "D"
      },
      {
       "jersey": "14",
       "name": "Kadeem Cole",
       "position": "M"
      },
      {
       "jersey": "16",
       "name": "Raheem Giusseppe Cole Martinez",
       "position": "M"
      },
      {
       "jersey": "20",
       "name": "Jonathan Moncada",
       "position": "M"
      },
      {
       "jersey": "11",
       "name": "Efraín Antonio Mejía Alfaro",
       "position": "M"
      },
      {
       "jersey": "9",
       "name": "Jaime Moreno",
       "position": "F"
      }
     ],
     "team": "Nicaragua"
    },
    "home": {
     "announced": true,
     "bench": 11,
     "formation": "4-3-3",
     "starters": [
      {
       "jersey": "1",
       "name": "Xavier Valdez",
       "position": "G"
      },
      {
       "jersey": "5",
       "name": "Noah Dollenmayer",
       "position": "D"
      },
      {
       "jersey": "3",
       "name": "Junior Firpo",
       "position": "D"
      },
      {
       "jersey": "21",
       "name": "Juan Castillo",
       "position": "D"
      },
      {
       "jersey": "23",
       "name": "Luiyi de Lucas",
       "position": "D"
      },
      {
       "jersey": "14",
       "name": "Jean Carlos López",
       "position": "M"
      },
      {
       "jersey": "6",
       "name": "Pablo Rosario",
       "position": "M"
      },
      {
       "jersey": "8",
       "name": "Heinz Mörschel",
       "position": "M"
      },
      {
       "jersey": "19",
       "name": "Peter Federico",
       "position": "F"
      },
      {
       "jersey": "9",
       "name": "Mariano Díaz",
       "position": "F"
      },
      {
       "jersey": "11",
       "name": "Edarlyn Reyes",
       "position": "F"
      }
     ],
     "team": "Dominican Republic"
    }
   }
  },
  "market": {
   "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
   "legs": {
    "away": {
     "ask_c": 19,
     "ask_size": 24584,
     "bid_c": 17,
     "bid_size": 3480,
     "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
     "flags": [],
     "name": "Nicaragua",
     "spread_c": 2,
     "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-NIC"
    },
    "home": {
     "ask_c": 62,
     "ask_size": 43212,
     "bid_c": 61,
     "bid_size": 3656,
     "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
     "flags": [],
     "name": "Dominican Republic",
     "spread_c": 1,
     "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-DOM"
    },
    "tie": {
     "ask_c": 22,
     "ask_size": 7052,
     "bid_c": 21,
     "bid_size": 348,
     "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
     "flags": [],
     "spread_c": 1,
     "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-TIE"
    }
   },
   "orientation": "same",
   "status": "mapped",
   "status_words": "one open Kalshi event names both teams on this date",
   "title": "Dominican Republic vs Nicaragua"
  },
  "neutral": false,
  "neutral_provider_flag": false,
  "stage": "group-stage",
  "stage_kind": "group",
  "status_detail": "Thu, September 24th at 8:00 PM EDT",
  "teams": {
   "away": {
    "espn_id": "2658",
    "form": {
     "available": true,
     "friendlies": 3,
     "games": [
      {
       "competition": "FIFA World Cup Qualifying - Concacaf",
       "date": "2025-11-14T02:00Z",
       "event_id": "754261",
       "ga": 0,
       "gf": 2,
       "kind": "competitive",
       "letter": "W",
       "opponent": "Honduras",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "FIFA World Cup Qualifying - Concacaf",
       "date": "2025-11-19T01:00Z",
       "event_id": "754268",
       "ga": 2,
       "gf": 0,
       "kind": "competitive",
       "letter": "L",
       "opponent": "Haiti",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-27T16:30Z",
       "event_id": "401862882",
       "ga": 3,
       "gf": 1,
       "kind": "friendly",
       "letter": "L",
       "opponent": "Russia",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-05-29T16:00Z",
       "event_id": "401871131",
       "ga": 0,
       "gf": 0,
       "kind": "friendly",
       "letter": "D",
       "opponent": "South Africa",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-05T22:45Z",
       "event_id": "401871132",
       "ga": 4,
       "gf": 0,
       "kind": "friendly",
       "letter": "L",
       "opponent": "Paraguay",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      }
     ],
     "letters": "WLLDL",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "nicaragua",
    "name": "Nicaragua",
    "rating": {
     "available": true,
     "axes": {
      "atk": {
       "below_floor": true,
       "floor": {
        "below_floor": true,
        "failing_condition": "G3"
       },
       "half_width_95": 0.31177945672676244,
       "interval": [
        -0.29202354267958996,
        0.3315353707739349
       ],
       "rank": 7,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "unit": "log_goals",
       "value": 0.019755914047172474
      },
      "def": {
       "below_floor": true,
       "floor": {
        "below_floor": true,
        "failing_condition": "G3"
       },
       "half_width_95": 0.42929433394837696,
       "interval": [
        -0.572330581596761,
        0.2862580862999929
       ],
       "rank": 6,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "unit": "log_goals",
       "value": -0.14303624764838407
      },
      "ovr": {
       "below_floor": false,
       "floor": {
        "below_floor": false,
        "failing_condition": null
       },
       "half_width_95": 28.04371263951985,
       "interval": [
        1446.3658843209873,
        1502.4533096000268
       ],
       "rank": 11,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "unit": "elo",
       "value": 1474.409596960507
      }
     },
     "axes_absent": [],
     "competition": "cnl",
     "source": "src.picker.national_team_axes"
    }
   },
   "home": {
    "espn_id": "2649",
    "form": {
     "available": true,
     "friendlies": 5,
     "games": [
      {
       "competition": "International Friendly",
       "date": "2025-11-13T00:00Z",
       "event_id": "760870",
       "ga": 0,
       "gf": 2,
       "kind": "friendly",
       "letter": "W",
       "opponent": "St. Vincent and the Grenadines",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2025-11-18T23:30Z",
       "event_id": "760901",
       "ga": 0,
       "gf": 0,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Martinique",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-27T00:00Z",
       "event_id": "401866383",
       "ga": 2,
       "gf": 2,
       "kind": "friendly",
       "letter": "D",
       "opponent": "El Salvador",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-29T22:00Z",
       "event_id": "401866390",
       "ga": 1,
       "gf": 1,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Cuba",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-04T00:45Z",
       "event_id": "401870075",
       "ga": 4,
       "gf": 2,
       "kind": "friendly",
       "letter": "L",
       "opponent": "Panama",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      }
     ],
     "letters": "WDDDL",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "dominican-republic",
    "name": "Dominican Republic",
    "rating": {
     "available": true,
     "axes": {
      "atk": {
       "below_floor": true,
       "floor": {
        "below_floor": true,
        "failing_condition": "G3"
       },
       "half_width_95": 0.3237226825292346,
       "interval": [
        -0.47098372680160727,
        0.1764616382568619
       ],
       "rank": 11,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "unit": "log_goals",
       "value": -0.1472610442723727
      },
      "def": {
       "below_floor": true,
       "floor": {
        "below_floor": true,
        "failing_condition": "G3"
       },
       "half_width_95": 0.6082841330787719,
       "interval": [
        -1.031420825845823,
        0.18514744031172092
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "unit": "log_goals",
       "value": -0.423136692767051
      },
      "ovr": {
       "below_floor": false,
       "floor": {
        "below_floor": false,
        "failing_condition": null
       },
       "half_width_95": 21.094833608511905,
       "interval": [
        1417.5723271779498,
        1459.7619943949735
       ],
       "rank": 13,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "unit": "elo",
       "value": 1438.6671607864616
      }
     },
     "axes_absent": [],
     "competition": "cnl",
     "source": "src.picker.national_team_axes"
    }
   }
  },
  "venue_country": "Dominican Republic"
 },
 "opponent": "Dominican Republic",
 "own_gdg": {
  "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
  "diff": null
 },
 "ppg_gap": null,
 "rank_gap": null,
 "ranks": {
  "fav": 11,
  "opp": 13
 },
 "rated_in": {
  "away": "cnl",
  "home": "cnl"
 },
 "rates": {
  "ga": [
   null,
   null
  ],
  "gdg": [
   null,
   null
  ],
  "gf": [
   null,
   null
  ],
  "ppg": [
   null,
   null
  ]
 },
 "refused": false,
 "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
 "resolution": {
  "Dominican Republic": "espn_id",
  "Nicaragua": "espn_id"
 },
 "shape": "SPLIT",
 "src": "current",
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
   2,
   2
  ]
 },
 "venue": {
  "city": "Santiago",
  "country": "Dominican Republic",
  "name": "Estadio Cibao"
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
 "weights": null
} as const;

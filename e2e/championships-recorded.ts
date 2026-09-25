/* THE CHAMPIONSHIPS BOARD, RECORDED OFF THE ROUTE — not off a brief.
 *
 * `api.main.championships_board(date=20260925, days=14)` — the
 * route's own handler, called IN PROCESS on the backend branch
 * `board-data-gaps` (read-only; the route writes nothing), assembled
 * 2026-09-25T13:07:52.776824+00:00: 210 ranked rows, 0 refusals,
 * 0 off the board. Columns ["unl","cnl","gulfcup","afcon"] — the
 * 27th Arabian Gulf Cup took the AFC Asian Cup's column on 2026-09-25.
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
 * 22 rows — the first few of each column by kickoff, the
 * `field_partial` rows, one whose group has started, a corpus meeting,
 * two corpus absences, a form strip with a disputed result ("?"), two
 * rows whose licensed pair differs from the
 * five-band one, and the fixture SAMPLE_REFUSAL stands in for — and three
 * of the off-board entries. `competitions` is cut to what a surface
 * reads: stages, derived group tables, and the Gulf Cup's next fixtures.
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
export const CHAMP_CLOCK = "2026-09-25T13:07:52.776824+00:00";

export const CHAMP_BOARD = {
 "generated_at": "2026-09-25T13:07:52.776824+00:00",
 "date": "2026-09-25",
 "days": 8,
 "mode": "championships",
 "columns": [
  "unl",
  "cnl",
  "gulfcup",
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
  "gulfcup": {
   "kind": "championship",
   "display": "Arabian Gulf Cup",
   "edition": "27th, 2026",
   "confederation": "AGCFF (AFC members)",
   "espn": [
    "global.gulf_cup"
   ],
   "src": null,
   "min_current_gp": null,
   "clubs": 8,
   "reg_time_note": "no Kalshi series lists this competition, so there is no settlement rule to state."
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
   "home": "Georgia",
   "away": "Northern Ireland",
   "favourite": "Georgia",
   "opponent": "Northern Ireland",
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
    "Georgia": "espn_id",
    "Northern Ireland": "espn_id"
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
    "fav": 29,
    "opp": 32
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
     3
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
    "ovr": 1,
    "atk": 0,
    "def": 0
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Georgia",
     "opp": "Northern Ireland"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 29,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1620.9560849234479,
       "half_width_95": 17.213855140139696,
       "interval": [
        1603.7422297833082,
        1638.1699400635875
       ]
      },
      "opp": {
       "rank": 32,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1568.633321396187,
       "half_width_95": 21.793494512362205,
       "interval": [
        1546.8398268838248,
        1590.4268159085493
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
       "fav": 21.472898410453986,
       "opp": 25.287058840024976
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 28,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.3812979264773375,
       "half_width_95": 0.20494752675206668,
       "interval": [
        0.17635039972527083,
        0.5862454532294041
       ]
      },
      "opp": {
       "rank": 37,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.21612762655004353,
       "half_width_95": 0.24796051701432142,
       "interval": [
        -0.031832890464277896,
        0.46408814356436495
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
       "fav": 0.2250681937741675,
       "opp": 0.27026509031549895
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
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4775402936078292,
       "half_width_95": 0.25393337806893757,
       "interval": [
        0.22360691553889162,
        0.7314736716767667
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
       "value": 0.5508043672959417,
       "half_width_95": 0.38551966979648067,
       "interval": [
        0.16528469749946106,
        0.9363240370924224
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
       "fav": 0.2808412053179919,
       "opp": 0.402415660370527
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
   "event_id": "401861049",
   "competition_id": "401861049",
   "kickoff": "2026-09-25T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Boris Paichadze Dinamo Arena",
    "city": "Tbilisi",
    "country": "Georgia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
    "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO",
    "ask_c": 54,
    "bid_c": 53,
    "spread_c": 1,
    "ask_size": 6023,
    "bid_size": 27976,
    "flags": []
   },
   "form": {
    "fav": "LDWDW",
    "opp": "WLDWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "236855",
      "date": "2008-03-26T19:45:00Z",
      "home": "Northern Ireland",
      "away": "Georgia",
      "home_score": 4,
      "away_score": 1,
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
     "event_id": "236855",
     "date": "2008-03-26T19:45:00Z",
     "home": "Northern Ireland",
     "away": "Georgia",
     "home_score": 4,
     "away_score": 1,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group B2",
    "leg": null,
    "status_detail": "Fri, September 25th at 12:00 PM EDT",
    "venue_country": "Georgia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "georgia",
      "espn_id": "584",
      "name": "Georgia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 29,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1620.9560849234479,
         "half_width_95": 17.213855140139696,
         "interval": [
          1603.7422297833082,
          1638.1699400635875
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 21.472898410453986,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 28,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.3812979264773375,
         "half_width_95": 0.20494752675206668,
         "interval": [
          0.17635039972527083,
          0.5862454532294041
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2250681937741675,
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
         "rank": 18,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4775402936078292,
         "half_width_95": 0.25393337806893757,
         "interval": [
          0.22360691553889162,
          0.7314736716767667
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2808412053179919,
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
       "letters": "LDWDW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724916",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Bulgaria",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "763032",
         "date": "2026-03-26T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Israel",
         "venue": "home",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "763033",
         "date": "2026-03-29T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Lithuania",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401865145",
         "date": "2026-06-02T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Romania",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401870001",
         "date": "2026-06-05T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Bahrain",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "northern-ireland",
      "espn_id": "586",
      "name": "Northern Ireland",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 32,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1568.633321396187,
         "half_width_95": 21.793494512362205,
         "interval": [
          1546.8398268838248,
          1590.4268159085493
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 25.287058840024976,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 37,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.21612762655004353,
         "half_width_95": 0.24796051701432142,
         "interval": [
          -0.031832890464277896,
          0.46408814356436495
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.27026509031549895,
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
         "rank": 15,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5508043672959417,
         "half_width_95": 0.38551966979648067,
         "interval": [
          0.16528469749946106,
          0.9363240370924224
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.402415660370527,
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
       "letters": "WLDWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724910",
         "date": "2025-11-17T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Luxembourg",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761380",
         "date": "2026-03-26T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Italy",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866761",
         "date": "2026-03-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Wales",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401871360",
         "date": "2026-06-04T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Guinea",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401869804",
         "date": "2026-06-08T19:10Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "France",
         "venue": "away",
         "gf": 1,
         "ga": 3,
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
       "event_id": "236855",
       "date": "2008-03-26T19:45:00Z",
       "home": "Northern Ireland",
       "away": "Georgia",
       "home_score": 4,
       "away_score": 1,
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
      "event_id": "236855",
      "date": "2008-03-26T19:45:00Z",
      "home": "Northern Ireland",
      "away": "Georgia",
      "home_score": 4,
      "away_score": 1,
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
       "team": "Georgia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Northern Ireland",
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
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Georgia vs Northern Ireland",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO",
       "ask_c": 54,
       "bid_c": 53,
       "spread_c": 1,
       "ask_size": 6023,
       "bid_size": 27976,
       "flags": [],
       "name": "Georgia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-TIE",
       "ask_c": 28,
       "bid_c": 27,
       "spread_c": 1,
       "ask_size": 57647,
       "bid_size": 1728,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-NIR",
       "ask_c": 19,
       "bid_c": 18,
       "spread_c": 1,
       "ask_size": 69562,
       "bid_size": 24872,
       "flags": [],
       "name": "Northern Ireland"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 117.3,
     "favourite_side": "home",
     "home_minus_away": 117.3,
     "components": {
      "elo": {
       "home": 1621,
       "away": 1568.6
      },
      "raw_gap_home_minus_away": 52.3,
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
   "home": "Armenia",
   "away": "Latvia",
   "favourite": "Armenia",
   "opponent": "Latvia",
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
    "Armenia": "espn_id",
    "Latvia": "espn_id"
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
    "fav": 44,
    "opp": 49
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
     4
    ],
    "def": [
     4,
     4
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
    "competition": "unl",
    "clubs": {
     "fav": "Armenia",
     "opp": "Latvia"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 44,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1393.5987900057519,
       "half_width_95": 3.692662914573906,
       "interval": [
        1389.906127091178,
        1397.2914529203258
       ]
      },
      "opp": {
       "rank": 49,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1317.7925114236987,
       "half_width_95": 6.889721411136102,
       "interval": [
        1310.9027900125625,
        1324.6822328348348
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
       "fav": 12.326039793107968,
       "opp": 12.457080238859282
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 38,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.16952845409806883,
       "half_width_95": 0.2862796897343854,
       "interval": [
        -0.11675123563631656,
        0.4558081438324542
       ]
      },
      "opp": {
       "rank": 50,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.42615829967417884,
       "half_width_95": 0.3970236561737286,
       "interval": [
        -0.8231819558479074,
        -0.029134643500450252
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
       "fav": 0.285203663802262,
       "opp": 0.40987478738303956
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
         3
        ],
        "straddles": true
       },
       "opp": {
        "tier": 4,
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
       "rank": 49,
       "tier": 4,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.191602744735065,
       "half_width_95": 0.22636133393854754,
       "interval": [
        -0.4179640786736125,
        0.03475858920348254
       ]
      },
      "opp": {
       "rank": 43,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.0451663500758534,
       "half_width_95": 0.23811442862051216,
       "interval": [
        -0.2832807786963656,
        0.19294807854465876
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
       "fav": 0.24472260525522788,
       "opp": 0.25930170399386887
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
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861050",
   "competition_id": "401861050",
   "kickoff": "2026-09-25T16:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Vazgen Sargsyan Republican Stadium",
    "city": "Yerevan",
    "country": "Armenia"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
    "ticker": "KXUEFANLGAME-26SEP25ARMLAT-ARM",
    "ask_c": 53,
    "bid_c": 52,
    "spread_c": 1,
    "ask_size": 7596,
    "bid_size": 27571,
    "flags": []
   },
   "form": {
    "fav": "LLLDD",
    "opp": "LDLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "404031",
      "date": "2014-09-03T17:45:00Z",
      "home": "Latvia",
      "away": "Armenia",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "655316",
      "date": "2023-06-19T16:00:00Z",
      "home": "Armenia",
      "away": "Latvia",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "655388",
      "date": "2023-10-12T16:00:00Z",
      "home": "Latvia",
      "away": "Armenia",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698900",
      "date": "2024-09-07T16:00:00Z",
      "home": "Armenia",
      "away": "Latvia",
      "home_score": 4,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "699012",
      "date": "2024-11-17T14:00:00Z",
      "home": "Latvia",
      "away": "Armenia",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 3,
     "draw": 0,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "699012",
     "date": "2024-11-17T14:00:00Z",
     "home": "Latvia",
     "away": "Armenia",
     "home_score": 1,
     "away_score": 2,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group C2",
    "leg": null,
    "status_detail": "Fri, September 25th at 12:00 PM EDT",
    "venue_country": "Armenia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "armenia",
      "espn_id": "579",
      "name": "Armenia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 44,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1393.5987900057519,
         "half_width_95": 3.692662914573906,
         "interval": [
          1389.906127091178,
          1397.2914529203258
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 12.326039793107968,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 38,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.16952845409806883,
         "half_width_95": 0.2862796897343854,
         "interval": [
          -0.11675123563631656,
          0.4558081438324542
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.285203663802262,
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
         "rank": 49,
         "tier": 4,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.191602744735065,
         "half_width_95": 0.22636133393854754,
         "interval": [
          -0.4179640786736125,
          0.03475858920348254
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.24472260525522788,
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
         "event_id": "724876",
         "date": "2025-11-13T17:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Hungary",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "724900",
         "date": "2025-11-16T14:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Portugal",
         "venue": "away",
         "gf": 1,
         "ga": 9,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401858183",
         "date": "2026-03-29T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Belarus",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866137",
         "date": "2026-06-06T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kazakhstan",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866138",
         "date": "2026-06-09T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Moldova",
         "venue": "home",
         "gf": 1,
         "ga": 1,
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
      "key": "latvia",
      "espn_id": "456",
      "name": "Latvia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 49,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1317.7925114236987,
         "half_width_95": 6.889721411136102,
         "interval": [
          1310.9027900125625,
          1324.6822328348348
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 12.457080238859282,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 50,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.42615829967417884,
         "half_width_95": 0.3970236561737286,
         "interval": [
          -0.8231819558479074,
          -0.029134643500450252
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.40987478738303956,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 4,
          "tier_set": [
           3,
           4
          ],
          "straddles": true
         }
        },
        "def": {
         "rank": 43,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.0451663500758534,
         "half_width_95": 0.23811442862051216,
         "interval": [
          -0.2832807786963656,
          0.19294807854465876
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.25930170399386887,
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
       "letters": "LDLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724871",
         "date": "2025-10-14T18:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "England",
         "venue": "home",
         "gf": 0,
         "ga": 5,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "757628",
         "date": "2025-11-13T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "North Macedonia",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "724903",
         "date": "2025-11-16T17:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Serbia",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "723731",
         "date": "2026-03-26T17:00Z",
         "competition": "UEFA Nations League",
         "kind": "competitive",
         "opponent": "Gibraltar",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "723732",
         "date": "2026-03-31T16:00Z",
         "competition": "UEFA Nations League",
         "kind": "competitive",
         "opponent": "Gibraltar",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "404031",
       "date": "2014-09-03T17:45:00Z",
       "home": "Latvia",
       "away": "Armenia",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "655316",
       "date": "2023-06-19T16:00:00Z",
       "home": "Armenia",
       "away": "Latvia",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "655388",
       "date": "2023-10-12T16:00:00Z",
       "home": "Latvia",
       "away": "Armenia",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698900",
       "date": "2024-09-07T16:00:00Z",
       "home": "Armenia",
       "away": "Latvia",
       "home_score": 4,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "699012",
       "date": "2024-11-17T14:00:00Z",
       "home": "Latvia",
       "away": "Armenia",
       "home_score": 1,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 3,
      "draw": 0,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "699012",
      "date": "2024-11-17T14:00:00Z",
      "home": "Latvia",
      "away": "Armenia",
      "home_score": 1,
      "away_score": 2,
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
       "team": "Armenia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Latvia",
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
     "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Armenia vs Latvia",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-ARM",
       "ask_c": 53,
       "bid_c": 52,
       "spread_c": 1,
       "ask_size": 7596,
       "bid_size": 27571,
       "flags": [],
       "name": "Armenia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-TIE",
       "ask_c": 28,
       "bid_c": 27,
       "spread_c": 1,
       "ask_size": 56963,
       "bid_size": 3045,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-LAT",
       "ask_c": 21,
       "bid_c": 20,
       "spread_c": 1,
       "ask_size": 64038,
       "bid_size": 992,
       "flags": [],
       "name": "Latvia"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 140.8,
     "favourite_side": "home",
     "home_minus_away": 140.8,
     "components": {
      "elo": {
       "home": 1393.6,
       "away": 1317.8
      },
      "raw_gap_home_minus_away": 75.8,
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
   "home": "Sweden",
   "away": "Romania",
   "favourite": "Sweden",
   "opponent": "Romania",
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
    "Sweden": "espn_id",
    "Romania": "espn_id"
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
    "fav": 16,
    "opp": 28
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
     1,
     2
    ],
    "def": [
     3,
     3
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
     "fav": "Sweden",
     "opp": "Romania"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 16,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1716.3537645246402,
       "half_width_95": 27.717056055787975,
       "interval": [
        1688.6367084688522,
        1744.070820580428
       ]
      },
      "opp": {
       "rank": 28,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1623.1283438790972,
       "half_width_95": 12.588318561717815,
       "interval": [
        1610.5400253173793,
        1635.716662440815
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
       "fav": 30.261312193271383,
       "opp": 17.714199176630483
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
       "value": 0.8009336585379594,
       "half_width_95": 0.2613495934406008,
       "interval": [
        0.5395840650973586,
        1.06228325197856
       ]
      },
      "opp": {
       "rank": 27,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.3834865790153459,
       "half_width_95": 0.29107872483590874,
       "interval": [
        0.09240785417943714,
        0.6745653038512547
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
       "fav": 0.26706823147307923,
       "opp": 0.3166750533211032
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
     },
     "def": {
      "fav": {
       "rank": 34,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.20697183517381026,
       "half_width_95": 0.2417592626000484,
       "interval": [
        -0.03478742742623814,
        0.44873109777385867
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
       "value": 0.27130939122984027,
       "half_width_95": 0.3514776357273132,
       "interval": [
        -0.08016824449747295,
        0.6227870269571535
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
       "fav": 0.2719413673007827,
       "opp": 0.358371301259694
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
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861051",
   "competition_id": "401861051",
   "kickoff": "2026-09-25T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Friends Arena",
    "city": "Stockholm",
    "country": "Sweden"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
    "ticker": "KXUEFANLGAME-26SEP25SWEROU-SWE",
    "ask_c": 67,
    "bid_c": 66,
    "spread_c": 1,
    "ask_size": 862,
    "bid_size": 61566,
    "flags": []
   },
   "form": {
    "fav": "DWLDL",
    "opp": "WLLDW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "198072",
      "date": "1994-07-10T07:00:00Z",
      "home": "Romania",
      "away": "Sweden",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "504725",
      "date": "2018-03-27T18:30:00Z",
      "home": "Romania",
      "away": "Sweden",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "529075",
      "date": "2019-03-23T17:00:00Z",
      "home": "Sweden",
      "away": "Romania",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "528884",
      "date": "2019-11-15T19:45:00Z",
      "home": "Romania",
      "away": "Sweden",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 2,
     "draw": 1,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "528884",
     "date": "2019-11-15T19:45:00Z",
     "home": "Romania",
     "away": "Sweden",
     "home_score": 0,
     "away_score": 2,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group B4",
    "leg": null,
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "venue_country": "Sweden",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "sweden",
      "espn_id": "466",
      "name": "Sweden",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 16,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1716.3537645246402,
         "half_width_95": 27.717056055787975,
         "interval": [
          1688.6367084688522,
          1744.070820580428
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 30.261312193271383,
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
         "value": 0.8009336585379594,
         "half_width_95": 0.2613495934406008,
         "interval": [
          0.5395840650973586,
          1.06228325197856
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.26706823147307923,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
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
         "rank": 34,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.20697183517381026,
         "half_width_95": 0.2417592626000484,
         "interval": [
          -0.03478742742623814,
          0.44873109777385867
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2719413673007827,
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
       "letters": "DWLDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401870034",
         "date": "2026-06-04T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Greece",
         "venue": "home",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760424",
         "date": "2026-06-15T02:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Tunisia",
         "venue": "home",
         "gf": 5,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760447",
         "date": "2026-06-20T17:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Netherlands",
         "venue": "away",
         "gf": 1,
         "ga": 5,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760471",
         "date": "2026-06-25T23:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Japan",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760492",
         "date": "2026-06-30T21:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "France",
         "venue": "away",
         "gf": 0,
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
      "key": "romania",
      "espn_id": "473",
      "name": "Romania",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 28,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1623.1283438790972,
         "half_width_95": 12.588318561717815,
         "interval": [
          1610.5400253173793,
          1635.716662440815
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 17.714199176630483,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 27,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.3834865790153459,
         "half_width_95": 0.29107872483590874,
         "interval": [
          0.09240785417943714,
          0.6745653038512547
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3166750533211032,
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
         "rank": 30,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.27130939122984027,
         "half_width_95": 0.3514776357273132,
         "interval": [
          -0.08016824449747295,
          0.6227870269571535
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.358371301259694,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLLDW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724920",
         "date": "2025-11-18T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "San Marino",
         "venue": "home",
         "gf": 7,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761383",
         "date": "2026-03-26T17:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Türkiye",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866739",
         "date": "2026-03-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Slovakia",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401865145",
         "date": "2026-06-02T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Georgia",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401869206",
         "date": "2026-06-06T17:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Wales",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
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
       "event_id": "198072",
       "date": "1994-07-10T07:00:00Z",
       "home": "Romania",
       "away": "Sweden",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "504725",
       "date": "2018-03-27T18:30:00Z",
       "home": "Romania",
       "away": "Sweden",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "529075",
       "date": "2019-03-23T17:00:00Z",
       "home": "Sweden",
       "away": "Romania",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "528884",
       "date": "2019-11-15T19:45:00Z",
       "home": "Romania",
       "away": "Sweden",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 2,
      "draw": 1,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "528884",
      "date": "2019-11-15T19:45:00Z",
      "home": "Romania",
      "away": "Sweden",
      "home_score": 0,
      "away_score": 2,
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
       "team": "Sweden",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Romania",
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
     "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Sweden vs Romania",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-SWE",
       "ask_c": 67,
       "bid_c": 66,
       "spread_c": 1,
       "ask_size": 862,
       "bid_size": 61566,
       "flags": [],
       "name": "Sweden"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-TIE",
       "ask_c": 20,
       "bid_c": 19,
       "spread_c": 1,
       "ask_size": 54369,
       "bid_size": 13541,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-ROU",
       "ask_c": 13,
       "bid_c": 12,
       "spread_c": 1,
       "ask_size": 8562,
       "bid_size": 27298,
       "flags": [],
       "name": "Romania"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 158.2,
     "favourite_side": "home",
     "home_minus_away": 158.2,
     "components": {
      "elo": {
       "home": 1716.4,
       "away": 1623.1
      },
      "raw_gap_home_minus_away": 93.2,
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
   "home": "Italy",
   "away": "Belgium",
   "favourite": "Italy",
   "opponent": "Belgium",
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
    "Italy": "espn_id",
    "Belgium": "espn_id"
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
    "fav": 8,
    "opp": 7
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
     2,
     2
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
     "fav": "Italy",
     "opp": "Belgium"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 8,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1866.2876647373946,
       "half_width_95": 13.643893664426367,
       "interval": [
        1852.6437710729683,
        1879.931558401821
       ]
      },
      "opp": {
       "rank": 7,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1875.2258536682427,
       "half_width_95": 31.417370085322492,
       "interval": [
        1843.8084835829202,
        1906.6432237535653
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
       "fav": 17.951246529869472,
       "opp": 33.91694802183775
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 11,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.74747073678693,
       "half_width_95": 0.21573216267694528,
       "interval": [
        0.5317385741099847,
        0.9632028994638753
       ]
      },
      "opp": {
       "rank": 13,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.7047144814741972,
       "half_width_95": 0.20838619360816638,
       "interval": [
        0.4963282878660309,
        0.9131006750823636
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
       "fav": 0.2345301997909615,
       "opp": 0.22110166168819972
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
       "rank": 14,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.5932937611130851,
       "half_width_95": 0.3998516585744513,
       "interval": [
        0.19344210253863375,
        0.9931454196875364
       ]
      },
      "opp": {
       "rank": 10,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.6289136415502687,
       "half_width_95": 0.3208648757171797,
       "interval": [
        0.30804876583308904,
        0.9497785172674484
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
       "fav": 0.4282269871301636,
       "opp": 0.3278719536921386
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
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861052",
   "competition_id": "401861052",
   "kickoff": "2026-09-25T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Olimpico",
    "city": "Roma",
    "country": "Italy"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
    "ticker": "KXUEFANLGAME-26SEP25ITABEL-ITA",
    "ask_c": 43,
    "bid_c": 42,
    "spread_c": 1,
    "ask_size": 9739,
    "bid_size": 14598,
    "flags": []
   },
   "form": {
    "fav": "LWDWW",
    "opp": "DWWWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "438195",
      "date": "2016-06-13T19:00:00Z",
      "home": "Belgium",
      "away": "Italy",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "560299",
      "date": "2021-07-02T19:00:00Z",
      "home": "Belgium",
      "away": "Italy",
      "home_score": 1,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "589984",
      "date": "2021-10-10T13:00:00Z",
      "home": "Italy",
      "away": "Belgium",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698939",
      "date": "2024-10-10T18:45:00Z",
      "home": "Italy",
      "away": "Belgium",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "698988",
      "date": "2024-11-14T19:45:00Z",
      "home": "Belgium",
      "away": "Italy",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 4,
     "draw": 1,
     "away": 0
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "698988",
     "date": "2024-11-14T19:45:00Z",
     "home": "Belgium",
     "away": "Italy",
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
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group A1",
    "leg": null,
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "venue_country": "Italy",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "italy",
      "espn_id": "162",
      "name": "Italy",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 8,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1866.2876647373946,
         "half_width_95": 13.643893664426367,
         "interval": [
          1852.6437710729683,
          1879.931558401821
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 17.951246529869472,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 11,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.74747073678693,
         "half_width_95": 0.21573216267694528,
         "interval": [
          0.5317385741099847,
          0.9632028994638753
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2345301997909615,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
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
         "rank": 14,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5932937611130851,
         "half_width_95": 0.3998516585744513,
         "interval": [
          0.19344210253863375,
          0.9931454196875364
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4282269871301636,
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
       "letters": "LWDWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724906",
         "date": "2025-11-16T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Norway",
         "venue": "home",
         "gf": 1,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761380",
         "date": "2026-03-26T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Northern Ireland",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761952",
         "date": "2026-03-31T18:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Bosnia-Herzegovina",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "L",
         "provider_agrees": false,
         "shootout": {
          "for": 1,
          "against": 4,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "401869325",
         "date": "2026-06-03T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Luxembourg",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401870630",
         "date": "2026-06-07T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Greece",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 2,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "belgium",
      "espn_id": "459",
      "name": "Belgium",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 7,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1875.2258536682427,
         "half_width_95": 31.417370085322492,
         "interval": [
          1843.8084835829202,
          1906.6432237535653
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 33.91694802183775,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 13,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.7047144814741972,
         "half_width_95": 0.20838619360816638,
         "interval": [
          0.4963282878660309,
          0.9131006750823636
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.22110166168819972,
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
         "rank": 10,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.6289136415502687,
         "half_width_95": 0.3208648757171797,
         "interval": [
          0.30804876583308904,
          0.9497785172674484
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3278719536921386,
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
       "letters": "DWWWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760451",
         "date": "2026-06-21T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Iran",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760477",
         "date": "2026-06-27T03:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "New Zealand",
         "venue": "away",
         "gf": 5,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760493",
         "date": "2026-07-01T20:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Senegal",
         "venue": "home",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760507",
         "date": "2026-07-07T00:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "United States",
         "venue": "away",
         "gf": 4,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760511",
         "date": "2026-07-10T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Spain",
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "438195",
       "date": "2016-06-13T19:00:00Z",
       "home": "Belgium",
       "away": "Italy",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "560299",
       "date": "2021-07-02T19:00:00Z",
       "home": "Belgium",
       "away": "Italy",
       "home_score": 1,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "589984",
       "date": "2021-10-10T13:00:00Z",
       "home": "Italy",
       "away": "Belgium",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698939",
       "date": "2024-10-10T18:45:00Z",
       "home": "Italy",
       "away": "Belgium",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "698988",
       "date": "2024-11-14T19:45:00Z",
       "home": "Belgium",
       "away": "Italy",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 4,
      "draw": 1,
      "away": 0
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "698988",
      "date": "2024-11-14T19:45:00Z",
      "home": "Belgium",
      "away": "Italy",
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
       "team": "Italy",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Belgium",
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
     "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Italy vs Belgium",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-ITA",
       "ask_c": 43,
       "bid_c": 42,
       "spread_c": 1,
       "ask_size": 9739,
       "bid_size": 14598,
       "flags": [],
       "name": "Italy"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-TIE",
       "ask_c": 27,
       "bid_c": 26,
       "spread_c": 1,
       "ask_size": 34257,
       "bid_size": 4321,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-BEL",
       "ask_c": 32,
       "bid_c": 31,
       "spread_c": 1,
       "ask_size": 184212,
       "bid_size": 7875,
       "flags": [],
       "name": "Belgium"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 56.1,
     "favourite_side": "home",
     "home_minus_away": 56.1,
     "components": {
      "elo": {
       "home": 1866.3,
       "away": 1875.2
      },
      "raw_gap_home_minus_away": -8.9,
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
   "home": "Türkiye",
   "away": "France",
   "favourite": "France",
   "opponent": "Türkiye",
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
    "Türkiye": "espn_id",
    "France": "espn_id"
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
    "fav": 2,
    "opp": 13
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
     2
    ],
    "atk": [
     1,
     2
    ],
    "def": [
     2,
     2
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
    "competition": "unl",
    "clubs": {
     "fav": "France",
     "opp": "Türkiye"
    },
    "size": 54,
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
       "value": 1970.6717034365188,
       "half_width_95": 37.579170969187324,
       "interval": [
        1933.0925324673315,
        2008.250874405706
       ]
      },
      "opp": {
       "rank": 13,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1796.4706674011607,
       "half_width_95": 39.04139062648346,
       "interval": [
        1757.4292767746772,
        1835.5120580276441
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
       "fav": 39.517848064877995,
       "opp": 42.91138400981269
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": true,
       "value": 1.025613695903663,
       "half_width_95": 0.24312772425428852,
       "interval": [
        0.7824859716493745,
        1.2687414201579514
       ]
      },
      "opp": {
       "rank": 17,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.5073174473808804,
       "half_width_95": 0.24851850491515298,
       "interval": [
        0.2587989424657274,
        0.7558359522960334
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
       "fav": 0.2653911966178639,
       "opp": 0.27580372614631515
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
       "rank": 7,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.6996622729212316,
       "half_width_95": 0.24843617101555318,
       "interval": [
        0.45122610190567847,
        0.9480984439367848
       ]
      },
      "opp": {
       "rank": 13,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.5983336921604189,
       "half_width_95": 0.31592446410854547,
       "interval": [
        0.2824092280518734,
        0.9142581562689643
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
       "fav": 0.26272119389694426,
       "opp": 0.31533389321373545
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
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861053",
   "competition_id": "401861053",
   "kickoff": "2026-09-25T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Yildiz Entegre Kocaeli Stadyumu",
    "city": "Kocaeli",
    "country": "Türkiye"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
    "ticker": "KXUEFANLGAME-26SEP25TURFRA-FRA",
    "ask_c": 74,
    "bid_c": 73,
    "spread_c": 1,
    "ask_size": 6263,
    "bid_size": 53817,
    "flags": []
   },
   "form": {
    "fav": "WWWLL",
    "opp": "WWLLW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "98518",
      "date": "2003-06-26T19:00:00Z",
      "home": "France",
      "away": "Türkiye",
      "home_score": 3,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "266292",
      "date": "2009-06-05T19:00:00Z",
      "home": "France",
      "away": "Türkiye",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "529020",
      "date": "2019-06-08T18:45:00Z",
      "home": "Türkiye",
      "away": "France",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "528909",
      "date": "2019-10-14T18:45:00Z",
      "home": "France",
      "away": "Türkiye",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
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
     "event_id": "528909",
     "date": "2019-10-14T18:45:00Z",
     "home": "France",
     "away": "Türkiye",
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
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group A1",
    "leg": null,
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "venue_country": "Türkiye",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "turkiye",
      "espn_id": "465",
      "name": "Türkiye",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 13,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1796.4706674011607,
         "half_width_95": 39.04139062648346,
         "interval": [
          1757.4292767746772,
          1835.5120580276441
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 42.91138400981269,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 17,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5073174473808804,
         "half_width_95": 0.24851850491515298,
         "interval": [
          0.2587989424657274,
          0.7558359522960334
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.27580372614631515,
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
         "rank": 13,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5983336921604189,
         "half_width_95": 0.31592446410854547,
         "interval": [
          0.2824092280518734,
          0.9142581562689643
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.31533389321373545,
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
       "letters": "WWLLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401871359",
         "date": "2026-06-01T17:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "North Macedonia",
         "venue": "home",
         "gf": 4,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401871361",
         "date": "2026-06-06T22:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Venezuela",
         "venue": "away",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760421",
         "date": "2026-06-14T04:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Australia",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760443",
         "date": "2026-06-20T03:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Paraguay",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760470",
         "date": "2026-06-26T02:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "United States",
         "venue": "home",
         "gf": 3,
         "ga": 2,
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
      "key": "france",
      "espn_id": "478",
      "name": "France",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1970.6717034365188,
         "half_width_95": 37.579170969187324,
         "interval": [
          1933.0925324673315,
          2008.250874405706
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 39.517848064877995,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": true,
         "value": 1.025613695903663,
         "half_width_95": 0.24312772425428852,
         "interval": [
          0.7824859716493745,
          1.2687414201579514
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2653911966178639,
         "signal_source": "shots",
         "signal": "shots",
         "licensed": {
          "bands": 5,
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
         "rank": 7,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.6996622729212316,
         "half_width_95": 0.24843617101555318,
         "interval": [
          0.45122610190567847,
          0.9480984439367848
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.26272119389694426,
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
         "event_id": "760492",
         "date": "2026-06-30T21:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Sweden",
         "venue": "home",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760503",
         "date": "2026-07-04T21:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Paraguay",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760510",
         "date": "2026-07-09T20:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Morocco",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760514",
         "date": "2026-07-14T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Spain",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760516",
         "date": "2026-07-18T21:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "England",
         "venue": "home",
         "gf": 4,
         "ga": 6,
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "98518",
       "date": "2003-06-26T19:00:00Z",
       "home": "France",
       "away": "Türkiye",
       "home_score": 3,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "266292",
       "date": "2009-06-05T19:00:00Z",
       "home": "France",
       "away": "Türkiye",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "529020",
       "date": "2019-06-08T18:45:00Z",
       "home": "Türkiye",
       "away": "France",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "528909",
       "date": "2019-10-14T18:45:00Z",
       "home": "France",
       "away": "Türkiye",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
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
      "event_id": "528909",
      "date": "2019-10-14T18:45:00Z",
      "home": "France",
      "away": "Türkiye",
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
       "team": "Türkiye",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "France",
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
     "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Turkiye vs France",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-TUR",
       "ask_c": 11,
       "bid_c": 10,
       "spread_c": 1,
       "ask_size": 137726,
       "bid_size": 13829,
       "flags": [],
       "name": "Turkiye"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-TIE",
       "ask_c": 16,
       "bid_c": 15,
       "spread_c": 1,
       "ask_size": 47875,
       "bid_size": 26891,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-FRA",
       "ask_c": 74,
       "bid_c": 73,
       "spread_c": 1,
       "ask_size": 6263,
       "bid_size": 53817,
       "flags": [],
       "name": "France"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 109.2,
     "favourite_side": "away",
     "home_minus_away": -109.2,
     "components": {
      "elo": {
       "home": 1796.5,
       "away": 1970.7
      },
      "raw_gap_home_minus_away": -174.2,
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
   "home": "Hungary",
   "away": "Ukraine",
   "favourite": "Hungary",
   "opponent": "Ukraine",
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
    "Hungary": "espn_id",
    "Ukraine": "espn_id"
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
    "fav": 21,
    "opp": 15
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
     3,
     2
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": -1
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Hungary",
     "opp": "Ukraine"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 21,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1703.6193078751503,
       "half_width_95": 4.998368346288324,
       "interval": [
        1698.620939528862,
        1708.6176762214386
       ]
      },
      "opp": {
       "rank": 15,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1762.6812415005088,
       "half_width_95": 16.854007208288976,
       "interval": [
        1745.8272342922198,
        1779.5352487087978
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
       "fav": 12.54383945342929,
       "opp": 20.706462025766083
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 32,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.29986406429147894,
       "half_width_95": 0.27408385451865946,
       "interval": [
        0.025780209772819473,
        0.5739479188101384
       ]
      },
      "opp": {
       "rank": 24,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4645870916779584,
       "half_width_95": 0.3166906495331798,
       "interval": [
        0.1478964421447786,
        0.7812777412111382
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
       "fav": 0.2941191131942682,
       "opp": 0.3196957368935519
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
       "rank": 25,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.3428185160936351,
       "half_width_95": 0.2459543831754749,
       "interval": [
        0.0968641329181602,
        0.58877289926911
       ]
      },
      "opp": {
       "rank": 19,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.46778336699312784,
       "half_width_95": 0.25473612632485976,
       "interval": [
        0.21304724066826808,
        0.7225194933179876
       ]
      },
      "tier_gap": -1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2697845311095185,
       "opp": 0.28065712441456364
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
   "event_id": "401861054",
   "competition_id": "401861054",
   "kickoff": "2026-09-25T18:45Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Puskás Aréna",
    "city": "Budapest",
    "country": "Hungary"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
    "ticker": "KXUEFANLGAME-26SEP25HUNUKR-HUN",
    "ask_c": 40,
    "bid_c": 39,
    "spread_c": 1,
    "ask_size": 29823,
    "bid_size": 22684,
    "flags": []
   },
   "form": {
    "fav": "LWDWW",
    "opp": "WLWWL",
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
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group B2",
    "leg": null,
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "venue_country": "Hungary",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "hungary",
      "espn_id": "480",
      "name": "Hungary",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 21,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1703.6193078751503,
         "half_width_95": 4.998368346288324,
         "interval": [
          1698.620939528862,
          1708.6176762214386
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 12.54383945342929,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 32,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.29986406429147894,
         "half_width_95": 0.27408385451865946,
         "interval": [
          0.025780209772819473,
          0.5739479188101384
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2941191131942682,
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
         "rank": 25,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.3428185160936351,
         "half_width_95": 0.2459543831754749,
         "interval": [
          0.0968641329181602,
          0.58877289926911
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2697845311095185,
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
       "letters": "LWDWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724899",
         "date": "2025-11-16T14:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Republic of Ireland",
         "venue": "home",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401857704",
         "date": "2026-03-28T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Slovenia",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401857705",
         "date": "2026-03-31T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Greece",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401861779",
         "date": "2026-06-05T17:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Finland",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401861661",
         "date": "2026-06-09T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kazakhstan",
         "venue": "home",
         "gf": 3,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        }
       ],
       "friendlies": 4,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "ukraine",
      "espn_id": "457",
      "name": "Ukraine",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 15,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1762.6812415005088,
         "half_width_95": 16.854007208288976,
         "interval": [
          1745.8272342922198,
          1779.5352487087978
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 20.706462025766083,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 24,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4645870916779584,
         "half_width_95": 0.3166906495331798,
         "interval": [
          0.1478964421447786,
          0.7812777412111382
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3196957368935519,
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
         "rank": 19,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.46778336699312784,
         "half_width_95": 0.25473612632485976,
         "interval": [
          0.21304724066826808,
          0.7225194933179876
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.28065712441456364,
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
       "letters": "WLWWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "724904",
         "date": "2025-11-16T17:00Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Iceland",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761384",
         "date": "2026-03-26T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Sweden",
         "venue": "home",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866760",
         "date": "2026-03-31T18:45Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Albania",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401872548",
         "date": "2026-05-31T15:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Poland",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401871170",
         "date": "2026-06-07T16:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Denmark",
         "venue": "away",
         "gf": 1,
         "ga": 2,
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
       "team": "Hungary",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Ukraine",
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
     "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Hungary vs Ukraine",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-HUN",
       "ask_c": 40,
       "bid_c": 39,
       "spread_c": 1,
       "ask_size": 29823,
       "bid_size": 22684,
       "flags": [],
       "name": "Hungary"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-TIE",
       "ask_c": 30,
       "bid_c": 29,
       "spread_c": 1,
       "ask_size": 7149,
       "bid_size": 18164,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-UKR",
       "ask_c": 31,
       "bid_c": 30,
       "spread_c": 1,
       "ask_size": 51434,
       "bid_size": 7448,
       "flags": [],
       "name": "Ukraine"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 5.9,
     "favourite_side": "home",
     "home_minus_away": 5.9,
     "components": {
      "elo": {
       "home": 1703.6,
       "away": 1762.7
      },
      "raw_gap_home_minus_away": -59.1,
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
    "ask_c": 81,
    "bid_c": 80,
    "spread_c": 1,
    "ask_size": 2088,
    "bid_size": 1891,
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
    "stage": "group-stage",
    "stage_kind": "group",
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
       "ask_c": 81,
       "bid_c": 80,
       "spread_c": 1,
       "ask_size": 2088,
       "bid_size": 1891,
       "flags": [],
       "name": "Slovakia"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
       "ticker": "KXUEFANLGAME-26SEP26SVKMDA-TIE",
       "ask_c": 13,
       "bid_c": 12,
       "spread_c": 1,
       "ask_size": 4396,
       "bid_size": 1357,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP26SVKMDA",
       "ticker": "KXUEFANLGAME-26SEP26SVKMDA-MDA",
       "ask_c": 6,
       "bid_c": 5,
       "spread_c": 1,
       "ask_size": 765,
       "bid_size": 1835,
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
   "home": "Lithuania",
   "away": "Azerbaijan",
   "favourite": "Azerbaijan",
   "opponent": "Lithuania",
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
    "Lithuania": "espn_id",
    "Azerbaijan": "espn_id"
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
    "fav": 43,
    "opp": 50
   },
   "rates": {
    "ppg": [
     null,
     3
    ],
    "gf": [
     null,
     2
    ],
    "ga": [
     null,
     0
    ],
    "gdg": [
     null,
     2
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
     3
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 0,
    "def": -1
   },
   "shape": "HOLLOW",
   "current_only": null,
   "field": {
    "competition": "unl",
    "clubs": {
     "fav": "Azerbaijan",
     "opp": "Lithuania"
    },
    "size": 54,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 43,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1397.3650085726279,
       "half_width_95": 32.229966966989004,
       "interval": [
        1365.135041605639,
        1429.5949755396168
       ]
      },
      "opp": {
       "rank": 50,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1314.7488316714177,
       "half_width_95": 11.708730752214642,
       "interval": [
        1303.040100919203,
        1326.4575624236325
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
       "fav": 34.55928392096668,
       "opp": 14.958703419875498
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 47,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3054239406395819,
       "half_width_95": 0.46330862397057254,
       "interval": [
        -0.7687325646101544,
        0.15788468333099065
       ]
      },
      "opp": {
       "rank": 43,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.1830399498954044,
       "half_width_95": 0.3610951330373964,
       "interval": [
        -0.5441350829328008,
        0.17805518314199198
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
       "fav": 0.46320725703775867,
       "opp": 0.38209452785891873
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
       "rank": 44,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.06320038845461806,
       "half_width_95": 0.2510465675619797,
       "interval": [
        -0.31424695601659774,
        0.18784617910736162
       ]
      },
      "opp": {
       "rank": 32,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.254626483232361,
       "half_width_95": 0.3270760677383233,
       "interval": [
        -0.07244958450596234,
        0.5817025509706844
       ]
      },
      "tier_gap": -1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 54,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.2692015027334479,
       "opp": 0.3449130362569761
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
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401861067",
   "competition_id": "401861067",
   "kickoff": "2026-09-27T13:00Z",
   "espn": "uefa.nations",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "S. Darius and S. Gireno Stadium",
    "city": "Kaunas",
    "country": "Lithuania"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
    "ticker": "KXUEFANLGAME-26SEP27LTUAZE-AZE",
    "ask_c": 30,
    "bid_c": 28,
    "spread_c": 2,
    "ask_size": 3,
    "bid_size": 416,
    "flags": [
     "THIN"
    ]
   },
   "form": {
    "fav": "WDLWW",
    "opp": "DLWLW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "237441",
      "date": "2008-03-26T17:00:00Z",
      "home": "Lithuania",
      "away": "Azerbaijan",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "501645",
      "date": "2019-03-25T14:00:00Z",
      "home": "Azerbaijan",
      "away": "Lithuania",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 1,
     "away": 0
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "501645",
     "date": "2019-03-25T14:00:00Z",
     "home": "Azerbaijan",
     "away": "Lithuania",
     "home_score": 0,
     "away_score": 0,
     "completed": true,
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "unl",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group D2",
    "leg": null,
    "status_detail": "Sun, September 27th at 9:00 AM EDT",
    "venue_country": "Lithuania",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "lithuania",
      "espn_id": "460",
      "name": "Lithuania",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 50,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1314.7488316714177,
         "half_width_95": 11.708730752214642,
         "interval": [
          1303.040100919203,
          1326.4575624236325
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 14.958703419875498,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 43,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.1830399498954044,
         "half_width_95": 0.3610951330373964,
         "interval": [
          -0.5441350829328008,
          0.17805518314199198
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.38209452785891873,
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
         "rank": 32,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.254626483232361,
         "half_width_95": 0.3270760677383233,
         "interval": [
          -0.07244958450596234,
          0.5817025509706844
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3449130362569761,
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
         "event_id": "755121",
         "date": "2025-11-13T17:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Israel",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "724912",
         "date": "2025-11-17T19:45Z",
         "competition": "FIFA World Cup Qualifying - UEFA",
         "kind": "competitive",
         "opponent": "Netherlands",
         "venue": "away",
         "gf": 0,
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
         "opponent": "Moldova",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "763033",
         "date": "2026-03-29T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Georgia",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401861043",
         "date": "2026-09-24T18:45Z",
         "competition": "UEFA Nations League",
         "kind": "competitive",
         "opponent": "Liechtenstein",
         "venue": "away",
         "gf": 2,
         "ga": 0,
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
      "key": "azerbaijan",
      "espn_id": "581",
      "name": "Azerbaijan",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "unl",
       "axes": {
        "ovr": {
         "rank": 43,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1397.3650085726279,
         "half_width_95": 32.229966966989004,
         "interval": [
          1365.135041605639,
          1429.5949755396168
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 34.55928392096668,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 47,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3054239406395819,
         "half_width_95": 0.46330862397057254,
         "interval": [
          -0.7687325646101544,
          0.15788468333099065
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.46320725703775867,
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
         "rank": 44,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.06320038845461806,
         "half_width_95": 0.2510465675619797,
         "interval": [
          -0.31424695601659774,
          0.18784617910736162
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.2692015027334479,
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
       "letters": "WDLWW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401861921",
         "date": "2026-03-27T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Lucia",
         "venue": "home",
         "gf": 6,
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
         "opponent": "Sierra Leone",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "W",
         "provider_agrees": false,
         "shootout": {
          "for": 2,
          "against": 1,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         }
        },
        {
         "event_id": "401871785",
         "date": "2026-06-05T18:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Malta",
         "venue": "home",
         "gf": 0,
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
         "opponent": "San Marino",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401898013",
         "date": "2026-09-23T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Tajikistan",
         "venue": "home",
         "gf": 1,
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
       "event_id": "237441",
       "date": "2008-03-26T17:00:00Z",
       "home": "Lithuania",
       "away": "Azerbaijan",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "501645",
       "date": "2019-03-25T14:00:00Z",
       "home": "Azerbaijan",
       "away": "Lithuania",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 1,
      "away": 0
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "501645",
      "date": "2019-03-25T14:00:00Z",
      "home": "Azerbaijan",
      "away": "Lithuania",
      "home_score": 0,
      "away_score": 0,
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
       "team": "Lithuania",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Azerbaijan",
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
     "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Lithuania vs Azerbaijan",
     "legs": {
      "home": {
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-LTU",
       "ask_c": 39,
       "bid_c": 38,
       "spread_c": 1,
       "ask_size": 2135,
       "bid_size": 414,
       "flags": [],
       "name": "Lithuania"
      },
      "tie": {
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-TIE",
       "ask_c": 32,
       "bid_c": 30,
       "spread_c": 2,
       "ask_size": 1677,
       "bid_size": 441,
       "flags": []
      },
      "away": {
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-AZE",
       "ask_c": 30,
       "bid_c": 28,
       "spread_c": 2,
       "ask_size": 3,
       "bid_size": 416,
       "flags": [
        "THIN"
       ],
       "name": "Azerbaijan"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 17.6,
     "favourite_side": "away",
     "home_minus_away": -17.6,
     "components": {
      "elo": {
       "home": 1314.7,
       "away": 1397.4
      },
      "raw_gap_home_minus_away": -82.6,
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
   "home": "Bermuda",
   "away": "Guadeloupe",
   "favourite": "Guadeloupe",
   "opponent": "Bermuda",
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
    "Bermuda": "espn_id",
    "Guadeloupe": "espn_id"
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
    "fav": 10,
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
     2,
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
    "ovr": 1,
    "atk": 1,
    "def": 1
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "Guadeloupe",
     "opp": "Bermuda"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 10,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1482.9717056688557,
       "half_width_95": 10.928105585416588,
       "interval": [
        1472.043600083439,
        1493.8998112542724
       ]
      },
      "opp": {
       "rank": 20,
       "tier": 3,
       "tier_set": [
        3
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1350.991345411587,
       "half_width_95": 10.94825699955818,
       "interval": [
        1340.0430884120287,
        1361.9396024111452
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
       "fav": 16.00874675283264,
       "opp": 16.588277096180004
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
       "value": 0.011030827914305652,
       "half_width_95": 0.40747916592160616,
       "interval": [
        -0.3964483380073005,
        0.4185099938359118
       ]
      },
      "opp": {
       "rank": 23,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3691471413468553,
       "half_width_95": 0.3499012144691113,
       "interval": [
        -0.7190483558159666,
        -0.019245926877743957
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
       "fav": 0.4286853519972919,
       "opp": 0.383766739703742
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
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 8,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.05116098034796346,
       "half_width_95": 0.3491850837937746,
       "interval": [
        -0.29802410344581115,
        0.40034606414173807
       ]
      },
      "opp": {
       "rank": 23,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.5701807651479587,
       "half_width_95": 0.5077155636716654,
       "interval": [
        -1.077896328819624,
        -0.06246520147629331
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
       "fav": 0.37263742609300443,
       "opp": 0.5153671672545215
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
         1,
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
   "event_id": "401900630",
   "competition_id": "401900630",
   "kickoff": "2026-09-25T19:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Beausejour Stadium",
    "city": "Gros Islet",
    "country": "St Lucia"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
    "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-GLP",
    "ask_c": 26,
    "bid_c": 25,
    "spread_c": 1,
    "ask_size": 6,
    "bid_size": 1464,
    "flags": [
     "THIN"
    ]
   },
   "form": {
    "fav": "WWLLL",
    "opp": "LLLDL",
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
    "group": "League B, Group B",
    "leg": null,
    "status_detail": "Fri, September 25th at 3:00 PM EDT",
    "venue_country": "St Lucia",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "bermuda",
      "espn_id": "2643",
      "name": "Bermuda",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 20,
         "tier": 3,
         "tier_set": [
          3
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1350.991345411587,
         "half_width_95": 10.94825699955818,
         "interval": [
          1340.0430884120287,
          1361.9396024111452
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 16.588277096180004,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 23,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3691471413468553,
         "half_width_95": 0.3499012144691113,
         "interval": [
          -0.7190483558159666,
          -0.019245926877743957
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.383766739703742,
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
         "rank": 23,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.5701807651479587,
         "half_width_95": 0.5077155636716654,
         "interval": [
          -1.077896328819624,
          -0.06246520147629331
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5153671672545215,
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
       "letters": "LLLDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "754250",
         "date": "2025-10-10T22:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Trinidad and Tobago",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "754258",
         "date": "2025-10-15T00:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Jamaica",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "754265",
         "date": "2025-11-14T00:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Curaçao",
         "venue": "home",
         "gf": 0,
         "ga": 7,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "754271",
         "date": "2025-11-19T01:00Z",
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "kind": "competitive",
         "opponent": "Trinidad and Tobago",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "L",
         "provider_agrees": false
        },
        {
         "event_id": "401866396",
         "date": "2026-03-25T22:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Congo DR",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 1,
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "guadeloupe",
      "espn_id": "7657",
      "name": "Guadeloupe",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 10,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1482.9717056688557,
         "half_width_95": 10.928105585416588,
         "interval": [
          1472.043600083439,
          1493.8998112542724
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 16.00874675283264,
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
         "value": 0.011030827914305652,
         "half_width_95": 0.40747916592160616,
         "interval": [
          -0.3964483380073005,
          0.4185099938359118
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4286853519972919,
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
         "rank": 8,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.05116098034796346,
         "half_width_95": 0.3491850837937746,
         "interval": [
          -0.29802410344581115,
          0.40034606414173807
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.37263742609300443,
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
       "letters": "WWLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "734182",
         "date": "2025-03-22T00:00Z",
         "competition": "Concacaf Gold Cup Qualifying",
         "kind": "competitive",
         "opponent": "Nicaragua",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "734188",
         "date": "2025-03-26T00:30Z",
         "competition": "Concacaf Gold Cup Qualifying",
         "kind": "competitive",
         "opponent": "Nicaragua",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "735322",
         "date": "2025-06-16T23:00Z",
         "competition": "Concacaf Gold Cup",
         "kind": "competitive",
         "opponent": "Panama",
         "venue": "away",
         "gf": 2,
         "ga": 5,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "735330",
         "date": "2025-06-20T23:45Z",
         "competition": "Concacaf Gold Cup",
         "kind": "competitive",
         "opponent": "Jamaica",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "735339",
         "date": "2025-06-24T23:00Z",
         "competition": "Concacaf Gold Cup",
         "kind": "competitive",
         "opponent": "Guatemala",
         "venue": "home",
         "gf": 2,
         "ga": 3,
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
       "team": "Bermuda",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Guadeloupe",
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
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Bermuda vs Guadeloupe",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-BMU",
       "ask_c": 47,
       "bid_c": 46,
       "spread_c": 1,
       "ask_size": 461,
       "bid_size": 28,
       "flags": [],
       "name": "Bermuda"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-TIE",
       "ask_c": 30,
       "bid_c": 29,
       "spread_c": 1,
       "ask_size": 1942,
       "bid_size": 466,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-GLP",
       "ask_c": 26,
       "bid_c": 25,
       "spread_c": 1,
       "ask_size": 6,
       "bid_size": 1464,
       "flags": [
        "THIN"
       ],
       "name": "Guadeloupe"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 132,
     "favourite_side": "away",
     "home_minus_away": -132,
     "components": {
      "elo": {
       "home": 1351,
       "away": 1483
      },
      "raw_gap_home_minus_away": -132,
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
   "league": "cnl",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "home": "Grenada",
   "away": "Cuba",
   "favourite": "Cuba",
   "opponent": "Grenada",
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
    "Grenada": "espn_id",
    "Cuba": "espn_id"
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
    "fav": 15,
    "opp": 23
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
     3
    ],
    "atk": [
     2,
     2
    ],
    "def": [
     2,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 0,
    "def": 1
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "cnl",
    "clubs": {
     "fav": "Cuba",
     "opp": "Grenada"
    },
    "size": 37,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 15,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1432.104001146025,
       "half_width_95": 6.117859303574252,
       "interval": [
        1425.9861418424507,
        1438.2218604495993
       ]
      },
      "opp": {
       "rank": 23,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1316.8495644219408,
       "half_width_95": 22.209120544266348,
       "interval": [
        1294.6404438776744,
        1339.0586849662072
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
       "fav": 14.678826156098772,
       "opp": 26.287200366137093
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 15,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.07557277678360316,
       "half_width_95": 0.3117212412658091,
       "interval": [
        -0.3872940180494122,
        0.23614846448220592
       ]
      },
      "opp": {
       "rank": 21,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.30634777718744194,
       "half_width_95": 0.4563777507886552,
       "interval": [
        -0.7627255279760972,
        0.15002997360121328
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
       "fav": 0.3334511704520471,
       "opp": 0.46766438842801755
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
         1,
         2
        ],
        "straddles": true
       }
      }
     },
     "def": {
      "fav": {
       "rank": 10,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.008152509563098764,
       "half_width_95": 0.33917164212414136,
       "interval": [
        -0.3310191325610426,
        0.3473241516872401
       ]
      },
      "opp": {
       "rank": 24,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.5702902155690573,
       "half_width_95": 0.25612167070502273,
       "interval": [
        -0.8264118862740801,
        -0.3141685448640346
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
       "fav": 0.33706301191491345,
       "opp": 0.26106460519373925
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
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401900628",
   "competition_id": "401900628",
   "kickoff": "2026-09-25T21:00Z",
   "espn": "concacaf.nations.league",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "SKNFA Technical Centre",
    "city": "Basseterre",
    "country": "St Kitts and Nevis"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB",
    "ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB-CUB",
    "ask_c": 38,
    "bid_c": 37,
    "spread_c": 1,
    "ask_size": 194,
    "bid_size": 458,
    "flags": []
   },
   "form": {
    "fav": "LWWDD",
    "opp": "WLLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "526374",
      "date": "2018-10-13T00:00:00Z",
      "home": "Grenada",
      "away": "Cuba",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "759727",
      "date": "2025-10-11T23:30:00Z",
      "home": "Grenada",
      "away": "Cuba",
      "home_score": 2,
      "away_score": 0,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 0,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "759727",
     "date": "2025-10-11T23:30:00Z",
     "home": "Grenada",
     "away": "Cuba",
     "home_score": 2,
     "away_score": 0,
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
    "group": "League B, Group C",
    "leg": null,
    "status_detail": "Fri, September 25th at 5:00 PM EDT",
    "venue_country": "St Kitts and Nevis",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "grenada",
      "espn_id": "2651",
      "name": "Grenada",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 23,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1316.8495644219408,
         "half_width_95": 22.209120544266348,
         "interval": [
          1294.6404438776744,
          1339.0586849662072
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 26.287200366137093,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 21,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.30634777718744194,
         "half_width_95": 0.4563777507886552,
         "interval": [
          -0.7627255279760972,
          0.15002997360121328
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.46766438842801755,
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
         "rank": 24,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.5702902155690573,
         "half_width_95": 0.25612167070502273,
         "interval": [
          -0.8264118862740801,
          -0.3141685448640346
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.26106460519373925,
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
       "letters": "WLLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760882",
         "date": "2025-11-15T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "US Virgin Islands",
         "venue": "home",
         "gf": 4,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401856092",
         "date": "2026-01-18T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Jamaica",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866482",
         "date": "2026-03-27T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Rwanda",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866741",
         "date": "2026-03-30T14:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Kenya",
         "venue": "home",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401865597",
         "date": "2026-05-16T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Republic of Ireland",
         "venue": "away",
         "gf": 0,
         "ga": 5,
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
      "key": "cuba",
      "espn_id": "2647",
      "name": "Cuba",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "cnl",
       "axes": {
        "ovr": {
         "rank": 15,
         "tier": 2,
         "tier_set": [
          2
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1432.104001146025,
         "half_width_95": 6.117859303574252,
         "interval": [
          1425.9861418424507,
          1438.2218604495993
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 14.678826156098772,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 15,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.07557277678360316,
         "half_width_95": 0.3117212412658091,
         "interval": [
          -0.3872940180494122,
          0.23614846448220592
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3334511704520471,
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
         "rank": 10,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.008152509563098764,
         "half_width_95": 0.33917164212414136,
         "interval": [
          -0.3310191325610426,
          0.3473241516872401
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.33706301191491345,
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
       "letters": "LWWDD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "759727",
         "date": "2025-10-11T23:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Grenada",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "761046",
         "date": "2025-11-12T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "St. Lucia",
         "venue": "home",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "761285",
         "date": "2025-11-16T00:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Martinique",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401866380",
         "date": "2026-03-26T21:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Martinique",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401866390",
         "date": "2026-03-29T22:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Dominican Republic",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
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
       "event_id": "526374",
       "date": "2018-10-13T00:00:00Z",
       "home": "Grenada",
       "away": "Cuba",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "759727",
       "date": "2025-10-11T23:30:00Z",
       "home": "Grenada",
       "away": "Cuba",
       "home_score": 2,
       "away_score": 0,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 0,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "759727",
      "date": "2025-10-11T23:30:00Z",
      "home": "Grenada",
      "away": "Cuba",
      "home_score": 2,
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
       "team": "Grenada",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Cuba",
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
     "event_ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Grenada vs Cuba",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB",
       "ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB-GRN",
       "ask_c": 33,
       "bid_c": 32,
       "spread_c": 1,
       "ask_size": 634,
       "bid_size": 434,
       "flags": [],
       "name": "Grenada"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB",
       "ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB-TIE",
       "ask_c": 30,
       "bid_c": 29,
       "spread_c": 1,
       "ask_size": 250,
       "bid_size": 258,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB",
       "ticker": "KXCONCACAFNLGAME-26SEP25GRNCUB-CUB",
       "ask_c": 38,
       "bid_c": 37,
       "spread_c": 1,
       "ask_size": 194,
       "bid_size": 458,
       "flags": [],
       "name": "Cuba"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 115.3,
     "favourite_side": "away",
     "home_minus_away": -115.3,
     "components": {
      "elo": {
       "home": 1316.8,
       "away": 1432.1
      },
      "raw_gap_home_minus_away": -115.3,
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
    "ask_c": 76,
    "bid_c": 38,
    "spread_c": 38,
    "ask_size": 6,
    "bid_size": 1,
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
     "announced": false,
     "sides": {
      "home": {
       "team": "Bonaire",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "St. Kitts and Nevis",
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
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Bonaire vs Saint Kitts and Nevis",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-BON",
       "ask_c": 26,
       "bid_c": 10,
       "spread_c": 16,
       "ask_size": 20,
       "bid_size": 1,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Bonaire"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-TIE",
       "ask_c": 56,
       "bid_c": 26,
       "spread_c": 30,
       "ask_size": 292,
       "bid_size": 7,
       "flags": [
        "WIDE"
       ]
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BONKNA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BONKNA-KNA",
       "ask_c": 76,
       "bid_c": 38,
       "spread_c": 38,
       "ask_size": 6,
       "bid_size": 1,
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
    "ask_size": 2682,
    "bid_size": 432,
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
     "announced": false,
     "sides": {
      "home": {
       "team": "Barbados",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "St. Lucia",
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
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Barbados vs Saint Lucia",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-BAR",
       "ask_c": 28,
       "bid_c": 27,
       "spread_c": 1,
       "ask_size": 2197,
       "bid_size": 453,
       "flags": [],
       "name": "Barbados"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-TIE",
       "ask_c": 28,
       "bid_c": 27,
       "spread_c": 1,
       "ask_size": 692,
       "bid_size": 450,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BARLCA",
       "ticker": "KXCONCACAFNLGAME-26SEP25BARLCA-LCA",
       "ask_c": 45,
       "bid_c": 44,
       "spread_c": 1,
       "ask_size": 2682,
       "bid_size": 432,
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
    "ask_c": 52,
    "bid_c": 51,
    "spread_c": 1,
    "ask_size": 2924,
    "bid_size": 645,
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
     "announced": false,
     "sides": {
      "home": {
       "team": "Jamaica",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Guatemala",
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
     "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Jamaica vs Guatemala",
     "legs": {
      "home": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-JAM",
       "ask_c": 52,
       "bid_c": 51,
       "spread_c": 1,
       "ask_size": 2924,
       "bid_size": 645,
       "flags": [],
       "name": "Jamaica"
      },
      "tie": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-TIE",
       "ask_c": 28,
       "bid_c": 27,
       "spread_c": 1,
       "ask_size": 5925,
       "bid_size": 121,
       "flags": []
      },
      "away": {
       "event_ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM",
       "ticker": "KXCONCACAFNLGAME-26SEP25JAMGTM-GTM",
       "ask_c": 24,
       "bid_c": 23,
       "spread_c": 1,
       "ask_size": 1131,
       "bid_size": 0,
       "flags": [],
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
   "league": "gulfcup",
   "column": "gulfcup",
   "columns": [
    "gulfcup"
   ],
   "home": "Kuwait",
   "away": "Iraq",
   "favourite": "Iraq",
   "opponent": "Kuwait",
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
    "Kuwait": "espn_id",
    "Iraq": "espn_id"
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
    "home": "gulfcup",
    "away": "gulfcup"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "no Kalshi series lists this competition, so there is no settlement rule to state.",
   "ranks": {
    "fav": 1,
    "opp": 7
   },
   "rates": {
    "ppg": [
     1,
     0
    ],
    "gf": [
     1,
     0
    ],
    "ga": [
     1,
     1
    ],
    "gdg": [
     0,
     -1
    ]
   },
   "own_gdg": {
    "diff": 1,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     1,
     4
    ],
    "atk": [
     4,
     5
    ],
    "def": [
     1,
     5
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 1,
    "def": 4
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "gulfcup",
    "clubs": {
     "fav": "Iraq",
     "opp": "Kuwait"
    },
    "size": 8,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 1,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1679.1377774945497,
       "half_width_95": 31.016819051031657,
       "interval": [
        1648.120958443518,
        1710.1545965455814
       ]
      },
      "opp": {
       "rank": 7,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1476.748290798431,
       "half_width_95": 29.878630650774895,
       "interval": [
        1446.869660147656,
        1506.626921449206
       ]
      },
      "tier_gap": 3,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 34.927962094121135,
       "opp": 33.66817870606813
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 5,
       "tier": 4,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.10582546581980662,
       "half_width_95": 0.368153767039021,
       "interval": [
        -0.4739792328588276,
        0.26232830121921435
       ]
      },
      "opp": {
       "rank": 7,
       "tier": 5,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.15915422344731356,
       "half_width_95": 0.44754104843689707,
       "interval": [
        -0.6066952718842107,
        0.2883868249895835
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.38369261766252394,
       "opp": 0.4645333727584657
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
       "rank": 2,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.18995462145499759,
       "half_width_95": 0.5337718448374911,
       "interval": [
        -0.3438172233824935,
        0.7237264662924887
       ]
      },
      "opp": {
       "rank": 8,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.5033045689419671,
       "half_width_95": 0.2857468330029174,
       "interval": [
        -0.7890514019448844,
        -0.21755773593904965
       ]
      },
      "tier_gap": 4,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.5288690279496416,
       "opp": 0.3010802003552002
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
         2
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
    "field_basis": "the 27th Arabian Gulf Cup 2026 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401922493",
   "competition_id": "401922493",
   "kickoff": "2026-09-26T15:00Z",
   "espn": "global.gulf_cup",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Prince Abdullah Al-Faisal Stadium",
    "city": "Jeddah",
    "country": "Saudi Arabia"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": null,
   "form": {
    "fav": "LLLLD",
    "opp": "LDWDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "526946",
      "date": "2018-09-10T15:30:00Z",
      "home": "Kuwait",
      "away": "Iraq",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "593725",
      "date": "2021-01-27T15:00:00Z",
      "home": "Iraq",
      "away": "Kuwait",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "660627",
      "date": "2022-12-30T12:00:00Z",
      "home": "Iraq",
      "away": "Kuwait",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "710442",
      "date": "2024-09-10T18:00:00Z",
      "home": "Kuwait",
      "away": "Iraq",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "710490",
      "date": "2025-03-20T18:15:00Z",
      "home": "Iraq",
      "away": "Kuwait",
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
     "event_id": "710490",
     "date": "2025-03-20T18:15:00Z",
     "home": "Iraq",
     "away": "Kuwait",
     "home_score": 2,
     "away_score": 2,
     "completed": true,
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "gulfcup",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group A",
    "leg": null,
    "status_detail": "Sat, September 26th at 11:00 AM EDT",
    "venue_country": "Saudi Arabia",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "kuwait",
      "espn_id": "841",
      "name": "Kuwait",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 7,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1476.748290798431,
         "half_width_95": 29.878630650774895,
         "interval": [
          1446.869660147656,
          1506.626921449206
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 33.66817870606813,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 7,
         "tier": 5,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.15915422344731356,
         "half_width_95": 0.44754104843689707,
         "interval": [
          -0.6066952718842107,
          0.2883868249895835
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4645333727584657,
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
         "rank": 8,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.5033045689419671,
         "half_width_95": 0.2857468330029174,
         "interval": [
          -0.7890514019448844,
          -0.21755773593904965
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3010802003552002,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
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
       "letters": "LDWDL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "710514",
         "date": "2025-06-10T11:00Z",
         "competition": "FIFA World Cup Qualifying - AFC",
         "kind": "competitive",
         "opponent": "South Korea",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "758160",
         "date": "2025-09-08T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Syria",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760801",
         "date": "2025-11-15T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Tanzania",
         "venue": "home",
         "gf": 4,
         "ga": 3,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401871837",
         "date": "2026-06-05T12:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Thailand",
         "venue": "away",
         "gf": 2,
         "ga": 2,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401922490",
         "date": "2026-09-23T18:00Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Saudi Arabia",
         "venue": "away",
         "gf": 0,
         "ga": 1,
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
      "key": "iraq",
      "espn_id": "4375",
      "name": "Iraq",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 1,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1679.1377774945497,
         "half_width_95": 31.016819051031657,
         "interval": [
          1648.120958443518,
          1710.1545965455814
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 34.927962094121135,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 5,
         "tier": 4,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.10582546581980662,
         "half_width_95": 0.368153767039021,
         "interval": [
          -0.4739792328588276,
          0.26232830121921435
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.38369261766252394,
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
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.18995462145499759,
         "half_width_95": 0.5337718448374911,
         "interval": [
          -0.3438172233824935,
          0.7237264662924887
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5288690279496416,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLLLD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401873603",
         "date": "2026-06-10T01:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Venezuela",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760430",
         "date": "2026-06-16T22:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Norway",
         "venue": "home",
         "gf": 1,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760457",
         "date": "2026-06-22T21:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "France",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760474",
         "date": "2026-06-26T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Senegal",
         "venue": "away",
         "gf": 0,
         "ga": 5,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401922489",
         "date": "2026-09-23T14:30Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Oman",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "526946",
       "date": "2018-09-10T15:30:00Z",
       "home": "Kuwait",
       "away": "Iraq",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "593725",
       "date": "2021-01-27T15:00:00Z",
       "home": "Iraq",
       "away": "Kuwait",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "660627",
       "date": "2022-12-30T12:00:00Z",
       "home": "Iraq",
       "away": "Kuwait",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "710442",
       "date": "2024-09-10T18:00:00Z",
       "home": "Kuwait",
       "away": "Iraq",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "710490",
       "date": "2025-03-20T18:15:00Z",
       "home": "Iraq",
       "away": "Kuwait",
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
      "event_id": "710490",
      "date": "2025-03-20T18:15:00Z",
      "home": "Iraq",
      "away": "Kuwait",
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
       "team": "Kuwait",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Iraq",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "no_series",
     "status_words": "no Kalshi series lists this competition"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 202.4,
     "favourite_side": "away",
     "home_minus_away": -202.4,
     "components": {
      "elo": {
       "home": 1476.7,
       "away": 1679.1
      },
      "raw_gap_home_minus_away": -202.4,
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
   "league": "gulfcup",
   "column": "gulfcup",
   "columns": [
    "gulfcup"
   ],
   "home": "Oman",
   "away": "Saudi Arabia",
   "favourite": "Saudi Arabia",
   "opponent": "Oman",
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
    "Oman": "espn_id",
    "Saudi Arabia": "espn_id"
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
    "home": "gulfcup",
    "away": "gulfcup"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "no Kalshi series lists this competition, so there is no settlement rule to state.",
   "ranks": {
    "fav": 2,
    "opp": 3
   },
   "rates": {
    "ppg": [
     3,
     1
    ],
    "gf": [
     1,
     1
    ],
    "ga": [
     0,
     1
    ],
    "gdg": [
     1,
     0
    ]
   },
   "own_gdg": {
    "diff": 1,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     1,
     1
    ],
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 3,
    "def": 2
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "gulfcup",
    "clubs": {
     "fav": "Saudi Arabia",
     "opp": "Oman"
    },
    "size": 8,
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
       "value": 1657.9944285886704,
       "half_width_95": 36.71107866901266,
       "interval": [
        1621.2833499196577,
        1694.7055072576832
       ]
      },
      "opp": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1636.2191125597012,
       "half_width_95": 24.271311120340126,
       "interval": [
        1611.947801439361,
        1660.4904236800414
       ]
      },
      "tier_gap": 0,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 39.80699461637233,
       "opp": 29.839628741745123
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.17390419495557946,
       "half_width_95": 0.4288367958806336,
       "interval": [
        -0.25493260092505415,
        0.6027409908362131
       ]
      },
      "opp": {
       "rank": 4,
       "tier": 4,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.061192506606616126,
       "half_width_95": 0.3769907803504885,
       "interval": [
        -0.4381832869571046,
        0.31579827374387237
       ]
      },
      "tier_gap": 3,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4284373512743613,
       "opp": 0.3803121993308126
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
       "rank": 1,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.23132855789626755,
       "half_width_95": 0.5401924604381242,
       "interval": [
        -0.30886390254185664,
        0.7715210183343917
       ]
      },
      "opp": {
       "rank": 5,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.12778658552781344,
       "half_width_95": 0.4006844937601918,
       "interval": [
        -0.5284710792880052,
        0.27289790823237836
       ]
      },
      "tier_gap": 2,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.5314581568527432,
       "opp": 0.4143584290308371
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
    "field_basis": "the 27th Arabian Gulf Cup 2026 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401922494",
   "competition_id": "401922494",
   "kickoff": "2026-09-26T18:00Z",
   "espn": "global.gulf_cup",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "King Abdullah Sport City Stadium",
    "city": "Buraidah",
    "country": "Saudi Arabia"
   },
   "venue_class": {
    "class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "kalshi": null,
   "form": {
    "fav": "DDLDW",
    "opp": "WLLWD",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "332344",
      "date": "2011-11-15T16:30:00Z",
      "home": "Saudi Arabia",
      "away": "Oman",
      "home_score": 0,
      "away_score": 0,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "611297",
      "date": "2021-09-07T16:00:00Z",
      "home": "Oman",
      "away": "Saudi Arabia",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "611267",
      "date": "2022-01-27T17:15:00Z",
      "home": "Saudi Arabia",
      "away": "Oman",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "668930",
      "date": "2024-01-16T17:30:00Z",
      "home": "Saudi Arabia",
      "away": "Oman",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "728859",
      "date": "2024-12-31T14:30:00Z",
      "home": "Oman",
      "away": "Saudi Arabia",
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
     "away": 3
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "728859",
     "date": "2024-12-31T14:30:00Z",
     "home": "Oman",
     "away": "Saudi Arabia",
     "home_score": 2,
     "away_score": 1,
     "completed": true,
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "gulfcup",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group A",
    "leg": null,
    "status_detail": "Sat, September 26th at 2:00 PM EDT",
    "venue_country": "Saudi Arabia",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "oman",
      "espn_id": "2841",
      "name": "Oman",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1636.2191125597012,
         "half_width_95": 24.271311120340126,
         "interval": [
          1611.947801439361,
          1660.4904236800414
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 29.839628741745123,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 4,
         "tier": 4,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.061192506606616126,
         "half_width_95": 0.3769907803504885,
         "interval": [
          -0.4381832869571046,
          0.31579827374387237
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3803121993308126,
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
         "rank": 5,
         "tier": 3,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.12778658552781344,
         "half_width_95": 0.4006844937601918,
         "interval": [
          -0.5284710792880052,
          0.27289790823237836
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4143584290308371,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLLWD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760880",
         "date": "2025-11-14T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Sudan",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760409",
         "date": "2025-11-18T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Ivory Coast",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870465",
         "date": "2026-06-05T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Indonesia",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401874917",
         "date": "2026-06-07T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Mozambique",
         "venue": "home",
         "gf": 4,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401922489",
         "date": "2026-09-23T14:30Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Iraq",
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
     },
     "away": {
      "key": "saudi-arabia",
      "espn_id": "655",
      "name": "Saudi Arabia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1657.9944285886704,
         "half_width_95": 36.71107866901266,
         "interval": [
          1621.2833499196577,
          1694.7055072576832
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 39.80699461637233,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.17390419495557946,
         "half_width_95": 0.4288367958806336,
         "interval": [
          -0.25493260092505415,
          0.6027409908362131
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4284373512743613,
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
         "rank": 1,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.23132855789626755,
         "half_width_95": 0.5401924604381242,
         "interval": [
          -0.30886390254185664,
          0.7715210183343917
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5314581568527432,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DDLDW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401871362",
         "date": "2026-06-09T23:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Senegal",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760429",
         "date": "2026-06-15T22:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Uruguay",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760453",
         "date": "2026-06-21T16:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Spain",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760478",
         "date": "2026-06-27T00:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Cape Verde",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "401922490",
         "date": "2026-09-23T18:00Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Kuwait",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "332344",
       "date": "2011-11-15T16:30:00Z",
       "home": "Saudi Arabia",
       "away": "Oman",
       "home_score": 0,
       "away_score": 0,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "611297",
       "date": "2021-09-07T16:00:00Z",
       "home": "Oman",
       "away": "Saudi Arabia",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "611267",
       "date": "2022-01-27T17:15:00Z",
       "home": "Saudi Arabia",
       "away": "Oman",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "668930",
       "date": "2024-01-16T17:30:00Z",
       "home": "Saudi Arabia",
       "away": "Oman",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "728859",
       "date": "2024-12-31T14:30:00Z",
       "home": "Oman",
       "away": "Saudi Arabia",
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
      "away": 3
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "728859",
      "date": "2024-12-31T14:30:00Z",
      "home": "Oman",
      "away": "Saudi Arabia",
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
       "team": "Oman",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Saudi Arabia",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "no_series",
     "status_words": "no Kalshi series lists this competition"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 86.8,
     "favourite_side": "away",
     "home_minus_away": -86.8,
     "components": {
      "elo": {
       "home": 1636.2,
       "away": 1658
      },
      "raw_gap_home_minus_away": -21.8,
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
   "league": "gulfcup",
   "column": "gulfcup",
   "columns": [
    "gulfcup"
   ],
   "home": "Yemen",
   "away": "Qatar",
   "favourite": "Qatar",
   "opponent": "Yemen",
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
    "Yemen": "espn_id",
    "Qatar": "espn_id"
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
    "home": "gulfcup",
    "away": "gulfcup"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "no Kalshi series lists this competition, so there is no settlement rule to state.",
   "ranks": {
    "fav": 5,
    "opp": 8
   },
   "rates": {
    "ppg": [
     3,
     0
    ],
    "gf": [
     2,
     0
    ],
    "ga": [
     0,
     4
    ],
    "gdg": [
     2,
     -4
    ]
   },
   "own_gdg": {
    "diff": 6,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
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
    "ovr": 3,
    "atk": 4,
    "def": -1
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "gulfcup",
    "clubs": {
     "fav": "Qatar",
     "opp": "Yemen"
    },
    "size": 8,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 5,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1576.808722462974,
       "half_width_95": 40.16310545526456,
       "interval": [
        1536.6456170077095,
        1616.9718279182384
       ]
      },
      "opp": {
       "rank": 8,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1374.9151454290184,
       "half_width_95": 9.587622779634948,
       "interval": [
        1365.3275226493834,
        1384.5027682086534
       ]
      },
      "tier_gap": 3,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 42.63067502038822,
       "opp": 15.812943765739291
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 2,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.2099351208921672,
       "half_width_95": 0.41628861869474065,
       "interval": [
        -0.20635349780257345,
        0.6262237395869079
       ]
      },
      "opp": {
       "rank": 8,
       "tier": 5,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.22726014852411533,
       "half_width_95": 0.6561335199672176,
       "interval": [
        -0.8833936684913329,
        0.4288733714431022
       ]
      },
      "tier_gap": 4,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4310268575406786,
       "opp": 0.693183488503132
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
       "rank": 7,
       "tier": 5,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.47702839448652645,
       "half_width_95": 0.374928338354574,
       "interval": [
        -0.8519567328411004,
        -0.10210005613195244
       ]
      },
      "opp": {
       "rank": 6,
       "tier": 4,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3417994139488666,
       "half_width_95": 0.7408196467230355,
       "interval": [
        -1.082619060671902,
        0.39902023277416887
       ]
      },
      "tier_gap": -1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3742439290806598,
       "opp": 0.7633915331053439
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
     }
    },
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the 27th Arabian Gulf Cup 2026 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401922495",
   "competition_id": "401922495",
   "kickoff": "2026-09-27T15:00Z",
   "espn": "global.gulf_cup",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "King Abdullah Sport City Stadium",
    "city": "Buraidah",
    "country": "Saudi Arabia"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": null,
   "form": {
    "fav": "DDLLW",
    "opp": "WWWWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "382010",
      "date": "2013-10-13T16:30:00Z",
      "home": "Qatar",
      "away": "Yemen",
      "home_score": 6,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "364942",
      "date": "2013-11-15T12:00:00Z",
      "home": "Yemen",
      "away": "Qatar",
      "home_score": 1,
      "away_score": 4,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 0,
     "draw": 0,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "364942",
     "date": "2013-11-15T12:00:00Z",
     "home": "Yemen",
     "away": "Qatar",
     "home_score": 1,
     "away_score": 4,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "gulfcup",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group B",
    "leg": null,
    "status_detail": "Sun, September 27th at 11:00 AM EDT",
    "venue_country": "Saudi Arabia",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "yemen",
      "espn_id": "6014",
      "name": "Yemen",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 8,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1374.9151454290184,
         "half_width_95": 9.587622779634948,
         "interval": [
          1365.3275226493834,
          1384.5027682086534
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 15.812943765739291,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 8,
         "tier": 5,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.22726014852411533,
         "half_width_95": 0.6561335199672176,
         "interval": [
          -0.8833936684913329,
          0.4288733714431022
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.693183488503132,
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
         "rank": 6,
         "tier": 4,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3417994139488666,
         "half_width_95": 0.7408196467230355,
         "interval": [
          -1.082619060671902,
          0.39902023277416887
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.7633915331053439,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WWWWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "726060",
         "date": "2025-10-09T08:00Z",
         "competition": "AFC Asian Cup Qualifiers",
         "kind": "competitive",
         "opponent": "Brunei Darussalam",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "726062",
         "date": "2025-10-14T17:30Z",
         "competition": "AFC Asian Cup Qualifiers",
         "kind": "competitive",
         "opponent": "Brunei Darussalam",
         "venue": "home",
         "gf": 9,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "726065",
         "date": "2025-11-18T14:30Z",
         "competition": "AFC Asian Cup Qualifiers",
         "kind": "competitive",
         "opponent": "Bhutan",
         "venue": "home",
         "gf": 7,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "726066",
         "date": "2026-06-04T16:00Z",
         "competition": "AFC Asian Cup Qualifiers",
         "kind": "competitive",
         "opponent": "Lebanon",
         "venue": "away",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401922491",
         "date": "2026-09-24T15:55Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "United Arab Emirates",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        }
       ],
       "friendlies": 0,
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      }
     },
     "away": {
      "key": "qatar",
      "espn_id": "4398",
      "name": "Qatar",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 5,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1576.808722462974,
         "half_width_95": 40.16310545526456,
         "interval": [
          1536.6456170077095,
          1616.9718279182384
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 42.63067502038822,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 2,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.2099351208921672,
         "half_width_95": 0.41628861869474065,
         "interval": [
          -0.20635349780257345,
          0.6262237395869079
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4310268575406786,
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
         "rank": 7,
         "tier": 5,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.47702839448652645,
         "half_width_95": 0.374928338354574,
         "interval": [
          -0.8519567328411004,
          -0.10210005613195244
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3742439290806598,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "DDLLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401870103",
         "date": "2026-06-06T20:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "El Salvador",
         "venue": "home",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760420",
         "date": "2026-06-13T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Switzerland",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760440",
         "date": "2026-06-18T22:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Canada",
         "venue": "away",
         "gf": 0,
         "ga": 6,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760462",
         "date": "2026-06-24T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Bosnia-Herzegovina",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401922492",
         "date": "2026-09-24T18:00Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Bahrain",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
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
     "available": true,
     "source": "seasonseries",
     "meetings": [
      {
       "event_id": "382010",
       "date": "2013-10-13T16:30:00Z",
       "home": "Qatar",
       "away": "Yemen",
       "home_score": 6,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "364942",
       "date": "2013-11-15T12:00:00Z",
       "home": "Yemen",
       "away": "Qatar",
       "home_score": 1,
       "away_score": 4,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 0,
      "draw": 0,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "364942",
      "date": "2013-11-15T12:00:00Z",
      "home": "Yemen",
      "away": "Qatar",
      "home_score": 1,
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
       "team": "Yemen",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "Qatar",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "no_series",
     "status_words": "no Kalshi series lists this competition"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 201.9,
     "favourite_side": "away",
     "home_minus_away": -201.9,
     "components": {
      "elo": {
       "home": 1374.9,
       "away": 1576.8
      },
      "raw_gap_home_minus_away": -201.9,
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
   "league": "gulfcup",
   "column": "gulfcup",
   "columns": [
    "gulfcup"
   ],
   "home": "Bahrain",
   "away": "United Arab Emirates",
   "favourite": "United Arab Emirates",
   "opponent": "Bahrain",
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
    "Bahrain": "espn_id",
    "United Arab Emirates": "espn_id"
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
    "home": "gulfcup",
    "away": "gulfcup"
   },
   "table_notes": {
    "home": null,
    "away": null
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "reg_time_note": "no Kalshi series lists this competition, so there is no settlement rule to state.",
   "ranks": {
    "fav": 4,
    "opp": 6
   },
   "rates": {
    "ppg": [
     3,
     0
    ],
    "gf": [
     4,
     0
    ],
    "ga": [
     0,
     2
    ],
    "gdg": [
     4,
     -2
    ]
   },
   "own_gdg": {
    "diff": 6,
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record."
   },
   "tiers": {
    "ovr": [
     2,
     3
    ],
    "atk": [
     1,
     4
    ],
    "def": [
     2,
     3
    ]
   },
   "tier_gaps": {
    "ovr": 1,
    "atk": 3,
    "def": 1
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "gulfcup",
    "clubs": {
     "fav": "United Arab Emirates",
     "opp": "Bahrain"
    },
    "size": 8,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 4,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1617.4152981706052,
       "half_width_95": 14.418657083424481,
       "interval": [
        1602.9966410871807,
        1631.8339552540297
       ]
      },
      "opp": {
       "rank": 6,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1512.5519471425227,
       "half_width_95": 43.09722724576387,
       "interval": [
        1469.454719896759,
        1555.6491743882866
       ]
      },
      "tier_gap": 1,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 19.64293220580716,
       "opp": 47.5217771538513
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 1,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.24135064877840628,
       "half_width_95": 0.39939616096404496,
       "interval": [
        -0.15804551218563867,
        0.6407468097424512
       ]
      },
      "opp": {
       "rank": 6,
       "tier": 4,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.12398685376929836,
       "half_width_95": 0.5338999268857431,
       "interval": [
        -0.6578867806550415,
        0.4099130731164447
       ]
      },
      "tier_gap": 3,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.4085223214639938,
       "opp": 0.5508685690781437
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
       "rank": 3,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.07220210197783572,
       "half_width_95": 0.3334366075400537,
       "interval": [
        -0.261234505562218,
        0.40563870951788944
       ]
      },
      "opp": {
       "rank": 4,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.08356688431991086,
       "half_width_95": 0.3989232408601995,
       "interval": [
        -0.48249012518011036,
        0.3153563565402886
       ]
      },
      "tier_gap": 1,
      "unit": "log_goals",
      "label": "defence",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 8,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.3598030442326053,
       "opp": 0.409557810366731
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
    "shape": "CLEAN",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the 27th Arabian Gulf Cup 2026 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401922496",
   "competition_id": "401922496",
   "kickoff": "2026-09-27T18:00Z",
   "espn": "global.gulf_cup",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Prince Abdullah Al-Faisal Stadium",
    "city": "Jeddah",
    "country": "Saudi Arabia"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": null,
   "form": {
    "fav": "WLDLW",
    "opp": "LLLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "522431",
      "date": "2019-01-05T16:00:00Z",
      "home": "United Arab Emirates",
      "away": "Bahrain",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "588074",
      "date": "2020-11-16T14:00:00Z",
      "home": "United Arab Emirates",
      "away": "Bahrain",
      "home_score": 1,
      "away_score": 3,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "687468",
      "date": "2023-11-21T15:45:00Z",
      "home": "Bahrain",
      "away": "United Arab Emirates",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "687472",
      "date": "2024-06-11T17:00:00Z",
      "home": "United Arab Emirates",
      "away": "Bahrain",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "758162",
      "date": "2025-09-08T16:30:00Z",
      "home": "United Arab Emirates",
      "away": "Bahrain",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 1,
     "draw": 2,
     "away": 2
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "758162",
     "date": "2025-09-08T16:30:00Z",
     "home": "United Arab Emirates",
     "away": "Bahrain",
     "home_score": 1,
     "away_score": 0,
     "completed": true,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "espn_reason": null
   },
   "national": {
    "competition": "gulfcup",
    "stage": "group-stage",
    "stage_kind": "group",
    "group": "Group B",
    "leg": null,
    "status_detail": "Sun, September 27th at 2:00 PM EDT",
    "venue_country": "Saudi Arabia",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "bahrain",
      "espn_id": "4381",
      "name": "Bahrain",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 6,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1512.5519471425227,
         "half_width_95": 43.09722724576387,
         "interval": [
          1469.454719896759,
          1555.6491743882866
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 47.5217771538513,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 6,
         "tier": 4,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.12398685376929836,
         "half_width_95": 0.5338999268857431,
         "interval": [
          -0.6578867806550415,
          0.4099130731164447
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5508685690781437,
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
         "rank": 4,
         "tier": 3,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.08356688431991086,
         "half_width_95": 0.3989232408601995,
         "interval": [
          -0.48249012518011036,
          0.3153563565402886
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.409557810366731,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "LLLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "758162",
         "date": "2025-09-08T16:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "United Arab Emirates",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "758972",
         "date": "2025-10-09T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Morocco",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760892",
         "date": "2025-11-17T15:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Somalia",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401870001",
         "date": "2026-06-05T16:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Georgia",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401922492",
         "date": "2026-09-24T18:00Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Qatar",
         "venue": "away",
         "gf": 0,
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
      "key": "united-arab-emirates",
      "espn_id": "4397",
      "name": "United Arab Emirates",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "gulfcup",
       "axes": {
        "ovr": {
         "rank": 4,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1617.4152981706052,
         "half_width_95": 14.418657083424481,
         "interval": [
          1602.9966410871807,
          1631.8339552540297
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 19.64293220580716,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 1,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.24135064877840628,
         "half_width_95": 0.39939616096404496,
         "interval": [
          -0.15804551218563867,
          0.6407468097424512
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4085223214639938,
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
         "rank": 3,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.07220210197783572,
         "half_width_95": 0.3334366075400537,
         "interval": [
          -0.261234505562218,
          0.40563870951788944
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3598030442326053,
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
        }
       },
       "axes_absent": []
      },
      "form": {
       "available": true,
       "letters": "WLDLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "753694",
         "date": "2025-10-11T17:15Z",
         "competition": "FIFA World Cup Qualifying - AFC",
         "kind": "competitive",
         "opponent": "Oman",
         "venue": "home",
         "gf": 2,
         "ga": 1,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "753695",
         "date": "2025-10-14T17:00Z",
         "competition": "FIFA World Cup Qualifying - AFC",
         "kind": "competitive",
         "opponent": "Qatar",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760045",
         "date": "2025-11-13T16:00Z",
         "competition": "FIFA World Cup Qualifying - AFC",
         "kind": "competitive",
         "opponent": "Iraq",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760046",
         "date": "2025-11-18T16:00Z",
         "competition": "FIFA World Cup Qualifying - AFC",
         "kind": "competitive",
         "opponent": "Iraq",
         "venue": "away",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401922491",
         "date": "2026-09-24T15:55Z",
         "competition": "Arabian Gulf Cup",
         "kind": "competitive",
         "opponent": "Yemen",
         "venue": "home",
         "gf": 4,
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
       "event_id": "522431",
       "date": "2019-01-05T16:00:00Z",
       "home": "United Arab Emirates",
       "away": "Bahrain",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "588074",
       "date": "2020-11-16T14:00:00Z",
       "home": "United Arab Emirates",
       "away": "Bahrain",
       "home_score": 1,
       "away_score": 3,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "687468",
       "date": "2023-11-21T15:45:00Z",
       "home": "Bahrain",
       "away": "United Arab Emirates",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "687472",
       "date": "2024-06-11T17:00:00Z",
       "home": "United Arab Emirates",
       "away": "Bahrain",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "758162",
       "date": "2025-09-08T16:30:00Z",
       "home": "United Arab Emirates",
       "away": "Bahrain",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 1,
      "draw": 2,
      "away": 2
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "758162",
      "date": "2025-09-08T16:30:00Z",
      "home": "United Arab Emirates",
      "away": "Bahrain",
      "home_score": 1,
      "away_score": 0,
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
       "team": "Bahrain",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      },
      "away": {
       "team": "United Arab Emirates",
       "formation": null,
       "announced": false,
       "starters": [],
       "bench": 0
      }
     },
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff"
    },
    "market": {
     "status": "no_series",
     "status_words": "no Kalshi series lists this competition"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 104.9,
     "favourite_side": "away",
     "home_minus_away": -104.9,
     "components": {
      "elo": {
       "home": 1512.6,
       "away": 1617.4
      },
      "raw_gap_home_minus_away": -104.9,
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
   "home": "Sudan",
   "away": "Ethiopia",
   "favourite": "Sudan",
   "opponent": "Ethiopia",
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
    "Sudan": "espn_id",
    "Ethiopia": "espn_id"
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
    "fav": 29,
    "opp": 39
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
     4,
     4
    ],
    "def": [
     2,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 0,
    "atk": 0,
    "def": 2
   },
   "shape": "SPLIT",
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "Sudan",
     "opp": "Ethiopia"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 29,
       "tier": 4,
       "tier_set": [
        4
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1488.8389999273309,
       "half_width_95": 21.66095736672097,
       "interval": [
        1467.1780425606098,
        1510.499957294052
       ]
      },
      "opp": {
       "rank": 39,
       "tier": 4,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1437.4451791672777,
       "half_width_95": 11.543354190820677,
       "interval": [
        1425.901824976457,
        1448.9885333580985
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
       "fav": 26.458322910450285,
       "opp": 16.640863623341254
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 40,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.31945293064561114,
       "half_width_95": 0.4928338794429354,
       "interval": [
        -0.8122868100885465,
        0.17338094879732424
       ]
      },
      "opp": {
       "rank": 35,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.17371252884524618,
       "half_width_95": 0.6211205672760898,
       "interval": [
        -0.7948330961213359,
        0.4474080384308436
       ]
      },
      "tier_gap": 0,
      "unit": "log_goals",
      "label": "attack",
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "field_size": 47,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 0.5009863278680532,
       "opp": 0.6209141629902005
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
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
       "rank": 10,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.4078201727699746,
       "half_width_95": 0.40144317032236465,
       "interval": [
        0.00637700244760997,
        0.8092633430923393
       ]
      },
      "opp": {
       "rank": 35,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.1816128914679166,
       "half_width_95": 0.37921662838610243,
       "interval": [
        -0.560829519854019,
        0.19760373691818583
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
       "fav": 0.4224091090924641,
       "opp": 0.4055227999377138
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
    "shape": "SPLIT",
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920041",
   "competition_id": "401920041",
   "kickoff": "2026-09-25T13:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Juba National Stadium",
    "city": "Juba National Stadium",
    "country": "South Sudan"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
    "ticker": "KXAFCONGAME-26SEP25SDNETH-SDN",
    "ask_c": 51,
    "bid_c": 50,
    "spread_c": 1,
    "ask_size": 860,
    "bid_size": 19,
    "flags": []
   },
   "form": {
    "fav": "LLWLL",
    "opp": "LWWWD",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "625990",
      "date": "2021-12-30T14:30:00Z",
      "home": "Sudan",
      "away": "Ethiopia",
      "home_score": 2,
      "away_score": 3,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "654039",
      "date": "2022-09-23T13:00:00Z",
      "home": "Ethiopia",
      "away": "Sudan",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "654048",
      "date": "2022-09-26T13:00:00Z",
      "home": "Ethiopia",
      "away": "Sudan",
      "home_score": 2,
      "away_score": 2,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "723248",
      "date": "2024-12-22T14:00:00Z",
      "home": "Ethiopia",
      "away": "Sudan",
      "home_score": 0,
      "away_score": 2,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "723249",
      "date": "2024-12-25T14:00:00Z",
      "home": "Sudan",
      "away": "Ethiopia",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 2,
     "draw": 2,
     "away": 1
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "723249",
     "date": "2024-12-25T14:00:00Z",
     "home": "Sudan",
     "away": "Ethiopia",
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
    "group": "Group J",
    "leg": null,
    "status_detail": "Fri, September 25th at 9:00 AM EDT",
    "venue_country": "South Sudan",
    "neutral_provider_flag": false,
    "neutral": true,
    "teams": {
     "home": {
      "key": "sudan",
      "espn_id": "4319",
      "name": "Sudan",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 29,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1488.8389999273309,
         "half_width_95": 21.66095736672097,
         "interval": [
          1467.1780425606098,
          1510.499957294052
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 26.458322910450285,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 40,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.31945293064561114,
         "half_width_95": 0.4928338794429354,
         "interval": [
          -0.8122868100885465,
          0.17338094879732424
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5009863278680532,
         "signal_source": "shots",
         "signal": "shots",
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
         "rank": 10,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.4078201727699746,
         "half_width_95": 0.40144317032236465,
         "interval": [
          0.00637700244760997,
          0.8092633430923393
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4224091090924641,
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
       "letters": "LLWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "760880",
         "date": "2025-11-14T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Oman",
         "venue": "away",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732143",
         "date": "2025-12-24T15:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Algeria",
         "venue": "away",
         "gf": 0,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732154",
         "date": "2025-12-28T15:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Equatorial Guinea",
         "venue": "away",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "732166",
         "date": "2025-12-31T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Burkina Faso",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732170",
         "date": "2026-01-03T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Senegal",
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
      "key": "ethiopia",
      "espn_id": "5777",
      "name": "Ethiopia",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 39,
         "tier": 4,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1437.4451791672777,
         "half_width_95": 11.543354190820677,
         "interval": [
          1425.901824976457,
          1448.9885333580985
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 16.640863623341254,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 35,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.17371252884524618,
         "half_width_95": 0.6211205672760898,
         "interval": [
          -0.7948330961213359,
          0.4474080384308436
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.6209141629902005,
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
         "rank": 35,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.1816128914679166,
         "half_width_95": 0.37921662838610243,
         "interval": [
          -0.560829519854019,
          0.19760373691818583
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4055227999377138,
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
       "letters": "LWWWD",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "687130",
         "date": "2025-10-12T19:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Burkina Faso",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401850988",
         "date": "2026-03-27T15:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Sao Tome and Principe",
         "venue": "away",
         "gf": 3,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401850991",
         "date": "2026-03-31T13:00Z",
         "competition": "Africa Cup of Nations Qualifying",
         "kind": "competitive",
         "opponent": "Sao Tome and Principe",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401873737",
         "date": "2026-06-06T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Malawi",
         "venue": "home",
         "gf": 1,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "401873738",
         "date": "2026-06-09T15:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Malawi",
         "venue": "home",
         "gf": 1,
         "ga": 1,
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
       "event_id": "625990",
       "date": "2021-12-30T14:30:00Z",
       "home": "Sudan",
       "away": "Ethiopia",
       "home_score": 2,
       "away_score": 3,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "654039",
       "date": "2022-09-23T13:00:00Z",
       "home": "Ethiopia",
       "away": "Sudan",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "654048",
       "date": "2022-09-26T13:00:00Z",
       "home": "Ethiopia",
       "away": "Sudan",
       "home_score": 2,
       "away_score": 2,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "723248",
       "date": "2024-12-22T14:00:00Z",
       "home": "Ethiopia",
       "away": "Sudan",
       "home_score": 0,
       "away_score": 2,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "723249",
       "date": "2024-12-25T14:00:00Z",
       "home": "Sudan",
       "away": "Ethiopia",
       "home_score": 2,
       "away_score": 1,
       "completed": true,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 2,
      "draw": 2,
      "away": 1
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "723249",
      "date": "2024-12-25T14:00:00Z",
      "home": "Sudan",
      "away": "Ethiopia",
      "home_score": 2,
      "away_score": 1,
      "completed": true,
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     "espn_reason": null
    },
    "lineups": {
     "announced": true,
     "sides": {
      "home": {
       "team": "Sudan",
       "formation": "4-4-2",
       "announced": true,
       "starters": [
        {
         "name": "Mohamed Mustafa",
         "jersey": "99",
         "position": "G"
        },
        {
         "name": "Mustafa Karshoum",
         "jersey": "98",
         "position": "CD-L"
        },
        {
         "name": "Abdel Rahman Koko",
         "jersey": "97",
         "position": "CD-R"
        },
        {
         "name": "Bakhit Khamis",
         "jersey": "95",
         "position": "LB"
        },
        {
         "name": "Sheddy Barglan",
         "jersey": "96",
         "position": "RB"
        },
        {
         "name": "Walieldin Khidir",
         "jersey": "92",
         "position": "CM-L"
        },
        {
         "name": "Ammar Taifour",
         "jersey": "94",
         "position": "CM-R"
        },
        {
         "name": "Abdel Raouf",
         "jersey": "93",
         "position": "LM"
        },
        {
         "name": "Aamir Abdallah",
         "jersey": "89",
         "position": "RM"
        },
        {
         "name": "Musa Hussien",
         "jersey": "90",
         "position": "CF-L"
        },
        {
         "name": "Mohamed Eisa",
         "jersey": "91",
         "position": "CF-R"
        }
       ],
       "bench": 0
      },
      "away": {
       "team": "Ethiopia",
       "formation": "4-4-2",
       "announced": true,
       "starters": [
        {
         "name": "Abubeker Nura",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Yared Bayeh",
         "jersey": "16",
         "position": "CD-L"
        },
        {
         "name": "Samuel Yohannes Sheferaw",
         "jersey": "14",
         "position": "CD-R"
        },
        {
         "name": "Bereket Samuel",
         "jersey": "15",
         "position": "LB"
        },
        {
         "name": "Birhanu Bekele",
         "jersey": "4",
         "position": "RB"
        },
        {
         "name": "Habtamu Tekeste",
         "jersey": "21",
         "position": "CM-L"
        },
        {
         "name": "Gatoch Panom",
         "jersey": "6",
         "position": "CM-R"
        },
        {
         "name": "Chernet Gugsa",
         "jersey": "19",
         "position": "LM"
        },
        {
         "name": "Mesfin Tafesse",
         "jersey": "9",
         "position": "RM"
        },
        {
         "name": "Kenean Markneh",
         "jersey": "8",
         "position": "CF-L"
        },
        {
         "name": "Abel Yalew",
         "jersey": "10",
         "position": "CF-R"
        }
       ],
       "bench": 12
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Sudan vs Ethiopia",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "ticker": "KXAFCONGAME-26SEP25SDNETH-SDN",
       "ask_c": 51,
       "bid_c": 50,
       "spread_c": 1,
       "ask_size": 860,
       "bid_size": 19,
       "flags": [],
       "name": "Sudan"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "ticker": "KXAFCONGAME-26SEP25SDNETH-TIE",
       "ask_c": 30,
       "bid_c": 29,
       "spread_c": 1,
       "ask_size": 595,
       "bid_size": 231,
       "flags": []
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "ticker": "KXAFCONGAME-26SEP25SDNETH-ETH",
       "ask_c": 22,
       "bid_c": 20,
       "spread_c": 2,
       "ask_size": 223,
       "bid_size": 189,
       "flags": [],
       "name": "Ethiopia"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 51.4,
     "favourite_side": "home",
     "home_minus_away": 51.4,
     "components": {
      "elo": {
       "home": 1488.8,
       "away": 1437.4
      },
      "raw_gap_home_minus_away": 51.4,
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
   "home": "Mozambique",
   "away": "Senegal",
   "favourite": "Senegal",
   "opponent": "Mozambique",
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
    "Mozambique": "espn_id",
    "Senegal": "espn_id"
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
    "fav": 3,
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
     1,
     4
    ],
    "atk": [
     1,
     3
    ],
    "def": [
     2,
     4
    ]
   },
   "tier_gaps": {
    "ovr": 3,
    "atk": 2,
    "def": 2
   },
   "shape": "CLEAN",
   "current_only": null,
   "field": {
    "competition": "afconq",
    "clubs": {
     "fav": "Senegal",
     "opp": "Mozambique"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 3,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1782.3371459599107,
       "half_width_95": 39.121396173450705,
       "interval": [
        1743.21574978646,
        1821.4585421333613
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
       "value": 1488.6053743298103,
       "half_width_95": 17.881467733660056,
       "interval": [
        1470.7239065961503,
        1506.4868420634702
       ]
      },
      "tier_gap": 3,
      "unit": "elo",
      "label": "overall",
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "field_size": 48,
      "band": "within_confederation",
      "half_width_95_cross_confederation": {
       "fav": 41.7154209938172,
       "opp": 21.897618356744648
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 1,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.833775579763548,
       "half_width_95": 0.36519970004046254,
       "interval": [
        0.46857587972308545,
        1.1989752798040105
       ]
      },
      "opp": {
       "rank": 23,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.06371697011364293,
       "half_width_95": 0.29515807950940065,
       "interval": [
        -0.23144110939575774,
        0.35887504962304356
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
       "fav": 0.35940107097021534,
       "opp": 0.3067158996174966
      },
      "signal_source": "shots",
      "signal": {
       "fav": "shots",
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
       "rank": 7,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "value": 0.5954937057498368,
       "half_width_95": 0.40490421963386963,
       "interval": [
        0.1905894861159672,
        1.0003979253837065
       ]
      },
      "opp": {
       "rank": 42,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.3537451391394191,
       "half_width_95": 0.37781775497549325,
       "interval": [
        -0.7315628941149124,
        0.024072615836074174
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
       "fav": 0.4156524819941224,
       "opp": 0.3924767564765812
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
   "event_id": "401920048",
   "competition_id": "401920048",
   "kickoff": "2026-09-25T13:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Estádio do Zimpeto",
    "city": "Maputo",
    "country": "Mozambique"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
    "ticker": "KXAFCONGAME-26SEP25MOZSEN-SEN",
    "ask_c": 83,
    "bid_c": 82,
    "spread_c": 1,
    "ask_size": 1991,
    "bid_size": 591,
    "flags": []
   },
   "form": {
    "fav": "DLLWL",
    "opp": "WLLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "source": "seasonseries",
    "meetings": [
     {
      "event_id": "613391",
      "date": "2021-07-09T13:00:00Z",
      "home": "Senegal",
      "away": "Mozambique",
      "home_score": 1,
      "away_score": 0,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "649360",
      "date": "2022-07-17T13:30:00Z",
      "home": "Mozambique",
      "away": "Senegal",
      "home_score": 1,
      "away_score": 1,
      "completed": true,
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "634731",
      "date": "2023-03-24T19:00:00Z",
      "home": "Senegal",
      "away": "Mozambique",
      "home_score": 5,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "event_id": "634745",
      "date": "2023-03-28T16:00:00Z",
      "home": "Mozambique",
      "away": "Senegal",
      "home_score": 0,
      "away_score": 1,
      "completed": true,
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "tally": {
     "home": 0,
     "draw": 1,
     "away": 3
    },
    "reason": null,
    "window": null,
    "last_meeting": {
     "event_id": "634745",
     "date": "2023-03-28T16:00:00Z",
     "home": "Mozambique",
     "away": "Senegal",
     "home_score": 0,
     "away_score": 1,
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
    "group": "Group J",
    "leg": null,
    "status_detail": "Fri, September 25th at 9:00 AM EDT",
    "venue_country": "Mozambique",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "mozambique",
      "espn_id": "8939",
      "name": "Mozambique",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 30,
         "tier": 4,
         "tier_set": [
          4
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1488.6053743298103,
         "half_width_95": 17.881467733660056,
         "interval": [
          1470.7239065961503,
          1506.4868420634702
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 21.897618356744648,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 23,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.06371697011364293,
         "half_width_95": 0.29515807950940065,
         "interval": [
          -0.23144110939575774,
          0.35887504962304356
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3067158996174966,
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
         "rank": 42,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.3537451391394191,
         "half_width_95": 0.37781775497549325,
         "interval": [
          -0.7315628941149124,
          0.024072615836074174
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.3924767564765812,
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
       "letters": "WLLLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "732156",
         "date": "2025-12-28T12:30Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Gabon",
         "venue": "away",
         "gf": 3,
         "ga": 2,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "732168",
         "date": "2025-12-31T19:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Cameroon",
         "venue": "home",
         "gf": 1,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "732174",
         "date": "2026-01-05T19:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Nigeria",
         "venue": "away",
         "gf": 0,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401874917",
         "date": "2026-06-07T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Oman",
         "venue": "away",
         "gf": 1,
         "ga": 4,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401873677",
         "date": "2026-06-09T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Indonesia",
         "venue": "away",
         "gf": 0,
         "ga": 1,
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
      "key": "senegal",
      "espn_id": "654",
      "name": "Senegal",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 3,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1782.3371459599107,
         "half_width_95": 39.121396173450705,
         "interval": [
          1743.21574978646,
          1821.4585421333613
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 41.7154209938172,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 1,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.833775579763548,
         "half_width_95": 0.36519970004046254,
         "interval": [
          0.46857587972308545,
          1.1989752798040105
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.35940107097021534,
         "signal_source": "shots",
         "signal": "shots",
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
         "rank": 7,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.5954937057498368,
         "half_width_95": 0.40490421963386963,
         "interval": [
          0.1905894861159672,
          1.0003979253837065
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.4156524819941224,
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
       "letters": "DLLWL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "401871362",
         "date": "2026-06-09T23:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Saudi Arabia",
         "venue": "away",
         "gf": 0,
         "ga": 0,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "760432",
         "date": "2026-06-16T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "France",
         "venue": "away",
         "gf": 1,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760454",
         "date": "2026-06-23T00:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Norway",
         "venue": "away",
         "gf": 2,
         "ga": 3,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "760474",
         "date": "2026-06-26T19:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Iraq",
         "venue": "home",
         "gf": 5,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "760493",
         "date": "2026-07-01T20:00Z",
         "competition": "FIFA World Cup",
         "kind": "competitive",
         "opponent": "Belgium",
         "venue": "away",
         "gf": 2,
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
       "event_id": "613391",
       "date": "2021-07-09T13:00:00Z",
       "home": "Senegal",
       "away": "Mozambique",
       "home_score": 1,
       "away_score": 0,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "649360",
       "date": "2022-07-17T13:30:00Z",
       "home": "Mozambique",
       "away": "Senegal",
       "home_score": 1,
       "away_score": 1,
       "completed": true,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "634731",
       "date": "2023-03-24T19:00:00Z",
       "home": "Senegal",
       "away": "Mozambique",
       "home_score": 5,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "event_id": "634745",
       "date": "2023-03-28T16:00:00Z",
       "home": "Mozambique",
       "away": "Senegal",
       "home_score": 0,
       "away_score": 1,
       "completed": true,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "tally": {
      "home": 0,
      "draw": 1,
      "away": 3
     },
     "reason": null,
     "window": null,
     "last_meeting": {
      "event_id": "634745",
      "date": "2023-03-28T16:00:00Z",
      "home": "Mozambique",
      "away": "Senegal",
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
       "team": "Mozambique",
       "formation": "4-2-3-1",
       "announced": true,
       "starters": [
        {
         "name": "Ernani",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Edmilson Dove",
         "jersey": "8",
         "position": "CD-L"
        },
        {
         "name": "Bruno Wilson",
         "jersey": "15",
         "position": "CD-R"
        },
        {
         "name": "Bruno Langa",
         "jersey": "5",
         "position": "LB"
        },
        {
         "name": "Bhéu",
         "jersey": "2",
         "position": "RB"
        },
        {
         "name": "Gildo",
         "jersey": "18",
         "position": "AM"
        },
        {
         "name": "Alfons Amade",
         "jersey": "16",
         "position": "LM"
        },
        {
         "name": "Guima",
         "jersey": "21",
         "position": "RM"
        },
        {
         "name": "Faisal Bangal",
         "jersey": "9",
         "position": "F"
        },
        {
         "name": "Witi",
         "jersey": "19",
         "position": "AM-L"
        },
        {
         "name": "Geny Catamo",
         "jersey": "10",
         "position": "AM-R"
        }
       ],
       "bench": 11
      },
      "away": {
       "team": "Senegal",
       "formation": "4-2-2-2",
       "announced": true,
       "starters": [
        {
         "name": "Yehvann Diouf",
         "jersey": "1",
         "position": "G"
        },
        {
         "name": "Moussa Niakhaté",
         "jersey": "19",
         "position": "CD-L"
        },
        {
         "name": "Sadibou Sané",
         "jersey": "4",
         "position": "CD-R"
        },
        {
         "name": "El Hadji Malick Diouf",
         "jersey": "25",
         "position": "LB"
        },
        {
         "name": "Lamine Sy",
         "jersey": "6",
         "position": "RB"
        },
        {
         "name": "Pape Gueye",
         "jersey": "26",
         "position": "CM-L"
        },
        {
         "name": "Lamine Camara",
         "jersey": "8",
         "position": "CM-R"
        },
        {
         "name": "Nicolas Jackson",
         "jersey": "11",
         "position": "CF-L"
        },
        {
         "name": "Abdallah Sima",
         "jersey": "21",
         "position": "CF-R"
        },
        {
         "name": "Assane Diao",
         "jersey": "7",
         "position": "AM-L"
        },
        {
         "name": "Pape Matar Sarr",
         "jersey": "17",
         "position": "AM-R"
        }
       ],
       "bench": 12
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Mozambique vs Senegal",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-MOZ",
       "ask_c": 6,
       "bid_c": 4,
       "spread_c": 2,
       "ask_size": 902,
       "bid_size": 1366,
       "flags": [],
       "name": "Mozambique"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-TIE",
       "ask_c": 14,
       "bid_c": 12,
       "spread_c": 2,
       "ask_size": 1448,
       "bid_size": 1394,
       "flags": []
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-SEN",
       "ask_c": 83,
       "bid_c": 82,
       "spread_c": 1,
       "ask_size": 1991,
       "bid_size": 591,
       "flags": [],
       "name": "Senegal"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 228.7,
     "favourite_side": "away",
     "home_minus_away": -228.7,
     "components": {
      "elo": {
       "home": 1488.6,
       "away": 1782.3
      },
      "raw_gap_home_minus_away": -293.7,
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
   "home": "Tanzania",
   "away": "Guinea-Bissau",
   "favourite": "Tanzania",
   "opponent": "Guinea-Bissau",
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
    "Tanzania": "espn_id",
    "Guinea-Bissau": "espn_id"
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
    "fav": 35,
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
     4,
     5
    ],
    "atk": [
     4,
     5
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
    "competition": "afconq",
    "clubs": {
     "fav": "Tanzania",
     "opp": "Guinea-Bissau"
    },
    "size": 48,
    "axes": {
     "ovr": {
      "fav": {
       "rank": 35,
       "tier": 4,
       "tier_set": [
        4,
        5
       ],
       "straddles": true,
       "below_floor": false,
       "value": 1457.0841659549155,
       "half_width_95": 42.54832315480086,
       "interval": [
        1414.5358428001148,
        1499.6324891097163
       ]
      },
      "opp": {
       "rank": 42,
       "tier": 5,
       "tier_set": [
        5
       ],
       "straddles": false,
       "below_floor": false,
       "value": 1416.530174608247,
       "half_width_95": 4.057212360329627,
       "interval": [
        1412.4729622479174,
        1420.5873869685768
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
       "fav": 45.05388888595683,
       "opp": 11.689392113353952
      },
      "signal_source": "elo"
     },
     "atk": {
      "fav": {
       "rank": 39,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.31269978698240847,
       "half_width_95": 0.5233412767292562,
       "interval": [
        -0.8360410637116646,
        0.21064148974684777
       ]
      },
      "opp": {
       "rank": 42,
       "tier": 5,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.45552956969999764,
       "half_width_95": 0.51181970105091,
       "interval": [
        -0.9673492707509077,
        0.056290131350912376
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
       "fav": 0.5275180014771509,
       "opp": 0.5289582892711413
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
         2
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
       "value": 0.13591668874253923,
       "half_width_95": 0.35893140205082025,
       "interval": [
        -0.22301471330828102,
        0.49484809079335945
       ]
      },
      "opp": {
       "rank": 37,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "value": -0.22524812512962228,
       "half_width_95": 0.40895573985625044,
       "interval": [
        -0.6342038649858728,
        0.18370761472662817
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
       "fav": 0.38180193986124344,
       "opp": 0.42427005199893936
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
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus 5a2e1ce9c011, variant 'all', Elo pinned at 5 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals, measured from shots (xG, else shots on target, else goals, per match).",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence."
   },
   "event_id": "401920049",
   "competition_id": "401920049",
   "kickoff": "2026-09-25T13:00Z",
   "espn": "caf.nations_qual",
   "state": "pre",
   "in_play": false,
   "venue": {
    "name": "Amaan Stadium",
    "city": "Amaan Stadium",
    "country": "Tanzania"
   },
   "venue_class": {
    "class": "TRUE_HOME",
    "home_side": "home"
   },
   "kalshi": {
    "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
    "ticker": "KXAFCONGAME-26SEP25TANGBS-TAN",
    "ask_c": 41,
    "bid_c": 40,
    "spread_c": 1,
    "ask_size": 53,
    "bid_size": 192,
    "flags": [
     "THIN"
    ]
   },
   "form": {
    "fav": "DDLLW",
    "opp": "LDWLL",
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
    "group": "Group L",
    "leg": null,
    "status_detail": "Fri, September 25th at 9:00 AM EDT",
    "venue_country": "Tanzania",
    "neutral_provider_flag": false,
    "neutral": false,
    "teams": {
     "home": {
      "key": "tanzania",
      "espn_id": "5778",
      "name": "Tanzania",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 35,
         "tier": 4,
         "tier_set": [
          4,
          5
         ],
         "straddles": true,
         "below_floor": false,
         "value": 1457.0841659549155,
         "half_width_95": 42.54832315480086,
         "interval": [
          1414.5358428001148,
          1499.6324891097163
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 45.05388888595683,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 39,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.31269978698240847,
         "half_width_95": 0.5233412767292562,
         "interval": [
          -0.8360410637116646,
          0.21064148974684777
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5275180014771509,
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
         "rank": 21,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "straddles": true,
         "below_floor": true,
         "value": 0.13591668874253923,
         "half_width_95": 0.35893140205082025,
         "interval": [
          -0.22301471330828102,
          0.49484809079335945
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.38180193986124344,
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
       "letters": "DDLLW",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "732151",
         "date": "2025-12-27T17:30Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Uganda",
         "venue": "away",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "732163",
         "date": "2025-12-30T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Tunisia",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "732171",
         "date": "2026-01-04T16:00Z",
         "competition": "Africa Cup of Nations",
         "kind": "competitive",
         "opponent": "Morocco",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401862357",
         "date": "2026-03-26T14:30Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Liechtenstein",
         "venue": "home",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "401866730",
         "date": "2026-03-29T13:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Macau",
         "venue": "away",
         "gf": 6,
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
     },
     "away": {
      "key": "guinea-bissau",
      "espn_id": "8602",
      "name": "Guinea-Bissau",
      "rating": {
       "available": true,
       "source": "src.picker.national_team_axes",
       "competition": "afconq",
       "axes": {
        "ovr": {
         "rank": 42,
         "tier": 5,
         "tier_set": [
          5
         ],
         "straddles": false,
         "below_floor": false,
         "value": 1416.530174608247,
         "half_width_95": 4.057212360329627,
         "interval": [
          1412.4729622479174,
          1420.5873869685768
         ],
         "unit": "elo",
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 11.689392113353952,
         "signal_source": "elo"
        },
        "atk": {
         "rank": 42,
         "tier": 5,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.45552956969999764,
         "half_width_95": 0.51181970105091,
         "interval": [
          -0.9673492707509077,
          0.056290131350912376
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.5289582892711413,
         "signal_source": "shots",
         "signal": "goals",
         "licensed": {
          "bands": 2,
          "below_floor": true,
          "failing_condition": "G3",
          "tier": 2,
          "tier_set": [
           2
          ],
          "straddles": false
         }
        },
        "def": {
         "rank": 37,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "straddles": true,
         "below_floor": true,
         "value": -0.22524812512962228,
         "half_width_95": 0.40895573985625044,
         "interval": [
          -0.6342038649858728,
          0.18370761472662817
         ],
         "unit": "log_goals",
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "band": "within_confederation",
         "half_width_95_cross_confederation": 0.42427005199893936,
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
       "letters": "LDWLL",
       "disputed": 0,
       "withheld": 0,
       "games": [
        {
         "event_id": "736117",
         "date": "2025-06-09T19:00Z",
         "competition": "International Friendly",
         "kind": "friendly",
         "opponent": "Gabon",
         "venue": "home",
         "gf": 0,
         "ga": 2,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "687134",
         "date": "2025-09-04T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Sierra Leone",
         "venue": "home",
         "gf": 1,
         "ga": 1,
         "letter": "D",
         "provider_letter": "D",
         "provider_agrees": true
        },
        {
         "event_id": "687135",
         "date": "2025-09-08T16:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Djibouti",
         "venue": "home",
         "gf": 2,
         "ga": 0,
         "letter": "W",
         "provider_letter": "W",
         "provider_agrees": true
        },
        {
         "event_id": "687136",
         "date": "2025-10-08T13:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Ethiopia",
         "venue": "away",
         "gf": 0,
         "ga": 1,
         "letter": "L",
         "provider_letter": "L",
         "provider_agrees": true
        },
        {
         "event_id": "687122",
         "date": "2025-10-12T19:00Z",
         "competition": "FIFA World Cup Qualifying - CAF",
         "kind": "competitive",
         "opponent": "Egypt",
         "venue": "away",
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
     "announced": true,
     "sides": {
      "home": {
       "team": "Tanzania",
       "formation": "4-3-3",
       "announced": true,
       "starters": [
        {
         "name": "Zuberi Masudi",
         "jersey": "28",
         "position": "G"
        },
        {
         "name": "Ibrahim Hamad",
         "jersey": "4",
         "position": "CD-L"
        },
        {
         "name": "Bakari Mwamnyeto",
         "jersey": "14",
         "position": "CD-R"
        },
        {
         "name": "Mohamed Hussein",
         "jersey": "15",
         "position": "LB"
        },
        {
         "name": "Haji Mnoga",
         "jersey": "25",
         "position": "RB"
        },
        {
         "name": "Himid Mao",
         "jersey": "7",
         "position": "CM"
        },
        {
         "name": "Feisal Salum",
         "jersey": "6",
         "position": "LM"
        },
        {
         "name": "Charles M'Mombwa",
         "jersey": "8",
         "position": "RM"
        },
        {
         "name": "Selemani Mwalimu",
         "jersey": "19",
         "position": "F"
        },
        {
         "name": "Simon Msuva",
         "jersey": "12",
         "position": "LF"
        },
        {
         "name": "Denis Kibu",
         "jersey": "11",
         "position": "RF"
        }
       ],
       "bench": 12
      },
      "away": {
       "team": "Guinea-Bissau",
       "formation": "4-4-2",
       "announced": true,
       "starters": [
        {
         "name": "Fernando Embadja",
         "jersey": "23",
         "position": "G"
        },
        {
         "name": "Víctor Rofino",
         "jersey": "2",
         "position": "CD-L"
        },
        {
         "name": "Opa Sanganté",
         "jersey": "22",
         "position": "CD-R"
        },
        {
         "name": "Iano Imbene",
         "jersey": "5",
         "position": "LB"
        },
        {
         "name": "Jefferson Encada",
         "jersey": "15",
         "position": "RB"
        },
        {
         "name": "Renato Nhaga",
         "jersey": "19",
         "position": "CM-L"
        },
        {
         "name": "Ronaldo Vieira",
         "jersey": "11",
         "position": "CM-R"
        },
        {
         "name": "Mama Baldé",
         "jersey": "17",
         "position": "LM"
        },
        {
         "name": "Dálcio",
         "jersey": "7",
         "position": "RM"
        },
        {
         "name": "Beto",
         "jersey": "9",
         "position": "CF-L"
        },
        {
         "name": "Franculino Djú",
         "jersey": "10",
         "position": "CF-R"
        }
       ],
       "bench": 12
      }
     },
     "reason": null
    },
    "market": {
     "status": "mapped",
     "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Tanzania vs Guinea-Bissau",
     "legs": {
      "home": {
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "ticker": "KXAFCONGAME-26SEP25TANGBS-TAN",
       "ask_c": 41,
       "bid_c": 40,
       "spread_c": 1,
       "ask_size": 53,
       "bid_size": 192,
       "flags": [
        "THIN"
       ],
       "name": "Tanzania"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "ticker": "KXAFCONGAME-26SEP25TANGBS-TIE",
       "ask_c": 34,
       "bid_c": 33,
       "spread_c": 1,
       "ask_size": 543,
       "bid_size": 1258,
       "flags": []
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "ticker": "KXAFCONGAME-26SEP25TANGBS-GBS",
       "ask_c": 26,
       "bid_c": 25,
       "spread_c": 1,
       "ask_size": 36,
       "bid_size": 2209,
       "flags": [
        "THIN"
       ],
       "name": "Guinea-Bissau"
      }
     },
     "orientation": "same"
    },
    "headline": {
     "candidate": "b",
     "label": "ELO GAP",
     "unit": "Elo points",
     "value": 105.6,
     "favourite_side": "home",
     "home_minus_away": 105.6,
     "components": {
      "elo": {
       "home": 1457.1,
       "away": 1416.5
      },
      "raw_gap_home_minus_away": 40.6,
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
    "ask_c": 67,
    "bid_c": 66,
    "spread_c": 1,
    "ask_size": 282,
    "bid_size": 7173,
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
       "ask_c": 67,
       "bid_c": 66,
       "spread_c": 1,
       "ask_size": 282,
       "bid_size": 7173,
       "flags": [],
       "name": "Kenya"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "ticker": "KXAFCONGAME-26SEP26KENERI-TIE",
       "ask_c": 22,
       "bid_c": 21,
       "spread_c": 1,
       "ask_size": 14,
       "bid_size": 466,
       "flags": [
        "THIN"
       ]
      },
      "away": {
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "ticker": "KXAFCONGAME-26SEP26KENERI-ERI",
       "ask_c": 10,
       "bid_c": 9,
       "spread_c": 1,
       "ask_size": 762,
       "bid_size": 418,
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
       "ask_c": 70,
       "bid_c": 10,
       "spread_c": 60,
       "ask_size": 54,
       "bid_size": 1,
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Eritrea"
      },
      "tie": {
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-TIE",
       "ask_c": 69,
       "bid_c": 6,
       "spread_c": 63,
       "ask_size": 5,
       "bid_size": 700,
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
 "off_board": [],
 "off_board_counts": {
  "kicked_off": 0,
  "finished": 0,
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
       "espn_id": "455",
       "name": "Greece",
       "key": "greece",
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
       "espn_id": "481",
       "name": "Germany",
       "key": "germany",
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
       "espn_id": "449",
       "name": "Netherlands",
       "key": "netherlands",
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
       "espn_id": "6757",
       "name": "Serbia",
       "key": "serbia",
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
       "espn_id": "464",
       "name": "Norway",
       "key": "norway",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 3,
       "ga": 2,
       "gd": 1,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "482",
       "name": "Portugal",
       "key": "portugal",
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
       "espn_id": "479",
       "name": "Denmark",
       "key": "denmark",
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
       "espn_id": "578",
       "name": "Wales",
       "key": "wales",
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
       "espn_id": "18272",
       "name": "Kosovo",
       "key": "kosovo",
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
       "espn_id": "476",
       "name": "Republic of Ireland",
       "key": "republic-of-ireland",
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
       "espn_id": "461",
       "name": "Israel",
       "key": "israel",
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
       "espn_id": "453",
       "name": "Malta",
       "key": "malta",
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
       "position": 2
      },
      {
       "espn_id": "587",
       "name": "Andorra",
       "key": "andorra",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 1,
       "ga": 2,
       "gd": -1,
       "pts": 0,
       "position": 3
      }
     ],
     "Group D2": [
      {
       "espn_id": "460",
       "name": "Lithuania",
       "key": "lithuania",
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
       "position": 2
      },
      {
       "espn_id": "589",
       "name": "Liechtenstein",
       "key": "liechtenstein",
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
       "position": null
      },
      {
       "espn_id": "2643",
       "name": "Bermuda",
       "key": "bermuda",
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
       "espn_id": "7657",
       "name": "Guadeloupe",
       "key": "guadeloupe",
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
       "position": null
      }
     ],
     "League B, Group C": [
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
       "position": null
      },
      {
       "espn_id": "2647",
       "name": "Cuba",
       "key": "cuba",
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
       "espn_id": "2651",
       "name": "Grenada",
       "key": "grenada",
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
       "position": null
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
  "gulfcup": {
   "structure": {
    "stages": [
     {
      "key": "group-stage",
      "label": "Group stage (2 groups of 4)",
      "kind": "group",
      "dates": "23-30 Sep 2026",
      "on_provider": true
     },
     {
      "key": "semifinals",
      "label": "Semi-finals",
      "kind": "knockout",
      "dates": "3 Oct 2026",
      "on_provider": false
     },
     {
      "key": "final",
      "label": "Final",
      "kind": "knockout",
      "dates": "6 Oct 2026",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A": [
      {
       "espn_id": "655",
       "name": "Saudi Arabia",
       "key": "saudi-arabia",
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
       "espn_id": "4375",
       "name": "Iraq",
       "key": "iraq",
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
       "espn_id": "2841",
       "name": "Oman",
       "key": "oman",
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
       "espn_id": "841",
       "name": "Kuwait",
       "key": "kuwait",
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
     "Group B": [
      {
       "espn_id": "4397",
       "name": "United Arab Emirates",
       "key": "united-arab-emirates",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 4,
       "ga": 0,
       "gd": 4,
       "pts": 3,
       "position": 1
      },
      {
       "espn_id": "4398",
       "name": "Qatar",
       "key": "qatar",
       "gp": 1,
       "w": 1,
       "d": 0,
       "l": 0,
       "gf": 2,
       "ga": 0,
       "gd": 2,
       "pts": 3,
       "position": 2
      },
      {
       "espn_id": "4381",
       "name": "Bahrain",
       "key": "bahrain",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 2,
       "gd": -2,
       "pts": 0,
       "position": 3
      },
      {
       "espn_id": "6014",
       "name": "Yemen",
       "key": "yemen",
       "gp": 1,
       "w": 0,
       "d": 0,
       "l": 1,
       "gf": 0,
       "ga": 4,
       "gd": -4,
       "pts": 0,
       "position": 4
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   },
   "teams": {
    "saudi-arabia": {
     "name": "Saudi Arabia",
     "espn_id": "655",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401922494",
      "kickoff": "2026-09-26T18:00Z",
      "opponent": "Oman"
     }
    },
    "iraq": {
     "name": "Iraq",
     "espn_id": "4375",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401922493",
      "kickoff": "2026-09-26T15:00Z",
      "opponent": "Kuwait"
     }
    },
    "oman": {
     "name": "Oman",
     "espn_id": "2841",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401922494",
      "kickoff": "2026-09-26T18:00Z",
      "opponent": "Saudi Arabia"
     }
    },
    "kuwait": {
     "name": "Kuwait",
     "espn_id": "841",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401922493",
      "kickoff": "2026-09-26T15:00Z",
      "opponent": "Iraq"
     }
    },
    "united-arab-emirates": {
     "name": "United Arab Emirates",
     "espn_id": "4397",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401922496",
      "kickoff": "2026-09-27T18:00Z",
      "opponent": "Bahrain"
     }
    },
    "qatar": {
     "name": "Qatar",
     "espn_id": "4398",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401922495",
      "kickoff": "2026-09-27T15:00Z",
      "opponent": "Yemen"
     }
    },
    "bahrain": {
     "name": "Bahrain",
     "espn_id": "4381",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401922496",
      "kickoff": "2026-09-27T18:00Z",
      "opponent": "United Arab Emirates"
     }
    },
    "yemen": {
     "name": "Yemen",
     "espn_id": "6014",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401922495",
      "kickoff": "2026-09-27T15:00Z",
      "opponent": "Qatar"
     }
    }
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
       "espn_id": "4231",
       "name": "Gabon",
       "key": "gabon",
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
       "espn_id": "6640",
       "name": "Lesotho",
       "key": "lesotho",
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
       "espn_id": "2869",
       "name": "Morocco",
       "key": "morocco",
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
       "espn_id": "8937",
       "name": "Niger",
       "key": "niger",
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
     "Group B": [
      {
       "espn_id": "653",
       "name": "Angola",
       "key": "angola",
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
       "espn_id": "2620",
       "name": "Egypt",
       "key": "egypt",
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
       "espn_id": "4325",
       "name": "Malawi",
       "key": "malawi",
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
       "espn_id": "14075",
       "name": "South Sudan",
       "key": "south-sudan",
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
       "espn_id": "5776",
       "name": "Somalia",
       "key": "somalia",
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
       "espn_id": "2845",
       "name": "Burkina Faso",
       "key": "burkina-faso",
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
       "espn_id": "5779",
       "name": "Burundi",
       "key": "burundi",
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
       "espn_id": "4356",
       "name": "Togo",
       "key": "togo",
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
       "espn_id": "4277",
       "name": "Zambia",
       "key": "zambia",
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
     "Group J": [
      {
       "espn_id": "5777",
       "name": "Ethiopia",
       "key": "ethiopia",
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
       "espn_id": "8939",
       "name": "Mozambique",
       "key": "mozambique",
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
       "espn_id": "654",
       "name": "Senegal",
       "key": "senegal",
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
       "espn_id": "4319",
       "name": "Sudan",
       "key": "sudan",
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
     "Group K": [
      {
       "espn_id": "2597",
       "name": "Cape Verde",
       "key": "cape-verde",
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
       "espn_id": "4205",
       "name": "Liberia",
       "key": "liberia",
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
       "espn_id": "2849",
       "name": "Mali",
       "key": "mali",
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
       "espn_id": "2851",
       "name": "Rwanda",
       "key": "rwanda",
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
     "Group L": [
      {
       "espn_id": "8602",
       "name": "Guinea-Bissau",
       "key": "guinea-bissau",
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
       "espn_id": "5533",
       "name": "Madagascar",
       "key": "madagascar",
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
       "espn_id": "657",
       "name": "Nigeria",
       "key": "nigeria",
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
       "espn_id": "5778",
       "name": "Tanzania",
       "key": "tanzania",
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

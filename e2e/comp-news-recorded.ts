/* LEAGUES CUP FIXTURES CARRYING EVERY TEAM-NEWS STATE, RECORDED — not
 * off a brief (2026-09-28).
 *
 * THE ENVELOPE AND THE ROWS are `GET /api/comp/leagues-cup/fixtures` as the
 * backend's pre-kickoff capture saved it on 2026-08-06T22:26:21Z
 * (backend research_archive/pre_kickoff/leagues-cup-2026-08-06T2226Z.json,
 * written by scripts/capture_pre_kickoff.py). The four keys that tool adds
 * and the route does not — captured_at, captured_by,
 * captured_at_is_the_witness, capture_summary — are removed. TRIMMED to six
 * rows; `count` and `with_strength_read` are recomputed for the six so the
 * envelope agrees with itself. Every other key, value and absence is the
 * wire's.
 *
 * THE `news` BLOCK on each row is `team_news.fixture_news()` — the function
 * src/competitions.py attaches for fixtures inside 48h — and each state
 * came out of the backend's own code, never typed here:
 *
 *   1530122 New York City FC v Santos Laguna — `empty`, exactly as captured.
 *   1530121 Cruz Azul v Philadelphia Union — `plane_dormant`: fixture_news() with
 *           LIVE_DATABASE_URL unset (the block has `availability`, and
 *           no `absences` key at all).
 *   1530120 Chicago Fire v Necaxa — `unavailable`: capture_absences()
 *           with no API-Football key, so `_apif_get` refused before the
 *           wire; `record_count` is null, not 0.
 *   1530119 Austin v Club Tijuana — `never_captured`: fixture_news() on
 *           a fixture with no capture row.
 *   1530123 Portland Timbers v Puebla — a RETRACTION: capture_absences()
 *           replayed twice (two players, then one) from the provider items
 *           rebuilt out of the recorded rows below, so J. Thiare carries
 *           `still_reported: false`.
 *   1535054 Club America v San Diego — `ok`, SEVEN distinct players: the
 *           production read of fixture 1490427 on 2026-08-30 (backend
 *           research_archive/apif_pro_topup_2026-08-30/prod_news_probe/
 *           news_fixture_1490427.json), byte for byte. Its `fixture_ref` is
 *           therefore 1490427 — the page reads no `fixture_ref`.
 *
 * The generated states ran against a throwaway SQLite live plane on
 * backend a69f15b2; nothing reached a provider or this project's API. */
export const COMP_NEWS_KEY = "leagues-cup";

/** Each row's fixture id, by the team-news state its block carries. */
export const NEWS_ROW = {
 "empty": 1530122,
 "dormant": 1530121,
 "unavailable": 1530120,
 "never_captured": 1530119,
 "retraction": 1530123,
 "ok": 1535054
} as const;

export const COMP_NEWS_FIXTURES = {
 "competition": "leagues-cup",
 "display": "Leagues Cup",
 "apif_league_id": 772,
 "season": 2026,
 "accent": "#facc15",
 "fixtures": [
  {
   "fixture_id": 1530122,
   "kickoff_utc": "2026-08-06T23:30:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "Sports Illustrated Stadium",
   "venue_city": null,
   "home": {
    "apif_team_id": 1604,
    "name": "New York City FC",
    "crest": "https://media.api-sports.io/football/teams/1604.png"
   },
   "away": {
    "apif_team_id": 2285,
    "name": "Santos Laguna",
    "crest": "https://media.api-sports.io/football/teams/2285.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "New York City FC",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1248.0,
     "provider_id": "vZraQYnO",
     "provider_rank": 536,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "Santos Laguna",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1090.0,
     "provider_id": "EBPEFrRQ",
     "provider_rank": 1315,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.6471,
     "away": 0.3529
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": 158.0,
    "elo_difference": 158.0
   },
   "news": {
    "fixture_ref": "1530122",
    "generated_at": "2026-08-06T22:26:22.174950+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "absences": {
     "provider": "apifootball",
     "records": [],
     "record_count": 0,
     "stored_records": 0,
     "freshness": {
      "state": "empty",
      "raw_state": "empty",
      "captured_at": "2026-08-06T22:12:50.692205+00:00",
      "age_seconds": 811.5,
      "stale": false,
      "stale_after_seconds": 21600,
      "means": "the provider answered with an empty list. This is not a claim that the list is truly empty"
     },
     "note": null,
     "_empty_is_not_nobody_injured": "An empty or absent list means the provider listed no one. It is NOT evidence that no player is unavailable.",
     "_record_count_vs_stored_records": "record_count is the RAW length of the provider's array; stored_records is the number of DISTINCT players. They differ because API-Football duplicates rows: on MLS fixture 1490361 it returned 26 records for 13 players, each listed exactly twice (measured 2026-07-30). The raw count is kept so the duplication stays visible instead of being silently absorbed — reporting 26 absences there would double-count every player."
    },
    "lineup": {
     "by_provider": {
      "espn": {
       "sides": {
        "away": {
         "team_name": "Santos",
         "formation": null,
         "named_count": 0,
         "starter_count": 0,
         "lineup_state": "not_released",
         "released": false,
         "container_present": true,
         "first_released_at": null,
         "released_minutes_before_kickoff": null,
         "captured_at": "2026-08-06T22:12:56.796366+00:00"
        },
        "home": {
         "team_name": "New York City FC",
         "formation": null,
         "named_count": 0,
         "starter_count": 0,
         "lineup_state": "not_released",
         "released": false,
         "container_present": true,
         "first_released_at": null,
         "released_minutes_before_kickoff": null,
         "captured_at": "2026-08-06T22:12:56.796366+00:00"
        }
       },
       "freshness": {
        "state": "ok",
        "raw_state": "ok",
        "captured_at": "2026-08-06T22:12:56.821152+00:00",
        "age_seconds": 805.4,
        "stale": false,
        "stale_after_seconds": 1200,
        "means": "a real read, inside this feed's tolerance"
       },
       "note": null
      }
     },
     "_states": {
      "released": "a full XI exists and is named",
      "not_released": "a roster container exists with no XI in it. NOT an absence claim, NOT 'no players are playing'",
      "no_coverage": "this provider carries no roster for this fixture at all"
     },
     "_unreleased_licenses_nothing": "Before a lineup is released the only honest statement is 'not yet released'. An absent XI is never a claim that anyone is out.",
     "_first_released_at_is_an_upper_bound": "first_released_at is when WE FIRST OBSERVED a full XI, not when the provider published it. Neither provider timestamps a lineup, so the error is bounded by the polling interval and always makes a release look later than it was."
    },
    "events": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 120,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null
    }
   },
   "weather": {
    "available": false,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "reason": "no_venue_city",
    "means": "the fixture feed carries no venue city, so there is nowhere to look up",
    "city_basis": "fixture venue 'Sports Illustrated Stadium' differs from the registered ground 'Yankee Stadium' — a neutral site or a renamed stadium, undecidable from here; refusing a possibly-wrong city"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.6471,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.4967,
     "tie": 0.3009,
     "away": 0.2024,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.72,
    "market_vig": 0.0,
    "market_legs": {
     "New York City": 0.62,
     "Santos Laguna": 0.18,
     "Tie": 0.2
    },
    "market_three_way": {
     "home": {
      "club": "New York City FC",
      "label": "New York City",
      "p": 0.62
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.2
     },
     "away": {
      "club": "Santos Laguna",
      "label": "Santos Laguna",
      "p": 0.18
     }
    },
    "market_share_by_side": {
     "home": 0.72,
     "away": 0.28,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": -0.0729,
    "direction": "read_lower_on_home",
    "pick": {
     "has_pick": false,
     "reason": "sources_disagree",
     "our_side": "New York City FC",
     "market_side": "New York City FC",
     "disagreement": -0.0729,
     "reasoning": "the strength read favours New York City FC while the market prices New York City FC at 72%. No side is named. Our read beats a coin flip only narrowly (Brier 0.1892 vs 0.1973) and the market's own accuracy here is unmeasured, so a gap is more likely our error than a mispricing.",
     "what_would_change_this": "measuring the market's pre-match accuracy on friendlies from captured pre-kickoff books. Settled books cannot answer it — their prices have already converged to the result."
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06NYCSLA"
  },
  {
   "fixture_id": 1530121,
   "kickoff_utc": "2026-08-07T00:00:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "Subaru Park",
   "venue_city": null,
   "home": {
    "apif_team_id": 2295,
    "name": "Cruz Azul",
    "crest": "https://media.api-sports.io/football/teams/2295.png"
   },
   "away": {
    "apif_team_id": 1599,
    "name": "Philadelphia Union",
    "crest": "https://media.api-sports.io/football/teams/1599.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "Cruz Azul",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1448.0,
     "provider_id": "G8PFBMll",
     "provider_rank": 140,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "Philadelphia Union",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1254.0,
     "provider_id": "Szrwix67",
     "provider_rank": 515,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.678,
     "away": 0.322
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": 194.0,
    "elo_difference": 194.0
   },
   "news": {
    "fixture_ref": "1530121",
    "generated_at": "2026-09-29T06:21:55.409618+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "availability": {
     "state": "plane_dormant",
     "feed": "all",
     "stored": 0,
     "means": "the live plane is not ready, so nothing was fetched or stored. This is not an empty result"
    }
   },
   "weather": {
    "available": false,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "reason": "no_venue_city",
    "means": "the fixture feed carries no venue city, so there is nowhere to look up",
    "city_basis": "fixture venue 'Subaru Park' differs from the registered ground 'Estadio Azteca' — a neutral site or a renamed stadium, undecidable from here; refusing a possibly-wrong city"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.678,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.5276,
     "tie": 0.3009,
     "away": 0.1715,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.5198,
    "market_vig": 0.01,
    "market_legs": {
     "Cruz Azul": 0.396,
     "Philadelphia": 0.3564,
     "Tie": 0.2475
    },
    "market_three_way": {
     "home": {
      "club": "Cruz Azul",
      "label": "Cruz Azul",
      "p": 0.396
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.2475
     },
     "away": {
      "club": "Philadelphia Union",
      "label": "Philadelphia",
      "p": 0.3564
     }
    },
    "market_share_by_side": {
     "home": 0.5198,
     "away": 0.4802,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": 0.1583,
    "direction": "read_higher_on_home",
    "pick": {
     "has_pick": false,
     "reason": "sources_disagree",
     "our_side": "Cruz Azul",
     "market_side": "Cruz Azul",
     "disagreement": 0.1583,
     "reasoning": "the strength read favours Cruz Azul while the market prices Cruz Azul at 52%. No side is named. Our read beats a coin flip only narrowly (Brier 0.1892 vs 0.1973) and the market's own accuracy here is unmeasured, so a gap is more likely our error than a mispricing.",
     "what_would_change_this": "measuring the market's pre-match accuracy on friendlies from captured pre-kickoff books. Settled books cannot answer it — their prices have already converged to the result."
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06CRAPHI"
  },
  {
   "fixture_id": 1530120,
   "kickoff_utc": "2026-08-07T00:30:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "SeatGeek Stadium",
   "venue_city": null,
   "home": {
    "apif_team_id": 1607,
    "name": "Chicago Fire",
    "crest": "https://media.api-sports.io/football/teams/1607.png"
   },
   "away": {
    "apif_team_id": 2288,
    "name": "Necaxa",
    "crest": "https://media.api-sports.io/football/teams/2288.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "Chicago Fire",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1119.0,
     "provider_id": "UwAwNo2E",
     "provider_rank": 1115,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "Necaxa",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1153.0,
     "provider_id": "nw32pOQD",
     "provider_rank": 936,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.4674,
     "away": 0.5326
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": -34.0,
    "elo_difference": -34.0
   },
   "news": {
    "fixture_ref": "1530120",
    "generated_at": "2026-09-29T06:21:55.510330+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "absences": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "unavailable",
      "raw_state": "unavailable",
      "captured_at": "2026-09-29T06:21:55.480425+00:00",
      "age_seconds": 0.0,
      "stale": false,
      "stale_after_seconds": 21600,
      "means": "the last fetch did not succeed; the truth is UNKNOWN, not empty"
     },
     "note": "no API-Football key (env API_FOOTBALL_KEY unset)",
     "_empty_is_not_nobody_injured": "An empty or absent list means the provider listed no one. It is NOT evidence that no player is unavailable.",
     "_record_count_vs_stored_records": "record_count is the RAW length of the provider's array; stored_records is the number of DISTINCT players. They differ because API-Football duplicates rows: on MLS fixture 1490361 it returned 26 records for 13 players, each listed exactly twice (measured 2026-07-30). The raw count is kept so the duplication stays visible instead of being silently absorbed — reporting 26 absences there would double-count every player."
    },
    "lineup": {
     "by_provider": {},
     "_states": {
      "released": "a full XI exists and is named",
      "not_released": "a roster container exists with no XI in it. NOT an absence claim, NOT 'no players are playing'",
      "no_coverage": "this provider carries no roster for this fixture at all"
     },
     "_unreleased_licenses_nothing": "Before a lineup is released the only honest statement is 'not yet released'. An absent XI is never a claim that anyone is out.",
     "_first_released_at_is_an_upper_bound": "first_released_at is when WE FIRST OBSERVED a full XI, not when the provider published it. Neither provider timestamps a lineup, so the error is bounded by the polling interval and always makes a release look later than it was."
    },
    "events": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 120,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null
    }
   },
   "weather": {
    "available": false,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "reason": "no_venue_city",
    "means": "the fixture feed carries no venue city, so there is nowhere to look up",
    "city_basis": "fixture venue 'SeatGeek Stadium' differs from the registered ground 'Soldier Field' — a neutral site or a renamed stadium, undecidable from here; refusing a possibly-wrong city"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.4674,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.3169,
     "tie": 0.3009,
     "away": 0.3821,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.7255,
    "market_vig": 0.02,
    "market_legs": {
     "Chicago Fire": 0.6275,
     "Necaxa": 0.1765,
     "Tie": 0.1961
    },
    "market_three_way": {
     "home": {
      "club": "Chicago Fire",
      "label": "Chicago Fire",
      "p": 0.6275
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.1961
     },
     "away": {
      "club": "Necaxa",
      "label": "Necaxa",
      "p": 0.1765
     }
    },
    "market_share_by_side": {
     "home": 0.7255,
     "away": 0.2745,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": -0.2581,
    "direction": "read_lower_on_home",
    "pick": {
     "has_pick": false,
     "reason": "sources_disagree",
     "our_side": "Necaxa",
     "market_side": "Chicago Fire",
     "disagreement": -0.2581,
     "reasoning": "the strength read favours Necaxa while the market prices Chicago Fire at 73%. No side is named. Our read beats a coin flip only narrowly (Brier 0.1892 vs 0.1973) and the market's own accuracy here is unmeasured, so a gap is more likely our error than a mispricing.",
     "what_would_change_this": "measuring the market's pre-match accuracy on friendlies from captured pre-kickoff books. Settled books cannot answer it — their prices have already converged to the result."
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06CHINCX"
  },
  {
   "fixture_id": 1530119,
   "kickoff_utc": "2026-08-07T01:00:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "Q2 Stadium",
   "venue_city": null,
   "home": {
    "apif_team_id": 16489,
    "name": "Austin",
    "crest": "https://media.api-sports.io/football/teams/16489.png"
   },
   "away": {
    "apif_team_id": 2280,
    "name": "Club Tijuana",
    "crest": "https://media.api-sports.io/football/teams/2280.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "Austin",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1123.0,
     "provider_id": "IeT6JBE3",
     "provider_rank": 1087,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "Club Tijuana",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1184.0,
     "provider_id": "nuNVeQkr",
     "provider_rank": 784,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.4417,
     "away": 0.5583
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": -61.0,
    "elo_difference": -61.0
   },
   "news": {
    "fixture_ref": "1530119",
    "generated_at": "2026-09-29T06:21:55.516429+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "absences": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 21600,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null,
     "_empty_is_not_nobody_injured": "An empty or absent list means the provider listed no one. It is NOT evidence that no player is unavailable.",
     "_record_count_vs_stored_records": "record_count is the RAW length of the provider's array; stored_records is the number of DISTINCT players. They differ because API-Football duplicates rows: on MLS fixture 1490361 it returned 26 records for 13 players, each listed exactly twice (measured 2026-07-30). The raw count is kept so the duplication stays visible instead of being silently absorbed — reporting 26 absences there would double-count every player."
    },
    "lineup": {
     "by_provider": {},
     "_states": {
      "released": "a full XI exists and is named",
      "not_released": "a roster container exists with no XI in it. NOT an absence claim, NOT 'no players are playing'",
      "no_coverage": "this provider carries no roster for this fixture at all"
     },
     "_unreleased_licenses_nothing": "Before a lineup is released the only honest statement is 'not yet released'. An absent XI is never a claim that anyone is out.",
     "_first_released_at_is_an_upper_bound": "first_released_at is when WE FIRST OBSERVED a full XI, not when the provider published it. Neither provider timestamps a lineup, so the error is bounded by the polling interval and always makes a release look later than it was."
    },
    "events": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 120,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null
    }
   },
   "weather": {
    "available": true,
    "place": "Austin, Texas, United States",
    "kickoff_hour_utc": "2026-08-07T01:00",
    "temperature_c": 31.8,
    "precipitation_probability_pct": 2,
    "wind_speed_kmh": 17.4,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "means": "forecast for the kickoff hour at the venue CITY — a context read; no model consumes it",
    "city_basis": "fixture venue matches the home team's registered ground; city from the team record"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.4417,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.2913,
     "tie": 0.3009,
     "away": 0.4079,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.49,
    "market_vig": 0.01,
    "market_legs": {
     "Austin": 0.3564,
     "Tijuana de Caliente": 0.3762,
     "Tie": 0.2673
    },
    "market_three_way": {
     "home": {
      "club": "Austin",
      "label": "Austin",
      "p": 0.3564
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.2673
     },
     "away": {
      "club": "Club Tijuana",
      "label": "Tijuana de Caliente",
      "p": 0.3762
     }
    },
    "market_share_by_side": {
     "home": 0.49,
     "away": 0.51,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": -0.0484,
    "direction": "agree",
    "pick": {
     "has_pick": true,
     "side": "Club Tijuana",
     "confidence": "slight",
     "agreement": "market agrees",
     "draw_probability": 0.2673,
     "draw_note": "the market prices a draw at 27%. That is folded in at HALF weight on both numbers above, because both are points shares. A contract on Club Tijuana pays nothing on a draw, so 27% of outcomes beat this side outright — the points share does not say otherwise, it asks a different question",
     "reasoning": "the strength read makes Club Tijuana the stronger side (56% expected points share) and the market prices it within 5% of the same number. Both sources point the same way, which is the only case this surface names a side.",
     "not_advice": "this is a summary of two numbers agreeing, NOT a bet and NOT a claim of value — when the market agrees with us there is by definition no gap to exploit"
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06ATXTIJ"
  },
  {
   "fixture_id": 1530123,
   "kickoff_utc": "2026-08-07T02:30:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "Providence Park",
   "venue_city": null,
   "home": {
    "apif_team_id": 1617,
    "name": "Portland Timbers",
    "crest": "https://media.api-sports.io/football/teams/1617.png"
   },
   "away": {
    "apif_team_id": 2291,
    "name": "Puebla",
    "crest": "https://media.api-sports.io/football/teams/2291.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "Portland Timbers",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1209.0,
     "provider_id": "bm8usLzB",
     "provider_rank": 671,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "Puebla",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1082.0,
     "provider_id": "pO5ijKm0",
     "provider_rank": 1364,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.6195,
     "away": 0.3805
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": 127.0,
    "elo_difference": 127.0
   },
   "news": {
    "fixture_ref": "1530123",
    "generated_at": "2026-09-29T06:22:17.669629+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "absences": {
     "provider": "apifootball",
     "records": [
      {
       "player_name": "I. Feingold",
       "provider_player_id": "338794",
       "team_name": "New England Revolution",
       "provider_type": "Missing Fixture",
       "provider_reason": "Lower-Body Injury",
       "provider": "apifootball",
       "captured_at": "2026-09-29T06:22:17.667099+00:00",
       "first_seen_at": "2026-09-29T06:22:17.587242+00:00",
       "last_seen_at": "2026-09-29T06:22:17.667099+00:00",
       "still_reported": true
      },
      {
       "player_name": "J. Thiare",
       "provider_player_id": "20705",
       "team_name": "Columbus Crew",
       "provider_type": "Missing Fixture",
       "provider_reason": "Leg Injury",
       "provider": "apifootball",
       "captured_at": "2026-09-29T06:22:17.587242+00:00",
       "first_seen_at": "2026-09-29T06:22:17.587242+00:00",
       "last_seen_at": "2026-09-29T06:22:17.587242+00:00",
       "still_reported": false
      }
     ],
     "record_count": 1,
     "stored_records": 2,
     "freshness": {
      "state": "ok",
      "raw_state": "ok",
      "captured_at": "2026-09-29T06:22:17.667099+00:00",
      "age_seconds": 0.0,
      "stale": false,
      "stale_after_seconds": 21600,
      "means": "a real read, inside this feed's tolerance"
     },
     "note": null,
     "_empty_is_not_nobody_injured": "An empty or absent list means the provider listed no one. It is NOT evidence that no player is unavailable.",
     "_record_count_vs_stored_records": "record_count is the RAW length of the provider's array; stored_records is the number of DISTINCT players. They differ because API-Football duplicates rows: on MLS fixture 1490361 it returned 26 records for 13 players, each listed exactly twice (measured 2026-07-30). The raw count is kept so the duplication stays visible instead of being silently absorbed — reporting 26 absences there would double-count every player."
    },
    "lineup": {
     "by_provider": {},
     "_states": {
      "released": "a full XI exists and is named",
      "not_released": "a roster container exists with no XI in it. NOT an absence claim, NOT 'no players are playing'",
      "no_coverage": "this provider carries no roster for this fixture at all"
     },
     "_unreleased_licenses_nothing": "Before a lineup is released the only honest statement is 'not yet released'. An absent XI is never a claim that anyone is out.",
     "_first_released_at_is_an_upper_bound": "first_released_at is when WE FIRST OBSERVED a full XI, not when the provider published it. Neither provider timestamps a lineup, so the error is bounded by the polling interval and always makes a release look later than it was."
    },
    "events": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 120,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null
    }
   },
   "weather": {
    "available": true,
    "place": "Portland, Oregon, United States",
    "kickoff_hour_utc": "2026-08-07T02:00",
    "temperature_c": 31.0,
    "precipitation_probability_pct": 0,
    "wind_speed_kmh": 10.2,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "means": "forecast for the kickoff hour at the venue CITY — a context read; no model consumes it",
    "city_basis": "fixture venue matches the home team's registered ground; city from the team record"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.6195,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.4691,
     "tie": 0.3009,
     "away": 0.23,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.7304,
    "market_vig": 0.02,
    "market_legs": {
     "Portland": 0.6373,
     "Puebla": 0.1765,
     "Tie": 0.1863
    },
    "market_three_way": {
     "home": {
      "club": "Portland Timbers",
      "label": "Portland",
      "p": 0.6373
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.1863
     },
     "away": {
      "club": "Puebla",
      "label": "Puebla",
      "p": 0.1765
     }
    },
    "market_share_by_side": {
     "home": 0.7304,
     "away": 0.2696,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": -0.1109,
    "direction": "read_lower_on_home",
    "pick": {
     "has_pick": false,
     "reason": "sources_disagree",
     "our_side": "Portland Timbers",
     "market_side": "Portland Timbers",
     "disagreement": -0.1109,
     "reasoning": "the strength read favours Portland Timbers while the market prices Portland Timbers at 73%. No side is named. Our read beats a coin flip only narrowly (Brier 0.1892 vs 0.1973) and the market's own accuracy here is unmeasured, so a gap is more likely our error than a mispricing.",
     "what_would_change_this": "measuring the market's pre-match accuracy on friendlies from captured pre-kickoff books. Settled books cannot answer it — their prices have already converged to the result."
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06PORPUE"
  },
  {
   "fixture_id": 1535054,
   "kickoff_utc": "2026-08-07T02:00:00+00:00",
   "et_date": "26AUG06",
   "status": "NS",
   "status_long": "Not Started",
   "elapsed": null,
   "league_id": 772,
   "league_name": "Leagues Cup",
   "league_season": 2026,
   "is_classified_friendly": false,
   "league_country": "World",
   "round": "Group Stage",
   "venue": "Estadio Banorte",
   "venue_city": "Mexico City",
   "home": {
    "apif_team_id": 2287,
    "name": "Club America",
    "crest": "https://media.api-sports.io/football/teams/2287.png"
   },
   "away": {
    "apif_team_id": 25484,
    "name": "San Diego",
    "crest": "https://media.api-sports.io/football/teams/25484.png"
   },
   "goals": {
    "home": null,
    "away": null
   },
   "strength": {
    "estimate_class": "EXTERNAL_UNEVALUATED",
    "as_of": "2026-08-06",
    "home": {
     "club": "Club America",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1363.0,
     "provider_id": "vyrswtJm",
     "provider_rank": 258,
     "country": "Mexico",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "away": {
     "club": "San Diego",
     "rated": true,
     "source": "worldclubratings",
     "rating": 1127.0,
     "provider_id": "EuGkBf33",
     "provider_rank": 1070,
     "country": "United States",
     "match_tier": "exact",
     "scale": "fifa_adapted_600"
    },
    "available": true,
    "expected_points_share": {
     "home": 0.7121,
     "away": 0.2879
    },
    "source_note": "worldclubratings.com, an adaptation of FIFA's post-2018 ranking procedure to club football (expectation divisor 600, not Elo's 400). Its authors describe it as an experiment on the method's effectiveness rather than an authoritative world ranking.",
    "source": "worldclubratings",
    "expectation_divisor": 600.0,
    "pair_confidence": "both_worldclubratings",
    "pair_confidence_words": "both clubs read from worldclubratings, on its own FIFA-adapted scale (divisor 600). Its authors describe the ranking as an experiment on the method rather than an authoritative world ranking, so treat it as orientation",
    "calibration_scope": "not applied: the shrink was measured on friendlies and this is a competitive fixture — the raw provider expectation is the honest number here",
    "rating_difference": 236.0,
    "elo_difference": 236.0
   },
   "news": {
    "fixture_ref": "1490427",
    "generated_at": "2026-08-30T18:01:16.495527+00:00",
    "_not_a_model_input": "Team news is reader context. No prediction run, no T-10 lock and no paper signal reads any of it; lineup and key-attacker features were measured negative-or-marginal (key-attacker +0.0034, not significant) and are off.",
    "_provider_words": "type and reason are the provider's own strings, stored verbatim. They are that provider's claim, not ours.",
    "absences": {
     "provider": "apifootball",
     "records": [
      {
       "player_name": "I. Feingold",
       "provider_player_id": "338794",
       "team_name": "New England Revolution",
       "provider_type": "Missing Fixture",
       "provider_reason": "Lower-Body Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "J. Thiare",
       "provider_player_id": "20705",
       "team_name": "Columbus Crew",
       "provider_type": "Missing Fixture",
       "provider_reason": "Leg Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "L. Campana",
       "provider_player_id": "2584",
       "team_name": "New England Revolution",
       "provider_type": "Questionable",
       "provider_reason": "Hamstring Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "L. Langoni",
       "provider_player_id": "363393",
       "team_name": "New England Revolution",
       "provider_type": "Missing Fixture",
       "provider_reason": "Lower-Body Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "S. Bangoura",
       "provider_player_id": "357284",
       "team_name": "Columbus Crew",
       "provider_type": "Missing Fixture",
       "provider_reason": "Ankle Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "T. Smith",
       "provider_player_id": "461412",
       "team_name": "New England Revolution",
       "provider_type": "Missing Fixture",
       "provider_reason": "Inactive",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      },
      {
       "player_name": "W. Abou Ali",
       "provider_player_id": "15731",
       "team_name": "Columbus Crew",
       "provider_type": "Missing Fixture",
       "provider_reason": "Knee Injury",
       "provider": "apifootball",
       "captured_at": "2026-08-30T17:53:48.561344+00:00",
       "first_seen_at": "2026-08-30T17:33:50.136468+00:00",
       "last_seen_at": "2026-08-30T17:53:48.561344+00:00",
       "still_reported": true
      }
     ],
     "record_count": 14,
     "stored_records": 7,
     "freshness": {
      "state": "ok",
      "raw_state": "ok",
      "captured_at": "2026-08-30T17:53:48.561344+00:00",
      "age_seconds": 447.9,
      "stale": false,
      "stale_after_seconds": 21600,
      "means": "a real read, inside this feed's tolerance"
     },
     "note": null,
     "_empty_is_not_nobody_injured": "An empty or absent list means the provider listed no one. It is NOT evidence that no player is unavailable.",
     "_record_count_vs_stored_records": "record_count is the RAW length of the provider's array; stored_records is the number of DISTINCT players. They differ because API-Football duplicates rows: on MLS fixture 1490361 it returned 26 records for 13 players, each listed exactly twice (measured 2026-07-30). The raw count is kept so the duplication stays visible instead of being silently absorbed — reporting 26 absences there would double-count every player."
    },
    "lineup": {
     "by_provider": {},
     "_states": {
      "released": "a full XI exists and is named",
      "not_released": "a roster container exists with no XI in it. NOT an absence claim, NOT 'no players are playing'",
      "no_coverage": "this provider carries no roster for this fixture at all"
     },
     "_unreleased_licenses_nothing": "Before a lineup is released the only honest statement is 'not yet released'. An absent XI is never a claim that anyone is out.",
     "_first_released_at_is_an_upper_bound": "first_released_at is when WE FIRST OBSERVED a full XI, not when the provider published it. Neither provider timestamps a lineup, so the error is bounded by the polling interval and always makes a release look later than it was."
    },
    "events": {
     "provider": "apifootball",
     "records": [],
     "record_count": null,
     "stored_records": 0,
     "freshness": {
      "state": "never_captured",
      "captured_at": null,
      "age_seconds": null,
      "stale": null,
      "stale_after_seconds": 120,
      "means": "no capture attempt has been recorded for this feed"
     },
     "note": null
    },
    "resolved_fixture": {
     "fixture_id": null,
     "note": "this reference resolves to no live-plane fixture. Club friendlies have no fixture row by design, so news is keyed on the provider reference alone"
    }
   },
   "weather": {
    "available": true,
    "place": "Mexico City, Mexico City, Mexico",
    "kickoff_hour_utc": "2026-08-07T02:00",
    "temperature_c": 15.8,
    "precipitation_probability_pct": 98,
    "wind_speed_kmh": 8.8,
    "source": "Open-Meteo (open-meteo.com), hourly forecast, kickoff hour",
    "means": "forecast for the kickoff hour at the venue CITY — a context read; no model consumes it",
    "city_basis": "city from the fixture feed"
   },
   "meaning": {
    "round": "Group Stage",
    "stakes": {
     "format": "group phase: top four per league advance to the knockouts; a drawn match goes to a shootout for a bonus point, which the scoreline alone cannot attribute — so a drawn record shows a points RANGE rather than an invented rank",
     "home": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     },
     "away": {
      "played": 0,
      "w": 0,
      "d_shootout": 0,
      "l": 0,
      "points": 0,
      "points_range": null
     }
    }
   },
   "market_vs_read": {
    "available": true,
    "note": "our read minus the market's, on the same scale (expected points share, draws counted as half, market vig removed). A gap is a DISAGREEMENT, not a verified edge: the market's own accuracy on friendlies is unmeasured here, and an exchange with money on it plausibly beats a shrunk external rating.",
    "our_points_share": 0.7121,
    "our_basis": "raw",
    "read_three_way": {
     "home": 0.5616,
     "tie": 0.3009,
     "away": 0.1375,
     "draw_rate_used": 0.3009,
     "clipped": false,
     "basis": "our own draw rate for THIS competition, measured on 216 settled matches across three complete editions (2023-2025, pooled 0.3009, CI [0.2407, 0.3611]) — results only, no rating or book consulted. CONSTANT across fixtures: real draw rates fall on lopsided matches and this number does not know how lopsided a fixture is, so it sits ABOVE the market's Tie leg on favourite-heavy games BY CONSTRUCTION. That gap is our constant's ignorance, never evidence the draw is underpriced. A mismatch-dependent form is untested here and unmeasurable on historical data without leakage; the prospective corpus is where it becomes answerable"
    },
    "market_points_share": 0.7746,
    "market_vig": 0.02,
    "market_legs": {
     "America": 0.6863,
     "San Diego FC": 0.1373,
     "Tie": 0.1765
    },
    "market_three_way": {
     "home": {
      "club": "Club America",
      "label": "America",
      "p": 0.6863
     },
     "tie": {
      "club": "Draw",
      "label": "Tie",
      "p": 0.1765
     },
     "away": {
      "club": "San Diego",
      "label": "San Diego FC",
      "p": 0.1373
     }
    },
    "market_share_by_side": {
     "home": 0.7746,
     "away": 0.2254,
     "means": "expected points share per side, draw counted as half — the SAME quantity as the read, and the only pair on this surface that may be compared directly"
    },
    "read_is_two_way": {
     "has_draw": true,
     "why": "the strength read is an expected POINTS share, draws already counted as half — not a 1X2 split. Neither ratings provider publishes a usable draw probability, so none is shown rather than one invented",
     "comparable_on": "expected points share, which is the one scale both sources genuinely produce"
    },
    "disagreement": -0.0625,
    "direction": "read_lower_on_home",
    "pick": {
     "has_pick": false,
     "reason": "sources_disagree",
     "our_side": "Club America",
     "market_side": "Club America",
     "disagreement": -0.0625,
     "reasoning": "the strength read favours Club America while the market prices Club America at 77%. No side is named. Our read beats a coin flip only narrowly (Brier 0.1892 vs 0.1973) and the market's own accuracy here is unmeasured, so a gap is more likely our error than a mispricing.",
     "what_would_change_this": "measuring the market's pre-match accuracy on friendlies from captured pre-kickoff books. Settled books cannot answer it — their prices have already converged to the result."
    }
   },
   "kalshi_event": "KXLEAGUESCUPGAME-26AUG06AMESD"
  }
 ],
 "count": 6,
 "with_strength_read": 6,
 "finished_hidden": 12,
 "strength_notes": {
  "estimate_class": "EXTERNAL_UNEVALUATED",
  "estimate_meaning": "An EXTERNAL strength read for orientation only. It is not a forecast, not a model output, and establishes nothing about value. It has never been backtested on this platform, holds no approval decision, and sits BELOW the MEASURED / REPLAYED / PILOT evidence classes that every approved model here is judged against. Nothing here is a recommendation."
 },
 "model": {
  "state": "no_model_by_design",
  "why": "every club here IS well-rated — by its own league's model, relative to its own league's mean. Those two scales have no fitted conversion, and this codebase refuses cross-league arithmetic by construction rather than guessing one. A number produced by mixing them would be confident about nothing",
  "instead": "the cross-league strength read is used meanwhile, because a club's strength lives in the league it plays week to week",
  "note": "probed 2026-08-03: 31 tradeable KXLEAGUESCUPGAME events; the MLS fit is scoped to competition_slug='mls-2026', so these cross-league results cannot leak into its ratings"
 },
 "framing": "Fixtures, real Kalshi prices, and an EXTERNAL strength read. No model runs on this surface and no approval decision exists for it, so no model number appears anywhere. Nothing here is a recommendation."
};

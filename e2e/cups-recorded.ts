/* THE CUPS TAB'S BOARD, RECORDED — Champions League rows off the real
 * assembly, not relabelled league rows (AGENTS.md §8: "Relabelled league
 * rows do not exercise the cross-league path").
 *
 * HOW. `api.main._picker_board_assemble("20261013", 10,
 * ["ucl","leaguescup","campeones","eflcup"], capture=False)` run IN
 * PROCESS on backend origin/main 7525d7b9 on 2026-10-12, with
 * `board.assemble_board` forced to capture=False and
 * `snapshots.capture_rows` made to raise — the method of
 * research_archive/board_data_gaps_2026-09-25/record_club_board.py. No
 * request reached /api/picker/board, locally or in production, and nothing
 * was written. Live ESPN, Kalshi and the field were read.
 *
 * TRIMMED, NOTHING ELSE TOUCHED: the first 8 ranked rows (Oct 13 and 14:
 * Lens v Sporting CP, Sabah FK v Slavia Prague, …), the first 2 refusals,
 * the first 4 off-board entries. `model_vs_market` is the wire's: the
 * trader's model store is not reachable from a local assembly, so every
 * row reads `no_model` (`plane_not_ready`) — which is also what the live
 * cards Son screenshotted on Oct 13 showed. `narrowed_to` is the route's,
 * added by the recorder exactly as `picker_board` adds it. */
export const CUPS_RECORDED_CLOCK = "2026-10-13T09:00:00Z";
export const CUPS_RECORDED = {
 "date": "20261013",
 "days": 10,
 "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "folded": {
  "campeones": {
   "clubs": 48,
   "field": {
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "below_floor_clubs": [],
    "competition": "campeones",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads.",
    "passes": "3",
    "size": 48
   },
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 10,
   "off_board": 0,
   "rated_on": [
    "mls",
    "ligamx"
   ],
   "refusals": 0,
   "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
   "src": "current"
  },
  "eflcup": {
   "clubs": 73,
   "field": {
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "below_floor_clubs": [],
    "competition": "eflcup",
    "corpus_sha256": "c7b35fb63ab9ddfefecbd74c291a600dad09d25d809c546eff86a04b9042bfb2",
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads.",
    "passes": "2",
    "size": 94
   },
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "epl"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "epl",
    "championship",
    "leagueone",
    "leaguetwo"
   ],
   "refusals": 0,
   "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix — the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 — better than one in six — finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
   "src": "prior"
  },
  "leaguescup": {
   "clubs": 48,
   "field": {
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "below_floor_clubs": [],
    "competition": "leaguescup",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads.",
    "passes": "3",
    "size": 48
   },
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 10,
   "off_board": 0,
   "rated_on": [
    "mls",
    "ligamx"
   ],
   "refusals": 0,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's Leagues Cup legs settle on 90 minutes plus stoppage — the side labels read \"Reg Time: <club>\" and a level match after 90 resolves the TIE leg, it does not carry to penalties. So \"Toluca 54c\" is Toluca ahead at full time, NOT Toluca through the tie. The four league series settle the match outright; this one does not, and the two must not be read alike.",
   "src": "current"
  }
 },
 "generated_at": "2026-10-13T03:16:11.407078+00:00",
 "leagues": {
  "ucl": {
   "clubs": 196,
   "field": {
    "axes_measured": [
     "ovr",
     "atk",
     "def"
    ],
    "below_floor_clubs": [
     "AEK Athens",
     "Bodo/Glimt",
     "Club Brugge",
     "Fenerbahce",
     "Galatasaray",
     "LASK Linz",
     "Sabah FK",
     "Shakhtar Donetsk",
     "Slavia Prague",
     "Slovan Bratislava",
     "Viking FK"
    ],
    "competition": "ucl",
    "corpus_sha256": "bf58f88facb0378a4e70fd294ba85c96b03521b81720f8b6cc93be349bac5695",
    "passes": "10",
    "served_at": "/api/comp/ucl/ratings",
    "size": 36
   },
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "epl",
     "laliga",
     "bundesliga",
     "seriea",
     "ligue1",
     "eredivisie",
     "primeiraliga",
     "superlig",
     "eliteserien",
     "czechliga",
     "ukrpremier",
     "slovaksuperliga",
     "azerpremyer"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 5,
   "rated_on": [
    "epl",
    "laliga",
    "bundesliga",
    "seriea",
    "ligue1",
    "eredivisie",
    "primeiraliga",
    "superlig",
    "eliteserien",
    "czechliga",
    "ukrpremier",
    "slovaksuperliga",
    "azerpremyer"
   ],
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "src": "prior"
  }
 },
 "narrowed_to": [
  "campeones",
  "eflcup",
  "leaguescup",
  "ucl"
 ],
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
   "admission": null,
   "away": "Lille",
   "club": "Lille",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915417",
   "espn": "uefa.champions",
   "event_id": "401915417",
   "form": {
    "away": "WWLW",
    "home": "WWLW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     },
     "home": {
      "corpus_name": "Arsenal",
      "resolved_by": "exact"
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
   "home": "Arsenal",
   "in_play": false,
   "kalshi": {
    "ask_c": 80,
    "ask_size": 56027,
    "bid_c": 79,
    "bid_size": 105032,
    "event_ticker": "KXUCLGAME-26OCT13ARSLIL",
    "flags": [],
    "side": "Arsenal",
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13ARSLIL-ARS"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "LILL",
     "h": "ARS"
    },
    "market": {
     "a": 0.069307,
     "d": 0.138614,
     "h": 0.792079
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 7,
       "ask_size": 365516,
       "bid_c": 6,
       "bid_size": 27079,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-LIL"
      },
      "d": {
       "ask_c": 14,
       "ask_size": 176875,
       "bid_c": 13,
       "bid_size": 24911,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-TIE"
      },
      "h": {
       "ask_c": 80,
       "ask_size": 56027,
       "bid_c": 79,
       "bid_size": 105032,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-ARS"
      }
     },
     "overround": 1.01,
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
    "club": "Arsenal",
    "ga": 0.756578947368421,
    "gdg": 1.036184210526316,
    "gf": 1.792763157894737,
    "gp_current": 6,
    "of": 17,
    "ppg": 2.3355263157894735,
    "rank": 2,
    "rated": true,
    "rated_in": "epl",
    "resolved_by": "exact",
    "table_club": "Arsenal",
    "table_note": null,
    "weight": 0.375
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
    "city": "London",
    "country": "England",
    "name": "Emirates Stadium"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  },
  {
   "admission": null,
   "away": "Club Brugge",
   "club": "Club Brugge",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915413",
   "espn": "uefa.champions",
   "event_id": "401915413",
   "form": {
    "away": null,
    "home": "WWDW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     },
     "home": {
      "corpus_name": "Inter",
      "resolved_by": "contained"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Club Brugge (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Internazionale",
   "in_play": false,
   "kalshi": {
    "ask_c": 78,
    "ask_size": 114926,
    "bid_c": 77,
    "bid_size": 45375,
    "event_ticker": "KXUCLGAME-26OCT13INTBRU",
    "flags": [],
    "side": "Internazionale",
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13INTBRU-INT"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "BRU",
     "h": "INT"
    },
    "market": {
     "a": 0.08,
     "d": 0.14,
     "h": 0.78
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 8,
       "ask_size": 317989,
       "bid_c": 7,
       "bid_size": 45487,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-BRU"
      },
      "d": {
       "ask_c": 14,
       "ask_size": 107,
       "bid_c": 13,
       "bid_size": 108261,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-TIE"
      },
      "h": {
       "ask_c": 78,
       "ask_size": 114926,
       "bid_c": 77,
       "bid_size": 45375,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-INT"
      }
     },
     "overround": 1.0,
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
    "club": "Internazionale",
    "ga": 1.075657894736842,
    "gdg": 1.513157894736842,
    "gf": 2.588815789473684,
    "gp_current": 6,
    "of": 17,
    "ppg": 2.4309210526315788,
    "rank": 1,
    "rated": true,
    "rated_in": "seriea",
    "resolved_by": "exact",
    "table_club": "Internazionale",
    "table_note": null,
    "weight": 0.375
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "admission": "there is no current-season line to be short of",
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet.",
     "this_season": "no member league's current season lists the club — epl: this season's standings do not list the club; laliga: this season's standings do not list the club; bundesliga: this season's standings do not list the club; seriea: this season's standings do not list the club; ligue1: this season's standings do not list the club; eredivisie: this season's standings do not list the club; primeiraliga: this season's standings do not list the club; superlig: this season's standings do not list the club; eliteserien: this season's standings do not list the club; czechliga: this season's standings do not list the club; ukrpremier: this season's standings do not list the club; slovaksuperliga: this season's standings do not list the club; azerpremyer: this season's standings do not list the club"
    },
    "carries": [
     "opponent_row"
    ],
    "case": "not_in_this_season",
    "reason": "no_prior_row",
    "why": "the club has no row in the table the board compares on, and this season's standings do not list it either — so there are no figures to report, only the fact that the name reached no table.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Milano",
    "country": "Italy",
    "name": "San Siro"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  }
 ],
 "rows": [
  {
   "away": "Sporting CP",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915418",
   "cross_league": true,
   "current_only": {
    "favourite": "Lens",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Lens"
   },
   "espn": "uefa.champions",
   "event_id": "401915418",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Lens",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.31289132500657146,
       "interval": [
        0.2550194462228348,
        0.8808020962359777
       ],
       "rank": 19,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.5679107712294063
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.2204750257416768,
       "interval": [
        0.4352168980562575,
        0.876166949539611
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 0.6556919237979343
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.38114841613184836,
       "interval": [
        0.14269560975374418,
        0.9049924420174409
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.5238440258855925
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.3427415694051385,
       "interval": [
        0.22100807911863612,
        0.9064912179289131
       ],
       "rank": 9,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.5637496485237746
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 38.175325820741975,
       "interval": [
        1806.9641127670277,
        1883.3147644085118
       ],
       "rank": 13,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1845.1394385877697
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 56.493773308217285,
       "interval": [
        1786.5965790136763,
        1899.5841256301107
       ],
       "rank": 14,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 1843.0903523218935
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
     "fav": "Lens",
     "opp": "Sporting CP"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "HOLLOW",
    "size": 36
   },
   "form": {
    "fav": "LDLW",
    "opp": "WDDW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 8,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Sporting CP",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Lens",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": null,
     "corpus_to": null,
     "from": "2026-09-01",
     "label": "no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Lens",
   "in_play": false,
   "kalshi": {
    "ask_c": 38,
    "ask_size": 66,
    "bid_c": 37,
    "bid_size": 50034,
    "event_ticker": "KXUCLGAME-26OCT13RCLSPO",
    "flags": [
     "THIN"
    ],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13RCLSPO-RCL"
   },
   "kickoff": "2026-10-13T16:45Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.7949840890513776,
    "gd": 0.49686929017896186,
    "gf": 1.2918533792303395,
    "leagues": {
     "fav": "ligue1",
     "opp": "primeiraliga"
    },
    "measured_as": {
     "fav": "ligue-1",
     "opp": "primeira-liga"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "SCP",
     "h": "RCL"
    },
    "market": {
     "a": 0.366337,
     "d": 0.257426,
     "h": 0.376238
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 37,
       "ask_size": 221993,
       "bid_c": 36,
       "bid_size": 21440,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-SPO"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 30183,
       "bid_c": 25,
       "bid_size": 10145,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-TIE"
      },
      "h": {
       "ask_c": 38,
       "ask_size": 66,
       "bid_c": 37,
       "bid_size": 50034,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-RCL"
      }
     },
     "overround": 1.01,
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
   "opponent": "Sporting CP",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -1.0408496732026147
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 6,
    "opp": 3
   },
   "rated_in": {
    "away": "primeiraliga",
    "home": "ligue1"
   },
   "rates": {
    "ga": [
     1.2683823529411764,
     0.8921568627450981
    ],
    "gdg": [
     0.6323529411764706,
     1.6732026143790852
    ],
    "gf": [
     1.900735294117647,
     2.565359477124183
    ],
    "ppg": [
     1.7242647058823528,
     2.3398692810457513
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Lens": "exact",
    "Sporting CP": "exact"
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
    "def": -1,
    "ovr": -1
   },
   "tiers": {
    "atk": [
     1,
     1
    ],
    "def": [
     2,
     1
    ],
    "ovr": [
     2,
     1
    ]
   },
   "venue": {
    "city": "Lens",
    "country": "France",
    "name": "Stade Bollaert-Delelis"
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
    "away": 0.4444444444444444,
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
   "away": "Slavia Prague",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915436",
   "cross_league": true,
   "current_only": {
    "favourite": "Sabah FK",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Sabah FK"
   },
   "espn": "uefa.champions",
   "event_id": "401915436",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Sabah FK",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3338882830836108,
       "interval": [
        -0.05711957347140445,
        0.6106569926958172
       ],
       "rank": 31,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.27676870961220634
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.2623738039701317,
       "interval": [
        -0.0011626010914166929,
        0.5235850068488468
       ],
       "rank": 32,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.261211202878715
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.377575429022487,
       "interval": [
        -0.46214719418694444,
        0.2930036638580295
       ],
       "rank": 34,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.08457176516445747
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.35955144441453074,
       "interval": [
        0.0920359811835944,
        0.8111388700126558
       ],
       "rank": 18,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.45158742559812515
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": true,
       "half_width_95": 164.77249759880442,
       "interval": [
        1419.3314301714586,
        1748.8764253690674
       ],
       "rank": 33,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 1584.103927770263
      },
      "label": "overall",
      "opp": {
       "below_floor": true,
       "half_width_95": 146.47782274129034,
       "interval": [
        1405.17289957613,
        1698.1285450587106
       ],
       "rank": 34,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 1551.6507223174203
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
     "fav": "Sabah FK",
     "opp": "Slavia Prague"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "HOLLOW",
    "size": 36
   },
   "form": {
    "fav": "WWWD",
    "opp": "WWWW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 10,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Slavia Praha",
      "resolved_by": "alias_outside_league"
     },
     "home": {
      "corpus_name": "Sabah FA",
      "resolved_by": "alias_outside_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus: it holds no competition-season both clubs played, so no meeting could have been recorded. That is an absence of evidence, not a claim the clubs never met",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Sabah FK",
   "in_play": false,
   "kalshi": null,
   "kickoff": "2026-10-13T16:45Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 1.3848683130920745,
    "gd": -0.6050351894494902,
    "gf": 0.7798331236425843,
    "leagues": {
     "fav": "azerpremyer",
     "opp": "czechliga"
    },
    "measured_as": {
     "fav": "azerbaijan-premyer-liqa",
     "opp": "czech-liga"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "SLP",
     "h": "SAB"
    },
    "market": null,
    "market_meta": null,
    "market_why": "no_three_way_book",
    "model": null,
    "model_meta": null,
    "model_why": "plane_not_ready",
    "top": {
     "market": [],
     "model": []
    },
    "verdict": "no_model"
   },
   "opponent": "Slavia Prague",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.0928030303030305
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 1
   },
   "rated_in": {
    "away": "czechliga",
    "home": "azerpremyer"
   },
   "rates": {
    "ga": [
     0.5359848484848485,
     0.6833333333333333
    ],
    "gdg": [
     1.7594696969696972,
     1.6666666666666667
    ],
    "gf": [
     2.295454545454546,
     2.35
    ],
    "ppg": [
     2.4772727272727275,
     2.4833333333333334
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Sabah FK": "alias",
    "Slavia Prague": "alias"
   },
   "shape": "HOLLOW",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": "SPLIT-FORMAT LEAGUE — this club's ppg and GD/g are its REGULAR SEASON only. The Czech Liga plays a round robin and then divides into championship and relegation groups that carry the points forward, so the last five games of a season are against a strength-segregated field and a full-season ppg is not the same statistic as an EPL one (measured on the 2025 season: Teplice 29 pts from 30 games = 0.967 ppg in the round robin, 42 from 35 = 1.200 ppg once the bottom six had been replayed). Both halves of the blend take the round robin every club actually played and nothing after it. Two consequences: those five games are not in any number on this card, and from the spring split onward this club's table stops advancing while it keeps playing.",
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
    "city": "Baku",
    "country": "Azerbaijan",
    "name": "Baku Olympic Stadium"
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
    "away": 0.5,
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
   "away": "Manchester United",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915412",
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
   "event_id": "401915412",
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
       "half_width_95": 0.2616669367760716,
       "interval": [
        0.35919678282230055,
        0.8825306563744437
       ],
       "rank": 14,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.6208637195983722
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
       "half_width_95": 0.3341491687206773,
       "interval": [
        -0.08523707669030808,
        0.5830612607510465
       ],
       "rank": 24,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.2489120920303692
      },
      "tier_gap": 1,
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
       "half_width_95": 41.698927340690574,
       "interval": [
        1809.4946758515134,
        1892.8925305328944
       ],
       "rank": 12,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1851.193603192204
      },
      "tier_gap": 1,
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
     "opp": "Atlético Madrid"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "CLEAN",
    "size": 36
   },
   "form": {
    "fav": "DLDD",
    "opp": "LWWWW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 8,
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
      "corpus_name": "Atletico Madrid",
      "resolved_by": "normalised"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": null,
     "corpus_to": null,
     "from": "2026-09-01",
     "label": "no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Atlético Madrid",
   "in_play": false,
   "kalshi": {
    "ask_c": 26,
    "ask_size": 393342,
    "bid_c": 25,
    "bid_size": 4676,
    "event_ticker": "KXUCLGAME-26OCT13ATMMUN",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13ATMMUN-MUN"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.9353203546993543,
    "gd": 0.7182804673006615,
    "gf": 1.6536008220000158,
    "leagues": {
     "fav": "epl",
     "opp": "laliga"
    },
    "measured_as": {
     "fav": "epl",
     "opp": "la-liga"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "MAN",
     "h": "ATM"
    },
    "market": {
     "a": 0.254902,
     "d": 0.245098,
     "h": 0.5
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 26,
       "ask_size": 393342,
       "bid_c": 25,
       "bid_size": 4676,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ATMMUN-MUN"
      },
      "d": {
       "ask_c": 25,
       "ask_size": 179982,
       "bid_c": 24,
       "bid_size": 9394,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ATMMUN-TIE"
      },
      "h": {
       "ask_c": 51,
       "ask_size": 77000,
       "bid_c": 50,
       "bid_size": 37472,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ATMMUN-ATM"
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
   "opponent": "Atlético Madrid",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -0.5062134502923976
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 5,
    "opp": 3
   },
   "rated_in": {
    "away": "epl",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     1.3848684210526316,
     1.087719298245614
    ],
    "gdg": [
     0.3125,
     0.8187134502923976
    ],
    "gf": [
     1.6973684210526316,
     1.9064327485380117
    ],
    "ppg": [
     1.542763157894737,
     2.064327485380117
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Atlético Madrid": "exact",
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
    "ovr": -1
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
     1
    ]
   },
   "venue": {
    "city": "Madrid",
    "country": "Spain",
    "name": "Riyadh Air Metropolitano"
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
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.375
   }
  },
  {
   "away": "Barcelona",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915435",
   "cross_league": true,
   "current_only": {
    "favourite": "Barcelona",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Barcelona"
   },
   "espn": "uefa.champions",
   "event_id": "401915435",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Barcelona",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.19935204315779642,
       "interval": [
        0.8412974060227727,
        1.2400014923383655
       ],
       "rank": 2,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1.0406494491805691
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.23491299832896878,
       "interval": [
        0.1567370116882545,
        0.626563008346192
       ],
       "rank": 26,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.39165001001722327
      },
      "tier_gap": 3,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.3285558774656135,
       "interval": [
        0.08703789626349018,
        0.7441496511947172
       ],
       "rank": 19,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.41559377372910367
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.35440060462329614,
       "interval": [
        -0.0584043556904823,
        0.65039685355611
       ],
       "rank": 21,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.29599624893281384
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 37.938674099392614,
       "interval": [
        1960.3997944855605,
        2036.2771426843456
       ],
       "rank": 4,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1998.338468584953
      },
      "label": "overall",
      "opp": {
       "below_floor": true,
       "half_width_95": 161.54597708472696,
       "interval": [
        1547.7920546344887,
        1870.8840088039426
       ],
       "rank": 30,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 1709.3380317192157
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
     "fav": "Barcelona",
     "opp": "Galatasaray"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "WWWWW",
    "opp": "WWLW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 8,
    "home": 7,
    "min": 7
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Barcelona",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Galatasaray",
      "resolved_by": "exact_outside_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-07, corpus to 2026-05-30; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2026-05-30",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2026-05-30; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Galatasaray",
   "in_play": false,
   "kalshi": {
    "ask_c": 77,
    "ask_size": 245187,
    "bid_c": 76,
    "bid_size": 55638,
    "event_ticker": "KXUCLGAME-26OCT13GALBAR",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13GALBAR-BAR"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.7918080561771081,
    "gd": 0.8753437362286349,
    "gf": 1.667151792405743,
    "leagues": {
     "fav": "laliga",
     "opp": "superlig"
    },
    "measured_as": {
     "fav": "la-liga",
     "opp": "super-lig"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "BAR",
     "h": "GAL"
    },
    "market": {
     "a": 0.762376,
     "d": 0.128713,
     "h": 0.108911
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 77,
       "ask_size": 245187,
       "bid_c": 76,
       "bid_size": 55638,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13GALBAR-BAR"
      },
      "d": {
       "ask_c": 13,
       "ask_size": 25024,
       "bid_c": 12,
       "bid_size": 54839,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13GALBAR-TIE"
      },
      "h": {
       "ask_c": 11,
       "ask_size": 111357,
       "bid_c": 10,
       "bid_size": 36495,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13GALBAR-GAL"
      }
     },
     "overround": 1.01,
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
   "opponent": "Galatasaray",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2553066634290455
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 1
   },
   "rated_in": {
    "away": "laliga",
    "home": "superlig"
   },
   "rates": {
    "ga": [
     0.915204678362573,
     1.1660899653979238
    ],
    "gdg": [
     2.3625730994152048,
     1.1072664359861593
    ],
    "gf": [
     3.2777777777777777,
     2.273356401384083
    ],
    "ppg": [
     2.7076023391812867,
     2.273356401384083
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Barcelona": "exact",
    "Galatasaray": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     1
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
    "city": "Istanbul",
    "country": "Türkiye",
    "name": "RAMS Park"
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
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4117647058823529,
    "k": 10.0,
    "min": 0.4117647058823529
   }
  },
  {
   "away": "PSV Eindhoven",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915434",
   "cross_league": true,
   "current_only": {
    "favourite": "PSV Eindhoven",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "PSV Eindhoven"
   },
   "espn": "uefa.champions",
   "event_id": "401915434",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "PSV Eindhoven",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.23789266171699744,
       "interval": [
        0.5082294541231953,
        0.9840147775571901
       ],
       "rank": 10,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.7461221158401927
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.27187039725426027,
       "interval": [
        0.26762203095876597,
        0.8113628254672864
       ],
       "rank": 20,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.5394924282130262
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.299516828772885,
       "interval": [
        -0.3217051202888939,
        0.27732853725687606
       ],
       "rank": 33,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.02218829151600893
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.3361135618461987,
       "interval": [
        -0.01648451164805481,
        0.6557426120443426
       ],
       "rank": 20,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.3196290501981439
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 48.88843809185902,
       "interval": [
        1793.316948525754,
        1891.0938247094718
       ],
       "rank": 15,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1842.205386617613
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 40.365252362646885,
       "interval": [
        1755.6961811682847,
        1836.4266858935787
       ],
       "rank": 18,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 1796.0614335309317
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
     "fav": "PSV Eindhoven",
     "opp": "RB Leipzig"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "WWLW",
    "opp": "LWLW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 8,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "PSV Eindhoven",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "RB Leipzig",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-07, corpus to 2025-05-31; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2025-05-31",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2025-05-31; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "RB Leipzig",
   "in_play": false,
   "kalshi": {
    "ask_c": 24,
    "ask_size": 630,
    "bid_c": 23,
    "bid_size": 35646,
    "event_ticker": "KXUCLGAME-26OCT13RBLPSV",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13RBLPSV-PSV"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 1.6661777027672684,
    "gd": -0.7022495208979195,
    "gf": 0.9639281818693489,
    "leagues": {
     "fav": "eredivisie",
     "opp": "bundesliga"
    },
    "measured_as": {
     "fav": "eredivisie",
     "opp": "bundesliga"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "PSV",
     "h": "RBL"
    },
    "market": {
     "a": 0.24,
     "d": 0.2,
     "h": 0.56
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 24,
       "ask_size": 630,
       "bid_c": 23,
       "bid_size": 35646,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RBLPSV-PSV"
      },
      "d": {
       "ask_c": 20,
       "ask_size": 18,
       "bid_c": 19,
       "bid_size": 47100,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RBLPSV-TIE"
      },
      "h": {
       "ask_c": 56,
       "ask_size": 105375,
       "bid_c": 55,
       "bid_size": 38932,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RBLPSV-RBL"
      }
     },
     "overround": 1.0,
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
    "diff": 0.7647058823529413
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 3
   },
   "rated_in": {
    "away": "eredivisie",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     1.2908496732026145,
     1.2549019607843137
    ],
    "gdg": [
     1.803921568627451,
     1.0392156862745097
    ],
    "gf": [
     3.0947712418300655,
     2.2941176470588234
    ],
    "ppg": [
     2.428104575163399,
     1.8745098039215686
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "PSV Eindhoven": "exact",
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
    "def": -1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     1
    ],
    "def": [
     2,
     1
    ],
    "ovr": [
     1,
     1
    ]
   },
   "venue": {
    "city": "Leipzig",
    "country": "Germany",
    "name": "Red Bull Arena"
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
    "away": 0.4444444444444444,
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
   "away": "Bayern Munich",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915411",
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
   "event_id": "401915411",
   "fav_side": "away",
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
      "tier_gap": 2,
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
     "fav": "Bayern Munich",
     "opp": "Viking FK"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "CLEAN",
    "size": 36
   },
   "form": {
    "fav": "DWWD",
    "opp": "DWWW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 5,
    "home": 22,
    "min": 5
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Bayern München",
      "resolved_by": "alias"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "not_in_corpus"
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
   "home": "Viking FK",
   "in_play": false,
   "kalshi": {
    "ask_c": 90,
    "ask_size": 544198,
    "bid_c": 89,
    "bid_size": 17040,
    "event_ticker": "KXUCLGAME-26OCT13VIKBMU",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13VIKBMU-BMU"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.8732995387819413,
    "gd": 0.8550522218554062,
    "gf": 1.7283517606373475,
    "leagues": {
     "fav": "bundesliga",
     "opp": "eliteserien"
    },
    "measured_as": {
     "fav": "bundesliga",
     "opp": "eliteserien"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "MUN",
     "h": "VIK"
    },
    "market": {
     "a": 0.882353,
     "d": 0.068627,
     "h": 0.04902
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 90,
       "ask_size": 544198,
       "bid_c": 89,
       "bid_size": 17040,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VIKBMU-BMU"
      },
      "d": {
       "ask_c": 7,
       "ask_size": 335573,
       "bid_c": 6,
       "bid_size": 25911,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VIKBMU-TIE"
      },
      "h": {
       "ask_c": 5,
       "ask_size": 326292,
       "bid_c": 4,
       "bid_size": 10906,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VIKBMU-VIK"
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
   "opponent": "Viking FK",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.9341911764705881
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 1
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "eliteserien"
   },
   "rates": {
    "ga": [
     0.9725490196078432,
     1.0
    ],
    "gdg": [
     2.4862745098039216,
     1.5520833333333335
    ],
    "gf": [
     3.458823529411765,
     2.5520833333333335
    ],
    "ppg": [
     2.4784313725490197,
     2.3958333333333335
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Bayern Munich": "exact",
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
    "city": "Stavanger",
    "country": "Norway",
    "name": "Viking Stadion"
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
    "away": 0.3333333333333333,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.6875,
    "k": 10.0,
    "min": 0.3333333333333333
   }
  },
  {
   "away": "Napoli",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915410",
   "cross_league": true,
   "current_only": {
    "favourite": "Napoli",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Napoli"
   },
   "espn": "uefa.champions",
   "event_id": "401915410",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Napoli",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.26146388197970877,
       "interval": [
        0.1583102537447751,
        0.6812380177041926
       ],
       "rank": 24,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": 0.41977413572448385
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.24076189651976893,
       "interval": [
        0.5322102594295439,
        1.0137340524690819
       ],
       "rank": 9,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.7729721559493129
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.3570949046193621,
       "interval": [
        0.12482425799185104,
        0.8390140672305753
       ],
       "rank": 14,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.48191916261121315
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.24518568459374038,
       "interval": [
        -0.05130412072379359,
        0.43906724846368717
       ],
       "rank": 26,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 0.1938815638699468
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 34.57384373001817,
       "interval": [
        1757.6493529334612,
        1826.7970403934974
       ],
       "rank": 20,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 1792.2231966634793
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 50.68333546285127,
       "interval": [
        1731.3147313397626,
        1832.6814022654653
       ],
       "rank": 24,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 1781.998066802614
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
     "fav": "Napoli",
     "opp": "Villarreal"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "HOLLOW",
    "size": 36
   },
   "form": {
    "fav": "LWDW",
    "opp": "LLWWL",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 8,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Napoli",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Villarreal",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2025-07, corpus to 2026-05-30; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2025-07-08",
     "corpus_to": "2026-05-30",
     "from": "2025-07-08",
     "label": "since 2025-07, corpus to 2026-05-30; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Villarreal",
   "in_play": false,
   "kalshi": {
    "ask_c": 30,
    "ask_size": 216895,
    "bid_c": 29,
    "bid_size": 19657,
    "event_ticker": "KXUCLGAME-26OCT13VILNAP",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT13VILNAP-NAP"
   },
   "kickoff": "2026-10-13T19:00Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 1.2001576878906461,
    "gd": -0.10377592655720358,
    "gf": 1.0963817613334426,
    "leagues": {
     "fav": "seriea",
     "opp": "laliga"
    },
    "measured_as": {
     "fav": "serie-a",
     "opp": "la-liga"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "NAP",
     "h": "VIL"
    },
    "market": {
     "a": 0.294118,
     "d": 0.254902,
     "h": 0.45098
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 30,
       "ask_size": 216895,
       "bid_c": 29,
       "bid_size": 19657,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VILNAP-NAP"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 26980,
       "bid_c": 25,
       "bid_size": 17485,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VILNAP-TIE"
      },
      "h": {
       "ask_c": 46,
       "ask_size": 156829,
       "bid_c": 45,
       "bid_size": 4846,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13VILNAP-VIL"
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
   "opponent": "Villarreal",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.23172514619883078
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 5,
    "opp": 5
   },
   "rated_in": {
    "away": "seriea",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.9671052631578947,
     1.3947368421052633
    ],
    "gdg": [
     0.611842105263158,
     0.3801169590643272
    ],
    "gf": [
     1.5789473684210527,
     1.7748538011695905
    ],
    "ppg": [
     1.875,
     1.4970760233918128
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Napoli": "exact",
    "Villarreal": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     1
    ],
    "def": [
     2,
     3
    ],
    "ovr": [
     2,
     2
    ]
   },
   "venue": {
    "city": "Villarreal",
    "country": "Spain",
    "name": "Estadio de la Cerámica"
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
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.375
   }
  },
  {
   "away": "Como",
   "column": "ucl",
   "columns": [
    "ucl"
   ],
   "competition_id": "401915416",
   "cross_league": true,
   "current_only": {
    "favourite": "Como",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Como"
   },
   "espn": "uefa.champions",
   "event_id": "401915416",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Como",
   "field": {
    "axes": {
     "atk": {
      "fav": {
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
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.2633124032137176,
       "interval": [
        0.1133296493969646,
        0.6399544558243999
       ],
       "rank": 28,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.37664205261068223
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
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
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.32076139043018254,
       "interval": [
        -0.2855502058043543,
        0.35597257505601076
       ],
       "rank": 32,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": 0.0352111846258282
      },
      "tier_gap": 2,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
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
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 45.69736147820666,
       "interval": [
        1663.9741946393005,
        1755.3689175957138
       ],
       "rank": 29,
       "straddles": false,
       "tier": 3,
       "tier_set": [
        3
       ],
       "value": 1709.6715561175072
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
     "fav": "Como",
     "opp": "Feyenoord Rotterdam"
    },
    "competition": "ucl",
    "field_basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "WWLD",
    "opp": "WWWW",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 8,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Como",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Feyenoord",
      "resolved_by": "contained"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": null,
     "corpus_to": null,
     "from": "2026-09-01",
     "label": "no corpus season holds both clubs; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Feyenoord Rotterdam",
   "in_play": false,
   "kalshi": {
    "ask_c": 51,
    "ask_size": 80701,
    "bid_c": 50,
    "bid_size": 47,
    "event_ticker": "KXUCLGAME-26OCT14FEYCOM",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUCLGAME-26OCT14FEYCOM-COM"
   },
   "kickoff": "2026-10-14T16:45Z",
   "league": "ucl",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.8844102310562274,
    "gd": 0.5336429129262377,
    "gf": 1.418053143982465,
    "leagues": {
     "fav": "seriea",
     "opp": "eredivisie"
    },
    "measured_as": {
     "fav": "serie-a",
     "opp": "eredivisie"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "COMO",
     "h": "FEY"
    },
    "market": {
     "a": 0.50495,
     "d": 0.227723,
     "h": 0.267327
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 51,
       "ask_size": 80701,
       "bid_c": 50,
       "bid_size": 47,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT14FEYCOM-COM"
      },
      "d": {
       "ask_c": 23,
       "ask_size": 16960,
       "bid_c": 22,
       "bid_size": 10719,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT14FEYCOM-TIE"
      },
      "h": {
       "ask_c": 27,
       "ask_size": 340,
       "bid_c": 26,
       "bid_size": 30432,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT14FEYCOM-FEY"
      }
     },
     "overround": 1.01,
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
   "opponent": "Feyenoord Rotterdam",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -0.7563424492604058
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 6,
    "opp": 2
   },
   "rated_in": {
    "away": "seriea",
    "home": "eredivisie"
   },
   "rates": {
    "ga": [
     0.8519736842105263,
     1.107843137254902
    ],
    "gdg": [
     0.7796052631578947,
     1.5359477124183005
    ],
    "gf": [
     1.631578947368421,
     2.6437908496732025
    ],
    "ppg": [
     1.855263157894737,
     2.1732026143790852
    ]
   },
   "refused": false,
   "reg_time_note": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
   "resolution": {
    "Como": "exact",
    "Feyenoord Rotterdam": "exact"
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
    "ovr": -1
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
     2,
     1
    ]
   },
   "venue": {
    "city": "Rotterdam",
    "country": "Netherlands",
    "name": "De Kuip"
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
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.375
   }
  }
 ]
} as const;

// A REAL EFL CUP BOARD, RECORDED — not a payload written from a brief.
//
// WHY THIS FILE EXISTS AT ALL. This repo has certified a live bug with a
// green test more than once because the fixture spoke the CODE's
// vocabulary instead of the FEED's — a venue guard whose fixture said
// "ESP" where ESPN says "Spain" mislabelled half a board and twelve
// tests approved it. So nothing about the EFL Cup column is typed here.
// Every string below came off `src.picker.board.assemble_board(
// date="20260916", days=2, leagues=["eflcup"], capture=False)` on
// 2026-09-15, against the live ESPN and Kalshi feeds, and it is the
// backend of this change's own branch rather than production — which is
// the point: it is what this code emits.
//
// WHAT IT CONTAINS, and why one payload can carry the whole guard:
//   * ONE RATED ROW  — Manchester United v Brighton, both Premier
//     League, so the tables share a scale and the row is ordinary.
//   * THREE REFUSALS — Fleetwood Town (League Two) v Sheffield United
//     and Manchester City v Norwich City (both Championship) refuse
//     `no_shared_scale`, and Everton v Wolverhampton Wanderers refuses
//     `no_prior_row` because Wolves were relegated and a cross-division
//     prior is refused rather than imputed.
// That pairing is what makes the guards non-vacuous: the same payload
// proves a row CAN be rated in this column and that the refused ones
// are refused for a named reason, rather than the column being empty.
//
// THE CLOCK IS THE ONE THING REBASED, and only the clock. A recorded
// payload is frozen on 2026-09-16, so every kickoff in it is in the past
// the day after it was taken and the board would draw finished matches
// for a suite that is about live ones. `rebased()` shifts the kickoffs
// forward, PRESERVING THEIR ORDER AND SPACING, and touches nothing else:
// every club name, reason, note, venue country and Kalshi ticker is the
// byte the wire carried. Same discipline as e2e/standing.ts — transform
// a real payload, never invent one.

/** The payload exactly as the backend emitted it. */
export const RECORDED = {
  "generated_at": "2026-09-16T01:07:41.634842+00:00",
  "date": "20260916",
  "days": 2,
  "leagues": {
    "eflcup": {
      "src": "prior",
      "min_current_gp": 4,
      "clubs": 70,
      "kind": "cup",
      "rated_on": [
        "epl",
        "championship",
        "leagueone",
        "leaguetwo"
      ],
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "no_field": "NO SHARED SCALE EXISTS FOR THIS COMPETITION'S FIELD, and the reason is the corpus rather than the calendar. The EFL Cup draws from four English tiers. TWO OF THE FOUR ARE NOT IN THE ELO CORPUS AT ALL \u2014 it holds nineteen leagues and neither League One nor League Two is one of them \u2014 so more than half the 92 clubs that have played in this season's competition have no cross-league rating to be placed on any scale, at any pass count. THE THIRD IS IN THE CORPUS AND STILL CANNOT BE PLACED: the Championship contributes 27 clubs and 1,114 domestic fixtures and EXACTLY ZERO BRIDGE FIXTURES \u2014 0.0 per club, no club touched by one, `connectivity_measurable: false`. Elo is zero-sum per game, so a league's cross-league level is carried by its bridges and by nothing else; with none, 86% of its rating is still the 1500 starting constant (prior-persistence pi = 0.860, where condition C2 of the placeability floor requires pi <= 0.5). It sits in the same connected component as the reference set only through six clubs that CHANGED DIVISION inside the window \u2014 Burnley, Ipswich, Leeds, Leicester, Southampton, Sunderland \u2014 and its own widest-path entry records no hop count to that reference set at all. Only the Premier League, with 200 bridge fixtures, has a measured level. A field naming a favourite off one rated tier and three unrated ones would be an ordering of the Premier League with the other 72 clubs arranged behind it by nothing, so `stages.compare_cup` refuses the comparison instead. WHAT WOULD CHANGE THIS is a measurement, not an edit here: the cup's own cross-tier ties are exactly the bridges the Championship lacks, and 47 of the 76 fixtures played to 2026-09-15 pair two different tiers.",
      "league_levels": {
        "artifact": "research_archive/goals_cross_league_2026-09-09",
        "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
        "mu": 0.06585639874539755,
        "leagues_measured": 13,
        "members_measured": [
          "epl"
        ],
        "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit"
      }
    }
  },
  "rows": [
    {
      "refused": false,
      "league": "eflcup",
      "column": "epl",
      "columns": [
        "epl"
      ],
      "home": "Manchester United",
      "away": "Brighton & Hove Albion",
      "favourite": "Manchester United",
      "opponent": "Brighton & Hove Albion",
      "fav_side": "home",
      "fav_source": "rank",
      "venue_favourite": {
        "refused": false,
        "venue_class": "DOMESTIC",
        "home_side": "home",
        "gdg_gap_abs": 0.3270676691729322,
        "threshold": 0.35443162317558574,
        "threshold_source": "derived",
        "policy": "off",
        "favourite": "Manchester United",
        "side": "home",
        "agrees": true,
        "reason": "favourite_already_at_home",
        "flipped": false
      },
      "resolution": {
        "Manchester United": "exact",
        "Brighton & Hove Albion": "exact"
      },
      "ppg_gap": 0.12406015037593976,
      "gdg_gap": -0.3270676691729322,
      "rank_gap": 2,
      "gp_current": {
        "home": 4,
        "away": 4,
        "min": 4
      },
      "weights": {
        "home": 0.2857142857142857,
        "away": 0.2857142857142857,
        "min": 0.2857142857142857,
        "k": 10.0,
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
      "table_notes": {
        "home": null,
        "away": null
      },
      "gap_note": null,
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "ranks": {
        "fav": 3,
        "opp": 5
      },
      "rates": {
        "ppg": [
          1.6203007518796992,
          1.4962406015037595
        ],
        "gf": [
          1.7969924812030076,
          1.9060150375939848
        ],
        "ga": [
          1.4398496240601504,
          1.2218045112781954
        ],
        "gdg": [
          0.3571428571428572,
          0.6842105263157894
        ]
      },
      "own_gdg": {
        "diff": -0.3270676691729322,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
      },
      "tiers": {
        "ovr": [
          1,
          2
        ],
        "atk": [
          2,
          1
        ],
        "def": [
          4,
          1
        ]
      },
      "tier_gaps": {
        "ovr": 1,
        "atk": -1,
        "def": -3
      },
      "shape": "HOLLOW",
      "event_id": "401914261",
      "competition_id": "401914261",
      "kickoff": "2026-09-16T19:00Z",
      "espn": "eng.league_cup",
      "state": "pre",
      "in_play": false,
      "venue": {
        "name": "Old Trafford",
        "city": "Manchester",
        "country": "England"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": {
        "event_ticker": "KXEFLCUPGAME-26SEP16MUNBRI",
        "ticker": "KXEFLCUPGAME-26SEP16MUNBRI-MUN",
        "ask_c": 53,
        "bid_c": 52,
        "spread_c": 1,
        "ask_size": 2156,
        "bid_size": 2344,
        "flags": []
      },
      "form": {
        "fav": "LWDL",
        "opp": "WLDW",
        "scope": "its own league",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": 0.75,
        "gdg_gap": 2.0,
        "rank_gap": 7
      }
    }
  ],
  "refusals": [
    {
      "refused": true,
      "club": "Wolverhampton Wanderers",
      "reason": "no_prior_row",
      "home": "Everton",
      "away": "Wolverhampton Wanderers",
      "league": "eflcup",
      "column": "eflcup",
      "columns": [
        "eflcup"
      ],
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "this_season": {
        "club": "Wolverhampton Wanderers",
        "table_club": "Wolverhampton Wanderers",
        "resolved_by": "exact",
        "rated_in": "championship",
        "gp": 6,
        "ppg": 1.8333333333333333,
        "gf": 2.3333333333333335,
        "ga": 1.6666666666666667,
        "gdg": 0.6666666666666666,
        "rates_absent": null
      },
      "admission": {
        "k": 10.0,
        "gp": 6,
        "games_until_rated": 4,
        "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
        "basis_when_admitted": "current_only",
        "says": "Wolverhampton Wanderers has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 6; 4 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
      },
      "opponent_row": {
        "club": "Everton",
        "table_club": "Everton",
        "resolved_by": "exact",
        "rated": true,
        "rated_in": "epl",
        "table_note": null,
        "ppg": 1.349624060150376,
        "gf": 1.2406015037593985,
        "ga": 1.1541353383458648,
        "gdg": 0.08646616541353369,
        "gp_current": 4,
        "rank": 9,
        "of": 17,
        "weight": 0.2857142857142857,
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
          "sides": "this refusal names ONE club, and that club has no row to report a side for \u2014 which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
        },
        "withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
      },
      "event_id": "401914282",
      "competition_id": "401914282",
      "kickoff": "2026-09-16T18:45Z",
      "espn": "eng.league_cup",
      "state": "pre",
      "in_play": false,
      "venue": {
        "name": "Hill Dickinson Stadium",
        "city": "Liverpool",
        "country": "England"
      },
      "venue_class": {
        "class": "UNKNOWN",
        "home_side": null
      },
      "kalshi": {
        "event_ticker": "KXEFLCUPGAME-26SEP16EVEWOL",
        "ticker": "KXEFLCUPGAME-26SEP16EVEWOL-EVE",
        "ask_c": 64,
        "bid_c": 63,
        "spread_c": 1,
        "ask_size": 3255,
        "bid_size": 2118,
        "flags": [],
        "side": "Everton"
      },
      "form": {
        "home": "WDDD",
        "away": "WWLDW",
        "scope": "its own league",
        "scope_is_cup": false
      }
    },
    {
      "refused": true,
      "club": null,
      "reason": "no_shared_scale",
      "home": "Fleetwood Town",
      "away": "Sheffield United",
      "league": "eflcup",
      "column": "eflcup",
      "columns": [
        "eflcup"
      ],
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "this_season": null,
      "admission": null,
      "opponent_row": null,
      "sides": {
        "home": {
          "club": "Fleetwood Town",
          "table_club": "Fleetwood Town",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "leaguetwo",
          "table_note": null,
          "ppg": 1.453804347826087,
          "gf": 1.2119565217391304,
          "ga": 1.0380434782608696,
          "gdg": 0.17391304347826075,
          "gp_current": 6,
          "rank": 9,
          "of": 18,
          "weight": 0.375,
          "basis": "blend"
        },
        "away": {
          "club": "Sheffield United",
          "table_club": "Sheffield United",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "championship",
          "table_note": null,
          "ppg": 1.2966751918158568,
          "gf": 1.3145780051150895,
          "ga": 1.3734015345268542,
          "gdg": -0.05882352941176472,
          "gp_current": 7,
          "rank": 12,
          "of": 18,
          "weight": 0.4117647058823529,
          "basis": "blend"
        }
      },
      "refusal": {
        "reason": "no_shared_scale",
        "case": "no_shared_scale",
        "why": "BOTH CLUBS ARE RATED, in different leagues, and no field has been measured that puts those leagues on one scale \u2014 so there is no ordering that holds them both and nothing to take a favourite from. Each club's own rank, rates and games played are measured on its own league's table and are reported here; the favourite is not. Naming one would mean setting a quintile of one league against a quintile of another and, when those tie, breaking it on the club's name \u2014 which is a coin toss with the coin hidden. `refusal.detail.no_field` on this row, and `no_field` on this column's meta, carry the corpus numbers behind the missing field.",
        "carries": [
          "sides"
        ],
        "absent": {
          "this_season": "this block is the REFUSED club's own current season, and this refusal names no club. Both clubs' figures are in `sides`, off the blended table the board ranks on; repeating one of them here on this season alone would be the same club under two names on two weightings, which is how a card comes to contradict itself.",
          "admission": "the admission gate is a promoted club's countdown to having a prior-season row, and neither club is short of it \u2014 both are rated. THIS REFUSAL HAS NO COUNTDOWN AT ALL: it ends when somebody measures a field for this competition, not when a club plays more football, and printing a number of games here would promise a date nobody has.",
          "opponent_row": "nothing was refused about one club, so neither of these two is the OPPONENT of the other here \u2014 `sides` reports them both, each on its own league's table, and neither is signed against the other."
        },
        "withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
        "detail": {
          "no_field": "NO SHARED SCALE EXISTS FOR THIS COMPETITION'S FIELD, and the reason is the corpus rather than the calendar. The EFL Cup draws from four English tiers. TWO OF THE FOUR ARE NOT IN THE ELO CORPUS AT ALL \u2014 it holds nineteen leagues and neither League One nor League Two is one of them \u2014 so more than half the 92 clubs that have played in this season's competition have no cross-league rating to be placed on any scale, at any pass count. THE THIRD IS IN THE CORPUS AND STILL CANNOT BE PLACED: the Championship contributes 27 clubs and 1,114 domestic fixtures and EXACTLY ZERO BRIDGE FIXTURES \u2014 0.0 per club, no club touched by one, `connectivity_measurable: false`. Elo is zero-sum per game, so a league's cross-league level is carried by its bridges and by nothing else; with none, 86% of its rating is still the 1500 starting constant (prior-persistence pi = 0.860, where condition C2 of the placeability floor requires pi <= 0.5). It sits in the same connected component as the reference set only through six clubs that CHANGED DIVISION inside the window \u2014 Burnley, Ipswich, Leeds, Leicester, Southampton, Sunderland \u2014 and its own widest-path entry records no hop count to that reference set at all. Only the Premier League, with 200 bridge fixtures, has a measured level. A field naming a favourite off one rated tier and three unrated ones would be an ordering of the Premier League with the other 72 clubs arranged behind it by nothing, so `stages.compare_cup` refuses the comparison instead. WHAT WOULD CHANGE THIS is a measurement, not an edit here: the cup's own cross-tier ties are exactly the bridges the Championship lacks, and 47 of the 76 fixtures played to 2026-09-15 pair two different tiers."
        }
      },
      "event_id": "401914266",
      "competition_id": "401914266",
      "kickoff": "2026-09-16T18:45Z",
      "espn": "eng.league_cup",
      "state": "pre",
      "in_play": false,
      "venue": {
        "name": "Highbury Stadium",
        "city": "Fleetwood",
        "country": "England"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": {
        "event_ticker": "KXEFLCUPGAME-26SEP16FLESHU",
        "ticker": "KXEFLCUPGAME-26SEP16FLESHU-FLE",
        "ask_c": 19,
        "bid_c": 18,
        "spread_c": 1,
        "ask_size": 2281,
        "bid_size": 783,
        "flags": [],
        "side": "Fleetwood Town"
      },
      "form": {
        "home": "DDDWD",
        "away": "DWLWL",
        "scope": "its own league",
        "scope_is_cup": false
      }
    },
    {
      "refused": true,
      "club": "Coventry City",
      "reason": "no_prior_row",
      "home": "Coventry City",
      "away": "Aston Villa",
      "league": "eflcup",
      "column": "eflcup",
      "columns": [
        "eflcup"
      ],
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "this_season": {
        "club": "Coventry City",
        "table_club": "Coventry City",
        "resolved_by": "exact",
        "rated_in": "epl",
        "gp": 4,
        "ppg": 0.0,
        "gf": 0.0,
        "ga": 2.5,
        "gdg": -2.5,
        "rates_absent": null
      },
      "admission": {
        "k": 10.0,
        "gp": 4,
        "games_until_rated": 6,
        "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
        "basis_when_admitted": "current_only",
        "says": "Coventry City has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 4; 6 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
      },
      "opponent_row": {
        "club": "Aston Villa",
        "table_club": "Aston Villa",
        "resolved_by": "exact",
        "rated": true,
        "rated_in": "epl",
        "table_note": null,
        "ppg": 1.2932330827067668,
        "gf": 1.1240601503759398,
        "ga": 1.4210526315789473,
        "gdg": -0.2969924812030076,
        "gp_current": 4,
        "rank": 11,
        "of": 17,
        "weight": 0.2857142857142857,
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
          "sides": "this refusal names ONE club, and that club has no row to report a side for \u2014 which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
        },
        "withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
      },
      "event_id": "401914258",
      "competition_id": "401914258",
      "kickoff": "2026-09-16T19:00Z",
      "espn": "eng.league_cup",
      "state": "pre",
      "in_play": false,
      "venue": {
        "name": "Coventry Building Society Arena",
        "city": "Coventry",
        "country": "England"
      },
      "venue_class": {
        "class": "UNKNOWN",
        "home_side": null
      },
      "kalshi": {
        "event_ticker": "KXEFLCUPGAME-26SEP16COVAVL",
        "ticker": "KXEFLCUPGAME-26SEP16COVAVL-COV",
        "ask_c": 30,
        "bid_c": 29,
        "spread_c": 1,
        "ask_size": 1428,
        "bid_size": 1361,
        "flags": [],
        "side": "Coventry City"
      },
      "form": {
        "home": "LLLL",
        "away": "LLDL",
        "scope": "its own league",
        "scope_is_cup": false
      }
    },
    {
      "refused": true,
      "club": null,
      "reason": "no_shared_scale",
      "home": "Manchester City",
      "away": "Norwich City",
      "league": "eflcup",
      "column": "eflcup",
      "columns": [
        "eflcup"
      ],
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "this_season": null,
      "admission": null,
      "opponent_row": null,
      "sides": {
        "home": {
          "club": "Manchester City",
          "table_club": "Manchester City",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "epl",
          "table_note": null,
          "ppg": 2.3233082706766917,
          "gf": 2.018796992481203,
          "ga": 0.8007518796992481,
          "gdg": 1.218045112781955,
          "gp_current": 4,
          "rank": 2,
          "of": 17,
          "weight": 0.2857142857142857,
          "basis": "blend"
        },
        "away": {
          "club": "Norwich City",
          "table_club": "Norwich City",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "championship",
          "table_note": null,
          "ppg": 1.360613810741688,
          "gf": 1.5703324808184145,
          "ga": 1.4808184143222507,
          "gdg": 0.08951406649616378,
          "gp_current": 7,
          "rank": 10,
          "of": 18,
          "weight": 0.4117647058823529,
          "basis": "blend"
        }
      },
      "refusal": {
        "reason": "no_shared_scale",
        "case": "no_shared_scale",
        "why": "BOTH CLUBS ARE RATED, in different leagues, and no field has been measured that puts those leagues on one scale \u2014 so there is no ordering that holds them both and nothing to take a favourite from. Each club's own rank, rates and games played are measured on its own league's table and are reported here; the favourite is not. Naming one would mean setting a quintile of one league against a quintile of another and, when those tie, breaking it on the club's name \u2014 which is a coin toss with the coin hidden. `refusal.detail.no_field` on this row, and `no_field` on this column's meta, carry the corpus numbers behind the missing field.",
        "carries": [
          "sides"
        ],
        "absent": {
          "this_season": "this block is the REFUSED club's own current season, and this refusal names no club. Both clubs' figures are in `sides`, off the blended table the board ranks on; repeating one of them here on this season alone would be the same club under two names on two weightings, which is how a card comes to contradict itself.",
          "admission": "the admission gate is a promoted club's countdown to having a prior-season row, and neither club is short of it \u2014 both are rated. THIS REFUSAL HAS NO COUNTDOWN AT ALL: it ends when somebody measures a field for this competition, not when a club plays more football, and printing a number of games here would promise a date nobody has.",
          "opponent_row": "nothing was refused about one club, so neither of these two is the OPPONENT of the other here \u2014 `sides` reports them both, each on its own league's table, and neither is signed against the other."
        },
        "withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
        "detail": {
          "no_field": "NO SHARED SCALE EXISTS FOR THIS COMPETITION'S FIELD, and the reason is the corpus rather than the calendar. The EFL Cup draws from four English tiers. TWO OF THE FOUR ARE NOT IN THE ELO CORPUS AT ALL \u2014 it holds nineteen leagues and neither League One nor League Two is one of them \u2014 so more than half the 92 clubs that have played in this season's competition have no cross-league rating to be placed on any scale, at any pass count. THE THIRD IS IN THE CORPUS AND STILL CANNOT BE PLACED: the Championship contributes 27 clubs and 1,114 domestic fixtures and EXACTLY ZERO BRIDGE FIXTURES \u2014 0.0 per club, no club touched by one, `connectivity_measurable: false`. Elo is zero-sum per game, so a league's cross-league level is carried by its bridges and by nothing else; with none, 86% of its rating is still the 1500 starting constant (prior-persistence pi = 0.860, where condition C2 of the placeability floor requires pi <= 0.5). It sits in the same connected component as the reference set only through six clubs that CHANGED DIVISION inside the window \u2014 Burnley, Ipswich, Leeds, Leicester, Southampton, Sunderland \u2014 and its own widest-path entry records no hop count to that reference set at all. Only the Premier League, with 200 bridge fixtures, has a measured level. A field naming a favourite off one rated tier and three unrated ones would be an ordering of the Premier League with the other 72 clubs arranged behind it by nothing, so `stages.compare_cup` refuses the comparison instead. WHAT WOULD CHANGE THIS is a measurement, not an edit here: the cup's own cross-tier ties are exactly the bridges the Championship lacks, and 47 of the 76 fixtures played to 2026-09-15 pair two different tiers."
        }
      },
      "event_id": "401914260",
      "competition_id": "401914260",
      "kickoff": "2026-09-17T18:30Z",
      "espn": "eng.league_cup",
      "state": "pre",
      "in_play": false,
      "venue": {
        "name": "Etihad Stadium",
        "city": "Manchester",
        "country": "England"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": {
        "event_ticker": "KXEFLCUPGAME-26SEP17MCINOR",
        "ticker": "KXEFLCUPGAME-26SEP17MCINOR-MCI",
        "ask_c": 86,
        "bid_c": 85,
        "spread_c": 1,
        "ask_size": 200,
        "bid_size": 1176,
        "flags": [],
        "side": "Manchester City"
      },
      "form": {
        "home": "WWWW",
        "away": "WLWWL",
        "scope": "its own league",
        "scope_is_cup": false
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
  "folded": {},
  "capture": {
    "backend": "not_requested",
    "writable": false,
    "stored": 0,
    "corrected": 0,
    "already": 0,
    "refused": 0,
    "errors": 0,
    "bands": {},
    "reasons": []
  }
} as const;

/** The same payload with its kickoffs moved into the future, order and
 *  spacing intact. Nothing else is touched. */
export function rebased(now: Date = new Date()): Record<string, unknown> {
  const b = JSON.parse(JSON.stringify(RECORDED)) as Record<string, unknown>;
  const all = [...(b.rows as Record<string, unknown>[] ?? []),
               ...(b.refusals as Record<string, unknown>[] ?? [])];
  const times = all
    .map((r) => Date.parse(r.kickoff as string))
    .filter((t) => Number.isFinite(t));
  if (!times.length) return b;
  // the EARLIEST recorded kickoff becomes two hours from now, and every
  // other one keeps its exact distance from it
  const base = Math.min(...times);
  const shift = now.getTime() + 2 * 3600_000 - base;
  for (const r of all) {
    const t = Date.parse(r.kickoff as string);
    if (Number.isFinite(t)) r.kickoff = new Date(t + shift).toISOString();
  }
  b.generated_at = now.toISOString();
  return b;
}

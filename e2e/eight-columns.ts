/** EIGHT REAL COLUMNS, RECORDED OFF THE ROUTE.
 *
 *  Trimmed from a genuine assembly — `board.assemble_board(date=20260915,
 *  days=8, leagues=[the eight])` against live ESPN and Kalshi — to two
 *  ranked rows and one refusal per league. FIXTURES SPEAK THE PROVIDER'S
 *  LANGUAGE: every key, every slug and every absence here is what the
 *  backend actually emitted, not a shape written from a brief. Six bugs
 *  in one week came from fixtures that spoke the code's vocabulary
 *  instead of the feed's. */
import type { Page } from "@playwright/test";

export const BOARD_EIGHT = {
"generated_at": "2026-09-15T11:32:12.122555+00:00",
"date": "20260915",
"days": 8,
"leagues": {
"epl": {
"src": "prior",
"min_current_gp": 4,
"clubs": 17,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"laliga": {
"src": "prior",
"min_current_gp": 5,
"clubs": 17,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"mls": {
"src": "current",
"min_current_gp": 23,
"clubs": 30,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"ligamx": {
"src": "prior",
"min_current_gp": 7,
"clubs": 17,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"bundesliga": {
"src": "prior",
"min_current_gp": 3,
"clubs": 15,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"seriea": {
"src": "prior",
"min_current_gp": 4,
"clubs": 17,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"ligue1": {
"src": "prior",
"min_current_gp": 4,
"clubs": 16,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
},
"eredivisie": {
"src": "prior",
"min_current_gp": 5,
"clubs": 15,
"kind": "league",
"blend_k": 10.0,
"blend_constant_w": null
}
},
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
"rows": [
{
"refused": false,
"league": "bundesliga",
"column": "bundesliga",
"home": "Bayern Munich",
"away": "1. FC Union Berlin",
"favourite": "Bayern Munich",
"opponent": "1. FC Union Berlin",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 3.108597285067873,
"threshold": 0.44003294117647024,
"threshold_source": "derived",
"policy": "off",
"favourite": "Bayern Munich",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"Bayern Munich": "exact",
"1. FC Union Berlin": "exact"
},
"ppg_gap": 1.592760180995475,
"gdg_gap": 3.108597285067873,
"rank_gap": 12,
"gp_current": {
"home": 3,
"away": 3,
"min": 3
},
"weights": {
"home": 0.23076923076923078,
"away": 0.23076923076923078,
"min": 0.23076923076923078,
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
"opp": 13
},
"rates": {
"ppg": [
2.5520361990950224,
0.9592760180995474
],
"gf": [
3.2986425339366514,
1.3031674208144797
],
"ga": [
0.9683257918552036,
2.0814479638009047
],
"gdg": [
2.3303167420814477,
-0.778280542986425
]
},
"own_gdg": {
"diff": 3.108597285067873,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
"event_id": "401884790",
"competition_id": "401884790",
"kickoff": "2026-09-18T18:30Z",
"espn": "ger.1",
"venue": {
"name": "Allianz Arena",
"city": "M\u00fcnchen",
"country": "Germany"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXBUNDESLIGAGAME-26SEP18BMUUNI",
"ticker": "KXBUNDESLIGAGAME-26SEP18BMUUNI-BMU",
"ask_c": 92,
"bid_c": 91,
"spread_c": 1,
"ask_size": 4071,
"bid_size": 12647,
"flags": []
},
"form": {
"fav": "WDW",
"opp": "DLL",
"scope": "Bundesliga",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 2.0,
"gdg_gap": 3.666666666666667,
"rank_gap": 9
}
},
{
"refused": false,
"league": "laliga",
"column": "laliga",
"home": "Sevilla",
"away": "Barcelona",
"favourite": "Barcelona",
"opponent": "Sevilla",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 2.280701754385965,
"threshold": 0.360822329721362,
"threshold_source": "derived",
"policy": "off",
"favourite": "Barcelona",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Sevilla": "exact",
"Barcelona": "exact"
},
"ppg_gap": 1.2280701754385968,
"gdg_gap": 2.280701754385965,
"rank_gap": 5,
"gp_current": {
"home": 5,
"away": 5,
"min": 5
},
"weights": {
"home": 0.3333333333333333,
"away": 0.3333333333333333,
"min": 0.3333333333333333,
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
"opp": 6
},
"rates": {
"ppg": [
2.649122807017544,
1.4210526315789473
],
"gf": [
3.066666666666667,
1.3403508771929826
],
"ga": [
0.8982456140350878,
1.4526315789473685
],
"gdg": [
2.168421052631579,
-0.11228070175438587
]
},
"own_gdg": {
"diff": 2.280701754385965,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
1,
2
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
"ovr": 1,
"atk": 2,
"def": 2
},
"shape": "CLEAN",
"event_id": "401882859",
"competition_id": "401882859",
"kickoff": "2026-09-19T19:00Z",
"espn": "esp.1",
"venue": {
"name": "Ram\u00f3n S\u00e1nchez Pizju\u00e1n Stadium",
"city": "Sevilla",
"country": "Spain"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLALIGAGAME-26SEP19SEVBAR",
"ticker": "KXLALIGAGAME-26SEP19SEVBAR-BAR",
"ask_c": 81,
"bid_c": 80,
"spread_c": 1,
"ask_size": 8811,
"bid_size": 18326,
"flags": []
},
"form": {
"fav": "WWWWW",
"opp": "WWLDW",
"scope": "La Liga",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.0,
"gdg_gap": 3.0,
"rank_gap": 5
}
},
{
"refused": false,
"league": "laliga",
"column": "laliga",
"home": "Elche",
"away": "Real Madrid",
"favourite": "Real Madrid",
"opponent": "Elche",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 2.0105263157894733,
"threshold": 0.360822329721362,
"threshold_source": "derived",
"policy": "off",
"favourite": "Real Madrid",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Elche": "exact",
"Real Madrid": "exact"
},
"ppg_gap": 1.4210526315789473,
"gdg_gap": 2.0105263157894733,
"rank_gap": 15,
"gp_current": {
"home": 5,
"away": 5,
"min": 5
},
"weights": {
"home": 0.3333333333333333,
"away": 0.3333333333333333,
"min": 0.3333333333333333,
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
"fav": 2,
"opp": 17
},
"rates": {
"ppg": [
2.3087719298245615,
0.887719298245614
],
"gf": [
2.2842105263157895,
1.2596491228070177
],
"ga": [
0.880701754385965,
1.8666666666666667
],
"gdg": [
1.4035087719298245,
-0.607017543859649
]
},
"own_gdg": {
"diff": 2.0105263157894733,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
1,
5
],
"atk": [
1,
3
],
"def": [
1,
5
]
},
"tier_gaps": {
"ovr": 4,
"atk": 2,
"def": 4
},
"shape": "CLEAN",
"event_id": "401882872",
"competition_id": "401882872",
"kickoff": "2026-09-15T19:30Z",
"espn": "esp.1",
"venue": {
"name": "Estadio Mart\u00ednez Valero",
"city": "Elche",
"country": "Spain"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLALIGAGAME-26SEP15ELCRMA",
"ticker": "KXLALIGAGAME-26SEP15ELCRMA-RMA",
"ask_c": 83,
"bid_c": 82,
"spread_c": 1,
"ask_size": 900576,
"bid_size": 27774,
"flags": []
},
"form": {
"fav": "WWWLW",
"opp": "DLLLD",
"scope": "La Liga",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 2.0,
"gdg_gap": 3.4,
"rank_gap": 14
}
},
{
"refused": false,
"league": "ligamx",
"column": "ligamx",
"home": "Toluca",
"away": "Santos",
"favourite": "Toluca",
"opponent": "Santos",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.9183006535947713,
"threshold": 0.36835512426619493,
"threshold_source": "derived",
"policy": "off",
"favourite": "Toluca",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"Toluca": "exact",
"Santos": "exact"
},
"ppg_gap": 1.2745098039215685,
"gdg_gap": 1.9183006535947713,
"rank_gap": 15,
"gp_current": {
"home": 7,
"away": 8,
"min": 7
},
"weights": {
"home": 0.4117647058823529,
"away": 0.4444444444444444,
"min": 0.4117647058823529,
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
"fav": 1,
"opp": 16
},
"rates": {
"ppg": [
2.019607843137255,
0.7450980392156863
],
"gf": [
2.092436974789916,
1.0196078431372548
],
"ga": [
0.9551820728291316,
1.8006535947712417
],
"gdg": [
1.1372549019607845,
-0.7810457516339868
]
},
"own_gdg": {
"diff": 1.9183006535947713,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
1,
5
]
},
"tier_gaps": {
"ovr": 4,
"atk": 4,
"def": 4
},
"shape": "CLEAN",
"event_id": "401876966",
"competition_id": "401876966",
"kickoff": "2026-09-21T00:00Z",
"espn": "mex.1",
"venue": {
"name": "Estadio Nemesio D\u00edez Riega",
"city": "Toluca",
"country": "Mexico"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLIGAMXGAME-26SEP20TOLSLA",
"ticker": "KXLIGAMXGAME-26SEP20TOLSLA-TOL",
"ask_c": 80,
"bid_c": 77,
"spread_c": 3,
"ask_size": 1716,
"bid_size": 11,
"flags": []
},
"form": {
"fav": "DWWW",
"opp": "LLDLW",
"scope": "Liga MX",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.7857142857142856,
"gdg_gap": 2.446428571428571,
"rank_gap": 15
}
},
{
"refused": false,
"league": "ligamx",
"column": "ligamx",
"home": "Puebla",
"away": "Toluca",
"favourite": "Toluca",
"opponent": "Puebla",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.666666666666667,
"threshold": 0.36835512426619493,
"threshold_source": "derived",
"policy": "off",
"favourite": "Toluca",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Puebla": "exact",
"Toluca": "exact"
},
"ppg_gap": 0.8223760092272203,
"gdg_gap": 1.666666666666667,
"rank_gap": 12,
"gp_current": {
"home": 7,
"away": 7,
"min": 7
},
"weights": {
"home": 0.4117647058823529,
"away": 0.4117647058823529,
"min": 0.4117647058823529,
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
"fav": 1,
"opp": 13
},
"rates": {
"ppg": [
2.019607843137255,
1.1972318339100345
],
"gf": [
2.092436974789916,
1.1764705882352942
],
"ga": [
0.9551820728291316,
1.7058823529411766
],
"gdg": [
1.1372549019607845,
-0.5294117647058825
]
},
"own_gdg": {
"diff": 1.666666666666667,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
4
]
},
"tier_gaps": {
"ovr": 3,
"atk": 4,
"def": 3
},
"shape": "CLEAN",
"event_id": "401876991",
"competition_id": "401876991",
"kickoff": "2026-09-16T01:00Z",
"espn": "mex.1",
"venue": {
"name": "Estadio Cuauht\u00e9moc",
"city": "Puebla",
"country": "Mexico"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLIGAMXGAME-26SEP15PUETOL",
"ticker": "KXLIGAMXGAME-26SEP15PUETOL-TOL",
"ask_c": 64,
"bid_c": 63,
"spread_c": 1,
"ask_size": 18601,
"bid_size": 29609,
"flags": []
},
"form": {
"fav": "DWWW",
"opp": "WWLW",
"scope": "Liga MX",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.4285714285714284,
"gdg_gap": 1.4285714285714284,
"rank_gap": 6
}
},
{
"refused": false,
"league": "mls",
"column": "mls",
"home": "Sporting Kansas City",
"away": "Philadelphia Union",
"favourite": "Philadelphia Union",
"opponent": "Sporting Kansas City",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.5635288773697082,
"threshold": 0.4020822611729817,
"threshold_source": "derived",
"policy": "off",
"favourite": "Philadelphia Union",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Sporting Kansas City": "exact",
"Philadelphia Union": "exact"
},
"ppg_gap": 0.7117713858198288,
"gdg_gap": 1.5635288773697082,
"rank_gap": 18,
"gp_current": {
"home": 24,
"away": 25,
"min": 24
},
"weights": {
"home": 0.7058823529411765,
"away": 0.7142857142857143,
"min": 0.7058823529411765,
"k": 10.0,
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
"fav": 12,
"opp": 30
},
"rates": {
"ppg": [
1.4833976833976834,
0.7716262975778546
],
"gf": [
1.793050193050193,
1.162629757785467
],
"ga": [
1.4077220077220076,
2.34083044982699
],
"gdg": [
0.38532818532818536,
-1.178200692041523
]
},
"own_gdg": {
"diff": 1.5635288773697082,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
2,
5
]
},
"tier_gaps": {
"ovr": 3,
"atk": 4,
"def": 3
},
"shape": "CLEAN",
"event_id": "761823",
"competition_id": "761823",
"kickoff": "2026-09-20T00:30Z",
"espn": "usa.1",
"venue": {
"name": "Sporting Park",
"city": "Kansas City, Kansas",
"country": "USA"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXMLSGAME-26SEP19SKCPHI",
"ticker": "KXMLSGAME-26SEP19SKCPHI-PHI",
"ask_c": 59,
"bid_c": 58,
"spread_c": 1,
"ask_size": 8000,
"bid_size": 2241,
"flags": []
},
"form": {
"fav": "DWWWW",
"opp": "DLLLW",
"scope": "MLS",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.5700000000000001,
"gdg_gap": 1.6550000000000002,
"rank_gap": 15
}
},
{
"refused": false,
"league": "eredivisie",
"column": "eredivisie",
"home": "Feyenoord Rotterdam",
"away": "FC Utrecht",
"favourite": "Feyenoord Rotterdam",
"opponent": "FC Utrecht",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.5404411764705879,
"threshold": 0.44335174369747865,
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
"FC Utrecht": "exact"
},
"ppg_gap": 0.7573529411764706,
"gdg_gap": 1.5404411764705879,
"rank_gap": 8,
"gp_current": {
"home": 6,
"away": 6,
"min": 6
},
"weights": {
"home": 0.375,
"away": 0.375,
"min": 0.375,
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
"opp": 10
},
"rates": {
"ppg": [
2.0698529411764706,
1.3125
],
"gf": [
2.536764705882353,
1.7232142857142858
],
"ga": [
1.2463235294117647,
1.9732142857142856
],
"gdg": [
1.290441176470588,
-0.24999999999999978
]
},
"own_gdg": {
"diff": 1.5404411764705879,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
"event_id": "401875596",
"competition_id": "401875596",
"kickoff": "2026-09-20T10:15Z",
"espn": "ned.1",
"venue": {
"name": "De Kuip",
"city": "Rotterdam",
"country": "Netherlands"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXEREDIVISIEGAME-26SEP20FEYFCU",
"ticker": "KXEREDIVISIEGAME-26SEP20FEYFCU-FEY",
"ask_c": 76,
"bid_c": 74,
"spread_c": 2,
"ask_size": 201,
"bid_size": 76,
"flags": []
},
"form": {
"fav": "DWDWW",
"opp": "LDLDW",
"scope": "Eredivisie",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.5,
"gdg_gap": 3.5,
"rank_gap": 11
}
},
{
"refused": false,
"league": "epl",
"column": "epl",
"home": "Manchester City",
"away": "Sunderland",
"favourite": "Manchester City",
"opponent": "Sunderland",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.4736842105263157,
"threshold": 0.35443162317558574,
"threshold_source": "derived",
"policy": "off",
"favourite": "Manchester City",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"Manchester City": "exact",
"Sunderland": "exact"
},
"ppg_gap": 1.0225563909774436,
"gdg_gap": 1.4736842105263157,
"rank_gap": 8,
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
"gap_note": null,
"reg_time_note": null,
"table_notes": {
"home": null,
"away": null
},
"ranks": {
"fav": 2,
"opp": 10
},
"rates": {
"ppg": [
2.3233082706766917,
1.300751879699248
],
"gf": [
2.018796992481203,
1.0037593984962407
],
"ga": [
0.8007518796992481,
1.2593984962406015
],
"gdg": [
1.218045112781955,
-0.2556390977443608
]
},
"own_gdg": {
"diff": 1.4736842105263157,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
2
]
},
"tier_gaps": {
"ovr": 2,
"atk": 4,
"def": 1
},
"shape": "CLEAN",
"event_id": "401879272",
"competition_id": "401879272",
"kickoff": "2026-09-20T13:00Z",
"espn": "eng.1",
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
"event_ticker": "KXEPLGAME-26SEP20MCISUN",
"ticker": "KXEPLGAME-26SEP20MCISUN-MCI",
"ask_c": 77,
"bid_c": 76,
"spread_c": 1,
"ask_size": 21174,
"bid_size": 153,
"flags": []
},
"form": {
"fav": "WWWW",
"opp": "LWDL",
"scope": "EPL",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 2.0,
"gdg_gap": 2.0,
"rank_gap": 10
}
},
{
"refused": false,
"league": "ligue1",
"column": "ligue1",
"home": "Nice",
"away": "Lille",
"favourite": "Lille",
"opponent": "Nice",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.3548085901027076,
"threshold": 0.35526780939648567,
"threshold_source": "derived",
"policy": "off",
"favourite": "Lille",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Nice": "exact",
"Lille": "exact"
},
"ppg_gap": 1.138655462184874,
"gdg_gap": 1.3548085901027076,
"rank_gap": 15,
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
"fav": 1,
"opp": 16
},
"rates": {
"ppg": [
1.995798319327731,
0.8571428571428572
],
"gf": [
1.5924369747899159,
0.8849206349206349
],
"ga": [
0.9201680672268906,
1.5674603174603172
],
"gdg": [
0.6722689075630253,
-0.6825396825396823
]
},
"own_gdg": {
"diff": 1.3548085901027076,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
1,
5
],
"atk": [
2,
5
],
"def": [
1,
5
]
},
"tier_gaps": {
"ovr": 4,
"atk": 3,
"def": 4
},
"shape": "CLEAN",
"event_id": "401876452",
"competition_id": "401876452",
"kickoff": "2026-09-20T15:15Z",
"espn": "fra.1",
"venue": {
"name": "Allianz Riviera",
"city": "Nice",
"country": "France"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLIGUE1GAME-26SEP20NICLIL",
"ticker": "KXLIGUE1GAME-26SEP20NICLIL-LIL",
"ask_c": 47,
"bid_c": 46,
"spread_c": 1,
"ask_size": 1838,
"bid_size": 820,
"flags": []
},
"form": {
"fav": "WDWW",
"opp": "DLDL",
"scope": "Ligue 1",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 2.0,
"gdg_gap": 2.25,
"rank_gap": 15
}
},
{
"refused": false,
"league": "eredivisie",
"column": "eredivisie",
"home": "AZ Alkmaar",
"away": "Telstar",
"favourite": "AZ Alkmaar",
"opponent": "Telstar",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.3014705882352942,
"threshold": 0.44335174369747865,
"threshold_source": "derived",
"policy": "off",
"favourite": "AZ Alkmaar",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"AZ Alkmaar": "exact",
"Telstar": "exact"
},
"ppg_gap": 0.9632352941176471,
"gdg_gap": 1.3014705882352942,
"rank_gap": 11,
"gp_current": {
"home": 6,
"away": 6,
"min": 6
},
"weights": {
"home": 0.375,
"away": 0.375,
"min": 0.375,
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
"fav": 3,
"opp": 14
},
"rates": {
"ppg": [
1.9558823529411764,
0.9926470588235293
],
"gf": [
2.1286764705882355,
1.2132352941176472
],
"ga": [
1.3125,
1.6985294117647058
],
"gdg": [
0.8161764705882355,
-0.48529411764705865
]
},
"own_gdg": {
"diff": 1.3014705882352942,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
2,
3
]
},
"tier_gaps": {
"ovr": 4,
"atk": 4,
"def": 1
},
"shape": "CLEAN",
"event_id": "401875595",
"competition_id": "401875595",
"kickoff": "2026-09-20T12:30Z",
"espn": "ned.1",
"venue": {
"name": "AFAS Stadion",
"city": "Alkmaar",
"country": "Netherlands"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXEREDIVISIEGAME-26SEP20AZATEL",
"ticker": "KXEREDIVISIEGAME-26SEP20AZATEL-AZA",
"ask_c": 78,
"bid_c": 74,
"spread_c": 4,
"ask_size": 975,
"bid_size": 575,
"flags": [
"WIDE"
]
},
"form": {
"fav": "WWWWD",
"opp": "LLDLD",
"scope": "Eredivisie",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.833333333333333,
"gdg_gap": 2.8333333333333335,
"rank_gap": 11
}
},
{
"refused": false,
"league": "mls",
"column": "mls",
"home": "Real Salt Lake",
"away": "Vancouver Whitecaps",
"favourite": "Vancouver Whitecaps",
"opponent": "Real Salt Lake",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.2842059900883431,
"threshold": 0.4020822611729817,
"threshold_source": "derived",
"policy": "off",
"favourite": "Vancouver Whitecaps",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Real Salt Lake": "exact",
"Vancouver Whitecaps": "exact"
},
"ppg_gap": 0.6909071320836027,
"gdg_gap": 1.2842059900883431,
"rank_gap": 21,
"gp_current": {
"home": 24,
"away": 24,
"min": 24
},
"weights": {
"home": 0.7058823529411765,
"away": 0.7058823529411765,
"min": 0.7058823529411765,
"k": 10.0,
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
"fav": 2,
"opp": 23
},
"rates": {
"ppg": [
1.8883861236802413,
1.1974789915966386
],
"gf": [
2.131975867269985,
1.415966386554622
],
"ga": [
1.0158371040723981,
1.5840336134453783
],
"gdg": [
1.1161387631975868,
-0.16806722689075637
]
},
"own_gdg": {
"diff": 1.2842059900883431,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
1,
3
]
},
"tier_gaps": {
"ovr": 3,
"atk": 2,
"def": 2
},
"shape": "CLEAN",
"event_id": "761825",
"competition_id": "761825",
"kickoff": "2026-09-20T01:30Z",
"espn": "usa.1",
"venue": {
"name": "America First Field",
"city": "Sandy, Utah",
"country": "USA"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXMLSGAME-26SEP19RSLVAN",
"ticker": "KXMLSGAME-26SEP19RSLVAN-VAN",
"ask_c": 50,
"bid_c": 49,
"spread_c": 1,
"ask_size": 5790,
"bid_size": 3700,
"flags": []
},
"form": {
"fav": "WWLWL",
"opp": "LLDLL",
"scope": "MLS",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.7083333333333335,
"gdg_gap": 1.3333333333333333,
"rank_gap": 17
}
},
{
"refused": false,
"league": "seriea",
"column": "seriea",
"home": "AC Milan",
"away": "Lecce",
"favourite": "AC Milan",
"opponent": "Lecce",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.1090225563909777,
"threshold": 0.3289959752321979,
"threshold_source": "derived",
"policy": "off",
"favourite": "AC Milan",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"AC Milan": "exact",
"Lecce": "exact"
},
"ppg_gap": 0.7443609022556392,
"gdg_gap": 1.1090225563909777,
"rank_gap": 8,
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
"fav": 4,
"opp": 12
},
"rates": {
"ppg": [
1.887218045112782,
1.1428571428571428
],
"gf": [
1.4962406015037595,
0.8834586466165413
],
"ga": [
0.943609022556391,
1.4398496240601504
],
"gdg": [
0.5526315789473685,
-0.5563909774436091
]
},
"own_gdg": {
"diff": 1.1090225563909777,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
"event_id": "401874944",
"competition_id": "401874944",
"kickoff": "2026-09-20T18:45Z",
"espn": "ita.1",
"venue": {
"name": "San Siro",
"city": "Milano",
"country": "Italy"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXSERIEAGAME-26SEP20ACMLEC",
"ticker": "KXSERIEAGAME-26SEP20ACMLEC-ACM",
"ask_c": 77,
"bid_c": 75,
"spread_c": 2,
"ask_size": 3100,
"bid_size": 5154,
"flags": []
},
"form": {
"fav": "WWDD",
"opp": "WLLW",
"scope": "Serie A",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.5,
"gdg_gap": 1.25,
"rank_gap": 5
}
},
{
"refused": false,
"league": "seriea",
"column": "seriea",
"home": "Fiorentina",
"away": "Napoli",
"favourite": "Napoli",
"opponent": "Fiorentina",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.0827067669172936,
"threshold": 0.3289959752321979,
"threshold_source": "derived",
"policy": "off",
"favourite": "Napoli",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Fiorentina": "exact",
"Napoli": "exact"
},
"ppg_gap": 0.8533834586466165,
"gdg_gap": 1.0827067669172936,
"rank_gap": 10,
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
"fav": 5,
"opp": 15
},
"rates": {
"ppg": [
1.8571428571428572,
1.0037593984962407
],
"gf": [
1.518796992481203,
1.1278195488721803
],
"ga": [
1.0338345864661653,
1.7255639097744362
],
"gdg": [
0.4849624060150377,
-0.5977443609022559
]
},
"own_gdg": {
"diff": 1.0827067669172936,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
2,
5
],
"atk": [
2,
3
],
"def": [
2,
5
]
},
"tier_gaps": {
"ovr": 3,
"atk": 1,
"def": 3
},
"shape": "CLEAN",
"event_id": "401874934",
"competition_id": "401874934",
"kickoff": "2026-09-20T10:30Z",
"espn": "ita.1",
"venue": {
"name": "Stadio Artemio Franchi",
"city": "Firenze",
"country": "Italy"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXSERIEAGAME-26SEP20FIONAP",
"ticker": "KXSERIEAGAME-26SEP20FIONAP-NAP",
"ask_c": 43,
"bid_c": 42,
"spread_c": 1,
"ask_size": 1326,
"bid_size": 1945,
"flags": []
},
"form": {
"fav": "WLLW",
"opp": "LLLW",
"scope": "Serie A",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.75,
"gdg_gap": 1.75,
"rank_gap": 5
}
},
{
"refused": false,
"league": "bundesliga",
"column": "bundesliga",
"home": "Borussia M\u00f6nchengladbach",
"away": "Mainz",
"favourite": "Mainz",
"opponent": "Borussia M\u00f6nchengladbach",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 0.9683257918552037,
"threshold": 0.44003294117647024,
"threshold_source": "derived",
"policy": "off",
"favourite": "Mainz",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Borussia M\u00f6nchengladbach": "exact",
"Mainz": "exact"
},
"ppg_gap": 0.3529411764705884,
"gdg_gap": 0.9683257918552037,
"rank_gap": 4,
"gp_current": {
"home": 3,
"away": 3,
"min": 3
},
"weights": {
"home": 0.23076923076923078,
"away": 0.23076923076923078,
"min": 0.23076923076923078,
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
"fav": 10,
"opp": 14
},
"rates": {
"ppg": [
1.2126696832579187,
0.8597285067873303
],
"gf": [
1.4570135746606336,
1.1809954751131222
],
"ga": [
1.4298642533936652,
2.1221719457013575
],
"gdg": [
0.02714932126696845,
-0.9411764705882353
]
},
"own_gdg": {
"diff": 0.9683257918552037,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
3,
5
],
"atk": [
4,
5
],
"def": [
2,
5
]
},
"tier_gaps": {
"ovr": 2,
"atk": 1,
"def": 3
},
"shape": "CLEAN",
"event_id": "401884786",
"competition_id": "401884786",
"kickoff": "2026-09-19T13:30Z",
"espn": "ger.1",
"venue": {
"name": "BORUSSIA-PARK",
"city": "M\u00f6nchengladbach",
"country": "Germany"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": null,
"form": {
"fav": "DWL",
"opp": "LLL",
"scope": "Bundesliga",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.3333333333333333,
"gdg_gap": 4.0,
"rank_gap": 8
}
},
{
"refused": false,
"league": "epl",
"column": "epl",
"home": "Leeds United",
"away": "Crystal Palace",
"favourite": "Leeds United",
"opponent": "Crystal Palace",
"fav_side": "home",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 0.6992481203007519,
"threshold": 0.35443162317558574,
"threshold_source": "derived",
"policy": "off",
"favourite": "Leeds United",
"side": "home",
"agrees": true,
"reason": "favourite_already_at_home",
"flipped": false
},
"resolution": {
"Leeds United": "exact",
"Crystal Palace": "exact"
},
"ppg_gap": 0.3947368421052633,
"gdg_gap": 0.6992481203007519,
"rank_gap": 8,
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
"gap_note": null,
"reg_time_note": null,
"table_notes": {
"home": null,
"away": null
},
"ranks": {
"fav": 7,
"opp": 15
},
"rates": {
"ppg": [
1.454887218045113,
1.0601503759398496
],
"gf": [
1.4210526315789473,
1.199248120300752
],
"ga": [
1.2669172932330826,
1.744360902255639
],
"gdg": [
0.1541353383458648,
-0.5451127819548871
]
},
"own_gdg": {
"diff": 0.6992481203007519,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
2,
5
],
"atk": [
3,
4
],
"def": [
3,
5
]
},
"tier_gaps": {
"ovr": 3,
"atk": 1,
"def": 2
},
"shape": "CLEAN",
"event_id": "401879273",
"competition_id": "401879273",
"kickoff": "2026-09-20T13:00Z",
"espn": "eng.1",
"venue": {
"name": "Elland Road",
"city": "Leeds",
"country": "England"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXEPLGAME-26SEP20LEECRY",
"ticker": "KXEPLGAME-26SEP20LEECRY-LEE",
"ask_c": 55,
"bid_c": 53,
"spread_c": 2,
"ask_size": 8818,
"bid_size": 7816,
"flags": []
},
"form": {
"fav": "WDDW",
"opp": "LLWL",
"scope": "EPL",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 1.25,
"gdg_gap": 2.25,
"rank_gap": 11
}
},
{
"refused": false,
"league": "ligue1",
"column": "ligue1",
"home": "Marseille",
"away": "Paris Saint-Germain",
"favourite": "Paris Saint-Germain",
"opponent": "Marseille",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 0.5672268907563023,
"threshold": 0.35526780939648567,
"threshold_source": "derived",
"policy": "off",
"favourite": "Paris Saint-Germain",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Marseille": "exact",
"Paris Saint-Germain": "exact"
},
"ppg_gap": 0.5000000000000002,
"gdg_gap": 0.5672268907563023,
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
"fav": 2,
"opp": 9
},
"rates": {
"ppg": [
1.9537815126050422,
1.453781512605042
],
"gf": [
1.9831932773109242,
1.7521008403361347
],
"ga": [
1.03781512605042,
1.3739495798319328
],
"gdg": [
0.9453781512605042,
0.3781512605042019
]
},
"own_gdg": {
"diff": 0.5672268907563023,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
1,
3
],
"atk": [
1,
2
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
"event_id": "401876449",
"competition_id": "401876449",
"kickoff": "2026-09-20T18:45Z",
"espn": "fra.1",
"venue": {
"name": "Stade V\u00e9lodrome",
"city": "Marseille",
"country": "France"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": null,
"form": {
"fav": "DDLW",
"opp": "WLLL",
"scope": "Ligue 1",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.5,
"gdg_gap": 0.0,
"rank_gap": 4
}
},
/* ── A SECOND MATCHDAY THAT ONE LEAGUE OWNS (2026-09-15) ──────────
   The eight recorded columns all play the same five dates, and only
   one of those — the Wednesday La Liga owns — is a date a single
   league plays. The board draws four of eight columns, so a day
   nobody on screen plays is the one shape the date rail must never
   take, and with a single such day in the whole payload the guards
   for it rested on one row of one column: edit that row and the
   defect becomes invisible with nothing going red.

   This gives Serie A a Thursday of its own, so two different leagues
   each own a matchday. WHICH of them is on screen at a given window
   position is not a fact this file may assume — the operator's
   reading order decides it, and it changed under these guards once
   already (PICKER_COLUMN_ORDER, 2026-09-15) — so the guards in
   eight-column-board.spec.ts search the window for the position they
   need rather than naming one.

   IT IS A RECORDED ROW, NOT AN INVENTED ONE: the Serie A row above
   it verbatim, with the identity fields moved — event, kickoff,
   clubs, venue and Kalshi tickers. Every other key is still what the
   backend emitted, which is the rule this file opens with. */
{
"refused": false,
"league": "seriea",
"column": "seriea",
"home": "Torino",
"away": "Juventus",
"favourite": "Juventus",
"opponent": "Torino",
"fav_side": "away",
"fav_source": "rank",
"venue_favourite": {
"refused": false,
"venue_class": "DOMESTIC",
"home_side": "home",
"gdg_gap_abs": 1.0827067669172936,
"threshold": 0.3289959752321979,
"threshold_source": "derived",
"policy": "off",
"favourite": "Juventus",
"side": "away",
"agrees": true,
"reason": "table_gap_beats_venue",
"flipped": false
},
"resolution": {
"Torino": "exact",
"Juventus": "exact"
},
"ppg_gap": 0.8533834586466165,
"gdg_gap": 1.0827067669172936,
"rank_gap": 10,
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
"fav": 5,
"opp": 15
},
"rates": {
"ppg": [
1.8571428571428572,
1.0037593984962407
],
"gf": [
1.518796992481203,
1.1278195488721803
],
"ga": [
1.0338345864661653,
1.7255639097744362
],
"gdg": [
0.4849624060150377,
-0.5977443609022559
]
},
"own_gdg": {
"diff": 1.0827067669172936,
"basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
},
"tiers": {
"ovr": [
2,
5
],
"atk": [
2,
3
],
"def": [
2,
5
]
},
"tier_gaps": {
"ovr": 3,
"atk": 1,
"def": 3
},
"shape": "CLEAN",
"event_id": "401874955",
"competition_id": "401874955",
"kickoff": "2026-09-17T18:45Z",
"espn": "ita.1",
"venue": {
"name": "Stadio Olimpico Grande Torino",
"city": "Torino",
"country": "Italy"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXSERIEAGAME-26SEP17TORJUV",
"ticker": "KXSERIEAGAME-26SEP17TORJUV-JUV",
"ask_c": 43,
"bid_c": 42,
"spread_c": 1,
"ask_size": 1326,
"bid_size": 1945,
"flags": []
},
"form": {
"fav": "WLLW",
"opp": "LLLW",
"scope": "Serie A",
"scope_is_cup": false
},
"current_only": {
"ppg_gap": 0.75,
"gdg_gap": 1.75,
"rank_gap": 5
}
},
],
"refusals": [
{
"refused": true,
"club": "Ipswich Town",
"reason": "no_prior_row",
"home": "Everton",
"away": "Ipswich Town",
"league": "epl",
"column": "epl",
"this_season": {
"club": "Ipswich Town",
"table_club": "Ipswich Town",
"resolved_by": "exact",
"rated_in": "epl",
"gp": 4,
"ppg": 1.5,
"gf": 1.75,
"ga": 2.5,
"gdg": -0.75,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 4,
"games_until_rated": 6,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Ipswich Town has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 4; 6 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Everton",
"table_club": "Everton",
"resolved_by": "exact",
"rated": true,
"rated_in": "epl",
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
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401878778",
"competition_id": "401878778",
"kickoff": "2026-09-19T14:00Z",
"espn": "eng.1",
"venue": {
"name": "Hill Dickinson Stadium",
"city": "Liverpool",
"country": "England"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXEPLGAME-26SEP19EVEIPS",
"ticker": "KXEPLGAME-26SEP19EVEIPS-EVE",
"ask_c": 55,
"bid_c": 54,
"spread_c": 1,
"ask_size": 5420,
"bid_size": 6644,
"flags": [],
"side": "Everton"
},
"form": {
"home": "WDDD",
"away": "WLLW",
"scope": "EPL",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Deportivo",
"reason": "no_prior_row",
"home": "Deportivo",
"away": "Sevilla",
"league": "laliga",
"column": "laliga",
"this_season": {
"club": "Deportivo",
"table_club": "Deportivo",
"resolved_by": "exact",
"rated_in": "laliga",
"gp": 5,
"ppg": 1.8,
"gf": 1.8,
"ga": 1.2,
"gdg": 0.6,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 5,
"games_until_rated": 5,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Deportivo has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 5; 5 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Sevilla",
"table_club": "Sevilla",
"resolved_by": "exact",
"rated": true,
"rated_in": "laliga",
"ppg": 1.4210526315789473,
"gf": 1.3403508771929826,
"ga": 1.4526315789473685,
"gdg": -0.11228070175438587,
"gp_current": 5,
"rank": 6,
"of": 17,
"weight": 0.3333333333333333,
"basis": "blend"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401882873",
"competition_id": "401882873",
"kickoff": "2026-09-16T17:00Z",
"espn": "esp.1",
"venue": {
"name": "Riazor",
"city": "La Coru\u00f1a",
"country": "Spain"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLALIGAGAME-26SEP16DEPSEV",
"ticker": "KXLALIGAGAME-26SEP16DEPSEV-DEP",
"ask_c": 38,
"bid_c": 37,
"spread_c": 1,
"ask_size": 8922,
"bid_size": 15671,
"flags": [],
"side": "Deportivo"
},
"form": {
"home": "DDWWD",
"away": "WWLDW",
"scope": "La Liga",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Atlante",
"reason": "no_prior_row",
"home": "Puebla",
"away": "Atlante",
"league": "ligamx",
"column": "ligamx",
"this_season": {
"club": "Atlante",
"table_club": "Atlante",
"resolved_by": "exact",
"rated_in": "ligamx",
"gp": 8,
"ppg": 0.875,
"gf": 0.875,
"ga": 1.5,
"gdg": -0.625,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 8,
"games_until_rated": 2,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Atlante has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 8; 2 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Puebla",
"table_club": "Puebla",
"resolved_by": "exact",
"rated": true,
"rated_in": "ligamx",
"ppg": 1.1972318339100345,
"gf": 1.1764705882352942,
"ga": 1.7058823529411766,
"gdg": -0.5294117647058825,
"gp_current": 7,
"rank": 13,
"of": 17,
"weight": 0.4117647058823529,
"basis": "blend"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401876973",
"competition_id": "401876973",
"kickoff": "2026-09-19T01:00Z",
"espn": "mex.1",
"venue": {
"name": "Estadio Cuauht\u00e9moc",
"city": "Puebla",
"country": "Mexico"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLIGAMXGAME-26SEP18PUEALA",
"ticker": "KXLIGAMXGAME-26SEP18PUEALA-PUE",
"ask_c": 46,
"bid_c": 43,
"spread_c": 3,
"ask_size": 192,
"bid_size": 798,
"flags": [],
"side": "Puebla"
},
"form": {
"home": "WWLW",
"away": "DLDDL",
"scope": "Liga MX",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Schalke 04",
"reason": "no_prior_row",
"home": "Schalke 04",
"away": "SV Elversberg",
"league": "bundesliga",
"column": "bundesliga",
"this_season": {
"club": "Schalke 04",
"table_club": "Schalke 04",
"resolved_by": "exact",
"rated_in": "bundesliga",
"gp": 3,
"ppg": 1.3333333333333333,
"gf": 1.0,
"ga": 1.3333333333333333,
"gdg": -0.3333333333333333,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 3,
"games_until_rated": 7,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Schalke 04 has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 3; 7 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "SV Elversberg",
"rated": false,
"reason": "no_prior_row"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401884783",
"competition_id": "401884783",
"kickoff": "2026-09-20T15:30Z",
"espn": "ger.1",
"venue": {
"name": "Veltins Arena",
"city": "Gelsenkirchen",
"country": "Germany"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXBUNDESLIGAGAME-26SEP20SCHSVE",
"ticker": "KXBUNDESLIGAGAME-26SEP20SCHSVE-SCH",
"ask_c": 47,
"bid_c": 46,
"spread_c": 1,
"ask_size": 1886,
"bid_size": 2306,
"flags": [],
"side": "Schalke 04"
},
"form": {
"home": "LDW",
"away": "WWL",
"scope": "Bundesliga",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Monza",
"reason": "no_prior_row",
"home": "Monza",
"away": "Sassuolo",
"league": "seriea",
"column": "seriea",
"this_season": {
"club": "Monza",
"table_club": "Monza",
"resolved_by": "exact",
"rated_in": "seriea",
"gp": 4,
"ppg": 0.25,
"gf": 1.5,
"ga": 2.75,
"gdg": -1.25,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 4,
"games_until_rated": 6,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Monza has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 4; 6 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Sassuolo",
"table_club": "Sassuolo",
"resolved_by": "exact",
"rated": true,
"rated_in": "seriea",
"ppg": 1.4210526315789473,
"gf": 1.4360902255639099,
"ga": 1.4398496240601504,
"gdg": -0.003759398496240518,
"gp_current": 4,
"rank": 10,
"of": 17,
"weight": 0.2857142857142857,
"basis": "blend"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401874756",
"competition_id": "401874756",
"kickoff": "2026-09-18T18:45Z",
"espn": "ita.1",
"venue": {
"name": "U-Power Stadium",
"city": "Monza",
"country": "Italy"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXSERIEAGAME-26SEP18MONSAS",
"ticker": "KXSERIEAGAME-26SEP18MONSAS-MON",
"ask_c": 31,
"bid_c": 30,
"spread_c": 1,
"ask_size": 1542,
"bid_size": 715,
"flags": [],
"side": "Monza"
},
"form": {
"home": "LLDL",
"away": "LWDW",
"scope": "Serie A",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Troyes",
"reason": "no_prior_row",
"home": "Angers",
"away": "Troyes",
"league": "ligue1",
"column": "ligue1",
"this_season": {
"club": "Troyes",
"table_club": "Troyes",
"resolved_by": "exact",
"rated_in": "ligue1",
"gp": 4,
"ppg": 1.0,
"gf": 1.0,
"ga": 2.25,
"gdg": -1.25,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 4,
"games_until_rated": 6,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Troyes has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 4; 6 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Angers",
"table_club": "Angers",
"resolved_by": "exact",
"rated": true,
"rated_in": "ligue1",
"ppg": 1.042016806722689,
"gf": 0.8949579831932772,
"ga": 1.365546218487395,
"gdg": -0.47058823529411775,
"gp_current": 4,
"rank": 13,
"of": 16,
"weight": 0.2857142857142857,
"basis": "blend"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401876457",
"competition_id": "401876457",
"kickoff": "2026-09-19T18:45Z",
"espn": "fra.1",
"venue": {
"name": "Stade Raymond Kopa",
"city": "Angers",
"country": "France"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXLIGUE1GAME-26SEP19ANGEST",
"ticker": "KXLIGUE1GAME-26SEP19ANGEST-ANG",
"ask_c": 45,
"bid_c": 43,
"spread_c": 2,
"ask_size": 6596,
"bid_size": 177,
"flags": [],
"side": "Angers"
},
"form": {
"home": "LWLD",
"away": "DWLL",
"scope": "Ligue 1",
"scope_is_cup": false
}
},
{
"refused": true,
"club": "Willem II",
"reason": "no_prior_row",
"home": "Ajax Amsterdam",
"away": "Willem II",
"league": "eredivisie",
"column": "eredivisie",
"this_season": {
"club": "Willem II",
"table_club": "Willem II",
"resolved_by": "exact",
"rated_in": "eredivisie",
"gp": 5,
"ppg": 0.4,
"gf": 1.0,
"ga": 2.8,
"gdg": -1.8,
"rates_absent": null
},
"admission": {
"k": 10.0,
"gp": 5,
"games_until_rated": 5,
"gate": "a club with no prior-season row is rated only once this season's weight reaches the majority \u2014 w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
"basis_when_admitted": "current_only",
"says": "Willem II has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 5; 5 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
},
"opponent_row": {
"club": "Ajax Amsterdam",
"table_club": "Ajax Amsterdam",
"resolved_by": "exact",
"rated": true,
"rated_in": "eredivisie",
"ppg": 1.7904761904761908,
"gf": 2.1523809523809523,
"ga": 1.180952380952381,
"gdg": 0.9714285714285713,
"gp_current": 5,
"rank": 5,
"of": 15,
"weight": 0.3333333333333333,
"basis": "blend"
},
"refusal": {
"reason": "no_prior_row",
"case": "below_admission",
"why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
"carries": [
"this_season",
"admission",
"opponent_row"
],
"absent": {},
"withheld": "every figure that compares the two clubs \u2014 the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused: this club has no row in the ordering the other club's rank and tier are positions in, so a gap would be measured against a club that is not in the table."
},
"event_id": "401875602",
"competition_id": "401875602",
"kickoff": "2026-09-15T18:00Z",
"espn": "ned.1",
"venue": {
"name": "Johan Cruijff Arena",
"city": "Amsterdam",
"country": "Netherlands"
},
"venue_class": {
"class": "DOMESTIC",
"home_side": "home"
},
"kalshi": {
"event_ticker": "KXEREDIVISIEGAME-26SEP15AJAWIL",
"ticker": "KXEREDIVISIEGAME-26SEP15AJAWIL-AJA",
"ask_c": 87,
"bid_c": 86,
"spread_c": 1,
"ask_size": 201,
"bid_size": 22598,
"flags": [],
"side": "Ajax Amsterdam"
},
"form": {
"home": "WDWLW",
"away": "LLDLD",
"scope": "Eredivisie",
"scope_is_cup": false
}
}
]
} as const;

export const REVIEW_EIGHT = {
"generated_at": "2026-09-15T11:32:13.546849+00:00",
"date": "20260915",
"back": 8,
"window": {
"from": "20260907",
"to": "20260915"
},
"store": {
"backend": "null",
"writable": false,
"note": "no snapshot store is configured \u2014 set LIVE_DATABASE_URL (prod) or PICKER_SNAPSHOT_DIR (local); pre-kickoff reads are NOT being frozen"
},
"lead_band_ladder": [
{
"band": "near_kickoff",
"ceiling_seconds": 10800.0,
"means": "taken within 3h of kickoff \u2014 the table is final and the book is open. The tightest rung, and the one the scheduled capture sweep aims at"
},
{
"band": "matchday",
"ceiling_seconds": 172800.0,
"means": "taken within 2 days \u2014 inside the window /api/picker/board serves when nobody asks for another"
},
{
"band": "approach",
"ceiling_seconds": 1209600.0,
"means": "taken within 14 days \u2014 inside the widest window that route will serve at all"
},
{
"band": "far",
"ceiling_seconds": null,
"means": "taken more than 14 days out, which is wider than the board route will serve: this read could only have been frozen by a caller naming a future `date`. It is a table read about a fixture whose clubs will play several more times first, and it is NOT comparable evidence to a read taken near kickoff"
}
],
"leagues": {
"epl": {
"finished": 10,
"captured": 0,
"reconstructed": 0,
"unavailable": 10,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"laliga": {
"finished": 12,
"captured": 0,
"reconstructed": 0,
"unavailable": 12,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"mls": {
"finished": 29,
"captured": 0,
"reconstructed": 0,
"unavailable": 29,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"ligamx": {
"finished": 10,
"captured": 0,
"reconstructed": 0,
"unavailable": 10,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"bundesliga": {
"finished": 9,
"captured": 0,
"reconstructed": 0,
"unavailable": 9,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"seriea": {
"finished": 12,
"captured": 0,
"reconstructed": 0,
"unavailable": 12,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"ligue1": {
"finished": 9,
"captured": 0,
"reconstructed": 0,
"unavailable": 9,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
},
"eredivisie": {
"finished": 12,
"captured": 0,
"reconstructed": 0,
"unavailable": 12,
"error": null,
"captured_by_lead_band": {},
"corrected": 0,
"kind": "league"
}
},
"finished": [
{
"league": "ligamx",
"espn": "mex.1",
"kind": "league",
"event_id": "401876977",
"competition_id": "401876977",
"kickoff": "2026-09-15T01:00Z",
"home": "Le\u00f3n",
"away": "Atl\u00e9tico de San Luis",
"status_detail": "FT",
"result": {
"home": 2,
"away": 0,
"winner": "home",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-liga-mx-2026.json",
"last_fixture": "2026-08-30T03:10:00+00:00"
},
{
"path": "research_archive/inplay_states/states-liga-mx-2025.json",
"last_fixture": "2026-05-25T01:00:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "epl",
"espn": "eng.1",
"kind": "league",
"event_id": "401879280",
"competition_id": "401879280",
"kickoff": "2026-09-14T19:00Z",
"home": "Leeds United",
"away": "Newcastle United",
"status_detail": "FT",
"result": {
"home": 4,
"away": 1,
"winner": "home",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-epl-2026.json",
"last_fixture": "2026-08-30T15:30:00+00:00"
},
{
"path": "research_archive/inplay_states/states-epl-2025.json",
"last_fixture": "2026-05-24T15:00:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "laliga",
"espn": "esp.1",
"kind": "league",
"event_id": "401882877",
"competition_id": "401882877",
"kickoff": "2026-09-14T19:00Z",
"home": "Villarreal",
"away": "Real Betis",
"status_detail": "FT",
"result": {
"home": 1,
"away": 2,
"winner": "away",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-la-liga-2026.json",
"last_fixture": "2026-08-30T15:00:00+00:00"
},
{
"path": "research_archive/inplay_states/states-la-liga-2025.json",
"last_fixture": "2026-05-24T19:00:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "seriea",
"espn": "ita.1",
"kind": "league",
"event_id": "401874966",
"competition_id": "401874966",
"kickoff": "2026-09-14T18:45Z",
"home": "Internazionale",
"away": "Udinese",
"status_detail": "FT",
"result": {
"home": 5,
"away": 3,
"winner": "home",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/inplay_states/states-serie-a-2025.json",
"last_fixture": "2026-05-24T18:45:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "mls",
"espn": "usa.1",
"kind": "league",
"event_id": "761814",
"competition_id": "761814",
"kickoff": "2026-09-14T01:00Z",
"home": "San Diego FC",
"away": "Philadelphia Union",
"status_detail": "FT",
"result": {
"home": 0,
"away": 5,
"winner": "away",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-mls-2026.json",
"last_fixture": "2026-08-30T02:30:00+00:00"
},
{
"path": "research_archive/inplay_states/states-mls-2026.json",
"last_fixture": "2026-08-08T20:30:00+00:00"
},
{
"path": "research_archive/inplay_states/states-mls-2025.json",
"last_fixture": "2025-12-06T19:30:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "ligue1",
"espn": "fra.1",
"kind": "league",
"event_id": "401876465",
"competition_id": "401876465",
"kickoff": "2026-09-13T18:45Z",
"home": "Brest",
"away": "Paris Saint-Germain",
"status_detail": "FT",
"result": {
"home": 0,
"away": 1,
"winner": "away",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/inplay_states/states-ligue-1-2025.json",
"last_fixture": "2026-05-29T18:45:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "eredivisie",
"espn": "ned.1",
"kind": "league",
"event_id": "401875605",
"competition_id": "401875605",
"kickoff": "2026-09-13T18:00Z",
"home": "PSV Eindhoven",
"away": "Sparta Rotterdam",
"status_detail": "FT",
"result": {
"home": 4,
"away": 1,
"winner": "home",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/inplay_states/states-eredivisie-2025.json",
"last_fixture": "2026-05-21T19:00:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
},
{
"league": "bundesliga",
"espn": "ger.1",
"kind": "league",
"event_id": "401884791",
"competition_id": "401884791",
"kickoff": "2026-09-13T15:30Z",
"home": "SV Elversberg",
"away": "Bayern Munich",
"status_detail": "FT",
"result": {
"home": 1,
"away": 2,
"winner": "away",
"source": "espn_scoreboard"
},
"pre_kickoff": {
"origin": "reconstructed",
"origin_label": "NOT AVAILABLE",
"origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
"store_read": "ok",
"store_read_error": null,
"captured_at": null,
"captured_seconds_before_kickoff": null,
"captured_lead_band": null,
"captured_lead_band_means": null,
"superseded": [],
"corrections": 0,
"board_date": null,
"reconstructed_from": {
"season_file": null,
"considered": [
{
"path": "research_archive/inplay_states/states-bundesliga-2025.json",
"last_fixture": "2026-05-21T18:30:00+00:00"
}
]
},
"unavailable_reason": "fixture_not_in_archive",
"state": null
},
"shot_state": {
"at_20": null,
"before_first_goal": null,
"full_time": null,
"first_goal_minute": null,
"error": "shot state not requested"
},
"fit": {
"favourite_won": null,
"favourite_won_reason": "no_pre_kickoff_favourite",
"confirmed_at_20": null,
"confirm_reason": "no_pre_kickoff_favourite",
"confirm_rule": "tilt_fav_and_on_target_lead",
"confirm_note": "EXPLORATORY \u2014 NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row \u2014 it forecasts nothing.",
"checkpoint_minute": 20
}
}
],
"refusals": []
} as const;

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

/** THE BOARD ROUTES ON THEIR OWN, WITHOUT GOING THERE.
 *
 *  Split out of `serveEight` for the specs that reach the board while
 *  they are on their way somewhere else — a `?league=` deep link, a
 *  layout sweep over every route, a back-link click — and so want the
 *  read answered without a navigation of their own being dictated to
 *  them.
 *
 *  WHY THEY WANT IT ANSWERED RATHER THAN LEFT ALONE: an unmocked board
 *  read is a board ASSEMBLY on the backend, and an assembly calls
 *  `snapshots.capture_rows`, which freezes a permanent first-write-wins
 *  pre-kickoff row for every fixture on it. There is no delete path on
 *  that table. See e2e/board-holdout.mjs.
 *
 *  Registered in a `beforeEach` this is a FLOOR, not a ceiling: a test
 *  that wants its own board registers it later and Playwright prefers
 *  the later handler, so nothing here overrides a spec's own fixture. */
export async function routeEight(page: Page, board: unknown = BOARD_EIGHT) {
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(board)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW_EIGHT)));
}

/** Serve the eight-column board, and a review so the finished tail is a
 *  read that HAPPENED rather than one the page is still waiting on. */
export async function serveEight(page: Page, board: unknown = BOARD_EIGHT) {
  await routeEight(page, board);
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}
